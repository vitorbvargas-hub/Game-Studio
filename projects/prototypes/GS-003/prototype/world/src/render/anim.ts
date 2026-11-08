// Slots de animação por estado visual. Hoje os sprites oficiais só têm `idle`; os estados sem arte própria caem
// num efeito procedural. Quando o manifest ganhar `attack`, `hurt`, `walk` ou `defeat`, eles passam a ser usados
// sem mudar código (o hitAtMs passa a vir do evento `hitFrame` do manifest).
// Nada daqui decide dano: só QUANDO mostrar um resultado que a sim já confirmou.

import type { CreatureAnimation, CreatureManifest } from "../assets/creatures";
import type { Dir8, LogicState } from "../sim/types";

export type Procedural = "lunge" | "knockback" | "fade" | "bob" | null;

export interface AnimChoice {
  name: string;
  anim: CreatureAnimation;
  procedural: Procedural;
}

/** Ataque procedural: avanço até o impacto, recuo depois. */
export const PROCEDURAL_ATTACK_MS = 360;
export const PROCEDURAL_HIT_AT_MS = 160;
export const LUNGE_PX = 8;
/** HURT visual: flash branco + recuo de 2 px. */
export const HURT_VIS_MS = 220;
export const HURT_FLASH_MS = 67;
export const KNOCKBACK_PX = 2;
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

function realAnim(m: CreatureManifest, name: string | undefined): CreatureAnimation | undefined {
  if (!name || name === "idle") return undefined;
  const a = m.animations[name];
  return a && a.frames.length > 0 ? a : undefined;
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

/** Momento do impacto dentro do ataque. Real: soma das durações até o frame `hitFrame`. */
export function attackTiming(m: CreatureManifest | undefined): { hitAtMs: number; durationMs: number; procedural: boolean } {
  const a = m && realAnim(m, m.combatStates?.ATTACK ?? "attack");
  if (!a) return { hitAtMs: PROCEDURAL_HIT_AT_MS, durationMs: PROCEDURAL_ATTACK_MS, procedural: true };
  const hit = a.events?.find((e) => e.name === "hitFrame")?.frame ?? Math.floor(a.frames.length / 2);
  const hitAtMs = a.frames.slice(0, hit).reduce((s, f) => s + f.durationMs, 0);
  return { hitAtMs, durationMs: animDurationMs(a), procedural: false };
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
  const isEast = (x: string) => x === "E" || x === "NE" || x === "SE";
  const isWest = (x: string) => x === "W" || x === "NW" || x === "SW";
  const base = drawn[0];
  const mirror = (isWest(base) && isEast(facing)) || (isEast(base) && isWest(facing));
  return { dir: base, mirror };
}
