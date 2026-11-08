# Arquitetura do Estúdio

Plataforma: OpenClaw **2026.9.8** (gateway ativo em `~/.openclaw/tools/node-v24.21.0`). Atenção: o `openclaw` no PATH padrão é a 2026.9.6 e **recusa** o estado atual (schema 19). Use `~/.openclaw/tools/node-v24.21.0/bin/openclaw`.

## Agentes

| ID | Papel | Modelo primário | Fallback | Workspace | agentDir |
|---|---|---|---|---|---|
| game-studio | CEO/CTO/Exec. Producer (coordenador) | anthropic/claude-opus-5-5 | claude-sonnet-5 | workspaces/game-studio | ~/.openclaw/agents/game-studio/agent |
| game-research | Market Intelligence | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-research | ~/.openclaw/agents/game-research/agent |
| game-design | Head of Product Design | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-design | ~/.openclaw/agents/game-design/agent |
| game-dev | Chief Software Engineer | anthropic/claude-opus-5-5 | claude-sonnet-5 | workspaces/game-dev | ~/.openclaw/agents/game-dev/agent |
| game-art | Art Director | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-art | ~/.openclaw/agents/game-art/agent |
| game-qa | Head of Quality | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-qa | ~/.openclaw/agents/game-qa/agent |
| game-growth | Growth & Monetization | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-growth | ~/.openclaw/agents/game-growth/agent |

**Racional de modelos:** Opus nas decisões (coordenação) e engenharia; Sonnet 5 para pesquisa, design, arte, QA e growth (bom custo/qualidade). Provider: `anthropic` via runtime `claude-cli` (assinatura Claude, herdada de `main` por `authInheritance`; nenhuma credencial OAuth copiada). Google/Gemini existe apenas como API key de **web search**; não foi usado como modelo para evitar custo por token sem aprovação. Sem modelo de geração de imagem configurado (`imageModel: null`) → game-art entrega especificações e prompts, não imagens, até o fundador aprovar um provider.

**Custos:** runtime `claude-cli` consome cota da assinatura, não cobrança por token visível ao OpenClaw. Uso por sessão: `session_status`. Registrar consumo relevante por projeto em `portfolio/performance/COSTS.md`.

## Delegação

```
game-studio ──spawn(agentId)──► game-research | game-design | game-dev | game-art | game-qa | game-growth
     ▲                                   │
     └──────── resultado (announce) ─────┘   → consolidação e decisão
```

- `game-studio.subagents`: `delegationMode: prefer`, `requireAgentId: true`, `allowAgents` = os 7 IDs.
- Especialistas: `allowAgents` = apenas o próprio ID → podem criar subagentes **temporários** de si mesmos, nunca acionar outros agentes permanentes.
- **Limites não aplicados por agente:** `maxConcurrent` (desejado 4) e `maxSpawnDepth` (desejado 2) só existem em `agents.defaults.subagents`, que afetaria vargas-ia/sharp-ia (proibido alterar). Defaults vigentes: concorrência 8, profundidade 5, 5 filhos por sessão. Controle aplicado por **conduta**: o coordenador dispara no máximo 4 tarefas simultâneas e especialistas não aninham além de 1 nível.

## Permissões

| Agente | Perfil | Extras | Negado |
|---|---|---|---|
| game-studio | full (global) | — | whatsapp_login, mobile_ui, conversations_send/turn, secrets |
| especialistas | coding (fs, runtime, web, sessions, memory, mídia) | game-qa: browser | group:messaging, group:automation (cron/gateway/plugins/openclaw), group:nodes, conversations_send/turn, secrets, whatsapp_login, mobile_ui |

Nenhum binding de canal para agentes `game-*`. Sandbox: **desligado** (sem Docker) — ver GOVERNANCE.md.

## Repositórios

- `~/projects/GameStudio` — repo git do estúdio (docs, projetos, templates). Ignora `workspaces/`.
- Cada `workspaces/<agent>` — repo git próprio criado pelo OpenClaw.
- Código de produto: `projects/<fase>/GS-NNN/` com `git worktree` quando houver desenvolvimento paralelo.
