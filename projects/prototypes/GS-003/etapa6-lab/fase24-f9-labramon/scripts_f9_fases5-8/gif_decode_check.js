'use strict';
// Minimal GIF89a decoder (global color table, single or multiple frames,
// standard LZW) to self-check our own encoder's output.
const fs = require('fs');

function lzwDecode(data, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let dict = [];
  function resetDict() {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict.push([i]);
    dict.push(null); // clear
    dict.push(null); // end
  }
  resetDict();
  let bitPos = 0;
  function readCode() {
    let code = 0;
    for (let i = 0; i < codeSize; i++) {
      const byteIdx = bitPos >> 3;
      const bitIdx = bitPos & 7;
      const bit = (data[byteIdx] >> bitIdx) & 1;
      code |= bit << i;
      bitPos++;
    }
    return code;
  }
  const out = [];
  let prev = null;
  while (bitPos + codeSize <= data.length * 8) {
    const code = readCode();
    if (code === clearCode) {
      resetDict();
      codeSize = minCodeSize + 1;
      prev = null;
      continue;
    }
    if (code === endCode) break;
    let entry;
    if (code < dict.length && dict[code]) {
      entry = dict[code];
    } else if (code === dict.length && prev) {
      entry = prev.concat([prev[0]]);
    } else {
      throw new Error('bad code ' + code + ' at dict.length=' + dict.length);
    }
    out.push(...entry);
    if (prev) {
      dict.push(prev.concat([entry[0]]));
      if (dict.length > (1 << codeSize) && codeSize < 12) codeSize++;
    }
    prev = entry;
  }
  return out;
}

const path = process.argv[2];
const buf = fs.readFileSync(path);
if (buf.toString('ascii', 0, 6) !== 'GIF89a' && buf.toString('ascii',0,6) !== 'GIF87a') throw new Error('not a gif');
let p = 6;
const width = buf.readUInt16LE(p); p += 2;
const height = buf.readUInt16LE(p); p += 2;
const packed = buf[p]; p += 1;
const gctFlag = (packed >> 7) & 1;
const gctSize = 2 << (packed & 7);
p += 2; // bg color index, pixel aspect
let palette = null;
if (gctFlag) {
  palette = [];
  for (let i = 0; i < gctSize; i++) { palette.push([buf[p], buf[p+1], buf[p+2]]); p += 3; }
}
console.log('width', width, 'height', height, 'gctSize', gctSize);
let frameCount = 0;
while (p < buf.length) {
  const marker = buf[p];
  if (marker === 0x21) { // extension
    p += 1;
    const label = buf[p]; p += 1;
    while (true) {
      const blockSize = buf[p]; p += 1;
      if (blockSize === 0) break;
      p += blockSize;
    }
  } else if (marker === 0x2C) { // image descriptor
    p += 1;
    const ix = buf.readUInt16LE(p); p+=2;
    const iy = buf.readUInt16LE(p); p+=2;
    const iw = buf.readUInt16LE(p); p+=2;
    const ih = buf.readUInt16LE(p); p+=2;
    const ipacked = buf[p]; p += 1;
    const minCodeSize = buf[p]; p += 1;
    const dataBytes = [];
    while (true) {
      const blockSize = buf[p]; p += 1;
      if (blockSize === 0) break;
      for (let i = 0; i < blockSize; i++) dataBytes.push(buf[p+i]);
      p += blockSize;
    }
    const indices = lzwDecode(dataBytes, minCodeSize);
    frameCount++;
    console.log('frame', frameCount, 'iw', iw, 'ih', ih, 'decoded indices', indices.length, 'expected', iw*ih);
    if (indices.length !== iw*ih) throw new Error('length mismatch');
    // sample a few pixels
    const sample = [0, Math.floor(indices.length/2), indices.length-1].map(i => indices[i]);
    console.log('  sample indices', sample, 'colors', sample.map(i => palette[i]));
  } else if (marker === 0x3B) {
    console.log('trailer reached, frames=', frameCount);
    break;
  } else {
    throw new Error('unknown marker 0x' + marker.toString(16) + ' at p=' + p);
  }
}
