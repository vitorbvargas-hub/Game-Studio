'use strict';
// Patamon -- PMD-format overworld version, same silhouette/colors as the
// battle sprite (../../patamon.js): round tan body, bigger bat-wing ears
// than Tokomon, small foot nubs. "Walk" reinterpreted as hover-bob +
// ear-flap, same documented decision as the battle sprite.
const { DP } = require('../../digimon_palette.js');

// Reach capped at ~1.2*rx from center (Patamon's ears are a bit bigger than
// Tokomon's but still inside the narrowest 32px-wide frames -- see the
// comment in tokomon.js for why this matters).
function earShape(c, ox, cy, rx, ry, side, flap, dk, lt) {
  const bx = ox + side * rx * 0.42;
  const tipX = bx + side * (rx * 0.82);
  const tipY = cy - ry * 0.35 - flap * 0.5;
  c.fillPolygon([
    [bx, cy - ry * 0.45], [tipX, tipY], [bx + side * rx * 0.32, cy + ry * 0.5], [bx, cy + ry * 0.28],
  ], dk);
  c.fillPolygon([
    [bx + side * 1, cy - ry * 0.33], [tipX - side * 1, tipY + 2],
    [bx + side * rx * 0.2, cy + ry * 0.35],
  ], lt);
}

function back(c, ox, cy, rx, ry, meta, pose) {
  const flap = pose.flap || 0;
  const nearSide = meta.turn >= 0 ? 1 : -1;
  earShape(c, ox, cy, rx, ry, nearSide, flap, DP.ptEarDk, DP.ptEar);
  if (Math.abs(meta.turn) < 0.9) earShape(c, ox, cy, rx, ry, -nearSide, -flap, DP.ptEarDk, DP.ptEar);
}

function front(c, ox, cy, rx, ry, meta, pose, sp) {
  const fy = cy + ry * 0.92;
  c.fillCircle(ox - rx * 0.3, fy, 2, sp.body);
  c.fillCircle(ox + rx * 0.3, fy, 2, sp.body);
}

const sp = {
  r: 11,
  body: DP.ptBody,
  bodyDk: DP.ptBodyDk,
  bodyLt: DP.paper,
  belly: DP.paper,
  accent: DP.ink,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 5,
  mouthY: 0.28,
  back,
  front,
};

module.exports = { sp, name: 'patamon' };
