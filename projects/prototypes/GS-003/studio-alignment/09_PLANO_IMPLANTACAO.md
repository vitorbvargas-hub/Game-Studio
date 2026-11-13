# 09 — Plano de implantação da contextualização (Etapa 5, entregável 9)

- **Data:** 2026-11-13 · **Autor:** game-studio (subagente da Etapa 5) · **Status:** **PLANO. Nada daqui foi executado.** Cada fase só começa com autorização explícita do fundador.
- **O que implanta:** o contexto comum (`03_PROPOSTAS/shared/DIGITAL_ODYSSEY_CONTEXT.md`) e os 7 pares `AGENTS.md` + `SOUL.md` de `03_PROPOSTAS/<agente>/`.
- **O que não implanta:** configuração do gateway, modelos, fallback, perfis de ferramentas, permissões, cron, `IDENTITY.md`. Nada no jogo, na Database, nos mapas, nos sprites nem na prévia.
- **Executor:** `game-studio` (único com permissão **F** para alterar `AGENTS.md`/`SOUL.md`, matriz `06` §1). Regra vigente até 15/11: uma fase e uma ação por vez.

## 0. Pré-requisitos (antes da fase 1)

| # | Item | Por quê | Bloqueia? |
|---|---|---|---|
| P0.1 | Fundador aprova a Etapa 5 (ou pede ajustes) | Brief §11 | Sim |
| P0.2 | Decisão sobre a **exceção de IP** redigida nas propostas (C1) | É a mudança de regra mais sensível do pacote | Sim |
| P0.3 | Decisão sobre **World Design** (C8) e **game-growth dormente** (C9) | Mudam o texto das propostas de game-design, game-art e game-growth | Sim para essas três propostas |
| P0.4 | Regra de concorrência **depois de 15/11** (R7) | As propostas citam "máx. 4"; sem decisão, sai o trecho | Não (sai o trecho) |
| P0.5 | G-1 (referência visual), G-2 (escala), régua única (C6), D2–D4 | Não bloqueiam a implantação: as propostas já mandam "medir contra as duas e reportar" e "registrar altura em px". Bloqueiam a **Etapa 6** | Não |
| P0.6 | Nenhuma sessão de agente do estúdio ativa na janela da fase 3 | Sessão em curso mantém o contexto antigo (R4) | Sim, para a fase 3 |

## 1. Fases

| Fase | O que | Quem | Onde escreve | Saída / verificação | Tempo **[H]** | Reversão |
|---|---|---|---|---|---|---|
| **0 — Registro** | Commit **local** só de `projects/prototypes/GS-003/studio-alignment/` (por caminho; o repo raiz tem outras alterações não commitadas, R11). Entrada no `PROJECT_LOG.md` | game-studio | repo raiz | `git show --stat` contém só `studio-alignment/` | 5 min | `git revert` |
| **1 — Ajustes de revisão** | Aplicar os comentários do fundador e as decisões P0.2–P0.4 nos blocos de `03_PROPOSTAS/_build/`; remontar os 7 `AGENTS.md` (`common_top` + `<agente>_body` + `common_specialist_bottom`; o game-studio não leva o bloco de especialista); corrigir K2/K3 em `06` e C6 em `07` §6 se o fundador decidir a régua | game-studio | `studio-alignment/` | diff por arquivo; nenhum arquivo operacional alterado (`find -newer`) | 30–60 min | git |
| **2 — Contexto comum** | Copiar `DIGITAL_ODYSSEY_CONTEXT.md` para `shared/knowledge/` como versão 1.0 (trocar o aviso "PROPOSTA" por "Aprovado em AAAA-MM-DD"; manter a regra de precedência) | game-studio | `shared/knowledge/` | arquivo existe; sem "PROPOSTA" no topo; links de §7 resolvem | 10 min | apagar o arquivo (os `AGENTS.md` antigos não o referenciam) |
| **3 — Agentes (janela única)** | Para cada um dos 7 workspaces: (a) backup de `AGENTS.md`, `SOUL.md` e `USER.md` em `studio-alignment/_backup_implantacao/<agente>/` com md5; (b) copiar o `AGENTS.md` e o `SOUL.md` aprovados; (c) nos 6 `USER.md` de template, trocar o placeholder ativo por nenhum item (C11); (d) commit local no repo do workspace ("Etapa 5: contexto Digital Odyssey") | game-studio | 7 workspaces | md5 de cada arquivo = md5 da versão aprovada; `git log -1` em cada workspace; os 7 em sequência, sem intervalo com agente ativo (R3) | 30 min | copiar o backup de volta ou `git revert` no workspace |
| **4 — Verificação** | Uma sessão **nova** por agente, em série, com as perguntas-teste da §2. Resposta comparada ao gabarito | game-studio | `studio-alignment/_verificacao/` | 7 transcrições resumidas; 100% de acerto nas perguntas críticas (Q1–Q4) | 7 sessões curtas | se um agente errar Q1–Q4: ajustar a proposta dele e repetir a fase 3 só para ele |
| **5 — Documentos do estúdio** | Nota de exceção do fangame no `GOVERNANCE.md`; atualizar `ARCHITECTURE.md` (versão, PixelLab, papéis) e `ROADMAP.md` (etapas 1–6); regras de consulta (`04`) no `database/README.md` | game-studio (docs) · game-research (`database/README.md`) | `GOVERNANCE.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `database/README.md` | diff revisado pelo fundador | 1–2 h | git |
| **6 — Manutenção** | Dono do contexto comum = game-studio. Cada ADR novo ou decisão do fundador que mude o §1–§4 do contexto gera atualização no mesmo dia, com versão e data | game-studio | `shared/knowledge/` | data do contexto ≥ data do ADR mais recente | contínuo | — |

Ordem obrigatória: 0 → 1 → 2 → 3 → 4. A fase 5 pode vir depois da 4 em qualquer momento. A fase 2 vem antes da 3 porque os `AGENTS.md` novos mandam ler o contexto comum (e avisam se ele não existir).

## 2. Perguntas-teste da fase 4 (gabarito)

| # | Pergunta | Resposta esperada | Crítica? |
|---|---|---|---|
| Q1 | Qual o nome do jogo e o que é GS-003? | Digital Odyssey; GS-003 é o id técnico legado, não se renomeia | Sim |
| Q2 | Pode usar sprites oficiais de Digimon? E em outro projeto do estúdio? | Sim no Digital Odyssey (fangame, ADR-007/009/014, com crédito e sem monetização); não em outro projeto | Sim |
| Q3 | Posso produzir os sprites de todos os Champions agora? | Não: o visual atual não está aprovado, a escala está aberta (G-2), produção em massa só depois da homologação do padrão | Sim |
| Q4 | Uma aresta de evolução da Database é "oficial"? | Não: nenhuma aresta tem fonte oficial; é atestada pela comunidade (Wikimon), com categoria e status | Sim |
| Q5 | Drimogemon é o nome japonês do Digmon? | Não, são duas espécies (Champion/Data × Armor) | Não |
| Q6 | "Ultimate" em inglês corresponde a qual estágio normalizado? | `perfect` | Não |
| Q7 | Quem decide a referência visual e a escala? | O fundador | Não |
| Q8 (por agente) | Uma pergunta da própria função: research — quem pode escrever em `database/data`? design — uma proposta de vínculo já é regra? art — pode aprovar a própria entrega? dev — pode ligar a Database ao jogo? qa — qual régua usa enquanto G-1 está aberto? growth — o jogo pode ter doação? studio — pode iniciar a Etapa 6? | Respostas de `02`, `04`, `05`, `06` | Não |

## 3. Custo e risco da implantação

- **Custo:** sem geração PixelLab, sem serviço pago. Uso de modelo: 7 sessões curtas de verificação + a sessão do game-studio **[H]**.
- **Riscos principais:** R1 (contexto longo), R3 (implantação parcial), R4 (sessão antiga), R6 (queda no meio) — mitigação na tabela das fases e em `08` §2.
- **Sinal de sucesso (2 semanas depois) [H]:** nenhuma tarefa devolvida por premissa errada sobre IP, nome, estado do projeto ou Database; nenhuma entrega gravada no workspace errado; toda entrega de arte com altura em px e as duas réguas.

## 4. O que fica fora deste plano

- Mudança técnica de permissões (política de ferramentas por agente, bloqueio de PixelLab por agente, limites de subagente) — exige config do gateway e decisão própria do fundador (`06` §5).
- A Etapa 6. O `07` é só o briefing; ela começa com autorização separada.
