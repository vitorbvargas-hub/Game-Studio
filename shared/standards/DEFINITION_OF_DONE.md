# Definition of Done — por tipo de entrega

> Padrão do estúdio. Marque afirmações como **[E]** evidência (com fonte/data) ou **[H]** hipótese. Uma entrega sem os itens abaixo não está "feita" — ela está "em progresso".

## Documento de pesquisa (ex. `OPPORTUNITY_REPORT.md`, `MARKET_RESEARCH.md`)

- [ ] Toda afirmação de mercado/demanda marcada [E] (com fonte e data) ou [H] explicitamente.
- [ ] Pelo menos 1 fonte primária ou dado observável para cada claim [E] central (não só agregadores sem link).
- [ ] Concorrentes diretos listados com link, modelo de receita e preço, quando disponíveis.
- [ ] Opportunity Score preenchido com justificativa por critério (`STRATEGY.md`).
- [ ] Seção "Fontes consultadas" preenchida.
- [ ] Revisado por outro agente (ou pelo próprio autor em segunda passada, se não houver revisor disponível) antes de ser citado em decisão de estágio.

## PRD / GDD

- [ ] Problema e persona descritos sem jargão; qualquer pessoa do estúdio entende em 1 leitura.
- [ ] Critérios de aceitação mensuráveis (não "funciona bem", e sim um número/condição testável).
- [ ] Escopo "fora do MVP" explicitado (o que não será feito agora).
- [ ] Riscos de design/produto listados com severidade e mitigação proposta.
- [ ] Revisado por game-qa antes de virar input para `TECHNICAL_SPEC.md`.

## Protótipo (local, não publicado)

- [ ] Roda localmente a partir de instruções simples (1 comando ou README curto).
- [ ] Cobre o core loop/fluxo principal de ponta a ponta, mesmo com UI mínima.
- [ ] Nenhuma credencial real ou dado de produção embutido no código.
- [ ] Riscos técnicos do `TECHNICAL_SPEC.md` validados ou refutados pelo spike, com resultado registrado.

## Feature (dentro de MVP/Beta/pós-lançamento)

- [ ] Critério de aceitação do `PRD.md`/`BACKLOG.md` atendido e verificável por teste (manual ou automatizado).
- [ ] Testes unitários para lógica não-trivial (ver `CODE_AND_TEST_STANDARD.md`).
- [ ] Sem segredo, chave de API ou token no código ou no histórico de commits.
- [ ] Revisão de código feita (por outro agente, ou autorrevisão documentada se não houver revisor).
- [ ] Erros tratados sem quebrar a aplicação (sem tela branca, sem crash silencioso).
- [ ] Responsivo/acessível conforme `CODE_AND_TEST_STANDARD.md` quando a feature tem UI.

## Build MVP (pronto para QA formal)

- [ ] Todas as features do escopo do MVP (`PRD.md`) implementadas e com DoD de "Feature" cumprido.
- [ ] Suíte de testes automatizados passando (unit + e2e dos fluxos críticos).
- [ ] `QA_REPORT.md` preenchido por game-qa com veredito.
- [ ] Nenhum bug crítico (que impede o uso do core loop) aberto.
- [ ] Dependências externas e custos reais documentados em `TECHNICAL_SPEC.md`/`BUSINESS_CASE.md` (nada de estimativa não verificada rodando em produção).

## Release Beta (fechado, sem publicação pública)

- [ ] Ambiente de staging/beta isolado de qualquer ambiente de produção pública.
- [ ] Grupo de testadores definido e avisado por canal já autorizado (sem comunicação externa nova não aprovada).
- [ ] Telemetria mínima funcionando para medir os critérios de aceite do estágio (D1/D7, taxa de erro, etc.).
- [ ] `QA_CHECKLIST.md` executado e resultado registrado.
- [ ] Plano de rollback descrito, mesmo em beta fechado.

## Lançamento (publicação pública)

- [ ] **Aprovação explícita do fundador registrada em ADR** (GOVERNANCE.md — nenhum lançamento sem isso).
- [ ] `LAUNCH_PLAN.md` completo: checklist técnico, checklist legal (termos, privacidade, licenças de assets), materiais de divulgação.
- [ ] `QA_CHECKLIST.md` 100% nos itens obrigatórios (ver `QA_CHECKLIST.md`).
- [ ] Monitoramento pós-lançamento definido (quem olha o quê e quando).
- [ ] Plano de rollback testado ou pelo menos descrito com passos executáveis.
