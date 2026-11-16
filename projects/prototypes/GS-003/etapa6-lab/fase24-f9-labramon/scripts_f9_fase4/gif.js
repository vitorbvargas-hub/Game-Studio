'use strict';
// Minimal animated GIF89a encoder (uncompressed-style LZW: literal codes only,
// clear code reset per symbol so no real LZW table is needed). Global palette,
// transparent index 0. No external deps.
const { readPNG } = require('./png.js');
const fs = require('fs');

function buildPalette(frames) {
  const colors = new Map(); // "r,g,b" -> index
  colors.set('T', 0); // index 0 reserved for transparency (color irrelevant)
  for (const img of frames) {
    for (let i = 0; i < img.data.length; i += 4) {
      const a = img.data[i+3];
      if (a === 0) continue;
      const key = `${img.data[i]},${img.data[i+1]},${img.data[i+2]}`;
      if (!colors.has(key)) colors.set(key, colors.size);
    }
  }
  if (colors.size > 256) throw new Error('too many colors for one GIF: ' + colors.size);
  return colors;
}

function paletteTableSize(n) {
  // next power of two >= n, min 2
  let size = 2;
  while (size < n) size *= 2;
  return size;
}

function lzwEncodeLiteral(indices, minCodeSize) {
  // "No compression" LZW: each emitted code is a root symbol (never a back
  // reference), but a spec-compliant decoder still grows its table by one
  // entry per code (prevOutput+firstChar of current), so we must track that
  // growth and widen the code size (or re-Clear) exactly as a real encoder
  // would, or decoders desync.
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const bits = [];
  function emit(code, size) {
    for (let i = 0; i < size; i++) bits.push((code >> i) & 1);
  }
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  let justCleared = true;
  emit(clearCode, codeSize);
  for (const idx of indices) {
    emit(idx, codeSize);
    if (justCleared) {
      // no previous output to extend from right after Clear: no new entry
      justCleared = false;
    } else {
      nextCode++;
      if (nextCode === 4096) {
        emit(clearCode, codeSize);
        codeSize = minCodeSize + 1;
        nextCode = endCode + 1;
        justCleared = true;
        continue;
      }
      if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
    }
  }
  emit(endCode, codeSize);
  // pack bits into bytes, LSB first
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) if (bits[i+j]) b |= (1 << j);
    bytes.push(b);
  }
  return bytes;
}

function writeGif(outPath, pngPaths, delaysMs, scale) {
  const frames = pngPaths.map(p => readPNG(p));
  const { width, height } = frames[0];
  const palette = buildPalette(frames);
  const palSize = paletteTableSize(palette.size);
  const minCodeSize = Math.max(2, Math.ceil(Math.log2(palSize)));
  const w2 = width * scale, h2 = height * scale;

  const out = [];
  function u8(v) { out.push(v & 0xff); }
  function u16(v) { out.push(v & 0xff, (v >> 8) & 0xff); }
  function str(s) { for (const c of s) out.push(c.charCodeAt(0)); }

  str('GIF89a');
  u16(w2); u16(h2);
  u8(0xF0 | (minCodeSize - 1)); // global color table flag, color res, sort, size
  u8(0); // background color index
  u8(0); // pixel aspect ratio

  // global color table
  const sortedEntries = [...palette.entries()].sort((a,b)=>a[1]-b[1]);
  for (let i = 0; i < palSize; i++) {
    const entry = sortedEntries[i];
    if (!entry) { u8(0); u8(0); u8(0); continue; }
    const [key] = entry;
    if (key === 'T') { u8(0); u8(0); u8(0); continue; }
    const [r,g,b] = key.split(',').map(Number);
    u8(r); u8(g); u8(b);
  }

  // Netscape loop extension (loop forever)
  str('!'); u8(0xFF); u8(0x0B);
  str('NETSCAPE2.0');
  u8(3); u8(1); u16(0); u8(0);

  frames.forEach((img, fi) => {
    const delayCs = Math.round((delaysMs[fi] || 100) / 10);
    // Graphic Control Extension
    str('!'); u8(0xF9); u8(4);
    u8(0x09); // disposal=2 (restore to bg), transparent color flag set
    u16(delayCs);
    u8(0); // transparent color index = 0
    u8(0);
    // Image Descriptor
    str(',');
    u16(0); u16(0); u16(w2); u16(h2);
    u8(0); // no local color table, no interlace
    u8(minCodeSize);
    // build index stream at target scale (nearest)
    const indices = new Array(w2 * h2);
    for (let y = 0; y < h2; y++) {
      const sy = Math.floor(y / scale);
      for (let x = 0; x < w2; x++) {
        const sx = Math.floor(x / scale);
        const si = (sy * width + sx) * 4;
        const a = img.data[si+3];
        let idx;
        if (a === 0) idx = 0;
        else {
          const key = `${img.data[si]},${img.data[si+1]},${img.data[si+2]}`;
          idx = palette.get(key);
        }
        indices[y * w2 + x] = idx;
      }
    }
    const lzwBytes = lzwEncodeLiteral(indices, minCodeSize);
    for (let i = 0; i < lzwBytes.length; i += 255) {
      const chunk = lzwBytes.slice(i, i + 255);
      u8(chunk.length);
      for (const b of chunk) u8(b);
    }
    u8(0); // block terminator
  });
  str(';');
  fs.writeFileSync(outPath, Buffer.from(out));
}

const [,, outPath, scaleStr, delaysArg, ...pngPaths] = process.argv;
const scale = parseInt(scaleStr, 10);
const delays = delaysArg.split(',').map(Number);
writeGif(outPath, pngPaths, delays, scale);
console.log('wrote', outPath);
