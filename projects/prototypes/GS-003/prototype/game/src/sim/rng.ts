// PRNG determinístico (mulberry32). O estado é um uint32 guardado no GameState,
// então o mesmo save + mesmos comandos sempre produzem o mesmo resultado.

export interface RngHolder {
  rngState: number;
}

export function nextU32(h: RngHolder): number {
  h.rngState = (h.rngState + 0x6d2b79f5) >>> 0;
  let t = h.rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return (t ^ (t >>> 14)) >>> 0;
}

/** Float em [0, 1). */
export function nextFloat(h: RngHolder): number {
  return nextU32(h) / 4294967296;
}

/** Inteiro em [min, max] (inclusivo). */
export function nextInt(h: RngHolder, min: number, max: number): number {
  return min + Math.floor(nextFloat(h) * (max - min + 1));
}

export function pickWeighted<T extends { weight: number }>(h: RngHolder, items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = nextFloat(h) * total;
  for (const item of items) {
    r -= item.weight;
    if (r < 0) return item;
  }
  return items[items.length - 1];
}
