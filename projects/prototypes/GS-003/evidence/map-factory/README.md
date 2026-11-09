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
