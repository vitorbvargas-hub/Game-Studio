# GS-003 — Parte 4a: Síntese de Design (Conceitos de Jogo)

**Autor:** game-design (Head of Product Design, Nação Games)
**Data:** 2026-11-08
**Estágio:** DISCOVERY (este documento NÃO é GDD de produção nem MVP — é conceito para decisão do fundador)
**Entradas:** `README.md`, `teardowns/{IDLEDEX,DIGIWORLDIDLE,AUTOCHESS,BATTLEGROUNDS,POKE2DARENA,POKECHILL}.md`, `ART_DIRECTION_OPTIONS.md`, `MARKET_AND_IP.md`, `shared/standards/PHASE_GATES.md`.

Marcação: **[E]** evidência (com fonte) · **[H]** hipótese/julgamento de design não validado com jogador real.

---

## 0. Achado crítico de arte que molda este documento

**[E]** No teste de arte da Parte 3, a imagem `emberkit-capa.webp` (lagarto laranja de cauda flamejante) ficou perigosamente parecida com Charmander — combinação específica de cor + forma + elemento reconhecível, não só nome. Isso confirma o próprio checklist de originalidade já proposto em `ART_DIRECTION_OPTIONS.md` §5.1: o risco real está em **combinações icônicas de atributos** (ex. "lagarto de fogo laranja", "roedor elétrico amarelo com bochecha vermelha", "dinossauro verde com flor nas costas"), não em arquétipos genéricos de gênero (fogo/água/planta como tipos existem há décadas e não são protegidos).

**Regra de originalidade de silhueta (vale para todo o GS-003, A e B):**

1. Nenhuma criatura inicial/starter pode ser **lagarto de fogo**, **rato elétrico** ou **dinossauro laranja/verde com planta nas costas** — essas três combinações são as mais icônicas e reconhecíveis da franquia de referência e estão proibidas como ponto de partida de design, independentemente do nome.
2. Toda criatura nasce de descrição textual original (elemento + papel de gameplay + silhueta) antes de qualquer geração de imagem — nunca "como [criatura oficial] mas diferente".
3. Checklist completo de 5 itens já proposto em `ART_DIRECTION_OPTIONS.md` §5.1 aplica-se a toda criatura aprovada deste documento.

Os starters propostos abaixo (seção 3) já seguem essa regra.

---

## 1. Problema e oportunidade

**[E] O que os 6 concorrentes de referência fazem mal:**

| Problema | Evidência | Quem comete |
|---|---|---|
| **Passividade quase total** | Primeiros 20-30 min são 100% assistir o AUTO jogar; decisão real só aparece em PvP/guilda/arco de história tardio | IdleDex, Pokechill |
| **Muro letal no early game** | Time apagou 2x em ~10 min na zona 1, com slots de equipe ainda bloqueados — pune jogador casual logo na primeira sessão | Digi World Idle |
| **Poluição de UI** | Menu com 14-16 ícones de sistema desde o segundo 1, sem agrupamento; popups de tutorial/level up/captura se empilham e bloqueiam cliques | IdleDex, Digi World Idle |
| **Tutorial passivo sem prática guiada** | 12 telas de "ler + Continuar" sem forçar o jogador a executar a ação ensinada no momento | Digi World Idle |
| **Risco de IP altíssimo e sistemático** | Todos os 6 produtos usam nomes, espécies, personagens, itens ou regiões oficiais 1:1 da franquia de referência, sem disfarce (ou com disclaimer que não reduz o risco) | IdleDex, Digi World Idle, Auto Chess, Battlegrounds, Poke2D Arena, Pokechill |
| **Monetização visível e agressiva desde o dia 1** | VIP, pass, boosts, doação R$500+ todos expostos no primeiro login | Digi World Idle |
| **Onboarding sem affordance visual clara** | Botões de menu e linhas de lista sem indicação de que são clicáveis; descoberta depende só de texto de NPC | Pokechill |

**[H] Oportunidade de diferenciação da Nação Games:**

1. **Decisão real nos primeiros 5 minutos**, não só depois de horas — sem quebrar a promessa de "fácil e automático" (ver onboarding minuto a minuto, seção 3).
2. **Curva de desafio sem muro letal no early game** — zona 1 nunca mata o jogador sem aviso e sem chance de reagir; dificuldade real escalona a partir da masmorra elite/zona 3.
3. **UI agrupada por categoria** (Jogar / Coleção / Social / Loja) desde o início, e popups de onboarding **enfileirados, nunca empilhados**.
4. **100% original com regra de originalidade de silhueta** (seção 0) — nenhum nome, espécie, item ou personagem de terceiros, nem combinação de cor+forma reconhecível. Mecânica genérica (captura, evolução, idle, draft, masmorra roguelite) é de domínio comum e sobrevive comercialmente há anos (Temtem, Coromon, Monster Sanctuary, Cassette Beasts — ver `MARKET_AND_IP.md` §2) desde que a expressão (arte/nomes) seja original.
5. **Monetização de conveniência, não de poder**, validada e benchmarkada contra os 3 concorrentes jogados (seção 3.A/3.B e `MARKET_AND_IP.md` §5).

---

## 2. Pilares de design

1. **Fácil de começar, impossível de ignorar.** O automático cobre o grind cru (XP, caça repetitiva), mas o jogo sempre tem 1-2 decisões táticas reais pendentes e visíveis — nunca é "só esperar" por mais de alguns minutos seguidos.
2. **Nunca morto por surpresa.** Nenhuma zona ou sistema de early game pode causar derrota/wipe sem que o jogador tenha tido um sinal claro e uma chance real de reagir (cura, troca, fuga). Desafio real é opcional e sinalizado (masmorra, chefe, PvP), não embutido no grind básico.
3. **Cada decisão é visível, compreensível e a tempo.** Toda escolha pedida ao jogador (draft, posicionamento, rota, habilidade ativa) mostra o trade-off antes de confirmar — sem decisão "cega" nem informação escondida atrás de menus profundos.
4. **100% original, sempre.** Nenhuma criatura, nome, item, local ou personagem reaproveita conteúdo de terceiros; nenhuma combinação de cor+forma reconhecível de franquia de referência (regra da seção 0).
5. **Sempre tem algo novo chegando.** Eventos semanais com tema rotativo + eventos comunitários com meta coletiva + ranking por temporada garantem que o jogador tenha um motivo concreto para voltar mesmo sem novo conteúdo pesado.

---

## 3. Conceitos

### 3.A — Conceito A: Coleção e Captura

**Fantasia:** você é um explorador que forma vínculo com criaturas selvagens originais, monta um time, caça em rotas, enfrenta chefes de zona e disputa ranking — a leitura direta e melhorada do pedido "parecido com o IdleDex, mas melhor".

**Nome provisório (2 opções, originais):**
- **"Faunário"** (remete a fauna + diário de bordo/coleção, sem termo de franquia).
- **"Capturis"** (neologismo curto, remete a "capturar" sem usar termo oficial de item/mecânica de terceiros).

**Público:** fãs de monster-collector (Pokémon-like) em geral, incluindo o público internacional mais amplo — linha com menor risco de IP e mercado comprovadamente maior (`MARKET_AND_IP.md` §3/§6).

**Starters propostos (seguem a regra de silhueta da seção 0 — nenhum é lagarto de fogo, rato elétrico ou dinossauro):**
- **Juba** (elemento Vento) — kit de orelhas longas com juba de penas leves, corpo arredondado.
- **Concho** (elemento Água) — criatura tipo eremita-concha, corpo mole protegido por casca espiralada.
- **Musgito** (elemento Terra) — pequeno golem redondo coberto de musgo, sem rosto humanoide.

#### Core loop

- **30 segundos:** time em AUTO anda pela rota, encontra criatura selvagem, briga, ganha XP/moeda; log de batalha rola na tela.
- **5 minutos:** jogador verifica uma captura nova no painel (enfileirado, não empilhado), decide se adiciona ao time ou guarda; ajusta item de captura (comum/raro/premium) conforme a criatura encontrada; eventualmente reposiciona o time.
- **1 dia:** completa 1-2 missões diárias (geradas pelo próprio AUTO), checa progresso do evento semanal com tema rotativo, lê o relatório de progresso offline (com teto), eventualmente enfrenta 1 chefe de zona ou 1 andar de masmorra.

#### Onde o automático joga e onde o jogador decide

| Automático | Jogador decide |
|---|---|
| Caça/captura/cura de rotina na rota ativa | **Draft de time e sinergias:** até 4 slots iniciais, cada criatura pertence a 1-2 elementos; sinergia de elemento por contagem (1/3/5, estilo Auto Chess) dá bônus visível — montar composição é decisão central de médio prazo. |
| Grind de XP/nível dentro da rota já escolhida | **Escolha de rota:** cada rota tem risco/recompensa diferente (rota segura = XP previsível; rota de risco = chance de criatura rara + risco de retirada antecipada). |
| Itens de cura básica em combate de rotina | **Posicionamento antes de chefe:** antes de cada luta de chefe, o jogador define a ordem do time (quem recebe o primeiro golpe, quem fica de reserva) — decisão simples (arrastar 1 de 4 posições), mas real. |
| Combate de chefe em si (dano calculado automaticamente) | **1 habilidade ativa por chefe:** um botão de "golpe especial" com cooldown/carga que o jogador aciona manualmente durante o combate de chefe — é o único input direto em tempo real, e é opcional vencer sem ele (mais lento, mas possível). |
| Navegação dentro da masmorra | **Masmorra roguelite com HP persistente:** HP não reseta entre andares; o jogador decide quando trocar a criatura cansada por outra do time, quando usar um item de cura limitado, e se arrisca o andar "Elite" (recompensa maior, perigo maior) ou vai direto ao chefe. |

#### Onboarding — primeiros 10 minutos, minuto a minuto

- **0:00–0:30** — Escolha de nome rápida (sem formulário longo) + escolha de 1 dos 3 starters originais acima, cada um com 1 frase de fantasia curta. **Decisão #1 (rápida, mas real).**
- **0:30–1:30** — Entrada no mundo, 1 NPC guia dá uma única instrução clara. Primeira batalha é **manual e guiada** (o jogo pede 1 toque de ataque) contra um inimigo com HP reduzido propositalmente — **primeira vitória garantida antes de 1:30.**
- **1:30–3:00** — Captura é ensinada com uma escolha real: 2 criaturas selvagens aparecem (elementos diferentes, com tooltip simples) e o jogador escolhe qual capturar primeiro. **Primeira escolha significativa.**
- **3:00–5:00** — Botão AUTO é introduzido com 1 overlay único (nunca empilhado); tooltip explica moeda soft vs. premium na mesma tela, resolvendo o problema de clareza observado no IdleDex.
- **5:00–7:00** — Mini-chefe de fim de zona, com dano travado para não poder matar o jogador; ensina a habilidade ativa de chefe (1 toque no botão de golpe especial) — momento de maior "peso" dos 10 minutos iniciais, mas sem risco real de derrota.
- **7:00–8:30** — Zona concluída; menu principal se abre agrupado em 4 categorias (Jogar / Coleção / Social / Loja), não 14 ícones soltos.
- **8:30–10:00** — Jogo mostra a missão diária e um teaser do evento semanal; explica o teto de progresso offline; oferece a primeira escolha de rota (segura vs. arriscada) com preview claro do trade-off antes de confirmar.

#### Sistemas

- **Chefes:** chefe de zona (progressão) + chefe de masmorra (semanal), com 1 habilidade ativa por luta. Revanche: 1 grátis/dia + custo crescente em moeda soft (padrão genérico adotado do IdleDex, sem nome/arte copiados).
- **Masmorras:** estrutura roguelite com andares sequenciais, HP acumulado entre andares, andar "Elite" opcional de maior risco/recompensa, andar final de chefe — adaptação genérica do padrão observado no Poke2D Arena, sem combate manual completo (resolução semi-automática + decisões pontuais de troca/cura).
- **Eventos:** semanais com tema rotativo (direciona a rota ideal da semana, sem exigir conteúdo novo) + comunitários com meta coletiva (dano/vitórias somadas de todo o servidor, recompensa compartilhada).
- **Ranking:** por categorias (Nível, Coleção, Poder/stats, Semanal) com reset de temporada — nenhuma categoria dá vantagem de poder, só prestígio.
- **Passe:** trilha gratuita + paga, 3 camadas de missão (diária/semanal/temporada); conteúdo da trilha paga é cosmético e conveniência, nunca poder bruto.
- **Guildas (fase 2):** disputa territorial leve entre guildas por bônus temporários de rota — adiada para pós-protótipo.
- **Progressão offline com teto:** teto diferenciado free/premium (ex. 4h/8h), conveniência pura, nunca vantagem de poder líquido.

#### Curva de desafio

Zona 1 e 2 nunca causam wipe sem aviso — dano é calibrado para permitir recuperação (cura automática de emergência se HP do time cair abaixo de um piso, 1x por luta). Desafio real começa na masmorra "Elite"/zona 3 em diante, sempre sinalizado visualmente antes de entrar.

#### Monetização ética (a validar por game-growth)

Assinatura de conveniência (teto offline maior, slots de time/coleção extras, mais ofertas de mercado), passe sazonal cosmético, cosméticos avulsos. Nenhuma vantagem de poder bruto compravel (sem "golpe especial mais forte" pago, sem item de vitória automática em PvP/ranking).

---

### 3.B — Conceito B: Monstros Digitais e Tamers

**Fantasia:** você é um Tamer que recebe um parceiro digital original, explora zonas de um mundo-rede, "digievolui" seu time em estágios e enfrenta ameaças de corrupção de dados — leitura original do nicho Digimon/BR sem usar nenhum elemento oficial.

**Nome provisório (2 opções, originais):**
- **"NúcleoTam"** (núcleo + Tamer, remete a vínculo com dado/digital sem termo oficial).
- **"Byteera"** (byte + "era", remete a mundo digital de forma genérica).

**Público:** nicho BR/LatAm de nostalgia de monstros digitais (adultos 20-35, confortáveis com termos de RPG) — público menor, mais apaixonado, mas operando mais perto da linha de risco de IP no mercado de referência (`MARKET_AND_IP.md` §3/§6).

**Parceiros iniciais propostos (seguem a regra de silhueta da seção 0):**
- **Pixelume** (Dado/Luz) — blob translúcido com núcleo luminoso pulsante, sem chifres nem garras.
- **Ferrolim** (Vírus/Metal) — inseto digital de placas angulares, sem ser lagarto nem roedor.
- **Aquabit** (Vacina/Água) — geleia aquática com padrão de circuito interno, forma de gota.

#### Core loop

- **30 segundos:** parceiro em modo automático varre uma zona-rede, ataca dados corrompidos, ganha Bits/XP; "scan" de novas espécies avança por abate.
- **5 minutos:** jogador revisa 1 "digievolução" pendente (decisão de estágio: qual atributo priorizar na evolução), ajusta alocação de treino em 1 stat, verifica se precisa curar/retornar ao hub.
- **1 dia:** completa missão diária, acompanha evento comunitário (meta coletiva de "limpeza de corrupção"), eventualmente enfrenta o chefe semanal de zona ou avança 1 andar de masmorra de servidor.

#### Onde o automático joga e onde o jogador decide

| Automático | Jogador decide |
|---|---|
| Combate de rotina na zona-rede ativa | **Draft de time e sinergias por atributo** (Dado/Vírus/Vacina — nomenclatura própria, não copiada de nenhuma franquia) — composição de 3-4 parceiros com contagem de atributo dando bônus. |
| Grind de Bits/XP | **Alocação de treino:** cada vitória gera pontos de treino que o jogador distribui manualmente entre 2-3 stats por parceiro — decisão de build real, não automática. |
| Cura básica entre combates de rotina | **Escolha de digievolução:** ao atingir o requisito, o jogador escolhe entre 2 caminhos de evolução por parceiro (ramificação, não linha única) — decisão definitiva de médio prazo. |
| Combate de chefe (dano calculado) | **1 habilidade ativa de "sincronização"** com o Tamer por chefe — botão manual com carga, análogo à habilidade ativa do Conceito A, mas com fantasia de "vínculo Tamer-parceiro". |
| Navegação na masmorra de servidor | **Masmorra roguelite com HP persistente** entre "setores" (andares), mesma lógica de risco/recompensa do Conceito A, com fantasia de "corrupção crescente" em vez de profundidade física. |

#### Onboarding — primeiros 10 minutos, minuto a minuto

- **0:00–0:30** — Nome do Tamer + escolha de 1 dos 3 parceiros originais, cada um com 1 frase de fantasia curta. **Decisão #1.**
- **0:30–1:30** — Entrada guiada por 1 NPC (sem lore de 3 falas antes de jogar, diferente do Digi World Idle); primeira batalha manual e guiada com inimigo fraco. **Primeira vitória garantida antes de 1:30.**
- **1:30–3:00** — Scan de nova espécie com escolha real: 2 inimigos de atributo diferente aparecem, o jogador escolhe qual enfrentar primeiro para desbloquear no "banco de dados" (bestiário). **Primeira escolha significativa.**
- **3:00–5:00** — Modo automático é introduzido com 1 overlay único; moeda soft vs. premium explicada na mesma tela.
- **5:00–7:00** — Mini-chefe de zona com dano travado, ensina a habilidade de sincronização.
- **7:00–8:30** — Menu agrupado em 4 categorias (Jogar / Coleção / Social / Loja).
- **8:30–10:00** — Missão diária + teaser de evento comunitário + explicação do teto offline + primeira escolha de zona (segura vs. arriscada).

#### Sistemas

Mesma estrutura do Conceito A (chefes com revanche limitada, masmorra roguelite com HP persistente, eventos semanais + comunitários, ranking por categoria, passe de 3 camadas, guildas em fase 2, offline com teto) — **a diferenciação é de fantasia e nomenclatura, não de sistema**, pela recomendação de base técnica compartilhada (seção 5).

#### Curva de desafio

Mesma regra do Conceito A: nenhuma zona inicial pode causar wipe sem aviso — isso corrige diretamente o problema identificado no Digi World Idle (2 KOs em ~10 min na zona 1 com slots bloqueados), que é a fraqueza mais citada desse concorrente direto.

#### Monetização ética (a validar por game-growth)

Mesmo princípio do Conceito A: conveniência e cosmético, nunca poder. Atenção adicional: o Digi World Idle (concorrente direto da linha B) já opera com monetização agressiva e visível desde o dia 1 (VIP, pass, boosts, doação R$500+) — recomenda-se que nossa linha B seja deliberadamente mais discreta no primeiro login, para diferenciação de experiência, não só de IP.

---

## 4. Escopo do protótipo (vertical slice, 1-2 semanas — NÃO é MVP)

**Objetivo único:** testar se o loop "automático + 1-2 decisões reais recorrentes + masmorra/chefe sem muro letal" é divertido, antes de qualquer investimento de produção completa.

- **Linha testada:** Conceito A (coleção) — maior mercado validado e menor complexidade de IP (ver recomendação seção 5).
- **Criaturas:** 6 a 9 no total — os 3 starters propostos (seção 3.A) + 1 evolução cada (6) e opcionalmente 1-2 criaturas selvagens adicionais de zona para variedade de captura (até 9).
- **Zonas:** 2 zonas de caça automática (1 fácil de tutorial, 1 intermediária) — sem arco narrativo, sem PvP, sem guilda.
- **1 chefe de zona** com 1 habilidade ativa manual, dano travado para não matar o jogador.
- **1 masmorra** de 3-4 andares com HP persistente entre andares e 1 andar final de chefe.
- **Fora de escopo do protótipo:** monetização real, ranking de servidor (pode ser só local/mock), passe de batalha, guildas, eventos comunitários ao vivo, qualquer sistema social.
- **Métrica de sucesso do protótipo:** tempo de sessão voluntário além do loop automático (o jogador volta para decidir algo, não só para "ver o número subir") e taxa de conclusão da masmorra de teste sem frustração reportada.

---

## 5. Recomendação

**Base técnica compartilhada (motor comum, duas skins e mundos), começando pelo Conceito A.**

Razões:
1. `MARKET_AND_IP.md` §6 confirma com evidência de mercado que a linha A (coleção estilo Pokémon-like) tem público presumivelmente maior e mais internacional, com risco jurídico mais fácil de gerenciar — mecânica de captura/evolução genérica sobrevive comercialmente há anos (Temtem, Coromon, Monster Sanctuary, Cassette Beasts) desde que arte e nomes sejam originais.
2. A linha B (monstros digitais/Tamers) tem nicho mais apaixonado, mas opera objetivamente mais perto da linha de risco de IP no mercado de referência (o próprio Digi World Idle já usa nomes oficiais de parceiros/Tamers) — exige disciplina de originalidade maior antes de validar.
3. `ART_DIRECTION_OPTIONS.md` §2 já recomenda que as duas linhas compartilhem a mesma base de produção de arte (vetor chibi flat), diferenciando-se por paleta e motivo gráfico — isso se estende naturalmente a um motor de jogo e sistemas compartilhados (chefe, masmorra, ranking, passe), com a fantasia e nomenclatura sendo a única diferença real entre A e B.
4. Validar A primeiro reduz o risco de diluir orçamento de design/arte em duas frentes simultâneas na fase de maior incerteza (validação de diversão do loop, não amplitude de catálogo) — alinhado com `MARKET_AND_IP.md` §6, que recomenda explicitamente não lançar A+B juntos como primeiro produto.
5. Lançar B depois, reaproveitando o mesmo motor/sistemas com nova skin e fantasia, é a sequência de menor risco técnico e de IP.

---

## 6. Perguntas abertas para o fundador

1. Confirma que o protótipo deve focar só na Linha A (coleção) primeiro, com a Linha B como segundo produto sobre o mesmo motor, conforme a recomendação da seção 5 — ou prefere validar os dois conceitos em paralelo mesmo com o risco de diluir orçamento?
2. Plataforma preferida para o protótipo de teste de diversão: web/navegador (menor fricção, igual aos 6 concorrentes estudados) ou já pensar em mobile nativo desde o protótipo?
3. Aceita a regra de "nenhum muro letal no early game" como não-negociável, mesmo sabendo que isso reduz a tensão que você mesmo relatou sentir falta no IdleDex como jogador veterano?
4. Tudo bem o protótipo rodar sem nenhuma moeda premium/loja (só medir diversão), deixando o desenho de preço e monetização para a fase de VALIDATION com o game-growth?
5. Alguma preferência entre as opções de nome provisório propostas (Faunário/Capturis para a Linha A, NúcleoTam/Byteera para a Linha B), ou prefere que a próxima fase gere mais opções antes de decidir?
