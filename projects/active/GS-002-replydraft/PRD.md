# PRD — GS-002 ReplyDraft

> Template Game Studio. Datas em ISO. Afirmações marcadas **[E]** (evidência, com fonte) ou **[H]** (hipótese).

- **Projeto:** GS-002
- **Autor (agente):** game-design
- **Data:** 2026-11-08
- **Status:** **PRÉ-APROVAÇÃO** — conforme [ADR-002](../../../shared/decisions/ADR-002-gs002-sem-aprovacao.md). Escopo autorizado: documentação + protótipo local (extensão MV3 + proxy com LLM mock + fixture que simula o Gmail). Proibido sem aprovação explícita do fundador: LLM real, billing real, Chrome Web Store, usuários reais, publicação, qualquer conta/serviço pago.
- **Fontes:** `GS-001/PROTOTYPES.md` (§2, C07), `GS-001/OPPORTUNITY_CATALOG.md` (C07), `GS-001/BUSINESS_CASE.md` (§2, C07), `GS-001/QA_REPORT.md` (C07), `GS-001/TECHNICAL_FEASIBILITY.md` (C07), `GS-001/EXECUTIVE_SUMMARY.md`.

## Problema

**[E]** Donos de e-commerce pequeno e freelancers de atendimento gastam tempo relevante escrevendo respostas repetitivas de e-mail no Gmail, sem orçamento para helpdesk com IA enterprise (`OPPORTUNITY_CATALOG.md` C07). **[H]** A dor é recorrente (semanal) — ainda não confirmada por entrevista real; é a hipótese central que a Fase 0 (itens 4–5, pendentes de aprovação) deveria testar antes do MVP completo (`EXECUTIVE_SUMMARY.md`).

**[H]** Risco central do produto, identificado no próprio ranking de oportunidades: o Gmail já oferece rascunhos nativos com Gemini ("Help me write"), o que pode tornar a dor já resolvida de graça para parte do público — nota de diferenciação (Dif) do C07 é 8/15, descrita como "risco grande" (`FINAL_RANKING.md`, citado em `QA_REPORT.md` linha 192). Essa afirmação específica sobre o Gmail/Gemini nunca foi verificada com fonte ao vivo em nenhum documento de GS-001 — permanece **[H]** e deve ser verificada na Fase 0 item 1, não presumida como fato ao entrar em implementação completa.

## Personas

1. **Dona de e-commerce pequeno (Ana, hipotética)** — responde 20–50 e-mails/semana sobre pedidos, prazos e reclamações. Sem equipe de suporte dedicada. Quer manter um tom de marca consistente sem reescrever do zero toda vez. **[H]**
2. **Freelancer de atendimento (Marcos, hipotético)** — atende múltiplos clientes com tons distintos por contexto (orçamento vs. reclamação). Sensível a custo (plano de entrada barato). **[H]**
3. **Pequena equipe de suporte sem orçamento para Zendesk+IA enterprise** — usa Gmail/G Suite legado, não necessariamente tem acesso ao Gemini do Workspace. **[H — "não ter Gemini no plano" não foi verificado por busca ao vivo**, `PROTOTYPES.md` linha 301`]**.

## Proposta de valor e diferencial vs. Gmail/Gemini nativo

Rascunhos de resposta gerados por IA dentro do Gmail, a partir do histórico da thread e de um **tom de voz configurável a partir de exemplos reais do próprio usuário**, editáveis em 1 clique antes de enviar, sem trocar de aba e sem conceder escopos sensíveis da API do Gmail (`OPPORTUNITY_CATALOG.md`, `PROTOTYPES.md` §2.1).

Diferencial declarado frente ao Gemini nativo do Gmail (`PROTOTYPES.md` §2.9 — todas as afirmações a seguir são **[H]**, não verificadas por busca ao vivo nesta sessão):

1. **Tom persistente por exemplos reais, não inferido por sessão.** O usuário cola 2–3 respostas que já escreveu; o tom fica salvo e é reaplicado em toda geração futura, sem precisar reconfigurar a cada uso — diferente do slider formal/casual do Gemini, ajustado por sessão.
2. **Múltiplos tons por contexto de e-mail.** Biblioteca de tons (ex.: "reclamação" vs. "orçamento") selecionável, não um tom único por conta — conceito de produto que o Gemini nativo não expõe.
3. **Funciona independente do plano do Google.** Útil para quem tem Gmail pessoal ou G Suite legado sem o recurso de IA incluso no plano **[H — não verificado]**.
4. **Produto focado, não recurso genérico dentro de um produto de e-mail geral** — prioriza detalhes como histórico de rascunhos aprovados e cota visível pensada para controle de custo de pequeno negócio.

**Aviso ao fundador:** este diferencial é a maior incerteza de todo o produto. Antes de qualquer investimento acima do MVP local, validar com busca ao vivo se o Gemini do Gmail já cobre esse caso de uso nos planos gratuitos (Fase 0, item 1).

## Escopo do MVP

### Dentro do escopo (in)

- Extensão Chrome MV3: content script que lê a thread de e-mail aberta no Gmail web e insere o rascunho na caixa de composição nativa, **como texto puro** (nunca HTML, para evitar XSS) (`TECHNICAL_FEASIBILITY.md` §C07).
- Botão flutuante "✦ Gerar rascunho" próximo ao botão "Responder" nativo.
- 1 perfil de tom de voz configurável a partir de exemplo colado pelo usuário (2–3 frases) ou de um dos 3 exemplos pré-prontos (formal, casual, direto).
- Geração via proxy (Worker) + LLM — **no protótipo local, LLM mock** (resposta determinística/simulada); LLM real (Anthropic API) é item de implementação completa, não autorizado agora.
- Edição manual obrigatória antes de enviar — **a extensão nunca envia e-mail** por conta própria.
- Autenticação e cota de uso por usuário — **no protótipo local, simuladas** (sem Supabase real); Supabase real é item de implementação completa.
- Indicador visual de cota restante no popup da extensão (ex.: "14/20").
- Paywall contextual ao esgotar a cota: o botão continua visível, mas ao tocar abre modal de upgrade em vez do rascunho (`PROTOTYPES.md` §2.8) — **no protótipo local, a tela de upgrade é estática/mock, sem billing real**.
- Fixture HTML que simula o DOM do Gmail, usada nos testes automatizados (Playwright), conforme ADR-002.

### Fora do escopo (out)

- Gmail API oficial (exige escopos restritos + avaliação CASA anual — decisão de arquitetura deliberada, `TECHNICAL_FEASIBILITY.md`).
- Multicanal (chat, reviews) — só Gmail web no MVP.
- Multilíngue automático.
- Times/múltiplos usuários por conta.
- Biblioteca com múltiplos tons simultâneos (fica como **Should**, não **Must**, do MVP — ver BACKLOG.md).
- "Modo qualidade" (Sonnet 5) — fica como **Could**.
- Histórico de rascunhos aprovados para refinar prompt — fica como **Could**.
- LLM real, billing real (Stripe), conta Supabase real, publicação na Chrome Web Store, usuários reais — bloqueados por ADR-002 até aprovação explícita do fundador.
- Qualquer envio de comunicação externa (entrevistas, landing page) — Fase 0 itens 4–5, pendentes de aprovação.

## Regras de negócio

1. **Quota free: 20 rascunhos/mês por usuário.** **[H]** — valor ilustrativo usado no protótipo de UX (`PROTOTYPES.md` §2.2, "Semana 1"), não validado com usuários reais. Ao estourar a quota, a próxima tentativa de gerar rascunho não falha silenciosamente: o botão permanece visível e, ao ser tocado, abre um modal de upgrade — o usuário nunca perde a ação que estava tentando fazer (`PROTOTYPES.md` §2.8).
2. **Plano pago:** assinatura mensal, ARPU hipotético de referência **US$15 (conservador) / US$29 (base) / US$49 (otimista)** por pagante **[H, BUSINESS_CASE.md §2]** — faixa não validada com dados reais; apenas referência de ordem de grandeza para a simulação financeira, não um preço final de produto.
3. **"Modo qualidade" (Sonnet 5) é seleção manual, nunca automática,** mesmo no plano pago — objetivo é controle de custo de IA pelo próprio produto, não surpresa de fatura (`PROTOTYPES.md` §2.8). Cobrado dentro do plano superior, nunca como microtransação por clique isolado.
4. **Privacidade: conteúdo de e-mail não é armazenado no servidor.** O proxy processa a thread e o tom de voz apenas para montar o prompt e chamar o LLM; declarado objetivo de **zero retention** — **[H]**, pois a política de retenção de dados do provedor de LLM não foi verificada formalmente, e não há auditoria de logs do proxy ainda (`QA_REPORT.md`, risco de qualidade #3 do C07). Isso deve ser corrigido para **[E]** antes de qualquer implementação completa com dados reais.
5. **Nenhum envio automático de e-mail.** O rascunho é inserido como texto editável na caixa de composição nativa do Gmail; o envio sempre passa pelo fluxo normal do Gmail, nunca pela extensão — mitigação de risco e requisito de confiança do usuário (`PROTOTYPES.md` §2.1, §2.6).
6. **Saída do LLM é sempre texto puro, nunca HTML**, mesmo que features de formatação rica sejam adicionadas no futuro — mitigação de XSS (`TECHNICAL_FEASIBILITY.md`, `QA_REPORT.md` risco #5).

## Fluxos de usuário

### Instalação → onboarding → 1º perfil de tom → 1º rascunho → upgrade

1. **Instalação:** usuário instala a extensão (Chrome Web Store, fora do escopo autorizado agora — no protótipo local, carregamento manual via `chrome://extensions`). Ícone aparece na barra.
2. **Onboarding (1 tela, dentro do Gmail):** popup de boas-vindas pede para "Escolher seu tom de voz" — 3 exemplos pré-prontos (formal, casual, direto) ou colar um exemplo próprio de 2–3 frases.
3. **1º perfil de tom:** usuário salva o tom escolhido/colado. Esse é o tom padrão aplicado a toda geração futura até que ele crie outro.
4. **1º rascunho:** usuário abre um e-mail recebido → botão flutuante "✦ Gerar rascunho" aparece perto de "Responder" → toca → rascunho aparece na caixa de composição em texto puro, com aviso "gerado por IA — revise antes de enviar" → edita e envia pelo Gmail nativo.
5. **Upgrade:** ao atingir 20/20 rascunhos no mês, a próxima tentativa abre um modal de upgrade em vez do rascunho (não um bloqueio silencioso). No protótipo local, a tela de assinatura é estática (sem Stripe real).

### Estados de erro

| Estado | Comportamento esperado |
|---|---|
| Thread não detectada pelo content script (Gmail mudou o DOM) | Botão "✦ Gerar rascunho" não aparece; nenhum erro visível quebra a UI nativa do Gmail (falha silenciosa controlada, não crash). **[H]** mitigação: teste E2E diário contra a fixture, não implementado ainda (`QA_REPORT.md` risco #1). |
| Proxy/LLM indisponível ou timeout | Mensagem de erro clara no lugar do rascunho (“Não foi possível gerar agora, tente novamente”); nunca inserir texto vazio ou parcial na caixa de composição. |
| Cota esgotada | Modal de upgrade, nunca bloqueio sem explicação (regra de negócio #1). |
| E-mail recebido contém tentativa de prompt injection ("ignore instruções anteriores...") | Mitigação: modelo só gera texto, sem ferramentas/ações; saída sempre como texto puro revisável pelo usuário antes de enviar — risco não eliminado, apenas limitado em impacto (`QA_REPORT.md` risco #2). Requisito de teste: fixture deve incluir ao menos 1 e-mail com tentativa de injeção. |
| Tom de voz vazio/não configurado | Fallback para um dos 3 tons pré-prontos (ex.: "direto"), nunca bloquear a geração por falta de configuração. |

## Requisitos não funcionais

- **Latência alvo:** resposta do proxy em até ~3s para o caso comum (Haiku 5.5, prompt ~3.000 tokens de entrada) **[H]** — não medido ainda; é meta de design, a confirmar com o protótipo local (LLM mock deve simular essa latência para testes realistas).
- **Privacidade/LGPD:** conteúdo de e-mail de terceiros (remetentes que não são o usuário) passa pelo proxy — tratar como dado pessoal sob LGPD/GDPR mesmo no protótipo local; **não persistir corpo de e-mail em nenhum log, banco ou arquivo**, inclusive nos testes com a fixture (regra de negócio #4). Nenhum dado real de terceiros deve ser usado — apenas fixtures sintéticas (ADR-002).
- **Acessibilidade:** botão flutuante e modal de upgrade devem ser navegáveis por teclado e ter rótulos ARIA, dado que se inserem na UI de um produto de terceiro (Gmail) sem controle sobre o padrão visual dele.
- **Resiliência a mudança de DOM:** content script deve falhar de forma segura (não aparecer, não quebrar a UI do Gmail) quando os seletores esperados não forem encontrados — não deve lançar erro visível ao usuário nem impedir o uso normal do Gmail (`QA_REPORT.md` risco #1).
- **Segurança de chave:** a chave do provedor de LLM nunca é exposta à extensão — vive apenas no proxy (Worker), mesmo no protótipo local com LLM mock (manter a mesma arquitetura de proxy, só trocando o provider por um mock).

## Métricas de ativação

**[H]** Referência de metas pós-MVP, retiradas de `BUSINESS_CASE.md §2` e `EXECUTIVE_SUMMARY.md` — aplicáveis apenas após implementação completa aprovada, não ao protótipo local:

- **Ativação:** ≥50 instalações ativas em 30 dias.
- **Conversão:** ≥5% dos usuários ativos pagando em 60 dias.
- **Retenção de pagante:** ≥70% no mês 2.
- **Kill criteria:** <20 instalações ativas em 30 dias; ou <2% de conversão em 60 dias; ou custo de LLM por usuário pagante >30% do ARPU.

Para o protótipo local (sem usuários reais), a métrica de "ativação" equivalente é: **todos os fluxos do §Fluxos de usuário passam na suíte Playwright contra a fixture do Gmail**, incluindo os estados de erro listados acima.

## Plano de sprints

Todas as sprints abaixo cobrem **apenas o escopo autorizado por ADR-002** (protótipo local: extensão MV3 + proxy com LLM mock + fixture + testes Playwright). Sprints que dependeriam de LLM real, billing real, Chrome Web Store ou usuários reais estão marcadas como bloqueadas.

### S0 — Ambiente e arquitetura

- **Objetivo:** montar o esqueleto do repositório e validar o spike técnico mais arriscado (content script no Gmail) antes de investir nas demais sprints.
- **Entregáveis:** estrutura do projeto (extensão MV3 + proxy local); fixture HTML inicial simulando uma thread do Gmail; spike "ler thread aberta + inserir texto no compose" rodando contra a fixture (`TECHNICAL_FEASIBILITY.md` §5: 1–2 dias de spike).
- **Responsável (agente):** game-design (coordenação) + implementação técnica (fora do escopo de agentes permanentes deste workspace; delegar a subagente técnico temporário, no máximo 1 nível, conforme AGENTS.md).
- **Critérios de aceite:** spike funciona em conversa, resposta e encaminhamento, inserindo texto puro na fixture; nenhuma dependência externa paga é criada.
- **Dependências:** nenhuma.
- **Estimativa:** P (pequeno).

### S1 — Core na extensão

- **Objetivo:** implementar o fluxo principal de UX dentro da extensão: botão flutuante, popup com cota, tela de configuração de tom de voz.
- **Entregáveis:** botão "✦ Gerar rascunho"; popup com indicador de cota (mock); tela de configuração de tom (3 exemplos pré-prontos + colar exemplo próprio); inserção de rascunho (mock) como texto puro na fixture.
- **Responsável (agente):** game-design (spec/aceite) + implementação técnica delegada.
- **Critérios de aceite:** fluxo "instalação → onboarding → 1º perfil de tom → 1º rascunho" (ver §Fluxos de usuário) passa manualmente contra a fixture.
- **Dependências:** S0.
- **Estimativa:** M (médio).

### S2 — Proxy e regras de negócio

- **Objetivo:** implementar o proxy local com LLM **mock**, cota por usuário (simulada), e as regras de paywall contextual.
- **Entregáveis:** endpoint de proxy que recebe thread + tom e devolve rascunho mock; lógica de cota (20/mês) com decremento e bloqueio por upgrade; modal de upgrade estático (sem Stripe); mitigação básica de prompt injection (saída sempre tratada como texto puro, nunca executada).
- **Responsável (agente):** game-design (spec/aceite) + implementação técnica delegada.
- **Critérios de aceite:** ao atingir a cota, a tentativa seguinte abre o modal de upgrade em vez do rascunho (regra de negócio #1); nenhum dado de e-mail é persistido em log ou banco.
- **Dependências:** S1.
- **Estimativa:** M (médio).

### S3 — Experiência, monetização preparada e analytics

- **Objetivo:** refinar estados de erro, preparar (sem ativar) os pontos de integração de billing/analytics reais, e simular eventos de ativação.
- **Entregáveis:** tratamento de todos os estados de erro da tabela (§Estados de erro); pontos de extensão claramente isolados para onde entrariam Stripe/Supabase reais (sem implementá-los); eventos de analytics mockados para as métricas de ativação do §Métricas de ativação.
- **Responsável (agente):** game-design (spec/aceite) + implementação técnica delegada.
- **Critérios de aceite:** todos os estados de erro da tabela têm comportamento verificável na fixture; nenhuma chamada de rede para serviço pago real existe no código.
- **Dependências:** S2.
- **Estimativa:** M (médio).

### S4 — QA e homologação do protótipo local

- **Objetivo:** suíte de testes Playwright cobrindo os fluxos e estados de erro definidos neste PRD, contra a fixture do Gmail.
- **Entregáveis:** suíte Playwright (fluxo principal, cota esgotada, erro de proxy, DOM não detectado, tentativa de prompt injection); relatório de QA do protótipo local.
- **Responsável (agente):** game-design (coordenação de aceite) + QA técnico delegado.
- **Critérios de aceite:** suíte passa 100% contra a fixture; relatório de QA documenta riscos residuais (ex.: fragilidade real do DOM do Gmail, só testável com Gmail real — fora de escopo agora) e aponta claramente o que fica bloqueado até aprovação (LLM real, billing, Chrome Web Store, usuários reais).
- **Dependências:** S3.
- **Estimativa:** P (pequeno).

**Pós-S4 (bloqueado por ADR-002, não planejado em detalhe aqui):** troca do LLM mock por Anthropic API real; Supabase real; Stripe real; submissão à Chrome Web Store; testes com usuários reais. Depende de aprovação explícita do fundador.
