// AUTO explorador (feedback 1 do fundador, item 4). Com o AUTO ligado e a exploração ativa, o Tamer anda sozinho:
// escolhe um destino (selvagem visível perto, senão um tile de grama alta, senão um ponto livre perto), vai por BFS na
// colisão do mapa, para quando a parceira entra em combate ou um selvagem salta da grama, e volta a explorar depois.
// Com a parceira fraca, vai ao ponto de cura (a cura em si é a interação de sempre, aplicada ao chegar perto) ou
// descansa parado até regenerar. Nunca pisa na arena do chefe nem perto das saídas do mapa.
//
// Roda dentro da sim (determinístico, w.rng) e só mexe em `tamer.dest`: o encontro continua sendo a
// EncounterAuthority testando cada tile pisado, e a recompensa continua única por encontro (settle idempotente).

import { nextInt } from "@game/src/sim/rng";
import { isSolidAt, type WorldMap } from "./map";
import { PX_PER_SUB, SUB } from "./params";
import type { Entity, PlayerState, Vec, WorldState } from "./types";

export const EXPLORE = {
  /** Ticks (100 ms) sem explorar depois de uma tecla de movimento ou clique: o jogador assumiu o controle. */
  pauseTicks: 60,
  /** Abaixo desta fração do PV a parceira vai se curar; volta a explorar ao passar de healDonePct. */
  healPct: 0.35,
  healDonePct: 0.95,
  /** Em combate abaixo desta fração do PV, o explorador foge (uma vez por encontro) e vai se curar. */
  fleePct: 0.32,
  /** Só sai caçando um selvagem visível com a parceira acima desta fração do PV (e de nível ≤ ao dela). */
  huntPct: 0.6,
  /** Raio (tiles) da escolha de destinos e da procura de selvagens visíveis. */
  goalRadius: 14,
  sightTiles: 9,
  /** Ao chegar a esta distância (tiles) do selvagem, para e deixa a parceira (AUTO) engajar. */
  approachTiles: 3,
  /** Distância mínima (tiles) do novo destino de grama: mantém o Tamer andando dentro da área. */
  minHopTiles: 3,
  /** Margem (tiles) em volta das arenas de chefe e das saídas. */
  arenaMargin: 1,
  portalMargin: 3,
  /** Ticks parado no destino antes do próximo (respiro visual). */
  dwellTicks: 4,
  /** Recalcula o caminho até um selvagem que se move a cada N ticks. */
  repathTicks: 8,
} as const;

export type ExploreMode = "off" | "paused" | "fight" | "hunt" | "grass" | "roam" | "heal" | "rest" | "wait";

export interface ExploreState {
  mode: ExploreMode;
  /** Caminho em células (índice y*W+x), do próximo passo ao destino. */
  path: number[];
  goal?: number;
  targetId?: string;
  pauseTicks: number;
  dwell: number;
  repath: number;
  /** Encontro do qual o explorador já fugiu (não foge duas vezes do mesmo). */
  fledEnc?: string;
  /** Ticks seguidos sem conseguir avançar no caminho (colisão com selvagem, quina): passa de STUCK_MAX, desiste. */
  stuck: number;
}

const STUCK_MAX = 12;

export function newExplore(): ExploreState {
  return { mode: "grass", path: [], pauseTicks: 0, dwell: 0, repath: 0, stuck: 0 };
}

const masks = new WeakMap<WorldMap, Uint8Array>();

/** Valores da máscara: 0 livre; SOFT = não vira destino (margem das saídas); HARD = não atravessa (arena, saída). */
export const SOFT = 1;
export const HARD = 2;

/** Células evitadas pelo explorador: arenas de chefe (com margem) e saídas do mapa (a margem só não vira destino). */
export function avoidMask(map: WorldMap): Uint8Array {
  const cached = masks.get(map);
  if (cached) return cached;
  const W = map.width;
  const H = map.height;
  const T = map.tileSize;
  const m = new Uint8Array(W * H);
  const mark = (x: number, y: number, w: number, h: number, margin: number, v: number) => {
    const x0 = Math.max(0, Math.floor(x / T) - margin);
    const y0 = Math.max(0, Math.floor(y / T) - margin);
    const x1 = Math.min(W - 1, Math.ceil((x + w) / T) - 1 + margin);
    const y1 = Math.min(H - 1, Math.ceil((y + h) / T) - 1 + margin);
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) m[yy * W + xx] = Math.max(m[yy * W + xx], v);
  };
  for (const p of map.portals) mark(p.x, p.y, p.w, p.h, EXPLORE.portalMargin, SOFT);
  for (const p of map.portals) mark(p.x, p.y, p.w, p.h, 0, HARD);
  for (const a of map.arenas ?? []) mark(a.x, a.y, a.w, a.h, EXPLORE.arenaMargin, HARD);
  masks.set(map, m);
  return m;
}

/** Célula (tile) de uma posição em sub-tiles. */
export const cellOf = (map: WorldMap, v: Vec): number => Math.floor(v.y / SUB) * map.width + Math.floor(v.x / SUB);
export const cellCenter = (map: WorldMap, c: number): Vec => ({ x: (c % map.width) * SUB + SUB / 2, y: Math.floor(c / map.width) * SUB + SUB / 2 });

/** Está numa arena de chefe (px do retângulo do mapa)? */
export function inArena(map: WorldMap, v: Vec): boolean {
  const x = v.x * PX_PER_SUB;
  const y = v.y * PX_PER_SUB;
  return (map.arenas ?? []).some((a) => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h);
}

const N8 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

/**
 * BFS de 8 vizinhos (sem cortar quina de parede) a partir de `from`, até `maxTiles` de distância. Devolve o vetor de
 * predecessores (-1 = não alcançado) e as células alcançadas em ordem de distância. Células HARD (`avoid`) não são
 * atravessadas, a não ser a de partida.
 */
export function bfs(map: WorldMap, avoid: Uint8Array, from: number, maxTiles = Infinity): { prev: Int32Array; order: number[]; depth: Int32Array } {
  const W = map.width;
  const H = map.height;
  const prev = new Int32Array(W * H).fill(-1);
  const depth = new Int32Array(W * H);
  const free = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && !map.solid[y * W + x] && avoid[y * W + x] !== HARD;
  prev[from] = from;
  const order = [from];
  for (let h = 0; h < order.length; h++) {
    const c = order[h];
    if (depth[c] >= maxTiles) continue;
    const x = c % W;
    const y = (c - x) / W;
    for (const [dx, dy] of N8) {
      const nx = x + dx;
      const ny = y + dy;
      const n = ny * W + nx;
      if (!free(nx, ny) || prev[n] !== -1) continue;
      if (dx && dy && (map.solid[y * W + nx] || map.solid[ny * W + x])) continue;
      prev[n] = c;
      depth[n] = depth[c] + 1;
      order.push(n);
    }
  }
  return { prev, order, depth };
}

/** Caminho (sem a célula de partida) até `to`, pelo vetor de predecessores; undefined se inalcançável. */
export function pathTo(prev: Int32Array, to: number): number[] | undefined {
  if (prev[to] === -1) return undefined;
  const out: number[] = [];
  let c = to;
  while (prev[c] !== c) {
    out.push(c);
    c = prev[c];
  }
  return out.reverse();
}

export interface ExploreEnv {
  w: WorldState;
  map: WorldMap;
  player: PlayerState;
  tamer: Entity;
  partner: Entity | undefined;
  /** Grama alta (área de encontro) no tile; ausente = encontros desligados. */
  grassAt?: (tx: number, ty: number) => boolean;
  /** Selvagem que o AUTO da parceira aceitaria como alvo (nível, dono, salto...). */
  huntable: (t: Entity) => boolean;
  /** Pontos de cura (sub-tiles). */
  healPoints: Vec[];
  /** Raio (sub) em que a interação dispara (a cura é aplicada pela UI ao chegar). */
  interactRadius: number;
  /** Foge do combate atual (a mesma regra do botão Fugir). */
  flee?: () => void;
}

/**
 * Um tick do explorador. Só decide `tamer.dest` (e o estado `player.explore`); devolve o modo, para a UI anunciar
 * as mudanças. Chamar antes do movimento do Tamer, com o AUTO ligado e sem WASD neste tick.
 */
export function exploreTick(env: ExploreEnv): ExploreMode {
  const { w, map, player, tamer, partner } = env;
  const ex = (player.explore ??= newExplore());
  const set = (m: ExploreMode) => (ex.mode = m);
  const stop = () => {
    tamer.dest = undefined;
    ex.path = [];
    ex.goal = undefined;
  };
  if (ex.pauseTicks > 0) {
    ex.pauseTicks--;
    ex.path = [];
    return set("paused");
  }
  if (!partner || partner.hp <= 0 || partner.state === "DEFEAT") {
    stop();
    return set("wait");
  }
  const myIntro = w.entities.some((e) => !e.removed && e.encOwner === player.id && (e.introTicks ?? 0) > 0);
  const busy = !!partner.targetId || !!partner.encounterId || ["ENGAGE", "ATTACK", "HURT"].includes(partner.state) || (partner.evolveLockTicks ?? 0) > 0;
  if (busy || myIntro) {
    stop();
    ex.targetId = undefined;
    // PV crítico no meio da luta: foge uma vez deste encontro e, no próximo tick, sai para se curar
    if (partner.encounterId && partner.hp < partner.maxHp * EXPLORE.fleePct && ex.fledEnc !== partner.encounterId && env.flee) {
      ex.fledEnc = partner.encounterId;
      env.flee();
      ex.mode = "heal";
      return "heal";
    }
    return set("fight");
  }
  const avoid = avoidMask(map);
  const here = cellOf(map, tamer);

  // ---- cura ----
  const low = partner.hp < partner.maxHp * EXPLORE.healPct;
  if ((ex.mode === "heal" || ex.mode === "rest") && partner.hp < partner.maxHp * EXPLORE.healDonePct) {
    // continua curando
  } else if (!low && (ex.mode === "heal" || ex.mode === "rest")) {
    stop();
    ex.mode = "grass";
  }
  if (low || ex.mode === "heal" || ex.mode === "rest") {
    const near = env.healPoints.find((h) => Math.hypot(tamer.x - h.x, tamer.y - h.y) <= env.interactRadius * 0.8);
    if (near) {
      stop();
      return set("rest");
    }
    if (ex.mode !== "heal" || !ex.path.length) {
      const r = bfs(map, avoid, here);
      let best: number[] | undefined;
      for (const h of env.healPoints) {
        // o ponto de cura em si costuma ser sólido (o objeto): mira a célula livre mais perto dele
        const p = nearestReached(map, r.prev, cellOf(map, h), 2);
        const path = p !== undefined ? pathTo(r.prev, p) : undefined;
        if (path && (!best || path.length < best.length)) best = path;
      }
      if (!best) {
        stop();
        return set("rest"); // sem ponto de cura alcançável: descansa (regenera fora de combate)
      }
      ex.path = best;
    }
    follow(map, tamer, ex);
    return set("heal");
  }

  // ---- caça: selvagem visível perto ----
  const target = partner.hp >= partner.maxHp * EXPLORE.huntPct ? pickWild(env, avoid) : undefined;
  if (target) {
    const d = Math.hypot(target.x - tamer.x, target.y - tamer.y);
    if (d <= EXPLORE.approachTiles * SUB) {
      // perto o bastante: o AUTO da parceira engaja no próximo tick
      stop();
      ex.targetId = target.id;
      return set("hunt");
    }
    if (ex.targetId !== target.id || ex.repath-- <= 0 || !ex.path.length) {
      const r = bfs(map, avoid, here, EXPLORE.goalRadius + 4);
      const c = nearestReached(map, r.prev, cellOf(map, target), 2);
      const path = c !== undefined ? pathTo(r.prev, c) : undefined;
      ex.targetId = target.id;
      ex.repath = EXPLORE.repathTicks;
      if (path) ex.path = path;
    }
    if (ex.path.length) {
      follow(map, tamer, ex);
      return set("hunt");
    }
  }
  ex.targetId = undefined;

  // ---- grama alta (ou um ponto livre perto, sem encontros) ----
  if (ex.path.length) {
    follow(map, tamer, ex);
    return ex.mode;
  }
  if (ex.dwell > 0) {
    ex.dwell--;
    return ex.mode;
  }
  const r = bfs(map, avoid, here, EXPLORE.goalRadius);
  const grass: number[] = [];
  const free: number[] = [];
  for (const c of r.order) {
    if (r.depth[c] < EXPLORE.minHopTiles || avoid[c]) continue;
    const x = c % map.width;
    const y = (c - x) / map.width;
    if (inArena(map, cellCenter(map, c))) continue;
    if (env.grassAt?.(x, y)) grass.push(c);
    else free.push(c);
  }
  // na grama: prefere destinos de grama perto (continua pisando nela); fora dela, qualquer grama do raio
  const pool = grass.length ? grass : free;
  if (!pool.length) {
    stop();
    return set("wait");
  }
  const inGrass = env.grassAt?.(here % map.width, Math.floor(here / map.width));
  const close = inGrass ? pool.filter((c) => r.depth[c] <= EXPLORE.minHopTiles + 4) : pool;
  const pickFrom = close.length ? close : pool;
  ex.goal = pickFrom[nextInt(w.rng, 0, pickFrom.length - 1)];
  ex.path = pathTo(r.prev, ex.goal) ?? [];
  ex.dwell = EXPLORE.dwellTicks;
  follow(map, tamer, ex);
  return set(grass.length ? "grass" : "roam");
}

/** Célula alcançada mais perto de `c` (a própria ou uma vizinha até `rad` tiles). */
function nearestReached(map: WorldMap, prev: Int32Array, c: number, rad: number): number | undefined {
  if (prev[c] !== -1) return c;
  const W = map.width;
  const cx = c % W;
  const cy = (c - cx) / W;
  let best: number | undefined;
  let bd = Infinity;
  for (let dy = -rad; dy <= rad; dy++)
    for (let dx = -rad; dx <= rad; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (x < 0 || y < 0 || x >= W || y >= map.height) continue;
      const n = y * W + x;
      const d = dx * dx + dy * dy;
      if (prev[n] !== -1 && d < bd) [best, bd] = [n, d];
    }
  return best;
}

/** Selvagem visível mais perto, alcançável, fora da arena do chefe e aceito pelo AUTO. */
function pickWild(env: ExploreEnv, avoid: Uint8Array): Entity | undefined {
  const { w, map, tamer } = env;
  let best: Entity | undefined;
  let bd = Infinity;
  for (const t of w.entities) {
    if (t.kind !== "wild" || t.removed || !env.huntable(t)) continue;
    if (inArena(map, t) || avoid[cellOf(map, t)]) continue;
    const d = Math.hypot(t.x - tamer.x, t.y - tamer.y);
    if (d > EXPLORE.sightTiles * SUB || d >= bd) continue;
    best = t;
    bd = d;
  }
  return best;
}

/** Segue o caminho: o próximo centro de célula vira o `dest` do Tamer. */
function follow(map: WorldMap, tamer: Entity, ex: ExploreState): void {
  while (ex.path.length) {
    const c = cellCenter(map, ex.path[0]);
    if (Math.hypot(tamer.x - c.x, tamer.y - c.y) < 5 || isSolidAt(map, c.x, c.y)) {
      ex.path.shift();
      ex.stuck = 0;
      continue;
    }
    if (tamer.stuckTicks > 2 || !tamer.dest) ex.stuck++;
    if (ex.stuck > STUCK_MAX) {
      // não avança (algo no caminho): larga este destino; o próximo tick escolhe outro
      ex.path = [];
      ex.stuck = 0;
      ex.dwell = 0;
      tamer.dest = undefined;
      return;
    }
    if (!tamer.dest || tamer.dest.x !== c.x || tamer.dest.y !== c.y) tamer.stuckTicks = 0;
    tamer.dest = c;
    return;
  }
  tamer.dest = undefined;
}
