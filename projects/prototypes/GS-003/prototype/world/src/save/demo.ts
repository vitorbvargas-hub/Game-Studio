// Modo de teste ?demo=evo: deixa o fundador VER a parceira ganhar XP, subir de nível e digievoluir numa sessão curta.
// - XP das vitórias × DEMO_XP_MULT (só na sessão; o multiplicador não vai para save nenhum);
// - a parceira começa a poucas vitórias da próxima evolução (um nível antes, com a barra quase cheia);
// - Auto-evoluir ligado (com 2+ caminhos o modal de escolha abre, como no jogo normal);
// - save SEPARADO (DEMO_SAVE_KEY): a 1ª carga copia o save normal (só leitura) ou começa do zero; depois o demo
//   continua no próprio slot. O save normal nunca é escrito nem apagado no modo demo.

import { enemyXp, xpToNext } from "@game/src/sim/formulas";
import { WORLD } from "../sim/params";
import { getEntity, getPlayer, grantXp, partnerSaveOf, restorePartner, type WorldSim } from "../sim/world";
import { SAVE_KEY, type StorageLike } from "./save";

export const DEMO_SAVE_KEY = `${SAVE_KEY}.demo-evo`;
export const DEMO_XP_MULT = 25;
/** Vitórias "pequenas" que faltam para a evolução ao entrar no demo (na floresta: 2–4 vitórias reais). */
export const DEMO_VICTORIES_LEFT = 3;
/** Vitória pequena da floresta: Bebê (estágio 1) Nv.3 (Criança/Adulto dão mais XP, e a conta fecha antes). */
const TYPICAL_WILD = { stage: 1, level: 3 };
/** Parceira de reserva quando a linha atual não tem próxima forma com espécie (Guilmon → Growlmon, com arte). */
export const DEMO_FALLBACK_SPECIES = "CREATURE-0003";

export type DemoMode = "evo";

export function demoModeOf(params: URLSearchParams): DemoMode | null {
  return params.get("demo") === "evo" ? "evo" : null;
}

/**
 * Storage do demo: o save do jogo (SAVE_KEY) é lido do slot do demo e, se ele ainda não existe, do save normal (só
 * leitura). Toda escrita/remoção de SAVE_KEY vai para o slot do demo; as demais chaves passam direto.
 */
export function demoStorage(base: StorageLike): StorageLike {
  const map = (k: string) => (k === SAVE_KEY ? DEMO_SAVE_KEY : k.startsWith(`${SAVE_KEY}.`) && !k.startsWith(DEMO_SAVE_KEY) ? `${DEMO_SAVE_KEY}${k.slice(SAVE_KEY.length)}` : k);
  return {
    getItem: (k) => (k === SAVE_KEY ? base.getItem(DEMO_SAVE_KEY) ?? base.getItem(SAVE_KEY) : base.getItem(map(k))),
    setItem: (k, v) => base.setItem(map(k), v),
    removeItem: (k) => base.removeItem(map(k)),
  };
}

/** XP de uma vitória típica da floresta com o multiplicador do demo. */
export function typicalVictoryXp(mult = DEMO_XP_MULT): number {
  return Math.round(enemyXp(WORLD.baseXpByStage[TYPICAL_WILD.stage], TYPICAL_WILD.level) * mult);
}

/** Próxima evolução com espécie na sim (nível mínimo entre os caminhos), ou null. */
export function nextEvoLevel(sim: WorldSim, speciesId: string): number | null {
  const paths = (sim.content.moves.paths[speciesId] ?? []).filter((p) => sim.content.species[p.to]);
  return paths.length ? Math.min(...paths.map((p) => p.level)) : null;
}

/**
 * Espécie que o demo usa: a atual, se ainda evolui; senão a forma anterior da mesma linha (ex. Growlmon → Guilmon);
 * senão o Guilmon de reserva.
 */
export function demoSpecies(sim: WorldSim, speciesId: string): string {
  if (nextEvoLevel(sim, speciesId) !== null) return speciesId;
  const prev = Object.entries(sim.content.moves.paths).find(([from, ps]) => ps.some((p) => p.to === speciesId) && nextEvoLevel(sim, from) !== null);
  return prev ? prev[0] : DEMO_FALLBACK_SPECIES;
}

export interface DemoPrep {
  speciesId: string;
  /** Espécie antes do ajuste (para o aviso). */
  from: string;
  level: number;
  evoLevel: number;
  xp: number;
  xpNext: number;
}

/**
 * Prepara a parceira do jogador para o demo: espécie que evolui, um nível antes da evolução e com a barra a ~2
 * vitórias de encher (XP × DEMO_XP_MULT). Liga o Auto-evoluir e o multiplicador. Mexe só na sim (o save normal fica).
 */
export function prepareDemo(sim: WorldSim, playerId: string, mult = DEMO_XP_MULT): DemoPrep | null {
  const p = getPlayer(sim.state, playerId);
  const e = p && getEntity(sim.state, p.partnerId);
  if (!p || !e) return null;
  const from = e.speciesId!;
  const speciesId = demoSpecies(sim, from);
  const evoLevel = nextEvoLevel(sim, speciesId) ?? 16;
  const level = Math.max(1, evoLevel - 1);
  if (speciesId !== e.speciesId || e.level > level) restorePartner(sim, playerId, { ...partnerSaveOf(e), speciesId, level, xp: 0 });
  else if (e.level < level) {
    // Sobe pelas regras do jogo (learnset de cada nível), sem evoluir.
    let need = xpToNext(sim.content.balance, e.level) - e.xp;
    for (let l = e.level + 1; l < level; l++) need += xpToNext(sim.content.balance, l);
    grantXp(sim, e.id, need, false);
  }
  const xpNext = xpToNext(sim.content.balance, level);
  e.xp = Math.max(0, xpNext - Math.round(typicalVictoryXp(mult) * DEMO_VICTORIES_LEFT));
  e.hp = e.maxHp;
  p.xpMult = mult;
  p.autoEvolve = true;
  return { speciesId, from, level, evoLevel, xp: e.xp, xpNext };
}
