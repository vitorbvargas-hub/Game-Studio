# Teardown jogando — Pokechill

**Jogo:** Pokechill (https://play-pokechill.github.io/)
**Data da sessão:** 2026-11-08
**Jogador de teste:** NacaoGames (conta nova, sem progresso anterior)
**Duração da sessão:** ~18 minutos de interação ativa (seleção de starter + onboarding guiado por mentor + 1 ciclo completo de combate automático até resumo de batalha)
**Evidência:** `~/projects/GameStudio/projects/discovery/GS-003/evidence/pokechill/` (10 capturas de tela numeradas)
**Nota técnica:** o jogo é renderizado via DOM/CSS com coordenadas que não batem 1:1 com a imagem de tela — cliques por texto/ref funcionaram de forma confiável; cliques por coordenada "no olho" a partir do screenshot frequentemente erraram o alvo.

---

## 1. Onboarding passo a passo

[E] Fluxo observado:
1. Tela inicial "Select a starter!" com 3 opções: Litten (Fire), Turtwig (Grass), Froakie (Water) — nomes oficiais de starters de gerações diferentes de Pokémon (Gen 7, Gen 4, Gen 6), misturados numa única escolha "genérica" de tipo. Fundo decorativo cheio de silhuetas de centenas de Pokémon oficiais.
2. Escolhido: Froakie. Sem tela de nome de personagem/Treinador visível nesta etapa inicial (o nome "NacaoGames" só aparece depois, vinculado à conta/perfil).
3. Um "mentor" (NPC sprite estilo treinador) dá instrução textual única: "Let's start by getting new pokemon shall we? Select 'Travel' on the top left menu".
4. O menu principal (ícone de Pokébola no canto superior esquerdo) não estava visualmente óbvio como clicável — precisa descobrir/clicar no ícone para abrir uma grade de 16 ícones: Travel, VS, Items, Team, Dex, Poke-Mart, Training, Genetics, Export Reward, Wonder Trade, Mega Dimension, Dictionary, Guide, Settings, Full Screen (a maioria bloqueada até progredir).
5. "Travel" abre abas Wild Areas / Dungeons / Events. Só 2 das 5 zonas visíveis vêm destravadas ("Wildlife Park" e "Mountain Trail", nível 1-10); as outras 3 pedem "Defeat Gym Leader Brock/Misty/Phoebe in VS to unlock".
6. Entrar numa Wild Area leva à tela de montagem de time (Team 1), onde é preciso clicar "+" num slot vazio, abrir o Pokédex (mostra "Caught: 1/1135" — o Froakie inicial já conta) e selecionar o Pokémon para adicioná-lo ao time.
7. "Save and Go!" inicia o combate automático contra um Pokémon selvagem (Chewtle, nome oficial).
8. O combate roda sozinho (sem input do jogador durante a luta) até o oponente ou o time do jogador cair; ao fim, tela de resumo com opções "Save and exit / Fight Again / Battle Summary" e um bloco "New Pokemon!" mostrando o Pokémon recém-capturado automaticamente, com badge "Ivs Up!" (IV = Individual Values, estatística real de RNG de Pokémon).
9. Mentor encerra a instrução: "For now, I will take a break... Enjoy your stay" — fim do tutorial guiado.

[E] **Tempo até a primeira diversão:** moderado-lento. Da escolha do starter até o primeiro combate rodando foram necessários ~6-8 cliques em sequência de telas (menu → Travel → zona → montar time → Pokédex → selecionar → Save and Go!), sem feedback visual óbvio de "isto é clicável" em vários pontos (ícone de menu, linha da zona, slot do Pokémon no time).
[E] **Atritos observados:**
- A descoberta do botão de menu (ícone de Pokébola pequeno, 96x96px, canto superior esquerdo) não é evidente; o texto do mentor ajuda, mas a UI não destaca visualmente o alvo.
- Progressão gated atrás de "VS mode" (batalhas contra Gym Leaders/Treinadores Lendários) para liberar Items, Poke-Mart e outras zonas — múltiplos menus mostram "Complete the tutorial first" ou "Defeat [NPC] in VS mode to unlock", criando um funil de progressão não totalmente claro na primeira sessão.
- Dificuldade técnica de automação por coordenadas sugere que a UI pode ter inconsistências de hit-area entre o elemento visual e a área clicável real — possível fonte de frustração também para jogadores humanos em certas resoluções/zoom.

## 2. Core loop e meta-loops

[E] **Loop central:** escolher uma Wild Area → montar/ajustar time (até 6 Pokémon, slots adicionais "Add Pokemon") → "Save and Go!" entra em combate automático contínuo contra uma sequência de Pokémon selvagens → vitórias dão XP (level up visível, Froakie foi de Lv10 a Lv11 durante 1 sessão de combate), item/shard aleatório (ícone "x2" coletado), e capturam automaticamente um novo Pokémon ao final do combate ("New Pokemon!").
[E] **Meta-loops identificados:**
- **Coleção:** Pokédex com **1.135 espécies** cadastradas (maior que o Pokédex oficial real, ~1025), com filtros por tipo, nível, divisão, evolução, habilidade, shiny, assinatura, ribbon.
- **Evolução:** menu "Genetics" e item "Evo" visíveis na navegação, sugerindo sistema de evolução/genética de Pokémon (não testado a fundo).
- **Auto/Idle:** texto explícito confirma: "Your team will automatically attack in a set pattern, even while you tab out or close the browser!" — combate roda em segundo plano mesmo com o navegador fechado (mais forte que "aba minimizada": aparenta ser client-side com replay determinístico ou simulação local persistida).
- **Dungeons e Events:** abas dedicadas separadas de Wild Areas na tela de Travel (não exploradas em profundidade nesta sessão por limite de tempo).
- **Mega Dimension:** sistema bloqueado atrás de "Defeat Legend Trainer Brendan in VS mode" — referência direta a Mega Evolution de Pokémon.
- **Wonder Trade:** feature de troca social (não explorada; ver regra de não interagir com outros jogadores).
- **Prestige:** não observado diretamente nos ~18 minutos; [H] "Export Reward" e "Export Data/Import Data/Data to Text" no menu sugerem fluxo de save externo, não necessariamente prestige de jogo.

## 3. Decisões reais do jogador vs espera

[E] Decisões disponíveis: escolha do starter, montagem/ordem do time (até 6 slots), qual zona/dungeon visitar, quando lutar contra Gym Leaders (VS mode) para desbloquear conteúdo, filtros do Pokédex para decidir quem usar.
[E] Durante o combate em si, **nenhum input é necessário** — o time ataca "em um padrão definido" automaticamente, inclusive com o navegador fechado. A única decisão tática visível foi pré-combate (montagem de time/moves), não durante.
[H] Isso posiciona o jogo mais como "simulador de coleção + otimização de time" do que combate ativo — decisão real é toda offline/preparação, não em tempo real.

## 4. Eventos, ranking, chefes, dungeons, economia, monetização e anúncios

[E] **Chefes/VS mode:** progressão central do jogo é batalhar contra Gym Leaders nomeados (Brock, Misty, Phoebe) e "Legend Trainers" (Brendan) para desbloquear zonas, Poke-Mart, Mega Dimension e outros sistemas — i.e., os "chefes" são o gatekeeper principal de conteúdo, não um extra opcional.
[E] **Dungeons e Events:** abas dedicadas na tela de Travel ao lado de Wild Areas (nomes e conteúdo não explorados nesta sessão).
[E] **Economia:** não foi possível acessar o Poke-Mart (bloqueado) nem Items (bloqueado) nesta sessão — ambos atrás do mesmo gate "complete o tutorial / derrote X em VS mode". Não há, portanto, evidência direta de moeda premium ou preços nesta janela de teste.
[H] Dado que o jogo é hospedado em **GitHub Pages** (play-pokechill.github.io), com menu exibindo "Discord", "Wipe Data", "Export/Import Data", "Game modifiers" e sem nenhum elemento de loja/IAP visível até agora, a hipótese mais provável é que Pokechill seja um **projeto de fã open-source/gratuito sem monetização**, ao contrário do Digi World Idle (que é claramente comercial). Isso precisaria ser confirmado acessando o Poke-Mart em uma sessão futura mais longa.
[E] Não foram vistos anúncios de qualquer tipo na sessão.

## 5. Retenção

[H] Sem loja/monetização aparente, os mecanismos de retenção parecem ser puramente de **coleção e progressão** (Pokédex de 1.135 espécies, sistema de Genetics/evolução, Wonder Trade social, Mega Dimension) — não há evidência de login diário, pass sazonal ou timers de evento nesta sessão (diferente do Digi World Idle).
[E] A "Rotation" mencionada na tela de Wild Areas ("Rotation 6/12" com contador regressivo) sugere rotação periódica de conteúdo disponível, possível gancho de retenção, mas não foi investigada a fundo.

## 6. Curva de desafio

[E] Primeiro combate (Froakie Lv10 vs. Chewtle, depois Flittle) foi relativamente seguro: o Froakie subiu de nível durante a luta e teve HP recuperado no level-up, mas terminou o combate com HP visivelmente baixo/crítico (barra vermelha) antes do resumo de vitória — sugere que a dificuldade está calibrada para ser "apertada, mas sobrevivível" com apenas 1 Pokémon solo, diferente do Digi World Idle (onde o time apagou 2x).
[H] Não foi possível avaliar a curva de dificuldade em zonas mais avançadas ou contra Gym Leaders nesta sessão.

## 7. UI/UX, mobile, estilo de arte

[E] Interface com tema "papel antigo"/pergaminho bege, sprites pixel art clássicos de Pokémon (estilo Gen 3-5), fundo decorativo de silhuetas de centenas de espécies em tons de cinza escuro.
[E] Textos e UI 100% em **inglês**.
[E] UI não responsiva de forma óbvia a cliques por coordenada direta da imagem (ver nota técnica no topo) — possível sinal de layout fixo/desktop-first, não mobile-first, embora o texto de dica mencione "long-press on mobile", sugerindo suporte mobile planejado/parcial.
[E] Tooltip/dica consistente: "Right click (or long-press on mobile) on most elements for additional information" — bom padrão de acessibilidade de informação sem poluir a tela principal.

## 8. Pontos fortes a superar (top 5)

1. Auto-combate verdadeiramente persistente, incluindo navegador fechado — mesma força do Digi World Idle, mas comunicado de forma ainda mais explícita ao jogador.
2. Captura automática pós-combate remove fricção manual de "jogar bolinha" repetidamente — elegante para um idle.
3. Pokédex massivo (1.135 espécies) com filtros robustos (tipo, nível, divisão, evolução, habilidade, shiny, ribbon, tags) — ótimo para quem gosta de colecionar/otimizar.
4. Progressão gated por "chefes" nomeados (Gym Leaders) dá objetivos claros de médio prazo além de "subir de nível".
5. Sem fricção de monetização percebida (até onde foi possível acessar) — boa primeira impressão para quem busca "jogo simples e fácil" sem pressão de IAP constante.

## 9. Fraquezas a explorar (top 5)

1. Descoberta de UI pobre: botão de menu principal e linhas clicáveis da lista de zonas não têm affordance visual clara (não parecem "clicáveis" até testar).
2. Onboarding depende fortemente de texto de um NPC mentor sem destacar visualmente o próximo passo na tela (sem seta, highlight ou foco de câmera).
3. Gating agressivo (VS mode obrigatório para liberar Items, Poke-Mart, zonas extras, Mega Dimension) pode frustrar quem só quer "ligar e deixar rodando" sem combater ativamente.
4. Falta de clareza imediata sobre economia/loja — jogador não sabe se existe ou não monetização até avançar bastante.
5. Inglês apenas — barreira para público BR/LatAm que o fundador quer atingir com a variante local.

## 10. Público aparente

[E] Idioma: inglês, sem indício de localização PT-BR.
[E] Nostalgia: apelo direto e explícito a fãs de Pokémon — usa nomes oficiais de Pokémon (Litten, Turtwig, Froakie, Chewtle, Flittle), termos de jogo oficiais (Gym Leader, Legend Trainer, Mega [Evolution/Dimension], IVs, movesets reais como "Water Gun"/"Aqua Jet"), e Pokédex dimensionado para superar o jogo oficial em quantidade de espécies.
[H] Público provável: fãs hardcore/colecionadores de Pokémon acostumados a terminologia avançada (IVs, Gym Leaders, Mega Evolution), confortáveis com inglês, possivelmente mais velhos/nichados que o público-alvo "fácil e casual" descrito no pedido do fundador.

## IP risks

[E] **Risco de IP extremamente alto — o mais explícito dos dois jogos analisados.** Pokechill usa a franquia Pokémon quase sem filtro:
- Starters oficiais nomeados diretamente: Litten, Turtwig, Froakie (de 3 gerações diferentes do jogo oficial).
- Pokémon selvagens encontrados com nomes oficiais: Chewtle, Flittle.
- NPCs/chefes com nomes canônicos da franquia: Gym Leaders Brock, Misty, Phoebe; "Legend Trainer Brendan" (personagem jogável oficial de Pokémon Ruby/Sapphire/Emerald/ORAS).
- Termos e mecânicas oficiais replicados literalmente: "Gym Leader", "Mega Dimension" (Mega Evolution), "IVs" (Individual Values), movesets reais ("Water Gun", "Aqua Jet", "Tackle"), "Wonder Trade" (feature oficial do jogo Pokémon Sun/Moon).
- Fundo decorativo com silhuetas do que aparentam ser centenas/milhares de sprites de Pokémon oficiais.
- Pokédex dimensionado para 1.135 entradas, deliberadamente cobrindo (e superando) o universo completo de espécies Pokémon.
[H] Hospedagem em GitHub Pages e menu com "Discord"/"Wipe Data" reforçam a hipótese de ser um fangame não-comercial — o que não reduz o risco de IP para fins de **referência de produto**, apenas reduz a chance de ser um concorrente comercial direto. Para o GS-003, isso significa: **nenhum nome, termo oficial (Gym Leader, Mega Evolution, IVs, nomes de golpes) ou elemento de arte pode ser reaproveitado**, mesmo que a mecânica subjacente (Pokédex, captura automática pós-combate, montagem de time, gating por chefes) seja um ótimo material de estudo de mecânica pura.

---

## TL;DR

1. Pokechill é um fangame de Pokémon não-oficial (GitHub Pages, aparentemente sem monetização visível) com risco de IP máximo: usa nomes oficiais de starters, Pokémon selvagens, Gym Leaders e termos como "Mega Dimension"/"IVs"/"Wonder Trade" sem filtro algum.
2. Core loop forte: Pokédex de 1.135 espécies, montagem de time (6 slots), combate 100% automático mesmo offline, captura automática pós-batalha.
3. Onboarding funcional mas com baixa affordance visual (botões e linhas clicáveis não óbvios) e gating agressivo de conteúdo atrás de "derrotar Gym Leader X em VS mode".
4. Sem evidência de monetização nesta sessão (Poke-Mart ficou bloqueado) — contraste forte com o Digi World Idle, que monetiza pesado desde o dia 1.
5. Público-alvo aparenta ser fã hardcore de Pokémon, em inglês, mais nichado que o público casual/fácil pedido pelo fundador — útil como referência de mecânica de coleção, não de onboarding/tom.
