'use strict';
// Contact sheet proof for gigimon_map.js -- all 3 frames x 4 directions
// (S/N/W/E), labeled, for the GS-003 review (replaces the stale
// CREATURE-0002/previews/map_walk_x4.png, which showed the wrong Pagumon
// fallback under the Gigimon name).
const { Canvas } = require('./canvas.js');
const { drawText } = require('./font5x3.js');
const { frameS, frameN, frameW, W: FW, H: FH } = require('./gigimon_map.js');

const DIRS = ['S', 'N', 'W', 'E'];
const PANEL = [0x1d, 0x22, 0x38, 255];
const UI = [0xee, 0xf2, 0xfb, 255];

function set(frameFn, mid, a, b) {
  const f01 = frameFn(mid);
  const f00 = frameFn(a).translate(0, -1);
  const f02 = frameFn(b).translate(0, 1);
  return [f00, f01, f02];
}

function generate(outPath) {
  const sets = {
    S: set(frameS, { open: false, blink: false, stride: 0 }, { open: true, blink: false, stride: -1 }, { open: false, blink: true, stride: 1 }),
    N: set(frameN, { wag: false, stride: 0 }, { wag: true, stride: -1 }, { wag: false, stride: 1 }),
    W: set(frameW, { open: false, blink: false, stride: 0 }, { open: true, blink: false, stride: -1 }, { open: false, blink: true, stride: 1 }),
  };
  sets.E = sets.W.map((f) => f.flipX());

  const scale = 6;
  const cell = FW * scale;
  const rowH = FH * scale;
  const pad = 12, labelH = 14;
  const sheetW = pad + 40 + (cell + pad) * 3;
  const sheetH = pad + labelH + (rowH + labelH + pad) * DIRS.length;
  const sheet = new Canvas(sheetW, sheetH);
  sheet.fillRect(0, 0, sheetW - 1, sheetH - 1, PANEL);
  drawText(sheet, 'GIGIMON MAP WALK S N W E', pad, 4, UI);

  let y = pad + labelH;
  for (const dir of DIRS) {
    drawText(sheet, dir, pad, y + rowH / 2 - 2, UI);
    sets[dir].forEach((f, i) => {
      const x = pad + 40 + i * (cell + pad);
      sheet.blit(f.scaleNearest(scale), x, y);
    });
    y += rowH + labelH + pad;
  }
  sheet.save(outPath);
  console.log('Gigimon contact sheet written:', outPath);
}

module.exports = { generate };
if (require.main === module) {
  generate(process.argv[2] || './out/gigimon_contact.png');
}
