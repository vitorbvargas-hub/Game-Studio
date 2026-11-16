'use strict';
// node ascii.js file y0 y1 [x0 x1] — dump: '.' transparente, '#' contorno escuro (lum<60), letras por cor
const L = require('./lib.js');
const [, , f, y0, y1, x0 = 0, x1 = 59] = process.argv;
const img = L.readPNG(f);
const map = { '#f6f2e8': 'W', '#d5d2c6': 'w', '#b1afa3': 'g', '#8e8c81': 'h', '#6b6b5c': 'k', '#d94182': 'P', '#ac2d64': 'p', '#7a2044': 'q', '#a4a370': 'y', '#b97191': 'r', '#dc9aa3': 'R', '#81231d': 'e', '#c63239': 'E', '#434a39': 'o', '#58444b': 'm' };
console.log('     ' + Array.from({ length: +x1 - +x0 + 1 }, (_, i) => ((+x0 + i) % 10)).join(''));
for (let y = +y0; y <= +y1; y++) {
  let s = '';
  for (let x = +x0; x <= +x1; x++) { const [r, g, b, a] = L.px(img, x, y); if (!a) { s += '.'; continue; } const h = L.hex(r, g, b); s += map[h] || ((r + g + b) / 3 < 60 ? '#' : '?'); }
  console.log(String(y).padStart(3) + '  ' + s);
}
