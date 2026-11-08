// Batalha automática 3v3 por barra de ação (ATB) em ticks fixos.
// Determinística: a ordem de avaliação é fixa (aliados, depois inimigos, por índice)
// e toda aleatoriedade passa pelo RNG do GameState.

import { affinityMult, computeDamage, computeHeal, statsAtLevel } from "./formulas";
import { nextFloat, type RngHolder } from "./rng";
import type {
  BattleState,
  BossDef,
  Combatant,
  ContentBundle,
  CreatureDef,
  EnemyDef,
  GameEvent,
  SkillDef,
  SkillKind,
} from "./types";

type Hit = { uid: string; amount: number; kind: SkillKind };

const HEAL_THRESHOLD = 0.6;
const GUARD_DEF_MULT = 1.6;

export function makeCombatant(
  def: CreatureDef | EnemyDef,
  uid: string,
  side: "ally" | "enemy",
  level: number,
  hp?: number,
  /** Bônus percentual por stat (Pontos de Treino). */
  bonusPct: Partial<Record<"atk" | "def" | "spd", number>> = {},
): Combatant {
  const s = statsAtLevel(def.base, def.growth, level, def.baseLevel);
  for (const k of ["atk", "def", "spd"] as const) if (bonusPct[k]) s[k] = Math.round(s[k] * (1 + bonusPct[k]! / 100));
  return {
    uid,
    defId: def.id,
    side,
    name: def.name,
    affinity: def.affinity,
    color: def.color,
    sprite: def.sprite,
    spriteFrameMs: def.spriteFrameMs,
    level,
    isBoss: "size" in def && def.size === "boss",
    maxHp: s.hp,
    hp: hp === undefined ? s.hp : Math.max(0, Math.min(s.hp, hp)),
    atk: s.atk,
    def: s.def,
    spd: s.spd,
    gauge: 0,
    skills: [...def.skills],
    cooldowns: {},
    guardTicks: 0,
  };
}

export function createBattle(
  kind: "wave" | "boss",
  areaId: string,
  allies: Combatant[],
  enemies: Combatant[],
  boss?: BossDef,
): BattleState {
  return {
    kind,
    areaId,
    allies,
    enemies,
    tick: 0,
    lethal: boss ? boss.lethal : true,
    outcome: null,
    decision: null,
    thresholdsTaken: [],
    boss,
  };
}

const alive = (list: Combatant[]) => list.filter((c) => c.hp > 0);

function effectiveDef(c: Combatant): number {
  return c.guardTicks > 0 ? Math.round(c.def * GUARD_DEF_MULT) : c.def;
}

function lowestHp(list: Combatant[]): Combatant | undefined {
  let best: Combatant | undefined;
  for (const c of list) if (c.hp > 0 && (!best || c.hp / c.maxHp < best.hp / best.maxHp)) best = c;
  return best;
}

function pickSkill(content: ContentBundle, actor: Combatant, allies: Combatant[]): SkillDef {
  for (const id of actor.skills) {
    const s = content.skills[id];
    if ((actor.cooldowns[id] ?? 0) > 0) continue;
    if (s.kind === "heal" && !alive(allies).some((a) => a.hp / a.maxHp < HEAL_THRESHOLD)) continue;
    return s;
  }
  return content.skills[content.balance.basicSkillId];
}

function applyDamage(b: BattleState, target: Combatant, amount: number): number {
  let hp = target.hp - amount;
  if (!b.lethal && target.side === "ally") hp = Math.max(1, hp);
  hp = Math.max(0, hp);
  const dealt = target.hp - hp;
  target.hp = hp;
  return dealt;
}

/** Aplica uma habilidade. `sourceAtk`/`sourceAffinity` permitem ações do Tamer (sem combatente). */
export function applySkill(
  content: ContentBundle,
  b: BattleState,
  rng: RngHolder,
  skill: SkillDef,
  sourceAtk: number,
  sourceAffinity: string,
  friends: Combatant[],
  foes: Combatant[],
): Hit[] {
  const hits: Hit[] = [];
  const aff = skill.affinity ?? sourceAffinity;
  const bal = content.balance;
  if (skill.kind === "damage") {
    const targets = skill.target === "all_enemies" ? alive(foes) : [lowestHp(foes)].filter(Boolean) as Combatant[];
    for (const t of targets) {
      let variance = 1 - bal.damageVariance + nextFloat(rng) * bal.damageVariance * 2;
      if (bal.critChance && nextFloat(rng) < bal.critChance) variance *= bal.critMult ?? 1.5;
      const dmg = computeDamage(bal, skill.power, sourceAtk, effectiveDef(t), affinityMult(content, aff, t.affinity), variance);
      hits.push({ uid: t.uid, amount: applyDamage(b, t, dmg), kind: "damage" });
    }
  } else if (skill.kind === "heal") {
    const targets = skill.target === "all_allies" ? alive(friends) : [lowestHp(friends)].filter(Boolean) as Combatant[];
    for (const t of targets) {
      const before = t.hp;
      t.hp = Math.min(t.maxHp, t.hp + computeHeal(skill.power, sourceAtk));
      hits.push({ uid: t.uid, amount: t.hp - before, kind: "heal" });
    }
  } else {
    for (const t of alive(friends)) {
      t.guardTicks = Math.max(t.guardTicks, skill.durationTicks ?? 30);
      hits.push({ uid: t.uid, amount: 0, kind: "guard" });
    }
  }
  return hits;
}

function checkOutcome(b: BattleState, events: GameEvent[]): boolean {
  if (!alive(b.enemies).length) b.outcome = "win";
  else if (!alive(b.allies).length) b.outcome = "lose";
  if (b.outcome) events.push({ t: "battle_end", kind: b.kind, outcome: b.outcome });
  return b.outcome !== null;
}

function checkBossDecision(b: BattleState, events: GameEvent[]): boolean {
  if (b.kind !== "boss" || !b.boss || b.decision) return false;
  const boss = b.enemies[0];
  const pct = (boss.hp / boss.maxHp) * 100;
  for (const th of b.boss.decisionAtHpPct) {
    if (b.thresholdsTaken.includes(th) || pct > th || boss.hp <= 0) continue;
    b.thresholdsTaken.push(th);
    b.decision = { kind: "boss_sync", thresholdPct: th, options: [...b.boss.syncOptions] };
    events.push({ t: "decision", decision: b.decision });
    return true;
  }
  return false;
}

/** Avança a batalha 1 tick. Não faz nada se acabou ou se está pausada em decisão. */
export function stepBattle(content: ContentBundle, b: BattleState, rng: RngHolder): GameEvent[] {
  const events: GameEvent[] = [];
  if (b.outcome || b.decision) return events;
  if (checkBossDecision(b, events)) return events;
  b.tick++;
  const order = [...b.allies, ...b.enemies];
  for (const actor of order) {
    if (actor.hp <= 0) continue;
    for (const k of Object.keys(actor.cooldowns)) if (actor.cooldowns[k] > 0) actor.cooldowns[k]--;
    if (actor.guardTicks > 0) actor.guardTicks--;
    actor.gauge += actor.spd;
    if (actor.gauge < content.balance.gaugeMax) continue;
    actor.gauge -= content.balance.gaugeMax;
    const [friends, foes] = actor.side === "ally" ? [b.allies, b.enemies] : [b.enemies, b.allies];
    const skill = pickSkill(content, actor, friends);
    if (skill.cooldownTicks > 0) actor.cooldowns[skill.id] = skill.cooldownTicks;
    const hits = applySkill(content, b, rng, skill, actor.atk, actor.affinity, friends, foes);
    events.push({ t: "act", actor: actor.uid, skillId: skill.id, hits });
    for (const h of hits) if (h.kind === "damage" && order.find((c) => c.uid === h.uid)!.hp <= 0) events.push({ t: "ko", uid: h.uid });
    if (checkOutcome(b, events)) return events;
    if (checkBossDecision(b, events)) return events;
  }
  return events;
}

/** Resolve a pausa de decisão de chefe com a habilidade de sincronização escolhida. */
export function resolveBossDecision(content: ContentBundle, b: BattleState, rng: RngHolder, optionIndex: number): GameEvent[] {
  const d = b.decision;
  if (!d) throw new Error("Sem decisão pendente");
  const skillId = d.options[optionIndex];
  if (!skillId) throw new Error(`Opção inválida: ${optionIndex}`);
  const skill = content.skills[skillId];
  const living = alive(b.allies);
  // O Tamer age com a média de ATK do time vivo; afinidade neutra salvo se a habilidade definir.
  const atk = living.length ? Math.round(living.reduce((s, c) => s + c.atk, 0) / living.length) : 1;
  b.decision = null;
  const hits = applySkill(content, b, rng, skill, atk, "", b.allies, b.enemies);
  const events: GameEvent[] = [{ t: "sync", skillId, hits }];
  for (const h of hits) if (h.kind === "damage" && b.enemies.find((c) => c.uid === h.uid)!.hp <= 0) events.push({ t: "ko", uid: h.uid });
  checkOutcome(b, events);
  return events;
}
