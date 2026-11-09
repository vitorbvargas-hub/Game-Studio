// WorldSim: autoridade local do mundo (WORLD_COMBAT_VISUAL_SPEC.md §1). Tick fixo de 100 ms, RNG mulberry32
// reaproveitado do protótipo idle, fórmulas de dano/XP do mesmo motor. Emite WorldEvent[] confirmados.
// Não importa nada de render/, assets/ ou ui/: a apresentação não tem como influenciar o resultado.

import { computeDamage, computeHeal, enemyXp, statsAtLevel, xpToNext } from "@game/src/sim/formulas";
import { nextFloat, nextInt } from "@game/src/sim/rng";
import { isTamer, setState } from "./fsm";
import { autoEvolveTarget, manualEvolveTarget, statusesOf } from "./evolution";
import { isReachableAt, isSolidAt, reachableCellsOf, type SpawnZone, type WorldMap } from "./map";
import {
  castReach,
  chooseMove,
  defaultAutoRules,
  defaultInherit,
  effectiveStat,
  elementMult,
  initialLoadout,
  learnNew,
  maxMpOf,
  moveAttack,
  segmentDistance,
  validateSlots,
} from "./moves";
import { attackCooldownTicks, SUB, WORLD } from "./params";
import type { WorldContent } from "./species";
import type { Dir8, Encounter, LogicState, Entity, EntitySnapshot, Intent, MoveDef, PlayerState, Vec, WorldEvent, WorldState } from "./types";

export interface PlayerSetup {
  id: string;
  name: string;
  start: Vec;
  partnerSpecies: string;
  partnerLevel: number;
  auto: boolean;
  bot: boolean;
}

export interface WorldSim {
  state: WorldState;
  map: WorldMap;
  content: WorldContent;
}

/** Contexto de um passo da sim (exportado para a Arena reaproveitar o mesmo motor de combate). */
export interface Ctx {
  w: WorldState;
  map: WorldMap;
  c: WorldContent;
  ev: WorldEvent[];
}

// ---------- criação ----------

export function createWorld(map: WorldMap, content: WorldContent, seed: number, players: PlayerSetup[]): { sim: WorldSim; events: WorldEvent[] } {
  const state: WorldState = {
    tick: 0,
    rng: { rngState: seed >>> 0 },
    seq: 0,
    idSeq: 0,
    encSeq: 0,
    entities: [],
    players: [],
    encounters: [],
    pendingSpawns: [],
  };
  const sim: WorldSim = { state, map, content };
  const ctx: Ctx = { w: state, map, c: content, ev: [] };
  for (const p of players) {
    const tamer = baseEntity(p.id, p.bot ? "remote_player" : "player", p.name, p.start);
    tamer.speed = WORLD.tamerSpeed;
    tamer.trail = [{ x: p.start.x - WORLD.followBack, y: p.start.y }, { ...p.start }];
    addEntity(ctx, tamer);
    const partner = makeCreature(ctx, `${p.id}:partner`, p.bot ? "remote_partner" : "partner", p.partnerSpecies, p.partnerLevel, {
      x: p.start.x - WORLD.followBack,
      y: p.start.y,
    });
    partner.ownerId = p.id;
    partner.speed = WORLD.partnerSpeed;
    addEntity(ctx, partner);
    state.players.push({ id: p.id, tamerId: p.id, partnerId: partner.id, auto: p.auto, bits: 0, scans: {}, captured: [], bot: p.bot });
  }
  map.spawns.forEach((z, i) => {
    for (let k = 0; k < z.count; k++) spawnWild(ctx, z, i);
  });
  // NPCs residentes (Map Factory): Digimon parados e não hostis; nenhum `think` os move e ninguém os ataca
  for (const n of map.npcs ?? []) {
    if (!n.speciesId || !content.species[n.speciesId]) continue;
    const e = makeCreature(ctx, `npc:${n.id}`, "npc", n.speciesId, 1, n.pos);
    e.name = n.name;
    e.speed = 0;
    addEntity(ctx, e);
  }
  return { sim, events: ctx.ev };
}

function baseEntity(id: string, kind: Entity["kind"], name: string, pos: Vec): Entity {
  return {
    id,
    kind,
    name,
    x: pos.x,
    y: pos.y,
    facing: "S",
    state: "IDLE",
    stateTicks: 0,
    hp: 1,
    maxHp: 1,
    level: 1,
    xp: 0,
    stats: { hp: 1, atk: 0, def: 0, spd: 0 },
    affinity: "free",
    element: "neutral",
    learned: [],
    moves: [null, null, null, null],
    moveCd: {},
    mp: 0,
    maxMp: 0,
    autoRules: [],
    statuses: [],
    attackCd: 0,
    radius: 8,
    speed: 0,
    home: { ...pos },
    waitTicks: 0,
    stuckTicks: 0,
    fleeRolled: false,
    removed: false,
  };
}

export function makeCreature(ctx: Ctx, id: string, kind: Entity["kind"], speciesId: string, level: number, pos: Vec): Entity {
  const sp = ctx.c.species[speciesId];
  if (!sp) throw new Error(`espécie desconhecida: ${speciesId}`);
  const e = baseEntity(id, kind, sp.name, pos);
  e.speciesId = speciesId;
  e.affinity = sp.affinity;
  e.element = ctx.c.moves.speciesElement[speciesId] ?? "neutral";
  e.radius = sp.radius;
  e.level = level;
  const lo = initialLoadout(ctx.c.moves, speciesId, level);
  e.learned = lo.learned;
  e.moves = lo.moves;
  e.autoRules = defaultAutoRules(e.moves);
  applyStats(ctx, e, 1);
  e.mp = e.maxMp;
  return e;
}

export function applyStats(ctx: Ctx, e: Entity, hpRatio: number): void {
  const sp = ctx.c.species[e.speciesId!];
  const s = statsAtLevel(sp.base, sp.growth, e.level);
  const mult = e.kind === "wild" ? WORLD.wildStatMult : 1;
  e.stats = { hp: Math.round(s.hp * mult), atk: Math.round(s.atk * mult), def: s.def, spd: s.spd };
  e.maxHp = e.stats.hp;
  e.hp = Math.max(1, Math.round(e.maxHp * hpRatio));
  e.maxMp = maxMpOf(ctx.c.moves.mp, e.level);
  e.mp = Math.min(e.mp, e.maxMp);
}

function addEntity(ctx: Ctx, e: Entity): void {
  ctx.w.entities.push(e);
  ctx.ev.push({ t: "spawn", tick: ctx.w.tick, entity: snapshotOf(e) });
}

function spawnWild(ctx: Ctx, z: SpawnZone, zoneIndex: number): void {
  const { w, map } = ctx;
  const speciesId = z.species[nextInt(w.rng, 0, z.species.length - 1)];
  const level = nextInt(w.rng, z.levelMin, z.levelMax);
  // só células livres E alcançáveis a partir dos inícios (BFS do carregamento do mapa): nada de bolsão entre árvores
  let pos: { x: number; y: number } | undefined;
  for (let i = 0; i < 12; i++) {
    const p = { x: z.center.x + nextInt(w.rng, -z.radius, z.radius), y: z.center.y + nextInt(w.rng, -z.radius, z.radius) };
    if (isReachableAt(map, p.x, p.y)) {
      pos = p;
      break;
    }
  }
  if (!pos) {
    // 12 tentativas sem sorte: sorteia direto entre as células alcançáveis da zona (centro só se não houver nenhuma)
    const cells = reachableCellsOf(map, z);
    if (cells.length) {
      const c = cells[nextInt(w.rng, 0, cells.length - 1)];
      pos = { x: (c % map.width) * SUB + SUB / 2, y: Math.floor(c / map.width) * SUB + SUB / 2 };
    } else pos = z.center;
  }
  const e = makeCreature(ctx, `wild-${++w.idSeq}`, "wild", speciesId, level, pos);
  e.speed = WORLD.wildSpeed;
  e.zoneIndex = zoneIndex;
  e.waitTicks = nextInt(w.rng, 5, 40);
  addEntity(ctx, e);
}

// ---------- consultas ----------

export function snapshotOf(e: Entity): EntitySnapshot {
  return {
    id: e.id,
    kind: e.kind,
    speciesId: e.speciesId,
    ownerId: e.ownerId,
    name: e.name,
    x: e.x,
    y: e.y,
    facing: e.facing,
    state: e.state,
    hp: e.hp,
    maxHp: e.maxHp,
    level: e.level,
    mp: e.mp,
    maxMp: e.maxMp,
    targetId: e.targetId,
    encounterId: e.encounterId,
  };
}

export function snapshot(sim: WorldSim): EntitySnapshot[] {
  return sim.state.entities.filter((e) => !e.removed).map(snapshotOf);
}

export function getEntity(w: WorldState, id: string | undefined): Entity | undefined {
  if (!id) return undefined;
  return w.entities.find((e) => e.id === id && !e.removed);
}

export function getPlayer(w: WorldState, id: string): PlayerState | undefined {
  return w.players.find((p) => p.id === id);
}

export function alive(e: Entity | undefined): e is Entity {
  return !!e && !e.removed && e.state !== "DEFEAT";
}

function dist(a: Vec, b: Vec): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

const DIRS: Dir8[] = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];

export function dirFromVector(dx: number, dy: number, fallback: Dir8): Dir8 {
  if (dx === 0 && dy === 0) return fallback;
  const oct = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
  return DIRS[(oct + 8) % 8];
}

export function attackRange(a: Entity, t: Entity): number {
  return a.radius + t.radius + WORLD.attackReach;
}

// ---------- movimento ----------

/** Anda em linha reta até o alvo com deslizamento por eixo na colisão. Devolve true ao chegar. */
function moveToward(ctx: Ctx, e: Entity, target: Vec, speed: number, stopAt = 0): boolean {
  const dx = target.x - e.x;
  const dy = target.y - e.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= stopAt + 0.5) return true;
  const step = Math.min(speed, d - stopAt);
  const mx = Math.round((dx / d) * step);
  const my = Math.round((dy / d) * step);
  e.facing = dirFromVector(dx, dy, e.facing);
  const moved = tryMove(ctx, e, mx, my);
  e.stuckTicks = moved ? 0 : e.stuckTicks + 1;
  return dist(e, target) <= stopAt + 0.5;
}

export function tryMove(ctx: Ctx, e: Entity, mx: number, my: number): boolean {
  let moved = false;
  if (mx !== 0 && !isSolidAt(ctx.map, e.x + mx, e.y)) {
    e.x += mx;
    moved = true;
  }
  if (my !== 0 && !isSolidAt(ctx.map, e.x, e.y + my)) {
    e.y += my;
    moved = true;
  }
  return moved;
}

// ---------- passo ----------

export function stepWorld(sim: WorldSim, intents: Intent[]): WorldEvent[] {
  const ctx: Ctx = { w: sim.state, map: sim.map, c: sim.content, ev: [] };
  const w = ctx.w;
  w.tick++;
  for (const it of intents) applyIntent(ctx, it);
  for (const e of [...w.entities]) {
    if (e.removed) continue;
    if (isTamer(e.kind)) thinkTamer(ctx, e);
    else if (e.kind === "partner" || e.kind === "remote_partner") thinkPartner(ctx, e);
    else if (e.kind === "wild") thinkWild(ctx, e);
  }
  for (const enc of [...w.encounters])
    if (w.tick - enc.startTick > WORLD.encounterTimeoutTicks) endEncounter(ctx, enc, "timeout");
  for (const p of w.players) if (p.autoEvolve) tryAutoEvolve(ctx, getEntity(w, p.partnerId), p.evoPrefs);
  for (const p of w.players) p.dir = undefined;
  const due = w.pendingSpawns.filter((s) => s.atTick <= w.tick);
  w.pendingSpawns = w.pendingSpawns.filter((s) => s.atTick > w.tick);
  for (const s of due) spawnWild(ctx, sim.map.spawns[s.zoneIndex], s.zoneIndex);
  w.entities = w.entities.filter((e) => !e.removed);
  return ctx.ev;
}

function applyIntent(ctx: Ctx, it: Intent): void {
  const { w } = ctx;
  const p = getPlayer(w, it.playerId);
  const tamer = p && getEntity(w, p.tamerId);
  if (!p || !tamer) return;
  const reject = (reason: string): void => {
    ctx.ev.push({ t: "intent_rejected", tick: w.tick, playerId: p.id, reason });
  };
  switch (it.t) {
    case "move_to":
      tamer.dest = { x: it.x, y: it.y };
      tamer.stuckTicks = 0;
      return;
    case "move_dir":
      p.dir = { x: Math.sign(it.dx), y: Math.sign(it.dy) };
      tamer.dest = undefined;
      return;
    case "set_auto":
      p.auto = it.on;
      return;
    case "set_auto_evolve":
      p.autoEvolve = it.on;
      return;
    case "add_bits":
      p.bits += Math.max(0, Math.floor(it.bits));
      return;
    case "set_moves": {
      const partner = getEntity(w, p.partnerId);
      if (!partner) return reject("parceira indisponível");
      // §2.4: troca só fora de combate (a lógica autoritativa não troca o kit no meio de um golpe).
      if (partner.encounterId || partner.targetId || !["IDLE", "FOLLOW", "WALK", "RETURN"].includes(partner.state)) return reject("troque os golpes fora de combate");
      const err = validateSlots(partner, it.slots);
      if (err) return reject(err);
      partner.moves = it.slots.map((s) => s ?? null);
      if (partner.queuedMove && !partner.moves.includes(partner.queuedMove)) partner.queuedMove = undefined;
      ctx.ev.push({ t: "moves_changed", tick: w.tick, id: partner.id, slots: [...partner.moves] });
      return;
    }
    case "set_auto_priority": {
      const partner = getEntity(w, p.partnerId);
      if (!partner) return reject("parceira indisponível");
      const seen = new Set<string>();
      partner.autoRules = it.rules
        .filter((r) => partner.learned.includes(r.moveId) && !seen.has(r.moveId) && seen.add(r.moveId))
        .map((r) => ({ moveId: r.moveId, cond: r.cond ?? "always", ...(r.pct !== undefined ? { pct: Math.max(1, Math.min(99, Math.round(r.pct))) } : {}), ...(r.off ? { off: true } : {}) }));
      return;
    }
    case "use_move": {
      const partner = getEntity(w, p.partnerId);
      const id = partner?.moves[it.slot];
      if (!partner || !id) return reject("slot vazio");
      const err = useMoveError(ctx.c.moves.moves[id], partner);
      if (err) return reject(err);
      partner.queuedMove = id;
      return;
    }
    case "evolve": {
      const partner = getEntity(w, p.partnerId);
      if (!alive(partner)) return reject("parceira fora de combate");
      // Com 2+ caminhos elegíveis o pedido precisa dizer qual (`to`): a sim nunca escolhe sozinha.
      const pick = manualEvolveTarget(statusesOf(ctx.c.moves, partner, (id) => !!ctx.c.species[id]), it.to);
      if ("reason" in pick) return reject(pick.reason);
      if (partner.encounterId || partner.state === "ATTACK" || partner.state === "HURT") return reject("em combate");
      evolve(ctx, partner, pick.to, it.keep);
      return;
    }
    case "set_evo_pref": {
      const paths = ctx.c.moves.paths[it.from] ?? [];
      if (it.to !== null && !paths.some((x) => x.to === it.to)) return reject("caminho inválido");
      const prefs = { ...(p.evoPrefs ?? {}) };
      if (it.to === null) delete prefs[it.from];
      else prefs[it.from] = it.to;
      p.evoPrefs = prefs;
      return;
    }
    case "engage": {
      const partner = getEntity(w, p.partnerId);
      const t = getEntity(w, it.targetId);
      if (!alive(partner)) return reject("parceira fora de combate");
      if (!alive(t) || t.kind !== "wild") return reject("alvo inválido");
      if (t.encounterId && t.targetId !== partner.id && t.encounterId !== partner.encounterId) return reject("alvo já em combate");
      if (partner.targetId === t.id) return;
      if (partner.state === "ATTACK" || partner.state === "HURT" || partner.state === "RETURN") return reject("parceira ocupada");
      const enc = encounterOf(w, partner);
      if (enc) endEncounter(ctx, enc, "flee");
      if (partner.state !== "IDLE" && partner.state !== "FOLLOW" && partner.state !== "WALK") return reject("parceira ocupada");
      engage(ctx, partner, t);
      return;
    }
    case "flee": {
      const partner = getEntity(w, p.partnerId);
      const enc = partner && encounterOf(w, partner);
      if (!partner || !enc) return reject("sem combate");
      endEncounter(ctx, enc, "flee");
      if (partner.state === "IDLE") setState(partner, "RETURN", w.tick, ctx.ev);
      else if (partner.state === "HURT") partner.resumeState = "RETURN";
      return;
    }
  }
}

/** Por que o golpe pedido (use_move) não pode ir para a fila agora; undefined = pode. Mesma regra no campo e na Arena. */
export function useMoveError(m: MoveDef | undefined, e: Entity): string | undefined {
  if (!m) return "slot vazio";
  if ((e.moveCd[m.id] ?? 0) > 0) return `${m.name} em recarga`;
  if (e.mp < m.cost) return "MP insuficiente";
  return undefined;
}

// ---------- Tamers ----------

function thinkTamer(ctx: Ctx, e: Entity): void {
  const { w } = ctx;
  const p = w.players.find((x) => x.tamerId === e.id)!;
  if (p.bot) botBrain(ctx, e);
  let moving = false;
  if (p.dir && (p.dir.x || p.dir.y)) {
    const diag = p.dir.x !== 0 && p.dir.y !== 0;
    const s = diag ? Math.round(e.speed * Math.SQRT1_2) : e.speed;
    e.facing = dirFromVector(p.dir.x, p.dir.y, e.facing);
    moving = tryMove(ctx, e, p.dir.x * s, p.dir.y * s);
  } else if (e.dest) {
    const reached = moveToward(ctx, e, e.dest, e.speed);
    if (reached || e.stuckTicks > 4) e.dest = undefined;
    moving = !reached;
  }
  setState(e, moving ? "WALK" : "IDLE", w.tick, ctx.ev);
  if (moving) pushTrail(e);
}

/** Registra a posição do Tamer na trilha (um ponto a cada trailStep sub andados). */
function pushTrail(e: Entity): void {
  const t = (e.trail ??= []);
  const last = t[t.length - 1];
  if (last && dist(last, e) < WORLD.trailStep) return;
  t.push({ x: e.x, y: e.y });
  if (t.length > WORLD.trailMax) t.shift();
}

/**
 * Ponto da trilha a `distance` sub do Tamer, medido ao longo do caminho que ele fez (follow-the-leader).
 * Sem trilha suficiente, cai no ponto atrás dele na direção em que olha.
 */
export function trailPoint(owner: Entity, distance: number): Vec {
  const t = owner.trail ?? [];
  let prev: Vec = { x: owner.x, y: owner.y };
  let left = distance;
  for (let i = t.length - 1; i >= 0; i--) {
    const seg = dist(prev, t[i]);
    if (seg >= left && seg > 0) {
      const k = left / seg;
      return { x: Math.round(prev.x + (t[i].x - prev.x) * k), y: Math.round(prev.y + (t[i].y - prev.y) * k) };
    }
    left -= seg;
    prev = t[i];
  }
  return behind(owner, distance);
}

/** IA do "outro jogador": passeia por pontos aleatórios perto de onde nasceu, com AUTO ligado. */
function botBrain(ctx: Ctx, e: Entity): void {
  const { w, map } = ctx;
  if (e.dest) return;
  if (e.waitTicks > 0) {
    e.waitTicks--;
    return;
  }
  for (let i = 0; i < 8; i++) {
    const r = 9 * SUB;
    const d = { x: e.home.x + nextInt(w.rng, -r, r), y: e.home.y + nextInt(w.rng, -r, r) };
    if (!isSolidAt(map, d.x, d.y)) {
      e.dest = d;
      break;
    }
  }
  e.waitTicks = nextInt(w.rng, 30, 90);
}

// ---------- criaturas ----------

/** Estados temporizados comuns (ATTACK, HURT, DEFEAT). Devolve true se o tick da entidade acabou aqui. */
export function timedStates(ctx: Ctx, e: Entity): boolean {
  const { w } = ctx;
  if (e.state === "DEFEAT") {
    if (--e.stateTicks <= 0) onDefeatTimeout(ctx, e);
    return true;
  }
  if (e.state === "ATTACK") {
    if (--e.stateTicks <= 0) {
      const t = getEntity(w, e.targetId);
      setState(e, alive(t) ? "ENGAGE" : "IDLE", w.tick, ctx.ev);
      if (!alive(t)) clearTarget(e);
    }
    return true;
  }
  if (e.state === "HURT") {
    if (--e.stateTicks <= 0) {
      let to = e.resumeState ?? "IDLE";
      if (to === "ENGAGE" && !alive(getEntity(w, e.targetId))) to = "IDLE";
      if (to === "HURT" || to === "ATTACK" || to === "DEFEAT") to = "IDLE";
      setState(e, to, w.tick, ctx.ev);
      e.resumeState = undefined;
    }
    return true;
  }
  return false;
}

export function tickCooldowns(ctx: Ctx, e: Entity): void {
  if (e.attackCd > 0) e.attackCd--;
  for (const k of Object.keys(e.moveCd)) {
    if (e.moveCd[k] > 0) e.moveCd[k]--;
    if (e.moveCd[k] <= 0) delete e.moveCd[k];
  }
  if (e.statuses.length) {
    for (const s of e.statuses) s.ticks--;
    e.statuses = e.statuses.filter((s) => s.ticks > 0);
  }
  // MP (§2.6): regen por tick em % do máximo; guardado com 2 casas para o estado continuar JSON estável.
  const r = ctx.c.moves.mp;
  if (e.mp < e.maxMp) e.mp = Math.min(e.maxMp, Math.round((e.mp + e.maxMp * (e.encounterId ? r.regenPctInCombat : r.regenPctOutOfCombat)) * 100) / 100);
}

function thinkPartner(ctx: Ctx, e: Entity): void {
  const { w } = ctx;
  tickCooldowns(ctx, e);
  if (timedStates(ctx, e)) return;
  const owner = getEntity(w, e.ownerId)!;
  const player = getPlayer(w, e.ownerId!)!;
  if (e.state === "RETURN") {
    if (moveToward(ctx, e, owner, WORLD.partnerCatchupSpeed, WORLD.followBack)) setState(e, "IDLE", w.tick, ctx.ev);
    return;
  }
  if (e.targetId) {
    const t = getEntity(w, e.targetId);
    if (!alive(t)) {
      clearTarget(e);
      setState(e, "IDLE", w.tick, ctx.ev);
      return;
    }
    if (dist(e, owner) > WORLD.partnerLeash) {
      const enc = encounterOf(w, e);
      if (enc) endEncounter(ctx, enc, "leash");
      else clearTarget(e);
      if (e.state === "IDLE") setState(e, "RETURN", w.tick, ctx.ev);
      return;
    }
    fight(ctx, e, t);
    return;
  }
  // Fora de combate: regenera, procura alvo (AUTO) ou segue o Tamer.
  // ENGAGE sem alvo (ex.: alvo largado pelo leash sem encontro aberto) volta a IDLE antes de seguir (ENGAGE → FOLLOW é ilegal).
  if (e.state === "ENGAGE") setState(e, "IDLE", w.tick, ctx.ev);
  e.hp = Math.min(e.maxHp, e.hp + Math.max(1, Math.round(e.maxHp * WORLD.partnerRegenPct)));
  if (player.auto && e.hp >= e.maxHp * WORLD.autoMinHpPct) {
    const t = findAutoTarget(ctx, e, owner);
    if (t) {
      engage(ctx, e, t);
      return;
    }
  }
  const d = dist(e, owner);
  if (e.state === "FOLLOW" || d > WORLD.followDist) {
    if (e.state !== "FOLLOW") setState(e, "FOLLOW", w.tick, ctx.ev);
    // Follow-the-leader: anda até o ponto da trilha followBack atrás do Tamer, pelo caminho que ele fez.
    const back = trailPoint(owner, WORLD.followBack);
    const speed = d > WORLD.followDist * 3 ? WORLD.partnerCatchupSpeed : e.speed;
    if (moveToward(ctx, e, back, speed, 2) || (d <= WORLD.followDist && e.stuckTicks > 3)) setState(e, "IDLE", w.tick, ctx.ev);
    return;
  }
  // Parada e o Tamer veio para cima dela: abre espaço (não sobrepor), afastando-se na linha entre os dois.
  if (d < WORLD.partnerMinSep) {
    const ux = d > 0 ? (e.x - owner.x) / d : -1;
    const uy = d > 0 ? (e.y - owner.y) / d : 0;
    // Passo curto sem trocar de estado (a view anima pelo deslocamento real).
    moveToward(ctx, e, { x: owner.x + Math.round(ux * WORLD.partnerMinSep), y: owner.y + Math.round(uy * WORLD.partnerMinSep) }, e.speed);
  }
}

function behind(owner: Entity, distance: number): Vec {
  const idx = DIRS.indexOf(owner.facing);
  const a = (idx * Math.PI) / 4;
  return { x: owner.x - Math.round(Math.cos(a) * distance), y: owner.y - Math.round(Math.sin(a) * distance) };
}

function findAutoTarget(ctx: Ctx, e: Entity, owner: Entity): Entity | undefined {
  let best: Entity | undefined;
  let bestD = Infinity;
  for (const t of ctx.w.entities) {
    if (t.kind !== "wild" || !alive(t) || t.encounterId || t.state === "RETURN") continue;
    if (t.level > e.level + WORLD.autoLevelMargin) continue;
    const d = dist(e, t);
    if (d > WORLD.aggroRadius || dist(owner, t) > WORLD.partnerLeash - 3 * SUB) continue;
    if (d < bestD) {
      best = t;
      bestD = d;
    }
  }
  return best;
}

function thinkWild(ctx: Ctx, e: Entity): void {
  const { w, map } = ctx;
  tickCooldowns(ctx, e);
  if (timedStates(ctx, e)) return;
  if (e.state === "RETURN") {
    e.hp = Math.min(e.maxHp, e.hp + Math.max(1, Math.round(e.maxHp * WORLD.wildRegenPct)));
    if (moveToward(ctx, e, e.home, WORLD.wildReturnSpeed, 4) || e.stuckTicks > 10) {
      setState(e, "IDLE", w.tick, ctx.ev);
      e.waitTicks = nextInt(w.rng, 10, 30);
      e.fleeRolled = false;
    }
    return;
  }
  if (e.targetId) {
    const t = getEntity(w, e.targetId);
    if (!alive(t)) {
      clearTarget(e);
      setState(e, "RETURN", w.tick, ctx.ev);
      return;
    }
    const enc = encounterOf(w, e);
    if (dist(e, e.home) > WORLD.wildLeash) {
      if (enc) endEncounter(ctx, enc, "leash");
      else clearTarget(e);
      if ((e.state as LogicState) !== "RETURN") setState(e, "RETURN", w.tick, ctx.ev);
      return;
    }
    if (!e.fleeRolled && e.hp < e.maxHp * WORLD.fleeHpPct) {
      e.fleeRolled = true;
      if (nextFloat(w.rng) < WORLD.fleeChance) {
        if (enc) endEncounter(ctx, enc, "flee");
        if ((e.state as LogicState) !== "RETURN") setState(e, "RETURN", w.tick, ctx.ev);
        return;
      }
    }
    fight(ctx, e, t);
    return;
  }
  // Fora de combate: regenera devagar e vaga perto de casa.
  if (e.hp < e.maxHp) e.hp = Math.min(e.maxHp, e.hp + Math.max(1, Math.round(e.maxHp * WORLD.wildRegenPct)));
  if (e.state === "WALK" && e.dest) {
    if (moveToward(ctx, e, e.dest, e.speed) || e.stuckTicks > 3) {
      e.dest = undefined;
      setState(e, "IDLE", w.tick, ctx.ev);
      e.waitTicks = nextInt(w.rng, 20, 60);
    }
    return;
  }
  if (e.waitTicks > 0) {
    e.waitTicks--;
    return;
  }
  const r = WORLD.wanderRadius;
  const d = { x: e.home.x + nextInt(w.rng, -r, r), y: e.home.y + nextInt(w.rng, -r, r) };
  if (isSolidAt(map, d.x, d.y)) {
    e.waitTicks = 5;
    return;
  }
  e.dest = d;
  setState(e, "WALK", w.tick, ctx.ev);
}

// ---------- combate ----------

function encounterOf(w: WorldState, e: Entity): Encounter | undefined {
  return e.encounterId ? w.encounters.find((x) => x.id === e.encounterId) : undefined;
}

function clearTarget(e: Entity): void {
  e.targetId = undefined;
  e.encounterId = undefined;
}

function engage(ctx: Ctx, a: Entity, t: Entity): void {
  const { w } = ctx;
  let enc = t.encounterId ? w.encounters.find((x) => x.id === t.encounterId) : undefined;
  if (!enc) {
    enc = { id: `enc-${++w.encSeq}`, members: [a.id, t.id], started: false, startTick: w.tick };
    w.encounters.push(enc);
    t.encounterId = enc.id;
  }
  a.targetId = t.id;
  a.encounterId = enc.id;
  a.dest = undefined;
  a.facing = dirFromVector(t.x - a.x, t.y - a.y, a.facing);
  if (!enc.members.includes(a.id)) enc.members.push(a.id);
  ctx.ev.push({ t: "engage", tick: w.tick, encounterId: enc.id, attackerId: a.id, targetId: t.id });
  if (a.state === "HURT") a.resumeState = "ENGAGE";
  else setState(a, "ENGAGE", w.tick, ctx.ev);
}

/**
 * ENGAGE: escolhe o golpe (puro, sem RNG) e aproxima até o alcance DELE (golpes à distância lançam de mais longe);
 * no alcance e com a recarga geral pronta, resolve o golpe NESTE tick.
 */
export function fight(ctx: Ctx, a: Entity, t: Entity): void {
  const { w } = ctx;
  if (a.state !== "ENGAGE") setState(a, "ENGAGE", w.tick, ctx.ev);
  const move = ctx.c.moves.moves[chooseMove(ctx.c.moves, a, t)];
  const range = attackRange(a, t) + castReach(move);
  if (dist(a, t) > range) {
    moveToward(ctx, a, t, a.kind === "wild" ? WORLD.wildReturnSpeed : a.speed, range - 2);
    return;
  }
  a.facing = dirFromVector(t.x - a.x, t.y - a.y, a.facing);
  const enc = encounterOf(w, a);
  if (enc && !enc.started) {
    enc.started = true;
    ctx.ev.push({ t: "encounter_start", tick: w.tick, encounterId: enc.id, members: [...enc.members] });
  }
  if (a.attackCd <= 0) resolveAttack(ctx, a, t, move);
}

/** Pode ser atingido por golpe de área/linha de `a`? Parceira: selvagens livres ou do mesmo encontro. Selvagem: inimigos do encontro. */
function hostileTo(a: Entity, x: Entity): boolean {
  if (!alive(x) || x.id === a.id) return false;
  // Arena: lados explícitos (time A × time B), sem selvagens nem encontros.
  if (a.team !== undefined || x.team !== undefined) return a.team !== undefined && x.team !== undefined && a.team !== x.team;
  if (a.kind === "wild") return (x.kind === "partner" || x.kind === "remote_partner") && !!a.encounterId && x.encounterId === a.encounterId;
  return x.kind === "wild" && (!x.encounterId || x.encounterId === a.encounterId) && x.state !== "RETURN";
}

/** Afetados e ponto do efeito (sub). Ordem: o alvo principal primeiro, depois a ordem das entidades (determinística). */
function affected(ctx: Ctx, a: Entity, t: Entity, m: MoveDef): { list: Entity[]; at: Vec } {
  if (m.type === "buff" || m.type === "heal" || m.target === "self") return { list: [a], at: { x: a.x, y: a.y } };
  if (m.target === "single" || m.target === "projectile") return { list: [t], at: { x: t.x, y: t.y } };
  const list = [t];
  if (m.target === "area") {
    // §2.8: área = o alvo e os hostis próximos DELE.
    const at = { x: t.x, y: t.y };
    for (const x of ctx.w.entities) if (x !== t && hostileTo(a, x) && dist(at, x) <= m.radius + x.radius) list.push(x);
    return { list, at };
  }
  // linha: do atacante na direção do alvo, até alcance corpo a corpo + range (no mínimo até o alvo)
  const d = Math.max(1, dist(a, t));
  const len = Math.max(d, attackRange(a, t) + m.range);
  const at = { x: Math.round(a.x + ((t.x - a.x) / d) * len), y: Math.round(a.y + ((t.y - a.y) / d) * len) };
  for (const x of ctx.w.entities) {
    if (x === t || !hostileTo(a, x)) continue;
    const s = segmentDistance(a.x, a.y, at.x, at.y, x.x, x.y);
    if (s.u > 0 && s.d <= m.radius + x.radius) list.push(x);
  }
  return { list, at };
}

/**
 * Resolve um golpe confirmado: paga MP/recarga, emite attack_start e aplica dano/cura/efeito. `aimed` (Arena manual)
 * troca a escolha dos afetados por alvo (`affected`) pelos atingidos na direção da mira; sem ninguém na mira o golpe
 * sai do mesmo jeito (paga o custo) e erra o ar — `t` pode faltar nesse caso.
 */
export function resolveAttack(ctx: Ctx, a: Entity, t: Entity | undefined, m: MoveDef, aimed?: { list: Entity[]; at: Vec }): void {
  const { w, c } = ctx;
  const mc = c.moves;
  const seq = ++w.seq;
  if (a.queuedMove === m.id) a.queuedMove = undefined;
  if (m.cooldownTicks > 0) a.moveCd[m.id] = m.cooldownTicks;
  a.mp = Math.max(0, a.mp - m.cost);
  a.attackCd = attackCooldownTicks(Math.round(effectiveStat(a, "spd")));
  const { list, at } = aimed ?? affected(ctx, a, t!, m);
  ctx.ev.push({ t: "attack_start", tick: w.tick, attackerId: a.id, targetId: t?.id ?? "", skillId: m.id, seq, targetIds: list.map((x) => x.id), at });
  setState(a, "ATTACK", w.tick, ctx.ev);
  a.stateTicks = WORLD.attackTicks;
  const b = c.balance;
  const power = moveAttack(a, m);
  if (m.type === "heal") {
    for (const x of list) {
      const amount = Math.min(x.maxHp - x.hp, computeHeal(m.power, power));
      x.hp += amount;
      ctx.ev.push({ t: "damage", tick: w.tick, seq, attackerId: a.id, targetId: x.id, amount, kind: "heal", crit: false, hpAfter: x.hp });
    }
    return;
  }
  if (m.type === "buff" || m.type === "debuff") {
    for (const x of list) {
      if (!m.effect) continue;
      x.statuses = x.statuses.filter((s) => s.moveId !== m.id);
      x.statuses.push({ moveId: m.id, stat: m.effect.stat, mult: m.effect.mult, ticks: m.effect.ticks, sourceId: a.id });
      ctx.ev.push({ t: "status", tick: w.tick, seq, id: x.id, moveId: m.id, stat: m.effect.stat, mult: m.effect.mult, ticks: m.effect.ticks, sourceId: a.id });
      if (m.type === "debuff") provoke(ctx, x, a);
    }
    return;
  }
  for (const x of list) {
    if (!alive(x)) continue;
    // Ordem fixa de sorteios por alvo: erro → variância → crítico.
    const miss = nextFloat(w.rng) < WORLD.missChance;
    if (miss) {
      ctx.ev.push({ t: "damage", tick: w.tick, seq, attackerId: a.id, targetId: x.id, amount: 0, kind: "miss", crit: false, hpAfter: x.hp });
      provoke(ctx, x, a);
      continue;
    }
    const variance = 1 + (nextFloat(w.rng) * 2 - 1) * b.damageVariance;
    const crit = nextFloat(w.rng) < (b.critChance ?? 0);
    const aff = c.affinityChart[a.affinity]?.[x.affinity] ?? 1;
    const elem = elementMult(mc, m.element, x.element);
    // Físico usa a defesa inteira; especial atravessa parte dela.
    const def = effectiveStat(x, "def") * (m.type === "special" ? 0.7 : 1);
    const amount = computeDamage(b, m.power, power, def, aff * elem * (crit ? b.critMult ?? 1.5 : 1), variance);
    x.hp = Math.max(0, x.hp - amount);
    ctx.ev.push({ t: "damage", tick: w.tick, seq, attackerId: a.id, targetId: x.id, amount, kind: "damage", crit, hpAfter: x.hp });
    if (x.hp === 0) defeat(ctx, x, a);
    else hurt(ctx, x, a);
  }
}

/** Quem é atingido (ou amaldiçoado) sem alvo passa a responder ao atacante e entra no encontro dele. */
function provoke(ctx: Ctx, t: Entity, by: Entity): void {
  const { w } = ctx;
  if (t.targetId || t.state === "RETURN" || !alive(t)) return;
  t.targetId = by.id;
  t.encounterId = by.encounterId;
  const enc = encounterOf(w, by);
  if (enc && !enc.members.includes(t.id)) enc.members.push(t.id);
  ctx.ev.push({ t: "engage", tick: w.tick, encounterId: by.encounterId!, attackerId: t.id, targetId: by.id });
  t.resumeState = "ENGAGE";
}

function hurt(ctx: Ctx, t: Entity, by: Entity): void {
  const { w } = ctx;
  // Quem apanha sem alvo passa a responder ao atacante (passo 8 do fluxo).
  provoke(ctx, t, by);
  if (t.state === "ATTACK") return; // HURT não cancela um golpe confirmado
  if (t.state !== "HURT") t.resumeState = t.targetId ? "ENGAGE" : t.state;
  setState(t, "HURT", w.tick, ctx.ev);
  t.stateTicks = WORLD.hurtTicks;
}

function defeat(ctx: Ctx, t: Entity, by: Entity): void {
  const { w } = ctx;
  setState(t, "DEFEAT", w.tick, ctx.ev);
  t.stateTicks = WORLD.despawnTicks;
  ctx.ev.push({ t: "defeat", tick: w.tick, id: t.id, by: by.id });
  if (t.kind === "wild" && by.ownerId) reward(ctx, t, by);
  const enc = encounterOf(w, t);
  if (enc) {
    // Golpes de área/linha põem mais de um selvagem no encontro: ele só acaba quando um dos lados fica vazio.
    enc.members = enc.members.filter((id) => id !== t.id);
    const left = enc.members.map((id) => getEntity(w, id)).filter(alive);
    const wilds = left.filter((x) => x.kind === "wild");
    const others = left.filter((x) => x.kind !== "wild");
    if (!wilds.length || !others.length) endEncounter(ctx, enc, "defeat");
    else
      for (const x of left)
        if (x.targetId === t.id) {
          const next = (x.kind === "wild" ? others : wilds)[0];
          x.targetId = next.id;
          ctx.ev.push({ t: "engage", tick: w.tick, encounterId: enc.id, attackerId: x.id, targetId: next.id });
        }
  }
  t.targetId = undefined;
  t.encounterId = undefined;
}

function reward(ctx: Ctx, t: Entity, partner: Entity): void {
  const { w, c } = ctx;
  const p = getPlayer(w, partner.ownerId!)!;
  const sp = c.species[t.speciesId!];
  const xp = enemyXp(WORLD.baseXpByStage[sp.stage] ?? 8, t.level);
  const bits = sp.stage * 2 + t.level;
  p.bits += bits;
  ctx.ev.push({ t: "reward", tick: w.tick, ownerId: p.id, partnerId: partner.id, xp, bits, drops: [], at: { x: t.x, y: t.y } });
  addXp(ctx, partner, xp);
  // Captura: placeholder por varredura (como o "scan" do protótipo idle). 100% registra a espécie.
  if (!p.captured.includes(sp.id)) {
    const pct = Math.min(100, (p.scans[sp.id] ?? 0) + WORLD.scanPerDefeat);
    p.scans[sp.id] = pct;
    if (pct >= 100) p.captured.push(sp.id);
    ctx.ev.push({ t: "capture", tick: w.tick, ownerId: p.id, speciesId: sp.id, pct, done: pct >= 100 });
  }
}

/** XP com as regras de nível do jogo: sobe quantos níveis couberem e libera os golpes do learnset a cada um. */
function addXp(ctx: Ctx, partner: Entity, xp: number): void {
  const { w, c } = ctx;
  partner.xp += xp;
  while (partner.level < c.balance.maxLevel && partner.xp >= xpToNext(c.balance, partner.level)) {
    partner.xp -= xpToNext(c.balance, partner.level);
    partner.level++;
    applyStats(ctx, partner, partner.hp / partner.maxHp);
    ctx.ev.push({ t: "level_up", tick: w.tick, id: partner.id, level: partner.level });
    learnAndAnnounce(ctx, partner);
  }
}

/** Parceira livre para evoluir: viva e fora de combate (mesma condição do Auto-evoluir e do modal de escolha). */
export function canEvolveNow(partner: Entity | undefined): partner is Entity {
  return alive(partner) && !partner.encounterId && !partner.targetId && partner.state !== "ATTACK" && partner.state !== "HURT";
}

/**
 * Evolução automática (opção "Auto-evoluir" do AUTO), fora de combate, com a regra restrita da proposta (§5): evolui
 * só se houver UM caminho elegível, ou para o caminho preferido do jogador quando ele estiver elegível. Com 2+
 * elegíveis e sem preferência, espera o jogador. Herança padrão = golpes de maior poder. Devolve true se evoluiu.
 */
function tryAutoEvolve(ctx: Ctx, partner: Entity | undefined, prefs?: Record<string, string>): boolean {
  if (!canEvolveNow(partner)) return false;
  const to = autoEvolveTarget(statusesOf(ctx.c.moves, partner, (id) => !!ctx.c.species[id]), prefs?.[partner.speciesId!]);
  if (!to) return false;
  evolve(ctx, partner, to);
  return true;
}

/**
 * XP concedida fora do combate (progresso offline): mesmas regras de nível e learnset da vitória online e, se
 * `autoEvolve`, evolui ao atingir o nível (em cadeia, se a XP der para mais de uma forma). Devolve os eventos.
 */
export function grantXp(sim: WorldSim, partnerId: string, xp: number, autoEvolve: boolean): WorldEvent[] {
  const ctx: Ctx = { w: sim.state, map: sim.map, c: sim.content, ev: [] };
  const e = getEntity(sim.state, partnerId);
  if (!e) return [];
  const prefs = sim.state.players.find((p) => p.partnerId === partnerId)?.evoPrefs;
  // XP aos poucos (um nível por vez) para a evolução acontecer no nível certo e a nova forma seguir subindo.
  let left = Math.max(0, Math.floor(xp));
  while (left > 0) {
    const need = e.level >= sim.content.balance.maxLevel ? left : Math.max(1, xpToNext(sim.content.balance, e.level) - e.xp);
    const give = Math.min(left, need);
    addXp(ctx, e, give);
    left -= give;
    if (autoEvolve) while (tryAutoEvolve(ctx, e, prefs));
    if (e.level >= sim.content.balance.maxLevel) break;
  }
  if (autoEvolve) while (tryAutoEvolve(ctx, e, prefs));
  return ctx.ev;
}

/** Dados persistidos de uma parceira (save). */
export interface PartnerSave {
  speciesId: string;
  level: number;
  xp: number;
  learned: string[];
  moves: (string | null)[];
  autoRules: Entity["autoRules"];
}

export function partnerSaveOf(e: Entity): PartnerSave {
  return { speciesId: e.speciesId!, level: e.level, xp: e.xp, learned: [...e.learned], moves: [...e.moves], autoRules: e.autoRules.map((r) => ({ ...r })) };
}

/**
 * Restaura a parceira de um jogador a partir do save (espécie, nível, XP, golpes e prioridade do AUTO), com stats
 * recalculados pela espécie e vida/MP cheios. Golpes que a espécie não conhece mais são descartados.
 */
export function restorePartner(sim: WorldSim, playerId: string, s: PartnerSave): void {
  const ctx: Ctx = { w: sim.state, map: sim.map, c: sim.content, ev: [] };
  const p = getPlayer(sim.state, playerId);
  const e = p && getEntity(sim.state, p.partnerId);
  const sp = sim.content.species[s.speciesId];
  if (!e || !sp) return;
  e.speciesId = s.speciesId;
  e.name = sp.name;
  e.affinity = sp.affinity;
  e.element = sim.content.moves.speciesElement[s.speciesId] ?? "neutral";
  e.radius = sp.radius;
  e.level = Math.max(1, Math.min(sim.content.balance.maxLevel, Math.floor(s.level)));
  e.xp = Math.max(0, Math.floor(s.xp));
  const known = new Set(s.learned.filter((id) => sim.content.moves.moves[id]));
  e.learned = [...known];
  e.moves = [0, 1, 2, 3].map((i) => (s.moves[i] && known.has(s.moves[i]!) ? s.moves[i]! : null));
  e.autoRules = s.autoRules.filter((r) => known.has(r.moveId)).map((r) => ({ ...r }));
  e.moveCd = {};
  e.statuses = [];
  applyStats(ctx, e, 1);
  e.hp = e.maxHp;
  e.mp = e.maxMp;
}

/** Aprende o que o learnset liberou e emite um `move_learned` por golpe (slot = onde equipou, ou null). */
function learnAndAnnounce(ctx: Ctx, e: Entity): void {
  const mc = ctx.c.moves;
  for (const l of learnNew(mc, e)) {
    // golpe que entrou num slot vazio vai para o fim da lista de prioridade (condição `always`)
    if (l.slot !== null && !e.autoRules.some((r) => r.moveId === l.moveId)) e.autoRules = [...e.autoRules, { moveId: l.moveId, cond: "always" }];
    ctx.ev.push({ t: "move_learned", tick: ctx.w.tick, id: e.id, moveId: l.moveId, slot: l.slot });
  }
}

/**
 * Evolução confirmada (§2.3): troca a espécie (stats, raio, elemento) mantendo nível e XP. Dos golpes da forma
 * anterior ficam só os escolhidos (até inheritSlotsOnEvolve; padrão = os de maior poder); a nova forma libera os
 * golpes de entrada, que vão para os slots ao lado dos herdados.
 */
function evolve(ctx: Ctx, e: Entity, to: string, keep?: string[]): void {
  const { w, c } = ctx;
  const mc = c.moves;
  const from = e.speciesId!;
  const kept = (keep ?? defaultInherit(mc, e)).filter((id, i, arr) => e.learned.includes(id) && arr.indexOf(id) === i).slice(0, mc.inheritSlotsOnEvolve);
  e.learned = [...kept];
  e.moves = [null, null, null, null];
  e.autoRules = [];
  e.moveCd = {};
  e.queuedMove = undefined;
  const sp = c.species[to];
  e.speciesId = to;
  e.name = sp.name;
  e.affinity = sp.affinity;
  e.element = c.moves.speciesElement[to] ?? e.element;
  e.radius = sp.radius;
  applyStats(ctx, e, e.hp / e.maxHp);
  e.mp = e.maxMp;
  ctx.ev.push({ t: "evolve", tick: w.tick, id: e.id, from, to, kept });
  learnAndAnnounce(ctx, e);
  // herdados ocupam os slots que sobraram
  for (const id of kept) {
    const free = e.moves.indexOf(null);
    if (free < 0) break;
    e.moves[free] = id;
    e.autoRules.push({ moveId: id, cond: "always" });
  }
}

function endEncounter(ctx: Ctx, enc: Encounter, reason: "defeat" | "flee" | "leash" | "timeout"): void {
  const { w } = ctx;
  w.encounters = w.encounters.filter((x) => x !== enc);
  ctx.ev.push({ t: "encounter_end", tick: w.tick, encounterId: enc.id, reason });
  for (const id of enc.members) {
    const e = getEntity(w, id);
    if (!e || e.encounterId !== enc.id) continue;
    clearTarget(e);
    if (!alive(e)) continue;
    // Selvagem volta para casa; parceira para (e depois segue o Tamer). ATTACK em curso termina sozinho.
    const after = e.kind === "wild" ? "RETURN" : "IDLE";
    if (e.state === "HURT") e.resumeState = after;
    else if (e.state === "ENGAGE" || (e.kind === "wild" && (e.state === "IDLE" || e.state === "WALK"))) setState(e, after, w.tick, ctx.ev);
  }
}

function onDefeatTimeout(ctx: Ctx, e: Entity): void {
  const { w } = ctx;
  e.removed = true;
  ctx.ev.push({ t: "despawn", tick: w.tick, id: e.id });
  if (e.kind === "wild") {
    if (e.zoneIndex !== undefined) w.pendingSpawns.push({ zoneIndex: e.zoneIndex, atTick: w.tick + WORLD.respawnTicks });
    return;
  }
  // Parceira derrotada "renasce" junto ao Tamer como um spawn novo (mesmo id), com pouca vida.
  const owner = getEntity(w, e.ownerId)!;
  const revived = makeCreature(ctx, e.id, e.kind, e.speciesId!, e.level, { x: owner.x, y: owner.y });
  revived.ownerId = e.ownerId;
  revived.xp = e.xp;
  revived.learned = e.learned;
  revived.moves = e.moves;
  revived.autoRules = e.autoRules;
  revived.speed = e.speed;
  revived.hp = Math.max(1, Math.round(revived.maxHp * WORLD.reviveHpPct));
  addEntity(ctx, revived);
}
