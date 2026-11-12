# GAME-ASSETS — biblioteca de assets do GS-003

Biblioteca central de assets do GS-003 (Idle MMORPG pixel art), estrutura definida em
`docs/briefing/01_GS001_creature_world_foundation.md` §8 (ADR-009). Mantida pelo
game-art, consumida pelo game-dev (visualizador interno, integração no jogo) e pelo
game-qa (homologação).

- **Antes de adicionar qualquer asset aqui:** leia
  `projects/prototypes/GS-003/docs/ASSET_LICENSE_POLICY.md` (camadas, regras de git) e
  `projects/prototypes/GS-003/docs/ASSET_QA_CHECKLIST.md` (critérios de aprovação).
- **Formato de cada criatura:** `projects/prototypes/GS-003/docs/SPRITE_SPECIFICATION.md`
  e `07-manifests/creature.schema.json`.
- **Padrão de animação:** `projects/prototypes/GS-003/docs/ANIMATION_STANDARD.md`.
- **Direção de arte/paleta:** `projects/prototypes/GS-003/docs/ART_STYLE_GUIDE.md`.

## Estrutura

```
01-creatures/      — uma pasta por criatura (CREATURE-NNNN/), ver 01-creatures/README.md
02-animations/      — referência cruzada de animações por tipo (idle/walk/sleep/eat/attack/hurt/evolve/special)
03-environments/     — tiles e props de cenário (grass/forest/water/rocks/buildings/props)
04-effects/          — efeitos visuais (particles/combat/evolution/skills)
05-ui/               — elementos de HUD/UI
06-audio/            — áudio (fora do escopo desta entrega de arte visual)
07-manifests/        — schemas JSON (creature.schema.json) e manifests agregados
08-licenses/         — licenças agregadas / CREDITS.md consolidado
09-previews/         — previews/contact sheets gerados para revisão rápida
10-source-files/      — arquivos-fonte editáveis (scripts de geração, não PNG final)
```

Cada pasta raiz (01–10) tem seu próprio `README.md` com as regras específicas daquela
categoria. Camadas de licença (`reference`/`private-prototype`/`licensed`/`original`/
`rejected`) e o que nunca entra no git estão em `ASSET_LICENSE_POLICY.md`, não aqui.
