// Sistema de golpes da sim (docs/MOVE_SYSTEM.md): 4 slots, learnset por nível/estágio, herança na evolução,
// MP e recarga por golpe, tipos físico/especial/buff/debuff/cura, alvos single/área/linha/projétil, multiplicadores
// de atributo (Vacina/Dados/Vírus, via affinityChart) e de elemento, e a escolha do AUTO por lista de prioridade
// com condição por slot (gambit simples, §2.5). Tudo puro e determinístico (sem RNG aqui); não conhece VFX.
//
// Dados: src/data/moves/{moves,learnsets}.json (game-design) + src/data/moves-sim.json (complemento [H] do game-dev)
// + src/data/moves-world.json (golpes e learnsets [H] das espécies que o game-dev adicionou ao mundo).

import officialLearnsets from "../data/moves/learnsets.json";
import officialMoves from "../data/moves/moves.json";
import simExtras from "../data/moves-sim.json";
import worldMoves from "../data/moves-world.json";
import evolutionPaths from "../data/evolution-paths.json";
import { SUB } from "./params";
import type { AutoRule, Entity, MoveDef, MoveTarget, MoveType, StatKey } from "./types";

export const MOVE_SLOTS = 4;

export interface MpRules {
  base: number;
  perLevel: number;
  regenPctOutOfCombat: number;
  regenPctInCombat: number;
}

export interface MoveContent {
  moves: Record<string, MoveDef>;
  basicMoveId: string;
  /** Learnset por espécie, ordenado por nível (ordem do arquivo como desempate). */
  learnsets: Record<string, { level: number; move: string }[]>;
  /** Próxima forma e o nível mínimo (= primeiro nível do learnset dela). Primeiro caminho de `paths`. */
  evolutions: Record<string, { to: string; level: number }>;
  /** Todos os caminhos de evolução de cada espécie, com os requisitos (EVOLUTION_PROPOSAL.md §3). */
  paths: Record<string, EvoPath[]>;
  inheritSlotsOnEvolve: number;
  elementChart: Record<string, Record<string, number>>;
  speciesElement: Record<string, string>;
  mp: MpRules;
  healSelfBelowPct: number;
}

/** Um caminho de evolução: nível mínimo e, opcionalmente, atributos mínimos (sempre visíveis ao jogador). */
export interface EvoPath {
  to: string;
  level: number;
  stats?: Partial<Record<"hp" | StatKey, number>>;
  /** De onde veio o ramo (fonte da pesquisa), para a UI. */
  source?: string;
}

const TYPES: MoveType[] = ["physical", "special", "buff", "debuff", "heal"];

type Raw = Record<string, unknown>;
const num = (v: unknown, d: number): number => (typeof v === "number" && Number.isFinite(v) ? v : d);
const str = (v: unknown, d: string): string => (typeof v === "string" && v ? v : d);

interface Extras {
  mp: MpRules;
  healSelfBelowPct: number;
  shapeDefaults: Record<string, { range?: number; rangeSpecial?: number; radius?: number; width?: number }>;
  effectDefaults: Record<string, { stat: StatKey; mult: number; ticks: number }>;
  effects: Record<string, { stat: StatKey; mult: number; ticks: number }>;
  elementChart: Record<string, Record<string, number>>;
  speciesElement: Record<string, string>;
}

/** Golpe do schema do game-design (§1.1) → unidades da sim (sub-tiles, ticks), com os complementos [H]. */
export function normalizeMove(r: Raw, x: Extras): MoveDef {
  const id = str(r.id, "");
  if (!id) throw new Error("golpe sem id");
  const type = str(r.kind ?? r.type, "physical") as MoveType;
  if (!TYPES.includes(type)) throw new Error(`golpe ${id}: kind '${type}' inválido`);
  const tg = (r.target ?? {}) as Raw;
  const shape = str(tg.shape, "single");
  const side = str(tg.side, "enemy");
  // Sem grupo no protótipo: lado aliado (ally/all_allies/self) = o próprio usuário.
  const target: MoveTarget = side !== "enemy" || type === "buff" || type === "heal" ? "self" : (shape as MoveTarget);
  const d = x.shapeDefaults[shape] ?? {};
  const rangeTiles = shape === "single" && type !== "physical" ? d.rangeSpecial ?? 2 : d.range ?? 0;
  const radiusTiles = shape === "line" ? (d.width ?? 1) / 2 : d.radius ?? 0;
  const effect = type === "buff" || type === "debuff" ? x.effects[id] ?? x.effectDefaults[type] : undefined;
  return {
    id,
    name: str(r.displayName ?? r.name, id),
    type,
    element: str(r.element, "neutral"),
    power: num(r.power, 0),
    cost: num(r.costMp ?? r.cost, 0),
    cooldownTicks: Math.max(0, Math.round(num(r.cooldownTicks, 0))),
    target,
    shape,
    range: Math.round(rangeTiles * SUB),
    radius: Math.round(radiusTiles * SUB),
    scaling: { atk: 1 },
    effect,
    vfx: str(r.vfxArchetype ?? r.vfx, "tackle_impact"),
    desc: typeof r.canonDescription === "string" ? r.canonDescription : undefined,
    verified: r.verified === true,
  };
}

/** Monta o conteúdo a partir dos JSON (exportado para testes com dados próprios). */
export function buildMoveContent(movesJson: Raw, learnJson: Raw, extras: Raw, pathsJson: Raw = {}): MoveContent {
  const x = extras as unknown as Extras;
  const moves: Record<string, MoveDef> = {};
  for (const r of (movesJson.moves ?? []) as Raw[]) {
    const m = normalizeMove(r, x);
    moves[m.id] = m;
  }
  const basicMoveId = str(movesJson.basicMoveId, "investida");
  if (!moves[basicMoveId]) throw new Error(`golpe básico '${basicMoveId}' ausente`);
  const learnsets: MoveContent["learnsets"] = {};
  const evoTo: Record<string, string[]> = {};
  for (const s of (learnJson.species ?? []) as Raw[]) {
    const sp = str(s.speciesId, "");
    learnsets[sp] = ((s.learnset ?? []) as Raw[])
      .map((e, i) => ({ level: num(e.level, 1), move: str(e.moveId ?? e.move, ""), i }))
      .sort((a, b) => a.level - b.level || a.i - b.i)
      .map(({ level, move }) => ({ level, move }));
    for (const e of learnsets[sp]) if (!moves[e.move]) throw new Error(`learnset ${sp}: golpe '${e.move}' não existe`);
    const to = (s.evolvesTo as string[] | undefined) ?? [];
    if (to.length) evoTo[sp] = to;
  }
  // Caminhos: os de evolvesTo (nível = entrada do learnset do alvo) e, por cima, os do evolution-paths.json.
  const paths: MoveContent["paths"] = {};
  for (const [from, tos] of Object.entries(evoTo)) paths[from] = tos.map((to) => ({ to, level: learnsets[to]?.[0]?.level ?? 99 }));
  for (const [from, list] of Object.entries((pathsJson.paths ?? {}) as Record<string, Raw[]>))
    paths[from] = list.map((r) => ({
      to: str(r.to, ""),
      level: num(r.level, learnsets[str(r.to, "")]?.[0]?.level ?? 99),
      ...(r.stats ? { stats: r.stats as EvoPath["stats"] } : {}),
      ...(typeof r.source === "string" ? { source: r.source } : {}),
    }));
  const evolutions: MoveContent["evolutions"] = {};
  for (const [from, list] of Object.entries(paths)) if (list[0]) evolutions[from] = { to: list[0].to, level: list[0].level };
  return {
    moves,
    basicMoveId,
    learnsets,
    evolutions,
    paths,
    inheritSlotsOnEvolve: num(learnJson.inheritSlotsOnEvolve, 2),
    elementChart: x.elementChart ?? {},
    speciesElement: x.speciesElement ?? {},
    mp: x.mp,
    healSelfBelowPct: num(x.healSelfBelowPct, 0.6),
  };
}

export function loadMoveContent(): MoveContent {
  const w = worldMoves as unknown as { moves: Raw[]; species: Raw[]; speciesElement: Record<string, string> };
  return buildMoveContent(
    { ...(officialMoves as unknown as Raw), moves: [...officialMoves.moves, ...w.moves] },
    { ...(officialLearnsets as unknown as Raw), species: [...officialLearnsets.species, ...w.species] },
    { ...(simExtras as unknown as Raw), speciesElement: { ...simExtras.speciesElement, ...w.speciesElement } },
    evolutionPaths as unknown as Raw,
  );
}

// ---------- regras puras ----------

/** maxMp = 20 + nível × 2 (§2.6). */
export function maxMpOf(rules: MpRules, level: number): number {
  return Math.round(rules.base + rules.perLevel * level);
}

/**
 * Golpes conhecidos até `level`. Uma forma abaixo da janela de níveis do learnset dela (ex.: Guilmon Nv.5, janela
 * 8–15) conhece os golpes de entrada (os do primeiro nível), como se tivesse acabado de evoluir.
 */
export function learnableAt(mc: MoveContent, speciesId: string, level: number): string[] {
  const ls = mc.learnsets[speciesId] ?? [];
  const entry = ls[0]?.level ?? 1;
  return ls.filter((e) => e.level <= Math.max(level, entry)).map((e) => e.move);
}

/** Loadout inicial: conhece tudo até o nível e equipa os 4 aprendidos mais recentes (na ordem do learnset). */
export function initialLoadout(mc: MoveContent, speciesId: string, level: number): { learned: string[]; moves: (string | null)[] } {
  const learned = [...new Set(learnableAt(mc, speciesId, level))];
  const eq = learned.slice(-MOVE_SLOTS);
  return { learned, moves: Array.from({ length: MOVE_SLOTS }, (_, i) => eq[i] ?? null) };
}

/**
 * Aprende o que ficou disponível (subida de nível ou evolução). Golpe novo só entra sozinho num slot VAZIO (§2.2);
 * senão fica na lista de conhecidos para o jogador equipar. Devolve [golpe, slot ou null].
 */
export function learnNew(mc: MoveContent, e: Entity): { moveId: string; slot: number | null }[] {
  const out: { moveId: string; slot: number | null }[] = [];
  for (const id of learnableAt(mc, e.speciesId!, e.level)) {
    if (e.learned.includes(id)) continue;
    e.learned.push(id);
    const free = e.moves.indexOf(null);
    if (free >= 0) e.moves[free] = id;
    out.push({ moveId: id, slot: free >= 0 ? free : null });
  }
  return out;
}

/** Herança padrão na evolução (§2.3): os golpes equipados de maior poder, até inheritSlotsOnEvolve. */
export function defaultInherit(mc: MoveContent, e: Entity): string[] {
  return e.moves
    .filter((s): s is string => !!s && s !== mc.basicMoveId)
    .map((id, i) => ({ id, i, p: mc.moves[id]?.power ?? 0 }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .slice(0, mc.inheritSlotsOnEvolve)
    .map((x) => x.id);
}

/** Valida uma troca de slots: 4 posições, só golpes conhecidos, sem repetir, pelo menos 1 ativo. */
export function validateSlots(e: Entity, slots: (string | null)[]): string | undefined {
  if (slots.length !== MOVE_SLOTS) return "são 4 slots";
  const used = slots.filter((s): s is string => !!s);
  if (used.length === 0) return "pelo menos 1 golpe ativo";
  if (new Set(used).size !== used.length) return "golpe repetido";
  if (used.some((s) => !e.learned.includes(s))) return "golpe não aprendido";
  return undefined;
}

/** Atributo efetivo com buffs/debuffs ativos (multiplicativos). */
export function effectiveStat(e: Pick<Entity, "stats" | "statuses">, stat: StatKey): number {
  let v = e.stats[stat];
  for (const s of e.statuses) if (s.stat === stat) v *= s.mult;
  return v;
}

/** "Ataque" do golpe: soma dos atributos do atacante × multiplicadores do golpe (hoje só ATK, §2.7). */
export function moveAttack(e: Pick<Entity, "stats" | "statuses">, m: MoveDef): number {
  let v = 0;
  for (const [k, mult] of Object.entries(m.scaling) as [StatKey, number][]) v += effectiveStat(e, k) * mult;
  return Math.max(1, v);
}

/** Camada elemental (§2.9): secundária, multiplicada sobre o atributo. */
export function elementMult(mc: MoveContent, moveElement: string, defenderElement: string): number {
  return mc.elementChart[moveElement]?.[defenderElement] ?? 1;
}

/** Pronto = sem recarga e com MP. */
export function moveReady(mc: MoveContent, e: Entity, id: string): boolean {
  const m = mc.moves[id];
  if (!m) return false;
  return (e.moveCd[id] ?? 0) <= 0 && e.mp >= m.cost;
}

/** Prioridade padrão (§2.5 item 4): os 4 slots na ordem do array equipado, condição `always`. */
export function defaultAutoRules(slots: (string | null)[]): AutoRule[] {
  return slots.filter((s): s is string => !!s).map((moveId) => ({ moveId, cond: "always" }));
}

/** Condição do slot + bom senso implícito: cura só ferido, buff/debuff só se ainda não ativo. */
function qualifies(mc: MoveContent, rule: AutoRule, m: MoveDef, e: Entity, target: Entity | undefined): boolean {
  const pct = (rule.pct ?? 50) / 100;
  switch (rule.cond) {
    case "target_hp_below_pct":
      if (!target || target.hp >= target.maxHp * pct) return false;
      break;
    case "self_hp_below_pct":
    case "ally_hp_below_pct":
      if (e.hp >= e.maxHp * pct) return false;
      break;
    case "buff_not_active":
      if (e.statuses.some((s) => s.moveId === m.id)) return false;
      break;
    default:
      break;
  }
  if (m.type === "heal") return e.hp < e.maxHp * (rule.cond === "always" ? mc.healSelfBelowPct : 1);
  if (m.type === "buff") return !e.statuses.some((s) => s.moveId === m.id);
  if (m.type === "debuff") return !!target && !target.statuses.some((s) => s.moveId === m.id);
  return !!target;
}

/**
 * Escolha do golpe (determinística, §2.5). 1) golpe pedido pelo jogador (use_move), se pronto; 2) a lista de
 * prioridade: primeiro slot ativo, fora de recarga, com MP e cuja condição vale (equipados fora da lista vão para
 * o fim, na ordem dos slots); 3) o básico universal (sem custo, sem recarga).
 */
export function chooseMove(mc: MoveContent, e: Entity, target: Entity | undefined): string {
  if (e.queuedMove && e.moves.includes(e.queuedMove) && moveReady(mc, e, e.queuedMove)) {
    const m = mc.moves[e.queuedMove];
    if (m.type !== "heal" || e.hp < e.maxHp) return e.queuedMove;
  }
  const equipped = e.moves.filter((s): s is string => !!s);
  const rules = [...e.autoRules.filter((r) => equipped.includes(r.moveId)), ...defaultAutoRules(equipped).filter((r) => !e.autoRules.some((x) => x.moveId === r.moveId))];
  for (const r of rules) {
    if (r.off) continue;
    const m = mc.moves[r.moveId];
    if (m && moveReady(mc, e, r.moveId) && qualifies(mc, r, m, e, target)) return r.moveId;
  }
  return mc.basicMoveId;
}

/** Alcance de lançamento do golpe (sub), somado ao alcance corpo a corpo. */
export function castReach(m: MoveDef): number {
  return m.target === "self" ? 0 : m.range;
}

/** Distância de um ponto P ao segmento AB e a projeção (0..1). */
export function segmentDistance(ax: number, ay: number, bx: number, by: number, px: number, py: number): { d: number; u: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const L = dx * dx + dy * dy;
  const u = L > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  const qx = ax + dx * u;
  const qy = ay + dy * u;
  return { d: Math.hypot(px - qx, py - qy), u };
}
