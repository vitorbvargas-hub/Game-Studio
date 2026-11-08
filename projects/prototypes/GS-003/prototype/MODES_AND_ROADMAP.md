# GS-003 — Modos Arena e Roadmap até o MMO-lite estilo IdleDex

> Marcação: **[E]** evidência (com fonte e data) · **[H]** hipótese de design não validada com jogador real.

- **Projeto:** GS-003 (fase PROTOTYPE)
- **Autor (agente):** game-design
- **Data:** 2026-11-08
- **Fontes:** `ADR-007-gs003-fan-game-pokemon-digimon.md`, `prototype/GDD_PROTOTYPE_B.md`, `prototype/data/content-pack-digimon-oficial.json`, `prototype/game/TECHNICAL_SPEC.md`, `art/PIXEL_ART_DIRECTION.md`, `teardowns/IDLEDEX.md`, `teardowns/POKE2DARENA.md`, `teardowns/BATTLEGROUNDS.md`; licença PMD SpriteCollab verificada via `web_fetch` em `github.com/PMDCollab/SpriteCollab` em 2026-11-08 (ver §4).
- **Pedido do fundador coberto por este documento:** (a) MMO-lite estilo IdleDex (servidor autoritativo, AUTO com aba fechada, mercado, World Boss, missões diárias, ranking); (b) Arena de Ação em tempo real (ref. Poké Arena 2D / Pokémon Battlegrounds); (c) Arena Clássica (PvP assíncrono/por turnos, com ranking).

---

## 0. Estado atual do motor (ponto de partida real, não hipotético)

**[E, `TECHNICAL_SPEC.md`]** O que já existe hoje é um **idle-RPG single-player, 100% client-side**: TypeScript + Canvas 2D, simulação determinística em `src/sim/`, save versionado em `localStorage`, progresso offline com teto de 4h calculado **apenas quando o jogador reabre a aba** (não há servidor, não há cálculo com a aba fechada). Conteúdo em content packs trocáveis (`digimon-fan` é o pacote padrão da Linha B). Há 2 decisões de jogador implementadas (sincronia de chefe, ramo de evolução); draft de time e rotas de masmorra estão modelados em dados mas não implementados.

Isso significa que **nenhum dos 3 pedidos do fundador existe hoje**: não há servidor, não há PvP, não há Arena de Ação, não há conta de jogador, não há AUTO persistente fora da aba. Todo o roadmap abaixo parte deste zero de infraestrutura multiplayer — o que já existe é só a simulação de combate e o conteúdo (criaturas/habilidades), que **são reutilizáveis** pelos 2 novos modos.

---

## 1. Arena de Ação — especificação mínima

### 1.1 Referências jogadas e o que copiar como mecânica genérica

**[E, `teardowns/POKE2DARENA.md`]** Poké Arena 2D é "jogo de verdade": combate 3v3 em tempo real, mouse mira/mexe o alvo, botões de atalho disparam golpes (clique esquerdo/direito = 2 golpes principais, Q/E = golpes especiais com cooldown ou % de carga, Espaço = dash), HUD com barra de HP + ícones de switch de time + barra de golpes com indicador de cooldown. **[E]** Pokémon Battlegrounds não é jogável (é um canal de animação com votação de times/movesets) — não há mecânica de execução em tempo real para copiar dali; o aproveitável de lá é conceitual (bracket de torneio, "replay" de confronto como conteúdo compartilhável), não de controle.

### 1.2 Controles

| Ação | Teclado | Toque (mobile/tablet) |
|---|---|---|
| Mover | WASD / setas | Joystick virtual flutuante (zona esquerda da tela) |
| Dash/esquiva | Espaço (cooldown curto, ~2s) | Botão dedicado (zona direita) |
| Golpe básico (contato) | Clique esquerdo / J | Botão "A" grande |
| Golpe especial (nomeado, cooldown médio) | E / Clique direito | Botão "B" |
| Golpe de Sincronia (medidor, não mais exclusivo de chefe) | Espaço mantido / R | Botão "C" com anel de carga visível |
| Pausar/mapa | Esc | Ícone de menu |

**[H]** Em toque, mira automática no inimigo mais próximo (sem crosshair manual) — mirar com o dedo em uma tela pequena é a principal fricção que o mouse do Poké Arena 2D não tem; simplificar a mira em mobile é decisão de design, não cópia 1:1 da referência.

### 1.3 Golpes por monstro (2-3, extraídos do content pack existente)

**[E, `content-pack-digimon-oficial.json`]** Cada espécie já tem `skills.passive` (nomeado com o golpe especial oficial) e, a partir do estágio Child, `skills.sync` (hoje marcado `bossOnly`). Isso mapeia direto para a Arena sem inventar conteúdo novo:

| Slot da Arena | Fonte no content pack | Estágio Baby II (Koromon/Tsunomon/Tokomon) | Estágio Child/Adult (Agumon→Greymon etc.) |
|---|---|---|---|
| **Golpe básico** | Novo (não existe no pack idle) | Ataque de contato genérico, sem nome oficial, cooldown ~0,6s | Igual |
| **Golpe especial** | `skills.passive`, reaproveitado como ativo com cooldown | Ex.: Bubble Blow (Koromon) — vira cura/controle ativo | Ex.: Baby Flame, Petit Fire, Mega Flame, Fox Fire, Air Shot, Heaven's Knuckle — vira dano/efeito ativo, cooldown 4-8s |
| **Sincronia/Ultimate** | `skills.sync`, removendo a trava `bossOnly` | **Não existe neste estágio** → só 2 golpes | Existe → 3º golpe, carregado por dano causado/recebido durante a partida (medidor 0-100%), não mais exclusivo de luta de chefe |

Resultado: **Baby II tem 2 golpes, Child/Adult têm 3** — já cumpre o pedido de "2 ou 3 golpes por monstro" sem criar nenhum dado novo de jogo além do ataque básico de contato.

**[H]** Isso exige reescrever o *efeito* de cada `skills.passive`/`skills.sync` para o contexto de ação (hoje são efeitos de batalha automática por tick — ex. "12% de chance de dano dobrado" não faz sentido como golpe ativo). Proposta: manter o **tema/nome/elemento** de cada golpe (ex. Mega Flame continua um golpe de fogo em área), mas reescrever o efeito como dano/cura/escudo instantâneo equivalente em poder — trabalho de design por golpe, não reaproveitamento automático de dados.

### 1.4 Câmera

**[H]** Câmera 2D fixa, visão lateral (como Poké Arena 2D e Battlegrounds), sem scroll — arena de tamanho fixo que cabe inteira na resolução interna já padronizada do motor (320×180, escala inteira, `imageSmoothingEnabled=false`, conforme `art/PIXEL_ART_DIRECTION.md` §2). Reaproveita a mesma regra de escala do protótipo idle — não é um sistema de câmera novo, é a mesma composição em duas camadas (asset → tela) já implementada em `canvas.js`/`renderer.ts`.

### 1.5 Duração das partidas

**[H]** 1 round = KO do monstro ativo ou **90 segundos** (timer visível); ao expirar o timer, vence quem está com maior % de HP (evita "stalling"/fuga). Troca de monstro (até 3 no time, igual ao idle) é permitida a qualquer momento fora de stun, sem cura ao trocar — HP carrega entre rounds da mesma partida, inspirado direto na regra "HP carries over between floors" do Poké Arena 2D (`teardowns/POKE2DARENA.md` §2). Partida completa (melhor de 3 monstros) estimada em 3-6 minutos — compatível com sessão curta de idle game (`GDD_PROTOTYPE_B.md` já usa janelas de decisão de 1-3 min como referência de ritmo).

### 1.6 Modos: 1v1 vs IA primeiro, depois PvP

**[H, sequenciamento recomendado]**
1. **1v1 vs IA (primeiro a implementar):** IA controla o monstro adversário com script de reação simples (distância → ataque básico; cooldown livre → especial; medidor cheio e HP próprio < 40% → sincronia defensiva, senão ofensiva). Não depende de servidor nem de outro jogador — pode rodar 100% client-side, reusando o roteiro de IA que já existe em `battle.ts` como ponto de partida conceitual (ali é automático-por-tick; aqui precisa virar reação em tempo real).
2. **PvP (depois):** dois formatos possíveis, em ordem de esforço:
   - **PvP assíncrono por replay:** cada jogador grava sua sessão de input contra um "fantasma" dos dados do oponente (time + nível, sem o oponente online); o servidor decide o vencedor comparando os dois replays contra os mesmos dados-adversário. **Não precisa de netcode em tempo real.**
   - **PvP ao vivo:** os dois jogadores controlam em tempo real, conectados ao mesmo servidor de partida — exige netcode (predição de cliente ou lockstep autoritativo), o item de maior risco técnico deste documento (ver §3, Fase 5).

### 1.7 Como os stats do idle se traduzem em ação sem quebrar o equilíbrio

**[H]** Problema real: no idle, ATK/DEF/HP crescem por fórmula linear até o nível 20 (`GDD_PROTOTYPE_B.md`, "Fórmulas") e podem diferir em várias vezes entre um time recém-formado e um time endgame — em combate automático por tick isso é absorvido por várias trocas de golpe; em ação em tempo real, a mesma diferença pode significar "o inimigo morre em 1 golpe" sem o jogador conseguir reagir, o que é frustração pura, não desafio.

**Proposta de normalização (reaproveita a mesma separação sim/conteúdo do motor, não muda o idle):**
- **HP de Arena** não é o HP bruto do idle; é remapeado para uma faixa fixa (ex. 100-160 "HP de Arena"), calculada a partir do HP bruto do idle dividido por uma constante de escala por estágio (Baby II/Child/Adult têm constantes diferentes, mas o range final fica comparável entre níveis próximos).
- **Dano por golpe é expresso em % do HP de Arena do defensor**, não em número absoluto de ATK×DEF do idle — golpe básico ~6-9%, especial ~12-18%, sincronia ~20-28% (valores [H], a validar por playtest) — nenhum golpe não-ultimate pode passar de ~20% em 1 acerto, preservando o "nunca morto por surpresa" que já é pilar do GDD.
- **SPD do idle** não controla mais uma barra de iniciativa (que não existe em ação); mapeia para **velocidade de movimento/dash e % de redução de cooldown**, dando à progressão do idle um efeito real em Arena sem virar vantagem binária de "quem ataca primeiro sempre".
- **Vantagem de atributo oficial (Vaccine/Data/Virus)** se mantém como multiplicador (1,25×/0,8×/1,0×) aplicado sobre o dano já normalizado, preservando a identidade tática do roster sem reintroduzir a escala bruta de stats.
- **Nível do idle ainda importa, mas com retorno decrescente em Arena**: cada nível de diferença vale um bônus pequeno e capado (ex. +1% de dano por nível de diferença, cap ±15%) — suficiente para a progressão do idle "significar algo" na Arena (pedido implícito de ligar os dois modos), sem tornar o modo puramente determinístico por quem farmou mais.

**[H] Risco aceito:** esta é uma camada de rebalanceamento nova, não testada — precisa de pelo menos 1 rodada de simulação (nos moldes do que já foi feito para a Zona 2 do idle, `GDD_PROTOTYPE_B.md` "Ajuste de balanceamento") antes de qualquer PvP real.

---

## 2. Arena Clássica — especificação

### 2.1 Formato

**[H]** Por turnos ou automática contra o time salvo de outro jogador — **não é combate ao vivo**, é "defesa assíncrona": cada jogador define um time de 3 (mesma estrutura do idle) como sua "equipe de defesa"; ao desafiar um oponente, o servidor roda a simulação de batalha automática já existente (`battle.ts`, motor ATB por tick) usando o time de ataque do desafiante contra o time de defesa salvo do oponente — **sem o oponente precisar estar online**. Resultado é determinístico a partir dos dois times + seed, então pode ser recalculado/reexibido como replay.

**[E, reaproveitamento direto]** Isso é o **menor esforço entre os dois modos novos**, porque a simulação de batalha 3v3 automática, cálculo de dano, afinidade e pausas de decisão **já existem e já são testados** (`TECHNICAL_SPEC.md`, "Batalha (ATB)") — o trabalho é majoritariamente de servidor (guardar times de defesa, filas de desafio, histórico) e UI, não de motor de combate novo.

### 2.2 PvP assíncrono

- Jogador define/atualiza seu time de defesa quando quiser (fora de combate).
- Desafio consome 1 "tentativa" por período (ex. 5/dia, espelhando o padrão de tentativas limitadas do IdleDex/`teardowns/IDLEDEX.md` §4, "revanche com 1 grátis/dia").
- Resultado é instantâneo (simulação roda no servidor em milissegundos) e mostrado como replay do log de batalha (reaproveita o log compacto de 3 linhas já desenhado no GDD do idle).

### 2.3 Ranking

**[H]**
- Rating tipo Elo/MMR simples por vitória/derrota, ajustado por diferença de rating (fórmula padrão Elo, K configurável).
- Leaderboard por: rating atual, maior sequência de vitórias, temporada (reset periódico com recompensa cosmética, nunca vantagem de poder — ponto já identificado como monetização saudável em `teardowns/IDLEDEX.md` §4).
- **Sem punição de time de defesa por derrota além do rating** — perder não deve custar progresso do idle (mantém o pilar "nunca morto por surpresa" também em PvP), só posição no ranking.

---

## 3. Roadmap em fases

> Esforço marcado **[H]** — estimativa de design não calibrada com o time de engenharia; tratar como ordem de grandeza, não compromisso.

### Fase 0 — já existe (ponto de partida)
- **Entra:** idle single-player client-side, 1 content pack jogável (`digimon-fan`), save local, offline só com a aba reaberta.
- **Dependências:** nenhuma (já construído).
- **Esforço:** já pago.

### Fase 1 — Arena Clássica (local, sem servidor real ainda)
- **Entra:** time de defesa salvo localmente, simulação de "desafio" contra 1-2 times de IA pré-configurados (mock de oponente, sem outro jogador real), UI de resultado/replay, ranking **mockado/local** (sem persistência entre jogadores).
- **Dependências:** nenhuma infraestrutura nova — reaproveita `battle.ts` quase integralmente.
- **Esforço [H]:** baixo (dias, não semanas) — é majoritariamente UI sobre motor existente.

### Fase 2 — Arena de Ação vs IA (local, sem servidor)
- **Entra:** loop de input em tempo real, HUD de combate (HP, golpes, cooldowns, medidor de sincronia), normalização de stats (§1.7), 1 oponente de IA por monstro do roster, 2-3 golpes por monstro reaproveitando o content pack.
- **Dependências:** **animações de andar/ataque/dano** (gap de arte real, ver §4) — este é o maior bloqueio desta fase, não o código de combate.
- **Esforço [H]:** médio-alto — novo loop de jogo (não é extensão do motor idle, é um segundo "modo de jogo" com física/colisão/input própria) + dependência de arte não resolvida.

### Fase 3 — Backend/servidor autoritativo (fundação obrigatória para tudo que vem depois)
- **Entra:** conta de jogador persistente, servidor que roda a simulação idle (não mais só o cliente), AUTO que continua rodando com a aba fechada (requisito explícito do fundador — só é possível com um processo de servidor/worker computando o progresso continuamente, não com cálculo de "quanto tempo passou" ao reabrir), banco de dados de save, autenticação.
- **Dependências:** escolha de hospedagem/banco de dados (**custo pago — exige aprovação do fundador antes de contratar qualquer serviço**, conforme regra do estúdio), reescrita do save de `localStorage` para API de servidor.
- **Esforço [H]:** alto — é a maior mudança de arquitetura do projeto; tudo que existe hoje assume "1 cliente, sem servidor".

### Fase 4 — Recursos MMO-lite (dependem 100% da Fase 3)
- **Entra:** Mercado entre jogadores (auction house simples), World Boss (evento compartilhado com HP único visível a todos os jogadores online), missões diárias, ranking global real (não mockado), PvP assíncrono real da Arena Clássica (times de outros jogadores de verdade, não mock).
- **Dependências:** Fase 3 completa (servidor com contas e persistência real).
- **Esforço [H]:** alto — cada sistema (mercado, world boss, missão diária) é um módulo de servidor próprio; World Boss em particular exige sincronizar dano de múltiplos jogadores num único alvo compartilhado.

### Fase 5 — PvP ao vivo na Arena de Ação (o item de maior risco técnico do roadmap)
- **Entra:** dois jogadores controlando em tempo real na mesma partida.
- **Dependências:** Fase 3 (servidor) + netcode dedicado (predição de cliente ou lockstep autoritativo) — **tecnicamente diferente de tudo que o motor já faz**, porque o motor idle é determinístico por tick mas nunca precisou lidar com latência de rede entre 2 clientes humanos em tempo real.
- **Esforço [H]:** muito alto — a referência jogada (Poké Arena 2D) já tem "Online lobby" como recurso avançado/separado do resto do jogo (`teardowns/POKE2DARENA.md` §4), sugerindo que mesmo um concorrente maduro trata isso como entrega distinta, não trivial.

**Ordem recomendada [H]:** 1 → 2 → 3 → 4 → 5. Fases 1 e 2 validam diversão dos dois modos novos sem exigir nenhum gasto de infraestrutura; Fase 3 só deveria começar depois de validar que os modos valem o investimento de servidor.

---

## 4. Necessidades de arte por modo

### 4.1 O que cada modo exige

| Modo | Animações mínimas por monstro | Status atual |
|---|---|---|
| **Idle (já existe)** | Idle (2-4 frames) | **Entregue parcialmente**: só Agumon/Gabumon/Patamon têm 2 frames de idle reais (`art/PIXEL_ART_DIRECTION.md` §6); as demais 6 espécies do roster (Koromon, Tsunomon, Tokomon, Greymon, Garurumon, Angemon) não têm sprite próprio ainda. |
| **Arena de Ação** | Idle + **Andar** (4-8 frames, várias direções ou só espelhamento horizontal) + **Atacar** (3-4 frames por golpe, 2-3 golpes = até ~12 frames) + **Tomar dano** (1-2 frames) + opcionalmente **Dash/esquiva** | **Nada entregue.** Mesmo os 3 Digimon com idle pronto não têm andar/ataque/dano. |
| **Arena Clássica** | Nenhuma nova (reaproveita idle + ícones de UI) | Coberto pelo que já existe/está planejado para o idle. |

**Conclusão direta:** a Arena de Ação é o único modo com necessidade de arte nova e significativa; a Arena Clássica não exige nenhum asset além do que o idle já precisa.

### 4.2 Os sprites de fãs (PMD Collab) dão conta para Pokémon?

**[E, verificado via `web_fetch` em `github.com/PMDCollab/SpriteCollab`, 2026-11-08]** A política oficial do próprio projeto PMD Collab diz: *"we do not allow modifications or overwriting of any existing Chunsoft portraits or sprites within the SpriteBot repository"* — ou seja, os sprites completos de overworld (que incluem exatamente as animações de **Walk, Attack, Hurt, Idle, Sleep** que a Arena de Ação precisa) para qualquer Pokémon que já tenha aparecido nos jogos oficiais Mystery Dungeon (o que cobre praticamente toda a linha de starters citada nos teardowns, Charmander/Bulbasaur/Squirtle etc.) **são os sprites originais da Chunsoft, hospedados no repositório, não sprites "de fã"**. A licença CC BY-NC 4.0 do projeto cobre o que é **submetido por colaboradores** (recolors "AltColor", portraits/emoções incompletas preenchidas por fãs, Pokémon sem sprite oficial em Mystery Dungeon) — não relicencia retroativamente o trabalho da Chunsoft.

**Isso contradiz a leitura otimista do ADR-007/`PIXEL_ART_DIRECTION.md` de que "PMD Collab com sprites de fãs" resolve o roster.** Na prática, para qualquer espécie já jogável nos jogos oficiais de Mystery Dungeon (a maioria do roster de interesse do estúdio), o conjunto de animações completo (Walk/Attack/Hurt) **é sprite oficial ripado**, exatamente o que o ADR-007 condição 2 proíbe ("proibido... usar sprites oficiais redistribuídos por terceiros, ex.: sprites Chunsoft do PMD Collab"). O que sobra como genuinamente "de fã" ali são recolors/variações sobre a mesma silhueta oficial (ainda um desenho derivado do design oficial, não uma animação nova) ou espécies sem sprite PMD oficial — não é uma solução geral para "animações completas para Pokémon".

**Conclusão: não, o PMD Collab não dá conta** do jeito que foi assumido — cada espécie usada precisaria de verificação individual (rara) de que o conjunto de animações é 100% contribuição de fã, não Chunsoft, e isso não é o caso típico para espécies populares/já documentadas oficialmente.

### 4.3 O que falta para Digimon

**[H]** Não existe, até onde esta sessão conseguiu verificar (`web_search` indisponível nesta sessão, mesma limitação já registrada em `art/PIXEL_ART_DIRECTION.md` §9; nenhuma URL de projeto de sprite Digimon foi verificada diretamente), um equivalente de escala comparável ao PMD Collab para Digimon com animações completas de andar/ataque/dano sob licença de fã clara e nāo-ripada. O ADR-007 cita "Digimon Pixels" como exemplo de fonte aceitável, mas nenhuma verificação de conteúdo/licença desse projeto foi feita nesta tarefa nem na entrega anterior de arte — é uma pendência de pesquisa, não um "sim" confirmado.

**O que de fato existe hoje (`art/PIXEL_ART_DIRECTION.md`):** pipeline próprio 100% autoral (desenho por código, sem referência de imagem), com **apenas idle (2 frames)** para 3 das 9 espécies do roster Digimon. **Faltam, para os 9 (ou 12, contando os 2 Modos de cada Adult): idle das 6 espécies restantes + andar + ataque (2-3 golpes cada) + dano, para todas as 9-12.** Esse é o maior item de trabalho de arte do roadmap inteiro — ordem de grandeza muito maior do que os 3 sprites de idle já entregues, porque cada espécie passa de "1 pose" para "1 pose + ciclo de locomoção + N golpes animados".

**Recomendação [H]:** tratar arte de Arena de Ação como uma tarefa dedicada de game-art, separada deste documento, com escopo explícito de quantos frames por animação por espécie, antes de a Fase 2 do roadmap poder começar de verdade — e, para Pokémon, incluir uma etapa de verificação espécie-por-espécie de proveniência de qualquer sprite externo antes de usar, não assumir PMD Collab como fonte pronta.

---

## 5. Riscos

### 5.1 Risco de escopo

**[E]** O pedido do fundador soma, em paralelo: (a) um MMO-lite completo com servidor, mercado, World Boss, missões diárias e ranking, (b) um modo de ação em tempo real com animações novas para todo o roster, e (c) uma arena clássica com PvP e ranking — isso é, em conjunto, da mesma ordem de grandeza dos produtos de referência jogados (IdleDex, Poké Arena 2D), que são produtos "live service" maduros, não protótipos. **[H]** Tentar entregar os 3 em paralelo dilui esforço e atrasa a validação de qualquer um deles; o roadmap da §3 prioriza sequenciamento justamente para evitar isso.

### 5.2 Risco de custo de servidor

**[H]** A partir da Fase 3, o jogo passa a exigir hospedagem paga, banco de dados e, potencialmente, custo recorrente proporcional ao número de jogadores (processo de servidor computando progresso idle continuamente para todas as contas, não só quando alguém está logado). **Nenhum valor de custo foi estimado nesta tarefa** — é trabalho de game-dev/infra, e, por regra do estúdio, **nenhum serviço pago pode ser contratado sem aprovação explícita do fundador**, incluindo a escolha inicial de provedor/hospedagem.

### 5.3 Risco legal — de "fan game local" para "MMO online"

**[E, ADR-007]** A exceção de uso de IP oficial aprovada pelo fundador tem como condição explícita: *"Publicação continua exigindo aprovação do fundador, separada desta decisão. O padrão é uso local e privado."* **[H] Um MMO-lite com servidor público, contas de jogador e mercado entre jogadores não é, por definição, "uso local e privado"** — é operação pública contínua, o que caracteriza publicação mesmo sem anúncio formal de lançamento. Isso significa que **a Fase 3 em diante não pode avançar apenas com este roadmap de design**; exige uma nova rodada de aprovação explícita do fundador especificamente sobre operar um servidor público com monstros oficiais, antes de qualquer trabalho de infraestrutura real.

**[E, `teardowns/IDLEDEX.md` §9 e `teardowns/POKE2DARENA.md` §9]** Os 2 concorrentes diretos de referência (IdleDex, operando como MMO completo com assinatura paga, e Poké Arena 2D, com "Online lobby" ativo) usam nomes, espécies, itens e regiões oficiais de forma extensa e **sem relação aparente com a The Pokémon Company/Nintendo** — ambos avaliados no teardown como "risco altíssimo de notificação de remoção (DMCA/C&D)". **Um MMO-lite público do GS-003, mesmo sem monetização (condição já cumprida pelo ADR-007), aumenta a superfície de risco pelo simples fato de ser um serviço online persistente e descobrível**, diferente do uso local/privado que o ADR-007 assumiu como padrão — visibilidade pública é, em si, o principal fator de risco de notificação de remoção, independentemente de haver cobrança de dinheiro.

---

## Limitações deste documento

- Nenhum valor de esforço foi calibrado com game-dev; todos os **[H]** de esforço são estimativa de design, não compromisso de prazo.
- A normalização de stats para a Arena de Ação (§1.7) é proposta de fórmula, não simulada nem testada — precisa da mesma validação por simulação já aplicada ao balanceamento da Zona 2 do idle antes de entrar em produção.
- A verificação de licença do PMD Collab (§4.2) cobre a política geral do repositório lida via `web_fetch` nesta sessão; não foi verificado sprite-por-sprite se alguma espécie específica do roster de interesse já tem uma submissão de fã completa e utilizável — isso exigiria checagem individual futura.
- Para Digimon (§4.3), nenhuma fonte de sprite de fã alternativa foi de fato pesquisada nesta sessão (`web_search` indisponível) — a conclusão de "não existe equivalente verificado" é sobre o que **não foi confirmado**, não uma prova de que nenhuma fonte exista.
- Este documento não cobre a Linha A (Pokémon) em detalhe de conteúdo porque ainda não existe um `GDD`/content pack equivalente ao da Linha B (Digimon) — a especificação da Arena usa o roster Digimon como referência de implementação; a Linha A deve seguir o mesmo padrão quando seu content pack existir.
