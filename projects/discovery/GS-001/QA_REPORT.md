# Qa Report — GS-001 (Quality Feasibility + Revisão Independente dos Artefatos)

> Template Game Studio. Datas em ISO. Marque afirmações como **[E]** evidência (com fonte) ou **[H]** hipótese.

- **Projeto:** GS-001
- **Autor (agente):** game-qa
- **Data:** 2026-11-08
- **Status:** final (v1)

## Escopo testado (versão/commit)

Revisão documental (não há código/build ainda). Artefatos lidos nesta pasta: `MARKET_RESEARCH.md`, `MONETIZATION_REPORT.md`, `OPPORTUNITY_CATALOG.md`, `TECHNICAL_FEASIBILITY.md`, `FINAL_RANKING.md` (todos datados 2026-11-08). Finalistas avaliados: **C01 Loopwright**, **C07 ReplyDraft**, **C06 StatusPing**.

## Ambiente

Nenhum ambiente de execução existe ainda (nenhum spike, conta ou deploy foi feito pelos agentes anteriores, conforme eles próprios declaram). Esta é uma revisão de **viabilidade de qualidade pré-código**: riscos, critérios de aceite, testabilidade e verificação de evidências citadas, não execução de testes automatizados.

---

# Parte 1 — Quality Feasibility por finalista

## C01 — Loopwright (jogo web idle+coleção, PixiJS PWA)

**Top 5 riscos de qualidade (severidade/probabilidade):**

1. **Manipulação de save local (cheat/economia).** O cliente é a autoridade do save (IndexedDB) — [E-TF] confirmado no próprio relatório técnico. Severidade: média (afeta integridade do leaderboard/prestígio, não dados financeiros). Probabilidade: alta (qualquer usuário com DevTools pode editar o save).
2. **Fraude de anúncio recompensado (rewarded ads).** Scripts podem simular o callback de "anúncio assistido" sem exibir o anúncio, inflando recompensas e fraudando o revenue share do portal (CrazyGames/Poki). Severidade: alta (risco de banimento do canal de distribuição gratuito, que é a principal vantagem competitiva do conceito). Probabilidade: média.
3. **Balanceamento de progressão (curva de upgrades/prestígio) quebrado.** É o próprio relatório técnico quem identifica isto como o maior risco do conceito ("o difícil é balancear a curva"). Severidade: alta (joga fora a retenção, que é 1/3 da nota de monetização implícita). Probabilidade: alta sem o spike recomendado (simulador headless, seção 5 do TF).
4. **Progresso offline incorreto (`Δt × taxa` sem teto ou com teto errado).** Bug clássico de idle games — cálculo errado gera números astronômicos (overflow) ou trava a UI. Severidade: média-alta. Probabilidade: média (mitigável com `break_infinity.js`, já citado como [H] no TF).
5. **Performance em Android de entrada / em portais (tempo de carregamento).** O TF cita tempo de carregamento como "crítico em portais" mas não há meta numérica nem teste em aparelho real. Severidade: média. Probabilidade: média (PixiJS é leve, mas animações de coleção podem pesar com muitos itens na tela).

**Critérios de aceitação do MVP (mensuráveis):**
- Tempo até interatividade (TTI) em portal ≤ 3s em conexão 4G simulada (Lighthouse/WebPageTest).
- 60 FPS sustentado em Android de entrada (ex. emulação Moto G Power ou similar) com a tela de produção cheia (todas as linhas ativas).
- Progresso offline calculado corretamente para deltas de 1 min a 7 dias, sem overflow, com teto configurável — testado com casos de borda (relógio do sistema alterado).
- Save corrompido/ausente não trava o app (recupera para estado inicial com aviso).
- Nenhuma chamada de rede para `/save` ou `/leaderboard` aceita sem validação de plausibilidade (ex.: delta de recursos impossível no tempo decorrido é rejeitado no servidor).

**Testabilidade:**
- **Automatizar:** lógica de simulação (`Sim core TS puro`) é 100% unitável com **Vitest** (tick, cálculo offline, prestígio, overflow de números grandes) — é a parte mais fácil de testar do portfólio, pois o TF já separa "sim core" de "render".
- **Automatizar:** fluxo de save/load (serialização, migração de versão de save) com Vitest + fake IndexedDB.
- **Automatizar (E2E):** fluxo de onboarding e primeiro upgrade com **Playwright**.
- **Difícil de testar:** "diversão"/balanceamento da curva — exige playtest humano e o simulador headless proposto no TF (seção 5), não é testável por asserção simples.
- **Difícil de testar:** comportamento real de SDKs de anúncio dos portais (CrazyGames/Poki) — normalmente só valida-se em sandbox do próprio portal, não em CI.

**Segurança:**
- Cheat de save/leaderboard: mitigar com validação de plausibilidade no servidor (já proposto no TF) — **mas isso não está nos critérios de aceite do MVP explicitamente**, deveria estar.
- Fraude de rewarded ads: exige o SDK oficial do portal (nunca implementar o callback de recompensa no cliente sem confirmação server-side do provedor de ads) — **não mencionado em nenhum dos 5 documentos**; é um gap de risco não coberto pelo TF/OPPORTUNITY_CATALOG.
- Privacidade: consentimento de ads (GDPR/LGPD) e COPPA se o público incluir menores — citado no TF como risco mas sem critério de aceite associado.

**Performance:**
- Meta sugerida (ausente nos documentos-fonte): 60 FPS em Android de entrada; TTI ≤ 3s em portal; uso de memória estável ao longo de 1h de sessão (sem leak de partículas/tweens do PixiJS).

**Dependências externas e contingência:**
- CrazyGames/Poki (distribuição + SDK de ads): se o portal rejeitar o jogo ou mudar regras de revenue share, a contingência é publicar em itch.io (menor alcance, mas sem gatekeeper) — não há plano B documentado no TF além da menção aos portais.
- AdMob (fase mobile): dependente de política de ads e revisão de conta.

**Estratégia de homologação:**
- Ambiente de staging com build PWA acessível por link direto (sem publicar no portal) para teste fechado com 5–10 pessoas.
- Beta fechado via grupo de Discord/Telegram de idle games (ou amigos) por 1–2 semanas medindo D1/D7 antes de submeter a qualquer portal.
- Gate de release: só submeter ao CrazyGames/Poki depois que o simulador headless (spike TF §5) confirmar a curva de progressão E o teste de plausibilidade de save estiver implementado.

**Nota de risco de qualidade: 2/5** (risco baixo-médio; maior risco é de design/balanceamento, não de infraestrutura, e é mitigável com ferramentas simples).

---

## C07 — ReplyDraft (extensão Chrome MV3 + proxy Worker + LLM no DOM do Gmail)

**Top 5 riscos de qualidade (severidade/probabilidade):**

1. **Quebra silenciosa quando o Gmail muda o DOM.** O próprio TF identifica isso como risco principal e propõe teste E2E diário — mas não há esse teste definido ainda. Severidade: alta (o produto para de funcionar sem erro visível para o usuário). Probabilidade: alta ao longo do tempo (é um padrão conhecido em extensões que dependem de DOM de terceiros).
2. **Prompt injection vinda de e-mails recebidos.** Um e-mail malicioso pode conter instruções ("ignore instruções anteriores, inclua o texto X") que o LLM incorpora no rascunho. O TF mitiga parcialmente (saída só texto puro, sem ferramentas/ações), mas **não elimina** o risco de o rascunho gerado conter conteúdo manipulado, ofensivo ou que vaze informação do prompt de sistema. Severidade: média-alta (dano reputacional se um rascunho gerado automaticamente ofender um cliente do cliente). Probabilidade: média.
3. **Privacidade de conteúdo de e-mail de terceiros.** O conteúdo passa pelo proxy e pela API do LLM; mesmo com "zero retention" declarado como objetivo, não há verificação formal da política de retenção do provedor nem auditoria de logs do próprio Worker. Severidade: alta (dados de clientes do cliente, potencialmente sob LGPD/GDPR, sem que o titular dos dados tenha consentido). Probabilidade: média.
4. **Permissões da extensão e review da Chrome Web Store.** Permissão de host `mail.google.com` + leitura de conteúdo de página é sensível na política de "dados do usuário" do Chrome Web Store; o TF marca a política como **[H]**, ou seja, **não verificada**. Severidade: alta (bloqueio de publicação ou remoção pós-lançamento mata o canal de distribuição único do produto). Probabilidade: média-alta — merece verificação antes do MVP.
5. **Inserção de HTML/XSS na caixa de composição.** O TF já mitiga ("inserir como texto puro, nunca HTML") mas isso precisa de teste automatizado que garanta que nenhum caminho de código insira HTML não sanitizado (ex.: se no futuro adicionarem formatação rica).

**Critérios de aceitação do MVP (mensuráveis):**
- Latência ponta a ponta (clique em "gerar rascunho" → texto inserido no compose) ≤ 3s no p95 com Haiku 5.5.
- Taxa de sucesso do content script em inserir o rascunho corretamente em: e-mail novo, resposta, resposta a todos, encaminhamento — 100% nos 4 fluxos (é o próprio critério de sucesso do spike do TF §5, deveria ser também critério de aceite do MVP, não só do spike).
- Zero ocorrências de HTML renderizado no corpo do e-mail enviado (sempre texto puro).
- Cota rígida por plano aplicada no proxy (não é possível exceder N rascunhos/mês mesmo com retry/replay).
- Nenhum corpo de e-mail do usuário persiste em log ou banco além do necessário para a chamada ao LLM (confirmar com teste que inspeciona logs do Worker após N requisições).

**Testabilidade:**
- **Automatizar:** proxy do Worker (auth, cota, chamada ao LLM, abstração de provedor) com **Vitest** — é stateless, fácil de testar com mocks do LLM.
- **Automatizar (E2E diário, conforme o próprio TF pede):** content script no Gmail real com **Playwright** cobrindo os 4 fluxos (novo/resposta/resposta a todos/encaminhar) — é o teste mais importante e com maior ROI do produto, porque detecta quebra de DOM antes do usuário.
- **Automatizar:** suíte de "red team" de prompt injection — um conjunto fixo de e-mails adversariais (instruções embutidas, tentativas de exfiltração do prompt de sistema) rodado contra o proxy real, verificando que a saída nunca segue instruções do e-mail recebido.
- **Difícil de testar:** mudanças de DOM do Gmail são, por definição, não previsíveis — só o monitoramento contínuo (E2E diário) + alerta rápido mitigam, não eliminam.
- **Difícil de testar:** qualidade subjetiva do "tom de marca" do rascunho — exige avaliação humana periódica, não é asserção automática trivial (poderia usar um LLM avaliador como proxy, mas isso é meta-teste, não substitui revisão humana).

**Segurança:**
- Prompt injection: tratar e-mail recebido sempre como dado, nunca como instrução — isso deveria ser um teste de regressão obrigatório (ver testabilidade acima), não apenas uma mitigação de design.
- Permissões/Chrome Web Store: **antes do MVP**, ler a política de "User Data" da Chrome Web Store para extensões com acesso a `mail.google.com` (está [H] no TF — é uma lacuna de verificação, não apenas de execução).
- Dados sensíveis: política de retenção zero precisa ser **testável** (ex.: teste que confirma que o corpo do e-mail não aparece em nenhuma tabela do Supabase/log do Worker após a chamada).

**Performance:**
- Meta: ≤3s p95 de latência de geração de rascunho (Haiku 5.5); monitorar p99 separadamente, pois picos de latência do provedor de LLM são o risco operacional mais provável.

**Dependências externas e contingência:**
- Gmail DOM (risco já coberto acima) — contingência: fallback para a extensão "Google Workspace add-on" oficial (`gmail.addons.current.*`) é citada como alternativa pelo próprio TF caso o DOM se mostre muito frágil — isso é uma boa contingência já documentada.
- API Anthropic (Haiku 5.5): abstrair o provedor no proxy (já recomendado no TF) para permitir troca por outro LLM se o preço/disponibilidade mudar.
- Chrome Web Store (review/remoção): sem contingência documentada — recomendo ter um canal de distribuição alternativo (ex.: instalação manual via `.crx` para early adopters) enquanto a loja não aprova.

**Estratégia de homologação:**
- Ambiente: extensão não listada (unlisted) no Chrome Web Store para beta fechado, nunca "unpacked" para usuários externos.
- Beta fechado com 10–20 usuários reais do Gmail por 2–3 semanas, com telemetria de falha de inserção (taxa de erro do content script) como gate de saída do beta.
- Gate de release: taxa de sucesso de inserção ≥ 98% nos 4 fluxos + suíte de prompt injection sem falhas + confirmação (não hipótese) da política de dados da Chrome Web Store antes de submeter para review pública.

**Nota de risco de qualidade: 4/5** (risco alto — depende de 3 fatores fora de controle do estúdio: DOM de terceiro, política de loja não verificada, e segurança de conteúdo gerado por IA sobre dados sensíveis de terceiros).

---

## C06 — StatusPing (Workers Cron+Queues+D1, status page pública)

**Top 5 riscos de qualidade (severidade/probabilidade):**

1. **SSRF (Server-Side Request Forgery).** O próprio TF já identifica: "usuário aponta checks para IPs privados/metadados, ou usa o serviço como gerador de tráfego contra terceiros". Severidade: crítica (pode expor infraestrutura interna do Cloudflare/da própria StatusPing ou ser usado como arma de DDoS contra terceiros, gerando risco legal/reputacional ao estúdio). Probabilidade: alta se não mitigado — é um vetor de ataque padrão e bem conhecido em produtos de "URL fetcher".
2. **Abuso (serviço usado como proxy/gerador de requisições).** Relacionado ao SSRF, mas mais amplo: um usuário malicioso pode cadastrar milhares de monitores contra um único alvo para gerar carga (DDoS "as a service" não intencional). Severidade: alta. Probabilidade: média.
3. **Falsos positivos de alerta.** O TF cita isso como risco de confiança ("falsos positivos de alerta destroem confiança rápido"). Severidade: alta (é a proposta de valor central do produto — confiabilidade; um falso positivo recorrente é motivo de cancelamento). Probabilidade: média-alta sem lógica de confirmação (retry antes de alertar, múltiplas falhas consecutivas).
4. **Isolamento entre clientes (multi-tenant).** Dados de monitores/status pages de clientes diferentes precisam estar isolados (RLS ou equivalente no D1/Supabase); vazamento cruzado exporia URLs e status de infraestrutura de um cliente para outro. Severidade: alta. Probabilidade: baixa-média (D1 não tem RLS nativo como Postgres — isso é uma lacuna de design não discutida no TF, que recomenda D1 mas não detalha isolamento de tenant).
5. **Dependência de provedor único (Cloudflare).** Se o Cloudflare cair, o produto que vende "confiabilidade" cai junto — risco já identificado no TF, com mitigação parcial proposta (probes multi-região em outro provedor), mas isso está fora do MVP.

**Critérios de aceitação do MVP (mensuráveis):**
- 100% dos checks para faixas de IP privadas/loopback/metadados (169.254.169.254, 10.0.0.0/8, 192.168.0.0/16, 127.0.0.0/8, fc00::/7 etc.) são bloqueados antes de qualquer requisição de rede.
- Taxa de falso positivo de alerta ≤ 1% medida em beta fechado (confirmação por N falhas consecutivas antes de alertar, não 1 falha isolada).
- Latência de detecção de queda: alerta disparado em até 2× o intervalo configurado do monitor (ex.: monitor de 1 min → alerta em até 2 min da queda real).
- Status page pública carrega em ≤ 1s e nunca expõe dados de outro tenant (teste cruzado explícito: tenant A nunca vê monitores do tenant B).
- Rate limit por conta para número de monitores/frequência mínima sem verificação de domínio (ex.: intervalos <5 min exigem prova de propriedade do domínio, conforme já proposto no TF).

**Testabilidade:**
- **Automatizar:** validação de SSRF com **Vitest** — suíte de URLs/IPs maliciosos (incluindo bypasses conhecidos: IPs em decimal, IPv6 mapeado, redirects para IP interno) testada contra a função de validação antes de qualquer `fetch`.
- **Automatizar:** lógica de scheduler/retry/confirmação de queda com Vitest (mock de respostas HTTP sucesso/falha/timeout).
- **Automatizar (E2E):** fluxo completo cron → queue → consumer → alerta, com **Playwright** ou teste de integração contra Workers em ambiente de staging (Miniflare/Wrangler local).
- **Difícil de testar:** comportamento real sob falha correlacionada do Cloudflare (não é possível simular uma queda real da plataforma em CI) — só mitigável com os probes externos propostos para a v1, não testável no MVP.
- **Difícil de testar:** volume real de abuso (um atacante sofisticado encadeando redirects para escapar do filtro de SSRF) — exige revisão de segurança dedicada/pentest leve antes do lançamento público, não só testes unitários.

**Segurança:**
- SSRF é o risco #1 e precisa de uma função de validação de URL testada exaustivamente (bloqueio de IP, bloqueio de redirect para IP bloqueado — redirects são um bypass clássico não mencionado no TF).
- Abuso: limitar requisições por segundo por Worker/conta; exigir verificação de domínio (já proposto no TF) para evitar cadastro em massa anônimo.
- Isolamento multi-tenant: como o TF recomenda D1 (sem RLS nativo), **a separação de tenant precisa ser aplicada manualmente em toda query** — isso é um risco de qualidade real que o TF não trata e que esta revisão sinaliza como gap.

**Performance:**
- Meta: CPU por check ≤ 2ms (consistente com a premissa do TF de ~1,5ms); lote de ~50 checks por invocação de Queue conforme já dimensionado no TF.
- Meta de precisão de alerta: confirmação por 2–3 falhas consecutivas antes de notificar (evita o falso positivo de uma única timeout de rede).

**Dependências externas e contingência:**
- Cloudflare (Cron/Queues/D1): risco de queda correlacionada — contingência proposta no TF (probes em Fly.io/VPS externo) deveria ser gate de release para v1, não ficar indefinida.
- Resend (alertas por e-mail): se Resend cair, alertas não chegam — contingência: webhook (Discord/Slack) como canal paralelo, já no roadmap do catálogo de oportunidades (v1), recomendo adiantar para o MVP dado que é o produto que vende confiabilidade.

**Estratégia de homologação:**
- Ambiente de staging com domínio de teste e monitores apontando só para alvos controlados pelo próprio estúdio.
- Beta fechado com 10–15 indie makers reais monitorando seus próprios sites por 3–4 semanas, medindo taxa de falso positivo e tempo de detecção reais.
- Gate de release: suíte de SSRF 100% verde + taxa de falso positivo medida em beta ≤ 1% + isolamento multi-tenant testado explicitamente antes de aceitar o primeiro usuário pagante externo ao beta.

**Nota de risco de qualidade: 3/5** (risco médio — tecnicamente simples, mas o risco de segurança (SSRF/abuso) é sério e exige disciplina de engenharia específica que ainda não está detalhada em nenhum documento-fonte).

---

## Opinião — qual finalista é mais seguro de entregar com qualidade

**C01 Loopwright é o mais seguro de entregar com qualidade.** Critérios: (1) nenhuma dependência de API de terceiros frágil (DOM de terceiro no C07; SSRF/dados sensíveis de clientes no C06); (2) o risco dominante é de **design/balanceamento**, que é visível e testável com um simulador headless simples (já proposto no TF), não um risco de segurança com potencial de dano a terceiros; (3) falhas de qualidade em C01 afetam a experiência do próprio jogador, enquanto falhas em C06 (SSRF/abuso) podem causar dano a terceiros, e falhas em C07 envolvem dados sensíveis de clientes de clientes (exposição maior e mais difícil de conter).

C06 vem em segundo: tecnicamente simples, mas o risco de SSRF é sério e não totalmente endereçado nos documentos-fonte (isolamento multi-tenant em D1 sem RLS nativo é uma lacuna real). C07 é o mais arriscado: depende de um DOM de terceiro que pode quebrar silenciosamente, de uma política de loja ainda não verificada, e processa conteúdo sensível de terceiros com exposição a prompt injection — nenhum desses três riscos está sob controle total do estúdio.

---

# Parte 2 — Revisão independente dos artefatos

## Verificação de amostras [E] (web_fetch, 2026-11-08)

| # | Afirmação verificada | Fonte citada no documento | URL verificada | Resultado |
|---|---|---|---|---|
| 1 | **Claude Haiku 5.5** (prompts ≤100k tokens): US$0,10/MTok entrada · US$0,50/MTok saída (TECHNICAL_FEASIBILITY.md, linha 26) | platform.claude.com/docs/en/about-claude/pricing | https://platform.claude.com/docs/en/about-claude/pricing | **Confirmada.** A página oficial lista "Claude Haiku 5.5 (for prompts up to 100,000 tokens)": $0.10/MTok base input · $0.50/MTok output — valores exatos. O modelo "Claude Haiku 5.5" existe e está ativo na tabela de preços oficial. |
| 2 | Cloudflare Workers Free: 100k req/dia, 10ms CPU/invocação; Paid: mín. US$5/mês, 10M req incluídas + US$0,30/M, 30M CPU-ms + US$0,02/M, **subrequests não cobradas** (TF linhas 33–34) | developers.cloudflare.com/workers/platform/pricing | https://developers.cloudflare.com/workers/platform/pricing/ | **Confirmada.** Todos os números batem exatamente, incluindo a nota de que subrequests (saídas do Worker) não são cobradas. |
| 3 | Supabase Free: US$0, 500MB db, 50k MAU auth, pausa após 1 semana de inatividade, 2 projetos; Pro: a partir de US$25/mês (TF linhas 37–38) | supabase.com/pricing | https://supabase.com/pricing | **Confirmada.** Todos os valores batem, incluindo a regra de pausa por inatividade e o limite de 2 projetos no Free. |
| 4 | Resend: Free 3.000/mês (100/dia); Pro US$20 (50k) / US$35 (100k); Scale US$350 (500k) (TF linha 39) | resend.com/pricing | https://resend.com/pricing | **Confirmada.** Tabela oficial lista exatamente Free $0 (3.000/mês, 100/dia), Pro $20/mês (50k) e $35/mês (100k), Scale $350/mês (500k). |
| 5 | Notion cruzou US$500 milhões em receita anual recorrente em setembro de 2025 (MARKET_RESEARCH.md linha 31) | Wikipedia "Notion (productivity software)" | https://en.wikipedia.org/wiki/Notion_(productivity_software) | **Confirmada.** A página cita a fonte primária: Novet, Jordan (18 set. 2025), CNBC, "Notion rides AI boom to $500 million in annual revenue". Nota: é **receita anual**, não necessariamente "ARR" no sentido técnico de SaaS recorrente puro — a distinção não compromete a conclusão qualitativa do relatório, mas o termo "ARR" usado no MARKET_RESEARCH é uma simplificação da manchete da CNBC. |
| 6 | Gmail API — escopos restritos exigem verificação + avaliação CASA anual; estrutura de escopos não-sensíveis/sensíveis/restritos existe (TF linha 40, usada para justificar a decisão de arquitetura do C07 de evitar a Gmail API) | developers.google.com/workspace/gmail/api/auth/scopes | https://developers.google.com/workspace/gmail/api/auth/scopes | **Confirmada (parcial).** A página confirma a existência da classificação em escopos não-sensíveis e sensíveis, com aviso de que escopos sensíveis exigem verificação. A página lida não detalha a camada "restrita" nem a exigência de CASA anual diretamente — essa parte específica (CASA) está na segunda fonte citada pelo TF (support.google.com/cloud/answer/13465431), que não foi reverificada nesta revisão por falta de orçamento de tempo; o claim geral (Gmail API com escopos de leitura/composição exige verificação OAuth) está correto e suficiente para sustentar a decisão de arquitetura. |

**Conclusão da amostragem:** 5 de 6 afirmações [E] verificadas com confirmação total e exata nos valores citados; 1 confirmada parcialmente (a parte não reverificada é um detalhe de processo — CASA —, não o número usado nas contas de custo). **Nenhuma afirmação [E] testada se mostrou falsa, inflada ou desatualizada.** A amostra é pequena (6 de dezenas de claims [E] nos documentos), mas cobre os números financeiros mais usados nas contas de custo do TF e um dos pontos mais citados do MARKET_RESEARCH — não há sinal de problema sistemático de evidência nos documentos revisados.

## Inconsistências entre documentos

Não foram encontradas inconsistências materiais de números, nomes ou premissas entre os 5 documentos:
- Nomes dos conceitos (C01 Loopwright, C06 StatusPing, C07 ReplyDraft) são idênticos em OPPORTUNITY_CATALOG, TECHNICAL_FEASIBILITY e FINAL_RANKING.
- As faixas de custo citadas no FINAL_RANKING (ex.: C07 "US$100–110/mês @1k", C06 "US$7–30 @1k", C05 "US$65–80 @1k") reproduzem exatamente as faixas calculadas no TECHNICAL_FEASIBILITY (seção 2, por conceito).
- As fontes de demanda citadas na justificativa do C01 no FINAL_RANKING (itch.io "Collecting" 287 vs. "Idle" 11.920; CrazyGames 31–35M usuários/mês) reproduzem exatamente os números do MARKET_RESEARCH.
- Único ponto a observar (não é inconsistência, é refinamento normal entre etapas): o risco "o próprio Gmail oferece rascunhos com Gemini" aparece apenas no FINAL_RANKING (linha 28), não no OPPORTUNITY_CATALOG nem no TECHNICAL_FEASIBILITY. Isso é esperado — é uma observação qualitativa adicionada na etapa de consolidação — mas vale registrar que **nenhum dos documentos verificou com evidência se o Gmail de fato oferece essa feature hoje**; está implicitamente tratada como fato conhecido, mas deveria estar marcada [H] ou [E] com fonte, e não está marcada de nenhuma forma no FINAL_RANKING.

## Afirmações [E] que deveriam ser [H]

1. **FINAL_RANKING.md, linha 28:** "o próprio Gmail oferece rascunhos com Gemini" — citada sem marcação [E]/[H] e sem fonte, dentro de um bloco que mistura [H] e [E]. Deveria ser explicitamente **[H]** (ou verificada com uma fonte, já que é um fato facilmente checável e crítico para a nota de diferenciação do C07 — Dif 8).
2. **MARKET_RESEARCH.md, linha 31** usa a palavra "ARR" (receita anual recorrente) para o número da Notion, mas a fonte primária (CNBC) fala de "annual revenue" de forma mais genérica, não necessariamente ARR formal de SaaS. É uma interpretação razoável mas tecnicamente é uma pequena extrapolação — marcar como "[E com interpretação]" seria mais rigoroso.
3. **MONETIZATION_REPORT.md, linha 137** mistura dentro de uma mesma marcação [E] uma citação entre aspas ("a maior aceleração de lançamentos iOS começa no início de 2025...") sem indicar claramente se essa frase específica entre aspas é uma citação textual da fonte RevenueCat ou uma paráfrase do agente — vale esclarecer a formatação, mas o dado numérico central (69% da receita por apps pré-2020) foi verificado como consistente no restante do relatório.

Fora esses três pontos de formatação/precisão, a marcação [E]/[H] nos cinco documentos está, em geral, bem aplicada e conservadora — a maioria das afirmações de mercado especulativas já está corretamente marcada [H], e os agentes autores foram transparentes sobre a limitação de `web_search` (erro 429) ao longo de toda a sessão.

## Conta do score (FINAL_RANKING.md)

**Soma dos totais:** verificada por recálculo independente das 10 linhas da tabela de ranking (Dem+Mon+Aq+Dif+Téc+Custo+Ret). **Todos os 10 totais somam corretamente**, sem nenhuma divergência:

| Conceito | Soma recalculada | Total publicado | Status |
|---|---|---|---|
| C01 | 71 | 71 | OK |
| C07 | 70 | 70 | OK |
| C06 | 66 | 66 | OK |
| C05 | 65 | 65 | OK |
| C03 | 63 | 63 | OK |
| C10 | 61 | 61 | OK |
| C04 | 59 | 59 | OK |
| C08 | 56 | 56 | OK |
| C02 | 55 | 55 | OK |
| C09 | 50 | 50 | OK |

**Checagem de limites por categoria** (rubrica: Dem≤20, Mon≤20, Aq≤15, Dif≤15, Téc≤10, Custo≤10, Ret≤10 — soma máxima 100, conforme STRATEGY.md): nenhuma nota individual excede seu limite de categoria em nenhuma das 10 linhas.

**Coerência nota × justificativa:** as justificativas textuais (seção "Justificativas" do FINAL_RANKING) citam números e fontes que reproduzem corretamente os dados do MARKET_RESEARCH/TECHNICAL_FEASIBILITY usados para fundamentar cada nota (ex.: C01 Dem 15 cita exatamente os números de itch.io/CrazyGames do MARKET_RESEARCH; C07 Custo 7 cita exatamente a faixa US$100–110/mês do TF). Não há nota que pareça desconectada da justificativa dada.

**Único ponto de atenção:** a nota "Dif 8" do C07 é justificada citando o risco "Gmail com Gemini" que, como apontado acima, não tem fonte/marcação — a nota em si não está necessariamente errada, mas repousa em parte sobre uma afirmação não verificada.

---

## Casos executados (passou/falhou)

- ✅ Recontagem independente das 10 somas do FINAL_RANKING — todas corretas.
- ✅ Verificação de 6 afirmações [E] via `web_fetch` em fontes oficiais — 5 confirmadas integralmente, 1 confirmada parcialmente (detalhe de processo, não o número usado).
- ✅ Checagem de consistência de nomes/números entre os 5 documentos — sem inconsistências materiais.
- ✅ Checagem de limites de categoria da rubrica — sem violações.
- ⚠️ Identificadas 3 afirmações com marcação [E]/[H] imprecisa (nenhuma delas muda o resultado do ranking).

## Bugs (severidade, passos)

Não aplicável — não há código/build nesta fase; os "bugs" encontrados são de documentação/evidência, listados na seção "Afirmações [E] que deveriam ser [H]" acima.

## Riscos residuais

- Nenhum spike técnico foi executado (reconhecido pelos próprios autores) — os números de MVP (semanas-pessoa) e custo de infraestrutura são estimativas de engenharia não calibradas por dados reais, conforme corretamente marcado [H] em todos os documentos.
- A avaliação de mercado/demanda depende fortemente de fontes secundárias (Wikipedia) por causa da falha do `web_search` (429) — isso é uma limitação conhecida e declarada, não uma falha de qualidade do processo, mas significa que a nota de "Demanda" nos três finalistas carrega mais incerteza do que a nota de "Custo"/"Facilidade técnica".
- Para C07 especificamente, a política de dados da Chrome Web Store para extensões com acesso a `mail.google.com` permanece [H] (não verificada) em todos os documentos-fonte — é o maior risco residual de todo o portfólio de finalistas, pois pode inviabilizar o canal de distribuição único do produto.

## Evidências (logs, prints, comandos)

- `web_fetch` a `platform.claude.com/docs/en/about-claude/pricing` (2026-11-08): confirma Claude Haiku 5.5 ($0.10/$0.50 por MTok, prompts ≤100k).
- `web_fetch` a `developers.cloudflare.com/workers/platform/pricing/` (2026-11-08): confirma Free (100k req/dia, 10ms CPU) e Paid ($5 mín., 10M req+$0,30/M, 30M CPU-ms+$0,02/M, subrequests grátis).
- `web_fetch` a `supabase.com/pricing` (2026-11-08): confirma Free ($0, 500MB, 50k MAU, pausa 1 semana, 2 projetos) e Pro (a partir de $25/mês).
- `web_fetch` a `resend.com/pricing` (2026-11-08): confirma Free (3k/mês, 100/dia), Pro ($20/50k, $35/100k), Scale ($350/500k).
- `web_fetch` a `en.wikipedia.org/wiki/Notion_(productivity_software)` (2026-11-08): confirma citação CNBC de 18/set/2025 sobre US$500M em receita anual.
- `web_fetch` a `developers.google.com/workspace/gmail/api/auth/scopes` (2026-11-08): confirma estrutura de escopos não-sensíveis/sensíveis do Gmail API (parte "restrita"/CASA não reverificada diretamente).
- Recontagem aritmética independente das 10 linhas do FINAL_RANKING (executada via script Python nesta sessão) — todas as somas corretas.

## Veredito: **aprovado com ressalvas** — baseado em evidência, não em declaração do dev

Os artefatos de GS-001 são **consistentes, bem fundamentados e transparentes sobre suas próprias limitações**. A amostragem de 6 afirmações [E] (incluindo o preço do Claude Haiku 5.5, o mais crítico para as contas de custo do C07) confirmou 100% de precisão nos valores verificáveis diretamente, com apenas uma confirmação parcial em um detalhe de processo regulatório que não afeta nenhum número usado nas contas. A conta de score do FINAL_RANKING está matematicamente correta nas 10 linhas e dentro dos limites da rubrica.

**Ressalvas que devem ser endereçadas antes de qualquer decisão de investimento:**
1. Marcar explicitamente [H] a afirmação "Gmail oferece rascunhos com Gemini" no FINAL_RANKING (ou verificá-la), já que sustenta parte da nota de diferenciação do 2º colocado.
2. Verificar formalmente, antes do MVP do C07, a política de dados da Chrome Web Store para extensões com permissão de host sobre `mail.google.com` — é [H] em todos os documentos e é o maior risco residual do portfólio de finalistas.
3. Para C01: nenhum documento trata o risco de fraude de rewarded ads (não é um cheat de save, é fraude contra o portal de distribuição) — recomendo adicionar este risco explicitamente ao TECHNICAL_FEASIBILITY/OPPORTUNITY_CATALOG do C01 antes do MVP.
4. Para C06: o risco de isolamento multi-tenant em D1 (sem RLS nativo como o Postgres/Supabase) não está tratado em nenhum documento e deveria ser resolvido em design antes do MVP, não descoberto em produção.

**Notas de risco de qualidade por finalista:**
- **C01 Loopwright: 2/5** (menor risco — problemas são de design/balanceamento, testáveis e sem exposição de dados de terceiros).
- **C06 StatusPing: 3/5** (risco médio — SSRF é sério mas mitigável com disciplina de engenharia padrão; isolamento multi-tenant precisa de atenção de design).
- **C07 ReplyDraft: 4/5** (maior risco — depende de DOM de terceiro instável, política de loja não verificada, e processa conteúdo sensível de terceiros com exposição a prompt injection).

**Opinião do QA sobre qual é mais seguro de entregar com qualidade: C01 Loopwright**, pelos motivos detalhados na Parte 1 — é o único finalista cujos riscos residem majoritariamente em design (testável e corrigível internamente) em vez de dependências externas fora do controle do estúdio.
