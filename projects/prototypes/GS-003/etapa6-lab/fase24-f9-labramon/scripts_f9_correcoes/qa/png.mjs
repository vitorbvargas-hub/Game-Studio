// Decodificador/codificador PNG mínimo (game-qa, F9 Fase 10). Sem dependências. Só leitura das entregas.
import fs from 'node:fs';
import zlib from 'node:zlib';

export function readPNG(path) {
  const buf = fs.readFileSync(path);
  const sig = buf.subarray(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('assinatura PNG inválida: ' + path);
  let off = 8, w, h, bd, ct, interlace, plte = null, trns = null; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.subarray(off + 4, off + 8).toString('ascii');
    const data = buf.subarray(off + 8, off + 8 + len); off += 12 + len;
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; interlace = data[12]; }
    else if (type === 'PLTE') plte = data; else if (type === 'tRNS') trns = data; else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (interlace) throw new Error('interlace não suportado: ' + path);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const chans = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ct];
  const bpp = Math.max(1, (chans * bd) >> 3); const stride = (w * chans * bd + 7) >> 3;
  const out = Buffer.alloc(w * h * 4); let prev = Buffer.alloc(stride); let p = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[p++]; const line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      line[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      let r, g, bb, al = 255; const o = (y * w + x) * 4;
      if (bd === 8) {
        const q = x * chans;
        if (ct === 6) { r = line[q]; g = line[q + 1]; bb = line[q + 2]; al = line[q + 3]; }
        else if (ct === 2) { r = line[q]; g = line[q + 1]; bb = line[q + 2]; if (trns && trns.readUInt16BE(0) === r && trns.readUInt16BE(2) === g && trns.readUInt16BE(4) === bb) al = 0; }
        else if (ct === 3) { const idx = line[q]; r = plte[idx * 3]; g = plte[idx * 3 + 1]; bb = plte[idx * 3 + 2]; al = trns && idx < trns.length ? trns[idx] : 255; }
        else if (ct === 0) { r = g = bb = line[q]; }
        else if (ct === 4) { r = g = bb = line[q]; al = line[q + 1]; }
      } else if (ct === 3) {
        const per = 8 / bd; const byte = line[Math.floor(x / per)]; const sh = (per - 1 - (x % per)) * bd; const idx = (byte >> sh) & ((1 << bd) - 1);
        r = plte[idx * 3]; g = plte[idx * 3 + 1]; bb = plte[idx * 3 + 2]; al = trns && idx < trns.length ? trns[idx] : 255;
      } else throw new Error(`formato não suportado bd=${bd} ct=${ct}: ${path}`);
      out[o] = r; out[o + 1] = g; out[o + 2] = bb; out[o + 3] = al;
    }
    prev = line;
  }
  return { w, h, bd, ct, data: out };
}

const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc(b) { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
export function writePNG(path, w, h, rgba) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  fs.writeFileSync(path, Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
export const hex = (d, o) => '#' + [d[o], d[o + 1], d[o + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
