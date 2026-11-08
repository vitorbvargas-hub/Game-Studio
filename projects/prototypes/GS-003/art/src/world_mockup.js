'use strict';
// GS-003 world mockup v1 -- grass biome, real creature sprites, on-map combat,
// IdleDex-style HUD. Run with: node art/src/world_mockup.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');
const bt = require('./biome_tiles.js');
const bp = require('./biome_props.js');
const { loadCreature } = require('./sprite_loader.js');
const { tamer } = require('./tamer_placeholder.js');

const OUT = path.resolve(
  __dirname, '../../../../../assets/GAME-ASSETS/09-previews/world_mockup_v1.png'
);

const CW = 1280, CH = 720;
const TILE = 32;
const COLS = Math.ceil(CW / TILE), ROWS = Math.ceil(CH / TILE);

// ---------------------------------------------------------------- panel ---
function panel(c, x, y, w, h, opts = {}) {
  const bg = opts.bg || withAlpha(W.navyDk, 215);
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

// Simple layered starburst impact -- "efeito de golpe sem exagero" (no
// downloadable CC0 explosion frame this session, see DECISIONS.md).
function impactBurst(c, x, y, seed) {
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
function buildTerrain() {
  const world = new Canvas(COLS * TILE, ROWS * TILE);
  // Winding dirt path: control points (col -> center row), gentle slope so
  // a 3-tile band stays contiguous between columns (see gen_biomes.js note).
  const ctrl = [[0, 17.5], [9, 15.5], [17, 16.5], [25, 11], [32, 8], [39, 6]];
  function centerRow(col) {
    for (let i = 0; i < ctrl.length - 1; i++) {
      const [c0, r0] = ctrl[i], [c1, r1] = ctrl[i + 1];
      if (col >= c0 && col <= c1) {
        const t = (col - c0) / (c1 - c0);
        return r0 + (r1 - r0) * t;
      }
    }
    return ctrl[ctrl.length - 1][1];
  }
  const pathEdgeTop = bt.pathEdgeTile(104);
  const pathEdgeBottom = pathEdgeTop.flipY();
  const pathFull = bt.pathTileFull(103);
  const pathRows = new Map(); // "tx,ty" -> 'top'|'mid'|'bottom'
  for (let tx = 0; tx < COLS; tx++) {
    const center = Math.round(centerRow(tx));
    for (let d = -1; d <= 1; d++) {
      const ty = center + d;
      if (ty < 0 || ty >= ROWS) continue;
      const role = d === -1 ? 'top' : d === 1 ? 'bottom' : 'mid';
      pathRows.set(`${tx},${ty}`, role);
    }
  }

  let gseed = 900;
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const x = tx * TILE, y = ty * TILE;
      const role = pathRows.get(`${tx},${ty}`);
      if (role === 'mid') world.blit(pathFull, x, y);
      else if (role === 'top') world.blit(pathEdgeTop, x, y);
      else if (role === 'bottom') world.blit(pathEdgeBottom, x, y);
      else {
        const variant = (tx * 7 + ty * 13 + gseed) % 5 === 0 ? 1 : 0;
        world.blit(bt.grassTileVariant(variant, 500 + tx * 31 + ty * 17), x, y);
      }
    }
  }
  return { world, pathRows };
}

function main() {
  const { world } = buildTerrain();
  const scene = world; // compose directly onto the terrain canvas

  // ---- entities, painter's-order list (sorted by feet Y before blitting)
  const entities = [];

  function addProp(canvas, x, y, footY) {
    entities.push({ canvas, x, y, sortY: footY });
  }
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
  function addTamerEntity(x, y, opts) {
    const spr = tamer(opts);
    entities.push({ canvas: spr, x: x - 28, y: y - 103, sortY: y, shadowFoot: { cx: x, cy: y } });
  }

  // -- scenery: trees, bushes, rocks, flowers, signpost, fence
  const treeSeeds = [
    [11, 60, 40], [17, 230, 30], [11, 1040, 30], [17, 1180, 90],
    [11, 420, 560], [17, 980, 560], [11, 40, 660],
  ];
  for (const [s, px, py] of treeSeeds) addProp(bp.treeBig(s), px, py, py + 86);
  addProp(bp.bush(21, null), 110, 330, 348);
  addProp(bp.bush(23, W.pink), 640, 250, 268);
  addProp(bp.bush(25, null), 1100, 300, 318);
  addProp(bp.rockCluster(27), 420, 180, 194);
  addProp(bp.rockCluster(29), 760, 540, 554);
  addProp(bp.flowerPatch(31, W.red), 300, 420, 430);
  addProp(bp.flowerPatch(33, W.waterBright), 500, 560, 570);
  addProp(bp.flowerPatch(35, W.pink), 860, 460, 470);
  addProp(bp.flowerPatch(39, W.red), 70, 560, 570);
  addProp(bp.woodSignpost(37), 70, 420, 447);
  addProp(bp.woodFence(41), 1180, 540, 558);
  addProp(bp.bush(45, null), 260, 560, 578);

  // -- player + partner
  addTamerEntity(160, 512, { step: 1, shirt: W.waterBright, shirtDk: W.waterMid, cap: W.red, capDk: W.redDk });
  addCreature('0003', 'CREATURE-0003_idle_SW_00.png', 232, 528);

  // -- wild creatures (not in combat)
  addCreature('0006', 'CREATURE-0006_idle_SW_00.png', 900, 190);
  addCreature('0012', 'CREATURE-0012_idle_S_00.png', 1040, 440);

  // -- on-map combat: partner Guilmon vs wild Gabumon
  const guilmon = addCreature('0003', 'CREATURE-0003_idle_SW_01.png', 590, 330);
  const gabumon = addCreature('0009', 'CREATURE-0009_idle_SW_02.png', 672, 336, { mirror: true });
  guilmon.hp = { cur: 54, max: 70 };
  gabumon.hp = { cur: 16, max: 65 };
  const impactX = Math.round((guilmon.head.x + gabumon.head.x) / 2) + 6;
  const impactY = Math.round((guilmon.sortY + gabumon.sortY) / 2) - 36;

  // -- other player, background
  addTamerEntity(1140, 150, { step: -1, shirt: W.pink, shirtDk: W.purple, cap: W.steelLt, capDk: W.steel, hair: W.dirtDk });

  // ---- painter's sort + blit
  entities.sort((a, b) => a.sortY - b.sortY);
  for (const e of entities) {
    if (e.shadow) {
      scene.fillEllipse(e.shadow.cx, e.shadow.cy, e.shadow.rx, e.shadow.ry, withAlpha(W.ink, 90));
    } else if (e.shadowFoot) {
      scene.fillEllipse(e.shadowFoot.cx, e.shadowFoot.cy, 15, 4, withAlpha(W.ink, 90));
    }
    scene.blit(e.canvas, Math.round(e.x), Math.round(e.y));
  }

  // -- combat overlay: impact burst + HP bars + name tags (always on top of
  // the fighters, same as the concept art's floating bars)
  impactBurst(scene, impactX, impactY, 1);
  hpBar(scene, guilmon.head.x, guilmon.head.y - 12, 34, 6, guilmon.hp.cur, guilmon.hp.max);
  nameTag(scene, guilmon.head.x, guilmon.head.y - 20, 'GUILMON', W.grassLt);
  hpBar(scene, gabumon.head.x, gabumon.head.y - 12, 34, 6, gabumon.hp.cur, gabumon.hp.max);
  nameTag(scene, gabumon.head.x, gabumon.head.y - 20, 'GABUMON', W.waterBright);

  // ------------------------------------------------------------- HUD ----
  panel(scene, 10, 10, 148, 24);
  drawText(scene, 'TAMER LV 7', 16, 15, W.white);

  panel(scene, CW - 108, 10, 98, 30, { bg: withAlpha(W.waterMid, 235) });
  drawText(scene, 'AUTO', CW - 100, 16, W.white);
  scene.fillCircle(CW - 22, 25, 4, W.hpGreen);
  scene.fillCircle(CW - 22, 25, 2, W.white);

  panel(scene, 10, CH - 92, 300, 60, { bg: withAlpha(W.navyDk, 225) });
  drawText(scene, 'GUILMON ENGAJOU GABUMON', 16, CH - 86, W.hpYellow);
  drawText(scene, 'AGUMON AVISTADO A LESTE', 16, CH - 76, W.steelLt);
  drawText(scene, 'PATAMON AVISTADO', 16, CH - 66, W.steelLt);

  const menuH = 40;
  panel(scene, 0, CH - menuH, CW, menuH, { bg: withAlpha(W.navyDk, 235) });
  const menuLabels = ['TIME', 'DEX', 'LOJA', 'MENU'];
  const slotW = 110;
  menuLabels.forEach((label, i) => {
    const x = 340 + i * (slotW + 14);
    panel(scene, x, CH - menuH + 4, slotW, menuH - 8, { bg: withAlpha(W.steelDk, 210) });
    const tw = label.length * 4 - 1;
    drawText(scene, label, x + Math.round((slotW - tw) / 2), CH - 20, W.white);
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  scene.save(OUT);
  console.log('World mockup saved to', OUT);
}

main();
