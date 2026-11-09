# forest-v6 — pacote suplementar de peças (Map Factory, 2026-11-09)

Gerado por `art/src/gen_forest_v6_pieces.js` (`node art/src/gen_forest_v6_pieces.js`), pelo pipeline local (Canvas.js, sem custo, sem PixelLab), porque o MCP PixelLab está em 401 (ADR-011). Não é um reforço do jogo ainda: `prototype/world` continua usando só `forest-v4`/`forest-v4.1` (`GAME-ASSETS/03-environments/forest-v4/`, pacote `fp4_`). Nenhum código do jogo foi alterado por esta entrega.

## Por que "v6" e não "v5"

`GAME-ASSETS/03-environments/forest-v5/` já existe (experimento com o Ninja Adventure Asset Pack, CC0, 2026-11-08) e **não foi adotado** pelo jogo (`prototype/world/README.md` linha ~448: "forest-v5 não foi usado"). Para não colidir com esse nome nem reabrir aquela entrega, este pacote é `forest-v6` — mas é um pacote **suplementar** (peças que faltam), não um substituto completo do forest-v4.1 como o v5 tentou ser.

## O que tem aqui

- `tiles/water_blob_0..15.png` — autotile de água com borda, 16 peças (mesma geometria de corte de canto em quarto-de-círculo do `path_blob`/`denseedge_blob` do forest-v4), com uma passada extra de respingo de espuma (`waterFoam`, Endesga-32 `#2ce8f5`) na linha de costura água/grama. O fundo de cada peça reaproveita `grassVariant()` de `forest_v4_tiles.js`, então a água encaixa visualmente com o chão de grama já existente no mapa.
- `props/bridge_h.png` (96×32, 3 tiles) e `props/bridge_v.png` (32×96, rotação 90°) — deque de madeira, caminhável (`collision:false`), para atravessar até 3 tiles de água em linha.
- `props/rock_big.png` (44×36) e `props/rock_small.png` (18×14) — rochas com colisão, diferentes do `rock_cluster.png` já existente no forest-v4.
- `props/chest_closed.png` (24×22) — baú de madeira com tarjas douradas e fechadura, 1 estado só (fechado).
- `props/sign_post.png` (20×28) — placa de madeira em poste, com uma marca "!" de referência (o texto real de cada placa é dado de mapa, não arte).
- `props/healing_point.png` (36×36) — ponto de cura: anel de pedra + poço brilhante ciano/branco com partículas, sem colisão (o jogador fica em cima para acionar).
- `tileset.json` — mesmo schema do `tileset.json` do forest-v4 (biome/tile/grid/layers/autotile/tiles/props), com um campo `note` deixando explícito que isto é um pacote suplementar.
- `license.json` — mesmo schema do forest-v4, tudo `layer: "original"`, técnica e paleta citadas.
- `preview.png` — prancha com as 16 peças de água + os 7 props, em 2×.

## Técnica (mesma convenção do forest-v4/v4.1)

- `Canvas.js` (matriz de pixel, `fillEllipse`/`fillRect`/`line`/`blendPixel`), sem bibliotecas externas.
- Autotile: o algoritmo de corte de canto do `buildBlobTile()` de `forest_v4_tiles.js` foi **reimplementado** aqui (aquela função não é exportada pelo módulo) com a mesma geometria — não é uma técnica nova.
- `rimDarken()` de `forest_v4_props.js` é reaproveitado sem alteração (import direto).
- Paleta: ramps de `forest_v4_palette.js` (`bark`, `ground.stone`, `ground.moss`, `ink`) + aliases cruas do Endesga-32 em `endesga32.js` (`W.waterDeep/waterMid/waterBright/waterFoam/gold/orange/white`) — nenhuma cor nova inventada.
- Luz de cima-esquerda (regra do `ART_STYLE_GUIDE.md` §5): rochas, baú e placa têm o lado superior-esquerdo mais claro e a base com sombra de contato em elipse.

## Integração (fora do escopo de escrita do game-art nesta entrega)

Este pacote **não foi ligado** ao `forest-proof.aliases.json` nem ao gerador de mapa (`scripts/gen-forest-proof.mjs`) — isso é trabalho de game-dev (papel "Tileset Engineer + Map Builder" do briefing). Duas opções razoáveis para quando isso acontecer:

1. Prefixo próprio `fp6_` ao lado do `fp4_` existente (mais simples, sem risco de colisão de nome).
2. Mesclar fisicamente os arquivos para dentro de `GAME-ASSETS/03-environments/forest-v4/` (tiles/props) e manter só o prefixo `fp4_` — mais limpo a longo prazo, mas exige mover arquivo e atualizar `forest-v4/tileset.json`/`license.json` de lá, fora do escopo de escrita desta tarefa (`projects/prototypes/GS-003/art/` apenas).

## Limitações (autocrítica)

- **Só versão de dia.** Não existe `night/` para este pacote (o forest-v4 tem preset noturno completo; este não) — se o fundador quiser água/bridge/rochas à noite, é trabalho adicional, provavelmente tingimento + rim-light frio como o `nightgrade.ts` já faz com as entidades.
- **Sem Wang-47.** A água usa o blob de 16 peças (mesmo nível do `path_blob`/`denseedge_blob` originais do v4), não o Wang-47 de 47 peças que o v4.1 trouxe para path/denseedge — os cantos internos (duas bordas de água sem a diagonal) ainda podem formar o mesmo "xadrez" que o Wang-47 corrigiu para a trilha. Não testei isso num mapa real porque não há mapa com água ainda.
- **`chest_closed.png` não tem estado aberto/vazio** — só a primeira entrega da §4 do briefing pede "1 prop interativo" fechado; um segundo estado é barato de gerar depois com a mesma técnica (`create_object_state`-like edit manual), mas não foi feito aqui.
- **`rock_small.png` ficou com pouca textura** (duas elipses + rim-darken) — funcional como decor pequeno, mas visualmente mais simples que `rock_big` ou o `rock_cluster` do v4.
- **Nada disto foi testado no motor real** (`prototype/world`, intocado por instrução desta tarefa) — são PNGs estáticos, como as entregas anteriores do forest-v4/v5 também foram antes de serem ligadas ao jogo.
- **Sem NPC, arena do chefe, flores/cogumelos digitais e entrada de área secreta** — ver `../FOREST_KIT_GAP.md` para por que esses ficaram de fora desta rodada (a maioria depende de decisão de design/layout de mapa, não é só arte de peça solta).
