# Política de Banco de Dados

> Padrão documental, condicionado à aprovação de `shared/standards/INFRASTRUCTURE.md` (opção C). Nenhum banco foi criado.

## Onde cada dado mora

| Dado | Banco | Motivo |
|---|---|---|
| Contas, perfis, dados de clientes, **qualquer PII**, dados financeiros, multi-tenant | **Supabase Postgres** (`sa-east-1`) com **RLS obrigatória** | região Brasil [E], RLS, backups no Pro [E] |
| Save anônimo de jogo, leaderboard, contadores, cache | **Cloudflare D1 / KV** | barato, na borda. **D1 não roda na América do Sul [E] → nunca PII** |
| Arquivos (assets, uploads) | **R2** (público só para assets do jogo) / Supabase Storage (arquivos de usuário com RLS) | egress grátis no R2 [E] |

## Regras invioláveis

1. **Nunca apagar banco, tabela, bucket ou dados de produção sem aprovação explícita do fundador** (GOVERNANCE: operação destrutiva/irreversível). Vale também para `DROP`, `TRUNCATE`, `DELETE` sem `WHERE` seletivo, reset de projeto e "pausar/deletar projeto".
2. **Nenhum agente tem credencial de escrita direta em produção.** As alterações em prod passam por migration no CI, com aprovação.
3. **Toda mudança de schema é migration versionada no git** (`supabase/migrations/*.sql`, `worker/migrations/*.sql` para D1). Nada de alterar schema pelo painel em staging ou prod.
4. **Migrations em duas fases (expand/contract):** primeiro adicionar (colunas nullable, tabelas novas) e fazer deploy do código; só num release posterior remover. A fase "contract" que apaga coluna/tabela com dados conta como destrutiva e exige aprovação.
5. **RLS:** toda tabela no schema exposto nasce com `ENABLE ROW LEVEL SECURITY` e policies explícitas. Testes automatizados de RLS (usuário A não lê o dado de B) são obrigatórios antes da produção.
6. **A `service_role` key do Supabase** fica só no servidor (Worker/CI), nunca no front, extensão ou app.
7. **Dados de teste são sintéticos.** Nunca copiar PII de produção para dev/staging.

## Backups

| Banco | Mecanismo | Status |
|---|---|---|
| Supabase **Pro** | backups diários, retidos por 7 dias (incluso) [E] | obrigatório em produção |
| Supabase **Free** | **sem backup** [E] → só dev/staging | — |
| Supabase (extra) | `pg_dump` agendado (GitHub Actions) para armazenamento do estúdio (ex.: R2 privado, com criptografia) | recomendado; custo ≈ US$0 |
| Supabase PITR | US$100/mês por 7 dias de retenção [E] | só com justificativa e aprovação |
| D1 | Time Travel (restauração por ponto no tempo) **[H — verificar a janela no plano]** + `wrangler d1 export` periódico | recomendado |
| KV | sem backup nativo **[H]** → só dado reconstruível | — |

- **Teste de restauração** pelo menos 1x antes do lançamento e depois a cada trimestre, restaurando em um projeto de staging.
- Retenção de dados pessoais: definir por produto (LGPD: minimização), com exclusão a pedido do titular implementada como fluxo auditável.

## Checklist antes de um banco ir para produção

- [ ] Plano Pro ativo (aprovação de custo registrada)
- [ ] Região `sa-east-1`
- [ ] RLS + testes de RLS verdes
- [ ] Backup diário confirmado + `pg_dump` externo + 1 restauração testada
- [ ] Migrations aplicadas só via CI
- [ ] Segredos rotacionáveis e fora do git
- [ ] Mapa de PII do produto documentado em `TECHNICAL_SPEC.md`
