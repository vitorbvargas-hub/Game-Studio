# Registro de Riscos — Game Studio

> **Autor (agente):** game-growth · **Data:** 2026-11-08.
> Probabilidade/Impacto em escala Baixo/Médio/Alto. **[E]** evidência · **[H]** hipótese.

## 1. Riscos do estúdio (nível portfólio)

| # | Risco | Probabilidade | Impacto | Mitigação | Dono |
|---|---|---|---|---|---|
| R-01 | Custo de agentes (assinatura Claude) e de Recraft não medido por projeto → decisões de portfólio sem visibilidade de custo real | Alta — já está ocorrendo | Médio (distorce priorização, não quebra nada hoje) | Fundador atribuir valor de referência; preencher `portfolio/performance/COSTS.md` por projeto | Fundador (atribuir valor) / game-studio (registrar) |
| R-02 | Busca web (Gemini) com cota esgotada → demanda/concorrência de todo o portfólio continua **[H]**, não **[E]** | Alta — já ocorreu em 100% do GS-001 | Alto (toda decisão de priorização repousa em hipótese) | Fundador decidir: aguardar renovação, aumentar cota ou configurar outro provider (ambos com custo) | Fundador |
| R-03 | Nenhum limite de concorrência/profundidade de agente é aplicado tecnicamente (só por conduta) → risco de um agente disparar mais tarefas/aninhamento do que o combinado | Média | Médio (desperdício de cota, não destrutivo) | Reforçar regra em `AGENTS.md` de cada agente; revisar em auditoria periódica | game-studio |
| R-04 | Sandbox desligado (sem Docker) → isolamento entre workspaces depende só de política de ferramentas | Baixa (nenhum incidente registrado) | Alto se ocorrer (acesso cruzado entre workspaces) | Manter regras de escopo de escrita em `AGENTS.md`; não instalar Docker sem avaliar custo/benefício | game-studio |
| R-05 | Nenhum produto lançado após 1 dia de operação — risco de o estúdio ficar em "modo discovery permanente" sem converter em produto real | Média | Alto (objetivo do estúdio é ter produtos rentáveis) | Plano de 90 dias (`executive-reports/90_DAY_STUDIO_PLAN.md`) com meta explícita de decisão | game-studio / fundador |

## 2. Riscos do GS-002 ReplyDraft (HOLD)

| # | Risco | Probabilidade | Impacto | Mitigação | Dono |
|---|---|---|---|---|---|
| R-06 | Gmail/Gemini nativo já resolve a dor de graça (rascunhos de resposta) — risco central do produto, nunca verificado com fonte ao vivo [H] | Desconhecida — não testada | Alto (pode invalidar todo o produto) | Fase 0 item 1 (verificar acesso/preço do recurso nativo) antes de qualquer MVP | game-research (quando retomado) |
| R-07 | Custo de LLM pode subir ~20× se Haiku não bastar e for preciso Sonnet, invertendo a margem em qualquer cenário [E-TF] | Média (depende de qualidade de output ainda não testada) | Alto (inverte viabilidade financeira) | Medir qualidade de output com Haiku antes de comprometer preço/plano | game-dev (quando retomado) |
| R-08 | Política da Chrome Web Store para extensões com acesso a `mail.google.com` pode bloquear o produto (Limited Use, revisão de dados de usuário) | Baixa-Média (não verificada nesta sessão) | Alto (gate externo antes de qualquer receita) | Fase 0 item 2 (verificar política antes do MVP) | game-dev / game-design |
| R-09 | Prompt injection via conteúdo de e-mail recebido (vetor de ataque documentado no QA_REPORT) | Média (DOM de terceiro, input não controlado) | Médio-Alto (qualidade/segurança do rascunho gerado) | Mitigação de prompt injection já prevista no PRD/backlog (EP4); reforçar em QA antes de LLM real | game-qa |
| R-10 | DOM do Gmail pode mudar e quebrar o content script sem aviso | Média (histórico de produtos similares) | Médio (quebra funcional, não dado) | Testes Playwright contra fixture + monitoramento manual se/quando retomado | game-dev |
| R-11 | Projeto em HOLD há tempo indefinido → conhecimento/contexto pode se perder entre agentes se a retomada demorar muito | Baixa-Média | Médio | Manter PRD/BACKLOG/ADRs atualizados como fonte única ao retomar; não depender de memória de sessão | game-design |

## 3. Riscos das oportunidades catalogadas, não aprofundadas (C01–C06, C08–C10)

| # | Risco | Probabilidade | Impacto | Mitigação | Dono |
|---|---|---|---|---|---|
| R-12 | Nomes provisórios (C01–C10) nunca passaram por checagem de marca/trademark/domínio — podem colidir com produtos existentes | Desconhecida (não verificado) | Médio (retrabalho de rebranding se avançar) | Checagem de trademark/domínio com busca ao vivo antes de qualquer uso público, exigida já no `OPPORTUNITY_CATALOG.md` | game-research (quando priorizado) |
| R-13 | 7 das 10 oportunidades nunca tiveram business case financeiro — qualquer decisão de priorização sobre elas hoje seria baseada só em nota de ranking, não em viabilidade | Alta se alguém tentar decidir sobre elas sem dado adicional | Médio | Não priorizar nenhuma das 7 sem aprofundamento financeiro equivalente ao dos 3 finalistas | game-growth |
| R-14 | C02 e parte de C04 excedem a meta de MVP de 4–8 semanas do estúgio (MVP "G") | Certa (já documentado) | Baixo-Médio (só relevante se priorizados) | Cortar escopo adicional antes de qualquer MVP, se escolhidos | game-design |

## 4. Legenda de responsabilidade

"Dono" = agente ou o fundador responsável por **monitorar e agir** sobre o risco, não necessariamente por decidir investimento — decisões de investimento continuam do fundador (`capital-allocation/CAPITAL_ALLOCATION.md` §3).
