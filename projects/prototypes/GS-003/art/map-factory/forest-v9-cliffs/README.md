# forest-v9-cliffs — penhasco/barranco organico v2 (Map Factory, 2026-11-10)

Pedido direto, via game-studio: na clareira piloto (branch `quality-overhaul`, capturas em
`projects/prototypes/GS-003/quality-overhaul/phase3/img/p7_clareira_depois_v9p7_*.png`), o mirante
elevado ainda le como uma **laje cinza** -- face retangular, pedra lisa em blocos, borda reta, zero
vegetacao (confirmado visualmente no canto superior-esquerdo de `p7_clareira_depois_v9p7_dia.png`: uma
faixa cinza-azulada lisa com costuras retas identicas, um unico arbusto estranho ao muro e a UNICA
vegetacao visivel). Direcao pedida: Drakantos tem barrancos organicos -- camadas de rocha, raizes, musgo
pendurado, contorno irregular (`evidence/drakantos-video/t0150_estrada_carroca_lanterna.png` como
referencia de ESTILO/composicao, nao um frame literal de penhasco -- o video nao tem um close de falesia
nos 6 frames capturados neste repo; a direcao veio da descricao do pedido).

**Este pacote SUBSTITUI so o sub-kit `cliff_*` de `forest-v8-depth`** (chao, decalques, props emissores,
clutter e NPCs de v8 continuam sendo a melhor fonte -- nao foram tocados, `forest-v8-depth/` nao foi
sobrescrito). **100% pipeline local** (Canvas.js, mesma convencao de v4/v6/v7/v8): **0 geracoes do
PixelLab gastas** -- o saldo da conta nao foi usado (ver `shared/tools/map-factory/logs/pixellab-usage.csv`
se existir uma linha de registro; nada foi debitado porque nenhuma chamada de API foi feita).

## O que tem aqui

- **`palette.json`** — reaproveita INTEGRALMENTE a rampa `cliff` de `forest-v8-depth/palette.json`
  (`cliffFace.{hi,lt,mid,dk,core}` + `mossEdge` + `foliage`/`bark` para vegetacao/raizes) -- nenhum hex
  novo. "3-4 tons roxo-acinzentados e frios" pedido na tarefa e literalmente essa rampa, ja derivada por
  deslocamento HSV de `forest_v4_palette.js` com um `hueDeg` que puxa pro frio/azulado.
- **`tiles/cliff_top_blob_0..15.png`** — topo, MESMA geometria de autotile blob-16 compartilhada (N/E/S/W,
  cantos em quarto-de-circulo) de `forest-v4/v6/v7/v8` -- `blob_autotile16.js` **nao foi modificado**. A
  borda sul (onde a face comeca) ganhou musgo/grama espalhados por ruido em vez da textura lisa de v8.
- **`tiles/cliff_face_a/b/c/d.png`** — **4 variantes** de face (pedido minimo: 3), cada uma com
  estratos de rocha em 3-4 tons + fissuras com densidade propria + UMA combinacao diferente de
  tufo-de-grama-pendurado / musgo-pendurado / raiz-pendurada / ressalto de rocha, para a parede nao
  repetir pedra identica a cada 32px. Sombra de contato forte na base, com a linha do topo da sombra
  JITTERED por coluna (nao reta) e detritos/pedregulhos espalhados no pe.
- **`tiles/cliff_face_corner_outer_left/right.png`**, **`cliff_face_corner_inner.png`** — cantos externo e
  interno com **fratura irregular** (random-walk clampado por linha, com "lascas" ocasionais) em vez do
  corte diagonal reto de v8; o canto interno acumula musgo na fenda.
- **`tiles/cliff_ramp.png`** — escada de pedra natural: degraus com leve desalinhamento horizontal entre
  si, musgo na borda de alguns degraus, grama crescendo na fresta -- continua 100% andavel
  (`collision: false`), so a leitura visual mudou.
- **`decals/root_vine_a/b.png`**, **`decals/moss_drip_extra.png`**, **`decals/grass_tuft_edge.png`** —
  4 overlays transparentes (cipo/raiz com flecks de folha, musgo pendurado avulso, tufo de grama extra)
  para espalhar por ruido sobre QUALQUER peca de face, mesma convencao dos decalques de chao de v8 --
  reforca variedade sem precisar de mais pecas base.
- **`preview.png`** — prancha com topo (16), as 4 faces, os 3 cantos, a rampa e os 4 decalques.
- **`mirante_comparison.png`** — montagem simulada **8x3**, lado a lado: ANTES (reconstrucao esquematica
  da laje atual -- blocos lisos cinza-azulados, costuras retas identicas, sombra reta, zero vegetacao,
  **nao** uma captura real editada, so uma recriacao fiel da descricao/leitura visual) vs DEPOIS (este
  kit montado: topo autotile com cantos arredondados + 4 variantes de face + os 2 cantos externos + a
  rampa + chao de grama embaixo).
- `tileset.json` / `license.json` — mesmo schema de forest-v4/v6/v7/v8.

## O que o game-dev precisa fazer

1. **Trocar as referencias do mirante/penhasco** que hoje apontam para a laje atual (ou para
   `forest-v8-depth/tiles/cliff_*`, se for o caso) por este kit -- `forest-v8-depth` continua valendo
   para tudo que NAO e penhasco.
2. **Autotile do topo**: ler o bit S do `cliff_top_blob` como em v8; colocar uma das 4 variantes de face
   (escolha aleatoria/por ruido -- nao ha regra de qual variante usar onde, sao intercambiaveis) OU um
   canto nas extremidades, uma celula abaixo, na layer `cliff-face`.
3. **Decalques opcionais**: estampar 0-1 dos 4 decalques de `decals/` sobre uma peca de face escolhida
   por ruido, para parede mais longa nao ficar repetitiva so com as 4 variantes base.
4. **Colisao**: como sempre neste pipeline, `collision` vem de `tileset.json` por arquivo -- hitbox e
   trabalho do game-dev.

## Limitacoes (autocritica, como diretor de arte)

- **Ainda e um kit de 1 nivel, 4 variantes de face + 3 cantos + 1 rampa -- nao autotile completo da
  face.** O topo e autotile de verdade (16 pecas, mesma geometria que o resto do pipeline ja usa havia
  tempo); a face continua sendo "escolha entre N pecas discretas", so que N subiu de 1 (v8) pra 4, mais
  decalques. Um contorno MUITO irregular (varias reentrancias seguidas, ilhas isoladas) ainda pode
  expor a repeticao -- nao testado num mapa real com geometria assim.
- **A "irregularidade" da borda e da fratura dos cantos e um random-walk clampado (`wobbleProfile`), nao
  uma silhueta de rocha desenhada a mao.** Funciona bem pra quebrar a leitura "ruler-straight" que era o
  problema relatado, mas um escultor de pixel art dedicado desenharia quebras mais deliberadas
  (fissuras que seguem a direcao do estrato, por exemplo) em vez de ruido generico.
  **Honesto: comparado a uma falesia pintada a mao (tipo a referencia de composicao do estilo
  Drakantos), este kit ainda e claramente proceduralmente gerado de perto -- resolve o problema
  relatado (laje lisa sem vegetacao) mas nao e arte pintada a mao peca a peca.**
- **`mirante_comparison.png` e uma RECONSTRUCAO ESQUEMATICA do "antes", nao a captura real editada.**
  Fiz a leitura visual (blocos lisos cinza-azulados, costuras retas, sem vegetacao) direto da captura
  `p7_clareira_depois_v9p7_dia.png` (inspecionada com um crop local, sem Pillow disponivel neste
  ambiente -- usei o decoder PNG puro-Node do proprio pipeline, `art/src/png_decode.js`), mas nao
  recortei/editei o PNG real da captura -- seria preciso o asset fonte do mirante (nao encontrado como
  arquivo isolado, so dentro da composicao final da cena) pra fazer um "antes" pixel-identico.
- **Referencia Drakantos (`evidence/drakantos-video/t0150_*`) e um unico frame de estrada/carroca, NAO
  um close de falesia.** Os 6 frames capturados neste repo (`evidence/drakantos-video/`) nao incluem
  nenhum penhasco visivel -- a direcao "camadas de rocha, raizes, musgo pendurado, contorno irregular"
  veio da descricao do pedido, nao de um frame especifico que eu pude conferir pixel a pixel. Se existir
  um frame de barranco do Drakantos em outro lugar do estudo (`docs/DRAKANTOS_VISUAL_STUDY.md`), vale
  o game-studio apontar pra ca numa proxima rodada pra eu comparar de perto.
- **Nada disto foi testado no motor real**, so inspecionado visualmente via `preview.png` e
  `mirante_comparison.png`.
- **0 geracoes do PixelLab usadas** -- o pipeline local se mostrou suficiente outra vez; o saldo (quase
  zerado, por isso o pedido explicito de nao gastar) continua intocado.

## Veredito do diretor

Resolve o problema relatado -- a laje deixa de ser lisa/reta/sem vegetacao, ganha estratos, musgo
pendurado, raizes, cantos quebrados e uma escada organica, na mesma paleta fria de v8. Mas e um kit
procedural de 4 variantes + decalques, nao pintura a mao peca a peca -- de perto, ainda vai ler como
"gerado", so que agora gerado-organico em vez de gerado-laje. Recomendo integrar e avaliar no mapa real
antes de decidir se vale um proximo passo (passe manual nas 4 faces, ou mais variantes) -- sem gastar
PixelLab agora que o saldo esta baixo.
