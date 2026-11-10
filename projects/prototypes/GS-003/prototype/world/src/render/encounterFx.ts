// GS-012 passo 8 (mínimo para os passos 5–7, atrás de ?encounters=1): apresentação do encontro aleatório no
// próprio mapa (ENCOUNTER_ARCHITECTURE.md §4, recomendação A). Só consome eventos da sim (wild_appear,
// grass_rustle, wild_leave): não decide nada. A sim já criou o selvagem no tick do sorteio; aqui ele fica
// escondido na grama e salta em arco.
//
//   0–350 ms     a grama do tile treme (±2 px), folhas sobem, "!" sobre o Tamer, vinheta entra, câmera puxa
//   350–700 ms   o selvagem salta da grama num arco de 12 px (sobe 3 quadros, desce 2); sem squash (o sprite não
//                é deformado: pixel art; quadros de salto desenhados ficam para o game-art)
//   700–1000 ms  poeira/folhas no pouso, placa "NOME NV.N" com a borda na cor da raridade, selo NOVO
//   1000–1200 ms vinheta e câmera voltam; a parceira já está em ENGAGE (a sim faz isso no fim do salto)
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

const T_JUMP = 350;
const T_LAND = 700;
const T_PLATE = 1000;
const T_END = 1200;
const RUSTLE_MS = 420;

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

  /** Algum efeito ativo (as capturas esperam por isso). */
  active(now: number): boolean {
    return this.fx.some((f) => now - f.start < (f.kind === "appear" ? T_END : RUSTLE_MS));
  }

  /** O selvagem em salto: escondido na grama antes do salto; depois, deslocamento vertical (px) do arco. */
  entityOffset(id: string, now: number): { hidden: boolean; dy: number } | undefined {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && x.id === id);
    if (!f) return undefined;
    const t = now - f.start;
    if (t < 0 || t >= T_LAND + 80) return undefined;
    if (t < T_JUMP) return { hidden: true, dy: 0 };
    if (t >= T_LAND) return { hidden: false, dy: 0 };
    // arco em 5 quadros (3 subindo, 2 descendo), quantizado: sem subpixel
    const u = (t - T_JUMP) / (T_LAND - T_JUMP);
    const q = Math.min(4, Math.floor(u * 5));
    const ARC = [-5, -10, -12, -8, -3];
    return { hidden: false, dy: ARC[q] };
  }

  /** Deslocamento extra (px) da touceira de grama perto de um efeito de farfalhar. */
  rustleAt(x: number, y: number, now: number): number {
    let s = 0;
    for (const f of this.fx) {
      if (f.kind !== "rustle") continue;
      const t = now - f.start;
      if (t < 0 || t > RUSTLE_MS) continue;
      const d = Math.hypot(x - f.at.x, y - f.at.y);
      if (d > (f.big ? 30 : 22)) continue;
      const amp = f.big ? 2 : 1;
      s += Math.round(Math.sin(t / 28 + x * 0.3) * amp * (1 - t / RUSTLE_MS));
    }
    return Math.max(-2, Math.min(2, s));
  }

  /** Puxão de câmera (px de mundo) em direção ao selvagem durante a apresentação. */
  cameraBias(now: number, tamerPos: Vec | undefined): Vec {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && now - x.start < T_END);
    if (!f || !tamerPos) return { x: 0, y: 0 };
    const t = now - f.start;
    const k = t < T_JUMP ? ease(t / T_JUMP) : t > T_PLATE ? 1 - ease((t - T_PLATE) / (T_END - T_PLATE)) : 1;
    return { x: Math.round((f.at.x - tamerPos.x) * 0.33 * k), y: Math.round((f.at.y - tamerPos.y) * 0.33 * k) };
  }

  /** Força da vinheta (0..0,15) e se o encontro é muito raro (vinheta quente). */
  vignette(now: number): { k: number; warm: boolean } {
    const f = this.fx.find((x): x is Appear => x.kind === "appear" && now - x.start < T_END);
    if (!f) return { k: 0, warm: false };
    const t = now - f.start;
    const k = t < T_JUMP ? t / T_JUMP : t > T_PLATE ? 1 - (t - T_PLATE) / (T_END - T_PLATE) : 1;
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
        if (t > RUSTLE_MS + 200) continue;
        // folhas verdes subindo (4–6 no salto, 2 no farfalhar vazio)
        const n = f.big ? 6 : 2;
        for (let i = 0; i < n; i++) {
          const u = Math.min(1, t / (RUSTLE_MS + 200));
          const sx = ((i * 37) % 13) - 6;
          ctx.globalAlpha = 1 - u;
          ctx.fillStyle = i % 2 ? "#7fcf5a" : "#4f9a3c";
          ctx.fillRect(ax + sx + Math.round(Math.sin(t / 90 + i) * 2), ay - 6 - Math.round(u * (6 + (i % 3) * 2)), 2, 1);
        }
        ctx.globalAlpha = 1;
        continue;
      }
      if (t > T_END) continue;
      // "!" sobre o Tamer (0–700 ms), com um pulo de 1 px na entrada
      const tp = posOf(f.tamerId);
      if (tp && t < T_LAND) {
        const pop = t < 80 ? -2 : 0;
        drawOutlinedText(ctx, "!", Math.round(tp.x - cam.x - 3), Math.round(tp.y - cam.y - tamerTop - 14 + pop), "#ffe066", 2);
      }
      // muito raro: brilho dourado subindo da grama antes do salto
      if (f.rarity === "very_rare" && t > 180 && t < T_JUMP + 60) {
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#ffd34a";
        const h = Math.round(((t - 180) / 230) * 14);
        ctx.fillRect(ax - 1, ay - h, 2, h);
        ctx.fillRect(ax - 4, ay - Math.round(h * 0.6), 1, Math.round(h * 0.4));
        ctx.fillRect(ax + 3, ay - Math.round(h * 0.7), 1, Math.round(h * 0.5));
        ctx.globalAlpha = 1;
      }
      // poeira e folhas no pouso (6 partículas, 250 ms)
      if (t >= T_LAND && t < T_LAND + 250) {
        const u = (t - T_LAND) / 250;
        ctx.globalAlpha = 1 - u;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.fillStyle = i % 2 ? "#c9b99a" : "#6fae4f";
          ctx.fillRect(ax + Math.round(Math.cos(a) * (4 + u * 8)), ay + Math.round(Math.sin(a) * (2 + u * 3)) - 1, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
      // placa: nome + nível com a borda da raridade (700–1200 ms)
      if (t >= T_LAND) {
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
