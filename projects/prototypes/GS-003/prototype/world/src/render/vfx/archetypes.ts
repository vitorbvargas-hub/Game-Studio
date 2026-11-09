// Arquétipos de VFX parametrizáveis (15). Cada um desenha as fases carga → lançamento → viagem → impacto → resíduo
// a partir de um VfxFrame (posições de tela já resolvidas pela view) e do tempo. Sem estado: tudo é função de
// (semente = seq do golpe, tempo), então o mesmo golpe no mesmo instante dá o mesmo quadro (capturas e testes).
// Arte 100% original, em código: nenhum efeito copia golpe de anime ou jogo. Nada aqui decide dano.

import type { Vec } from "../../sim/types";
import { additive, arrow, burst, clamp01, disk, dot, glow, inCubic, line, outBack, outCubic, pal, plus, rand, ring, shard, step8, withAlpha, zigzag, type G } from "./pixel";

export interface VfxTarget {
  hit: Vec;
  feet: Vec;
}

export interface VfxFrame {
  g: G;
  seq: number;
  /** Paleta: núcleo claro → borda escura. */
  P: string[];
  /** Escala do efeito (1 = leve, 2 = pesado). Sempre aplicada como tamanho, nunca como zoom de pixel. */
  S: number;
  count: number;
  now: number;
  /** Origem (âncora de golpe do atacante) e pés do atacante, em px de tela. */
  o: Vec;
  of: Vec;
  /** Alvo principal: âncora de impacto e pés. */
  d: Vec;
  df: Vec;
  targets: VfxTarget[];
  /** Centro da área (nível do chão) e ponta da linha. */
  c: Vec;
  end: Vec;
  /** Área: raio em px. Linha: meia largura em px. */
  radius: number;
  /** Direção unitária do golpe (origem → alvo, ou → ponta da linha). */
  dir: Vec;
  /** O efeito é no próprio atacante (buff/cura). */
  self: boolean;
  glow: number;
}

export interface Archetype {
  charge?(f: VfxFrame, k: number, t: number): void;
  launch?(f: VfxFrame, t: number): void;
  travel?(f: VfxFrame, u: number, t: number): void;
  impact?(f: VfxFrame, t: number, k: number): void;
  residue?(f: VfxFrame, t: number, k: number): void;
  /** Camada do chão (sob as entidades): marcas, círculos e rachaduras. */
  ground?(f: VfxFrame, phase: Phase, t: number, k: number): void;
}

export type Phase = "charge" | "launch" | "travel" | "impact" | "residue";
export const LAUNCH_MS = 90;

const R = Math.round;
const lerp = (a: Vec, b: Vec, k: number): Vec => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
const ang = (v: Vec) => Math.atan2(v.y, v.x);
const perp = (v: Vec): Vec => ({ x: -v.y, y: v.x });
const flick = (now: number, ms = 60) => Math.floor(now / ms) % 2;

// ---------- peças comuns ----------

/** Energia convergindo para o ponto (carga): partículas espiralando para dentro + núcleo crescendo. */
function gather(f: VfxFrame, at: Vec, k: number, t: number, n = 10, rad = 14): void {
  const { g, P, S } = f;
  const r = rand(f.seq * 31 + 7);
  for (let i = 0; i < n * S; i++) {
    const a0 = r() * Math.PI * 2;
    const ph = r();
    const u = (k + ph) % 1;
    const rr = rad * S * (1 - u);
    const a = a0 + u * 2.2;
    dot(g, at.x + Math.cos(a) * rr, at.y + Math.sin(a) * rr * 0.8, u > 0.7 ? 2 : 1, pal(P, 0.2 + 0.5 * (1 - u)));
  }
  const core = 1 + R((2 + S) * outCubic(k));
  glow(g, at.x, at.y, f.glow * (0.4 + 0.6 * k), P[3], 0.9 * k);
  disk(g, at.x, at.y, core + flick(t, 50), P[3]);
  disk(g, at.x, at.y, Math.max(1, core - 1), P[1]);
  dot(g, at.x, at.y, 1, P[0]);
}

/** Clarão de saída (lançamento): estrela de 4 pontas + glow, 90 ms. */
function muzzle(f: VfxFrame, at: Vec, t: number): void {
  const { g, P, S } = f;
  const k = clamp01(t / LAUNCH_MS);
  const s = R((4 + 2 * S) * (1 - k * 0.6));
  glow(g, at.x, at.y, f.glow * 0.9, P[2], 1 - k);
  withAlpha(g, 1 - k * 0.7, () => {
    line(g, at.x - s, at.y, at.x + s, at.y, P[0]);
    line(g, at.x, at.y - s, at.x, at.y + s, P[0]);
    disk(g, at.x, at.y, 1 + (k < 0.5 ? 1 : 0), P[1]);
  });
}

/** Anel de choque achatado (perspectiva do chão) que expande e escurece. */
function shockRing(f: VfxFrame, at: Vec, t: number, dur: number, rmax: number, squash = 0.55, w = 1): void {
  const k = clamp01(t / dur);
  if (k >= 1) return;
  withAlpha(f.g, step8(1 - k), () => ring(f.g, at.x, at.y, 2 + outCubic(k) * rmax, pal(f.P, 0.25 + k * 0.6), squash, w));
}

/** Faíscas/detritos em leque (pontos com cor pela idade). */
function sparks(f: VfxFrame, at: Vec, t: number, seed: number, n: number, speed: number, gravity = 220, lift = 0, angle?: number, spread?: number): void {
  for (const b of burst(seed, t, { n, speed: [speed * 0.4, speed], life: [180, 420], gravity, lift, angle, spread, size: [1, 2] }))
    dot(f.g, at.x + b.x, at.y + b.y, b.k < 0.5 ? b.size : 1, pal(f.P, 0.1 + b.k * 0.85));
}

/** Fumaça/poeira: bolhas que sobem, crescem e somem (cores escuras da paleta). */
function smoke(f: VfxFrame, at: Vec, t: number, k: number, seed: number, n = 5, spread = 8): void {
  const r = rand(seed);
  for (let i = 0; i < n; i++) {
    const ox = (r() - 0.5) * spread * 2;
    const delay = r() * 0.3;
    const kk = clamp01((k - delay) / (1 - delay));
    if (kk <= 0 || kk >= 1) continue;
    const y = at.y - 2 - kk * (10 + r() * 8) * f.S;
    withAlpha(f.g, step8(0.55 * (1 - kk)), () => disk(f.g, at.x + ox + Math.sin(t / 140 + i) * 2, y, 1 + kk * 3 * f.S, f.P[f.P.length - 2]));
  }
  void t;
}

/** Mancha no chão (queimado, gelo, etc.). */
function groundMark(f: VfxFrame, at: Vec, rx: number, color: string, alpha: number): void {
  withAlpha(f.g, step8(alpha), () => disk(f.g, at.x, at.y, rx, color, 0.45));
}

// ---------- arquétipos ----------

/** Impacto corpo a corpo: estrela branca, anel de choque, riscos de velocidade, detritos e poeira. */
const melee_impact: Archetype = {
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const at = tg.hit;
      if (t < 70) {
        const s = 5 + 3 * S;
        glow(g, at.x, at.y, f.glow * 1.2, P[2], 1);
        line(g, at.x - s, at.y + 1, at.x + s, at.y + 1, P[6], S + 1);
        line(g, at.x + 1, at.y - s, at.x + 1, at.y + s, P[6], S + 1);
        line(g, at.x - s, at.y, at.x + s, at.y, P[0], S);
        line(g, at.x, at.y - s, at.x, at.y + s, P[0], S);
        line(g, at.x - s * 0.6, at.y - s * 0.6, at.x + s * 0.6, at.y + s * 0.6, P[1]);
        line(g, at.x - s * 0.6, at.y + s * 0.6, at.x + s * 0.6, at.y - s * 0.6, P[1]);
        disk(g, at.x, at.y, 2 + S, P[0]);
      }
      shockRing(f, at, t, 240, 10 + 6 * S, 0.6, S);
      // riscos de velocidade: 6 linhas radiais que saem do centro
      if (t < 180) {
        const r = rand(f.seq * 13 + 3);
        const kk = outCubic(t / 180);
        for (let i = 0; i < 6 + 2 * S; i++) {
          const a = r() * Math.PI * 2;
          const r0 = 4 + kk * (10 + 6 * S);
          const r1 = r0 + 4 + 3 * S * (1 - kk);
          withAlpha(g, 1 - kk, () => line(g, at.x + Math.cos(a) * r0, at.y + Math.sin(a) * r0 * 0.8, at.x + Math.cos(a) * r1, at.y + Math.sin(a) * r1 * 0.8, P[1]));
        }
      }
      sparks(f, at, t, f.seq * 7 + 1, 10 + 6 * S, 90 + 50 * S);
    }
    void k;
  },
  residue(f, t, k) {
    for (const tg of f.targets) smoke(f, tg.feet, t, k, f.seq * 5 + 2, 4, 6);
  },
};

/** Corte/garra: `count` riscos curvos em sequência, contorno escuro, núcleo branco, rastro na cor e faíscas. */
const slash: Archetype = {
  impact(f, t) {
    const { g, P, S } = f;
    const n = Math.max(1, Math.min(4, f.count));
    const base = ang(f.dir) + Math.PI / 2 + 0.5;
    const len = 7 + 5 * S;
    for (const tg of f.targets) {
      // brilho na cor do golpe atrás das garras (lê sobre o alvo mesmo durante o flash branco)
      if (t < 140) glow(g, tg.hit.x, tg.hit.y, f.glow + 6, P[3], 1 - t / 140);
      for (const pass of [0, 1]) {
        for (let i = 0; i < n; i++) {
          const t0 = i * 35;
          const tt = t - t0;
          if (tt < 0) continue;
          const k = clamp01(tt / 90);
          const fade = clamp01(1 - (tt - 130) / 120);
          if (fade <= 0) continue;
          const off = (i - (n - 1) / 2) * (3 + S);
          const ax = Math.cos(base);
          const ay = Math.sin(base);
          const px_ = -ay;
          const py_ = ax;
          const cx = tg.hit.x + px_ * off;
          const cy = tg.hit.y + py_ * off;
          const steps = 16;
          const shown = R(steps * outCubic(k));
          withAlpha(g, fade, () => {
            for (let s = 0; s <= shown; s++) {
              const u = s / steps;
              const curve = Math.sin(Math.PI * u) * 3 * S;
              const x = cx + ax * len * (u * 2 - 1) + px_ * curve;
              const y = cy + ay * len * (u * 2 - 1) + py_ * curve;
              const thick = Math.sin(Math.PI * u) > 0.5 ? S : Math.max(1, S - 1);
              const head = s >= shown - 2;
              // passada 0: contorno escuro; passada 1: núcleo claro → cor do golpe na cauda
              if (pass === 0) dot(g, x + 1, y + 1, thick + 2, P[6]);
              else dot(g, x, y, thick + (head ? 1 : 0), head || tt < 60 ? P[0] : s > shown - 6 ? P[2] : P[3]);
            }
          });
        }
      }
      if (t < 50) disk(g, tg.hit.x, tg.hit.y, 2 + S, P[0]);
      sparks(f, tg.hit, t, f.seq * 11 + 4, 8 + 4 * S, 110, 260, 0, ang(f.dir), 1.8);
    }
  },
  residue(f, t, k) {
    // marcas de garra persistem por um instante (pós-imagem 1 px deslocada) e detritos caem
    const { g, P, S } = f;
    const n = Math.max(1, f.count);
    const base = ang(f.dir) + Math.PI / 2 + 0.5;
    const len = 9 + 5 * S;
    for (const tg of f.targets) {
      withAlpha(g, step8(0.6 * (1 - k)), () => {
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * (3 + S);
          const ax = Math.cos(base);
          const ay = Math.sin(base);
          line(g, tg.hit.x - ax * len * 0.8 - ay * off + 1, tg.hit.y - ay * len * 0.8 + ax * off + 1, tg.hit.x + ax * len * 0.8 - ay * off + 1, tg.hit.y + ay * len * 0.8 + ax * off + 1, P[4]);
        }
      });
      for (const b of burst(f.seq * 3 + 9, t, { n: 5 + 3 * S, speed: [20, 60], life: [300, 600], gravity: 300, angle: -Math.PI / 2, spread: 2.4, size: [1, 2] }))
        dot(g, tg.hit.x + b.x, tg.hit.y + b.y, b.size, pal(P, 0.5 + b.k * 0.5));
    }
  },
};

/** Projétil de fogo: carga, orbe com língua de fogo, brasas no rastro, explosão, fumaça e chão queimado. */
const fire_bolt: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 8, 10 + 3 * f.S);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, u) {
    const { g, P, S, now } = f;
    const pos = lerp(f.o, f.d, u * 0.85 + inCubic(u) * 0.15);
    pos.y -= Math.sin(Math.PI * u) * 3;
    // rastro: posições anteriores no mesmo caminho, encolhendo
    for (let i = 7; i >= 1; i--) {
      const uu = Math.max(0, u - i * 0.035);
      const p = lerp(f.o, f.d, uu * 0.85 + inCubic(uu) * 0.15);
      p.y -= Math.sin(Math.PI * uu) * 3;
      const r = rand(f.seq * 97 + i + Math.floor(now / 50));
      const jitter = (r() - 0.5) * 3;
      const pp = perp(f.dir);
      disk(g, p.x + pp.x * jitter, p.y + pp.y * jitter - i * 0.4, Math.max(0, (S + 2) * (1 - i / 8)), pal(P, 0.25 + i * 0.09));
    }
    // brasas soltas que sobem do rastro
    const r = rand(f.seq * 41 + Math.floor(now / 70));
    for (let i = 0; i < 3 + 2 * S; i++) dot(g, pos.x - f.dir.x * r() * 16 + (r() - 0.5) * 6, pos.y - f.dir.y * r() * 16 - r() * 5, 1, pal(P, 0.2 + r() * 0.6));
    const R0 = 2 + S + flick(now, 60);
    glow(g, pos.x, pos.y, f.glow * (0.8 + 0.2 * S), P[3], 1);
    disk(g, pos.x, pos.y, R0 + 1, P[5]);
    disk(g, pos.x, pos.y, R0, P[3]);
    disk(g, pos.x + f.dir.x, pos.y + f.dir.y, Math.max(1, R0 - 1), P[2]);
    disk(g, pos.x + f.dir.x * 1.5, pos.y + f.dir.y * 1.5, Math.max(1, R0 - 2), P[1]);
    dot(g, pos.x + f.dir.x * 2, pos.y + f.dir.y * 2 - 1, 1, P[0]);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const at = tg.hit;
      // bola de fogo: discos concêntricos que crescem; o núcleo quente encolhe antes da borda
      const grow = outBack(clamp01(t / 160));
      const rOut = (5 + 5 * S) * grow * (1 - 0.3 * k);
      glow(g, at.x, at.y, f.glow * (1.4 + 0.4 * S), P[3], 1 - k);
      if (k < 0.8) {
        withAlpha(g, step8(1 - k * 0.9), () => {
          disk(g, at.x, at.y, rOut, k > 0.5 ? P[6] : P[5]);
          disk(g, at.x, at.y - 1, rOut * 0.78, P[4]);
          disk(g, at.x, at.y - 1, rOut * 0.56 * (1 - k), P[3]);
          disk(g, at.x, at.y - 2, rOut * 0.34 * (1 - k), P[1]);
        });
      }
      if (t < 60) disk(g, at.x, at.y, 3 + S, P[0]);
      shockRing(f, { x: at.x, y: tg.feet.y - 2 }, t, 260, 14 + 6 * S, 0.45, 1);
      for (const b of burst(f.seq * 17 + 5, t, { n: 12 + 8 * S, speed: [40, 130 + 30 * S], life: [220, 520], gravity: 60, lift: 30, size: [1, 2] }))
        dot(g, at.x + b.x, at.y + b.y, b.k < 0.4 ? b.size : 1, pal(P, 0.1 + b.k * 0.9));
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets) {
      smoke(f, tg.hit, t, k, f.seq * 23 + 1, 4 + 2 * f.S, 6);
      // labaredas pequenas que tremulam no chão
      const r = rand(f.seq * 19);
      for (let i = 0; i < 3; i++) {
        const x = tg.feet.x + (r() - 0.5) * 12;
        const h = (2 + r() * 3) * (1 - k) + flick(f.now + i * 37, 80);
        withAlpha(g, step8(1 - k), () => {
          line(g, x, tg.feet.y, x, tg.feet.y - h, P[3]);
          dot(g, x, tg.feet.y - h, 1, P[1]);
        });
      }
    }
  },
  ground(f, phase, _t, k) {
    if (phase === "residue") for (const tg of f.targets) groundMark(f, tg.feet, 6 + 3 * f.S, "#181425", 0.35 * (1 - k));
  },
};

/** Estilhaço de gelo: cristais se formando, `count` lascas em leque, estilhaçamento e cristais no chão. */
const ice_shard: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t / 300;
      const rr = (12 - 8 * outCubic(k)) * (0.8 + 0.2 * f.S);
      shard(g, f.o.x + Math.cos(a) * rr, f.o.y + Math.sin(a) * rr * 0.8, a, 2 + k * 2, 1, P[3], P[1]);
    }
    glow(g, f.o.x, f.o.y, f.glow * k, P[3], k);
    dot(g, f.o.x, f.o.y, 2, P[0]);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, u, t) {
    const { g, P, S } = f;
    const n = Math.max(1, f.count);
    const pp = perp(f.dir);
    const a = ang(f.dir);
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 5 * Math.sin(Math.PI * u);
      const uu = clamp01(u * 1.08 - i * 0.04);
      const pos = lerp(f.o, f.d, uu);
      const x = pos.x + pp.x * off;
      const y = pos.y + pp.y * off;
      // rastro cintilante
      for (let j = 1; j <= 5; j++) {
        const q = lerp(f.o, f.d, Math.max(0, uu - j * 0.04));
        if ((j + Math.floor(t / 40)) % 2) dot(g, q.x + pp.x * off, q.y + pp.y * off, 1, pal(P, 0.1 + j * 0.12));
      }
      glow(g, x, y, f.glow * 0.7, P[3], 0.8);
      shard(g, x, y, a, 4 + 2 * S, 1 + (S > 1 ? 1 : 0), P[4], P[1]);
      dot(g, x + f.dir.x * (3 + 2 * S), y + f.dir.y * (3 + 2 * S), 1, P[0]);
    }
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const at = tg.hit;
      glow(g, at.x, at.y, f.glow * 1.3, P[3], 1 - k);
      if (t < 60) {
        disk(g, at.x, at.y, 3 + S, P[0]);
        ring(g, at.x, at.y, 6 + 2 * S, P[1]);
      }
      shockRing(f, at, t, 220, 12 + 5 * S, 0.7);
      // lascas girando para fora
      for (const b of burst(f.seq * 29 + 3, t, { n: 10 + 4 * S, speed: [60, 150], life: [240, 460], gravity: 240 }))
        shard(g, at.x + b.x, at.y + b.y, b.i + t / 60, 2 + (b.k < 0.5 ? 1 : 0), 1, pal(P, 0.2 + b.k * 0.7), b.k < 0.3 ? P[0] : undefined);
      // flocos
      for (const b of burst(f.seq * 31 + 1, t, { n: 8, speed: [10, 40], life: [300, 600], gravity: 30 })) dot(g, at.x + b.x, at.y + b.y, 1, P[1]);
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets) {
      // cristais crescendo do chão e derretendo
      const r = rand(f.seq * 37);
      for (let i = 0; i < 4 + f.S; i++) {
        const x = tg.feet.x + (r() - 0.5) * 16;
        const y = tg.feet.y + (r() - 0.5) * 4;
        const h = (3 + r() * 4) * outCubic(clamp01(k * 4)) * (1 - inCubic(k));
        if (h >= 1) shard(g, x, y - h / 2, -Math.PI / 2 + (r() - 0.5) * 0.6, h / 2 + 1, 1, P[3], P[1]);
      }
      for (const b of burst(f.seq * 43, t, { n: 6, speed: [4, 14], life: [500, 900], lift: 10 })) withAlpha(g, 1 - b.k, () => dot(g, tg.hit.x + b.x * 2, tg.hit.y + b.y, 1, P[2]));
    }
  },
  ground(f, phase, _t, k) {
    if (phase === "impact" || phase === "residue") for (const tg of f.targets) groundMark(f, tg.feet, 7 + 2 * f.S, f.P[2], 0.3 * (1 - k));
  },
};

/** Raio/feixe: carga com energia convergindo, feixe que se estende, pulsa e afina; pós-imagem. */
const beam: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 12, 16 + 4 * f.S);
    if (k > 0.6) ring(f.g, f.o.x, f.o.y, 4 + (1 - k) * 20, f.P[2], 1);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, u) {
    drawBeam(f, lerp(f.o, f.end, outCubic(u)), 1, 0);
  },
  impact(f, t, k) {
    const thin = k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35;
    drawBeam(f, f.end, thin, t);
    for (const tg of f.targets) {
      if (k < 0.7) sparks(f, tg.hit, t % 200, f.seq * 3 + Math.floor(t / 200), 6, 100, 120, 0, ang(f.dir) + Math.PI, 2.2);
      glow(f.g, tg.hit.x, tg.hit.y, f.glow * 1.1, f.P[2], thin);
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    withAlpha(g, step8(0.5 * (1 - k)), () => line(g, f.o.x, f.o.y, f.end.x, f.end.y, P[4]));
    const L = Math.hypot(f.end.x - f.o.x, f.end.y - f.o.y);
    for (const b of burst(f.seq * 53, t, { n: R(L / 6), speed: [4, 18], life: [300, 700], lift: 20 })) {
      const along = lerp(f.o, f.end, (b.i * 0.618) % 1);
      dot(g, along.x + b.x, along.y + b.y, 1, pal(P, 0.2 + b.k * 0.6));
    }
  },
};

function drawBeam(f: VfxFrame, tip: Vec, thin: number, t: number): void {
  const { g, P, S, now } = f;
  if (thin <= 0) return;
  const w = Math.max(1, R((3 + 2 * S) * thin + (flick(now, 50) ? 1 : 0)));
  const L = Math.hypot(tip.x - f.o.x, tip.y - f.o.y);
  const pp = perp(f.dir);
  additive(g, () => {
    g.globalAlpha = 0.35;
    line(g, f.o.x, f.o.y, tip.x, tip.y, P[4], w + 4);
    g.globalAlpha = 0.6;
    line(g, f.o.x, f.o.y, tip.x, tip.y, P[3], w + 2);
    g.globalAlpha = 1;
  });
  line(g, f.o.x, f.o.y, tip.x, tip.y, P[2], w);
  line(g, f.o.x, f.o.y, tip.x, tip.y, P[0], Math.max(1, w - 2));
  // ondulação nas bordas: pontos senoidais correndo ao longo do feixe
  for (let s = 0; s < L; s += 3) {
    const p = lerp(f.o, tip, s / L);
    const o = Math.sin(s / 4 - now / 30) * (w / 2 + 1 + S);
    dot(g, p.x + pp.x * o, p.y + pp.y * o, 1, P[1]);
  }
  glow(g, f.o.x, f.o.y, f.glow * 0.8, P[2], thin);
  disk(g, f.o.x, f.o.y, 2 + S * thin, P[0]);
  glow(g, tip.x, tip.y, f.glow, P[3], thin);
  disk(g, tip.x, tip.y, (2 + S) * thin + flick(now + t, 40), P[1]);
}

/** Sopro de chamas em linha: jato de partículas que abre em cone, cor pela idade (branco → amarelo → vermelho → fumaça). */
const flame_breath: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 6, 8);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, _u, t) {
    breath(f, t);
  },
  impact(f, t, k) {
    breath(f, t + 10000);
    for (const tg of f.targets) {
      glow(f.g, tg.hit.x, tg.hit.y, f.glow, f.P[3], 1 - k);
      sparks(f, tg.hit, t, f.seq * 59 + 2, 8, 90, 40, 40);
    }
  },
  residue(f, t, k) {
    const L = Math.hypot(f.end.x - f.o.x, f.end.y - f.o.y);
    for (let i = 0; i < 4; i++) smoke(f, lerp({ x: f.o.x, y: f.of.y }, { x: f.end.x, y: f.end.y + (f.of.y - f.o.y) }, (i + 1) / 5), t, k, f.seq * 61 + i, 2, Math.min(8, L / 10));
  },
  ground(f, phase, _t, k) {
    if (phase !== "residue") return;
    for (let i = 1; i <= 4; i++) groundMark(f, lerp({ x: f.of.x, y: f.of.y }, { x: f.end.x, y: f.end.y + (f.of.y - f.o.y) }, i / 5), 4 + i, "#181425", 0.3 * (1 - k));
  },
};

/** Jato contínuo do sopro: partícula i nasce em i·dt e viaja ao longo da linha abrindo em cone. tt grande = fim do jato. */
function breath(f: VfxFrame, tt: number): void {
  const { g, P, S } = f;
  const L = Math.hypot(f.end.x - f.o.x, f.end.y - f.o.y);
  const pp = perp(f.dir);
  const r = rand(f.seq * 67 + 5);
  const emitMs = 260;
  const life = 260;
  const n = 26 + 14 * S;
  const t = tt >= 10000 ? emitMs * 0.6 + (tt - 10000) : tt;
  for (let i = 0; i < n; i++) {
    const born = (i / n) * emitMs;
    const spread = (r() - 0.5) * 2;
    const speedK = 0.85 + r() * 0.3;
    const age = t - born;
    if (age < 0 || age > life) continue;
    const k = age / life;
    const d = Math.min(L * 1.05, L * k * speedK * 1.3);
    const w = (2 + d * 0.22) * spread * (0.6 + 0.4 * S) * Math.min(1, f.radius / 8);
    const x = f.o.x + f.dir.x * d + pp.x * w;
    const y = f.o.y + f.dir.y * d + pp.y * w - k * 4;
    const size = k < 0.25 ? 1 + S : k < 0.6 ? 2 + S : 2;
    if (k < 0.5) glow(g, x, y, 4 + 2 * S, P[3], 0.5 * (1 - k));
    disk(g, x, y, size, pal(P, 0.05 + k * 0.95));
  }
}

/** Bolhas: `count` bolhas oscilando em caminhos diferentes, estouro com gotas, bolhinhas subindo. */
const bubbles: Archetype = {
  charge(f, k) {
    const { g, P } = f;
    for (let i = 0; i < 3; i++) {
      const kk = clamp01(k * 1.5 - i * 0.25);
      if (kk > 0) ring(g, f.o.x + (i - 1) * 3, f.o.y - i, 1 + kk * 2, P[3]);
    }
  },
  travel(f, u, t) {
    const { g, P, S } = f;
    const n = Math.max(1, f.count);
    const pp = perp(f.dir);
    for (let i = 0; i < n; i++) {
      const uu = clamp01((u - i * 0.12) / (1 - (n - 1) * 0.12 * 0.5));
      if (uu <= 0) continue;
      const wob = Math.sin(uu * Math.PI * 3 + i * 1.7) * (3 + i) * Math.sin(Math.PI * uu);
      const p = lerp(f.o, f.d, Math.min(1, uu));
      const x = p.x + pp.x * wob;
      const y = p.y + pp.y * wob - Math.sin(Math.PI * uu) * 4;
      const r0 = (2 + (i % 2) + S * 1.5) * (0.7 + 0.3 * uu) + (Math.floor(t / 90 + i) % 2 ? 0.5 : 0);
      glow(g, x, y, r0 * 2.2, P[3], 0.5);
      ring(g, x, y, r0, P[3], 1);
      withAlpha(g, 0.35, () => disk(g, x, y, Math.max(0, r0 - 1), P[2]));
      dot(g, x - r0 * 0.4, y - r0 * 0.45, 1, P[0]);
    }
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    const n = Math.max(1, f.count);
    for (const tg of f.targets) {
      for (let i = 0; i < n; i++) {
        const tt = t - i * 50;
        if (tt < 0) continue;
        const r = rand(f.seq * 71 + i);
        const at = { x: tg.hit.x + (r() - 0.5) * 8, y: tg.hit.y + (r() - 0.5) * 6 };
        const kk = clamp01(tt / 200);
        if (kk < 1) withAlpha(g, 1 - kk, () => ring(g, at.x, at.y, 2 + S + kk * (6 + 3 * S), kk < 0.3 ? P[0] : P[2], 1));
        for (const b of burst(f.seq * 73 + i, tt, { n: 6 + 2 * S, speed: [40, 90], life: [180, 360], gravity: 280 })) dot(g, at.x + b.x, at.y + b.y, 1, pal(P, 0.1 + b.k * 0.6));
      }
    }
    void k;
  },
  residue(f, t) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 79, t, { n: 6, speed: [2, 10], life: [300, 600], lift: 28 })) {
        const r0 = b.k > 0.9 ? 0 : 1;
        if (r0) ring(g, tg.hit.x + b.x * 3, tg.hit.y + b.y + 4, 1, P[2]);
        else dot(g, tg.hit.x + b.x * 3, tg.hit.y + b.y + 4, 1, P[0]);
      }
  },
};

/** Lâmina de vento: crescente girando com riscos de velocidade, corte em X e redemoinho. */
const wind_cutter: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    for (let i = 0; i < 3; i++) ring(g, f.o.x, f.o.y, 3 + i * 3 * (1 - k), P[2 + i], 0.7, 1, [t / 80 + i * 2, t / 80 + i * 2 + 2.2]);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, u, t) {
    const { g, P, S } = f;
    const p = lerp(f.o, f.d, u);
    // riscos de velocidade atrás
    const pp = perp(f.dir);
    for (let i = -2; i <= 2; i++) {
      const L = 6 + Math.abs(i) * -1 + 6 * (1 - Math.abs(i) / 3);
      line(g, p.x - f.dir.x * 4 + pp.x * i * 2, p.y - f.dir.y * 4 + pp.y * i * 2, p.x - f.dir.x * (4 + L) + pp.x * i * 2, p.y - f.dir.y * (4 + L) + pp.y * i * 2, P[i === 0 ? 2 : 4]);
    }
    const spin = t / 35;
    const r0 = 4 + 2 * S;
    glow(g, p.x, p.y, f.glow, P[3], 0.8);
    ring(g, p.x, p.y, r0, P[1], 1, S, [spin, spin + Math.PI * 1.1]);
    ring(g, p.x, p.y, r0 - 1, P[0], 1, 1, [spin + 0.3, spin + Math.PI * 0.8]);
    ring(g, p.x, p.y, r0 + 1, P[3], 1, 1, [spin + 0.2, spin + Math.PI * 0.6]);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const at = tg.hit;
      const s = (6 + 3 * S) * outCubic(clamp01(t / 80));
      withAlpha(g, 1 - k, () => {
        line(g, at.x - s, at.y - s * 0.8, at.x + s, at.y + s * 0.8, t < 90 ? P[0] : P[2], S);
        line(g, at.x - s, at.y + s * 0.8, at.x + s, at.y - s * 0.8, t < 90 ? P[0] : P[2], S);
      });
      glow(g, at.x, at.y, f.glow, P[3], 1 - k);
      // redemoinho: pontos em espiral abrindo
      for (let i = 0; i < 14; i++) {
        const a = i * 0.9 + t / 60;
        const rr = (2 + i * 0.9) * (0.5 + k);
        dot(g, at.x + Math.cos(a) * rr, at.y + Math.sin(a) * rr * 0.6, 1, pal(P, 0.1 + i / 18 + k * 0.3));
      }
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 83, t, { n: 7, speed: [30, 70], life: [400, 700], angle: ang(f.dir), spread: 1.2, lift: 15 })) {
        withAlpha(g, 1 - k, () => line(g, tg.hit.x + b.x, tg.hit.y + b.y, tg.hit.x + b.x + 2, tg.hit.y + b.y - 1, pal(P, 0.3 + b.k * 0.5)));
      }
  },
};

/** Onda de uivo: arcos concêntricos emitidos em sequência (cone até o alvo, ou anel completo ao redor de si). */
const howl_wave: Archetype = {
  charge(f, k) {
    const { g, P } = f;
    for (let i = 0; i < 2; i++) withAlpha(g, k, () => ring(g, f.o.x, f.o.y, 2 + i * 2 + k * 2, P[2 + i], 0.8));
  },
  travel(f, u) {
    waves(f, u, 1);
  },
  impact(f, t, k) {
    waves(f, 1 + k * 0.4, 1 - k);
    for (const tg of f.targets) {
      shockRing(f, tg.hit, t, 200, 10, 0.7);
      if (t < 160) {
        const off = Math.sin(t / 12) * 2;
        ring(f.g, tg.hit.x + off, tg.hit.y, 5 + f.S * 2, f.P[2], 0.9);
      }
    }
  },
  residue(f, _t, k) {
    withAlpha(f.g, step8(0.6 * (1 - k)), () => {
      for (const tg of f.targets) ring(f.g, tg.feet.x, tg.feet.y, 6 + k * 8, f.P[4], 0.45);
    });
  },
};

function waves(f: VfxFrame, u: number, alpha: number): void {
  const { g, P, S } = f;
  const full = f.radius > 0 && f.self === false && Math.hypot(f.c.x - f.of.x, f.c.y - f.of.y) < 2;
  const reach = full ? f.radius : Math.hypot(f.end.x - f.o.x, f.end.y - f.o.y) + 4;
  const a0 = ang(f.dir);
  const halfArc = full ? Math.PI : 0.55 + 0.15 * S;
  const ctr = full ? { x: f.of.x, y: f.of.y - 4 } : f.o;
  for (let i = 0; i < 4; i++) {
    const uu = u - i * 0.18;
    if (uu <= 0 || uu > 1.25) continue;
    const r = 4 + uu * reach;
    const fade = alpha * (uu > 1 ? 1 - (uu - 1) / 0.25 : 1);
    withAlpha(g, step8(fade), () => {
      ring(g, ctr.x, ctr.y, r, i === 0 ? P[1] : P[2 + i], full ? 0.55 : 0.9, i === 0 ? S : 1, [a0 - halfArc, a0 + halfArc]);
      if (i === 0) glow(g, ctr.x + Math.cos(a0) * r * (full ? 0 : 1), ctr.y + Math.sin(a0) * r * (full ? 0 : 1), full ? 0 : f.glow * 0.6, P[3], 0.4 * fade);
    });
  }
}

/** Área no chão: círculo de aviso, erupções em anel, onda de choque, rachaduras brilhando no resíduo. */
const ground_aoe: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 6, 8);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    const n = 6 + 2 * S;
    const r = rand(f.seq * 89 + 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r() * 0.4;
      const rr = i === 0 ? 0 : f.radius * (0.35 + r() * 0.6);
      const x = f.c.x + Math.cos(a) * rr;
      const y = f.c.y + Math.sin(a) * rr * 0.5;
      const tt = t - i * 30;
      if (tt < 0) continue;
      const kk = clamp01(tt / 300);
      const h = (10 + 8 * S) * Math.sin(Math.PI * Math.min(1, kk * 1.2)) * (i === 0 ? 1.4 : 1);
      if (h < 1) continue;
      const w = 1 + S;
      glow(g, x, y - h / 2, 6 + 2 * S, P[3], 1 - kk);
      g.fillStyle = P[4];
      g.fillRect(R(x - w - 1), R(y - h), w * 2 + 3, R(h));
      g.fillStyle = P[3];
      g.fillRect(R(x - w), R(y - h), w * 2 + 1, R(h));
      g.fillStyle = P[1];
      g.fillRect(R(x - Math.max(0, w - 1)), R(y - h + 1), Math.max(1, (w - 1) * 2 + 1), R(h * 0.6));
      dot(g, x, y - h, 2, P[0]);
      for (const b of burst(f.seq * 97 + i, tt, { n: 4, speed: [20, 60], life: [200, 400], gravity: 200, angle: -Math.PI / 2, spread: 1.6 })) dot(g, x + b.x, y - h + b.y, 1, pal(P, 0.1 + b.k * 0.8));
    }
    shockRing(f, f.c, t, 320, f.radius + 6, 0.5, S);
    if (t < 80) glow(g, f.c.x, f.c.y - 4, f.radius, P[2], 1 - t / 80);
    void k;
  },
  residue(f, t, k) {
    for (let i = 0; i < 3; i++) smoke(f, { x: f.c.x + (i - 1) * f.radius * 0.5, y: f.c.y }, t, k, f.seq * 101 + i, 2, 4);
  },
  ground(f, phase, t, k) {
    const { g, P, S } = f;
    if (phase === "charge") {
      // círculo de aviso que se fecha + tracejado girando
      withAlpha(g, step8(0.4 + 0.6 * k), () => {
        ring(g, f.c.x, f.c.y, f.radius, P[3], 0.5);
        const n = 16;
        for (let i = 0; i < n; i += 2) ring(g, f.c.x, f.c.y, f.radius * (1.15 - 0.15 * k), P[2], 0.5, 1, [(i / n) * Math.PI * 2 + t / 200, ((i + 1) / n) * Math.PI * 2 + t / 200]);
        withAlpha(g, 0.3 * k, () => disk(g, f.c.x, f.c.y, f.radius * k, P[4], 0.5));
      });
    } else if (phase === "impact" || phase === "residue") {
      // rachaduras radiais que brilham e esfriam
      const r = rand(f.seq * 103);
      const col = phase === "impact" ? P[2] : pal(P, 0.45 + k * 0.5);
      const a = phase === "impact" ? 1 : 1 - k;
      withAlpha(g, step8(a), () => {
        for (let i = 0; i < 5 + S * 2; i++) {
          const a0 = r() * Math.PI * 2;
          let x = f.c.x;
          let y = f.c.y;
          for (let s = 0; s < 3; s++) {
            const a1 = a0 + (r() - 0.5) * 0.9;
            const L = f.radius * (0.2 + r() * 0.25);
            const nx = x + Math.cos(a1) * L;
            const ny = y + Math.sin(a1) * L * 0.5;
            line(g, x, y, nx, ny, col);
            x = nx;
            y = ny;
          }
        }
      });
      groundMark(f, f.c, f.radius * 0.8, "#181425", 0.25 * (phase === "impact" ? 1 : 1 - k));
    }
  },
};

/** Explosão sagrada: halo acima, coluna de luz descendo, cruz de luz com raios girando, anéis e partículas subindo. */
const holy_burst: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    const top = { x: f.c.x, y: f.c.y - 46 };
    withAlpha(g, k, () => ring(g, top.x, top.y, 6 + 2 * f.S, P[2], 0.35, 1));
    glow(g, top.x, top.y, f.glow * k, P[3], k);
    for (const b of burst(f.seq * 107, t, { n: 8, speed: [10, 30], life: [300, 500], gravity: 60 })) dot(g, top.x + b.x * 2, top.y + b.y, 1, P[1]);
    gather(f, f.o, k, t, 6, 8);
  },
  travel(f, u) {
    const { g, P, S } = f;
    const top = f.c.y - 120;
    const y = top + (f.c.y - top) * outCubic(u);
    const w = 2 + S;
    additive(g, () => {
      g.globalAlpha = 0.5;
      g.fillStyle = P[3];
      g.fillRect(R(f.c.x - w - 2), R(top), w * 2 + 5, R(y - top));
      g.globalAlpha = 1;
    });
    g.fillStyle = P[1];
    g.fillRect(R(f.c.x - w), R(top), w * 2 + 1, R(y - top));
    g.fillStyle = P[0];
    g.fillRect(R(f.c.x - 1), R(top), 3, R(y - top));
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    const at = { x: f.c.x, y: f.c.y - 8 };
    // coluna afinando
    const w = R((2 + S) * (1 - k));
    if (w > 0) {
      g.fillStyle = P[1];
      g.fillRect(R(at.x - w), R(at.y - 110), w * 2 + 1, 110 + 8);
    }
    glow(g, at.x, at.y, f.glow * (1.5 + 0.5 * S), P[2], 1 - k);
    // cruz de luz
    const s = (12 + 8 * S) * outBack(clamp01(t / 140)) * (1 - k * 0.6);
    withAlpha(g, 1 - k, () => {
      line(g, at.x - s, at.y, at.x + s, at.y, P[0], S);
      line(g, at.x, at.y - s * 1.3, at.x, at.y + s * 0.7, P[0], S);
      disk(g, at.x, at.y, 3 + S - k * 3, P[0]);
    });
    // raios girando
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t / 400;
      const r0 = 6 + 10 * k;
      const r1 = r0 + (6 + 4 * S) * (1 - k);
      withAlpha(g, step8(0.8 * (1 - k)), () => line(g, at.x + Math.cos(a) * r0, at.y + Math.sin(a) * r0 * 0.7, at.x + Math.cos(a) * r1, at.y + Math.sin(a) * r1 * 0.7, P[2]));
    }
    shockRing(f, f.c, t, 360, f.radius + 8, 0.5, S);
    shockRing(f, f.c, t - 80, 360, f.radius, 0.5, 1);
    for (const tg of f.targets) if (t < 120) disk(g, tg.hit.x, tg.hit.y, 2 + S, P[0]);
    for (const b of burst(f.seq * 109, t, { n: 16 + 6 * S, speed: [20, 70], life: [400, 700], lift: 50, squash: 0.7 })) dot(g, at.x + b.x, at.y + b.y, b.k < 0.3 ? 2 : 1, pal(P, b.k * 0.8));
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const b of burst(f.seq * 113, t, { n: 12, speed: [5, 25], life: [500, 800], lift: 30 })) {
      if ((b.i + Math.floor(t / 80)) % 3 === 0) plus(g, f.c.x + b.x * 2, f.c.y - 6 + b.y, 1, P[1]);
      else dot(g, f.c.x + b.x * 2, f.c.y - 6 + b.y, 1, P[2]);
    }
    void k;
  },
  ground(f, phase, _t, k) {
    if (phase === "impact" || phase === "residue") withAlpha(f.g, step8(0.35 * (1 - k)), () => disk(f.g, f.c.x, f.c.y, f.radius, f.P[3], 0.45));
  },
};

/** Relâmpago: faísca na origem, raio em zigue-zague do céu até o alvo (re-sorteado a cada 40 ms), estalos e queimado. */
const lightning: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    for (let i = 0; i < 3; i++) {
      const r = rand(f.seq * 127 + i + Math.floor(t / 50));
      const a = r() * Math.PI * 2;
      const L = 3 + r() * 5;
      zigzag(g, f.o.x, f.o.y, f.o.x + Math.cos(a) * L, f.o.y + Math.sin(a) * L, 3, 2, f.seq + i + Math.floor(t / 50), P[2]);
    }
    glow(g, f.o.x, f.o.y, f.glow * k, P[3], k);
    // nuvem de carga acima do alvo
    for (const tg of f.targets) withAlpha(g, step8(0.6 * k), () => disk(g, tg.hit.x, tg.hit.y - 60, 8 + 4 * f.S * k, P[5], 0.4));
  },
  travel(f, u) {
    for (const tg of f.targets) bolt(f, { x: tg.hit.x, y: tg.hit.y - 64 }, lerp({ x: tg.hit.x, y: tg.hit.y - 64 }, tg.feet, u), 0);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      if (k < 0.55 && Math.floor(t / 45) % 3 !== 2) bolt(f, { x: tg.hit.x, y: tg.hit.y - 64 }, tg.feet, t);
      glow(g, tg.hit.x, tg.hit.y, f.glow * 1.4, P[3], 1 - k);
      shockRing(f, tg.feet, t, 240, 12 + 4 * S, 0.45, S);
      // estalos rastejando ao redor
      for (let i = 0; i < 3 + S; i++) {
        const r = rand(f.seq * 131 + i + Math.floor(t / 60));
        const a = r() * Math.PI * 2;
        const L = 6 + r() * 8;
        if (k < 0.8) zigzag(g, tg.hit.x, tg.hit.y, tg.hit.x + Math.cos(a) * L, tg.hit.y + Math.sin(a) * L * 0.7, 3, 2, f.seq * 7 + i + Math.floor(t / 60), P[1]);
      }
      sparks(f, tg.hit, t, f.seq * 137, 10, 120, 200);
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets) {
      if (Math.floor(t / 70) % 3 === 0 && k < 0.7) {
        const r = rand(f.seq * 139 + Math.floor(t / 70));
        zigzag(g, tg.hit.x + (r() - 0.5) * 8, tg.hit.y + (r() - 0.5) * 8, tg.hit.x + (r() - 0.5) * 14, tg.hit.y + (r() - 0.5) * 10, 3, 2, f.seq + Math.floor(t / 70), P[2]);
      }
      smoke(f, tg.feet, t, k, f.seq * 149, 3, 5);
    }
  },
  ground(f, phase, _t, k) {
    if (phase === "impact" || phase === "residue") for (const tg of f.targets) groundMark(f, tg.feet, 7 + 2 * f.S, "#181425", 0.35 * (1 - k * (phase === "residue" ? 1 : 0)));
  },
};

function bolt(f: VfxFrame, from: Vec, to: Vec, t: number): void {
  const { g, P, S, now } = f;
  const seed = f.seq * 151 + Math.floor((now + t) / 40);
  additive(g, () => {
    g.globalAlpha = 0.5;
    zigzag(g, from.x, from.y, to.x, to.y, 7, 7, seed, P[4], 3 + S);
    g.globalAlpha = 1;
  });
  const pts = zigzag(g, from.x, from.y, to.x, to.y, 7, 7, seed, P[2], 1 + S);
  zigzag(g, from.x, from.y, to.x, to.y, 7, 7, seed, P[0], 1);
  // galho
  const r = rand(seed + 1);
  const j = 2 + Math.floor(r() * 3);
  if (pts[j]) zigzag(g, pts[j].x, pts[j].y, pts[j].x + (r() - 0.5) * 20, pts[j].y + 6 + r() * 10, 3, 3, seed + 2, P[2]);
}

/** Maldição/debuff: selo na origem, orbe escuro serpenteando, selo girando no alvo, espiral entrando, setas para baixo. */
const debuff_hex: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    sigil(f, f.of, 6 + 3 * k, t, k);
    glow(g, f.o.x, f.o.y, f.glow * k, P[3], k);
  },
  travel(f, u, t) {
    const { g, P, S } = f;
    const pp = perp(f.dir);
    for (let i = 6; i >= 0; i--) {
      const uu = Math.max(0, u - i * 0.04);
      const p = lerp(f.o, f.d, uu);
      const w = Math.sin(uu * Math.PI * 4) * 4;
      const x = p.x + pp.x * w;
      const y = p.y + pp.y * w;
      if (i === 0) {
        glow(g, x, y, f.glow, P[3], 1);
        disk(g, x, y, 2 + S, P[5]);
        disk(g, x, y, 1 + S, P[3]);
        dot(g, x, y - 1, 1, P[1]);
      } else dot(g, x, y, i < 3 ? 2 : 1, pal(P, 0.3 + i * 0.08));
    }
    void t;
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      sigil(f, tg.feet, 9 + 3 * S, t, 1 - k);
      // espiral entrando no alvo
      for (let i = 0; i < 12; i++) {
        const u = (k * 1.4 + i / 12) % 1;
        const a = i * 0.52 + u * 5;
        const rr = (14 + 4 * S) * (1 - u);
        dot(g, tg.hit.x + Math.cos(a) * rr, tg.hit.y + Math.sin(a) * rr * 0.7, u > 0.7 ? 2 : 1, pal(P, 0.2 + (1 - u) * 0.5));
      }
      glow(g, tg.hit.x, tg.hit.y, f.glow, P[4], 1 - k);
      for (let i = 0; i < 3; i++) {
        const kk = clamp01(k * 1.6 - i * 0.2);
        if (kk > 0 && kk < 1) withAlpha(g, 1 - kk, () => arrow(g, tg.hit.x + (i - 1) * 7, tg.hit.y - 14 + kk * 12, 2, P[2], 1));
      }
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 157, t, { n: 6, speed: [3, 10], life: [500, 900], lift: 18 })) withAlpha(g, step8(1 - b.k), () => dot(g, tg.hit.x + b.x * 2, tg.hit.y + b.y, 1, P[3 + (b.i % 2)]));
    void k;
  },
};

/** Selo: anel duplo achatado com runas (pontos) girando e um triângulo. */
function sigil(f: VfxFrame, at: Vec, r: number, t: number, a: number): void {
  const { g, P } = f;
  if (a <= 0) return;
  withAlpha(g, step8(a), () => {
    ring(g, at.x, at.y, r, P[3], 0.45);
    ring(g, at.x, at.y, r - 2, P[4], 0.45);
    for (let i = 0; i < 5; i++) {
      const aa = (i / 5) * Math.PI * 2 + t / 220;
      dot(g, at.x + Math.cos(aa) * (r - 1), at.y + Math.sin(aa) * (r - 1) * 0.45, 2, P[2]);
    }
    const tri = [0, 1, 2].map((i) => {
      const aa = (i / 3) * Math.PI * 2 - t / 300;
      return { x: at.x + Math.cos(aa) * (r - 3), y: at.y + Math.sin(aa) * (r - 3) * 0.45 };
    });
    for (let i = 0; i < 3; i++) line(g, tri[i].x, tri[i].y, tri[(i + 1) % 3].x, tri[(i + 1) % 3].y, P[4]);
  });
}

/** Aura de buff: anéis nos pés, colunas de partículas subindo, setas para cima e brilho pulsando no corpo. */
const buff_aura: Archetype = {
  charge(f, k) {
    withAlpha(f.g, k, () => ring(f.g, f.of.x, f.of.y, 4 + 6 * k, f.P[3], 0.45, 1));
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const pulse = 0.6 + 0.4 * Math.sin(t / 60);
      glow(g, tg.hit.x, tg.hit.y, f.glow * (1 + 0.3 * S), P[3], (1 - k) * pulse);
      // colunas: partículas subindo em volta do corpo
      for (let i = 0; i < 18; i++) {
        const r = rand(f.seq * 163 + i);
        const a = r() * Math.PI * 2;
        const rr = 6 + r() * 6;
        const ph = (t / (380 + r() * 200) + r()) % 1;
        const x = tg.feet.x + Math.cos(a) * rr;
        const y = tg.feet.y + Math.sin(a) * rr * 0.45 - ph * (22 + 6 * S);
        if (k > 0.85 && ph > 0.5) continue;
        dot(g, x + Math.sin(ph * 6 + i) * 1.5, y, ph < 0.3 ? 2 : 1, pal(P, 0.1 + ph * 0.7));
      }
      for (let i = 0; i < 3; i++) {
        const kk = (k * 1.5 + i * 0.33) % 1;
        withAlpha(g, step8(1 - kk), () => arrow(g, tg.feet.x + (i - 1) * 9, tg.feet.y - 8 - kk * 18, 2, P[1 + i], -1));
      }
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 167, t, { n: 8, speed: [4, 14], life: [400, 700], lift: 24 })) if ((b.i + Math.floor(t / 90)) % 2) dot(g, tg.hit.x + b.x * 2, tg.hit.y + b.y, 1, P[1]);
    void k;
  },
  ground(f, phase, t, k) {
    if (phase !== "impact") return;
    for (const tg of f.targets) {
      for (let i = 0; i < 2; i++) {
        const kk = ((t / 420 + i * 0.5) % 1);
        withAlpha(f.g, step8((1 - kk) * (1 - k * 0.5)), () => ring(f.g, tg.feet.x, tg.feet.y, 4 + kk * 14, f.P[2 + i], 0.45, 1));
      }
    }
  },
};

/** Cura: brilho suave, cruzes verdes subindo, faíscas e anel nos pés. */
const heal: Archetype = {
  charge(f, k) {
    withAlpha(f.g, k, () => ring(f.g, f.of.x, f.of.y, 3 + 5 * k, f.P[3], 0.45));
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      glow(g, tg.hit.x, tg.hit.y, f.glow * (1.2 + 0.3 * S), P[2], 1 - k);
      for (let i = 0; i < 5 + 2 * S; i++) {
        const r = rand(f.seq * 173 + i);
        const ph = clamp01((k - r() * 0.4) / 0.6);
        if (ph <= 0 || ph >= 1) continue;
        const x = tg.hit.x + (r() - 0.5) * 18;
        const y = tg.hit.y + 6 - ph * (24 + 8 * S);
        withAlpha(g, step8(1 - ph * ph), () => {
          plus(g, x, y, ph < 0.2 ? 3 : 2, P[3]);
          plus(g, x, y, 1, P[0]);
        });
      }
      for (const b of burst(f.seq * 179, t, { n: 10, speed: [8, 24], life: [300, 600], lift: 30 })) dot(g, tg.hit.x + b.x * 1.5, tg.hit.y + b.y, 1, pal(P, b.k * 0.6));
    }
  },
  residue(f, t) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 181, t, { n: 6, speed: [2, 8], life: [400, 700], lift: 16 })) if ((b.i + Math.floor(t / 100)) % 2) dot(g, tg.hit.x + b.x * 3, tg.hit.y + b.y, 1, P[1]);
  },
  ground(f, phase, _t, k) {
    if (phase !== "impact") return;
    for (const tg of f.targets) {
      withAlpha(f.g, step8(0.8 * (1 - k)), () => ring(f.g, tg.feet.x, tg.feet.y, 6 + k * 8, f.P[3], 0.45, 1));
      withAlpha(f.g, step8(0.25 * (1 - k)), () => disk(f.g, tg.feet.x, tg.feet.y, 8, f.P[2], 0.45));
    }
  },
};

/** Lâmina de energia: corte longo com pós-imagens (rastro), núcleo branco, faíscas elétricas e brilho. */
const energy_blade: Archetype = {
  charge(f, k, t) {
    const { g, P } = f;
    // energia correndo pela lâmina (atacante): risco curto que se acende
    const L = 4 + 6 * k;
    withAlpha(g, k, () => line(g, f.o.x - f.dir.x * 2, f.o.y - 4, f.o.x + f.dir.x * L, f.o.y - 4 - L * 0.5, P[2 + (Math.floor(t / 40) % 2)]));
    glow(g, f.o.x, f.o.y - 4, f.glow * 0.7 * k, P[3], k);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    const a = ang(f.dir) + Math.PI / 2 + 0.35;
    const len = 12 + 6 * S;
    for (const tg of f.targets) {
      const sweep = outCubic(clamp01(t / 80));
      // 4 pós-imagens atrás do golpe: cada uma um pouco mais girada e mais escura
      for (let i = 3; i >= 0; i--) {
        const ai = a - i * 0.22 * (1 - sweep * 0.3);
        const fade = clamp01(1 - k * 1.1) * (1 - i * 0.22);
        if (fade <= 0) continue;
        const ux = Math.cos(ai);
        const uy = Math.sin(ai);
        const shown = len * (i === 0 ? sweep : 1);
        withAlpha(g, step8(fade), () => {
          if (i === 0) {
            additive(g, () => line(g, tg.hit.x - ux * shown, tg.hit.y - uy * shown, tg.hit.x + ux * shown, tg.hit.y + uy * shown, P[3], 3 + S));
            line(g, tg.hit.x - ux * shown, tg.hit.y - uy * shown, tg.hit.x + ux * shown, tg.hit.y + uy * shown, P[1], 1 + S);
            line(g, tg.hit.x - ux * shown * 0.8, tg.hit.y - uy * shown * 0.8, tg.hit.x + ux * shown * 0.8, tg.hit.y + uy * shown * 0.8, P[0]);
          } else line(g, tg.hit.x - ux * shown, tg.hit.y - uy * shown, tg.hit.x + ux * shown, tg.hit.y + uy * shown, P[2 + i]);
        });
      }
      glow(g, tg.hit.x, tg.hit.y, f.glow * 1.2, P[2], 1 - k);
      if (t < 60) disk(g, tg.hit.x, tg.hit.y, 2 + S, P[0]);
      // arcos elétricos curtos saindo do ponto de corte
      for (let i = 0; i < 2 + S; i++) {
        const r = rand(f.seq * 191 + i + Math.floor(t / 50));
        const aa = r() * Math.PI * 2;
        const L = 5 + r() * 7;
        if (k < 0.8) zigzag(g, tg.hit.x, tg.hit.y, tg.hit.x + Math.cos(aa) * L, tg.hit.y + Math.sin(aa) * L * 0.7, 3, 2, f.seq + i + Math.floor(t / 50), P[1]);
      }
      sparks(f, tg.hit, t, f.seq * 193, 8 + 2 * S, 120, 160, 0, ang(f.dir), 1.6);
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets)
      for (const b of burst(f.seq * 197, t, { n: 6, speed: [6, 20], life: [200, 400], lift: 20 })) withAlpha(g, step8(1 - k), () => dot(g, tg.hit.x + b.x, tg.hit.y + b.y, 1, pal(P, 0.1 + b.k * 0.5)));
  },
};

/** Golpes em sequência: `count` impactos curtos em pontos próximos (alternando lados), cada um com estrela e faíscas. */
const multi_hit_flurry: Archetype = {
  impact(f, t, k) {
    const { g, P, S } = f;
    const n = Math.min(6, Math.max(3, f.count));
    const gap = 26;
    for (const tg of f.targets) {
      for (let i = 0; i < n; i++) {
        const tt = t - i * gap;
        if (tt < 0 || tt > 140) continue;
        const r = rand(f.seq * 199 + i);
        const at = { x: tg.hit.x + (r() - 0.5) * 10, y: tg.hit.y + (r() - 0.5) * 8 };
        const kk = tt / 140;
        const s = (3 + 2 * S) * (1 - kk * 0.5);
        withAlpha(g, step8(1 - kk), () => {
          if (tt < 40) glow(g, at.x, at.y, 6 + 2 * S, P[2], 1);
          line(g, at.x - s, at.y, at.x + s, at.y, tt < 40 ? P[0] : P[2]);
          line(g, at.x, at.y - s, at.x, at.y + s, tt < 40 ? P[0] : P[2]);
          ring(g, at.x, at.y, 2 + kk * (6 + 2 * S), P[3], 0.8);
          // riscos de impacto no sentido do golpe
          const pp = perp(f.dir);
          for (const o of [-2, 2]) line(g, at.x - f.dir.x * (4 + 6 * kk) + pp.x * o, at.y - f.dir.y * (4 + 6 * kk) + pp.y * o, at.x - f.dir.x * (8 + 8 * kk) + pp.x * o, at.y - f.dir.y * (8 + 8 * kk) + pp.y * o, P[1]);
        });
        sparks(f, at, tt, f.seq * 211 + i, 5, 80, 220);
      }
    }
    void k;
  },
  residue(f, t, k) {
    for (const tg of f.targets) smoke(f, tg.feet, t, k, f.seq * 223, 3, 6);
  },
};

/** Tornado no chão: funil de anéis achatados girando e subindo, detritos orbitando, poeira na base. */
const tornado_field: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 6, 10);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    const H = (26 + 10 * S) * outCubic(clamp01(t / 120));
    const spin = t / 45;
    const fade = k > 0.75 ? 1 - (k - 0.75) / 0.25 : 1;
    withAlpha(g, step8(fade), () => {
      for (let i = 0; i < 9; i++) {
        const u = i / 8;
        const y = f.c.y - u * H;
        const r = (3 + u * (f.radius * 0.9)) * (0.85 + 0.15 * Math.sin(spin + i));
        const sway = Math.sin(spin * 0.6 + u * 3) * 3 * u;
        ring(g, f.c.x + sway, y, r, P[Math.min(6, 1 + (i % 3))], 0.32, 1, [spin + i, spin + i + Math.PI * 1.3]);
      }
      glow(g, f.c.x, f.c.y - H / 2, f.radius, P[2], 0.6);
      // detritos orbitando
      for (let i = 0; i < 10 + 2 * S; i++) {
        const r = rand(f.seq * 227 + i);
        const u = r();
        const a = spin * (1.2 + r()) + r() * 6;
        const rr = 4 + u * f.radius;
        dot(g, f.c.x + Math.cos(a) * rr, f.c.y - u * H + Math.sin(a) * rr * 0.3, r() < 0.3 ? 2 : 1, pal(P, 0.2 + r() * 0.7));
      }
    });
    for (const tg of f.targets) if (t < 90) disk(g, tg.hit.x, tg.hit.y, 2, P[0]);
    shockRing(f, f.c, t, 300, f.radius + 4, 0.45);
  },
  residue(f, t, k) {
    for (let i = 0; i < 3; i++) smoke(f, { x: f.c.x + (i - 1) * f.radius * 0.6, y: f.c.y }, t, k, f.seq * 229 + i, 2, 4);
  },
  ground(f, phase, t, k) {
    if (phase === "charge") withAlpha(f.g, step8(k), () => ring(f.g, f.c.x, f.c.y, f.radius * (0.5 + 0.5 * k), f.P[3], 0.45, 1, [t / 90, t / 90 + Math.PI * 1.5]));
    if (phase === "impact") withAlpha(f.g, step8(0.3 * (1 - k)), () => disk(f.g, f.c.x, f.c.y, f.radius, f.P[4], 0.45));
  },
};

/** Prisão de gelo: cristais brotam do chão em volta do alvo e fecham um bloco translúcido, depois racham. */
const freeze_bind: Archetype = {
  charge(f, k, t) {
    gather(f, f.o, k, t, 8, 10);
  },
  launch(f, t) {
    muzzle(f, f.o, t);
  },
  travel(f, u) {
    const { g, P } = f;
    // rastro de gelo no chão até o alvo
    const p = lerp(f.of, f.df, u);
    for (let i = 0; i < 6; i++) {
      const q = lerp(f.of, f.df, Math.max(0, u - i * 0.08));
      shard(g, q.x, q.y - 2, -Math.PI / 2, 2 + (i === 0 ? 2 : 0), 1, P[3], P[1]);
    }
    glow(g, p.x, p.y - 2, f.glow * 0.6, P[3], 1);
  },
  impact(f, t, k) {
    const { g, P, S } = f;
    for (const tg of f.targets) {
      const grow = outBack(clamp01(t / 120));
      const n = 6 + 2 * S;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = tg.feet.x + Math.cos(a) * (7 + S);
        const y = tg.feet.y + Math.sin(a) * (3 + S * 0.5);
        const h = (6 + 4 * S + (i % 2) * 3) * grow;
        shard(g, x, y - h / 2, -Math.PI / 2 + Math.cos(a) * 0.25, h / 2 + 1, 1 + (i % 2), P[3], P[1]);
      }
      // bloco translúcido sobre o corpo
      const top = tg.hit.y - 8;
      withAlpha(g, step8(0.35 * grow * (1 - k * 0.5)), () => {
        g.fillStyle = P[2];
        g.fillRect(Math.round(tg.feet.x - 7 - S), Math.round(top), 15 + 2 * S, Math.round(tg.feet.y - top));
      });
      withAlpha(g, grow, () => {
        line(g, tg.feet.x - 7 - S, top, tg.feet.x + 7 + S, top, P[1]);
        dot(g, tg.feet.x - 4, top + 2, 1, P[0]);
      });
      glow(g, tg.hit.x, tg.hit.y, f.glow, P[3], 1 - k);
    }
  },
  residue(f, t, k) {
    const { g, P } = f;
    for (const tg of f.targets) {
      // trincas no bloco e lascas caindo
      withAlpha(g, step8(1 - k), () => zigzag(g, tg.hit.x - 4, tg.hit.y - 6, tg.hit.x + 3, tg.hit.y + 6, 4, 3, f.seq * 233, P[0]));
      for (const b of burst(f.seq * 239, t, { n: 8, speed: [20, 60], life: [200, 400], gravity: 260 })) shard(g, tg.hit.x + b.x, tg.hit.y + b.y, b.i, 2, 1, pal(P, 0.2 + b.k * 0.6));
    }
  },
  ground(f, phase, _t, k) {
    if (phase === "impact" || phase === "residue") for (const tg of f.targets) groundMark(f, tg.feet, 9 + 2 * f.S, f.P[2], 0.35 * (phase === "residue" ? 1 - k : 1));
  },
};

export const ARCHETYPES: Record<string, Archetype> = {
  energy_blade,
  multi_hit_flurry,
  tornado_field,
  freeze_bind,
  melee_impact,
  slash,
  fire_bolt,
  ice_shard,
  beam,
  flame_breath,
  bubbles,
  wind_cutter,
  howl_wave,
  ground_aoe,
  holy_burst,
  lightning,
  debuff_hex,
  buff_aura,
  heal,
};
