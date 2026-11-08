# 03-environments

Tiles e props de cenário, por categoria: `grass/`, `forest/`, `water/`, `rocks/`,
`buildings/`, `props/`. Grade de 32px (`projects/prototypes/GS-003/docs/ART_STYLE_GUIDE.md`
§2) e paleta Endesga-32 (§4, subconjunto "vegetação/mundo" e "água").

**Atualizado 2026-11-08 (game-art):** `grass/`, `forest/` e `water/` têm tiles + props v1
(ver `license.json`/`README.md` de cada bioma). Os 3 são `original` (matriz de pixel via
`art/src/biome_tiles.js`/`biome_props.js`) — nenhum asset do `ASSET_DISCOVERY_CATALOG.md`
(Kenney, Pipoya, ansimuz etc.) pôde ser baixado nesta sessão por bloqueio de rede (ver
`CREDITS.md` para detalhe). `rocks/`, `buildings/` e `props/` soltas (fora de um bioma
específico) continuam vazias, para a próxima fase de produção de mundo. Mesma política de
licença de `ASSET_LICENSE_POLICY.md` se algum tile futuro vier de uma biblioteca externa
em vez de ser original.
