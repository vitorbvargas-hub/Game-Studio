'use strict';
// GS-003 praia-v5 "Praia dos Postes" -- sand/water from the licensed
// NinjaAdventure Asset Pack (CC0), electric pole hand-painted (not present
// in any licensed pack; explicitly allowed by the task brief) referencing
// Digimon Adventure ep.1's iconic beach power-line silhouette.
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { naSheet, cropTiles2x, cropTiles, recolor } = require('./na_source.js');
const { buildBlobSet } = require('./na_blob.js');

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/praia-v5');
fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'props'), { recursive: true });

const floor = naSheet('tileset_floor.png');

// Sand = recolor of the licensed dirt-patch tile, tuned warm/beige instead
// of the earlier washed-out cool-gray pass (more hue shift toward orange,
// much less desaturation, less lightening -- GS-003 review, 2026-11-09).
const SAND_RECOLOR = { hueShift: 0.065, satMul: 1.05, lightAdd: 0.12 };
const dirtSample = cropTiles(floor, 12, 15, 1, 1);
const sandSample = recolor(dirtSample, SAND_RECOLOR);

// Water -- the licensed floor sheet's water art is a small pond/island
// DECAL (a circle with a scalloped white foam edge baked into almost every
// one of its 16px tiles); the tile previously sampled as a "tileable
// texture" (2,22) was actually that foam edge, and wrap-repeating a 16px
// edge tile both inside and across every 32px grid cell produced the
// visible repeating vertical stripe reported in review. Tile (1,22) is the
// one genuinely flat, edge-free interior pixel of that decal -- used below
// as a flat base color with a few seeded, per-tile sparkle pixels instead
// of a wrap-tiled sample, so open water has life without ever repeating a
// visible pattern across the map (see buildWaterOpenTile).
const waterFlat = cropTiles2x(floor, 1, 22, 1, 1);
const WATER_BASE = waterFlat.getPixel(16, 16);
const WATER_HI = [Math.min(255, WATER_BASE[0] + 28), Math.min(255, WATER_BASE[1] + 20), Math.min(255, WATER_BASE[2] + 14), 150];
const WATER_LO = [Math.max(0, WATER_BASE[0] - 18), Math.max(0, WATER_BASE[1] - 10), Math.max(0, WATER_BASE[2] - 6), 90];

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Flat base + a handful of seeded glint/ripple pixels -- each variant looks
// subtly different (different glint positions), so tiling 16 of them across
// a big open-water area never lines up into a repeating grid or stripe.
function buildWaterOpenTile(seed) {
  const c = new Canvas(32, 32);
  c.fillRect(0, 0, 31, 31, WATER_BASE);
  const rnd = mulberry32(seed);
  const glints = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < glints; i++) c.blendPixel(Math.floor(rnd() * 32), Math.floor(rnd() * 32), WATER_HI);
  const ripples = 2 + Math.floor(rnd() * 2);
  for (let i = 0; i < ripples; i++) c.blendPixel(Math.floor(rnd() * 32), Math.floor(rnd() * 32), WATER_LO);
  return c;
}

const WATER_OPEN_COUNT = 16;
for (let i = 0; i < WATER_OPEN_COUNT; i++) {
  buildWaterOpenTile(40000 + i * 977).save(path.join(OUT, 'tiles', `water_open_${String(i).padStart(2, '0')}.png`));
}

// Shoreline (rounded-corner) tiles still use buildBlobSet for the coastline
// silhouette, but now with flat, edge-free fg/bg samples (no wrap seam).
const waterFlatSample = (() => { const c = new Canvas(16, 16); c.fillRect(0, 0, 15, 15, WATER_BASE); return c; })();
const waterBlob = buildBlobSet('water_blob', waterFlatSample, sandSample, 20202);
for (const [name, canvas] of Object.entries(waterBlob)) canvas.save(path.join(OUT, 'tiles', `${name}.png`));

const sandVariants = [
  recolor(cropTiles2x(floor, 12, 15, 1, 1), SAND_RECOLOR),
  recolor(cropTiles2x(floor, 13, 16, 1, 1), SAND_RECOLOR),
  recolor(cropTiles2x(floor, 14, 17, 1, 1), SAND_RECOLOR),
];
sandVariants.forEach((c, i) => c.save(path.join(OUT, 'tiles', `sand_0${i}.png`)));

// ---- electric pole (hand-painted, 32x96 native-equivalent) ---------------
// Digimon Adventure ep.1 beach silhouette: weathered wood pole, 2 crossbars,
// sagging cable, small insulators -- no licensed asset covers this prop.
function buildElectricPole() {
  const c = new Canvas(32, 112);
  const wood = [120, 86, 58, 255], woodDk = [84, 58, 38, 255], woodLt = [150, 112, 78, 255];
  // pole shaft (tapered, slight 3-tone shading for roundness)
  for (let y = 10; y < 108; y++) {
    const w = 5 - Math.floor((y - 10) / 40);
    const cx = 16;
    for (let x = -w; x <= w; x++) {
      const t = x < -1 ? woodDk : x > 1 ? woodLt : wood;
      c.setPixel(cx + x, y, t);
    }
  }
  // base shadow
  c.fillEllipse(16, 108, 7, 3, [0, 0, 0, 90]);
  // crossbars
  for (const cy of [20, 34]) {
    c.fillRect(2, cy, 29, cy + 2, woodDk);
    c.fillRect(2, cy, 29, cy + 1, wood);
    for (const ix of [4, 27]) {
      c.fillCircle(ix, cy - 2, 2, [210, 210, 215, 255]); // insulator caps
      c.setPixel(ix, cy - 3, [235, 235, 240, 255]);
    }
  }
  // sagging cables between crossbars and off-frame
  const cable = [40, 40, 44, 255];
  function sag(x0, y0, x1, y1, droop) {
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const x = Math.round(x0 + (x1 - x0) * t);
      const y = Math.round(y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * droop);
      c.setPixel(x, y, cable);
    }
  }
  sag(4, 18, 0, 26, 6);
  sag(27, 18, 31, 26, 6);
  sag(4, 32, 0, 40, 7);
  sag(27, 32, 31, 40, 7);
  c.autoOutline([30, 22, 16, 160]);
  return c;
}
buildElectricPole().save(path.join(OUT, 'props', 'electric_pole.png'));

console.log('praia-v5 ground+props written to', OUT);
