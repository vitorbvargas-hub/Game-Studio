# 11-characters — Tamers e NPCs humanos (DW DS)

## Direções: correção 2026-11-09 (defeito reportado pelo game-dev, commit `1e097f9`)

A folha de origem (`10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__NPC-Characters__48318.png`)
**não tem 4 vistas cardeais**. Tem só **2 vistas de frente** (rosto visível) e **2 vistas de costas**
(cabelo/nuca visível) — confirmado visualmente nos 4 grupos de linhas da folha e por diff de pixel
(nenhum par é espelho simples do outro, então não são a mesma vista espelhada). O importador antigo
rotulava essas 4 linhas como `S`/`N`/`W`/`E` cardeais, o que não é verdade.

**Correção:** `tools/char_import/extract_npc_characters.js` e `tools/char_import/build_tamer_presets.js`
agora rotulam as 4 linhas honestamente como diagonais:

| Rótulo novo | Rótulo antigo | O que é |
|---|---|---|
| `SW` | `S` | frente (vista A) |
| `SE` | `N` | frente (vista B) |
| `NW` | `W` | costas (vista A) |
| `NE` | `E` | costas (vista B) |

Front = `SW`/`SE` (rosto visível); costas = `NW`/`NE`. Qual vista exata é "-west" vs "-east" dentro de
cada par é leitura visual **[H]** (a diferença entre as duas é sutil neste pixel-art), mas é
**consistente** em toda a folha, porque todos os blocos de personagem compartilham a mesma grade fixa
(`ROWS_TOP`/`ROWS_BOT` em `extract_npc_characters.js`).

Isso afeta `official-npcs/NPC-00NN/` (regerado, 34 personagens) e `TAMER-0003..0014/` (regerado).
`TAMER-0001`, `TAMER-0002` e `player/` **não foram tocados** (arte própria do game-art, não vem desta
folha, já tem S/N/W/E reais).

### Mapeamento recomendado para o `FILE_DIR` do mundo

`prototype/world/src/assets/tamer-presets.ts` tinha `FILE_DIR: Record<Dir4, Dir4> = { S: "S", E: "N", N: "E", W: "W" }`
para tentar corrigir isso em runtime, com os rótulos antigos. É a mesma ideia (baixo/direita = frente,
cima/esquerda = costas) só que com nomes errados. Com os nomes novos, o equivalente direto é:

```ts
const FILE_DIR: Record<Dir4, string> = { S: "SW", E: "SE", N: "NE", W: "NW" };
// downgrade do mundo (4 direções) para as 4 vistas reais da folha (2 frente + 2 costas)
```

Ou seja: **down → SW, right → SE, up → NE, left → NW**. Com os arquivos já nomeados certo, o dev pode
trocar o `FILE_DIR` por esse mapa fixo (ou renomear as chaves do próprio contrato do mundo para
`SW/SE/NW/NE` direto, se preferir não ter um `Dir4→Dir8` no meio). Não editei `prototype/` — decisão de
qual dos dois caminhos é do game-dev.

## Cor do cabelo: correção 2026-11-09

`tools/char_import/kitbash.js: sampleHairSeed()` escolhia a cor mais frequente nos 45% de cima do
sprite como "a cor do cabelo" para recolorir. Na maioria das bases, a cor mais frequente nessa região
não é o cabelo — é o **contorno/sombra cel-shade** (ex. `#242424`), uma cor quase sem saturação usada
em várias partes do personagem, que vence a votação porque o preenchimento do cabelo em si fica
dividido entre 2-3 tons de sombreado. Recolorir um seed quase cinza para qualquer matiz-alvo continua
quase cinza (a fórmula preserva a saturação original do pixel), por isso **8 dos 12 presets** (0003,
0004, 0005, 0006, 0008, 0009, 0011, 0012) mostravam as 8 variantes idênticas; nos outros 3 (0007, 0010,
0014), o seed por acaso caiu perto de uma cor de roupa saturada e mudava a roupa em vez do cabelo. Só o
0013 tinha, por acaso, uma cor de cabelo bem saturada vencendo a votação.

**Correção:** `sampleHairSeed()` agora exige saturação mínima (tenta 0,18 → 0,08 → sem filtro, nessa
ordem, até achar algo), o que isola a cor de preenchimento do cabelo de verdade. Conferido nas 12 bases
usadas pelos presets antes de regenerar (seeds batem com a cor de cabelo visível em cada uma). Os 12
presets foram regerados; grade 12×8 (presets × 8 cores) conferida com `view_image` — todas as 96
combinações mostram cores de cabelo distintas, sem repetição e sem a roupa mudando junto.

## Acessório só na frente (correção que veio junto)

Goggles/viseira/óculos (`kitbash.js`) eram desenhados em cima de qualquer direção passada. Com `S`/`N`
tratados como "frente, direção ímpar" por acaso, o kitbash de óculos acabava indo parar também nas
vistas de **costas** (`W`/`E` antigos) em 7 dos 12 presets, e ficava fora da 2ª vista de frente (`N`
antigo). Corrigido junto: `accessory.dirs` dos presets com goggles/viseira/óculos agora é só
`FRONT_DIRS = ['SW', 'SE']` (as duas vistas de frente). Gola/boné/lenço continuam nas 4 vistas (fazem
sentido vistos de qualquer ângulo).

## GeoGreymon e Drimogemon (evoluções sem arte, pedido 2026-11-09)

- **GeoGreymon** (`CREATURE-0015`): importado de
  `10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__GeoGreymon__48577.png` pelo mesmo
  importador dos selvagens (`tools/dwds_import/import_evolution_creatures.js`, que reusa
  `import_wild_dwds.js`). A folha tem 5 poses grandes de batalha + uma grade pequena 5×3 de sprites de
  mapa; só a grade pequena foi usada. Das 5 linhas da grade, só **2** têm um ciclo de passada e um
  ângulo claramente distintos o bastante para eu confiar no rótulo (`S` = linha 1, de costas, 3 passos
  consistentes; `W` = linha 5, cujo 3º quadro é um perfil lateral claro); as linhas 2–4 repetem
  silhuetas quase idênticas à linha 1 e **não** entraram — forçar 4 direções delas seria reproduzir o
  mesmo tipo de rótulo-sem-confiança que este commit está corrigindo nos Tamers. `E` espelha `W`;
  **sem `N`** (vista de frente não identificada com confiança nesta folha). `S`/`W` aqui **são**
  rótulos cardeais reais (ao contrário da folha de NPCs acima) — vêm do mesmo tipo de grade 3×N dos
  outros selvagens 01NN, só que com cobertura parcial. `license.json` gerado automaticamente pelo
  importador (mesmo formato dos `CREATURE-01NN`).
- **Drimogemon:** **sem arte.** Conferido o `_manifest.json` inteiro da varredura de Spriters Resource
  (1074 entradas, 27 jogos) por nome e por nome de arquivo — nenhuma entrada bate com "Drimogemon" ou
  variações. Não existe localmente nenhuma folha oficial pra importar; não inventei substituto. Falta
  arte pra essa evolução até alguém achar/ripar uma folha com Drimogemon.

## Formato

Ver `TAMERS_V3_PRESETS.md` para a lista de presets, cores de cabelo e kitbash. Schema de
`character.json`/`creature.json` sem mudança de contrato (schemaVersion 1 para Tamers/NPCs, 2 para
creatures) — só os valores dentro de `directions`/`dirFrames` passaram a ser `SW/SE/NW/NE` em vez de
`S/N/W/E` nos arquivos tocados por esta correção.
