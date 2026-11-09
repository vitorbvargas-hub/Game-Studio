'use strict';
// GS-003 vila-v5 "Vila dos Bebes" proof scene -- same cast/HUD convention.
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { pngToCanvas, loadTamer, addCreature, addTamer, nameLevelTag, hpBar, drawHud } = require('./proof_hud.js');

const ENV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/vila-v5');
const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');
const CW = 1280, CH = 720, TILE = 32;
const COLS = Math.ceil(CW / TILE), ROWS = Math.ceil(CH / TILE);

function mulberry(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function loadTiles() {
  const g = (f) => pngToCanvas(path.join(ENV, 'tiles', f));
  const p = (f) => pngToCanvas(path.join(ENV, 'props', f));
  const grass = [g('grass_00.png'), g('grass_01.png'), g('grass_02.png')];
  const pathBlob = {}; for (let m = 0; m < 16; m++) pathBlob[m] = g(`path_blob_${m}.png`);
  return {
    grass, pathBlob,
    houseSmall: p('house_small.png'), houseBig: p('house_big.png'), houseCottage: p('house_cottage.png'),
    bushBig: p('bush_big.png'), bushSmall: p('bush_small.png'), fence: p('fence.png'), crib: p('crib.png'), eggs: p('egg_cluster.png'),
  };
}

// a plaza path: a + shape crossing the map, connecting the 3 houses.
function isPathCell(tx, ty) {
  const vert = tx > COLS / 2 - 2 && tx < COLS / 2 + 2;
  const horiz = ty > ROWS / 2 - 1.5 && ty < ROWS / 2 + 1.5;
  return vert || horiz;
}
function neighborBitmask(mask, tx, ty) {
  const at = (x, y) => { if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false; return mask[y][x]; };
  let m = 0;
  if (at(tx, ty - 1)) m |= 1;
  if (at(tx + 1, ty)) m |= 2;
  if (at(tx, ty + 1)) m |= 4;
  if (at(tx - 1, ty)) m |= 8;
  return m;
}

function buildGround(t, rnd) {
  const scene = new Canvas(CW, CH);
  const pathMask = [];
  for (let ty = 0; ty < ROWS; ty++) { const row = []; for (let tx = 0; tx < COLS; tx++) row.push(isPathCell(tx, ty)); pathMask.push(row); }
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      if (pathMask[ty][tx]) { scene.blit(t.pathBlob[neighborBitmask(pathMask, tx, ty)], x, y); }
      else scene.blit(t.grass[Math.floor(rnd() * 3)], x, y);
    }
  }
  return scene;
}

function placeBuildings(scene, t, rnd) {
  const decor = [];
  decor.push({ canvas: t.houseCottage, x: 90, y: 60, sortY: 60 + t.houseCottage.h });
  decor.push({ canvas: t.houseSmall, x: 980, y: 70, sortY: 70 + t.houseSmall.h });
  decor.push({ canvas: t.houseBig, x: 520, y: 40, sortY: 40 + t.houseBig.h });
  decor.push({ canvas: t.bushBig, x: 60, y: 300, sortY: 300 + t.bushBig.h });
  decor.push({ canvas: t.bushBig, x: 1100, y: 340, sortY: 340 + t.bushBig.h });
  decor.push({ canvas: t.bushSmall, x: 300, y: 500, sortY: 500 + t.bushSmall.h });
  decor.push({ canvas: t.bushSmall, x: 860, y: 480, sortY: 480 + t.bushSmall.h });
  decor.push({ canvas: t.bushSmall, x: 440, y: 560, sortY: 560 + t.bushSmall.h });
  // small picket-fence perimeter around the plaza nursery garden
  for (let i = 0; i < 6; i++) decor.push({ canvas: t.fence, x: 420 + i * 32, y: 440, sortY: 440 + t.fence.h - 4 });
  // baby cribs + egg clusters in the central garden
  decor.push({ canvas: t.crib, x: 560, y: 400, sortY: 400 + t.crib.h - 4 });
  decor.push({ canvas: t.crib, x: 660, y: 410, sortY: 410 + t.crib.h - 4 });
  decor.push({ canvas: t.eggs, x: 610, y: 460, sortY: 460 + t.eggs.h - 4 });
  decor.push({ canvas: t.eggs, x: 500, y: 350, sortY: 350 + t.eggs.h - 4 });
  decor.sort((a, b) => a.sortY - b.sortY);
  for (const d of decor) scene.blit(d.canvas, d.x, d.y);
}

function buildScene(seed) {
  const t = loadTiles();
  const rnd = mulberry(seed);
  const scene = buildGround(t, rnd);
  placeBuildings(scene, t, mulberry(seed + 99));

  const tamerBase = loadTamer('TAMER-0001');
  const tamerAlt = loadTamer('TAMER-0002');
  const entities = [];
  const player = addTamer(entities, tamerBase, 'S', 600, 620, 'JOGADOR');
  const partnerGuilmon = addCreature(entities, '0003', 'CREATURE-0003_walk_W_01.png', 656, 626, { mirror: true });
  const p2 = addTamer(entities, tamerAlt, 'S', 760, 300, 'ASHKAI');
  const p2pet = addCreature(entities, '0011', 'CREATURE-0011_walk_S_01.png', 816, 306);
  addCreature(entities, '0002', 'CREATURE-0002_walk_W_00.png', 620, 500);
  addCreature(entities, '0005', 'CREATURE-0005_walk_S_01.png', 700, 520);
  addCreature(entities, '0008', 'CREATURE-0008_walk_S_01.png', 300, 350);

  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 11, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }
  nameLevelTag(scene, player.head.x, player.head.y - 10, 'JOGADOR', 3, W.white);
  nameLevelTag(scene, partnerGuilmon.head.x, partnerGuilmon.head.y - 8, 'GUILMON', 3, W.grassLt);
  nameLevelTag(scene, p2.head.x, p2.head.y - 10, 'ASHKAI', 2, W.white);
  nameLevelTag(scene, p2pet.head.x, p2pet.head.y - 8, 'TOKOMON', 2, W.grassLt);
  const wild = entities.filter((e) => e.name && !e.hp && e !== partnerGuilmon && e !== p2pet);
  const wildLevels = { Gigimon: 1, Koromon: 1, Tsunomon: 1 };
  for (const w of wild) nameLevelTag(scene, w.head.x, w.head.y - 8, w.name.toUpperCase(), wildLevels[w.name] || 1, W.steelLt, { wild: true });

  drawHud(scene, {
    CW, CH, timeLabel: 'DIA 09:10', bossLabel: 'ZONA SEGURA',
    logLines: ['VILA DOS BEBES (HUB)', 'ASHKAI CHEGOU A VILA', 'TOKOMON SEGUINDO ASHKAI'],
    player, team: [{ name: 'GUILMON', lv: 3, hp: 1.0 }],
  });
  return scene;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const scene = buildScene(70260411);
  scene.save(path.join(OUT, 'map_v5_vila.png'));
  console.log('vila-v5 proof scene saved');
}
main();
