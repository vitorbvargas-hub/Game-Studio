# Ambientes

> Padrão documental. Depende da recomendação (C) Híbrido em `shared/standards/INFRASTRUCTURE.md`, que **aguarda aprovação do fundador**. Nenhum ambiente remoto foi criado ainda.

## Os três ambientes

| | Local | Homologação (staging/preview) | Produção |
|---|---|---|---|
| Objetivo | desenvolver e testar | QA, demo para o fundador, beta fechado | usuários reais |
| Front | `vite dev` / `astro dev` | **Preview do Cloudflare Pages por branch/PR** (URL `*.pages.dev`) | Cloudflare Pages, branch `main` + domínio próprio |
| API de borda | `wrangler dev` (Miniflare local) | Worker `<app>-staging` (`wrangler deploy --env staging`) | Worker `<app>` (`--env production`) |
| D1 / KV / R2 | locais do `wrangler dev` (`--local`) | bindings `*-staging` separados | bindings de produção |
| Supabase | `supabase start` (Docker local, se instalado) **ou** projeto Free de dev | **projeto Supabase separado** `<app>-staging` (Free é aceitável) | projeto `<app>-prod` (**Pro**: sem pausa, com backup) |
| Dados | seeds sintéticos | seeds sintéticos e **nunca cópia de PII de produção** | reais |
| Quem acessa | dev | estúdio + fundador (+ beta testers aprovados) | público, só após Launch Approval |

## Regras

1. **Um projeto/binding por ambiente.** Homologação e produção nunca compartilham banco, bucket ou namespace KV.
2. **Segredos fora do git.** Local: `.dev.vars` / `.env.local` (no `.gitignore`). Remoto: `wrangler secret put`, variáveis do Pages e secrets do GitHub Actions. Commitar só `.env.example` com nomes, sem valores.
3. **Nomenclatura:** `gs-NNN-<app>-<env>`, com `<env>` ∈ {`staging`, `prod`}.
4. **Configuração por ambiente** em `wrangler.toml` (`[env.staging]`, `[env.production]`) e `supabase/config.toml`. Nada de `if (prod)` espalhado no código.
5. **PII não sai de produção.** Para depurar, usar dados sintéticos ou anonimizados.
6. **Previews são públicos por padrão** (URL difícil de adivinhar, mas acessível). Para conteúdo não lançado, proteger com Cloudflare Access (free até um limite de usuários **[H — verificar]**) ou aceitar o risco explicitamente.
7. Docker não está instalado no host hoje (ver `GOVERNANCE.md`). Até isso mudar, o Supabase local usa um **projeto Free de dev**, e instalar Docker exige decisão própria.

## Estrutura sugerida por projeto

```
projects/<fase>/GS-NNN/
  app/                 # front (Vite/Astro)
  worker/              # API de borda (Hono) + wrangler.toml
  supabase/            # migrations/, seed.sql, config.toml (se usar Supabase)
  .env.example
```
