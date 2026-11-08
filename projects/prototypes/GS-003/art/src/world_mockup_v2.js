'use strict';
// GS-003 world mockup v2 -- real DW DS Tamer (TAMER-0001/0002, replacing the
// blocky tamer_placeholder), real DW DS ground textures + denser props
// (campo-dwds/floresta-dwds/agua-dwds, 3 biomes in one scene like the
// founder's concept reference), real official Digimon map sprites (already
// schema-2 in 01-creatures/CREATURE-000X), richer HUD. Run with:
// node art/src/world_mockup_v2.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');
const bp = require('./biome_props.js');
const { loadCreature, pngToCanvas } = require('./sprite_loader.js');

const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/world_mockup_v2.png');
const ENV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments');
const CHARS = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/11-characters');

const CW = 1280, CH = 720;
const TILE = 32;
const COLS = Math.ceil(CW / TILE), ROWS = Math.ceil(CH / TILE);

// ---- loaders --------------------------------------------------------------
function loadBiomeTiles(biome) {
  const dir = path.join(ENV, biome, 'tiles');
  const out = {};
  for (const f of fs.readdirSync(dir)) out[f.replace('.png', '')] = pngToCanvas(path.join(dir, f));
  return out;
}
function loadBiomeProps(biome) {
  const dir = path.join(ENV, biome, 'props');
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
    for (const f of anim.frames) {
      if (!frames[f.atlasKey]) frames[f.atlasKey] = pngToCanvas(path.join(spritesDir, f.atlasKey));
    }
    for (const dirList of Object.values(anim.dirFrames || {})) {
      for (const f of dirList) {
        if (!frames[f.atlasKey]) frames[f.atlasKey] = pngToCanvas(path.join(spritesDir, f.atlasKey));
      }
    }
  }
  return { meta, frames };
}

const campo = { tiles: loadBiomeTiles('campo-dwds'), props: loadBiomeProps('campo-dwds') };
const floresta = { tiles: loadBiomeTiles('floresta-dwds'), props: loadBiomeProps('floresta-dwds') };
const agua = { tiles: loadBiomeTiles('agua-dwds'), props: loadBiomeProps('agua-dwds') };
const tamer1 = loadTamer('TAMER-0001');
const tamer2 = loadTamer('TAMER-0002');

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

// ---------------------------------------------------------------- panel ---
function panel(c, x, y, w, h, opts = {}) {
  const bg = opts.bg || withAlpha(W.navyDk, 220);
  c.fillRect(x, y, x + w - 1, y + h - 1, bg);
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, W.ink); c.setPixel(x + i, y + h - 1, W.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, W.ink); c.setPixel(x + w - 1, y + j, W.ink); }
  c.line(x + 1, y + 1, x + w - 2, y + 1, withAlpha(W.steelLt, 100), 1);
  c.line(x + 1, y + 1, x + 1, y + h - 2, withAlpha(W.steelLt, 100), 1);
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

function nameTag(c, cx, topY, text, color) {
  const tw = text.length * 4 - 1;
  c.fillRect(cx - tw / 2 - 2, topY - 1, cx + tw / 2 + 2, topY + 6, withAlpha(W.navyDk, 210));
  drawText(c, text, Math.round(cx - tw / 2), topY, color);
}

function impactBurst(c, x, y) {
  const spikesOuter = [
    [0, -14], [5, -9], [10, -11], [7, -4], [13, -2], [6, 1],
    [10, 8], [3, 4], [1, 13], [-2, 5], [-9, 9], [-5, 1],
    [-13, 1], [-5, -3], [-9, -9], [-2, -5],
  ];
  c.fillPolygon(spikesOuter.map(([dx, dy]) => [x + dx, y + dy]), withAlpha(W.orange, 235));
  const spikesInner = spikesOuter.map(([dx, dy]) => [Math.round(dx * 0.55), Math.round(dy * 0.55)]);
  c.fillPolygon(spikesInner.map(([dx, dy]) => [x + dx, y + dy]), W.yellow);
  c.fillCircle(x, y, 3, W.white);
  c.autoOutline(withAlpha(W.redDk, 180));
}

// ---------------------------------------------------------- world build ---
// Region map: a winding river (agua) cuts the lower-right, a forest patch
// (floresta) occupies the upper-left corner, campo fills the rest -- same
// "3 biomas numa cena" composition as the founder's concept reference.
function regionAt(tx, ty) {
  // river: diagonal band
  const riverCenter = 30 + (ty - 10) * 0.9;
  if (Math.abs(tx - riverCenter) < 2.4 && tx > 18) return 'agua';
  // forest patch, upper-left
  if (tx < 11 && ty < 9) return 'floresta';
  if (tx < 7 && ty < 14) return 'floresta';
  return 'campo';
}

function buildTerrain() {
  const world = new Canvas(COLS * TILE, ROWS * TILE);
  const rnd = mulberry(777);
  const regions = [];
  for (let ty = 0; ty < ROWS; ty++) {
    const row = [];
    for (let tx = 0; tx < COLS; tx++) row.push(regionAt(tx, ty));
    regions.push(row);
  }
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      const reg = regions[ty][tx];
      const north = ty > 0 ? regions[ty - 1][tx] : reg;
      if (reg === 'agua') {
        const tile = north !== 'agua' ? agua.tiles.shore_edge_s
          : (rnd() < 0.5 ? agua.tiles.water_00 : agua.tiles.water_01);
        world.blit(tile, x, y);
      } else if (reg === 'floresta') {
        const tile = rnd() < 0.3 ? floresta.tiles.ground_grass_shade_real
          : (rnd() < 0.5 ? floresta.tiles.forest_floor_00 : floresta.tiles.forest_floor_01);
        world.blit(tile, x, y);
      } else {
        const r = rnd();
        const tile = r < 0.12 ? campo.tiles.ground_grass_real
          : r < 0.55 ? campo.tiles.grass_00 : campo.tiles.grass_01;
        world.blit(tile, x, y);
      }
    }
  }
  // winding dirt path through the campo area, from the west edge to the bridge.
  const ctrl = [[0, 15.5], [8, 14], [14, 15], [22, 12.5]];
  function centerRow(col) {
    for (let i = 0; i < ctrl.length - 1; i++) {
      const [c0, r0] = ctrl[i], [c1, r1] = ctrl[i + 1];
      if (col >= c0 && col <= c1) { const t = (col - c0) / (c1 - c0); return r0 + (r1 - r0) * t; }
    }
    return ctrl[ctrl.length - 1][1];
  }
  for (let tx = 0; tx <= 22; tx++) {
    const center = Math.round(centerRow(tx));
    for (let d = -1; d <= 1; d++) {
      const ty = center + d;
      if (ty < 0 || ty >= ROWS || regions[ty][tx] !== 'campo') continue;
      world.blit(campo.tiles.path_full, tx * TILE, ty * TILE);
    }
  }
  return { world, regions };
}

function main() {
  const { world, regions } = buildTerrain();
  const scene = world;
  const rnd = mulberry(2026);

  const entities = [];
  function addProp(canvas, x, y, footY) { entities.push({ canvas, x, y, sortY: footY }); }
  function addCreature(id, frameKey, x, y, opts = {}) {
    const { meta, frames } = loadCreature(id);
    const frame = frames[frameKey];
    const pivot = meta.pivot;
    const drawX = x - pivot.x, drawY = y - pivot.y;
    entities.push({
      canvas: opts.mirror ? frame.flipX() : frame,
      x: opts.mirror ? x - (meta.dimensions.frameW - pivot.x) : drawX,
      y: drawY,
      sortY: y,
      shadow: { cx: x, cy: y, rx: meta.anchors.shadow.rx, ry: meta.anchors.shadow.ry },
      head: { x: x - pivot.x + meta.anchors.head.x, y: y - pivot.y + meta.anchors.head.y },
      name: meta.name,
    });
    return entities[entities.length - 1];
  }
  function addTamer(tamer, dir, x, y, idTag) {
    const atlasKey = tamer.meta.animations.idle.dirFrames[dir][0].atlasKey;
    const frame = tamer.frames[atlasKey];
    const pivot = tamer.meta.pivot;
    entities.push({
      canvas: frame, x: x - pivot.x, y: y - pivot.y, sortY: y,
      shadowFoot: { cx: x, cy: y }, name: idTag,
      head: { x, y: y - pivot.y + 6 },
    });
    return entities[entities.length - 1];
  }

  // ---- scenery: dense treeline along the campo/floresta border + scattered
  // props across the open field (IdleDex/Drakantos density target, not v1's
  // sparse handful of trees).
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (regions[ty][tx] !== 'floresta') continue;
      const onEdge = regionAt(tx + 1, ty) !== 'floresta' || regionAt(tx, ty + 1) !== 'floresta'
        || regionAt(tx - 1, ty) !== 'floresta' || regionAt(tx, ty - 1) !== 'floresta';
      if (rnd() < (onEdge ? 0.85 : 0.5)) {
        const props = [floresta.props.tree_a, floresta.props.tree_b, floresta.props.tree_c];
        const tree = props[Math.floor(rnd() * props.length)];
        const px = tx * TILE + 16 + Math.round((rnd() - 0.5) * 10);
        const py = ty * TILE + 20 + Math.round((rnd() - 0.5) * 10);
        addProp(tree, px - tree.w / 2, py - tree.h + 10, py + 6);
      } else if (rnd() < 0.3) {
        const bush = rnd() < 0.5 ? floresta.props.bush_a : floresta.props.bush_b;
        const px = tx * TILE + 10, py = ty * TILE + 18;
        addProp(bush, px, py, py + bush.h - 2);
      }
    }
  }
  // campo treeline bordering the field (south/east edge of the forest patch)
  // plus scattered scenery across the open grass.
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (regions[ty][tx] !== 'campo') continue;
      const nearForest = regionAt(tx - 1, ty) === 'floresta' || regionAt(tx, ty - 1) === 'floresta';
      const nearWater = regionAt(tx + 1, ty) === 'agua' || regionAt(tx, ty + 1) === 'agua';
      const r = rnd();
      if (nearForest && r < 0.5) {
        const tree = rnd() < 0.5 ? campo.props.tree_a : campo.props.tree_b;
        const px = tx * TILE + 16, py = ty * TILE + 20;
        addProp(tree, px - tree.w / 2, py - tree.h + 10, py + 6);
      } else if (nearWater && r < 0.35) {
        const reed = rnd() < 0.5 ? agua.props.reeds_a : agua.props.reeds_b;
        const px = tx * TILE + 4, py = ty * TILE + 28;
        addProp(reed, px, py - reed.h + 6, py);
      } else if (r < 0.05) {
        const tree = rnd() < 0.5 ? campo.props.tree_a : campo.props.tree_b;
        const px = tx * TILE + 16, py = ty * TILE + 22;
        addProp(tree, px - tree.w / 2, py - tree.h + 10, py + 6);
      } else if (r < 0.10) {
        const bush = rnd() < 0.5 ? campo.props.bush_a : campo.props.bush_b;
        const px = tx * TILE + 8, py = ty * TILE + 18;
        addProp(bush, px, py, py + bush.h - 2);
      } else if (r < 0.15) {
        const fp = rnd() < 0.5 ? campo.props.flower_patch_red : campo.props.flower_patch_pink;
        const px = tx * TILE + 3, py = ty * TILE + 10;
        addProp(fp, px, py, py + fp.h - 2);
      } else if (r < 0.165) {
        addProp(campo.props.rock_cluster, tx * TILE + 5, ty * TILE + 14, ty * TILE + 14 + campo.props.rock_cluster.h - 2);
      }
    }
  }
  // water-edge dressing: lily pads + rocks + a couple of fence/signpost accents.
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (regions[ty][tx] !== 'agua') continue;
      if (rnd() < 0.08) {
        const px = tx * TILE + 10, py = ty * TILE + 12;
        addProp(agua.props.lily_pad, px, py, py + agua.props.lily_pad.h - 1);
      }
    }
  }
  addProp(campo.props.wood_signpost, 44, 300, 300 + campo.props.wood_signpost.h - 2);
  addProp(campo.props.wood_fence, 44, 340, 340 + campo.props.wood_fence.h - 4);
  addProp(campo.props.wood_fence, 76, 340, 340 + campo.props.wood_fence.h - 4);

  // -- player + partner (real Tamer sprite, real official Guilmon map sprite)
  addTamer(tamer1, 'S', 160, 500, 'JOGADOR');
  addCreature('0003', 'CREATURE-0003_walk_S_01.png', 220, 512);

  // -- wild creatures wandering (real official sprites, already in 01-creatures)
  addCreature('0006', 'CREATURE-0006_walk_S_01.png', 860, 170);
  addCreature('0012', 'CREATURE-0012_walk_S_01.png', 980, 430);
  addCreature('0002', 'CREATURE-0002_walk_W_01.png', 140, 160);
  addCreature('0008', 'CREATURE-0008_walk_S_01.png', 300, 230);

  // -- on-map combat: partner Guilmon vs wild Gabumon (facing each other,
  // W-drawn frame + mirror for the one that needs to face east -- the DW DS
  // map sprite sheets only draw S/N/W, per creature.json directions.walk).
  const guilmon = addCreature('0003', 'CREATURE-0003_walk_W_01.png', 600, 330, { mirror: true });
  const gabumon = addCreature('0009', 'CREATURE-0009_walk_W_01.png', 680, 338);
  guilmon.hp = { cur: 54, max: 70 };
  gabumon.hp = { cur: 16, max: 65 };
  const impactX = Math.round((guilmon.head.x + gabumon.head.x) / 2) + 6;
  const impactY = Math.round((guilmon.sortY + gabumon.sortY) / 2) - 36;

  // -- other player (alt Tamer, east side of the field)
  addTamer(tamer2, 'E', 1150, 150, 'JOGADOR2');
  addCreature('0005', 'CREATURE-0005_walk_S_01.png', 1110, 160);

  // ---- painter's sort + blit
  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    else if (e.shadowFoot) scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 13, 4, withAlpha(W.ink, 90));
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }

  impactBurst(scene, impactX, impactY);
  hpBar(scene, guilmon.head.x, guilmon.head.y - 12, 34, 6, guilmon.hp.cur, guilmon.hp.max);
  nameTag(scene, guilmon.head.x, guilmon.head.y - 20, 'GUILMON', W.grassLt);
  hpBar(scene, gabumon.head.x, gabumon.head.y - 12, 34, 6, gabumon.hp.cur, gabumon.hp.max);
  nameTag(scene, gabumon.head.x, gabumon.head.y - 20, 'GABUMON', W.waterBright);

  // ------------------------------------------------------------- HUD ----
  panel(scene, 10, 10, 190, 40, { bg: withAlpha(W.navyDk, 225) });
  scene.fillCircle(30, 30, 15, W.steel);
  scene.fillCircle(30, 30, 13, W.skin);
  scene.autoOutline && null;
  drawText(scene, 'TAMER LV 7', 50, 14, W.white);
  hpBar(scene, 118, 26, 76, 7, 820, 1000);
  drawText(scene, 'XP 82%', 50, 34, W.steelLt);

  panel(scene, CW - 108, 10, 98, 30, { bg: withAlpha(W.waterMid, 235) });
  drawText(scene, 'AUTO', CW - 100, 16, W.white);
  scene.fillCircle(CW - 22, 25, 4, W.hpGreen);
  scene.fillCircle(CW - 22, 25, 2, W.white);

  panel(scene, CW - 108, 44, 98, 40, { bg: withAlpha(W.navyDk, 215) });
  drawText(scene, 'MAPA', CW - 100, 50, W.steelLt);
  scene.fillRect(CW - 100, 62, CW - 20, 78, withAlpha(W.grassDk, 200));
  scene.fillRect(CW - 60, 66, CW - 56, 74, W.waterBright);

  panel(scene, 10, CH - 92, 320, 60, { bg: withAlpha(W.navyDk, 225) });
  drawText(scene, 'GUILMON ENGAJOU GABUMON', 16, CH - 86, W.hpYellow);
  drawText(scene, 'AGUMON AVISTADO A LESTE', 16, CH - 76, W.steelLt);
  drawText(scene, 'JOGADOR2 ENTROU NA AREA', 16, CH - 66, W.steelLt);

  const menuH = 40;
  panel(scene, 0, CH - menuH, CW, menuH, { bg: withAlpha(W.navyDk, 235) });
  const menuLabels = ['TIME', 'DEX', 'LOJA', 'MENU'];
  const slotW = 110;
  menuLabels.forEach((label, i) => {
    const x = 360 + i * (slotW + 14);
    panel(scene, x, CH - menuH + 4, slotW, menuH - 8, { bg: withAlpha(W.steelDk, 210) });
    const tw = label.length * 4 - 1;
    drawText(scene, label, x + Math.round((slotW - tw) / 2), CH - 20, W.white);
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  scene.save(OUT);
  console.log('World mockup v2 saved to', OUT);
}

main();
