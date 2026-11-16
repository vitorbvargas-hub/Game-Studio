'use strict';
// F9 — correções de arte pós-QA (0 gerações), aplicadas sobre a saída do post58.js.
// node fix_f9.js <inDir> <outDir>   (cwd = pasta de trabalho f58, com rot_E.png; ex.: node fix_f9.js fin_pre_correcao fin)
// A3: apaga o tufo vinho (orelha oposta) no alto/atrás da cabeça.
// A4: trava o topo do capuz nos picos de ação (sem tocar a boca/focinho) e limpa a mancha cinza sobre o olho no incapacitado.
// A8: realinha em pé→deitar (deslocamento horizontal em rampa até a pose deitada).
// A2: quadros intermediários de entrada (irritado, comemoração) — ver intermed_f9.js.
// Ao fim: falhas de contorno, medições, _log.json (mesmo formato do post58 + campo "correcoes").
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs'), path = require('path');
const [, , IN, OUT] = process.argv;
const rot = L.readPNG('rot_E.png');
const PAL = new Set(L.measure(rot).colors.keys());
const RED = new Set(['#c63239', '#81231d']), MARK = new Set(['#b97191', '#dc9aa3']);
const TUFT = new Set(['#7a2044', '#4b192d', '#250d20', '#ac2d64', '#d94182']);
const count = (img, set) => { let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) if (set.has(G.at(img, x, y))) n++; return n; };
const nonDark = h => h && !G.isDark(h);

// ---------- A3 ----------
// box = [x0,y0,x1,y1]. Pixels TUFT dentro da caixa saem; o que ficou encostado (4-viz.) em pixel claro da cabeça vira contorno;
// escuros da caixa que não encostam (8-viz.) em nenhum pixel claro saem (restos do contorno do tufo).
function removeTuft(img, box) {
  const [x0, y0, x1, y1] = box; let removed = 0, outlined = 0, darkRemoved = 0;
  const tuft = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (TUFT.has(G.at(img, x, y))) tuft.push([x, y]);
  const isTuft = new Set(tuft.map(([x, y]) => y * 60 + x));
  const light = (x, y) => { const h = G.at(img, x, y); return nonDark(h) && !isTuft.has(y * 60 + x); };
  const toDark = [];
  for (const [x, y] of tuft) { if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => light(x + dx, y + dy))) toDark.push([x, y]); }
  for (const [x, y] of tuft) { G.set(img, x, y, null); removed++; }
  for (const [x, y] of toDark) { G.set(img, x, y, G.DARK); outlined++; }
  if (removed) for (let pass = 0; pass < 3; pass++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const h = G.at(img, x, y); if (!h || !G.isDark(h)) continue; let keep = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && nonDark(G.at(img, x + dx, y + dy))) keep = true;
    if (!keep) { G.set(img, x, y, null); darkRemoved++; }
  }
  return { box, tuft_px: removed, viraram_contorno: outlined, escuros_removidos: darkRemoved - 0 };
}
// restos: componentes opacos pequenos (<=4 px, 8-conexos) soltos do corpo
function dropSpecks(img) {
  const seen = new Set(), comps = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { if (!G.at(img, x, y) || seen.has(y * 60 + x)) continue; const c = [], st = [[x, y]]; seen.add(y * 60 + x);
    while (st.length) { const [cx, cy] = st.pop(); c.push([cx, cy]); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (G.at(img, nx, ny) && !seen.has(ny * 60 + nx)) { seen.add(ny * 60 + nx); st.push([nx, ny]); } } } comps.push(c); }
  comps.sort((a, b) => b.length - a.length); let n = 0; for (const c of comps.slice(1)) if (c.length <= 4) { for (const [x, y] of c) G.set(img, x, y, null); n += c.length; } return n;
}
const KO_TOP = 'top'; // vinho no contorno do alto da cabeça: caixa = 3 linhas a partir do topo da cabeça (x 30–55)
const topBox = img => { for (let y = 0; y < 60; y++) for (let x = 30; x <= 55; x++) if (G.at(img, x, y)) return [30, y, 55, y + 2]; return null; };
const A3 = {
  'f8-attack-bark': { 4: [[29, 8, 38, 15], [39, 8, 44, 13]], 5: [[32, 9, 44, 13]] },
  'f8-hurt': { 0: [[38, 17, 45, 24], [29, 12, 36, 13]], 1: [[37, 15, 42, 20], [26, 10, 36, 12]], 2: [[39, 18, 42, 22], [29, 13, 36, 14]] },
  'f8-ko-fall': { 4: [KO_TOP], 5: [KO_TOP], 6: [KO_TOP], 7: [KO_TOP] },
  'f8-ko-loop': { 0: [KO_TOP], 1: [KO_TOP], 2: [KO_TOP], 3: [KO_TOP] },
  'f8-ko-recover': { 0: [KO_TOP], 1: [KO_TOP], 2: [KO_TOP], 3: [KO_TOP], 4: [KO_TOP], 5: [KO_TOP], 6: [KO_TOP], 7: [KO_TOP] },
};
const extraFixes = {}; // preenchido pelos módulos abaixo (A4, A8) — registrados no log
let A4 = {}; try { A4 = require('./a4_f9.js'); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }

function gapfix(img) { let n = 0; const todo = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (!h || G.isDark(h)) continue; if (!G.at(img, x + 1, y) || !G.at(img, x - 1, y) || !G.at(img, x, y + 1) || !G.at(img, x, y - 1)) todo.push([x, y]); }
  for (const [x, y] of todo) { G.set(img, x, y, G.DARK); n++; } return n; }
function facelockMeasure(img) { // igual ao post58 (só mede)
  const ALIGN = [36, 14, 49, 33], FACE = [35, 22, 49, 32]; let best = null;
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { let diff = 0; for (let y = ALIGN[1]; y <= ALIGN[3]; y++) for (let x = ALIGN[0]; x <= ALIGN[2]; x++) if (G.at(rot, x, y) !== G.at(img, x + dx, y + dy)) diff++; const score = diff + 0.5 * (Math.abs(dx) + Math.abs(dy)); if (!best || score < best.score) best = { dx, dy, diff, score }; }
  let faceDiff = 0, faceN = 0; for (let y = FACE[1]; y <= FACE[3]; y++) for (let x = FACE[0]; x <= FACE[2]; x++) { if (!G.at(rot, x, y)) continue; faceN++; if (G.at(rot, x, y) !== G.at(img, x + best.dx, y + best.dy)) faceDiff++; }
  return { dx: best.dx, dy: best.dy, alignDiff: best.diff, faceDiff, faceN };
}
// A8: deslocamento horizontal por quadro (rampa) — entra alinhado ao idle, termina na pose deitada original
const SHIFT_X = { 'f6-stand-to-lie': [2, 2, 2, 1, 0, 0, 0, 0] }; // rampa escolhida por busca (0–2 px por quadro): menor soma das costuras idle→q0→…→deitado nos quadros do clipe

const inLog = JSON.parse(fs.readFileSync(path.join(IN, '_log.json')));
const log = {};
for (const name of fs.readdirSync(IN).filter(d => !d.startsWith('_')).sort()) {
  log[name] = [];
  L.frames(path.join(IN, name)).forEach((f, i) => {
    let img = L.readPNG(f); const prev = inLog[name][i]; const e = Object.assign({}, prev); const cor = {};
    const before = L.readPNG(f);
    if (A3[name] && A3[name][i]) { cor.A3 = A3[name][i].map(b => removeTuft(img, b === 'top' ? topBox(img) : b)); cor.A3_soltos = dropSpecks(img); }
    if (A4[name] && A4[name][i]) cor.A4 = A4.apply(img, rot, A4[name][i]);
    if (SHIFT_X[name] && SHIFT_X[name][i]) { img = L.shift(img, SHIFT_X[name][i], 0); cor.A8_dx = SHIFT_X[name][i]; }
    if (Object.keys(cor).length) cor.contorno_fechado_px = gapfix(img);
    const m = L.measure(img);
    e.face_pos = facelockMeasure(img);
    e.bbox = m.bbox; e.w = m.w; e.h = m.h; e.footY = m.bbox[3]; e.colors = m.colors.size; e.semi = m.semi;
    e.offPalette = [...m.colors.keys()].filter(c => !PAL.has(c)).length; e.eyePx = count(img, RED); e.markPx = count(img, MARK);
    e.vsRotationPx = (() => { let n = 0; for (let k = 0; k < 14400; k += 4) { const a = img.data[k + 3], b = rot.data[k + 3]; if (a !== b || (a && (img.data[k] !== rot.data[k] || img.data[k + 1] !== rot.data[k + 1] || img.data[k + 2] !== rot.data[k + 2]))) n++; } return n; })();
    if (Object.keys(cor).length) { let d = 0; for (let k = 0; k < 14400; k += 4) { const a = img.data[k + 3], b = before.data[k + 3]; if (a !== b || (a && (img.data[k] !== before.data[k] || img.data[k + 1] !== before.data[k + 1] || img.data[k + 2] !== before.data[k + 2]))) d++; } cor.px_alterados = d; e.correcoes = cor; }
    L.save(path.join(OUT, name, `frame_${String(i).padStart(3, '0')}.png`), img); log[name].push(e);
  });
  const c = log[name].filter(e => e.correcoes);
  if (c.length) console.log(name.padEnd(18), c.map(e => `q${e.frame}:${e.correcoes.px_alterados}px/h${e.h}/y${e.footY}/o${e.offPalette}/s${e.semi}/c${e.colors}`).join(' '));
}
// A2 — quadros intermediários de entrada, gravados como frame_008 da animação-base (o build monta a entrada com eles)
const EXTRA = {
  'f5-angry': { tipo: 'intermediario_local', doc: 'pose do irritado q0 com a cauda do idle E q0 (a cauda atrasa 1 quadro; intermed_f9.js modo cauda; idle_E_q0.png = movement/idle/E/frame_000.png)', make: () => { const r = require('child_process').execFileSync('node', [path.join(__dirname, 'intermed_f9.js'), 'cauda', 'idle_E_q0.png', path.join(OUT, 'f5-angry', 'frame_000.png'), path.join(OUT, 'f5-angry', 'frame_008.png')]).toString(); const md = JSON.parse(r); delete md.idle; delete md.alvo; EXTRA['f5-angry'].medida = md; return L.readPNG(path.join(OUT, 'f5-angry', 'frame_008.png')); } },
  'f7-celebrate': { tipo: 'intermediario_local', doc: 'pose da comemoração q0 com as patas esticadas 2 px (intermed_f9.js modo patas, linhas 36–46): o corpo desce em 2 passos. A geração f9c-celebrate-entry (q2) foi testada e não usada: idle→q2 613 px, q2→q0 797 px (> 753 do salto original)', make: () => { const r = require('child_process').execFileSync('node', [path.join(__dirname, 'intermed_f9.js'), 'patas', path.join(OUT, 'f7-celebrate', 'frame_000.png'), path.join(OUT, 'f7-celebrate', 'frame_008.png'), '2', '36', '46']).toString(); const md = JSON.parse(r); delete md.alvo; EXTRA['f7-celebrate'].medida = md; return L.readPNG(path.join(OUT, 'f7-celebrate', 'frame_008.png')); } },
};
for (const [name, X] of Object.entries(EXTRA)) {
  const img = X.make(); const cor = { A2: X.tipo, doc: X.doc, medida: X.medida || null, soltos: dropSpecks(img), contorno_fechado_px: gapfix(img) };
  const m = L.measure(img); const e = { frame: 8, extra_f9c: true, correcoes: cor, face_pos: facelockMeasure(img), bbox: m.bbox, w: m.w, h: m.h, footY: m.bbox[3], colors: m.colors.size, semi: m.semi,
    offPalette: [...m.colors.keys()].filter(c => !PAL.has(c)).length, eyePx: count(img, RED), markPx: count(img, MARK), face: { locked: false }, gaps: cor.contorno_fechado_px };
  e.vsRotationPx = (() => { let n = 0; for (let k = 0; k < 14400; k += 4) { const a = img.data[k + 3], b = rot.data[k + 3]; if (a !== b || (a && (img.data[k] !== rot.data[k] || img.data[k + 1] !== rot.data[k + 1] || img.data[k + 2] !== rot.data[k + 2]))) n++; } return n; })();
  L.save(path.join(OUT, name, 'frame_008.png'), img); log[name].push(e);
  console.log(name.padEnd(18), `q8 (A2 ${X.tipo}): h${e.h}/y${e.footY}/o${e.offPalette}/s${e.semi}/c${e.colors}/bbox${e.bbox}`);
}
fs.writeFileSync(path.join(OUT, '_log.json'), JSON.stringify(log, null, 1));
