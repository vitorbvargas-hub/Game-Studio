'use strict';
// Pixelume -- Dado/Luz starter, Linha B. Translucent amoeba blob with a pulsing
// light core. No horns, no claws, no reptile/rodent silhouette (GOVERNANCE rule).
const { Canvas } = require('./canvas.js');
const { P, withAlpha } = require('./palette.js');

const SIZE = 48;

function drawBody(c, bob) {
  // Union of overlapping circles = soft amoeba silhouette (classic pixel-art blob trick).
  const cx = 24, cy = 27 + bob;
  const blobs = [
    [cx, cy, 15],
    [cx - 9, cy + 3, 10],
    [cx + 10, cy + 2, 10],
    [cx - 4, cy - 9, 11],
    [cx + 6, cy - 8, 10],
    [cx, cy + 10, 9],
  ];
  for (const [x, y, r] of blobs) c.fillCircle(x, y, r, withAlpha(P.lilac, 235));

  // Bottom shadow shading (light source top-left).
  for (const [x, y, r] of blobs) {
    c.fillCircle(x + 3, y + 3, r - 4, withAlpha(P.lilacDk, 120));
  }
  // Top-left highlight rim.
  c.fillCircle(cx - 6, cy - 12, 6, withAlpha(P.paper, 90));
}

function drawGroundShadow(c) {
  c.fillEllipse(24, 44, 13, 3, withAlpha(P.ink, 70));
}

function drawCore(c, pulse) {
  const cx = 24, cy = 26;
  const r = 8 + pulse;
  for (let i = r + 3; i >= 1; i--) {
    const a = Math.round(70 * (1 - i / (r + 3)));
    c.fillCircle(cx, cy, i, withAlpha(P.amber, Math.max(a, 20)));
  }
  c.fillCircle(cx, cy, Math.max(2, r - 5), withAlpha(P.paper, 230));
}

function drawEyes(c, blink) {
  const y = 27;
  if (blink) {
    c.line(16, y, 18, y, P.ink, 1);
    c.line(29, y, 31, y, P.ink, 1);
  } else {
    c.fillRect(16, y - 1, 17, y + 1, P.ink);
    c.fillRect(30, y - 1, 31, y + 1, P.ink);
  }
}

function frame(opts) {
  const c = new Canvas(SIZE, SIZE);
  drawBody(c, opts.bob);
  c.autoOutline(P.ink);
  drawCore(c, opts.pulse);
  drawEyes(c, opts.blink);
  drawGroundShadow(c);
  return c;
}

function generate(outDir, previewDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const f0 = frame({ bob: 0, pulse: 0, blink: false });
  const f1 = frame({ bob: -1, pulse: 1, blink: true });

  f0.save(`${outDir}/pixelume_idle_01.png`);
  f1.save(`${outDir}/pixelume_idle_02.png`);
  f0.scaleNearest(8).save(`${previewDir}/pixelume_idle_01_x8.png`);
  f1.scaleNearest(8).save(`${previewDir}/pixelume_idle_02_x8.png`);
  console.log('Pixelume sprites written.');
}

module.exports = { generate, frame };

if (require.main === module) {
  const outDir = process.argv[2] || './out';
  const previewDir = process.argv[3] || './out/preview';
  generate(outDir, previewDir);
}
