'use strict';
// One-off inspector: slices a NinjaAdventure tileset sheet into a 16px grid,
// upscales 4x, and overlays col_row index text so tile coordinates can be
// picked visually before building forest-v5/praia/vila tilesets.
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');
const { drawText } = require('./font5x3.js');

const NA_BASE = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/10-source-files/ninja-adventure');
const OUT = path.resolve(__dirname, '../../../../../workspaces/game-art/tmp_na');

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function gridOverlay(file, tile = 16, zoom = 4) {
  const src = pngToCanvas(path.join(NA_BASE, file));
  const cols = Math.floor(src.w / tile), rows = Math.floor(src.h / tile);
  const out = new Canvas(src.w * zoom, src.h * zoom);
  out.blit(src.scaleNearest(zoom), 0, 0);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tile * zoom, y = r * tile * zoom;
      for (let i = 0; i < tile * zoom; i++) { out.blendPixel(x + i, y, [0, 0, 0, 90]); out.blendPixel(x, y + i, [0, 0, 0, 90]); }
      drawText(out, `${c}`, x + 2, y + 2, [255, 255, 0, 255]);
      drawText(out, `${r}`, x + 2, y + 9, [0, 255, 255, 255]);
    }
  }
  const outName = file.replace('.png', `_grid${tile}x${zoom}.png`);
  out.save(path.join(OUT, outName));
  console.log('saved', outName, src.w, 'x', src.h, `(${cols}x${rows} tiles)`);
}

const files = process.argv.slice(2);
for (const f of files) gridOverlay(f);
