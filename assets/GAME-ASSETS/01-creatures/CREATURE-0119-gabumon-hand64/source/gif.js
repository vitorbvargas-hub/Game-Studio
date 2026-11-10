// Minimal animated GIF89a encoder (indexed color, LZW), pure stdlib, no deps.
// Input: array of {width,height,data(RGBA Buffer)} all same size, plus per-frame delayMs.
'use strict';

function quantizeFrames(frames) {
  // Build one shared palette across all frames (nearest-color fallback if >255 opaque colors).
  const colorSet = new Map(); // "r,g,b" -> count
  for (const f of frames) {
    for (let i = 0; i < f.width * f.height; i++) {
      const a = f.data[i * 4 + 3];
      if (a === 0) continue;
      const key = f.data[i * 4] + ',' + f.data[i * 4 + 1] + ',' + f.data[i * 4 + 2];
      colorSet.set(key, (colorSet.get(key) || 0) + 1);
    }
  }
  let colors = [...colorSet.keys()].map(k => k.split(',').map(Number));
  if (colors.length === 0) colors = [[0, 0, 0]];
  if (colors.length > 255) throw new Error('gif.js: >255 opaque colors (' + colors.length + '); reduce palette first');
  const transparentIndex = colors.length; // reserved slot right after real colors
  let tableSize = 2;
  while (tableSize < colors.length + 1) tableSize *= 2; // +1 for transparent slot
  tableSize = Math.max(tableSize, 4);
  const palette = colors.slice();
  while (palette.length < tableSize) palette.push([0, 0, 0]);

  const colorIndex = new Map(colors.map((c, i) => [c.join(','), i]));
  const indexedFrames = frames.map(f => {
    const idx = new Uint8Array(f.width * f.height);
    for (let i = 0; i < f.width * f.height; i++) {
      const a = f.data[i * 4 + 3];
      if (a === 0) { idx[i] = transparentIndex; continue; }
      const key = f.data[i * 4] + ',' + f.data[i * 4 + 1] + ',' + f.data[i * 4 + 2];
      idx[i] = colorIndex.get(key);
    }
    return idx;
  });
  return { palette, transparentIndex, indexedFrames };
}

function lzwEncode(indices, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const out = []; // array of bits pushed as bytes via a bit buffer
  let bitBuf = 0, bitCount = 0;
  const bytes = [];
  function emit(code, codeSize) {
    bitBuf |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) { bytes.push(bitBuf & 0xff); bitBuf >>= 8; bitCount -= 8; }
  }
  function flush() { if (bitCount > 0) { bytes.push(bitBuf & 0xff); bitBuf = 0; bitCount = 0; } }

  let codeSize = minCodeSize + 1;
  let dict = new Map();
  function resetDict() {
    dict = new Map();
    for (let i = 0; i < clearCode; i++) dict.set(String.fromCharCode(i), i);
    return endCode + 1;
  }
  let nextCode = resetDict();
  emit(clearCode, codeSize);
  let w = '';
  for (let i = 0; i < indices.length; i++) {
    const k = String.fromCharCode(indices[i]);
    const wk = w + k;
    if (dict.has(wk)) { w = wk; continue; }
    emit(dict.get(w), codeSize);
    if (nextCode < 4096) {
      dict.set(wk, nextCode);
      nextCode++;
      if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
    } else {
      emit(clearCode, codeSize);
      codeSize = minCodeSize + 1;
      nextCode = resetDict();
    }
    w = k;
  }
  if (w !== '') emit(dict.get(w), codeSize);
  emit(endCode, codeSize);
  flush();
  return bytes;
}

function u16(n) { return [n & 0xff, (n >> 8) & 0xff]; }

function encodeGIF(frames, delaysMs, opts) {
  opts = opts || {};
  const loop = opts.loop !== false;
  const { palette, transparentIndex, indexedFrames } = quantizeFrames(frames);
  const w = frames[0].width, h = frames[0].height;
  let gctBits = Math.ceil(Math.log2(palette.length));
  gctBits = Math.max(gctBits, 2);
  const gctSize = 1 << gctBits;
  const pal = palette.slice(0, gctSize);
  while (pal.length < gctSize) pal.push([0, 0, 0]);

  const bytes = [];
  const push = (arr) => { for (const b of arr) bytes.push(b); };
  push(Buffer.from('GIF89a', 'ascii'));
  push(u16(w)); push(u16(h));
  push([0x80 | ((7) << 4) | (gctBits - 1)]); // GCT flag, color res, sort=0, size
  push([transparentIndex < gctSize ? transparentIndex : 0]); // bg color index (unused visually)
  push([0]); // pixel aspect
  for (const [r, g, b] of pal) push([r, g, b]);

  if (loop) {
    push([0x21, 0xff, 0x0b]);
    push(Buffer.from('NETSCAPE2.0', 'ascii'));
    push([0x03, 0x01, 0x00, 0x00, 0x00]);
  }

  for (let fi = 0; fi < frames.length; fi++) {
    const delay = Math.round((delaysMs[fi] || 100) / 10);
    push([0x21, 0xf9, 0x04]);
    push([0x09]); // disposal=2 (restore to background), transparent color flag set
    push(u16(delay));
    push([transparentIndex < gctSize ? transparentIndex : 0]);
    push([0x00]);

    push([0x2c]); push(u16(0)); push(u16(0)); push(u16(w)); push(u16(h)); push([0x00]);
    const minCodeSize = Math.max(gctBits, 2);
    push([minCodeSize]);
    const lzwBytes = lzwEncode(indexedFrames[fi], minCodeSize);
    for (let i = 0; i < lzwBytes.length; i += 255) {
      const chunk = lzwBytes.slice(i, i + 255);
      push([chunk.length]); push(chunk);
    }
    push([0x00]);
  }
  push([0x3b]);
  return Buffer.from(bytes);
}

module.exports = { encodeGIF };
