'use strict';
// Contact sheet proof for gigimon_official_map.js -- all 3 frames x 4
// directions (S/N/W/E), labeled, replacing gigimon_map_contact.js's output
// for the official-base GS-003 revision.
const { Canvas } = require('./canvas.js');
const { drawText } = require('./font5x3.js');
const { extractOfficialBase, buildBackBase, hopSet, FRAME_W, FRAME_H } = require('./gigimon_official_map.js');

const DIRS = ['S', 'N', 'W', 'E'];
const PANEL = [0x1d, 0x22, 0x38, 255];
const UI = [0xee, 0xf2, 0xfb, 255];

function generate(outPath) {
  const sBase = extractOfficialBase();
  const nBase = buildBackBase();
  const wBase = sBase.flipX();
  const sets = { S: hopSet(sBase), N: hopSet(nBase), W: hopSet(wBase) };
  sets.E = sets.W.map((f) => f.flipX());

  const scale = 6;
  const cell = FRAME_W * scale;
  const rowH = FRAME_H * scale;
  const pad = 12, labelH = 14;
  const sheetW = pad + 40 + (cell + pad) * 3;
  const sheetH = pad + labelH + (rowH + labelH + pad) * DIRS.length;
  const sheet = new Canvas(sheetW, sheetH);
  sheet.fillRect(0, 0, sheetW - 1, sheetH - 1, PANEL);
  drawText(sheet, 'GIGIMON MAP WALK (OFFICIAL BASE) S N W E', pad, 4, UI);

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
  console.log('Gigimon (official base) contact sheet written:', outPath);
}

module.exports = { generate };
if (require.main === module) {
  generate(process.argv[2] || './out/gigimon_official_contact.png');
}
