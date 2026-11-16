'use strict';
// Folha de contato: node sheet.js out.png scale bg(0=transparente,1=cinza) rowDir1 rowDir2 ...
// rowDir pode ser "ref.png+dir" para pôr a rotação antes dos quadros. Linha de chão em y=49 (cinza) se bg=1.
const L = require('./lib.js');
const [, , out, sS, bgS, ...rows] = process.argv;
const s = +sS, bg = +bgS, pad = 2;
const lists = rows.map(r => {
  const parts = r.split('+'); let fl = [];
  for (const p of parts) fl = fl.concat(/\.png$/.test(p) ? [p] : L.frames(p));
  return fl;
});
const cols = Math.max(...lists.map(l => l.length));
const first = L.readPNG(lists[0][0]);
const cw = first.width * s + pad, ch = first.height * s + pad;
const cv = L.canvas(pad + cols * cw, pad + lists.length * ch, bg ? [96, 104, 112, 255] : null);
lists.forEach((l, ri) => l.forEach((f, ci) => {
  const x0 = pad + ci * cw, y0 = pad + ri * ch;
  if (bg) {
    const cell = L.canvas(first.width * s, first.height * s, [128, 136, 144, 255]);
    L.paste(cv, cell, x0, y0);
    for (let k = 0; k < Math.max(1, s / 4 | 0); k++) L.hline(cv, y0 + 50 * s + k, x0, x0 + first.width * s - 1, [70, 76, 84, 255]);
  }
  L.paste(cv, L.upscale(L.readPNG(f), s), x0, y0);
}));
L.save(out, cv);
console.log('wrote', out, cv.width + 'x' + cv.height);
