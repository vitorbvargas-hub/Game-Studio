// QA independente F9 (game-qa). Só lê as entregas. Saída: qa_f9/qa_arquivos.json
// Uso: node qa_f9/scripts/check.mjs   (cwd = fase24-f9-labramon)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { readPNG, hex } from './png.mjs';

const ROOT = process.cwd();
const FOLDERS = ['rotacoes', 'movement', 'emotions', 'rest', 'interactions', 'combat'];
const EYE = new Set(['#c63239', '#81231d']);
const MARK = new Set(['#b97191', '#dc9aa3']);
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

// ---- 1. Todos os {arquivo, sha256} dos manifestos ----
const refs = [];
function walk(o, base, ctx) {
  if (Array.isArray(o)) return o.forEach(x => walk(x, base, ctx));
  if (o && typeof o === 'object') {
    if (typeof o.arquivo === 'string') refs.push({ manifest: ctx, file: path.join(base, o.arquivo), sha: o.sha256 ?? null });
    for (const v of Object.values(o)) walk(v, base, ctx);
  }
}
const manifests = {};
for (const f of FOLDERS) { const m = JSON.parse(fs.readFileSync(path.join(f, 'manifesto.json'))); manifests[f] = m; walk(m, f, f); }
// strings que parecem caminhos (gifs/spritesheets como string pura)
function walkStr(o, base, ctx) {
  if (Array.isArray(o)) return o.forEach(x => walkStr(x, base, ctx));
  if (o && typeof o === 'object') return Object.values(o).forEach(v => walkStr(v, base, ctx));
  if (typeof o === 'string' && /\.(png|gif|json)$/.test(o) && !o.includes(' ') && !o.startsWith('#')) refs.push({ manifest: ctx, file: path.join(base, o), sha: null, strOnly: true });
}
for (const f of FOLDERS) walkStr(manifests[f], f, f);

const refRes = { total: 0, faltando: [], sha_divergente: [], sha_ok: 0, sem_sha: 0 };
const seen = new Set();
for (const r of refs) {
  const key = r.file + '|' + (r.sha ?? '');
  if (seen.has(key)) continue; seen.add(key); refRes.total++;
  let p = r.file;
  if (!fs.existsSync(p)) { // tentar relativo à raiz
    const alt = r.file.split(path.sep).slice(1).join(path.sep);
    if (fs.existsSync(alt)) p = alt; else { refRes.faltando.push(r.manifest + ': ' + r.file); continue; }
  }
  if (!r.sha) { refRes.sem_sha++; continue; }
  const s = sha(p); if (s === r.sha) refRes.sha_ok++; else refRes.sha_divergente.push({ file: p, manifest: r.sha, real: s });
}

// ---- 2. PNGs no disco fora dos manifestos ----
const listed = new Set(refs.map(r => path.normalize(r.file)));
const orphans = [];
for (const f of FOLDERS) {
  (function rec(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!e.name.startsWith('_')) rec(p); }
      else if (/\.(png|gif)$/.test(e.name) && !listed.has(path.normalize(p))) orphans.push(p);
    }
  })(f);
}

// ---- 3. Paletas de referência (rotações) ----
const pal = {};
for (const d of ['S', 'E', 'N', 'W']) { const p = readPNG(`rotacoes/labramon_${d}.png`); const s = new Set(); for (let i = 0; i < p.data.length; i += 4) if (p.data[i + 3]) s.add(hex(p.data, i)); pal[d] = s; }
const palAll = new Set([...pal.S, ...pal.E, ...pal.N, ...pal.W]);

function measure(file, dir) {
  const p = readPNG(file); const W = p.w, H = p.h, d = p.data;
  let semi = 0, op = 0, minx = 1e9, miny = 1e9, maxx = -1, maxy = -1, eye = 0, mark = 0, magenta = 0;
  const cols = new Set(), out = new Set();
  const refPal = dir ? pal[dir] : palAll;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const o = (y * W + x) * 4, a = d[o + 3];
    if (a === 0) continue; if (a < 255) semi++;
    op++; const c = hex(d, o); cols.add(c); if (!refPal.has(c)) out.add(c);
    if (d[o] > 200 && d[o + 1] < 60 && d[o + 2] > 200) magenta++;
    if (EYE.has(c)) eye++; if (MARK.has(c)) mark++;
    if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
  }
  // contato: pixels opacos nas 3 últimas linhas do bbox
  let cx0 = 1e9, cx1 = -1;
  for (let y = Math.max(0, maxy - 2); y <= maxy; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3]) { cx0 = Math.min(cx0, x); cx1 = Math.max(cx1, x); }
  return { w: W, h: H, bd: p.bd, ct: p.ct, op, semi, magenta, cores: cols.size, fora: [...out], eye, mark,
    bbox: op ? [minx, miny, maxx, maxy] : null, bw: op ? maxx - minx + 1 : 0, bh: op ? maxy - miny + 1 : 0, pe: maxy, topo: miny,
    contato: op ? [cx0, cx1, (cx0 + cx1) / 2] : null, _d: d };
}
function diff(a, b) { let n = 0; for (let i = 0; i < a.length; i += 4) { const ao = a[i + 3] > 0, bo = b[i + 3] > 0; if (ao !== bo || (ao && (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]))) n++; } return n; }

// ---- 4. Clipes ----
const clips = [];
const mv = manifests.movement;
for (const [k, v] of Object.entries(mv.animacoes)) clips.push({ id: 'movement/' + k, dir: k.split('/')[1], loop: !!v.loop, files: v.arquivos.map(a => 'movement/' + a.arquivo), ms: v.duracao_sugerida_ms_por_quadro });
for (const f of ['emotions', 'rest', 'interactions', 'combat']) {
  for (const [ek, ev] of Object.entries(manifests[f].estados)) for (const [ck, cv] of Object.entries(ev.clipes))
    clips.push({ id: `${f}/${ek}/${ck}`, dir: 'E', loop: !!cv.loop, files: cv.arquivos.map(a => f + '/' + a.arquivo), ms: cv.duracao_ms_por_quadro });
}
const rot = {}; for (const d of ['S', 'E', 'N', 'W']) rot[d] = measure(`rotacoes/labramon_${d}.png`, d);

const clipRes = [];
for (const c of clips) {
  const fr = c.files.map(f => ({ f, ...measure(f, c.dir), sha: sha(f) }));
  const dif = []; for (let i = 1; i < fr.length; i++) dif.push(diff(fr[i - 1]._d, fr[i]._d));
  const fecho = fr.length > 1 ? diff(fr[fr.length - 1]._d, fr[0]._d) : 0;
  const hashes = fr.map(x => x.sha); const dupPairs = [];
  for (let i = 0; i < hashes.length; i++) for (let j = i + 1; j < hashes.length; j++) if (hashes[i] === hashes[j]) dupPairs.push([i, j]);
  const r0 = rot[c.dir];
  const res = {
    id: c.id, dir: c.dir, loop: c.loop, n: fr.length, ms: c.ms,
    canvas_ok: fr.every(x => x.w === 60 && x.h === 60), semi: fr.reduce((s, x) => s + x.semi, 0), magenta: fr.reduce((s, x) => s + x.magenta, 0),
    cores_max: Math.max(...fr.map(x => x.cores)), fora: [...new Set(fr.flatMap(x => x.fora))],
    pe: fr.map(x => x.pe), topo: fr.map(x => x.topo), bw: fr.map(x => x.bw), bh: fr.map(x => x.bh), massa: fr.map(x => x.op),
    olho: fr.map(x => x.eye), marcas: fr.map(x => x.mark), contato_cx: fr.map(x => x.contato?.[2]),
    dif_consecutivos: dif, dif_fecho_loop: c.loop ? fecho : null, duplicados: dupPairs,
    dif_q0_vs_rot: diff(fr[0]._d, r0._d), dif_ult_vs_rot: diff(fr[fr.length - 1]._d, r0._d),
    maior_salto_massa: Math.max(0, ...fr.slice(1).map((x, i) => Math.abs(x.op - fr[i].op)), c.loop ? Math.abs(fr[0].op - fr[fr.length - 1].op) : 0),
    maior_salto_bh: Math.max(0, ...fr.slice(1).map((x, i) => Math.abs(x.bh - fr[i].bh))),
    maior_salto_bw: Math.max(0, ...fr.slice(1).map((x, i) => Math.abs(x.bw - fr[i].bw))),
    formato: [...new Set(fr.map(x => `bd${x.bd}ct${x.ct}`))]
  };
  clipRes.push(res);
}

// ---- 5. Outros PNGs (poses-mestras, FX, standing, rotações) ----
const extras = {};
const exFiles = [
  ...['S', 'E', 'N', 'W'].map(d => `rotacoes/labramon_${d}.png`), ...['S', 'E', 'N', 'W'].map(d => `movement/standing/${d}.png`),
  ...fs.readdirSync('combat/attack_retriever_bark/fx').map(f => 'combat/attack_retriever_bark/fx/' + f)];
for (const f of exFiles) { const m = measure(f, null); delete m._d; extras[f] = { ...m, sha: sha(f) }; }
for (const d of ['S', 'E', 'N', 'W']) extras[`standing_${d}_igual_rotacao`] = sha(`movement/standing/${d}.png`) === sha(`rotacoes/labramon_${d}.png`);

// ---- 6. Spritesheets x quadros ----
const sheetRes = [];
for (const c of clips) {
  const m = c.id.startsWith('movement/') ? `movement/spritesheets/${c.id.split('/')[1]}_${c.dir}.png` : null;
  let sheet = m;
  if (!m) { const [f, e, k] = c.id.split('/'); const man = manifests[f].estados[e].clipes[k]; sheet = man.spritesheet ? f + '/' + man.spritesheet : null; }
  if (!sheet || !fs.existsSync(sheet)) { sheetRes.push({ id: c.id, sheet, ok: false, motivo: 'ausente' }); continue; }
  const s = readPNG(sheet); let bad = 0;
  if (s.w !== 60 * c.files.length || s.h !== 60) { sheetRes.push({ id: c.id, sheet, ok: false, motivo: `dim ${s.w}x${s.h}` }); continue; }
  c.files.forEach((f, i) => { const p = readPNG(f); for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const a = (y * 60 + x) * 4, b = (y * s.w + i * 60 + x) * 4; if (p.data[a + 3] !== s.data[b + 3] || (p.data[a + 3] && (p.data[a] !== s.data[b] || p.data[a + 1] !== s.data[b + 1] || p.data[a + 2] !== s.data[b + 2]))) bad++; } });
  sheetRes.push({ id: c.id, sheet, ok: bad === 0, px_diferentes: bad });
}

// ---- 7. GIFs: contagem de quadros e duração ----
function gifInfo(f) {
  const b = fs.readFileSync(f); if (b.subarray(0, 3).toString() !== 'GIF') return { erro: 'assinatura' };
  const w = b.readUInt16LE(6), h = b.readUInt16LE(8); let p = 13; const flags = b[10]; if (flags & 0x80) p += 3 * (1 << ((flags & 7) + 1));
  let frames = 0, delay = 0, loop = false;
  while (p < b.length) {
    const t = b[p];
    if (t === 0x3b) break;
    if (t === 0x21) { const lab = b[p + 1]; p += 2;
      if (lab === 0xf9) delay += b.readUInt16LE(p + 2) * 10;
      if (lab === 0xff && b.subarray(p + 1, p + 12).toString().startsWith('NETSCAPE')) loop = true;
      while (b[p] !== 0) p += b[p] + 1; p++; continue; }
    if (t === 0x2c) { frames++; const fl = b[p + 9]; p += 10; if (fl & 0x80) p += 3 * (1 << ((fl & 7) + 1)); p++; while (b[p] !== 0) p += b[p] + 1; p++; continue; }
    return { w, h, frames, delay, erro: 'bloco inesperado em ' + p };
  }
  return { w, h, frames, delay_ms: delay, loop };
}
const gifRes = {};
for (const f of FOLDERS.slice(1)) for (const g of fs.readdirSync(f + '/gifs')) gifRes[f + '/gifs/' + g] = gifInfo(f + '/gifs/' + g);

const out = { gerado: new Date().toISOString(), refs: refRes, orfaos: orphans, rotacoes: Object.fromEntries(Object.entries(rot).map(([k, v]) => { const { _d, ...r } = v; return [k, r]; })), clipes: clipRes, extras, spritesheets: sheetRes, gifs: gifRes };
fs.writeFileSync('qa_f9/qa_arquivos.json', JSON.stringify(out, null, 1));
// resumo
console.log('refs', JSON.stringify({ ...refRes, faltando: refRes.faltando.length, sha_divergente: refRes.sha_divergente.length }));
console.log('faltando', refRes.faltando.slice(0, 20)); console.log('sha div', refRes.sha_divergente.slice(0, 5));
console.log('orfaos', orphans.length, orphans.slice(0, 30));
for (const c of clipRes) console.log(c.id, 'n', c.n, 'cv', c.canvas_ok, 'semi', c.semi, 'mag', c.magenta, 'cor', c.cores_max, 'fora', c.fora.length, 'pe', c.pe.join(','), 'bh', c.bh.join(','), 'bw', c.bw.join(','), 'olho', c.olho.join(','), 'marc', c.marcas.join(','), 'dif', c.dif_consecutivos.join(','), 'fecho', c.dif_fecho_loop, 'dup', JSON.stringify(c.duplicados), 'q0rot', c.dif_q0_vs_rot, 'ultrot', c.dif_ult_vs_rot, 'cx', c.contato_cx.join(','), 'massa', c.massa.join(','));
console.log('sheets ruins', sheetRes.filter(s => !s.ok));
console.log('gifs', Object.keys(gifRes).length, Object.entries(gifRes).filter(([k, v]) => v.erro).length, 'com erro');
console.log('standing==rot', ['S', 'E', 'N', 'W'].map(d => extras[`standing_${d}_igual_rotacao`]));
