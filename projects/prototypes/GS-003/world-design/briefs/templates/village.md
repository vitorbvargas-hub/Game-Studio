# Modelo de mapa — Vila

- **Arquivo de dados:** `village.json`.
- **Inspirado em:** `vila_dos_bebes` (`regions.json`) e no mapa real `vila.tmj.json` (36×26 tiles, pacote `vila-v5`, `prototype/world/README.md`).

## Layout

Zona segura (`safeZone: true`), sem selvagens (`wildSpecies: []` em `regions.json`). Layout de **hub**, não de exploração:

```
            spawn_area (entrada, geralmente ligada à Floresta)
                       |
   ---------- praça_central (casas, berços, ovos) ----------
                       |
             (trilha em cruz: eixo N-S + eixo L-O)
```

A "trilha em cruz" é a descrição literal do mapa real (`prototype/world/README.md`, seção "troca de mapa"): dois eixos retos que se cruzam na praça, ladeados por casas com colisão de área.

## Ritmo de exploração

Não há ritmo de dificuldade — é um hub social/seguro. O que varia é a **densidade de pontos de interação social**: NPCs residentes (moradores Baby I, um guardião/morador mais falante), berços/ovos como cenário, e sinalização clara para a única saída real (a Floresta).

## Faixa de nível

`vila_dos_bebes`: Nv.1–5 (`regions.json`), mas o nível não importa de fato — é liberada desde o início (`unlock.type: "none"`) e sem combate.

## Regras de distribuição

- **Spawns:** nenhum. Qualquer "zone" de concentração ou boss_arena está fora de escopo aqui.
- **NPCs:** reaproveitar os já catalogados em `bosses.json`/`regions.json` (`NPC-BOTAMON`, `NPC-PUNIMON`, `NPC-POYOMON`, `NPC-YURAMON`, `NPC-ELECMON`) em vez de inventar moradores novos — são Baby I não-hostis, com Elecmon como a voz mais "falante" do grupo.
- **Vegetação:** baixa em todo o mapa; a composição vem de construções e cercas, não de mata.
- **Saídas:** pelo menos uma ligação para a região de exploração seguinte (hoje, a Floresta Densa) — é o único "gate" de conectividade que uma vila precisa cumprir.
