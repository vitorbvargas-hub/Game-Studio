'use strict';
const { savePNG } = require('./png.js');

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = Buffer.alloc(w * h * 4, 0); // transparent black
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  getPixel(x, y) {
    x = Math.round(x); y = Math.round(y);
    if (!this.inBounds(x, y)) return [0, 0, 0, 0];
    const i = (y * this.w + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  setPixel(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (!this.inBounds(x, y)) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0]; this.data[i + 1] = c[1]; this.data[i + 2] = c[2];
    this.data[i + 3] = c[3] === undefined ? 255 : c[3];
  }

  // Alpha-composite c over existing pixel (hard-edge pixel art still benefits
  // from this for soft glow cores / translucent gel bodies).
  blendPixel(x, y, c) {
    const a = (c[3] === undefined ? 255 : c[3]) / 255;
    if (a >= 1) return this.setPixel(x, y, c);
    if (a <= 0) return;
    const [br, bg, bb, ba] = this.getPixel(x, y);
    const bo = (ba / 255) * (1 - a);
    const outA = a + bo;
    if (outA <= 0) return;
    const r = Math.round((c[0] * a + br * bo) / outA);
    const g = Math.round((c[1] * a + bg * bo) / outA);
    const b = Math.round((c[2] * a + bb * bo) / outA);
    this.setPixel(x, y, [r, g, b, Math.round(outA * 255)]);
  }

  fillRect(x0, y0, x1, y1, c) {
    for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.blendPixel(x, y, c);
    }
  }

  // Hard-edge filled circle (no AA) -- classic pixel-art look.
  fillCircle(cx, cy, r, c) {
    const r2 = r * r;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r2 + 0.2) this.blendPixel(cx + x, cy + y, c);
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, c) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (v <= 1.03) this.blendPixel(cx + x, cy + y, c);
      }
    }
  }

  strokeEllipse(cx, cy, rx, ry, c, thickness = 1) {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        const vOuter = ((Math.abs(x) + thickness) * (Math.abs(x) + thickness)) / (rx * rx) +
          ((Math.abs(y) + thickness) * (Math.abs(y) + thickness)) / (ry * ry);
        if (v <= 1.05 && vOuter > 1.0) this.blendPixel(cx + x, cy + y, c);
      }
    }
  }

  line(x0, y0, x1, y1, c, width = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x1 >= x0 ? 1 : -1;
    const dy = Math.abs(y1 - y0), sy = y1 >= y0 ? 1 : -1;
    let err = dx - dy;
    let x = x0, y = y0;
    const half = Math.floor(width / 2);
    while (true) {
      for (let ox = -half; ox <= half; ox++) {
        for (let oy = -half; oy <= half; oy++) this.blendPixel(x + ox, y + oy, c);
      }
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }

  // Even-odd scanline fill for a closed polygon (array of [x,y] points).
  fillPolygon(points, c) {
    let minY = Infinity, maxY = -Infinity;
    for (const [, y] of points) { if (y < minY) minY = y; if (y > maxY) maxY = y; }
    minY = Math.floor(minY); maxY = Math.ceil(maxY);
    for (let y = minY; y <= maxY; y++) {
      const yc = y + 0.5;
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x0, y0] = points[i];
        const [x1, y1] = points[(i + 1) % points.length];
        if ((y0 <= yc && y1 > yc) || (y1 <= yc && y0 > yc)) {
          const t = (yc - y0) / (y1 - y0);
          xs.push(x0 + t * (x1 - x0));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i < xs.length; i += 2) {
        if (xs[i + 1] === undefined) break;
        for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++) this.blendPixel(x, y, c);
      }
    }
  }

  strokePolygon(points, c, width = 1) {
    for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % points.length];
      this.line(x0, y0, x1, y1, c, width);
    }
  }

  // Draw a 1px outline around any non-transparent region (classic pixel-art contour).
  autoOutline(c) {
    const stamp = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const [, , , a] = this.getPixel(x, y);
        if (a > 0) continue;
        const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of neighbors) {
          const [, , , na] = this.getPixel(x + dx, y + dy);
          if (na > 0) { stamp.push([x, y]); break; }
        }
      }
    }
    for (const [x, y] of stamp) this.setPixel(x, y, c);
  }

  scaleNearest(factor) {
    const nc = new Canvas(this.w * factor, this.h * factor);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const p = this.getPixel(x, y);
        for (let dy = 0; dy < factor; dy++) {
          for (let dx = 0; dx < factor; dx++) nc.setPixel(x * factor + dx, y * factor + dy, p);
        }
      }
    }
    return nc;
  }

  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        this.blendPixel(dx + x, dy + y, src.getPixel(x, y));
      }
    }
  }

  // Whole-canvas pixel shift (anticipation/lunge/flinch poses) -- pixels
  // that land outside the canvas are simply dropped, matching blit's bounds check.
  translate(dx, dy) {
    const nc = new Canvas(this.w, this.h);
    nc.blit(this, dx, dy);
    return nc;
  }

  // Flat color overlay on every non-transparent pixel, alpha blended -- used
  // for hit-flash / attack-impact frames without redrawing the creature.
  tint(color, alpha) {
    const nc = new Canvas(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const p = this.getPixel(x, y);
        if (p[3] === 0) continue;
        nc.setPixel(x, y, p);
        nc.blendPixel(x, y, [color[0], color[1], color[2], alpha]);
      }
    }
    return nc;
  }

  // Horizontal mirror -- used by the PMD-format pipeline to derive W/NW/SW
  // direction rows from the hand-drawn E/NE/SE rows instead of redrawing them.
  flipX() {
    const nc = new Canvas(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) nc.setPixel(this.w - 1 - x, y, this.getPixel(x, y));
    }
    return nc;
  }

  // Vertical mirror -- used by biome tile authoring to derive N/S edge and
  // corner tile variants from one hand-authored mask instead of redrawing it.
  flipY() {
    const nc = new Canvas(this.w, this.h);
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) nc.setPixel(x, this.h - 1 - y, this.getPixel(x, y));
    }
    return nc;
  }

  save(path) {
    savePNG(path, this.w, this.h, this.data);
  }
}

module.exports = { Canvas };
