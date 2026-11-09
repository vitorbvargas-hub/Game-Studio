# Validação — forest-factory-test

- **Data:** 2026-11-09T16:18:12.495Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| forest-factory-test | factory-v1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## forest-factory-test — PASS

- 48x34 tiles de 32px · 782 objetos (prop 772, collision 1, start 2, spawn 2, npc 1, portal 1, trigger 1, poi 1, boss_arena 1) · sólido 62% · alcançável 98.4% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 63 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 8/8 (start 2, spawn 2, npc 1, poi 1, boss_arena 1, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
  - ⚠️ spawn 'santuario': 2 células livres da área de sorteio fora do alcance do jogador (bolsões)
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/fp4_denseedge_w47: 1108 tiles w47, borda 'in'
  - ground/fp4_path_w47: 91 tiles w47, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido
  - ⚠️ 'forest-proof' não tem portal de volta para 'forest-factory-test'
