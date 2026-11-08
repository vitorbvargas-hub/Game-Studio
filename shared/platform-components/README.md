# Catálogo de Componentes de Plataforma

> Autor: game-dev · Data: 2026-11-08 · Base: `shared/standards/INFRASTRUCTURE.md` (opção C: Cloudflare + Supabase, **aguarda aprovação**).
> **Todos os componentes estão com status "não implementado".** Este catálogo é um mapa de decisão, não um backlog.

## Regra principal

> **Não construir plataforma universal antes de demanda real.**
> Um componente só é extraído para `shared/` quando **2 produtos aprovados** precisarem dele de fato (regra de três: na 1ª vez, construir dentro do produto; na 2ª, copiar; na 3ª, extrair). Até lá cada produto usa a solução gerenciada recomendada abaixo, direto, com o mínimo de código de cola. Nada aqui justifica atrasar um MVP.

Outras regras:
- Preferir serviço gerenciado com free tier ou biblioteca open-source madura a construir. Qualquer serviço pago exige aprovação do fundador.
- **Licenças marcadas [H] foram verificadas nesta sessão apenas por conhecimento prévio.** Confirmar o arquivo `LICENSE` do repositório antes de adotar. Evitar AGPL em código distribuído/hospedado nosso sem análise.
- Nenhum componente guarda segredo no cliente (front, jogo, extensão).

---

## Catálogo

| # | Componente | Solução recomendada | Alternativa | Dependências | Segurança | Licença | Limitações | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | **Auth** | **Supabase Auth** (e-mail/magic link, OAuth Google; 50k MAU free / 100k no Pro [E]) | Jogos: token anônimo por dispositivo no Worker, sem conta | Supabase (`sa-east-1`) | RLS em todas as tabelas; `service_role` só no servidor; rate limit no login; MFA básica disponível [E] | Serviço gerenciado; servidor de auth open-source [H: MIT] | MFA por telefone é paga (US$75/mês [E]); e-mail transacional próprio exige SMTP (ver #5) | não implementado |
| 2 | **Cadastro / perfil** | Tabela `profiles` no Postgres ligada a `auth.users` + formulário no front | — | #1 | Coletar o mínimo (LGPD); consentimento registrado com data/versão dos termos; exclusão de conta pelo titular | código próprio (pequeno) | Termos e política de privacidade exigem revisão jurídica | não implementado |
| 3 | **Pagamentos / assinaturas** | SaaS/extensão: **Stripe Checkout + Billing + Customer Portal** (hospedado, sem PCI no nosso código). Jogos web: **SDK do portal** (CrazyGames/Poki) para anúncios/rewarded. Mobile: IAP das lojas (+ RevenueCat opcional) | Mercado Pago (Pix/boleto, público BR) **[H]** | Worker para webhooks (assinatura verificada, idempotência) + tabela `subscriptions` | Nunca tocar dados de cartão; validar a assinatura do webhook; não confiar em status vindo do cliente | Serviços proprietários; taxas por transação **[H — verificar antes]** | Conta Stripe/MP = conta financeira → **aprovação do fundador**; Pix via Stripe no BR **[H]** | não implementado |
| 4 | **Analytics** | Tráfego: **Cloudflare Web Analytics** (sem cookies) **[H: grátis]**. Produto/funil: **PostHog Cloud** (free tier) ou **Umami** self-host | Plausible (AGPL [H]) | snippet no front; eventos nomeados por produto | Sem PII em eventos; IP anonimizado; banner de consentimento quando houver cookies/ads (LGPD) | PostHog [H: MIT no core]; Umami [H: MIT] | Free tiers e retenção não verificados nesta sessão [H]; self-host exige servidor | não implementado |
| 5 | **Notificações** | E-mail transacional: **Resend** (citado em GS-001) com domínio próprio + SPF/DKIM/DMARC. Push web: **Web Push API + VAPID** (padrão aberto) enviado por Worker. Jogos mobile: notificações locais | Amazon SES em escala [H] | domínio (#aprovação), Worker, Cron | Unsubscribe obrigatório; não enviar sem opt-in; chaves só no servidor | Resend: proprietário; Web Push: padrão W3C | Free do Resend [E em GS-001: 3k/mês]; push no iOS só para PWA instalada [H] | não implementado |
| 6 | **Admin / backoffice** | **Supabase Studio** (interno, só o fundador e o estúdio) para leitura/ajustes. Se precisar de UI própria: **React-admin** ou **Refine** sobre a API | — | #1, papéis `admin` via claims/RLS | Acesso a prod apenas leitura por padrão; ações destrutivas exigem aprovação; trilha de auditoria | React-admin [H: MIT]; Refine [H: MIT] | Studio não é para operadores externos | não implementado |
| 7 | **Feature flags** | Início: **flags em config por ambiente** (`wrangler.toml`/KV ou tabela `flags`), sem serviço | **PostHog flags** (se #4 = PostHog); GrowthBook / Unleash self-host | KV ou Postgres | Flags avaliadas no servidor para tudo que libera acesso/preço | GrowthBook [H: MIT core]; Unleash [H: Apache-2.0 core] | Sem segmentação avançada até haver demanda | não implementado |
| 8 | **Logs** | **Workers Logs** + **Supabase Logs** (inclusos) [E] | Logpush/Log Drain (pagos) | — | Sem PII; JSON estruturado; `release` = tag git | incluso no provedor | Retenção curta (1–7 dias) [E]; o modelo de preço dos Workers Logs muda em 2026-12-01 [E] | não implementado |
| 9 | **Monitoramento / erros** | **Sentry** (Developer free) + uptime via Cron Worker ou serviço externo free | GlitchTip self-host [H] | SDK no front/Worker; source maps no CI | Scrubbing de PII; source maps privados | Sentry SaaS (proprietário; código-fonte sob licença de source-available [H]) | Cota do free não confirmada [H] | não implementado |
| 10 | **Deploy / CI** | **GitHub Actions** + `wrangler` + `supabase` CLI; Environment `production` com aprovação do fundador | integração Git nativa do Cloudflare Pages | org GitHub, tokens com escopo mínimo | Segredos em GitHub Secrets; branch protegida; produção só por tag aprovada | ferramentas open-source [H: wrangler MIT/Apache, supabase CLI MIT] | Cota de minutos do Actions em repo privado [H] | não implementado |
| 11 | **Design system** | Apps/SaaS: **Tailwind CSS + shadcn/ui (Radix)**, com componentes copiados para o projeto e sem dependência de runtime extra. Jogos: UI kit leve próprio em PixiJS/Preact, só quando o 2º jogo pedir | — | React/Vite | Acessibilidade (Radix); conteúdo do usuário sem `dangerouslySetInnerHTML` | Tailwind [H: MIT]; shadcn/ui [H: MIT]; Radix [H: MIT] | Tokens de marca dependem do game-art | não implementado |
| 12 | **Template de landing** | **Astro** estático no Cloudflare Pages: hero, benefícios, prova, CTA, lista de espera (form → Worker → Postgres/KV), política de privacidade, OG tags | HTML/Vite puro | Pages; #4; #5 (confirmação da lista) | Formulário com rate limit + Turnstile (anti-bot Cloudflare) **[H: grátis]**; double opt-in | Astro [H: MIT] | Textos legais exigem revisão; domínio exige aprovação | não implementado |

---

## Quando um item muda de status

1. Um produto aprovado (pós-Launch Approval ou em MVP aprovado) precisa do componente → implementa **dentro do produto**, seguindo esta tabela.
2. O segundo produto precisa → avaliar a extração; registrar um ADR em `shared/decisions/`.
3. Extraído → criar `shared/platform-components/<componente>/` com README (uso, versão, dono, testes) e atualizar o status aqui para `implementado (vX)`.

## Limitações

- Preços citados como [E] vêm de `shared/standards/INFRASTRUCTURE.md` e de GS-001 (2026-11-08). Os demais free tiers (PostHog, Umami, Sentry Developer, Cloudflare Web Analytics, Turnstile, GitHub Actions) **não foram verificados** nesta sessão.
- Licenças: [H]. Confirmar antes de adotar.
