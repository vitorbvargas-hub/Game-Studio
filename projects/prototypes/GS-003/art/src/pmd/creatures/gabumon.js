'use strict';
// Gabumon -- PMD-format overworld version, chibi top-down reinterpretation
// of the battle sprite (../../gabumon.js): fur hood covering most of the
// head (painted over the base body ellipse) with a horn, exposed blue face,
// small fur-tipped tail and legs/arms peeking out below.
const { DP } = require('../../digimon_palette.js');

function back(c, ox, cy, rx, ry, meta, pose, sp) {
  if (meta.face > -0.5) {
    const side = meta.turn >= 0 ? 1 : -1;
    const bx = ox + side * rx * 0.7;
    const wag = (pose.flap || 0) * 0.4;
    c.fillPolygon([
      [bx, cy + ry * 0.3], [bx + side * rx * 0.8, cy - ry * 0.05 + wag],
      [bx, cy + ry * 0.55],
    ], sp.body);
    c.fillCircle(bx + side * rx * 0.75, cy - ry * 0.05 + wag, rx * 0.18, DP.gbFur);
  }
  const step = (pose.legOffset || 0) * 0.3;
  const fy = cy + ry * 0.95;
  c.fillEllipse(ox - rx * 0.4, fy - Math.max(0, -step), rx * 0.26, ry * 0.18, sp.body);
  c.fillEllipse(ox + rx * 0.4, fy - Math.max(0, step), rx * 0.26, ry * 0.18, sp.body);
  const lift = (pose.armLift || 0) * 0.4;
  c.fillEllipse(ox - rx * 0.95, cy + ry * 0.1 - lift, rx * 0.2, ry * 0.22, sp.body);
  c.fillEllipse(ox + rx * 0.95, cy + ry * 0.1, rx * 0.2, ry * 0.22, sp.body);
}

function front(c, ox, cy, rx, ry, meta) {
  // fur hood over most of the head; the exposed blue face oval only reads
  // as a face from the front/side -- drawing it for the N view used to look
  // like a single giant blue eye on an otherwise faceless fur silhouette.
  const lean = meta.turn * rx * 0.15;
  c.fillCircle(ox + lean, cy - ry * 0.05, rx * 0.95, DP.gbFur);
  if (meta.face > -0.5) c.fillEllipse(ox + lean, cy + ry * 0.15, rx * 0.5, ry * 0.4, DP.gbSkin);
  const topY = cy - ry;
  c.fillPolygon([[ox + lean, topY - 7], [ox - 3 + lean, topY + 3], [ox + 3 + lean, topY + 3]], DP.gbHorn);
  c.fillPolygon([[ox + lean, topY - 7], [ox - 1 + lean, topY - 1], [ox + 1 + lean, topY - 1]], DP.gbHornTip);
}

const sp = {
  r: 11,
  body: DP.gbSkin,
  bodyDk: DP.gbSkinDk,
  bodyLt: DP.gbSkin,
  belly: DP.gbBelly,
  accent: DP.gbHorn,
  ink: DP.ink,
  paper: DP.paper,
  eyeSpacing: 5,
  mouthY: 0.32,
  turnShift: 0.1,
  back,
  front,
};

module.exports = { sp, name: 'gabumon' };
