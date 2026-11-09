# Validação — digimon-forest-01

- **Data:** 2026-11-09T22:19:09.017Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| digimon-forest-01 | factory-v1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## digimon-forest-01 — PASS

- 56x40 tiles de 32px · 1798 objetos (prop 780, collision 23, curve 6, decal 959, patch 5, start 2, spawn 8, npc 3, portal 1, trigger 1, poi 9, boss_arena 1) · sólido 49.7% · alcançável 97.3% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 137 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 24/24 (start 2, spawn 8, npc 3, poi 9, boss_arena 1, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/fp4_denseedge_w47: 954 tiles w47, borda 'in'
  - ground/fp7_wg_c16: 222 tiles c16, borda 'in'
  - ground/fp4_path_w47: 394 tiles w47, borda 'in'
  - ground/fp8_cliff_top_blob: 24 tiles blob16, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
