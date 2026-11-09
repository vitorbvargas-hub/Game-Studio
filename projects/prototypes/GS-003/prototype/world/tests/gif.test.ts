// GIF das evidências (scripts/gif.mjs): ida e volta por um decodificador GIF89a padrão (LZW com tamanho de código
// variável e CLEAR), em quadros com muitos códigos (força passar de 9 a 12 bits e o reset da tabela).

import { describe, expect, it } from "vitest";
// @ts-expect-error módulo .mjs de script, sem tipos
import { encodeGif } from "../scripts/gif.mjs";

function decodeGif(buf: Uint8Array): { width: number; height: number; frames: { rgb: number[]; delay: number }[] } {
  let p = 6;
  const u16 = () => buf[p++] | (buf[p++] << 8);
  const width = u16();
  const height = u16();
  const flags = buf[p++];
  p += 2;
  const gct: number[] = [];
  for (let i = 0; i < 1 << ((flags & 7) + 1); i++) gct.push((buf[p++] << 16) | (buf[p++] << 8) | buf[p++]);
  const frames: { rgb: number[]; delay: number }[] = [];
  let delay = 0;
  const blocks = () => {
    const out: number[] = [];
    for (let n = buf[p++]; n; n = buf[p++]) for (let i = 0; i < n; i++) out.push(buf[p++]);
    return out;
  };
  while (p < buf.length) {
    const b = buf[p++];
    if (b === 0x3b) break;
    if (b === 0x21) {
      const label = buf[p++];
      if (label === 0xf9) {
        p++;
        p++;
        delay = u16() * 10;
        p += 2;
      } else blocks();
      continue;
    }
    if (b !== 0x2c) throw new Error("bloco inesperado " + b);
    p += 8;
    p++;
    const min = buf[p++];
    const data = blocks();
    const clear = 1 << min;
    const eoi = clear + 1;
    let size = min + 1;
    let dict: number[][] = [];
    const reset = () => {
      dict = [];
      for (let i = 0; i < clear; i++) dict[i] = [i];
      dict[clear] = [];
      dict[eoi] = [];
      size = min + 1;
    };
    reset();
    let bit = 0;
    const read = () => {
      let v = 0;
      for (let i = 0; i < size; i++, bit++) v |= ((data[bit >> 3] >> (bit & 7)) & 1) << i;
      return v;
    };
    const idx: number[] = [];
    let prev: number[] | null = null;
    for (;;) {
      const code = read();
      if (code === clear) {
        reset();
        prev = null;
        continue;
      }
      if (code === eoi) break;
      let entry: number[];
      if (code < dict.length) entry = dict[code];
      else if (prev) entry = [...prev, prev[0]];
      else throw new Error("código inválido");
      idx.push(...entry);
      if (prev && dict.length < 4096) {
        dict.push([...prev, entry[0]]);
        if (dict.length === 1 << size && size < 12) size++;
      }
      prev = entry;
    }
    frames.push({ rgb: idx.map((i) => gct[i]), delay });
  }
  return { width, height, frames };
}

describe("scripts/gif.mjs", () => {
  it("ida e volta: dimensões, atrasos e cada pixel de 3 quadros (até 200 cores, padrões que estouram a tabela)", () => {
    const w = 97;
    const h = 61;
    const colors = Array.from({ length: 200 }, (_, i) => [(i * 37) & 255, (i * 91) & 255, (i * 13 + 7) & 255]);
    let seed = 1;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % 200);
    const frames = [0, 1, 2].map((k) => {
      const data = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < w * h; i++) {
        const c = colors[k === 1 ? (i >> 4) % 200 : rnd()];
        data.set([c[0], c[1], c[2], 255], i * 4);
      }
      return { data, width: w, height: h, delayMs: 40 + k * 30 };
    });
    const gif = decodeGif(encodeGif(frames));
    expect([gif.width, gif.height, gif.frames.length]).toEqual([w, h, 3]);
    expect(gif.frames.map((f) => f.delay)).toEqual([40, 70, 100]);
    gif.frames.forEach((f, k) => {
      const want = Array.from({ length: w * h }, (_, i) => (frames[k].data[i * 4] << 16) | (frames[k].data[i * 4 + 1] << 8) | frames[k].data[i * 4 + 2]);
      expect(f.rgb).toEqual(want);
    });
  });
});
