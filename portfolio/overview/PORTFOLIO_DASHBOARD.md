# Painel do Portfólio (documental)

> **Autor (agente):** game-growth · **Data:** 2026-11-08. Painel estático em Markdown — não há integração com nenhum sistema de métricas real; todos os números vêm dos documentos citados ou são **PENDENTE/NÃO VALIDADO**.
> **[E]** evidência · **[H]** hipótese · **NÃO VALIDADO** = sem dado.

## 1. Total de projetos/oportunidades por estágio

| Estágio | Qtde | IDs |
|---|---|---|
| Discovery concluído | 1 | GS-001 |
| HOLD (pausado) | 1 | GS-002 (ReplyDraft) |
| MVP/Desenvolvimento ativo | 0 | — |
| Beta | 0 | — |
| Lançado | 0 | — |
| Oportunidade catalogada, não iniciada | 9 | C01, C02, C03, C04, C05, C06, C08, C09, C10 (C07 virou GS-002) |
| Arquivado/Kill | 0 | — |

## 2. Produtos ativos / lançados

**Ativos (com time alocado):** 0 — GS-002 está em HOLD, sem trabalho em andamento.
**Lançados:** 0.

## 3. Financeiro realizado (não projetado)

| Métrica | Valor | Fonte |
|---|---|---|
| Receita realizada (todo o portfólio) | **R$ 0 / US$ 0** | Nenhum produto lançado — fato, não estimativa |
| Custo realizado — infraestrutura de produto (Supabase, Cloudflare, Stripe etc.) | **R$ 0** | Nenhuma conta paga de produto foi aberta (ADR-002 bloqueia) |
| Custo realizado — Recraft v3 (Sharp IA, geração de imagem, nível estúdio) | **NÃO VERIFICADO** — 4 usos registrados em 2026-11-08 (1 teste + 3 propostas de Brand Guide), valor exato não confirmado | `portfolio/performance/COSTS.md` |
| Custo realizado — agentes (assinatura Claude do fundador) | **PENDENTE** — valor não informado ao estúdio | `STUDIO_CAPACITY.md` |
| Margem realizada | **N/A** — sem receita nem custo atribuído com precisão | — |
| MRR | **N/A** — nenhuma assinatura ativa | — |
| ARR | **N/A** | — |
| Investimento acumulado (caixa, aprovado pelo fundador) | **R$ 0** — nenhuma compra/assinatura de produto aprovada até hoje | `shared/decisions/` |

## 4. Projeções (rotuladas — não são receita)

> **Aviso:** os números abaixo são simulações **[H]** de `projects/discovery/GS-001/BUSINESS_CASE.md`, com premissas majoritariamente não verificadas por busca ao vivo (API indisponível no dia do discovery). Não são previsão nem compromisso.

| Projeto | Cenário base, receita projetada @1.000 usuários/mês [H] | Cenário base, margem projetada @1.000 usuários/mês [H] |
|---|---|---|
| C07 ReplyDraft (GS-002) | ~US$1.450 | ~US$1.340–1.350 |
| C06 StatusPing (plano B) | ~US$350 | ~US$320–343 |
| C01 Loopwright (em espera) | ~US$32 | ~US$27–32 |

## 5. Riscos em destaque

Ver `risk-management/RISK_REGISTER.md` para o registro completo. Top 3 nesta data:

1. Custo de agentes e de Recraft não medido → decisões de portfólio sem visibilidade de custo real do próprio estúdio.
2. Diferenciação do C07/ReplyDraft contra Gmail/Gemini nativo é **[H]** não verificada — maior risco de mercado do único produto em HOLD.
3. Busca web (Gemini) ficou indisponível (HTTP 429) durante todo o GS-001 → quase todas as notas de demanda/concorrência do portfólio são **[H]**, não **[E]**.

## 6. Próximas decisões pendentes do fundador

1. Quando/se retomar GS-002 (ReplyDraft) a partir do HOLD.
2. Se o próximo passo é "fundador traz sua própria ideia" (conforme combinado ao pausar o estúdio) ou retomar uma das 9 oportunidades catalogadas.
3. Atribuir valor/orçamento ao custo de agentes e Recraft, para permitir cálculo real de margem do estúdio.
4. Decidir sobre as pendências de plataforma do `ROADMAP.md` (provider de busca, provider de imagem, sandbox Docker).

## 7. Capacidade do estúdio (resumo)

Ver `STUDIO_CAPACITY.md`. Resumo: 7 agentes, 0 projetos em desenvolvimento ativo hoje (limite 2), 0 em validação (limite 3) — estúdio com capacidade 100% livre no momento, aguardando decisão do fundador.
