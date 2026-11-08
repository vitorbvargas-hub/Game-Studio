// Gera src/data/maps/forest-proof.tmj.json: mapa da prova visual (GS-004 §4, ADR-010), na composição da
// referência canônica do IdleDex: mata densa nas bordas, clareiras ligadas por caminho, grama alta em grade,
// flores e arbustos. Determinístico (mesma semente → mesmo mapa). Uso: npm run map:forest
//
// As chaves visuais são LÓGICAS (prefixo fp_). src/data/maps/forest-proof.aliases.json diz qual PNG real usar
// para cada uma, em ordem de preferência; o pacote GAME-ASSETS/03-environments/forest-v3/ (quando existir)
// tem prioridade sobre todos os outros (ver src/assets/scene-tiles.ts).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 64;
const H = 46;
const T = 32;
let s = 20261108;
const rnd = () => {
  s = (s + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

// Tiles de chão. A mata fechada é sólida (ninguém entra nela; as árvores da borda tapam a passagem).
const TILES = [
  { key: "fp_floor_forest_a", solid: true },
  { key: "fp_floor_forest_b", solid: true },
  { key: "fp_floor_edge" },
  { key: "fp_floor_clearing_a" },
  { key: "fp_floor_clearing_b" },
  { key: "fp_floor_clearing_c" },
  { key: "fp_path" },
];
const gid = Object.fromEntries(TILES.map((t, i) => [t.key, i + 1]));
const at = (x, y) => y * W + x;
const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

// ---- terreno: f = mata, c = clareira, p = caminho ----
const kind = new Array(W * H).fill("f");
const CLEARINGS = [
  { name: "clareira-central", cx: 31, cy: 24, rx: 11.5, ry: 7.5 },
  { name: "clareira-noroeste", cx: 12, cy: 11, rx: 6.5, ry: 4.6 },
  { name: "clareira-leste", cx: 51, cy: 13, rx: 7.5, ry: 5.2 },
  { name: "clareira-sul", cx: 47, cy: 36, rx: 7.5, ry: 4.8 },
  { name: "clareira-sudoeste", cx: 12, cy: 35, rx: 5.5, ry: 4.2 },
];
for (const c of CLEARINGS)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      // borda irregular: o raio oscila com o ângulo (sem círculos perfeitos)
      const a = Math.atan2(y - c.cy, x - c.cx);
      const wob = 1 + 0.12 * Math.sin(a * 3 + c.cx) + 0.07 * Math.sin(a * 7 + c.cy);
      if (((x - c.cx) / (c.rx * wob)) ** 2 + ((y - c.cy) / (c.ry * wob)) ** 2 < 1) kind[at(x, y)] = "c";
    }

// Trilha sinuosa de 1 tile (na escala dos sprites DS, 2 tiles viram avenida) entre as clareiras, com saídas para o sul e para o leste.
// As rotas partem da BORDA da clareira central (o meio dela fica de chão, não vira praça de terra).
const ROUTES = [
  [[13, 12], [18, 15], [22, 19], [25, 22]],
  [[37, 21], [42, 18], [47, 15], [51, 13]],
  [[36, 28], [40, 32], [44, 35], [47, 36]],
  [[25, 28], [21, 31], [16, 33], [12, 35]],
  [[31, 30], [30, 35], [32, 40], [31, 45]],
  [[51, 13], [57, 12], [63, 13]],
  [[25, 22], [28, 23], [31, 24], [34, 23], [37, 21]],
];
const pathTiles = new Set();
let last;
for (const r of ROUTES) {
  last = undefined;
  for (let i = 0; i < r.length - 1; i++) {
    const [ax, ay] = r[i];
    const [bx, by] = r[i + 1];
    const n = Math.ceil(Math.hypot(bx - ax, by - ay) * 3);
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      // leve curva: deslocamento senoidal perpendicular ao segmento
      const off = Math.sin(t * Math.PI) * 1.2 * (i % 2 ? 1 : -1);
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const px = ax + (bx - ax) * t + (-(by - ay) / len) * off;
      const py = ay + (by - ay) * t + ((bx - ax) / len) * off;
      // 1 tile, conectada em 4 direções: num passo diagonal entra também o tile do canto
      const x = Math.floor(px);
      const y = Math.floor(py);
      if (last && last[0] !== x && last[1] !== y && inside(x, last[1])) pathTiles.add(at(x, last[1]));
      if (inside(x, y)) pathTiles.add(at(x, y));
      last = [x, y];
    }
  }
}
// Ao longo do caminho, a mata recua 1 tile (dá para andar ao lado da trilha).
for (const i of pathTiles) {
  const x = i % W;
  const y = Math.floor(i / W);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inside(x + dx, y + dy) && kind[at(x + dx, y + dy)] === "f") kind[at(x + dx, y + dy)] = "c";
}
for (const i of pathTiles) kind[i] = "p";
const k = (x, y) => (inside(x, y) ? kind[at(x, y)] : "f");
const nearOpen = (x, y, r) => {
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (k(x + dx, y + dy) !== "f") return true;
  return false;
};

const ground = new Array(W * H).fill(0);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const t = kind[at(x, y)];
    let key;
    if (t === "p") key = "fp_path";
    else if (t === "c") key = pick(["fp_floor_clearing_a", "fp_floor_clearing_a", "fp_floor_clearing_b", "fp_floor_clearing_c"]);
    // mata colada na clareira: chão de borda e NÃO sólido (os troncos é que bloqueiam)
    else if (nearOpen(x, y, 1)) key = "fp_floor_edge";
    else key = rnd() < 0.6 ? "fp_floor_forest_a" : "fp_floor_forest_b";
    ground[at(x, y)] = gid[key];
  }

// ---- objetos ----
const objects = [];
let oid = 1;
const START = { player: [29, 26], bot: [35, 22], bot2: [25, 21], bot3: [37, 28] };
const KEEP_CLEAR = Object.values(START);
const usedTile = new Set();
const addProp = (key, px, py, solid) => {
  const tx = Math.floor(px / T);
  const ty = Math.floor((py - 1) / T);
  if (!inside(tx, ty)) return false;
  if (solid && usedTile.has(at(tx, ty))) return false;
  if (KEEP_CLEAR.some(([cx, cy]) => Math.abs(cx - tx) <= 1 && Math.abs(cy - ty) <= 1)) return false;
  if (solid) usedTile.add(at(tx, ty));
  objects.push({
    id: oid++,
    name: key,
    type: "prop",
    x: Math.round(px),
    y: Math.round(py),
    point: true,
    properties: [
      { name: "key", type: "string", value: key },
      { name: "solid", type: "bool", value: !!solid },
    ],
  });
  return true;
};

// Mata densa: grade escalonada de árvores (copas sobrepostas), só em tiles de mata.
// Linhas a cada 40 px, colunas a cada 44 px, deslocamento de meia coluna nas linhas ímpares, jitter de ±5 px.
let row = 0;
for (let py = 24; py < H * T + 40; py += 40, row++)
  for (let px = (row % 2 ? 22 : 0) - 10; px < W * T + 30; px += 44) {
    const x = px + Math.round((rnd() - 0.5) * 10);
    const y = py + Math.round((rnd() - 0.5) * 10);
    const tx = Math.floor(x / T);
    const ty = Math.floor((y - 1) / T);
    if (k(tx, ty) !== "f") continue;
    const edge = nearOpen(tx, ty, 1);
    // borda: quase sempre árvore (fecha a clareira); miolo: densidade total
    if (edge && rnd() < 0.12) continue;
    const r = rnd();
    addProp(r < 0.04 ? "fp_tree_flowering" : r < 0.2 ? pick(["fp_tree_e", "fp_tree_f"]) : r < 0.45 ? pick(["fp_tree_c", "fp_tree_d"]) : pick(["fp_tree_a", "fp_tree_b"]), x, y, true);
  }

// Grama alta em manchas (a grade de tufos escuros da referência), nas clareiras, longe do caminho.
const PATCHES = [
  [26, 20, 3.2], [36, 26, 3.0], [22, 26, 2.6], [40, 21, 2.4], [10, 9, 2.6], [14, 13, 2.0],
  [53, 11, 3.0], [48, 15, 2.0], [45, 37, 3.0], [51, 35, 2.4], [11, 36, 2.6],
];
for (const [cx, cy, r] of PATCHES)
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      if (k(x, y) !== "c" || pathTiles.has(at(x, y))) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 > r * r || rnd() < 0.15) continue;
      // dois tufos por tile, em quincôncio, para a mancha ler como grama alta contínua
      addProp(pick(["fp_tall_grass_a", "fp_tall_grass_b"]), x * T + 9, y * T + 15, false);
      addProp(pick(["fp_tall_grass_a", "fp_tall_grass_b"]), x * T + 24, y * T + 31, false);
    }

// Flores, arbustos e pedras soltos nas clareiras; arbustos colados na borda da mata.
const clearTiles = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (kind[at(x, y)] === "c") clearTiles.push([x, y]);
for (let i = 0; i < 70; i++) {
  const [x, y] = pick(clearTiles);
  addProp(pick(["fp_flower_a", "fp_flower_b", "fp_flower_c"]), x * T + 6 + Math.floor(rnd() * 20), y * T + 14 + Math.floor(rnd() * 16), false);
}
for (const [x, y] of clearTiles) if (k(x, y - 1) === "f" && rnd() < 0.35) addProp("fp_bush_a", x * T + 16, y * T + 20, false);
for (let i = 0; i < 10; i++) {
  const [x, y] = pick(clearTiles);
  addProp("fp_rock", x * T + 16, y * T + 26, true);
}
for (let i = 0; i < 16; i++) {
  const [x, y] = pick(clearTiles);
  addProp("fp_mushroom", x * T + 8 + Math.floor(rnd() * 16), y * T + 20 + Math.floor(rnd() * 10), false);
}
for (let i = 0; i < 5; i++) {
  const [x, y] = pick(clearTiles);
  if (!pathTiles.has(at(x, y))) addProp("fp_log", x * T + 16, y * T + 24, true);
}

const tile = (t) => t * T + T / 2;
for (const [name, [x, y]] of Object.entries(START)) objects.push({ id: oid++, name, type: "start", x: tile(x), y: tile(y), point: true });
const spawn = (name, tx, ty, tw, th, species, levelMin, levelMax, count) =>
  objects.push({
    id: oid++,
    name,
    type: "spawn",
    x: tx * T,
    y: ty * T,
    width: tw * T,
    height: th * T,
    properties: [
      { name: "species", type: "string", value: species.join(",") },
      { name: "levelMin", type: "int", value: levelMin },
      { name: "levelMax", type: "int", value: levelMax },
      { name: "count", type: "int", value: count },
    ],
  });
spawn("clareira-central-oeste", 21, 20, 8, 8, ["CREATURE-0005", "CREATURE-0008", "CREATURE-0011", "CREATURE-0002"], 2, 4, 5);
spawn("clareira-central-leste", 33, 20, 8, 8, ["CREATURE-0006", "CREATURE-0009", "CREATURE-0005", "CREATURE-0011"], 3, 5, 5);
spawn("clareira-noroeste", 7, 8, 9, 6, ["CREATURE-0006", "CREATURE-0009", "CREATURE-0003"], 4, 6, 3);
spawn("clareira-leste", 46, 10, 10, 7, ["CREATURE-0012", "CREATURE-0008", "CREATURE-0009"], 4, 6, 4);
spawn("clareira-sul", 42, 33, 10, 6, ["CREATURE-0007", "CREATURE-0010", "CREATURE-0013", "CREATURE-0004"], 8, 10, 3);
spawn("clareira-sudoeste", 8, 32, 8, 6, ["CREATURE-0005", "CREATURE-0002", "CREATURE-0011"], 1, 3, 3);

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
  properties: [
    { name: "biome", type: "string", value: "forest" },
    { name: "regionName", type: "string", value: "Floresta Densa" },
  ],
  tilesets: [
    {
      firstgid: 1,
      name: "forest-proof",
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

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/data/maps/forest-proof.tmj.json");
writeFileSync(out, JSON.stringify(map) + "\n");
console.log(`ok: ${out} (${W}x${H}, ${objects.length} objetos)`);
