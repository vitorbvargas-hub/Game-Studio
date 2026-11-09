// Regras de escolha de evolução (GS-003/knowledge/EVOLUTION_PROPOSAL.md §2–5), puras e determinísticas:
// - requisitos sempre visíveis (nível e atributos mínimos de cada caminho, cumpridos ou não);
// - com 2+ caminhos, quem escolhe é o jogador (o jogo nunca decide sozinho);
// - Auto-evoluir só age com UM caminho elegível, ou com a preferência que o jogador marcou para aquela espécie.

import type { EvoPath, MoveContent } from "./moves";
import type { Entity, StatBlock } from "./types";

export type ReqStat = "level" | keyof StatBlock;

export interface ReqCheck {
  stat: ReqStat;
  need: number;
  have: number;
  ok: boolean;
}

export interface PathStatus {
  path: EvoPath;
  reqs: ReqCheck[];
  /** Todos os requisitos cumpridos e a espécie alvo existe na sim. */
  eligible: boolean;
}

/** Nome dos requisitos em pt-BR. */
export const REQ_PT: Record<ReqStat, string> = { level: "Nível", hp: "PV", atk: "Ataque", def: "Defesa", spd: "Velocidade" };

/** Ordem dos atributos na UI. */
const STAT_ORDER: (keyof StatBlock)[] = ["hp", "atk", "def", "spd"];

/** Requisitos de um caminho contra o nível e os stats atuais do Digimon. */
export function checkPath(p: EvoPath, level: number, stats: StatBlock): ReqCheck[] {
  const out: ReqCheck[] = [{ stat: "level", need: p.level, have: level, ok: level >= p.level }];
  for (const k of STAT_ORDER) {
    const need = p.stats?.[k];
    if (need !== undefined) out.push({ stat: k, need, have: stats[k], ok: stats[k] >= need });
  }
  return out;
}

/** Todos os caminhos da espécie, com o estado de cada requisito. `known` filtra alvos que a sim não conhece. */
export function pathStatuses(mc: MoveContent, speciesId: string, level: number, stats: StatBlock, known?: (id: string) => boolean): PathStatus[] {
  return (mc.paths[speciesId] ?? []).map((path) => {
    const reqs = checkPath(path, level, stats);
    return { path, reqs, eligible: reqs.every((r) => r.ok) && (!known || known(path.to)) };
  });
}

export function statusesOf(mc: MoveContent, e: Pick<Entity, "speciesId" | "level" | "stats">, known?: (id: string) => boolean): PathStatus[] {
  return pathStatuses(mc, e.speciesId!, e.level, e.stats, known);
}

/** Há escolha a fazer: a espécie tem mais de um caminho. */
export function isBranching(mc: MoveContent, speciesId: string): boolean {
  return (mc.paths[speciesId]?.length ?? 0) > 1;
}

/**
 * Para onde o Auto-evoluir leva, ou null (espera o jogador):
 * - com preferência marcada para a espécie: só para ela, e só quando ela estiver elegível;
 * - sem preferência: só se houver exatamente UM caminho elegível.
 */
export function autoEvolveTarget(statuses: PathStatus[], pref?: string | null): string | null {
  const ok = statuses.filter((s) => s.eligible).map((s) => s.path.to);
  if (pref && statuses.some((s) => s.path.to === pref)) return ok.includes(pref) ? pref : null;
  return ok.length === 1 ? ok[0] : null;
}

/**
 * Alvo do pedido manual de evolução (intent `evolve`): `to` explícito precisa estar elegível; sem `to`, só vale
 * quando há um único elegível. Devolve o alvo ou o motivo da recusa (pt-BR).
 */
export function manualEvolveTarget(statuses: PathStatus[], to?: string): { to: string } | { reason: string } {
  if (!statuses.length) return { reason: "não evolui" };
  if (to) {
    const s = statuses.find((x) => x.path.to === to);
    if (!s) return { reason: "caminho inválido" };
    if (!s.eligible) {
      const miss = s.reqs.find((r) => !r.ok);
      return { reason: miss ? (miss.stat === "level" ? `evolui no nível ${miss.need}` : `precisa de ${REQ_PT[miss.stat]} ${miss.need}+`) : "espécie indisponível" };
    }
    return { to };
  }
  const ok = statuses.filter((s) => s.eligible);
  if (ok.length === 1) return { to: ok[0].path.to };
  if (ok.length > 1) return { reason: "escolha o caminho da evolução" };
  return { reason: `evolui no nível ${Math.min(...statuses.map((s) => s.path.level))}` };
}

/** Espécies com ramificação na linha a partir de `speciesId` (ela mesma e as formas seguintes), sem repetir. */
export function forksAhead(mc: MoveContent, speciesId: string, max = 4): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let frontier = [speciesId];
  for (let depth = 0; depth < max && frontier.length; depth++) {
    const next: string[] = [];
    for (const sp of frontier) {
      if (seen.has(sp)) continue;
      seen.add(sp);
      if (isBranching(mc, sp)) out.push(sp);
      for (const p of mc.paths[sp] ?? []) next.push(p.to);
    }
    frontier = next;
  }
  return out;
}
