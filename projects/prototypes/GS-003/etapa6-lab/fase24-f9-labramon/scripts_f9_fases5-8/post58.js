'use strict';
// F9 Fases 5–8 — passo 2 do pós-processo (0 gerações): correções pontuais, trava de rosto, falhas de contorno, verificação.
// node post58.js  (lê pre/<anim>, grava fin/<anim>, log em fin/_log.json)
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs');
const rot = L.readPNG('rot_E.png');
const PAL = new Set(L.measure(rot).colors.keys());
const ALIGN = [36, 14, 49, 33], FACE = [35, 22, 49, 32], LOCK_T = 27;
const RED = new Set(['#c63239', '#81231d']), MARK = new Set(['#b97191', '#dc9aa3']);
const PINK = new Set(['#d94182', '#ac2d64', '#7a2044']);
const NOLOCK = new Set(['f6-stand-to-lie', 'f6-lie-to-sleep', 'f6-sleep-loop', 'f6-sleep-to-wake', 'f8-ko-loop']);
const count = (img, set) => { let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (set.has(G.at(img, x, y))) n++; return n; };

function removeChinDangle(img) { // orelha do lado oposto pendurada sob o queixo (lê como língua): remove
  const DSET = new Set([...PINK, '#4b192d', '#250d20']);
  const seen = new Set(); let removed = 0;
  for (let y = 33; y < 60; y++) for (let x = 40; x < 60; x++) {
    if (seen.has(y * 60 + x) || !DSET.has(G.at(img, x, y))) continue;
    const c = [], st = [[x, y]]; seen.add(y * 60 + x);
    while (st.length) { const [cx, cy] = st.pop(); c.push([cx, cy]); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (!seen.has(ny * 60 + nx) && DSET.has(G.at(img, nx, ny))) { seen.add(ny * 60 + nx); st.push([nx, ny]); } } }
    const minX = Math.min(...c.map(p => p[0])), minY = Math.min(...c.map(p => p[1])), maxX = Math.max(...c.map(p => p[0])), maxY = Math.max(...c.map(p => p[1]));
    if (minX < 40 || minY < 33) continue;
    for (const [px, py] of c) { G.set(img, px, py, null); removed++; }
    for (let pass = 0; pass < 4; pass++) for (let yy = minY - 2; yy <= maxY + 2; yy++) for (let xx = minX - 3; xx <= maxX + 3; xx++) {
      const h = G.at(img, xx, yy); if (!h || !G.isDark(h)) continue; let keep = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const n = G.at(img, xx + dx, yy + dy); if (n && !G.isDark(n)) keep = true; }
      if (!keep) { G.set(img, xx, yy, null); removed++; }
    }
  }
  return removed;
}
function removeHeadBlob(img) { // "mão" desenhada como bolinha no topo da cabeça: troca o topo do capuz pelo da rotação, no deslocamento medido da cabeça
  const f = facelock(img, false); let changed = 0; const Y1 = 20, X0 = 28, X1 = 52;
  for (let y = 0; y <= Y1 + f.dy; y++) for (let x = X0 + f.dx; x <= X1 + f.dx; x++) { const want = (y - f.dy >= 0) ? G.at(rot, x - f.dx, y - f.dy) : null; if (G.at(img, x, y) !== want) { G.set(img, x, y, want); changed++; } }
  return changed;
}
function facelock(img, apply) {
  let best = null;
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { let diff = 0; for (let y = ALIGN[1]; y <= ALIGN[3]; y++) for (let x = ALIGN[0]; x <= ALIGN[2]; x++) if (G.at(rot, x, y) !== G.at(img, x + dx, y + dy)) diff++; const score = diff + 0.5 * (Math.abs(dx) + Math.abs(dy)); if (!best || score < best.score) best = { dx, dy, diff, score }; }
  let faceDiff = 0, faceN = 0;
  for (let y = FACE[1]; y <= FACE[3]; y++) for (let x = FACE[0]; x <= FACE[2]; x++) { if (!G.at(rot, x, y)) continue; faceN++; if (G.at(rot, x, y) !== G.at(img, x + best.dx, y + best.dy)) faceDiff++; }
  const locked = apply && faceDiff <= LOCK_T;
  if (locked) for (let y = FACE[1]; y <= FACE[3]; y++) for (let x = FACE[0]; x <= FACE[2]; x++) { const h = G.at(rot, x, y); if (h) G.set(img, x + best.dx, y + best.dy, h); }
  return { dx: best.dx, dy: best.dy, alignDiff: best.diff, faceDiff, faceN, locked };
}
function gapfix(img) { let n = 0; const todo = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (!h || G.isDark(h)) continue; if (!G.at(img, x + 1, y) || !G.at(img, x - 1, y) || !G.at(img, x, y + 1) || !G.at(img, x, y - 1)) todo.push([x, y]); }
  for (const [x, y] of todo) { G.set(img, x, y, G.DARK); n++; } return n; }

const log = {};
for (const name of fs.readdirSync('pre').filter(d => !d.startsWith('_')).sort()) {
  log[name] = [];
  L.frames('pre/' + name).forEach((f, i) => {
    const img = L.readPNG(f); const e = { frame: i };
    if ((name === 'f5-sad' || name === 'f7-petting') && i < 7) e.chinDanglePx = removeChinDangle(img);
    if (name === 'f7-petting' && i < 7) e.headBlobPx = removeHeadBlob(img);
    e.face = facelock(img, !NOLOCK.has(name));
    e.gaps = gapfix(img);
    const m = L.measure(img);
    e.bbox = m.bbox; e.w = m.w; e.h = m.h; e.footY = m.bbox[3]; e.colors = m.colors.size; e.semi = m.semi;
    e.offPalette = [...m.colors.keys()].filter(c => !PAL.has(c)).length; e.eyePx = count(img, RED); e.markPx = count(img, MARK);
    e.vsRotationPx = (() => { let n = 0; for (let k = 0; k < 14400; k += 4) { const a = img.data[k + 3], b = rot.data[k + 3]; if (a !== b || (a && (img.data[k] !== rot.data[k] || img.data[k + 1] !== rot.data[k + 1] || img.data[k + 2] !== rot.data[k + 2]))) n++; } return n; })();
    L.save(`fin/${name}/frame_${String(i).padStart(3, '0')}.png`, img); log[name].push(e);
  });
  console.log(name.padEnd(18), log[name].map(e => `q${e.frame}:h${e.h}/y${e.footY}/c${e.colors}/o${e.offPalette}/g${e.gaps}${e.face.locked ? '/L' : ''}${e.chinDanglePx ? '/chin' + e.chinDanglePx : ''}${e.headBlobPx ? '/blob' + e.headBlobPx : ''}/olho${e.eyePx}/rot${e.vsRotationPx}`).join(' '));
}
fs.writeFileSync('fin/_log.json', JSON.stringify(log, null, 1));
