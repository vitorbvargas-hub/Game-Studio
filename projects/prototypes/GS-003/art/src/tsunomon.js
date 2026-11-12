'use strict';
// Tsunomon -- fan-redesign for GS-003 Digimon content pack (ADR-007), Baby II
// stage that evolves into Gabumon (zona1_campo_de_bits). Drawn pixel-by-pixel
// from general/public visual memory (small round blue blob, a single pale
// horn nub on top, a tiny tail fin, stub feet, no real legs). No official
// image, sprite, or file was fetched or traced.
const { Canvas } = require('./canvas.js');
const { DP, withAlpha } = require('./digimon_palette.js');
const { drawBlobBody, drawBlobEyes, drawGroundShadow, hopPoses } = require('./baby_blob.js');

const SIZE = 48;
const CX = 24, CY = 28, R = 12;

function drawHorn(c) {
  c.fillPolygon([[24, 4], [21, 16], [27, 16]], DP.tsHorn);
  c.fillPolygon([[24, 4], [22, 10], [26, 10]], DP.tsHornTip);
}

function drawTailFin(c, wag) {
  c.fillPolygon([[33, 32], [43, 28 + wag], [41, 23 + wag], [34, 29]], DP.tsBody);
}

function drawFeet(c) {
  c.fillEllipse(17, 39, 3, 2, DP.tsBody);
  c.fillEllipse(31, 39, 3, 2, DP.tsBody);
}

function drawMouth(c, open) {
  if (open) c.fillEllipse(24, 33, 3, 2, DP.tsSpot);
  else c.line(21, 33, 27, 33, withAlpha(DP.ink, 150), 1);
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  const squash = opts.squash || 0;
  drawTailFin(c, opts.wag || 0);
  drawBlobBody(c, CX, CY, R, DP.tsBody, DP.tsBodyDk, DP.tsBodyLt, DP.tsBelly, squash);
  drawFeet(c);
  drawHorn(c);
  c.autoOutline(DP.ink);
  drawBlobEyes(c, CX, CY - 2, 6, opts.blink);
  drawMouth(c, opts.open);
  drawGroundShadow(c, CX, 42, 10, 2);
  return c;
}

// No legs to animate -- "walk" is a 4-frame hop cycle (see baby_blob.js).
function walkFrames() {
  return hopPoses().map((s, i) => {
    const f = frame({ squash: s, blink: false, open: i === 1, wag: i % 2 === 0 ? 1 : -1 });
    return i === 1 ? f.translate(0, -3) : f;
  });
}

// Attack: anticipation (squat back) -> lunge forward, horn-first + flash -> return.
function attackFrames() {
  return [
    frame({ squash: -4, blink: false, open: false }).translate(-2, 0),
    frame({ squash: 5, blink: false, open: true }).translate(3, 0).tint(DP.tsHorn, 100),
    frame({ squash: 0, blink: false, open: false }).translate(1, 0),
  ];
}

// Hit: knocked back + white flash, fading on the second frame.
function hitFrames() {
  return [
    frame({ squash: 0, blink: true, open: false }).translate(-2, 0).tint(DP.paper, 150),
    frame({ squash: 0, blink: true, open: false }).translate(-1, 0).tint(DP.paper, 70),
  ];
}

function generate(outDir, previewDir) {
  const { writeFrames } = require('./anim_io.js');
  const f0 = frame({ squash: 0, blink: false, open: false });
  const f1 = frame({ squash: -2, blink: true, open: false });
  writeFrames([f0, f1], outDir, previewDir, 'tsunomon_idle');
  writeFrames(walkFrames(), outDir, previewDir, 'tsunomon_walk');
  writeFrames(attackFrames(), outDir, previewDir, 'tsunomon_attack');
  writeFrames(hitFrames(), outDir, previewDir, 'tsunomon_hit');
  console.log('Tsunomon sprites written.');
}

module.exports = { generate, frame, walkFrames, attackFrames, hitFrames };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
