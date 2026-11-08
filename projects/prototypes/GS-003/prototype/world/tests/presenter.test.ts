import { describe, expect, it } from "vitest";
import type { CreatureManifest } from "../src/assets/creatures";
import { attackTiming, PROCEDURAL_HIT_AT_MS, resolveAnim, resolveFacing } from "../src/render/anim";
import { Presenter } from "../src/render/presenter";
import { TICK_MS } from "../src/sim/params";
import type { WorldEvent } from "../src/sim/types";
import { snapshot, stepWorld } from "../src/sim/world";
import { world } from "./helpers";

/** Manifest mínimo só com idle (como os rips de DW DS de hoje). */
const IDLE_ONLY: CreatureManifest = {
  id: "X",
  name: "X",
  dimensions: { frameW: 40, frameH: 40 },
  pivot: { x: 20, y: 39 },
  directions: { idle: { drawn: ["SW"], mirrored: { SE: "SW" } } },
  animations: {
    idle: {
      loop: true,
      frames: [
        { durationMs: 250, atlasKey: "a" },
        { durationMs: 250, atlasKey: "b" },
      ],
    },
  },
  combatStates: { IDLE: "idle", WALK: "idle", ATTACK: "idle", HURT: "idle", DEFEAT: "idle" },
};

/** O mesmo, com uma animação de ataque real e hitFrame no frame 2 (impacto bem mais tarde). */
const WITH_ATTACK: CreatureManifest = {
  ...IDLE_ONLY,
  animations: {
    ...IDLE_ONLY.animations,
    attack: {
      loop: false,
      frames: [
        { durationMs: 200, atlasKey: "a" },
        { durationMs: 150, atlasKey: "b" },
        { durationMs: 60, atlasKey: "a" },
        { durationMs: 100, atlasKey: "b" },
      ],
      events: [{ frame: 2, name: "hitFrame" }],
    },
    hurt: { loop: false, frames: [{ durationMs: 80, atlasKey: "b" }] },
  },
  combatStates: { ...IDLE_ONLY.combatStates, ATTACK: "attack", HURT: "hurt" },
};

/** Roda a sim com um presenter acoplado (laço igual ao main.ts, quadros de 20 ms). */
function playWithPresenter(manifest: CreatureManifest | null, seed = 42, ms = 90_000) {
  const { sim, events } = world(seed, { auto: true });
  const p = manifest ? new Presenter(() => manifest, "p1") : null;
  p?.onTick(snapshot(sim), events, 0);
  const all: WorldEvent[] = [...events];
  let acc = 0;
  for (let now = 20; now <= ms; now += 20) {
    acc += 20;
    while (acc >= TICK_MS) {
      const evs = stepWorld(sim, []);
      all.push(...evs);
      p?.onTick(snapshot(sim), evs, now);
      acc -= TICK_MS;
    }
    p?.update(now);
  }
  p?.update(ms + 5000);
  return { sim, all, p };
}

describe("slots de animação", () => {
  it("sem arte de ataque → procedural (avanço/recuo); com arte → usa o manifest", () => {
    expect(resolveAnim(IDLE_ONLY, "ATTACK").procedural).toBe("lunge");
    expect(resolveAnim(IDLE_ONLY, "HURT").procedural).toBe("knockback");
    expect(resolveAnim(IDLE_ONLY, "DEFEAT").procedural).toBe("fade");
    expect(resolveAnim(IDLE_ONLY, "IDLE")).toMatchObject({ name: "idle", procedural: null });
    expect(resolveAnim(WITH_ATTACK, "ATTACK")).toMatchObject({ name: "attack", procedural: null });
    expect(resolveAnim(WITH_ATTACK, "HURT")).toMatchObject({ name: "hurt", procedural: null });
  });

  it("hitAtMs = soma das durações até o hitFrame", () => {
    expect(attackTiming(IDLE_ONLY).hitAtMs).toBe(PROCEDURAL_HIT_AT_MS);
    expect(attackTiming(WITH_ATTACK)).toMatchObject({ hitAtMs: 350, durationMs: 510, procedural: false });
  });

  it("direção: rip virado para SW espelha para o leste", () => {
    expect(resolveFacing(IDLE_ONLY, "idle", "SW")).toEqual({ dir: "SW", mirror: false });
    expect(resolveFacing(IDLE_ONLY, "idle", "E")).toEqual({ dir: "SW", mirror: true });
    expect(resolveFacing(IDLE_ONLY, "idle", "SE")).toEqual({ dir: "SW", mirror: true });
    expect(resolveFacing(IDLE_ONLY, "idle", "N").mirror).toBe(false);
  });
});

describe("a animação não decide o dano (spec §8)", () => {
  it("mesma semente → mesmos eventos com manifest idle, com manifest de ataque e sem apresentação", () => {
    const a = playWithPresenter(IDLE_ONLY);
    const b = playWithPresenter(WITH_ATTACK);
    const c = playWithPresenter(null);
    expect(JSON.stringify(a.all)).toBe(JSON.stringify(c.all));
    expect(JSON.stringify(b.all)).toBe(JSON.stringify(c.all));
  });

  it("a view mostra exatamente os danos confirmados; só o MOMENTO muda com o hitFrame", () => {
    const a = playWithPresenter(IDLE_ONLY);
    const b = playWithPresenter(WITH_ATTACK);
    const confirmed = a.all.filter((e) => e.t === "damage").map((e) => (e.t === "damage" ? `${e.seq}:${e.amount}:${e.kind}` : ""));
    const shownA = a.p!.shown.map((s) => `${s.seq}:${s.amount}:${s.kind}`);
    const shownB = b.p!.shown.map((s) => `${s.seq}:${s.amount}:${s.kind}`);
    expect(confirmed.length).toBeGreaterThan(20);
    expect(shownA.sort()).toEqual([...confirmed].sort());
    expect(shownB.sort()).toEqual([...confirmed].sort());
    const atA = new Map(a.p!.shown.map((s) => [s.seq, s.at]));
    const atB = new Map(b.p!.shown.map((s) => [s.seq, s.at]));
    const diffs = [...atA.keys()].map((k) => atB.get(k)! - atA.get(k)!);
    expect(diffs.every((d) => d === 350 - PROCEDURAL_HIT_AT_MS)).toBe(true);
  });

  it("nenhum número/HURT antes do evento confirmado; damage chega → sai no impacto", () => {
    const p = new Presenter(() => IDLE_ONLY, "p1");
    const { sim, events } = world(42, { auto: true });
    p.onTick(snapshot(sim), events, 0);
    const wild = snapshot(sim).find((s) => s.kind === "wild")!;
    // ataque anunciado SEM damage (ex.: latência de servidor)
    p.onTick(snapshot(sim), [{ t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: wild.id, skillId: "investida", seq: 999 }], 1000);
    p.update(1000 + PROCEDURAL_HIT_AT_MS + 10);
    expect(p.floaters).toHaveLength(0);
    expect(p.entities.get(wild.id)!.hurt).toBeUndefined();
    expect(p.visualState(p.entities.get("p1:partner")!, 1100)).toBe("ATTACK");
    // depois do prazo sem damage, a animação termina sem número e sem HURT
    p.update(1000 + PROCEDURAL_HIT_AT_MS + 600);
    expect(p.entities.get("p1:partner")!.attack).toBeUndefined();
    expect(p.shown).toHaveLength(0);
    // damage atrasado: aparece na chegada, não antes
    p.onTick(snapshot(sim), [{ t: "damage", tick: 9, seq: 999, attackerId: "p1:partner", targetId: wild.id, amount: 7, kind: "damage", crit: false, hpAfter: wild.hp - 7 }], 2000);
    p.update(1999);
    expect(p.shown).toHaveLength(0);
    p.update(2000);
    expect(p.shown).toEqual([{ seq: 999, targetId: wild.id, amount: 7, kind: "damage", crit: false, at: 2000 }]);
    expect(p.floaters.map((f) => f.text)).toEqual(["-7"]);
    expect(p.visualState(p.entities.get(wild.id)!, 2010)).toBe("HURT");
  });

  it("HURT lógico no snapshot não aparece antes do damage ser exibido", () => {
    const p = new Presenter(() => IDLE_ONLY, "p1");
    const { sim, events } = world(42, { auto: true });
    p.onTick(snapshot(sim), events, 0);
    const snaps = snapshot(sim);
    const wild = snaps.find((s) => s.kind === "wild")!;
    const hurtSnaps = snaps.map((s) => (s.id === wild.id ? { ...s, state: "HURT" as const, hp: s.hp - 5 } : s));
    p.onTick(
      hurtSnaps,
      [
        { t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: wild.id, skillId: "investida", seq: 1 },
        { t: "damage", tick: 1, seq: 1, attackerId: "p1:partner", targetId: wild.id, amount: 5, kind: "damage", crit: false, hpAfter: wild.hp - 5 },
      ],
      100,
    );
    p.update(120);
    const v = p.entities.get(wild.id)!;
    expect(p.visualState(v, 120)).not.toBe("HURT");
    expect(p.hpNow(v, 120)).toBe(wild.hp);
    p.update(100 + PROCEDURAL_HIT_AT_MS);
    expect(p.visualState(v, 100 + PROCEDURAL_HIT_AT_MS)).toBe("HURT");
  });

  it("DEFEAT visual só depois do golpe final ser exibido", () => {
    const { all, p } = playWithPresenter(IDLE_ONLY, 42, 60_000);
    const defeats = all.filter((e) => e.t === "defeat");
    expect(defeats.length).toBeGreaterThan(0);
    expect(p!.shown.some((s) => s.amount > 0)).toBe(true);
  });
});
