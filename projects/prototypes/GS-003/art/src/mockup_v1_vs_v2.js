'use strict';
// GS-003 -- side-by-side comparison of world_mockup_v1 (tamer_placeholder +
// original/grass biome) vs world_mockup_v2 (real DW DS Tamer + *-dwds biomes).
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');
const { drawText } = require('./font5x3.js');
const { pngToCanvas } = require('./sprite_loader.js');

const PREV = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/09-previews');
const v1 = pngToCanvas(path.join(PREV, 'world_mockup_v1.png'));
const v2 = pngToCanvas(path.join(PREV, 'world_mockup_v2.png'));

const SCALE = 0.55;
const w1 = Math.round(v1.w * SCALE), h1 = Math.round(v1.h * SCALE);
const w2 = Math.round(v2.w * SCALE), h2 = Math.round(v2.h * SCALE);

function downscale(c, nw, nh) {
  const out = new Canvas(nw, nh);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) out.setPixel(x, y, c.getPixel(Math.floor(x / SCALE), Math.floor(y / SCALE)));
  }
  return out;
}

const PAD = 16, LABEL_H = 22;
const outW = w1 + w2 + PAD * 3;
const outH = Math.max(h1, h2) + LABEL_H + PAD * 2;
const out = new Canvas(outW, outH);
out.fillRect(0, 0, outW - 1, outH - 1, W.navyDk);

drawText(out, 'V1 - TAMER PLACEHOLDER + BIOMA ORIGINAL', PAD, PAD, W.steelLt);
drawText(out, 'V2 - TAMER REAL DW DS + BIOMAS DWDS (3x DENSIDADE)', w1 + PAD * 2, PAD, W.grassLt);

out.blit(downscale(v1, w1, h1), PAD, LABEL_H + PAD);
out.blit(downscale(v2, w2, h2), w1 + PAD * 2, LABEL_H + PAD);

for (let i = 0; i < Math.max(h1, h2) + LABEL_H + PAD; i++) {
  out.setPixel(w1 + PAD + PAD / 2, LABEL_H + i, withAlpha(W.steel, 180));
}

const OUT = path.join(PREV, 'world_mockup_v1_vs_v2.png');
out.save(OUT);
console.log('Comparison saved to', OUT);
