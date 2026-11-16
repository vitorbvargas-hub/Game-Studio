'use strict';
// Idle 4 quadros montado localmente: corpo desce 1 px (remove 1 linha das patas) em q1-q2; peça secundária (cauda/orelhas) atrasa 1 quadro.
const L = require('./lib.js'), G = require('./rig.js');
const R = process.argv[2], OUT = process.argv[3];
const cfg = {
  E: { rowDel: 43, parts: c => c.maxX <= 26 },             // cauda
  W: { rowDel: 42, parts: c => c.minX >= 33 },             // cauda
  S: { rowDel: 42, parts: c => c.n > 20 },                 // duas orelhas
  N: { rowDel: 45, parts: c => c.n > 20 && (c.maxX <= 25 || c.minX >= 35) }, // orelhas (cauda fica no corpo)
};
const bodyDy = [0, 1, 1, 0], lagDy = [0, 0, 1, 1];
for (const d of Object.keys(cfg)) {
  const rot = L.readPNG(`${R}/labramon_${d}.png`);
  const comps = G.pinkComponents(rot);
  console.log(d, comps.map(c => `n${c.n} x${c.minX}-${c.maxX} y${c.minY}-${c.maxY}` + (cfg[d].parts(c) ? '*' : '')).join(' | '));
  let mask = new Set(); let box = [59, 59, 0, 0];
  for (const c of comps.filter(cfg[d].parts)) { for (const k of G.partMask(rot, c)) mask.add(k); box = [Math.min(box[0], c.minX - 2), Math.min(box[1], c.minY - 2), Math.max(box[2], c.maxX + 2), Math.max(box[3], c.maxY + 3)]; }
  const [part, rest] = G.split(rot, mask);
  for (let f = 0; f < 4; f++) {
    let img;
    if (bodyDy[f] === 0 && lagDy[f] === 0) img = G.clone(rot);
    else {
      const body = bodyDy[f] ? G.squash(rest, cfg[d].rowDel) : rest;
      img = G.over(L.shift(part, 0, lagDy[f]), body);
      const n = G.fillHoles(img, box); if (n) console.log(`  ${d} q${f}: ${n} furos fechados`);
    }
    L.save(`${OUT}/idle/${d}/frame_00${f}.png`, img);
  }
}
