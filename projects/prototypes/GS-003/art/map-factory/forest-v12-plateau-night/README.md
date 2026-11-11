# forest-v12-plateau-night — borda do plato + noite pintada + variedade de copa (Map Factory, 2026-11-10)

Pacote **NOVO e paralelo** a `forest-v11-ground` (integrado no jogo, branch `quality-overhaul`,
commit `bf2b4ca`, relatorio `quality-overhaul/phase3/v11/V11_DEV.md`) — `forest-v11-ground` **nao e
sobrescrito nem modificado**. Cobre as 2 pendencias de arte deixadas no relatorio do v11 (secao
Limitacoes/pedido do coordenador):

1. a **borda superior (norte) do plato do mirante** — hoje o topo simplesmente corta no ultimo tile de
   grama, sem nenhuma transicao (o penhasco/face de `forest-v9-cliffs` so cobre o lado SUL, visivel pro
   jogador; o lado norte, mais distante da camera, fica sem decoracao nenhuma);
2. uma versao **noturna PINTADA** (nao so o tint uniforme de `GradeRule.night` que o renderer ja aplica
   hoje) da **terra batida Wang-47** e do **topo do mirante** — `forest-v11-ground` ja tinha entregue uma
   noite pintada para as COPAS (recolor pixel-a-pixel do PNG diurno); este pacote faz o equivalente para
   terra e mirante, mas com uma tecnica diferente (ver item 2 abaixo) porque o pedido era especificamente
   por isso.

## O que tem aqui, item por item

1. **Lip da borda superior do plato** (`lip/mirante_top_edge_straight_0..2.png` +
   `lip/mirante_top_edge_corner_outer_left.png` + `..._corner_outer_right.png`, dia; mesmos 5 arquivos em
   `lip/night/` com sufixo `_night_`) — cada arquivo e um tile 32x32 COMPLETO, drop-in no lugar de
   `mirante_top_blob_*` na fileira do mirante cuja celula ao norte esta fora do plato: o chao de grama por
   baixo e a MESMA textura de preenchimento do mirante top (`groundClumpFill`, 0 geometria nova), e por
   cima, nos 10px superiores do tile, uma banda de sombra de contato (gradiente de alfa sobre preto quase
   puro, mais forte junto a borda, dissolvendo pro verde) MAIS tufos verticais de musgo/grama caindo por
   cima da borda (`ramps.mossEdge`/`ramps.foliage`, comprimento e posicao por seed — alguns tufos
   "pingam" mais fundo que outros, pra nao ler como uma fileira de laminas identicas). As 2 pecas de canto
   (externo esquerdo/direito) acrescentam uma segunda banda de sombra na lateral externa do canto, pra uma
   planta baixa com reentrancia/saliencia (como `mirante_assembly_demo.png` de v11 ja demonstrou) nao
   ficar com um canto "pelado" sem a sombra de contato. 3 variantes retas (seeds diferentes) evitam o
   padrao obvio de uma textura repetida numa fileira longa — mesma logica ja usada pros `ground_variant_*`
   desde v4.

2. **Terra batida Wang-47 noturna pintada** (`tiles/night/grass_dirt_wang47_night_0..46.png`, 47
   arquivos) — **mesma geometria exata** de `forest-v11-ground/tiles/grass_dirt_wang47_*`
   (`blob_autotile47.js`, nao modificado; mesmo seed por indice, entao o RUIDO/posicao de cada tufo e
   pedrinha e identico ao dia) mas **repintada do zero** com a rampa noturna (`dn`, ver `palette.json`)
   em vez de aplicar um tint uniforme em cima do PNG diurno. Isto e diferente da tecnica usada pelas copas
   em v11 (recolor pixel-a-pixel por posicao-na-rampa de um PNG ja pronto): aqui a funcao de preenchimento
   (`dirtGrainFill`/`groundClumpFill`) roda DUAS vezes, uma com `d` (dia) e outra com `dn` (noite),
   entao cada tom de pixel vem diretamente da rampa noturna, nao de uma interpolacao — e por isso que o
   coordenador pode chamar isto de "pintado": e a mesma arte, pintada 2 vezes com 2 paletas, nao 1 pintura
   com um filtro em cima.

3. **Topo do mirante noturno pintado** (`mirante/night/mirante_top_blob_night_0..15.png`, 16 arquivos) —
   mesma ideia do item 2: **mesma geometria blob-16** de `forest-v11-ground/mirante_top_blob_*`
   (`blob_autotile16.js`, nao modificado, mesmo bitmask de `forest-v9-cliffs` `cliff_top_blob`), mesmo
   seed por mascara (mesmas pedras/manchas de terra/wobble de borda na MESMA posicao do dia), repintado do
   zero com `dn` em vez de `d`.

4. **Paleta noturna** (`palette.json` `ramps.*Night`) — **0 hex novo**: e a MESMA formula de
   `forest_v8_depth_palette.js` `buildDepthRamps()` (os 4 multiplicadores `GF_SAT_MUL=0.64`,
   `GF_VAL_MUL=0.80`, `RIM_SAT_MUL=0.88`, `RIM_VAL_MUL=0.92`, copiados linha a linha) aplicada sobre
   `forest_v4_palette.js` `GROUND_NIGHT`/`FOLIAGE_NIGHT` em vez de `GROUND_DAY`/`FOLIAGE_DAY` — a
   MESMA rampa noturna azul-violeta ja hand-picked e usada pela noite "pintada" original de forest-v4
   (a mesma familia que `NIGHT_FOLIAGE` de `forest-v11-ground` ja usou pras copas), so que aqui aplicada
   na base ANTES de desenhar (pintura), nao depois (recolor).

5. **Prancha de prova dia/noite, escala de jogo** (`before_after_20x12.png`) — um mirante 10x6 (planta
   com reentrancia simetrica nos 2 cantos da frente, mesma convencao de `mirante_assembly_demo.png` de
   v11) montado 2 vezes, dia e noite, 1:1 (32px por tile, SEM zoom — a prova e exatamente a escala que
   aparece no jogo): fileira norte com o lip novo (reta + os 2 cantos), miolo com `mirante_top_blob_*` JA
   APROVADO de `forest-v11-ground` (lido do disco via `pngToCanvas`, nao redesenhado — zero risco de
   divergencia do topo ja aceito), 2 manchas de terra batida Wang-47 pintada espalhadas no chao ao redor,
   e a face/rampa/cantos REAIS de `forest-v9-cliffs` por baixo (tambem lidos do disco). `preview.png`
   mostra as pecas isoladas (lip dia/noite, Wang-47 noturno, mirante noturno) em 2x; `tileability_check.png`
   repete `mirante_top_blob_night_15` (o tile totalmente fechado) 6x6 em 4x pra confirmar que a pintura
   noturna nao introduziu nenhuma costura de wrap-around nova.

## O que o game-dev precisa trocar

1. **Borda norte do mirante**: na celula do mirante cuja vizinha ao NORTE esta fora do plato (ou fora do
   mapa), trocar `mirante_top_blob_<m>` por um dos 5 arquivos de `lip/` (ou `lip/night/` na condicao
   noturna) — ver `tileset.json` `plateauEdgeLip.placementRule` pra regra exata de qual variante usar
   (reta vs. canto esquerdo/direito). Celulas cuja vizinha norte E plato continuam com
   `mirante_top_blob_*` normalmente, sem mudanca.
2. **Terra batida noturna**: onde o renderer ja resolve o indice Wang-47 (0..46) para o dia via
   `grass_dirt_wang47_<indice>`, na condicao noturna apontar pro MESMO indice em
   `tiles/night/grass_dirt_wang47_night_<indice>` — nenhuma mudanca de logica de resolucao de indice,
   so troca o arquivo de origem por condicao.
3. **Mirante noturno**: mesma troca, `mirante_top_blob_<m>` -> `mirante/night/mirante_top_blob_night_<m>`
   na condicao noturna, mesmo indice `m`.
4. **Colisao**: nenhuma mudanca — lip e as versoes noturnas sao puramente visuais (mesma hitbox do
   `mirante_top_blob_*`/`grass_dirt_wang47_*` de v11, que o game-dev ja define por arquivo).
5. Nenhuma integracao com `prototype/world` foi feita aqui — como sempre, isso e trabalho de game-dev.

## 6. Variedade de copa na borda da mata (`canopy-edge-variety/`)

QA (`quality-overhaul/phase3/qa/QA_V11_WORLDMAP.md`, achado P2): "nas bordas da mata (faixas densas de
arvore nas laterais do mapa) a disposicao le como fileiras bastante regulares, espacamento repetitivo —
menos organico que o aglomerado central do mapa". As 8 copas (4 especies x 2 tamanhos) de
`forest-v10-ground-trees`/`forest-v11-ground` ja existiam, mas numa fileira reta e longa (a borda do
mapa, nao o aglomerado central que tem posicionamento mais livre) o gerador cicla por elas em sequencia
e o padrao de 8 silhuetas fica perceptivel.

`canopy-edge-variety/flip/<especie>_<tamanho>_top_flip.png` (dia, 8 arquivos) e `flip/night/..._flip.png`
(noite, 8 arquivos) — espelho horizontal pixel-a-pixel (`pngw.load_png`, sem redesenhar nada) de cada
copa ja aprovada. `canopy-edge-variety/tone/<especie>_<tamanho>_top_tone_{dark,light}.png` (dia, 16
arquivos) e `tone/night/..._tone_{dark,light}.png` (noite, 16 arquivos) — a MESMA copa com um leve ajuste
de valor (`shade(-0.08)`/`shade(+0.06)`, a mesma funcao de sombreamento de todo o pipeline v4..v11, 0 hex
novo), simulando uma copa mais ou menos exposta ao sol, sem mudar silhueta. `edge_row_proof_16x2.png`
mostra uma fileira de 16 celulas (8 especies originais + as mesmas 8 espelhadas) dia em cima/noite
embaixo — confirma visualmente que a assimetria de cada copa (galho pendendo mais pra um lado etc.) fica
claramente diferente entre o original e o flip, nao e so um "clone invisivel".

**Regra de distribuicao** (para o game-dev aplicar na fileira de borda, documentada aqui porque o pedido
do coordenador aceitava "variacoes OU regra de distribuicao documentada"): para cada celula de copa na
fileira de borda, construir uma chave `(especie_tamanho, flip, tom)` com `flip` em `{normal, flip}` e
`tom` em `{normal, dark, light}` — 48 combinacoes por condicao dia/noite (8 x 2 x 3) para as MESMAS 8
silhuetas. Percorrer a fileira usando um ciclo embaralhado uma vez por mapa (ex. `seed` fixo do mapa +
indice da celula, Fisher-Yates ou so `shuffle(list(range(48)), seed)`) em vez de um modulo sequencial
simples — isso garante que nenhuma combinacao se repete antes de todas as 48 serem usadas, e que duas
celulas vizinhas quase nunca caem na mesma combinacao (diferente de `especie = indice % 8`, que repete a
cada 8 celulas exatas). Nenhuma arvore NOVA foi desenhada; isto so multiplica o que ja existe.

## Limitacoes (autocritica)

- **O lip so cobre o lado NORTE** (o pedido do coordenador foi especificamente "borda superior"); os
  lados leste/oeste do plato (quando a planta baixa nao e um retangulo simples) continuam sem uma peca
  dedicada — hoje leem como `mirante_top_blob_*` normal, o que ja e aceitavel (nao e "corte reto sem
  vegetacao" como o lado norte era), mas nao tem a mesma banda de sombra/musgo do lip.
- **Canto interno (reentrancia) nao tem peca de lip propria** — `mirante_assembly_demo.png` de v11 ja
  mostrou que a planta baixa pode ter uma reentrancia; este pacote so cobre cantos EXTERNOS convexos
  (`corner_outer_left`/`corner_outer_right`). Uma reentrancia na fileira norte hoje cai numa das 3
  variantes `straight_*` (a regra de placement nao distingue), o que funciona visualmente (testado em
  `before_after_20x12.png`, que usa uma planta simetrica sem reentrancia na fileira norte) mas nao foi
  desenhado especificamente para esse caso.
- **3 variantes retas por seed e um numero pequeno** — numa fileira MUITO longa (>15-20 tiles seguidos)
  o padrao de repeticao ainda pode ficar perceptivel; `ground_variant_*` resolve isso com 10 slots + ruido
  de posicao, aqui sao so 3. Se o game-dev achar pouco, adicionar mais seeds e trivial (mesma funcao,
  so chamar `mirantePlateauLip` com mais seeds).
- **A terra batida/mirante noturnos foram pintados com a MESMA formula/seed do dia** — isso garante
  consistencia de posicao (um tufo que esta no canto superior-esquerdo de dia continua no mesmo lugar de
  noite), mas significa que NENHUMA composicao especifica de noite (luar vindo de outro angulo, sombras
  mais longas) foi desenhada — e literalmente o dia repintado com outra paleta, nao uma nova sessao de
  luz. Isto e intencional (o pedido foi "versao noturna pintada", nao "nova iluminacao"), documentado
  aqui pra nao ser lido como mais do que e.
- **`before_after_20x12.png` usa uma planta baixa simetrica e pequena (10x6)** — prova a leitura da
  borda/lip e a integracao com v9-cliffs/v11-ground, mas um mirante real de producao pode ter uma forma
  bem mais irregular, nao testada aqui (mesma ressalva ja feita por `mirante_assembly_demo.png` de v11).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via `preview.png`,
  `before_after_20x12.png` e `tileability_check.png`.
- **A variedade de copa (`canopy-edge-variety/`) e so flip + tom, nao silhueta nova** — continuam sendo
  as mesmas 8 formas (4 especies x 2 tamanhos); a leitura "mesma arvore" some perto (galho assimetrico
  visivelmente invertido no flip), mas de muito longe (zoom geral do mapa) uma fileira muito longa (>48
  celulas) comeca a repetir combinacoes de novo — 48 nao e infinito, so bem maior que 8.
- **A regra de distribuicao e documentada, nao implementada** — nenhum codigo de jogo foi tocado; o
  game-dev decide se/como aplicar o ciclo embaralhado na fileira de borda.
- **`edge_row_proof_16x2.png` so mostra originais vs. flip, nao os tons** — as 32 variantes de tom
  (`tone/`) foram inspecionadas isoladamente (abertura de cada PNG), nao numa fileira montada.
- **0 geracoes do PixelLab usadas** — saldo da conta em 0,8, aguardando aprovacao do fundador; pipeline
  100% local Canvas.js/Python (`pngw.py`), como toda a familia v4..v11.
