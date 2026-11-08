# Teardown — Poke2D Arena

Jogado em 2026-11-08 (sessão de ~12 minutos: menu principal, modo "Arena Run" floor 1, combate ativo em tempo real contra CPU, troca de Pokémon em time, derrota na floor 1). Evidências em `evidence/poke2darena/`.

---

## 1. Onboarding

**[E]** Sem tutorial guiado observado: o jogador cai direto no menu principal, um campo de futebol estilizado com 12 Pokémon ao redor do logo "POKE2D ARENA — REAL-TIME ARENA" e um menu lateral com 7 opções: Quick Battle, VS CPU, Story Mode, Arena Run, Your Teams, Card Packs, Online lobby (`01_menu.png`).

**[E]** No canto superior esquerdo há o aviso "UNOFFICIAL FAN GAME — POKE2DARENA.COM", funcionando como disclaimer de marca, não como onboarding de regras.

**[E]** Ao entrar em "Arena Run" sem time montado, o jogo bloqueia o botão START e exibe mensagem clara: "START NEEDS THREE POKEMON. BUILD A TEAM IN YOUR TEAMS." — com atalho "RANDOM TEAM" para pular a criação manual (`02_arena_run.png`). Isso é um bom padrão de onboarding por restrição guiada (impede progresso sem o pré-requisito, mas oferece atalho rápido).

## 2. Core loop

**[E]** Diferente dos outros dois jogos de referência, o combate aqui é **ativo em tempo real**, não automático: batalhas 3v3 com controle direto — mouse mira/mexe o alvo de habilidades (cursor vira mira/crosshair), teclas de atalho disparam golpes (Espaço = Dash, clique esquerdo/direito = 2 golpes principais, Q e E = golpes especiais com cooldown ou % de carga) (`03_time_sorteado.png`, `04_combate.png`).

**[E]** Loop do modo Arena Run: escolher/sortear time de 3 Pokémon → entrar na masmorra de 6 andares → lutar 3v3 em tempo real andar a andar, com **HP que carrega entre andares** (sem cura automática completa) → trocar Pokémon do time quando um cai (botões de switch no HUD) → repetir até vencer o andar 6 (chefe) ou perder todo o time.

**[E]** Testamos e perdemos na floor 1: a tela final mostrou "RUN OVER" com nosso time reduzido a 0 HP contra um único Espeon inimigo ainda com HP cheio (140/140) — evidência de que a IA/oponente é competente e pune composição/execução fraca mesmo no primeiro andar (`06_fim_batalha.png`).

## 3. Decisões ativas (draft, posicionamento, sinergias, timing)

**[E]** Posicionamento e timing são contínuos e manuais durante o combate: o jogador move o Pokémon ativo pelo campo (provavelmente WASD/mouse), mira habilidades em área (visto um indicador circular de alvo/AoE ao usar um golpe) e decide quando trocar de Pokémon do time — isso é **muito mais próximo de jogatina ativa tradicional** (ação em tempo real) do que os outros dois jogos de referência.

**[E]** Decisão de equipe: "Your Teams" (menu com badge "NEW") permite montar times fixos previamente — sugere um sistema de coleção/deck-building anterior à partida, com Card Packs como fonte de novos Pokémon ("PACK 40 · YOU HAVE 0" visível no menu, indicando custo de 40 de alguma moeda e saldo zerado do jogador de teste).

**[E]** Gestão de HP entre andares (carry-over) força decisão estratégica real de quando trocar Pokémon machucado vs. continuar arriscando, já que não há reset de vida a cada luta — risco acumulado ao longo da "masmorra".

**[H]** Não testamos Story Mode nem o modo Online por restrição de tempo/regras de segurança (matchmaking humano permitido, mas sem chat e sem alterar conta — não priorizado nesta sessão).

## 4. Competição e ranking, eventos, chefes

**[E]** Estrutura de masmorra explícita: "ARENA RUN — SIX FLOORS. THREE ON THREE. HP CARRIES OVER." com andar 3 marcado "ELITE" e andar 6 marcado "BOSS" — é o único dos três jogos de referência com conceito literal de masmorra escalonada + chefe final (`02_arena_run.png`).

**[E]** Contadores "BEST" e "CLEARS" no topo da tela de Arena Run indicam recorde pessoal (melhor andar alcançado) e número total de runs completadas — sistema de progressão/meta pessoal, não necessariamente ranking competitivo global.

**[E]** Existe "Online lobby" marcado como "LIVE" no menu principal, sugerindo PvP ao vivo contra outros jogadores, não explorado nesta sessão.

**[H]** Não vimos ranking global de jogadores (leaderboard) na sessão — a competição aqui parece mais centrada em auto-superação (melhorar seu "BEST") e PvP online pontual do que em um ranking persistente como no Auto Chess.

## 5. Monetização

**[E]** "Card Packs" no menu principal com indicador de custo ("PACK 40") e saldo do jogador ("YOU HAVE 0") — sistema de pacotes de cartas/Pokémon, clássico gatcha/coleção, mas não exploramos se a moeda é gratuita (ganha jogando) ou paga (não há indicação de preço em dinheiro real visível no menu).

**[H]** Por ser "unofficial fan game" sem afiliação declarada, é provável que a monetização (se existir) seja limitada ou inexistente em dinheiro real — não confirmamos por não termos entrado na tela de Card Packs (regra de segurança: não comprar nada, e a tela não foi aberta para evitar qualquer fluxo de compra acidental).

## 6. Retenção

**[E]** Estrutura de "run" roguelite-like (recomeçar do zero a cada tentativa, com recorde pessoal de "BEST" e contador de "CLEARS" cumulativo) é um gancho de retenção clássico de "só mais uma tentativa".

**[E]** Sistema de coleção (Card Packs + Your Teams) sugere meta-progressão entre runs: Pokémon novos/melhores desbloqueados fora da partida alimentam runs futuras — loop clássico de coleção + desafio.

**[H]** A exigência de **jogatina ativa em tempo real** (não auto-battle) é tanto uma força de engajamento (mais satisfação de "jogar de verdade") quanto uma barreira a jogadores casuais que querem um idle de baixa fricção — ponto de atenção direto para o GS-003, que pede "modo automático" mas "que exija decisões".

## 7. UI/UX e arte

**[E]** Menu principal com tema de "campo de futebol" (grama listrada) é estilização visual distinta e não-óbvia para um jogo de batalhas Pokémon — identidade visual própria, mesmo usando sprites oficiais da franquia.

**[E]** HUD de combate é limpo: barra de HP + nome + tipo no topo de cada lado, ícones de switch de time abaixo da barra do jogador, barra de golpes na parte inferior com teclas de atalho visíveis e indicador de cooldown/porcentagem de carga (`03_time_sorteado.png`, `04_combate.png`).

**[E]** Sprites usados são os sprites 2D oficiais/clássicos de Pokémon (estilo Gen 4/5 overworld), em movimento com animações próprias de ataque — mais "jogo de luta em tempo real" do que "RPG por turnos".

## 8. Ideias aproveitáveis num idle de coleção (top 5)

1. **Masmorra de 6 andares com HP acumulado entre andares e andar de chefe marcado** — é literalmente a mecânica de "masmorra + chefe" pedida pelo fundador; dá tensão crescente sem precisar de combate manual completo (pode ser adaptado a resolução semi-automática com decisões pontuais).
2. **Bloqueio de progresso com atalho rápido** ("precisa de 3 Pokémon, monte um time" + botão "time aleatório") — ótimo padrão de onboarding: força decisão mínima necessária sem travar o jogador que só quer começar logo.
3. **Contadores de recorde pessoal + runs completadas** ("BEST" / "CLEARS") como meta-progressão simples e sempre visível — fácil de implementar e gera motivação de "quebrar meu próprio recorde" sem precisar de ranking social.
4. **Troca de unidade ativa em combate com custo de oportunidade** (Pokémon caído não cura ao trocar de andar) — mecanicamente simples de replicar como "decisão de qual criatura mandar primeiro" mesmo em combate semi-automático.
5. **Separação clara entre meta-progressão (Card Packs / Your Teams, fora da partida) e execução (Arena Run, dentro da partida)** — estrutura modular limpa que separa "colecionar e montar" de "jogar a run", replicável diretamente na arquitetura do idle.

## 9. Riscos de IP

**[E]** Mesmo padrão de risco alto dos outros dois jogos: nome do produto referencia "Poke" diretamente, usa sprites oficiais/clássicos de Pokémon (Heracross, Espeon, Arcanine, Nidoking confirmados em jogo) e espécies com nomes 1:1 da franquia, apesar do disclaimer "UNOFFICIAL FAN GAME" exibido no canto da tela.

**[H]** O disclaimer de "unofficial fan game" (assim como o de "fan-made animation channel" do Battlegrounds) é melhor prática de boa-fé que o IdleDex (sem disclaimer visível), mas continua sendo uso direto e sistemático de marca registrada sem licença — mesmo risco de notificação de remoção.

**[H]** Terceira confirmação consecutiva do padrão do mercado de referência: **todos os 3 jogos jogados nesta Parte 2, como o IdleDex na Parte 1, usam IP da Pokémon Company de forma direta.** Isso valida ainda mais a decisão de GOVERNANCE do estúdio de criaturas e arte 100% originais — não é uma prática isolada, é como a categoria inteira de "idle/auto-battler de monstros de bolso" opera informalmente, e é exatamente o padrão a evitar.

---

## TL;DR

Poke2D Arena é o mais "jogo de verdade" dos três jogos de referência da Parte 2: combate 3v3 em tempo real com controle ativo (mira, dash, trocas de time), estrutura de masmorra literal de 6 andares com HP acumulado e andar de chefe marcado, e meta-progressão por coleção (Card Packs) e times salvos ("Your Teams"). Testamos e perdemos a floor 1 contra a CPU, confirmando que o jogo exige execução real — um único Espeon inimigo destruiu nosso time aleatório sem perder HP. A retenção se apoia em recorde pessoal ("BEST"/"CLEARS") e coleção, sem ranking social visível na sessão; monetização via Card Packs não foi totalmente explorada por segurança. **Risco de IP é igualmente alto** (sprites, nomes e espécies oficiais, com disclaimer "unofficial fan game"), fechando um padrão consistente nos três jogos: a mecânica de masmorra + chefe + combate ativo é um ótimo modelo a copiar, mas precisa ser 100% recriada com criaturas e arte originais do estúdio.
