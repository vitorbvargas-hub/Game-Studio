// Gera src/data/maps/test-meadow.tmj (Tiled JSON). Determinístico: mesma semente → mesmo mapa.
// Uso: npm run map. O arquivo gerado é versionado; pode ser aberto e editado no Tiled.
// As chaves de tile ("key") são o contrato com o game-art: um PNG <key>.png em
// GAME-ASSETS/03-environments/** substitui o placeholder (ver README).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 56;
const H = 40;
const T = 32;
let s = 1234567;
const rnd = () => {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Chaves = nomes dos PNGs do game-art (GAME-ASSETS/03-environments/{grass,water}/tiles).
// Convenção verificada nos PNGs: o sufixo indica o lado onde está o caminho/a água (path_edge_n = caminho ao norte).
const TILES = [
  { key: "grass_00" },
  { key: "grass_01" },
  { key: "path_full" },
  ...["n", "s", "e", "w"].map((d) => ({ key: `path_edge_${d}` })),
  ...["ne", "nw", "se", "sw"].map((d) => ({ key: `path_corner_${d}` })),
  { key: "water_00", solid: true },
  ...["n", "s", "e", "w"].map((d) => ({ key: `shore_${d}` })),
  ...["ne", "nw", "se", "sw"].map((d) => ({ key: `shore_corner_${d}` })),
];
const gid = Object.fromEntries(TILES.map((t, i) => [t.key, i + 1]));

// Grade de terreno: g = grama, p = caminho, w = água.
const kind = new Array(W * H).fill("g");
const at = (x, y) => y * W + x;
const lake = { cx: 41, cy: 11, rx: 7.5, ry: 5.2 };
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) if (((x - lake.cx) / lake.rx) ** 2 + ((y - lake.cy) / lake.ry) ** 2 < 1) kind[at(x, y)] = "w";
for (let x = 3; x < W - 3; x++) kind[at(x, 20)] = "p";
for (let y = 4; y < H - 4; y++) kind[at(18, y)] = "p";
const k = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? "g" : kind[at(x, y)]);

/** Autotile de meia-célula: grama vizinha de caminho/água recebe a borda do lado em que ele está. */
function edgeKey(x, y, feat, edge, corner) {
  const n = k(x, y - 1) === feat;
  const s2 = k(x, y + 1) === feat;
  const e = k(x + 1, y) === feat;
  const w = k(x - 1, y) === feat;
  const cnt = [n, s2, e, w].filter(Boolean).length;
  if (cnt === 1) return `${edge}_${n ? "n" : s2 ? "s" : e ? "e" : "w"}`;
  if (cnt === 2 && (n || s2) && (e || w)) return `${corner}_${n ? "n" : "s"}${e ? "e" : "w"}`;
  return null;
}

const ground = new Array(W * H).fill(0);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const t = kind[at(x, y)];
    let key = t === "w" ? "water_00" : t === "p" ? "path_full" : rnd() < 0.7 ? "grass_00" : "grass_01";
    if (t === "g") key = edgeKey(x, y, "w", "shore", "shore_corner") ?? edgeKey(x, y, "p", "path_edge", "path_corner") ?? key;
    ground[at(x, y)] = gid[key];
  }
const isFree = (x, y) => kind[at(x, y)] === "g" && (ground[at(x, y)] === gid.grass_00 || ground[at(x, y)] === gid.grass_01);

const objects = [];
const KEEP_CLEAR = [
  [15, 22],
  [24, 18],
];
let oid = 1;
const solidAt = new Set();
const addProp = (key, tx, ty, solid, where = "grass") => {
  const i = at(tx, ty);
  if (where === "grass" && !isFree(tx, ty)) return;
  if (where === "water" && kind[i] !== "w") return;
  if (solidAt.has(i)) return;
  if (KEEP_CLEAR.some(([cx, cy]) => Math.abs(cx - tx) <= 2 && Math.abs(cy - ty) <= 2)) return;
  if (solid) solidAt.add(i);
  objects.push({
    id: oid++,
    name: key,
    type: "prop",
    x: tx * T + T / 2,
    y: ty * T + T - 2,
    point: true,
    properties: [
      { name: "key", type: "string", value: key },
      { name: "solid", type: "bool", value: !!solid },
    ],
  });
};

// Borda de árvores (com falhas) e bosques. Árvores grandes a cada 2 tiles para as copas não se sobreporem demais.
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
for (let x = 0; x < W; x += 2)
  for (const y of [1, H - 1]) if (rnd() < 0.9) addProp(pick(["tree_big_a", "tree_big_b"]), x, y, true);
for (let y = 3; y < H - 1; y += 2) for (const x of [0, W - 1]) if (rnd() < 0.9) addProp(pick(["tree_big_a", "tree_big_b"]), x, y, true);
const groves = [
  { cx: 6, cy: 6, r: 3.4 },
  { cx: 28, cy: 6, r: 2.8 },
  { cx: 50, cy: 26, r: 3.0 },
  { cx: 26, cy: 34, r: 3.2 },
];
for (const g of groves)
  for (let y = Math.floor(g.cy - g.r); y <= g.cy + g.r; y += 2)
    for (let x = Math.floor(g.cx - g.r) + (y % 4 === 0 ? 1 : 0); x <= g.cx + g.r; x += 2)
      if ((x - g.cx) ** 2 + (y - g.cy) ** 2 < g.r * g.r && rnd() < 0.85) addProp(pick(["tree_forest_a", "tree_forest_b", "tree_forest_c"]), x, y, true);
for (let i = 0; i < 24; i++) addProp(pick(["bush_a", "bush_b", "bush_fern_a"]), 2 + Math.floor(rnd() * (W - 4)), 2 + Math.floor(rnd() * (H - 4)), false);
for (let i = 0; i < 26; i++) addProp(pick(["flower_patch_red", "flower_patch_blue"]), 2 + Math.floor(rnd() * (W - 4)), 2 + Math.floor(rnd() * (H - 4)), false);
for (let i = 0; i < 12; i++) addProp("rock_cluster", 2 + Math.floor(rnd() * (W - 4)), 2 + Math.floor(rnd() * (H - 4)), true);
for (let i = 0; i < 10; i++) addProp(pick(["lily_pad_a", "lily_pad_b"]), Math.round(lake.cx - lake.rx + rnd() * 2 * lake.rx), Math.round(lake.cy - lake.ry + rnd() * 2 * lake.ry), false, "water");
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) if (ground[at(x, y)] === gid.shore_s && rnd() < 0.3) addProp(pick(["reeds_a", "reeds_b"]), x, y, false, "shore");
addProp("wood_signpost", 17, 23, true);

const tile = (tx) => tx * T;
objects.push({ id: oid++, name: "player", type: "start", x: tile(15), y: tile(22), point: true });
objects.push({ id: oid++, name: "bot", type: "start", x: tile(24), y: tile(18), point: true });
const spawn = (name, tx, ty, tw, th, species, levelMin, levelMax, count) =>
  objects.push({
    id: oid++,
    name,
    type: "spawn",
    x: tile(tx),
    y: tile(ty),
    width: tile(tw),
    height: tile(th),
    properties: [
      { name: "species", type: "string", value: species.join(",") },
      { name: "levelMin", type: "int", value: levelMin },
      { name: "levelMax", type: "int", value: levelMax },
      { name: "count", type: "int", value: count },
    ],
  });
spawn("prado-oeste", 4, 23, 10, 8, ["CREATURE-0005", "CREATURE-0008", "CREATURE-0011", "CREATURE-0002"], 1, 3, 5);
spawn("prado-leste", 24, 23, 10, 8, ["CREATURE-0005", "CREATURE-0011", "CREATURE-0002", "CREATURE-0006"], 2, 4, 5);
spawn("colina-norte", 8, 9, 8, 7, ["CREATURE-0006", "CREATURE-0009", "CREATURE-0003"], 3, 5, 4);
spawn("margem-lago", 32, 17, 8, 3, ["CREATURE-0012", "CREATURE-0008"], 3, 4, 2);
spawn("clareira-campeoes", 40, 28, 10, 8, ["CREATURE-0007", "CREATURE-0010", "CREATURE-0004", "CREATURE-0013"], 6, 8, 3);

const map = {
  type: "map",
  version: "1.10",
  tiledversion: "1.10.2",
  orientation: "orthogonal",
  renderorder: "right-down",
  width: W,
  height: H,
  tilewidth: T,
  tileheight: T,
  infinite: false,
  nextlayerid: 3,
  nextobjectid: oid,
  properties: [{ name: "biome", type: "string", value: "meadow" }],
  tilesets: [
    {
      firstgid: 1,
      name: "meadow",
      tilewidth: T,
      tileheight: T,
      tilecount: TILES.length,
      columns: 0,
      tiles: TILES.map((t, i) => ({
        id: i,
        properties: [
          { name: "key", type: "string", value: t.key },
          { name: "solid", type: "bool", value: !!t.solid },
        ],
      })),
    },
  ],
  layers: [
    { id: 1, type: "tilelayer", name: "ground", width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: ground },
    { id: 2, type: "objectgroup", name: "objects", x: 0, y: 0, opacity: 1, visible: true, objects },
  ],
};

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/data/maps/test-meadow.tmj.json");
writeFileSync(out, JSON.stringify(map) + "\n");
console.log(`ok: ${out} (${W}x${H}, ${objects.length} objetos)`);
