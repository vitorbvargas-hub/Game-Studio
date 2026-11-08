// SPIKE — render da arena em Canvas 2D, resolução lógica cfg.width x cfg.height (320x180),
// ampliada por fator inteiro via CSS. Só LÊ o estado e consome eventos para efeitos visuais.

import { drawPixelText, pixelTextWidth } from "../src/render/pixelfont";
import type { ContentBundle, SpriteRef } from "../src/sim/types";
import type { ArenaConfig, ArenaEvent, ArenaState, Fighter } from "./arena";

/** Imagem mínima que o renderer precisa (HTMLImageElement no navegador, Image do @napi-rs/canvas na captura). */
export interface ImageLike {
  naturalWidth?: number;
  width: number;
  height: number;
  complete?: boolean;
}

const MS_PER_DRAW = 1000 / 60;

export class ArenaRenderer {
  private floaters: { x: number; y: number; text: string; color: string; life: number }[] = [];
  private flash: [number, number] = [0, 0];
  private frame = 0;

  constructor(
    private ctx: CanvasRenderingContext2D,
    private content: ContentBundle,
    private cfg: ArenaConfig,
    /** Caminho do sprite no pacote -> imagem carregada (ou null se ainda não carregou). */
    private image: (path: string) => ImageLike | null,
  ) {}

  private affColor(id: string): string {
    return this.content.theme.affinities.find((a) => a.id === id)?.color ?? "#ffffff";
  }

  reset(): void {
    this.floaters = [];
    this.flash = [0, 0];
  }

  onEvent(st: ArenaState, e: ArenaEvent): void {
    if (e.t === "hit") {
      const f = st.fighters[e.target];
      this.flash[e.target] = 6;
      this.floaters.push({ x: f.x, y: f.y - 30, text: `-${e.amount}${e.crit ? "!" : ""}`, color: e.crit ? "#ffd84a" : "#ffffff", life: 40 });
    } else if (e.t === "heal") {
      const f = st.fighters[e.target];
      this.floaters.push({ x: f.x, y: f.y - 30, text: `+${e.amount}`, color: "#8dff9a", life: 40 });
    }
  }

  private sprite(ref: SpriteRef | undefined, frameMs = 500): ImageLike | null {
    if (!ref) return null;
    const frames = typeof ref === "string" ? [ref] : ref;
    const img = this.image(frames[Math.floor((this.frame * MS_PER_DRAW) / frameMs) % frames.length]);
    return img && img.complete !== false && (img.naturalWidth ?? img.width) > 0 ? img : null;
  }

  private drawFighter(f: Fighter): void {
    const ctx = this.ctx;
    const x = Math.round(f.x);
    const y = Math.round(f.y);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x - 9, y + 8, 18, 3);
    // Marcador de direção na cor da afinidade: é para onde sai o especial.
    ctx.fillStyle = this.affColor(f.affinity);
    ctx.fillRect(Math.round(f.x + f.fx * 16) - 1, Math.round(f.y + f.fy * 16) - 1, 3, 3);
    if (f.guard > 0) {
      ctx.strokeStyle = "#7ee0ff";
      ctx.strokeRect(x - 14.5, y - 26.5, 29, 39);
    }
    const img = this.sprite(f.sprite, f.spriteFrameMs);
    ctx.save();
    ctx.globalAlpha = this.flash[f.idx] > 0 && this.flash[f.idx] % 2 ? 0.4 : f.hp > 0 ? 1 : 0.3;
    if (img) {
      const w = img.naturalWidth ?? img.width;
      const ix = x - Math.round(w / 2);
      const iy = y + 10 - img.height;
      // Sprites do pacote olham para a direita; espelha quando o lutador olha para a esquerda.
      if (f.fx < 0) {
        ctx.translate(ix * 2 + w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(img as CanvasImageSource, ix, iy);
    } else {
      ctx.fillStyle = "#05070d";
      ctx.fillRect(x - 11, y - 11, 22, 22);
      ctx.fillStyle = f.color;
      ctx.fillRect(x - 10, y - 10, 20, 20);
    }
    ctx.restore();
    if (f.swing > 0) {
      // Golpe básico: arco curto à frente.
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = -2; i <= 2; i++) {
        const px = f.x + f.fx * 22 - f.fy * i * 4;
        const py = f.y + f.fy * 22 + f.fx * i * 4;
        ctx.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3);
      }
    }
    // Barra de HP e de recarga do especial sobre a cabeça.
    const bw = 26;
    const by = y - 44;
    ctx.fillStyle = "#000";
    ctx.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 6);
    ctx.fillStyle = f.idx === 0 ? "#8dff9a" : "#ff6b8b";
    ctx.fillRect(x - bw / 2, by, Math.round((bw * f.hp) / f.maxHp), 2);
    ctx.fillStyle = f.specialCd === 0 ? "#ffd84a" : "#5a6480";
    ctx.fillRect(x - bw / 2, by + 3, Math.round(bw * (1 - f.specialCd / f.specialCdMax)), 1);
  }

  draw(st: ArenaState): void {
    const { ctx, cfg } = this;
    const pal = this.content.theme.palette;
    this.frame++;
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, cfg.width, cfg.height);
    ctx.fillStyle = pal.ground;
    ctx.fillRect(cfg.margin, cfg.margin, cfg.width - cfg.margin * 2, cfg.height - cfg.margin * 2);
    ctx.fillStyle = pal.grid;
    for (let gx = cfg.margin; gx <= cfg.width - cfg.margin; gx += 16) ctx.fillRect(gx, cfg.margin, 1, cfg.height - cfg.margin * 2);
    for (let gy = cfg.margin; gy <= cfg.height - cfg.margin; gy += 16) ctx.fillRect(cfg.margin, gy, cfg.width - cfg.margin * 2, 1);

    // Ordena por y: quem está mais abaixo fica na frente.
    [...st.fighters].sort((p, q) => p.y - q.y).forEach((f) => this.drawFighter(f));
    for (const p of st.projectiles) {
      const r = cfg.special.projectileRadius;
      ctx.fillStyle = this.affColor(p.affinity);
      ctx.fillRect(Math.round(p.x - r), Math.round(p.y - r), r * 2, r * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(Math.round(p.x - 1), Math.round(p.y - 1), 2, 2);
    }
    for (const fl of this.floaters) {
      drawPixelText(ctx, fl.text, fl.x - pixelTextWidth(fl.text) / 2, fl.y, fl.color);
      fl.y -= 0.3;
      fl.life--;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    this.flash = [Math.max(0, this.flash[0] - 1), Math.max(0, this.flash[1] - 1)];
    // Relógio (segundos restantes).
    const left = String(Math.max(0, Math.ceil(cfg.timeLimitSec - st.tick / cfg.simHz)));
    drawPixelText(ctx, left, cfg.width / 2 - pixelTextWidth(left) / 2, 3, pal.text);
    if (st.outcome) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, cfg.width, cfg.height);
    }
  }
}
