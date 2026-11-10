# forest-v10-ground-trees — chao e arvores mais fortes (Map Factory, 2026-11-10)

Feedback do fundador sobre a clareira v9 (branch `quality-overhaul`, capturas em
`quality-overhaul/phase3/img/p7_clareira_depois_v9p7_*_r2.png`): "o mapa esta bem melhor, mas o chao esta
estranho, parece 'fraco', e as arvores tambem. As movimentacoes ficaram legais." Este pacote responde so
ao chao e as arvores -- nao mexe em penhasco, props emissores, clutter, NPCs, autotile de trilha/agua nem
nada mais de `forest-v8-depth`/`forest-v9-cliffs` (nenhum dos dois e sobrescrito; este e um pacote NOVO
e paralelo, "master"). **100% pipeline local** (Canvas.js, mesma convencao de v4/v6/v7/v8/v9): **0
geracoes do PixelLab gastas** -- o saldo da conta (0,8, quase zerado) nao foi usado, nenhuma chamada de
API foi feita.

## Diagnostico (antes de desenhar qualquer coisa)

Inspecionei `p7_clareira_depois_v9p7_dia_geral_r2.png`/`_dia_r2.png` e o codigo-fonte que os gerou
(`art/src/gen_forest_v8_depth.js`, reaproveitado verbatim por `gen_forest_v9_cliffs.js`):

1. **Chao**: `groundBase()` enche o tile com 1 cor solida + 5 elipses de "mancha" + 40 **pixels isolados**
   (1-2px cada, sem clusters) -- e o `groundVariant()` aplica `stampCrack()` (rabisco fino na cor
   `d.cliffFace.core`, quase preto) em variantes de GRAMA tambem, nao so terra. E literalmente a
   "rachadura preta fina repetida + pontinhos" que o fundador viu -- confirmei pixel a pixel na captura.
2. **Arvores**: `forest_v4_props.js` ja tem um bom primitivo (`paintCanopyPuffs`, leaf-puffs em vez de
   elipse lisa), mas cada `treeXxx()` chama ele **uma unica vez** com um (rx,ry) so -- um ovoide so.
   Visto de cima (camera do jogo), isso le como "um blob redondo", e o tronco fino quase nunca aparece
   sob a copa alargada.

Comparei contra `evidence/drakantos-video/t0058_floresta_lama_roxa_fundador.png` e
`t0560_floresta_tronco_caido.png` [E]: la o chao tem manchas GRANDES e macias (nao pontos), moitas com
silhueta serrilhada em 3-4 valores com AO forte entre clumps, e os troncos/raizes sao grossos e visiveis
mesmo sob a copa.

## Correcao rodada 2 (revisao do coordenador sobre o commit `fc34af2`)

As **arvores foram aprovadas sem ressalvas** ("troncos, raizes, lobulos e luz ficaram otimos") -- o
codigo de arvore desta rodada (`paintTrunkThick`, `paintCanopyVolume`, `SPECIES`, `buildTree`,
`standingComposite`) **nao foi tocado**; os 16 PNGs de `trees/` saem bit-a-bit identicos ao commit
aprovado (conferido com `git diff --stat`, sem saida).

O **chao reprovou**: a `before_after_20x12.png` da v1 mostrava um XADREZ de quadrados de 32px, porque
(a) as 12 variantes v1 alternavam 3 familias de tom diferente (GRASS_A/GRASS_B/GRASS_SHADE) **por
celula**, cada familia com um tom medio proprio, e (b) os clusters de `groundClumpFill` v1 evitavam uma
faixa de 4px perto da borda do tile (`cx = 4 + rnd()*(TILE-8)`), entao toda variante tinha um "anel"
mais quieto que a textura interna -- tiles vizinhos nunca casavam nessa faixa. Isso e exatamente o que
GS-008 probe. Tres mudancas de tecnica, nenhuma geracao gasta:

1. **Base tileavel por wrap-around**: `clumpBlades`/`groundClumpFill`/`dirtGrainFill` agora desenham
   cada cluster/blotch 9 VEZES, nas posicoes `(cx+ox, cy+oy)` pra `ox,oy em {-TILE,0,+TILE}`
   (`forEachWrap`) -- como `Canvas.setPixel`/`line`/`blendPixel` ja descartam de graca qualquer
   coordenada fora do canvas, as 8 copias extras so fazem alguma coisa quando o stamp original esta perto
   de uma borda, e ai pintam a "sombra" que faltava do lado oposto. Nenhum algoritmo de costura novo --
   e o mesmo truque que faz uma textura de ruido repetir sem emenda. Prova: `tileability_check.png`,
   a MESMA variante repetida 6x6 em escala 4x, sem nenhuma linha de grade visivel.
2. **Mesma familia, mesmo tom medio**: as 10 variantes de chao sao TODAS `GRASS_A` (ou `dirt`) -- a
   base solida (`ramp5[2]`) e identica em toda variante da familia; a unica diferenca entre variantes
   e o decalque interior (que fica centrado, longe da borda, entao nunca estraga o wrap). Os blotches de
   valor por-tile da v1 foram REMOVIDOS (eram outra fonte de tom inconsistente entre variantes).
3. **Macro-escala nunca mais por tile**: `GRASS_B`/`GRASS_SHADE` deixaram de ser familias de tile cheio
   e viraram o TINT de 2 overlays grandes (`overlays/macro_patch_*.png`, 176px e 140px, pedido era
   96-192px) com borda de lobulos organicos + dither de alpha (`macroPatch()`) -- o game-dev cola em
   PIXELS DO MUNDO, nao em celula de tile, entao a borda da mancha nunca cai numa linha de 32px.
4. **Transicao grama<->terra virou autotile blob-16** (`grassDirtBlobSet`, via `blob_autotile16.js`,
   NAO modificado) -- a mesma geometria ja comprovada em producao por `path_blob`/`water_blob`/
   `cliff_top_blob`. O seam diagonal reto da v1 (`transitionTile`) foi removido; o arredondamento de
   canto do blob garante borda organica sem degrau quadrado entre pecas vizinhas -- prova visual na
   secao "AUTOTILE GRAMA<->TERRA" de `tileability_check.png` e na trilha sinuosa de
   `before_after_20x12.png` "DEPOIS".

## O que tem aqui

- **`palette.json`** — reaproveita 100% as rampas de `forest-v8-depth/palette.json` (0 hex novo pra
  grass/dirt/bark/foliage/moss/stone). `GRASS_B`/`GRASS_SHADE` (mesma funcao `shiftColor`/`shiftRamp`
  de antes) agora so tingem os 2 overlays macro, nunca um tile cheio (ver Correcao rodada 2).
- **`tiles/ground_variant_0..9.png`** (32x32, 10 variantes, TODAS familia `GRASS_A` ou `dirt`, mesmo tom
  medio e base TILEAVEL por wrap-around) — `groundClumpFill()` planta 4-5 CLUSTERS de 8-14 laminas cada
  (nao 40 pixels soltos), em ate 4-5 tons com vies de luz cima-esquerda por cluster, + AO entre clusters
  (nao em cima deles). O `stampCrack` preto sumiu de TODAS as variantes de grama -- so sobra uma
  rachadura muda (tom terra, nao quase-preto) numa unica variante de TERRA seca. Decalques embutidos
  (interiores, nunca tocam a borda): folhas em grupo, raiz exposta com musgo, pedras com musgo, trevo
  esparso -- nunca mais um ponto isolado.
- **`tiles/grass_dirt_blob_0..15.png`** (32x32, 16 pecas, autotile blob-16) — transicao grama<->terra,
  MESMA geometria compartilhada de `path_blob`/`water_blob`/`cliff_top_blob` (`blob_autotile16.js`, nao
  modificado). bitmask N*1+E*2+S*4+W*8, bit=1 onde a trilha de terra CONTINUA por aquele lado.
- **`overlays/macro_patch_olive.png`** (176x176) e **`overlays/macro_patch_shade.png`** (140x140) —
  a variacao de matiz macro-escala, agora como overlay semitransparente com borda de lobulos organicos +
  dither de alpha (`macroPatch()`), NUNCA um tile. Posicionar em pixels do mundo, 2-4 por clareira
  grande, layer "ground-macro-overlay" (entre "ground" e "ground-decal").
- **`decals/`** (4 PNGs avulsos, maiores que os de v8) — `leaf_litter_big` (grupo de 5-7 folhas),
  `root_exposed_mossy`, `mossy_stone_cluster`, `tuft_overlap_big` -- pra espalhar sobre QUALQUER chao do
  jogo, nao so os `ground_variant_*` novos.
- **`trees/`** (4 especies x 2 tamanhos = 8 `_top` + 8 `_base`) — `tall_narrow` (alta/estreita),
  `wide_low` (larga/baixa), `leaning` (tombada/torta) e `ancient_thick` (grossa, raizes a mostra).
  Cada arvore: `paintTrunkThick()` (tronco mais grosso que `forest_v4_props.js`'s `paintTrunkRoots`,
  5-8 raizes visiveis com musgo na ponta, sombra de contato propria) + copa composta de 2-3
  **lobulos** (`paintCanopyVolume`, cada lobulo e uma chamada separada de `paintCanopyPuffs` com seu
  proprio (rx,ry,offset) -- o encontro entre lobulos ja cria uma fenda de AO de graca, porque o
  `rimDarken` interno do `paintCanopyPuffs` roda de novo sobre a mascara acumulada) + um passe extra
  `addRimLightPass` (realce explicito na borda superior-esquerda de toda a massa) e `addInnerShadowPass`
  (manchas escuras no MEIO da copa, nao so na borda, pra sugerir profundidade entre folhagens). `base`
  colide e vai na layer "decor" (Y-sort pelo pe); `top` nao colide e vai na layer "canopy-top", SEMPRE
  acima de qualquer entidade -- mesma regra de overlap ja usada em `forest_v4_proof_scene.js`
  (`topY = footY - base.h - top.h + round(top.h * 0.4)`).
- **`preview.png`** — prancha com as 10 variantes de chao, as 16 pecas de autotile, os 2 overlays macro,
  os 4 decalques e as 8 arvores (4 especies x 2 tamanhos, compostas de pe).
- **`before_after_20x12.png`** — montagem simulada de 20x12 tiles (640x384px cada metade). **ANTES** e
  uma RECONSTRUCAO ESQUEMATICA rodando as MESMAS formulas de `gen_forest_v8_depth.js` (`groundBase` +
  `stampCrack`) e uma arvore-blob equivalente (1 elipse de copa + tronco fino), nao uma captura real
  editada -- ver Limitacoes. **DEPOIS** usa este pacote (chao tileavel + trilha de terra sinuosa via
  autotile + 2 overlays macro + as 4 especies de arvore nas bordas) com o MARCADOR DE ESCALA do Tamer
  (~26x33, proporcao documentada em `forest-v8-depth/README.md`) na MESMA celula nas duas metades.
- **`tileability_check.png`** — prova de ausencia de grade (pedido do coordenador): a variante 0
  repetida 6x6 e a variante 8 repetida 6x6, em escala 4x, mais um trecho real do autotile grama<->terra
  (2 celulas de largura numa grade 6x6) -- nenhuma das 3 secoes mostra linha de 32px.
- `tileset.json` / `license.json` — mesmo schema de forest-v4/v6/v7/v8/v9.

## O que o game-dev precisa ligar

1. **Trocar as referencias de chao de clareira** que hoje apontam pra `forest-v8-depth/tiles/ground_variant_*`
   por este pacote -- os decalques/props emissores/clutter/cliff/NPCs de v8/v9 continuam valendo, so o
   CHAO muda.
2. **Chao simples**: espalhar `ground_variant_0..9` por ruido/aleatorio na layer "ground", igual a
   convencao de sempre -- sao TODOS tileaveis entre si (mesma familia), entao qualquer combinacao casa
   sem costura.
3. **Trilha**: usar `grass_dirt_blob_0..15` com a mesma logica de autotile ja implementada pra
   `path_blob`/`water_blob` -- calcular o bitmask pelos 4 vizinhos (N/E/S/W, bit=1 se o vizinho tambem
   e trilha) e escolher a peca correspondente.
4. **Overlays macro**: colar `overlays/macro_patch_olive.png`/`macro_patch_shade.png` em pixels do
   MUNDO (nao celula de tile), 2-4 por clareira grande, numa layer nova "ground-macro-overlay" entre
   "ground" e "ground-decal" -- resolve a variacao de matiz macro-escala sem nenhum risco de grade
   (a borda da mancha nunca cai numa linha de 32px porque ela nao e um tile).
5. **Arvores**: trocar os `tree_round`/`tree_bushy`/etc. de `forest_v4_props.js` usados na clareira
   pelas 4 especies novas (ou usar ambos, misturados -- as novas nao substituem as de v4 em outras areas
   do mapa, so foram feitas pra essa clareira). `base` tem colisao; `top` nao, e precisa da layer
   dedicada "canopy-top" sempre por cima (se o motor ja tem essa layer pras arvores de v4, e so apontar
   pra ela).
6. **Colisao**: como sempre neste pipeline, vem de `tileset.json` por arquivo -- hitbox e trabalho do
   game-dev.

## Veredito do diretor

Resolve o problema relatado nos dois pontos exatos que o fundador apontou: o chao deixa de ser "verde
chapado com rachadura preta fina + pontinho" e passa a ter massa de clusters + decalques grandes; as
arvores (aprovadas pelo coordenador sem ressalvas na rodada 1, inalteradas aqui) tem tronco grosso com
raizes visiveis, copa em 2-3 lobulos com rim light e sombra interna, e 4 silhuetas diferentes. **E, apos
a rodada 2, o chao tambem deixa de formar xadrez**: base tileavel por wrap-around (prova em
`tileability_check.png`), mesma familia/tom medio em toda variante, macro-escala e transicao movidas
pra fora da grade de tile (overlay + autotile blob-16). Aprovo para integracao e teste no mapa real.

**Mas, sendo critico**: isto ainda e textura/volume GERADOS POR REGRA (clusters/lobulos/autotile
proceduralmente posicionados), nao pintura a mao peca a peca -- de perto, ainda vai ler como "gerado",
so que agora gerado-organico e tileavel em vez de gerado-chapado-com-xadrez (mesma ressalva honesta que
`forest-v9-cliffs/README.md` ja fez pro penhasco). O salto real de qualidade so vem depois de ver isto
rodando no mapa de verdade, com os overlays macro posicionados pelo game-dev e as 4 especies de arvore
misturadas de forma nao-repetitiva -- o que este pacote nao pode validar sozinho (ver Limitacoes).

## Limitacoes (autocritica)

- **`before_after_20x12.png` "ANTES" e uma reconstrucao esquematica, nao a captura real editada** --
  rodei as formulas exatas de `gen_forest_v8_depth.js` isoladas (sem o resto do mapa: rio, trilha,
  NPCs, UI), entao a composicao geral (onde fica cada coisa) nao e identica a captura real, so a
  TECNICA de chao/arvore e. O `before_after_20x12.png` "DEPOIS" e so este pacote isolado -- nao mostra
  como fica MISTURADO com o resto do chao de v8 (decalques/trilha/agua), que o fundador nao reclamou e
  continua intocado.
- **O marcador de escala do Tamer (`tamerScaleMarker()`) NAO e arte de personagem nova** -- e um
  silhouette compacto de 16x30px so pra comparar proporcao chao/arvore x jogador na montagem, na mesma
  proporcao documentada (~26x33) que `forest-v8-depth/README.md` ja usou pros NPCs -- nao e pra ser
  exportado nem usado no jogo.
- **Os overlays macro sao so 2 formas/tamanhos fixos** (`macroPatch(176, ...)`/`macroPatch(140, ...)`,
  seeds fixas) -- o game-dev pode escalar/rotacionar o PNG livremente (e um overlay comum, nao um tile),
  mas nao ha um gerador parametrico de N formas diferentes aqui; repetir o MESMO overlay varias vezes
  numa clareira muito grande pode comecar a se repetir visualmente (nao testado em escala, so as 2
  instancias da cena 20x12 de exemplo).
- **O autotile grama<->terra (16 pecas) e so blob-16, nao Wang-47** -- mesma limitacao ja documentada
  pelo resto do pipeline (v4/v6/v7) pros seus proprios autotiles: cantos internos num layout MUITO
  irregular (varias reentrancias seguidas) podem expor um padrao repetitivo; nao testado num mapa real
  com geometria assim, so na trilha sinuosa simples de `before_after_20x12.png`.
- **A tecnica de wrap (`forEachWrap`) garante textura tileavel, nao detecta automaticamente se uma
  macro-regiao ficou visivelmente repetitiva** -- o fundador/coordenador pode achar a variante 0 (plana)
  repetida por uma area MUITO grande sem nenhum decalque um pouco monotona; a mistura de variantes
  plain/decal continua sendo responsabilidade do posicionador do game-dev (ruido/aleatorio por celula),
  nao deste pacote.
- **4 especies, 2 tamanhos cada -- nao um "arvoredo" infinito** -- um trecho MUITO grande e denso ainda
  pode repetir uma mesma especie/tamanho visivel se o game-dev nao misturar bem; nao testado em escala
  (so nas bordas da cena 20x12 de exemplo).
- **Lobulos de copa sao elipses deformadas por ruido (`paintCanopyPuffs`), nao uma silhueta de folhagem
  desenhada a mao galho a galho** -- cobre a direcao pedida (massa com volume, nao 1 blob), mas um
  ilustrador dedicado desenharia quebras de silhueta mais deliberadas (uma copa realmente assimetrica,
  nao so 2-3 ovoides deslocados).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via `preview.png` e
  `before_after_20x12.png`.
- **0 geracoes do PixelLab usadas** -- pipeline 100% local se mostrou suficiente de novo; o saldo (0,8)
  continua intocado.
