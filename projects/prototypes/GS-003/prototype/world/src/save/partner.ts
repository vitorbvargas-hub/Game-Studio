// Modo de teste ?partner=<espécie>: põe qualquer espécie da sim como parceira ativa do jogador, num nível compatível
// com o estágio, para o fundador ver as animações dela no mapa (ex. ?partner=wargreymon, um Mega).
// - aceita o id da criatura (CREATURE-0016) ou o nome, sem diferenciar maiúsculas/espaços/hífens (wargreymon);
// - nível: o de entrada do estágio (ou o primeiro do learnset, se maior), preso ao teto do pacote (balance.maxLevel);
// - golpes: o learnset da espécie até esse nível, equipados nos 4 slots e na prioridade do AUTO;
// - save SEPARADO (PARTNER_SAVE_KEY), como o ?demo=evo: a 1ª carga copia o save normal (só leitura) ou começa do
//   zero; depois o teste continua no próprio slot. O save normal nunca é escrito nem apagado neste modo.

import { learnNew } from "../sim/moves";
import type { WorldContent } from "../sim/species";
import { getEntity, getPlayer, partnerSaveOf, restorePartner, type WorldSim } from "../sim/world";
import { slotStorage } from "./demo";
import { SAVE_KEY, type StorageLike } from "./save";

export const PARTNER_SAVE_KEY = `${SAVE_KEY}.partner-test`;

/** Nível de entrada por estágio (Criança 8, Adulto 16; Perfeito e Mega no teto do pacote). */
export const STAGE_ENTRY_LEVEL: Record<number, number> = { 1: 3, 2: 8, 3: 16, 4: 20, 5: 20 };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Valor cru de ?partner= (ou null). */
export function partnerParamOf(params: URLSearchParams): string | null {
  const v = params.get("partner")?.trim();
  return v ? v : null;
}

/** Id da espécie pedida: id exato (CREATURE-0016, SP-…) ou nome normalizado (wargreymon, War Greymon). */
export function resolvePartnerSpecies(content: Pick<WorldContent, "species">, raw: string): string | null {
  if (content.species[raw]) return raw;
  const up = raw.toUpperCase();
  if (content.species[up]) return up;
  const n = norm(raw);
  const hit = Object.values(content.species).find((sp) => norm(sp.name) === n || norm(sp.id) === n);
  return hit ? hit.id : null;
}

/** Nível da parceira de teste para a espécie. */
export function partnerTestLevel(content: Pick<WorldContent, "species" | "moves" | "balance">, speciesId: string): number {
  const sp = content.species[speciesId];
  const learn = content.moves.learnsets[speciesId] ?? [];
  const firstLearn = learn.length ? Math.min(...learn.map((l) => l.level)) : 1;
  const entry = STAGE_ENTRY_LEVEL[sp?.stage ?? 1] ?? 1;
  return Math.max(1, Math.min(content.balance.maxLevel, Math.max(entry, firstLearn)));
}

/** Storage do teste: igual ao do demo, num slot próprio. */
export function partnerStorage(base: StorageLike): StorageLike {
  return slotStorage(base, PARTNER_SAVE_KEY);
}

export interface PartnerPrep {
  speciesId: string;
  /** Espécie antes do ajuste (para o aviso). */
  from: string;
  level: number;
  moves: (string | null)[];
}

/**
 * Troca a parceira do jogador pela espécie pedida, no nível de teste, com o learnset dela equipado e vida/MP cheios.
 * Se a parceira já é dessa espécie (save do próprio slot de teste) e está no nível ou acima, só cura. Mexe só na sim.
 */
export function preparePartnerTest(sim: WorldSim, playerId: string, speciesId: string): PartnerPrep | null {
  const p = getPlayer(sim.state, playerId);
  const e = p && getEntity(sim.state, p.partnerId);
  if (!p || !e || !sim.content.species[speciesId]) return null;
  const from = e.speciesId!;
  const level = partnerTestLevel(sim.content, speciesId);
  if (e.speciesId !== speciesId || e.level < level) {
    restorePartner(sim, playerId, { ...partnerSaveOf(e), speciesId, level, xp: 0, learned: [], moves: [null, null, null, null], autoRules: [] });
    learnNew(sim.content.moves, e);
    e.autoRules = e.moves.filter((m): m is string => !!m).map((moveId) => ({ moveId, cond: "always" as const }));
  }
  e.hp = e.maxHp;
  e.mp = e.maxMp;
  return { speciesId, from, level: e.level, moves: [...e.moves] };
}
