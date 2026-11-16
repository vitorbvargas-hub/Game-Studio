'use strict';
// Rig local (0 gerações): operações sobre os pixels da rotação, sem redesenho.
const L = require('./lib.js');
const DARK = '#010101';
const PINK = new Set(['#d94182', '#ac2d64', '#7a2044']);
function at(img, x, y) { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return null; const p = L.px(img, x, y); return p[3] ? L.hex(p[0], p[1], p[2]) : null; }
function isDark(h) { if (!h) return false; const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16); return (r + g + b) / 3 < 60; }
function set(img, x, y, h) { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return; const i = (y * img.width + x) * 4; if (!h) { img.data[i + 3] = 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = 0; return; } img.data[i] = parseInt(h.slice(1, 3), 16); img.data[i + 1] = parseInt(h.slice(3, 5), 16); img.data[i + 2] = parseInt(h.slice(5, 7), 16); img.data[i + 3] = 255; }
function clone(img) { return { width: img.width, height: img.height, data: new Uint8ClampedArray(img.data) }; }
function blank(img) { return L.canvas(img.width, img.height); }
const key = (x, y) => y * 64 + x;

// Componentes rosa (4-conexos). Retorna lista de {pix:Set, minX,maxX,minY,maxY,n}
function pinkComponents(img) {
  const seen = new Set(), out = [];
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
    if (seen.has(key(x, y)) || !PINK.has(at(img, x, y))) continue;
    const c = { pix: new Set(), minX: x, maxX: x, minY: y, maxY: y }; const st = [[x, y]]; seen.add(key(x, y));
    while (st.length) {
      const [cx, cy] = st.pop(); c.pix.add(key(cx, cy));
      c.minX = Math.min(c.minX, cx); c.maxX = Math.max(c.maxX, cx); c.minY = Math.min(c.minY, cy); c.maxY = Math.max(c.maxY, cy);
      // pula 1 px escuro (linhas internas da espiral) para manter a peça inteira
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let nx = cx + dx, ny = cy + dy;
        if (isDark(at(img, nx, ny)) && PINK.has(at(img, nx + dx, ny + dy))) { nx += dx; ny += dy; }
        if (!seen.has(key(nx, ny)) && PINK.has(at(img, nx, ny))) { seen.add(key(nx, ny)); st.push([nx, ny]); }
      }
    }
    c.n = c.pix.size; out.push(c);
  }
  return out;
}
// Máscara da peça: rosa do componente + escuros vizinhos (8) que não tocam (8) cor "de corpo" (não rosa do componente, não escuro)
function partMask(img, comp) {
  const m = new Set(comp.pix);
  for (let y = comp.minY - 1; y <= comp.maxY + 1; y++) for (let x = comp.minX - 1; x <= comp.maxX + 1; x++) {
    if (!isDark(at(img, x, y))) continue;
    let touchPart = false, touchOther = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const h = at(img, x + dx, y + dy); if (!h) continue;
      if (comp.pix.has(key(x + dx, y + dy))) touchPart = true; else if (!isDark(h)) touchOther = true;
    }
    if (touchPart && !touchOther) m.add(key(x, y));
  }
  return m;
}
function split(img, mask) { // -> [parte, resto]
  const a = blank(img), b = clone(img);
  for (const k of mask) { const x = k % 64, y = (k / 64) | 0; set(a, x, y, at(img, x, y)); set(b, x, y, null); }
  return [a, b];
}
// Remove a linha rowDel e desce 1 px tudo o que está acima (pés ficam plantados)
function squash(img, rowDel) {
  const o = blank(img);
  for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) {
    const sy = y > rowDel ? y : y - 1; set(o, x, y, sy >= 0 ? at(img, x, sy) : null);
  }
  return o;
}
function over(dst, src) { for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) { const h = at(src, x, y); if (h) set(dst, x, y, h); } return dst; }
// Fecha furos de 1 px (transparente com opaco acima+abaixo ou esquerda+direita) dentro da caixa dada
function fillHoles(img, box) {
  const [x0, y0, x1, y1] = box; let n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (at(img, x, y)) continue;
    if ((at(img, x, y - 1) && at(img, x, y + 1)) || (at(img, x - 1, y) && at(img, x + 1, y))) { set(img, x, y, DARK); n++; }
  }
  return n;
}
module.exports = { at, set, isDark, clone, blank, key, pinkComponents, partMask, split, squash, over, fillHoles, DARK, PINK };
