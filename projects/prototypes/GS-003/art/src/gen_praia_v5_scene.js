'use strict';
// GS-003 praia-v5 "Praia dos Postes" proof scene -- same cast/HUD convention
// as the forest proof, sand+water ground from the licensed tileset, hand
// painted electric poles planted along the shoreline (ep.1 silhouette ref).
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { pngToCanvas, loadTamer, addCreature, addTamer, nameLevelTag, hpBar, drawHud } = require('./proof_hud.js');

const ENV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/praia-v5');
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
  const sand = [g('sand_00.png'), g('sand_01.png'), g('sand_02.png')];
  const waterBlob = {}; for (let m = 0; m < 16; m++) waterBlob[m] = g(`water_blob_${m}.png`);
  const waterOpen = []; for (let i = 0; i < 16; i++) waterOpen.push(g(`water_open_${String(i).padStart(2, '0')}.png`));
  const pole = p('electric_pole.png');
  return { sand, waterBlob, waterOpen, pole };
}

// Cheap position hash so adjacent open-water cells pick different glint
// variants -- avoids the large-scale repeating grid a single reused tile
// would show (see gen_praia_v5.js water review notes).
function cellHash(tx, ty) {
  const h = ((tx * 374761393 + ty * 668265263) ^ (tx * 69069 + ty)) >>> 0;
  return h;
}

// water occupies the right ~40% of the map (sea), with a wavy coastline.
function isWaterCell(tx, ty) {
  const shore = COLS * 0.58 + Math.sin(ty * 0.35) * 2.2;
  return tx > shore;
}
function neighborBitmask(mask, tx, ty) {
  const at = (x, y) => { if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true; return mask[y][x]; };
  let m = 0;
  if (at(tx, ty - 1)) m |= 1;
  if (at(tx + 1, ty)) m |= 2;
  if (at(tx, ty + 1)) m |= 4;
  if (at(tx - 1, ty)) m |= 8;
  return m;
}

function buildGround(t, rnd) {
  const scene = new Canvas(CW, CH);
  const waterMask = [];
  for (let ty = 0; ty < ROWS; ty++) { const row = []; for (let tx = 0; tx < COLS; tx++) row.push(isWaterCell(tx, ty)); waterMask.push(row); }
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      if (waterMask[ty][tx]) {
        const bm = neighborBitmask(waterMask, tx, ty);
        if (bm === 15) {
          scene.blit(t.waterOpen[cellHash(tx, ty) % t.waterOpen.length], x, y);
        } else {
          scene.blit(t.waterBlob[bm], x, y);
        }
      } else {
        scene.blit(t.sand[Math.floor(rnd() * 3)], x, y);
      }
    }
  }
  return { scene, waterMask };
}

function scatterPoles(scene, t, waterMask, rnd) {
  // poles planted in a row near the shoreline, partly in the water --
  // the iconic Digimon Adventure ep.1 "beach power lines in the sea" shot.
  const poles = [];
  for (let ty = 2; ty < ROWS - 2; ty += 3) {
    const shoreTx = Math.round(COLS * 0.58 + Math.sin(ty * 0.35) * 2.2) + Math.round((rnd() - 0.3) * 2);
    const x = shoreTx * TILE + 16, y = ty * TILE + 20;
    poles.push({ canvas: t.pole, x: Math.round(x - t.pole.w / 2), y: Math.round(y - t.pole.h + 20), sortY: y });
  }
  poles.sort((a, b) => a.sortY - b.sortY);
  for (const p of poles) scene.blit(p.canvas, p.x, p.y);
}

function buildScene(seed) {
  const t = loadTiles();
  const rnd = mulberry(seed);
  const { scene, waterMask } = buildGround(t, rnd);
  scatterPoles(scene, t, waterMask, mulberry(seed + 333));

  const tamerBase = loadTamer('TAMER-0001');
  const tamerAlt = loadTamer('TAMER-0002');
  const entities = [];
  const player = addTamer(entities, tamerBase, 'S', 300, 560, 'JOGADOR');
  const partnerGuilmon = addCreature(entities, '0003', 'CREATURE-0003_walk_W_01.png', 356, 566, { mirror: true });
  const p2 = addTamer(entities, tamerAlt, 'S', 480, 600, 'ASHKAI');
  const p2pet = addCreature(entities, '0006', 'CREATURE-0006_walk_S_01.png', 536, 606);
  const p3 = addTamer(entities, tamerAlt, 'E', 220, 420, 'MIKADO', { tint: W.waterBright, tintAlpha: 150 });
  const p3pet = addCreature(entities, '0008', 'CREATURE-0008_walk_S_01.png', 182, 432);
  addCreature(entities, '0009', 'CREATURE-0009_walk_W_01.png', 620, 240);
  const fighterA = addCreature(entities, '0009', 'CREATURE-0009_walk_W_01.png', 560, 300, { mirror: true });
  const fighterB = addCreature(entities, '0008', 'CREATURE-0008_walk_S_01.png', 640, 308);
  fighterA.hp = { cur: 38, max: 56 }; fighterB.hp = { cur: 60, max: 60 };

  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 11, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }
  hpBar(scene, fighterA.head.x, fighterA.head.y - 13, 34, 6, fighterA.hp.cur, fighterA.hp.max);
  nameLevelTag(scene, fighterA.head.x, fighterA.head.y - 21, 'GABUMON', 13, W.grassLt);
  hpBar(scene, fighterB.head.x, fighterB.head.y - 13, 34, 6, fighterB.hp.cur, fighterB.hp.max);
  nameLevelTag(scene, fighterB.head.x, fighterB.head.y - 21, 'TSUNOMON', 10, W.steelLt, { wild: true });
  nameLevelTag(scene, player.head.x, player.head.y - 10, 'JOGADOR', 18, W.white);
  nameLevelTag(scene, partnerGuilmon.head.x, partnerGuilmon.head.y - 8, 'GUILMON', 18, W.grassLt);
  nameLevelTag(scene, p2.head.x, p2.head.y - 10, 'ASHKAI', 15, W.white);
  nameLevelTag(scene, p2pet.head.x, p2pet.head.y - 8, 'AGUMON', 15, W.grassLt);
  nameLevelTag(scene, p3.head.x, p3.head.y - 10, 'MIKADO', 17, W.white);
  nameLevelTag(scene, p3pet.head.x, p3pet.head.y - 8, 'TSUNOMON', 12, W.grassLt);

  drawHud(scene, {
    CW, CH, timeLabel: 'DIA 16:05', bossLabel: 'SHELLMON 1H30',
    logLines: ['GUILMON SEGUINDO JOGADOR', 'GABUMON ENGAJOU TSUNOMON', 'GROWLMON RARO AVISTADO (18%)'],
    player, team: [{ name: 'GUILMON', lv: 18, hp: 0.9 }, { name: 'AGUMON', lv: 15, hp: 0.85 }, { name: 'TSUNOMON', lv: 12, hp: 1.0 }],
  });
  return scene;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const scene = buildScene(60260411);
  scene.save(path.join(OUT, 'map_v5_praia.png'));
  console.log('praia-v5 proof scene saved');
}
main();
