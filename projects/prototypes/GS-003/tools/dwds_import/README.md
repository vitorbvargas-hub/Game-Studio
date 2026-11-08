# dwds_import: sprites oficiais de DW DS/Dawn/Dusk → GAME-ASSETS

## v2: folhas DS do Spriters Resource (`import_dwds_sheets.py`, 2026-11-08)

```bash
python3 import_dwds_sheets.py   # lê 10-source-files/dwds-sheets/*.png e regrava CREATURE-0002..0013 (v1 vai para versions/v1/)
```

- **Recorte:** chroma key pelas cores de fundo e de caixa de cada folha, componentes conexos (8-vizinhança) por região (mapa, batalha, HURT/ATTACK) e caixas fundidas a ≤ 2 px. A tabela `SHEETS` no script guarda, por folha, as cores-chave, as regiões e quais quadros são S/N/W/E. As direções foram conferidas no olho [H].
- **Mapa:** walk em 3 direções desenhadas (S, N, W) com E espelhado. Tsunomon e Gabumon desenham E também. O ciclo é f0-f1-f0-f2 e o idle é o quadro do meio. Todos os quadros de mapa de uma criatura têm o mesmo tamanho, com os pés na última linha e o centróide no pivô.
- **Ataque/dano no mapa:** a pose de batalha HURT/ATTACK é reduzida para a altura do sprite de mapa (moda por bloco, contorno escuro com peso 1,4, sem interpolar cor), o que mantém a proporção. O original em escala de batalha fica em `battle_idle`, `battle_hurt` e `battle_attack` (`space: "battle"`).
- **creature.json v2:** `schemaVersion: 2`, `dirFrames` por direção, `mapScale`, `targetHeightPx`, `nativeMapHeightPx`, `walkSpeedPxPerSec`, `combatStates` com `walk`, `attack` (`hitFrame`) e `hurt`. Atlas com `pivotPx` por quadro. A v1 fica intacta em `versions/v1/` (creature.json, license.json, sprites, spritesheets e previews).
- **license.json v2:** ripper e texto de crédito transcritos de cada folha, sha256 da folha e a v1 em `previousVersions`.
- **Gigimon (CREATURE-0002):** não existe no DS. O sprite de mapa é o idle E-M-B-E-R reduzido para a altura média dos In-Training do DS (19 px), com status `PENDING_OFFICIAL_MAP_SPRITE`.
- **Revisão:** `09-previews/dwds_map_sprites_contact_sheet.png` mostra uma linha por criatura, com walk de cada direção + hurt + attack de mapa, a 3x.

## v1: rip E-M-B-E-R (`import_ember.py`)

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
