# GS-003 · Sprite Viewer (ferramenta interna)

Visualizador de sprites do briefing 01 §10. Roda só em dev local (`vite`), lê a biblioteca de assets do disco e grava a homologação (aprovar/rejeitar) no `creature.json`.
Uso interno: não publicar.

## Rodar

```bash
cd projects/prototypes/GS-003/prototype/sprite-viewer
npm install --offline     # o registry está bloqueado neste host; as deps vêm do cache npm
npm run dev               # http://127.0.0.1:5180/
npm test                  # vitest: AnimData, manifest, servidor (fs/review) e smoke da UI (jsdom)
npm run typecheck
npm run fixtures          # regenera fixtures/ (também desfaz aprovações feitas nas fixtures)
```

## O que faz

| Função (briefing §10) | Como |
|---|---|
| Galeria de criaturas | Cards com miniatura (1º quadro do idle na direção S), status, raridade e contador de erros de manifest |
| Filtros | Texto (id, nome, elemento, estágio), fonte, categoria, raridade e status |
| Preview animado | Canvas com escala inteira e nearest-neighbor, alinhado pela base. Durações por quadro, loop ou uma passada |
| Quadros individuais | Faixa com todos os quadros da direção, duração em ms e eventos (`hit`, `rush`…). Clicar pausa no quadro. Também ◀/▶ quadro a quadro |
| Velocidade | 0,1× a 4×; tocar/pausar (também com espaço). ↑/↓ trocam a animação |
| Animação e direção | Seletor de animação + rosa dos ventos de 8 direções (só habilita as que existem; espelhadas marcadas) + painel com todas as direções animando juntas |
| Comparar versões | "comparar com": dois previews lado a lado, sincronizados, na mesma escala |
| Licença | Camada (ADR-009), SPDX, autor, URL, arquivo de licença, origem, notas |
| Aprovar/rejeitar | Botões Aprovar / Rejeitar / Em revisão + revisor + nota → `POST /api/review` → grava `status` e acrescenta `{status, at, by, note}` em `review[]` no `creature.json` (escrita atômica) |
| Overlays | Sombra (PMD `*-Shadow.png`), origem e âncoras, hitbox |
| Validação | Erros e avisos do manifest aparecem na ficha. Um manifest quebrado não derruba a galeria |

## Fontes lidas

| Chave | Caminho padrão | Gravável | Variável de ambiente |
|---|---|---|---|
| `assets` | `~/projects/GameStudio/assets/GAME-ASSETS/` (procura `creature.json` recursivamente, até 6 níveis) | sim | `GS_ASSETS_ROOT` |
| `fixtures` | `fixtures/GAME-ASSETS-sample/`: 3 criaturas de teste geradas por código (formas geométricas originais). **Fora da galeria padrão**; usadas pelos testes | sim | `GS_VIEWER_FIXTURES=1` inclui na galeria |
| `pmd`, `pmd-v2` | `GS-003/art/sprites/pmd/`, `.../pmd-v2/`: cada subpasta com `AnimData.xml` é uma criatura. O mesmo nome em várias raízes vira **versões** da mesma criatura | **não** (sem `creature.json`) | `GS_PMD_ROOTS` (separadas por `:`) |

Os arquivos são servidos por `GET /fs/<chave>/<caminho>` (só `.png/.json/.xml/.md/.txt`, com proteção contra `..` e contra symlinks que saem da raiz). `POST /api/review` recusa POST de outra origem.

## Schema oficial (07-manifests)

`creature.json` no formato de `GAME-ASSETS/07-manifests/creature.schema.json` (tem `approvalStatus` ou `animations.*.frames[]`) é lido por `parseOfficial` em `src/manifest.ts`:

- Quadros: `animations.<anim>.frames[].atlasKey` → retângulo no atlas JSON Hash (`spritesheets/*.json`, `meta.image` = folha). Tempo por `durationMs` (ou `fps`).
- Direções: `directions.<anim>.drawn` + `mirrored` (flipX). Para a 2ª direção desenhada em diante, a chave é a da 1ª com `_<DIR>_` trocado (nome `<id>_<anim>_<dir>_<NN>.png`, SPRITE_SPECIFICATION §6).
- Licença: `license.json` ao lado (camada `layer`, `credit.ripper`/`preservedBy`, `source.fileUrl`, `copyright`); sem ele, cai em `assetOrigin.layer` com aviso. Camadas aceitas incluem `official-fan-use` (ADR-009).
- Âncoras: `pivot` vira `feet`; `shadow {cx,cy}` vira ponto. Review grava `approvalStatus` (não cria `status`).
- Primeiro uso: as 4 linhas piloto DW DS (`CREATURE-0002`…`0013`, importadas por `GS-003/tools/dwds_import/`).

## Schema provisório (legado)

Às 16:00 de 2026-11-08, `GAME-ASSETS/07-manifests/creature.schema.json` (do game-art) **ainda não existia**. O viewer usa então `schema/creature.schema.provisional.json`, escrito a partir do briefing 01 §5 e do ADR-009: id, nome, descrição, categoria, raridade, elemento, atributos, estágio, linha e requisitos de evolução, dimensões, hitbox, âncoras, origem, licença, status e score, mais o histórico `review[]` e as `versions[]` com animações.

- Quando o schema oficial aparecer, o badge no topo passa para "schema oficial" automaticamente. **O parser (`src/manifest.ts`) não valida contra o JSON Schema**: ele implementa as regras do provisório à mão e é tolerante a campos extras. Se o schema oficial divergir (nomes de campo de animação, por exemplo), ajuste `parseGridAnim` e `normalizeItem` e os testes em `tests/manifest.test.ts`.
- Animação `format: "grid"`: uma folha PNG por animação, **linhas = direções** (`directions`, ordem das linhas) e **colunas = quadros**. `mirror: {"W":"E"}` gera direções espelhadas. Tempo por `fps` ou `durationsMs`. Eventos por quadro (`events: [{frame, name}]`).
- Versão `format: "pmd"`: `path` aponta para uma pasta com `AnimData.xml` dentro da pasta da criatura.

## Formato PMD

`src/animdata.ts` tem um parser XML mínimo próprio (sem dependências). Ele lê `Name`, `Index`, `FrameWidth`, `FrameHeight`, `Durations`, `RushFrame`, `HitFrame`, `ReturnFrame`, `CopyOf` e `ShadowSize`. A grade segue a ordem de 8 linhas `S, SE, E, NE, N, NW, W, SW` (conforme `art/sprites/pmd/README.md`); uma folha de 1 linha vale para todas as direções. O número de linhas e colunas vem do tamanho real do PNG (lido do cabeçalho pelo servidor), e há aviso quando ele não bate com o XML. Animações `Attack`, `Hurt`, `Defeat` e afins tocam uma vez; as demais repetem.

Testado com `GS-003/art/sprites/pmd/agumon/` (5 animações, 8 direções, sem avisos).

## Estrutura

```
src/types.ts      modelo normalizado (CreatureView/VersionView/AnimView/FrameRef), reaproveitável pelo jogo
src/animdata.ts   XML + AnimData.xml → VersionView
src/manifest.ts   creature.json → CreatureView (validação, versões, filtros)
src/player.ts     quadro por tempo (durações variáveis, loop/uma passada)
src/main.ts       UI (DOM + canvas)
server/library.ts varredura das raízes, tamanho de PNG, proteção de caminho, gravação do review
vite.config.ts    raízes + middleware de dev (/api/library, /fs/*, /api/review)
schema/           schema provisório
scripts/make-fixtures.mjs  gera fixtures (PNG próprio via zlib)
tests/            vitest (39 testes; official.test.ts abre as 12 criaturas piloto reais se GAME-ASSETS existir)
```

## Limitações

- **Não foi aberto num navegador real**: o Chromium headless não roda neste host. A UI foi verificada pelo smoke test jsdom (estrutura, fluxo e POST) e pelos endpoints via curl, mas **o desenho no canvas (pixels) não foi verificado**.
- O parser do formato PMD cobre o subconjunto usado pelo game-art. `Offsets.png` (pontos de cabeça e mão) não é interpretado.
- `1 tick PMD = 1/60 s` é uma convenção [H] não confirmada em fonte primária.
- Pastas PMD são só leitura: não há onde gravar status sem `creature.json`.
