'use strict';
// GS-003 biome prop authoring (trees, bushes, bridge, signpost, reeds, rocks).
// Hand-layered Canvas primitives + autoOutline, original scenery art (no
// third-party reference traced) -- see biome_tiles.js header for why this is
// not the "parametric creature" technique ADR-009 rejected.
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');

// Big rounded multi-canopy tree, ~2x2.5 tiles (64x88), matching the concept
// image's large multi-lobed tree canopies over a visible trunk.
function treeBig(seed) {
  const c = new Canvas(64, 88);
  const rnd = rng(seed);
  // trunk
  c.fillRect(27, 60, 36, 86, W.dirtDk);
  c.fillRect(27, 60, 30, 86, W.dirtDarkest);
  c.fillRect(33, 60, 36, 86, W.dirtLt);
  // canopy: 3 overlapping lobes, darkest at bottom-right per the fixed light.
  const lobes = [
    [32, 36, 26], [16, 26, 19], [48, 28, 20],
  ];
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx, ly, r, r - 4, W.grassDk);
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx - 3, ly - 3, r - 6, r - 9, W.grassMid);
  // Highlight concentrated upper-left (fixed light source, ART_STYLE_GUIDE
  // section 5), not scattered evenly across the canopy.
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx - 8, ly - 9, r - 15, r - 17, W.grassLt);
  for (let i = 0; i < 20; i++) {
    const a = (Math.PI * 0.9) + rnd() * (Math.PI * 0.9); // upper-left arc only
    const rr = 8 + rnd() * 20;
    const px = Math.round(32 + Math.cos(a) * rr - 4);
    const py = Math.round(24 + Math.sin(a) * (rr * 0.65) - 6);
    c.setPixel(px, py, withAlpha(W.grassLt, 170));
  }
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 0.6 + Math.PI * 0.1;
    const rr = 8 + rnd() * 14;
    const px = Math.round(32 + Math.cos(a) * rr + 10);
    const py = Math.round(26 + Math.sin(a) * rr + 12);
    c.setPixel(px, py, withAlpha(W.grassDk, 170));
  }
  c.autoOutline(W.ink);
  c.fillEllipse(32, 86, 16, 3, withAlpha(W.ink, 70));
  return c;
}

// Forest tree: taller, denser, narrower canopy, darker tones.
function treeForest(seed) {
  const c = new Canvas(56, 104);
  const rnd = rng(seed);
  c.fillRect(24, 74, 32, 102, W.dirtDarkest);
  c.fillRect(24, 74, 27, 102, [0x26, 0x1a, 0x16, 255]);
  const lobes = [[28, 40, 24], [16, 30, 16], [40, 32, 16], [28, 18, 18]];
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx, ly, r, r - 2, W.navyDk);
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx - 2, ly - 2, r - 7, r - 8, W.grassDk);
  for (const [lx, ly, r] of lobes) c.fillEllipse(lx - 5, ly - 5, r - 13, r - 14, W.grassMid);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2, rr = 8 + rnd() * 18;
    const px = Math.round(28 + Math.cos(a) * rr - 5);
    const py = Math.round(28 + Math.sin(a) * (rr * 0.6) - 8);
    c.setPixel(px, py, withAlpha(W.grassMid, 160));
  }
  c.autoOutline(W.ink);
  c.fillEllipse(28, 101, 14, 3, withAlpha(W.ink, 70));
  return c;
}

function bush(seed, accent) {
  const c = new Canvas(24, 18);
  const rnd = rng(seed);
  c.fillEllipse(12, 11, 11, 7, W.grassDk);
  c.fillEllipse(9, 9, 8, 5, W.grassMid);
  c.fillEllipse(7, 7, 4, 3, W.grassLt);
  if (accent) {
    for (let i = 0; i < 4; i++) {
      const px = 4 + Math.floor(rnd() * 16), py = 7 + Math.floor(rnd() * 7);
      c.setPixel(px, py, accent);
    }
  }
  c.autoOutline(W.ink);
  c.fillEllipse(12, 16, 9, 2, withAlpha(W.ink, 70));
  return c;
}

function rockCluster(seed) {
  const c = new Canvas(22, 14);
  c.fillEllipse(11, 8, 10, 6, W.steelDk);
  c.fillEllipse(8, 6, 6, 4, W.steel);
  c.fillEllipse(6, 4, 3, 2, W.steelLt);
  c.fillEllipse(16, 9, 4, 3, W.steel);
  c.autoOutline(W.ink);
  c.fillEllipse(11, 13, 9, 2, withAlpha(W.ink, 60));
  return c;
}

function flowerPatch(seed, color) {
  const c = new Canvas(14, 10);
  const rnd = rng(seed);
  for (let i = 0; i < 5; i++) {
    const px = 2 + Math.floor(rnd() * 10), py = 2 + Math.floor(rnd() * 6);
    c.setPixel(px, py, color);
    c.setPixel(px + 1, py, W.yellow);
  }
  return c;
}

function woodSignpost(seed) {
  const c = new Canvas(18, 28);
  c.fillRect(8, 14, 10, 26, W.dirtDk);
  c.fillRect(2, 2, 15, 15, W.dirtLt);
  c.fillRect(2, 2, 15, 4, W.dirt);
  c.line(2, 8, 15, 8, W.dirtDk, 1);
  c.autoOutline(W.ink);
  c.fillEllipse(9, 27, 6, 2, withAlpha(W.ink, 70));
  return c;
}

function woodFence(seed) {
  const c = new Canvas(32, 18);
  for (const px of [3, 15, 27]) c.fillRect(px, 2, px + 2, 17, W.dirtDk);
  c.fillRect(0, 5, 31, 7, W.dirtLt);
  c.fillRect(0, 11, 31, 13, W.dirtLt);
  c.autoOutline(W.ink);
  return c;
}

// Horizontal wooden bridge deck tile (32x32), tileable left-right.
function bridgeDeck(seed) {
  const c = new Canvas(32, 32);
  c.fillRect(0, 0, 31, 31, W.waterMid);
  c.fillRect(0, 6, 31, 25, W.dirtLt);
  for (let x = 0; x < 32; x += 6) c.fillRect(x, 6, x, 25, W.dirtDk);
  c.fillRect(0, 6, 31, 8, W.dirt);
  c.fillRect(0, 23, 31, 25, W.dirtDk);
  // side rails
  c.fillRect(0, 0, 31, 4, W.dirtDk);
  c.fillRect(0, 27, 31, 31, W.dirtDk);
  c.fillRect(0, 0, 31, 2, W.dirt);
  c.fillRect(0, 27, 31, 29, W.dirt);
  return c;
}

function bridgePost(seed) {
  const c = new Canvas(8, 16);
  c.fillRect(2, 0, 5, 15, W.dirtDk);
  c.fillRect(2, 0, 3, 15, W.dirt);
  c.autoOutline(W.ink);
  return c;
}

function lilyPad(seed) {
  const c = new Canvas(12, 8);
  c.fillEllipse(6, 4, 5, 3, W.grassDk);
  c.fillEllipse(5, 3, 3, 2, W.grassMid);
  c.line(6, 1, 6, 4, W.navyDk, 1);
  c.autoOutline(withAlpha(W.ink, 160));
  return c;
}

function reeds(seed) {
  const c = new Canvas(10, 20);
  const rnd = rng(seed);
  for (let i = 0; i < 4; i++) {
    const bx = 1 + Math.floor(rnd() * 7);
    const lean = Math.round((rnd() - 0.5) * 3);
    c.line(bx, 19, bx + lean, 2 + Math.floor(rnd() * 4), W.grassDk, 1);
    c.setPixel(bx + lean, 2 + Math.floor(rnd() * 4), W.grassMid);
  }
  return c;
}

module.exports = {
  treeBig, treeForest, bush, rockCluster, flowerPatch,
  woodSignpost, woodFence, bridgeDeck, bridgePost, lilyPad, reeds,
};
