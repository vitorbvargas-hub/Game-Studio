// forest-v10 (Quality Overhaul, fase 3): chão e árvores do pacote art/map-factory/forest-v10-ground-trees no look
// v9 do digimon-forest-01. Roda dentro do derive-look-v9.mjs, depois do P7, de forma determinística (hash por
// posição, sem RNG com estado): rodar de novo dá o mesmo arquivo.
//
//   1. chão: toda célula de grama do v8 (fp8_ground_variant_*) vira fp10_ground_variant_0..7, sorteada por ruído
//      (tileáveis entre si: mesma família e mesmo tom médio); as curvas e o recorte suave usam o mesmo chão;
//   2. manchas macro: camada `ground-macro-overlay` com os 2 overlays do pacote em px do MUNDO (nunca por tile),
//      entre o chão e a faixa das curvas;
//   3. terra batida (autotile blob-16 grass_dirt_blob_*) em volta da fogueira e da fonte de cura, longe da trilha;
//   4. árvores da clareira (caixa do P7): fp4_tree_* comuns viram as 4 espécies do v10 em 2 tamanhos (as digitais,
//      palmeira e data_leaf, ficam: são o acento "Digimon" da mata);
//   5. decalques novos (folhas em grupo, raiz com musgo, pedras com musgo, tufo denso) na clareira.
// Devolve um relatório (contagens e posições).

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BOX, hash, vnoise } from "./p7-clareira.mjs";

export const V10_PACK = "forest-v10-ground-trees";
export const V10_PREFIX = "fp10_";
const GRASS_OLD = /^fp8_ground_variant_\d+$/;

/** Largura × altura de um PNG (cabeçalho IHDR), sem decodificar. */
export function pngSize(file) {
  const b = readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/** Variante de grama da célula: metade lisa (0), o resto com decalque interior, por ruído baixo + hash. */
export function grassVariant(x, y) {
  // ruído de ~4 tiles decide onde o chão fica liso e onde há mais "coisa"; o hash quebra o resto
  const busy = vnoise(x / 4.3, y / 4.3, 1001) * 0.55 + hash(x, y, 1002) * 0.45;
  if (busy < 0.5) return 0;
  // pesos: trevo e variantes sutis mais comuns, raiz e pedras mais raras
  const W = [[1, 1.0], [2, 0.55], [3, 0.55], [4, 1.2], [5, 1.0], [6, 1.0], [7, 1.4]];
  const tot = W.reduce((s, [, w]) => s + w, 0);
  let r = hash(x, y, 1003) * tot;
  for (const [v, w] of W) if ((r -= w) < 0) return v;
  return 7;
}

/** Lista de chão usada nas curvas e no recorte suave (o renderer escolhe por (mx*7+my*3) % n): quase toda lisa. */
export const CURVE_GROUND = [0, 0, 7, 0, 4, 0, 0, 5, 0].map((v) => `${V10_PREFIX}ground_variant_${v}`);

/**
 * Árvore do v4 → espécie do v10. Silhueta parecida (cônica → alta/estreita, redonda → larga/antiga/torta); o tamanho
 * sai do hash, com a fração de grandes da tabela. O sorteio evita repetir espécie+tamanho do vizinho mais próximo.
 */
const TREE_MAP = {
  fp4_tree_round_a: { species: ["wide_low", "ancient_thick", "leaning"], large: 0.55 },
  fp4_tree_round_b: { species: ["ancient_thick", "wide_low", "leaning"], large: 0.55 },
  fp4_tree_flowering: { species: ["leaning", "wide_low"], large: 0.4 },
  fp4_tree_conifer_a: { species: ["tall_narrow"], large: 0.7 },
  fp4_tree_conifer_b: { species: ["tall_narrow", "leaning"], large: 0.6 },
  fp4_tree_birch: { species: ["leaning", "tall_narrow"], large: 0.3 },
  fp4_tree_bushy_a: { species: ["wide_low"], large: 0.3 },
  fp4_tree_bushy_b: { species: ["wide_low"], large: 0.3 },
  fp4_tree_ancient: { species: ["ancient_thick"], large: 1 },
};
const ALL_SPECIES = ["tall_narrow", "wide_low", "leaning", "ancient_thick"];

/**
 * @param tmj     mapa v9 (mutado aqui), já com o P7 aplicado
 * @param look    look v9 (mutado: regras de grade, árvores com rim baked, topOffset)
 * @param outPack aliases do v9 (mutado: pacote extra fp10_ e chão do recorte suave)
 * @param h       { TS, prop, layer, solid:Set, nearAny, paths, water, table, artRoot }
 * @param opts    { dirt = true: terra batida blob-16 (o forest-v11 desliga e refaz em Wang-47);
 *                  treesEverywhere = false: troca as árvores do mapa todo, não só as da caixa do P7 }
 */
export function applyForestV10(tmj, look, outPack, h, opts = {}) {
  const { dirt: withDirt = true, treesEverywhere = false } = opts;
  const { TS, prop, layer, solid, nearAny, paths, water, table, artRoot } = h;
  const PACK = join(artRoot, V10_PACK);
  const W = tmj.width;
  const H = tmj.height;
  const report = { pack: V10_PACK };
  const ts0 = tmj.tilesets[0];
  const keyOf = new Map();
  for (const t of ts0.tiles) keyOf.set(ts0.firstgid + t.id, t.properties?.find((q) => q.name === "key")?.value);
  const gidOf = new Map();
  const tileGid = (key) => {
    if (gidOf.has(key)) return gidOf.get(key);
    const id = ts0.tilecount++;
    ts0.tiles.push({ id, properties: [{ name: "key", type: "string", value: key }, { name: "solid", type: "bool", value: false }] });
    gidOf.set(key, ts0.firstgid + id);
    keyOf.set(ts0.firstgid + id, key);
    return ts0.firstgid + id;
  };
  const ground = layer("ground");
  const det = layer("ground_detail");
  const grassCell = (x, y) => x >= 0 && y >= 0 && x < W && y < H && GRASS_OLD.test(String(keyOf.get(ground.data[y * W + x]) ?? ""));
  const cellOf = (x, y) => `${Math.floor(x / TS)},${Math.floor((y - 1) / TS)}`;
  const inBox = (x, y) => x >= BOX.x0 * TS && x < (BOX.x1 + 1) * TS && y >= BOX.y0 * TS && y < (BOX.y1 + 1) * TS;
  // grama original (antes da troca): base das outras decisões
  const wasGrass = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) wasGrass[y * W + x] = grassCell(x, y) ? 1 : 0;
  const isGrass = (x, y) => x >= 0 && y >= 0 && x < W && y < H && wasGrass[y * W + x] === 1;

  // ---------- 3 (antes do chão). terra batida: blob-16 em volta da fogueira e da fonte de cura ----------
  const below = layer("objects_below").objects;
  const patchCells = new Set();
  for (const p of layer("patches").objects) for (const c of String(prop(p, "cells") ?? "").split(",").filter(Boolean)) patchCells.add(Number(c));
  const encRects = (table?.areas ?? []).map((a) => a.rect);
  const inEnc = (x, y) => encRects.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const findProp = (k) => below.find((o) => prop(o, "key") === k);
  const DIRT = [
    // [tag, pé do prop, raio x/y e deslocamento x/y do centro, em tiles]: terra pisada em volta do que se usa
    ["fogueira", findProp("fp8_campfire_small"), 2.6, 1.9, 0.6, 0.7],
    ["fonte-cura", findProp("fp6_healing_point"), 2.0, 1.5, 0, 0],
  ];
  const dirt = new Set();
  report.dirt = [];
  const dirtTag = new Map();
  for (const [tag, o, rx, ry, ox, oy] of DIRT) {
    if (!o || !withDirt) continue;
    // centro deslocado (ox/oy em tiles) para o lado com chão livre: a fogueira encosta na mata a oeste
    const cx = o.x / TS + ox;
    const cy = (o.y - 4) / TS + oy;
    let n = 0;
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        // elipse com borda irregular (ruído) em células inteiras: o blob arredonda os cantos
        const e = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
        if (e > 1 + (vnoise(x * 0.9, y * 0.9, 1101) - 0.5) * 0.5) continue;
        if (!isGrass(x, y) || solid.has(`${x},${y}`) || patchCells.has(y * W + x) || inEnc(x, y)) continue;
        // longe da trilha e da água (a faixa da curva não emenda com o blob: ficaria uma linha reta entre os dois)
        if (nearAny(paths, x * TS + TS / 2, y * TS + TS / 2) < TS * 0.75 || nearAny(water, x * TS + TS / 2, y * TS + TS / 2) < TS) continue;
        dirt.add(y * W + x);
        dirtTag.set(y * W + x, tag);
        n++;
      }
    report.dirt.push({ tag, candidates: n });
  }
  // abertura morfológica: só ficam células que fazem parte de algum bloco 2×2 de terra. O blob-16 não tem canto
  // interno: uma célula "braço" saindo de um bloco (ou solta) deixa a peça de canto vizinha com terra encostada na
  // borda que dá para a grama, e isso vira uma linha reta de 32 px no chão (visto na fogueira na 1ª montagem)
  const inBlock = (x, y) => [[0, 0], [-1, 0], [0, -1], [-1, -1]].some(([ox, oy]) => [[0, 0], [1, 0], [0, 1], [1, 1]].every(([dx, dy]) => dirt.has((y + oy + dy) * W + x + ox + dx)));
  for (const i of [...dirt].filter((i) => !inBlock(i % W, Math.floor(i / W)))) dirt.delete(i);
  for (const d of report.dirt) d.cells = [...dirt].filter((i) => dirtTag.get(i) === d.tag).map((i) => [i % W, Math.floor(i / W)]);

  // ---------- 1. chão ----------
  const counts = {};
  let swapped = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      let key;
      if (dirt.has(i)) {
        const m = (dirt.has(i - W) ? 1 : 0) | (dirt.has(i + 1) && x + 1 < W ? 2 : 0) | (dirt.has(i + W) ? 4 : 0) | (dirt.has(i - 1) && x > 0 ? 8 : 0);
        key = `${V10_PREFIX}grass_dirt_blob_${m}`;
      } else if (wasGrass[i]) key = `${V10_PREFIX}ground_variant_${grassVariant(x, y)}`;
      else continue;
      ground.data[i] = tileGid(key);
      counts[key] = (counts[key] ?? 0) + 1;
      swapped++;
    }
  // ground_detail: as poucas células de grama do v8 por cima do penhasco seguem a mesma regra
  for (let i = 0; i < det.data.length; i++)
    if (GRASS_OLD.test(String(keyOf.get(det.data[i]) ?? ""))) det.data[i] = tileGid(`${V10_PREFIX}ground_variant_${grassVariant(i % W, Math.floor(i / W))}`);
  // vizinhas iguais com decalque (ex.: duas raízes lado a lado) leem como carimbo: troca a de baixo/direita
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const k = keyOf.get(ground.data[i]);
      if (!/ground_variant_[1-7]$/.test(String(k))) continue;
      if (keyOf.get(ground.data[i - 1]) === k || (y > 0 && keyOf.get(ground.data[i - W]) === k)) {
        counts[k]--;
        const nk = `${V10_PREFIX}ground_variant_0`;
        ground.data[i] = tileGid(nk);
        counts[nk] = (counts[nk] ?? 0) + 1;
      }
    }
  for (const c of layer("curves").objects) {
    const p = c.properties.find((q) => q.name === "ground");
    if (p) p.value = CURVE_GROUND.join(",");
  }
  for (const s of outPack.smoothAutotile ?? []) s.ground = [...CURVE_GROUND];
  report.ground = { cells: swapped, byKey: Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0).sort()) };

  // ---------- 2. manchas macro (px do mundo) ----------
  const OVER = [
    { key: `${V10_PREFIX}macro_patch_olive`, ...pngSize(join(PACK, "overlays/macro_patch_olive.png")) },
    { key: `${V10_PREFIX}macro_patch_shade`, ...pngSize(join(PACK, "overlays/macro_patch_shade.png")) },
  ];
  const macro = [];
  // candidatos numa grade de ~4 tiles com jitter de até 2 tiles por eixo; ficam os que cobrem chão aberto (≥ 70% de
  // grama sob a mancha) e longe de outra mancha. Prioridade à clareira (P7), depois o resto do mapa.
  const cands = [];
  for (let gy = 0; gy < H; gy += 4)
    for (let gx = 0; gx < W; gx += 4) {
      const x = Math.round((gx + 2 + (hash(gx, gy, 1201) - 0.5) * 4) * TS);
      const y = Math.round((gy + 2 + (hash(gx, gy, 1202) - 0.5) * 4) * TS);
      const o = OVER[hash(gx, gy, 1203) < 0.55 ? 0 : 1];
      let g = 0;
      let t = 0;
      for (let yy = Math.floor((y - o.h * 0.35) / TS); yy <= Math.floor((y + o.h * 0.35) / TS); yy++)
        for (let xx = Math.floor((x - o.w * 0.35) / TS); xx <= Math.floor((x + o.w * 0.35) / TS); xx++) {
          t++;
          if (isGrass(xx, yy)) g++;
        }
      if (g / t < 0.7) continue;
      cands.push({ x, y, o, k: (inBox(x, y) ? 0 : 1) + hash(gx, gy, 1204) * 0.9 });
    }
  cands.sort((a, b) => a.k - b.k);
  for (const c of cands) {
    if (macro.length >= 9) break;
    if (macro.some((m) => Math.hypot(m.x - c.x, m.y - c.y) < 190)) continue;
    // a mesma forma não fica perto dela mesma (repetição visível)
    if (macro.some((m) => m.key === c.o.key && Math.hypot(m.x - c.x, m.y - c.y) < 320)) continue;
    macro.push({ key: c.o.key, x: c.x, y: c.y, flip: hash(c.x, c.y, 1205) < 0.5 });
  }
  let nextId = tmj.nextobjectid;
  tmj.layers = tmj.layers.filter((l) => l.name !== "ground-macro-overlay");
  // logo depois das camadas de tiles: o renderer a desenha entre o chão e a faixa das curvas
  const at = tmj.layers.findIndex((l) => l.type !== "tilelayer");
  tmj.layers.splice(at, 0, {
    id: Math.max(...tmj.layers.map((l) => l.id ?? 0)) + 1,
    name: "ground-macro-overlay",
    type: "objectgroup",
    visible: true,
    opacity: 1,
    x: 0,
    y: 0,
    draworder: "index",
    objects: macro.map((m) => ({
      id: nextId++,
      name: m.key,
      type: "macro",
      x: m.x,
      y: m.y,
      point: true,
      properties: [{ name: "key", type: "string", value: m.key }, ...(m.flip ? [{ name: "flip", type: "bool", value: true }] : [])],
    })),
  });
  report.macro = macro.map((m) => ({ key: m.key.slice(V10_PREFIX.length), px: [m.x, m.y], inClareira: inBox(m.x, m.y), flip: m.flip }));

  // ---------- 4. árvores da clareira ----------
  const treeArea = (o) => treesEverywhere || inBox(o.x, o.y);
  const trees = below.filter((o) => treeArea(o) && TREE_MAP[prop(o, "key")]).sort((a, b) => a.y - b.y || a.x - b.x);
  const done = [];
  const swappedTrees = {};
  for (const o of trees) {
    const from = prop(o, "key");
    const m = TREE_MAP[from];
    const near = done.filter((d) => Math.hypot(d.x - o.x, d.y - o.y) < 96);
    // ordem de preferência: espécies da silhueta do v4 (tamanho sorteado primeiro), depois as outras; fica a 1ª que
    // nenhum vizinho a menos de 96 px já usa (espécie igual só com tamanho diferente)
    const first = hash(o.id, 0, 1302) < m.large ? "large" : "small";
    const sizes = [first, first === "large" ? "small" : "large"];
    const own = [...m.species].sort((a, b) => hash(o.id, ALL_SPECIES.indexOf(a), 1301) - hash(o.id, ALL_SPECIES.indexOf(b), 1301));
    const rest = ALL_SPECIES.filter((sp) => !own.includes(sp)).sort((a, b) => hash(o.id, ALL_SPECIES.indexOf(a), 1303) - hash(o.id, ALL_SPECIES.indexOf(b), 1303));
    const order = [...own, ...rest].flatMap((sp, i) => (i < own.length ? sizes : sizes).map((sz) => `${V10_PREFIX}${sp}_${sz}`));
    // mata muito densa (8+ vizinhas): a combinação cuja repetição mais próxima fica mais longe
    const gap = (k) => Math.min(Infinity, ...done.filter((d) => d.key === k).map((d) => Math.hypot(d.x - o.x, d.y - o.y)));
    const pick = order.find((k) => !near.some((d) => d.key === k)) ?? order.reduce((a, b) => (gap(b) > gap(a) ? b : a));
    o.name = pick;
    o.properties.find((q) => q.name === "key").value = pick;
    o.properties = [...o.properties.filter((q) => q.name !== "v10from"), { name: "v10from", type: "string", value: from }];
    done.push({ x: o.x, y: o.y, key: pick });
    swappedTrees[pick] = (swappedTrees[pick] ?? 0) + 1;
  }
  report.trees = { swapped: trees.length, byKey: Object.fromEntries(Object.entries(swappedTrees).sort()), keptDigital: below.filter((o) => treeArea(o) && /^fp4_tree_(palm_digital|data_leaf)$/.test(prop(o, "key"))).length };

  // ---------- 5. decalques novos na clareira ----------
  const decals = layer("decals");
  const treesV10 = below.filter((o) => String(prop(o, "key")).startsWith(V10_PREFIX));
  const placed = [];
  // colisão de agora (o P7 moveu props sólidos e as árvores novas contam): camada collision, props e tiles sólidos
  const solidNow = new Set(solid);
  for (const o of below) if (prop(o, "solid") === true) solidNow.add(cellOf(o.x, o.y));
  const solidGid = new Set(ts0.tiles.filter((t) => t.properties?.some((q) => q.name === "solid" && q.value === true)).map((t) => ts0.firstgid + t.id));
  for (const l of tmj.layers) if (l.type === "tilelayer") l.data.forEach((gid, i) => solidGid.has(gid) && solidNow.add(`${i % W},${Math.floor(i / W)}`));
  const blocked = (x, y, r) =>
    solidNow.has(cellOf(x, y)) ||
    nearAny(water, x, y) < 8 ||
    below.some((o) => !String(prop(o, "key")).startsWith(V10_PREFIX) && Math.hypot(o.x - x, o.y - y) < r) ||
    placed.some((p) => Math.hypot(p.x - x, p.y - y) < 22);
  const addDecal = (k, x, y, seed) => {
    const o = { id: nextId++, name: `${V10_PREFIX}${k}`, type: "decal", x, y, point: true, properties: [{ name: "key", type: "string", value: `${V10_PREFIX}${k}` }, { name: "v10", type: "bool", value: true }] };
    if (hash(x, y, seed) < 0.5) o.properties.push({ name: "flip", type: "bool", value: true });
    decals.objects.push(o);
    placed.push({ k, x, y });
  };
  // raiz com musgo e folhas em grupo: no pé das árvores novas (fora da colisão do tronco, ~22–34 px do pé)
  for (const t of treesV10) {
    const r = hash(t.id, 0, 1401);
    if (r > 0.75) continue;
    const k = r < 0.4 ? "root_exposed_mossy" : "leaf_litter_big";
    for (let a = 0; a < 6; a++) {
      const ang = hash(t.id, a, 1402) * Math.PI * 2;
      const d = 22 + hash(t.id, a, 1403) * 12;
      const x = Math.round(t.x + Math.cos(ang) * d * 1.3);
      const y = Math.round(t.y + 2 + Math.abs(Math.sin(ang)) * d * 0.6);
      // dentro do mapa (árvore da borda da mata: o decalque não pode cair fora dele)
      if (x < 8 || y < 8 || x > W * TS - 8 || y > H * TS - 2) continue;
      if (!treeArea({ x, y }) || nearAny(paths, x, y) < 6 || blocked(x, y, 12)) continue;
      addDecal(k, x, y, 1404);
      break;
    }
  }
  // pedras com musgo: margem do riacho e pé do mirante; tufo denso: borda da trilha (lado de fora)
  for (let ty = BOX.y0; ty <= BOX.y1; ty++)
    for (let tx = BOX.x0; tx <= BOX.x1; tx++) {
      const x = Math.round(tx * TS + 6 + hash(tx, ty, 1411) * 20);
      const y = Math.round(ty * TS + 6 + hash(tx, ty, 1412) * 20);
      const fw = nearAny(water, x, y);
      const fp = nearAny(paths, x, y);
      if (fw > 6 && fw < 40 && fp > 10 && hash(tx, ty, 1413) < 0.3 && !blocked(x, y, 14)) addDecal("mossy_stone_cluster", x, y, 1414);
      else if (fp > 2 && fp < 14 && fw > 12 && hash(tx, ty, 1415) < 0.3 && !inEnc(tx, ty) && !blocked(x, y, 12)) addDecal("tuft_overlap_big", x, y, 1416);
      else if (fp > 20 && fw > 20 && hash(tx, ty, 1417) < 0.035 && isGrass(tx, ty) && !inEnc(tx, ty) && !blocked(x, y, 14)) addDecal("leaf_litter_big", x, y, 1418);
    }
  tmj.nextobjectid = nextId;
  report.decals = Object.fromEntries(["leaf_litter_big", "root_exposed_mossy", "mossy_stone_cluster", "tuft_overlap_big"].map((k) => [k, placed.filter((p) => p.k === k).length]));

  // ---------- look: pacote, grade, copas ----------
  outPack.extraPacks = [...(outPack.extraPacks ?? []).filter((e) => e.pack !== V10_PACK), { pack: V10_PACK, prefix: V10_PREFIX, root: "map-factory" }];
  // mesma rampa do forest-v8-depth: o chão leva a mesma grade do chão do v8; árvores e decalques a dos props fp8_
  look.grade.rules = [
    { match: `^${V10_PREFIX}(ground_variant_|grass_dirt_blob_|macro_patch_)`, saturationMul: 0.78, valueMul: 0.6 },
    // árvores: grade mais leve que a dos props fp8_ (0,85/0,74), senão a copa nova fica bem mais escura que a mata do
    // v4 em volta da clareira (as copas do v10 já vêm com sombra interna pintada)
    // (a noite da copa é arte própria: forest-v11-ground/trees/night/, ligada por `nightFor` no v11-ground.mjs)
    { match: `^${V10_PREFIX}(tall_narrow|wide_low|leaning|ancient_thick)_(large|small)_`, saturationMul: 0.92, valueMul: 0.9 },
    { match: `^${V10_PREFIX}`, saturationMul: 0.85, valueMul: 0.74 },
    ...look.grade.rules.filter((r) => !r.match.startsWith(`^${V10_PREFIX}`)),
  ];
  // copa: o pacote posiciona com topY = pé − base.h − top.h + round(top.h × 0,4); o renderer usa `overlap` (0,42)
  const trees2 = (outPack.trees ??= {});
  const overlap = trees2.overlap ?? 0.42;
  trees2.topOffset = { ...(trees2.topOffset ?? {}) };
  for (const sp of ALL_SPECIES)
    for (const size of ["large", "small"]) {
      const k = `${V10_PREFIX}${sp}_${size}`;
      const top = pngSize(join(PACK, `trees/${sp}_${size}_top.png`));
      const dy = Math.round(top.h * 0.4) - Math.round(top.h * overlap);
      if (dy) trees2.topOffset[k] = [0, dy];
      // rim-light e sombra interna já vêm pintados nas copas do v10 (addRimLightPass/addInnerShadowPass)
      if (trees2.rimLight && !trees2.rimLight.baked.includes(k)) trees2.rimLight.baked.push(k);
    }
  return report;
}
