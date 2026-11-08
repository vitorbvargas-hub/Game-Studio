'use strict';
// GS-003 -- forest-v4 tileset package (HD-depth pass, ADR-010 founder
// feedback: "o mapa ta feio, falta profundidade HD"). See README.md in the
// output folder for the full diagnosis/decision/self-critique log.
// Run with: node art/src/gen_forest_v4.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { withPreset } = require('./forest_v4_palette.js');
const gt = require('./forest_v4_tiles.js');
const gp = require('./forest_v4_props.js');
const { loadSheetCanvas, cropRect } = require('./dwds_extract.js');
const { drawText } = require('./font5x3.js');

const SRC = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/10-source-files/spriters-resource/');
const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v4');
const TILE = 32;

function digiFarmDefault() { return loadSheetCanvas(path.join(SRC, 'dgmnworldds__arrow-drop-down__Digi-Farm-Default__20471.png')); }
function shade(canvas, factor) {
  const out = new Canvas(canvas.w, canvas.h);
  for (let y = 0; y < canvas.h; y++) for (let x = 0; x < canvas.w; x++) {
    const p = canvas.getPixel(x, y);
    out.setPixel(x, y, [Math.round(p[0] * factor), Math.round(p[1] * factor), Math.round(p[2] * factor), p[3]]);
  }
  return out;
}

function buildGround(ramp, seed) {
  const tiles = {};
  for (let v = 0; v < 6; v++) tiles[`grass_${String(v).padStart(2, '0')}`] = gt.grassVariant(ramp, v, seed + v * 19);
  tiles.forest_floor_00 = (() => { const c = new Canvas(TILE, TILE); gt.denseFloorTexture(c, 0, 0, TILE, TILE, ramp, seed + 300); return c; })();
  tiles.forest_floor_01 = (() => { const c = new Canvas(TILE, TILE); gt.denseFloorTexture(c, 0, 0, TILE, TILE, ramp, seed + 320); return c; })();
  tiles.path_center = (() => { const c = new Canvas(TILE, TILE); gt.dirtTexture(c, 0, 0, TILE, TILE, ramp, seed + 340); return c; })();
  Object.assign(tiles, gt.pathBlobSet(ramp, seed + 1000));
  Object.assign(tiles, gt.denseFloorBlobSet(ramp, seed + 2000));
  return tiles;
}

function buildProps(ramp, seed) {
  const props = {};
  const add = (name, tree) => { props[`${name}_base`] = tree.base; props[`${name}_top`] = tree.top; };
  add('tree_round_a', gp.treeRound(ramp, seed + 1));
  add('tree_round_b', gp.treeRound(ramp, seed + 2));
  add('tree_conifer_a', gp.treeConifer(ramp, seed + 3));
  add('tree_conifer_b', gp.treeConifer(ramp, seed + 4));
  add('tree_bushy_a', gp.treeBushy(ramp, seed + 5));
  add('tree_bushy_b', gp.treeBushy(ramp, seed + 6));
  add('tree_flowering', gp.treeFlowering(ramp, seed + 7));
  add('tree_birch', gp.treeBirch(ramp, seed + 8));
  add('tree_ancient', gp.treeAncient(ramp, seed + 9));
  props.tall_grass_a = gp.tallGrassClump(ramp, seed + 10);
  props.tall_grass_b = gp.tallGrassClump(ramp, seed + 11);
  props.flower_cluster_red = gp.flowerCluster(ramp, seed + 12, ramp.flower.red);
  props.flower_cluster_white = gp.flowerCluster(ramp, seed + 13, ramp.flower.white);
  props.flower_cluster_purple = gp.flowerCluster(ramp, seed + 14, ramp.flower.purple);
  props.rock_cluster = gp.rockCluster(ramp, seed + 15);
  props.fallen_leaves_cluster = gp.fallenLeavesCluster(ramp, seed + 16);
  props.mushroom_cluster = gp.mushroomCluster(ramp, seed + 17);
  props.fallen_log = gp.fallenLog(ramp, seed + 18);
  props.canopy_shadow_small = gp.canopyShadowPatch(ramp, seed + 19, 36, 18);
  props.canopy_shadow_large = gp.canopyShadowPatch(ramp, seed + 20, 64, 28);
  return props;
}

function buildPreview(title, tiles, props) {
  const cell = 48, scale = 2;
  const perRow = 16;
  const tileKeys = Object.keys(tiles), propKeys = Object.keys(props);
  const rows = Math.ceil(tileKeys.length / perRow) + Math.ceil(propKeys.length / perRow);
  const w = cell * scale * perRow + 40;
  const h = 34 + rows * (cell * scale + 20) + 20;
  const sheet = new Canvas(w, h);
  sheet.fillRect(0, 0, w - 1, h - 1, [14, 14, 22, 255]);
  drawText(sheet, title, 8, 6, [255, 230, 120, 255]);
  let y = 24;
  function block(keys, dict, label) {
    drawText(sheet, label, 8, y, [200, 210, 230, 255]);
    y += 10;
    for (let i = 0; i < keys.length; i++) {
      const col = i % perRow, row = Math.floor(i / perRow);
      const x = 8 + col * (cell * scale + 4);
      const yy = y + row * (cell * scale + 4);
      sheet.blit(dict[keys[i]].scaleNearest(scale), x, yy);
    }
    y += (Math.ceil(keys.length / perRow)) * (cell * scale + 4) + 14;
  }
  block(tileKeys, tiles, 'TILES');
  block(propKeys, props, 'PROPS');
  return sheet;
}

function tilesetJson(dayTiles, dayProps) {
  const layerFor = (name) => {
    if (name.endsWith('_top')) return 'canopy-top';
    if (/^(tree_|tall_grass|flower_|rock_|fallen_|mushroom_|canopy_shadow)/.test(name)) return 'decor';
    return 'ground';
  };
  const collisionFor = (name) => /_base$/.test(name) || /^(rock_|fallen_log)/.test(name);
  return {
    biome: 'forest-v4',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    resolutionDecision: {
      chosen: '32px native art, render scale 1x (no 16px-upscale)',
      reason: 'See README.md section 2. forest-v3 trees were already drawn at native size (56-92px canvases), not upscaled blocky art -- the flatness came from palette range (3 greens) and smooth-ellipse canopy shading, not pixel density. Keeping 32px tiles matches the DS-era sprite scale already locked by DIGIMON_SIZE_TABLE.md and avoids an engine/scale break (ADR-010 "sem mudanca de arquitetura antes da prova visual").',
    },
    layers: ['ground', 'decor', 'canopy-top'],
    canopyTopRule: 'Every tree_*_top.png renders on the canopy-top layer, always above every entity sprite regardless of Y-sort. Every tree_*_base.png renders on the decor layer with normal Y-sort + collision=true. Pair base/top of the same tree name at the same X; top anchors so its bottom sits "overlap" px above the base trunk top (see props manifest).',
    presets: { day: 'tiles/ + props/', night: 'night/tiles/ + night/props/ (same filenames, palette swap only)' },
    autotile: {
      pattern: '16-tile blob (Wang-lite), bitmask = N*1 + E*2 + S*4 + W*8, 1 = same-type neighbor present',
      sets: [
        { name: 'path_blob', center: 'dirt path', surround: 'grass', files: Array.from({ length: 16 }, (_, m) => `tiles/path_blob_${m}.png`) },
        { name: 'denseedge_blob', center: 'dense forest floor', surround: 'clearing grass', files: Array.from({ length: 16 }, (_, m) => `tiles/denseedge_blob_${m}.png`) },
      ],
      cornerRule: 'Each tile corner independently rounded via a quarter-circle cut (R=0 both neighbors same-type / R=7 one neighbor / R=12 neither) with 1px seeded dither along the arc -- no square 4px stair-step seam.',
    },
    tiles: [
      ...Object.keys(dayTiles).map((name) => ({ file: `tiles/${name}.png`, collision: false, suggestedLayer: 'ground' })),
      { file: 'tiles/ground_grass_real.png', collision: false, suggestedLayer: 'ground', note: 'legacy official-fan-use DWDS crop kept for license continuity with forest-v3; not part of the default autotile pool (clashes with the forest-v4 ramp, see README self-critique iteration 1)' },
    ],
    props: Object.keys(dayProps).map((name) => ({ file: `props/${name}.png`, collision: collisionFor(name), suggestedLayer: layerFor(name) })),
  };
}

function licenseJson() {
  return {
    biome: 'forest-v4',
    layer: 'mixed',
    assets: [
      {
        group: 'tiles (chao, recorte real, mantido do forest-v3 por continuidade)',
        layer: 'official-fan-use',
        files: ['tiles/ground_grass_real.png', 'night/tiles/ground_grass_real.png'],
        source: {
          type: 'game-rip',
          game: 'Digimon World DS (Nintendo DS)',
          site: 'The Spriters Resource',
          sitePage: 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/',
          providedBy: 'varredura automatica (Spriters Resource), fundador autorizou em 2026-11-08',
          retrievedAt: '2026-11-08',
          modifications: 'recorte retangular direto 32x32 de area plana (sem objetos sobrepostos); versao noturna = multiplicacao de brilho/tingimento roxo-azulado sem redesenho dos pixels originais.',
        },
        credit: { ripper: 'Atlanta', site: 'The Spriters Resource' },
        copyright: 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games',
        basis: 'ADR-009 Secao Licenca + ADR-010 (fundador, 2026-11-08)',
        nonCommercial: true,
        restrictions: ['ADR-007: sem monetizacao, sem logo oficial, aviso de fan game', 'Publicacao exige aprovacao do fundador'],
      },
      {
        group: 'tiles (autotile grama/caminho, mata-densa/clareira) + props (6 tipos de arvore, grama alta, flores, pedra, folhas caidas, cogumelo, tronco caido, sombra de dossel)',
        layer: 'original',
        author: 'game-art',
        technique: 'pixel matrix (autotile blob 16-pecas, Canvas.js mask-paint + dither seeded) + primitivas em camadas (fillCircle leaf-puff clusters, fillPolygon tronco afunilado, roots tendrils) para props de cenario -- nao sao corpos de criatura, permitido por ADR-009/biome_props.js. Paleta estendida forest_v4_palette.js (ramps de 8 tons feitos a mao), nao parametrica/procedural por formula de criatura.',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- sem IP de terceiro alem da paleta de cor amostrada',
      },
    ],
    verifiedAt: '2026-11-08',
    verifiedBy: 'game-art',
  };
}

function writeSet(dir, tiles, props) {
  const tilesDir = path.join(dir, 'tiles'), propsDir = path.join(dir, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });
  for (const [name, canvas] of Object.entries(tiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(props)) canvas.save(path.join(propsDir, `${name}.png`));
}

function main() {
  const dayRamp = withPreset(true);
  const nightRamp = withPreset(false);

  const dayTiles = buildGround(dayRamp, 4001);
  const nightTiles = buildGround(nightRamp, 4001);

  const dayProps = buildProps(dayRamp, 5001);
  const nightProps = buildProps(nightRamp, 5001);

  fs.mkdirSync(OUT, { recursive: true });
  writeSet(OUT, dayTiles, dayProps);
  writeSet(path.join(OUT, 'night'), nightTiles, nightProps);

  // Kept for license continuity with forest-v3 (ADR-010 "pode usar os
  // tilesets oficiais"), but NOT added to the day/nightTiles pool used by
  // the autotile preview/scene: the raw DWDS crop's flat saturated green
  // and its lack of a night tint clash hard against the new 8-tone ramp
  // (iteration-1 self-critique). It stays on disk + in license.json as a
  // legacy/reference asset, not part of the default placed set.
  const digiFarm = digiFarmDefault();
  const officialGrass = cropRect(digiFarm, 580, 48, 580 + TILE - 1, 48 + TILE - 1);
  officialGrass.save(path.join(OUT, 'tiles', 'ground_grass_real.png'));
  shade(officialGrass, 0.4).save(path.join(OUT, 'night', 'tiles', 'ground_grass_real.png'));

  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson(dayTiles, dayProps), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson(), null, 2));
  buildPreview('FOREST-V4 (day)', dayTiles, dayProps).save(path.join(OUT, 'tileset.png'));
  buildPreview('FOREST-V4 (night)', nightTiles, nightProps).save(path.join(OUT, 'tileset_night_preview.png'));

  console.log('forest-v4 tileset written to', OUT);
}

main();
