// Regras do fundador de 2026-11-12 para os encontros (GS-003 / v15 integration):
//  (b) mais encontros: com cerca de 3 a 5 s andando no mato sai um encontro (RATE_PARAMS, testado em
//      tests/v15-integration.test.ts com o próprio `step` das regras);
//  (c) Digimon aleatórios por mapa: qualquer espécie do roster atual pode aparecer em qualquer mapa, sem separação por
//      região. Os comuns e as "surpresas" saem do mato alto; os mais fortes ficam VISÍVEIS andando nas clareiras.
// Puro (sem render nem RNG próprio): transforma a tabela do mapa e as zonas de spawn antigas.

import type { SpawnZone } from "../map";
import type { WorldContent } from "../species";
import type { SpeciesDef } from "../types";
import type { EncounterEntry, EncounterTable } from "./rules";

/** Estágio a partir do qual o Digimon é "forte" (Campeão+): fica visível nas clareiras, não sai do mato comum. */
export const STRONG_STAGE = 3;

/** Áreas de mato "surpresa" (bolsões escondidos): id ou zoneRef com estas palavras. */
export const SURPRISE_AREA_RE = /surpresa|oculta/;

/** Parâmetros da regra (b): carência curta, taxa alta e rampa rápida (média ~3,5 s de mato por encontro). */
export const RATE_PARAMS: Pick<EncounterTable["params"], "graceSteps" | "minIntervalSec" | "ramp" | "pMax" | "emptyRustle"> = {
  graceSteps: [5, 9],
  minIntervalSec: 2,
  ramp: { start: 6, perStep: 0.05 },
  pMax: 0.55,
  emptyRustle: { chance: 0.05, graceSteps: [2, 4] },
};
/** Taxa base mínima de qualquer terreno de encontro (a regra b sobe todas as tabelas para pelo menos isto). */
export const MIN_BASE_RATE = 0.17;

/** Níveis por estágio (selvagem). */
export function levelsFor(stage: number): [number, number] {
  return stage <= 1 ? [1, 4] : stage === 2 ? [3, 7] : stage === 3 ? [10, 14] : stage === 4 ? [18, 22] : [26, 30];
}

/**
 * Roster atual: as espécies carregadas na sim que têm visual no jogo (`hasVisual`; sem visual o Digimon sairia como
 * placeholder). Ordem estável por id.
 */
export function rosterOf(content: WorldContent, hasVisual: (speciesId: string) => boolean = () => true): SpeciesDef[] {
  return Object.values(content.species)
    .filter((s) => hasVisual(s.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Tabela do mapa com as regras (b) e (c): mantém áreas, terrenos e pontos visíveis do mapa; troca as entradas
 * aleatórias pelo roster inteiro (Bebês comuns, Crianças incomuns, Campeões+ muito raros e só como surpresa, com
 * peso ×6 nos bolsões surpresa) e o Digimon de cada ponto visível por um sorteio entre os fortes do roster.
 */
export function rosterTable(base: EncounterTable, roster: SpeciesDef[]): EncounterTable {
  const surprise = base.areas.filter((a) => SURPRISE_AREA_RE.test(a.id) || SURPRISE_AREA_RE.test(a.zoneRef ?? "")).map((a) => a.id);
  const strong = roster.filter((s) => s.stage >= STRONG_STAGE);
  const entries: EncounterEntry[] = [];
  for (const s of roster) {
    const id = `roster-${s.id.toLowerCase()}`;
    const boost = surprise.length ? [{ when: { areas: surprise }, weightMult: s.stage >= STRONG_STAGE ? 6 : s.stage === 2 ? 2 : 0.5 }] : undefined;
    if (s.stage <= 1) entries.push({ id, speciesId: s.id, name: s.name, mode: "random", rarity: "common", weight: 30, levels: levelsFor(1), ...(boost ? { modifiers: boost } : {}) });
    else if (s.stage === 2) entries.push({ id, speciesId: s.id, name: s.name, mode: "random", rarity: "uncommon", weight: 12, levels: levelsFor(2), ...(boost ? { modifiers: boost } : {}) });
    else entries.push({ id, speciesId: s.id, name: s.name, mode: "random", rarity: "very_rare", weight: 0.6, levels: levelsFor(s.stage), ...(boost ? { modifiers: boost } : {}) });
  }
  for (const e of base.entries) {
    if (e.mode !== "visible" || !e.visible) continue;
    const pool = strong.length ? strong : roster;
    entries.push({ ...e, speciesId: pool[0].id, name: "Digimon forte", rarity: "rare", levels: [10, 16], speciesPool: pool.map((s) => s.id), requires: undefined });
  }
  const terrains = Object.fromEntries(Object.entries(base.terrains).map(([k, t]) => [k, { ...t, baseRate: Math.max(t.baseRate, MIN_BASE_RATE) }]));
  return { ...base, params: { ...base.params, ...RATE_PARAMS }, terrains, entries };
}

/** Mapas sem tabela (spawn antigo): cada zona sorteia entre todo o roster não-forte (regra c). */
export function rosterSpawns(spawns: SpawnZone[], roster: SpeciesDef[]): SpawnZone[] {
  const ids = roster.filter((s) => s.stage < STRONG_STAGE).map((s) => s.id);
  return ids.length ? spawns.map((z) => ({ ...z, species: ids })) : spawns;
}
