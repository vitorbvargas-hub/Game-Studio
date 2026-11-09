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
