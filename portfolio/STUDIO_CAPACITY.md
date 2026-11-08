# Capacidade do Estúdio

> **Autor (agente):** game-growth · **Data:** 2026-11-08 · Fonte: `ARCHITECTURE.md`, `GOVERNANCE.md`, `ROADMAP.md`.
> **[E]** evidência · **[H]** hipótese · **PENDENTE** = dado existe em algum sistema mas não foi informado ao estúdio.

## 1. Agentes e modelos

| Agente | Papel | Modelo primário | Fallback | Workspace |
|---|---|---|---|---|
| game-studio | CEO/CTO/Executive Producer (coordenador) | anthropic/claude-opus-5-5 | claude-sonnet-5 | workspaces/game-studio |
| game-research | Market Intelligence | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-research |
| game-design | Head of Product Design | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-design |
| game-dev | Chief Software Engineer | anthropic/claude-opus-5-5 | claude-sonnet-5 | workspaces/game-dev |
| game-art | Art Director | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-art |
| game-qa | Head of Quality | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-qa |
| game-growth | Growth & Monetization | anthropic/claude-sonnet-5 | claude-opus-5-5 | workspaces/game-growth |

**Racional [E, ARCHITECTURE.md]:** Opus 5.5 em coordenação e engenharia; Sonnet 5 em pesquisa, design, arte, QA e growth. Provider único: Anthropic via runtime `claude-cli`, herdando a assinatura do fundador (sem credencial OAuth copiada). Google/Gemini só como API key de busca web (não como modelo, para evitar custo por token sem aprovação). Sem provider de geração de imagem configurado para game-art (`imageModel: null`) — game-art entrega especificação/prompt, não imagem, até aprovação.

## 2. Limites reais vs. limites desejados (conduta)

| Limite | Valor desejado pelo estúdio | Valor real aplicado pela plataforma | Por quê a diferença |
|---|---|---|---|
| Concorrência de tarefas no coordenador | 4 simultâneas | 8 (default da plataforma) | `maxConcurrent` só existe em `agents.defaults.subagents`, que afetaria também vargas-ia/sharp-ia (proibido alterar) — controle é por **conduta**, não por configuração |
| Profundidade de delegação de especialistas | 1 nível (subagente temporário do próprio agente) | 5 (default da plataforma) | Mesma razão acima |
| Filhos por sessão | — | 5 (default) | Mesma razão acima |
| Projetos em desenvolvimento ativo | **2** (regra deste documento, Script 06) | Não aplicado tecnicamente — é regra de conduta do coordenador | Nenhum mecanismo de enforcement automático existe |
| Projetos em validação | **3** (regra deste documento, Script 06) | Idem — conduta | Idem |

## 3. Paralelismo e permissões

- `game-studio`: perfil `full` (global), nega whatsapp_login, mobile_ui, conversations_send/turn, secrets.
- Especialistas (`game-research/design/dev/art/qa/growth`): perfil `coding` (fs, runtime, web, sessions, memory, mídia); `game-qa` ganha `browser` extra. Todos negam: mensageria, automação (cron/gateway/plugins/openclaw), nodes, conversations_send/turn, secrets, whatsapp_login, mobile_ui.
- Nenhum agente `game-*` tem binding de canal — ninguém envia mensagem externa diretamente.
- Especialistas só podem criar subagentes temporários de si mesmos (nunca acionar outro agente permanente) — limite de 1 nível de aninhamento por conduta.
- **Sandbox: desligado** (sem Docker/Podman instalado). Isolamento = política de ferramentas + regras de escopo de workspace, não sandbox real (`GOVERNANCE.md`, limitação conhecida e documentada, não contornada).

## 4. Projetos ativos hoje (2026-11-08)

| Categoria | Qtde atual | Limite do Script 06 | Dentro do limite? |
|---|---|---|---|
| Em desenvolvimento ativo (MVP em progresso) | 0 (GS-002 está em HOLD, não "ativo") | 2 | Sim — 0/2, capacidade livre |
| Em validação (Fase 0/discovery em execução) | 0 (GS-001 concluído; Fase 0 do GS-002 pausada) | 3 | Sim — 0/3, capacidade livre |

**Conclusão de capacidade:** o estúdio está com **100% da capacidade de desenvolvimento/validação livre** nesta data — o gargalo atual não é capacidade de agente, é decisão do fundador sobre o que priorizar a seguir.

## 5. Gargalos identificados

1. **Decisão do fundador**, não capacidade técnica — é o único item bloqueando qualquer avanço.
2. **Busca web (Gemini)** ficou com cota esgotada (HTTP 429) durante todo o GS-001 (`ROADMAP.md`) — qualquer discovery futuro repete o mesmo gargalo até o fundador escolher: aguardar renovação, aumentar cota (custo) ou configurar outro provider (custo).
3. **Geração de imagem**: sem provider configurado para `game-art`; Recraft foi usado via conta pessoal do fundador para testes pontuais do GS-002 (créditos pagos, poucas gerações, custo exato **NÃO VALIDADO**) — não é uma capacidade recorrente do estúdio até virar decisão formal.
4. **Sandbox Docker**: ausente, opcional conforme `ROADMAP.md` — risco de isolamento mais fraco entre workspaces, mitigado por conduta/política de ferramentas.
5. **Limites de concorrência por agente**: não suportados pelo schema atual da plataforma — aplicados por conduta, sujeitos a erro humano/agente caso não sejam lembrados.

## 6. Custos mensuráveis

| Item | Custo mensal | Fonte |
|---|---|---|
| Agentes (7 contas rodando em `claude-cli`) | **PENDENTE** — consomem cota da assinatura Claude do fundador, não cobrança visível por token ao OpenClaw (`ARCHITECTURE.md`); valor da assinatura não foi informado ao estúdio | `portfolio/performance/COSTS.md` (linha "Assinatura Claude") |
| Recraft v3 (geração de imagem via API da Sharp IA, créditos pagos do fundador, uso autorizado por [ADR-004](../shared/decisions/ADR-004-organizacao-estudio.md)) | **NÃO VERIFICADO** — 1 teste (`teste-recraft-gamestudio.svg`) + 3 propostas de símbolo para o Brand Guide em 2026-11-08, custo exato não registrado | `portfolio/performance/COSTS.md` |
| Infraestrutura de produto (Supabase, Cloudflare, Stripe, etc.) | **R$ 0** — nenhuma conta paga foi aberta (bloqueado por ADR-002) | `shared/decisions/ADR-002-gs002-sem-aprovacao.md` |
| Domínio(s) | **R$ 0** — nenhum domínio comprado | — |

**Recomendação de capacidade:** `portfolio/performance/COSTS.md` já existe e registra os usos de Recraft até aqui (todos **NÃO VERIFICADO**/**PENDENTE**) — falta o fundador atribuir um valor de referência à assinatura Claude e confirmar o custo real dos créditos Recraft usados; sem isso, nenhuma métrica de margem real do estúdio pode ser calculada, só projeções.
