# Evidência — Map Factory fase 2: piloto "Digimon Forest — Prototype 01"

- **Autor:** game-dev · **Data:** 2026-11-09 · **Base:** ADR-011, `docs/briefing/12_map_factory_v2.md` §7, fase 1 (commit 5f215aa)
- **Insumos:** brief `world-design/briefs/digimon-forest-01.json` (game-design, schema v1), kit `art/map-factory/forest-v6/` (game-art)
- **Mapa no jogo:** `prototype/world/src/data/maps/digimon-forest-01.tmj.json` + `.aliases.json`, registrado em `src/world/regions.ts` (`MAPS`)

## Como reproduzir (dentro de `prototype/world/`)

```
npm run map:brief -- ../../world-design/briefs/digimon-forest-01.json   # adapta + gera + valida (8 gates)
npm run map:templates -- --preview                                      # 5 modelos → mapas de teste + relatório
npm run map:validate                                                    # todos os mapas do jogo
npm test && npm run build
OUT=$(cd ../../evidence/map-factory && pwd) CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=factory npm run shots:live
OUT=… W=1792 H=1280 CHROME_LIBS=… ONLY=factory-full npm run shots:live  # mapa inteiro (zoom 1)
```

## Gates (validador, `npm run map:validate`)

| Mapa | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|
| digimon-forest-01 (factory-v1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| vila (com o portal de volta) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| forest-proof, praia, test-meadow, forest-factory-test | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

- Alcance do piloto: 21/21 alvos (2 inícios, 8 spawns, 1 NPC, 8 POIs, arena, portal). Relatório: `validation-digimon-forest-01.md`.
- Avisos (não falham): 3 spawns têm 1 célula livre isolada na área de sorteio (bolsão entre árvores). A sim sorteia só células alcançáveis? **[H] não verificado**; o gate só avisa.
- `npm test`: 27 arquivos, 254 testes verdes. `npm run build`: ok.

## Capturas do jogo real (Chromium headless, `shots:live`)

| Arquivo | O que mostra |
|---|---|
| `factory_00_mapa_inteiro_dia.png`, `_noite.png` | O mapa inteiro no renderer do jogo (zoom 1, janela 1792×1280, HUD escondido) |
| `factory_01_entrada_inicio.png` | Chegada da Vila (início `from_vila`) |
| `factory_02a_entrada_npc_guia.png` | NPC Gigimon Guia (Digimon residente, não hostil) com o diálogo no toast |
| `factory_02b_entrada_placa.png` | Placa da entrada com o texto do brief |
| `factory_03_clareira_bau.png` | Clareira Central: baú aberto, "+50 bits" |
| `factory_04_clareira_cura.png` | Fonte de cura: "Guilmon recuperou PV e MP" |
| `factory_05_clareira_encontro.png` | Encontro com selvagem na clareira (AUTO) |
| `factory_06_riacho_ponte.png`, `factory_07_riacho_sobre_a_ponte.png` | Riacho (água blob-16 do forest-v6, sólida) e a ponte de 4 tiles (andável) com o Tamer em cima |
| `factory_08_clareira_oculta.png` | Clareira Oculta (rota do riacho, placa secreta, Tanemon) |
| `factory_09_campo_de_pedras.png` | Campo de Pedras (rock_big/rock_small do forest-v6 + rock_cluster do v4) |
| `factory_10_arena_chefe.png` | Arena do Kuwagamon: aviso "a luta de chefe ainda não existe nesta prova" (a câmera encosta na borda leste: a arena é o terço direito) |
| `factory_11_riacho_noite.png` | Riacho e ponte à noite (forest-v6 não tem noite: PNG do dia sob o grade noturno) |
| `factory_12_vila_saida_sul.png` → `factory_13_chegada_da_vila.png` → `factory_14_volta_na_vila.png` | Ida e volta **andando** pelos portais: Vila (saída sul) → Floresta Digimon → Vila |

Log da sessão de captura: NPC, placa, baú (+50 bits), cura, placa secreta e arena dispararam (`window.__gs003.interactions`); a volta terminou em `vila`.

## Prévias e modelos

- `previews/digimon-forest-01.png` (planta com colisão/alvos), `previews/digimon-forest-01_art.png` (só arte), `previews/vila.png`.
- `previews/template-*.png` e `templates-report.md`: os 5 modelos do game-design gerados como mapas de teste. Resultado: `template-village` PASS; `cave`, `desert`, `forest` e `mountain` passam em 7 gates e falham só em `portals`, porque o destino da saída não tem a chegada `from_template-*` (ou o mapa `montanha_overworld` não existe). É pendência de integração esperada, não erro do gerador.

## Teste automatizado do passeio

`prototype/world/tests/map-factory-pilot.test.ts`, caso "o jogador anda do início (chegada da Vila) até a Clareira Central e um encontro acontece no mapa": BFS na colisão da sim, `move_to` tile a tile até (28,21), verifica que o Tamer termina dentro da clareira e que sai um `encounter_start` com um selvagem de spawn do brief.

## Limitações

- **Chefe:** a sim não tem luta de chefe e `Kuwagamon` não existe em `world-species.json`. A arena é objeto `boss_arena` + trigger `boss_approach` validados; no jogo só mostra o aviso ao entrar.
- **Interação sem botão:** chegar a 1,5 tile dispara (uma vez até sair do alcance). Baú aberto vale só na sessão (não vai para o save). Placa e NPC usam o toast do HUD (1,6 s), não uma caixa de diálogo.
- **Diálogo do NPC** é o placeholder do brief. O loot do baú (50 bits) é placeholder do game-dev.
- **forest-v6 sem noite e sem Wang-47:** a água é blob-16; à noite usa o PNG do dia.
- **60 fps:** o contador do HUD mostrou 52–60 fps nas capturas headless; não é medição formal.

## Correções do QA (QA_DIGIMON_FOREST_01) — v2

Comandos novos (dentro de `prototype/world/`):

```
npm run map:brief -- ../../world-design/briefs/digimon-forest-01.json   # agora com riacho/trilhas orgânicos e ⚠ de raio recortado
OUT=$(cd ../../evidence/map-factory && pwd) W=1792 H=1280 CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=perf npm run shots:live
```

- **P1 spawn alcançável:** `parseTiledMap` pré-computa `map.reachable` (BFS 4-vizinhos a partir de todos os inícios); `spawnWild` só aceita célula alcançável e, se as 12 tentativas falharem, sorteia entre as células alcançáveis da zona. Teste: `tests/spawn-reach.test.ts` (bolsão murado no centro da zona, 40 sementes).
- **P1 performance:** `perf-digimon-forest-01.json` + `.md` (método completo no `.md`). **Ambiente headless** (chrome-headless-shell, `--disable-gpu`, raster em software), 600 quadros após 120 de aquecimento, mapa inteiro em zoom 1:

| Hora | trabalho do quadro p50/p95/p99 (ms) | intervalo p50/p95/p99 (ms) | fps médio | render+raster p50/p95/p99 (ms) |
|---|---|---|---|---|
| day | 4 / 5.6 / 6.6 | 16.7 / 33.4 / 33.4 | 40.4 | 15.9 / 20 / 24.8 |
| night | 5.8 / 7.7 / 9.4 | 33.3 / 33.4 / 33.5 | 38.4 | 17.9 / 20.4 / 23.2 |

- **P2 bioma:** zona de água comprida vira riacho em spline (meandro, largura variável, margem irregular, ponta afinada, encostado na borda norte); trecho reto com a largura da zona em volta da ponte (a ponte mede a faixa de água real); trilhas com meandro (âncoras = waypoints do brief, trechos perto da água ficam retos); clareiras com baías; borda da mata ao longo das trilhas recua 1–2 tiles. `organic: false` no `.build.json` volta ao traçado reto.
- **P2 raio recortado:** `adapt-brief.mjs` devolve `warnings` e o `map:brief` imprime `⚠ AVISO spawn …` (6 spawns do piloto).
- **Capturas antes/depois:** `factory_00_mapa_inteiro_{dia,noite}.png` → `_v2.png`; `factory_06_riacho_ponte`, `factory_07_riacho_sobre_a_ponte`, `factory_11_riacho_noite` → `_v2.png`; `previews/digimon-forest-01{,_art}_v2.png`. As demais `factory_*.png` foram refeitas no lugar com o mapa v2.
- **Limitação visual:** a água do forest-v6 é blob-16 sem peças diagonais, então de perto a margem do riacho fica em degraus de 1 tile; a curva aparece na escala do mapa, não no contorno do tile.

## Rodada 2 — brief v2 + kit forest-v7 (trilhas e riacho contínuos) — `_v3`

Brief: `world-design/briefs/digimon-forest-01.json` (v2 do game-design, 2026-11-09 17:29; v1 em `digimon-forest-01.v1.json`). Kit: `prototype/world/scripts/map-factory/kits/forest-v7.kit.json` (escolhido em `briefs/digimon-forest-01.build.json` → `"kit": "forest-v7"`).

```
npm run map:brief -- ../../world-design/briefs/digimon-forest-01.json
OUT=../../evidence/map-factory CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=factory-v3 npm run shots:live
OUT=../../evidence/map-factory W=1792 H=1280 SUFFIX=_v3 CHROME_LIBS=… ONLY=factory-full npm run shots:live
OUT=../../evidence/map-factory W=1792 H=1280 CHROME_LIBS=… ONLY=perf npm run shots:live
```

**O que mudou no motor**

- **Curvas contínuas** (`generate.mjs`: `sampleCurve`/`curveField`/`curvePolyline`; `src/render/curves.ts`): a trilha e o riacho saem como polilinha da spline (camada `curves` do TMJ, amostra a cada 0,5 tile, meia-largura em px por vértice). O renderer pinta a faixa pela **distância à linha central** (largura constante, ruído de borda ±1,25 px), com a textura cheia do pacote repetida em coordenadas do mundo. Não há mais degrau de 90°: o Wang-47 continua nas células (colisão, minimapa, gate `wang`), mas a borda vista é a da curva. Trilha: borda pontilhada de 1 px; água: 2 px de espuma.
- **Riacho em polígono** (`adapt-brief.mjs`: `polygonCenterline`): linha mediana do Z do brief (Dijkstra pelo meio do corredor), de borda a borda (norte → sul), meia-largura = metade do corredor (≈1,4–2,2 tiles, varia ~±20%), reta e com largura exata em volta de cada travessia; o POI `poi-mirante-clareira` (dentro do polígono) fica seco (faixa a ≥ 1,6 tile).
- **Duas travessias:** ponte `poi-ponte-riacho` 7×1 em (25..31, 9), eixo perpendicular ao riacho calculado no ponto, avançando 1 tile de terra em cada ponta; vau `poi-vau-pedras` 5×1 em (14..18, 22): células andáveis, pedras `fp7_rock_small_flat`/`fp6_rock_small` não sólidas, água rasa (mais clara, borda suave).
- **Água = Wang-16 do PixelLab** (autotile `c16`, 16 recortes `fp7_wg_c16_<NW8|NE4|SW2|SE1>` da prancha); lagoas usam o recorte suave (`smoothAutotile`), o riacho a faixa da curva. Gate `wang` agora confere `*_c16_*`.
- **Peças forest-v7 (fp7_)**: NPCs `npc-ranger` e `npc-merchant` com corpo parado sólido (o gate aceita o NPC sobre o próprio corpo e exige chegar ao lado); baú troca para `chest_open` ao abrir (`openKey`, `applyOpenedChests`); placa da entrada com seta; arbusto da entrada secreta (não sólido); flor/cogumelo digitais e grama c; pedra chata sólida no Campo de Pedras; chão da arena em 6 decalques. `kuwagamon_concept.png` fica de fora (o carregador ignora `concept/`).
- **Raio de spawn:** o adaptador media o quadrado como 2r+1; a sim sorteia em 2r. Corrigido: o brief v2 sai com **zero** avisos de recorte.

**Gates (digimon-forest-01, factory-v1):** layers, tile_ids, asset_keys, reach, placement, wang, species, portals — todos **pass**. Aviso: `spawn-dorumon` tem 1 célula livre fora do alcance (bolsão entre rochas).

**Capturas `_v3`:** `factory_00_mapa_inteiro_{dia,noite}_v3.png`; `factory_v3_01_riacho_ponte`, `02_sobre_a_ponte`, `03_riacho_vau`, `04_no_vau`, `05_trilha_curva_margem_oeste`, `06_entrada_secreta`, `07_arena`, `08_bau_aberto`, `09_npc_ranger_perto` (zoom 4), `10_npc_comerciante_vs_tamer` (zoom 4, escala), `11_riacho_noite`.

**Escala NPC × Tamer (captura 10):** os NPCs do PixelLab têm 58–59 px de altura opaca (comerciante 45×59, ranger 36×58, canvas 48×64); o Tamer do jogador mede ~28 px na mesma captura (régua: o comerciante). O NPC sai **≈ 2× maior** que o Tamer. Não redimensionei (pixel art não se reescala); precisa de um redesenho no tamanho do Tamer (game-art).

**Performance (`ONLY=perf`, headless, mesmo método da v2):**

| Hora | trabalho p50/p95/p99 (ms) | fps médio | render+raster p50/p95/p99 (ms) | quadros > 16,7 ms (raster) | props |
|---|---|---|---|---|---|
| day v2 | 4 / 5.6 / 6.6 | 40.4 | 15.9 / 20 / 24.8 | 207/600 | 852 |
| **day v3** | 3.1 / 3.9 / 4.5 | 49.9 | 12.6 / 14 / 15.9 | 4/600 | 642 |
| night v2 | 5.8 / 7.7 / 9.4 | 38.4 | 17.9 / 20.4 / 23.2 | 526/600 | 852 |
| **night v3** | 4.7 / 6.2 / 7 | 47.5 | 14.7 / 16.4 / 20.9 | 25/600 | 642 |

A faixa das curvas é composta uma vez por célula e fica no cache do chunk; o ganho vem sobretudo de ~25% menos props (o riacho maior e as trilhas tiram mata). Headless com raster em software; o dev server do fundador estava rodando na mesma máquina durante a medição.

**Limitações R2**

- Prévia PNG (`map:preview`) e minimapa desenham as células (Wang), não a faixa contínua; o jogo desenha a faixa.
- A colisão continua por célula: a água bloqueia até ~0,5 tile além da faixa vista e a faixa pode passar ~0,2 tile na célula vizinha andável.
- Junção riacho/lagoa: a célula de lagoa a ≤ 0,5 tile da linha do riacho vira faixa (sem caso no mapa atual).
- Arte: NPCs ≈ 2× o Tamer; `boss_arena_floor` e `flower_digital` têm moldura/base de grama de outra paleta (lêem como adesivo); a água do forest-v7 não tem noite (usa o PNG do dia sob o grade noturno).
- Rota do Vau reinterpretada em `.build.json` (ver o motivo lá): no brief v2 ela corria dentro do braço sul e ligava dois pontos do mesmo lado do riacho.

## Look v8 / capturas `_v4`: profundidade e beleza (DRAKANTOS_VISUAL_STUDY.md + pacote forest-v8-depth)

- **Autor:** game-dev · **Data:** 2026-11-09 · **Base:** commit 0178bad, pacote `art/map-factory/forest-v8-depth/` (c3110d1)
- **Como abrir:** `http://localhost:5174/?map=digimon-forest-01&look=v8`. Sem `?look`, o jogo carrega o v3 de sempre: o `.tmj` padrão regenera byte a byte igual.
- **Zoom:** com o look v8 o zoom automático é ×1,5 (arredondado para inteiro: o pixel continua perfeito). `?zoom=N` força a escala N, `?zoom=2x` (ou `1.5x`) multiplica a escala automática.
- **Mapa variante:** `prototype/world/src/data/maps/v8/digimon-forest-01.{tmj,aliases}.json`, com o mesmo id. Vem da montagem `scripts/map-factory/briefs/digimon-forest-01.v8.build.json`, que faz `extends` da montagem padrão, sem mudança nela. Para virar o padrão depois da aprovação, troque o `out` dessa montagem para `src/data/maps` e regenere.

```
npm run map:brief -- ../../world-design/briefs/digimon-forest-01.json --build scripts/map-factory/briefs/digimon-forest-01.v8.build.json
OUT=../../evidence/map-factory W=1792 H=1280 SUFFIX=_v4 QUERY=look=v8 CHROME_LIBS=… ONLY=factory-full npm run shots:live
OUT=../../evidence/map-factory W=1600 H=900 CHROME_LIBS=… ONLY=factory-v4 npm run shots:live
OUT=../../evidence/map-factory W=1792 H=1280 QUERY=look=v8 PERF_TAG=_v4 CHROME_LIBS=… ONLY=perf npm run shots:live
```

**O que entrou**

| # do estudo | Onde | O quê |
|---|---|---|
| 6 paleta | `src/render/look.ts` `gradeTiles` | `renderPreset` do `palette.json` (S×0,64, V×0,8; o rim de luz, que são os 12% mais claros, fica com S×0,88 e V×0,92) aplicado uma vez por imagem em toda a arte de cenário. Os verdes giram para o frio e as sombras puxam para azul/roxo (`coolShift`). Terra e pedra recebem tinta roxo-acinzentada, como no frame t0150. Criaturas, UI, NPCs, baú, placa, cura e os emissores do v8 ficam fora. À noite o grade mexe pouco no valor, porque o preset noturno já é escuro. |
| 3 luzes | `look.ts` `mapLights`/`lightSprite`/`flicker`, `view.ts` `drawLook` | Gradiente radial **aditivo** (`lighter`) em degraus de pixel art, a partir do campo `light` do `tileset.json` (cristal ciano, cogumelo magenta, totem âmbar). Também a fonte de cura, as placas (luz quente pequena), a flor e o cogumelo digitais do v7 e a lanterna do Tamer à noite. Flicker: o cristal pulsa devagar, o totem e a placa tremulam, o cogumelo respira. A intensidade vale ×0,55 de dia e ×1,35 à noite, sobre um ambiente em `multiply`. Não há fogueira no mapa. |
| 3 névoa e partículas | `look.ts` `fogAnchors`/`drawParticles` | Névoa macia e lenta nas células andáveis da borda da mata (mais forte à noite). As partículas não guardam estado (função do tempo por bloco de 8×8 tiles): vagalumes (fortes à noite, raros de dia), poeira digital ciano/roxa subindo e folhas caindo de vez em quando. |
| 4 sombra de contato | `look.ts` `drawPropShadows`, `view.ts` `drawShadow` | Elipse escura com núcleo sob todo prop, com o tamanho do sprite e guardada no chunk. As árvores ganham só o núcleo junto ao tronco, porque a sombra projetada já existia. As entidades têm sombra 15% maior, com núcleo e alfa 0,42 (antes 0,28). A base da face do penhasco tem oclusão em 3 degraus. |
| 1 chão | `depth.mjs` `depthGroundKey` + `look.groundSwap` | As clareiras usam as variantes `ground_variant_0/1/2/3/6` do v8, escolhidas por **ruído suave** (regiões de tom) e não por sorteio de célula. Na beira d'água entram a poça (7) e o musgo (1). A mesma lista entra sob as curvas e no recorte da borda da mata, para não haver costura. As variantes 4/5 (terra cheia) ficaram de fora porque viram blocos marrons quadrados. |
| 1 decalques | `depth.mjs` (camada `decals` do TMJ) | De 0 a 3 por célula por ruído, com flip aleatório, fora de trilha, água, ponte, face e arena: **959 decalques**. Os pools mudam pelo contexto: molhado (musgo, pedrinha, poça), borda da mata (folhas, raiz) ou aberto (pedrinha, folhas, musgo, rachadura rara). |
| 8 transições | `depth.mjs` | Tufos `tuft_over_path_a/b` na borda das 4 trilhas, a cada ~0,7 tile, como decalque. Juncos e pedras molhadas na margem do riacho, como props não sólidos com Y-sort (16). |
| frame 00:58 lama roxa | `depth.mjs` (camada `patches`) + `look.ts` `drawPatches` | O pacote não tem tile de lama. São **5 manchas** geradas no renderer: elipse com borda por ruído de 2 oitavas, 3 tons roxos por ruído, borda escura de 1 px e 35% dos pixels da borda deixados com o chão original (grama invadindo). Só aparecem nas células que o gerador liberou (longe de trilha, água e platô). |
| 2 penhasco | `depth.mjs` `depthTerrain` | **Mirante da Clareira**: platô 8×3 em (21..28, 15..17), no POI `poi-mirante-clareira` (a "pequena elevação" do brief), ao sul da curva do riacho. Topo em blob-16 do kit cliff com o miolo em grama (camada `ground_detail`, então a chave Wang continua coerente). Face com cantos na linha 18 e **rampa em (26,18)** virada para a trilha principal. A colisão (camada `collision`) cobre a face, menos a rampa, e o anel N/L/O fora do topo. O anel tem samambaias e arbustos para não ser uma parede invisível. No topo ficam um totem e um cristal. Teste ao vivo: rampa 0, face 1, topo 0, anel leste 1, mirante 0. Gate `reach` 24/24. |
| 3/5 emissores e clutter | `depth.mjs` `guides`/`beacons`/`edgeClutter` | **44 emissores**: clusters de 1–2 peças a cada 4–6,5 tiles ao lado das rotas principal, das Pedras e do Riacho (o lado alterna), puxando o olho até a clareira, a arena e a Clareira Oculta. Dois totens marcam a entrada da arena, há cristais e cogumelos perto da cura e do mirante. São **64 peças** de clutter na borda da mata (núcleo de samambaia/arbusto florido/tronco caído/cluster + 1–3 satélites, espaçados ≥ 3,2 tiles). |
| 7 zoom | `main.ts` | `zoomMul: 1.5` no look. Em 1920×1080 a escala passa de 3 para 4 (mais perto, ~15×8 tiles na tela). `?zoom=` configura. |

Os props e a grade de árvores do v3 são os mesmos. O passe de profundidade usa RNGs próprios e roda depois do sorteio principal. Nenhum prop do base caiu no platô, onde só entram as peças do próprio passe (771 props contra 642).

**Gates (variante v8):** layers, tile_ids, asset_keys, reach (24/24), placement, wang (inclui o `fp8_cliff_top_blob` blob-16), species e portals, todos **pass**: `validation-digimon-forest-01_v4.md`. Os 6 mapas do jogo também passam. `npm test`: 33 arquivos, 289 testes, 5 deles novos em `tests/look-v8.test.ts`. `npm run build`: ok.

**Capturas `_v4`**

| Arquivo | O que mostra |
|---|---|
| `factory_00_mapa_inteiro_{dia,noite}_v4.png` | Mapa inteiro, zoom 1, janela 1792×1280 |
| `factory_v4_clareira_luzes_{dia,noite}_v4.png` | Clareira Central: cura, cristais e cogumelos, lama roxa, lanterna do Tamer à noite |
| `factory_v4_riacho_{dia,noite}_v4.png` | Riacho com as margens, o vau e os decalques molhados |
| `factory_v4_plato_mirante_{dia,noite}_v4.png`, `factory_v4_plato_no_topo_dia_v4.png` | O platô com a face, a rampa e a oclusão; o Tamer em cima |
| `factory_v4_arena_{dia,noite}_v4.png` | Entrada da arena com os 2 totens |
| `factory_v4_lado_a_lado_v3_v4_{dia,noite}.png` | **v3 × v4 no mesmo enquadramento**: mesma semente, mesmo teleporte (28,21), zoom 3 |

**Performance (`ONLY=perf`, headless, mapa inteiro em zoom 1, que é o pior caso: todas as ~170 luzes na tela)**

As duas medições rodaram uma atrás da outra na mesma máquina. `perf-digimon-forest-01_v4.*` e `perf-digimon-forest-01_v3_rerun.*`. O `perf-digimon-forest-01.*` antigo da v3 continua lá.

| Hora | trabalho p50/p95/p99 (ms) | fps médio | render+raster p50/p95/p99 (ms) | quadros > 16,7 ms (raster) | props |
|---|---|---|---|---|---|
| day v3 (rerun) | 3.3 / 4.6 / 5.2 | 48 | 13.6 / 15.1 / 16.8 | 8/600 | 642 |
| **day v4** | 4 / 5.2 / 6.3 | 57.8 | 9.5 / 13 / 15.4 | 1/600 | 771 |
| night v3 (rerun) | 5 / 6.7 / 8.1 | 45.1 | 15.1 / 17.4 / 21.5 | 58/600 | 642 |
| **night v4** | 5.9 / 7.6 / 8.4 | 56.2 | 11.7 / 15 / 18.2 | 10/600 | 771 |

O trabalho do quadro (JS: luzes, névoa, partículas) sobe cerca de +0,7 a +0,9 ms no p50. O render+raster **cai**, porque o v4 desenha véu e vinheta de um canvas em cache, enquanto o `drawAmbient` do v3 refaz o gradiente radial em tela cheia a cada quadro. Lama, decalques e sombras ficam no cache do chunk. O headless oscila bastante: uma execução anterior do v4, sem esse cache, deu render p50 16,7/17,9 ms. A comparação vale para esta máquina, não para o dispositivo do jogador.

**Limitações**

- **O platô é baixo e "de pedra".** O kit tem 1 nível com face de 1 tile e topo blob-16 de pedra cinza com ruído. O topo fica com borda de pedra e miolo de grama, mas a leitura é de "laje" mais que de barranco orgânico. Platôs de contorno irregular precisariam de cantos internos e de mais variantes de face, que o pacote não tem. A arena continua no plano, porque elevar a arena exigiria passar a trilha e o trigger por uma rampa larga.
- **A lama é do renderer** (não há tile no pacote): não aparece na prévia `map:preview` nem no minimapa. A borda fica irregular, mas a textura é ruído e não pintura.
- **A colisão do platô é por célula:** o anel invisível N/L/O tem props de cobertura, mas pode haver um tile de grama "sem saída" na borda.
- **Luzes pontuais não projetam sombra** e atravessam as copas (brilho por cima da árvore quando o cristal está embaixo).
- **Não há fogueira nem lanterna real no mapa.** As placas ganharam uma luz quente pequena sem a arte de uma lanterna. Uma lanterna de verdade é pedido para o game-art.
- O NPC do PixelLab continua ≈2× o Tamer (limitação da v3). Com zoom ×1,5 isso aparece mais.
- Performance só em headless (`--disable-gpu`). O ganho de render vem do cache do véu, que poderia ir também para o v3.
