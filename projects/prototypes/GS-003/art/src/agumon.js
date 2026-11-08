'use strict';
// Agumon -- fan-redesign for GS-003 Digimon content pack (ADR-007).
// Drawn pixel-by-pixel from general/public visual memory of the character
// (small orange bipedal reptile, cream belly, dorsal ridge spikes, clawed
// hands/feet). No official image, sprite, or file was fetched or traced.
const { Canvas } = require('./canvas.js');
const { DP, withAlpha } = require('./digimon_palette.js');

const SIZE = 48;

function drawTail(c, wag) {
  const tail = [
    [30, 34], [40, 30 + wag], [43, 25 + wag], [38, 30], [31, 38],
  ];
  c.fillPolygon(tail, DP.agBody);
  c.fillPolygon([[40, 30 + wag], [43, 25 + wag], [39, 29]], DP.agRidge);
}

function drawLegs(c, legOffset = 0) {
  const lY = 40 + legOffset, rY = 40 - legOffset;
  c.fillEllipse(16, lY, 5, 5, DP.agBody);
  c.fillEllipse(31, rY, 5, 5, DP.agBody);
  // claws (follow each leg's own offset so a step reads as one foot lifting)
  for (const [x, dy] of [[12, 3], [16, 4], [20, 3]]) {
    c.fillPolygon([[x - 1, lY + dy], [x + 1, lY + dy], [x, lY + dy + 3]], DP.agClaw);
  }
  for (const [x, dy] of [[27, 3], [31, 4], [35, 3]]) {
    c.fillPolygon([[x - 1, rY + dy], [x + 1, rY + dy], [x, rY + dy + 3]], DP.agClaw);
  }
}

function drawArms(c, lift) {
  c.fillEllipse(10, 28 - lift, 4, 5, DP.agBody);
  c.fillEllipse(38, 28, 4, 5, DP.agBody);
  for (const [x, y] of [[7, 32 - lift], [10, 33 - lift], [13, 32 - lift]]) {
    c.fillPolygon([[x - 1, y], [x + 1, y], [x, y + 2]], DP.agClaw);
  }
  for (const [x, y] of [[35, 32], [38, 33], [41, 32]]) {
    c.fillPolygon([[x - 1, y], [x + 1, y], [x, y + 2]], DP.agClaw);
  }
}

function drawTorso(c) {
  c.fillEllipse(24, 29, 12, 11, DP.agBody);
  c.fillEllipse(24, 33, 7, 7, DP.agBelly);
  c.fillEllipse(19, 23, 5, 4, withAlpha(DP.agBodyLt, 120));
  c.fillEllipse(28, 33, 7, 6, withAlpha(DP.agBodyDk, 110));
}

function drawHead(c, open) {
  c.fillCircle(24, 15, 11, DP.agBody);
  c.fillEllipse(24, 20, 6, 4, DP.agBelly);
  if (open) c.line(20, 21, 28, 21, DP.agRidgeDk, 1);
  c.fillEllipse(19, 10, 4, 3, withAlpha(DP.agBodyLt, 130));
}

function drawRidges(c) {
  const spikes = [
    [[24, 5], [21, 10], [27, 10]],
    [[15, 17], [10, 21], [18, 22]],
    [[33, 17], [38, 21], [30, 22]],
  ];
  for (const tri of spikes) c.fillPolygon(tri, DP.agRidge);
}

function drawEyes(c, blink) {
  const y = 14;
  if (blink) {
    c.line(17, y, 20, y, DP.ink, 1);
    c.line(28, y, 31, y, DP.ink, 1);
    return;
  }
  c.fillEllipse(18, y, 2, 3, DP.paper);
  c.fillEllipse(30, y, 2, 3, DP.paper);
  c.fillRect(17, y, 18, y + 1, DP.ink);
  c.fillRect(29, y, 30, y + 1, DP.ink);
}

function drawGroundShadow(c) {
  const cx = 24, cy = 46, rx = 16, ry = 2;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1.03) continue;
      if (c.getPixel(cx + x, cy + y)[3] > 0) continue; // don't darken the feet
      c.blendPixel(cx + x, cy + y, withAlpha(DP.ink, 70));
    }
  }
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawTail(c, opts.wag);
  drawLegs(c, opts.legOffset || 0);
  drawArms(c, opts.lift);
  drawTorso(c);
  drawHead(c, opts.open);
  c.autoOutline(DP.ink);
  drawRidges(c);
  c.autoOutline(DP.ink);
  drawEyes(c, opts.blink);
  drawGroundShadow(c);
  return c;
}

// Walk: 4-frame loop, leg-offset stepping + opposite-arm swing + light bounce.
function walkFrames() {
  return [
    frame({ wag: 0, lift: 0, open: false, blink: false, legOffset: 2 }),
    frame({ wag: 1, lift: 1, open: false, blink: false, legOffset: 0 }).translate(0, -1),
    frame({ wag: 0, lift: 0, open: false, blink: false, legOffset: -2 }),
    frame({ wag: 1, lift: 1, open: false, blink: false, legOffset: 0 }).translate(0, -1),
  ];
}

// Attack: anticipation (pull back) -> impact (lunge + bite + flash) -> return.
function attackFrames() {
  return [
    frame({ wag: 0, lift: 1, open: false, blink: false }).translate(-2, 0),
    frame({ wag: 2, lift: 0, open: true, blink: false }).translate(3, 0).tint(DP.agRidge, 100),
    frame({ wag: 1, lift: 0, open: false, blink: false }).translate(1, 0),
  ];
}

// Hit: knocked back + white flash, fading on the second frame.
function hitFrames() {
  return [
    frame({ wag: 0, lift: 0, open: false, blink: true }).translate(-2, 0).tint(DP.paper, 150),
    frame({ wag: 0, lift: 0, open: false, blink: true }).translate(-1, 0).tint(DP.paper, 70),
  ];
}

function generate(outDir, previewDir) {
  const { writeFrames } = require('./anim_io.js');
  const f0 = frame({ wag: 0, lift: 0, open: false, blink: false });
  const f1 = frame({ wag: 2, lift: 1, open: true, blink: true });
  writeFrames([f0, f1], outDir, previewDir, 'agumon_idle');
  writeFrames(walkFrames(), outDir, previewDir, 'agumon_walk');
  writeFrames(attackFrames(), outDir, previewDir, 'agumon_attack');
  writeFrames(hitFrames(), outDir, previewDir, 'agumon_hit');
  console.log('Agumon sprites written.');
}

module.exports = { generate, frame, walkFrames, attackFrames, hitFrames };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
