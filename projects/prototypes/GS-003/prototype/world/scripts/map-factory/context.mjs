// Map Factory — contexto do validador lido do disco: espécies (world-species.json), mapas conhecidos (para os
// portais) e resolvedor de chaves visuais → PNG, na mesma regra de src/assets/tiles.ts + scene-tiles.ts:
//   chave sem prefixo  → biblioteca global (03-environments, sem night/ e sem pacotes *-v5)
//   '<prefixo><nome>'  → PNG <nome> do pacote da cena (<mapa>.aliases.json: pack, prefix, night)
//   árvore 'X'         → resolvida se X_base e X_top resolvem

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const WORLD_DIR = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const GAME_ASSETS = join(WORLD_DIR, "../../../../../assets/GAME-ASSETS");
export const MAPS_DIR = join(WORLD_DIR, "src/data/maps");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p.replace(/\\/g, "/"));
  }
  return out;
}

/** Chaves que um tileset.json acrescenta (recortes de folha), como buildTileSources. */
function tilesetKeys(path) {
  try {
    const ts = readJson(path);
    const entries = Array.isArray(ts.tiles) || ts.props ? [...(Array.isArray(ts.tiles) ? ts.tiles : []), ...(ts.props ?? [])].map((t) => [t.key ?? String(t.image ?? t.file).split("/").pop().replace(/\.png$/i, ""), t]) : Object.entries(ts.tiles ?? {});
    return entries.filter(([, t]) => t && (t.image || t.rect || t.pivot || t.key)).map(([k]) => k);
  } catch {
    return [];
  }
}

let envIndex;
/** Índice dos arquivos de 03-environments: [{ path, key }]. */
function environmentFiles() {
  if (envIndex) return envIndex;
  const files = walk(join(GAME_ASSETS, "03-environments"));
  envIndex = [];
  for (const f of files) {
    if (/\.png$/i.test(f)) envIndex.push({ path: f, key: basename(f).replace(/\.png$/i, "") });
    else if (basename(f) === "tileset.json") for (const k of tilesetKeys(f)) envIndex.push({ path: f, key: k });
  }
  return envIndex;
}

const isScenePackPath = (p) => /\/[a-z]+-v5\//.test(p);

/** Resolvedor (key) → { day, night } para o pacote de um mapa (aliases pode ser null: só biblioteca global). */
export function assetResolver(aliases) {
  const files = environmentFiles();
  const global = new Set(files.filter((f) => !/\/night\//.test(f.path) && !isScenePackPath(f.path)).map((f) => f.key));
  const pack = aliases?.pack;
  const nightDir = pack ? `/${pack}/${aliases.night ?? "night"}/` : null;
  const day = pack ? new Set(files.filter((f) => f.path.includes(`/${pack}/`) && !f.path.includes(nightDir)).map((f) => f.key)) : new Set();
  const night = pack && aliases.night ? new Set(files.filter((f) => f.path.includes(nightDir)).map((f) => f.key)) : null;
  const prefix = aliases?.prefix ?? "";
  const has = (packSet, k) => global.has(k) || (prefix && k.startsWith(prefix) && packSet.has(k.slice(prefix.length)));
  const ok = (packSet, k) => has(packSet, k) || (has(packSet, `${k}_base`) && has(packSet, `${k}_top`));
  return (k) => ({ day: ok(day, k), night: night ? ok(night, k) : null });
}

/** Espécies de src/data/world-species.json. */
export function loadSpecies() {
  const d = readJson(join(WORLD_DIR, "src/data/world-species.json"));
  return new Set(d.species.map((s) => s.id));
}

/** Mapas .tmj.json de um ou mais diretórios: { id: { tmj, path, aliases } }. */
export function loadMaps(dirs = [MAPS_DIR]) {
  const out = {};
  for (const dir of dirs)
    for (const f of existsSync(dir) ? readdirSync(dir) : [])
      if (f.endsWith(".tmj.json")) {
        const id = f.replace(/\.tmj\.json$/, "");
        const ap = join(dir, `${id}.aliases.json`);
        out[id] = { tmj: readJson(join(dir, f)), path: join(dir, f), aliases: existsSync(ap) ? readJson(ap) : null };
      }
  return out;
}

/** Contexto completo para validateMap. */
export function contextFor(id, maps, species = loadSpecies()) {
  return { species, maps: Object.fromEntries(Object.entries(maps).map(([k, v]) => [k, v.tmj])), assets: assetResolver(maps[id]?.aliases ?? null) };
}
