# Map Factory — modelos do game-design gerados como mapas de teste

Gerado por `npm run map:templates` (kit `forest-v6`). Fonte: `world-design/briefs/templates/*.json` (schema oficial v1) → `scripts/map-factory/adapt-brief.mjs` → gerador → validador. Saída em `tests/fixtures/maps/templates/` (não registrada no jogo).

Todos usam a arte de floresta (forest-v4 + forest-v6): não há kit de caverna, deserto, montanha ou vila na Map Factory ainda. O teste é da planta (zonas, rotas, alcance, colocação, espécies e portais), não do visual do bioma.

| Modelo | Bioma | Tamanho | layers | tile_ids | asset_keys | reach | placement | wang | species | portals | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `template-cave` | cave | 28x48 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | FAIL |
| `template-desert` | desert | 60x36 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | FAIL |
| `template-forest` | forest | 48x36 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | FAIL |
| `template-mountain` | mountain | 40x56 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | FAIL |
| `template-village` | village | 36x26 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS |

## Falhas e motivos

### template-cave

- portals: portal 'exit-entrada': 'forest-proof' não tem o início 'from_template-cave'

### template-desert

- portals: portal 'exit-oeste-montanha': destino 'montanha_overworld' não é um mapa conhecido

### template-forest

- portals: portal 'exit-exemplo': 'vila' não tem o início 'from_template-forest'

### template-mountain

- portals: portal 'exit-sul-floresta': 'forest-proof' não tem o início 'from_template-mountain'

## Decisões do adaptador por modelo

- `template-cave`: sem ajuste
- `template-desert`: sem ajuste
- `template-forest`: sem ajuste
- `template-mountain`: sem ajuste
- `template-village`: sem ajuste
