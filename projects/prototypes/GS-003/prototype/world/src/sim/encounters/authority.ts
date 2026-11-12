// GS-012 passos 5–7: EncounterAuthority (ENCOUNTER_ARCHITECTURE.md §2.3) e a implementação local.
// Tudo o que sorteia ou valida um encontro passa por aqui, com o RNG da sim (w.rng). O estado fica em
// WorldState.enc (dados puros, serializáveis); esta classe só guarda a tabela e os índices do mapa.
// No futuro a mesma classe roda no servidor: o cliente manda intents de movimento, nunca "achei um Digimon".

import { nextInt } from "@game/src/sim/rng";
import type { SpawnZone, WorldMap } from "../map";
import { SUB, TICK_MS } from "../params";
import type { Entity, Vec, WorldState } from "../types";
import { endRoll, matches, newRollState, randomPool, step, stepChance, type Cond, type EncounterArea, type EncounterEntry, type EncounterTable, type RollCtx, type RollState, type StepResult } from "./rules";

/** Ambiente injetado na sim (a sim só "sabe que horas são" pela intent set_env). Clima: "clear" até existir um sistema. */
export interface EnvState {
  time: string;
  weather: string;
}

export interface PlayerRoll extends RollState {
  /** Último tile pisado (índice), para testar só ao entrar num tile novo. */
  lastTile: number;
  /** Contadores para o painel de debug. */
  steps: number;
  rolls: number;
  encounters: number;
  empties: number;
  lastP: number;
}

/** Estado dos encontros dentro do WorldState (serializável). */
export interface EncWorldState {
  env: EnvState;
  rolls: Record<string, PlayerRoll>;
  /** Recompensas já pagas (chave do encontro aleatório ou id do selvagem visível): idempotência do settle. */
  paid: string[];
  /** Encontros já liquidados (id do Encounter). */
  settled: string[];
  /** Debug (?encdebug=1): próximo encontro forçado por jogador. */
  force: Record<string, { entryId?: string; rarity?: string }>;
  seq: number;
}

export const INTRO_TICKS = 20; // 2,0 s: grama treme, "!", salto em arco e pouso antes de o combate começar (QA fase 3: 1,2 s era curto demais)
export const PAID_MAX = 512;

export interface VisibleZone extends SpawnZone {
  entryId: string;
  behavior: "idle" | "ignore" | "flee" | "chase";
  /** Raios em sub-tiles. */
  detect: number;
  lose: number;
  wander: number;
  respawnTicks: number;
  requires?: Cond;
  fightable: boolean;
  /** shared:false → individual (só o dono vê e luta). */
  individual: boolean;
  rarity: string;
}

export interface EncounterAuthority {
  /** Tamer entrou num tile novo. No máximo 1 resultado; o estado anti-sequência é por jogador. */
  onStep(w: WorldState, playerId: string, tamer: Entity, partner: Entity | undefined, blocked: boolean): StepResult;
  /** Pode este jogador lutar com esta entidade agora? (undefined = pode; senão o motivo). */
  canEngage(playerId: string, wild: Entity): string | undefined;
  /** Fim do combate: libera o intervalo mínimo dos jogadores envolvidos (uma vez por encontro). */
  settle(w: WorldState, encounterId: string, playerIds: string[]): boolean;
  /** Recompensa: true só na primeira vez para esta chave (idempotente). */
  claimReward(w: WorldState, key: string): boolean;
  /** Pontos visíveis ativos neste ambiente. */
  visibleSpots(env: EnvState): VisibleZone[];
}

export class LocalEncounterAuthority implements EncounterAuthority {
  readonly table: EncounterTable;
  readonly map: WorldMap;
  readonly areas: EncounterArea[];
  /** 1 = célula de trilha (o centro dela cai dentro da faixa de uma curva `path`): trilha não sorteia encontro. */
  readonly pathCells: Uint8Array;
  readonly zones: VisibleZone[];

  constructor(table: EncounterTable, map: WorldMap) {
    this.table = table;
    this.map = map;
    this.areas = map.encounterAreas?.length ? map.encounterAreas : table.areas;
    this.pathCells = pathCellsOf(map);
    this.zones = visibleZonesOf(table);
  }

  newWorldState(env: EnvState): EncWorldState {
    return { env: { ...env }, rolls: {}, paid: [], settled: [], force: {}, seq: 0 };
  }

  rollOf(w: WorldState, playerId: string): PlayerRoll {
    const enc = w.enc!;
    let r = enc.rolls[playerId];
    if (!r) {
      // carência ao entrar no mapa (ENCOUNTER_ARCHITECTURE §2.4)
      r = { ...newRollState(this.table, w.rng, nowSec(w)), lastTile: -1, steps: 0, rolls: 0, encounters: 0, empties: 0, lastP: 0 };
      enc.rolls[playerId] = r;
    }
    return r;
  }

  /** Área e terreno do tile (null fora de área ou em trilha). */
  areaAt(tx: number, ty: number): EncounterArea | undefined {
    if (tx < 0 || ty < 0 || tx >= this.map.width || ty >= this.map.height) return undefined;
    if (this.pathCells[ty * this.map.width + tx]) return undefined;
    return this.areas.find((a) => tx >= a.rect.x && tx < a.rect.x + a.rect.w && ty >= a.rect.y && ty < a.rect.y + a.rect.h);
  }

  ctxFor(w: WorldState, tamer: Entity, partner: Entity | undefined, blocked: boolean): RollCtx {
    const a = this.areaAt(Math.floor(tamer.x / SUB), Math.floor(tamer.y / SUB));
    return {
      terrain: a?.terrain ?? null,
      areaId: a?.id,
      areaRateMult: a?.rateMult ?? 1,
      time: w.enc!.env.time,
      weather: w.enc!.env.weather,
      partnerLevel: partner?.level ?? 1,
      nowSec: nowSec(w),
      blocked,
    };
  }

  onStep(w: WorldState, playerId: string, tamer: Entity, partner: Entity | undefined, blocked: boolean): StepResult {
    const r = this.rollOf(w, playerId);
    r.steps++;
    const ctx = this.ctxFor(w, tamer, partner, blocked);
    const res = step(this.table, r, w.rng, ctx);
    if (res.kind === "miss" || res.kind === "empty" || res.kind === "encounter") {
      r.rolls++;
      r.lastP = res.p;
    }
    if (res.kind === "encounter") r.encounters++;
    if (res.kind === "empty") r.empties++;
    return res;
  }

  /** Debug: a entrada do encontro forçado (entrada exata, ou sorteada entre as da raridade pedida). */
  forced(w: WorldState, playerId: string): EncounterEntry | undefined {
    const f = w.enc!.force[playerId];
    if (!f) return undefined;
    delete w.enc!.force[playerId];
    const randoms = this.table.entries.filter((e) => e.mode === "random" || e.mode === "both");
    if (f.entryId) return this.table.entries.find((e) => e.id === f.entryId);
    const pool = randoms.filter((e) => !f.rarity || e.rarity === f.rarity);
    return pool.length ? pool[nextInt(w.rng, 0, pool.length - 1)] : undefined;
  }

  canEngage(playerId: string, wild: Entity): string | undefined {
    if ((wild.introTicks ?? 0) > 0) return "ainda saindo da grama";
    if (wild.encOwner && wild.encOwner !== playerId) return "encontro de outro jogador";
    return undefined;
  }

  settle(w: WorldState, encounterId: string, playerIds: string[]): boolean {
    const enc = w.enc!;
    if (enc.settled.includes(encounterId)) return false;
    enc.settled.push(encounterId);
    if (enc.settled.length > PAID_MAX) enc.settled.splice(0, enc.settled.length - PAID_MAX);
    for (const id of playerIds) if (enc.rolls[id]) endRoll(this.table, enc.rolls[id], nowSec(w));
    return true;
  }

  claimReward(w: WorldState, key: string): boolean {
    const enc = w.enc!;
    if (enc.paid.includes(key)) return false;
    enc.paid.push(key);
    if (enc.paid.length > PAID_MAX) enc.paid.splice(0, enc.paid.length - PAID_MAX);
    return true;
  }

  visibleSpots(env: EnvState): VisibleZone[] {
    return this.zones.filter((z) => matches(z.requires, env));
  }

  /** Painel de debug (?encdebug=1): onde o Tamer está, a chance deste passo, a carência e o pool com %. */
  inspect(w: WorldState, playerId: string, tamer: Entity, partner: Entity | undefined) {
    const r = this.rollOf(w, playerId);
    const ctx = this.ctxFor(w, tamer, partner, false);
    const pool = randomPool(this.table, ctx);
    const total = pool.reduce((s, x) => s + x.weight, 0) || 1;
    const empty = this.table.params.emptyRustle.chance;
    const rarity: Record<string, number> = {};
    for (const x of pool) rarity[x.entry.rarity] = (rarity[x.entry.rarity] ?? 0) + (x.weight / total) * 100;
    return {
      env: { ...w.enc!.env },
      tile: { x: Math.floor(tamer.x / SUB), y: Math.floor(tamer.y / SUB) },
      areaId: ctx.areaId ?? null,
      terrain: ctx.terrain,
      pStep: ctx.terrain ? stepChance(this.table, r, ctx) : 0,
      graceLeft: Math.max(0, r.grace - r.stepsSince),
      readyInSec: Math.max(0, r.readyAtSec - nowSec(w)),
      stepsSince: r.stepsSince,
      counters: { steps: r.steps, rolls: r.rolls, encounters: r.encounters, empties: r.empties },
      emptyPct: empty * 100,
      pool: pool.map((x) => ({ entryId: x.entry.id, name: x.entry.name, rarity: x.entry.rarity, levels: x.entry.levels, pct: (x.weight / total) * 100 })),
      rarityPct: rarity,
    };
  }
}

export function nowSec(w: WorldState): number {
  return (w.tick * TICK_MS) / 1000;
}

/** Pontos visíveis da tabela → zonas de spawn estendidas (ENCOUNTER_ARCHITECTURE §2.6): o spawn atual continua o único. */
export function visibleZonesOf(table: EncounterTable): VisibleZone[] {
  return table.entries
    .filter((e) => (e.mode === "visible" || e.mode === "both") && e.visible)
    .map((e) => {
      const v = e.visible!;
      const rs = v.respawn;
      return {
        species: e.speciesPool?.length ? [...e.speciesPool] : [e.speciesId],
        levelMin: e.levels[0],
        levelMax: e.levels[1],
        count: v.maxAlive,
        center: { x: Math.round((v.spot.x + 0.5) * SUB), y: Math.round((v.spot.y + 0.5) * SUB) },
        radius: Math.max(SUB / 2, v.spot.wanderTiles * SUB),
        entryId: e.id,
        behavior: v.behavior,
        detect: v.detectRadiusTiles * SUB,
        lose: (v.loseRadiusTiles ?? v.detectRadiusTiles + 3) * SUB,
        wander: v.spot.wanderTiles * SUB,
        // timer: segundos da tabela; daily/never: não volta nesta sessão; period: volta quando a fase do dia mudar
        respawnTicks: rs.kind === "timer" ? Math.round(((rs.seconds ?? 60) * 1000) / TICK_MS) : Number.POSITIVE_INFINITY,
        requires: e.requires,
        fightable: v.fightable,
        individual: e.shared === false,
        rarity: e.rarity,
      };
    });
}

/** Células cujo centro cai dentro da faixa de uma curva `path` (Map Factory). */
export function pathCellsOf(map: WorldMap): Uint8Array {
  const out = new Uint8Array(map.width * map.height);
  const ts = map.tileSize;
  for (const c of map.curves ?? []) {
    if (c.terrain !== "path") continue;
    for (let i = 0; i + 1 < c.points.length; i++) {
      const a = c.points[i];
      const b = c.points[i + 1];
      const hw = Math.max(c.hw[i], c.hw[i + 1]);
      const x0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - hw) / ts));
      const x1 = Math.min(map.width - 1, Math.floor((Math.max(a.x, b.x) + hw) / ts));
      const y0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - hw) / ts));
      const y1 = Math.min(map.height - 1, Math.floor((Math.max(a.y, b.y) + hw) / ts));
      for (let ty = y0; ty <= y1; ty++)
        for (let tx = x0; tx <= x1; tx++) {
          const px = tx * ts + ts / 2;
          const py = ty * ts + ts / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const l2 = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
          const h = c.hw[i] + (c.hw[i + 1] - c.hw[i]) * t;
          if (Math.hypot(px - a.x - dx * t, py - a.y - dy * t) < h) out[ty * map.width + tx] = 1;
        }
    }
  }
  return out;
}

/** Ponto em sub-tiles → tile. */
export function tileOf(v: Vec): { x: number; y: number } {
  return { x: Math.floor(v.x / SUB), y: Math.floor(v.y / SUB) };
}
