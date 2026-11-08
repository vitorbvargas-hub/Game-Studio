# dwds_import: sprites oficiais de DW DS/Dawn/Dusk → GAME-ASSETS

Importa os GIFs animados de `E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites` (rip de AngelOfHope, With the Will) das 4 linhas piloto para `assets/GAME-ASSETS/01-creatures/CREATURE-0002…0013`. Camada `official-fan-use` (ADR-009).

```bash
python3 import_ember.py                       # regenera tudo a partir de CREATURE-NNNN/source/<Nome>.gif
python3 import_ember.py --fetch-dir <pasta>   # copia antes os <Nome>.gif baixados para source/
```

Python 3 puro: o host não tem PIL nem ImageMagick, então `gifpng.py` faz a decodificação de GIF (LZW, transparência, disposal) e a codificação de PNG. O script confere o blob sha git de cada GIF contra o repositório de origem antes de importar.

## O que gera

| Saída | Conteúdo |
|---|---|
| `sprites/<id>_idle_<DIR>_NN.png` | Uma PNG por pose única. O rip toca A-B-C-B; a pose B é guardada uma vez só |
| `spritesheets/<id>.png` + `<id>.atlas.json` | Folha com 1 linha e 1 px de margem; atlas JSON Hash (TexturePacker/Phaser), com `pivot` em fração |
| `previews/idle_<DIR>_x4.png` | Os 4 quadros ampliados 4x, só para revisão |
| `creature.json` | Schema `07-manifests/creature.schema.json`. Pivô nos pés, centrado (`x = frameW/2`) com 1 px de chão; hitbox = bbox da união dos quadros; status `UNDER_REVIEW` |
| `license.json` | Camada, origem (repo, commit, caminho, blob sha, sha256), créditos e restrições |
| `01-creatures/evolution-lines/*.json`, `09-previews/pilot_lines_contact_sheet.png` | Linhas evolutivas; folha de contato com 4 linhas × 3 estágios, idle quadro 0, 2x, alinhada pelos pés |

## Como foi baixado (2026-11-08)

- `git clone`, `curl` para github.com, api.github.com, raw.githubusercontent.com e codeload.github.com: **bloqueados** (o proxy de egress responde `CONNECT tunnel failed, response 403`).
- `web_fetch` do OpenClaw em `api.github.com/repos/.../git/trees/main?recursive=1` e `.../git/blobs/<sha>`: **funciona**. O blob vem em base64 dentro do JSON, e o sha git confere byte a byte.
- Spriters Resource (as folhas overworld usadas pelo netraular/DigimonWorldSpriteManager): **bloqueado**, com 403 do desafio Cloudflare ("Just a moment...") tanto na galeria quanto em `/media/assets/`.
- `kaisadilla/digimon-sprite-collection`: acessível, mas não tem sprites de DW DS (são outros jogos e devices, e só alguns Digimon).

## Limitações

- A fonte tem **só o idle de batalha** (1 GIF por Digimon, 4 quadros, 1 direção). Walk, attack, hurt e sleep não existem nela.
- A direção foi atribuída no olho: SW (3/4 virado à esquerda, com SE espelhado) ou S (de frente: Tsunomon, Tokomon, Patamon, Angemon).
- A pose de batalha não é a pose top-down de mapa. A escala é a nativa do DS (34 a 135 px de altura) e não segue o tile 32.
