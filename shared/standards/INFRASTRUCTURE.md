# Padrão de Infraestrutura — Game Studio

> Autor: game-dev (Chief Software Engineer) · Data: 2026-11-08 · Status: **proposta, aguarda aprovação do fundador**
> Pergunta do fundador: *"Qual é melhor: Git com Cloudflare, ou direto no Git com Supabase e Vercel?"*
> Convenção: **[E]** = evidência com fonte e data · **[H]** = hipótese/estimativa não verificada.

---

## TL;DR

**Recomendação: (C) Híbrido.** GitHub como repositório e CI. **Cloudflare** (Pages/Workers Static Assets, Workers, R2) para hospedar tudo o que é servido ao público: jogos HTML5, landings, SPAs e APIs de borda. **Supabase** (região São Paulo, `sa-east-1`) **só quando o produto precisar** de auth, dados relacionais ou dados pessoais (SaaS, apps com conta). **Vercel não entra como padrão**: o plano gratuito proíbe uso comercial, e anúncios contam como comercial. Isso força o Pro, a US$20 por desenvolvedor por mês, desde o primeiro produto monetizado, sem ganho técnico para a nossa stack (SPA/estático, sem Next.js SSR).

Resposta direta: **"Git + Cloudflare" para hospedar; Supabase para banco/auth quando houver demanda; Vercel fora.**

---

## 1. Escopo do portfólio considerado

| Tipo | Exemplos (GS-001) | Necessidade típica |
|---|---|---|
| Jogos web/HTML5 | C01–C04 | Muitos assets estáticos, alto tráfego e egress; backend leve (save/leaderboard) |
| Landings / sites de produto | todos | Estático, previews, domínio próprio |
| Apps web / SaaS | C05, C06, C10 | Auth, Postgres, RLS, jobs agendados, e-mail, PII (LGPD) |
| Extensões de navegador | C07 | Proxy de API (segredo no servidor), auth, cota |

Fonte: `projects/discovery/GS-001/TECHNICAL_FEASIBILITY.md` (Blocos G/W/E).

---

## 2. Opções avaliadas

- **(A) GitHub + Cloudflare**: Pages/Workers (front + API), D1 (SQLite), KV, R2, Queues, Cron. Auth própria ou de terceiros.
- **(B) GitHub + Vercel + Supabase**: Vercel (front + functions), Supabase (Postgres, Auth, Storage, Edge Functions).
- **(C) Híbrido**: Cloudflare para estático, assets e borda; Supabase para auth e dados relacionais/PII. Vercel não é usado.

---

## 3. Preços e limites verificados (2026-11-08)

Todas as linhas abaixo são **[E]**, lidas via `web_fetch` nas páginas oficiais em 2026-11-08, exceto onde marcado.

### Cloudflare

| Item | Free | Primeiro degrau pago | Fonte |
|---|---|---|---|
| Pages: builds | 500/mês, 1 build por vez | Pro (plano de domínio): 5.000/mês | developers.cloudflare.com/pages/platform/limits (atualizado em 2026-09-05) |
| Pages: arquivos por site | 20.000; **máx. 25 MiB por arquivo** | 100.000 | idem |
| Pages: previews | **ilimitados** | ilimitados | idem |
| Pages: projetos | 100 por conta | — | idem |
| Workers: requisições | 100k/dia; 10 ms de CPU por invocação | **US$5/mês por conta**: 10M req + 30M CPU-ms incluídos; depois US$0,30/M req e US$0,02/M CPU-ms | developers.cloudflare.com/workers/platform/pricing (atualizado em 2026-10-02) |
| Static assets (Workers/Pages) | **requisições grátis e ilimitadas** | idem | idem |
| Egress/bandwidth | **sem cobrança** de egress no Workers Paid | idem | idem |
| D1 | 5M linhas lidas/dia, 100k escritas/dia, 5 GB no total, 10 bancos | 25 bi lidas e 50M escritas/mês; 5 GB + US$0,75/GB-mês | idem |
| KV | 100k leituras/dia, 1k escritas/dia, 1 GB | 10M leituras e 1M escritas/mês; 1 GB + US$0,50/GB-mês | idem |
| R2 | 10 GB-mês, 1M ops classe A, 10M classe B | US$0,015/GB-mês; **egress grátis** | developers.cloudflare.com/r2/pricing (atualizado em 2026-10-30) |
| Workers Logs | 200k eventos/dia, retenção de 3 dias | 20M/mês + US$0,60/M, retenção de 7 dias. **A precificação muda em 2026-12-01** (Observability pricing) | workers/platform/pricing |
| Uso comercial no Free | permitido: não há cláusula de "não comercial" nas páginas de limites/preços lidas | — | **[H]**: os Termos de Serviço completos não foram lidos nesta sessão |

### Vercel

| Item | Hobby (Free) | Pro | Fonte |
|---|---|---|---|
| Preço | US$0 | **US$20/mês por developer seat** | vercel.com/pricing (2026-11-08) |
| Uso comercial | **PROIBIDO**: "Hobby teams are restricted to non-commercial personal use only". Contam como comercial: cobrar visitantes, anunciar produto/serviço, **"inclusion of advertisements… like Google AdSense"** e afiliados como propósito principal. Doações não contam. | permitido | vercel.com/docs/limits/fair-use-guidelines (atualizado em 2026-09-14) |
| Fast Data Transfer | 100 GB/mês | 1 TB/mês incluído; depois a partir de US$0,15/GB | vercel.com/pricing |
| Funções | 1M invocações, 4 h de Active CPU | por uso (US$0,60/M invocações) | idem |
| Seats | 1 developer | US$20 cada; viewers ilimitados | idem |
| Região no Brasil | `gru1` (São Paulo) disponível para compute | idem | vercel.com/docs/regions (atualizado em 2026-08-11) |

> Hipótese anterior de GS-001 ("Vercel Hobby proíbe uso comercial **[H]**") agora **confirmada [E]**.

### Supabase

| Item | Free | Pro | Fonte |
|---|---|---|---|
| Preço | US$0 | **a partir de US$25/mês** (org). Inclui US$10 de compute, que cobre 1 projeto Micro. Cada projeto adicional soma +US$10 (Micro) | supabase.com/pricing (2026-11-08) |
| Projetos | **2 projetos ativos**; **pausa após 1 semana de inatividade** | sem pausa | idem |
| Banco | 500 MB | 8 GB de disco por projeto, depois US$0,125/GB | idem |
| Auth | 50k MAU | 100k MAU, depois US$0,00325/MAU | idem |
| Egress | 5 GB (+5 GB em cache) | 250 GB, depois US$0,09/GB | idem |
| Storage | 1 GB | 100 GB | idem |
| Backups | **não incluídos** | diários, retidos por 7 dias; PITR por US$100/mês para cada 7 dias | idem |
| Logs | retenção de 1 dia | 7 dias | idem |
| Região no Brasil | **`sa-east-1` (São Paulo)** disponível | idem | supabase.com/docs/guides/platform/regions (2026-11-08) |

### Latência / região do dado (Brasil)

- **Cloudflare D1 não roda na América do Sul**: "D1 location hints are not currently supported for South America (`sam`)… D1 databases do not run in these locations" **[E]** (developers.cloudflare.com/d1/configuration/data-location, atualizado em 2026-10-02). Um usuário no Brasil escrevendo em D1 sai do país (provavelmente para `enam`). Estimativa de **+100–150 ms de RTT** por escrita **[H]**. As leituras podem usar réplicas, mas também fora da América do Sul.
- **Supabase `sa-east-1`** e **Vercel `gru1`** ficam em São Paulo **[E]**.
- A **CDN da Cloudflare** tem PoPs no Brasil, então o estático é servido localmente **[H]**: a página oficial de data centers não foi lida nesta sessão. Para jogos, o que pesa é a CDN, e as três opções empatam nesse ponto.

---

## 4. Comparação por critério

Notas de 1 (pior) a 5 (melhor) para o **portfólio do estúdio**, não para um app isolado.

| Critério | (A) GitHub + Cloudflare | (B) GitHub + Vercel + Supabase | (C) Híbrido CF + Supabase |
|---|---|---|---|
| **Custo free tier** | 5: estático ilimitado, previews ilimitados, sem egress | 2: Hobby inutilizável para produto monetizado [E]; Supabase Free pausa [E] | 5: estático grátis; Supabase só quando há demanda |
| **1º degrau pago** | 5: US$5/mês por conta para Workers/D1/KV/Queues | 2: US$20 por dev/mês (Vercel) + US$25/mês (Supabase) = **US$45+/mês**, mesmo para um jogo com anúncio | 4: US$0–5/mês para jogos/landings; +US$25/mês só quando um SaaS for a produção |
| **Uso comercial no free** | 5: sem restrição encontrada [H nos ToS] | 1: proibido no Hobby [E] | 5 |
| **Egress de assets de jogo** | 5: sem cobrança [E] | 3: 100 GB no Hobby, 1 TB no Pro, depois US$0,15/GB [E] | 5 |
| **Banco** | 3: D1 é SQLite, bom para saves/leaderboards; fraco para multi-tenant/RLS; **fora do Brasil** [E] | 5: Postgres + RLS + pgvector em São Paulo | 5: D1 para dados leves de jogo e Postgres para SaaS |
| **Auth** | 2: não há auth gerenciada pronta; seria construída à mão ou com lib (risco de segurança) | 5: Supabase Auth (50k MAU free) | 5: Supabase Auth |
| **Lock-in** | 3: Workers/D1/KV são APIs proprietárias. Mitigação: Hono e SQL padrão | 3: Vercel é baixo para SPA; Supabase é baixo (é Postgres; `pg_dump` portável) | 3–4: estático é portátil; Postgres é portátil; o lock-in fica restrito aos Workers |
| **DX** | 4: Wrangler, previews por branch, um só painel | 5: a melhor DX para Next.js; integração Vercel↔Supabase | 4: dois painéis e dois CLIs (wrangler + supabase) |
| **Previews por branch** | 5: ilimitados [E] | 5 (Vercel) | 5 no front. Banco: branching do Supabase é pago (US$0,01344/branch-hora [E]); usar projeto de homologação |
| **Latência no Brasil** | 4 estático / 2 escrita em D1 | 5: gru1 + sa-east-1 | 5 estático / 5 dados em sa-east-1 |
| **LGPD** | 2: PII em D1 fica fora do Brasil, sem escolha de região na América do Sul | 4: dados em São Paulo | 4: **PII só no Supabase sa-east-1**; D1/KV sem PII |
| **Total (máx. 55)** | **43** | **40** | **50** |

### Notas de LGPD (todas as opções)

- A LGPD **não exige** que os dados fiquem no Brasil. A transferência internacional é permitida com mecanismo adequado (cláusulas-padrão etc.). Hospedar em São Paulo **reduz** a superfície regulatória, mas não substitui: base legal, política de privacidade, DPA com os fornecedores, registro de operações, minimização e canal do titular **[H — revisão jurídica obrigatória antes do primeiro produto com cadastro]**.
- A região do Supabase "é controle de localização, não prova de conformidade" **[E]** (supabase.com/docs/guides/platform/regions).
- Os logs (Cloudflare/Supabase/Sentry) podem conter IP/e-mail, que são dado pessoal. Mascarar PII nos logs e nos eventos de erro.

---

## 5. Recomendação

### Adotar (C) Híbrido como padrão do estúdio

| Camada | Padrão | Quando usar |
|---|---|---|
| Código / CI | **GitHub** (org do estúdio, repos privados) + GitHub Actions | sempre |
| Jogos HTML5, landings, SPAs | **Cloudflare Pages** ou **Workers Static Assets** | sempre que houver deploy web |
| Assets > 25 MiB ou de alto volume | **Cloudflare R2** (bucket público em subdomínio) | jogos com assets pesados |
| API de borda / proxy de LLM / cron / filas | **Cloudflare Workers** (Hono) | quando houver segredo no servidor, cota ou job |
| Dados leves de jogo **sem PII** (save anônimo, leaderboard) | **D1 / KV** | jogos com backend leve |
| Auth, dados relacionais, multi-tenant, **qualquer PII** | **Supabase** (`sa-east-1`, **org separada do estúdio**) | SaaS/apps com conta |
| Vercel | **não adotar** | reavaliar só se um produto exigir Next.js SSR/ISR e o ganho justificar US$20 por dev/mês (com ADR) |

### Regras derivadas

1. **PII nunca em D1/KV/R2 público.** PII vai para o Postgres do Supabase com RLS testada.
2. **Supabase Free só para desenvolvimento e homologação.** Em produção, Pro, porque o Free pausa e não tem backup [E].
3. **Org do Supabase do estúdio separada** da que o fundador já usa em outro projeto. O limite de 2 projetos ativos no Free pode ser compartilhado por conta/org **[H — confirmar no painel ao criar]**. Nada do estúdio toca o projeto existente.
4. **Front sempre como build estático** (Vite/Astro). Isso mantém a saída de qualquer provedor barata (lock-in baixo).
5. **Escrever SQL portátil** e usar Hono nos Workers. Isso mantém aberta a troca Workers↔Node.
6. Custos acima do free tier exigem um registro em `portfolio/performance/COSTS.md` **antes** de contratar.

### Custo esperado ([H], a partir dos preços [E] acima)

| Fase do portfólio | Custo mensal de infra |
|---|---|
| Discovery / protótipos / jogos sem backend | **US$0** |
| Jogo com save/leaderboard ou proxy de API em produção | **US$0–5** (Workers Paid quando passar de 100k req/dia ou precisar de Queues/CPU > 10 ms) |
| Primeiro SaaS em produção | **US$30–35** (Supabase Pro US$25 + Workers US$5 + domínio/e-mail à parte) |
| Cada SaaS adicional na mesma org Supabase | **+US$10** (compute Micro) + uso |

Comparação: com (B), o primeiro jogo com anúncio já custaria **≥ US$20/mês** (Vercel Pro) [E].

---

## 6. O que precisa de aprovação do fundador

Nada abaixo foi feito. Nenhuma conta, domínio ou serviço foi criado.

| # | Ação | Custo | Observação |
|---|---|---|---|
| 1 | Criar a **organização GitHub** do estúdio | US$0 (Free) | Repos privados. Usar e-mail/conta do estúdio, não credenciais pessoais |
| 2 | Criar a **conta Cloudflare** do estúdio | US$0 | Ativar 2FA. Tokens de API com escopo mínimo, guardados fora do repo |
| 3 | Criar a **org Supabase do estúdio** (separada) | US$0 no início | Região `sa-east-1` |
| 4 | **Registrar domínio(s)** + DNS na Cloudflare | ~US$10–15/ano por `.com` **[H]**; `.com.br` no Registro.br **[H]** | Compra e DNS exigem aprovação (GOVERNANCE) |
| 5 | **Workers Paid** | US$5/mês | Só quando um produto aprovado ultrapassar o free |
| 6 | **Supabase Pro** | US$25/mês + US$10 por projeto extra | Só no primeiro produto com dados de usuário indo a produção |
| 7 | Serviços de suporte (Sentry, Resend, Stripe etc.) | free no início | Ver `shared/platform-components/README.md` |
| 8 | **Revisão jurídica de LGPD** (política de privacidade, termos, DPA) | a definir | Antes do primeiro cadastro de usuário real |
| 9 | **Publicação em produção** de qualquer produto | — | Sempre aprovação explícita (Launch Approval) |

---

## 7. Limitações desta análise

- Preços e limites lidos em 2026-11-08 nas páginas oficiais. Eles mudam: **reverificar antes de contratar**. Os Workers Logs mudam de modelo em 2026-12-01 [E].
- Não foram lidos os Termos de Serviço completos da Cloudflare (uso comercial no free marcado como [H]) nem a lista de PoPs no Brasil.
- Latências são estimativas [H]. Nenhum teste de latência ou spike foi executado.
- LGPD: análise técnica, **não é parecer jurídico**.
- Preço de domínio [H]. O limite de projetos do Supabase Free entre orgs da mesma pessoa [H].
