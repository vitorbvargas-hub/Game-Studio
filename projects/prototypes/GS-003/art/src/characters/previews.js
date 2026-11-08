'use strict';
// GS-003 — character creator previews: the combination grid
// (character_creator_grid.png) and the 4-direction walk strip
// (character_walk_strip.png) requested by the founder.
const fs = require('fs');
const path = require('path');
const { render, addGroundShadow, FRAME_W, FRAME_H } = require('./grid.js');
const { buildBodyMatrix, MODELS } = require('./body.js');
const { buildHairMatrix, CUT_IDS } = require('./hair.js');
const { buildClothingMatrix, OUTFIT_IDS } = require('./clothing.js');
const {
  INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, OUTFIT_COLOR_OPTIONS, paletteMapFor,
} = require('./palettes.js');
const { Canvas } = require('../canvas.js');
const { drawText } = require('../font5x3.js');
const { PREVIEW_DIR } = require('./generator.js');

const PANEL = [0x3a, 0x44, 0x66, 255];
const UI = [0xc0, 0xcb, 0xdc, 255];

function buildCharacter({ model, skin, cut, hairColor, outfit, clothColor, direction, anim = 'idle', frame = 0 }) {
  const goggle = outfit === 'tamer-classico';
  const cb = render(buildBodyMatrix({ model, direction, anim, frame }), paletteMapFor({ skin: SKIN_TONES[skin] }));
  cb.autoOutline(INK);
  const ch = render(buildHairMatrix({ cut, direction, anim, frame }), paletteMapFor({ hair: HAIR_COLORS[hairColor] }));
  ch.autoOutline(INK);
  const cc = render(buildClothingMatrix({ outfit, model, direction, anim, frame }), paletteMapFor({ cloth: CLOTH_RAMPS[clothColor], goggle }));
  cc.autoOutline(INK);
  const combo = new Canvas(FRAME_W, FRAME_H);
  combo.blit(cb, 0, 0);
  combo.blit(ch, 0, 0);
  combo.blit(cc, 0, 0);
  addGroundShadow(combo, INK);
  return combo;
}

function labelWidth(text) { return text.length * 4; }

function buildCreatorGrid() {
  const scale = 4;
  const cellW = FRAME_W * scale + 10;
  const cellH = FRAME_H * scale + 14;
  const hairColors = Object.keys(HAIR_COLORS);
  const rowLabelW = 60;
  const colLabelH = 16;

  // -- Section A: hair cuts x colors ---------------------------------------
  const aW = rowLabelW + hairColors.length * cellW;
  const aH = colLabelH + CUT_IDS.length * cellH + 20;
  const sectionA = new Canvas(aW, aH);
  drawText(sectionA, 'CABELO - CORTE X COR - BASE MASCULINO TAN CASUAL AZUL', 4, 4, UI);
  hairColors.forEach((colorId, c) => {
    drawText(sectionA, colorId.slice(0, 7), rowLabelW + c * cellW + 4, colLabelH + 2, UI);
  });
  CUT_IDS.forEach((cut, r) => {
    drawText(sectionA, cut.slice(0, 9), 2, colLabelH + 16 + r * cellH + cellH / 2, UI);
    hairColors.forEach((colorId, c) => {
      const combo = buildCharacter({
        model: 'male', skin: 'tan', cut, hairColor: colorId,
        outfit: 'casual', clothColor: 'azul', direction: 'S',
      });
      sectionA.blit(combo.scaleNearest(scale), rowLabelW + c * cellW, colLabelH + 16 + r * cellH);
    });
  });

  // -- Section B: bodies (model x skin) x outfits --------------------------
  const bodyVariants = [];
  for (const model of Object.keys(MODELS)) for (const skin of Object.keys(SKIN_TONES)) bodyVariants.push({ model, skin });
  const outfitCols = [];
  for (const outfit of OUTFIT_IDS) outfitCols.push({ outfit, color: OUTFIT_COLOR_OPTIONS[outfit][0] });

  const bW = rowLabelW + outfitCols.length * cellW;
  const bH = colLabelH + bodyVariants.length * cellH + 20;
  const sectionB = new Canvas(bW, bH);
  drawText(sectionB, 'CORPO - MODELO X PELE X ROUPA - BASE CABELO CURTO PRETO', 4, 4, UI);
  outfitCols.forEach(({ outfit }, c) => {
    drawText(sectionB, outfit.slice(0, 9), rowLabelW + c * cellW + 4, colLabelH + 2, UI);
  });
  bodyVariants.forEach(({ model, skin }, r) => {
    drawText(sectionB, `${model.slice(0, 4)}-${skin}`, 2, colLabelH + 16 + r * cellH + cellH / 2, UI);
    outfitCols.forEach(({ outfit, color }, c) => {
      const combo = buildCharacter({
        model, skin, cut: 'curto', hairColor: 'preto',
        outfit, clothColor: color, direction: 'S',
      });
      sectionB.blit(combo.scaleNearest(scale), rowLabelW + c * cellW, colLabelH + 16 + r * cellH);
    });
  });

  const pad = 12;
  const totalW = Math.max(aW, bW) + pad * 2;
  const totalH = aH + bH + pad * 3;
  const sheet = new Canvas(totalW, totalH);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);
  sheet.blit(sectionA, pad, pad);
  sheet.blit(sectionB, pad, pad + aH + pad);

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  sheet.save(path.join(PREVIEW_DIR, 'character_creator_grid.png'));
  console.log('character_creator_grid.png:', sheet.w, 'x', sheet.h);
}

function buildWalkStrip() {
  const scale = 6;
  const frames = 4;
  const dirs = [
    { id: 'S', mirror: false },
    { id: 'E', mirror: false },
    { id: 'N', mirror: false },
    { id: 'E', mirror: true, label: 'W' }, // W derived by horizontal mirror of E
  ];
  const cellW = FRAME_W * scale + 6;
  const cellH = FRAME_H * scale + 20;
  const labelColW = 18;
  const sheet = new Canvas(labelColW + frames * cellW + 12, dirs.length * cellH + 24);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);
  drawText(sheet, 'WALK S E N W - W ESPELHO DE E - MALE TAN CURTO PRETO TAMER CLASSICO AZUL', 4, 4, UI);

  dirs.forEach((d, row) => {
    const label = d.label || d.id;
    drawText(sheet, label, 4, 20 + row * cellH + cellH / 2, UI);
    for (let f = 0; f < frames; f++) {
      let combo = buildCharacter({
        model: 'male', skin: 'tan', cut: 'curto', hairColor: 'preto',
        outfit: 'tamer-classico', clothColor: 'azul', direction: d.id, anim: 'walk', frame: f,
      });
      if (d.mirror) combo = combo.flipX();
      sheet.blit(combo.scaleNearest(scale), labelColW + f * cellW, 20 + row * cellH);
    }
  });

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  sheet.save(path.join(PREVIEW_DIR, 'character_walk_strip.png'));
  console.log('character_walk_strip.png:', sheet.w, 'x', sheet.h);
}

function run() {
  buildCreatorGrid();
  buildWalkStrip();
}

module.exports = { run };
if (require.main === module) run();
