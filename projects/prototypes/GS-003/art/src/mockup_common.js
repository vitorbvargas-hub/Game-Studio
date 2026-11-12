'use strict';
// Shared UI/world drawing helpers for the GS-003 Digimon-fan screen mockups
// (mapa_exploracao, batalha, time). Built on top of the existing Canvas/
// palette/font pipeline -- reuses PIXEL_ART_DIRECTION.md rules (48x48 creature
// grid, 320x180 internal resolution, integer scale only, ink outline, fixed
// upper-left light). No new external dependency.
const { Canvas } = require('./canvas.js');
const { P, hx, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');

// World-scenery colors that don't exist in ByteLine-18 (which has no green --
// it was designed for creature silhouettes, not overworld tiles). Authored
// for this mockup set only, same "digital" hue family as ByteLine-18.
const WP = {
  grass: hx('#1f6b3a'),
  grassLt: hx('#2f9150'),
  grassDk: hx('#154a28'),
  path: hx('#6b5a3a'),
  pathLt: hx('#8a7550'),
  skyTop: hx('#241d3d'),
  skyMid: hx('#3a2f5c'),
  skin: hx('#e8b98a'),
  hair: hx('#2c2440'),
};

function panel(c, x, y, w, h, opts = {}) {
  const bg = opts.bg || withAlpha(P.void, 225);
  c.fillRect(x, y, x + w - 1, y + h - 1, bg);
  for (let i = 0; i < w; i++) {
    c.setPixel(x + i, y, P.ink);
    c.setPixel(x + i, y + h - 1, P.ink);
  }
  for (let j = 0; j < h; j++) {
    c.setPixel(x, y + j, P.ink);
    c.setPixel(x + w - 1, y + j, P.ink);
  }
  if (opts.bevel !== false) {
    c.line(x + 1, y + 1, x + w - 2, y + 1, withAlpha(P.steelLt, 90), 1);
    c.line(x + 1, y + 1, x + 1, y + h - 2, withAlpha(P.steelLt, 90), 1);
  }
}

function hpBarNum(c, x, y, w, h, cur, max, color) {
  c.fillRect(x, y, x + w - 1, y + h - 1, P.steel);
  const ratio = Math.max(0, Math.min(1, cur / max));
  const fillW = Math.max(1, Math.round(w * ratio));
  c.fillRect(x, y, x + fillW - 1, y + h - 1, color);
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, P.ink); c.setPixel(x + i, y + h - 1, P.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, P.ink); c.setPixel(x + w - 1, y + j, P.ink); }
  drawText(c, `${cur}/${max}`, x, y + h + 2, P.mist);
}

// Nearest-neighbor downscale by an integer factor, sampling the center pixel
// of each factor x factor block -- lets the 48x48 battle-grade creature
// sprites double as small overworld tokens without redrawing them.
function downscale(canvas, factor) {
  const w = Math.floor(canvas.w / factor), h = Math.floor(canvas.h / factor);
  const nc = new Canvas(w, h);
  const off = Math.floor(factor / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      nc.setPixel(x, y, canvas.getPixel(x * factor + off, y * factor + off));
    }
  }
  return nc;
}

// One 16x16 "digital grass" tile -- two-tone green base + faint circuit dots.
function grassTile(c, x, y, variant = 0) {
  c.fillRect(x, y, x + 15, y + 15, WP.grass);
  if (variant % 2 === 0) {
    c.fillRect(x + 2, y + 3, x + 5, y + 3, WP.grassLt);
    c.fillRect(x + 9, y + 9, x + 12, y + 9, WP.grassDk);
  } else {
    c.fillRect(x + 7, y + 2, x + 10, y + 2, WP.grassLt);
    c.fillRect(x + 2, y + 11, x + 5, y + 11, WP.grassDk);
  }
  c.setPixel(x + 12, y + 4, withAlpha(P.cyan, 110));
  c.setPixel(x + 4, y + 12, withAlpha(P.cyan, 90));
}

function pathTile(c, x, y) {
  c.fillRect(x, y, x + 15, y + 15, WP.path);
  c.fillRect(x + 1, y + 1, x + 14, y + 2, WP.pathLt);
  c.setPixel(x + 5, y + 8, WP.grassDk);
  c.setPixel(x + 10, y + 11, WP.grassDk);
}

// "Circuit tree" -- a steel trunk topped with an angular cluster of glowing
// node facets, replacing an organic canopy with the line's digital motif
// (see PIXEL_ART_DIRECTION.md section 5, "circuit traces").
function circuitTree(c, x, y, accent) {
  const ac = accent || P.cyan;
  const acDk = withAlpha(ac, 140);
  c.fillRect(x + 6, y + 14, x + 9, y + 25, P.steel);
  c.fillRect(x + 7, y + 14, x + 7, y + 25, P.steelLt);
  const facets = [
    [[x + 8, y], [x + 1, y + 10], [x + 8, y + 16], [x + 15, y + 10]],
  ];
  for (const f of facets) c.fillPolygon(f, P.void);
  c.fillPolygon([[x + 8, y + 2], [x + 3, y + 10], [x + 8, y + 14]], acDk);
  c.fillPolygon([[x + 8, y + 2], [x + 13, y + 10], [x + 8, y + 14]], ac);
  c.line(x + 8, y + 2, x + 8, y + 14, withAlpha(P.paper, 160), 1);
  c.line(x + 3, y + 10, x + 13, y + 10, withAlpha(P.paper, 100), 1);
  c.autoOutline(P.ink);
  c.fillCircle(x + 8, y + 2, 1, P.paper);
  c.fillCircle(x + 3, y + 10, 1, ac);
  c.fillCircle(x + 13, y + 10, 1, ac);
}

// Simple blocky Tamer (trainer) overworld sprite, ~16x24, facing down/side.
// Original character design -- no reference used; silhouette is a generic
// RPG trainer (cap, jacket, pack), not any specific franchise character.
function tamerSprite(c, x, y, opts = {}) {
  const step = opts.step || 0; // -1 / 0 / 1 leg offset for a walk illusion
  const shirt = opts.shirt || P.cyan;
  const shirtDk = opts.shirtDk || P.cyanDk;
  c.fillRect(x + 5, y + 16, x + 6, y + 22 + step, WP.skin);
  c.fillRect(x + 9, y + 16, x + 10, y + 22 - step, WP.skin);
  c.fillRect(x + 3, y + 8, x + 12, y + 17, shirt);
  c.fillRect(x + 3, y + 13, x + 12, y + 17, shirtDk);
  c.fillRect(x + 2, y + 9, x + 3, y + 14, shirt);
  c.fillRect(x + 12, y + 9, x + 13, y + 14, shirt);
  c.fillCircle(x + 7, y + 4, 4, WP.skin);
  c.fillRect(x + 2, y + 1, x + 12, y + 4, WP.hair);
  c.fillRect(x + 2, y + 1, x + 12, y + 2, shirt);
  c.setPixel(x + 5, y + 5, P.ink);
  c.setPixel(x + 9, y + 5, P.ink);
  c.autoOutline(P.ink);
  c.fillEllipse(x + 7, y + 23, 6, 1, withAlpha(P.ink, 70));
}

// Generic rounded "unknown data" placeholder creature -- used for species the
// team hasn't drawn yet (per task: "placeholders bonitos, nao quadrados").
// Deliberately blobby/soft so it reads as "not yet scanned", not a bug.
function dataBlobPlaceholder(c, x, y, size, accent) {
  const ac = accent || P.magenta;
  c.fillCircle(x + size / 2, y + size / 2, size / 2 - 1, P.void);
  c.fillEllipse(x + size / 2, y + size / 2 + 1, size / 2 - 3, size / 2 - 4, withAlpha(P.steel, 180));
  c.line(x + size * 0.3, y + size * 0.4, x + size * 0.7, y + size * 0.4, withAlpha(ac, 180), 1);
  c.line(x + size * 0.5, y + size * 0.4, x + size * 0.5, y + size * 0.65, withAlpha(ac, 180), 1);
  c.fillCircle(x + size * 0.3, y + size * 0.4, 1, ac);
  c.fillCircle(x + size * 0.7, y + size * 0.4, 1, ac);
  c.autoOutline(P.ink);
}

function button(c, x, y, w, h, label, opts = {}) {
  panel(c, x, y, w, h, { bg: opts.active ? withAlpha(P.cyanDk, 220) : withAlpha(P.void, 210) });
  if (opts.icon) opts.icon(c, x + Math.round(w / 2) - 4, y + 3);
  const tw = label.length * 4 - 1;
  drawText(c, label, x + Math.round((w - tw) / 2), y + h - 8, opts.active ? P.paper : P.mist);
}

module.exports = {
  WP, panel, hpBarNum, downscale, grassTile, pathTile, circuitTree,
  tamerSprite, dataBlobPlaceholder, button,
};
