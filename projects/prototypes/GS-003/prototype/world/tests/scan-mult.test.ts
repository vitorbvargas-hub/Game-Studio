// Fonte dos Desejos (PANELS_SPEC §4): o pedido liga o multiplicador de varredura (×1,5) na sim pelo intent
// set_scan_mult; a vitória usa o mesmo evento `capture` de sempre, só com o ganho maior.
import { describe, expect, it } from "vitest";
import { WORLD } from "../src/sim/params";
import { scanGain } from "../src/sim/world";
import { ofType, run, world } from "./helpers";

function firstCapturePct(mult?: number): number {
  const { sim } = world(42, { auto: true, botAuto: false });
  const evs = run(sim, 3000, (t) => (t === 1 && mult ? [{ t: "set_scan_mult", playerId: "p1", mult }] : []));
  return ofType(evs, "capture").find((c) => c.ownerId === "p1")!.pct;
}

describe("multiplicador de varredura (Fonte dos Desejos)", () => {
  it("padrão = scanPerDefeat; ×1,5 = 38%; limitado a 1..3", () => {
    expect(scanGain({})).toBe(WORLD.scanPerDefeat);
    expect(scanGain({ scanMult: 1.5 })).toBe(Math.round(WORLD.scanPerDefeat * 1.5));
    expect(firstCapturePct()).toBe(WORLD.scanPerDefeat);
    expect(firstCapturePct(1.5)).toBe(Math.round(WORLD.scanPerDefeat * 1.5));
    const { sim } = world(1);
    run(sim, 1, () => [{ t: "set_scan_mult", playerId: "p1", mult: 99 }]);
    expect(sim.state.players.find((p) => p.id === "p1")!.scanMult).toBe(3);
    run(sim, 1, () => [{ t: "set_scan_mult", playerId: "p1", mult: 1 }]);
    expect(sim.state.players.find((p) => p.id === "p1")!.scanMult).toBeUndefined();
  });
});
