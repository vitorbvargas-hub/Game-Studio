# Standards do Game Studio — Índice

Padrões transversais, aplicáveis a todo projeto `GS-NNN`, independente da fase. Complementam (não substituem) `GOVERNANCE.md`, `ARCHITECTURE.md` e `STRATEGY.md` na raiz do estúdio.

## Disponíveis

- [`PHASE_GATES.md`](./PHASE_GATES.md) — estágios oficiais do portfólio (DISCOVERY → ... → MAINTENANCE/HOLD/KILLED), critérios de entrada/saída, quem aprova cada transição, limites de portfólio (até 2 em desenvolvimento ativo, até 3 em validação). *(game-qa)*
- [`DEFINITION_OF_DONE.md`](./DEFINITION_OF_DONE.md) — o que "feito" significa por tipo de entrega: documento de pesquisa, PRD/GDD, protótipo, feature, build MVP, release beta, lançamento. *(game-qa)*
- [`CODE_AND_TEST_STANDARD.md`](./CODE_AND_TEST_STANDARD.md) — padrão de código, testes (unit/e2e), revisão, segredos/dependências/licenças, git/worktrees, acessibilidade e responsividade. *(game-qa)*
- [`QA_CHECKLIST.md`](./QA_CHECKLIST.md) — checklist reutilizável de QA por release: funcional, regressão, erros, performance, segurança, privacidade/LGPD, conformidade de loja, acessibilidade. *(game-qa)*

## Pendentes (outros agentes)

- `BRAND_GUIDE.md` — identidade visual, tom de voz, uso de marca. *(game-art)*
- `ASSET_SOURCING.md` — origem e licenciamento de assets visuais/áudio. *(game-art)*
- `INFRASTRUCTURE.md` — padrões de infraestrutura, provedores aprovados, ambientes. *(game-dev)*

## Como usar

1. Ao abrir ou avançar um projeto, consulte `PHASE_GATES.md` para saber o que é exigido no estágio atual e quem aprova a transição seguinte.
2. Ao entregar qualquer artefato, confira o item correspondente em `DEFINITION_OF_DONE.md` antes de marcar como concluído.
3. Todo código de produto segue `CODE_AND_TEST_STANDARD.md`.
4. Toda release (mesmo beta fechado) é avaliada com `QA_CHECKLIST.md`, registrada em `QA_REPORT.md` (template em `shared/templates/`).
