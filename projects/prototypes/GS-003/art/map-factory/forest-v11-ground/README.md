# forest-v11-ground — relevo/contraste + Wang-47 + noite + mirante (Map Factory, 2026-11-10)

Avaliacao do coordenador sobre `forest-v10-ground-trees` (branch `quality-overhaul`, commit `1e8f7f1`,
JA integrado no jogo): "a melhora e real, mas sutil. O chao ainda le plano, e o topo do mirante continua
uma laje cinza com uma faixa verde retangular." Junto, o game-dev listou 3 pedidos tecnicos especificos
no `V10_DEV.md` (Limitacoes): cantos internos no autotile grama<->terra (hoje "retangulo com dentes" a
cada 32px), uma versao `night/` das copas, e o PNG das manchas macro sem alfa encostando na borda. Este
pacote cobre os 5 itens — **sem PixelLab** (100% pipeline local Canvas.js, mesma convencao de v4..v10) e
**sem sobrescrever** `forest-v10-ground-trees`/`forest-v9-cliffs` (pacote novo e paralelo, "master" — os
dois anteriores continuam intocados e sao a melhor fonte pras arvores/penhasco que este pacote nao
reescreve).

## O que tem aqui, item por item

1. **Relevo/contraste no chao** (`tiles/ground_variant_0..9.png`, mesmos 10 slots de v10, drop-in) —
   `groundClumpFillRelief`/`dirtGrainFillRelief` substituem `groundClumpFill`/`dirtGrainFill` do v10.
   A rampa de 5 tons (`GRASS_A`, a mesma familia de v10, 0 hex novo) agora e usada de ponta a ponta: o
   calculo de qual tom cada lamina recebe foi ampliado (multiplicador de luz 1.7 -> 2.15) pra realmente
   alcancar os extremos 0 (sombra) e 4 (luz), nao so o miolo 2-3 como no v10. Cada cluster de tufo ganha
   uma **microsombra** (elipse no tom mais escuro, deslocada pra baixo-direita — o lado oposto da luz
   cima-esquerda ja usada em todo o pipeline) desenhada ANTES das laminas, e um **realce** (tom mais claro)
   na ponta da lamina mais alta do cluster — o efeito e o tufo "pousar" no chao com uma sombra de contato e
   pegar luz no topo, sugerindo um pequeno desnivel sem precisar de geometria 3D de verdade. O chao de
   terra (`dirtGrainFillRelief`) ganhou o mesmo tratamento: blobs rasos mais escuros (depressao) ao lado
   de blobs mais claros (crista), e AO sob cada pedrinha. Referencia pedida pelo coordenador
   (`evidence/drakantos-video/t0560_floresta_tronco_caido.png`/`t0058_floresta_lama_roxa_fundador.png`)
   [E]: comparei a leitura de "chao com massa/sombra" contra a textura plana do v10 antes de desenhar.
   Continua tileavel por wrap-around (prova: `tileability_check.png`, variante 0 repetida 6x6 em escala
   4x, nenhuma linha de 32px visivel).

2. **Autotile grama<->terra Wang-47** (`tiles/grass_dirt_wang47_0..46.png`, novo modulo
   `art/src/blob_autotile47.js`) — o `grass_dirt_blob_*` do v10 era blob-16: cada canto decide seu
   arredondamento so pelas 2 arestas adjacentes, sem saber se o vizinho DIAGONAL e a mesma terrain. Numa
   celula-"braco" saindo de um bloco 2x2 (as 2 arestas continuam mas a diagonal e grama), isso sempre
   preenche o canto inteiro (quadrado), e e exatamente o que o `V10_DEV.md` documentou como "a borda de
   um bloco le como retangulo com dentes a cada 32px". O Wang-47 acrescenta o bit diagonal: quando as 2
   arestas de um canto continuam mas a diagonal correspondente NAO e a mesma terrain, o canto agora
   renderiza um pequeno entalhe concavo (a grama "morde" o canto da terra) em vez do quadrado cheio.
   Enumerando as 16 combinacoes de aresta (N/E/S/W) x cada variante de diagonal que realmente muda o
   resultado (um canto so distingue diagonal quando SUAS 2 arestas ja sao terra — qualquer outro bit de
   diagonal e irrelevante e e normalizado a 0 antes de contar) da exatamente **47 pecas unicas**
   (confirmado por `node -e` contando `enumerateBlob47()`, e pela prova em `tileability_check.png`/
   `before_after_20x12.png` com uma mancha de terra em forma de "blob com bracos", nao uma trilha reta).
   A borda tambem ganhou decoracao propria: `buildBlobTile47` devolve a mascara `isBg` (que pixels sao
   grama vs. terra apos o arredondamento/entalhe), e `decorateBoundary` planta tufos de grama mordendo a
   terra e pedrinhas do lado da terra EXATAMENTE ao longo desse contorno resolvido — nao so a curva
   geometrica, pixels de vegetacao/pedra cruzando a linha, como pedido ("tufos sobrepostos, pedrinhas").
   `blob_autotile16.js` **nao foi modificado** (ainda usado, sem mudanca, pelo `mirante_top_blob_*` e por
   tudo que v8/v9/v10 ja usam) — o Wang-47 e um modulo paralelo, so para esta transicao.

3. **Copas `night/`** (`trees/night/<especie>_<tamanho>_top.png`, 8 arquivos — 4 especies x 2 tamanhos) —
   em vez de redesenhar a copa (risco de a silhueta night divergir da day ja aprovada sem ressalvas pelo
   coordenador), cada PNG e o `top` diurno do v10 **recolorido pixel a pixel**: todo pixel opaco e lido
   pela sua posicao na rampa de 8 tons `DAY_FOLIAGE` (pelo canal mais claro, suficiente porque a arte so
   usa tons dessa rampa + blends entre vizinhos) e substituido pelo mesmo par de indices em
   `NIGHT_FOLIAGE`. `NIGHT_FOLIAGE` e `FOLIAGE_NIGHT` de `forest_v4_palette.js` (a rampa noturna
   **ja hand-picked e usada pela noite "pintada" de forest-v4** — azul-violeta, nao um filtro cinza)
   passada pelos MESMOS 4 multiplicadores que `forest_v8_depth_palette.js`'s `buildDepthRamps()` aplica
   ao dia (`GF_SAT_MUL=0.64, GF_VAL_MUL=0.80, RIM_SAT_MUL=0.88, RIM_VAL_MUL=0.92`) — 0 hex novo, mesma
   formula documentada, so a base trocada de dia pra noite. O rim-light e a sombra interna ja assados no
   PNG diurno (pelo `addRimLightPass`/`addInnerShadowPass` do v10) caem automaticamente nos extremos
   corretos da rampa noturna, sem reprocessar nada — silhueta/lobulos 100% identicos ao `top` diurno
   aprovado. `V10_DEV.md` descreveu a noite atual como "um tom aproximado por grade (matiz, tinta e
   saturacao), nao um preset noturno pintado" — isto e exatamente esse preset pintado que faltava, so
   para a copa (que foi o que o game-dev pediu). `base` (tronco) continua so com a versao diurna — nao
   foi pedido, e o tronco baixo/parcialmente escondido sofre menos com a aproximacao de grade do renderer.

4. **Manchas macro corrigidas** (`overlays/macro_patch_olive.png` 176x176, `overlays/macro_patch_shade.png`
   140x140 — mesmos tamanhos/tints/posicoes de v10, drop-in) — mesma forma organica de lobulos + dither de
   alfa do v10, mas com `rBase` reduzido (0.36 -> 0.30 do tamanho) para o alcance maximo dos lobulos caber
   com folga dentro do canvas, MAIS um anel de **8px garantidamente alfa 0** na borda do PNG (com uma
   rampa suave de mais 12px entre o alfa organico e esse zero, pra nao criar um corte circular visivel em
   vez da linha reta). O bug relatado ("alfa <= 50 encostado na borda, o que deixaria uma linha reta no
   chao" — por isso o renderer precisou de um `featherAlpha` de 14px como gambiarra) fica resolvido na
   origem: o renderer pode manter o `featherAlpha` como rede de seguranca, mas nao precisa mais dele pra
   estas 2 manchas.

5. **Topo do mirante** (`mirante/mirante_top_blob_0..15.png` + `mirante/mirante_assembly_demo.png`) —
   o `forest-v9-cliffs` ja tinha corrigido exatamente este problema no proprio pacote (sua rodada "r2" de
   QA documenta, no codigo-fonte, consertar "a plataforma lia como laje gray-purple stone... a mancha
   verde retangular"). **Correcao (game-dev, `V11_DEV.md`): o kit `forest-v9-cliffs` ja estava ligado
   em `prototype/world` desde antes deste pacote** (`derive-look-v9` troca `fp8_cliff_*` por `fp9c_*`,
   confirmado por `p7-report.cliffKit`) — a laje cinza que o coordenador via nao vinha de o kit estar
   desconectado, e sim de duas coisas especificas: o topo `fp9c_cliff_top_blob_*` ja ligado levava uma
   grade de cor de pedra (tint roxo-acinzentado) por cima, e uma fileira de grama do v8 sobrava no
   `ground_detail` por cima do topo (a "faixa verde retangular"). Em vez de so apontar pra isso, este pacote entrega um topo PRONTO que casa
   com o penhasco ja aprovado (MESMA geometria blob-16 de `blob_autotile16.js`, MESMAS rampas
   `d.grass`/`d.dirt`/`d.stone`/`d.mossEdge` via `buildDepthRamps()`, 0 hex novo) e vai alem do que
   `forest-v9-cliffs` ja tinha: mais presenca de pedra (clusters com musgo/AO, respondendo literalmente
   ao "com pedras" do pedido, nao so 3 pixels soltos) e um wobble de borda sul mais forte (amplitude 3 ->
   4.2) + mais mordidas de grama, pra nenhuma aresta ler reta mesmo numa fileira longa.
   `mirante_assembly_demo.png` monta uma plataforma de silhueta **irregular** (uma reentrancia e uma
   saliencia, nao um retangulo) usando estes 16 tiles em cima, com face/rampa/cantos **reais** de
   `forest-v9-cliffs` (lidos do disco via `pngToCanvas`, nao redesenhados) embaixo — prova visual de que
   o conjunto final nao le como laje nem quando a planta baixa foge do retangulo.

6. **Montagem simulada `before_after_20x12.png`** — 4 paineis de 20x12 celulas (640x384px cada) + 2 zooms
   4x: DIA-V10 (carrega os PNGs ja renderizados de `forest-v10-ground-trees` do disco — chao, blob-16 de
   trilha, arvores diurnas aprovadas, mais uma reconstrucao esquematica da laje cinza+faixa verde no
   canto NE, igual ao que `forest-v9-cliffs/README.md` ja fez pro "antes" do mirante) vs. DIA-V11 (chao
   com relevo, uma mancha de terra em forma de "blob com bracos" via Wang-47 — nao uma trilha reta, pra
   forcar o caso de canto interno — overlays macro com alfa corrigido, e uma amostra do mirante novo no
   mesmo canto NE, arvores INALTERADAS do v10); NOITE-V10 (a cena dia com um tint azul-violeta uniforme —
   a aproximacao de grade que o renderer ja faz hoje) vs. NOITE-V11 (mesmo tint no chao, mas as copas
   trocadas pela arte `night/` dedicada — o contraste entre as 2 metades noturnas e a prova visual do
   item 3); zoom 4x no braco de terra do Wang-47 (v10 teria canto quadrado, v11 mostra o entalhe); zoom 4x
   na laje cinza antiga vs. o topo de mirante novo.

## O que o game-dev precisa ligar

1. **Chao**: trocar as referencias de `forest-v10-ground-trees/tiles/ground_variant_*` por
   `forest-v11-ground/tiles/ground_variant_*` — mesmos 10 indices/decalques, mesma convencao de
   espalhamento por ruido, nenhuma mudanca de logica no lado do motor.
2. **Autotile grama<->terra**: trocar `grass_dirt_blob_0..15` (blob-16) por `grass_dirt_wang47_0..46`
   (Wang-47) — precisa calcular tambem os 4 vizinhos diagonais (NE/SE/SW/NW), nao so os 4 ortogonais, e
   resolver o indice com a tabela `grassDirtTransition.placementTable` de `tileset.json` (ou reimplementar
   `blob47Index(enumerateBlob47(), edgeMask, diagMask)` de `blob_autotile47.js` no lado do renderer —
   e puro JS sem dependencia de Canvas, pode ser copiado/portado). `edgeMask`/`diagMask` usam a MESMA
   convencao de bits ja em uso (N=1,E=2,S=4,W=8; diagonais NE=1,SE=2,SW=4,NW=8 na sua propria mascara).
3. **Copas night**: na layer "canopy-top", se o renderer ja tem um modo noite (GradeRule.night, citado em
   `V10_DEV.md`), apontar essa layer para `trees/night/<especie>_<tamanho>_top.png` em vez de aplicar o
   grade sobre o `top` diurno — `base`/colisao/`overlapRule` continuam os mesmos do v10, so o PNG do
   `top` muda por condicao dia/noite.
4. **Manchas macro**: mesma integracao de v10 (colar em pixels do mundo, layer "ground-macro-overlay"),
   so trocando os 2 arquivos — o `featherAlpha` do renderer pode continuar existindo (rede de seguranca
   pra arte futura), so nao e mais necessario pra ESTES 2 PNGs.
5. **Mirante**: usar `mirante/mirante_top_blob_0..15` com o MESMO bitmask/posicionamento ja documentado
   em `forest-v9-cliffs/tileset.json` (bit S=0 -> colocar uma `cliff_face_*`/corner de v9-cliffs uma
   celula abaixo) no lugar de onde o mirante hoje usa a laje cinza. **Correcao: `forest-v9-cliffs`
   (face/rampa/cantos) ja estava ligado em `prototype/world` antes deste pacote** (ver "Veredito do
   diretor" abaixo) — o que falta e so trocar o TOPO (item 5 acima) e tirar a fileira de grama residual
   do v8, nao conectar o kit do zero.
6. **Colisao**: como sempre, vem de `tileset.json` por arquivo — hitbox e trabalho do game-dev.

## Veredito do diretor

Aprovo para integracao. Os 5 itens pedidos estao resolvidos na raiz, nao so cosmeticamente: o Wang-47 e
uma mudanca estrutural real (256 vizinhancas de 8 celulas resolvidas em 47 pecas, nao um ajuste de
textura), as copas noturnas sao a mesma arte aprovada numa paleta diferente (zero risco de regressao de
silhueta), e o mirante finalmente ganha um topo organico pronto pra substituir a laje. **Correcao pos-integracao
(game-dev, `V11_DEV.md`, 2026-11-10): `forest-v9-cliffs` ja estava ligado em `prototype/world` desde
antes deste pacote** (`derive-look-v9` ja trocava `fp8_cliff_*` por `fp9c_*`, confirmado por
`p7-report.cliffKit`) — a causa raiz real da laje cinza era o topo ja ligado levar uma grade de cor de
pedra por cima mais uma fileira de grama do v8 sobrando no `ground_detail`, NAO o kit estar desconectado
(a frase acima, escrita antes dessa integracao ser revisada, estava incorreta e fica corrigida aqui).
O chao com relevo e a melhora mais subjetiva das 5: o microsombra/realce por cluster
ajuda a leitura, mas ainda e volume sugerido por pixel solto, nao um sistema de luz/normal map de verdade
(ver Limitacoes).

## Limitacoes (autocritica)

- **O relevo do chao e sugerido, nao simulado** — microsombra e realce por cluster ajudam a leitura de
  "massa com volume", mas nao ha um mapa de altura nem normal map por baixo; de muito perto, ainda e um
  padrao de pixels repetido por regra (mesma ressalva honesta ja feita em `forest-v10-ground-trees/
  README.md` e `forest-v9-cliffs/README.md` pros seus proprios geradores).
- **O Wang-47 foi testado so no `before_after_20x12.png`/`tileability_check.png`** (uma mancha "blob com
  bracos", nao todas as 47 configuracoes lado a lado numa mesma imagem) — a prancha `preview.png` mostra
  as 47 pecas isoladas, o que confirma a GEOMETRIA de cada canto mas nao testa uma geometria de mapa real
  muito mais irregular (varias reentrancias seguidas, formas em "U" ou "S") que so apareceria num mapa de
  producao de verdade.
- **As copas night sao um remapeamento de cor, nao um novo bake de luz noturna** — rim-light e sombra
  interna seguem vindo do bake DIURNO (so a cor muda); um "luar vindo de outro angulo" ou um brilho lunar
  dedicado na ponta da copa exigiria reprocessar `addRimLightPass`/`addInnerShadowPass` com uma direcao
  de luz propria da noite, o que este pacote nao fez (fora do que foi pedido: "uma versao night/ das
  copas", nao uma nova iluminacao).
- **O painel NOITE-V10/V11 de `before_after_20x12.png` e uma simulacao, nao o grade real do jogo** — o
  tint azul-violeta uniforme aproxima o que `V10_DEV.md` descreve do `GradeRule.night` real, mas nao e
  o codigo do renderer rodando; a comparacao mostra a DIRECAO da melhora (copa com paleta propria vs.
  tint uniforme), nao o resultado pixel-a-pixel exato no motor.
- **`mirante_assembly_demo.png` e uma demonstracao, nao uma peca de mapa final** — a planta baixa
  (8 colunas x 6 linhas com 1 reentrancia/1 saliencia) e so grande o bastante pra provar que a silhueta
  nao precisa ser retangular; um mirante real pode ter uma forma bem mais complexa, nao testada aqui.
  Uma area INTERIOR grande (todas as 4 arestas iguais) repete a MESMA peca de autotile — verifiquei que
  `forest-v9-cliffs/tiles/cliff_top_blob_15.png` (o tile totalmente cercado, ja aprovado e em producao)
  tem exatamente a mesma propriedade quando repetido [E] — nao e uma regressao deste pacote, e como todo
  autotile deste pipeline funciona (1 textura canonica por bitmask); na demo eu espalhei um decalque de
  trevo por celula (so aqui, fora do tile de producao) pra suavizar, mas nao elimina o padrao — um mapa
  real deveria espalhar decals de verdade por cima, como ja se faz com o chao simples.
- **Terra batida do acampamento (fogueira, v10) continua usando o blob-16 antigo** — este pacote so troca
  a transicao grama<->terra GENERICA (`grassDirtTransition`); o game-dev decide se quer reaplicar o
  Wang-47 la tambem (a limitacao documentada em `V10_DEV.md` sobre a fogueira/fonte de cura se aplicaria
  igual, so que agora com cantos internos disponiveis).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via `preview.png`,
  `before_after_20x12.png` e `tileability_check.png`.
- **0 geracoes do PixelLab usadas** — pipeline 100% local, como todo o resto de v4..v10.
