'use strict';
// GS-003 -- forest-v4.1 proof scene. Same composition/HUD as
// forest_v4_proof_scene.js (forest-v4 baseline, left untouched for the
// comparison image) rebuilt on the v4.1 additive assets: Wang/blob-47 path
// + dense-edge autotile (no square seams), seamless dithered clearing
// floor (no dark square patches), directional cast shadow + canopy
// rim-light, and 2 extra tree types (palm + data-leaf).
// Run with: node art/src/forest_v4_1_proof_scene.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { withPreset } = require('./forest_v4_palette.js');
const { drawText } = require('./font5x3.js');
const { loadCreature, pngToCanvas } = require('./sprite_loader.js');
const gt1 = require('./forest_v4_1_tiles.js');
const gp1 = require('./forest_v4_1_props.js');

const ENV_BASE = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v4');
const CHARS = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/11-characters');
const OUT_DIR = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');

const CW = 1280, CH = 720, TILE = 32;
const COLS = Math.ceil(CW / TILE), ROWS = Math.ceil(CH / TILE);

function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadSet(dir) {
  const tiles = {}, props = {};
  for (const f of fs.readdirSync(path.join(dir, 'tiles'))) tiles[f.replace('.png', '')] = pngToCanvas(path.join(dir, 'tiles', f));
  for (const f of fs.readdirSync(path.join(dir, 'props'))) props[f.replace('.png', '')] = pngToCanvas(path.join(dir, 'props', f));
  return { tiles, props };
}

function loadTamer(id) {
  const dir = path.join(CHARS, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'character.json'), 'utf8'));
  const spritesDir = path.join(dir, 'sprites');
  const frames = {};
  for (const anim of Object.values(meta.animations)) {
    for (const f of anim.frames) if (!frames[f.atlasKey]) frames[f.atlasKey] = pngToCanvas(path.join(spritesDir, f.atlasKey));
    for (const dirList of Object.values(anim.dirFrames || {})) {
      for (const f of dirList) if (!frames[f.atlasKey]) frames[f.atlasKey] = pngToCanvas(path.join(spritesDir, f.atlasKey));
    }
  }
  return { meta, frames };
}

// ---- UI primitives (identical to forest_v4_proof_scene.js) --------------
function panel(c, x, y, w, h, opts = {}) {
  const bg = opts.bg || withAlpha(W.navyDk, 225);
  c.fillRect(x, y, x + w - 1, y + h - 1, bg);
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, W.ink); c.setPixel(x + i, y + h - 1, W.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, W.ink); c.setPixel(x + w - 1, y + j, W.ink); }
  if (opts.bevel !== false) {
    c.line(x + 1, y + 1, x + w - 2, y + 1, withAlpha(W.steelLt, 100), 1);
    c.line(x + 1, y + 1, x + 1, y + h - 2, withAlpha(W.steelLt, 100), 1);
  }
}
function hpBar(c, cx, topY, w, h, cur, max) {
  const x = cx - Math.round(w / 2);
  const ratio = Math.max(0, Math.min(1, cur / max));
  const color = ratio > 0.5 ? W.hpGreen : ratio > 0.25 ? W.hpYellow : W.hpRed;
  c.fillRect(x, topY, x + w - 1, topY + h - 1, W.navyDk);
  const fillW = Math.max(1, Math.round((w - 2) * ratio));
  c.fillRect(x + 1, topY + 1, x + 1 + fillW - 1, topY + h - 2, color);
  for (let i = 0; i < w; i++) { c.setPixel(x + i, topY, W.ink); c.setPixel(x + i, topY + h - 1, W.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, topY + j, W.ink); c.setPixel(x + w - 1, topY + j, W.ink); }
}
function nameLevelTag(c, cx, topY, name, level, color, opts = {}) {
  const text = level != null ? `${name} LV${level}` : name;
  const tw = text.length * 4 - 1;
  c.fillRect(cx - tw / 2 - 2, topY - 1, cx + tw / 2 + 2, topY + 6, withAlpha(W.navyDk, opts.wild ? 170 : 215));
  drawText(c, text, Math.round(cx - tw / 2), topY, color);
}

// ---- terrain shape (same silhouette target as forest-v4) ----------------
function wallDensity(tx, ty) {
  if (tx <= 6 || tx >= COLS - 7) return 0.92;
  if (ty <= 2) return 0.9;
  if (tx <= 10 && ty <= 17) return 0.5;
  if (tx >= COLS - 11 && ty <= 17) return 0.5;
  if (ty >= 3 && ty <= 18 && tx >= 13 && tx <= COLS - 14) return 0.0;
  if (ty >= 3 && ty <= 18 && tx >= 11 && tx <= COLS - 12) return 0.05;
  return 0.12;
}
function isClearPath(tx, ty) {
  const centerRow = 11 + Math.sin(tx * 0.22) * 2.6;
  return ty > centerRow - 5 && ty < centerRow + 6 && tx > 9 && tx < COLS - 10;
}

// 8-direction same-type neighbor mask (N,E,S,W,NE,SE,SW,NW), edge-clamped.
function neighborMask8(grid, tx, ty) {
  const at = (x, y) => { if (x < 0) x = 0; if (x >= COLS) x = COLS - 1; if (y < 0) y = 0; if (y >= ROWS) y = ROWS - 1; return grid[y][x]; };
  let m = 0;
  if (at(tx, ty - 1)) m |= 1;
  if (at(tx + 1, ty)) m |= 2;
  if (at(tx, ty + 1)) m |= 4;
  if (at(tx - 1, ty)) m |= 8;
  if (at(tx + 1, ty - 1)) m |= 16;
  if (at(tx + 1, ty + 1)) m |= 32;
  if (at(tx - 1, ty + 1)) m |= 64;
  if (at(tx - 1, ty - 1)) m |= 128;
  const N = !!(m & 1), E = !!(m & 2), S = !!(m & 4), W_ = !!(m & 8);
  const NE = !!(m & 16), SE = !!(m & 32), SW = !!(m & 64), NW = !!(m & 128);
  return gt1.normalizeMask8(N, E, S, W_, NE, SE, SW, NW);
}

function buildGround(tiles, rnd) {
  const isPath = [], isDense = [];
  for (let ty = 0; ty < ROWS; ty++) {
    const pr = [], dr = [];
    for (let tx = 0; tx < COLS; tx++) {
      const clear = isClearPath(tx, ty);
      const onWall = rnd() < wallDensity(tx, ty) && !clear;
      const pathDist = Math.abs(ty - (11 + Math.sin(tx * 0.22) * 2.6));
      pr.push(clear && pathDist < 2.3 && rnd() < 0.55);
      dr.push(onWall || (!clear && rnd() < 0.55));
    }
    isPath.push(pr); isDense.push(dr);
  }
  const scene = new Canvas(CW, CH);
  const groundKind = [];
  const clearingVariantKeys = ['clearing_floor_v41_00', 'clearing_floor_v41_01', 'clearing_floor_v41_02', 'clearing_floor_v41_03'];
  for (let ty = 0; ty < ROWS; ty++) {
    const row = [];
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      let kind;
      if (isPath[ty][tx]) {
        const mask = neighborMask8(isPath, tx, ty);
        scene.blit(tiles[gt1.maskToKey('path', mask)], x, y);
        kind = 'path';
      } else if (isDense[ty][tx]) {
        const mask = neighborMask8(isDense, tx, ty);
        scene.blit(tiles[gt1.maskToKey('denseedge', mask)], x, y);
        kind = 'floor';
      } else if (isClearPath(tx, ty)) {
        const key = clearingVariantKeys[Math.floor(rnd() * clearingVariantKeys.length)];
        scene.blit(tiles[key], x, y);
        kind = 'clearing';
      } else {
        const g = rnd();
        const variant = Math.floor(g * 6);
        scene.blit(tiles[`grass_${String(variant).padStart(2, '0')}`], x, y);
        kind = 'grass';
      }
      row.push({ kind, dense: isDense[ty][tx], clear: isClearPath(tx, ty) });
    }
    groundKind.push(row);
  }
  return { scene, groundKind };
}

const TREE_BUILDERS = ['tree_round_a', 'tree_round_b', 'tree_conifer_a', 'tree_conifer_b', 'tree_bushy_a', 'tree_bushy_b', 'tree_flowering', 'tree_birch', 'tree_ancient', 'tree_palm_digital', 'tree_data_leaf'];

function scatterTreesAndDecor(groundScene, props, decorEntities, treeTops, groundKind, ramp, rnd) {
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const cell = groundKind[ty][tx];
      if (cell.clear) continue;
      const density = wallDensity(tx, ty);
      if (rnd() >= density) {
        if (rnd() < 0.08) {
          const px = tx * TILE + 8 + rnd() * 16, py = ty * TILE + 10 + rnd() * 16;
          const clump = rnd() < 0.5 ? props.tall_grass_a : props.tall_grass_b;
          decorEntities.push({ canvas: clump, x: px - clump.w / 2, y: py - clump.h, sortY: py });
        }
        continue;
      }
      const key = TREE_BUILDERS[Math.floor(rnd() * TREE_BUILDERS.length)];
      const base = props[`${key}_base`], top = props[`${key}_top`].clone ? props[`${key}_top`].clone() : props[`${key}_top`];
      const footX = tx * TILE + 16 + Math.round((rnd() - 0.5) * 14);
      const footY = ty * TILE + 24 + Math.round((rnd() - 0.5) * 8);
      const overlapPx = Math.round(top.h * 0.42);
      const topY = footY - base.h - top.h + overlapPx;
      if (topY < 0) continue;
      // directional cast shadow (item 3: luz direcional) -- replaces the
      // v4 near-centered shadow decal with an elongated, lower-right
      // offset ellipse (away from the upper-left sun/moon).
      gp1.paintCastShadow(groundScene, ramp, footX, footY, top.w, ramp.canopyShadow);
      decorEntities.push({ canvas: base, x: footX - base.w / 2, y: footY - base.h, sortY: footY, collision: true });
      treeTops.push({ canvas: top, x: footX - top.w / 2, y: topY });
    }
  }
}

function scatterClearingDressing(entities, props, ramp, groundKind, rnd) {
  const flowerKeys = ['flower_cluster_red', 'flower_cluster_white', 'flower_cluster_purple'];
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const cell = groundKind[ty][tx];
      if (!cell.clear || cell.kind === 'path') continue;
      const r = rnd();
      if (r < 0.1) {
        const key = flowerKeys[Math.floor(rnd() * flowerKeys.length)];
        const fl = props[key];
        const px = tx * TILE + 6 + rnd() * 18, py = ty * TILE + 14 + rnd() * 12;
        entities.push({ canvas: fl, x: px - fl.w / 2, y: py - fl.h, sortY: py });
      } else if (r < 0.17) {
        const clump = rnd() < 0.5 ? props.tall_grass_a : props.tall_grass_b;
        const px = tx * TILE + 8 + rnd() * 16, py = ty * TILE + 12 + rnd() * 14;
        entities.push({ canvas: clump, x: px - clump.w / 2, y: py - clump.h, sortY: py });
      } else if (r < 0.195) {
        const rock = props.rock_cluster;
        const px = tx * TILE + 10, py = ty * TILE + 16;
        entities.push({ canvas: rock, x: px, y: py, sortY: py + rock.h - 2 });
      } else if (r < 0.21) {
        const log = props.fallen_log;
        const px = tx * TILE + 2, py = ty * TILE + 16;
        entities.push({ canvas: log, x: px, y: py, sortY: py + log.h - 2 });
      } else if (r < 0.225) {
        const m = props.mushroom_cluster;
        const px = tx * TILE + 10, py = ty * TILE + 18;
        entities.push({ canvas: m, x: px, y: py, sortY: py + m.h - 2 });
      } else if (r < 0.245) {
        const lv = props.fallen_leaves_cluster;
        const px = tx * TILE + 7, py = ty * TILE + 14;
        entities.push({ canvas: lv, x: px, y: py, sortY: py + lv.h - 2 });
      }
    }
  }
}

function applyAmbientOverlay(scene, ramp, dayLabel) {
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) scene.blendPixel(x, y, ramp.ambient);
  }
  const vig = dayLabel === 'night' ? 70 : 28;
  for (let y = 0; y < CH; y += 2) {
    for (let x = 0; x < CW; x += 2) {
      const dx = (x - CW / 2) / (CW / 2), dy = (y - CH / 2) / (CH / 2);
      const d = Math.min(1, Math.hypot(dx, dy));
      if (d > 0.72) {
        const a = Math.round((d - 0.72) / 0.28 * vig);
        scene.blendPixel(x, y, withAlpha(ramp.ink, a));
        scene.blendPixel(x + 1, y, withAlpha(ramp.ink, a));
        scene.blendPixel(x, y + 1, withAlpha(ramp.ink, a));
        scene.blendPixel(x + 1, y + 1, withAlpha(ramp.ink, a));
      }
    }
  }
}

function buildScene(label, ramp, seedBase) {
  const { tiles: baseTiles, props: baseProps } = loadSet(label === 'day' ? ENV_BASE : path.join(ENV_BASE, 'night'));
  // merge v4 + v4.1 additive sets (loadSet already globs the whole dir, so
  // the new path_w47_*/denseedge_w47_*/clearing_floor_v41_*/tree_palm_*/
  // tree_data_leaf_* files are already present in baseTiles/baseProps)
  const tiles = baseTiles, props = baseProps;
  // rim-light every tree canopy-top in-memory for this render only (does
  // not touch the saved v4 prop PNGs -- item 3, "rim-light leve")
  for (const key of Object.keys(props)) if (key.endsWith('_top')) gp1.applyCanopyRimLight(props[key], ramp, 0.6);

  const tamerBase = loadTamer('TAMER-0001');
  const tamerAlt = loadTamer('TAMER-0002');

  const rnd = mulberry(seedBase);
  const { scene, groundKind } = buildGround(tiles, rnd);

  const decorEntities = [];
  const treeTops = [];
  scatterTreesAndDecor(scene, props, decorEntities, treeTops, groundKind, ramp, mulberry(seedBase + 777));
  scatterClearingDressing(decorEntities, props, ramp, groundKind, mulberry(seedBase + 4242));

  const entities = [...decorEntities];
  function addCreature(id, frameKey, x, y, opts = {}) {
    const { meta, frames } = loadCreature(id);
    let frame = frames[frameKey];
    if (opts.mirror) frame = frame.flipX();
    const pivot = meta.pivot;
    const drawX = opts.mirror ? x - (meta.dimensions.frameW - pivot.x) : x - pivot.x;
    const drawY = y - pivot.y;
    const e = { canvas: frame, x: drawX, y: drawY, sortY: y, shadow: { cx: x, cy: y, rx: meta.anchors.shadow.rx, ry: meta.anchors.shadow.ry }, head: { x: x - pivot.x + meta.anchors.head.x, y: y - pivot.y + meta.anchors.head.y }, name: meta.name };
    entities.push(e);
    return e;
  }
  function addTamer(tamer, dir, x, y, idTag, opts = {}) {
    const atlasKey = tamer.meta.animations.idle.dirFrames[dir][0].atlasKey;
    let frame = tamer.frames[atlasKey];
    if (opts.tint) frame = frame.tint(opts.tint, opts.tintAlpha || 130);
    const pivot = tamer.meta.pivot;
    const e = { canvas: frame, x: x - pivot.x, y: y - pivot.y, sortY: y, shadowFoot: { cx: x, cy: y }, name: idTag, head: { x, y: y - pivot.y + 6 } };
    entities.push(e);
    return e;
  }

  const player = addTamer(tamerBase, 'S', 340, 590, 'JOGADOR');
  const partnerGuilmon = addCreature('0003', 'CREATURE-0003_walk_W_01.png', 398, 596, { mirror: true });
  const p2 = addTamer(tamerAlt, 'S', 560, 610, 'ASHKAI');
  const p2pet = addCreature('0006', 'CREATURE-0006_walk_S_01.png', 616, 616);

  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 11, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }

  nameLevelTag(scene, player.head.x, player.head.y - 10, 'JOGADOR', 14, W.white);
  nameLevelTag(scene, partnerGuilmon.head.x, partnerGuilmon.head.y - 8, 'GUILMON', 14, W.grassLt);
  nameLevelTag(scene, p2.head.x, p2.head.y - 10, 'ASHKAI', 11, W.white);
  nameLevelTag(scene, p2pet.head.x, p2pet.head.y - 8, 'AGUMON', 11, W.grassLt);

  for (const t of treeTops) scene.blit(t.canvas, Math.round(t.x), Math.round(t.y));

  applyAmbientOverlay(scene, ramp, label);

  panel(scene, 10, 10, 140, 26, { bg: withAlpha(W.navyDk, 210) });
  drawText(scene, label === 'day' ? 'DIA 14:32' : 'NOITE 22:10', 18, 17, W.steelLt);
  panel(scene, CW - 118, 10, 108, 26, { bg: withAlpha(W.waterMid, 225) });
  drawText(scene, 'AUTO ON', CW - 110, 17, W.white);

  const hudH = 60;
  panel(scene, 10, CH - hudH - 40, 340, 32, { bg: withAlpha(W.navyDk, 220) });
  drawText(scene, 'FOREST-V4.1 -- WANG-47 PATH + LUZ DIRECIONAL', 16, CH - hudH - 32, W.hpYellow);
  panel(scene, 0, CH - hudH, CW, hudH, { bg: withAlpha(W.navyDk, 235) });
  drawText(scene, 'CAMINHO: WANG/BLOB-47 (SEM COSTURA QUADRADA)  |  CLAREIRA: DITHER SEM MANCHAS  |  SOMBRA DIRECIONAL + RIM-LIGHT', 16, CH - hudH + 20, W.steelLt);

  return scene;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const daySeed = 20260411, nightSeed = 20260412;
  const day = buildScene('day', withPreset(true), daySeed);
  day.save(path.join(OUT_DIR, 'forest_v4_day_v41.png'));
  const night = buildScene('night', withPreset(false), nightSeed);
  night.save(path.join(OUT_DIR, 'forest_v4_night_v41.png'));
  console.log('forest-v4.1 proof scenes saved to', OUT_DIR);
}

main();
