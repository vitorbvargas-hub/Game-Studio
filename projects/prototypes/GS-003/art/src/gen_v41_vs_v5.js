'use strict';
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { pngToCanvas } = require('./na_source.js');
const { drawText } = require('./font5x3.js');

const PROOF = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews/proof');

function main() {
  const v41 = pngToCanvas(path.join(PROOF, 'forest_v4_day_v41.png'));
  const v5 = pngToCanvas(path.join(PROOF, 'map_v5_floresta.png'));
  const gap = 6;
  const out = new Canvas(v41.w + v5.w + gap, Math.max(v41.h, v5.h) + 24);
  out.fillRect(0, 0, out.w - 1, out.h - 1, [20, 18, 24, 255]);
  drawText(out, 'FOREST-V4.1 (PROCEDURAL)', 6, 4, [255, 255, 255, 255]);
  drawText(out, 'FOREST-V5 (LICENSED TILESET)', v41.w + gap + 6, 4, [255, 255, 255, 255]);
  out.blit(v41, 0, 20);
  out.blit(v5, v41.w + gap, 20);
  out.save(path.join(PROOF, 'map_v41_vs_v5.png'));
  console.log('comparison saved', out.w, 'x', out.h);
}
main();
