# ADR-009 — GS-003 reset: Idle MMORPG pixel art (briefing do fundador)

- **Data:** 2026-11-08
- **Decisor:** Vitor Vargas (fundador). Mandou parar tudo e reavaliar com base em 6 documentos de briefing, numa imagem conceito e nas referências (IdleDex, Drakantos, Guilmon/Digimon World DS, DigimonWorldSpriteManager).
- **Substitui:** a direção visual e de telas dos ADR-006/008. Os ADR-007 (fan game não comercial) e ADR-008 (visual aprovado antes do código) continuam valendo.
- **Nome:** o briefing chama o projeto de "GS-001". No estúdio ele continua sendo o **GS-003**, porque GS-001 já existe.

## Visão consolidada

- **Produto:** um Idle MMORPG 2D em pixel art. A jogabilidade e a experiência vêm do IdleDex, o mundo, os cenários e o acabamento vêm do Drakantos, e a personalidade e as animações das criaturas vêm de Guilmon e do Digimon World DS.
- **Visual:** top-down 3/4, mundo vivo (vegetação, água, pedras, construções), criaturas pequenas e expressivas e efeitos sem exagero. A imagem conceito está em `projects/prototypes/GS-003/art/reference/concept-founder/`.
- **Combate no próprio mapa (obrigatório):** nunca há tela de batalha separada. As entidades têm os estados IDLE, WALK, FOLLOW, ENGAGE, ATTACK, HURT, DEFEAT e RETURN. A lógica fica separada da apresentação, e o servidor tem a autoridade. A animação nunca decide o resultado.
- **Arena:** fica para o futuro. Nada de arena, matchmaking ou ranking PvP agora. O `arena-spike` está congelado.
- **Digimon primeiro:** primeiro se faz o inventário completo de fontes de Digimon (Prioridade Zero). Ordem de uso:
  1. sprite de Digimon encontrado e com uso permitido;
  2. adaptação de asset autorizado;
  3. animação original;
  4. criatura original, só para preencher lacuna.

  Nunca se substitui um Digimon por um monstro genérico.
- **Pipeline:** um catálogo de assets com status (DISCOVERED, UNDER_REVIEW, APPROVED, REJECTED, NEEDS_CREATION, INTEGRATED) e pontuação de 0 a 100, a biblioteca `GAME-ASSETS/`, manifests por criatura, um visualizador de sprites interno e QA por asset.
- **Agentes:** reaproveitamos os especialistas que já existem, cada um num papel do briefing:

  | Papel do briefing | Agente |
  |---|---|
  | research | game-research |
  | art-director, sprite-artist, animator, world-designer, sprite-generator | game-art |
  | developer | game-dev |
  | QA | game-qa |

  Não criamos agentes permanentes novos: o briefing pede para não duplicar especialistas equivalentes.

## Escopo de franquia

- **Só Digimon** (fundador, 2026-11-08: "esquece do pokemon, vamos focar no digimon"). A Linha A (Pokémon) fica fora do escopo do GS-003 por tempo indeterminado. Nenhuma tarefa, asset ou pesquisa de Pokémon.

## Licença (camadas)

`reference` (só estudo) → `private-prototype` (uso local, não versionado, não publicado) → `licensed` (licença verificada) → `original` (criado pelo estúdio) → `rejected`.

- **Sprites oficiais extraídos de jogos** (DW DS/Dawn/Dusk, PMD Chunsoft e outros rips): **LIBERADOS pelo fundador em 2026-11-08** ("vamos fazer fan games, pode usar as sprites oficiais, em todos locais"). Valem em todo o projeto e no git, com a camada `official-fan-use`. A estratégia: usar os oficiais primeiro e substituir aos poucos por arte própria (`original`). Cada asset registra a origem e os créditos (ripper, fonte).
- Continuam valendo do ADR-007: nenhuma monetização, nenhum logo oficial, aviso de fan game e **publicação só com aprovação separada** do fundador.
- Nada é comprado, publicado ou contratado sem aprovação.

## Achados verificados [E] (2026-11-08)

- **DigimonWorldSpriteManager:** é uma ferramenta local que baixa os rips do Digimon World DS (cerca de 320 folhas) do Spriters Resource para uma pasta ignorada pelo git, para uso pessoal. Os próprios autores dizem "© Bandai/Namco".
- **E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites:** sprites animados **oficiais** de DW DS, Dawn e Dusk, organizados por estágio. O README diz "Game official sprites only… property of Bandai Namco".
- **PMD Collab:** os Pokémon da Gen 1 à 4 são da CHUNSOFT (oficiais), e os da Gen 5 em diante são de fãs, com licença CC BY-NC 4.0.
- **Drakantos:** MMORPG top-down em pixel art de alto acabamento, da Wingeon. O press kit é público, e as imagens servem só como referência.
