# world-design — Map Factory, Etapa 1 (World Designer)

- **Autor:** game-design · **Data:** 2026-11-09 · **Base:** ADR-011 (Map Factory), `docs/briefing/12_map_factory_v2.md`, ADR-009/010, `prototype/world/`.
- **Papel nesta frente:** entrega da Etapa 1 do pipeline de 5 etapas (Briefing + planta). As etapas seguintes (direção de arte, tileset/montagem, validação, integração) são de game-art e game-dev.

## Conteúdo

```
world-design/
├── MAP_BRIEF_SCHEMA.md          # explicação do formato (ler primeiro)
├── map-brief.schema.json        # JSON Schema draft-07 do formato
├── briefs/
│   ├── digimon-forest-01.json   # piloto "Digimon Forest — Prototype 01"
│   └── templates/
│       ├── forest.json + .md
│       ├── village.json + .md
│       ├── cave.json + .md
│       ├── desert.json + .md
│       └── mountain.json + .md
├── previews/
│   ├── render-preview.mjs       # gera PNG esquemático a partir de um brief.json (Node puro)
│   ├── LEGEND.md                 # legenda de cores/marcadores dos PNGs
│   ├── digimon-forest-01.png    # entregável pedido (piloto)
│   └── template-*.png           # bônus: mesma ferramenta aplicada aos 5 modelos
└── scripts/
    └── validate-brief.mjs       # validador leve (checagem manual, não é um motor de JSON Schema)
```

## Como validar um brief

```
node scripts/validate-brief.mjs briefs/digimon-forest-01.json
```

## Como gerar o esquema visual de um brief

```
node previews/render-preview.mjs briefs/digimon-forest-01.json previews/digimon-forest-01.png 10
```

## O que NÃO está aqui

- Nenhum `.tmj.json` jogável — isso é da Etapa 3 (game-dev), que consome estes briefs.
- Nenhuma arte (tiles, sprites) — Etapa 2 (game-art).
- Nenhum gate automático real (BFS de colisão, validação de encaixe Wang) — Etapa 4 (game-qa). O campo `designGates` de cada brief é só a autoavaliação do game-design.
