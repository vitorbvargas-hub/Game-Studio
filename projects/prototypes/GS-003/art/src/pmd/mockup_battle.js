'use strict';
// Mockup 2/2 -- battle screen, using the new PMD-format overworld sprites.
//
// Layout choice (documented per the task brief, "escolha e justifique"):
// a DEDICATED battle screen with its own background, not a battle-on-map
// overlay like IdleDex's. Reasons:
//  1. The PMD-format Attack/Hurt frames only read clearly at a larger scale
//     (the lunge/flash/knockback detail is close to invisible at the 16px
//     overworld-tile scale used on the exploration map).
//  2. A dedicated screen has room for both combatants' HP panels without
//     covering tiles or the Tamer's own sprite, which the map screen's real
//     estate does not comfortably allow at 320x180.
//  3. It still mirrors the map screen's own HUD language (AUTO indicator,
//     mini battle log, same panel/button style) so the two screens read as
//     the same product, not a jarring second UI.
const { Canvas } = require('../canvas.js');
const { P, withAlpha } = require('../palette.js');
const { drawText } = require('../font5x3.js');
const { panel } = require('../mockup_common.js');
const { buildFrame, posesFor } = require('./common.js');
const agumon = require('./creatures/agumon.js').sp;
const gabumon = require('./creatures/gabumon.js').sp;

const W = 320, H = 180;

function drawBackground(c) {
  c.fillRect(0, 0, W - 1, H - 1, P.bgGrid);
  c.fillRect(0, 100, W - 1, H - 1, withAlpha(P.void, 160));
  c.fillEllipse(96, 150, 50, 10, withAlpha(P.void, 200));
  c.fillEllipse(226, 70, 38, 9, withAlpha(P.void, 200));
  for (let y = 10; y < H; y += 4) c.line(0, y, W - 1, y, withAlpha(P.ink, 40), 1);
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

  // Foe (Gabumon), idle, facing the player (W = looking left across the
  // screen toward the player's side).
  const foe = buildFrame(gabumon, 32, 40, 'W', posesFor('Idle')[0]).scaleNearest(3);
  c.blit(foe, 170, 24);

  // Player's partner (Agumon), attack impact frame (facing NE -- lunging up
  // toward the foe), scaled up so the lunge/flash reads clearly without
  // overflowing the 180px-tall canvas or the bottom log panel.
  const player = buildFrame(agumon, 48, 48, 'NE', posesFor('Attack')[1]).scaleNearest(2);
  c.blit(player, 36, 28);

  // Impact burst + damage number, selling the hit without a real VFX layer.
  c.fillCircle(176, 46, 10, withAlpha(P.amber, 180));
  c.fillCircle(176, 46, 5, withAlpha(P.paper, 220));
  drawText(c, '-18', 182, 40, P.amber);

  panel(c, 8, 8, 118, 30);
  drawText(c, 'GABUMON', 12, 12, P.paper);
  drawText(c, 'LV5', 96, 12, P.mist);
  hpBar(c, 12, 22, 110, 6, 0.62, P.magenta);

  panel(c, 196, 132, 118, 38);
  drawText(c, 'AGUMON', 200, 136, P.paper);
  drawText(c, 'LV4', 284, 136, P.mist);
  hpBar(c, 200, 146, 110, 6, 0.82, P.cyan);
  drawText(c, '74/90', 200, 156, P.mist);

  // AUTO indicator + mini battle log, same HUD language as the map screen.
  panel(c, 246, 4, 70, 16, { bg: withAlpha(P.cyanDk, 230) });
  drawText(c, 'AUTO', 252, 8, P.paper);
  c.fillCircle(308, 10, 2, P.volt);

  panel(c, 4, 132, 150, 28);
  drawText(c, 'AGUMON USOU GARRA!', 8, 136, P.paper);
  drawText(c, 'GABUMON -18 HP', 8, 144, P.mist);

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
