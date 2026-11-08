'use strict';
// Loads a real imported creature PNG (GAME-ASSETS/01-creatures/CREATURE-NNNN)
// as a Canvas, and its creature.json metadata (pivot/hitbox/anchors).
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { loadPNG } = require('./png_decode.js');

const CREATURES_BASE = path.resolve(
  __dirname, '../../../../../assets/GAME-ASSETS/01-creatures'
);

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function loadCreature(id) {
  const dir = path.join(CREATURES_BASE, `CREATURE-${id}`);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'creature.json'), 'utf8'));
  const spritesDir = path.join(dir, 'sprites');
  const frames = {};
  for (const anim of Object.values(meta.animations)) {
    for (const f of anim.frames) {
      if (!frames[f.atlasKey]) {
        frames[f.atlasKey] = pngToCanvas(path.join(spritesDir, f.atlasKey));
      }
    }
  }
  return { meta, frames };
}

module.exports = { pngToCanvas, loadCreature, CREATURES_BASE };
