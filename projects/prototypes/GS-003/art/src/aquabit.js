'use strict';
// Aquabit -- Vacina/Agua starter, Linha B. Translucent gel teardrop with an
// internal circuit pattern. No lizard tail, no rodent cheeks (GOVERNANCE rule).
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');

const SIZE = 48;

function drawGroundShadow(c) {
  c.fillEllipse(24, 44, 12, 3, withAlpha(P.ink, 70));
}

function drawBody(c, squash) {
  const cx = 24, topY = 14 + squash;
  // Rounded top (gel dome).
  c.fillEllipse(cx, topY + 8, 13 - squash, 11 + squash, withAlpha(P.cyan, 225));
  // Tapering point at the bottom (teardrop tail).
  const tip = [
    [cx - 11, topY + 14], [cx + 11, topY + 14], [cx, 43],
  ];
  c.fillPolygon(tip, withAlpha(P.cyan, 225));

  // Shadow (bottom-right, light from top-left).
  const shadeTip = [[cx, topY + 10], [cx + 11, topY + 14], [cx, 43]];
  c.fillPolygon(shadeTip, withAlpha(P.cyanDk, 130));
  c.fillEllipse(cx + 3, topY + 11, 9, 7, withAlpha(P.cyanDk, 90));

  // Highlight (top-left gel sheen).
  c.fillEllipse(cx - 6, topY + 2, 5, 4, withAlpha(P.cyanLt, 150));
}

function drawCircuitCore(c, pulse) {
  const cx = 24, cy = 26;
  const col = pulse ? P.paper : P.cyanLt;
  c.line(cx - 6, cy, cx + 6, cy, col, 1);
  c.line(cx, cy - 6, cx, cy + 6, col, 1);
  c.line(cx - 6, cy, cx - 6, cy - 4, col, 1);
  c.line(cx + 6, cy, cx + 6, cy + 4, col, 1);
  c.fillRect(cx - 1, cy - 1, cx + 1, cy + 1, withAlpha(P.paper, 230));
  c.setPixel(cx - 6, cy - 4, P.amber);
  c.setPixel(cx + 6, cy + 4, P.amber);
}

function drawBubbles(c, phase) {
  const spots = phase
    ? [[18, 33, 1], [29, 36, 2], [21, 20, 1]]
    : [[17, 35, 1], [30, 34, 2], [22, 19, 1]];
  for (const [x, y, r] of spots) c.fillCircle(x, y, r, withAlpha(P.cyanLt, 140));
}

function drawEyes(c, blink) {
  const y = 24;
  if (blink) {
    c.line(17, y, 19, y, P.ink, 1);
    c.line(29, y, 31, y, P.ink, 1);
  } else {
    c.fillRect(17, y - 1, 18, y + 1, P.ink);
    c.fillRect(30, y - 1, 31, y + 1, P.ink);
  }
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawBody(c, opts.squash);
  c.autoOutline(P.ink);
  drawCircuitCore(c, opts.pulse);
  drawBubbles(c, opts.phase);
  drawEyes(c, opts.blink);
  drawGroundShadow(c);
  return c;
}

function generate(outDir, previewDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const f0 = frame({ squash: 0, pulse: false, phase: false, blink: false });
  const f1 = frame({ squash: 1, pulse: true, phase: true, blink: true });

  f0.save(`${outDir}/aquabit_idle_01.png`);
  f1.save(`${outDir}/aquabit_idle_02.png`);
  f0.scaleNearest(8).save(`${previewDir}/aquabit_idle_01_x8.png`);
  f1.scaleNearest(8).save(`${previewDir}/aquabit_idle_02_x8.png`);
  console.log('Aquabit sprites written.');
}

module.exports = { generate, frame };

if (require.main === module) {
  const outDir = process.argv[2] || './out';
  const previewDir = process.argv[3] || './out/preview';
  generate(outDir, previewDir);
}
