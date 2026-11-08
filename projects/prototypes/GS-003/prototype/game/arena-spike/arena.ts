// SPIKE — Arena de Ação 1v1 (tempo real, top-down).
// Simulação pura: sem DOM, sem canvas, sem relógio de parede. Passo fixo (cfg.simHz) e RNG do
// motor (mulberry32) guardado no estado => mesmos inputs por tick = mesmo resultado. É a peça
// que, num modo online, rodaria no servidor autoritativo.
// Reaproveita do motor principal: ContentBundle (packs), statsAtLevel, computeDamage,
// affinityMult e o RNG. Só usa + - * / e sqrt (sem trigonometria) para não depender de libm.

import { affinityMult, computeDamage, statsAtLevel } from "../src/sim/formulas";
import { nextFloat } from "../src/sim/rng";
import type { ContentBundle, SkillDef, SpriteRef } from "../src/sim/types";

export interface ArenaConfig {
  simHz: number;
  width: number;
  height: number;
  margin: number;
  bodyRadius: number;
  /** Espaço extra no topo: o sprite (48 px) e a barra de HP ficam acima do corpo. */
  topClearancePx: number;
  /** Multiplicador de HP só da arena: lutas de ação precisam de mais acertos que o idle. */
  hpMult: number;
  moveBase: number;
  movePerSpd: number;
  basic: { rangePx: number; arcDot: number; cooldownMs: number; knockbackPx: number };
  special: { projectileSpeed: number; projectileRadius: number; rangePx: number; knockbackPx: number; selfHealMult: number };
  hitstunMs: number;
  guardReduction: number;
  timeLimitSec: number;
  ai: { reactionMs: number; preferredRangePx: number; specialMaxRangePx: number; aimToleranceDot: number; strafeEveryMs: number };
}

/** Input de um lutador em um tick. mx/my em {-1,0,1}. É isto que trafegaria na rede. */
export interface ArenaInput {
  mx: number;
  my: number;
  basic: boolean;
  special: boolean;
}

export const NO_INPUT: ArenaInput = { mx: 0, my: 0, basic: false, special: false };

export interface Fighter {
  idx: 0 | 1;
  defId: string;
  name: string;
  affinity: string;
  color: string;
  sprite?: SpriteRef;
  spriteFrameMs?: number;
  level: number;
  x: number;
  y: number;
  /** Direção para onde olha (vetor unitário). Ataques saem nessa direção. */
  fx: number;
  fy: number;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  /** px por tick. */
  speed: number;
  basic: SkillDef;
  special: SkillDef;
  basicCd: number;
  specialCd: number;
  specialCdMax: number;
  hitstun: number;
  guard: number;
  /** Ticks restantes da animação de ataque básico (só visual). */
  swing: number;
}

export interface Projectile {
  owner: 0 | 1;
  x: number;
  y: number;
  vx: number;
  vy: number;
  travelled: number;
  skillId: string;
  affinity: string;
}

export type ArenaEvent =
  | { t: "hit"; target: 0 | 1; amount: number; crit: boolean; skillId: string }
  | { t: "heal"; target: 0 | 1; amount: number }
  | { t: "guard"; target: 0 | 1 }
  | { t: "cast"; who: 0 | 1; skillId: string }
  | { t: "ko"; target: 0 | 1 }
  | { t: "end"; outcome: ArenaOutcome };

/** Sempre do ponto de vista do lutador 0 (jogador). */
export type ArenaOutcome = "win" | "lose" | "draw";

export interface ArenaState {
  tick: number;
  rngState: number;
  fighters: [Fighter, Fighter];
  projectiles: Projectile[];
  outcome: ArenaOutcome | null;
  /** Memória da IA por lutador (faz parte do estado para a luta ser reproduzível). */
  ai: [AiMemory, AiMemory];
}

export interface AiMemory {
  nextThinkTick: number;
  strafe: number;
  mx: number;
  my: number;
}

export interface FighterSpec {
  creatureId: string;
  level: number;
}

const msToTicks = (cfg: ArenaConfig, ms: number) => Math.max(1, Math.round((ms * cfg.simHz) / 1000));

/** Especial = primeira habilidade da criatura que não é o básico do pacote. */
export function pickSkills(content: ContentBundle, creatureId: string): { basic: SkillDef; special: SkillDef } {
  const def = content.creatures[creatureId];
  if (!def) throw new Error(`Criatura desconhecida no pacote ${content.pack.id}: ${creatureId}`);
  const basic = content.skills[content.balance.basicSkillId];
  const specialId = def.skills.find((s) => s !== content.balance.basicSkillId) ?? content.balance.basicSkillId;
  return { basic, special: content.skills[specialId] };
}

function makeFighter(content: ContentBundle, cfg: ArenaConfig, spec: FighterSpec, idx: 0 | 1): Fighter {
  const def = content.creatures[spec.creatureId];
  const { basic, special } = pickSkills(content, spec.creatureId);
  const s = statsAtLevel(def.base, def.growth, spec.level, def.baseLevel ?? 1);
  const maxHp = Math.round(s.hp * cfg.hpMult);
  // cooldownTicks do pacote está em ticks do idle (balance.tickMs); convertemos para ticks da arena.
  const specialCdMax = msToTicks(cfg, special.cooldownTicks * content.balance.tickMs);
  return {
    idx,
    defId: def.id,
    name: def.name,
    affinity: def.affinity,
    color: def.color,
    sprite: def.sprite,
    spriteFrameMs: def.spriteFrameMs,
    level: spec.level,
    x: idx === 0 ? cfg.width * 0.25 : cfg.width * 0.75,
    y: (cfg.height + cfg.topClearancePx) / 2,
    fx: idx === 0 ? 1 : -1,
    fy: 0,
    maxHp,
    hp: maxHp,
    atk: s.atk,
    def: s.def,
    spd: s.spd,
    speed: (cfg.moveBase + s.spd * cfg.movePerSpd) / cfg.simHz,
    basic,
    special,
    basicCd: 0,
    specialCd: Math.round(specialCdMax / 2),
    specialCdMax,
    hitstun: 0,
    guard: 0,
    swing: 0,
  };
}

export function createArena(content: ContentBundle, cfg: ArenaConfig, player: FighterSpec, enemy: FighterSpec, seed: number): ArenaState {
  return {
    tick: 0,
    rngState: seed >>> 0,
    fighters: [makeFighter(content, cfg, player, 0), makeFighter(content, cfg, enemy, 1)],
    projectiles: [],
    outcome: null,
    ai: [
      { nextThinkTick: 0, strafe: 1, mx: 0, my: 0 },
      { nextThinkTick: 0, strafe: -1, mx: 0, my: 0 },
    ],
  };
}

function dealDamage(st: ArenaState, content: ContentBundle, cfg: ArenaConfig, from: Fighter, to: Fighter, skill: SkillDef, kbx: number, kby: number, kb: number, ev: ArenaEvent[]): void {
  const b = content.balance;
  const variance = 1 + (nextFloat(st) * 2 - 1) * b.damageVariance;
  const crit = nextFloat(st) < (b.critChance ?? 0);
  const mult = affinityMult(content, skill.affinity ?? from.affinity, to.affinity) * (crit ? (b.critMult ?? 1.5) : 1);
  let amount = computeDamage(b, skill.power, from.atk, to.def, mult, variance);
  if (to.guard > 0) amount = Math.max(1, Math.round(amount * (1 - cfg.guardReduction)));
  to.hp = Math.max(0, to.hp - amount);
  to.hitstun = msToTicks(cfg, cfg.hitstunMs);
  to.x += kbx * kb;
  to.y += kby * kb;
  clampToArena(cfg, to);
  ev.push({ t: "hit", target: to.idx, amount, crit, skillId: skill.id });
  if (to.hp === 0) ev.push({ t: "ko", target: to.idx });
}

function clampToArena(cfg: ArenaConfig, f: Fighter): void {
  const r = cfg.bodyRadius + cfg.margin;
  f.x = Math.min(cfg.width - r, Math.max(r, f.x));
  f.y = Math.min(cfg.height - r, Math.max(cfg.margin + cfg.topClearancePx, f.y));
}

function useBasic(st: ArenaState, content: ContentBundle, cfg: ArenaConfig, me: Fighter, foe: Fighter, ev: ArenaEvent[]): void {
  me.basicCd = msToTicks(cfg, Math.max(cfg.basic.cooldownMs, me.basic.cooldownTicks * content.balance.tickMs));
  me.swing = msToTicks(cfg, 150);
  const dx = foe.x - me.x;
  const dy = foe.y - me.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  // Acerta se o alvo está no alcance e num cone à frente.
  if (d <= cfg.basic.rangePx + cfg.bodyRadius && (dx * me.fx + dy * me.fy) / d >= cfg.basic.arcDot) {
    dealDamage(st, content, cfg, me, foe, me.basic, dx / d, dy / d, cfg.basic.knockbackPx, ev);
  }
}

function useSpecial(st: ArenaState, content: ContentBundle, cfg: ArenaConfig, me: Fighter, ev: ArenaEvent[]): void {
  me.specialCd = me.specialCdMax;
  const sk = me.special;
  ev.push({ t: "cast", who: me.idx, skillId: sk.id });
  if (sk.kind === "damage") {
    const v = cfg.special.projectileSpeed / cfg.simHz;
    st.projectiles.push({
      owner: me.idx,
      x: me.x + me.fx * cfg.bodyRadius,
      y: me.y + me.fy * cfg.bodyRadius,
      vx: me.fx * v,
      vy: me.fy * v,
      travelled: 0,
      skillId: sk.id,
      affinity: sk.affinity ?? me.affinity,
    });
  } else if (sk.kind === "heal") {
    // Em 1v1 não há aliado: a cura vira autocura (power em % do ATK, como no idle).
    const amount = Math.max(1, Math.round((sk.power / 100) * me.atk * cfg.special.selfHealMult));
    me.hp = Math.min(me.maxHp, me.hp + amount);
    ev.push({ t: "heal", target: me.idx, amount });
  } else {
    me.guard = msToTicks(cfg, (sk.durationTicks ?? 30) * content.balance.tickMs);
    ev.push({ t: "guard", target: me.idx });
  }
}

/** Avança 1 tick. inputs[0] = jogador, inputs[1] = IA (ou segundo jogador). Devolve eventos do tick. */
export function stepArena(st: ArenaState, content: ContentBundle, cfg: ArenaConfig, inputs: [ArenaInput, ArenaInput]): ArenaEvent[] {
  const ev: ArenaEvent[] = [];
  if (st.outcome) return ev;
  st.tick++;
  const [a, b] = st.fighters;

  for (const me of st.fighters) {
    const foe = me.idx === 0 ? b : a;
    const inp = inputs[me.idx];
    if (me.basicCd > 0) me.basicCd--;
    if (me.specialCd > 0) me.specialCd--;
    if (me.guard > 0) me.guard--;
    if (me.swing > 0) me.swing--;
    if (me.hitstun > 0) {
      me.hitstun--;
      continue;
    }
    const mx = Math.sign(inp.mx);
    const my = Math.sign(inp.my);
    if (mx || my) {
      const n = mx && my ? Math.SQRT1_2 : 1;
      me.x += mx * n * me.speed;
      me.y += my * n * me.speed;
      me.fx = mx * n;
      me.fy = my * n;
      clampToArena(cfg, me);
    }
    if (inp.basic && me.basicCd === 0) useBasic(st, content, cfg, me, foe, ev);
    if (inp.special && me.specialCd === 0) useSpecial(st, content, cfg, me, ev);
  }

  // Corpos não se sobrepõem: empurra os dois igualmente.
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const minD = cfg.bodyRadius * 2;
  if (d < minD) {
    const nx = d > 0 ? dx / d : 1;
    const ny = d > 0 ? dy / d : 0;
    const push = (minD - d) / 2;
    a.x -= nx * push;
    a.y -= ny * push;
    b.x += nx * push;
    b.y += ny * push;
    clampToArena(cfg, a);
    clampToArena(cfg, b);
  }

  // Projéteis.
  const keep: Projectile[] = [];
  for (const p of st.projectiles) {
    p.x += p.vx;
    p.y += p.vy;
    p.travelled += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const target = st.fighters[p.owner === 0 ? 1 : 0];
    const tx = target.x - p.x;
    const ty = target.y - p.y;
    const r = cfg.bodyRadius + cfg.special.projectileRadius;
    if (target.hp > 0 && tx * tx + ty * ty <= r * r) {
      const owner = st.fighters[p.owner];
      const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy) || 1;
      dealDamage(st, content, cfg, owner, target, content.skills[p.skillId], p.vx / sp, p.vy / sp, cfg.special.knockbackPx, ev);
      continue;
    }
    const out = p.x < 0 || p.y < 0 || p.x > cfg.width || p.y > cfg.height;
    if (!out && p.travelled < cfg.special.rangePx) keep.push(p);
  }
  st.projectiles = keep;

  // Fim de luta: KO ou tempo esgotado (vence maior % de HP).
  if (a.hp === 0 || b.hp === 0) {
    st.outcome = a.hp === 0 && b.hp === 0 ? "draw" : a.hp === 0 ? "lose" : "win";
  } else if (st.tick >= cfg.timeLimitSec * cfg.simHz) {
    const pa = a.hp / a.maxHp;
    const pb = b.hp / b.maxHp;
    st.outcome = pa === pb ? "draw" : pa > pb ? "win" : "lose";
  }
  if (st.outcome) ev.push({ t: "end", outcome: st.outcome });
  return ev;
}

/**
 * IA simples e determinística para o lutador `idx`: aproxima até a distância do básico,
 * alterna strafe, mira o especial quando alinhado. Decide a cada `reactionMs` (não é onisciente a 30 Hz).
 */
export function aiInput(st: ArenaState, cfg: ArenaConfig, idx: 0 | 1 = 1): ArenaInput {
  const me = st.fighters[idx];
  const foe = st.fighters[idx === 0 ? 1 : 0];
  const dx = foe.x - me.x;
  const dy = foe.y - me.y;
  const d = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  const ai = st.ai[idx];
  if (st.tick >= ai.nextThinkTick) {
    ai.nextThinkTick = st.tick + msToTicks(cfg, cfg.ai.reactionMs);
    if (st.tick % msToTicks(cfg, cfg.ai.strafeEveryMs) < msToTicks(cfg, cfg.ai.reactionMs)) ai.strafe = nextFloat(st) < 0.5 ? -1 : 1;
    const lowHp = me.hp / me.maxHp < 0.35 && me.specialCd > 0;
    let vx: number;
    let vy: number;
    if (lowHp) {
      // Recua enquanto o especial recarrega.
      vx = -ux + -uy * ai.strafe * 0.7;
      vy = -uy + ux * ai.strafe * 0.7;
    } else if (d > cfg.ai.preferredRangePx + cfg.bodyRadius) {
      vx = ux + -uy * ai.strafe * 0.4;
      vy = uy + ux * ai.strafe * 0.4;
    } else {
      vx = -uy * ai.strafe * 0.5;
      vy = ux * ai.strafe * 0.5;
    }
    ai.mx = Math.abs(vx) > 0.38 ? Math.sign(vx) : 0;
    ai.my = Math.abs(vy) > 0.38 ? Math.sign(vy) : 0;
  }
  const facingDot = ux * me.fx + uy * me.fy;
  const inMelee = d <= cfg.basic.rangePx + cfg.bodyRadius && facingDot >= cfg.basic.arcDot;
  const wantsSpecial =
    me.specialCd === 0 &&
    (me.special.kind !== "damage" ? me.hp / me.maxHp < 0.6 : d <= cfg.ai.specialMaxRangePx && facingDot >= cfg.ai.aimToleranceDot);
  // Sem input de movimento a direção não muda: para mirar, a IA "vira" para o alvo dando um passo nele.
  const aiming = me.special.kind === "damage" && me.specialCd === 0 && d <= cfg.ai.specialMaxRangePx && facingDot < cfg.ai.aimToleranceDot;
  const closeIn = me.basicCd === 0 && d <= cfg.basic.rangePx + cfg.bodyRadius * 2 && !inMelee;
  if (aiming || closeIn) {
    return { mx: Math.abs(ux) > 0.38 ? Math.sign(ux) : 0, my: Math.abs(uy) > 0.38 ? Math.sign(uy) : 0, basic: false, special: false };
  }
  return { mx: ai.mx, my: ai.my, basic: inMelee, special: wantsSpecial };
}
