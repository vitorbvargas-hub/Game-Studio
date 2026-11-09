# FOREST_KIT_GAP — forest-v4.1 vs. "Digimon Forest — Prototype 01"

- **Autor:** game-art · **Data:** 2026-11-09 · **Frente:** Map Factory (ADR-011).
- **Método:** inspeção direta de `GAME-ASSETS/03-environments/forest-v4/tileset.json` (campos aditivos `autotileV41`/`clearingFloorV41`/`lightingV41`/`treesV41`), `forest-v4/license.json`, `prototype/world/src/data/maps/forest-proof.aliases.json` e `prototype/world/README.md` (seções "forest-v4 no jogo" e "forest-v4.1"). Todas as entradas marcadas **[E]** vêm de um desses 4 arquivos, lidos nesta sessão (2026-11-09).
- Critério de aceite usado para o "falta": o que `docs/briefing/12_map_factory_v2.md` §7 (Digimon Forest — Prototype 01) e o pedido desta tarefa exigem explicitamente — água/lago com borda, ponte, rochas grandes e pequenas, arena do chefe, NPC, baú, placa, ponto de cura, flores e cogumelos digitais, entrada de área secreta.

---

## 1. O que o forest-v4.1 JÁ TEM **[E]**

### Chão (`tiles/`)
- `grass_00`..`grass_05` (6 variantes, incluindo o `ground_grass_real.png` legado DWDS, fora do pool padrão).
- `forest_floor_00`/`01`, `path_center` (chão base de trilha/piso denso).
- **Autotile 16-blob (v4):** `path_blob_0..15` (trilha×grama), `denseedge_blob_0..15` (mata densa×clareira).
- **Autotile Wang-47 (v4.1, 47 máscaras cada):** `path_w47_*`, `denseedge_w47_*` — mesmo par trilha/mata, versão mais rica, com recorte suave no renderer (`pathsmooth.ts`).
- `clearing_floor_v41_00..03` (4 variantes de chão de clareira, sem costura).

### Árvores (`props/`, 11 tipos, cada uma `_base` + `_top`)
`tree_round_a/b`, `tree_conifer_a/b`, `tree_bushy_a/b`, `tree_flowering`, `tree_birch`, `tree_ancient` (v4) + `tree_palm_digital`, `tree_data_leaf` (v4.1, com rim-light já assado no PNG).

### Outros props
`tall_grass_a/b`, `flower_cluster_red/white/purple` (3 cores), `rock_cluster` (1 tipo, colide), `fallen_leaves_cluster`, `mushroom_cluster`, `fallen_log` (colide), `canopy_shadow_small/large` (decalques de sombra, hoje substituídos pela sombra projetada procedural de `lighting.ts` nas árvores v4.1, mas ainda presentes no pacote).

### Sistema (não é "peça", mas é parte do kit)
- Preset noturno completo (`night/tiles/`, `night/props/`, mesmos nomes).
- Luz direcional + sombra projetada + rim-light (v4.1, `lighting.ts`).
- Noite nas entidades (`nightgrade.ts`).
- `license.json` cobrindo tudo (official-fan-use + original).

**Total medido no `tileset.json`:** 9 tiles base + 32 variantes de autotile 16-blob + 94 variantes Wang-47 + 4 clearing + 11 árvores×2 + 10 props de decor = pacote grande e maduro para **chão de floresta e vegetação**. O gap não é "floresta genérica" — é **interação e pontos de interesse**, que o pacote nunca teve.

## 2. O que FALTA para o piloto (por item pedido)

| Item pedido | Está no forest-v4.1? | Severidade | Esta entrega resolve? |
|---|---|---|---|
| **Água/lago com borda (autotile)** | **Não.** Nenhum tile de água existe no pacote — `GROUND_DAY.water` em `forest_v4_palette.js` é só uma cor (`W.waterMid`), nunca virou tile. | **Crítico** — bloqueia qualquer cena com rio/lago da imagem conceito do fundador. | **Sim** — `forest-v6/tiles/water_blob_0..15.png`, autotile de 16 peças com borda de espuma. Ver `forest-v6/README.md` para limitações (ainda não é Wang-47). |
| **Ponte** | **Não.** | **Crítico** (consequência direta de não ter água) | **Sim** — `forest-v6/props/bridge_h.png` (3 tiles) + `bridge_v.png` (rotação). |
| **Rochas grandes e pequenas** | **Parcial.** Só `rock_cluster.png` (1 tamanho, um "cacho" de 3-4 pedras pequenas-médias) — não há uma rocha grande de bloqueio de rota nem uma pedra miúda isolada. | Médio | **Sim** — `forest-v6/props/rock_big.png` e `rock_small.png`, distintos do `rock_cluster` existente. |
| **Arena do chefe** | **Não.** Não existe nenhum tile/prop de "arena" no pacote de floresta. O motor tem um sistema de arena PvP (`render/stadium.ts`, arquibancada/gramado desenhados por código) para o combate 1v1/3v3 do GS-006, mas é **visualmente genérico** (não tem tema de floresta) e serve a um modo de jogo diferente (arena isolada, não um ponto no mapa de exploração). O chefe de região já está definido em dado: `src/data/content/bosses.json` → `BOSS-KUWAGAMON` (Adult/Champion-dub, atributo Virus, golpe "Scissor Arms", `region: "floresta_densa"`, nível 15, fonte Wikimon verificada) — **mas não tem sprite nenhum** (nenhum `creature.json`/pasta em `GAME-ASSETS/01-creatures/` para Kuwagamon). | **Crítico, mas não é só arte de peça solta** | **Não.** Precisa de 3 coisas em sequência que nenhuma é "gerar uma imagem": (1) sprite do Kuwagamon (criatura, não cenário — fora do escopo desta tarefa de game-art-cenário, e fora do orçamento de 40 créditos se for via PixelLab de qualidade), (2) decisão de layout/game-design de como uma "arena" se parece dentro do mapa de exploração (clareira maior? anel de pedras? arcos digitais?), (3) os tiles/props dessa decisão. Recomendo abrir como item separado depois que (1) e (2) existirem. |
| **NPC** | **Não** há nenhum NPC estático no mapa `forest-proof` hoje (só os 3 bots-parceiro e selvagens). | Alto | **Não produzido nesta entrega.** O jogo já tem um sistema de composição de Tamer completo e reaproveitável (`src/assets/tamer-parts.ts`, `GAME-ASSETS/11-characters/player/character_parts.json`, 330 PNGs + recolor por paleta) — um NPC parado na floresta (ex.: um guarda-florestal, um comerciante) é **muito mais barato de fazer reaproveitando essa composição** (escolher modelo+roupa+paleta, sem pose de andar) do que desenhar um sprite novo do zero. Também há sheets de NPC oficiais brutos ainda não curados em `GAME-ASSETS/10-source-files/spriters-resource/*NPC*` (ex. `dgmnworldds__NPC-Characters`, `digiworld3__NPCs`) que poderiam virar `official-fan-use`. Recomendo isso para a próxima rodada, não arte nova do zero. |
| **Baú** | **Não.** | Médio | **Sim** — `forest-v6/props/chest_closed.png`. Só o estado fechado (ver limitações no README do pacote). |
| **Placa** | **Não.** | Baixo/Médio | **Sim** — `forest-v6/props/sign_post.png`. Texto real é dado de mapa, não arte (board em branco com uma marca "!" de referência). |
| **Ponto de cura** | **Não.** | Alto (é mecânica central de um idle MMO) | **Sim** — `forest-v6/props/healing_point.png` (poço brilhante ciano, sem colisão, tema "nascente digital" alinhado ao acento cyan já usado em `tree_data_leaf`). |
| **Flores e cogumelos digitais** | **Parcial.** Existem `flower_cluster_red/white/purple` (flores comuns) e `mushroom_cluster` (cogumelo comum) — **nenhum dos dois tem o tema "digital"** (dados, circuito, brilho) que o pedido especifica, ao contrário das árvores v4.1 que já ganharam variantes digitais (`tree_palm_digital`, `tree_data_leaf`). | Baixo (existe um placeholder funcional, só não no tema certo) | **Não produzido nesta entrega** — prioridade explícita da tarefa foi água/ponte/rochas/baú/placa/cura; flor/cogumelo digital ficou de fora do "viável agora" por orçamento de tempo desta rodada, não por dificuldade técnica (é a mesma técnica de `flowerCluster`/`mushroomCluster` em `forest_v4_props.js`, só trocando o acento de cor para o cyan `#2ce8f5`/`#0099db` já usado nas árvores digitais). Fácil de fazer numa próxima passada curta. |
| **Entrada de área secreta** | **Não.** | Médio | **Não produzido.** Isto é principalmente uma **decisão de design de mapa** (onde fica, o que ela esconde, como é sinalizada — uma pedra que desliza? uma trilha escondida atrás de uma cachoeira? um arbusto que se atravessa?) antes de ser uma peça de arte. Sem essa decisão do game-design, qualquer prop que eu desenhasse agora seria um palpite sem lastro. Recomendo que o papel "World Designer" (game-design, briefing §3) defina o conceito primeiro; a peça de arte em si (ex.: uma pedra com uma rachadura brilhante, ou um arbusto denso que o jogador atravessa) é rápida de fazer depois, com a mesma técnica usada em `forest-v6`. |

## 3. Resumo por severidade

- **Crítico, resolvido nesta entrega:** água+borda, ponte.
- **Crítico, não resolvido (precisa de mais que arte de peça):** arena do chefe (precisa de sprite de criatura + decisão de layout).
- **Alto, resolvido nesta entrega:** ponto de cura.
- **Alto, não resolvido (recomendação: reaproveitar sistema existente, não desenhar do zero):** NPC.
- **Médio, resolvido nesta entrega:** rochas grande/pequena, baú, placa.
- **Médio, não resolvido (decisão de design primeiro):** entrada de área secreta.
- **Baixo, não resolvido (fácil, ficou fora por tempo):** flores/cogumelos digitais.

## 4. Pendências para a próxima rodada (ordem sugerida)

1. **Flores/cogumelos digitais** — mesma técnica de `forest_v4_props.js`, troca de acento de cor só. Mais rápido de resolver do que qualquer outro item restante.
2. **NPC parado** — reaproveitar `tamer-parts.ts`/`character_parts.json` (sem pose de andar, só idle), não pipeline de arte novo.
3. **Entrada de área secreta** — depende de 1 decisão do game-design (onde/como); depois é rápido.
4. **Arena do chefe** — depende de (a) sprite do Kuwagamon (criatura — orçamento PixelLab ou pipeline local de criatura, que é uma técnica diferente da de cenário usada aqui) e (b) decisão de layout do game-design; é o item mais caro de fechar.
5. **Upgrade da água para Wang-47** — só depois que houver um mapa real com água para testar se o blob de 16 peças já é suficiente ou se os cantos internos pedem o mesmo tratamento que a trilha recebeu no v4.1.

## 5. Limitações

- Este inventário cobre **forest-v4.1** (o pacote que o jogo usa de fato, `forest-proof.tmj.json`). Não cobre `praia-v5`/`vila-v5` (outros biomas, fora do escopo "Digimon Forest").
- A contagem de `tiles`/`props` do §1 vem direto do `tileset.json` do pacote — não abri cada PNG individualmente para julgar qualidade, só existência/categoria (isso já está documentado nas sessões anteriores do próprio forest-v4/v4.1, citadas no `prototype/world/README.md`).
- "Severidade" é uma leitura de game-art **[H]**, cruzando o pedido explícito desta tarefa com o critério de aceite do briefing (§7, alcance BFS a 100% dos POIs/spawns/NPC/arena) — não é uma pontuação formal.
