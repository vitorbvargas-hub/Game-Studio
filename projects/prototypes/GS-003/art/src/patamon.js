'use strict';
// Patamon -- fan-redesign for GS-003 Digimon content pack (ADR-007).
// Drawn pixel-by-pixel from general/public visual memory (small round tan
// flying creature with oversized bat-like ears used as wings, no visible
// legs). No official image, sprite, or file was fetched or traced.
const { Canvas } = require('./canvas.js');
const { DP, withAlpha } = require('./digimon_palette.js');

const SIZE = 48;

function drawGroundShadow(c) {
  c.fillEllipse(24, 44, 11, 2, withAlpha(DP.ink, 55)); // floats, so a soft/low shadow
}

function drawEars(c, flap) {
  const left = [[21, 16], [1, 6 - flap], [5, 23], [1, 37 + flap], [17, 30]];
  const right = [[27, 16], [47, 6 - flap], [43, 23], [47, 37 + flap], [31, 30]];
  c.fillPolygon(left, DP.ptEarDk);
  c.fillPolygon(right, DP.ptEarDk);
  c.fillPolygon([[20, 18], [6, 12 - flap], [8, 25], [7, 33 + flap], [17, 28]], DP.ptEar);
  c.fillPolygon([[28, 18], [42, 12 - flap], [40, 25], [41, 33 + flap], [31, 28]], DP.ptEar);
  c.fillPolygon([[20, 19], [9, 15 - flap], [11, 24], [16, 25]], DP.ptEarInner);
  c.fillPolygon([[28, 19], [39, 15 - flap], [37, 24], [32, 25]], DP.ptEarInner);
  // seam between ear and head so the ear silhouette reads distinctly
  c.line(21, 16, 17, 30, DP.ptBodyDk, 1);
  c.line(27, 16, 31, 30, DP.ptBodyDk, 1);
}

function drawBody(c) {
  c.fillCircle(24, 26, 14, DP.ptBody);
  c.fillEllipse(24, 32, 8, 7, withAlpha(DP.paper, 150));
  c.fillEllipse(18, 19, 5, 4, withAlpha(DP.paper, 90));
  c.fillEllipse(29, 32, 8, 7, withAlpha(DP.ptBodyDk, 90));
}

function drawFeetNubs(c) {
  c.fillCircle(18, 38, 2, DP.ptBody);
  c.fillCircle(30, 38, 2, DP.ptBody);
}

function drawEyes(c, blink) {
  const y = 24;
  if (blink) {
    c.line(16, y, 19, y, DP.ink, 1);
    c.line(29, y, 32, y, DP.ink, 1);
    return;
  }
  c.fillEllipse(17, y, 2, 3, DP.paper);
  c.fillEllipse(31, y, 2, 3, DP.paper);
  c.fillRect(16, y, 17, y + 1, DP.ink);
  c.fillRect(30, y, 31, y + 1, DP.ink);
}

function drawMouth(c) {
  c.line(21, 31, 27, 31, withAlpha(DP.ink, 150), 1);
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawEars(c, opts.flap);
  drawBody(c);
  drawFeetNubs(c);
  c.autoOutline(DP.ink);
  drawEyes(c, opts.blink);
  drawMouth(c);
  drawGroundShadow(c);
  return c;
}

// Patamon has no legs (canonically a floater) -- "walk" is reinterpreted as a
// 4-frame hover-bob cycle: vertical bob + alternating ear flap, the closest
// equivalent locomotion loop for a flying creature. Documented as a direction
// decision in PIXEL_ART_DIRECTION.md (not a literal walk cycle).
function walkFrames() {
  return [
    frame({ flap: 0, blink: false }),
    frame({ flap: 3, blink: false }).translate(0, -1),
    frame({ flap: 0, blink: false }),
    frame({ flap: -3, blink: false }).translate(0, 1),
  ];
}

// Attack: ears pulled back (anticipation) -> ram lunge with ears forward + flash -> return.
function attackFrames() {
  return [
    frame({ flap: -4, blink: false }).translate(-2, 0),
    frame({ flap: 5, blink: false }).translate(3, 0).tint(DP.ptEarInner, 100),
    frame({ flap: 1, blink: false }).translate(1, 0),
  ];
}

// Hit: knocked back + white flash, fading on the second frame.
function hitFrames() {
  return [
    frame({ flap: 0, blink: true }).translate(-2, 0).tint(DP.paper, 150),
    frame({ flap: 0, blink: true }).translate(-1, 0).tint(DP.paper, 70),
  ];
}

function generate(outDir, previewDir) {
  const { writeFrames } = require('./anim_io.js');
  const f0 = frame({ flap: 0, blink: false });
  const f1 = frame({ flap: 3, blink: true });
  writeFrames([f0, f1], outDir, previewDir, 'patamon_idle');
  writeFrames(walkFrames(), outDir, previewDir, 'patamon_walk');
  writeFrames(attackFrames(), outDir, previewDir, 'patamon_attack');
  writeFrames(hitFrames(), outDir, previewDir, 'patamon_hit');
  console.log('Patamon sprites written.');
}

module.exports = { generate, frame, walkFrames, attackFrames, hitFrames };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
