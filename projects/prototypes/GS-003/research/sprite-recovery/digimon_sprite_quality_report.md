# GS-013 — Relatório de Qualidade de Sprites de Digimon (Fase 1)

**Autor:** game-research · **Data:** 2026-11-10 · **Base:** `digimon_sprite_catalog.json`, `digimon_animation_catalog.json`, `digimon_asset_sources.json`, `digimon_asset_licenses.json`, `digimon_missing_sprites.json`, ADR-009, roster real do jogo (`prototype/world/src/data/world-species.json`).

Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/leitura não verificada diretamente.

> **Nota sobre esta entrega [E]:** esta sessão retoma o GS-013 fase 1 após o limite de uso ter interrompido a sessão anterior (ver `PROJECT_LOG.md`, 2026-11-10 ~07:0x). Os dois arquivos de catálogo principais (`digimon_sprite_catalog.json`, `digimon_animation_catalog.json`) já existiam no disco, intactos, e **não foram refeitos**. Esta entrega completa os 4 arquivos que faltavam (`digimon_asset_sources.json`, `digimon_asset_licenses.json`, `digimon_missing_sprites.json`, este relatório) **sem nova pesquisa pesada na web** — só consolidação do que já estava extraído, mais 1 verificação local gratuita (ver item 6) que corrigiu uma lacuna.

---

## 1. Fontes encontradas

10 fontes catalogadas em `digimon_asset_sources.json` (as 9 do briefing + 1 subgrupo descoberto dentro do domínio do Spriters Resource):

| Status | Quantidade | Fontes |
|---|---|---|
| **INTEGRATED** | 2 | The Spriters Resource — Digimon World DS; Digimon World Dawn/Dusk |
| **INTEGRATED_PARCIAL** | 2 | Spriters Resource — outros 7 jogos/plataformas (DW3 PS1, DigiBat GBA, Digimon Medley WSC, Battle Spirit WSC, Adventure 02 Digital Partner WSC, Vital Bracelet BE, Digimon Battle Online); E-M-B-E-R (rip oficial, idle-only) |
| **AVALIADO_NAO_EXECUTADO** | 1 | Digimon World Sprite Manager (netraular) |
| **PENDENTE** | 5 | kaisadilla/digimon-sprite-collection; DIM Modifier Resources; Pendulum Color Sprite Database; Aderek Digimon Database; kongtaehun/digimon-assets-VB |

A pesquisa já não ficou limitada a 1 jogo/console: o manifesto do Spriters Resource sozinho cobre **9 jogos/plataformas diferentes** (DS, PS1, GBA, WonderSwan/WSC, LCD handheld, PC/Browser).

## 2. Quantidade de Digimon catalogados

- **850 nomes únicos** de espécie/variante no manifesto bruto do Spriters Resource (`spriters_resource_raw_index`).
- **35 espécies com extração real** já integradas em `assets/GAME-ASSETS/01-creatures/` (33 espécies em uso no jogo + 1 criatura-piloto original + 1 variante alternativa de Gabumon feita à mão).
- **22 espécies** com rip oficial idle-only via E-M-B-E-R (16 delas já superadas por dados mais completos do Spriters Resource; 6 permanecem só com esse recurso parcial).

## 3. Quantidade de spritesheets encontrados

- **1.074 folhas de sprite** no manifesto consolidado do Spriters Resource (todas já baixadas para `assets/GAME-ASSETS/10-source-files/spriters-resource/`).
- **63 folhas de background de mapa** identificadas no mesmo manifesto (ainda sem catálogo separado — pendente, ver item 10).

## 4. Quantidade de animações utilizáveis

Das 33 espécies em uso com extração real, a cobertura de animações por espécie varia de 3 a 7 tipos de animação (`idle`, `walk`, `attack`, `hurt`, `battle_idle`, `battle_hurt`, `battle_attack`), em até 6 direções (N/S/E/W/SE/SW). Exemplo completo: **Guilmon** (CREATURE-0003) — 7 animações × 6 direções.

## 5. Digimon com animação completa

33 espécies em uso têm pelo menos `idle` + `walk`, a maioria também `attack`/`hurt`/variantes de batalha, em 6 direções. Todas estão com `integrationStatus: UNDER_REVIEW` no catálogo (extraídas e conferidas, mas ainda não aprovadas para substituir os placeholders atuais do jogo).

## 6. Digimon com animação parcial

- **6 espécies** (Renamon, Terriermon, Wormmon, Hawkmon, Impmon, Lopmon) só têm sprite estático/idle de 1 direção via E-M-B-E-R, sem fonte melhor catalogada ainda. Nenhuma está no roster atual do jogo — são candidatas de reserva para expansão futura.
- **Correção desta sessão [E]:** **Drimogemon**, que o catálogo anterior registrava como "nenhum recurso encontrado" (a 1 espécie do roster sem extração), **na verdade tem 2 folhas de sprite já baixadas** no manifesto, catalogadas sob o nome ocidental **"Digmon"** (combinadas com Submarimon): uma de *Digimon World 3* (PS1) e outra de *Digimon Adventure 02: Digital Partner* (WonderSwan). Isso segue exatamente a instrução final do briefing ("não aceitar que não existem sprites — buscar outras versões/plataformas/formatos"): o problema não era ausência de recurso, era um alias de nome (JP "Drimogemon" vs. EN "Digmon") não cruzado na indexação anterior. Falta recortar a parte do Digmon de cada folha combinada — ver `digimon_missing_sprites.json.corrections`.

## 7. Digimon sem recursos encontrados

**Zero**, após a correção do item 6. Todas as 34 espécies do roster atual do jogo têm pelo menos 1 fonte de sprite catalogada (33 com extração completa + 1 — Drimogemon/Digmon — com sprite localizado, pendente de recorte).

## 8. Galeria de previews animados

**Não produzida nesta rodada** (pendente para a próxima fase). O estúdio já tem um visualizador de sprites prototipado em `projects/prototypes/GS-003/prototype/sprite-viewer/` (schema `creature.schema.provisional.json`) que pode ser reaproveitado para isso, em vez de construir um novo.

## 9. Ferramentas de extração testadas

**Nenhuma ferramenta foi executada nesta sessão.** Digimon World Sprite Manager foi avaliado por leitura de README (sessão 2026-11-08, ver ADR-009) mas não roda: é redundante com o fetch direto já feito do Spriters Resource, salvo se precisarmos do split automático de frames que ele promete — a reavaliar na próxima fase junto com LibreSprite/Pixelorama (já mapeados em `REFERENCE_LIBRARY.md` como opções gratuitas sem `sudo`, de uma tarefa anterior não relacionada a sprites de Digimon).

## 10. Recursos de mapas encontrados

63 folhas de background de mapa já identificadas dentro do mesmo manifesto do Spriters Resource, mas **ainda sem catálogo próprio separado** dos sprites de Digimon (exigência da seção 11 do briefing). Pendente para a próxima fase — não usar mapas completos de jogos protegidos como asset final, conforme a própria seção 11 determina.

## 11. Restrições de licenciamento

Ver `digimon_asset_licenses.json` para o detalhamento completo. Resumo:

- **official-fan-use** (33 espécies + rip E-M-B-E-R): liberado pelo fundador em 2026-11-08 para fan game não comercial, com crédito do ripper preservado, sem logo oficial, sem monetização, e **publicação fora deste workspace exige aprovação separada** mesmo com essa liberação.
- **reference-only**: Digimon World Sprite Manager (só texto lido, nenhum binário copiado).
- **unknown-pending**: as 5 fontes ainda não investigadas (kaisadilla, DIM, Pendulum DB, Aderek, VB repo) — nenhum arquivo delas deve entrar no catálogo principal antes de classificar os direitos.
- **original**: criatura-piloto (CREATURE-0001) e Gabumon à mão (CREATURE-0119, atualmente SEGURADO por decisão do coordenador).

## 12. Plano de integração

1. **Curto prazo (sem custo):** recortar as 2 folhas combinadas de Digmon/Submarimon para fechar a última lacuna do roster (Drimogemon) — trabalho de pixel art manual, não geração por IA.
2. **Curto prazo:** investigar as 5 fontes PENDENTE de `digimon_asset_sources.json`, priorizando as que podem trazer animações de ataque/habilidade que ainda faltam em algumas espécies.
3. **Médio prazo:** construir a galeria visual reaproveitando `prototype/sprite-viewer/`, e produzir a demonstração com 5+ Digimon de origens diferentes pedida na seção 12 do briefing (já há material suficiente: Guilmon/DW DS, Agumon/Digimon Battle GBA, Renamon/Digimon Battle Online PC, Digmon/Digimon World 3 PS1, Numemon/Vital Bracelet BE — 5 plataformas distintas).
4. **Médio prazo:** catálogo separado de recursos de mapa (63 folhas já identificadas) e padronização de proporção/âncora por espécie (seção 6 do briefing), antes de qualquer substituição de placeholder atual.
5. **Antes de qualquer substituição em produção:** aprovação do GAME-ART-DIRECTOR/coordenador — nenhum asset `UNDER_REVIEW` deste catálogo deve ir para o jogo automaticamente.

---

## 13. ATUALIZAÇÃO 2026-11-10 (pós-reset ~12h) — fontes pendentes, pergunta-chave de escala, mapa e downloads

### 13.1 As 5 fontes pendentes — investigadas via `web_fetch`

| Fonte | Status | O que se viu [E] |
|---|---|---|
| **kaisadilla/digimon-sprite-collection** | Investigado, não integrável direto | Não é um README descritivo — é um app visualizador React/webpack sem `LICENSE`. As imagens ficam em `public/img/sprites/digimon/<categoria>` (15 categorias: adventure_02, adventure_02_ow, bandai, championship, d_project, digivice_dtector, digivice_tall, digivice_window, dm_ver_s, monster_s, story, story_ow, toei, vital_bracelet, vpet, xros_loader). A maioria são sprites de brinquedo LCD/V-pet (minúsculos); só `story`/`story_ow`/`adventure_02_ow` são candidatos a sprite de overworld DS/WonderSwan, mas o conteúdo individual (resolução, quadros) **não foi aberto** nesta rodada — confirmado via GitHub Contents API, 2026-11-10 10:12–10:13 UTC. |
| **DIM Modifier Resources** | Bloqueado (SPA) | `web_fetch` em `https://dim.digitallink.games/resources?category=digimon` (2026-11-10 10:12 UTC) retornou status 200 mas só o `<title>`; corpo vazio (12 bytes de HTML cru) — página renderizada por JavaScript, `web_fetch` não executa JS. Nada sobre resolução/quadros/licença pôde ser lido. |
| **DMC (Pendulum Color Mod) Sprite Database** | Bloqueado (SPA) | `web_fetch` em `https://dmc-sprite-database.vercel.app/` (2026-11-10 10:12 UTC): status 200, título correto, mas só o cabeçalho de uma tabela ("Image & Name \| Stage \| Attribute \| Type \| Style \| Source \| Size \| Author \| Download") sem nenhuma linha de dados — SPA. A coluna "Size" sugere que o site documenta resolução por sprite, mas nenhum valor real foi lido. |
| **Aderek Digimon Database** | Bloqueado (SPA) | `web_fetch` em `https://aderekart.github.io/` (2026-11-10 10:12 UTC): status 200, título correto, corpo vazio (25 bytes) — SPA. Não foi possível confirmar se é arte fan-made autoral. |
| **kongtaehun/digimon-assets-VB** | Investigado, confirmado inadequado para 48–64px | README (raw.githubusercontent.com, 2026-11-10) confirma: 51 DIM cards, 861 aparições de Digimon (623 IDs únicos), **1.725 GIFs + 837 JPGs (~40MB total)**. Estrutura confirmada via API: `assets/data/<categoria>/<dim_id>/sprites/<digimon_id>/frame1.gif`, `frame2.gif`, `artwork.jpg`. Exemplo real aberto (Gammamon): frame1.gif = 1.132 bytes, frame2.gif = 1.119 bytes — tamanho típico de sprite LCD monocromático muito pequeno, **não** de um sprite colorido de 48–64px. Só 2 frames por Digimon, sem direções (bichinho de pulso visto de frente). |

**Licenciamento das 2 investigadas com sucesso:** ambas (kaisadilla e kongtaehun) tratam sprites que são propriedade da Bandai/Toei/Hongo — nenhuma tem licença aberta própria (`"license": null` na API do GitHub para as duas); README do kongtaehun/VB cita explicitamente o copyright da Bandai e se declara "unofficial, non-commercial fan compilation". Mesma camada **official-fan-use** das demais fontes, nunca licença aberta — ver `digimon_asset_sources.json` (SRC-06 a SRC-10 atualizados).

### 13.2 PERGUNTA-CHAVE: existe fonte com Digimon animados em ~48–64px, em várias direções, para o piloto?

> **Escala de referência:** `ART_DIRECTION_V2.md` §1.4 define Rookie oficial em **56–64px** de altura nativa, confirmado por prova técnica (`phase2/art/scale-proof/`, Guilmon entregue em 60×68px) — mas essa prova foi feita **gerando/redesenhando** a partir do rip pequeno via `create_character(v3, reference)`, não encontrando uma fonte nativa já nessa escala.

**RESPOSTA: NÃO EXISTE**, entre as 10 fontes investigadas (as 9 do briefing + o subgrupo de outras plataformas do Spriters Resource), nenhuma fonte com Digimon **animados**, em **~48–64px**, em **várias direções**. Evidência [E] reunida nesta sessão:

1. **A única fonte com múltiplas direções E animação real (walk/attack/hurt) é nativa de ~24–34px** — Digimon World DS / Dawn / Dusk via Spriters Resource (SRC-01/02) e E-M-B-E-R (SRC-04). Exemplo confirmado no próprio disco: Guilmon `CREATURE-0003_walk_W_00.png` = **30×34px**, 6 direções, 7 tipos de animação. Essa é, de longe, a melhor fonte disponível por quadros-por-estado (ver tabela abaixo).
2. **As folhas maiores existem, mas são pose única de batalha, sem direções, sem walk.** Confirmado no próprio disco: o sprite de batalha nativo do Guilmon (`CREATURE-0003_battle_idle_SW_00.png`) está em **86×82px de canvas** (corpo ~75px) — mas é **1 direção só (SW)**, sem ciclo de caminhada, usado para a cena de batalha, não para mover no mapa. O mesmo padrão se repete nas folhas maiores de GBA (DigiBat), WonderSwan (Battle Spirit) e PC/Browser (Digimon Battle Online) inspecionadas: são contact sheets de pose de batalha/retrato, não sprites de overworld multi-direcionais.
3. **As fontes investigadas nesta rodada (kaisadilla, kongtaehun/VB) são, na outra ponta, MENORES ainda** — sprites de brinquedo LCD/V-pet (Vital Bracelet, Digivice), tipicamente abaixo de 20px, 1-2 frames, sem direção nenhuma (visto de frente, parado).
4. **As 3 fontes bloqueadas por SPA (DIM, DMC, Aderek) não puderam ser verificadas** — não é possível afirmar com certeza que elas não têm algo em 48-64px; é uma lacuna de evidência, não uma confirmação de ausência (ver limitações).

**Conclusão prática:** o caminho que o próprio GS-010 já escolheu em `ART_DIRECTION_V2.md` §1.4 — upscalear/redesenhar via `create_character(v3, reference)` a partir do rip nativo de ~24-34px, em vez de procurar uma fonte já na escala maior — está **correto e é o único caminho viável** com o que foi encontrado até aqui. Não há uma fonte nativa a ser simplesmente importada nessa escala.

**Melhores fontes nativas por quadros-por-estado (já que ~32px é o que existe multi-direcional):**

| Espécie (exemplo) | Fonte | Resolução nativa | Direções | Animações/estados |
|---|---|---|---|---|
| Guilmon | SRC-01 (DW DS, Spriters Resource) | 30×34px | 6 (N/S/E/W/SE/SW) | idle, walk, attack, hurt, battle_idle, battle_hurt, battle_attack (7 estados) |
| Agumon, Gabumon, Garurumon, Greymon, Patamon, Angemon (linha piloto) | SRC-01 | ~24-34px | 6 | 3-7 estados (varia por espécie, ver `digimon_sprite_catalog.json`) |
| Numemon, Betamon, Gotsumon, Tentomon, Palmon e demais 21 espécies DW DS/Dawn-Dusk | SRC-01/02 | ~24-34px | 6 | idle, walk (battle_* nem sempre presente) |
| 22 espécies (parcial) | SRC-04 (E-M-B-E-R) | ~24-34px | **1 só** | idle/pose de batalha (3-4 frames) — pior cobertura de direção que SRC-01/02 |

### 13.3 Catálogo de recursos de mapa — `map_assets_catalog.json`

**76 arquivos** de fundo/cenário/local já identificados **e já baixados no disco** (`assets/GAME-ASSETS/10-source-files/spriters-resource/`), **~39,5 MB**, classificados programaticamente (sem novo fetch) por palavra-chave de lugar e cruzados contra a lista de espécies para não confundir sprite de criatura com cenário. Divididos por jogo:

| Jogo | Plataforma | Arquivos |
|---|---|---|
| Digimon World (DW1) | PlayStation | 33 |
| Digimon World 2 | PlayStation | 20 |
| Digimon World DS | Nintendo DS | 7 |
| Digimon World: Digital Card Battle | PlayStation | 5 |
| Vital Bracelet BE | LCD handheld | 5 |
| Digimon World 3 | PlayStation | 3 |
| Digimon Battle (DigiBat) | GBA | 1 |
| Digimon World Dawn/Dusk | Nintendo DS | 1 |
| Digital Monster: D-Project | WonderSwan | 1 |

**Nota sobre divergência de contagem:** o `_meta` do `digimon_sprite_catalog.json` (sessão anterior) registrava 63 folhas de fundo; esta classificação independente encontrou 76. O critério exato usado para chegar a 63 não ficou documentado antes — registrando a divergência em vez de forçar uma reconciliação sem evidência de qual metodologia foi usada.

**Licença:** mesma camada `official-fan-use` das criaturas (rip oficial do Spriters Resource) — **não usar mapas completos como asset final** (regra explícita da seção 11 do briefing); servem como referência de composição/paleta ou fonte para extrair elementos pequenos de forma transformada.

**Outras fontes de tileset dedicado:** nenhuma das 5 fontes pendentes investigadas nesta rodada é sobre cenário/tileset — todas são sobre sprites de personagem. Nenhuma fonte nova de tileset de floresta/caverna/cidade/praia foi encontrada nesta rodada.

### 13.4 Lista de downloads necessários (hosts e MB estimados)

| O que falta | Host | Estimativa | Por quê ainda não foi baixado |
|---|---|---|---|
| `public/img/sprites/digimon/story`, `story_ow`, `adventure_02_ow` (kaisadilla) | `raw.githubusercontent.com` (via `codeload.github.com/.../zip` para clone completo, ou arquivo a arquivo via `raw.githubusercontent.com`) | **Desconhecido** — a API não devolve tamanho de arquivos individuais de imagem sem listar cada um; o repo inteiro é 3.159 KB **comprimido** no `size` da API (inclui código-fonte, não só imagens) — provavelmente poucos MB de imagens reais. Precisa listar `public/img/sprites/digimon/story*` pasta por pasta para orçar com precisão. | Baixo valor esperado (provável sobreposição com SRC-01/02/03, mesma geração DS/WSC) frente ao custo de investigar pasta por pasta via API. |
| `assets/data/**/sprites/**/*.gif` + `artwork.jpg` (kongtaehun/VB) | `raw.githubusercontent.com/kongtaehun/digimon-assets-VB/main/...` | **~40 MB** (declarado no próprio README: 1.725 GIFs + 837 JPGs) | Já confirmado (seção 13.1) que a resolução é inadequada para 48-64px — baixar tudo não atende ao pedido do fundador; só valeria para uma eventual mecânica de "Digivice"/colecionável separada, fora do escopo desta fase. |
| Conteúdo de DIM Modifier, DMC Sprite Database, Aderek Database | `dim.digitallink.games`, `dmc-sprite-database.vercel.app`, `aderekart.github.io` | **Não estimável** — são SPAs; o conteúdo real (e portanto o tamanho a baixar) só aparece depois de JS executar. `web_fetch` não serve para descobrir o tamanho. | Precisa de uma ferramenta com navegador real (fora do escopo de `web_fetch`); não é um caso de "proxy bloqueando", é limitação da própria ferramenta de fetch (sem execução de JS) — nenhuma tentativa de contornar isso foi feita. |
| Nenhum download pendente para Digimon catalogados (33/34 espécies em uso + Drimogemon/Digmon) ou para os 76 arquivos de mapa | — | **0 MB** | Todos já estão no disco (`assets/GAME-ASSETS/10-source-files/spriters-resource/`), confirmados via `ls -la` nesta e nas sessões anteriores. |

**Nenhum proxy foi contornado** — todas as chamadas desta rodada usaram os hosts diretos já em uso (`api.github.com`, `raw.githubusercontent.com`, e os 3 domínios próprios de cada site), sem túneis, mirrors ou user-agents alternativos.

---

## Limitações desta entrega

**Primeira rodada (retomada pós-limite ~07h):**
- Nenhum novo `web_fetch`/`web_search` foi feito — só reaproveitamento de dados já extraídos em sessões anteriores (2026-11-08/09) e 1 verificação local de alias de nome (gratuita, sem rede).
- O conteúdo visual (pixels) das 2 folhas combinadas de Digmon/Submarimon não foi aberto/inspecionado — só a existência e o tamanho em bytes foram confirmados via `ls`.

**Segunda rodada (pós-reset ~12h, esta atualização):**
- 3 das 5 fontes PENDENTE (DIM Modifier, DMC Sprite Database, Aderek Database) são SPAs que `web_fetch` não renderiza — permanecem **não verificadas de fato** (só confirmamos que existem e qual o título da página); abrir seu conteúdo real exigiria uma ferramenta de navegador, fora do escopo desta chamada.
- As pastas `story`/`story_ow`/`adventure_02_ow` do repositório kaisadilla foram localizadas (via GitHub Contents API) mas seu conteúdo individual (arquivos, resolução exata, número de quadros) **não foi aberto** — só a estrutura de diretórios.
- A resposta à pergunta-chave (§13.2) depende de não existir algo em 48-64px nas 3 fontes bloqueadas por SPA — isso **não foi confirmado**, é uma lacuna de evidência assumida como negativa pela aderência ao padrão observado em todas as 7 fontes que PUDERAM ser abertas (todas ou ~24-34px multi-direcional ou LCD minúsculo ou pose única de batalha maior sem direções).
- O `map_assets_catalog.json` foi montado por heurística de nome de arquivo (palavras-chave), não por abertura visual de cada imagem — pode haver falsos positivos/negativos na classificação cenário-vs-personagem.
- Galeria visual animada e demonstração funcional com 5+ Digimon (itens 8 e 12 da entrega obrigatória do briefing) continuam pendentes para a próxima fase.
