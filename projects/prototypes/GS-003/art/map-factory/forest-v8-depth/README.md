# forest-v8-depth — profundidade e beleza (Map Factory, 2026-11-09)

Responde ao pedido do fundador ("Drakantos tem muito mais profundidade e beleza") via
`projects/prototypes/GS-003/docs/DRAKANTOS_VISUAL_STUDY.md` (tabela + lista de prioridade). Cobre o lado
game-art dos itens #1, #2, #3 (so a arte), #5, #6 e #8 do estudo. Os itens #4 (sombra de contato no
renderer), #7 (zoom) e #9 (VFX) ficam fora deste pacote -- ver Limitacoes.

**100% pipeline local** (Canvas.js, mesma convencao de `forest-v4`/`forest-v6`): **0 geracoes do PixelLab
gastas**. `get_balance` antes e depois: 26 restantes, sem mudanca (ver
`shared/tools/map-factory/logs/pixellab-usage.csv` para a linha de registro). Nada do jogo foi alterado
por esta entrega.

## O que tem aqui

- **`palette.json`** — rampas revisadas de chao/copa (item #6), mais escuras e menos saturadas que o
  `forest-v4` dia, derivadas por um deslocamento HSV documentado (nao hex novos "no olho") --
  `renderPreset` traz os multiplicadores exatos para o game-dev aplicar em qualquer tile ja pintado do
  `forest-v4`/`v6`/`v7` sem reexportar arte. Acentos saturados (`accentSaturated`) ficam reservados para
  props emissores e poucos pixels de brilho focal (poca, pedra de margem) -- nunca no chao/copa base.
- **`tiles/ground_variant_0..7.png`** (32x32 cada) — 8 variantes de chao na paleta nova, cada uma com um
  tipo de decalque ja embutido (moss, pedrinha, rachadura, raiz, folha caida, poca). Nao sao autotile --
  espalhar por ruido/aleatorio, igual as 6 variantes de `grassVariant` do `forest-v4`.
- **`decals/`** (10 PNGs transparentes, pequenos) — folhas, raizes, pedrinhas, rachaduras, musgo, poca
  (6, para qualquer chao) + tufo sobre trilha (2 variantes), junco e pedra de margem (2, item #8). Essas
  sao decalques avulsos, nao tiles cheios: dao para colar em QUALQUER chao existente do jogo (inclusive
  `forest-v4`/`v6`/`v7`), nao so nos `ground_variant_*` novos.
- **Kit de penhasco/barranco, 1 nivel** (item #2, maior prioridade do estudo):
  - `tiles/cliff_top_blob_0..15.png` — topo autotile blob-16 (mesma geometria de `path_blob`/`water_blob`,
    agora em `art/src/blob_autotile16.js`).
  - `tiles/cliff_face_straight.png`, `cliff_face_corner_outer_left/right.png`, `cliff_face_corner_inner.png`,
    `cliff_ramp.png` — face vertical com sombra de contato forte (item #4 embutido aqui), cantos interno/
    externo e rampa/escada andavel. Essas 5 pecas NAO sao autotile (ver Limitacoes).
- **Props emissores digitais** (item #3, so a arte): `props/data_crystal.png`, `mushroom_bioluminescent.png`,
  `data_totem.png`. Cada um tem um campo `light: {color, radius, intensity}` em `tileset.json` para o
  renderer criar a poca de luz dinamica; a arte tambem traz um halo estatico (`glowHalo`) para a captura
  de tela ja mostrar brilho sem depender do renderer.
- **Clutter de borda de mata** (item #5): `props/fern.png`, `tuft.png`, `fallen_trunk.png`,
  `flowering_bush.png`, mais dois exemplos de **cluster** pronto (`edge_cluster_a/b.png`, nucleo +
  satelites) mostrando como combinar as pecas em grupo em vez de espalhar uma a uma.
- `preview.png` — prancha com todos os itens acima, montada localmente.
- `tileset.json` / `license.json` — mesmo schema do `forest-v4`/`v6`/`v7`.

## O que o renderer (game-dev) precisa implementar

1. **Paleta**: aplicar `palette.json.renderPreset` (multiplicadores de saturacao/valor) em chao/copa
   existentes, OU simplesmente trocar os tiles de chao pelos `ground_variant_*` novos e usar as rampas
   de `palette.json` ao pintar qualquer coisa nova de chao/copa/casca.
2. **Luzes pontuais**: ler o campo `light` de cada prop emissor em `tileset.json` e desenhar um gradiente
   aditivo nesse raio/cor/intensidade (item #3 do estudo -- isto NAO esta implementado aqui, so os dados).
3. **Decalques por ruido**: ao pintar um chao, escolher 0-3 decalques de `decals/ground/` por celula com
   ruido (nao grade fixa) e rotacao/flip aleatorios para variar a leitura.
4. **Penhasco**: ler o bit S do `cliff_top_blob` e colocar a peca de face correspondente 1 celula abaixo,
   numa layer separada `cliff-face` (colisao true nessa layer); `cliff_ramp.png` em qualquer vao da fileira
   de face para o jogador subir.
5. **Colisao**: como sempre neste pipeline, colisao e dado de `tileset.json` por arquivo, independente do
   desenho -- nada aqui calcula hitbox automaticamente.

## Limitacoes (autocritica)

- **Autotile blob-16, nao Wang-47** -- mesma limitacao ja documentada em `forest-v6`/`v7` para seus proprios
  autotiles; cantos internos do TOPO do penhasco podem formar um padrao xadrez visivel em layouts raros.
  Nao testado num mapa real.
- **Face/cantos/rampa do penhasco sao 5 pecas discretas, nao autotile** -- cobre o caso comum (1 nivel,
  borda reta + 2 cantos convexos + 1 concavo + 1 rampa) mas um contorno muito irregular pode precisar de
  mais variantes que este pacote nao produz.
- **Luz e so dado, nao renderizacao** -- o campo `light` em `tileset.json` e o halo estatico (`glowHalo`) na
  propria arte sao tudo que existe; o gradiente aditivo dinamico, as particulas ambiente (vagalumes,
  poeira digital) e a sombra de contato elipsica sob CADA prop/entidade (nao so o penhasco) sao trabalho
  de game-dev, fora do escopo de escrita do game-art nesta tarefa.
- **Zoom (item #7) e VFX (item #9) do estudo nao sao tocados aqui** -- fora do escopo desta entrega.
- **Nada disto foi testado no motor real**, so inspecionado visualmente via `preview.png` e os PNGs
  individuais.
- **0 geracoes do PixelLab usadas** -- o pipeline local (ja usado em `forest-v4`/`v6`) se mostrou suficiente
  para todos os 6 pedidos da tarefa; o orcamento de 26 geracoes restantes continua intocado para rodadas
  futuras.
