# Validação de mapas — resumo

- **Data:** 2026-11-10T05:49:49.374Z

| Mapa | Perfil | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| digimon-forest-01 | factory-v1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| forest-proof | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| praia | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| test-meadow | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| vila | legacy | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |
| forest-factory-test | factory-v1 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **PASS** |

## digimon-forest-01 — PASS

- 56x40 tiles de 32px · 673 objetos (prop 642, curve 6, start 2, spawn 8, npc 3, portal 1, trigger 1, poi 9, boss_arena 1) · sólido 47.7% · alcançável 99.1% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 109 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 24/24 (start 2, spawn 8, npc 3, poi 9, boss_arena 1, portal 1)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/fp4_denseedge_w47: 954 tiles w47, borda 'in'
  - ground/fp7_wg_c16: 222 tiles c16, borda 'in'
  - ground/fp4_path_w47: 394 tiles w47, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido

## forest-proof — PASS

- 64x46 tiles de 32px · 1612 objetos (prop 1598, start 6, spawn 6, portal 2) · sólido 64% · alcançável 98.8% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_below, objects_above, collision, spawns, npcs, triggers, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 69 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 14/14 (start 6, spawn 6, portal 2)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/fp4_denseedge_w47: 2046 tiles w47, borda 'in'
  - ground/fp4_path_w47: 197 tiles w47, borda 'in'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido

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

## vila — PASS

- 36x26 tiles de 32px · 53 objetos (prop 48, start 3, portal 2) · sólido 9.2% · alcançável 100% das células livres

- ✅ **layers** — Camadas obrigatórias presentes
  - perfil legacy; para factory-v1 faltariam: ground_detail, objects_below, objects_above, collision, spawns, npcs, triggers, poi
- ✅ **tile_ids** — IDs de tile existentes
- ✅ **asset_keys** — Chaves visuais resolvem em PNG (dia/noite)
  - 19 chaves verificadas
- ✅ **reach** — BFS do início do jogador alcança 100% dos alvos
  - alvos alcançados: 5/5 (start 3, portal 2)
- ✅ **placement** — Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição
- ✅ **wang** — Máscaras de autotile coerentes entre vizinhos
  - ground/vl5_path_blob: 128 tiles blob16, borda 'out'
- ✅ **species** — Espécies dos spawns existem em world-species.json
- ✅ **portals** — Portais com destino válido

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
