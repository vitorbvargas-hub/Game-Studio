# GS-002 — ReplyDraft: Validação Fase 0 (itens 1-2) + Concorrentes e Canais

- **De:** game-research · **Para:** game-studio (coordenador) · **Data:** 2026-11-08
- **Objetivo:** responder às duas perguntas que podem matar o C07 ReplyDraft antes do MVP, e mapear o cenário competitivo e os canais de distribuição.
- **Método:** `web_fetch` em páginas oficiais do Google e do Chrome Web Store, e nos sites de 8 concorrentes. `web_search` retornou **HTTP 429 (cota esgotada)** em todas as tentativas desta sessão (mesmo problema relatado no GS-001) — por isso a Parte 4 (canais/comunidades) é majoritariamente **[H]**, sem confirmação por busca ao vivo.

---

## Parte 1 — O Gmail já mata o ReplyDraft? (Fase 0, item 1)

### Evidências [E]

| Fonte | Data de acesso | O que diz literalmente |
|---|---|---|
| support.google.com/mail/answer/13955415 ("Draft emails with Gemini in Gmail") | 2026-11-08 | "Help me write" gera rascunho novo ou refina um existente. Disponível com **"An eligible Google Workspace or Google AI plan"** (multi-idioma, global) ou com **"A personal Google Account"**, mas aí **"restricted to the US only"**. |
| mesma página, seção "Learn how 'Help me write' personalizes your drafts" | 2026-11-08 | "it proactively takes details from your other emails and Drive files, like flight times, soccer schedules, or hotel booking codes, to draft a personalized response that includes relevant details and **matches your tone and style without the need for explicit instructions**." |
| support.google.com/mail/answer/14925782 (idiomas do Gemini no Workspace) | 2026-11-08 | "Help me write" (eligible Workspace/Google AI plans): inglês, francês, alemão, italiano, japonês, coreano, **português**, espanhol. Contas pessoais: só EUA. |
| workspace.google.com/pricing (locale BR, R$) | 2026-11-08 | Planos: **Base R$20/usuário/mês** (Gemini em Gmail = "not supported by this SKU"); **Starter R$32,72/usuário/mês** — primeiro plano com "Gemini AI assistant in Gmail"; Standard R$81,80; Plus R$128,40; Enterprise sob consulta. |
| knowledge.workspace.google.com/admin/.../google-workspace-with-gemini | 2026-11-08 | Lista oficial de recursos "Help me write in Gmail and Docs", "Gemini in the side panel of Gmail", disponíveis nos planos Business/Enterprise com Gemini. |
| one.google.com/about/google-ai-plans (locale BR) | 2026-11-08 | Planos de consumidor: **Google AI Plus, Pro, Ultra 5x, Ultra 20x** (preços não capturados no fetch — página omitiu os valores numéricos na extração, apenas "/mês"). Todos incluem "Gemini nos apps do Google... ajuda você a revisar no Gmail" (ou seja, função de revisão/polish, não necessariamente "Help me write" completo). Disponível no Brasil (o fetch usou locale pt-BR automaticamente). |
| knowledge.workspace.google.com/.../gemini-for-google-workspace-faq-business | 2026-11-08 | Confirma que o conteúdo/prompts ficam dentro da organização e não treinam modelos sem permissão — ou seja, não há vazamento de dados de clientes para terceiros nesse recurso nativo (diferente do risco que o ReplyDraft precisa mitigar). |

### Análise: existe tom de marca persistente e configurável?

**Não encontrei nenhuma funcionalidade nativa do Gmail/Workspace que seja equivalente a "biblioteca de tom de voz configurável"** no sentido do ReplyDraft (perfis salvos, reutilizáveis, por marca/cliente, com exemplos explicitamente curados pelo usuário e compartilháveis em equipe).

O que o Gmail/Gemini faz, segundo a documentação oficial:
- "Help me write" **aprende implicitamente** o seu estilo a partir de outros e-mails e arquivos do Drive, **sem instrução explícita** — é personalização automática e opaca, não uma biblioteca de tom configurável com exemplos selecionados.
- Não há um conceito documentado de "perfil de marca" separado da conta — é sempre "o seu" estilo de escrita, ligado à conta Google que está usando. Não há evidência de suporte a múltiplos perfis de tom por cliente/marca (que é exatamente o caso de uso de freelancers/pequenos negócios que atendem vários clientes com tons diferentes — e é o diferencial batido por um concorrente direto, ver Parte 3: Replyf).
- "Proofread" (gramática/estilo) está disponível apenas em inglês e espanhol — **não cobre PT-BR**.
- Contas Gmail gratuitas pessoais: "Help me write" **só funciona nos EUA**, mesmo em inglês. Fora dos EUA (incluindo Brasil), conta pessoal gratuita **não tem acesso** a essa função.

### Veredito Parte 1: **NÃO MATA** (mas reduz a janela, não a elimina)

**Justificativa:**
1. O público-alvo do C07 (pequenos negócios/freelancers brasileiros, contas Gmail gratuitas ou Workspace barato) **não tem acesso gratuito e local** ao "Help me write": conta pessoal grátis fora dos EUA não tem a função; para ter via Workspace é preciso pagar no mínimo o plano **Business Starter (~R$32,72/usuário/mês)**, que já é maior que o ARPU hipotético do próprio C07 (US$29 ou ~R$29 cogitado no business case original está na mesma faixa, então não há vantagem de custo clara para o cliente nem no "já está pago" dessa ferramenta).
2. A personalização nativa é implícita e vinculada à própria conta — **não resolve o caso de várias marcas/clientes com tons diferentes** (ex.: freelancer de suporte que atende 3 clientes, ou e-commerce com tom de marca definido por outra pessoa que não quem escreve). Esse é precisamente o ponto forte dos concorrentes diretos como Replyf e Jetwriter (ver Parte 3).
3. PT-BR tem suporte a "Help me write" nos planos pagos, mas não a "Proofread", e a documentação não evidencia qualidade/adequação de tom para português brasileiro especificamente.

**Mas atenção:** o recurso nativo já cobre o caso de uso mais simples ("escrever um e-mail do zero, em inglês ou nos 8 idiomas suportados, para quem já paga por Workspace Starter+"). Isso reduz o mercado endereçável para quem já é cliente Workspace pago E só precisa de um tom genérico. O risco residual real não é "o Gmail mata o produto", é "concorrentes de nicho (Replyf, Jetwriter, Email Assistant) já resolvem o problema de tom persistente multi-cliente melhor e mais barato que construir do zero" — ver Parte 3.

---

## Parte 2 — A política da Chrome Web Store bloqueia o acesso a `mail.google.com`? (Fase 0, item 2)

### Evidências [E]

| Fonte | Data de acesso | O que diz literalmente |
|---|---|---|
| developer.chrome.com/docs/webstore/program-policies/policies | 2026-11-08 | **Privacy Policy:** "If your Product handles any user data, then you must post an accurate and up to date privacy policy" com link no painel do desenvolvedor. **Limited Use:** uso de dados restrito ao "single purpose" declarado; proibido usar para anúncios, venda a terceiros (ad platforms, data brokers), ou avaliação de crédito; humanos não podem ler os dados do usuário, exceto com consentimento explícito, por segurança, ou para cumprir lei. **Use of Permissions:** só o mínimo necessário, sem "future proofing". **Disclosure:** antes da instalação, deve divulgar de forma proeminente quais dados serão coletados e como serão usados, e obter consentimento afirmativo — **não pode estar só na privacy policy**, tem que estar na UI do produto. |
| developer.chrome.com/docs/webstore/program-policies/user-data-faq | 2026-11-08 | "handle" inclui "collecting data obtained from web requests, such as a background activity that accesses contacts, emails, files, or other data from a user's cloud service" — ou seja, ler e-mails do Gmail conta como "handle user data" mesmo que processado só localmente. Todo Product que lida com dados do usuário precisa de privacy policy, mesmo que não transmita a servidores externos. |
| mesma FAQ, seção "Minimum Permission" | 2026-11-08 | Extensões "must require only the narrowest set of permissions necessary" — ou seja, pedir `host_permissions` para `mail.google.com` é aceitável *se* for estritamente necessário para a função declarada (ler o e-mail aberto para gerar rascunho), mas não pode pedir acesso mais amplo (ex.: `<all_urls>`) "para o futuro". |
| developer.chrome.com/docs/extensions/develop/migrate/improve-security (MV3) | 2026-11-08 | MV3 **proíbe código remotamente hospedado e execução de strings arbitrárias** (`eval`, `new Function`, scripts remotos via CDN). Toda a lógica do bundle precisa estar embutida no pacote da extensão. **Chamar um serviço remoto via rede (ex.: API de um LLM de terceiros) é explicitamente permitido** ("Externalized logic with a remote service: Your extension calls a remote web service... without the extra overhead of resubmitting to the Chrome Web Store") — isso não é "remote code", é uma chamada de API normal, sujeita às regras de dados de usuário (Limited Use) mas não à proibição de código remoto. |
| developer.chrome.com/docs/webstore/program-policies/code-readability | 2026-11-08 | Proibido obfuscar código ou ocultar funcionalidade (minificação é permitida). Isso vale também para qualquer recurso externo buscado pela extensão. |
| developer.chrome.com/docs/webstore/register e /set-up-account | 2026-11-08 | Confirma que existe **taxa única de registro de desenvolvedor** cobrada no primeiro cadastro no Developer Dashboard, mas o valor numérico **não apareceu no conteúdo extraído das páginas oficiais nesta sessão** (a página só mostra a tela de pagamento via screenshot, sem o valor em texto). **[H] não confirmado nesta sessão:** é publicamente conhecido como uma taxa única de US$5, mas isso não foi verificado por citação literal de uma página oficial agora — recomendo confirmar no painel do desenvolvedor antes de orçar. Brasil está na lista de países suportados para registro. |

### Veredito Parte 2: **PERMITE COM REQUISITOS** (não bloqueia)

**Lista de requisitos de compliance para o ReplyDraft:**
1. **Privacy Policy** publicada e linkada no Developer Dashboard, descrevendo exatamente quais dados são lidos (conteúdo do e-mail aberto), como são usados (gerar rascunho via API de LLM de terceiro) e com quem são compartilhados (nome do provedor de LLM).
2. **Disclosure proeminente na própria UI da extensão** (não só na privacy policy) pedindo consentimento explícito antes de ler/processar o e-mail.
3. **Host permission mínima**: pedir apenas `https://mail.google.com/*` (não `<all_urls>`), e não solicitar permissões "para funcionalidades futuras".
4. **"Single purpose" declarado** claramente no painel: "gerar rascunhos de resposta de e-mail a partir do e-mail aberto no Gmail".
5. **Limited Use**: dado do e-mail só pode ser usado para gerar o rascunho (não para ads, não vendido a terceiros, não usado para scoring de crédito). Declarar a certificação de Limited Use no Developer Dashboard e, se usar OAuth do Google, publicar a frase de conformidade exigida.
6. **Nenhum humano da equipe pode ler o conteúdo do e-mail do usuário**, exceto com consentimento explícito (ex.: suporte técnico pontual) ou por motivos de segurança/legais.
7. **Transmissão segura**: qualquer envio do conteúdo do e-mail para a API do LLM deve ser via HTTPS/TLS; dado em repouso (se armazenado) deve usar criptografia forte.
8. **Sem código remoto nem `eval`**: toda a lógica roda no bundle local; chamadas à API do LLM de terceiro são permitidas como "serviço remoto" (não são "remote code"), mas o bundle da extensão em si não pode baixar e executar JS remoto.
9. **Sem ofuscação de código** (minificação é ok).
10. **Revisão mais aprofundada é esperada**: extensões com `host_permissions` sensíveis (e-mail) tipicamente passam por revisão manual mais lenta do Chrome Web Store — não documentado um prazo oficial nesta sessão, mas é prática conhecida do ecossistema (concorrentes como Replyf e Email Assistant conseguiram publicar, então não é bloqueio, é fricção de tempo).
11. **Taxa de registro**: existe taxa única de cadastro de desenvolvedor — valor não confirmado nesta sessão, verificar no Developer Dashboard antes do orçamento do MVP.

---

## Parte 3 — Concorrentes (8 confirmados, todos com acesso ao vivo em 2026-11-08) [E]

| # | Nome | URL | Preço | Plano free | Tom/estilo persistente? | Usuários (CWS) | Data de acesso |
|---|---|---|---|---|---|---|---|
| 1 | **Jetwriter AI** (antigo ChatGPT Writer) | jetwriter.ai | Elite US$18/mês (US$14/mês anual); Ultra US$39/mês (US$29/mês anual) | Sim — 15 respostas/mês, sem cartão | **Sim** — "Learns your style from emails you've sent"; Auto-Drafts no Gmail; funciona também em WhatsApp, LinkedIn, Outlook, Slack, Zoho Mail | **"500,000+ Chrome users"**, "1,300+ Ratings" (declarado no site) | 2026-11-08 |
| 2 | **Replyf** | replyf.app | Não divulgado em detalhe na home (planos "Starter/Pro/Unlimited" com 8/20/60 perfis de tom); free com upgrade | Sim — 10 respostas/mês + 1 perfil de tom, sem cartão | **Sim, é o diferencial central**: "learns each client's writing tone from a small sample of their real sent emails" (3-5 e-mails), múltiplos perfis de tom por cliente (8 no Starter, 20 no Pro, 60 no Unlimited) — **posicionado explicitamente para VAs/EAs que atendem vários clientes**, o caso de uso mais próximo do C07 | Não divulgado número total; mostra 5 avaliações verificadas na home, nota 4,6 | 2026-11-08 |
| 3 | **Email Assistant – AI Reply Generator** (emailassistant.app) | emailassistant.app | Pro (não divulgado valor na home, "Unlimited replies"); plano com histórico/templates acima do Pro | Sim — 5 respostas/dia (150/mês), 3 tons, 2 variações, só inglês | Parcial — "9 tone options" predefinidos + "Smart Instructions" (prompt livre), mas não é um perfil de tom aprendido/persistente por cliente como o Replyf | Não divulgado; ID da extensão confirmado: `lifhnpajegiipllbcpijimimiojkhfec` | 2026-11-08 |
| 4 | **superReply** | superreply.co | Não divulgado (planos pagos "unlimited + tone controls") | Sim — até 90 respostas/mês grátis | "Tone-Matching Email Suggestions" mencionado, mas sem detalhe se é perfil persistente ou seleção de tom por mensagem | Não divulgado; alega clientes em Wix, DocuSign, Monday, Fiverr | 2026-11-08 |
| 5 | **Speak2mail** | speak2mail.com | Professional (créditos mensais, valor não divulgado na home); Business (créditos maiores) | Sim — ~20 e-mails grátis (150 créditos) | Foco é ditado por voz → texto no "seu tom", não é biblioteca de tom de marca multi-cliente | Não divulgado | 2026-11-08 |
| 6 | **MailMaestro** (ex-Flowrite, Maestro Labs) | maestrolabs.com | Email: US$12/assento/mês; Meetings: US$17; Combo MaestroDuo: US$25/mês (ou US$300/ano) | Tem plano free (mencionado, sem detalhar limites na página de pricing) | Tem "AI email writer" multilíngue e templates, mas é mais voltado a produtividade de equipe/empresa (SOC2, GDPR, HIPAA) do que a perfis de marca de pequenos negócios | Não divulgado nesta página | 2026-11-08 |
| 7 | **Compose AI** | compose.ai | Freemium; "premium version with some advanced features including... personalization features" (valor não divulgado na home) | Sim — grátis "forever" para autocomplete básico | **Sim, parcial**: "Personalization Of Your Writing Style — Our platform learns your 'voice'", mas é autocomplete universal (qualquer campo de texto), não um gerador de rascunho completo dentro do Gmail com múltiplos perfis | "Trusted by 10,000+ teams and 400,000 people" (declarado) | 2026-11-08 |
| 8 | **Lavender** (email intelligence / sales coach) | lavender.ai | Não divulgado na home (B2B, enterprise, "talk to sales" implícito) | Não evidenciado nesta página | Sim — "analyzes your historic emails to understand what works for you and your team", mas focado em **e-mail de vendas/outbound** (SDR/AE), não em suporte ao cliente de pequenos negócios; SOC2/GDPR | Não divulgado; clientes citados: Twilio, Deel, Clari (logos de depoimentos) | 2026-11-08 |

### Os 3 concorrentes mais perigosos para o C07 (ordem de risco)

1. **Replyf** — é quase uma cópia exata da proposta de valor do C07: extensão Chrome, Gmail, perfis de tom por cliente aprendidos de e-mails reais, free tier com 1 perfil, planos pagos por número de perfis (8/20/60). Já está publicado, com reviews reais no Chrome Web Store (avaliações de 2026-05/06 citadas na própria home). **Validação de mercado positiva para a tese do C07, mas também concorrência direta e já no mercado.**
2. **Jetwriter AI** — escala muito maior (500k+ usuários declarados), aprende estilo de escrita a partir de e-mails enviados, cobre múltiplos canais (não só Gmail), e tem comparação explícita contra "Gemini in Gmail" no próprio marketing — mostra que esse ângulo de venda ("Jetwriter aprende seu estilo, Gemini é pago e só em inglês/EUA") já é usado por um concorrente estabelecido.
3. **Email Assistant (emailassistant.app)** — mais simples e barato, tons predefinidos + "Smart Instructions" em linguagem natural, multilíngue (12+ idiomas), já publicado na Chrome Web Store com ID confirmado — é o concorrente mais parecido em preço/simplicidade para o público de pequenos negócios/freelancers que não precisam de perfis complexos.

**Implicação para o business case original:** a Fase 0 do GS-001 listava como critério de "mata" apenas o Gmail nativo. Esta pesquisa mostra que o **risco competitivo relevante não é o Gmail, é um conjunto de concorrentes de nicho já publicados e validados** (principalmente Replyf) cobrindo exatamente o caso de uso de "tom de marca/cliente persistente" que o catálogo de oportunidades (C07) descreveu como diferencial. Isso não mata o produto, mas exige um diferencial mais específico que "ter perfil de tom" — ex.: foco em PT-BR/mercado brasileiro, preço, integração com histórico de respostas aprovadas, ou nicho vertical (e-commerce) que os concorrentes atuais não atacam de forma explícita.

---

## Parte 4 — Canais de distribuição e comunidades

**Aviso: Parte 4 não teve acesso a busca web ao vivo (web_search retornou HTTP 429 em todas as tentativas desta sessão).** Os itens abaixo marcados **[H]** são conhecimento geral não verificado nesta sessão — precisam de confirmação por busca ao vivo antes de qualquer decisão de investimento de tempo/dinheiro em um canal específico. Os poucos itens **[E]** vêm de páginas que o `web_fetch` conseguiu acessar diretamente.

### Lançamento de produto (BR e global)

- **Product Hunt** [H] — plataforma padrão de lançamento para ferramentas B2B/SaaS/extensões; concorrentes do setor (ex.: ferramentas de IA para e-mail) costumam lançar lá. Não verificado nesta sessão se algum dos 8 concorrentes listados lançou especificamente no Product Hunt.
- **Indie Hackers** [H] — comunidade para fundadores solo/pequenos SaaS, boa para o builder-in-public (o próprio superReply citou um "Building in Public" com posts diários no seu site — **[E]**, confirmado via fetch de superreply.co).
- **BetaList** [H] — lista de pré-lançamento para captar early adopters antes do Product Hunt.
- **Reddit** [H] — subreddits relevantes citados de memória, não confirmados nesta sessão: r/smallbusiness, r/Entrepreneur, r/VirtualAssistants, r/Ecommerce, r/SaaS. Precisa confirmação de regras de cada subreddit (muitos proíbem autopromoção direta).

### Comunidades de público-alvo (pequeno e-commerce, freelancers)

- **Brasil** [H]: grupos de Facebook/WhatsApp/Telegram de "lojistas Shopify/Nuvemshop/Tray Brasil", comunidades de freelancers de atendimento/suporte (ex.: grupos de VA — assistentes virtuais — brasileiros), fóruns de e-commerce como "Fórum Ecommerce Brasil" (nome genérico, não confirmado como entidade específica nesta sessão).
- **Global** [H]: comunidades de freelancers (ex.: grupos de Virtual Assistants no Facebook, que o próprio Replyf cita como público-alvo explícito — "Built for VAs and EAs" — **[E]**, confirmado via fetch de replyf.app), comunidades Shopify/WooCommerce para lojistas.

### Canais pagos/orgânicos adicionais

- **Chrome Web Store (busca orgânica)** [E] — confirmado nesta sessão que a busca `chromewebstore.google.com/search/...` retorna resultados reais e é um canal de descoberta ativo onde os 8 concorrentes aparecem; otimização de nome/descrição/categoria no listing é um canal de aquisição em si (SEO de loja).
- **SEO de conteúdo** [H] — concorrentes como MailMaestro/Flowrite e Lavender investem em blog/conteúdo educacional (não verificado em detalhe nesta sessão, inferência a partir do padrão de mercado SaaS).

**Recomendação de verificação futura:** quando a cota de busca web for restaurada, repetir a Parte 4 com `web_search` real para confirmar comunidades brasileiras específicas (nomes de grupos, fóruns, newsletters) e validar se concorrentes já lançaram no Product Hunt (nível de tração, comentários, data).

---

## Resumo para o requester

- **Caminho do arquivo:** `projects/active/GS-002-replydraft/launch/RESEARCH_PHASE0_AND_COMPETITORS.md`
- **Veredito Parte 1 (Gmail nativo):** **NÃO MATA.** "Help me write" existe e cobre PT-BR nos planos pagos (Workspace Starter+ ou Google AI Plus/Pro/Ultra), mas (a) contas gratuitas fora dos EUA não têm acesso, e (b) a personalização é implícita/por conta, sem suporte documentado a múltiplos perfis de tom por cliente/marca — o caso de uso central do C07.
- **Veredito Parte 2 (política da Chrome Web Store):** **PERMITE COM REQUISITOS.** Não há bloqueio a `mail.google.com`; é preciso privacy policy, disclosure na UI, permissão mínima, certificação de Limited Use, e chamadas a LLM de terceiro via API são permitidas sob MV3 (não contam como "remote code"). Esperar revisão manual mais lenta por acessar e-mail.
- **Top 3 concorrentes mais perigosos:** (1) **Replyf** — proposta quase idêntica (perfis de tom por cliente, Gmail, free tier); (2) **Jetwriter AI** — escala declarada de 500k+ usuários, multi-canal, aprende estilo; (3) **Email Assistant (emailassistant.app)** — simples, barato, multilíngue, já publicado.
- **Limitações:**
  - `web_search` ficou indisponível (HTTP 429) durante toda a sessão; Parte 4 é majoritariamente [H].
  - Preços do Google AI Plus/Pro/Ultra (consumidor) não vieram com valor numérico na extração da página oficial (só "/mês" sem número) — confirmar em `one.google.com/ai` com visualização completa antes de citar valores.
  - Taxa de registro de desenvolvedor Chrome Web Store não teve o valor numérico confirmado por citação literal nesta sessão.
  - Dados de número de usuários dos concorrentes vêm das próprias páginas de marketing (auto-declarados), não de fonte independente (ex.: Chrome Web Store detail page com contagem oficial) — não consegui montar a URL de detail page com ID da Chrome Web Store para todos exceto Email Assistant e Jetwriter (IDs capturados no texto).
  - Nenhuma entrevista com usuários foi realizada (fora do escopo desta tarefa).
