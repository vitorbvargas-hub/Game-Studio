# forest-v12 no look v9 + mapa-múndi v2.1 (game-dev)

Branch `quality-overhaul`, servidor `http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&anim=v2&encounters=1` (mapa-múndi: `&hud=v2`, tecla M). Não toquei no `master` nem na 5174. Os pacotes `art/map-factory/forest-v12-plateau-night/` e `art/map-factory/worldmap-v2_1/` (game-art, commit e506b0a) chegaram pelo `git merge master` (bbb8bcd). Data: 2026-11-11. Nenhuma geração do PixelLab foi usada e nada foi publicado ou apagado.

Legenda: **[E]** = evidência (medida, teste ou captura deste trabalho, com o arquivo); **[H]** = hipótese ou julgamento meu.

## Agora é o padrão (commit eb1f016)

**URL para o fundador:** http://127.0.0.1:5190/?map=digimon-forest-01. Sem nenhuma flag, ela abre com tudo novo: look v9 + forest-v12, HUD v2 com o Digivice, mapa-múndi v2.1 (tecla M), Guilmon/Gabumon oficiais (monscale 1) e dpr=1. A prova de cada captura `v12_padrao_*` está em `v12_padrao_capture.json › state`, que registra `hudV2`, `digivice`, `lip`, `worldmapArt = worldmap_v2_1.png` e `dpr` como verdadeiros [E].

| Para voltar ao antigo | Flag |
|---|---|
| HUD antigo, sem Digivice; mapa-múndi em grafo | `?hud=v1` |
| Mapa base, sem look | `?look=base` (`?look=v8` também vale) |
| Digimon PixelLab | `?mon=pixellab` |
| Escala antiga, sem devicePixelRatio | `?dpr=0` |

O look padrão vale só no `digimon-forest-01` (`MapDef.defaultLook`). Os outros mapas não têm variante de look.

**Antes → depois.** No "antes", a mesma URL sem flags abria o mapa base, o HUD antigo, os Digimon PixelLab e a escala antiga. Era o que o fundador viu: "nada mudou e o Digivice sumiu". As capturas do "antes" são `v12_antes_*`: o look v9 do v11, com flags, servido do commit ab41fcf.

| Vista | Antes (v11) | Depois, URL padrão |
|---|---|---|
| Geral, dia | `v12_antes_geral_dia.png` | `v12_padrao_geral_dia.png`, `v12_padrao_jogo_dia.png` |
| Geral, noite | `v12_antes_geral_noite.png` | `v12_padrao_geral_noite.png`, `v12_padrao_jogo_noite.png` |
| Mirante, dia / noite | `v12_antes_mirante_jogo_{dia,noite}.png` | `v12_padrao_mirante_{dia,noite}.png` |
| Copas da borda, dia / noite | `v12_antes_copas_oeste_{dia,noite}.png` | `v12_padrao_copas_{dia,noite}.png` |
| Mundi aberto, dia / noite | `v12_antes_mundi_aberto_{dia,noite}.png` (v1) | `v12_padrao_mundi_{dia,noite}.png` (v2.1) |
| Digivice aberto, dia / noite | só com `?hud=v2` | `v12_padrao_digivice_{dia,noite}.png` |

**URLs das capturas.** Todas em 1920×1080 e `deviceScaleFactor` 1, geradas por `scripts/v12-default-capture.mjs`. O prefixo é `?map=digimon-forest-01&criador=0&novo=1&seed=7&auto=0`, só para tornar a captura reproduzível:
- jogo / mirante: `…&time=day|night`, com o Tamer em (28,20) / (25,20)
- geral: `…&zoom=1&time=day|night`
- copas: `…&zoom=2&time=day|night`, Tamer em (9,20)
- mundi: `…&time=day|night` + tecla M; Digivice: `…&time=day|night` + clique no hub

Gates depois da troca de padrão: 455 testes, `tsc`, build, `map:validate` 6/6 e `sim --check` ok.

**Limitação:** os scripts de captura antigos que contavam com o padrão antigo agora recebem o padrão novo (`capture-live`, `p8-capture` e similares). Para reproduzir uma captura antiga, ponha `&hud=v1&look=base&mon=pixellab&dpr=0` na URL.

## Resumo

- **Lip da borda norte do mirante:** ligado. As 8 células da fileira norte do topo ficaram assim: canto esquerdo, 6 retas e canto direito. As retas alternam entre as 3 variantes e nunca repetem a vizinha.
- **Noite pintada da terra Wang-47, do topo do mirante e do lip:** ligada em **mistura por pixel**, e não como troca da peça inteira. A troca inteira está atrás de `?v12night=swap`, para comparar. O motivo, medido, está na seção 2.
- **O `earth.night` saiu.** Era o ajuste de cor da terra no v11.
- **Copas da borda da mata:** 301 árvores a até 5 tiles da borda ganharam variante (espelho ou tom). Passaram de **8 para 30 visuais distintos**, e as copas com um gêmeo idêntico a menos de 160 px caíram de **269 para 36** [E].
- **Mapa-múndi `?hud=v2`:** passou a usar `worldmap_v2_1.png` e o `worldmap.json` v2.1, com o mesmo schema, as mesmas posições e as mesmas rotas. Não sobra **nenhum** pixel do selo assado num quadrado de 24 px em volta de cada POI, contra 39–249 no v1 [E].
- **Gates:** 454 testes, build, `map:validate` 6/6 e v9 (wang incluído), `sim --check` ok.
- **Sem a flag do look v9, nada muda:** o mapa base e o look v8 não têm chave nem pacote do v12. Há teste para isso.

## O que mudou

Tudo foi feito no gerador, sem editar o `.tmj` à mão. O `derive-look-v9.mjs` chama o novo `scripts/map-factory/v12-plateau-night.mjs` depois do v11. O resultado é determinístico: rodar duas vezes dá o mesmo arquivo (`cmp` e o teste `look-v9 › o derivador é determinístico`).

### 1. Lip (`lip/`, `lip/night/`)

- **Regra do `tileset.json` do pacote:** uma célula do topo cuja vizinha norte está fora do platô vira lip. Se a vizinha oeste também está fora, é `corner_outer_left`. Se a leste está fora, é `corner_outer_right`. Nos outros casos é uma reta `straight_0..2` sorteada por hash, sem repetir a reta da esquerda. O platô é lido **antes** de qualquer troca: na 1ª montagem, eu lia o vizinho já trocado e saíam 8 cantos esquerdos.
- **Resultado [E]:** `corner_outer_left, straight_1, straight_2, straight_1, straight_2, straight_0, straight_1, corner_outer_right` em (21..28, 15), como registrado em `p7-report.json › v12.lip`. Nenhum decalque do v11 caiu nos 10 px de cima das células do lip (`decalsMoved: 0`). A regra que os desce existe, mas não foi acionada.
- **Gate `wang`:** o validador lia o lip como um "buraco" no blob-16 do topo e reprovava 8 células. Cada peça do lip agora leva a propriedade `autotile` com o membro do blob-16 que ela substituiu (`fp11_mirante_top_blob_6/14/12`). O gate confere a máscara por ele (`tiled.mjs › gidTable` e `validate.mjs`). Há 1 entrada de tileset por par (peça, membro). A colisão é a do membro substituído (`solid: false`).
- **Grade:** a mesma do topo do mirante e do chão (sat 0,78 / val 0,6).

### 2. Noite pintada: por que é mistura e não troca

Medi a cor média depois da grade do look v9, antes da luz ambiente, que vale igual para tudo (`scripts/v12-measure.ts` → `v12_measure.json`) [E]:

| Peça à noite | RGB médio | Matiz | Luminância |
|---|---|---|---|
| Chão em volta (`fp11_ground_variant_0`: arte do dia com a grade da noite) | 78,105,74 | 113° | 93 |
| Topo do mirante, v11 (arte do dia com a grade) | 78,103,75 | 113° | 92 |
| Topo do mirante, **v12 pintado** | 48,54,68 | **223°** | **54** |
| Lip, **v12 pintado** | 44,49,63 | 223° | 49 |
| Terra cheia, v11 (`earth.night`) | 52,45,57 | 275° | 48 |
| Terra cheia, **v12 pintada** | 44,37,53 | 266° | 41 |
| Faixa da trilha (forest-v4/night, pintada) | 51,43,60 | 269° | 48 |

A rampa noturna do pacote é a do forest-v4: azul-violeta, feita para uma noite em que **todo** o chão é pintado. No look v9, o chão à noite é a arte do dia com grade, e por isso fica verde. Trocar a peça inteira põe um bloco azul-escuro (matiz 223° contra 113°, luminância 54 contra 93) no meio da grama. Nas capturas isso aparece como **retângulos**: o platô inteiro vira uma laje azul-escura, e cada mancha de terra ganha uma moldura quadrada (`v12_lado-a-lado_zoom_mirante_noite.png` e `…_zoom_terra-trilha-vau_noite.png`, painel da direita, "troca") [E]. A razão de grade sobe junto (tabela abaixo).

Por isso a noite pintada entra **em mistura** (padrão):

- `ExtraPack.nightBlend` (regex) marca as chaves.
- A fonte noturna continua a imagem do dia e ganha `TileSource.nightEarth` com a arte pintada.
- No `gradeTiles(…, night)`, os pixels que são **terra** na imagem do dia (o mesmo critério do `earth`, agora `isEarthPixel`) vêm da arte pintada, com a mesma grade. A grama segue a do dia.
- Isso funciona porque o pacote garante a mesma geometria e a mesma semente por índice. O teste confere pixel a pixel no `grass_dirt_wang47_20`.

O `earth.night` saiu da regra da terra: a cor noturna da terra agora é a pintada. O `nightFor` aceita uma lista de prefixos (`["fp11_", "fp12_"]`) e tira o token `_night` do nome do arquivo. A noite só substitui chave que já existe de dia.

O que isso entrega, honestamente:

- **Terra Wang-47 [E]:** a terra é a arte noturna pintada, sem tinta de grade. Ficou 7 pontos de luminância mais escura que a trilha noturna (41 contra 48), e a borda com a grama não forma retângulo. A grade medida fica igual à do v11 (vau 1,04 → 1,04; acampamento 1,07 → 1,05; fonte 0,86 → 0,89).
- **Topo do mirante e lip [E]:** quase não há pixel de terra nessas peças: 29 de 1024 no `blob_15` e **0** no lip. Em mistura, à noite elas ficam praticamente como no v11. Ou seja, o pedido "topo do mirante noturno trocado em vez do tint" **não** se cumpre de forma visível sem a regressão dos retângulos. Ver Limitações.
- **`?v12night=swap`:** mostra a troca literal, para o coordenador ou o game-art decidir. Só vale com o look v9.

### 3. Copas da borda da mata (`canopy-edge-variety/`)

- **Faixa:** árvores do v10 com o pé a menos de 5 tiles da borda do mapa. São 301 das 469.
- **O que muda:** cada árvore **mantém espécie e tamanho**, com o mesmo tronco, a mesma posição e a mesma colisão; só muda a chave. Ela ganha uma variante: normal (a copa do v10), `flip` ou `tone_dark`/`tone_light`.
- **Ordem:** as árvores são percorridas ao longo do perímetro (ângulo em volta do centro). Cada espécie e tamanho segue um ciclo embaralhado (Fisher–Yates com hash), reembaralhado a cada volta e sem repetir a variante na emenda. É a regra de distribuição do README do pacote, aplicada sobre a silhueta que o v10 já escolheu, e não sobre as 48 combinações.
- **A `leaning` não usa o flip [E/H]:** o tronco dela pende para a direita (o centróide da copa fica +15 px à direita do centro; o do tronco, −5 px), e o pacote só espelha a copa. Espelhada, a copa ficaria do lado contrário ao tronco. Ela tem 3 variantes, e as outras espécies têm 4: **30 visuais** (6×4 + 2×3).
- **Chaves:** `fp12_<espécie>_<tamanho>_<variante>`. O `_top` e o `_base` entram por `ScenePack.keyAliases`, e o `_base` é o tronco `fp10_…_base`. Os aliases são resolvidos depois do preset noturno, então à noite a copa é a variante de `…/night/`. O `topOffset`, o `rimLight.baked` e a grade são os da copa do v10. O gerador confere que cada PNG tem o mesmo tamanho da copa original.
- **Distribuição [E]:** normal 84, flip 54, escura 82, clara 81.

| Borda da mata (301 copas) | Antes (só espécie+tamanho) | Depois (com variante) |
|---|---|---|
| Visuais distintos | 8 | 30 |
| Distância à copa idêntica mais próxima: mínima / mediana | 93 / 118 px | 94 / 320 px |
| Copas com gêmeo idêntico a < 160 px | 269 | 36 |

### 4. Mapa-múndi v2.1

- **Troca:** `src/ui/worldmap.ts` importa `worldmap-v2_1/worldmap.json`, `worldmap_v2_1.png` e `poi_icons.png`, este último igual byte a byte ao do v1. Nenhuma outra mudança de lógica foi feita.
- **Teste [E]:** o schema, o `canvas`, o `viewport_px`, as 6 regiões (`pos_px`, `pos_pct`, `icon`) e as 5 rotas são idênticos aos do v1.
- **Marcador assado [E]:** contei, no PNG, os pixels dos 2 tons claros do anel do selo (`#aebbd6`, `#eef2fb`) num quadrado de 24 px em volta de cada `pos_px`, que é a área do POI dinâmico (48 px CSS = 24 px de arte).
  - v1: 79, 53, 39, 249, 86 e 90.
  - v2.1: **0 em todas as 6**. Há teste para isso, com o v1 como controle.
  - No centro exato de cada POI sobra um ponto 2×2 de tinta escura. É o primeiro ponto do tracejado da rota (`generate_worldmap_v2_1.py`, `s % 8 == 0`), e o POI o cobre inteiro.
- **Capturas [E]:** `v12_{antes,depois}_mundi_sem-poi_{dia,noite}.png` e o recorte `…_mundi_vila_sem-poi_*.png` mostram o PNG sem os POIs dinâmicos. No antes aparece o selo da casa na Vila; no depois, não. A captura também registra a arte carregada pelo jogo: `--wm-art` aponta para `worldmap_v2_1.png` (`v12_depois_capture_worldmap.json`).

## Capturas (`quality-overhaul/phase3/v12/`)

- **Formato:** 1920×1080 e HUD escondido. O mapa-múndi é a exceção: HUD v2 aberto, com o save "progress" semeado.
- **Antes:** o commit ab41fcf (v11 + mapa-múndi v1), servido de um worktree limpo e temporário em `/tmp/qo-before` na 5192.
- **Depois:** a 5190.
- **Troca:** a 5190 com `&v12night=swap`, só nas cenas de noite.
- **Pranchas:** `v12_lado-a-lado_*.png` (antes | depois [| troca]).

| Tema | Arquivos |
|---|---|
| Mirante de perto (zoom=4) | `v12_{antes,depois}_zoom_mirante.png` (dia), `…_zoom_mirante_noite.png`, `v12_troca_zoom_mirante_noite.png`, `*_grade32.png`, lado-a-lado de dia e de noite |
| Mirante de longe | `v12_{antes,depois,troca}_mirante_jogo_{dia,noite}.png` (visão de jogo), `…_mirante_geral_{dia,noite}.png` (zoom=1) |
| Copas da borda | `v12_{antes,depois}_copas_oeste_{dia,noite}.png`, `…_copas_sul_*.png` (zoom=2), `…_geral_*.png` (mapa inteiro) |
| Terra à noite (zoom=4) | `v12_{antes,depois,troca}_zoom_{terra-trilha-vau,acampamento,terra-fonte}_noite.png` + `…_zoom_terra-trilha-vau.png` (dia, referência) |
| Mapa-múndi aberto | `v12_{antes,depois}_mundi_aberto_{dia,noite}.png`, `…_mundi_sem-poi_*`, `…_mundi_vila{,_sem-poi}_*` |

**Grade medida** [E] (mesmo indicador do v11: razão entre a diferença de cor nos dois lados de uma linha de tile e a diferença dentro do tile; ~1 = a linha não se destaca):

| Área (zoom=4) | Antes (v11) | Depois (mistura) | Troca inteira |
|---|---|---|---|
| mirante, dia | 1,15 | 1,24 | — (dia igual ao depois) |
| mirante, noite | 1,11 | 1,22 | 1,35 |
| terra-trilha-vau, noite | 1,04 | 1,04 | 1,26 |
| acampamento, noite | 1,07 | 1,05 | 1,17 |
| terra-fonte, noite | 0,86 | 0,89 | 1,05 |
| terra-trilha-vau, dia | 0,94 | 0,96 | — |

No mirante, a razão sobe de dia e de noite porque o lip **desenha** uma borda (a banda de sombra na fileira norte), e isso é intencional. A troca inteira é a pior em todas as áreas de noite, o que confirma os retângulos.

## Desempenho

Mesmo método do v11: 600 quadros depois de 120 de aquecimento, Chromium headless, 1920×1080, dpr=1, Tamer em (28,19). Fiz 2 rodadas, a 2ª com a ordem invertida. Os arquivos são `v12_{antes,depois}_r{1,2}_capture_perf.json`. Os valores estão em ms.

| Enquadramento | Render+raster p50/p95, antes → depois (r1) | (r2) |
|---|---|---|
| jogo, dia | 2,0/2,5 → 4,2/8,1 | 3,4/4,6 → 2,3/3,1 |
| jogo, noite | 3,1/4,3 → 7,2/15,7 | 3,5/4,8 → 3,6/4,6 |
| geral, dia | 20,6/22,9 → 21,1/23,6 | 27,1/31,9 → 21,3/24,0 |
| geral, noite | 26,5/32,3 → 24,8/26,8 | 25,4/34,1 → 26,3/40,6 |

Leitura [H]: o "depois" da r1 foi o 1º a rodar logo depois de eu reiniciar a 5190, com load average ~4 na máquina (outro trabalho rodava no mesmo worktree, ver Limitações). Na r2 o depois ficou igual ou abaixo do antes na visão de jogo. Não vejo regressão. Pelo código, o custo novo é só no carregamento: o pacote v12 inteiro entra no mapa de tiles (92 PNGs de dia e 92 de noite, contando as artes `nightEarth`) e as grades da mistura são feitas uma vez por imagem. O quadro em si desenha o mesmo número de imagens. Dos 92 de dia, 63 (`tiles/` e `mirante/` do dia do pacote, que repetem os do v11 e ficam sob `fp12_`) são carregados e não são usados; ver Limitações. Uma 1ª tentativa da r2 do depois foi perdida porque uma recarga do Vite navegou a página no meio; a medição foi repetida.

## Gates

- `npm test`: **48 arquivos, 454 testes** passando.
  - Novo: `tests/forest-v12.test.ts`, com 6 testes: lip; noite em mistura e em troca; mistura pixel a pixel no `gradeTiles`; copas de borda; "sem o look v9 nada muda".
  - `tests/worldmap-v2.test.ts`: v2.1 no lugar do v1, mais 2 testes (mesmo schema e posições; 0 pixel de selo assado).
  - Atualizados: `forest-v10` e `look-v9` (as copas de borda podem ter chave `fp12_`), `forest-v11` (a fileira norte do topo é lip).
  - Uma rodada feita **durante** as capturas teve 5 falhas, que não se repetiram ([H] tempo esgotado com a CPU disputada; não guardei o detalhe). As rodadas seguintes, sem captura em paralelo, passaram inteiras.
- `npm run build`: ok.
- `npm run map:validate`: 6/6 PASS. O v9 validado direto também passa os 8 gates, com **wang** incluído (o lip conferido pelo `autotile`). Os relatórios em `docs/map-factory/validation/` só mudariam a data e não entram no commit.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## Arquivos (só os meus)

- `scripts/map-factory/v12-plateau-night.mjs` (novo) e `derive-look-v9.mjs` (chama o v12)
- `scripts/map-factory/tiled.mjs` e `validate.mjs` (`autotile`); `scripts/map-factory/context.mjs` (`keyAliases` e pranchas `_proof`)
- `src/assets/scene-tiles.ts` (`nightFor` em lista, `nightBaseName`, `nightBlend`, `keyAliases`); `src/assets/tiles.ts` (`TileSource.nightEarth`, `PACK_PROOF_RE` com `_proof`)
- `src/render/look.ts` (`isEarthPixel`, mistura no `gradeTiles`); `src/main.ts` (só `?v12night=swap` e a carga das imagens `nightEarth`)
- `src/ui/worldmap.ts` (imports do v2.1); `src/style.css` (só o comentário do bloco do mapa-múndi)
- `src/data/maps/v9/digimon-forest-01.{tmj,aliases,p7-report}.json` (regenerados pelo gerador)
- `tests/forest-v12.test.ts` (novo), `tests/worldmap-v2.test.ts`, `tests/forest-v10.test.ts`, `tests/forest-v11.test.ts`, `tests/look-v9.test.ts`
- `scripts/v12-capture.mjs`, `scripts/v12-sidebyside.mjs` e `scripts/v12-measure.ts` (novos, para as capturas e medições deste relatório)

## Limitações

- **A noite pintada do topo do mirante e do lip não aparece no padrão [E].** A rampa do pacote é a do forest-v4, e o chão do v9 à noite é arte do dia com grade, então a troca inteira vira retângulo azul-escuro. A mistura só aproveita os pixels de terra: 29 em 1024 no topo e 0 no lip. Para cumprir de verdade, uma de duas coisas precisa vir do game-art:
  - (a) noite pintada para o chão do v9 (`fp11_ground_variant_*`), para o mapa todo ficar na mesma noite; ou
  - (b) noite do topo e do lip pintada sobre a cor do chão do v9 à noite (≈ 78,105,74 depois da grade, matiz ~113°), e não sobre a rampa do forest-v4.

  Com qualquer uma delas, basta apagar o `nightBlend` dessas chaves, sem mudar código. A troca literal está em `?v12night=swap` para quem decidir.
- **O lip lê como uma moldura escura [E/H].** O lip só existe na fileira norte (limitação do pacote). Os cantos têm banda de sombra lateral só na 1ª célula, e no zoom=4 de dia aparece um "Π" escuro: a linha no alto e 2 tocos verticais de 1 tile nas pontas (`v12_lado-a-lado_zoom_mirante.png`). De longe (visão de jogo e zoom=1), lê como a borda de cima do platô, o que ajuda na limitação do v11 ("o platô não se destaca de cima") [H]. De perto, os tocos e a banda dura pedem peças de lado (leste/oeste) e um gradiente mais suave, trabalho do game-art. Não troquei os cantos por retas para esconder os tocos, porque isso contrariaria a regra do pacote.
- **Copas:**
  - A variedade é de **tom e espelho**, sem silhueta nova. O espaçamento em fileira, que também foi apontado no QA, continua: as posições e a colisão das árvores não mudaram, de propósito.
  - A `leaning` não espelha (tronco torto), e as combinações flip+tom não existem como PNG no pacote. São 30 visuais, e não os 48 do README.
  - A variação de tom (−8%/+6% de valor) é sutil na visão de jogo [H].
  - As árvores fora da faixa de 5 tiles seguem só com as 8 silhuetas.
- **Mapa-múndi:** os "brinquedos" da Vila (3 quadradinhos com contorno, decoração do PNG, iguais aos do v1) ficam a 3–12 px do POI. O POI cobre parte deles, e 2 cantos aparecem em volta do ícone dinâmico (`v12_depois_mundi_vila_dia.png`). Não é selo de POI (o anel claro dá 0), mas alguém pode ler como "sobra" [H]. O ajuste seria do game-art: afastar os brinquedos uns 8 px. O v2.1 continua atrás de `?hud=v2` (decisão de produto, não minha).
- **Trabalho concorrente no worktree [E]:** durante esta tarefa, outro trabalho fez 4 commits na mesma branch (`abdc228`…`c4ac5c8`, "official-mons") e editou `src/save/official.ts`. Ele também rodou a suíte, que regenera o `.tmj` do v9 com o mesmo conteúdo. Cada escrita recarregava o Vite da 5190: perdi 1 captura de noite do mapa-múndi e 1 rodada de desempenho, e as refiz. Conferi que esses commits não incluem nenhum arquivo meu. O meu commit entra em cima deles só com os meus caminhos.
- **Carga extra:** o carregador de pacote não filtra arquivos, então os 63 PNGs do dia do v12 que duplicam o v11 (`tiles/grass_dirt_wang47_*`, `mirante/mirante_top_blob_*`) entram sem uso. São pequenos (32×32), mas um filtro por pasta no `ExtraPack` resolveria.
- **Ambiente:** `/tmp/chromelibs` tinha sumido (WSL reiniciado) e foi refeito com `apt-get download` + `dpkg -x` de libnspr4, libnss3 e libasound2t64, sem instalar nada no sistema. As medições de desempenho são headless numa máquina compartilhada, sem GPU real e sem o navegador do fundador. A métrica de grade é um indicador, com criaturas e props por cima.
