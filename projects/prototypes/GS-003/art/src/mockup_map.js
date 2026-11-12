'use strict';
// Mockup 1/3 -- exploration map (GS-003 "IdleDex-inspired layout" approval
// pass). Reuses the layout STRUCTURE observed in evidence/idledex (top-down
// tile map, AUTO HUD button, bottom menu bar, mini battle log) -- none of the
// art is copied; tiles, trees, Tamer and palette are original to this pack.
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const agumon = require('./agumon.js');
const gabumon = require('./gabumon.js');
const patamon = require('./patamon.js');
const {
  panel, downscale, grassTile, pathTile, circuitTree, tamerSprite, button,
} = require('./mockup_common.js');

const W = 320, H = 180;
const TILE = 16;

const PATH_TILES = new Set([
  '0,8', '1,8', '2,7', '3,7', '4,6', '5,6', '6,6', '7,5', '8,5', '9,5',
  '9,4', '10,4', '11,4', '12,3', '13,3',
]);

function iconTeam(c, x, y) {
  c.fillCircle(x + 1, y + 2, 2, P.cyan);
  c.fillCircle(x + 4, y + 2, 2, P.magenta);
}
function iconDex(c, x, y) {
  c.fillRect(x, y, x + 5, y + 5, P.steel);
  c.fillRect(x + 1, y + 1, x + 4, y + 3, P.cyanLt);
}
function iconQuest(c, x, y) {
  c.fillRect(x + 1, y, x + 1, y + 5, P.mist);
  c.fillPolygon([[x + 2, y], [x + 5, y + 1], [x + 2, y + 3]], P.amber);
}
function iconShop(c, x, y) {
  c.fillPolygon([[x, y + 1], [x + 5, y + 1], [x + 4, y + 5], [x + 1, y + 5]], P.lilac);
  c.line(x + 1, y + 1, x + 1, y, P.lilacDk, 1);
  c.line(x + 4, y + 1, x + 4, y, P.lilacDk, 1);
}
function iconArena(c, x, y) {
  c.line(x, y + 5, x + 5, y, P.steelLt, 1);
  c.line(x, y, x + 5, y + 5, P.magenta, 1);
}

function drawMap(c) {
  for (let ty = 0; ty < 10; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const x = tx * TILE, y = ty * TILE;
      if (PATH_TILES.has(`${tx},${ty}`)) pathTile(c, x, y);
      else grassTile(c, x, y, (tx + ty) % 2);
    }
  }
}

function build() {
  const c = new Canvas(W, H);
  drawMap(c);

  // Background doodads first (painter's order), characters drawn after.
  circuitTree(c, 2, 2, P.cyan);
  circuitTree(c, 150, 4, P.lilac);
  circuitTree(c, 280, 6, P.cyan);
  circuitTree(c, 60, 128, P.magenta);
  circuitTree(c, 260, 110, P.lilac);

  // Wild Digimon visible on the map (small overworld tokens, downscaled from
  // the real battle sprites -- not copies, reused pipeline art).
  const wildGabumon = downscale(gabumon.frame({ wag: 0, lift: 0, blink: false }), 2);
  const wildPatamon = downscale(patamon.frame({ flap: 2, blink: false }), 2);
  c.blit(wildGabumon, 210, 56);
  c.blit(wildPatamon, 86, 36);

  // Tamer + partner Digimon walking together along the path.
  tamerSprite(c, 128, 92, { step: 1 });
  const partner = downscale(agumon.walkFrames()[1], 2);
  c.blit(partner, 148, 98);

  // Top-left status badge.
  panel(c, 4, 4, 78, 14);
  drawText(c, 'TAMER LV3', 8, 7, P.paper);

  // AUTO HUD button, top-right -- ON state shown with a lit indicator dot.
  panel(c, 246, 4, 70, 18, { bg: withAlpha(P.cyanDk, 230) });
  drawText(c, 'AUTO', 252, 10, P.paper);
  c.fillCircle(308, 12, 3, P.volt);
  c.fillCircle(308, 12, 1, P.paper);

  // Mini battle log, bottom-left of the map viewport.
  panel(c, 4, 116, 152, 36);
  drawText(c, 'AGUMON SUBIU NIVEL', 8, 120, P.volt);
  drawText(c, 'GABUMON AVISTADO', 8, 128, P.mist);
  drawText(c, 'CAPTURA FALHOU', 8, 136, withAlpha(P.magenta, 220));

  // Bottom menu bar.
  panel(c, 0, 156, W, 24, { bevel: false });
  const labels = [
    ['TIME', iconTeam], ['DIGIVICE', iconDex], ['MISSOES', iconQuest],
    ['LOJA', iconShop], ['ARENA', iconArena],
  ];
  const bw = 60, gap = 3;
  labels.forEach(([label, icon], i) => {
    button(c, 2 + i * (bw + gap), 157, bw, 22, label, { icon });
  });

  return c;
}

function generate(outDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  const c = build();
  c.scaleNearest(3).save(`${outDir}/mapa_exploracao.png`);
  console.log('mapa_exploracao.png written.');
}

module.exports = { generate, build };
if (require.main === module) {
  generate(process.argv[2] || './out');
}
