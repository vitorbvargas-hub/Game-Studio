# DATA_QUALITY_REPORT — GS-005 fase 1

Gerado em 2026-11-09. Baseado nos arquivos `_research/coverage_stats.json`, `evolution_chains.json`, `training_systems.json`, `attributes_and_elements.json`.

## 1. Cobertura de evolução — Digimon confirmados por linha × jogo (de 5, ou 6 para a linha Dorumon)

| Linha | DW1 (PS1) | Next Order | Cyber Sleuth/HM | DMO | Dawn & Dusk |
|---|---|---|---|---|---|
| **Agumon** (Koromon→WarGreymon) | 3/5 | **5/5** | **5/5** | 5/5 (existência; requisitos pendentes) | **5/5** |
| **Gabumon** (Tsunomon→MetalGarurumon) | 1/5 | **5/5** | **5/5** | 5/5 (existência; requisitos pendentes) | **5/5** |
| **Patamon** (Tokomon→Seraphimon) | 1/5 | **5/5** | **5/5** | 4/5 (Tokomon ausente) | **5/5** |
| **Guilmon** (Gigimon→Gallantmon) | 0/5 (ausente — linha pós-1999) | **5/5** | 4/5 (Gigimon ausente) | 4/5 (Gigimon ausente) | **5/5** |
| **Dorumon** (Dorimon→Mega) | 0/6 (ausente — linha pós-1999) | 0/6 (ausente nesta fonte) | 4/6 (Dorimon e ChaosDukemon ausentes) | 5/6 (Dorimon ausente) | 5/6 (ChaosDukemon não existe no jogo) |

**Totais:** 24 Digimon-alvo únicos pesquisados (5 linhas × 5 estágios, +1 Mega alternativo na linha Dorumon = 26 "vagas"). Confirmados com requisito numérico exato em pelo menos 1 jogo: **24/26** (via Cyber Sleuth e/ou Dawn & Dusk). Os 2 que nunca tiveram requisito numérico confirmado em nenhum jogo pesquisado: nenhum — todos os 24 que existem em algum jogo têm requisito numérico em pelo menos uma fonte (Cyber Sleuth ou Dawn & Dusk).

**Jogos com cobertura de requisito numérico completa (24-26 Digimon):** Cyber Sleuth/Hacker's Memory e Dawn & Dusk.
**Jogos com cobertura de presença/ausência completa mas SEM requisito numérico:** Next Order e DMO (bloqueio técnico de ferramenta, não falta de dado no jogo).
**Jogo com cobertura mais fraca (presença e requisito):** Digimon World (PS1) — fontes majoritariamente stub/inacessíveis.

## 2. Por que DW1 e Next Order/DMO ficaram incompletos (causa raiz, não "falta de esforço")

- **DW1:** as 2 wikis especializadas (digimonworld.fandom.com, strategywiki.org) têm conteúdo genuinamente pouco desenvolvido para este jogo de 1999 (páginas "To be added", guia stub sem subpágina de Digimon). GameFAQs bloqueou 100% das tentativas com erro de abuso de hospedagem — nenhuma fonte alternativa de qualidade equivalente foi autorizada pela tarefa.
- **Next Order e Cyber Sleuth/HM:** a página MAIS completa (digimon.fandom.com) tem seção dedicada por jogo com os alvos de evolução, mas Next Order especificamente não publica os números exatos de nível/ABI/Felicidade/Disciplina/Vínculo por salto — só duas regras gerais (Numemon/Geremon por falha de prazo; Sukamon por negligência).
- **DMO:** a dmokb.info é uma SPA (Single Page Application) — a árvore de digivolução é montada por JavaScript no navegador do usuário. A ferramenta `web_fetch` disponível só lê HTML estático (Readability), então essa seção específica nunca aparece no texto extraído, em nenhuma das ~26 páginas tentadas. Para obter os requisitos exatos do DMO será necessário acesso com navegador real (fora do escopo das ferramentas desta sessão).

## 3. Treino (`training_systems.json`) — cobertura por jogo

| Jogo | Cobertura |
|---|---|
| DW1 (PS1) | Parcial — mecanismo geral confirmado (treinar/alimentar/descansar/banheiro + evolução degenerada Numemon), mas stats nominais e detalhes de fome/sono/disciplina/vínculo pendentes. |
| Next Order | **Pendente** — bloqueio total de acesso nesta sessão. |
| Cyber Sleuth/HM | **Pendente** — página do StrategyWiki existe mas está em "completion stage 0" (só infobox). |
| DMO | Completo dentro do que a fonte permite — nivelamento por EXP, Hatching, Breakthrough confirmados; fome/sono/felicidade/disciplina/treino em grupo pendentes (provavelmente não existem no jogo, mas não confirmado como ausência). |
| Dawn & Dusk | Bom — DigiFarm, BGM/Terreno, EXP de espécie e amizade bem confirmados; sono, disciplina nomeada e riscos de treino excessivo pendentes. |

## 4. Atributos e elementos (`attributes_and_elements.json`) — cobertura por jogo

| Jogo | Cobertura |
|---|---|
| DW1 (PS1) | Pendente — só a regra genérica do franchise (Vaccine>Virus>Data>Vaccine), sem confirmação específica do jogo; sem sistema de elementos encontrado. |
| Next Order | Pendente — nenhuma fonte descreve regra de vantagem de atributo em combate para este jogo especificamente. |
| Cyber Sleuth/HM | **Completo** — ciclo fechado Vaccine/Data/Virus/Free + 9 elementos + fórmula de dano citada literalmente (x2/x3/x0.5/x1.25). |
| DMO | Regra de atributo completa (Data>Vaccine>Virus>Data, Unknown>todos) e bônus de XP de 50%; tabela dos 11 elementos existe no site mas a página estava vazia no momento da consulta. |
| Dawn & Dusk | Não usa Vaccine/Data/Virus como mecânica de combate (confirmado por busca com 0 resultados); usa 8 "Species" com elemento principal/fraco em 4 pares opostos — tabela completa confirmada. |

## 5. Vídeos (`video_reference_index.json`)

- 10 vídeos específicos com oEmbed confirmado (título/canal/thumbnail).
- 2 vídeos retornaram 404 (Hacker's Memory Parte 1 e 2 — provavelmente removidos/privados).
- 1 página de playlist externa (FlyIcarus Games, DMO).
- **22 dos 35 links da lista original são buscas do YouTube (`results?search_query=`), não vídeos específicos** — marcados corretamente como `busca_youtube`, sem dado de oEmbed (não é um vídeo, não pode ser indexado como tal).
- **Nenhum vídeo foi assistido.** Todos os campos `systems_shown`, `chapters` e `duration` estão `"pendente"` — a tarefa reconhece explicitamente essa limitação ("Você NÃO consegue assistir aos vídeos").
- **Nenhum vídeo específico existe na lista original para Digimon Survive e Dawn & Dusk** — só buscas. Gap a resolver numa fase 2 de curadoria de vídeos.

## 6. Classificação geral de confiabilidade das fontes usadas

- **Alta:** digimon.fandom.com (Next Order, Cyber Sleuth/HM, atributos), StrategyWiki Dawn & Dusk, tamerdex.com (requisitos Cyber Sleuth), youtube.com/oembed, dmokb.info (texto estático de sistemas).
- **Média:** digimonworld.fandom.com (conteúdo real mas majoritariamente stub), flyicarusgames.com.br (canal de fã).
- **Baixa/não usável para este escopo:** digidex.gg (fonte errada — é TCG, não os jogos pesquisados), GameFAQs (bloqueio total), grindosaur.com (bloqueio total), html.duckduckgo.com (CAPTCHA).

## 7. Nenhum dado foi inventado

Todo campo sem evidência direta de uma das fontes autorizadas foi marcado `"pendente"` ou `"not_in_game"` com a razão documentada em `notes`/`general_notes` do respectivo JSON. Onde uma inferência de alta plausibilidade foi necessária (ex.: reconstrução dos vínculos `evolves_from`/`evolves_to` do tamerdex, cujo widget é renderizado via JS), isso está marcado `[H]` e explicado, nunca apresentado como `[E]` confirmado.
