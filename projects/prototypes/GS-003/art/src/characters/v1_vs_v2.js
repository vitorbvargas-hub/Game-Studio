'use strict';
// GS-003 character creator — v1 vs v2 side-by-side requested by the
// coordinator's review. v1's own source (body.js/hair.js/clothing.js before
// this rewrite) is gone from the working tree, so this reads a frozen v1
// render captured from the pre-edit code at /tmp/gs003_v1_snapshot/
// (male/tan/espetado-tai/preto/tamer-classico/azul, S, idle frame 0,
// scaleNearest(10) at capture time) and renders the same recipe fresh
// through the current (v2) module, scaled to match.
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
const V1_SNAPSHOT = '/tmp/gs003_v1_snapshot/v1_sample_x10.png';

function canvasFromDecoded(decoded) {
  const c = new Canvas(decoded.width, decoded.height);
  c.data.set(Buffer.from(decoded.data.buffer, decoded.data.byteOffset, decoded.data.byteLength));
  return c;
}

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
  if (!fs.existsSync(V1_SNAPSHOT)) {
    throw new Error(`frozen v1 snapshot missing at ${V1_SNAPSHOT} -- cannot build v1-vs-v2 without it`);
  }
  const v1 = canvasFromDecoded(loadPNG(V1_SNAPSHOT)); // already scaleNearest(10), 320x400
  const v2 = buildTamerV2().scaleNearest(10); // match v1's capture scale

  const pad = 20;
  const colW = Math.max(v1.w, v2.w) + pad * 2;
  const sheetW = colW * 2 + pad;
  const sheetH = Math.max(v1.h, v2.h) + 70;
  const sheet = new Canvas(sheetW, sheetH);
  for (let y = 0; y < sheet.h; y++) for (let x = 0; x < sheet.w; x++) sheet.setPixel(x, y, PANEL);

  drawText(sheet, 'V1 (nota 4/10, reprovado) vs V2 -- mesma receita: male/tan/espetado-tai/preto/tamer-classico/azul, S, idle', 10, 10, UI);
  drawText(sheet, 'V1: sem olhos visiveis, cabelo tipo capacete, corpo retangular sem bracos. V2: olhos com brilho, 7 cortes distintos, bracos reais com luva.', 10, 24, UI);

  const v1X = pad, v1Y = 50;
  sheet.blit(v1, v1X, v1Y);
  drawText(sheet, 'V1 (reprovado)', v1X, v1Y - 12, UI);

  const v2X = colW + pad, v2Y = 50;
  sheet.blit(v2, v2X, v2Y);
  drawText(sheet, 'V2 (esta entrega)', v2X, v2Y - 12, UI);

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  const outPath = path.join(PREVIEW_DIR, 'character_v1_vs_v2.png');
  sheet.save(outPath);
  console.log('character_v1_vs_v2.png:', sheet.w, 'x', sheet.h);
}

module.exports = { run };
if (require.main === module) run();
