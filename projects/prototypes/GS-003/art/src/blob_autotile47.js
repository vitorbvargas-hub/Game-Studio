'use strict';
// Shared 47-tile blob autotile builder (Wang/blob-47 dual-grid corner
// algorithm) -- same quarter-circle corner geometry and N/E/S/W bitmask
// convention as blob_autotile16.js (bit0=N, bit1=E, bit2=S, bit3=W, NOT
// modified by this file), extended with the diagonal-neighbor bit at each
// corner.
//
// Why: blob_autotile16.js decides a corner's rounding from ONLY its two
// adjacent edges -- when both are set it always fills the corner square
// (R=0), with no way to know whether the DIAGONAL neighbor cell is also
// the same terrain. forest-v10-ground-trees/README.md documented the
// resulting bug: a 1-tile-wide dirt "arm" sticking out of a 2x2 block has
// both edges set on the arm's outer corners (the block's own tiles
// continue past it) but the diagonal cell there is grass, not dirt -- so
// blob-16 always draws a hard square corner and the border reads as a
// "retangulo com dentes" every 32px instead of an organic bite. Adding the
// diagonal bit lets that corner render a small concave notch instead.
//
// Corner states (per corner, from its 2 adjacent edges + 1 diagonal):
//   no edges            -> convex "outer" rounding (R=rOuter)
//   exactly one edge     -> "single" rounding (R=rSingle)
//   both edges, diagonal -> full square corner (R=0, same as blob-16)
//   both edges, no diag  -> concave "notch" (R=rConcave) -- the new state
// Enumerating all 16 N/E/S/W combinations x every diagonal variant that
// actually matters (a corner's diagonal bit is only distinguishable when
// BOTH its edges are set -- otherwise no amount of diagonal info changes
// which state applies, so it is forced to 0 before dedup) yields exactly
// 47 unique renderable tiles -- the classic "blob-47" count.
const { Canvas } = require('./canvas.js');
const { rng } = require('./endesga32.js');

function cornerSpec(edgeMask) {
  const N = !!(edgeMask & 1), E = !!(edgeMask & 2), S = !!(edgeMask & 4), WEST = !!(edgeMask & 8);
  return [
    { key: 'NE', e1: N, e2: E, diagBit: 1 }, // NE diagonal bit
    { key: 'SE', e1: S, e2: E, diagBit: 2 }, // SE diagonal bit
    { key: 'SW', e1: S, e2: WEST, diagBit: 4 }, // SW diagonal bit
    { key: 'NW', e1: N, e2: WEST, diagBit: 8 }, // NW diagonal bit
  ];
}

// Lists all 47 valid (edgeMask, diagMask) pairs, in a stable order --
// callers use the array index as the tile's file suffix (0..46).
function enumerateBlob47() {
  const list = [];
  for (let edgeMask = 0; edgeMask < 16; edgeMask++) {
    const bothCorners = cornerSpec(edgeMask).filter((c) => c.e1 && c.e2);
    const variants = 1 << bothCorners.length;
    for (let v = 0; v < variants; v++) {
      let diagMask = 0;
      for (let bi = 0; bi < bothCorners.length; bi++) {
        if (v & (1 << bi)) diagMask |= bothCorners[bi].diagBit;
      }
      list.push({ edgeMask, diagMask });
    }
  }
  return list;
}

// Given the 8 boolean neighbors (N/E/S/W edges + NE/SE/SW/NW diagonals,
// each true when that neighbor cell is the SAME terrain as this cell),
// returns the index (0..46) into enumerateBlob47()'s list -- the lookup a
// placer (game-dev's map renderer) needs. Diagonal bits that don't apply
// to the current edge combination are ignored (normalized to 0) before
// matching, so passing raw 8-neighbor booleans always resolves.
function blob47Index(table, edgeMask, rawDiagMask) {
  const bothCorners = cornerSpec(edgeMask).filter((c) => c.e1 && c.e2);
  let normDiag = 0;
  for (const c of bothCorners) if (rawDiagMask & c.diagBit) normDiag |= c.diagBit;
  for (let i = 0; i < table.length; i++) {
    if (table[i].edgeMask === edgeMask && table[i].diagMask === normDiag) return i;
  }
  return -1;
}

// fgTexture/bgTexture signature matches blob_autotile16.js's buildBlobTile:
// (canvas, x0, y0, w, h, ramp, seed), always called with the full tile.
// Returns { canvas, isBg } -- isBg is a Uint8Array(tileSize*tileSize), 1
// where the background (bg) texture shows through a rounded/notched
// corner, so a caller can scatter edge decals (tufts, pebbles) exactly
// along the resolved boundary instead of guessing where it falls.
function buildBlobTile47(tileSize, edgeMask, diagMask, ramp, seed, fgTexture, bgTexture, opts = {}) {
  const c = new Canvas(tileSize, tileSize);
  bgTexture(c, 0, 0, tileSize, tileSize, ramp, seed);
  const sub = new Canvas(tileSize, tileSize);
  fgTexture(sub, 0, 0, tileSize, tileSize, ramp, seed + 500);
  const corners = cornerSpec(edgeMask);
  const half = tileSize / 2;
  const rOuter = opts.rOuter != null ? opts.rOuter : Math.round(tileSize * 0.375);
  const rSingle = opts.rSingle != null ? opts.rSingle : Math.round(tileSize * 0.22);
  const rConcave = opts.rConcave != null ? opts.rConcave : Math.round(tileSize * 0.16);
  const posByKey = {
    NE: { cx: tileSize - 1, cy: 0, qx0: half, qy0: 0 },
    SE: { cx: tileSize - 1, cy: tileSize - 1, qx0: half, qy0: half },
    SW: { cx: 0, cy: tileSize - 1, qx0: 0, qy0: half },
    NW: { cx: 0, cy: 0, qx0: 0, qy0: 0 },
  };
  const rnd = rng(seed + 900);
  const isBg = new Uint8Array(tileSize * tileSize);
  for (const corner of corners) {
    const pos = posByKey[corner.key];
    const both = corner.e1 && corner.e2;
    const diagSet = !!(diagMask & corner.diagBit);
    const R = both ? (diagSet ? 0 : rConcave) : ((corner.e1 || corner.e2) ? rSingle : rOuter);
    for (let dy = 0; dy < half; dy++) {
      for (let dx = 0; dx < half; dx++) {
        const px = pos.qx0 + dx, py = pos.qy0 + dy;
        const dist = Math.hypot(px - pos.cx, py - pos.cy);
        let bg = R > 0 && dist < R;
        if (R > 0 && Math.abs(dist - R) < 1.6 && rnd() < 0.5) bg = !bg;
        if (bg) { isBg[py * tileSize + px] = 1; }
        else c.setPixel(px, py, sub.getPixel(px, py));
      }
    }
  }
  return { canvas: c, isBg };
}

module.exports = { buildBlobTile47, enumerateBlob47, blob47Index, cornerSpec };
