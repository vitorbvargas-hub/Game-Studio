// Montagem padrão do vertical slice: mapa de teste + jogador local + 1 jogador fake (bot).

import testMap from "../data/maps/test-meadow.tmj.json";
import { parseTiledMap, type TiledMap, type WorldMap } from "./map";
import { loadWorldContent } from "./species";
import type { WorldEvent } from "./types";
import { createWorld, type PlayerSetup, type WorldSim } from "./world";

export const LOCAL_PLAYER = "p1";
export const BOT_PLAYER = "bot1";

export function loadTestMap(): WorldMap {
  return parseTiledMap("test-meadow", testMap as unknown as TiledMap);
}

export function defaultPlayers(map: WorldMap, opts: { auto?: boolean; botAuto?: boolean } = {}): PlayerSetup[] {
  return [
    { id: LOCAL_PLAYER, name: "Tamer", start: map.starts.player, partnerSpecies: "CREATURE-0003", partnerLevel: 3, auto: opts.auto ?? false, bot: false },
    { id: BOT_PLAYER, name: "Bot", start: map.starts.bot, partnerSpecies: "CREATURE-0012", partnerLevel: 3, auto: opts.botAuto ?? true, bot: true },
  ];
}

export function createDefaultWorld(seed: number, opts: { auto?: boolean; botAuto?: boolean } = {}): { sim: WorldSim; events: WorldEvent[] } {
  const map = loadTestMap();
  return createWorld(map, loadWorldContent(), seed, defaultPlayers(map, opts));
}
