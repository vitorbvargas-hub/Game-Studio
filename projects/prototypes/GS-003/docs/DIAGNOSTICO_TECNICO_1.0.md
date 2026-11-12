# GS-003 — Diagnóstico Técnico 1.0 (somente leitura)

- **Data:** 2026-11-12 · **Autor:** game-studio (coordenador) · **Escopo:** leitura e inventário. Nada foi alterado, instalado ou executado de forma a modificar o projeto.
- **Legenda:** **[E]** evidência verificada nesta auditoria (caminho ou comando) · **[L]** fonte é o `PROJECT_LOG.md`/relatórios dos agentes (não reverificado) · **[NV]** não verificado.

---

## A. Estado atual

- **Estágio:** protótipo jogável no navegador, em **Quality First** (ADR-012). Não há deploy público nem servidor. [E]
- **Onde está o código vivo:** a branch `quality-overhaul`, no worktree `workspaces/game-dev/qo`. O último commit é `23de52d` (Digivice VI 1.0). Existe 1 arquivo não rastreado (`scripts/qa-default-url-p2.mjs`). [E]
- **Master** (`~/projects/GameStudio`): o último commit é `e506b0a`, e há **203 alterações pendentes ou não rastreadas** (`git status --short`). A arte v13/v14 e os relatórios recentes estão fora do git. **Este é o principal risco de perda.** [E]
- **Tamanho:** 77 arquivos TypeScript e cerca de 21,7 mil linhas em `src/`. São 52 arquivos de teste e 486 testes, segundo o último relatório [L]. Há 33 scripts em `prototype/world/scripts/`. [E]
- **Identidade visual:** em transição. O jogo usa o look v9–v12 (procedural e pintado). A direção nova, v13 "GBA Clean" e cartoon, existe **só fora do jogo**: mapas no PixelLab, UI e Tamers. O mapa é o próximo item a homologar. [E]

## B. Arquitetura

| Item | O que existe | Evidência |
|---|---|---|
| Engine | **Motor próprio em Canvas 2D**. **Não é Phaser.** A descrição do pacote diz: "mundo em tilemap com combate no próprio mapa (Canvas 2D, sim autoritativa local)". | `prototype/world/package.json` [E] |
| Linguagem / build | TypeScript 5.9.3 + Vite 7.3.7; testes em Vitest 3.2.7 + jsdom; `@napi-rs/canvas` para capturas em Node | `package.json` [E] |
| Execução | Site estático (Vite build) que **roda no Chrome**; `jogar.sh` serve localmente (porta 5190 = worktree qo) | `prototype/jogar.sh` [E], log [L] |
| Organização | `src/sim` (simulação: mundo, mapa, FSM, golpes, evolução, arena, encontros, exploração), `src/render` (camadas, luz, dia/noite, VFX, Tamer, animação), `src/ui` (HUD v1/v2, Digivice, painéis, mapa-múndi, criador), `src/save` (save, flags, offline, liga da arena), `src/world/regions.ts`, `src/data` (mapas `.tmj`, espécies, golpes, encontros, cenas) | `ls src/*` [E] |
| Mapas | Formato **Tiled `.tmj` + `.aliases.json`**, gerados pela Map Factory (`scripts/map-factory`, briefs e kits). 5 mapas ativos: digimon-forest-01, forest-proof, praia, vila, test-meadow, mais as variantes v8/v9 | `src/data/maps` [E] |
| Colisão e física | Grade do tilemap + sim própria (`sim/map.ts`, `sim/world.ts`). Não há engine de física. | [E] arquivos; detalhes [NV] |
| Animação | `render/anim.ts`, `animctl.ts`, `standpose.ts` (anim v2 é o padrão) | [E] |
| Cenas | Estado único do mundo + telas HTML (`ui/screens.ts`) | [E] |
| Persistência | `localStorage` (`save/save.ts`, `arena-league.ts`) | `grep localStorage` [E] |
| Backend / BD / API | **Não existe.** Não há `fetch` nem WebSocket no `src/`. Guilda, Chefe Mundial e ranking usam bots rotulados "simulado". | `grep` [E] |
| Assets | Alias `@game-assets` → `assets/GAME-ASSETS` (235 MB) | `src/assets/creatures.ts` [E] |
| Dev × prod | Só dev/local. Não há configuração de produção, CDN nem deploy. Publicar depende de aprovação (ADR-007/008). | [E] |

## C. Inventário de scripts (agrupado)

O inventário é **por grupo**. A tabela com os 11 campos para cada script (cerca de 60 arquivos) fica pendente e pode ser feita pelo game-dev numa próxima ação.

| Grupo | Onde | Qtde | Estado | Recomendação |
|---|---|---|---|---|
| Geração e validação de mapas (Map Factory) | `world/scripts/gen-*.mjs`, `map-*.mjs`, `validate-map.mjs`, `map-factory/` | 8 + kits/briefs | Integrados; `map:validate` passa 6/6 [L] | **Preservar.** Mas eles não leem mapas do PixelLab (ver H). |
| Captura e QA visual | `*-capture.mjs`, `p2-probe`, `v12-measure/sidebyside`, `gif.mjs` | ~20 | Executados nas entregas; geram as provas | **Consolidar** num `capture.mjs` único com presets |
| Pipeline de sprites | `build-official-mons.mjs` (recorte das folhas DS), `build-guilmon-pl64.mjs` | 2 | Integrados (`?mon=official` é o padrão) | Preservar; generalizar o "oficial" para as 33 espécies |
| Arte procedural | `art/src/gen_forest_v8…v12*.js`, `blob_autotile47.js`, `art/_tools/pngw.py` | ~10 | Executados; as saídas estão no jogo (look v9–v12) | **Arquivar** quando o v13 entrar |
| Composição v13 (UI, mapa, Tamers) | `art/ui-v13/*.py`, `digi-forest-v13/*/build_*.py`, `tamers-v13/scripts/*.py` | ~10 | Executados fora do jogo | Preservar como ferramenta de mockup |
| Pesquisa de sprites (GS-013) | `research/sprite-recovery/*.json` (catálogos) | dados | Concluído | Preservar (é a base de licenças e fontes) |

## D. Inventário de sprites e Digimon

- **`assets/GAME-ASSETS/01-creatures`: 35 pastas de criatura** (mais README, approved, evolution-lines, original e reference). [E]
- **Espécies no jogo** (`world-species.json`): **34**, com estes estágios: 3 Baby/In-training (1), 15 Rookie (2), 5 Champion (3), 1 Ultimate (4), 1 Mega (5) e 9 sem estágio definido. [E]
- **Sprites oficiais Digimon World DS:** 33 de 34 espécies extraídas, segundo o catálogo GS-013. O Guilmon e o Gabumon oficiais estão integrados como padrão (CREATURE-0018/0019, `?mon=official`). As outras espécies ainda usam a arte antiga. [E] catálogo / [L] integração
- **Linha principal com arte própria** (CREATURE-0002 a 0016: Gigimon, Guilmon, Growlmon, Koromon, Agumon, Greymon, Tsunomon, Gabumon, Garurumon, Tokomon, Patamon, Angemon, Dorimon, GeoGreymon, WarGreymon): 8 a 76 PNGs por espécie. [E]
- **Roster extra** (CREATURE-0101 a 0118: Dorumon, Dorugamon, DoruGreymon, Biyomon, Gomamon, Tentomon, Palmon, Betamon, Gotsumon, Numemon, Floramon, Hagurumon, Crabmon, Otamamon, Goburimon, Tanemon, Lalamon, Penguinmon): 7 a 11 PNGs por espécie, o que indica animação incompleta. [E]
- **Gabumon feito à mão** (0119): segurado por decisão do fundador. [E]
- **Animações:** os sprites oficiais do DS têm cerca de 6 direções e 7 estados, mas o rip atual do Guilmon manca e não tem costas [L]. Não há animação de evolução desenhada em nenhuma espécie [L]. O detalhamento por espécie (direções, idle, ataque, dano, transparência) **não foi auditado arquivo a arquivo nesta passagem** [NV]. A fonte para isso é `research/sprite-recovery/digimon_animation_catalog.json`.
- **Tamers:** 12 presets v13 no PixelLab (36×36, 8 direções, andando e parado) **não integrados**; aguardam aprovação do fundador. [E]

## E. Inventário de mapas

| Mapa | Formato / local | Estado |
|---|---|---|
| digimon-forest-01 (+ v8/v9) | `.tmj` no jogo | **Integrado e jogável**; o look v9–v12 é o padrão [E] |
| vila, praia, forest-proof, test-meadow | `.tmj` no jogo | Integrados; a troca de mapa será **só por teleporte no mapa-múndi** (decisão do fundador de 11/11; as saídas de borda ainda existem no código) [L] |
| Mapa-múndi v2.1 | PNG + `worldmap.json` | Integrado [L] |
| Digi Forest v13 (96b807d6), v14 (0492571a) e v15 (em produção) | **PixelLab Map Workshop** | **Não integrados.** São testes de identidade visual. |
| Floresta Densa e Island Map | PixelLab, projeto Mega Knight (teste do fundador) | Só referência |
| Encontros | `src/data/encounters`, `sim/encounters` (GS-012) | Implementados e padrão: pontos visíveis + mato alto [L] |

Não existe script de conversão de mapas Pokémon. O Pokémon é usado só como referência de estrutura (decisão do research em 11/11). [L]

## F. Funcionalidades

| Funcionalidade | Classificação |
|---|---|
| Movimentação do Tamer e do Digimon, câmera, exploração | **Funcional** [L] |
| AUTO explorador (pathfinding, cura, fuga) | **Funcional** [L] |
| Encontros (pontos visíveis + mato alto) | **Funcional** (taxa considerada lenta; o ajuste está congelado) [L] |
| Combate no próprio mapa | **Funcional** [L] |
| Equipe e troca de Digimon (Shift+1–5) | **Funcional** [L] |
| Atributos e habilidades (Digivice, Banco de dados) | **Funcional** (habilidades só leitura no Digivice) [L] |
| Evolução e árvore com % | **Funcional** (sem cena de evolução nova) [L] |
| HUD v2, Digivice VI 1.0, Guilda, Correio, Passe, Fonte, Conquistas, Chefe Mundial | **Funcional, local e simulado** (bots, sem servidor) [L] |
| Idle / progresso offline | **Parcial** (`save/offline.ts`, `offline-report.ts`) [E] arquivos |
| Persistência | **Funcional** (`localStorage`) [E] |
| Arena PvP | **Prototipada, local** (sem rede) [L] |
| Vínculo, talentos do Tamer e talentos do Digimon | **Aprovados como versão mínima, mas não implementados** (congelados até a identidade visual) [L] |
| Inventário e equipamentos | [NV] |
| Treinamento, afinidade e cuidado (estilo DW1) | **Documentado, não implementado** [L] |
| Multiplayer online | **Não encontrado** [E] |

## G. Montarias (só preparação)

Não existe nenhuma estrutura de montaria, nem tipo de deslocamento (terra, água, ar), nem talento ou afinidade implementado. Os pontos de apoio futuros são: o save do parceiro (`save/partner.ts`), a FSM de movimento (`sim/fsm.ts`) e o Vínculo/Talentos aprovados (ainda não codificados). **A recomendação é desenhar a montaria como uma extensão de Vínculo + Talentos**, com uma "camada de travessia" por célula no mapa (terreno água ou céu bloqueado sem a montaria certa). [E]/[H]

## H. Multiagentes (Game Studio)

- **Agentes:** `game-studio` (coordenador) + `game-research`, `game-design`, `game-dev`, `game-art`, `game-qa` e `game-growth`, cada um com workspace próprio em `workspaces/`. [E]
- **Governança:** `AGENTS.md`, `SOUL.md`, `GOVERNANCE.md`, `STRATEGY.md` e os ADR-001 a 012 em `shared/decisions/`. [E]
- **Automações:** um cron diurno de retomada e coordenação. [E]
- **Ferramentas:** PixelLab Tier 1 (740 de 2000 gerações até 11/12) e a extensão do Chrome. [E]
- **Revisão:** o coordenador revisa, o game-qa faz o VISUAL-QA e o fundador homologa (GS-010, meta ≥ 9). [L]
- **Ponto fraco:** o limite de 5 h de uso derrubou tarefas mais de 8 vezes entre 10 e 12/11, gerando retrabalho. Por isso vale até domingo a regra **um agente por vez**. [E]

## I. Problemas e riscos

1. **203 alterações fora do git no master**, incluindo toda a arte v13/v14 e os relatórios → risco de perda. **P0.**
2. **Os mapas do PixelLab não entram no jogo hoje.** O jogo lê `.tmj` da Map Factory com o renderer próprio. É preciso um conversor do export PixelLab (`get_map export="pixellab"`: `map.json` + imagens) para o formato do jogo, ou um renderer novo. Sem isso, a identidade v13+ fica só no mockup. **P0 técnico.**
3. **Erro de premissa nos briefs:** alguns pediam "filtro para o Phaser". O motor é Canvas 2D próprio. O filtro cartoon deve ser feito com `ctx.filter = 'saturate(1.4) contrast(1.15)'`, que o Chrome suporta, ou com uma etapa no `render/look.ts`.
4. **Fonte pixel sem acentos** na UI v13 → não serve para pt-BR.
5. **Assets em 3 estilos convivendo** no jogo (procedural v9–v12, PixelLab, oficial DS).
6. **Duplicação:** cerca de 20 scripts de captura quase iguais; gerações de arte v8–v12 que serão substituídas.
7. **Performance no navegador:** não há medição de FPS e memória com 35 espécies e mapas de 48×36 [NV]. O build e o tamanho do bundle não foram medidos nesta passagem [NV].
8. **Sem servidor:** tudo "online" (guilda, chefe, ranking) é simulado; ir ao ar exige backend e aprovação de publicação.

## J. Recomendações e próximas prioridades (sem iniciar)

1. **Commit e organização do master** (uma ação, sem mudar conteúdo): proteger a arte v13/v14 e os relatórios.
2. **Homologar a identidade do mapa** (v15 em produção) → depois, **spike do conversor PixelLab → jogo** (game-dev): um mapa rodando no Chrome com colisão, mato alto e água animada.
3. **Aprovar os Tamers v13** → integrar.
4. **Fonte com acentos + Digivice da UI r2** → reestilizar a UI do jogo.
5. **Padronizar os 33 Digimon oficiais do DS** no jogo (generalizar o `build-official-mons.mjs`).
6. **Descongelar as regras:** encontros, Vínculo/Talentos mínimos e remoção das saídas de borda; depois, montaria como extensão de Vínculo.
7. **Consolidar scripts** (captura única) e **arquivar** o pipeline procedural v8–v12.
8. **Medir performance no Chrome** (FPS e memória) antes de crescer o roster e os mapas.

> Auditoria concluída. **Nenhuma implementação foi iniciada.** Aguardando aprovação do fundador.
