'use strict';
// GS-003 forest-v4.1 -- lighting post-processors + 2 new tree types
// (coordinator review items 3 and 4). Purely additive: reuses
// forest_v4_props.js helpers (rimDarken, paintCanopyPuffs) instead of
// duplicating them, and never mutates anything forest-v4 already shipped.
const { Canvas } = require('./canvas.js');
const { withAlpha, rng, hx } = require('./endesga32.js');
const gp = require('./forest_v4_props.js');

// ---- lighting: rim-light + directional cast shadow ------------------
// Sun/moon is upper-left (same convention already used by grassVariant's
// "lit upper-left" blade bias and paintTrunkRoots' highlight column), so
// the rim light band sits on the upper-left silhouette edge and the cast
// shadow falls lower-right.
function applyCanopyRimLight(top, ramp, strength = 1) {
  const rim = ramp.foliage[7];
  const stamp = [];
  for (let y = 0; y < top.h; y++) {
    for (let x = 0; x < top.w; x++) {
      const [, , , a] = top.getPixel(x, y);
      if (a === 0) continue;
      const [, , , aUp] = top.getPixel(x - 1, y - 1);
      const [, , , aUp2] = top.getPixel(x, y - 1);
      const [, , , aLeft] = top.getPixel(x - 1, y);
      if (aUp > 0 && aUp2 > 0 && aLeft > 0) continue; // interior pixel, not an upper-left edge
      stamp.push([x, y]);
    }
  }
  for (const [x, y] of stamp) top.blendPixel(x, y, withAlpha(rim, Math.round(150 * strength)));
  return top;
}

// Cast shadow decal: an offset, elongated ellipse under the tree pointing
// away from the light (lower-right), drawn directly on the ground scene by
// the caller -- this fn just returns the geometry so the proof-scene
// compositor can place/clip it against the current ground canvas.
function castShadowGeometry(footX, footY, canopyW) {
  const rx = Math.max(10, Math.round(canopyW * 0.42));
  const ry = Math.round(rx * 0.34);
  const dx = Math.round(rx * 0.55); // offset toward lower-right (away from upper-left light)
  const dy = Math.round(ry * 0.6);
  return { cx: footX + dx, cy: footY + dy, rx, ry, angleBias: 0.4 };
}
function paintCastShadow(scene, ramp, footX, footY, canopyW, dark) {
  const g = castShadowGeometry(footX, footY, canopyW);
  scene.fillEllipse(g.cx, g.cy, g.rx, g.ry, withAlpha(dark, 95));
  scene.fillEllipse(g.cx - 2, g.cy - 1, Math.round(g.rx * 0.6), Math.round(g.ry * 0.6), withAlpha(dark, 60));
}

// ---- new tree 1: tropical / "digital palm" ---------------------------
// Curved slender trunk (not the round-tree cylinder) + 6-7 frond blades
// radiating from a single crown point, drooping under their own weight.
function treePalmDigital(ramp, seed) {
  const rnd = rng(seed);
  const trunkH = 46, lean = 6;
  const base = new Canvas(20, trunkH + 6);
  const footY = base.h - 2, footX = 10;
  const bark = ramp.bark;
  // curved trunk via short overlapping segments, tapering width
  let cx = footX, cy = footY;
  const segs = 9;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const nx = footX + Math.sin(t * 1.4) * lean - 2;
    const ny = footY - trunkH * (t + 1 / segs);
    const w = Math.max(2, Math.round(5 - t * 2.5));
    base.line(cx, cy, nx, ny, bark.dk, w + 1);
    base.line(cx, cy, nx, ny, bark.mid, w);
    if (rnd() < 0.6) base.setPixel(Math.round((cx + nx) / 2) + 1, Math.round((cy + ny) / 2), bark.hi);
    cx = nx; cy = ny;
  }
  // ring texture (palm segment scars)
  for (let i = 2; i < segs; i += 2) {
    const t = i / segs;
    const ry = footY - trunkH * t;
    base.setPixel(footX + Math.round(Math.sin(t * 1.4) * lean) - 3, ry, bark.dk);
  }
  gp.rimDarken(base, bark.core, 140);

  const crownX = cx, crownY = cy;
  const top = new Canvas(64, 40);
  const ox = top.w / 2, oy = 22;
  const fronds = 6 + Math.floor(rnd() * 2);
  const g = ramp.foliage;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI / 2 + (i / (fronds - 1) - 0.5) * 2.5 + (rnd() - 0.5) * 0.2;
    const len = 22 + rnd() * 8;
    const droop = 0.35 + rnd() * 0.25;
    const pts = [[ox, oy]];
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const px = ox + Math.cos(a) * len * t;
      const py = oy + Math.sin(a) * len * t + droop * len * t * t;
      pts.push([px, py]);
    }
    const widthBase = 3.2;
    const blade = [];
    for (let s = 0; s < pts.length; s++) { const t = s / (pts.length - 1); blade.push([pts[s][0], pts[s][1] - widthBase * (1 - t)]); }
    for (let s = pts.length - 1; s >= 0; s--) { const t = s / (pts.length - 1); blade.push([pts[s][0], pts[s][1] + widthBase * (1 - t)]); }
    const lit = Math.cos(a) < 0.1;
    top.fillPolygon(blade, g[lit ? 5 : 2]);
    top.line(ox, oy, pts[pts.length - 1][0], pts[pts.length - 1][1], g[lit ? 6 : 1], 1);
  }
  gp.rimDarken(top, g[0], 120);
  applyCanopyRimLight(top, ramp, 0.8);
  top.fillCircle(ox, oy, 3, bark.mid);

  return { top, base, overlap: Math.round(top.h * 0.5), kind: 'palm_digital', crownOffset: { x: crownX - footX, y: footY - crownY } };
}

// ---- new tree 2: "data-leaf" tree (subtle Digital World touch) -------
// Same organic puff-cluster canopy as treeRound, but ~15% of puffs use a
// cool cyan "digital" tone instead of the natural foliage ramp, plus a
// sparse scatter of tiny glowing cyan "data pixel" flecks -- a hint, not a
// neon takeover (kept under the house palette's own cyan, E32 c19/c18).
const DATA_CYAN = [hx('#0a2a33'), hx('#0d4a57'), hx('#13707f'), hx('#18a0ad'), hx('#2ce8f5'), hx('#bdfbff')];
function treeDataLeaf(ramp, seed) {
  const rx = 32, ry = 25;
  const top = new Canvas(rx * 2 + 6, ry * 2 + 14);
  gp.paintCanopyPuffs(top, top.w / 2, ry + 8, rx, ry, ramp.foliage, seed, { puffMin: 4, puffMax: 6, count: 88 });
  const rnd = rng(seed + 909);
  // recolor a minority of puffs cyan by resampling random small circles on
  // top of the already-painted canopy (cheap post-pass, same silhouette)
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2, t = Math.pow(rnd(), 0.6);
    const px = Math.round(top.w / 2 + Math.cos(a) * rx * t * 0.85);
    const py = Math.round(ry + 8 + Math.sin(a) * ry * t * 0.85);
    const [, , , al] = top.getPixel(px, py);
    if (al === 0) continue;
    const tone = DATA_CYAN[2 + Math.floor(rnd() * 3)];
    top.fillCircle(px, py, 2 + Math.floor(rnd() * 2), withAlpha(tone, 190));
  }
  // tiny data-pixel flecks: sparse, small, so it reads as a subtle accent
  for (let i = 0; i < 7; i++) {
    const px = Math.floor(rnd() * top.w), py = Math.floor(rnd() * top.h);
    const [, , , al] = top.getPixel(px, py);
    if (al === 0) continue;
    top.setPixel(px, py, DATA_CYAN[5]);
    if (rnd() < 0.4) top.setPixel(px + 1, py, withAlpha(DATA_CYAN[4], 200));
  }
  gp.rimDarken(top, ramp.foliage[0], 150);
  applyCanopyRimLight(top, ramp, 1);

  const base = new Canvas(26, 32);
  gp.paintTrunkRoots(base, 13, 30, 17, 9, 4, ramp.bark, 4, seed + 11);
  // faint cyan vein on the trunk, bark untouched otherwise (keeps the tree
  // reading as a real tree first, "digital" second)
  for (let y = 10; y < 28; y += 3) base.blendPixel(13, y, withAlpha(DATA_CYAN[3], 90));

  return { top, base, overlap: 10, kind: 'data_leaf' };
}

module.exports = { applyCanopyRimLight, castShadowGeometry, paintCastShadow, treePalmDigital, treeDataLeaf, DATA_CYAN };
