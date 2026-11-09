'use strict';
// Shared 16-tile blob autotile builder (bitmask N*1 + E*2 + S*4 + W*8,
// quarter-circle rounded corners, 1px seeded dither on the arc).
//
// This exact geometry is already used three times in this pipeline --
// forest_v4_tiles.js (path_blob/denseedge_blob, not exported) and
// gen_forest_v6_pieces.js (water_blob, reimplemented inline because the v4
// version isn't exported). Extracted here once so forest-v8's cliff-top
// autotile is the 4th use without yet another inline copy.
const { Canvas } = require('./canvas.js');
const { rng } = require('./endesga32.js');

// fgTexture/bgTexture signature matches the existing convention:
// (canvas, x0, y0, w, h, ramp, seed) -- always called with the full tile
// (0, 0, tileSize, tileSize) by this builder, same as every caller so far.
function buildBlobTile(tileSize, bitmask, ramp, seed, fgTexture, bgTexture, opts = {}) {
  const c = new Canvas(tileSize, tileSize);
  bgTexture(c, 0, 0, tileSize, tileSize, ramp, seed);
  const sub = new Canvas(tileSize, tileSize);
  fgTexture(sub, 0, 0, tileSize, tileSize, ramp, seed + 500);
  const N = !!(bitmask & 1), E = !!(bitmask & 2), S = !!(bitmask & 4), WEST = !!(bitmask & 8);
  const half = tileSize / 2;
  const rOuter = opts.rOuter != null ? opts.rOuter : Math.round(tileSize * 0.375);
  const rSingle = opts.rSingle != null ? opts.rSingle : Math.round(tileSize * 0.22);
  const corners = [
    { cx: 0, cy: 0, e1: N, e2: WEST, qx0: 0, qy0: 0 },
    { cx: tileSize - 1, cy: 0, e1: N, e2: E, qx0: half, qy0: 0 },
    { cx: 0, cy: tileSize - 1, e1: S, e2: WEST, qx0: 0, qy0: half },
    { cx: tileSize - 1, cy: tileSize - 1, e1: S, e2: E, qx0: half, qy0: half },
  ];
  const rnd = rng(seed + 900);
  for (const q of corners) {
    const R = q.e1 && q.e2 ? 0 : (q.e1 || q.e2 ? rSingle : rOuter);
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

module.exports = { buildBlobTile };
