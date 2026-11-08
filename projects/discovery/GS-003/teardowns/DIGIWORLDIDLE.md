# Teardown jogando — Digi World Idle

**Jogo:** Digi World Idle (https://digiworldidle.com.br/jogo/)
**Data da sessão:** 2026-11-08
**Jogador de teste:** NacaoGames (Tamer novo, sem progresso anterior)
**Duração da sessão:** ~18 minutos de interação ativa (onboarding + exploração de sistemas + 2 ciclos de hunt/KO/cura)
**Evidência:** `~/projects/GameStudio/projects/discovery/GS-003/evidence/digiworldidle/` (13 capturas de tela numeradas)

---

## 1. Onboarding passo a passo

[E] Fluxo observado:
1. Tela "Escolha seu Tamer" pede nome e sexo, sem e-mail/senha (conta local/por Tamer). Nome usado: "NacaoGames".
2. Diálogo narrativo com "Yggdrasil" (Host Computer do Mundo Digital) — 3 falas de lore antes de qualquer gameplay.
3. Escolha de 1 dos 7 parceiros iniciais (réplicas diretas dos 7 Digimon parceiros da primeira temporada de Digimon Adventure — ver seção 10). Escolhido: Agumon.
4. Tutorial guiado de **12 passos numerados** ("Passo 1/12" a "Passo 12/12"), cobrindo: combate automático, HP do Tamer/Perfil, Digiscan (captura de novas espécies), D-Vice (inventário/D-Bank), D-Commerce (loja com moeda soft), cura na cidade (Cyberspace/Yggdrasil), automação e ranking (canto superior direito), poções/cura, modos de caça (Individual/Coletiva/Líder Individual).
5. Botão final "Começar agora" solta o jogador no D-Portal para escolher a primeira zona (nível 1).

[E] **Tempo até a primeira diversão:** rápido — em menos de 2 minutos já havia clique em "escolher hunt" e o parceiro caçando sozinho com XP subindo. O atrito é o volume de texto do tutorial (12 telas sequenciais, cada uma exigindo "Continuar"), não a complexidade de ação.

[E] **Atritos observados:**
- O tutorial é 100% passivo (ler + clicar "Continuar"), sem a pessoa executar a ação ensinada no momento — ex.: ensina "D-Evoluir" e "Modos de caça" sem forçar o jogador a de fato clicar nesses botões durante a instrução.
- Após o tutorial, o time apagou ("Seu time caiu") **duas vezes em ~10 minutos** na primeira zona (nível 1) com apenas 1 Digimon na party (slots 2 e 3 vêm bloqueados). Isso é um atrito real de retenção inicial: o jogador novo perde progresso de HP/posição e precisa voltar à cidade e reviver manualmente.
- Fechar painéis sobrepostos (D-Commerce, D-Coin Store, DigiKing abertos ao mesmo tempo) foi confuso mesmo automatizando cliques — múltiplos modais empilham sem um padrão único de fechamento.

## 2. Core loop e meta-loops

[E] **Loop central:** escolher uma hunt (zona) no D-Portal → a party ataca sozinha (sem precisar segurar a tela aberta) → gera XP, Bits e chance de loot por abate → "Digiscan" de cada espécie avança até 100% e desbloqueia um novo D-Partner no D-Bank.

[E] **Meta-loops identificados:**
- **Digievolução:** botão "D-Evoluir" disponível desde o nível 1 na UI da party (ainda não testado a fundo, mas presente e central ao redor do parceiro).
- **D-Dojo (treino):** investe Bits para treinar HP/ATK/DEF/SPD com "Níveis por clique" e "Acelerar tudo" — sistema de upgrade incremental clássico de idle game.
- **Auto/Idle:** confirmado — combate roda no servidor mesmo com a janela fechada ("mesmo com a janela fechada, enquanto durar a carga do Modo Offline", texto do próprio tutorial).
- **Offline:** há uma "carga" (cap) de Modo Offline — jogador VIP ganha "Cap de Digiscan 200%, Modo Offline, D-Auto, Transferências" (ver seção 4), ou seja, o acúmulo offline é limitado e monetizado.
- **Prestige:** não observado nos ~18 minutos de sessão; não há evidência direta de reset/prestige nesta janela de teste. [H] Pode existir em zonas avançadas ou ligado ao "Hall of DigiLegends" do ranking.

## 3. Decisões reais do jogador vs espera

[E] Decisões disponíveis desde o início: escolha do parceiro inicial, escolha da zona de hunt, modo de caça (Individual/Coletiva/Líder Individual), quando reviver/curar, como alocar Bits no D-Dojo (qual stat treinar), quando comprar itens no D-Commerce.
[E] A maior parte do tempo, porém, é espera: o combate em si é 100% automático sem input do jogador durante a luta (sem esquiva, sem escolha de ataque). A "jogabilidade ativa" é toda de **gestão** (trocar zona, curar, configurar time), não de combate em tempo real.
[H] Isso tende a atrair quem gosta de otimizar números/rotas (ver D-Analyser) mais do que quem quer "jogar" combate.

## 4. Eventos, ranking, chefes, dungeons, economia, monetização e anúncios

[E] **Eventos dinâmicos:** painel "D-Bounty" (7 ativos na sessão) e "D-Anomaly" (3–4 ativos) com chefes de comunidade (ex.: "Moonmon", nível 10) e marcos coletivos de dano com recompensas em Bits/XP/Scan — alguns marcos marcados **"VIP"** (bloqueados para não assinantes).
[E] **Ranking (DigiKing):** ranking global "Top 3" por categoria (Nível, Poder, HP, ATK, DEF, SPD, Conquistas, Memórias), com filtro por atributo (Neutro/Vaccine/Virus/Data) e seção "Hall of DigiLegends".
[E] **Economia:** duas moedas soft (D-Coins e Bits) + "D-Coins (Event)" sazonal + moeda premium ("D-Coins" compráveis). Loja in-game (D-Commerce) vende poções/revive com Bits; D-Coin Store vende assinatura VIP, pacotes semanais, boosts de XP/loot/dano e skins com D-Coins.
[E] **Monetização observada (sem compra real efetuada):**
  - Assinatura **VIP**: 150 D-Coins / 30 dias (cap de Digiscan 200%, Modo Offline, D-Auto, Transferências, +50% XP bônus).
  - **D-Pass Season 1**: battle pass de 30 níveis com trilha free + trilha premium (desbloqueio por 250 D-Coins), missões diárias e únicas.
  - **D-Reward**: calendário de login de 28 dias (recompensas diárias, dia 7 inclui "Skin de Tamer Yagami Taichi" — ver risco de IP).
  - Boosts avulsos (XP, loot, dano) e pacote semanal "DigiWorld Weekly Pack".
  - Doação direta ("Donate") com tiers até R$500+.
[E] Não foram vistos anúncios de vídeo/rewarded ads na sessão — a monetização parece 100% IAP/assinatura, não ad-based.
[H] Chefes e "masmorras" dedicadas não apareceram claramente separados de D-Bounty/D-Anomaly nos ~18 minutos; podem estar atrás de progressão mais avançada.

## 5. Retenção

[E] Mecanismos fortes de retenção diária: D-Reward (login diário 28 dias), D-Pass sazonal com missões diárias/únicas, timer de rotação de D-Expedition (catálogo renova a cada ~3h30), cap de carga offline (força volta períodica ao jogo para não perder progresso acumulável).
[H] O cap de Modo Offline + VIP para "transferências" sugere pressão deliberada para login frequente e/ou assinatura.

## 6. Curva de desafio

[E] Na zona de nível 1 (Bommon), com apenas 1 Digimon na party (slots extras bloqueados), o time apagou ("Seu time caiu") **duas vezes** em cerca de 10 minutos de auto-combate sem supervisão constante — indicando que a zona inicial é mais letal do que o esperado para um jogador solo recém-chegado, especialmente por slots 2/3 virem bloqueados por padrão.
[H] Isso pode ser intencional para empurrar o uso de itens de cura/revive (monetização leve) ou um desbalanceamento real de early game a validar com mais tempo de jogo.

## 7. UI/UX, mobile, estilo de arte

[E] Interface densa, em português do Brasil, com muitos ícones de sistemas simultâneos na tela (D-Vice, D-Portal, D-Analyser, D-Dojo, D-Commerce, Social, D-Settings, Reward System, D-Coin Store, DigiKing, D-auto, D-Expedition) — alta carga cognitiva para um jogo "idle simples".
[E] Estilo de arte: sprites pixel art 2D estilo retro-RPG (coerente com os sprites clássicos de Digimon), cenário isométrico/grid para as zonas de hunt (ex.: zona de lava "Bommon").
[H] Não foi possível confirmar responsividade mobile nesta sessão (testada apenas em viewport desktop via navegador); o layout com múltiplos painéis sobrepostos sugere que telas pequenas podem sofrer mais com empilhamento de modais.

## 8. Pontos fortes a superar (top 5)

1. Automação real e persistente (combate roda mesmo offline) — forte proposta de valor "idle genuíno".
2. D-Analyser: métricas de retorno por zona (bits/h, XP/h, abates/h) dão ao jogador dados para decisões informadas — bom design de decisão real.
3. Sistema de eventos (D-Bounty/D-Anomaly) com metas coletivas de comunidade cria senso de progresso compartilhado.
4. Ranking multi-categoria robusto (não só nível, mas poder, HP, ATK, DEF, SPD) dá mais formas de "vencer".
5. Onboarding guiado cobre todos os sistemas principais antes de soltar o jogador, reduzindo confusão inicial sobre "o que fazer".

## 9. Fraquezas a explorar (top 5)

1. Early game muito letal para solo — 2 KOs em 10 min na zona nível 1 prejudica a primeira impressão de "jogo fácil e tranquilo" pedida no brief.
2. Tutorial 100% passivo (ler + continuar) sem prática guiada no momento certo.
3. Sobrecarga de ícones/sistemas simultâneos na UI pode intimidar jogador casual.
4. Monetização bastante agressiva desde muito cedo (VIP, D-Pass, boosts, doação R$500+ todos visíveis no dia 1).
5. Múltiplos modais que se sobrepõem sem fechamento consistente (tive dificuldade real automatizando o fechamento de painéis empilhados).

## 10. Público aparente

[E] Idioma: **100% português do Brasil** (textos, narrativa, UI) — confirma que Digi World Idle já é, de fato, a referência "BR" e de "monstros digitais" citada no README do GS-003.
[E] Nostalgia: forte apelo a fãs de Digimon Adventure (1999) — os 7 parceiros iniciais, seus Tamers (Taichi, Yamato, Sora, Koushiro, Mimi, Jou, Takeru), NPCs (Jijimon), inimigos (Vegiemon, Bommon, Botamon, Chibomon, Cocomon, Moonmon) e a skin "Yagami Taichi" são todos nomes/personagens canônicos de Digimon.
[H] Público provável: adultos 20-35 anos que cresceram assistindo Digimon, confortáveis com termos técnicos de RPG/idle (ATK/DEF/SPD, Vaccine/Virus/Data), dispostos a gastar em assinatura/pass.

## IP risks

[E] **Risco de IP alto e direto.** O jogo usa nomes de personagens e criaturas 100% oficiais da franquia Digimon (marca da Bandai/Toei), não apenas mecânicas similares:
- Parceiros iniciais: Agumon, Gabumon, Biyomon, Tentomon, Palmon, Gomamon, Patamon (os 7 Digimon parceiros originais de Digimon Adventure).
- Tamers/Digidestined originais usados como nomes de skin/ícone de perfil: Taichi, Yamato, Sora, Koushiro, Mimi, Jou, Takeru (incluindo a skin paga "Yagami Taichi", sobrenome completo do protagonista).
- NPCs e inimigos: Jijimon, Vegiemon, Bommon, Botamon, Chibomon, Cocomon, Moonmon — todos nomes de espécies oficiais de Digimon.
- Atributos de elemento usando a nomenclatura oficial da franquia (Vaccine/Virus/Data/Neutro).
[H] Dado que o pedido do fundador é usar "criaturas, nomes e arte 100% originais" (conforme GOVERNANCE), este produto de referência é um exemplo claro do que **não** reproduzir — nem os nomes, nem (presumivelmente) a arte dos sprites, que aparenta ser derivada ou idêntica aos designs oficiais de Digimon. Recomenda-se não usar nem como base de arte/estilo visual direta sem passar pela etapa de pesquisa de sprites 100% originais (Parte 3 do GS-003).

---

## TL;DR

1. Digi World Idle é um clone não-oficial e totalmente em PT-BR de Digimon, com nomes de criaturas e Tamers 100% canônicos — risco de IP alto, não usar como referência de nomenclatura/arte, só de mecânica.
2. Core loop sólido: auto-combate idle real (roda offline), Digiscan para desbloquear novos parceiros, D-Dojo para treinar stats com Bits.
3. Onboarding guiado de 12 passos é completo mas passivo; early game é mais letal do que deveria para um público "fácil e casual" (2 KOs em 10 min, slots de party bloqueados).
4. Monetização pesada e visível desde o dia 1: VIP, D-Pass sazonal, boosts, doação até R$500+ — tudo via D-Coins comprados com dinheiro real.
5. Pontos fortes a copiar: métricas de decisão (D-Analyser), eventos de comunidade com metas coletivas, ranking multi-categoria; pontos a evitar: sobrecarga de ícones/painéis e letalidade early-game mal calibrada.
