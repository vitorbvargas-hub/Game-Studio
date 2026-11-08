'use strict';
// GS-003 -- forest-v3 tileset package (GS-004 / ADR-010 canonical proof).
// Denser vegetation, 4+ tree canopy variants, tall-grass/flower scatter
// props, clearing + path tiles, consistent upper-left light. Mixes real DW
// DS ground crops (official-fan-use layer, same sheets/coords technique as
// gen_biomes_dwds.js) with new hand-authored pixel-matrix/primitive tiles
// and props (original layer). Run with: node art/src/gen_forest_v3.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');
const { loadSheetCanvas, cropRect } = require('./dwds_extract.js');
const bp = require('./biome_props.js');
const fv3 = require('./forest_v3_props.js');
const { drawText } = require('./font5x3.js');

const SRC = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/10-source-files/spriters-resource/');
const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v3');
const TILE = 32;

function digiFarmDefault() { return loadSheetCanvas(path.join(SRC, 'dgmnworldds__arrow-drop-down__Digi-Farm-Default__20471.png')); }
function beastDigiFarm() { return loadSheetCanvas(path.join(SRC, 'dgmnworldds__arrow-drop-down__Beast-Digi-Farm__20469.png')); }
function realCrop(sheet, x0, y0) { return cropRect(sheet, x0, y0, x0 + TILE - 1, y0 + TILE - 1); }
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

// ---- hand-painted tile layer (pixel-matrix + seeded dither, per-pixel) ----
function paintMask(c, x0, y0, mask, colorA, colorB, seed) {
  const rnd = rng(seed);
  for (let my = 0; my < 8; my++) {
    for (let mx = 0; mx < 8; mx++) {
      const v = mask[my][mx];
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 4; dx++) c.setPixel(x0 + mx * 4 + dx, y0 + my * 4 + dy, v ? colorB : colorA);
      }
    }
  }
  for (let my = 0; my < 8; my++) {
    for (let mx = 0; mx < 8; mx++) {
      const v = mask[my][mx];
      const right = mx < 7 ? mask[my][mx + 1] : v;
      const down = my < 7 ? mask[my + 1][mx] : v;
      if (right !== v) {
        for (let dy = 0; dy < 4; dy++) {
          if (rnd() < 0.55) c.setPixel(x0 + mx * 4 + 3, y0 + my * 4 + dy, right ? colorB : colorA);
          if (rnd() < 0.55) c.setPixel(x0 + (mx + 1) * 4, y0 + my * 4 + dy, v ? colorB : colorA);
        }
      }
      if (down !== v) {
        for (let dx = 0; dx < 4; dx++) {
          if (rnd() < 0.55) c.setPixel(x0 + mx * 4 + dx, y0 + my * 4 + 3, down ? colorB : colorA);
          if (rnd() < 0.55) c.setPixel(x0 + mx * 4 + dx, y0 + (my + 1) * 4, v ? colorB : colorA);
        }
      }
    }
  }
}
const MASK_EDGE_S = [0, 0, 0, 0, 1, 1, 1, 1].map((v) => Array(8).fill(v));
const MASK_CORNER_NE = Array.from({ length: 8 }, (_, my) => Array.from({ length: 8 }, (_, mx) => (my < 4 || mx >= 4 ? 1 : 0)));

// Rich multi-tone grass: 4 tones instead of 2, denser blade clusters,
// occasional clover/flower flecks, sparse pebble grit -- target a visibly
// higher detail density than floresta-dwds's grass_00/01.
function grassRich(seed, variant) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.grassDk);
  const rnd = rng(seed + variant * 13);
  // soft mid-tone patches (not flat) so the base isn't a single solid color
  for (let i = 0; i < 6; i++) {
    const cx = 2 + Math.floor(rnd() * (TILE - 4));
    const cy = 2 + Math.floor(rnd() * (TILE - 4));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(W.grassMid, 160));
  }
  for (let i = 0; i < 38; i++) {
    const bx = 1 + Math.floor(rnd() * (TILE - 2));
    const by = 1 + Math.floor(rnd() * (TILE - 3));
    const diag = bx + by;
    const lit = diag < 30;
    const tone = lit ? (rnd() < 0.6 ? W.grassLt : W.grassMid) : (rnd() < 0.45 ? W.navyDk : W.grassMid);
    c.setPixel(bx, by, tone);
    if (rnd() < 0.55) c.setPixel(bx, by + 1, tone);
  }
  if (rnd() < 0.4) {
    const fx = 2 + Math.floor(rnd() * (TILE - 4));
    const fy = 2 + Math.floor(rnd() * (TILE - 4));
    const petal = rnd() < 0.5 ? W.white : W.yellow;
    c.setPixel(fx, fy, petal);
    c.setPixel(fx + 1, fy, W.yellow);
    c.setPixel(fx, fy + 1, W.grassDk);
  }
  if (rnd() < 0.25) {
    const px = 3 + Math.floor(rnd() * (TILE - 6));
    const py = 3 + Math.floor(rnd() * (TILE - 6));
    c.setPixel(px, py, W.steel);
    c.setPixel(px + 1, py, withAlpha(W.steelDk, 200));
  }
  return c;
}

// Dense-canopy forest floor: darker, cooler, with dappled sunbeam gaps and
// mottled undergrowth clumps -- the ground under the packed treeline.
function forestFloorRich(seed, dappled) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.navyDk);
  const rnd = rng(seed);
  for (let i = 0; i < 11; i++) {
    const cx = 2 + Math.floor(rnd() * (TILE - 4));
    const cy = 2 + Math.floor(rnd() * (TILE - 4));
    const tone = rnd() < 0.5 ? [10, 46, 30, 255] : W.grassDk;
    c.fillEllipse(cx, cy, 1 + Math.floor(rnd() * 2), 1 + Math.floor(rnd() * 2), withAlpha(tone, 220));
  }
  for (let i = 0; i < 10; i++) {
    const px = 1 + Math.floor(rnd() * (TILE - 2));
    const py = 1 + Math.floor(rnd() * (TILE - 2));
    c.setPixel(px, py, rnd() < 0.5 ? W.grassMid : [10, 46, 30, 255]);
  }
  if (dappled) {
    for (let i = 0; i < 3; i++) {
      if (rnd() < 0.6) {
        const lx = 3 + Math.floor(rnd() * 20), ly = 3 + Math.floor(rnd() * 20);
        c.fillEllipse(lx, ly, 3, 2, withAlpha(W.grassLt, 150));
      }
    }
  }
  return c;
}

// Clearing path -- warm dirt, richer than biome_tiles.pathTileFull, with
// pebbles and worn-center lightening (footpath look).
function pathRich(seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.dirt);
  const rnd = rng(seed);
  c.fillEllipse(16, 16, 13, 11, withAlpha(W.dirtLt, 120));
  for (let i = 0; i < 16; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, rnd() < 0.5 ? W.dirtDk : W.dirtDarkest);
  }
  for (let i = 0; i < 4; i++) {
    const px = 3 + Math.floor(rnd() * (TILE - 6)), py = 3 + Math.floor(rnd() * (TILE - 6));
    c.fillEllipse(px, py, 1, 1, W.steel);
  }
  return c;
}

function pathEdgeS(seed) {
  const c = grassRich(seed, 0);
  paintMask(c, 0, 0, MASK_EDGE_S, W.grassDk, W.dirt, seed + 1);
  const rnd = rng(seed + 2);
  for (let i = 0; i < 10; i++) {
    const px = Math.floor(rnd() * TILE), py = 17 + Math.floor(rnd() * 13);
    c.setPixel(px, py, rnd() < 0.5 ? W.dirtDk : W.dirtDarkest);
  }
  return c;
}

function pathCornerNE(seed) {
  const c = grassRich(seed, 1);
  paintMask(c, 0, 0, MASK_CORNER_NE, W.grassDk, W.dirt, seed + 1);
  return c;
}

// ---- preview contact sheet -------------------------------------------------
function buildPreview(title, tiles, props) {
  const cell = 48, scale = 2;
  const cols = Math.max(tiles.length, props.length, 1);
  const w = Math.max(cell * scale * cols + 40, 460);
  const h = 30 + 2 * (cell * scale + 24);
  const sheet = new Canvas(w, h);
  sheet.fillRect(0, 0, w - 1, h - 1, [18, 20, 28, 255]);
  drawText(sheet, title, 8, 6, [255, 230, 120, 255]);
  function row(items, y, label) {
    drawText(sheet, label, 8, y, [200, 210, 230, 255]);
    items.forEach((im, i) => {
      const x = 8 + i * (cell * scale + 6);
      sheet.blit(im.scaleNearest(scale), x, y + 10);
    });
  }
  row(tiles, 22, 'TILES');
  row(props, 22 + cell * scale + 24, 'PROPS');
  return sheet;
}

function tilesetJson(tiles, props, collisionMap) {
  return {
    biome: 'forest-v3',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    tiles: Object.keys(tiles).map((name) => ({ file: `tiles/${name}.png`, collision: !!collisionMap[name], suggestedLayer: 'ground' })),
    props: Object.keys(props).map((name) => ({
      file: `props/${name}.png`,
      collision: /tree|log|rock/.test(name),
      suggestedLayer: /tree/.test(name) ? 'canopy' : 'decoration',
    })),
  };
}

function licenseJson(realFiles) {
  return {
    biome: 'forest-v3',
    layer: 'mixed',
    assets: [
      {
        group: 'tiles (chao, recorte real)',
        layer: 'official-fan-use',
        files: realFiles,
        source: {
          type: 'game-rip',
          game: 'Digimon World DS (Nintendo DS)',
          site: 'The Spriters Resource',
          sitePage: 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/',
          providedBy: 'varredura automatica (Spriters Resource), fundador autorizou em 2026-11-08',
          retrievedAt: '2026-11-08',
          modifications: 'recorte retangular direto 32x32 de area plana (sem objetos sobrepostos), tingido (multiplicacao de brilho) para compor sombra de dossel; sem redesenho dos pixels originais.',
        },
        credit: { ripper: 'Atlanta', site: 'The Spriters Resource' },
        copyright: 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games',
        basis: 'ADR-009 Secao Licenca + ADR-010 (fundador, 2026-11-08)',
        nonCommercial: true,
        restrictions: ['ADR-007: sem monetizacao, sem logo oficial, aviso de fan game', 'Publicacao exige aprovacao do fundador'],
      },
      {
        group: 'tiles (derivados) + props (arvores, grama alta, flores, clareira)',
        layer: 'original',
        author: 'game-art',
        technique: 'pixel matrix (grama/caminho, Canvas.js mask-paint + dither seeded) + primitivas em camadas para props de cenario (copas, troncos -- nao sao corpos de criatura, permitido por ADR-009/biome_props.js), paleta Endesga-32 compartilhada.',
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
  const grassReal = realCrop(digiFarm, 580, 48);
  const shadeReal = shade(realCrop(beast, 608, 120), 0.5);

  const tiles = {
    ground_grass_real: grassReal,
    ground_canopy_shade_real: shadeReal,
    grass_rich_00: grassRich(601, 0),
    grass_rich_01: grassRich(617, 1),
    grass_rich_02: grassRich(641, 2),
    forest_floor_00: forestFloorRich(661, false),
    forest_floor_01: forestFloorRich(677, true),
    forest_floor_02: forestFloorRich(691, true),
    path_rich: pathRich(701),
    path_edge_s: pathEdgeS(709),
    path_corner_ne: pathCornerNE(719),
  };
  const props = {
    tree_round_a: fv3.treeRoundDense(1001),
    tree_round_b: fv3.treeRoundDense(1013),
    tree_conifer_a: fv3.treeTallConifer(1021),
    tree_conifer_b: fv3.treeTallConifer(1033),
    tree_bushy_a: fv3.treeWideBushy(1041),
    tree_bushy_b: fv3.treeWideBushy(1053),
    tree_flowering: fv3.treeFlowering(1061),
    tall_grass_a: fv3.tallGrassClump(1101, W.grassDk),
    tall_grass_b: fv3.tallGrassClump(1109, W.navyDk),
    flower_cluster_red: fv3.flowerCluster(1201, W.red),
    flower_cluster_white: fv3.flowerCluster(1207, W.white),
    flower_cluster_purple: fv3.flowerCluster(1213, W.purple),
    fallen_log: fv3.fallenLog(1301),
    mushroom_cluster: fv3.mushroomCluster(1307),
    rock_cluster: bp.rockCluster(1401),
    bush_accent: bp.bush(1409, W.grassLt),
  };

  const tilesDir = path.join(OUT, 'tiles');
  const propsDir = path.join(OUT, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });
  for (const [name, canvas] of Object.entries(tiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(props)) canvas.save(path.join(propsDir, `${name}.png`));

  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(
    tilesetJson(tiles, props, { path_rich: false, path_edge_s: false, path_corner_ne: false }), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(
    licenseJson(['tiles/ground_grass_real.png', 'tiles/ground_canopy_shade_real.png']), null, 2));
  buildPreview('FOREST-V3', Object.values(tiles), Object.values(props)).save(path.join(OUT, 'tileset.png'));

  console.log('forest-v3 tileset written to', OUT);
}

main();
