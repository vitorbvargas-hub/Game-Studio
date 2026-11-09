# forest-v7-pixellab — pacote gerado via PixelLab MCP (Map Factory, 2026-11-09)

Executa `../PIXELLAB_PLAN_40.md` sob um **teto rígido de 14 gerações** (confirmado por `get_balance`: 40 disponíveis, trial, 0 usadas antes de começar; 14 usadas, 26 restantes ao final). Não é um reforço do jogo: `prototype/world` continua usando só `forest-v4`/`forest-v4.1`. Nenhum código do jogo foi alterado por esta entrega.

## O que tem aqui

- `tiles/water_grass_tileset.png` (128×128, 4×4 = 16 tiles de 32px) — tileset Wang água/grama (`create_topdown_tileset`, `mode=standard`), cores citando os hex exatos de `GROUND_DAY.water`/`FOLIAGE_DAY` (`forest_v4_palette.js`). `tiles/water_grass_tileset_metadata.json` traz os `corners`/`bounding_box` de cada peça.
- `props/flower_digital.png` (32×32) e `props/mushroom_digital.png` (24×24) — flora digital/bioluminescente, preenchendo a lacuna "flores... digitais" do `FOREST_KIT_GAP.md`.
- `props/chest_open.png` (32×32) — 2º estado (aberto/vazio) do `forest-v6/props/chest_closed.png`, via img2img.
- `props/npc_ranger.png` e `props/npc_merchant.png` (48×64 cada) — NPCs parados, proporção chibi (`ART_STYLE_GUIDE.md` §2.1). Um frame só, sem animação de andar.
- `props/rock_crack_secret.png` (40×36) e `props/bush_dense_secret.png` (32×32) — duas opções de conceito para entrada de área secreta (game-design escolhe).
- `props/boss_arena_floor.png` (32×32) — chão de arena com marcas de garra, sem o chefe em si.
- `props/sign_post_arrow.png` (32×32) — variante de `forest-v6/props/sign_post.png` com seta em vez de "!".
- `props/rock_small_flat.png` e `props/tall_grass_c.png` (20×20 cada) — variantes para quebrar repetição de `rock_small.png`/`tall_grass_a/b.png`.
- `concept/kuwagamon_concept.png` (96×96) — **concept art, não é sprite de produção.** Pose estática única, só para o game-design/fundador visualizar antes de aprovar uma criatura completa (10–25+ gerações, fora deste orçamento).
- `preview.png` (512×512) — prancha com os 12 itens acima + o tileset, montada com `pixelart_workbench join` (gratuito).
- `tileset.json` / `license.json` — mesmo schema do `forest-v4`/`forest-v6`, com a origem "PixelLab, gerado em 2026-11-09, plano trial".

## O que foi descartado

**Item #13 do plano (ponto de cura verde)** — `create_image_pixflux` img2img a partir de `forest-v6/props/healing_point.png`, pedindo recolor de ciano para verde. Inspecionado com `pixelart_workbench inspect`: a paleta resultante ficou 100% azul/ciano (`#096f91`/`#1d90b1`/`#38b6d7`/`#56d6f4`/`#a0fcff`), sem nenhum verde — `init_image_strength=150` preservou a cor original e ignorou o pedido. Sem orçamento (0 gerações restantes no teto de 14) para tentar de novo com `strength` menor. **Não está no pacote.**

## Como as gerações foram usadas

13 dos 14 itens do plano foram tentados (o item #10, concept do Kuwagamon, é 1 geração mas deliberadamente **não** é produção). Duas chamadas erraram por validação de tamanho de canvas *antes* de serem enfileiradas (não cobradas): item #2 (24×20 precisava ser quadrado) e item #4, 1ª tentativa (init_image de 24×22 = 528px abaixo do mínimo de 1024px da `create_image_pixflux`). O item #4 foi corrigido com padding local (script Python puro, `zlib`/`struct`, sem rede, sem custo) antes de reenviar. Log completo, prompt-a-prompt, em `shared/tools/map-factory/logs/pixellab-usage.csv`.

## Alinhamento de paleta

**Não rodei `reduce_colors`** — o teto de 14 gerações já estava esgotado pelos 14 itens aprovados/tentados antes de sobrar qualquer margem (mesmo a 0,1 geração por chamada). O alinhamento com `forest-v4`/`forest-v6` foi buscado de duas formas:
- Prompt citando os hex exatos de `forest_v4_palette.js`/`endesga32.js` (itens de texto puro).
- `init_image` direto a partir dos PNGs locais do `forest-v6` (chest_open, sign_post_arrow).

Isso é consistência de **intenção**, não de paleta exata pixel-a-pixel — um `reduce_colors` com a paleta do `forest-v4` como `palette_image` seria o próximo passo, fora do orçamento desta tarefa.

## Integração (fora do escopo de escrita do game-art nesta entrega)

Este pacote **não foi ligado** a `forest-proof.aliases.json` nem ao gerador de mapa. Mesma lógica de duas opções do `forest-v6/README.md`: prefixo próprio (`fp7_`) ou merge físico em `GAME-ASSETS/03-environments/forest-v4/` — decisão e execução do game-dev.

## Limitações (autocrítica)

- **Um frame só por NPC/prop** — sem animação de andar, sem estados adicionais além do que está listado.
- **Tileset Wang-16, não Wang-47** — mesma limitação do `water_blob` do forest-v6; cantos internos podem formar xadrez visível. Não testado num mapa real.
- **Nenhuma versão noturna.**
- **Item #13 (ponto de cura verde) descartado** — ver seção acima.
- **`kuwagamon_concept.png` não é um asset de jogo** — é só um concept de apoio a decisão de design; produzir a criatura de verdade é um orçamento à parte (ADR-011 §4, precisa de nova aprovação do fundador).
- **Nada disto foi testado no motor real.**
- **Reserva do plano original (26/40) ultrapassada em escopo desta tarefa**: o teto desta tarefa era 14, não os 40 totais — este pacote usou exatamente 14, deixando os 26 restantes intocados para rodadas futuras (não gastos aqui).
