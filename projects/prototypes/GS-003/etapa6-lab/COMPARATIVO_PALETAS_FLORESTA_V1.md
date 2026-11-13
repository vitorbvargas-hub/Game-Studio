# COMPARATIVO_PALETAS_FLORESTA_V1 — Etapa 6, Comando 3, passo 2 de 7 (game-art)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Base que prevalece:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` D5 — "o game-art prepara 3 paletas candidatas para a floresta-piloto... usar referências verificáveis de File Island, com fonte, sem inventar referências oficiais."
- **Regra respeitada: 0 gerações PixelLab.** `get_balance` antes e depois desta tarefa: **737,95/2000, sem variação**. Toda cor abaixo foi medida (não estimada) com ferramentas Python locais sem dependência paga, escritas nesta tarefa: `workspaces/game-art/tools/extract_palette.py` (histograma de pixel) e `workspaces/game-art/tools/remap_palette.py` (remapeamento por cor mais próxima, RGB euclidiano). Nenhuma paleta aqui é final — as 3 são candidatas para o fundador escolher, combinar ou rejeitar.
- **Marcação:** **[E]** evidência medida/citada nesta sessão, com caminho ou URL · **[H]** hipótese/proposta de direção, não aprovada.

---

## 0. Por que este documento existe

Na revisão do `game-qa` sobre `PAINEL_DIRECAO_ARTISTICA_V1.md` (Comando 2, passo 4), ficaram duas lacunas, agora fechadas aqui:
1. Faltavam as 3 paletas candidatas pedidas pelo Comando 3 (D5) — este documento as entrega, com pranchas PNG.
2. A referência de File Island no painel estava marcada [H], sem fonte — a seção 7 abaixo traz fontes verificáveis (Wikimon, com URL, data de acesso e episódio), e registra onde a verificação não foi possível (Fandom bloqueado).

Este documento **não** escolhe uma paleta, **não** resolve o conflito Endesga-32 × v13/v15 (`AGENTS.md` §5, `ADR_ETAPA6_DECISOES_FUNDADOR.md` D5 "proibido") e **não** gera nenhum asset novo — só mede e organiza evidência para a decisão do fundador.

---

## 1. Metodologia de extração (como as cores foram medidas, não estimadas)

- **Ferramenta:** `extract_palette.py` — lê o PNG com um decodificador PNG puro-Python já existente (`pxpng.py`, sem Pillow/numpy, usado desde o Comando 2), conta cada cor RGB opaca (alpha ≥ 16) pixel a pixel, ordena por frequência.
- **Fontes do cenário medidas:**
  | Arquivo | Tamanho | Pixels opacos | Cores distintas | O que é |
  |---|---:|---:|---:|---|
  | `art/digi-forest-v15/v15b/v15b_day_full_half.png` | 768×576 | 442.368 | 207 | **v15b**, mapa inteiro, dia, aprovado (ajuste do coordenador sobre a v15 aprovada pelo fundador) — fonte principal de P-ii |
  | `art/digi-forest-v15/day_full.png` | 1536×1152 | 1.769.472 | 356 | **v15**, mapa inteiro, dia, aprovado pelo fundador antes dos ajustes v15b — usado como conferência cruzada |
  | `art/digi-forest-v15/v15b/v15b_crop_NW_1x.png` | 768×576 | 442.368 | 117 | recorte 1× (sem downscale/interpolação) do canto NW do mapa v15b — **usado como base das 3 pranchas** (§6), por ser pixel art nativa, não reamostrada |
  | `quality-overhaul/direction-v13/mockups/v13_mockup_1920x1080_rgba.png` | 1920×1080 | 2.073.600 | 685 | mockup **v13** (inclui HUD/UI, não é cenário puro) — usado só para checar se "v13" e "v15/v15b" compartilham paleta (não compartilham, ver §3.3) |
- **Fontes dos sprites oficiais medidas** (para justificar o viés de P-iii, §4): `prototype/world/dist/assets/CREATURE-0005_walk_S_00*.png` (Koromon), `CREATURE-0006_walk_S_00*.png` (Agumon), `CREATURE-0016_walk_S_00*.png` (WarGreymon) — mapeamento id→espécie confirmado em `research/sprite-recovery/digimon_sprite_catalog.json`.
- **Remapeamento das pranchas:** `remap_palette.py` troca cada pixel opaco do recorte `v15b_crop_NW_1x.png` pela cor mais próxima (distância euclidiana em RGB) da paleta candidata, preservando alpha. É uma comparação visual, não um asset — nenhuma arte nova foi desenhada, só uma cor trocada por outra já existente na paleta testada.

---

## 2. P-i — Endesga-32 completa (regras já existentes)

**Origem [E]:** `docs/ART_STYLE_GUIDE.md` §4 — Lospec "Endesga 32", já homologada como paleta-mãe de cenário/UI no projeto (`DIGIMON_STYLE_GUIDE.md` §3.2).

```
#be4a2f #d77643 #ead4aa #e4a672 #b86f50 #733e39 #3e2731 #a22633
#e43b44 #f77622 #feae34 #fee761 #63c74d #3e8948 #265c42 #193c3e
#124e89 #0099db #2ce8f5 #ffffff #c0cbdc #8b9bb4 #5a6988 #3a4466
#262b44 #181425 #ff0044 #68386c #b55088 #f6757a #e8b796 #c28569
```

**32 cores.** Regras de uso (já existentes, `ART_STYLE_GUIDE.md` §4/§5, `DIGIMON_STYLE_GUIDE.md` §3.2/§4/§5):
- **Chão/vegetação:** `#63c74d #3e8948 #265c42` (verdes) + `#b86f50 #733e39 #3e2731` (terra/madeira).
- **Água:** `#193c3e #124e89 #0099db #2ce8f5` (escuro→brilho de superfície).
- **Contorno:** 1px, `#181425`, aplicado como passo final (`autoOutline()`).
- **Sombra:** `#181425` a 25–40% de opacidade.
- **Luz:** acentos quentes `#feae34`/`#f77622` para cristais/elementos digitais (§7 do Style Bible), nunca a paleta inteira.

**Prós:**
- 100% conforme a regra dura hoje em vigor (`DIGIMON_STYLE_GUIDE.md` §8.3: "cor fora da Endesga-32/ramp aprovado em asset de cenário" é falha crítica) — zero risco de reprovação por paleta.
- Já é a paleta de UI/HUD; adotá-la no cenário também elimina qualquer mistura entre as duas famílias de cor do jogo.
- 32 cores é um teto pequeno e já testado — fácil de manter consistente entre biomas futuros.

**Contras, medidos nesta tarefa [E]:**
- A cor dominante real do cenário já aprovado (`#76ca9f`, ver §3) está, em distância RGB, **mais perto de um cinza-azulado de Endesga-32 (`#8b9bb4`, distância² ≈ 3.091) do que de qualquer verde da própria paleta (`#63c74d`, distância² ≈ 7.094)**. Forçar Endesga-32 sobre o recorte aprovado não troca "um tom de verde por outro" — troca grama por um tom de pedra/cinza-azulado (ver prancha, §6, P-i). Isso é uma medição numérica nova do mesmo achado que a homologação da Etapa 2 já registrou qualitativamente ("0% Endesga-32" na v13/v15).

**Risco:** alto retrabalho visual se adotada sozinha — o cenário v15/v15b que o fundador já aprovou precisaria ser repintado quase por completo (deslocamento de matiz verde→cinza é estrutural, não ajuste de 1 tom), não apenas recolorido.

**Efeito nos métodos A/B/C:** ver tabela consolidada, §5.

---

## 3. P-ii — a paleta efetivamente usada em v13/v15 (medida, não estimada)

### 3.1 Top 28 cores de `v15b_day_full_half.png` (v15b, cenário completo aprovado, 99,10% dos pixels opacos)

| # | Hex | % dos pixels | Observação |
|---:|---|---:|---|
| 1 | `#76ca9f` | 49,07% | **dominante** — chão/grama principal. Não aparece em nenhum `palette.json` do projeto nem em Endesga-32. |
| 2 | `#95ad6d` | 8,35% | bate com `grassFamilyA` já documentado (`DIGIMON_STYLE_GUIDE.md` §3.2) |
| 3 | `#2bc4c4` | 5,95% | água (lago) |
| 4 | `#51754b` | 5,85% | `grassFamilyA` |
| 5 | `#181425` | 4,17% | **ink/contorno — única cor também presente em Endesga-32** |
| 6 | `#273f2b` | 3,68% | `foliageDepthDay`/`grassFamilyA` |
| 7 | `#38583a` | 2,83% | `foliageDepthDay`/`grassFamilyA` |
| 8 | `#2a432d` | 2,36% | `grassShadePocket` |
| 9 | `#53a785` | 2,22% | variante de `#76ca9f`, não documentada |
| 10 | `#111e16` | 1,94% | `foliageDepthDay` |
| 11 | `#3a5938` | 1,66% | `grassShadePocket` |
| 12 | `#1b2e20` | 1,62% | `foliageDepthDay` |
| 13 | `#1d3022` | 1,38% | `grassShadePocket` |
| 14 | `#8ff0f0` | 1,32% | água (brilho) |
| 15 | `#3f3025` | 1,20% | `dirt` |
| 16 | `#72935b` | 1,08% | `grassFamilyA`/`foliageDepthDay` |
| 17 | `#527044` | 1,00% | `grassShadePocket` |
| 18 | `#584531` | 0,73% | `dirt` |
| 19 | `#90f2bb` | 0,62% | água (brilho) |
| 20 | `#6d8351` | 0,58% | `grassShadePocket` |
| 21 | `#49c5fa` | 0,40% | água |
| 22 | `#63ba91` | 0,33% | variante de `#76ca9f` |
| 23 | `#715b41` | 0,31% | `dirt` |
| 24 | `#42ab76` | 0,14% | variante de `#76ca9f` |
| 25 | `#3c9e72` | 0,08% | variante de `#76ca9f` |
| 26 | `#487460` | 0,07% | variante escura de `#76ca9f` |
| 27 | `#8c9199` | 0,06% | bate com `stone` (`DIGIMON_STYLE_GUIDE.md` §3.2) |
| 28 | `#02050a` | 0,04% | quase-preto, sombra extrema |

**28 cores.**

### 3.2 Conferência cruzada

- **v15 → v15b (continuidade):** `day_full.png` (v15, pré-ajustes) mostra as mesmas 20 cores no topo, na mesma ordem relativa — `#76ca9f` é dominante em ambos (59,16% na v15, 49,07% na v15b; a diferença vem de a v15b ter mais água visível no mesmo recorte, elevando o peso relativo do ciano). **Confirma que v15 e v15b compartilham a mesma paleta de produção** — é uma única linhagem visual, não duas.
- **v13 ≠ v15/v15b:** o mockup `v13_mockup_1920x1080_rgba.png` tem **685 cores distintas** (top 28 cobre só 83,53%, contra 99,1% da v15b) e um conjunto de cores completamente diferente (`#7aab43` verde-oliva, `#d0a061` bege, `#222f39` azul-petróleo escuro, nenhuma delas presente no top 28 da v15b). **O comando pede "a paleta efetivamente usada nas referências v13/v15 aprovadas" como se fosse uma só — a medição mostra que não é: v13 e v15/v15b são duas paletas de produção diferentes.** Esta entrega usa **v15/v15b** como a referência de P-ii, por ser a mais recente, a que está hoje em produção e a que o fundador aprovou por último (`V15.md`/`V15B.md`); o achado sobre v13 fica registrado aqui para o fundador decidir se quer uma 4ª comparação específica de v13 depois.
- **Interseção exata com Endesga-32:** das 28 cores medidas, **apenas 1 (`#181425`, o ink)** está literalmente em Endesga-32 — 1/28 ≈ 3,6%. Consistente, agora com número, com o "0% Endesga-32" já registrado na homologação da Etapa 2.

**Regras de uso (derivadas da medição, não documentadas antes desta tarefa):**
- **Chão/vegetação:** dominado por `#76ca9f` + variantes (`#53a785 #63ba91 #42ab76 #3c9e72 #487460`), ao lado do ramp verde-escuro já documentado (`#273f2b #38583a #2a432d #3a5938 #1b2e20 #1d3022 #527044 #6d8351 #95ad6d #51754b #72935b`).
- **Água:** família ciano/teal clara (`#2bc4c4 #8ff0f0 #90f2bb #49c5fa #63ba91`) — bem mais clara e saturada que o azul de Endesga-32.
- **Terra/madeira:** `#3f3025 #584531 #715b41` (já documentado como `dirt`).
- **Contorno/sombra:** `#181425` — a única ponte natural já existente com Endesga-32.
- **Luz:** não há acento quente/aditivo nesta amostra (o recorte usado não contém o santuário digital) — a regra de cristal/elemento digital (Style Bible §7) continua valendo à parte.

**Prós:** zero distorção visual — a prancha P-ii (§6) é visualmente quase indistinguível do recorte original, porque **é** a paleta que já está em produção. Nenhum retrabalho de cenário.

**Contras:**
- Viola a letra da regra dura hoje em vigor (`DIGIMON_STYLE_GUIDE.md` §3.2/§8.3: "só Endesga-32 + ramps aprovados" em cenário é falha crítica) — adotar P-ii oficialmente exige o fundador **reescrever essa regra**, não só escolher uma paleta.
- A cor dominante `#76ca9f` não está documentada em nenhum `palette.json` do projeto (`forest-v11-ground`, `forest-v8/v9/v10/v12`) — de qual geração/tileset especificamente ela veio não foi rastreado nesta tarefa, só medido no resultado final em produção.

**Risco:** formalizar P-ii sem revisar a regra do Style Bible deixa a matriz de aprovação (§8) contraditória com a própria arte que o fundador já aprovou — aplicada ao pé da letra, a matriz reprovaria o v15b atual por paleta, mesmo ele sendo o cenário em produção.

---

## 4. P-iii — harmonização entre personagens e cenário (regra de ponte concreta)

### 4.1 Evidência que fundamenta a escolha (cores reais do elenco prioritário, não memória)

Medidas nesta sessão, mesma ferramenta, direto dos sprites oficiais em uso no jogo:

| Digimon | Estágio | Top cores medidas (hex, % dos pixels do sprite) |
|---|---|---|
| **Koromon** (`CREATURE-0005`) | Baby | `#212121` 36,9% (contorno) · `#ffbde7` 22,9% / `#f76bad` 14,0% / `#d6398c` 14,0% (rosa) · `#ad0042` 5,6% / `#7b0000`/`#bd0000` (vermelho escuro) |
| **Agumon** (`CREATURE-0006`) | Rookie | `#202020` 29,7% (contorno) · `#f8f800` 16,9% / `#f0c800` 11,3% / `#d89000` 14,2% (amarelo/âmbar) · `#782800`/`#b86800` (âmbar escuro) |
| **WarGreymon** (`CREATURE-0016`) | Mega | `#202020` 29,6% (contorno) · `#505050`/`#808080`/`#c8c8c8` (cinza de armadura) · `#d06800` 10,8% / `#f8b000` 7,7% / `#f8e000` 6,2% (laranja/âmbar) · `#000078`/`#880000` (acentos) |

**Leitura:** o elenco prioritário desta rodada é predominantemente **amarelo/âmbar/laranja** (Agumon, WarGreymon) com um ponto **rosa/vermelho** (Koromon) — nenhuma cor fria domina nenhum dos três. Isso contradiz tanto P-i quanto P-ii se o cenário ficar dominado por verde-azulado frio ou cinza sem nenhum ponto de contato de temperatura com o elenco.

### 4.2 Regra de ponte proposta (3 pontes concretas, não uma 4ª paleta solta)

1. **Contorno — ponte por proximidade, não por igualdade:** o cenário mantém `#181425` (regra já existente, `autoOutline()`); o sprite oficial **não é alterado** (seria falha crítica, §1 regra 1 do Style Bible) — mas seu próprio contorno (`#202020` Agumon/WarGreymon, `#212121` Koromon) já está a uma distância de canal ≤ 8 de `#181425` — visualmente, já é quase o mesmo tom quase-preto, sem precisar forçar igualdade de hex.
2. **Sombra — ponte por regra unificada:** toda sombra de contato (prop de cenário e entidade móvel) usa o mesmo `#181425` a 25–40% de opacidade — já é a regra do Style Bible §5, proposta aqui como o ponto de união formal entre as duas paletas (a sombra é a única superfície onde cenário e sprite se tocam visualmente).
3. **Rampa do cenário com viés de temperatura:** em vez de usar os 32 hex de Endesga-32 inteiros, usar um **subconjunto de 21 cores, todas já dentro de Endesga-32** (nenhum hex novo, conforme a regra dura), escolhido para compartilhar família de matiz com o elenco medido em §4.1:

```
#63c74d #3e8948 #265c42              verde (chão/vegetação)
#193c3e #124e89 #0099db #2ce8f5      água
#733e39 #3e2731 #b86f50              terra/madeira
#feae34 #f77622 #fee761 #e4a672      âmbar/amarelo — ponte com Agumon/WarGreymon
#a22633 #e43b44 #b55088 #f6757a      vermelho/rosa — ponte com Koromon
#ead4aa #ffffff                      creme/claro
#181425                              ink/contorno/sombra unificados
```

**21 cores.**

**Achado técnico durante a construção da prancha (registrado para transparência):** a 1ª versão desta paleta incluía 3 cinza-azulados de Endesga-32 (`#5a6988 #8b9bb4 #3a4466`) como ponte extra com o cinza de armadura do WarGreymon. Testado numericamente: isso fez a cor dominante do chão (`#76ca9f`) ser puxada para `#8b9bb4` (cinza) de novo, pelo mesmo motivo do problema de P-i (§2) — os cinzas "ganham" do verde por estarem mais perto em distância RGB. **A versão final (acima) remove esses 3 cinzas** — a ponte com a armadura do WarGreymon fica só pela regra de contorno/sombra (pontes 1–2), não por um hex de cenário dedicado.

**Prós:**
- 100% dentro de Endesga-32 — conforme a regra dura hoje em vigor (`DIGIMON_STYLE_GUIDE.md` §3.2/§8.3), falha crítica zero, igual a P-i.
- O chão continua lendo como grama verde (ver prancha, §6) — ao contrário de P-i, o viés de temperatura evita o efeito "grama vira pedra".
- É uma resposta concreta ao conflito aberto (não "escolhe um lado" — mostra um caminho dentro da regra atual que se aproxima mais do elenco oficial do que a Endesga-32 pura).

**Contras:**
- Ainda é um remapeamento forçado sobre arte já aprovada: a cor do chão muda de `#76ca9f` (teal, o que o fundador aprovou) para `#63c74d` (verde Endesga puro) — não é a cor exata que está em produção hoje, só uma mais próxima dela que P-i.
- "Harmonização" aqui é uma **proposta de regra + subconjunto de cor**, não uma prova de que o jogo ficaria bom assim — não houve teste com o elenco (Koromon/Agumon/WarGreymon) de fato posicionado sobre este cenário nesta rodada (fora do orçamento de 0 gerações; precisaria compor sprite + cenário, o que esta tarefa não fez).

**Risco:** médio — menor retrabalho que P-i (o chão fica dentro da mesma família de verde), mas ainda não é "grátis" como P-ii.

---

## 5. Efeito nos métodos A, B e C (o comando pede isso explicitamente)

| | **A** (ChatGPT + gratuitas) | **B** (PixelLab) | **C** (híbrido) |
|---|---|---|---|
| **P-i Endesga-32** | Sem controle nativo de paleta no ChatGPT — teria que gerar livre e rodar este mesmo remap como pós-processo, arriscando o mesmo efeito "verde vira cinza" visto na prancha (§6), porque o remap não sabe que uma área era "grama" antes de trocar a cor. | `create_topdown_tileset`/`create_tiles_pro`/`create_building_kit`/`animate_object` aceitam `palette` (array de hex) nativamente — a peça é **desenhada para** essas 32 cores, não remapeada depois; tende a ficar mais coerente que o remap bruto desta prancha, mas ainda herda o mesmo problema de fundo (a cor real do chão não está nesse conjunto). | Compor em A sem paleta fixa, só depois aplicar `palette` do PixelLab (B) no passo final de polimento — adia o custo de B para quando a composição já estiver aprovada. |
| **P-ii v15b real** | Mesma limitação de controle nativo de A acima — mas como estas 28 cores **já são** as cores do cenário atual, qualquer asset novo gerado "livre" e depois corrigido por color-matching tende a ficar mais próximo do já aprovado do que com P-i. | `palette` do PixelLab aceita essas 28 cores do mesmo jeito — gera peças novas (ex. a 5ª espécie de árvore cogitada no painel anterior) já na cor exata do bioma, sem remap. | Mesma lógica de C acima, com a vantagem de P-ii não exigir nenhuma correção de temperatura depois. |
| **P-iii harmonia** | Mesma limitação de controle nativo de A. | `palette` do PixelLab aceita o subconjunto de 21 cores — única das 3 que, além de ser aceitável nativamente em B, também já nasce com a ponte de temperatura para o elenco (Agumon/Koromon/WarGreymon) aplicada no momento da geração, sem precisar de uma 2ª passada de correção. | Mesma lógica, com a vantagem adicional de servir como ponto de encontro entre o cenário (B) e o elenco (qualquer método) sem reabrir a paleta de personagem. |

**Nota de custo:** nenhuma chamada `palette` do PixelLab foi feita nesta tarefa (proibido nesta rodada, D6 ainda não autorizado) — a tabela acima é uma leitura das capacidades documentadas da ferramenta (`create_topdown_tileset`, `create_tiles_pro`, `create_building_kit`, `animate_object` aceitam `palette`), não um teste real.

---

## 6. Pranchas (comparação visual, não asset)

Base: `art/digi-forest-v15/v15b/v15b_crop_NW_1x.png` (recorte 1× existente da floresta v15b, sem downscale/interpolação — a mesma imagem para as 3, para comparação justa). Técnica: remapeamento por cor mais próxima (`remap_palette.py`), com uma tira de swatches no rodapé de cada prancha mostrando a paleta usada.

| Arquivo | Paleta | Cores |
|---|---|---:|
| `etapa6-lab/paletas/P-i_endesga32.png` | Endesga-32 completa | 32 |
| `etapa6-lab/paletas/P-ii_v15b_real.png` | medida do v15b aprovado | 28 |
| `etapa6-lab/paletas/P-iii_harmonia.png` | subconjunto Endesga-32 com viés de temperatura | 21 |
| `etapa6-lab/paletas/comparativo_lado_a_lado.png` | original + as 3, lado a lado | — |

**Leitura visual confirmada por inspeção direta (`read`, não só os números acima):** P-i troca o chão por um cinza-azulado (grama lê como pedra/caminho); P-ii é visualmente quase idêntico ao original (esperado — é a mesma paleta); P-iii mantém o chão verde e legível como floresta, com a água e os troncos dentro da família Endesga-32.

---

## 7. File Island — referências verificadas

**Fontes consultadas:** Wikimon (`wikimon.net`) — **respondeu (200) em todas as 6 chamadas**. Digimon Wiki/Fandom (`digimon.fandom.com`) — **bloqueado por desafio Cloudflare (HTTP 403, "Just a moment...") nas 2 tentativas feitas** (`/wiki/File_Island` e `/wiki/Infinity_Mountain`); não foi possível verificar nada por essa fonte nesta sessão. Todas as citações abaixo vêm só do Wikimon. Data de acesso de todas: **2026-11-13**.

| Local | Fonte (URL) | O que confirma | Episódio/contexto citado pela fonte |
|---|---|---|---|
| **File Island (visão geral)** | https://wikimon.net/File_Island | Ilha com biomas contrastantes; lista oficial das áreas da anime *Digimon Adventure*: Tropical Jungle, Ancient Dino Region, Unwavering Forest, Village of Beginnings, Dragon Eye Lake, Outlook Mountain, Gear Savannah, Pyocomon Village, Factorial Town, Sewers, Misty Trees, Toy Town, Freezeland, Great Canyon, Overdell Cemetery, Devimon's Mansion, Infinity Mountain. | É o 1º local visitado pelos Chosen Children; sob controle de Devimon na 1ª temporada. |
| **Unwavering Forest** (dub: **Native Forest**) | https://wikimon.net/Unwavering_Forest | Floresta ao sul da ilha; cerca o Dragon Eye Lake; leva ao Gear Savannah. | 1ª aparição (sem nome): Ep. 3, **"The Blue Wolf! Garurumon"**. |
| **Dragon Eye Lake** | https://wikimon.net/Dragon_Eye_Lake | Lago dentro do Unwavering Forest, habitado por um Seadramon; local onde o grupo passa a 1ª noite. | Ep. 3, **"The Blue Wolf! Garurumon"**: fagulha da chama de Agumon irrita o Seadramon; Gabumon evolui pela 1ª vez para Garurumon para derrotá-lo. |
| **Tropical Jungle** | https://wikimon.net/Tropical_Jungle | Selva no leste da ilha; 1º local onde o grupo aterrissa (árvores holográficas); é aqui que cada criança encontra seu Digimon parceiro (Baby II→Child) contra um Kuwagamon selvagem. | Ep. 1, **"Adrift? The Island of Adventure!"**. |
| **Naked Beach** (parte do Tropical Jungle) | https://wikimon.net/Tropical_Jungle | Praia com **5 cabines telefônicas**, nenhuma funcionando — a referência "praia dos postes/cabines telefônicas" pedida pelo comando **é real e está confirmada**, não [H]. Território de um Shellmon; Agumon evolui pela 1ª vez para Greymon aqui. | Ep. 2, **"Explosive Evolution! Greymon"**. |
| **Infinity Mountain** | https://wikimon.net/Infinity_Mountain | Montanha central, o ponto mais alto da ilha; domínio de Devimon, que controla os Black Gears de lá. | 1ª aparição: Ep. 7, **"Roar! Ikkakumon"**. |
| **Village of Beginnings** (dub: **Primary Village** / File City) | https://wikimon.net/Village_of_Beginnings | Local de nascimento dos Digimon (Digitama); guardado por Elecmon. | Ep. 12, **"Adventure! Patamon and I"** (Takeru+Patamon chegam primeiro); Ep. 13, **"Angemon's Awakening!"** (resto do grupo chega). |

### 7.1 O que isso muda no painel anterior (`PAINEL_DIRECAO_ARTISTICA_V1.md` §1)

O painel anterior usava os nomes "Floresta Nativa", "Monte Infinito" e "File City/Vila Primária" marcados **[H]**, sem fonte, por memória geral do modelo. A verificação acima **confirma que os nomes e os eventos não foram inventados** — "Native Forest" é o nome de dublagem real de Unwavering Forest, "Infinity Mountain" é um local real e central, e "Primary Village"/"File City" são nomes de dublagem reais de Village of Beginnings. **A partir desta tarefa, essas três referências passam de [H] para [E]**, com a URL e o episódio citados na tabela acima — qualquer reuso futuro deve citar esta seção, não repetir o aviso [H] antigo.

### 7.2 Como isso se relaciona com a floresta-piloto atual (V15/V15B) — sem mudar nada no mapa

| Elemento já aprovado em V15/V15B | Referência de File Island mais próxima [E] | Match |
|---|---|---|
| Floresta densa, mato alto, clareiras | **Unwavering Forest** (Native Forest) — floresta ao sul, cerca um lago | Bom — bioma e composição (floresta+lago) batem |
| Rio central → lago → cachoeira | **Dragon Eye Lake** — lago dentro da floresta, cena de evolução (Gabumon→Garurumon) junto à água | Parcial — o lago/floresta bate; a fonte consultada **não menciona cachoeira** especificamente em Dragon Eye Lake — esse detalhe continua **[H]**, não confirmado por esta busca |
| Ponte de madeira sobre o rio | — | **[H]**, não confirmado — nenhuma fonte consultada cita uma ponte em Unwavering Forest/Dragon Eye Lake |
| Santuário digital (totem, ruínas, cristal, padrão binário) | — | **[H]**, original — nenhuma fonte consultada liga um santuário/estruturas a esse ponto específico de Unwavering Forest; consistente com a leitura já registrada no painel anterior de "recriação/original" (categoria 2/3 do ADR-015), não cópia de local nomeado |
| — (não está no mapa atual) | **Naked Beach** (praia das cabines telefônicas, Tropical Jungle, Ep. 2) | Disponível como referência **só para um bioma futuro de praia** — fora do escopo desta rodada (D5/ADR_ETAPA6: "o mapa principal não é substituído, os outros biomas não são produzidos") |

Nenhuma mudança de mapa é proposta aqui — esta tabela só liga o que já existe a uma fonte real, e marca honestamente o que continua sem fonte encontrada (cachoeira, ponte, santuário).

---

## 8. O que este documento NÃO faz (proibições do D5/ADR_ETAPA6)

- Não fixa nenhuma paleta final — as 3 continuam candidatas.
- Não resolve o conflito Endesga-32 × v13/v15 — mede os dois lados com números novos (§2, §3) e mostra uma 3ª via dentro da regra atual (§4), sem escolher.
- Não gera nenhum asset no PixelLab nem em qualquer serviço pago — as 3 pranchas são remapeamento de uma imagem já existente, para comparação, não arte nova.
- Não altera o jogo, a Database, o mapa de produção nem nenhuma configuração.
- Não faz commit, push ou deploy.

## 9. Decisões que dependem do fundador

1. **Qual paleta (ou combinação) seguir** — nenhuma das 3 é recomendada aqui como "a certa"; os prós/contras/risco de cada uma estão em §2–§4.
2. **Se P-ii ou P-iii forem escolhidas, a regra dura do `DIGIMON_STYLE_GUIDE.md` §3.2/§8.3 ("só Endesga-32 + ramps aprovados" = falha crítica) precisa ser reescrita** — hoje ela reprovaria o próprio v15b em produção (P-ii não é Endesga-32; P-iii é um subconjunto, mas ainda muda a cor real do chão).
3. **Se vale medir também a paleta de `v13`** separadamente (§3.2 mostrou que v13 e v15/v15b não compartilham paleta) — não feito aqui, fora do pedido literal do comando.
4. **Cachoeira e ponte de madeira em Dragon Eye Lake/Unwavering Forest** continuam sem fonte confirmada (§7.2) — se o fundador quiser citação de episódio específica para esses dois elementos, é uma busca nova, não coberta pelas 6 páginas consultadas aqui.
5. Acesso ao Digimon Wiki/Fandom falhou (Cloudflare) — se o fundador tiver uma forma de contornar isso (ex. cache, outra URL), uma 2ª rodada de verificação cruzada com essa fonte fica pendente.

## 10. Limitações desta entrega

- P-iii é uma proposta de regra testada uma vez sobre um recorte de cenário — não foi testada com o elenco (Koromon/Agumon/WarGreymon) de fato posicionado sobre o cenário remapeado, por estar fora do orçamento de 0 gerações desta tarefa.
- A origem exata (qual tileset/geração) da cor dominante `#76ca9f` não foi rastreada — só medida no resultado final em produção (`v15b_day_full_half.png`/`day_full.png`). Rastrear isso exigiria abrir os assets internos do mapa PixelLab (`1bb07708-...`), fora do escopo desta tarefa.
- A verificação de File Island cobriu 6 páginas (File Island, Unwavering Forest, Dragon Eye Lake, Tropical Jungle, Infinity Mountain, Village of Beginnings) — não é uma pesquisa exaustiva de todo o universo de File Island; outros locais listados em §7 (Ancient Dino Region, Outlook Mountain, Gear Savannah etc.) não foram abertos nesta tarefa.
- Nenhuma destas entregas foi revisada por sessão diferente da que a produziu (`AGENTS.md` §6) — a revisão cabe ao próximo passo do Comando 3 ou ao `game-qa`.
