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

export type MoveType = "physical" | "special" | "buff" | "debuff" | "heal";
export type MoveTarget = "single" | "area" | "line" | "projectile" | "self";
export type StatKey = "atk" | "def" | "spd";

/** Golpe (docs/MOVE_SYSTEM.md). Unidades da sim: ticks e sub-tiles; o loader converte tiles → sub. */
export interface MoveDef {
  id: string;
  name: string;
  type: MoveType;
  element: string;
  power: number;
  /** Custo em MP (energia). */
  cost: number;
  cooldownTicks: number;
  target: MoveTarget;
  /** Forma original do dado (single/area/line/projectile), para a apresentação. */
  shape: string;
  /** Alcance extra além do corpo a corpo, em sub-tiles (0 = encostado). */
  range: number;
  /** Área: raio em sub-tiles. Linha: meia largura em sub-tiles. */
  radius: number;
  /** Multiplicadores de atributo do atacante que compõem o "ataque" do golpe. */
  scaling: Partial<Record<StatKey | "hp", number>>;
  effect?: { stat: StatKey; mult: number; ticks: number };
  /** Só apresentação (a sim ignora): id do arquétipo de VFX. */
  vfx: string;
  desc?: string;
  /** Técnica oficial com citação (true) ou filler genérico (false). */
  verified?: boolean;
}

export type AutoCond = "always" | "target_hp_below_pct" | "self_hp_below_pct" | "ally_hp_below_pct" | "buff_not_active";

/** Um item da lista de prioridade do AUTO (§2.5): golpe, condição opcional e se está desligado. */
export interface AutoRule {
  moveId: string;
  cond: AutoCond;
  pct?: number;
  off?: boolean;
}

export interface StatusEffect {
  moveId: string;
  stat: StatKey;
  mult: number;
  ticks: number;
  sourceId: string;
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
  mp?: number;
  maxMp?: number;
  targetId?: string;
  encounterId?: string;
}

export type WorldEvent =
  | { t: "spawn"; tick: number; entity: EntitySnapshot }
  | { t: "despawn"; tick: number; id: string }
  | { t: "state"; tick: number; id: string; from: LogicState; to: LogicState }
  | { t: "engage"; tick: number; encounterId: string; attackerId: string; targetId: string }
  | { t: "encounter_start"; tick: number; encounterId: string; members: string[] }
  | {
      t: "attack_start";
      tick: number;
      attackerId: string;
      targetId: string;
      /** Golpe usado (id em moves.json). */
      skillId: string;
      seq: number;
      /** Todos os afetados (área/linha atingem mais de um; buff/cura = o próprio atacante). */
      targetIds?: string[];
      /** Centro do efeito em sub-tiles (área: o ponto do impacto; linha: a ponta). */
      at?: Vec;
    }
  | { t: "status"; tick: number; seq: number; id: string; moveId: string; stat: StatKey; mult: number; ticks: number; sourceId: string }
  | { t: "move_learned"; tick: number; id: string; moveId: string; slot: number | null }
  | { t: "moves_changed"; tick: number; id: string; slots: (string | null)[] }
  | { t: "evolve"; tick: number; id: string; from: string; to: string; kept: string[] }
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
  | { t: "set_auto"; playerId: string; on: boolean }
  /** Troca os 4 golpes ativos da parceira (só golpes aprendidos; null = slot vazio). */
  | { t: "set_moves"; playerId: string; slots: (string | null)[] }
  /** Lista de prioridade do AUTO (ordem + condição por golpe). */
  | { t: "set_auto_priority"; playerId: string; rules: AutoRule[] }
  /** Usa o golpe do slot no próximo ataque possível (fura a fila do AUTO). */
  | { t: "use_move"; playerId: string; slot: number }
  /** Evolui a parceira; `keep` = golpes da forma anterior a manter (até inheritSlotsOnEvolve; padrão: os de maior poder). */
  | { t: "evolve"; playerId: string; keep?: string[]; to?: string }
  /** Preferência do Auto-evoluir para a ramificação de `from` (null = perguntar sempre). */
  | { t: "set_evo_pref"; playerId: string; from: string; to: string | null }
  /** Liga/desliga a evolução automática (opção do AUTO): ao atingir o nível, evolui sozinha fora de combate. */
  | { t: "set_auto_evolve"; playerId: string; on: boolean }
  /** Recompensa em bits coletada numa tela (Missões); só valores positivos. */
  | { t: "add_bits"; playerId: string; bits: number };

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
  element: string;
  /** Golpes aprendidos (ordem de aprendizado). */
  learned: string[];
  /** Os 4 slots ativos. */
  moves: (string | null)[];
  /** Recarga por golpe, em ticks. */
  moveCd: Record<string, number>;
  mp: number;
  maxMp: number;
  /** Prioridade do AUTO (gambit simples): ordem de tentativa + condição por slot. */
  autoRules: AutoRule[];
  /** Golpe pedido pelo jogador (use_move), usado no próximo ataque em que estiver pronto. */
  queuedMove?: string;
  statuses: StatusEffect[];
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
  /** Arena: lado da partida ("A" | "B"). Com lado, só o lado oposto é hostil (sem selvagens, sem encontros). */
  team?: string;
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
  /** Evolução automática (opção do AUTO). Ausente = desligada. */
  autoEvolve?: boolean;
  /** Preferência de caminho por espécie de origem (EVOLUTION_PROPOSAL.md §5), usada pelo Auto-evoluir. */
  evoPrefs?: Record<string, string>;
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
