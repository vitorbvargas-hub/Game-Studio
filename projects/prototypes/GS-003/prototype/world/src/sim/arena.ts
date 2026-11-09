// Arena PvP local (GS-006, docs/PVP_ARENA_SPEC.md §3, §4, §6 e §10): partida 3v3 automática (um ativo por lado, o
// próximo da formação entra no KO, HP não reseta) e melhor de 3 manual (cada rodada é um 1v1 novo, HP cheio).
// NÃO tem motor próprio: cada partida é um WorldState comum num mapa de estádio, e o combate passa pelas mesmas
// funções do mundo — fight/chooseMove (IA do AUTO), resolveAttack/computeDamage (dano, atributo, elemento, MP,
// recargas), tickCooldowns/timedStates (FSM) e useMoveError/queuedMove (golpe pedido pelo jogador).
// Puro e determinístico (RNG serializado no estado); não conhece DOM, Canvas nem a apresentação.

import { isSolidAt, type WorldMap } from "./map";
import { castReach, chooseMove, segmentDistance } from "./moves";
import { SUB, WORLD } from "./params";
import { setState } from "./fsm";
import type { WorldContent } from "./species";
import type { AutoRule, Entity, MoveDef, Vec, WorldEvent, WorldState } from "./types";
import {
  alive,
  applyStats,
  attackRange,
  dirFromVector,
  fight,
  makeCreature,
  resolveAttack,
  snapshotOf,
  tickCooldowns,
  timedStates,
  tryMove,
  useMoveError,
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
  /** Duração máxima (ticks). Automático: 180 s; rodada manual: 90 s. */
  limitTicks?: number;
}

export const AUTO_LIMIT_TICKS = 1800;
export const ROUND_LIMIT_TICKS = 900;
export const ROUNDS_TO_WIN = 2;
/** Segurança contra empates em série na melhor de 3 (rodada empatada não pontua). */
export const MAX_ROUNDS = 5;
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

// ---------- Manual: melhor de 3 ----------

/** Entrada do jogador num tick: direção WASD, ponto da mira (sub-tiles) e botão apertado (0 = básico/LMB, 1–4 = slots). */
export interface ManualInput {
  dx: number;
  dy: number;
  aim?: Vec;
  press?: number;
}

export interface RoundResult {
  winner: Side | null;
  reason: "ko" | "timeout";
  hpPct: [number, number];
  tick: number;
}

export interface Round {
  n: number;
  sim: WorldSim;
  /** Índice escolhido no time de cada lado. */
  pick: [number, number];
  ents: [Entity, Entity];
  limitTicks: number;
  stats: [SideStats, SideStats];
  result?: RoundResult;
}

export interface ManualMatch {
  content: WorldContent;
  seed: number;
  teams: [ArenaTeam, ArenaTeam];
  level?: number;
  score: [number, number];
  rounds: Round[];
  current?: Round;
  /** Fim da partida: vencedor (null = empate depois do limite de rodadas). */
  over?: { winner: Side | null };
  stats: [SideStats, SideStats];
  limitTicks: number;
}

export function createManualMatch(content: WorldContent, seed: number, a: ArenaTeam, b: ArenaTeam, opts: ArenaOptions = {}): ManualMatch {
  for (const t of [a, b]) {
    const err = teamError(content, t);
    if (err) throw new Error(`time ${t.name}: ${err}`);
  }
  return { content, seed, teams: [a, b], level: opts.normalize ? normalizedLevel([a, b]) : undefined, score: [0, 0], rounds: [], stats: emptyStats(), limitTicks: opts.limitTicks ?? ROUND_LIMIT_TICKS };
}

/** Quem ainda pode entrar: cada Digimon luta uma rodada; se o time acabou (time menor que 3 ou empates), todos voltam. */
export function availablePicks(match: ManualMatch, side: Side): number[] {
  const used = new Set(match.rounds.map((r) => r.pick[side]));
  const all = match.teams[side].fighters.map((_, i) => i);
  const free = all.filter((i) => !used.has(i));
  return free.length ? free : all;
}

/** Escolha do fantasma: o próximo livre na ordem da formação dele (determinística). */
export function aiPick(match: ManualMatch): number {
  return availablePicks(match, 1)[0];
}

/** Começa a próxima rodada com o Digimon `pickA` do jogador (precisa estar livre). */
export function startRound(match: ManualMatch, pickA: number): { round: Round; events: WorldEvent[] } {
  if (match.over) throw new Error("partida encerrada");
  if (match.current && !match.current.result) throw new Error("rodada em andamento");
  if (!availablePicks(match, 0).includes(pickA)) throw new Error("Digimon indisponível nesta rodada");
  const n = match.rounds.length + 1;
  const sim: WorldSim = { state: newState((match.seed + n * 7919) >>> 0), map: arenaMap(), content: match.content };
  const ctx = ctxOf(sim);
  const pick: [number, number] = [pickA, aiPick(match)];
  const ents = [0, 1].map((s) => fighterEntity(ctx, s as Side, pick[s], match.teams[s].fighters[pick[s]], s ? sim.map.starts.B : sim.map.starts.A, match.level)) as [Entity, Entity];
  enter(ctx, ents[0], sim.map.starts.A);
  enter(ctx, ents[1], sim.map.starts.B);
  const round: Round = { n, sim, pick, ents, limitTicks: match.limitTicks, stats: emptyStats() };
  match.current = round;
  return { round, events: ctx.ev };
}

/**
 * Pontos atingidos por um golpe mirado (§4.3: a mira muda a direção de lançamento, não a regra de acerto). Alcance =
 * corpo a corpo + alcance do golpe (o mesmo do AUTO). Único: o adversário no alcance e num cone de 120° da mira.
 * Projétil/linha: o segmento da mira, com a largura do golpe. Área: o círculo no ponto mirado (preso ao alcance).
 */
export function aimTargets(me: Entity, foe: Entity | undefined, m: MoveDef, aim: Vec): { list: Entity[]; at: Vec } {
  if (m.type === "buff" || m.type === "heal" || m.target === "self") return { list: [me], at: { x: me.x, y: me.y } };
  const dx = aim.x - me.x;
  const dy = aim.y - me.y;
  const d = Math.hypot(dx, dy);
  const ux = d > 0 ? dx / d : me.facing.includes("W") ? -1 : 1;
  const uy = d > 0 ? dy / d : 0;
  const reach = (foe ? attackRange(me, foe) : me.radius * 2 + WORLD.attackReach) + castReach(m);
  const point = (len: number): Vec => ({ x: Math.round(me.x + ux * len), y: Math.round(me.y + uy * len) });
  const ok = alive(foe);
  if (m.target === "area") {
    const at = point(Math.min(d, reach));
    const hit = ok && Math.hypot(foe.x - at.x, foe.y - at.y) <= m.radius + foe.radius;
    return { list: hit ? [foe] : [], at };
  }
  if (m.target === "projectile" || m.target === "line") {
    const end = point(reach);
    const s = ok ? segmentDistance(me.x, me.y, end.x, end.y, foe.x, foe.y) : undefined;
    const hit = !!s && s.d <= foe!.radius + Math.max(m.radius, 4);
    return { list: hit ? [foe!] : [], at: hit && m.target === "projectile" ? { x: foe!.x, y: foe!.y } : end };
  }
  // único (corpo a corpo ou especial de curto alcance)
  if (ok) {
    const fx = foe.x - me.x;
    const fy = foe.y - me.y;
    const fd = Math.hypot(fx, fy);
    const facingOk = fd <= me.radius || (fx * ux + fy * uy) / fd >= 0.5;
    if (fd <= reach && facingOk) return { list: [foe], at: { x: foe.x, y: foe.y } };
  }
  return { list: [], at: point(reach) };
}

/** Golpe do jogador: mesmas travas do campo (recarga geral, recarga do golpe, MP) e o golpe passa pela fila do AUTO. */
function playerCast(ctx: Ctx, me: Entity, foe: Entity, press: number, aim: Vec): void {
  const mc = ctx.c.moves;
  const reject = (reason: string) => ctx.ev.push({ t: "intent_rejected", tick: ctx.w.tick, playerId: ARENA_OWNER[0], reason });
  if (me.attackCd > 0) return void reject("aguarde a recarga geral");
  let id = mc.basicMoveId;
  if (press > 0) {
    const slot = me.moves[press - 1];
    if (!slot) return void reject("slot vazio");
    const err = useMoveError(mc.moves[slot], me);
    if (err) return void reject(err);
    // use_move: o golpe vai para a fila e chooseMove (o mesmo do AUTO) o devolve se estiver pronto e fizer sentido.
    me.queuedMove = slot;
    id = chooseMove(mc, me, foe);
    if (id !== slot) {
      me.queuedMove = undefined;
      return void reject(mc.moves[slot].type === "heal" ? "PV cheio" : "efeito já ativo");
    }
  }
  const m = mc.moves[id];
  const aimed = aimTargets(me, foe, m, aim);
  me.facing = dirFromVector(aim.x - me.x, aim.y - me.y, me.facing);
  if (me.state !== "ENGAGE") {
    if (me.state === "WALK") setState(me, "IDLE", ctx.w.tick, ctx.ev);
    setState(me, "ENGAGE", ctx.w.tick, ctx.ev);
  }
  resolveAttack(ctx, me, aimed.list.includes(foe) ? foe : undefined, m, aimed);
}

/** Andar com WASD (velocidade de parceira, deslize na colisão) e virar para a mira. */
function playerMove(ctx: Ctx, me: Entity, input: ManualInput): void {
  const dx = Math.sign(input.dx);
  const dy = Math.sign(input.dy);
  const moving = dx !== 0 || dy !== 0;
  if (moving) {
    const s = dx && dy ? Math.round(me.speed * Math.SQRT1_2) : me.speed;
    tryMove(ctx, me, dx * s, dy * s);
  }
  if (input.aim) me.facing = dirFromVector(input.aim.x - me.x, input.aim.y - me.y, me.facing);
  else if (moving) me.facing = dirFromVector(dx, dy, me.facing);
  if (me.state === "ENGAGE") setState(me, "IDLE", ctx.w.tick, ctx.ev);
  setState(me, moving ? "WALK" : "IDLE", ctx.w.tick, ctx.ev);
}

/** Um tick da rodada atual: o jogador (lado A) pelo input, o fantasma (lado B) pela IA do AUTO. */
export function stepRound(match: ManualMatch, input: ManualInput): WorldEvent[] {
  const r = match.current;
  if (!r || r.result || match.over) return [];
  const ctx = ctxOf(r.sim);
  const w = ctx.w;
  w.tick++;
  const [me, foe] = r.ents;
  tickCooldowns(ctx, me);
  if (me.state !== "DEFEAT" && !timedStates(ctx, me)) {
    me.targetId = alive(foe) ? foe.id : undefined;
    if (input.press !== undefined && alive(foe)) playerCast(ctx, me, foe, input.press, input.aim ?? { x: foe.x, y: foe.y });
    if (me.state !== "ATTACK") playerMove(ctx, me, input);
  }
  tickCooldowns(ctx, foe);
  if (foe.state !== "DEFEAT") aiStep(ctx, foe, me);
  tallyEvents(r.stats, ctx.ev);
  tallyEvents(match.stats, ctx.ev);
  const hp: [number, number] = [me.hp / me.maxHp, foe.hp / foe.maxHp];
  if (me.hp === 0 || foe.hp === 0) r.result = { winner: me.hp === 0 && foe.hp === 0 ? null : me.hp === 0 ? 1 : 0, reason: "ko", hpPct: hp, tick: w.tick };
  else if (w.tick >= r.limitTicks) r.result = { winner: timeoutWinner(hp), reason: "timeout", hpPct: hp, tick: w.tick };
  if (r.result) finishRound(match, r);
  return ctx.ev;
}

function finishRound(match: ManualMatch, r: Round): void {
  match.rounds.push(r);
  if (r.result!.winner !== null) match.score[r.result!.winner]++;
  if (match.score[0] >= ROUNDS_TO_WIN) match.over = { winner: 0 };
  else if (match.score[1] >= ROUNDS_TO_WIN) match.over = { winner: 1 };
  else if (match.rounds.length >= MAX_ROUNDS) match.over = { winner: match.score[0] === match.score[1] ? null : match.score[0] > match.score[1] ? 0 : 1 };
}

/** O ponto (sub) está dentro do campo jogável? (apresentação: mira/cursor). */
export function inField(map: WorldMap, p: Vec): boolean {
  return !isSolidAt(map, p.x, p.y);
}
