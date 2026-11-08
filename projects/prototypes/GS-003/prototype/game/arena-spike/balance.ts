// SPIKE — medição de equilíbrio IA x IA da arena (fora do `npm test`).
// Uso: npx vite-node arena-spike/balance.ts [lutasPorPar=400] [nivel=10]
// Lados alternados: na luta i, o primeiro monstro do par fica em idx0 se i é par, em idx1 se ímpar.
// Também separa a taxa por lado, para medir assimetria de posição.

import { loadPack } from "../src/packs";
import type { ContentBundle } from "../src/sim/types";
import { aiInput, createArena, stepArena, type ArenaConfig } from "./arena";
import cfgJson from "./arena.json";

export interface PairResult {
  a: string;
  b: string;
  fights: number;
  /** Vitórias de `a` / (lutas sem empate contam meia vitória para cada um). */
  winRateA: number;
  winRateAasIdx0: number;
  winRateAasIdx1: number;
  draws: number;
  avgSec: number;
}

export function runFight(content: ContentBundle, cfg: ArenaConfig, p0: string, p1: string, level: number, seed: number) {
  const st = createArena(content, cfg, { creatureId: p0, level }, { creatureId: p1, level }, seed);
  while (!st.outcome) stepArena(st, content, cfg, [aiInput(st, cfg, 0), aiInput(st, cfg, 1)]);
  return { outcome: st.outcome, ticks: st.tick };
}

export function measurePair(content: ContentBundle, cfg: ArenaConfig, a: string, b: string, fights: number, level = 10, seed0 = 1): PairResult {
  const score = [0, 0];
  const count = [0, 0];
  let draws = 0;
  let ticks = 0;
  for (let i = 0; i < fights; i++) {
    const side = i % 2; // lado de `a`
    const r = side === 0 ? runFight(content, cfg, a, b, level, seed0 + i) : runFight(content, cfg, b, a, level, seed0 + i);
    ticks += r.ticks;
    count[side]++;
    if (r.outcome === "draw") {
      draws++;
      score[side] += 0.5;
    } else if ((r.outcome === "win") === (side === 0)) score[side]++;
  }
  return {
    a,
    b,
    fights,
    winRateA: (score[0] + score[1]) / fights,
    winRateAasIdx0: score[0] / count[0],
    winRateAasIdx1: score[1] / count[1],
    draws,
    avgSec: ticks / fights / cfg.simHz,
  };
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

// Sem @types/node no projeto: process lido de globalThis (a checagem importa este módulo sem rodar o CLI).
const proc = (globalThis as { process?: { argv: string[]; env: Record<string, string | undefined> } }).process;
if (proc && !proc.env.VITEST) {
  const fights = Number(proc.argv[2] ?? 400);
  const level = Number(proc.argv[3] ?? 10);
  const content = loadPack("digimon-fan");
  const cfg = cfgJson as ArenaConfig;
  const ids = Object.values(content.creatures).filter((c) => c.anims?.idle).map((c) => c.id);
  console.log(`arena.affinity=${JSON.stringify(cfg.affinity ?? null)} · ${fights} lutas/par · Nv ${level} · lados alternados`);
  console.log("A x B | vitória A | A em idx0 | A em idx1 | empates | duração média");
  for (let i = 0; i < ids.length; i++)
    for (let j = i; j < ids.length; j++) {
      const r = measurePair(content, cfg, ids[i], ids[j], fights, level);
      console.log(`${r.a} x ${r.b} | ${pct(r.winRateA)} | ${pct(r.winRateAasIdx0)} | ${pct(r.winRateAasIdx1)} | ${r.draws} | ${r.avgSec.toFixed(1)} s`);
    }
}
