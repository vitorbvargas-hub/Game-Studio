'use strict';
// Folha de contato com linhas de larguras diferentes: node sheet58.js out.png scale bg(0|1) rot.png row1 row2 ...  (row = arquivos separados por '+'; a rotação entra como 1ª célula de cada linha)
const L = require('./lib.js');
const [, , out, sS, bgS, rotP, ...rows] = process.argv; const s = +sS, bg = +bgS, pad = 2;
const lists = rows.map(r => [rotP, ...r.split('+')].map(f => L.readPNG(f)));
const widths = lists.map(l => pad + l.reduce((a, im) => a + im.width * s + pad, 0));
const cv = L.canvas(Math.max(...widths), pad + lists.length * (60 * s + pad), bg ? [96, 104, 112, 255] : null);
lists.forEach((l, ri) => { let x0 = pad; const y0 = pad + ri * (60 * s + pad);
  l.forEach(im => { if (bg) { L.paste(cv, L.canvas(im.width * s, 60 * s, [128, 136, 144, 255]), x0, y0); for (let k = 0; k < Math.max(1, s / 4 | 0); k++) L.hline(cv, y0 + 50 * s + k, x0, x0 + im.width * s - 1, [70, 76, 84, 255]); }
    L.paste(cv, L.upscale(im, s), x0, y0); x0 += im.width * s + pad; }); });
L.save(out, cv); console.log('wrote', out, cv.width + 'x' + cv.height);
