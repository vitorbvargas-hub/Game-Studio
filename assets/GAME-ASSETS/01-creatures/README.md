# 01-creatures

Uma pasta por criatura, nome `CREATURE-NNNN/` (4 dígitos, zero-padded), contendo:

```
CREATURE-NNNN/
  creature.json      — manifest (schema: ../07-manifests/creature.schema.json)
  license.json        — origem/licença (ver ASSET_LICENSE_POLICY.md)
  sprites/             — PNG individuais por frame (SPRITE_SPECIFICATION.md §6)
  spritesheets/        — PNG empacotado + atlas JSON
  animations/          — JSON de animação (se não estiver embutido em creature.json)
  previews/            — GIF/PNG ampliado para revisão rápida (não é asset final)
  source/              — script gerador (se pixel art por código) ou arquivo editável
```

## Subpastas de organização cruzada

- **`original/`** — criaturas 100% autorais do estúdio (inclui redesenhos Digimon-fan sob
  a exceção do ADR-007 — ver `license.json.fanException`).
- **`reference/`** — nunca um asset final; só para registro de que uma criatura foi
  avaliada a partir de uma referência de terceiro (o arquivo de referência em si não
  mora aqui, mora em `art/reference/` do workspace, fora do git — ver `ASSET_LICENSE_POLICY.md`).
- **`approved/`** — atalho/índice (pode ser symlink ou lista no manifest agregado) das
  criaturas com `approvalStatus: APPROVED` ou `INTEGRATED`, para o visualizador não
  precisar varrer tudo.
- **`evolution-lines/`** — agrupa `CREATURE-NNNN` por linha evolutiva (ex. um JSON por
  linha listando a sequência de IDs), não duplica os assets.

Não duplicar sprites entre `CREATURE-NNNN/` e essas subpastas de organização — elas
referenciam por ID, nunca copiam arquivo.
