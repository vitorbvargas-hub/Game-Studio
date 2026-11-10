// Comparison board: Guilmon (PixelLab v3) | Gabumon (hand64) | Tamer | grass tile.
// Pure compositing, no generation. Nearest-neighbor upscales only to equalize pixel density.
'use strict';
const { loadPNG, upscale, savePNG } = require('./preview.js');
const path = require('path');

const ROOT = '/home/openclaw/projects/GameStudio';
const guilmon = loadPNG(path.join(ROOT, 'projects/prototypes/GS-003/quality-overhaul/phase2/art/scale-proof-v3-reanim/fixed/idle-s/frame_000.png'));
const gabumon = loadPNG(path.join(__dirname, '../frames/idle-s/frame_000.png'));
const tamerRaw = loadPNG(path.join(ROOT, 'assets/GAME-ASSETS/11-characters/TAMER-0001/sprites/TAMER-0001_walk_S_00.png'));
const tileRaw = loadPNG(path.join(ROOT, 'assets/GAME-ASSETS/03-environments/forest-v5/tiles/grass_00.png'));

const tamer = upscale(tamerRaw, 2); // 32->64, equalizes pixel density with the 64px-canvas sprites
const tile = upscale(tileRaw, 2); // 32->64 tile, same ground unit as the characters above

function bbox(img) {
  let minX = 999, minY = 999, maxX = -1, maxY = -1;
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
    const a = img.data[(y * img.width + x) * 4 + 3];
    if (a > 0) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  return { minX, minY, maxX, maxY };
}

const CELL_W = 80, CELL_H = 96, FLOOR_H = 18, GROUND_Y = CELL_H - FLOOR_H; // shared ground line per cell
const N = 4;
const W = CELL_W * N, H = CELL_H;
const out = { width: W, height: H, data: Buffer.alloc(W * H * 4) };
const SKY = [0xcf, 0xe9, 0xf2, 255];
for (let i = 0; i < W * H; i++) { out.data[i * 4] = SKY[0]; out.data[i * 4 + 1] = SKY[1]; out.data[i * 4 + 2] = SKY[2]; out.data[i * 4 + 3] = SKY[3]; }

function blit(src, dx, dy) {
  for (let y = 0; y < src.height; y++) {
    const ty = dy + y; if (ty < 0 || ty >= H) continue;
    for (let x = 0; x < src.width; x++) {
      const tx = dx + x; if (tx < 0 || tx >= W) continue;
      const si = (y * src.width + x) * 4;
      const a = src.data[si + 3];
      if (a === 0) continue;
      const ti = (ty * W + tx) * 4;
      out.data[ti] = src.data[si]; out.data[ti + 1] = src.data[si + 1]; out.data[ti + 2] = src.data[si + 2]; out.data[ti + 3] = a;
    }
  }
}

// floor strip: tile the (64x64) grass tile along the ground band of every cell
for (let cx = 0; cx * 64 < W; cx++) blit(tile, cx * 64, GROUND_Y - 32);

// place each sprite so its foot bbox-bottom sits on GROUND_Y
function place(img, cellIndex, markerRGBA) {
  const b = bbox(img);
  const footY = b.maxY;
  const cellX = cellIndex * CELL_W;
  const dx = cellX + Math.round((CELL_W - img.width) / 2);
  const dy = GROUND_Y - footY;
  blit(img, dx, dy);
  // legend strip under the cell
  for (let x = cellX + 6; x < cellX + CELL_W - 6; x++) {
    for (let y = H - 5; y < H - 2; y++) {
      const i = (y * W + x) * 4;
      out.data[i] = markerRGBA[0]; out.data[i + 1] = markerRGBA[1]; out.data[i + 2] = markerRGBA[2]; out.data[i + 3] = 255;
    }
  }
}

place(guilmon, 0, [184, 59, 41, 255]); // red  = Guilmon (PixelLab)
place(gabumon, 1, [92, 75, 150, 255]); // purple = Gabumon (hand64)
place(tamer, 2, [90, 160, 90, 255]); // green = Tamer
// lone tile swatch in cell 3 (no footY logic needed, just center it)
blit(tile, 3 * CELL_W + Math.round((CELL_W - 64) / 2), Math.round((CELL_H - 64) / 2) - 6);
for (let x = 3 * CELL_W + 6; x < 3 * CELL_W + CELL_W - 6; x++) for (let y = H - 5; y < H - 2; y++) {
  const i = (y * W + x) * 4; out.data[i] = 150; out.data[i + 1] = 150; out.data[i + 2] = 150; out.data[i + 3] = 255;
}

// thin cell separators
for (let cx = 1; cx < N; cx++) {
  const x = cx * CELL_W;
  for (let y = 0; y < H; y++) { const i = (y * W + x) * 4; out.data[i] = 60; out.data[i + 1] = 60; out.data[i + 2] = 70; out.data[i + 3] = 160; }
}

savePNG(path.join(__dirname, '../board/compare_board.png'), out);
const big = upscale(out, 4);
savePNG(path.join(__dirname, '../board/compare_board_x4.png'), big);
console.log('board done', W, H, 'order: Guilmon(PixelLab) | Gabumon(hand64) | Tamer | tile');
