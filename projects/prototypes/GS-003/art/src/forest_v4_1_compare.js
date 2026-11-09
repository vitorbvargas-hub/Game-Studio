'use strict';
// GS-003 -- forest-v4 vs forest-v4.1 side-by-side, plus a zoomed path crop
// (coordinator's main complaint: square/checkerboard path seams).
// Run with: node art/src/forest_v4_1_compare.js
const path = require('path');
const { Canvas } = require('./canvas.js');
const { pngToCanvas } = require('./sprite_loader.js');
const { cropRect } = require('./dwds_extract.js');
const { drawText } = require('./font5x3.js');

const PROOF = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');
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
function vconcat(canvases, gap = 6, bg = [6, 6, 10, 255]) {
  const w = Math.max(...canvases.map((c) => c.w));
  const h = canvases.reduce((s, c) => s + c.h, 0) + gap * (canvases.length - 1);
  const out = new Canvas(w, h);
  out.fillRect(0, 0, w - 1, h - 1, bg);
  let y = 0;
  for (const c of canvases) { out.blit(c, 0, y); y += c.h + gap; }
  return out;
}

function main() {
  const v4 = pngToCanvas(path.join(PROOF, 'forest_v4_day.png'));
  const v41 = pngToCanvas(path.join(PROOF, 'forest_v4_day_v41.png'));
  const scale = 0.6;
  const scaleDown = (c) => {
    const nc = new Canvas(Math.round(c.w * scale), Math.round(c.h * scale));
    for (let y = 0; y < nc.h; y++) for (let x = 0; x < nc.w; x++) nc.setPixel(x, y, c.getPixel(Math.floor(x / scale), Math.floor(y / scale)));
    return nc;
  };
  const fullRow = hconcat([labeledPanel('FOREST-V4 (antes -- caminho quadriculado)', scaleDown(v4)), labeledPanel('FOREST-V4.1 (depois -- wang-47 + luz)', scaleDown(v41))]);

  // zoomed path crop, same region both images -- the coordinator's main complaint
  const pathV4 = cropRect(v4, 280, 170, 700, 430);
  const pathV41 = cropRect(v41, 280, 170, 700, 430);
  const zoomRow = hconcat([
    labeledPanel('ZOOM CAMINHO -- V4 (blocos cruz/xadrez)', pathV4, 2),
    labeledPanel('ZOOM CAMINHO -- V4.1 (wang-47 organico)', pathV41, 2),
  ]);

  const out = vconcat([fullRow, zoomRow]);
  out.save(path.join(OUT, 'forest_v4_vs_v41_path_zoom.png'));
  console.log('comparison image written to', path.join(OUT, 'forest_v4_vs_v41_path_zoom.png'));
}

main();
