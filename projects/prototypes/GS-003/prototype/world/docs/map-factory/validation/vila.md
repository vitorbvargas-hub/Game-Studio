# Validação — vila

- **Data:** 2026-11-09T16:18:12.495Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| vila | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## vila — PASS

- 36x26 tiles de 32px · 51 objetos (prop 48, start 2, portal 1) · sólido 9.2% · alcançável 100% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_below, objects_above, collision, spawns, npcs, triggers, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 19 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 3/3 (start 2, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/vl5_path_blob: 120 tiles blob16, borda 'out'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
