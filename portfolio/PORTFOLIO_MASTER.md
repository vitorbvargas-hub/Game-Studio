# Portfolio Master — Game Studio

> **Autor (agente):** game-growth · **Data:** 2026-11-08 · **Script de origem:** Script 06 (Gestão de Portfólio) do fundador.
> Marcação: **[E]** evidência (com fonte e data) · **[H]** hipótese não verificada · **NÃO VALIDADO** = dado que ainda não existe/não foi medido.
> Este documento **não inicia projetos, não cria MVP e não autoriza gastos**. É um inventário e painel de decisão para o fundador.

## Como ler esta tabela

- **Estágio:** Oportunidade (catalogada, sem decisão) · Discovery · Fase 0 (validação barata) · MVP/Desenvolvimento · Beta · Lançado · **HOLD** (pausado) · Arquivado/Kill.
- **Owner:** agente responsável pelo acompanhamento, não "dono do produto" (o fundador decide investimento — ver `GOVERNANCE.md`).
- **Orçamento:** gasto aprovado e **gasto real**, não estimativa de custo de build (isso vai em `capital-allocation/`).

## 1. Projetos ativos/em andamento

| ID | Nome | Estágio | Owner | Objetivo | Orçamento aprovado | Orçamento gasto real | Prazo | Dependências | Principais riscos | Critério de sucesso |
|---|---|---|---|---|---|---|---|---|---|---|
| GS-001 | Discovery do estúdio (10 conceitos) | Concluído (2026-11-08) | game-studio (coordenação); game-growth, game-design, game-dev, game-qa, game-art (execução) | Gerar e ranquear oportunidades de 1º produto | R$ 0 (sem gasto aprovado; só tempo de agente) | R$ 0 — custo de agente roda na assinatura Claude do fundador, valor não informado ao estúdio (**PENDENTE**) | Concluído | Nenhuma | Busca web indisponível (HTTP 429) o dia todo → demanda/concorrência majoritariamente **[H]** | Recomendação entregue e ranqueada — **atingido** |
| GS-002 | ReplyDraft (extensão IA p/ Gmail) | **HOLD** (pausado 2026-11-08 pelo fundador para organizar o estúdio — [ADR-004](../shared/decisions/ADR-004-organizacao-estudio.md)) | game-dev (protótipo); game-design (PRD/backlog) | Validar Fase 0 e, se passar os critérios, avançar a MVP completo | R$ 0 aprovado para implementação completa; Fase 0 itens 1–3 autorizados pela governança, itens 4–5 aprovados em [ADR-003](../shared/decisions/ADR-003-aprovacao-fase0-c07.md) mas **não executados** (dependem do fundador indicar canal/hospedagem) | R$ 0 atribuído diretamente a este projeto; tempo de agente custo **PENDENTE** | Sem prazo — em espera até o fundador liberar | GS-001 (origem da recomendação); Fase 0 itens 4–5 (entrevistas, landing page) não executados; decisão do fundador para retomar | Maior risco do produto: Gmail/Gemini nativo pode já cobrir o caso de uso de graça **[H]**, não verificado por busca ao vivo | Fase 0: ≥5/15 entrevistados relatam dor semanal e pagariam ≥US$15/mês — **não medido, HOLD** |

## 2. Oportunidades catalogadas (GS-001 — 10 conceitos, nenhum iniciado)

Nenhum destes tem orçamento, prazo ou owner designado — são candidatos a próximo produto, dependentes de decisão do fundador. Receita é projeção **[H]**, não medição.

| # | Nome | Categoria | Estágio | Score (0–100) [E-RANK] | Receita base projetada @1.000 usuários/mês [H] | MVP estimado | Maior risco [H] |
|---|---|---|---|---|---|---|---|
| C07 | ReplyDraft | Micro-SaaS IA (extensão) | Oportunidade → já avançou para GS-002 (HOLD) | 69 | ~US$1.450 | 2–4 sem. | Gmail/Gemini nativo grátis |
| C01 | Loopwright | Jogo idle + coleção | Oportunidade (em espera, trilha estratégica) | 68 | ~US$32 | 4–7 sem. | Gênero saturado de clones; receita pulverizada |
| C06 | StatusPing | Micro-SaaS monitoramento | Oportunidade (plano B) | 66 | ~US$350 | 2–4 sem. | Diferencial só preço/UX |
| C05 | InvoiceLoop | Micro-SaaS cobrança | Oportunidade (não aprofundada) | 65 | NÃO VALIDADO (não simulado em BUSINESS_CASE) | 2–4 sem. (P) | Categoria lotada; risco regulatório NF-e |
| C03 | Scrapline | Jogo incremental/factory | Oportunidade (não aprofundada) | 63 | NÃO VALIDADO | 4–8 sem. (M) | UX de grid touch não testada |
| C10 | Notebrief | App IA notas de voz | Oportunidade (não aprofundada) | 61 | NÃO VALIDADO | 2–4 sem. (P) | Custo variável alto (transcrição); mercado saturado [H] |
| C04 | Pocket Orchard | Jogo casual coleção+idle | Oportunidade (não aprofundada) | 59 | NÃO VALIDADO | 4–8 sem. (M/G) | Depende de orçamento de arte maior |
| C08 | FocusRail | App produtividade | Oportunidade (não aprofundada) | 56 | NÃO VALIDADO | 2–4 sem. (P) | Categoria extremamente saturada |
| C02 | Fathom Freight | Jogo strategy browser | Oportunidade (não aprofundada) | 55 | NÃO VALIDADO | 8+ sem. (G, excede meta do estúdio) | Alcance orgânico menor; MVP grande |
| C09 | Receipt Clear | App utilitário recibos | Oportunidade (não aprofundada) | 50 | NÃO VALIDADO | 2–4 sem. (P) | Uso sazonal (IR); OCR tecnicamente difícil |

Fonte: `projects/discovery/GS-001/FINAL_RANKING.md`, `OPPORTUNITY_CATALOG.md`, `BUSINESS_CASE.md` (2026-11-08). Apenas C01/C06/C07 tiveram business case financeiro completo (3 finalistas); os outros 7 têm só o catálogo de conceito e nota de ranking.

## 3. Lançados

Nenhum produto lançado. Receita realizada do estúdio = **R$ 0 / US$ 0** em todas as linhas.

## 4. Arquivados / Kill

Nenhum projeto morto ainda. Nenhuma oportunidade foi formalmente descartada — as 7 não aprofundadas estão inativas por falta de priorização, não por kill decision.

## 5. Observações gerais

- **[E]** Nenhuma métrica real de usuário existe em todo o portfólio (0 instalações, 0 usuários, 0 receita).
- **[H]** Todas as projeções de receita citadas aqui vêm de `BUSINESS_CASE.md` (GS-001) e são simulações de ordem de grandeza, não previsões.
- Custo de agentes (Claude subscription do fundador) e custo de Recraft v3 via Sharp IA (créditos de imagem, nível estúdio — Brand Guide, [ADR-004](../shared/decisions/ADR-004-organizacao-estudio.md)) são despesas reais já incorridas, mas **sem valor exato atribuído** — registradas em `portfolio/performance/COSTS.md`. Ver também `STUDIO_CAPACITY.md` e `capital-allocation/CAPITAL_ALLOCATION.md`.

## Índice de documentos do portfólio

Ver `portfolio/README.md`.

## Atualização 2026-11-08: GS-003
| ID | Projeto | Estágio | Owner | Próxima decisão |
|---|---|---|---|---|
| GS-003 | Idle de coleção de monstros original (Linha A estilo Pokémon; Linha B monstros digitais estilo Digimon) | **PROTOTYPE** (2026-11-08, [ADR-006](../shared/decisions/ADR-006-gs003-prototipo-linha-b.md)), começando pela Linha B em pixel art | game-studio; game-design, game-art, game-research, game-dev | Protótipo local da Linha B (`projects/prototypes/GS-003/`) |
