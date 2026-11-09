// GIF89a animado mínimo (sem dependências): paleta global de até 256 cores (popularidade em RGB 5-6-5 quando a
// sequência tem mais cores; pixel art de captura costuma caber), LZW padrão, um atraso por quadro, loop infinito.
// Uso: encodeGif(frames: { data: Uint8ClampedArray (RGBA), width, height, delayMs }[]) → Buffer

function buildPalette(frames) {
  const counts = new Map();
  for (const f of frames) for (let i = 0; i < f.data.length; i += 4) {
    const k = (f.data[i] << 16) | (f.data[i + 1] << 8) | f.data[i + 2];
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  if (counts.size <= 256) return [...counts.keys()];
  // Muitas cores: agrupa em 5-6-5 e fica com as 256 mais frequentes (média de cada grupo).
  const groups = new Map();
  for (const [k, n] of counts) {
    const g = ((k >> 19) << 11) | (((k >> 10) & 63) << 5) | ((k >> 3) & 31);
    const s = groups.get(g) ?? { n: 0, r: 0, g: 0, b: 0 };
    s.n += n;
    s.r += ((k >> 16) & 255) * n;
    s.g += ((k >> 8) & 255) * n;
    s.b += (k & 255) * n;
    groups.set(g, s);
  }
  return [...groups.values()].sort((a, b) => b.n - a.n).slice(0, 256).map((s) => (Math.round(s.r / s.n) << 16) | (Math.round(s.g / s.n) << 8) | Math.round(s.b / s.n));
}

function indexer(palette) {
  const exact = new Map(palette.map((c, i) => [c, i]));
  const cache = new Map();
  return (r, g, b) => {
    const k = (r << 16) | (g << 8) | b;
    let i = exact.get(k) ?? cache.get(k);
    if (i !== undefined) return i;
    let best = 0;
    let bd = Infinity;
    for (let j = 0; j < palette.length; j++) {
      const c = palette[j];
      const d = (r - (c >> 16)) ** 2 + (g - ((c >> 8) & 255)) ** 2 + (b - (c & 255)) ** 2;
      if (d < bd) (bd = d), (best = j);
    }
    cache.set(k, best);
    return best;
  };
}

function lzw(indices, minCode) {
  const out = [];
  let cur = 0;
  let nbits = 0;
  const write = (code, size) => {
    cur |= code << nbits;
    nbits += size;
    while (nbits >= 8) {
      out.push(cur & 255);
      cur >>>= 8;
      nbits -= 8;
    }
  };
  const clear = 1 << minCode;
  const eoi = clear + 1;
  let size = minCode + 1;
  let dict = new Map();
  let next = eoi + 1;
  write(clear, size);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const c = indices[i];
    const key = prefix * 4096 + c;
    const hit = dict.get(key);
    if (hit !== undefined) {
      prefix = hit;
      continue;
    }
    write(prefix, size);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > 1 << size && size < 12) size++;
    } else {
      write(clear, size);
      dict = new Map();
      next = eoi + 1;
      size = minCode + 1;
    }
    prefix = c;
  }
  write(prefix, size);
  write(eoi, size);
  if (nbits > 0) out.push(cur & 255);
  return out;
}

export function encodeGif(frames) {
  const { width, height } = frames[0];
  const palette = buildPalette(frames);
  while (palette.length < 2) palette.push(0);
  let bits = 1;
  while (1 << bits < palette.length) bits++;
  const idx = indexer(palette);
  const bytes = [];
  const u16 = (v) => bytes.push(v & 255, (v >> 8) & 255);
  bytes.push(...Buffer.from("GIF89a"));
  u16(width);
  u16(height);
  bytes.push(0x80 | ((bits - 1) << 4) | (bits - 1), 0, 0);
  for (let i = 0; i < 1 << bits; i++) {
    const c = palette[i] ?? 0;
    bytes.push((c >> 16) & 255, (c >> 8) & 255, c & 255);
  }
  bytes.push(0x21, 0xff, 11, ...Buffer.from("NETSCAPE2.0"), 3, 1, 0, 0, 0);
  for (const f of frames) {
    bytes.push(0x21, 0xf9, 4, 0);
    u16(Math.max(2, Math.round(f.delayMs / 10)));
    bytes.push(0, 0);
    bytes.push(0x2c);
    u16(0);
    u16(0);
    u16(width);
    u16(height);
    bytes.push(0);
    const ind = new Array(width * height);
    for (let p = 0, i = 0; p < ind.length; p++, i += 4) ind[p] = idx(f.data[i], f.data[i + 1], f.data[i + 2]);
    const minCode = Math.max(2, bits);
    bytes.push(minCode);
    const data = lzw(ind, minCode);
    for (let i = 0; i < data.length; i += 255) {
      const chunk = data.slice(i, i + 255);
      bytes.push(chunk.length, ...chunk);
    }
    bytes.push(0);
  }
  bytes.push(0x3b);
  return Buffer.from(bytes);
}
