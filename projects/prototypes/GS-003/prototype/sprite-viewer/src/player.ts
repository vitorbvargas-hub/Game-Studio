// Tempo de animação: qual quadro mostrar após `elapsedMs`, com durações por quadro.
// Independe de FPS do monitor (mesma regra do jogo, prototype/game/src/render/anim.ts).

export function totalMs(durations: number[]): number {
  return durations.reduce((a, b) => a + b, 0);
}

/** Índice do quadro em `elapsedMs`. loop=false trava no último quadro. */
export function frameAt(durations: number[], elapsedMs: number, loop: boolean): number {
  if (!durations.length) return 0;
  const total = totalMs(durations);
  if (total <= 0) return 0;
  let t = Math.max(0, elapsedMs);
  if (loop) t %= total;
  else if (t >= total) return durations.length - 1;
  for (let i = 0; i < durations.length; i++) {
    if (t < durations[i]) return i;
    t -= durations[i];
  }
  return durations.length - 1;
}

/** Instante (ms) em que o quadro `index` começa — usado ao clicar num quadro para continuar dali. */
export function frameStartMs(durations: number[], index: number): number {
  return totalMs(durations.slice(0, Math.max(0, Math.min(index, durations.length))));
}
