# Phase Gates — Estágios do Portfólio

> Padrão do estúdio. Aplica-se a todo projeto `GS-NNN`. Base: `STRATEGY.md` (metodologia 1–11), `GOVERNANCE.md` (autoridade de decisão), `ROADMAP.md` (estado atual dos ciclos).

## Estágios oficiais

`DISCOVERY` → `VALIDATION` → `PROTOTYPE` → `MVP` → `BETA` → `LAUNCHED` → `GROWTH` → `CASH GENERATION` → `MAINTENANCE` — com saídas paralelas para `HOLD` (qualquer estágio) e `KILLED` (qualquer estágio).

Mapa para a metodologia de `STRATEGY.md`:
- DISCOVERY = passos 1–3 (Discovery, Market Research, Business Validation inicial)
- VALIDATION = passo 3 avançado + validação de demanda/preço antes de construir
- PROTOTYPE = passos 4–5 (Product Design, Technical Design) + protótipo local
- MVP = passo 6 (MVP Development)
- BETA = passos 7–8 (QA, Beta)
- LAUNCHED = passo 9 (Launch Approval do fundador) já executado + publicação feita
- GROWTH = passo 10 (Growth)
- CASH GENERATION = projeto já gera receita líquida positiva de forma estável
- MAINTENANCE = passo 11 (Iteration) em ritmo baixo, sem investimento ativo de crescimento
- HOLD = pausado por decisão do fundador ou do coordenador (pode voltar ao estágio em que estava)
- KILLED = descontinuado definitivamente

## Limites de portfólio (sempre vigentes)

- [ ] No máximo **2 projetos** em `PROTOTYPE`, `MVP` ou `BETA` simultaneamente ("desenvolvimento ativo").
- [ ] No máximo **3 projetos** em `VALIDATION` simultaneamente.
- [ ] Antes de mover qualquer projeto para `PROTOTYPE`/`MVP`, o coordenador confirma que os limites acima não serão violados; se violarem, algo sai do estágio atual antes de algo entrar (HOLD, KILL ou avanço).

## Regras gerais (todas as transições)

- [ ] **Silêncio nunca é aprovação.** Ausência de resposta do fundador mantém o projeto no estágio atual; o coordenador não assume aprovação implícita.
- [ ] Toda mudança de estágio é registrada em `shared/decisions/ADR-NNN-<slug>.md` com: data, estágio origem → destino, justificativa, evidências citadas, quem aprovou.
- [ ] Toda evidência usada para justificar a transição é marcada **[E]** (com fonte e data) ou **[H]** (hipótese); hipótese isolada não sustenta avanço de estágio sem plano de verificação.
- [ ] Artefatos obrigatórios do estágio (ver tabela) devem existir no diretório do projeto **antes** de solicitar a transição, usando os templates de `shared/templates/`.

## Quem aprova cada transição

| Transição | Aprova | Observação |
|---|---|---|
| DISCOVERY → VALIDATION | Coordenador (game-studio) | Decisão reversível; registrar ADR |
| VALIDATION → PROTOTYPE | Coordenador | Reversível; sem gasto nem comunicação externa nova |
| PROTOTYPE → MVP | **Fundador** | "Iniciar produção completa" exige aprovação explícita (GOVERNANCE.md) |
| MVP → BETA | Coordenador | Reversível; beta é fechado, sem publicação pública |
| BETA → LAUNCHED | **Fundador** | Publicação em produção/loja/plataforma pública exige aprovação explícita |
| LAUNCHED → GROWTH | Coordenador | Reversível; pode envolver gasto com aquisição → nesse caso ver linha de gasto abaixo |
| GROWTH → CASH GENERATION | Coordenador | Reversível; registrar métricas que sustentam a classificação |
| GROWTH/CASH GENERATION → MAINTENANCE | Coordenador | Reversível |
| Qualquer estágio → HOLD | Coordenador ou fundador | Reversível; registrar motivo e condição de retomada |
| Qualquer estágio → KILLED (interno, sem projeto público) | Coordenador | Reversível em teoria, mas registrar justificativa completa |
| Qualquer estágio → KILLED **quando há exposição pública** (produto publicado, usuários reais, comunicação externa já feita) | **Fundador** | Kill público é irreversível em efeito reputacional/de usuário — exige aprovação explícita |
| Qualquer gasto (serviço pago, API, domínio, publicidade) em qualquer transição | **Fundador** | Independente do estágio (GOVERNANCE.md) |
| Qualquer comunicação externa nova (e-mail, post, mensagem a usuário real) | **Fundador** | Independente do estágio (GOVERNANCE.md) |

## Artefatos obrigatórios por estágio

| Estágio | Artefatos mínimos (template) |
|---|---|
| DISCOVERY | `OPPORTUNITY_REPORT.md`, `PROJECT_BRIEF.md` (rascunho) |
| VALIDATION | `PROJECT_BRIEF.md` (completo), `BUSINESS_CASE.md`, `FINANCIAL_MODEL.md` |
| PROTOTYPE | `GDD.md` e/ou `PRD.md`, `TECHNICAL_SPEC.md`, `ARCHITECTURE.md` |
| MVP | `BACKLOG.md` atualizado, `QA_REPORT.md` (pré-release), `CODE_AND_TEST_STANDARD.md` aplicado (ver DEFINITION_OF_DONE.md) |
| BETA | `QA_REPORT.md` (beta), métricas de D1/D7/retenção coletadas |
| LAUNCHED | `LAUNCH_PLAN.md` com aprovação do fundador assinada, `QA_CHECKLIST.md` executado |
| GROWTH / CASH GENERATION | Atualização em `portfolio/performance/` (métricas e custos) |
| MAINTENANCE | `POSTMORTEM.md` ou nota de encerramento de ciclo de crescimento |
| HOLD / KILLED | `POSTMORTEM.md` com causas raiz e aprendizados |

## Critérios de entrada/saída mínimos por transição

- **DISCOVERY → VALIDATION:** Opportunity Score calculado com justificativa [E]/[H] por critério (`STRATEGY.md`); pelo menos 1 fonte de demanda observável [E].
- **VALIDATION → PROTOTYPE:** Viabilidade financeira com 3 cenários (`BUSINESS_CASE.md`/`FINANCIAL_MODEL.md`); nenhum critério de abandono já disparado.
- **PROTOTYPE → MVP:** Spec técnica revisada por game-qa (riscos de qualidade listados); aprovação explícita do fundador registrada em ADR.
- **MVP → BETA:** `QA_REPORT.md` com veredito "aprovado" ou "aprovado com ressalvas" (ressalvas endereçadas ou aceitas explicitamente pelo coordenador); sem bugs críticos abertos.
- **BETA → LAUNCHED:** `QA_CHECKLIST.md` 100% nos itens obrigatórios; `LAUNCH_PLAN.md` com checklist legal e técnico completos; aprovação explícita do fundador registrada em ADR.
- **LAUNCHED → GROWTH:** pelo menos 1 ciclo de métricas pós-lançamento coletado (não suposição).
- **→ HOLD / → KILLED:** `POSTMORTEM.md` com causas raiz, mesmo quando o motivo é externo (ex.: pausa do fundador).
