#!/usr/bin/env node
// GS-012 — simulador de balanceamento dos encontros aleatórios (ferramenta interna de debug, GS-012 §11).
// Lê a tabela de dados, valida contra src/data/world-species.json e simula N passos em vegetação.
//
// Uso (de prototype/world/):
//   node scripts/encounters/sim.mjs                         # tabela da floresta, 200 000 passos por cenário
//   node scripts/encounters/sim.mjs --steps 50000 --seed 7
//   node scripts/encounters/sim.mjs --set terrains.tall_grass.baseRate=0.05 --set params.graceSteps=[10,16]
//   node scripts/encounters/sim.mjs --naive                 # compara com a regra ingênua (10%/passo, sem carência)
//   node scripts/encounters/sim.mjs --check                 # só valida a tabela
//   node scripts/encounters/sim.mjs --json                  # saída em JSON
// --set mexe só na cópia em memória: os dados de produção nunca são alterados por esta ferramenta.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { nextInt } from "../../../game/src/sim/rng.ts";
import { endEncounter, newRollState, PERIODS, RARITIES, randomPool, step, WEATHERS } from "./engine.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORLD = resolve(HERE, "../..");
const GS003 = resolve(WORLD, "../..");
const DEFAULT_TABLE = resolve(GS003, "quality-overhaul/encounters/tables/digimon-forest-01.json");

// ---------- argumentos ----------
const args = process.argv.slice(2);
const opt = { steps: 200_000, seed: 12012, table: DEFAULT_TABLE, set: [], naive: false, check: false, json: false, combatSec: 15 };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--steps") opt.steps = Number(args[++i]);
  else if (a === "--seed") opt.seed = Number(args[++i]);
  else if (a === "--table") opt.table = resolve(args[++i]);
  else if (a === "--set") opt.set.push(args[++i]);
  else if (a === "--combat-sec") opt.combatSec = Number(args[++i]);
  else if (a === "--naive") opt.naive = true;
  else if (a === "--check") opt.check = true;
  else if (a === "--json") opt.json = true;
  else throw new Error(`argumento desconhecido: ${a}`);
}

const table = JSON.parse(readFileSync(opt.table, "utf8"));
for (const s of opt.set) {
  const [path, raw] = s.split("=");
  const keys = path.split(".");
  let o = table;
  for (const k of keys.slice(0, -1)) o = o[k];
  o[keys.at(-1)] = JSON.parse(raw);
}

// ---------- validação (espécies reais, enums, faixas, referências) ----------
function validate(t) {
  const errs = [];
  const species = new Set(JSON.parse(readFileSync(resolve(WORLD, "src/data/world-species.json"), "utf8")).species.map((s) => s.id));
  const terrains = new Set(Object.keys(t.terrains));
  const areas = new Set(t.areas.map((a) => a.id));
  const ids = new Set();
  for (const a of t.areas) if (!terrains.has(a.terrain)) errs.push(`área ${a.id}: terreno '${a.terrain}' não existe`);
  const condCheck = (where, c) => {
    if (!c) return;
    for (const p of c.time ?? []) if (!PERIODS.includes(p)) errs.push(`${where}: horário '${p}' inválido`);
    for (const w of c.weather ?? []) if (!WEATHERS.includes(w)) errs.push(`${where}: clima '${w}' inválido`);
    for (const a of c.areas ?? []) if (!areas.has(a)) errs.push(`${where}: área '${a}' não existe`);
    for (const x of c.terrains ?? []) if (!terrains.has(x)) errs.push(`${where}: terreno '${x}' não existe`);
  };
  for (const e of t.entries) {
    const w = `entrada ${e.id}`;
    if (ids.has(e.id)) errs.push(`${w}: id repetido`);
    ids.add(e.id);
    if (!species.has(e.speciesId)) errs.push(`${w}: espécie ${e.speciesId} não existe em world-species.json`);
    if (!RARITIES.includes(e.rarity)) errs.push(`${w}: raridade '${e.rarity}' inválida`);
    if (!(e.weight > 0)) errs.push(`${w}: peso precisa ser > 0`);
    if (!(e.levels?.[0] >= 1 && e.levels[0] <= e.levels[1])) errs.push(`${w}: faixa de nível inválida`);
    for (const x of e.terrains ?? []) if (!terrains.has(x)) errs.push(`${w}: terreno '${x}' não existe`);
    condCheck(w, e.requires);
    for (const m of e.modifiers ?? []) condCheck(`${w} (modificador)`, m.when);
    if ((e.mode === "visible" || e.mode === "both") && !e.visible) errs.push(`${w}: modo ${e.mode} sem bloco 'visible'`);
  }
  const g = t.params.graceSteps;
  if (!(g[0] <= g[1])) errs.push("params.graceSteps invertido");
  // Toda combinação terreno × horário × clima (sem requisitos de missão/evento) precisa ter pelo menos 1 espécie
  // comum: sem isso o jogador cai em "só farfalhar" ou só raros.
  for (const a of t.areas)
    for (const time of PERIODS)
      for (const weather of ["clear", "rain", "fog"]) {
        const pool = randomPool(t, { terrain: a.terrain, areaId: a.id, time, weather, partnerLevel: 99 });
        if (!pool.some((x) => x.entry.rarity === "common")) errs.push(`área ${a.id} (${time}/${weather}): nenhuma espécie comum`);
      }
  return errs;
}

const errors = validate(table);
if (errors.length) {
  console.error(`tabela ${table.id}: ${errors.length} erro(s)`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
if (opt.check) {
  console.log(`tabela ${table.id}: ok (${table.entries.length} entradas, ${table.areas.length} áreas)`);
  process.exit(0);
}

// ---------- regra ingênua de comparação (o que NÃO queremos) ----------
const NAIVE = {
  ...table,
  params: { ...table.params, graceSteps: [0, 0], minIntervalSec: 0, ramp: { start: 1e9, perStep: 0 }, pMax: 1, emptyRustle: { chance: 0, graceSteps: [0, 0] } },
  terrains: Object.fromEntries(Object.keys(table.terrains).map((k) => [k, { baseRate: 0.1 }])),
};

// ---------- simulação ----------
const pct = (a, q) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};

/**
 * Anda `steps` passos. `route(i)` devolve o terreno/área do passo i (null = trilha, sem vegetação).
 * Tempo: cada passo = stepSeconds; cada encontro soma combatSec (o relógio do jogo anda durante o combate).
 */
function run(t, ctxBase, steps, seed, route) {
  const rng = { rngState: seed >>> 0 };
  const st = newRollState(t, rng, 0);
  let now = 0;
  let vegSteps = 0;
  let walkSec = 0;
  let sinceLast = 0; // passos em vegetação desde o último encontro (farfalhar não zera esta métrica)
  const gaps = [];
  const encVegIdx = [];
  const byRarity = Object.fromEntries(RARITIES.map((r) => [r, 0]));
  const bySpecies = {};
  let empties = 0;
  let enc = 0;
  for (let i = 0; i < steps; i++) {
    const where = route(i);
    now += t.params.stepSeconds;
    walkSec += t.params.stepSeconds;
    if (!where) continue;
    vegSteps++;
    sinceLast++;
    const r = step(t, st, rng, { ...ctxBase, ...where, nowSec: now });
    if (r.kind === "empty") empties++;
    if (r.kind !== "encounter") continue;
    enc++;
    gaps.push(sinceLast);
    encVegIdx.push(vegSteps);
    sinceLast = 0;
    byRarity[r.entry.rarity]++;
    const k = r.entry.name ?? r.entry.speciesId;
    bySpecies[k] = (bySpecies[k] ?? 0) + 1;
    now += opt.combatSec;
    endEncounter(t, st, now);
  }
  // maior sequência SEM encontro (inclui a seca final) e maior rajada COM encontros (todas as distâncias <= 20 passos)
  const maxDry = Math.max(sinceLast, ...gaps);
  let burst = enc ? 1 : 0;
  let cur = 1;
  for (let i = 1; i < gaps.length; i++) {
    cur = gaps[i] <= 20 ? cur + 1 : 1;
    burst = Math.max(burst, cur);
  }
  // mais encontros dentro de uma janela de 100 passos em vegetação
  let win = 0;
  for (let i = 0, j = 0; i < encVegIdx.length; i++) {
    while (encVegIdx[i] - encVegIdx[j] >= 100) j++;
    win = Math.max(win, i - j + 1);
  }
  const shareR = Object.fromEntries(RARITIES.map((r) => [r, enc ? +((100 * byRarity[r]) / enc).toFixed(1) : 0]));
  const shareS = Object.fromEntries(Object.entries(bySpecies).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, +((100 * v) / enc).toFixed(1)]));
  return {
    vegSteps,
    encounters: enc,
    empties,
    per100VegSteps: +((100 * enc) / vegSteps).toFixed(2),
    meanGapSteps: +(gaps.reduce((s, x) => s + x, 0) / Math.max(1, gaps.length)).toFixed(1),
    gapP10: pct(gaps, 0.1),
    gapP50: pct(gaps, 0.5),
    gapP90: pct(gaps, 0.9),
    gapP99: pct(gaps, 0.99),
    minGapSteps: gaps.length ? Math.min(...gaps) : 0,
    maxDrySteps: maxDry,
    maxBurst20: burst,
    max100Window: win,
    meanGapSec: +((gaps.reduce((s, x) => s + x, 0) / Math.max(1, gaps.length)) * t.params.stepSeconds).toFixed(1),
    perWalkMinute: +((60 * enc) / walkSec).toFixed(2),
    rarity: shareR,
    species: shareS,
  };
}

const areaById = Object.fromEntries(table.areas.map((a) => [a.id, a]));
const whereOf = (a) => ({ terrain: a.terrain, areaId: a.id, areaRateMult: a.rateMult ?? 1 });
/** Rodízio entre todas as áreas (blocos de 12 passos em cada), para a distribuição da floresta inteira. */
const allAreas = (i) => whereOf(table.areas[Math.floor(i / 12) % table.areas.length]);
/** Rota realista: trechos de vegetação de 4–14 passos alternados com 6–30 passos de trilha (sorteados uma vez). */
function realisticRoute(seed, steps) {
  const rng = { rngState: (seed ^ 0x9e3779b9) >>> 0 };
  const plan = new Array(steps);
  let i = 0;
  let k = 0;
  while (i < steps) {
    const veg = nextInt(rng, 4, 14);
    const a = table.areas[k++ % table.areas.length];
    for (let j = 0; j < veg && i < steps; j++) plan[i++] = whereOf(a);
    const path = nextInt(rng, 6, 30);
    for (let j = 0; j < path && i < steps; j++) plan[i++] = null;
  }
  return (n) => plan[n];
}

const PLAYER = { partnerLevel: 6, tamerLevel: 3, questFlags: [], events: [] };
const CONDS = [
  ["dia, céu limpo", { time: "day", weather: "clear" }],
  ["anoitecer, limpo", { time: "dusk", weather: "clear" }],
  ["noite, limpo", { time: "night", weather: "clear" }],
  ["dia, chuva", { time: "day", weather: "rain" }],
  ["noite, chuva", { time: "night", weather: "rain" }],
  ["noite, neblina", { time: "night", weather: "fog" }],
];

const out = { table: table.id, seed: opt.seed, steps: opt.steps, combatSec: opt.combatSec, overrides: opt.set, scenarios: [] };
const add = (name, t, ctx, route) => out.scenarios.push({ name, ...run(t, { ...PLAYER, ...ctx }, opt.steps, opt.seed, route) });

for (const [label, c] of CONDS) add(`grama contínua (todas as áreas) · ${label}`, table, c, allAreas);
for (const a of table.areas) add(`só ${a.id} (${a.terrain}) · dia, limpo`, table, CONDS[0][1], () => whereOf(areaById[a.id]));
add("rota realista (trilha + vegetação) · dia, limpo", table, CONDS[0][1], realisticRoute(opt.seed, opt.steps));
if (opt.naive) {
  add("INGÊNUA 10%/passo · grama contínua · dia, limpo", NAIVE, CONDS[0][1], allAreas);
  add("INGÊNUA 10%/passo · rota realista · dia, limpo", NAIVE, CONDS[0][1], realisticRoute(opt.seed, opt.steps));
}

if (opt.json) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`tabela ${table.id} · seed ${opt.seed} · ${opt.steps} passos/cenário · combate ${opt.combatSec}s · passo ${table.params.stepSeconds}s`);
  if (opt.set.length) console.log(`overrides: ${opt.set.join("  ")}`);
  for (const s of out.scenarios) {
    console.log(`\n## ${s.name}`);
    console.log(
      `  encontros ${s.encounters} (+${s.empties} farfalhar vazio) · ${s.per100VegSteps}/100 passos em vegetação · ${s.perWalkMinute}/min andando`,
    );
    console.log(
      `  intervalo (passos em vegetação): média ${s.meanGapSteps} (~${s.meanGapSec}s) · p10 ${s.gapP10} · p50 ${s.gapP50} · p90 ${s.gapP90} · p99 ${s.gapP99} · mín ${s.minGapSteps}`,
    );
    console.log(`  maior seca: ${s.maxDrySteps} passos · maior rajada (gaps<=20): ${s.maxBurst20} · máx em 100 passos: ${s.max100Window}`);
    console.log(`  raridade %: ${RARITIES.map((r) => `${r} ${s.rarity[r]}`).join(" · ")}`);
    console.log(`  espécies %: ${Object.entries(s.species).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  }
}
