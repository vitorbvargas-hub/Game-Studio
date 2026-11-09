# Map Factory — pipeline de mapas do GS-003

- **Autor:** game-dev · **Data:** 2026-11-09 · **Base:** ADR-011, `projects/prototypes/GS-003/docs/briefing/12_map_factory_v2.md`
- **Escopo:** só documentação. O código fica no projeto, em `projects/prototypes/GS-003/prototype/world/` (abaixo: `world/`). Todo comando roda dentro de `world/`.
- **Formato:** Tiled JSON (`.tmj.json`), orthogonal, tiles de 32 px, tileset embutido com as propriedades `key` e `solid` por tile. É o que `src/sim/map.ts` (`parseTiledMap`) já lê. LDtk fica fora.

## Fluxo

```
brief (JSON)  →  gerador  →  .tmj.json + .aliases.json  →  validador (gates)  →  prévia / capturas  →  integração no jogo
game-design      game-dev      world/src/data/maps/           game-dev/game-qa       game-dev               game-dev
```

1. **Brief.** O game-design entrega a planta lógica: terrenos, clareiras, trilhas, spawns, NPCs, POIs, arena, portais.
   - O schema oficial do game-design está em `projects/prototypes/GS-003/world-design/map-brief.schema.json`. O gerador o aceita pelo adaptador (ver "Fase 2").
   - Internamente, o gerador lê a interface v0.1 em `world/scripts/map-factory/brief.schema.json`.
   - Exemplo completo: `world/scripts/map-factory/briefs/forest-factory-test.brief.json`.
2. **Kit de arte.** O game-art entrega o pacote em `assets/GAME-ASSETS/03-environments/<pack>/`, com `tiles/`, `props/` e, se houver, `night/` com os mesmos nomes.
   - Regra das chaves: `'<prefixo><nome>'` corresponde a `<nome>.png` do pacote.
   - Autotile: `<prefixo><terreno>_w47_<máscara>`, Wang/blob-47 com 8 vizinhos (N1 E2 S4 W8 NE16 SE32 SW64 NW128, diagonal só com as 2 bordas), ou `_blob_<máscara>`, com 4 vizinhos.
   - Árvores em 2 sprites: `X` = `X_base` + `X_top`.
3. **Gerar:** `npm run map:brief -- <brief.json>`. Saída em `brief.out`, que por padrão é `src/data/maps/`:
   - `<id>.tmj.json`;
   - `<id>.aliases.json`, com a base copiada de `pack.aliasesFrom` e `pack`/`prefix`/`night` do brief por cima.

   O gerador valida a saída na hora. É determinístico: mesma semente, mesmo mapa.
4. **Validar:** `npm run map:validate` valida todos os mapas. Para validar só alguns: `npm run map:validate -- <id|arquivo.tmj.json>`. Os relatórios JSON + MD saem em `world/docs/map-factory/validation/` (um por mapa, mais `summary.*`). O comando sai com código 1 se algum gate falhar. Os mesmos gates rodam no `npm test` (`tests/map-factory.test.ts`).
5. **Prévia:** `npm run map:preview -- <id|arquivo>` gera um PNG estático em `world/docs/map-factory/previews/`, sem navegador e sem registrar o mapa.
   - Mostra o chão e os props com a arte do pacote e, por cima, a camada de jogo: colisão em vermelho, bolsões inalcançáveis em amarelo, spawns, NPC, POI, arena, portais e inícios.
   - É uma aproximação do renderer (sem luz e sem recorte suave). Use para revisar a planta.
6. **Integrar e capturar:**
   - Registrar o mapa em `world/src/world/regions.ts` (`MAPS`: id, região, `tmj`, `pack`) e ligar os portais de volta nos mapas vizinhos.
   - Captura real: `npm run shots:live` com `QUERY="map=<id>"` (Chromium headless; ver o cabeçalho de `scripts/capture-live.mjs`).
   - Evidência do aceite (§7 do briefing): `evidence/map-factory/`.

## Gates do validador

| Gate | Verifica |
|---|---|
| `layers` | Camadas do perfil. **legacy**: `ground` + uma camada de objetos (mapas antigos). **factory-v1** (propriedade `mapProfile`): `ground`, `ground_detail`, `objects_below`, `objects_above`, `collision`, `spawns`, `npcs`, `triggers`, `poi`. Objeto na camada errada gera aviso |
| `tile_ids` | Todo gid existe no tileset, sem bits de flip. Os dados têm W×H células e os props têm `key` |
| `asset_keys` | Toda chave (tile e prop) resolve num PNG do pacote ou da biblioteca global, de dia e, se o pacote tem `night`, de noite |
| `reach` | BFS em 4 direções na grade de colisão, a partir do início `player`, alcança todos os inícios, centros de spawn, NPCs, POIs (o POI pode ser sólido: basta chegar ao lado), arena de chefe e portais |
| `placement` | Nenhum início, centro de spawn ou NPC fica em célula bloqueada ou sobre portal. NPC não fica empilhado em outro NPC nem em início. A área de sorteio do spawn tem células livres ≥ `count`. Avisos: área pouco livre e células livres isoladas do jogador (bolsões) |
| `wang` | A máscara de cada tile `_w47_`/`_blob_` bate com os vizinhos da mesma família, e a máscara w47 está normalizada. A política de borda do mapa (`in`/`out`/`clamp`) é deduzida por família |
| `species` | As espécies dos spawns existem em `world/src/data/world-species.json`. Níveis, `count` e área são válidos |
| `portals` | `to` é um mapa conhecido e `toStart` existe nele, é livre e não cai sobre outro portal. Avisos: portal fora da borda e destino sem portal de volta |

A colisão do validador é a mesma da sim. Há um teste que compara a grade com a de `parseTiledMap` em todos os mapas. Ela soma três fontes:
- tiles com `solid = true`;
- props sólidos (`solidW` × `solidH` a partir do pé);
- objetos `collision` (retângulo, suporte acrescentado ao parser em 2026-11-09).

## Onde fica cada coisa (em `world/`)

| Caminho | O que é |
|---|---|
| `scripts/gen-map-from-brief.mjs` | CLI do gerador (`npm run map:brief`) |
| `scripts/map-factory/generate.mjs` | Lógica do gerador. Generaliza `gen-forest-proof.mjs`: trilha em spline Catmull-Rom com meandro e limpeza de borda, Wang-47/blob-16, props em grade, manchas, dispersão, borda e posições fixas |
| `scripts/validate-map.mjs` | CLI do validador (`npm run map:validate`) |
| `scripts/map-factory/validate.mjs` | Os gates e o relatório MD |
| `scripts/map-factory/context.mjs` | Espécies, índice de mapas e resolvedor de chaves → PNG (mesma regra de `src/assets/tiles.ts` e `scene-tiles.ts`) |
| `scripts/map-factory/tiled.mjs` | Leitura e escrita de `.tmj` e grade de colisão |
| `scripts/map-preview.mjs` | Prévia PNG (`npm run map:preview`) |
| `scripts/map-factory/brief.schema.json` | Interface interna do brief (v0.1) |
| `scripts/map-factory/adapt-brief.mjs` | Adaptador do brief oficial do game-design (schema v1) para a v0.1 |
| `scripts/map-factory/kits/forest-v6.kit.json` | Kit de montagem: forest-v4 (`fp4_`) + forest-v6 (`fp6_`), terrenos e regras |
| `scripts/map-factory/briefs/<id>.build.json` | Ajustes de montagem de um mapa (rotas corrigidas, semente) |
| `scripts/map-templates.mjs` | Os 5 modelos do game-design como mapas de teste + relatório (`npm run map:templates`) |
| `src/sim/interact.ts` | Placa, baú, cura, NPC e arena na sim |
| `tests/map-factory-pilot.test.ts` | Piloto: determinismo, 8 gates, fp6_, colisão, interativos, passeio até a clareira com encontro |
| `scripts/map-factory/briefs/` | Briefs |
| `tests/map-factory.test.ts` | Gates nos mapas do jogo, um caso negativo por gate, determinismo do gerador e carga do mapa gerado na sim |
| `tests/fixtures/maps/forest-factory-test.*` | Saída do brief de exemplo (fixture, não registrada no jogo) |
| `docs/map-factory/validation/` | Relatórios do validador |
| `docs/map-factory/previews/` | Prévias |
| `scripts/gen-forest-proof.mjs`, `gen-region-maps.mjs` | Geradores antigos dos mapas atuais. Continuam valendo, sem alteração |

## Fase 2 (2026-11-09): brief oficial, forest-v6 e o piloto no jogo

### Brief oficial do game-design → gerador

- `npm run map:brief -- <brief>` agora aceita os dois formatos. Um brief com `schemaVersion: 1` (o schema oficial em `world-design/map-brief.schema.json`) passa antes pelo **adaptador** `world/scripts/map-factory/adapt-brief.mjs`, que produz o brief v0.1 e grava uma cópia em `scripts/map-factory/briefs/adapted/<id>.brief.json`.
- O adaptador usa um **kit de montagem** (`--kit`, padrão `forest-v6` → `scripts/map-factory/kits/forest-v6.kit.json`): pacotes de arte, terrenos, tipo de zona → terreno, árvores, regras de vegetação por densidade, props dos interativos e peças da ponte.
- Ajustes que o brief não resolve ficam num arquivo de **montagem** opcional, `scripts/map-factory/briefs/<id>.build.json` (semente, saída, waypoints corrigidos de uma rota, inícios). Cada ajuste leva o motivo.
- Regras do adaptador:

| Brief | Vira |
|---|---|
| `zones` (clareira, spawn, concentração, secreta, arena, pedras, `cave_floor`, `dune`, `village_hub`) | área de clareira em elipse que cobre o retângulo |
| `zones` `water` | retângulo de água pintado **depois** das trilhas (sólido; a trilha não atravessa) |
| `zones` `dense_border`, `cliff` | ficam mata (sólida por dentro) |
| `routes` | trilha em spline pelos waypoints (centro do tile); a largura vira o raio |
| `pois` `crossing` dentro de água | ponte no eixo curto da zona: células andáveis + arte em `ground_detail` (ponta, meio repetido, ponta) |
| `exits` | portal + chão de clareira + trilha curta + início `from_<destino>` 2 tiles para dentro |
| `spawns` | retângulo do raio em volta do centro da zona, cortado pela zona |
| `npcs` | objeto `npc` com `speciesId`, `displayName`, `dialogue` |
| `interactables` | POI com `kind` chest/sign/heal_point e `text` (trecho entre aspas do `effect`) + prop do kit na célula |
| `bossArena` | `boss_arena` (retângulo da zona) + trigger `boss_approach` |
| `vegetationDensityRules` | manchas de grama alta, flores e cogumelos por zona; `rock_field` ganha rochas sólidas e decorativas |

### Novidades no gerador, validador e prévia

- Gerador: `areas[].afterPaths`, `bridges` (células andáveis sobre terreno sólido, arte na `ground_detail`), `details`, `within` em scatter/edge e `force`/`ox`/`oy` em props `fixed`.
- Pacote suplementar por mapa: `aliases.extraPacks: [{ pack, prefix, root, crops }]`. `root: "map-factory"` lê `projects/prototypes/GS-003/art/map-factory/<pack>/` (alias `@gs003-art` no Vite). `crops` cria chaves recortadas de um PNG. Jogo (`scene-tiles.ts`), validador (`context.mjs`) e prévia seguem a mesma regra. Sem `night/`, a noite usa o dia.
- `npm run map:templates [-- --preview]` gera os 5 modelos de `world-design/briefs/templates/` como mapas de teste em `tests/fixtures/maps/templates/` e escreve `docs/map-factory/templates-report.md`. Resultado em 2026-11-09: `village` PASS; `cave`, `desert`, `forest` e `mountain` falham só no gate `portals`, porque o destino não tem a chegada `from_template-*` (ou o mapa não existe).

### Na sim e no jogo

- `parseTiledMap` lê `npc`, `poi` com `kind` chest/sign/heal_point e `boss_arena` (`WorldMap.npcs/interactables/arenas`, opcionais).
- `createWorld` põe cada NPC com espécie como entidade `npc`: parada, sem IA, ninguém a ataca.
- `src/sim/interact.ts`: chegar a 1,5 tile dispara uma vez. Placa e NPC mostram texto. Baú dá 50 bits uma vez por sessão. Cura enche PV/MP da parceira fora de combate. Arena mostra aviso de chefe.
- Piloto: `digimon-forest-01` registrado em `MAPS` (região `floresta_densa`), com ida e volta pela saída sul da `vila` (portal reverso em `gen-region-maps.mjs`).
- Captura: `ONLY=factory` e `ONLY=factory-full` em `scripts/capture-live.mjs`. Evidência em `projects/prototypes/GS-003/evidence/map-factory/`.

## Limitações conhecidas

- **Interativos mínimos.** NPC, placa, baú e cura funcionam por proximidade, sem botão e sem caixa de diálogo (toast). Baú aberto não vai para o save. `trigger` continua só validado.
- **Sem luta de chefe.** A arena é objeto validado mais um aviso. A sim não tem chefe, e Kuwagamon não está em `world-species.json`.
- **Um kit só.** Caverna, deserto, montanha e vila usam a arte de floresta nos mapas de teste.
- **`objects_above` sai vazia.** As copas vêm da chave da árvore, montadas pelo renderer. `ground_detail` sai zerada.
- **BFS em células inteiras, 4 vizinhos.** É conservador: não modela o raio do corpo nem passagens diagonais em sub-tile.
- **Sem medição de performance (60 fps).** Esse gate do §7 fica para a integração do piloto.
- **Licença do sprite não é conferida.** O gate de espécies verifica só a existência em `world-species.json`, não a licença em `CREDITS.md`.
- **Água só em blob-16 e só de dia** (forest-v6). Não tem Wang-47 nem preset noturno.

## Rodada 2 — curvas contínuas e kit forest-v7 (2026-11-09)

- **Kit `forest-v7`** (`world/scripts/map-factory/kits/forest-v7.kit.json`): forest-v6 + pacote do PixelLab `art/map-factory/forest-v7-pixellab/` com prefixo `fp7_` (aditivo). Colisão de cada peça no campo `collision` do kit. O mapa escolhe o kit no `.build.json` (`"kit"`), ou `--kit`.
- **Trilhas e riacho contínuos:** terreno com `curve: { fill, ground, edge, foam? }` no kit; trilha com `curve: { halfWidth, pad }` e riacho (`shape: "river"`) com `curve: { pad }` no brief v0.1. O gerador escreve a camada de objetos `curves` (polilinha em px + `hw` por vértice, `fill`, `ground`, `prefix`, `edge`, `z`, `fords`); o renderer (`world/src/render/curves.ts`) pinta a faixa por distância à linha central. As células continuam com a chave Wang (colisão e gates).
- **Autotile `c16`** (Wang de 16 por cantos, bit NW8 NE4 SW2 SE1): chave `<prefixo>c16_<máscara>`, conferida pelo gate `wang`.
- **Travessias:** `bridges[]` com `auto: true` aceita `axis: "auto"` (perpendicular ao riacho), `pad` (tiles de terra em cada ponta), `setV` (arte da ponte vertical) e `kind: "ford"` (vau: células andáveis + `fordStones` não sólidas + água rasa no renderer).
- **Adaptador:** zona de água em **polígono** vira riacho pela linha mediana (`polygonCenterline`), de borda a borda; POI não-travessia dentro dele fica seco; `crossingKind` lê vau/ponte do POI; NPC sem `speciesId` ganha corpo do kit (`npcSprites`, prop com `npc` = id); POI `secret_entrance` recebe `secretEntrance`; `openStateAssetRef`/`altAssetRef` do brief → `openKey`/placa com seta; `arenaFloor` vira decalques em `ground_detail`. Raio de spawn agora mede 2r (como a sim).
