// Tabela de espécies e skills para a sim, montada a partir do pacote digimon-fan (reaproveitado sem cópia)
// e de src/data/world-species.json. Não depende de nenhum asset visual.

import packBalance from "@game/packs/digimon-fan/balance.json";
import packCreatures from "@game/packs/digimon-fan/creatures.json";
import packSkills from "@game/packs/digimon-fan/skills.json";
import packTheme from "@game/packs/digimon-fan/theme.json";
import type { BalanceDef } from "@game/src/sim/types";
import worldSpecies from "../data/world-species.json";
import { loadMoveContent, type MoveContent } from "./moves";
import type { SkillDef, SpeciesDef, StatBlock } from "./types";

export interface WorldContent {
  species: Record<string, SpeciesDef>;
  /** Skills antigas do pacote (1 golpe por espécie); o combate usa `moves`. */
  skills: Record<string, SkillDef>;
  /** Sistema de golpes (4 slots, learnsets, elementos, MP). */
  moves: MoveContent;
  balance: BalanceDef;
  affinityChart: Record<string, Record<string, number>>;
}

interface PackCreature {
  id: string;
  name: string;
  affinity: string;
  stage: number;
  base: StatBlock;
  growth: StatBlock;
  skills: string[];
}

interface WorldSpeciesEntry {
  id: string;
  pack?: string;
  name?: string;
  stage?: number;
  affinity?: string;
  base?: StatBlock;
  growth?: StatBlock;
  skills?: string[];
}

export function loadWorldContent(): WorldContent {
  const radius = worldSpecies.radiusByStage as Record<string, number>;
  const pack = new Map((packCreatures as PackCreature[]).map((c) => [c.id, c]));
  const species: Record<string, SpeciesDef> = {};
  for (const e of worldSpecies.species as WorldSpeciesEntry[]) {
    const src = e.pack ? pack.get(e.pack) : undefined;
    if (e.pack && !src) throw new Error(`world-species: ${e.id} aponta para '${e.pack}', ausente no pacote`);
    const stage = e.stage ?? src!.stage;
    species[e.id] = {
      id: e.id,
      name: e.name ?? src!.name,
      stage,
      affinity: e.affinity ?? src!.affinity,
      base: e.base ?? src!.base,
      growth: e.growth ?? src!.growth,
      skills: e.skills ?? src!.skills,
      radius: radius[String(stage)] ?? 14,
    };
  }
  const skills: Record<string, SkillDef> = {};
  for (const s of [...(packSkills as SkillDef[]), ...(worldSpecies.skills as SkillDef[])]) skills[s.id] = s;
  for (const sp of Object.values(species))
    for (const sk of sp.skills) if (!skills[sk]) throw new Error(`world-species: skill '${sk}' de ${sp.id} não existe`);
  return {
    species,
    skills,
    moves: loadMoveContent(),
    balance: packBalance as BalanceDef,
    affinityChart: (packTheme as { affinityChart: Record<string, Record<string, number>> }).affinityChart,
  };
}
