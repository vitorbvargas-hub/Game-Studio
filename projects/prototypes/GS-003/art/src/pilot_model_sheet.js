'use strict';
// GS-003 — ADR-009 art-direction reset: pixel-by-pixel PILOT calibration sketch.
//
// Hand-authored via a character matrix (each grid cell maps straight to one
// palette color via setPixel), NOT drawn with Canvas.fillEllipse/fillCircle/
// fillPolygon. The founder rejected the earlier parametric-shape approach
// used by pixelume.js/ferrolim.js/aquabit.js/agumon.js (see ADR-009, "GS-003
// reset"); this file intentionally does not import or reuse that approach.
// This is a calibration sketch only (scale + palette check next to the
// founder's concept image), not a production-ready multi-frame asset.
const fs = require('fs');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');
const { drawText } = require('./font5x3.js');

// Palette = a verified subset of Lospec "Endesga 32" (lospec.com/palette-list/
// endesga-32, checked 2026-11-08) -- see ART_STYLE_GUIDE.md section 4.
const PALETTE = {
  ink: [0x18, 0x14, 0x25, 255],   // #181425
  body: [0xe4, 0x3b, 0x44, 255],  // #e43b44 red
  cream: [0xea, 0xd4, 0xaa, 255], // #ead4aa
  tan: [0xe4, 0xa6, 0x72, 255],   // #e4a672
  mark: [0x3e, 0x27, 0x31, 255],  // #3e2731
  eye: [0x63, 0xc7, 0x4d, 255],   // #63c74d
  panel: [0x3a, 0x44, 0x66, 255], // #3a4466
  ui: [0xc0, 0xcb, 0xdc, 255],    // #c0cbdc
};

// 8-column half grid, idx0 = outer edge .. idx7 = center-adjacent column.
// Mirrored left/right when rasterized. 'R' body 'C' cream 'T' tan 'M' mark
// 'G' eye iris. Every other cell is transparent.
const KEY = { R: 'body', C: 'cream', T: 'tan', M: 'mark', G: 'eye' };
const HALF = [
  {},
  { 3: 'R' },
  { 2: 'R', 3: 'R' },
  { 1: 'R', 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R', 7: 'R' },
  { 1: 'R', 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R', 7: 'R' },
  { 1: 'R', 2: 'R', 3: 'R', 4: 'G', 5: 'R', 6: 'R', 7: 'R' },
  { 1: 'R', 2: 'R', 3: 'R', 4: 'M', 5: 'R', 6: 'R', 7: 'R' },
  { 1: 'R', 2: 'C', 3: 'C', 4: 'C', 5: 'C', 6: 'C', 7: 'C' },
  { 1: 'R', 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R', 7: 'R' },
  { 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R', 7: 'R' },
  { 1: 'R', 2: 'C', 3: 'C', 4: 'C', 5: 'C', 6: 'C', 7: 'C' },
  { 1: 'R', 2: 'C', 3: 'C', 4: 'T', 5: 'T', 6: 'C', 7: 'C' },
  { 1: 'M', 2: 'C', 3: 'C', 4: 'T', 5: 'T', 6: 'C', 7: 'C' },
  { 1: 'R', 2: 'R', 3: 'C', 4: 'C', 5: 'C', 6: 'C', 7: 'C' },
  { 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R' }, // thigh
  { 2: 'R', 3: 'R', 4: 'R', 5: 'R', 6: 'R' }, // thigh (extra row -- legs were unreadable at 2 rows)
  { 3: 'R', 4: 'R', 5: 'R' },                 // ankle taper
  { 2: 'C', 3: 'C', 4: 'R', 5: 'R', 6: 'C' },  // foot + claws
];

function buildSmallSprite() {
  const c = new Canvas(16, HALF.length);
  for (let y = 0; y < HALF.length; y++) {
    const row = HALF[y];
    for (let idx = 0; idx <= 7; idx++) {
      const ch = row[idx];
      if (!ch) continue;
      const color = PALETTE[KEY[ch]];
      c.setPixel(idx, y, color);       // left half, hand-placed
      c.setPixel(15 - idx, y, color);  // mirrored right half
    }
  }
  c.autoOutline(PALETTE.ink); // pixel-adjacency border, not a shape primitive
  return c;
}

// Flat hand-specified bands under the feet -- not an ellipse formula.
function addGroundShadow(c) {
  const bottom = c.h - 1;
  const bands = [
    { y: bottom - 1, x0: 12, x1: 35, a: 55 },
    { y: bottom, x0: 8, x1: 39, a: 40 },
  ];
  for (const b of bands) {
    for (let x = b.x0; x <= b.x1; x++) {
      if (c.getPixel(x, b.y)[3] > 0) continue;
      c.blendPixel(x, b.y, [PALETTE.ink[0], PALETTE.ink[1], PALETTE.ink[2], b.a]);
    }
  }
}

// Nearest-neighbor downsample of a decoded PNG raw buffer into a Canvas --
// compositing/resampling an existing raster, not creature-shape generation.
function downsample(raw, targetW) {
  const scale = raw.width / targetW;
  const targetH = Math.max(1, Math.round(raw.height / scale));
  const c = new Canvas(targetW, targetH);
  for (let y = 0; y < targetH; y++) {
    const sy = Math.min(raw.height - 1, Math.floor(y * scale));
    for (let x = 0; x < targetW; x++) {
      const sx = Math.min(raw.width - 1, Math.floor(x * scale));
      const o = (sy * raw.width + sx) * 4;
      c.setPixel(x, y, [raw.data[o], raw.data[o + 1], raw.data[o + 2], raw.data[o + 3]]);
    }
  }
  return c;
}

function generate(outDir, previewDir, conceptPath) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const small = buildSmallSprite();
  const native = small.scaleNearest(3); // 16x16 -> 48x48, matches Rookie frame (SPRITE_SPECIFICATION.md)
  addGroundShadow(native);
  native.save(`${outDir}/pilot_rookie_native.png`);

  const big = native.scaleNearest(4); // 192x192 inspection preview
  big.save(`${previewDir}/pilot_rookie_x4.png`);

  const swatchKeys = ['ink', 'body', 'cream', 'tan', 'mark', 'eye'];
  const swatch = new Canvas(swatchKeys.length * 24, 24);
  swatchKeys.forEach((k, i) => swatch.fillRect(i * 24, 0, i * 24 + 23, 23, PALETTE[k]));

  let concept = null;
  if (conceptPath && fs.existsSync(conceptPath)) {
    concept = downsample(loadPNG(conceptPath), 360);
  }

  const pad = 16;
  const colW = concept ? concept.w : 0;
  const sheetW = pad + colW + pad + big.w + pad;
  const rowH = Math.max(concept ? concept.h : 0, big.h);
  const sheetH = pad + 8 + rowH + pad + 24 + pad;
  const sheet = new Canvas(sheetW, sheetH);
  sheet.fillRect(0, 0, sheetW - 1, sheetH - 1, PALETTE.panel);

  drawText(sheet, 'CONCEPT FOUNDER', pad, pad, PALETTE.ui);
  drawText(sheet, 'PILOT ROOKIE SKETCH', pad + colW + pad, pad, PALETTE.ui);

  const y0 = pad + 8;
  if (concept) sheet.blit(concept, pad, y0);
  sheet.blit(big, pad + colW + pad, y0);

  const swatchY = y0 + rowH + pad;
  sheet.blit(swatch, pad, swatchY);
  drawText(sheet, 'PALETTE ENDESGA 32 SUBSET', pad + swatch.w + 12, swatchY + 8, PALETTE.ui);

  sheet.save(`${previewDir}/pilot_model_sheet_comparison.png`);
  console.log('Pilot model sheet written:', `${previewDir}/pilot_model_sheet_comparison.png`);
}

module.exports = { generate, buildSmallSprite };
if (require.main === module) {
  generate(
    process.argv[2] || './out',
    process.argv[3] || './out/preview',
    process.argv[4] || '../reference/concept-founder/concept_world_and_creature.png'
  );
}
