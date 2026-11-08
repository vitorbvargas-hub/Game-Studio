# Teardown — Pokémon Battlegrounds

Explorado em 2026-11-08 (sessão de ~10 minutos: home page, "latest battles", seção "What is this?", página de votação/ballot). Evidências em `evidence/battlegrounds/`.

---

## 0. Nota crítica antes de tudo

**[E] Pokémon Battlegrounds NÃO é um jogo jogável.** É um site/canal de animação fã-feita que publica vídeos no YouTube de "batalhas Pokémon 6v6 em tempo real, animadas à mão em pixel art" (`01_home.png`). Não existe cliente de jogo, servidor de partida, personagem controlável ou sessão interativa de combate — a "interação" possível é assistir aos vídeos linkados e, periodicamente, votar num formulário (ballot) que define times e movesets usados nas próximas animações.

**[H]** Isso significa que boa parte das seções pedidas no template (onboarding, core loop, posicionamento/timing, UI de jogo) não se aplica a uma "jogatina" no sentido tradicional. Documentamos o que existe de fato e extraímos o que for aproveitável da mecânica de votação/engajamento de audiência.

---

## 1. Onboarding

**[E]** Não há onboarding de jogo. A home apresenta direto: cabeçalho com proposta de valor ("Real-time Pokémon battles, hand-animated in pixel art... the trainers think for themselves"), links para redes sociais (YouTube, Instagram, Facebook, TikTok, Discord), um aviso de "Vote closed — The teams are locked" e uma grade de "Latest battles" (vídeos do YouTube) (`01_home.png`).

**[H]** O "onboarding" real é simplesmente entender que se trata de um canal de conteúdo, não de um jogo — a seção "What is this?" existe exatamente para cobrir essa ambiguidade do nome do domínio/produto.

## 2. Core loop

**[E]** Loop de conteúdo, não de jogo: (1) a comunidade vota periodicamente em times e movesets de "campeões" (personagens canônicos da franquia, ex. Ash, Diantha, Brendan, May, Lance, Steven, Cynthia, Iris, Lucas, Cyrus, Alain) via formulário de votação; (2) quando a votação fecha, os times ficam travados ("the teams are locked"); (3) a equipe do canal produz e publica uma animação de batalha 6v6 em tempo real usando os times/movesets vencedores; (4) o público assiste e comenta "quem deveria lutar a seguir".

**[E]** Na sessão, a votação do torneio "Masters Eight" estava fechada, com a primeira semifinal ("Ash vs Diantha") já anunciada como próximo conteúdo.

## 3. Decisões ativas (draft, posicionamento, sinergias, timing)

**[E]** A única decisão ativa disponível ao usuário é a votação em si: na página `vote.html`, para cada campeão do torneio, o site pede (a) escolher os 6 Pokémon que ele deve usar, dentre uma lista restrita a Pokémon que o personagem "realmente usou" no anime/jogos oficiais, e (b) escolher até 4 movimentos para qualquer Pokémon que o usuário queira opinar — texto explícito: "For each champion, pick the 6 Pokémon they should bring... Pick 4 moves for any Pokémon you care about. You don't have to do all of them." (`02_ballot.png`).

**[E]** O formulário salva os votos localmente no dispositivo do usuário à medida que ele escolhe, com confirmação final via botão de envio — reduz fricção (pode votar aos poucos, sem conta).

**[H]** Não há draft em tempo real, posicionamento ou timing jogável — é curadoria/votação assíncrona, mais parecida com "fantasy sports" ou enquete de produção de conteúdo do que com mecânica de jogo.

## 4. Competição e ranking, eventos, chefes

**[E]** Estrutura de "torneio" editorial: "Masters Eight" é um bracket eliminatório entre 8 campeões (quartas de final, semifinais) cujos confrontos e resultados são decididos pela produção/animação (não por simulação de jogo real), anunciados como uma série de vídeos (`01_home.png` mostra 4 quartas de final já publicadas: Lance vs Steven, Cynthia vs Iris, Diantha vs Alain, e mais).

**[H]** Não há ranking de jogadores, XP, progressão de conta, chefe ou masmorra — o "chefe" aqui é conceitual (o campeão mais forte do bracket), não uma mecânica de jogo.

## 5. Monetização

**[E]** Nenhuma monetização direta observada — sem loja, sem moeda, sem anúncios de assinatura. Contato de negócios/colaborações é um e-mail (`pokemonbattlegrounds97@gmail.com`), sugerindo monetização indireta via YouTube (anúncios/patrocínio) fora do site.

## 6. Retenção

**[E]** Retenção é inteiramente de audiência de conteúdo: cadência de publicação de vídeos (bracket de torneio gera expectativa serial — "quem vence essa semifinal?"), link direto para redes sociais e Discord para discussão entre episódios.

**[H]** O mecanismo de "votação da comunidade decide o time/moveset do próximo vídeo" é um gancho de retenção forte e transferível: dá à audiência senso de autoria/agência sobre o resultado sem exigir que ela "jogue" de fato.

## 7. UI/UX e arte

**[E]** Site estático simples, tema escuro com destaque em vermelho, grid de thumbnails de vídeo estilo "vs" (ex. "ASH vs DIANTHA" com splash art dos dois treinadores e seus times) (`01_home.png`).

**[E]** Créditos no rodapé: "Pokemon Battlegrounds is a fan-made animation channel. It is not affiliated with, sponsored or endorsed by Nintendo, Game Freak or The Pokémon Company." e "Pokémon sprites: PMD SpriteCollab (CC BY-NC 4.0)" — mesma fonte de sprites de fã citada no teardown do IdleDex.

## 8. Ideias aproveitáveis num idle de coleção (top 5)

1. **Votação de comunidade decidindo o "roster" ou moveset de um evento futuro** — pode virar um evento periódico no idle (ex.: "vote em quais 3 criaturas o chefe da semana vai usar") que gera agência e conversa social sem exigir patch de conteúdo pesado.
2. **Bracket eliminatório editorial/visível** (quartas → semifinal → final) como estrutura de evento sazonal — dá narrativa e expectativa a um sistema de ranking, mesmo que o resultado real seja decidido por simulação automática do próprio jogo.
3. **Confronto "vs" como unidade de conteúdo compartilhável** (thumbnail com os dois lados e seus times) — aplicável a replays de PvP ou de chefe no idle, pensado para ser compartilhado fora do jogo (social/Discord).
4. **Votos salvos localmente / baixa fricção de participação** (não precisa criar conta para opinar, só confirmar no fim) — reduz fricção de engajamento em enquetes/eventos de decisão da comunidade dentro do idle.
5. **Separar "quem */o quê vence" (simulação/backend) de "como foi contado"** (apresentação/narrativa) — sugere que eventos de chefe ou PvP no idle podem ter uma camada de "replay narrado" ou resumo visual, não só um resultado numérico seco.

## 9. Riscos de IP

**[E]** Mesmo padrão de risco do IdleDex e do Auto Chess: uso direto de personagens de treinadores oficiais (Ash, Diantha, Cynthia, Lance, Steven, Iris, Brendan, May, Lucas, Cyrus, Alain), nomes de locais oficiais (Wyndon Stadium, Route 103, Spear Pillar), espécies oficiais e sprites de fã (PMD SpriteCollab) — tudo sem licença oficial, operando como canal de animação/fã-arte.

**[H]** O disclaimer de não-afiliação no rodapé é uma prática melhor que a ausência total de aviso vista no IdleDex, mas não elimina o risco de C&D — apenas sinaliza boa-fé. **Reforça novamente a diretriz do estúdio**: nenhum nome, personagem ou espécie da franquia Pokémon deve aparecer no produto do GS-003, mesmo como "homenagem" ou "fan content" — o padrão de mercado observado nos 3 jogos de referência é consistentemente de alto risco.

---

## TL;DR

Pokémon Battlegrounds não é um jogo, é um canal de animação fã-feita: produz vídeos de batalhas 6v6 em tempo real e usa um formulário de votação comunitária (escolher 6 Pokémon + até 4 movimentos por campeão de um torneio-bracket fictício) para decidir o conteúdo do próximo vídeo. A "decisão ativa" do usuário é opinar/votar, não jogar — mas essa mecânica de agência de audiência sobre um bracket de torneio é um gancho de retenção/engajamento comunitário transferível para eventos sazonais de um idle. Não há monetização, ranking de jogador nem progressão — é puro conteúdo editorial. **Risco de IP é igualmente alto**: usa personagens, locais e espécies oficiais da franquia Pokémon de forma direta, com disclaimer de não-afiliação no rodapé (melhor prática que os outros dois jogos, mas não elimina o risco). Reforça a necessidade de criaturas, nomes e arte 100% originais no GS-003.
