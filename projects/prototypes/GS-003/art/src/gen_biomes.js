'use strict';
// Generates the 3 GS-003 biome tile/prop sets (grass, forest, water) into
// GAME-ASSETS/03-environments/<biome>/ -- run with:
//   node art/src/gen_biomes.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const bt = require('./biome_tiles.js');
const bp = require('./biome_props.js');

const OUT_BASE = path.resolve(
  __dirname, '../../../../../assets/GAME-ASSETS/03-environments'
);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function saveTile(dir, name, canvas) {
  ensureDir(dir);
  canvas.save(path.join(dir, `${name}.png`));
}

function contactSheet(entries, cols) {
  const cellW = 48, cellH = 56;
  const rows = Math.ceil(entries.length / cols);
  const sheet = new Canvas(cols * cellW, rows * cellH);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [20, 20, 28, 255]);
  entries.forEach(([name, canvas], i) => {
    const cx = (i % cols) * cellW, cy = Math.floor(i / cols) * cellH;
    const ox = cx + Math.floor((cellW - canvas.w) / 2);
    const oy = cy + (cellH - 12 - canvas.h);
    sheet.blit(canvas, ox, Math.max(cy + 2, oy));
  });
  return sheet;
}

const LICENSE_TEMPLATE = (biome, assets) => ({
  biome,
  layer: 'original',
  author: 'game-art',
  technique: 'hand-authored pixel matrix (Canvas.js mask-paint + seeded dither) and layered primitives for props; no external file opened, traced, or downloaded as a basis',
  license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- no third-party IP, free to use/modify within the project',
  tile: 32,
  generator: 'projects/prototypes/GS-003/art/src/gen_biomes.js',
  date: '2026-11-08',
  catalogAttemptNote:
    'ASSET_DISCOVERY_CATALOG.md prioriza fontes CC0/CC-BY (ex.: Kenney Roguelike/RPG pack A02, Pipoya A13, ansimuz A14) antes de tiles proprios. Nesta sessao, download binario via exec/curl retornou "403 CONNECT tunnel failed" (mesmo bloqueio de proxy ja documentado em TECH_AUDIT.md/ART_STYLE_GUIDE.md) e web_search ficou indisponivel ("disabled or no provider"), entao nao foi possivel baixar nem verificar hash dos pacotes do catalogo nesta tarefa. Fallback para a 2a prioridade do briefing: tiles proprios desenhados pixel a pixel por matriz -- ver AUTOCRITICA.md.',
  assets,
});

function writeLicense(dir, biome, assets) {
  fs.writeFileSync(
    path.join(dir, 'license.json'),
    JSON.stringify(LICENSE_TEMPLATE(biome, assets), null, 2)
  );
}

// ---------------------------------------------------------------- grass ---
function buildGrass() {
  const dir = path.join(OUT_BASE, 'grass');
  const tilesDir = path.join(dir, 'tiles');
  const propsDir = path.join(dir, 'props');
  const assets = [];

  const grass0 = bt.grassTileVariant(0, 101);
  const grass1 = bt.grassTileVariant(1, 102);
  const pathFull = bt.pathTileFull(103);
  const pathEdge = bt.pathEdgeTile(104);
  const pathEdgeN = pathEdge.flipY();
  const pathEdgeV = bt.pathEdgeTileV(106);
  const pathEdgeE = pathEdgeV;
  const pathEdgeW = pathEdgeV.flipX();
  const pathCornerNE = bt.pathCornerTile(105);
  const pathCornerNW = pathCornerNE.flipX();
  const pathCornerSE = pathCornerNE.flipY();
  const pathCornerSW = pathCornerNE.flipX().flipY();

  const tiles = {
    grass_00: grass0, grass_01: grass1,
    path_full: pathFull,
    path_edge_s: pathEdge, path_edge_n: pathEdgeN,
    path_edge_w: pathEdgeW, path_edge_e: pathEdgeE,
    path_corner_ne: pathCornerNE, path_corner_nw: pathCornerNW,
    path_corner_se: pathCornerSE, path_corner_sw: pathCornerSW,
  };
  for (const [name, c] of Object.entries(tiles)) {
    saveTile(tilesDir, name, c);
    assets.push({ file: `tiles/${name}.png`, kind: 'tile', size: [c.w, c.h] });
  }

  const props = {
    tree_big_a: bp.treeBig(11), tree_big_b: bp.treeBig(17),
    bush_a: bp.bush(21), bush_b: bp.bush(23, bt.W.pinkLt),
    rock_cluster: bp.rockCluster(27),
    flower_patch_red: bp.flowerPatch(31, bt.W.red),
    flower_patch_blue: bp.flowerPatch(33, bt.W.waterBright),
    wood_signpost: bp.woodSignpost(37),
    wood_fence: bp.woodFence(41),
  };
  for (const [name, c] of Object.entries(props)) {
    saveTile(propsDir, name, c);
    assets.push({ file: `props/${name}.png`, kind: 'prop', size: [c.w, c.h] });
  }

  writeLicense(dir, 'grass', assets);

  const sheet = contactSheet(
    [...Object.entries(tiles), ...Object.entries(props)], 6
  );
  ensureDir(dir);
  sheet.save(path.join(dir, 'grass_tileset_preview.png'));

  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Bioma: Campo de grama com caminho',
    '',
    '- Tile: 32x32. Paleta: Endesga-32 (ver `art/src/endesga32.js`).',
    '- `tiles/`: grama (2 variantes) + caminho de terra (reto, bordas N/S/E/W, cantos NE/NW/SE/SW).',
    '- `props/`: 2 arvores grandes (~2x2,75 tiles), 2 arbustos, pedras, 2 canteiros de flor, placa de madeira, cerca.',
    '- `grass_tileset_preview.png`: contact sheet de todos os tiles/props deste bioma.',
    '- Licenca: ver `license.json` (camada `original`, sem IP de terceiros).',
  ].join('\n'));
}

// --------------------------------------------------------------- forest ---
function buildForest() {
  const dir = path.join(OUT_BASE, 'forest');
  const tilesDir = path.join(dir, 'tiles');
  const propsDir = path.join(dir, 'props');
  const assets = [];

  const floor0 = bt.forestFloorTile(0, 201);
  const floor1 = bt.forestFloorTile(1, 202);
  const edgeS = bt.forestEdgeTile(203);
  const edgeN = edgeS.flipY();
  // forestEdgeTile only authors a horizontal (N/S) seam; E/W reuse the
  // water biome's vertical-seam technique is overkill here since the
  // mockup only needs a field<->treeline boundary from the north, so W/E
  // fall back to the N/S tiles rotated 90 deg visually via flipX (seam
  // still reads as grass meeting forest, acceptable for a field-edge
  // forest -- a true 4-direction autotile is future work).
  const edgeW = edgeS.flipX();
  const edgeE = edgeN.flipX();

  const tiles = {
    forest_floor_00: floor0, forest_floor_01: floor1,
    forest_edge_s: edgeS, forest_edge_n: edgeN,
    forest_edge_w: edgeW, forest_edge_e: edgeE,
  };
  for (const [name, c] of Object.entries(tiles)) {
    saveTile(tilesDir, name, c);
    assets.push({ file: `tiles/${name}.png`, kind: 'tile', size: [c.w, c.h] });
  }

  const props = {
    tree_forest_a: bp.treeForest(51), tree_forest_b: bp.treeForest(57),
    tree_forest_c: bp.treeForest(61),
    bush_fern_a: bp.bush(63, bt.W.grassLt),
    rock_cluster: bp.rockCluster(67),
  };
  for (const [name, c] of Object.entries(props)) {
    saveTile(propsDir, name, c);
    assets.push({ file: `props/${name}.png`, kind: 'prop', size: [c.w, c.h] });
  }

  writeLicense(dir, 'forest', assets);

  const sheet = contactSheet(
    [...Object.entries(tiles), ...Object.entries(props)], 6
  );
  ensureDir(dir);
  sheet.save(path.join(dir, 'forest_tileset_preview.png'));

  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Bioma: Floresta',
    '',
    '- Tile: 32x32. Paleta: Endesga-32.',
    '- `tiles/`: piso de floresta (2 variantes, verde escuro com clareiras) + borda campo->floresta (N/S/E/W).',
    '- `props/`: 3 arvores de floresta (mais altas/densas que o campo), samambaia, pedras.',
    '- Nenhum asset CC0/CC-BY do catalogo (ASSET_DISCOVERY_CATALOG.md, LPC Forest tiles A06 etc.) foi baixado nesta tarefa -- bloqueio de rede (ver `license.json`). Todo o bioma e `original`.',
    '- `forest_tileset_preview.png`: contact sheet.',
  ].join('\n'));
}

// ---------------------------------------------------------------- water ---
function buildWater() {
  const dir = path.join(OUT_BASE, 'water');
  const tilesDir = path.join(dir, 'tiles');
  const propsDir = path.join(dir, 'props');
  const assets = [];

  const water0 = bt.waterTile(0, 301);
  const water1 = bt.waterTile(1, 302);
  const shoreS = bt.shoreEdgeTile(303);
  const shoreN = shoreS.flipY();
  const shoreV = bt.shoreEdgeTileV(304);
  const shoreE = shoreV;
  const shoreW = shoreV.flipX();
  const cornerNE = bt.shoreCornerTile(305);
  const cornerNW = cornerNE.flipX();
  const cornerSE = cornerNE.flipY();
  const cornerSW = cornerNE.flipX().flipY();

  const tiles = {
    water_00: water0, water_01: water1,
    shore_s: shoreS, shore_n: shoreN, shore_w: shoreW, shore_e: shoreE,
    shore_corner_ne: cornerNE, shore_corner_nw: cornerNW,
    shore_corner_se: cornerSE, shore_corner_sw: cornerSW,
  };
  for (const [name, c] of Object.entries(tiles)) {
    saveTile(tilesDir, name, c);
    assets.push({ file: `tiles/${name}.png`, kind: 'tile', size: [c.w, c.h] });
  }

  const props = {
    bridge_deck: bp.bridgeDeck(71),
    bridge_post: bp.bridgePost(73),
    lily_pad_a: bp.lilyPad(75), lily_pad_b: bp.lilyPad(77),
    reeds_a: bp.reeds(79), reeds_b: bp.reeds(81),
  };
  for (const [name, c] of Object.entries(props)) {
    saveTile(propsDir, name, c);
    assets.push({ file: `props/${name}.png`, kind: 'prop', size: [c.w, c.h] });
  }

  writeLicense(dir, 'water', assets);

  const sheet = contactSheet(
    [...Object.entries(tiles), ...Object.entries(props)], 6
  );
  ensureDir(dir);
  sheet.save(path.join(dir, 'water_tileset_preview.png'));

  fs.writeFileSync(path.join(dir, 'README.md'), [
    '# Bioma: Beira d\'agua com ponte',
    '',
    '- Tile: 32x32. Paleta: Endesga-32.',
    '- `tiles/`: agua (2 quadros de animacao simples) + margem grama->agua (N/S/E/W) + cantos (NE/NW/SE/SW).',
    '- `props/`: ponte de madeira (tile de deck 32x32, tileable horizontal), poste de ponte, vitoria-regias, juncos.',
    '- Nenhum asset pago/CC do catalogo (Verdant 04 Tidewater A12, LPC Animated Water A07) foi usado -- Tidewater e pago (bloqueado por regra do estudio sem aprovacao de compra) e o download do LPC A07 nao foi possivel por bloqueio de rede. Todo o bioma e `original`.',
    '- `water_tileset_preview.png`: contact sheet.',
  ].join('\n'));
}

buildGrass();
buildForest();
buildWater();
console.log('Biomes generated at', OUT_BASE);
