// Modo ?mon=official (decisão do fundador, 2026-11-11: fan game, os Digimon iguais aos oficiais): Guilmon e Gabumon
// com os sprites de MAPA oficiais do Digimon World DS recortados direto da folha (CREATURE-0018-guilmon-official e
// CREATURE-0019-gabumon-official, scripts/build-official-mons.mjs), em TODAS as entidades dessas espécies (parceira,
// selvagens, modelos de captura). Só apresentação: a sim continua com CREATURE-0003/0009 (stats, golpes, elemento).
//
// ?monscale=1|2|auto escolhe a escala de exibição desses visuais (inteira, sem blur):
//   1    nativa do DS (Guilmon 31 px, Gabumon 29 px de altura parado);
//   2    ×2 inteira;
//   auto o inteiro que deixa a altura parada mais perto da faixa 48–64 px (ART_DIRECTION_V2 §1.5) — hoje ×2 nos dois.
// Combina com ?team=compare: aí a parceira e o compare-show seguem com a arte de comparação, e os modelos
// `official-show-*` mostram os oficiais ao lado (capturas lado a lado).

import type { CreatureVisual } from "../assets/creatures";
import { getEntity, getPlayer, makeCreature, type WorldSim } from "../sim/world";

/** Espécie da sim → visual oficial recortado. */
export const OFFICIAL_VISUALS: Record<string, string> = {
  "CREATURE-0003": "CREATURE-0018", // Guilmon (DS, mapa)
  "CREATURE-0009": "CREATURE-0019", // Gabumon (DS, mapa)
};

export type MonScaleMode = 1 | 2 | "auto";

/** Faixa-alvo de altura do parceiro (ART_DIRECTION_V2 §1.5: 56–64 px de corpo; o pedido aceita 48–64). */
export const AUTO_RANGE: readonly [number, number] = [48, 64];

export function officialModeOf(params: URLSearchParams): boolean {
  return params.get("mon") === "official";
}

/** ?monscale=1|2|auto; ausente ou inválido → auto. */
export function monScaleModeOf(params: URLSearchParams): MonScaleMode {
  const raw = params.get("monscale");
  return raw === "1" ? 1 : raw === "2" ? 2 : "auto";
}

/** Inteiro k ≥ 1 com a altura h·k mais perto de [lo, hi] (dentro = distância 0); empate → o menor k. */
export function autoScale(heightPx: number, [lo, hi]: readonly [number, number] = AUTO_RANGE): number {
  if (heightPx <= 0) return 1;
  let best = 1;
  let bd = Infinity;
  for (let k = 1; k <= 8; k++) {
    const h = heightPx * k;
    const d = h < lo ? lo - h : h > hi ? h - hi : 0;
    if (d < bd) [best, bd] = [k, d];
  }
  return best;
}

/** Fator de exibição por id de visual oficial (multiplica a escala global das criaturas na view). */
export function officialScales(creatures: Record<string, CreatureVisual>, mode: MonScaleMode): Record<string, number> {
  const out: Record<string, number> = {};
  for (const vis of Object.values(OFFICIAL_VISUALS)) {
    const m = creatures[vis]?.manifest;
    if (!m) continue;
    out[vis] = mode === "auto" ? autoScale(m.nativeMapHeightPx ?? m.targetHeightPx ?? m.dimensions.frameH) : mode;
  }
  return out;
}

/** Catálogo com o visual oficial no lugar das duas espécies (retratos do HUD e tempos de golpe do presenter). */
export function withOfficialVisuals(creatures: Record<string, CreatureVisual>): Record<string, CreatureVisual> {
  const out = { ...creatures };
  for (const [sp, vis] of Object.entries(OFFICIAL_VISUALS)) if (creatures[vis]) out[sp] = creatures[vis];
  return out;
}

/** Id da entidade-modelo `n` das capturas (a view sempre a desenha com o visual oficial). */
export const officialShowId = (n: number) => `official-show-${n}`;
export const isOfficialShow = (id: string) => id.startsWith("official-show-");

/**
 * Capturas "lado a lado": põe um modelo parado (entidade `npc`, a sim não move nem ataca) da espécie `speciesId`,
 * `dxTiles` à direita da parceira, que a view desenha com o visual OFICIAL. `speciesId` null tira todos.
 */
export function officialShowcase(sim: WorldSim, playerId: string, speciesId: string | null, dxTiles = 1.5, n = 0, dyTiles = 0): void {
  const w = sim.state;
  const id = officialShowId(n);
  w.entities = w.entities.filter((e) => (speciesId ? e.id !== id : !isOfficialShow(e.id)));
  const p = getPlayer(w, playerId);
  const pa = p && getEntity(w, p.partnerId);
  if (!speciesId || !pa || !sim.content.species[speciesId]) return;
  const e = makeCreature({ w, map: sim.map, c: sim.content, ev: [] }, id, "npc", speciesId, pa.level, { x: pa.x + Math.round(dxTiles * 16), y: pa.y + Math.round(dyTiles * 16) });
  e.facing = "S";
  w.entities.push(e);
}
