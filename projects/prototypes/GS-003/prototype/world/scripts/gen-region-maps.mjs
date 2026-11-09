// Mapas de teste das regiões (Tiled JSON, mesmo contrato do forest-proof): Praia dos Postes (praia-v5) e Vila dos
// Bebês (vila-v5), pacotes do game-art em GAME-ASSETS/03-environments (Ninja Adventure CC0 + poste próprio).
// Chave 'pr5_<nome>' / 'vl5_<nome>' = PNG <nome> do pacote (src/data/maps/<mapa>.aliases.json). Autotile de 16 peças
// (N1 E2 S4 W8, como o forest-v4 / art/src/na_blob.js): água e trilha. As saídas ficam na borda (portal) e levam ao
// forest-proof, que tem as saídas de volta (gen-forest-proof.mjs). Uso: npm run map:regions

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const T = 32;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "../src/data/maps");

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Monta o .tmj: chave/sólido por tile, chão, props, starts, spawns e portais. */
function build({ name, W, H, ground, solidKeys, props, starts, spawns, portals, properties }) {
  const keys = [...new Set(ground)];
  const gid = new Map(keys.map((k, i) => [k, i + 1]));
  let oid = 1;
  const objects = [];
  for (const p of props)
    objects.push({
      id: oid++, name: "", type: "prop", x: p.x, y: p.y, point: true,
      properties: [
        { name: "key", type: "string", value: p.key },
        { name: "solid", type: "bool", value: !!p.solid },
        ...(p.solidW ? [{ name: "solidW", type: "int", value: p.solidW }, { name: "solidH", type: "int", value: p.solidH ?? 1 }] : []),
      ],
    });
  for (const [n, [x, y]] of Object.entries(starts)) objects.push({ id: oid++, name: n, type: "start", x, y, point: true });
  for (const s of spawns)
    objects.push({
      id: oid++, name: s.name, type: "spawn", x: s.x * T, y: s.y * T, width: s.w * T, height: s.h * T,
      properties: [
        { name: "species", type: "string", value: s.species.join(",") },
        { name: "levelMin", type: "int", value: s.levelMin },
        { name: "levelMax", type: "int", value: s.levelMax },
        { name: "count", type: "int", value: s.count },
      ],
    });
  for (const p of portals)
    objects.push({
      id: oid++, name: p.name, type: "portal", x: p.x * T, y: p.y * T, width: p.w * T, height: p.h * T,
      properties: [
        { name: "to", type: "string", value: p.to },
        { name: "toStart", type: "string", value: p.toStart },
      ],
    });
  const map = {
    type: "map", version: "1.10", tiledversion: "1.10.2", orientation: "orthogonal", renderorder: "right-down",
    width: W, height: H, tilewidth: T, tileheight: T, infinite: false, nextlayerid: 3, nextobjectid: oid,
    properties: Object.entries(properties).map(([k, v]) => ({ name: k, type: "string", value: v })),
    tilesets: [{
      firstgid: 1, name, tilewidth: T, tileheight: T, tilecount: keys.length, columns: 0,
      tiles: keys.map((k, i) => ({ id: i, properties: [{ name: "key", type: "string", value: k }, { name: "solid", type: "bool", value: solidKeys(k) }] })),
    }],
    layers: [
      { id: 1, type: "tilelayer", name: "ground", width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: ground.map((k) => gid.get(k)) },
      { id: 2, type: "objectgroup", name: "objects", x: 0, y: 0, opacity: 1, visible: true, objects },
    ],
  };
  const out = join(OUT, `${name}.tmj.json`);
  writeFileSync(out, JSON.stringify(map) + "\n");
  console.log(`ok: ${out} (${W}x${H}, ${objects.length} objetos)`);
}

/** Máscara de 16 peças: vizinhos (N1 E2 S4 W8) que também são do conjunto; fora do mapa conta como `outside`. */
function blobMask(isIn, x, y, W, H, outside) {
  const v = (xx, yy) => (xx < 0 || yy < 0 || xx >= W || yy >= H ? outside : isIn(xx, yy));
  return (v(x, y - 1) ? 1 : 0) | (v(x + 1, y) ? 2 : 0) | (v(x, y + 1) ? 4 : 0) | (v(x - 1, y) ? 8 : 0);
}

const px = (t) => t * T + T / 2;

// ---------- Praia dos Postes ----------
{
  const W = 44, H = 28;
  const r = rng(707);
  // mar a leste com a linha da costa ondulada e uma enseada; areia no resto
  const shore = (y) => 31 + Math.round(2.4 * Math.sin(y / 3.6) + 1.2 * Math.sin(y / 1.7));
  const water = (x, y) => x >= shore(y) || (x >= 27 && y >= 22 && (x - 31) ** 2 + (y - 27) ** 2 < 22);
  const ground = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (water(x, y)) ground.push(`pr5_water_blob_${blobMask(water, x, y, W, H, true)}`);
      else {
        const q = r();
        // sand_00 é o chão liso; sand_02 (pedrinhas) só salpicada; sand_01 (degrau) não ladrilha
        ground.push(`pr5_sand_0${q < 0.985 ? 0 : 2}`);
      }
    }
  // os postes da praia: uma linha na areia, paralela à costa
  const props = [];
  for (let y = 3; y < H - 2; y += 4) props.push({ key: "pr5_electric_pole", x: (shore(y) - 6) * T + T / 2, y: y * T + T, solid: true });
  build({
    name: "praia", W, H, ground, props,
    solidKeys: (k) => /water_blob/.test(k),
    properties: { biome: "praia", regionName: "Praia dos Postes" },
    starts: { player: [px(2), px(13) + 16], from_floresta: [px(2), px(13) + 16] },
    spawns: [
      { name: "praia-norte", x: 8, y: 3, w: 12, h: 7, species: ["CREATURE-0105", "CREATURE-0108", "CREATURE-0113", "CREATURE-0104"], levelMin: 4, levelMax: 8, count: 5 },
      { name: "praia-sul", x: 9, y: 17, w: 12, h: 7, species: ["CREATURE-0114", "CREATURE-0118", "CREATURE-0113", "CREATURE-0105"], levelMin: 5, levelMax: 9, count: 5 },
    ],
    portals: [{ name: "oeste-floresta", x: 0, y: 11, w: 1, h: 6, to: "forest-proof", toStart: "from_praia" }],
  });
}

// ---------- Vila dos Bebês ----------
{
  const W = 36, H = 26;
  const r = rng(909);
  const road = (x, y) =>
    // a rua norte-sul vai até a borda sul (saída para a Floresta Digimon, Map Factory)
    (x === 17 || x === 18) || ((y === 12 || y === 13) && x >= 4 && x <= 31) || (x >= 14 && x <= 21 && y >= 10 && y <= 15);
  const ground = [];
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (road(x, y)) ground.push(`vl5_path_blob_${blobMask(road, x, y, W, H, false)}`);
      else {
        const q = r();
        // grass_00 do pacote é uma faixa de borda grama/terra (não ladrilha): o chão usa grass_02 (liso) e grass_01
        ground.push(`vl5_grass_0${q < 0.7 ? 2 : 1}`);
      }
    }
  const foot = (tx, ty) => ({ x: tx * T + T / 2, y: ty * T + T });
  const props = [
    { key: "vl5_house_big", ...foot(9, 9), solid: true, solidW: 4, solidH: 3 },
    { key: "vl5_house_cottage", ...foot(26, 9), solid: true, solidW: 3, solidH: 2 },
    { key: "vl5_house_small", ...foot(9, 19), solid: true, solidW: 3, solidH: 2 },
    { key: "vl5_house_small", ...foot(26, 19), solid: true, solidW: 3, solidH: 2 },
  ];
  // berçário: berços e ovos em volta da praça
  for (const [x, y] of [[15, 16], [20, 16], [15, 9], [20, 9]]) props.push({ key: "vl5_crib", ...foot(x, y), solid: true });
  for (const [x, y] of [[13, 15], [22, 11], [12, 10], [23, 15]]) props.push({ key: "vl5_egg_cluster", ...foot(x, y), solid: false });
  // cerca ao sul e arbustos nas bordas
  for (let x = 6; x <= 29; x++) if (x < 16 || x > 19) props.push({ key: "vl5_fence", ...foot(x, 23), solid: true });
  for (let y = 2; y < H - 1; y += 3) {
    props.push({ key: r() < 0.5 ? "vl5_bush_big" : "vl5_bush_small", ...foot(1, y), solid: true, solidW: 2, solidH: 1 });
    props.push({ key: r() < 0.5 ? "vl5_bush_big" : "vl5_bush_small", ...foot(34, y), solid: true, solidW: 2, solidH: 1 });
  }
  build({
    name: "vila", W, H, ground, props,
    solidKeys: () => false,
    properties: { biome: "vila", regionName: "Vila dos Bebês" },
    starts: { player: [18 * T, px(2)], from_floresta: [18 * T, px(2)], "from_digimon-forest-01": [18 * T, px(22)] },
    spawns: [],
    portals: [
      { name: "norte-floresta", x: 16, y: 0, w: 4, h: 1, to: "forest-proof", toStart: "from_vila" },
      // Map Factory (piloto): saída sul pelo vão da cerca até a Floresta Digimon — Prototype 01
      { name: "sul-digimon-forest", x: 16, y: 25, w: 4, h: 1, to: "digimon-forest-01", toStart: "from_vila" },
    ],
  });
}
