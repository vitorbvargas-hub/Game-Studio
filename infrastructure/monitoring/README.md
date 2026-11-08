# Monitoramento, Logs e Erros

> Padrão documental, condicionado à aprovação de `shared/standards/INFRASTRUCTURE.md` (opção C). Nenhuma ferramenta foi configurada. Prefira o que já vem incluso nos provedores antes de adicionar um serviço.

## Stack mínima (custo US$0 no uso inicial)

| Necessidade | Ferramenta | Free tier | Fonte |
|---|---|---|---|
| Logs de Workers | **Workers Logs** (incluso) | 200k eventos/dia, retenção de 3 dias; Paid: 20M/mês, 7 dias. **Muda de preço em 2026-12-01** | [E] developers.cloudflare.com/workers/platform/pricing (2026-11-08) |
| Logs do banco/API | **Supabase Logs** (incluso) | retenção de 1 dia (Free) / 7 dias (Pro) | [E] supabase.com/pricing (2026-11-08) |
| Erros de front/jogo/Worker | **Sentry Developer** (free, 1 usuário) | cota pequena de erros/mês **[H — o número não foi exibido na página lida]**. Pago: Team a partir de US$26/mês, com 50k erros incluídos | [E parcial] sentry.io/pricing, docs.sentry.io/pricing (2026-11-08) |
| Alternativa open-source a erros | **GlitchTip** (compatível com o SDK do Sentry, self-host) | — | [H] licença e esforço de hospedagem a confirmar; exige servidor/Docker |
| Uptime | **Cron Trigger de um Worker** que pinga os endpoints e alerta (custo ≈ 0) **ou** um serviço externo de uptime com free tier | — | [H] não verificado; um monitor externo cobre a queda da própria Cloudflare |
| Métricas de tráfego | **Cloudflare Web Analytics** (sem cookies) / analytics do Pages | grátis **[H]** | não reverificado |
| Métricas de produto | ver `shared/platform-components/README.md` (Analytics) | — | — |

## Regras

1. **Sem PII em logs ou eventos de erro.** Configurar `beforeSend`/scrubbing no Sentry. Logar `user_id` interno, nunca e-mail, CPF, IP completo ou conteúdo do usuário (LGPD).
2. **Log estruturado (JSON)** com `level`, `request_id`, `env`, `release`, `event`. O `release` = tag git, para correlacionar erro com deploy.
3. **Source maps** enviados ao Sentry no CI e **não** publicados no bundle público.
4. **Alertas mínimos por produto em produção:** taxa de erro > limiar, endpoint fora do ar, job agendado sem rodar (heartbeat), uso perto do limite do plano (painéis de billing Cloudflare/Supabase com alerta de gasto).
5. **Destino dos alertas:** e-mail do estúdio. Integrações com mensageria (WhatsApp/Slack) exigem decisão do fundador. Agentes não enviam comunicação externa.
6. **Retenção curta é aceitável no início.** Log drain pago (Supabase US$60/drain/mês [E]) só com justificativa.
7. Cada produto documenta no `TECHNICAL_SPEC.md`: o que é monitorado, os limiares e quem recebe o alerta.

## Pendências que exigem aprovação

Conta Sentry (ou servidor para GlitchTip), conta de uptime externo e o e-mail de alertas do estúdio.
