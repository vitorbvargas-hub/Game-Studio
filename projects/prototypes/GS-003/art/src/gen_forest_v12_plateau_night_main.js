'use strict';
// Driver for gen_forest_v12_plateau_night.js -- kept separate only to keep
// each file a manageable size (same convention as gen_forest_v11_ground*.js).
const fs = require('fs');
const path = require('path');
const { enumerateBlob47 } = require('./blob_autotile47.js');

function run(M) {
  const {
    TILE, OUT, d, dn,
    grassDirtWang47SetPainted, miranteTopBlobSetPainted, buildLipSet,
    loadV11MiranteTiles, loadV11GroundTiles, buildPlateauScene, buildProofSheet, buildPreviewSheet,
    hexOf, hexRamp,
  } = M;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'tiles', 'night'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'mirante'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'mirante', 'night'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'lip'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'lip', 'night'), { recursive: true });

  const seed = 121000;

  // 1. terra batida Wang-47 pintada, dia + noite -----------------------
  const wangDay = grassDirtWang47SetPainted(seed + 500, d);
  const wangNight = grassDirtWang47SetPainted(seed + 500, dn); // mesmo seed -> mesma geometria/ruido, so a paleta muda
  const wangDayByIndex = [];
  for (const t of wangDay) { t.canvas.save(path.join(OUT, 'tiles', `grass_dirt_wang47_${t.index}.png`)); wangDayByIndex[t.index] = t.canvas; }
  const wangNightByIndex = [];
  for (const t of wangNight) { t.canvas.save(path.join(OUT, 'tiles', 'night', `grass_dirt_wang47_night_${t.index}.png`)); wangNightByIndex[t.index] = t.canvas; }

  // 2. topo do mirante pintado, dia + noite -----------------------------
  const mirDay = miranteTopBlobSetPainted(seed + 900, d);
  const mirNight = miranteTopBlobSetPainted(seed + 900, dn);
  for (let m = 0; m < 16; m++) {
    mirDay[m].save(path.join(OUT, 'mirante', `mirante_top_blob_${m}.png`));
    mirNight[m].save(path.join(OUT, 'mirante', 'night', `mirante_top_blob_night_${m}.png`));
  }

  // 3. lip da borda superior do plato, dia + noite ----------------------
  const lipDay = buildLipSet(d, seed + 2000);
  const lipNight = buildLipSet(dn, seed + 2000);
  const LIP_NAMES = ['straight_0', 'straight_1', 'straight_2', 'corner_outer_left', 'corner_outer_right'];
  for (const name of LIP_NAMES) {
    lipDay[name].save(path.join(OUT, 'lip', `mirante_top_edge_${name}.png`));
    lipNight[name].save(path.join(OUT, 'lip', 'night', `mirante_top_edge_night_${name}.png`));
  }

  // 4. prancha de prova dia/noite, escala de jogo ------------------------
  const v11Mirante = loadV11MiranteTiles(); // topo ja aprovado do v11 (mirante_top_blob_*), lido do disco -- nao redesenhado
  const v11Ground = loadV11GroundTiles();
  const sceneDay = buildPlateauScene(false, v11Mirante, v11Ground, lipDay, wangDayByIndex);
  const sceneNight = buildPlateauScene(true, v11Mirante, v11Ground, lipNight, wangNightByIndex);
  const proof = buildProofSheet(sceneDay, sceneNight);
  proof.save(path.join(OUT, 'before_after_20x12.png'));

  // preview sheet ---------------------------------------------------------
  const preview = buildPreviewSheet([
    { title: 'LIP DA BORDA SUPERIOR DO PLATO (dia)', items: LIP_NAMES.map((n) => ({ canvas: lipDay[n] })), scale: 2 },
    { title: 'LIP DA BORDA SUPERIOR DO PLATO (noite pintada)', items: LIP_NAMES.map((n) => ({ canvas: lipNight[n] })), scale: 2 },
    { title: 'WANG-47 TERRA BATIDA NOITE PINTADA (0..15)', items: wangNightByIndex.slice(0, 16).map((c) => ({ canvas: c })), scale: 2 },
    { title: 'WANG-47 TERRA BATIDA NOITE PINTADA (16..46)', items: wangNightByIndex.slice(16).map((c) => ({ canvas: c })), scale: 2 },
    { title: 'MIRANTE TOP NOITE PINTADA (blob-16)', items: Object.values(mirNight).map((c) => ({ canvas: c })), scale: 2 },
  ]);
  preview.save(path.join(OUT, 'preview.png'));

  // tileability check (wrap-around da terra batida noturna, mesma prova de v11)
  const { Canvas } = require('./canvas.js');
  const { drawText } = require('./font5x3.js');
  const N = 6, scale = 4;
  const check = new Canvas(N * TILE * scale + 16, N * TILE * scale + 30);
  check.fillRect(0, 0, check.w - 1, check.h - 1, [12, 12, 20, 255]);
  drawText(check, 'MIRANTE TOP NIGHT (BLOB 15, FECHADO) 6X6 -- WRAP CHECK', 8, 6, [200, 230, 255, 255]);
  for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) check.blit(mirNight[15].scaleNearest(scale), 8 + tx * TILE * scale, 20 + ty * TILE * scale);
  check.save(path.join(OUT, 'tileability_check.png'));

  // metadata ---------------------------------------------------------------
  const table47 = enumerateBlob47();

  const paletteJson = {
    biome: 'forest-v12-plateau-night',
    note: '0 hex novo. Dia reusa INTEGRALMENTE forest-v8-depth/buildDepthRamps() (a mesma `d` de forest-v11-ground). Noite e a MESMA formula de profundidade (shiftRamp com GF_SAT_MUL=0.64/GF_VAL_MUL=0.80/etc., copiada de forest_v8_depth_palette.js buildDepthRamps()) aplicada sobre forest_v4_palette.js GROUND_NIGHT/FOLIAGE_NIGHT (ja hand-picked e usada pela noite "pintada" de forest-v4) em vez da base GROUND_DAY/FOLIAGE_DAY -- so a base troca, a formula e identica. Diferenca para a abordagem de v11 (copas night/): aqui NAO e um recolor pixel-a-pixel de um PNG diurno ja pronto -- a MESMA geometria (blob-47/blob-16, blob_autotile47.js e blob_autotile16.js, nenhum dos dois modificado) e repintada do zero com a rampa noturna, como pedido explicitamente ("versao noturna PINTADA").',
    ramps: {
      grassDay: hexRamp(d.grass), dirtDay: hexRamp(d.dirt), stoneDay: hexRamp(d.stone), mossDay: hexOf(d.moss), mossEdgeDay: hexOf(d.mossEdge),
      grassNight: hexRamp(dn.grass), dirtNight: hexRamp(dn.dirt), stoneNight: hexRamp(dn.stone), mossNight: hexOf(dn.moss), mossEdgeNight: hexOf(dn.mossEdge),
      foliageNight: hexRamp(dn.foliage),
    },
    source: 'Dia: art/src/forest_v8_depth_palette.js buildDepthRamps(). Noite: MESMA funcao reimplementada localmente (buildNightDepthRamps() em gen_forest_v12_plateau_night.js) trocando a base de art/src/forest_v4_palette.js withPreset(true) para withPreset(false) (GROUND_NIGHT/FOLIAGE_NIGHT) -- os multiplicadores GF_SAT_MUL/GF_VAL_MUL/RIM_SAT_MUL/RIM_VAL_MUL sao os MESMOS 4 valores do dia, copiados do arquivo original.',
  };

  const tilesetJson = {
    biome: 'forest-v12-plateau-night',
    note: 'Pacote NOVO e paralelo a forest-v11-ground (nao sobrescrito, nao modificado) -- cobre as 2 pendencias de arte deixadas em V11_DEV.md: (1) a borda superior (norte) do plato do mirante, que hoje corta sem transicao no ultimo tile de grama; (2) uma versao NOTURNA PINTADA (nao so o tint uniforme de GradeRule.night) da terra batida Wang-47 e do topo do mirante. 0 geracoes do PixelLab gastas -- pipeline 100% local Canvas.js, mesmos primitivos/convencoes de v4..v11 (saldo PixelLab em 0,8, aguardando aprovacao do fundador -- nao usado aqui por decisao explicita do coordenador).',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'plateau-edge', 'decor'],
    palette: 'Ver palette.json.',
    plateauEdgeLip: {
      note: 'Substitui, na fileira do mirante_top_blob_* que fica mais distante da camera (northOpen: a celula acima NAO e plato), o tile por um destes 5 -- reta (3 variantes de seed, pra nao repetir identica numa fileira longa) ou canto externo esquerdo/direito (quando a celula a oeste/leste TAMBEM esta fora do plato, ou seja, e um canto convexo). Cada arquivo e um tile 32x32 COMPLETO (chao de grama igual ao mirante_top_blob_15 por baixo, pela mesma textura de preenchimento) com 3 camadas desenhadas por cima, nos 10px superiores: banda de sombra de contato (gradiente de alfa, mais escura junto a borda), tufos verticais de musgo/grama caindo por cima da borda (comprimento e posicao por seed, alguns "pingando" mais fundo que outros), e, nas pecas de canto, uma segunda banda de sombra na lateral externa (oeste no canto esquerdo, leste no direito). Drop-in: mesmo tamanho/grid/paleta de mirante_top_blob_*, troca so o arquivo na fileira norte.',
      files: {
        day: ['lip/mirante_top_edge_straight_0.png', 'lip/mirante_top_edge_straight_1.png', 'lip/mirante_top_edge_straight_2.png', 'lip/mirante_top_edge_corner_outer_left.png', 'lip/mirante_top_edge_corner_outer_right.png'],
        night: ['lip/night/mirante_top_edge_night_straight_0.png', 'lip/night/mirante_top_edge_night_straight_1.png', 'lip/night/mirante_top_edge_night_straight_2.png', 'lip/night/mirante_top_edge_night_corner_outer_left.png', 'lip/night/mirante_top_edge_night_corner_outer_right.png'],
      },
      placementRule: 'Para cada celula do mirante com a celula ao NORTE fora do plato (ou fora do mapa): se a celula a OESTE tambem esta fora do plato, usar corner_outer_left; se a celula a LESTE tambem esta fora, usar corner_outer_right; senao, uma das 3 variantes straight_N (por hash de posicao, igual ao espalhamento de ground_variant_*). Celulas cuja vizinha norte E plato continuam usando mirante_top_blob_* normalmente (nenhuma mudanca ali).',
    },
    grassDirtTransitionNight: {
      note: 'MESMA geometria/ruido de forest-v11-ground/tileset.json grassDirtTransition (blob_autotile47.js, mesmo seed por indice) -- so a paleta de preenchimento muda (ramps.grass/ramps.dirt/ramps.stone de `dn` em vez de `d`). Indices e bitmask IDENTICOS ao pacote v11 (mesma placementTable) -- um renderer que ja resolve o indice Wang-47 para o dia so precisa trocar o arquivo de origem por condicao dia/noite, usando o MESMO indice.',
      pattern: '47-tile Wang/blob, cantos internos (ver forest-v11-ground/tileset.json grassDirtTransition para a convencao completa de bitmask)',
      files: { day: 'tiles/grass_dirt_wang47_<indice>.png (0..46, equivalente ao pacote v11 mas pintado aqui de novo pela mesma geometria -- usar o de v11 se ja integrado)', night: 'tiles/night/grass_dirt_wang47_night_<indice>.png (0..46)' },
      placementTable: table47.map((e, i) => ({ index: i, edgeMask: e.edgeMask, diagMask: e.diagMask, dayFile: `tiles/grass_dirt_wang47_${i}.png`, nightFile: `tiles/night/grass_dirt_wang47_night_${i}.png` })),
    },
    miranteTopNight: {
      note: 'MESMA geometria blob-16 de forest-v11-ground/mirante_top_blob_* (blob_autotile16.js, nao modificado, mesmo bitmask de forest-v9-cliffs cliff_top_blob) -- pintada aqui com `dn` em vez de `d`. Um renderer que ja usa mirante_top_blob_<m> para o dia so troca o arquivo por mirante_top_blob_night_<m> na condicao noturna, mesmo indice m.',
      pattern: '16-tile blob, mesmo bitmask de forest-v9-cliffs cliff_top_blob / forest-v11-ground mirante_top_blob',
      files: { day: Array.from({ length: 16 }, (_, m) => `mirante/mirante_top_blob_${m}.png`), night: Array.from({ length: 16 }, (_, m) => `mirante/night/mirante_top_blob_night_${m}.png`) },
    },
    proof: {
      note: 'before_after_20x12.png -- um mirante 10x6 (planta com reentrancia simetrica nos 2 cantos da frente, igual ao mirante_assembly_demo.png de v11) montado 2x: dia e noite, cada um usando a fileira norte com o lip novo (reta + os 2 cantos), o miolo com mirante_top_blob_* JA APROVADO de forest-v11-ground (lido do disco, nao redesenhado), 2 manchas de terra batida Wang-47 pintada (dia/noite) espalhadas no chao ao redor, e a face/rampa/cantos REAIS de forest-v9-cliffs por baixo (tambem lidos do disco). Escala 1:1 (32px por tile, "escala de jogo") -- sem zoom, pra julgar a leitura exatamente como aparece no jogo.',
      file: 'before_after_20x12.png',
    },
  };

  const licenseJson = {
    biome: 'forest-v12-plateau-night',
    layer: 'original',
    assets: [{
      group: '5 pecas de lip (dia) + 5 pecas de lip (noite) + 47 pecas Wang-47 de terra batida noturna pintada + 16 pecas de mirante top noturno pintado + before_after_20x12.png + preview.png + tileability_check.png',
      origin: 'game-art, 100% pipeline local, 2026-11-10',
      layer: 'original',
      author: 'game-art',
      technique: 'Canvas.js pixel matrix, MESMOS primitivos e MESMAS geometrias de blob_autotile16.js/blob_autotile47.js ja usadas e aprovadas em forest-v9-cliffs/forest-v11-ground (nenhum modulo de autotile novo ou modificado) -- a unica logica nova deste pacote e o lip da borda superior (paintLip(), banda de sombra de contato + tufos de musgo/grama caindo, por cima da mesma textura de preenchimento do mirante top). Paleta 100% derivada de forest_v8_depth_palette.js (dia) e de uma reimplementacao local da MESMA formula sobre forest_v4_palette.js GROUND_NIGHT/FOLIAGE_NIGHT (noite) -- nenhum hex novo escolhido "no olho". Sem geracao do PixelLab (saldo 0,8, aguardando aprovacao do fundador) e sem arte de terceiros referenciada pixel a pixel.',
      styleReference: 'Nenhuma referencia de terceiros nova -- continuidade direta de forest-v9-cliffs/forest-v11-ground (ja com styleReference proprio documentado nos respectivos license.json).',
      license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- mesma base de ADR-010/011 Secao 5 ja aplicada aos pacotes anteriores desta familia (nenhuma referencia nova introduzida por este pacote).',
    }],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };

  const readme = buildReadme();

  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify(paletteJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'README.md'), readme);

  console.log('forest-v12-plateau-night gerado em', OUT);
}

function buildReadme() {
  return `# forest-v12-plateau-night — borda do plato do mirante + terra/mirante noturnos pintados (Map Factory, 2026-11-10)

Pacote **NOVO e paralelo** a \`forest-v11-ground\` (integrado no jogo, branch \`quality-overhaul\`,
commit \`bf2b4ca\`, relatorio \`quality-overhaul/phase3/v11/V11_DEV.md\`) — \`forest-v11-ground\` **nao e
sobrescrito nem modificado**. Cobre as 2 pendencias de arte deixadas no relatorio do v11 (secao
Limitacoes/pedido do coordenador):

1. a **borda superior (norte) do plato do mirante** — hoje o topo simplesmente corta no ultimo tile de
   grama, sem nenhuma transicao (o penhasco/face de \`forest-v9-cliffs\` so cobre o lado SUL, visivel pro
   jogador; o lado norte, mais distante da camera, fica sem decoracao nenhuma);
2. uma versao **noturna PINTADA** (nao so o tint uniforme de \`GradeRule.night\` que o renderer ja aplica
   hoje) da **terra batida Wang-47** e do **topo do mirante** — \`forest-v11-ground\` ja tinha entregue uma
   noite pintada para as COPAS (recolor pixel-a-pixel do PNG diurno); este pacote faz o equivalente para
   terra e mirante, mas com uma tecnica diferente (ver item 2 abaixo) porque o pedido era especificamente
   por isso.

## O que tem aqui, item por item

1. **Lip da borda superior do plato** (\`lip/mirante_top_edge_straight_0..2.png\` +
   \`lip/mirante_top_edge_corner_outer_left.png\` + \`..._corner_outer_right.png\`, dia; mesmos 5 arquivos em
   \`lip/night/\` com sufixo \`_night_\`) — cada arquivo e um tile 32x32 COMPLETO, drop-in no lugar de
   \`mirante_top_blob_*\` na fileira do mirante cuja celula ao norte esta fora do plato: o chao de grama por
   baixo e a MESMA textura de preenchimento do mirante top (\`groundClumpFill\`, 0 geometria nova), e por
   cima, nos 10px superiores do tile, uma banda de sombra de contato (gradiente de alfa sobre preto quase
   puro, mais forte junto a borda, dissolvendo pro verde) MAIS tufos verticais de musgo/grama caindo por
   cima da borda (\`ramps.mossEdge\`/\`ramps.foliage\`, comprimento e posicao por seed — alguns tufos
   "pingam" mais fundo que outros, pra nao ler como uma fileira de laminas identicas). As 2 pecas de canto
   (externo esquerdo/direito) acrescentam uma segunda banda de sombra na lateral externa do canto, pra uma
   planta baixa com reentrancia/saliencia (como \`mirante_assembly_demo.png\` de v11 ja demonstrou) nao
   ficar com um canto "pelado" sem a sombra de contato. 3 variantes retas (seeds diferentes) evitam o
   padrao obvio de uma textura repetida numa fileira longa — mesma logica ja usada pros \`ground_variant_*\`
   desde v4.

2. **Terra batida Wang-47 noturna pintada** (\`tiles/night/grass_dirt_wang47_night_0..46.png\`, 47
   arquivos) — **mesma geometria exata** de \`forest-v11-ground/tiles/grass_dirt_wang47_*\`
   (\`blob_autotile47.js\`, nao modificado; mesmo seed por indice, entao o RUIDO/posicao de cada tufo e
   pedrinha e identico ao dia) mas **repintada do zero** com a rampa noturna (\`dn\`, ver \`palette.json\`)
   em vez de aplicar um tint uniforme em cima do PNG diurno. Isto e diferente da tecnica usada pelas copas
   em v11 (recolor pixel-a-pixel por posicao-na-rampa de um PNG ja pronto): aqui a funcao de preenchimento
   (\`dirtGrainFill\`/\`groundClumpFill\`) roda DUAS vezes, uma com \`d\` (dia) e outra com \`dn\` (noite),
   entao cada tom de pixel vem diretamente da rampa noturna, nao de uma interpolacao — e por isso que o
   coordenador pode chamar isto de "pintado": e a mesma arte, pintada 2 vezes com 2 paletas, nao 1 pintura
   com um filtro em cima.

3. **Topo do mirante noturno pintado** (\`mirante/night/mirante_top_blob_night_0..15.png\`, 16 arquivos) —
   mesma ideia do item 2: **mesma geometria blob-16** de \`forest-v11-ground/mirante_top_blob_*\`
   (\`blob_autotile16.js\`, nao modificado, mesmo bitmask de \`forest-v9-cliffs\` \`cliff_top_blob\`), mesmo
   seed por mascara (mesmas pedras/manchas de terra/wobble de borda na MESMA posicao do dia), repintado do
   zero com \`dn\` em vez de \`d\`.

4. **Paleta noturna** (\`palette.json\` \`ramps.*Night\`) — **0 hex novo**: e a MESMA formula de
   \`forest_v8_depth_palette.js\` \`buildDepthRamps()\` (os 4 multiplicadores \`GF_SAT_MUL=0.64\`,
   \`GF_VAL_MUL=0.80\`, \`RIM_SAT_MUL=0.88\`, \`RIM_VAL_MUL=0.92\`, copiados linha a linha) aplicada sobre
   \`forest_v4_palette.js\` \`GROUND_NIGHT\`/\`FOLIAGE_NIGHT\` em vez de \`GROUND_DAY\`/\`FOLIAGE_DAY\` — a
   MESMA rampa noturna azul-violeta ja hand-picked e usada pela noite "pintada" original de forest-v4
   (a mesma familia que \`NIGHT_FOLIAGE\` de \`forest-v11-ground\` ja usou pras copas), so que aqui aplicada
   na base ANTES de desenhar (pintura), nao depois (recolor).

5. **Prancha de prova dia/noite, escala de jogo** (\`before_after_20x12.png\`) — um mirante 10x6 (planta
   com reentrancia simetrica nos 2 cantos da frente, mesma convencao de \`mirante_assembly_demo.png\` de
   v11) montado 2 vezes, dia e noite, 1:1 (32px por tile, SEM zoom — a prova e exatamente a escala que
   aparece no jogo): fileira norte com o lip novo (reta + os 2 cantos), miolo com \`mirante_top_blob_*\` JA
   APROVADO de \`forest-v11-ground\` (lido do disco via \`pngToCanvas\`, nao redesenhado — zero risco de
   divergencia do topo ja aceito), 2 manchas de terra batida Wang-47 pintada espalhadas no chao ao redor,
   e a face/rampa/cantos REAIS de \`forest-v9-cliffs\` por baixo (tambem lidos do disco). \`preview.png\`
   mostra as pecas isoladas (lip dia/noite, Wang-47 noturno, mirante noturno) em 2x; \`tileability_check.png\`
   repete \`mirante_top_blob_night_15\` (o tile totalmente fechado) 6x6 em 4x pra confirmar que a pintura
   noturna nao introduziu nenhuma costura de wrap-around nova.

## O que o game-dev precisa trocar

1. **Borda norte do mirante**: na celula do mirante cuja vizinha ao NORTE esta fora do plato (ou fora do
   mapa), trocar \`mirante_top_blob_<m>\` por um dos 5 arquivos de \`lip/\` (ou \`lip/night/\` na condicao
   noturna) — ver \`tileset.json\` \`plateauEdgeLip.placementRule\` pra regra exata de qual variante usar
   (reta vs. canto esquerdo/direito). Celulas cuja vizinha norte E plato continuam com
   \`mirante_top_blob_*\` normalmente, sem mudanca.
2. **Terra batida noturna**: onde o renderer ja resolve o indice Wang-47 (0..46) para o dia via
   \`grass_dirt_wang47_<indice>\`, na condicao noturna apontar pro MESMO indice em
   \`tiles/night/grass_dirt_wang47_night_<indice>\` — nenhuma mudanca de logica de resolucao de indice,
   so troca o arquivo de origem por condicao.
3. **Mirante noturno**: mesma troca, \`mirante_top_blob_<m>\` -> \`mirante/night/mirante_top_blob_night_<m>\`
   na condicao noturna, mesmo indice \`m\`.
4. **Colisao**: nenhuma mudanca — lip e as versoes noturnas sao puramente visuais (mesma hitbox do
   \`mirante_top_blob_*\`/\`grass_dirt_wang47_*\` de v11, que o game-dev ja define por arquivo).
5. Nenhuma integracao com \`prototype/world\` foi feita aqui — como sempre, isso e trabalho de game-dev.

## Limitacoes (autocritica)

- **O lip so cobre o lado NORTE** (o pedido do coordenador foi especificamente "borda superior"); os
  lados leste/oeste do plato (quando a planta baixa nao e um retangulo simples) continuam sem uma peca
  dedicada — hoje leem como \`mirante_top_blob_*\` normal, o que ja e aceitavel (nao e "corte reto sem
  vegetacao" como o lado norte era), mas nao tem a mesma banda de sombra/musgo do lip.
- **Canto interno (reentrancia) nao tem peca de lip propria** — \`mirante_assembly_demo.png\` de v11 ja
  mostrou que a planta baixa pode ter uma reentrancia; este pacote so cobre cantos EXTERNOS convexos
  (\`corner_outer_left\`/\`corner_outer_right\`). Uma reentrancia na fileira norte hoje cai numa das 3
  variantes \`straight_*\` (a regra de placement nao distingue), o que funciona visualmente (testado em
  \`before_after_20x12.png\`, que usa uma planta simetrica sem reentrancia na fileira norte) mas nao foi
  desenhado especificamente para esse caso.
- **3 variantes retas por seed e um numero pequeno** — numa fileira MUITO longa (>15-20 tiles seguidos)
  o padrao de repeticao ainda pode ficar perceptivel; \`ground_variant_*\` resolve isso com 10 slots + ruido
  de posicao, aqui sao so 3. Se o game-dev achar pouco, adicionar mais seeds e trivial (mesma funcao,
  so chamar \`mirantePlateauLip\` com mais seeds).
- **A terra batida/mirante noturnos foram pintados com a MESMA formula/seed do dia** — isso garante
  consistencia de posicao (um tufo que esta no canto superior-esquerdo de dia continua no mesmo lugar de
  noite), mas significa que NENHUMA composicao especifica de noite (luar vindo de outro angulo, sombras
  mais longas) foi desenhada — e literalmente o dia repintado com outra paleta, nao uma nova sessao de
  luz. Isto e intencional (o pedido foi "versao noturna pintada", nao "nova iluminacao"), documentado
  aqui pra nao ser lido como mais do que e.
- **\`before_after_20x12.png\` usa uma planta baixa simetrica e pequena (10x6)** — prova a leitura da
  borda/lip e a integracao com v9-cliffs/v11-ground, mas um mirante real de producao pode ter uma forma
  bem mais irregular, nao testada aqui (mesma ressalva ja feita por \`mirante_assembly_demo.png\` de v11).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via \`preview.png\`,
  \`before_after_20x12.png\` e \`tileability_check.png\`.
- **0 geracoes do PixelLab usadas** — saldo da conta em 0,8, aguardando aprovacao do fundador; pipeline
  100% local Canvas.js, como toda a familia v4..v11.
`;
}

module.exports = { run };
