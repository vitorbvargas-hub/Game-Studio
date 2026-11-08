# TECH_AUDIT — GS-003 Idle MMORPG (Fase 1, parte técnica)

- **Autor:** game-dev (subagente) · **Data:** 2026-11-08
- **Base:** ADR-009 (reset para Idle MMORPG, combate no mapa), briefing `docs/briefing/01_GS001_creature_world_foundation.md` §3, §9, §10, §12, §16.
- **Legenda:** **[E]** evidência verificada neste host em 2026-11-08 (comando ou arquivo citado) · **[H]** hipótese/estimativa.

---

## 1. Resumo executivo

1. **O motor atual (`prototype/game/`) é sólido e testado**, mas foi escrito para um idle com *cena de batalha 3v3 separada* (320×180, slots fixos). Isso contraria a regra obrigatória do briefing §3. **A simulação, o RNG, o save, o offline, os content packs, a validação e o pipeline de testes são reaproveitáveis**; **o `BattleRenderer` e o layout de slots não são**.
2. **Phaser 3 não está disponível de forma confiável neste host [E]:** o npm registry devolve 403, o pacote não está no cache npm, o curl para jsDelivr/unpkg falha no proxy de saída (403 no CONNECT) e o `web_fetch` alcança o jsDelivr, mas **trunca** o `phaser.min.js` em ~750 KB (o arquivo tem ~1,2 MB [H]).
3. **Recomendação: manter o Canvas 2D próprio (TS + Vite)**, com um renderer de **mundo** novo (tilemap em chunks pré-renderizados, ordenação por Y, culling, sprite atlas), e manter a fronteira sim/render que já existe, para que o Phaser (ou o PixiJS) possa entrar depois **trocando só a camada de render**. Justificativa na §5.

## 2. Inventário de `prototype/game/` [E]

Leitura em 2026-11-08. Nada foi alterado nesse diretório.

| Item | Onde | Tamanho | Estado |
|---|---|---|---|
| Stack | `package.json` | TS 5.9.3, Vite 7.3.7, Vitest 3.2.7, jsdom 26.1.0 (só dev). Zero dependências de runtime | ✅ |
| Simulação determinística | `src/sim/` (types, rng, formulas, battle, game, offline, save, content, strings) | ~1 400 linhas | ✅ Puro TS, sem DOM, tick fixo de 100 ms, RNG mulberry32 com estado no save |
| Content packs | `packs/{digimon-fan,original-a,original-b}/` + `src/packs.ts` (`import.meta.glob`) | 9 JSON por pack | ✅ Validados no boot e no `npm test` |
| Save versionado | `src/sim/save.ts` | `SAVE_VERSION = 3`, migrações, `StorageLike` | ✅ |
| Offline com teto | `src/sim/offline.ts` | amostra e extrapolação, custo constante | ✅ |
| Render | `src/render/renderer.ts` (`BattleRenderer`), `anim.ts`, `pixelfont.ts` | ~360 linhas | ⚠️ É uma **cena de batalha** 320×180 com slots fixos |
| HUD | `src/ui/hud.ts` (DOM) | 236 linhas | ⚠️ Os menus são reaproveitáveis; o fluxo "batalha → próxima onda" não é |
| Testes | `tests/*.test.ts` | **8 arquivos, 71/71 passando** (`npx vitest run`, 15:54) | ✅ |
| Build | `dist/assets/index-*.js` | **71 333 bytes** sem minificar e sem gzip | ✅ |
| Arena spike | `arena-spike/` | sim 1v1 a 30 Hz, Canvas, 4 checagens | 🧊 **Congelado** (ADR-009). Só leitura |

### 2.1 O que reaproveitar, adaptar e descartar no modelo "combate no mapa"

| Peça | Decisão | Por quê |
|---|---|---|
| `rng.ts`, `formulas.ts` (stats, XP, dano, afinidade) | **Reaproveitar sem mudança** | Independem de onde a luta acontece |
| `content.ts` + content packs + validação | **Reaproveitar e estender** | Falta conteúdo de mundo: `maps/`, spawns, NPCs e o vínculo criatura → `creature.json` da biblioteca `GAME-ASSETS` |
| `save.ts` (envelope, migrações) | **Reaproveitar** | Novos campos (posição no mapa, entidades) entram como migração v4 |
| `offline.ts` | **Reaproveitar** | Offline é farm agregado, sem posição. Continua valendo para "caça automática enquanto ausente" |
| `battle.ts` (ATB 3v3, IA, dano) | **Adaptar** | O cálculo de turno/dano continua; muda o *container*. Em vez de `BattleState` com `allies/enemies` em slots, vira um **encontro** entre entidades do mundo com posição, alcance e estados (spec em `WORLD_COMBAT_VISUAL_SPEC.md`) |
| `GameEvent` (`act`, `ko`, `battle_end`…) | **Reaproveitar o padrão** | É exatamente o "evento confirmado" do §12 do briefing. Ganha `encounterId`, `entityId` e `tick` |
| `anim.ts` (frames por animação, one-shot, independente de FPS) | **Reaproveitar e generalizar** | Precisa de direções (4/8 + espelho), frames por retângulo de atlas (não um PNG por frame) e eventos (`HitFrame`) |
| `pixelfont.ts` | **Reaproveitar** | Números de dano e nomes sobre as entidades |
| Shell rAF + acumulador + tempo real (`main.ts`) | **Reaproveitar** | O loop de tick fixo com interpolação é o mesmo |
| Testes de determinismo, sem rede e de jogabilidade dos packs | **Reaproveitar** | São a rede de segurança da migração |
| `BattleRenderer`, `ALLY_SLOTS`/`ENEMY_SLOTS`, `render_layout.test.ts` | **Descartar no jogo novo** (manter no protótipo antigo) | São uma tela de batalha separada, proibida pelo §3 |
| Arena spike: movimento 2D, colisão por raio, projétil | **Consultar como referência**, sem importar | Está congelado. A ideia "sim pura a 30 Hz + inputs por tick" é a base da sim de mundo |

## 3. Ferramentas do host [E]

| Ferramenta | Situação | Verificação |
|---|---|---|
| Node | v24.19.0, npm 11.17.0 | `node -v`, `npm -v` |
| npm registry | **Bloqueado** (`E403`) | `npm view phaser version` → 403 |
| Cache npm local | ~3 450 entradas. Tem vite, vitest, typescript, jsdom e **ajv 6/8**. **Não tem** phaser, pixi.js, excalibur nem kaplay | `npm cache ls \| grep …` |
| curl / proxy de saída | `HTTPS_PROXY` local recusa o CONNECT para cdn.jsdelivr.net, unpkg.com, registry.npmjs.org e github.com (HTTP 000, CONNECT 403) | `curl -sv https://cdn.jsdelivr.net/...` |
| `web_fetch` (gateway) | Alcança o jsDelivr. `phaser@3/package.json` → **3.90.0** "Tsugumi". `dist/phaser.min.js`: **resposta truncada em 749 997 caracteres** (`rawLength`, `truncated: true`). Não serve para vendorizar | ferramenta `web_fetch`, 18:54 UTC |
| Python 3 | Existe, mas **sem PIL** | `python3 -c "import PIL"` → ModuleNotFoundError |
| Chromium/Chrome headless | **Não encontrado** no PATH (relatado como não executável) | `which chromium chromium-browser google-chrome` vazio |
| ImageMagick, ffmpeg, Aseprite, optipng | **Ausentes** | `which` vazio |
| Encoder PNG e desenho por pixel em Node puro | Existe, criado pelo game-art | `art/src/png.js`, `art/src/canvas.js` |
| jsdom | No `node_modules` do protótipo | smoke test do shell |

**Consequências:**
- **Não dá para medir FPS nem renderizar o jogo em navegador headless neste host.** Os testes de performance e os visuais precisam rodar no navegador do fundador ou de uma máquina com Chromium.
- **Phaser só entraria com uma decisão humana:** o fundador baixa `phaser.min.js` 3.90.0 numa máquina com acesso, confere o hash SRI publicado pelo jsDelivr e coloca o arquivo em `vendor/`. É uma dependência de terceiros (licença MIT [H, conferir no `LICENSE` do pacote]), então pede registro no ADR.

## 4. Requisitos do briefing §9 e onde cada opção está

| Requisito | Canvas 2D próprio | Phaser 3 |
|---|---|---|
| Pixel-perfect, nearest-neighbor, sem blur | ✅ já implementado: escala inteira, `imageSmoothingEnabled=false`, `image-rendering: pixelated` [E] | ✅ `pixelArt: true`, `roundPixels` [H] |
| Tilemaps | ⚠️ falta escrever: chunks de 16×16 tiles pré-renderizados em `OffscreenCanvas`/canvas, ~150 linhas [H] | ✅ suporte a Tiled JSON pronto [H] |
| Muitas entidades | ⚠️ `drawImage` de atlas com culling por câmera. Estimativa: centenas de sprites de 32–48 px a 60 fps em celular médio [H, **não medido**: sem navegador neste host] | ✅ WebGL com batching, milhares de sprites [H] |
| Animações sincronizadas | ✅ `anim.ts` mede em ms reais e já é testado em 30/60/120/144 Hz [E] | ✅ AnimationManager [H] |
| Carregamento eficiente, cache, lazy loading | ⚠️ escrever um loader por atlas com cache por URL (pequeno) | ✅ Loader pronto [H] |
| Mobile | ✅ sem dependências, bundle de 71 KB [E]. O toque é DOM | ✅ input de toque pronto; bundle ~1 MB+ [H] |
| Separação sim/render e servidor autoritativo | ✅ **já existe por construção** [E] | ⚠️ as cenas do Phaser tendem a misturar estado e render. Exige disciplina [H] |
| Disponível hoje | ✅ | ❌ (§3) |

## 5. Recomendação de engine

**Manter TypeScript + Vite + Canvas 2D próprio**, com estas regras para não fechar portas:

1. **A fronteira é a interface `WorldView`**: o render só recebe `WorldSnapshot` (entidades com posição, estado, direção, HP) mais a lista de eventos confirmados, e não chama a sim. É a mesma regra do `BattleRenderer` atual, generalizada. Se a performance medida no celular não for suficiente, troca-se o `WorldView` Canvas por um `WorldView` Phaser/Pixi **sem tocar na sim, nos packs, no save nem nos testes**.
2. **Gatilho objetivo para migrar** (não é opinião): se num celular Android médio o cenário de teste do briefing §11 (jogador, ~30 criaturas, NPCs, combate, efeitos) cair abaixo de **50 fps** com culling e atlas, a migração para WebGL (Phaser ou PixiJS) entra no backlog. Precisa ser medido num dispositivo real [H].
3. **Formatos neutros desde já:** spritesheets PNG em grade (formato PMD, ou atlas com retângulos em JSON) e `creature.json`. Tanto o Canvas quanto o Phaser leem os dois.
4. **Mapas em Tiled JSON (`.tmj`)**: é um formato aberto, o Phaser lê nativamente e o nosso parser é pequeno. Assim o world-designer (game-art) não depende da engine.
5. **WebGL não entra agora**: Canvas 2D é acelerado por GPU nos navegadores atuais [H], e a escala do protótipo (uma tela com dezenas de entidades) não justifica o custo.

**Por que não Phaser agora:** (a) não está instalável neste host [E]; (b) o que ele traria de mais valioso (tilemap e loader) é pequeno de escrever sobre o que já temos; (c) a regra "o servidor tem a autoridade e a animação nunca decide" já está cumprida pela arquitetura atual, e o modelo de cenas do Phaser exigiria refazer essa disciplina. O briefing §9 também pede para "não substituir tecnologias existentes sem justificativa" e "preservar o que estiver funcionando".

## 6. Plano técnico de migração (ordem sugerida, ainda não executado)

1. `src/world/` novo no jogo (fase 5): `WorldState` (entidades, posição em sub-tiles, estado da FSM), `stepWorld()` determinístico e encontros que reusam `formulas`/`battle`.
2. `WorldView` em Canvas: tilemap em chunks, ordenação por Y, sombras, barras de HP, floaters e efeitos (spec em `WORLD_COMBAT_VISUAL_SPEC.md`).
3. Loader de atlas e manifest (`creature.json` → animações). O parser do sprite viewer (`prototype/sprite-viewer/src/manifest.ts`, `animdata.ts`) é escrito para ser **reaproveitado pelo jogo**.
4. Migração de save v3 → v4 (posição e mapa) e testes de determinismo do mundo.
5. Medição de performance em celular real (requer o fundador ou o QA com um dispositivo).

## 7. Limitações desta auditoria

- **Nenhuma medição de FPS** foi possível (sem navegador headless). As afirmações de performance são [H].
- O tamanho de `phaser.min.js` (~1,2 MB) é [H]. Só confirmei que ele passa de 750 KB (truncado).
- Não auditei `arena-spike/` além da leitura do `FEASIBILITY.md` e do cabeçalho de `arena.ts` (está congelado).
- A biblioteca `assets/GAME-ASSETS/` **ainda não existia** às 15:55 (o game-art está criando em paralelo). Por isso o sprite viewer usa um schema provisório (ver `prototype/sprite-viewer/README.md`).
