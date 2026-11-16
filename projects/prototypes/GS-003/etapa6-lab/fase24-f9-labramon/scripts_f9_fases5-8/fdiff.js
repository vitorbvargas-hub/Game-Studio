'use strict';
// node fdiff.js dir — pixels diferentes entre quadros consecutivos (e último→primeiro) + bbox da diferença
const L = require('./lib.js'); const fs = L.frames(process.argv[2]).map(f => L.readPNG(f));
for (let i = 0; i < fs.length; i++) { const a = fs[i], b = fs[(i + 1) % fs.length]; let n = 0, x0 = 99, x1 = -1, y0 = 99, y1 = -1;
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const k = (y * 60 + x) * 4; if (a.data[k] !== b.data[k] || a.data[k + 1] !== b.data[k + 1] || a.data[k + 2] !== b.data[k + 2] || a.data[k + 3] !== b.data[k + 3]) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  console.log(`q${i}->q${(i + 1) % fs.length}: ${n} px` + (n ? ` bbox x${x0}-${x1} y${y0}-${y1}` : '')); }
