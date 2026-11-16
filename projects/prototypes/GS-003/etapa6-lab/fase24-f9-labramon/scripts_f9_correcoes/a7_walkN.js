'use strict';
// A7 — walk N: o corpo fica 2 px acima do standing porque as patas do walk são 2 px mais longas.
// Desce o corpo 2 px tirando 2 linhas da zona das patas, AS MESMAS em todos os quadros (sem tremer orelha/corpo entre quadros):
// y=44 e depois y=47 — o par com menor diferença somada entre a linha e a de cima nos 8 quadros (86 px; busca em y 40–47).
// A pata de apoio continua em y=49. node a7_walkN.js <dir walk/N>  (grava no lugar; log JSON no stdout)
const L = require('./lib.js'), G = require('./rig.js');
const [, , DIR] = process.argv; const ROWS = [44, 47];
const rowDiff = (img, y) => { let d = 0; for (let x = 0; x < 60; x++) if (G.at(img, x, y) !== G.at(img, x, y - 1)) d++; return d; };
const out = [];
for (const f of L.frames(DIR)) {
  let img = L.readPNG(f); const rows = [];
  for (const y of ROWS) { rows.push({ y, d: rowDiff(img, y) }); img = G.squash(img, y); }
  const m = L.measure(img); L.save(f, img);
  out.push({ quadro: f.split('/').pop(), linhas_removidas: rows.map(r => r.y), dif_linha: rows.map(r => r.d), bbox: m.bbox, h: m.h });
}
console.log(JSON.stringify(out));
