# ADR-010 — GS-003: referência visual canônica (IdleDex + Drakantos + Digimon)

- **Data:** 2026-11-08
- **Decisor:** Vitor Vargas (fundador), nos scripts "CORREÇÃO GS-003 — Referência real do IdleDex" e "GS-004 — Canonical Visual Reference" (salvos em `projects/prototypes/GS-003/docs/briefing/07_*.md` e `08_*.md`).
- **Complementa:** ADR-009. O ADR-007 continua valendo com a regra 2 revogada.

## Visão do produto (nas palavras do fundador)

"Um MMORPG de Digimon com mundo vivo, floresta densa, exploração em grid, automação e evolução automática e offline, arena PvP, world bosses, dungeons, quests, vários jogadores e Digimons juntos e combate no próprio mapa."

## Papel de cada referência

| Referência | O que define |
|---|---|
| **IdleDex** (idledex.com/play) | **Estrutura**: MMO de captura no navegador, mundo compartilhado, movimento em grid, jogadores visíveis, encontros no mapa, rotas e regiões, caça automática, desbloqueio de regiões, minimapa, HUD inferior (inventário, atalhos, XP, equipe) e composição do mundo. |
| **Drakantos** (press.drakantos.com, Steam 2454980) | **Nível de qualidade**: pixel art, personagens, animações, efeitos, acabamento e apresentação. |
| **Digimon** | **Identidade completa**: criaturas, evoluções, ataques, atributos, personagens e ambientação. |

## Evidência canônica

A pasta `projects/prototypes/GS-003/evidence/idledex-canonical/` reúne a evidência que vale:

- **Imagem canônica:** `canonical_founder_screenshot_night_forest.png`, o print real do IdleDex enviado pelo fundador.
- **Apoio:** as cenas do vídeo do fundador (youtu.be/8a7yzDg6NDI) e a captura ao vivo do IdleDex.

**Fica DESCARTADA como referência do IdleDex** a imagem conceito gerada por IA ("Aventura Pixelada…", com o dino vermelho). Ela ainda pode inspirar o clima, mas não serve de evidência.

## Regras

- Não usar Pokémon como conteúdo. Não transformar o mundo em RPG medieval. Não usar monstros genéricos.
- Não abandonar a perspectiva e a composição da imagem canônica: visão de cima, tiles, vegetação densa, copas grandes, grama alta, flores, clareiras, nomes e níveis sobre as entidades e HUD inferior.
- **Nada de produção em massa e nenhuma mudança de arquitetura** antes que o fundador valide a **prova visual**.

## Decisões 2026-11-09

- **Arena PvP (GS-006):** o fundador aprovou o manual 1v1 em melhor de 3, no formato do vídeo de referência (LMB = golpe básico, mais os 4 slots), e o automático 3v3 com gambits. Os atributos não são normalizados por padrão; a normalização fica opcional e visível. Por enquanto o protótipo é local, contra um oponente "fantasma". O servidor exige aprovação à parte. Especificação: `docs/PVP_ARENA_SPEC.md`.
- **Arte:** o fundador autorizou fazer o ORÇAMENTO de tileset premium, PixelLab e freelancer, sem comprar. A compra exige aprovação.
- **Lição registrada:** a arte desenhada do zero pelos agentes (árvores, Gigimon, areia) ficou abaixo do nível pedido em várias tentativas. Daqui em diante, a preferência é: sprite oficial, depois asset profissional, depois arte própria.

## Prova visual exigida antes de escalar

Mapa de floresta com a composição da referência:

- árvores, grama alta, flores e caminhos;
- um jogador e outros jogadores visíveis;
- Digimons oficiais seguindo os treinadores;
- nomes e níveis;
- combate no próprio mapa, com efeitos;
- HUD inferior com inventário e equipe.
