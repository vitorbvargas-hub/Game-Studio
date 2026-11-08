// Parâmetros do mundo (WORLD_COMBAT_VISUAL_SPEC.md §9). Valores iniciais [H], para calibrar jogando.

/** Sub-tiles por tile. Posição lógica = inteiro em sub-tiles. */
export const SUB = 16;
/** Tile em pixels (ART_STYLE_GUIDE §2). */
export const TILE_PX = 32;
/** Pixels por sub-tile. */
export const PX_PER_SUB = TILE_PX / SUB;
/** Tick fixo do mundo: 10 Hz. */
export const TICK_MS = 100;

export const WORLD = {
  tamerSpeed: 5,
  partnerSpeed: 5,
  partnerCatchupSpeed: 8,
  wildSpeed: 2,
  wildReturnSpeed: 4,
  /** Distância (sub) a partir da qual a parceira começa a seguir. */
  followDist: 2 * SUB,
  /** Distância atrás do Tamer onde a parceira para. */
  followBack: Math.round(1.25 * SUB),
  /** Raio (sub) em que a parceira em AUTO procura selvagens. */
  aggroRadius: 5 * SUB,
  /** Folga (sub) somada aos raios dos corpos para definir o alcance de ataque. */
  attackReach: 4,
  /** Selvagem: distância máxima de casa. Parceira: distância máxima do Tamer. */
  wildLeash: 8 * SUB,
  partnerLeash: 8 * SUB,
  wanderRadius: 3 * SUB,
  /** Duração lógica do golpe (ATTACK). O dano é resolvido no tick em que ATTACK começa. */
  attackTicks: 5,
  hurtTicks: 3,
  despawnTicks: 15,
  respawnTicks: 80,
  reviveHpPct: 0.3,
  autoMinHpPct: 0.4,
  /** Nível máximo acima do da parceira que o AUTO aceita como alvo. */
  autoLevelMargin: 2,
  missChance: 0.05,
  fleeHpPct: 0.2,
  fleeChance: 0.25,
  encounterTimeoutTicks: 600,
  wildRegenPct: 0.03,
  partnerRegenPct: 0.01,
  wildStatMult: 0.8,
  baseXpByStage: { 1: 8, 2: 14, 3: 30 } as Record<number, number>,
  scanPerDefeat: 25,
} as const;

/** Recarga do ataque básico, em ticks, a partir da velocidade (SPD). */
export function attackCooldownTicks(spd: number): number {
  return Math.max(10, Math.min(25, Math.round(30 - spd)));
}
