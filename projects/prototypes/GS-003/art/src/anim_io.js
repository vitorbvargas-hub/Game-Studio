'use strict';
// Shared frame-writing helper so every creature generator (agumon/gabumon/
// patamon) outputs sprites + x8 previews the same way, <monstro>_<anim>_<NN>.png.
const fs = require('fs');

function writeFrames(frames, outDir, previewDir, baseName) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  frames.forEach((f, i) => {
    const name = `${baseName}_${String(i + 1).padStart(2, '0')}`;
    f.save(`${outDir}/${name}.png`);
    f.scaleNearest(8).save(`${previewDir}/${name}_x8.png`);
  });
}

module.exports = { writeFrames };
