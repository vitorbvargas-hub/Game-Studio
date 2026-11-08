'use strict';
// Contact sheet for the Digimon-fan content pack (ADR-007) -- one reference
// PNG showing every delivered frame (idle/walk/attack/hit) for Agumon,
// Gabumon and Patamon side by side, labelled, for review before integration.
const { Canvas } = require('./canvas.js');
const { P } = require('./palette.js');
const { drawText } = require('./font5x3.js');
const agumon = require('./agumon.js');
const gabumon = require('./gabumon.js');
const patamon = require('./patamon.js');

const CELL = 48;
const SCALE = 2;
const CELL_PX = CELL * SCALE;
const LABEL_W = 70;
const HEADER_H = 22;
const GROUP_GAP = 4;

const GROUPS = [
  { name: 'IDLE', key: 'idle', count: 2 },
  { name: 'WALK', key: 'walk', count: 4 },
  { name: 'ATTACK', key: 'attack', count: 3 },
  { name: 'HIT', key: 'hit', count: 2 },
];

function creatures() {
  return [
    {
      name: 'AGUMON',
      idle: [
        agumon.frame({ wag: 0, lift: 0, open: false, blink: false }),
        agumon.frame({ wag: 2, lift: 1, open: true, blink: true }),
      ],
      walk: agumon.walkFrames(),
      attack: agumon.attackFrames(),
      hit: agumon.hitFrames(),
    },
    {
      name: 'GABUMON',
      idle: [
        gabumon.frame({ wag: 0, lift: 0, blink: false }),
        gabumon.frame({ wag: 2, lift: 1, blink: true }),
      ],
      walk: gabumon.walkFrames(),
      attack: gabumon.attackFrames(),
      hit: gabumon.hitFrames(),
    },
    {
      name: 'PATAMON',
      idle: [
        patamon.frame({ flap: 0, blink: false }),
        patamon.frame({ flap: 3, blink: true }),
      ],
      walk: patamon.walkFrames(),
      attack: patamon.attackFrames(),
      hit: patamon.hitFrames(),
    },
  ];
}

function drawLabel(sheet, text, x, y, color, scale) {
  const tmp = new Canvas(text.length * 4 + 2, 6);
  drawText(tmp, text, 1, 0, color);
  sheet.blit(tmp.scaleNearest(scale), x, y);
}

function cellBorder(c, x, y, w, h, color) {
  for (let i = 0; i < w; i++) { c.setPixel(x + i, y, color); c.setPixel(x + i, y + h - 1, color); }
  for (let j = 0; j < h; j++) { c.setPixel(x, y + j, color); c.setPixel(x + w - 1, y + j, color); }
}

function build() {
  const rows = creatures();
  const totalCols = GROUPS.reduce((s, g) => s + g.count, 0);
  const width = LABEL_W + totalCols * CELL_PX + (GROUPS.length - 1) * GROUP_GAP;
  const height = HEADER_H + rows.length * CELL_PX;
  const sheet = new Canvas(width, height);
  sheet.fillRect(0, 0, width - 1, height - 1, P.void);

  let hx = LABEL_W;
  for (const g of GROUPS) {
    drawLabel(sheet, g.name, hx + 4, 6, P.paper, 2);
    hx += g.count * CELL_PX + GROUP_GAP;
  }

  rows.forEach((cr, row) => {
    const y = HEADER_H + row * CELL_PX;
    drawLabel(sheet, cr.name, 4, y + CELL_PX / 2 - 3, P.mist, 2);
    let cx = LABEL_W;
    for (const g of GROUPS) {
      for (let i = 0; i < g.count; i++) {
        sheet.blit(cr[g.key][i].scaleNearest(SCALE), cx, y);
        cellBorder(sheet, cx, y, CELL_PX, CELL_PX, P.ink);
        cx += CELL_PX;
      }
      cx += GROUP_GAP;
    }
  });

  return sheet;
}

function generate(previewDir) {
  const fs = require('fs');
  fs.mkdirSync(previewDir, { recursive: true });
  build().save(`${previewDir}/digimon_fan_contact_sheet.png`);
  console.log('Digimon-fan contact sheet written.');
}

module.exports = { generate, build };
if (require.main === module) {
  generate(process.argv[2] || './out/preview');
}
