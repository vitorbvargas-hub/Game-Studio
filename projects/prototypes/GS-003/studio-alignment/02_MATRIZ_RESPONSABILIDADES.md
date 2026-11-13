# 02 — Matriz de responsabilidades (7 funções → agentes existentes)

- **Data:** 2026-11-12 · **Base:** brief §6, ADR-009 (papéis → agentes), ADR-012 §3–4 (11 papéis → agentes), `research/etapa3-imersao/08_CONTEXTO_AGENTES.md`, inventário `01`.
- **Revisão 1 (2026-11-13, Fase 1 da implantação):** aplicadas as decisões do fundador de `COMANDO_IMPLANTACAO_ETAPA5.md` §3–§7 (tabela dos 7 agentes, World Design, game-growth ativo no Nível 1, concorrência). Histórico da proposta original em §7.
- **Regra:** nenhum agente novo. Funções, não pessoas.

## 0. Os 7 agentes (decisão do fundador, 2026-11-13)

| Agente | Responsabilidade |
|---|---|
| game-studio | Game Director e coordenação |
| game-research | Universo Digimon, fontes e Database |
| game-design | Sistemas, mecânicas, UX e World Design |
| game-art | Direção de arte, sprites, animações e cenários |
| game-dev | Arquitetura, desenvolvimento e integração |
| game-qa | Qualidade, testes e homologação técnica |
| game-growth | Marketing, comunicação e comunidade (Digital Odyssey Marketing & Community Lead, **ativo no Nível 1**) |
- **Legenda RACI:** **R** executa · **A** responde pela qualidade da função e assina a validação interna · **C** consultado antes · **I** informado depois. A homologação final de entrega é sempre do **fundador** (fora da RACI, fluxo em `05`).

## 1. Função → dono

| Função (brief §6) | Dono principal (A) | Apoio (R/C) | Base da atribuição |
|---|---|---|---|
| **Game Director** — visão, prioridades, consistência, aprovação interna de entregas | `game-studio` | todos (C) | SOUL do coordenador; ADR-012 §3 ("coordena, prioriza e integra") |
| **Digimon Research** — universo, Database, evoluções, verificação de fontes | `game-research` | `game-design` (C, Camada B) | Etapas 3 e 4 já feitas por ele; Etapa 3 §4 propôs a função dentro do game-research |
| **Game Design** — progressão, sistemas, relacionamento, combate, economia | `game-design` | `game-research` (C, fidelidade), `game-dev` (C, viabilidade) | SOUL; ADR-012 (UI-UX) |
| **Art Director** — identidade visual, sprites, animações, cenários, consistência | `game-art` | `game-qa` (C, medição) | ADR-012 §3 (GAME-ART-DIRECTOR, pode rejeitar qualquer asset) |
| **World Design** — mapas, regiões, biomas, exploração, composição | **`game-design` (estrutura e layout-brief) + `game-art` (composição visual)** — ver §3 | `game-dev` (R, engenharia e integração), `game-qa` (validação independente), `game-research` (C, bioma e fidelidade) | Decisão do fundador 13/11; ADR-012 |
| **Game Development** — arquitetura, implementação, integração, testes técnicos | `game-dev` | `game-qa` (C) | SOUL; ADR-012 (MAP-ENGINEER, GAME-INTEGRATOR) |
| **QA** — validação visual e funcional, regressões, evidências | `game-qa` | — | SOUL ("independente do desenvolvedor"); ADR-012 (VISUAL-QA); Etapa 2 |
| **Marketing & Community** — estratégia, Instagram, devlog, comunidade, beta fechado, análise | `game-growth` (Nível 1: só planejamento interno) | `game-design`, `game-research`, `game-art`, `game-qa` (C, verificação do conteúdo); `game-studio` (consolida) | Decisão do fundador 13/11 (§4) |

## 2. RACI por tipo de entrega

| Entrega | Director (studio) | Research | Design | Art | Dev | QA | Fundador |
|---|---|---|---|---|---|---|---|
| Escopo e critérios de uma etapa | **A/R** | C | C | C | C | C | aprova |
| Dado da Camada A (espécie, estágio, atributo, golpe, aresta) | I | **A/R** | I | I | I | C (validador) | — |
| Proposta da Camada B (regra de evolução, vínculo, parceiro especial) | C | C (fidelidade) | **A/R** | I | C | I | aprova via ADR |
| Sistema de jogo (combate, progressão, economia, curva) | C | C | **A/R** | I | C | C | aprova |
| Style Bible / direção visual | C | C (fidelidade Digimon) | C | **A/R** | C | C (medição) | aprova |
| Sprite de Digimon / Tamer / animação | I | C (espécie certa) | I | **A/R** | C (formato) | C | homologa |
| Mapa / região / bioma (layout, história, exploração) | C (coordena) | C | **A/R** (estrutura, layout-brief) | **A/R** (composição visual) | R (engenharia e integração) | valida (independente) | homologa |
| Tileset / props | I | — | C | **A/R** | C | C | — |
| UI / HUD / Digivice | C | — | **A/R** (fluxo) | R (arte) | C | C | homologa |
| Integração no jogo (código) | C | — | C | C | **A/R** | C | autoriza |
| Homologação técnica/funcional/visual | I | — | I | I | I | **A/R** | homologa |
| ADR | **R** (redige) | C | C | C | C | — | **A** (decide o não reversível) |
| Publicação, deploy, gasto, IP | R (prepara) | C (risco IP) | — | — | R (técnico) | C | **decide** |
| Conteúdo de marketing (estratégia, calendário, legenda, roteiro, devlog) — **R = game-growth** | A (consolida) | C (afirmações sobre Digimon, IP) | C (mecânicas) | C (material visual) | — | C (estado real do jogo) | **autoriza** toda divulgação pública |

Na linha de mapa, o `game-dev` é **R** da engenharia e da integração e o `game-qa` faz a validação independente (§3). O `game-studio` aparece como C: coordena, não produz.

## 3. World Design (DECIDIDO pelo fundador, 2026-11-13)

| Agente | Responsabilidade |
|---|---|
| `game-design` | Estrutura de mapas, **layout-brief** (grade, legenda, critérios), fluxo de exploração, regiões, biomas, pontos de interesse, distribuição de encontros e interações |
| `game-art` | Composição visual, cenários, tilesets e sprites, profundidade, atmosfera, acabamento, animações e consistência estética |
| `game-dev` | Engenharia e integração técnica dos mapas (Tiled `.tmj`, colisão, camadas, conversor PixelLab, desempenho) |
| `game-qa` | Validação independente de composição, escala, funcionalidade e desempenho |
| `game-studio` | Coordenação e priorização. **Não produz mapas e não homologa o próprio trabalho** |

Motivo (registrado na proposta original): as reprovações v13 r1 "sem floresta", v14 "miolo vazio" e v15 "pomar" foram de composição, e o coordenador acabou fazendo a v15b à mão. Composição e densidade dos mapas como **critério** continuam conflito visual aberto, tratado na Etapa 6.

## 4. game-growth: Digital Odyssey Marketing & Community Lead (DECIDIDO, 2026-11-13)

- **Status:** **ATIVO no Nível 1 — Planejamento interno.** Níveis 2–4 são roadmap futuro, **não autorizado**.
- **Responsabilidades:** estratégia, Instagram, diário de desenvolvimento, comunidade, beta fechado e análise — no Nível 1, só como documento interno.
- **Não pode (Nível 1):** publicar, agendar, enviar mensagens, responder comentários, criar ou conectar contas, criar anúncios, gastar, coletar dados de interessados, abrir inscrições, divulgar data de beta, qualquer ação pública.
- **Integração:** fluxo marketing ↔ desenvolvimento em `05` §3.5. Não aciona outros agentes; o `game-studio` dispara as verificações, uma por vez.
- Texto completo: `03_PROPOSTAS/game-growth/AGENTS.md` e `SOUL.md`; contexto comum §10–§11.

## 5. Papéis anteriores (ADR-009/012) → funções desta matriz

| Papel citado em ADR/briefs | Função | Agente |
|---|---|---|
| GAME-ART-DIRECTOR, CHARACTER-DESIGNER, DIGIMON-ARTIST, ENVIRONMENT-ARTIST, ASSET-GENERATOR | Art Director | game-art |
| ANIMATION-DIRECTOR / SPRITE-ANIMATOR | Art Director (direção) + Game Development (sistema) | game-art + game-dev |
| WORLD-COMPOSER, world-designer | World Design | game-design (estrutura) + game-art (composição) + game-dev (engenharia) + game-qa (validação) |
| UI-UX-DESIGNER | Game Design | game-design |
| MAP-ENGINEER, GAME-INTEGRATOR, developer | Game Development | game-dev |
| VISUAL-QA, QA | QA | game-qa |
| research, "Pesquisador Digimon" (Etapa 3 §4), Database (Etapa 3 §11) | Digimon Research | game-research |
| "Arquiteto de Sistemas" (Etapa 3 §5) | Game Design (regras) + Game Development (schema runtime) | game-design + game-dev |
| Orquestrador | Game Director | game-studio |

## 6. Regras de separação (valem para todas as funções)

1. **Ninguém aprova o próprio trabalho** (ADR-012 §3). Quem produz não dá a nota final do próprio artefato; no game-art, diretor e produtor rodam em sessões separadas e a revisão fica registrada.
2. **QA não corrige**; aponta com evidência e caminho de correção.
3. **Research não decide regra de jogo**; aponta quando uma proposta contradiz a franquia.
4. **Design não altera a Camada A**; propõe na Camada B.
5. **Dev não implementa sem autorização** do Game Director, apoiada em entrega validada (fluxo `05`).
6. **Nenhum agente aprova sozinho mudança estratégica** (brief §7): referência visual, escala, IP, publicação, regras congeladas, roadmap, nível do game-growth.
7. **Um agente de execução e uma tarefa por vez** até a conclusão e a homologação da Etapa 6; depois, o fundador decide se autoriza até 4 simultâneas.

## 7. Histórico (proposta original de 2026-11-12, substituída)

- World Design: a proposta deixava a decisão ao fundador entre "game-design dono da estrutura + game-art executor" e "tudo no game-art". O fundador decidiu a primeira forma, acrescentando os papéis de game-dev e game-qa (§3).
- game-growth: a proposta original o deixava sem função própria no fangame, acionado só a pedido. O fundador decidiu ativá-lo como Marketing & Community Lead no Nível 1 (§4).
