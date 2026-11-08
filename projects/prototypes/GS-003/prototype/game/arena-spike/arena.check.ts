// Checagem headless do spike (fora do `npm test` principal):
//   npx vitest run --config arena-spike/vitest.config.ts
import { describe, expect, it } from "vitest";
import { loadPack } from "../src/packs";
import { aiInput, createArena, defaultMatchup, pickSkills, stepArena, NO_INPUT, type ArenaConfig, type ArenaInput } from "./arena";
import cfgJson from "./arena.json";
import { ArenaRenderer } from "./render";

const cfg = cfgJson as ArenaConfig;
const content = loadPack("digimon-fan");
// Ids vêm do pacote: jogador = lado SEM vantagem de afinidade do par padrão (o código não conhece espécies).
const [strong, weak] = defaultMatchup(content);
const P = { creatureId: weak, level: 10 };
const E = { creatureId: strong, level: 10 };

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
    const f = st.fighters[0];
    const def = content.creatures[weak];
    const lv = P.level - (def.baseLevel ?? 1);
    expect(f.name).toBe(def.name);
    expect(f.atk).toBe(Math.round(def.base.atk + def.growth.atk * lv));
    expect(f.maxHp).toBe(Math.round(def.base.hp + def.growth.hp * lv) * cfg.hpMult);
    const special = def.skills.find((s) => s !== content.balance.basicSkillId);
    expect(pickSkills(content, weak).special.id).toBe(special);
    expect(pickSkills(content, weak).basic.id).toBe(content.balance.basicSkillId);
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

  it("pacote declara idle/walk/attack/hit e o render escolhe a animação pelo estado", () => {
    for (const id of [strong, weak]) {
      const a = content.creatures[id].anims!;
      expect([a.idle?.length, a.walk?.length, a.attack?.length, a.hit?.length]).toEqual([2, 4, 3, 2]);
    }
    const st = createArena(content, cfg, P, E, 11);
    const r = new ArenaRenderer({} as CanvasRenderingContext2D, content, cfg, () => null);
    const [p, e] = st.fighters;
    e.x = p.x + 200;
    expect(r.animOf(p).name).toBe("idle");
    stepArena(st, content, cfg, [{ ...NO_INPUT, mx: 1 }, NO_INPUT]);
    expect(r.animOf(p).name).toBe("walk");
    expect(r.animOf(p).path).toMatch(/_walk_0\d\.png$/);
    stepArena(st, content, cfg, [{ ...NO_INPUT, basic: true }, NO_INPUT]);
    expect(r.animOf(p).name).toBe("attack");
    p.hitstun = 3;
    expect(r.animOf(p).name).toBe("hit");
    p.hitstun = 0;
    p.swing = 0;
    stepArena(st, content, cfg, [NO_INPUT, NO_INPUT]);
    expect(r.animOf(p).name).toBe("idle");
    // Especial também usa attack (via evento cast).
    r.onEvent(st, { t: "cast", who: 1, skillId: e.special.id });
    expect(r.animOf(e).name).toBe("attack");
  });
});
