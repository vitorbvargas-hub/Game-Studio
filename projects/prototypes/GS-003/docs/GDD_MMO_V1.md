# GDD_MMO_V1 — GS-003: mundo, quests, dungeons, world boss, arena e economia

- **Autor:** game-design (subagente) · **Data:** 2026-11-08
- **Pedido do fundador:** "mundo vivo, floresta densa, exploração em grid, automação e evolução automática e offline, arena PvP, world bosses, dungeons, quests, vários jogadores e Digimon juntos e combate no próprio mapa." (ADR-010)
- **Fontes internas:** ADR-007 (fan game, sem monetização), ADR-009 (reset Idle MMORPG, combate no mapa), ADR-010 (referência visual canônica IdleDex/Drakantos/Digimon), `docs/MOVE_SYSTEM.md` (4 slots de golpe, learnsets, elemento), `docs/WORLD_COMBAT_VISUAL_SPEC.md` (FSM de combate no mapa, eventos confirmados), `teardowns/IDLEDEX.md` (estrutura de MMO idle, calendário de eventos, retenção, risco de IP), `prototype/MODES_AND_ROADMAP.md` (especificação anterior de Arena Clássica e Arena de Ação — **este documento a reclassifica como EVENTO do jogo, não modo permanente**, por pedido do fundador), `prototype/world/README.md` (estado real implementado: save, offline, Auto-evoluir, sistema de golpes, forest-v4).
- **Fontes externas (Digimon oficial):** Wikimon (`wikimon.net`), verificado via `web_fetch` em 2026-11-08 — páginas citadas por item abaixo. `web_search` não estava disponível nesta sessão; toda verificação externa foi feita por `web_fetch` direto em URLs do Wikimon.
- **Escopo:** v1 do GDD de MMO para o protótipo local (`prototype/world`). Cobre os 8 pontos pedidos. Roster-base: as 12 espécies já em `src/data/world-species.json` (linhas Guilmon, Agumon, Gabumon, Patamon — todas Virus na linha Guilmon, demais conforme pacote `digimon-fan`).

---

## 0. Estado atual vs. este documento

**[E, `prototype/world/README.md`]** Hoje existem: sim autoritativa com combate no mapa, save local versionado, progresso offline com teto de 4h, Auto-evoluir, sistema de golpes de 4 slots com 70 golpes/15 arquétipos de VFX, 1 mapa (`forest-proof`, floresta densa) com até 4 jogadores (1 local + 3 bots), ciclo dia/noite. **Não existem ainda:** outras regiões, quests, dungeons, world boss, arena (nem Clássica nem de Ação — o `arena-spike` está congelado desde o ADR-009), varredura/captura real (hoje é placeholder: "4 vitórias = capturado"), mercado, servidor.

Este GDD especifica os sistemas que faltam, com dados de exemplo em `prototype/world/src/data/content/*.json`, prontos para o game-dev consumir. Nada aqui está implementado.

---

## 1. Mundo e regiões

### 1.1 Tema e fonte canônica

**[E, `wikimon.net/File_Island`]** File Island (ファイル島) é a ilha do Mundo Digital onde se passa a saga original de Digimon Adventure, dividida em áreas de paisagem muito distinta. As áreas oficiais listadas pelo Wikimon para File Island na anime incluem: Tropical Jungle, Ancient Dino Region, Unwavering Forest, Village of Beginnings, Dragon Eye Lake, Outlook Mountain, Gear Savannah, Pyocomon Village, Factorial Town, Sewers, Misty Trees, Toy Town, Freezeland, Great Canyon, Overdell Cemetery, Devimon's Mansion e Infinity Mountain.

As 6 regiões abaixo (pedidas pelo fundador: Floresta Densa, Praia dos Postes, Vila dos Bebês, Montanha, Deserto, Zona Corrompida) foram mapeadas sobre esse conjunto oficial, sem inventar geografia nova onde já existe uma área canônica equivalente. **Exploração em grid**, como pedido: cada região é um mapa de tiles com sub-áreas, seguindo o mesmo padrão de `forest-proof.tmj.json`/`gen-forest-proof.mjs` já implementado (autotile de 16 peças, clareiras, trilhas, spawns por área).

### 1.2 As 6 regiões

| Região | Área(s) oficial(is) | Nível | Desbloqueio | Selvagens | Chefe de região |
|---|---|---|---|---|---|
| **Vila dos Bebês** (hub inicial) | Village of Beginnings / Village of Beginnings (はじまりの街) **[E]** | 1–5 | Disponível desde o início (hub, não precisa desbloquear) | Botamon, Punimon, Poyomon, Yuramon (Baby I, não-agressivos) **[E, moradores confirmados]** | Nenhum (zona segura). Guardiã: **Elecmon** |
| **Floresta Densa** | Tropical Jungle + Unwavering Forest **[E]** | 1–15 | Nenhum (região inicial de exploração, acessível a pé a partir da Vila) | Gigimon, Koromon, Tsunomon, Tokomon (Baby II, Lv.1–5); Guilmon, Agumon, Gabumon, Patamon (Child, Lv.5–12) — roster atual | **Kuwagamon** (Lv.15) |
| **Praia dos Postes** | Litoral de File Island (visual icônico do anime: postes/colunas saindo do mar na praia, ep. 1) **[H] nome não-oficial** — ver Limitações | 10–25 | Lv.10 OU derrotar Kuwagamon 1x | Tsunomon, Gabumon (Child→Adult, Lv.10–20); Growlmon raro (Lv.18–25) | **Shellmon** (Lv.25) |
| **Montanha** | Outlook Mountain + Infinity Mountain + Ancient Dino Region **[E]** | 20–35 | Lv.20 + derrotar Kuwagamon | Growlmon (Lv.20–28), Greymon (Lv.22–30) | **Tyrannomon** (Lv.35) |
| **Deserto** | Gear Savannah, reinterpretada como savana mecânica árida **[E área; H reinterpretação "deserto"]** | 30–45 | Lv.30 + derrotar Shellmon | Garurumon (Lv.30–38), Angemon (Lv.32–40), patrulhas de sentinelas mecânicas menores | **Guardromon** (Lv.45) |
| **Zona Corrompida** | Devimon's Mansion + Dark Area, dentro de File Island **[E]** | 40–55 | Lv.40 + derrotar Tyrannomon e Guardromon | Growlmon/Greymon/Garurumon/Angemon "corrompidos" (mesmas espécies do roster, com a flag `corrupted`: +15% ATK, −10% DEF, sempre agressivos — reaproveita dado existente, sem criaturas novas) **[H] mecânica de corrupção** | **Devimon** (Lv.55). World Boss (Mega, servidor): **VenomMyotismon** — ver §4 |

### 1.3 Rotas (grafo de ligação)

```
Vila dos Bebês (hub) ── Floresta Densa ── Praia dos Postes (ramal lateral)
                              │
                          Montanha ── Deserto ── Zona Corrompida
```

**[H]** Cada rota é um corredor de tiles (como a trilha de `forest-proof`) com um portão de nível/quest (§2.3) — não é um loading de mapa diferente; andar até a borda do mapa troca a cena (`sceneId`) do mesmo jeito que `?map=` já faz hoje, mas com o grid contínuo visualmente (trilha leva direto à borda da próxima região).

### 1.4 Exploração em grid

**[E, `teardowns/IDLEDEX.md` §2, §7]** Como no IdleDex: mapa top-down 2D com o jogador e a parceira andando em um grid de tiles, minimapa com rótulo de região e coordenadas (já implementado em `ui/minimap.ts`), e uma HUD inferior com atalhos. **[E, já implementado]** O protótipo atual já usa exatamente esse padrão (`forest-proof`, grid de autotile, minimapa, HUD inferior) — as 5 regiões novas seguem o mesmo gerador de mapa (`gen-forest-proof.mjs` generalizado para aceitar um bioma por região: floresta, praia, vila, montanha, deserto, zona corrompida), trocando só o pacote de tiles (`03-environments/<bioma>/`) e a tabela de spawn.

---

## 2. Quests

### 2.1 Principal — arco "O Pulso Corrompido" (original)

**[H] Enredo 100% original**, sem copiar a trama de Digimon Adventure (Engrenagens Negras/Devimon como vilão mestre). Usa Digimon e locais **oficiais** (permitido pelo ADR-007) como população do mundo, não como réplica do roteiro: o antagonista e o MacGuffin da história são inventados pelo estúdio; Devimon e VenomMyotismon aparecem como chefes do mundo (papel consistente com o personagem oficial), não como "vilão mestre que usa Engrenagens Negras".

| Cap. | Região | Gancho | Objetivo | Recompensa |
|---|---|---|---|---|
| 0 — Tutorial | Vila dos Bebês | Elecmon nota Digitamas chocando fora de hora e pede ajuda | Escanear/recrutar o primeiro parceiro | Parceiro inicial, 100 bits |
| 1 | Floresta Densa | Selvagens anormalmente agressivos | Investigar e derrotar Kuwagamon | 500 bits, item de evolução comum |
| 2 | Praia dos Postes | A maré traz um "Fragmento de Código" **[H, item original]** | Recuperar o fragmento; afastar Shellmon | 800 bits, Digivice Avançado (item de captura, §6) |
| 3 | Montanha | Os fragmentos emitem um sinal rumo a Infinity Mountain | Derrotar Tyrannomon, que reage ao sinal | 1.200 bits, slot extra de equipe |
| 4 | Deserto | O sinal leva à Savana das Engrenagens, guardada por sentinelas | Derrotar Guardromon, comandante das sentinelas | 1.600 bits, item raro de evolução |
| 5 | Zona Corrompida | O "Pulso Corrompido" está sendo amplificado por Devimon | Confrontar e derrotar Devimon | 2.500 bits, título cosmético "Guardião do Pulso" |
| Epílogo | — | O Pulso atinge escala crítica | Gancho não resolvido: a amplificação desperta VenomMyotismon como World Boss (§4) — não há "vitória final", o arco principal **abre** o conteúdo de fim de jogo | — |

### 2.2 Diárias (3 por dia)

**[E, padrão identificado em `teardowns/IDLEDEX.md` §5]** Pool de templates, sorteia 3/dia, renovam a cada 24h (horário do servidor; no local, à meia-noite do relógio do jogo):

| Template | Recompensa [H] |
|---|---|
| Derrote N selvagens em `<região>` (N = 10–20, por nível) | 150 bits + 50 XP |
| Capture N Digimon (N = 2–4) | 200 bits + 1 item comum |
| Vença 1 desafio na Arena Clássica | 100 bits + 5 pontos de temporada |
| Complete 1 andar de dungeon | 120 bits |
| Cause dano no World Boss (se a janela estiver ativa) | 150 bits (empilha com a recompensa de participação do §4) |

### 2.3 De rota (desbloqueio)

**[H]** Cada transição de região da tabela §1.2/§1.3 é também uma quest: "Derrote `<chefe da região anterior>`" ou "Alcance nível N". A quest de rota e o capítulo correspondente do arco principal são a **mesma** entrada de progresso (não há duplicidade de chefão): vencer Kuwagamon conta como capítulo 1 **e** quest de rota para Montanha/Praia.

### 2.4 De coleção (Digivice/bestiário)

**[E, inspirado em IdleDex §2 "+0,05%/espécie, teto +30%"]** Cada espécie escaneada (ver §6) conta para o bestiário (Digivice). Marcos de coleção:

| Marco | Recompensa [H] |
|---|---|
| Primeiro escaneamento de uma espécie | +50 bits (único, por espécie) |
| 5 espécies escaneadas | +0,5% de taxa de captura permanente |
| 12/12 espécies do roster atual | +6% de taxa de captura total, cosmético exclusivo "Digivice Dourado" |
| (expansível por fase, conforme novas espécies entram no roster) | escala proporcional |

---

## 3. Dungeons

### 3.1 Estrutura (andares + HP persistente)

**[E, precedente de design já registrado em `prototype/MODES_AND_ROADMAP.md` §1.5, citando `teardowns/POKE2DARENA.md`: "HP carries over between floors"]** Uma dungeon é uma instância de N andares. O HP do time **não** se restaura entre andares (exceto por itens de cura obtidos como loot ou um único ponto de cura fixo antes do chefe final, por run). Cada andar tem encontros fixos (não é spawn aleatório contínuo como no mapa aberto); ao limpar os encontros do andar, libera a escada/porta para o próximo.

- Em **ao menos 1 andar por dungeon** (tipicamente o do meio), o jogador escolhe entre 2 rotas antes do chefe final: uma com mais combate e mais loot, outra mais curta e mais segura. A escolha é um intent do jogador (ou do AUTO, ver §3.3), não uma mudança de cena.
- O **chefe final** sempre está no último andar; a derrota dele fecha a instância e distribui o loot.
- **Loot:** bits (quantia fixa + variável por sorte), item de evolução (chance baixa a média), item raro (chance baixa, só no chefe final).

### 3.2 Exemplos de dados (ver `dungeons.json`)

| Dungeon | Região | Nível | Andares | Chefe final | Observação |
|---|---|---|---|---|---|
| **Cripta das Raízes** | Floresta Densa | 10–18 | 5 | Kuwagamon Ancião (variante elite, Lv.18) | Branch no andar 3: Câmara do Tesouro (mais loot) vs. Passagem Oculta (atalho) |
| **Ninho de Engrenagens** | Deserto | 35–45 | 6 | Guardromon Comandante (Lv.45) | Branch no andar 4; andar 2 tem um dano ambiental fixo (armadilha de 5% do HP máximo) |

### 3.3 AUTO em dungeon

**[H]** O mesmo gambit do AUTO de campo (`MOVE_SYSTEM.md` §2.5) se aplica ao combate dentro da dungeon. Para a navegação por andares e pela bifurcação de rota, o AUTO usa uma heurística simples:
1. Antes de cada andar: se HP do time > 60%, escolhe a rota de mais loot; se ≤ 60%, escolhe a rota mais curta.
2. Antes do chefe final: se HP do time < 15%, o AUTO recua da instância (sem penalidade além de não completar) em vez de arriscar a derrota; o jogador pode desligar essa salvaguarda manualmente.
3. Fora da bifurcação, o AUTO simplesmente avança andar a andar, como já faz no mapa aberto.

### 3.4 Em grupo (até 4 jogadores)

**[H]** Uma dungeon pode ser aberta por um grupo de até 4 jogadores na mesma instância (mesmo contrato de `remote_player`/`remote_partner` já existente em `WORLD_COMBAT_VISUAL_SPEC.md` §2, §7):

- **HP é por jogador**, não compartilhado — a parceira de cada jogador tem sua própria barra; a derrota de um jogador não termina a instância para o grupo.
- **Loot é por jogador** (sem roubo de item entre membros), rolado individualmente ao fim de cada andar e no chefe final.
- **O chefe final escala HP (+40% por jogador adicional a partir do 2º, `[H]`)**, mas não escala dano — isso facilita o grupo sem punir quem joga sozinho.
- A bifurcação de rota é decidida pelo grupo (voto simples: quem chegar primeiro à bifurcação decide, ou votação de maioria — detalhe de UI a definir, não um novo sistema).

---

## 4. World Boss

### 4.1 Conceito

**[E, `teardowns/IDLEDEX.md` §4: "World Boss (anunciado na hora)", "Mega Boss semanal"]** Um chefão com **HP único**, visível e compartilhado por todos os jogadores conectados, em uma janela de horário fixa. Dano causado por cada jogador conta para (a) abater o HP global e (b) o ranking de contribuição daquele jogador, que define a faixa de recompensa.

### 4.2 Versão local (agora, sem servidor)

**[H]** Enquanto não há servidor (§7, Fase 2+), o World Boss roda **localmente**, como teste do sistema antes de existir o compartilhamento real:
- HP "global" = HP da instância local do próprio jogador (não é de fato compartilhado, porque não há outros jogadores reais além dos bots).
- Janela de horário **simulada**: um botão "Despertar o Chefão" disponível 1x por dia de jogo (ou a cada 3h de jogo com o AUTO ligado, equivalente ao ritmo de "evento recorrente" do IdleDex).
- Dano por contribuição = 100% do dano causado pelo próprio jogador (sem outros jogadores reais para dividir).
- Recompensa de participação = recompensa cheia, já que o jogador é o único "contribuinte".
- Serve para validar a UI, o ritmo e o balanceamento de HP/dano antes de existir servidor real.

### 4.3 Versão servidor (futuro, exige Fase 2+3 do §7)

**[H]**
- HP único por região, visível a todos os jogadores online na região (ou no servidor, se o jogo tiver servidor único).
- Janela de horário fixa e anunciada (ex.: diária 20h–21h, ou 2x/semana, inspirado no "Apagão de Lumiose" do IdleDex — meta coletiva num horário fixo).
- **Dano por contribuição:** ranking de dano causado por jogador durante a janela; faixas de recompensa (ex.: top 1%, top 10%, participação com dano mínimo ≥ um piso pequeno) — todo jogador que participar recebe ao menos a recompensa de participação, ninguém que lutou fica de mãos vazias.
- **Recompensa por participação:** bits + item comum garantidos a qualquer contribuição válida; os itens raros/cosméticos ficam nas faixas de topo.

### 4.4 Boss de Mega por região

**[H, estrutura] [E, identidade de cada Digimon citado]** O pedido do fundador cita "Devimon/Myotismon por região" como exemplo. Verificação no Wikimon (2026-11-08) mostra que **nem Devimon nem Myotismon são oficialmente "Mega"**: Devimon é Adult (Champion-dub), Myotismon é Perfect (Ultimate-dub) — o fundador os usou como exemplo de "chefão marcante", não como citação do estágio evolutivo oficial. Para cumprir literalmente "chefe de Mega", a Zona Corrompida usa **VenomMyotismon**, a forma evoluída de Myotismon — **[E, `wikimon.net/VenomMyotismon`]**: "a verdadeira forma evoluída do rei das trevas, Vamdemon [Myotismon]", estágio Mega/Ultimate(JP). Esse é o único Mega World Boss confirmado nesta entrega:

| Região | World Boss (Mega) | Status |
|---|---|---|
| Zona Corrompida | **VenomMyotismon** | **[E]** confirmado, evolução oficial de Myotismon |
| Floresta Densa / Praia dos Postes / Montanha / Deserto | *(a definir)* | **[H] pendente** — nenhum par Mega foi verificado nesta sessão para as outras 4 regiões; não inventar até pesquisa dedicada |

---

## 5. Arena (evento do jogo)

> **Mudança de enquadramento pedida pelo fundador:** a Arena deixa de ser um "modo permanente" (como estava em `prototype/MODES_AND_ROADMAP.md`) e passa a ser um **evento calendarizado**, igual ao World Boss. As regras de combate e progressão descritas em `MODES_AND_ROADMAP.md` §1–2 continuam valendo tecnicamente; o que muda aqui é o enquadramento de disponibilidade.

### 5.1 Arena Clássica (PvP assíncrono por time)

**[E, reaproveitamento direto, `MODES_AND_ROADMAP.md` §2]** Jogador define um time de defesa (3 Digimon); desafiar um oponente roda a simulação de batalha automática já existente (`battle.ts`/sim atual) contra o time salvo do oponente, sem ele precisar estar online. Resultado determinístico, exibido como replay.

- **Disponibilidade:** sempre ligada para desafios (é assíncrona por natureza — não precisa de "janela"), mas a **temporada de ranking** é um evento: 14 dias **[H]**, reset com recompensa cosmética pela faixa final (sem vantagem de poder — ponto identificado como monetização/retenção saudável em `teardowns/IDLEDEX.md` §4, §8).
- **Tentativas:** 5 desafios grátis/dia **[H]**, inspirado no padrão "revanche 1 grátis/dia" do IdleDex; desafios extras custam bits (sink, §6).
- **Ranking:** Elo/MMR simples, leaderboard por rating atual e maior sequência.

### 5.2 Arena de Batalha (ação em tempo real)

**[E, reaproveitamento direto, `MODES_AND_ROADMAP.md` §1]** Jogador controla o próprio Digimon em tempo real (WASD/joystick, golpe básico, golpe especial, golpe de Sincronia com medidor de carga). Os golpes usados na Arena são os mesmos **4 slots equipados** do sistema de golpes (`MOVE_SYSTEM.md`), com `cooldownTicks` convertidos para tempo real (1 tick = 100 ms) em vez de regra de AUTO — não se inventa um "golpe de arena" separado do golpe de campo.

- **Duração:** 1 round = KO ou 90s; HP carrega entre rounds da mesma partida (melhor de 3 Digimon).
- **Normalização de stats:** ver `MODES_AND_ROADMAP.md` §1.7 (HP remapeado para faixa fixa, dano em % do HP de Arena, nenhum golpe não-ultimate > ~20% em 1 acerto).
- **Sequenciamento:** 1v1 vs. IA primeiro (sem servidor); depois PvP assíncrono por replay; PvP ao vivo só na Fase 5 do roadmap (netcode, item de maior risco técnico).

### 5.3 Calendário de eventos

**[H]** Inspirado no calendário do IdleDex (`teardowns/IDLEDEX.md` §4):

| Evento | Frequência | Janela | Observação |
|---|---|---|---|
| Arena Clássica — desafios | Sempre disponível | — | Assíncrona, não precisa de janela |
| Arena Clássica — temporada | 14 dias | — | Reset com recompensa cosmética |
| Arena de Batalha — vs. IA (treino) | Sempre disponível | — | Sem servidor, 100% local |
| Arena de Batalha — PvP ao vivo | 4x/semana **[H]** | seg/qua/sex/dom, 19h–22h | Só a partir da Fase 5 (servidor + netcode) |
| World Boss (local, v1) | 1x/dia de jogo | sob demanda ("Despertar") | Ver §4.2 |
| World Boss (servidor) | diária ou 2x/semana **[H]** | 20h–21h | Ver §4.3 |

### 5.4 Recompensas

**[E, ADR-007 condição 1 — sem monetização]** Toda recompensa de Arena e de World Boss é **cosmética ou bits** (skins de HUD/Tamer, molduras de retrato, poses de vitória, títulos) — nunca vantagem de poder. Ranking de temporada não concede stats, só cosmético.

---

## 6. Captura/recrutamento e evolução

### 6.1 Varredura (scan) — substitui o placeholder atual

**[E, `prototype/world/README.md`, Limitações: "captura = placeholder por varredura (4 vitórias = registrado)"]** Hoje a captura é um placeholder. Proposta de substituição, no espírito do IdleDex (bolas com taxa de sucesso variável):

1. Cada **vitória confirmada** contra um selvagem de uma espécie específica soma **+10% de "dados de varredura"** daquela espécie (teto 100%) — reaproveita o evento `defeat`/`reward` já existente, sem novo sistema de observação passiva.
2. Com dados de varredura, a **captura** fica disponível a qualquer momento após uma vitória (não precisa de 4 vitórias fixas como hoje): a chance de sucesso é `baseSpecies × modDados × modItem × modHP × modNível` **[H]**:
   - `modDados`: 20% (0% de dados) até 95% (100% de dados).
   - `modItem`: Digivice Padrão (×1,0) ou Digivice Avançado (×1,25, item de quest/loot, §2.1 cap.2).
   - `modHP`: até +40% quando o selvagem está com HP baixo (incentiva "amolecer" antes de capturar, como as bolas do IdleDex).
   - `modNível`: penalidade se o selvagem está muito acima do nível do Tamer.
3. Primeiro escaneamento de cada espécie conta para o bestiário (§2.4).

### 6.2 Evolução automática e manual

**[E, já implementado, `prototype/world/README.md` "Auto-evoluir"]** O jogo já tem o toggle Auto-evoluir: ao atingir o nível de evolução, a parceira evolui sozinha fora de combate (ou espera o fim do encontro); o jogador pode desligar e evoluir manualmente quando quiser, escolhendo quais golpes herdar (`inheritSlotsOnEvolve`, 2 golpes, `MOVE_SYSTEM.md` §2.3). Isso não muda neste documento — é descrito aqui por completude do pedido do fundador.

### 6.3 Ramificação de evolução (exemplo oficial: SkullGreymon)

**[E, `wikimon.net/SkullGreymon`, `wikimon.net/MetalGreymon`]** Hoje as 12 espécies do roster têm evolução linear (sem ramo) — nenhuma das linhas atuais tem um 2º caminho oficial documentado no pacote. Para ilustrar como a ramificação funcionaria quando o roster crescer, um exemplo 100% oficial e bem documentado:

- **Greymon → MetalGreymon** (caminho normal): evolução ao atingir o nível, com "vínculo" suficiente **[H, novo atributo: acumula com tempo/combates ao lado do Tamer]**.
- **Greymon → SkullGreymon** (caminho forçado): se o nível de evolução é atingido **sem** vínculo suficiente, ou com o item raro "Núcleo Instável" **[H, item original]**, a evolução "falha para frente": SkullGreymon é oficialmente descrito como uma forma dominada só pelo instinto de luta, sem inteligência — mecanicamente, um modo "berserker" temporário **[H]**: ATK alto, mas perde HP% a cada tick e reverte a Greymon após N ticks se não derrotar o alvo antes disso. É a mesma ideia já usada pelo canône (evolução forçada por estresse/excesso), adaptada a uma condição de jogo (vínculo baixo) em vez de um evento de roteiro específico.
- **[E] Curiosidade de apoio:** o próprio Wikimon registra que o "MetalGreymon de File Island" é historicamente uma forma **imperfeita** (corpo parcialmente mecanizado, carne descolorida) distinta do MetalGreymon "verdadeiro" obtido depois de uma prova — ou seja, o próprio canône já tem precedente de uma mesma evolução ter uma versão "incompleta" vs. "completa", reforçando que o mecanismo de ramificação por condição (aqui, vínculo) é compatível com a identidade oficial da linha.

### 6.4 Múltiplos jogadores e Digimon juntos

**[E, já implementado, `WORLD_COMBAT_VISUAL_SPEC.md` §2, §7]** O contrato de entidade (`player`/`partner`/`remote_player`/`remote_partner`/`wild`) já suporta vários jogadores e suas parceiras visíveis ao mesmo tempo no mapa, sem instância separada — isso vale em qualquer região nova, sem mudança de arquitetura.

---

## 7. Economia sem monetização (ADR-007)

### 7.1 Moeda

**[E, ADR-007 condição 1: "sem venda, anúncios, doações... IAP"]** **Bits é a única moeda do jogo.** Diferente do IdleDex (que tem "gold" como moeda premium compravel), o GS-003 **não tem** nenhuma moeda premium — toda fonte de bits vem de jogar (combate, quests, dungeons, mercado, world boss), nunca de compra.

### 7.2 Itens

| Categoria | Exemplos | Fonte |
|---|---|---|
| Cura | Potinho de Energia (cura % do HP) | loot, loja de bits |
| Captura | Digivice Padrão, Digivice Avançado (+25% chance, §6.1) | loja, quest, loot de dungeon |
| Evolução | Núcleo Estável (comum, evolução normal), Núcleo Instável (raro, evolução forçada, §6.3) | loot de chefe, quest |
| Cosmético | Skins de Tamer, molduras de retrato, títulos | Arena/World Boss/quests (§5.4) |

### 7.3 Mercado entre jogadores

**[E, `teardowns/IDLEDEX.md` §4: aba "Mercado" com limite de ofertas ativas]** Aba de mercado (comprar/vender/minhas ofertas/histórico), **só com bits** (sem troca de item por item, para simplificar anti-fraude na v1):

- Limite de ofertas ativas por jogador: **[H]** 5, aumentando com o **nível do Tamer** (não com pagamento — diferente do IdleDex, que aumenta por assinatura paga; aqui, ADR-007 proíbe isso).
- **Taxa de listagem (sink):** 5% do valor anunciado em bits, cobrada ao anunciar (não ao vender) — desestimula spam de ofertas.

### 7.4 Sinks (ralos de bits)

**[H]** Para o bits não inflacionar sem controle:
- Taxa de listagem do mercado (§7.3).
- Desafio extra de Arena Clássica além dos 5 grátis/dia (§5.1).
- Reentrada em dungeon antes do cooldown diário padrão (se o jogador quiser repetir no mesmo dia).
- Núcleo Instável e outros itens de evolução forçada (preço alto, uso opcional).
- "Aleatorizar aparência" do Tamer depois da criação inicial (1ª vez grátis, as seguintes custam bits) — reaproveita o criador de Tamer já implementado.

---

## 8. Roadmap de implementação em fases

> Esforço **[H]**, estimativa de design, não compromisso de prazo. Fases marcadas "exige servidor" não podem avançar sem aprovação explícita e separada do fundador (ADR-007 condição 4: "publicação continua exigindo aprovação... o padrão é uso local e privado"; um servidor público de qualquer tamanho já deixa de ser "uso local").

| Fase | Entra | Depende de | Servidor? | Esforço [H] |
|---|---|---|---|---|
| **0 — já existe** | Sim local, combate no mapa, 1 região parcial (Floresta Densa), save local, offline | — | Não | pago |
| **1 — Mundo local completo** | 6 regiões (mapas + spawns + rotas), varredura/captura real (§6.1), sistema de quests local (principal + diária mockada + rota + coleção), 1–2 dungeons de exemplo (§3), World Boss versão local (§4.2), ramificação de evolução (1 exemplo, §6.3) | Fase 0 | Não | médio-alto — maior item: geração de mapa por bioma × 5 regiões novas + dados de quest/dungeon |
| **2 — Arena (evento) local** | Arena Clássica (ranking mockado) e Arena de Batalha vs. IA, calendário de evento simulado localmente | Fase 1 (reaproveita golpes/learnsets) | Não | médio — reaproveita `MODES_AND_ROADMAP.md` §1–2 quase integralmente |
| **3 — Backend/servidor autoritativo** | Conta persistente, servidor roda a sim (AUTO com a aba fechada), banco de dados, autenticação | Fases 1–2 testadas localmente | **Sim — exige aprovação do fundador antes de contratar hospedagem/BD** | alto — maior mudança de arquitetura do projeto |
| **4 — MMO real** | Mercado real entre jogadores, World Boss real compartilhado (§4.3), quests diárias reais (sem mock), ranking de Arena Clássica real, múltiplos jogadores reais nas 6 regiões | Fase 3 | **Sim** | alto — cada sistema é um módulo de servidor próprio |
| **5 — Arena PvP ao vivo + Mega World Bosses por região** | Netcode para Arena de Batalha ao vivo; pesquisa e implementação dos Mega World Bosses pendentes (§4.4, 4 regiões sem par confirmado) | Fase 4 | **Sim** | muito alto — netcode é o item de maior risco técnico do roadmap inteiro (`MODES_AND_ROADMAP.md` §3, Fase 5) |

**Ordem recomendada:** 1 → 2 → 3 → 4 → 5, igual ao roadmap já aprovado em `MODES_AND_ROADMAP.md` — as fases 1–2 validam o mundo/quests/dungeons/arena-evento sem gastar infraestrutura; a Fase 3 só deveria começar depois de validar que o conteúdo vale o investimento de servidor.

---

## Dados de exemplo

`prototype/world/src/data/content/`:

- `regions.json` — as 6 regiões, selvagens por nível, chefes, desbloqueio, rotas.
- `bosses.json` — Kuwagamon, Shellmon, Tyrannomon, Guardromon, Devimon, VenomMyotismon e os moradores da Vila dos Bebês (Botamon, Punimon, Poyomon, Yuramon, Elecmon) — ainda não estão em `world-species.json`; catálogo separado com evidência por entrada.
- `quests.json` — arco principal (7 entradas), pool de diárias, quests de rota, marcos de coleção.
- `dungeons.json` — Cripta das Raízes e Ninho de Engrenagens, com andares, bifurcação e loot.
- `world_boss.json` — versão local e versão servidor, VenomMyotismon.
- `arena_events.json` — calendário de Arena Clássica e de Batalha.
- `economy.json` — itens, mercado, sinks.

---

## Limitações

1. **"Praia dos Postes" não é um nome oficial do Wikimon.** É a interpretação do visual icônico do episódio 1 de Digimon Adventure (postes/colunas saindo do mar na praia de File Island) — a página oficial não nomeia essa praia separadamente das áreas listadas em `wikimon.net/File_Island`. O chefe (Shellmon) e os selvagens da região são oficiais; o nome da região em si é **[H]**.
2. **"Deserto" é uma reinterpretação de Gear Savannah.** O conjunto de áreas oficiais de File Island verificado no Wikimon não inclui um deserto literal — Gear Savannah (savana com engrenagens) é a área oficial mais próxima do tema "árido/mecânico" pedido. A ambientação "deserto" é **[H]**; a área-base (Gear Savannah) é **[E]**.
3. **Atributo oficial não confirmado para alguns chefes.** Shellmon, Tyrannomon e Guardromon tiveram a descrição, o tipo e o golpe especial confirmados via Wikimon, mas o texto retornado (`web_fetch`, truncado) cortou antes da linha "Attribute" (Vaccine/Data/Virus) e, para Guardromon e VenomMyotismon, antes da linha "Level" também. Esses campos aparecem marcados **[H]** nos JSONs de exemplo até uma segunda verificação completa da página.
4. **Mega World Boss confirmado só para 1 das 6 regiões** (VenomMyotismon, Zona Corrompida). As outras 5 regiões não têm Mega Digimon pareado nesta entrega — ver §4.4. Não inventar associação até pesquisa dedicada.
5. **Nenhum número de balance foi calibrado jogando** (níveis, HP de dungeon/World Boss, taxas de captura, cooldowns de Arena, timers de evento) — todos marcados **[H]**, no mesmo padrão já usado em `MOVE_SYSTEM.md`.
6. **A ramificação de evolução (§6.3) é proposta de design, sem implementação de referência** — nenhuma das 12 espécies do roster atual tem 2º caminho de evolução nos dados hoje; o exemplo (SkullGreymon) é ilustrativo para quando o roster crescer.
7. **O "vínculo" (bond) citado em §6.3 e §4 (contribuição) são atributos novos**, sem precedente no código (`sim/types.ts`) — ficam como trabalho de implementação do game-dev, não de dados.
8. **`web_search` esteve indisponível nesta sessão** (erro "disabled or no provider"); toda verificação externa usou `web_fetch` direto em URLs específicas do Wikimon já conhecidas pelo estúdio (mesmo domínio citado em `MOVE_SYSTEM.md`) — não foi possível fazer busca exploratória para encontrar páreas de Mega World Boss das outras regiões (item 4).
9. **Economia e mercado (§7) não têm precedente de implementação** — hoje o jogo só tem bits como contador simples; loja, mercado e sinks são todos propostos novos.
10. **Este documento não resolve a questão de risco legal de MMO público já levantada em `MODES_AND_ROADMAP.md` §5.3**: operar servidor público com Digimon oficiais aumenta a superfície de risco de notificação de remoção, independentemente de não haver monetização — a Fase 3+ deste roadmap precisa de aprovação separada do fundador antes de qualquer trabalho de infraestrutura real, não só desta especificação de design.
