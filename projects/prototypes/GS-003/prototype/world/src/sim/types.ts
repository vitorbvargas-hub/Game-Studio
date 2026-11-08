// Tipos da autoridade do mundo (WORLD_COMBAT_VISUAL_SPEC.md §2 e §5).
// Nada aqui conhece Canvas, DOM, manifests de animação ou assets.

export type Dir8 = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
export type LogicState = "IDLE" | "WALK" | "FOLLOW" | "ENGAGE" | "ATTACK" | "HURT" | "DEFEAT" | "RETURN";
export type EntityKind = "player" | "partner" | "remote_player" | "remote_partner" | "wild" | "npc";

/** Posições lógicas em sub-tiles (1/16 de tile = 2 px num tile de 32 px). */
export interface Vec {
  x: number;
  y: number;
}

export interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface SkillDef {
  id: string;
  name: string;
  kind: string;
  power: number;
  cooldownTicks: number;
}

/** Espécie para a sim: só números. O id coincide com o id da criatura em GAME-ASSETS (CREATURE-NNNN). */
export interface SpeciesDef {
  id: string;
  name: string;
  stage: number;
  affinity: string;
  base: StatBlock;
  growth: StatBlock;
  skills: string[];
  /** Raio do corpo em sub-tiles (colisão/alcance). Dado de jogo, não lido do sprite. */
  radius: number;
}

export interface EntitySnapshot {
  id: string;
  kind: EntityKind;
  speciesId?: string;
  ownerId?: string;
  name: string;
  x: number;
  y: number;
  facing: Dir8;
  state: LogicState;
  hp: number;
  maxHp: number;
  level: number;
  targetId?: string;
  encounterId?: string;
}

export type WorldEvent =
  | { t: "spawn"; tick: number; entity: EntitySnapshot }
  | { t: "despawn"; tick: number; id: string }
  | { t: "state"; tick: number; id: string; from: LogicState; to: LogicState }
  | { t: "engage"; tick: number; encounterId: string; attackerId: string; targetId: string }
  | { t: "encounter_start"; tick: number; encounterId: string; members: string[] }
  | { t: "attack_start"; tick: number; attackerId: string; targetId: string; skillId: string; seq: number }
  | {
      t: "damage";
      tick: number;
      seq: number;
      attackerId: string;
      targetId: string;
      amount: number;
      kind: "damage" | "heal" | "miss";
      crit: boolean;
      hpAfter: number;
    }
  | { t: "defeat"; tick: number; id: string; by?: string }
  | { t: "reward"; tick: number; ownerId: string; partnerId: string; xp: number; bits: number; drops: string[]; at: Vec }
  | { t: "level_up"; tick: number; id: string; level: number }
  | { t: "capture"; tick: number; ownerId: string; speciesId: string; pct: number; done: boolean }
  | { t: "encounter_end"; tick: number; encounterId: string; reason: "defeat" | "flee" | "leash" | "timeout" }
  | { t: "intent_rejected"; tick: number; playerId: string; reason: string };

/** Pedidos do jogador. A sim aceita ou recusa; o resultado chega como evento. */
export type Intent =
  | { t: "move_to"; playerId: string; x: number; y: number }
  | { t: "move_dir"; playerId: string; dx: number; dy: number }
  | { t: "engage"; playerId: string; targetId: string }
  | { t: "flee"; playerId: string }
  | { t: "set_auto"; playerId: string; on: boolean };

export interface Entity {
  id: string;
  kind: EntityKind;
  ownerId?: string;
  speciesId?: string;
  name: string;
  x: number;
  y: number;
  facing: Dir8;
  state: LogicState;
  /** Estado a retomar ao sair de HURT. */
  resumeState?: LogicState;
  /** Ticks restantes em estados temporizados (ATTACK, HURT, DEFEAT). */
  stateTicks: number;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  stats: StatBlock;
  affinity: string;
  skills: string[];
  skillCd: Record<string, number>;
  attackCd: number;
  radius: number;
  speed: number;
  home: Vec;
  targetId?: string;
  encounterId?: string;
  dest?: Vec;
  waitTicks: number;
  stuckTicks: number;
  fleeRolled: boolean;
  /** Zona de spawn de origem (selvagens), para o respawn. */
  zoneIndex?: number;
  /** Tamers: trilha de pontos (mais recente por último) que a parceira segue (follow-the-leader). */
  trail?: Vec[];
  removed: boolean;
}

export interface PlayerState {
  id: string;
  tamerId: string;
  partnerId: string;
  auto: boolean;
  bits: number;
  scans: Record<string, number>;
  captured: string[];
  /** Direção do WASD neste tick (consumida no mesmo tick). */
  dir?: Vec;
  bot: boolean;
}

export interface Encounter {
  id: string;
  members: string[];
  started: boolean;
  startTick: number;
}

export interface WorldState {
  tick: number;
  rng: { rngState: number };
  seq: number;
  idSeq: number;
  encSeq: number;
  entities: Entity[];
  players: PlayerState[];
  encounters: Encounter[];
  pendingSpawns: { zoneIndex: number; atTick: number }[];
}
