'use strict';
// GS-003 forest-v3 prop/tile authoring -- denser, richer canopy trees, tall
// grass clumps, flower clusters and clearing/path tiles than the original
// floresta/floresta-dwds packs, built for the GS-004 canonical proof scene
// (ADR-010). Technique: Canvas primitives layered by hand (same rule as
// biome_props.js -- scenery/props, not creature bodies, so fillEllipse/
// fillPolygon are allowed per ADR-009's scope). Palette: Endesga-32 (W.*),
// same shared pool as the rest of the world art, mixed with a couple of
// DW-sampled accents (DW.*) for continuity with the official-fan-use ground
// crops used alongside these props.
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');
const { DW } = require('./dwds_palette.js');

// ---- canopy trees (4 silhouette variants) ---------------------------------
// Shared canopy painter: `lobes` is an array of [dx, dy, r] offsets from the
// canopy center: overlapping ellipses build an irregular (non-circular)
// outline, then two inset passes add mid-tone and a tight upper-left
// highlight band, then a texture pass scatters per-pixel leaf-cluster specks
// (light flecks upper-left quadrant, dark flecks lower-right quadrant) so the
// canopy reads as leaf mass, not a flat blob -- the Drakantos-density target.
function paintCanopy(c, cx, cy, lobes, tones, seed, opts = {}) {
  const { dk, mid, lt, rim } = tones;
  const rnd = rng(seed);
  for (const [dx, dy, r] of lobes) c.fillEllipse(cx + dx, cy + dy, r, Math.round(r * 0.82), dk);
  for (const [dx, dy, r] of lobes) {
    c.fillEllipse(cx + dx - 2, cy + dy - 2, Math.max(2, r - 5), Math.max(2, Math.round(r * 0.82) - 6), mid);
  }
  for (const [dx, dy, r] of lobes) {
    c.fillEllipse(cx + dx - 5, cy + dy - 6, Math.max(1, r - 11), Math.max(1, Math.round(r * 0.82) - 12), lt);
  }
  // rim-light sliver, upper-left only, tight and bright (fixed light source).
  for (const [dx, dy, r] of lobes) {
    if (r < 10) continue;
    c.fillEllipse(cx + dx - Math.round(r * 0.45), cy + dy - Math.round(r * 0.5), Math.max(1, Math.round(r * 0.3)), Math.max(1, Math.round(r * 0.22)), withAlpha(rim, 200));
  }
  // leaf-cluster speckle: dense per-pixel texture, biased light upper-left /
  // dark lower-right across the whole canopy footprint (not per-lobe).
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [dx, dy, r] of lobes) {
    minX = Math.min(minX, cx + dx - r); maxX = Math.max(maxX, cx + dx + r);
    minY = Math.min(minY, cy + dy - r); maxY = Math.max(maxY, cy + dy + r);
  }
  const n = opts.speckle || 70;
  for (let i = 0; i < n; i++) {
    const px = Math.round(minX + rnd() * (maxX - minX));
    const py = Math.round(minY + rnd() * (maxY - minY));
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    const diag = (px - minX) + (py - minY) * 1.1;
    const span = (maxX - minX) + (maxY - minY) * 1.1;
    const litSide = diag < span * 0.46;
    const tone = litSide ? (rnd() < 0.55 ? lt : mid) : (rnd() < 0.5 ? dk : mid);
    c.blendPixel(px, py, withAlpha(tone, 190));
  }
  // tiny gap/shadow punctures inside the mass so the silhouette isn't a
  // perfectly solid fill (reads as gaps between leaf clumps).
  for (let i = 0; i < Math.round(n * 0.25); i++) {
    const px = Math.round(minX + rnd() * (maxX - minX));
    const py = Math.round(minY + rnd() * (maxY - minY));
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    if (rnd() < 0.5) c.blendPixel(px, py, withAlpha(dk, 160));
  }
  return { minX, maxX, minY, maxY };
}

function trunk(c, cx, topY, h, w, dk, mid, lt) {
  const half = Math.round(w / 2);
  c.fillRect(cx - half, topY, cx + half, topY + h, dk);
  c.fillRect(cx - half, topY, cx - 1, topY + h, mid);
  c.fillRect(cx - 1, topY, cx, topY + h, lt);
  // bark texture flecks
  for (let y = topY; y < topY + h; y += 3) {
    c.setPixel(cx - half + 1, y, dk);
    c.setPixel(cx + half - 1, y, dk);
  }
}

// 1) Round dense canopy -- the "classic" multi-lobe blob, pushed denser/
// larger than biome_props.treeForest, 4-5 overlapping lobes with no visible
// gaps at the seams.
function treeRoundDense(seed) {
  const c = new Canvas(76, 100);
  const cx = 38, cy = 42;
  trunk(c, cx, 76, 22, 10, W.dirtDarkest, W.dirtDk, W.dirtLt);
  const lobes = [
    [0, 0, 30], [-18, 6, 22], [18, 8, 23], [-8, -14, 22], [12, -12, 20], [2, 16, 24],
  ];
  paintCanopy(c, cx, cy, lobes, { dk: W.navyDk, mid: W.grassDk, lt: W.grassMid, rim: W.grassLt }, seed, { speckle: 95 });
  c.autoOutline(W.ink);
  c.fillEllipse(cx, 97, 20, 4, withAlpha(W.ink, 80));
  return c;
}

// 2) Tall layered conifer -- 3 stacked tiers, narrower, taller silhouette for
// vertical variety against the round trees.
function treeTallConifer(seed) {
  const c = new Canvas(58, 118);
  const cx = 29;
  trunk(c, cx, 92, 24, 8, W.dirtDarkest, W.dirtDk, W.dirtLt);
  const tiers = [
    { cy: 92, r: 24 }, { cy: 64, r: 20 }, { cy: 38, r: 16 }, { cy: 16, r: 11 },
  ];
  const rnd = rng(seed);
  for (const t of tiers) {
    const lobes = [[0, 0, t.r], [-Math.round(t.r * 0.5), 3, Math.round(t.r * 0.75)], [Math.round(t.r * 0.5), 3, Math.round(t.r * 0.75)]];
    paintCanopy(c, cx, t.cy, lobes, { dk: W.navyDk, mid: W.grassDk, lt: W.grassMid, rim: W.grassLt }, seed + t.cy, { speckle: 34 });
  }
  c.autoOutline(W.ink);
  c.fillEllipse(cx, 116, 16, 3, withAlpha(W.ink, 80));
  return c;
}

// 3) Wide bushy canopy -- low and broad, for visual rhythm breaks in a dense
// treeline (keeps the wall from reading as a repeating single silhouette).
function treeWideBushy(seed) {
  const c = new Canvas(92, 80);
  const cx = 46, cy = 38;
  trunk(c, cx, 62, 16, 12, W.dirtDarkest, W.dirtDk, W.dirtLt);
  const lobes = [
    [-28, 4, 22], [28, 4, 22], [0, -6, 28], [-14, 12, 20], [14, 12, 20], [0, 14, 22],
  ];
  paintCanopy(c, cx, cy, lobes, { dk: W.navyDk, mid: W.grassDk, lt: W.grassMid, rim: W.grassLt }, seed, { speckle: 100 });
  c.autoOutline(W.ink);
  c.fillEllipse(cx, 78, 26, 4, withAlpha(W.ink, 80));
  return c;
}

// 4) Flowering accent tree -- same mass as treeRoundDense but with a warm
// blossom tint woven through the canopy, used sparingly as a color accent
// (the reference has no flowering trees, but GS-004 section 3 explicitly
// asks to exceed it -- a few color accents in the treeline read as "more
// detail/variation" without breaking the canonical silhouette language).
function treeFlowering(seed) {
  const c = new Canvas(74, 98);
  const cx = 37, cy = 42;
  trunk(c, cx, 74, 22, 10, W.dirtDarkest, W.dirtDk, W.dirtLt);
  const lobes = [
    [0, 0, 29], [-16, 6, 21], [17, 7, 21], [-7, -13, 20], [11, -12, 18], [2, 15, 22],
  ];
  const { minX, maxX, minY, maxY } = paintCanopy(c, cx, cy, lobes, { dk: W.navyDk, mid: W.grassDk, lt: W.grassMid, rim: W.grassLt }, seed, { speckle: 80 });
  const rnd = rng(seed + 900);
  const blossom = [W.pink, W.pinkLt, W.cream];
  for (let i = 0; i < 26; i++) {
    const px = Math.round(minX + rnd() * (maxX - minX));
    const py = Math.round(minY + rnd() * (maxY - minY));
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    c.blendPixel(px, py, withAlpha(blossom[Math.floor(rnd() * blossom.length)], 220));
  }
  c.autoOutline(W.ink);
  c.fillEllipse(cx, 96, 19, 4, withAlpha(W.ink, 80));
  return c;
}

// ---- undergrowth props ----------------------------------------------------
// Tall grass clump -- a cluster of individual blade strokes, taller and more
// irregular than a flat grass tile texture, meant to scatter as a prop at
// clearing edges (the canonical reference shows dark grass tufts dotted
// between trees, distinct from the flat field tile).
function tallGrassClump(seed, tone) {
  const c = new Canvas(18, 16);
  const rnd = rng(seed);
  const base = tone || W.grassDk;
  const lt = W.grassLt;
  for (let i = 0; i < 9; i++) {
    const bx = 1 + Math.floor(rnd() * 16);
    const lean = Math.round((rnd() - 0.5) * 4);
    const h = 7 + Math.floor(rnd() * 6);
    const col = rnd() < 0.4 ? lt : base;
    c.line(bx, 15, bx + lean, 15 - h, col, 1);
  }
  c.fillEllipse(9, 15, 7, 2, withAlpha(W.ink, 60));
  return c;
}

// Flower cluster -- several petal flecks around a small stem base, three
// palette variants for scatter variety.
function flowerCluster(seed, petal) {
  const c = new Canvas(16, 14);
  const rnd = rng(seed);
  for (let i = 0; i < 6; i++) {
    const px = 2 + Math.floor(rnd() * 11);
    const py = 2 + Math.floor(rnd() * 8);
    c.setPixel(px, py, petal);
    c.setPixel(px + 1, py, petal);
    c.setPixel(px, py + 1, withAlpha(petal, 200));
    c.setPixel(px + 1 - 1, py - 1, W.yellow);
  }
  for (let i = 0; i < 3; i++) {
    const bx = 3 + Math.floor(rnd() * 10);
    c.line(bx, 13, bx, 9, W.grassDk, 1);
  }
  return c;
}

// Fallen log -- ground-level clutter prop for forest clearings.
function fallenLog(seed) {
  const c = new Canvas(34, 14);
  c.fillEllipse(17, 7, 16, 6, W.dirtDk);
  c.fillEllipse(17, 5, 16, 4, W.dirtLt);
  c.fillEllipse(3, 7, 3, 5, W.cream);
  c.fillEllipse(31, 7, 3, 5, W.cream);
  for (let x = 6; x < 30; x += 4) c.setPixel(x, 6, withAlpha(W.dirtDarkest, 150));
  c.autoOutline(W.ink);
  c.fillEllipse(17, 13, 15, 2, withAlpha(W.ink, 70));
  return c;
}

// Mushroom cluster -- small clearing-floor accent.
function mushroomCluster(seed) {
  const c = new Canvas(14, 10);
  const rnd = rng(seed);
  const caps = [W.red, W.c9 || W.red];
  for (let i = 0; i < 3; i++) {
    const bx = 2 + Math.floor(rnd() * 9);
    const by = 7;
    c.fillRect(bx, by - 2, bx, by, W.cream);
    c.fillEllipse(bx, by - 3, 2, 2, W.red);
    c.setPixel(bx, by - 4, W.white);
  }
  c.autoOutline(withAlpha(W.ink, 170));
  return c;
}

module.exports = {
  treeRoundDense, treeTallConifer, treeWideBushy, treeFlowering,
  tallGrassClump, flowerCluster, fallenLog, mushroomCluster,
};
