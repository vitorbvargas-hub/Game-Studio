// QA F9: costuras entre clipes (com e sem alinhamento), folhas ampliadas e GIFs próprios. Só leitura das entregas.
// Uso: node qa_f9/scripts/visual.mjs  (cwd = fase24-f9-labramon)
import fs from 'node:fs';
import { readPNG, writePNG } from './png.mjs';

const OUT = 'qa_f9';
fs.mkdirSync(OUT + '/folhas', { recursive: true }); fs.mkdirSync(OUT + '/gifs', { recursive: true });
const L = p => readPNG(p).data;
const frames = dir => fs.readdirSync(dir).filter(f => /^frame_\d+\.png$/.test(f)).sort().map(f => dir + '/' + f);

function diff(a, b, dx = 0, dy = 0) { // b deslocado por (dx,dy)
  let n = 0;
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
    const ia = (y * 60 + x) * 4; const xb = x - dx, yb = y - dy;
    const inb = xb >= 0 && xb < 60 && yb >= 0 && yb < 60; const ib = (yb * 60 + xb) * 4;
    const ao = a[ia + 3] > 0, bo = inb && b[ib + 3] > 0;
    if (ao !== bo || (ao && (a[ia] !== b[ib] || a[ia + 1] !== b[ib + 1] || a[ia + 2] !== b[ib + 2]))) n++;
  }
  return n;
}
function best(a, b) { let m = { n: 1e9 }; for (let dx = -4; dx <= 4; dx++) for (let dy = -3; dy <= 3; dy++) { const n = diff(a, b, dx, dy); if (n < m.n) m = { n, dx, dy }; } return m; }

const R = d => `rotacoes/labramon_${d}.png`;
const I = (d, i) => `movement/idle/${d}/frame_00${i}.png`;
const last = dir => frames(dir).at(-1), first = dir => frames(dir)[0];
const pairs = [
  ['standing E → walk E q0', R('E'), first('movement/walk/E')], ['walk E q7 → standing E', last('movement/walk/E'), R('E')],
  ['standing N → walk N q0', R('N'), first('movement/walk/N')], ['standing S → walk S q0', R('S'), first('movement/walk/S')], ['standing W → walk W q0', R('W'), first('movement/walk/W')],
  ['idle E q0 → feliz entrada q0', I('E', 0), first('emotions/happy/entrada')], ['feliz saída último → idle E q0', last('emotions/happy/saida'), I('E', 0)],
  ['idle E q0 → triste entrada q0', I('E', 0), first('emotions/sad/entrada')], ['triste saída último → idle E', last('emotions/sad/saida'), I('E', 0)],
  ['idle E q0 → irritado entrada q0', I('E', 0), first('emotions/angry/entrada')], ['irritado entrada → loop q0', first('emotions/angry/entrada'), first('emotions/angry/loop')], ['irritado saída último → idle E', last('emotions/angry/saida'), I('E', 0)],
  ['idle E q0 → assustado entrada q0', I('E', 0), first('emotions/scared/entrada')], ['assustado saída último → idle E', last('emotions/scared/saida'), I('E', 0)],
  ['feliz entrada último → loop q0', last('emotions/happy/entrada'), first('emotions/happy/loop')], ['feliz loop último → saída q0', last('emotions/happy/loop'), first('emotions/happy/saida')],
  ['triste entrada último → loop q0', last('emotions/sad/entrada'), first('emotions/sad/loop')], ['triste loop último → saída q0', last('emotions/sad/loop'), first('emotions/sad/saida')],
  ['irritado loop último → saída q0', last('emotions/angry/loop'), first('emotions/angry/saida')],
  ['assustado entrada último → loop q0', last('emotions/scared/entrada'), first('emotions/scared/loop')], ['assustado loop último → saída q0', last('emotions/scared/loop'), first('emotions/scared/saida')],
  ['idle E q0 → em pé→deitado q0', I('E', 0), first('rest/rest/stand_to_lie')], ['deitado último → adormecer q0', last('rest/rest/stand_to_lie'), first('rest/rest/lie_to_sleep')],
  ['adormecer último → loop sono q0', last('rest/rest/lie_to_sleep'), first('rest/rest/sleep_loop')], ['loop sono último → acordar q0', last('rest/rest/sleep_loop'), first('rest/rest/sleep_to_wake')],
  ['acordar último → levantar q0', last('rest/rest/sleep_to_wake'), first('rest/rest/wake_to_stand')], ['levantar último → idle E q0', last('rest/rest/wake_to_stand'), I('E', 0)],
  ['idle E q0 → carinho entrada q0', I('E', 0), first('interactions/petting/entrada')], ['carinho entrada último → loop q0', last('interactions/petting/entrada'), first('interactions/petting/loop')],
  ['carinho loop último → saída q0', last('interactions/petting/loop'), first('interactions/petting/saida')], ['carinho saída último → idle E', last('interactions/petting/saida'), I('E', 0)],
  ['idle E q0 → comemoração q0', I('E', 0), first('interactions/celebrate/frames')], ['comemoração último → idle E', last('interactions/celebrate/frames'), I('E', 0)],
  ['idle E q0 → ataque q0', I('E', 0), first('combat/attack_retriever_bark/frames')], ['ataque último → idle E', last('combat/attack_retriever_bark/frames'), I('E', 0)],
  ['idle E q0 → dano q0', I('E', 0), first('combat/hurt/frames')], ['dano último → idle E', last('combat/hurt/frames'), I('E', 0)],
  ['idle E q0 → queda q0', I('E', 0), first('combat/incapacitated/queda')], ['queda último → estado q0', last('combat/incapacitated/queda'), first('combat/incapacitated/estado')],
  ['estado último → recuperação q0', last('combat/incapacitated/estado'), first('combat/incapacitated/recuperacao')], ['recuperação último → idle E', last('combat/incapacitated/recuperacao'), I('E', 0)],
];
const seams = pairs.map(([n, a, b]) => { const A = L(a), B = L(b); const bb = best(A, B); return { costura: n, a, b, px: diff(A, B), melhor_alinhamento: bb }; });
fs.writeFileSync(OUT + '/costuras.json', JSON.stringify(seams, null, 1));
for (const s of seams) console.log(s.costura.padEnd(38), String(s.px).padStart(5), ' alinhado:', s.melhor_alinhamento.n, `(dx ${s.melhor_alinhamento.dx}, dy ${s.melhor_alinhamento.dy})`);

// ---- folhas ampliadas ----
const BG = [0x80, 0x80, 0x80], LINE = [0xff, 0x40, 0x40], GRID = [0x70, 0x70, 0x70];
function sheet(name, rows, Z = 6) { // rows: [[label, [files]]]
  const cols = Math.max(...rows.map(r => r[1].length)); const W = cols * 60 * Z + (cols + 1) * 4, H = rows.length * 60 * Z + (rows.length + 1) * 4;
  const buf = Buffer.alloc(W * H * 4); for (let i = 0; i < W * H; i++) { buf[i * 4] = 40; buf[i * 4 + 1] = 40; buf[i * 4 + 2] = 48; buf[i * 4 + 3] = 255; }
  rows.forEach(([, files], r) => files.forEach((f, c) => {
    const d = L(f); const ox = 4 + c * (60 * Z + 4), oy = 4 + r * (60 * Z + 4);
    for (let y = 0; y < 60 * Z; y++) for (let x = 0; x < 60 * Z; x++) {
      const sx = Math.floor(x / Z), sy = Math.floor(y / Z), si = (sy * 60 + sx) * 4, o = ((oy + y) * W + ox + x) * 4;
      let col = BG; if ((x % (Z * 10) === 0) || (y % (Z * 10) === 0)) col = GRID;
      if (sy === 50 && y % Z === 0) col = LINE; // linha logo abaixo do chão (y=49)
      if (sx === 29 && x % Z === Z - 1 && y % (Z * 2) < Z) col = [0x40, 0xa0, 0xff]; // pivô x 29,5
      if (d[si + 3]) col = [d[si], d[si + 1], d[si + 2]];
      buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2];
    }
  }));
  writePNG(`${OUT}/folhas/${name}.png`, W, H, buf);
}
const dirs = ['S', 'E', 'N', 'W'];
sheet('movement_walk_6x', dirs.map(d => [d, frames('movement/walk/' + d)]));
sheet('movement_idle_standing_6x', dirs.map(d => [d, [R(d), ...frames('movement/idle/' + d)]]));
for (const e of ['happy', 'sad', 'angry', 'scared']) sheet(`emotions_${e}_6x`, [['rot', [R('E')]], ...['entrada', 'loop', 'saida'].map(k => [k, frames(`emotions/${e}/${k}`)])]);
sheet('rest_6x', ['stand_to_lie', 'lie_to_sleep', 'sleep_loop', 'sleep_to_wake', 'wake_to_stand'].map(k => [k, frames('rest/rest/' + k)]));
sheet('interactions_6x', [['rot', [R('E')]], ...['entrada', 'loop', 'saida'].map(k => [k, frames('interactions/petting/' + k)]), ['celeb', frames('interactions/celebrate/frames')]]);
sheet('combat_6x', [['atk', frames('combat/attack_retriever_bark/frames')], ['hurt', frames('combat/hurt/frames')], ...['queda', 'estado', 'recuperacao'].map(k => [k, frames('combat/incapacitated/' + k)])]);
// rostos: recorte 24x20 do rosto em E a 10x para olho/marcas
function faceSheet(name, files, x0, y0, w, h, Z = 10) {
  const W = files.length * (w * Z + 4) + 4, H = h * Z + 8; const buf = Buffer.alloc(W * H * 4).fill(0);
  for (let i = 0; i < W * H; i++) { buf[i * 4] = 40; buf[i * 4 + 1] = 40; buf[i * 4 + 2] = 48; buf[i * 4 + 3] = 255; }
  files.forEach((f, c) => { const d = L(f); const ox = 4 + c * (w * Z + 4); for (let y = 0; y < h * Z; y++) for (let x = 0; x < w * Z; x++) { const si = ((y0 + Math.floor(y / Z)) * 60 + x0 + Math.floor(x / Z)) * 4; const o = ((4 + y) * W + ox + x) * 4; const col = d[si + 3] ? [d[si], d[si + 1], d[si + 2]] : [128, 128, 128]; buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]; } });
  writePNG(`${OUT}/folhas/${name}.png`, W, H, buf);
}
faceSheet('rosto_walk_E_10x', [R('E'), ...frames('movement/walk/E')], 28, 14, 24, 20);
faceSheet('rosto_walk_W_10x', [R('W'), ...frames('movement/walk/W')], 8, 14, 24, 20);
faceSheet('rosto_walk_S_10x', [R('S'), ...frames('movement/walk/S')], 18, 14, 24, 20);
faceSheet('rosto_idle_E_W_S_10x', [R('E'), ...frames('movement/idle/E'), R('W'), ...frames('movement/idle/W')], 8, 14, 44, 20, 6);

// ---- GIF (codificador mínimo, LZW sem compressão real) ----
function gif(name, files, msList, Z = 4) {
  const imgs = files.map(L); const pal = new Map([['80,80,80', 0]]);
  for (const d of imgs) for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { const k = `${d[i]},${d[i + 1]},${d[i + 2]}`; if (!pal.has(k)) pal.set(k, pal.size); }
  if (pal.size > 255) throw new Error('paleta > 255'); const W = 60 * Z, H = 60 * Z;
  const parts = [Buffer.from('GIF89a')]; const lsd = Buffer.alloc(7); lsd.writeUInt16LE(W, 0); lsd.writeUInt16LE(H, 2); lsd[4] = 0xf7; parts.push(lsd);
  const gct = Buffer.alloc(256 * 3); for (const [k, i] of pal) { const [r, g, b] = k.split(',').map(Number); gct[i * 3] = r; gct[i * 3 + 1] = g; gct[i * 3 + 2] = b; } parts.push(gct);
  parts.push(Buffer.from([0x21, 0xff, 0x0b, ...Buffer.from('NETSCAPE2.0'), 0x03, 0x01, 0x00, 0x00, 0x00]));
  imgs.forEach((d, fi) => {
    const ms = Array.isArray(msList) ? msList[fi] : msList; const gce = Buffer.from([0x21, 0xf9, 0x04, 0x00, 0, 0, 0, 0]); gce.writeUInt16LE(Math.round(ms / 10), 4); parts.push(gce);
    const id = Buffer.alloc(10); id[0] = 0x2c; id.writeUInt16LE(W, 5); id.writeUInt16LE(H, 7); parts.push(id); parts.push(Buffer.from([8]));
    // índices
    const idx = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const si = (Math.floor(y / Z) * 60 + Math.floor(x / Z)) * 4; idx[y * W + x] = d[si + 3] ? pal.get(`${d[si]},${d[si + 1]},${d[si + 2]}`) : 0; }
    // LZW: códigos de 9 bits, clear a cada 254 literais
    const bytes = []; let acc = 0, nb = 0; const put = c => { acc |= c << nb; nb += 9; while (nb >= 8) { bytes.push(acc & 255); acc >>= 8; nb -= 8; } };
    put(256); let k = 0; for (const v of idx) { put(v); if (++k === 254) { put(256); k = 0; } } put(257); if (nb) bytes.push(acc & 255);
    for (let i = 0; i < bytes.length; i += 255) { const blk = bytes.slice(i, i + 255); parts.push(Buffer.from([blk.length, ...blk])); } parts.push(Buffer.from([0]));
  });
  parts.push(Buffer.from([0x3b])); fs.writeFileSync(`${OUT}/gifs/${name}.gif`, Buffer.concat(parts));
}
for (const d of dirs) { gif(`walk_${d}_4x`, frames('movement/walk/' + d), 100); gif(`idle_${d}_4x`, frames('movement/idle/' + d), 240); }
// cadeias completas com idle de ligação (mostra as costuras)
const id0 = I('E', 0), idl = [0, 1, 2, 3].map(i => I('E', i));
const chain = (name, segs) => { const f = [], m = []; for (const [fs_, ms] of segs) fs_.forEach(x => { f.push(x); m.push(ms); }); gif(name, f, m); };
const man = p => JSON.parse(fs.readFileSync(p));
const em = man('emotions/manifesto.json');
for (const e of ['happy', 'sad', 'angry', 'scared']) {
  const c = em.estados[e].clipes;
  chain(`cadeia_${e}_4x`, [[idl, 240], [frames(`emotions/${e}/entrada`), c.entrada.duracao_ms_por_quadro[0]], ...Array(3).fill([frames(`emotions/${e}/loop`), c.loop.duracao_ms_por_quadro[0]]), [frames(`emotions/${e}/saida`), c.saida.duracao_ms_por_quadro[0]], [idl, 240]]);
}
chain('cadeia_descanso_4x', [[idl, 240], [frames('rest/rest/stand_to_lie'), 140], [frames('rest/rest/lie_to_sleep'), 300], ...Array(2).fill([frames('rest/rest/sleep_loop'), 550]), [frames('rest/rest/sleep_to_wake'), 240], [frames('rest/rest/wake_to_stand'), 120], [idl, 240]]);
chain('cadeia_carinho_4x', [[idl, 240], [frames('interactions/petting/entrada'), 110], ...Array(3).fill([frames('interactions/petting/loop'), 130]), [frames('interactions/petting/saida'), 125], [idl, 240]]);
chain('cadeia_comemoracao_4x', [[idl, 240], [frames('interactions/celebrate/frames'), 85], [idl, 240]]);
chain('cadeia_ataque_4x', [[idl, 240], [frames('combat/attack_retriever_bark/composto_preview').length ? frames('combat/attack_retriever_bark/frames') : [], 105], [idl, 240]]);
chain('cadeia_dano_4x', [[idl, 240], [frames('combat/hurt/frames'), 90], [idl, 240]]);
chain('cadeia_incapacitacao_4x', [[idl, 240], [frames('combat/incapacitated/queda'), 120], ...Array(2).fill([frames('combat/incapacitated/estado'), 300]), [frames('combat/incapacitated/recuperacao'), 140], [idl, 240]]);
console.log('folhas e gifs gravados');
