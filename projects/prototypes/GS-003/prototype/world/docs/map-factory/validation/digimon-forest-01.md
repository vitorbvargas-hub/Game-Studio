# Validação — digimon-forest-01

- **Data:** 2026-11-09T17:09:28.125Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| digimon-forest-01 | factory-v1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## digimon-forest-01 — PASS

- 56x40 tiles de 32px · 874 objetos (prop 852, start 2, spawn 8, npc 1, portal 1, trigger 1, poi 8, boss_arena 1) · sólido 53.7% · alcançável 99.6% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 93 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 21/21 (start 2, spawn 8, npc 1, poi 8, boss_arena 1, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
  - ⚠️ spawn 'spawn-tanemon': 1 células livres da área de sorteio fora do alcance do jogador (bolsões)
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/fp4_denseedge_w47: 1276 tiles w47, borda 'in'
  - ground/fp6_water_blob: 58 tiles blob16, borda 'in'
  - ground/fp4_path_w47: 157 tiles w47, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
