'use strict';
// GS-003 forest-v5 / praia / vila -- shared loader for the licensed
// NinjaAdventure Asset Pack (pixel-boy, CC0, github.com/pixel-boy/NinjaAdventure)
// crops, HSV recolor, and a texture-fill adapter around forest-v4's existing
// buildBlobTile() geometry (quarter-circle rounded corners) so the same
// proven autotile algorithm can paint with real licensed pixel art instead
// of procedurally-drawn textures.
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');

const NA_BASE = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/10-source-files/ninja-adventure');
const TILE16 = 16;
const SCALE = 2; // 16px source -> 32px engine grid (see resolutionDecision)
const TILE32 = TILE16 * SCALE;

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function naSheet(file) { return pngToCanvas(path.join(NA_BASE, file)); }

// Crop a tcols x trows block of 16px tiles at tile coords (tx,ty), native res.
function cropTiles(sheet, tx, ty, tcols, trows) {
  const w = tcols * TILE16, h = trows * TILE16;
  const c = new Canvas(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) c.setPixel(x, y, sheet.getPixel(tx * TILE16 + x, ty * TILE16 + y));
  return c;
}

// Crop at 2x engine scale directly (nearest-neighbor).
function cropTiles2x(sheet, tx, ty, tcols, trows) {
  return cropTiles(sheet, tx, ty, tcols, trows).scaleNearest(SCALE);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s; const l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hue2rgb(p, q, t) {
  if (t < 0) t += 1; if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}

// Non-destructive hue/sat/light shift (keeps alpha). hueShift in turns
// (0..1), satMul/lightAdd are multiplicative/additive on [0,1] scale.
function recolor(c, { hueShift = 0, satMul = 1, lightAdd = 0, satAdd = 0 }) {
  const nc = new Canvas(c.w, c.h);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [r, g, b, a] = c.getPixel(x, y);
      if (a === 0) continue;
      let [h, s, l] = rgbToHsl(r, g, b);
      h = (h + hueShift + 1) % 1;
      s = Math.max(0, Math.min(1, s * satMul + satAdd));
      l = Math.max(0, Math.min(1, l + lightAdd));
      const [nr, ng, nb] = hslToRgb(h, s, l);
      nc.setPixel(x, y, [nr, ng, nb, a]);
    }
  }
  return nc;
}

// Tiled fill: repeats `sample` (native-res Canvas) to cover a w x h region
// at dest (x0,y0) inside canvas c, wrapping with a per-call pixel offset so
// adjacent autotile cells don't look perfectly identical (cheap seeded jitter).
function tiledFill(c, x0, y0, w, h, sample, seedOffset = 0) {
  const ox = seedOffset % sample.w, oy = (seedOffset * 7) % sample.h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = (x + ox) % sample.w, sy = (y + oy) % sample.h;
      c.setPixel(x0 + x, y0 + y, sample.getPixel(sx, sy));
    }
  }
}

module.exports = { NA_BASE, TILE16, TILE32, SCALE, pngToCanvas, naSheet, cropTiles, cropTiles2x, recolor, tiledFill };
