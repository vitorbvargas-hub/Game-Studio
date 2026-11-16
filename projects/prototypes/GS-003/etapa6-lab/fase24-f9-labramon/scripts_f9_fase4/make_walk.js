'use strict';
// Walk 8 quadros montado localmente (0 gerações) a partir dos pixels da rotação.
// Corpo/cabeça = rotação intacta (só desce 1 px nos quadros de apoio duplo); patas recortadas e articuladas; cauda/orelhas com atraso de 1 quadro.
// node make_walk.js <rotacoes> <out> [dirs]
const L = require('./lib.js'), G = require('./rig.js');
const R = process.argv[2], OUT = process.argv[3], DIRS = (process.argv[4] || 'E,W,S,N').split(',');

// Ciclo de perfil (E/W): 4 quadros de apoio (pé recua 2 px/quadro) + 4 de balanço (pé no ar voltando à frente)
const SIDE = { dx: [3, 1, -1, -3, -2, 0, 2, 3], lift: [0, 0, 0, 0, 1, 2, 2, 1] };
// Ciclo de frente/costas (S/N): pé plantado 5 quadros, levantado 3
const FRONT = { lift: [0, 0, 0, 0, 0, 2, 3, 1] };
const BOB = [1, 0, 0, 0, 1, 0, 0, 0];           // corpo desce 1 px no apoio duplo
const LAG = [0, 1, 0, 0, 0, 1, 0, 0];           // peça secundária repete o corpo 1 quadro depois

const cfg = {
  E: { type: 'side', sign: +1, cut: 41, parts: c => c.maxX <= 26,
    legs: [ { n: 'FB', x: [24, 27], y: [42, 46], ph: 4, far: 1 }, { n: 'FF', x: [36, 41], y: [42, 46], ph: 0, far: 1 },
            { n: 'NB', x: [19, 23], y: [42, 47], ph: 0 }, { n: 'NF', x: [31, 35], y: [42, 48], ph: 4 } ] },
  W: { type: 'side', sign: -1, cut: 41, parts: c => c.minX >= 33,
    legs: [ { n: 'FB', x: [31, 35], y: [42, 46], ph: 4, far: 1 }, { n: 'FF', x: [18, 23], y: [42, 46], ph: 0, far: 1 },
            { n: 'NB', x: [36, 40], y: [42, 47], ph: 0 }, { n: 'NF', x: [24, 27], y: [42, 48], ph: 4 } ] },
  S: { type: 'front', cut: 40, parts: c => c.n > 20, underlay: [[29, 41, 31, 47]],
    legs: [ { n: 'L', x: [22, 29], y: [41, 47], ph: 0 }, { n: 'R', x: [31, 37], y: [41, 47], ph: 4 } ] },
  N: { type: 'front', cut: 43, parts: c => c.n > 20 && (c.maxX <= 25 || c.minX >= 35), underlay: [[28, 44, 31, 47]],
    legs: [ { n: 'L', x: [21, 27], y: [44, 48], ph: 0 }, { n: 'R', x: [32, 38], y: [44, 48], ph: 4 } ] },
};

// recorta a pata: pixels não escuros do retângulo + escuros internos (4 vizinhos opacos); sola escura sintetizada se preciso
function cutLeg(rot, leg, soleRow) {
  const pix = []; // {x,y,h}
  const [x0, x1] = leg.x, [y0, y1] = leg.y;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const h = G.at(rot, x, y); if (!h) continue;
    if (G.isDark(h)) { if (!(G.at(rot, x - 1, y) && G.at(rot, x + 1, y) && G.at(rot, x, y - 1) && G.at(rot, x, y + 1))) continue; }
    pix.push({ x, y, h });
  }
  let bottom = Math.max(...pix.map(p => p.y));
  const top = y0;
  if (bottom < soleRow) { // sola: linha escura sob a última linha de preenchimento
    const xs = pix.filter(p => p.y === bottom).map(p => p.x);
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) pix.push({ x, y: bottom + 1, h: '#24241e', sole: 1 });
    bottom++;
  }
  return { pix, top, bottom };
}
function drawLeg(img, sp, dxFoot, lift) {
  const span = Math.max(1, sp.bottom - sp.top);
  const moved = sp.pix.map(p => ({ x: p.x + Math.round(dxFoot * (p.y - sp.top) / span), y: p.y - lift, h: p.h }));
  const fill = new Set(moved.map(p => G.key(p.x, p.y)));
  // cisalhamento pode abrir furos horizontais dentro da pata: fecha com a cor do vizinho da esquerda
  for (const p of moved.slice()) { if (!fill.has(G.key(p.x + 1, p.y)) && fill.has(G.key(p.x + 2, p.y))) { moved.push({ x: p.x + 1, y: p.y, h: p.h }); fill.add(G.key(p.x + 1, p.y)); } }
  for (const p of moved) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!fill.has(G.key(p.x + ax, p.y + ay))) G.set(img, p.x + ax, p.y + ay, G.DARK);
  for (const p of moved) G.set(img, p.x, p.y, p.h);
  return moved;
}

const report = {};
for (const d of DIRS) {
  const c = cfg[d], rot = L.readPNG(`${R}/labramon_${d}.png`);
  // peça secundária
  let mask = new Set(), box = [59, 59, 0, 0];
  for (const cp of G.pinkComponents(rot).filter(c.parts)) { for (const k of G.partMask(rot, cp)) mask.add(k); box = [Math.min(box[0], cp.minX - 2), Math.min(box[1], cp.minY - 2), Math.max(box[2], cp.maxX + 2), Math.max(box[3], cp.maxY + 3)]; }
  const [part, rest] = G.split(rot, mask);
  // corpo = tudo até a linha de corte
  const body = L.crop(rest, 0, 0, 60, 60); for (let y = c.cut + 1; y < 60; y++) for (let x = 0; x < 60; x++) G.set(body, x, y, null);
  const partTop = L.crop(part, 0, 0, 60, 60); for (let y = c.cut + 1; y < 60; y++) for (let x = 0; x < 60; x++) G.set(partTop, x, y, null);
  const legs = c.legs.map(l => ({ ...l, sp: cutLeg(rot, l, l.far ? 47 : 48) }));
  report[d] = [];
  for (let f = 0; f < 8; f++) {
    const img = L.canvas(60, 60);
    for (const u of (c.underlay || [])) for (let y = u[1]; y <= u[3]; y++) for (let x = u[0]; x <= u[2]; x++) { const h = G.at(rot, x, y); if (h && G.isDark(h)) G.set(img, x, y, h); }
    const fr = {};
    const order = legs.filter(l => l.far).concat(legs.filter(l => !l.far));
    // em S/N a pata levantada fica atrás da plantada
    if (c.type === 'front') order.sort((a, b) => FRONT.lift[(f + b.ph) % 8] - FRONT.lift[(f + a.ph) % 8]);
    for (const l of order) {
      const i = (f + l.ph) % 8;
      const dx = c.type === 'side' ? c.sign * SIDE.dx[i] : 0, lift = c.type === 'side' ? SIDE.lift[i] : FRONT.lift[i];
      const moved = drawLeg(img, l.sp, dx, lift);
      const by = Math.max(...moved.map(p => p.y)); const xs = moved.filter(p => p.y === by).map(p => p.x);
      fr[l.n] = { dx, lift, footX: (Math.min(...xs) + Math.max(...xs)) / 2, footY: by + 1, apoio: lift === 0 };
    }
    G.over(img, L.shift(partTop, 0, LAG[f]));
    G.over(img, L.shift(body, 0, BOB[f]));
    G.fillHoles(img, box);
    L.save(`${OUT}/walk/${d}/frame_00${f}.png`, img);
    report[d].push(fr);
  }
}
require('fs').writeFileSync(`${OUT}/walk_rig_report.json`, JSON.stringify({ SIDE, FRONT, BOB, LAG, report }, null, 1));
console.log('ok', DIRS.join(','));
