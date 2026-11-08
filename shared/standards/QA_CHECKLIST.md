# QA Checklist — reutilizável por release

> Preencher no `QA_REPORT.md` do projeto (template em `shared/templates/QA_REPORT.md`), citando esta checklist. Marcar cada item [E] (verificado, com evidência) ou [H] (não verificado/hipótese) — nenhum item fica em branco. Itens "obrigatório" bloqueiam a transição de estágio (ver `PHASE_GATES.md`) se marcados [H] ou reprovados.

## Funcional

- [ ] (obrigatório) Fluxo principal (core loop/happy path) funciona de ponta a ponta.
- [ ] (obrigatório) Critérios de aceitação do `PRD.md`/`BACKLOG.md` atendidos um a um (listar quais sim/não).
- [ ] Fluxos secundários (edge cases conhecidos) testados.
- [ ] Estados vazios/erro têm feedback claro ao usuário (nunca tela branca ou travamento silencioso).

## Regressão

- [ ] (obrigatório antes de BETA/LAUNCHED) Suíte de testes automatizados executada e passando.
- [ ] Bugs corrigidos em ciclos anteriores reverificados (não voltaram).
- [ ] Nenhuma feature anterior quebrou com a mudança atual.

## Erros

- [ ] Erros de rede/API externa tratados sem crash.
- [ ] Mensagens de erro não expõem detalhes internos sensíveis (stack trace, chave, URL interna).
- [ ] Log de erro suficiente para diagnóstico, sem dado sensível de usuário.

## Performance

- [ ] Meta de performance do projeto (definida em `TECHNICAL_SPEC.md`, ex. TTI, FPS, latência p95) medida e comparada à meta.
- [ ] Sem degradação perceptível em uso prolongado (ex. sessão de 1h, memory leak).
- [ ] Testado em dispositivo/condição de entrada realista (não só máquina de desenvolvimento).

## Segurança

- [ ] (obrigatório) Nenhum segredo/chave exposto no cliente, repositório ou log.
- [ ] (obrigatório) Validação de entrada em toda superfície que aceita dado externo (formulário, URL, upload, webhook).
- [ ] Riscos específicos do domínio verificados quando aplicáveis: SSRF (validação de URL/IP antes de qualquer fetch), injeção (SQL/HTML/prompt), CSRF/XSS, autenticação/autorização, isolamento multi-tenant.
- [ ] Dependências sem vulnerabilidade conhecida crítica não corrigida (checar advisory do ecossistema usado).

## Privacidade / LGPD

- [ ] (obrigatório se há dado pessoal) Base legal e consentimento claros para qualquer coleta de dado pessoal.
- [ ] Dado pessoal não persiste além do necessário; política de retenção declarada é verificável (não só prometida).
- [ ] Dado de terceiro (ex. conteúdo de e-mail, mensagens) tratado como sensível por padrão, nunca logado integralmente sem necessidade.
- [ ] Consentimento específico para menores (COPPA) quando o público pode incluir menores.

## Conformidade de loja / plataforma

- [ ] (obrigatório antes de submissão) Política de dados/permissões da plataforma de destino (App Store, Play Store, Chrome Web Store, itch.io, portal de jogos) lida e confirmada — nunca deixar como [H] no momento da submissão.
- [ ] Termos de uso/anúncios/monetização da plataforma de distribuição respeitados (ex.: regras de rewarded ads, revenue share).
- [ ] Canal de distribuição alternativo identificado caso a submissão principal seja rejeitada ou removida.

## Acessibilidade

- [ ] Contraste e legibilidade de texto adequados.
- [ ] Navegação por teclado (quando a plataforma permite) funciona nos fluxos principais.
- [ ] Textos alternativos em elementos visuais com significado.

## Veredito final

- [ ] Preencher em `QA_REPORT.md`: **aprovado** / **reprovado** / **aprovado com ressalvas**, baseado em evidência executada nesta checklist — nunca em declaração do autor da feature/build.
- [ ] Toda ressalva listada tem responsável e prazo/estágio em que será resolvida antes do próximo gate.
