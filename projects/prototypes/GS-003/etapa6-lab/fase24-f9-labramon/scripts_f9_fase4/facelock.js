'use strict';
// Trava do rosto: acha o deslocamento da cabeça em cada quadro (casamento com a rotação) e cola os pixels do rosto da rotação nesse deslocamento.
// node facelock.js <rot.png> <inDir> <outDir|-> <dir E|W|S|N>   ('-' = só mede)
const L = require('./lib.js'), G = require('./rig.js');
const [, , rotP, inDir, outDir, d] = process.argv;
const CFG = {
  E: { align: [36, 14, 49, 33], face: [35, 22, 49, 32] },
  W: { align: [10, 14, 23, 33], face: [10, 21, 24, 31] },
  S: { align: [22, 14, 37, 31], face: [22, 21, 37, 31] },
  N: null,
};
const RED = new Set(['#c63239', '#81231d']), MARK = new Set(['#b97191', '#dc9aa3']);
function count(img, set, box) { let n = 0; for (let y = box ? box[1] : 0; y <= (box ? box[3] : 59); y++) for (let x = box ? box[0] : 0; x <= (box ? box[2] : 59); x++) if (set.has(G.at(img, x, y))) n++; return n; }
const rot = L.readPNG(rotP), c = CFG[d];
const out = [];
if (c) console.log(`rotação ${d}: olho(vermelho) ${count(rot, RED)} px, marcas(rosa claro) ${count(rot, MARK)} px`);
for (const f of L.frames(inDir)) {
  const img = L.readPNG(f); const name = f.split('/').pop();
  if (!c) { if (outDir !== '-') L.save(`${outDir}/${name}`, img); continue; }
  let best = null;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    let diff = 0, n = 0;
    for (let y = c.align[1]; y <= c.align[3]; y++) for (let x = c.align[0]; x <= c.align[2]; x++) { n++; if (G.at(rot, x, y) !== G.at(img, x + dx, y + dy)) diff++; }
    const score = diff + 0.5 * (Math.abs(dx) + Math.abs(dy));
    if (!best || score < best.score) best = { dx, dy, diff, n, score };
  }
  let faceDiff = 0, faceN = 0;
  for (let y = c.face[1]; y <= c.face[3]; y++) for (let x = c.face[0]; x <= c.face[2]; x++) { if (!G.at(rot, x, y)) continue; faceN++; if (G.at(rot, x, y) !== G.at(img, x + best.dx, y + best.dy)) faceDiff++; }
  const before = { red: count(img, RED), mark: count(img, MARK) };
  if (outDir !== '-') {
    for (let y = c.face[1]; y <= c.face[3]; y++) for (let x = c.face[0]; x <= c.face[2]; x++) { const h = G.at(rot, x, y); if (h) G.set(img, x + best.dx, y + best.dy, h); }
    L.save(`${outDir}/${name}`, img);
  }
  const after = { red: count(img, RED), mark: count(img, MARK) };
  out.push({ name, dx: best.dx, dy: best.dy, alignDiff: best.diff, alignN: best.n, faceDiff, faceN, before, after });
  console.log(name, `cabeça dx${best.dx} dy${best.dy} casam ${best.n - best.diff}/${best.n}; rosto difere ${faceDiff}/${faceN}; olho ${before.red}->${after.red} marcas ${before.mark}->${after.mark}`);
}
if (outDir !== '-' && c) require('fs').writeFileSync(`${outDir}/_facelock.json`, JSON.stringify(out, null, 1));
