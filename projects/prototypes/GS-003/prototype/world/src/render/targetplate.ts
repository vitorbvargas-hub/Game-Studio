// P8 — placa de alvo / identificação do selvagem (P8_HUD_V2_SPEC.md §4.3.1 e §8.1), só com ?hud=v2.
// Desenhada na camada de nomes (resolução de tela), não no canvas do mundo: as medidas da spec são px de tela
// (?dpr=1) e o mundo é ampliado ×3 — uma placa de 20 px no mundo viraria 60 px na tela.
//
// Uma peça só, em dois momentos:
//   intro  — o selvagem do GS-012 pousou (encounterFx: T_LAND..T_FIGHT): nome + Nv., borda de raridade, NOVO
//   alvo   — a sim pôs a parceira em combate (T_FIGHT em diante, ou qualquer alvo fora da grama): ganha a 2ª linha,
//            barra de PV de 4 px (cor pela faixa do §2.1), e fica enquanto ele for o alvo da parceira
// O momento vem da própria sequência do encontro (encounterFx), então a placa nunca atrasa o início do combate
// (critério 10.3 na redação corrigida do QA_P8_AND_V3FIX.md §1.2.2).

import { hpTier, rarityColor, TIER_COLORS } from "../ui/hud-v2";

export interface TargetPlate {
  id: string;
  name: string;
  level: number;
  rarity: string;
  /** Selo NOVO (1ª vez da espécie) — só na intro. */
  isNew: boolean;
  /** PV em 0..100; ausente = intro (sem barra). */
  hpPct?: number;
  alpha: number;
  /** Muito raro: 2 cintilações nos cantos (P2 da spec; mantido do encounterFx atual). */
  sparkle?: boolean;
}

/** Medidas em px de tela a 1× (§4.3.1/§8.1). */
export const PLATE = {
  h: 20,
  minW: 64,
  pad: 4,
  border: 2,
  barH: 4,
  barGap: 2,
  bg: "rgba(10, 12, 18, 0.72)",
  newW: 28,
  newH: 14,
  newBg: "#e8b84a",
  newText: "#171a26",
} as const;

export function plateFont(k: number): string {
  return `700 ${12 * k}px Ubuntu, "DejaVu Sans", system-ui, sans-serif`;
}

/** Largura/altura da placa (px de tela) para um texto de `textW` px já medido na fonte da placa. */
export function plateSize(textW: number, withBar: boolean, k = 1): { w: number; h: number } {
  const w = Math.max(PLATE.minW * k, Math.ceil(textW) + 2 * (PLATE.pad + PLATE.border) * k);
  const h = (PLATE.h + (withBar ? PLATE.barH + PLATE.barGap : 0)) * k;
  return { w, h };
}

export const plateText = (p: Pick<TargetPlate, "name" | "level">): string => `${p.name} Nv.${p.level}`;

/**
 * Desenha a placa centrada em `cx`, com a base em `bottom` (px do canvas de nomes). `k` = px do canvas por px CSS
 * (devicePixelRatio, inteiro). Devolve o retângulo usado.
 */
export function drawTargetPlate(ctx: CanvasRenderingContext2D, p: TargetPlate, cx: number, bottom: number, k = 1): { x: number; y: number; w: number; h: number } {
  const text = plateText(p);
  ctx.save();
  ctx.font = plateFont(k);
  const tw = ctx.measureText(text).width;
  const withBar = p.hpPct !== undefined;
  const { w, h } = plateSize(tw, withBar, k);
  const x = Math.round(cx - w / 2);
  const y = Math.round(bottom - h);
  const b = PLATE.border * k;
  ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
  ctx.fillStyle = PLATE.bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = rarityColor(p.rarity);
  ctx.fillRect(x, y, w, b);
  ctx.fillRect(x, y + h - b, w, b);
  ctx.fillRect(x, y, b, h);
  ctx.fillRect(x + w - b, y, b, h);
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3 * k;
  ctx.strokeStyle = "#0b0d13";
  const ty = y + Math.round((PLATE.h * k) / 2) + k;
  const tx = Math.round(cx - tw / 2);
  ctx.strokeText(text, tx, ty);
  ctx.fillStyle = "#e6e9f2";
  ctx.fillText(text, tx, ty);
  if (withBar) {
    const bx = x + b + PLATE.pad * k;
    const bw = w - 2 * (b + PLATE.pad * k);
    const by = y + PLATE.h * k - k;
    ctx.fillStyle = "#262b40";
    ctx.fillRect(bx, by, bw, PLATE.barH * k);
    ctx.fillStyle = TIER_COLORS[hpTier(p.hpPct!)];
    ctx.fillRect(bx, by, Math.max(p.hpPct! > 0 ? k : 0, Math.round((bw * p.hpPct!) / 100)), PLATE.barH * k);
  }
  if (p.isNew) {
    const nw = PLATE.newW * k;
    const nh = PLATE.newH * k;
    const nx = x + w - nw + 4 * k;
    const ny = y - nh + 4 * k;
    ctx.fillStyle = "#0b0d13";
    ctx.fillRect(nx - k, ny - k, nw + 2 * k, nh + 2 * k);
    ctx.fillStyle = PLATE.newBg;
    ctx.fillRect(nx, ny, nw, nh);
    ctx.font = `700 ${9 * k}px Ubuntu, "DejaVu Sans", system-ui, sans-serif`;
    ctx.fillStyle = PLATE.newText;
    ctx.textAlign = "center";
    ctx.fillText("NOVO", nx + nw / 2, ny + nh / 2 + k);
    ctx.textAlign = "left";
  }
  if (p.sparkle) {
    ctx.fillStyle = "#fff6c0";
    ctx.fillRect(x - k, y - k, 3 * k, 3 * k);
    ctx.fillRect(x + w - 2 * k, y + h - 2 * k, 3 * k, 3 * k);
  }
  ctx.restore();
  return { x, y, w, h };
}

/** Intro de um encontro aleatório, como o encounterFx a expõe. */
export interface PlateIntro {
  id: string;
  name: string;
  level: number;
  rarity: string;
  isNew: boolean;
  /** ms desde o sorteio (wild_appear). */
  t: number;
}

export interface PlateTarget {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  rarity: string;
}

/** Janela da placa dentro da sequência do encounterFx (ms desde o sorteio). */
export interface PlateTiming {
  land: number;
  fight: number;
  fadeFrom: number;
  end: number;
}

/**
 * Quais placas mostrar agora. Regra pura (testada): a intro aparece no pouso; no início do combate, se o selvagem
 * é o alvo da parceira, a mesma placa ganha a barra de PV e fica; senão some como antes (fadeFrom..end).
 */
export function platesFor(intro: PlateIntro | undefined, target: PlateTarget | undefined, tm: PlateTiming, sparkleOn = false): TargetPlate[] {
  const out: TargetPlate[] = [];
  const introLive = intro && intro.t >= tm.land && intro.t < tm.end;
  if (intro && introLive && (!target || target.id !== intro.id || intro.t < tm.fight)) {
    const fade = intro.t > tm.fadeFrom ? Math.max(0, 1 - (intro.t - tm.fadeFrom) / (tm.end - tm.fadeFrom)) : 1;
    const isTarget = target?.id === intro.id;
    out.push({ id: intro.id, name: intro.name, level: intro.level, rarity: intro.rarity, isNew: intro.isNew, alpha: isTarget ? 1 : fade, sparkle: sparkleOn && intro.rarity === "very_rare" });
  }
  // selvagem ainda escondido na grama (antes do pouso): nada de placa, nem de alvo
  const hidden = intro && target && intro.id === target.id && intro.t < tm.land;
  if (target && !hidden && !out.some((p) => p.id === target.id)) {
    const pct = target.maxHp > 0 ? Math.max(0, Math.min(100, Math.floor((target.hp / target.maxHp) * 100))) : 0;
    const fresh = intro && intro.id === target.id && introLive;
    out.push({ id: target.id, name: target.name, level: target.level, rarity: target.rarity, isNew: !!fresh && intro!.isNew, hpPct: pct, alpha: 1, sparkle: !!fresh && sparkleOn && target.rarity === "very_rare" });
  }
  return out;
}
