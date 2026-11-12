'use strict';
// Tsunomon -- PMD-format overworld version, same silhouette/colors as the
// battle sprite (../../tsunomon.js): round blue blob, pale horn, tail fin.
const { DP } = require('../../digimon_palette.js');

function back(c, ox, cy, rx, ry, meta) {
  if (meta.face <= -0.5) return; // tucked behind body when facing away
  const side = meta.turn >= 0 ? 1 : -1;
  const bx = ox + side * rx * 0.75;
  c.fillPolygon([
    [bx, cy + ry * 0.1], [bx + side * rx * 0.7, cy - ry * 0.2],
    [bx + side * rx * 0.55, cy + ry * 0.35], [bx, cy + ry * 0.4],
  ], DP.tsBody);
}

function front(c, ox, cy, rx, ry, meta, pose, sp) {
  const topY = cy - ry;
  const lean = meta.turn * 2;
  c.fillPolygon([[ox + lean, topY - 8], [ox - 2 + lean, topY + 2], [ox + 2 + lean, topY + 2]], DP.tsHorn);
  c.fillPolygon([[ox + lean, topY - 8], [ox - 1 + lean, topY - 2], [ox + 1 + lean, topY - 2]], DP.tsHornTip);
  const fy = cy + ry * 0.9;
  const step = pose.legOffset || 0;
  c.fillEllipse(ox - rx * 0.35, fy - Math.max(0, -step) * 0.3, rx * 0.22, 2, sp.body);
  c.fillEllipse(ox + rx * 0.35, fy - Math.max(0, step) * 0.3, rx * 0.22, 2, sp.body);
}

const sp = {
  r: 10,
  body: DP.tsBody,
  bodyDk: DP.tsBodyDk,
  bodyLt: DP.tsBodyLt,
  belly: DP.tsBelly,
  accent: DP.tsSpot,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 4,
  mouthY: 0.32,
  back,
  front,
};

module.exports = { sp, name: 'tsunomon' };
