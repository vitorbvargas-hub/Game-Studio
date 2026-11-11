// forest-v12 (Quality Overhaul, fase 3): pacote art/map-factory/forest-v12-plateau-night no look v9 do
// digimon-forest-01. Roda dentro do derive-look-v9.mjs, DEPOIS do v11, de forma determinística (hash por posição).
//
//   1. lip da borda norte do mirante: célula do topo cuja vizinha ao norte está fora do platô vira
//      mirante_top_edge_* (canto externo esquerdo/direito quando a vizinha oeste/leste também está fora; senão uma
//      das 3 retas, por hash, nunca a mesma da reta à esquerda); decalques do v11 nos 10 px de cima da célula descem;
//   2. noite pintada: lip/night/, tiles/night/ (terra Wang-47) e mirante/night/ (topo) são a noite das chaves
//      fp12_mirante_top_edge_*, fp11_grass_dirt_wang47_* e fp11_mirante_top_blob_* (`nightFor` com 2 prefixos), em
//      mistura (`nightBlend`): os pixels de TERRA vêm da arte pintada e a grama segue a do dia com a grade da noite.
//      A troca da peça inteira (?v12night=swap) deixa cada uma como um retângulo azul-escuro no chão do look v9
//      (a rampa noturna do pacote é a do forest-v4; o chão do v9 à noite é arte do dia com grade): ver V12_DEV.md.
//      Sai o ajuste de cor noturno da terra (`earth.night`), que só existia por falta dessa arte;
//   3. copas da borda da mata (até 5 tiles da borda do mapa): cada árvore do v10 mantém espécie e tamanho (mesmo
//      tronco, mesma colisão) e ganha uma variante — normal, espelhada (flip/) ou de tom escuro/claro (tone/) — num
//      ciclo embaralhado por espécie+tamanho, percorrido ao longo do perímetro (regra do README do pacote). A
//      'leaning' não usa o flip: o tronco dela pende para a direita e o pacote só espelha a copa.
// Devolve um relatório (contagens e posições).

import { join } from "node:path";
import { hash } from "./p7-clareira.mjs";
import { pngSize, V10_PACK, V10_PREFIX } from "./v10-ground-trees.mjs";
import { V11_PACK, V11_PREFIX } from "./v11-ground.mjs";

export const V12_PACK = "forest-v12-plateau-night";
export const V12_PREFIX = "fp12_";

/** Chaves com noite em mistura (só os pixels de terra da arte pintada); as copas de borda trocam a peça inteira. */
export const NIGHT_BLEND = "^(fp11_grass_dirt_wang47_|fp11_mirante_top_blob_|fp12_mirante_top_edge_)";
export const LIP_STRAIGHT = ["straight_0", "straight_1", "straight_2"];
/** Faixa da borda da mata em tiles (distância do pé da árvore à borda do mapa). */
export const EDGE_BAND = 5;
export const SPECIES = ["tall_narrow", "wide_low", "leaning", "ancient_thick"];
/** Variantes da copa por espécie ('' = a copa do v10). */
export const variantsOf = (sp) => (sp === "leaning" ? ["", "tone_dark", "tone_light"] : ["", "flip", "tone_dark", "tone_light"]);
/** Arquivo da copa de uma variante no pacote (sem prefixo). */
const topFile = (spsz, v) => (v === "flip" ? `${spsz}_top_flip` : `${spsz}_top_${v}`);

/** Embaralhamento determinístico (Fisher–Yates com hash). */
function shuffle(list, seed, round) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(hash(i, round, seed) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param tmj     mapa v9 (mutado aqui), já com P7, kit de penhasco, v10 e v11 aplicados
 * @param look    look v9 (mutado: regras de grade)
 * @param outPack aliases do v9 (mutado: pacote fp12_, keyAliases das copas, topOffset/rim das copas novas)
 * @param h       { TS, prop, layer, artRoot }
 */
export function applyForestV12(tmj, look, outPack, h) {
  const { TS, prop, layer, artRoot } = h;
  const PACK = join(artRoot, V12_PACK);
  const W = tmj.width;
  const H = tmj.height;
  const report = { pack: V12_PACK };
  const ts0 = tmj.tilesets[0];
  const keyProp = (t) => t.properties?.find((q) => q.name === "key");
  const keyOf = new Map(ts0.tiles.map((t) => [ts0.firstgid + t.id, keyProp(t)?.value]));
  const gidOf = new Map([...keyOf].map(([g, k]) => [k, g]));
  // uma entrada por (peça, membro substituído): a mesma reta pode ocupar o lugar de máscaras diferentes
  const tileGid = (key, like) => {
    if (gidOf.has(`${key}|${like}`)) return gidOf.get(`${key}|${like}`);
    const id = ts0.tilecount++;
    const base = ts0.tiles.find((t) => keyProp(t)?.value === like);
    // `autotile`: o gate wang do validador confere a peça como o membro do blob-16 que ela substituiu
    const props = base.properties.filter((q) => q.name !== "autotile").map((q) => (q.name === "key" ? { ...q, value: key } : { ...q }));
    ts0.tiles.push({ id, properties: [...props, { name: "autotile", type: "string", value: like }] });
    gidOf.set(`${key}|${like}`, ts0.firstgid + id);
    keyOf.set(ts0.firstgid + id, key);
    return ts0.firstgid + id;
  };
  const ground = layer("ground");

  // ---------- 1. lip da borda norte do mirante ----------
  const MIR_RE = /^fp11_mirante_top_blob_\d+$/;
  // o platô é lido antes de trocar qualquer célula (a troca da fileira norte não pode mudar o vizinho da próxima)
  const plateau = new Set(ground.data.flatMap((g, i) => (MIR_RE.test(String(keyOf.get(g))) ? [i] : [])));
  const isMir = (x, y) => x >= 0 && y >= 0 && x < W && y < H && plateau.has(y * W + x);
  const lipCells = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (isMir(x, y) && !isMir(x, y - 1)) lipCells.push([x, y]);
  const lip = [];
  for (const [x, y] of lipCells) {
    const like = keyOf.get(ground.data[y * W + x]);
    let piece;
    if (!isMir(x - 1, y)) piece = "corner_outer_left";
    else if (!isMir(x + 1, y)) piece = "corner_outer_right";
    else {
      // reta por hash, nunca a mesma da célula à esquerda (fileira longa sem 2 iguais lado a lado)
      const left = lip.find((l) => l.x === x - 1 && l.y === y)?.piece;
      const opts = LIP_STRAIGHT.filter((s) => s !== left);
      piece = opts[Math.floor(hash(x, y, 2401) * opts.length)];
    }
    ground.data[y * W + x] = tileGid(`${V12_PREFIX}mirante_top_edge_${piece}`, like);
    lip.push({ x, y, piece, was: like });
  }
  // decalques do v11 em cima da banda de sombra/musgo do lip (10 px de cima da célula): descem 10 px
  let decalsMoved = 0;
  const lipSet = new Set(lip.map((l) => `${l.x},${l.y}`));
  for (const o of layer("decals").objects) {
    const cx = Math.floor(o.x / TS);
    const cy = Math.floor(o.y / TS);
    if (!lipSet.has(`${cx},${cy}`) || o.y - cy * TS >= 16) continue;
    o.y += 10;
    decalsMoved++;
  }
  report.lip = { cells: lip.map((l) => [l.x, l.y, l.piece]), decalsMoved };

  // ---------- 3. copas da borda da mata ----------
  const below = layer("objects_below").objects;
  const TREE_RE = new RegExp(`^${V10_PREFIX}(${SPECIES.join("|")})_(large|small)$`);
  const edgeDist = (o) => Math.min(o.x / TS, o.y / TS, W - o.x / TS, H - o.y / TS);
  // ordem ao longo do perímetro: ângulo em volta do centro do mapa (a fileira da borda vira uma sequência só)
  const ang = (o) => Math.atan2(o.y - (H * TS) / 2, o.x - (W * TS) / 2);
  const edge = below.filter((o) => TREE_RE.test(String(prop(o, "key"))) && edgeDist(o) < EDGE_BAND).sort((a, b) => ang(a) - ang(b) || a.id - b.id);
  const cycles = new Map(); // espécie_tamanho → { list, pos, round }
  const byVariant = {};
  for (const o of edge) {
    const kp = o.properties.find((q) => q.name === "key");
    const spsz = String(kp.value).slice(V10_PREFIX.length);
    const sp = SPECIES.find((s) => spsz.startsWith(`${s}_`));
    const vars = variantsOf(sp);
    let c = cycles.get(spsz);
    if (!c) cycles.set(spsz, (c = { list: shuffle(vars, 2411 + SPECIES.indexOf(sp) * 2 + (spsz.endsWith("large") ? 1 : 0), 0), pos: 0, round: 0 }));
    if (c.pos === c.list.length) {
      // novo embaralhamento por volta, sem repetir na emenda a última variante da volta anterior
      const last = c.list.at(-1);
      c.round++;
      let next = shuffle(vars, 2421 + SPECIES.indexOf(sp), c.round);
      if (next[0] === last) next = [...next.slice(1), next[0]];
      c.list = next;
      c.pos = 0;
    }
    const v = c.list[c.pos++];
    byVariant[v || "normal"] = (byVariant[v || "normal"] ?? 0) + 1;
    if (!v) continue;
    const key = `${V12_PREFIX}${spsz}_${v}`;
    kp.value = o.name = key;
  }
  report.edgeTrees = { band: EDGE_BAND, trees: edge.length, byVariant: Object.fromEntries(Object.entries(byVariant).sort()) };

  // ---------- pacote, noite pintada, aliases das copas, grade ----------
  outPack.extraPacks = [...(outPack.extraPacks ?? []).filter((e) => e.pack !== V12_PACK), { pack: V12_PACK, prefix: V12_PREFIX, root: "map-factory", nightFor: [V11_PREFIX, V12_PREFIX], nightBlend: NIGHT_BLEND }];
  const aliases = { ...(outPack.keyAliases ?? {}) };
  const trees = outPack.trees;
  for (const sp of SPECIES)
    for (const sz of ["large", "small"]) {
      const spsz = `${sp}_${sz}`;
      const ref = pngSize(join(artRoot, V10_PACK, `trees/${spsz}_top.png`));
      for (const v of variantsOf(sp).filter(Boolean)) {
        const dir = v === "flip" ? "flip" : "tone";
        const s = pngSize(join(PACK, `canopy-edge-variety/${dir}/${topFile(spsz, v)}.png`));
        if (s.w !== ref.w || s.h !== ref.h) throw new Error(`forest-v12: ${topFile(spsz, v)} ${s.w}×${s.h} ≠ copa do v10 ${ref.w}×${ref.h}`);
        const k = `${V12_PREFIX}${spsz}_${v}`;
        aliases[`${k}_top`] = `${V12_PREFIX}${topFile(spsz, v)}`;
        aliases[`${k}_base`] = `${V10_PREFIX}${spsz}_base`;
        const off = trees?.topOffset?.[`${V10_PREFIX}${spsz}`];
        if (off) trees.topOffset[k] = [...off];
        if (trees?.rimLight && !trees.rimLight.baked.includes(k)) trees.rimLight.baked.push(k);
      }
    }
  outPack.keyAliases = aliases;
  // a terra tem noite pintada agora: sai o earth.night (valores medidos no v11 para imitar a trilha noturna); à noite a
  // terra leva a mesma regra da trilha que a faixa pintada leva
  const dirtRule = look.grade.rules.find((r) => r.match === `^${V11_PREFIX}grass_dirt_wang47_`);
  if (dirtRule?.earth?.night) delete dirtRule.earth.night;
  const v10Tree = look.grade.rules.find((r) => r.match.startsWith(`^${V10_PREFIX}(tall_narrow`));
  look.grade.rules = [
    // lip: chão do topo do mirante (mesma grade do mirante_top_blob_* e do chão em volta)
    { match: `^${V12_PREFIX}mirante_top_edge_`, saturationMul: 0.78, valueMul: 0.6 },
    // copas de borda: a grade das copas do v10 (tronco e copa)
    ...(v10Tree ? [{ ...v10Tree, match: `^${V12_PREFIX}(${SPECIES.join("|")})_(large|small)_` }] : []),
    ...look.grade.rules.filter((r) => !r.match.startsWith(`^${V12_PREFIX}`)),
  ];
  return report;
}
