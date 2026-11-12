#!/usr/bin/env node
// Conversor PixelLab → jogo (GS-003, Digi Forest v15b). Lê o export "pixellab" do Map Workshop
// (get_map(export="pixellab"): map.json + objects/manifest.json + PNG de cada objeto + tilesets), a grade de terreno
// (o export não traz a grade nem o render do terreno quando o mapa nunca foi salvo no Map Workshop: a grade vem de
// get_map em ASCII, salva em source/terrain_grid.txt) e os quadros das animações (export_asset dos objetos animados).
//
// Saída (formato que o motor já lê: .tmj + .aliases + tabela de encontros):
//   art/map-factory/<pack>/terrain.png        chão inteiro (autotile Wang de canto, grade dupla), com o filtro cartoon
//   art/map-factory/<pack>/water_tile.png     tile de água pura (o motor anima por deslocamento)
//   art/map-factory/<pack>/<objeto>.png       um PNG por objeto distinto (+ <objeto>_fNN.png dos animados)
//   src/data/maps/<id>.tmj.json               chão (1 chave por célula, recorte do terrain.png), props com pé e
//                                             colisão, decalques, inícios, portal do mapa-múndi
//   src/data/maps/<id>.aliases.json           pacote de cena (recortes, pivôs, animações, água, look dia/noite)
//   src/data/encounters/<id>.json             áreas de mato (tufos), pontos visíveis nas clareiras, parâmetros
//
// Uso (a partir de prototype/world):
//   node scripts/import-pixellab-map.mjs [--src <pasta source>] [--no-cartoon]
// Padrão: --src ../../art/map-factory/digi-forest-v15b/source. Os ZIPs da pasta source são extraídos numa pasta
// temporária vazia (python3 -I zipfile; nada de lá é executado).

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORLD = path.resolve(HERE, "..");
const args = process.argv.slice(2);
const arg = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : d;
};
const MAP_ID = "digi-forest-v15b";
const PACK = MAP_ID;
const PREFIX = "v15_";
const SRC = path.resolve(WORLD, arg("--src", "../../art/map-factory/digi-forest-v15b/source"));
const OUT_ART = path.resolve(SRC, "..");
const CARTOON = !args.includes("--no-cartoon");
const TS = 32;

// ---------- extração ----------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pl-import-"));
function unzip(zip, dir) {
  fs.mkdirSync(dir, { recursive: true });
  execFileSync("python3", ["-I", "-c", "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])", zip, dir]);
  return dir;
}
const EXP = unzip(path.join(SRC, "pixellab-export.zip"), path.join(tmp, "export"));
/**
 * Objetos fora do import, com o motivo (vão para o relatório). river_shimmer: o sprite e os 9 quadros da animação são
 * um bonequinho branco (cara e corpo), não um brilho de água; no jogo parecia um Digimon parado no rio. A água anima
 * pelo motor (deslocamento + brilhos procedurais) até o game-art refazer o brilho.
 */
const EXCLUDE = { river_shimmer: "sprite veio como um bonequinho (fantasma), não brilho de água" };
const ANIMS = {};
for (const f of fs.readdirSync(SRC)) {
  const m = /^anim-(.+)\.zip$/.exec(f);
  if (!m || EXCLUDE[m[1]]) continue;
  const dir = unzip(path.join(SRC, f), path.join(tmp, `anim-${m[1]}`));
  const animRoot = path.join(dir, "animations");
  const name = fs.readdirSync(animRoot)[0];
  const frameDir = path.join(animRoot, name, fs.readdirSync(path.join(animRoot, name))[0]);
  ANIMS[m[1]] = fs.readdirSync(frameDir).filter((x) => x.endsWith(".png")).sort().map((x) => path.join(frameDir, x));
}

// ---------- filtro cartoon (assado na arte do mapa) ----------
// saturação +40% (+15% no máximo nos tons de água: matiz 150°–255°) e contraste +15% em torno de 128.
function cartoon(img) {
  if (!CARTOON) return img;
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
    let h = 0;
    if (dl) h = mx === r ? ((g - b) / dl) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4;
    h *= 60;
    if (h < 0) h += 360;
    let s = mx ? dl / mx : 0;
    const v = mx;
    s = Math.min(1, s * (h >= 150 && h <= 255 ? 1.15 : 1.4));
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    const k = (u) => Math.max(0, Math.min(255, Math.round(((u + m) * 255 - 128) * 1.15 + 128)));
    d[i] = k(r);
    d[i + 1] = k(g);
    d[i + 2] = k(b);
  }
  return img;
}
async function savePng(file, src, w, h, sx = 0, sy = 0) {
  const c = createCanvas(w, h);
  const g = c.getContext("2d");
  g.drawImage(src, sx, sy, w, h, 0, 0, w, h);
  g.putImageData(cartoon(g.getImageData(0, 0, w, h)), 0, 0);
  fs.writeFileSync(file, c.toBuffer("image/png"));
}

// ---------- terreno ----------
const grid = fs.readFileSync(path.join(SRC, "terrain_grid.txt"), "utf8").split("\n").filter((l) => l && !l.startsWith("#"));
const H = grid.length;
const W = grid[0].length;
const isWater = (c, r) => grid[Math.min(H - 1, Math.max(0, r))][Math.min(W - 1, Math.max(0, c))] === "s";
const mapJson = JSON.parse(fs.readFileSync(path.join(EXP, "map.json"), "utf8"));
if (mapJson.mapConfig.dimensions.width !== W || mapJson.mapConfig.dimensions.height !== H) throw new Error("grade ≠ dimensões do map.json");
const meta = JSON.parse(fs.readFileSync(path.join(SRC, "tileset-ea8ba16a-water-grass.json"), "utf8"));
const tsInfo = mapJson.tilesets.find((t) => t.id === meta.id);
const tsImg = await loadImage(path.join(EXP, "tilesets", tsInfo.filename));
const wang = new Map();
for (const t of meta.tileset_data.tiles) {
  const c = t.corners;
  wang.set(`${c.NW}|${c.NE}|${c.SW}|${c.SE}`, t.bounding_box);
}
const terrain = createCanvas(W * TS, H * TS);
const tg = terrain.getContext("2d");
tg.imageSmoothingEnabled = false;
// grade dupla: um tile Wang centrado em cada vértice, cantos = as 4 células em volta (água = lower, grama = upper),
// então a borda água/grama cai na aresta da célula (como no Map Workshop)
const corner = (c, r) => (isWater(c, r) ? "lower" : "upper");
for (let vy = 0; vy <= H; vy++)
  for (let vx = 0; vx <= W; vx++) {
    const k = `${corner(vx - 1, vy - 1)}|${corner(vx, vy - 1)}|${corner(vx - 1, vy)}|${corner(vx, vy)}`;
    const bb = wang.get(k);
    if (!bb) throw new Error(`tile Wang ausente: ${k}`);
    tg.drawImage(tsImg, bb.x, bb.y, bb.width, bb.height, vx * TS - TS / 2, vy * TS - TS / 2, TS, TS);
  }
tg.putImageData(cartoon(tg.getImageData(0, 0, W * TS, H * TS)), 0, 0);
fs.writeFileSync(path.join(OUT_ART, "terrain.png"), terrain.toBuffer("image/png"));
const pure = wang.get("lower|lower|lower|lower");
await savePng(path.join(OUT_ART, "water_tile.png"), tsImg, TS, TS, pure.x, pure.y);

// ---------- objetos ----------
const man = JSON.parse(fs.readFileSync(path.join(EXP, "objects", "manifest.json"), "utf8")).objects;
const slug = (n) => n.replace(/^waterfall pouring.*/, "waterfall").trim().replace(/[^a-z0-9]+/gi, "_").replace(/_+$/, "").toLowerCase();
// pedras do rio ficam como prop (por cima da água animada); sombras e a ponte, no chão
const DECAL = /^(shadow_oval_|bridge_wood)/;
const NON_SOLID = /^(tallgrass_tuft|ground_flower|mushroom|river_shimmer|waterfall|boss_portal_marker|shadow_oval|bridge_wood|river_stone)/;
const TREE = /^tree_/;
const kinds = new Map();
for (const o of man) {
  const s = slug(o.name);
  if (kinds.has(s) || EXCLUDE[s]) continue;
  const b = o.boundingBox;
  const g = o.groundBounds;
  // pé = centro de baixo da área de chão do objeto (groundBounds do Map Workshop), 2 px acima da borda
  const fx = Math.round(g.x + g.width / 2 - b.x);
  const fy = Math.max(1, Math.round(g.y + g.height - b.y) - 2);
  kinds.set(s, { slug: s, file: o.filename, w: b.width, h: b.height, pivot: [fx, fy] });
}
for (const k of kinds.values()) {
  const img = await loadImage(path.join(EXP, "objects", k.file));
  await savePng(path.join(OUT_ART, `${k.slug}.png`), img, img.width, img.height);
  k.w = img.width;
  k.h = img.height;
}
const animProps = {};
for (const [name, frames] of Object.entries(ANIMS)) {
  const keys = [];
  for (let i = 0; i < frames.length; i++) {
    const img = await loadImage(frames[i]);
    const f = `${name}_f${String(i).padStart(2, "0")}`;
    await savePng(path.join(OUT_ART, `${f}.png`), img, img.width, img.height);
    keys.push(PREFIX + f);
  }
  animProps[PREFIX + name] = { frames: keys, frameMs: name === "waterfall" ? 110 : 140 };
}

// ---------- instâncias ----------
const props = [];
const decals = [];
const tuftCells = new Set();
const excluded = {};
for (const o of man) {
  const k = kinds.get(slug(o.name));
  if (!k) {
    excluded[slug(o.name)] = (excluded[slug(o.name)] ?? 0) + 1;
    continue;
  }
  const b = o.boundingBox;
  if (DECAL.test(k.slug)) {
    decals.push({ key: PREFIX + k.slug, x: Math.round(b.x + b.width / 2), y: Math.round(b.y + b.height / 2) });
    continue;
  }
  const x = b.x + k.pivot[0];
  const y = b.y + k.pivot[1];
  const solid = !NON_SOLID.test(k.slug) && x >= 0 && y >= 0 && x < W * TS && y < H * TS;
  props.push({ key: PREFIX + k.slug, x, y, solid, layer: o.layer });
  if (k.slug.startsWith("tallgrass_tuft")) tuftCells.add(Math.floor(y / TS) * W + Math.floor(x / TS));
}
props.sort((a, b) => a.y - b.y || a.x - b.x);

// ---------- colisão e travessia ----------
const solid = new Uint8Array(W * H);
for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (isWater(c, r)) solid[r * W + c] = 1;
// ponte (24,17): o corredor da v15b cruza o rio na linha 17 → as células de água dessa linha ficam livres
const BRIDGE_ROW = 17;
const bridgeCells = [];
for (let c = 0; c < W; c++) if (isWater(c, BRIDGE_ROW)) bridgeCells.push(c);
for (const c of bridgeCells) solid[BRIDGE_ROW * W + c] = 0;
for (const p of props) if (p.solid) solid[Math.floor((p.y - 1) / TS) * W + Math.floor(p.x / TS)] = 1;

// vão da ponte: a bridge_wood da conta é curta e vertical (tábuas atravessadas, corrimão dos lados). Girada 90°, vira
// uma ponte horizontal; o meio (tábuas) é repetido até cobrir a travessia inteira, com as cabeceiras (postes) nas
// pontas. Só remontagem de pixels da arte existente: nenhuma geração.
{
  const src = await loadImage(path.join(OUT_ART, "bridge_wood.png"));
  const probe = createCanvas(src.width, src.height).getContext("2d");
  probe.drawImage(src, 0, 0);
  const pd = probe.getImageData(0, 0, src.width, src.height).data;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < src.height; y++)
    for (let x = 0; x < src.width; x++)
      if (pd[(y * src.width + x) * 4 + 3] > 20) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  // girada 90° no sentido horário: largura = bh, altura = bw
  const rot = createCanvas(bh, bw);
  const rg = rot.getContext("2d");
  rg.imageSmoothingEnabled = false;
  rg.translate(bh, 0);
  rg.rotate(Math.PI / 2);
  rg.drawImage(src, x0, y0, bw, bh, 0, 0, bw, bh);
  const cap = 10;
  const span = (bridgeCells.length + 1) * TS;
  const out = createCanvas(span, bw);
  const og = out.getContext("2d");
  og.imageSmoothingEnabled = false;
  og.drawImage(rot, 0, 0, cap, bw, 0, 0, cap, bw);
  const mid = bh - 2 * cap;
  for (let x = cap; x < span - cap; x += mid) og.drawImage(rot, cap, 0, Math.min(mid, span - cap - x), bw, x, 0, Math.min(mid, span - cap - x), bw);
  og.drawImage(rot, bh - cap, 0, cap, bw, span - cap, 0, cap, bw);
  fs.writeFileSync(path.join(OUT_ART, "bridge_span.png"), out.toBuffer("image/png"));
  fs.rmSync(path.join(OUT_ART, "bridge_wood.png"), { force: true });
  const bi = decals.findIndex((d) => d.key === PREFIX + "bridge_wood");
  if (bi >= 0) decals.splice(bi, 1);
  decals.push({ key: PREFIX + "bridge_span", x: bridgeCells[0] * TS - TS / 2 + span / 2, y: BRIDGE_ROW * TS + TS / 2 });
}

// ---------- inícios, portal ----------
const portalMarker = props.find((p) => p.key === PREFIX + "boss_portal_marker");
const portalCell = { x: Math.floor(portalMarker.x / TS), y: Math.floor((portalMarker.y - 1) / TS) };
// entrada sul: (24,34), logo abaixo da placa da entrada (a placa fica na célula (24,33) e é sólida)
const starts = { player: { x: 24, y: 34 }, from_worldmap: { x: portalCell.x, y: portalCell.y + 3 } };
const portalRect = { x: portalCell.x - 1, y: portalCell.y, w: 3, h: 1 };
for (let c = portalRect.x; c < portalRect.x + portalRect.w; c++) solid[portalRect.y * W + c] = 0;
for (const p of props)
  if (p.solid && Math.floor((p.y - 1) / TS) === portalRect.y && Math.floor(p.x / TS) >= portalRect.x && Math.floor(p.x / TS) < portalRect.x + portalRect.w) p.solid = false;

function bfs(from) {
  const seen = new Uint8Array(W * H);
  const q = [from.y * W + from.x];
  seen[q[0]] = 1;
  for (let i = 0; i < q.length; i++) {
    const x = q[i] % W, y = (q[i] - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (solid[j] || seen[j]) continue;
      seen[j] = 1;
      q.push(j);
    }
  }
  return seen;
}
const reach = bfs(starts.player);

// ---------- encontros: mato (tufos) e clareiras ----------
const PATCHES = [
  [21, 31, "batalha", "entrada-sul-a"], [28, 30, "batalha", "entrada-sul-b"], [10, 17, "batalha", "clareira-oeste"], [14, 11.5, "batalha", "clareira-oeste-norte"],
  [40, 21, "batalha", "santuario"], [40, 6, "batalha", "portal"], [19, 22, "batalha", "margem-oeste"], [33, 19, "batalha", "corredor-leste"],
  [5, 27, "surpresa", "bolsao-sudoeste"], [8, 5, "surpresa", "bolsao-noroeste"],
];
const areas = [];
const groups = new Map();
for (const i of tuftCells) {
  const c = i % W, r = (i - c) / W;
  let best = PATCHES[0], bd = Infinity;
  for (const p of PATCHES) {
    const d = Math.hypot(p[0] - c, p[1] - r);
    if (d < bd) [best, bd] = [p, d];
  }
  if (!groups.has(best[3])) groups.set(best[3], { kind: best[2], cells: [] });
  groups.get(best[3]).cells.push([c, r]);
}
for (const [id, g] of [...groups].sort()) {
  // uma área por tira horizontal de células de mato vizinhas (as áreas do motor são retângulos)
  const rows = new Map();
  for (const [c, r] of g.cells) rows.set(r, [...(rows.get(r) ?? []), c].sort((a, b) => a - b));
  let n = 0;
  for (const [r, cs] of [...rows].sort((a, b) => a[0] - b[0])) {
    let s = cs[0];
    for (let k = 1; k <= cs.length; k++)
      if (k === cs.length || cs[k] !== cs[k - 1] + 1) {
        areas.push({ id: `${g.kind === "surpresa" ? "surpresa" : "mato"}-${id}-${n++}`, terrain: "tall_grass", zoneRef: `${g.kind}:${id}`, rect: { x: s, y: r, w: cs[k - 1] - s + 1, h: 1 }, rateMult: g.kind === "surpresa" ? 1.25 : 1 });
        s = cs[k];
      }
  }
}
const unreachableTufts = [...tuftCells].filter((i) => !reach[i]).length;
// clareiras abertas (V15B.md): oeste, margem do rio, santuário. Ponto = célula livre, alcançável e fora do mato
// mais perto do centro pedido.
const CLEARINGS = [
  { id: "clareira-oeste", at: [12, 15], wander: 3, behavior: "ignore" },
  { id: "margem-rio", at: [20, 12], wander: 2, behavior: "idle" },
  { id: "santuario", at: [41, 16], wander: 3, behavior: "chase" },
  { id: "santuario-sul", at: [38, 21], wander: 2, behavior: "ignore" },
];
const spot = (cx, cy) => {
  let best, bd = Infinity;
  for (let r = 0; r < H; r++)
    for (let c = 0; c < W; c++) {
      const i = r * W + c;
      if (solid[i] || !reach[i] || tuftCells.has(i)) continue;
      const d = Math.hypot(c - cx, r - cy);
      if (d < bd) [best, bd] = [{ x: c, y: r }, d];
    }
  return best;
};
const visible = CLEARINGS.map((cl) => ({ ...cl, spot: spot(cl.at[0], cl.at[1]) }));

// ---------- .tmj ----------
const tiles = [];
const ground = [];
for (let i = 0; i < W * H; i++) {
  tiles.push({ id: i, properties: [{ name: "key", type: "string", value: `${PREFIX}t_${i}` }, ...(solid[i] && isWater(i % W, Math.floor(i / W)) ? [{ name: "solid", type: "bool", value: true }] : [])] });
  ground.push(i + 1);
}
let oid = 1;
const P = (name, type, value) => ({ name, type, value });
const tmj = {
  width: W,
  height: H,
  tilewidth: TS,
  tileheight: TS,
  orientation: "orthogonal",
  properties: [
    P("biome", "string", "forest"),
    P("regionName", "string", "Digi Forest v15b"),
    P("regionRef", "string", "floresta_densa"),
    P("source", "string", `PixelLab map ${mapJson.mapId} (export ${mapJson.exportDate})`),
    P("generator", "string", "scripts/import-pixellab-map.mjs"),
    P("cartoon", "bool", CARTOON),
  ],
  tilesets: [{ firstgid: 1, name: "v15b_terrain", tilewidth: TS, tileheight: TS, tiles }],
  layers: [
    { type: "tilelayer", name: "ground", width: W, height: H, data: ground },
    { type: "objectgroup", name: "decals", objects: decals.map((d) => ({ id: oid++, class: "decal", x: d.x, y: d.y, properties: [P("key", "string", d.key)] })) },
    {
      type: "objectgroup",
      name: "objects_below",
      objects: props.map((p) => ({ id: oid++, class: "prop", x: p.x, y: p.y, properties: [P("key", "string", p.key), ...(p.solid ? [P("solid", "bool", true)] : [])] })),
    },
    {
      type: "objectgroup",
      name: "collision",
      // água (exceto a travessia da ponte) já vem do tile; aqui só fica documentado o que é bloqueio de arte
      objects: [],
    },
    {
      type: "objectgroup",
      name: "triggers",
      objects: [
        ...Object.entries(starts).map(([name, s]) => ({ id: oid++, name, class: "start", x: s.x * TS + TS / 2, y: s.y * TS + TS / 2, point: true })),
        { id: oid++, name: "portal-mapa-mundi", class: "portal", x: portalRect.x * TS, y: portalRect.y * TS, width: portalRect.w * TS, height: portalRect.h * TS, properties: [P("to", "string", "@worldmap"), P("marker", "bool", false)] },
      ],
    },
  ],
};
// tiles das células de água da travessia: livres (sem "solid")
const out = (rel, obj) => {
  const f = path.join(WORLD, rel);
  fs.writeFileSync(f, JSON.stringify(obj, null, rel.endsWith("tmj.json") ? 0 : 2) + "\n");
  return f;
};
out(`src/data/maps/${MAP_ID}.tmj.json`, tmj);

// ---------- pacote de cena (.aliases) ----------
const pivots = {};
for (const k of kinds.values()) pivots[k.slug] = k.pivot;
for (const [name, frames] of Object.entries(ANIMS)) for (let i = 0; i < frames.length; i++) pivots[`${name}_f${String(i).padStart(2, "0")}`] = kinds.get(name)?.pivot ?? [12, 20];
const L = (color, radius, intensity, oy) => ({ color, radius, intensity, oy });
const aliases = {
  _doc: `Digi Forest v15b (PixelLab ${mapJson.mapId}) → art/map-factory/${PACK}/, gerado por scripts/import-pixellab-map.mjs. Chão = terrain.png recortado por célula (${PREFIX}t_<i>); objetos com pé (pivô) do groundBounds; cachoeira e brilho animados; água por deslocamento; filtro cartoon ${CARTOON ? "assado na arte (sat +40%, água +15%, contraste +15%)" : "desligado"}.`,
  pack: "pixellab-none",
  prefix: "plx_",
  extraPacks: [{ pack: PACK, prefix: PREFIX, grid: { from: "terrain", cols: W, rows: H, size: TS, key: "t_" }, pivots }],
  animProps,
  waterAnim: { tile: `${PREFIX}water_tile`, alpha: 0.55, pxPerSec: 6, inset: 5, glints: 0.12 },
  look: {
    id: "v15b",
    doc: "Digi Forest v15b: sem regrade da arte (o filtro cartoon já vem assado); dia/noite pelo ambiente, luzes nos props digitais e no fogo, sombra oval do motor sob árvores e personagens.",
    zoomMul: 1.5,
    grade: { rules: [{ match: ".*", skip: true }] },
    lights: {
      [`${PREFIX}lantern_post`]: L("#ffb347", 44, 0.75, -36),
      [`${PREFIX}campfire`]: L("#ff7a33", 46, 0.9, -8),
      [`${PREFIX}data_crystal_cyan`]: L("#7df0ff", 34, 0.6, -14),
      [`${PREFIX}data_totem_pillar`]: L("#7df0ff", 52, 0.7, -48),
      [`${PREFIX}boss_portal_marker`]: L("#7df0ff", 64, 0.8, -36),
      [`${PREFIX}mushroom_digital`]: L("#7df0ff", 22, 0.45, -8),
    },
    fireKeys: [`${PREFIX}lantern_post`, `${PREFIX}campfire`],
    canopyMask: 0,
    playerLight: { color: "#ffd59a", radius: 48, intensity: 0.38 },
    ambient: {
      day: { multiply: "#ffffff", tint: "#fff2c8", tintAlpha: 0.03, vignette: 0.16, lightScale: 0.35 },
      night: { multiply: "#6f78c8", tint: "#070a2c", tintAlpha: 0.18, vignette: 0.55, lightScale: 1 },
    },
    shadows: { color: "#0a1a12", entityAlpha: 0.42, propAlpha: 0.34, skip: `^${PREFIX}(tallgrass|ground_flower|river_shimmer|waterfall|boss_portal|mushroom)` },
    particles: { fireflies: 0.5, dust: 0.3, leaves: 0.25 },
  },
};
out(`src/data/maps/${MAP_ID}.aliases.json`, aliases);

// ---------- tabela de encontros ----------
const enc = {
  schemaVersion: 1,
  id: `enc-${MAP_ID}`,
  mapId: MAP_ID,
  regionId: "floresta_densa",
  _doc: "Gerada por scripts/import-pixellab-map.mjs. Áreas = células com tufos tallgrass_tuft_b (mato de batalha e bolsões surpresa). As espécies vêm do roster atual (src/sim/encounters/roster.ts): as entradas abaixo são só os pontos visíveis das clareiras, cujas espécies o roster troca pelos Digimon fortes.",
  params: {
    exposure: "steps",
    stepSeconds: 0.32,
    graceSteps: [5, 9],
    minIntervalSec: 2,
    ramp: { start: 6, perStep: 0.05 },
    pMax: 0.55,
    emptyRustle: { chance: 0.05, graceSteps: [2, 4] },
    regionRateMult: 1,
    conditionRateMult: [{ when: { time: ["night"] }, mult: 1.1 }],
    blockedWhen: ["partner_in_combat", "partner_defeated", "partner_evolving", "intro_playing", "safe_zone", "near_portal", "repel_active", "cutscene"],
    nearPortalTiles: 2,
  },
  terrains: { tall_grass: { baseRate: 0.17, label: "Mato alto", visual: `${PREFIX}tallgrass_tuft_b` } },
  areas,
  entries: visible.map((v, i) => ({
    id: `forte-${v.id}`,
    speciesId: "CREATURE-0007",
    name: "Digimon forte",
    mode: "visible",
    rarity: "rare",
    weight: 1,
    levels: [10, 16],
    visible: { spot: { x: v.spot.x, y: v.spot.y, wanderTiles: v.wander, zoneRef: v.id }, behavior: v.behavior, detectRadiusTiles: v.behavior === "chase" ? 4 : 0, loseRadiusTiles: 7, fightable: true, interaction: "none", respawn: { kind: "timer", seconds: 90 + i * 15 }, maxAlive: 1 },
  })),
};
out(`src/data/encounters/${MAP_ID}.json`, enc);

fs.rmSync(tmp, { recursive: true, force: true });
const reachN = reach.reduce((a, b) => a + b, 0);
console.log(
  JSON.stringify(
    {
      map: MAP_ID,
      size: `${W}x${H}`,
      kinds: kinds.size,
      props: props.length,
      solidProps: props.filter((p) => p.solid).length,
      decals: decals.length,
      tuftCells: tuftCells.size,
      areas: areas.length,
      unreachableTufts,
      reachableCells: reachN,
      portalReachable: !!reach[portalRect.y * W + portalRect.x + 1],
      fromWorldmapReachable: !!reach[starts.from_worldmap.y * W + starts.from_worldmap.x],
      bridgeCells,
      visible: visible.map((v) => `${v.id}@${v.spot.x},${v.spot.y}`),
      excluded: Object.fromEntries(Object.entries(excluded).map(([k, n]) => [k, `${n}× — ${EXCLUDE[k]}`])),
      anims: Object.fromEntries(Object.entries(animProps).map(([k, v]) => [k, v.frames.length])),
    },
    null,
    1,
  ),
);
