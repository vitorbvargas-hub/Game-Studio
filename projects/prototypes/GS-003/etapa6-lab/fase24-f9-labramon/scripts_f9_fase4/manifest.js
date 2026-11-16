'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const M = process.argv[2]; const qa = JSON.parse(fs.readFileSync(`${M}/qa_medicoes.json`, 'utf8'));
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const list = d => fs.readdirSync(`${M}/${d}`).filter(f => /\.(png|gif)$/.test(f)).sort().map(f => ({ arquivo: `${d}/${f}`, sha256: sha(`${M}/${d}/${f}`) }));
const fonte = { 'walk/S': 'pixminimax template_action=walking', 'walk/E': 'pixminimax template_action=walking', 'walk/N': 'pixminimax template_action=walking', 'walk/W': 'pixminimax template_action=walking', 'idle/E': 'pixminimax custom 4q', 'idle/W': 'pixminimax custom 4q', 'idle/S': 'rig local (pixels da rotação, 0 gerações)', 'idle/N': 'rig local (pixels da rotação, 0 gerações)' };
const anim = {};
for (const [k, v] of Object.entries(qa.animacoes)) anim[k] = { fonte: fonte[k], quadros: v.quadros, duracao_sugerida_ms_por_quadro: k.startsWith('walk') ? 100 : 240, loop: true, h_min_max: v.h_min_max, w_min_max: v.w_min_max, maior_salto_h: v.maior_salto_h, maior_salto_w: v.maior_salto_w, cores: v.cores_no_conjunto, pe_y49: v.pe_y49_em, olho_px_por_quadro: v.olho_px, marcas_px_por_quadro: v.marcas_px, recuo_pe_apoio_px_quadro: v.recuo_pe_apoio ? { media: v.recuo_pe_apoio.media_px_quadro, min: v.recuo_pe_apoio.min, max: v.recuo_pe_apoio.max } : 'n/a (frente/costas: sem deslizamento lateral)', arquivos: list(k) };
const man = {
  especie: 'Labramon (sp.labramon) — Rookie/child, Beast, Vaccine',
  versao: 'F9 Fase 4 — movimento (standing, idle 4q, walk 8q) nas 4 direções',
  data: '2026-11-16',
  licenca: 'private-prototype (fan game não oficial, sem licença, sem monetização). Espécie oficial Bandai/Toei. NÃO homologado. Nada publicado.',
  status: 'CANDIDATO — aguardando QA independente (game-qa, Fase 10) e homologação do fundador',
  canvas: [60, 60], ancora: { x: 29.5, y_chao: 49, doc: 'Última linha opaca em y=49 em 48/48 quadros de walk/idle e nas 4 rotações.' },
  paleta: { limite: 24, usada: 19, semitransparentes: 0, doc: 'Todos os quadros usam só cores da rotação da própria direção.' },
  standing: { doc: 'Cópia byte a byte de rotacoes/labramon_{S,E,N,W}.png (Fase 3).', arquivos: list('standing') },
  animacoes: anim,
  spritesheets: { doc: 'Tiras 1x, células 60x60, sem espaçamento. labramon_movement_sheet.png: linhas = walk S,E,N,W (8 col), idle S,E,N,W (4 col), standing S,E,N,W (1 linha, 4 col).', arquivos: list('spritesheets') },
  gifs: { doc: 'walk 100 ms/quadro, idle 240 ms/quadro (sugestão de arte; o tempo no jogo é do game-dev). Codificador próprio; validados pelo decodificador local, não abertos num navegador.', arquivos: list('gifs') },
  folhas: ['folha_contato_1x.png', 'folha_contato_4x.png', 'folha_contato_3x_transparente.png'],
  pixellab: {
    personagem: { id: 'e7b2c58f-6ea0-4a49-bab1-7b2ecaa2052d', nome: 'Labramon F9', modo: 'v3 import (quadruped/dog, 4 direções, 60x60) — 0 pixel regenerado nas rotações' },
    grupos_usados: { 'walk-pmm (S,E,N,W)': '348e2f75-230d-47b9-8973-fa50dcb5a14e', 'idle-pmm E': '7a13bfff-615f-4222-bdf9-363db344a035', 'idle-pmm W': 'e7923fdb-4b8e-4837-a42f-fdae0720e95f', 'idle-pmm S (alternativa)': '7b51b2a6-b59c-44e2-9155-e161fcb3e105', 'idle-pmm N (alternativa)': '3889fc0c-d36c-4107-a681-7f266506b6ff' },
    grupos_reprovados_ainda_na_conta: { 'walk v3 E': 'a1163b49-7114-4754-a956-7111472ce501', 'walk v3 S': 'da40d052-ecbf-4ec1-a735-0c7262e1eddd', 'idle v3 E': '261c943f-ae08-4760-a617-7f8e232774f9', 'idle v3 S': '110218f6-c829-40af-a9e2-853f55e91d57', 'walk-tpl E (template dog)': 'fe5e0884-4832-424b-84d2-18f3baffc831', 'idle-tpl E (template dog)': 'de14b7fa-86da-4f5d-b89f-8099a014b874' },
    limpeza: { correct_pixelart: ['b09377ec-73e6-4c07-9f75-4ee752cad3d9', '6fce6886-71f1-47d4-82de-849bdf32765e', 'cce9271e-228a-4e1f-be8d-c26c0c22aa77', 'f84e552e-94f4-4f21-aef1-9dabfc4565d4'], reduce_colors: { S: '2fbd0c13-40d4-40ce-88c3-f46eb6939a30', E: '322ad01b-730d-4ed5-bd0d-92d24060856f', N: '1c811615-c321-4beb-bc5d-4fc7f01b64bd', W: '57c8ea69-474e-4ce5-bafd-a4587c8bf1c4' } },
    custo: [
      { op: 'create_character v3 import (4 rotações)', ger: 0.25 },
      { op: 'animate_character v3 custom: walk E, walk S, idle E, idle S (reprovados)', ger: 4 },
      { op: 'animate_character template dog: walk-8-frames E, idle E (reprovados)', ger: 2 },
      { op: 'animate_character pixminimax: walk S/E/N/W (template_action=walking)', ger: 4 },
      { op: 'animate_character pixminimax: idle S/E/N/W (custom 4q)', ger: 4 },
      { op: 'correct_pixelart ×4', ger: 0.4 }, { op: 'reduce_colors ×4', ger: 0.4 } ],
    geracoes_fase4: 15.05, teto_fase4: 20, saldo_antes: 544.80, saldo_depois: 529.75, acumulado_f9: 15.65, teto_f9: 60, piso_saldo: 485 },
  pos_processo_local: ['paleta exata da rotação (reduce_colors devolveu 2 quase-pretos #020602/#020305 → #010101)', 'remoção de pontos soltos (walk W: 5 px em 4 quadros)', 'trava de cabeça/rosto: linhas do topo da cabeça e retângulo do rosto colados da rotação no deslocamento medido por quadro', 'walk N: sola rosa-escura da pata traseira (linhas ≥44) → #24241e', '7 px claros encostados em transparência escurecidos (falha de contorno)', 'âncora: quadro inteiro deslocado na vertical até a última linha opaca = y49 (walk S: +1/+2 em 6 quadros; walk N: −1/−2 em 6; walk W: +1 em 2)'],
  escala: { tile: 32, labramon_standing_h: 36, labramon_walk_h: { S: '36–37', E: '35–36', N: '38', W: '34–37' }, tamer_v13_south_h: 34, doc: 'Conflito G-2 segue ABERTO; números registrados, não resolvidos.' },
  medicoes: 'qa_medicoes.json (por quadro: bbox, px, cores, pé, contato, deslocamento da cabeça, rosto, olho, marcas, mudança até o próximo quadro; recuo do pé em E/W)',
};
fs.writeFileSync(`${M}/manifesto.json`, JSON.stringify(man, null, 1)); console.log('manifesto ok', Object.keys(anim).length);
