'use strict';
// Pós-processo local (0 gerações) dos quadros PixelLab já limpos (rc/):
// 1 paleta exata da rotação · 2 remove pontos soltos · 3 trava de cabeça/rosto com pixels da rotação · 4 âncora (última linha opaca = y49)
// node post.js <rotacoes> <inRoot> <outRoot> [anim/dir ...]
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs');
const [, , R, IN, OUT, ...only] = process.argv;
const CFG = {
  E: { align: [36, 14, 49, 33], top: 22, face: [35, 22, 49, 32] },
  W: { align: [10, 14, 23, 33], top: 22, face: [10, 21, 24, 31] },
  S: { align: [22, 14, 37, 31], top: 23, face: [22, 21, 37, 32] }, // F9 correções: rosto S inclui y=32 (presa, A5)
  N: { align: [22, 14, 37, 23], top: 23, face: null },
};
const ANCHOR = 49;
const RED = new Set(['#c63239', '#81231d']), MARK = new Set(['#b97191', '#dc9aa3']);
function count(img, set) { let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (set.has(G.at(img, x, y))) n++; return n; }
function palette(img) { return [...L.measure(img).colors.keys()].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), h]); }
function palmap(img, pal) { let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const p = L.px(img, x, y); if (p[3] < 128) { G.set(img, x, y, null); continue; } const h0 = L.hex(p[0], p[1], p[2]); let b = null, bd = 1e9; for (const c of pal) { const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2; if (d < bd) { bd = d; b = c[3]; } } if (b !== h0) n++; G.set(img, x, y, b); } return n; }
function orphans(img) { // mantém o maior componente 8-conexo
  const seen = new Set(), comps = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { if (!G.at(img, x, y) || seen.has(G.key(x, y))) continue; const c = []; const st = [[x, y]]; seen.add(G.key(x, y)); while (st.length) { const [cx, cy] = st.pop(); c.push([cx, cy]); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (G.at(img, nx, ny) && !seen.has(G.key(nx, ny))) { seen.add(G.key(nx, ny)); st.push([nx, ny]); } } } comps.push(c); }
  comps.sort((a, b) => b.length - a.length); let n = 0;
  for (const c of comps.slice(1)) { n += c.length; for (const [x, y] of c) G.set(img, x, y, null); }
  return n;
}
const log = {};
for (const anim of ['walk', 'idle']) for (const d of ['S', 'E', 'N', 'W']) {
  if (only.length && !only.includes(`${anim}/${d}`)) continue;
  const rot = L.readPNG(`${R}/labramon_${d}.png`), pal = palette(rot), c = CFG[d];
  const rows = [];
  for (const f of L.frames(`${IN}/${anim}/${d}`)) {
    const img = L.readPNG(f), name = f.split('/').pop();
    const remap = palmap(img, pal);
    const orf = orphans(img);
    // alinhamento da cabeça
    let best = null;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { let diff = 0, n = 0; for (let y = c.align[1]; y <= c.align[3]; y++) for (let x = c.align[0]; x <= c.align[2]; x++) { n++; if (G.at(rot, x, y) !== G.at(img, x + dx, y + dy)) diff++; } const score = diff + 0.5 * (Math.abs(dx) + Math.abs(dy)); if (!best || score < best.score) best = { dx, dy, diff, n, score }; }
    const before = { red: count(img, RED), mark: count(img, MARK) };
    let changed = 0;
    // topo da cabeça: linhas <= top passam a ser exatamente as da rotação (apaga artefatos acima da cabeça)
    for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const sy = y - best.dy, sx = x - best.dx; if (sy > c.top) continue; const h = (sy >= 0 && sx >= 0 && sx < 60) ? G.at(rot, sx, sy) : null; if (G.at(img, x, y) !== h) { changed++; G.set(img, x, y, h); } }
    if (c.face) for (let y = c.face[1]; y <= c.face[3]; y++) for (let x = c.face[0]; x <= c.face[2]; x++) { const h = G.at(rot, x, y); if (h && G.at(img, x + best.dx, y + best.dy) !== h) { changed++; G.set(img, x + best.dx, y + best.dy, h); } }
    // âncora
    const m = L.measure(img); const shiftY = ANCHOR - m.bbox[3];
    const outImg = shiftY ? L.shift(img, 0, shiftY) : img;
    L.save(`${OUT}/${anim}/${d}/${name}`, outImg);
    const after = { red: count(outImg, RED), mark: count(outImg, MARK) };
    rows.push({ quadro: name, paleta_px: remap, soltos_px: orf, cabeca_dx: best.dx, cabeca_dy: best.dy, casam: `${best.n - best.diff}/${best.n}`, travados_px: changed, ancora_shift: shiftY, cabeca_dy_final: best.dy + shiftY, olho: `${before.red}->${after.red}`, marcas: `${before.mark}->${after.mark}` });
    console.log(`${anim}/${d} ${name} paleta ${remap} soltos ${orf} cabeça dx${best.dx} dy${best.dy} (${best.n - best.diff}/${best.n}) travados ${changed} âncora ${shiftY >= 0 ? '+' : ''}${shiftY} → cabeça dy final ${best.dy + shiftY}; olho ${before.red}->${after.red} marcas ${before.mark}->${after.mark}`);
  }
  log[`${anim}/${d}`] = rows;
}
fs.mkdirSync(OUT, { recursive: true });
const lp = `${OUT}/_post_log.json`; let prev = {}; try { prev = JSON.parse(fs.readFileSync(lp, 'utf8')); } catch (e) { }
fs.writeFileSync(lp, JSON.stringify(Object.assign(prev, log), null, 1));
