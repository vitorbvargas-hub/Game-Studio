'use strict';
// Shared HUD/cast primitives for the v5 proof scenes (forest/praia/vila),
// factored out of forest_v4_proof_scene.js so all three biomes render the
// exact same HUD language/cast convention as prior proof shots -- apples to
// apples comparison for the founder.
const path = require('path');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');
const { loadCreature, pngToCanvas } = require('./sprite_loader.js');

const CHARS = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/11-characters');

function loadTamer(id) {
  const fs = require('fs');
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

function addCreature(entities, id, frameKey, x, y, opts = {}) {
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
function addTamer(entities, tamer, dir, x, y, idTag, opts = {}) {
  const atlasKey = tamer.meta.animations.idle.dirFrames[dir][0].atlasKey;
  let frame = tamer.frames[atlasKey];
  if (opts.tint) frame = frame.tint(opts.tint, opts.tintAlpha || 130);
  const pivot = tamer.meta.pivot;
  const e = { canvas: frame, x: x - pivot.x, y: y - pivot.y, sortY: y, shadowFoot: { cx: x, cy: y }, name: idTag, head: { x, y: y - pivot.y + 6 } };
  entities.push(e);
  return e;
}

function drawHud(scene, { CW, CH, label, timeLabel, bossLabel, logLines, player, team }) {
  panel(scene, 10, 10, 140, 26, { bg: withAlpha(W.navyDk, 210) });
  drawText(scene, timeLabel, 18, 17, W.steelLt);
  panel(scene, CW - 118, 10, 108, 26, { bg: withAlpha(W.waterMid, 225) });
  drawText(scene, 'AUTO ON', CW - 110, 17, W.white);
  panel(scene, CW - 150, 42, 140, 24, { bg: withAlpha(W.navyDk, 205) });
  drawText(scene, bossLabel, CW - 142, 49, W.hpYellow);

  const hudH = 108;
  panel(scene, 10, CH - hudH - 58, 300, 50, { bg: withAlpha(W.navyDk, 220) });
  logLines.forEach((t, i) => drawText(scene, t, 16, CH - hudH - 52 + i * 10, i === 1 ? W.hpYellow : W.steelLt));

  panel(scene, 0, CH - hudH, CW, hudH, { bg: withAlpha(W.navyDk, 235) });
  const mmX = 14, mmY = CH - hudH + 10, mmW = 92, mmH = 88;
  panel(scene, mmX, mmY, mmW, mmH, { bg: withAlpha(W.navyDk, 230) });
  for (let ty = 0; ty < mmH - 6; ty++) {
    for (let tx = 0; tx < mmW - 6; tx++) {
      const sx = Math.floor((tx / (mmW - 6)) * CW);
      const sy = Math.floor((ty / (mmH - 6)) * (CH - hudH));
      scene.setPixel(mmX + 3 + tx, mmY + 3 + ty, scene.getPixel(sx, sy));
    }
  }
  scene.fillCircle(mmX + 3 + Math.round((player.head.x / CW) * (mmW - 6)), mmY + 3 + Math.round((player.sortY / (CH - hudH)) * (mmH - 6)), 2, W.hpRed);
  panel(scene, mmX, mmY, mmW, mmH, { bg: [0, 0, 0, 0], bevel: false });

  const invX = mmX + mmW + 10, invY = mmY, slot = 30;
  panel(scene, invX, invY, slot * 6 + 8, 34, { bg: withAlpha(W.steelDk, 215) });
  for (let i = 0; i < 6; i++) {
    const sx = invX + 4 + i * slot;
    panel(scene, sx, invY + 4, slot - 2, 26, { bg: withAlpha(W.navy, 220), bevel: false });
    scene.fillCircle(sx + (slot - 2) / 2, invY + 17, 6, [W.grassLt, W.red, W.steel, W.gold, W.pinkLt, W.waterBright][i]);
  }
  drawText(scene, 'INVENTARIO', invX + 4, invY + 40, W.steelLt);

  const scX = invX, scY = invY + 50, scSlot = 30;
  panel(scene, scX, scY, scSlot * 4 + 8, 34, { bg: withAlpha(W.steelDk, 215) });
  for (let i = 0; i < 4; i++) {
    const sx = scX + 4 + i * scSlot;
    panel(scene, sx, scY + 4, scSlot - 2, 26, { bg: withAlpha(W.navy, 220), bevel: false });
    drawText(scene, String(i + 1), sx + 10, scY + 14, W.hpYellow);
  }

  const xpW = 360, xpX = Math.round(CW / 2 - xpW / 2), xpY = CH - hudH + 16;
  panel(scene, xpX, xpY, xpW, 20, { bg: withAlpha(W.navyDk, 225) });
  scene.fillRect(xpX + 2, xpY + 2, xpX + 2 + Math.round((xpW - 4) * 0.62), xpY + 17, W.hpYellow);
  drawText(scene, 'NIVEL 14', xpX + 6, xpY + 24, W.white);
  panel(scene, xpX, xpY + 36, xpW, 18, { bg: withAlpha(W.navyDk, 200) });
  drawText(scene, 'EXP 62%', xpX + 6, xpY + 41, W.steelLt);

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
}

module.exports = { W, withAlpha, drawText, loadTamer, loadCreature, pngToCanvas, panel, hpBar, nameLevelTag, addCreature, addTamer, drawHud };
