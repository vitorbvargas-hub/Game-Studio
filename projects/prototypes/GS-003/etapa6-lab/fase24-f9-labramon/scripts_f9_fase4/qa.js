'use strict';
// QA de movimento: node qa.js <rotacoes> <movement> → movement/qa_medicoes.json + tabelas markdown no stdout
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs');
const [, , R, M] = process.argv;
const AL = { E: [36, 14, 49, 33], W: [10, 14, 23, 33], S: [22, 14, 37, 31], N: [22, 14, 37, 23] };
const FACE = { E: [35, 22, 49, 32], W: [10, 21, 24, 31], S: [22, 21, 37, 31] };
const RED = new Set(['#c63239', '#81231d']), MARK = new Set(['#b97191', '#dc9aa3']);
const cnt = (img, set) => { let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (set.has(G.at(img, x, y))) n++; return n; };
const out = { gerado: new Date().toISOString(), rotacoes: {}, animacoes: {} };
for (const d of ['S', 'E', 'N', 'W']) { const rot = L.readPNG(`${R}/labramon_${d}.png`), m = L.measure(rot); out.rotacoes[d] = { bbox: m.bbox, w: m.w, h: m.h, px: m.n, cores: m.colors.size, olho_px: cnt(rot, RED), marcas_px: cnt(rot, MARK) }; }
for (const anim of ['walk', 'idle']) for (const d of ['S', 'E', 'N', 'W']) {
  const rot = L.readPNG(`${R}/labramon_${d}.png`), pal = new Set(L.measure(rot).colors.keys()), a = AL[d], fc = FACE[d];
  const imgs = L.frames(`${M}/${anim}/${d}`).map(f => L.readPNG(f)); const rows = [];
  imgs.forEach((img, i) => {
    const m = L.measure(img); let best = null;
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { let diff = 0, n = 0; for (let y = a[1]; y <= a[3]; y++) for (let x = a[0]; x <= a[2]; x++) { n++; if (G.at(rot, x, y) !== G.at(img, x + dx, y + dy)) diff++; } const s = diff + 0.5 * (Math.abs(dx) + Math.abs(dy)); if (!best || s < best.s) best = { dx, dy, diff, n, s }; }
    let faceDiff = null; if (fc) { faceDiff = 0; for (let y = fc[1]; y <= fc[3]; y++) for (let x = fc[0]; x <= fc[2]; x++) { const h = G.at(rot, x, y); if (h && G.at(img, x + best.dx, y + best.dy) !== h) faceDiff++; } }
    const nxt = imgs[(i + 1) % imgs.length]; let chg = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (G.at(img, x, y) !== G.at(nxt, x, y)) chg++;
    rows.push({ q: i, bbox: m.bbox, w: m.w, h: m.h, px: m.n, cores: m.colors.size, fora_paleta: [...m.colors.keys()].filter(c => !pal.has(c)).length, semi: m.semi, pe_y: m.bbox[3], contato_y49: L.runs(img, 49), contato_y48: L.runs(img, 48), cabeca_dx: best.dx, cabeca_dy: best.dy, cabeca_casam: `${best.n - best.diff}/${best.n}`, rosto_px_diferentes: faceDiff, olho_px: cnt(img, RED), marcas_px: cnt(img, MARK), px_mudam_ate_proximo: chg });
  });
  const hs = rows.map(r => r.h), ws = rows.map(r => r.w), ps = rows.map(r => r.px);
  const all = new Set(); imgs.forEach(img => { for (const c of L.measure(img).colors.keys()) all.add(c); });
  out.animacoes[`${anim}/${d}`] = { quadros: rows.length, h_min_max: [Math.min(...hs), Math.max(...hs)], w_min_max: [Math.min(...ws), Math.max(...ws)], px_min_max: [Math.min(...ps), Math.max(...ps)], maior_salto_h: Math.max(...hs.map((h, i) => Math.abs(h - hs[(i + 1) % hs.length]))), maior_salto_w: Math.max(...ws.map((w, i) => Math.abs(w - ws[(i + 1) % ws.length]))), cores_no_conjunto: all.size, pe_y49_em: rows.filter(r => r.pe_y === 49).length + '/' + rows.length, olho_px: [...new Set(rows.map(r => r.olho_px))], marcas_px: [...new Set(rows.map(r => r.marcas_px))], porQuadro: rows };
}
// recuo do pé de apoio (E/W): casa cada contato de y=49 com o contato mais próximo "para trás" no quadro seguinte
for (const d of ['E', 'W']) { const back = d === 'E' ? -1 : 1; const rows = out.animacoes[`walk/${d}`].porQuadro; const steps = [];
  rows.forEach((r, i) => { const nx = rows[(i + 1) % rows.length]; for (const run of r.contato_y49) { const c = (run[0] + run[1]) / 2; let bm = null; for (const r2 of nx.contato_y49) { const c2 = (r2[0] + r2[1]) / 2, dxb = (c2 - c) * back; if (dxb >= -1 && dxb <= 6 && (!bm || Math.abs(dxb) < Math.abs(bm.dxb))) bm = { c2, dxb }; } steps.push({ de: i, para: (i + 1) % rows.length, x: c, recuo_px: bm ? bm.dxb : null, obs: bm ? '' : 'pé sai do chão (ou troca de apoio)' }); } });
  const rec = steps.filter(s => s.recuo_px !== null).map(s => s.recuo_px);
  out.animacoes[`walk/${d}`].recuo_pe_apoio = { passos: steps, media_px_quadro: +(rec.reduce((a, b) => a + b, 0) / rec.length).toFixed(2), min: Math.min(...rec), max: Math.max(...rec), n: rec.length };
}
fs.writeFileSync(`${M}/qa_medicoes.json`, JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out.animacoes)) { console.log(`\n### ${k} — h ${v.h_min_max.join('–')}, w ${v.w_min_max.join('–')}, px ${v.px_min_max.join('–')}, maior salto h ${v.maior_salto_h} / w ${v.maior_salto_w}, cores ${v.cores_no_conjunto}, pé y=49 ${v.pe_y49_em}, olho ${v.olho_px} px, marcas ${v.marcas_px} px`);
  console.log('| q | bbox (x0,y0–x1,y1) | w×h | px | cabeça dx,dy | cabeça casa | rosto ≠ | olho | marcas | contato y=49 | muda até o próximo |\n|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of v.porQuadro) console.log(`| ${r.q} | ${r.bbox[0]},${r.bbox[1]}–${r.bbox[2]},${r.bbox[3]} | ${r.w}×${r.h} | ${r.px} | ${r.cabeca_dx},${r.cabeca_dy} | ${r.cabeca_casam} | ${r.rosto_px_diferentes ?? '—'} | ${r.olho_px} | ${r.marcas_px} | ${r.contato_y49.map(x => x.join('–')).join(' ; ')} | ${r.px_mudam_ate_proximo} |`);
  if (v.recuo_pe_apoio) { const p = v.recuo_pe_apoio; console.log(`recuo do pé de apoio: média ${p.media_px_quadro} px/quadro (mín ${p.min}, máx ${p.max}, n=${p.n})`); console.log(p.passos.map(s => `q${s.de}→q${s.para} x${s.x}: ${s.recuo_px === null ? 'sai' : s.recuo_px}`).join(' | ')); } }
