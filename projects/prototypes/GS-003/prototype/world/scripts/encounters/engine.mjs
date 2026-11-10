// GS-012 — regra de encontros aleatórios, pura e determinística (protótipo para o simulador de balanceamento).
// É a MESMA regra que o passo 5 porta para src/sim/encounters/ (LocalEncounterAuthority): mesmo RNG mulberry32
// do jogo (prototype/game/src/sim/rng.ts), mesmos campos da tabela. Nada aqui depende de render/, UI ou relógio real.

import { nextFloat, nextInt } from "../../../game/src/sim/rng.ts";

export const RARITIES = ["common", "uncommon", "rare", "very_rare"];
export const PERIODS = ["day", "dusk", "night", "dawn"];
export const WEATHERS = ["clear", "rain", "fog", "storm", "data_storm"];

/** Todas as chaves presentes em `cond` precisam valer (E); dentro de cada lista basta um valor (OU). */
export function matches(cond, ctx) {
  if (!cond) return true;
  if (cond.time && !cond.time.includes(ctx.time)) return false;
  if (cond.weather && !cond.weather.includes(ctx.weather)) return false;
  if (cond.areas && !cond.areas.includes(ctx.areaId)) return false;
  if (cond.terrains && !cond.terrains.includes(ctx.terrain)) return false;
  if (cond.event && !cond.event.some((e) => (ctx.events ?? []).includes(e))) return false;
  if (cond.questFlags && !cond.questFlags.every((f) => (ctx.questFlags ?? []).includes(f))) return false;
  if (cond.minTamerLevel && (ctx.tamerLevel ?? 1) < cond.minTamerLevel) return false;
  if (cond.minPartnerLevel && (ctx.partnerLevel ?? 1) < cond.minPartnerLevel) return false;
  if (cond.speciesRegistered && !cond.speciesRegistered.every((s) => (ctx.registered ?? []).includes(s))) return false;
  return true;
}

/** Entradas sorteáveis AGORA neste terreno/área/condição, já com o peso efetivo (modificadores aplicados). */
export function randomPool(table, ctx) {
  const out = [];
  for (const e of table.entries) {
    if (e.mode !== "random" && e.mode !== "both") continue;
    if (e.terrains && !e.terrains.includes(ctx.terrain)) continue;
    if (!matches(e.requires, ctx)) continue;
    let w = e.weight;
    for (const m of e.modifiers ?? []) if (matches(m.when, ctx)) w *= m.weightMult;
    if (w > 0) out.push({ entry: e, weight: w });
  }
  return out;
}

export function pick(rng, pool) {
  const total = pool.reduce((s, x) => s + x.weight, 0);
  let r = nextFloat(rng) * total;
  for (const x of pool) {
    r -= x.weight;
    if (r < 0) return x.entry;
  }
  return pool[pool.length - 1].entry;
}

/** Chance deste passo (sem a carência): taxa do terreno × área × região × condições + rampa anti-seca, com teto. */
export function stepChance(table, st, ctx) {
  const p = table.params;
  const t = table.terrains[ctx.terrain];
  if (!t) return 0;
  let mult = (ctx.areaRateMult ?? 1) * p.regionRateMult;
  for (const c of p.conditionRateMult ?? []) if (matches(c.when, ctx)) mult *= c.mult;
  const ramp = Math.max(0, st.stepsSince - p.ramp.start) * p.ramp.perStep;
  return Math.min(p.pMax, t.baseRate * mult + ramp);
}

export function newRollState(table, rng, nowSec = 0) {
  const g = table.params.graceSteps;
  return { stepsSince: 0, grace: nextInt(rng, g[0], g[1]), readyAtSec: nowSec };
}

/**
 * Um passo do Tamer (1 tile novo pisado). ctx = { terrain|null, areaId, areaRateMult, time, weather, nowSec, blocked?, ... }.
 * Devolve { kind: "none"|"blocked"|"grace"|"miss"|"empty"|"encounter", p?, entry?, level? }.
 * `encounter` e `empty` zeram o contador; quem chama avisa o fim do combate com endEncounter (intervalo mínimo).
 */
export function step(table, st, rng, ctx) {
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
export function endEncounter(table, st, nowSec) {
  st.readyAtSec = nowSec + table.params.minIntervalSec;
}
