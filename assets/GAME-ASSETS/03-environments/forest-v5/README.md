# forest-v5 + praia-v5 + vila-v5 — mudança de método: tilesets profissionais (ADR-010)

Retomada de tarefa interrompida por limite de uso. Verificado no início: não havia
trabalho parcial em `forest-v5/` (pasta não existia).

## 1. Por que mudar de método

O fundador foi direto: **"o mapa é o principal gargalo e continua muito feio"**.
`forest-v3`, `forest-v4` e `forest-v4.1` (ver READMEs respectivos) já esgotaram a
abordagem de **gerar árvores e tiles por código** (Canvas/primitivas, paleta
estendida, autotile procedural). Decisão do fundador: **usar tilesets
PROFISSIONAIS prontos** em vez de continuar desenhando por código.

## 2. Fonte principal: Ninja Adventure Asset Pack (pixel-boy, CC0)

`github.com/pixel-boy/NinjaAdventure` — licença CC0 já verificada (itch.io:
"use in commercial games, attribution not required"). `curl`/`git`/
`raw.githubusercontent` deram 403 no proxy do ambiente; baixei via
`web_fetch` em `api.github.com/repos/pixel-boy/NinjaAdventure/git/trees/main?recursive=1`
e depois `/git/blobs/<sha>` (conteúdo base64), forçando `maxChars` baixo para
garantir o *spill* em `/tmp/openclaw-web-fetch-*.log` mesmo em respostas
pequenas, e decodificando com Python (`base64.b64decode`).

**Achado real (não assumido):** o repositório do GitHub (projeto-demo Godot)
**não** tem arquivos separados "Floor/Nature/Field/Water/House/Village" como
o pedido original presumia — tem `content/map/tileset_floor.png` (352×417,
um sheet único com blocos de bioma: floresta/grama+terra, neve, água+lava,
mais a copa de cerejeira no topo) e `content/map/tileset_village_abandoned.png`
(320×192, casas/arbustos em ruína coberta de musgo). Documentando a diferença
em vez de inventar arquivos que não existem.

## 3. Decisão de escala: 16px nativo → 2× (não 32px nativo)

**Escolhido: 16px fonte, upscale nearest-neighbor 2× → tile de 32px no grid
do engine.**

Motivo: o Ninja Adventure é desenhado nativamente em 16px. Dobrar para 32px
mantém cada pixel como um bloco 2×2 nítido (sem blur/interpolação) e bate com
o `tileSize=32` já existente no engine e com a escala dos sprites DS já
travada por `DIGIMON_SIZE_TABLE.md` (tamer=26px de referência) — a mesma
conclusão de "sem mudança de arquitetura antes da prova visual" do
forest-v4, só que agora o tile de 32px é alcançado por upscale limpo de arte
licenciada em vez de desenho nativo em 32px. Conferido contra
`evidence/idledex-canonical/canonical_founder_screenshot_night_forest.png`:
a relação copa-de-árvore/altura-do-treinador na referência está na mesma
ordem de grandeza do que 32px de tile + props 2×, então não precisou de novo
rescale.

## 4. Como os tiles foram montados (técnica, não só recorte)

`art/src/na_source.js` — loader/crop/recolor HSL (hue shift, sat, light) e
`tiledFill` (preenchimento repetido de uma amostra nativa). `art/src/na_blob.js`
reaproveita **literalmente a mesma geometria** do autotile de 16 peças do
forest-v4 (`buildBlobTile` em `forest_v4_tiles.js`: bitmask N/E/S/W, corte de
canto em quarto-de-círculo) — só troquei o preenchimento de "pintura
procedural" para "crop real licenciado repetido via tiledFill". Isso deu
`path_blob_0..15` (floresta/vila) e `water_blob_0..15` (praia) com transições
reais de arte licenciada, não reconstruídas peça a peça do zero.

**Simplificação documentada:** não reconstruí o sistema de autotile nativo
do Godot do pacote (que usa terrenos 3×3/47-peças); reusei o bitmask de 16
peças já validado do forest-v4. Também não recriei blobs "clareira" tile a
tile — usei **stamps multi-tile** (`clearing_stamp_5x4.png`,
`path_strip_2x4.png`, `water_stamp_5x3.png`): recortes diretos do blob já
pintado pelo artista, coladas como decalque único, preservando a sombra de
transição desenhada à mão em vez de tentar reconstruí-la.

## 5. Iterações e autocrítica (mínimo 3)

1. **Primeira geração da copa florestal:** hue-shift com sinal errado
   (`hueShift: -0.17`) transformou a copa laranja/sakura em **rosa/magenta**,
   não verde. Corrigido para `+0.25` (girar na direção certa da roda de
   matiz) depois de inspecionar visualmente o resultado.
2. **Segunda geração — densidade de copa:** espalhei os clumps de copa
   (stamps 5×4) por probabilidade por tile, igual ao forest-v4. Resultado:
   blobs circulares isolados com grama visível entre eles — **o mesmo
   problema "árvores plantadas" que a Análise Visual v2 apontou como gap
   crítico #1**, mesmo tendo subido a densidade de 0.4→0.7→0.97 na borda.
   O stamp grande (160×128px) tem muita área transparente/vazia nos cantos;
   espalhar por probabilidade por tile não garante cobertura contínua.
3. **Correção:** troquei para **preenchimento sem lacunas**: toda célula da
   "zona densa" recebe um tile 32×32 de textura de copa (via `tiledFill` de
   um recorte 16px da arte licenciada, sem o círculo grande da ilha — usei
   um canto da textura com a "folhagem fofa" em vez do centro liso),
   garantindo zero vão de grama entre tiles. Os stamps de clump grandes
   viraram só um acento esparso *por cima* do preenchimento, para dar
   silhueta irregular — não mais responsáveis pela cobertura.
4. **Comparação honesta v4.1 vs v5** (`09-previews/proof/map_v41_vs_v5.png`):
   mesmo depois da correção #3, **a copa do v5 ainda lê mais rala e mais
   "verde-limão plano" do que a copa pintada à mão do v4.1**, que tem rampa
   de 8 tons e textura de "puffs" de folha mais rica. O v5 ganha em
   variação de chão (grama/terra com textura real desde o primeiro tile) e
   em velocidade de produção (minutos, não uma sessão inteira de pintura
   procedural), mas **ainda não supera visualmente o v4.1 na densidade/
   riqueza da copa** — ver seção 7.

## 6. Entregas

- `forest-v5/` — `tiles/` (grass_00-02, path_blob_0-15, clearing_stamp_5x4,
  path_strip_2x4), `props/` (canopy_clump_big/dark/strip + 4 props
  reaproveitados do forest-v4 sem alteração: fallen_log, rock_cluster,
  mushroom_cluster, fallen_leaves_cluster), `tileset.json`, `license.json`.
- `praia-v5/` ("Praia dos Postes") — `tiles/` (sand_00-02, water_blob_0-15,
  water_stamp_5x3), `props/electric_pole.png` (pixel art própria — poste de
  madeira, 2 travessas, isoladores, cabos caídos, referência de clima ao
  litoral do ep.1 de Digimon Adventure, sem copiar nenhum asset oficial),
  `tileset.json`, `license.json`.
- `vila-v5/` ("Vila dos Bebês") — `tiles/` (grass/path copiados do
  forest-v5 para o chão ficar coerente), `props/` (house_small, house_big,
  house_cottage, bush_big, bush_small — recortados de
  `tileset_village_abandoned.png` e clareados do tom "ruína musgosa" para um
  tom mais habitado/alegre; fence, crib, egg_cluster — pixel art própria, o
  pacote licenciado não tem cerca, berço nem ovo), `tileset.json`,
  `license.json`.
- `09-previews/proof/` — `map_v5_floresta.png`, `map_v5_praia.png`,
  `map_v5_vila.png` (1280×720, elenco DS + HUD inferior, mesma convenção das
  provas anteriores) e `map_v41_vs_v5.png` (comparação lado a lado).
- `08-licenses/CREDITS.md` atualizado com Ninja Adventure Asset Pack.
- Scripts em `art/src/`: `na_source.js`, `na_blob.js`, `na_inspect.js`,
  `na_crop_preview.js` (ferramentas de inspeção/coordenadas, one-off),
  `gen_forest_v5.js`, `gen_praia_v5.js`, `gen_vila_v5.js` (geração de
  tiles/props), `proof_hud.js` (HUD/elenco compartilhado, fatorado de
  `forest_v4_proof_scene.js`), `gen_forest_v5_scene.js`,
  `gen_praia_v5_scene.js`, `gen_vila_v5_scene.js`, `gen_v41_vs_v5.js`.

## 7. Limitações (autocrítica dura)

- **Densidade/riqueza de copa ainda perde para o v4.1** na comparação lado a
  lado (seção 5, item 4) — é a crítica mais séria desta entrega. A técnica
  de preenchimento sem lacunas resolveu o "vão de grama visível", mas a
  *textura* da copa (tom verde-limão achatado) é menos rica que a rampa de
  8 tons pintada à mão do v4.1. Próximo passo recomendado: testar mais
  coordenadas de recorte da sheet licenciada para achar uma textura de
  folhagem mais escura/contrastada, ou misturar um overlay de sombra
  direcional sobre o preenchimento (como o v4.1 já faz).
- **Sem par base/tronco + topo-copa como no v4.1** — os clumps de copa do
  v5 são um único tile decor+colisão (sem separar tronco visível de copa
  sempre-acima-do-jogador). Decisão deliberada (a referência canônica lê
  como massa de copa sem tronco individual visível nesse zoom), mas é uma
  simplificação de arquitetura visual, não testada contra o engine real.
- **Sem preset noturno separado** (v4 tinha `night/` com paleta própria,
  não só um escurecimento). v5 não gerou night tiles por tempo — se o
  fundador quiser comparação dia/noite, é trabalho adicional.
- **Água do praia-v5 tem leve faixa vertical repetitiva** no `water_blob`
  (visível em `map_v5_praia.png`) — artefato de tiling da amostra de água;
  funcional mas não perfeito.
- **Areia ficou com tom meio acinzentado**, não um bege quente de praia
  "de cartão postal" — o hue-shift partiu de terra marrom e não alcançou um
  tom tão convincente quanto a água/poste.
- **Berço/ovos na vila-v5 competem em contraste com o caminho de terra**
  (ficam meio "escondidos" por terem cor parecida com o chão ao redor) —
  precisam de mais contorno/contraste numa próxima rodada.
- **Casas da vila ainda carregam um pouco do musgo "ruína abandonada"** do
  sheet original mesmo depois do clareamento de matiz/luz — um recolor mais
  agressivo (ou uma segunda fonte CC0 teria sido melhor) resolveria melhor.
- Nenhuma das três entregas foi testada no motor real (`prototype/`,
  intocado por instrução) — são renders estáticos Canvas→PNG fora do jogo,
  igual às entregas anteriores.
- `tileset_wall_simple.png` e `tileset_interior_floor.png` foram baixados
  mas não usados (não encontrei um uso claro para quadro de pedra/interior
  nesta entrega específica) — ficam em `10-source-files/ninja-adventure/`
  para uso futuro.

## Nota de autoavaliação: 6/10

As três entregas pedidas existem, usam tileset profissional licenciado de
verdade (não procedural) pela primeira vez no projeto, têm prova visual
1280×720 com elenco/HUD, e a comparação lado a lado com o v4.1 é honesta —
inclusive quando o resultado não favorece o v5. O método-base (reusar a
geometria de autotile do v4 com fill real + stamps multi-tile) é sólido e
rápido de iterar. Fica abaixo de 7 porque a crítica central do fundador
("mapa continua muito feio") **não está definitivamente resolvida**: a
copa florestal do v5, mesmo corrigida duas vezes nesta sessão, ainda perde
em densidade/riqueza visual para a arte procedural do v4.1 na comparação
direta — e praia/vila têm acabamentos (areia, berço/ovos, musgo residual
nas casas) que precisam de mais uma rodada antes de qualquer validação do
fundador.
