'use strict';
// node diff.js dirA dirB — pixels diferentes por quadro
const L = require('./lib.js'); const [, , a, b] = process.argv; const fa = L.frames(a), fb = L.frames(b);
fa.forEach((f, i) => { const A = L.readPNG(f), B = L.readPNG(fb[i]); let n = 0, al = 0; for (let k = 0; k < A.data.length; k += 4) { if (A.data[k] !== B.data[k] || A.data[k + 1] !== B.data[k + 1] || A.data[k + 2] !== B.data[k + 2] || A.data[k + 3] !== B.data[k + 3]) n++; if ((A.data[k + 3] > 0) !== (B.data[k + 3] > 0)) al++; } console.log(f.split('/').pop(), 'dif', n, 'silhueta', al); });
