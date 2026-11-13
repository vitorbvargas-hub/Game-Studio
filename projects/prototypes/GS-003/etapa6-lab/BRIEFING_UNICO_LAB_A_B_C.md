# BRIEFING_UNICO_LAB_A_B_C — Etapa 6, Comando 3, passo 4 de 7

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1–D6) e `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` (objetivo de 3 versões jogáveis por link, ordem de execução, portão de autorização).
- **Base lida:** `ESCALA_E5_POR_ESPECIE_V1.md`, `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` (passo 3, game-design); `COMPARATIVO_PALETAS_FLORESTA_V1.md` (passo 2, game-art); `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 (layout-brief 40×30); `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §2–§6 (briefing anterior, regras do motor, checklist I-01..I-16); `AJUSTES_RUBRICA_VISUAL_V1.md` (17 bloqueantes, 3 dimensões de mapa); `art/digi-forest-v15/v15b/V15B.md` (estrutura aprovada a preservar); preços confirmados via `search_help` (gratuito) em `create_character`, `animate_character`, `create_topdown_tileset`, `create_map_object`, `animate_object`, `create_character_state`, `create_building_kit`.
- **Regra respeitada: 0 gerações PixelLab nesta entrega.** `get_balance` verificado: **737,95/2000, sem variação** (confirmado no início e no fim desta tarefa). Nenhum código, mapa, sprite ou Database alterado; nenhum commit; nenhum outro agente acionado.
- **Função deste documento:** é o **único** briefing para os métodos A, B e C — qualquer um dos três produz exatamente o que está aqui, nem mais nem menos, para que a comparação meça a ferramenta, não o brief. Nada aqui é produção: nenhum asset é gerado por este documento.
- **Ordem obrigatória de execução (ADENDO §7, não é deste agente decidir, só repetir):** A só começa depois de o game-studio receber e avaliar o ZIP consolidado do ChatGPT; B só começa depois do orçamento PixelLab autorizado pelo fundador; C só começa depois de A e B terem resultados aproveitáveis. Nenhuma produção é autorizada por este documento.

---

## 0. O que este briefing NÃO decide

- Não decide a paleta final (P-i, P-ii ou P-iii) — é variável do teste, o fundador escolhe (D5).
- Não decide o valor exato de px dentro das faixas da E5 — os valores abaixo são o **ponto de partida de teste** que a própria `ESCALA_E5_POR_ESPECIE_V1.md` propõe (D2: "os valores não" estão decididos).
- Não resolve os 5 conflitos visuais abertos (Endesga-32 × v13/v15, escala Tamer/Digimon, critério unificado de qualidade, composição/densidade de mapas, convenções da Database) — mede e relata, não escolhe lado (AGENTS.md §5).
- Não autoriza nenhuma geração, integração, deploy ou migração.

---

## 1. Elenco do laboratório

### 1.1 Tamer base + 2 variações

Contrato técnico completo: `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §1–§7 (D1: 36–50 px de conteúdo, personalizável). Para este teste, fixo um ponto único dentro da faixa, para que os 3 métodos produzam o **mesmo alvo**, não pontos diferentes da faixa:

| Atributo | Valor do teste |
|---|---|
| Altura de conteúdo-alvo | **40 px** (meio da faixa 36–50 px, D1) |
| Canvas | **48×48 px** (banda "36–42 px" de `ESPECIFICACAO_TAMER` §1, com ≥6 px de margem livre no topo) |
| Camadas (ordem de composição) | Sombra → Corpo → Roupa inferior → Roupa superior → Cabelo → Acessório (`ESPECIFICACAO_TAMER` §2) — **ou**, se o método produzir preset completo (não camadas reais), a mesma ordem vale só como checklist de presença visual |
| Direções | **4 (S, N, W, E)** — o runtime hoje só monta 4; 8 geradas sem uso em jogo (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 4) |
| Animações mínimas | `idle`: 4 quadros (respiração, padrão já aprovado no v13); `walk`: 4 quadros por direção, nas 4 direções |
| Pivô | No pé, idêntico em todas as camadas e quadros (`ESPECIFICACAO_TAMER` §6) |
| Transparência | PNG RGBA, alfa 0 no fundo, sem halo (I-01/I-02) |
| Paleta | **Variável do teste** — cada método relata contra as 3 candidatas (§3) |
| As 2 variações | 2 presets alternativos completos (1 combinação diferente de estilo/cor por camada cada) — **não** a grade combinatória inteira (`ESPECIFICACAO_TAMER` §9); mesma altura/canvas/direções/animações do base |

### 1.2 Elenco prioritário (Digimon)

Faixas de porte: `ESCALA_E5_POR_ESPECIE_V1.md` §3.1 (fixado aqui como o alvo de teste, dentro da faixa proposta — meio de cada banda, para dar um ponto único e testável):

| Digimon | Altura-alvo | Largura-alvo | Canvas sugerido | Direções | Animações mínimas | Pivô | Colisão (Rota 1, não muda) |
|---|---|---|---|---|---|---|---|
| **Koromon** | 25 px | 30 px | 32×32 | S, N, W desenhadas + E espelho | `idle` 1 quadro (blob, sem ciclo de respiração); `walk` 2–4 quadros/direção | Centro da base do blob (não "pé") | Raio 12 px |
| **Agumon** | 36 px | 27 px | 40×40 | S, N, W + E espelho | `idle` 1 quadro; `walk` 4 quadros/direção | No pé | Raio 16 px |
| **Greymon** | 53 px | 45 px | 64×56 | S, N, W + E espelho | `idle` 1 quadro; `walk` 4 quadros/direção | No pé (cauda fora da caixa de colisão, §3 da ESCALA) | Raio 22 px |
| **MetalGreymon** | 62 px | 55 px | 72×68 | S, N, W + E espelho | `idle` 1 quadro; `walk` 4 quadros/direção | No pé (braço-garra assimétrico, sem sombra própria) | Raio 26 px |
| **WarGreymon** | 77 px | 64 px | 88×84 | S, N, W + E espelho | `idle` 1 quadro; `walk` 4 quadros/direção | No pé (asas/armadura sem sombra própria) | Raio 30 px |

### 1.3 Elenco complementar (só candidato de teste de produção — sem autorizar encontro/mecânica)

| Digimon | Altura-alvo | Largura-alvo | Canvas sugerido | Direções | Animações mínimas | Fonte de identidade |
|---|---|---|---|---|---|---|
| **Betamon** | 32 px | 28 px | 36×36 | S, N, W + E | `idle` 1; `walk` 2–4/direção | Sprite oficial já em `world-species.json` (in_pilot:false, in_roster:true) |
| **Kunemon** | 22 px | 35 px | 40×28 (mais largo que alto, postura serpentiforme) | S, N, W + E | `idle` 1; `walk` 2–4/direção | **Fora da Database.** Fonte Wikimon [E, `wikimon.net/Kunemon`, 2026-11-13] — sem imagem oficial no projeto; precisa de referência externa antes de qualquer produção (ver §6.2) |
| **Palmon** | 38 px | 36 px | 44×44 | S, N, W + E | `idle` 1; `walk` 2–4/direção | Sprite oficial já em `world-species.json` (in_pilot:false, in_roster:true) |
| **Kuwagamon** | 56 px | 70 px (pinças "gigantes" se projetam além do corpo) | 80×64 | S, N, W + E | `idle` 1 (voador/pairado); `walk` ou `fly` 2–4/direção | **Fora da Database.** Fonte Wikimon [E, `wikimon.net/Kuwagamon`, 2026-11-13] — sem imagem oficial no projeto; precisa de referência externa antes de qualquer produção (ver §6.2) |

**Nota de rastreabilidade (ADR-015, obrigatória nos 3 métodos):** Koromon/Agumon/Greymon/MetalGreymon/WarGreymon/Betamon/Palmon = (1) oficial, fonte = Reference Book/rip DW DS, camada `official-fan-use`. Kunemon/Kuwagamon = (1) oficial como espécie (nome/design reconhecido), mas **sem fonte visual própria no estúdio** — qualquer arte produzida é (2) recriação/adaptação a partir só da descrição textual do Wikimon, sem inventar detalhe de cor/padrão não descrito.

---

## 2. Mapa — floresta-piloto 40×30

**Preserva o que já está aprovado em v15/v15b** (`V15.md`, `V15B.md`): mesma dimensão de tile (32 px), mesmo princípio "chão todo verde, caminho por maciços de árvore, sem trilha marrom" (decisão do fundador, 12/11), mesma lista de elementos (rio, cachoeira, ponte, desníveis, santuário, elementos digitais). O layout-piloto em si (zonas, POIs) é `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 — reproduzido e detalhado tecnicamente abaixo. **Não é uma expansão do mapa de produção** (ADR-012 continua em vigor): é o mapa de teste do laboratório, compartilhado pelos 3 métodos.

### 2.1 Diagrama de zonas (herdado, 40×30, bloco ≈4×4 tiles)

```
                 N (santuário / portal de saída)
      #  #  #  Z  Z  P  #  #  #  #
      #  .  .  Z  Z  Z  .  M  M  #
      #  B2 R  R  W  .  M  M  .  #
      #  .  R  P  R  .  M  M  M  #
      #  C  C  .  .  M  M  .  M  #
      #  C  C  .  .  .  .  M  .  #
      #  B1 .  T  T  T  T  .  .  #
      #  #  S  S  S  S  S  #  #  #
                 S (entrada / zona segura)
```

Requisitos (D2 do ADR, §7 layout-brief): chão predominantemente verde sem trilha marrom contínua; caminhos formados pela vegetação; clareiras e mato alto; rio, cachoeira, ponte e desníveis; santuário e elementos digitais; vegetação variada; escala coerente com a §1 acima.

### 2.2 Especificação técnica de mapa — **não presumir que uma ilustração vira tileset automaticamente**

Qualquer um dos 3 métodos que produza só uma "pintura" do mapa (uma imagem única do cenário inteiro) **não** atende a este briefing: o mapa final precisa dos elementos abaixo, cada um no formato que o motor exige (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.3.4) — tile 32×32 exato, colisão marcada, Y-sort por pé, props com pivô próprio. Uma ilustração de cena única não tem nada disso: precisa ser **recortada, marcada e reconstituída** tile a tile e objeto a objeto (passo A caminho "imagem inteira de mapa", §6.3.4 da COMPARATIVO) — isso é trabalho adicional, não um atalho.

#### Tiles de terreno (quantidade mínima, por tipo de transição)

| # | Tile/transição | Ferramenta típica | Quantidade de variantes exigida |
|---|---|---|---|
| 1 | Grama base (variante A) | Wang tileset grama↔água | 1 conjunto (16 ou 25 tiles conforme `transition_size`) |
| 2 | Grama variante B (2ª textura de piso verde) | Wang tileset ou tileset independente | 1 conjunto — exigido pelo item 5 da legibilidade (`ESTUDO_REGIOES` §7: "pelo menos 2 variações de textura de piso verde") |
| 3 | Água (rio/lago) | parte do conjunto grama↔água acima | — |
| 4 | Transição terra/desnível (margem elevada, penhasco) | Wang tileset ou `create_tiles_pro(tile_feature="tileset", elevation=...)` | 1 conjunto — exigido pelo item 4 da legibilidade (desnível na moldura) |
| 5 | Piso do santuário (opcional, se a zona Z tiver chão distinto — ex.: pedra/padrão digital) | Wang tileset grama↔pedra, ou `create_tiles_pro` | 1 conjunto, **se** o produtor optar por piso distinto em Z (não obrigatório) |

**Total mínimo: 3 conjuntos de tileset** (grama↔água, grama↔desnível, +1 variante de grama), **até 4** com o piso do santuário.

#### Objetos (props), quantidades estimadas por zona (baseado no esquema de blocos §2.1, [H] escala a partir da densidade da v15b)

| Zona | Área aprox. (tiles, [H] a partir da contagem de blocos) | Objeto | Quantidade [H] |
|---|---|---|---|
| `#` (moldura/mata fechada) | ~384 | Árvores (≥3 espécies distintas, item 6 da legibilidade) | 140–170 |
| `M` (mata densa/corredor) | ~176 | Árvores (bolsões laterais, não cobrindo o corredor) | 50–70 |
| `M`/`.` (transição) | ~288 | Tufos de mato (≥2 variantes) | 60–90 |
| `T` (trilha) | ~64 | Tufos de mato raso, esparsos | 10–15 |
| `C` (clareira) | ~64 | Fogueira (1), NPC-guia (1 personagem, não objeto), decoração (pedras/flores) | 3–5 decorativos |
| `R` (margem do rio) | ~64 | Vegetação baixa (juncos/decorativa) | 10–15 |
| `Z` (santuário) | ~80 | Totem/estrutura digital (1–2), moldura de mato denso | 15–20 tufos + 1–2 estruturas |
| `P` (ponte) | ~32 (2 blocos) | Ponte de madeira (1 prop multi-tile ou segmentos) | 1 (travessia completa) |
| `W` (cachoeira) | ~16 | Cachoeira (1 prop animado) | 1 |
| `B1`, `B2` (bolsões) | ~16 cada | Item/baú de recompensa ou encontro raro (decorativo nesta rodada, sem mecânica) | 1 cada |
| Portal (N) | — | Portal de transição (1 prop) | 1 |

**Nenhuma árvore ou prop em célula de água** (exclusão de 1 célula de margem, regra já seguida na v15b).

#### Camadas (correspondendo ao formato `.tmj` real do motor, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.1/§6.3.4)

1. **Camada de terreno** (tile layer): grama + água + desnível, pintada pelos Wang tilesets do item acima.
2. **Camada de objetos** (`objectgroup`): árvores, props, estruturas, cada um com `prop`, pé (pivô) e `solid` quando bloqueia; inclui `start` (ponto de entrada em S) e `portal` (saída em N).
3. **Camada de props animados**: cachoeira e brilhos de água, com `frameMs` próprio (ver animações ambientais abaixo).
4. **Dados de encontro** (fora da camada visual, JSON separado `src/data/encounters/<id>.json`) — **[PROPOSTA, Camada B]**, regras de jogo congeladas (AGENTS.md §2); nesta rodada o campo existe no formato, mas **nenhum encontro é ativado**.

#### Animações ambientais

| Elemento | `frameMs` [E, convenção já em uso] | Observação |
|---|---|---|
| Água (brilho de superfície) | 140 ms | Ainda estático na v15b hoje (pendência aberta do game-dev, `V15B.md`) — este briefing propõe animar para o teste |
| Cachoeira | 110 ms | Já animada na v15b |
| Tufos de mato (sway) | — | Opcional, não exigido nesta rodada |

#### Colisões

| Elemento | `solid` |
|---|---|
| Árvores, rochas, estruturas do santuário, totem, portal | `true` |
| Água | `true` (não andável — regra padrão, salvo decisão futura) |
| Ponte | `false` (andável, é travessia) |
| Mato, tufos, vegetação decorativa | `false` |
| Corredor principal (S→T→C→M→R→Z) | sempre livre, mínimo 2 tiles de largura, nunca largura constante de exatamente 2 (item 9 da legibilidade, `AJUSTES_RUBRICA_VISUAL_V1.md` bloqueante #15) |

#### Posicionamento dos POIs (coordenadas aproximadas, [H] derivadas do esquema de blocos — **não é grade 1:1 definitiva**; o produtor ajusta na composição real)

| POI | Zona | Coordenada aprox. (x,y em tiles) |
|---|---|---|
| Entrada / zona segura | S | (16, 30) |
| Trilha inicial | T | (18, 26) |
| Clareira de descanso + fogueira + NPC-guia | C | (6, 18) |
| Bolsão de surpresa 1 | B1 | (4, 25) |
| Mata densa / corredor principal | M | (26, 10) |
| Ponte | P | (12–20, 12) |
| Cachoeira | W | (16, 8) |
| Margem do rio / clareira de exibição (Digimon grande visível) | R | (12, 10) |
| Bolsão de surpresa 2 | B2 | (4, 9) |
| Santuário (chefe de região) | Z | (16, 2) |
| Portal | N | (16, 0) |

---

## 3. Paleta de trabalho — variável do teste

As 3 candidatas de `COMPARATIVO_PALETAS_FLORESTA_V1.md` (D5), com as pranchas já produzidas (`etapa6-lab/paletas/`):

| Candidata | Cores | Risco medido |
|---|---|---|
| **P-i** Endesga-32 completa | 32 | Alto retrabalho — o chão aprovado (`#76ca9f`) fica mais perto de um cinza-azulado da Endesga-32 do que de qualquer verde dela; grama lê como pedra |
| **P-ii** v15b real (medida) | 28 | Zero distorção, mas viola a regra dura hoje em vigor (Style Bible §3.2/§8.3) — exige reescrita da regra |
| **P-iii** Harmonização | 21 (subconjunto Endesga-32 com viés de temperatura) | Risco médio — chão continua verde, mas não é a cor exata em produção |

**O fundador escolhe entre P-i, P-ii e P-iii** (D5 ainda não decidida). Cada método deve registrar a % de pixels dentro de cada uma das 3 (não travar numa delas antes do teste), exatamente como já pedia `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §2.3.

---

## 4. Condições de teste e critérios de qualidade — iguais nos 3 métodos

- **Régua homologada (D4):** `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 + `AJUSTES_RUBRICA_VISUAL_V1.md` §6 (17 bloqueantes, nota mínima 8,0 ponderada, nenhum critério <7, 3 dimensões de mapa).
- **Checklist técnica binária (I-01 a I-16):** `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.5 — aprovado = todos os itens aplicáveis "sim".
- **Avaliação em sessão separada da produção** (AGENTS.md §6): quem produz não homologa o próprio trabalho.
- **Vocabulário de veredito:** "aprovado/reprovado/aprovado com ressalva" para a comparação A/B/C; "candidato aproveitável/precisa de retrabalho/fraco como referência" só para reaproveitamento de Fase 0 (nunca misturar os dois vocabulários).
- **Métrica de consistência entre quadros:** variação de altura ≤5% entre quadros do mesmo ciclo (pivô no pé, variação ≤1 px).
- **Registro de custo obrigatório, nunca somado à nota:** gerações PixelLab (Método B/C) e horas humanas/agente (Método A/C), relatados separados (`RUBRICA_QUALIDADE_VISUAL_V1.md` §3).

---

## 5. Ordem obrigatória de execução (ADENDO §7 — repetida aqui, não decidida por este agente)

1. **A** só começa depois de o `game-studio` receber e inventariar o ZIP consolidado do ChatGPT (pendente — ver `INVENTARIO_ASSETS_METODO_A_V1.md`).
2. **B** só começa depois do orçamento PixelLab (`ORCAMENTO_PIXEL_LAB_PILOTO_V1.md`, passo 7) ser apresentado e **autorizado explicitamente pelo fundador**.
3. **C** só começa depois de A e B terem produzido resultados aproveitáveis.
4. O teto de geração aprovado não é ultrapassado; se faltar orçamento, a execução para e pede nova autorização.
5. Nenhuma integração ou deploy sem autorização específica.

---

## 6. Entregável 3 — Especificações de produção por método

Para cada item do elenco e do mapa (§1–§2), como cada método produziria — **nada executado nesta entrega**, só planejamento. Custos do Método B confirmados via `search_help(tool=...)` (gratuito, sem geração).

### 6.1 Método A — ChatGPT + conversão gratuita (Aseprite/GIMP/`pixelart_workbench`)

Fluxo idêntico ao já descrito em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §1.1/§6.4 (passos A1–A8), aplicado a cada item deste briefing:

| Item | Como seria produzido | Esforço estimado [H] |
|---|---|---|
| Tamer base + 2 variações | ChatGPT gera a ilustração de cada camada (ou do preset completo) → A1–A5 (grade/escala/paleta/recorte/pivô) → A6 (direções e quadros, o passo mais caro) → A7–A8 (folha + manifesto) | ~13,5–32,5 h por preset (`COMPARATIVO` §6.4) × 3 = **~40–98 h** para base+2 variações, maior se cada camada for tratada separadamente (`ESPECIFICACAO_TAMER` §9: Método A "escala pior com personalização em camadas") |
| Koromon/Agumon (pequeno/médio) | Mesmo fluxo A1–A8 | ~7,5–20,5 h cada (`COMPARATIVO` §6.4) |
| Greymon/MetalGreymon (grande) | Mesmo fluxo | ~12–27,5 h cada (faixa "Digimon grande") |
| WarGreymon (gigante) | Mesmo fluxo, mais quadros por detalhe de armadura/asas | ~12–27,5 h, provavelmente no topo da faixa |
| Betamon/Palmon/Kunemon/Kuwagamon (complementar) | Mesmo fluxo; Kunemon/Kuwagamon exigem antes uma referência visual (fora da Database, sem sprite oficial no projeto) — custo extra de pesquisa/composição não estimado | ~7,5–20,5 h cada (porte pequeno/médio), mais para Kuwagamon (porte grande, pinças assimétricas) |
| 3 tilesets de terreno (grama↔água, grama↔desnível, +variante) | Textura gerada no ChatGPT + recorte manual em grade 32 px + autotile manual (até 16 variantes por par, sem Wang automático) | 4–10 h por par Wang (`COMPARATIVO` §6.4) × 3 = **~12–30 h** |
| ~150–250 props (árvores, mato, ponte, cachoeira, totem, portal) | Gerar + pixelizar + limpar cada **variante** (não cada instância — a mesma árvore é reaproveitada/replicada na composição) | 0,6–1,7 h por variante única; com ~8–10 variantes distintas (3 árvores + 2 mato + ponte + cachoeira + totem + portal) ≈ **~6–17 h** |
| Composição do mapa 40×30 (recorte/colisão/Y-sort manual) | Marcação manual de colisão, mato, água, Y-sort no `.tmj` (nenhum Y-sort automático para imagem pintada de uma vez) | **Não estimado** — maior variável do método (`COMPARATIVO` §4.3: "o tempo de composição, não de geração, domina o custo real") |
| **Total estimado [H], elenco + cenário, sem composição de mapa** | | **~75–195 h** |

**Custo em créditos ChatGPT:** não pode ser estimado — este ambiente não tem acesso à conta/plano do fundador (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §4.2).

### 6.2 Método B — PixelLab (ferramenta exata + custo em gerações, confirmado via `search_help`)

| Item | Ferramenta PixelLab | Custo confirmado [E, `search_help`] | Observação |
|---|---|---|---|
| **Tamer base** | `create_character(mode="v3", size=48)` — humanoide, sem referência, cobre as 8 rotações no mesmo preço | **2 gerações** (banda 16–90 px) | v3 sem referência é só para humanoide — o Tamer se encaixa |
| **Tamer: animação walk** | `animate_character(template_animation_id="walking")`, 3 direções geradas (S,N,W) + E por `mirror_animation` (grátis) | **1 geração/direção até ~92 px** → 3 gerações | Canvas 48 px cabe na banda 1 gen/dir |
| **Tamer: animação idle** | `animate_character(template_animation_id="breathing-idle")`, 3 direções + E espelho | **3 gerações** | Mesma banda |
| **Tamer base, subtotal** | | **8 gerações** | Bate com o histórico real do v13 (~7,2 gens/preset) |
| **Tamer: 2 variações** (presets completos, não camadas reais — achado do `ESPECIFICACAO_TAMER` §9: PixelLab não tem camada alpha nativa) | `create_character_state(edit_description=...)` por variação (10 gens, redesenha as 8 rotações numa só cobrança, canvas 48 px ≤84 px) + reanimar walk/idle por estado (mesma lógica acima, ~6 gens cada) | **~16 gerações/variação** (10 estado + 6 animação) × 2 = **~32 gerações** | `create_character_state` NÃO reaproveita a animação do base — cada estado precisa de sua própria |
| **Koromon, Agumon, Greymon, MetalGreymon** (porte pequeno/médio/grande) | `create_character(mode="pro", reference_image_url=<rip DS oficial>, size=<alvo da §1.2>)` — Pro rotate, mantém identidade, permite redimensionar (achado: v3+referência NÃO permite mudar o tamanho de saída, Pro sim) | **10 gerações cada** (banda ≤85 px) | Canvas-alvo de todos os 4 cabe em ≤85 px |
| **WarGreymon** (gigante, canvas ~88 px) | Mesma ferramenta, size ~88–96 px | **15 gerações** (banda 86–113 px) | |
| **5 prioritários, subtotal (estático, 8 direções cada)** | | **55 gerações** | |
| **Animação walk+idle dos 5 prioritários** | `animate_character(mode="v3", action_description=...)`, custom (não template — corpo não-humanoide não tem skeleton de template confiável), 3 direções + E espelho | `ceil(w×h×frames/65536)` por direção — nos 4 pequenos/médios/grandes (canvas ≤64 px): **1 gen/dir** → ~6 gens cada (walk 3 dir + idle 3 dir); WarGreymon (canvas ~88 px, 8 quadros): **2 gens/dir** → ~12 gens | **~36 gerações** no total (4×6 + 12) |
| **Betamon, Palmon** (sprite oficial já no projeto) | `create_character(mode="pro", reference_image_url=<sprite já no world-species.json>, size=...)` | **10 gerações cada** | **20 gerações** (estático) |
| **Kunemon, Kuwagamon** (sem sprite oficial no projeto) | Mesma ferramenta, **mas precisa antes de uma imagem de referência externa** (Wikimon não tem arte própria livre de direitos identificada nesta sessão) — sem essa referência, cairia em v3 sem referência, que é só humanoide e desenharia errado | **10–15 gerações cada, condicionado à obtenção de uma referência visual legítima primeiro** | **Dependência não resolvida — ver §6.2.1** |
| **4 complementares, animação idle mínima (1 quadro, sem walk)** | `animate_character(mode="v3", frame_count=4)`, 1 direção (sul) | ~1 gen/direção nos 4 | **~4 gerações** |
| **Mapa — 3 tilesets de terreno** | `create_topdown_tileset(mode="standard")` por par (grama↔água, grama↔desnível, +variante) | **1 geração cada** (modo standard, roda em pixen) | **3 gerações** |
| **Mapa — props únicos** (≈8–10 variantes: 3 árvores, 2 mato, ponte, cachoeira, totem/estrutura digital, portal) | `create_map_object(description=..., width=..., height=...)` por variante **nova** (reaproveitar objetos já pagos na conta, quando a paleta permitir, custa 0) | **[H] ~1 geração por variante nova** (preço não detalhado no `search_help` desta ferramenta nesta sessão; estimativa por analogia com ferramentas de objeto equivalentes) | **~8–10 gerações**, ou 0 se tudo reaproveitado da conta (paleta compatível) |
| **Mapa — animação da cachoeira/água** (se precisar regenerar, em vez de reaproveitar a já existente) | `animate_object(mode="v3")` | `ceil(w×h×frames/65536)` por direção, mínimo 1 | **~1–2 gerações**, ou 0 se reaproveitado |

#### 6.2.1 Dependência não resolvida: Kunemon e Kuwagamon

Nenhum dos dois tem imagem oficial no estúdio (fora da Database, sem rip, sem concept art próprio). `create_character` v3 sem referência é **só humanoide** — desenharia um Kunemon bípede errado. **Antes de orçar a produção real desses dois**, é preciso: (a) uma referência visual legítima (ex.: uma imagem a que o estúdio tenha acesso de fato, nunca contornando DRM, ADR-015) para alimentar `mode="pro", reference_image_url=...`, ou (b) aceitar gerar via texto puro em `mode="pro"` sem referência (ainda aceita descrição livre, mas sem a garantia de fidelidade que uma referência dá) — **decisão não tomada aqui**, registrada como pendência do fundador/game-research (igual à pendência P3 do ADR).

### 6.2.2 Totais do Método B

| Rodada | Itens inclusos | Total [H] |
|---|---|---|
| **Mínima viável (≤15 gerações, teto do D6)** | Tamer base **estático** (`create_character` v3, size 48) = 2 gens + Koromon **estático** (`create_character` pro+referência, size ~32) = 10 gens | **12 gerações** — prova as duas rotas de personagem (humanoide sem referência × não-humanoide com referência Pro), **sem animação** nesta rodada minima |
| **Mínima viável + 1 animação de prova** | Acima + `animate_character(template_animation_id="walking")` no Tamer, 1 direção (sul) | **13 gerações** |
| **Pacote completo do laboratório (elenco §1 + mapa §2, Método B)** | Tamer (base+2 variações, 40 gens) + 5 prioritários estático+animação (55+36=91 gens) + 4 complementares estático+idle (20+[10–15]×2+4 ≈ 44–54 gens, Kunemon/Kuwagamon condicionados) + mapa (3 tilesets + ~8–10 props + animação de água ≈ 12–15 gens) | **≈ 190–220 gerações** [H], com os 10–30 gens de Kunemon/Kuwagamon dependentes da §6.2.1 |

**Saldo disponível:** 737,95/2000. O pacote completo (~190–220 gens) cabe dentro do saldo atual, **mas não está autorizado** — só a rodada mínima (até 15, D6) é a proposta desta etapa; o pacote completo é insumo para o orçamento do passo 7 (`game-studio`), não uma autorização deste documento.

### 6.3 Método C — Híbrido (A + B)

Combina as duas colunas acima pela regra já fixada em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §1.3: base sempre o sprite oficial/PixelLab para identidade e animação (mais barato e mais consistente, histórico real do Tamer v13), ChatGPT só para concept art de apoio (Tamer: explorar roupa/cor antes do PixelLab) ou para um prop muito específico sem equivalente pronto na conta (ex.: estrutura digital do santuário). Para o Tamer com camadas reais (não presets), C é "o caminho mais plausível" segundo `ESPECIFICACAO_TAMER` §9: gerar o(s) preset(s) no PixelLab (mesmo custo do Método B acima) **mais** um custo de extração manual por camada (0,5–2 h por camada extraída, trabalho de recorte sobre arte já limpa, não de pixelização do zero).

| Item | Custo PixelLab (igual a B) | Custo manual adicional [H] |
|---|---|---|
| Tamer com camadas reais | 8 gens (base) | +2,5–10 h (5 camadas × 0,5–2 h) de extração |
| Digimon (qualquer) | Igual a B por espécie | Só se precisar de concept art de apoio antes do Pro rotate — não obrigatório |
| Prop único do santuário (sem equivalente na conta) | 0 (se for via ChatGPT+conversão) ou 1 geração (se via `create_map_object`) | 0,5–1,5 h de conversão, se via ChatGPT |

**Nunca testado no projeto** — toda esta seção é proposta de fluxo [H] (mesma ressalva já registrada em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §1.3).

---

## 7. Limitações desta entrega

1. Nenhum valor de px, paleta ou escala é definitivo — tudo aqui é ponto de partida de teste (D2, D5).
2. Os custos do Método A (horas) e do Método C (horas + geração) são estimativa de domínio [H], nunca medidos neste projeto com este briefing exato.
3. Os custos do Método B usam preços confirmados via `search_help` (gratuito), mas as **quantidades de direções/quadros/variantes de prop** são a proposta deste briefing, não um teste real — o custo real pode variar por qualidade de resultado na 1ª tentativa (histórico do projeto mostra retrabalho como maior variável de custo, não a geração isolada).
4. `create_map_object` não teve uma linha de custo explícita retornada por `search_help` nesta sessão — o valor usado (~1 geração/variante) é estimativa por analogia com ferramentas de objeto equivalentes, não uma citação direta da ferramenta.
5. Kunemon e Kuwagamon não têm referência visual no estúdio — a produção de qualquer um dos 3 métodos para essas duas espécies depende de uma decisão/fonte ainda não resolvida (§6.2.1).
6. Este documento não produz, não gera e não integra nada — é só o briefing e as especificações de produção, para o `game-studio` montar o orçamento do passo 7 e para a execução real (quando autorizada) seguir.
