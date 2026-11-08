# ADR-001 — Implantação do estúdio multiagente

- **Data:** 2026-11-08 · **Decisor:** game-studio (decisões reversíveis) · **Status:** aceito

## Contexto
OpenClaw 2026.9.8 ativo (gateway). CLI padrão no PATH é 2026.9.6 e recusa o estado (schema 19 > 18). Sem Docker/Podman. Provider único de modelos com auth pronta: Anthropic via runtime `claude-cli` (assinatura). Google tem API key apenas para web search.

## Decisões
1. **Usar o binário 2026.9.8** existente (`~/.openclaw/tools/node-v24.21.0/bin/openclaw`) para toda a administração. Não atualizar nem trocar instalação.
2. **game-studio reaproveitado**: já existia (criado 2026-11-08 08:26, sem bindings, sem sessões relevantes) e é compatível — não duplicado.
3. **Modelos:** Opus 5.5 para coordenação e engenharia; Sonnet 5 para os demais; fallback cruzado. Gemini não usado como modelo (custo por token sem aprovação).
4. **Ferramentas:** especialistas no perfil `coding` com negação de mensageria, automações, gateway/config, nodes, secrets. QA ganha `browser`.
5. **Limites de delegação:** concorrência 4 / profundidade 1 nível não são configuráveis por agente nesta versão; aplicados por conduta para não alterar `agents.defaults` (afetaria vargas-ia/sharp-ia).
6. **Sandbox:** não ativado (sem Docker). Isolamento = política de ferramentas + regras de escopo.
7. **GS-001 unificado:** a Fase 9 do Master V2 (idle game, ref. idledex) e o Script 02 (discovery amplo) são executados como um único discovery GS-001.

## Consequências
Rollback: restaurar `~/.openclaw/backups/gamestudio-pre-20261108-083158/openclaw.json` e remover os agentes game-* com `openclaw agents delete` (requer aprovação, destrutivo).
