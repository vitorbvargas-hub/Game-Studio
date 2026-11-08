import { createDefaultWorld } from "../src/sim/setup";
import type { Intent, WorldEvent } from "../src/sim/types";
import { stepWorld, type WorldSim } from "../src/sim/world";

/** Roda `ticks` ticks; `intentsAt(tick)` devolve os intents daquele tick. */
export function run(sim: WorldSim, ticks: number, intentsAt: (tick: number) => Intent[] = () => []): WorldEvent[] {
  const all: WorldEvent[] = [];
  for (let i = 0; i < ticks; i++) all.push(...stepWorld(sim, intentsAt(sim.state.tick + 1)));
  return all;
}

export function world(seed = 42, opts: { auto?: boolean; botAuto?: boolean } = {}) {
  return createDefaultWorld(seed, opts);
}

export function ofType<T extends WorldEvent["t"]>(evs: WorldEvent[], t: T): Extract<WorldEvent, { t: T }>[] {
  return evs.filter((e) => e.t === t) as Extract<WorldEvent, { t: T }>[];
}
