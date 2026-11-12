'use strict';
// Mockup 3/3 -- team & evolution screen. Three Digimon cards (one selected),
// a training-points counter, and an evolution tree: baby placeholder ->
// current rookie (real sprite) -> locked champion placeholder with a level
// gate, showing the progression structure without claiming art not yet made.
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const agumon = require('./agumon.js');
const gabumon = require('./gabumon.js');
const patamon = require('./patamon.js');
const { panel, hpBarNum, downscale, dataBlobPlaceholder } = require('./mockup_common.js');

const W = 320, H = 180;

function card(c, x, y, w, h, name, lv, hp, maxHp, frame, hpColor, opts = {}) {
  panel(c, x, y, w, h, { bg: opts.selected ? withAlpha(P.cyanDk, 210) : withAlpha(P.void, 215) });
  if (opts.selected) {
    for (let i = 0; i < w; i++) c.setPixel(x + i, y, P.cyanLt);
    for (let i = 0; i < w; i++) c.setPixel(x + i, y + h - 1, P.cyanLt);
  }
  const token = downscale(frame, 1);
  c.blit(token, x + Math.round(w / 2 - token.w / 2), y + 4);
  drawText(c, name, x + 6, y + 50, P.paper);
  drawText(c, `LV${lv}`, x + w - 24, y + 50, P.mist);
  hpBarNum(c, x + 6, y + 58, w - 12, 5, hp, maxHp, hpColor);
}

function lockedNode(c, x, y, size) {
  dataBlobPlaceholder(c, x, y, size, P.steelLt);
  // small padlock glyph drawn directly (no font glyph needed)
  const lx = x + size / 2 - 3, ly = y + size - 10;
  c.fillRect(lx, ly, lx + 5, ly + 4, P.mist);
  c.line(lx + 1, ly - 2, lx + 1, ly, P.mist, 1);
  c.line(lx + 4, ly - 2, lx + 4, ly, P.mist, 1);
  c.line(lx + 1, ly - 2, lx + 4, ly - 2, P.mist, 1);
}

function build() {
  const c = new Canvas(W, H);
  c.fillRect(0, 0, W - 1, H - 1, P.bgGrid);
  c.fillRect(0, 0, W - 1, H - 1, withAlpha(P.void, 120));

  drawText(c, 'TIME', 8, 6, P.paper);
  panel(c, 224, 2, 94, 16, { bg: withAlpha(P.void, 230) });
  c.fillRect(230, 7, 233, 10, P.amber);
  c.fillRect(232, 5, 235, 12, P.amberDk);
  drawText(c, 'TREINO 24', 240, 6, P.paper);

  const cardW = 100, cardH = 68, gap = 6;
  card(c, 6, 22, cardW, cardH, 'AGUMON', 4, 54, 90,
    agumon.frame({ wag: 0, lift: 0, open: false, blink: false }), P.cyan, { selected: true });
  card(c, 6 + cardW + gap, 22, cardW, cardH, 'GABUMON', 3, 38, 80,
    gabumon.frame({ wag: 0, lift: 0, blink: false }), P.volt, {});
  card(c, 6 + (cardW + gap) * 2, 22, cardW, cardH, 'PATAMON', 3, 44, 75,
    patamon.frame({ flap: 0, blink: false }), P.volt, {});

  // Evolution tree panel.
  panel(c, 6, 98, W - 12, 76, { bg: withAlpha(P.void, 220) });
  drawText(c, 'EVOLUCAO', 12, 102, P.paper);

  const babyTok = downscale(agumon.frame({ wag: 0, lift: 0, open: false, blink: true }), 2);
  const rookieTok = agumon.frame({ wag: 1, lift: 1, open: true, blink: false });
  const y0 = 118, nodeSize = 44;
  // Baby stage placeholder -- Koromon art not yet in this pack.
  dataBlobPlaceholder(c, 24, y0, nodeSize, P.magenta);
  drawText(c, 'KOROMON', 18, y0 + nodeSize + 2, P.mist);
  c.line(24 + nodeSize, y0 + nodeSize / 2, 24 + nodeSize + 26, y0 + nodeSize / 2, withAlpha(P.cyanLt, 200), 1);
  c.fillPolygon([[24 + nodeSize + 26, y0 + nodeSize / 2 - 3], [24 + nodeSize + 32, y0 + nodeSize / 2], [24 + nodeSize + 26, y0 + nodeSize / 2 + 3]], P.cyanLt);

  const rx = 24 + nodeSize + 36;
  panel(c, rx - 3, y0 - 3, nodeSize + 6, nodeSize + 6, { bg: withAlpha(P.cyanDk, 160) });
  c.blit(rookieTok, rx, y0 - 2);
  drawText(c, 'AGUMON', rx - 2, y0 + nodeSize + 2, P.paper);

  const lineX2 = rx + nodeSize + 6;
  c.line(rx + nodeSize + 3, y0 + nodeSize / 2, lineX2 + 20, y0 + nodeSize / 2, withAlpha(P.steelLt, 160), 1);
  c.fillPolygon([[lineX2 + 20, y0 + nodeSize / 2 - 3], [lineX2 + 26, y0 + nodeSize / 2], [lineX2 + 20, y0 + nodeSize / 2 + 3]], P.steelLt);

  const cx = lineX2 + 30;
  lockedNode(c, cx, y0, nodeSize);
  drawText(c, 'LV16', cx + 10, y0 + nodeSize + 2, P.mist);

  void babyTok; // reserved: small portrait kept for future card swap, unused in this layout

  return c;
}

function generate(outDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  const c = build();
  c.scaleNearest(3).save(`${outDir}/time.png`);
  console.log('time.png written.');
}

module.exports = { generate, build };
if (require.main === module) {
  generate(process.argv[2] || './out');
}
