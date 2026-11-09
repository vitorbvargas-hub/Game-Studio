'use strict';
// Real-texture 16-tile blob autotile (N/E/S/W bitmask, quarter-circle
// rounded corners) -- same proven geometry as forest-v4's buildBlobTile()
// in forest_v4_tiles.js, but the foreground/background fills are tiled
// crops of real licensed pixel art (NinjaAdventure) instead of procedural
// painting, per ADR-010 "switch to professional ready-made tilesets".
const { Canvas } = require('./canvas.js');
const { tiledFill } = require('./na_source.js');

function buildBlobTile32(bitmask, fgSample, bgSample, seed) {
  const TILE = 32;
  const c = new Canvas(TILE, TILE);
  tiledFill(c, 0, 0, TILE, TILE, bgSample, seed);
  const sub = new Canvas(TILE, TILE);
  tiledFill(sub, 0, 0, TILE, TILE, fgSample, seed + 500);
  const N = !!(bitmask & 1), E = !!(bitmask & 2), S = !!(bitmask & 4), W = !!(bitmask & 8);
  const corners = [
    { cx: 0, cy: 0, e1: N, e2: W, qx0: 0, qy0: 0 },
    { cx: TILE - 1, cy: 0, e1: N, e2: E, qx0: TILE / 2, qy0: 0 },
    { cx: 0, cy: TILE - 1, e1: S, e2: W, qx0: 0, qy0: TILE / 2 },
    { cx: TILE - 1, cy: TILE - 1, e1: S, e2: E, qx0: TILE / 2, qy0: TILE / 2 },
  ];
  let seedState = (seed + 900) >>> 0;
  const rnd = () => { seedState = (seedState * 1664525 + 1013904223) >>> 0; return seedState / 4294967296; };
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

function buildBlobSet(prefix, fgSample, bgSample, seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[`${prefix}_${m}`] = buildBlobTile32(m, fgSample, bgSample, seed + m * 17);
  return tiles;
}

module.exports = { buildBlobTile32, buildBlobSet };
