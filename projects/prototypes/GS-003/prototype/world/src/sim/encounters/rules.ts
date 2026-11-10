// GS-012 passo 5: regra pura dos encontros aleatórios. Porta de scripts/encounters/engine.mjs (o protótipo do
// simulador de balanceamento), com os mesmos sorteios na mesma ordem: tests/encounters.test.ts confere que os dois
// dão o mesmo resultado passo a passo. Sem render, UI, relógio real ou Math.random.

import { nextFloat, nextInt } from "@game/src/sim/rng";

export const RARITIES = ["common", "uncommon", "rare", "very_rare"] as const;
export const PERIODS = ["day", "dusk", "night", "dawn"] as const;
export const WEATHERS = ["clear", "rain", "fog", "storm", "data_storm"] as const;
export type Rarity = (typeof RARITIES)[number];
export type Period = (typeof PERIODS)[number];
export type Weather = (typeof WEATHERS)[number];

export interface Cond {
  time?: string[];
  weather?: string[];
  areas?: string[];
  terrains?: string[];
  event?: string[];
  questFlags?: string[];
  minTamerLevel?: number;
  minPartnerLevel?: number;
  speciesRegistered?: string[];
}

export interface VisibleDef {
  spot: { x: number; y: number; wanderTiles: number; zoneRef?: string };
  behavior: "idle" | "ignore" | "flee" | "chase";
  detectRadiusTiles: number;
  loseRadiusTiles?: number;
  fightable: boolean;
  interaction: string;
  respawn: { kind: "timer" | "period" | "daily" | "never"; seconds?: number };
  maxAlive: number;
}

export interface EncounterEntry {
  id: string;
  speciesId: string;
  name: string;
  mode: "random" | "visible" | "both";
  rarity: Rarity;
  weight: number;
  levels: [number, number];
  terrains?: string[];
  requires?: Cond;
  modifiers?: { when: Cond; weightMult: number }[];
  shared?: boolean;
  visible?: VisibleDef;
}

export interface EncounterArea {
  id: string;
  terrain: string;
  zoneRef?: string;
  rect: { x: number; y: number; w: number; h: number };
  rateMult?: number;
}

export interface EncounterTable {
  schemaVersion: number;
  id: string;
  mapId: string;
  regionId?: string;
  params: {
    exposure: "steps" | "time";
    stepSeconds: number;
    graceSteps: [number, number];
    minIntervalSec: number;
    ramp: { start: number; perStep: number };
    pMax: number;
    emptyRustle: { chance: number; graceSteps: [number, number] };
    regionRateMult: number;
    conditionRateMult?: { when: Cond; mult: number }[];
    blockedWhen: string[];
    nearPortalTiles: number;
  };
  terrains: Record<string, { baseRate: number; label?: string; visual?: string }>;
  areas: EncounterArea[];
  entries: EncounterEntry[];
}

/** Contexto de um teste: onde o Tamer pisou e em que condições. */
export interface RollCtx {
  terrain: string | null;
  areaId?: string;
  areaRateMult?: number;
  time: string;
  weather: string;
  events?: string[];
  questFlags?: string[];
  tamerLevel?: number;
  partnerLevel?: number;
  registered?: string[];
  nowSec: number;
  blocked?: boolean;
}

/** Estado anti-sequência por jogador. */
export interface RollState {
  stepsSince: number;
  grace: number;
  readyAtSec: number;
}

export type StepResult =
  | { kind: "none" }
  | { kind: "blocked" }
  | { kind: "grace" }
  | { kind: "miss"; p: number }
  | { kind: "empty"; p: number }
  | { kind: "encounter"; p: number; entry: EncounterEntry; level: number };

type Rng = { rngState: number };

/** Todas as chaves presentes em `cond` precisam valer (E); dentro de cada lista basta um valor (OU). */
export function matches(cond: Cond | undefined, ctx: Partial<RollCtx>): boolean {
  if (!cond) return true;
  if (cond.time && !cond.time.includes(ctx.time ?? "")) return false;
  if (cond.weather && !cond.weather.includes(ctx.weather ?? "")) return false;
  if (cond.areas && !cond.areas.includes(ctx.areaId ?? "")) return false;
  if (cond.terrains && !cond.terrains.includes(ctx.terrain ?? "")) return false;
  if (cond.event && !cond.event.some((e) => (ctx.events ?? []).includes(e))) return false;
  if (cond.questFlags && !cond.questFlags.every((f) => (ctx.questFlags ?? []).includes(f))) return false;
  if (cond.minTamerLevel && (ctx.tamerLevel ?? 1) < cond.minTamerLevel) return false;
  if (cond.minPartnerLevel && (ctx.partnerLevel ?? 1) < cond.minPartnerLevel) return false;
  if (cond.speciesRegistered && !cond.speciesRegistered.every((s) => (ctx.registered ?? []).includes(s))) return false;
  return true;
}

/** Entradas sorteáveis AGORA neste terreno/área/condição, com o peso efetivo (modificadores aplicados). */
export function randomPool(table: EncounterTable, ctx: Partial<RollCtx>): { entry: EncounterEntry; weight: number }[] {
  const out: { entry: EncounterEntry; weight: number }[] = [];
  for (const e of table.entries) {
    if (e.mode !== "random" && e.mode !== "both") continue;
    if (e.terrains && !e.terrains.includes(ctx.terrain ?? "")) continue;
    if (!matches(e.requires, ctx)) continue;
    let w = e.weight;
    for (const m of e.modifiers ?? []) if (matches(m.when, ctx)) w *= m.weightMult;
    if (w > 0) out.push({ entry: e, weight: w });
  }
  return out;
}

export function pick(rng: Rng, pool: { entry: EncounterEntry; weight: number }[]): EncounterEntry {
  const total = pool.reduce((s, x) => s + x.weight, 0);
  let r = nextFloat(rng) * total;
  for (const x of pool) {
    r -= x.weight;
    if (r < 0) return x.entry;
  }
  return pool[pool.length - 1].entry;
}

/** Chance deste passo (sem a carência): taxa do terreno × área × região × condições + rampa anti-seca, com teto. */
export function stepChance(table: EncounterTable, st: RollState, ctx: Partial<RollCtx>): number {
  const p = table.params;
  const t = ctx.terrain ? table.terrains[ctx.terrain] : undefined;
  if (!t) return 0;
  let mult = (ctx.areaRateMult ?? 1) * p.regionRateMult;
  for (const c of p.conditionRateMult ?? []) if (matches(c.when, ctx)) mult *= c.mult;
  const ramp = Math.max(0, st.stepsSince - p.ramp.start) * p.ramp.perStep;
  return Math.min(p.pMax, t.baseRate * mult + ramp);
}

export function newRollState(table: EncounterTable, rng: Rng, nowSec = 0): RollState {
  const g = table.params.graceSteps;
  return { stepsSince: 0, grace: nextInt(rng, g[0], g[1]), readyAtSec: nowSec };
}

/**
 * Um passo do Tamer (1 tile novo pisado). `encounter` e `empty` zeram o contador; quem chama avisa o fim do combate
 * com endRoll (intervalo mínimo).
 */
export function step(table: EncounterTable, st: RollState, rng: Rng, ctx: RollCtx): StepResult {
  if (!ctx.terrain || !table.terrains[ctx.terrain]) return { kind: "none" };
  if (ctx.blocked) return { kind: "blocked" };
  st.stepsSince++;
  if (st.stepsSince <= st.grace || ctx.nowSec < st.readyAtSec) return { kind: "grace" };
  const p = stepChance(table, st, ctx);
  if (nextFloat(rng) >= p) return { kind: "miss", p };
  const prm = table.params;
  const pool = randomPool(table, ctx);
  if (!pool.length || nextFloat(rng) < prm.emptyRustle.chance) {
    st.stepsSince = 0;
    st.grace = nextInt(rng, prm.emptyRustle.graceSteps[0], prm.emptyRustle.graceSteps[1]);
    return { kind: "empty", p };
  }
  const entry = pick(rng, pool);
  const level = nextInt(rng, entry.levels[0], entry.levels[1]);
  st.stepsSince = 0;
  st.grace = nextInt(rng, prm.graceSteps[0], prm.graceSteps[1]);
  return { kind: "encounter", p, entry, level };
}

/** Fim do combate/fuga: o próximo teste só depois de minIntervalSec de jogo. */
export function endRoll(table: EncounterTable, st: RollState, nowSec: number): void {
  st.readyAtSec = nowSec + table.params.minIntervalSec;
}

/** Teto de encontros em `steps` passos novos (carência mínima entre dois): para os testes e o passeio automatizado. */
export function encounterCeiling(table: EncounterTable, steps: number): number {
  return Math.floor(steps / (table.params.graceSteps[0] + 1));
}
