'use strict';
// Original "nice placeholder" Tamer (trainer) overworld sprite -- no
// reference traced, generic RPG-trainer silhouette (cap, jacket, backpack),
// scaled to read next to the real native-DS-scale creature sprites (see
// DECISIONS.md for the scale rationale). ~56x108, pivot at the feet.
const { Canvas } = require('./canvas.js');
const { W, withAlpha } = require('./endesga32.js');

function tamer(opts = {}) {
  const shirt = opts.shirt || W.waterBright;
  const shirtDk = opts.shirtDk || W.waterMid;
  const cap = opts.cap || W.red;
  const capDk = opts.capDk || W.redDk;
  const hair = opts.hair || W.dirtDarkest;
  const step = opts.step || 0;
  const w = 56, h = 108;
  const c = new Canvas(w, h);
  const cx = 28;

  // legs/shoes
  c.fillRect(cx - 10, 78 + step, cx - 2, 100, W.navyDk);
  c.fillRect(cx + 2, 78 - step, cx + 10, 100, W.navyDk);
  c.fillRect(cx - 11, 96 + step, cx - 1, 102, W.ink);
  c.fillRect(cx + 1, 96 - step, cx + 11, 102, W.ink);

  // backpack (drawn before torso so it peeks on the side, reads as 3/4 view)
  c.fillRect(cx + 10, 46, cx + 20, 76, W.purple);
  c.fillRect(cx + 10, 46, cx + 14, 76, [0x4e, 0x29, 0x52, 255]);

  // torso / jacket
  c.fillRect(cx - 16, 40, cx + 16, 80, shirt);
  c.fillRect(cx - 16, 64, cx + 16, 80, shirtDk);
  c.fillRect(cx - 18, 42, cx - 12, 68, shirt);
  c.fillRect(cx + 12, 42, cx + 18, 68, shirtDk);
  // arms/hands
  c.fillRect(cx - 18, 60, cx - 12, 70, W.skin);
  c.fillRect(cx + 12, 60, cx + 18, 70, W.skin);
  // belt
  c.fillRect(cx - 16, 76, cx + 16, 79, W.dirtDarkest);

  // head
  c.fillCircle(cx, 24, 15, W.skin);
  c.fillEllipse(cx + 5, 26, 11, 13, withAlpha(W.skinDk, 90));
  // cap
  c.fillEllipse(cx, 14, 16, 10, cap);
  c.fillRect(cx - 16, 10, cx + 16, 16, cap);
  c.fillEllipse(cx - 11, 16, 9, 5, capDk);
  c.fillRect(cx - 18, 14, cx - 10, 18, cap); // brim
  c.fillRect(cx - 2, 2, cx + 2, 10, cap); // brim button
  // hair wisps under cap
  c.fillRect(cx + 8, 16, cx + 13, 22, hair);
  // eyes
  c.setPixel(cx - 4, 25, W.ink);
  c.setPixel(cx + 3, 25, W.ink);

  c.autoOutline(W.ink);
  c.fillEllipse(cx, 103, 15, 4, withAlpha(W.ink, 90));
  return c;
}

module.exports = { tamer };
