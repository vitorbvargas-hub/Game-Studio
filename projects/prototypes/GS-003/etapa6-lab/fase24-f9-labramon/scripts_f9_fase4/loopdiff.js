'use strict';
// node loopdiff.js dir — px diferentes entre quadros consecutivos (inclui último→primeiro)
const L = require('./lib.js'), G = require('./rig.js'); const fr = L.frames(process.argv[2]).map(f => L.readPNG(f)); const out = [];
for (let i = 0; i < fr.length; i++) { const A = fr[i], B = fr[(i + 1) % fr.length]; let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (G.at(A, x, y) !== G.at(B, x, y)) n++; out.push(`q${i}→q${(i + 1) % fr.length}:${n}`); }
console.log(process.argv[2], out.join(' '));
