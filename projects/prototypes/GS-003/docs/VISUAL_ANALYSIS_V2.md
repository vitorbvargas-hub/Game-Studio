# GS-003 — Análise Visual v2 (evidência real)

**Data:** 2026-11-08
**Autor:** game-research
**Supersede:** qualquer análise visual anterior do GS-003 que tenha usado a imagem conceito de IA ("Aventura Pixelada", dino vermelho) como referência do IdleDex — essa imagem está formalmente DESCARTADA por ADR-010 e pelos scripts do fundador (`docs/briefing/07_*.md`, `08_*.md`).
**Método:** inspeção visual direta (`view_image`/`read`) de todas as imagens citadas, mais **medição de pixel real** (decodificador PNG puro-Python, sem libs externas — `tools/size_research/png_decode.py` + scripts ad-hoc) para dimensões, paleta e blobs de cor onde possível. Nenhum código de produção foi alterado.
**Legenda:** **[E]** evidência com arquivo/URL e data de acesso (2026-11-08) · **[H]** hipótese/interpretação.

---

## 1. Referências de gameplay

### 1.1 IdleDex — estrutura do MMO

| Característica | Evidência | Vamos usar? | Como |
|---|---|---|---|
| Mundo compartilhado, múltiplos jogadores visíveis no mesmo mapa | **[E]** `evidence/idledex-canonical/canonical_founder_screenshot_night_forest.png`, `t22_map_walk.png` — 2 pares jogador+criatura simultâneos no mesmo frame, mais jogadores distantes visíveis | Sim | Renderizar outros jogadores (posição de rede) + suas criaturas ativas no mesmo mapa, não só o bot/local |
| Movimento em grid, tile 2D top-down | **[E]** `teardowns/IDLEDEX.md` §1-2; confirmado visualmente em t22/t45 | Sim | Já é assim no nosso prototype (`tileSize=32` em `src/data/maps/test-meadow.tmj.json`) — manter |
| Criatura companheira seguindo o treinador no mapa | **[E]** canonical screenshot: "butterfree" ao lado de "Ticolicosdawdsa"; t22: idem | Sim | Já implementado no nosso v2 (companion ao lado do Lv da onda) — manter e refinar |
| Encontros/combate acontecem no próprio mapa (não troca de tela) | **[E]** `t08_auto_modal.png`, `t22_map_walk.png` — log de batalha no HUD, sem transição de tela | Sim | Já é a arquitetura do nosso prototype — manter |
| Caça automática (AUTO) | **[E]** `teardowns/IDLEDEX.md` §2 | Sim (já é a identidade de "idle" do produto) | — |
| HUD inferior: inventário + atalhos + equipe + XP | **[E]** `t22_map_walk.png` — barra inferior com ~8 ícones (inventário, bag/moeda, item colecionável, troféu, boss, bússola, pesca) à esquerda e faixa de equipe (5 portraits com HP bar + "Lv") à direita, barra de XP central-inferior | Sim | Gap crítico hoje — ver §4 |
| Minimapa | **[E]** `t22_map_walk.png`, canto inferior-esquerdo ao lado da barra de inventário | Sim | Gap — nosso v2 só tem um placeholder "MAPA" no canto superior-direito |
| Nomes sobre as entidades no mapa | **[E]** canonical + t22: "butterfree", "Ticolicosdawdsa", "Refox", "conkeldurr" em texto branco/colorido direto sobre a entidade, sem fundo de painel | Sim, já fazemos (com painel/pill) | Nosso v2 já mostra nome+Lv+HP em uma pill acima da criatura (`06-attack-sequence-6f.png` etc.) — **mais informativo que a referência**, manter |
| Nível (Lv) junto ao nome **no mapa** | **[H] correção à ADR-010/ao script 08:** nas capturas reais (`canonical_founder_screenshot_night_forest.png`, `t22_map_walk.png`), os nomes flutuantes sobre as entidades **não mostram o nível** — o Lv só aparece no painel de equipe no rodapé (`Lv24 butterfree`, `Lv18`, `Lv34`...). O pedido do fundador e o ADR citam "nomes e níveis sobre as entidades"; a evidência real do IdleDex só confirma **nomes** sobre as entidades. | Mantemos nível no mapa (é o que o fundador pediu e o que já fazemos) | Tratar isso como uma escolha nossa deliberada, não como cópia 1:1 do IdleDex — documentar a diferença |
| Painel lateral direito (moeda, Passe de Batalha, Fonte dos Desejos, ícones sociais, guilda) | **[E]** `t22_map_walk.png`, canto superior-direito | Parcial — não é "HUD inferior" | **[H]** Avaliar se cabe no MVP da prova visual (§4) ou fica para depois; não é obrigatório pelo ADR-010 |

### 1.2 Drakantos — nível de qualidade (não gameplay; ver §2 Arte)

O papel do Drakantos é 100% de **acabamento visual**, não de estrutura de gameplay — por isso as características dele estão na seção de Arte (§2.2), conforme ADR-010.

### 1.3 Digimon — identidade/gameplay (escala e comportamento das criaturas)

| Característica | Evidência | Vamos usar? | Como |
|---|---|---|---|
| Proporção criatura×treinador por estágio de evolução | **[E]** `research/DIGIMON_SIZE_TABLE.md` (medição em pixel de 40 Digimon nos sprites de mapa do Digimon World DS, Tamer=26px de referência) | Sim, já é a fonte oficial do projeto | In-Training ~0,65-0,75×; Rookie ~0,95-1,0× (até 1,15× se a arte canônica for mais robusta); Champion ~1,4×; Ultimate ~1,3-1,5×; Mega ~1,4-1,5×, **nunca acima de ~1,5-1,6×** (teto de legibilidade confirmado empiricamente: WarGreymon=Greymon=37px, Seraphimon=MagnaAngemon=39px) |
| Criaturas selvagens no mapa (encontros) | **[E]** `DIGIMON_SIZE_TABLE.md` §6 — 20 selvagens comuns medidos (Numemon, Kuwagamon etc.) | Sim | Usar a tabela para popular `spawns` com proporção correta |

---

## 2. Referências de arte

### 2.1 IdleDex — paleta e composição (com ressalva de medição real)

| Característica | Evidência | Vamos usar? | Como |
|---|---|---|---|
| Dimensão real da imagem canônica | **[E]** decodificação PNG real: `canonical_founder_screenshot_night_forest.png` = **1706×788px** (screenshot de navegador, não de jogo "limpo") | — | Base de cálculo de todas as medidas abaixo |
| Paleta dominante | **[E]** histograma de cor real sobre a área de jogo (excluindo UI): top 7 cores somam **~90%** dos pixels e são todas tons próximos de cinza-azulado-roxo escuro (`#2e2d38` 56,4%, `#1f1623` 10,5%, `#120b18` 7,1%, `#262327` 5,9%, `#393250` 4,3%, `#2f263d` 3,6%, `#373749` 2,0%) — luminância baixa (~5-20%), quase monocromático | **Não copiar a paleta literal** | A cena é **noturna** (relógio in-game mostra "Noite 5:58"/"6:29" nos prints — **[E]** `t08_auto_modal.png`, `canonical_founder_screenshot_night_forest.png`) — a paleta escura é efeito de time-of-day do IdleDex, não a paleta-base do jogo. Usar a IdleDex só para **composição/estrutura** (ver linha abaixo), não para cor |
| Vegetação densa, copas grandes, mescladas entre si | **[E]** inspeção visual direta: massas de copas no topo, esquerda e direita do frame formam blocos contínuos sem costura visível de tile individual, cobrindo visualmente **~35-45%** da área de jogo (estimativa visual, não segmentável por cor pois fundo e copa compartilham o mesmo tom escuro de noite — tentativa de segmentação por cor real **falhou** por esse motivo, ver nota técnica abaixo) | Sim, a composição (massa contínua, não árvores isoladas) | Ver gap crítico #1 em §4 |
| Grama alta, flores, clareiras | **[E]** visível no canonical e em t22/t45 como textura fina esparsa, não um tile de "grama alta" distinto e saturado | Sim, qualitativamente | — |
| Caminhos | **[H]** não há um tile de "caminho" visualmente distinto do chão aberto nos prints disponíveis (o terreno aberto já é o "caminho") | — | — |
| HUD inferior — layout exato | **[E]** `t22_map_walk.png`: da esquerda para a direita: botões de atalho de sistema (pesca, coletor, auto) no topo; log de chat; depois, rodapé: minimapa pequeno → faixa de ~8 ícones de inventário/consumíveis → barra de XP central → painel do ativo (portrait+HP) → faixa de 5 portraits da equipe com Lv e HP | Sim, estrutura | Ver spec-alvo em §5 |

**Nota técnica sobre a medição de cor:** tentei isolar "cor de copa" vs. "cor de chão aberto" por segmentação de cor (script Python, decodificador PNG puro) e os dois tipos de superfície retornaram a **mesma cor dominante** (`#2e2d38`) em amostras cruzadas — ou seja, o filtro de noite do IdleDex comprime tanto o chão quanto a vegetação para uma faixa de cor quase idêntica. Isso é, em si, um achado real: **não dá para clonar a paleta do IdleDex pela imagem canônica** sem herdar esse achatamento noturno; o que a imagem realmente prova é a *composição/silhueta* (massas de copa vs. clareira aberta), não a cor.

### 2.2 Drakantos — qualidade e acabamento (só capturas oficiais)

Analisadas via `view_image` direto das URLs oficiais do press kit (`press.drakantos.com/images/*.png`, acesso 2026-11-08) e confirmação de descrição oficial via `web_fetch` (`press.drakantos.com` — **[E]** "MMORPG with a nostalgic top-down pixel art style... inspired by Chrono Trigger, Stardew Valley..."):

| Característica | Evidência | Vamos usar? | Como |
|---|---|---|---|
| Iluminação direcional única + luz secundária (bounce) | **[E]** `castle.png` (feixes de luz cruzando o piso em diagonal única), `mohazus.png` (tochas como única fonte, com raio de alcance visível) | Sim | Definir 1 sol/lua direcional + ambient fill no pipeline de arte do game-art |
| Glow/bloom em elementos emissivos (tochas, efeitos, partículas) em vez de cor chapada | **[E]** `mohazus.png`, `druid_temple.png` (partículas cian/amarelas brilhantes), `castle.png` (brilho da fonte) | Sim | Efeitos de habilidade e tochas/pontos de interesse devem ter halo de luz, não só sprite estático |
| Variação de tile mesmo em piso "simples" (rachaduras, musgo, sujeira, entulho) | **[E]** `lizards.png` — piso de pedra com no mínimo 4-5 variações visíveis (rachado, liso, com musgo, com terra) quebrando a grade | Sim | Gap crítico — nosso tileset atual tem só 2 variantes de grama (`grass_00`, `grass_01`, confirmado em `src/data/maps/test-meadow.tmj.json`) |
| Silhueta forte / contorno escuro nos personagens para legibilidade | **[E]** visível em todas as 7 imagens — personagens sempre com outline escuro nítido contra fundo ocupado | Sim | Padrão de arte a adotar no `ART_STYLE_GUIDE.md` |
| HUD compacto, por ícone, nos cantos/centro-inferior, nunca cobrindo a área de jogo | **[E]** `lizards.png` — portraits de grupo (canto sup-esq.), objetivos (canto sup-dir.), hotbar numerada (centro-inferior) | Sim | — |
| Legibilidade com muitas entidades simultâneas (6-8 inimigos + 3 aliados na tela) | **[E]** `lizards.png` — nomes/HP bar coloridos por time (verde aliado) sobre cada entidade, sem sobreposição confusa | Sim | Gap alto hoje — nosso v2 só foi testado com 2-3 entidades por vez |
| Profundidade em camadas (fundo desfocado/escurecido, objeto de frente com sombra projetada) | **[E]** `human_kingdom.png`, `adventures_guild.png` — prédios de fundo mais escuros/dessaturados, objetos de primeiro plano com sombra de contato nítida | Sim | — |

### 2.3 Digimon — identidade visual (sprites e ambientes oficiais)

| Característica | Evidência | Vamos usar? | Como |
|---|---|---|---|
| Sprites de criatura oficiais (overworld) | **[E]** `assets/GAME-ASSETS/10-source-files/dwds-sheets/` (11 folhas curadas) + `spriters-resource/` (320 folhas `dgmnworldds`, parte de um catálogo maior de 1074 folhas / 26 jogos já catalogado em `ASSET_DISCOVERY_CATALOG.md`/`DIGIMON_ASSET_INDEX.md` — não reconferido linha a linha nesta tarefa) | Sim | Base de produção, nunca arte genérica |
| Ambientes/tiles no estilo DWDS já extraídos | **[E]** `assets/GAME-ASSETS/03-environments/agua-dwds/`, `campo-dwds/`, `floresta-dwds/` já existem no repositório | Sim | **Usar como base de variação de tile** em vez de criar grama genérica do zero — resolve parte do gap de "variação de tile" sem depender só do estilo Drakantos |
| Identidade de personagem/ambientação | **[E]** `GAME_CONCEPTS.md`, `prototype/data/content-pack-digimon-oficial.json` (conteúdo já estruturado com Digimon oficiais, não genéricos) | Sim | — |

---

## 3. Imagens DESCARTADAS (e por quê)

| Imagem | Motivo |
|---|---|
| `art/reference/concept-founder/concept_world_and_creature.png` ("Aventura Pixelada", dino vermelho + criaturas estilo Pokémon) | **[E]** Confirmada via `view_image`: é uma ilustração gerada por IA, estilo clip-art saturado de dia, com criaturas genéricas estilo Pokémon — explicitamente descartada por ADR-010 e pelo script 07 do fundador ("a imagem ilustrativa anteriormente apresentada... NÃO deve orientar a produção"). Pode inspirar clima/mood, nunca ser usada como medida ou composição. |
| `assets/GAME-ASSETS/09-previews/style-options/B_battle_spirit*.png`, `C_mix*.png` | **[H]** Não inspecionadas nesta tarefa — ficam fora do escopo até confirmação de que não são baseadas na imagem conceito de IA descartada; não usadas como evidência aqui. |
| Qualquer captura de busca genérica de "Pokémon" ou "fan art Digimon" não oficial | **[H]** Não usadas nesta análise — só IdleDex real (conta de jogo), Drakantos oficial (press kit) e Digimon oficial (sprites DWDS/Spriters Resource, Reference Book) entraram como evidência. |

---

## 4. Gap analysis — nosso world v2 vs. referência canônica

Base de comparação: `prototype/world/docs/screens/*.png` (v2, zoom de combate) + `assets/GAME-ASSETS/09-previews/world_mockup_v2.png` (v2, visão geral de mundo, **[E]** 1280×736px) vs. `evidence/idledex-canonical/canonical_founder_screenshot_night_forest.png` (**[E]** 1706×788px) + referências de arte Drakantos.

| Item | Nosso v2 (evidência) | Referência canônica | Severidade | Nota |
|---|---|---|---|---|
| **Tiles de chão — variação** | **[E]** só 2 variantes de grama (`grass_00`, `grass_01`) + path/water/shore, confirmado em `src/data/maps/test-meadow.tmj.json`; cor base chapada `#58d030` cobre **44,7%** de `world_mockup_v2.png` (medido) | Drakantos: 4-5+ variações mesmo em piso simples (`lizards.png`) | **Crítico** | Maior ofensor de "parece protótipo", não "parece Drakantos" |
| **Vegetação — densidade/composição** | **[E]** árvores são props isolados num grid esparso (`tree_big_a/b` a cada ~64px com grama vazia entre elas, confirmado nos dados do `.tmj`) — visual de "árvores plantadas", não floresta | IdleDex: copas mescladas em massa contínua, ~35-45% da área de jogo | **Crítico** | É a característica mais citada pelo fundador ("floresta densa") e a mais distante hoje |
| **Escala criatura/treinador** | **[H]** proporção visual aproximada nas telas de combate do v2 (`03-combat-impact-zoom.png`) parece próxima de 1:1 a 1:1,2 companion:treinador — não foi possível confirmar se segue a tabela por estágio | Tabela medida: 0,7× a 1,5× conforme estágio (`DIGIMON_SIZE_TABLE.md`) | **Alto** | A tabela já existe — é um gap de *aplicação*, não de *pesquisa* |
| **Nomes e níveis no mapa** | **[E]** já implementado como pill com nome+Lv+HP bar acima da entidade (`06-attack-sequence-6f.png` etc.) | IdleDex real: só nome, sem Lv, sem painel — nosso v2 já é mais rico que a referência aqui | **Nenhum (já atende/supera)** | Não é um gap — manter |
| **HUD inferior — inventário** | **[E]** não existe; HUD do v2 é 2 barras de topo (Tamer/XP; AUTO+Mapa) + log de chat inferior-esquerdo + 4 botões de texto plano (TIME/DEX/LOJA/MENU) — nenhum ícone de inventário visível | IdleDex: faixa de ~8 ícones de inventário/consumíveis no rodapé | **Crítico** | Exigido explicitamente pelo ADR-010 e pelo script 08 §4 |
| **HUD inferior — equipe (box)** | **[E]** não existe faixa de portraits de equipe no rodapé do v2 | IdleDex: 5 portraits com Lv+HP ao lado do ativo | **Crítico** | Idem — item explícito da prova visual exigida |
| **Minimapa** | **[E]** só um placeholder de texto "MAPA" no canto superior-direito (`world_mockup_v2.png`), sem desenho de mapa real | IdleDex: minimapa quadrado funcional no rodapé | **Alto** | — |
| **Efeitos de combate** | **[E]** existem (`07-special-projectile.png`, `03-combat-impact-zoom.png`) mas são sprite único de cor chapada (bola laranja, flash branco), sem glow/partícula em camada | Drakantos: glow/bloom, partículas, halo de luz em efeitos e tochas | **Médio** | Já existe uma base funcional — é refinamento, não ausência |
| **Iluminação/sombra** | **[E]** nenhuma sombra de contato ou luz direcional visível em `world_mockup_v2.png` — cores chapadas com leve dither | Drakantos: luz direcional + sombra de contato em toda peça de cenário | **Alto** | — |
| **Legibilidade com múltiplas entidades** | **[H]** não testado no v2 com mais de ~3 entidades simultâneas nas telas disponíveis | Drakantos: 8+ entidades legíveis ao mesmo tempo (`lizards.png`) | **Médio** | Falta evidência própria — recomendar teste dedicado antes de travar a UI final |
| **Paleta geral** | **[E]** verde saturado único dominando 44,7% da imagem | **[H]** Não copiar a paleta noturna do IdleDex (ver nota em §2.1); usar paleta de dia com mais variação tonal, inspirada no contraste Drakantos (luz quente + sombra fria) | **Médio** | A paleta atual não é "errada" por não ser escura — é errada por ser quase monocromática e sem variação de luz/sombra |

---

## 5. Especificação-alvo da prova visual (GS-004 §4)

Medidas para `game-art` e `game-dev` executarem a demonstração obrigatória antes de qualquer produção em escala (ADR-010, script 08 §4-5). **[H]** marca números extrapolados/recomendados; **[E]** marca números já fixados no código ou medidos diretamente.

1. **Tile de chão:** **[E] manter 32×32px** (já é o `tilewidth` do engine, `src/sim/map.ts` + `test-meadow.tmj.json` — não requer mudança de arquitetura). **[H]** Produzir no mínimo **4-5 variantes de grama/chão** (hoje só 2) seguindo o padrão de quebra de monotonia visto em Drakantos (`lizards.png`): 1 base, 1-2 variação clara (flores/folhas caídas), 1 com leve textura de sombra/musgo.
2. **Vegetação:** **[H]** substituir árvores isoladas por clusters de copa que se tocam visualmente — usar como base os tiles já extraídos em `assets/GAME-ASSETS/03-environments/floresta-dwds/` (oficial Digimon World DS) em vez de criar do zero. Meta de densidade: **copas cobrindo 35-45% da área de jogo** nas bordas/regiões de floresta da prova visual, com clareira central aberta para o combate (medida de referência do canonical IdleDex, §2.1).
3. **Escala criatura:tamer:** **[E]** aplicar a tabela de `DIGIMON_SIZE_TABLE.md` diretamente: Rookie ≈ **1,0× o tamer**, Champion ≈ **1,4×**, nunca ultrapassar **1,5-1,6×** mesmo em Mega.
4. **Nomes e níveis:** **[E]** manter o padrão atual (pill com nome+Lv+HP sobre a entidade) — já supera a referência IdleDex real; não regredir para "só nome".
5. **HUD inferior obrigatório (gap crítico #1):**
   - Faixa de inventário/atalhos: **[H]** mínimo 6-8 slots de ícone, modelo visual do IdleDex (`t22_map_walk.png`) mas com ícones de identidade Digimon (não Poke Ball/Potion).
   - Faixa de equipe: **[H]** 4-6 portraits com Lv + barra de HP, modelo IdleDex (`t45_equipe_box_panel.png`).
   - Minimapa funcional: **[H]** substituir o placeholder de texto por um desenho real do mapa, canto inferior-esquerdo (posição vista em `t22_map_walk.png`) ou superior-direito (posição atual do v2) — decisão de layout do game-art, mas tem que renderizar o mapa de verdade.
6. **Iluminação e efeitos:** **[H]** 1 fonte de luz direcional (dia) + sombra de contato em árvores/rochas/personagens; efeitos de combate existentes (`07-special-projectile.png`, `03-combat-impact-zoom.png`) ganham halo/glow em vez de cor chapada, inspirados em `mohazus.png`/`druid_temple.png`.
7. **Paleta:** **[H]** cena de dia, não copiar os tons de `#2e2d38`/`#1f1623` do canonical IdleDex (são artefato do filtro noturno do jogo deles, não uma referência de cor utilizável). Buscar variação tonal luz/sombra como em Drakantos, mantendo saturação suficiente para leitura de Digimon coloridos.
8. **Checklist mínimo da demonstração (ADR-010):** mapa de floresta na composição acima + 1 jogador + outros jogadores visíveis + Digimons oficiais seguindo os treinadores + nomes (e níveis, nosso adicional) + combate no mapa com efeitos + HUD inferior com inventário e equipe.

---

## Limitações

- A segmentação automática de cor (copa vs. chão) no canonical IdleDex não funcionou por causa do achatamento tonal noturno — a % de cobertura de vegetação (35-45%) é estimativa visual **[H]**, não uma medição de área exata.
- Medi altura de sprite (treinador/criatura) por blob de cor no canonical IdleDex, mas os sprites vêm fragmentados por contorno/sombreamento — os valores de altura ficaram **[H]** (faixa aproximada, não um número único confiável); não travar specs de pixel-height do personagem nisso sem nova medição dedicada.
- Não abri `wiki.idledex.com` nesta sessão (o teardown em `teardowns/IDLEDEX.md`, já existente e completo, cobre a wiki) nem naveguei ao vivo no `idledex.com/play` — usei as capturas já coletadas (`evidence/idledex-canonical/`, `evidence/idledex/`) e o teardown anterior.
- Não abri os 1074 sprites do catálogo Digimon linha a linha — me apoiei no `DIGIMON_SIZE_TABLE.md` já auditado e nas pastas confirmadas por `ls`.
- `press.drakantos.com` e as imagens do press kit foram acessadas uma vez via `web_fetch`/`view_image` nesta sessão (2026-11-08); não há garantia de que o conteúdo não mude no futuro.
