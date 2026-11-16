'use strict';
// node diff2.js dirA dirB — só pixels visíveis: diferença de cor (ambos opacos) e de silhueta; lista cores de B ausentes em A
const L = require('./lib.js'), G = require('./rig.js'); const [, , a, b] = process.argv; const fa = L.frames(a), fb = L.frames(b);
const extra = new Map(); let tc = 0, ts = 0;
fa.forEach((f, i) => { const A = L.readPNG(f), B = L.readPNG(fb[i]); let c = 0, s = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const ha = G.at(A, x, y), hb = G.at(B, x, y); if (!ha !== !hb) s++; else if (ha && ha !== hb) { c++; const k = ha + '>' + hb; extra.set(k, (extra.get(k) || 0) + 1); } } tc += c; ts += s; });
console.log(`${b}: cor ${tc} px, silhueta ${ts} px em ${fa.length} quadros`); console.log([...extra.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8).map(e => e.join(' ×')).join(' | '));
