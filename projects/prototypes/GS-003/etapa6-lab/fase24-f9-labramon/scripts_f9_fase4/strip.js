'use strict';
// node strip.js out.png dir1 [dir2 ...] — tira horizontal (1 linha por dir), 1x, transparente (spritesheet)
const L = require('./lib.js');
const [, , out, ...dirs] = process.argv;
const rows = dirs.map(d => L.frames(d)); const cols = Math.max(...rows.map(r => r.length));
const cv = L.canvas(cols * 60, rows.length * 60);
rows.forEach((r, ri) => r.forEach((f, ci) => { const img = L.readPNG(f); for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const si = (y * 60 + x) * 4, di = ((ri * 60 + y) * cv.width + ci * 60 + x) * 4; for (let k = 0; k < 4; k++) cv.data[di + k] = img.data[si + k]; } }));
L.save(out, cv); console.log('wrote', out, cv.width + 'x' + cv.height);
