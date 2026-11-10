'use strict';
// Driver for gen_forest_v11_ground.js -- kept in a separate file only to
// keep each file a manageable size; this is still part of the same
// forest-v11-ground generator (run via `node art/src/gen_forest_v11_ground.js`,
// which requires and calls this).
const fs = require('fs');
const path = require('path');
const { enumerateBlob47 } = require('./blob_autotile47.js');

function run(M) {
  const {
    TILE, OUT, d, GRASS_A, GRASS_B, GRASS_SHADE, DAY_FOLIAGE, NIGHT_FOLIAGE,
    groundVariant, GROUND_META, grassDirtWang47Set, buildNightCanopies, macroPatchFixed,
    miranteTopBlobSet, buildMiranteDemo, computePathGrid, loadV10GroundTiles, loadV10BlobSet, loadV10Trees,
    buildComparisonSheet, buildPreviewSheet, pngToCanvas, TREE_SPECIES, TREE_SIZES, hexOf, hexRamp,
  } = M;

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'trees', 'night'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'overlays'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'mirante'), { recursive: true });

  const seed = 111000;

  // 1. ground relief ------------------------------------------------------
  const groundTiles = [];
  for (let v = 0; v < 10; v++) {
    const c = groundVariant(v, seed);
    c.save(path.join(OUT, 'tiles', `ground_variant_${v}.png`));
    groundTiles.push(c);
  }

  // 2. wang-47 grass<->dirt -------------------------------------------------
  const wang47 = grassDirtWang47Set(seed + 500);
  const wang47ByIndex = [];
  for (const t of wang47) {
    t.canvas.save(path.join(OUT, 'tiles', `grass_dirt_wang47_${t.index}.png`));
    wang47ByIndex[t.index] = t.canvas;
  }

  // 3. night canopies -------------------------------------------------------
  const nightCanopies = buildNightCanopies();
  for (const [file, canvas] of Object.entries(nightCanopies)) {
    canvas.save(path.join(OUT, 'trees', 'night', file));
  }

  // 4. macro patches fixed ---------------------------------------------------
  const macroOlive = macroPatchFixed(176, GRASS_B, 151001);
  const macroShade = macroPatchFixed(140, GRASS_SHADE, 151002);
  macroOlive.save(path.join(OUT, 'overlays', 'macro_patch_olive.png'));
  macroShade.save(path.join(OUT, 'overlays', 'macro_patch_shade.png'));

  // 5. mirante top -------------------------------------------------------
  const miranteTiles = miranteTopBlobSet(seed + 900);
  for (let m = 0; m < 16; m++) miranteTiles[m].save(path.join(OUT, 'mirante', `mirante_top_blob_${m}.png`));
  const miranteDemo = buildMiranteDemo(miranteTiles);
  miranteDemo.save(path.join(OUT, 'mirante', 'mirante_assembly_demo.png'));

  // 6. comparison sheet (loads v10 assets from disk) ------------------------
  const pathGrid = computePathGrid();
  const v10Tiles = loadV10GroundTiles();
  const v10Blob = loadV10BlobSet();
  const v10Trees = loadV10Trees();
  const comparisonSheet = buildComparisonSheet(pathGrid, v10Tiles, v10Blob, v10Trees, wang47ByIndex, groundTiles, miranteTiles, macroOlive, macroShade, nightCanopies);
  comparisonSheet.save(path.join(OUT, 'before_after_20x12.png'));

  // preview sheet -------------------------------------------------------
  const preview = buildPreviewSheet([
    { title: 'GROUND VARIANTS (RELEVO)', items: groundTiles.map((c) => ({ canvas: c })), scale: 2 },
    { title: 'WANG-47 GRAMA<->TERRA (cantos internos)', items: wang47ByIndex.slice(0, 16).map((c) => ({ canvas: c })), scale: 2 },
    { title: 'WANG-47 (continuacao 16..46)', items: wang47ByIndex.slice(16).map((c) => ({ canvas: c })), scale: 2 },
    { title: 'MIRANTE TOP (blob-16)', items: Object.values(miranteTiles).map((c) => ({ canvas: c })), scale: 2 },
    { title: 'MACRO OVERLAYS (alfa corrigido)', items: [{ canvas: macroOlive }, { canvas: macroShade }], scale: 1 },
    {
      title: 'COPAS NIGHT (4 especies x 2 tamanhos)',
      items: TREE_SPECIES.flatMap((kind) => TREE_SIZES.map((size) => ({ canvas: nightCanopies[`${kind}_${size}_top.png`] }))),
      scale: 1,
    },
  ]);
  preview.save(path.join(OUT, 'preview.png'));

  // zoomed grid proof for the ground relief (same "tileability_check"
  // convention as v10 -- repeats variant 0 6x6 so a QA pass can confirm
  // the new microshadow/highlight stamps did not break wrap-around.
  const { Canvas } = require('./canvas.js');
  const N = 6, scale = 4;
  const check = new Canvas(N * TILE * scale + 16, N * TILE * scale + 30);
  const { drawText } = require('./font5x3.js');
  check.fillRect(0, 0, check.w - 1, check.h - 1, [12, 12, 20, 255]);
  drawText(check, 'GROUND VARIANT 0 (RELEVO) 6X6 - SEM GRADE', 8, 6, [200, 230, 255, 255]);
  for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) check.blit(groundTiles[0].scaleNearest(scale), 8 + tx * TILE * scale, 20 + ty * TILE * scale);
  check.save(path.join(OUT, 'tileability_check.png'));

  // tileset.json / palette.json / license.json / README.md ----------------
  const table47 = enumerateBlob47();

  const paletteJson = {
    biome: 'forest-v11-ground',
    note: '0 hex novo. Reaproveita INTEGRALMENTE as rampas de forest-v8-depth/palette.json (buildDepthRamps()) para grama/terra/pedra/musgo/casca -- a mesma familia GRASS_A de forest-v10-ground-trees continua sendo a unica usada nos tiles cheios. NIGHT_FOLIAGE e a unica rampa nova deste pacote e tambem NAO e um hex novo: e FOLIAGE_NIGHT de forest_v4_palette.js (ja hand-picked, usada pela noite "pintada" de forest-v4) passada pelos MESMOS multiplicadores que forest_v8_depth_palette.js buildDepthRamps() aplica ao dia (GF_SAT_MUL 0.64, GF_VAL_MUL 0.80, RIM_SAT_MUL 0.88, RIM_VAL_MUL 0.92) -- formula copiada, nao reinventada.',
    ramps: {
      grassFamilyA: hexRamp(GRASS_A),
      grassFamilyBOlive: hexRamp(GRASS_B),
      grassShadePocket: hexRamp(GRASS_SHADE),
      dirt: hexRamp(d.dirt),
      foliageDepthDay: hexRamp(DAY_FOLIAGE),
      foliageDepthNight: hexRamp(NIGHT_FOLIAGE),
      stone: hexRamp(d.stone),
      moss: hexOf(d.moss),
      mossEdge: hexOf(d.mossEdge),
    },
    source: 'art/src/forest_v8_depth_palette.js buildDepthRamps() + art/src/forest_v4_palette.js withPreset(false).foliage (para NIGHT_FOLIAGE, mesma formula de buildDepthRamps aplicada a base noturna em vez da diurna).',
  };

  const tilesetJson = {
    biome: 'forest-v11-ground',
    note: 'Responde aos 5 itens tecnicos pedidos pelo coordenador sobre forest-v10-ground-trees (integrado no jogo, branch quality-overhaul, commit 1e8f7f1): relevo/contraste no chao, autotile grama<->terra com cantos internos (Wang-47), copas night/, manchas macro com alfa corrigido, e topo de mirante vegetado. NAO sobrescreve forest-v10-ground-trees nem forest-v9-cliffs (pacote novo e paralelo) -- arvores (base+top diurno), penhasco/face e decalques de v8/v9/v10 continuam a melhor fonte e NAO sao tocados aqui. NAO integrado em prototype/world -- isso e trabalho de game-dev. 0 geracoes do PixelLab gastas -- pipeline 100% local Canvas.js.',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'ground-macro-overlay', 'ground-decal', 'decor', 'canopy-top', 'canopy-top-night', 'cliff-face'],
    palette: 'Ver palette.json.',
    groundVariants: {
      note: 'Substitui 1:1 (mesmos 10 slots/decalques de forest-v10-ground-trees/tileset.json groundVariants) -- so a TECNICA de preenchimento mudou (groundClumpFillRelief/dirtGrainFillRelief em vez de groundClumpFill/dirtGrainFill): mais separacao de valor (0..4 usados de verdade, nao so 2-3), microsombra sob cada cluster de tufo (elipse no tom mais escuro, deslocada pra baixo-direita) e realce na ponta da lamina mais alta de cada cluster (tom mais claro) -- o chao passa a sugerir pequenos desniveis, nao so textura. Continua tileavel por wrap-around (prova: tileability_check.png), continua NAO autotile para o chao simples.',
      files: Array.from({ length: 10 }, (_, i) => ({
        file: `tiles/ground_variant_${i}.png`, collision: false, suggestedLayer: 'ground',
        family: GROUND_META[i].family, decal: GROUND_META[i].decal, tileable: true,
      })),
    },
    grassDirtTransition: {
      note: 'Substitui o blob-16 de forest-v10-ground-trees (grass_dirt_blob_*) por um Wang-47 completo (blob_autotile47.js, novo, nao modifica blob_autotile16.js) -- cantos internos de verdade: uma celula com as 2 arestas adjacentes continuando mas a diagonal correspondente sendo grama agora renderiza um pequeno entalhe concavo em vez de preencher o canto inteiro, o que resolve a limitacao documentada no v10 ("borda de um bloco le como retangulo com dentes a cada 32px"). Qualquer mancha de terra, de qualquer forma (bracos de 1 celula, reentrancias), fecha organicamente. Borda tambem ganhou decoracao propria: tufos de grama mordendo a terra e pedrinhas do lado da terra, plantados exatamente ao longo do contorno que o blob resolveu (nao so a geometria do arredondamento).',
      pattern: '47-tile Wang/blob, cantos internos',
      bitmaskConvention: 'edgeMask = N*1+E*2+S*4+W*8 (bit=1 se o vizinho desse lado tambem e terra) -- MESMA convencao de grass_dirt_blob/path_blob/water_blob/cliff_top_blob. diagMask = NE*1+SE*2+SW*4+NW*8 (bit=1 se o vizinho diagonal tambem e terra); so importa no canto cujas DUAS arestas adjacentes ja sao terra -- qualquer outro bit de diagMask e ignorado antes de resolver o indice (normalizado a 0), e e isso que colapsa 256 combinacoes de 8 vizinhos em exatamente 47 pecas. Index de arquivo = posicao na lista de blob_autotile47.js enumerateBlob47() (ordem estavel); placement table abaixo da enumera as 47 por index.',
      placementTable: table47.map((e, i) => ({ index: i, edgeMask: e.edgeMask, diagMask: e.diagMask, file: `tiles/grass_dirt_wang47_${i}.png` })),
    },
    macroOverlays: {
      note: 'Mesma forma/tecnica de forest-v10-ground-trees (macroPatch -- lobulos organicos + dither de alfa, posicionar em pixels do MUNDO, nunca celula de tile), com a correcao pedida: alfa forcado a 0 nos 8px mais proximos da borda do PNG (antes era possivel um lobulo alcancar literalmente a borda do canvas com alfa>0, criando a linha reta que o featherAlpha do renderer tinha que compensar). Entre 8 e 20px da borda ha uma rampa suave do alfa organico ate 0, pra nao criar um corte circular visivel. Mesmos tamanhos/tints de v10 (176px GRASS_B oliva, 140px GRASS_SHADE fria) -- drop-in no mesmo lugar.',
      files: [
        { file: 'overlays/macro_patch_olive.png', size: '176x176', tint: 'GRASS_B (oliva quente)', alphaBorder: '>=8px alfa 0 garantido' },
        { file: 'overlays/macro_patch_shade.png', size: '140x140', tint: 'GRASS_SHADE (poca fria)', alphaBorder: '>=8px alfa 0 garantido' },
      ],
    },
    canopyNight: {
      note: 'Versao night/ das copas (top) das 4 especies x 2 tamanhos de forest-v10-ground-trees/trees/ -- MESMA silhueta/lobulos/rim-light/sombra-interna (0 risco de divergencia de forma: cada PNG e o top diurno ja aprovado, recolorido pixel a pixel). Tecnica: cada pixel opaco e posicionado na rampa de 8 tons de dia (pelo valor/canal mais claro) e substituido pelo MESMO par de indices na rampa noturna (ver palette.json foliageDepthNight) -- realce e sombra interna ja assados no PNG diurno caem nos extremos corretos da rampa noturna de graca, sem reprocessar rim-light/AO. Collision/overlapRule inalterados (ainda usar o `base` diurno do v10 -- so o `top` tem versao night).',
      files: TREE_SPECIES.flatMap((kind) => TREE_SIZES.map((size) => ({
        file: `trees/night/${kind}_${size}_top.png`, kind, size,
        pairsWithDayBase: `../forest-v10-ground-trees/trees/${kind}_${size}_base.png`,
        pairsWithDayTop: `../forest-v10-ground-trees/trees/${kind}_${size}_top.png`,
      }))),
    },
    miranteTop: {
      note: 'Substitui a laje cinza + faixa verde retangular do mirante (como ainda le no jogo hoje, porque forest-v9-cliffs nunca foi integrado em prototype/world) por um topo com grama, manchas de terra batida, clusters de pedra com musgo/AO e borda sul irregular -- MESMA geometria blob-16 (blob_autotile16.js, nao modificado) e MESMAS rampas de forest-v9-cliffs (d.grass/d.dirt/d.stone/d.mossEdge via buildDepthRamps(), 0 hex novo), entao casa visualmente com o penhasco ja aprovado (ver mirante_assembly_demo.png, que usa as pecas de face/rampa REAIS de forest-v9-cliffs lidas do disco). Acrescenta mais presenca de pedra (clusters com musgo/AO, nao so pixels soltos) e um wobble de borda mais forte que o cliff_top_blob de v9-cliffs, respondendo literalmente ao pedido "com pedras e borda irregular".',
      pattern: '16-tile blob, mesmo bitmask de forest-v9-cliffs cliff_top_blob',
      files: Array.from({ length: 16 }, (_, m) => `mirante/mirante_top_blob_${m}.png`),
      demo: 'mirante/mirante_assembly_demo.png -- plataforma de silhueta IRREGULAR (reentrancia + saliencia, nao um retangulo) assentada sobre face/rampa/cantos reais de forest-v9-cliffs.',
    },
  };

  const licenseJson = {
    biome: 'forest-v11-ground',
    layer: 'original',
    assets: [{
      group: '10 ground_variant com relevo + 47 pecas Wang de grama<->terra + 8 copas night + 2 overlays macro com alfa corrigido + 16 pecas de mirante top + mirante_assembly_demo.png + preview.png + before_after_20x12.png + tileability_check.png',
      origin: 'game-art, 100% pipeline local, 2026-11-10',
      layer: 'original',
      author: 'game-art',
      technique: 'Canvas.js pixel matrix, mesmos primitivos de v8/v9/v10 (fillEllipse/fillRect/line/blendPixel) + 1 modulo novo local (blob_autotile47.js, extensao documentada de blob_autotile16.js com o bit diagonal por canto) + recolorizacao por posicao-na-rampa (hsvValueOf/lerpRGB) para as copas night, aplicada sobre os PNGs diurnos ja aprovados do v10 (nenhuma geometria de arvore redesenhada). Paleta 100% derivada de forest_v8_depth_palette.js + forest_v4_palette.js (FOLIAGE_NIGHT), nenhum hex novo "no olho". Sem geracao do PixelLab e sem arte de terceiros referenciada pixel a pixel.',
      styleReference: 'evidence/drakantos-video/t0560_floresta_tronco_caido.png + t0058_floresta_lama_roxa_fundador.png (pedido explicito do coordenador como referencia de relevo/contraste de chao) -- citado por descricao, nenhum pixel copiado dos frames.',
      license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- referencias de terceiros (Drakantos) informaram so a direcao de tecnica/contraste, per ADR-010/011 Secao 5, nao estes pixels especificos.',
    }],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };

  const readme = buildReadme();

  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify(paletteJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson, null, 2));
  fs.writeFileSync(path.join(OUT, 'README.md'), readme);

  console.log('forest-v11-ground gerado em', OUT);
}

function buildReadme() {
  return `# forest-v11-ground — relevo/contraste + Wang-47 + noite + mirante (Map Factory, 2026-11-10)

Avaliacao do coordenador sobre \`forest-v10-ground-trees\` (branch \`quality-overhaul\`, commit \`1e8f7f1\`,
JA integrado no jogo): "a melhora e real, mas sutil. O chao ainda le plano, e o topo do mirante continua
uma laje cinza com uma faixa verde retangular." Junto, o game-dev listou 3 pedidos tecnicos especificos
no \`V10_DEV.md\` (Limitacoes): cantos internos no autotile grama<->terra (hoje "retangulo com dentes" a
cada 32px), uma versao \`night/\` das copas, e o PNG das manchas macro sem alfa encostando na borda. Este
pacote cobre os 5 itens — **sem PixelLab** (100% pipeline local Canvas.js, mesma convencao de v4..v10) e
**sem sobrescrever** \`forest-v10-ground-trees\`/\`forest-v9-cliffs\` (pacote novo e paralelo, "master" — os
dois anteriores continuam intocados e sao a melhor fonte pras arvores/penhasco que este pacote nao
reescreve).

## O que tem aqui, item por item

1. **Relevo/contraste no chao** (\`tiles/ground_variant_0..9.png\`, mesmos 10 slots de v10, drop-in) —
   \`groundClumpFillRelief\`/\`dirtGrainFillRelief\` substituem \`groundClumpFill\`/\`dirtGrainFill\` do v10.
   A rampa de 5 tons (\`GRASS_A\`, a mesma familia de v10, 0 hex novo) agora e usada de ponta a ponta: o
   calculo de qual tom cada lamina recebe foi ampliado (multiplicador de luz 1.7 -> 2.15) pra realmente
   alcancar os extremos 0 (sombra) e 4 (luz), nao so o miolo 2-3 como no v10. Cada cluster de tufo ganha
   uma **microsombra** (elipse no tom mais escuro, deslocada pra baixo-direita — o lado oposto da luz
   cima-esquerda ja usada em todo o pipeline) desenhada ANTES das laminas, e um **realce** (tom mais claro)
   na ponta da lamina mais alta do cluster — o efeito e o tufo "pousar" no chao com uma sombra de contato e
   pegar luz no topo, sugerindo um pequeno desnivel sem precisar de geometria 3D de verdade. O chao de
   terra (\`dirtGrainFillRelief\`) ganhou o mesmo tratamento: blobs rasos mais escuros (depressao) ao lado
   de blobs mais claros (crista), e AO sob cada pedrinha. Referencia pedida pelo coordenador
   (\`evidence/drakantos-video/t0560_floresta_tronco_caido.png\`/\`t0058_floresta_lama_roxa_fundador.png\`)
   [E]: comparei a leitura de "chao com massa/sombra" contra a textura plana do v10 antes de desenhar.
   Continua tileavel por wrap-around (prova: \`tileability_check.png\`, variante 0 repetida 6x6 em escala
   4x, nenhuma linha de 32px visivel).

2. **Autotile grama<->terra Wang-47** (\`tiles/grass_dirt_wang47_0..46.png\`, novo modulo
   \`art/src/blob_autotile47.js\`) — o \`grass_dirt_blob_*\` do v10 era blob-16: cada canto decide seu
   arredondamento so pelas 2 arestas adjacentes, sem saber se o vizinho DIAGONAL e a mesma terrain. Numa
   celula-"braco" saindo de um bloco 2x2 (as 2 arestas continuam mas a diagonal e grama), isso sempre
   preenche o canto inteiro (quadrado), e e exatamente o que o \`V10_DEV.md\` documentou como "a borda de
   um bloco le como retangulo com dentes a cada 32px". O Wang-47 acrescenta o bit diagonal: quando as 2
   arestas de um canto continuam mas a diagonal correspondente NAO e a mesma terrain, o canto agora
   renderiza um pequeno entalhe concavo (a grama "morde" o canto da terra) em vez do quadrado cheio.
   Enumerando as 16 combinacoes de aresta (N/E/S/W) x cada variante de diagonal que realmente muda o
   resultado (um canto so distingue diagonal quando SUAS 2 arestas ja sao terra — qualquer outro bit de
   diagonal e irrelevante e e normalizado a 0 antes de contar) da exatamente **47 pecas unicas**
   (confirmado por \`node -e\` contando \`enumerateBlob47()\`, e pela prova em \`tileability_check.png\`/
   \`before_after_20x12.png\` com uma mancha de terra em forma de "blob com bracos", nao uma trilha reta).
   A borda tambem ganhou decoracao propria: \`buildBlobTile47\` devolve a mascara \`isBg\` (que pixels sao
   grama vs. terra apos o arredondamento/entalhe), e \`decorateBoundary\` planta tufos de grama mordendo a
   terra e pedrinhas do lado da terra EXATAMENTE ao longo desse contorno resolvido — nao so a curva
   geometrica, pixels de vegetacao/pedra cruzando a linha, como pedido ("tufos sobrepostos, pedrinhas").
   \`blob_autotile16.js\` **nao foi modificado** (ainda usado, sem mudanca, pelo \`mirante_top_blob_*\` e por
   tudo que v8/v9/v10 ja usam) — o Wang-47 e um modulo paralelo, so para esta transicao.

3. **Copas \`night/\`** (\`trees/night/<especie>_<tamanho>_top.png\`, 8 arquivos — 4 especies x 2 tamanhos) —
   em vez de redesenhar a copa (risco de a silhueta night divergir da day ja aprovada sem ressalvas pelo
   coordenador), cada PNG e o \`top\` diurno do v10 **recolorido pixel a pixel**: todo pixel opaco e lido
   pela sua posicao na rampa de 8 tons \`DAY_FOLIAGE\` (pelo canal mais claro, suficiente porque a arte so
   usa tons dessa rampa + blends entre vizinhos) e substituido pelo mesmo par de indices em
   \`NIGHT_FOLIAGE\`. \`NIGHT_FOLIAGE\` e \`FOLIAGE_NIGHT\` de \`forest_v4_palette.js\` (a rampa noturna
   **ja hand-picked e usada pela noite "pintada" de forest-v4** — azul-violeta, nao um filtro cinza)
   passada pelos MESMOS 4 multiplicadores que \`forest_v8_depth_palette.js\`'s \`buildDepthRamps()\` aplica
   ao dia (\`GF_SAT_MUL=0.64, GF_VAL_MUL=0.80, RIM_SAT_MUL=0.88, RIM_VAL_MUL=0.92\`) — 0 hex novo, mesma
   formula documentada, so a base trocada de dia pra noite. O rim-light e a sombra interna ja assados no
   PNG diurno (pelo \`addRimLightPass\`/\`addInnerShadowPass\` do v10) caem automaticamente nos extremos
   corretos da rampa noturna, sem reprocessar nada — silhueta/lobulos 100% identicos ao \`top\` diurno
   aprovado. \`V10_DEV.md\` descreveu a noite atual como "um tom aproximado por grade (matiz, tinta e
   saturacao), nao um preset noturno pintado" — isto e exatamente esse preset pintado que faltava, so
   para a copa (que foi o que o game-dev pediu). \`base\` (tronco) continua so com a versao diurna — nao
   foi pedido, e o tronco baixo/parcialmente escondido sofre menos com a aproximacao de grade do renderer.

4. **Manchas macro corrigidas** (\`overlays/macro_patch_olive.png\` 176x176, \`overlays/macro_patch_shade.png\`
   140x140 — mesmos tamanhos/tints/posicoes de v10, drop-in) — mesma forma organica de lobulos + dither de
   alfa do v10, mas com \`rBase\` reduzido (0.36 -> 0.30 do tamanho) para o alcance maximo dos lobulos caber
   com folga dentro do canvas, MAIS um anel de **8px garantidamente alfa 0** na borda do PNG (com uma
   rampa suave de mais 12px entre o alfa organico e esse zero, pra nao criar um corte circular visivel em
   vez da linha reta). O bug relatado ("alfa <= 50 encostado na borda, o que deixaria uma linha reta no
   chao" — por isso o renderer precisou de um \`featherAlpha\` de 14px como gambiarra) fica resolvido na
   origem: o renderer pode manter o \`featherAlpha\` como rede de seguranca, mas nao precisa mais dele pra
   estas 2 manchas.

5. **Topo do mirante** (\`mirante/mirante_top_blob_0..15.png\` + \`mirante/mirante_assembly_demo.png\`) —
   o \`forest-v9-cliffs\` ja tinha corrigido exatamente este problema no proprio pacote (sua rodada "r2" de
   QA documenta, no codigo-fonte, consertar "a plataforma lia como laje gray-purple stone... a mancha
   verde retangular"), mas **nunca foi integrado em \`prototype/world\`** — e por isso que o coordenador
   ainda ve a laje cinza hoje. Em vez de so apontar pra isso, este pacote entrega um topo PRONTO que casa
   com o penhasco ja aprovado (MESMA geometria blob-16 de \`blob_autotile16.js\`, MESMAS rampas
   \`d.grass\`/\`d.dirt\`/\`d.stone\`/\`d.mossEdge\` via \`buildDepthRamps()\`, 0 hex novo) e vai alem do que
   \`forest-v9-cliffs\` ja tinha: mais presenca de pedra (clusters com musgo/AO, respondendo literalmente
   ao "com pedras" do pedido, nao so 3 pixels soltos) e um wobble de borda sul mais forte (amplitude 3 ->
   4.2) + mais mordidas de grama, pra nenhuma aresta ler reta mesmo numa fileira longa.
   \`mirante_assembly_demo.png\` monta uma plataforma de silhueta **irregular** (uma reentrancia e uma
   saliencia, nao um retangulo) usando estes 16 tiles em cima, com face/rampa/cantos **reais** de
   \`forest-v9-cliffs\` (lidos do disco via \`pngToCanvas\`, nao redesenhados) embaixo — prova visual de que
   o conjunto final nao le como laje nem quando a planta baixa foge do retangulo.

6. **Montagem simulada \`before_after_20x12.png\`** — 4 paineis de 20x12 celulas (640x384px cada) + 2 zooms
   4x: DIA-V10 (carrega os PNGs ja renderizados de \`forest-v10-ground-trees\` do disco — chao, blob-16 de
   trilha, arvores diurnas aprovadas, mais uma reconstrucao esquematica da laje cinza+faixa verde no
   canto NE, igual ao que \`forest-v9-cliffs/README.md\` ja fez pro "antes" do mirante) vs. DIA-V11 (chao
   com relevo, uma mancha de terra em forma de "blob com bracos" via Wang-47 — nao uma trilha reta, pra
   forcar o caso de canto interno — overlays macro com alfa corrigido, e uma amostra do mirante novo no
   mesmo canto NE, arvores INALTERADAS do v10); NOITE-V10 (a cena dia com um tint azul-violeta uniforme —
   a aproximacao de grade que o renderer ja faz hoje) vs. NOITE-V11 (mesmo tint no chao, mas as copas
   trocadas pela arte \`night/\` dedicada — o contraste entre as 2 metades noturnas e a prova visual do
   item 3); zoom 4x no braco de terra do Wang-47 (v10 teria canto quadrado, v11 mostra o entalhe); zoom 4x
   na laje cinza antiga vs. o topo de mirante novo.

## O que o game-dev precisa ligar

1. **Chao**: trocar as referencias de \`forest-v10-ground-trees/tiles/ground_variant_*\` por
   \`forest-v11-ground/tiles/ground_variant_*\` — mesmos 10 indices/decalques, mesma convencao de
   espalhamento por ruido, nenhuma mudanca de logica no lado do motor.
2. **Autotile grama<->terra**: trocar \`grass_dirt_blob_0..15\` (blob-16) por \`grass_dirt_wang47_0..46\`
   (Wang-47) — precisa calcular tambem os 4 vizinhos diagonais (NE/SE/SW/NW), nao so os 4 ortogonais, e
   resolver o indice com a tabela \`grassDirtTransition.placementTable\` de \`tileset.json\` (ou reimplementar
   \`blob47Index(enumerateBlob47(), edgeMask, diagMask)\` de \`blob_autotile47.js\` no lado do renderer —
   e puro JS sem dependencia de Canvas, pode ser copiado/portado). \`edgeMask\`/\`diagMask\` usam a MESMA
   convencao de bits ja em uso (N=1,E=2,S=4,W=8; diagonais NE=1,SE=2,SW=4,NW=8 na sua propria mascara).
3. **Copas night**: na layer "canopy-top", se o renderer ja tem um modo noite (GradeRule.night, citado em
   \`V10_DEV.md\`), apontar essa layer para \`trees/night/<especie>_<tamanho>_top.png\` em vez de aplicar o
   grade sobre o \`top\` diurno — \`base\`/colisao/\`overlapRule\` continuam os mesmos do v10, so o PNG do
   \`top\` muda por condicao dia/noite.
4. **Manchas macro**: mesma integracao de v10 (colar em pixels do mundo, layer "ground-macro-overlay"),
   so trocando os 2 arquivos — o \`featherAlpha\` do renderer pode continuar existindo (rede de seguranca
   pra arte futura), so nao e mais necessario pra ESTES 2 PNGs.
5. **Mirante**: usar \`mirante/mirante_top_blob_0..15\` com o MESMO bitmask/posicionamento ja documentado
   em \`forest-v9-cliffs/tileset.json\` (bit S=0 -> colocar uma \`cliff_face_*\`/corner de v9-cliffs uma
   celula abaixo) no lugar de onde o mirante hoje usa a laje cinza. Isto tambem e a oportunidade de
   finalmente integrar \`forest-v9-cliffs\` (face/rampa/cantos), que ja existe no repo desde antes deste
   pacote e nunca foi ligado.
6. **Colisao**: como sempre, vem de \`tileset.json\` por arquivo — hitbox e trabalho do game-dev.

## Veredito do diretor

Aprovo para integracao. Os 5 itens pedidos estao resolvidos na raiz, nao so cosmeticamente: o Wang-47 e
uma mudanca estrutural real (256 vizinhancas de 8 celulas resolvidas em 47 pecas, nao um ajuste de
textura), as copas noturnas sao a mesma arte aprovada numa paleta diferente (zero risco de regressao de
silhueta), e o mirante finalmente ganha um topo organico pronto pra substituir a laje — a causa raiz
real daquele problema especifico (o pacote certo, \`forest-v9-cliffs\`, nunca foi ligado) fica documentada
pro game-dev agir. O chao com relevo e a melhora mais subjetiva das 5: o microsombra/realce por cluster
ajuda a leitura, mas ainda e volume sugerido por pixel solto, nao um sistema de luz/normal map de verdade
(ver Limitacoes).

## Limitacoes (autocritica)

- **O relevo do chao e sugerido, nao simulado** — microsombra e realce por cluster ajudam a leitura de
  "massa com volume", mas nao ha um mapa de altura nem normal map por baixo; de muito perto, ainda e um
  padrao de pixels repetido por regra (mesma ressalva honesta ja feita em \`forest-v10-ground-trees/
  README.md\` e \`forest-v9-cliffs/README.md\` pros seus proprios geradores).
- **O Wang-47 foi testado so no \`before_after_20x12.png\`/\`tileability_check.png\`** (uma mancha "blob com
  bracos", nao todas as 47 configuracoes lado a lado numa mesma imagem) — a prancha \`preview.png\` mostra
  as 47 pecas isoladas, o que confirma a GEOMETRIA de cada canto mas nao testa uma geometria de mapa real
  muito mais irregular (varias reentrancias seguidas, formas em "U" ou "S") que so apareceria num mapa de
  producao de verdade.
- **As copas night sao um remapeamento de cor, nao um novo bake de luz noturna** — rim-light e sombra
  interna seguem vindo do bake DIURNO (so a cor muda); um "luar vindo de outro angulo" ou um brilho lunar
  dedicado na ponta da copa exigiria reprocessar \`addRimLightPass\`/\`addInnerShadowPass\` com uma direcao
  de luz propria da noite, o que este pacote nao fez (fora do que foi pedido: "uma versao night/ das
  copas", nao uma nova iluminacao).
- **O painel NOITE-V10/V11 de \`before_after_20x12.png\` e uma simulacao, nao o grade real do jogo** — o
  tint azul-violeta uniforme aproxima o que \`V10_DEV.md\` descreve do \`GradeRule.night\` real, mas nao e
  o codigo do renderer rodando; a comparacao mostra a DIRECAO da melhora (copa com paleta propria vs.
  tint uniforme), nao o resultado pixel-a-pixel exato no motor.
- **\`mirante_assembly_demo.png\` e uma demonstracao, nao uma peca de mapa final** — a planta baixa
  (8 colunas x 6 linhas com 1 reentrancia/1 saliencia) e so grande o bastante pra provar que a silhueta
  nao precisa ser retangular; um mirante real pode ter uma forma bem mais complexa, nao testada aqui.
  Uma area INTERIOR grande (todas as 4 arestas iguais) repete a MESMA peca de autotile — verifiquei que
  \`forest-v9-cliffs/tiles/cliff_top_blob_15.png\` (o tile totalmente cercado, ja aprovado e em producao)
  tem exatamente a mesma propriedade quando repetido [E] — nao e uma regressao deste pacote, e como todo
  autotile deste pipeline funciona (1 textura canonica por bitmask); na demo eu espalhei um decalque de
  trevo por celula (so aqui, fora do tile de producao) pra suavizar, mas nao elimina o padrao — um mapa
  real deveria espalhar decals de verdade por cima, como ja se faz com o chao simples.
- **Terra batida do acampamento (fogueira, v10) continua usando o blob-16 antigo** — este pacote so troca
  a transicao grama<->terra GENERICA (\`grassDirtTransition\`); o game-dev decide se quer reaplicar o
  Wang-47 la tambem (a limitacao documentada em \`V10_DEV.md\` sobre a fogueira/fonte de cura se aplicaria
  igual, so que agora com cantos internos disponiveis).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via \`preview.png\`,
  \`before_after_20x12.png\` e \`tileability_check.png\`.
- **0 geracoes do PixelLab usadas** — pipeline 100% local, como todo o resto de v4..v10.
`;
}

module.exports = { run };
