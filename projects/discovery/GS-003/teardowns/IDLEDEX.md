# Teardown jogado — IdleDex

**Parte:** GS-003, Parte 1a (teardown jogando: IdleDex + wiki)
**Autor:** game-qa (Nação Games)
**Data:** 2026-11-08
**Conta de teste:** personagem "NacaoGames", starter Charmander, criada do zero nesta sessão
**Fonte:** https://idledex.com/play (Chrome, perfil logado do fundador) e https://wiki.idledex.com/
**Duração da sessão:** ~30 min jogando (criação de personagem até Nv. Treinador 5-7, charmander Lv7) + leitura da wiki

---

## 1. Primeira impressão e onboarding

**[E]** O fluxo de entrada é: tela de criação de personagem → escolher 1 de 84 visuais de treinador → escolher 1 dos 3 starters (Bulbasaur, Charmander, Squirtle) → nome do treinador (2-15 caracteres) → confirmar. Em menos de 10 segundos o personagem já está no mundo, com o starter em nível 5 (não nível 1), silver inicial de 5.000 e 0 gold (moeda premium).

**[E]** Assim que o personagem aparece, um NPC "Joy" (referência a Enfermeira Joy da franquia Pokémon) oferece um tutorial opcional de 2 passos: (1) tocar no botão AUTO para abrir o painel de automação, (2) tocar em "INICIAR" dentro dele. Isso é tudo o que é preciso para o jogo começar a jogar sozinho — captura, batalha e cura já vêm ligadas por padrão.

**[E]** Tempo até a "primeira diversão" (primeira captura, primeiro level up): menos de 1 minuto após ligar o AUTO. O jogo literalmente joga por conta própria a partir daí; o jogador só observa o log de batalha rolando.

**[E]** Pontos de atrito observados:
- O tutorial usa overlays sobrepostos (diálogo de tutorial + popup de level up + popup de captura) que por vezes bloqueiam cliques em botões do menu (erros de "elemento coberto" durante a sessão de QA), sugerindo que em mobile isso pode gerar frustração/cliques perdidos nos primeiros minutos.
- Não há explicação inicial do que é "silver" vs "gold" (moeda premium) — o jogador só entende a diferença ao abrir a Loja de Gold.
- Missões diárias, Pokédex, Eventos e Ranking ficam todos disponíveis desde o segundo 1, sem sequenciamento — pode ser overwhelming para um jogador realmente novo (ainda que o fundador, como veterano do gênero, não tenha sentido isso).

**[H]** Pelo ritmo (XP e níveis sobem muito rápido nos primeiros minutos — o personagem foi de Nv. Treinador 1 a 5 em ~15 min de AUTO), o onboarding parece desenhado para dar uma sensação de progresso imediato e "gancho" rápido, didaticamente alinhado ao padrão de idle games.

**Resumo onboarding:** curva de entrada muito rasa e rápida (bom para ativação), mas quase nenhuma decisão real é pedida ao jogador nos primeiros minutos — tudo que ele faz é clicar em "AUTO" e assistir.

---

## 2. Core loop e meta-loops

**[E] Loop central (minuto a minuto):** o time (até 6 slots, 2 liberados de graça + 4 compráveis) anda sozinho pelo mapa em modo AUTO, encontra pokémon selvagens, briga e tenta capturar com a bola configurada. Cada vitória dá XP (treinador e pokémon), silver, e chance de item. Pokémon capturados vão para a Box (free: 200 vagas, premium: até 1.100+ com expansões pagas).

**[E] Meta-loops identificados:**
- **Captura/coleção:** Pokédex com 1.025 espécies (wiki cita "743 espécies encontráveis" no servidor atual), cada captura dá bônus permanente de captura (+0,05%/espécie, teto +30%).
- **Evolução:** pokémon evolui por nível (ex.: charmander → charmeleon no Lv16), consumindo "doces"/vitaminas também é possível pela loja.
- **Batalha automática (idle):** motor de batalha real (dano, status como queimadura/veneno, efetividade de tipo) roda sozinho; o jogador pode assumir manualmente (recurso "MANUAL", marcado como PREMIUM na HUD).
- **Offline progress [E, confirmado na wiki]:** se o jogador sai com o AUTO ligado num mapa de caça, o time continua caçando offline por até 4h (grátis) ou 8h (premium); ao voltar, um "Relatório Offline" resume derrotas, capturas, silver e level ups. Teto rígido — ficar off além do teto não rende mais.
- **Prestígio/endgame real (via wiki):** existe um arco narrativo tipo "campanha" — Jornada com ginásios, Equipe Flare (facção vilã) e escolha final entre dois lendários — funcionando como uma camada de prestígio temático em cima do idle puro.

**[E]** O AUTO cobre captura + batalha + cura (poção automática) por padrão; o jogador raramente precisa interagir, exceto para reabastecer itens na loja, reorganizar equipe, ou entrar em conteúdo manual (ginásios, PvP, eventos, mini-desafios).

---

## 3. Onde o jogador decide de verdade vs. onde é só esperar

**Decisões reais observadas [E]:**
- Escolha do starter e composição de equipe (até 6 slots, ordem importa para "Exp Share" — quem está em slot com esse ícone ganha XP sem lutar).
- Qual bola comprar/usar (Poke/Great/Super/Ultra Ball — trade-off custo vs. taxa de captura).
- Em que rota/mapa caçar (cada rota tem pokémon e níveis diferentes; rotas de evento/guerra de guilda têm valor estratégico).
- Composição de time para PvP Ranqueado (regras de banidos tipo "Uber", 1 lendário no máximo, habilidade obrigatória).
- Decisões de guilda: entrar/sair da Guild War, usar Guild Flag (bônus de XP/silver/captura/dano/shiny por rota), duelo de guerra contra jogador rival.
- Escolhas de progressão de História: arco da Equipe Flare é 100% manual (o AUTO nunca engaja esses NPCs), e a escolha final entre os dois lendários é definitiva (não pode ser desfeita) — é o único "momento de peso narrativo" real do jogo.
- Gerenciamento de Mega Evolução: qual pokémon carrega a pedra Mega (só 1 por equipe), gerida por um recurso de "stamina" que se recarrega com fruta cultivável.

**Onde é só esperar [E]:**
- O grind cru de XP/captura via AUTO — é 100% passivo, inclusive offline.
- A maior parte da jornada de nível 1 a dezenas de níveis é apenas acumular tempo com AUTO ligado.
- Missões diárias em sua maioria são cumpridas automaticamente pelo AUTO rodando (capturar N, derrotar N) — não exigem decisão, só tempo.

**[H]** A proporção observada é fortemente inclinada para "esperar": das ~15 superfícies de menu testadas, só PvP, Guild War, arco de história e composição de equipe pedem decisão ativa; o resto (Pokédex, Missões, Ranking, Loja) é consequência passiva do AUTO.

---

## 4. Sistemas: eventos, ranking, chefes, dungeons, gacha, economia, monetização e anúncios

**Eventos [E, confirmado na wiki /mechanics/events e no calendário in-game]:**
- Calendário mensal visível in-game com categorias: Evento sazonal, Legendary Raid, Lendário solto.
- Horário fixo recorrente: World Boss (anunciado na hora), Arena PvP (anunciado na hora), Festival de Mineração, Safari, Festival de Pesca (a cada 60min, janela de 15min), Boss diário da guilda (a cada 1440 min = 1x/dia).
- Mega Boss semanal (aos sábados) — dá "Mega Token" para comprar pedras Mega na loja dedicada.
- "Apagão de Lumiose" — evento semanal coletivo (terça e sábado, 20h-22h BRT) com meta comunitária de 200 vitórias somando todos os jogadores, prêmio de 250.000 silver + itens.

**Ranking [E]:** múltiplos leaderboards — Progresso (por Nível, Evoluções ou Maior nível), Coleção, Semana, Guildas. Atualização diária às 12h. Jogadores do topo visíveis com apelidos reais (ex.: líder com 232 níveis), evidência de que o servidor tem comunidade ativa e veterana.

**Chefes/raids [E]:** World Boss, Mega Boss (semanal), boss diário de guilda, Legendary Raids — citados tanto no calendário quanto nas missões do Passe de Batalha.

**Dungeons/masmorras [E, wiki]:** não há "dungeon" tradicional isolada; a progressão por rotas + os arcos de ginásio/Equipe Flare com salas sequenciais ("4 bases", "5 salas por ginásio") cumprem esse papel.

**Gacha/sorte [E]:**
- Captura em si tem elemento de chance (shiny 1/80.000 base, escalável via "Shiny Boost" que sobe uma escada de 11 degraus ao longo de até 11h de boost acumulado, chegando a 1/100).
- "Caixa Misteriosa" no kit diário (conteúdo surpresa).
- Loja de gold vende "Gold Ball" (captura x5) com moeda premium — sem ser gacha puro de personagem, mas com mecânica de sorte monetizável.

**Economia e moedas [E]:**
- Silver: moeda soft, ganha em batalha, gasta em loja/suprimentos.
- Gold: moeda premium (comprada ou ganha via eventos como Mega Boss), usada em Premium, itens de vantagem (Gold Ball, Impulso de Loot), expansão de Box, cosméticos.
- Pass Token: moeda do Passe de Batalha (ganho jogando, gasto em loja exclusiva — monturas, títulos, recolor de shiny).
- Moeda de contribuição de guilda: ganha doando ou no boss da guilda, gasta em loja de guilda (reset de EV, extrator de pedra, vagas de box).
- **Mercado entre jogadores [E]:** há uma aba "Mercado" com comprar/vender/"minhas ofertas"/histórico — uma espécie de auction house, com limite de ofertas ativas (10 free / 30 premium).

**Monetização [E, visitado sem comprar nada]:**
- Assinatura "Premium" (30/60/90 dias, ~R$ equivalente a 8-10 gold/dia): libera Box maior, caçada offline mais longa (8h vs 4h), +50% rankexp, mais ofertas no mercado, teto maior de banco de silver, troca direta entre jogadores, crew de até 5 com Exp Share em grupo, 18 visuais exclusivos, selo premium no chat.
- Itens avulsos com gold: Bênção (protege silver), Gold Ball, Impulso de Loot.
- "Suprimentos" (pacotes com limite diário de compra — ex.: 50x Gold Ball por 100 gold, limite "hoje: 0/100").
- "Kit diário" (conteúdo rotativo, 1 compra/dia).
- Expansão de Box por gold (permanente).
- Cosméticos: 16 visuais de treinador, 7 banners — "seu para sempre".
- **Nenhum anúncio (ads) foi observado na sessão** — o modelo parece ser 100% IAP/assinatura, sem vídeo-recompensado nem anúncio intersticial visível nesta versão web.

**[H]** O modelo de monetização é bem desenhado para não parecer pay-to-win agressivo: a maior parte dos benefícios Premium é conveniência/velocidade (mais tempo offline, mais Box, mais mercado), não poder bruto em PvP — ainda que "Rankexp x1.5" e Exp Share em grupo de Premium deem vantagem real de progressão.

---

## 5. Retenção

**[E]**
- **Diário:** Missões do dia (3 itens, renovam em 14-24h), "Recompensas diárias" com contador de sequência ("0 de 21 · sequência de 0 dia" — streak visível de recompensas, resgatável 1x/dia).
- **Passe de Batalha:** temporada de 30 dias, com trilha free + Deluxe (paga), 55 níveis, 3 camadas de missão (diária/semanal/temporada), troca de missão limitada por dia/semana/temporada. É o sistema de retenção mais denso do jogo — combina curto prazo (diárias) com médio (semanal, com "tema de tipo" que direciona onde caçar) e longo (temporada inteira).
- **Metas de curto prazo:** objetivo contextual na HUD (ex.: "Conclua 10 combates", "Saia da vila: viaje para a Rota 1") guia o jogador logo após o tutorial.
- **Metas de longo prazo:** Pokédex completa (1.025 espécies), arco de história (ginásios + Equipe Flare + lendário), Ranking semanal/sazonal, Guild War (disputa territorial contínua entre guildas, reseta diariamente mas acumula pontos de temporada).
- **Notificações in-game:** sino de avisos (34-35 "avisos novos" observados ao longo da sessão — sistema de notificação ativo), "Coletor pronto!" (NPC que pede entregas por rota, renovando).
- **Social como retenção:** guildas (custam 25.000 silver para fundar), chat, "Social", convite de amigos, grupo de WhatsApp e Discord linkados direto na HUD principal — forte aposta em retenção via comunidade, não só mecânica solo.

**[H]** O Passe de Batalha com tema semanal por tipo de pokémon é a peça de retenção mais sofisticada: ele literalmente redireciona o jogador para rotas diferentes a cada semana, criando variedade dentro do mesmo loop idle.

---

## 6. Desafio e curva de dificuldade

**[E]**
- Nos primeiros níveis (Treinador 1-5), o desafio é essencially zero — o time via AUTO vence quase tudo sozinho; o único "perigo" real observado foi o Charmander chegando a 1/22 HP antes do jogo reagir com poção.
- A Pokédex/wiki mostra curva de gating clara: ginásios exigem nível mínimo crescente da equipe (Lv14 → Lv21 → Lv29 → Lv38 → Lv49 → Lv63 → Lv79 → Lv94 → Lv95 para a Liga), isso é o principal "muro" de longo prazo.
- PvP Ranqueado trava nível real máximo 100, 6v6 "todos lutam", com lista de banidos ("Uber", copiada explicitamente das regras de Uber do Pokémon Showdown segundo a própria wiki) — curva de dificuldade real só aparece aqui e nos ginásios/arcos manuais.
- Guild War introduz competição direta entre guildas por controle de rota (20 rotas), com "duelo de guerra" iniciado por contato no mapa — é o ponto mais "hardcore"/social do jogo.

**[H]** A dificuldade do jogo é quase inteiramente opcional/deferida: o jogador casual nunca sente parede nenhuma porque o AUTO absorve o grind; quem quer desafio precisa ativamente buscar PvP, ginásios e Guild War.

---

## 7. UI/UX, mobile vs desktop, performance, estilo de arte

**[E]**
- A UI é em pt-BR, estilo "overlay de painéis" sobre um mapa 2D top-down em pixel art.
- FPS observado entre 29-60 (variável), latência de rede entre 34-91ms na maior parte da sessão (um pico isolado de 408ms).
- Botão "Instalar IdleDex" sugere PWA instalável, e "Abrir mini-janela" sugere modo picture-in-picture pensado para multitarefa (jogar em segundo plano enquanto faz outra coisa) — decisão de design muito alinhada ao gênero idle.
- Estilo de arte: sprites e tileset no estilo visual direto dos jogos Pokémon de Game Boy Advance/NDS (grama, Centro Pokémon com teto vermelho, "SHOP", "GYM") — tecnicamente pixel art genérica, mas a composição de cores/silhuetas é deliberadamente reconhecível como "um jogo Pokémon".
- Menu inferior com até 14 botões de navegação (Loja de Gold, Auto, Curar, Box, Loja, Missões, Eventos, Pokédex, Ranking, Guilda, Social, Config, Atividades, PvP, Sair) — denso, mas organizado com badges de notificação (contadores vermelhos) em itens com pendência.

**[H]** Não testamos em mobile real (sessão rodou via navegador desktop/Chrome); dado o botão de instalação PWA e o modo mini-janela, o jogo claramente foi desenhado mobile-first/cross-platform, mas isso não foi validado diretamente nesta sessão.

---

## 8. O que fazer MELHOR (top 10, priorizado) e o que copiar como mecânica genérica

**Top 10 — oportunidades de melhoria para a Nação Games (não cópia, mecânica genérica apenas):**

1. **Decisões reais mais cedo.** No IdleDex, os primeiros 20-30 min são 100% passivos. Nosso jogo deveria inserir ao menos 1-2 decisões táticas reais (ex.: escolher tipo de time, rota de risco/recompensa) já nos primeiros 5 minutos, sem quebrar a promessa de "fácil e automático".
2. **Tutorial sem sobreposição de popups.** Resolver o problema de overlays empilhados (tutorial + level up + captura) que trava cliques — nosso onboarding deve enfileirar popups, nunca empilhar.
3. **Clareza moeda soft vs. premium desde o segundo 1** — um tooltip ou tela simples explicando a diferença, o IdleDex só deixa isso implícito.
4. **Passe de Batalha com tema semanal rotativo** (direciona onde jogar) é uma mecânica genérica muito boa — vale copiar o conceito (não os nomes/temas), pois cria variedade sem exigir novo conteúdo.
5. **Offline progress com teto diferenciado free/premium** é um padrão de monetização saudável (não É pay-to-win, é conveniência) — vale adotar.
6. **Streak de recompensa diária visível com contador de sequência** é simples e eficaz — manter.
7. **Reduzir a profundidade do menu principal.** 14 botões é muito para um jogo "fácil" — nosso produto deveria agrupar em categorias (ex.: Jogar / Coleção / Social / Loja) desde o início.
8. **Sistema de "revanche" com 1 grátis/dia + custo crescente em moeda soft** para conteúdo de chefão é um bom mecanismo de monetização sem ser agressivo — genérico, vale copiar.
9. **Investir em um momento de decisão narrativa definitiva** (tipo a escolha entre os 2 lendários) — cria um "momento de peso" raro num jogo majoritariamente idle; é um gancho emocional de baixo custo de desenvolvimento.
10. **Território/guilda com disputa territorial (Guild War)** é o sistema social mais engajante observado — adaptar o conceito (guildas disputando "zonas" com bônus temporários) é uma boa alavanca de retenção social sem copiar a mecânica Pokémon-específica (banners, times, nomes).

**O que copiar como mecânica genérica (sem nomes/arte/marca):**
- Captura com taxa de sucesso variável por "tipo de item de captura" (bola comum/rara/premium).
- Sistema de boost de sorte "em escada" (shiny boost) — acumula tempo, sobe degraus, reseta ao usar o prêmio.
- Guild War com pontuação por hora cheia baseada em "fatia de presença acumulada" — é elegante e justo.
- Passe de Batalha com 3 camadas de missão (diária/semanal/temporada) e troca limitada de missão.
- Mercado entre jogadores com limite de ofertas ativas escalável por assinatura.

---

## 9. Riscos de IP percebidos — ALERTA ALTO

**[E] O IdleDex usa IP da Nintendo/Game Freak/The Pokémon Company de forma direta, extensa e sistemática.** Evidências coletadas nesta sessão (screenshots em `evidence/idledex/` e trechos textuais da wiki oficial do jogo):

- **Starters e espécies:** tela de criação de personagem oferece literalmente "Bulbasaur", "Charmander" e "Squirtle" como nome dos monstros iniciais (ver `01_criacao_personagem.png`).
- **Pokédex com numeração oficial:** "4/1025 capturados", usando nomes e números nacionais reais (#004 charmander, #021 spearow → fearow, #029 nidoran-f, #032 nidoran-m, #108 lickitung → lickilicky) — ver `06_pokedex.png`.
- **Itens com nomes 1:1 da franquia:** Poke Ball, Great Ball, Super Ball, Ultra Ball, Potion, Super Potion, Hyper Potion, Max Potion, Revive, Max Revive, Ether, Max Ether, Elixir, Max Elixir — ver `09_loja.png`.
- **Regiões oficiais usadas como áreas do jogo:** Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos (confirmado na wiki, seção Guild War, com nomes de rotas por região).
- **Mega Evolução completa, com nomes oficiais de pedra Mega** (Charizardite X/Y, Mewtwonite X/Y, Gardevoirite etc.) e 90 formas Mega listadas 1:1 com a franquia (wiki `/mechanics/mega`).
- **Arco de história "Equipe Flare"** — nome idêntico ao time vilão de Pokémon X/Y, com personagens nomeados igual ao jogo oficial: Lysandre, Xerosic, Celosia, Mable (Admins da Flare), culminando na escolha entre **Xerneas** e **Yveltal** (lendários oficiais de X/Y).
- **Ginásios e Liga de Kalos com líderes de ginásio oficiais:** Viola, Grant, Korrina, Ramos, Clemont, Valerie, Olympia, Wulfric, e a campeã **Diantha** — nomes e ordem idênticos aos do jogo oficial Pokémon X/Y, incluindo nomes de insígnia (Bug Badge, Cliff Badge, Rumble Badge etc.).
- **Lista de banidos "Uber" referenciando explicitamente o "Pokémon Showdown"** (simulador de batalha não-oficial, mas fortemente associado à marca Pokémon) como fonte da regra.
- **Local oficial "Lumiose"** (cidade de Pokémon X/Y) usado como hub.
- **Professor Lab, "Jessie" (nome de vilã da série Team Rocket), "Meowth"** citados como NPCs/mecânicas (loja do Professor, "vender para a Jessie", "entregar épicos ao Meowth").

**[H] Avaliação de risco:** Isto não é "jogo inspirado em Pokémon" — é, na prática, uma recriação funcional e nominal extremamente próxima da franquia Pokémon (espécies, itens, regiões, personagens de enredo, nomes de insígnia, lendários, Mega Evolução), hospedada publicamente e, aparentemente, operando monetização direta (assinatura Premium, venda de moeda premium) sem relação aparente com a The Pokémon Company/Nintendo/Game Freak. Isso coloca o IdleDex em risco altíssimo de notificação de remoção (DMCA/C&D) e serve de **alerta direto** para o projeto GS-003: a recomendação de GOVERNANCE do estúdio (criaturas, nomes e arte 100% originais) deve ser seguida à risca — o IdleDex é o exemplo vivo do que **não fazer** em termos de proteção de marca/propriedade intelectual, mesmo sendo (aparentemente) um produto popular e bem avaliado pelo fundador.

**[H]** Não foi possível confirmar a origem/licenciamento dos sprites (arte não foi extraída nem baixada, conforme regra de segurança da tarefa); a análise de estilo de imagem e sprites fica para a Parte 3 do GS-003 (Arte e assets).

---

## TL;DR

O IdleDex entrega onboarding rápido e indolor (menos de 1 minuto até o AUTO assumir o jogo), mas é fortemente passivo: a maioria da experiência é esperar o automático jogar, com decisões reais concentradas em composição de equipe, PvP, Guild War e um único arco narrativo com escolha definitiva. Os sistemas de retenção (Passe de Batalha em 3 camadas, streak diário, offline progress com teto, eventos calendarizados, guilda territorial) são maduros e bem desenhados, e a monetização observada é majoritariamente de conveniência (Premium), não pay-to-win. **O risco mais crítico é de propriedade intelectual: o jogo usa nomes, numeração, itens, regiões, personagens de enredo e Mega Evolução idênticos à franquia Pokémon**, sem disfarce — um padrão que o GS-003 precisa evitar categoricamente, migrando só os conceitos de mecânica (loop idle, passe de batalha, boost de sorte em escada, disputa territorial de guilda) para criaturas, nomes e arte 100% originais.
