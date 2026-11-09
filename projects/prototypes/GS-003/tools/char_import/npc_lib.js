'use strict';
// GS-003 — shared helpers for extracting named-grid character sheets
// (Spriters Resource "arrow-drop-down" NPC/Hero rips, DW DS / DW DS2 layout:
// portrait row + 4 direction rows (S,N,W,E) x 3 walk-step columns, one
// colored "block" per character). Pure Node, reuses the project's own
// png_decode/Canvas pipeline (art/src/dwds_extract.js, art/src/canvas.js).
const path = require('path');
const AS = path.resolve(__dirname, '../../art/src');
const { loadSheetCanvas, colorDist, cropRect, matteByBorderFlood, trimTransparent } = require(path.join(AS, 'dwds_extract.js'));
const { Canvas } = require(path.join(AS, 'canvas.js'));

function components(c, matte, tol, merge, minPx, region) {
  const [rx0, ry0, rx1, ry1] = region || [0, 0, c.w - 1, c.h - 1];
  const w = c.w, h = c.h;
  const fg = new Uint8Array(w * h);
  for (let y = ry0; y <= ry1; y++) {
    for (let x = rx0; x <= rx1; x++) {
      const p = c.getPixel(x, y);
      if (p[3] > 0 && colorDist(p, matte) >= tol) fg[y * w + x] = 1;
    }
  }
  const seen = new Uint8Array(w * h);
  const out = [];
  for (let y = ry0; y <= ry1; y++) {
    for (let x = rx0; x <= rx1; x++) {
      const i = y * w + x;
      if (!fg[i] || seen[i]) continue;
      let bx0 = x, bx1 = x, by0 = y, by1 = y, n = 0;
      const st = [i]; seen[i] = 1;
      while (st.length) {
        const ci = st.pop();
        const cx = ci % w, cy = (ci / w) | 0;
        n++;
        if (cx < bx0) bx0 = cx; if (cx > bx1) bx1 = cx;
        if (cy < by0) by0 = cy; if (cy > by1) by1 = cy;
        for (let ny = cy - 1; ny <= cy + 1; ny++) {
          for (let nx = cx - 1; nx <= cx + 1; nx++) {
            if (nx < rx0 || ny < ry0 || nx > rx1 || ny > ry1) continue;
            const ni = ny * w + nx;
            if (fg[ni] && !seen[ni]) { seen[ni] = 1; st.push(ni); }
          }
        }
      }
      out.push([bx0, by0, bx1, by1, n]);
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < out.length && !changed; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        if (a[0] - merge <= b[2] && b[0] - merge <= a[2] && a[1] - merge <= b[3] && b[1] - merge <= a[3]) {
          out[i] = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3]), a[4] + b[4]];
          out.splice(j, 1);
          changed = true;
          break;
        }
      }
    }
  }
  return out.filter((b) => b[4] >= minPx);
}

function cutMasked(sheet, matte, tol, box) {
  const [x0, y0, x1, y1] = box;
  const out = new Canvas(x1 - x0 + 1, y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = sheet.getPixel(x, y);
      if (p[3] > 0 && colorDist(p, matte) >= tol) out.setPixel(x - x0, y - y0, p);
    }
  }
  return out;
}

function opaquePts(c) {
  const pts = [];
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) if (c.getPixel(x, y)[3] > 0) pts.push([x, y]);
  return pts;
}

function centroidX(c) {
  const pts = opaquePts(c);
  if (!pts.length) return c.w / 2;
  return pts.reduce((s, p) => s + p[0], 0) / pts.length;
}

function bboxOf(c) {
  const pts = opaquePts(c);
  if (!pts.length) return { minX: 0, minY: 0, maxX: c.w - 1, maxY: c.h - 1 };
  let minX = c.w, minY = c.h, maxX = -1, maxY = -1;
  for (const [x, y] of pts) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

// Place frames on a common canvas, base-aligned (feet on the last opaque
// row) and centroid-x aligned at the pivot column -- same convention as
// tools/dwds_import/import_dwds_sheets.py normalize().
function normalize(cells, pad = 2) {
  const nonEmpty = cells.filter((c) => opaquePts(c).length > 0);
  if (!nonEmpty.length) return { frames: cells.map(() => new Canvas(Math.max(1, cells[0].w), Math.max(1, cells[0].h))), pivot: { x: 1, y: 1 } };
  const cx = cells.map((c) => (opaquePts(c).length ? centroidX(c) : c.w / 2));
  let left = 0, right = 0, maxH = 0;
  cells.forEach((c, i) => {
    left = Math.max(left, cx[i]);
    right = Math.max(right, c.w - cx[i]);
    maxH = Math.max(maxH, c.h);
  });
  const half = Math.ceil(Math.max(left, right)) + pad;
  const h = maxH + pad + 1;
  const out = cells.map((c, i) => {
    const f = new Canvas(2 * half, h);
    f.blit(c, half - Math.round(cx[i]), h - 1 - c.h);
    return f;
  });
  return { frames: out, pivot: { x: half, y: h - 1 } };
}

// Grid-cell cutMasked() can leak a 1-2px sliver of a neighboring cell's
// border/divider line when the equal-thirds split lands a hair off the real
// boundary. Keep only the largest opaque connected component (4-neighborhood)
// so a stray line never survives as a floating artifact above/beside the head.
function keepLargestComponent(c) {
  const w = c.w, h = c.h;
  const seen = new Uint8Array(w * h);
  let best = null, bestN = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (seen[i] || c.getPixel(x, y)[3] === 0) continue;
      const st = [i]; seen[i] = 1;
      const pts = [];
      while (st.length) {
        const ci = st.pop();
        const cx = ci % w, cy = (ci / w) | 0;
        pts.push([cx, cy]);
        const neigh = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
        for (const [nx, ny] of neigh) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (!seen[ni] && c.getPixel(nx, ny)[3] > 0) { seen[ni] = 1; st.push(ni); }
        }
      }
      if (pts.length > bestN) { bestN = pts.length; best = pts; }
    }
  }
  const out = new Canvas(w, h);
  if (best) for (const [x, y] of best) out.setPixel(x, y, c.getPixel(x, y));
  return out;
}

// A full-height (or near full-height) 1px-wide opaque column/row almost
// always a leftover grid-divider line bridged into the main blob at one row
// (so keepLargestComponent alone keeps it); clear any such column/row whose
// own width/height is 1 and whose opaque run covers >= 85% of the frame.
function stripThinLines(c) {
  const out = new Canvas(c.w, c.h);
  out.data.set(c.data);
  for (let x = 0; x < c.w; x++) {
    let n = 0;
    for (let y = 0; y < c.h; y++) if (out.getPixel(x, y)[3] > 0) n++;
    if (n < c.h * 0.85) continue;
    const leftOpaque = x > 0 && out.getPixel(x - 1, Math.floor(c.h / 2))[3] > 0;
    const rightOpaque = x < c.w - 1 && out.getPixel(x + 1, Math.floor(c.h / 2))[3] > 0;
    if (leftOpaque && rightOpaque) continue; // part of a wide solid shape, not a 1px line
    for (let y = 0; y < c.h; y++) out.setPixel(x, y, [0, 0, 0, 0]);
  }
  for (let y = 0; y < c.h; y++) {
    let n = 0;
    for (let x = 0; x < c.w; x++) if (out.getPixel(x, y)[3] > 0) n++;
    if (n < c.w * 0.85) continue;
    const upOpaque = y > 0 && out.getPixel(Math.floor(c.w / 2), y - 1)[3] > 0;
    const downOpaque = y < c.h - 1 && out.getPixel(Math.floor(c.w / 2), y + 1)[3] > 0;
    if (upOpaque && downOpaque) continue;
    for (let x = 0; x < c.w; x++) out.setPixel(x, y, [0, 0, 0, 0]);
  }
  return out;
}

module.exports = {
  loadSheetCanvas, colorDist, cropRect, Canvas, components, cutMasked, opaquePts, centroidX, bboxOf, normalize,
  matteByBorderFlood, trimTransparent, keepLargestComponent, stripThinLines,
};
