// Chaves lógicas de um mapa de cena (ex. fp_tree_a no forest-proof) → fonte real de tile/prop.
// Ordem: pacote preferido (03-environments/<pack>/: chave lógica, depois nomes "v3") → outros pacotes ("fallback")
// → placeholder em código. Só apresentação: a sim usa a colisão do mapa, que não depende disso.

import type { TileSource } from "./tiles";

export interface SceneAliases {
  pack: string;
  aliases: Record<string, { v3: string[]; fallback: string[] }>;
}

export type AliasOrigin = "pack" | "fallback" | "placeholder";

export function resolveSceneTiles(
  base: Record<string, TileSource>,
  pack: Record<string, TileSource>,
  cfg: SceneAliases,
): { tiles: Record<string, TileSource>; report: Record<string, { origin: AliasOrigin; key?: string }> } {
  const tiles = { ...base };
  const report: Record<string, { origin: AliasOrigin; key?: string }> = {};
  for (const [logical, a] of Object.entries(cfg.aliases)) {
    const fromPack = [logical, ...a.v3].find((k) => pack[k]);
    const fromBase = fromPack ? undefined : a.fallback.find((k) => base[k]);
    if (fromPack) {
      tiles[logical] = pack[fromPack];
      report[logical] = { origin: "pack", key: fromPack };
    } else if (fromBase) {
      tiles[logical] = base[fromBase];
      report[logical] = { origin: "fallback", key: fromBase };
    } else {
      delete tiles[logical];
      report[logical] = { origin: "placeholder" };
    }
  }
  return { tiles, report };
}

/** Resumo de uma linha para o console/README ("forest-v3: 0/18 · fallback: 16 · placeholder: 2"). */
export function aliasSummary(cfg: SceneAliases, report: Record<string, { origin: AliasOrigin }>): string {
  const n = (o: AliasOrigin) => Object.values(report).filter((r) => r.origin === o).length;
  return `${cfg.pack}: ${n("pack")}/${Object.keys(cfg.aliases).length} · fallback: ${n("fallback")} · placeholder: ${n("placeholder")}`;
}
