// Regiões do GDD (src/data/content/regions.json) e os mapas jogáveis desta prova: qual mapa é de qual região, se a
// região está liberada (regra `unlock` do JSON) e o texto do motivo em pt-BR. Puro: sem DOM, sem sim.

import regionsJson from "../data/content/regions.json";
import digimonForest01Pack from "../data/maps/digimon-forest-01.aliases.json";
import digimonForest01Map from "../data/maps/digimon-forest-01.tmj.json";
import digimonForest01V8Pack from "../data/maps/v8/digimon-forest-01.aliases.json";
import digimonForest01V8Map from "../data/maps/v8/digimon-forest-01.tmj.json";
import digimonForest01V9Pack from "../data/maps/v9/digimon-forest-01.aliases.json";
import digimonForest01V9Map from "../data/maps/v9/digimon-forest-01.tmj.json";
import forestProofPack from "../data/maps/forest-proof.aliases.json";
import forestProofMap from "../data/maps/forest-proof.tmj.json";
import praiaPack from "../data/maps/praia.aliases.json";
import praiaMap from "../data/maps/praia.tmj.json";
import vilaPack from "../data/maps/vila.aliases.json";
import vilaMap from "../data/maps/vila.tmj.json";
import type { ScenePack } from "../assets/scene-tiles";
import type { TiledMap } from "../sim/map";

export interface RegionDef {
  id: string;
  name: string;
  levelRange: number[];
  safeZone: boolean;
  unlock: { type: string; minLevel?: number; orDefeatBoss?: string; requiresDefeated?: string | string[]; note?: string };
  wildSpecies: { speciesId: string; name: string; stage: number; levelRange: number[] }[];
  boss: string | null;
  routesTo: string[];
}

export const REGIONS: RegionDef[] = regionsJson.regions as RegionDef[];

export interface MapDef {
  id: string;
  region: string;
  /** Rótulo da rota no HUD. */
  route: string;
  tmj: TiledMap;
  pack: ScenePack;
  /** Cena com os 3 jogadores bot (só a floresta da prova visual). */
  scene: boolean;
  /** Variantes de look (?look=v8): outro .tmj/.aliases com o mesmo id (src/data/maps/<look>/). */
  looks?: Record<string, { tmj: TiledMap; pack: ScenePack }>;
}

/** O mapa no look pedido (ou o próprio, se ele não tiver essa variante). */
export function withLook(def: MapDef, look: string | null | undefined): MapDef {
  const v = look ? def.looks?.[look] : undefined;
  return v ? { ...def, tmj: v.tmj, pack: v.pack } : def;
}

export const MAPS: Record<string, MapDef> = {
  "forest-proof": { id: "forest-proof", region: "floresta_densa", route: "Rota 3", tmj: forestProofMap as unknown as TiledMap, pack: forestProofPack as ScenePack, scene: true },
  praia: { id: "praia", region: "praia_dos_postes", route: "Rota 4", tmj: praiaMap as unknown as TiledMap, pack: praiaPack as unknown as ScenePack, scene: false },
  vila: { id: "vila", region: "vila_dos_bebes", route: "Zona segura", tmj: vilaMap as unknown as TiledMap, pack: vilaPack as unknown as ScenePack, scene: false },
  // Map Factory (piloto): gerado do brief do game-design (world-design/briefs/digimon-forest-01.json); só por portal
  // (saída sul da Vila). A região do Mapa-múndi continua levando ao forest-proof (mapOfRegion pega o primeiro).
  "digimon-forest-01": {
    id: "digimon-forest-01",
    region: "floresta_densa",
    route: "Floresta Digimon",
    tmj: digimonForest01Map as unknown as TiledMap,
    pack: digimonForest01Pack as unknown as ScenePack,
    scene: false,
    // look v8 (profundidade, DRAKANTOS_VISUAL_STUDY.md): scripts/map-factory/briefs/digimon-forest-01.v8.build.json
    // look v9 (Quality Overhaul, fase 2) = v8 + primeiro plano, água correndo, vento e menos luzes:
    // scripts/map-factory/derive-look-v9.mjs
    looks: {
      v8: { tmj: digimonForest01V8Map as unknown as TiledMap, pack: digimonForest01V8Pack as unknown as ScenePack },
      v9: { tmj: digimonForest01V9Map as unknown as TiledMap, pack: digimonForest01V9Pack as unknown as ScenePack },
    },
  },
};

export const DEFAULT_MAP = "forest-proof";

export function regionById(id: string): RegionDef | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function mapOfRegion(regionId: string): MapDef | undefined {
  return Object.values(MAPS).find((m) => m.region === regionId);
}

export interface Progress {
  /** Nível do Tamer (o `minLevel` das regras do GDD é do Tamer). */
  tamerLevel: number;
  defeatedBosses: string[];
  /** Depuração (?desbloquear=1): tudo liberado. */
  all?: boolean;
}

/** "BOSS-KUWAGAMON" → "Kuwagamon". */
const BOSS_PT = (id: string) => id.replace(/^BOSS-/, "").toLowerCase().replace(/^./, (c) => c.toUpperCase());

/** Região liberada pela regra do JSON? Devolve também o motivo (pt-BR) para o Mapa-múndi. */
export function unlockState(r: RegionDef, p: Progress): { open: boolean; reason: string } {
  const u = r.unlock;
  const lvl = u.minLevel ?? 0;
  const bosses = ([] as string[]).concat(u.requiresDefeated ?? []);
  const hasLvl = p.tamerLevel >= lvl;
  const hasBosses = bosses.every((b) => p.defeatedBosses.includes(b));
  let open: boolean;
  let reason: string;
  switch (u.type) {
    case "none":
      open = true;
      reason = "Liberada";
      break;
    case "level_or_boss":
      open = hasLvl || (!!u.orDefeatBoss && p.defeatedBosses.includes(u.orDefeatBoss));
      reason = open ? "Liberada" : `Tamer Nv.${lvl} ou derrote ${BOSS_PT(u.orDefeatBoss ?? "")}`;
      break;
    default:
      open = hasLvl && hasBosses;
      reason = open ? "Liberada" : [!hasLvl ? `Tamer Nv.${lvl}` : "", ...bosses.filter((b) => !p.defeatedBosses.includes(b)).map((b) => `derrote ${BOSS_PT(b)}`)].filter(Boolean).join(" e ");
  }
  if (p.all) return { open: true, reason: "Liberada (depuração)" };
  return { open, reason };
}

/** Pode viajar para a região: liberada e com mapa nesta prova. */
export function canTravel(regionId: string, p: Progress): { ok: boolean; reason: string } {
  const r = regionById(regionId);
  if (!r) return { ok: false, reason: "Região desconhecida" };
  const u = unlockState(r, p);
  if (!u.open) return { ok: false, reason: `Bloqueada: ${u.reason}` };
  if (!mapOfRegion(regionId)) return { ok: false, reason: "Sem mapa nesta prova" };
  return { ok: true, reason: u.reason };
}
