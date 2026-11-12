'use strict';
// Tokomon -- fan-redesign for GS-003 Digimon content pack (ADR-007), Baby II
// stage that evolves into Patamon (zona1_campo_de_bits). Drawn pixel-by-pixel
// from general/public visual memory (small round cream/tan blob, oversized
// bat-like ears used as wings, a wide toothy mouth, no legs -- a floater
// like its evolution). No official image, sprite, or file was fetched or
// traced.
const { Canvas } = require('./canvas.js');
const { DP, withAlpha } = require('./digimon_palette.js');
const { drawBlobBody, drawBlobEyes, drawGroundShadow } = require('./baby_blob.js');

const SIZE = 48;
const CX = 24, CY = 28, R = 12;

function drawEars(c, flap) {
  const left = [[17, 20], [2, 12 - flap], [4, 24], [2, 34 + flap], [14, 30]];
  const right = [[31, 20], [46, 12 - flap], [44, 24], [46, 34 + flap], [34, 30]];
  c.fillPolygon(left, DP.tkEarDk);
  c.fillPolygon(right, DP.tkEarDk);
  c.fillPolygon([[17, 21], [7, 15 - flap], [8, 24], [7, 31 + flap], [15, 29]], DP.tkEar);
  c.fillPolygon([[31, 21], [41, 15 - flap], [40, 24], [41, 31 + flap], [33, 29]], DP.tkEar);
  c.fillPolygon([[17, 22], [10, 18 - flap], [11, 24], [15, 25]], DP.tkEarInner);
  c.fillPolygon([[31, 22], [38, 18 - flap], [37, 24], [33, 25]], DP.tkEarInner);
}

function drawMouth(c, open) {
  if (open) {
    c.fillEllipse(24, 33, 4, 3, DP.ink);
    c.fillRect(21, 31, 27, 31, DP.paper);
  } else {
    c.line(20, 33, 28, 33, withAlpha(DP.ink, 150), 1);
  }
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  const squash = opts.squash || 0;
  drawEars(c, opts.flap || 0);
  drawBlobBody(c, CX, CY, R, DP.tkBody, DP.tkBodyDk, DP.tkBodyLt, DP.tkBelly, squash);
  c.autoOutline(DP.ink);
  drawBlobEyes(c, CX, CY - 2, 6, opts.blink);
  drawMouth(c, opts.open);
  drawGroundShadow(c, CX, 42, 10, 2);
  return c;
}

// Floater like Patamon -- "walk" reinterpreted as a hover-bob + ear-flap
// cycle, the closest equivalent locomotion for a legless flyer (see
// PIXEL_ART_DIRECTION.md §0.1, same decision already applied to Patamon).
function walkFrames() {
  return [
    frame({ flap: 0, blink: false, open: false }),
    frame({ flap: 3, blink: false, open: false }).translate(0, -2),
    frame({ flap: 0, blink: false, open: false }),
    frame({ flap: -3, blink: false, open: false }).translate(0, 1),
  ];
}

// Attack: ears pulled back (anticipation) -> bite lunge + flash -> return.
function attackFrames() {
  return [
    frame({ flap: -4, blink: false, open: false }).translate(-2, 0),
    frame({ flap: 5, blink: false, open: true }).translate(3, 0).tint(DP.tkEarInner, 100),
    frame({ flap: 1, blink: false, open: false }).translate(1, 0),
  ];
}

// Hit: knocked back + white flash, fading on the second frame.
function hitFrames() {
  return [
    frame({ flap: 0, blink: true, open: false }).translate(-2, 0).tint(DP.paper, 150),
    frame({ flap: 0, blink: true, open: false }).translate(-1, 0).tint(DP.paper, 70),
  ];
}

function generate(outDir, previewDir) {
  const { writeFrames } = require('./anim_io.js');
  const f0 = frame({ flap: 0, blink: false, open: false });
  const f1 = frame({ flap: 3, blink: true, open: false });
  writeFrames([f0, f1], outDir, previewDir, 'tokomon_idle');
  writeFrames(walkFrames(), outDir, previewDir, 'tokomon_walk');
  writeFrames(attackFrames(), outDir, previewDir, 'tokomon_attack');
  writeFrames(hitFrames(), outDir, previewDir, 'tokomon_hit');
  console.log('Tokomon sprites written.');
}

module.exports = { generate, frame, walkFrames, attackFrames, hitFrames };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
