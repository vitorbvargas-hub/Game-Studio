// Sistema de golpes (docs/MOVE_SYSTEM.md): dados, 4 slots, learnset, troca, recarga/MP, prioridade do AUTO,
// evolução com herança, alvos área/linha, elemento, save e determinismo.
import { xpToNext } from "@game/src/sim/formulas";
import { describe, expect, it } from "vitest";
import worldSpecies from "../src/data/world-species.json";
import { chooseMove, elementMult, initialLoadout, learnableAt, loadMoveContent, MOVE_SLOTS } from "../src/sim/moves";
import { SUB } from "../src/sim/params";
import type { Entity, Intent, WorldEvent } from "../src/sim/types";
import { stepWorld, type WorldSim } from "../src/sim/world";
import { ofType, run, world } from "./helpers";

const mc = loadMoveContent();
const partnerOf = (sim: WorldSim, id = "p1:partner") => sim.state.entities.find((e) => e.id === id)!;
const step = (sim: WorldSim, intents: Intent[] = []) => stepWorld(sim, intents);

/** Mundo calmo (sem AUTO, sem bot) com a parceira p1 parada. */
function calm(seed = 5) {
  const { sim } = world(seed, { auto: false, botAuto: false });
  return { sim, p: partnerOf(sim) };
}

/** Sobe a parceira até `level` pela via normal: XP a 1 ponto do alvo + uma vitória (reward() sobe os níveis). */
function levelTo(sim: WorldSim, e: Entity, level: number): WorldEvent[] {
  const evs: WorldEvent[] = [];
  while (e.level < level) {
    let need = -e.xp;
    for (let l = e.level; l < level; l++) need += xpToNext(sim.content.balance, l);
    e.xp += need - 1;
    const wild = sim.state.entities.find((x) => x.kind === "wild" && x.state !== "DEFEAT" && !x.removed)!;
    wild.hp = 1;
    wild.x = e.x + 20;
    wild.y = e.y;
    e.attackCd = 0;
    for (let i = 0; i < 40 && wild.state !== "DEFEAT"; i++) evs.push(...step(sim, i === 0 ? [{ t: "engage", playerId: "p1", targetId: wild.id }] : []));
    for (let i = 0; i < 40 && (e.encounterId || e.state !== "IDLE"); i++) evs.push(...step(sim));
    if (e.level >= level) break;
  }
  return evs;
}

describe("dados do game-design (moves/learnsets/vfx)", () => {
  it("toda espécie do mundo tem learnset; todo golpe do learnset existe; básico sem custo e sem recarga", () => {
    for (const s of worldSpecies.species) expect(mc.learnsets[s.id]?.length, s.id).toBeGreaterThan(0);
    const basic = mc.moves[mc.basicMoveId];
    expect(basic.cost).toBe(0);
    expect(basic.cooldownTicks).toBe(0);
    expect(Object.keys(mc.moves).length).toBeGreaterThanOrEqual(60);
  });

  it("linhas de evolução: Baby → Child (Nv.8) → Adult (Nv.16)", () => {
    expect(mc.evolutions["CREATURE-0002"]).toEqual({ to: "CREATURE-0003", level: 8 });
    expect(mc.evolutions["CREATURE-0003"]).toEqual({ to: "CREATURE-0004", level: 16 });
    expect(mc.inheritSlotsOnEvolve).toBe(2);
  });

  it("os 5 tipos e as 4 formas de alvo existem nos dados", () => {
    const types = new Set(Object.values(mc.moves).map((m) => m.type));
    expect([...types].sort()).toEqual(["buff", "debuff", "heal", "physical", "special"]);
    const shapes = new Set(Object.values(mc.moves).map((m) => m.shape));
    for (const s of ["single", "area", "line", "projectile"]) expect(shapes.has(s), s).toBe(true);
  });
});

describe("4 slots e learnset", () => {
  it("loadout inicial: conhece até o nível e equipa os 4 mais recentes; forma abaixo da janela conhece os de entrada", () => {
    // Tokomon Nv.5: investida (1), bite (3), mordida_inocente (5) → 3 slots, 1 vazio
    expect(initialLoadout(mc, "CREATURE-0011", 5)).toEqual({ learned: ["investida", "bite_kamitsuki", "mordida_inocente"], moves: ["investida", "bite_kamitsuki", "mordida_inocente", null] });
    // Guilmon Nv.5 (janela 8–15): golpes de entrada (Nv.8)
    expect(learnableAt(mc, "CREATURE-0003", 5)).toEqual(["rock_breaker", "pyro_sphere"]);
    // Agumon Nv.15: 8 conhecidos, 4 equipados (os últimos)
    const a = initialLoadout(mc, "CREATURE-0006", 15);
    expect(a.learned).toHaveLength(8);
    expect(a.moves).toHaveLength(MOVE_SLOTS);
    expect(a.moves).toEqual(a.learned.slice(-4));
  });

  it("subir de nível aprende (evento confirmado): slot vazio recebe o golpe; com 4 cheios fica só conhecido", () => {
    const { sim, p } = calm();
    expect(p.speciesId).toBe("CREATURE-0003");
    expect(p.moves).toEqual(["rock_breaker", "pyro_sphere", null, null]);
    const evs = levelTo(sim, p, 11);
    const learned = ofType(evs, "move_learned").filter((e) => e.id === p.id);
    expect(learned.map((l) => l.moveId)).toEqual(["sharp_claws", "wild_scratch"]);
    expect(learned.map((l) => l.slot)).toEqual([2, 3]);
    // o learned vem DEPOIS do level_up do mesmo nível
    const lvl10 = evs.findIndex((e) => e.t === "level_up" && e.level === 10);
    expect(evs.findIndex((e) => e.t === "move_learned" && e.moveId === "sharp_claws")).toBeGreaterThan(lvl10);
    const more = levelTo(sim, p, 13);
    const air = ofType(more, "move_learned").find((l) => l.moveId === "air_fireball")!;
    expect(air.slot).toBeNull();
    expect(p.learned).toContain("air_fireball");
    expect(p.moves).not.toContain("air_fireball");
  });
});

describe("troca de golpes (set_moves)", () => {
  it("aceita só golpes aprendidos, sem repetir; recusa em combate", () => {
    const { sim, p } = calm();
    levelTo(sim, p, 11);
    run(sim, 30);
    let evs = step(sim, [{ t: "set_moves", playerId: "p1", slots: ["wild_scratch", "pyro_sphere", null, "rock_breaker"] }]);
    expect(ofType(evs, "moves_changed")[0].slots).toEqual(["wild_scratch", "pyro_sphere", null, "rock_breaker"]);
    expect(p.moves).toEqual(["wild_scratch", "pyro_sphere", null, "rock_breaker"]);
    evs = step(sim, [{ t: "set_moves", playerId: "p1", slots: ["mega_flame", null, null, null] }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("golpe não aprendido");
    evs = step(sim, [{ t: "set_moves", playerId: "p1", slots: ["pyro_sphere", "pyro_sphere", null, null] }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("golpe repetido");
    // em combate: recusa (§2.4)
    const wild = sim.state.entities.find((x) => x.kind === "wild" && x.state !== "DEFEAT")!;
    wild.x = p.x + 30;
    wild.y = p.y;
    step(sim, [{ t: "engage", playerId: "p1", targetId: wild.id }]);
    evs = step(sim, [{ t: "set_moves", playerId: "p1", slots: ["rock_breaker", null, null, null] }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("troque os golpes fora de combate");
  });
});

describe("recarga e MP", () => {
  it("usar um golpe gasta MP e liga a recarga; a recarga desce 1 por tick; sem MP cai no básico", () => {
    const { sim, p } = calm();
    const wild = sim.state.entities.find((x) => x.kind === "wild")!;
    wild.x = p.x + 24;
    wild.y = p.y;
    wild.hp = wild.maxHp = 9999;
    const mp0 = p.mp;
    let evs: WorldEvent[] = [];
    for (let i = 0; i < 30 && !evs.some((e) => e.t === "attack_start" && e.attackerId === p.id); i++) evs = step(sim, i === 0 ? [{ t: "engage", playerId: "p1", targetId: wild.id }] : []);
    const atk = ofType(evs, "attack_start").find((e) => e.attackerId === p.id)!;
    expect(atk.skillId).toBe("rock_breaker"); // 1º da prioridade padrão (ordem dos slots)
    const m = mc.moves.rock_breaker;
    expect(p.mp).toBeLessThanOrEqual(mp0 - m.cost + p.maxMp * mc.mp.regenPctInCombat + 1e-9);
    const cd = p.moveCd.rock_breaker;
    expect(cd).toBe(m.cooldownTicks);
    step(sim);
    expect(p.moveCd.rock_breaker).toBe(cd - 1);
    // MP zerado e tudo pronto: escolhe o básico
    p.mp = 0;
    p.moveCd = {};
    expect(chooseMove(mc, p, wild)).toBe(mc.basicMoveId);
  });

  it("maxMp = 20 + 2 × nível; regen fora de combate > em combate", () => {
    const { p } = calm();
    expect(p.maxMp).toBe(20 + 2 * p.level);
    expect(mc.mp.regenPctOutOfCombat).toBeGreaterThan(mc.mp.regenPctInCombat);
  });
});

describe("prioridade do AUTO (gambit simples)", () => {
  const ent = (over: Partial<Entity> = {}): Entity =>
    ({
      id: "x",
      kind: "partner",
      hp: 100,
      maxHp: 100,
      mp: 100,
      maxMp: 100,
      moves: ["pyro_sphere", "rock_breaker", "kiai_tame", "investida"],
      learned: ["pyro_sphere", "rock_breaker", "kiai_tame", "investida"],
      moveCd: {},
      autoRules: [],
      statuses: [],
      stats: { hp: 100, atk: 20, def: 10, spd: 10 },
      ...over,
    }) as Entity;
  const target = ent({ id: "t", hp: 100, maxHp: 100 });

  it("padrão: ordem dos slots; recarga e MP pulam para o próximo", () => {
    expect(chooseMove(mc, ent(), target)).toBe("pyro_sphere");
    expect(chooseMove(mc, ent({ moveCd: { pyro_sphere: 3 } }), target)).toBe("rock_breaker");
    expect(chooseMove(mc, ent({ mp: mc.moves.rock_breaker.cost, moveCd: { pyro_sphere: 3 } }), target)).toBe("rock_breaker");
    expect(chooseMove(mc, ent({ mp: 0 }), target)).toBe("investida");
  });

  it("lista configurada: ordem, desligado, condição de PV do alvo e buff inativo", () => {
    const rules = [
      { moveId: "kiai_tame", cond: "buff_not_active" as const },
      { moveId: "rock_breaker", cond: "target_hp_below_pct" as const, pct: 30 },
      { moveId: "pyro_sphere", cond: "always" as const, off: true },
    ];
    // buff primeiro (não ativo)
    expect(chooseMove(mc, ent({ autoRules: rules }), target)).toBe("kiai_tame");
    // buff já ativo → pula; Rock Breaker só abaixo de 30% → pula; Pyro desligado → vai para o próximo equipado fora da lista
    const buffed = ent({ autoRules: rules, statuses: [{ moveId: "kiai_tame", stat: "atk", mult: 1.35, ticks: 10, sourceId: "x" }] });
    expect(chooseMove(mc, buffed, target)).toBe("investida");
    expect(chooseMove(mc, buffed, { ...target, hp: 20 } as Entity)).toBe("rock_breaker");
  });

  it("use_move (jogador) fura a fila quando pronto", () => {
    expect(chooseMove(mc, ent({ queuedMove: "rock_breaker" }), target)).toBe("rock_breaker");
    expect(chooseMove(mc, ent({ queuedMove: "rock_breaker", moveCd: { rock_breaker: 2 } }), target)).toBe("pyro_sphere");
  });

  it("set_auto_priority pela sim: filtra golpes não aprendidos e repetidos", () => {
    const { sim, p } = calm();
    step(sim, [{ t: "set_auto_priority", playerId: "p1", rules: [{ moveId: "pyro_sphere", cond: "target_hp_below_pct", pct: 140 }, { moveId: "mega_flame", cond: "always" }, { moveId: "pyro_sphere", cond: "always" }, { moveId: "rock_breaker", cond: "always", off: true }] }]);
    expect(p.autoRules).toEqual([{ moveId: "pyro_sphere", cond: "target_hp_below_pct", pct: 99 }, { moveId: "rock_breaker", cond: "always", off: true }]);
  });
});

describe("evolução e herança", () => {
  it("recusa abaixo do nível; no nível evolui, mantém até 2 golpes (os de maior poder) e aprende os de entrada", () => {
    const { sim, p } = calm();
    let evs = step(sim, [{ t: "evolve", playerId: "p1" }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("evolui no nível 16");
    levelTo(sim, p, 16);
    run(sim, 30);
    const before = [...p.moves];
    const strongest = before.filter((s): s is string => !!s).sort((a, b) => mc.moves[b].power - mc.moves[a].power).slice(0, 2);
    evs = step(sim, [{ t: "evolve", playerId: "p1" }]);
    const ev = ofType(evs, "evolve")[0];
    expect(ev).toMatchObject({ from: "CREATURE-0003", to: "CREATURE-0004" });
    expect(ev.kept.sort()).toEqual(strongest.sort());
    expect(p.speciesId).toBe("CREATURE-0004");
    expect(p.name).toBe("Growlmon");
    const learned = ofType(evs, "move_learned").map((e) => e.moveId);
    expect(learned).toEqual(["plasma_blade", "exhaust_flame"]);
    expect(p.moves.filter(Boolean).sort()).toEqual([...learned, ...ev.kept].sort());
    expect(p.learned).toHaveLength(4);
  });

  it("escolha do jogador (keep) e limite de inheritSlotsOnEvolve", () => {
    const { sim, p } = calm();
    levelTo(sim, p, 16);
    run(sim, 30);
    const evs = step(sim, [{ t: "evolve", playerId: "p1", keep: ["pyro_sphere", "rock_breaker", "sharp_claws"] }]);
    expect(ofType(evs, "evolve")[0].kept).toEqual(["pyro_sphere", "rock_breaker"]);
  });
});

describe("alvos área/linha, elemento e atributo", () => {
  function arena(moveId: string) {
    const { sim, p } = calm(11);
    const wilds = sim.state.entities.filter((x) => x.kind === "wild").slice(0, 3);
    // alvo à direita, um vizinho colado nele (área) e outro atrás na mesma linha (linha)
    const [t, near, behind] = wilds;
    for (const w of wilds) {
      w.hp = w.maxHp = 9999;
      w.encounterId = undefined;
      w.targetId = undefined;
      w.state = "IDLE";
      w.waitTicks = 999;
    }
    t.x = p.x + 30;
    t.y = p.y;
    near.x = t.x - 6;
    near.y = t.y + 28;
    behind.x = t.x + 30;
    behind.y = t.y;
    p.learned.push(moveId);
    p.moves = [moveId, null, null, null];
    p.autoRules = [];
    p.mp = 999;
    let atk: Extract<WorldEvent, { t: "attack_start" }> | undefined;
    const all: WorldEvent[] = [];
    for (let i = 0; i < 40 && !atk; i++) {
      const evs = step(sim, i === 0 ? [{ t: "engage", playerId: "p1", targetId: t.id }] : []);
      all.push(...evs);
      atk = ofType(evs, "attack_start").find((e) => e.attackerId === p.id);
    }
    return { atk: atk!, ids: { t: t.id, near: near.id, behind: behind.id }, all };
  }

  it("área: atinge o alvo e o vizinho; linha: atinge quem está atrás na reta", () => {
    const a = arena("tail_whip");
    expect(a.atk.skillId).toBe("tail_whip");
    expect(a.atk.targetIds).toContain(a.ids.t);
    expect(a.atk.targetIds).toContain(a.ids.near);
    expect(ofType(a.all, "damage").filter((d) => d.seq === a.atk.seq).length).toBe(a.atk.targetIds!.length);
    const l = arena("exhaust_flame");
    expect(l.atk.targetIds).toContain(l.ids.t);
    expect(l.atk.targetIds).toContain(l.ids.behind);
    expect(l.atk.targetIds).not.toContain(l.ids.near);
    // projétil e single: só o alvo
    expect(arena("pyro_sphere").atk.targetIds).toHaveLength(1);
  });

  it("buff no próprio usuário (status) e debuff no alvo; alcance de golpe à distância > corpo a corpo", () => {
    const b = arena("kiai_tame");
    expect(b.atk.targetIds).toEqual(["p1:partner"]);
    expect(ofType(b.all, "status")[0]).toMatchObject({ id: "p1:partner", stat: "atk" });
    const d = arena("ice_statue");
    expect(ofType(d.all, "status")[0]).toMatchObject({ id: d.ids.t, stat: "spd", mult: 0.5 });
    expect(mc.moves.pyro_sphere.range).toBeGreaterThan(mc.moves.rock_breaker.range);
    expect(mc.moves.pyro_sphere.range).toBe(3 * SUB);
  });

  it("elemento (§2.9): vantagem 1.15, desvantagem 0.85, neutro 1", () => {
    expect(elementMult(mc, "fire", "ice")).toBe(1.15);
    expect(elementMult(mc, "ice", "fire")).toBe(0.85);
    expect(elementMult(mc, "neutral", "fire")).toBe(1);
    expect(elementMult(mc, "thunder", "water")).toBe(1);
  });
});

describe("save e determinismo com golpes", () => {
  const script = (t: number): Intent[] => {
    if (t === 3) return [{ t: "set_auto", playerId: "p1", on: true }];
    if (t === 5) return [{ t: "set_auto_priority", playerId: "p1", rules: [{ moveId: "pyro_sphere", cond: "always" }, { moveId: "rock_breaker", cond: "target_hp_below_pct", pct: 40 }] }];
    if (t % 97 === 0) return [{ t: "use_move", playerId: "p1", slot: 1 }];
    return [];
  };

  it("mesma semente + mesmos intents (inclui golpes) → mesmos eventos e estado", () => {
    const a = world(321);
    const b = world(321);
    const ea = run(a.sim, 2500, script);
    const eb = run(b.sim, 2500, script);
    expect(ea.some((e) => e.t === "attack_start" && e.skillId !== "investida")).toBe(true);
    expect(JSON.stringify(ea)).toBe(JSON.stringify(eb));
    expect(JSON.stringify(a.sim.state)).toBe(JSON.stringify(b.sim.state));
  });

  it("save: estado JSON com golpes, MP, recargas, prioridade e status retoma idêntico", () => {
    const a = world(99);
    run(a.sim, 1200, script);
    const p = partnerOf(a.sim);
    expect(p.learned.length).toBeGreaterThan(0);
    expect(p.autoRules.length).toBeGreaterThan(0);
    const saved = JSON.stringify(a.sim.state);
    const b = world(99);
    b.sim.state = JSON.parse(saved);
    expect(partnerOf(b.sim).moves).toEqual(p.moves);
    expect(JSON.stringify(run(a.sim, 800))).toBe(JSON.stringify(run(b.sim, 800)));
  });

  it("a parceira derrotada renasce com os mesmos golpes e a mesma prioridade", () => {
    const { sim, p } = calm();
    step(sim, [{ t: "set_auto_priority", playerId: "p1", rules: [{ moveId: "pyro_sphere", cond: "always" }] }]);
    const moves = [...p.moves];
    const wild = sim.state.entities.find((x) => x.kind === "wild")!;
    wild.x = p.x + 24;
    wild.y = p.y;
    wild.stats.atk = 9999;
    p.hp = 1;
    run(sim, 200, (t) => (t === sim.state.tick + 1 ? [{ t: "engage", playerId: "p1", targetId: wild.id }] : []));
    const again = partnerOf(sim);
    expect(again.moves).toEqual(moves);
    expect(again.autoRules[0].moveId).toBe("pyro_sphere");
  });
});
