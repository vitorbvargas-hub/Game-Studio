# Validação — praia

- **Data:** 2026-11-10T07:15:16.167Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| praia | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## praia — PASS

- 44x28 tiles de 32px · 11 objetos (prop 6, start 2, spawn 2, portal 1) · sólido 31.4% · alcançável 100% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_below, objects_above, collision, spawns, npcs, triggers, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 7 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 5/5 (start 2, spawn 2, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/pr5_water_blob: 381 tiles blob16, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
