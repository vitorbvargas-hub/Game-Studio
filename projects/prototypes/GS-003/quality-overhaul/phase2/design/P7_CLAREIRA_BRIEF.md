# P7 — Brief de composição da Clareira piloto recomposta

- **Autor:** game-design (WORLD-COMPOSER) · **Data:** 2026-11-10
- **Escopo:** só desenho/composição. Nenhum código, arte nova ou publicação. Base de leitura: `PHASE1_REPORT.md` §6-7, `ART_DIRECTION_V2.md`, `audit/UI_WORLD_AUDIT.md`, `audit/FOUNDER_VIDEOS_NOTES.md`, `audit/TECH_AUDIT.md`, `docs/DRAKANTOS_VISUAL_STUDY.md`, `evidence/drakantos-video/`, `docs/briefing/15_gs010_visual_quality_overhaul.md` §2-3/§8, `quality-overhaul/encounters/ENCOUNTER_ARCHITECTURE.md` + `tables/digimon-forest-01.json` (GS-012), e os dados reais do mapa piloto: `prototype/world/scripts/map-factory/briefs/adapted/digimon-forest-01.v8.brief.json`, `prototype/world/src/data/maps/v8/digimon-forest-01.{tmj,aliases}.json`.
- **Capacidade disponível [E]:** lida no worktree `~/projects/GameStudio/workspaces/game-dev/qo`, commit `ca8267c` (branch `quality-overhaul`), **sem editar nada lá** — só `git log`/leitura de `derive-look-v9.mjs`: `?dpr=1` (escala inteira em px físicos, alvo **~9% da altura da tela** para o Tamer), `?anim=v2` (controlador de animação com fallback por anatomia), `?look=v9` (camada `objects_above` com algoritmo de moitas de borda ao longo de trilha/riacho, água por scroll de UV, vento por cisalhamento em faixas para ferns/tufos/grama/juncos/moitas de borda, luzes de **66 instâncias → 13**, mantendo só 4 tipos: `fp8_lantern_post`, `fp8_campfire_small`, `fp6_healing_point`, `fp8_data_totem`).

---

## 1. Recorte exato

**[E]** Coordenadas tiradas direto do brief `digimon-forest-01.v8.brief.json` (`areas`, `bridges`, `pois`) e confirmadas por contagem de objetos no `.tmj` dentro da caixa. Tile = 32 px.

| Recorte | Valor |
|---|---|
| X (tiles) | **12 a 41** (30 tiles de largura) |
| Y (tiles) | **6 a 29** (24 tiles de altura) |
| Tamanho em px | 960 × 768 px |
| Nota vs. Phase1 §6 | O relatório da Fase 1 estimou "~30×20". Medindo os dados reais, a Clareira Central (`cx=28, cy=21, rx=8.75, ry=7.75` → bounding x 19,25–36,75 / y 13,25–28,75) só cabe inteira numa caixa de **30×24**, porque a Ponte do Riacho fica em y=9, mais ao norte do que a estimativa supunha. Ajuste registrado como **[H]** refinamento, não contradição. |

**Marcos dentro do recorte (coordenadas em tiles, [E]):**

| Marco | x, y | Fonte |
|---|---|---|
| Entrada da Clareira Oculta (limite NO, fora do foco principal) | 13, 6 | `pois: poi-entrada-secreta` |
| Ponte do Riacho | 27, 9 | `bridges/pois: poi-ponte-riacho` |
| Mirante da Clareira | 28, 15 | `pois: poi-mirante-clareira` |
| Vau de Pedras (travessia secundária) | 15, 22 | `bridges/pois: poi-vau-pedras` |
| Baú (madeira simples) | 31, 18 | `pois: interact-bau` |
| Fonte/altar de cura | 33, 21 | `pois: interact-fonte-cura` |
| Clareira Central (centro da elipse) | 28, 21 (rx 8,75 / ry 7,75) | `areas: clareira_central` |
| Ponto visível Tentomon (GS-012, foge) | 34, 16 | `encounters/tables/digimon-forest-01.json` |
| Ponto visível Palmon (GS-012, ignora, até 2 vivos) | 22, 17 | idem |
| Lanterna 1 (perto da ponte) | 24,5 / 7,8 | contagem de `objects_below` no recorte |
| Lanterna 2 (corredor ponte→clareira) | 31,5 / 11,8 | idem |
| Totem de dados | 22,5 / 15,8 | idem |
| Fogueira pequena | 41,5 / 25,8 (borda leste do recorte) | idem |

### Enquadramento de câmera

- **Alvo já travado pelo game-dev (`?dpr=1`, ca8267c): personagem a ~9% da altura lógica da tela.** Está dentro da faixa pedida pelo fundador (8–10%, `FOUNDER_VIDEOS_NOTES.md` item 1) e perto da referência Drakantos (~1/12 = 8,3%, `DRAKANTOS_VISUAL_STUDY.md` item 7). **Recomendação: manter 9%, não reabrir essa decisão** — é P2 do roadmap, já entregue.
- **[H] Conta de enquadramento**, a partir da tabela de escala do Tamer em `ART_DIRECTION_V2.md` §1.2 (corpo 52–60 px): a 9% de altura, a tela lógica mede ≈ 56 px ÷ 0,09 ≈ **622 px de altura**, e em 16:9 ≈ **1106 px de largura** → **~19,4 tiles visíveis na vertical × ~34,6 tiles na horizontal** por quadro de câmera (32 px/tile). Isso significa que o recorte de 30×24 tiles **quase cabe inteiro em um único enquadramento de câmera** (um pouco mais alto que uma tela), o que é bom para captura de QA: dá para fotografar a peça quase toda de um só lugar, parado no centro da clareira (perto do baú, 31,18), e precisar de só 1 pan vertical curto para pegar a ponte (y=9) e o vau (y=22) nas pontas.
- A câmera já segue o Tamer com lerp e trava nas bordas do mapa (`TECH_AUDIT.md` §1) — nenhuma mudança de comportamento de câmera é pedida aqui, só o enquadramento alvo (9%) já implementado.

---

## 2. Composição em camadas

| Camada | O que já existe no recorte [E] | O que este brief pede (ajuste de composição, não de engine) |
|---|---|---|
| **Chão** | Autotile Wang-47 suave (`clearing` × `path` × `water`), 395 decalques de chão dentro da caixa: `fp8_moss_patch` (110), `fp8_leaf_litter` (88), `fp8_pebble_cluster` (72), `fp8_tuft_over_path_a/b` (42+52), `fp8_root_tendril` (14), `fp8_puddle_small` (11), `fp8_crack` (6); 1 mancha de lama roxa (`lama-4`). | Manter a densidade de decalques (já atende ao item #1 do estudo Drakantos — chão nunca liso). **Pedido:** 1–2 manchas de lama roxa a mais (hoje só 1 no recorte), perto do vau e da margem leste do riacho, para reforçar o acento frio/roxo do Drakantos (item #6) sem mudar a paleta-mãe. |
| **Transições** | Bordas suaves já recortadas por máscara (`pathsmooth.ts`), sem passo adicional aqui. | Nenhum ajuste — é capacidade de engine, não de composição. |
| **Props de base** | 147 props em `objects_below` no recorte: 27 árvores (round/conifer/birch/flowering/data_leaf/palm_digital/ancient/bushy), 15 cogumelos bioluminescentes, 9 ferns+tufos, 7 clusters de flor (roxo/branco/vermelho), 6 juncos, 4 cogumelos digitais, 3 cristais de dados, 3 grama alta já plantada (`fp4_tall_grass_a/b`), 3 pedras do vau, 1 baú, 1 fonte de cura, 1 NPC mercador, 1 moita densa secreta, 1 tronco caído ×2, 1 totem, 1 fogueira, 2 lanternas. | **Clustering, não quantidade nova:** os 15 cogumelos + 4 digitais + 3 cristais estão espalhados quase uniformes (contraria Drakantos #5, "núcleo + satélites, espaços para respirar"). Reagrupar em **2–3 bolsões** (ex.: um bolsão perto do totem/mirante, outro perto da fonte de cura) e abrir vazios de chão puro entre eles — sem adicionar nem remover instâncias, só reposicionar. |
| **`objects_above` (primeiro plano)** | **Vazio no v8** (0 props). O v9 (game-dev, `derive-look-v9.mjs`) já tem o algoritmo: a cada ~6 tiles de trilha reta, planta uma moita na borda sul (`fp8_edge_cluster_a`, `fp8_flowering_bush`, `fp8_fern`, `fp8_edge_cluster_b`, `fp8_fern` em ciclo) fora de colisão; e `fp8_reed_cluster` a cada ~5 tiles na margem do riacho. | **Esse algoritmo é genérico (toda trilha do mapa). Este brief pede 3 molduras de FG dedicadas dentro do recorte, além do automático:** <br>1. **Moldura da ponte:** 1 `fp8_fern` + 1 `fp8_flowering_bush` flanqueando a trilha a ~1 tile ao sul da ponte (perto de 26,10 e 29,10), para o jogador "passar por baixo" da vegetação ao atravessar — efeito de profundidade que hoje não existe em nenhuma travessia do mapa. <br>2. **Baú parcialmente escondido:** 1 `fp8_flowering_bush` em frente ao baú (31,18), do lado sul, para o jogador só ver o baú de perto (recompensa por exploração, não visível de longe). <br>3. **Juncos no braço do riacho que corta a clareira** (o trecho entre y≈14 e y≈18, onde o rio passa pelo canto noroeste da clareira): usar o `fp8_reed_cluster` do algoritmo automático, mas confirmar que ele dispara aí (hoje o algoritmo só roda em `water` com trechos retos — esse trecho do riacho tem curva acentuada, então **pode não gerar nada**; se não gerar, pedir 2–3 `fp8_reed_cluster` manuais nesse trecho). |
| **Água** | `look.water` (v9): `stepPx [2,1]`, `frameMs 140`, 16 quadros de scroll de UV. | A correnteza do riacho (pontos do brief) desce de y=-1,5 para y=41,5 → **fluxo sul**. Pedido: configurar o scroll de UV nessa direção (sul) nesse trecho específico, para a leitura do movimento da água bater com a geometria (hoje o parâmetro é só um `stepPx` genérico — confirmar com game-dev se é por tile ou por curva inteira). |
| **Luzes com propósito** | **5 luzes do conjunto de 13 (v9) já caem dentro do recorte** [E, contado no `.tmj`]: fonte de cura (33,5/21,7), totem de dados (22,5/15,8), lanterna perto da ponte (24,5/7,8), lanterna no corredor ponte→clareira (31,5/11,8), fogueira pequena (41,5/25,8, bem na borda leste). | **Orçamento pedido: até 6 luzes na clareira — já estamos em 5, dentro do limite.** Cada uma com motivo: <br>1. Lanterna 1 (perto da ponte) — **marca a travessia**, acende à noite para o jogador não perder a ponte na escuridão. <br>2. Lanterna 2 (corredor) — **guia o caminho** entre a ponte e o interior da clareira, não deixa o trecho de mata intermediário escuro demais. <br>3. Totem de dados — **marco de orientação** perto do mirante, não é luz de guia de trilha, é ponto de referência visual (o jogador sabe "estou perto do mirante" ao ver o brilho ciano). <br>4. Fonte de cura — **função:** sinaliza de longe onde curar a equipe, luz mais fraca (intensidade 0,55 já calibrada no v9) para não competir com as duas lanternas. <br>5. Fogueira — **marco de acampamento**, fica na borda leste (fora do centro de leitura), não decido mexer nela (pertence mais à zona de concentração vizinha). <br>**Não acrescentar uma 6ª luz:** os 15 cogumelos bioluminescentes e 3 cristais de dados que sobraram no recorte **ficam sem brilho aditivo no v9** (só decoração estática) — isso é intencional e resolve directamente a queixa do fundador ("bolhas rosas/ciano por toda parte", `FOUNDER_VIDEOS_NOTES.md` item 4). |
| **Pontos de vida** | **Vento:** `look.sway` (v9) já cobre `fp8_fern`, `fp8_tuft`, `fp4_tall_grass_[ab]`, `fp8_reed_cluster`, `fp8_edge_cluster_[ab]`, `fp8_flowering_bush` + copas, com 3 faixas de fase (período 2,6 s) — e todos esses props já existem no recorte, então o vento "pega" automaticamente sem trabalho extra. **Partículas:** `look.particles` (v9) tem vagalumes (0,6) e poeira (0,8) já ativos globalmente. | **Fauna ambiente: não existe hoje** (nem como sistema, nem como asset — confirmado em `ENCOUNTER_ARCHITECTURE.md` §1.3, "clima não existe", e não há entidade passiva não-combatível no jogo). Pedido **[H], prioridade baixa para o piloto:** 1 borboleta/inseto pequeno (4 quadros, voo errático, sem colisão nem IA de combate) sobrevoando a clareira central de dia, para reforçar "vida" sem depender de combate. Se não houver orçamento de arte, **os vagalumes e a poeira digital já existentes bastam** para cumprir o item "vida ambiental" do GS-010 §4E neste piloto — registrar a borboleta como melhoria opcional, não bloqueante. |

---

## 3. Caminhos de leitura, pontos de interesse e silhuetas

**[E] 3 trilhas convergem dentro do recorte** (`paths` do brief):
- **Rota Principal:** entra pelo sul (fora da caixa), sobe até perto do baú (31,18), vira para sudeste e sai do recorte rumo à Arena do Chefe (fora do escopo deste piloto).
- **Rota Secundária do Riacho:** sai da região do baú/fonte (perto de 32,19), sobe ao norte passando exatamente pela Ponte (27,9), e segue para a Clareira Oculta (fora do recorte).
- **Rota do Vau de Pedras:** vem do sul pela margem oeste do riacho, cruza no Vau (15,22), sobe pela margem oeste até o norte do recorte.

**Leitura proposta (o que o jogador vê, em ordem, entrando pelo sul):**
1. Chega na borda sul da clareira → abertura de chão (primeiro "respiro" depois da mata densa de fora do recorte).
2. Vê o **baú** (31,18) entreaberto atrás de uma moita (item 2 da seção FG) — primeiro ponto de interesse, perto, convida a desviar da trilha principal.
3. Segue a Rota Principal ou a do Riacho; se for pela do Riacho, passa pelo **Totem** (22,5/15,8) e pelo **Mirante** (28,15) — o mirante é, por definição do próprio brief, "uso de câmera/composição, sem mecânica": é o ponto de onde dá para ver o braço norte do riacho e o Tentomon fugindo na grama alta ao leste.
4. Chega na **Ponte** (27,9), emoldurada pela moita (item 1 da seção FG) e pelas duas lanternas — travessia, não só decoração.
5. A **Fonte de cura** (33,21) fica num ramal mais a leste, fora do caminho natural de quem segue a trilha — reforça que é um ponto funcional, visitado por escolha, não de passagem.

**Regra 60/30/10 aplicada:**
- **60% — chão aberto da clareira** (grama baixa + trilha): domina a composição, é onde o combate acontece e onde o jogador lê o Tamer/Digimon com clareza.
- **30% — massa de mata no perímetro**: copas e troncos formando a "moldura" da clareira (igual ao Drakantos item 2/5, massas grandes e escuras, não um tapete de copinhas iguais).
- **10% — acento**: a fita azul do riacho + a ponte de madeira + os 5 pontos de luz + as manchas roxas de lama + as flores (roxo/branco/vermelho já existentes). Esse 10% é onde o olho do jogador deve pousar primeiro.

**O que remover por excesso de ruído (achados [E] desta auditoria, não repetição do que já foi corrigido pelo game-dev):**
1. **Padrão de grade dos tufos sobre a trilha** (`fp8_tuft_over_path_a/b`, 94 instâncias dentro do recorte, distribuição quase regular) — é exatamente o "padrão de tufos em grade bem visível no chão" que o fundador citou (`FOUNDER_VIDEOS_NOTES.md` item 3). **Não é algo que este brief resolve sozinho** (é parâmetro de jitter/ruído do gerador, Map Factory) — registrar como pedido a game-dev: aumentar a aleatoriedade de posição desses decalques, ou reduzir a densidade em ~30% dentro do recorte.
2. **Cogumelos/cristais espalhados de forma uniforme** (ver seção 2, já endereçado como reclustering, não remoção).
3. **6 zonas de spawn antigas que caem dentro do recorte** (`spawn-gigimon`, `spawn-koromon`, `spawn-palmon`, `spawn-tentomon`, `spawn-floramon`, `spawn-dorumon`) — o `ENCOUNTER_ARCHITECTURE.md` §2.6 já recomenda substituí-las pelos 5 pontos visíveis do GS-012 (31 vivos → ~6). **Dentro deste recorte**, isso significa: desligar `spawn-tentomon` e `spawn-palmon` (substituídas pelos pontos visíveis GS-012 em 34,16 e 22,17) assim que o passo 6 do GS-012 for implementado — não é ação deste brief, é confirmação de que a composição já está desenhada para o sistema novo, não para o antigo.

---

## 4. Zonas de grama alta do GS-012 (encontros) integradas à composição

**[E]** A tabela atual (`encounters/tables/digimon-forest-01.json`) já tem 2 **pontos visíveis** dentro da `clareira_central` (Tentomon em 34,16 foge, wander 3; Palmon em 22,17 ignora, até 2 vivos, wander 3), mas **nenhuma área de "grama alta" para rolagem aleatória (`mode: random`) está definida dentro da própria Clareira Central** — as áreas existentes (`oculta-grama`, `concentracao-grama`, juncos do riacho, `sudeste-mata`) ficam todas fora ou só tangenciando a borda do recorte. Isso confirma o apontado na tarefa: **a grama alta precisa ser desenhada aqui, ainda não está**.

**Proposta (2 zonas retangulares, no mesmo formato de `areas[]` da tabela):**

| Zona | Retângulo (x, y, w, h) | Serve | Justificativa de posição |
|---|---|---|---|
| **`clareira-noroeste-grama`** | x=19, y=14, w=7, h=6 (→ x19-26, y14-20) | Cobre o raio de vagar (3 tiles) do Palmon visível (22,17); serve também as entradas `random` de `gigimon-grama`, `koromon-grama`, `tokomon-grama`, `tanemon-grama`, `tsunomon-juncos` que já pedem terreno `tall_grass`/`reeds` na tabela. | Fica na metade oeste da clareira, perto de onde o riacho entra pelo canto noroeste — une a grama alta à margem do rio (consistente com `tsunomon-juncos` preferir `reeds`), sem cobrir o caminho principal de leitura (que passa mais a leste, perto do baú). |
| **`clareira-corredor-grama`** | x=31, y=13, w=7, h=7 (→ x31-38, y13-20) | Cobre o raio de vagar (3 tiles) do Tentomon visível (34,16); serve as entradas `random` de `palmon-grama`, `floramon-dia`, `tentomon-grama`, `lalamon-dia` (todas pedem `tall_grass`). | Ocupa o corredor entre a Ponte/Mirante e o interior da clareira, por onde passa a Rota Secundária do Riacho — dá sentido ao comportamento "foge" do Tentomon (ele tem para onde fugir, mata densa logo a leste do corredor) e fica perto da Fonte de cura (33,21), reforçando a leitura de "zona mais selvagem" ao redor do ponto funcional. |

**Tamanho e forma:** os retângulos seguem o mesmo esquema que a tabela já usa (`rect: {x,y,w,h}`) — a tabela atual **não suporta forma orgânica** (ao contrário das `areas` do brief do mapa, que usam elipse/wobble). **Recomendação visual:** mesmo com o hitbox retangular, pedir ao game-dev/game-art que a arte dentro do retângulo use densidade decrescente nas bordas (como já é feito com os 3 `fp4_tall_grass_a/b` existentes, que são props individuais, não uma mancha sólida) — isso faz a grama "ler" como orgânica no mapa, mesmo com a área de rolagem sendo um retângulo reto por baixo.

**Conflito a verificar com game-dev:** a `clareira-corredor-grama` (x31-38,y13-20) tem uma pequena sobreposição com a Lanterna 2 (31,5/11,8) e com o início da Rota Secundária do Riacho — grama alta bem em cima da trilha pode esconder o caminho. Sugestão: manter a trilha "limpa" (sem prop de grama a menos de 1 tile do centro da curva do `.tmj`), deixando a grama só nas franjas do retângulo.

---

## 5. Lista de assets

### Já existe (path, uso proposto)

| Asset | Caminho/fonte | Uso neste piloto |
|---|---|---|
| `fp4_tall_grass_a`, `fp4_tall_grass_b` | pacote `forest-v8`, `digimon-forest-01.aliases.json` (pack) | Base das 2 zonas de grama alta GS-012 (seção 4) — já tem 3 instâncias no recorte, reaproveitar + plantar mais. |
| `fp8_reed_cluster` | idem | Margem do riacho (já 6 no recorte); usar também no trecho curvo onde o rio corta a clareira (seção 2, item 3 do FG). |
| `fp8_fern`, `fp8_tuft`, `fp8_edge_cluster_a/b`, `fp8_flowering_bush` | idem | Molduras de FG manuais (ponte e baú, seção 2) — já usados pelo algoritmo automático do v9 em outros trechos de trilha. |
| Árvores (`fp4_tree_round_a/b`, `conifer_a/b`, `flowering`, `birch`, `data_leaf`, `palm_digital`, `ancient`, `bushy_a`) | idem | Perímetro/massa de mata (30%) — já presentes, só reclustering local dos cogumelos/cristais ao redor delas. |
| Luzes mantidas (`fp8_lantern_post`, `fp8_campfire_small`, `fp6_healing_point`, `fp8_data_totem`) | idem, já aplicadas pelo v9 | As 5 já posicionadas no recorte (seção 2) — nenhuma nova. |
| Cogumelos/cristais (`fp8_mushroom_bioluminescent`, `fp7_mushroom_digital`, `fp8_data_crystal`, `fp7_flower_digital`, `fp4_flower_cluster_purple/white/red`, `fp4_mushroom_cluster`) | idem | Reclustering (seção 2), sem arte nova. |
| Decalques de chão (`fp8_moss_patch`, `leaf_litter`, `pebble_cluster`, `tuft_over_path_a/b`, `root_tendril`, `puddle_small`, `crack`) | idem | Manter densidade; reduzir só `tuft_over_path_a/b` por jitter (seção 3, item 1). |
| Mancha de lama (`lama-4`) | `patches` layer do `.tmj` | Pedido de 1–2 manchas a mais (seção 2). |
| Ponte (`fp6_bridge_h_0/1/2`, `fp6_bridge_v_0/1/2`) | `bridges` do brief | Já aplicada na travessia (27,9), sem mudança. |
| Pedras do vau (`fp7_rock_small_flat`, do pacote `forest-v7`) | nota do POI `poi-vau-pedras` | Já aplicadas (3 no recorte), sem mudança. |
| Baú (`fp6_chest_closed`) | `objects_below` | Já posicionado (31,18); só adicionar a moita na frente (FG, seção 2). |
| Sistema `objects_above` (algoritmo de moitas de borda) | `derive-look-v9.mjs` (worktree game-dev, **não editado**) | Capacidade pronta; este brief pede 3 molduras manuais além do automático (seção 2). |
| Sistema de vento (`look.sway`) | idem | Já cobre todos os props de grama/fern/junco/moita listados acima — nenhum trabalho extra. |
| Partículas (vagalumes, poeira) | idem | Já ativas; usar como "vida ambiental" mínima viável se a borboleta (abaixo) não entrar neste piloto. |
| Água por scroll de UV | idem | Configurar direção sul no trecho do recorte (seção 2). |

### Falta (prioridade, quem faz)

| # | O que falta | Prioridade | Quem | Observação |
|---|---|---|---|---|
| 1 | Ajustar jitter/densidade de `tuft_over_path_a/b` no gerador (reduzir padrão de grade) | **Alta** | game-dev (Map Factory, parâmetro do gerador) | Não é arte nova, é parâmetro; não precisa de PixelLab. |
| 2 | Reclustering dos 15 cogumelos bioluminescentes + 4 digitais + 3 cristais em 2–3 bolsões | **Alta** | game-dev (reposicionar no brief/`.tmj`) | Instâncias já existem, só reposicionar. Sem PixelLab. |
| 3 | 2 zonas de grama alta GS-012 (`clareira-noroeste-grama`, `clareira-corredor-grama`) na tabela de encontros | **Alta** (bloqueia GS-012 passo 5/6 nesta região) | game-dev (adicionar `areas[]` em `encounters/tables/digimon-forest-01.json`, aprovado por game-design) | Usa props já existentes, zero arte nova. |
| 4 | 3 molduras de FG manuais (ponte, baú, trecho curvo do riacho) | **Média** | game-dev (posicionar no `.tmj` v9, mesmos keys do algoritmo) ou game-art local (`pixelart_workbench`, sem gerar nada novo) | Reaproveita sprites já existentes (`fp8_fern`, `fp8_flowering_bush`, `fp8_reed_cluster`). |
| 5 | 1–2 manchas de lama roxa extra perto do vau/margem leste | **Média** | game-art (local, `pixelart_workbench` ou reposicionar `lama-4` existente) | Se precisar de variante nova de mancha, é tarefa pequena, sem PixelLab necessariamente. |
| 6 | Fauna ambiente passiva (1 borboleta/inseto, 4 quadros) | **Baixa, opcional** | game-art (mão ou PixelLab, decisão do diretor de arte) | Não bloqueia o piloto — vagalumes/poeira já cobrem "vida ambiental" minimamente. |
| 7 | Kit de penhasco/barranco (profundidade real, item #2 do estudo Drakantos) | **Fora do escopo deste piloto** | game-art + game-dev, fase futura | A Clareira é plana por natureza (clareira = terreno aberto); registrar só para não esquecer no roadmap geral, não é pendência do P7. |
| 8 | Tamer refinado + Guilmon/Dorumon/Tentomon com anatomia própria (P5/P6) | **Dependência cruzada, não pendência deste brief** | game-art (+PixelLab), conforme `PHASE1_REPORT.md` §7 | Sem isso, a demonstração "personagem em movimento sobre o cenário" (critério do GS-010 §7) fica limitada ao placeholder atual — é P5/P6 do roadmap, roda em paralelo, não bloqueia a composição do mapa em si. |

---

## 6. Blockout ASCII do recorte

Gerado a partir das coordenadas reais do brief (elipse da clareira, polilinha do riacho, polilinhas das 3 trilhas, ponte, vau, zonas de grama propostas) — é um **esboço de leitura espacial**, não um mapa de tiles pixel-perfeito (a arte real continua sendo o autotile Wang-47 existente). Eixo X = colunas (tiles 12–41), eixo Y = linhas (tiles 6–29).

```
    234567890123456789012345678901
y  6 .ST........TTTT~~~TTTTTTTTTTTT
y  7 T...TTTTTT..TTT~~~TTTTTTTTTTTT
y  8 TTTTTTTTTTT.LTT~~~TTTTTTTTTTTT
y  9 TTTTTTTTTTTT..===~TTTTTTTTTTTT
y 10 TTTTTTTTTTTTTT.......TTTTTTTTT
y 11 TTTTTTTTTTTTTT~~~~TTT.TTTTTTTT
y 12 TTTTTTTTTTTTT~~~~TTLT..TTTTTTT
y 13 TTTTTTTTTTT~~~~~TTT"".""""TTTT
y 14 .TTTT~~~~~~~~",,,,,"".""""TTTT
y 15 .TTT~~~~"""""",,M,,"".""""TTTT
y 16 .TTT~~~"""N""",,,,,"""e"""TTTT
y 17 TTTT~~~"""d""",,,,,"""."""TTTT
y 18 TTT~~~T""""""",,,,,B..."""TTTT
y 19 TTT~~~T""""""",,,,....""""TTTT
y 20 TTT~~~TT,,,,,,,,...,...,,TT...
y 21 TTT~~~TT,,,,,,,.,,,,,,..,T..TT
y 22 ..ooo....,,,,,,.,,,,,F,....TTT
y 23 TTT~~~TT.,,,,,,.,,,,,,,,,TTTTT
y 24 TTT~~~TT.,,,,,,.,,,,,,,,,TTTTT
y 25 TTT~~~TT.,,,,,,.,,,,,,,,TTTTTT
y 26 TTT~~~TT.T,,,,,.,,,,,,,TTTTTTT
y 27 TTT~~~TT.TT,,,,.,,,,,,TTTTTTTT
y 28 TTT~~~TT.TTTT,.,,,,,TTTTTTTTTT
y 29 TTT~~~TT.TTTTTTTTTTTTTTTTTTTTT
```

**Legenda:** `T` mata/copa (perímetro, 30%) · `,` chão aberto da clareira (60%) · `.` trilha · `~` riacho · `=` ponte · `o` vau de pedras · `"` zona de grama alta GS-012 · `S` entrada da Clareira Oculta (limite) · `M` mirante · `N` totem de dados · `L` lanterna · `B` baú · `F` fonte de cura · `d` Palmon visível · `e` Tentomon visível.

**Limitações do blockout:** a fogueira (41,5/25,8) e a Rota das Pedras (que sai do recorte a leste) não aparecem porque ficam na borda ou fora da caixa de 30 colunas; a elipse da clareira foi aproximada por um teste geométrico simples (pode diferir 1 tile da máscara orgânica real do `pathsmooth.ts`, que tem `wobble`/`nooks`); os retângulos de grama alta (`"`) são o hitbox da tabela de encontros, não a distribuição final dos props de grama (que deve ter densidade decrescente nas bordas, seção 4).

---

## 7. Critérios de aceite mensuráveis (contra GS-010 §8) e checklist para game-qa

**GS-010 §8 pede nota 0–10 por categoria, média mínima 9, nenhuma abaixo de 8, aprovação do GAME-ART-DIRECTOR e do fundador.** Este brief cobre só as categorias de mapa (**Qualidade do cenário**, **Profundidade e composição**, **Iluminação e efeitos**, **Vida ambiental**); as de personagem/Digimon/UI dependem de P5/P6/P8.

| Critério GS-010 §8 | Como medir nesta peça (critério objetivo) |
|---|---|
| Qualidade do cenário | Captura em `?look=v9` do recorte (12–41, 6–29), dia e noite: nenhum tile com textura ausente (checar especificamente este recorte, não só a Praia); decalques de chão (moss/leaf/pebble/crack) visíveis sem repetição perceptível em qualquer janela de 10×10 tiles. |
| Profundidade e composição | As 3 molduras de FG (seção 2) aparecem na frente do Tamer quando ele passa por elas (teste manual: andar pela ponte, pelo baú, pelo trecho curvo do riacho); regra 60/30/10 (seção 3) verificável por captura — nenhuma das 3 faixas deve dominar visualmente mais que ±15 pontos percentuais do alvo. |
| Iluminação e efeitos | Exatamente 5 fontes de luz acesas dentro do recorte à noite (não 6+); nenhum cogumelo/cristal com brilho aditivo fora dos 4 tipos mantidos (`lantern_post`, `campfire_small`, `healing_point`, `data_totem`); cada luz justificável por função (tabela da seção 2) ao ser perguntada "por que essa luz está aqui". |
| Vida ambiental | Vento visível em pelo menos 1 tufo/fern/grama/junco a cada ~5 tiles dentro da clareira (cobertura do `look.sway` já é ampla, conferir que nenhuma zona fica "morta"); água do riacho com movimento de scroll visível no trecho do recorte; vagalumes/poeira presentes à noite; (opcional) 1 borboleta de dia, se produzida. |

**Checklist para game-qa (antes de aprovar esta peça do mapa):**

- [ ] Captura `?look=v9` de dia e de noite do recorte (12–41, 6–29) — comparar com o antes (`?look=v8` ou padrão) na mesma área.
- [ ] Contar luzes acesas à noite dentro do recorte: deve dar **5** (não mais que 6).
- [ ] Confirmar visualmente as 3 molduras de FG (ponte, baú, trecho do riacho) — o Tamer deve passar **atrás** delas em algum ponto do percurso.
- [ ] Confirmar que as 2 zonas de grama alta GS-012 (quando implementadas no passo 5/6) não cobrem o centro da trilha (sem prop de grama a <1 tile do eixo da curva).
- [ ] Rodar `node scripts/encounters/sim.mjs --check` (quando as 2 áreas novas forem adicionadas à tabela) para confirmar que o schema continua válido.
- [ ] Verificar que nenhuma das 6 zonas de spawn antigas (`spawn-gigimon/koromon/palmon/tentomon/floramon/dorumon`) continua ativa ao mesmo tempo que os 2 pontos visíveis GS-012 equivalentes (evitar duplicar Tentomon/Palmon).
- [ ] Testar em movimento real (andar pelo recorte inteiro, sul→ponte→volta), não só captura estática — regra do checklist do diretor de arte (`ART_DIRECTION_V2.md` §6.1, item "verificado em movimento").
- [ ] Confirmar enquadramento: personagem (placeholder atual, já que P5 não entregou ainda) a ~9% da altura lógica da tela com `?dpr=1`.

---

## Limitações desta entrega

- **[H]** A posição exata das 2 molduras de FG (ponte, baú) e da reclustering dos cogumelos é uma proposta de coordenadas aproximadas lidas do `.tmj`; a implementação final (game-dev) pode precisar ajustar 1–2 tiles para evitar colisão/sobreposição com props existentes não listados aqui em detalhe.
- O blockout ASCII (seção 6) é um auxílio de leitura espacial gerado por script a partir dos dados reais do brief, não um mapa de tiles final — a composição de produção continua sendo o `.tmj`/autotile existente.
- Este brief não cobre personagem, Digimon, HUD nem VFX de combate (P5, P6, P8, P9 do roadmap) — só a composição do mapa (P7).
- A conta de enquadramento de câmera (seção 1) é **[H]**, derivada da escala-alvo do Tamer (`ART_DIRECTION_V2.md` §1.2) e do percentual de 9% já implementado; não foi medida numa captura real do `?dpr=1` em funcionamento (fora do escopo de um subagente de desenho, que não deve rodar o jogo do worktree de outro agente).
- Não foi possível confirmar se o algoritmo de FG do v9 (`derive-look-v9.mjs`) já gera `fp8_reed_cluster` no trecho curvo do riacho dentro da clareira — o algoritmo não foi executado (regra: não alterar código/arte), só lido; a seção 2 trata isso como pendência a verificar com game-dev.
