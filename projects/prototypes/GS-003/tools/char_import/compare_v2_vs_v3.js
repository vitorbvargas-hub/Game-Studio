'use strict';
// GS-003 -- required deliverable: tamers_v2_vs_v3.png, side by side of the
// rejected modular v2 Tamer generator (art/src/characters/) vs a v3 preset
// built from official DW DS sprites (tools/char_import/).
const fs = require('fs');
const path = require('path');
const AS = path.resolve(__dirname, '../../art/src');
const CH = path.join(AS, 'characters');
const { Canvas } = require(path.join(AS, 'canvas.js'));
const { drawText } = require(path.join(AS, 'font5x3.js'));
const { render, addGroundShadow, FRAME_W, FRAME_H } = require(path.join(CH, 'grid.js'));
const { buildBodyMatrix } = require(path.join(CH, 'body.js'));
const { buildHairMatrix } = require(path.join(CH, 'hair.js'));
const { buildClothingMatrix } = require(path.join(CH, 'clothing.js'));
const { INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, paletteMapFor, selOutline } = require(path.join(CH, 'palettes.js'));
const { loadSheetCanvas } = require('./npc_lib.js');

const GA = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS');
const UI = [0xc0, 0xcb, 0xdc, 255];
const PANEL = [0x3a, 0x44, 0x66, 255];

function buildTamerV2() {
  const model = 'male', skin = 'tan', cut = 'espetado-tai', hairColor = 'preto';
  const outfit = 'tamer-classico', clothColor = 'azul', direction = 'S';
  const skinTone = SKIN_TONES[skin], hairTone = HAIR_COLORS[hairColor], clothTone = CLOTH_RAMPS[clothColor];
  const cb = render(buildBodyMatrix({ model, direction }), paletteMapFor({ skin: skinTone }));
  cb.autoOutline(selOutline(skinTone));
  const ch = render(buildHairMatrix({ cut, direction }), paletteMapFor({ hair: hairTone }));
  ch.autoOutline(selOutline(hairTone));
  const cc = render(buildClothingMatrix({ outfit, model, direction }), paletteMapFor({ cloth: clothTone, goggle: true }));
  cc.autoOutline(selOutline(clothTone));
  const combo = new Canvas(FRAME_W, FRAME_H);
  combo.blit(cb, 0, 0);
  combo.blit(ch, 0, 0);
  combo.blit(cc, 0, 0);
  addGroundShadow(combo, INK);
  return combo;
}

function run() {
  const v2 = buildTamerV2().scaleNearest(10);
  const v3Path = path.join(GA, '11-characters/TAMER-0003/sprites/TAMER-0003_walk_S_01.png');
  const v3 = loadSheetCanvas(v3Path).scaleNearest(10);

  const pad = 20;
  const colW = Math.max(v2.w, v3.w) + pad * 2;
  const sheetW = colW * 2 + pad;
  const sheetH = Math.max(v2.h, v3.h) + 90;
  const sheet = new Canvas(sheetW, sheetH);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);

  drawText(sheet, 'TAMERS V2 (modular proprio, reprovado pelo fundador: "horrivel") vs V3 (base oficial DW DS + recolor + kitbash leve)', 10, 10, UI);
  drawText(sheet, 'V2: male/tan/espetado-tai/preto/tamer-classico/azul, S, idle -- gerado por matriz propria.', 10, 24, UI);
  drawText(sheet, 'V3: TAMER-0003 "Coragem (goggles)" -- base NPC-0003 (DW DS oficial) + recolor de cabelo + goggles.', 10, 36, UI);

  const v2X = pad, v2Y = 70;
  sheet.blit(v2, v2X, v2Y);
  drawText(sheet, 'V2 (reprovado)', v2X, v2Y - 12, UI);

  const v3X = colW + pad, v3Y = 70;
  sheet.blit(v3, v3X, v3Y);
  drawText(sheet, 'V3 (esta entrega)', v3X, v3Y - 12, UI);

  const outPath = path.join(GA, '09-previews', 'tamers_v2_vs_v3.png');
  sheet.save(outPath);
  console.log('wrote', outPath, sheet.w, 'x', sheet.h);
}

run();
