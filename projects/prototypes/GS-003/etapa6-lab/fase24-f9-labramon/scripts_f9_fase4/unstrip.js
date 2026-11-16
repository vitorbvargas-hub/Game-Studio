'use strict';
// node unstrip.js in.png outDir n [w=60] — corta uma tira horizontal em n quadros
const L = require('./lib.js');
const [, , inp, outDir, nS, wS = '60'] = process.argv; const img = L.readPNG(inp), w = +wS;
for (let i = 0; i < +nS; i++) L.save(`${outDir}/frame_00${i}.png`, L.crop(img, i * w, 0, w, img.height));
