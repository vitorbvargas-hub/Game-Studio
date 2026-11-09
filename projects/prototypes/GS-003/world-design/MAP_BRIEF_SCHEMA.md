# MAP_BRIEF_SCHEMA — formato do brief lógico de mapa (Map Factory)

- **Autor:** game-design · **Data:** 2026-11-09 · **Base:** ADR-011 (Map Factory), briefing `docs/briefing/12_map_factory_v2.md` §3–4, `prototype/world/README.md`, `src/world/regions.ts`, `src/data/maps/*.tmj.json`, `docs/ART_STYLE_GUIDE.md` §2 (tile = 32 px).
- **Papel na pipeline:** este é o entregável da **Etapa 1 (Briefing + planta, game-design)** do pipeline de 5 etapas do ADR-011. O brief é a **planta lógica** — regiões, rotas, POIs, spawns — que alimenta as etapas seguintes (direção de arte, tileset/montagem, validação, integração), executadas por game-art e game-dev. **Este documento não gera o `.tmj.json` nem altera código do jogo**; define o contrato de dados que o fizer (um gerador futuro em `shared/tools/map-factory/`) deve consumir.
- **Arquivo irmão:** `map-brief.schema.json` (JSON Schema draft-07), a versão validável deste formato.
- **[H]** todo o formato é uma proposta de design desta frente, ainda não implementada por nenhum script de geração. Os nomes de campo seguem o vocabulário do pipeline já existente (`to`/`toStart` dos portais Tiled, `speciesId` de `regions.json`, tile 32px) sempre que um equivalente real já existe no jogo.

## 1. Por que tiles e não pixels

O jogo grava objetos Tiled em **pixels** (ver `forest-proof.tmj.json`: um portal tem `x:928,y:1440,width:128,height:32`). O brief lógico usa **coordenadas em tiles** (inteiros, grade do mapa) porque:

- é o que um humano ou uma IA de design raciocina mais facilmente ("a clareira fica no centro do mapa, 16 tiles de largura"), sem fazer conta de ×32 a cada campo;
- fica independente da resolução de tile, caso ela mude um dia (hoje é fixa em 32 px, `ART_STYLE_GUIDE.md` §2);
- a conversão para pixels (`× tileSizePx`) é trivial e determinística, feita pelo gerador na Etapa 3 (game-dev), não pelo brief.

`dimensions.tileSizePx` registra o valor atual (32) para a conversão não ficar implícita.

## 2. Campos do brief

Todo campo abaixo é descrito em detalhe no schema (`map-brief.schema.json`). Resumo:

| Campo | O que é | Equivalente no jogo real |
|---|---|---|
| `id`, `name`, `biome` | Identidade do mapa | `id` do mapa em `regions.ts` → `MAPS` (ex.: `"forest-proof"`); `properties.regionName` do `.tmj.json` |
| `regionRef` | Região do GDD a que o mapa pertence (opcional) | `id` em `src/data/content/regions.json` (ex.: `"floresta_densa"`) |
| `levelRange`, `safeZone` | Faixa de nível e se é zona seguravelmente sem selvagens | `regions.json` `levelRange`/`safeZone` |
| `dimensions` | `tileSizePx` (32, fixo), `widthTiles`, `heightTiles` | `.tmj.json` `tilewidth`/`width`/`height` |
| `zones` | As **"regiões" do briefing do fundador** — áreas retangulares ou poligonais com um tipo (`spawn_area`, `clearing`, `concentration`, `secret`, `boss_arena`, `water`, `rock_field`, `village_hub`, `dense_border`, `other`). **Nome escolhido para não colidir com `regionRef`** (a região do GDD, ex. "Floresta Densa", é maior que um mapa; uma `zone` é uma subárea dentro de um mapa) | Não existe 1:1 ainda — hoje a "clareira" do `gen-forest-proof.mjs` é só matemática de raster (`CLEARINGS`), sem registro de dados. O brief formaliza isso. |
| `routes` | Rotas (`"main"` ou `"secondary"`) como lista ordenada de waypoints em tiles, com largura | A spline Catmull-Rom de `ROUTES` em `gen-forest-proof.mjs`, hoje hard-coded no script |
| `pois` | Pontos de interesse (mirante, ponte, entrada de área secreta...) sem mecânica própria | Objetos `point:true` do `.tmj.json` (como as árvores), mas de design, não de arte |
| `spawns` | Espécie, faixa de nível, zona/raio, quantidade e densidade | `wildSpecies` de `regions.json` + a lógica de spawn do mundo (fora do escopo desta frente) |
| `npcs` | NPCs (Digimon residentes não-hostis ou Tamers), posição, papel, diálogo | `NPC-*` de `bosses.json`/`regions.json` (ex. `NPC-ELECMON`) |
| `interactables` | Props com efeito (baú, placa, ponto de cura) | Ainda não existe no jogo; é o pedido explícito do fundador para esta entrega |
| `bossArena` | Zona, posição e raio da arena do chefe, chefe referenciado | `boss` de `regions.json` → `id` em `bosses.json` (ex. `"BOSS-KUWAGAMON"`) |
| `exits` | Portais de borda: `to` (id do mapa destino) e `toStart` (tag de ponto de chegada) | Objeto Tiled `type:"portal"`, propriedades `to`/`toStart` — **mesma convenção** usada em `forest-proof.tmj.json`/`praia.tmj.json`/`vila.tmj.json` |
| `vegetationDensityRules` | Densidade de vegetação por padrão, por tipo de zona e por zona específica | Decisão de arte (game-art), aqui só o parâmetro lógico que a instrui |
| `designGates` | Autoavaliação do game-design contra os gates do ADR-011 §7 (alcance do spawn até o chefe, rota alternativa) — **não substitui** a validação automática real do game-qa | §7 do briefing v2: "Gates automáticos (todos obrigatórios)" |

## 3. Regras de preenchimento

1. **Nunca inventar espécie.** Todo `speciesId` em `spawns` (e `npcs.speciesId`, quando o NPC é um Digimon residente) precisa existir em `prototype/world/src/data/world-species.json` **ou** em `knowledge/` (`evolution_chains.json` etc.), citando o id exato. O brief do piloto cita a origem de cada espécie usada.
2. **`exits[].to`** aponta para um `id` de mapa que já existe em `src/world/regions.ts` (`MAPS`) — hoje `"forest-proof"`, `"praia"` ou `"vila"` — **ou** para o `id` de outro brief desta mesma pasta (mapa novo, ainda não integrado). Quando o destino é um mapa real mas o portal de volta ainda não existe nele, marcar `exits[].integrated: false` e registrar a pendência nas limitações da entrega.
3. **Coordenadas sempre dentro de `[0, widthTiles)` × `[0, heightTiles)`.**
4. **`designGates`** é a opinião do game-design, não o gate real. O gate automático de verdade (BFS na grade de colisão, §7 do briefing v2) só existe depois que o game-dev gerar o `.tmj.json` e o game-qa rodar o validador — isso é trabalho de outra etapa/agente, fora desta entrega.
5. **Vegetação** é regra, não tile: o brief diz "alto/médio/baixo" por zona, não qual PNG usar — isso é decisão do game-art na Etapa 2.

## 4. Como os templates diferem do piloto

- `briefs/digimon-forest-01.json` é uma **instância**: valores concretos, para um mapa específico.
- `briefs/templates/*.json` são **modelos parametrizados**: também JSON válido contra o mesmo schema (então servem de exemplo executável), mas pensados para serem **copiados e ajustados** (mudar dimensões, deslocar zonas, trocar espécies pela faixa de nível certa) ao gerar um novo mapa do mesmo bioma. Cada template vem com uma página `.md` irmã explicando o layout, o ritmo de exploração, a faixa de nível e as regras de distribuição — a parte que não cabe em JSON.

## 5. Limitações deste formato

- **[H]** Não existe ainda nenhum código que leia este JSON e produza um `.tmj.json`. O "gerador" citado no ADR-011/briefing v2 é trabalho futuro de game-dev (Etapa 3); este brief é o contrato de entrada que ele deve respeitar.
- **[H]** O BFS de alcance (spawn → 100% dos POIs/spawns/NPC/chefe) e a checagem de colisão são **desenhados para serem possíveis** (zonas e rotas conectadas na planta), mas não foram simulados em grade real — isso é validação do game-qa.
- O formato não modela colisão tile a tile (paredes, água intransponível vs. vadeável) — fica a critério do game-dev na montagem, usando as `zones` como guia (ex.: `type:"water"` deve virar área sólida ou vadeável conforme a arte decidir).
