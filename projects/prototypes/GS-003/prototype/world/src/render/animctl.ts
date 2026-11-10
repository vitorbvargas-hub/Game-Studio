// Controlador de animação v2 (?anim=v2, fase 2 do Quality Overhaul). SÓ apresentação: lê o estado visual que o
// Presenter já calcula (e a velocidade/direção da mola visual) e decide QUAL animação, QUAL quadro e QUAL efeito
// procedural mostrar. Não muda a sim, o dano nem o tempo do impacto (o hitAtMs continua vindo de attackTiming).
//
// Estados: idle, walk, run, turn, attack (anticipation → action → impact → recovery), skill, hurt, victory, defeat,
// follow, interact. One-shots (turn, attack, skill, hurt, victory, interact) terminam e VOLTAM ao estado anterior
// de locomoção. Prioridade: defeat > hurt > skill/attack > victory > interact > turn > run > follow/walk > idle.
//
// Animação por estado: lista de candidatos lida do creature.json (`combatStates`, depois nomes padrão). Sem arte,
// cai no fallback documentado (FALLBACK) com efeito procedural escolhido pela anatomia (`anatomy` no creature.json:
// biped | quadruped | flyer | blob; ausente = biped).

import type { CreatureAnimation, CreatureManifest } from "../assets/creatures";
import type { LogicState } from "../sim/types";
import { ANTICIPATION_FRAC, HIT_STOP_MS, animDurationMs, frameAt, realAnim, type Dir4 } from "./anim";
import { walkFrameIndex } from "./motion";

export type AnimState = "idle" | "walk" | "run" | "turn" | "attack" | "skill" | "hurt" | "victory" | "defeat" | "follow" | "interact";
export type AttackPhase = "anticipation" | "action" | "impact" | "recovery";
export type Anatomy = "biped" | "quadruped" | "flyer" | "blob";

/** Velocidade (px/s) acima da qual a locomoção vira `run`: fração acima da velocidade de referência do walk. */
export const RUN_FACTOR = 1.35;
/** Duração do `turn` sem arte própria (ms). */
export const TURN_MS = 110;
export const VICTORY_MS = 900;
export const INTERACT_MS = 520;
/** Volta ao repouso: depois de um one-shot, segura o 1º quadro do idle este tempo antes do loop. */
export const SETTLE_MS = 90;

/** Candidatos de arte por estado, em ordem. O primeiro que existir no creature.json vence. */
export const WANTED_V2: Record<AnimState, string[]> = {
  idle: ["idle"],
  walk: ["walk"],
  run: ["run", "walk"],
  turn: ["turn"],
  attack: ["attack"],
  skill: ["skill", "attack"],
  hurt: ["hurt"],
  victory: ["victory"],
  defeat: ["defeat", "hurt"],
  follow: ["follow", "walk"],
  interact: ["interact"],
};

/** Estado lógico do Presenter que fornece o `combatStates[...]` do manifest. */
const COMBAT_KEY: Partial<Record<AnimState, LogicState>> = { attack: "ATTACK", skill: "ATTACK", hurt: "HURT", defeat: "DEFEAT" };

/**
 * Efeito procedural quando a arte do estado não existe (documentado em PHASE2_DEV.md):
 * - hop:    pulinhos (victory; blob/flyer também no walk sem quadros)
 * - dip:    afunda 1 px e volta (turn, interact)
 * - hover:  flutua ±1 px contínuo (flyer parado/andando)
 * - lean:   adianta 1 px na direção do movimento e quica a cada passo (run)
 * - lunge / knockback / fade: os do v1 (anim.ts), mantidos
 */
export type ProcV2 = "hop" | "dip" | "hover" | "lean" | "lunge" | "knockback" | "fade" | "bob" | null;

const FALLBACK: Record<AnimState, Record<Anatomy, ProcV2>> = {
  idle: { biped: "bob", quadruped: "bob", flyer: "hover", blob: "bob" },
  walk: { biped: "bob", quadruped: "bob", flyer: "hover", blob: "hop" },
  follow: { biped: "bob", quadruped: "bob", flyer: "hover", blob: "hop" },
  run: { biped: "lean", quadruped: "lean", flyer: "hover", blob: "hop" },
  turn: { biped: "dip", quadruped: "dip", flyer: "dip", blob: "dip" },
  attack: { biped: "lunge", quadruped: "lunge", flyer: "lunge", blob: "lunge" },
  skill: { biped: "lunge", quadruped: "lunge", flyer: "lunge", blob: "lunge" },
  hurt: { biped: "knockback", quadruped: "knockback", flyer: "knockback", blob: "knockback" },
  defeat: { biped: "fade", quadruped: "fade", flyer: "fade", blob: "fade" },
  victory: { biped: "hop", quadruped: "hop", flyer: "hop", blob: "hop" },
  interact: { biped: "dip", quadruped: "dip", flyer: "dip", blob: "dip" },
};

const ONE_SHOT: AnimState[] = ["turn", "attack", "skill", "hurt", "victory", "interact"];
const LOCO: AnimState[] = ["idle", "walk", "run", "follow"];

export function anatomyOf(m: CreatureManifest): Anatomy {
  const a = m.anatomy;
  return a === "quadruped" || a === "flyer" || a === "blob" ? a : "biped";
}

/** Animação de arte para o estado, ou undefined (→ fallback procedural sobre o idle). */
export function artFor(m: CreatureManifest, s: AnimState): { name: string; anim: CreatureAnimation } | undefined {
  const key = COMBAT_KEY[s];
  const cands = [key ? m.combatStates?.[key] : undefined, ...WANTED_V2[s]];
  for (const name of cands) {
    if (name === "idle" && s === "idle") return m.animations.idle ? { name, anim: m.animations.idle } : undefined;
    const a = realAnim(m, name);
    if (a) return { name: name!, anim: a };
  }
  return undefined;
}

/** O que a apresentação sabe desta entidade neste quadro (tudo derivado do Presenter e da mola visual). */
export interface CtlInput {
  now: number;
  /** Tempo local da entidade (p.localTime: congela no hit-stop). */
  lt: number;
  /** p.visualState(v, now). */
  visual: LogicState;
  speed: number;
  face: Dir4;
  walked: number;
  isPartner: boolean;
  attack?: { start: number; hitAtMs: number; durationMs: number; special: boolean; launchAtMs?: number; targetId: string };
  hurtStart?: number;
  /** Instante de derrota do último alvo atacado (dispara victory). */
  targetDefeatedAt?: number;
  /** Interação pedida (main → view.notifyInteract). */
  interactAt?: number;
}

export interface CtlState {
  state: AnimState;
  /** Início do estado atual (tempo local). */
  since: number;
  /** Estado de locomoção para onde os one-shots voltam. */
  prev: AnimState;
  face: Dir4;
  lastAttackTarget?: string;
  lastAttackStart?: number;
  victoryDoneFor?: number;
  interactDoneFor?: number;
  /** Fim do one-shot procedural (turn/victory/interact), em tempo local. */
  until?: number;
  /** Instante em que voltou ao repouso (para o SETTLE). */
  settledAt?: number;
  /** Transições já feitas (debug/testes): "walk>attack". */
  log: string[];
}

export function newCtl(face: Dir4 = "S", now = 0): CtlState {
  return { state: "idle", since: now, prev: "idle", face, log: [] };
}

function locomotion(i: CtlInput, m: CreatureManifest): AnimState {
  const moving = i.speed > 10;
  if (!moving) return "idle";
  const ref = m.walkSpeedPxPerSec ?? 100;
  if (i.speed > ref * RUN_FACTOR) return "run";
  if (i.isPartner && i.visual === "FOLLOW") return "follow";
  return "walk";
}

function enter(c: CtlState, s: AnimState, t: number, until?: number, force = false): CtlState {
  if (c.state === s && !force) return c;
  const log = [...c.log.slice(-15), `${c.state}>${s}`];
  const prev = LOCO.includes(c.state) ? c.state : c.prev;
  const settledAt = ONE_SHOT.includes(c.state) && LOCO.includes(s) ? t : c.settledAt;
  return { ...c, state: s, since: t, prev, until, log, settledAt };
}

/**
 * Avança a máquina de estados. Pura: devolve um novo CtlState. Chamar 1× por quadro por entidade.
 */
export function stepCtl(c: CtlState, i: CtlInput, m: CreatureManifest): CtlState {
  const t = i.lt;
  let next = c;
  if (i.attack) next = { ...next, lastAttackTarget: i.attack.targetId, lastAttackStart: i.attack.start };

  // 1) estados exigidos pelo Presenter (prioridade alta; interrompem qualquer one-shot de prioridade menor)
  let forced: AnimState | undefined;
  if (i.visual === "DEFEAT") forced = "defeat";
  else if (i.visual === "HURT") forced = "hurt";
  else if (i.visual === "ATTACK" && i.attack && i.now < i.attack.start + i.attack.durationMs) forced = i.attack.special ? "skill" : "attack";
  if (forced) {
    const at = forced === "attack" || forced === "skill" ? i.attack!.start : forced === "hurt" ? (i.hurtStart ?? t) : t;
    // Golpe novo enquanto o anterior ainda aparecia: reentra (since = início do golpe novo).
    const restart = (forced === "attack" || forced === "skill") && next.since !== at;
    if (next.state !== forced || restart) next = enter(next, forced, at, undefined, true);
    return { ...next, face: i.face };
  }

  const loco = locomotion(i, m);
  // 2) one-shot em curso: segue até acabar. Golpe/dano acabam quando o Presenter para de pedir; turn, victory e
  //    interact pelo próprio prazo. Ao acabar, volta à locomoção (o estado anterior, reavaliado pela velocidade).
  if (ONE_SHOT.includes(next.state)) {
    const timed = next.state === "turn" || next.state === "victory" || next.state === "interact";
    if (timed && next.until !== undefined && t < next.until) return { ...next, face: i.face };
    next = enter(next, loco, t);
  }

  // 3) gatilhos de one-shot só de apresentação
  if (i.targetDefeatedAt !== undefined && next.victoryDoneFor !== i.targetDefeatedAt && next.lastAttackTarget) {
    next = { ...enter(next, "victory", t, t + (artDuration(m, "victory") ?? VICTORY_MS)), victoryDoneFor: i.targetDefeatedAt };
    return { ...next, face: i.face };
  }
  if (i.interactAt !== undefined && next.interactDoneFor !== i.interactAt) {
    next = { ...enter(next, "interact", t, t + (artDuration(m, "interact") ?? INTERACT_MS)), interactDoneFor: i.interactAt };
    return { ...next, face: i.face };
  }
  if (i.face !== next.face && LOCO.includes(next.state)) {
    // Troca de direção: um beat de transição (arte `turn` ou, sem ela, o "plantar" de 1 px) antes de seguir.
    next = enter(next, "turn", t, t + (artDuration(m, "turn") ?? TURN_MS));
    return { ...next, face: i.face };
  }

  // 4) locomoção
  if (loco !== next.state) next = enter(next, loco, t);
  return { ...next, face: i.face };
}

function artDuration(m: CreatureManifest, s: AnimState): number | undefined {
  const a = artFor(m, s);
  return a ? animDurationMs(a.anim) : undefined;
}

/** Fase do golpe no tempo `t` desde o início (mesmos marcos do attackLunge do v1). */
export function attackPhase(t: number, hitAtMs: number, launchAtMs?: number): AttackPhase {
  const strikeAt = launchAtMs ?? hitAtMs;
  if (t < strikeAt * ANTICIPATION_FRAC) return "anticipation";
  if (t < strikeAt) return "action";
  if (t < strikeAt + HIT_STOP_MS) return "impact";
  return "recovery";
}

export interface CtlFrame {
  state: AnimState;
  /** Nome da animação de arte usada ("idle" quando cai no fallback). */
  anim: string;
  frames: CreatureAnimation;
  index: number;
  procedural: ProcV2;
  phase?: AttackPhase;
  /** Deslocamento vertical procedural em px de arte (≤ 0 = para cima). */
  dy: number;
  /** Deslocamento horizontal procedural (lean), em px de arte, no sentido da face. */
  dx: number;
  /** O fallback foi usado (arte do estado ausente). */
  fallback: boolean;
}

/**
 * Quadro a desenhar para o estado atual. `dirFrames` é aplicado depois pela view (framesFor), aqui só o índice.
 * Os quadros do golpe seguem as fases: anticipation segura o 1º quadro (pose de carga no skill), action corre até
 * o quadro do `hitFrame`, impact o segura durante o hit-stop, recovery toca o resto.
 */
export function ctlFrame(c: CtlState, i: CtlInput, m: CreatureManifest, framesOf: (a: CreatureAnimation) => CreatureAnimation = (a) => a): CtlFrame {
  const anat = anatomyOf(m);
  const art = artFor(m, c.state);
  const idle = m.animations.idle ?? Object.values(m.animations)[0];
  // turn sem arte andando: continua o walk (com o "plantar" de 1 px) em vez de congelar no idle
  const walkArt = !art && c.state === "turn" && i.speed > 10 ? artFor(m, "walk") : undefined;
  const base = art ?? walkArt ?? { name: "idle", anim: idle };
  const anim = framesOf(base.anim);
  const n = anim.frames.length;
  const proc: ProcV2 = art ? (c.state === "defeat" && base.name !== "defeat" ? "fade" : null) : FALLBACK[c.state][anat];
  const out: CtlFrame = { state: c.state, anim: base.name, frames: anim, index: 0, procedural: proc, dy: 0, dx: 0, fallback: !art };
  const t = i.lt - c.since;
  const ref = m.walkSpeedPxPerSec ?? 100;

  switch (c.state) {
    case "walk":
    case "follow":
    case "run": {
      const durs = anim.frames.map((f) => f.durationMs);
      out.index = art ? walkFrameIndex(i.walked, durs, c.state === "run" && base.name === "walk" ? ref * RUN_FACTOR : ref) : walkFrameIndex(i.walked, durs, ref * 0.6);
      if (!art || base.name !== c.state) {
        const stride = c.state === "run" ? 6 : 8;
        const step = Math.floor(i.walked / stride) % 2;
        if (proc === "hop" || (anat === "blob" && !art)) out.dy = step ? -2 : 0;
        else if (proc === "hover") out.dy = hover(i.now);
        else if (c.state === "run") {
          out.dy = step ? -1 : 0;
          out.dx = 1;
          out.procedural = "lean";
        } else if (!m.animations.walk) out.dy = step ? -1 : 0;
      }
      break;
    }
    case "idle": {
      const settle = c.settledAt !== undefined && i.lt - c.settledAt < SETTLE_MS;
      out.index = settle || n < 2 ? 0 : frameAt(anim, i.lt, true);
      // Bob de 1 px só quando o idle tem 1 quadro (com respiração desenhada, o bob soma tremida: TECH_AUDIT L1).
      if (n < 2) out.dy = proc === "hover" || anat === "flyer" ? hover(i.now) : Math.floor((i.now % 900) / 450) === 1 ? -1 : 0;
      out.procedural = n < 2 ? (anat === "flyer" ? "hover" : "bob") : null;
      break;
    }
    case "turn": {
      out.index = art ? frameAt(anim, t, false) : walkArt ? walkFrameIndex(i.walked, anim.frames.map((f) => f.durationMs), ref) : 0;
      if (!art) out.dy = t < TURN_MS / 2 ? 1 : 0;
      break;
    }
    case "interact": {
      out.index = art ? frameAt(anim, t, false) : 0;
      if (!art) out.dy = Math.floor(t / 130) % 2 === 1 ? 1 : 0;
      break;
    }
    case "victory": {
      out.index = art ? frameAt(anim, t, false) : 0;
      if (!art) {
        // Dois pulinhos (seno discreto), parado no chão no fim.
        const u = (t % 400) / 400;
        out.dy = t < 800 ? -Math.round(Math.sin(Math.PI * u) * (anat === "quadruped" ? 2 : 3)) : 0;
      }
      break;
    }
    case "attack":
    case "skill": {
      const a = i.attack;
      if (!a) break;
      // Fase pelo relógio real (os marcos de attackTiming são reais); quadros do golpe básico pelo tempo local,
      // que já congela no hit-stop (igual ao v1).
      const real = i.now - a.start;
      out.phase = attackPhase(real, a.hitAtMs, a.launchAtMs);
      if (art) out.index = c.state === "skill" ? attackFrame(anim, real, a.hitAtMs, a.launchAtMs, true, anim.events ?? base.anim.events) : frameAt(anim, i.lt - a.start, false);
      break;
    }
    case "hurt":
    case "defeat": {
      const t0 = i.hurtStart ?? c.since;
      out.index = proc === "fade" && !art ? n - 1 : frameAt(anim, i.lt - t0, false);
      break;
    }
  }
  if (out.index >= anim.frames.length) out.index = anim.frames.length - 1;
  return out;
}

function hover(now: number): number {
  return Math.round(Math.sin((now / 1100) * Math.PI * 2)) === 1 ? -1 : 0;
}

/**
 * Índice do quadro do golpe pelas fases. Sem skill é igual ao v1 (frameAt sobre o tempo local, que já segura o
 * quadro do impacto no hit-stop). No skill a antecipação SEGURA o 1º quadro (pose de carga) e a ação é comprimida até o lançamento,
 * para o corpo soltar o golpe junto do projétil (launchAtMs, tempo da sim inalterado).
 */
export function attackFrame(a: CreatureAnimation, t: number, hitAtMs: number, launchAtMs: number | undefined, skill: boolean, events?: CreatureAnimation["events"]): number {
  const n = a.frames.length;
  if (n <= 1) return 0;
  const hit = Math.min(n - 1, events?.find((e) => e.name === "hitFrame")?.frame ?? Math.floor(n / 2));
  const strikeAt = launchAtMs ?? hitAtMs;
  if (!skill) return frameAt(a, t, false);
  const antEnd = strikeAt * ANTICIPATION_FRAC;
  if (t < antEnd) return 0; // carga
  if (t < strikeAt) return hit <= 1 ? 0 : 1 + Math.min(hit - 2, Math.floor(((t - antEnd) / Math.max(1, strikeAt - antEnd)) * (hit - 1)));
  if (t < strikeAt + HIT_STOP_MS) return hit;
  const rest = a.frames.slice(hit + 1);
  if (!rest.length) return hit;
  const tr = t - strikeAt - HIT_STOP_MS;
  let acc = 0;
  for (let k = 0; k < rest.length; k++) {
    acc += rest[k].durationMs;
    if (tr < acc) return hit + 1 + k;
  }
  return n - 1;
}

/** Estados e fallback por estado/anatomia, para o relatório e os testes. */
export function fallbackTable(): Record<AnimState, Record<Anatomy, ProcV2>> {
  return FALLBACK;
}
