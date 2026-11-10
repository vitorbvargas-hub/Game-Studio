// GS-012 passo 8 (mínimo para os passos 5–7, atrás de ?encounters=1): apresentação do encontro aleatório no
// próprio mapa (ENCOUNTER_ARCHITECTURE.md §4, recomendação A). Só consome eventos da sim (wild_appear,
// grass_rustle, wild_leave): não decide nada. A sim já criou o selvagem no tick do sorteio; aqui ele fica
// escondido na grama e salta em arco. Fase 3, rodada 2 (QA P1 "legibilidade do salto"): 1,2 s → 2,0 s
// (INTRO_TICKS = 20), cada fase com tempo próprio para ser lida sem pausar:
//
//   0–600 ms      a touceira do tile treme forte (±2 px) e solta folhas sem parar; vinheta entra; câmera começa a puxar
//   600–1000 ms   a grama para; balão "!" estoura sobre o Tamer (pulo de 3 px na entrada) e fica — a pausa
//   1000–1500 ms  o selvagem salta num arco de 26 px em 10 quadros inteiros; a sombra no chão começa pequena no alto
//                 e cresce até o tamanho normal no pouso (sem squash: o sprite não é deformado)
//   1500–1850 ms  pouso: anel de poeira + folhas espalhando; placa "NOME NV.N" com a borda da raridade, selo NOVO
//   2000 ms       a sim põe a parceira em ENGAGE; placa fica até 2300 e some até 2600; vinheta e câmera voltam
//
// O zoom 1,0→1,06 da proposta virou um puxão de câmera de até ~1/3 do caminho até o selvagem: zoom fracionário
// reamostra a arte e quebraria a grade de pixels inteiros do ?dpr=1. Som: não há sistema de áudio no protótipo.

import { PX_PER_SUB } from "../sim/params";
import type { Vec, WorldEvent } from "../sim/types";
import { drawOutlinedText, pixelTextWidth } from "./pixelfont";

export const RARITY_COLORS: Record<string, string> = {
  common: "#cfd3dc",
  uncommon: "#6fdc7a",
  rare: "#5aa8ff",
  very_rare: "#ffd34a",
};

/** Fim do tremor da grama; começo da pausa do "!". */
export const T_ALERT = 600;
export const T_JUMP = 1000;
export const T_LAND = 1500;
const T_DUST = 350;
/** A sim entra no combate aqui (INTRO_TICKS × TICK_MS); vinheta e câmera voltam depois. */
export const T_FIGHT = 2000;
export const T_PLATE = 2300;
export const T_END = 2600;
const RUSTLE_MS = 420;
/** Arco do salto (px, para cima negativo): 10 quadros inteiros em 500 ms, sobe rápido e cai acelerando. */
const ARC = [-9, -16, -21, -25, -26, -25, -21, -15, -8, -2];
const ARC_TOP = 26;

interface Appear {
  kind: "appear";
  id: string;
  tamerId: string;
  /** Pé do selvagem em px de mundo. */
  at: Vec;
  start: number;
  rarity: string;
  name: string;
  level: number;
  isNew: boolean;
}

interface Rustle {
  kind: "rustle";
  at: Vec;
  start: number;
  big: boolean;
}

type Fx = Appear | Rustle;

export interface EncounterFxOpts {
  localPlayerId: string;
  /** Nome para a placa (espécie). */
  nameOf: (speciesId: string) => string;
  /** Primeira vez que a espécie aparece (selo NOVO do Digidex). */
  isNew: (speciesId: string) => boolean;
  /**
   * P8 (?hud=v2): a placa sai do canvas do mundo e vai para a camada de nomes (render/targetplate.ts, px de tela),
   * e o balão "!" ganha a pílula de fundo escura (§8.1, regra 0.5 da spec).
   */
  v2?: boolean;
}

const ease = (t: number) => 1 - (1 - t) * (1 - t);

export class EncounterFx {
  private fx: Fx[] = [];
  constructor(private opts: EncounterFxOpts) {}

  onEvents(evs: WorldEvent[], now: number): void {
    for (const ev of evs) {
      if (ev.t === "wild_appear" && ev.random && ev.playerId === this.opts.localPlayerId) {
        const at = { x: ev.at.x * PX_PER_SUB, y: ev.at.y * PX_PER_SUB };
        this.fx.push({ kind: "appear", id: ev.id, tamerId: ev.playerId!, at, start: now, rarity: ev.rarity, name: this.opts.nameOf(ev.speciesId), level: ev.level, isNew: this.opts.isNew(ev.speciesId) });
        this.fx.push({ kind: "rustle", at, start: now, big: true });
      } else if (ev.t === "grass_rustle" && ev.playerId === this.opts.localPlayerId) {
        this.fx.push({ kind: "rustle", at: { x: ev.at.x * PX_PER_SUB, y: ev.at.y * PX_PER_SUB }, start: now, big: false });
      } else if (ev.t === "wild_leave") {
        this.fx.push({ kind: "rustle", at: { x: ev.at.x * PX_PER_SUB, y: ev.at.y * PX_PER_SUB }, start: now, big: false });
      }
    }
    this.fx = this.fx.filter((f) => now - f.start < T_END + 200);
  }

  /** Fase do encontro mais recente (capturas e testes): grama | alerta | salto | pouso | placa | fim. */
  phase(now: number): string | undefined {
    const f = [...this.fx].reverse().find((x): x is Appear => x.kind === "appear");
    if (!f) return undefined;
    const t = now - f.start;
    return t < T_ALERT ? "grama" : t < T_JUMP ? "alerta" : t < T_LAND ? "salto" : t < T_LAND + T_DUST ? "pouso" : t < T_END ? "placa" : "fim";
  }

  /** Encontro mais recente com o tempo desde o sorteio (placa v2: render/targetplate.ts platesFor). */
  intro(now: number): { id: string; name: string; level: number; rarity: string; isNew: boolean; t: number } | undefined {
    const f = [...this.fx].reverse().find((x): x is Appear => x.kind === "appear");
    return f && { id: f.id, name: f.name, level: f.level, rarity: f.rarity, isNew: f.isNew, t: now - f.start };
  }

  /** Algum efeito ativo (as capturas esperam por isso). */
  active(now: number): boolean {
    return this.fx.some((f) => now - f.start < (f.kind === "appear" ? T_END : f.big ? T_ALERT : RUSTLE_MS));
  }

  /**
   * O selvagem em salto: escondido na grama antes do salto; depois, deslocamento vertical (px) do arco e escala da
   * sombra no chão (0,4 no alto do arco → 1 no pouso: a sombra "cresce" enquanto ele cai).
   */
  entityOffset(id: string, now: number): { hidden: boolean; dy: number; shadow: number } | undefined {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && x.id === id);
    if (!f) return undefined;
    const t = now - f.start;
    if (t < 0 || t >= T_LAND + 80) return undefined;
    if (t < T_JUMP) return { hidden: true, dy: 0, shadow: 0 };
    if (t >= T_LAND) return { hidden: false, dy: 0, shadow: 1 };
    const q = Math.min(ARC.length - 1, Math.floor(((t - T_JUMP) / (T_LAND - T_JUMP)) * ARC.length));
    const dy = ARC[q];
    return { hidden: false, dy, shadow: 0.4 + 0.6 * (1 - -dy / ARC_TOP) };
  }

  /** O rótulo comum de nome fica escondido enquanto a placa de raridade estiver na tela (sem nome duplicado). */
  hidesLabel(id: string, now: number): boolean {
    return this.fx.some((x) => x.kind === "appear" && x.id === id && now - x.start >= 0 && now - x.start < T_END);
  }

  /** Deslocamento extra (px) da touceira de grama perto de um efeito de farfalhar. */
  rustleAt(x: number, y: number, now: number): number {
    let s = 0;
    for (const f of this.fx) {
      if (f.kind !== "rustle") continue;
      const t = now - f.start;
      const dur = f.big ? T_ALERT : RUSTLE_MS;
      if (t < 0 || t > dur) continue;
      const d = Math.hypot(x - f.at.x, y - f.at.y);
      if (d > (f.big ? 34 : 22)) continue;
      // no salto: tremor cheio até os últimos 120 ms (a grama "para" antes do "!"); farfalhar vazio decai
      const amp = f.big ? 2 * Math.min(1, (dur - t) / 120) : 1 - t / dur;
      s += Math.round(Math.sin(t / 26 + x * 0.3) * (f.big ? 2.4 : 1) * amp);
    }
    return Math.max(-2, Math.min(2, s));
  }

  /** Puxão de câmera (px de mundo) em direção ao selvagem durante a apresentação. */
  cameraBias(now: number, tamerPos: Vec | undefined): Vec {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && now - x.start < T_END);
    if (!f || !tamerPos) return { x: 0, y: 0 };
    const t = now - f.start;
    const k = t < T_JUMP ? ease(t / T_JUMP) : t > T_FIGHT ? Math.max(0, 1 - ease((t - T_FIGHT) / (T_END - T_FIGHT))) : 1;
    return { x: Math.round((f.at.x - tamerPos.x) * 0.33 * k), y: Math.round((f.at.y - tamerPos.y) * 0.33 * k) };
  }

  /** Força da vinheta (0..0,15) e se o encontro é muito raro (vinheta quente). */
  vignette(now: number): { k: number; warm: boolean } {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && now - x.start < T_END);
    if (!f) return { k: 0, warm: false };
    const t = now - f.start;
    const k = t < T_ALERT ? t / T_ALERT : t > T_FIGHT ? 1 - (t - T_FIGHT) / (T_END - T_FIGHT) : 1;
    return { k: 0.15 * Math.max(0, Math.min(1, k)), warm: f.rarity === "very_rare" };
  }

  /** Por cima do mundo: folhas, "!", poeira do pouso, brilho do muito raro, placa de raridade, NOVO, vinheta. */
  draw(ctx: CanvasRenderingContext2D, cam: { x: number; y: number; w: number; h: number }, now: number, posOf: (id: string) => Vec | undefined, tamerTop: number): void {
    for (const f of this.fx) {
      const t = now - f.start;
      if (t < 0) continue;
      const ax = Math.round(f.at.x - cam.x);
      const ay = Math.round(f.at.y - cam.y);
      if (f.kind === "rustle") {
        if (!f.big) {
          if (t > RUSTLE_MS + 200) continue;
          // farfalhar vazio: 2 folhas subindo
          for (let i = 0; i < 2; i++) {
            const u = Math.min(1, t / (RUSTLE_MS + 200));
            ctx.globalAlpha = 1 - u;
            ctx.fillStyle = i % 2 ? "#7fcf5a" : "#4f9a3c";
            ctx.fillRect(ax + ((i * 37) % 13) - 6 + Math.round(Math.sin(t / 90 + i) * 2), ay - 6 - Math.round(u * (6 + i * 2)), 2, 1);
          }
          ctx.globalAlpha = 1;
          continue;
        }
        // salto: a touceira solta folhas em ondas durante todo o tremor (3 ondas de 4 folhas, 400 ms cada)
        if (t > T_ALERT + 250) continue;
        for (let i = 0; i < 12; i++) {
          const born = (i >> 2) * 170;
          const u = (t - born) / 400;
          if (u < 0 || u > 1) continue;
          const sx = ((i * 37) % 17) - 8;
          ctx.globalAlpha = 1 - u * u;
          ctx.fillStyle = i % 3 === 0 ? "#a8e070" : i % 2 ? "#7fcf5a" : "#4f9a3c";
          ctx.fillRect(ax + sx + Math.round(Math.sin(t / 70 + i) * 3), ay - 8 - Math.round(u * (10 + (i % 3) * 3)), 2, 1);
        }
        ctx.globalAlpha = 1;
        continue;
      }
      if (t > T_END) continue;
      // balão "!" sobre o Tamer (600–1500 ms): estoura com pulo de 3 px e fica parado (a pausa antes do salto)
      const tp = posOf(f.tamerId);
      if (tp && t >= T_ALERT && t < T_LAND) {
        const e = t - T_ALERT;
        const pop = e < 60 ? -3 : e < 120 ? -1 : 0;
        const bx = Math.round(tp.x - cam.x - 5);
        const by = Math.round(tp.y - cam.y - tamerTop - 19 + pop);
        if (this.opts.v2) drawAlertPill(ctx, bx, by);
        drawAlertBubble(ctx, bx, by);
      }
      // muito raro: brilho dourado subindo da grama antes do salto
      if (f.rarity === "very_rare" && t > T_ALERT - 200 && t < T_JUMP + 60) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#ffd34a";
        const h = Math.min(18, Math.round(((t - T_ALERT + 200) / 400) * 18));
        ctx.fillRect(ax - 1, ay - h, 2, h);
        ctx.fillRect(ax - 4, ay - Math.round(h * 0.6), 1, Math.round(h * 0.4));
        ctx.fillRect(ax + 3, ay - Math.round(h * 0.7), 1, Math.round(h * 0.5));
        ctx.globalAlpha = 1;
      }
      // pouso (350 ms): anel de poeira achatado abrindo + 6 folhas espalhando para cima e para os lados
      if (t >= T_LAND && t < T_LAND + T_DUST) {
        const u = (t - T_LAND) / T_DUST;
        ctx.globalAlpha = 1 - u * u;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          const r = 5 + ease(u) * 11;
          ctx.fillStyle = i % 3 === 0 ? "#e0d2b2" : "#c9b99a";
          ctx.fillRect(ax + Math.round(Math.cos(a) * r), ay + Math.round(Math.sin(a) * r * 0.4) - 1, 2, 1);
        }
        for (let i = 0; i < 6; i++) {
          const dir = i % 2 ? 1 : -1;
          ctx.fillStyle = i % 3 ? "#7fcf5a" : "#4f9a3c";
          ctx.fillRect(ax + dir * Math.round(3 + u * (8 + i * 2)), ay - 2 - Math.round(Math.sin(u * Math.PI) * (6 + (i % 3) * 3)), 2, 1);
        }
        ctx.globalAlpha = 1;
      }
      // placa: nome + nível com a borda da raridade (1500–2600 ms); no v2 ela é da camada de nomes (targetplate.ts)
      if (t >= T_LAND && !this.opts.v2) {
        const wp = posOf(f.id) ?? f.at;
        const text = `${f.name.toUpperCase()} NV.${f.level}`;
        const w = pixelTextWidth(text, 1) + 6;
        const x = Math.round(wp.x - cam.x - w / 2);
        const y = Math.round(wp.y - cam.y - 58);
        ctx.globalAlpha = t > T_PLATE ? Math.max(0, 1 - (t - T_PLATE) / (T_END - T_PLATE)) : 1;
        ctx.fillStyle = "#14101e";
        ctx.fillRect(x, y, w, 9);
        ctx.fillStyle = RARITY_COLORS[f.rarity] ?? RARITY_COLORS.common;
        ctx.fillRect(x, y, w, 1);
        ctx.fillRect(x, y + 8, w, 1);
        ctx.fillRect(x, y, 1, 9);
        ctx.fillRect(x + w - 1, y, 1, 9);
        drawOutlinedText(ctx, text, x + 3, y + 2, "#ffffff", 1);
        if (f.isNew) {
          const nx = x + w + 2;
          ctx.fillStyle = "#e0405a";
          ctx.fillRect(nx, y, pixelTextWidth("NOVO", 1) + 4, 9);
          drawOutlinedText(ctx, "NOVO", nx + 2, y + 2, "#ffffff", 1);
        }
        // muito raro: 2 cintilações na borda
        if (f.rarity === "very_rare" && Math.floor((t - T_LAND) / 120) % 2 === 0) {
          ctx.fillStyle = "#fff6c0";
          ctx.fillRect(x - 1, y - 1, 2, 2);
          ctx.fillRect(x + w - 1, y + 8, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    }
    // vinheta (+15% no auge; quente no muito raro)
    const v = this.vignette(now);
    if (v.k > 0) {
      const g = ctx.createRadialGradient(cam.w / 2, cam.h / 2, Math.min(cam.w, cam.h) * 0.3, cam.w / 2, cam.h / 2, Math.max(cam.w, cam.h) * 0.7);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, v.warm ? `rgba(80,40,0,${(v.k * 3).toFixed(3)})` : `rgba(0,0,0,${(v.k * 3).toFixed(3)})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cam.w, cam.h);
    }
  }
}

/**
 * P8 v2: pílula escura (0,72) atrás do balão, 2 px de folga em volta (mundo ×3 ≈ 17×20 px de tela, a 18×22 da spec):
 * o "!" fica legível mesmo sobre areia clara ou na névoa noturna (regra 0.5: texto sobre o mundo sempre com fundo).
 */
function drawAlertPill(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "rgba(10, 12, 18, 0.72)";
  ctx.fillRect(x - 1, y - 2, 13, 18);
  ctx.fillRect(x - 2, y - 1, 15, 16);
}

/** Balão branco 11×14 com contorno escuro e "!" vermelho (lê em qualquer fundo, dia ou noite). */
function drawAlertBubble(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = "#14101e";
  ctx.fillRect(x + 1, y, 9, 1);
  ctx.fillRect(x + 1, y + 11, 9, 1);
  ctx.fillRect(x, y + 1, 1, 10);
  ctx.fillRect(x + 10, y + 1, 1, 10);
  ctx.fillRect(x + 4, y + 12, 3, 1);
  ctx.fillRect(x + 5, y + 13, 1, 1);
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(x + 1, y + 1, 9, 10);
  ctx.fillStyle = "#e0303a";
  ctx.fillRect(x + 4, y + 2, 3, 5);
  ctx.fillRect(x + 5, y + 7, 1, 1);
  ctx.fillRect(x + 4, y + 9, 3, 2);
}
