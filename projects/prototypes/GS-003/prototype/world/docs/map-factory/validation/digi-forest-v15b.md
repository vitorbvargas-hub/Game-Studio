# Validação — digi-forest-v15b

- **Data:** 2026-11-12T15:04:59.118Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| digi-forest-v15b | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## digi-forest-v15b — PASS

- 48x36 tiles de 32px · 907 objetos (decal 8, prop 896, start 2, portal 1) · sólido 37.6% · alcançável 78.6% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_above, spawns, npcs, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 1746 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 3/3 (start 2, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - sem tiles de autotile
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
