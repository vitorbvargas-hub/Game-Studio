# Legenda dos PNGs esquemáticos

Gerados por `render-preview.mjs` (Node puro, sem dependências novas — PNG escrito à mão com `node:zlib`).
Uso: `node render-preview.mjs <brief.json> <saida.png> [escalaPxPorTile]`.

## Cores das zonas (`zones[].type`)

| Tipo | Cor | RGBA |
|---|---|---|
| `spawn_area` | verde claro | `120,196,120` |
| `clearing` | amarelo areia | `232,214,125` |
| `concentration` | laranja | `224,120,70` |
| `secret` | roxo | `150,90,200` |
| `boss_arena` | vermelho | `196,40,40` |
| `water` | azul | `60,140,220` |
| `rock_field` | cinza-pedra | `140,130,120` |
| `village_hub` | rosa | `230,150,190` |
| `cave_floor` | cinza-roxo | `110,100,110` |
| `dune` | areia | `224,200,140` |
| `cliff` | marrom-pedra | `150,120,100` |
| fora de qualquer zona | verde-escuro (mata/borda) | `26,46,30` |

## Rotas

| Tipo | Cor |
|---|---|
| `main` | marrom escuro, mais grossa |
| `secondary` | marrom claro, mais fina |

## Marcadores (pontos)

| Elemento | Forma/cor |
|---|---|
| `pois[]` | círculo ciano |
| `npcs[]` | círculo azul |
| `interactables[].type === "chest"` | quadrado laranja |
| `interactables[].type === "sign"` | quadrado amarelo |
| `interactables[].type === "heal_point"` | quadrado rosa |
| `bossArena` | X vermelho na posição |
| `exits[]` | retângulo branco com borda escura, na posição/tamanho real do portal |

## Arquivos gerados nesta entrega

- `digimon-forest-01.png` (560×400px, 10px/tile) — o piloto, entregável pedido.
- `template-forest.png`, `template-village.png`, `template-cave.png`, `template-desert.png`, `template-mountain.png` (6px/tile) — bônus, mesma ferramenta aplicada aos 5 modelos, para conferência visual rápida.

Onde uma rota passa por cima do centro de uma zona, a cor da rota aparece por cima (rotas são desenhadas depois das zonas) — isso é esperado, não um defeito.
