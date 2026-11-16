'use strict';
// node offset.js rot.png frame.png — melhor (dx,dy) tal que frame(x+dx,y+dy) ~ rot(x,y), por nº de pixels iguais
const L = require('./lib.js');
const [, , a, b] = process.argv; const A = L.readPNG(a), B = L.readPNG(b);
function at(i, x, y) { if (x < 0 || y < 0 || x >= i.width || y >= i.height) return 0; const k = (y * i.width + x) * 4; return i.data[k + 3] ? (i.data[k] << 16 | i.data[k + 1] << 8 | i.data[k + 2]) + 1 : 0; }
let best = null;
for (let dy = -6; dy <= 6; dy++) for (let dx = -8; dx <= 8; dx++) { let s = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const p = at(A, x, y); if (p && p === at(B, x + dx, y + dy)) s++; } if (!best || s > best.s) best = { dx, dy, s }; }
console.log(JSON.stringify(best));
