'use strict';
// GS-003 -- forest-v4.1 patch pass (coordinator review on forest_v4_day.png):
// Wang/blob-47 path + dense-edge autotile, 4 dirt interior variants, a
// seamless dithered clearing floor, 2 new tree types, and lighting
// post-processors (directional cast shadow + canopy rim-light).
//
// Writes ADDITIVELY into the already-integrated forest-v4 asset folder:
// every new file uses a new filename (path_w47_*, denseedge_w47_*,
// clearing_floor_v41_*, tree_palm_digital_*, tree_data_leaf_*) inside the
// SAME tiles/ and props/ (day + night) directories, and tileset.json is
// read, extended with new top-level keys, and rewritten -- no existing key,
// value, or file is touched or removed, so the game-dev integration in
// flight against the current forest-v4 package keeps working unmodified.
// Run with: node art/src/gen_forest_v4_1.js
const fs = require('fs');
const path = require('path');
const { withPreset } = require('./forest_v4_palette.js');
const gt1 = require('./forest_v4_1_tiles.js');
const gp1 = require('./forest_v4_1_props.js');

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v4');

function buildTilesV41(ramp, seed) {
  const tiles = {};
  Object.assign(tiles, gt1.pathWang47Set(ramp, seed + 1000));
  Object.assign(tiles, gt1.denseWang47Set(ramp, seed + 2000));
  Object.assign(tiles, gt1.clearingFloorSet(ramp, seed + 3000));
  return tiles;
}

function buildPropsV41(ramp, seed) {
  const props = {};
  const palm = gp1.treePalmDigital(ramp, seed + 1);
  props.tree_palm_digital_base = palm.base;
  props.tree_palm_digital_top = palm.top;
  const dataLeaf = gp1.treeDataLeaf(ramp, seed + 2);
  props.tree_data_leaf_base = dataLeaf.base;
  props.tree_data_leaf_top = dataLeaf.top;
  return props;
}

function writeSet(dir, tiles, props) {
  const tilesDir = path.join(dir, 'tiles'), propsDir = path.join(dir, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });
  for (const [name, canvas] of Object.entries(tiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(props)) canvas.save(path.join(propsDir, `${name}.png`));
}

function patchTilesetJson(dayTiles, dayProps) {
  const jsonPath = path.join(OUT, 'tileset.json');
  const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (existing.autotileV41) {
    console.log('tileset.json already has autotileV41 -- leaving as-is (idempotent re-run).');
    return;
  }
  existing.autotileV41 = {
    pattern: 'Wang/blob-47, 8-neighbor bitmask (N=1,E=2,S=4,W=8,NE=16,SE=32,SW=64,NW=128) normalized by zeroing diagonal bits whose two adjacent edges are not both set -- collapses the 256 raw combinations to 47 unique shapes. File suffix is the literal normalized mask value, e.g. tiles/path_w47_7.png.',
    cornerRule: 'Each corner classified from (edge1, edge2, diagonal): both edges + diagonal = flat fill (no cut); both edges, no diagonal = small concave notch (fixes the v4 hard square inner-corner "cruz/xadrez" bug); one edge = medium convex round; no edge = large convex round. +-2px seeded radius jitter per corner for organic width variation, plus a boundary-noise pass that bleeds grass tufts into the fg and drops pebbles into the bg right at the seam.',
    addedInVersion: 'forest-v4.1',
    supersedesForNewMaps: 'autotile.sets (16-tile, still present/valid for any map data already authored against it)',
    sets: [
      { name: 'path_w47', center: 'dirt path', surround: 'grass', maskCount: gt1.WANG47_MASKS.length, files: gt1.WANG47_MASKS.map((m) => `tiles/path_w47_${m}.png`) },
      { name: 'denseedge_w47', center: 'dense forest floor', surround: 'clearing (use clearing_floor_v41_* as the clearing ground tile for best match)', maskCount: gt1.WANG47_MASKS.length, files: gt1.WANG47_MASKS.map((m) => `tiles/denseedge_w47_${m}.png`) },
    ],
    dirtInteriorVariants: ['grooves (sulcos)', 'pebbles (pedrinhas)', 'leaves (folhas)', 'mixed'],
  };
  existing.clearingFloorV41 = {
    note: 'Seamless-tileable dithered clearing ground (replaces grass_NN for clearing cells specifically) -- fixes the "dark square patches" caused by v4 clearing texture using per-tile random ellipses that got hard-clipped at the 32px edge. 4 variants, cycle per cell.',
    files: [0, 1, 2, 3].map((v) => `tiles/clearing_floor_v41_${String(v).padStart(2, '0')}.png`),
  };
  existing.lightingV41 = {
    direction: 'upper-left (sun/moon), matches the existing ambient overlay and grass/trunk highlight bias already used by forest-v4',
    castShadow: 'procedural, composited by the scene builder per tree instance (not a static prop file): elongated ellipse offset toward lower-right (away from the light) under each tree footprint.',
    rimLight: 'applied as a post-process over any tree canopy-top canvas: brightens the upper-left silhouette edge pixels using the ramp\'s existing foliage[7] rim tone. See forest_v4_1_props.js applyCanopyRimLight().',
  };
  existing.treesV41 = {
    note: '2 additional tree types, additive to the existing 9 tree_* entries.',
    props: [
      { file: 'props/tree_palm_digital_base.png', collision: true, suggestedLayer: 'decor' },
      { file: 'props/tree_palm_digital_top.png', collision: false, suggestedLayer: 'canopy-top' },
      { file: 'props/tree_data_leaf_base.png', collision: true, suggestedLayer: 'decor' },
      { file: 'props/tree_data_leaf_top.png', collision: false, suggestedLayer: 'canopy-top' },
    ],
  };
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2));
}

function patchLicenseJson() {
  const jsonPath = path.join(OUT, 'license.json');
  const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (existing.assets.some((a) => a.group === 'forest-v4.1 patch (wang-47 autotile, clearing dither fix, 2 new tree types, lighting post-process)')) {
    console.log('license.json already documents v4.1 -- leaving as-is.');
    return;
  }
  existing.assets.push({
    group: 'forest-v4.1 patch (wang-47 autotile, clearing dither fix, 2 new tree types, lighting post-process)',
    layer: 'original',
    author: 'game-art',
    technique: 'Same Canvas.js pixel-matrix / primitive-layering technique as the rest of forest-v4 (ADR-009 scenery scope). No third-party art referenced pixel-for-pixel; new cyan accent reuses the studio Endesga-32 palette (c18/c19).',
    license: 'studio-original (GS-003 fan game, ADR-007/ADR-009)',
  });
  fs.writeFileSync(jsonPath, JSON.stringify(existing, null, 2));
}

function main() {
  const dayRamp = withPreset(true);
  const nightRamp = withPreset(false);

  const dayTiles = buildTilesV41(dayRamp, 6001);
  const nightTiles = buildTilesV41(nightRamp, 6001);
  const dayProps = buildPropsV41(dayRamp, 7001);
  const nightProps = buildPropsV41(nightRamp, 7001);

  writeSet(OUT, dayTiles, dayProps);
  writeSet(path.join(OUT, 'night'), nightTiles, nightProps);

  patchTilesetJson(dayTiles, dayProps);
  patchLicenseJson();

  console.log('forest-v4.1 additive assets written to', OUT);
  console.log('new tiles per preset:', Object.keys(dayTiles).length, '| new props per preset:', Object.keys(dayProps).length);
}

main();
