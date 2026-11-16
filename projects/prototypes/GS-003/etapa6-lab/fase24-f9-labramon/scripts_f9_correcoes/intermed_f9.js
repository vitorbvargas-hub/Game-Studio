'use strict';
// A2 — quadro intermediário de entrada (0 gerações).
// modo "cauda" (usado no irritado): a pose-alvo (1º quadro da emoção) com a CAUDA DO IDLE — a cauda atrasa 1 quadro (sobreposição de ação):
//   corpo/cabeça/patas já na pose desenhada; só a cauda fica onde estava. Divide o salto idle→pose em 2 passos.
//   node intermed_f9.js cauda <idle.png> <alvo.png> <saida.png>
// modo "patas" (testado, não usado): a pose-alvo com as patas esticadas n px (corpo a meio caminho na altura).
//   node intermed_f9.js patas <alvo.png> <saida.png> <n> <y0> <y1>
const L = require('./lib.js'), G = require('./rig.js');
const df = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 4) { const x = a.data[i + 3], y = b.data[i + 3]; if (x !== y || (x && (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]))) n++; } return n; };
const light = h => h && !G.isDark(h);
function gapfix(img) { const todo = []; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (!light(h)) continue; if (!G.at(img, x + 1, y) || !G.at(img, x - 1, y) || !G.at(img, x, y + 1) || !G.at(img, x, y - 1)) todo.push([x, y]); } for (const [x, y] of todo) G.set(img, x, y, G.DARK); return todo.length; }
const mode = process.argv[2];
if (mode === 'cauda') {
  const [, , , IDLE, TGT, OUT] = process.argv; const idle = L.readPNG(IDLE), tgt = L.readPNG(TGT);
  const big = (img, f) => G.pinkComponents(img).filter(f).sort((a, b) => b.n - a.n)[0];
  const tTail = big(tgt, c => c.maxX <= 27 && c.n > 40), iTail = big(idle, c => c.maxX <= 26 && c.n > 40);
  const [, body] = G.split(tgt, G.partMask(tgt, tTail)); const [part] = G.split(idle, G.partMask(idle, iTail));
  // sobras do contorno da cauda-alvo: escuros na caixa da cauda (+2) sem nenhum pixel claro vizinho
  let sobras = 0; const bx = [tTail.minX - 2, tTail.minY - 2, tTail.maxX + 3, tTail.maxY + 2];
  for (let pass = 0; pass < 3; pass++) for (let y = bx[1]; y <= bx[3]; y++) for (let x = bx[0]; x <= bx[2]; x++) {
    const h = G.at(body, x, y); if (!h || !G.isDark(h)) continue; let keep = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && light(G.at(body, x + dx, y + dy))) keep = true;
    if (!keep) { G.set(body, x, y, null); sobras++; } }
  const out = G.over(body, part); const gaps = gapfix(out); L.save(OUT, out); const m = L.measure(out);
  console.log(JSON.stringify({ modo: 'cauda', idle: IDLE, alvo: TGT, cauda_alvo_px: tTail.n, cauda_idle_px: iTail.n, sobras_contorno_px: sobras, contorno_fechado_px: gaps, idle_para_X_px: df(idle, out), X_para_alvo_px: df(out, tgt), idle_para_alvo_px: df(idle, tgt), bbox: m.bbox, cores: m.colors.size, semi: m.semi }));
} else {
  const [, , , IN, OUT, nS, y0S, y1S] = process.argv; const N = +nS, Y0 = +y0S, Y1 = +y1S;
  const rowDiff = (img, y) => { let d = 0; for (let x = 0; x < 60; x++) if (G.at(img, x, y) !== G.at(img, x, y + 1)) d++; return d; };
  const stretch = (img, y) => { const o = G.blank(img); for (let yy = 0; yy < 60; yy++) for (let x = 0; x < 60; x++) G.set(o, x, yy, G.at(img, x, yy < y ? yy + 1 : yy)); return o; };
  let img = L.readPNG(IN); const rows = [];
  for (let k = 0; k < N; k++) { let best = null; for (let y = Y0; y <= Y1; y++) { const d = rowDiff(img, y); if (!best || d < best.d) best = { y, d }; } img = stretch(img, best.y); rows.push(best); }
  const m = L.measure(img); L.save(OUT, img); console.log(JSON.stringify({ modo: 'patas', alvo: IN, linhas_duplicadas: rows, bbox: m.bbox, h: m.h, cores: m.colors.size, semi: m.semi }));
}
