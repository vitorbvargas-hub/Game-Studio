# Monetization Opportunity Report — GS-001

- **Projeto:** GS-001 — First Product Discovery & Opportunity Validation
- **Autor (agente):** game-growth
- **Data:** 2026-11-08
- **Status:** rascunho
- **Tarefa:** T2 — Monetization Opportunity Report

> Convenção: **[E]** = evidência com fonte e data de acesso. **[H]** = hipótese/estimativa do agente, sem fonte pública verificada agora. Nenhum número aqui é receita garantida.

## 0. Nota metodológica e limitações

- Esta pesquisa foi feita via `web_fetch` em páginas oficiais (RevenueCat, Apple, Google Play, CrazyGames, GameAnalytics). O provedor de `web_search` esteve **indisponível (HTTP 429) durante toda a sessão**, então vários pontos não puderam ser cruzados com múltiplas fontes — ficam marcados **[H]** mesmo quando é "conhecimento de mercado amplamente repetido", para ser honesto sobre o que foi verificado agora vs. não.
- Durante a coleta, a página `gameanalytics.com/benchmarks` continha, junto à tabela de benchmarks, um texto que tentava instruir o agente a mudar de tarefa (uma tentativa de prompt injection). Isso foi identificado e ignorado; apenas a tabela numérica pública foi usada como evidência. Registrando aqui para transparência.
- Perfil do estúdio considerado: fundador + agentes de IA, **sem orçamento de mídia paga**, infra barata (web app, HTML5, SaaS leve), foco em aquisição orgânica e distribuição global.

---

## 1. Benchmarks públicos coletados (referência cruzada para as 10 categorias)

| Benchmark | Valor | Fonte | Data acesso |
|---|---|---|---|
| Conversão download→pagante (D35), apps de assinatura mobile | Mediana global varia por região: América do Norte 2,6%; Europa Ocidental 2,0%; LatAm 1,5%; Índia/SEA 1,4% | [E] revenuecat.com/state-of-subscription-apps ("State of Subscription Apps 2026") | 2026-11-08 |
| Conversão hard paywall vs. freemium | Paywall rígido converte 5x mais que freemium (10,7% vs. 2,1%) — mas retenção converge após 1 ano | [E] idem | 2026-11-08 |
| LTV realizado por pagante (RLTV, ano 1) | Mediana global US$ 23; América do Norte US$ 32; Índia/SEA US$ 14 | [E] idem | 2026-11-08 |
| Apps com IA (feature principal) | +41% receita por pagante, porém churn 30% mais rápido | [E] idem | 2026-11-08 |
| Trial longo (17+ dias) vs. curto | Converte 70% melhor (42,5% vs. 25,5%) | [E] idem | 2026-11-08 |
| Cancelamento em trials de 3 dias | 55% dos cancelamentos ocorrem no dia 0 | [E] idem | 2026-11-08 |
| Falha de cobrança involuntária | Google Play 31% dos cancelamentos vs. Apple 14% | [E] idem | 2026-11-08 |
| Concentração de mercado | Top 25% dos apps de assinatura cresceu MRR 80% a/a; bottom 25% encolheu 33% | [E] idem | 2026-11-08 |
| Apps lançados antes de 2020 | Geram 69% de toda a receita de assinatura do mercado (maturidade/efeito "the rich get richer") | [E] idem | 2026-11-08 |
| Taxa App Store (padrão) | 30%; **15%** no App Store Small Business Program (receita <US$1M/ano); 10% adicional de desconto em assinaturas após ano 1 nos termos alternativos da UE | [E] developer.apple.com/app-store/small-business-program | 2026-11-08 |
| Taxa Google Play | Estrutura legada: 15% até US$1M/ano, 30% acima; assinaturas sempre 15%. Nova estrutura regional (EUA/UE/UK/Japão/Austrália, rollout 2026): 10%+5% (billing fee) para assinaturas; 10–25%+5% para outras transações dependendo de novo/antigo instalador e programas (Level Up/Apps Experience reduzem para 15–20%) | [E] support.google.com/googleplay (Service fees) | 2026-11-08 |
| Modelo de monetização de portais web (CrazyGames) | Receita via anúncios em vídeo/banner (+IAP só para jogos selecionados); monetização só é habilitada após "Full Launch", condicionado a métricas de engajamento (playtime, conversão, retenção) atingirem benchmarks internos não públicos | [E] docs.crazygames.com | 2026-11-08 |
| Retenção de jogos PC/web (GameAnalytics, ~1.200 jogos, out/2026) | D1 mediana 6,54%; D7 mediana 1,44%; D30 mediana 0,19%; stickiness (DAU/MAU) mediana 4,32%; sessão mediana 20,8 min | [E] gameanalytics.com/benchmarks | 2026-11-08 |
| Revenue share Steam | Padrão 70/30 (desenvolvedor/Valve), caindo para 75/25 após US$10M e 80/20 após US$50M brutos acumulados por título | [H] política pública da Valve (2018), não reconfirmada hoje — acesso à doc oficial exigiu login | — |
| Revenue share itch.io | Desenvolvedor escolhe seu próprio corte (slider "pay what you want"), inclusive 0% | [H] modelo amplamente conhecido do itch.io, página de docs retornou 404 no fetch de hoje | — |
| eCPM de anúncios em jogos web (rewarded video) | Faixa tipicamente citada por redes de ad HTML5: ~US$2–10 em tráfego Tier-1 (EUA/UE), bem menor em outras geografias | [H] sem fonte verificada hoje (busca indisponível) | — |
| Alcance de lançamento no Product Hunt | Centenas a poucos milhares de visitas em 24h para produtos novos; conversão de visita→cadastro muito variável (1–10%) | [H] sem fonte verificada hoje | — |
| Tempo até ranquear organicamente (SEO) para micro-SaaS novo | Tipicamente 6–12 meses para tráfego relevante em nichos pouco competidos | [H] sem fonte verificada hoje | — |

---

## 2. Análise por categoria

### A. Idle games (web/mobile)
- **Modelo de receita:** ads (rewarded video, interstitial) + IAP cosmético/boosts. Em portais web, quase só ads [E docs.crazygames.com].
- **Público pagante:** pequena fração compra; maioria sustenta via ads. Benchmarks de apps de assinatura não se aplicam diretamente (idle raramente usa assinatura), mas a lógica de "poucos pagantes sustentando a base" é consistente com conversão freemium baixa (~2% [E RevenueCat, análogo]).
- **Concorrência:** altíssima nos portais web (milhares de jogos idle); baixa barreira de entrada técnica, alta barreira de destaque.
- **Aquisição orgânica:** portais (CrazyGames, Poki) fazem a distribuição — não é SEO/ASO tradicional, é curadoria do portal + métricas de engajamento [E]. Reddit (r/incremental_games) é canal de nicho real.
- **Recorrência:** média-alta se o loop prende (sessões diárias), mas D1/D30 de jogos web tendem a ser baixos [E GameAnalytics: D30 mediana 0,19%].
- **Viralização:** baixa-média (sem loop social nativo na maioria).
- **CAC:** ~0 se dependente de portal (portal faz a aquisição); fora de portal, CAC orgânico não documentado.
- **LTV:** baixo por usuário individual (ads); hipótese [H] de LTV agregado só funciona em escala (milhões de plays).
- **Potencial de receita:** baixo-médio por título; exige portfólio de vários jogos para ads somarem relevância.

### B. Incremental games
- Subcategoria de idle com progressão mais elaborada (prestige, árvores de upgrade). Monetização e canais iguais ao item A.
- **Diferencial:** comunidade dedicada (r/incremental_games, forums) pode gerar tração orgânica sem depender só do portal — canal de aquisição mais acessível que idle genérico.
- **Recorrência/virais:** idêntico ao A, levemente melhor recorrência por profundidade de progressão [H].
- **Potencial de receita:** similar ou levemente maior que A por maior tempo de sessão, mas universo de público é menor (nicho mais específico).

### C. Collection games (gacha-lite, colecionáveis)
- **Modelo de receita:** IAP (loot/gacha, cosméticos) é o principal; ads secundário.
- **Público pagante:** "whales" concentram receita — padrão conhecido da indústria mobile [H], consistente com a concentração observada em assinaturas (top 25% captura a maior parte [E RevenueCat]).
- **Concorrência:** alta em mobile (categoria saturada por publishers grandes); web é menos saturado.
- **Aquisição orgânica:** fraca sem UA pago em mobile (ASO ajuda, mas gacha depende de criativos de ads pagos tipicamente); em formato web, portais podem distribuir.
- **Recorrência:** potencialmente alta (loops de coleção são desenhados para retorno diário), mas monetização de gacha tem risco regulatório/reputacional (loot boxes) em algumas jurisdições.
- **CAC/LTV:** CAC de UA pago em gacha mobile é historicamente alto (não verificado hoje); fora do escopo do estúdio sem orçamento de mídia.
- **Potencial de receita:** alto SE escalar com whales, mas alto risco e dependência de volume — não ideal como primeiro produto sem orçamento de aquisição.

### D. Browser games (geral, fora idle)
- **Modelo de receita:** ads via portais (CrazyGames, Poki, Y8, itch.io) [E].
- **Público pagante:** raro; monetização é majoritariamente por tráfego/engajamento, não por compra.
- **Concorrência:** extremamente alta (milhares de submissões); portais fazem curadoria agressiva — "Basic Launch" é um teste de 7-21 dias com corte por métricas antes de habilitar monetização [E docs.crazygames.com].
- **Aquisição orgânica:** a principal vantagem da categoria — o portal já tem tráfego; o jogo não precisa gerar sua própria demanda, precisa performar nas métricas do portal.
- **Recorrência:** geralmente baixa (jogo único, sessão curta); portais favorecem jogos replayable.
- **Viralização:** médio se houver mecânica de compartilhamento/desafio.
- **CAC:** ~0 (portal distribui); risco é não passar do Basic Launch.
- **LTV:** não aplicável por usuário (monetização agregada por views de anúncio).
- **Potencial de receita:** baixo por jogo individual, mas é o caminho de **menor fricção para 1º $** do estúdio — sem necessidade de loja própria, pagamento, ou base de usuários prévia.

### E. Strategy games (web/mobile/PC)
- **Modelo de receita:** mix de IAP, ads, ou pago único (PC/Steam).
- **Público pagante:** público mais engajado e disposto a pagar por profundidade/conteúdo (DLC, expansões) — mas é nicho menor que casual.
- **Concorrência:** alta em PC (gênero lotado de clássicos consagrados); web/mobile menos saturado para estratégia leve.
- **Aquisição orgânica:** Steam (wishlist, reviews), comunidades especializadas (Reddit r/4Xgaming, fóruns), curadores de YouTube de nicho.
- **Recorrência:** alta para jogos com multiplayer/liga sazonal; baixa para campanha single-player.
- **CAC:** sem dado público hoje [H]; historicamente estratégia tem CAC mais alto por público nichado e exigente.
- **Potencial de receita:** médio, mas ciclo de desenvolvimento costuma ser mais longo — desalinhado com objetivo de "1º produto rápido".

### F. Mobile games
- **Modelo de receita:** IAP + ads (hybrid monetization é padrão de mercado); assinatura é raro em jogos puros.
- **Público pagante:** conversão D35 mediana 1,4–2,6% dependendo da região do desenvolvedor [E RevenueCat, aplicável por analogia a apps freemium — jogos têm padrão semelhante ou pior].
- **Concorrência:** muito alta; descoberta orgânica via App Store/Play Store sem ASO forte e sem orçamento de UA é extremamente difícil.
- **Aquisição orgânica:** ASO (palavras-chave, ícone, screenshots), featuring editorial (raro e não controlável), viral loops internos.
- **Taxas de plataforma:** 15% (Apple Small Business, <US$1M/ano) ou 15–30% (Google Play, depende do programa) [E].
- **Recorrência/CAC/LTV:** LTV baixo sem UA pago para alimentar volume; CAC orgânico quase inviável para descoberta em categoria saturada.
- **Potencial de receita:** alto em teoria, mas **inacessível sem orçamento de mídia paga** nas condições atuais do estúdio — é a categoria com maior descasamento entre potencial e restrição orçamentária.

### G. Micro-SaaS (B2B ou B2C nicho)
- **Modelo de receita:** assinatura mensal/anual, preço fixo por ferramenta de nicho.
- **Público pagante:** profissionais/pequenas empresas resolvendo um problema específico — disposição a pagar mais alta que em apps de consumo.
- **Concorrência:** varia muito por nicho; nichos bem escolhidos (dor específica, pouca oferta) têm concorrência administrável.
- **Aquisição orgânica:** SEO de nicho (long-tail), Product Hunt no lançamento, comunidades verticais (Slack/Discord do setor, Indie Hackers, Hacker News), parcerias de conteúdo.
- **Recorrência:** a maior de todas as categorias analisadas — modelo de assinatura B2B tem churn estruturalmente menor que app de consumo quando resolve um problema de trabalho real.
- **Viralização:** baixa-média (boca a boca profissional, não viral de massa).
- **CAC:** potencialmente baixo se SEO/conteúdo funcionar (custo = tempo, não mídia); sem dado público hoje para citar número [H].
- **LTV:** mais alto por cliente (preços B2B tipicamente US$10–100+/mês), mas volume de usuários é muito menor que em app de consumo.
- **Potencial de receita:** o modelo com **melhor relação risco/retorno para um estúdio sem orçamento de mídia**, mas ciclo de validação (achar a dor certa) pode ser mais lento que um jogo web.

### H. Productivity apps
- **Modelo de receita:** freemium + assinatura (padrão de mercado, categoria "Productivity" no bucketing do RevenueCat) [E].
- **Público pagante:** conversão em linha com a mediana geral de apps de assinatura (1,4–2,6% D35, dependendo de região) [E].
- **Concorrência:** alta (categoria populosa), mas nichos específicos (ex.: ferramenta para um workflow muito específico) reduzem concorrência direta.
- **Aquisição orgânica:** ASO, SEO (se tiver versão web), comunidades de produtividade (Reddit, Twitter/X, newsletters do nicho), Product Hunt.
- **Recorrência:** boa se resolver hábito de trabalho recorrente; trial longo (17+ dias) converte 70% melhor que trial curto [E RevenueCat] — relevante para desenho de onboarding.
- **CAC/LTV:** RLTV mediano por pagante ano 1 ~US$23 globalmente, ~US$32 em apps de devs norte-americanos [E] — referência útil mesmo sendo agregada, não específica da categoria.
- **Potencial de receita:** médio-alto, especialmente combinando com IA (ver categoria J) para diferenciação.

### I. Utility apps
- **Modelo de receita:** pago único, freemium, ou assinatura leve.
- **Público pagante:** geralmente menor disposição a pagar assinatura por utilitário simples (expectativa de app "barato/grátis"); pago único ou IAP único converte melhor para esse tipo.
- **Concorrência:** extremamente alta e com apps genéricos de baixa qualidade dominando busca — difícil diferenciação sem nicho muito específico.
- **Aquisição orgânica:** ASO é o canal central (buscas diretas de "app para X"); baixo potencial de conteúdo/SEO fora da própria loja.
- **Recorrência:** baixa (uso esporádico, não hábito diário) na maioria dos utilitários — risco de churn alto.
- **CAC/LTV:** LTV baixo por usuário; modelo depende de volume alto para compensar.
- **Potencial de receita:** baixo-médio; categoria arriscada como 1º produto porque a aquisição orgânica depende quase inteiramente de algoritmo de busca da loja, fora do controle do estúdio.

### J. AI-powered apps
- **Modelo de receita:** assinatura (dominante), freemium com limite de uso, ou créditos/paga-por-uso.
- **Público pagante:** apps de IA geram **41% mais receita por pagante** que apps sem IA — mas **churn 30% mais rápido** [E RevenueCat 2026]. Ou seja: monetiza melhor por usuário, mas retém pior.
- **Concorrência:** mercado em explosão — volume de novos apps de assinatura cresceu 7x desde 2022, puxado por ferramentas de IA, "quase inteiramente uma história de iOS" (iOS é ~77% dos lançamentos novos) [E RevenueCat]. Alta saturação de wrappers de IA genéricos.
- **Aquisição orgânica:** SEO/conteúdo sobre casos de uso específicos, Product Hunt (forte fit — comunidade early-adopter de IA), Reddit/Twitter de nicho de IA, YouTube de ferramentas.
- **Recorrência:** estruturalmente mais fraca que outras categorias por causa do churn 30% maior — precisa de forte diferenciação de produto ou custo marginal de IA baixo para sustentar.
- **CAC/LTV:** maior receita por pagante compensa parcialmente o churn mais alto, mas o modelo exige reposição constante de usuários — sem orçamento de mídia, depende 100% de orgânico/conteúdo para repor churn.
- **Potencial de receita:** alto em teoria (ticket maior), mas é a categoria mais "quente e lotada" agora [E: "a maior aceleração de lançamentos iOS começa no início de 2025, coincidindo com ferramentas de desenvolvimento assistidas por IA"] — vantagem de ser rápido existe, mas a janela de diferenciação encolhe rápido. Apps lançados antes de 2020 ainda capturam 69% da receita do mercado total — ou seja, ser novo entrante é estruturalmente difícil mesmo na categoria em alta [E].

---

## 3. Tabela comparativa (nota 1–5; 5 = melhor)

| Categoria | Monetização | Recorrência | Aquisição orgânica | Velocidade até 1º $ | Observação |
|---|---|---|---|---|---|
| A. Idle games | 2 | 3 | 4 (portais) | 4 | Depende de aprovação de portal |
| B. Incremental | 2 | 3 | 3 | 4 | Nicho com comunidade própria |
| C. Collection/gacha | 4 | 4 | 2 | 2 | Monetização forte mas exige volume/UA |
| D. Browser games (geral) | 1 | 2 | 5 | 5 | Menor fricção, menor teto |
| E. Strategy | 3 | 4 | 2 | 2 | Ciclo de dev mais longo |
| F. Mobile games | 3 | 3 | 1 | 1 | Inviável sem orçamento de UA |
| G. Micro-SaaS | 5 | 5 | 3 | 2 | Melhor LTV e recorrência; validação mais lenta |
| H. Productivity apps | 4 | 4 | 3 | 3 | Boa combinação geral |
| I. Utility apps | 2 | 2 | 2 | 3 | Depende quase só de ASO |
| J. AI-powered apps | 4 | 2 | 4 | 3 | Ticket alto, churn alto, mercado saturado e acelerando |

**Leitura:** nenhuma categoria vence em todos os eixos. **D (browser games)** vence em velocidade/aquisição mas perde em monetização e recorrência — bom para gerar primeira receita e aprendizado, não para sustentar o estúdio. **G (micro-SaaS)** vence em monetização/recorrência mas é mais lento para validar. **H (productivity)** e **J (AI-powered)** são meio-termo, com J mais arriscado por saturação e churn.

---

## 4. Ranking de potencial comercial (consolidado)

1. **G — Micro-SaaS B2B de nicho** — melhor combinação de recorrência, ticket e controle de custo de aquisição via conteúdo/SEO.
2. **H — Productivity apps** (web+mobile, possivelmente com componente de IA) — bom equilíbrio entre monetização e aquisição orgânica.
3. **J — AI-powered apps/features** — alto ticket, mas exige diferenciação real para não virar "wrapper genérico"; usar como *feature* dentro de G/H em vez de categoria isolada pode ser mais seguro.
4. **D — Browser/idle/incremental games (A+B+D combinados)** — ótimo para validar execução rápida e gerar primeiro dólar/tração via portais, mas teto de receita baixo por título; funciona melhor como portfólio de vários títulos pequenos, não como aposta única.
5. **I — Utility apps** — viável só com nicho muito específico e forte ASO; risco de depender 100% do algoritmo da loja.
6. **C — Collection/gacha, E — Strategy, F — Mobile games (ads/IAP genérico)** — exigem volume de usuários ou orçamento de aquisição que o estúdio não tem hoje; manter como aposta futura, não como 1º produto.

---

## 5. Cenários financeiros (genéricos, não são previsão garantida)

> Premissas 100% hipotéticas **[H]**, construídas a partir dos benchmarks [E] da seção 1 onde aplicável. Servem para dimensionar ordens de grandeza, não para projetar receita real. Qualquer decisão de investimento exige validação com dados reais do produto específico.

### Arquétipo 1 — Jogo web idle/incremental (ads + IAP leve, distribuído via portal)

| Premissa | Conservador | Base | Otimista |
|---|---|---|---|
| Plays mensais (via portal, pós Full Launch) | 20.000 | 100.000 | 500.000 |
| eCPM efetivo (ads, blended geo) [H, faixa de mercado US$2–10] | US$ 1,50 | US$ 3,00 | US$ 5,00 |
| Impressões de ads por play | 2 | 3 | 4 |
| Receita de ads/mês | US$ 60 | US$ 900 | US$ 10.000 |
| % jogadores com IAP | 0,1% | 0,3% | 0,8% |
| Ticket médio IAP | US$ 2 | US$ 3 | US$ 4 |
| Receita IAP/mês | US$ 40 | US$ 900 | US$ 16.000 |
| Revenue share do portal (desenvolvedor recebe) | ~50% | ~60% | ~70% [H, não confirmado hoje] |
| **Receita neta estimada/mês** | **~US$ 50** | **~US$ 1.080** | **~US$ 18.200** |
| Custo de infra (hosting leve) | US$ 10 | US$ 30 | US$ 100 |

### Arquétipo 2 — Micro-SaaS B2B (assinatura mensal)

| Premissa | Conservador | Base | Otimista |
|---|---|---|---|
| Visitantes orgânicos/mês (SEO+conteúdo, após 6–12 meses) [H] | 500 | 3.000 | 15.000 |
| Conversão visita→trial | 2% | 4% | 7% |
| Conversão trial→pago [E referência: RevenueCat, trial longo ~42,5%, mas contexto B2B costuma ser diferente — usado como teto, não como média direta] | 10% | 20% | 35% |
| Assinantes pagantes novos/mês | 1 | 24 | 368 |
| ARPU mensal | US$ 15 | US$ 29 | US$ 49 |
| Churn mensal | 8% | 5% | 3% |
| MRR ao final do mês 12 (acumulado, simplificado) | ~US$ 90 | ~US$ 3.200 | ~US$ 95.000 |
| Custo de infra (hosting + ferramentas) | US$ 20/mês | US$ 80/mês | US$ 300/mês |
| Taxa de processamento de pagamento (Stripe-like) | ~3% | ~3% | ~3% |

### Arquétipo 3 — App utilitário freemium (mobile)

| Premissa | Conservador | Base | Otimista |
|---|---|---|---|
| Downloads/mês (ASO orgânico, sem UA pago) [H] | 300 | 1.500 | 8.000 |
| Conversão download→pagante (D35) [E RevenueCat: faixa 1,4–2,6% mediana global] | 0,5% | 1,5% | 3% |
| Novos pagantes/mês | 1,5 | 22 | 240 |
| ARPU mensal (assinatura leve) | US$ 3 | US$ 5 | US$ 8 |
| Taxa de plataforma (Apple/Google) [E: 15% com programa de pequena empresa] | 15% | 15% | 15–30% |
| Churn mensal | 10% | 7% | 5% |
| Receita bruta/mês (acumulado, mês 12, simplificado) | ~US$ 15 | ~US$ 300 | ~US$ 4.800 |
| Receita neta pós-taxa de loja | ~US$ 13 | ~US$ 255 | ~US$ 4.080 |

**Leitura dos três cenários:** nenhum arquétipo gera receita relevante no cenário conservador nos primeiros 12 meses — isso é esperado e consistente com o dado [E] de que apps lançados antes de 2020 ainda capturam 69% da receita do mercado (produtos novos competem por uma fração pequena da torta). O cenário "base" do micro-SaaS é o único que atinge um MRR que poderia, em tese, começar a sustentar custos operacionais mínimos do estúdio dentro de 12 meses.

---

## 6. Resumo para o coordenador (game-studio)

**Arquivo:** `/home/openclaw/projects/GameStudio/projects/discovery/GS-001/MONETIZATION_REPORT.md`

**Ranking de potencial comercial (1→6, do melhor para o mais arriscado como 1º produto):**
1. Micro-SaaS B2B de nicho (G)
2. Productivity apps (H)
3. AI-powered apps/features (J) — melhor como feature embutida que como categoria isolada
4. Browser/idle/incremental games via portais (A+B+D) — bom para tração rápida, teto baixo
5. Utility apps (I) — só viável com nicho muito específico
6. Collection/gacha, Strategy, Mobile games genéricos (C/E/F) — exigem orçamento de aquisição que o estúdio não tem

**5 insights principais:**
1. Sem orçamento de mídia paga, a variável decisiva não é "qual categoria monetiza melhor" e sim "qual categoria tem canal de distribuição que não depende de dinheiro" — por isso jogos web via portais (CrazyGames/Poki) e micro-SaaS via SEO/conteúdo saem na frente, enquanto mobile games e gacha genéricos ficam estruturalmente inviáveis como 1º produto.
2. Apps com IA monetizam 41% melhor por pagante, mas churnam 30% mais rápido [E RevenueCat 2026] — isso sugere usar IA como *diferencial dentro* de um produto de produtividade/SaaS, não como categoria sozinha, para não herdar o churn alto sem compensação de recorrência.
3. O mercado de apps de assinatura é "winner-take-more": produtos lançados antes de 2020 ainda capturam 69% de toda a receita, e o top 25% dos apps cresce 80% a/a enquanto o bottom 25% encolhe 33% [E]. Isso reduz a expectativa realista para qualquer "1º produto" novo nos primeiros 12 meses — reforça os cenários conservador/base como os mais prováveis, não o otimista.
4. Portais de jogos web (CrazyGames) só habilitam monetização *depois* de um período de teste (Basic Launch, 7–21 dias) em que o jogo precisa bater benchmarks internos de engajamento [E docs.crazygames.com] — ou seja, mesmo a rota "sem fricção" tem um gate de qualidade antes do primeiro dólar.
5. Trials longos (17+ dias) convertem 70% melhor que trials curtos de 3 dias, mas 55% dos cancelamentos de trials curtos acontecem no dia 0 [E RevenueCat] — relevante para qualquer app H/I/J do estúdio: desenhar onboarding e janela de trial generosa é uma decisão com impacto medido, não estética.

**Limitações:**
- O provedor de `web_search` ficou indisponível (429) durante toda a sessão; a pesquisa foi feita só via `web_fetch` em páginas específicas conhecidas. Vários benchmarks citados em outros relatórios do setor (eCPM exato de portais web, revenue share exato do Steam/itch.io hoje, CAC de UA mobile, conversão típica de Product Hunt) **não puderam ser verificados com fonte fresca** e ficam marcados [H].
- Os cenários financeiros da seção 5 são ilustrativos — construídos combinando benchmarks reais com premissas de volume hipotéticas. Não substituem um modelo financeiro específico do produto escolhido (a ser feito em `FINANCIAL_MODEL.md` nas fases seguintes, para os 3 finalistas).
- Página `gameanalytics.com/benchmarks` continha um texto de prompt injection junto aos dados; foi ignorado e apenas a tabela numérica pública foi usada.
