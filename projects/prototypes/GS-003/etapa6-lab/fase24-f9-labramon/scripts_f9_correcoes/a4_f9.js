'use strict';
// A4 — trava do topo do capuz nos picos de ação (0 gerações). Usado por fix_f9.js.
// O deslocamento da cabeça é medido pela silhueta (alfa) da faixa do topo da cabeça; a faixa da rotação E (linhas <= y1, colunas x0..x1)
// é colada no quadro nesse deslocamento (inclusive o transparente acima dela, que apaga picos/sobras). Linhas abaixo de y1 (olho, boca, focinho) não são tocadas.
// Mancha cinza sobre o olho (incapacitado): pixels da cor #6b6b5c/#8e8c81 dentro de uma caixa viram a cor clara vizinha mais comum.
const G = require('./rig.js');
function headOffset(img, rot, box) {
  const [x0, y0, x1, y1] = box; let best = null;
  for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
    let d = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!!G.at(rot, x, y) !== !!G.at(img, x + dx, y + dy)) d++;
    const s = d + 0.3 * (Math.abs(dx) + Math.abs(dy)); if (!best || s < best.s) best = { dx, dy, d, s };
  }
  return best;
}
function lockTop(img, rot, c) {
  const off = c.off || headOffset(img, rot, c.measure || [30, 10, 48, 21]); let changed = 0;
  for (let y = 0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) {
    const want = G.at(rot, x, y), tx = x + off.dx, ty = y + off.dy; if (ty < 0 || ty > 59 || tx < 0 || tx > 59) continue;
    if (G.at(img, tx, ty) !== want) { G.set(img, tx, ty, want); changed++; }
  }
  // sobras escuras logo fora da faixa (3 colunas de cada lado) que ficaram sem pixel claro vizinho
  let sobras = 0;
  for (let pass = 0; pass < 3; pass++) for (const [a, b] of [[c.x0 + off.dx - 3, c.x0 + off.dx - 1], [c.x1 + off.dx + 1, c.x1 + off.dx + 3]]) for (let y = 0; y < c.y1 + off.dy; y++) for (let x = a; x <= b; x++) {
    const h = G.at(img, x, y); if (!h || !G.isDark(h)) continue; let keep = false;
    for (let ddy = -1; ddy <= 1; ddy++) for (let ddx = -1; ddx <= 1; ddx++) { const n = G.at(img, x + ddx, y + ddy); if ((ddx || ddy) && n && !G.isDark(n)) keep = true; }
    if (!keep) { G.set(img, x, y, null); sobras++; }
  }
  return { dx: off.dx, dy: off.dy, silhueta_dif: off.d, faixa_rot: [c.x0, 0, c.x1, c.y1], px: changed, sobras_escuras_px: sobras };
}
function smudge(img, box) {
  const GREY = new Set(['#6b6b5c', '#8e8c81', '#434a39']); let n = 0; const [x0, y0, x1, y1] = box; const todo = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!GREY.has(G.at(img, x, y))) continue; const cnt = new Map();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const h = G.at(img, x + dx, y + dy); if (h && !G.isDark(h) && !GREY.has(h)) cnt.set(h, (cnt.get(h) || 0) + 1); }
    const best = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0]; if (best) todo.push([x, y, best[0]]); }
  for (const [x, y, h] of todo) { G.set(img, x, y, h); n++; } return n;
}
// Olho fechado do incapacitado: a mancha cinza (#6b6b5c/#434a39) vira capuz claro; fica só a linha escura do olho fechado
// (a linha "#kk#" de baixo da mancha, completada em 4 px) com 1 tom de pálpebra (#d5d2c6) logo acima.
function closedEye(img, box) {
  const [x0, y0, x1, y1] = box; const GREY = new Set(['#6b6b5c', '#434a39']); let yk = -1;
  for (let y = y0; y <= y1 && yk < 0; y++) { let n = 0; for (let x = x0; x <= x1; x++) if (G.at(img, x, y) === '#6b6b5c') n++; if (n >= 3) yk = y; }
  if (yk < 0) return { aplicado: false };
  const ly = yk + 3; const xs = []; for (let x = x0; x <= x1; x++) if (G.isDark(G.at(img, x, ly))) xs.push(x);
  const lx0 = Math.min(...xs), lx1 = Math.max(...xs); let n = 0;
  for (let y = yk - 1; y <= ly; y++) for (let x = x0; x <= x1; x++) { if (GREY.has(G.at(img, x, y))) { G.set(img, x, y, '#f6f2e8'); n++; } }
  for (let x = lx0; x <= lx1; x++) { if (G.at(img, x, ly) !== '#010101') { G.set(img, x, ly, '#010101'); n++; } }
  for (let x = lx0 + 1; x < lx1; x++) { if (G.at(img, x, ly - 1) === '#f6f2e8') { G.set(img, x, ly - 1, '#d5d2c6'); n++; } }
  return { aplicado: true, linha_olho_y: ly, linha_x: [lx0, lx1], px: n };
}
function apply(img, rot, cfg) { const r = {}; if (cfg.top) r.topo_capuz = lockTop(img, rot, cfg.top); if (cfg.smudge) r.mancha_px = smudge(img, cfg.smudge); if (cfg.eye) r.olho_fechado = closedEye(img, cfg.eye); return r; }
const TOP = { y1: 20, x0: 31, x1: 48 };
module.exports = {
  apply,
  'f8-attack-bark': { 4: { top: TOP }, 5: { top: TOP }, 6: { top: TOP } },
  'f8-ko-recover': { 6: { top: TOP } },
  'f8-ko-fall': { 4: { eye: [37, 35, 46, 41] }, 5: { eye: [37, 35, 46, 41] }, 6: { eye: [37, 35, 46, 41] }, 7: { eye: [37, 35, 46, 41] } },
  'f8-ko-loop': { 0: { eye: [37, 35, 46, 41] }, 1: { eye: [37, 35, 46, 41] }, 2: { eye: [37, 35, 46, 41] }, 3: { eye: [37, 35, 46, 41] } },
};
