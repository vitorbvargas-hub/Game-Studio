'use strict';
// Limpeza fina local. node specks.js <mode: count|fix> <dir> [walkN]
// (a) pontos escuros internos: componentes escuros (4-conexos, <=4 px) sem vizinho transparente e cercados só por claro → cor clara vizinha mais comum
// (b) falha de contorno: pixel claro encostado em transparência → escurece (#010101), silhueta não muda
// (c) walkN: sola rosa-escura da pata traseira (linhas >=44) → escuro neutro
const L = require('./lib.js'), G = require('./rig.js');
const [, , mode, dir, flag] = process.argv;
function specks(img) {
  const seen = new Set(), out = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
    if (!G.isDark(G.at(img, x, y)) || seen.has(G.key(x, y))) continue;
    const c = [], st = [[x, y]]; seen.add(G.key(x, y)); let edge = false; const around = new Map();
    while (st.length) { const [cx, cy] = st.pop(); c.push([cx, cy]);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const h = G.at(img, cx + dx, cy + dy); if (!h) { edge = true; continue; } const four = !dx || !dy;
        if (G.isDark(h)) { if (!seen.has(G.key(cx + dx, cy + dy)) ) { seen.add(G.key(cx + dx, cy + dy)); st.push([cx + dx, cy + dy]); } } else if (four) around.set(h, (around.get(h) || 0) + 1); } }
    if (!edge && c.length <= 4) out.push({ c, fill: [...around.entries()].sort((a, b) => b[1] - a[1])[0] });
  }
  return out;
}
const res = [];
for (const f of L.frames(dir)) {
  const img = L.readPNG(f); const sp = specks(img).filter(s => s.fill && ['#f6f2e8', '#d5d2c6', '#b1afa3'].includes(s.fill[0]));
  let gaps = 0, pad = 0;
  if (mode === 'fix') {
    // (a) só contagem: os componentes achados são linhas legítimas (existem na rotação) — não alterar
    if (flag === 'walkN') for (let y = 44; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (h === '#4b192d' || h === '#7a2044') { G.set(img, x, y, '#24241e'); pad++; } }
    for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (!h || G.isDark(h)) continue; if (!G.at(img, x + 1, y) || !G.at(img, x - 1, y) || !G.at(img, x, y + 1) || !G.at(img, x, y - 1)) { G.set(img, x, y, G.DARK); gaps++; } }
    L.save(f, img);
  }
  res.push(`${sp.length}(${sp.reduce((a, s) => a + s.c.length, 0)}px)` + (mode === 'fix' ? ` g${gaps} s${pad}` : '') + ' ' + sp.map(s => s.c[0].join(',')).join(';'));
}
console.log(dir, '\n  ' + res.join('\n  '));
