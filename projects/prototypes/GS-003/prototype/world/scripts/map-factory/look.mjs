// Map Factory — "look" de um mapa (ex. v8, profundidade do DRAKANTOS_VISUAL_STUDY.md) por cima de uma montagem.
// A montagem do look (`<id>.<look>.build.json`, `extends` a montagem padrão) traz:
//   look.id, look.pack/prefix (pacote do game-art), look.groundSwap (troca a lista de chão em terrenos, curvas e
//   recortes suaves), look.propSwaps (troca listas de props, ex. tirar uma peça que não funciona no grade do look), look.render (grade de cor, luzes extras, névoa, partículas, sombras: lido pelo renderer) e
//   depth (passe de profundidade do gerador, ver depth.mjs). out: pasta do mapa variante (mesmo id do mapa).
// As luzes dos props emissores vêm do campo `light` do tileset.json do pacote; o grade, do palette.json.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { MAP_FACTORY_ART } from "./context.mjs";

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const sameList = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);

/** Troca, no lugar, toda lista igual a `from` por `to` dentro de `obj` (terrenos, curvas, recortes suaves). */
function swapLists(obj, from, to) {
  if (!obj || typeof obj !== "object") return 0;
  let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    // a própria regra de troca fica intacta (senão `from` vira `to` e o lookAliases não troca mais nada)
    if (k === "groundSwap" || k === "propSwaps") continue;
    if (sameList(v, from)) {
      obj[k] = [...to];
      n++;
    } else n += swapLists(v, from, to);
  }
  return n;
}

/** Aplica o look ao brief adaptado (v0.1): depth, pacote extra, troca de chão e pasta de saída. */
export function applyLook(brief, build) {
  const look = build.look;
  brief.look = { id: look.id, render: look.render ?? {}, groundSwap: look.groundSwap, ...(look.propSwaps ? { propSwaps: look.propSwaps } : {}) };
  if (build.depth) brief.depth = build.depth;
  if (build.out) brief.out = build.out;
  brief.pack ??= {};
  const extra = brief.pack.extraPacks ?? [];
  if (look.pack && !extra.some((e) => e.prefix === look.prefix)) extra.push({ pack: look.pack, prefix: look.prefix, root: "map-factory" });
  brief.pack.extraPacks = extra;
  if (look.groundSwap) swapLists(brief, look.groundSwap.from, look.groundSwap.to);
  // troca de peças nas listas de props (mesmo tamanho de lista: as posições sorteadas não mudam, só a peça)
  for (const sw of look.propSwaps ?? []) swapLists(brief, sw.from, sw.to);
  return brief;
}

/** Luzes dos props emissores do pacote (tileset.json, campo `light`), por chave com prefixo. */
export function packLights(pack, prefix) {
  const p = join(MAP_FACTORY_ART, pack, "tileset.json");
  if (!existsSync(p)) return {};
  const ts = readJson(p);
  const out = {};
  for (const e of ts.emissiveProps ?? []) if (e.light) out[prefix + e.file.split("/").pop().replace(/\.png$/i, "")] = { ...e.light };
  return out;
}

/** Grade de paleta do pacote (palette.json renderPreset). */
export function packGrade(pack) {
  const p = join(MAP_FACTORY_ART, pack, "palette.json");
  return existsSync(p) ? readJson(p).renderPreset : undefined;
}

/** Luzes do pacote + as da montagem, campo a campo (a montagem pode só deslocar o centro: { "oy": -16 }). */
function mergeLights(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) out[k] = { ...(base[k] ?? {}), ...v };
  return out;
}

/** Aliases do mapa com o look: troca de chão nos recortes do mapa base e o bloco `look` lido pelo renderer. */
export function lookAliases(brief, aliases) {
  const look = brief.look;
  if (!look) return aliases;
  if (look.groundSwap) swapLists(aliases, look.groundSwap.from, look.groundSwap.to);
  const pack = (brief.pack?.extraPacks ?? []).find((e) => e.prefix === look.render?.prefix) ?? (brief.pack?.extraPacks ?? []).at(-1);
  const r = look.render ?? {};
  aliases.look = {
    id: look.id,
    ...r,
    grade: { ...(pack ? packGrade(pack.pack) : {}), ...(r.grade ?? {}) },
    lights: mergeLights(pack ? packLights(pack.pack, pack.prefix) : {}, r.lights ?? {}),
  };
  aliases._doc = `${aliases._doc} Look ${look.id}: ${r.doc ?? "passe de profundidade"}.`;
  return aliases;
}
