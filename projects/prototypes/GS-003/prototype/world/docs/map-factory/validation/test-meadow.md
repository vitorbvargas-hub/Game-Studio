# Validação — test-meadow

- **Data:** 2026-11-12T15:04:59.118Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| test-meadow | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## test-meadow — PASS

- 56x40 tiles de 32px · 164 objetos (prop 157, start 2, spawn 5) · sólido 10.3% · alcançável 100% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_below, objects_above, collision, spawns, npcs, triggers, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 34 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 7/7 (start 2, spawn 5)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - sem tiles de autotile
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
