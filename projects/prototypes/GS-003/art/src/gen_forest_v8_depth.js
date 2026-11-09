'use strict';
// GS-003 Map Factory -- forest-v8-depth.
//
// Answers the founder's "Drakantos tem muito mais profundidade e beleza"
// note via docs/DRAKANTOS_VISUAL_STUDY.md (table + priority list). Covers
// the game-art side of study items #1 (chao com variacao + decalques), #2
// (penhasco/barranco, highest priority), #3 (props emissores -- the art
// half; the dynamic light pass itself is game-dev), #5 (clusters de
// clutter / borda de mata), #6 (paleta mais escura e menos saturada) and
// #8 (transicoes organicas). Items #4 (sombras de contato no renderer),
// #7 (zoom) and #9 (VFX) are explicitly out of this package -- see
// README.md Limitacoes.
//
// 100% local pipeline (Canvas.js pixel matrix + the studio's existing
// 16-tile blob autotile geometry, now shared via blob_autotile16.js): 0
// PixelLab generations spent. See shared/tools/map-factory/logs/
// pixellab-usage.csv for the balance-check entry.
//
// Run with: node art/src/gen_forest_v8_depth.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');
const { withPreset } = require('./forest_v4_palette.js');
const { rimDarken } = require('./forest_v4_props.js');
const { buildBlobTile } = require('./blob_autotile16.js');
const { buildDepthRamps, buildPaletteDoc, ACCENT } = require('./forest_v8_depth_palette.js');
const { drawText } = require('./font5x3.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v8-depth');

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }

// =========================================================================
// 1. Ground base fill (shared by ground variants and the cliff kit's
//    "below" texture) -- same blade/speckle technique as forest_v4_tiles.js
//    grassVariant()/dirtTexture(), re-parametrized on the depth ramps.
// =========================================================================
function groundBase(c, ramp, isGrass, rnd) {
  const base = ramp[isGrass ? 2 : 1];
  c.fillRect(0, 0, TILE - 1, TILE - 1, base);
  for (let i = 0; i < 5; i++) {
    const cx = 3 + Math.floor(rnd() * (TILE - 6)), cy = 3 + Math.floor(rnd() * (TILE - 6));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(ramp[isGrass ? 3 : 2], 120));
  }
  if (isGrass) {
    for (let i = 0; i < 40; i++) {
      const bx = 1 + Math.floor(rnd() * (TILE - 2)), by = 1 + Math.floor(rnd() * (TILE - 3));
      const lit = (bx + by) < 30;
      const tone = lit ? pick(rnd, [ramp[4], ramp[3]]) : pick(rnd, [ramp[0], ramp[1]]);
      c.setPixel(bx, by, tone);
      if (rnd() < 0.5) c.setPixel(bx, by + 1, tone);
    }
  } else {
    for (let i = 0; i < Math.round(TILE * TILE * 0.1); i++) {
      const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
      c.setPixel(px, py, rnd() < 0.5 ? ramp[0] : ramp[2]);
    }
  }
}

// =========================================================================
// 2. Decal "stamp" functions -- each draws one decal type centered at
//    (cx, cy) on ANY canvas. Reused both to build the 8 ground VARIANTS
//    (baked onto a full tile) and the standalone transparent decal PNGs
//    (for scattering by noise over any ground tile, including existing
//    forest-v4/v6/v7 tiles -- study item #1/#8).
// =========================================================================
function stampMossPatch(c, cx, cy, d, rnd, r = 5) {
  c.fillEllipse(cx, cy, r, Math.round(r * 0.6), withAlpha(d.moss, 190));
  c.fillEllipse(cx - 1, cy - 1, Math.round(r * 0.5), Math.round(r * 0.3), withAlpha(d.mossEdge, 160));
  for (let i = 0; i < Math.round(r * 1.5); i++) {
    const a = rnd() * Math.PI * 2, rr = r * 0.8 * Math.sqrt(rnd());
    const px = Math.round(cx + Math.cos(a) * rr), py = Math.round(cy + Math.sin(a) * rr * 0.6);
    c.setPixel(px, py, rnd() < 0.5 ? d.mossEdge : d.moss);
  }
}

function stampPebbleCluster(c, cx, cy, d, rnd, count = 4) {
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = 2 + rnd() * 5;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    const rr = 1 + Math.floor(rnd() * 2);
    c.fillEllipse(px, py, rr, Math.max(1, rr - 1), d.stone[0]);
    c.setPixel(px - 1, py - 1, d.stone[2]);
    c.blendPixel(px + 1, py + rr, withAlpha([0, 0, 0, 255], 70));
  }
}

function stampCrack(c, cx, cy, d, rnd, len = 14, branches = 2) {
  // Radiating-branch crackle (dried-mud read) instead of a single random
  // walk -- guarantees several visible fissures regardless of where the
  // walk would otherwise wander, which a single-line walk could miss
  // entirely on a small decal canvas.
  const col = d.cliffFace.core;
  const mainBranches = Math.max(2, branches + 1);
  for (let b = 0; b < mainBranches; b++) {
    let angle = (b / mainBranches) * Math.PI * 2 + rnd() * 0.6;
    let x = cx, y = cy;
    const steps = Math.max(3, Math.round(len / mainBranches / 2));
    for (let i = 0; i < steps; i++) {
      angle += (rnd() - 0.5) * 0.6;
      const nx = x + Math.cos(angle) * 2.6, ny = y + Math.sin(angle) * 1.8;
      c.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), withAlpha(col, 220), 1);
      x = nx; y = ny;
    }
  }
}

function stampLeafLitter(c, cx, cy, d, rnd, count = 5) {
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 7;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    const tone = d.leafLitter[Math.floor(rnd() * d.leafLitter.length)];
    c.fillEllipse(px, py, 2, 1, withAlpha(tone, 220));
  }
}

function stampRootTendril(c, cx, cy, d, rnd, len = 20, baseAngle = 0) {
  const bark = d.bark;
  let x = cx, y = cy, angle = baseAngle;
  for (let i = 0; i < len / 4; i++) {
    angle += (rnd() - 0.5) * 0.5;
    const nx = x + Math.cos(angle) * 4, ny = y + Math.sin(angle) * 2.4;
    c.line(x, y, nx, ny, bark.dk, 2);
    c.line(x, y - 1, nx, ny - 1, withAlpha(bark.mid, 160), 1);
    x = nx; y = ny;
  }
}

function stampPuddle(c, cx, cy, d, rnd, rx = 6, ry = 4) {
  c.fillEllipse(cx, cy, rx, ry, withAlpha([10, 14, 20, 255], 150));
  c.fillEllipse(cx, cy, rx - 1, ry - 1, withAlpha(W.waterDeep, 210));
  c.fillEllipse(cx, cy - 1, Math.round(rx * 0.5), Math.round(ry * 0.5), withAlpha(W.waterMid, 200));
  c.setPixel(cx - 1, cy - 2, withAlpha(ACCENT.puddleSparkle, 220));
  c.setPixel(cx, cy - 2, withAlpha(W.white, 180));
}

function decalCanvas(w, h, drawFn) {
  const c = new Canvas(w, h);
  drawFn(c, Math.round(w / 2), Math.round(h / 2));
  return c;
}

// =========================================================================
// 3. Ground variants -- 8 tiles (not autotiled; scatter at random/by-noise
//    per cell, same convention as grassVariant()'s 6 variants). Each lays
//    the depth grass/dirt base then one decal pass so a field never
//    repeats -- study item #1.
// =========================================================================
function groundVariant(d, variant, seed) {
  const c = new Canvas(TILE, TILE);
  const rnd = rng(seed + variant * 131);
  const isGrass = variant !== 4 && variant !== 5;
  groundBase(c, isGrass ? d.grass : d.dirt, isGrass, rnd);
  switch (variant) {
    case 1: stampMossPatch(c, 16, 19, d, rnd, 6); break;
    case 2: stampPebbleCluster(c, 16, 17, d, rnd, 4); break;
    case 3: stampCrack(c, 11, 20, d, rnd, 14, 2); stampCrack(c, 23, 11, d, rnd, 9, 1); break;
    case 4: stampRootTendril(c, 16, 24, d, rnd, 22, -2.0); break;
    case 5: stampPebbleCluster(c, 10, 22, d, rnd, 3); stampCrack(c, 21, 10, d, rnd, 12, 1); break;
    case 6: stampLeafLitter(c, 16, 16, d, rnd, 7); break;
    case 7: stampPuddle(c, 16, 18, d, rnd, 7, 4); break;
    default: break; // variant 0: plain depth grass, texture only
  }
  return c;
}

// =========================================================================
// 4. Cliff / barranco kit (1-level height) -- study item #2, highest
//    priority. Top surface: 16-tile blob autotile (shared geometry, see
//    blob_autotile16.js header). Face/corners/ramp: 5 discrete pieces, NOT
//    autotiled -- documented limitation, see README.md.
// =========================================================================
function cliffTopTexture(c, x0, y0, w, h, d, seed) {
  const rnd = rng(seed);
  const top = d.cliffTop;
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, top[1]);
  for (let i = 0; i < Math.round(w * h * 0.1); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.setPixel(px, py, rnd() < 0.5 ? top[0] : top[2]);
  }
  for (let i = 0; i < 4; i++) {
    const px = x0 + Math.floor(rnd() * w * 0.6), py = y0 + Math.floor(rnd() * h * 0.6);
    c.setPixel(px, py, top[3]);
  }
  for (let i = 0; i < Math.round(w * 0.3); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + h - 1 - Math.floor(rnd() * 3);
    if (rnd() < 0.4) c.setPixel(px, py, withAlpha(d.mossEdge, 200));
  }
}

function groundBelowTexture(c, x0, y0, w, h, d, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  groundBase(sub, d.grass, true, rnd);
  c.blit(sub, x0, y0);
}

function cliffTopBlobSet(d, seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[`cliff_top_blob_${m}`] = buildBlobTile(TILE, m, d, seed + m * 19, cliffTopTexture, groundBelowTexture);
  return tiles;
}

function cliffFaceStraight(d, seed) {
  const c = new Canvas(TILE, TILE);
  const f = d.cliffFace;
  const rnd = rng(seed);
  c.fillRect(0, 0, TILE - 1, TILE - 1, f.mid);
  // top lit lip -- reads as a continuation of the cliff_top_blob tile above
  c.fillRect(0, 0, TILE - 1, 2, f.hi);
  c.fillRect(0, 3, TILE - 1, 3, f.lt);
  // horizontal rock "courses" (alternating band tone + 1px dark seam) so
  // the face reads as a stacked rock mass instead of a flat gradient
  for (let y = 5; y < TILE - 7; y += 7) {
    const tone = rnd() < 0.5 ? f.lt : f.mid;
    const bandEnd = Math.min(TILE - 8, y + 5);
    c.fillRect(0, y, TILE - 1, bandEnd, tone);
    c.fillRect(0, Math.min(TILE - 7, bandEnd + 1), TILE - 1, Math.min(TILE - 7, bandEnd + 1), f.dk);
  }
  // vertical fissure streaks, light upper-left / dark lower-right bias
  for (let y = 5; y < TILE - 7; y++) {
    if (rnd() < 0.55) c.setPixel(Math.round(TILE * 0.22) + Math.floor(rnd() * 2), y, f.dk);
    if (rnd() < 0.5) c.setPixel(Math.round(TILE * 0.58) + Math.floor(rnd() * 2), y, f.dk);
    if (rnd() < 0.3) c.setPixel(Math.round(TILE * 0.4), y, f.hi);
    if (rnd() < 0.25) c.setPixel(Math.round(TILE * 0.8), y, f.dk);
  }
  // Strong contact-shadow band at the base -- Drakantos item #4 ("sombra de
  // contato forte"), baked here since this pack's face tile IS the base.
  c.fillRect(0, TILE - 7, TILE - 1, TILE - 1, f.dk);
  c.fillRect(0, TILE - 3, TILE - 1, TILE - 1, f.core);
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(rnd() * TILE);
    c.setPixel(px, TILE - 2, withAlpha(d.mossEdge, 190));
  }
  return c;
}

function cliffFaceCornerOuter(d, seed, side) {
  const c = cliffFaceStraight(d, seed);
  const f = d.cliffFace;
  const foldX = side === 'left' ? Math.round(TILE * 0.62) : Math.round(TILE * 0.38);
  // Light darken only (keep the course/fissure texture from cliffFaceStraight
  // visible underneath) + skip the top lit lip so it still reads as the same
  // sunlit edge as the straight piece.
  for (let y = 3; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const past = side === 'left' ? x > foldX : x < foldX;
      if (past) c.blendPixel(x, y, withAlpha(f.dk, 85));
    }
  }
  c.line(foldX, 0, foldX, TILE - 1, f.core, 1);
  c.line(foldX + (side === 'left' ? -1 : 1), 0, foldX + (side === 'left' ? -1 : 1), TILE - 1, withAlpha(f.hi, 160), 1);
  return c;
}

function cliffFaceCornerInner(d, seed) {
  const c = cliffFaceStraight(d, seed);
  const f = d.cliffFace;
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const distCenter = Math.abs(x - TILE / 2);
      if (distCenter < TILE * 0.3) c.blendPixel(x, y, withAlpha(f.core, Math.round(120 * (1 - distCenter / (TILE * 0.3)))));
    }
  }
  return c;
}

function cliffRamp(d, seed) {
  const c = new Canvas(TILE, TILE);
  const rnd = rng(seed);
  const f = d.cliffFace;
  const sub = new Canvas(TILE, TILE);
  groundBase(sub, d.grass, true, rnd);
  c.blit(sub, 0, 0);
  // Only the top ~22px gets steps -- the bottom ~10px stays visible grass
  // so the tile clearly reads as "ground transitioning up", not all-stone.
  const steps = 3;
  const bottomY = TILE - 10;
  for (let s = 0; s < steps; s++) {
    const y1 = bottomY - s * 7;
    const y0 = y1 - 5;
    if (y0 < 0) break;
    c.fillRect(2, y0, TILE - 3, y1, f.lt);
    c.fillRect(2, y1 - 1, TILE - 3, y1, f.dk);
    c.fillRect(2, y0, TILE - 3, y0, f.hi);
  }
  c.fillRect(0, 0, 2, TILE - 1, f.mid);
  c.fillRect(TILE - 3, 0, TILE - 1, TILE - 1, f.mid);
  return c;
}

// =========================================================================
// 5. Emissive props -- study item #3 (art half). Each gets a baked
//    glowHalo() for a static-screenshot bloom AND a `light` field in
//    tileset.json for the renderer's dynamic point-light pass.
// =========================================================================
function glowHalo(c, cx, cy, color, maxR, baseAlpha = 70) {
  for (let r = maxR; r >= 1; r--) {
    const a = Math.round(baseAlpha * (1 - r / maxR) * (1 - r / maxR));
    if (a <= 2) continue;
    c.fillEllipse(cx, cy, r, Math.round(r * 0.8), withAlpha(color, a));
  }
}

function dataCrystal(seed) {
  const w = 26, h = 34;
  const c = new Canvas(w, h);
  const cx = w / 2, cy = h * 0.62;
  glowHalo(c, cx, cy, ACCENT.digitalCyan, 13, 90);
  const core = [8, 24, 30, 255];
  const pts = [[cx - 6, h - 4], [cx - 1, 4], [cx + 1, 4], [cx + 6, h - 4]];
  c.fillPolygon(pts, withAlpha(ACCENT.digitalCyan, 235));
  c.strokePolygon(pts, core, 1);
  c.fillPolygon([[cx - 10, h - 6], [cx - 7, 15], [cx - 5, 15], [cx - 6, h - 6]], withAlpha(ACCENT.digitalCyan, 200));
  c.fillPolygon([[cx + 6, h - 6], [cx + 5, 15], [cx + 7, 15], [cx + 10, h - 6]], withAlpha(ACCENT.digitalCyan, 200));
  c.line(cx, 6, cx, h - 6, withAlpha(W.white, 210), 1);
  c.fillEllipse(cx, h - 3, 9, 2, withAlpha([0, 0, 0, 255], 90));
  return c;
}

function mushroomBioluminescent(seed) {
  const w = 20, h = 18;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const col = ACCENT.digitalMagenta;
  glowHalo(c, w / 2, h * 0.5, col, 8, 80);
  for (let i = 0; i < 3; i++) {
    const bx = 4 + Math.floor(rnd() * (w - 8));
    const by = h - 3;
    const stemH = 5 + Math.floor(rnd() * 3);
    c.fillRect(bx, by - stemH, bx + 1, by, withAlpha([210, 220, 230, 255], 220));
    c.fillEllipse(bx, by - stemH - 2, 3, 2, withAlpha(col, 235));
    c.setPixel(bx, by - stemH - 3, withAlpha(W.white, 200));
  }
  c.fillEllipse(w / 2, h - 1, 7, 1, withAlpha([0, 0, 0, 255], 80));
  return c;
}

function dataTotem(d, seed) {
  const w = 18, h = 46;
  const c = new Canvas(w, h);
  const bark = d.bark;
  const col = ACCENT.dataAmber;
  glowHalo(c, w / 2, 8, col, 11, 90);
  c.fillRect(w / 2 - 3, 10, w / 2 + 2, h - 3, bark.mid);
  c.fillRect(w / 2 - 3, 10, w / 2 - 2, h - 3, bark.dk);
  c.fillRect(w / 2 + 1, 10, w / 2 + 2, h - 3, bark.hi);
  for (let y = 14; y < h - 6; y += 5) c.fillRect(w / 2 - 2, y, w / 2 + 1, y, withAlpha(col, 160));
  c.fillEllipse(w / 2, 8, 5, 6, withAlpha(col, 235));
  c.setPixel(w / 2 - 1, 5, withAlpha(W.white, 220));
  rimDarken(c, bark.core, 140);
  c.fillEllipse(w / 2, h - 2, 7, 2, withAlpha([0, 0, 0, 255], 100));
  return c;
}

// =========================================================================
// 6. Forest-edge clutter -- study item #5 ("densidade de clutter em
//    camadas... tudo em grupos/clusters").
// =========================================================================
function fern(d, seed) {
  const w = 20, h = 22;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const g = d.foliage;
  const fronds = 5;
  for (let i = 0; i < fronds; i++) {
    const t = fronds === 1 ? 0.5 : i / (fronds - 1);
    const angle = -Math.PI / 2 + (t - 0.5) * 1.6;
    const len = 9 + Math.floor(rnd() * 4);
    let x = w / 2, y = h - 2;
    for (let s = 0; s < len; s++) {
      const nx = x + Math.cos(angle) * 1.1;
      const ny = y + Math.sin(angle) * 1.3;
      c.setPixel(Math.round(nx), Math.round(ny), s % 3 === 0 ? g[5] : g[3]);
      if (s > 1 && s % 2 === 0) {
        const perp = angle + Math.PI / 2;
        c.setPixel(Math.round(nx + Math.cos(perp) * 1.5), Math.round(ny + Math.sin(perp) * 1.5), g[2]);
        c.setPixel(Math.round(nx - Math.cos(perp) * 1.5), Math.round(ny - Math.sin(perp) * 1.5), g[2]);
      }
      x = nx; y = ny;
    }
  }
  c.fillEllipse(w / 2, h - 1, 6, 2, withAlpha([0, 0, 0, 255], 70));
  return c;
}

function tuft(d, seed) {
  const w = 14, h = 10;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const g = d.foliage;
  for (let i = 0; i < 12; i++) {
    const bx = 1 + Math.floor(rnd() * (w - 2));
    const lean = Math.round((rnd() - 0.5) * 2);
    const bh = 3 + Math.floor(rnd() * 4);
    c.line(bx, h - 1, bx + lean, h - 1 - bh, rnd() < 0.4 ? g[5] : g[3], 1);
  }
  c.fillEllipse(w / 2, h - 1, 5, 1, withAlpha([0, 0, 0, 255], 60));
  return c;
}

function fallenTrunk(d, seed) {
  const w = 46, h = 16;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const bark = d.bark;
  c.fillEllipse(w / 2, h * 0.5, w / 2 - 1, h * 0.4, bark.mid);
  c.fillEllipse(w / 2, h * 0.42, w / 2 - 1, h * 0.32, bark.lt);
  c.fillEllipse(4, h * 0.5, 4, h * 0.38, bark.hi);
  c.fillEllipse(w - 4, h * 0.5, 4, h * 0.38, bark.hi);
  for (let x = 8; x < w - 8; x += 4) c.setPixel(x, Math.round(h * 0.48), withAlpha(bark.dk, 170));
  for (let i = 0; i < 14; i++) {
    const px = 4 + Math.floor(rnd() * (w - 8));
    if (px < w * 0.6 || rnd() < 0.3) c.setPixel(px, Math.round(h * 0.3) + Math.floor(rnd() * 2), withAlpha(d.moss, 200));
  }
  rimDarken(c, [10, 10, 14, 255], 150);
  c.fillEllipse(w / 2, h - 2, w / 2 - 2, 2, withAlpha([0, 0, 0, 255], 80));
  return c;
}

function floweringBush(d, flower, seed) {
  const w = 28, h = 22;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const g = d.foliage;
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2, t = Math.pow(rnd(), 0.6);
    const dx = Math.cos(a) * w * 0.42 * t, dy = Math.sin(a) * h * 0.38 * t * 0.9 - 2;
    const lit = dy < 0;
    c.fillCircle(w / 2 + dx, h * 0.55 + dy, 3 + Math.floor(rnd() * 2), lit ? g[5] : g[2]);
  }
  const flowerKeys = Object.keys(flower);
  for (let i = 0; i < 10; i++) {
    const px = 3 + Math.floor(rnd() * (w - 6)), py = 3 + Math.floor(rnd() * (h - 10));
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    const petal = flower[pick(rnd, flowerKeys)];
    c.setPixel(px, py, petal);
    c.setPixel(px + 1, py, withAlpha(petal, 200));
  }
  rimDarken(c, g[0], 140);
  c.fillEllipse(w / 2, h - 1, w / 2 - 3, 2, withAlpha([0, 0, 0, 255], 80));
  return c;
}

function edgeClusterA(d, seed) {
  const w = 48, h = 26;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  c.blit(fern(d, seed + 1), 2, 2);
  c.blit(tuft(d, seed + 2), 20, h - 11);
  c.blit(tuft(d, seed + 3), 30, h - 10);
  stampPebbleCluster(c, 40, h - 4, d, rnd, 3);
  stampMossPatch(c, 10, h - 3, d, rnd, 3);
  return c;
}

function edgeClusterB(d, flower, seed) {
  const w = 50, h = 24;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  c.blit(floweringBush(d, flower, seed + 1), 4, 0);
  c.blit(tuft(d, seed + 2), 34, h - 11);
  stampLeafLitter(c, 40, h - 3, d, rnd, 5);
  return c;
}

// =========================================================================
// 7. Transition decals -- study item #8 ("bordas organicas").
// =========================================================================
function tuftOverPath(d, seed, variant) {
  const w = 16, h = 12;
  const c = new Canvas(w, h);
  const rnd = rng(seed + variant * 41);
  c.fillEllipse(w / 2, h - 2, 6, 2, withAlpha(d.dirt[1], 90));
  const count = variant === 0 ? 10 : 16;
  const g = d.foliage;
  for (let i = 0; i < count; i++) {
    const bx = 1 + Math.floor(rnd() * (w - 2));
    const lean = Math.round((rnd() - 0.5) * 3);
    const bh = 3 + Math.floor(rnd() * 5);
    c.line(bx, h - 2, bx + lean, h - 2 - bh, rnd() < 0.4 ? g[5] : g[3], 1);
  }
  return c;
}

function reedCluster(d, seed) {
  const w = 14, h = 26;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const g = d.foliage;
  for (let i = 0; i < 6; i++) {
    const bx = 1 + Math.floor(rnd() * (w - 2));
    const lean = Math.round((rnd() - 0.5) * 3);
    const bh = 14 + Math.floor(rnd() * 8);
    const tone = rnd() < 0.5 ? g[3] : g[2];
    c.line(bx, h - 2, bx + lean, h - 2 - bh, tone, 1);
    c.fillEllipse(bx + lean, h - 2 - bh, 1, 2, d.leafLitter[1]);
  }
  c.fillEllipse(w / 2, h - 1, 6, 2, withAlpha(W.waterDeep, 140));
  return c;
}

function shoreStone(d, seed) {
  const w = 20, h = 12;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  const s = d.stone;
  c.fillEllipse(w / 2, h * 0.5, w / 2 - 2, h * 0.32, s[0]);
  c.fillEllipse(w / 2 - 2, h * 0.42, w * 0.25, h * 0.2, s[2]);
  for (let i = 0; i < 4; i++) {
    const px = 4 + Math.floor(rnd() * (w - 8));
    c.setPixel(px, Math.round(h * 0.62), withAlpha(ACCENT.puddleSparkle, 140));
  }
  c.fillEllipse(w / 2, h - 1, w / 2 - 3, 2, withAlpha(W.waterDeep, 120));
  rimDarken(c, [8, 8, 10, 255], 140);
  return c;
}

// =========================================================================
// Preview sheet
// =========================================================================
function buildPreviewSheet(sections) {
  const pad = 6;
  let y = 24;
  let maxW = 0;
  const rows = [];
  for (const sec of sections) {
    const scale = sec.scale || 2;
    const rowH = Math.max(...sec.items.map((it) => it.canvas.h * scale)) + 14;
    rows.push({ sec, y, scale });
    let rowW = 8;
    for (const it of sec.items) rowW += it.canvas.w * scale + pad;
    maxW = Math.max(maxW, rowW);
    y += rowH + 10;
  }
  const sheet = new Canvas(maxW + 16, y + 10);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [12, 12, 20, 255]);
  drawText(sheet, 'FOREST-V8-DEPTH', 8, 6, [255, 230, 120, 255]);
  for (const row of rows) {
    drawText(sheet, row.sec.title, 8, row.y, [200, 210, 230, 255]);
    let x = 8;
    const itemsY = row.y + 10;
    for (const it of row.sec.items) {
      sheet.blit(it.canvas.scaleNearest(row.scale), x, itemsY);
      x += it.canvas.w * row.scale + pad;
    }
  }
  return sheet;
}

// =========================================================================
// tileset.json / license.json / README.md
// =========================================================================
function tilesetJson() {
  const cliffNote = 'Top surface uses the studio\'s existing 16-tile blob autotile convention (bitmask N*1+E*2+S*4+W*8, quarter-circle rounded corners -- same geometry as forest_v4_tiles.js path_blob/denseedge_blob and forest-v6\'s water_blob, extracted once into art/src/blob_autotile16.js). The vertical FACE below a south-facing top edge, its two outer corners, one inner corner and the ramp are NOT autotiled -- 5 discrete hand-placed pieces (same Wang-16-not-Wang-47-style tradeoff forest-v6/v7 documented for their own autotile). Placement rule: wherever a cliff_top_blob tile\'s S bit (bit 2) is 0, put the matching face/corner piece one cell below it on a separate "cliff-face" layer; put cliff_ramp.png at any single gap in that face row to let the player walk up.';
  return {
    biome: 'forest-v8-depth',
    note: 'Supplemental "depth and beauty" pack answering docs/DRAKANTOS_VISUAL_STUDY.md (table + priority list). NOT a full environment replacement and NOT wired into prototype/world -- integration (aliases.json / map generator / collision layer / the dynamic light pass itself) is game-dev work, out of game-art\'s write scope for this task. 0 PixelLab generations spent -- fully local Canvas.js pipeline.',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'ground-decal', 'cliff-face', 'decor', 'decor-light'],
    palette: 'See palette.json in this same folder: depth-revised ground/foliage ramps, the new cliff ramp, reserved saturated accents, and a renderPreset object with the exact HSV multipliers a renderer can apply to existing forest-v4/v6/v7 ground art (DRAKANTOS_VISUAL_STUDY.md item #6).',
    groundVariants: {
      note: 'NOT autotiled -- scatter at random/by noise per ground cell, same convention as forest_v4_tiles.js grassVariant()\'s 6 variants, just on the darker depth ramp and with heavier per-tile decal baking (study item #1: "chao nunca e liso").',
      files: Array.from({ length: 8 }, (_, i) => ({
        file: `tiles/ground_variant_${i}.png`,
        collision: false,
        suggestedLayer: 'ground',
        decal: ['plain', 'moss', 'pebbles', 'crackle', 'roots (dirt)', 'pebbles+crack (dirt)', 'leaf litter', 'small puddle'][i],
      })),
    },
    decals: {
      note: 'Transparent-background overlays, NOT full tiles -- stamp these over ANY existing ground tile (forest-v4/v6/v7 included, not just ground_variant_*) at noise-picked positions and random rotation/flip for the "chao nunca e liso" effect. All collision: false.',
      ground: [
        { file: 'decals/leaf_litter.png', size: '14x10', note: 'scatter under canopy / clearing edges' },
        { file: 'decals/root_tendril.png', size: '18x10', note: 'scatter near tree bases' },
        { file: 'decals/pebble_cluster.png', size: '14x10', note: 'scatter anywhere, denser on dirt/path' },
        { file: 'decals/crack.png', size: '20x14', note: 'scatter on dirt/dry patches, sparse' },
        { file: 'decals/moss_patch.png', size: '14x10', note: 'scatter in shaded/damp areas (near water, under dense canopy)' },
        { file: 'decals/puddle_small.png', size: '16x10', note: 'scatter sparsely after rain or near water; carries the reserved cyan sparkle accent' },
      ],
      transitions: [
        { file: 'decals/tuft_over_path_a.png', size: '16x12', note: 'thin variant -- study item #8, grass invading a path/dirt tile edge' },
        { file: 'decals/tuft_over_path_b.png', size: '16x12', note: 'denser variant of the same' },
        { file: 'decals/reed_cluster.png', size: '14x26', note: 'junco -- place on grass/shore cells directly bordering water' },
        { file: 'decals/shore_stone_small.png', size: '20x12', note: 'water-margin stone, flatter + wet sheen, distinct from forest-v6 props/rock_small.png (dry, no sheen)' },
      ],
    },
    cliff: {
      note: cliffNote,
      topAutotile: {
        pattern: '16-tile blob, see blob_autotile16.js',
        files: Array.from({ length: 16 }, (_, m) => `tiles/cliff_top_blob_${m}.png`),
      },
      facePieces: [
        { file: 'tiles/cliff_face_straight.png', collision: true, suggestedLayer: 'cliff-face', note: 'default face, use wherever the S bit of the top tile above is 0 and neither corner piece applies' },
        { file: 'tiles/cliff_face_corner_outer_left.png', collision: true, suggestedLayer: 'cliff-face', note: 'convex corner, top plateau turns away to the left' },
        { file: 'tiles/cliff_face_corner_outer_right.png', collision: true, suggestedLayer: 'cliff-face', note: 'convex corner, mirror of the left piece' },
        { file: 'tiles/cliff_face_corner_inner.png', collision: true, suggestedLayer: 'cliff-face', note: 'concave corner where two face runs meet' },
        { file: 'tiles/cliff_ramp.png', collision: false, suggestedLayer: 'cliff-face', interactive: false, note: 'walkable staircase -- place at any single gap in a face row to let the player climb the 1-level height' },
      ],
    },
    emissiveProps: [
      { file: 'props/data_crystal.png', size: '26x34', collision: true, suggestedLayer: 'decor', light: { color: '#2ce8f5', radius: 48, intensity: 0.75 }, note: 'tallest-impact single prop for study item #3; cluster 1-2 per clearing, not a carpet' },
      { file: 'props/mushroom_bioluminescent.png', size: '20x18', collision: false, suggestedLayer: 'decor', light: { color: '#ff5fc1', radius: 28, intensity: 0.55 }, note: 'small accent light, good near fern/tuft clutter clusters' },
      { file: 'props/data_totem.png', size: '18x46', collision: true, suggestedLayer: 'decor', light: { color: '#feae34', radius: 60, intensity: 0.9 }, note: 'landmark-scale beacon (path markers, arena entrances) -- widest radius of the three' },
    ],
    clutter: [
      { file: 'props/fern.png', size: '20x22', collision: false, suggestedLayer: 'decor' },
      { file: 'props/tuft.png', size: '14x10', collision: false, suggestedLayer: 'decor', note: 'shorter/rounder than forest-v4 props tallGrassClump -- a satellite piece, not a replacement' },
      { file: 'props/fallen_trunk.png', size: '46x16', collision: true, suggestedLayer: 'decor', note: 'bigger and mossier than forest-v4 fallenLog -- distinct asset, both can coexist' },
      { file: 'props/flowering_bush.png', size: '28x22', collision: true, suggestedLayer: 'decor' },
    ],
    clusterExamples: {
      note: 'Pre-built "nucleo + satelites" compositions (DRAKANTOS_VISUAL_STUDY.md item #5) showing how the clutter pieces above combine -- reference only, not mandatory; placement tooling can still place fern/tuft/etc. individually.',
      files: [
        { file: 'props/edge_cluster_a.png', size: '48x26', collision: false, suggestedLayer: 'decor', note: 'fern + 2 tuft + pebble + moss' },
        { file: 'props/edge_cluster_b.png', size: '50x24', collision: true, suggestedLayer: 'decor', note: 'flowering_bush + tuft + leaf litter' },
      ],
    },
  };
}

function licenseJson() {
  return {
    biome: 'forest-v8-depth',
    layer: 'original',
    assets: [
      {
        group: 'depth palette (palette.json) + 8 ground variants + 10 decals + 21 cliff-kit pieces + 3 emissive props + 4 clutter props + 2 cluster-example composites',
        origin: 'game-art, 100% local pipeline, 2026-11-09',
        layer: 'original',
        author: 'game-art',
        technique: 'Canvas.js pixel matrix (fillEllipse/fillRect/fillPolygon/line/blendPixel) + the studio\'s 16-tile blob autotile corner-rounding algorithm (blob_autotile16.js, extracted from forest_v4_tiles.js/gen_forest_v6_pieces.js\'s inline copies) + forest_v4_props.js rimDarken() reused as-is. Palette: a documented HSV darken/desaturate of forest_v4_palette.js day ramps (forest_v8_depth_palette.js) plus a new cliff ramp built from the same source, and a small set of reserved fully-saturated accents (2 reused from endesga32.js, 2 new) for the emissive props only. No PixelLab generation and no third-party art referenced pixel-for-pixel.',
        styleReference: 'docs/DRAKANTOS_VISUAL_STUDY.md (ADR-011 Sec.5: style/composition reference only, citing the study\'s own table items by number in code comments and in this tileset.json -- no pixels copied from any Drakantos screenshot or frame).',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- no third-party art referenced pixel-for-pixel. Third-party style references (Drakantos) informed the palette/depth/cluster direction only, per ADR-010/ADR-011 Secao 5, not these specific pixels.',
      },
    ],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };
}

function readmeMd() {
  return `# forest-v8-depth — profundidade e beleza (Map Factory, 2026-11-09)

Responde ao pedido do fundador ("Drakantos tem muito mais profundidade e beleza") via
\`projects/prototypes/GS-003/docs/DRAKANTOS_VISUAL_STUDY.md\` (tabela + lista de prioridade). Cobre o lado
game-art dos itens #1, #2, #3 (so a arte), #5, #6 e #8 do estudo. Os itens #4 (sombra de contato no
renderer), #7 (zoom) e #9 (VFX) ficam fora deste pacote -- ver Limitacoes.

**100% pipeline local** (Canvas.js, mesma convencao de \`forest-v4\`/\`forest-v6\`): **0 geracoes do PixelLab
gastas**. \`get_balance\` antes e depois: 26 restantes, sem mudanca (ver
\`shared/tools/map-factory/logs/pixellab-usage.csv\` para a linha de registro). Nada do jogo foi alterado
por esta entrega.

## O que tem aqui

- **\`palette.json\`** — rampas revisadas de chao/copa (item #6), mais escuras e menos saturadas que o
  \`forest-v4\` dia, derivadas por um deslocamento HSV documentado (nao hex novos "no olho") --
  \`renderPreset\` traz os multiplicadores exatos para o game-dev aplicar em qualquer tile ja pintado do
  \`forest-v4\`/\`v6\`/\`v7\` sem reexportar arte. Acentos saturados (\`accentSaturated\`) ficam reservados para
  props emissores e poucos pixels de brilho focal (poca, pedra de margem) -- nunca no chao/copa base.
- **\`tiles/ground_variant_0..7.png\`** (32x32 cada) — 8 variantes de chao na paleta nova, cada uma com um
  tipo de decalque ja embutido (moss, pedrinha, rachadura, raiz, folha caida, poca). Nao sao autotile --
  espalhar por ruido/aleatorio, igual as 6 variantes de \`grassVariant\` do \`forest-v4\`.
- **\`decals/\`** (10 PNGs transparentes, pequenos) — folhas, raizes, pedrinhas, rachaduras, musgo, poca
  (6, para qualquer chao) + tufo sobre trilha (2 variantes), junco e pedra de margem (2, item #8). Essas
  sao decalques avulsos, nao tiles cheios: dao para colar em QUALQUER chao existente do jogo (inclusive
  \`forest-v4\`/\`v6\`/\`v7\`), nao so nos \`ground_variant_*\` novos.
- **Kit de penhasco/barranco, 1 nivel** (item #2, maior prioridade do estudo):
  - \`tiles/cliff_top_blob_0..15.png\` — topo autotile blob-16 (mesma geometria de \`path_blob\`/\`water_blob\`,
    agora em \`art/src/blob_autotile16.js\`).
  - \`tiles/cliff_face_straight.png\`, \`cliff_face_corner_outer_left/right.png\`, \`cliff_face_corner_inner.png\`,
    \`cliff_ramp.png\` — face vertical com sombra de contato forte (item #4 embutido aqui), cantos interno/
    externo e rampa/escada andavel. Essas 5 pecas NAO sao autotile (ver Limitacoes).
- **Props emissores digitais** (item #3, so a arte): \`props/data_crystal.png\`, \`mushroom_bioluminescent.png\`,
  \`data_totem.png\`. Cada um tem um campo \`light: {color, radius, intensity}\` em \`tileset.json\` para o
  renderer criar a poca de luz dinamica; a arte tambem traz um halo estatico (\`glowHalo\`) para a captura
  de tela ja mostrar brilho sem depender do renderer.
- **Clutter de borda de mata** (item #5): \`props/fern.png\`, \`tuft.png\`, \`fallen_trunk.png\`,
  \`flowering_bush.png\`, mais dois exemplos de **cluster** pronto (\`edge_cluster_a/b.png\`, nucleo +
  satelites) mostrando como combinar as pecas em grupo em vez de espalhar uma a uma.
- \`preview.png\` — prancha com todos os itens acima, montada localmente.
- \`tileset.json\` / \`license.json\` — mesmo schema do \`forest-v4\`/\`v6\`/\`v7\`.

## O que o renderer (game-dev) precisa implementar

1. **Paleta**: aplicar \`palette.json.renderPreset\` (multiplicadores de saturacao/valor) em chao/copa
   existentes, OU simplesmente trocar os tiles de chao pelos \`ground_variant_*\` novos e usar as rampas
   de \`palette.json\` ao pintar qualquer coisa nova de chao/copa/casca.
2. **Luzes pontuais**: ler o campo \`light\` de cada prop emissor em \`tileset.json\` e desenhar um gradiente
   aditivo nesse raio/cor/intensidade (item #3 do estudo -- isto NAO esta implementado aqui, so os dados).
3. **Decalques por ruido**: ao pintar um chao, escolher 0-3 decalques de \`decals/ground/\` por celula com
   ruido (nao grade fixa) e rotacao/flip aleatorios para variar a leitura.
4. **Penhasco**: ler o bit S do \`cliff_top_blob\` e colocar a peca de face correspondente 1 celula abaixo,
   numa layer separada \`cliff-face\` (colisao true nessa layer); \`cliff_ramp.png\` em qualquer vao da fileira
   de face para o jogador subir.
5. **Colisao**: como sempre neste pipeline, colisao e dado de \`tileset.json\` por arquivo, independente do
   desenho -- nada aqui calcula hitbox automaticamente.

## Limitacoes (autocritica)

- **Autotile blob-16, nao Wang-47** -- mesma limitacao ja documentada em \`forest-v6\`/\`v7\` para seus proprios
  autotiles; cantos internos do TOPO do penhasco podem formar um padrao xadrez visivel em layouts raros.
  Nao testado num mapa real.
- **Face/cantos/rampa do penhasco sao 5 pecas discretas, nao autotile** -- cobre o caso comum (1 nivel,
  borda reta + 2 cantos convexos + 1 concavo + 1 rampa) mas um contorno muito irregular pode precisar de
  mais variantes que este pacote nao produz.
- **Luz e so dado, nao renderizacao** -- o campo \`light\` em \`tileset.json\` e o halo estatico (\`glowHalo\`) na
  propria arte sao tudo que existe; o gradiente aditivo dinamico, as particulas ambiente (vagalumes,
  poeira digital) e a sombra de contato elipsica sob CADA prop/entidade (nao so o penhasco) sao trabalho
  de game-dev, fora do escopo de escrita do game-art nesta tarefa.
- **Zoom (item #7) e VFX (item #9) do estudo nao sao tocados aqui** -- fora do escopo desta entrega.
- **Nada disto foi testado no motor real**, so inspecionado visualmente via \`preview.png\` e os PNGs
  individuais.
- **0 geracoes do PixelLab usadas** -- o pipeline local (ja usado em \`forest-v4\`/\`v6\`) se mostrou suficiente
  para todos os 6 pedidos da tarefa; o orcamento de 26 geracoes restantes continua intocado para rodadas
  futuras.
`;
}

function main() {
  const d = buildDepthRamps();
  const dayRamp = withPreset(true);
  const seed = 8001;

  const groundTiles = {};
  for (let i = 0; i < 8; i++) groundTiles[`ground_variant_${i}`] = groundVariant(d, i, seed);

  const cliffTop = cliffTopBlobSet(d, seed + 2000);
  const cliffFace = {
    cliff_face_straight: cliffFaceStraight(d, seed + 3001),
    cliff_face_corner_outer_left: cliffFaceCornerOuter(d, seed + 3002, 'left'),
    cliff_face_corner_outer_right: cliffFaceCornerOuter(d, seed + 3003, 'right'),
    cliff_face_corner_inner: cliffFaceCornerInner(d, seed + 3004),
    cliff_ramp: cliffRamp(d, seed + 3005),
  };

  const groundDecals = {
    leaf_litter: decalCanvas(14, 10, (c, cx, cy) => stampLeafLitter(c, cx, cy, d, rng(seed + 4001), 5)),
    root_tendril: decalCanvas(18, 10, (c, cx, cy) => stampRootTendril(c, cx, cy, d, rng(seed + 4002), 16, -0.2)),
    pebble_cluster: decalCanvas(14, 10, (c, cx, cy) => stampPebbleCluster(c, cx, cy, d, rng(seed + 4003), 4)),
    crack: decalCanvas(20, 14, (c, cx, cy) => stampCrack(c, cx, cy, d, rng(seed + 4004), 14, 2)),
    moss_patch: decalCanvas(14, 10, (c, cx, cy) => stampMossPatch(c, cx, cy, d, rng(seed + 4005), 5)),
    puddle_small: decalCanvas(16, 10, (c, cx, cy) => stampPuddle(c, cx, cy, d, rng(seed + 4006), 6, 3)),
  };
  const transitionDecals = {
    tuft_over_path_a: tuftOverPath(d, seed + 5001, 0),
    tuft_over_path_b: tuftOverPath(d, seed + 5002, 1),
    reed_cluster: reedCluster(d, seed + 5003),
    shore_stone_small: shoreStone(d, seed + 5004),
  };

  const emissiveProps = {
    data_crystal: dataCrystal(seed + 6001),
    mushroom_bioluminescent: mushroomBioluminescent(seed + 6002),
    data_totem: dataTotem(d, seed + 6003),
  };
  const clutterProps = {
    fern: fern(d, seed + 7001),
    tuft: tuft(d, seed + 7002),
    fallen_trunk: fallenTrunk(d, seed + 7003),
    flowering_bush: floweringBush(d, dayRamp.flower, seed + 7004),
  };
  const clusterProps = {
    edge_cluster_a: edgeClusterA(d, seed + 8001),
    edge_cluster_b: edgeClusterB(d, dayRamp.flower, seed + 8002),
  };

  const tilesDir = path.join(OUT, 'tiles');
  const decalsDir = path.join(OUT, 'decals');
  const propsDir = path.join(OUT, 'props');
  fs.mkdirSync(tilesDir, { recursive: true });
  fs.mkdirSync(decalsDir, { recursive: true });
  fs.mkdirSync(propsDir, { recursive: true });

  for (const [name, canvas] of Object.entries(groundTiles)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(cliffTop)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(cliffFace)) canvas.save(path.join(tilesDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(groundDecals)) canvas.save(path.join(decalsDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(transitionDecals)) canvas.save(path.join(decalsDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(emissiveProps)) canvas.save(path.join(propsDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(clutterProps)) canvas.save(path.join(propsDir, `${name}.png`));
  for (const [name, canvas] of Object.entries(clusterProps)) canvas.save(path.join(propsDir, `${name}.png`));

  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify(buildPaletteDoc(), null, 2));
  fs.writeFileSync(path.join(OUT, 'README.md'), readmeMd());

  const sheet = buildPreviewSheet([
    { title: 'GROUND VARIANTS (0-7)', items: Object.entries(groundTiles).map(([n, cv]) => ({ name: n, canvas: cv })) },
    { title: 'CLIFF TOP BLOB (0-15)', items: Object.entries(cliffTop).map(([n, cv]) => ({ name: n, canvas: cv })) },
    { title: 'CLIFF FACE / CORNERS / RAMP', items: Object.entries(cliffFace).map(([n, cv]) => ({ name: n, canvas: cv })) },
    { title: 'GROUND DECALS', items: Object.entries(groundDecals).map(([n, cv]) => ({ name: n, canvas: cv })), scale: 3 },
    { title: 'TRANSITION DECALS', items: Object.entries(transitionDecals).map(([n, cv]) => ({ name: n, canvas: cv })), scale: 3 },
    { title: 'EMISSIVE PROPS', items: Object.entries(emissiveProps).map(([n, cv]) => ({ name: n, canvas: cv })), scale: 3 },
    { title: 'CLUTTER + CLUSTER EXAMPLES', items: [...Object.entries(clutterProps), ...Object.entries(clusterProps)].map(([n, cv]) => ({ name: n, canvas: cv })), scale: 2 },
  ]);
  sheet.save(path.join(OUT, 'preview.png'));

  console.log('forest-v8-depth written to', OUT);
}

main();
