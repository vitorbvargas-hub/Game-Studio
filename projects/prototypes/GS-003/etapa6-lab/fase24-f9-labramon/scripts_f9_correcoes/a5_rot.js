'use strict';
// A5 — retoque manual (0 gerações) das rotações S e W: olho 2x2 limpo, presa 1 px branca, garra com 2 tons.
// Só cores da paleta de 19. node a5_rot.js <rotacoes_entrada> <rotacoes_saida>  (grava labramon_S.png e labramon_W.png; log no stdout)
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs'), path = require('path');
const [, , IN, OUT] = process.argv;
const C = { W: '#f6f2e8', w: '#d5d2c6', g: '#b1afa3', h: '#8e8c81', k: '#6b6b5c', t: '#24241e', '#': '#010101', o: '#434a39', m: '#58444b', y: '#a4a370', E: '#c63239', e: '#81231d', R: '#dc9aa3', r: '#b97191', P: '#d94182', p: '#ac2d64', q: '#7a2044', v: '#4b192d', u: '#250d20' };
// edições: [y, x0, 'cadeia'] — a cadeia pinta a partir de x0 ('.' = não mexe)
const EDITS = {
  S: { // de frente; eixo de simetria x=30
    olhos: [
      [24, 25, 'wkkw'], [25, 25, 'WeeWW'], [26, 25, 'WEEWW'],          // olho esquerdo (x26–27): 2x2 (pálpebra escura em cima), sobrancelha cinza, cinza embolado ao redor limpo
      [24, 32, 'wkkw'], [25, 32, 'WeeW'], [26, 32, 'WEEW'],            // olho direito (x33–34), espelho
    ],
    presa: [[31, 27, 'kttttkk'], [32, 26, 'ghWhwwwg']],                // boca = linha escura de 4 px; presa branca 1 px (x28,y32) entre 2 cinzas
    garras: [
      [45, 23, 'kWWWWw'], [46, 23, 'wywywy'], [47, 23, 'hohoho'],     // pata esquerda: 3 garras = claro (y46) + escuro (y47)
      [45, 32, 'WWWWw'], [46, 32, 'ywywy'], [47, 32, 'ohoho'],        // pata direita (x32,34,36)
    ],
  },
  W: { // de perfil, olhando para a esquerda
    olhos: [[24, 18, 'httth'], [25, 18, 'WeeWW'], [26, 18, 'WEEWh']],  // olho x19–20 2x2; tira o vermelho solto (x21,y24) e a marca acima do olho
    presa: [[29, 13, 'hhttt'], [30, 14, 'hWh']],                      // boca escura curta; presa 1 px branca (x15,y30) entre 2 cinzas
    garras: [
      [46, 19, 'koyoww'], [47, 22, 'yowyok'],                         // pata da frente: garras = par claro (y) + sombra (o) à direita
      [46, 35, 'tyoWW'], [47, 35, 'kyowyo'],                          // pata de trás
    ],
  },
};
const log = {};
for (const d of ['S', 'W']) {
  const img = L.readPNG(path.join(IN, `labramon_${d}.png`)); const before = L.readPNG(path.join(IN, `labramon_${d}.png`)); log[d] = {};
  for (const [grp, list] of Object.entries(EDITS[d])) { let n = 0;
    for (const [y, x0, s] of list) [...s].forEach((ch, i) => { if (ch === '.') return; const h = C[ch]; if (!h) throw new Error('cor ' + ch); if (!G.at(img, x0 + i, y)) throw new Error(`${d} ${x0 + i},${y} transparente`); if (G.at(img, x0 + i, y) !== h) { G.set(img, x0 + i, y, h); n++; } });
    log[d][grp] = n; }
  const m = L.measure(img), m0 = L.measure(before);
  log[d].bbox_antes_depois = [m0.bbox, m.bbox]; log[d].cores = m.colors.size; log[d].semi = m.semi;
  log[d].fora_da_paleta = [...m.colors.keys()].filter(c => !Object.values(C).includes(c));
  L.save(path.join(OUT, `labramon_${d}.png`), img);
}
console.log(JSON.stringify(log));
