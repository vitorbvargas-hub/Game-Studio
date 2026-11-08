// Máquina de estados lógica (WORLD_COMBAT_VISUAL_SPEC.md §3). Toda troca de estado passa por setState,
// que recusa transições fora desta tabela e emite o evento `state`.

import type { Entity, EntityKind, LogicState, WorldEvent } from "./types";

export const LOGIC_STATES: LogicState[] = ["IDLE", "WALK", "FOLLOW", "ENGAGE", "ATTACK", "HURT", "DEFEAT", "RETURN"];

/** Transições permitidas para criaturas (parceiras e selvagens). */
export const CREATURE_TRANSITIONS: Record<LogicState, LogicState[]> = {
  IDLE: ["WALK", "FOLLOW", "ENGAGE", "HURT", "RETURN", "DEFEAT"],
  WALK: ["IDLE", "FOLLOW", "ENGAGE", "HURT", "RETURN", "DEFEAT"],
  FOLLOW: ["IDLE", "ENGAGE", "HURT", "RETURN", "DEFEAT"],
  ENGAGE: ["ATTACK", "RETURN", "IDLE", "HURT", "DEFEAT"],
  // HURT não interrompe um ATTACK já confirmado; só a derrota interrompe.
  ATTACK: ["ENGAGE", "IDLE", "DEFEAT"],
  HURT: ["IDLE", "WALK", "FOLLOW", "ENGAGE", "RETURN", "DEFEAT"],
  // Respawn/revive é um novo spawn, não uma transição a partir de DEFEAT.
  DEFEAT: [],
  RETURN: ["IDLE", "HURT", "DEFEAT"],
};

/** Tamers (jogador e remotos) não lutam: só andam. */
export const TAMER_TRANSITIONS: Record<LogicState, LogicState[]> = {
  IDLE: ["WALK"],
  WALK: ["IDLE"],
  FOLLOW: [],
  ENGAGE: [],
  ATTACK: [],
  HURT: [],
  DEFEAT: [],
  RETURN: [],
};

export function isTamer(kind: EntityKind): boolean {
  return kind === "player" || kind === "remote_player";
}

export function canTransition(kind: EntityKind, from: LogicState, to: LogicState): boolean {
  if (from === to) return true;
  const table = isTamer(kind) ? TAMER_TRANSITIONS : CREATURE_TRANSITIONS;
  return table[from].includes(to);
}

export class IllegalTransition extends Error {}

export function setState(e: Entity, to: LogicState, tick: number, ev: WorldEvent[]): void {
  const from = e.state;
  if (from === to) return;
  if (!canTransition(e.kind, from, to)) throw new IllegalTransition(`${e.id} (${e.kind}): ${from} -> ${to}`);
  e.state = to;
  ev.push({ t: "state", tick, id: e.id, from, to });
}
