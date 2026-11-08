// Renderização da cena de batalha em Canvas 2D, resolução lógica fixa 320x180,
// ampliada por fator INTEIRO via CSS (image-rendering: pixelated) => pixel art sem blur.
// O renderer só LÊ o estado da simulação e consome eventos para efeitos visuais.

import { animDurationMs, animFrameMs, animFrames, hasAnim, oneShotFrame } from "./anim";
import { drawPixelText, pixelTextWidth } from "./pixelfont";
import type { Combatant, ContentBundle, GameEvent, GameState, ThemeDef } from "../sim/types";

export const VIEW_W = 320;
export const VIEW_H = 180;

// Slots = [centro x, base (pés) y]. Formação em triângulo: o líder (índice 0) à frente, 2 atrás em colunas
// separadas, para sprites de até SPRITE_MAX px + barra de HP + nível não se sobreporem (ver tests/render_layout).
export const SPRITE_MAX = 48;
export const ALLY_SLOTS = [
  [100, 118],
  [44, 84],
  [44, 150],
];
export const ENEMY_SLOTS = ALLY_SLOTS.map(([x, y]) => [VIEW_W - x, y]);
export const BOSS_SLOT = [262, 140];
export const ESCORT_SLOTS = [
  [196, 84],
  [196, 150],
];
/** Lado do placeholder (bloco colorido) sem sprite. */
export const PLACEHOLDER_SIZE = 20;
export const BOSS_PLACEHOLDER_SIZE = 40;
/** Barra de HP + nível desenhados abaixo dos pés: ocupam BAR_BELOW px. */
export const BAR_GAP = 5;
export const BAR_BELOW = BAR_GAP + 3 + 2 + 5;
/** Efeitos curtos em ms de tempo real (antes eram contados em quadros de 60 Hz). */
const FLASH_MS = 67;
const LUNGE_MS = 100;
const FLOATER_MS = 400;

/** Frame idle no instante `nowMs` (tempo real do rAF): independe de quantas vezes draw() roda por segundo. */
export function idleFrameIndex(nowMs: number, frameMs: number, frames: number, uid: string): number {
  // Desfase por unidade para o time não respirar em uníssono.
  const phase = [...uid].reduce((h, ch) => h + ch.charCodeAt(0), 0) * 117;
  return Math.floor((nowMs + phase) / frameMs) % frames;
}

/** Caixa [x, y, w, h] de uma unidade de w×h px ancorada pela base no slot. */
export function unitBox(slot: number[], w: number, h: number): number[] {
  return [Math.round(slot[0] - w / 2), slot[1] - h, w, h];
}

/** Largura da barra de HP para uma unidade de largura w. */
export function barWidth(w: number): number {
  return Math.min(w, 32) + 4;
}

interface Fx {
  /** ms restantes */
  flash: number;
  lunge: number;
  /** ms decorridos nas animações de uma passada; -1 = parada. */
  attack: number;
  hit: number;
}
interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  /** ms restantes */
  life: number;
}

export class BattleRenderer {
  private ctx: CanvasRenderingContext2D;
  private fx = new Map<string, Fx>();
  private floaters: Floater[] = [];
  /** Último timestamp recebido em draw() (ms, relógio do rAF). */
  private now = 0;
  private scale = 1;
  private lastPos = new Map<string, [number, number]>();
  private theme: ThemeDef;
  private images = new Map<string, HTMLImageElement>();

  constructor(
    private canvas: HTMLCanvasElement,
    private content: ContentBundle,
  ) {
    this.theme = content.theme;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D indisponível");
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
  }

  /** Ajusta a escala inteira para caber no espaço disponível. */
  fit(maxW: number, maxH: number): number {
    this.scale = Math.max(1, Math.floor(Math.min(maxW / VIEW_W, maxH / VIEW_H)));
    this.canvas.style.width = `${VIEW_W * this.scale}px`;
    this.canvas.style.height = `${VIEW_H * this.scale}px`;
    return this.scale;
  }

  onEvents(events: GameEvent[]): void {
    for (const e of events) {
      if (e.t === "act" || e.t === "sync") {
        if (e.t === "act") {
          const fx = this.fxOf(e.actor);
          fx.lunge = LUNGE_MS;
          fx.attack = 0;
        }
        for (const h of e.hits) {
          const [px, y] = this.lastPos.get(h.uid) ?? [VIEW_W / 2, VIEW_H / 2];
          // Espalha números simultâneos no mesmo alvo para não se sobreporem.
          const x = px + ((this.floaters.filter((f) => f.life > FLOATER_MS * (2 / 3)).length % 3) - 1) * 10;
          if (h.kind === "damage") {
            const fx = this.fxOf(h.uid);
            fx.flash = FLASH_MS;
            fx.hit = 0;
            this.floaters.push({ x, y: y - 18, text: `-${h.amount}`, color: e.t === "sync" ? "#ffe066" : "#ffffff", life: FLOATER_MS });
          } else if (h.kind === "heal") {
            this.floaters.push({ x, y: y - 18, text: `+${h.amount}`, color: "#8dff9a", life: FLOATER_MS });
          }
        }
      } else if (e.t === "battle_start") {
        this.fx.clear();
        this.lastPos.clear();
      }
    }
  }

  /** `now` = timestamp do requestAnimationFrame (ms). Toda animação deriva dele, não da contagem de draw(). */
  draw(state: GameState, now: number = this.now + 1000 / 60): void {
    const ctx = this.ctx;
    const p = this.theme.palette;
    const dt = Math.max(0, Math.min(250, now - this.now));
    this.now = now;

    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = p.grid;
    const off = Math.floor(now / 66.7) % 16;
    for (let x = -off; x < VIEW_W; x += 16) ctx.fillRect(x, 0, 1, VIEW_H);
    for (let y = 0; y < VIEW_H; y += 16) ctx.fillRect(0, y, VIEW_W, 1);
    ctx.fillStyle = p.ground;
    ctx.fillRect(0, 148, VIEW_W, 32);

    const b = state.battle;
    if (b) {
      const units: [Combatant, number[], 1 | -1][] = b.allies.map((c, i) => [c, ALLY_SLOTS[i] ?? ALLY_SLOTS[0], 1]);
      const hasBoss = b.enemies.some((e) => e.isBoss);
      let escort = 0;
      b.enemies.forEach((c, i) => {
        const slot = c.isBoss ? BOSS_SLOT : hasBoss ? ESCORT_SLOTS[escort++ % 2] : ENEMY_SLOTS[i] ?? ENEMY_SLOTS[0];
        units.push([c, slot, -1]);
      });
      // Corpos primeiro, barras depois: sprites maiores que o slot não cobrem a barra de HP do vizinho.
      const boxes = units.map(([c, slot, facing]) => this.drawUnit(c, slot, facing));
      units.forEach(([c], i) => this.drawBars(c, boxes[i]));
    } else {
      drawPixelText(ctx, "+ + +", VIEW_W / 2 - 9, VIEW_H / 2, p.accent);
    }

    for (const f of this.floaters) {
      const rise = Math.round((FLOATER_MS - f.life) * 0.03);
      drawPixelText(ctx, f.text, f.x - pixelTextWidth(f.text) / 2, f.y - rise, f.color);
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    for (const fx of this.fx.values()) {
      fx.flash = Math.max(0, fx.flash - dt);
      fx.lunge = Math.max(0, fx.lunge - dt);
      if (fx.attack >= 0) fx.attack += dt;
      if (fx.hit >= 0) fx.hit += dt;
    }
  }

  private fxOf(uid: string): Fx {
    let f = this.fx.get(uid);
    if (!f) this.fx.set(uid, (f = { flash: 0, lunge: 0, attack: -1, hit: -1 }));
    return f;
  }

  /**
   * Frame atual do sprite do content pack, se existir e já tiver carregado: hit ao tomar dano, attack ao agir
   * (uma passada cada, só se o pacote declarar), senão idle em loop (`anims.idle` ou `sprite`).
   */
  private spriteFor(c: Combatant): HTMLImageElement | null {
    if (typeof Image === "undefined") return null;
    const idle = animFrames(c, "idle");
    if (!idle.length) return null;
    // Todos os frames começam a carregar juntos para a animação não piscar na troca.
    for (const name of ["idle", "attack", "hit"] as const) animFrames(c, name).forEach((f) => this.image(f));
    const fx = this.fxOf(c.uid);
    let path: string | undefined;
    if (fx.hit >= 0 && fx.hit < animDurationMs(c, "hit") && hasAnim(c, "hit")) path = oneShotFrame(c, "hit", fx.hit);
    else if (fx.attack >= 0 && fx.attack < animDurationMs(c, "attack") && hasAnim(c, "attack")) path = oneShotFrame(c, "attack", fx.attack);
    else path = idle[idleFrameIndex(this.now, animFrameMs(c, "idle"), idle.length, c.uid)];
    const img = path ? this.image(path) : null;
    return img && img.complete && img.naturalWidth > 0 ? img : null;
  }

  private image(path: string): HTMLImageElement | null {
    const url = this.content.assets[path];
    if (!url) return null;
    let img = this.images.get(url);
    if (!img) {
      img = new Image();
      img.src = url;
      this.images.set(url, img);
    }
    return img;
  }

  /** Sprite do pacote quando houver; senão placeholder (bloco com contorno e "olhos"). Devolve a caixa [x, y, w, h], base nos pés do slot. */
  private drawUnit(c: Combatant, slot: number[], facing: 1 | -1): number[] {
    const ctx = this.ctx;
    const fx = this.fxOf(c.uid);
    const img = c.hp > 0 ? this.spriteFor(c) : null;
    const size = c.isBoss ? BOSS_PLACEHOLDER_SIZE : PLACEHOLDER_SIZE;
    const [w, h] = img ? [img.naturalWidth, img.naturalHeight] : [size, size];
    // Sprite com frames idle já traz o próprio movimento; o bob procedural fica para estáticos e placeholders.
    const animated = animFrames(c, "idle").length > 1;
    const bob = c.hp > 0 && !animated ? Math.round(Math.sin((this.now / (1000 / 60) + slot[1]) / 10)) : 0;
    // Avanço curto em direção ao alvo: triângulo de 0 a 6 px e volta, em LUNGE_MS.
    const k = fx.lunge / LUNGE_MS;
    const lunge = fx.lunge > 0 ? facing * Math.round((1 - Math.abs(2 * k - 1)) * 6) : 0;
    const box = unitBox(slot, w, h);
    const x = box[0] + lunge;
    const y = box[1] + bob;

    // sombra
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    const sw = Math.round(w * 0.6);
    ctx.fillRect(Math.round(slot[0] - sw / 2), slot[1] - 1, sw, 2);
    if (c.hp <= 0) {
      ctx.fillStyle = "#3a3f55";
      ctx.fillRect(box[0], slot[1] - size / 2, size, size / 2);
      return unitBox(slot, size, size);
    }
    if (img) {
      ctx.save();
      if (facing === -1) {
        ctx.translate(x * 2 + w, 0);
        ctx.scale(-1, 1);
      }
      ctx.globalAlpha = fx.flash > 0 ? 0.5 : 1;
      ctx.drawImage(img, x, y);
      ctx.restore();
      // Números de dano saem do alto do sprite, não do meio do corpo.
      this.lastPos.set(c.uid, [slot[0] + lunge, y + 12]);
    } else {
      this.lastPos.set(c.uid, [slot[0] + lunge, y]);
      ctx.fillStyle = "#05070d";
      ctx.fillRect(x - 1, y - 1, size + 2, size + 2);
      ctx.fillStyle = fx.flash > 0 ? "#ffffff" : c.color;
      ctx.fillRect(x, y, size, size);
      // olhos olhando para o adversário
      ctx.fillStyle = "#05070d";
      const eyeY = y + Math.floor(size / 3);
      const ex = facing === 1 ? x + size - 7 : x + 3;
      const eye = c.isBoss ? 3 : 2;
      ctx.fillRect(ex, eyeY, eye, eye);
      ctx.fillRect(ex + facing * -(c.isBoss ? 8 : 5), eyeY, eye, eye);
    }
    return box;
  }

  /** Guarda, barra de HP e nível, abaixo dos pés e por cima de todos os corpos. */
  private drawBars(c: Combatant, [x, y, w, h]: number[]): void {
    if (c.hp <= 0) return;
    const ctx = this.ctx;
    if (c.guardTicks > 0) {
      ctx.fillStyle = "#5ad1ff";
      ctx.fillRect(x - 3, y - 3, w + 6, 1);
      ctx.fillRect(x - 3, y + h + 2, w + 6, 1);
    }
    // barra de HP centrada sob a unidade
    const bw = barWidth(w);
    const bx = Math.round(x + w / 2 - bw / 2);
    const by = y + h + BAR_GAP;
    ctx.fillStyle = "#05070d";
    ctx.fillRect(bx, by, bw, 3);
    const pct = c.hp / c.maxHp;
    ctx.fillStyle = pct > 0.5 ? "#6bff8a" : pct > 0.25 ? "#ffd166" : "#ff5c7a";
    ctx.fillRect(bx + 1, by + 1, Math.max(1, Math.round((bw - 2) * pct)), 1);
    drawPixelText(ctx, String(c.level), bx, by + 5, "#9fb3d9");
  }
}
