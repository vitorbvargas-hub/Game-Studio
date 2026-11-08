'use strict';
// GS-003 forest-v4 ground tiles: 6 grass variants + true blob autotile
// (16-tile, N/E/S/W bitmask, quarter-circle rounded corners -- no square
// seams) for grass<->dirt-path and clearing<->dense-forest-floor. Pixel
// matrix technique (per-pixel paint + seeded dither), same convention as
// forest-v3's biome_tiles.js, extended with the forest-v4 palette ramps.
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');

const TILE = 32;

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }

// ---- 6 grass variants -------------------------------------------------
// g = ramp.foliage (8 tones). Each variant reuses the same base fill +
// texture pass but biases a different accent (plain / clover / pebbles /
// tall-tuft fleck / dry patch / pale bloom) so a 6x6 field never repeats.
function grassVariant(ramp, variant, seed) {
  const c = new Canvas(TILE, TILE);
  const g = ramp.foliage;
  c.fillRect(0, 0, TILE - 1, TILE - 1, g[2]);
  const rnd = rng(seed + variant * 101);
  // soft mid-tone cloud patches so the base isn't one flat fill
  for (let i = 0; i < 5; i++) {
    const cx = 3 + Math.floor(rnd() * (TILE - 6));
    const cy = 3 + Math.floor(rnd() * (TILE - 6));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(g[3], 140));
  }
  // directional blade clusters, light upper-left / dark lower-right
  for (let i = 0; i < 46; i++) {
    const bx = 1 + Math.floor(rnd() * (TILE - 2));
    const by = 1 + Math.floor(rnd() * (TILE - 3));
    const lit = (bx + by) < 30;
    const tone = lit ? pick(rnd, [g[5], g[6]]) : pick(rnd, [g[1], g[2]]);
    c.setPixel(bx, by, tone);
    if (rnd() < 0.55) c.setPixel(bx, by + 1, tone);
  }
  if (variant === 1) { // clover flecks
    for (let i = 0; i < 4; i++) {
      const px = 3 + Math.floor(rnd() * (TILE - 6)), py = 3 + Math.floor(rnd() * (TILE - 6));
      c.setPixel(px, py, g[6]); c.setPixel(px + 1, py, g[4]); c.setPixel(px, py + 1, g[4]);
    }
  } else if (variant === 2) { // pebble grit
    for (let i = 0; i < 3; i++) {
      const px = 3 + Math.floor(rnd() * (TILE - 6)), py = 3 + Math.floor(rnd() * (TILE - 6));
      c.setPixel(px, py, ramp.ground.stone[0]); c.setPixel(px + 1, py, withAlpha(ramp.ground.stone[1], 200));
    }
  } else if (variant === 3) { // tiny flower
    const fx = 4 + Math.floor(rnd() * (TILE - 8)), fy = 4 + Math.floor(rnd() * (TILE - 8));
    const petal = pick(rnd, [ramp.flower.white, ramp.flower.yellow]);
    c.setPixel(fx, fy, petal); c.setPixel(fx + 1, fy, petal); c.setPixel(fx, fy + 1, g[1]);
  } else if (variant === 4) { // dry/sun patch
    c.fillEllipse(16, 16, 9, 6, withAlpha(g[5], 90));
  } else if (variant === 5) { // fallen leaf fleck
    for (let i = 0; i < 2; i++) {
      const px = 4 + Math.floor(rnd() * (TILE - 8)), py = 4 + Math.floor(rnd() * (TILE - 8));
      c.setPixel(px, py, ramp.ground.leafLitter[1]);
    }
  }
  return c;
}

function dirtTexture(c, x0, y0, w, h, ramp, seed) {
  const d = ramp.ground.dirt;
  const rnd = rng(seed);
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, d[1]);
  for (let i = 0; i < Math.round(w * h * 0.12); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.setPixel(px, py, rnd() < 0.5 ? d[0] : d[2]);
  }
  for (let i = 0; i < Math.round(w * h * 0.02); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.fillEllipse(px, py, 1, 1, withAlpha(ramp.ground.stone[0], 180));
  }
}

function denseFloorTexture(c, x0, y0, w, h, ramp, seed) {
  const g = ramp.foliage;
  const rnd = rng(seed);
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, g[1]);
  for (let i = 0; i < Math.round(w * h * 0.1); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.fillEllipse(px, py, 1, 1, withAlpha(rnd() < 0.5 ? g[0] : g[2], 220));
  }
  if (rnd() < 0.5) {
    const lx = x0 + Math.floor(rnd() * w), ly = y0 + Math.floor(rnd() * h);
    c.fillEllipse(lx, ly, 3, 2, withAlpha(g[5], 110));
  }
}

function clearingTexture(c, x0, y0, w, h, ramp, seed) {
  const sub = new Canvas(w, h);
  const base = grassVariant(ramp, Math.floor(rng(seed)() * 6), seed + 7);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) sub.setPixel(x, y, base.getPixel(x, y));
  c.blit(sub, x0, y0);
}

// ---- generic 16-tile blob autotile (quarter-circle rounded corners) ------
// bitmask bit0=N bit1=E bit2=S bit3=W ("same-type" neighbor present).
// fgTexture paints the *foreground* (center-type, e.g. dirt/denseFloor) and
// bgTexture paints the *background* (e.g. grass/clearing) that shows through
// the rounded corner notches -- no hard 4px square seam anywhere.
function buildBlobTile(bitmask, ramp, seed, fgTexture, bgTexture) {
  const c = new Canvas(TILE, TILE);
  bgTexture(c, 0, 0, TILE, TILE, ramp, seed);
  const sub = new Canvas(TILE, TILE);
  fgTexture(sub, 0, 0, TILE, TILE, ramp, seed + 500);
  const N = !!(bitmask & 1), E = !!(bitmask & 2), S = !!(bitmask & 4), W = !!(bitmask & 8);
  const corners = [
    { cx: 0, cy: 0, e1: N, e2: W, qx0: 0, qy0: 0 },
    { cx: TILE - 1, cy: 0, e1: N, e2: E, qx0: TILE / 2, qy0: 0 },
    { cx: 0, cy: TILE - 1, e1: S, e2: W, qx0: 0, qy0: TILE / 2 },
    { cx: TILE - 1, cy: TILE - 1, e1: S, e2: E, qx0: TILE / 2, qy0: TILE / 2 },
  ];
  const rnd = rng(seed + 900);
  const half = TILE / 2;
  for (const q of corners) {
    const R = q.e1 && q.e2 ? 0 : (q.e1 || q.e2 ? 7 : 12);
    for (let dy = 0; dy < half; dy++) {
      for (let dx = 0; dx < half; dx++) {
        const px = q.qx0 + dx, py = q.qy0 + dy;
        const dist = Math.hypot(px - q.cx, py - q.cy);
        let isBg = R > 0 && dist < R;
        if (R > 0 && Math.abs(dist - R) < 1.6 && rnd() < 0.5) isBg = !isBg;
        if (!isBg) c.setPixel(px, py, sub.getPixel(px, py));
      }
    }
  }
  return c;
}

function pathBlobSet(ramp, seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[`path_blob_${m}`] = buildBlobTile(m, ramp, seed + m * 17, dirtTexture, (c, x, y, w, h, r, s) => { const v = grassVariant(r, m % 6, s); c.blit(v, x, y); });
  return tiles;
}
function denseFloorBlobSet(ramp, seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[`denseedge_blob_${m}`] = buildBlobTile(m, ramp, seed + m * 23, denseFloorTexture, clearingTexture);
  return tiles;
}

module.exports = { TILE, grassVariant, pathBlobSet, denseFloorBlobSet, dirtTexture, denseFloorTexture };
