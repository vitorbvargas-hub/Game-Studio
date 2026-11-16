'use strict';
// Utilitários F9 Fase 4 (Node, sem dependências). Usa png.js do C15b.
const { readPNG, writePNG } = require('./png.js');
const fs = require('fs');
const path = require('path');

function frames(dir) {
  return fs.readdirSync(dir).filter(f => /\.png$/.test(f)).sort().map(f => path.join(dir, f));
}
function px(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
}
function hex(r, g, b) { return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''); }
function measure(img) {
  const { width, height, data } = img;
  let minX = width, maxX = -1, minY = height, maxY = -1, semi = 0, n = 0;
  const colors = new Map();
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4, a = data[i + 3];
    if (a > 0 && a < 255) semi++;
    if (a > 0) {
      n++;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      const h = hex(data[i], data[i + 1], data[i + 2]);
      colors.set(h, (colors.get(h) || 0) + 1);
    }
  }
  return { bbox: [minX, minY, maxX, maxY], w: maxX - minX + 1, h: maxY - minY + 1, semi, n, colors };
}
// runs de pixels opacos numa linha
function runs(img, y) {
  const out = []; let s = -1;
  for (let x = 0; x <= img.width; x++) {
    const on = x < img.width && px(img, x, y)[3] > 0;
    if (on && s < 0) s = x;
    if (!on && s >= 0) { out.push([s, x - 1]); s = -1; }
  }
  return out;
}
function upscale(img, s) {
  const w2 = img.width * s, h2 = img.height * s, out = new Uint8ClampedArray(w2 * h2 * 4);
  for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
    const si = ((y / s | 0) * img.width + (x / s | 0)) * 4, di = (y * w2 + x) * 4;
    out[di] = img.data[si]; out[di + 1] = img.data[si + 1]; out[di + 2] = img.data[si + 2]; out[di + 3] = img.data[si + 3];
  }
  return { width: w2, height: h2, data: out };
}
function canvas(w, h, rgba) {
  const d = new Uint8ClampedArray(w * h * 4);
  if (rgba) for (let i = 0; i < w * h; i++) { d[i * 4] = rgba[0]; d[i * 4 + 1] = rgba[1]; d[i * 4 + 2] = rgba[2]; d[i * 4 + 3] = rgba[3]; }
  return { width: w, height: h, data: d };
}
function paste(dst, src, x0, y0) {
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) {
    const si = (y * src.width + x) * 4; if (src.data[si + 3] === 0) continue;
    const dx = x0 + x, dy = y0 + y; if (dx < 0 || dy < 0 || dx >= dst.width || dy >= dst.height) continue;
    const di = (dy * dst.width + dx) * 4;
    dst.data[di] = src.data[si]; dst.data[di + 1] = src.data[si + 1]; dst.data[di + 2] = src.data[si + 2]; dst.data[di + 3] = 255;
  }
}
function hline(dst, y, x0, x1, rgba) {
  for (let x = x0; x <= x1; x++) { const di = (y * dst.width + x) * 4; dst.data[di] = rgba[0]; dst.data[di + 1] = rgba[1]; dst.data[di + 2] = rgba[2]; dst.data[di + 3] = rgba[3]; }
}
function crop(img, x0, y0, w, h) {
  const out = canvas(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = x0 + x, sy = y0 + y; if (sx < 0 || sy < 0 || sx >= img.width || sy >= img.height) continue;
    const si = (sy * img.width + sx) * 4, di = (y * w + x) * 4;
    out.data[di] = img.data[si]; out.data[di + 1] = img.data[si + 1]; out.data[di + 2] = img.data[si + 2]; out.data[di + 3] = img.data[si + 3];
  }
  return out;
}
function shift(img, dx, dy) { return crop(img, -dx, -dy, img.width, img.height); }
function save(p, img) { fs.mkdirSync(path.dirname(p), { recursive: true }); writePNG(p, img.width, img.height, img.data); }
module.exports = { readPNG, writePNG, frames, px, hex, measure, runs, upscale, canvas, paste, hline, crop, shift, save };
