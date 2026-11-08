# ADR-004 — Organização completa do estúdio antes de novos produtos

Data: 2026-11-08 · Decisor: Vitor Vargas (fundador) · Registro: game-studio

## Decisões do fundador
1. **Padrões** (`shared/standards/`): criar. Para gerar imagens, o estúdio está **autorizado a usar a API de imagem da Sharp IA** (Recraft v3, créditos pagos da conta do fundador).
2. **Critérios de passagem entre fases:** criar. **Status semanal só quando o fundador pedir** (o relatório semanal do Script 06 fica sob demanda).
3. **Portfólio e finanças:** criar, com visualização no dashboard.
4. **Infraestrutura:** o fundador pediu uma comparação entre GitHub+Cloudflare e GitHub+Vercel+Supabase, que o game-dev vai produzir. Criar conta ou plano pago depende de aprovação.
5. **Automações:** apenas uma, a memória diária de andamento de todos os projetos (22h, silenciosa).
6. **Imagens:** testar o gerador da Sharp, levantar opções gratuitas e sprites prontos com licença clara.
7. **Dashboard:** criar.
8. **Não criar MVP nem iniciar projeto.** O fundador vai trazer a ideia dele depois. GS-002 fica em **HOLD**.

## Evidências
- [E] 2026-11-08: teste do Recraft pelo script `sharp-os/scripts/ilustra-gen.mjs`, com OUT_DIR apontando para o estúdio, gerou `assets/original/_tests/teste-recraft-gamestudio.svg` (47 KB, SVG). O repositório da Sharp não foi alterado e nenhum segredo foi lido pelo estúdio.
- Limitação: o modo `vetor` desse script injeta a paleta da Sharp no prompt. Um wrapper próprio do estúdio fica como proposta.

## Consequências
- Todo uso do Recraft é registrado em `portfolio/performance/COSTS.md`.
- Script 06 executado só na parte documental (portfólio, scorecard, capacidade, riscos, plano de 90 dias). Nenhum gasto autorizado.
