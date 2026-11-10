// P8 — HUD v2 (quality-overhaul/phase2/design/P8_HUD_V2_SPEC.md), só os itens P0 (§9), atrás de ?hud=v2.
// Sem a flag o HUD atual fica como está: nada aqui roda e nenhuma classe nova entra no DOM.
// Puro e testável: flag, faixas de PV da moldura reativa (§2.1), cores da paleta funcional (§1.3) e o HTML do
// bloco novo do Tamer (§4.1). Arte provisória em código (sem PixelLab): moldura em CSS, retrato do Tamer como
// placeholder com moldura — o recorte do sprite fica parametrizável (TAMER_PORTRAIT_CROP) e DESLIGADO até o
// game-art fechar a escala do Tamer (ART_DIRECTION_V2.md; condição 1 do QA_P8_AND_V3FIX.md §1.4).

import type { MoveType } from "../sim/types";

export type HudVariant = "v1" | "v2";

/** ?hud=v2 liga o HUD v2; qualquer outro valor (ou ausente) mantém o HUD atual. */
export function hudVariantOf(params: URLSearchParams): HudVariant {
  return params.get("hud") === "v2" ? "v2" : "v1";
}

export type HpTier = "ok" | "warn" | "crit";

/** §2.1: PV ≥ 50% verde; 20–49% dourado; < 20% vermelho pulsante. `pct` em 0..100 (frações arredondadas antes). */
export function hpTier(pct: number): HpTier {
  if (!(pct >= 20)) return "crit";
  return pct >= 50 ? "ok" : "warn";
}

/** Percentual inteiro de PV (0..100), 0 quando não há máximo. */
export function hpPct(hp: number, maxHp: number): number {
  return maxHp > 0 ? Math.max(0, Math.min(100, Math.floor((hp / maxHp) * 100))) : 0;
}

/** §2.1 — cor da borda por faixa (tokens --ui-green / --ui-gold / --ui-red do style.css). */
export const TIER_COLORS: Record<HpTier, string> = { ok: "#63c74d", warn: "#e8b84a", crit: "#e43b44" };

/** §1.3 — raridade (tokens --ui-dim / --ui-green / --ui-cyan / --ui-gold). */
export const RARITY_V2: Record<string, string> = {
  common: "#8b93b0",
  uncommon: "#63c74d",
  rare: "#2ce8f5",
  very_rare: "#e8b84a",
};

export const rarityColor = (r: string | undefined): string => RARITY_V2[r ?? ""] ?? RARITY_V2.common;

/**
 * §1.3/§4.4 — categoria do golpe na hotbar. `bg` é o token .chip.k-* (fundo do slot); `border` é a cor de acento
 * do mockup hotbar_target.svg (o fundo escuro do k-* como borda de 3 px não se lê sobre o painel): físico laranja,
 * especial azul, buff dourado, cura verde; debuff usa o acento do atributo Vírus (#c77ad1), que o mockup não traz.
 */
export const MOVE_KIND_V2: Record<MoveType, { bg: string; border: string; label: string }> = {
  physical: { bg: "#4a2f2a", border: "#feae34", label: "Físico" },
  special: { bg: "#2a3550", border: "#9ad4ff", label: "Especial" },
  buff: { bg: "#4a3f1f", border: "#ffd66b", label: "Buff" },
  debuff: { bg: "#3e2153", border: "#c77ad1", label: "Debuff" },
  heal: { bg: "#1f4a2f", border: "#8fe07a", label: "Cura" },
};

/** §1.3 — acento do atributo (anel do retrato do parceiro, §4.1). */
export const AFFINITY_V2: Record<string, string> = {
  vaccine: "#4fa8ff",
  data: "#8fe07a",
  virus: "#c77ad1",
  free: "#b8c2d8",
};

export const affinityColor = (a: string | undefined): string => AFFINITY_V2[a ?? ""] ?? AFFINITY_V2.free;

/**
 * Recorte do retrato mini do Tamer (§4.1, 48×48) no sprite sul. `null` = placeholder com moldura.
 * Fica nulo de propósito: a escala do Tamer está em decisão no game-art (QA §1.2.1 — recortar 48 px de um sprite
 * de ~30 px sairia ampliado/borrado). Quando a escala fechar, preencher com o retângulo em px do sprite e uma
 * escala INTEIRA (nearest-neighbor) — sem reamostragem fracionária.
 */
export interface TamerPortraitCrop {
  /** Retângulo no quadro sul do sprite (px de arte). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Escala inteira aplicada ao recorte (1, 2, 3...). */
  scale: number;
}

export const TAMER_PORTRAIT_CROP: TamerPortraitCrop | null = null;

export interface TamerVitals {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  /** Energia do Tamer: só visual (sem regra na sim — §12 da spec, decisão de game-dev pendente). */
  energy: number;
  maxEnergy: number;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Bloco TAMER (§4.1, 120×88): retrato mini 48×48, "Nome Lv.N", PV 68×7 e Energia 68×5. */
export function tamerBlockHtml(v: TamerVitals): string {
  const hp = hpPct(v.hp, v.maxHp);
  const en = hpPct(v.energy, v.maxEnergy);
  return `<div class="hud-tamer f1 tier-${hpTier(hp)}" data-testid="tamer" data-tier="${hpTier(hp)}">
      <div class="tp-ph" data-testid="tamer-portrait" title="Retrato provisório — recorte aguardando a escala do Tamer (game-art)"><span>TAMER</span></div>
      <div class="tinfo">
        <div class="tname"><b data-testid="tamer-name">${esc(v.name)}</b> <span>Lv.<i data-testid="tamer-lv">${v.level}</i></span></div>
        <div class="tbar hp" title="PV do Tamer"><i data-testid="tamer-hp" style="width:${hp}%"></i></div>
        <div class="tbar en" title="Energia do Tamer (provisório: ainda sem regra de consumo)"><i data-testid="tamer-en" style="width:${en}%"></i></div>
      </div>
    </div>`;
}
