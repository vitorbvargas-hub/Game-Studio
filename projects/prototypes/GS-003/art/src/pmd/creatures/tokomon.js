'use strict';
// Tokomon -- PMD-format overworld version, same silhouette/colors as the
// battle sprite (../../tokomon.js): round cream blob, big bat ears (no
// legs -- a floater, "walk" is a hover-bob + ear-flap cycle, same documented
// decision as the battle sprite).
const { DP } = require('../../digimon_palette.js');

// Reach capped at ~1.15*rx from center so the ear tip stays inside even the
// narrowest 32px-wide animation frames (earlier versions clipped at the
// frame edge and made adjacent frames in a strip look fused together).
function earShape(c, ox, cy, rx, ry, side, flap, dk, lt) {
  const bx = ox + side * rx * 0.4;
  const tipX = bx + side * (rx * 0.75);
  const tipY = cy - ry * 0.3 - flap * 0.4;
  c.fillPolygon([
    [bx, cy - ry * 0.4], [tipX, tipY], [bx + side * rx * 0.3, cy + ry * 0.45], [bx, cy + ry * 0.25],
  ], dk);
  c.fillPolygon([
    [bx + side * 1, cy - ry * 0.28], [tipX - side * 1, tipY + 2],
    [bx + side * rx * 0.18, cy + ry * 0.3],
  ], lt);
}

function back(c, ox, cy, rx, ry, meta, pose, sp) {
  const flap = pose.flap || 0;
  const nearSide = meta.turn >= 0 ? 1 : -1;
  earShape(c, ox, cy, rx, ry, nearSide, flap, sp.ptEarDk, sp.ptEar, null);
  if (Math.abs(meta.turn) < 0.9) earShape(c, ox, cy, rx, ry, -nearSide, -flap, sp.ptEarDk, sp.ptEar, null);
}

const sp = {
  r: 9,
  body: DP.tkBody,
  bodyDk: DP.tkBodyDk,
  bodyLt: DP.tkBodyLt,
  belly: DP.tkBelly,
  accent: DP.ink,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 4,
  mouthY: 0.3,
  mouthR: 2.5,
  ptEarDk: DP.tkEarDk,
  ptEar: DP.tkEar,
  back,
};

module.exports = { sp, name: 'tokomon' };
