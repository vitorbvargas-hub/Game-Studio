'use strict';
// Minimal pure-Node PNG decoder (no external deps), counterpart of png.js.
// Supports 8-bit gray/RGB/RGBA/gray+alpha and 1/2/4/8-bit palette (with tRNS),
// non-interlaced -- enough for PMD Collab sprite sheets. Returns
// { width, height, data: Uint8ClampedArray RGBA }.
const zlib = require('zlib');
const fs = require('fs');

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let off = 8;
  let w, h, depth, ctype, interlace, palette = null, trns = null;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      depth = data[8]; ctype = data[9]; interlace = data[12];
    } else if (type === 'PLTE') palette = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (interlace) throw new Error('interlaced PNG not supported');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ctype];
  if (ctype !== 3 && depth !== 8) throw new Error(`unsupported depth ${depth} for ctype ${ctype}`);
  const bpp = Math.max(1, (channels * depth) >> 3);
  const stride = Math.ceil((w * channels * depth) / 8);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[src + i];
      const a = i >= bpp ? px[dst + i - bpp] : 0;
      const b = y > 0 ? px[dst - stride + i] : 0;
      const c = y > 0 && i >= bpp ? px[dst - stride + i - bpp] : 0;
      let v;
      switch (ft) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: v = x + paeth(a, b, c); break;
        default: throw new Error(`bad filter ${ft}`);
      }
      px[dst + i] = v & 255;
    }
  }
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (ctype === 3) {
        const bitPos = x * depth;
        const byte = px[y * stride + (bitPos >> 3)];
        const idx = (byte >> (8 - depth - (bitPos & 7))) & ((1 << depth) - 1);
        out[o] = palette[idx * 3]; out[o + 1] = palette[idx * 3 + 1]; out[o + 2] = palette[idx * 3 + 2];
        out[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      } else {
        const p = y * stride + x * channels;
        if (ctype === 0 || ctype === 4) {
          out[o] = out[o + 1] = out[o + 2] = px[p];
          out[o + 3] = ctype === 4 ? px[p + 1] : 255;
        } else {
          out[o] = px[p]; out[o + 1] = px[p + 1]; out[o + 2] = px[p + 2];
          out[o + 3] = ctype === 6 ? px[p + 3] : 255;
        }
      }
    }
  }
  return { width: w, height: h, data: out };
}

function loadPNG(path) { return decodePNG(fs.readFileSync(path)); }

module.exports = { decodePNG, loadPNG };
