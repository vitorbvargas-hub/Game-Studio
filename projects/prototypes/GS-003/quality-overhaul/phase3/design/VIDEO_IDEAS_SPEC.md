# Video Ideas Spec — 9 itens do estudo de vídeos (Digimon)

- **Autor:** game-design · **Data:** 2026-11-10
- **Gatilho:** aprovação do fundador (`quality-overhaul/PROJECT_LOG.md`, 2026-11-10 ~07:3x) do pacote de ideias de `docs/DIGIMON_GAMES_STUDY.md` e da HUD Alt A "Digivice Radial" (`phase3/design/HUD_IDENTITY_V3.md`).
- **Base:** `docs/DIGIMON_GAMES_STUDY.md` (fonte dos 9 itens), `HUD_IDENTITY_V3.md` + `PANELS_SPEC.md` (entregas irmãs, não reabertas aqui), `docs/GDD_MMO_V1.md` §1 (regiões), §4 (World Boss), §6 (captura/evolução), `knowledge/evolution_requirements.json`, `prototype/world/src/sim/evolution.ts` e `moves.ts` (leitura, código não alterado), `quality-overhaul/encounters/tables/digimon-forest-01.json` (GS-012), `quality-overhaul/audit/UI_WORLD_AUDIT.md` §2.6 (mapa-múndi).
- **Nenhum código foi alterado.** Nenhuma arte foi produzida. Todo número novo aqui é **[H]**, proposta inicial de design.
- **Convenção:** cada item traz Objetivo, Especificação, Prioridade/Dependências/Esforço e Critérios de aceite (verificáveis por game-qa).

---

## 1. Parceiro fala no mapa

### Objetivo
Dar vida ao parceiro fora de combate com comentários curtos e contextuais (Next Order), sem UI nova pesada e sem spam.

### Gatilhos e a sim real (verificado)
**[E]** A sim já emite os eventos usados como gatilho — nenhum evento novo na sim, só a UI decidindo mostrar um balão:

| Gatilho pedido | Fonte real | Observação |
|---|---|---|
| Item próximo | `interact.ts` `nearestInteraction()` já detecta baú/placa/cura/NPC a `INTERACT_RADIUS` | Balão dispara a um raio **maior** (3×`INTERACT_RADIUS`, "percebeu de longe"), antes do jogador chegar perto o bastante para interagir de fato |
| Selvagem raro próximo | `digimon-forest-01.json` já tem `rarity: "rare"/"very_rare"` por `entry` | Balão dispara quando um selvagem com essa raridade entra no raio de detecção do jogador (mesmo raio do `detectRadiusTiles` das entries `visible`, ou `aggroRadius` para as `random`) |
| PV baixo | Evento `damage`/estado do `hp` do parceiro, já emitido (`hud.ts` `case "damage"`) | Abaixo de 30% de PV máximo |
| Fome/cansaço | **Não existe** (confirmado: nenhum campo de fome/sono em `types.ts`/`world.ts`) | Gatilho **fora de escopo** nesta versão — o próprio briefing já condiciona ("se existir"). Fica registrado para quando (se) um sistema de cuidado for proposto; não inventar aqui |
| Chegar a POI | Entrada em região (`region`/`mapId` muda, já emitido pelo sistema de viagem/`worldmap.ts`) | 1 fala na primeira vez que o jogador entra em cada região desta sessão |
| Vitória | Evento `reward`, já emitido | Só em vitórias "notáveis" (ver cooldown) |

### Especificação
- **Banco de falas:** arquivo de dados novo `knowledge/partner_lines.json` **[H]**, content pack (mesmo padrão `economyJson`/`questlog`), schema `{ personalityId, trigger, lines: string[] }`. 40+ falas curtas (≤40 caracteres, PT-BR) distribuídas pelos gatilhos acima (mínimo 6 por gatilho × ≥1 personalidade inicial; quando houver mais de uma personalidade de parceiro no GDD, repetir o schema por `personalityId`).
- **Ícones:** 3 ícones novos no mesmo pipeline de `ui/icons.ts` (mapa de caracteres 10×10, paleta do projeto): `"!!"` (descoberta/perigo), `"?"` (curiosidade/item), `"♪"` (contentamento/vitória) — produção de game-art/game-dev, mesmo formato dos ícones existentes (`bag`, `chest`, etc.), sem ícone de terceiros.
- **Balão:** componente novo (não existe hoje — confirmado, sem `balloon`/`bubble` no código). Pixel-UI, moldura nível 3 do `P8_HUD_V2_SPEC.md` §2 (a mais discreta, **herdada, não reaberta**), ancorado acima do sprite do parceiro, aparece 2,5s, fade 0,2s, no máximo 1 balão visível por vez (fila descarta o mais antigo, nunca empilha 2).
- **Cooldown anti-spam:** 1 balão por gatilho por 45s (por tipo de gatilho, não global) + cooldown global de 8s entre quaisquer 2 balões — nenhum gatilho novo dispara enquanto o cooldown global corre.
- **Seleção da fala:** aleatória sem repetir a mesma fala 2× seguidas por gatilho (mesmo padrão "sem repetição imediata" já seria razoável de esperar de qualquer banco de texto do estúdio).

### Prioridade / Dependências / Esforço
- **P1.** Dependências: arte (3 ícones novos), dev (componente de balão + hook nos eventos já emitidos + leitura de `partner_lines.json`). Esforço **[H]:** ~2–3 dias de dev, 40+ linhas de texto (game-design já entrega o banco).

### Critérios de aceite
- [ ] Nenhum balão novo aparece mais de 1× a cada 45s pelo mesmo gatilho, nem mais de 1 a cada 8s no total.
- [ ] Nenhuma fala repete a anterior do mesmo gatilho.
- [ ] O gatilho "fome/cansaço" não existe na implementação (verificação negativa: não há referência a fome/sono nesta feature).
- [ ] Balão nunca aparece durante combate ativo (`encounterId` setado) nem durante a tela de evolução.

---

## 2. Elogiar / Repreender / Ignorar

### Objetivo
Comunicação pós-evento (Next Order) que molda um traço de personalidade e influencia a evolução **sem punição letal**.

### O que a sim tem hoje (leitura, confirmado)
**[E]** `evolution.ts`: `ReqStat = "level" | keyof StatBlock`, e `StatBlock = { hp, atk, def, spd }` (`types.ts`). Não há nenhum campo de personalidade/disciplina/afeto em `Entity` hoje. `knowledge/evolution_requirements.json` (pesquisa de referência de outros jogos, não é dado de produção) já registra, com confiança alta, o padrão que inspira esta proposta: Dawn & Dusk usa `"Friendship 60%+"` como requisito de ramo (`from: Agumon, to: GeoGreymon`); Next Order usa condições textuais de personalidade/negligência para desvios de ramo (ex. `"Falha nos requisitos de Champion... com Ataque maior que Sabedoria"`, `"Medidor de cocô no máximo"`) — nenhum desses é morte, são **ramos alternativos**.

### Especificação
- **Dois traços novos, propostos [H]:** `discipline` (0–100) e `affection` (0–100) em `Entity`, fora de `StatBlock` (não é stat de combate). **Dependência de dev:** `ReqStat` precisa aceitar esses dois valores além de `"level" | keyof StatBlock` — mudança de tipo em `evolution.ts`, não feita aqui (só leitura, conforme pedido).
- **Gatilhos de Elogiar/Repreender/Ignorar** (botões de 1 toque, aparecem por 10s após o evento, sem bloquear o jogo; não escolher = Ignorar implícito):
  - Vitória: Elogiar +3 afeto; Repreender +3 disciplina, −1 afeto; Ignorar: sem mudança.
  - Fuga do combate (`endEncounter` com motivo "flee"/"leash", já existe): Elogiar +1 afeto (aceitar a fuga como prudência); Repreender +3 disciplina, −2 afeto (cobrar coragem); Ignorar: sem mudança.
  - Pegar item (via `interact.ts` chest): Elogiar +1 afeto; Repreender não se aplica (sem botão) — pegar item é neutro por natureza.
  - Desobedecer no AUTO: quando o jogador **cancela manualmente** uma ação em curso do parceiro (intent rejeitado, `case "intent_rejected"` já emitido) — só Repreender/Ignorar disponíveis (não houve nada para elogiar); Repreender +4 disciplina, −1 afeto.
  - Decaimento passivo: ambos os traços relaxam 1 ponto a cada 10 min de jogo ativo em direção a 50 (nenhum traço fica puxado para 0/100 só por falta de interação — evita punir quem nunca abre o painel).
- **Efeito na evolução, sem morte:** `EvoPath` (dado de `moves.ts`, hoje `{ to, level, stats? }`) ganha campos opcionais `minAffection?`/`minDiscipline?` **[H, extensão de dado, dependência de dev]**. Regra de design: **o caminho padrão de uma linha nunca tem gate de traço** — só caminhos **alternativos extras** (como `alternate: true` já é usado em `evolution_requirements.json`) podem exigir um traço. Resultado: um parceiro ignorado sempre evolui pelo caminho padrão; só perde acesso ao ramo "melhor cuidado" (mais afeto) ou "mais disciplinado" (mais disciplina), nunca é impedido de evoluir e nunca perde PV/morre por isso.
- **UI:** os botões aparecem no painel do parceiro (reaproveitando a arquitetura de `Panel` do `PANELS_SPEC.md`) e, quando o gatilho é em campo, como 3 ícones pequenos sobre o balão do parceiro (item 1) — Elogiar (👍-pixel), Repreender (👎-pixel), Ignorar = deixar expirar.

### Prioridade / Dependências / Esforço
- **P1.** Dependências: dev (campo `discipline`/`affection` em `Entity`+save, extensão de `ReqStat`/`EvoPath`, hook nos eventos já emitidos), arte (2 ícones novos: elogiar/repreender). Esforço **[H]:** ~3–4 dias de dev (toca estrutura de dado + save), design já fecha a tabela de pesos acima.

### Critérios de aceite
- [ ] Nenhum caminho de evolução **padrão** (sem `alternate`) tem gate de `minAffection`/`minDiscipline` — só ramos alternativos.
- [ ] Nenhuma ação de Repreender/Ignorar reduz PV, aplica dano ou impede evolução — só afeta os dois traços.
- [ ] `discipline`/`affection` persistem no save e decaem em direção a 50 sem interação, nunca saturam em 0/100 por omissão.
- [ ] O painel do parceiro mostra os dois traços com barra (0–100), sempre visíveis, nunca escondidos.

---

## 3. Ficha holográfica + árvore de evolução com %

### Objetivo
Substituir a "ficha dashboard admin" (achado do `UI_WORLD_AUDIT.md`) por uma leitura de instrumento (Time Stranger: holograma em anel de scanner) com a árvore de evolução e a % de progresso de cada caminho (Super Rumble).

### Dados reais disponíveis (confirmado em `evolution.ts`)
**[E]** `statusesOf()`/`pathStatuses()` já calculam, para a espécie atual, todo `PathStatus { path, reqs: ReqCheck[], eligible }`, e cada `ReqCheck { stat, need, have, ok }` traz nível e stats atuais vs. exigidos. **A % de cada caminho é uma leitura direta disso, não um cálculo novo:**

```
% do caminho = (Σ min(have/need, 1) por requisito) / nº de requisitos × 100
```
Ex.: um caminho que pede Nível 16 e ATK 55, com o parceiro em Nível 12 e ATK 40: `(12/16 + 40/55) / 2 × 100 ≈ 61%`. Quando `have ≥ need` em todos os requisitos, a % é 100% e `eligible = true` (mesmo campo que já existe). `forksAhead()` já lista quais espécies adiante têm ramificação, para desenhar a árvore sem percorrer o grafo na UI.

### Layout
- **Ficha (painel "Digimon" do Equipe & Box, `P8_HUD_V2_SPEC.md` §5, moldura herdada):** retrato do Digimon dentro de um **anel de scanner** (CSS: `border-radius:50%` com `conic-gradient` girando lentamente, ou um sprite-anel animado — decisão de implementação de game-dev/game-art), não um card quadrado. Abaixo: atributo/tipo/estágio (já existentes em `SpeciesDef`), resistência por elemento (`affinity`, já existe), stats atuais com barra.
- **Árvore de evolução (aba nova dentro do mesmo painel, ou painel próprio "Evolução"):** nós = espécies (`forksAhead` + caminhos de `moves.ts.paths`), ligados por linhas; cada nó mostra **% calculada acima** sobre um anel de progresso de 24px (mesmo princípio do mostrador circular já especificado em `HUD_IDENTITY_V3.md` §3.2 para a Fonte dos Desejos — reaproveita o componente). Nó elegível (100%) com destaque dourado (`--ui-gold`, nível 2 "seleção" do P8 §3); nó com requisito de traço (item 2) mostra um ícone pequeno de cadeado-traço em vez de cadeado de nível, para diferenciar "falta nível/stat" de "falta afeto/disciplina".
- **Requisito que falta:** ao passar o mouse/toque num nó não elegível, mostra a lista de `ReqCheck` com `ok:false` em texto (`REQ_PT` já traduz os nomes) — não esconde o que falta.

### Prioridade / Dependências / Esforço
- **P0.** Depende só de dados já existentes em `evolution.ts` (sem extensão, exceto o cadeado de traço do item 2, que pode entrar depois). Dependências: dev (nova view no painel, componente de anel de progresso reaproveitado), arte (holograma/anel do retrato — 1 efeito visual, não 1 sprite por Digimon). Esforço **[H]:** ~2 dias de dev para a árvore com dado já pronto; o anel/holograma do retrato é o item mais caro (efeito visual novo).

### Critérios de aceite
- [ ] A % exibida em cada nó é calculada só a partir de `pathStatuses()`/`ReqCheck` já existentes — nenhum número nasce de uma fórmula paralela.
- [ ] Um caminho com `eligible: true` sempre mostra 100%, mesmo que algum stat esteja acima do mínimo.
- [ ] O requisito que falta (texto, `REQ_PT`) está sempre acessível a partir do nó, sem precisar abrir um 3º menu.
- [ ] A árvore usa `forksAhead` para saber onde ramificar — nenhuma ramificação é hardcoded na UI.

---

## 4. Kit de UI "circuito digital"

### Objetivo
Dar a linguagem visual de Next Order (molduras chanfradas + linhas de circuito + ciano/azul) ao sistema de moldura já aprovado, sem reabrir a decisão de chanframento em si.

### O que já está decidido (herdado, não reaberto)
**[E]** `P8_HUD_V2_SPEC.md` §1.3/§2 já define: paleta funcional reaproveitada de `--ui-gold/green/cyan/red/dim` (Endesga-32), 3 níveis de moldura **chanfrada** via `clip-path` (nunca `border-radius`), 9-slice "quando a moldura vier de imagem" (§2.3). Este item não troca a geometria do chanfro nem a paleta base — **adiciona a decoração "circuito"** sobre essa base e define as peças concretas para game-art produzir.

### Especificação — peças 9-slice para game-art
| Peça | Tamanho base | Conteúdo | Onde entra |
|---|---|---|---|
| `frame_l2_circuit_9slice.png` | 48×48px, bordas 8px | Moldura nível 2 (já chanfrada) **+ 1 linha de circuito** correndo por dentro da borda (traço 1px, `--ui-cyan`, com 2–3 "nós" quadrados de 2px nos cantos, como uma trilha de placa) | Substitui a textura-base da moldura nível 2 em todo lugar que `P8_HUD_V2_SPEC.md` já usa nível 2 (painéis, modais) — **mesma posição, outra textura**, igual ao princípio do `HUD_IDENTITY_V3.md` |
| `frame_l1_circuit_combat_9slice.png` | 32×32px, bordas 6px | Moldura nível 1 (combate, já reativa por PV) + circuito mais fino (0,5–1px visual) para não competir com a cor reativa de PV | Barras de PV/retratos em combate |
| `node_pip_circuit.png` | 6×6px | Um "nó" de circuito isolado (quadrado com 1px de brilho `--ui-cyan`), para marcar pontos de notificação (reaproveita o conceito de pip do `HUD_IDENTITY_V3.md` §2.1, agora com textura de circuito em vez de círculo liso) | Pips do hub radial, badges de painel |
| `divider_circuit_h.png` | 64×4px (tileable horizontal) | Linha fina de circuito para separar seções dentro de um painel (ex. entre cabeçalho e corpo do modal) | Painéis do `PANELS_SPEC.md` (Guilda, Correio, etc.) |

- **Paleta:** reaproveita só `--ui-cyan` (`#2ce8f5`) e `--ui-dim`/fundo escuro já existentes — **nenhuma cor nova**. O "ciano/azul" do estudo já é a cor de raridade "Raro" do sistema atual, o que dá consistência em vez de introduzir uma 5ª paleta.
- **Regra para game-art:** o circuito é sempre uma decoração **dentro** da moldura chanfrada (nunca muda o contorno/clip-path), para que qualquer elemento que já herdou o nível 2/1 do P8 ganhe a textura só trocando a imagem 9-slice — sem mudar CSS de layout.

### Prioridade / Dependências / Esforço
- **P1.** Dependências: arte (as 4 peças acima, 9-slice), dev (troca de textura de fundo onde a moldura já é referenciada por imagem — nenhuma mudança de clip-path/CSS de posição). Esforço **[H]:** 1–2 dias de arte para as 4 peças; dev é baixo (troca de asset).

### Critérios de aceite
- [ ] Nenhuma peça nova muda o clip-path/geometria de chanfro já definida pelo P8 — só a textura dentro da borda.
- [ ] As 4 peças usam só `--ui-cyan` e os tons de fundo já existentes — nenhuma cor nova introduzida.
- [ ] `frame_l2_circuit_9slice.png` e `frame_l1_circuit_combat_9slice.png` são fatiáveis em 9-slice sem distorcer o traço do circuito nos cantos (teste visual em pelo menos 2 tamanhos de painel diferentes).

---

## 5. Selvagem Líder

### Objetivo
Variante maior, rara e com aura entre os selvagens comuns (DMO), com recompensa melhor — adaptado ao schema de encontros do GS-012.

### Especificação sobre a tabela real (`digimon-forest-01.json`)
**[E]** O schema já suporta `mode: "visible"` com `rarity`, `weight`, `levels`, e um bloco `visible: { spot, behavior, detectRadiusTiles, loseRadiusTiles, fightable, respawn, maxAlive }` (visto nas entries `dorumon-pedras`, `patamon-oculta`). Proposta: um novo campo opcional **[H]** por entry, `leader?: { scaleMult: number; auraColor: string; rewardMult: number }`, aplicável a entries `mode: "random"` **existentes** (não precisa de uma entry nova por Líder — é uma variante de uma espécie já no roster da região).

- **Regra de seleção:** quando uma entry `random` é sorteada, há uma chance adicional e pequena (`leaderChance`, proposto **[H] 3%**, independente do peso normal) de o spawn nascer como Líder daquela mesma espécie — nunca substitui o roll normal, só promove o resultado já sorteado.
- **Visual:** `scaleMult` (proposto **[H] 1,3×**) no sprite + aura (círculo semitransparente `auraColor` sob os pés, mesma camada do "anel de alvo" já especificado em `P8_HUD_V2_SPEC.md` §4.3 — reaproveita o princípio de desenho, cor diferente: `--ui-gold` para destacar de qualquer anel de combate em `--ui-red`). Nome exibido com sufixo "Líder" (ex. "Gigimon Líder").
- **Nível:** topo da faixa já definida na entry (`levels: [a,b]` → Líder sempre nasce em `b`, não em `a`), para ser reconhecível como "o grande" sem inventar uma faixa de nível paralela.
- **Recompensa:** `rewardMult` (proposto **[H] 2×** bits/XP da vitória normal daquela espécie/nível) — reaproveita o evento `reward` já existente, só multiplicando o valor, sem sistema de loot novo.
- **Raridade dentro da raridade:** um Líder de uma entry `rare`/`very_rare` já é raro por si (herda o peso baixo da entry) — `leaderChance` se aplica igual a todas, o próprio peso da entry já regula a frequência total.

### Prioridade / Dependências / Esforço
- **P2.** Dependências: dev (campo `leader` no schema + lógica de promoção no spawn + aura visual), arte (nenhuma nova — reaproveita sprite existente em escala maior + aura é CSS/canvas, não sprite). Esforço **[H]:** ~1–2 dias de dev.

### Critérios de aceite
- [ ] Um Líder só nasce a partir de uma entry que já existe na tabela (nenhuma entry nova obrigatória) — é uma promoção pós-sorteio, não um 2º sistema de spawn.
- [ ] O multiplicador de recompensa usa o mesmo evento `reward` existente — nenhum caminho de concessão novo.
- [ ] O Líder nasce sempre no topo da faixa de nível da sua entry (`levels[1]`), nunca abaixo.
- [ ] A aura usa `--ui-gold`, nunca a mesma cor do anel de alvo de combate (`--ui-red`), para não confundir os dois sinais.

---

## 6. Ordens táticas no AUTO

### Objetivo
Dar ao jogador 3–4 ordens simples sobre o combate automático (Next Order "Order Power"), sobre a estrutura real de `AutoRule` já existente.

### O que `AutoRule` já faz (confirmado em `moves.ts`/`types.ts`)
**[E]** `AutoRule { moveId; cond: "always"|"target_hp_below_pct"|"self_hp_below_pct"|"ally_hp_below_pct"|"buff_not_active"; pct?; off? }` decide **qual golpe usar**, por prioridade de lista (`chooseMove()`). A **escolha de alvo** é separada, hoje em `findAutoTarget()` (`world.ts`): sempre o inimigo vivo mais próximo dentro do raio de aggro — não há hoje seleção por "mais fraco" nem noção de "defender"/"recuar".

### Especificação — 4 ordens, sobre a estrutura existente
Proposta **[H]**: um campo novo `orderMode` no estado do jogador (não em `AutoRule`, que é por golpe — a ordem é por combate), com 4 valores, acionados por um seletor de 4 ícones no Digivice (hub radial, `HUD_IDENTITY_V3.md` Alt A, ou painel de Equipe):

| Ordem | Efeito em `findAutoTarget` (dependência de dev) | Efeito em `chooseMove`/`AutoRule` |
|---|---|---|
| **Atacar o mais fraco** (padrão) | Entre os candidatos já filtrados por raio/leash, escolher o de **menor `hp` atual** em vez do mais próximo | Sem mudança — usa as `AutoRule` já configuradas pelo jogador |
| **Defender** | Alvo = o inimigo mais próximo **do Tamer** (não do parceiro) dentro do raio, mesmo que mais longe do parceiro — prioriza proteger o jogador | Sem mudança |
| **Usar o golpe forte** | Sem mudança no alvo | Ignora a ordem normal de `AutoRule` por 1 ciclo e força o golpe de maior `power` entre os equipados e prontos (`moveReady` já existe) — não precisa de edição permanente da lista de `AutoRule` do jogador |
| **Recuar** | Nenhum alvo é escolhido (retorna `undefined`); o parceiro entra no mesmo estado `RETURN` que já existe para selvagens em fuga, voltando para perto do Tamer | Sem mudança (sem alvo, não há golpe a escolher) |

- **UI:** 4 ícones pequenos (32×32px, moldura nível 2 do P8, reaproveitando a decoração do item 4) num trilho fixo do painel de Equipe ou dentro do hub radial — clique troca `orderMode` imediatamente, sem pausar o jogo. O ícone ativo fica com borda `--ui-gold` (estado "seleção" já padronizado).
- **Sem gesto novo:** nenhuma tecla nova — é um clique num ícone, mesma convenção dos atalhos já existentes.

### Prioridade / Dependências / Esforço
- **P1.** Dependências: dev (extensão de `findAutoTarget`, 1 novo ramo em `chooseMove` para "golpe forte", estado `RETURN` reaproveitado para "Recuar"), arte (4 ícones novos no pipeline de `icons.ts`). Esforço **[H]:** ~2 dias de dev (a lógica de alvo já existe, é um `switch` por `orderMode` em cima dela).

### Critérios de aceite
- [ ] `orderMode` nunca cria uma 2ª lista de `AutoRule` paralela — "Usar o golpe forte" e "Recuar" afetam só a escolha de alvo/golpe de 1 ciclo, as `AutoRule` do jogador continuam intactas.
- [ ] "Recuar" reaproveita o estado `RETURN` já existente (mesma regeneração/retorno ao `home`) — nenhum estado novo de movimento é criado.
- [ ] Trocar a ordem nunca interrompe um encontro em andamento (`encounterId`) de forma abrupta — só muda a decisão do próximo ciclo de IA.
- [ ] Os 4 ícones refletem, em tempo real, qual ordem está ativa (teste visual: trocar e ver o destaque mudar sem recarregar o painel).

---

## 7. Elemento-assinatura por região

### Objetivo
Dar a cada região um "estranho no meio do natural" (brinquedos gigantes, cristais de dados) em vez de bioma genérico, para as 6 regiões do `GDD_MMO_V1.md` §1.2.

### Lista de props-assinatura (para game-art, por região)
**[E]** Regiões e nível/tema confirmados em `docs/GDD_MMO_V1.md` §1.2.

| Região | Tema oficial [E] | Elemento-assinatura proposto [H] |
|---|---|---|
| **Vila dos Bebês** | Village of Beginnings (hub, zona segura) | **Brinquedos gigantes** (Super Rumble): blocos com letras, ursos de pelúcia, galinha de corda, em escala maior que os moradores — reforça "hub acolhedor", sem perigo |
| **Floresta Densa** | Tropical Jungle + Unwavering Forest | **Cristais de dados** brotando das raízes das árvores (já citado no estudo) + **totens de circuito** (placas verticais com o motivo do item 4) marcando trilhas — substitui "floresta genérica com cristais ciano" já identificada como problema |
| **Praia dos Postes** | Litoral de File Island, postes/colunas no mar | **Postes/colunas de dados** emergindo da água (o próprio nome da região já descreve o elemento — reforçar com luz ciano pulsante no topo de cada poste, ligando ao tema "circuito" do item 4) |
| **Montanha** | Outlook Mountain + Infinity Mountain + Ancient Dino Region | **Formações rochosas com veios de dados** (rocha normal cortada por linhas de circuito brilhantes, como uma falha geológica digital) + ninhos/ossadas de Digimon tipo Dino (Ancient Dino Region), sem criatura nova — só cenário |
| **Deserto** | Gear Savannah (savana mecânica árida) | **Engrenagens/sucata enterradas na areia** (parcialmente visíveis, como ruínas) + patrulhas de sentinelas mecânicas menores já previstas no GDD como ambientação, não só selvagem |
| **Zona Corrompida** | Devimon's Mansion + Dark Area | **Cristais de dados corrompidos** (mesma base da Floresta, paleta invertida: rachaduras vermelhas/pretas em vez de ciano) + vegetação com flag `corrupted` do GDD §1.2 visualmente murcha/escurecida |

### Prioridade / Dependências / Esforço
- **P1 para Floresta/Praia/Vila (regiões que já têm mapa, `UI_WORLD_AUDIT.md` confirma); P2 para Montanha/Deserto/Zona Corrompida (ainda sem mapa nesta prova, por `worldmap.ts` "ainda não têm mapa").** Dependência: só arte (props de cenário, reaproveitando o pipeline de tileset/objeto já usado em `forest-proof`). Esforço **[H]:** 2–4 props por região, variável por região.

### Critérios de aceite
- [ ] Cada região tem pelo menos 1 prop-assinatura reconhecível a distância (não um ajuste de paleta só) — critério visual, verificado por screenshot comparando antes/depois.
- [ ] Zona Corrompida reaproveita a base visual da Floresta (mesmo cristal, paleta invertida) — não é um asset 100% novo, confirmando a flag `corrupted` já prevista no GDD como reaproveitamento de dado.
- [ ] Nenhuma região usa o prop-assinatura de outra região (teste de unicidade visual simples).

---

## 8. Mapa-múndi ilustrado

### Objetivo
Substituir o grafo de nós (`worldmap.ts`, achado do `UI_WORLD_AUDIT.md` §2.6: *"é um grafo de nós, puro diagrama técnico"*) por um terreno pintado visto de cima, com ícones, portais, estados e relógio/calendário — referência Super Rumble.

### O que existe hoje (confirmado em código)
**[E]** `worldmap.ts`: posições `POS` fixas em %, `<line>` de SVG ligando nós, cada nó é uma `<div class="wm-node">` com nome/faixa de nível/estado/botão "Viajar". Lógica de desbloqueio (`canTravel`, `unlockState`) e dados de região (`REGIONS`, nome/nível/espécies/rota) **ficam exatamente como estão** — este item troca só a camada visual, não a lógica de progressão (mesmo princípio "mesma organização, outro peso visual" do `HUD_IDENTITY_V3.md`).

### Especificação
- **Fundo:** 1 ilustração estática pintada da ilha inteira (file-island-like), vista de cima, nas mesmas posições relativas que `POS` já usa hoje (`vila_dos_bebes`, `floresta_densa`, etc.) — a arte nasce sobre essas 6 coordenadas, para não precisar remapear a lógica de clique/estado.
- **Ícones por região** (resolve a lacuna "sem ilustração ou miniatura", `UI_WORLD_AUDIT.md` + GS-009 §2): cada nó passa a ser uma miniatura/selo (32×32px) com o elemento-assinatura do item 7 (ex. silhueta de cristal para Floresta, poste para Praia) em vez de uma caixa de texto — o texto (nome/nível/estado) vira um **tooltip/label flutuante** ao passar perto do ícone, não uma caixa sempre aberta.
- **Portais nomeados:** pontos de entrada/saída entre regiões conectadas (reaproveita `routesTo`, já existente) ganham um ícone de portal com o nome da rota (ex. "Trilha da Floresta"), como "Starting Village Portal" do Super Rumble — mas sem inventar nome: usa o par região-origem→região-destino já definido.
- **Estados visuais** (mesmos 4 estados que `worldMapHtml` já calcula — `here`/`open`/`nomap`/`locked`): em vez de texto (`"Liberada"`, `"Bloqueada"`), usar o próprio ícone com tratamento visual — aberto (cor plena), aqui (destaque dourado, igual seleção do P8 §3), sem mapa (ícone esmaecido + cadeado "em obras"), bloqueado (ícone esmaecido + cadeado de nível, com o motivo ainda disponível em tooltip, nunca removido — a `unlockState().reason` que já existe continua sendo mostrada, só não mais como rótulo permanente).
- **Relógio/calendário do mundo:** canto da tela do mapa-múndi, mostrando o relógio dia/noite que já existe (Configurações já tem "Tempo do dia: Automático/Sempre dia/Sempre noite", confirmado em `PANELS_SPEC.md` §7) — **não existe calendário de data hoje** (confirmado, nenhum campo de dia/mês na sim); calendário proposto **[H]** como contador simples de "dia N de jogo" (incrementado 1× por ciclo dia→noite→dia já simulado), sem mês/estação nesta versão — suficiente para casar com os encontros condicionados a `weather`/`time` do GS-012, sem inventar um sistema de datas completo.

### Prioridade / Dependências / Esforço
- **P0** (é o gap mais citado pelo `UI_WORLD_AUDIT.md` e pelo GS-009). Dependências: arte (1 ilustração de ilha + 6 miniaturas de região + ícones de portal — trabalho de arte pesado), dev (troca do SVG por imagem de fundo + posicionamento de ícones sobre as mesmas `POS` + contador de "dia N"). Esforço **[H]:** maior item de arte dos 9; dev é médio (reaproveita toda a lógica).

### Critérios de aceite
- [ ] A lógica de desbloqueio/viagem (`canTravel`, `unlockState`) não é alterada — só a camada visual que a representa.
- [ ] Cada região tem uma miniatura distinta (não um ícone genérico repetido) — mesmo critério de unicidade do item 7.
- [ ] O motivo de bloqueio (`reason`) continua acessível (tooltip), nunca removido ao trocar texto por ícone.
- [ ] O contador de "dia N" persiste no save e nunca retrocede.

---

## 9. Cena de evolução nova

### Objetivo
Substituir o "clarão branco genérico" (identificado no `docs/DIGIMON_GAMES_STUDY.md` como estado atual) pela composição de Next Order: fundo de dados, texto binário, faixa "EVOLUTION", anéis de código.

### O que existe hoje
**[E]** A evolução já é um evento de sim totalmente funcional (`evolve-ui.ts`, intents `evolve`, escolha de caminho) — este item propõe só a **sequência visual** que toca quando a evolução é confirmada, sem mudar a lógica de escolha/herança de golpes já especificada em `MOVE_SYSTEM.md` §2.3 (não reaberta aqui).

### Storyboard (quadro a quadro, duração total proposta **[H] ~2,2s**, cortável por "pular")

| Quadro | Tempo | Composição |
|---|---|---|
| **1 — Corte** | 0,0–0,15s | Tela escurece para preto puro (fade 150ms) — mesmo princípio do fade de transição de mapa já existente (`PROJECT_LOG.md` confirma "fade de transição ~0,3s" em outro contexto, reaproveitando a mesma família de timing) |
| **2 — Fundo de dados** | 0,15–0,5s | Fundo ciano-escuro (`--ui-cyan` sobre `#0e101c`) com colunas de texto binário (0/1) descendo em velocidades diferentes (efeito "chuva de dados", 3–4 camadas de profundidade) — silhueta do Digimon atual (antes de evoluir) aparece no centro, em contraluz |
| **3 — Anéis de código** | 0,5–1,1s | 2–3 anéis concêntricos de caracteres (dígitos/hexadecimal) giram ao redor da silhueta, fechando-se progressivamente sobre ela (como um "scan" se completando) — a silhueta vai clareando por dentro (branco quente, não o flash genérico atual: é um preenchimento gradual, não um clarão instantâneo) |
| **4 — Faixa "EVOLUTION"** | 1,1–1,4s | Uma faixa horizontal (banner pixel, tipografia do P8 §1.2) atravessa a tela com a palavra **"EVOLUTION"** (mantida em inglês, é o termo da franquia; se o fundador preferir PT-BR, "EVOLUÇÃO" é a troca direta, decisão de nomenclatura a confirmar) deslizando da esquerda, com um leve motion blur pixelizado — os anéis do quadro 3 continuam girando atrás, mais rápido |
| **5 — Clímax** | 1,4–1,7s | Flash curto (80ms, branco a 70% opacidade, **não 100%** — mantém a composição visível por trás, diferente do clarão atual que apaga tudo) no instante da troca de sprite; o Digimon novo aparece já na pose final |
| **6 — Resolução** | 1,7–2,2s | Anéis e texto binário se dissipam (fade-out 300ms) revelando o Digimon evoluído no mapa, luz residual ciano encolhendo até desaparecer; nome da nova forma aparece em texto (pixel-bitmap 16px, `--ui-gold`) por 0,8s adicional antes de sumir |

- **Reaproveitamento:** nenhum asset de personagem novo — é inteiramente VFX (binário, anéis, faixa, flash), compatível com o pipeline de `vfx_workbench` já disponível ao estúdio para efeitos animados.
- **"Pular":** um toque/clique durante os quadros 2–5 corta direto para o quadro 6 (resolução), sem travar o jogador em uma animação longa repetida — mesmo princípio de respeito ao tempo do jogador já usado em outras transições do jogo.

### Prioridade / Dependências / Esforço
- **P1.** Dependências: game-dev (sequenciador de quadros/timing, reaproveitando o sistema de fade já existente), game-art/VFX (texto binário animado, anéis de código, faixa "EVOLUTION" — produzíveis com `vfx_workbench`). Esforço **[H]:** ~1 dia de design de VFX (via `vfx_workbench`) + integração de dev de ~1 dia.

### Critérios de aceite
- [ ] A sequência não altera a lógica de escolha de evolução/herança de golpes (`evolve-ui.ts`/`MOVE_SYSTEM.md`) — só o que é mostrado entre a confirmação e o resultado.
- [ ] O "pular" (toque/clique) sempre corta para o resultado final (quadro 6), nunca deixa a tela presa num quadro intermediário.
- [ ] O flash do quadro 5 nunca chega a 100% de opacidade (verificação visual: a composição de fundo permanece parcialmente visível no pico).
- [ ] Duração total ≤2,5s sem "pular" (não pode virar uma cutscene longa repetida a cada evolução).

---

## 10. Prioridades consolidadas e ordem de execução sugerida

| Ordem | Item | Prioridade | Por quê primeiro/depois |
|---|---|---|---|
| 1 | 3. Ficha holográfica + árvore % | P0 | Dado 100% pronto em `evolution.ts`, maior ganho de UI por menor risco |
| 2 | 8. Mapa-múndi ilustrado | P0 | Gap mais citado pelo audit/GS-009; dev reaproveita toda a lógica, só a arte é pesada (pode começar em paralelo) |
| 3 | 1. Parceiro fala no mapa | P1 | Barato (texto+ícone+balão), dá vida imediata, sem tocar em sim de combate |
| 4 | 4. Kit de UI "circuito digital" | P1 | Destrava visualmente os itens 3/6 (molduras) e os painéis do `PANELS_SPEC.md` |
| 5 | 2. Elogiar/Repreender/Ignorar | P1 | Precisa de extensão de dado (`ReqStat`/`Entity`), mais caro que o item 1, mas sem dependência de arte pesada |
| 6 | 6. Ordens táticas no AUTO | P1 | Lógica de alvo já existe, é extensão direta; pode andar em paralelo com o item 2 (times de dev diferentes) |
| 7 | 9. Cena de evolução nova | P1 | VFX isolado, sem dependência dos itens acima, mas natural de vir depois da árvore de evolução (item 3) estar pronta para testar o fluxo completo |
| 8 | 7. Elemento-assinatura por região | P1/P2 | P1 para as 3 regiões com mapa hoje; P2 para as 3 sem mapa, que ainda não têm onde colocar o prop |
| 9 | 5. Selvagem Líder | P2 | Menor impacto de UX isolado, depende só de GS-012 (já maduro) — bom "preenchimento" entre as entregas maiores |

---

## 11. Limitações

- **Nenhuma arte foi produzida** em nenhum dos 9 itens — tudo aqui é especificação para game-art/game-dev produzirem.
- **Nenhum código foi alterado.** `evolution.ts`, `evolution_requirements.json`, `moves.ts`, `world.ts`, `worldmap.ts` e `digimon-forest-01.json` foram só lidos para fundamentar esta spec.
- **Números [H]** (percentuais, cooldowns, multiplicadores, `leaderChance`, duração da cena de evolução) são primeira proposta de design, não calibrados jogando — mesmo padrão `[H]` já usado em `MOVE_SYSTEM.md`/`PANELS_SPEC.md`.
- **Dependências de extensão de tipo** (item 2: `ReqStat`/`EvoPath`/`Entity`; item 5: campo `leader` no schema de encontros; item 6: `orderMode`) exigem decisão/implementação de game-dev antes de a UI poder ser construída — nenhuma delas é um "só CSS".
- **`knowledge/evolution_requirements.json`** é dado de pesquisa de referência de outros jogos (`line_id: agumon/gabumon`, confiança variável), não um dado de produção do GS-003 — usado aqui só como evidência do padrão "traço de personalidade como gate de ramo alternativo", não como fonte de números a copiar.
- **Item 7 (regiões sem mapa):** Montanha, Deserto e Zona Corrompida ainda não têm mapa implementado nesta prova (`worldmap.ts` confirma) — a lista de props-assinatura é válida desde já, mas só pode ser aplicada quando esses mapas existirem.
- **Nomenclatura não validada com o fundador:** "EVOLUTION" vs. "EVOLUÇÃO" (item 9), nomes dos traços "disciplina"/"afeto" (item 2) e `leaderChance`/`rewardMult` (item 5) são placeholders de design, substituíveis sem custo.
