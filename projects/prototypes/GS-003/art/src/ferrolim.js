'use strict';
// Ferrolim -- Virus/Metal starter, Linha B. Angular armored digital insect.
// Explicitly NOT a lizard, NOT a rodent (GOVERNANCE silhouette rule).
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');

const SIZE = 48;

function drawLegs(c, lift) {
  // 6 short angular legs, 3 per side, drawn as thick lines from body edge.
  const pairs = [
    [[14, 30], [8, 36]],
    [[14, 34], [7, 40]],
    [[16, 37], [11, 43]],
    [[34, 30], [40, 36]],
    [[34, 34], [41, 40]],
    [[32, 37], [37, 43]],
  ];
  for (let i = 0; i < pairs.length; i++) {
    const [[x0, y0], [x1, y1]] = pairs[i];
    const dy = (i === 2 || i === 5) ? lift : 0; // back legs lift slightly
    c.line(x0, y0, x1, y1 - dy, P.steel, 2);
  }
}

function drawAntennae(c, tilt) {
  c.line(19, 11, 15 + tilt, 4, P.steel, 1);
  c.line(29, 11, 33 - tilt, 4, P.steel, 1);
  c.setPixel(15 + tilt, 4, P.magenta);
  c.setPixel(33 - tilt, 4, P.magenta);
}

function drawCarapace(c) {
  // Hexagonal angular beetle-shell body.
  const body = [
    [24, 10], [34, 15], [38, 26], [34, 37], [24, 42], [14, 37], [10, 26], [14, 15],
  ];
  c.fillPolygon(body, P.steel);

  // Head plate (smaller hex fused to front/top).
  const head = [
    [24, 8], [30, 11], [30, 17], [24, 20], [18, 17], [18, 11],
  ];
  c.fillPolygon(head, P.steelLt);

  // Shading: bottom-right darker half via a diagonal shadow polygon clipped to body.
  const shadow = [
    [24, 10], [34, 15], [38, 26], [34, 37], [24, 42], [24, 24],
  ];
  c.fillPolygon(shadow, withAlpha(P.void, 110));

  // Top-left highlight sliver.
  const hi = [
    [24, 10], [14, 15], [10, 26], [18, 24],
  ];
  c.fillPolygon(hi, withAlpha(P.steelLt, 90));
}

function drawPlateSeams(c) {
  c.line(24, 10, 24, 42, withAlpha(P.ink, 60), 1);
  c.line(10, 26, 38, 26, withAlpha(P.ink, 40), 1);
}

function drawCircuitLines(c, pulse) {
  const col = pulse ? P.magenta : P.magentaDk;
  c.line(16, 20, 32, 20, col, 1);
  c.line(16, 20, 16, 30, col, 1);
  c.line(32, 20, 32, 30, col, 1);
  c.line(20, 30, 28, 30, col, 1);
  c.setPixel(16, 20, withAlpha(P.cyanLt, 255));
  c.setPixel(32, 20, withAlpha(P.cyanLt, 255));
}

function drawEyes(c, glow) {
  const col = glow ? P.magenta : P.magentaDk;
  c.fillRect(20, 14, 21, 15, col);
  c.fillRect(27, 14, 28, 15, col);
}

function drawGroundShadow(c) {
  c.fillEllipse(24, 44, 15, 3, withAlpha(P.ink, 70));
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawLegs(c, opts.lift);
  drawCarapace(c);
  c.autoOutline(P.ink);
  drawPlateSeams(c);
  drawAntennae(c, opts.tilt);
  drawCircuitLines(c, opts.pulse);
  drawEyes(c, opts.pulse);
  drawGroundShadow(c);
  return c;
}

function generate(outDir, previewDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const f0 = frame({ lift: 0, tilt: 0, pulse: false });
  const f1 = frame({ lift: 2, tilt: 1, pulse: true });

  f0.save(`${outDir}/ferrolim_idle_01.png`);
  f1.save(`${outDir}/ferrolim_idle_02.png`);
  f0.scaleNearest(8).save(`${previewDir}/ferrolim_idle_01_x8.png`);
  f1.scaleNearest(8).save(`${previewDir}/ferrolim_idle_02_x8.png`);
  console.log('Ferrolim sprites written.');
}

module.exports = { generate, frame };

if (require.main === module) {
  const outDir = process.argv[2] || './out';
  const previewDir = process.argv[3] || './out/preview';
  generate(outDir, previewDir);
}
