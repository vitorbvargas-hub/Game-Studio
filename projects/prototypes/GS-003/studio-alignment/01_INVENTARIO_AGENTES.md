# 01 — Inventário dos agentes do Game Studio (Digital Odyssey, Etapa 5 §3)

- **Data:** 2026-11-12 · **Autor:** game-studio (subagente da Etapa 5) · **Tipo:** auditoria só de leitura. Nenhum arquivo de `workspaces/*` foi alterado.
- **Legenda:** **[E]** verificado nesta sessão (arquivo ou comando) · **[L]** documentado em `ARCHITECTURE.md`, ADR ou `PROJECT_LOG.md`, não reverificado · **[H]** hipótese · **NV** não verificado.

## 0. Como foi levantado

| Fonte | O que deu | Status |
|---|---|---|
| `openclaw agents list --json` (binário `~/.openclaw/tools/node-v24.21.0/bin/openclaw`, só leitura, filtrado para `id`, `model`, `workspace`) | Os 7 agentes, modelo primário e workspace | [E] |
| Leitura de `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md` e `skills/` de cada workspace | Contexto, papel, vibe | [E] |
| `md5sum` dos `AGENTS.md` e `USER.md` | Os 7 `AGENTS.md` são **byte a byte idênticos** (`f618079f…`). 6 `USER.md` são o template vazio; só o `game-studio` tem diretivas reais | [E] |
| `ARCHITECTURE.md`, `GOVERNANCE.md`, ADR-001/004/009/011/012 | Perfil de ferramentas, fallback, delegação | [L] |
| `PROJECT_LOG.md` (139 linhas) | Padrão de uso de subagentes, quedas, retomadas | [E] leitura |
| Configuração do gateway (`config.get`) | **Não lida.** Não há ferramenta `gateway` nesta sessão, e ler `openclaw.json` direto exporia credenciais. Política de ferramentas e `subagents` ficam como [L] de `ARCHITECTURE.md` | NV |

**Nenhum workspace tem a pasta `skills/`** [E]. Não há skills próprias de agente; os procedimentos vivem em briefs e relatórios dentro de `projects/`.

## 1. Tabela-resumo

| Agente | Papel declarado (SOUL/IDENTITY) | Modelo primário [E] | Fallback [L] | Runtime | Workspace | Repo git próprio |
|---|---|---|---|---|---|---|
| `game-studio` | CEO + CTO + Executive Producer; coordenador e ponto único de contato | `anthropic/claude-opus-5-5` | claude-sonnet-5 | `claude-cli` | `workspaces/game-studio` | sim (`d29a51d`) |
| `game-research` | Market Intelligence Specialist | `anthropic/claude-sonnet-5` | claude-opus-5-5 | `claude-cli` | `workspaces/game-research` | sim (`a3f7648`) |
| `game-design` | Head of Product Design | `anthropic/claude-sonnet-5` | claude-opus-5-5 | `claude-cli` | `workspaces/game-design` | sim (`2ebd87f`) |
| `game-dev` | Chief Software Engineer | `anthropic/claude-opus-5-5` | claude-sonnet-5 | `claude-cli` | `workspaces/game-dev` (+ worktree `qo`) | sim (`57b47f6`); `qo` = worktree do repo do estúdio, branch `quality-overhaul` |
| `game-art` | Art Director + Creative Designer (GAME-ART-DIRECTOR pelo ADR-012) | `anthropic/claude-sonnet-5` | claude-opus-5-5 | `claude-cli` | `workspaces/game-art` | sim (`dc6c21a`) |
| `game-qa` | Head of Quality Engineering (VISUAL-QA pelo ADR-012) | `anthropic/claude-sonnet-5` | claude-opus-5-5 | `claude-cli` | `workspaces/game-qa` | sim (`76976b8`) |
| `game-growth` | Head of Growth & Monetization | `anthropic/claude-sonnet-5` | claude-opus-5-5 | `claude-cli` | `workspaces/game-growth` | sim (`79efecd`) |

Observação de modelo [E, `PROJECT_LOG.md`]: tarefas podem rodar com modelo diferente do primário por override no spawn. A Etapa 2 (game-qa) rodou em Opus e a Etapa 4 (game-research) em Fable 5.2. O modelo da tabela é o padrão do agente, não uma garantia por tarefa.

## 2. Ficha por agente

### 2.1 `game-studio` — coordenador

- **Responsabilidade (SOUL):** receber ideias, delegar, coordenar especialistas, priorizar, avaliar qualidade e viabilidade, gerenciar custo, consolidar e apresentar decisões ao fundador. Máx. 4 tarefas simultâneas; ponto único de contato.
- **Ferramentas [L]:** perfil `full` (global), com negação de `whatsapp_login`, `mobile_ui`, `conversations_send/turn` e `secrets`. Nesta sessão [E]: shell, arquivos, web, browser, sessões/subagentes, PixelLab MCP (incluindo sandbox e deploy de worker), dashboard, portal, nodes.
- **Delegação [L]:** `subagents.delegationMode: prefer`, `requireAgentId: true`, `allowAgents` = os 7 IDs.
- **Documentos de contexto:** `AGENTS.md` (comum), `SOUL.md`, `IDENTITY.md`, `USER.md` com 6 diretivas ativas (pt-BR; ponto único de contato; decidir o reversível; nunca tocar vargas-ia/sharp-ia/Norteo/Sharp/WhatsApp/finanças; anexar relatórios como MEDIA; **até 15/11, uma ação e um agente por vez**). Tem `memory/` (`PROJECTS_PROGRESS.md`, dreaming) e `DREAMS.md`.
- **Itens operacionais no workspace:** `tools/vercel/deploy.mjs` (deploy da prévia por REST, ADR/log de 12/11), `review/`, `tmp/`. `USER.md` com modificação não commitada [E git].
- **Dependências:** todos os especialistas; fundador; cron diurno de retomada.
- **Sobreposições/conflitos:** acumula Game Director + produtor + revisor de arte de fato (o `PROJECT_LOG.md` registra o coordenador reprovando v14/v15 e **fazendo a v15b à mão**, 12/11) — conflita com "nenhum agente aprova o próprio trabalho visual" (ADR-012 §3) quando ele mesmo produz e aprova. Também fez deploy (Vercel) e push (GitHub) a pedido do fundador.

### 2.2 `game-research`

- **Responsabilidade (SOUL):** inteligência de mercado; entregável principal OPPORTUNITY REPORT; fontes públicas com URL e data; "nunca apresente estimativa como fato".
- **Responsabilidade de fato no Digital Odyssey [E log]:** Etapa 3 (imersão no universo Digimon), GS-013 (recuperação de sprites), DW1_SOURCES_REPORT, **Etapa 4 (Digimon Database 1.0, autor e mantenedor)**. Ou seja, já exerce a função **Digimon Research**, que o SOUL não menciona.
- **Ferramentas [L]:** perfil `coding` (fs, runtime, web, sessions, memory, mídia); negados mensageria, automação, gateway/config, nodes, secrets. Browser: não listado como extra; a Etapa 3b usou `chrome-sharp` por autorização pontual do fundador, executada por subagente do game-studio.
- **Contexto:** `AGENTS.md` comum, SOUL de mercado, `USER.md` template vazio (placeholder "Prefer ..." com `status: active` — viola a própria regra do template).
- **Dependências:** web_fetch (o shell não tem saída para o site oficial, Etapa 4); Wikimon (`Crawl-delay: 60`); Reference Book.
- **Conflitos:** SOUL focado em mercado/monetização, enquanto o ADR-007 tirou a monetização do jogo e o trabalho real é lore/Database. Recebe a mesma regra "nunca copiar nomes/marcas de terceiros" que contradiz a exceção do ADR-007.

### 2.3 `game-design`

- **Responsabilidade (SOUL):** GDD, core loop, progressão, balanceamento, economia, missões, retenção; "sempre MVP antes do produto completo"; **"Conceitos 100% originais"**.
- **De fato [E log]:** P7 (brief da clareira), P8 (HUD v2), HUD_IDENTITY_V3 + PANELS_SPEC, VIDEO_IDEAS_SPEC, DIGIVICE_VI1_SPEC, auditoria UI/mundo (D3). Pelo ADR-012 é UI-UX-DESIGNER e co-WORLD-COMPOSER.
- **Ferramentas [L]:** perfil `coding`.
- **Contexto:** `AGENTS.md` comum, SOUL genérico (jogos/apps/SaaS), `USER.md` vazio.
- **Conflitos:** "100% originais" colide com o fangame (ADR-007/014: criaturas e evoluções oficiais). Sem regra de congelamento (regras de jogo congeladas desde 11/11 até a identidade visual ser definida).

### 2.4 `game-dev`

- **Responsabilidade (SOUL):** arquitetura, frontend/backend, programação de jogos, infra, deploy; commits só locais; nada de deploy público sem aprovação; estimativa com faixa.
- **De fato [E]:** dono do código vivo no worktree `workspaces/game-dev/qo` (branch `quality-overhaul`, último commit `3289e32`, ADR-014). Motor Canvas 2D próprio (não Phaser), 496 testes, Map Factory, importadores (`import-pixellab-map.mjs`, `import-tamers-v13.mjs`, `build-official-mons.mjs`). MAP-ENGINEER e GAME-INTEGRATOR pelo ADR-012.
- **Ferramentas [L]:** perfil `coding`. Porta 5190 = worktree `qo` (regra do log de 11/11).
- **Contexto:** `AGENTS.md` comum, SOUL, `USER.md` vazio; `memory/` com notas de 10 e 12/11; `DREAMS.md`; pastas não rastreadas `.tmpref/`, `tmp/`, `tmp_dvv/`.
- **Dependências:** assets do game-art; fonte de verdade de `GAME-ASSETS` (há divergência entre `qo/assets` e master, Etapa 2 T6).
- **Conflitos:** o `AGENTS.md` comum limita a escrita a `projects/<fase>/GS-NNN/`, `shared/`, `portfolio/`, `assets/` "e este workspace" — o worktree `qo` fica dentro do workspace, então está coberto, mas o código vivo **não** está em `projects/prototypes/GS-003/prototype` do master: dois lugares com o mesmo caminho lógico.

### 2.5 `game-art`

- **Responsabilidade (SOUL):** identidade visual, sprites, animação, cenários, UI, assets; **"Geração de imagem não está configurada no momento — entregue especificações e prompts prontos; não contrate provider"**; "não copie elementos protegidos".
- **De fato [E log]:** GAME-ART-DIRECTOR (ADR-012 §3), Style Bible GBA Plus (Gate 1, aprovado 11/11), direção v13 "GBA Clean", Digi Forest v13–v15, Tamers v13 (12 presets), UI v13 r1/r2, mapa-múndi v1–v2.1. **Usa PixelLab Tier 1** (assinado pelo fundador em 11/11; ~1.262 gerações gastas até 12/11).
- **Ferramentas [L]:** perfil `coding`; PixelLab MCP disponível no ambiente [E].
- **Contexto:** `AGENTS.md` comum, SOUL desatualizado, `USER.md` vazio; pastas não rastreadas `art/`, `.review/`, `.tmp_ninja/`, `tmp_pt/` (o log de 10/11 registra uma entrega **gravada no workspace errado**).
- **Conflitos:** SOUL contradiz o uso de PixelLab e o uso de sprites oficiais (ADR-009/011). Acumula diretor e produtor: o ADR-012 manda o diretor revisar "em sessão separada do produtor", o que o log nem sempre registra.

### 2.6 `game-qa`

- **Responsabilidade (SOUL):** testes funcionais, regressão, performance, usabilidade; **independente do desenvolvedor**; só aprova por evidência; browser só no perfil isolado, nunca perfis pessoais.
- **De fato [E]:** Etapa 2 (homologação técnica, funcional e visual), VISUAL-QA de todas as rodadas de arte (QA_P8, QA_SCALE_PROOF, QA_PHASE3, QA_HUD, QA_V11, QA_HOLO, QA_UI_V13…). VISUAL-QA pelo ADR-012.
- **Ferramentas [L]:** perfil `coding` + `browser`.
- **Contexto:** `AGENTS.md` comum, SOUL, `USER.md` vazio; pastas não rastreadas `phase3_qa_GS003/`, `scratch/`, `tmp_view/`.
- **Conflitos:** a proibição de perfis pessoais colide com a autorização pontual do fundador para `chrome-sharp` na Etapa 3 (dada ao coordenador, não ao QA). Não há rubrica comum: a Etapa 2 usou 11 itens 0–10, o Style Bible usa a matriz §8 (mín. 8) e o GS-010 usa 12 critérios (média ≥ 9).

### 2.7 `game-growth`

- **Responsabilidade (SOUL):** monetização, aquisição, marketing, métricas, lançamento; nenhum gasto com mídia sem aprovação.
- **De fato:** **nenhuma tarefa no Digital Odyssey** registrada no `PROJECT_LOG.md` [E grep]. O ADR-007 proíbe qualquer monetização do jogo.
- **Ferramentas [L]:** perfil `coding`.
- **Conflitos:** função comercial sem objeto no projeto atual. Risco de, se acionado, propor monetização incompatível com o ADR-007. Papel útil possível: comunidade e canais de fan game, risco de remoção (o ADR-007 já atribuiu isso ao game-research) e métricas de playtest.

## 3. Subagentes temporários (padrão de uso, a partir do `PROJECT_LOG.md`)

| Aspecto | Padrão observado [E log] |
|---|---|
| Como nascem | `sessions_spawn` pelo `game-studio` com `agentId` do especialista (ex.: "game-art 0b47c2d3"), ou subagente do próprio `game-studio` (Etapa 3b `d75cd8d3`, Etapa 5 `92d82263`). Especialistas só podem gerar subagente de si mesmos, 1 nível (regra de conduta, ADR-001 §5) |
| Quem dispara | Sessão do dashboard (webchat com o fundador) e o **cron diurno** de verificação/retomada |
| Escopo | Uma tarefa fechada com saída em caminho fixo e, para arte, **teto de gerações PixelLab** (ex.: 40, 60, 80, 150) |
| Concorrência | Até 4 ativas (conduta) até 12/11; **desde 12/11 05:3x, 1 agente e 1 ação por vez até 15/11** (regra do fundador) |
| Falha dominante | **Limite de uso de 5 h**: mais de 8 quedas entre 10 e 12/11 (DIAGNÓSTICO §H), com trabalho parcial não commitado (ex.: game-dev bfc1709d; game-art 4 frentes às 11:58 de 11/11) |
| Retomada | `followup` na mesma sessão quando permitido; quando a sessão-pai é outra execução do cron ou o dashboard, o followup é recusado e vira **spawn novo com instrução de continuar do parcial**. Um subagente que "caiu" pode ter sido concluído depois (ex.: Tamers 304347f2) |
| Sub-subagentes | Raros e de 1 nível: a Etapa 3b dividiu 10 vídeos em 5 sub-subagentes (2 cada), com revisão do pai |
| Registro | Toda tarefa entra no `PROJECT_LOG.md` com id de sessão, saída, custo e leitura do coordenador |
| Limites técnicos [L] | `maxConcurrent` e `maxSpawnDepth` não são configuráveis por agente nesta versão sem mexer em `agents.defaults` (afetaria vargas-ia/sharp-ia); defaults vigentes: concorrência 8, profundidade 5, 5 filhos por sessão |

## 4. Sobreposições e conflitos (resumo; detalhe em `08_RISCOS_E_CONFLITOS.md`)

1. **`AGENTS.md` idêntico nos 7**, incluindo o bloco genérico de assistente pessoal (e-mail, calendário, clima, grupos de chat, automações proativas "2–4 vezes por dia") que não se aplica a especialistas sem canal e sem automação.
2. **Regra de IP contraditória:** `AGENTS.md`, `GOVERNANCE.md` e `VISION.md` dizem "nunca copiar arte, nomes ou marcas de terceiros"; ADR-007/009/014 fazem a exceção do fangame. Nenhum contexto de agente cita a exceção.
3. **SOULs desatualizados:** game-art ("geração de imagem não configurada"), game-design ("100% originais"), game-research (só mercado).
4. **`ARCHITECTURE.md` e `ROADMAP.md` defasados:** versão do OpenClaw registrada 2026.9.8 (o binário responde 2026.11.2 [E]); `imageModel: null` e "game-art entrega só especificações"; roadmap parado no ciclo 2.
5. **Diretor de arte e produtor no mesmo agente**; coordenador também produzindo arte.
6. **game-growth sem função** no projeto.
7. **Nenhum agente sabe que o projeto se chama Digital Odyssey**, que há uma Database com camadas A/B nem que existe parceiro especial (ADR-013) — esse conhecimento está só em `projects/`.
8. **Três réguas de aprovação visual** (GS-010 ≥ 9; Style Bible ≥ 8; Etapa 2 média 4,6 em 11 itens) e duas referências visuais em conflito (Style Bible × v13/v15).

## 5. Limitações

- A política de ferramentas por agente não foi conferida no gateway (sem `config.get`); vem de `ARCHITECTURE.md`, que tem outras partes defasadas.
- O conteúdo de `memory/` e `DREAMS.md` não foi lido em detalhe (memória pessoal de sessão, fora do escopo de contexto operacional).
- A conferência de "o que o agente realmente pode fazer" no runtime `claude-cli` é limitada: o próprio `GOVERNANCE.md` registra que as ferramentas nativas desse runtime não são totalmente governadas pela política do OpenClaw.
