'use strict';
// node zoom.js out.png scale x0 y0 w h file1 file2 ... — recortes ampliados lado a lado, fundo cinza, grade de 8 px (linhas a cada 8 px de arte).
const L = require('./lib.js');
const [, , out, sS, x0S, y0S, wS, hS, ...files] = process.argv;
const s = +sS, x0 = +x0S, y0 = +y0S, w = +wS, h = +hS, pad = 4;
const cv = L.canvas(pad + files.length * (w * s + pad), h * s + 2 * pad, [60, 64, 70, 255]);
files.forEach((f, i) => {
  const cell = L.canvas(w * s, h * s, [128, 136, 144, 255]);
  // régua: linha clara a cada 8 px absolutos
  for (let yy = 0; yy < h; yy++) if ((y0 + yy) % 8 === 0) L.hline(cell, yy * s, 0, w * s - 1, [140, 148, 156, 255]);
  for (let xx = 0; xx < w; xx++) if ((x0 + xx) % 8 === 0) for (let yy = 0; yy < h * s; yy++) { const di = (yy * cell.width + xx * s) * 4; cell.data[di] = 140; cell.data[di + 1] = 148; cell.data[di + 2] = 156; }
  L.paste(cell, L.upscale(L.crop(L.readPNG(f), x0, y0, w, h), s), 0, 0);
  L.paste(cv, cell, pad + i * (w * s + pad), pad);
});
L.save(out, cv);
console.log('wrote', out, cv.width + 'x' + cv.height);
