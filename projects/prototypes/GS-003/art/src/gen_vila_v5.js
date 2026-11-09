'use strict';
// GS-003 vila-v5 "Vila dos Bebes" -- houses/bushes cropped from the licensed
// NinjaAdventure "village_abandoned" sheet (CC0), brightened from its mossy
// ruin palette toward a cheerful inhabited-village tone (hue/light lift,
// not a full repaint -- see README self-critique). Fence, crib and egg
// cluster are hand-painted (no licensed pack covers baby-Digimon props).
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { naSheet, cropTiles2x, recolor } = require('./na_source.js');
const { cropRect } = require('./dwds_extract.js');

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/vila-v5');
fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'props'), { recursive: true });

const village = naSheet('tileset_village_abandoned.png');
const CHEER = { hueShift: 0.03, satMul: 1.15, lightAdd: 0.1 };

function cheer(c) { return recolor(c, CHEER); }

// Demoss: the licensed sheet is literally named "village_abandoned" -- every
// building has green ruin-moss baked into its roof pixels, which a global
// hue/light shift (cheer()) cannot remove (it is a different hue band, not
// just a tint). Recolor any clearly green/olive pixel (hue roughly
// yellow-green..green, decent saturation) toward the same warm wood-shingle
// hue already used by the rest of each roof, keeping each pixel's own
// lightness so the existing shading/texture reads as shingle variation
// instead of moss. Run BEFORE cheer() so the brightening pass still applies
// evenly to the now-wood-colored roof.
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
function hue2rgb(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
function hslToRgb(h, s, l) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}
function demoss(c, targetHue = 0.08) {
  const nc = new Canvas(c.w, c.h);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [r, g, b, a] = c.getPixel(x, y);
      if (a === 0) continue;
      const [h, s, l] = rgbToHsl(r, g, b);
      const isMoss = h > 0.17 && h < 0.42 && s > 0.12;
      if (isMoss) {
        const [nr, ng, nb] = hslToRgb(targetHue, Math.min(0.75, s * 0.9), l);
        nc.setPixel(x, y, [nr, ng, nb, a]);
      } else {
        nc.setPixel(x, y, [r, g, b, a]);
      }
    }
  }
  return nc;
}

// Crop bounds fixed against the real sheet geometry (see review: houses
// were landing cropped/cut -- wrong tile offsets grabbed only a corner of
// each building, e.g. house_big used to miss the door and roof apex
// entirely). house_small is a tight sub-crop of the cottage's porch module
// (the sheet's only two intact, hole-free buildings are the big cabin and
// the cottage; the sheet's actual "small hut" has a structural hole in the
// roof, not just moss, so it is not usable even after demoss).
const houseBig = demoss(cropTiles2x(village, 12, 6, 4, 6));
// The sheet's other building-sized regions near the cottage/small-hut tiles
// turned out to be either structurally holed (a real ruin, not just moss --
// can't be demossed away) or baked opaque with no transparent background
// (a border flood-fill to matte it out ate the whole roof too, since its
// anti-aliased edge blends gradually into the background green). Rather
// than ship a second broken crop, derive the other two house sizes from
// house_big itself (the one confirmed clean, alpha-transparent building on
// this sheet): house_small is its door+window porch module, house_cottage
// is the same module mirrored, so the plaza still reads as 3 different
// houses without reusing a flawed source region.
const houseSmall = cropRect(houseBig, 0, 118, 127, 191);
const houseCottage = houseSmall.flipX();

cheer(houseSmall).save(path.join(OUT, 'props', 'house_small.png'));
cheer(houseBig).save(path.join(OUT, 'props', 'house_big.png'));
cheer(houseCottage).save(path.join(OUT, 'props', 'house_cottage.png'));
cheer(cropTiles2x(village, 0, 7, 3, 2)).save(path.join(OUT, 'props', 'bush_big.png'));
cheer(cropTiles2x(village, 4, 10, 2, 2)).save(path.join(OUT, 'props', 'bush_small.png'));

// ---- shared ground: reuse forest-v5 grass crop + path autotile directly so
// the village plaza reads as the same world, not a different game (copied,
// not symlinked, so this biome folder stays self-contained for the loader).
const FOREST = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v5');
for (const f of ['grass_00.png', 'grass_01.png', 'grass_02.png']) {
  fs.copyFileSync(path.join(FOREST, 'tiles', f), path.join(OUT, 'tiles', f));
}
for (let m = 0; m < 16; m++) {
  fs.copyFileSync(path.join(FOREST, 'tiles', `path_blob_${m}.png`), path.join(OUT, 'tiles', `path_blob_${m}.png`));
}

// ---- hand-painted props (no licensed pack covers these) ------------------
function buildFence() {
  const c = new Canvas(32, 32);
  const wood = [150, 108, 62, 255], woodDk = [100, 70, 40, 255];
  c.fillRect(2, 14, 29, 17, woodDk);
  c.fillRect(2, 14, 29, 16, wood);
  for (const px of [4, 14, 24]) {
    c.fillRect(px, 4, px + 3, 27, woodDk);
    c.fillRect(px, 4, px + 2, 26, wood);
    c.fillPolygon([[px - 1, 4], [px + 3, 4], [px + 1, 0]], wood);
  }
  c.autoOutline([60, 42, 24, 180]);
  return c;
}
buildFence().save(path.join(OUT, 'props', 'fence.png'));

function buildCrib() {
  const c = new Canvas(32, 32);
  const wood = [195, 150, 95, 255], woodDk = [140, 100, 60, 255];
  const cloth = [255, 210, 225, 255], clothDk = [235, 170, 190, 255];
  c.fillEllipse(16, 26, 13, 5, [0, 0, 0, 70]);
  // basket body
  c.fillEllipse(16, 20, 12, 7, wood);
  c.fillEllipse(16, 20, 12, 7, [0, 0, 0, 0]);
  for (let a = 0; a < 14; a++) {
    const x = 4 + a * 1.7;
    c.line(Math.round(x), 15, Math.round(x), 24, a % 2 === 0 ? woodDk : wood, 1);
  }
  c.strokeEllipse(16, 20, 12, 7, woodDk, 1);
  // blanket + pillow
  c.fillEllipse(16, 17, 10, 4, cloth);
  c.fillEllipse(11, 16, 3, 2, [255, 255, 255, 255]);
  c.strokeEllipse(16, 17, 10, 4, clothDk, 1);
  // rocking base
  c.strokeEllipse(16, 27, 14, 2, woodDk, 1);
  // Full dark outline (was a faint 170-alpha line, too close to the grass
  // tone to read at a glance -- review asked for more contrast).
  c.autoOutline([40, 26, 14, 255]);
  return c;
}
buildCrib().save(path.join(OUT, 'props', 'crib.png'));

function buildEggCluster() {
  const c = new Canvas(32, 26);
  // Straw nest base first -- a dark-brown ring under the eggs so the whole
  // cluster reads as one object against grass at a glance instead of 3 pale
  // blobs floating on green (review: low contrast, hard to see).
  const straw = [150, 108, 58, 255], strawDk = [104, 72, 36, 255];
  c.fillEllipse(16, 21, 15, 5, [0, 0, 0, 80]);
  c.fillEllipse(16, 19, 14, 6, strawDk);
  c.fillEllipse(16, 18, 13, 5, straw);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const sx = 16 + Math.cos(a) * 13, sy = 18 + Math.sin(a) * 5;
    c.setPixel(Math.round(sx), Math.round(sy), strawDk);
  }
  c.strokeEllipse(16, 18, 13, 5, [60, 40, 20, 255], 1);
  // Eggs: deeper, more saturated shell tones (the pastel versions were
  // close enough to the grass/sand around them to merge into it) plus a
  // full dark outline per egg so each shell pops against the nest.
  const eggs = [
    { x: 10, y: 13, r: 7, c1: [250, 205, 90, 255], c2: [214, 150, 35, 255] },
    { x: 21, y: 12, r: 8, c1: [120, 185, 235, 255], c2: [60, 120, 195, 255] },
    { x: 16, y: 6, r: 6, c1: [150, 220, 120, 255], c2: [95, 170, 70, 255] },
  ];
  for (const e of eggs) c.fillEllipse(e.x, e.y + e.r * 0.3, e.r * 0.8, 2, [0, 0, 0, 90]);
  for (const e of eggs) {
    c.fillEllipse(e.x, e.y, e.r * 0.72, e.r, e.c1);
    for (let i = 0; i < 4; i++) {
      const sx = e.x + (i - 1.5) * (e.r * 0.3), sy = e.y - e.r * 0.3 + (i % 2) * e.r * 0.5;
      c.fillCircle(Math.round(sx), Math.round(sy), 1, e.c2);
    }
    c.strokeEllipse(e.x, e.y, e.r * 0.72, e.r, e.c2, 1);
    c.strokeEllipse(e.x, e.y, e.r * 0.72 + 1, e.r + 1, [30, 24, 14, 230], 1);
  }
  return c;
}
buildEggCluster().save(path.join(OUT, 'props', 'egg_cluster.png'));

console.log('vila-v5 houses/bushes/props written to', OUT);
