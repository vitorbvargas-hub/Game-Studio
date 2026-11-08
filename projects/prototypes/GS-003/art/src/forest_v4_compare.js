'use strict';
// GS-003 -- forest-v3 vs forest-v4 side-by-side, plus a zoomed tree crop
// vs. the canonical IdleDex reference. Run with: node art/src/forest_v4_compare.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { pngToCanvas } = require('./sprite_loader.js');
const { cropRect } = require('./dwds_extract.js');
const { drawText } = require('./font5x3.js');
const { W, withAlpha } = require('./endesga32.js');

const PROOF = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');
const EVIDENCE = path.resolve(__dirname, '../../evidence/idledex-canonical');
const OUT = PROOF;

function labeledPanel(title, canvas, scale = 1) {
  const img = scale === 1 ? canvas : canvas.scaleNearest(scale);
  const pad = 22;
  const out = new Canvas(img.w, img.h + pad);
  out.fillRect(0, 0, img.w - 1, out.h - 1, [10, 10, 16, 255]);
  drawText(out, title, 6, 6, [255, 230, 120, 255]);
  out.blit(img, 0, pad);
  return out;
}

function hconcat(canvases, gap = 6, bg = [6, 6, 10, 255]) {
  const w = canvases.reduce((s, c) => s + c.w, 0) + gap * (canvases.length - 1);
  const h = Math.max(...canvases.map((c) => c.h));
  const out = new Canvas(w, h);
  out.fillRect(0, 0, w - 1, h - 1, bg);
  let x = 0;
  for (const c of canvases) { out.blit(c, x, 0); x += c.w + gap; }
  return out;
}

function main() {
  // ---- forest_v3_vs_v4.png: same composition, two art generations -----
  const v3 = pngToCanvas(path.join(PROOF, 'proof_forest_v1.png'));
  const v4 = pngToCanvas(path.join(PROOF, 'forest_v4_day.png'));
  const scale = 0.6;
  const v3s = new Canvas(Math.round(v3.w * scale), Math.round(v3.h * scale));
  const v4s = new Canvas(Math.round(v4.w * scale), Math.round(v4.h * scale));
  for (let y = 0; y < v3s.h; y++) for (let x = 0; x < v3s.w; x++) v3s.setPixel(x, y, v3.getPixel(Math.floor(x / scale), Math.floor(y / scale)));
  for (let y = 0; y < v4s.h; y++) for (let x = 0; x < v4s.w; x++) v4s.setPixel(x, y, v4.getPixel(Math.floor(x / scale), Math.floor(y / scale)));
  const compare = hconcat([labeledPanel('FOREST-V3 (antes)', v3s), labeledPanel('FOREST-V4 (depois)', v4s)]);
  compare.save(path.join(OUT, 'forest_v3_vs_v4.png'));

  // ---- zoomed tree crop vs. the canonical reference ---------------------
  const canonical = pngToCanvas(path.join(EVIDENCE, 'canonical_founder_screenshot_night_forest.png'));
  const canonicalTrees = cropRect(canonical, 170, 160, 470, 460); // dense cone-tree mass, clear of UI panels
  const v3TreesSrc = pngToCanvas(path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/03-environments/forest-v3/tileset.png'));
  const v3Trees = cropRect(v3TreesSrc, 8, 95, 258, 250);
  const v4Night = pngToCanvas(path.join(PROOF, 'forest_v4_night.png'));
  const v4Trees = cropRect(v4Night, 900, 90, 1150, 290);

  const zoom = hconcat([
    labeledPanel('REFERENCIA CANONICA (IdleDex, noite)', canonicalTrees, 2),
    labeledPanel('FOREST-V3 (antes)', v3Trees, 2),
    labeledPanel('FOREST-V4 (depois, preset noite)', v4Trees, 2),
  ]);
  zoom.save(path.join(OUT, 'forest_v4_tree_zoom_vs_reference.png'));

  console.log('comparison images written to', OUT);
}

main();
