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


## Adicao 2026-11-09 — NPCs na escala do Tamer + lanterna/fogueira (GS-003, pedido do game-studio)

Corrige o bug reportado contra `forest-v7-pixellab` (NPCs do PixelLab ~2x maiores que os Tamers --
`evidence/map-factory/factory_v4_clareira_luzes_dia_v4.png`) e adiciona 2 props de luz. **0 geracoes do
PixelLab gastas** -- `get_balance` antes e depois: 26 restantes, 14 usadas, sem mudanca (mesmo pipeline
local desta pasta).

### NPCs reconstruidos na escala do Tamer

- `props/npc_ranger.png` e `props/npc_merchant.png` (26x33 cada, antes 48x64 no `forest-v7-pixellab`) --
  reconstruidos pelo MESMO pipeline que gerou `GAME-ASSETS/11-characters/TAMER-0003..0014`
  (`tools/char_import/build_tamer_presets.js`): recolor de cabelo + kitbash de acessorio vetorial sobre
  um sprite-base oficial (`official-fan-use`) de `GAME-ASSETS/11-characters/official-npcs/`, nao usado
  por nenhum preset de Tamer (NPC-0016 para o ranger, NPC-0005 para o comerciante). Mesmo canvas 26x33,
  mesmo pivo, mesmo outline/estilo chibi DW DS -- a causa raiz do bug (dois pipelines de arte diferentes
  no mesmo mapa) deixa de existir porque agora e o MESMO pipeline.
  - **Ranger**: cabelo recolorido para castanho-terra + kitbash de chapeu de aba larga (verde-oliva) +
    friso de colete verde-musgo (`addRangerHat`/`addCollarBand` reaproveitado de `kitbash.js`).
  - **Comerciante**: base "Anciao Grisalho" (cabelo grisalho mantido -- arquetipo de mercador viajante) +
    kitbash de mochila/bolsa de couro (alca + bolsa, `addSatchel`) + friso de colete mostarda.
  - **Um frame so** (SW, de frente), mesma convencao do que foi substituido ("Standing idle... Single
    frame, no walk animation" no README do `forest-v7-pixellab`).
  - `forest-v7-pixellab/props/npc_ranger.png`/`npc_merchant.png` **nao foram tocados** -- ficam no pacote
    v7 como estavam; o kit v8 e quem o game-dev deve apontar para os novos.
- `npc_scale_comparison.png` (raiz deste pacote) -- prancha 4x comparando os 2 NPCs novos lado a lado com
  2 Tamers (`TAMER-0003` ruivo, `TAMER-0004` loiro) na MESMA escala, confirmando visualmente que a
  proporcao bate (26x33 todos, mesmo fator 4x de preview).

### 2 novos props de luz (`light` em `tileset.json`, mesma convencao dos 3 `emissiveProps` ja existentes)

- `props/lantern_post.png` (16x42) -- poste de madeira com lanterna/caixa de vidro no topo, luz quente
  (`#ffb347`, raio 50, intensidade 0.85). Cor deliberadamente diferente do acento "digital" (`dataAmber`)
  usado por `data_totem.png` -- isto e uma lanterna comum, nao um farol digital.
- `props/campfire_small.png` (20x16) -- fogueira pequena (2 toras cruzadas + chama em 3 camadas), luz
  quente laranja-avermelhada (`#ff7a33`, raio 36, intensidade 0.8), raio menor que a lanterna (prop de
  acampamento/ponto de descanso, nao de trilha).
- Ambos entraram em `tileset.json.emissiveProps` (array estendido, os 3 props existentes **nao** foram
  alterados) e a layer `"npc"` foi adicionada a `tileset.json.layers` (as 5 layers existentes continuam
  as mesmas).

### O que o game-dev precisa trocar no kit

1. **Qualquer referencia a `forest-v7-pixellab/props/npc_ranger.png`/`npc_merchant.png`** (aliases.json,
   gerador de mapa, ou a propria clareira em `evidence/map-factory/factory_v4_clareira_luzes_dia_v4.png`
   se ela for regerada) deve apontar para `forest-v8-depth/props/npc_ranger.png`/`npc_merchant.png`.
2. **Escala de desenho**: como os novos NPCs sao 26x33 (identico ao frame do Tamer), eles devem ser
   desenhados pelo MESMO caminho de renderizacao/pivo usado para os Tamers (pivot pes-centro-x), nao pelo
   caminho de prop generico 48x64 do v7 -- caso o renderer escale props para um tamanho fixo, essa escala
   fixa deve sair da lista para estes 2 arquivos.
3. **Luz dos props novos**: mesmo trabalho pendente ja documentado para `data_crystal`/`mushroom_bioluminescent`/
   `data_totem` -- ler o campo `light` e desenhar o gradiente aditivo; nada disso esta implementado aqui,
   so os dados (ver Limitacoes do README original acima).
4. **Colisao**: `npc_ranger.png`/`npc_merchant.png`/`lantern_post.png`/`campfire_small.png` tem
   `collision: true` em `tileset.json` -- hitbox e trabalho do game-dev, como sempre neste pipeline.

### Limitacoes (autocritica)

- **Kitbash vetorial, nao arte final** -- mesma ressalva que `TAMERS_V3_PRESETS.md` ja faz para os 12
  presets de Tamer: `addRangerHat`/`addSatchel` sao formas geometricas simples (elipse/linha/retangulo)
  sobre o sprite oficial, nao um passe de pixel art manual. Um passe manual deixaria os acessorios mais
  nitidos em 26x33 (canvas pequeno, poucos pixels de folga).
  **Nao foi testado num mapa real nem com o pivo/colisao real do motor.**
- **Satchel/vest sao simetricos em todas as direcoes** (nao ha 4 variantes direcionais do acessorio) --
  so a direcao SW (frente) foi gerada; se o game-dev quiser os NPCs andando ou vistos de costas, falta
  gerar SE/NW/NE com o mesmo kitbash (o pipeline suporta, so nao foi rodado nas 4 direcoes aqui porque o
  piece que ele substitui tambem era 1 frame so).
- **Lanterna/fogueira sao so a arte + o dado `light`** -- igual aos 3 emissiveProps que ja existiam neste
  pacote, nao ha renderizacao de luz implementada.
- **0 geracoes do PixelLab usadas** -- pipeline 100% local, mesmo padrao do resto de `forest-v8-depth`.
