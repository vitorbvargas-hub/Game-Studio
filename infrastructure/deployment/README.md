# Fluxo de Deploy

> Padrão documental, condicionado à aprovação de `shared/standards/INFRASTRUCTURE.md` (opção C). Nenhum pipeline foi configurado.

## Fluxo

```
branch feature/*  ──push──►  CI (lint, typecheck, testes, build)
        │
        └──PR──►  Preview automático (Cloudflare Pages por branch + Worker staging)
                       │
                       ├─ QA (game-qa) valida no preview → QA_REPORT.md
                       └─ merge em main  ──►  deploy em HOMOLOGAÇÃO (staging)
                                                   │
                                   APROVAÇÃO EXPLÍCITA DO FUNDADOR
                                                   │
                                   tag vX.Y.Z  ──►  deploy em PRODUÇÃO
```

## Regras

1. **Produção só com aprovação explícita do fundador** (GOVERNANCE: "Publicação em produção"). Implementação: job de produção disparado por **tag** e protegido por **GitHub Environment `production` com required reviewer = fundador**. Agentes nunca disparam produção.
2. **`main` protegida:** sem push direto. PR com CI verde.
3. **Previews:** todo PR gera preview (Pages, ilimitado no free [E]). Os previews usam **só** recursos de staging.
4. **Ordem do deploy com banco:** (a) migration compatível para trás → (b) deploy do Worker/API → (c) deploy do front. Nunca uma migration destrutiva no mesmo release em que o código ainda a usa (ver `../database/README.md`).
5. **Rollback:** Pages e Workers mantêm versões anteriores. Rollback de código = promover o deploy anterior (painel ou `wrangler rollback`). Banco **não** tem rollback automático: só migration corretiva.
6. **Artefatos reproduzíveis:** lockfile commitado, versão de Node fixada (`.nvmrc`), build no CI e não na máquina local.
7. **Checklist de release** (no PR de release): changelog, migrations revisadas, variáveis/segredos de prod presentes, QA_REPORT aprovado, plano de rollback, monitoramento ativo.
8. **Jogos em portais** (CrazyGames/Poki/itch.io): o pacote é gerado pelo CI, mas o **upload é publicação** e exige aprovação.
9. **Extensões** (Chrome Web Store): o build e o `.zip` saem pelo CI, mas a submissão à loja exige aprovação.

## Ferramentas (todas grátis no uso previsto)

- GitHub Actions: o free tem cota de minutos para repos privados **[H — verificar a cota atual]**.
- `wrangler` (CLI Cloudflare) com API token de escopo mínimo em GitHub Secrets.
- `supabase` CLI para migrations (`supabase db push`) com access token em GitHub Secrets.
- Alternativa sem Actions para o front: integração Git nativa do Cloudflare Pages, que gera build e preview automaticamente.

## Pendências que exigem aprovação

Criar a org GitHub, a conta Cloudflare, os tokens de deploy e o domínio de produção. Ver a seção 6 de `shared/standards/INFRASTRUCTURE.md`.
