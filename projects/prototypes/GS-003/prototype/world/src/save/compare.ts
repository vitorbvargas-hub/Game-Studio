// Modo de teste ?team=compare (pedido do fundador): jogar com os dois Digimon 64 px na equipe e trocar entre eles —
// o Guilmon do PixelLab (CREATURE-0017-guilmon-pl64) e o Gabumon à mão (CREATURE-0119-gabumon-hand64).
//
// Na sim eles continuam sendo as espécies do jogo (Guilmon CREATURE-0003 e Gabumon CREATURE-0009: stats, golpes e
// elemento iguais aos do roster); a diferença é só de ARTE: a apresentação troca o visual da parceira local (e os
// retratos da equipe) pelo da criatura de comparação (`COMPARE_VISUALS`). Os dois ficam na equipe; a troca é a de
// Digimon (Shift+1–2, clique no retrato). Save SEPARADO (COMPARE_SAVE_KEY), como o ?partner=: o save normal nunca é
// escrito neste modo.

import type { CreatureVisual } from "../assets/creatures";
import { learnNew } from "../sim/moves";
import { getEntity, getPlayer, makeCreature, partnerSaveOf, restorePartner, type WorldSim } from "../sim/world";
import { slotStorage } from "./demo";
import { SAVE_KEY, type StorageLike, type TeamMember } from "./save";

export const COMPARE_SAVE_KEY = `${SAVE_KEY}.team-compare`;

/** Espécie da sim → criatura de comparação (só visual). */
export const COMPARE_VISUALS: Record<string, string> = {
  "CREATURE-0003": "CREATURE-0017", // Guilmon → Guilmon 64 px PixelLab
  "CREATURE-0009": "CREATURE-0119", // Gabumon → Gabumon 64 px à mão
};
/** Ordem na equipe: o Guilmon (PixelLab) começa ativo, o Gabumon (à mão) no slot 2. */
export const COMPARE_PAIR = ["CREATURE-0003", "CREATURE-0009"] as const;
/** Nível dos dois: o de entrada do estágio Criança (os golpes de entrada), longe da evolução. */
export const COMPARE_LEVEL = 8;

export function compareModeOf(params: URLSearchParams): boolean {
  return params.get("team") === "compare";
}

export function compareStorage(base: StorageLike): StorageLike {
  return slotStorage(base, COMPARE_SAVE_KEY);
}

/** Catálogo com o visual da comparação no lugar das duas espécies (retratos do HUD). */
export function withCompareVisuals(creatures: Record<string, CreatureVisual>): Record<string, CreatureVisual> {
  const out = { ...creatures };
  for (const [sp, vis] of Object.entries(COMPARE_VISUALS)) if (creatures[vis]) out[sp] = creatures[vis];
  return out;
}

/**
 * Garante a equipe de comparação: a parceira ativa é um dos dois (o Guilmon, se não for nenhum) e a equipe é só o
 * outro (o estado completo dele, se o save do slot já o tem). Devolve a equipe para o HUD. Mexe só na sim.
 */
export function prepareCompare(sim: WorldSim, playerId: string, savedTeam: TeamMember[] = []): { team: TeamMember[]; active: string } | null {
  const p = getPlayer(sim.state, playerId);
  const e = p && getEntity(sim.state, p.partnerId);
  if (!p || !e) return null;
  if (!(COMPARE_PAIR as readonly string[]).includes(e.speciesId!) || e.level < COMPARE_LEVEL) {
    const sp = (COMPARE_PAIR as readonly string[]).includes(e.speciesId!) ? e.speciesId! : COMPARE_PAIR[0];
    restorePartner(sim, playerId, { ...partnerSaveOf(e), speciesId: sp, level: COMPARE_LEVEL, xp: 0, learned: [], moves: [null, null, null, null], autoRules: [] });
    learnNew(sim.content.moves, e);
    e.autoRules = e.moves.filter((m): m is string => !!m).map((moveId) => ({ moveId, cond: "always" as const }));
  }
  e.hp = e.maxHp;
  e.mp = e.maxMp;
  const other = COMPARE_PAIR.find((s) => s !== e.speciesId)!;
  const kept = savedTeam.find((t) => t.species === other);
  p.autoEvolve = false;
  return { team: [kept ? { ...kept, hpPct: 100 } : { species: other, level: COMPARE_LEVEL, hpPct: 100 }], active: e.speciesId! };
}

/**
 * Capturas "lado a lado": põe (ou tira) um modelo parado do outro Digimon da equipe, `dx` tiles à direita da parceira.
 * É uma entidade `npc` (a sim não a move nem a ataca); a view desenha com o visual da comparação. Só para capturas.
 */
export function compareShowcase(sim: WorldSim, playerId: string, speciesId: string | null, dxTiles = 1.5): void {
  const w = sim.state;
  w.entities = w.entities.filter((e) => e.id !== "compare-show");
  const p = getPlayer(w, playerId);
  const pa = p && getEntity(w, p.partnerId);
  if (!speciesId || !pa || !sim.content.species[speciesId]) return;
  const e = makeCreature({ w, map: sim.map, c: sim.content, ev: [] }, "compare-show", "npc", speciesId, pa.level, { x: pa.x + Math.round(dxTiles * 16), y: pa.y });
  e.facing = "S";
  w.entities.push(e);
}
