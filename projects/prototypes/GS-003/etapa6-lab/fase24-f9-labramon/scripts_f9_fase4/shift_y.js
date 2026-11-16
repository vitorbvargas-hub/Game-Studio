'use strict';
// Shift a PNG vertically by dy (positive = down), keeping canvas size, filling with transparency.
const { readPNG, writePNG } = require('./png.js');
const [,, inPath, outPath, dyStr] = process.argv;
const dy = parseInt(dyStr, 10);
const img = readPNG(inPath);
const { width, height, data } = img;
const out = new Uint8ClampedArray(width * height * 4);
for (let y = 0; y < height; y++) {
  const sy = y - dy;
  if (sy < 0 || sy >= height) continue;
  for (let x = 0; x < width; x++) {
    const si = (sy * width + x) * 4;
    const di = (y * width + x) * 4;
    out[di] = data[si]; out[di+1] = data[si+1]; out[di+2] = data[si+2]; out[di+3] = data[si+3];
  }
}
writePNG(outPath, width, height, out);
console.log('shifted', inPath, '->', outPath, 'dy=', dy);
