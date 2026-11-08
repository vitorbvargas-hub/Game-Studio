// Fórmulas puras de balanceamento. Todas as constantes vêm de BalanceDef (JSON).

import type { BalanceDef, ContentBundle, StatBlock } from "./types";

export function statsAtLevel(base: StatBlock, growth: StatBlock, level: number, baseLevel = 1): StatBlock {
  const l = Math.max(0, level - baseLevel);
  return {
    hp: Math.round(base.hp + growth.hp * l),
    atk: Math.round(base.atk + growth.atk * l),
    def: Math.round(base.def + growth.def * l),
    spd: Math.round(base.spd + growth.spd * l),
  };
}

/** XP necessário para ir de `level` para `level + 1`. */
export function xpToNext(balance: BalanceDef, level: number): number {
  return Math.round(balance.xpCurve.base * Math.pow(level, balance.xpCurve.exponent));
}

export function affinityMult(content: ContentBundle, attacker: string, defender: string): number {
  return content.theme.affinityChart[attacker]?.[defender] ?? 1;
}

/** Dano: modelo de mitigação definido em balance.damageModel, × afinidade × variância. */
export function computeDamage(
  balance: BalanceDef,
  power: number,
  atk: number,
  def: number,
  mult: number,
  variance: number,
): number {
  let raw: number;
  if (balance.damageModel === "subtractive") {
    raw = Math.max(1, (power / 100) * atk - Math.max(0, def) * (balance.defenseMult ?? 0.5));
  } else {
    raw = (power / 100) * atk * (balance.defenseK / (balance.defenseK + Math.max(0, def)));
  }
  return Math.max(1, Math.round(raw * mult * variance));
}

export function computeHeal(power: number, atk: number): number {
  return Math.max(1, Math.round((power / 100) * atk));
}

/** XP de um inimigo derrotado, escalando com o nível. */
export function enemyXp(baseXp: number, level: number): number {
  return Math.round(baseXp * (1 + 0.15 * (level - 1)));
}
