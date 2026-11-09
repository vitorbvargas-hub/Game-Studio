# Modelo de mapa — Floresta

- **Arquivo de dados:** `forest.json` (mesmo schema de `map-brief.schema.json`).
- **Inspirado em:** `floresta_densa` (`src/data/content/regions.json`) e no mapa real `forest-proof.tmj.json`/`gen-forest-proof.mjs`.

## Layout

Mata fechada (sólida, intransponível) nas bordas, com uma ou mais clareiras ligadas por trilhas orgânicas (não retas). O padrão de 4 zonas do template:

```
 [borda de mata — sólida, sem zone, densidade "high"]
   spawn_area (entrada) → clareira_central → zona_concentracao → boss_arena
                              |
                      (rota alternativa contorna por fora)
```

- **Clareira central:** sempre perto do meio geométrico do mapa. É onde ficam os interativos "calmos" (baú, fonte de cura) — o jogador para ali antes de seguir.
- **Zona de concentração:** entre a clareira e o chefe. É onde a densidade de selvagens sobe (gate de dificuldade antes do chefe).
- **Features opcionais** (o piloto `digimon-forest-01.json` usa as duas): um riacho/lago cruzado por uma ponte, e uma zona secreta alcançável só por uma rota alternativa que não é a mais curta até o chefe.

## Ritmo de exploração

1. Entrada calma (baixa densidade, 1 NPC guia opcional).
2. Clareira central como "respiro" — baú, cura, visual aberto.
3. Densidade crescente ao se afastar da clareira em direção ao chefe.
4. Pelo menos uma rota alternativa que também chega ao chefe (gate obrigatório, ADR-011 §7), e opcionalmente mais uma rota só de exploração (zona secreta) que não precisa levar ao chefe.

## Faixa de nível

`floresta_densa`: Nv.1–15 (`regions.json`). Zonas internas sobem a faixa conforme a distância da entrada: stage 1 perto do spawn (Nv.1–5), stage 2 na zona de concentração (Nv.5–12), eventual stage 3 raro perto do chefe.

## Regras de distribuição

- **Vegetação:** alta na borda (mata fechada), baixa nas clareiras e na arena do chefe (legibilidade de combate), média na zona de concentração (cobertura, sem travar o BFS).
- **Spawns:** `density: "low"` perto do spawn, `"medium"` na zona de concentração. Nunca `"high"` encostado no spawn_area (o jogador precisa ter um primeiro contato tranquilo).
- **Espécies:** sempre as de `regions.json` → `wildSpecies` da região real que o mapa representa. O template usa Gigimon/Agumon só como exemplo da região `floresta_densa`.
