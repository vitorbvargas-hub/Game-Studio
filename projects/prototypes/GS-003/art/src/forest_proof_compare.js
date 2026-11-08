'use strict';
// GS-003 -- side-by-side comparison: canonical IdleDex reference vs the
// GS-004 §4 forest proof scene, for founder review (ADR-010). Run with:
// node art/src/forest_proof_compare.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');

const REF = path.resolve(__dirname, '../../evidence/idledex-canonical/canonical_founder_screenshot_night_forest.png');
const PROOF = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof/proof_forest_v1.png');
const OUT = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof/proof_vs_reference.png');

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

// Nearest-neighbor resize to an exact target box (used only for the
// reference screenshot, a real photo/screenshot, not original pixel art --
// our own proof PNG is shown at native resolution, unscaled).
function resizeTo(c, w, h) {
  const nc = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor((x / w) * c.w);
      const sy = Math.floor((y / h) * c.h);
      nc.setPixel(x, y, c.getPixel(sx, sy));
    }
  }
  return nc;
}

function main() {
  const ref = pngToCanvas(REF);
  const proof = pngToCanvas(PROOF);

  const laneH = 24, gap = 10, pad = 10;
  const paneW = proof.w; // both panes share the proof's native width for a 1:1 scale read
  const refScaled = resizeTo(ref, paneW, Math.round(ref.h * (paneW / ref.w)));

  const totalH = pad * 3 + laneH * 2 + refScaled.h + proof.h;
  const totalW = paneW + pad * 2;
  const sheet = new Canvas(totalW, totalH);
  sheet.fillRect(0, 0, totalW - 1, totalH - 1, [12, 13, 20, 255]);

  let y = pad;
  drawText(sheet, 'REFERENCIA CANONICA (IDLEDEX, FOUNDER SCREENSHOT)', pad, y + 6, W.hpYellow);
  y += laneH;
  sheet.blit(refScaled, pad, y);
  y += refScaled.h + pad;
  drawText(sheet, 'PROVA VISUAL GS-003 (FOREST-V3, ESTE PACOTE)', pad, y + 6, W.grassLt);
  y += laneH;
  sheet.blit(proof, pad, y);

  // thin separators
  for (let x = 0; x < totalW; x++) sheet.setPixel(x, pad + laneH - 2, withAlpha(W.steelDk, 160));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  sheet.save(OUT);
  console.log('Comparison saved to', OUT);
}

main();
