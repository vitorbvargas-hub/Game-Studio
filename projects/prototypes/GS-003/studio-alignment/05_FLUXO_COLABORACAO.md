# 05 — Fluxo de colaboração (brief §7)

- **Data:** 2026-11-12 · **Base:** brief §7, ADR-012 §3/§5, `PROJECT_LOG.md` (padrões reais e falhas), matriz `02`.
- **Revisão 1 (2026-11-13, Fase 1 da implantação):** concorrência decidida pelo fundador (regra 6), World Design (regra 2 e §3.1) e fluxo marketing ↔ desenvolvimento (§3.5), conforme `COMANDO_IMPLANTACAO_ETAPA5.md` §3.3, §3.4 e §7.
- **Princípio:** nenhum agente aprova sozinho mudança estratégica; ninguém aprova o próprio trabalho.

## 1. Os 7 passos

```
[1] Fundador aprova a entrega
        │
[2] game-studio (Game Director): escopo, critérios mensuráveis, dono, teto de custo, caminho de saída  ──► brief escrito
        │
[3] Responsável(is) pesquisam e propõem (research / design / art)        ◄── consulta Database (04) e contexto comum
        │
[4] Validação de consistência:  visual → game-art (diretor, sessão separada)   |   sistema/mundo → game-design
        │            └── reprovou? volta ao [3] com o critério que falhou
[5] game-dev implementa SÓ com autorização do game-studio (e só o que foi validado no [4])
        │
[6] game-qa apresenta evidências (independente)       └── reprovou? volta ao [3] ou [5] com severidade e caminho
        │
[7] Fundador homologa  ──► game-studio registra (PROJECT_LOG, ADR se for decisão)
```

| Passo | Quem | Entrada | Saída obrigatória | Pode pular? |
|---|---|---|---|---|
| 1 | Fundador | pedido ou proposta do coordenador | aprovação explícita (texto) | Não |
| 2 | game-studio | aprovação | brief: objetivo, entradas, saída, critérios mensuráveis, teto, proibições, validador, retomada | Não |
| 3 | dono da função (matriz `02`) | brief | artefato + relatório (caminho, resumo, evidências, limitações, não feito, decisões) | Não |
| 4 | game-art (visual) / game-design (sistema, mundo) | artefato | parecer com nota por critério (visual: matriz Style Bible §8) ou checklist de consistência | Só quando a entrega é puramente documental de pesquisa (aí o game-studio revisa) |
| 5 | game-dev | artefato validado + autorização | commits locais, testes, capturas | Sim, se a entrega não vai para o jogo |
| 6 | game-qa | build ou artefato | relatório de evidências com status por item | Não para algo que vai ao jogo; opcional para documento |
| 7 | Fundador | relatório consolidado do game-studio | homologa / reprova / pede ajuste | Não |

## 2. Regras do fluxo

1. **Quem produz não valida.** Se o `game-art` produziu, o passo 4 é feito por outra sessão do `game-art` (diretor) **e** o passo 6 pelo `game-qa`. Se o `game-studio` produziu (ex.: v15b à mão), o passo 4 vai para o `game-art`.
2. **O passo 4 tem dono por natureza da entrega, não por quem pediu.** Mapa: estrutura e layout-brief → game-design; composição e pixel → game-art; engenharia → game-dev (passo 5); validação independente de composição, escala, funcionalidade e desempenho → game-qa (passo 6). O game-studio não produz mapa. UI: fluxo → game-design; arte → game-art.
3. **Conflito entre validadores** (ex.: game-design aprova o layout, game-art reprova a composição) vai ao `game-studio`, que decide se é reversível ou leva ao fundador.
4. **Contradição com a franquia** apontada pelo `game-research` em qualquer passo suspende a entrega até o `game-studio` decidir (ou o fundador, se for regra).
5. **Gate de custo:** gerações PixelLab, tempo e escopo do brief são teto. Estourar exige novo brief.
6. **Um agente de execução e uma tarefa por vez até a conclusão e a homologação da Etapa 6** (decisão do fundador, 2026-11-13). Depois disso, o fundador decide se autoriza até 4 simultâneas; até essa decisão, continua uma por vez. Nunca duas tarefas no mesmo worktree. A configuração global de concorrência não é alterada.
7. **"Feito" sem evidência não é feito.** Relatório sem caminho de arquivo, número ou captura volta.
8. **Decisões estratégicas** (lista em `06` §3) nunca saem dos passos 2–6: sobem ao fundador com recomendação.

## 3. Fluxos típicos

### 3.1 Asset visual (sprite, tileset, prop, mapa)
1 Fundador aprova → 2 brief com referência aprovada, escala-alvo em px, teto de gerações → 3 game-design entrega layout-brief (se mapa) e game-art compõe/produz → 4 game-art diretor (sessão separada) aplica matriz; game-design confere estrutura (se mapa) → 5 game-dev faz a engenharia e integra (autorizado) → 6 game-qa valida no jogo de forma independente (composição, escala, paleta contra as duas réguas, FPS, colisão) → 7 fundador. Os conflitos visuais abertos (paleta, escala, critério unificado, composição e densidade, convenções de sprite) não são resolvidos dentro deste fluxo: vão ao fundador na Etapa 6.

### 3.2 Regra de jogo (evolução, vínculo, parceiro especial)
1 Fundador abre o tema → 2 brief → 3 game-research levanta a franquia (com categoria e continuidade); game-design escreve a proposta na Camada B → 4 game-design valida consistência com sistemas existentes; game-research confere fidelidade → **ADR** redigido pelo game-studio → 7 fundador aprova o ADR → só então 5 (game-dev, após descongelamento) → 6 → 7.

### 3.3 Dado da Database
Erro ou expansão → game-studio → game-research (corrige via gerador, valida 0 erros) → game-qa pode rodar o validador como evidência → fundador só se mudar decisão (D2–D10).

### 3.4 Bug ou regressão
game-qa registra com severidade → game-studio prioriza → game-dev corrige (autorizado) → game-qa reverifica → fundador informado (homologa se fizer parte de entrega).

### 3.5 Marketing ↔ desenvolvimento (decisão do fundador, 2026-11-13)

```
[1] game-studio informa os marcos HOMOLOGADOS
        │
[2] game-growth identifica as oportunidades e prepara a proposta (Nível 1: documento interno)
        │
[3] game-design verifica afirmações sobre mecânicas
        │
[4] game-research verifica afirmações sobre Digimon (e risco de IP)
        │
[5] game-art verifica o material visual
        │
[6] game-qa confere se o conteúdo corresponde ao estado real do jogo
        │
[7] game-studio consolida
        │
[8] FUNDADOR autoriza qualquer divulgação pública
```

- **Aprovar um calendário ≠ autorizar a publicação.** Cada peça pública exige autorização específica do fundador e avaliação de risco de IP.
- O `game-growth` **não aciona** outros agentes: os passos 3–6 são tarefas que o `game-studio` dispara, **uma por vez** (regra 6). Passo que não se aplica (ex.: texto sem visual) é pulado com registro.
- No Nível 1 o resultado do passo 8 é no máximo "plano aprovado"; não há publicação, agendamento, conta nem interação. Mudar de nível é decisão separada do fundador (`06` §3).
- Material não homologado não aparece como final; métrica, data ou funcionalidade não confirmada não aparece como fato.

## 4. Retomada após queda (limite de uso)

| Situação | Ação |
|---|---|
| Sessão-pai pode dar followup | followup na mesma sessão: "continue de `<PROGRESS.md>`" |
| Sessão-pai é outra execução do cron ou o dashboard | spawn novo com o mesmo brief + "continue do parcial em `<caminho>`; confira o que já foi gerado no PixelLab" |
| Trabalho de código parcial não commitado | o novo game-dev primeiro inspeciona `git status`/diff, decide continuar ou descartar, e registra |
| Agente "caiu" mas entregou depois | conferir o caminho de saída antes de relançar (houve casos no log) |

## 5. Onde fica o registro

- `PROJECT_LOG.md` (game-studio): lançamento, queda, retomada, entrega, leitura do coordenador, custo, decisão do fundador.
- `shared/decisions/ADR-NNN-*.md`: toda decisão do fundador que muda regra, direção, escopo ou risco.
- Pasta da entrega: `PROGRESS.md` + relatório + evidências.
