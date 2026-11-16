// Recuo do pé de apoio (método próprio): para cada par de quadros consecutivos, o deslocamento dx (-8..+8) que
// maximiza a sobreposição dos pixels de contato (y 48-49), restrito a segmentos que existem nos dois quadros.
import fs from 'node:fs'; import { readPNG } from './png.mjs';
const out = {};
for (const d of ['E', 'W', 'S', 'N']) {
  const fr = [0,1,2,3,4,5,6,7].map(i => readPNG(`movement/walk/${d}/frame_00${i}.png`).data);
  const mask = a => { const s = []; for (let y = 48; y <= 49; y++) for (let x = 0; x < 60; x++) if (a[(y*60+x)*4+3]) s.push([x,y]); return s; };
  const res = [];
  for (let i = 0; i < 8; i++) { const A = mask(fr[i]), B = new Set(mask(fr[(i+1)%8]).map(([x,y]) => x+','+y));
    let best = { dx: 0, ov: -1 }; for (let dx = -8; dx <= 8; dx++) { let ov = 0; for (const [x,y] of A) if (B.has((x+dx)+','+y)) ov++; if (ov > best.ov || (ov === best.ov && Math.abs(dx) < Math.abs(best.dx))) best = { dx, ov }; }
    res.push({ par: `${i}->${(i+1)%8}`, dx: best.dx, sobreposicao: best.ov, contato: A.length }); }
  out[d] = { pares: res, media_abs_dx: +(res.reduce((s,r)=>s+Math.abs(r.dx),0)/8).toFixed(2), dx: res.map(r=>r.dx).join(',') };
  console.log(d, out[d].dx, 'média |dx|', out[d].media_abs_dx);
}
fs.writeFileSync('qa_f9/pe_apoio_walk.json', JSON.stringify(out, null, 1));
