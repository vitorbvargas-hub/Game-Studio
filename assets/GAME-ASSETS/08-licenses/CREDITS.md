# Créditos de assets: GS-003 (fan game Digimon, não comercial)

Digimon e todos os personagens, nomes e sprites oficiais são propriedade de Bandai Namco Entertainment Inc. (e de Akiyoshi Hongo / Toei Animation, quando aplicável). Este é um fan game sem fins lucrativos e sem afiliação com os detentores dos direitos (ADR-007, ADR-009).

## official-fan-use: sprites oficiais extraídos de jogos

| Criaturas | Jogo | Ripper | Preservação / fonte | Licença do arquivo |
|---|---|---|---|---|
| CREATURE-0002 a 0013: Gigimon, Guilmon, Growlmon, Koromon, Agumon, Greymon, Tsunomon, Gabumon, Garurumon, Tokomon, Patamon e Angemon (idle de batalha) | Digimon World DS / Dawn / Dusk (Nintendo DS) | AngelOfHope ([With the Will](https://withthewill.net/threads/digimon-sprite-animation-thread-read-first-post-fully-working.10472/)) | [E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites](https://github.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites), commit `4b2273e`, obtido em 2026-11-08 | Sem licença aberta. O README da fonte diz: "Sprites are property of Digimon and Bandai Namco Entertainment Inc/Namco Bandai Games". O uso foi liberado pelo fundador (ADR-009) só para este fan game |

| CREATURE-0003 a 0013 v2: sprites de MAPA (walk 4 direções, idle) e poses de batalha IDLE/HURT/ATTACK | Digimon World DS (Nintendo DS) | Guilmon: **Sonicteam24** · Growlmon e Koromon: **Atlanta** · Agumon e Patamon: **Mighty Jetters e redblueyellow** · Greymon: **A.J. Nitro e redblueyellow** · Angemon: **A.J. Nitro e Dazz** · Gabumon e Tsunomon: **redblueyellow** · Garurumon: **redblueyellow** (rip), **RadSpyro** (compilação), agradecimento a **Dazz** · Tokomon: **Verion** (texto de crédito transcrito de cada folha) | [The Spriters Resource, Digimon World DS](https://www.spriters-resource.com/ds_dsi/dgmnworldds/); folhas enviadas pelo fundador em 2026-11-08 (`10-source-files/dwds-sheets/`) | Sem licença aberta; © Bandai Namco. Uso liberado pelo fundador (ADR-009) só para este fan game. Importador: `projects/prototypes/GS-003/tools/dwds_import/import_dwds_sheets.py` |

O detalhe de cada arquivo (caminho, blob sha, sha256, modificações) está em `01-creatures/CREATURE-NNNN/license.json`. A v1 (rip E-M-B-E-R) de cada criatura fica preservada em `CREATURE-NNNN/versions/v1/`. O Gigimon não existe no DS: o sprite de mapa dele é o rip E-M-B-E-R reduzido (pendente).

## original: biomas e mockup de mundo (game-art, 2026-11-08)

| Asset | Pasta | Técnica | Licença |
|---|---|---|---|
| Bioma campo de grama (tiles de grama/caminho + props: árvores, arbustos, pedras, flores, placa, cerca) | `03-environments/grass/` | Matriz de pixel (Canvas.js, máscara 8x8 + dither determinístico) e primitivas em camadas para props | `original`, estudio (GS-003, ADR-007/ADR-009), sem IP de terceiros |
| Bioma floresta (piso + bordas + árvores densas, samambaia, pedras) | `03-environments/forest/` | Idem acima | `original`, estudio |
| Bioma beira d'agua (agua animada 2 quadros + margens + ponte de madeira + vitoria-regia + juncos) | `03-environments/water/` | Idem acima | `original`, estudio |
| `world_mockup_v1.png` (mockup 1280x720, campo de grama) | `09-previews/world_mockup_v1.png` | Composicao dos biomas acima + sprites oficiais reais (CREATURE-0003/0006/0009/0012, ja creditados acima) + placeholder de Tamer original + HUD original | Mista: tiles/props/Tamer/HUD `original`; Guilmon/Agumon/Gabumon/Patamon `official-fan-use` (mesma linha da tabela acima) |

Nota de processo: `ASSET_DISCOVERY_CATALOG.md` recomenda tentar primeiro fontes CC0/CC-BY (Kenney Roguelike/RPG pack, Pipoya, ansimuz Explosion Pack) antes de arte propria. Nesta tarefa, download binario via `exec`/`curl` retornou bloqueio de proxy ("403 CONNECT tunnel failed") e `web_search` ficou indisponivel -- o mesmo bloqueio ja documentado em sessoes anteriores (`TECH_AUDIT.md`, `ART_STYLE_GUIDE.md`). Sem poder baixar nem verificar hash dos pacotes do catalogo, os 3 biomas e o efeito de impacto do mockup usam a 2a prioridade do briefing (tiles proprios por matriz de pixel), evitando qualquer risco de licenca nao verificada. Detalhe por biome em `03-environments/<bioma>/license.json`.

## Restrições

- Nenhuma monetização, nenhum logo oficial, aviso de fan game visível (ADR-007).
- Publicar exige uma aprovação separada do fundador.
- A estratégia é usar os oficiais primeiro e substituir aos poucos por arte própria (camada `original`).
