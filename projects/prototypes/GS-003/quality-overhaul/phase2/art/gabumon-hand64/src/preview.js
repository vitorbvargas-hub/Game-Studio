// Scales a PNG N times (nearest-neighbor) for human review. No AI.
'use strict';
const { decodePNG, encodePNG } = require('./png.js');
const fs = require('fs');

function upscale(img, scale) {
  const out = Buffer.alloc(img.width * scale * img.height * scale * 4);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const si = (y * img.width + x) * 4;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const tx = x * scale + dx, ty = y * scale + dy;
          const ti = (ty * img.width * scale + tx) * 4;
          out[ti] = img.data[si]; out[ti + 1] = img.data[si + 1]; out[ti + 2] = img.data[si + 2]; out[ti + 3] = img.data[si + 3];
        }
      }
    }
  }
  return { width: img.width * scale, height: img.height * scale, data: out };
}

function rowJoin(imgs, gap) {
  gap = gap || 4;
  const h = Math.max(...imgs.map(i => i.height));
  const w = imgs.reduce((s, i) => s + i.width, 0) + gap * (imgs.length - 1);
  const out = Buffer.alloc(w * h * 4);
  let xoff = 0;
  for (const img of imgs) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const si = (y * img.width + x) * 4;
        const ti = (y * w + (x + xoff)) * 4;
        out[ti] = img.data[si]; out[ti + 1] = img.data[si + 1]; out[ti + 2] = img.data[si + 2]; out[ti + 3] = img.data[si + 3];
      }
    }
    xoff += img.width + gap;
  }
  return { width: w, height: h, data: out };
}

function savePNG(path, img) { fs.writeFileSync(path, encodePNG(img.width, img.height, img.data)); }

module.exports = { upscale, rowJoin, savePNG, decodePNG, loadPNG: p => decodePNG(fs.readFileSync(p)) };
