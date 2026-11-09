'use strict';
// GS-003 -- evolucoes sem arte (GeoGreymon, Drimogemon) pedidas pelo fundador: sprites de mapa
// do DS quando existem na varredura de 10-source-files/spriters-resource/, pelo mesmo
// importador dos selvagens (import_wild_dwds.js), so que gravando em CREATURE-00NN (faixa dos
// parceiros/evolucoes, nao 01NN que e so selvagens).
//
//   node import_evolution_creatures.js
//
// GeoGreymon (48577): a folha dgmnworldds__*GeoGreymon* tem 5 poses grandes de batalha (coluna
// esquerda) + 1 icone de retrato + uma grade pequena 5 linhas x 3 colunas de sprites de mapa
// (coluna direita) -- e essa grade pequena que o mapFrames() do importador pega (filtro de
// altura 12..48px). Das 5 linhas, a 1a e a 5a sao as unicas com um ciclo de passada limpo e uma
// vista claramente distinta (linha 1: de costas, consistente nos 3 quadros; linha 5: o 3o
// quadro mostra perfil lateral claro). As linhas 2-4 repetem silhuetas muito parecidas com a
// linha 1 (quase o mesmo angulo), entao NAO da pra separar com confianca em 4 direcoes --
// forcar isso seria reproduzir o mesmo bug de direcao que este commit esta corrigindo nos
// Tamers. Por isso só 2 direções entram (S = linha 1, W = linha 5; E espelha W), igual ao
// precedente já documentado para Gotsumon/Otamamon/Goburimon (so 2 direcoes na folha real).
// [H] qual das duas e really "S" (visto de longe, nao de perto) vs. so "costas"; confira com
// --index antes de aprovar para producao.
//
// Drimogemon: sem resultado em nenhuma das 1074 entradas / 27 jogos do _manifest.json da
// varredura (conferido por nome e por arquivo, sem distincao de maiusculas). Nao criado --
// nao da pra inventar uma folha que nao existe no acervo baixado.
const path = require('path');
const { importOne } = require('./import_wild_dwds.js');

const EVOLUTIONS = [
  {
    cid: 'CREATURE-0015',
    name: 'GeoGreymon',
    file: 'GeoGreymon__48577',
    stage: 3,
    line: 'koromon-agumon-geogreymon',
    credit: { ripper: 'redblueyellow', text: 'Ripped by redblueyellow. No credit needed.', required: false },
    verifiedBy: 'game-art',
    walk: { S: [2, 3, 4], W: [14, 15, 16] },
  },
];

function main() {
  const results = EVOLUTIONS.map(importOne);
  for (const r of results) console.log('OK', r.s.cid, r.s.name, '->', path.join('assets/GAME-ASSETS/01-creatures', r.s.cid));
  console.log('Drimogemon: SEM folha na varredura (1074/1074 arquivos conferidos, 27 jogos, nenhum "drimo*"). Nao foi criado CREATURE novo para ele.');
}

main();
