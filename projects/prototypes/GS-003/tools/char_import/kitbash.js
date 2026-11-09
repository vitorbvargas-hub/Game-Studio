'use strict';
// GS-003 -- light recolor + kitbash helpers for "inspired by protagonist"
// Tamer presets built from official DW DS NPC sprites (see build_tamer_presets.js).
const { Canvas, bboxOf, opaquePts, colorDist } = require('./npc_lib.js');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return [h, s, max];
}

function hsvToRgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// Find the dominant opaque color in the upper `frac` of the frame (hair
// region) excluding near-black outline pixels -- used as the recolor seed.
function sampleHairSeed(frame, frac = 0.45) {
  const bb = bboxOf(frame);
  const limitY = bb.minY + Math.round((bb.maxY - bb.minY) * frac);
  const counts = new Map();
  for (let y = bb.minY; y <= limitY; y++) {
    for (let x = 0; x < frame.w; x++) {
      const p = frame.getPixel(x, y);
      if (p[3] === 0) continue;
      const lum = (p[0] + p[1] + p[2]) / 3;
      if (lum < 28) continue; // outline/shadow
      const key = `${p[0] >> 3},${p[1] >> 3},${p[2] >> 3}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  let best = null, bestN = -1;
  for (const [k, n] of counts) { if (n > bestN) { bestN = n; best = k; } }
  if (!best) return [120, 90, 60, 255];
  const [r, g, b] = best.split(',').map((v) => Number(v) * 8 + 4);
  return [r, g, b, 255];
}

// Recolor every pixel close to `seed` (hair palette, incl. shaded tones) to
// `targetHex`, preserving each pixel's own saturation/value so shading reads.
function recolorHair(frame, seed, targetHex, tol = 46) {
  const [th, ts] = rgbToHsv(...hexToRgb(targetHex));
  const out = new Canvas(frame.w, frame.h);
  const [sh, ss, sv] = rgbToHsv(seed[0], seed[1], seed[2]);
  for (let y = 0; y < frame.h; y++) {
    for (let x = 0; x < frame.w; x++) {
      const p = frame.getPixel(x, y);
      if (p[3] === 0) { continue; }
      const lum = (p[0] + p[1] + p[2]) / 3;
      let out_p = p;
      if (lum >= 20 && colorDist(p, seed) < tol) {
        const [h, s, v] = rgbToHsv(p[0], p[1], p[2]);
        const sOut = Math.min(1, s * (ts > 0.05 ? ts / Math.max(ss, 0.05) : 1));
        const [r, g, b] = hsvToRgb(th, Math.max(s, sOut * 0.7), v);
        out_p = [r, g, b, p[3]];
      }
      out.setPixel(x, y, out_p);
    }
  }
  return out;
}

function headAnchor(frame) {
  const bb = bboxOf(frame);
  const h = bb.maxY - bb.minY + 1;
  // Percentages tuned against the DW DS chibi proportions (big hair ~0-35%
  // of total sprite height, face ~35-48%, collar ~55-65%, legs below).
  return {
    top: bb.minY,
    foreheadY: bb.minY + Math.max(4, Math.round(h * 0.40)),
    eyeY: bb.minY + Math.max(5, Math.round(h * 0.47)),
    neckY: bb.minY + Math.round(h * 0.62),
    cx: Math.round((bb.minX + bb.maxX) / 2),
  };
}

function addGoggles(frame, color, strapColor) {
  const f = frame; // mutate a clone, caller passes a fresh clone
  const a = headAnchor(f);
  const y = a.foreheadY;
  f.line(a.cx - 6, y, a.cx + 6, y, strapColor || [40, 40, 40, 255], 1);
  f.fillCircle(a.cx - 3, y, 2, color);
  f.fillCircle(a.cx + 3, y, 2, color);
  f.strokeEllipse(a.cx - 3, y, 2, 2, [20, 20, 20, 255], 1);
  f.strokeEllipse(a.cx + 3, y, 2, 2, [20, 20, 20, 255], 1);
  return f;
}

function addVisor(frame, color) {
  const f = frame;
  const a = headAnchor(f);
  f.fillRect(a.cx - 5, a.eyeY - 1, a.cx + 5, a.eyeY + 1, [color[0], color[1], color[2], 190]);
  return f;
}

function addGlasses(frame, color) {
  const f = frame;
  const a = headAnchor(f);
  f.strokeEllipse(a.cx - 3, a.eyeY, 2, 2, color, 1);
  f.strokeEllipse(a.cx + 3, a.eyeY, 2, 2, color, 1);
  f.line(a.cx - 1, a.eyeY, a.cx + 1, a.eyeY, color, 1);
  return f;
}

function addScarf(frame, color) {
  // Two-tone triangle (lit half + shaded half, highlight toward upper-left
  // to match the studio's fixed light rule) plus a dark outline, instead
  // of one flat fillPolygon -- reads as cloth, not a color patch.
  const f = frame;
  const a = headAnchor(f);
  const y = a.neckY;
  const dk = [Math.max(0, color[0] - 70), Math.max(0, color[1] - 70), Math.max(0, color[2] - 70), 255];
  const lt = [Math.min(255, color[0] + 45), Math.min(255, color[1] + 35), Math.min(255, color[2] + 20), 255];
  const tri = [[a.cx - 4, y], [a.cx + 4, y], [a.cx, y + 4]];
  f.fillPolygon(tri, color);
  f.fillPolygon([[a.cx - 4, y], [a.cx, y], [a.cx - 1, y + 4], [a.cx, y + 4]], lt);
  f.fillPolygon([[a.cx, y], [a.cx + 4, y], [a.cx, y + 4], [a.cx + 1, y + 4]], dk);
  f.strokePolygon(tri, [20, 20, 20, 255], 1);
  return f;
}

function addCollarBand(frame, color) {
  // Narrow turtleneck band hugging the neck (not a shoulder-to-shoulder
  // slab): tapered ends, a highlight row on top, a shadow row on the
  // bottom, and a dark outline -- reads as a knit collar, not a flat tint.
  const f = frame;
  const a = headAnchor(f);
  const y = a.neckY;
  const dk = [Math.max(0, color[0] - 70), Math.max(0, color[1] - 70), Math.max(0, color[2] - 70), 255];
  const lt = [Math.min(255, color[0] + 50), Math.min(255, color[1] + 45), Math.min(255, color[2] + 30), 255];
  const ink = [20, 20, 20, 255];
  f.fillRect(a.cx - 3, y - 1, a.cx + 3, y + 1, color);
  f.setPixel(a.cx - 4, y, color);
  f.setPixel(a.cx + 4, y, color);
  f.line(a.cx - 4, y - 1, a.cx + 4, y - 1, lt, 1);
  f.line(a.cx - 4, y + 1, a.cx + 4, y + 1, dk, 1);
  f.setPixel(a.cx - 4, y - 1, ink);
  f.setPixel(a.cx + 4, y - 1, ink);
  f.setPixel(a.cx - 5, y, ink);
  f.setPixel(a.cx + 5, y, ink);
  f.setPixel(a.cx - 4, y + 1, ink);
  f.setPixel(a.cx + 4, y + 1, ink);
  f.line(a.cx - 3, y - 2, a.cx + 3, y - 2, ink, 1);
  f.line(a.cx - 3, y + 2, a.cx + 3, y + 2, ink, 1);
  return f;
}

function addCap(frame, color) {
  const f = frame;
  const a = headAnchor(f);
  const rx = Math.max(4, Math.round((a.eyeY - a.top) * 0.5));
  const dark = [Math.max(0, color[0] - 90), Math.max(0, color[1] - 90), Math.max(0, color[2] - 90), 255];
  f.fillEllipse(a.cx, a.top + 1, rx, 3, color);
  f.strokeEllipse(a.cx, a.top + 1, rx, 3, dark, 1);
  return f;
}

function cloneFrame(c) {
  const n = new Canvas(c.w, c.h);
  n.data.set(c.data);
  return n;
}

module.exports = {
  sampleHairSeed, recolorHair, headAnchor, addGoggles, addVisor, addGlasses, addScarf, addCollarBand, addCap, cloneFrame,
  hexToRgb,
};
