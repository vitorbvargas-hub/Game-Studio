// Checagem headless do spike (fora do `npm test` principal):
//   npx vitest run --config arena-spike/vitest.config.ts
import { describe, expect, it } from "vitest";
import { loadPack } from "../src/packs";
import { aiInput, createArena, pickSkills, stepArena, NO_INPUT, type ArenaConfig, type ArenaInput } from "./arena";
import cfgJson from "./arena.json";

const cfg = cfgJson as ArenaConfig;
const content = loadPack("digimon-fan");
const P = { creatureId: "agumon", level: 10 };
const E = { creatureId: "gabumon", level: 10 };

function runAiVsAi(seed: number) {
  const st = createArena(content, cfg, P, E, seed);
  let ticks = 0;
  while (!st.outcome && ticks < cfg.timeLimitSec * cfg.simHz + 5) {
    const a = aiInput(st, cfg, 0);
    const b = aiInput(st, cfg, 1);
    stepArena(st, content, cfg, [a, b]);
    ticks++;
  }
  return st;
}

describe("arena spike", () => {
  it("lê stats e habilidades do pack digimon-fan", () => {
    const st = createArena(content, cfg, P, E, 1);
    const ag = st.fighters[0];
    expect(ag.name).toBe("Agumon");
    expect(ag.atk).toBe(Math.round(19 + 1.4 * 2));
    expect(ag.maxHp).toBe(Math.round(64 + 3.5 * 2) * cfg.hpMult);
    expect(pickSkills(content, "agumon").special.id).toBe("baby_flame");
    expect(pickSkills(content, "agumon").basic.id).toBe(content.balance.basicSkillId);
  });

  it("IA x IA termina com resultado e é determinística por seed", () => {
    const a = runAiVsAi(42);
    const b = runAiVsAi(42);
    expect(a.outcome).not.toBeNull();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("jogador parado perde para a IA (vitória/derrota funcionam)", () => {
    const st = createArena(content, cfg, P, E, 7);
    while (!st.outcome) stepArena(st, content, cfg, [NO_INPUT, aiInput(st, cfg, 1)]);
    expect(st.outcome).toBe("lose");
  });

  it("básico acerta adversário à frente e respeita recarga; especial cria projétil", () => {
    const st = createArena(content, cfg, P, E, 3);
    const [p, e] = st.fighters;
    e.x = p.x + 20;
    e.y = p.y;
    const hit: ArenaInput = { mx: 0, my: 0, basic: true, special: false };
    const ev1 = stepArena(st, content, cfg, [hit, NO_INPUT]);
    expect(ev1.some((x) => x.t === "hit" && x.target === 1)).toBe(true);
    const ev2 = stepArena(st, content, cfg, [hit, NO_INPUT]);
    expect(ev2.some((x) => x.t === "hit")).toBe(false);
    p.specialCd = 0;
    stepArena(st, content, cfg, [{ ...NO_INPUT, special: true }, NO_INPUT]);
    expect(st.projectiles.length + (st.fighters[1].hp < st.fighters[1].maxHp ? 1 : 0)).toBeGreaterThan(0);
  });
});
