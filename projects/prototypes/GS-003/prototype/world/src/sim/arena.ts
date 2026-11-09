// Arena PvP local (GS-006, docs/PVP_ARENA_SPEC.md §3, §6 e §10): partida 3v3 automática (um ativo por lado, o
// próximo da formação entra no KO, HP não reseta).
// NÃO tem motor próprio: cada partida é um WorldState comum num mapa de estádio, e o combate passa pelas mesmas
// funções do mundo — fight/chooseMove (IA do AUTO), resolveAttack/computeDamage (dano, atributo, elemento, MP,
// recargas), tickCooldowns/timedStates (FSM) e useMoveError/queuedMove (golpe pedido pelo jogador).
// Puro e determinístico (RNG serializado no estado); não conhece DOM, Canvas nem a apresentação.

import { isSolidAt, type WorldMap } from "./map";
import { SUB, WORLD } from "./params";
import { setState } from "./fsm";
import type { WorldContent } from "./species";
import type { AutoRule, Entity, Vec, WorldEvent, WorldState } from "./types";
import {
  alive,
  applyStats,
  fight,
  makeCreature,
  snapshotOf,
  tickCooldowns,
  timedStates,
  type Ctx,
  type WorldSim,
} from "./world";

/** Um Digimon de Arena: cópia do que está no save (ou num time salvo/fantasma) no momento da partida. */
export interface Fighter {
  /** Origem no save do jogador: "partner", "team:N" ou "box:N" (fantasmas guardam a origem de quando foram salvos). */
  ref: string;
  speciesId: string;
  level: number;
  learned: string[];
  moves: (string | null)[];
  autoRules: AutoRule[];
}

/** Um lado da partida. A ordem de `fighters` é a formação (quem entra primeiro). */
export interface ArenaTeam {
  name: string;
  fighters: Fighter[];
}

export type Side = 0 | 1;
export const SIDE_IDS = ["A", "B"] as const;
/** Dono das entidades de cada lado (o Presenter trata o lado A como "meu"). */
export const ARENA_OWNER = ["arena-A", "arena-B"] as const;

export interface SideStats {
  /** Dano total causado (eventos `damage` de tipo dano). */
  damage: number;
  /** Golpes que conectaram (dano que não foi `miss`). */
  hits: number;
  /** Golpes usados (attack_start). */
  attacks: number;
}

export interface ArenaOptions {
  /** Arena Nivelada (§7.2): todos lutam no mesmo nível (média dos participantes). Desligada por padrão. */
  normalize?: boolean;
  /** Duração máxima (ticks). Automático: 180 s. */
  limitTicks?: number;
}

export const AUTO_LIMIT_TICKS = 1800;
export const TEAM_MAX = 3;

// ---------- estádio ----------

/** Campo jogável (tiles) e a borda de arquibancada em volta (fora do campo = sólido). */
export const ARENA_FIELD = { w: 20, h: 12, margin: 5 } as const;

export function fieldRect(): { x0: number; y0: number; x1: number; y1: number } {
  const m = ARENA_FIELD.margin;
  return { x0: m, y0: m, x1: m + ARENA_FIELD.w, y1: m + ARENA_FIELD.h };
}

/**
 * Mapa do estádio: gramado com 2 tons de grama do pacote vila-v5 em faixas de 2 colunas (as listras de corte e as
 * linhas de cal são desenhadas pela apresentação). Fora do campo não há chão (a arquibancada também é da
 * apresentação) e é tudo sólido. A sim só usa `solid` e `starts`.
 */
export function arenaMap(): WorldMap {
  const { w: fw, h: fh, margin: m } = ARENA_FIELD;
  const W = fw + m * 2;
  const H = fh + m * 2;
  const ground: string[] = new Array(W * H).fill("");
  const solid = new Uint8Array(W * H).fill(1);
  for (let y = m; y < m + fh; y++)
    for (let x = m; x < m + fw; x++) {
      const i = y * W + x;
      solid[i] = 0;
      ground[i] = Math.floor((x - m) / 2) % 2 === 0 ? "vl5_grass_01" : "vl5_grass_02";
    }
  const sub = (t: number) => Math.round(t * SUB);
  return {
    id: "arena",
    width: W,
    height: H,
    tileSize: 32,
    tileLayers: [{ name: "ground", keys: ground }],
    solid,
    props: [],
    spawns: [],
    starts: { A: { x: sub(m + 4), y: sub(m + fh / 2) }, B: { x: sub(m + fw - 4), y: sub(m + fh / 2) } },
    portals: [],
  };
}

// ---------- montagem ----------

function newState(seed: number): WorldState {
  return { tick: 0, rng: { rngState: seed >>> 0 }, seq: 0, idSeq: 0, encSeq: 0, entities: [], players: [], encounters: [], pendingSpawns: [] };
}

function ctxOf(sim: WorldSim, ev: WorldEvent[] = []): Ctx {
  return { w: sim.state, map: sim.map, c: sim.content, ev };
}

/** Valida um time (1 a 3 Digimon de espécies conhecidas, golpes que existem). Devolve o motivo ou undefined. */
export function teamError(content: WorldContent, t: ArenaTeam): string | undefined {
  if (!t.fighters.length) return "time vazio";
  if (t.fighters.length > TEAM_MAX) return `no máximo ${TEAM_MAX} Digimon`;
  for (const f of t.fighters) {
    if (!content.species[f.speciesId]) return `espécie desconhecida: ${f.speciesId}`;
    if (!(f.level >= 1)) return "nível inválido";
  }
  return undefined;
}

/** Nível comum da Arena Nivelada: média arredondada de todos os participantes. */
export function normalizedLevel(teams: ArenaTeam[]): number {
  const all = teams.flatMap((t) => t.fighters.map((f) => f.level));
  return Math.max(1, Math.round(all.reduce((s, l) => s + l, 0) / Math.max(1, all.length)));
}

/**
 * Entidade de combate de um Fighter, pelo mesmo makeCreature do mundo, com o kit e a prioridade do AUTO do save
 * (golpes que a espécie não conhece mais são descartados, como no restorePartner). Começa fora do mapa (não está em
 * `entities`) até entrar.
 */
function fighterEntity(ctx: Ctx, side: Side, idx: number, f: Fighter, pos: Vec, level?: number): Entity {
  const e = makeCreature(ctx, `${SIDE_IDS[side]}${idx}`, side === 0 ? "partner" : "remote_partner", f.speciesId, Math.max(1, Math.floor(f.level)), pos);
  const known = new Set(f.learned.filter((id) => ctx.c.moves.moves[id]));
  e.learned = [...known];
  e.moves = [0, 1, 2, 3].map((i) => (f.moves[i] && known.has(f.moves[i]!) ? f.moves[i]! : null));
  e.autoRules = f.autoRules.filter((r) => known.has(r.moveId)).map((r) => ({ ...r }));
  e.ownerId = ARENA_OWNER[side];
  e.team = SIDE_IDS[side];
  e.speed = WORLD.partnerSpeed;
  // Em combate o tempo todo: regen de MP na taxa de combate (tickCooldowns olha encounterId).
  e.encounterId = "arena";
  e.facing = side === 0 ? "E" : "W";
  if (level !== undefined) {
    e.level = level;
    applyStats(ctx, e, 1);
  }
  e.hp = e.maxHp;
  e.mp = e.maxMp;
  return e;
}

function enter(ctx: Ctx, e: Entity, pos: Vec): void {
  e.x = pos.x;
  e.y = pos.y;
  e.home = { ...pos };
  ctx.w.entities.push(e);
  ctx.ev.push({ t: "spawn", tick: ctx.w.tick, entity: snapshotOf(e) });
}

/** Soma dano/acertos/golpes por lado a partir dos eventos confirmados (agregador da tela de resultado, §4.4). */
export function tallyEvents(stats: [SideStats, SideStats], evs: WorldEvent[]): void {
  for (const ev of evs) {
    const side = sideOfId(ev.t === "damage" || ev.t === "attack_start" ? ev.attackerId : "");
    if (side === undefined) continue;
    if (ev.t === "attack_start") stats[side].attacks++;
    else if (ev.t === "damage" && ev.kind === "damage") {
      stats[side].damage += ev.amount;
      stats[side].hits++;
    }
  }
}

export function sideOfId(id: string): Side | undefined {
  return id.startsWith("A") ? 0 : id.startsWith("B") ? 1 : undefined;
}

const emptyStats = (): [SideStats, SideStats] => [
  { damage: 0, hits: 0, attacks: 0 },
  { damage: 0, hits: 0, attacks: 0 },
];

/** Passo de IA (o mesmo do encontro de campo): recargas, estados temporizados, aproxima e golpeia pelo AUTO. */
function aiStep(ctx: Ctx, e: Entity, foe: Entity | undefined): void {
  if (timedStates(ctx, e)) return;
  if (!alive(foe)) {
    e.targetId = undefined;
    if (e.state === "ENGAGE") setState(e, "IDLE", ctx.w.tick, ctx.ev);
    return;
  }
  e.targetId = foe.id;
  fight(ctx, e, foe);
}

const hpPctOf = (list: Entity[]) => list.reduce((s, e) => s + e.hp, 0) / Math.max(1, list.reduce((s, e) => s + e.maxHp, 0));

// ---------- Automático 3v3 ----------

export interface AutoResult {
  /** Lado vencedor; null = empate (timeout com %HP igual). */
  winner: Side | null;
  reason: "ko" | "timeout";
  /** %HP total de cada lado no fim (0..1). */
  hpPct: [number, number];
  tick: number;
}

export interface AutoArena {
  sim: WorldSim;
  teams: [ArenaTeam, ArenaTeam];
  /** Os 3 de cada lado, instanciados no início (o banco fica fora de `entities`). */
  roster: [Entity[], Entity[]];
  active: [number, number];
  limitTicks: number;
  /** Nível comum quando a Arena Nivelada está ligada. */
  level?: number;
  stats: [SideStats, SideStats];
  result?: AutoResult;
}

export function createAutoArena(content: WorldContent, seed: number, a: ArenaTeam, b: ArenaTeam, opts: ArenaOptions = {}): { arena: AutoArena; events: WorldEvent[] } {
  for (const t of [a, b]) {
    const err = teamError(content, t);
    if (err) throw new Error(`time ${t.name}: ${err}`);
  }
  const sim: WorldSim = { state: newState(seed), map: arenaMap(), content };
  const ctx = ctxOf(sim);
  const level = opts.normalize ? normalizedLevel([a, b]) : undefined;
  const starts = [sim.map.starts.A, sim.map.starts.B];
  const roster: [Entity[], Entity[]] = [
    a.fighters.map((f, i) => fighterEntity(ctx, 0, i, f, starts[0], level)),
    b.fighters.map((f, i) => fighterEntity(ctx, 1, i, f, starts[1], level)),
  ];
  enter(ctx, roster[0][0], starts[0]);
  enter(ctx, roster[1][0], starts[1]);
  const arena: AutoArena = { sim, teams: [a, b], roster, active: [0, 0], limitTicks: opts.limitTicks ?? AUTO_LIMIT_TICKS, level, stats: emptyStats() };
  return { arena, events: ctx.ev };
}

export function activeOf(arena: AutoArena, side: Side): Entity | undefined {
  const e = arena.roster[side][arena.active[side]];
  return e && !e.removed ? e : undefined;
}

/** Próximo da formação com HP (entra no lugar do ativo derrotado, no ponto de entrada do lado). */
function bringNext(arena: AutoArena, ctx: Ctx, side: Side): void {
  const cur = arena.roster[side][arena.active[side]];
  if (cur && !cur.removed) {
    cur.removed = true;
    ctx.ev.push({ t: "despawn", tick: ctx.w.tick, id: cur.id });
  }
  const next = arena.roster[side].findIndex((e) => e.hp > 0 && !e.removed);
  if (next < 0) return;
  arena.active[side] = next;
  enter(ctx, arena.roster[side][next], side === 0 ? arena.sim.map.starts.A : arena.sim.map.starts.B);
}

/** Um tick da partida automática. Devolve os eventos confirmados (os mesmos tipos do mundo aberto). */
export function stepAutoArena(arena: AutoArena): WorldEvent[] {
  if (arena.result) return [];
  const ctx = ctxOf(arena.sim);
  const w = ctx.w;
  w.tick++;
  for (const side of [0, 1] as Side[]) {
    const e = activeOf(arena, side);
    if (!e) continue;
    tickCooldowns(ctx, e);
    if (e.state === "DEFEAT") {
      // Animação de KO (despawnTicks) e entra o próximo.
      if (--e.stateTicks <= 0) bringNext(arena, ctx, side);
      continue;
    }
    aiStep(ctx, e, activeOf(arena, (1 - side) as Side));
  }
  w.entities = w.entities.filter((e) => !e.removed);
  tallyEvents(arena.stats, ctx.ev);
  const left = arena.roster.map((r) => r.filter((e) => e.hp > 0).length);
  if (left[0] === 0 || left[1] === 0) arena.result = { winner: left[0] === 0 && left[1] === 0 ? null : left[0] === 0 ? 1 : 0, reason: "ko", hpPct: [hpPctOf(arena.roster[0]), hpPctOf(arena.roster[1])], tick: w.tick };
  else if (w.tick >= arena.limitTicks) {
    const hp: [number, number] = [hpPctOf(arena.roster[0]), hpPctOf(arena.roster[1])];
    arena.result = { winner: timeoutWinner(hp), reason: "timeout", hpPct: hp, tick: w.tick };
  }
  return ctx.ev;
}

/** Critério do timeout (MODES_AND_ROADMAP §1.5): vence o maior %HP; igual (até 0,1 ponto) = empate. */
export function timeoutWinner(hp: [number, number]): Side | null {
  if (Math.abs(hp[0] - hp[1]) < 0.001) return null;
  return hp[0] > hp[1] ? 0 : 1;
}

/** Roda a partida até o fim (simulação rápida, testes e "pular"). */
export function runAutoArena(arena: AutoArena, maxTicks = 100_000): WorldEvent[] {
  const all: WorldEvent[] = [];
  for (let i = 0; i < maxTicks && !arena.result; i++) all.push(...stepAutoArena(arena));
  return all;
}

/** O ponto (sub) está dentro do campo jogável? (apresentação: mira/cursor). */
export function inField(map: WorldMap, p: Vec): boolean {
  return !isSolidAt(map, p.x, p.y);
}
