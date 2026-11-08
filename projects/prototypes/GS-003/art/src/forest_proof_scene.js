'use strict';
// GS-003 -- GS-004 §4 / ADR-010 canonical visual proof: a forest map in the
// canonical reference's composition (dense packed canopy walls framing an
// open clearing, player + other players + official Digimon partners + wild
// Digimon, names/levels over every entity, on-map combat with an elaborate
// ability effect, bottom HUD with minimap/inventory/shortcuts/XP/team box).
// Run with: node art/src/forest_proof_scene.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');
const fv3 = require('./forest_v3_props.js');
const { loadCreature, pngToCanvas } = require('./sprite_loader.js');

const OUT_DIR = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');
const ENV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v3');
const CHARS = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/11-characters');

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

// ---- loaders ---------------------------------------------------------------
function loadTiles() {
  const dir = path.join(ENV, 'tiles');
  const out = {};
  for (const f of fs.readdirSync(dir)) out[f.replace('.png', '')] = pngToCanvas(path.join(dir, f));
  return out;
}
function loadProps() {
  const dir = path.join(ENV, 'props');
  const out = {};
  for (const f of fs.readdirSync(dir)) out[f.replace('.png', '')] = pngToCanvas(path.join(dir, f));
  return out;
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

const tiles = loadTiles();
const props = loadProps();
const tamerBase = loadTamer('TAMER-0001');
const tamerAlt = loadTamer('TAMER-0002');

// ---- UI primitives ----------------------------------------------------------
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

// ---- elaborate combat VFX ---------------------------------------------------
function slashArc(c, x, y, angle, color) {
  const pts = [];
  const r0 = 10, r1 = 30;
  for (let i = 0; i <= 10; i++) {
    const a = angle - 0.9 + (i / 10) * 1.8;
    pts.push([x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.6]);
  }
  for (let i = 10; i >= 0; i--) {
    const a = angle - 0.9 + (i / 10) * 1.8;
    pts.push([x + Math.cos(a) * r0, y + Math.sin(a) * r0 * 0.6]);
  }
  c.fillPolygon(pts, withAlpha(color, 210));
}
function abilityImpact(c, x, y) {
  // layered radial burst: outer red rim -> orange -> yellow -> white core
  const spikesOuter = [
    [0, -22], [8, -14], [16, -17], [11, -6], [21, -3], [10, 2],
    [16, 13], [5, 6], [2, 21], [-3, 8], [-14, 15], [-8, 2],
    [-21, 2], [-8, -5], [-14, -14], [-3, -8],
  ];
  c.fillPolygon(spikesOuter.map(([dx, dy]) => [x + dx, y + dy]), withAlpha(W.redDk, 220));
  const mid = spikesOuter.map(([dx, dy]) => [Math.round(dx * 0.72), Math.round(dy * 0.72)]);
  c.fillPolygon(mid.map(([dx, dy]) => [x + dx, y + dy]), withAlpha(W.orange, 235));
  const inner = spikesOuter.map(([dx, dy]) => [Math.round(dx * 0.4), Math.round(dy * 0.4)]);
  c.fillPolygon(inner.map(([dx, dy]) => [x + dx, y + dy]), W.yellow);
  c.fillCircle(x, y, 5, W.white);
  c.autoOutline(withAlpha(W.redDk, 160));
  // two crossing slash arcs for "elaborate ability" read
  slashArc(c, x, y, -0.5, withAlpha(W.waterBright, 230));
  slashArc(c, x, y, 2.6, withAlpha(W.pinkLt, 220));
  // scatter sparks
  const rnd = mulberry(x * 13 + y * 7);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2, r = 24 + rnd() * 26;
    const px = Math.round(x + Math.cos(a) * r), py = Math.round(y + Math.sin(a) * r * 0.6);
    c.fillCircle(px, py, rnd() < 0.3 ? 2 : 1, rnd() < 0.5 ? W.yellow : W.white);
  }
}
function motionTrail(c, fromX, fromY, toX, toY, color) {
  for (let i = 0; i < 4; i++) {
    const t = i / 4;
    const x = Math.round(fromX + (toX - fromX) * t);
    const y = Math.round(fromY + (toY - fromY) * t);
    c.line(x, y, x + 6, y, withAlpha(color, 120 - i * 20), 1);
  }
}
function scorchMark(c, cx, cy) {
  c.fillEllipse(cx, cy, 26, 9, withAlpha(W.ink, 110));
  c.fillEllipse(cx, cy, 18, 6, withAlpha(W.redDk, 90));
}

// ---- terrain -----------------------------------------------------------
// Dense packed canopy walls (left/right/top) around an open central clearing,
// matching the canonical reference's "forest frames the walkable area" read.
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
  // winding clearing/path corridor so the dense scatter above never fully
  // blocks the walkable area the entities stand in.
  const centerRow = 11 + Math.sin(tx * 0.22) * 2.6;
  return ty > centerRow - 5 && ty < centerRow + 6 && tx > 9 && tx < COLS - 10;
}

function buildGround(rnd) {
  const scene = new Canvas(CW, CH);
  const groundKind = []; // per-tile: 'path' | 'clearing' | 'floor'
  for (let ty = 0; ty < ROWS; ty++) {
    const row = [];
    for (let tx = 0; tx < COLS; tx++) {
      const clear = isClearPath(tx, ty);
      const onWall = rnd() < wallDensity(tx, ty) && !clear;
      const x = tx * TILE, y = ty * TILE;
      let kind;
      if (clear) {
        const r = rnd();
        const pathDist = Math.abs(ty - (11 + Math.sin(tx * 0.22) * 2.6));
        if (pathDist < 1.6 && r < 0.6) {
          scene.blit(tiles.path_rich, x, y); kind = 'path';
        } else if (pathDist < 2.3 && r < 0.3) {
          scene.blit(r < 0.15 ? tiles.path_edge_s : tiles.path_corner_ne, x, y); kind = 'path';
        } else {
          const g = r < 0.33 ? tiles.grass_rich_00 : r < 0.66 ? tiles.grass_rich_01 : tiles.grass_rich_02;
          scene.blit(g, x, y); kind = 'clearing';
        }
      } else if (onWall) {
        const r = rnd();
        scene.blit(r < 0.5 ? tiles.forest_floor_00 : r < 0.8 ? tiles.forest_floor_01 : tiles.forest_floor_02, x, y);
        kind = 'floor';
      } else {
        const r = rnd();
        scene.blit(r < 0.5 ? tiles.forest_floor_01 : tiles.forest_floor_02, x, y);
        kind = 'floor';
      }
      row.push({ kind, onWall, clear });
    }
    groundKind.push(row);
  }
  return { scene, groundKind };
}

function scatterTrees(entities, groundKind, rnd) {
  const roundSet = ['tree_round_a', 'tree_round_b'];
  const coniferSet = ['tree_conifer_a', 'tree_conifer_b'];
  const bushySet = ['tree_bushy_a', 'tree_bushy_b'];
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const cell = groundKind[ty][tx];
      if (cell.clear) continue;
      const density = wallDensity(tx, ty);
      if (rnd() >= density) {
        // sparse undergrowth dressing even where no tree spawned
        if (rnd() < 0.08) {
          const px = tx * TILE + 8 + rnd() * 16, py = ty * TILE + 10 + rnd() * 16;
          const clump = rnd() < 0.5 ? props.tall_grass_a : props.tall_grass_b;
          entities.push({ canvas: clump, x: px - clump.w / 2, y: py - clump.h, sortY: py });
        }
        continue;
      }
      const r = rnd();
      let key;
      if (r < 0.1) key = 'tree_flowering';
      else if (r < 0.42) key = roundSet[rnd() < 0.5 ? 0 : 1];
      else if (r < 0.72) key = coniferSet[rnd() < 0.5 ? 0 : 1];
      else key = bushySet[rnd() < 0.5 ? 0 : 1];
      const tree = props[key];
      const px = tx * TILE + 16 + Math.round((rnd() - 0.5) * 14);
      const py = ty * TILE + 20 + Math.round((rnd() - 0.5) * 10);
      entities.push({ canvas: tree, x: px - tree.w / 2, y: py - tree.h + 14, sortY: py + 8 });
    }
  }
}

function scatterClearingDressing(entities, groundKind, rnd) {
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
      } else if (r < 0.16) {
        const clump = rnd() < 0.5 ? props.tall_grass_a : props.tall_grass_b;
        const px = tx * TILE + 8 + rnd() * 16, py = ty * TILE + 12 + rnd() * 14;
        entities.push({ canvas: clump, x: px - clump.w / 2, y: py - clump.h, sortY: py });
      } else if (r < 0.185) {
        const rock = props.rock_cluster;
        const px = tx * TILE + 10, py = ty * TILE + 16;
        entities.push({ canvas: rock, x: px, y: py, sortY: py + rock.h - 2 });
      } else if (r < 0.2) {
        const log = props.fallen_log;
        const px = tx * TILE + 2, py = ty * TILE + 16;
        entities.push({ canvas: log, x: px, y: py, sortY: py + log.h - 2 });
      } else if (r < 0.215) {
        const m = props.mushroom_cluster;
        const px = tx * TILE + 10, py = ty * TILE + 18;
        entities.push({ canvas: m, x: px, y: py, sortY: py + m.h - 2 });
      }
    }
  }
}

// ---- main --------------------------------------------------------------
function main() {
  const rnd = mulberry(20260411);
  const { scene, groundKind } = buildGround(rnd);

  const entities = [];
  scatterTrees(entities, groundKind, mulberry(777));
  scatterClearingDressing(entities, groundKind, mulberry(4242));

  function addCreature(id, frameKey, x, y, opts = {}) {
    const { meta, frames } = loadCreature(id);
    let frame = frames[frameKey];
    if (opts.mirror) frame = frame.flipX();
    const pivot = meta.pivot;
    const drawX = opts.mirror ? x - (meta.dimensions.frameW - pivot.x) : x - pivot.x;
    const drawY = y - pivot.y;
    const e = {
      canvas: frame, x: drawX, y: drawY, sortY: y,
      shadow: { cx: x, cy: y, rx: meta.anchors.shadow.rx, ry: meta.anchors.shadow.ry },
      head: { x: x - pivot.x + meta.anchors.head.x, y: y - pivot.y + meta.anchors.head.y },
      name: meta.name,
    };
    entities.push(e);
    return e;
  }
  function addTamer(tamer, dir, x, y, idTag, opts = {}) {
    const atlasKey = tamer.meta.animations.idle.dirFrames[dir][0].atlasKey;
    let frame = tamer.frames[atlasKey];
    if (opts.tint) frame = frame.tint(opts.tint, opts.tintAlpha || 130);
    const pivot = tamer.meta.pivot;
    const e = {
      canvas: frame, x: x - pivot.x, y: y - pivot.y, sortY: y,
      shadowFoot: { cx: x, cy: y }, name: idTag,
      head: { x, y: y - pivot.y + 6 },
    };
    entities.push(e);
    return e;
  }

  // ---- player + 3 other players, each with an official Digimon partner ----
  const player = addTamer(tamerBase, 'S', 340, 590, 'JOGADOR');
  const partnerGuilmon = addCreature('0003', 'CREATURE-0003_walk_W_01.png', 398, 596, { mirror: true });

  const p2 = addTamer(tamerAlt, 'S', 560, 610, 'ASHKAI');
  const p2pet = addCreature('0006', 'CREATURE-0006_walk_S_01.png', 616, 616);

  const p3 = addTamer(tamerAlt, 'E', 270, 440, 'MIKADO', { tint: W.waterBright, tintAlpha: 150 });
  const p3pet = addCreature('0012', 'CREATURE-0012_walk_S_01.png', 232, 452);

  const p4 = addTamer(tamerAlt, 'W', 800, 540, 'RUKA', { tint: W.purple, tintAlpha: 150 });
  const p4pet = addCreature('0009', 'CREATURE-0009_walk_W_01.png', 848, 552, { mirror: true });

  // ---- ambient wild Digimon (not following anyone) ----
  addCreature('0002', 'CREATURE-0002_walk_W_01.png', 220, 300);
  addCreature('0005', 'CREATURE-0005_walk_W_01.png', 980, 240, { mirror: true });
  addCreature('0008', 'CREATURE-0008_walk_S_01.png', 1040, 420);
  addCreature('0004', 'CREATURE-0004_walk_W_01.png', 160, 180);

  // ---- on-map combat: player 2's Agumon vs a wild Gabumon, with an
  // elaborate multi-layer ability effect (burst + crossing slash arcs +
  // sparks + scorch mark + motion trail), matching GS-004 §4.
  const fighterA = addCreature('0006', 'CREATURE-0006_walk_W_01.png', 660, 300, { mirror: true });
  const fighterB = addCreature('0009', 'CREATURE-0009_walk_W_01.png', 740, 308);
  fighterA.hp = { cur: 46, max: 58 };
  fighterB.hp = { cur: 14, max: 64 };
  const impactX = Math.round((fighterA.head.x + fighterB.head.x) / 2) + 4;
  const impactY = Math.round((fighterA.sortY + fighterB.sortY) / 2) - 30;

  // painter's sort + blit
  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 11, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }

  scorchMark(scene, impactX, impactY + 22);
  motionTrail(scene, fighterA.head.x - 20, fighterA.sortY - 10, impactX, impactY, W.yellow);
  abilityImpact(scene, impactX, impactY);
  hpBar(scene, fighterA.head.x, fighterA.head.y - 13, 34, 6, fighterA.hp.cur, fighterA.hp.max);
  nameLevelTag(scene, fighterA.head.x, fighterA.head.y - 21, 'AGUMON', 11, W.grassLt);
  hpBar(scene, fighterB.head.x, fighterB.head.y - 13, 34, 6, fighterB.hp.cur, fighterB.hp.max);
  nameLevelTag(scene, fighterB.head.x, fighterB.head.y - 21, 'GABUMON', 9, W.waterBright, { wild: true });

  // ---- name/level tags over every player + partner + wild creature ----
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
  for (const w of wild) {
    nameLevelTag(scene, w.head.x, w.head.y - 8, w.name.toUpperCase(), wildLevels[w.name] || 5, W.steelLt, { wild: true });
  }

  // ------------------------------------------------------------- HUD ----
  // top-left: light clock/weather panel
  panel(scene, 10, 10, 140, 26, { bg: withAlpha(W.navyDk, 210) });
  drawText(scene, 'DIA 14:32', 18, 17, W.steelLt);
  // top-right: light auto-hunt + event panel
  panel(scene, CW - 118, 10, 108, 26, { bg: withAlpha(W.waterMid, 225) });
  drawText(scene, 'AUTO ON', CW - 110, 17, W.white);
  panel(scene, CW - 150, 42, 140, 24, { bg: withAlpha(W.navyDk, 205) });
  drawText(scene, 'BOSS 4H12', CW - 142, 49, W.hpYellow);

  // bottom-left: small chat/log panel, above the HUD bar
  const hudH = 108;
  panel(scene, 10, CH - hudH - 58, 300, 50, { bg: withAlpha(W.navyDk, 220) });
  drawText(scene, 'GUILMON SEGUINDO JOGADOR', 16, CH - hudH - 52, W.steelLt);
  drawText(scene, 'AGUMON ENGAJOU GABUMON', 16, CH - hudH - 42, W.hpYellow);
  drawText(scene, 'GROWLMON AVISTADO A OESTE', 16, CH - hudH - 32, W.steelLt);

  // bottom HUD bar
  panel(scene, 0, CH - hudH, CW, hudH, { bg: withAlpha(W.navyDk, 235) });

  // minimap (bottom-left)
  const mmX = 14, mmY = CH - hudH + 10, mmW = 92, mmH = 88;
  panel(scene, mmX, mmY, mmW, mmH, { bg: withAlpha(W.navyDk, 230) });
  const thumb = scene; // sample from the already-drawn world for a believable thumbnail
  for (let ty = 0; ty < mmH - 6; ty++) {
    for (let tx = 0; tx < mmW - 6; tx++) {
      const sx = Math.floor((tx / (mmW - 6)) * CW);
      const sy = Math.floor((ty / (mmH - 6)) * (CH - hudH));
      scene.setPixel(mmX + 3 + tx, mmY + 3 + ty, thumb.getPixel(sx, sy));
    }
  }
  scene.fillCircle(mmX + 3 + Math.round((player.head.x / CW) * (mmW - 6)), mmY + 3 + Math.round((player.sortY / (CH - hudH)) * (mmH - 6)), 2, W.hpRed);
  panel(scene, mmX, mmY, mmW, mmH, { bg: [0, 0, 0, 0], bevel: false });

  // inventory row
  const invX = mmX + mmW + 10, invY = mmY, slot = 30;
  panel(scene, invX, invY, slot * 6 + 8, 34, { bg: withAlpha(W.steelDk, 215) });
  for (let i = 0; i < 6; i++) {
    const sx = invX + 4 + i * slot;
    panel(scene, sx, invY + 4, slot - 2, 26, { bg: withAlpha(W.navy, 220), bevel: false });
    scene.fillCircle(sx + (slot - 2) / 2, invY + 17, 6, [W.grassLt, W.red, W.steel, W.gold, W.pinkLt, W.waterBright][i]);
  }
  drawText(scene, 'INVENTARIO', invX + 4, invY + 40, W.steelLt);

  // shortcut row (abilities)
  const scX = invX, scY = invY + 50, scSlot = 30;
  panel(scene, scX, scY, scSlot * 4 + 8, 34, { bg: withAlpha(W.steelDk, 215) });
  for (let i = 0; i < 4; i++) {
    const sx = scX + 4 + i * scSlot;
    panel(scene, sx, scY + 4, scSlot - 2, 26, { bg: withAlpha(W.navy, 220), bevel: false });
    drawText(scene, String(i + 1), sx + 10, scY + 14, W.hpYellow);
  }

  // XP bar (center)
  const xpW = 360, xpX = Math.round(CW / 2 - xpW / 2), xpY = CH - hudH + 16;
  panel(scene, xpX, xpY, xpW, 20, { bg: withAlpha(W.navyDk, 225) });
  const xpRatio = 0.62;
  scene.fillRect(xpX + 2, xpY + 2, xpX + 2 + Math.round((xpW - 4) * xpRatio), xpY + 17, W.hpYellow);
  drawText(scene, 'NIVEL 14', xpX + 6, xpY + 24, W.white);
  panel(scene, xpX, xpY + 36, xpW, 18, { bg: withAlpha(W.navyDk, 200) });
  drawText(scene, 'EXP 62%', xpX + 6, xpY + 41, W.steelLt);

  // team box (bottom-right) -- party Digimon with level + HP mini-bar
  const team = [
    { name: 'GUILMON', lv: 14, hp: 0.82 },
    { name: 'AGUMON', lv: 11, hp: 0.79 },
    { name: 'PATAMON', lv: 16, hp: 1.0 },
    { name: 'GABUMON', lv: 13, hp: 0.55 },
  ];
  const teamSlot = 68, teamX = CW - 14 - teamSlot * team.length - 8, teamY = mmY;
  panel(scene, teamX - 4, teamY, teamSlot * team.length + 12, mmH, { bg: withAlpha(W.steelDk, 215) });
  team.forEach((t, i) => {
    const sx = teamX + 4 + i * teamSlot;
    panel(scene, sx, teamY + 6, teamSlot - 6, mmH - 12, { bg: withAlpha(W.navy, 220), bevel: false });
    drawText(scene, `LV${t.lv}`, sx + 4, teamY + 10, W.hpYellow);
    drawText(scene, t.name.slice(0, 8), sx + 4, teamY + 20, W.white);
    scene.fillCircle(sx + (teamSlot - 6) / 2, teamY + mmH / 2 + 4, 10, W.navyDk);
    scene.fillCircle(sx + (teamSlot - 6) / 2, teamY + mmH / 2 + 4, 8, t.hp > 0.5 ? W.hpGreen : W.hpYellow);
    hpBar(scene, sx + (teamSlot - 6) / 2, teamY + mmH - 14, teamSlot - 12, 6, Math.round(t.hp * 100), 100);
  });

  fs.mkdirSync(OUT_DIR, { recursive: true });
  scene.save(path.join(OUT_DIR, 'proof_forest_v1.png'));
  scene.scaleNearest(2).save(path.join(OUT_DIR, 'proof_forest_v1@2x.png'));
  console.log('Proof scene saved to', OUT_DIR);
}

main();
