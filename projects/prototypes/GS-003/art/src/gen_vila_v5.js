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

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/vila-v5');
fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'props'), { recursive: true });

const village = naSheet('tileset_village_abandoned.png');
const CHEER = { hueShift: 0.03, satMul: 1.15, lightAdd: 0.1 };

function cheer(c) { return recolor(c, CHEER); }

cheer(cropTiles2x(village, 11, 0, 3, 3)).save(path.join(OUT, 'props', 'house_small.png'));
cheer(cropTiles2x(village, 13, 7, 4, 4)).save(path.join(OUT, 'props', 'house_big.png'));
cheer(cropTiles2x(village, 17, 8, 3, 3)).save(path.join(OUT, 'props', 'house_cottage.png'));
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
  c.autoOutline([70, 48, 28, 170]);
  return c;
}
buildCrib().save(path.join(OUT, 'props', 'crib.png'));

function buildEggCluster() {
  const c = new Canvas(32, 24);
  const eggs = [
    { x: 10, y: 16, r: 7, c1: [255, 232, 160, 255], c2: [240, 200, 110, 255] },
    { x: 21, y: 15, r: 8, c1: [190, 230, 255, 255], c2: [150, 200, 240, 255] },
    { x: 16, y: 9, r: 6, c1: [220, 255, 200, 255], c2: [180, 225, 160, 255] },
  ];
  for (const e of eggs) c.fillEllipse(e.x, e.y + e.r * 0.3, e.r * 0.8, 2, [0, 0, 0, 70]);
  for (const e of eggs) {
    c.fillEllipse(e.x, e.y, e.r * 0.72, e.r, e.c1);
    for (let i = 0; i < 4; i++) {
      const sx = e.x + (i - 1.5) * (e.r * 0.3), sy = e.y - e.r * 0.3 + (i % 2) * e.r * 0.5;
      c.fillCircle(Math.round(sx), Math.round(sy), 1, e.c2);
    }
    c.strokeEllipse(e.x, e.y, e.r * 0.72, e.r, e.c2, 1);
  }
  c.autoOutline([60, 60, 60, 120]);
  return c;
}
buildEggCluster().save(path.join(OUT, 'props', 'egg_cluster.png'));

console.log('vila-v5 houses/bushes/props written to', OUT);
