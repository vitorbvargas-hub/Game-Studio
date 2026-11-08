# GS-001 — Resumo Executivo para o Fundador

- **De:** game-studio (CEO) · **Para:** Vitor Vargas · **Data:** 2026-11-08
- **Decisão pedida:** aprovar (ou não) a **Fase 0 de validação do C07 ReplyDraft**. A produção completa continua bloqueada até sua aprovação.

## Recomendação

**Primeiro produto: C07 ReplyDraft**: extensão do Chrome que gera, dentro do Gmail, rascunhos de resposta no tom da marca de pequenos negócios e freelancers. Monetização por assinatura mensal.

**Mas não comece pelo MVP.** Primeiro, uma **Fase 0 de ≤2 semanas, quase sem custo**, para matar ou confirmar o maior risco: *alguém paga por isso se o Gmail já tem IA nativa?*
- **Plano B:** C06 StatusPing.
- **Em espera:** C01 Loopwright.

## Por que o C07 e não os outros

| | C07 ReplyDraft | C01 Loopwright | C06 StatusPing |
|---|---|---|---|
| Score final (0–100) | **69** | 68 | 66 |
| Receita base @1.000 usuários ativos [H] | **~US$1.450/mês** | ~US$32/mês | ~US$350/mês |
| Custo/mês @1.000 | US$100–110 | US$0–5 | US$7–30 |
| MVP | **2–4 semanas-pessoa** | 4–7 | 2–4 |
| Payback (horas a US$25/h, @1k) [H] | **~2 meses** | ~170 meses | ~9 meses |
| Risco de qualidade (QA) | 4/5 (alto) | 2/5 | 3/5 |

1. **É o único finalista em que receita relevante é plausível com uma base pequena.** Com 5% pagando US$29, 1.000 usuários ativos cobrem com folga o custo de operação. O C01 precisaria de dezenas de milhares de jogadores para pagar o tempo investido.
2. **O MVP é o mais curto e o mais barato em caixa.** O custo inicial é só a taxa da Chrome Web Store e um domínio, e ambos dependem da sua aprovação.
3. **Os riscos aparecem cedo e custam pouco para testar.** Concorrência do Gmail/Gemini, política da Chrome Web Store e disposição a pagar podem ser verificadas antes de escrever o produto.
4. **Por que não o C01 primeiro:** é o mais seguro de entregar (QA 2/5) e o mais barato de operar, mas o business case mostra receita pulverizada demais (ads + IAP com ARPU baixo). Ele serve como aprendizado e motor reaproveitável, não como o 1º gerador de receita.
5. **Por que não o C06 primeiro:** é previsível e não tem gate externo, mas a diferenciação é só preço/UX contra UptimeRobot, Better Stack e similares, e o teto de receita é ~4× menor que o do C07.

## Fase 0 — validação proposta (≤2 semanas)

| # | Ação | Aprovação necessária? |
|---|---|---|
| 1 | Verificar quem tem acesso ao Gemini "Help me write" no Gmail (contas gratuitas vs. Workspace pago) e a que preço | Não. Exige busca web funcionando (hoje a cota Gemini está esgotada; ver pendências) |
| 2 | Verificar a política da Chrome Web Store para extensões com acesso a `mail.google.com` (dados de usuário, Limited Use) | Não |
| 3 | Spike técnico local: extensão que lê um e-mail aberto e insere um rascunho (texto puro), com defesa contra prompt injection | Não. Local, sem publicar |
| 4 | 10–15 entrevistas de problema com donos de e-commerce/freelancers | **Sim**: comunicação externa |
| 5 | Landing page com lista de espera (fake door) | **Sim**: publicação externa + domínio |

**Passa para o MVP se:** (1) o recurso nativo não atender ao público-alvo (limitado ao plano pago ou sem tom de marca persistente); (2) não houver bloqueio de política na Chrome Web Store; (3) ≥5 de 15 entrevistados descreverem a dor como semanal e disserem que pagariam ≥US$15/mês.
**Mata (vai para o plano B C06) se:** o Gmail gratuito já entrega tom persistente, ou a política da loja inviabilizar, ou <3 de 15 relatarem a dor.

**Critérios pós-MVP (BUSINESS_CASE.md):** sucesso = ≥50 instalações ativas em 30 dias, ≥5% pagando em 60 dias, retenção de pagantes ≥70% no mês 2. Kill = <20 instalações, <2% de conversão, ou custo de LLM >30% do ARPU.

## O que precisa de você

1. **Aprovar a Fase 0** (itens 1–3 já autorizados pela governança; itens 4–5 precisam de sim explícito).
2. **Busca web:** a cota da API Gemini (busca) está esgotada (HTTP 429). Escolha uma opção: aguardar a renovação, aumentar a cota (custo) ou configurar outro provider de busca (custo). Sem busca, a demanda continua sendo hipótese.
3. Opcional: provider de geração de imagens para o game-art (custo).

## Avisos

Todas as receitas são **simulações com premissas majoritariamente [H]**, não previsões nem promessas. A busca web esteve indisponível em todo o discovery: Reddit, Product Hunt, Google Trends e SteamDB não foram consultados. Os preços de infraestrutura e LLM foram verificados nas páginas oficiais (QA confirmou 6 de 6 amostras). Nenhum nome de produto passou por checagem de marca registrada.

## Documentos

[README](README.md) · [Pesquisa de mercado](MARKET_RESEARCH.md) · [Catálogo dos 10](OPPORTUNITY_CATALOG.md) · [Monetização](MONETIZATION_REPORT.md) · [Viabilidade técnica](TECHNICAL_FEASIBILITY.md) · [Ranking](FINAL_RANKING.md) · [Business cases](BUSINESS_CASE.md) · [Protótipos conceituais](PROTOTYPES.md) · [Visual](VISUAL_PROPOSALS.md) · [QA](QA_REPORT.md) · protótipo local do C01: `projects/prototypes/GS-001-C01-loopwright/index.html`
