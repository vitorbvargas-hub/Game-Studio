'use strict';
const L = require('./lib.js'); const [, , a, b] = process.argv; const A = L.readPNG(a), B = L.readPNG(b); let n = 0, x0 = 99, x1 = -1, y0 = 99, y1 = -1;
for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const k = (y * 60 + x) * 4; const pa = A.data[k + 3], pb = B.data[k + 3]; if (pa !== pb || (pa && (A.data[k] !== B.data[k] || A.data[k + 1] !== B.data[k + 1] || A.data[k + 2] !== B.data[k + 2]))) { n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
console.log(a.split('/').slice(-2).join('/'), 'x', b.split('/').slice(-2).join('/'), n, n ? `x${x0}-${x1} y${y0}-${y1}` : '');
