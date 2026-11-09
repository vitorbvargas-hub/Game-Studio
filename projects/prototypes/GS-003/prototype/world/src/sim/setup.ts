// Montagem padrão do vertical slice: mapa de teste + jogador local + 1 jogador fake (bot).
// E a cena da prova visual (forest-proof): floresta densa + jogador local + 3 bots.

import forestProofMap from "../data/maps/forest-proof.tmj.json";
import testMap from "../data/maps/test-meadow.tmj.json";
import forestProofScene from "../data/scenes/forest-proof.scene.json";
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

// ---------- cena da prova visual (GS-004 §4): floresta densa + 3 jogadores bot ----------


export interface ScenePlayer {
  id: string;
  name: string;
  start: string;
  partnerSpecies: string;
  partnerLevel: number;
  bot: boolean;
  /** Só apresentação: nível do Tamer e matiz (graus) aplicado ao sprite do outro jogador. */
  tamerLevel: number;
  tint: number;
}

export type SceneData = typeof forestProofScene & { players: ScenePlayer[] };

export const FOREST_PROOF_SCENE = forestProofScene as SceneData;

export function loadForestProofMap(): WorldMap {
  return parseTiledMap("forest-proof", forestProofMap as unknown as TiledMap);
}

export interface SceneOptions {
  auto?: boolean;
  botAuto?: boolean;
  /** Nome do Tamer local (criador de Tamer); padrão = o da cena. Só rótulo: não muda a simulação. */
  localName?: string;
  /** Parceira do Tamer local (Digimon inicial escolhido) e nível; padrão = os da cena. */
  partnerSpecies?: string;
  partnerLevel?: number;
}

export function scenePlayers(map: WorldMap, scene: SceneData, opts: SceneOptions = {}): PlayerSetup[] {
  return scene.players.map((p) => {
    const start = map.starts[p.start];
    if (!start) throw new Error(`cena: início '${p.start}' ausente no mapa ${map.id}`);
    return {
      id: p.id,
      name: p.id === LOCAL_PLAYER && opts.localName ? opts.localName : p.name,
      start,
      partnerSpecies: p.id === LOCAL_PLAYER && opts.partnerSpecies ? opts.partnerSpecies : p.partnerSpecies,
      partnerLevel: p.id === LOCAL_PLAYER && opts.partnerLevel ? opts.partnerLevel : p.partnerLevel,
      auto: p.bot ? (opts.botAuto ?? true) : (opts.auto ?? false),
      bot: p.bot,
    };
  });
}

export function createForestProofWorld(seed: number, opts: SceneOptions = {}): { sim: WorldSim; events: WorldEvent[] } {
  const map = loadForestProofMap();
  return createWorld(map, loadWorldContent(), seed, scenePlayers(map, FOREST_PROOF_SCENE, opts));
}
