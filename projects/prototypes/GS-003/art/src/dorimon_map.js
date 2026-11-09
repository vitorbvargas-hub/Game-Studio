'use strict';
// Dorimon -- adds S/N map-sprite directions (the asset only had W, with E
// mirrored from W) and expands every direction to a 3-frame walk cycle,
// same method as gigimon_map.js: hand-authored pixel matrix (ADR-009, no
// fillEllipse/fillCircle) for the new S/N art, reusing the EXISTING
// official-rip-derived W pixels as-is for W/E (not redrawn -- only
// bounce-varied into 00/01/02, same technique already used across this
// creature set for the walk cycle).
//
// S/N shape and palette are matched by eye to the existing W sprite
// (CREATURE-0014/sprites/CREATURE-0014_walk_W_00.png, itself derived from
// the official Digimon World DS Dorimon battle rip, see license.json):
// round blue-purple body, two upright ear points, small pale stub feet,
// no visible eye in the source art (round "fuzzball" silhouette, no face
// detail to invent).
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');

const DP = {
  ink: [0x20, 0x20, 0x20, 255],      // #202020, sampled from the existing W sprite
  hi: [0x68, 0x70, 0xb0, 255],       // #6870b0 body highlight
  mid: [0x48, 0x58, 0x90, 255],      // #485890 body base
  sh: [0x28, 0x40, 0x70, 255],       // #284070 body shadow
  deep: [0x20, 0x28, 0x50, 255],     // #202850 deep shadow
  footHi: [0xc8, 0xc8, 0xd0, 255],   // #c8c8d0 foot highlight
  foot: [0x98, 0x98, 0xa8, 255],     // #9898a8 foot base
  footDk: [0x78, 0x70, 0x80, 255],   // #787080 foot shadow
};

const W = 17, H = 19;
const CX = 8;

const BODY_ROWS = { 3: 1, 4: 3, 5: 4, 6: 5, 7: 6, 8: 6, 9: 6, 10: 7, 11: 6, 12: 6, 13: 6, 14: 5, 15: 4, 16: 3, 17: 1 };

function fillSymmetric(c, color) {
  for (const [yStr, n] of Object.entries(BODY_ROWS)) {
    const y = Number(yStr);
    for (let x = CX - n; x <= CX; x++) {
      c.setPixel(x, y, color);
      c.setPixel(2 * CX - x, y, color);
    }
  }
}

function drawEars(c) {
  const ear = [
    [5, 0, DP.mid],
    [4, 1, DP.sh], [5, 1, DP.mid], [6, 1, DP.mid],
    [4, 2, DP.sh], [5, 2, DP.hi], [6, 2, DP.mid], [7, 2, DP.mid],
    [5, 3, DP.mid], [6, 3, DP.mid], [7, 3, DP.sh],
  ];
  for (const [x, y, color] of ear) {
    c.setPixel(x, y, color);
    c.setPixel(2 * CX - x, y, color);
  }
}

function drawShading(c) {
  const hi = [[5, 5], [4, 6], [4, 7], [3, 8], [3, 9]];
  for (const [x, y] of hi) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, DP.hi);
  const sh = [[12, 11], [13, 11], [12, 12], [13, 12], [11, 13], [12, 13], [11, 14], [10, 15]];
  for (const [x, y] of sh) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, DP.sh);
  const deep = [[13, 12], [12, 13]];
  for (const [x, y] of deep) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, DP.deep);
}

function drawFeet(c, stride) {
  const dy = stride === 0 ? 0 : -1;
  const left = [[6, 17 + (stride < 0 ? dy : 0)], [7, 17 + (stride < 0 ? dy : 0)], [6, 18], [7, 18]];
  const right = [[9, 17 + (stride > 0 ? dy : 0)], [10, 17 + (stride > 0 ? dy : 0)], [9, 18], [10, 18]];
  for (const [x, y] of left) c.setPixel(x, y, DP.foot);
  for (const [x, y] of right) c.setPixel(x, y, DP.footDk);
}

function frameFront(stride) {
  const c = new Canvas(W, H);
  fillSymmetric(c, DP.mid);
  drawEars(c);
  drawShading(c);
  c.autoOutline(DP.ink);
  drawFeet(c, stride);
  return c;
}

function frameBack(stride) {
  const c = new Canvas(W, H);
  fillSymmetric(c, DP.mid);
  drawEars(c);
  drawShading(c);
  c.line(8, 4, 8, 15, [DP.sh[0], DP.sh[1], DP.sh[2], 140], 1);
  c.autoOutline(DP.ink);
  drawFeet(c, stride);
  return c;
}

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function walkFromBase(base) {
  return [base.translate(0, -1), base, base.translate(0, 1)];
}

function generate(outDir, previewDir, existingWFile) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const S = walkFromBase(frameFront(0)).map((f, i) =>
    i === 0 ? frameFront(-1).translate(0, -1) : i === 2 ? frameFront(1).translate(0, 1) : f);
  const N = walkFromBase(frameBack(0)).map((f, i) =>
    i === 0 ? frameBack(-1).translate(0, -1) : i === 2 ? frameBack(1).translate(0, 1) : f);

  const wBase = pngToCanvas(existingWFile);
  const Wdir = walkFromBase(wBase);
  const Edir = Wdir.map((f) => f.flipX());

  const written = [];
  const sets = { S, N, W: Wdir, E: Edir };
  for (const dir of ['S', 'N', 'W', 'E']) {
    sets[dir].forEach((frame, i) => {
      const name = `CREATURE-0014_walk_${dir}_0${i}.png`;
      frame.save(`${outDir}/${name}`);
      frame.scaleNearest(8).save(`${previewDir}/dorimon_${dir}_0${i}_x8.png`);
      written.push(name);
    });
  }
  console.log('Dorimon map sprites written:', written.join(', '));
  return written;
}

module.exports = { generate, frameFront, frameBack };
if (require.main === module) {
  generate(
    process.argv[2] || './out',
    process.argv[3] || './out/preview',
    process.argv[4] || path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/01-creatures/CREATURE-0014/sprites/CREATURE-0014_walk_W_00.png')
  );
}
