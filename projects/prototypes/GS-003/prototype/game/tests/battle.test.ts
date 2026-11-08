import { describe, expect, it } from "vitest";
import { bossUnlocked, challengeBoss, chooseDecision, chooseEvolution, grantXp, maxHpOf, newGame, step, stepN } from "../src/sim/game";
import { createBattle, makeCombatant, stepBattle } from "../src/sim/battle";
import { xpToNext } from "../src/sim/formulas";
import type { GameEvent, GameState } from "../src/sim/types";
import { enginePack } from "./helpers";

const c = enginePack();
const TICKS_PER_MIN = 60_000 / c.balance.tickMs;

describe("loop automático 3v3", () => {
  it("é determinístico: mesma semente => mesmo estado", () => {
    const a = newGame(c, 123), b = newGame(c, 123), d = newGame(c, 999);
    stepN(c, a, 3000); stepN(c, b, 3000); stepN(c, d, 3000);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toEqual(JSON.stringify(d));
  });

  it("monta batalhas 3 aliados vs 1–3 inimigos e vence ondas da zona 1", () => {
    const s = newGame(c, 1);
    const ev = stepN(c, s, 2);
    expect(ev.some((e) => e.t === "battle_start")).toBe(true);
    expect(s.battle!.allies).toHaveLength(3);
    expect(s.battle!.enemies.length).toBeGreaterThanOrEqual(1);
    expect(s.battle!.enemies.length).toBeLessThanOrEqual(3);
    stepN(c, s, 5 * TICKS_PER_MIN);
    expect(s.winsByArea["zona_01"]).toBeGreaterThan(10);
    expect(s.bits).toBeGreaterThan(0);
  });

  it("ganha XP e sobe de nível", () => {
    const s = newGame(c, 2);
    const ev = stepN(c, s, 5 * TICKS_PER_MIN);
    expect(ev.some((e) => e.t === "level_up")).toBe(true);
    expect(s.party.every((p) => p.level > 1)).toBe(true);
  });

  it("zona inicial não causa wipe nos primeiros 10 minutos", () => {
    const s = newGame(c, 3);
    stepN(c, s, 10 * TICKS_PER_MIN);
    expect(s.battlesLost).toBe(0);
  });

  it("derrota não custa progresso (XP, nível, bits mantidos; time curado)", () => {
    const s = newGame(c, 4);
    stepN(c, s, 2 * TICKS_PER_MIN);
    while (s.battle === null) step(c, s);
    const snapshot = JSON.stringify({ party: s.party, bits: s.bits });
    for (const a of s.battle!.allies) a.hp = 1;
    for (const e of s.battle!.enemies) { e.atk = 9999; e.hp = e.maxHp = 99999; }
    let guard = 0;
    while (s.battle && guard++ < 5000) step(c, s);
    expect(s.battlesLost).toBe(1);
    expect(JSON.stringify({ party: s.party, bits: s.bits })).toEqual(snapshot);
    for (const p of s.party) expect(s.partyHp[p.uid]).toBe(maxHpOf(c, p));
  });

  it("afinidade vantajosa causa mais dano", () => {
    const run = (enemyId: string) => {
      const ally = makeCombatant(c.creatures["pixelume"], "a", "ally", 5); // sinal
      const foe = makeCombatant(c.enemies[enemyId], "e", "enemy", 5);
      foe.def = 0; foe.hp = foe.maxHp = 100000; foe.spd = 0;
      const b = createBattle("wave", "zona_01", [ally], [foe]);
      const rng = { rngState: 5 };
      const evs: GameEvent[] = [];
      for (let i = 0; i < 200; i++) evs.push(...stepBattle(c, b, rng));
      return evs.flatMap((e) => (e.t === "act" ? e.hits : [])).reduce((s, h) => s + h.amount, 0);
    };
    // estavel > erratico (1.25x), estavel < fluido (0.8x) => razão ~1.56
    expect(run("noise_mite")).toBeGreaterThan(run("loop_worm") * 1.4);
  });
});

function farmUntilBoss(seed: number): GameState {
  const s = newGame(c, seed);
  let guard = 0;
  while (!bossUnlocked(c, s) && guard++ < 50_000) step(c, s);
  return s;
}

describe("chefe com pausa de decisão", () => {
  it("fica bloqueado até N vitórias", () => {
    const s = newGame(c, 10);
    expect(() => challengeBoss(c, s)).toThrow(/bloqueado/);
    const u = farmUntilBoss(10);
    expect(bossUnlocked(c, u)).toBe(true);
  });

  it("pausa no início e em 50% de HP; mundo congela até a escolha", () => {
    const s = farmUntilBoss(11);
    challengeBoss(c, s);
    const ev = step(c, s);
    expect(ev[0]).toMatchObject({ t: "decision", decision: { thresholdPct: 100 } });
    const frozen = JSON.stringify(s);
    stepN(c, s, 100);
    expect(JSON.stringify(s)).toEqual(frozen);
    chooseDecision(c, s, 2); // escudo
    expect(s.battle!.decision).toBeNull();
    expect(s.battle!.allies.every((a) => a.guardTicks > 0)).toBe(true);

    let guard = 0, second: GameEvent | undefined;
    while (!second && s.battle && guard++ < 20_000) second = step(c, s).find((e) => e.t === "decision");
    expect(second).toMatchObject({ decision: { thresholdPct: 50 } });
  });

  it("chefe tutorial (lethal=false) nunca derruba aliados e pode ser vencido", () => {
    const s = farmUntilBoss(12);
    challengeBoss(c, s);
    let guard = 0;
    let minHp = Infinity;
    while (s.battle && guard++ < 50_000) {
      if (s.battle.decision) { chooseDecision(c, s, 0); continue; }
      step(c, s);
      if (s.battle) minHp = Math.min(minHp, ...s.battle.allies.map((a) => a.hp));
    }
    expect(minHp).toBeGreaterThanOrEqual(1);
    expect(s.bossesDefeated["zona_01"]).toBe(true);
    expect(s.battlesLost).toBe(0);
  });

  it("rejeita opção inválida e decisão inexistente", () => {
    const s = farmUntilBoss(13);
    expect(() => chooseDecision(c, s, 0)).toThrow();
    challengeBoss(c, s);
    step(c, s);
    expect(() => chooseDecision(c, s, 9)).toThrow(/inválida/);
  });
});

describe("evolução ramificada (decisão)", () => {
  it("adulto oferece 2 ramos (decisão)", () => {
    expect(c.creatures["pixelar"].evolutions).toHaveLength(2);
  });

  it("fica pendente no nível requerido e aplica o ramo escolhido", () => {
    const s = newGame(c, 20);
    const p = s.party[0];
    const need = c.creatures[p.speciesId].evolutions![0].level;
    let xp = 0;
    for (let l = p.level; l < need; l++) xp += xpToNext(c.balance, l);
    expect(grantXp(c, s, p, xp - 1).some((e) => e.t === "evolution_ready")).toBe(false);
    const ev = grantXp(c, s, p, 1);
    expect(p.level).toBeGreaterThanOrEqual(8);
    expect(ev.some((e) => e.t === "evolution_ready")).toBe(true);
    expect(s.pendingEvolutions).toContain(p.uid);
    const to = c.creatures[p.speciesId].evolutions![0].to;
    expect(() => chooseEvolution(c, s, p.uid, "ferroguda")).toThrow();
    chooseEvolution(c, s, p.uid, to);
    expect(p.speciesId).toBe(to);
    expect(s.pendingEvolutions).not.toContain(p.uid);
  });
});
