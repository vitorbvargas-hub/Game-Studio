// Estado VISUAL por entidade (WORLD_COMBAT_VISUAL_SPEC.md §1, §4). Recebe snapshots + eventos confirmados e decide
// QUANDO mostrar cada coisa. Nunca escreve na sim. Sem Canvas: testável em Node.
//
// Regra de sincronia (§4): o `damage` é enfileirado e exibido em max(chegada, início do ataque + hitAtMs).
// Números, mudança de HP, HURT e DEFEAT só aparecem a partir do evento confirmado.

import type { CreatureManifest } from "../assets/creatures";
import { loadMoveContent, type MoveContent } from "../sim/moves";
import { PX_PER_SUB } from "../sim/params";
import type { Dir8, EntityKind, EntitySnapshot, LogicState, Vec, WorldEvent } from "../sim/types";
import vfxTable from "../data/world-vfx.json";
import { castEnd, castTiming, moveVfx, type Cast } from "./vfx/engine";
import { DAMAGE_GRACE_MS, DEFEAT_FADE_MS, HIT_STOP_MS, HURT_FLASH_MS, HURT_VIS_MS, KNOCKBACK_CRIT_PX, KNOCKBACK_PX } from "./anim";

export const HP_ANIM_MS = 150;
export const HP_GHOST_MS = 400;
export const BAR_AFTER_HIT_MS = 3000;
export const EXCLAIM_MS = 400;
/** Número de dano: sobe em arco e some (fade nos últimos ~35%). */
export const FLOATER_MS = 700;
export const REWARD_FLOATER_MS = 900;
/** Vida dos efeitos de impacto (partículas, faíscas, anel). */
export const HIT_FX_MS = 450;
/** Tremida de câmera no crítico. */
export const SHAKE_MS = 180;
export const SHAKE_PX = 2;

/** Level up no mapa: brilho dourado + "Nível X!" sobre a parceira. */
export const LEVEL_UP_FX_MS = 900;

// Digivolução no mapa (estilo anime): carga de luz → silhuetas brancas alternando antiga/nova cada vez mais rápido →
// clarão → forma nova revelada com o nome. Tempos relativos ao início (evo.start).
/** Espera depois do level up exibido, quando a evolução veio na mesma vitória. */
export const EVO_LEAD_MS = 650;
/** O "Nível X!" sai um pouco depois do "+N XP" da mesma vitória (os dois ficam sobre a parceira). */
export const LEVEL_UP_DELAY_MS = 350;
export const EVO_CHARGE_MS = 500;
export const EVO_SWAP_END_MS = 1850;
/** Clarão: a forma nova aparece aqui. */
export const EVO_FLASH_MS = 2000;
export const EVO_TOTAL_MS = 2700;
/** Faixa "X digivolveu para Y!" depois do clarão. */
export const EVO_BANNER_MS = 3200;
/** Trocas de silhueta durante a alternância (par = forma antiga). */
export const EVO_SWAPS = 16;

export interface EvoFx {
  start: number;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  /** A forma nova já foi revelada (speciesId/name da entidade visual trocados). */
  revealed: boolean;
  mine: boolean;
}

export type EvoPhase = "wait" | "charge" | "swap" | "flash" | "reveal" | "done";

export interface EvoFrame {
  phase: EvoPhase;
  /** ms desde o início. */
  t: number;
  /** Qual forma desenhar agora. */
  show: "from" | "to";
  /** 0..1: quanto do sprite vira silhueta branca (1 = só a silhueta). */
  white: number;
  /** 0..1: força da luz em volta (anel, coluna e partículas). */
  aura: number;
  /** 0..1: clarão (explosão de luz) — 0 fora dele. */
  flash: number;
}

/** Quadro da digivolução no instante `now` (puro: a view só desenha). */
export function evoFrame(evo: Pick<EvoFx, "start">, now: number): EvoFrame {
  const t = now - evo.start;
  if (t < 0) return { phase: "wait", t, show: "from", white: 0, aura: 0, flash: 0 };
  if (t < EVO_CHARGE_MS) {
    const k = t / EVO_CHARGE_MS;
    return { phase: "charge", t, show: "from", white: Math.min(1, k * 1.25), aura: k, flash: 0 };
  }
  if (t < EVO_SWAP_END_MS) {
    // Alternância acelerando: trocas ~ u² (lentas no começo, rápidas no fim).
    const u = (t - EVO_CHARGE_MS) / (EVO_SWAP_END_MS - EVO_CHARGE_MS);
    const n = Math.floor(EVO_SWAPS * (0.35 * u + 0.65 * u * u));
    return { phase: "swap", t, show: n % 2 ? "to" : "from", white: 1, aura: 1, flash: 0 };
  }
  if (t < EVO_FLASH_MS) return { phase: "swap", t, show: "to", white: 1, aura: 1, flash: (t - EVO_SWAP_END_MS) / (EVO_FLASH_MS - EVO_SWAP_END_MS) };
  if (t < EVO_FLASH_MS + 220) return { phase: "flash", t, show: "to", white: 1, aura: 1, flash: 1 - (t - EVO_FLASH_MS) / 220 };
  if (t < EVO_TOTAL_MS) {
    const k = (t - EVO_FLASH_MS - 220) / (EVO_TOTAL_MS - EVO_FLASH_MS - 220);
    return { phase: "reveal", t, show: "to", white: Math.max(0, 1 - k * 1.4), aura: 1 - k, flash: 0 };
  }
  return { phase: "done", t, show: "to", white: 0, aura: 0, flash: 0 };
}

// Troca de Digimon no mapa (feedback 1, item 7): quem sai vira silhueta branca e recua até o Tamer num
// feixe de luz (some no fim); quem entra aparece no mesmo lugar como silhueta que se revela, com o estouro de impacto do seu
// elemento (fx.drawImpact) e um anel no chão.
export const SWAP_RECALL_MS = 420;
export const SWAP_ENTER_MS = 520;
export const SWAP_TOTAL_MS = SWAP_RECALL_MS + SWAP_ENTER_MS;

export interface SwapFx {
  start: number;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  /** Posição (px) do Tamer na troca: o que sai recua até ela. */
  tamerAt: Vec;
  /** A forma nova já foi revelada (speciesId/name trocados). */
  revealed: boolean;
}

export interface SwapFrame {
  phase: "recall" | "enter" | "done";
  /** 0..1 dentro da fase. */
  k: number;
  show: "from" | "to";
  white: number;
  /** 0..1: quanto do caminho até o Tamer o que sai já andou. */
  pull: number;
  /** Opacidade do sprite (o que sai some no fim do recuo). */
  alpha: number;
}

/** Quadro da troca no instante `now` (puro). */
export function swapFrame(fx: Pick<SwapFx, "start">, now: number): SwapFrame {
  const t = now - fx.start;
  if (t < 0) return { phase: "recall", k: 0, show: "from", white: 0, pull: 0, alpha: 1 };
  if (t < SWAP_RECALL_MS) {
    const k = t / SWAP_RECALL_MS;
    return { phase: "recall", k, show: "from", white: Math.min(1, k * 2.2), pull: k * k, alpha: k < 0.55 ? 1 : Math.max(0, 1 - (k - 0.55) / 0.45) };
  }
  if (t < SWAP_TOTAL_MS) {
    const k = (t - SWAP_RECALL_MS) / SWAP_ENTER_MS;
    return { phase: "enter", k, show: "to", white: Math.max(0, 1 - k * 1.6), pull: 0, alpha: Math.min(1, 0.35 + k * 2) };
  }
  return { phase: "done", k: 1, show: "to", white: 0, pull: 0, alpha: 1 };
}

export type VfxElement = "fire" | "frost" | "wind" | "light" | "bubble" | "spark";

const VFX = vfxTable as { basicSkillId: string; default: VfxElement; species: Record<string, VfxElement> };

export function elementOf(speciesId: string | undefined): VfxElement {
  return (speciesId && VFX.species[speciesId]) || VFX.default;
}

export function isSpecialSkill(skillId: string): boolean {
  return skillId !== VFX.basicSkillId;
}

let cachedMoves: MoveContent | undefined;
function defaultMoves(): MoveContent {
  return (cachedMoves ??= loadMoveContent());
}

export interface VisualEntity {
  id: string;
  kind: EntityKind;
  speciesId?: string;
  ownerId?: string;
  name: string;
  level: number;
  prev: Vec;
  cur: Vec;
  facing: Dir8;
  logicState: LogicState;
  /** Último estado "de locomoção" (para HURT/DEFEAT lógicos ainda não exibidos). */
  baseState: LogicState;
  encounterId?: string;
  targetId?: string;
  maxHp: number;
  hpFrom: number;
  hpTo: number;
  hpAnimStart: number;
  ghostHp: number;
  ghostUntil: number;
  barUntil: number;
  attack?: {
    start: number;
    hitAtMs: number;
    durationMs: number;
    targetId: string;
    dir: Vec;
    seq: number;
    procedural: boolean;
    special: boolean;
    /** Golpe especial: instante (relativo a start) em que o projétil sai. */
    launchAtMs?: number;
    /** Distância até o alvo no início (px), para limitar o avanço. */
    gap: number;
  };
  hurt?: { start: number; dir: Vec; px: number };
  /** Hit-stop: entre start e until a entidade congela (animação e deslocamento). */
  hitStop?: { start: number; until: number };
  flashUntil: number;
  attackFlashAt: number;
  defeatedAt?: number;
  removeAt?: number;
  exclaimUntil: number;
  /** Desfase da respiração (idle) para não ficarem em uníssono. */
  phase: number;
  /** Instante do level up exibido (brilho dourado). */
  lvUpAt?: number;
  /** Digivolução em andamento (a entidade mostra a forma antiga até o clarão). */
  evo?: EvoFx;
  /** Troca de Digimon em andamento (a forma que sai fica na tela até o fim do recuo). */
  swap?: SwapFx;
}

export interface Floater {
  text: string;
  x: number;
  y: number;
  start: number;
  durationMs: number;
  color: string;
  big: boolean;
  /** Números de terceiros: menores e com alpha 70% (§7). */
  thirdParty: boolean;
  targetId?: string;
  /** Deriva lateral do arco (−1, 0, +1). */
  drift: number;
}

export interface HitFx {
  targetId: string;
  attackerId?: string;
  start: number;
  seq: number;
  crit: boolean;
  special: boolean;
  element: VfxElement;
  /** Direção do golpe (atacante → alvo), unitária. */
  dir: Vec;
}

/** Projétil genérico (legado da v2; os golpes usam Cast + arquétipo). Mantido para fx.ts. */
export interface Projectile {
  seq: number;
  attackerId: string;
  targetId: string;
  element: VfxElement;
  launchAt: number;
  arriveAt: number;
  from: Vec;
  to: Vec;
}

export interface Shake {
  start: number;
  seq: number;
  /** Amplitude (px); padrão SHAKE_PX. */
  amp?: number;
}


export interface ShownDamage {
  seq: number;
  targetId: string;
  amount: number;
  kind: "damage" | "heal" | "miss";
  crit: boolean;
  at: number;
}

type Pending =
  | { at: number; kind: "damage"; ev: Extract<WorldEvent, { t: "damage" }> }
  | { at: number; kind: "defeat"; ev: Extract<WorldEvent, { t: "defeat" }> }
  | { at: number; kind: "reward"; ev: Extract<WorldEvent, { t: "reward" }> }
  | { at: number; kind: "level_up"; ev: Extract<WorldEvent, { t: "level_up" }> }
  | { at: number; kind: "capture"; ev: Extract<WorldEvent, { t: "capture" }> }
  | { at: number; kind: "status"; ev: Extract<WorldEvent, { t: "status" }> };

export type ManifestLookup = (speciesId: string | undefined) => CreatureManifest | undefined;

const toPx = (s: { x: number; y: number }): Vec => ({ x: s.x * PX_PER_SUB, y: s.y * PX_PER_SUB });

function unit(dx: number, dy: number): Vec {
  const d = Math.sqrt(dx * dx + dy * dy);
  return d > 0 ? { x: dx / d, y: dy / d } : { x: 0, y: 0 };
}

export class Presenter {
  readonly entities = new Map<string, VisualEntity>();
  floaters: Floater[] = [];
  hitFx: HitFx[] = [];
  /** Golpes em andamento (VFX por arquétipo), criados no attack_start confirmado. */
  casts: Cast[] = [];
  shakes: Shake[] = [];
  private fired = new Set<number>();
  /** Histórico do que foi exibido como dano (para testes e QA). */
  readonly shown: ShownDamage[] = [];
  private pending: Pending[] = [];
  /** seq → instante do impacto do ataque correspondente. */
  private hitTimeBySeq = new Map<number, number>();
  /** alvo → último instante agendado de dano (DEFEAT vem depois dele). */
  private lastDamageAt = new Map<string, number>();
  private phaseSeed = 0;
  /** Entidade → instante em que o último "Nível X!" aparece (a digivolução espera por ele). */
  private lvUpShowAt = new Map<string, number>();

  constructor(
    private readonly manifestOf: ManifestLookup,
    readonly localPlayerId: string,
    readonly moves: MoveContent = defaultMoves(),
  ) {}

  get localPartnerId(): string {
    return `${this.localPlayerId}:partner`;
  }

  /** Um tick da sim chegou: novos snapshots + eventos confirmados, recebidos em `now` (ms). */
  onTick(snaps: EntitySnapshot[], events: WorldEvent[], now: number): void {
    for (const ev of events) if (ev.t === "spawn") this.spawn(ev.entity, now);
    const seen = new Set<string>();
    const prevNames = new Map<string, string>();
    for (const s of snaps) {
      seen.add(s.id);
      let v = this.entities.get(s.id);
      if (!v) v = this.spawn(s, now);
      v.prev = v.cur;
      v.cur = toPx(s);
      v.facing = s.facing;
      v.logicState = s.state;
      // Durante a digivolução a forma antiga fica na tela até o clarão (update() troca).
      if (s.speciesId !== v.speciesId && !(v.evo && !v.evo.revealed) && !(v.swap && !v.swap.revealed)) {
        prevNames.set(v.id, v.name);
        v.speciesId = s.speciesId;
        v.name = s.name;
      }
      if (s.state !== "HURT" && s.state !== "DEFEAT" && s.state !== "ATTACK") v.baseState = s.state;
      v.encounterId = s.encounterId;
      v.targetId = s.targetId;
      v.maxHp = s.maxHp;
      v.level = s.level;
      // HP fora de combate (regeneração) sobe direto; quedas só via evento `damage`.
      if (s.hp > v.hpTo && !this.pending.some((p) => p.kind === "damage" && p.ev.targetId === s.id)) v.hpTo = v.hpFrom = s.hp;
    }
    let tickMax = now;
    for (const ev of events) {
      switch (ev.t) {
        case "engage": {
          const a = this.entities.get(ev.attackerId);
          if (a && a.kind !== "wild") a.exclaimUntil = now + EXCLAIM_MS;
          break;
        }
        case "attack_start": {
          const a = this.entities.get(ev.attackerId);
          const t = this.entities.get(ev.targetId);
          const move = this.moves.moves[ev.skillId];
          const p = moveVfx(move);
          const archetype = move?.vfx ?? "tackle_impact";
          const self = !!move && (move.target === "self" || move.type === "buff" || move.type === "heal");
          const timing = castTiming(this.manifestOf(a?.speciesId), p);
          const special = timing.launchAtMs !== undefined;
          this.hitTimeBySeq.set(ev.seq, now + timing.hitAtMs);
          if (a) {
            const gap = t ? Math.hypot(t.cur.x - a.cur.x, t.cur.y - a.cur.y) : 0;
            a.attack = {
              start: now,
              ...timing,
              special,
              gap,
              targetId: ev.targetId,
              seq: ev.seq,
              dir: t && !self ? unit(t.cur.x - a.cur.x, t.cur.y - a.cur.y) : { x: 0, y: 0 },
            };
            const at = ev.at ? toPx(ev.at) : self ? { ...a.cur } : t ? { ...t.cur } : { ...a.cur };
            const cast: Cast = {
              seq: ev.seq,
              moveId: ev.skillId,
              archetype,
              params: p,
              attackerId: a.id,
              targetId: ev.targetId,
              targetIds: ev.targetIds ?? [self ? a.id : ev.targetId],
              at,
              from: { ...a.cur },
              to: t ? { ...t.cur } : { ...at },
              self,
              radius: Math.max(6, (move?.radius ?? 8) * PX_PER_SUB),
              start: now,
              launchAt: now + (timing.launchAtMs ?? timing.hitAtMs),
              hitAt: now + timing.hitAtMs,
              end: 0,
              mine: this.isMine(a.id),
            };
            cast.end = castEnd(cast);
            this.casts.push(cast);
          }
          break;
        }
        case "status":
          this.pending.push({ at: Math.max(now, this.hitTimeBySeq.get(ev.seq) ?? now), kind: "status", ev });
          break;
        case "partner_swap": {
          const v = this.entities.get(ev.id);
          if (v) {
            const toName = this.manifestOf(ev.to)?.name ?? v.name;
            const fromName = this.manifestOf(ev.out.speciesId)?.name ?? ev.out.speciesId;
            v.swap = { start: now, from: ev.out.speciesId, to: ev.to, fromName, toName, tamerAt: toPx(ev.tamerAt), revealed: false };
            v.speciesId = ev.out.speciesId;
            v.name = fromName;
            v.evo = undefined;
          }
          break;
        }
        case "evolve": {
          const v = this.entities.get(ev.id);
          if (v) {
            // Veio logo depois de um level up (mesma vitória): espera o golpe final, o "+XP" e o "Nível X!" aparecerem.
            const lu = this.lvUpShowAt.get(ev.id);
            const start = lu !== undefined && lu + EVO_LEAD_MS > now ? lu + EVO_LEAD_MS : now;
            const toName = v.speciesId === ev.to ? v.name : this.manifestOf(ev.to)?.name ?? v.name;
            const fromName = prevNames.get(v.id) ?? v.evo?.toName ?? v.name;
            v.evo = { start, from: ev.from, to: ev.to, fromName, toName, revealed: false, mine: this.isMine(v.id) };
            v.speciesId = ev.from;
            v.name = fromName;
          }
          break;
        }
        case "damage": {
          const at = Math.max(now, this.hitTimeBySeq.get(ev.seq) ?? now);
          this.hitTimeBySeq.delete(ev.seq);
          this.lastDamageAt.set(ev.targetId, at);
          this.pending.push({ at, kind: "damage", ev });
          tickMax = Math.max(tickMax, at);
          break;
        }
        case "defeat": {
          const at = Math.max(now, this.lastDamageAt.get(ev.id) ?? now);
          this.pending.push({ at, kind: "defeat", ev });
          tickMax = Math.max(tickMax, at);
          break;
        }
        case "reward":
        case "level_up":
        case "capture":
          this.pending.push({ at: ev.t === "level_up" ? tickMax + LEVEL_UP_DELAY_MS : tickMax, kind: ev.t, ev } as Pending);
          if (ev.t === "level_up") this.lvUpShowAt.set(ev.id, tickMax + LEVEL_UP_DELAY_MS);
          break;
        case "despawn": {
          const v = this.entities.get(ev.id);
          if (v) v.removeAt = Math.max(now, (v.defeatedAt ?? this.lastDamageAt.get(ev.id) ?? now) + DEFEAT_FADE_MS);
          break;
        }
        default:
          break;
      }
    }
    for (const id of [...this.entities.keys()]) if (!seen.has(id) && this.entities.get(id)!.removeAt === undefined) this.entities.get(id)!.removeAt = now;
  }

  private spawn(s: EntitySnapshot, now: number): VisualEntity {
    const p = toPx(s);
    const v: VisualEntity = {
      id: s.id,
      kind: s.kind,
      speciesId: s.speciesId,
      ownerId: s.ownerId,
      name: s.name,
      level: s.level,
      prev: p,
      cur: p,
      facing: s.facing,
      logicState: s.state,
      baseState: s.state,
      maxHp: s.maxHp,
      hpFrom: s.hp,
      hpTo: s.hp,
      hpAnimStart: now,
      ghostHp: s.hp,
      ghostUntil: 0,
      barUntil: 0,
      flashUntil: 0,
      attackFlashAt: 0,
      exclaimUntil: 0,
      phase: (this.phaseSeed++ * 397) % 1000,
    };
    this.entities.set(s.id, v);
    return v;
  }

  /** Avança o tempo visual: libera eventos vencidos e limpa efeitos expirados. */
  update(now: number): void {
    const due = this.pending.filter((p) => p.at <= now).sort((a, b) => a.at - b.at);
    this.pending = this.pending.filter((p) => p.at > now);
    for (const p of due) this.release(p, p.at);
    for (const v of this.entities.values()) {
      if (v.evo && !v.evo.revealed && now >= v.evo.start + EVO_FLASH_MS) {
        v.evo.revealed = true;
        v.speciesId = v.evo.to;
        v.name = v.evo.toName;
      }
      if (v.evo?.revealed && now >= v.evo.start + EVO_FLASH_MS + EVO_BANNER_MS) v.evo = undefined;
      if (v.swap && !v.swap.revealed && now >= v.swap.start + SWAP_RECALL_MS) {
        v.swap.revealed = true;
        v.speciesId = v.swap.to;
        v.name = v.swap.toName;
      }
      if (v.swap?.revealed && now >= v.swap.start + SWAP_TOTAL_MS) v.swap = undefined;
      if (v.lvUpAt !== undefined && now > v.lvUpAt + LEVEL_UP_FX_MS) v.lvUpAt = undefined;
      if (v.attack && now > v.attack.start + Math.max(v.attack.durationMs, v.attack.hitAtMs + DAMAGE_GRACE_MS)) v.attack = undefined;
      if (v.hurt && now > v.hurt.start + HURT_VIS_MS) v.hurt = undefined;
      if (v.hitStop && now > v.hitStop.until) v.hitStop = undefined;
      if (v.removeAt !== undefined && now >= v.removeAt) this.entities.delete(v.id);
    }
    this.floaters = this.floaters.filter((f) => now < f.start + f.durationMs);
    this.hitFx = this.hitFx.filter((f) => now < f.start + HIT_FX_MS);
    // Tremida e clarão do arquétipo: uma vez por golpe, no impacto exibido, só nos golpes do jogador local.
    for (const c of this.casts) {
      if (now < c.hitAt || this.fired.has(c.seq)) continue;
      this.fired.add(c.seq);
      if (!c.mine) continue;
      // Tremida só onde o arquétipo define (≤ 2 px, §4); o clarão é local ao alvo e fica no motor de VFX.
      if (c.params.shake) this.shakes.push({ start: c.hitAt, seq: c.seq, amp: c.params.shake.amp });
    }
    this.casts = this.casts.filter((c) => now < c.end);
    if (this.fired.size > 256) for (const s of [...this.fired]) if (!this.casts.some((c) => c.seq === s)) this.fired.delete(s);
    this.shakes = this.shakes.filter((s) => now < s.start + SHAKE_MS);
  }


  /** Tempo de animação da entidade descontando o hit-stop (o relógio dela para durante o congelamento). */
  localTime(v: VisualEntity, now: number): number {
    const hs = v.hitStop;
    if (!hs || now < hs.start) return now;
    return now >= hs.until ? now - (hs.until - hs.start) : hs.start;
  }

  private isMine(id: string | undefined): boolean {
    if (!id) return false;
    const v = this.entities.get(id);
    return id === this.localPlayerId || v?.ownerId === this.localPlayerId;
  }

  private release(p: Pending, at: number): void {
    if (p.kind === "damage") {
      const ev = p.ev;
      const t = this.entities.get(ev.targetId);
      this.shown.push({ seq: ev.seq, targetId: ev.targetId, amount: ev.amount, kind: ev.kind, crit: ev.crit, at });
      if (!t) return;
      const third = !this.isMine(ev.targetId) && !this.isMine(ev.attackerId);
      const a = this.entities.get(ev.attackerId);
      if (a?.attack?.seq === ev.seq) a.attackFlashAt = at;
      if (ev.kind === "miss") {
        this.floaters.push({ text: "MISS", x: t.cur.x, y: t.cur.y, start: at, durationMs: FLOATER_MS, color: "#c0cbdc", big: false, thirdParty: third, drift: 0 });
        return;
      }
      const before = this.hpNow(t, at);
      t.hpFrom = before;
      t.hpTo = ev.hpAfter;
      t.hpAnimStart = at;
      t.ghostHp = Math.max(t.ghostHp > before && at < t.ghostUntil ? t.ghostHp : before, before);
      t.ghostUntil = at + HP_GHOST_MS;
      t.barUntil = at + BAR_AFTER_HIT_MS;
      const heal = ev.kind === "heal";
      const spread = this.spread(ev.targetId, at);
      const dir = a ? unit(t.cur.x - a.cur.x, t.cur.y - a.cur.y) : { x: 0, y: 0 };
      this.floaters.push({
        text: `${heal ? "+" : "-"}${ev.amount}`,
        x: t.cur.x + spread,
        y: t.cur.y,
        start: at,
        durationMs: FLOATER_MS,
        color: heal ? "#63c74d" : ev.crit ? "#fee761" : "#ffffff",
        big: ev.crit,
        thirdParty: third,
        targetId: t.id,
        drift: spread !== 0 ? Math.sign(spread) : dir.x >= 0 ? 1 : -1,
      });
      if (!heal) {
        const special = !!a?.attack && a.attack.seq === ev.seq && a.attack.special;
        this.hitFx.push({ targetId: t.id, attackerId: a?.id, start: at, seq: ev.seq, crit: ev.crit, special, element: special ? elementOf(a?.speciesId) : "spark", dir });
        t.flashUntil = at + HURT_FLASH_MS;
        // Hit-stop: alvo e atacante congelam juntos no impacto.
        t.hitStop = { start: at, until: at + HIT_STOP_MS };
        if (a && a.attack?.seq === ev.seq) a.hitStop = { start: at, until: at + HIT_STOP_MS };
        if (ev.hpAfter > 0) t.hurt = { start: at, dir, px: ev.crit ? KNOCKBACK_CRIT_PX : KNOCKBACK_PX };
        if (ev.crit && !third) this.shakes.push({ start: at, seq: ev.seq });
      }
      return;
    }
    if (p.kind === "status") {
      const ev = p.ev;
      const t = this.entities.get(ev.id);
      if (!t) return;
      const label = { atk: "ATQ", def: "DEF", spd: "VEL" }[ev.stat];
      const up = ev.mult >= 1;
      this.floaters.push({
        text: `${label}${up ? "↑" : "↓"}`,
        x: t.cur.x,
        y: t.cur.y,
        start: at,
        durationMs: REWARD_FLOATER_MS,
        color: up ? "#fee761" : "#c87ae0",
        big: false,
        thirdParty: !this.isMine(ev.id) && !this.isMine(ev.sourceId),
        targetId: t.id,
        drift: 0,
      });
      return;
    }
    if (p.kind === "defeat") {
      const t = this.entities.get(p.ev.id);
      if (t) {
        t.defeatedAt = at;
        t.hpFrom = t.hpTo = 0;
        t.hurt = undefined;
      }
      return;
    }
    const mine = p.ev.t === "level_up" ? this.isMine(p.ev.id) : this.isMine(p.ev.ownerId);
    if (p.kind === "reward") {
      const ev = p.ev;
      // "+N XP" sobe da parceira que ganhou (sem parceira na tela: no lugar da vitória).
      const pv = this.entities.get(ev.partnerId);
      if (pv) this.floaters.push({ text: `+${ev.xp} XP`, x: pv.cur.x, y: pv.cur.y, start: at, durationMs: REWARD_FLOATER_MS * 1.3, color: "#2ce8f5", big: false, thirdParty: !mine, targetId: pv.id, drift: 0 });
      else this.floaters.push({ text: `+${ev.xp} XP`, x: ev.at.x * PX_PER_SUB, y: ev.at.y * PX_PER_SUB - 10, start: at, durationMs: REWARD_FLOATER_MS, color: "#2ce8f5", big: false, thirdParty: !mine, drift: 0 });
    } else if (p.kind === "level_up") {
      const v = this.entities.get(p.ev.id);
      if (v) {
        v.lvUpAt = at;
        // O "+N XP" da mesma vitória ainda está no ar: some em 150 ms (encurta a vida para o fade já começar).
        for (const f of this.floaters)
          if (f.targetId === v.id && f.text.endsWith(" XP") && at > f.start && at < f.start + f.durationMs) f.durationMs = Math.min(f.durationMs, Math.max((at - f.start) / 0.7, at - f.start + 150));
        this.floaters.push({ text: `Nível ${p.ev.level}!`, x: v.cur.x, y: v.cur.y - 6, start: at, durationMs: REWARD_FLOATER_MS * 1.4, color: "#fee761", big: mine, thirdParty: !mine, targetId: v.id, drift: 0 });
      }
    }
  }

  /** Espalha números simultâneos no mesmo alvo em −10/0/+10 px. */
  private spread(targetId: string, at: number): number {
    const same = this.floaters.filter((f) => f.targetId === targetId && f.start > at - 120).length;
    return [0, -10, 10][same % 3];
  }

  hpNow(v: VisualEntity, now: number): number {
    const k = Math.min(1, Math.max(0, (now - v.hpAnimStart) / HP_ANIM_MS));
    return v.hpFrom + (v.hpTo - v.hpFrom) * k;
  }

  /** Estado que a VIEW deve animar agora (segue a lógica, mas só mostra HURT/DEFEAT confirmados). */
  visualState(v: VisualEntity, now: number): LogicState {
    if (v.defeatedAt !== undefined && now >= v.defeatedAt) return "DEFEAT";
    if (v.attack && now < v.attack.start + v.attack.durationMs) return "ATTACK";
    if (v.hurt && now < v.hurt.start + HURT_VIS_MS) return "HURT";
    if (v.logicState === "HURT" || v.logicState === "DEFEAT" || v.logicState === "ATTACK") return v.baseState;
    return v.logicState;
  }

  /** Posição interpolada (px do mundo) entre os dois últimos ticks. */
  renderPos(v: VisualEntity, alpha: number): Vec {
    return { x: v.prev.x + (v.cur.x - v.prev.x) * alpha, y: v.prev.y + (v.cur.y - v.prev.y) * alpha };
  }

  barVisible(v: VisualEntity, now: number): boolean {
    if (v.kind === "player" || v.kind === "remote_player" || v.kind === "npc") return false;
    if (v.defeatedAt !== undefined && now > v.defeatedAt + 1000) return false;
    return !!v.encounterId || v.id === this.localPartnerId || now < v.barUntil;
  }
}
