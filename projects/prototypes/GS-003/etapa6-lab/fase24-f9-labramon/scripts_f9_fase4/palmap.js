'use strict';
// node palmap.js ref.png inDir outDir — mapeia cada pixel opaco para a cor mais próxima da paleta da ref (RGB euclidiano); alfa rígido
const L = require('./lib.js'), G = require('./rig.js'); const [, , ref, inD, outD] = process.argv;
const pal = [...L.measure(L.readPNG(ref)).colors.keys()].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h]);
for (const f of L.frames(inD)) { const img = L.readPNG(f); for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) { const p = L.px(img, x, y); if (p[3] < 128) { G.set(img, x, y, null); continue; } let b = null, bd = 1e9; for (const c of pal) { const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2; if (d < bd) { bd = d; b = c[3]; } } G.set(img, x, y, b); } L.save(`${outD}/${f.split('/').pop()}`, img); }
