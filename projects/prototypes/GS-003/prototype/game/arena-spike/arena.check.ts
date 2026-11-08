// Checagem headless do spike (fora do `npm test` principal):
//   npx vitest run --config arena-spike/vitest.config.ts
import { describe, expect, it } from "vitest";
import { loadPack } from "../src/packs";
import { aiInput, arenaAffinityMult, createArena, defaultMatchup, pickSkills, stepArena, NO_INPUT, type ArenaConfig, type ArenaInput } from "./arena";
import cfgJson from "./arena.json";
import { animFrameMs } from "../src/render/anim";
import { measurePair } from "./balance";
import { ArenaRenderer, loopFrameIndex } from "./render";

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

  // Shell real (main.ts): stepArena a cfg.simHz fixo via acumulador + draw(st, now) 1x por quadro de tela.
  // Amostra o sprite desenhado em instantes de tempo real múltiplos de 1/6 s: 30, 60, 120 e 144 Hz desenham
  // exatamente nesses instantes, então o frame mostrado tem de ser idêntico (antes da correção, 10–15 de 20 divergiam).
  function framesAt(hz: number, sampleMs: number[], walk: boolean) {
    const st = createArena(content, cfg, P, E, 21);
    const ctx = new Proxy({}, { get: () => () => {}, set: () => true }) as unknown as CanvasRenderingContext2D;
    const r = new ArenaRenderer(ctx, content, cfg, () => null);
    const [p, e] = st.fighters;
    e.x = p.x + 200;
    const inp: [ArenaInput, ArenaInput] = walk ? [{ ...NO_INPUT, my: 1 }, { ...NO_INPUT, my: -1 }] : [NO_INPUT, NO_INPUT];
    const STEP = 1000 / cfg.simHz;
    let acc = 0;
    let k = 0;
    let last = 0;
    const out: { names: string[]; paths: (string | undefined)[] } = { names: [], paths: [] };
    for (const target of sampleMs) {
      // t calculado de k (não somado) para não acumular erro de ponto flutuante.
      while (((k + 1) * 1000) / hz <= target + 1e-6) {
        const t = (++k * 1000) / hz;
        acc += t - last;
        last = t;
        while (acc >= STEP) {
          acc -= STEP;
          stepArena(st, content, cfg, inp);
        }
        r.draw(st, t);
      }
      const a = r.animOf(st.fighters[0]);
      out.names.push(a.name);
      out.paths.push(a.path);
    }
    return { out, r, st };
  }

  for (const walk of [false, true]) {
    it(`${walk ? "walk" : "idle"} da arena mostra os mesmos frames a 30, 60, 120 e 144 Hz (tempo real, não contagem de draw)`, () => {
      const samples = Array.from({ length: 40 }, (_, i) => ((6 + i) * 1000) / 6);
      const ref = framesAt(60, samples, walk).out;
      expect(new Set(ref.names)).toEqual(new Set([walk ? "walk" : "idle"]));
      expect(new Set(ref.paths).size).toBe(content.creatures[weak].anims![walk ? "walk" : "idle"]!.length);
      for (const hz of [30, 120, 144]) {
        const got = framesAt(hz, samples, walk).out;
        expect(got.names, `${hz} Hz`).toEqual(ref.names);
        expect(got.paths, `${hz} Hz`).toEqual(ref.paths);
      }
    });
  }

  it("frame do loop deriva só do timestamp do rAF passado a draw()", () => {
    for (const hz of [30, 60, 120, 144]) {
      const { r, st } = framesAt(hz, [2000], true);
      const f = st.fighters[0];
      const frames = content.creatures[weak].anims!.walk!;
      for (const now of [2000.5, 2111, 2500, 3333]) {
        r.draw(st, now);
        expect(r.animOf(f).path, `${hz} Hz @ ${now}`).toBe(frames[loopFrameIndex(now, animFrameMs(f, "walk"), frames.length)]);
      }
    }
  });

  // Equilíbrio IA x IA (determinístico por seed): 400 lutas por par, lados alternados.
  it("espelho (mesmo monstro) fica perto de 50% e sem vantagem de lado", () => {
    for (const id of [strong, weak]) {
      const r = measurePair(content, cfg, id, id, 400);
      expect(r.winRateA, id).toBeGreaterThan(0.43);
      expect(r.winRateA, id).toBeLessThan(0.57);
    }
  });

  it("par com vantagem de afinidade vence entre 60% e 70%, igual nos dois lados", () => {
    const r = measurePair(content, cfg, strong, weak, 400);
    expect(r.winRateA).toBeGreaterThanOrEqual(0.6);
    expect(r.winRateA).toBeLessThanOrEqual(0.7);
    expect(Math.abs(r.winRateAasIdx0 - r.winRateAasIdx1)).toBeLessThan(0.1);
  });

  it("afinidade amortecida vale só na arena (affinityChart do pacote/idle intacto)", () => {
    const [sa, wa] = [content.creatures[strong].affinity, content.creatures[weak].affinity];
    expect(arenaAffinityMult(content, cfg, sa, wa)).toBe(cfg.affinity!.advantage);
    expect(arenaAffinityMult(content, cfg, wa, sa)).toBe(cfg.affinity!.disadvantage);
    expect(content.theme.affinityChart[sa][wa]).toBe(1.25);
    expect(content.theme.affinityChart[wa][sa]).toBe(0.8);
  });
});
