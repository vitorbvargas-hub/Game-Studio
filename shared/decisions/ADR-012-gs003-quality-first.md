# ADR-012 — GS-003: Quality First (GS-008 a GS-011)

- **Data:** 2026-11-09 · **Decisor:** Vitor Vargas (fundador) · **Registro:** game-studio
- **Fonte:** `projects/prototypes/GS-003/docs/briefing/13_gs008_quality_first.md`, `14_gs009_instanced_world.md`, `15_gs010_visual_quality_overhaul.md` e `16_gs011_master_execution.md`. Ordem de execução pedida pelo fundador: 08 → 09 → 10, unificados pelo 11.

## Decisões
1. **Prioridade absoluta: qualidade visual.** Fica congelada a expansão do mundo (mapas novos, regiões novas, conteúdo em escala) até o fundador aprovar o piloto. O GS-010 é a especificação principal de execução.
2. **Fases (GS-011):** 1 Diagnóstico → 2 Preparação → 3 Laboratório visual → 4 Integração → 5 Homologação. Cada fase só avança com evidência no jogo.
3. **Autoridade artística:** o **game-art** assume o papel de GAME-ART-DIRECTOR. Pode rejeitar qualquer asset, e nenhum agente aprova o próprio trabalho visual. O **game-studio** coordena, prioriza e integra.
4. **Agentes:** nenhum agente permanente novo. Os 11 papéis dos GS-008/010 são distribuídos entre os agentes existentes (tabela abaixo).
5. **Homologação:** média ≥ 9 e nenhuma categoria < 8 nos 12 critérios do GS-010 §8, com evidência. Exige aprovação do game-art (diretor) e aprovação visual do fundador. As notas são critério interno e não afirmam equivalência objetiva com o Drakantos.
6. **Mundo (GS-009):** regiões fechadas, ligadas por mapa-múndi e portais. **[E]** O jogo já tem mapa-múndi, 6 regiões no GDD, portais e save v4+ (`prototype/world/README.md`). Ou seja, o GS-009 é adaptação e acabamento, não construção do zero.
7. **Não pode:** compras, gastos, publicação, apagar assets originais, trocar engine/renderer, mudanças irreversíveis.

## Papéis → agentes
| Papel (GS-008/010) | Agente |
|---|---|
| GAME-ART-DIRECTOR, CHARACTER-DESIGNER, DIGIMON-ARTIST, ENVIRONMENT-ARTIST | game-art (o diretor revisa em sessão separada do produtor) |
| ANIMATION-DIRECTOR, SPRITE-ANIMATOR | game-art (direção) + game-dev (sistema de animação/estado) |
| WORLD-COMPOSER | game-design + game-art |
| UI-UX-DESIGNER | game-design |
| MAP-ENGINEER, GAME-INTEGRATOR | game-dev |
| ASSET-GENERATOR (SD/PixelLab) | game-art |
| VISUAL-QA | game-qa |
| Pesquisa de referência | game-research |

## Registro central
`projects/prototypes/GS-003/quality-overhaul/PROJECT_LOG.md`
