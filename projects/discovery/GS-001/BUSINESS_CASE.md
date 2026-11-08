# Business Case — GS-001 (3 finalistas)

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese não verificada. `web_search` retornou erro 429 durante esta sessão; os poucos números confirmados via `web_fetch` estão citados com URL. Todas as simulações de receita são **projeções hipotéticas de ordem de grandeza**, não previsões — ver aviso final.

- **Projeto:** GS-001
- **Autor (agente):** game-growth
- **Data:** 2026-11-08
- **Status:** rascunho
- **Fontes:** `OPPORTUNITY_CATALOG.md` (CAT), `TECHNICAL_FEASIBILITY.md` (TF), `FINAL_RANKING.md` (RANK), `MONETIZATION_REPORT.md` (MON) — todos em `projects/discovery/GS-001/`, 2026-11-08.

## Resumo

Os três finalistas (C01 Loopwright, C07 ReplyDraft, C06 StatusPing) têm perfis de risco e retorno muito diferentes: um jogo com custo de infra quase zero mas monetização pulverizada e dependente de portal; um micro-SaaS de IA com o melhor ARPU potencial mas exposto a um concorrente gratuito óbvio (o próprio Gmail); e um micro-SaaS de infraestrutura com a monetização mais previsível e o menor risco de diferenciação, mas teto de preço baixo. Em nenhum cenário conservador qualquer um dos três gera receita que cubra o custo de horas de um dev a preço de mercado nos primeiros 12 meses — isso é esperado e consistente com `MON` (produtos novos competem por uma fração pequena do mercado). O cenário "hours=0" (caixa, sem custo de oportunidade do tempo) é o que importa para decidir se vale testar com recursos internos do estúdio.

## Premissas gerais (todas as simulações)

- **[H]** Taxa hipotética de horas de engenharia: **US$25/h** (freelancer júnior/pleno remoto) — usada só para o cálculo de "payback com custo de horas". Variante "hours=0" calcula payback só com caixa gasto (ferramentas/contas/taxas), sem custo de oportunidade do tempo.
- **[E-TF]** Conversão de semanas-pessoa para horas: 1 semana-pessoa = 40h.
- **[H]** "Usuários ativos" (as colunas 100/500/1.000/5.000/10.000) = usuários ativos mensais (MAU) do produto, não visitas/plays brutos. Para C01, a conversão de MAU→plays/mês está explicitada na simulação porque o `MON` usa "plays", não MAU.
- Nenhuma simulação presume que todos os usuários pagam — a fração pagante é parametrizada e explicitada em cada cenário.
- **Regra do estúdio:** qualquer conta/serviço pago, taxa de loja, ou **publicação** do produto (CrazyGames/itch.io/Chrome Web Store/domínio ao vivo) exige aprovação prévia do fundador (`AGENTS.md`). Isso está marcado item a item abaixo.

---

# 1. C01 — Loopwright (jogo idle + coleção)

### Investimento inicial

| Item | Estimativa | Aprovação do fundador? |
|---|---|---|
| Horas de MVP **[E-TF]** | 4–7 semanas-pessoa = 160–280h (meio: ~220h) | — |
| Horas a US$25/h **[H]** | US$4.000–7.000 (meio ~US$5.500) | — |
| Ferramentas (Vite/TS/PixiJS/Preact, Cloudflare Workers+D1 free tier) | US$0 no tier gratuito **[E-TF]** | Não (free tier) |
| Domínio (se não publicar só no portal) | ~US$12–15/ano **[H]** | **Sim** (conta/compra) |
| Apple Developer (só se for a mobile v1, fora do MVP web) | US$99/ano **[H, valor de conhecimento geral não reverificado hoje]** | **Sim** |
| Google Play Console (mobile v1) | US$25 único **[H]** | **Sim** |
| Publicar no portal (CrazyGames/itch.io) ou como PWA pública | US$0 de taxa, mas é **publicação** | **Sim, obrigatório** (regra do estúdio) |
| SDK de ads (AdMob/portal) — integração e aceite de termos | US$0 de taxa, mas é contrato com terceiro | **Sim** |

### Custo mensal (infra)

**[E-TF]** 100 MAU: US$0 · 1.000 MAU: US$0–5 · 10.000 MAU: US$5–15. Interpolado **[H]**: 500 ≈ US$0–3 · 5.000 ≈ US$3–10.

### Conversão de MAU → plays e parâmetros de receita

**[H]** Assume-se que 1 MAU gera, em média, 3 plays/mês (conservador), 5 (base) ou 8 (otimista) — jogo idle tem sessões curtas e recorrentes, não visitas únicas.

| Parâmetro **[MON, base nos arquétipos do relatório; variação própria aqui]** | Conservador | Base | Otimista |
|---|---|---|---|
| Plays/MAU/mês **[H]** | 3 | 5 | 8 |
| eCPM efetivo (ads) **[H, MON]** | US$1,50 | US$3,00 | US$5,00 |
| Impressões de ads/play **[H, MON]** | 2 | 3 | 4 |
| Revenue share do portal (dev recebe) **[H, MON]** | 50% | 60% | 70% |
| % de MAU com IAP/mês **[H, MON]** | 0,1% | 0,3% | 0,8% |
| Ticket médio IAP **[H, MON]** | US$2 | US$3 | US$4 |

Receita de ads/MAU/mês = plays×eCPM×impressões/1000×share. Receita IAP/MAU/mês = %IAP×ticket×share (assume mesmo revenue share para IAP, premissa simplificadora **[H]**).

- Conservador: US$0,0045 (ads) + US$0,0010 (IAP) = **US$0,0055/MAU/mês**
- Base: US$0,0270 (ads) + US$0,0054 (IAP) = **US$0,0324/MAU/mês**
- Otimista: US$0,1120 (ads) + US$0,0224 (IAP) = **US$0,1344/MAU/mês**

### Simulação 100 / 500 / 1.000 / 5.000 / 10.000 MAU

Pagantes (IAP) = MAU × %IAP do cenário; o resto é "grátis" (só vê ads, eventualmente).

| MAU | Pagantes (base, 0,3%) | Receita conservadora | Receita base | Receita otimista | Custo infra | Margem (base) |
|---|---|---|---|---|---|---|
| 100 | 0,3 (arredonda p/ 0) | US$0,55 | US$3,24 | US$13,44 | US$0 | ~US$3,24 |
| 500 | 1,5 | US$2,75 | US$16,20 | US$67,20 | US$0–3 | ~US$14–16 |
| 1.000 | 3 | US$5,50 | US$32,40 | US$134,40 | US$0–5 | ~US$27–32 |
| 5.000 | 15 | US$27,50 | US$162,00 | US$672,00 | US$3–10 | ~US$152–159 |
| 10.000 | 30 | US$55,00 | US$324,00 | US$1.344,00 | US$5–15 | ~US$309–319 |

**Leitura:** mesmo no cenário base, a receita a 10.000 MAU (~US$324/mês) é ordem de grandeza menor que um salário de dev. Isso é coerente com `MON` (arquétipo 1 chega a ~US$1.080/mês só a 100.000 **plays**/mês, não MAU).

### Break-even e payback

- **Break-even de infra:** trivial — custo de infra (US$0–15) é cobertos já a partir de ~1.000 MAU no cenário base (margem positiva desde o 1º usuário, pois custo é quase zero).
- **Payback com custo de horas (US$25/h, investimento ~US$5.500):** no cenário base, a 10.000 MAU (US$324/mês), payback ≈ **17 meses**; a 1.000 MAU, payback ≈ **170 meses (~14 anos)** — inviável sem escala relevante.
- **Payback "hours=0" (só caixa, ~US$15–140 de custo inicial se for a mobile):** mesmo no cenário conservador a 500–1.000 MAU (US$2,75–5,50/mês), payback em **3–6 meses**; se ficar só na web (sem taxas de loja, ~US$15 de domínio), payback é quase imediato.
- **Gate que precede qualquer receita:** CrazyGames/Poki só habilitam monetização após "Full Launch" (7–21 dias de teste de engajamento) **[E docs.crazygames.com, via MON]** — se o jogo não passar, a receita é **zero** independente do cenário.

### Riscos e sensibilidade

As duas premissas que mais mexem no resultado: **(1)** revenue share + eCPM do portal (fora do controle do estúdio, pode mudar sem aviso) e **(2)** % de MAU que faz IAP (varia 0,1%→0,8%, um fator de 8x entre cenários). Risco binário adicional: não passar do "Full Launch" gate.

### Validação comercial

1. **Quem usaria:** jogadores casuais 25–45 anos de idle/coleção que já jogam em portais web (CrazyGames, itch.io) ou buscam no Reddit (r/incremental_games) **[H, CAT]**.
2. **Problema/experiência:** entretenimento de baixa fricção jogável em 2 minutos ou 2 horas, com sensação de otimização (não só espera) **[CAT]**.
3. **Por que pagaria:** conveniência (pular espera) ou cosméticos/coleção — ARPU de pagante é baixo e a maioria nunca paga; a maior parte da receita vem de ads, não de quem "pagaria" **[MON]**.
4. **Primeiros usuários sem mídia paga:** submissão a portais (CrazyGames/itch.io/Poki — curadoria do portal, não SEO) e posts em r/incremental_games/r/WebGames **[H, CAT/MON]**.
5. **Como monetizar:** ads recompensados/intersticiais + IAP cosmético leve, via SDK do portal **[CAT]**.
6. **Concorrentes que já fazem:** Cookie Clicker, Universal Paperclips (idle clássicos); categoria "idle RPG/collector" mobile em geral **[H, CAT]**.
7. **Diferencial:** otimização de layout/combinação (puzzle leve) em vez de só power-creep de stats **[H, CAT]** — diferencial fraco, fácil de copiar.
8. **Custo de construir:** 4–7 semanas-pessoa, ~US$4.000–7.000 a US$25/h **[E-TF]**.
9. **Custo de operar:** US$0–15/mês até 10.000 MAU **[E-TF]**.
10. **Tempo para validar:** 7–21 dias de "Basic/Full Launch" no portal após submissão **[E MON]**, mais o tempo de MVP.
11. **Indicadores de sucesso (metas numéricas):** passar do "Full Launch" gate; ≥5.000 plays/mês em 60 dias pós-lançamento; retenção D7 ≥10% **[H, benchmark genérico de idle web]**.
12. **Kill criteria (numéricos):** não passar do Full Launch em 21 dias; ou receita líquida <US$20/mês após 90 dias de Full Launch; ou retenção D7 <3% após 2 iterações de balanceamento.

### Plano de validação sem mídia paga

1. (Semanas 1–7) Construir MVP conforme escopo do `TF`. 2. Submeter a CrazyGames e itch.io simultaneamente (ambos gratuitos). 3. Postar em r/incremental_games e r/WebGames com transparência de que é indie. 4. Rodar o jogo no "Basic Launch" por 7–21 dias monitorando playtime/retenção/CTR de ads. 5. Meta: atingir os benchmarks do portal para habilitar "Full Launch" em até 30 dias. Se não atingir, revisar curva de progressão com o simulador headless recomendado em `TF` antes de reenviar.

---

# 2. C07 — ReplyDraft (extensão IA para Gmail)

### Investimento inicial

| Item | Estimativa | Aprovação do fundador? |
|---|---|---|
| Horas de MVP **[E-TF]** | 2–4 semanas-pessoa = 80–160h (meio: ~120h) | — |
| Horas a US$25/h **[H]** | US$2.000–4.000 (meio ~US$3.000) | — |
| Chrome Web Store (taxa única de registro de developer) | ~US$5 **[H, página oficial confirmada hoje via web_fetch (developer.chrome.com/docs/webstore/register), valor exato não reverificado na sessão]** | **Sim** |
| Domínio | ~US$12–15/ano **[H]** | **Sim** |
| Supabase (Free no beta → Pro em produção) | US$0 no beta; Pro ~US$25/mês **[E-TF]** | **Sim** (quando migrar p/ Pro) |
| Stripe (billing) | Sem mensalidade; ~2,9%+US$0,30/transação **[H]** | **Sim** (abrir conta) |
| API Anthropic (Haiku 5.5) | Pay-as-you-go, incluso no custo mensal abaixo | **Sim** (abrir conta/billing) |

### Custo mensal (infra + LLM, já com custo de API incluso **[E-TF]**)

100 MAU: US$5–40 · 1.000 MAU: US$100–110 · 10.000 MAU: US$750–850. Interpolado **[H]**: 500 ≈ US$55–75 · 5.000 ≈ US$350–450. **[E-TF]** Custo de Haiku por usuário ativo ≈ US$0,07/mês (150 rascunhos/mês, 3.000 tok entrada + 350 saída).

### Parâmetros de receita

**[H, apoiado em MON arquétipo "micro-SaaS B2B" e no benchmark de conversão D35 de apps de assinatura 1,4–2,6% do RevenueCat — usuários que já instalaram a extensão têm intenção maior que downloads genéricos, por isso a faixa usada aqui é mais alta que o D35 puro]**

| Parâmetro | Conservador | Base | Otimista |
|---|---|---|---|
| % de usuários ativos que pagam | 2% | 5% | 12% |
| ARPU mensal do pagante **[H, MON arquétipo 2]** | US$15 | US$29 | US$49 |

### Simulação 100 / 500 / 1.000 / 5.000 / 10.000 usuários ativos

Custo de LLM/infra aplica-se a **todos** os usuários ativos (o free tier também consome IA — é o gancho do produto).

| Usuários ativos | Pagantes (base, 5%) | Receita conservadora | Receita base | Receita otimista | Custo (base da faixa) | Margem base |
|---|---|---|---|---|---|---|
| 100 | 5 | US$30 | US$145 | US$588 | US$5–40 | ~US$105–140 |
| 500 | 25 | US$150 | US$725 | US$2.940 | ~US$55–75 | ~US$650–670 |
| 1.000 | 50 | US$300 | US$1.450 | US$5.880 | US$100–110 | ~US$1.340–1.350 |
| 5.000 | 250 | US$1.500 | US$7.250 | US$29.400 | ~US$350–450 | ~US$6.800–6.900 |
| 10.000 | 500 | US$3.000 | US$14.500 | US$58.800 | US$750–850 | ~US$13.650–13.750 |

### Break-even e payback

- **Break-even:** no cenário base, já ~1–4 pagantes cobrem o custo fixo de infra (~US$30–100 citado em `TF`); a 100 usuários ativos (5 pagantes) a margem já é positiva.
- **Payback com custo de horas (US$25/h, investimento ~US$3.000):** no cenário base, a 1.000 usuários ativos (margem ~US$1.340/mês), payback ≈ **2,2 meses**. Mesmo no conservador a 1.000 usuários (receita US$300, custo US$100–110, margem ~US$190–200), payback ≈ **15 meses**.
- **Payback "hours=0" (custo inicial ~US$20–140: Chrome fee + domínio):** payback em **dias**, mesmo no cenário conservador com poucas centenas de usuários.

### Riscos e sensibilidade

As duas premissas que mais mexem no resultado: **(1)** % de conversão para pago — o Gmail já oferece rascunhos com Gemini nativamente **[H, RANK]**, então a faixa 2–12% é a mais incerta de todo este relatório; **(2)** custo de LLM por usuário — se a qualidade do Haiku não bastar e for preciso Sonnet, o custo por usuário sobe de ~US$0,07 para ~US$1,43/mês **[E-TF]**, ~20x, o que pode inverter a margem em qualquer cenário.

### Validação comercial

1. **Quem usaria:** donos de e-commerce pequeno e freelancers de atendimento que respondem e-mail/suporte manualmente no Gmail **[CAT]**.
2. **Problema/experiência:** tempo gasto escrevendo respostas repetitivas; falta de ferramenta de IA com tom de marca consistente **[CAT]**.
3. **Por que pagaria:** economia de tempo mensurável (menos minutos por e-mail) + consistência de tom sem contratar redator.
4. **Primeiros usuários sem mídia paga:** comunidades de e-commerce/freelancer (Indie Hackers, subreddits de pequenos negócios), conteúdo SEO ("como responder clientes mais rápido"), Chrome Web Store SEO orgânico **[H]**.
5. **Como monetizar:** assinatura mensal por nº de rascunhos/mês **[CAT]**.
6. **Concorrentes que já fazem:** **Gmail/Gemini nativo** (gera rascunhos de graça); ferramentas genéricas de "IA para e-mail"; plataformas de helpdesk com IA embutida (Zendesk, etc.) **[H, CAT/RANK]**.
7. **Diferencial:** biblioteca de tom de marca configurável + histórico de respostas aprovadas, como camada leve sobre o Gmail (não substitui, complementa) **[H, CAT]** — diferencial que precisa ser comprovado em uso real, pois é fácil de replicar pelo próprio Google.
8. **Custo de construir:** 2–4 semanas-pessoa, ~US$2.000–4.000 a US$25/h **[E-TF]**.
9. **Custo de operar:** US$5–850/mês dependendo da escala (100→10.000 usuários) **[E-TF]**.
10. **Tempo para validar:** 2–4 semanas de MVP + ~2–4 semanas de teste de review da Chrome Web Store e uso real **[H, TF]**.
11. **Indicadores de sucesso (metas numéricas):** ≥50 instalações ativas em 30 dias; ≥5% convertendo para pago em 60 dias; retenção de pagante ≥70% no mês 2 (dado o churn 30% mais rápido de apps de IA **[E MON]**).
12. **Kill criteria (numéricos):** <20 instalações ativas em 30 dias; ou <2% de conversão para pago em 60 dias; ou custo de LLM por usuário pagante >30% do ARPU (margem insustentável).

### Plano de validação sem mídia paga

1. (Semanas 1–4) Construir MVP (extensão Gmail + proxy + 1 tom + billing simples). 2. Submeter à Chrome Web Store e aguardar review. 3. Postar em comunidades de e-commerce/freelancer e Indie Hackers, oferecendo uso gratuito limitado em troca de feedback. 4. Meta em 60 dias: 50+ instalações ativas e primeiros 2–5 pagantes reais. 5. Se a conversão ficar abaixo do kill criteria, entrevistar quem não converteu antes de investir mais.

---

# 3. C06 — StatusPing (uptime + status page)

### Investimento inicial

| Item | Estimativa | Aprovação do fundador? |
|---|---|---|
| Horas de MVP **[E-TF]** | 2–4 semanas-pessoa = 80–160h (meio: ~120h) | — |
| Horas a US$25/h **[H]** | US$2.000–4.000 (meio ~US$3.000) | — |
| Domínio + DNS wildcard p/ subdomínios de status page | ~US$12–15/ano **[H]** | **Sim** |
| Cloudflare Workers Paid (necessário já no MVP, conforme `TF`) | US$5/mês **[E-TF]** | **Sim** |
| Resend (e-mail de alertas) | Free tier inicialmente; paga acima de cota **[E-TF]** | **Sim** (quando migrar) |
| Probes multi-região (v1, fora do MVP) | US$4–6/mês por probe extra **[H, TF]** | **Sim** |

### Custo mensal (infra)

**[E-TF]** 100 MAU: ~US$5 · 1.000 MAU: US$7–30 · 10.000 MAU: US$70–130. Interpolado **[H]**: 500 ≈ US$6–20 · 5.000 ≈ US$40–80.

### Parâmetros de receita

**[H]** StatusPing compete em "simplicidade radical e preço fixo baixo" (`CAT`), então o ARPU aqui é deliberadamente mais baixo que o arquétipo micro-SaaS genérico do `MON` (US$15–49). O free tier (1–2 monitores) cobre a maioria dos usuários casuais, então a conversão para pago tende a ser menor que em ReplyDraft.

| Parâmetro | Conservador | Base | Otimista |
|---|---|---|---|
| % de usuários ativos que pagam | 2% | 5% | 10% |
| ARPU mensal do pagante **[H]** | US$5 | US$7 | US$9 |

### Simulação 100 / 500 / 1.000 / 5.000 / 10.000 usuários ativos

| Usuários ativos | Pagantes (base, 5%) | Receita conservadora | Receita base | Receita otimista | Custo (base da faixa) | Margem base |
|---|---|---|---|---|---|---|
| 100 | 5 | US$10 | US$35 | US$90 | US$5 | ~US$30 |
| 500 | 25 | US$50 | US$175 | US$450 | ~US$6–20 | ~US$155–169 |
| 1.000 | 50 | US$100 | US$350 | US$900 | US$7–30 | ~US$320–343 |
| 5.000 | 250 | US$500 | US$1.750 | US$4.500 | ~US$40–80 | ~US$1.670–1.710 |
| 10.000 | 500 | US$1.000 | US$3.500 | US$9.000 | US$70–130 | ~US$3.370–3.430 |

### Break-even e payback

- **Break-even:** cenário conservador a 100 usuários já gera margem positiva (~US$5); custo de infra é baixo em toda a faixa.
- **Payback com custo de horas (US$25/h, investimento ~US$3.000):** no cenário base, a 1.000 usuários ativos (margem ~US$330/mês), payback ≈ **9 meses**; a 10.000 usuários (margem ~US$3.400/mês), payback ≈ **<1 mês**.
- **Payback "hours=0" (custo inicial ~US$12–20 de domínio, já que Workers Paid US$5/mês é operacional e não inicial):** payback imediato, no 1º mês, em qualquer cenário com pelo menos alguns pagantes.

### Riscos e sensibilidade

As duas premissas que mais mexem no resultado: **(1)** conversão freemium→pago — se o free tier (1–2 monitores) satisfizer a maioria dos usuários-alvo (indie makers com poucos serviços), a conversão pode ficar abaixo até do cenário conservador; **(2)** custo de infra escalando com nº de monitores × frequência de checagem — o próprio `TF` alerta que isso **"cresce linearmente"** e que gravar cada check (em vez de só mudanças de estado) poderia custar ~US$400/mês a 10.000 usuários, muito acima do range usado aqui.

### Validação comercial

1. **Quem usaria:** indie hackers, pequenas agências digitais, donos de SaaS early-stage com 1–10 endpoints **[CAT]**.
2. **Problema/experiência:** descobrir que o site/API caiu pelo cliente reclamando, em vez de um alerta automático **[CAT]**.
3. **Por que pagaria:** mais monitores do que o free tier permite, ou confiabilidade de página de status pública para seus próprios clientes.
4. **Primeiros usuários sem mídia paga:** comunidades de indie hackers (Indie Hackers, r/SideProject), Product Hunt (lançamento gratuito), conteúdo técnico comparando com concorrentes estabelecidos **[H]**.
5. **Como monetizar:** freemium (1–2 monitores grátis) + plano pago por faixa de nº de monitores **[CAT]**.
6. **Concorrentes que já fazem:** UptimeRobot, Better Uptime/Better Stack, Pingdom, StatusCake — players estabelecidos com planos que escalam caro para múltiplos monitores **[H, CAT]**.
7. **Diferencial:** simplicidade radical + preço fixo baixo para quem tem poucos serviços **[H, CAT]** — diferencial é preço/UX, não tecnologia; fácil de os concorrentes reagirem baixando preço de entrada.
8. **Custo de construir:** 2–4 semanas-pessoa, ~US$2.000–4.000 a US$25/h **[E-TF]**.
9. **Custo de operar:** US$5–130/mês de 100 a 10.000 usuários **[E-TF]**.
10. **Tempo para validar:** 2–4 semanas de MVP + 30–60 dias de uso real para medir falsos positivos e conversão.
11. **Indicadores de sucesso (metas numéricas):** ≥100 contas criadas em 60 dias; ≥5% convertendo para pago em 90 dias; taxa de falso positivo de alerta <2% (crítico para confiança, `TF`).
12. **Kill criteria (numéricos):** <30 contas criadas em 60 dias; ou <2% de conversão para pago em 90 dias; ou taxa de falso positivo >5% sustentada por 2 semanas (destrói confiança, segundo o próprio `TF`).

### Plano de validação sem mídia paga

1. (Semanas 1–4) Construir MVP (monitor HTTP + alerta e-mail + status page básica). 2. Lançar no Product Hunt e em comunidades de indie hackers. 3. Oferecer onboarding gratuito a 20–30 early adopters em troca de feedback direto. 4. Meta em 60–90 dias: 100 contas e primeiros pagantes reais, com taxa de falso positivo medida e corrigida antes de qualquer esforço de crescimento adicional.

---

## Comparativo financeiro dos 3 finalistas

| | C01 Loopwright | C07 ReplyDraft | C06 StatusPing |
|---|---|---|---|
| MVP (semanas-pessoa) **[E-TF]** | 4–7 | 2–4 | 2–4 |
| Investimento em horas (US$25/h) **[H]** | ~US$4.000–7.000 | ~US$2.000–4.000 | ~US$2.000–4.000 |
| Custo caixa inicial (sem horas) **[H]** | ~US$15 (web) / ~US$140 (+mobile) | ~US$20–140 | ~US$12–20 |
| Custo mensal @1.000 usuários ativos **[E-TF]** | US$0–5 | US$100–110 | US$7–30 |
| Custo mensal @10.000 usuários ativos **[E-TF]** | US$5–15 | US$750–850 | US$70–130 |
| Receita base @1.000 usuários ativos | ~US$32/mês | ~US$1.450/mês | ~US$350/mês |
| Receita base @10.000 usuários ativos | ~US$324/mês | ~US$14.500/mês | ~US$3.500/mês |
| Margem base @10.000 usuários ativos | ~US$309–319/mês | ~US$13.650–13.750/mês | ~US$3.370–3.430/mês |
| Payback (horas, base, @1.000 usuários) | ~170 meses | ~2,2 meses | ~9 meses |
| Payback (hours=0, caixa) | ~3–6 meses (cons.) | dias | imediato (1º mês) |
| Gate externo antes de 1ª receita | "Full Launch" do portal (7–21 dias) **[E]** | Review da Chrome Web Store **[H]** | Nenhum gate formal |
| Maior risco de diferenciação | Gênero saturado de clones **[H]** | Gmail/Gemini nativo faz a mesma coisa de graça **[H]** | Preço/UX apenas, fácil de copiar **[H]** |

## Recomendação comercial

Nenhum dos três é "melhor" em todos os eixos — é uma escolha de perfil de risco:

- **C07 ReplyDraft** tem o melhor retorno projetado por usuário e o payback mais rápido em quase todos os cenários, mas carrega o maior risco de diferenciação deste relatório: o Gmail já oferece rascunhos com IA nativamente, então a validação precisa confirmar — rápido e com poucos usuários reais — se alguém paga por uma camada extra antes de investir mais que o MVP.
- **C06 StatusPing** é a aposta mais previsível: monetização menor por usuário, mas custo e risco de diferenciação também menores, e sem gate externo bloqueando a primeira receita. É a opção de menor variância.
- **C01 Loopwright** tem o menor custo de operação de todo o portfólio, mas a receita projetada mesmo a 10.000 usuários ativos é a menor dos três — só justifica o investimento se o objetivo incluir aprendizado de distribuição via portal/engenharia reaproveitável para outros jogos (conforme `TF`), não retorno financeiro isolado.

Dado que o estúdio não tem orçamento de mídia paga, a recomendação é validar **C07 primeiro com o menor gasto possível** (é o mais rápido a testar o risco mais crítico — se alguém paga apesar da concorrência gratuita) e, em paralelo ou como plano B de baixo risco, seguir com **C06** por ter o caminho mais previsível e sem gate externo. **C01** deveria avançar apenas se houver interesse estratégico explícito do fundador em construir o motor de jogo reaproveitável citado em `TF`, não pela expectativa de receita isolada deste produto.

## Aviso: projeções não são receita garantida

Todos os números de receita, conversão e margem acima são **simulações hipotéticas de ordem de grandeza**, construídas sobre premissas majoritariamente **[H]** (não verificadas com fonte ao vivo nesta sessão, devido à indisponibilidade do `web_search`). Nenhum valor aqui deve ser tratado como previsão de receita real ou compromisso financeiro. Antes de qualquer decisão de investimento, validar as premissas-chave (conversão, ARPU, custo de LLM/infra em escala) com dados reais do produto específico.

## Limitações desta análise

- `web_search` indisponível (HTTP 429) durante toda a sessão; só um dado (existência da taxa de registro da Chrome Web Store) foi confirmado via `web_fetch` ao vivo, e mesmo esse sem o valor exato reconfirmado.
- As faixas de conversão para pago de C07 e C06 são estimativas próprias **[H]**, não benchmarks de categoria específicos — não existe um "arquétipo StatusPing" ou "arquétipo extensão de IA para Gmail" no `MONETIZATION_REPORT.md` original; usei o arquétipo micro-SaaS genérico como referência e ajustei para baixo/cima com justificativa textual.
- A conversão de MAU→plays em C01 é uma premissa inteiramente nova desta análise (o `MON` original simula por "plays", não por MAU), então os dois modelos não são diretamente comparáveis sem essa ponte explícita.
- Custos de taxas de plataforma (Apple/Google/Stripe) e impostos não foram deduzidos das margens líquidas nas tabelas de simulação por usuário — apenas citados nos investimentos iniciais e nos break-evens.
