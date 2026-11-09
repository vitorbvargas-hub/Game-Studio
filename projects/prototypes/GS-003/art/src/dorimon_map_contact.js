'use strict';
// Contact sheet proof for dorimon_map.js -- replaces the stale W/E-only
// CREATURE-0014/previews/map_walk_x4.png now that S/N exist too.
const path = require('path');
const { Canvas } = require('./canvas.js');
const { drawText } = require('./font5x3.js');
const { generate: genSprites } = require('./dorimon_map.js');

const DIRS = ['S', 'N', 'W', 'E'];
const PANEL = [0x1d, 0x22, 0x38, 255];
const UI = [0xee, 0xf2, 0xfb, 255];

function generate(outPath, wFile) {
  const fs = require('fs');
  const tmp = fs.mkdtempSync('/tmp/dorimon_contact_');
  genSprites(tmp, tmp, wFile);
  const { loadPNG } = require('./png_decode.js');
  function load(name) {
    const { width, height, data } = loadPNG(`${tmp}/${name}`);
    const c = new Canvas(width, height);
    Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
    return c;
  }

  const scale = 8;
  const fw = 17, fh = 19;
  const cell = fw * scale, rowH = fh * scale;
  const pad = 12, labelH = 14;
  const sheetW = pad + 30 + (cell + pad) * 3;
  const sheetH = pad + labelH + (rowH + labelH + pad) * DIRS.length;
  const sheet = new Canvas(sheetW, sheetH);
  sheet.fillRect(0, 0, sheetW - 1, sheetH - 1, PANEL);
  drawText(sheet, 'DORIMON MAP WALK S N W E', pad, 4, UI);

  let y = pad + labelH;
  for (const dir of DIRS) {
    drawText(sheet, dir, pad, y + rowH / 2 - 2, UI);
    for (let i = 0; i < 3; i++) {
      const f = load(`CREATURE-0014_walk_${dir}_0${i}.png`);
      sheet.blit(f.scaleNearest(scale), pad + 30 + i * (cell + pad), y);
    }
    y += rowH + labelH + pad;
  }
  sheet.save(outPath);
  console.log('Dorimon contact sheet written:', outPath);
}

module.exports = { generate };
if (require.main === module) {
  generate(
    process.argv[2] || './out/dorimon_contact.png',
    process.argv[3] || path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/01-creatures/CREATURE-0014/versions/v2/sprites/CREATURE-0014_walk_W_00.png')
  );
}
