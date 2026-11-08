// Movimento VISUAL fluido (só apresentação; a posição lógica continua sendo a da sim, a 10 Hz).
// - Suavização "SmoothDamp" (mola criticamente amortecida) sobre a posição interpolada da sim: aceleração e
//   desaceleração suaves, sem saltos de tile. Nunca fica mais de MAX_LAG_PX atrás (teleporte/respawn = corte seco).
// - Direção em 4 eixos pela velocidade visual, com histerese para não piscar em diagonais.
// - Fase do walk pela DISTÂNCIA andada: a cadência acompanha a velocidade real (andar devagar = passos lentos).

import type { Dir8, Vec } from "../sim/types";
import { to4, type Dir4 } from "./anim";

/** Tempo de suavização (s). Menor = mais colado na sim; maior = mais "deslizado". */
export const SMOOTH_TIME_S = 0.075;
/** Acima disto (px) não suaviza: corta (respawn, teleporte, primeiro quadro). */
export const MAX_LAG_PX = 48;
/** Abaixo disto (px/s) a entidade está parada para fins de animação. */
export const MOVING_PX_S = 10;
/** Histerese da troca de eixo (horizontal ↔ vertical). */
const AXIS_BIAS = 1.25;

export interface MotionState {
  pos: Vec;
  vel: Vec;
  /** Distância andada acumulada (px), para a fase do walk. */
  walked: number;
  face: Dir4;
  /** Velocidade escalar suavizada (px/s). */
  speed: number;
  initialized: boolean;
}

export function newMotion(face: Dir8 = "S"): MotionState {
  return { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, walked: 0, face: to4(face), speed: 0, initialized: false };
}

/** SmoothDamp 1D (Game Programming Gems 4, cap. 1.10). Devolve [novo valor, nova velocidade]. */
export function smoothDamp(cur: number, target: number, vel: number, smoothTime: number, dt: number): [number, number] {
  const omega = 2 / Math.max(1e-4, smoothTime);
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = cur - target;
  const temp = (vel + omega * change) * dt;
  const nv = (vel - omega * temp) * exp;
  let out = target + (change + temp) * exp;
  // sem ultrapassar o alvo
  if (target - cur > 0 === out > target) {
    out = target;
    return [out, (out - target) / Math.max(dt, 1e-4)];
  }
  return [out, nv];
}

/**
 * Avança o estado visual em `dtMs` rumo a `target` (posição interpolada da sim, px). `simFacing` vale quando
 * parado (ex.: virar para o alvo antes do golpe) e `forceFace` tem prioridade (golpe em curso).
 */
export function stepMotion(m: MotionState, target: Vec, dtMs: number, simFacing: Dir8, forceFace?: Dir4): MotionState {
  const dt = Math.min(0.1, Math.max(0, dtMs / 1000));
  if (!m.initialized || Math.hypot(target.x - m.pos.x, target.y - m.pos.y) > MAX_LAG_PX) {
    return { pos: { ...target }, vel: { x: 0, y: 0 }, walked: m.walked, face: forceFace ?? to4(simFacing), speed: 0, initialized: true };
  }
  if (dt === 0) return m;
  const [x, vx] = smoothDamp(m.pos.x, target.x, m.vel.x, SMOOTH_TIME_S, dt);
  const [y, vy] = smoothDamp(m.pos.y, target.y, m.vel.y, SMOOTH_TIME_S, dt);
  const step = Math.hypot(x - m.pos.x, y - m.pos.y);
  const inst = step / dt;
  const speed = m.speed + (inst - m.speed) * Math.min(1, dt / 0.06);
  let face = m.face;
  if (forceFace) face = forceFace;
  else if (speed > MOVING_PX_S && step > 0) {
    const ax = Math.abs(x - m.pos.x);
    const ay = Math.abs(y - m.pos.y);
    const horizNow = face === "E" || face === "W";
    const horiz = horizNow ? ax * AXIS_BIAS >= ay : ax > ay * AXIS_BIAS;
    face = horiz ? (x > m.pos.x ? "E" : "W") : y > m.pos.y ? "S" : "N";
  } else if (speed < 1) face = to4(simFacing); // parado: segue a direção lógica (ex.: virar para o alvo)
  return { pos: { x, y }, vel: { x: vx, y: vy }, walked: m.walked + step, face, speed, initialized: true };
}

/** Direção de 4 eixos de um vetor (golpes). */
export function face4Of(v: Vec, fallback: Dir4): Dir4 {
  if (v.x === 0 && v.y === 0) return fallback;
  return Math.abs(v.x) >= Math.abs(v.y) ? (v.x > 0 ? "E" : "W") : v.y > 0 ? "S" : "N";
}

/**
 * Quadro do walk pela distância: cada quadro cobre `durationMs × refSpeed` px. Na velocidade de referência a
 * cadência é a do manifest; mais rápido, os pés acompanham.
 */
export function walkFrameIndex(walkedPx: number, frameDurationsMs: number[], refSpeedPxS: number): number {
  const strides = frameDurationsMs.map((ms) => Math.max(1, (ms / 1000) * refSpeedPxS));
  const cycle = strides.reduce((s, x) => s + x, 0);
  let d = ((walkedPx % cycle) + cycle) % cycle;
  for (let i = 0; i < strides.length; i++) {
    d -= strides[i];
    if (d < 0) return i;
  }
  return strides.length - 1;
}

/** Bob do idle: 1 px para cima metade do ciclo (pixel-perfect), defasado por entidade. */
export function idleBob(now: number, phase: number, periodMs = 900): number {
  return Math.floor(((now + phase) % periodMs) / (periodMs / 2)) === 1 ? -1 : 0;
}

/** Câmera: lerp exponencial independente de FPS. `tauMs` = constante de tempo. */
export function lerpCamera(cur: Vec, target: Vec, dtMs: number, tauMs = 110): Vec {
  const k = 1 - Math.exp(-Math.max(0, dtMs) / tauMs);
  return { x: cur.x + (target.x - cur.x) * k, y: cur.y + (target.y - cur.y) * k };
}
