'use strict';
// GS-003 forest-v4.1 -- true Wang/blob-47 autotile for path<->grass and
// dense-floor<->clearing (coordinator review: the v4 16-tile corner-only
// blob ignored the diagonal neighbor, so two fg tiles meeting at a right
// angle with a bg tile diagonally across always rendered a hard square
// inner corner -- the "cruz/xadrez" puzzle-piece look). Fix: classify each
// of the 4 tile corners from its 2 orthogonal edges *and* the diagonal
// neighbor (47 unique reachable combinations once irrelevant diagonal bits
// -- diagonal only matters when both adjacent edges are same-type -- are
// normalized away), add a concave notch radius for the "both edges same,
// diagonal different" case, organic per-corner radius jitter (width
// variation), and a boundary-noise pass that bleeds grass tufts into the
// dirt and drops pebbles into the grass right at the seam. Purely additive
// module: does not import/modify forest_v4_tiles.js, only reuses its
// grassVariant()/dirtTexture() building blocks by re-requiring that file.
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');
const base = require('./forest_v4_tiles.js');

const TILE = 32;

// ---- 8-direction mask normalization / enumeration ------------------------
// bit0 N, bit1 E, bit2 S, bit3 W, bit4 NE, bit5 SE, bit6 SW, bit7 NW.
// A diagonal bit only affects rendering when BOTH of its adjacent edge bits
// are set (that's the only condition where a corner can be concave), so we
// zero out "don't care" diagonal bits before dedup -- this is what collapses
// the 256 raw 8-neighbor combinations down to the classic 47 unique shapes.
function normalizeMask8(N, E, S, W, NE, SE, SW, NW) {
  const nNE = (N && E) ? NE : false;
  const nSE = (S && E) ? SE : false;
  const nSW = (S && W) ? SW : false;
  const nNW = (N && W) ? NW : false;
  return (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (W ? 8 : 0) |
    (nNE ? 16 : 0) | (nSE ? 32 : 0) | (nSW ? 64 : 0) | (nNW ? 128 : 0);
}

function enumerateWang47() {
  const set = new Set();
  for (let m = 0; m < 256; m++) {
    const N = !!(m & 1), E = !!(m & 2), S = !!(m & 4), W = !!(m & 8);
    const NE = !!(m & 16), SE = !!(m & 32), SW = !!(m & 64), NW = !!(m & 128);
    set.add(normalizeMask8(N, E, S, W, NE, SE, SW, NW));
  }
  return Array.from(set).sort((a, b) => a - b);
}

const WANG47_MASKS = enumerateWang47(); // length 47

function maskToKey(prefix, mask) { return `${prefix}_w47_${mask}`; }

// ---- 4 dirt interior variants: sulcos (grooves), pedrinhas (pebbles),
// folhas (leaves), misto (mixed) -- cycled by tile so a large dirt patch
// never reads as one flat stamp repeated. ------------------------------
function dirtGrooves(c, x0, y0, w, h, ramp, seed) {
  base.dirtTexture(c, x0, y0, w, h, ramp, seed);
  const d = ramp.ground.dirt;
  const rnd = rng(seed + 61);
  const grooves = 2 + Math.floor(rnd() * 2);
  for (let g = 0; g < grooves; g++) {
    let gx = x0 + 2 + rnd() * (w - 4), gy = y0 + 2 + rnd() * (h - 4);
    const steps = 6 + Math.floor(rnd() * 5);
    let ang = rnd() * Math.PI * 2;
    for (let i = 0; i < steps; i++) {
      ang += (rnd() - 0.5) * 0.9;
      gx += Math.cos(ang) * 2.2; gy += Math.sin(ang) * 2.2;
      if (gx < x0 || gy < y0 || gx >= x0 + w || gy >= y0 + h) break;
      c.setPixel(Math.round(gx), Math.round(gy), d[0]);
      if (rnd() < 0.5) c.setPixel(Math.round(gx) + 1, Math.round(gy), withAlpha(d[1], 200));
    }
  }
}
function dirtPebbles(c, x0, y0, w, h, ramp, seed) {
  base.dirtTexture(c, x0, y0, w, h, ramp, seed);
  const s = ramp.ground.stone;
  const rnd = rng(seed + 62);
  for (let i = 0; i < 6; i++) {
    const px = x0 + 2 + Math.floor(rnd() * (w - 4)), py = y0 + 2 + Math.floor(rnd() * (h - 4));
    c.fillEllipse(px, py, 1, 1, s[Math.floor(rnd() * s.length)]);
    if (rnd() < 0.4) c.setPixel(px - 1, py, withAlpha(ramp.ink, 90));
  }
}
function dirtLeaves(c, x0, y0, w, h, ramp, seed) {
  base.dirtTexture(c, x0, y0, w, h, ramp, seed);
  const l = ramp.ground.leafLitter;
  const rnd = rng(seed + 63);
  for (let i = 0; i < 5; i++) {
    const px = x0 + 2 + Math.floor(rnd() * (w - 4)), py = y0 + 2 + Math.floor(rnd() * (h - 4));
    c.fillEllipse(px, py, 1, 1, withAlpha(l[Math.floor(rnd() * l.length)], 230));
  }
}
function dirtMixed(c, x0, y0, w, h, ramp, seed) {
  base.dirtTexture(c, x0, y0, w, h, ramp, seed);
  const rnd = rng(seed + 64);
  const s = ramp.ground.stone, l = ramp.ground.leafLitter;
  for (let i = 0; i < 2; i++) { const px = x0 + 2 + Math.floor(rnd() * (w - 4)), py = y0 + 2 + Math.floor(rnd() * (h - 4)); c.fillEllipse(px, py, 1, 1, s[0]); }
  for (let i = 0; i < 2; i++) { const px = x0 + 2 + Math.floor(rnd() * (w - 4)), py = y0 + 2 + Math.floor(rnd() * (h - 4)); c.fillEllipse(px, py, 1, 1, withAlpha(l[1], 210)); }
}
const DIRT_VARIANTS = [dirtGrooves, dirtPebbles, dirtLeaves, dirtMixed];

// ---- clearing-floor dithered texture (fixes "manchas escuras quadradas") -
// Uses a smooth 2D wave whose frequency divides 32 evenly (so the tile
// wraps onto itself with zero seam) crossed with a 4x4 Bayer threshold for
// a crisp pixel-art dither band, instead of the old per-tile random soft
// ellipses that got hard-clipped at the 32px canvas edge (that clipping is
// what read as dark square patches once several tiles sat side by side).
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function clearingFloorTexture(c, x0, y0, w, h, ramp, seed, variant = 0) {
  const g = ramp.foliage;
  const rnd = rng(seed);
  const freq = [1, 2][variant % 2];
  const phase = rnd() * Math.PI * 2;
  const bOffX = Math.floor(rnd() * 4), bOffY = Math.floor(rnd() * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w, ny = y / h;
      const s = Math.sin(nx * freq * Math.PI * 2 + phase) * Math.cos(ny * freq * Math.PI * 2 + phase * 0.7);
      const bayer = BAYER4[((y + bOffY) % 4) * 4 + ((x + bOffX) % 4)] / 16 - 0.47;
      const v = s * 0.32 + bayer * 0.22;
      const tone = v > 0.27 ? g[3] : v < -0.27 ? g[1] : g[2];
      c.setPixel(x0 + x, y0 + y, tone);
    }
  }
  for (let i = 0; i < 6; i++) {
    const bx = x0 + 1 + Math.floor(rnd() * (w - 2)), by = y0 + 1 + Math.floor(rnd() * (h - 2));
    const lit = (bx - x0) + (by - y0) < w * 0.9;
    c.setPixel(bx, by, lit ? g[5] : g[1]);
  }
  if (rnd() < 0.7) {
    const lx = x0 + 3 + Math.floor(rnd() * (w - 6)), ly = y0 + 3 + Math.floor(rnd() * (h - 6));
    c.setPixel(lx, ly, ramp.ground.leafLitter[Math.floor(rnd() * ramp.ground.leafLitter.length)]);
  }
}
function clearingFloorSet(ramp, seed) {
  const tiles = {};
  for (let v = 0; v < 4; v++) {
    const c = new Canvas(TILE, TILE);
    clearingFloorTexture(c, 0, 0, TILE, TILE, ramp, seed + v * 211, v);
    tiles[`clearing_floor_v41_${String(v).padStart(2, '0')}`] = c;
  }
  return tiles;
}

// ---- generic 47-shape blob tile builder with organic boundary noise ------
function buildBlobTile47(mask, ramp, seed, fgTexture, bgTexture, accent) {
  const N = !!(mask & 1), E = !!(mask & 2), S = !!(mask & 4), W = !!(mask & 8);
  const NE = !!(mask & 16), SE = !!(mask & 32), SW = !!(mask & 64), NW = !!(mask & 128);
  const bgFull = new Canvas(TILE, TILE);
  bgTexture(bgFull, 0, 0, TILE, TILE, ramp, seed);
  const fgFull = new Canvas(TILE, TILE);
  fgTexture(fgFull, 0, 0, TILE, TILE, ramp, seed + 500);

  const rnd = rng(seed + 900);
  const half = TILE / 2;
  const corners = [
    { cx: 0, cy: 0, e1: N, e2: W, diag: NW, qx0: 0, qy0: 0 },
    { cx: TILE - 1, cy: 0, e1: N, e2: E, diag: NE, qx0: half, qy0: 0 },
    { cx: 0, cy: TILE - 1, e1: S, e2: W, diag: SW, qx0: 0, qy0: half },
    { cx: TILE - 1, cy: TILE - 1, e1: S, e2: E, diag: SE, qx0: half, qy0: half },
  ];
  const isFg = new Uint8Array(TILE * TILE).fill(1);
  for (const q of corners) {
    let R;
    if (q.e1 && q.e2) R = q.diag ? 0 : 7; // concave notch when the diagonal tile differs
    else if (q.e1 || q.e2) R = 10;
    else R = 13;
    if (R > 0) R += Math.round((rnd() - 0.5) * 4); // +-2px organic width variation
    if (R <= 0) continue;
    for (let dy = 0; dy < half; dy++) {
      for (let dx = 0; dx < half; dx++) {
        const px = q.qx0 + dx, py = q.qy0 + dy;
        const dist = Math.hypot(px - q.cx, py - q.cy);
        let bg = dist < R;
        if (Math.abs(dist - R) < 2.2 && rnd() < 0.5) bg = !bg;
        if (bg) isFg[py * TILE + px] = 0;
      }
    }
  }

  const out = new Canvas(TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      out.setPixel(x, y, isFg[y * TILE + x] ? fgFull.getPixel(x, y) : bgFull.getPixel(x, y));
    }
  }
  // boundary noise: fg pixels adjacent to bg get an occasional bg-accent
  // tuft bleeding in; bg pixels adjacent to fg get an occasional fg-accent
  // speck (pebble) dropped just outside -- organic, irregular-width seam.
  if (accent) {
    for (let y = 1; y < TILE - 1; y++) {
      for (let x = 1; x < TILE - 1; x++) {
        const here = isFg[y * TILE + x];
        const edge = here !== isFg[(y - 1) * TILE + x] || here !== isFg[(y + 1) * TILE + x] ||
          here !== isFg[y * TILE + (x - 1)] || here !== isFg[y * TILE + (x + 1)];
        if (!edge) continue;
        if (here && rnd() < accent.tuftProb) out.setPixel(x, y, accent.tuftColor(rnd));
        else if (!here && rnd() < accent.pebbleProb) out.setPixel(x, y, accent.pebbleColor(rnd));
      }
    }
  }
  return out;
}

function pathWang47Set(ramp, seed) {
  const tiles = {};
  WANG47_MASKS.forEach((mask, i) => {
    const fg = DIRT_VARIANTS[i % DIRT_VARIANTS.length];
    const bg = (c, x, y, w, h, r, s) => c.blit(base.grassVariant(r, i % 6, s), x, y);
    tiles[maskToKey('path', mask)] = buildBlobTile47(mask, ramp, seed + i * 29, fg, bg, {
      tuftProb: 0.1,
      pebbleProb: 0.06,
      tuftColor: (rnd) => ramp.foliage[rnd() < 0.5 ? 5 : 6],
      pebbleColor: (rnd) => ramp.ground.stone[Math.floor(rnd() * ramp.ground.stone.length)],
    });
  });
  return tiles;
}

function denseWang47Set(ramp, seed) {
  const tiles = {};
  WANG47_MASKS.forEach((mask, i) => {
    const fg = (c, x, y, w, h, r, s) => base.denseFloorTexture(c, x, y, w, h, r, s);
    const bg = (c, x, y, w, h, r, s) => clearingFloorTexture(c, x, y, w, h, r, s, i % 4);
    tiles[maskToKey('denseedge', mask)] = buildBlobTile47(mask, ramp, seed + i * 31, fg, bg, {
      tuftProb: 0.08,
      pebbleProb: 0.05,
      tuftColor: (rnd) => ramp.foliage[rnd() < 0.5 ? 0 : 1],
      pebbleColor: (rnd) => ramp.ground.moss,
    });
  });
  return tiles;
}

module.exports = {
  TILE, WANG47_MASKS, normalizeMask8, maskToKey,
  DIRT_VARIANTS, clearingFloorTexture, clearingFloorSet,
  buildBlobTile47, pathWang47Set, denseWang47Set,
};
