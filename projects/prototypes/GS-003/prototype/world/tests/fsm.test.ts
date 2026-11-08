import { describe, expect, it } from "vitest";
import { canTransition, CREATURE_TRANSITIONS, IllegalTransition, LOGIC_STATES, setState } from "../src/sim/fsm";
import type { Entity, LogicState, WorldEvent } from "../src/sim/types";
import { ofType, run, world } from "./helpers";

function fakeEntity(kind: Entity["kind"], state: LogicState): Entity {
  const { sim } = world(1);
  const e = sim.state.entities.find((x) => x.kind === kind)!;
  return { ...e, state };
}

describe("máquina de estados (tabela)", () => {
  it("tem os 8 estados da spec", () => {
    expect(LOGIC_STATES).toEqual(["IDLE", "WALK", "FOLLOW", "ENGAGE", "ATTACK", "HURT", "DEFEAT", "RETURN"]);
  });

  it("segue o diagrama da spec §3", () => {
    expect(canTransition("wild", "IDLE", "WALK")).toBe(true);
    expect(canTransition("partner", "FOLLOW", "ENGAGE")).toBe(true);
    expect(canTransition("partner", "ENGAGE", "ATTACK")).toBe(true);
    expect(canTransition("partner", "ATTACK", "ENGAGE")).toBe(true);
    expect(canTransition("wild", "RETURN", "IDLE")).toBe(true);
    // HURT não interrompe um ATTACK já confirmado
    expect(canTransition("partner", "ATTACK", "HURT")).toBe(false);
    // ninguém sai de DEFEAT (respawn é um novo spawn)
    for (const s of LOGIC_STATES) if (s !== "DEFEAT") expect(canTransition("wild", "DEFEAT", s)).toBe(false);
    // todo estado vivo pode ir para DEFEAT
    for (const s of LOGIC_STATES) if (s !== "DEFEAT") expect(CREATURE_TRANSITIONS[s]).toContain("DEFEAT");
  });

  it("Tamers só andam e param", () => {
    expect(canTransition("player", "IDLE", "WALK")).toBe(true);
    expect(canTransition("player", "WALK", "ENGAGE")).toBe(false);
    expect(canTransition("remote_player", "IDLE", "ATTACK")).toBe(false);
  });

  it("setState recusa transição ilegal e emite evento nas legais", () => {
    const ev: WorldEvent[] = [];
    const e = fakeEntity("wild", "ATTACK");
    expect(() => setState(e, "HURT", 1, ev)).toThrow(IllegalTransition);
    setState(e, "ENGAGE", 1, ev);
    expect(ev).toEqual([{ t: "state", tick: 1, id: e.id, from: "ATTACK", to: "ENGAGE" }]);
  });
});

describe("máquina de estados (na sim)", () => {
  it("10 min de jogo com AUTO: só transições legais e os 8 estados aparecem", () => {
    const { sim } = world(7, { auto: true });
    const evs = run(sim, 6000); // setState lança se algo ilegal acontecer
    const states = ofType(evs, "state");
    for (const s of states) {
      const kind = s.id.startsWith("wild") ? "wild" : s.id.endsWith(":partner") ? "partner" : "player";
      expect(canTransition(kind, s.from, s.to), `${s.id} ${s.from}->${s.to}`).toBe(true);
    }
    const seen = new Set(states.flatMap((s) => [s.from, s.to]));
    for (const st of LOGIC_STATES) expect(seen, st).toContain(st);
  });

  it("parceira: FOLLOW quando o Tamer se afasta, IDLE quando chega", () => {
    const { sim } = world(3, { auto: false, botAuto: false });
    const p = sim.state.entities.find((e) => e.id === "p1")!;
    const evs = run(sim, 60, (t) => (t === 1 ? [{ t: "move_to", playerId: "p1", x: p.x + 6 * 16, y: p.y }] : []));
    const partnerStates = ofType(evs, "state").filter((s) => s.id === "p1:partner").map((s) => s.to);
    expect(partnerStates).toContain("FOLLOW");
    expect(partnerStates.at(-1)).toBe("IDLE");
    const partner = sim.state.entities.find((e) => e.id === "p1:partner")!;
    expect(Math.hypot(partner.x - p.x, partner.y - p.y)).toBeLessThanOrEqual(2 * 16 + 4);
  });

  it("fuga (intent flee): encerra o encontro e a parceira faz RETURN", () => {
    const { sim } = world(5, { auto: true, botAuto: false });
    let fled = false;
    const evs = run(sim, 1500, () => {
      const partner = sim.state.entities.find((e) => e.id === "p1:partner");
      if (!fled && partner?.state === "ENGAGE" && sim.state.encounters.some((x) => x.started && x.members.includes("p1:partner"))) {
        fled = true;
        return [{ t: "flee", playerId: "p1" }, { t: "set_auto", playerId: "p1", on: false }];
      }
      return [];
    });
    expect(fled).toBe(true);
    expect(ofType(evs, "encounter_end").some((e) => e.reason === "flee")).toBe(true);
    expect(ofType(evs, "state").some((s) => s.id === "p1:partner" && s.to === "RETURN")).toBe(true);
  });

  it("leash: parceira não persegue além do leashRadius do Tamer (encounter_end leash → RETURN)", () => {
    const { sim } = world(9, { auto: false, botAuto: false });
    const me = sim.state.entities.find((e) => e.id === "p1")!;
    const far = sim.state.entities
      .filter((e) => e.kind === "wild")
      .sort((a, b) => Math.hypot(b.x - me.x, b.y - me.y) - Math.hypot(a.x - me.x, a.y - me.y))[0];
    const evs = run(sim, 400, (t) => (t === 1 ? [{ t: "engage", playerId: "p1", targetId: far.id }] : []));
    expect(ofType(evs, "engage")[0]).toMatchObject({ attackerId: "p1:partner", targetId: far.id });
    expect(ofType(evs, "encounter_end").some((e) => e.reason === "leash")).toBe(true);
    const partnerStates = ofType(evs, "state").filter((s) => s.id === "p1:partner").map((s) => s.to);
    expect(partnerStates).toContain("RETURN");
    const partner = sim.state.entities.find((e) => e.id === "p1:partner")!;
    expect(Math.hypot(partner.x - me.x, partner.y - me.y)).toBeLessThan(3 * 16);
  });
});
