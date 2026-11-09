# TECH_AUDIT — GS-010 Fase 1 (D2): render, animação, sprites, mapas e ferramentas

- **Autor:** game-dev (MAP-ENGINEER + GAME-INTEGRATOR, ADR-012) · **Data:** 2026-11-09 · **Fase:** 1, diagnóstico. **Nenhum código ou asset foi alterado.**
- **Base:** `docs/briefing/15_gs010_visual_quality_overhaul.md` §1 e §4, `docs/briefing/16_gs011_master_execution.md`.
- **Código auditado:** `prototype/world/` no commit `b89429c` (branch `master`), mais o diff local não commitado de outro agente (WarGreymon, X1). O WarGreymon não foi mexido.
- **Legenda:** **[E]** evidência (arquivo:linha, comando ou medição, 2026-11-09) · **[H]** hipótese ou estimativa.
- Caminhos de código são relativos a `GS-003/prototype/world/`. Assets: `~/projects/GameStudio/assets/GAME-ASSETS/`.
- A UI/HUD fica fora deste relatório (é o D3, `audit/UI_WORLD_AUDIT.md`).

---

## 0. Resumo

O renderer está tecnicamente saudável: Canvas 2D próprio, pixel-perfect, Y-sort, chunks, luzes e máscara, com folga de desempenho. **O que limita a qualidade é o conteúdo e o modelo de animação, não o motor.**

1. Os Digimon do mapa têm **1 quadro de idle** e **2 a 4 de walk** (3 distintos no máximo), porque vêm de rips de mapa do DW DS.
2. Ataque e dano existem só no lado W e saíram de **poses de batalha reduzidas por moda de bloco** (fator 0,30 a 0,41).
3. O resto é procedural: bob de 1 px, avanço de 8 px, knockback e fade.
4. O Presenter tem só **8 estados lógicos**. Não existem `RUN`, `TURN`, `VICTORY`, `SKILL`, `INTERACT` nem transições entre estados.
5. O mapa não tem **camada de primeiro plano** além das copas.
6. A **água do riacho é estática**, e não há vento em grama ou árvores.

---

## 1. Render

| Item | Estado atual | Evidência |
|---|---|---|
| Engine | Canvas 2D próprio (sem Phaser/Pixi). Vite 7 + TS 5.9 | [E] `package.json` (só devDependencies de build/test); `src/render/view.ts:1-3` |
| Sim × render | Sim autoritativa a **10 Hz** (`TICK_MS = 100`), render no rAF com interpolação `alpha` e mola "SmoothDamp" visual (`SMOOTH_TIME_S = 0.075`) | [E] `src/sim/params.ts:10`; `src/main.ts:862-911`; `src/render/motion.ts:11,55-76` |
| Resolução lógica | Variável: `canvas.width = ceil(innerWidth/scale)`. Mínimo 400×240 (mapa de teste) ou alvo ~640×400 (regiões). No look v8 (`zoomMul 1.5`), [H] 1920×1080 → escala 4 → **480×270 lógicos**; 1366×768 → escala 3 → 456×256 | [E] `src/main.ts:77-78, 751-772`; `src/data/maps/v8/digimon-forest-01.aliases.json:305` |
| Escala inteira | Sim. `scale` é inteiro, e o CSS amplia com `image-rendering: pixelated`. **Não trata `devicePixelRatio`**: com o Windows em 125% ou 150%, cada pixel lógico vira 3,75 ou 4,5 px físicos (pixels com larguras desiguais) | [E] `src/main.ts:760-765`; `src/style.css:26-33`; `grep -rn devicePixelRatio src` → 0 ocorrências |
| Sprites | `imageSmoothingEnabled = false`, coordenadas `Math.round`. Escala da criatura = `creatureScale × mapScale`, ambos inteiros | [E] `view.ts:339, 921-923`; `src/assets/creatures.ts:195-201` |
| Câmera | Segue a posição visual do Tamer com lerp exponencial (`tau 110 ms`), presa às bordas e arredondada a pixel inteiro. Tremida de 2 px/180 ms no crítico. Desloca `HUD_BOTTOM_PX/2` para centrar acima da barra | [E] `view.ts:286-299`; `motion.ts:105-108`; `presenter.ts` (`SHAKE_PX=2`, `SHAKE_MS=180`); `main.ts:892` |
| Zoom | Só na carga, por `?zoom=N` / `?zoom=1.5x` ou pelo `zoomMul` do look. **Não há zoom dinâmico** (ex.: aproximar em combate) | [E] `main.ts:68-74, 759-761` |
| Ordenação por Y | Props e entidades numa lista, ordenada por `y` dos pés com desempate estável por id. Sombras e VFX "ground" ficam antes; copas, look, VFX "over", números e barras, depois | [E] `view.ts:337-415` (sort em `:381`) |
| Rótulos | Segundo canvas (`#labels`) em **resolução de tela**: o texto de nome/nível não é pixel art, enquanto o número de dano é (fonte pixel, `pixelfont.ts`) | [E] `index.html`; `main.ts:766-769, 829-831` |

### Camadas reais, na ordem de desenho (`view.render`, `view.ts:337-415`)

1. **Fundo:** `fillRect #181425`. Não há parallax nem céu.
2. **Chão (BG):** chunks de 16×16 tiles pré-renderizados (`CHUNK_TILES = 16`, `view.ts:686-760`). Cada chunk compõe:
   - as camadas Tiled `ground` e `ground_detail` (face de penhasco);
   - a faixa das curvas (trilha e riacho);
   - o recorte Wang-47 suave (`pathsmooth.ts`);
   - lama (`patches`), 959 decalques e oclusão na base do penhasco;
   - sombras de contato dos props e sombras projetadas das copas.

   **Tudo estático**, cacheado por chunk e por preset dia/noite.
3. `underlay` opcional (só a Arena).
4. Sombras de entidade: elipse pixelada e núcleo mais escuro no v8 (`view.ts:1231-1272`).
5. VFX, camada "ground" (círculos de área, rachaduras).
6. Anel do alvo da parceira.
7. **MID (Y-sort):** props (`objects_below`), troncos das árvores de 2 sprites, NPCs humanos e entidades.
8. **FG:** só as **copas** (`drawCanopies`, `view.ts:581-618`). Ficam translúcidas (`behindAlpha`, transição de ~120 ms) quando cobrem o Tamer ou a parceira local. **Não existe outra camada acima do jogador.**
9. **Look v8** (`drawLook`, `view.ts:447-575`), detalhado abaixo.
10. VFX "over", impacto genérico, barras de HP, "!", números flutuantes.
11. Canvas `#labels` (nomes) e HUD em DOM.

### Luzes e máscara do look v8 (`view.ts:447-575`, `src/render/look.ts`)

- **Grade de cor:** HSV aplicado **uma vez na carga** sobre a arte do cenário (`gradeTiles`, `main.ts:245-250`). Personagens, UI e emissores ficam de fora. **Custo zero por quadro.**
- **Ambiente:**
  - `multiply` em tela cheia;
  - véu frio + vinheta num canvas cacheado por tamanho e por degrau da noite (16 degraus): 1 `drawImage` por quadro.
- **Névoa:** sprites com âncoras a cada N tiles na borda da mata, com deriva senoidal.
- **Luzes pontuais:**
  - sprites radiais aditivos (`lighter`) com flicker de fogo, em buffer de tela;
  - 44 emissores no mapa + luz do Tamer à noite.
- **Máscara das copas:** silhuetas das copas visíveis desenhadas num buffer de 1/3 da tela, ampliado com **bilinear** (feather de ~3 px), aplicado com `destination-out` sobre o buffer de luz.
- **Partículas** sem estado (função do tempo): vagalumes, poeira digital, folhas.
- **Noite das entidades:** cada quadro é recolorido (`nightgrade.ts`) e cacheado só no degrau atual (`view.ts:638-650`).
- **Observação:** os gradientes de luz, névoa e vinheta são **suaves** (não quantizados). Ampliados por `pixelated`, viram degraus grossos. É uma decisão de estilo para o game-art: misturar luz suave com pixel art.

### Custo por quadro (medições `perf-*`, Chromium headless, software raster, `--disable-gpu`)

O cenário medido é o pior caso: o **mapa inteiro** (canvas lógico 1792×1280, zoom 1), AUTO ligado e 33 entidades.

| Medição | Arquivo | Trabalho do quadro p50/p95 (ms) | Render+raster p50/p95 (ms) | fps médio |
|---|---|---|---|---|
| v3 padrão, dia | `evidence/map-factory/perf-digimon-forest-01.md` | 3,1 / 3,9 | 12,6 / 14,0 | — |
| v3 rerun, dia / noite | `perf-digimon-forest-01_v3_rerun.md` | 3,3 / 4,6 · 5,0 / 6,7 | 13,6 / 15,1 · 15,1 / 17,4 | 48 / 45,1 |
| **look v8** (`query: &look=v8`), dia / noite | `perf-digimon-forest-01_v4.md` / `.json` | **4,0 / 5,2 · 5,9 / 7,6** | **9,5 / 13,0 · 11,7 / 15,0** | 57,8 / 56,2 |

- [E] O look v8 cabe em 60 fps até no pior caso medido: 0–2 quadros acima de 16,7 ms em 600 no trabalho do loop.
- [H] Na tela real (~480×270 lógicos, cerca de 7% da área medida), o raster deve ficar bem abaixo de 5 ms. Há **folga grande** para animação ambiental, mais quadros de sprite e uma camada FG.
- [E] Os números são de headless em software e servem para comparar versões, não como fps do jogador (a ressalva está nos próprios `.md`).

---

## 2. Sistema de animação atual

**Método: spritesheet/atlas por quadro com fallback procedural.** Não há skeletal nem tween de partes. [E] `src/render/anim.ts:1-4, 39-76`; `src/assets/creatures.ts:13-53`.

### Pipeline

- **Manifest:** `creature.json` (schema v2) e atlas JSON Hash. Cada animação tem `frames[{durationMs, atlasKey}]` e opcionalmente:
  - `dirFrames` por direção;
  - `events` (só `hitFrame` é lido);
  - `loop`;
  - `space: map|battle`.

  [E] `creatures.ts:18-53`.
- **Escolha da animação** (`resolveAnim`): `combatStates[state]` → lista `WANTED[state]` → fallback `idle` + efeito procedural (`bob`/`lunge`/`knockback`/`fade`). [E] `anim.ts:39-76`.
- **Escolha do quadro** (`view.frameFor`, `view.ts:1075-1095`):
  - Walk: pela **distância andada** (`walkFrameIndex`, `motion.ts:88-97`). A cadência acompanha a velocidade.
  - Attack/hurt: tempo desde o início do evento, one-shot preso no último quadro.
  - Idle: tempo + fase por entidade.
- **Direção:** `motion.ts` calcula **só 4 eixos** (S/N/E/W) com histerese (`AXIS_BIAS 1.25`). `resolveFacing` usa a direção desenhada ou o espelho; sem E desenhado, E = W espelhado. [E] `motion.ts:17, 66-74`; `anim.ts:123-141`.
- **Golpe e dano:** forçam o lado E/W ("as poses do DS são laterais"). Não há pose N/S de ataque. [E] `view.ts:311-314`.

### Estados suportados (Presenter)

`LogicState = IDLE | WALK | FOLLOW | ENGAGE | ATTACK | HURT | DEFEAT | RETURN` [E] `src/sim/types.ts:5`.

- `visualState` dá prioridade a DEFEAT > ATTACK > HURT > estado lógico. HURT/DEFEAT só aparecem depois do evento confirmado. [E] `presenter.ts:581-587`.
- **Não é uma máquina de estados de animação.** É uma função pura que escolhe a animação pelo estado no instante. Não há:
  - transição;
  - fila de one-shots;
  - blend;
  - "termina e volta";
  - estados só de apresentação.
- A locomoção é decidida pela velocidade visual: `speed > 10 px/s` → WALK. [E] `view.ts:1080-1082`; `motion.ts:15`.

| Estado visual | Arte usada (Digimon típico de DW DS) | Quadros | fps / duração | Procedural | Evidência |
|---|---|---|---|---|---|
| Idle | `idle`: **1 quadro** | 1 | 600 ms | bob de **1 px** a cada 450 ms (período 900) | `motion.ts:100-102`; `view.ts:1109-1111` |
| Walk / Follow / Engage / Return | `walk`: 4 (ciclo 0-1-0-2, 3 distintos) ou **2** | 2–4 | 150 ms/q (~6,7 fps na velocidade de referência) | sem `walk`: bob de 1 px a cada 8 px | manifests; `view.ts:1111` |
| Attack | `attack`: 3 quadros **só W** (E espelhado), derivados da pose de batalha | 3 (Patamon/Tokomon 4) | 180/160/60 ms (`hitFrame`) | avanço com antecipação (-3 px → +8 px), hit-stop 70 ms, volta | `anim.ts:17-26, 86-100, 171-183` |
| Skill (golpe especial) | **o mesmo `attack`**, +180 ms de voo | igual | igual | o VFX tem fases `charge/launch/travel/impact/residue`, mas o **corpo não segura pose de carga** | `anim.ts:27-28`; `src/render/vfx/engine.ts:163-170, 201-218` |
| Hurt | `hurt`: **1 quadro** W | 1 | 220 ms | flash branco 80 ms + knockback 6/9 px | `anim.ts:29-33, 186-194` |
| Defeat | o quadro de `hurt` + **fade** de 600 ms | 1 | — | fade | `anim.ts:34, 47`; `view.ts:1116` |
| Run / Turn / Victory / Interact | **não existem** como estado nem como slot | — | — | — | `types.ts:5`; `anim.ts:39-48` |
| Evolução | cinemática por código (~2,7 s, silhuetas, clarão) | — | — | sim | `view.ts` `drawEvolving`; `presenter.evoFrame` |

- **Tamers (TAMER-0003..0014):** idle 1 quadro + bob de 1 px (período 1100 ms nos placeholders); walk 4 quadros (3 distintos) a 150 ms. Os PNGs têm 4 diagonais (SW/SE/NW/NE), remapeadas para S/E/N/W em `tamer-presets.ts`. [E] `character.json` de cada TAMER; `src/assets/tamer-presets.ts:1-3, 321`.
- **Assets subutilizados:** `battle_idle` (3–4 quadros, ~4 fps) existe em quase todas as espécies, mas com `space: battle`, pose 3/4 SW e escala de batalha (~75 px). Por isso não entra no mapa. [E] manifests (tabela da §3).

### O que impede cada animação pedida pelo GS-010

| Pedido | Bloqueio técnico | Bloqueio de arte |
|---|---|---|
| Idle com respiração | Nenhum: `idle` com N quadros em loop já funciona sem mudar código (`frameAt` loop). O bob de 1 px é somado por cima (`view.ts:1109-1110`) e precisaria ser desligado quando o idle tiver ≥ 2 quadros | O rip do DS tem 1 pose de pé por direção |
| Run | Não há estado nem limiar de velocidade. `frameFor` só conhece WALK. A sim não tem "correr" (velocidade fixa por entidade) | Não existe nos rips |
| Turn | A direção troca no mesmo quadro (`stepMotion`). Não há quadro intermediário nem 8 direções na locomoção (`to4`) | Rips têm S/N/W (E espelhado), sem diagonais |
| Hurt com reação | O slot `hurt` aceita N quadros e `HURT_VIS_MS = 320` é fixo (não acompanha a duração da arte). Força o lado E/W | 1 quadro reduzido da batalha |
| Victory | Não há estado nem gatilho. O evento de derrota do alvo existe no Presenter, mas não aciona pose no vencedor | Não existe |
| Defeat | O slot `defeat` existe em `WANTED`, mas o fade é sempre aplicado e a remoção vem da sim (600 ms) | Usa o quadro de `hurt` |
| Follow | Cai em `walk`. Não há cadência própria ("Follow a 6 fps", ANIMATION_STANDARD P0) | — |
| Skill com antecipação/impacto | 1 só slot `attack` para todos os golpes. Não há `attack` por golpe nem por arquétipo. A pose do corpo não acompanha `charge` do VFX (one-shot preso no último quadro) | Não há pose de carga ou lançamento |
| Transições sem corte | Não há fila, `onComplete`, `exit`/`enter` nem crossfade. Um one-shot interrompido troca de quadro na hora | — |

---

## 3. Sprites reais

**Medição:** `python3 /tmp/sp.py` sobre `world-species.json` + `creature.json`. Bbox por quadro com Pillow do venv do sd-local, todos [E] 2026-11-09.

- **Escala de render na tela:** `mapScale × escala CSS inteira` (×3 a ×4 típico no v8; [H] pela §1). Exceção: WarGreymon tem `mapScale 2`, portanto ×6 a ×8.
- **Origem:** todas as espécies em uso são **rips de mapa do Digimon World DS** (Spriters Resource), layer `official-fan-use`, exceto Gigimon e Dorimon. Todas estão em `approvalStatus: UNDER_REVIEW`.

### Digimon em uso

| ID | Espécie | Frame (px) | mapScale | Animações de mapa (quadros) | Direções desenhadas | Origem / perda de qualidade |
|---|---|---|---|---|---|---|
| 0002 | Gigimon | 24×24 | 1 | idle 1, walk 4 | S/N/W (E = espelho) | **Brave Tamer reduzido por nearest-neighbor** (S/W); **N desenhado à mão**; S = pose de rugido 3/4 assimétrica, espelhada em W |
| 0003 | Guilmon | 30×34 | 1 | idle 1, walk 4, attack 3, hurt 1 | S/N/W | DW DS. attack/hurt = batalha **reduzida a 0,413** por moda de bloco (75 → ~31 px) |
| 0004 | Growlmon | 40×41 | 1 | idle 1, walk 4, attack 3, hurt 1 | S/N/W | DW DS. attack/hurt reduzidos igual ao Guilmon |
| 0005 | Koromon | 28×22 | 1 | idle 1, walk 4, attack 3, hurt 1 | S/N/W | DW DS |
| 0006 | Agumon | 30×30 | 1 | idle 1, **walk 2**, attack 3, hurt 1 | S/N/W | DW DS; walk S tem 2 quadros, W/N têm 4 |
| 0007 | Greymon | 40×42 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W | DW DS |
| 0008 | Tsunomon | 22×23 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W/E | DW DS |
| 0009 | Gabumon | 36×34 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W/E | DW DS |
| 0010 | Garurumon | 38×35 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W | DW DS |
| 0011 | Tokomon | 26×26 | 1 | idle 1, walk 2, attack 4, hurt 1 | S/N/W | DW DS |
| 0012 | Patamon | 32×27 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W | DW DS |
| 0013 | Angemon | 36×43 | 1 | idle 1, walk 2, attack 3, hurt 1 | S/N/W | DW DS |
| 0014 | Dorimon | 17×19 | 1 | idle 1, walk 4 | S/N/W | **misto:** W/E do rip **reduzido 1,056** (18 → 19 px); S/N desenhados à mão |
| 0101–0118 | Dorumon, Dorugamon, DoruGreymon, Biyomon, Gomamon, Tentomon, Palmon, Betamon, Gotsumon, Numemon, Floramon, Hagurumon, Crabmon, Otamamon, Goburimon, Tanemon, Lalamon, Penguinmon (selvagens) | 21×22 a 37×40 | 1 | idle 1, walk 2–4. **Sem attack/hurt** (100% procedural) | S/N/W. Dorumon, Gotsumon, Otamamon e Goburimon: **só S/W**. Tanemon: **só S/N** | DW DS |
| 0016 | WarGreymon (X1, outro agente) | 36×50 | **2** | idle 1, **walk S 1 quadro**, attack 3, hurt 1 | N/W/S | DW DS. attack/hurt reduzidos a 0,303. mapScale 2 = densidade de pixel diferente do resto |
| SP-GEOGREYMON, SP-DRIMOGEMON | — | — | — | **sem arte** (marcador "?") | — | — |

### Tamers

| ID | Frame | Animações | Direções | Origem |
|---|---|---|---|---|
| TAMER-0001/0002 | 32×32 | idle 1, walk 4 | S/N/W/E | DW DS "Hero" |
| TAMER-0003..0014 (12 presets do criador) | 24–42 × 33 | idle 1, walk 4 (3 distintos), 8 cores de cabelo | SW/SE/NW/NE → S/E/N/W | DW DS NPCs + recolor + kitbash de acessório (`official-fan-use-derived`) |
| Placeholder | código (`tamer.ts`) | 2 passos | S/E | desenhado em código |

### Onde há perda de qualidade

1. **Redimensionamento não inteiro dentro do asset** [E]: attack/hurt de todas as espécies com combate (0,413; 0,303), Gigimon (nearest-neighbor) e Dorimon (1,056). Os contornos e o detalhe ficam inconsistentes com o quadro de mapa ao lado.
2. **Densidade de pixel misturada** [E]:
   - WarGreymon ×2 contra ×1;
   - nomes em resolução de tela contra mundo pixelado;
   - luz e névoa suaves contra arte pixelada;
   - sem tratamento de DPR (pixels desiguais em telas com 125%/150%).
3. **Espelho E = W** [E]: detalhes assimétricos trocam de lado (ex.: a pose de rugido do Gigimon, braço ou arma de um lado).
4. **Pivô** [E] (bbox por quadro): o pé fica a **-1 px do pivô em todas as espécies** (consistente, sem salto). O centro horizontal oscila 1–2 px entre quadros do walk (ex.: Growlmon W `cx +1.5 → +2.0 → +3.0`; N `-2.0 → -0.5`). [H] É leve, mas soma ao bob e pode ler como tremida em escala ×4. Gigimon pula 3 px de propósito (hop).
5. **Blur:** nenhum nos sprites (smoothing desligado). O único bilinear é a máscara das copas sobre a luz (intencional).
6. **Flicker** [H]: não reproduzido nesta auditoria. Candidatos:
   - cache de noite por degrau (`nightFrames` limpo a cada degrau);
   - troca de face com histerese em diagonais;
   - o one-shot de ataque preso no último quadro quando o VFX dura mais que a arte.

   Verificar em vídeo na Fase 2.
7. **Recorte:** nada detectado. Os quadros têm margem (ex.: Gigimon 21×19 dentro de 24×24).

---

## 4. Mapas

| Item | Estado | Evidência |
|---|---|---|
| Formato | **Tiled JSON (.tmj)** ortogonal, tile 32 px, 56×40 tiles (piloto `digimon-forest-01`). Gerado pela **Map Factory** (`scripts/map-factory/generate.mjs`), não editado à mão. Variante v8 por `?look=v8` em `src/data/maps/v8/` | [E] `src/sim/map.ts:1-2`; leitura do `.tmj` |
| Tilesets | 1 tileset lógico (`forest-v4`, 96 entradas com propriedade `key`). As imagens vêm do `.aliases.json` (pacotes `art/map-factory/forest-v4..v8`) | [E] `.tmj`; `aliases.json` |
| Camadas de tiles | `ground` (2240 células) e `ground_detail` (25: face/rampa de penhasco) | [E] |
| Camadas de objetos | `objects_below` (780 props), **`objects_above` (0, vazia)**, `collision` (23), `curves` (6: 5 trilhas, 1 riacho), `decals` (959), `patches` (5), `spawns`, `npcs`, `triggers`, `poi` | [E] |
| Autotile | Wang-47 com recorte suave por máscara (`pathsmooth.ts`), Wang-16 de canto (água/grama `fp7_wg_c16_*`) e curvas contínuas (polilinha + meia-largura, borda `dither`/`foam`) | [E] `view.ts:803-870`; `src/render/curves.ts` |
| Decalques e props | Decalques no chão, estáticos e assados no chunk. Props por chave com pivô no pé. Árvores em 2 sprites (tronco no Y-sort, copa em cima) com sombra projetada procedural e rim-light | [E] `view.ts:237-277, 720-760` |
| Foreground real | **Só as copas.** `objects_above` é gerada vazia e o parser trata **todo** objeto `prop` igual (vai para o Y-sort), qualquer que seja a camada. Não há arbusto, galho ou névoa de primeiro plano que passe na frente do jogador | [E] `scripts/map-factory/generate.mjs:637-639`; `src/sim/map.ts:225-230` |
| Água | `ANIMATED_TILES` só tem `water_00` (2 quadros, 600 ms), **e a floresta não usa essa chave**. O riacho é uma curva com textura fixa (`fp7_wg_c16_15`), cacheada para sempre por célula: **riacho parado** | [E] `src/assets/tiles.ts:107-109`; `view.ts:803-818`; curvas do `.tmj` v8 |
| Árvores e grama | **Sem vento.** Copas, troncos, tufos e juncos são estáticos. Só o alpha da copa anima (quando cobre o jogador) | [E] `view.ts:581-618`; `grep sway\|wind` → 0 |
| Vida ambiental existente | Névoa com deriva; partículas (vagalumes, poeira digital, folhas); flicker das luzes de fogo; ciclo dia/noite com crossfade de paleta | [E] `look.ts:374-470`; `daynight.ts` |
| Editável | O mapa é **gerado** a partir de brief/build JSON (`scripts/map-factory/briefs/*.v8.build.json`). Editar no Tiled e regerar sobrescreve. Não há round-trip Tiled ↔ Factory | [E] `regions.ts:63`; [H] fluxo |

---

## 5. Ferramentas

| Ferramenta | Situação | Evidência / observação |
|---|---|---|
| **ComfyUI + SD 1.5 + LoRA pixel-art** | **Instalado e testado; servidor parado.** RTX 2060 6 GB; ~4 s por sprite 512² (quente); pico de 4,87/6 GB VRAM e 6,1/7,7 GB RAM | [E] `shared/tools/sd-local/INSTALL_REPORT.md`. Limites: 1 seed por sprite, **sem consistência entre quadros/poses** (não serve para animação), tile não testado como tileável, `--transparent` falha com fundo irregular. SDXL [H] não cabe |
| **PixelLab MCP** | **Funciona.** Saldo [E] `get_balance`: **26 gerações** (40 no total, 14 usadas), **plano trial**, US$ 0 de crédito | O trial **não** dá acesso a: `mode="pro"` de tileset/sidescroller, `create_room`, `cut_out_room_furniture` e `transfer_outfit` (Tier 1+) |
| PixelLab: animação | Ferramentas e custos (descrições das ferramentas, 2026-11-09): | |
| | `animate_character` template | 1 gen/direção até ~92 px (ex.: `breathing-idle` 4q, `walking-8-frames`, `running-8-frames`, `taking-punch`, `falling-back-death`) |
| | `animate_character` v3 | `ceil(w·h·frames/65536)` por direção no canvas **gerado**: 64 px/8q = 1, 96–128 px = 2–3 |
| | `animate_character` skeleton-v3 | 3 gen/direção (beta) |
| | `animate_character` pixminimax | 64 px: 8q = 1, 16q = 2, 40q = 6 por direção |
| | `animate_image` / `animate_image_pixminimax` | anima **sprite solto** (serve para os rips): 64×64 com 8q = 1 gen |
| | `animate_with_skeleton_v3` | esqueleto próprio por quadro; `estimate-skeleton` custa 0,1 gen |
| | `create_character` v3 | rotaciona um sprite de referência em 8 direções por ~1 gen (64 px) |
| | Ferramentas gratuitas | `pixelart_workbench` (edição/inspeção/limpeza exata) e `vfx_workbench` (efeitos) são **grátis** |
| | Conta [H] | um Digimon com 4 dir × (idle + walk + run + attack + hurt) ≈ 20 gen. **O saldo cobre ~1 Digimon completo, não 3** |
| **Tiled** | **Não instalado** (`command -v tiled` vazio; nada em `/mnt/c/Program Files`) | Gratuito, open-source. Instalar exige aprovação de rede/instalação; não é obrigatório porque os mapas são gerados |
| **LDtk** | **Não instalado** | Idem |
| Aseprite / LibreSprite | **Não instalados** | O `pixelart_workbench` cobre parte disso |
| **Chromium headless** | `chrome-headless-shell` 153 (Playwright cache, `~/.cache/ms-playwright/chromium_headless_shell-1243/`). **Precisa** de `LD_LIBRARY_PATH=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu` (sem isso: `libnspr4.so` não encontrada) | [E] teste de `--version`. **Risco:** `/tmp/chromelibs` some quando o WSL reinicia |
| Captura | `scripts/capture-live.mjs` usa **CDP cru** (sem pacote Playwright), `--disable-gpu` e `--force-device-scale-factor=1` | [E] `capture-live.mjs:6-37, 122-125` |
| **ffmpeg** | Nenhum no sistema. Existe o ffmpeg do Playwright (`~/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux`): encoders de vídeo **só `libvpx` (VP8) e `png`**; muxers `webm`/`image2`; entrada `image2pipe` | [E] `-encoders`/`-muxers` |
| Pacote `playwright` (npm) | **Não está** no `node_modules` do projeto nem global | [E] `ls node_modules`; `npm ls -g` |

### Dá para gravar vídeo de gameplay? **Sim, em WebM VP8.** MP4/H.264 não: não há `libx264`.

| Caminho | Passos | Prós e contras |
|---|---|---|
| **A, sem instalar nada** (recomendado) | CDP `Page.startScreencast` (ou `Page.captureScreenshot` por quadro) no `capture-live.mjs` → PNGs → `ffmpeg-linux -f image2pipe -c:v libvpx` → **`.webm`** | Também sai GIF pelo `scripts/gif.mjs` (encoder próprio) |
| **B, `recordVideo` do Playwright** | `npm i -D playwright` (gratuito, precisa de rede para o npm) | Grava **WebM VP8** com o mesmo ffmpeg-1011 |
| Variante determinística | Avançar o relógio por quadro e capturar | [H] Mais limpa que o screencast: em software raster, o screencast pode perder quadros. Gera 30/60 fps exatos, sem jitter de captura |

Para o fundador em MP4, [H] converter fora do host ou instalar um ffmpeg completo (gratuito, exige aprovação).

---

## 6. Limitações técnicas que travam a qualidade

Nenhuma exige trocar engine ou renderer. Esforço em dias de agente [H]. Risco = chance de regressão no que já funciona.

| # | Limitação | Gravidade | Mudança mínima que destrava | Esforço [H] | Risco |
|---|---|---|---|---|---|
| **L1** | **Conteúdo de animação pobre:** idle de 1 quadro, walk de 2–4, attack/hurt só W e reduzidos da batalha, selvagens sem combate (§2, §3) | **Crítica** | Nenhuma no código para idle/walk/attack/hurt/defeat com N quadros e `dirFrames`: o manifest já aceita. Falta produção de arte (game-art + PixelLab/workbench) e **desligar o bob de 1 px** quando `idle` tiver ≥ 2 quadros (`view.ts:1109-1111`, 1 linha) | código 0,5 d; arte: dominante | Baixo |
| **L2** | **Modelo de estados estreito, sem transições:** 8 `LogicState`; não há RUN/TURN/VICTORY/SKILL/INTERACT; nenhum one-shot com "termina e volta"; skill = attack | **Crítica** | Criar um **AnimController só de apresentação** no Presenter/view, sem tocar a sim:<br>- estados visuais derivados (`run` por limiar de velocidade, `turn` na troca de face, `victory` no evento de derrota do alvo, `skill_<arquétipo>` pelo `moveId`, `interact` no evento de interação);<br>- fila de one-shots com `onComplete` → volta à locomoção;<br>- duração do `hurt` vinda da arte (hoje fixa em `HURT_VIS_MS`);<br>- `attack` por golpe via `combatStates`/`moveAnims`. Fallback para o comportamento atual quando a animação não existir | 2–3 d | Médio (sincronia dano↔hitFrame é sensível; há testes de presenter) |
| **L3** | **Direções:** locomoção em 4 eixos, sem diagonais, E = espelho de W, golpe forçado ao lado | Alta | `motion.ts`: face em 8 direções (histerese) quando o manifest tiver diagonais desenhadas (`resolveFacing` já resolve 8). Permitir `attack`/`hurt` com `dirFrames` N/S antes de forçar o lado (`view.ts:311-314`) | 1 d | Baixo-médio |
| **L4** | **Sem foreground nem vida ambiental:** `objects_above` vazia e ignorada; riacho estático; sem vento em copas, tufos e juncos | Alta (mapa piloto) | (a) `map.ts`: props de `objects_above` vão para uma lista FG desenhada depois das copas, com o fade de oclusão que já existe em `drawCanopies`. (b) Vento: deslocamento de ±1 px nas linhas de cima de copas e tufos com fase por posição, cache por fase (4–6 quadros). (c) Riacho: índice de quadro pelo tempo na chave do `curveTile` e uma textura com 3–4 quadros (como `ANIMATED_TILES` faz no chunk) | 2–3 d | Baixo (aditivo, por flag) |
| **L5** | **Densidade de pixel e DPR:** sem `devicePixelRatio` (pixels desiguais em 125%/150%); WarGreymon ×2; quadros reduzidos da batalha; texto de nome em resolução de tela | Alta (aparência "barata" em telas comuns) | `main.ts` `resize`: `scale` inteiro em **pixels físicos** (`round(dpr·base)`) e tamanho CSS = `canvas.width·scale/dpr`. Regra de asset: só ×1 ou arte redesenhada no tamanho alvo, sem redução por moda de bloco | 0,5 d (DPR) | Baixo; a escala muda em telas HiDPI, então validar o enquadramento |
| L6 | **Ferramentas:** PixelLab trial com 26 gerações (~1 Digimon completo); SD 1.5 sem consistência entre quadros; sem Aseprite, Tiled ou LDtk; Chromium depende de `/tmp` | Média | Fluxo híbrido: PixelLab só para os quadros-chave mais caros (run, attack) e `pixelart_workbench` (grátis) para limpeza e in-betweens. Mover as libs do Chromium de `/tmp` para `shared/tools/`. Instalar LibreSprite e Tiled (gratuitos) **só com aprovação** | 0,5 d | Baixo |
| L7 | **Mapa gerado, não editado:** sem round-trip Tiled ↔ Map Factory | Média | No piloto, tratar o `.tmj` v9 como fonte (editável à mão) e congelar a regeração dessa variante. Ou adicionar `overrides` no build JSON | 1 d | Médio (duas fontes da verdade) |
| L8 | **Sim a 10 Hz** dita o início dos estados: um passo de anim pode atrasar até 100 ms | Baixa | Nada: a mola visual já cobre isso. Só considerar se `turn`/`run` parecerem atrasados no vídeo | — | — |

### As 5 mais graves, em ordem

1. **L1** — arte de animação inexistente.
2. **L2** — modelo de estados sem transições.
3. **L4** — sem foreground e vida ambiental.
4. **L5** — DPR e densidade de pixel.
5. **L3** — 4 direções e espelho.

---

## 7. Ambiente seguro para a Fase 2 (proposta, nada foi executado)

### Fato [E]

- O estúdio é **um único repositório git** (`~/projects/GameStudio`, branch `master`, **sem remote**).
- **6044 arquivos do GAME-ASSETS estão versionados** (`git ls-files assets/GAME-ASSETS | wc -l`).
- O working tree tem **191 caminhos alterados ou não rastreados de outros agentes**, incluindo o WarGreymon (X1) em `world-species.json`, `main.ts` e `demo.ts`.

### 1. Branch em worktree separado (não trocar o branch do diretório compartilhado)

- **Antes:** o coordenador pede ao dono do X1 para commitar (ou stashar) o WIP do WarGreymon. Só então tag de referência: `git tag pre-quality-overhaul`.
- `git worktree add ../GameStudio-qo -b quality-overhaul pre-quality-overhaul`.
  - Isola o piloto sem atrapalhar quem trabalha em `master`.
  - Cada worktree precisa do próprio `npm ci` em `prototype/world`.
  - Porta de dev separada para não colidir com a 5174 (`strictPort`): ex. 5180.
- **Merge** para `master` só na Fase 5, com a aprovação do fundador.

### 2. Backup dos assets originais (sem apagar nada)

- A tag git `pre-quality-overhaul` já é o backup versionado (sem remote).
- Cópia fria fora do repo, para o caso de o `.git` corromper:
  - `tar czf ~/backups/gs003-assets-pre-qo-2026-11-09.tgz assets/GAME-ASSETS/01-creatures assets/GAME-ASSETS/11-characters projects/prototypes/GS-003/art/map-factory projects/prototypes/GS-003/prototype/world/src/data/maps`;
  - ~21 MB [E] `du -sh`; gerar o SHA-256.
- **Assets novos nunca sobrescrevem** os existentes:
  - criaturas: versão nova no `creature.json` com `previousVersions` + pasta `versions/` (a convenção já existe nos manifests);
  - mapas: variante `src/data/maps/v9/`.

### 3. Flags para isolar o piloto (padrão intocado)

- **`?look=v9`:** mesma mecânica do `?look=v8` (`regions.ts` `looks`). Mapa e pacote da floresta reconstruída; FG, vento e riacho animado só nesse look.
- **`?anim=v2`:** liga o AnimController (L2) e as 8 direções (L3). Sem a flag, `resolveAnim`/`frameFor` continuam como hoje. Sobre os testes de presenter e view existentes:
  - devem passar com a flag desligada;
  - testes novos cobrem a flag ligada.
- **`?dpr=1`:** liga o resize consciente de DPR (L5) para comparar lado a lado antes de virar padrão.
- **Assets do piloto:** pasta paralela (ex.: `GAME-ASSETS/01-creatures/CREATURE-0003/versions/qo/` ou um `assetSet` por flag). O jogo padrão continua lendo a versão corrente.
- **Evidência:** capturas e vídeos em `quality-overhaul/evidence/` com o mesmo seed (`SEED=7`) e a mesma rota, antes e depois.

---

## Imagens do estado atual (já existentes, não refeitas nesta auditoria)

- Mapa inteiro no look v8, dia e noite: `GS-003/evidence/map-factory/factory_00_mapa_inteiro_dia_v4.png`, `..._noite_v4.png`
- Lado a lado v3 × v8: `factory_v4_lado_a_lado_v3_v4_dia.png`, `..._noite.png`
- Clareira, fogueira e NPCs (v5b): `factory_v5_clareira_dia_v5b.png`, `factory_v5_fogueira_acampamento_noite_v5b.png`, `factory_v5_npc_ranger_ao_lado_do_tamer_dia_v5b.png`
- Riacho (estático) dia e noite: `factory_v4_riacho_dia_v4.png`, `factory_v4_riacho_noite_v4.png`
- Evolução em GIF (animação por código): `GS-003/evidence/evolution/evo_digivolucao.gif`

## Limitações desta auditoria

- **Sem vídeo nem captura nova:** a Fase 1 pediu só diagnóstico, e o jogo não foi rodado nesta sessão. Flicker, tremida do walk e a escala real na tela estão marcados como [H] até a gravação da Fase 2.
- Resoluções lógicas por tamanho de tela são calculadas pela fórmula de `main.ts`, não medidas.
- Os custos do PixelLab vêm das descrições das ferramentas; nenhuma geração foi feita.
- O diff do WarGreymon (X1) está em andamento e pode mudar os números da linha 0016.
