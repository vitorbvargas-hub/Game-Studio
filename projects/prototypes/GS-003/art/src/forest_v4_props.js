'use strict';
// GS-003 forest-v4 -- tree + decor authoring. Fixes (vs. forest-v3
// biome_props.js / forest_v3_props.js, see forest-v4 README diagnosis):
//  1. Canopy painted as many small overlapping "leaf-puff" circles (3-7px)
//     instead of 2-3 smooth large ellipses -- gives real leaf-cluster
//     texture, not a blob.
//  2. 8-step foliage ramp (forest_v4_palette.js) instead of 3 shared greens
//     -- real light-to-shadow range.
//  3. Trunk is a tapered polygon with bark streaks + knots + root tendrils,
//     not a flat 3-band rectangle.
//  4. Ground contact shadow is a separate soft ellipse offset from the
//     trunk, not a thin sliver baked under the trunk footprint.
//  5. Every tree returns {top, base} as two SEPARATE sprites: `base` (roots
//     + trunk + shadow, collides, normal Y-sort/"decor" layer) and `top`
//     (canopy only, no collision, dedicated "canopy-top" layer always
//     drawn above every entity) so the player can walk visually behind the
//     canopy -- the depth cue the founder asked for.
//  6. Silhouette uses a soft rim-darken in the foliage's own darkest tone
//     instead of a flat ink outline -- avoids the "sticker/cutout" read.
// Technique: Canvas primitives (fillCircle/fillPolygon/line) layered by
// hand per tree type (same ADR-009 scope as biome_props.js -- scenery, not
// creature bodies). No third-party art referenced pixel-for-pixel.
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');

function rimDarken(c, color, alpha) {
  const stamp = [];
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [, , , a] = c.getPixel(x, y);
      if (a === 0) continue;
      const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];
      for (const [dx, dy] of neighbors) {
        const [, , , na] = c.getPixel(x + dx, y + dy);
        if (na === 0) { stamp.push([x, y]); break; }
      }
    }
  }
  for (const [x, y] of stamp) c.blendPixel(x, y, withAlpha(color, alpha));
}

// ---- canopy: leaf-puff cluster painter -------------------------------
function paintCanopyPuffs(c, cx, cy, rx, ry, foliage, seed, opts = {}) {
  const rnd = rng(seed);
  const amp1 = 0.16 + rnd() * 0.09, ph1 = rnd() * Math.PI * 2;
  const amp2 = 0.11 + rnd() * 0.07, ph2 = rnd() * Math.PI * 2;
  const amp3 = 0.07 + rnd() * 0.05, ph3 = rnd() * Math.PI * 2;
  function edgeMul(angle) {
    return 1 + amp1 * Math.sin(angle * 3 + ph1) + amp2 * Math.sin(angle * 5 + ph2) + amp3 * Math.sin(angle * 2 + ph3);
  }
  const puffMin = opts.puffMin || 3, puffMax = opts.puffMax || 6;
  const count = opts.count || Math.round((rx * ry) / 9);
  const flatten = opts.flatten || 1;
  const puffs = [];
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2;
    const t = Math.pow(rnd(), 0.55);
    const bound = edgeMul(a);
    const dx = Math.cos(a) * rx * t * bound;
    const dy = Math.sin(a) * ry * t * bound * flatten;
    puffs.push({ dx, dy, r: puffMin + rnd() * (puffMax - puffMin) });
  }
  puffs.sort((p, q) => p.dy - q.dy);
  const bias = opts.lightBias != null ? opts.lightBias : 0;
  for (const p of puffs) {
    const lightScore = (-(p.dx / rx) * 0.7 - (p.dy / ry) * 0.95) + bias;
    let idx = Math.round(3.3 + lightScore * 3.0);
    idx = Math.max(1, Math.min(6, idx));
    c.fillCircle(cx + p.dx, cy + p.dy, p.r, foliage[idx]);
  }
  // rim highlight speckle, upper-left quadrant only
  for (let i = 0; i < Math.round(count * 0.1); i++) {
    const px = Math.round(cx + (rnd() - 0.85) * rx * 0.9);
    const py = Math.round(cy + (rnd() - 0.85) * ry * 0.9 * flatten);
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    c.blendPixel(px, py, withAlpha(foliage[7], 170));
  }
  // AO gap flecks, lower-right quadrant, + scattered mid-field gaps so the
  // mass reads as separate clumps instead of one continuous fill
  for (let i = 0; i < Math.round(count * 0.22); i++) {
    const px = Math.round(cx + (rnd() * 1.7 - 0.6) * rx * 0.9);
    const py = Math.round(cy + (rnd() * 1.7 - 0.6) * ry * 0.9 * flatten);
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    if (rnd() < 0.55) c.blendPixel(px, py, withAlpha(foliage[0], 140));
  }
  rimDarken(c, foliage[0], 150);
  return { rx, ry };
}

// ---- trunk + bark + roots -------------------------------------------
// Mostly-cylindrical trunk (slight taper) with a short root-collar flare
// only in the bottom ~18% of height -- avoids the v1 "traffic cone" read --
// then 3-5 tapering root tendrils drawn ON TOP of (and extending well past)
// the trunk base so they're actually visible, not hidden under the flare.
// Ground contact shadow is NOT baked here: it's placed as a separate decal
// (canopyShadowPatch) by the scene compositor, same pattern as entity
// shadows, so it reads as a cast shadow instead of a sprite-baked "plate".
function paintTrunkRoots(c, cx, footY, trunkH, baseW, topW, bark, rootCount, seed, opts = {}) {
  const rnd = rng(seed);
  const collarY = footY - Math.round(trunkH * 0.18);
  const shaftTopW = topW, shaftBaseW = Math.round(topW * 1.15);
  const flare = Math.max(3, Math.round(baseW * 0.42));
  const pts = [
    [cx - shaftTopW / 2, footY - trunkH], [cx + shaftTopW / 2, footY - trunkH],
    [cx + shaftBaseW / 2, collarY],
    [cx + baseW / 2 + flare, footY - 1], [cx + baseW / 2, footY],
    [cx - baseW / 2, footY], [cx - baseW / 2 - flare, footY - 1],
    [cx - shaftBaseW / 2, collarY],
  ];
  c.fillPolygon(pts, bark.dk);
  c.fillPolygon([
    [cx - shaftTopW / 2 + 1, footY - trunkH], [cx + shaftTopW / 2 - 1, footY - trunkH],
    [cx + shaftBaseW / 2 - 1, collarY], [cx + baseW / 2 - 1, footY - 1],
    [cx - baseW / 2 + 1, footY - 1], [cx - shaftBaseW / 2 + 1, collarY],
  ], bark.mid);
  // highlight column, left-of-center (upper-left light)
  const hiW = Math.max(1, Math.round(shaftTopW * 0.28));
  c.fillRect(cx - Math.round(shaftTopW / 2), footY - trunkH + 2, cx - Math.round(shaftTopW / 2) + hiW, footY - 2, bark.hi);
  // dense bark streak texture: alternating dark grooves across the shaft +
  // a couple of knot scars, denser than v1 (every row, not every 3rd)
  for (let y = footY - trunkH + 2; y < footY - 2; y++) {
    const w = shaftTopW + (shaftBaseW - shaftTopW) * ((y - (footY - trunkH)) / Math.max(1, trunkH));
    if (rnd() < 0.5) c.setPixel(Math.round(cx - w * 0.32), y, bark.dk);
    if (rnd() < 0.45) c.setPixel(Math.round(cx + w * 0.3), y, bark.dk);
    if (rnd() < 0.2) c.setPixel(Math.round(cx + w * 0.05), y, bark.hi);
  }
  if (trunkH > 22 && rnd() < 0.8) {
    c.fillEllipse(cx + Math.round(baseW * 0.2), footY - Math.round(trunkH * 0.45), 2, 2, bark.core);
    c.fillEllipse(cx + Math.round(baseW * 0.2) - 1, footY - Math.round(trunkH * 0.45) - 1, 1, 1, bark.hi);
  }
  rimDarken(c, bark.core, 160);
  // roots: tapering 2-segment tendrils, drawn AFTER the trunk so they read
  // as distinct limbs extending out of the visible base, with a light top
  // edge stroke for a raised/3D look.
  const rootLen = Math.max(10, Math.round(baseW * 1.9));
  for (let i = 0; i < rootCount; i++) {
    const t = rootCount === 1 ? 0.5 : i / (rootCount - 1);
    const angle = (t - 0.5) * 2.6;
    const len = Math.round(rootLen * (0.85 + rnd() * 0.4));
    const midX = cx + Math.round(Math.sin(angle) * len * 0.45);
    const midY = footY + Math.round(1 + Math.abs(Math.cos(angle)) * len * 0.14);
    const endX = cx + Math.round(Math.sin(angle) * len);
    const endY = footY + Math.round(2 + Math.abs(Math.cos(angle)) * len * 0.24);
    c.line(cx + Math.round(Math.sin(angle) * baseW * 0.3), footY - 1, midX, midY, bark.dk, 3);
    c.line(midX, midY, endX, endY, bark.dk, 2);
    c.line(cx + Math.round(Math.sin(angle) * baseW * 0.3), footY - 2, midX, midY - 1, bark.mid, 1);
  }
}

// ---- 6 tree types ---------------------------------------------------------
function treeRound(ramp, seed, opts = {}) {
  const rx = 34, ry = 26;
  const top = new Canvas(rx * 2 + 6, ry * 2 + 14);
  paintCanopyPuffs(top, top.w / 2, ry + 8, rx, ry, ramp.foliage, seed, { puffMin: 4, puffMax: 7, count: 95 });
  const base = new Canvas(28, 34);
  paintTrunkRoots(base, 14, 32, 18, 9, 4, ramp.bark, 4, seed + 11, { shadowColor: ramp.canopyShadow, shadowRX: 22, shadowRY: 7 });
  return { top, base, overlap: 10, kind: 'round' };
}

function treeConifer(ramp, seed, opts = {}) {
  const top = new Canvas(46, 92);
  const tiers = [{ cy: 76, rx: 22, ry: 15 }, { cy: 54, rx: 18, ry: 13 }, { cy: 34, rx: 14, ry: 11 }, { cy: 16, rx: 9, ry: 8 }];
  tiers.forEach((t, i) => paintCanopyPuffs(top, top.w / 2, t.cy, t.rx, t.ry, ramp.foliage, seed + i * 31, { puffMin: 3, puffMax: 5, count: 36, flatten: 0.85 }));
  const base = new Canvas(24, 30);
  paintTrunkRoots(base, 12, 28, 16, 8, 3, ramp.bark, 3, seed + 11, { shadowColor: ramp.canopyShadow, shadowRX: 16, shadowRY: 6 });
  return { top, base, overlap: 14, kind: 'conifer' };
}

function treeBushy(ramp, seed, opts = {}) {
  const rx = 42, ry = 20;
  const top = new Canvas(rx * 2 + 6, ry * 2 + 14);
  paintCanopyPuffs(top, top.w / 2, ry + 8, rx, ry, ramp.foliage, seed, { puffMin: 4, puffMax: 7, count: 100, flatten: 0.9 });
  const base = new Canvas(26, 22);
  paintTrunkRoots(base, 13, 20, 10, 11, 5, ramp.bark, 3, seed + 11, { shadowColor: ramp.canopyShadow, shadowRX: 26, shadowRY: 7 });
  return { top, base, overlap: 8, kind: 'bushy' };
}

function treeFlowering(ramp, seed, opts = {}) {
  const t = treeRound(ramp, seed, opts);
  const rnd = rng(seed + 777);
  for (let i = 0; i < 34; i++) {
    const px = Math.floor(rnd() * t.top.w), py = Math.floor(rnd() * t.top.h);
    const [, , , a] = t.top.getPixel(px, py);
    if (a === 0) continue;
    t.top.blendPixel(px, py, withAlpha(ramp.blossom[Math.floor(rnd() * ramp.blossom.length)], 220));
  }
  t.kind = 'flowering';
  return t;
}

function treeBirch(ramp, seed, opts = {}) {
  const birchBark = ramp.birchBark;
  const rx = 24, ry = 24;
  const top = new Canvas(rx * 2 + 6, ry * 2 + 10);
  paintCanopyPuffs(top, top.w / 2, ry + 6, rx, ry, ramp.foliage, seed, { puffMin: 3, puffMax: 5, count: 58, lightBias: 0.5 });
  const base = new Canvas(16, 38);
  paintTrunkRoots(base, 8, 36, 24, 5, 3, birchBark, 2, seed + 11, { shadowColor: ramp.canopyShadow, shadowRX: 13, shadowRY: 5 });
  const rnd = rng(seed + 303);
  for (let i = 0; i < 6; i++) {
    const y = 8 + Math.floor(rnd() * 22);
    base.fillRect(6, y, 10, y, birchBark.dk);
  }
  return { top, base, overlap: 8, kind: 'birch' };
}

function treeAncient(ramp, seed, opts = {}) {
  const rx = 50, ry = 36;
  const top = new Canvas(rx * 2 + 8, ry * 2 + 18);
  paintCanopyPuffs(top, top.w / 2, ry + 10, rx, ry, ramp.foliage, seed, { puffMin: 5, puffMax: 9, count: 150, lightBias: -0.3 });
  const base = new Canvas(40, 46);
  paintTrunkRoots(base, 20, 44, 24, 16, 7, ramp.bark, 6, seed + 11, { shadowColor: ramp.canopyShadow, shadowRX: 34, shadowRY: 10 });
  base.fillEllipse(20, 40, 3, 4, ramp.bark.core); // hollow at the base
  return { top, base, overlap: 16, kind: 'ancient' };
}

// ---- decor props ------------------------------------------------------
function tallGrassClump(ramp, seed) {
  const c = new Canvas(18, 17);
  const rnd = rng(seed);
  const g = ramp.foliage;
  for (let i = 0; i < 10; i++) {
    const bx = 1 + Math.floor(rnd() * 16);
    const lean = Math.round((rnd() - 0.5) * 4);
    const h = 8 + Math.floor(rnd() * 6);
    c.line(bx, 16, bx + lean, 16 - h, rnd() < 0.4 ? g[6] : g[3], 1);
  }
  c.fillEllipse(9, 16, 7, 2, withAlpha(ramp.ink, 70));
  return c;
}

function flowerCluster(ramp, seed, petal) {
  const c = new Canvas(16, 14);
  const rnd = rng(seed);
  for (let i = 0; i < 3; i++) {
    const bx = 3 + Math.floor(rnd() * 10);
    c.line(bx, 13, bx, 9, ramp.foliage[2], 1);
  }
  for (let i = 0; i < 6; i++) {
    const px = 2 + Math.floor(rnd() * 11), py = 2 + Math.floor(rnd() * 8);
    c.setPixel(px, py, petal); c.setPixel(px + 1, py, petal); c.setPixel(px, py + 1, withAlpha(petal, 200));
    c.setPixel(px, py - 1, ramp.flower.yellow);
  }
  return c;
}

function rockCluster(ramp, seed) {
  const c = new Canvas(22, 14);
  const s = ramp.ground.stone;
  c.fillEllipse(11, 8, 10, 6, s[0]);
  c.fillEllipse(8, 6, 6, 4, s[1]);
  c.fillEllipse(6, 4, 3, 2, s[2]);
  c.fillEllipse(16, 9, 4, 3, s[1]);
  rimDarken(c, s[0], 180);
  c.fillEllipse(11, 13, 9, 2, withAlpha(ramp.ink, 60));
  return c;
}

function fallenLeavesCluster(ramp, seed) {
  const c = new Canvas(18, 10);
  const rnd = rng(seed);
  const l = ramp.ground.leafLitter;
  for (let i = 0; i < 9; i++) {
    const px = 1 + Math.floor(rnd() * 16), py = 2 + Math.floor(rnd() * 6);
    c.fillEllipse(px, py, 2, 1, withAlpha(l[Math.floor(rnd() * l.length)], 220));
  }
  return c;
}

function mushroomCluster(ramp, seed) {
  const c = new Canvas(14, 10);
  const rnd = rng(seed);
  for (let i = 0; i < 3; i++) {
    const bx = 2 + Math.floor(rnd() * 9), by = 7;
    c.fillRect(bx, by - 2, bx, by, ramp.bark.hi);
    c.fillEllipse(bx, by - 3, 2, 2, ramp.flower.red);
    c.setPixel(bx, by - 4, ramp.flower.white);
  }
  rimDarken(c, ramp.ink, 150);
  return c;
}

function fallenLog(ramp, seed) {
  const c = new Canvas(34, 14);
  const d = ramp.ground.dirt;
  c.fillEllipse(17, 7, 16, 6, d[0]);
  c.fillEllipse(17, 5, 16, 4, d[1]);
  c.fillEllipse(3, 7, 3, 5, ramp.bark.hi);
  c.fillEllipse(31, 7, 3, 5, ramp.bark.hi);
  for (let x = 6; x < 30; x += 4) c.setPixel(x, 6, withAlpha(d[0], 160));
  rimDarken(c, ramp.ink, 150);
  c.fillEllipse(17, 13, 15, 2, withAlpha(ramp.ink, 70));
  return c;
}

// Soft ambient canopy shadow patch -- scattered on the ground layer under
// dense treeline clusters (GS-004/ADR-010 "sombra projetada" + "oclusão na
// base" requirement, item 5 of the task).
function canopyShadowPatch(ramp, seed, w, h) {
  const c = new Canvas(w, h);
  c.fillEllipse(w / 2, h / 2, w / 2 - 1, h / 2 - 2, ramp.canopyShadow);
  c.fillEllipse(w / 2, h / 2, w / 2 - 6, h / 2 - 6, withAlpha(ramp.canopyShadow, 60));
  return c;
}

module.exports = {
  paintCanopyPuffs, paintTrunkRoots, rimDarken,
  treeRound, treeConifer, treeBushy, treeFlowering, treeBirch, treeAncient,
  tallGrassClump, flowerCluster, rockCluster, fallenLeavesCluster, mushroomCluster, fallenLog,
  canopyShadowPatch,
};
