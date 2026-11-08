// Escolha de frames por animação, compartilhada pelo renderer do idle e pelo spike da arena.
// Dados vêm do pacote (`anims`, `animFrameMs`); `sprite`/`spriteFrameMs` seguem valendo como idle.

import type { AnimName, SpriteRef, SpriteSource } from "../sim/types";

/** Duração padrão de cada frame quando o pacote não define. */
export const DEFAULT_FRAME_MS: Record<AnimName, number> = { idle: 500, walk: 120, attack: 80, hit: 100 };

const list = (ref: SpriteRef | undefined): string[] => (ref === undefined ? [] : typeof ref === "string" ? [ref] : ref);

/** Frames da animação pedida; sem ela, idle (`anims.idle` ou `sprite`). Lista vazia = sem sprite. */
export function animFrames(src: SpriteSource, name: AnimName): string[] {
  const own = list(src.anims?.[name]);
  if (own.length) return own;
  const idle = list(src.anims?.idle);
  return idle.length ? idle : list(src.sprite);
}

/** true se o pacote traz frames próprios para `name` (sem cair no idle). */
export function hasAnim(src: SpriteSource, name: AnimName): boolean {
  return name === "idle" ? animFrames(src, "idle").length > 0 : list(src.anims?.[name]).length > 0;
}

export function animFrameMs(src: SpriteSource, name: AnimName): number {
  return src.animFrameMs?.[name] ?? (name === "idle" ? src.spriteFrameMs : undefined) ?? DEFAULT_FRAME_MS[name];
}

/** Duração total de uma passada da animação (ms). */
export function animDurationMs(src: SpriteSource, name: AnimName): number {
  return animFrames(src, name).length * animFrameMs(src, name);
}

/** Frame de uma animação de uma passada (attack/hit) dado o tempo decorrido; trava no último frame. */
export function oneShotFrame(src: SpriteSource, name: AnimName, elapsedMs: number): string | undefined {
  const frames = animFrames(src, name);
  if (!frames.length) return undefined;
  return frames[Math.min(frames.length - 1, Math.max(0, Math.floor(elapsedMs / animFrameMs(src, name))))];
}
