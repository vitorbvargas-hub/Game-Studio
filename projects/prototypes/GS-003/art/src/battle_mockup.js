'use strict';
// Battle-screen mockup, 320x180 internal resolution (see PIXEL_ART_DIRECTION.md).
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const pixelume = require('./pixelume.js');
const ferrolim = require('./ferrolim.js');
const aquabit = require('./aquabit.js');

const W = 320, H = 180;

function drawBackground(c) {
  c.fillRect(0, 0, W - 1, H - 1, P.bgGrid);
  // Horizon band.
  c.fillRect(0, 100, W - 1, H - 1, withAlpha(P.void, 160));
  // Faint scanlines across the whole screen (digital motif).
  for (let y = 0; y < H; y += 2) c.fillRect(0, y, W - 1, y, withAlpha(P.ink, 35));
  // Background circuit traces (corners), kept subtle.
  c.line(10, 14, 60, 14, withAlpha(P.steel, 90), 1);
  c.line(60, 14, 60, 30, withAlpha(P.steel, 90), 1);
  c.line(260, 160, 300, 160, withAlpha(P.steel, 90), 1);
  c.line(300, 160, 300, 140, withAlpha(P.steel, 90), 1);
  c.setPixel(60, 30, P.cyan);
  c.setPixel(300, 140, P.magenta);
  // Ground platforms.
  c.fillEllipse(76, 150, 46, 10, withAlpha(P.void, 200));
  c.fillEllipse(236, 92, 34, 8, withAlpha(P.void, 200));
}

function panel(c, x, y, w, h) {
  c.fillRect(x, y, x + w - 1, y + h - 1, withAlpha(P.void, 230));
  for (let i = 0; i < w; i++) {
    c.setPixel(x + i, y, P.ink); c.setPixel(x + i, y + h - 1, P.ink);
  }
  for (let j = 0; j < h; j++) {
    c.setPixel(x, y + j, P.ink); c.setPixel(x + w - 1, y + j, P.ink);
  }
}

function hpBar(c, x, y, w, h, ratio, color) {
  c.fillRect(x, y, x + w - 1, y + h - 1, P.steel);
  const fillW = Math.max(1, Math.round(w * ratio));
  c.fillRect(x, y, x + fillW - 1, y + h - 1, color);
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, P.ink); c.setPixel(x + i, y + h - 1, P.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, P.ink); c.setPixel(x + w - 1, y + j, P.ink); }
}

function build() {
  const c = new Canvas(W, H);
  drawBackground(c);

  const enemy = ferrolim.frame({ lift: 0, tilt: 0, pulse: true }).scaleNearest(2);
  const player = aquabit.frame({ squash: 0, pulse: true, phase: false, blink: false }).scaleNearest(2);
  const ally = pixelume.frame({ bob: 0, pulse: 1, blink: false }).scaleNearest(1);

  c.blit(enemy, 210, 40);
  c.blit(player, 30, 86);
  c.blit(ally, 150, 128); // second party member peeking in, bench-style

  // Enemy panel (top-left).
  panel(c, 8, 8, 118, 30);
  drawText(c, 'FERROLIM', 12, 12, P.paper);
  drawText(c, 'LV5', 96, 12, P.mist);
  hpBar(c, 12, 22, 110, 6, 0.8, P.volt);

  // Player panel (bottom-right).
  panel(c, 196, 132, 118, 38);
  drawText(c, 'AQUABIT', 200, 136, P.paper);
  drawText(c, 'LV4', 284, 136, P.mist);
  hpBar(c, 200, 146, 110, 6, 0.6, P.cyan);
  drawText(c, '54/90', 200, 156, P.mist);

  return c;
}

function generate(outDir, previewDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  const c = build();
  c.save(`${outDir}/battle_mockup_320x180.png`);
  c.scaleNearest(4).save(`${previewDir}/battle_mockup_x4.png`);
  console.log('Battle mockup written.');
}

module.exports = { generate, build };

if (require.main === module) {
  const outDir = process.argv[2] || './out';
  const previewDir = process.argv[3] || './out/preview';
  generate(outDir, previewDir);
}
