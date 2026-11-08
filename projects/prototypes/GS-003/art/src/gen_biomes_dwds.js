'use strict';
// GS-003 -- "-dwds" biome packs: real Digimon World DS ground textures
// (cropped straight, no matting needed -- flat opaque fills) + enhanced
// procedural props (biome_props.js techniques, denser placement, DW-sampled
// accent palette). Keeps grass/forest/water (the original packs) as fallback
// per the founder's request -- these are new siblings, nothing there changes.
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadSheetCanvas, cropRect } = require('./dwds_extract.js');
const { DW } = require('./dwds_palette.js');
const bt = require('./biome_tiles.js');
const bp = require('./biome_props.js');
const { drawText } = require('./font5x3.js');

const SRC = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/10-source-files/spriters-resource/');
const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/');
const TILE = 32;

function digiFarmDefault() { return loadSheetCanvas(path.join(SRC, 'dgmnworldds__arrow-drop-down__Digi-Farm-Default__20471.png')); }
function beastDigiFarm() { return loadSheetCanvas(path.join(SRC, 'dgmnworldds__arrow-drop-down__Beast-Digi-Farm__20469.png')); }

function realCrop(sheet, x0, y0) { return cropRect(sheet, x0, y0, x0 + TILE - 1, y0 + TILE - 1); }

// Multiply-darken a real crop in place (e.g. simulate canopy shade on a
// grass swatch sampled from open ground) -- still the same real pixels,
// just tinted, not redrawn.
function shade(canvas, factor) {
  const out = new Canvas(canvas.w, canvas.h);
  for (let y = 0; y < canvas.h; y++) {
    for (let x = 0; x < canvas.w; x++) {
      const p = canvas.getPixel(x, y);
      out.setPixel(x, y, [Math.round(p[0] * factor), Math.round(p[1] * factor), Math.round(p[2] * factor), p[3]]);
    }
  }
  return out;
}

// ---- local DW-palette tile painters (same dither technique as
// biome_tiles.js's grassBase/dirtTexture, reimplemented against DW.* so the
// shared W palette used by grass/forest/water packs is untouched) ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dwGrassTile(seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, DW.grassMid);
  const rnd = rng(seed);
  for (let i = 0; i < 26; i++) {
    const bx = 1 + Math.floor(rnd() * (TILE - 2));
    const by = 1 + Math.floor(rnd() * (TILE - 4));
    const lit = (bx + by) < 26;
    const tone = (lit ? rnd() < 0.6 : rnd() < 0.3) ? DW.grassBright : DW.grassDk;
    c.setPixel(bx, by, tone);
    if (rnd() < 0.5) c.setPixel(bx, by + 1, tone);
  }
  if (rnd() < 0.35) {
    const fx = 2 + Math.floor(rnd() * (TILE - 4)), fy = 2 + Math.floor(rnd() * (TILE - 4));
    c.setPixel(fx, fy, [255, 255, 255, 255]);
    c.setPixel(fx + 1, fy, [255, 230, 90, 255]);
  }
  return c;
}

function dwSandTile(seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, DW.sand);
  const rnd = rng(seed);
  for (let i = 0; i < 16; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, rnd() < 0.5 ? DW.sandDk : DW.cliffTan);
  }
  return c;
}

function dwGrassSandEdgeS(seed) {
  const c = dwGrassTile(seed);
  for (let y = 18; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) c.setPixel(x, y, DW.sand);
  }
  const rnd = rng(seed + 3);
  for (let x = 0; x < TILE; x++) {
    if (rnd() < 0.7) c.setPixel(x, 17 + Math.floor(rnd() * 2), DW.grassDk);
  }
  for (let i = 0; i < 10; i++) {
    const px = Math.floor(rnd() * TILE), py = 19 + Math.floor(rnd() * 11);
    c.setPixel(px, py, rnd() < 0.5 ? DW.sandDk : DW.cliffTan);
  }
  return c;
}

function dwWaterTile(frame, seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, DW.water);
  const rnd = rng(seed + frame * 17);
  const wiggle = [0, 1, 2, 1, 0, -1, -2, -1];
  const phase = frame === 0 ? 0 : 4;
  for (let row = 0; row < 4; row++) {
    const y0 = 3 + row * 8;
    for (let x = 0; x < TILE; x++) {
      const w = wiggle[(x + phase) % 8];
      const y = y0 + w;
      if (y >= 0 && y < TILE && x % 4 < 2) c.setPixel(x, y, DW.waterLt);
    }
  }
  for (let i = 0; i < 5; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, frame === 1 ? DW.foam : DW.waterLt);
  }
  return c;
}

function dwShoreEdgeS(seed) {
  const c = dwGrassTile(seed);
  for (let y = 17; y < TILE; y++) for (let x = 0; x < TILE; x++) c.setPixel(x, y, DW.water);
  for (let x = 0; x < TILE; x++) if (x % 3 !== 0) c.setPixel(x, 16, DW.foam);
  const rnd = rng(seed + 9);
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(rnd() * TILE), py = 18 + Math.floor(rnd() * 13);
    c.setPixel(px, py, DW.waterLt);
  }
  return c;
}

// Dark, DW-shaded forest-floor tile -- same mottled-undergrowth idea as
// biome_tiles.forestFloorTile, repainted with the sampled DW greens.
function dwForestFloorTile(seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, [20, 96, 40, 255]);
  const rnd = rng(seed);
  for (let i = 0; i < 10; i++) {
    const cx = 2 + Math.floor(rnd() * (TILE - 4)), cy = 2 + Math.floor(rnd() * (TILE - 4));
    const tone = rnd() < 0.5 ? [8, 56, 24, 255] : DW.grassDk;
    c.fillEllipse(cx, cy, 2, 1, tone);
  }
  for (let i = 0; i < 8; i++) {
    const px = 1 + Math.floor(rnd() * (TILE - 2)), py = 1 + Math.floor(rnd() * (TILE - 2));
    c.setPixel(px, py, rnd() < 0.5 ? DW.grassMid : [8, 56, 24, 255]);
  }
  return c;
}

// ---- preview contact sheet ----
function buildPreview(title, tiles, props) {
  const cell = 48, scale = 2;
  const cols = Math.max(tiles.length, props.length, 1);
  const w = Math.max(cell * scale * cols + 40, 420);
  const h = 30 + 2 * (cell * scale + 24);
  const sheet = new Canvas(w, h);
  sheet.fillRect(0, 0, w - 1, h - 1, [24, 26, 34, 255]);
  drawText(sheet, title, 8, 6, [255, 230, 120, 255]);
  function row(items, y, label) {
    drawText(sheet, label, 8, y, [200, 210, 230, 255]);
    items.forEach((im, i) => {
      const x = 8 + i * (cell * scale + 6);
      const big = im.scaleNearest(scale);
      sheet.blit(big, x, y + 10);
    });
  }
  row(tiles, 22, 'TILES');
  row(props, 22 + cell * scale + 24, 'PROPS');
  return sheet;
}

function writeAssets(biomeDir, tiles, props) {
  const tilesDir = path.join(biomeDir, 'tiles');
  const propsDir = path.join(biomeDir, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });
  for (const [name, canvas] of Object.entries(tiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(props)) canvas.save(path.join(propsDir, `${name}.png`));
}

function tilesetJson(biome, tiles, props, collisionMap) {
  return {
    biome,
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    tiles: Object.keys(tiles).map((name) => ({
      file: `tiles/${name}.png`,
      collision: !!collisionMap[name],
      suggestedLayer: 'ground',
    })),
    props: Object.keys(props).map((name) => ({
      file: `props/${name}.png`,
      collision: !(name.includes('flower') || name.includes('reed') || name.includes('lily')),
      suggestedLayer: 'decoration',
    })),
  };
}

function licenseJson(biome, realFiles) {
  return {
    biome,
    layer: 'mixed',
    assets: [
      {
        group: 'tiles (ground, real crop)',
        layer: 'official-fan-use',
        files: realFiles,
        source: {
          type: 'game-rip',
          game: 'Digimon World DS (Nintendo DS)',
          site: 'The Spriters Resource',
          sitePage: 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/',
          providedBy: 'varredura automatica (Spriters Resource), fundador autorizou em 2026-11-08',
          retrievedAt: '2026-11-08',
          modifications: 'recorte retangular direto 32x32 de uma area plana da cena (sem objetos sobrepostos); nenhum chroma-key necessario (tile de chao e sempre opaco); sem redesenho.',
        },
        credit: { ripper: 'Atlanta', site: 'The Spriters Resource' },
        copyright: 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games',
        basis: 'ADR-009 Secao Licenca (fundador, 2026-11-08)',
        nonCommercial: true,
        restrictions: ['ADR-007: sem monetizacao, sem logo oficial, aviso de fan game', 'Publicacao exige aprovacao do fundador'],
      },
      {
        group: 'tiles (derivados) + props',
        layer: 'original',
        author: 'game-art',
        technique: 'pixel matrix (Canvas.js mask-paint + seeded dither), paleta amostrada das folhas DW DS reais acima (art/src/dwds_palette.js) -- nao e recorte, e composicao original informada pela referencia visual.',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- sem IP de terceiro alem da paleta de cor amostrada',
      },
    ],
    verifiedAt: '2026-11-08',
    verifiedBy: 'game-art',
  };
}

function main() {
  const digiFarm = digiFarmDefault();
  const beast = beastDigiFarm();

  // ---------------------------------------------------------------- campo
  {
    const biomeDir = path.join(OUT, 'campo-dwds');
    const grassReal = realCrop(digiFarm, 580, 48); // flat grass, verified 32x32-exact pure match, no objects
    const sandReal = realCrop(digiFarm, 352, 76); // flat sand patch interior, verified pure match
    const tiles = {
      ground_grass_real: grassReal,
      ground_sand_real: sandReal,
      grass_00: dwGrassTile(11),
      grass_01: dwGrassTile(29),
      path_full: dwSandTile(41),
      path_edge_s: dwGrassSandEdgeS(53),
    };
    const props = {
      tree_a: bp.treeBig(101),
      tree_b: bp.treeBig(107),
      bush_a: bp.bush(111, null),
      bush_b: bp.bush(119, DW.foam),
      rock_cluster: bp.rockCluster(127),
      flower_patch_red: bp.flowerPatch(131, [228, 59, 68, 255]).scaleNearest(2),
      flower_patch_pink: bp.flowerPatch(137, [181, 80, 136, 255]).scaleNearest(2),
      wood_signpost: bp.woodSignpost(141),
      wood_fence: bp.woodFence(149),
    };
    writeAssets(biomeDir, tiles, props);
    fs.writeFileSync(path.join(biomeDir, 'tileset.json'), JSON.stringify(
      tilesetJson('campo-dwds', tiles, props, { path_full: false, path_edge_s: false }), null, 2));
    fs.writeFileSync(path.join(biomeDir, 'license.json'), JSON.stringify(
      licenseJson('campo-dwds', ['tiles/ground_grass_real.png', 'tiles/ground_sand_real.png']), null, 2));
    buildPreview('CAMPO-DWDS', Object.values(tiles), Object.values(props)).save(path.join(biomeDir, 'tileset.png'));
  }

  // ------------------------------------------------------------- floresta
  {
    const biomeDir = path.join(OUT, 'floresta-dwds');
    const grassShadeReal = shade(realCrop(beast, 608, 120), 0.55); // bright grass near the tree cluster, verified pure match, darkened to read as canopy shade
    const tiles = {
      ground_grass_shade_real: grassShadeReal,
      forest_floor_00: dwForestFloorTile(211),
      forest_floor_01: dwForestFloorTile(227),
      grass_edge: dwGrassTile(233),
    };
    const props = {
      tree_a: bp.treeForest(311),
      tree_b: bp.treeForest(317),
      tree_c: bp.treeForest(323),
      bush_a: bp.bush(331, null),
      bush_b: bp.bush(337, [63, 199, 77, 255]),
      rock_cluster: bp.rockCluster(341),
      flower_patch_white: bp.flowerPatch(347, [255, 255, 255, 255]).scaleNearest(2),
    };
    writeAssets(biomeDir, tiles, props);
    fs.writeFileSync(path.join(biomeDir, 'tileset.json'), JSON.stringify(
      tilesetJson('floresta-dwds', tiles, props, {}), null, 2));
    fs.writeFileSync(path.join(biomeDir, 'license.json'), JSON.stringify(
      licenseJson('floresta-dwds', ['tiles/ground_grass_shade_real.png']), null, 2));
    buildPreview('FLORESTA-DWDS', Object.values(tiles), Object.values(props)).save(path.join(biomeDir, 'tileset.png'));
  }

  // ----------------------------------------------------------------- agua
  {
    const biomeDir = path.join(OUT, 'agua-dwds');
    const waterReal = realCrop(beast, 416, 84); // flat lake water, verified 32x32-exact pure match, no foam/rock overlap
    const tiles = {
      ground_water_real: waterReal,
      water_00: dwWaterTile(0, 411),
      water_01: dwWaterTile(1, 411),
      shore_edge_s: dwShoreEdgeS(421),
    };
    const props = {
      reeds_a: bp.reeds(511),
      reeds_b: bp.reeds(517),
      lily_pad: bp.lilyPad(523),
      rock_cluster: bp.rockCluster(527),
      bridge_deck: bp.bridgeDeck(531),
      bridge_post: bp.bridgePost(537),
    };
    writeAssets(biomeDir, tiles, props);
    fs.writeFileSync(path.join(biomeDir, 'tileset.json'), JSON.stringify(
      tilesetJson('agua-dwds', tiles, props, { water_00: true, water_01: true, ground_water_real: true }), null, 2));
    fs.writeFileSync(path.join(biomeDir, 'license.json'), JSON.stringify(
      licenseJson('agua-dwds', ['tiles/ground_water_real.png']), null, 2));
    buildPreview('AGUA-DWDS (beira d’agua)', Object.values(tiles), Object.values(props)).save(path.join(biomeDir, 'tileset.png'));
  }

  console.log('3 biome -dwds packs written to', OUT);
}

main();
