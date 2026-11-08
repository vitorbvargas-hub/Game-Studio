// Efeitos de combate PROCEDURAIS (placeholder do slot GAME-ASSETS/04-effects/combat/). Arte original em pixels:
// faíscas, riscos de golpe, anel de choque, partículas e um orbe genérico por elemento. Nenhum efeito imita um
// golpe específico de anime/jogo.
// Sem estado: tudo é função de (semente = seq do golpe, tempo desde o evento). Mesma entrada → mesmo quadro,
// o que deixa as capturas e os testes determinísticos. Nada aqui decide dano.

import type { Vec } from "../sim/types";
import { clamp01, ease } from "./anim";
import type { HitFx, Projectile, Shake, VfxElement } from "./presenter";
import { HIT_FX_MS, SHAKE_MS, SHAKE_PX } from "./presenter";

/** Paletas (Endesga-32), do mais claro (núcleo) ao mais escuro (borda/fim de vida). */
export const PALETTES: Record<VfxElement, string[]> = {
  spark: ["#ffffff", "#fee761", "#feae34", "#f77622"],
  fire: ["#ffffff", "#fee761", "#feae34", "#f77622", "#e43b44", "#a22633"],
  frost: ["#ffffff", "#c0cbdc", "#2ce8f5", "#0099db", "#124e89"],
  wind: ["#ffffff", "#ead4aa", "#c0cbdc", "#8b9bb4"],
  light: ["#ffffff", "#fee761", "#ead4aa", "#feae34"],
  bubble: ["#ffffff", "#ead4aa", "#f6757a", "#b55088"],
};

/** mulberry32 local da apresentação (não usa nem avança o RNG da sim). */
export function fxRand(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Ctx = CanvasRenderingContext2D;

function px(ctx: Ctx, x: number, y: number, s: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x - (s - 1) / 2), Math.round(y - (s - 1) / 2), s, s);
}

/** Linha de pixels (Bresenham), espessura 1. */
function line(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, color: string): void {
  ctx.fillStyle = color;
  let x = Math.round(x0);
  let y = Math.round(y0);
  const xe = Math.round(x1);
  const ye = Math.round(y1);
  const dx = Math.abs(xe - x);
  const dy = -Math.abs(ye - y);
  const sx = x < xe ? 1 : -1;
  const sy = y < ye ? 1 : -1;
  let err = dx + dy;
  for (let i = 0; i < 64; i++) {
    ctx.fillRect(x, y, 1, 1);
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

/** Círculo de pixels (contorno). */
function ring(ctx: Ctx, cx: number, cy: number, r: number, color: string, squash = 0.6): void {
  ctx.fillStyle = color;
  const n = Math.max(8, Math.round(r * 5));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * squash), 1, 1);
  }
}

export interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  alive: boolean;
}

/** Partículas do impacto no tempo t (ms), deterministas pela semente. Exportado para teste. */
export function impactParticles(fx: Pick<HitFx, "seq" | "crit" | "special" | "element" | "dir">, t: number): Particle[] {
  const r = fxRand(fx.seq * 7919 + 17);
  const pal = PALETTES[fx.element];
  const n = fx.special ? 16 : fx.crit ? 14 : 10;
  const base = Math.atan2(fx.dir.y, fx.dir.x || (fx.dir.y ? 0 : 1));
  const out: Particle[] = [];
  for (let i = 0; i < n; i++) {
    // Metade sai no sentido do golpe (esguicho), metade em leque.
    const spread = i % 2 === 0 ? (r() - 0.5) * 1.6 : (r() - 0.5) * Math.PI * 2;
    const a = base + spread;
    const speed = 50 + r() * (fx.crit ? 140 : 100);
    const life = 220 + r() * 230;
    const size = r() < 0.3 ? 2 : 1;
    const u = t / 1000;
    const k = clamp01(t / life);
    const drag = 1 - 0.45 * k;
    out.push({
      x: Math.cos(a) * speed * u * drag,
      y: Math.sin(a) * speed * u * drag * 0.8 + 0.5 * 260 * u * u - 6 * (1 - k) * (fx.element === "fire" ? 1 : 0) * u * 10,
      size,
      color: pal[Math.min(pal.length - 1, Math.floor(k * pal.length))],
      alive: t < life,
    });
  }
  return out;
}

/** Desenha o impacto em (cx, cy) de tela, t ms depois do impacto exibido. */
export function drawImpact(ctx: Ctx, fx: HitFx, cx: number, cy: number, t: number): void {
  if (t < 0 || t > HIT_FX_MS) return;
  const pal = PALETTES[fx.element];
  ctx.save();
  // 1) clarão do impacto (3 quadros)
  if (t < 50) {
    const s = fx.crit ? 7 : 5;
    ctx.globalAlpha = 1;
    px(ctx, cx, cy, s - 2, "#ffffff");
    line(ctx, cx - s, cy, cx + s, cy, "#ffffff");
    line(ctx, cx, cy - s, cx, cy + s, "#ffffff");
  }
  // 2) golpe básico: dois riscos cruzados perpendiculares ao golpe, que crescem e somem
  if (!fx.special && t < 160) {
    const k = ease.outCubic(t / 90);
    const len = 3 + Math.round(9 * k) + (fx.crit ? 3 : 0);
    const px_ = -fx.dir.y || 0.7;
    const py_ = fx.dir.x || 0.7;
    ctx.globalAlpha = t < 100 ? 1 : 1 - (t - 100) / 60;
    for (const [ox, oy, rot] of [
      [0, 0, 0.5],
      [2, -2, -0.5],
    ] as const) {
      const ax = px_ + fx.dir.x * rot;
      const ay = py_ + fx.dir.y * rot;
      const n = Math.hypot(ax, ay) || 1;
      line(ctx, cx + ox - (ax / n) * len, cy + oy - (ay / n) * len, cx + ox + (ax / n) * len, cy + oy + (ay / n) * len, t < 60 ? "#ffffff" : pal[1]);
    }
  }
  // 3) especial ou crítico: anel de choque
  if ((fx.special || fx.crit) && t < 260) {
    const k = ease.outCubic(t / 260);
    ctx.globalAlpha = 1 - k;
    ring(ctx, cx, cy, 3 + k * (fx.special ? 16 : 12), pal[Math.min(pal.length - 1, 1 + Math.floor(k * 3))]);
    if (fx.special) ring(ctx, cx, cy, 2 + k * 9, pal[0]);
  }
  // 4) partículas
  ctx.globalAlpha = 1;
  for (const p of impactParticles(fx, t)) if (p.alive) px(ctx, cx + p.x, cy + p.y, p.size, p.color);
  ctx.restore();
}

/** Posição do projétil (px do mundo) no instante `now`. Antes do lançamento: undefined. */
export function projectilePos(pr: Projectile, from: Vec, to: Vec, now: number): { pos: Vec; u: number } | undefined {
  if (now < pr.launchAt || now >= pr.arriveAt) return undefined;
  const u = (now - pr.launchAt) / Math.max(1, pr.arriveAt - pr.launchAt);
  const k = ease.inOutSine(u) * 0.35 + u * 0.65;
  const arc = pr.element === "bubble" || pr.element === "wind" ? Math.sin(Math.PI * u) * 8 : Math.sin(Math.PI * u) * 3;
  return { pos: { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k - arc }, u };
}

/** Orbe genérico do elemento + rastro. (sx, sy) = posição de tela atual; dir = sentido do voo. */
export function drawProjectile(ctx: Ctx, pr: Projectile, sx: number, sy: number, dir: Vec, now: number): void {
  const pal = PALETTES[pr.element];
  const r = fxRand(pr.seq * 131 + Math.floor(now / 40));
  ctx.save();
  // rastro: pontos atrás do orbe, encolhendo e escurecendo
  for (let i = 5; i >= 1; i--) {
    const jitter = (r() - 0.5) * 2;
    const tx = sx - dir.x * i * 3 + -dir.y * jitter;
    const ty = sy - dir.y * i * 3 + dir.x * jitter;
    ctx.globalAlpha = 1 - i * 0.14;
    px(ctx, tx, ty, i <= 2 ? 2 : 1, pal[Math.min(pal.length - 1, i)]);
  }
  ctx.globalAlpha = 1;
  const pulse = Math.floor(now / 60) % 2;
  if (pr.element === "bubble" || pr.element === "wind") {
    // bolha/rajada: contorno claro + brilho
    ring(ctx, sx, sy, 3 + pulse, pal[pr.element === "bubble" ? 2 : 1], 1);
    px(ctx, sx - 1, sy - 1, 1, "#ffffff");
  } else {
    // orbe: borda escura, corpo, núcleo branco
    const R = 3 + pulse;
    for (let y = -R; y <= R; y++) {
      const half = Math.floor(Math.sqrt(Math.max(0, R * R - y * y)));
      ctx.fillStyle = Math.abs(y) === R || half === 0 ? pal[3] ?? pal[2] : pal[2];
      ctx.fillRect(Math.round(sx - half), Math.round(sy + y), half * 2 + 1, 1);
    }
    px(ctx, sx, sy, 3, pal[1]);
    px(ctx, sx - 1, sy - 1, 1, pal[0]);
    if (pr.element === "light") {
      line(ctx, sx - 6, sy, sx + 6, sy, pal[0]);
      line(ctx, sx, sy - 6, sx, sy + 6, pal[0]);
    }
  }
  // faíscas soltas
  for (let i = 0; i < 3; i++) px(ctx, sx + (r() - 0.5) * 10, sy + (r() - 0.5) * 8, 1, pal[1 + Math.floor(r() * (pal.length - 1))]);
  ctx.restore();
}

/** Brilho de carga na boca/mão do atacante entre a antecipação e o lançamento. */
export function drawCharge(ctx: Ctx, element: VfxElement, sx: number, sy: number, k: number, now: number): void {
  if (k <= 0 || k >= 1) return;
  const pal = PALETTES[element];
  const R = 1 + Math.round(3 * k);
  ctx.save();
  ctx.globalAlpha = 0.6 + 0.4 * k;
  ring(ctx, sx, sy, R + 2 - (Math.floor(now / 50) % 2), pal[2], 1);
  px(ctx, sx, sy, R, pal[1]);
  px(ctx, sx, sy, 1, "#ffffff");
  ctx.restore();
}

/** Deslocamento de câmera (px inteiros) das tremidas ativas: amplitude decai, sinal pseudo-aleatório a cada 30 ms. */
export function shakeOffset(shakes: Shake[], now: number): Vec {
  let x = 0;
  let y = 0;
  for (const s of shakes) {
    const t = now - s.start;
    if (t < 0 || t >= SHAKE_MS) continue;
    const amp = SHAKE_PX * (1 - t / SHAKE_MS);
    const r = fxRand(s.seq * 977 + Math.floor(t / 30));
    x += (r() * 2 - 1) * amp;
    y += (r() * 2 - 1) * amp;
  }
  return { x: Math.round(x), y: Math.round(y) };
}
