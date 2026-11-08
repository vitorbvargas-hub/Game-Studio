// Ritmo de decisões do onboarding (GDD_PROTOTYPE_B.md §"Onboarding — minuto a minuto"):
// 1ª decisão em até 2:00 e, nos primeiros 10 min, nunca mais de 3 min sem uma decisão nova.
// Simula um jogador que responde a cada decisão depois de um tempo de reação; nenhum nome de espécie é fixo.
import { describe, expect, it } from "vitest";
import { loadPack } from "../src/packs";
import {
  allocateTraining,
  chooseDecision,
  chooseEncounter,
  chooseEvolution,
  chooseStarter,
  DECISION_EVENTS,
  evolutionOptions,
  newGame,
  pendingChoices,
  step,
  TRAIN_STATS,
} from "../src/sim/game";
import { makeCombatant } from "../src/sim/battle";
import type { ContentBundle, GameEvent, GameState } from "../src/sim/types";

const PACK = "digimon-fan";
const REACTION_MS = 3_000;

interface Offer { atMs: number; kind: string }

/** Joga os primeiros `minutes` minutos: registra cada decisão nova oferecida e responde após REACTION_MS. */
function simulate(c: ContentBundle, seed: number, starterIndex: number, minutes: number) {
  const s: GameState = newGame(c, seed);
  const tickMs = c.balance.tickMs;
  const total = (minutes * 60_000) / tickMs;
  const offers: Offer[] = [];
  const events: GameEvent[] = [];
  // Momento (ms) em que o jogador responde a cada tipo de decisão aberta.
  const respondAt: Record<string, number> = {};
  if (s.starterPending) offers.push({ atMs: 0, kind: "starter" });
  let t = 0;
  for (let i = 0; i < total; i++) {
    t = i * tickMs;
    for (const kind of pendingChoices(s)) respondAt[kind] ??= t + REACTION_MS;
    for (const [kind, at] of Object.entries(respondAt)) {
      if (t < at) continue;
      delete respondAt[kind];
      const ev = respond(c, s, kind, starterIndex, i);
      events.push(...ev);
      record(ev, t, offers);
    }
    const ev = step(c, s);
    events.push(...ev);
    record(ev, t + tickMs, offers);
  }
  return { s, offers, events, endMs: total * tickMs };
}

function record(ev: GameEvent[], atMs: number, offers: Offer[]) {
  for (const e of ev) if ((DECISION_EVENTS as readonly string[]).includes(e.t)) offers.push({ atMs, kind: e.t });
}

function respond(c: ContentBundle, s: GameState, kind: string, starterIndex: number, i: number): GameEvent[] {
  switch (kind) {
    case "starter":
      return chooseStarter(c, s, c.theme.starterOptions![starterIndex]);
    case "encounter":
      return s.encounter ? chooseEncounter(c, s, i % s.encounter.options.length) : [];
    case "training": {
      const out: GameEvent[] = [];
      for (const p of s.party) while ((p.trainPoints ?? 0) > 0) out.push(...allocateTraining(c, s, p.uid, TRAIN_STATS[i % 3]));
      return out;
    }
    case "evolution":
      return [...s.pendingEvolutions].flatMap((uid) => {
        const p = s.party.find((x) => x.uid === uid)!;
        return chooseEvolution(c, s, uid, evolutionOptions(c, p)[0].to);
      });
    case "boss_sync":
      return s.battle?.decision ? chooseDecision(c, s, 0) : [];
  }
  return [];
}

describe(`onboarding do pack ${PACK}: ritmo de decisões nos primeiros 10 min`, () => {
  const c = loadPack(PACK);
  const starters = c.theme.starterOptions ?? [];

  it("o pacote liga as decisões do onboarding por dados", () => {
    expect(starters).toHaveLength(3);
    expect(c.balance.scan).toBeDefined();
    expect(c.balance.training).toBeDefined();
    expect(c.areas[c.theme.startingAreaId].encounterChoice).toBeDefined();
  });

  const cases = starters.flatMap((_, si) => [11, 22, 33].map((seed) => [si, seed] as const));
  it.each(cases)("parceiro %i, seed %i: 1ª decisão ≤ 2:00, intervalo ≤ 3:00, sem derrota", (si, seed) => {
    const { s, offers, events, endMs } = simulate(c, seed, si, 10);
    const times = offers.map((o) => o.atMs);
    // Decisão #1 (parceiro) abre em 0:00; a 1ª escolha significativa (Varredura) precisa vir até 2:00.
    expect(times[0]).toBeLessThanOrEqual(120_000);
    const firstEncounter = offers.find((o) => o.kind === "encounter_choice");
    expect(firstEncounter, "sem escolha de encontro").toBeDefined();
    expect(firstEncounter!.atMs).toBeLessThanOrEqual(120_000);
    const gaps = [...times, endMs].slice(1).map((x, i) => x - times[i]);
    if ((globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.GS_PACING_LOG) console.log(`p${si} s${seed}: 1º encontro ${firstEncounter!.atMs / 1000}s, maior intervalo ${Math.max(...gaps) / 1000}s, ${offers.length} decisões, time ${s.party.map((p) => p.level).join("/")}, recrutas ${events.filter((e) => e.t === "recruited").length}`);
    expect(Math.max(...gaps), `decisões em ${times.map((x) => (x / 1000).toFixed(0)).join(",")}s`).toBeLessThanOrEqual(180_000);
    // Os 3 tipos pedidos aparecem: parceiro, Varredura (escolha + recrutamento) e treino.
    expect(offers.some((o) => o.kind === "training_ready")).toBe(true);
    expect(events.some((e) => e.t === "recruited")).toBe(true);
    expect(s.party.length).toBeGreaterThan(1);
    // Pilar "nunca morto por surpresa" no começo.
    expect(s.battlesLost).toBe(0);
  });

  it("sem resposta do jogador o idle não trava: encontro auto-escolhido e progresso continua", () => {
    const s = newGame(c, 5);
    chooseStarter(c, s, starters[0]);
    for (let i = 0; i < (10 * 60_000) / c.balance.tickMs; i++) step(c, s);
    expect(s.encountersChosen).toBeGreaterThan(0);
    expect(s.party.every((p) => p.level > 1)).toBe(true);
    expect(s.battlesLost).toBe(0);
  });

  it("parceiro inicial: mundo parado até a escolha; escolha inválida é recusada", () => {
    const s = newGame(c, 1);
    expect(s.party).toHaveLength(0);
    for (let i = 0; i < 50; i++) step(c, s);
    expect(s.tick).toBe(0);
    expect(() => chooseStarter(c, s, "nao_existe")).toThrow();
    chooseStarter(c, s, starters[1]);
    expect(s.party.map((p) => p.speciesId)).toEqual([starters[1]]);
    expect(() => chooseStarter(c, s, starters[0])).toThrow();
  });

  it("Ponto de Treino aumenta o stat escolhido", () => {
    const s = newGame(c, 1);
    chooseStarter(c, s, starters[0]);
    const p = s.party[0];
    p.trainPoints = 2;
    allocateTraining(c, s, p.uid, "atk");
    allocateTraining(c, s, p.uid, "atk");
    expect(p.train).toEqual({ atk: 2 });
    expect(p.trainPoints).toBe(0);
    expect(() => allocateTraining(c, s, p.uid, "def")).toThrow();
    // O bônus entra no combatente da próxima onda.
    const base = makeCombatant(c.creatures[p.speciesId], "x", "ally", p.level).atk;
    const s2 = s;
    while (!s2.battle) step(c, s2);
    const ally = s2.battle!.allies.find((a) => a.uid === p.uid)!;
    expect(ally.atk).toBe(Math.round(base * (1 + (2 * c.balance.training!.pctPerPoint) / 100)));
  });

  it("Varredura: 4 encontros levam a 100% e a vitória seguinte recruta (determinístico)", () => {
    const s = newGame(c, 3);
    chooseStarter(c, s, starters[0]);
    const recruitedAt: Record<string, number> = {};
    for (let i = 0; i < 20 * 600 && s.party.length < 3; i++) {
      if (s.encounter) chooseEncounter(c, s, 0);
      for (const e of step(c, s)) if (e.t === "recruited") recruitedAt[e.speciesId] = i;
    }
    expect(s.party).toHaveLength(3);
    expect(new Set(s.party.map((p) => p.speciesId)).size).toBe(3);
    expect(Object.keys(s.scan)).toHaveLength(0);
  });
});
