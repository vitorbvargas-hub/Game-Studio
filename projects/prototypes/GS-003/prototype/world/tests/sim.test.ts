import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { snapshot, stepWorld } from "../src/sim/world";
import type { Intent } from "../src/sim/types";
import { ofType, run, world } from "./helpers";

const SCRIPT = (tick: number): Intent[] => {
  if (tick === 5) return [{ t: "move_to", playerId: "p1", x: 10 * 16, y: 26 * 16 }];
  if (tick === 40) return [{ t: "set_auto", playerId: "p1", on: true }];
  if (tick >= 300 && tick < 320) return [{ t: "move_dir", playerId: "p1", dx: 1, dy: 0 }];
  return [];
};

describe("WorldSim — determinismo", () => {
  it("mesma semente + mesmos intents → mesmos eventos e mesmo estado", () => {
    const a = world(1234);
    const b = world(1234);
    const ea = run(a.sim, 2000, SCRIPT);
    const eb = run(b.sim, 2000, SCRIPT);
    expect(ea.length).toBeGreaterThan(100);
    expect(JSON.stringify(ea)).toBe(JSON.stringify(eb));
    expect(JSON.stringify(a.sim.state)).toBe(JSON.stringify(b.sim.state));
    expect(a.events).toEqual(b.events);
  });

  it("sementes diferentes → mundos diferentes", () => {
    const a = run(world(1).sim, 600, SCRIPT);
    const b = run(world(2).sim, 600, SCRIPT);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("o estado é JSON puro (pronto para save/servidor) e retomável", () => {
    const a = world(77);
    run(a.sim, 500, SCRIPT);
    const b = world(77);
    b.sim.state = JSON.parse(JSON.stringify(a.sim.state));
    const ea = run(a.sim, 500);
    const eb = run(b.sim, 500);
    expect(JSON.stringify(ea)).toBe(JSON.stringify(eb));
  });
});

describe("WorldSim — combate no mapa", () => {
  it("AUTO: a parceira procura um selvagem, luta, vence e ganha XP (fluxo de 9 passos em eventos)", () => {
    const { sim } = world(42, { auto: true, botAuto: false });
    const evs = run(sim, 1200);
    const mine = (id?: string) => id === "p1:partner";
    const engage = ofType(evs, "engage").find((e) => mine(e.attackerId));
    expect(engage).toBeDefined();
    const enc = engage!.encounterId;
    expect(ofType(evs, "encounter_start").some((e) => e.encounterId === enc)).toBe(true);
    const attacks = ofType(evs, "attack_start").filter((e) => mine(e.attackerId));
    const dmg = ofType(evs, "damage").filter((e) => mine(e.attackerId));
    expect(attacks.length).toBeGreaterThan(0);
    // cada attack_start tem o seu damage no MESMO tick (o golpe é resolvido quando ATTACK começa)
    for (const a of attacks) {
      const d = dmg.find((x) => x.seq === a.seq);
      expect(d, `seq ${a.seq}`).toBeDefined();
      expect(d!.tick).toBe(a.tick);
    }
    const rewards = ofType(evs, "reward").filter((r) => r.ownerId === "p1");
    expect(rewards.length).toBeGreaterThan(0);
    expect(rewards.every((r) => r.xp > 0)).toBe(true);
    expect(ofType(evs, "capture").some((c) => c.ownerId === "p1")).toBe(true);
    const partner = sim.state.entities.find((e) => e.id === "p1:partner")!;
    expect(partner.xp > 0 || partner.level > 3).toBe(true);
  });

  it("HP: o damage traz hpAfter coerente e HP 0 gera defeat → despawn → respawn", () => {
    const { sim } = world(8, { auto: true });
    const evs = run(sim, 2500);
    const hp = new Map<string, number>();
    for (const e of evs) {
      if (e.t === "spawn") hp.set(e.entity.id, e.entity.hp);
      if (e.t === "damage" && e.kind === "damage") {
        expect(e.amount).toBeGreaterThan(0);
        expect(e.hpAfter).toBeGreaterThanOrEqual(0);
      }
    }
    const defeats = ofType(evs, "defeat");
    expect(defeats.length).toBeGreaterThan(0);
    for (const d of defeats) {
      const killing = ofType(evs, "damage").filter((x) => x.targetId === d.id && x.tick === d.tick);
      expect(killing.at(-1)?.hpAfter).toBe(0);
    }
    const wildDefeats = defeats.filter((d) => d.id.startsWith("wild"));
    expect(ofType(evs, "despawn").filter((d) => d.id.startsWith("wild")).length).toBeGreaterThan(0);
    // respawn: novos selvagens nascem depois do despawn (os iniciais saem de createWorld, fora de `evs`)
    expect(ofType(evs, "spawn").filter((s) => s.entity.kind === "wild").length).toBeGreaterThan(0);
    expect(wildDefeats.length).toBeGreaterThan(0);
  });

  it("o combate não congela o mundo: entidades fora do encontro continuam andando", () => {
    const { sim } = world(42, { auto: true });
    let checked = 0;
    for (let i = 0; i < 1500 && checked < 30; i++) {
      const before = new Map(snapshot(sim).map((s) => [s.id, `${s.x},${s.y}`]));
      stepWorld(sim, []);
      const enc = sim.state.encounters.find((e) => e.started && e.members.includes("p1:partner"));
      if (!enc) continue;
      checked++;
      const outsiders = snapshot(sim).filter((s) => !enc.members.includes(s.id) && before.get(s.id) !== `${s.x},${s.y}`);
      if (outsiders.length > 0) checked += 100;
    }
    expect(checked).toBeGreaterThanOrEqual(100);
  });

  it("outro jogador (bot) anda e luta com a própria parceira, no mesmo mundo", () => {
    const { sim } = world(21);
    const evs = run(sim, 2000);
    expect(ofType(evs, "state").some((s) => s.id === "bot1" && s.to === "WALK")).toBe(true);
    expect(ofType(evs, "attack_start").some((a) => a.attackerId === "bot1:partner")).toBe(true);
    expect(ofType(evs, "reward").some((r) => r.ownerId === "bot1")).toBe(true);
  });

  it("intent engage manual: clique num selvagem faz a parceira lutar com ele", () => {
    const { sim } = world(4, { auto: false, botAuto: false });
    run(sim, 5);
    const me = sim.state.entities.find((e) => e.id === "p1")!;
    const target = sim.state.entities
      .filter((e) => e.kind === "wild" && e.level <= 4)
      .sort((a, b) => Math.hypot(a.x - me.x, a.y - me.y) - Math.hypot(b.x - me.x, b.y - me.y))[0];
    const evs = run(sim, 600, (t) => (t === 6 ? [{ t: "engage", playerId: "p1", targetId: target.id }] : []));
    expect(ofType(evs, "engage")[0]).toMatchObject({ attackerId: "p1:partner", targetId: target.id });
    expect(ofType(evs, "attack_start").some((a) => a.attackerId === "p1:partner" && a.targetId === target.id)).toBe(true);
  });

  it("WASD (move_dir) move o Tamer e respeita colisão (água/árvore/rocha)", () => {
    const { sim } = world(4, { auto: false, botAuto: false });
    const me = sim.state.entities.find((e) => e.id === "p1")!;
    const x0 = me.x;
    run(sim, 10, () => [{ t: "move_dir", playerId: "p1", dx: 1, dy: 0 }]);
    expect(me.x).toBeGreaterThan(x0);
    run(sim, 400, () => [{ t: "move_dir", playerId: "p1", dx: 0, dy: -1 }]);
    // não atravessa sólidos: a posição final nunca está em célula sólida
    const tx = Math.floor(me.x / 16);
    const ty = Math.floor(me.y / 16);
    expect(sim.map.solid[ty * sim.map.width + tx]).toBe(0);
  });
});

describe("a animação não decide o dano", () => {
  it("o código da sim não importa render/, assets/, ui/ nem nada de DOM/Canvas", () => {
    const dir = join(__dirname, "../src/sim");
    // recursivo: src/sim/encounters (GS-012) também é sim e segue a mesma regra
    for (const f of readdirSync(dir, { recursive: true }) as string[]) {
      if (!/\.ts$/.test(f)) continue;
      const src = readFileSync(join(dir, f), "utf8");
      expect(src, f).not.toMatch(/from\s+["'](\.\.\/)+(render|assets|ui)\//);
      expect(src, f).not.toMatch(/\b(document|window|HTMLCanvasElement|CanvasRenderingContext2D|requestAnimationFrame)\b/);
      expect(src, f).not.toMatch(/creature\.json|atlas|hitFrame/);
    }
  });
});
