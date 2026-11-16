'use strict';
// node measure.js dir [ref.png] — bbox, âncora, cores, semitransparência, contato (runs nas 2 últimas linhas), cores fora da paleta de ref.
const L = require('./lib.js');
const [, , dir, ref] = process.argv;
let pal = null;
if (ref) pal = new Set(L.measure(L.readPNG(ref)).colors.keys());
const all = new Set();
for (const f of L.frames(dir)) {
  const img = L.readPNG(f), m = L.measure(img);
  for (const c of m.colors.keys()) all.add(c);
  const yb = m.bbox[3];
  const off = pal ? [...m.colors.keys()].filter(c => !pal.has(c)).length : '-';
  console.log(f.split('/').slice(-1)[0], `bbox x${m.bbox[0]}-${m.bbox[2]} y${m.bbox[1]}-${m.bbox[3]} w${m.w} h${m.h} n${m.n} cores${m.colors.size} fora${off} semi${m.semi}`,
    'y' + yb + ':' + JSON.stringify(L.runs(img, yb)), 'y' + (yb - 1) + ':' + JSON.stringify(L.runs(img, yb - 1)), 'y' + (yb - 2) + ':' + JSON.stringify(L.runs(img, yb - 2)));
}
console.log('cores no conjunto:', all.size, pal ? 'fora da ref: ' + [...all].filter(c => !pal.has(c)).length : '');
