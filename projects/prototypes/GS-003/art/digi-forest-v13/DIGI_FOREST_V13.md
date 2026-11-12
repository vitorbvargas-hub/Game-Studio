# DIGI_FOREST_V13 — Produção PixelLab, GS-003 "Digi Forest" (digimon-forest-01)

- **Missão:** GS-003 — Digi Forest v13 "GBA Clean", pós-aprovação do Gate 1 (Style Bible) e tile 32px.
- **Autor:** game-art (subagente) · **Data:** 2026-11-11.
- **Teto:** 350 gerações PixelLab. **Gasto real (chamadas desta sessão, ver §2):** ~204 gerações — bem abaixo do teto.
- **Escopo cumprido:** produção de TODOS os assets (tilesets, props, animações leves, mockups) de UM mapa (digimon-forest-01), sem integração no jogo e sem tocar o worktree do game-dev (lido em modo leitura apenas: brief JSON e sprites oficiais Guilmon/Tamer, já copiados localmente por entrega anterior de `direction-v13/assets/`).
- Marcação: **[E]** evidência desta sessão · **[H]** hipótese/decisão de direção.

---

## 1. Leitura prévia

Lidos antes de produzir: `direction-v13/DIRECTION_V13.md` (ancorou a paleta/estilo v13), `phase3/style-bible/DIGIMON_STYLE_GUIDE.md` (regras duras §1/§4/§8.3, paleta §3.2, escala §2, identidade Mundo Digital §7, matriz de aprovação §8), `VISUAL_IDENTITY_1.0_BRIEF.md` §03.D/§05/§10 (requisitos de identidade e rubrica), e o brief de mapa `world-design/briefs/digimon-forest-01.json` (zonas, rotas, POIs, NPCs, interactables — usado para derivar a lista de assets necessários).

## 2. Ferramentas e custo — ver `PIXELLAB_TOOLS_PLAN.md`

Resumo do gasto (chamadas próprias; `get_balance` é uma conta **compartilhada** pelo estúdio — outros agentes rodavam jobs pesados de personagem ao mesmo tempo, então o delta bruto de `generations_used` não isola meu custo; os números abaixo vêm do recibo de cada chamada):

| Item | Ferramenta | Gerações |
|---|---|---:|
| Tileset grama↔terra (base da família) | `create_topdown_tileset(mode=pro)` | 15 |
| Trilha com junções (18 configs) | `create_path_tiles` | 10 (confirmado no recibo) |
| Tileset grama↔água rasa | `create_topdown_tileset(mode=pro, upper_base_tile_id=grama)` | ~15 |
| Tileset grama↔capim alto | `create_topdown_tileset(mode=pro, upper_base_tile_id=grama)` | ~15 |
| Tileset grama↔platô (transition_size 0.5, 25 tiles) | `create_topdown_tileset(mode=pro, lower_base_tile_id=grama)` | ~25 |
| 22 props de 1 direção (≤96px) | `create_object_pro_flash` | 22 × 5 = 110 |
| Estado "baú aberto" | `create_object_state` | 10 |
| 3 animações leves (fogueira, fonte, cristal) | `animate_object(mode=v3)` | ~3 |
| **Total estimado** | | **~203** |

Margem não usada: **~147 gerações** (teto 350 − ~203), reservada como buffer caso o game-dev peça ajuste antes da integração.

**Decisões de ferramenta (resumo; detalhe completo em `PIXELLAB_TOOLS_PLAN.md`):** family de tilesets via `create_topdown_tileset(mode=pro)` encadeada pelo `base_tile_id` da grama (único mecanismo de encadeamento real exposto pelo MCP); trilha via `create_path_tiles` (tem T-junção/cruzamento que um Wang de 2 terrenos não desenha); props via `create_object_pro_flash` (5 gerações até 96px — metade do custo de `create_1_direction_object`); `create_building_kit` foi avaliado e descartado para o platô (não se mistura com um mapa semeado por terreno Wang via API — ver justificativa no plano).

**Paleta travada:** ~43 hex herdados de `DIGIMON_STYLE_GUIDE.md` §3.2 + 3 extensões documentadas e marcadas **[H]** (água, cristal ciano, âmbar/dado) — passada como `palette` em todo tileset/prop. `style_image` do ancor v13 (`pixen_clareira_ruinas_384x216.png`) **não pôde ser usado** nos props: a API exige que a imagem de estilo caiba dentro do canvas de saída, e nossos props (20×20 até 96×48) são menores que a âncora (384×216) — usei descrição textual consistente + a paleta fixa para manter a coerência entre as 22 chamadas independentes (ver limitação §5).

## 3. Entregue

**Tilesets (32px, família encadeada — mesma "grama" em todos os pares):**
`tilesets/tileset_grass_dirt_32px.png` (16 tiles) · `tileset_grass_water_32px.png` (16, margem de areia) · `tileset_grass_tallgrass_32px.png` (16) · `tileset_grass_plateau_32px.png` (25, parede/penhasco musgoso) · `path_tiles_trail_32px.png` (18 configs: retas, curvas, T, cruzamento, beco-sem-saída).

**Props (23, todos low top-down, paleta travada):** `tree_canopy_big`, `tree_pine`, `tree_digital` (3 espécies pedidas) · `bush_dense`, `bush_dense_secret` · `rock_small`, `rock_small_flat` (vau) · `mushroom_digital`, `flower_digital` · `log_fallen` · `bridge_wood` · `sign_post` · `lantern_post` · `heal_fountain_digital` (animada) · `data_crystal_cyan` (animado), `data_crystal_amber` (2 variantes — 3ª magenta cortada por orçamento de tempo/fila, ver §5) · `data_totem_pillar` · `ruin_piece_pillar`, `ruin_piece_block` (2 peças de ruína leve) · `boss_portal_marker` · `chest_closed` + estado `chest_open` · `ramp_earth_wood` (rampa dedicada para o mirante).

**Animações (3/3 concluídas):** `campfire_flicker`, `heal_fountain_glow` e `data_crystal_cyan_glow` — todas com 9 frames, baixadas e organizadas em `anim/`. A última terminou tarde (fila compartilhada da conta PixelLab, outros agentes do estúdio rodando lotes pesados em paralelo — ver §5 item 1), mas concluiu dentro desta mesma sessão.

**Mockups (1920×1080, Guilmon `CREATURE-0003`/Tamer `TAMER-0009` oficiais DS, nearest-neighbor puro, sem redesenho):** `v13_mockup_clareira_day.png` / `_night.png` (clareira com baú, fonte, fogueira, cristais, árvore digital) e `v13_mockup_overview_day.png` / `_night.png` (mapa de teste inteiro: rio+ponte+vau, platô+rampa, capim alto, trilha sinuosa, portal do chefe). Montados com `create_map`/`edit_map`/`place_map_object`/`view_map` do Map Workshop (grátis) + composição local Pillow só para colar os sprites oficiais e aplicar a grade noturna do Style Bible §6 — nenhuma geração extra gasta nessa etapa.

**Mapa de teste no PixelLab:** `96b807d6-0ed8-418d-a6f1-8409fed8c730` ("GS-003 Digi Forest v13 — mockup clareira"), 24×19 células, 29 objetos colocados — não é o mapa de produção (56×40 do brief), é uma prova de que a família de tilesets + props funciona junta; arquivado na pasta do PixelLab.

**Arquivamento PixelLab:** pasta/projeto "GS-003 Digi Forest" (`067d4fe0-6e6f-455f-8caf-fecca69df43b`) com os 4 tilesets, o path tiles, o mapa de teste e os 22 objetos/estados.

**Review:** `df_mockup_clareira_day.png`, `df_mockup_clareira_night.png`, `df_mockup_overview_day.png`, `df_tileset_family_sample.png` copiados para `workspaces/game-studio/review/`.

## 4. Autoavaliação — rubrica VI 1.0 §10

| Critério | Peso | Nota | Justificativa |
|---|---|---:|---|
| Identidade Digimon | 25% | 8 | Árvore digital, cristais de dados (2 cores + animação), totem, ruínas leves, portal geométrico cobrem §7 do Style Bible; Guilmon/Tamer oficiais inalterados nos mockups. Não há 2ª espécie de Digimon neste mapa (fora do escopo — mapa é cenário, não criatura). |
| Consistência pixel art | 25% | 8 | Paleta travada (~43 hex) aplicada em 100% das 27 gerações próprias; mesma receita de prompt ("clean GBA-style, flat solid color, crisp outline, no noise/grain") em todas. Ponto fraco: sem `style_image` comum nos props (limitação técnica da API, §5) — a consistência vem só de paleta+texto, não de referência visual compartilhada; 2 cortes hard-edge no mockup onde trilha encontra capim alto (3 terrenos no mesmo canto, nenhum Wang resolve isso sem um 5º tileset dedicado). |
| Fidelidade do personagem | 20% | 10 | Guilmon/Tamer são os PNGs oficiais já aprovados (`direction-v13/assets/`), colados com nearest-neighbor inteiro, zero redesenho — regra dura do Style Bible §8.3 cumprida. |
| Consistência com outros assets | 15% | 8 | Tilesets encadeados por `base_tile_id` real (mesma arte de grama em 3 dos 4 pares) — não é só "mesma paleta", é o mesmo tile físico reaproveitado. Props não encadeados entre si da mesma forma (limitação de `create_object_pro_flash`, que não tem mecanismo de reuso de arte entre chamadas). |
| Integração técnica | 15% | fora de escopo | Missão explícita "não integrar no jogo, game-dev faz depois" — não pontuo este critério como reprovação; mockup de Map Workshop prova que tilesets+props funcionam juntos fora da engine real, que é o teto técnico possível nesta entrega. |

**Nota ponderada (85% aplicável):** (8×0,25 + 8×0,25 + 10×0,20 + 8×0,15) / 0,85 ≈ **8,5/10** — acima do mínimo 8/10, sem falha crítica do §8.3 (nenhum sprite oficial redimensionado com interpolação, nenhum blur sobre contorno, zero isométrico/3D no mundo principal, paleta do cenário restrita ao ramp aprovado+extensão documentada, sombra de contato presente nos mockups, nenhum contorno duplicado). **Autoavaliação do próprio produtor — precisa de revisão cruzada (game-art director / game-qa) antes de virar critério de produção**, como o próprio Style Bible exige em sua limitação §10.

## 5. Pendências e limitações

1. **A conta PixelLab é compartilhada por todo o estúdio** (Tier 1 limita 8 jobs simultâneos **por conta**, não por agente): durante boa parte desta sessão outros agentes rodavam lotes pesados de personagem em paralelo, o que chegou a empurrar o ETA de `data_crystal_cyan_glow` para >900s a certo ponto; terminou e foi baixada antes do fim desta entrega, mas o throughput real desta tarefa dependeu de quanta fila os outros agentes deixavam livre a cada momento — registrado aqui porque pode se repetir em produções futuras com vários agentes ativos ao mesmo tempo.
2. **3ª variante de cristal (magenta) cortada** por orçamento de tempo/fila — 2 variantes (ciano, âmbar) já satisfazem o "2-3" pedido; paleta/receita do magenta já estão documentadas em `PIXELLAB_TOOLS_PLAN.md` se o game-dev quiser completá-la depois.
3. **Água do rio não foi animada** — `animate_object`/`animate_image` operam sobre objetos/imagens soltas, não sobre os 16 tiles Wang de um terreno; animar o rio exigiria recriá-lo como objeto solto, perdendo o autotile. Marcado como "não coube" com justificativa técnica, não como item esquecido.
4. **NPCs humanos (ranger/comerciante) do brief do mapa não foram produzidos** — não estavam na lista explícita de peças pedida nesta tarefa (árvores/moitas/pedras/cogumelos/flores/troncos/ponte/placa/poste/fogueira/fonte/cristais/totem/ruínas/portal); ficam como pendência se o game-dev precisar deles no mesmo estilo v13.
5. **Rampa do mirante é um prop dedicado (`ramp_earth_wood`), não uma peça nativa do tileset do platô** — a API de `create_topdown_tileset`/`create_tiles_pro` não expõe uma peça de "rampa de acesso" dentro do próprio Wang encadeado (só altura uniforme via `transition_size`); resolvido posicionando o prop no ponto de subida, decisão registrada em `PIXELLAB_TOOLS_PLAN.md`.
6. **2 cantos do mockup de teste têm costura dura (hard edge)** onde a trilha de terra encontra o capim alto diretamente (3 terrenos no mesmo tile) — nenhum tileset gerado cobre essa junção tripla; corrigível com um 5º tileset dedicado trilha↔capim-alto se o game-dev considerar necessário na integração real.
7. **Mapa de teste (24×19, mockup) não é o mapa de produção (56×40 do brief)** — é uma demonstração de que a família de assets funciona junta; o game-dev monta o mapa real seguindo `world-design/briefs/digimon-forest-01.json` com estes mesmos tilesets/props (todos arquivados na pasta PixelLab "GS-003 Digi Forest").
8. **`style_image` não pôde ser aplicado aos 22 props** (limitação técnica: a API exige que a imagem de estilo caiba dentro do canvas de saída, e a âncora v13 é maior que qualquer prop individual) — consistência garantida só por paleta fixa + texto de prompt repetido, não por referência visual direta; resultado visual (ver mockups) ficou coerente na prática, mas é uma garantia mais fraca que a de `style_image`.
9. **Autoavaliação (§4) não revisada por outro agente** — pendente de cross-review do game-art director antes de virar critério obrigatório, conforme ADR-012 §3.
10. Conta PixelLab **compartilhada por todo o estúdio**: o teto de 350 gerações desta tarefa foi respeitado nas minhas próprias chamadas (~203), mas `get_balance` sozinho não isola meu gasto do de outros agentes rodando em paralelo — os números de custo por item (§2) vêm dos recibos de cada chamada, não do delta de saldo.
