// GS-012: tabelas de encontro por mapa (dados fora do código). A fonte de design é
// quality-overhaul/encounters/tables/<mapa>.json; a cópia do jogo fica em src/data/encounters/ e um teste garante que
// as duas são iguais. Mapas sem tabela continuam com o spawn antigo.

import digiForestV15b from "../../data/encounters/digi-forest-v15b.json";
import forest01 from "../../data/encounters/digimon-forest-01.json";
import type { WorldContent } from "../species";
import { PERIODS, RARITIES, WEATHERS, type EncounterTable } from "./rules";

export const ENCOUNTER_TABLES: Record<string, EncounterTable> = {
  "digimon-forest-01": forest01 as unknown as EncounterTable,
  "digi-forest-v15b": digiForestV15b as unknown as EncounterTable,
};

/** Mesmas regras do `scripts/encounters/sim.mjs --check`, contra as espécies carregadas. Lista de erros (vazia = ok). */
export function validateTable(t: EncounterTable, content: WorldContent): string[] {
  const errs: string[] = [];
  const terrains = new Set(Object.keys(t.terrains));
  const areas = new Set(t.areas.map((a) => a.id));
  for (const a of t.areas) if (!terrains.has(a.terrain)) errs.push(`área ${a.id}: terreno ${a.terrain}`);
  const ids = new Set<string>();
  for (const e of t.entries) {
    if (ids.has(e.id)) errs.push(`entrada repetida ${e.id}`);
    ids.add(e.id);
    if (!content.species[e.speciesId]) errs.push(`${e.id}: espécie ${e.speciesId} não existe`);
    for (const sp of e.speciesPool ?? []) if (!content.species[sp]) errs.push(`${e.id}: espécie ${sp} (pool) não existe`);
    if (!RARITIES.includes(e.rarity)) errs.push(`${e.id}: raridade ${e.rarity}`);
    if (e.levels[0] > e.levels[1]) errs.push(`${e.id}: níveis`);
    for (const tr of e.terrains ?? []) if (!terrains.has(tr)) errs.push(`${e.id}: terreno ${tr}`);
    for (const a of e.requires?.areas ?? []) if (!areas.has(a)) errs.push(`${e.id}: área ${a}`);
    for (const p of e.requires?.time ?? []) if (!(PERIODS as readonly string[]).includes(p)) errs.push(`${e.id}: horário ${p}`);
    for (const wx of e.requires?.weather ?? []) if (!(WEATHERS as readonly string[]).includes(wx)) errs.push(`${e.id}: clima ${wx}`);
    if (e.mode === "visible" && !e.visible) errs.push(`${e.id}: visível sem bloco visible`);
  }
  return errs;
}

/** Período do relógio do jogo (render/daynight DayPhase) → período da tabela. */
export function periodOf(phase: string): string {
  return phase === "Noite" ? "night" : phase === "Anoitecer" ? "dusk" : phase === "Amanhecer" ? "dawn" : "day";
}
