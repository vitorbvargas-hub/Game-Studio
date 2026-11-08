'use strict';
// GS-003 biome tile + prop authoring toolkit. Pixel-matrix technique only
// (mask -> per-pixel paint + deterministic dithered seams, per-pixel texture
// flecks) -- consistent with ADR-009's rejection of parametric creature forms.
// Environment props (trees, reeds, posts) use Canvas primitives (fillEllipse/
// fillPolygon) layered by hand, which ART_STYLE_GUIDE never restricted (the
// ADR-009 rejection was specifically about describing CREATURE bodies
// parametrically; these are original, non-creature scenery dressing).
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');

const TILE = 32;
const CELL = 4; // 8x8 coarse mask -> 32x32 tile (4px per mask cell)

// ---- mask tile painter -----------------------------------------------
// mask: 8x8 array of 0 (colorA) / 1 (colorB). Paints the block fill, then
// dithers a 1px-ish fringe along the mask boundary so transitions aren't a
// hard 4px stair-step, then scatters per-tone texture flecks via a seeded
// PRNG so every tile is reproducible, not hand-placed pixel by pixel twice.
function paintMask(c, x0, y0, mask, colorA, colorB, seed) {
  const rnd = rng(seed);
  for (let my = 0; my < 8; my++) {
    for (let mx = 0; mx < 8; mx++) {
      const v = mask[my][mx];
      for (let dy = 0; dy < CELL; dy++) {
        for (let dx = 0; dx < CELL; dx++) {
          const px = x0 + mx * CELL + dx, py = y0 + my * CELL + dy;
          c.setPixel(px, py, v ? colorB : colorA);
        }
      }
    }
  }
  // Dither the seam: for every boundary mask-cell pair, flip ~40% of the
  // pixels along the shared edge to the other color (classic 2-color
  // checker dither instead of a razor-sharp block edge).
  for (let my = 0; my < 8; my++) {
    for (let mx = 0; mx < 8; mx++) {
      const v = mask[my][mx];
      const right = mx < 7 ? mask[my][mx + 1] : v;
      const down = my < 7 ? mask[my + 1][mx] : v;
      if (right !== v) {
        for (let dy = 0; dy < CELL; dy++) {
          if (rnd() < 0.55) {
            const px = x0 + mx * CELL + CELL - 1, py = y0 + my * CELL + dy;
            c.setPixel(px, py, right ? colorB : colorA);
          }
          if (rnd() < 0.55) {
            const px = x0 + (mx + 1) * CELL, py = y0 + my * CELL + dy;
            c.setPixel(px, py, v ? colorB : colorA);
          }
        }
      }
      if (down !== v) {
        for (let dx = 0; dx < CELL; dx++) {
          if (rnd() < 0.55) {
            const px = x0 + mx * CELL + dx, py = y0 + my * CELL + CELL - 1;
            c.setPixel(px, py, down ? colorB : colorA);
          }
          if (rnd() < 0.55) {
            const px = x0 + mx * CELL + dx, py = y0 + (my + 1) * CELL;
            c.setPixel(px, py, v ? colorB : colorA);
          }
        }
      }
    }
  }
  return rnd;
}

// ---- grass / path (campo de grama) ------------------------------------
const MASK_EMPTY = Array.from({ length: 8 }, () => [0, 0, 0, 0, 0, 0, 0, 0]);
const MASK_FULL = Array.from({ length: 8 }, () => [1, 1, 1, 1, 1, 1, 1, 1]);
// edge: path occupies the bottom half (path approaches from the south).
const MASK_EDGE_S = [0, 0, 0, 0, 1, 1, 1, 1].map((v) => Array(8).fill(v));
// edge: path occupies the right half (path approaches from the east) --
// independent axis from MASK_EDGE_S (varies in x, not y), needed because
// flipX/flipY alone can't turn a north/south seam into an east/west one.
const MASK_EDGE_E = Array.from({ length: 8 }, () => [0, 0, 0, 0, 1, 1, 1, 1]);
// corner: path occupies an L in the top-right (enters from north, exits east).
const MASK_CORNER_NE = Array.from({ length: 8 }, (_, my) =>
  Array.from({ length: 8 }, (_, mx) => (my < 4 || mx >= 4 ? 1 : 0)));

function grassBase(c, x, y, variant, seed) {
  c.fillRect(x, y, x + TILE - 1, y + TILE - 1, W.grassMid);
  const rnd = rng(seed + variant * 7);
  // Blade clusters: short vertical 1-2px strokes, biased lighter toward the
  // upper-left and darker toward the lower-right (fixed light source rule,
  // ART_STYLE_GUIDE section 5).
  for (let i = 0; i < 22; i++) {
    const bx = x + 1 + Math.floor(rnd() * (TILE - 2));
    const by = y + 1 + Math.floor(rnd() * (TILE - 4));
    const diag = (bx - x) + (by - y);
    const lit = diag < 26;
    const tone = (lit ? rnd() < 0.65 : rnd() < 0.35) ? W.grassLt : W.grassDk;
    c.setPixel(bx, by, tone);
    if (rnd() < 0.6) c.setPixel(bx, by + 1, tone);
  }
  // A couple of tiny flower flecks, sparse (not every tile).
  if (rnd() < 0.3) {
    const fx = x + 2 + Math.floor(rnd() * (TILE - 4));
    const fy = y + 2 + Math.floor(rnd() * (TILE - 4));
    const petal = rnd() < 0.5 ? W.white : W.gold;
    c.setPixel(fx, fy, petal);
    c.setPixel(fx + 1, fy, W.yellow);
  }
}

function dirtTexture(c, x, y, seed) {
  const rnd = rng(seed);
  c.fillRect(x, y + 1, x + TILE - 1, y + 2, W.dirtLt);
  for (let i = 0; i < 14; i++) {
    const px = x + Math.floor(rnd() * TILE);
    const py = y + Math.floor(rnd() * TILE);
    c.setPixel(px, py, rnd() < 0.5 ? W.dirtDk : W.dirtDarkest);
  }
}

function pathTileFull(seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.dirt);
  dirtTexture(c, 0, 0, seed);
  return c;
}

function grassTileVariant(variant, seed) {
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, variant, seed);
  return c;
}

function pathEdgeTile(seed) {
  // Grass north (mask 0), dirt south (mask 1): paint grass everywhere first
  // for texture continuity, then stamp dirt over the south mask region.
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_EDGE_S, W.grassMid, W.dirt, seed + 1);
  dirtTexture(c, 0, 16, seed + 2);
  return c;
}

function pathEdgeTileV(seed) {
  // Grass west (mask 0), dirt east (mask 1) -- vertical-boundary twin of
  // pathEdgeTile, used to derive the E/W variants via flipX.
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_EDGE_E, W.grassMid, W.dirt, seed + 1);
  dirtTexture(c, 16, 0, seed + 2);
  return c;
}

function pathCornerTile(seed) {
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_CORNER_NE, W.grassMid, W.dirt, seed + 1);
  dirtTexture(c, 0, 0, seed + 3);
  return c;
}

// ---- forest floor -------------------------------------------------------
function forestFloorTile(variant, seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.grassDk);
  const rnd = rng(seed + variant * 11);
  // Mottled undergrowth base: mid-green and near-black patches in small
  // clusters (not single flecks), so the tile reads as dense shaded floor
  // instead of a flat fill with sparse dots.
  for (let i = 0; i < 9; i++) {
    const cx = 2 + Math.floor(rnd() * (TILE - 4));
    const cy = 2 + Math.floor(rnd() * (TILE - 4));
    const dark = rnd() < 0.5;
    const tone = dark ? W.navyDk : W.grassMid;
    const r = 1 + Math.floor(rnd() * 2);
    c.fillEllipse(cx, cy, r, r - 1 < 1 ? 1 : r - 1, withAlpha(tone, 220));
  }
  for (let i = 0; i < 10; i++) {
    const px = 1 + Math.floor(rnd() * (TILE - 2));
    const py = 1 + Math.floor(rnd() * (TILE - 2));
    c.setPixel(px, py, rnd() < 0.5 ? W.grassLt : W.navyDk);
  }
  // Dappled canopy-gap light patches, biased upper-left.
  for (let i = 0; i < 2; i++) {
    if (rnd() < 0.55) {
      const lx = 3 + Math.floor(rnd() * 14), ly = 3 + Math.floor(rnd() * 14);
      c.fillEllipse(lx, ly, 3, 2, withAlpha(W.grassLt, 130));
    }
  }
  return c;
}

function forestEdgeTile(seed) {
  // Grass (field) north, forest floor south -- used where the field meets
  // the treeline.
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_EDGE_S, W.grassMid, W.grassDk, seed + 1);
  const rnd = rng(seed + 5);
  for (let i = 0; i < 8; i++) {
    const px = 1 + Math.floor(rnd() * (TILE - 2));
    const py = 17 + Math.floor(rnd() * 14);
    c.setPixel(px, py, W.navyDk);
  }
  return c;
}

// ---- water / shore --------------------------------------------------------
function waterTile(frame, seed) {
  const c = new Canvas(TILE, TILE);
  c.fillRect(0, 0, TILE - 1, TILE - 1, W.waterMid);
  const rnd = rng(seed + frame * 31);
  // Wavy ripple bands via a small wiggle lookup (reads as water, not
  // straight scanlines), opposite phase between frame 0/1 for a 2-frame loop.
  const wiggle = [0, 1, 2, 1, 0, -1, -2, -1];
  const phaseShift = frame === 0 ? 0 : 4;
  for (let row = 0; row < 4; row++) {
    const y0 = 3 + row * 8;
    for (let x = 0; x < TILE; x++) {
      const w = wiggle[(x + phaseShift) % 8];
      const y = y0 + w;
      if (y >= 0 && y < TILE && x % 4 < 2) {
        c.setPixel(x, y, withAlpha(W.waterBright, 150));
        if (y + 1 < TILE) c.setPixel(x, y + 1, withAlpha(W.waterDeep, 150));
      }
    }
  }
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, withAlpha(W.waterDeep, 200));
  }
  if (frame === 1) {
    for (let i = 0; i < 3; i++) {
      const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
      c.setPixel(px, py, withAlpha(W.waterFoam, 180));
    }
  }
  return c;
}

function shoreEdgeTile(seed) {
  // Grass/sand north, water south, with a foam seam.
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_EDGE_S, W.grassMid, W.waterMid, seed + 1);
  for (let x = 0; x < TILE; x++) {
    if (x % 3 !== 0) c.setPixel(x, 16, withAlpha(W.waterFoam, 200));
  }
  const rnd = rng(seed + 9);
  for (let i = 0; i < 5; i++) {
    const px = Math.floor(rnd() * TILE), py = 18 + Math.floor(rnd() * 12);
    c.setPixel(px, py, withAlpha(W.waterDeep, 180));
  }
  return c;
}

function shoreEdgeTileV(seed) {
  // Grass/sand west, water east -- vertical-boundary twin, for E/W via flipX.
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_EDGE_E, W.grassMid, W.waterMid, seed + 1);
  for (let y = 0; y < TILE; y++) {
    if (y % 3 !== 0) c.setPixel(16, y, withAlpha(W.waterFoam, 200));
  }
  const rnd = rng(seed + 9);
  for (let i = 0; i < 5; i++) {
    const px = 18 + Math.floor(rnd() * 12), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, withAlpha(W.waterDeep, 180));
  }
  return c;
}

function shoreCornerTile(seed) {
  const c = new Canvas(TILE, TILE);
  grassBase(c, 0, 0, 0, seed);
  paintMask(c, 0, 0, MASK_CORNER_NE, W.grassMid, W.waterMid, seed + 1);
  return c;
}

module.exports = {
  TILE, W, withAlpha, rng,
  pathTileFull, grassTileVariant, pathEdgeTile, pathEdgeTileV, pathCornerTile,
  forestFloorTile, forestEdgeTile,
  waterTile, shoreEdgeTile, shoreEdgeTileV, shoreCornerTile,
};
