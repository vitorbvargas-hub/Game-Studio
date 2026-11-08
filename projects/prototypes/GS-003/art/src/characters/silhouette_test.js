'use strict';
// GS-003 character creator v2 — silhouette test required by the coordinator's
// v1 rejection ("os 7 cortes ficaram quase iguais ... faça um teste de
// silhueta"). Renders the full character (body+hair+clothing) for each of
// the 7 hair cuts, S direction, idle frame 0, flattens every non-transparent
// pixel to solid black (no outline recolor, no shading -- a pure silhouette
// read), and lays them out in a row so the 7 cuts can be told apart by
// outline shape alone, with no color information at all.
const fs = require('fs');
const path = require('path');
const { render, addGroundShadow, FRAME_W, FRAME_H } = require('./grid.js');
const { buildBodyMatrix } = require('./body.js');
const { buildHairMatrix, CUT_IDS } = require('./hair.js');
const { buildClothingMatrix } = require('./clothing.js');
const { INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, paletteMapFor, selOutline } = require('./palettes.js');
const { Canvas } = require('../canvas.js');
const { drawText } = require('../font5x3.js');
const { PREVIEW_DIR } = require('./generator.js');

const PANEL = [0x3a, 0x44, 0x66, 255];
const UI = [0xc0, 0xcb, 0xdc, 255];
const BLACK = [0, 0, 0, 255];

function buildCharacter(cut) {
  const model = 'male', skin = 'tan', hairColor = 'preto';
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

// Also build the hair cut alone (no body/clothing) so the test isolates
// exactly the variable under review -- the full-character silhouette can
// still differ between cuts purely from body/clothing noise even if two
// cuts were accidentally identical, so both reads are included.
function buildHairOnly(cut) {
  const ch = render(buildHairMatrix({ cut, direction: 'S' }), paletteMapFor({ hair: HAIR_COLORS.preto }));
  ch.autoOutline(selOutline(HAIR_COLORS.preto));
  return ch;
}

function silhouette(c) {
  const nc = new Canvas(c.w, c.h);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [, , , a] = c.getPixel(x, y);
      if (a > 0) nc.setPixel(x, y, BLACK);
    }
  }
  return nc;
}

function run() {
  const scale = 6;
  const cellW = FRAME_W * scale + 14;
  const cellH = FRAME_H * scale + 24;
  const sheet = new Canvas(cellW * CUT_IDS.length + 10, cellH * 2 + 40);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);
  drawText(sheet, 'TESTE DE SILHUETA - 7 CORTES, SEM COR - LINHA 1: PERSONAGEM COMPLETO - LINHA 2: SO O CABELO', 4, 4, UI);

  CUT_IDS.forEach((cut, i) => {
    const x = 5 + i * cellW;
    drawText(sheet, cut.slice(0, 11), x, 18, UI);
    const full = silhouette(buildCharacter(cut));
    sheet.blit(full.scaleNearest(scale), x, 30);
    const hairOnly = silhouette(buildHairOnly(cut));
    sheet.blit(hairOnly.scaleNearest(scale), x, 30 + cellH);
  });

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const outPath = path.join(PREVIEW_DIR, 'character_silhouette_test.png');
  sheet.save(outPath);
  console.log('character_silhouette_test.png:', sheet.w, 'x', sheet.h);
}

module.exports = { run };
if (require.main === module) run();
