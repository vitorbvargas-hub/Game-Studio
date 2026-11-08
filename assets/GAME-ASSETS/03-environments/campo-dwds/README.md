# Bioma: Campo (fontes reais Digimon World DS)

- Tile: 32x32.
- `tiles/ground_grass_real.png` e `tiles/ground_sand_real.png`: recorte retangular direto (sem chroma-key, chao e sempre opaco) de `Digi-Farm-Default` (DW DS), ripada por Atlanta. Camada `official-fan-use`.
- `tiles/grass_00/01`, `tiles/path_full`, `tiles/path_edge_s`: tiles derivados (pixel matrix + dither), paleta amostrada das folhas DW DS reais (`art/src/dwds_palette.js`). Camada `original`.
- `props/`: 2 arvores, 2 arbustos, pedras, 2 canteiros de flor, placa, cerca -- `biome_props.js`, camada `original`.
- `tileset.png`: contact sheet de tiles+props. `tileset.json`: grid/colisao/camada sugerida.
- Licenca detalhada por grupo em `license.json`.
- Mantem `03-environments/grass/` (pack 100% original anterior) como fallback -- nada la foi alterado.
