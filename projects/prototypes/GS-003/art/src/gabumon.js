'use strict';
// Gabumon -- fan-redesign for GS-003 Digimon content pack (ADR-007).
// Drawn pixel-by-pixel from general/public visual memory (small blue reptile
// wearing a tan fur pelt/hood with a horn, yellow striped belly, furry tail
// tip). No official image, sprite, or file was fetched or traced.
const { Canvas } = require('./canvas.js');
const { DP, withAlpha } = require('./digimon_palette.js');

const SIZE = 48;

function drawGroundShadow(c) {
  const cx = 24, cy = 46, rx = 16, ry = 2;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1.03) continue;
      if (c.getPixel(cx + x, cy + y)[3] > 0) continue;
      c.blendPixel(cx + x, cy + y, withAlpha(DP.ink, 70));
    }
  }
}

function drawTail(c, wag) {
  const tail = [[30, 35], [41, 32 + wag], [40, 27 + wag], [31, 37]];
  c.fillPolygon(tail, DP.gbSkin);
  c.fillCircle(41, 29 + wag, 4, DP.gbFur);
}

function drawLegs(c, legOffset = 0) {
  const lY = 40 + legOffset, rY = 40 - legOffset;
  c.fillEllipse(16, lY, 5, 5, DP.gbSkin);
  c.fillEllipse(31, rY, 5, 5, DP.gbSkin);
  for (const [x, dy] of [[12, 3], [16, 4], [20, 3]]) {
    c.fillPolygon([[x - 1, lY + dy], [x + 1, lY + dy], [x, lY + dy + 3]], DP.gbFur);
  }
  for (const [x, dy] of [[27, 3], [31, 4], [35, 3]]) {
    c.fillPolygon([[x - 1, rY + dy], [x + 1, rY + dy], [x, rY + dy + 3]], DP.gbFur);
  }
}

function drawArms(c, lift) {
  c.fillEllipse(10, 28 - lift, 4, 5, DP.gbSkin);
  c.fillEllipse(38, 28, 4, 5, DP.gbSkin);
}

function drawTorso(c) {
  c.fillEllipse(24, 29, 12, 11, DP.gbSkin);
  c.fillEllipse(24, 34, 8, 7, DP.gbBelly);
  c.line(18, 32, 30, 32, DP.gbStripe, 1);
  c.line(19, 37, 29, 37, DP.gbStripe, 1);
  c.fillEllipse(19, 23, 5, 4, withAlpha(DP.gbSkin, 60));
  c.fillEllipse(28, 33, 7, 6, withAlpha(DP.gbSkinDk, 100));
}

function drawFurHood(c) {
  // Pelt covering the head like a hood, classic Gabumon silhouette.
  c.fillCircle(24, 15, 11, DP.gbFur);
  c.fillEllipse(24, 19, 7, 5, DP.gbSkin); // exposed blue face
  const hornTip = [[24, 2], [21, 10], [27, 10]];
  c.fillPolygon(hornTip, DP.gbHorn);
  c.fillPolygon([[24, 2], [22, 7], [26, 7]], DP.gbHornTip);
  // fur tufts along the hood edge
  for (const [x, y, r] of [[13, 15, 3], [35, 15, 3], [14, 22, 2], [34, 22, 2]]) {
    c.fillCircle(x, y, r, DP.gbFur);
  }
  c.fillEllipse(18, 10, 4, 3, withAlpha(DP.paper, 90));
}

function drawEyes(c, blink) {
  const y = 19;
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

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawTail(c, opts.wag);
  drawLegs(c, opts.legOffset || 0);
  drawArms(c, opts.lift);
  drawTorso(c);
  drawFurHood(c);
  c.autoOutline(DP.ink);
  drawEyes(c, opts.blink);
  drawGroundShadow(c);
  return c;
}

// Walk: 4-frame loop, leg-offset stepping + arm swing + light bounce.
function walkFrames() {
  return [
    frame({ wag: 0, lift: 0, blink: false, legOffset: 2 }),
    frame({ wag: 1, lift: 1, blink: false, legOffset: 0 }).translate(0, -1),
    frame({ wag: 0, lift: 0, blink: false, legOffset: -2 }),
    frame({ wag: 1, lift: 1, blink: false, legOffset: 0 }).translate(0, -1),
  ];
}

// Attack: anticipation (horn pulled back) -> impact (headbutt lunge + flash) -> return.
function attackFrames() {
  return [
    frame({ wag: 0, lift: 1, blink: false }).translate(-2, 0),
    frame({ wag: 2, lift: 0, blink: false }).translate(3, 0).tint(DP.gbHorn, 100),
    frame({ wag: 1, lift: 0, blink: false }).translate(1, 0),
  ];
}

// Hit: knocked back + white flash, fading on the second frame.
function hitFrames() {
  return [
    frame({ wag: 0, lift: 0, blink: true }).translate(-2, 0).tint(DP.paper, 150),
    frame({ wag: 0, lift: 0, blink: true }).translate(-1, 0).tint(DP.paper, 70),
  ];
}

function generate(outDir, previewDir) {
  const { writeFrames } = require('./anim_io.js');
  const f0 = frame({ wag: 0, lift: 0, blink: false });
  const f1 = frame({ wag: 2, lift: 1, blink: true });
  writeFrames([f0, f1], outDir, previewDir, 'gabumon_idle');
  writeFrames(walkFrames(), outDir, previewDir, 'gabumon_walk');
  writeFrames(attackFrames(), outDir, previewDir, 'gabumon_attack');
  writeFrames(hitFrames(), outDir, previewDir, 'gabumon_hit');
  console.log('Gabumon sprites written.');
}

module.exports = { generate, frame, walkFrames, attackFrames, hitFrames };
if (require.main === module) {
  generate(process.argv[2] || './out', process.argv[3] || './out/preview');
}
