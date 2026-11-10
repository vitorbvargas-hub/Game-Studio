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

## O que tem aqui

- **`palette.json`** — reaproveita 100% as rampas de `forest-v8-depth/palette.json` (0 hex novo pra
  grass/dirt/bark/foliage/moss/stone) + 2 familias NOVAS de grama (`GRASS_B` oliva quente, `GRASS_SHADE`
  poca fria) derivadas pela MESMA funcao `shiftColor`/`shiftRamp` que ja existia, pra variacao de matiz
  em macro-escala.
- **`tiles/ground_variant_0..11.png`** (32x32, 12 variantes) — chao reescrito do zero: `groundClumpFill()`
  planta 4-5 CLUSTERS de 8-14 laminas cada (nao 40 pixels soltos), em ate 4-5 tons com vies de luz
  cima-esquerda por cluster, + AO entre clusters (nao em cima deles) + 2 blotches macios de valor (nao
  elipse de borda dura). O `stampCrack` preto sumiu de TODAS as variantes de grama -- so sobra uma
  rachadura muda (tom terra, nao quase-preto) numa unica variante de TERRA seca (fisicamente faz sentido
  so ali). Decalques embutidos: folhas em grupo, raiz exposta com musgo, pedras com musgo, trevo esparso
  -- nunca mais um ponto isolado. 2 variantes de transicao grama<->terra com tufos SOBREPOSTOS mordendo a
  costura (pedido explicito da tarefa).
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
- **`preview.png`** — prancha com as 12 variantes de chao, os 4 decalques e as 8 arvores (4 especies x 2
  tamanhos, compostas de pe).
- **`before_after_20x12.png`** — montagem simulada de 20x12 tiles (640x384px cada metade). **ANTES** e
  uma RECONSTRUCAO ESQUEMATICA rodando as MESMAS formulas de `gen_forest_v8_depth.js` (`groundBase` +
  `stampCrack`) e uma arvore-blob equivalente (1 elipse de copa + tronco fino), nao uma captura real
  editada -- ver Limitacoes. **DEPOIS** usa este pacote (variantes de chao + trilha de terra sinuosa +
  as 4 especies de arvore nas bordas) com o MARCADOR DE ESCALA do Tamer (~26x33, proporcao documentada em
  `forest-v8-depth/README.md`) na MESMA celula nas duas metades.
- `tileset.json` / `license.json` — mesmo schema de forest-v4/v6/v7/v8/v9.

## O que o game-dev precisa ligar

1. **Trocar as referencias de chao de clareira** que hoje apontam pra `forest-v8-depth/tiles/ground_variant_*`
   por este pacote -- os decalques/props emissores/clutter/cliff/NPCs de v8/v9 continuam valendo, so o
   CHAO muda.
2. **Espalhamento por REGIAO, nao por celula**: pra a variacao de matiz macro funcionar, nao sortear a
   familia (A/B/sombra) tile a tile -- usar ruido de baixa frequencia (Perlin/value-noise amostrado a
   cada 4-6 celulas) ou blotches de 3-8 celulas contiguas da MESMA familia; dentro da regiao, ai sim
   sortear a variante especifica por celula. Sem isso o efeito de "mancha grande" nao aparece -- so
   plantar os 12 arquivos ja resolve os pontinhos/rachaduras, mas nao a macro-variacao de tom.
2. **Arvores**: trocar os `tree_round`/`tree_bushy`/etc. de `forest_v4_props.js` usados na clareira
   pelas 4 especies novas (ou usar ambos, misturados -- as novas nao substituem as de v4 em outras areas
   do mapa, so foram feitas pra essa clareira). `base` tem colisao; `top` nao, e precisa da layer
   dedicada "canopy-top" sempre por cima (se o motor ja tem essa layer pras arvores de v4, e so apontar
   pra ela).
3. **Colisao**: como sempre neste pipeline, vem de `tileset.json` por arquivo -- hitbox e trabalho do
   game-dev.

## Veredito do diretor

Resolve o problema relatado nos dois pontos exatos que o fundador apontou: o chao deixa de ser "verde
chapado com rachadura preta fina + pontinho" e passa a ter massa de clusters + decalques grandes +
manchas de tom; as arvores deixam de ser 1 elipse sobre um palito e passam a ter tronco grosso com
raizes visiveis, copa em 2-3 lobulos com rim light e sombra interna, e 4 silhuetas diferentes. Aprovo
para integracao e teste no mapa real.

**Mas, sendo critico**: isto ainda e textura/volume GERADOS POR REGRA (clusters/lobulos proceduralmente
posicionados), nao pintura a mao peca a peca -- de perto, ainda vai ler como "gerado", so que agora
gerado-organico em vez de gerado-chapado (mesma ressalva honesta que `forest-v9-cliffs/README.md` ja fez
pro penhasco). O salto real de qualidade so vem depois de ver isto rodando no mapa de verdade, com as
variantes espalhadas por regiao (nao so plantadas) e as 4 especies de arvore misturadas de forma
nao-repetitiva -- o que este pacote nao pode validar sozinho (ver Limitacoes).

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
- **Espalhamento por regiao (macro-escala) e so uma REGRA documentada em `tileset.json`, nao
  implementada aqui** -- os 12 arquivos de chao existem e cada um resolve pontinho/rachadura sozinho,
  mas o efeito de "mancha de tom grande" so aparece se o game-dev plantar GRASS_A/B/shade em blocos
  contiguos, nao tile a tile; isto e dado + instrucao, nao codigo de posicionamento (mesma divisao de
  responsabilidade do resto do pipeline -- game-art nao escreve o posicionador do game-dev).
  Um motivo, que ficou mais claro depois de montar a cena 20x12 de teste: 1 unica celula de 32px nao tem
  espaco pra ler como "mancha grande" sozinha -- a macro-variacao SO existe quando varias celulas da
  mesma familia ficam juntas, entao o impacto real desta entrega so se confirma depois do game-dev
  implementar o espalhamento por regiao, nao antes.
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
