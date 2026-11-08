# Bioma: Floresta densa (fontes reais Digimon World DS)

- Tile: 32x32.
- `tiles/ground_grass_shade_real.png`: recorte retangular direto (grama perto do aglomerado de arvores denso) de `Beast-Digi-Farm` (DW DS, Atlanta), escurecido (`shade()`, multiplicacao de brilho) para ler como borda de clareira -- mesmo pixel real, so tingido, sem redesenho. Camada `official-fan-use`. Le melhor como *borda/clareira* da floresta; o chao de copa fechada usa os tiles derivados escuros abaixo.
- `tiles/forest_floor_00/01`, `tiles/grass_edge`: tiles derivados (mato mosqueado escuro), paleta DW DS. Camada `original`.
- `props/`: 3 arvores de floresta (copa alta/densa), 2 arbustos, pedras, canteiro branco (cogumelo/flor). Camada `original`.
- `tileset.png` / `tileset.json` / `license.json` como nos outros biomas.
- Mantem `03-environments/forest/` (pack anterior) como fallback.
