# 02-animations

Índice cruzado por **tipo** de animação (idle/walk/sleep/eat/attack/hurt/evolve/special),
útil para o visualizador interno filtrar "mostre todas as criaturas com Evolution
pronta", por exemplo — não é onde os PNGs de animação moram de fato (isso fica em
`01-creatures/CREATURE-NNNN/sprites/` e `.../spritesheets/`, ver
`projects/prototypes/GS-003/docs/SPRITE_SPECIFICATION.md`).

Convenção: cada subpasta (`idle/`, `walk/`, ...) guarda só um JSON leve por criatura
referenciando o manifest real (`{"creatureId": "CREATURE-0001", "path": "../../01-creatures/CREATURE-0001/creature.json"}`),
nunca o PNG. Nomes de animação e eventos seguem
`projects/prototypes/GS-003/docs/ANIMATION_STANDARD.md` (P0: idle, walk, sleep, follow,
hurt, attack; P1: eat, happy, interact, special, defeat, evolve; P2: dance, emotes,
social, rare, cosmetic).
