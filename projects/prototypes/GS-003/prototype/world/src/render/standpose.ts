// Pose parada ("pés juntos"), feedback do fundador (fase 3, item 3). Os rips do DS e os Tamers têm `idle` de 1 quadro
// que aponta para um quadro de PASSADA do walk (ex.: idle = walk_S_01, com um pé à frente): ao parar, o boneco
// congelava no meio do passo. Aqui, por direção, escolhemos o quadro de repouso:
//   1. o quadro neutro do walk: no ciclo clássico A,B,A,C o quadro que se repete (A) é o de pés juntos;
//   2. senão, o idle quando ele NÃO é um quadro de passada do walk (idle desenhado de verdade);
//   3. senão, o quadro do walk de menor abertura das pernas, medida na faixa inferior do bbox opaco.
// Só apresentação: devolve um remapeamento de chaves do atlas (idle → repouso) aplicado quando a entidade está parada.

import type { AnimFrame, CreatureManifest } from "../assets/creatures";

/** Alfa (0..255) do pixel (x, y) da imagem que contém o quadro, em coordenadas do quadro. */
export type AlphaAt = (key: string) => ((x: number, y: number) => number) | undefined;

/** Quadro que se repete no ciclo do walk (A,B,A,C → A). Undefined se nenhum se repete ou se todos são iguais. */
export function neutralWalkKey(frames: AnimFrame[]): string | undefined {
  const count = new Map<string, number>();
  for (const f of frames) if (f.atlasKey) count.set(f.atlasKey, (count.get(f.atlasKey) ?? 0) + 1);
  if (count.size < 2) return undefined;
  let best: string | undefined;
  let n = 1;
  for (const [k, c] of count) if (c > n) [best, n] = [k, c];
  return best;
}

/** Fração inferior do bbox opaco onde ficam os pés. */
export const FOOT_BAND = 0.2;

/** Abertura das pernas: largura opaca na faixa inferior (FOOT_BAND) do bbox do quadro (w × h). */
export function legSpread(alpha: (x: number, y: number) => number, w: number, h: number): number {
  let top = -1;
  let bot = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (alpha(x, y) > 16) {
        if (top < 0) top = y;
        bot = y;
        break;
      }
  if (bot < 0) return Infinity;
  const band = Math.max(2, Math.round((bot - top + 1) * FOOT_BAND));
  let mn = Infinity;
  let mx = -1;
  for (let y = bot - band + 1; y <= bot; y++)
    for (let x = 0; x < w; x++)
      if (alpha(x, y) > 16) {
        mn = Math.min(mn, x);
        mx = Math.max(mx, x);
      }
  return mx < 0 ? Infinity : mx - mn + 1;
}

export interface StandPose {
  /** Direção desenhada → chave do quadro de repouso. */
  byDir: Record<string, string>;
  /** Como cada direção foi decidida (relatório/testes). */
  how: Record<string, "neutral" | "idle" | "bbox">;
}

/**
 * Quadro de repouso por direção desenhada do walk. `alphaAt` (opcional) dá acesso aos pixels para o fallback por
 * bbox; sem ele, sem quadro neutro e com idle de passada, a direção fica de fora (mantém o idle).
 */
export function standPose(m: CreatureManifest, alphaAt?: AlphaAt, sizeOf?: (key: string) => { w: number; h: number } | undefined): StandPose {
  const out: StandPose = { byDir: {}, how: {} };
  const walk = m.animations.walk;
  if (!walk) return out;
  const idle = m.animations.idle;
  const dirs = walk.dirFrames ? Object.keys(walk.dirFrames) : ["_"];
  for (const d of dirs) {
    const wf = walk.dirFrames?.[d] ?? walk.frames;
    const neutral = neutralWalkKey(wf);
    if (neutral) {
      out.byDir[d] = neutral;
      out.how[d] = "neutral";
      continue;
    }
    const idleKey = (idle?.dirFrames?.[d] ?? idle?.frames)?.[0]?.atlasKey;
    const walkKeys = new Set(wf.map((f) => f.atlasKey));
    if (idleKey && !walkKeys.has(idleKey)) {
      out.byDir[d] = idleKey;
      out.how[d] = "idle";
      continue;
    }
    if (!alphaAt || !sizeOf) continue;
    let best: string | undefined;
    let bestSpread = Infinity;
    for (const k of walkKeys) {
      if (!k) continue;
      const a = alphaAt(k);
      const sz = sizeOf(k);
      if (!a || !sz) continue;
      const s = legSpread(a, sz.w, sz.h);
      if (s < bestSpread) [best, bestSpread] = [k, s];
    }
    if (best) {
      out.byDir[d] = best;
      out.how[d] = "bbox";
    }
  }
  return out;
}

/**
 * Remapeamento idle → repouso: cada quadro do idle que é um quadro de PASSADA do walk na mesma direção vira o
 * quadro de repouso dessa direção. Idle desenhado (fora do walk) e idle de vários quadros (respiração) ficam como estão.
 */
export function standRemap(m: CreatureManifest, pose: StandPose): Map<string, string> {
  const out = new Map<string, string>();
  const idle = m.animations.idle;
  const walk = m.animations.walk;
  if (!idle || !walk) return out;
  for (const [d, key] of Object.entries(pose.byDir)) {
    const frames = d === "_" ? idle.frames : idle.dirFrames?.[d] ?? (idle.dirFrames ? undefined : idle.frames);
    if (!frames || frames.length !== 1) continue;
    const wk = new Set((walk.dirFrames?.[d] ?? walk.frames).map((f) => f.atlasKey));
    const k = frames[0].atlasKey;
    if (k && k !== key && wk.has(k)) out.set(k, key);
  }
  return out;
}
