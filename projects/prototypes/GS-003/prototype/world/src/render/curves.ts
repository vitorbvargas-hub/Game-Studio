// Curvas contínuas da Map Factory R2 (camada `curves` do TMJ): trilha e riacho desenhados como uma faixa de
// meia-largura constante em volta da polilinha da spline, por distância em pixels do mundo. Os PNGs Wang-47/16 só
// sabem formas de grade (cada tile é uma de 47/16 máscaras), então uma trilha na diagonal vira escada; aqui a borda
// sai da distância à linha central, que é contínua entre tiles, e a textura continua a do pacote (o tile cheio do
// conjunto, repetido em coordenadas do mundo, sem costura). Só apresentação: a colisão segue nas células.
//
// Por célula: as células do conjunto que a curva pintou (centro a até hw + pad da linha) trocam o tile Wang pelo chão
// de baixo (`ground`) e recebem a faixa por cima; as vizinhas (ou uma lagoa do mesmo conjunto) mantêm o tile delas e
// recebem só a parte da faixa que passa nelas (no máximo ~0,2 tile). Ordem: z crescente (trilha 0, água 1).

import type { MapCurve } from "../sim/map";
import { valueNoise } from "./pathsmooth";

/** Amplitude (px) e escala (px) do ruído da borda: a largura varia no máximo ±EDGE_NOISE px. */
export const EDGE_NOISE = 1.25;
const NOISE_SCALE = 7;

interface Seg {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  ha: number;
  hb: number;
}

export interface CurveIndex {
  curves: MapCurve[];
  segs: Seg[][];
  /** Curvas que passam perto de cada célula (índices em `curves`). */
  near: Map<number, number[]>;
  /** Célula do conjunto pintada pela curva (índice da curva dona). */
  owner: Map<number, number>;
}

/** Folga (px) do centro da célula até a borda da faixa (negativa = dentro), e o índice da curva mais perto. */
function fieldAt(segs: Seg[], x: number, y: number): number {
  let best = Infinity;
  for (const s of segs) {
    const dx = s.bx - s.ax;
    const dy = s.by - s.ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / l2));
    const f = Math.hypot(x - s.ax - dx * t, y - s.ay - dy * t) - (s.ha + (s.hb - s.ha) * t);
    if (f < best) best = f;
  }
  return best;
}

/**
 * Índice das curvas do mapa. `keyAt(i)` = chave do chão da célula i; `pad` (px) = até onde o centro da célula do
 * conjunto conta como pintado pela curva (o gerador usa 0,45–0,5 tile).
 */
export function buildCurveIndex(curves: MapCurve[], W: number, H: number, ts: number, keyAt: (i: number) => string, pad = 0.5 * ts): CurveIndex {
  const near = new Map<number, number[]>();
  const owner = new Map<number, number>();
  const segs = curves.map((c) => c.points.slice(1).map((b, k) => ({ ax: c.points[k].x, ay: c.points[k].y, bx: b.x, by: b.y, ha: c.hw[k], hb: c.hw[k + 1] })));
  curves.forEach((c, ci) => {
    const reach = EDGE_NOISE + 2;
    const cells = new Set<number>();
    for (const s of segs[ci]) {
      const r = Math.max(s.ha, s.hb) + reach;
      for (let y = Math.max(0, Math.floor((Math.min(s.ay, s.by) - r) / ts)); y <= Math.min(H - 1, Math.floor((Math.max(s.ay, s.by) + r) / ts)); y++)
        for (let x = Math.max(0, Math.floor((Math.min(s.ax, s.bx) - r) / ts)); x <= Math.min(W - 1, Math.floor((Math.max(s.ax, s.bx) + r) / ts)); x++) cells.add(y * W + x);
    }
    for (const i of cells) {
      const x0 = (i % W) * ts;
      const y0 = Math.floor(i / W) * ts;
      // a faixa toca a célula? (canto mais perto da linha: centro − meia diagonal)
      const fc = fieldAt(segs[ci], x0 + ts / 2, y0 + ts / 2);
      if (fc - ts * 0.71 > EDGE_NOISE) continue;
      near.set(i, [...(near.get(i) ?? []), ci]);
      if (c.prefix && keyAt(i).startsWith(c.prefix) && fc <= pad + 1) owner.set(i, ci);
    }
  });
  return { curves, segs, near, owner };
}

const hash = (x: number, y: number): number => {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const hex = (c: string): [number, number, number] => {
  const v = parseInt(c.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

/**
 * Pixels RGBA (ts×ts) da faixa das curvas sobre a célula (mx, my): transparente fora. `fillOf(ci)` = pixels do tile
 * cheio da curva ci (ou undefined se ainda não carregou: a curva fica de fora). null = nada desta célula.
 */
export function composeCurveOverlay(idx: CurveIndex, mx: number, my: number, ts: number, W: number, fillOf: (ci: number) => Uint8ClampedArray | undefined): Uint8ClampedArray | null {
  const list = idx.near.get(my * W + mx);
  if (!list?.length) return null;
  const out = new Uint8ClampedArray(ts * ts * 4);
  let any = false;
  for (const ci of list) {
    const c = idx.curves[ci];
    const fill = fillOf(ci);
    if (!fill) continue;
    const foam = c.foam ? hex(c.foam) : null;
    const segs = idx.segs[ci];
    // só os segmentos que chegam perto desta célula
    const cx = mx * ts + ts / 2;
    const cy = my * ts + ts / 2;
    const local = segs.filter((s) => {
      const r = Math.max(s.ha, s.hb) + ts;
      return Math.max(s.ax, s.bx) + r >= cx - ts && Math.min(s.ax, s.bx) - r <= cx + ts && Math.max(s.ay, s.by) + r >= cy - ts && Math.min(s.ay, s.by) - r <= cy + ts;
    });
    for (let py = 0; py < ts; py++)
      for (let px = 0; px < ts; px++) {
        const wx = mx * ts + px + 0.5;
        const wy = my * ts + py + 0.5;
        const n = (valueNoise(wx / NOISE_SCALE + ci * 17.3, wy / NOISE_SCALE) - 0.5) * 2 * EDGE_NOISE;
        const f = fieldAt(local, wx, wy) - n;
        if (f > 0) continue;
        const i = (py * ts + px) * 4;
        let r = fill[i];
        let g = fill[i + 1];
        let b = fill[i + 2];
        if (c.edge === "dither") {
          // 1 px de pontilhado (35%) na borda, como as bordas do pacote
          if (f > -1 && hash(wx | 0, (wy | 0) * 31 + ci) < 0.35) continue;
        } else if (foam) {
          // espuma: 2 px claros na margem (meia mistura no px de dentro)
          const k = f > -1 ? 0.7 : f > -2.2 ? 0.35 : 0;
          r += (foam[0] - r) * k;
          g += (foam[1] - g) * k;
          b += (foam[2] - b) * k;
        }
        if (foam && c.fords.length) {
          // vau: água rasa, puxada para a espuma, com borda suave e irregular (sem retângulo à vista)
          let k = 0;
          for (const q of c.fords) {
            const dx = Math.max(q.x - wx, 0, wx - (q.x + q.w));
            const dy = Math.max(q.y + q.h * 0.5 - wy, 0, wy - (q.y + q.h * 0.5)) - q.h * 0.3;
            const d = Math.hypot(dx, Math.max(0, dy)) + (valueNoise(wx / 5, wy / 5 + 40) - 0.5) * 10;
            k = Math.max(k, 0.32 * Math.min(1, Math.max(0, 1 - d / 12)));
          }
          r += (foam[0] - r) * k;
          g += (foam[1] - g) * k;
          b += (foam[2] - b) * k;
        }
        out[i] = r;
        out[i + 1] = g;
        out[i + 2] = b;
        out[i + 3] = 255;
        any = true;
      }
  }
  return any ? out : null;
}
