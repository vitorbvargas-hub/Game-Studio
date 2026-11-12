'use strict';
// Composes the 3 PMD-format sheets (Anim/Shadow/Offsets) from per-direction
// frame lists. Layout: one row per direction (S,SE,E,NE,N,NW,W,SW top to
// bottom), one column per frame -- matches the founder's reference sheet
// structure (art/reference/pmd-format-founder/).
const { Canvas } = require('../canvas.js');
const { DIR_ORDER } = require('./common.js');

function buildGridPng(framesByDir, frameW, frameH) {
  const n = framesByDir[DIR_ORDER[0]].length;
  const sheet = new Canvas(frameW * n, frameH * 8);
  DIR_ORDER.forEach((d, row) => {
    framesByDir[d].forEach((f, col) => sheet.blit(f, col * frameW, row * frameH));
  });
  return sheet;
}

// Offsets.png convention used by this pack: NOT a reverse-engineered copy of
// PMD Collab's exact multi-point marker spec (that wasn't verified from any
// source this task is allowed to use) -- a simplified, documented convention
// of our own: one opaque magenta anchor pixel per frame cell, at the
// sprite's ground-contact point (bottom-center), so an engine can align the
// sprite to its tile without guessing. See README.md "Offsets.png" section.
function buildOffsetsPng(frameW, frameH, nFrames, anchorY) {
  const marker = [255, 0, 255, 255];
  const sheet = new Canvas(frameW * nFrames, frameH * 8);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < nFrames; col++) {
      sheet.setPixel(col * frameW + Math.floor(frameW / 2), row * frameH + anchorY, marker);
    }
  }
  return sheet;
}

module.exports = { buildGridPng, buildOffsetsPng };
