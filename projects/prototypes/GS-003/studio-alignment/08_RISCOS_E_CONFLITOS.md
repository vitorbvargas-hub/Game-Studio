# 08 — Relatório de riscos e conflitos (Etapa 5, entregável 8)

- **Data:** 2026-11-13 (retomada após queda de 12/11 23:13) · **Autor:** game-studio (subagente da Etapa 5) · **Tipo:** documental, sem alteração operacional.
- **Base:** `01`–`07` desta pasta, `03_PROPOSTAS/`, ADR-001..014, `GOVERNANCE.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `PROJECT_LOG.md`, `qa/ETAPA2_HOMOLOGACAO.md`, relatório da Etapa 4.
- **Legenda:** **[E]** verificado em arquivo ou comando · **[L]** documentado, não reverificado nesta retomada · **[H]** hipótese. Severidade: **Alta** (bloqueia ou faz um agente agir errado), **Média** (gera retrabalho), **Baixa** (ruído).
- **Quem decide:** **F** = fundador · **S** = game-studio (reversível, registrar no log).

## 1. Conflitos de regra e de contexto (existem hoje)

| # | Conflito | Evidência | Sev. | Efeito se nada mudar | Proposta | Decide |
|---|---|---|---|---|---|---|
| C1 | **Regra de IP contraditória.** `AGENTS.md` (os 7), `GOVERNANCE.md` e `VISION.md`: "nunca copiar arte, nomes ou marcas de terceiros". ADR-007/009/014: fangame com Digimon oficiais, sprites DS permitidos com crédito | [E] md5 igual nos 7 `AGENTS.md`; ADR-009 revoga item 2 do ADR-007 | Alta | Agente recusa a tarefa ou inventa "Digimon original"; ou, ao contrário, um agente aplica a exceção fora do projeto | Exceção explícita e delimitada no bloco comum (`_build/common_top.md` §1–2) e no contexto comum §1; nota de exceção no `GOVERNANCE.md` (fora desta etapa) | F |
| C2 | **SOULs desatualizados.** game-art: "geração de imagem não está configurada"; game-design: "conceitos 100% originais"; game-research: só mercado | [E] leitura dos SOUL; PixelLab Tier 1 assinado 11/11 [L log] | Alta | game-art entrega só prompt; game-design propõe criaturas próprias; research não se vê como dono da Database | SOULs novos em `03_PROPOSTAS/*/SOUL.md` | F |
| C3 | **Nenhum agente conhece o Digital Odyssey** (nome, Database A/B, parceiro especial, estado "visual não aprovado"). Tudo está em `projects/` | [E] grep nos workspaces | Alta | Toda tarefa depende de o brief repetir o contexto; erro quando o brief esquece | `shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md` + referência obrigatória no `AGENTS.md` | F |
| C4 | **Duas referências visuais em conflito (G-1):** Style Bible GBA Plus exige Endesga-32 no cenário (fora = falha crítica); a v15b aprovada tem 0% de pixels na Endesga-32 | [L] Etapa 2 §G-1 | Alta | O QA reprova qualquer entrega por uma régua ou aprova pela outra; Etapa 6 sem critério | Até a decisão: medir e reportar contra as duas (já nas propostas de game-art e game-qa). Recomendação em `07` P1 | **F** |
| C5 | **Escala Tamer × Digimon × tile aberta (G-2):** Tamer ~36 px, Champion DS 38–42 px, WarGreymon com `mapScale 2` | [L] Etapa 2 §E | Alta | Toda arte nova herda o problema; sprites em massa agora seriam retrabalho | Passo 0 da Etapa 6 (`07` §4); registro de altura em px em toda entrega de arte | **F** |
| C6 | **Réguas de aprovação visual diferentes.** GS-010 (ADR-012 §5): média ≥ 9, nenhuma categoria < 8. Style Bible §8: mínimo 8, 0 falha crítica. Etapa 2: 11 itens 0–10. **`07` §6 desta etapa propõe uma quarta**: média ≥ 8, nenhum < 7 | [E] `07` §6; `03_PROPOSTAS/game-qa` §4 cita GS-010 | Média | QA e diretor de arte usam números diferentes para "aprovado"; disputa na homologação | Uma régua única por tipo de entrega, aprovada pelo fundador. Recomendação: Style Bible §8 (≥ 8, 0 crítica) como **piso para entrar no jogo** e GS-010 (≥ 9) como **meta de homologação final**; corrigir `07` §6 para essa dupla | **F** |
| C7 | **Diretor e produtor de arte no mesmo agente**, e coordenador que produz arte (v15b à mão, 12/11) | [L] log 12/11; ADR-012 §3 | Média | "Ninguém aprova o próprio trabalho" vira formalidade | Sessões separadas registradas; revisão sempre de outro agente quando o coordenador produz (`05` §2 regra 1; proposta do game-studio §6) | S (conduta) / F (se quiser outro dono) |
| C8 | **World Design dividido** (WORLD-COMPOSER = game-design + game-art) sem dono final; reprovações v13–v15 foram de composição | [L] log; ADR-012 | Média | Ciclo de reprovação continua; coordenador intervém à mão | game-design dono da estrutura (layout-brief), game-art da composição visual (`02` §3) | **F** |
| C9 | **game-growth sem objeto:** ADR-007 proíbe monetização; nenhuma tarefa no log | [E] grep no log | Baixa | Se acionado, propõe monetização incompatível | Dormente com contexto mínimo (`02` §4; proposta `game-growth`) | F |
| C10 | **QA proíbe perfil pessoal de browser**, mas a Etapa 3b usou `chrome-sharp` com autorização pontual do fundador | [L] log Etapa 3b | Baixa | Ambiguidade sobre quem pode usar e quando | "Perfil pessoal só com autorização explícita registrada por tarefa" (`06` §1; proposta game-qa §5) | F (por tarefa) |
| C11 | **Template `USER.md` com placeholder ativo** em 6 workspaces (`Prefer ...` com `status: active`) | [E] md5 e leitura | Baixa | Diretiva vazia lida como regra | Regra "placeholder ativo é proibido" no bloco comum §8; limpeza é tarefa da implantação (`09` fase 3) | S → F (toca workspace) |
| C12 | **Bloco genérico de assistente pessoal** no `AGENTS.md` dos especialistas (e-mail, calendário, clima, grupos, automações 2–4×/dia) | [E] `AGENTS.md` comum | Média | Especialista sem canal tenta "ser proativo", cria automação ou mensagem | Removido nas propostas; especialistas: "sem canal, sem automação" (`common_specialist_bottom.md` §8) | F |
| C13 | **Documentos de estúdio defasados:** `ARCHITECTURE.md` (OpenClaw 2026.9.8, `imageModel: null`, "game-art entrega só especificações"); `ROADMAP.md` parado no ciclo 2 | [E] binário 2026.11.2; leitura | Média | Agente que lê o doc antigo age com premissa falsa (regra de precedência ajuda, mas não basta) | Atualização documental em fase própria (`09` fase 5), sem tocar config | F |
| C14 | **Código vivo em dois lugares com o mesmo caminho lógico:** worktree `workspaces/game-dev/qo` (branch `quality-overhaul`) × `projects/prototypes/GS-003/prototype` desatualizado no master; `GAME-ASSETS` divergente (T6) | [L] Etapa 2 T6; [E] git `qo` 3289e32 | Média | Agente lê ou corrige a cópia errada | Fato registrado no contexto comum §6 e na proposta do game-dev; unificação é decisão técnica posterior | F (quando houver etapa técnica) |
| C15 | **Drimogemon × Digmon** no catálogo de sprites (`SP-DRIMOGEMON` aponta para Digmon) e demais D2–D4 | [L] Etapa 4 | Média | Prova da Etapa 6 com espécie errada ou nome inconsistente | Armadilha listada no contexto comum §3.8 e em `04` R5; decidir D2–D4 antes de sprite novo | **F** |

## 2. Riscos (implantação e operação)

| # | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R1 | **Contexto longo demais:** contexto comum (147 linhas) + `AGENTS.md` (60–64 linhas não vazias) em toda sessão consome janela e uso; aumenta a chance de queda por limite de 5 h | Média | Médio | O `AGENTS.md` só **aponta** para o contexto comum; ler "inteiro" só o game-studio; especialistas leem as seções da tarefa. Medir na fase piloto (`09` fase 2) |
| R2 | **Contexto comum desatualiza** (decisões novas do fundador) e vira mais um documento antigo | Alta | Alto | Dono único (game-studio); versão e data no topo; atualização obrigatória junto com cada ADR novo; regra de precedência no próprio arquivo |
| R3 | **Implantação parcial** (alguns agentes com o `AGENTS.md` novo, outros com o antigo) gera duas regras de IP ao mesmo tempo | Média | Alto | Implantar os 7 `AGENTS.md` numa única fase, com backup e verificação por md5 (`09` fase 3) |
| R4 | **Mudança de `AGENTS.md`/`SOUL.md` sem efeito** no runtime `claude-cli` (arquivos lidos só no início da sessão; sessão em curso continua com o antigo) | Média | Médio | Aplicar com nenhum agente ativo; testar com sessão nova (`09` fase 4) |
| R5 | **Conduta não é bloqueio técnico:** escopo de escrita, "só game-art gera no PixelLab", concorrência e profundidade de subagente são regra de texto | Alta | Médio | Registrado em `06` §5. Mudança técnica (política por agente) exige decisão do fundador e mexe em config; fora desta etapa |
| R6 | **Queda por limite de uso** durante a implantação ou durante a Etapa 6 (mais de 8 quedas em 10–12/11; esta etapa caiu às 23:13) | Alta | Médio | `PROGRESS.md` por passo; implantação em fases curtas e independentes; backup antes de cada fase |
| R7 | **Regra "um agente por vez" expira em 15/11** sem decisão sobre o que vale depois. `05` §2 regra 6 e a proposta do game-studio assumem "depois, máx. 4" — isso é **[H]**, não decisão | Média | Médio | Pedir ao fundador a regra pós-15/11 antes de implantar (`RELATORIO` decisão pendente) |
| R8 | **Proposta tratada como aprovada:** os arquivos de `03_PROPOSTAS` têm aviso "não está em uso", mas um agente que os encontre pode segui-los | Baixa | Médio | Aviso no topo de cada arquivo; pasta fora dos workspaces; nenhuma referência a eles nos arquivos operacionais |
| R9 | **Prévia pública aberta sem login** com sprites oficiais (G-3) | [L] Média | Alto (IP) | Decisão do fundador; regra "publicação só com aprovação separada" em todas as propostas |
| R10 | **Orçamento PixelLab:** ~738 gerações restantes em 12/11 [L]; Etapa 6 propõe teto de 150 | Baixa | Médio | Teto por abordagem em `07` P4; conferir `get_balance` antes da Etapa 6 |
| R11 | **Commit misturado:** o repo raiz já tinha alterações não commitadas de outra frente antes da Etapa 5 (`.gitignore`, `PROJECT_LOG.md`, ADR-007, ADR-010, `USER.md` do game-studio) | [E] Alta | Médio | Esta etapa não commitou nada; ao commitar a Etapa 5, adicionar **só** `studio-alignment/` por caminho (`09` fase 0) |

## 3. Coerência interna dos entregáveis 01–07 (revisão desta retomada)

| # | Achado | Onde | Ação |
|---|---|---|---|
| K1 | Régua de aprovação nova em `07` §6 (≥ 8, nenhum < 7) diferente de GS-010 citado na proposta do game-qa | `07` §6 × `03_PROPOSTAS/game-qa` §4 | Virou C6; decisão do fundador. `07` não foi reescrito nesta retomada (pronto, não refazer) |
| K2 | `06` §1 dá ao game-studio "◐ gerar arte no PixelLab (raro)"; a proposta do game-studio diz "não produz arte quando existe especialista" | `06` × `03_PROPOSTAS/game-studio` §3 | Compatível se lido como exceção registrada com revisão de outro agente (proposta §6 "Arte"). Ajustar texto de `06` na implantação |
| K3 | `06` §2 põe "aprova internamente: game-studio" para mapa e UI, enquanto `02` dá a função World Design a game-design (A) | `06` §2 × `02` §1 | Compatível: em `06` "aprova internamente" = revisão de coordenação (passo 2/7), não validação de consistência (passo 4). Deixar explícito na implantação |
| K4 | "Depois de 15/11, máx. 4 tarefas" aparece como regra em `05` e na proposta do game-studio, mas não há decisão | `05` §2.6; `_build/game-studio_body.md` §6 | Virou R7; decisão pendente |
| K5 | Caminho do Style Bible no brief (`workspaces/game-dev/qo/...`) não é o real (`projects/.../quality-overhaul/phase3/style-bible/`) | PROGRESS; contexto comum §7 usa o real | Sem ação; registrado |
| K6 | Inventário, matriz, regras da Database, fluxo, permissões e briefing usam a mesma atribuição de funções, a mesma legenda [E]/[L]/[H] e as mesmas decisões abertas (G-1, G-2, D2–D10, ADR-013) | `01`–`07` | Coerentes |
| K7 | As 7 propostas de `AGENTS.md` têm a mesma estrutura (§1–§8), cabeçalho "PROPOSTA… não está em uso" e apontam para o contexto comum; as regras da Database aparecem por função (research: dono; design: Camada B; art: espécie certa/Drimogemon; qa: conferência; dev: fora do runtime) | grep nas propostas | Coerentes. game-dev e game-qa não citam Drimogemon/Camada pelo nome, mas exigem `04` e o contexto comum §3.8/§5 |

## 4. O que este relatório não cobre

- Política de ferramentas por agente no gateway (não lida; ver `01` §5).
- Conteúdo de `memory/` e `DREAMS.md` dos agentes.
- Risco jurídico de IP além do já registrado nos ADR (não é parecer jurídico).
