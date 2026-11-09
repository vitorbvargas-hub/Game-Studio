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
   - O schema oficial do game-design vai ficar em `projects/prototypes/GS-003/world-design/map-brief.schema.json`. Em 2026-11-09 ele ainda não existia.
   - O gerador lê a **interface provisória v0.1** em `world/scripts/map-factory/brief.schema.json`. Quando o schema oficial chegar, há duas saídas: um adaptador converte o brief oficial para a v0.1, ou a v0.1 é ajustada a ele.
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
| `scripts/map-factory/brief.schema.json` | Interface provisória do brief (v0.1) |
| `scripts/map-factory/briefs/` | Briefs |
| `tests/map-factory.test.ts` | Gates nos mapas do jogo, um caso negativo por gate, determinismo do gerador e carga do mapa gerado na sim |
| `tests/fixtures/maps/forest-factory-test.*` | Saída do brief de exemplo (fixture, não registrada no jogo) |
| `docs/map-factory/validation/` | Relatórios do validador |
| `docs/map-factory/previews/` | Prévias |
| `scripts/gen-forest-proof.mjs`, `gen-region-maps.mjs` | Geradores antigos dos mapas atuais. Continuam valendo, sem alteração |

## Limitações conhecidas

- **Camadas factory-v1 só no gerador.** O motor lê todas as camadas de objetos pela classe (`prop`, `spawn`, `start`, `portal`, `collision`). `npc`, `poi`, `boss_arena` e `trigger` são validados, mas a sim ainda os ignora. Ligá-los ao jogo é trabalho da integração.
- **`objects_above` sai vazia.** As copas vêm da chave da árvore, montadas pelo renderer. `ground_detail` sai zerada.
- **BFS em células inteiras, 4 vizinhos.** É conservador: não modela o raio do corpo nem passagens diagonais em sub-tile.
- **Sem medição de performance (60 fps).** Esse gate do §7 fica para a integração do piloto.
- **Licença do sprite não é conferida.** O gate de espécies verifica só a existência em `world-species.json`, não a licença em `CREDITS.md`.
- **Gerador sem água/costa com arte de forest-v4.** O pacote não tem esses tiles. O gerador já aceita qualquer terreno `blob16`/`w47` com `solid: true`, então basta o kit do game-art trazê-los.
