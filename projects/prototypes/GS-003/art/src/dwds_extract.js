'use strict';
// GS-003 helpers to crop + background-matte real Digimon World DS / Dawn-Dusk
// rip sheets (Spriters Resource, official-fan-use layer per ADR-009) into
// usable prop/tile PNGs. No PIL available -- pure Node, built on the
// project's own png_decode/png/Canvas pipeline (see art/src/png_decode.js).
const { loadPNG } = require('./png_decode.js');
const { Canvas } = require('./canvas.js');

function loadSheetCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function cropRect(src, x0, y0, x1, y1) {
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const out = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) out.setPixel(x, y, src.getPixel(x0 + x, y0 + y));
  }
  return out;
}

function colorDist(a, b) {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

// Border-flood-fill matte: samples the crop's own border pixels as a small
// seed palette, then removes only background-colored pixels CONNECTED to
// the border (BFS), so enclosed foliage/rock pixels that happen to be close
// in color to the background stay opaque. tolerance is Euclidean RGB dist.
function matteByBorderFlood(c, tolerance = 28) {
  const w = c.w, h = c.h;
  const seeds = [];
  function addSeed(x, y) {
    const p = c.getPixel(x, y);
    if (!seeds.some((s) => colorDist(s, p) < 10)) seeds.push(p.slice(0, 3));
  }
  for (let x = 0; x < w; x++) { addSeed(x, 0); addSeed(x, h - 1); }
  for (let y = 0; y < h; y++) { addSeed(0, y); addSeed(w - 1, y); }

  function isBgLike(x, y) {
    const p = c.getPixel(x, y);
    return seeds.some((s) => colorDist(s, p) < tolerance);
  }

  const visited = new Uint8Array(w * h);
  const queue = [];
  function pushIfBg(x, y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (visited[i]) return;
    if (!isBgLike(x, y)) return;
    visited[i] = 1;
    queue.push(i);
  }
  for (let x = 0; x < w; x++) { pushIfBg(x, 0); pushIfBg(x, h - 1); }
  for (let y = 0; y < h; y++) { pushIfBg(0, y); pushIfBg(w - 1, y); }
  while (queue.length) {
    const i = queue.pop();
    const x = i % w, y = (i / w) | 0;
    pushIfBg(x + 1, y); pushIfBg(x - 1, y); pushIfBg(x, y + 1); pushIfBg(x, y - 1);
  }

  const out = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      out.setPixel(x, y, visited[i] ? [0, 0, 0, 0] : c.getPixel(x, y));
    }
  }
  return out;
}

// Trim fully-transparent border rows/cols after matting.
function trimTransparent(c) {
  let minX = c.w, minY = c.h, maxX = -1, maxY = -1;
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (c.getPixel(x, y)[3] > 0) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return new Canvas(1, 1);
  const w = maxX - minX + 1, h = maxY - minY + 1;
  const out = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) out.setPixel(x, y, c.getPixel(minX + x, minY + y));
  }
  return out;
}

function extractProp(sheet, box, tolerance = 28) {
  const crop = cropRect(sheet, box[0], box[1], box[2], box[3]);
  return trimTransparent(matteByBorderFlood(crop, tolerance));
}

// For sheets with a single flat matte color (e.g. Hero.png teal, the
// dwds-sheets magenta/khaki map-sprite grids): find row/col bands that are
// NOT the matte color, i.e. the grid structure, without assuming a fixed
// cell size.
function bandSegments(len, isBandBg) {
  const segs = [];
  let start = null;
  for (let i = 0; i < len; i++) {
    const bg = isBandBg(i);
    if (!bg && start === null) start = i;
    if (bg && start !== null) { segs.push([start, i - 1]); start = null; }
  }
  if (start !== null) segs.push([start, len - 1]);
  return segs;
}

function rowSegments(c, matte, tol = 8) {
  return bandSegments(c.h, (y) => {
    for (let x = 0; x < c.w; x++) if (colorDist(c.getPixel(x, y), matte) >= tol) return false;
    return true;
  });
}

function colSegments(c, matte, tol = 8, x0 = 0, x1 = c.w - 1) {
  return bandSegments(x1 - x0 + 1, (i) => {
    const x = x0 + i;
    for (let y = 0; y < c.h; y++) if (colorDist(c.getPixel(x, y), matte) >= tol) return false;
    return true;
  }).map(([a, b]) => [a + x0, b + x0]);
}

// Flat-matte extraction (exact color key, no flood-fill needed): turns every
// pixel matching `matte` within tol to transparent. Safe when the sprite's
// own palette never touches the matte color (true for all dwds-sheets /
// Spriters Resource character rips inspected this session).
function keyOutMatte(c, matte, tol = 8) {
  const out = new Canvas(c.w, c.h);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const p = c.getPixel(x, y);
      out.setPixel(x, y, colorDist(p, matte) < tol ? [0, 0, 0, 0] : p);
    }
  }
  return out;
}

// Many Spriters Resource 'arrow-drop-down' rips alternate the cell matte
// color per sprite (checkerboard tint) instead of one flat sheet-wide
// background, so each grid cell needs its own matte sample from its own
// corner pixel rather than a single global key color.
function extractCell(sheet, x0, y0, w, h, tol = 10) {
  const cell = cropRect(sheet, x0, y0, x0 + w - 1, y0 + h - 1);
  const matte = cell.getPixel(0, 0);
  return keyOutMatte(cell, matte, tol);
}

module.exports = {
  loadSheetCanvas, cropRect, matteByBorderFlood, trimTransparent, extractProp, colorDist,
  rowSegments, colSegments, keyOutMatte, extractCell,
};
