// Todo content pack descoberto precisa ser jogável no mesmo motor, sem código específico.
import { describe, expect, it } from "vitest";
import { listPacks, loadPack } from "../src/packs";
import { areaUnlocked, bossUnlocked, challengeBoss, chooseDecision, chooseEvolution, chooseStarter, evolutionOptions, newGame as rawNewGame, step, stepN, travelTo } from "../src/sim/game";
import { applyOffline } from "../src/sim/offline";
import type { ContentBundle, GameState } from "../src/sim/types";

/** Jogo novo; se o pacote pede escolha de parceiro inicial, escolhe a 1ª opção (demais decisões ficam no automático). */
function newGame(c: ContentBundle, seed: number, now?: number): GameState {
  const s = rawNewGame(c, seed, now);
  if (s.starterPending) chooseStarter(c, s, c.theme.starterOptions![0]);
  return s;
}

/** Joga no automático: evolui pelo 1º ramo, viaja para a área de chefe quando liberar, desafia, decide sempre a opção 0. */
function playUntilFirstBoss(c: ContentBundle, s: GameState, maxTicks: number): number {
  for (let t = 0; t < maxTicks; t++) {
    if (Object.keys(s.bossesDefeated).length) return t;
    if (s.battle?.decision) chooseDecision(c, s, 0);
    for (const uid of [...s.pendingEvolutions]) {
      const p = s.party.find((x) => x.uid === uid)!;
      chooseEvolution(c, s, uid, evolutionOptions(c, p)[0].to);
    }
    if (s.battle?.kind !== "boss") {
      const target = Object.values(c.areas).find((a) => a.boss && !s.bossesDefeated[a.id] && areaUnlocked(c, s, a.id));
      if (target && s.areaId !== target.id) travelTo(c, s, target.id);
      if (bossUnlocked(c, s)) challengeBoss(c, s);
    }
    step(c, s);
  }
  return -1;
}

describe.each(listPacks().map((p) => p.id))("pack %s", (id) => {
  const c = loadPack(id);
  const TPM = 60_000 / c.balance.tickMs;

  it("time inicial de 1–3, 10 min sem wipe e com progresso", () => {
    const s = newGame(c, 1);
    expect(s.pack).toBe(id);
    stepN(c, s, 10 * TPM);
    expect(s.battlesLost).toBe(0);
    expect(s.bits).toBeGreaterThan(0);
    expect(s.party.every((p) => p.level > 1)).toBe(true);
  });

  it("chega ao primeiro chefe e o vence em até 2 h de jogo", () => {
    const s = newGame(c, 2);
    const t = playUntilFirstBoss(c, s, 120 * TPM);
    expect(t, "não venceu o chefe").toBeGreaterThan(0);
    // Derrotas fora da zona inicial são permitidas (balanceamento é do pacote) e nunca custam progresso.
    if (s.battlesLost) console.info(`[${id}] derrotas até o 1º chefe: ${s.battlesLost}`);
  });

  it("offline funciona com os números do pacote", () => {
    const s = newGame(c, 3, 0);
    const r = applyOffline(c, s, 3600_000)!;
    expect(r.bits).toBeGreaterThan(0);
  });
});
