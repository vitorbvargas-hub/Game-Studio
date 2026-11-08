# Product Scorecard — Game Studio

> **Autor (agente):** game-growth · **Data:** 2026-11-08.
> Pesos (Script 06): Demanda 15 · Receita 20 · Margem 15 · Retenção 15 · Diferenciação 10 · Aquisição 10 · Execução técnica 5 · Eficiência de capital 10. Total 100.
> Nota só é atribuída onde há evidência mínima — caso contrário, **NÃO VALIDADO**. Nível de evidência por estágio é explícito em cada linha, pois nenhum produto do portfólio tem dado real de usuário.

## Nível de evidência disponível por estágio (contexto antes das notas)

| Estágio | O que existe | O que falta |
|---|---|---|
| Oportunidade catalogada (9 conceitos não aprofundados) | Catálogo de conceito + nota de ranking (GS-001) | Business case financeiro, qualquer validação |
| Discovery/Business case (C01, C06, C07) | Simulações financeiras **[H]**, nota de ranking 0–100 | Qualquer dado real de mercado/usuário — busca web indisponível no discovery |
| GS-002 HOLD (ReplyDraft) | PRD, backlog, protótipo local parcial (sem LLM/billing real) | Qualquer uso real, qualquer feedback de usuário real |

Dado isso, **nenhuma linha abaixo pode ter nota 0–100 em todos os 8 critérios com evidência real** — a maioria é nota de ranking do GS-001 (que já é majoritariamente **[H]**) reaproveitada e marcada como tal, não uma reavaliação independente desta seção.

## Scorecard

| Produto | Demanda /15 | Receita /20 | Margem /15 | Retenção /15 | Diferenciação /10 | Aquisição /10 | Execução técnica /5 | Eficiência de capital /10 | **Total /100** | Evidência |
|---|---|---|---|---|---|---|---|---|---|---|
| **GS-002 ReplyDraft (HOLD)** | 10,5 [H, reescala de FINAL_RANKING Dem 14/20] | 15 [H, reescala de Mon 15/20] | NÃO VALIDADO — margem projetada existe (`capital-allocation`), mas sem custo real medido | NÃO VALIDADO — produto nunca teve usuário ativo | 5,3 [H, reescala de Dif 8/15 — "risco grande" citado no próprio ranking] | NÃO VALIDADO — nenhum canal de aquisição testado | 3,5 [E-TF, reescala de Téc 7/10, QA risco 4/5] | NÃO VALIDADO — eficiência de capital exige receita real para calcular | **Parcial — 4 de 8 critérios com nota, nenhum com evidência real de mercado** | Todas as notas são reescala de `FINAL_RANKING.md`, nenhuma reavaliação própria |
| C01 Loopwright (em espera) | 11,3 [H, reescala Dem 15/20] | 6 [H, reescala Mon 9/20 — revisado p/ 6 na v2 do ranking] | NÃO VALIDADO | NÃO VALIDADO | 5,3 [H, reescala Dif 8/15] | NÃO VALIDADO | 4,5 [E-TF, reescala Téc 9/10] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C06 StatusPing (plano B) | 9,8 [H, reescala Dem 13/20] | 14 [E-categoria MON, reescala Mon 14/20] | NÃO VALIDADO | NÃO VALIDADO | 3,3 [H, reescala Dif 5/15 — ponto mais fraco do conceito] | NÃO VALIDADO | 4 [E-TF, reescala Téc 8/10] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C05 InvoiceLoop | 9,8 [H] | 16 [E-categoria MON] | NÃO VALIDADO | NÃO VALIDADO | 4 [H] | NÃO VALIDADO | 3,5 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | Sem business case financeiro próprio, só catálogo + ranking |
| C03 Scrapline | 9 [H] | 8 [H] | NÃO VALIDADO | NÃO VALIDADO | 7,3 [H] | NÃO VALIDADO | 3 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C10 Notebrief | 9,8 [H] | 13 [H] | NÃO VALIDADO | NÃO VALIDADO | 4,7 [H] | NÃO VALIDADO | 4 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C04 Pocket Orchard | 9,8 [H] | 12 [H] | NÃO VALIDADO | NÃO VALIDADO | 6 [H] | NÃO VALIDADO | 3 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C08 FocusRail | 9 [H] | 10 [H] | NÃO VALIDADO | NÃO VALIDADO | 2,7 [H] | NÃO VALIDADO | 4 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C02 Fathom Freight | 7,5 [H] | 9 [H] | NÃO VALIDADO | NÃO VALIDADO | 6 [H] | NÃO VALIDADO | 2 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |
| C09 Receipt Clear | 8,3 [H] | 9 [H] | NÃO VALIDADO | NÃO VALIDADO | 4 [H] | NÃO VALIDADO | 3 [E-TF] | NÃO VALIDADO | **Parcial — 4 de 8** | idem |

## Notas metodológicas

1. **Reescala, não reavaliação:** as colunas Demanda/Receita/Diferenciação/Execução técnica são uma conversão proporcional das notas 0–20/0–15/0–10 do `FINAL_RANKING.md` (rubrica do `STRATEGY.md`) para os pesos do Script 06 — não é uma nova análise independente. Os critérios não têm correspondência 1:1 perfeita (ex.: "Facilidade técnica" do ranking ≠ "Execução técnica" do Script 06 exatamente), então tratar como aproximação **[H]**.
2. **Margem, Retenção, Aquisição, Eficiência de capital** não têm nenhuma fonte no GS-001 por produto específico (o ranking não os mede separadamente) e exigem dado real de operação que não existe — **NÃO VALIDADO** em toda a tabela, sem exceção.
3. **Nenhum total /100 é calculável de forma honesta** com metade dos critérios ausentes — por isso a coluna "Total" reporta "quantos critérios têm nota", não uma soma, para não sugerir precisão que não existe.
4. Antes de usar este scorecard para decidir investimento, seria necessário pelo menos: dado real de conversão/ARPU de um piloto, custo de operação medido, e taxa de retenção observada — nenhum existe hoje em nenhum produto do portfólio.
