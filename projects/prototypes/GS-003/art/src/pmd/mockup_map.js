'use strict';
// Mockup 1/2 -- exploration map, using the new PMD-format overworld sprites
// (not the battle-style sprites) for the Tamer's partner and the wild
// Digimon on the map. Reuses the layout STRUCTURE observed in
// evidence/idledex (top-down tile map, AUTO HUD button, bottom menu bar,
// mini battle log) and the tile/panel/button helpers already built for the
// Digimon-fan battle-sprite mockup (../mockup_map.js) -- no art is copied,
// only the already-approved layout helpers are reused.
const { Canvas } = require('../canvas.js');
const { P, withAlpha } = require('../palette.js');
const { drawText } = require('../font5x3.js');
const { panel, grassTile, pathTile, circuitTree, tamerSprite, button } = require('../mockup_common.js');
const { buildFrame, posesFor } = require('./common.js');
const koromon = require('./creatures/koromon.js').sp;
const agumon = require('./creatures/agumon.js').sp;
const gabumon = require('./creatures/gabumon.js').sp;
const patamon = require('./creatures/patamon.js').sp;

const W = 320, H = 180;
const TILE = 16;

const PATH_TILES = new Set([
  '0,8', '1,8', '2,7', '3,7', '4,6', '5,6', '6,6', '7,5', '8,5', '9,5',
  '9,4', '10,4', '11,4', '12,3', '13,3',
]);

function iconTeam(c, x, y) { c.fillCircle(x + 1, y + 2, 2, P.cyan); c.fillCircle(x + 4, y + 2, 2, P.magenta); }
function iconDex(c, x, y) { c.fillRect(x, y, x + 5, y + 5, P.steel); c.fillRect(x + 1, y + 1, x + 4, y + 3, P.cyanLt); }
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

// One idle frame, a given direction, PMD-format overworld sprite.
function idleToken(sp, dir) {
  return buildFrame(sp, 32, 40, dir, posesFor('Idle')[0]);
}

function build() {
  const c = new Canvas(W, H);
  drawMap(c);

  circuitTree(c, 2, 2, P.cyan);
  circuitTree(c, 150, 4, P.lilac);
  circuitTree(c, 280, 6, P.cyan);
  circuitTree(c, 60, 128, P.magenta);
  circuitTree(c, 260, 110, P.lilac);

  // Wild Digimon on the map -- PMD overworld sprites, idle, facing across
  // the path (not toward the camera) so they read as "roaming", not posed.
  c.blit(idleToken(gabumon, 'E'), 212, 50);
  c.blit(idleToken(patamon, 'W'), 80, 34);
  c.blit(idleToken(koromon, 'SW'), 250, 96);

  // Tamer + partner Digimon walking together along the path (S direction,
  // walk frame 2 = mid-stride).
  tamerSprite(c, 128, 90, { step: 1 });
  c.blit(buildFrame(agumon, 32, 32, 'S', posesFor('Walk')[1]), 146, 98);

  panel(c, 4, 4, 78, 14);
  drawText(c, 'TAMER LV3', 8, 7, P.paper);

  panel(c, 246, 4, 70, 18, { bg: withAlpha(P.cyanDk, 230) });
  drawText(c, 'AUTO', 252, 10, P.paper);
  c.fillCircle(308, 12, 3, P.volt);
  c.fillCircle(308, 12, 1, P.paper);

  panel(c, 4, 116, 152, 36);
  drawText(c, 'AGUMON SUBIU NIVEL', 8, 120, P.volt);
  drawText(c, 'GABUMON AVISTADO', 8, 128, P.mist);
  drawText(c, 'CAPTURA FALHOU', 8, 136, withAlpha(P.magenta, 220));

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
