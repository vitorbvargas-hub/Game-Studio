# Code & Test Standard

> Padrão do estúdio para todo código de produto (`projects/<fase>/GS-NNN/`). Objetivo: qualidade suficiente para decisão real, sem burocracia desnecessária em fases de protótipo.

## Código

- [ ] Nomes de variáveis/funções descrevem o que fazem; sem abreviação obscura.
- [ ] Sem código morto, comentado ou "TODO" sem contexto deixado no repositório final de um estágio.
- [ ] Sem abstração para um caso hipotético futuro — resolver o problema real primeiro (ver `AGENTS.md` do estúdio).
- [ ] Erros tratados apenas onde podem realmente ocorrer (entrada do usuário, API externa); não envolver código interno confiável em try/catch genérico.
- [ ] Dependências novas justificadas (licença compatível, mantida ativamente, sem alternativa nativa simples) antes de entrar no projeto.

## Segredos e dados sensíveis

- [ ] Nenhum segredo, chave de API, token ou credencial no código, em commit, ou em log.
- [ ] Variáveis sensíveis via `.env` (nunca commitado) ou secret manager do provedor; `.env.example` sem valores reais no repositório.
- [ ] Antes de `git add`, revisar o que está sendo staged (`git status` / `git diff --cached`) quando houver qualquer arquivo de configuração envolvido.
- [ ] Dados de usuário real (quando houver, em beta/produção) nunca aparecem em log de debug, print ou issue pública.

## Licenças

- [ ] Toda dependência (lib, asset, fonte, ícone) tem licença compatível com uso comercial verificada antes de usar — registrar em `ASSET_SOURCING.md` (assets) ou no `TECHNICAL_SPEC.md` (libs).
- [ ] Nenhum código, arte, nome ou marca de terceiros copiado (GOVERNANCE.md — proibido).

## Testes

- [ ] **Unit:** lógica de negócio/cálculo/regras puras tem teste unitário. Cobertura razoável = a lógica crítica do core loop/fluxo principal testada, não um número de cobertura perseguido por si só.
- [ ] **E2E:** pelo menos o fluxo principal (happy path) do produto tem um teste de ponta a ponta antes de BETA.
- [ ] Testes de regressão adicionados para todo bug corrigido que não tinha teste cobrindo o caso.
- [ ] Casos difíceis de automatizar (ex. "diversão"/balanceamento, qualidade subjetiva de output de IA, comportamento de DOM de terceiro) são explicitamente marcados como "requer verificação manual/periódica" em vez de ficarem sem menção nenhuma.
- [ ] Testes de segurança específicos do domínio quando aplicável (ex.: validação de SSRF, suíte de prompt injection, sanitização de HTML) fazem parte da suíte, não apenas do design.

## Revisão de código

- [ ] Toda mudança não trivial revisada por outro agente antes de ir para o estágio seguinte; se não houver revisor disponível, autorrevisão em segunda passada documentada no `QA_REPORT.md`/`BACKLOG.md`.
- [ ] Revisão cobre: correção, segurança (segredos, injeção, validação de entrada), simplicidade (sem abstração desnecessária).

## Git e versionamento

- [ ] Commits locais, mensagens descritivas (o que mudou e por quê, não "fix").
- [ ] Branches ou `git worktree` para trabalho paralelo em `projects/<fase>/GS-NNN/` (ver `ARCHITECTURE.md` do estúdio).
- [ ] Nenhum push/publicação para remoto público sem aprovação explícita do fundador (GOVERNANCE.md).
- [ ] Nenhuma operação destrutiva (`reset --hard`, `force push`, exclusão de branch com trabalho não mesclado) sem antes verificar `git status` e preservar o que não está salvo em outro lugar.

## Acessibilidade e responsividade (quando há UI)

- [ ] Contraste de texto legível (não depender só de cor para transmitir estado/erro).
- [ ] Elementos interativos navegáveis por teclado quando a plataforma permitir.
- [ ] Textos alternativos em imagens/ícones que carregam significado.
- [ ] Layout funciona em pelo menos: tela mobile pequena, tablet, desktop — sem elemento cortado ou sobreposto.
- [ ] Testado em pelo menos um dispositivo/emulação de entrada (ex. Android de entrada para jogos web, conforme `QA_REPORT.md` de GS-001).
