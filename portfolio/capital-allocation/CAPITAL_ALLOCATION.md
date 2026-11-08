# Alocação de Capital — Game Studio

> **Autor (agente):** game-growth · **Data:** 2026-11-08 · Script 06 §6–7 (fundador).
> **[E]** evidência · **[H]** hipótese · **NÃO VALIDADO** = sem dado real. Toda projeção aqui é simulação de ordem de grandeza, **não receita garantida, não previsão**.
> Nenhum valor abaixo representa gasto aprovado — isso exige aprovação explícita do fundador por item, conforme `GOVERNANCE.md`.

## 1. Por projeto (Script 06 §6)

### GS-001 — Discovery do estúdio

| Campo | Valor |
|---|---|
| Investimento aprovado | R$ 0 (sem gasto de caixa; só tempo de agente) |
| Investimento gasto real | R$ 0 em caixa. Custo de agente: **PENDENTE** (assinatura Claude do fundador, valor não atribuído ao estúdio) |
| Retorno esperado | N/A — é discovery, não produto |
| Retorno realizado | N/A |
| ROI | N/A |
| Status de capital | Encerrado, sem exposição de caixa |

### GS-002 — ReplyDraft (HOLD)

| Campo | Valor |
|---|---|
| Investimento aprovado para Fase 0 | R$ 0 de caixa. Itens 1–3 (pesquisa, política, spike técnico) autorizados pela governança sem custo. Itens 4–5 (entrevistas, landing page) aprovados em ADR-003, mas **não executados** — exigiriam domínio/hospedagem ainda não definidos pelo fundador. |
| Investimento aprovado para MVP completo | **R$ 0 — não aprovado.** Bloqueado por ADR-002 até aprovação explícita (LLM real, Supabase Pro, Stripe, Chrome Web Store). |
| Investimento gasto real até hoje | **R$ 0 atribuído diretamente a este projeto.** Os únicos custos registrados de Recraft v3 (`portfolio/performance/COSTS.md`) são marcados "Projeto: Estúdio" (teste técnico + propostas de símbolo do Brand Guide), não GS-002 — uso autorizado por [ADR-004](../../shared/decisions/ADR-004-organizacao-estudio.md). Tempo de agente no GS-002 — custo **PENDENTE**, não medido separadamente. |
| Estimativa de custo de build do MVP completo (não aprovado, apenas referência) [E-TF/H] | 2–4 semanas-pessoa (~80–160h); ~US$2.000–4.000 a US$25/h hipotético — `BUSINESS_CASE.md` |
| Estimativa de custo mensal de operação em escala (não aprovado) [E-TF] | US$100–110/mês @1.000 usuários ativos; US$750–850/mês @10.000 |
| Retorno esperado (projeção [H], não meta de caixa) | Ver cenários na seção 2 |
| Retorno realizado | R$ 0 — produto não lançado, em HOLD |
| ROI | N/A — sem investimento de caixa real ainda |
| Status de capital | **HOLD** — nenhum novo gasto até o fundador decidir retomar |

### Oportunidades catalogadas (C01, C02, C03, C04, C05, C06, C08, C09, C10)

Nenhuma tem investimento aprovado, gasto real ou retorno — não foram priorizadas para avançar. Estimativas de custo de build existem apenas para os 3 finalistas do GS-001 (C01, C06, C07); as outras 7 têm somente nota de ranking e catálogo de conceito, sem simulação financeira (`BUSINESS_CASE.md` cobre só os 3 finalistas).

## 2. Cenários conservador/base/otimista — ReplyDraft (GS-002)

> Fonte única: `projects/discovery/GS-001/BUSINESS_CASE.md` §2 (C07), 2026-11-08. Essas são as **únicas premissas financeiras existentes** para o ReplyDraft — nenhuma foi revalidada com dado real (busca web indisponível no dia do discovery; produto em HOLD desde então, sem usuários). Os horizontes de 3/6/12/24 meses abaixo são uma **reprojeção própria desta seção**, construída sobre a tabela original "100/500/1.000/5.000/10.000 usuários ativos" do business case, assumindo uma curva de crescimento hipotética — marcada **[H, extrapolação própria]**, pois o business case original não projeta por tempo, só por nº de usuários.

### 2.1 Premissas base (herdadas do business case, [E-TF]/[H])

| Parâmetro | Conservador | Base | Otimista |
|---|---|---|---|
| % de usuários ativos que pagam | 2% | 5% | 12% |
| ARPU mensal do pagante (bruto, antes de taxas) [H] | US$15 | US$29 | US$49 |
| Custo de LLM/infra por usuário ativo/mês [E-TF] | ~US$0,07 (Haiku) a ~US$0,85–0,10 faixa baixa | ~US$0,10–0,11 | pode subir ~20× (~US$1,43) se precisar trocar Haiku→Sonnet |

### 2.2 Premissa de crescimento hipotética (nova, [H] — não existe no business case original)

Para ilustrar os horizontes de 3/6/12/24 meses pedidos pelo Script 06, assume-se **apenas como exercício ilustrativo** uma curva de usuários ativos hipotética, sem qualquer base em aquisição real (não há canal validado nem usuário nenhum hoje):

| Horizonte | Usuários ativos assumidos [H, ilustrativo] |
|---|---|
| 3 meses | 100 |
| 6 meses | 500 |
| 12 meses | 1.000 |
| 24 meses | 5.000 |

**Esta curva não tem evidência de suporte — é um placeholder para preencher o formato pedido pelo Script 06, não uma meta ou previsão.** O produto está em HOLD e não tem nenhum usuário.

### 2.3 Projeção financeira por horizonte (cenário base, [H])

Taxas de plataforma (Chrome Web Store não cobra comissão de assinatura; Stripe ~2,9%+US$0,30/transação [H]) e impostos (alíquota não definida — depende de regime tributário do fundador/estúdio, **NÃO VALIDADO**) não foram deduzidos nas tabelas do business case original; aplicamos aqui uma estimativa simples de taxas, mantendo impostos como linha separada em branco.

| Horizonte | Usuários ativos [H] | Pagantes (5%) | Receita bruta mensal (base) [H] | Taxas Stripe (~3%) [H] | Impostos estimados | Custo variável (LLM/infra) [E-TF] | Custo fixo mensal (sem custo de hora) | Margem de contribuição | Resultado mensal | Caixa acumulado necessário antes de receita [H] |
|---|---|---|---|---|---|---|---|---|---|---|
| 3 meses | 100 | 5 | US$145 | ~US$4 | **NÃO VALIDADO** (não calculado — depende de regime fiscal) | US$5–40 | US$0 (sem conta Pro ainda) | ~US$100–136 | ~US$100–136/mês | ~US$20–140 (Chrome fee + domínio) |
| 6 meses | 500 | 25 | US$725 | ~US$22 | NÃO VALIDADO | US$55–75 | Supabase Pro ~US$25 (se migrado) | ~US$600–625 | ~US$600–625/mês | idem acima, já incorrido |
| 12 meses | 1.000 | 50 | US$1.450 | ~US$44 | NÃO VALIDADO | US$100–110 | ~US$25 | ~US$1.270–1.280 | ~US$1.270–1.280/mês | idem |
| 24 meses | 5.000 | 250 | US$7.250 | ~US$218 | NÃO VALIDADO | US$350–450 | ~US$25 | ~US$6.550–6.650 | ~US$6.550–6.650/mês | idem |

### 2.4 Conservador e otimista (mesma curva de usuários hipotética, só variando conversão/ARPU)

| Horizonte | Receita bruta conservadora [H] | Receita bruta otimista [H] |
|---|---|---|
| 3 meses (100 usuários) | US$30 | US$588 |
| 6 meses (500 usuários) | US$150 | US$2.940 |
| 12 meses (1.000 usuários) | US$300 | US$5.880 |
| 24 meses (5.000 usuários) | US$1.500 | US$29.400 |

### 2.5 Payback e break-even (herdado do business case, não recalculado por horizonte)

- Break-even de infra: a partir de ~1–4 pagantes.
- Payback com custo de horas (US$25/h, investimento ~US$3.000, cenário base, @1.000 usuários): ~2,2 meses.
- Payback "hours=0" (só caixa ~US$20–140): dias.
- **Risco que inverte tudo [E-TF]:** se Haiku não bastar e for preciso Sonnet, custo de LLM por usuário sobe ~20×, podendo inverter a margem em qualquer cenário/horizonte.

### 2.6 Leitura obrigatória

Esta seção existe para cumprir o formato do Script 06, **não para sugerir que o produto tem 100, 500, 1.000 ou 5.000 usuários em algum horizonte real**. O produto está em HOLD, sem usuário, sem canal de aquisição testado, sem aprovação para operar com LLM real ou billing real. Qualquer decisão de investimento deve partir da Fase 0 (validar a dor e a disposição a pagar), não desta tabela.

## 3. Regras de investimento do estúdio (Script 06 §7 / `GOVERNANCE.md`)

1. Nenhum produto entra em MVP completo sem discovery, business case e **aprovação explícita do fundador** (`VISION.md` princípio 1).
2. Qualquer gasto — conta paga, API, assinatura, domínio, publicidade, publicação em loja — exige aprovação explícita item a item (`GOVERNANCE.md`).
3. Validação barata (Fase 0) vem antes de MVP: medir disposição a pagar e risco de diferenciação com o menor gasto possível.
4. Critérios de passagem e de kill devem ser numéricos e definidos **antes** de começar a validar (ver `BUSINESS_CASE.md` por projeto).
5. Projeção de receita nunca é tratada como receita real nem como compromisso (`STRATEGY.md`: "nunca prometer retorno").
6. Capacidade do estúdio é limitada por conduta (máx. 4 tarefas simultâneas no coordenador; 2 produtos em desenvolvimento ativo, 3 em validação — `STUDIO_CAPACITY.md`) — alocação de capital de atenção/tempo de agente também é um recurso finito, não só dinheiro.
7. Decisões reversíveis: o coordenador decide e registra ADR. Decisões com risco financeiro, jurídico, destrutivo ou de publicação: o fundador decide (`GOVERNANCE.md`).

## 4. As 7 perguntas obrigatórias antes de alocar capital (Script 06)

Aplicadas ao único candidato com business case elegível a reativação, ReplyDraft (GS-002):

1. **Quanto já foi gasto nesse projeto?** R$ 0 diretamente — os custos de Recraft registrados em `portfolio/performance/COSTS.md` são de nível estúdio (Brand Guide), não deste projeto. Tempo de agente no projeto: **PENDENTE**.
2. **Quanto falta para a próxima decisão relevante (Fase 0 completa)?** R$ 0 de caixa para os itens 1–3 (já rodáveis sem custo); itens 4–5 dependem de domínio/hospedagem a definir — custo baixo (~US$12–20/ano) mas **não orçado**.
3. **Qual é o retorno esperado, com que confiança?** Projeção **[H]** de ~US$1.450/mês de receita bruta @1.000 usuários no cenário base — confiança baixa: maior risco do relatório é o Gmail/Gemini nativo já resolver a dor de graça, não verificado.
4. **Qual é o pior cenário (kill criteria)?** <20 instalações ativas em 30 dias, ou <2% de conversão em 60 dias, ou custo de LLM >30% do ARPU — nenhum medido ainda (produto em HOLD, sem usuários).
5. **O que precisa ser verdade para este investimento valer a pena?** Que ≥5 de 15 entrevistados relatem dor semanal e disposição a pagar ≥US$15/mês (critério de passagem da Fase 0) — não testado.
6. **Existe alternativa de menor custo/risco que testa a mesma hipótese?** Sim — C06 StatusPing é o plano B explícito, com risco de diferenciação menor e sem gate externo (Chrome Web Store review).
7. **Essa decisão é reversível?** Sim — nada foi publicado, nenhuma conta paga aberta, nenhum usuário real envolvido. Retomar ou não o HOLD é 100% reversível hoje.

## 5. Recomendação desta seção

Ver `decisions/INVESTMENT_DECISIONS.md` para a recomendação formal por projeto. Resumo: nenhum novo gasto de caixa é necessário agora — a próxima alocação de capital relevante é de **tempo de agente**, não de dinheiro, e só deve mirar a Fase 0 do ReplyDraft (ou a ideia que o fundador trouxer) quando o fundador decidir retomar.
