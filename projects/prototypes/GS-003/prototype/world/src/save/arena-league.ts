// Arena local (GS-006, PVP_ARENA_SPEC.md §5, §7 e §9.1): quem o jogador pode levar (só os Digimon REAIS do save —
// parceira, equipe e Box), validação de posse, composições salvas, oponente fantasma (time salvo ou um dos 3 bots da
// floresta com nível/estágio próximos), "poder" do time com aviso de desbalanceamento, histórico e rating local
// placeholder por modo. Puro: sem DOM, sem rede (nada aqui sai do localStorage do jogador).

import { statsAtLevel } from "@game/src/sim/formulas";
import { defaultAutoRules, initialLoadout, maxMpOf } from "../sim/moves";
import type { ArenaTeam, Fighter } from "../sim/arena";
import type { WorldContent } from "../sim/species";
import type { AutoRule, StatBlock } from "../sim/types";
import type { PartnerSave } from "../sim/world";
import forestScene from "../data/scenes/forest-proof.scene.json";

export type ArenaMode = "auto" | "manual";

/** Membro do Box no save (v8). */
export interface BoxMember {
  species: string;
  level: number;
}

/** Composição salva (Automático): formação + kit + prioridade do AUTO de cada um, como estavam ao salvar. */
export interface ArenaComp {
  id: string;
  name: string;
  fighters: Fighter[];
  savedAt: number;
}

export interface ArenaRecord {
  mode: ArenaMode;
  result: "win" | "loss" | "draw";
  /** Placar de rodadas (manual), ex. "2-1". */
  score?: string;
  mine: { speciesId: string; level: number }[];
  foe: { speciesId: string; level: number }[];
  foeName: string;
  date: number;
  damage: [number, number];
  hits: [number, number];
  normalized: boolean;
  ratingAfter: number;
}

export interface ArenaSave {
  comps: ArenaComp[];
  history: ArenaRecord[];
  /** Rating LOCAL placeholder (não é ranking: não sai do aparelho e não compara com outros jogadores). */
  rating: Record<ArenaMode, number>;
}

export const RATING_START = 1000;
export const HISTORY_MAX = 50;
export const COMPS_MAX = 12;
/** Diferença de poder a partir da qual a tela avisa que o confronto está desbalanceado [H]. */
export const IMBALANCE_RATIO = 1.25;

export function emptyArena(): ArenaSave {
  return { comps: [], history: [], rating: { auto: RATING_START, manual: RATING_START } };
}

/** Saneia o bloco da Arena vindo do save (campos ausentes/estranhos viram o padrão). */
export function normalizeArena(raw: unknown): ArenaSave {
  const a = (raw && typeof raw === "object" ? raw : {}) as Partial<ArenaSave>;
  const r = (a.rating ?? {}) as Partial<Record<ArenaMode, number>>;
  return {
    comps: Array.isArray(a.comps) ? a.comps.filter((c) => c && typeof c.name === "string" && Array.isArray(c.fighters)).slice(0, COMPS_MAX) : [],
    history: Array.isArray(a.history) ? a.history.filter((h) => h && (h.mode === "auto" || h.mode === "manual")).slice(0, HISTORY_MAX) : [],
    rating: { auto: typeof r.auto === "number" ? r.auto : RATING_START, manual: typeof r.manual === "number" ? r.manual : RATING_START },
  };
}

// ---------- elenco do save ----------

/** O que a Arena lê do save: parceira (estado completo), equipe (slots 2–5) e Box. */
export interface OwnedDigimon {
  partner: PartnerSave;
  team: { species: string; level: number; hpPct: number }[];
  box: BoxMember[];
}

export interface RosterEntry {
  fighter: Fighter;
  source: "Parceira" | "Equipe" | "Box";
  name: string;
  stage: number;
  affinity: string;
  element: string;
  stats: StatBlock;
  maxMp: number;
  hpPct: number;
  eligible: boolean;
  reason?: string;
}

/** Digimon do save por referência ("partner", "team:N", "box:N"); undefined se não existe no save. */
export function ownedFighter(save: OwnedDigimon, content: WorldContent, ref: string): Fighter | undefined {
  const mc = content.moves;
  const fromLearnset = (speciesId: string, level: number): Fighter | undefined => {
    if (!content.species[speciesId]) return undefined;
    // Membros fora do campo não têm kit próprio no save: o kit é o do learnset no nível (igual à aba Golpes).
    const lo = initialLoadout(mc, speciesId, level);
    return { ref, speciesId, level, learned: lo.learned, moves: lo.moves, autoRules: defaultAutoRules(lo.moves) };
  };
  if (ref === "partner") {
    const p = save.partner;
    if (!p || !content.species[p.speciesId]) return undefined;
    return { ref, speciesId: p.speciesId, level: p.level, learned: [...p.learned], moves: [...p.moves], autoRules: p.autoRules.length ? p.autoRules.map((r) => ({ ...r })) : defaultAutoRules(p.moves) };
  }
  const m = /^(team|box):(\d+)$/.exec(ref);
  if (!m) return undefined;
  const list = m[1] === "team" ? save.team : save.box;
  const e = list[Number(m[2])];
  return e ? fromLearnset(e.species, Math.max(1, Math.floor(e.level))) : undefined;
}

/** Todos os Digimon do save com a ficha para a seleção (elegível = HP > 0 no save). */
export function arenaRoster(save: OwnedDigimon, content: WorldContent): RosterEntry[] {
  const refs = ["partner", ...save.team.map((_, i) => `team:${i}`), ...save.box.map((_, i) => `box:${i}`)];
  const out: RosterEntry[] = [];
  for (const ref of refs) {
    const f = ownedFighter(save, content, ref);
    if (!f) continue;
    const sp = content.species[f.speciesId];
    const hpPct = ref.startsWith("team:") ? save.team[Number(ref.slice(5))].hpPct : 100;
    out.push({
      fighter: f,
      source: ref === "partner" ? "Parceira" : ref.startsWith("team:") ? "Equipe" : "Box",
      name: sp.name,
      stage: sp.stage,
      affinity: sp.affinity,
      element: content.moves.speciesElement[f.speciesId] ?? "neutral",
      stats: statsAtLevel(sp.base, sp.growth, f.level),
      maxMp: maxMpOf(content.moves.mp, f.level),
      hpPct,
      eligible: hpPct > 0,
      ...(hpPct > 0 ? {} : { reason: "sem PV no save (cure antes)" }),
    });
  }
  return out;
}

/** Escolha do jogador: referência ao save + prioridade do AUTO editada para esta partida (opcional). */
export interface Pick {
  ref: string;
  autoRules?: AutoRule[];
}

/**
 * Monta o time do jogador SÓ com Digimon do save (§5.2, teste de posse): 1 a 3, sem repetir, todos existentes e
 * elegíveis. A prioridade editada só aceita golpes que o Digimon conhece. Devolve o time ou o motivo da recusa.
 */
export function buildPlayerTeam(save: OwnedDigimon, content: WorldContent, picks: Pick[], name: string): { team: ArenaTeam } | { error: string } {
  if (!picks.length) return { error: "escolha pelo menos 1 Digimon" };
  if (picks.length > 3) return { error: "no máximo 3 Digimon" };
  if (new Set(picks.map((p) => p.ref)).size !== picks.length) return { error: "Digimon repetido" };
  const roster = arenaRoster(save, content);
  const fighters: Fighter[] = [];
  for (const p of picks) {
    const r = roster.find((x) => x.fighter.ref === p.ref);
    if (!r) return { error: `${p.ref} não está no seu save` };
    if (!r.eligible) return { error: `${r.name}: ${r.reason}` };
    const f = { ...r.fighter, learned: [...r.fighter.learned], moves: [...r.fighter.moves], autoRules: r.fighter.autoRules.map((x) => ({ ...x })) };
    if (p.autoRules) {
      const seen = new Set<string>();
      f.autoRules = p.autoRules.filter((x) => f.learned.includes(x.moveId) && !seen.has(x.moveId) && seen.add(x.moveId)).map((x) => ({ ...x }));
    }
    fighters.push(f);
  }
  return { team: { name, fighters } };
}

/**
 * Confere que cada Fighter de um time do JOGADOR ainda é o que está no save (mesma referência, espécie e nível). Um
 * Digimon que não está no save (ou que mudou) é recusado — a Arena nunca aceita um Digimon "de fora".
 */
export function ownershipError(save: OwnedDigimon, content: WorldContent, team: ArenaTeam): string | undefined {
  for (const f of team.fighters) {
    const o = ownedFighter(save, content, f.ref);
    if (!o || o.speciesId !== f.speciesId || o.level !== f.level) return `${content.species[f.speciesId]?.name ?? f.speciesId} não está no seu save`;
  }
  return undefined;
}

// ---------- fantasmas ----------

export interface GhostSource {
  id: string;
  kind: "comp" | "bot";
  name: string;
  detail: string;
}

/** Os 3 bots da floresta (cena da prova) com o time [H] de cada um: a parceira dele + 2 espécies da floresta. */
export const FOREST_BOTS: { id: string; name: string; lines: string[] }[] = [
  { id: "bot1", name: "Lumi", lines: ["CREATURE-0012", "CREATURE-0107", "CREATURE-0104"] },
  { id: "bot2", name: "RafaDGT", lines: ["CREATURE-0009", "CREATURE-0101", "CREATURE-0109"] },
  { id: "bot3", name: "Bia_Tamer", lines: ["CREATURE-0006", "CREATURE-0106", "CREATURE-0115"] },
];

// a parceira de cada bot na cena tem de ser a primeira linha do time dele
for (const b of FOREST_BOTS) {
  const p = (forestScene.players as { id: string; partnerSpecies: string; name: string }[]).find((x) => x.id === b.id);
  if (!p || p.partnerSpecies !== b.lines[0] || p.name !== b.name) throw new Error(`bot ${b.id} fora da cena da floresta`);
}

export function ghostSources(arena: ArenaSave): GhostSource[] {
  return [
    ...arena.comps.map((c) => ({ id: `comp:${c.id}`, kind: "comp" as const, name: `Fantasma: ${c.name}`, detail: `time salvo · ${c.fighters.length} Digimon` })),
    ...FOREST_BOTS.map((b) => ({ id: `bot:${b.id}`, kind: "bot" as const, name: b.name, detail: "Tamer da Floresta Densa · nível e estágio próximos dos seus" })),
  ];
}

/** Linha de evolução de uma espécie (ancestrais pelo primeiro caminho que leva a ela + descendentes pelo primeiro caminho). */
export function evolutionLine(content: WorldContent, speciesId: string): string[] {
  const paths = content.moves.paths;
  const back: string[] = [];
  let cur = speciesId;
  for (let i = 0; i < 6; i++) {
    const from = Object.keys(paths).find((k) => paths[k].some((p) => p.to === cur));
    if (!from || back.includes(from)) break;
    back.unshift(from);
    cur = from;
  }
  const fwd: string[] = [];
  cur = speciesId;
  for (let i = 0; i < 6; i++) {
    const to = paths[cur]?.[0]?.to;
    if (!to || fwd.includes(to)) break;
    fwd.push(to);
    cur = to;
  }
  return [...back, speciesId, ...fwd].filter((id) => !!content.species[id]);
}

/**
 * Time de um bot da floresta perto do time do jogador: nível = média do jogador +0/−1/+1 e, em cada linha, a forma de
 * estágio mais próximo do estágio médio do jogador (empate → a menor). Kit = learnset no nível, AUTO padrão.
 */
export function botGhost(content: WorldContent, botId: string, mine: Fighter[]): ArenaTeam {
  const b = FOREST_BOTS.find((x) => x.id === botId);
  if (!b) throw new Error(`bot desconhecido: ${botId}`);
  const n = Math.max(1, mine.length);
  const avgLevel = mine.reduce((s, f) => s + f.level, 0) / n || 1;
  const avgStage = mine.reduce((s, f) => s + (content.species[f.speciesId]?.stage ?? 1), 0) / n || 1;
  const maxLevel = content.balance.maxLevel;
  const fighters = b.lines.slice(0, Math.max(1, Math.min(3, mine.length || 3))).map((line, i) => {
    const level = Math.max(1, Math.min(maxLevel, Math.round(avgLevel) + [0, -1, 1][i]));
    const forms = evolutionLine(content, line);
    const speciesId = forms.reduce((best, id) => {
      const d = Math.abs(content.species[id].stage - avgStage);
      const bd = Math.abs(content.species[best].stage - avgStage);
      return d < bd || (d === bd && content.species[id].stage < content.species[best].stage) ? id : best;
    }, forms[0] ?? line);
    const lo = initialLoadout(content.moves, speciesId, level);
    return { ref: `${b.id}:${i}`, speciesId, level, learned: lo.learned, moves: lo.moves, autoRules: defaultAutoRules(lo.moves) };
  });
  return { name: b.name, fighters };
}

/** Oponente de uma fonte: cópia do time salvo (fantasma) ou o time do bot ajustado ao jogador. */
export function ghostTeam(content: WorldContent, arena: ArenaSave, sourceId: string, mine: Fighter[]): ArenaTeam | undefined {
  if (sourceId.startsWith("comp:")) {
    const c = arena.comps.find((x) => `comp:${x.id}` === sourceId);
    return c ? { name: `Fantasma: ${c.name}`, fighters: c.fighters.filter((f) => !!content.species[f.speciesId]).map((f) => ({ ...f, learned: [...f.learned], moves: [...f.moves], autoRules: f.autoRules.map((r) => ({ ...r })) })) } : undefined;
  }
  if (sourceId.startsWith("bot:")) return botGhost(content, sourceId.slice(4), mine);
  return undefined;
}

// ---------- poder / balanceamento ----------

/** Poder [H] de um Digimon: PV/2 + 2×ATQ + 1,5×DEF + VEL, nos stats do nível (ou do nível comum da Arena Nivelada). */
export function fighterPower(content: WorldContent, f: Fighter, level = f.level): number {
  const sp = content.species[f.speciesId];
  if (!sp) return 0;
  const s = statsAtLevel(sp.base, sp.growth, level);
  return Math.round(s.hp / 2 + s.atk * 2 + s.def * 1.5 + s.spd);
}

export function teamPower(content: WorldContent, t: ArenaTeam | Fighter[], level?: number): number {
  const list = Array.isArray(t) ? t : t.fighters;
  return list.reduce((s, f) => s + fighterPower(content, f, level ?? f.level), 0);
}

/** Aviso de desbalanceamento (poder de um lado ≥ 1,25× o do outro), em pt-BR; undefined se equilibrado. */
export function imbalanceWarning(mine: number, foe: number): string | undefined {
  if (mine <= 0 || foe <= 0) return undefined;
  const r = Math.max(mine, foe) / Math.min(mine, foe);
  if (r < IMBALANCE_RATIO) return undefined;
  const pct = Math.round((r - 1) * 100);
  return mine > foe ? `Confronto desbalanceado: seu time tem ${pct}% mais poder.` : `Confronto desbalanceado: o oponente tem ${pct}% mais poder.`;
}

// ---------- composições, histórico e rating ----------

export function saveComp(arena: ArenaSave, name: string, team: ArenaTeam, now: number): ArenaSave {
  const clean = name.trim().slice(0, 24) || `Time ${arena.comps.length + 1}`;
  const existing = arena.comps.find((c) => c.name === clean);
  const comp: ArenaComp = { id: existing?.id ?? `c${now.toString(36)}`, name: clean, fighters: team.fighters.map((f) => ({ ...f, learned: [...f.learned], moves: [...f.moves], autoRules: f.autoRules.map((r) => ({ ...r })) })), savedAt: now };
  const comps = existing ? arena.comps.map((c) => (c === existing ? comp : c)) : [comp, ...arena.comps].slice(0, COMPS_MAX);
  return { ...arena, comps };
}

/** Rating local placeholder: vitória +20, derrota −15 (mínimo 0), empate 0. */
export function ratingAfter(rating: number, result: ArenaRecord["result"]): number {
  return Math.max(0, rating + (result === "win" ? 20 : result === "loss" ? -15 : 0));
}

/** Registra uma partida no histórico (mais recente primeiro) e atualiza o rating do modo. */
export function recordMatch(arena: ArenaSave, rec: Omit<ArenaRecord, "ratingAfter">): ArenaSave {
  const r = ratingAfter(arena.rating[rec.mode], rec.result);
  return { ...arena, rating: { ...arena.rating, [rec.mode]: r }, history: [{ ...rec, ratingAfter: r }, ...arena.history].slice(0, HISTORY_MAX) };
}

export function historyOf(arena: ArenaSave, mode: ArenaMode): ArenaRecord[] {
  return arena.history.filter((h) => h.mode === mode);
}
