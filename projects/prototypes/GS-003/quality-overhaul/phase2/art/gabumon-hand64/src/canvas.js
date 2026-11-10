// Tiny hand-drawing "Canvas" over an RGBA buffer. No AI, deterministic ops only.
'use strict';
const { encodePNG } = require('./png.js');

function hexToRgba(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) : 255;
  return [r, g, b, a];
}

class Canvas {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.data = Buffer.alloc(w * h * 4); // transparent
    this.palette = {}; // name -> hex
  }
  usePalette(obj) { Object.assign(this.palette, obj); return this; }
  resolve(colorOrName) {
    if (colorOrName === null || colorOrName === '.' || colorOrName === undefined) return null;
    const hex = this.palette[colorOrName] || colorOrName;
    return hexToRgba(hex);
  }
  set(x, y, colorOrName) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = this.resolve(colorOrName);
    const i = (y * this.w + x) * 4;
    if (c === null) { this.data[i + 3] = 0; return; }
    this.data[i] = c[0]; this.data[i + 1] = c[1]; this.data[i + 2] = c[2]; this.data[i + 3] = c[3];
  }
  get(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return [0, 0, 0, 0];
    const i = (y * this.w + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }
  isOpaque(x, y) { return this.get(x, y)[3] > 0; }
  rect(x0, y0, x1, y1, colorOrName) {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, colorOrName);
    return this;
  }
  // filled ellipse by center+radii (inclusive)
  ellipse(cx, cy, rx, ry, colorOrName) {
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const nx = (x - cx) / rx, ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1.001) this.set(x, y, colorOrName);
      }
    }
    return this;
  }
  // filled polygon (even-odd rule), points = [[x,y],...]
  polygon(points, colorOrName) {
    let minY = Infinity, maxY = -Infinity;
    for (const [, y] of points) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
    minY = Math.floor(minY); maxY = Math.ceil(maxY);
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
          const t = (y - y1) / (y2 - y1);
          xs.push(x1 + t * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const xa = Math.round(xs[i]), xb = Math.round(xs[i + 1]) - 1;
        for (let x = xa; x <= xb; x++) this.set(x, y, colorOrName);
      }
    }
    return this;
  }
  line(x0, y0, x1, y1, colorOrName) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while (true) {
      this.set(x0, y0, colorOrName);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  // draw from ASCII rows, legend maps char->colorName/hex, '.' or ' ' = skip (leave as-is)
  grid(x, y, rows, legend) {
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.' || ch === ' ') continue;
        const colorName = legend[ch];
        if (colorName === undefined) throw new Error('grid: no legend for char "' + ch + '"');
        this.set(x + c, y + r, colorName);
      }
    }
    return this;
  }
  pixels(list) { // [[x,y,colorOrName], ...]
    for (const [x, y, c] of list) this.set(x, y, c);
    return this;
  }
  // toon-shaded ellipse: outward pseudo-normal dotted with a light direction picks hi/mid/lo/ao
  ellipseShaded(cx, cy, rx, ry, colors, lightDir) {
    const [Lx, Ly] = lightDir || [-0.62, -0.78];
    const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
    const x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const nx = (x - cx) / rx, ny = (y - cy) / ry;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1.001) continue;
        const radial = Math.sqrt(r2);
        let color;
        if (radial < 0.32) {
          color = colors.mid;
        } else {
          const dot = nx * Lx + ny * Ly;
          if (dot > 0.42) color = colors.hi;
          else if (dot > -0.08) color = colors.mid;
          else if (dot > -0.52) color = colors.lo;
          else color = colors.ao || colors.lo;
        }
        this.set(x, y, color);
      }
    }
    return this;
  }
  // 1px outline: any opaque pixel with a transparent 4-neighbour gets outlineColor stamped
  // on a NEW canvas copy where those transparent neighbours become outline (classic selective outline)
  autoOutline(outlineColor) {
    const toStamp = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.isOpaque(x, y)) continue;
        const n = this.isOpaque(x + 1, y) || this.isOpaque(x - 1, y) || this.isOpaque(x, y + 1) || this.isOpaque(x, y - 1);
        if (n) toStamp.push([x, y]);
      }
    }
    for (const [x, y] of toStamp) this.set(x, y, outlineColor);
    return this;
  }
  translate(dx, dy) {
    const out = new Canvas(this.w, this.h);
    out.palette = this.palette;
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const c = this.get(x, y);
        if (c[3] > 0) {
          const i = ((y + dy) * this.w + (x + dx)) * 4;
          if (x + dx >= 0 && x + dx < this.w && y + dy >= 0 && y + dy < this.h) {
            out.data[i] = c[0]; out.data[i + 1] = c[1]; out.data[i + 2] = c[2]; out.data[i + 3] = c[3];
          }
        }
      }
    }
    return out;
  }
  static composite(layers) { // bottom->top, each a Canvas same size
    const w = layers[0].w, h = layers[0].h;
    const out = new Canvas(w, h);
    for (const layer of layers) {
      for (let i = 0; i < w * h; i++) {
        const a = layer.data[i * 4 + 3];
        if (a > 0) {
          out.data[i * 4] = layer.data[i * 4];
          out.data[i * 4 + 1] = layer.data[i * 4 + 1];
          out.data[i * 4 + 2] = layer.data[i * 4 + 2];
          out.data[i * 4 + 3] = a;
        }
      }
    }
    return out;
  }
  bbox() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.isOpaque(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
  }
  countColors() {
    const set = new Set();
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.isOpaque(x, y)) { const c = this.get(x, y); set.add(c.join(',')); }
    }
    return set;
  }
  toPNG() { return encodePNG(this.w, this.h, this.data); }
}

module.exports = { Canvas, hexToRgba };
