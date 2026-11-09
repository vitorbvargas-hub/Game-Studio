'use strict';
// GS-003 forest-v5 proof scene: same cast/composition/HUD convention as
// forest_v4_proof_scene.js (apples-to-apples comparison), ground/canopy now
// built from the licensed NinjaAdventure tileset instead of procedural art.
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { pngToCanvas, loadTamer, addCreature, addTamer, nameLevelTag, hpBar, drawText, drawHud } = require('./proof_hud.js');
const { naSheet, cropTiles, recolor, tiledFill } = require('./na_source.js');

const ENV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v5');
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
  const clearingStamp = g('clearing_stamp_5x4.png');
  const pathStrip = g('path_strip_2x4.png');
  const canopy = [p('canopy_clump_big.png'), p('canopy_clump_dark.png'), p('canopy_clump_strip.png')];
  const log = p('fallen_log.png'), rock = p('rock_cluster.png'), mushroom = p('mushroom_cluster.png'), leaves = p('fallen_leaves_cluster.png');
  // solid canopy-fill ground tiles (gap-free dense-forest floor, see
  // self-critique #2: stamping large circular clumps sparsely left visible
  // grass gaps between them -- a true tile fill removes every gap).
  const floor = naSheet('tileset_floor.png');
  const canopyFillCoords = [[0, 0], [4, 3], [0, 3]];
  const canopyFill = canopyFillCoords.map(([cx, cy], i) => {
    const src = cropTiles(floor, cx, cy, 1, 1);
    const t = new Canvas(32, 32);
    tiledFill(t, 0, 0, 32, 32, src, i * 23);
    return recolor(t, { hueShift: 0.25 + i * 0.01, satMul: 0.7, lightAdd: -0.16 - i * 0.03 });
  });
  return { grass, pathBlob, clearingStamp, pathStrip, canopy, log, rock, mushroom, leaves, canopyFill };
}

function wallDensity(tx, ty) {
  if (tx <= 9 || tx >= COLS - 10) return 0.97;
  if (ty <= 2) return 0.9;
  if (tx <= 13 && ty <= 17) return 0.7;
  if (tx >= COLS - 14 && ty <= 17) return 0.7;
  if (ty >= 3 && ty <= 18 && tx >= 13 && tx <= COLS - 14) return 0.0;
  return 0.25;
}
function isPathCell(tx, ty) {
  const centerRow = 11 + Math.sin(tx * 0.22) * 2.6;
  return Math.abs(ty - centerRow) < 1.6 && tx > 2 && tx < COLS - 3;
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
  const denseMask = [];
  for (let ty = 0; ty < ROWS; ty++) {
    const row = []; const drow = [];
    for (let tx = 0; tx < COLS; tx++) { row.push(isPathCell(tx, ty)); drow.push(rnd() < wallDensity(tx, ty)); }
    pathMask.push(row); denseMask.push(drow);
  }
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      if (pathMask[ty][tx]) {
        const bm = neighborBitmask(pathMask, tx, ty);
        scene.blit(t.pathBlob[bm], x, y);
      } else if (denseMask[ty][tx]) {
        // gap-free canopy-floor fill: every "dense" cell is fully painted,
        // not probabilistically stamped, so the mass reads continuous.
        scene.blit(t.canopyFill[(tx + ty) % 3], x, y);
      } else {
        scene.blit(t.grass[Math.floor(rnd() * 3)], x, y);
      }
    }
  }
  // clearing/path stamps as large decals in side forest pockets
  scene.blit(t.clearingStamp, 11 * TILE, 3 * TILE);
  scene.blit(t.pathStrip, (COLS - 10) * TILE, 15 * TILE);
  return { scene, pathMask, denseMask };
}

function scatterDecor(scene, t, pathMask, denseMask, rnd) {
  const decor = [];
  // sparse large clump props on top of the solid fill, purely for silhouette
  // variety (bumpy canopy edge) -- not responsible for gap-free coverage
  // anymore (the ground-layer fill above already guarantees that).
  for (let ty = 0; ty < ROWS; ty += 3) {
    for (let tx = 0; tx < COLS; tx += 3) {
      if (pathMask[ty] && pathMask[ty][tx]) continue;
      if (!denseMask[ty] || !denseMask[ty][tx]) continue;
      if (rnd() >= 0.55) continue;
      const x = tx * TILE + 16, y = ty * TILE + 16;
      const pick = rnd();
      let canopy;
      if (pick < 0.5) canopy = t.canopy[0]; else if (pick < 0.8) canopy = t.canopy[1]; else canopy = t.canopy[2];
      const px = Math.round(x - canopy.w / 2), py = Math.round(y - canopy.h * 0.6);
      decor.push({ canvas: canopy, x: px, y: py, sortY: y, collision: true });
    }
  }
  // scattered reused props in the open margins
  const propPicks = [t.log, t.rock, t.mushroom, t.leaves];
  for (let i = 0; i < 10; i++) {
    const tx = 11 + Math.floor(rnd() * (COLS - 22)), ty = 4 + Math.floor(rnd() * 14);
    if (pathMask[ty] && pathMask[ty][tx]) continue;
    const prop = propPicks[Math.floor(rnd() * propPicks.length)];
    const px = tx * TILE, py = ty * TILE;
    decor.push({ canvas: prop, x: px, y: py, sortY: py + prop.h - 2 });
  }
  decor.sort((a, b) => a.sortY - b.sortY);
  for (const d of decor) scene.blit(d.canvas, d.x, d.y);
}

function buildScene(seed) {
  const t = loadTiles();
  const rnd = mulberry(seed);
  const { scene, pathMask, denseMask } = buildGround(t, rnd);
  scatterDecor(scene, t, pathMask, denseMask, mulberry(seed + 777));

  const tamerBase = loadTamer('TAMER-0001');
  const tamerAlt = loadTamer('TAMER-0002');
  const entities = [];
  const player = addTamer(entities, tamerBase, 'S', 340, 590, 'JOGADOR');
  const partnerGuilmon = addCreature(entities, '0003', 'CREATURE-0003_walk_W_01.png', 398, 596, { mirror: true });
  const p2 = addTamer(entities, tamerAlt, 'S', 560, 610, 'ASHKAI');
  const p2pet = addCreature(entities, '0006', 'CREATURE-0006_walk_S_01.png', 616, 616);
  const p3 = addTamer(entities, tamerAlt, 'E', 270, 440, 'MIKADO', { tint: W.waterBright, tintAlpha: 150 });
  const p3pet = addCreature(entities, '0012', 'CREATURE-0012_walk_S_01.png', 232, 452);
  const p4 = addTamer(entities, tamerAlt, 'W', 800, 540, 'RUKA', { tint: W.purple, tintAlpha: 150 });
  const p4pet = addCreature(entities, '0009', 'CREATURE-0009_walk_W_01.png', 848, 552, { mirror: true });
  addCreature(entities, '0002', 'CREATURE-0002_walk_W_00.png', 220, 300);
  addCreature(entities, '0005', 'CREATURE-0005_walk_W_01.png', 980, 240, { mirror: true });
  addCreature(entities, '0008', 'CREATURE-0008_walk_S_01.png', 1040, 420);
  addCreature(entities, '0004', 'CREATURE-0004_walk_W_01.png', 160, 180);
  const fighterA = addCreature(entities, '0006', 'CREATURE-0006_walk_W_01.png', 660, 300, { mirror: true });
  const fighterB = addCreature(entities, '0009', 'CREATURE-0009_walk_W_01.png', 740, 308);
  fighterA.hp = { cur: 46, max: 58 }; fighterB.hp = { cur: 14, max: 64 };

  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 11, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }
  hpBar(scene, fighterA.head.x, fighterA.head.y - 13, 34, 6, fighterA.hp.cur, fighterA.hp.max);
  nameLevelTag(scene, fighterA.head.x, fighterA.head.y - 21, 'AGUMON', 11, W.grassLt);
  hpBar(scene, fighterB.head.x, fighterB.head.y - 13, 34, 6, fighterB.hp.cur, fighterB.hp.max);
  nameLevelTag(scene, fighterB.head.x, fighterB.head.y - 21, 'GABUMON', 9, W.waterBright, { wild: true });
  nameLevelTag(scene, player.head.x, player.head.y - 10, 'JOGADOR', 14, W.white);
  nameLevelTag(scene, partnerGuilmon.head.x, partnerGuilmon.head.y - 8, 'GUILMON', 14, W.grassLt);
  nameLevelTag(scene, p2.head.x, p2.head.y - 10, 'ASHKAI', 11, W.white);
  nameLevelTag(scene, p2pet.head.x, p2pet.head.y - 8, 'AGUMON', 11, W.grassLt);
  nameLevelTag(scene, p3.head.x, p3.head.y - 10, 'MIKADO', 16, W.white);
  nameLevelTag(scene, p3pet.head.x, p3pet.head.y - 8, 'PATAMON', 16, W.grassLt);
  nameLevelTag(scene, p4.head.x, p4.head.y - 10, 'RUKA', 13, W.white);
  nameLevelTag(scene, p4pet.head.x, p4pet.head.y - 8, 'GABUMON', 13, W.grassLt);
  const wild = entities.filter((e) => e.name && !e.hp && e !== partnerGuilmon && e !== p2pet && e !== p3pet && e !== p4pet);
  const wildLevels = { Gigimon: 3, Koromon: 4, Tsunomon: 5, Growlmon: 22 };
  for (const w of wild) nameLevelTag(scene, w.head.x, w.head.y - 8, w.name.toUpperCase(), wildLevels[w.name] || 5, W.steelLt, { wild: true });

  drawHud(scene, {
    CW, CH, timeLabel: 'DIA 14:32', bossLabel: 'BOSS 4H12',
    logLines: ['GUILMON SEGUINDO JOGADOR', 'AGUMON ENGAJOU GABUMON', 'GROWLMON AVISTADO A OESTE'],
    player, team: [{ name: 'GUILMON', lv: 14, hp: 0.82 }, { name: 'AGUMON', lv: 11, hp: 0.79 }, { name: 'PATAMON', lv: 16, hp: 1.0 }, { name: 'GABUMON', lv: 13, hp: 0.55 }],
  });
  return scene;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const scene = buildScene(50260411);
  scene.save(path.join(OUT, 'map_v5_floresta.png'));
  console.log('forest-v5 proof scene saved');
}
main();
