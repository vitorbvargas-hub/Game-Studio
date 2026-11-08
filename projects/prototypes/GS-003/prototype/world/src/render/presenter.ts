// Estado VISUAL por entidade (WORLD_COMBAT_VISUAL_SPEC.md §1, §4). Recebe snapshots + eventos confirmados e decide
// QUANDO mostrar cada coisa. Nunca escreve na sim. Sem Canvas: testável em Node.
//
// Regra de sincronia (§4): o `damage` é enfileirado e exibido em max(chegada, início do ataque + hitAtMs).
// Números, mudança de HP, HURT e DEFEAT só aparecem a partir do evento confirmado.

import type { CreatureManifest } from "../assets/creatures";
import { PX_PER_SUB } from "../sim/params";
import type { Dir8, EntityKind, EntitySnapshot, LogicState, Vec, WorldEvent } from "../sim/types";
import { attackTiming, DAMAGE_GRACE_MS, DEFEAT_FADE_MS, HURT_FLASH_MS, HURT_VIS_MS } from "./anim";

export const HP_ANIM_MS = 150;
export const HP_GHOST_MS = 400;
export const BAR_AFTER_HIT_MS = 3000;
export const EXCLAIM_MS = 400;
export const FLOATER_MS = 400;
export const REWARD_FLOATER_MS = 900;
export const HIT_FX_MS = 250;

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
  attack?: { start: number; hitAtMs: number; durationMs: number; targetId: string; dir: Vec; seq: number; procedural: boolean };
  hurt?: { start: number; dir: Vec };
  flashUntil: number;
  attackFlashAt: number;
  defeatedAt?: number;
  removeAt?: number;
  exclaimUntil: number;
  /** Desfase da respiração (idle) para não ficarem em uníssono. */
  phase: number;
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
}

export interface HitFx {
  targetId: string;
  start: number;
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
  | { at: number; kind: "capture"; ev: Extract<WorldEvent, { t: "capture" }> };

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
  /** Histórico do que foi exibido como dano (para testes e QA). */
  readonly shown: ShownDamage[] = [];
  private pending: Pending[] = [];
  /** seq → instante do impacto do ataque correspondente. */
  private hitTimeBySeq = new Map<number, number>();
  /** alvo → último instante agendado de dano (DEFEAT vem depois dele). */
  private lastDamageAt = new Map<string, number>();
  private phaseSeed = 0;

  constructor(
    private readonly manifestOf: ManifestLookup,
    readonly localPlayerId: string,
  ) {}

  get localPartnerId(): string {
    return `${this.localPlayerId}:partner`;
  }

  /** Um tick da sim chegou: novos snapshots + eventos confirmados, recebidos em `now` (ms). */
  onTick(snaps: EntitySnapshot[], events: WorldEvent[], now: number): void {
    for (const ev of events) if (ev.t === "spawn") this.spawn(ev.entity, now);
    const seen = new Set<string>();
    for (const s of snaps) {
      seen.add(s.id);
      let v = this.entities.get(s.id);
      if (!v) v = this.spawn(s, now);
      v.prev = v.cur;
      v.cur = toPx(s);
      v.facing = s.facing;
      v.logicState = s.state;
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
          const timing = attackTiming(this.manifestOf(a?.speciesId));
          this.hitTimeBySeq.set(ev.seq, now + timing.hitAtMs);
          if (a)
            a.attack = {
              start: now,
              ...timing,
              targetId: ev.targetId,
              seq: ev.seq,
              dir: t ? unit(t.cur.x - a.cur.x, t.cur.y - a.cur.y) : { x: 0, y: 0 },
            };
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
          this.pending.push({ at: tickMax, kind: ev.t, ev } as Pending);
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
      if (v.attack && now > v.attack.start + Math.max(v.attack.durationMs, v.attack.hitAtMs + DAMAGE_GRACE_MS)) v.attack = undefined;
      if (v.hurt && now > v.hurt.start + HURT_VIS_MS) v.hurt = undefined;
      if (v.removeAt !== undefined && now >= v.removeAt) this.entities.delete(v.id);
    }
    this.floaters = this.floaters.filter((f) => now < f.start + f.durationMs);
    this.hitFx = this.hitFx.filter((f) => now < f.start + HIT_FX_MS);
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
        this.floaters.push({ text: "MISS", x: t.cur.x, y: t.cur.y, start: at, durationMs: FLOATER_MS, color: "#c0cbdc", big: false, thirdParty: third });
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
      this.floaters.push({
        text: `${heal ? "+" : "-"}${ev.amount}`,
        x: t.cur.x + this.spread(ev.targetId, at),
        y: t.cur.y,
        start: at,
        durationMs: FLOATER_MS,
        color: heal ? "#63c74d" : ev.crit ? "#fee761" : "#ffffff",
        big: ev.crit,
        thirdParty: third,
        targetId: t.id,
      });
      if (!heal) {
        this.hitFx.push({ targetId: t.id, start: at });
        t.flashUntil = at + HURT_FLASH_MS;
        if (ev.hpAfter > 0) t.hurt = { start: at, dir: a ? unit(t.cur.x - a.cur.x, t.cur.y - a.cur.y) : { x: 0, y: 0 } };
      }
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
      this.floaters.push({ text: `+${ev.xp} XP`, x: ev.at.x * PX_PER_SUB, y: ev.at.y * PX_PER_SUB - 10, start: at, durationMs: REWARD_FLOATER_MS, color: "#2ce8f5", big: false, thirdParty: !mine });
    } else if (p.kind === "level_up") {
      const v = this.entities.get(p.ev.id);
      if (v) this.floaters.push({ text: "LV UP", x: v.cur.x, y: v.cur.y - 16, start: at, durationMs: REWARD_FLOATER_MS, color: "#fee761", big: true, thirdParty: !mine });
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
