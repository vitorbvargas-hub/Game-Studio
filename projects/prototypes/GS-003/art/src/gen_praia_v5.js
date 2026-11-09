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

const waterSample = cropTiles(floor, 2, 22, 1, 1);
const dirtSample = cropTiles(floor, 12, 15, 1, 1);
const sandSample = recolor(dirtSample, { hueShift: 0.06, satMul: 0.6, lightAdd: 0.3 });

const waterBlob = buildBlobSet('water_blob', waterSample, sandSample, 20202);
for (const [name, canvas] of Object.entries(waterBlob)) canvas.save(path.join(OUT, 'tiles', `${name}.png`));

const sandVariants = [
  recolor(cropTiles2x(floor, 12, 15, 1, 1), { hueShift: 0.06, satMul: 0.6, lightAdd: 0.3 }),
  recolor(cropTiles2x(floor, 13, 16, 1, 1), { hueShift: 0.06, satMul: 0.6, lightAdd: 0.3 }),
  recolor(cropTiles2x(floor, 14, 17, 1, 1), { hueShift: 0.06, satMul: 0.6, lightAdd: 0.3 }),
];
sandVariants.forEach((c, i) => c.save(path.join(OUT, 'tiles', `sand_0${i}.png`)));

// water patch stamp (real circular shoreline shading, multi-tile decal)
const waterStamp = recolor(cropTiles2x(floor, 0, 21, 5, 3), { hueShift: 0, satMul: 1 });
waterStamp.save(path.join(OUT, 'tiles', 'water_stamp_5x3.png'));

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
