'use strict';
// Agumon -- PMD-format overworld version, chibi top-down reinterpretation of
// the battle sprite (../../agumon.js): the head dominates (same convention
// as the founder's reference Charmander), with small tail/legs/arms peeking
// out and the 3 dorsal ridge spikes on top. Orange/cream colors reused from
// digimon_palette.js for consistency between the two sprite formats.
const { DP } = require('../../digimon_palette.js');

function back(c, ox, cy, rx, ry, meta, pose, sp) {
  // tail, visible when not fully facing away
  if (meta.face > -0.5) {
    const side = meta.turn >= 0 ? 1 : -1;
    const bx = ox + side * rx * 0.7;
    const wag = (pose.flap || 0) * 0.4;
    c.fillPolygon([
      [bx, cy + ry * 0.3], [bx + side * rx * 0.9, cy - ry * 0.1 + wag],
      [bx + side * rx * 0.7, cy + ry * 0.5 + wag], [bx, cy + ry * 0.55],
    ], sp.body);
  }
  // legs
  const step = (pose.legOffset || 0) * 0.3;
  const fy = cy + ry * 0.95;
  c.fillEllipse(ox - rx * 0.4, fy - Math.max(0, -step), rx * 0.26, ry * 0.18, sp.body);
  c.fillEllipse(ox + rx * 0.4, fy - Math.max(0, step), rx * 0.26, ry * 0.18, sp.body);
  // arms
  const lift = (pose.armLift || 0) * 0.4;
  c.fillEllipse(ox - rx * 0.95, cy + ry * 0.1 - lift, rx * 0.2, ry * 0.22, sp.body);
  c.fillEllipse(ox + rx * 0.95, cy + ry * 0.1, rx * 0.2, ry * 0.22, sp.body);
}

function frontOverOutline(c, ox, cy, rx, ry, meta, pose, sp) {
  const topY = cy - ry;
  const lean = meta.turn * rx * 0.2;
  const spikes = [
    [[ox + lean, topY - 7], [ox - 4 + lean, topY + 1], [ox + 4 + lean, topY + 1]],
    [[ox - rx * 0.55 + lean, topY + 6], [ox - rx * 0.85 + lean, topY + 1], [ox - rx * 0.25 + lean, topY + 3]],
    [[ox + rx * 0.55 + lean, topY + 6], [ox + rx * 0.85 + lean, topY + 1], [ox + rx * 0.25 + lean, topY + 3]],
  ];
  for (const tri of spikes) c.fillPolygon(tri, sp.accent);
}

const sp = {
  r: 11,
  body: DP.agBody,
  bodyDk: DP.agBodyDk,
  bodyLt: DP.agBodyLt,
  belly: DP.agBelly,
  accent: DP.agRidge,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 5,
  mouthY: 0.3,
  turnShift: 0.1,
  back,
  frontOverOutline,
};

module.exports = { sp, name: 'agumon' };
