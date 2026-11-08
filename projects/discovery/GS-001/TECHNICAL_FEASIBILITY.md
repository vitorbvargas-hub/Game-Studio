# Technical Feasibility Report — GS-001 (Task 4)

> Baseado no template `shared/templates/TECHNICAL_SPEC.md`, adaptado para avaliar 10 conceitos. Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/estimativa não verificada.

- **Projeto:** GS-001
- **Autor (agente):** game-dev
- **Data:** 2026-11-08
- **Status:** rascunho
- **Entrada:** `OPPORTUNITY_CATALOG.md` (C01–C10, game-design, 2026-11-08)

---

## 0. Método, premissas e fontes de preço

### Premissas de estimativa
- **Equipe:** fundador + agentes de IA. "1 semana-pessoa" = 1 semana de trabalho em tempo integral de uma pessoa operando agentes de código. As faixas já incluem o ganho de produtividade do dev assistido por IA **[H]** (estimativa de engenharia, não medida neste estúdio — ainda não há histórico de velocidade).
- **MVP** = escopo "MVP (entra)" do catálogo, pronto para teste fechado. **Fora da estimativa:** arte final (exceto onde dito), tempo de espera de review de lojas, marketing, trabalho jurídico (termos/privacidade).
- **"Usuário ativo"** = usuário ativo mensal (MAU). Custos excluem impostos, taxas de pagamento (Stripe/lojas) e domínio.
- **Custos são de infraestrutura + APIs**, não de pessoas. Faixas: limite inferior = free tiers máximos; limite superior = plano pago mínimo + margem para uso acima do esperado.
- Nenhum spike foi executado; nenhuma conta foi criada; nada foi instalado ou implantado.

### Preços públicos verificados (web_fetch em 2026-11-08)

| Item | Preço | Fonte |
|---|---|---|
| Claude Haiku 5.5 (prompts ≤100k tokens) | US$0,10 / MTok entrada · US$0,50 / MTok saída | **[E]** platform.claude.com/docs/en/about-claude/pricing (2026-11-08) |
| Claude Sonnet 5 | US$2 / MTok entrada · US$10 / MTok saída | **[E]** idem |
| Claude Haiku 4.5 | US$1 / MTok entrada · US$5 / MTok saída | **[E]** idem |
| Batch API da Anthropic | −50% em entrada e saída | **[E]** idem |
| OpenAI gpt-4o-mini-transcribe | US$0,003 / minuto | **[E]** developers.openai.com/api/docs/pricing (2026-11-08) |
| OpenAI gpt-transcribe / Whisper | US$0,0045 / min · US$0,006 / min | **[E]** idem |
| OpenAI gpt-5-mini (alternativa de LLM) | US$0,25 / MTok entrada · US$2 / MTok saída | **[E]** idem |
| Cloudflare Workers Free | 100k requisições/dia; 10 ms de CPU por invocação; assets estáticos grátis e ilimitados | **[E]** developers.cloudflare.com/workers/platform/pricing (atualizado em 2026-10-02, lido em 2026-11-08) |
| Cloudflare Workers Paid | mínimo de US$5/mês; 10M req/mês incluídas + US$0,30/M; 30M CPU-ms incluídos + US$0,02/M; **subrequests não são cobradas** | **[E]** idem |
| Cloudflare D1 (plano pago) | 25 bi linhas lidas/mês e 50M linhas escritas/mês incluídas; depois US$1,00 por milhão de escritas; 5 GB incluídos + US$0,75/GB-mês | **[E]** idem |
| Cloudflare Queues (plano pago) | 1M operações/mês incluídas + US$0,40/M; ~3 operações por mensagem | **[E]** idem |
| Supabase Free | US$0; 500 MB de banco; 50k MAU de auth; **pausa após 1 semana de inatividade**; 2 projetos | **[E]** supabase.com/pricing (2026-11-08) |
| Supabase Pro | a partir de US$25/mês (inclui compute Micro); 100k MAU; 8 GB de disco | **[E]** idem |
| Resend (e-mail transacional) | Free: 3.000/mês (100/dia) · Pro: US$20 (50k) / US$35 (100k) · Scale: US$350 (500k) | **[E]** resend.com/pricing (2026-11-08) |
| Gmail API — escopos restritos (`gmail.readonly`, `gmail.compose`, `gmail.modify`…) | exigem verificação OAuth de escopo restrito + **avaliação de segurança anual (CASA)** | **[E]** developers.google.com/workspace/gmail/api/auth/scopes e support.google.com/cloud/answer/13465431 (2026-11-08) |
| Chrome Web Store | taxa única de registro (valor não aparece na página lida; conhecimento prévio: US$5) | **[E]** existência da taxa: developer.chrome.com/docs/webstore/register · **[H]** valor |
| Apple Developer Program / Google Play Console | US$99/ano · US$25 taxa única | **[H]** (página da Apple lida não mostrava o valor) |
| Cloudflare R2 | ~US$0,015/GB-mês, 10 GB grátis, sem custo de egress | **[H]** (não verificado nesta sessão) |
| AWS SES | ~US$0,10 por 1.000 e-mails | **[H]** |
| RevenueCat (IAP) | grátis até ~US$2,5k de receita mensal rastreada | **[H]** |
| Vercel Hobby | proíbe uso comercial → não usar para produto pago | **[H]** (política conhecida, não reverificada) |

---

## 1. Stacks da casa (para não espalhar tecnologia)

Para ganhar velocidade e reaproveitar código entre produtos, recomendo **uma única linguagem (TypeScript)** e **4 blocos reaproveitáveis**. Cada conceito usa só os blocos de que precisa.

| Bloco | Tecnologias | Usado por |
|---|---|---|
| **G — Jogo web 2D** | Vite + TypeScript + **PixiJS** (render 2D) + Preact (UI/menus) · empacotamento mobile via **Capacitor** | C01, C02, C03, C04 |
| **A — App mobile** | **Expo (React Native) + TypeScript** · EAS Build no free tier **[H]** | C08, C09 (e C10 v1) |
| **W — Web app/SaaS** | React + Vite (SPA) em **Cloudflare Pages** · **Supabase** (Postgres + Auth + RLS) para dados relacionais | C05, C07 (painel), C10 |
| **E — Edge/serverless** | **Cloudflare Workers** (Hono) + Cron Triggers + Queues + D1/KV · proxy de LLM com chave do lado do servidor | C06, C07, C09, C10, saves/leaderboards dos jogos |

**Por que TS em tudo:** agentes de IA geram e revisam TS/React com mais confiabilidade do que GDScript/C# de engine **[H]**; um repositório e um conjunto de ferramentas (lint, testes, CI) servem todos os produtos; o mesmo módulo de simulação roda no cliente e no Worker.

**Alternativas óbvias descartadas no geral:**
- **Unity:** build WebGL pesado (MBs, carregamento lento em portais), iteração lenta com agentes, termos de licença/runtime já mudaram no passado **[H]**. Só faria sentido para 3D ou mobile de alto desempenho — nenhum conceito precisa disso.
- **Godot 4:** gratuito e ótimo para mobile nativo, mas o export web é mais pesado que PixiJS e historicamente teve atrito com threads/COOP-COEP em portais **[H]**. Fica como **plano B para C03/C04** se o desempenho do PixiJS em touch decepcionar.
- **Next.js/SSR:** desnecessário para dashboards logados; SPA estática + API serverless é mais barata e simples. O Vercel Hobby não permite uso comercial **[H]**.
- **Firebase:** viável, mas Supabase (Postgres + RLS) é mais adequado para dados relacionais/financeiros e evita lock-in em NoSQL; Workers cobrem o que é edge.
- **Servidor dedicado (VPS):** só quando algo exigir processo contínuo (não é o caso de nenhum MVP).

---

## 2. Avaliação por conceito

### C01 — Loopwright (idle + coleção, Web PWA → mobile)

- **Stack recomendada:** Bloco G (Vite + TS + PixiJS + Preact) como PWA; cloud save/leaderboard via Bloco E (Worker + D1). Mobile v1 via Capacitor + AdMob. Na web: SDK de anúncios do portal (CrazyGames/Poki) **[H]**, que já traz rewarded ads sem integrar uma ad network própria.
  - *Por que não Unity/Godot:* o idle é ~80% UI e números; PixiJS + DOM dão tempo de carregamento mínimo (crítico em portais) e iteração rápida com IA.
  - *Por que não 100% DOM:* as animações de coleção/produção ficam melhores e mais leves em canvas/WebGL.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    UI[Preact UI] --> Core[Sim core TS puro<br/>tick + cálculo offline]
    Core --> Render[PixiJS]
    Core --> Local[(IndexedDB save)]
    Local -. sync opcional .-> W[Worker /save /leaderboard] --> D1[(D1)]
    UI --> Ads[SDK portal / AdMob]
  ```
  Progresso offline é calculado no cliente (`Δt × taxa`, com teto). Números grandes com `break_infinity.js` ou similar **[H]**.
- **Complexidade:** 3 (código simples; o difícil é balancear a curva de progressão — exige ferramentas de simulação/planilha e playtest).
- **MVP:** **4–7 semanas-pessoa**. Premissas: arte placeholder/estilizada simples (ícones, formas), 1 linha de produção, 15–20 upgrades, 1 prestígio. Tirar o salvamento em nuvem do MVP reduz ~1 semana.
- **Backend:** leve (cloud save + leaderboard). **Multiplayer:** nenhum (o leaderboard é assíncrono).
- **Infra:** hosting estático (Cloudflare Pages ou o próprio portal); D1 para saves; auth anônima por token de dispositivo e vínculo opcional por e-mail (Supabase Auth ou magic link). Sem filas, sem LLM.
- **Custo/mês:** 100 MAU **US$0** · 1.000 **US$0–5** · 10.000 **US$5–15** **[H]** (≈20 saves/usuário/dia × 10k = 6M escritas/mês, dentro dos 50M incluídos no D1 **[E]**). Lojas mobile: Apple US$99/ano + Play US$25 único **[H]**.
- **Riscos:**
  - *Escalabilidade:* baixa. Tudo é cliente; a nuvem só guarda blobs.
  - *Segurança:* trapaça em save/leaderboard (o cliente é a autoridade). Mitigação: leaderboard com validação de plausibilidade no servidor; sem economia real entre jogadores.
  - *Terceiros:* regras e revenue share dos portais **[H]**; AdMob/políticas de privacidade (GDPR/LGPD e consentimento de ads; COPPA se houver menores); review das lojas na fase mobile.

---

### C02 — Fathom Freight (strategy/tycoon browser, turnos em tempo real)

- **Stack recomendada:** Bloco G para o mapa/UI. Simulação econômica como **módulo TS determinístico** compartilhado entre cliente e servidor. MVP 100% cliente; v1 (temporada/ranking) com Worker + Cron Trigger + D1 para "ticks" autoritativos no servidor.
  - *Por que não um servidor de jogo (Colyseus/Nakama) já no MVP:* o MVP é single-player; ter um servidor autoritativo desde o dia 1 triplica o escopo.
- **Arquitetura (v1):**
  ```mermaid
  flowchart LR
    C[Cliente PixiJS] -->|ordens| W[Worker API]
    Cron[Cron tick 5-15 min] --> W
    W --> Sim[Sim core TS determinístico]
    W --> D1[(D1: jogadores, contratos, temporada)]
    C -->|poll estado| W
  ```
- **Complexidade:** 4 (economia simulada + balanceamento + time-based ticks; em v1, servidor autoritativo e anti-cheat).
- **MVP:** **6–10 semanas-pessoa** (single-player, mapa fixo). **+6–8** para temporada com ranking autoritativo. Fica acima da meta de 4–8 semanas.
- **Backend:** nenhum no MVP; **médio** na v1 (o estado do jogo vive no servidor). **Multiplayer:** assíncrono (ranking; leilões na v2), sem tempo real.
- **Infra:** Pages + Workers + D1 + Cron; auth Supabase/magic link na v1.
- **Custo/mês:** 100 **US$0** · 1.000 **US$0–10** · 10.000 **US$10–40** **[H]** (os ticks escrevem estado de cada jogador ativo: 10k × 100–300 ticks/mês ≈ 1–3M escritas, dentro da cota **[E]**; o custo dominante é a CPU dos ticks).
- **Riscos:**
  - *Escalabilidade:* ticks em lote no fim da temporada; com muitos jogadores, particionar via Queues.
  - *Segurança:* validação de ordens no servidor; exploits econômicos (são bugs de design, mas viram incidentes técnicos).
  - *Terceiros:* baixo.
  - *Principal:* esforço de balanceamento e escopo.

---

### C03 — Scrapline (factory-lite, mobile + web)

- **Stack recomendada:** Bloco G (PixiJS + TS) com simulação em grid por **tick fixo** (ECS leve, arrays tipados) e Capacitor para mobile. **Compartilhar layouts (v1) sem backend:** serializar o grid em string compacta (URL/código), como fazem vários jogos de automação **[H]**.
  - *Alternativa séria:* **Godot 4** (melhor ergonomia de input touch/grid e export nativo). Recomendo um **spike de 3–5 dias** com o grid touch em PixiJS antes de travar a escolha; se a UX de arrastar/rotacionar peças for ruim em tela de 6", migrar para Godot.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    Input[Touch: tap/drag/pinch] --> Edit[Editor de grid]
    Edit --> Sim[Sim tick fixo 10-20 Hz]
    Sim --> Render[PixiJS + culling]
    Sim --> Save[(local save)]
    Edit --> Share[encode layout → string/URL]
  ```
- **Complexidade:** 4 (UX de grid touch é o maior risco do portfólio de jogos; simulação de esteiras com throughput/backpressure exige testes).
- **MVP:** **5–9 semanas-pessoa** (1 grid, 6 peças, 10 desafios, tutorial).
- **Backend:** nenhum (premium/offline). Leaderboard de eficiência (v2) = leve. **Multiplayer:** nenhum.
- **Infra:** hosting estático; lojas. Se for premium, compra única via lojas (RevenueCat opcional).
- **Custo/mês:** 100 / 1.000 / 10.000 → **US$0 / US$0 / US$0–5** + taxas de loja **[H]**.
- **Riscos:**
  - *Escalabilidade:* nenhuma no servidor; no cliente, o risco é desempenho com grids grandes em Android de entrada (precisa de testes em aparelho real).
  - *Segurança:* mínima.
  - *Terceiros:* review da App Store para jogo pago; pirataria do APK premium **[H]**.

---

### C04 — Pocket Orchard (casual cozy, coleção + idle, mobile-first)

- **Stack recomendada:** Bloco G + Capacitor (ou **Godot** se a arte animada for pesada em spritesheets/esqueletal). IAP via RevenueCat **[H]**, AdMob para rewarded ads. **Tempo do servidor** para timers de crescimento assim que houver IAP (evita adiantar o relógio do aparelho para pular espera).
  - *Por que não Unity:* o volume de arte 2D não exige Unity; o custo de build e iteração é maior **[H]**.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    App[Capacitor app PixiJS] --> Local[(save local)]
    App --> RC[RevenueCat SDK] --> Stores[App Store / Play]
    App --> W[Worker: /time /save] --> D1[(D1)]
    App --> Ads[AdMob]
  ```
- **Complexidade:** 3 em tecnologia. **O gargalo é a arte**, não a engenharia.
- **MVP:** **5–8 semanas-pessoa** de engenharia + **4–8 semanas** de produção de arte original em paralelo (12 variedades × estágios de crescimento + decoração) **[H]**.
- **Backend:** leve (save + tempo autoritativo + validação de recibo via RevenueCat). **Multiplayer:** nenhum no MVP; presentes assíncronos na v2 (leve).
- **Infra:** Workers + D1; RevenueCat; lojas.
- **Custo/mês:** 100 **US$0** · 1.000 **US$0–5** · 10.000 **US$5–20** + taxas de loja (Apple US$99/ano) **[H]**.
- **Riscos:**
  - *Escalabilidade:* baixa.
  - *Segurança:* manipulação de relógio/save afeta a economia de IAP.
  - *Terceiros:* review da App Store para IAP/ads; ATT/consentimento; mobile-first sem web significa nenhum canal de teste barato antes das lojas (dá para mitigar com uma build PWA interna).

---

### C05 — InvoiceLoop (micro-SaaS de cobrança)

- **Stack recomendada:** Bloco W (React SPA + Supabase Postgres/Auth/**RLS**) + Bloco E (Worker com Cron para disparar lembretes) + **Resend** para e-mail (com SES como alavanca de custo em escala **[H]**). **Pagamento no MVP sem integração:** o freelancer cola o próprio link de pagamento (Stripe Payment Link / chave PIX), e o app só o inclui no e-mail. Isso evita **Stripe Connect** (onboarding KYC de cada freelancer e compliance) até a v1.
  - *Por que não D1:* dados financeiros multi-tenant pedem Postgres com RLS, backups e migrações maduras.
  - *Por que não Rails/Laravel monolítico:* exigiria servidor sempre ligado; o custo fixo sobe sem ganho.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    SPA[React SPA] --> SB[(Supabase: Auth + Postgres RLS)]
    Cron[Worker Cron diário/horário] --> SB
    Cron --> Q[Queue de envios] --> Mail[Resend]
    Mail -->|webhook bounce/open| W[Worker webhook] --> SB
    Pay[Link Stripe/PIX do usuário] -.embed.-> Mail
  ```
- **Complexidade:** 3 (multi-tenant + agendamento confiável + entregabilidade de e-mail + dados financeiros).
- **MVP:** **3–5 semanas-pessoa** (fatura, lembretes escalonados por e-mail, link de pagamento colado, dashboard de recebíveis). Previsão de caixa e webhooks Stripe/PIX automáticos (v1): **+2–4**.
- **Backend:** **médio** (jobs agendados, idempotência de envio, webhooks). **Multiplayer:** n/a.
- **Infra:** Pages + Supabase Pro (não usar o Free em produção: pausa por inatividade **[E]**) + Workers Paid (Cron/Queues) + Resend + domínio de envio com SPF/DKIM/DMARC.
- **Custo/mês** (premissa **[H]**: ~60 e-mails/usuário ativo/mês):
  - 100 MAU: Supabase US$25 + Resend Pro US$20 (6k e-mails > 3k free) + Workers US$5 ≈ **US$45–55**.
  - 1.000: US$25–40 + Resend US$35 (60k) + US$5 ≈ **US$65–80**.
  - 10.000: Supabase US$40–85 + e-mail 600k (Resend ≈ US$420 **[E]** pela tabela, ou SES ≈ US$60 **[H]**) + US$5–10 ≈ **US$110–520**.
- **Riscos:**
  - *Escalabilidade:* o e-mail domina o custo e a reputação; um envio duplicado (bug de cron) é um incidente com o cliente do cliente.
  - *Segurança:* dados financeiros e PII de terceiros (LGPD); RLS mal configurada vaza dados entre tenants (exige testes automatizados de RLS).
  - *Terceiros:* reputação de domínio/spam (os lembretes vão para quem não pediu a ferramenta); Stripe Connect/PIX (PSP) na v1; NF-e é complexidade regulatória (fora do escopo).

---

### C06 — StatusPing (monitoramento de uptime + status page)

- **Stack recomendada:** Bloco E integral. **Cron Trigger (1/min) → lê os monitores vencidos no D1 → enfileira lotes em Queues → consumidores fazem `fetch` aos endpoints** (subrequests não são cobradas **[E]**; o `await` de rede não consome CPU faturada **[H]** — só a CPU é cobrada **[E]**). Status pages servidas como HTML gerado/cacheado no Worker. Rollups horários no D1 (não gravar cada check). Painel em React SPA + auth Supabase ou magic link próprio.
  - *Por que não VPS com cron:* um ponto único de falha justamente num produto de confiabilidade; Workers oferecem distribuição e custo quase zero.
  - *Limitação:* Cron/Queues do Cloudflare não deixam escolher a região de origem do check **[H]**. Para multi-região (v1), adicionar 2–3 probes baratos em outro provedor (ex.: Fly.io/VPS de US$4–6/mês **[H]**), o que também cobre o risco de queda correlacionada do Cloudflare.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    Cron[Cron 1/min] --> Sched[Worker scheduler] --> D1[(D1: monitores, estado, rollups)]
    Sched --> Q[Queue lotes de ~50 checks] --> Cons[Worker consumer fetch + retry]
    Cons -->|mudança de estado| Alert[Resend e-mail / webhook]
    Cons --> D1
    Pub[status.<sub>.app] --> Page[Worker status page cache] --> D1
  ```
- **Complexidade:** 3 (o MVP é simples (2), mas confirmação anti-falso-positivo, idempotência de alertas e auto-monitoramento elevam para 3).
- **MVP:** **2–4 semanas-pessoa**.
- **Backend:** **médio** (é o produto). **Multiplayer:** n/a.
- **Infra:** Workers Paid (US$5) + D1 + Queues + Resend; DNS wildcard para subdomínios das status pages.
- **Custo/mês** (premissa **[H]**: média de 3 monitores/usuário, mistura de intervalo de 1 e 5 min ≈ 15k checks/monitor/mês; ~1,5 ms de CPU por check; lotes de 50):
  - 100 MAU (~4,5M checks): **US$5** (dentro das cotas).
  - 1.000 (~45M checks): CPU ≈ 68M ms → ~US$0,8; Queues ≈ 2,7M ops → ~US$0,7; e-mail free/US$20 → **US$7–30**.
  - 10.000 (~450M checks): CPU ~US$13; Queues ~US$11; requests/D1 ~US$5–15; e-mail US$20–35; probes multi-região US$15–30 → **US$70–130**.
  - Se cada check fosse gravado como uma linha no D1: 450M escritas → ~US$400 **[E: US$1/M]**. Por isso, gravar só mudanças de estado e rollups.
- **Riscos:**
  - *Escalabilidade:* limites de subrequests/CPU por invocação (dimensionar o lote) **[H]**; custo cresce linearmente com monitores × frequência (planos pagos devem precificar por isso).
  - *Segurança:* **SSRF/abuso** (usuário aponta checks para IPs privados/metadados, ou usa o serviço como gerador de tráfego contra terceiros). Mitigação: bloquear faixas privadas, limitar frequência, exigir verificação de domínio para intervalos curtos.
  - *Terceiros:* dependência de um único provedor (o monitor cai junto com o Cloudflare); entregabilidade dos alertas por e-mail.

---

### C07 — ReplyDraft (extensão de navegador + IA para rascunhos)

- **Stack recomendada:** **Extensão Chrome MV3** (TS, content script no Gmail web que lê o e-mail aberto no DOM e insere o rascunho na caixa de composição) + **Worker como proxy de LLM** (chave nunca vai para a extensão; autenticação, cota e metering por usuário) + Supabase (auth, perfis de tom, uso) + Stripe Checkout/Billing para a assinatura. LLM padrão: **Claude Haiku 5.5**, com Sonnet 5 como "modo qualidade" no plano superior.
  - *Por que **não** usar a Gmail API:* ler/compor e-mails via API exige escopos **restritos** → verificação + **avaliação de segurança CASA anual** **[E]**. Ler o DOM da aba que o próprio usuário abriu evita OAuth Gmail no MVP. O preço disso é a fragilidade quando o Gmail muda o DOM.
  - *Por que não um add-on do Google Workspace:* usa escopos `gmail.addons.current.*` (não-sensíveis/sensíveis **[E]**), uma alternativa válida para a v1 se o DOM se mostrar frágil; o MVP fica mais lento (Apps Script/Card UI, publicação no Marketplace) **[H]**.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    Gmail[Gmail web DOM] <--> CS[Content script MV3]
    CS --> SW[Service worker ext] -->|JWT| W[Worker proxy /draft]
    W --> SB[(Supabase: user, tom, cota)]
    W --> LLM[Anthropic API Haiku 5.5]
    W -. não persiste conteúdo .-> X((zero retention))
  ```
- **Complexidade:** 2 (o fluxo é curto; o risco está na integração com o DOM e na privacidade).
- **MVP:** **2–4 semanas-pessoa** (extensão + proxy + auth + 1 exemplo de tom + billing simples).
- **Backend:** leve (proxy stateless + cota). **Multiplayer:** n/a.
- **Infra:** Workers + Supabase (Free no beta; Pro em produção) + Stripe + API da Anthropic. Sem filas.
- **Custo de LLM por usuário** (premissa **[H]**: 150 rascunhos/mês/usuário ativo; 3.000 tokens de entrada (prompt de sistema + tom + thread) e 350 de saída):
  - Haiku 5.5: 3.000×US$0,10/M + 350×US$0,50/M ≈ **US$0,0005/rascunho → ~US$0,07/usuário/mês** **[E preço / H volume]**.
  - Sonnet 5: 3.000×US$2/M + 350×US$10/M ≈ **US$0,0095/rascunho → ~US$1,43/usuário/mês**.
  - Prompt caching do bloco fixo (sistema + tom) reduz a entrada **[E: cache hits a 10% do preço base]**.
- **Custo/mês total:** 100 MAU **US$5–40** (Haiku) / até ~US$180 (tudo em Sonnet) · 1.000 **US$100–110** (Haiku) / ~US$1,5k (Sonnet) · 10.000 **US$750–850** (Haiku) / ~US$14,5k (Sonnet). Infra fixa ~US$30–100 nas três faixas. **Conclusão:** Haiku como padrão e Sonnet restrito a plano pago com cota.
- **Riscos:**
  - *Escalabilidade:* trivial (stateless); o custo escala com uso, então impor **cota rígida por plano** no proxy.
  - *Segurança:* o conteúdo dos e-mails é sensível → não logar o corpo, política de retenção zero, verificar a política de retenção de dados da API do provedor **[H]**. **Prompt injection** vinda do e-mail recebido: o modelo só gera texto (sem ferramentas/ações), então o impacto é limitado; inserir a saída como **texto puro** (nunca HTML) na caixa de composição para evitar XSS.
  - *Terceiros:* **Gmail muda o DOM** (quebras silenciosas, exige teste E2E diário); **review da Chrome Web Store** (permissão de host `mail.google.com` e política de dados de usuário/Limited Use **[H]**); mudança de preço/modelo do LLM (abstrair o provedor no proxy).

---

### C08 — FocusRail (timer de foco adaptativo, mobile)

- **Stack recomendada:** Bloco A (**Expo/React Native**), **local-first** (SQLite no aparelho), notificações locais agendadas para o fim do bloco, sem backend no MVP. Sync web (v1) via Supabase.
  - *Por que Expo em vez de Capacitor/PWA:* o roadmap depende de recursos nativos (notificações confiáveis em background, widgets, Live Activities, modo não perturbe). Uma PWA no iOS tem limites de background e de notificação **[H]**.
  - *Adaptação "por IA" (v2):* começa com heurística estatística no aparelho (média móvel das durações concluídas). Não precisa de LLM.
- **Arquitetura:** `App Expo → SQLite local → notificações locais` · v1: `→ Supabase (sync + auth)`.
- **Complexidade:** 2 (MVP). O "modo não perturbe" da v1 sobe para 4: no iOS depende da Screen Time API/FamilyControls (entitlement com aprovação da Apple **[H]**); no Android, da permissão de política de notificação **[H]**.
- **MVP:** **2–4 semanas-pessoa**.
- **Backend:** nenhum (MVP) → leve (sync). **Multiplayer:** n/a.
- **Infra:** lojas; Supabase na v1; RevenueCat para assinatura **[H]**.
- **Custo/mês:** 100 **US$0** · 1.000 **US$0–25** · 10.000 **US$25–40** + Apple US$99/ano **[H]**.
- **Riscos:**
  - *Escalabilidade:* nenhuma.
  - *Segurança:* dados de comportamento (baixo risco).
  - *Terceiros:* timers em background no iOS (o app é suspenso: calcular por timestamps, nunca por contagem em processo); entitlements de bloqueio; review da App Store em categoria saturada. **O diferencial técnico depende de APIs que a Apple controla.**

---

### C09 — Receipt Clear (captura de recibo + OCR + export)

- **Stack recomendada:** Bloco A (Expo, câmera + recorte de documento) + **extração estruturada por LLM com visão** (Haiku 5.5 retornando JSON: valor, data, estabelecimento, categoria sugerida) via proxy em Worker. Armazenamento **local-first** (imagens e dados no aparelho; backup opcional no R2 na v1). Export CSV gerado no aparelho.
  - *Por que não OCR clássico (Tesseract) + regex:* recibos variam demais; o pipeline de regras seria a maior parte do trabalho e frágil **[H]**.
  - *Alternativa offline/grátis:* ML Kit Text Recognition no aparelho + LLM só de texto (mais barato, funciona offline para o OCR) **[H]**. Avaliar em spike.
  - *Oportunidade BR:* cupons NFC-e têm QR code com a chave de acesso → dados exatos via consulta na SEFAZ. Porém os portais variam por estado e podem ter captcha **[H]** — investigar para a v1, não colocar no MVP.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    Cam[Câmera + recorte] --> Img[imagem comprimida ~1MP]
    Img --> W[Worker proxy /extract] --> LLM[Haiku 5.5 vision → JSON]
    LLM --> App[(SQLite local)]
    App --> CSV[export CSV]
    App -. v1 backup .-> R2[(R2)]
  ```
- **Complexidade:** 3 (câmera/recorte, validação da extração, UX de correção manual).
- **MVP:** **3–5 semanas-pessoa** + **1 semana de spike de qualidade** com 50–100 recibos reais (papel térmico, fotos ruins).
- **Backend:** leve (proxy stateless + cota; auth anônima por dispositivo + attestation para limitar abuso **[H]**). **Multiplayer:** n/a.
- **Custo de LLM** (premissa **[H]**: imagem ~1.600 tokens + prompt 200 + saída 150; 30 recibos/usuário/mês): Haiku 5.5 ≈ **US$0,00026/recibo → ~US$0,01/usuário/mês**; Sonnet 5 ≈ US$0,005/recibo → ~US$0,15/usuário/mês **[E preço / H tokens por imagem]**.
- **Custo/mês total:** 100 **US$0–5** · 1.000 **US$5–30** · 10.000 **US$30–150** (Workers Paid + LLM ~US$100 no pior caso + R2 de backup) + Apple US$99/ano **[H]**.
- **Riscos:**
  - *Escalabilidade:* baixa (picos sazonais de IR são absorvidos pelo serverless).
  - *Segurança:* imagens de recibos contêm CPF/endereço (LGPD): não reter imagens no servidor após a extração; consentimento explícito para envio à API de IA.
  - *Terceiros:* qualidade e preço do modelo de visão; política de privacidade de câmera/fotos nas lojas; API de SEFAZ instável (v1).

---

### C10 — Notebrief (captura de voz/texto → resumo + próximos passos)

- **Stack recomendada:** Bloco W como **PWA** no MVP (MediaRecorder no navegador; o iOS Safari suporta gravação em primeiro plano **[H]**) + Bloco E: upload direto para **R2** via URL pré-assinada → **Queue** → Worker consumidor chama **transcrição (gpt-4o-mini-transcribe)** e depois **LLM (Haiku 5.5)** para resumo e próximos passos em JSON → Supabase (notas, auth). Áudio **apagado após a transcrição**. App nativo (Expo) na v1 se a gravação em background/tela bloqueada se mostrar essencial.
  - *Por que transcrição via API e não Whisper no aparelho no MVP:* qualidade/velocidade consistentes sem lidar com WebGPU/modelos de centenas de MB. Whisper local (whisper.cpp/WebGPU) é o **spike da v1** para zerar o custo variável de transcrição **[H]**.
  - *Busca semântica (v1):* pgvector no Supabase (já incluído) **[H]**, sem banco vetorial separado.
- **Arquitetura:**
  ```mermaid
  flowchart LR
    PWA[PWA gravação/texto] -->|presigned PUT| R2[(R2 áudio temporário)]
    PWA --> W[Worker /notes] --> Q[Queue]
    Q --> C[Consumer] --> STT[gpt-4o-mini-transcribe]
    C --> LLM[Haiku 5.5 resumo + ações JSON]
    C --> SB[(Supabase notas, RLS)]
    C -->|delete| R2
  ```
- **Complexidade:** 3 (pipeline assíncrono, gravações longas/chunking, peculiaridades de áudio no iOS).
- **MVP:** **2–4 semanas-pessoa**.
- **Backend:** **médio** (pipeline de jobs com retry/idempotência). **Multiplayer:** n/a.
- **Custo de IA por usuário** (premissa **[H]**: 60 min de áudio/mês por usuário ativo; heavy user 300 min):
  - Transcrição: 60 × US$0,003 = **US$0,18** (gpt-transcribe: US$0,27) **[E preço]**.
  - Resumo com Haiku 5.5: ~12k tokens de entrada + 1,5k de saída/mês ≈ **US$0,002** (Sonnet 5 ≈ US$0,04).
  - **Total ≈ US$0,20/usuário médio; ~US$0,95 para heavy user.** A transcrição é ~90% do custo variável, então o tier grátis deve ser limitado por **minutos**.
- **Custo/mês total:** 100 MAU **US$25–60** · 1.000 **US$230–350** · 10.000 **US$2,1k–3,5k** (inclui Supabase Pro, Workers Paid e R2; faixa superior com mais heavy users) **[H volume]**.
- **Riscos:**
  - *Escalabilidade:* custo variável linear. Mitigação: limitar a duração por gravação, cotas por plano e Batch API (−50% **[E]**) para resumos não urgentes.
  - *Segurança:* voz e conteúdo de reuniões são altamente sensíveis (podem incluir terceiros gravados → consentimento) e exigem política de retenção. Apagar o áudio é obrigatório no design.
  - *Terceiros:* dois provedores de IA (transcrição + LLM): abstrair os dois; limitações de áudio no iOS em PWA **[H]**; concorrência de recursos nativos do SO/Big Tech **[H]**.

---

## 3. Tabela comparativa

| Conceito | Stack | Complex. (1–5) | MVP (sem.-pessoa) | Custo/mês @1k MAU | Risco técnico principal | Viabilidade (1–5) |
|---|---|---|---|---|---|---|
| C01 Loopwright | TS + PixiJS + Preact (PWA) · Worker+D1 · Capacitor | 3 | 4–7 | US$0–5 | Balanceamento de progressão (design/ferramentas), não infra | **5** |
| C02 Fathom Freight | TS + PixiJS · sim determinística · Worker+Cron+D1 (v1) | 4 | 6–10 (+6–8 p/ temporada) | US$0–10 | Escopo/balanceamento econômico; servidor autoritativo na v1 | 2 |
| C03 Scrapline | TS + PixiJS + Capacitor (plano B Godot) | 4 | 5–9 | US$0 | UX de grid touch e desempenho em Android de entrada | 3 |
| C04 Pocket Orchard | TS + PixiJS + Capacitor · RevenueCat · Worker+D1 | 3 | 5–8 (+4–8 arte) | US$0–5 | Pipeline de arte; manipulação de relógio com IAP | 3 |
| C05 InvoiceLoop | React SPA · Supabase (RLS) · Worker Cron/Queue · Resend | 3 | 3–5 | US$65–80 | Entregabilidade de e-mail + segurança multi-tenant de dados financeiros | 3 |
| C06 StatusPing | Workers Cron + Queues + D1 · Resend | 3 | 2–4 | US$7–30 | SSRF/abuso e confiabilidade (falsos positivos, provedor único) | 4 |
| C07 ReplyDraft | Ext. Chrome MV3 · Worker proxy · Supabase · Haiku 5.5 | 2 | 2–4 | US$100–110 (Haiku) | Fragilidade do DOM do Gmail + review da Chrome Web Store + privacidade | 4 |
| C08 FocusRail | Expo RN · SQLite local · (Supabase v1) | 2 (4 c/ DND) | 2–4 | US$0–25 | Diferencial depende de APIs nativas controladas pela Apple | 3 |
| C09 Receipt Clear | Expo RN · Haiku 5.5 vision via Worker · SQLite/R2 | 3 | 3–5 (+1 spike) | US$5–30 | Qualidade de extração em recibos térmicos/fotos ruins | 3 |
| C10 Notebrief | PWA · R2 + Queue · gpt-4o-mini-transcribe + Haiku 5.5 · Supabase | 3 | 2–4 | US$230–350 | Custo variável de transcrição + privacidade de áudio | 4 |

*A viabilidade avalia só a parte técnica (esforço × custo × risco técnico/de terceiros). Não avalia mercado nem monetização.*

---

## 4. Ranking técnico — Top 3

1. **C01 Loopwright: viabilidade 5.** Menor custo de infra do portfólio (~US$0 até milhares de usuários), nenhuma dependência crítica de API de terceiros, web-first (testável sem review de lojas), stack 100% TS que agentes de IA dominam, e o motor (sim core + saves + leaderboard) é reaproveitável para C03/C04. O risco é de design (curva de progressão), mitigável com ferramentas de simulação.
2. **C07 ReplyDraft: viabilidade 4.** MVP mais curto (2–4 semanas), backend stateless e custo de LLM baixíssimo com Haiku 5.5 (~US$0,07/usuário/mês **[E preço]**). Evitar a Gmail API (CASA anual **[E]**) é decisão de arquitetura obrigatória. O risco principal é a fragilidade do DOM do Gmail e a review da Chrome Web Store.
3. **C10 Notebrief: viabilidade 4.** MVP curto como PWA, pipeline serverless simples e custo de IA previsível (~US$0,20/usuário médio **[E preço / H volume]**) e controlável por cota de minutos. O risco é margem (transcrição) e privacidade de áudio.

*Menção honrosa:* **C06 StatusPing** (4). Tecnicamente barato e simples no Cloudflare, mas exige cuidado com SSRF/abuso e vende confiabilidade a partir de um único provedor.

**Recomendação de engenharia:** qualquer que seja o finalista, construir os blocos **E (Worker proxy/cron)** e **W/G** como pacotes internos reaproveitáveis. O custo marginal do segundo produto cai bastante **[H]**.

---

## 5. Spikes recomendados antes de comprometer o MVP (não executados)

| Conceito | Spike | Duração | Critério de sucesso |
|---|---|---|---|
| C01 | Simulador headless da curva de progressão (TS, roda 30 dias de jogo em segundos) | 2–3 dias | Tempo até o 1º prestígio entre 2–4 h de jogo ativo/idle combinados |
| C03 | Grid touch em PixiJS num Android de entrada | 3–5 dias | Arrastar/rotacionar sem erro de toque; 60 fps com grid de 20×30 |
| C07 | Content script no Gmail: ler a thread aberta e inserir texto no compose | 1–2 dias | Funciona em conversa, resposta e encaminhamento; texto puro inserido |
| C09 | 50–100 recibos reais BR → Haiku 5.5 vision vs ML Kit + LLM texto | 3–5 dias | ≥90% de acerto em valor/data **[H meta]** |
| C10 | Gravação PWA no iOS Safari + Whisper local vs API | 2–3 dias | Gravação de 30 min estável; comparar custo × qualidade |

---

## 6. Limitações

- **web_search não foi usado** (erro 429 conhecido nesta sessão). Os preços vieram de **web_fetch em páginas oficiais em 2026-11-08** e estão marcados [E]. Valores de lojas (Apple/Play/Chrome), R2, SES, RevenueCat e a política do Vercel ficaram **[H]**: as páginas lidas não exibiam os números.
- **Volumes de uso por usuário** (rascunhos, minutos de áudio, recibos, e-mails, monitores) são **premissas [H]**. Os custos de IA escalam linearmente com elas e devem ser recalibrados com dados de beta.
- **Semanas-pessoa** são estimativas de engenharia sem histórico de velocidade do estúdio. Excluem arte final (exceto C04, estimada à parte), review de lojas, jurídico e marketing.
- A qualidade dos modelos (Haiku 5.5 para rascunho/visão; gpt-4o-mini-transcribe para PT-BR) **não foi testada**. Os spikes da seção 5 são pré-requisito.
- Nenhum spike foi executado e nenhuma conta, deploy ou serviço pago foi criado.
