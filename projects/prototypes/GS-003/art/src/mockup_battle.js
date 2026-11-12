'use strict';
// Mockup 2/3 -- battle screen. Real layered background (sky/horizon/field/
// silhouette trees), big sprites, numeric HP, a 4-button move/decision panel,
// and a "Varredura" (scan) popup -- our own term for the capture moment, not
// a Poke Ball reskin.
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const { DP } = require('./digimon_palette.js');
const agumon = require('./agumon.js');
const gabumon = require('./gabumon.js');
const { panel, hpBarNum, circuitTree, button } = require('./mockup_common.js');

const W = 320, H = 180;

function drawBackground(c) {
  c.fillRect(0, 0, W - 1, 58, P.bgGrid);
  c.fillRect(0, 0, W - 1, 30, withAlpha(P.void, 160));
  for (let i = 0; i < 6; i++) {
    c.setPixel(Math.round(20 + i * 50), 10 + (i % 2) * 6, withAlpha(P.paper, 160));
  }
  circuitTree(c, 18, 36, withAlpha(P.cyan, 150));
  circuitTree(c, 268, 34, withAlpha(P.lilac, 150));
  c.fillRect(150, 10, 156, 40, withAlpha(P.steel, 180));
  c.fillRect(151, 14, 155, 15, withAlpha(P.cyanLt, 120));
  c.fillRect(151, 22, 155, 23, withAlpha(P.cyanLt, 80));

  c.fillRect(0, 58, W - 1, H - 1, withAlpha(P.cyanDk, 60));
  c.fillRect(0, 58, W - 1, H - 1, P.void);
  for (let y = 58; y < H; y += 1) {
    const t = (y - 58) / (H - 58);
    const shade = Math.round(40 - t * 30);
    c.line(0, y, W - 1, y, withAlpha(P.ink, shade), 1);
  }
  c.line(0, 58, W - 1, 58, withAlpha(P.cyanLt, 180), 1);
  for (let i = 0; i < 7; i++) {
    const y = 64 + i * i * 2;
    if (y >= H) break;
    c.line(0, y, W - 1, y, withAlpha(P.steelLt, 50), 1);
  }
  c.fillEllipse(238, 96, 42, 10, withAlpha(P.void, 200));
  c.fillEllipse(62, 142, 50, 11, withAlpha(P.void, 200));
}

function build() {
  const c = new Canvas(W, H);
  drawBackground(c);

  const enemy = gabumon.frame({ wag: 1, lift: 0, blink: false }).scaleNearest(2);
  const player = agumon.frame({ wag: 0, lift: 0, open: true, blink: false }).scaleNearest(2);
  c.blit(enemy, 198, 36);
  c.blit(player, 12, 46);

  panel(c, 6, 4, 132, 30);
  drawText(c, 'GABUMON', 10, 8, P.paper);
  drawText(c, 'LV5', 112, 8, P.mist);
  hpBarNum(c, 10, 18, 118, 6, 72, 90, P.volt);

  panel(c, 184, 4, 130, 30);
  drawText(c, 'AGUMON', 188, 8, P.paper);
  drawText(c, 'LV4', 262, 8, P.mist);
  hpBarNum(c, 188, 18, 118, 6, 54, 90, P.cyan);

  // Decision panel: bottom bar housing 2-4 move buttons.
  panel(c, 0, 144, W, 36, { bevel: false });
  const moves = ['GARRA', 'CHAMA', 'DEFESA', 'VARREDURA'];
  const bw = 76, gap = 3;
  moves.forEach((m, i) => {
    button(c, 2 + i * (bw + gap), 146, bw, 32, m, { active: m === 'VARREDURA' });
  });

  // "Varredura" scan popup, overlaying the field above the move bar.
  panel(c, 76, 56, 168, 58, { bg: withAlpha(P.void, 245) });
  drawText(c, 'VARREDURA', 84, 62, P.cyanLt);
  drawText(c, 'GABUMON VACINA', 84, 72, P.mist);
  drawText(c, 'DADOS', 84, 82, withAlpha(P.paper, 220));
  hpBarNum(c, 112, 82, 112, 6, 64, 100, P.lilac);

  return c;
}

function generate(outDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  const c = build();
  c.scaleNearest(3).save(`${outDir}/batalha.png`);
  console.log('batalha.png written.');
}

module.exports = { generate, build };
if (require.main === module) {
  generate(process.argv[2] || './out');
}
