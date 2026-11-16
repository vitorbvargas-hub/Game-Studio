'use strict';
// F9 correções — remonta movement/ (0 gerações) com as rotações retocadas (A5) e o walk N ajustado (A7).
// node build_mov_f9.js <fase24-f9-labramon> <f4 workdir (tmp-f9/f4)>
// Passos: 1 post_mov.js (trava de rosto com as rotações novas) rc/ → fin/ · 2 specks.js fix · 3 a7_walkN.js · 4 make_idle.js (idle S/N, rig da rotação)
//         5 copia quadros/standing para movement/ · 6 tiras, GIFs, folhas · 7 qa.js (qa_medicoes.json) · 8 manifest.js + bloco "correcoes_pos_qa"
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const [, , ROOT, F4] = process.argv; const S4 = path.join(F4, 'scripts'), SF = __dirname;
const ROT = path.join(ROOT, 'rotacoes'), M = path.join(ROOT, 'movement');
const sh = (script, args, dir = S4) => cp.execFileSync('node', [path.join(dir, script), ...args], { cwd: F4, stdio: ['ignore', 'pipe', 'inherit'] }).toString();
const L = require('./lib.js');
const DIRS = ['S', 'E', 'N', 'W'];
// 1–4
fs.rmSync(path.join(F4, 'fin'), { recursive: true, force: true });
const postOut = sh('post_mov.js', [ROT, 'rc', 'fin'], SF);
const specks = {}; for (const a of ['walk', 'idle']) for (const d of DIRS) specks[`${a}/${d}`] = sh('specks.js', ['fix', `fin/${a}/${d}`, ...(a === 'walk' && d === 'N' ? ['walkN'] : [])]).trim();
const a7 = JSON.parse(sh('a7_walkN.js', ['fin/walk/N'], SF));
fs.rmSync(path.join(F4, 'loc_f9c'), { recursive: true, force: true }); sh('make_idle.js', [ROT, 'loc_f9c']);
// 5
const SRC = { 'walk': d => `fin/walk/${d}`, 'idle': d => (d === 'S' || d === 'N') ? `loc_f9c/idle/${d}` : `fin/idle/${d}` };
for (const a of ['walk', 'idle']) for (const d of DIRS) { const dst = path.join(M, a, d); fs.rmSync(dst, { recursive: true, force: true }); fs.mkdirSync(dst, { recursive: true }); for (const f of L.frames(path.join(F4, SRC[a](d)))) fs.copyFileSync(f, path.join(dst, path.basename(f))); }
for (const d of DIRS) fs.copyFileSync(path.join(ROT, `labramon_${d}.png`), path.join(M, 'standing', `${d}.png`));
// 6
const strip = (out, rows) => { const cols = Math.max(...rows.map(r => r.length)); const cv = L.canvas(cols * 60, rows.length * 60); rows.forEach((r, ri) => r.forEach((f, ci) => L.paste(cv, L.readPNG(f), ci * 60, ri * 60))); L.save(out, cv); };
const fr = (a, d) => L.frames(path.join(M, a, d));
for (const a of ['walk', 'idle']) for (const d of DIRS) strip(path.join(M, 'spritesheets', `${a}_${d}.png`), [fr(a, d)]);
strip(path.join(M, 'spritesheets', 'labramon_movement_sheet.png'), [...DIRS.map(d => fr('walk', d)), ...DIRS.map(d => fr('idle', d)), DIRS.map(d => path.join(M, 'standing', `${d}.png`))]);
for (const a of ['walk', 'idle']) for (const d of DIRS) for (const sc of [1, 4]) sh('gif.js', [path.join(M, 'gifs', `${a}_${d}_${sc}x.gif`), String(sc), a === 'walk' ? '100' : '240', ...fr(a, d)]);
const rows = [...DIRS.map(d => `${ROT}/labramon_${d}.png+${M}/walk/${d}`), ...DIRS.map(d => `${ROT}/labramon_${d}.png+${M}/idle/${d}`)];
sh('sheet.js', [path.join(M, 'folha_contato_1x.png'), '1', '1', ...rows]); sh('sheet.js', [path.join(M, 'folha_contato_4x.png'), '4', '1', ...rows]); sh('sheet.js', [path.join(M, 'folha_contato_3x_transparente.png'), '3', '0', ...rows]);
// 7–8
const qaMd = sh('qa.js', [ROT, M]); fs.writeFileSync(path.join(M, 'qa_tabelas.md'), '# Tabelas de QA do movimento (regeneradas na rodada de correções pós-QA, 2026-11-16)\n' + qaMd);
sh('manifest.js', [M]);
const man = JSON.parse(fs.readFileSync(path.join(M, 'manifesto.json')));
man.versao += ' — rodada de correções pós-QA (A5, A7), 2026-11-16';
man.escala.labramon_walk_h.N = '36';
man.correcoes_pos_qa = {
  data: '2026-11-16', relatorio: '../RELATORIO_F9_CORRECOES.md', geracoes: 0, backup: '../_pre_correcao/movement',
  A5: 'Rotações S e W retocadas à mão (olho 2x2, presa 1 px branca, garras com 2 tons); standing S/W = rotações novas; trava de rosto reaplicada no walk S/W e idle W (post_mov.js: rosto S agora inclui a linha y=32 da presa); idle S refeito pelo rig a partir da rotação S nova.',
  A7: { doc: 'Walk N: corpo desce 2 px (topo y=12 → 14, igual ao standing N) tirando as linhas y=44 e y=47 da zona das patas em todos os quadros; pata de apoio continua em y=49.', quadros: a7.map((q, i) => ({ q: i, linhas_removidas: q.linhas_removidas, dif_linha: q.dif_linha, bbox: q.bbox, h: q.h })) },
  limpeza_specks: specks,
};
fs.writeFileSync(path.join(M, 'manifesto.json'), JSON.stringify(man, null, 1));
fs.mkdirSync(path.join(M, '_evidencias'), { recursive: true }); fs.writeFileSync(path.join(M, '_evidencias', 'correcoes_pos_qa_log.txt'), postOut);
console.log('movement remontado');
