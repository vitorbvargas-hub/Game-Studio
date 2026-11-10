// Chaves de um mapa de cena (ex. fp4_grass_00 no forest-proof) → fonte real de tile/prop num pacote de bioma.
// forest-proof usa o pacote forest-v4 por prefixo: 'fp4_<nome>' = PNG <nome> do pacote; árvores 'fp4_tree_X' viram
// tree_X_base + tree_X_top. O preset (dia/noite) só troca a pasta do pacote (mesmos nomes de arquivo).
// Só apresentação: a sim usa a colisão do mapa, que não depende disso.

import type { PathSmoothCfg } from "../render/pathsmooth";
import type { LookCfg } from "../render/look";
import type { TreesCfg } from "../render/view";
import { globalTileFilter, loadMapFactoryPack, loadTileSources, type TileSource } from "./tiles";

/**
 * Pacote suplementar de um mapa (aditivo ao pacote principal), com prefixo próprio: '<prefix><nome>' = PNG <nome>.
 * `root: "map-factory"` (padrão) lê de art/map-factory/<pack>/; "game-assets" lê de 03-environments/<pack>/.
 * Sem preset noturno: a noite usa os mesmos PNGs. `crops`: chaves extras recortadas de um PNG do pacote
 * (ex. a ponte de 3 tiles vira 3 tiles de chão), '<prefix><chave>' → rect [x, y, w, h] de '<from>'.
 * `nightFor`: os PNGs das pastas night/ do pacote são o preset noturno das chaves '<nightFor><nome>' (de outro
 * pacote): forest-v11-ground/trees/night/<espécie>_<tamanho>_top.png é a copa noturna de fp10_<espécie>_<tamanho>.
 */
export interface ExtraPack {
  pack: string;
  prefix: string;
  root?: "map-factory" | "game-assets";
  crops?: Record<string, { from: string; rect: [number, number, number, number] }>;
  nightFor?: string;
}

export interface ScenePack {
  pack: string;
  prefix: string;
  /** Subpasta do preset noturno dentro do pacote (mesmos nomes de arquivo). Ausente → a noite usa os tiles do dia. */
  night?: string;
  trees?: TreesCfg;
  /** Recorte suave do autotile Wang-47 (forest-v4.1). */
  smoothAutotile?: PathSmoothCfg[];
  /** Pacotes suplementares (Map Factory: forest-v6 com prefixo fp6_). */
  extraPacks?: ExtraPack[];
  /** Look do mapa (ex. v8: grade, luzes, névoa, partículas; render/look.ts). Só nas variantes de look. */
  look?: LookCfg;
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
  const prefixes = [cfg.prefix, ...(cfg.extraPacks ?? []).map((e) => e.prefix)];
  for (const k of new Set(used)) {
    const t = treeParts(k);
    if (tiles[k] || (tiles[t.base] && tiles[t.top])) fromPack += prefixes.some((p) => k.startsWith(p)) ? 1 : 0;
    else missing.push(k);
  }
  return { tiles, missing, fromPack };
}

/** Chaves dos pacotes suplementares, já com prefixo (e os recortes). `load` lê os PNGs de um pacote (testável). */
export function extraPackTiles(cfg: ScenePack, load: (e: ExtraPack, preset: Preset) => Record<string, TileSource> = loadExtraPack, preset: Preset = "day"): Record<string, TileSource> {
  const out: Record<string, TileSource> = {};
  for (const e of cfg.extraPacks ?? []) {
    const src = load(e, "day");
    for (const [k, v] of Object.entries(src)) out[e.prefix + k] = v;
    for (const [k, c] of Object.entries(e.crops ?? {})) if (src[c.from]) out[e.prefix + k] = { url: src[c.from].url, rect: c.rect };
  }
  // preset noturno de chaves de outros pacotes: aplicado depois, vence a versão diurna
  if (preset === "night") for (const e of cfg.extraPacks ?? []) if (e.nightFor) for (const [k, v] of Object.entries(load(e, "night"))) out[e.nightFor + k] = v;
  return out;
}

function loadExtraPack(e: ExtraPack, preset: Preset): Record<string, TileSource> {
  if (e.root === "game-assets") return preset === "night" ? {} : loadTileSources(true, (p) => p.includes(`/${e.pack}/`) && !/\/night\//.test(p));
  return loadMapFactoryPack(e.pack, preset);
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
  const base = { ...loadTileSources(includeDwds, globalTileFilter), ...extraPackTiles(cfg, undefined, preset) };
  return resolvePackTiles(base, loadTileSources(true, presetFilter(cfg, cfg.night ? preset : "day")), cfg, used);
}

/** Chaves visuais usadas por um mapa (tiles e props). */
export function usedKeys(map: { tileLayers: { keys: string[] }[]; props: { key: string; openKey?: string }[]; curves?: { fill: string; ground: string[] }[]; decals?: { key: string }[]; macroOverlays?: { key: string }[]; fgProps?: { key: string }[] }): string[] {
  return [
    ...new Set([
      ...map.tileLayers.flatMap((l) => l.keys.filter(Boolean)),
      ...map.props.flatMap((p) => (p.openKey ? [p.key, p.openKey] : [p.key])),
      ...(map.curves ?? []).flatMap((c) => [c.fill, ...c.ground]),
      ...(map.decals ?? []).map((d) => d.key),
      ...(map.macroOverlays ?? []).map((d) => d.key),
      ...(map.fgProps ?? []).map((p) => p.key),
    ]),
  ];
}
