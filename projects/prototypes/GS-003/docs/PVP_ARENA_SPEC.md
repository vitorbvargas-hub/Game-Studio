# PVP_ARENA_SPEC — GS-006: Digimon PvP Arena (1ª entrega obrigatória, §17)

- **Autor:** game-design (subagente) · **Data:** 2026-11-09 · **Escopo:** apenas os itens 1–11 do §17 do briefing (`docs/briefing/10_gs006_pvp_arena.md`). Nada aqui está implementado.
- **Fontes internas:** briefing GS-006, `docs/GDD_MMO_V1.md` §5 (Arena como evento), `docs/MOVE_SYSTEM.md` (golpes/MP/AUTO), `prototype/MODES_AND_ROADMAP.md` (Arena Clássica/Ação, normalização), `prototype/game/arena-spike/FEASIBILITY.md` (spike técnico de ação em tempo real), `knowledge/DOCUMENTATION.md` + `EVOLUTION_PROPOSAL.md` + `attributes_and_elements.json` (GS-005), código real em `prototype/world/src/sim/{types,world,moves,params}.ts`, `prototype/world/src/save/save.ts`.
- **Fontes externas:** oEmbed do YouTube (`youtube.com/oembed`, 2026-11-09); `digimon.fandom.com` via API MediaWiki (`api.php?action=parse`, contorna o desafio Cloudflare, mesmo método do `SOURCE_REGISTRY.md` do GS-005); `dmokb.info` (acesso direto).
- **Legenda:** **[E]** evidência com fonte · **[H]** hipótese/proposta de design, não validada.

---

## 1. Análise do vídeo de referência

**Link do briefing:** `youtube.com/watch?v=nVY9eDfpWtQ` (23min14s).

**[E, oEmbed do YouTube]:** título "JOGUEI o Pokémon que TODO MUNDO sempre SONHOU!", canal Andih (`youtube.com/@canalandih`) — é um fã-jogo de arena Pokémon, não um vídeo oficial de Digimon. O coordenador capturou 3 frames reais do vídeo (`evidence/pvp-video-nVY9eDfpWtQ/`, 2026-11-09), que esta análise usa diretamente. Como o estúdio não pode copiar nomes/espécies/marcas de Pokémon (ADR-007), o que segue extrai só a mecânica de arena, para reconstrução com identidade Digimon — nenhum nome, sprite ou IP do vídeo é usado no nosso jogo.

### 1.1 O que foi observado nos 3 frames — **[E]**

| Item pedido pelo briefing | Observado |
|---|---|
| **Formato / perspectiva** | 1 contra 1 em tempo real, câmera top-down fixa. Arena oval tipo estádio: campo de grama com listras de corte, arquibancada com torcida ao redor, bandas da borda em cores de time (vermelho/azul), holofotes num frame, emblema central no gramado. |
| **Organização / quantidade** | 1 criatura ativa por lado na tela por vez — nenhuma formação ou time completo visível simultaneamente nos frames capturados. |
| **Duração / estrutura da partida** | **Melhor de 3 rodadas**: timer central por rodada (~90–94 s observado), rótulo "Rodada 1"/"Rodada 2"/"Rodada 3", indicadores de rodadas (pontos ao lado do timer). Tela final mostra placar "2-1". |
| **HUD** | Canto superior esquerdo: retrato, nome, ícone(s) de tipo/elemento ao lado do nome (1 ícone para a criatura de estágio base, 2 ícones para a forma evoluída — indica dupla afinidade/elemento), HP numérico + barra verde, mais 2 barras abaixo da de HP (uma curta alaranjada rotulada por texto flutuante "+6 ps", outra vazia/escura sem rótulo identificado nos frames). |
| **Ataques / habilidades** | Barra inferior com **5 botões de habilidade**, cada um com nome e tecla: **LMB, RMB, Espaço (Spc), Q, E**. Cor do botão varia por tipo/elemento da habilidade (laranja = fogo, roxo = voador, no frame observado). Botão em uso fica com borda destacada (azul-escura). |
| **Efeitos** | Projétil (brasa, trilha de partículas) voando até o alvo; habilidade de área com nome em destaque acima do usuário ("Chama Furacão!") e anel de fogo no chão; texto de combate flutuante: ganho de recurso ("+6 ps"), buff nomeado ("Oheia! ATK up"), e um texto de efeito sonoro/impacto ("Choque Choque"). |
| **Movimentação / mira** | Movimento livre da criatura pelo campo; cursor "+" do mouse visível no gramado (mira livre, não é lock-on automático); anel de seleção amarelo sob o alvo e um indicador "^" acima dele. |
| **Regras / condição de vitória** | Rodada observada termina com uma das criaturas a 0 HP ("0/144" na tela de derrota); partida inteira decidida por melhor de 3 rodadas (placar "2-1"). |
| **Resultado** | Tela "Derrota" com o placar final, e por lado: sprite, nome, "Dano X" (total causado) e "Acertos Y" (nº de golpes que conectaram). Botões "Revanche" (tecla R/Start) e "Menu" (Esc/Select, rotulado "Escolher novamente"). |
| **Seleção de equipe / ranking / matchmaking / modo automático** | **Não observado** nestes 3 frames — [Pendente], não inventado. |

### 1.2 O que NÃO é parte do jogo (ruído do vídeo, não confundir com UI)

**[E]** Um painel "Chat 31" aparece na borda direita de um frame — é o **overlay de chat da live/stream** do criador de conteúdo (Twitch/YouTube), não um elemento do jogo sendo jogado. Não entra em nenhuma proposta de interface abaixo.

### 1.3 Leitura ambígua que fica como hipótese, não conclusão — **[H]**

No frame da Rodada 1 a criatura ativa é a forma base (119/119 HP); no frame da Rodada 2 é uma forma muito mais evoluída da mesma linha (144/144 HP, cheio outra vez). Duas leituras possíveis, nenhuma confirmada pelos 3 frames:
(a) o jogador trocou de criatura entre rodadas (time de 3, uma por rodada, sem HP compartilhado) — mais simples e é exatamente o que `MODES_AND_ROADMAP.md` §1.5 já propunha ("melhor de 3 monstros") antes desta pesquisa, o que reforça essa leitura; ou
(b) a mesma criatura evoluiu entre rodadas e o HP resetou para o novo máximo.
A leitura (a) é adotada como base de design abaixo por ser a mais simples e por já ter precedente interno aceito; **fica marcada como decisão a confirmar** (§13).

---

## 2. Comparação com o PvP da franquia Digimon

**[E, pesquisa complementar realizada nesta entrega + achados já registrados em `knowledge/attributes_and_elements.json` do GS-005]**

| Jogo | PvP existe? | Formato confirmado | Fonte |
|---|---|---|---|
| **Digimon Masters Online (DMO)** | **[E]** Sim — a DMO Knowledge Base (`dmokb.info/systems`) lista uma categoria dedicada "**PvP Content**: Arenas, competitive battles, and rankings" (2 entradas no catálogo de sistemas). | **[H] pendente** — as páginas específicas de Arena/PvP do `dmokb.info` (ex.: `/systems/pvp-system`, `/systems/arena`, `/systems/digimon-colosseum`) retornaram "System Not Found" nas URLs testadas nesta sessão; não encontrei a página certa pelo nome. Confirmado por evidência indireta: o sistema "Memory Skills" cita "**Arena Voucher Exchange**" como fonte de itens, e cada Tamer carrega **3 Digimon simultâneos, trocando o ativo em batalha** (`dmokb.info/systems/digimon`: "A single Tamer may have three Digimon with them at one time"). | `dmokb.info/systems` (lista de categorias) e `dmokb.info/systems/digimon`, ambos consultados em 2026-11-09. |
| **Digimon World: Next Order** | **[E]** Não há PvP documentado. O combate do jogo é descrito como "**an AI battle system, with the Digimon fighting automatically and the player issuing strategic commands to them**" — ou seja, o próprio PvE já é "automático + comandos estratégicos", o precedente mais próximo do nosso Modo Automático. | Não aplicável (sem PvP). | `digimon.fandom.com/wiki/Digimon_World:_Next_Order`, seção "Gameplay", via API MediaWiki, 2026-11-09. |
| **Digimon Story: Cyber Sleuth / Hacker's Memory** | **[E]** Não encontrada menção a modo PvP/online na página consultada (jogo é single-player, com "EDEN" como rede ficcional da história, não multiplayer real). Cyber Sleuth é a fonte com a **fórmula de dano por atributo mais detalhada da franquia** (ver tabela abaixo), reaproveitável mesmo sem PvP. | Não aplicável (sem PvP confirmado nesta sessão). | `digimon.fandom.com/wiki/Digimon_Story:_Cyber_Sleuth`, via API MediaWiki, 2026-11-09; cruzado com `knowledge/attributes_and_elements.json` (GS-005). |
| **Digimon World (PS1, 1999) / Dawn & Dusk** | **[E]** Nenhuma das fontes consultadas pelo GS-005 (`digimon.fandom.com`, `digimonworld.fandom.com`, `strategywiki.org`) documenta PvP para esses jogos — ambos são single-player com foco em criação/treino. | Não aplicável. | `knowledge/attributes_and_elements.json` (GS-005, 2026-11-09). |

### O que dá para reaproveitar de cada jogo, mesmo sem ver a arena inteira

- **DMO — tamanho de equipe:** "3 Digimon simultâneos, 1 ativo" é o precedente mais forte e mais próximo do que o briefing pede (equipe real do jogador, troca em combate). Usado na justificativa do §5.
- **DMO — vantagem de atributo:** Data vence Vaccine, Virus vence Data, Vaccine vence Virus, Unknown vence todos, No Attribute neutro; bônus de **+50% de dano** ao atingir 100% de "Experience" de atributo contra oponente em desvantagem **[E, `dmokb.info/systems/digimon-attributes`]**. É um sistema de progressão de atributo mais rico que o nosso; não propomos copiá-lo (o GS-003 já usa `affinityChart` fixo, ±25%/±20%, do `theme.json`), mas registramos como referência de "atributo importa de verdade" na franquia.
- **Next Order — Automático + comandos:** confirma que "IA luta automaticamente, jogador dá comandos estratégicos" é um padrão real e jogável da franquia, não uma invenção do GS-003 — dá peso de precedência ao nosso Modo Automático (§3).
- **Cyber Sleuth — fórmula de dano combinada tipo×elemento:** "vantagem de atributo = x2 dano (x1,25 se mesmo tipo/Free); vantagem de atributo E de elemento ao mesmo tempo = até x3; desvantagem dupla = x0,5" **[E, `digimon.fandom.com/wiki/Digimon_(creature)#Attribute`, citado em `attributes_and_elements.json`]**. É mais agressivo que o `MOVE_SYSTEM.md` §2.9 atual do GS-003 (elemento ×1.15/×0.85, mais fraco que o atributo) — registramos a diferença, mas **não propomos mudar `MOVE_SYSTEM.md`** nesta entrega (fora de escopo; mudaria o PvE também). Fica como nota de calibração futura se o PvE também quiser um elemento mais forte.
- **MODES_AND_ROADMAP.md (interno, já aprovado) — Arena Clássica (3 Digimon, assíncrona) e normalização de stats (§1.7, para a Arena de Ação):** é a base mais direta e já aceita pelo estúdio; esta entrega **não contradiz** esse documento, apenas o especializa para os dois modos (automático/manual) pedidos pelo GS-006.

---

## 3. Especificação do modo AUTOMÁTICO

### 3.1 Princípio

O jogador configura a equipe e a estratégia **antes** da partida; a partir daí, a IA (mesmo mecanismo do AUTO de campo) decide tudo. O briefing exige: "a estratégia preparada pelo jogador deve influenciar o resultado" e "não transformar o combate em resultado aleatório ou decidido apenas pelo nível".

**[E, reaproveitamento direto]** O motor já tem exatamente o gambit pedido: `AutoRule[]` (`sim/types.ts`) — lista ordenada de `{ moveId, cond, pct?, off? }`, resolvida por `chooseMove()` (`sim/moves.ts` §2.5 de `MOVE_SYSTEM.md`). Isso cobre "prioridade de habilidades" e parte de "condições de suporte e cura" (`target_hp_below_pct`, `self_hp_below_pct`, `ally_hp_below_pct`, `buff_not_active`) item por item do briefing.

### 3.2 O que falta adicionar (não existe hoje, porque hoje é sempre 1 parceira vs. 1 selvagem)

| Configuração pedida pelo briefing | Mecanismo proposto **[H]** |
|---|---|
| **Formação** | Ordem da equipe (slot 1/2/3) definida na tela de seleção (§6) — define quem entra primeiro e a ordem de entrada ao perder o Digimon ativo. |
| **Prioridade de alvos** | Novo campo `targetPriority` por Digimon ou por equipe: `lowest_hp_pct` (acabar quem está mais fraco), `highest_level` (focar a maior ameaça), `same_as_active` (manter o alvo que o Digimon anterior já tinha), `random_eligible` (padrão se não configurado). Resolvido antes de `chooseMove`, análogo a como `findAutoTarget()` já escolhe alvo no mundo aberto, mas comparando os 3 Digimon do lado oposto em vez de todos os `wild` próximos. |
| **Estratégia ofensiva/defensiva** | Não é um campo novo — é a composição das `AutoRule[]` por Digimon (ex.: time "ofensivo" = regras `always` nos golpes de maior poder primeiro; "defensivo" = `buff`/`heal` nas primeiras posições com `self_hp_below_pct` alto). Documentar isso como **2 templates sugeridos** na UI (§7), não como mecanismo novo de sim. |
| **Uso de habilidades especiais** | Já cobrem via `AutoRule` normal — golpes `special`/`buff`/`debuff` são apenas tipos de `MoveDef`, sem necessidade de uma categoria "especial" separada no motor. |
| **Ordem de atuação** | Em vez de "turnos" discretos, a arena roda no mesmo tick de 100 ms do motor (`TICK_MS`), com `attackCd`/`cooldownTicks` por golpe decidindo quando cada Digimon age — ou seja, **tempo real por recarga**, igual ao combate de campo hoje, não um ATB por rodada. Quem tem SPD maior e cooldowns mais curtos age mais vezes; isso já é "ordem de atuação" emergente do sistema atual, sem precisar de um escalonador de turnos novo. |
| **Regras de uso de recursos (MP)** | Já existe: `moveReady()` verifica `cost` em MP antes de qualquer golpe (§2.6 `MOVE_SYSTEM.md`). |

### 3.3 Como a estratégia influencia o resultado (sem aleatoriedade decidindo tudo)

A única aleatoriedade do motor hoje é `missChance` (5%), variância de dano (`damageVariance`) e `critChance` — nenhuma decide "quem ataca o quê" ou "quando". Isso já atende ao requisito do briefing: o resultado é determinado por composição (quais Digimon/moves o jogador trouxe), configuração (`AutoRule`/`targetPriority`/formação) e nível/stats reais — RNG só afeta variação dentro de um golpe já escolhido deterministicamente pela configuração do jogador.

---

## 4. Especificação do modo MANUAL

### 4.1 Princípio (atualizado com a evidência real do vídeo, §1)

Os frames confirmam um formato concreto: **1 contra 1 em tempo real, melhor de 3 rodadas, 5 botões de habilidade com mira livre de mouse**. Isso substitui a versão anterior desta seção (que previa apenas "trocar o ativo durante uma luta contínua 3v3") por um modelo mais simples e **mais alinhado ao que o próprio `MODES_AND_ROADMAP.md` §1.5 já propunha antes desta pesquisa** ("melhor de 3 monstros", HP não compartilhado entre rodadas): cada rodada é um 1v1 independente até KO ou timeout; o jogador troca de Digimon **entre rodadas**, não durante uma rodada em andamento.

### 4.2 Estrutura da partida — **[H]**, baseada em §1.1/§1.3

1. **Melhor de 3 rodadas.** Cada rodada é um combate 1v1 entre o Digimon ativo escolhido pelo jogador (dentre os 3 da equipe, §5) e o do adversário.
2. **Timer por rodada [H]**, inspirado no observado (~90–94 s): reaproveita o mesmo padrão já aceito em `MODES_AND_ROADMAP.md` §1.5 ("1 round = KO ou 90 segundos"), agora com confirmação externa de que esse tipo de timer é um padrão real de jogo de arena, não só uma hipótese interna.
3. **HP não carrega entre rodadas** — cada rodada começa com o Digimon ativo no HP cheio (ver §1.3: leitura adotada é "time de 3, 1 por rodada", não a mesma unidade evoluindo com HP residual).
4. **Fim de rodada:** KO do ativo de um lado, ou timeout — no timeout, vence quem está com maior %HP (mesmo critério já usado em `MODES_AND_ROADMAP.md` §1.5).
5. **Entre rodadas:** o lado que perdeu o Digimon ativo escolhe o próximo da equipe (ou a UI avança na formação definida antes da partida, se o jogador preferir não decidir a cada rodada — **[H]**, opção de conforto, não obrigatória).
6. **Fim de partida:** 2 rodadas vencidas por um lado (placar tipo "2-1", confirmado no frame de resultado).

### 4.3 Controles — 5 botões de habilidade, reconciliados com os 4 slots do `MOVE_SYSTEM.md`

**[E]** Os frames mostram 5 botões (LMB/RMB/Espaço/Q/E), um a mais que os 4 slots equipados já especificados em `MOVE_SYSTEM.md` §2.1. **[H] Reconciliação proposta**, sem quebrar o sistema de golpes já aprovado:

| Botão observado | Mapeamento proposto |
|---|---|
| **LMB** | O golpe básico universal já existente (`basicMoveId`, `investida` — sem custo de MP, sem recarga, sempre disponível), igual ao que `arena-spike` já usa como golpe de contato padrão. |
| **RMB / Espaço / Q / E** | Os **4 slots equipados** do Digimon (`Entity.moves`), na ordem configurada pelo jogador na tela de preparação — reaproveita 100% o sistema de equipar golpes já especificado, só muda o mapeamento de clique de UI para tecla. |

Isso significa que **nenhum golpe novo precisa existir** só porque o vídeo mostra 5 botões — é o mesmo kit de 4 golpes + básico que já existe para o combate de campo, só exposto como 5 botões na UI de Arena.

**[E, reaproveitamento quase total do motor]**

- `Intent.use_move` (`{ t: "use_move", playerId, slot }`) já "fura a fila do AUTO" com o golpe escolhido pelo jogador (`Entity.queuedMove`, priorizado por `chooseMove()`) — é literalmente o controlador manual sobrepondo o automático no mesmo motor, já implementado para o combate de campo.
- **Mira livre (cursor do mouse, §1.1)** — novo para a sim: hoje `engage` escolhe um `targetId` fixo; a Arena 1v1 não precisa de seleção de alvo (só há 1 adversário ativo por vez), mas golpes de área/projétil (`target.shape`) já têm alcance/raio no motor (`sim/moves.ts` `affected()`); mirar com o mouse afeta só a **direção de lançamento** (`facing`), não muda a lógica de acerto já existente.
- **Movimentação livre pelo campo** — já existe (`Intent.move_dir`), confirmando que o formato observado "permite movimentação" (briefing §4, condicional).
- **Barra de recurso extra ("+6 ps") e indicador de buff nomeado** — mapeiam diretamente ao MP (`mp`/`maxMp`) e ao `StatusEffect` já existentes no motor (§2.6/§2.7 `MOVE_SYSTEM.md`); nenhum recurso novo precisa ser inventado.
- A **segunda barra vazia/sem rótulo** observada no HUD **[H] não confirmada** — hipótese mais provável: um medidor de carga tipo "Sincronia", já proposto em `MODES_AND_ROADMAP.md` §1.2/§1.3 para a Arena de Ação ("golpe de Sincronia, medidor 0–100%") — se confirmado, o botão em destaque no frame 2 ("Queimadura Explosiva") seria esse golpe de carga; fica como hipótese a validar, não implementada nesta entrega.

### 4.4 O que falta adicionar ao motor

| Requisito | Mecanismo proposto **[H]** |
|---|---|
| **Escolher o próximo Digimon entre rodadas** | Não é uma troca em tempo real dentro de uma luta (não há `switch_active` em andamento) — é só iniciar a próxima rodada (um novo 1v1) com outro membro da equipe de 3. Reaproveita a mesma lógica de `createWorld`/`makeCreature` para instanciar o próximo combatente, sem precisar de um sistema de "banco" dentro de uma única luta. |
| **Mira por direção livre (mouse)** | Converter posição do cursor em `facing`/direção de lançamento ao confirmar `use_move` — ajuste de apresentação/input, não do motor de dano. |
| **Reagir às ações do adversário** | Decorre de o motor já ser em tempo real por tick (100 ms) e expor `WorldEvent` (`attack_start`, `damage`, `status`) imediatamente — a UI de batalha (§8) recebe esses eventos e o jogador decide o próximo `use_move` em cima do que vê. |
| **Tela de resultado com Dano/Acertos agregados** | Somar `amount` dos eventos `damage` (kind "damage") e contar quantos não foram `miss`, por `attackerId`, ao longo da(s) rodada(s) do Digimon que decidiu a partida — agregador simples sobre o log de `WorldEvent` já existente, sem novo sistema de métricas. |

### 4.5 O que o manual valoriza (vs. o automático)

Conforme o briefing §10 e confirmado pelo formato observado: execução (acertar a janela de cooldown certa, mirar o projétil/área), posicionamento (movimento livre pelo campo), tempo de reação (reagir a um `status`/`damage` recebido dentro do timer da rodada) e escolha de golpe em tempo real — tudo isso é possível porque o jogador está competindo com `chooseMove()` pelo mesmo direito de agir que o AUTO já tem hoje, só que via `queuedMove` em vez de `AutoRule`.

---

## 5. Seleção de equipe com os Digimon reais da conta

### 5.1 Tamanho da equipe: **3 Digimon**, com justificativa

**[H], decisão de design apoiada em evidência cruzada — não assumida sem motivo, como o briefing exige:**

1. **Precedente já aprovado no próprio estúdio:** `MODES_AND_ROADMAP.md` §2.1 e `GDD_MMO_V1.md` §5.1 já especificam a Arena Clássica com "time de defesa (3 Digimon)" — propor um número diferente aqui criaria dois tamanhos de equipe conflitantes dentro do mesmo jogo sem motivo técnico. Manter 3 evita essa inconsistência.
2. **Precedente da franquia (DMO):** "A single Tamer may have three Digimon with them at one time" **[E, `dmokb.info/systems/digimon`]** — é o único jogo da franquia com PvP confirmado e com regra de tamanho de equipe documentada; usa exatamente 3.
3. **Compatibilidade com os dados já salvos:** `save.ts` já modela `partner` (ativo) + `team: TeamMember[]` (demais membros, "slots 2–5") — ou seja, o jogo **já suporta até 5 no total**, então uma equipe de Arena de 3 é um **subconjunto simples de escolher entre os já existentes**, sem exigir nenhum campo novo de save além de "quais 3 (de até 5) entram nesta partida", e deixa margem para um futuro modo "equipe grande" sem reescrever o save.
4. **Compatibilidade com o motor de combate:** o motor resolve combate como par atacante↔alvo (`fight()`, `resolveAttack()`) com troca de alvo só quando um dos lados morre (`defeat()`); estender isso para "3 vs. 3 com troca do ativo ao cair" (§4.2) é uma extensão linear do que já existe, enquanto equipes maiores (5v5, 6v6) exigiriam decisões de design não pedidas pelo briefing (ex.: múltiplos Digimon ativos simultâneos, que o briefing não menciona).

**Decisão explícita que o fundador deve revisar:** este documento recomenda 3, mas não implementa — ver §14.

### 5.2 Fluxo de seleção (sem equipe pré-definida)

1. **Consultar a conta real:** ler `SaveData.partner` + `SaveData.team` (até 5 Digimon possuídos hoje) — nunca uma lista fixa/mock.
2. **Mostrar os elegíveis:** todo Digimon da conta com HP > 0 no save (um Digimon derrotado/com HP zerado no save — hoje isso não existe para a parceira ativa, mas pode existir nos membros de banco — fica inelegível até curado; **[H]**, regra a confirmar com o fundador).
3. **Exibir informações completas**, por Digimon (tudo já existe nos dados do save/species/moves, nada novo):
   - Nome, espécie, estágio (`SpeciesDef.stage`), nível (`level`), HP/HP máximo, ATK/DEF/SPD (`StatBlock`), MP/MP máximo, afinidade (Vaccine/Data/Virus/Free), elemento, golpes conhecidos e os 4 equipados (`learned`/`moves`), estatísticas de treino/evolução disponíveis em `EVOLUTION_PROPOSAL.md` quando essa pesquisa virar sistema.
4. **Permitir escolher os 3** que entram na partida, dentre os disponíveis.
5. **Permitir salvar composições** (ex.: "Equipe Ofensiva", "Equipe de Elementos") — novo campo em `SaveData`, `arenaTeams: { name: string; members: string[] /* ids de Digimon do save */ }[]`, **[H]**.
6. **Permitir editar antes da partida** (troca de membro, de golpes equipados, de `AutoRule`/`targetPriority` no modo automático) — tudo fora de combate, reaproveitando a mesma regra de "só edita fora de luta" já usada em `set_moves`.

---

## 6. Regras de combate: motor compartilhado

### 6.1 Separação exigida pelo briefing §5, mapeada ao código real

| Camada do briefing | Já existe? | Onde |
|---|---|---|
| **Motor de combate** (dano, atributos, habilidades, efeitos, cooldowns) | **[E] Sim, 100% reaproveitável** | `resolveAttack()`, `moveAttack()`, `computeDamage()`/`computeHeal()` (formulas.ts), `elementMult()`, `effectiveStat()`, `tickCooldowns()` — tudo em `sim/world.ts`/`sim/moves.ts`, sem dependência de UI/mapa. |
| **Controlador automático** | **[E] Sim** | `chooseMove()` + `AutoRule[]` (`sim/moves.ts`). Falta só `targetPriority` por time (§3.2). |
| **Controlador manual** | **[E] Sim, quase completo** | `Intent.use_move` + `queuedMove` + `engage`/`flee`. Falta só mira por cursor e a seleção do próximo Digimon entre rodadas (§4.4). |
| **Interface de batalha** | Não existe para Arena (existe para o mapa, `WORLD_COMBAT_VISUAL_SPEC.md`) | Ver §7. |
| **Validação do servidor** | **[H] Não existe ainda — nem para o mundo aberto.** | Hoje a sim é autoritativa só porque roda local, sem rede. Validação de servidor real é trabalho de Fase 5/6 do briefing (§16), não desta entrega — ver §10. |
| **Sistema de resultado** | Parcialmente — `WorldEvent` já loga tudo (`attack_start`, `damage`, `defeat`, `reward`) | Falta o agregador "quem venceu a partida de Arena" + histórico persistido (§7, §9). |

### 6.2 O que é novo: uma instância de Arena, não o mundo aberto

**[H]** Em vez de rodar a Arena dentro do `WorldSim` completo (que tem mapa, zonas de spawn, respawn de selvagens — nada disso cabe em uma partida 3v3 isolada), propõe-se um módulo novo e pequeno, no mesmo espírito do que `prototype/game/arena-spike/arena.ts` já fez para a Arena de Ação: uma simulação pura e determinística (`ArenaState`), que **importa e reaproveita** as funções puras de `sim/world.ts`/`sim/moves.ts` (`resolveAttack`, `chooseMove`, `computeDamage`, `elementMult`, etc.) em vez de duplicá-las. Isso cumpre literalmente a instrução do briefing §5 ("não duplicar o motor de combate") e §14 ("reutilizar... combate... não duplicar tabelas, serviços ou regras existentes").

Diferenças estruturais de uma partida de Arena vs. o encontro de campo:
- **2 lados simétricos** (jogador vs. jogador/fantasma), não "parceira vs. selvagem" — `hostileTo()` precisa generalizar de "wild vs. partner" para "ownerId A vs. ownerId B".
- **Sem mapa/colisão real** (ou um espaço mínimo de arena, reaproveitando `move_dir`) — dispensa `isSolidAt`/zonas de spawn/respawn de selvagens.
- **Vitória por timeout decidida por %HP** (precedente já aceito em `MODES_AND_ROADMAP.md` §1.5: "ao expirar o timer, vence quem está com maior % de HP"), usado tanto no timeout de rodada (Manual, §4.2) quanto no timeout de partida (Automático, §3).

**Estrutura de equipe difere por modo — ponto em aberto para o fundador (§13):**
- **Automático (§3):** 1 partida contínua, **3 Digimon por lado com entrada do próximo ao cair o ativo** (banco único, sem reset de HP entre trocas) — valoriza composição/formação ao longo de toda a luta.
- **Manual (§4, confirmado pelo vídeo de referência):** **melhor de 3 rodadas independentes**, 1 Digimon por rodada, HP resetado a cada rodada — cada rodada é, na prática, uma nova instância 1v1 do motor, não uma troca dentro da mesma luta.

São dois formatos de partida diferentes para os dois modos, cada um com precedente próprio (Automático: extensão natural do encontro de campo; Manual: evidência direta do vídeo + `MODES_AND_ROADMAP.md` §1.5). Isso **não exige um `switch_active` em tempo real** no motor — o Automático já cobre sua troca via a mesma lógica de `defeat()`/próximo membro, e o Manual simplesmente inicia uma nova rodada (nova instância do `ArenaState` 1v1) a cada Digimon derrotado.

---

## 7. Balanceamento

### 7.1 O que o modo automático valoriza vs. o manual

Já coberto estruturalmente: automático = composição + `AutoRule`/`targetPriority`/formação (§3); manual = tempo de reação + escolha em tempo real (§4). Nenhum mecanismo extra de balance é necessário para essa distinção — ela já emerge de quem decide o golpe (`chooseMove` vs. `queuedMove` do jogador).

### 7.2 Normalização — **sempre opcional e explícita** (briefing §10, não-negociável)

**[H]** Proposta de 2 modos de partida, escolhidos pelo jogador antes de entrar na fila/desafio, sempre visíveis na tela de preparação (§8):

| Modo | Regra |
|---|---|
| **Arena Livre** | Usa os stats reais dos Digimon, sem nenhum remapeamento. Resultado depende 100% do quanto o jogador treinou/evoluiu/equipou. |
| **Arena Nivelada** | Aplica o mesmo princípio já aprovado em `MODES_AND_ROADMAP.md` §1.7 para a Arena de Ação (lá pensado para combate em tempo real; aqui adaptado para o motor por tick/cooldown): HP remapeado para uma faixa fixa por estágio, dano expresso como % do HP nivelado, cap de bônus de nível por diferença (ex.: +1%/nível, teto ±15%), afinidade continua como multiplicador sobre o dano já nivelado. A tela mostra, antes da confirmação, uma linha clara: "Arena Nivelada ativa: seus stats estão sendo ajustados para esta partida" — nunca normaliza em silêncio. |

Faixas de poder (para matchmaking, quando existir fila real — Fase 6 do briefing): "Power Score" por equipe = função de nível médio, estágio médio e MP/HP total, usado só para parear partidas comparáveis; é um cálculo de exibição/pareamento, não altera o resultado do combate em si (quem decide o resultado é o motor de combate normal, nivelado ou não).

### 7.3 Prevenção de abusos (briefing §10, "não normalizar silenciosamente" + "evitar combinações abusivas/combates intermináveis")

- **Timeout de partida [H]:** reaproveitar o padrão de `WORLD.encounterTimeoutTicks` (hoje 600 ticks = 60 s para um encontro de campo); para Arena, propor um timeout maior mas finito (**[H]**, ex.: 180 s), com desempate por %HP total — nunca uma partida sem fim.
- **Limite de cura:** já existe implicitamente via custo de MP e `cooldownTicks` por golpe `heal` — não propomos um limite adicional nesta entrega; medir em playtest (Fase 5 do briefing geral, testes de balanceamento) se é suficiente.
- **Combinações abusivas** (ex.: 3 curadores sem dano): decisão de **restrição de equipe** fica pendente de dados reais de jogo — marcar como item de teste (§12), não de regra fixa nesta entrega.

---

## 8. Interface da Arena

Direção visual: estrutura do IdleDex, refinamento do Drakantos, identidade Digimon (ADR-010, já citado em `GDD_MMO_V1.md`) — nenhuma tela nova de estilo, reaproveitar os componentes de HUD/menu já usados no mundo aberto (`WORLD_COMBAT_VISUAL_SPEC.md`).

| Tela | Conteúdo | Reaproveitamento |
|---|---|---|
| **Entrada** | Botão "Arena" no menu/HUD principal, com escolha Automático/Manual e Livre/Nivelada | Nova tela, simples |
| **Seleção de equipe** | Lista dos Digimon reais da conta (§6.2), escolha de 3, composições salvas | Estende a aba "Equipe & Box" já especificada em `MOVE_SYSTEM.md` §2.4 |
| **Preparação** | Automático: `AutoRule` por Digimon (já tem UI prevista em `MOVE_SYSTEM.md` §2.4) + `targetPriority` + formação. Manual: confirmar o golpe básico (LMB) + os 4 golpes equipados nos 4 botões restantes (RMB/Espaço/Q/E, §4.3), por Digimon da equipe | Estende a mesma aba |
| **Busca de adversário** | Fase 3/4 (local): escolher o "fantasma" (save/time salvo, próprio ou de exemplo) — sem fila real ainda | Nova tela, simples (lista de arquivos/slots) |
| **Confirmação** | Resumo das 2 equipes, modo (Livre/Nivelado), botão "Lutar" | Nova |
| **Tela de batalha — Automático** | HUD: barras de HP por Digimon (ativo + indicador dos 2 no banco), ícones de golpe com cooldown/MP, log de eventos (reaproveita `WorldEvent`) | Adaptação do HUD de combate de campo (`WORLD_COMBAT_VISUAL_SPEC.md`) |
| **Tela de batalha — Manual** | Arena top-down (reskin Digimon do estádio observado no vídeo: gramado/plataforma, arquibancada, cores de time), câmera fixa; HUD: retrato+nome+ícone(s) de elemento, HP numérico+barra, barra de MP, timer de rodada central com indicador "Rodada N" e placar de rodadas vencidas; barra inferior com **5 botões** (básico + 4 equipados, §4.3) com nome/tecla/cooldown; cursor de mira livre; texto de combate flutuante (dano, ganho de MP, buff aplicado) | Nova (baseada em evidência real do vídeo, §1.1), reaproveita `WorldEvent` como fonte dos dados |
| **Resultado** | Placar da partida ("2-1"), e por lado: sprite, nome, Dano total e Acertos (agregador sobre `WorldEvent`, §4.4), botões Revanche e Menu/Escolher novamente; recompensas (bits/cosmético, nunca vantagem de poder — regra já fixada em `GDD_MMO_V1.md` §5.4) | Nova, layout confirmado pelo frame de resultado do vídeo (§1.1) |
| **Ranking** | Fase 6 do briefing — fora do escopo desta entrega (protótipo não compete em ranking real ainda) | — |
| **Histórico** | Lista local de partidas jogadas (array simples em `SaveData`, **[H]**) | Nova, pequena |

---

## 9. Arquitetura: local agora vs. exige servidor

### 9.1 Roda local agora (Fases 3–4 do briefing, sem aprovação adicional)

**[E, mesma conclusão já registrada em `prototype/game/arena-spike/FEASIBILITY.md` §3 para a Arena de Ação, válida aqui]**: toda a sim (`sim/world.ts`, `sim/moves.ts`, formulas) já é TypeScript puro, sem DOM/rede, com RNG serializado — roda 100% no cliente. Para o protótipo de Arena (Automático e Manual) com oponente "fantasma":

- Novo módulo `sim/arena.ts` (ou pasta equivalente), importando as funções puras do motor existente — **sem servidor**.
- Oponente "fantasma" = uma segunda equipe carregada de um save (próprio, de um slot local, ou um arquivo de exemplo) — **nenhuma rede, nenhuma conta remota**.
- Histórico/composições salvas = `SaveData` local, mesmo `localStorage` já usado.

### 9.2 Exige servidor (Fases 5–6 do briefing — **apenas com aprovação explícita do fundador**, regra do estúdio e do próprio GDD_MMO_V1 §8)

- **PvP contra outro jogador real, ao vivo ou por fila de matchmaking.**
- **Ranking persistente entre contas** (qualquer ranking real, não mockado).
- **Validação autoritativa de resultado** contra manipulação de cliente (briefing §13: "o servidor deve ser autoridade sobre os resultados") — localmente, o próprio cliente roda a sim, então **não há garantia anti-trapaça nesta fase**; isso é esperado e aceitável para um protótipo local (o briefing já prevê isso na Fase 3→6).
- **Mercado/temporadas/cosméticos distribuídos entre jogadores.**

Esta divisão é a mesma já adotada em `GDD_MMO_V1.md` §8 e `MODES_AND_ROADMAP.md` §3 para o resto do jogo — a Arena PvP não cria uma exceção à regra do estúdio.

---

## 10. Plano de implementação — Fases 3 e 4 (protótipo local, oponente fantasma)

### Fase 3 — protótipo AUTOMÁTICO (local)

1. `sim/arena.ts`: `ArenaState`, snapshot de equipe (reaproveita `TeamMember`/`PartnerSave` de `save.ts`), `stepArena()` reaproveitando `resolveAttack`/`chooseMove`/`computeDamage`/`elementMult` do motor existente; lógica de troca no KO; condição de vitória/timeout.
2. `targetPriority` por time + extensão de `AutoRule` para formação/ordem.
3. Tela de seleção de equipe (consulta real ao save, §6).
4. Tela de preparação (configurar `AutoRule`/`targetPriority`, modo Livre/Nivelado).
5. Oponente fantasma: carregar uma segunda equipe de um save/slot local.
6. Tela de batalha (HUD mínimo: HP, cooldowns, log) e tela de resultado.
7. Normalização "Arena Nivelada" (§7.2), com toggle visível.

### Fase 4 — protótipo MANUAL (local, formato confirmado pelo vídeo de referência, §1/§4)

1. Reaproveita as funções puras do motor da Fase 3 (`resolveAttack`/`computeDamage`/`elementMult`), mas como **instâncias 1v1 por rodada** (§4.2), não o `ArenaState` 3v3 contínuo do Automático — cada rodada é criada/encerrada como uma luta nova.
2. Controlador manual: inputs do jogador (`use_move` + mira por cursor, §4.3) substituindo `chooseMove()` só para o Digimon ativo do jogador; o lado fantasma continua 100% controlado por `chooseMove()`/`AutoRule` (IA).
3. Estrutura de melhor de 3 rodadas: timer por rodada, placar de rodadas vencidas, seleção do próximo Digimon da equipe de 3 entre rodadas (§4.2).
4. HUD de batalha com os 5 botões de golpe (básico + 4 equipados, ícone + cooldown + custo de MP), mira livre, timer/placar de rodada (§8).
5. Tela de resultado com placar final, Dano/Acertos agregados por lado (§4.4) e botões Revanche/Menu.
6. Reskin visual do estádio observado no vídeo (§1.1) com identidade Digimon (ADR-010) — sem copiar nenhum asset/nome do vídeo de referência.

Nenhuma fase exige servidor, conta remota ou matchmaking real — consistente com o briefing §16 (Fases 3–4 == protótipo local).

---

## 11. Testes necessários

| Teste | Objetivo | Precedente a seguir |
|---|---|---|
| **Determinismo por seed** | Mesma composição + mesma seed + mesmos inputs → mesmo resultado, em ambos os modos | `arena-spike/arena.check.ts`, `tests/` do motor |
| **Troca no KO (Automático)** | Time perde o Digimon ativo → próximo do banco assume automaticamente, na ordem de formação, sem reset de HP | Novo, sem precedente direto |
| **Timeout de rodada/partida e desempate por %HP** | Rodada (Manual) ou partida (Automático) sem KO até o timer → vence quem tem maior %HP | `MODES_AND_ROADMAP.md` §1.5 (regra já aceita), confirmado pelo formato do vídeo (§1.1) |
| **Placar de melhor de 3 (Manual)** | Partida termina exatamente quando um lado atinge 2 rodadas vencidas; nunca continua após isso | Novo, direto da evidência do vídeo (§1.1) |
| **Reset de HP entre rodadas (Manual)** | Cada novo Digimon de rodada entra com HP cheio, independente do resultado da rodada anterior | Novo, direto da leitura adotada em §1.3 |
| **Agregador de Dano/Acertos** | Soma de `damage.amount` e contagem de não-`miss` por `attackerId` bate com o log de `WorldEvent` da(s) rodada(s) | Novo, direto do formato de resultado observado (§1.1) |
| **Paridade motor único** | O mesmo golpe, nos mesmos stats, produz o mesmo dano seja escolhido por `AutoRule` (automático) ou por `queuedMove` (manual) — prova que não há 2 motores de dano | Direto do requisito §5 do briefing |
| **MP/cooldown gating** | Golpe sem MP ou em recarga nunca é escolhido por nenhum controlador | Já testado no motor de campo; replicar para Arena |
| **Normalização visível e correta** | "Arena Nivelada" sempre mostra o aviso antes da partida; "Arena Livre" nunca aplica remapeamento | Novo, requisito direto do briefing §10 |
| **Validação de equipe real** | Não é possível entrar com Digimon que não existe no save do jogador, nem trocar membros/golpes em combate | Reaproveita `validateSlots()` e a regra "só edita fora de luta" já existentes |
| **Balanceamento por simulação (IA x IA)** | Repetir o padrão de `arena-spike` (centenas de seeds, medir % de vitória por composição) para calibrar `targetPriority`/normalização antes de qualquer playtest humano | `arena-spike/FEASIBILITY.md` §0, rodada QA R2 |
| **Sem combate infinito** | Com timeout + cura limitada por MP/cooldown, nenhuma simulação automatizada deve exceder o timeout sem decisão | Novo, requisito direto do briefing §10 |
| **Performance** | Custo por tick da `ArenaState` (3v3, 2 controladores) medido no mesmo host, mesmo padrão do spike (`0,16 µs/tick` para 2 lutadores) | `arena-spike/FEASIBILITY.md` §0 |
| **Playtest manual humano** | Sensação de controle (cooldown, troca, reação) — **registrar como limitação se não houver Chromium real no host**, mesma ressalva já feita no `FEASIBILITY.md` da Arena de Ação | `arena-spike/FEASIBILITY.md` §6 |

---

## 12. Limitações desta entrega

1. **A análise do vídeo cobre só 3 frames** (capturados pelo coordenador), não os 23min14s inteiros — itens não observados nesses 3 frames (seleção de equipe, ranking, matchmaking, modo automático do jogo de referência) permanecem "não observado", não "não existe" (§1.1). A leitura sobre troca de Digimon entre rodadas vs. evolução durante a luta (§1.3) também fica como hipótese, não fato confirmado.
2. **`web_search` esteve indisponível nesta sessão** (mesma limitação já registrada pelo GS-005); toda pesquisa de PvP da franquia usou `web_fetch` direto, API MediaWiki (contorno de Cloudflare) e navegação manual de URLs do `dmokb.info` — a página exata de regras de Arena/PvP da DMO não foi localizada (as URLs testadas retornaram "System Not Found"); fica como pendência de pesquisa, não como "não existe".
3. **Tamanho de equipe (3) é uma recomendação justificada, não uma decisão final** — depende de confirmação do fundador (§14).
4. **Nenhum número de balance (poder dos golpes, duração de timeout, cap de normalização, custo de MP) foi calibrado jogando** — todos **[H]**, no mesmo padrão já usado em `MOVE_SYSTEM.md` e `MODES_AND_ROADMAP.md`.
5. **Esta entrega não implementa nada** — é só a especificação pedida pelo §17. Todo código citado (`sim/arena.ts`, `targetPriority`, telas) é proposta para a Fase 3/4, não existe ainda.
6. **Validação de servidor/anti-cheat não é tratada em profundidade** — por decisão de escopo (protótipo local primeiro, servidor só com aprovação do fundador), não por omissão.

---

## 13. Decisões que precisam do fundador

1. **Confirmar a leitura de §1.3:** equipe de 3 Digimon, 1 por rodada, sem HP compartilhado (hipótese adotada) vs. uma única unidade evoluindo durante a partida com HP residual. Afeta diretamente o Plano da Fase 4 (§10).
2. **Tamanho da equipe de Arena: 3 Digimon** (proposto em §5.1, agora também consistente com o vídeo mostrando mais de 1 Digimon por jogador na mesma partida). Pedir confirmação antes de qualquer implementação de Fase 3.
3. **Estruturas diferentes por modo (§6.2):** Automático = 1 partida contínua com banco; Manual = melhor de 3 rodadas independentes. Confirmar se essa divergência é aceitável ou se o fundador prefere unificar os dois modos no mesmo formato de partida.
4. **Botão LMB = golpe básico universal, RMB/Espaço/Q/E = os 4 slots equipados (§4.3):** essa reconciliação com os 5 botões do vídeo é proposta, não confirmada pelos frames (não dá para saber se o jogo de referência usa um golpe básico sem custo ali). Confirmar se faz sentido manter.
5. **Segunda barra de recurso não identificada (§4.3):** hipótese de medidor de Sincronia/ultimate (`MODES_AND_ROADMAP.md` §1.2). Confirmar com mais frames/trecho do vídeo, se disponível.
6. **Normalização "Arena Nivelada" (§7.2):** confirmar se deve existir como opção desde o protótipo local (Fase 3) ou só mais adiante — e se o padrão inicial (quando o jogador não escolhe) deve ser Livre ou Nivelada.
7. **Servidor (matchmaking real, ranking persistente, PvP ao vivo, validação anti-cheat):** confirmado como bloqueado sem aprovação explícita, conforme regra do estúdio e `GDD_MMO_V1.md` §8 — nenhuma ação nesse sentido foi tomada ou está planejada sem essa aprovação.
8. **Reaproveitar a aba "Equipe & Box" existente** (já especificada em `MOVE_SYSTEM.md`) para seleção de equipe/composições de Arena, em vez de criar uma tela 100% separada — confirmar se essa reutilização de UI está de acordo com a visão do fundador para a Arena.

---

## Resumo para o coordenador

Caminho do artefato: `GS-003/docs/PVP_ARENA_SPEC.md`.

Resumo (8–10 linhas): o vídeo de referência (`nVY9eDfpWtQ`) é de um fã-jogo de arena **Pokémon** (oEmbed), não Digimon; a análise usou 3 frames reais capturados pelo coordenador, extraindo só mecânica (nada de IP). Formato observado: **1v1 em tempo real, melhor de 3 rodadas (~90–94 s cada), 5 botões de habilidade (LMB/RMB/Espaço/Q/E) com mira livre de mouse**, arena top-down tipo estádio, HP resetado por rodada, placar tipo "2-1", tela de resultado com Dano/Acertos por lado e Revanche/Menu. Isso substituiu a proposta anterior de "3v3 contínuo com troca em tempo real" por um modelo mais simples: equipe de 3 Digimon, 1 por rodada, cada rodada uma instância 1v1 do motor — alinhado ao que `MODES_AND_ROADMAP.md` §1.5 já propunha. Os 5 botões reconciliam-se com o sistema de golpes já aprovado (LMB = golpe básico universal, RMB/Espaço/Q/E = os 4 slots equipados), sem criar nenhum golpe novo. O modo Automático **não foi alterado** (continua partida contínua 3v3 com banco, reaproveitando `AutoRule`/`chooseMove` já implementados). A pesquisa na franquia confirma PvP real só em DMO (equipe de 3, atributo forte) e nenhum PvP documentado em Next Order/Cyber Sleuth/Dawn&Dusk/DW1. Balanceamento mantém normalização sempre opcional e visível; arquitetura local nas Fases 3–4 (oponente "fantasma"), servidor só nas Fases 5–6 com aprovação do fundador. Nada foi implementado nesta entrega.

Limitações principais: análise cobre só 3 frames, não o vídeo inteiro; leitura "time de 3, 1 por rodada" vs. "mesma unidade evoluindo" é hipótese, não fato; páginas específicas de Arena da DMO não localizadas (`web_search` indisponível); mapeamento dos 5 botões e a 2ª barra de recurso são propostas, não confirmações.

Decisões que precisam do fundador: confirmar a leitura "equipe de 3, 1 por rodada" (§1.3); aprovar equipe de 3 Digimon; aceitar a divergência estrutural Automático (contínuo) vs. Manual (por rodada); validar o mapeamento LMB=básico + 4 slots; esclarecer a 2ª barra de recurso; decidir o padrão de normalização; confirmar que servidor continua bloqueado sem aprovação separada; validar reaproveitamento da aba "Equipe & Box" para a Arena.
