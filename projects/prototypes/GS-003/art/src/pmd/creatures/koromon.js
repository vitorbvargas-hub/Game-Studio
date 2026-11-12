'use strict';
// Koromon -- PMD-format overworld version, same silhouette/colors as the
// battle sprite (../../koromon.js): round pink blob, red cowlick, stub feet.
const { DP, withAlpha } = require('../../digimon_palette.js');

function back() {} // nothing behind the body for Koromon

function front(c, ox, cy, rx, ry, meta, pose, sp) {
  // red cowlick, top of head
  const topY = cy - ry;
  const lean = meta.turn * 2;
  c.fillPolygon([[ox + lean, topY - 7], [ox - 3 + lean, topY + 2], [ox + 3 + lean, topY + 2]], sp.accent);
  // stub feet
  const fy = cy + ry * 0.9;
  const step = pose.legOffset || 0;
  c.fillEllipse(ox - rx * 0.35, fy - Math.max(0, -step) * 0.3, rx * 0.22, 2, sp.body);
  c.fillEllipse(ox + rx * 0.35, fy - Math.max(0, step) * 0.3, rx * 0.22, 2, sp.body);
}

const sp = {
  r: 10,
  body: DP.kmBody,
  bodyDk: DP.kmBodyDk,
  bodyLt: DP.kmBodyLt,
  belly: DP.kmBelly,
  accent: DP.kmAccent,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 4,
  mouthY: 0.32,
  back,
  front,
};

module.exports = { sp, name: 'koromon' };
