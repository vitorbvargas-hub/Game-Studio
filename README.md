# Game Studio AI

Estúdio multiagente (OpenClaw) para criar, validar e monetizar jogos, apps, web apps e micro-SaaS.

- **Fundador:** Vitor Vargas — decide investimento, publicação e gastos.
- **Coordenador:** `game-studio` (CEO/CTO/Executive Producer) — ponto único de contato.
- **Especialistas:** `game-research`, `game-design`, `game-dev`, `game-art`, `game-qa`, `game-growth`.

| Documento | Conteúdo |
|---|---|
| [VISION.md](VISION.md) | Para onde vamos |
| [STRATEGY.md](STRATEGY.md) | Como escolhemos produtos |
| [GOVERNANCE.md](GOVERNANCE.md) | Autonomia, aprovações, limites |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Agentes, modelos, delegação, permissões |
| [ROADMAP.md](ROADMAP.md) | Próximos ciclos |

## Layout

- `workspaces/<agent>/` — workspace OpenClaw de cada agente (repo git próprio; **não é sandbox**).
- `projects/{discovery,active,prototypes,production,archived}/GS-NNN/` — um diretório por projeto.
- `shared/templates/` — templates obrigatórios da metodologia.
- `shared/decisions/` — ADRs / decisões registradas.
- `portfolio/` — scoring, modelos financeiros, performance.
- `assets/` — somente assets originais ou com licença registrada.
- `infrastructure/` — ambientes, deploy, banco, monitoramento.

Segredos nunca entram neste repositório (ver `.gitignore`).
