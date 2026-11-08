'use strict';
// Battle-screen mockup for the Digimon-fan content pack (ADR-007).
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const agumon = require('./agumon.js');
const gabumon = require('./gabumon.js');
const patamon = require('./patamon.js');

const W = 320, H = 180;

function drawBackground(c) {
  c.fillRect(0, 0, W - 1, H - 1, P.bgGrid);
  c.fillRect(0, 100, W - 1, H - 1, withAlpha(P.void, 160));
  c.fillEllipse(76, 150, 46, 10, withAlpha(P.void, 200));
  c.fillEllipse(236, 92, 34, 8, withAlpha(P.void, 200));
}

function panel(c, x, y, w, h) {
  c.fillRect(x, y, x + w - 1, y + h - 1, withAlpha(P.void, 230));
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, P.ink); c.setPixel(x + i, y + h - 1, P.ink); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, P.ink); c.setPixel(x + w - 1, y + j, P.ink); }
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

  const enemy = gabumon.frame({ wag: 0, lift: 0, blink: false }).scaleNearest(2);
  const player = agumon.frame({ wag: 0, lift: 0, open: false, blink: false }).scaleNearest(2);
  const ally = patamon.frame({ flap: 0, blink: false }).scaleNearest(1);

  c.blit(enemy, 210, 40);
  c.blit(player, 30, 86);
  c.blit(ally, 150, 128);

  panel(c, 8, 8, 118, 30);
  drawText(c, 'GABUMON', 12, 12, P.paper);
  drawText(c, 'LV5', 96, 12, P.mist);
  hpBar(c, 12, 22, 110, 6, 0.8, P.volt);

  panel(c, 196, 132, 118, 38);
  drawText(c, 'AGUMON', 200, 136, P.paper);
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
  c.save(`${outDir}/battle_mockup_digimon_320x180.png`);
  c.scaleNearest(4).save(`${previewDir}/battle_mockup_digimon_x4.png`);
  console.log('Digimon battle mockup written.');
}

module.exports = { generate, build };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
