# 02 — Matriz de responsabilidades (7 funções → agentes existentes)

- **Data:** 2026-11-12 · **Base:** brief §6, ADR-009 (papéis → agentes), ADR-012 §3–4 (11 papéis → agentes), `research/etapa3-imersao/08_CONTEXTO_AGENTES.md`, inventário `01`.
- **Regra:** nenhum agente novo. Funções, não pessoas.
- **Legenda RACI:** **R** executa · **A** responde pela qualidade da função e assina a validação interna · **C** consultado antes · **I** informado depois. A homologação final de entrega é sempre do **fundador** (fora da RACI, fluxo em `05`).

## 1. Função → dono

| Função (brief §6) | Dono principal (A) | Apoio (R/C) | Base da atribuição |
|---|---|---|---|
| **Game Director** — visão, prioridades, consistência, aprovação interna de entregas | `game-studio` | todos (C) | SOUL do coordenador; ADR-012 §3 ("coordena, prioriza e integra") |
| **Digimon Research** — universo, Database, evoluções, verificação de fontes | `game-research` | `game-design` (C, Camada B) | Etapas 3 e 4 já feitas por ele; Etapa 3 §4 propôs a função dentro do game-research |
| **Game Design** — progressão, sistemas, relacionamento, combate, economia | `game-design` | `game-research` (C, fidelidade), `game-dev` (C, viabilidade) | SOUL; ADR-012 (UI-UX) |
| **Art Director** — identidade visual, sprites, animações, cenários, consistência | `game-art` | `game-qa` (C, medição) | ADR-012 §3 (GAME-ART-DIRECTOR, pode rejeitar qualquer asset) |
| **World Design** — mapas, regiões, biomas, exploração, composição | **`game-design` (A) + `game-art` (R visual)** — ver §3 | `game-research` (C, bioma e fidelidade), `game-dev` (C, formato e colisão) | ADR-012 (WORLD-COMPOSER = game-design + game-art) |
| **Game Development** — arquitetura, implementação, integração, testes técnicos | `game-dev` | `game-qa` (C) | SOUL; ADR-012 (MAP-ENGINEER, GAME-INTEGRATOR) |
| **QA** — validação visual e funcional, regressões, evidências | `game-qa` | — | SOUL ("independente do desenvolvedor"); ADR-012 (VISUAL-QA); Etapa 2 |

`game-growth`: **sem função própria** no Digital Odyssey (ADR-007 proíbe monetização). Proposta em §4.

## 2. RACI por tipo de entrega

| Entrega | Director (studio) | Research | Design | Art | Dev | QA | Fundador |
|---|---|---|---|---|---|---|---|
| Escopo e critérios de uma etapa | **A/R** | C | C | C | C | C | aprova |
| Dado da Camada A (espécie, estágio, atributo, golpe, aresta) | I | **A/R** | I | I | I | C (validador) | — |
| Proposta da Camada B (regra de evolução, vínculo, parceiro especial) | C | C (fidelidade) | **A/R** | I | C | I | aprova via ADR |
| Sistema de jogo (combate, progressão, economia, curva) | C | C | **A/R** | I | C | C | aprova |
| Style Bible / direção visual | C | C (fidelidade Digimon) | C | **A/R** | C | C (medição) | aprova |
| Sprite de Digimon / Tamer / animação | I | C (espécie certa) | I | **A/R** | C (formato) | C | homologa |
| Mapa / região / bioma (layout, história, exploração) | C | C | **A** (estrutura) | **R** (arte e composição) | C | C | homologa |
| Tileset / props | I | — | C | **A/R** | C | C | — |
| UI / HUD / Digivice | C | — | **A/R** (fluxo) | R (arte) | C | C | homologa |
| Integração no jogo (código) | C | — | C | C | **A/R** | C | autoriza |
| Homologação técnica/funcional/visual | I | — | I | I | I | **A/R** | homologa |
| ADR | **R** (redige) | C | C | C | C | — | **A** (decide o não reversível) |
| Publicação, deploy, gasto, IP | R (prepara) | C (risco IP) | — | — | R (técnico) | C | **decide** |

## 3. World Design: por que não tem um dono único

A função existe dividida desde o ADR-012 (WORLD-COMPOSER = game-design + game-art), e o `PROJECT_LOG.md` mostra o custo disso: v13 r1 "sem floresta", v14 "miolo vazio, trilhas em K e J", v15 "pomar" — as reprovações foram de **composição**, não de pixel, e o coordenador acabou fazendo a v15b à mão.

**Proposta (para o fundador decidir; recomendação do autor):**
- **`game-design` é o dono (A) da estrutura do mundo:** história do mapa, fluxo do jogador, zonas (segura, mato, clareira de fortes), pontos de interesse, NPC e interação, densidade de encontro, ligação entre regiões. Entrega um **layout-brief** com grade, legenda e critérios (o P7 da clareira já foi nesse formato).
- **`game-art` é o executor (R) da composição visual** dentro desse layout (massas de árvore, ritmo, profundidade, água, transições) e o dono da qualidade visual.
- **`game-dev`** é consultado sobre formato (Tiled `.tmj`, colisão, conversor PixelLab).
- **O `game-studio` não produz mapa.** Se precisar intervir, devolve com critério; produção à mão pelo coordenador só com registro explícito de que a revisão será de outro agente.

Alternativa descartada: dar World Design inteiro ao game-art. Concentraria ainda mais um agente que já é diretor e produtor, e manteria sem dono a parte de gameplay do mapa (G4/G8 da Etapa 2: mapa sem NPC nem interação).

## 4. game-growth: proposta

Não criar função artificial. Propostas, em ordem de preferência:
1. **Dormente no Digital Odyssey.** Contexto mínimo dizendo que o jogo não tem monetização (ADR-007) e que o agente só é acionado para: (a) plano de comunidade e canais de fan game **se** o fundador decidir publicar; (b) métricas de playtest/telemetria local, sem coleta comercial.
2. Apoio ao `game-research` em risco de remoção (DMCA/C&D) e padrão histórico de fangames — hoje já é atribuição do research (ADR-007 §impacto), então só como C.

## 5. Papéis anteriores (ADR-009/012) → funções desta matriz

| Papel citado em ADR/briefs | Função | Agente |
|---|---|---|
| GAME-ART-DIRECTOR, CHARACTER-DESIGNER, DIGIMON-ARTIST, ENVIRONMENT-ARTIST, ASSET-GENERATOR | Art Director | game-art |
| ANIMATION-DIRECTOR / SPRITE-ANIMATOR | Art Director (direção) + Game Development (sistema) | game-art + game-dev |
| WORLD-COMPOSER, world-designer | World Design | game-design (A) + game-art (R) |
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
6. **Nenhum agente aprova sozinho mudança estratégica** (brief §7): referência visual, escala, IP, publicação, regras congeladas, roadmap.
