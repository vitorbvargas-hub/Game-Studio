'use strict';
// GS-003 — side-by-side comparison of the PLAYER-TAMER character creator
// output against the official DW DS Hero sprite already in the asset
// library (TAMER-0001, official-fan-use layer). Scale/proportion reference
// only -- no pixel of TAMER-0001 is copied into PLAYER-TAMER's own matrix
// (see DECISIONS.md "Iteração 2" and ART_STYLE_GUIDE.md section 8).
const fs = require('fs');
const path = require('path');
const { loadPNG } = require('../png_decode.js');
const { Canvas } = require('../canvas.js');
const { drawText } = require('../font5x3.js');
const { render, addGroundShadow, FRAME_W, FRAME_H } = require('./grid.js');
const { buildBodyMatrix } = require('./body.js');
const { buildHairMatrix } = require('./hair.js');
const { buildClothingMatrix } = require('./clothing.js');
const { INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, paletteMapFor, selOutline } = require('./palettes.js');
const { PREVIEW_DIR } = require('./generator.js');

const UI = [0xc0, 0xcb, 0xdc, 255];
const PANEL = [0x3a, 0x44, 0x66, 255];

const TAMER0001_DIR = path.resolve(__dirname, '../../../../../../assets/GAME-ASSETS/11-characters/TAMER-0001');

function canvasFromDecoded(decoded) {
  const c = new Canvas(decoded.width, decoded.height);
  c.data.set(Buffer.from(decoded.data.buffer, decoded.data.byteOffset, decoded.data.byteLength));
  return c;
}

function buildOurTamer() {
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
  const dsDecoded = loadPNG(path.join(TAMER0001_DIR, 'sprites', 'TAMER-0001_walk_S_00.png'));
  const dsCanvas = canvasFromDecoded(dsDecoded); // 32x32, pivot (16,31)
  const ours = buildOurTamer(); // 32x40, pivot (16,35)

  const scale = 12;
  const dsPivotY = 31, ourPivotY = 35;
  const colW = 32 * scale + 40;
  const groundY = 40 * scale + 40; // shared ground line in sheet space
  const sheetH = groundY + 40;
  const sheetW = colW * 2 + 40;
  const sheet = new Canvas(sheetW, sheetH);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);

  drawText(sheet, 'COMPARACAO DE ESCALA -- PLAYER-TAMER (original) vs TAMER-0001 (DS oficial, so referencia de proporcao)', 10, 10, UI);
  drawText(sheet, 'Ambos no tile 32px. Pivot = pe (linha pontilhada). Nenhum pixel do DS foi copiado para o PLAYER-TAMER.', 10, 24, UI);

  // Ground line shared by both pivots.
  for (let x = 20; x < sheetW - 20; x++) sheet.setPixel(x, groundY, UI);

  const dsX = 20, dsY = groundY - dsPivotY * scale;
  sheet.blit(dsCanvas.scaleNearest(scale), dsX, dsY);
  drawText(sheet, 'TAMER-0001 (DS oficial)', dsX, dsY - 14, UI);
  drawText(sheet, `frame 32x32, pivot (16,${dsPivotY})`, dsX, groundY + 10, UI);

  const ourX = colW + 40, ourY = groundY - ourPivotY * scale;
  sheet.blit(ours.scaleNearest(scale), ourX, ourY);
  drawText(sheet, 'PLAYER-TAMER (gerador original)', ourX, ourY - 14, UI);
  drawText(sheet, `frame 32x40, pivot (16,${ourPivotY})`, ourX, groundY + 10, UI);
  drawText(sheet, 'altura do personagem ~29px (y4-y33)', ourX, groundY + 24, UI);

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const outPath = path.join(PREVIEW_DIR, 'character_v2_vs_ds.png');
  sheet.save(outPath);
  console.log('character_v2_vs_ds.png:', sheet.w, 'x', sheet.h);
}

module.exports = { run };
if (require.main === module) run();
