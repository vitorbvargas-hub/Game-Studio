'use strict';
// GS-003 Map Factory -- forest-v6 (supplemental pieces pack).
//
// Local, zero-cost pixel generation: PixelLab MCP is returning 401 right
// now (ADR-011 pendencia), so this fills the forest-v4.1 kit gaps listed in
// art/map-factory/FOREST_KIT_GAP.md the same way forest-v4/v4.1 were made --
// Canvas.js pixel matrix + 16-tile blob autotile (quarter-circle rounded
// corners), forest_v4_palette.js ramps, Endesga-32 base palette. No
// third-party art referenced pixel-for-pixel (ADR-009 scope: scenery, not
// creature bodies).
//
// Produces: water+shore autotile (16 tiles), a horizontal + vertical wooden
// bridge deck, 2 rock sizes, a closed chest, a signpost and a healing point
// (digital-spring) prop. Everything else from the gap list (NPC, boss
// arena, secret-area entrance) is NOT produced here -- see
// art/map-factory/FOREST_KIT_GAP.md for why.
//
// Run with: node art/src/gen_forest_v6_pieces.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');
const { withPreset } = require('./forest_v4_palette.js');
const gt = require('./forest_v4_tiles.js');
const gp = require('./forest_v4_props.js');
const { drawText } = require('./font5x3.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v6');

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }

// ---------------------------------------------------------------------
// 1. Water + shore autotile. Same 16-tile blob geometry as forest-v4's
//    path_blob/denseedge_blob (bitmask N*1+E*2+S*4+W*8, quarter-circle
//    rounded corners, 1px seeded dither on the arc -- buildBlobTile() in
//    forest_v4_tiles.js, not exported, so reimplemented here identically)
//    plus a foam-fleck pass along the water/grass boundary, which the dry
//    terrains don't need.
// ---------------------------------------------------------------------
function waterTexture(c, x0, y0, w, h, seed) {
  const rnd = rng(seed);
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, W.waterMid);
  for (let i = 0; i < 4; i++) {
    const by = y0 + 3 + Math.floor(rnd() * (h - 6));
    const tone = (by - y0) > h * 0.55 ? W.waterDeep : withAlpha(W.waterDeep, 180);
    for (let x = x0; x < x0 + w; x++) {
      if (rnd() < 0.7) c.blendPixel(x, by + Math.round(Math.sin((x + seed) * 0.5)), tone);
    }
  }
  for (let i = 0; i < Math.round(w * h * 0.05); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    const lit = (px - x0) + (py - y0) < (w + h) * 0.4;
    c.setPixel(px, py, lit ? pick(rnd, [W.waterBright, W.waterFoam]) : withAlpha(W.waterDeep, 160));
  }
  for (let i = 0; i < 2; i++) {
    if (rnd() < 0.5) continue;
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.blendPixel(px, py, withAlpha(W.white, 160));
  }
}

function buildWaterBlobTile(bitmask, ramp, seed) {
  const c = new Canvas(TILE, TILE);
  const grassSeed = seed;
  const bg = gt.grassVariant(ramp, Math.floor(rng(grassSeed)() * 6), grassSeed);
  c.blit(bg, 0, 0);
  const sub = new Canvas(TILE, TILE);
  waterTexture(sub, 0, 0, TILE, TILE, seed + 500);
  const N = !!(bitmask & 1), E = !!(bitmask & 2), S = !!(bitmask & 4), WEST = !!(bitmask & 8);
  const corners = [
    { cx: 0, cy: 0, e1: N, e2: WEST, qx0: 0, qy0: 0 },
    { cx: TILE - 1, cy: 0, e1: N, e2: E, qx0: TILE / 2, qy0: 0 },
    { cx: 0, cy: TILE - 1, e1: S, e2: WEST, qx0: 0, qy0: TILE / 2 },
    { cx: TILE - 1, cy: TILE - 1, e1: S, e2: E, qx0: TILE / 2, qy0: TILE / 2 },
  ];
  const rnd = rng(seed + 900);
  const half = TILE / 2;
  const boundary = [];
  for (const q of corners) {
    const R = q.e1 && q.e2 ? 0 : (q.e1 || q.e2 ? 7 : 12);
    for (let dy = 0; dy < half; dy++) {
      for (let dx = 0; dx < half; dx++) {
        const px = q.qx0 + dx, py = q.qy0 + dy;
        const dist = Math.hypot(px - q.cx, py - q.cy);
        let isBg = R > 0 && dist < R;
        if (R > 0 && Math.abs(dist - R) < 1.6 && rnd() < 0.5) isBg = !isBg;
        if (!isBg) {
          c.setPixel(px, py, sub.getPixel(px, py));
          if (R > 0 && Math.abs(dist - R) < 2.2) boundary.push([px, py]);
        }
      }
    }
  }
  for (const [px, py] of boundary) if (rnd() < 0.55) c.blendPixel(px, py, withAlpha(W.waterFoam, 200));
  return c;
}

function waterBlobSet(ramp, seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[`water_blob_${m}`] = buildWaterBlobTile(m, ramp, seed + m * 29);
  return tiles;
}

// ---------------------------------------------------------------------
// 2. Bridge -- wooden plank deck, 3 tiles long, walkable (collision=false
//    in tileset.json). Horizontal is hand-authored; vertical is a 90deg
//    rotation (bridges only need to read as "wood crossing", not two
//    independently hand-painted decks).
// ---------------------------------------------------------------------
function bridgeH(ramp, seed) {
  const w = TILE * 3, h = TILE;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const bark = ramp.bark;
  const deckY0 = 8, deckY1 = h - 9;
  c.fillRect(0, deckY0, w - 1, deckY1, bark.mid);
  for (let x = 4; x < w - 4; x += 10) c.line(x, deckY0, x, deckY1, bark.dk, 1);
  c.fillRect(0, deckY0, w - 1, deckY0 + 1, bark.hi);
  c.fillRect(0, deckY1 - 1, w - 1, deckY1, bark.core);
  for (let i = 0; i < 18; i++) {
    const px = 2 + Math.floor(rnd() * (w - 4)), py = deckY0 + 2 + Math.floor(rnd() * (deckY1 - deckY0 - 4));
    c.setPixel(px, py, rnd() < 0.5 ? bark.lt : bark.dk);
  }
  for (const px of [3, w - 5]) {
    c.fillRect(px, 1, px + 2, h - 2, bark.hi);
    c.fillRect(px, 1, px + 2, 3, bark.core);
  }
  c.fillEllipse(w / 2, h - 2, w / 2 - 4, 3, withAlpha(ramp.ink, 70));
  return c;
}

function rotate90CW(canvas) {
  const nc = new Canvas(canvas.h, canvas.w);
  for (let y = 0; y < canvas.h; y++) {
    for (let x = 0; x < canvas.w; x++) nc.setPixel(canvas.h - 1 - y, x, canvas.getPixel(x, y));
  }
  return nc;
}

// ---------------------------------------------------------------------
// 3. Rocks -- big (collides, path blocker) and small (collides, minor
//    decor), distinct from the existing props/rock_cluster.png.
// ---------------------------------------------------------------------
function rockBig(ramp, seed) {
  const c = new Canvas(44, 36);
  const s = ramp.ground.stone;
  c.fillEllipse(22, 22, 20, 12, s[0]);
  c.fillEllipse(16, 16, 12, 9, s[1]);
  c.fillEllipse(28, 14, 9, 7, s[1]);
  c.fillEllipse(14, 12, 5, 4, s[2]);
  c.fillEllipse(27, 10, 4, 3, s[2]);
  c.fillEllipse(12, 14, 4, 3, withAlpha(ramp.ground.moss, 160));
  gp.rimDarken(c, ramp.ink, 170);
  c.fillEllipse(22, 34, 19, 3, withAlpha(ramp.ink, 80));
  return c;
}

function rockSmall(ramp, seed) {
  const c = new Canvas(18, 14);
  const s = ramp.ground.stone;
  c.fillEllipse(9, 8, 8, 5, s[0]);
  c.fillEllipse(6, 6, 4, 3, s[1]);
  c.fillEllipse(11, 7, 3, 2, s[2]);
  gp.rimDarken(c, ramp.ink, 160);
  c.fillEllipse(9, 13, 7, 2, withAlpha(ramp.ink, 70));
  return c;
}

// ---------------------------------------------------------------------
// 4. Chest (closed) -- wood body, gold corner bands, dark lock plate.
// ---------------------------------------------------------------------
function chestClosed(ramp, seed) {
  const c = new Canvas(24, 22);
  const bark = ramp.bark;
  const gold = W.gold, goldDk = W.orange;
  c.fillRect(2, 11, 21, 19, bark.mid);
  c.fillRect(2, 17, 21, 19, bark.core);
  c.fillEllipse(12, 10, 10, 6, bark.lt);
  c.fillEllipse(12, 8, 9, 5, bark.hi);
  c.fillRect(2, 10, 21, 12, bark.dk);
  for (const bx of [4, 18]) c.fillRect(bx, 3, bx + 1, 19, gold);
  c.fillRect(2, 12, 21, 13, goldDk);
  c.fillEllipse(12, 14, 3, 3, [43, 33, 20, 255]);
  c.setPixel(11, 13, withAlpha(W.white, 180));
  gp.rimDarken(c, ramp.ink, 180);
  c.fillEllipse(12, 20, 10, 2, withAlpha(ramp.ink, 80));
  return c;
}

// ---------------------------------------------------------------------
// 5. Signpost -- post + board, placeholder "!" mark (per-map text is a
//    data concern, not an art concern).
// ---------------------------------------------------------------------
function signPost(ramp, seed) {
  const c = new Canvas(20, 28);
  const bark = ramp.bark;
  c.fillRect(8, 13, 11, 26, bark.mid);
  c.fillRect(8, 13, 9, 26, bark.dk);
  c.fillRect(1, 2, 18, 13, bark.hi);
  c.fillRect(1, 2, 18, 3, bark.lt);
  c.fillRect(1, 12, 18, 13, bark.dk);
  for (let x = 1; x <= 18; x++) { c.setPixel(x, 2, bark.dk); c.setPixel(x, 13, bark.core); }
  for (let y = 2; y <= 13; y++) { c.setPixel(1, y, bark.dk); c.setPixel(18, y, bark.dk); }
  drawText(c, '!', 8, 5, ramp.ink);
  gp.rimDarken(c, ramp.ink, 160);
  c.fillEllipse(9, 27, 6, 2, withAlpha(ramp.ink, 70));
  return c;
}

// ---------------------------------------------------------------------
// 6. Healing point -- stone ring + glowing digital-spring pool (cyan
//    accent, same family as the forest-v4.1 tree_data_leaf). Non-collision:
//    the player stands ON it.
// ---------------------------------------------------------------------
function healingPoint(ramp, seed) {
  const c = new Canvas(36, 36);
  const rnd = rng(seed);
  const cx = 18, cy = 20;
  c.fillEllipse(cx, cy, 15, 9, ramp.ground.stone[0]);
  c.fillEllipse(cx, cy, 12, 7, withAlpha(ramp.ink, 60));
  c.fillEllipse(cx, cy, 10, 6, W.waterDeep);
  c.fillEllipse(cx, cy, 7, 4, W.waterBright);
  c.fillEllipse(cx, cy, 4, 2, W.waterFoam);
  c.fillEllipse(cx, cy - 1, 2, 1, withAlpha(W.white, 220));
  for (let i = 0; i < 10; i++) {
    const ang = rnd() * Math.PI * 2, r = 12 + rnd() * 6;
    const px = Math.round(cx + Math.cos(ang) * r), py = Math.round(cy + Math.sin(ang) * r * 0.55 - 4);
    c.blendPixel(px, py, withAlpha(pick(rnd, [W.waterFoam, W.white]), 160));
  }
  c.fillEllipse(cx - 6, cy - 5, 4, 2, withAlpha(ramp.ground.stone[2], 180));
  return c;
}

// ---------------------------------------------------------------------
// Preview sheet
// ---------------------------------------------------------------------
function buildPreview(title, tiles, props) {
  const scale = 2;
  const pad = 6;
  let maxRowW = 0;
  const tileRowH = (TILE * scale + pad);
  const propEntries = Object.entries(props);
  const propRowH = Math.max(...propEntries.map(([, cv]) => cv.h * scale)) + pad;
  const tileEntries = Object.entries(tiles);
  const perRow = 16;
  maxRowW = Math.max(perRow * (TILE * scale + pad) + pad, 40 + propEntries.reduce((s, [, cv]) => s + cv.w * scale + pad, 0));
  const h = 34 + tileRowH + 20 + propRowH + 20;
  const sheet = new Canvas(maxRowW + 16, h);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [14, 14, 22, 255]);
  drawText(sheet, title, 8, 6, [255, 230, 120, 255]);
  let y = 22;
  drawText(sheet, 'TILES: WATER-BLOB-0..15', 8, y, [200, 210, 230, 255]);
  y += 10;
  tileEntries.forEach(([name, cv], i) => {
    const x = 8 + i * (TILE * scale + pad);
    sheet.blit(cv.scaleNearest(scale), x, y);
  });
  y += TILE * scale + 20;
  drawText(sheet, 'PROPS', 8, y, [200, 210, 230, 255]);
  y += 10;
  let x = 8;
  for (const [name, cv] of propEntries) {
    sheet.blit(cv.scaleNearest(scale), x, y);
    x += cv.w * scale + pad;
  }
  return sheet;
}

// ---------------------------------------------------------------------
// tileset.json / license.json / README.md
// ---------------------------------------------------------------------
function tilesetJson() {
  return {
    biome: 'forest-v6-pieces',
    note: 'Supplemental pieces pack, NOT a full environment replacement. Meant to merge into the forest-v4.1 package already used by the game (forest-proof map, fp4_ prefix) -- see README.md "Integracao" for how game-dev should wire this in (new prefix or merged into fp4_* namespace, aliases.json update, both out of game-art write scope).',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'decor', 'canopy-top'],
    presets: { day: 'tiles/ + props/', night: 'not produced in this pack -- see README.md Limitacoes' },
    autotile: {
      pattern: '16-tile blob (same geometry as forest-v4 path_blob/denseedge_blob), bitmask = N*1 + E*2 + S*4 + W*8, 1 = same-type (water) neighbor present',
      cornerRule: 'Each tile corner independently rounded via a quarter-circle cut (R=0 both neighbors water / R=7 one neighbor / R=12 neither) with 1px seeded dither along the arc, same as forest-v4.',
      foamEdge: 'Additional pass not present in path_blob/denseedge_blob: boundary pixels within ~2px of the corner arc get a 55% chance of a waterFoam (Endesga-32 c19) fleck, so every shore edge shows foam without a separate foam tile.',
      sets: [
        {
          name: 'water_blob',
          center: 'shallow water',
          surround: 'grass (reuses forest_v4_tiles.js grassVariant as the background, so it matches whatever grass_NN is already on the ground layer)',
          files: Array.from({ length: 16 }, (_, m) => `tiles/water_blob_${m}.png`),
        },
      ],
    },
    tiles: Array.from({ length: 16 }, (_, m) => ({ file: `tiles/water_blob_${m}.png`, collision: false, suggestedLayer: 'ground', collisionNote: 'Water itself has no shape-based collision here -- if the map needs water to block walking, game-dev marks it in the collision layer per-cell (briefing/12_map_factory_v2.md camada collision e independente da arte).' })),
    props: [
      { file: 'props/bridge_h.png', collision: false, suggestedLayer: 'decor', footprintTiles: '3x1', note: 'Walkable deck over up to 3 water tiles in a row. Place centered on the water span.' },
      { file: 'props/bridge_v.png', collision: false, suggestedLayer: 'decor', footprintTiles: '1x3', note: '90deg rotation of bridge_h.' },
      { file: 'props/rock_big.png', collision: true, suggestedLayer: 'decor', footprintTiles: '~1.4x1.1' },
      { file: 'props/rock_small.png', collision: true, suggestedLayer: 'decor', footprintTiles: '~0.6x0.4' },
      { file: 'props/chest_closed.png', collision: true, suggestedLayer: 'decor', interactive: true, note: 'Single closed state only -- no open/empty state produced yet (see README.md Limitacoes).' },
      { file: 'props/sign_post.png', collision: true, suggestedLayer: 'decor', interactive: true, note: 'Board is blank except a placeholder "!" mark -- per-map sign text is a data/UI concern (a tooltip or popup keyed by map object id), not baked into the pixel art.' },
      { file: 'props/healing_point.png', collision: false, suggestedLayer: 'decor', interactive: true, note: 'Non-collision: the player stands on it to trigger the heal. No animation (static glow) -- see README.md Limitacoes.' },
    ],
  };
}

function licenseJson() {
  return {
    biome: 'forest-v6-pieces',
    layer: 'original',
    assets: [
      {
        group: 'water+shore autotile (16-tile blob) + bridge (h/v) + rock_big + rock_small + chest_closed + sign_post + healing_point',
        layer: 'original',
        author: 'game-art',
        technique: 'Canvas.js pixel matrix (fillEllipse/fillRect/line/blendPixel) + the forest-v4 16-tile blob autotile corner-rounding algorithm (reimplemented locally from forest_v4_tiles.js buildBlobTile, which is not exported by that module -- same geometry, no behavior change) + forest_v4_props.js rimDarken() reused as-is. Palette: forest_v4_palette.js ramps (bark, ground.stone, ground.moss, ink) and the raw Endesga-32 water/gold/white aliases from endesga32.js (W.waterDeep/waterMid/waterBright/waterFoam/gold/orange/white) -- no new hex colors invented, same studio palette as forest-v4/v4.1.',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- no third-party art referenced pixel-for-pixel. Third-party style references (Drakantos, IdleDex, Digimon) informed composition/lighting direction only, per ADR-010/ADR-011 Secao 5, not these specific pixels.',
      },
    ],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };
}

function main() {
  const ramp = withPreset(true);
  const seed = 6001;
  const tiles = waterBlobSet(ramp, seed);
  const props = {
    bridge_h: bridgeH(ramp, seed + 1000),
    bridge_v: rotate90CW(bridgeH(ramp, seed + 1000)),
    rock_big: rockBig(ramp, seed + 1001),
    rock_small: rockSmall(ramp, seed + 1002),
    chest_closed: chestClosed(ramp, seed + 1003),
    sign_post: signPost(ramp, seed + 1004),
    healing_point: healingPoint(ramp, seed + 1005),
  };

  const tilesDir = path.join(OUT, 'tiles'), propsDir = path.join(OUT, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });
  for (const [name, canvas] of Object.entries(tiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(props)) canvas.save(path.join(propsDir, `${name}.png`));

  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson(), null, 2));
  buildPreview('FOREST-V6 PIECES (day only)', tiles, props).save(path.join(OUT, 'preview.png'));

  console.log('forest-v6 pieces written to', OUT);
}

main();
