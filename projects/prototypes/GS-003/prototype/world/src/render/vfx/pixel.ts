// Primitivas pixel-perfect para os VFX: tudo em coordenadas inteiras da resolução lógica (a escala de tela é
// inteira e feita pelo CSS), sem antialias. O brilho é aditivo ("lighter") em discos concêntricos com alpha em
// degraus, que dá o glow em faixas típico de pixel art, sem borrão.

export type G = CanvasRenderingContext2D;

const R = Math.round;

/** mulberry32 local da apresentação (não usa nem avança o RNG da sim). */
export function rand(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);
export const outCubic = (t: number): number => 1 - Math.pow(1 - clamp01(t), 3);
export const inCubic = (t: number): number => Math.pow(clamp01(t), 3);
export const outBack = (t: number): number => {
  const c = 1.70158;
  const x = clamp01(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
/** Alpha em degraus de 1/8 (banding de pixel art). */
export const step8 = (a: number): number => Math.round(clamp01(a) * 8) / 8;

/** Cor da paleta pela "idade" k (0 = núcleo claro, 1 = borda escura). */
export function pal(p: string[], k: number): string {
  return p[Math.min(p.length - 1, Math.max(0, Math.floor(clamp01(k) * p.length)))];
}

export function dot(g: G, x: number, y: number, s: number, c: string): void {
  g.fillStyle = c;
  const si = Math.max(1, R(s));
  g.fillRect(R(x - (si - 1) / 2), R(y - (si - 1) / 2), si, si);
}

/** Linha de Bresenham com espessura `w` (quadrados de w×w). */
export function line(g: G, x0: number, y0: number, x1: number, y1: number, c: string, w = 1): void {
  g.fillStyle = c;
  let x = R(x0);
  let y = R(y0);
  const xe = R(x1);
  const ye = R(y1);
  const dx = Math.abs(xe - x);
  const dy = -Math.abs(ye - y);
  const sx = x < xe ? 1 : -1;
  const sy = y < ye ? 1 : -1;
  let err = dx + dy;
  const o = Math.floor((w - 1) / 2);
  for (let i = 0; i < 1024; i++) {
    g.fillRect(x - o, y - o, w, w);
    if (x === xe && y === ye) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** Disco cheio por linhas horizontais (squash < 1 achata no eixo Y, para o chão). */
export function disk(g: G, cx: number, cy: number, r: number, c: string, squash = 1): void {
  if (r <= 0.5) return dot(g, cx, cy, 1, c);
  g.fillStyle = c;
  const ry = Math.max(1, R(r * squash));
  const x0 = R(cx);
  const y0 = R(cy);
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(r * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    g.fillRect(x0 - half, y0 + y, half * 2 + 1, 1);
  }
}

/** Anel (contorno) de pixels; `arc` limita a um arco [a0, a1] em radianos. */
export function ring(g: G, cx: number, cy: number, r: number, c: string, squash = 1, w = 1, arc?: [number, number]): void {
  if (r < 0.5) return;
  g.fillStyle = c;
  const n = Math.max(12, R(r * 7));
  const [a0, a1] = arc ?? [0, Math.PI * 2];
  const o = Math.floor((w - 1) / 2);
  let lx = NaN;
  let ly = NaN;
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const x = R(cx + Math.cos(a) * r);
    const y = R(cy + Math.sin(a) * r * squash);
    if (x === lx && y === ly) continue;
    g.fillRect(x - o, y - o, w, w);
    lx = x;
    ly = y;
  }
}

/** Brilho aditivo: 3 discos concêntricos com alpha em degraus. */
export function glow(g: G, cx: number, cy: number, r: number, c: string, alpha: number, squash = 1): void {
  if (r < 1 || alpha <= 0) return;
  const prevOp = g.globalCompositeOperation;
  const prevA = g.globalAlpha;
  g.globalCompositeOperation = "lighter";
  for (const [k, a] of [
    [1, 0.18],
    [0.66, 0.28],
    [0.36, 0.42],
  ] as const) {
    g.globalAlpha = step8(alpha * a * prevA);
    if (g.globalAlpha > 0) disk(g, cx, cy, r * k, c, squash);
  }
  g.globalCompositeOperation = prevOp;
  g.globalAlpha = prevA;
}

/** Executa `fn` com composição aditiva. */
export function additive(g: G, fn: () => void): void {
  const prev = g.globalCompositeOperation;
  g.globalCompositeOperation = "lighter";
  fn();
  g.globalCompositeOperation = prev;
}

export function withAlpha(g: G, a: number, fn: () => void): void {
  const prev = g.globalAlpha;
  g.globalAlpha = prev * clamp01(a);
  if (g.globalAlpha > 0) fn();
  g.globalAlpha = prev;
}

/** Losango orientado em `ang` (comprimento len, meia largura hw). */
export function shard(g: G, cx: number, cy: number, ang: number, len: number, hw: number, c: string, core?: string): void {
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const steps = Math.max(2, R(len));
  g.fillStyle = c;
  for (let i = -steps; i <= steps; i++) {
    const k = i / steps;
    const w = Math.max(0, R(hw * (1 - Math.abs(k))));
    const x = cx + ux * len * k;
    const y = cy + uy * len * k;
    for (let j = -w; j <= w; j++) g.fillRect(R(x - uy * j), R(y + ux * j), 1, 1);
  }
  if (core) line(g, cx - ux * len * 0.6, cy - uy * len * 0.6, cx + ux * len * 0.6, cy + uy * len * 0.6, core);
}

/** Seta pixel com a ponta em (cx, cy): para cima (dir = -1) ou para baixo (dir = 1). */
export function arrow(g: G, cx: number, cy: number, s: number, c: string, dir: -1 | 1): void {
  g.fillStyle = c;
  const x = R(cx);
  const y = R(cy);
  // cabeça: linhas que alargam a partir da ponta; haste: s linhas atrás da cabeça
  for (let i = 0; i <= s; i++) g.fillRect(x - i, y - dir * i, i * 2 + 1, 1);
  const hw = Math.max(0, Math.floor(s / 3));
  for (let i = s + 1; i <= s * 2; i++) g.fillRect(x - hw, y - dir * i, hw * 2 + 1, 1);
}

/** Sinal de "+" pixel. */
export function plus(g: G, cx: number, cy: number, s: number, c: string): void {
  g.fillStyle = c;
  const x = R(cx);
  const y = R(cy);
  const t = Math.max(1, Math.floor(s / 2));
  g.fillRect(x - s, y - Math.floor(t / 2), s * 2 + 1, t);
  g.fillRect(x - Math.floor(t / 2), y - s, t, s * 2 + 1);
}

/** Polilinha em zigue-zague de A até B (raio): `n` segmentos, desvio `amp`, re-sorteado por `seed`. */
export function zigzag(g: G, ax: number, ay: number, bx: number, by: number, n: number, amp: number, seed: number, c: string, w = 1): { x: number; y: number }[] {
  const r = rand(seed);
  const dx = bx - ax;
  const dy = by - ay;
  const L = Math.hypot(dx, dy) || 1;
  const px = -dy / L;
  const py = dx / L;
  const pts = [{ x: ax, y: ay }];
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const o = (r() * 2 - 1) * amp * Math.sin(Math.PI * k);
    pts.push({ x: ax + dx * k + px * o, y: ay + dy * k + py * o });
  }
  pts.push({ x: bx, y: by });
  for (let i = 1; i < pts.length; i++) line(g, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, c, w);
  return pts;
}

export interface BurstOpts {
  n: number;
  speed: [number, number];
  life: [number, number];
  gravity?: number;
  /** Ângulo central e abertura (rad). Sem `spread` = 360°. */
  angle?: number;
  spread?: number;
  drag?: number;
  /** Subida (px/s) somada a vy: fumaça/brasas. */
  lift?: number;
  squash?: number;
  size?: [number, number];
}

export interface Bit {
  x: number;
  y: number;
  k: number;
  size: number;
  i: number;
}

/** Partículas em forma fechada (posição = f(semente, t)): mesmo golpe + mesmo instante = mesmo quadro. */
export function burst(seed: number, t: number, o: BurstOpts): Bit[] {
  const r = rand(seed);
  const out: Bit[] = [];
  for (let i = 0; i < o.n; i++) {
    const a = o.spread === undefined ? r() * Math.PI * 2 : (o.angle ?? 0) + (r() - 0.5) * o.spread;
    const sp = o.speed[0] + r() * (o.speed[1] - o.speed[0]);
    const life = o.life[0] + r() * (o.life[1] - o.life[0]);
    const size = o.size ? o.size[0] + Math.floor(r() * (o.size[1] - o.size[0] + 1)) : 1;
    if (t < 0 || t >= life) continue;
    const u = t / 1000;
    const k = t / life;
    const drag = 1 - (o.drag ?? 0.5) * k;
    out.push({
      x: Math.cos(a) * sp * u * drag,
      y: (Math.sin(a) * sp * u * drag - (o.lift ?? 0) * u) * (o.squash ?? 1) + 0.5 * (o.gravity ?? 0) * u * u,
      k,
      size,
      i,
    });
  }
  return out;
}
