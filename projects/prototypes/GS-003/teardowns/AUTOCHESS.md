# Teardown — Pokémon Auto Chess

Jogado em 2026-11-08 (sessão de ~15 minutos: lobby, fila de sala "Classic" 8 jogadores, fase de picks de ovos, estágios 0–2 de combate). Evidências em `evidence/autochess/`.

---

## 1. Onboarding

**[E]** Sem tutorial dedicado: o jogo cai direto no lobby com Tabela de Classificação (Elo/Nível/Bots), lista de Salas disponíveis (Clássico, Jogo Rankeado, "Garabato do Smeargle", Double Up, Jogo personalizado) e feed de Eventos/Anúncios (`01_lobby.png`).

**[E]** Para jogar é preciso entrar numa sala e esperar ela encher (8/8 jogadores) — na sala "Classic" (modo casual, sem ganho/perda de Elo) levou cerca de 2 minutos reais para passar de 3/8 para 8/8 e iniciar a partida (`02_sala_espera.png`, `03_preparo_inicial.png`).

**[E]** Assim que a partida começa (Estágio 0), todos os 8 jogadores entram numa fase de "pick" compartilhada: 6 ovos no centro do mapa, cada jogador escolhe um Pokémon inicial de uma prateleira de loja compartilhada (Fennekin, Vulpix, Charmander, Solosis, Treecko, Chespin na nossa partida) (`04_partida_inicio.png`).

**[H]** Não há explicação textual de regras dentro do jogo nesse fluxo — o onboarding pressupõe que o jogador já conhece auto-battlers (tipo TFT) ou vai aprender por tentativa e erro / Wiki externa.

## 2. Core loop

**[E]** Loop por estágio: (1) fase de preparo — comprar/vender unidades na loja (5 slots, custo em "$"), rolar (atualizar) a loja, posicionar o time no tabuleiro hexagonal-like, comprar XP para subir de nível e destravar mais slots de time; (2) fase de combate automático — o time luta sozinho (sem input direto) contra um adversário (outro jogador ou, nos estágios iniciais, "Selvagem" PvE — enfrentamos Magikarp e Rattata) (`06_combate.png`, `07_preparo_lvl.png`).

**[E]** HP coletivo (100 de vida) é compartilhado por jogador e cai a cada combate perdido; o jogo é eliminação progressiva até sobrar 1 jogador.

**[H]** O combate em si é 100% automático/idle — a única interferência do jogador acontece na fase de preparo entre rounds.

## 3. Decisões ativas (draft, posicionamento, sinergias, timing)

**[E]** Draft: escolha de unidades em pool compartilhada e limitada entre 8 jogadores (shared pool) — comprar uma carta reduz a chance de outro jogador pegá-la, criando disputa indireta por composição.

**[E]** Posicionamento: unidades são arrastadas manualmente para hexágonos do tabuleiro antes de cada combate; a posição influencia quem é alvo primeiro, área de efeito, etc.

**[E]** Sinergias: painel lateral "Sinergias" mostra contagens de tipo/classe (ex.: Psíquico 1/3/5/7, Inseto 1/2/4/6/8, Fogo 1/2/4/6/8, Amorfo 1/3/5/7, Humanoide 1/2/4/6) com thresholds que destravam bônus — decisão central é montar composição em torno de 2–3 sinergias simultâneas (`06_combate.png`).

**[E]** Timing/economia: decidir entre gastar ouro em XP (subir nível, mais slots de time) vs. rolar a loja (achar unidades fortes) vs. guardar ouro (juros/interest, padrão do gênero) é a decisão estratégica central a cada round.

**[H]** Pelo tempo jogado não avançamos a estágios tardios com itens/evoluções completas, mas a estrutura de "preparo ativo + combate passivo" por round é o padrão clássico de auto-chess (TFT/Auto Chess), bem mais decisório que um idle convencional.

## 4. Competição e ranking, eventos, chefes

**[E]** Ranking global por Elo visível no lobby (Top 18 nomeado, com alguns jogadores linkados ao Twitch) e abas separadas para ranking por Nível e por partidas contra Bots.

**[E]** Salas com matchmaking rankeado por faixa de Elo (ex.: "[1050-1149] Ranked Match", "[<1050] Ranked Match") e salas casuais "apenas para diversão, sem ganho/perda de Elo".

**[E]** Evento anunciado no feed do lobby: "Pokemon Auto Chess Tour #40" agendado para 14/11/2026 — torneio competitivo recorrente.

**[H]** Não há "chefe" ou "masmorra" no sentido PvE clássico — a competição é inteiramente PvP (8 jogadores), com rounds PvE de "Selvagem" (wild Pokémon) apenas nos primeiros estágios, funcionando como tutorial de poder, não como desafio de masmorra.

## 5. Monetização

**[H]** Não foi observada nenhuma oferta de compra, loja de moeda premium ou pop-up de monetização na sessão jogada — o jogo parece ser gratuito e sustentado por doações/Discord/comunidade (há link para Discord e "Servidores da Comunidade" no menu, sugerindo hospedagem por fãs/voluntários).

**[H]** Isso é consistente com o fato de ser um fangame sem afiliação oficial (ver seção 9) — monetização agressiva aumentaria ainda mais o risco de notificação de remoção.

## 6. Retenção

**[E]** Ranking competitivo persistente (Elo) e torneios recorrentes anunciados (Tour #40) são os principais ganchos de retenção observados.

**[E]** Ferramentas satélites extensas no menu lateral — Wiki, Meta (tier list da comunidade), Planejador de Times, Replays, PokéGuesser (minigame), Roda de Sinergia, Construtor de Bots, Gameboy (provavelmente minigames retrô), Criador de Tier List, Sprite Tracker — sugerem uma comunidade madura com ferramentas de meta-aprendizado fora da partida em si, forte alavanca de retenção "fora do jogo".

**[H]** Partidas "apenas para diversão" sem risco de Elo reduzem fricção para jogar casualmente, o que ajuda engajamento recorrente sem medo de perder rank.

## 7. UI/UX e arte

**[E]** Arte usa sprites e artes oficiais de Pokémon diretamente (splash art do lobby com Charizard, Pikachu, Piplup/Empoleon, Shaymin; sprites de batalha estilo jogos portáteis clássicos — Fennekin, Vulpix, Charmander, Solosis, Treecko, Chespin visíveis na loja) (`01_lobby.png`, `04_partida_inicio.png`).

**[E]** Tabuleiro de combate usa tileset estilo RPG 2D top-down (grama, água, estruturas), com HUD compacto de HP/gold/XP na parte inferior e sinergias na lateral esquerda — bastante denso de informação, mas organizado.

**[H]** UI é funcional e eficiente, mas com curva de aprendizado alta (muitos ícones/sinergias sem legenda textual inline) — adequada a jogador recorrente de auto-battler, não a iniciante casual.

## 8. Ideias aproveitáveis num idle de coleção (top 5)

1. **Fase de preparo ativa entre rounds de combate automático** — decisão real (comprar/vender/posicionar) seguida de resolução automática é um padrão direto para dar "jogatina de verdade" a um idle sem exigir micromanagement constante durante o combate.
2. **Sinergias por contagem de tipo com thresholds visíveis** (1/3/5/7 etc.) — mecânica de composição de time clara e replicável com criaturas 100% originais, dá profundidade estratégica sem complexidade de regras novas.
3. **Pool compartilhado/competitivo de recrutamento** — adaptável a um "mercado" ou "loja rotativa" onde a escassez de unidades fortes cria decisões de timing, mesmo em single-player (ex.: loja com estoque limitado por servidor/evento).
4. **Salas "apenas por diversão" sem risco de rank** ao lado de modos rankeados — reduz fricção para engajamento casual mantendo competição séria disponível para quem quiser.
5. **Ecossistema de ferramentas de meta fora do jogo** (tier list, planejador de time, replays) — não precisa ser tudo nativo no app, mas uma versão simplificada (ex.: tela de "times recomendados" ou "melhores builds da semana") fortalece retenção pós-sessão.

## 9. Riscos de IP

**[E] ALERTA ALTO — mesmo padrão identificado no IdleDex.** O jogo usa diretamente: nome "Pokemon Auto Chess" na marca do produto; roster completo de Pokémon com nomes oficiais (Fennekin, Vulpix, Charmander, Charizard, Pikachu, Empoleon, Shaymin, etc.); itens com nomes oficiais (Ultra Ball usado como ícone de ranking); sprites/artes idênticos aos jogos oficiais da franquia.

**[H]** Diferente do IdleDex (sem disclaimer visível na sessão), não vimos texto de "jogo não-oficial" no lobby desta sessão, mas o padrão de uso de IP é igualmente direto e sistemático — risco de notificação de remoção é real e análogo ao do IdleDex.

**[H]** Confirma a diretriz de GOVERNANCE do estúdio: estudar a mecânica (fase de preparo + sinergias + combate automático), nunca reaproveitar nomes, numeração ou arte.

---

## TL;DR

Pokémon Auto Chess é um auto-battler PvP multiplayer (8 jogadores) com onboarding mínimo, mas um loop extremamente decisório: cada round alterna entre preparo ativo (comprar/vender/posicionar/sinergias/economia de ouro) e combate 100% automático. A competição é central — ranking de Elo, salas rankeadas por faixa, torneios recorrentes anunciados — sem conceito de "chefe" ou "masmorra" PvE tradicional (PvE aparece só como aquecimento nos primeiros estágios). Não há monetização visível na sessão jogada, e a retenção se apoia fortemente num ecossistema de ferramentas de meta fora da partida (tier list, replays, planejador). **Risco de IP é alto e do mesmo padrão do IdleDex**: nomes, sprites e arte oficiais da franquia Pokémon usados 1:1, sem disfarce — reforça que o GS-003 deve extrair só a mecânica de "preparo ativo + resolução automática + sinergias por contagem" com criaturas e arte 100% originais.
