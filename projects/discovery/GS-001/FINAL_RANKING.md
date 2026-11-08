# GS-001 — Ranking das 10 Oportunidades

- **Autor:** game-studio (consolidação) · **Data:** 2026-11-08 · **Status:** v2 final (2026-11-08) — tabela abaixo = v1 pré-aprofundamento; ver "Ranking final pós-aprofundamento"
- **Fontes:** MARKET_RESEARCH.md (MR), MONETIZATION_REPORT.md (MON), OPPORTUNITY_CATALOG.md (CAT), TECHNICAL_FEASIBILITY.md (TF)
- **Rubrica:** STRATEGY.md — Demanda 20 · Monetização 20 · Aquisição 15 · Diferenciação 15 · Facilidade técnica 10 · Baixo custo 10 · Retenção 10.

> **Ressalva de evidência.** A busca web (Gemini) esteve indisponível (HTTP 429) para todos os agentes em 2026-11-08. Reddit, Product Hunt, Google Trends e SteamDB não puderam ser consultados. Demanda e diferenciação estão majoritariamente apoiadas em **[H]**. Por isso **nenhum conceito passa de 80**: todos estão em "interessante" ou "necessita validação". Notas de demanda/diferenciação são as mais frágeis.

## Ranking

| # | Conceito | Dem /20 | Mon /20 | Aq /15 | Dif /15 | Téc /10 | Custo /10 | Ret /10 | **Total** | Faixa |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | C01 Loopwright (idle+coleção, web) | 15 | 9 | 12 | 8 | 9 | 10 | 8 | **71** | Interessante |
| 2 | C07 ReplyDraft (AI micro-SaaS, extensão) | 14 | 15 | 10 | 8 | 8 | 7 | 8 | **70** | Interessante |
| 3 | C06 StatusPing (uptime micro-SaaS) | 13 | 14 | 9 | 5 | 8 | 8 | 9 | **66** | Interessante |
| 4 | C05 InvoiceLoop (cobrança micro-SaaS) | 13 | 16 | 8 | 6 | 7 | 6 | 9 | **65** | Interessante (limite) |
| 5 | C03 Scrapline (factory-lite) | 12 | 8 | 9 | 11 | 6 | 10 | 7 | **63** | Validar |
| 6 | C10 Notebrief (AI notas de voz) | 13 | 13 | 8 | 7 | 8 | 5 | 7 | **61** | Validar |
| 7 | C04 Pocket Orchard (cozy mobile) | 13 | 12 | 5 | 9 | 6 | 6 | 8 | **59** | Validar |
| 8 | C08 FocusRail (foco/produtividade) | 12 | 10 | 5 | 4 | 8 | 10 | 7 | **56** | Validar |
| 9 | C02 Fathom Freight (strategy browser) | 10 | 9 | 7 | 9 | 4 | 9 | 7 | **55** | Validar |
| 10 | C09 Receipt Clear (recibos) | 11 | 9 | 6 | 6 | 6 | 8 | 4 | **50** | Validar (limite) |

## Justificativas

**C01 Loopwright — 71.** Dem 15: [E] idle+coleção tem precedentes de viralização orgânica (Cookie Clicker, Universal Paperclips — MR) e a tag itch.io "Collecting" (287) é muito menos saturada que "Idle" (11.920) (MR). Mon 9: [E] categorias A/B têm monetização 2/5 (MON); ads+IAP leve têm ARPU baixo, e portais só monetizam após teste de 7–21 dias (MON). Aq 12: [E] CrazyGames 31–35M usuários/mês e itch.io são canais gratuitos (MR). Dif 8: [H] otimização de layout em vez de só power-creep; gênero lotado de clones. Téc 9 / Custo 10: [E-TF] complexidade 3, 4–7 sem-pessoa, US$0–5/mês @1k. Ret 8: [H] prestígio + offline progress são motores clássicos de retenção.

**C07 ReplyDraft — 70.** Dem 14: [H] dor recorrente de suporte/atendimento em pequenos negócios; [E] apps com IA geram +41% de receita por pagante (MON/RevenueCat). Mon 15: [E] micro-SaaS é a categoria de melhor LTV (MON); penalizado porque apps de IA têm churn 30% mais rápido [E]. Aq 10: [H] Chrome Web Store + SEO; espaço disputado. Dif 8: [H] **risco grande — o próprio Gmail oferece rascunhos com IA (Gemini "Help me write")**. Fonte: conhecimento prévio do coordenador (o Google anunciou o recurso em 2023–2024). Não foi reverificado hoje: a página de ajuda deu 404 e a de produto não cita o recurso. A disponibilidade para contas Gmail gratuitas vs. Workspace pago é a primeira coisa a validar; o diferencial precisa ser tom de marca + histórico do cliente. Téc 8: [E-TF] complexidade 2, 2–4 sem; risco de quebra quando o DOM do Gmail muda e de review da loja; a Gmail API exige auditoria CASA [E], por isso fica fora do MVP. Custo 7: US$100–110/mês @1k (LLM), coberto pela assinatura. Ret 8: uso diário em fluxo de trabalho.

**C06 StatusPing — 66.** Dem 13 [H] / Mon 14 [E categoria G]. Aq 9: comunidades indie, mas [H] mercado com players de marca forte. Dif 5: [H] diferenciação só por preço/simplicidade — o ponto mais fraco. Téc 8 / Custo 8: [E-TF] 2–4 sem; US$7–30 @1k; risco SSRF e de confiabilidade. Ret 9: monitoramento é infraestrutura "configure e esqueça" → churn baixo [H].

**C05 InvoiceLoop — 65.** Melhor monetização (16), mas Dif 6 (categoria lotada [H]) e Custo 6 (US$65–80 @1k, entregabilidade de e-mail). Fica atrás de C06 por diferenciação e custo equivalentes, com risco regulatório (NF-e) maior.

**C03 Scrapline — 63.** Melhor diferenciação dos jogos (11), mas UX de grid em touch é risco não testado (TF complexidade 4) e o modelo de monetização está indefinido.

**C10 Notebrief — 61.** Problema real, MVP curto, mas o **custo variável mais alto** (US$230–350 @1k, transcrição — TF) e um mercado de notas de voz com IA que parece lotado [H] reduzem a nota.

**C04 — 59, C08 — 56, C02 — 55, C09 — 50.** Respectivamente: dependência de aquisição mobile sem orçamento de UA ([E] F=1 em MON) e custo de arte; saturação extrema; MVP grande (6–10 sem + 6–8); uso sazonal (retenção 4).

## Finalistas selecionados

1. **C01 Loopwright** — jogo; menor custo e canal gratuito mais forte.
2. **C07 ReplyDraft** — AI micro-SaaS; melhor equilíbrio entre monetização e MVP curto.
3. **C06 StatusPing** — micro-SaaS clássico; maior retenção e custo previsível.

**Sensibilidade:** a diferença entre o 3º (66) e o 4º (65) e entre o 3º e o 6º (61) está dentro da margem de erro das notas [H]. Escolhi o C06 em vez do C05/C10 para ter três perfis distintos (jogo · SaaS com IA · SaaS de infraestrutura) e porque o C10 tem o pior custo variável.

## Ranking final pós-aprofundamento (v2)

Ajustes com base em BUSINESS_CASE.md (BC), QA_REPORT.md (QA), PROTOTYPES.md (PR) e VISUAL_PROPOSALS.md (VP):

- **C01 Monetização 9 → 6.** A receita base do BC é ~US$32/mês com 1.000 MAU e ~US$324/mês com 10.000 MAU; o payback com custo de horas fica em ~170 meses. O canal é ótimo, mas a receita é pulverizada demais para o objetivo "gerar receita".
- **C07 Facilidade técnica 8 → 7.** O QA dá risco de qualidade 4/5: DOM de terceiro, política da Chrome Web Store para `mail.google.com` não verificada, prompt injection vinda de e-mails recebidos.
- **C06 sem mudança.** O QA dá risco 3/5 (SSRF e isolamento multi-tenant no D1, ambos tratáveis em design).

| # | Finalista | Score v1 | Score v2 | Risco QA | Receita base @1k MAU | Custo/mês @1k | MVP | Arte (VP) |
|---|---|---|---|---|---|---|---|---|
| 1 | **C07 ReplyDraft** | 70 | **69** | 4/5 | ~US$1.450 | US$100–110 | 2–4 sem | 1/5 · 10–16 h |
| 2 | **C01 Loopwright** | 71 | **68** | 2/5 | ~US$32 | US$0–5 | 4–7 sem | 2/5 · 35–55 h |
| 3 | **C06 StatusPing** | 66 | **66** | 3/5 | ~US$350 | US$7–30 | 2–4 sem | 1/5 · 12–18 h |

### Comparativo financeiro (BC, cenário base — hipóteses, não receita garantida)

| | C07 | C01 | C06 |
|---|---|---|---|
| Investimento em horas (US$25/h [H]) | US$2–4 mil | US$4–7 mil | US$2–4 mil |
| Caixa inicial | ~US$20–140 | ~US$15 | ~US$12–20 |
| Receita / margem @10k MAU | ~US$14,5 mil / ~US$13,7 mil | ~US$324 / ~US$310 | ~US$3,5 mil / ~US$3,4 mil |
| Payback (horas, @1k MAU) | ~2,2 meses | ~170 meses | ~9 meses |
| Premissa mais sensível | conversão 2–12% [H]; Haiku → Sonnet multiplica o custo de LLM por ~20× | MAU→plays, eCPM do portal | conversão, preço |

### Comparativo técnico (TF + QA)

| | C07 | C01 | C06 |
|---|---|---|---|
| Stack | Chrome MV3 + Worker proxy + Haiku 5.5 | TS + PixiJS PWA + Worker/D1 | Workers Cron/Queues + D1 |
| Complexidade | 2/5 | 3/5 | 3/5 |
| Dependência externa crítica | DOM do Gmail, Chrome Web Store, API de LLM | Portal (CrazyGames/itch.io) | Nenhuma crítica |
| Riscos a tratar antes do MVP | prompt injection, privacidade, permissões mínimas | fraude de rewarded ads, save/cheat, big numbers | SSRF, isolamento entre clientes |

### Comparativo comercial (BC + MON + MR)

| | C07 | C01 | C06 |
|---|---|---|---|
| Quem paga | PMEs/freelancers que atendem cliente por e-mail | poucos jogadores (IAP) + anunciantes | indie makers, agências pequenas |
| Canal sem mídia paga | Chrome Web Store SEO, comunidades de e-commerce | CrazyGames, itch.io, r/incremental_games | Indie Hackers, comunidades dev, SEO |
| Gate antes da 1ª receita | Review da Chrome Web Store [H] | Teste de 7–21 dias do portal [E] | nenhum |
| Maior ameaça | Gmail nativo gratuito [H] | saturação de clones | commodity, fácil de copiar |

### Decisão do coordenador

**Recomendado como 1º produto: C07 ReplyDraft**, **condicionado** a uma validação de diferenciação de ≤2 semanas antes de gastar horas de MVP. Plano B: **C06 StatusPing**. **C01 Loopwright** fica em espera como trilha estratégica (motor de jogos reaproveitável), não como aposta de receita. Racional completo em EXECUTIVE_SUMMARY.md.
