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

- `template-cave`: rota 'rota_atalho': meandro (9 pontos intermediários entre 7 waypoints); rota 'rota_tesouro': meandro (5 pontos intermediários entre 4 waypoints); AVISO spawn 'spawn-tesouro-miniboss': radiusTiles 5 recortado pela zona 'bifurcacao_tesouro' (9×8) → área de sorteio 9×8 tiles (raio efetivo ~4, 72% da área pedida)
- `template-desert`: rota 'rota_principal': meandro (7 pontos intermediários entre 5 waypoints); rota 'rota_secundaria': meandro (17 pontos intermediários entre 7 waypoints); AVISO spawn 'spawn-hagurumon': radiusTiles 10 recortado pela zona 'duna_aberta' (40×16) → área de sorteio 20×16 tiles (raio efetivo ~8, 80% da área pedida); AVISO spawn 'spawn-numemon': radiusTiles 7 recortado pela zona 'zona_concentracao' (10×10) → área de sorteio 10×10 tiles (raio efetivo ~5, 51% da área pedida); AVISO spawn 'spawn-garurumon': radiusTiles 7 recortado pela zona 'zona_concentracao' (10×10) → área de sorteio 10×10 tiles (raio efetivo ~5, 51% da área pedida); AVISO spawn 'spawn-angemon': radiusTiles 5 recortado pela zona 'oasis_secreto' (9×7) → área de sorteio 9×7 tiles (raio efetivo ~3, 63% da área pedida)
- `template-forest`: rota 'rota_principal': meandro (7 pontos intermediários entre 6 waypoints); rota 'rota_secundaria': meandro (6 pontos intermediários entre 4 waypoints); AVISO spawn 'spawn-stage2-a': radiusTiles 7 recortado pela zona 'zona_concentracao' (9×9) → área de sorteio 9×9 tiles (raio efetivo ~4, 41% da área pedida)
- `template-mountain`: rota 'rota_principal': meandro (10 pontos intermediários entre 8 waypoints); rota 'rota_secundaria': meandro (10 pontos intermediários entre 5 waypoints); AVISO spawn 'spawn-gotsumon': radiusTiles 6 recortado pela zona 'encosta_1' (14×10) → área de sorteio 12×10 tiles (raio efetivo ~5, 83% da área pedida); AVISO spawn 'spawn-growlmon': radiusTiles 7 recortado pela zona 'zona_concentracao' (16×10) → área de sorteio 14×10 tiles (raio efetivo ~5, 71% da área pedida); AVISO spawn 'spawn-greymon': radiusTiles 7 recortado pela zona 'zona_concentracao' (16×10) → área de sorteio 14×10 tiles (raio efetivo ~5, 71% da área pedida); AVISO spawn 'spawn-dorugreymon': radiusTiles 4 recortado pela zona 'boss_arena' (12×7) → área de sorteio 8×7 tiles (raio efetivo ~3, 88% da área pedida)
- `template-village`: rota 'trilha_cruz_vertical': meandro (4 pontos intermediários entre 3 waypoints); rota 'trilha_cruz_horizontal': meandro (6 pontos intermediários entre 3 waypoints)
