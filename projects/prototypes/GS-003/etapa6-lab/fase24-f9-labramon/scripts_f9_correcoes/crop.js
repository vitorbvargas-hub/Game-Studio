'use strict';
// node crop.js out.png scale x0 y0 w h file1 file2 ... — recortes ampliados lado a lado com grade a cada 5 px
const L = require('./lib.js');
const [, , out, sS, x0s, y0s, ws, hs, ...files] = process.argv; const s = +sS, x0 = +x0s, y0 = +y0s, w = +ws, h = +hs, pad = 4;
const cv = L.canvas(pad + files.length * (w * s + pad), h * s + 2 * pad, [40, 40, 48, 255]);
files.forEach((f, i) => { const im = L.crop(L.readPNG(f), x0, y0, w, h); const ox = pad + i * (w * s + pad);
  for (let y = 0; y < h * s; y++) for (let x = 0; x < w * s; x++) { const sx = (x / s) | 0, sy = (y / s) | 0; const p = L.px(im, sx, sy); let c = p[3] ? p : [128, 136, 144, 255];
    if (!p[3] && (((x0 + sx) % 5 === 0 && x % s === 0) || ((y0 + sy) % 5 === 0 && y % s === 0))) c = [100, 108, 116, 255];
    const di = ((pad + y) * cv.width + ox + x) * 4; cv.data[di] = c[0]; cv.data[di + 1] = c[1]; cv.data[di + 2] = c[2]; cv.data[di + 3] = 255; } });
L.save(out, cv); console.log('wrote', out, cv.width + 'x' + cv.height);
