// Chaves de um mapa de cena (ex. fp4_grass_00 no forest-proof) → fonte real de tile/prop num pacote de bioma.
// forest-proof usa o pacote forest-v4 por prefixo: 'fp4_<nome>' = PNG <nome> do pacote; árvores 'fp4_tree_X' viram
// tree_X_base + tree_X_top. O preset (dia/noite) só troca a pasta do pacote (mesmos nomes de arquivo).
// Só apresentação: a sim usa a colisão do mapa, que não depende disso.

import type { PathSmoothCfg } from "../render/pathsmooth";
import type { TreesCfg } from "../render/view";
import { loadTileSources, type TileSource } from "./tiles";

export interface ScenePack {
  pack: string;
  prefix: string;
  /** Subpasta do preset noturno dentro do pacote (mesmos nomes de arquivo). */
  night?: string;
  trees: TreesCfg;
  /** Recorte suave do autotile Wang-47 (forest-v4.1). */
  smoothAutotile?: PathSmoothCfg[];
}

export type Preset = "day" | "night";

/** Filtro de caminho de um preset do pacote: dia = tudo menos a subpasta noturna; noite = só ela. */
export function presetFilter(cfg: ScenePack, preset: Preset): (path: string) => boolean {
  const root = `/${cfg.pack}/`;
  const nightDir = `/${cfg.pack}/${cfg.night ?? "night"}/`;
  return preset === "night" ? (p) => p.includes(nightDir) : (p) => p.includes(root) && !p.includes(nightDir);
}

/** Árvore em 2 sprites: chave do mapa → chaves das partes no mapa de tiles resolvido. */
export function treeParts(key: string): { base: string; top: string } {
  return { base: `${key}_base`, top: `${key}_top` };
}

/**
 * Acrescenta a `base` todas as entradas do pacote com o prefixo da cena e devolve as chaves usadas no mapa que
 * não têm imagem (placeholder). Uma árvore conta como resolvida se base e copa existem.
 */
export function resolvePackTiles(
  base: Record<string, TileSource>,
  pack: Record<string, TileSource>,
  cfg: ScenePack,
  used: Iterable<string> = [],
): { tiles: Record<string, TileSource>; missing: string[]; fromPack: number } {
  const tiles = { ...base };
  for (const [k, v] of Object.entries(pack)) tiles[cfg.prefix + k] = v;
  const missing: string[] = [];
  let fromPack = 0;
  for (const k of new Set(used)) {
    const t = treeParts(k);
    if (tiles[k] || (tiles[t.base] && tiles[t.top])) fromPack += k.startsWith(cfg.prefix) ? 1 : 0;
    else missing.push(k);
  }
  return { tiles, missing, fromPack };
}

/** Resumo de uma linha para o console ("forest-v4/dia: 62/62 chaves · placeholder: 0"). */
export function packSummary(cfg: ScenePack, preset: Preset, r: { missing: string[]; fromPack: number }): string {
  return `${cfg.pack}/${preset === "day" ? "dia" : "noite"}: ${r.fromPack}/${r.fromPack + r.missing.length} chaves · placeholder: ${r.missing.length}`;
}

/** Tiles do mapa de cena num preset: biblioteca global (sem pastas night/) + pacote da cena com o prefixo. */
export function loadSceneTiles(
  cfg: ScenePack,
  preset: Preset,
  used: Iterable<string>,
  includeDwds = true,
): { tiles: Record<string, TileSource>; missing: string[]; fromPack: number } {
  const base = loadTileSources(includeDwds, (p) => !/\/night\//.test(p));
  return resolvePackTiles(base, loadTileSources(true, presetFilter(cfg, preset)), cfg, used);
}

/** Chaves visuais usadas por um mapa (tiles e props). */
export function usedKeys(map: { tileLayers: { keys: string[] }[]; props: { key: string }[] }): string[] {
  return [...new Set([...map.tileLayers.flatMap((l) => l.keys.filter(Boolean)), ...map.props.map((p) => p.key)])];
}
