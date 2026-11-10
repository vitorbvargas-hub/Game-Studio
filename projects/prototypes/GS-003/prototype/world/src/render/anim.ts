// Slots de animação por estado visual. Hoje os sprites oficiais só têm `idle`; os estados sem arte própria caem
// num efeito procedural. Quando o manifest ganhar `attack`, `hurt`, `walk` ou `defeat`, eles passam a ser usados
// sem mudar código (o hitAtMs passa a vir do evento `hitFrame` do manifest).
// Nada daqui decide dano: só QUANDO mostrar um resultado que a sim já confirmou.

import { animHasResampled, type AnimFrame, type CreatureAnimation, type CreatureManifest } from "../assets/creatures";
import type { Dir8, LogicState } from "../sim/types";

export type Procedural = "lunge" | "knockback" | "fade" | "bob" | null;

export interface AnimChoice {
  name: string;
  anim: CreatureAnimation;
  procedural: Procedural;
}

/** Ataque procedural: antecipação (recuo) → avanço até o impacto → volta. */
export const PROCEDURAL_ATTACK_MS = 380;
export const PROCEDURAL_HIT_AT_MS = 160;
/** Avanço curto até o impacto e recuo de antecipação, em px. */
export const LUNGE_PX = 8;
export const ANTICIPATION_PX = 3;
/** Fração do tempo até o impacto gasta na antecipação. */
export const ANTICIPATION_FRAC = 0.5;
/** Hit-stop no impacto: atacante e alvo congelam (spec do fundador: 60–80 ms). */
export const HIT_STOP_MS = 70;
/** Golpe especial (projétil): o impacto sai este tanto depois do impacto do golpe básico. */
export const SPECIAL_EXTRA_MS = 180;
/** HURT visual: flash branco (durante o hit-stop) + knockback com easing. */
export const HURT_VIS_MS = 320;
export const HURT_FLASH_MS = 80;
export const KNOCKBACK_PX = 6;
export const KNOCKBACK_CRIT_PX = 9;
export const DEFEAT_FADE_MS = 600;
/** Sem `damage` até hitAtMs + este prazo: a animação termina sem número e sem HURT. */
export const DAMAGE_GRACE_MS = 500;

/** Animação desejada por estado (ANIMATION_STANDARD.md P0/P1). */
const WANTED: Record<LogicState, string[]> = {
  IDLE: ["idle"],
  WALK: ["walk"],
  FOLLOW: ["follow", "walk"],
  RETURN: ["walk"],
  ENGAGE: ["walk"],
  ATTACK: ["attack"],
  HURT: ["hurt"],
  DEFEAT: ["defeat", "hurt"],
};

const PROCEDURAL_FALLBACK: Record<LogicState, Procedural> = {
  IDLE: null,
  WALK: "bob",
  FOLLOW: "bob",
  RETURN: "bob",
  ENGAGE: "bob",
  ATTACK: "lunge",
  HURT: "knockback",
  DEFEAT: "fade",
};

/**
 * Escala unificada (?dpr=1, fase 2 do Quality Overhaul): animações com quadros marcados como redimensionados
 * (`resampled` no creature.json) ficam fora do mapa. Global de apresentação, ligado uma vez no boot.
 */
let skipResampled = false;
export function setSkipResampled(on: boolean): void {
  skipResampled = on;
}

export function realAnim(m: CreatureManifest, name: string | undefined): CreatureAnimation | undefined {
  if (!name || name === "idle") return undefined;
  const a = m.animations[name];
  if (!a || a.frames.length === 0) return undefined;
  if (skipResampled && animHasResampled(m, a)) return undefined;
  return a;
}

export function resolveAnim(m: CreatureManifest, state: LogicState, moving = true): AnimChoice {
  const candidates = [m.combatStates?.[state], ...WANTED[state]];
  for (const name of candidates) {
    const anim = realAnim(m, name);
    if (anim) return { name: name!, anim, procedural: state === "DEFEAT" && name !== "defeat" ? "fade" : null };
  }
  const idle = m.animations.idle ?? Object.values(m.animations)[0];
  const proc = PROCEDURAL_FALLBACK[state];
  return { name: "idle", anim: idle, procedural: proc === "bob" && !moving ? null : proc };
}

export function animDurationMs(a: CreatureAnimation): number {
  return a.frames.reduce((s, f) => s + f.durationMs, 0);
}

/**
 * Momento do impacto dentro do ataque. Real: soma das durações até o frame `hitFrame`. Golpe especial
 * (projétil): + SPECIAL_EXTRA_MS de voo. Só muda QUANDO o resultado confirmado aparece, nunca o resultado.
 */
export function attackTiming(
  m: CreatureManifest | undefined,
  special = false,
): { hitAtMs: number; durationMs: number; procedural: boolean; launchAtMs?: number } {
  const extra = special ? SPECIAL_EXTRA_MS : 0;
  const a = m && realAnim(m, m.combatStates?.ATTACK ?? "attack");
  if (!a) {
    const base = { hitAtMs: PROCEDURAL_HIT_AT_MS + extra, durationMs: PROCEDURAL_ATTACK_MS + extra, procedural: true };
    return special ? { ...base, launchAtMs: PROCEDURAL_HIT_AT_MS } : base;
  }
  const hit = a.events?.find((e) => e.name === "hitFrame")?.frame ?? Math.floor(a.frames.length / 2);
  const hitAtMs = a.frames.slice(0, hit).reduce((s, f) => s + f.durationMs, 0);
  const base = { hitAtMs: hitAtMs + extra, durationMs: animDurationMs(a) + extra, procedural: false };
  return special ? { ...base, launchAtMs: hitAtMs } : base;
}

/** Quadros da animação para a direção desenhada (v2 `dirFrames`), ou os quadros padrão. */
export function framesFor(a: CreatureAnimation, dir: string): AnimFrame[] {
  return a.dirFrames?.[dir] ?? a.frames;
}

/** Índice do frame no tempo `elapsedMs` (loop ou one-shot preso no último). */
export function frameAt(a: CreatureAnimation, elapsedMs: number, loop = a.loop): number {
  const total = animDurationMs(a);
  if (total <= 0) return 0;
  let t = loop ? ((elapsedMs % total) + total) % total : Math.min(Math.max(0, elapsedMs), total - 1);
  for (let i = 0; i < a.frames.length; i++) {
    t -= a.frames[i].durationMs;
    if (t < 0) return i;
  }
  return a.frames.length - 1;
}

/**
 * Direção desenhada + espelho para um Dir8. Os rips só têm 1 direção (SW ou S): leste vira espelho dela.
 * Com mais direções no manifest, usa a desenhada ou o espelho declarado.
 */
export function resolveFacing(m: CreatureManifest, animName: string, facing: Dir8): { dir: string; mirror: boolean } {
  const d = m.directions?.[animName];
  const drawn = d?.drawn ?? ["S"];
  if (drawn.includes(facing)) return { dir: facing, mirror: false };
  const src = d?.mirrored?.[facing];
  if (src && drawn.includes(src)) return { dir: src, mirror: true };
  if (d?.fallback === "nearest") return nearestFacing(drawn, facing);
  // v2 (4 direções do DS): diagonal cai no eixo horizontal (NE/SE → E, NW/SW → W).
  const four = to4(facing);
  if (four !== facing) {
    if (drawn.includes(four)) return { dir: four, mirror: false };
    const src4 = d?.mirrored?.[four];
    if (src4 && drawn.includes(src4)) return { dir: src4, mirror: true };
  }
  const isEast = (x: string) => x === "E" || x === "NE" || x === "SE";
  const isWest = (x: string) => x === "W" || x === "NW" || x === "SW";
  const base = drawn[0];
  const mirror = (isWest(base) && isEast(facing)) || (isEast(base) && isWest(facing));
  return { dir: base, mirror };
}

/** Ângulo (graus, horário a partir do S) de cada direção, e o espelho horizontal (E↔W). */
const ANGLE: Record<string, number> = { S: 0, SW: 45, W: 90, NW: 135, N: 180, NE: 225, E: 270, SE: 315 };
const MIRROR: Record<string, string> = { S: "S", N: "N", E: "W", W: "E", SE: "SW", SW: "SE", NE: "NW", NW: "NE" };

/**
 * Fallback "nearest" (criaturas de comparação com só S/SW desenhadas): a desenhada de menor distância angular até
 * `facing`, considerando também o espelho de cada uma; empate fica sem espelho e na ordem de `drawn`.
 * Ex. com S e SW: W → SW; E/SE → SW espelhado; N/NW → SW; NE → SW espelhado.
 */
export function nearestFacing(drawn: string[], facing: string): { dir: string; mirror: boolean } {
  const dist = (a: string, b: string) => {
    const d = Math.abs((ANGLE[a] ?? 0) - (ANGLE[b] ?? 0)) % 360;
    return Math.min(d, 360 - d);
  };
  let best = { dir: drawn[0] ?? "S", mirror: false };
  let bd = Infinity;
  for (const mirror of [false, true])
    for (const d of drawn) {
      const k = dist(mirror ? MIRROR[d] : d, facing);
      if (k < bd) [best, bd] = [{ dir: d, mirror }, k];
    }
  return best;
}

export type Dir4 = "S" | "N" | "E" | "W";

export function to4(d: Dir8): Dir4 {
  if (d === "N" || d === "S") return d;
  return d === "E" || d === "NE" || d === "SE" ? "E" : "W";
}

/** Easing (apresentação). */
export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - clamp01(t), 3),
  inCubic: (t: number) => Math.pow(clamp01(t), 3),
  inOutSine: (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2,
  outBack: (t: number) => {
    const c = 1.70158;
    const x = clamp01(t) - 1;
    return 1 + (c + 1) * x * x * x + c * x * x;
  },
};

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Deslocamento do atacante ao longo de `dir` (px, +avanço/−recuo) no tempo `t` desde o início do golpe.
 * Antecipação (recua ANTICIPATION_PX com ease-out) → avanço (ease-in) até LUNGE_PX no impacto → hit-stop
 * segura → volta (ease-in-out). `reach` limita o avanço quando o alvo está colado.
 */
export function attackLunge(t: number, hitAtMs: number, durationMs: number, reach = LUNGE_PX, launchAtMs?: number): number {
  const strikeAt = launchAtMs ?? hitAtMs; // projétil: o "impacto" do corpo é o lançamento
  const lunge = launchAtMs !== undefined ? Math.min(reach, 4) : reach;
  const antEnd = strikeAt * ANTICIPATION_FRAC;
  if (t < 0) return 0;
  if (t < antEnd) return -ANTICIPATION_PX * ease.outCubic(t / antEnd);
  if (t < strikeAt) return -ANTICIPATION_PX + (lunge + ANTICIPATION_PX) * ease.inCubic((t - antEnd) / Math.max(1, strikeAt - antEnd));
  const holdEnd = strikeAt + HIT_STOP_MS;
  if (t < holdEnd) return lunge;
  const end = Math.max(holdEnd + 1, durationMs);
  if (t < end) return lunge * (1 - ease.inOutSine((t - holdEnd) / (end - holdEnd)));
  return 0;
}

/** Knockback do alvo (px ao longo da direção do golpe): parado no hit-stop, empurrão ease-out, volta suave. */
export function knockback(t: number, px: number): number {
  if (t < HIT_STOP_MS) return 0;
  const u = t - HIT_STOP_MS;
  const out = 110;
  const back = HURT_VIS_MS - HIT_STOP_MS - out;
  if (u < out) return px * ease.outCubic(u / out);
  if (u < out + back) return px * (1 - ease.inOutSine((u - out) / back));
  return 0;
}
