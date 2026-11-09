'use strict';
// One-off: crop+zoom specific regions of a NinjaAdventure sheet for precise
// coordinate picking (8x zoom with 16px grid overlay).
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

function cropZoom(file, tx0, ty0, tcols, trows, zoom, outName) {
  const src = pngToCanvas(path.join(NA_BASE, file));
  const tile = 16;
  const w = tcols * tile, h = trows * tile;
  const crop = new Canvas(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) crop.setPixel(x, y, src.getPixel(tx0 * tile + x, ty0 * tile + y));
  const out = new Canvas(w * zoom, h * zoom);
  out.blit(crop.scaleNearest(zoom), 0, 0);
  for (let r = 0; r <= trows; r++) out.line(0, r * tile * zoom, w * zoom, r * tile * zoom, [255, 0, 0, 120], 1);
  for (let c = 0; c <= tcols; c++) out.line(c * tile * zoom, 0, c * tile * zoom, h * zoom, [255, 0, 0, 120], 1);
  for (let r = 0; r < trows; r++) for (let c = 0; c < tcols; c++) drawText(out, `${tx0 + c},${ty0 + r}`, c * tile * zoom + 2, r * tile * zoom + 2, [255, 255, 0, 255]);
  out.save(path.join(OUT, outName));
  console.log('saved', outName, w, 'x', h, '->', out.w, 'x', out.h);
}

// green forest grass+dirt block (rows 6-11, cols 0-10)
cropZoom('tileset_floor.png', 0, 6, 11, 6, 8, 'floor_forest_block.png');
// blue water block (rows 18-21, cols 0-10)
cropZoom('tileset_floor.png', 0, 18, 11, 6, 8, 'floor_water_block.png');
// brown dirt-only block (rows 12-17, cols 11-21)
cropZoom('tileset_floor.png', 11, 12, 11, 6, 8, 'floor_dirt_block.png');
// orange/pink blossom canopy block (rows 0-5, cols 0-10 and 11-21)
cropZoom('tileset_floor.png', 0, 0, 11, 6, 6, 'floor_canopy_orange.png');
cropZoom('tileset_floor.png', 11, 0, 11, 6, 6, 'floor_canopy_pink.png');
// village_abandoned full sheet (20x12 tiles)
cropZoom('tileset_village_abandoned.png', 0, 0, 20, 12, 5, 'village_full.png');
cropZoom('tileset_village_abandoned.png', 10, 0, 10, 5, 8, 'village_houses_a.png');
cropZoom('tileset_village_abandoned.png', 12, 7, 8, 5, 8, 'village_houses_b.png');
cropZoom('tileset_village_abandoned.png', 0, 7, 6, 5, 8, 'village_bushes.png');
