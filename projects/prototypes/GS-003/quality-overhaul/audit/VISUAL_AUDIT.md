# VISUAL_AUDIT — GS-010 Fase 1 (Diagnóstico)

- **Autor:** game-art, no papel de GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-09
- **Base:** `docs/briefing/13_gs008_quality_first.md`, `15_gs010_visual_quality_overhaul.md`, `16_gs011_master_execution.md`; ADR-012.
- **Escopo:** só leitura. Nenhum asset, mapa ou código foi alterado nesta tarefa — só os ficheiros deste documento e `audit/img/char-digimon-map/`.
- **Legenda:** **[E]** evidência (arquivo/imagem citada, inspecionada nesta sessão, 2026-11-09) · **[H]** hipótese/leitura visual própria, não testada com jogador real.
- As notas Aprovado/Precisa melhorar/Refazer deste documento são **triagem de diagnóstico**, não a homologação formal do GS-010 §8 (que exige média ≥9 com evidência em jogo, na Fase 5).
- Entregas paralelas desta mesma Fase 1: `audit/TECH_AUDIT.md` (game-dev, renderer/engine) e `audit/UI_WORLD_AUDIT.md` (game-design, HUD/painéis/mapa-múndi) — este documento cobre só personagem, Digimon, mapa e VFX (D1 do `PROJECT_LOG.md`).

---

## 0. Resumo executivo

**Classificação geral: Precisa melhorar, de forma desigual.** O jogo tem duas realidades visuais ao mesmo tempo:

1. **Personagens e Digimon são rips oficiais de Digimon World DS** (`official-fan-use`, `approvalStatus: UNDER_REVIEW` em todos — nenhum foi formalmente aprovado por um diretor de arte até hoje), redimensionados para baixo (~0,4×) e com **só 3 quadros por direção, sem idle de verdade, sem ataque/dano reais na maioria das espécies, e sem run/turn/victory/defeat/interaction em nenhuma delas.** Isso está muito abaixo do padrão P0 que o próprio estúdio já documentou (`ANIMATION_STANDARD.md`) e muito abaixo do pedido do GS-010 §2–§3. Nota: **Refazer** na maior parte das animações; **Precisa melhorar** nos walks (que pelo menos leem bem).
2. **O mapa já tem um "look v8" pronto e bonito** (luzes pontuais, névoa, partículas, decalques, platô, lanternas, fogueira, NPCs na escala certa, paleta fria/roxa) que se aproxima de verdade da linguagem do Drakantos — mas **está atrás de uma flag (`?look=v8`) e não é o que o jogo carrega por padrão.** O que o fundador provavelmente está vendo (`v3`) é o mapa antigo, verde-claro e chapado. Este é o achado mais importante do diagnóstico: **a melhoria mais barata e mais visível já existe e só falta virar padrão.**
3. **VFX de ataque: praticamente inexistente** no content pack oficial que está no ar (`world-species.json`). VFX de evolução existe mas é genérico (flash branco + silhueta circular), sem tema por elemento.
4. **Não há nenhum Digimon com animação de voo/flutuação real** — mesmo os candidatos a "voador" (ex. Tentomon) andam com o mesmo ciclo de pernas dos bípedes e quadrúpedes. É exatamente a violação que o GS-010 §3 nomeia.

**Recomendação de piloto (resumo, detalhe na seção 6):** Clareira Central + riacho com a ponte (zona já com o melhor acabamento do look v8), elenco Tamer (TAMER-0001) + Guilmon (bípede, CREATURE-0003) + Dorumon (quadrúpede, CREATURE-0101) + Tentomon (candidato a voador, CREATURE-0106) — os 4 já spawnam/existem nesta exata região, zero arte nova de cenário necessária para começar.

---

## 1. Personagem (Tamer)

**Asset:** `GAME-ASSETS/11-characters/TAMER-0001` — rip oficial "Hero" de Digimon World DS (Spriters Resource), `approvalStatus: UNDER_REVIEW` **[E, character.json]**.

| Propriedade | Valor | Fonte |
|---|---|---|
| Frame nativo | 32×32 px | `character.json.dimensions` |
| Pivô | (16, 31) — pés | `character.json.pivot` |
| Direções | S, N, W, E, **todas desenhadas** (sem espelho — a folha já traz as 4) | `character.json.directions` |
| Frames por direção | 3 (`_00`, `_01`, `_02`) | `sprites/` (12 PNGs no total) |
| Velocidade | 140 px/s | `walkSpeedPxPerSec` |

**Silhueta e proporção [H]:** legível como pessoa pequena (cabelo laranja, blusa azul, calça clara) a 32×32, mas com muito pouco detalhe — nenhuma expressão facial, nenhum acessório, nenhuma diferenciação de roupa visível nessa resolução. Em jogo, numa captura anterior do game-dev, o Tamer mediu **~28 px de altura na tela** (`evidence/map-factory/README.md`, nota da captura `factory_v3_10`) — pequeno mesmo perto do padrão Drakantos (~48–64 px).

**Animações por estado (ver imagem `img/char-digimon-map/09_...png`, primeira linha):**

| Estado pedido (GS-010 §2.B) | Existe? | Nota |
|---|---|---|
| Idle (respiração, piscar) | **Não.** `idle` reusa literalmente o frame `walk_S_01` — 1 frame estático, zero variação. | Refazer |
| Walk | Sim, 3 frames por direção, ciclo `f0-f1-f0-f2` a 150ms (~6,7 fps), 4 direções reais. Lê como andar, mas é puramente mecânico: nenhum braço balança de forma distinta, nenhum contato de pé desenhado, nenhuma transferência de peso além da troca de perna. | Precisa melhorar |
| Run | **Não existe.** | Refazer (ausente) |
| Turn (transição entre direções) | **Não existe** — a troca de direção é instantânea (troca de sprite), sem pose intermediária. | Refazer (ausente) |
| Attack | **Não existe.** | Refazer (ausente) |
| Hurt | **Não existe.** | Refazer (ausente) |
| Victory | **Não existe.** | Refazer (ausente) |
| Defeat | **Não existe.** | Refazer (ausente) |
| Interaction | **Não existe.** | Refazer (ausente) |

**Veredito:** o Tamer funciona como um *placeholder andante*, não como o "personagem jogável refinado" pedido no piloto obrigatório (GS-010 §7.1). De 9 estados pedidos, só 1 (Walk) existe e mesmo esse precisa de melhoria. **Classificação geral: Refazer** (walk isolado seria "Precisa melhorar", mas o conjunto reprovaria qualquer critério de homologação do GS-010 §8 — "Animações dos personagens: meta 9").

---

## 2. Digimon

Fonte de dados: `GAME-ASSETS/01-creatures/*/creature.json`, cruzado com os spawns reais de `world-design/briefs/digimon-forest-01.json` e `prototype/world/src/data/world-species.json`. Todas as espécies inspecionadas são **rips oficiais de Digimon World DS** (mesma camada `official-fan-use`, mesmo `approvalStatus: UNDER_REVIEW`).

### 2.1 Achado sistêmico (antes de ir espécie por espécie)

Todo `creature.json` inspecionado (Guilmon, Agumon, Dorumon, Biyomon, Tentomon) usa **a mesma estrutura de animação, copiada campo a campo**: `idle` = 1 frame reaproveitado do `walk`, `walk` = 4 quadros no padrão `f0-f1-f0-f2` a 150ms, mesmas chaves de `combatStates`. É exatamente a violação central nomeada pelo GS-008 §4.3/GS-010 §3: **"Não utilizar um único template de animação para espécies com estruturas corporais diferentes."** Um bípede (Guilmon), um quadrúpede (Dorumon) e um inseto com asas (Tentomon) se movem com a **mesma cadência mecânica**, porque são, literalmente, a mesma receita de JSON aplicada a sprites diferentes.

Segundo achado sistêmico: **os sprites de "mapa" são uma versão degradada dos sprites de "batalha".** O próprio `qaNotes` de Guilmon e Agumon confirma: *"attack/hurt no mapa = poses de batalha reduzidas por moda de bloco (fator 0.413, de 75 para ~31 px). É derivado do rip, não um quadro do jogo."* Ou seja, o quadro de ataque que o jogador vê no mapa não foi desenhado — foi um downscale automático e cego de uma pose de batalha bem mais detalhada, que já existe no mesmo arquivo (`battle_*`) e é visivelmente superior (ver `img/.../09_escala_tamer_guilmon_mapa_vs_batalha_dorumon.png`, 3ª figura). Isso também contradiz a própria decisão registrada em `ART_STYLE_GUIDE.md` §9b ("fator de escala = 1×, nenhum sprite oficial é redimensionado") — o documento diz uma coisa, o asset entregue faz outra.

### 2.2 Guilmon (CREATURE-0003) — bípede, destaque pedido

| Propriedade | Valor |
|---|---|
| Frame mapa | 30×34 px, altura nativa 31 px |
| Frame batalha | 86×82 px (canvas), altura nativa **75 px** — quase 2,5× o sprite de mapa |
| Direções walk/idle | S, N, W desenhadas + E espelhado |
| Direções attack/hurt | **só W** (+E espelhado); nenhuma para N/S |

Estados: Walk (4 frames/dir, 3 direções reais) — lê bem, ver `img/.../10_guilmon_mapa_S_W_N.png`: a silhueta vermelha/creme com orelhas triangulares é reconhecível nas 3 poses. Idle = reuso do frame de walk (sem respiração). Attack = 1 frame único intercalado entre 2 frames de walk (não é antecipação→impacto→recuperação real, é "walk, pose de ataque, walk"). Hurt = 1 frame único. Sem Run, Turn, Victory, Defeat, Sleep, Follow dedicado (reusa Walk), Interaction.

Existe também um conjunto `battle_*` (idle 4 frames em loop, hurt 1 frame, attack 1 frame, só direção SW) em resolução nativa muito mais detalhada — presas, garras e expressão legíveis — mas **nunca é usado no mapa**, só num "espaço de batalha" que o jogo atual não renderiza separadamente (o combate é no mapa, ADR-009). É um ativo de qualidade superior sendo desperdiçado pelo pipeline atual.

**Classificação:** Walk = Precisa melhorar. Idle/Attack/Hurt = Refazer (1 frame cada, downscale cego, só 1 direção no attack/hurt). Run/Turn/Victory/Defeat/Sleep/Interaction = Refazer (ausentes). **Geral: Precisa melhorar/Refazer** — é a melhor espécie do roster (mais direções, tem base de batalha reaproveitável) e ainda assim não bate nenhum critério do GS-010 §3/§8.

### 2.3 Agumon (CREATURE-0006) e "linha" — bípede, destaque pedido

Estrutura **idêntica** à de Guilmon: 30×30 px no mapa, 71 px nativo de batalha, mesmas 3 direções desenhadas (S/N/W + E espelho), mesmo esquema attack/hurt (1 frame, só W), mesmo conjunto `battle_*` subutilizado. A "linha" (Koromon→Agumon→Greymon, `CREATURE-0005/0006/0007`) usa `"pack": "..."` em vez de `creature.json` próprio para os estágios adjacentes — ou seja, **a linha evolutiva de Agumon não está inteira em `GAME-ASSETS`**, parte dela vem de um pacote de stats separado (`prototype/game/packs/digimon-fan`) sem arte própria verificada nesta auditoria. Isso é um risco de inconsistência visual entre estágios de uma mesma linha, a confirmar.

**Classificação:** igual à de Guilmon (Precisa melhorar/Refazer). Diferenciação de personalidade entre Agumon e Guilmon (dois dinossauros bípedes de porte parecido) é praticamente nula hoje — mesmo timing, mesma técnica de pose — contrariando "cada espécie precisa ter uma identidade própria" (GS-010 §3).

### 2.4 Dorumon (CREATURE-0101) — quadrúpede, destaque pedido

| Propriedade | Valor |
|---|---|
| Frame mapa | 28×28 px, altura nativa 25 px |
| Direções walk/idle | **só S e W desenhadas** (E espelhado de W) — **falta a direção Norte inteira** |
| Battle set | **Não existe** (`creature.json` confirma: "sem poses de ataque/dano de mapa; sem pose de batalha") |
| combatStates | só `IDLE/WALK/FOLLOW/ENGAGE/RETURN` — **não tem `ATTACK`/`HURT`/`DEFEAT` no próprio schema** |

Ver `img/.../11_dorumon_quadrupede_S_W.png`: a leitura de "4 patas" é reconhecível mas muito comprimida em 28px — cauda e orelhas quase se perdem no contorno do corpo. É o caso mais claro do pedido do GS-010 §3 ("quadrúpedes: movimentação coordenada das patas, balanço do corpo e da cauda") não atendido: hoje Dorumon **não tem nenhuma animação própria de quadrúpede** — reusa a mesma fórmula de walk dos bípedes, só que com 1 direção a menos.

**Classificação: Refazer.** Falta uma direção cardeal inteira (Norte), falta 100% do conjunto de combate (nem está previsto no schema), e a única coisa que existe (walk S/W) não tem nenhuma característica de locomoção quadrúpede real — é o caso mais urgente dos 3 destaques pedidos.

### 2.5 Candidato a "voador": Tentomon (CREATURE-0106)

Não há, hoje, nenhuma espécie do roster com comportamento de voo real. O candidato mais adequado é **Tentomon** (inseto com asas visíveis no sprite, ver `img/.../`; 27×28 px, 24 px nativo, S/N/W desenhadas + E espelho, **é spawn confirmado desta exata região** — `zona_concentracao` do brief do piloto). Mesmo assim, Tentomon **anda** com o idêntico ciclo `f0-f1-f0-f2` de pernas dos bípedes/quadrúpedes — nenhum batimento de asa, nenhuma flutuação, nenhuma inclinação de pouso. `combatStates` tem a mesma lacuna de Dorumon (sem ATTACK/HURT/DEFEAT no schema). **Classificação: Refazer** — tem base de sprite aproveitável (asas desenhadas, silhueta de besouro reconhecível), mas comportamento de locomoção **zero diferenciado**, exatamente a falha citada no GS-010 §3 ("Um Digimon voador não deve simplesmente deslizar pelo chão").

### 2.6 Demais espécies do piloto (Gigimon, Koromon, Tsunomon, Tanemon, Palmon, Floramon) [H, inspeção indireta via `world-species.json` + padrão confirmado nas 5 espécies abertas]

Todas seguem, por amostragem do mesmo pipeline de importação (`qaNotes` idênticos em estrutura), o mesmo padrão: 3 direções walk, idle reusado, sem attack/hurt de mapa na maioria (só Guilmon/Agumon/linha "principal" ganharam attack/hurt 1-frame). **Classificação preliminar: Precisa melhorar (walk) / Refazer (resto)** — a confirmar espécie a espécie na Fase 3, não reaberto individualmente nesta auditoria por orçamento de tempo.

### 2.7 Tabela-resumo de classificação

| Digimon | Anatomia | Walk | Idle | Attack/Hurt | Direções faltando | Classificação geral |
|---|---|---|---|---|---|---|
| Guilmon (0003) | Bípede | Precisa melhorar | Refazer | Refazer (1 dir.) | — | Precisa melhorar/Refazer |
| Agumon (0006) | Bípede | Precisa melhorar | Refazer | Refazer (1 dir.) | — | Precisa melhorar/Refazer |
| Dorumon (0101) | Quadrúpede | Precisa melhorar | Refazer | **Ausente (nem no schema)** | **Norte inteiro** | **Refazer** |
| Tentomon (0106) | Inseto/voador | Precisa melhorar (sem voo) | Refazer | **Ausente (nem no schema)** | — | **Refazer** |

---

## 3. Mapas

Comparação completa já documentada em `docs/DRAKANTOS_VISUAL_STUDY.md` (game-studio, 2026-11-09) — esta seção não repete o estudo, **valida e atualiza** cada item contra o estado mais recente do mapa (`evidence/map-factory/`, capturas `_v5b`).

### 3.1 O que já está bom — e por que o fundador pode não estar vendo

O pacote `forest-v8-depth` + o "look v8" do renderer (`validation-digimon-forest-01_v5.md`, `_v5b`) já implementam quase todos os 9 itens do estudo Drakantos: paleta fria/roxa (`gradeTiles`), luzes pontuais com flicker (cristal/cogumelo/totem/lanternas/fogueira), névoa e partículas (vagalumes, poeira digital, folhas), sombra de contato em todo prop/entidade, platô/penhasco com rampa, clusters de clutter e borda de mata orgânica, transições com tufos na trilha e juncos na margem, zoom ×1,5. Ver `img/.../03_clareira_v5b_dia.png` e `04_..._noite.png` — comparado a `img/.../00_ref_drakantos_floresta.png`, a linguagem (verde-escuro + roxo + luz pontual quente) já está muito mais próxima do que o estudo original media.

**Mas:** esse look fica **atrás da flag `?look=v8`** (`README.md` do map-factory, confirmado: *"O look v8 continua atrás de `?look=v8`. Para virar o padrão, troque o `out` da montagem para `src/data/maps` e regenere."*). O mapa padrão que o jogo carrega sem parâmetro é o **v3** — verde-claro, chapado, sem luzes, sem névoa, sem platô (ver `img/.../01_mapa_v3_vs_v4_dia.png`, metade esquerda "v3 (padrão)"). **Este é o achado mais acionável de todo o diagnóstico: a melhoria mais visível e mais barata (custo zero de geração, é só trocar qual `.tmj` é o padrão) ainda não foi promovida.**

### 3.2 Camadas (BG/MID/FG/overlay)

| Camada | Existe no look v8? | Nota |
|---|---|---|
| Background | Parcial — não há montanhas/skybox distante; a "distância" vem da névoa e do escurecimento, não de uma camada de parallax própria. | Precisa melhorar |
| Midground (terreno, água, trilhas, rochas) | Sim — Wang-47, curvas contínuas de riacho/trilha, campo de pedras. | Aprovado |
| Foreground | Parcial — a copa das árvores sempre desenha por cima das entidades (oclusão real do jogador passando atrás de árvores), mas não há elementos dedicados de "galho em primeiro plano" na borda da câmera. | Precisa melhorar |
| Overlay (luz, sombra, partículas) | Sim — luzes aditivas com máscara de copa, sombra de contato, névoa, partículas. | Aprovado |

### 3.3 Vegetação, água, luz, sombra, vida ambiental

- **Vegetação:** boa variedade de árvores/clusters e borda orgânica da mata (B-spline + ruído desde a correção `_v5b`); ainda falta mais profundidade de camadas (Drakantos tem 3–4 níveis de planta visíveis simultaneamente — arbusto, samambaia, planta baixa, tufo — o pacote atual tem menos variedade por célula). **Precisa melhorar.**
- **Água:** forma de riacho em curva contínua (bom, resolve a crítica "geométrico demais" de rodadas anteriores), mas de perto a margem ainda "degrauzinha" porque é Wang-16 sem peças diagonais — o próprio README confirma isso como limitação conhecida. **Precisa melhorar.**
- **Luz:** ponto forte real do pacote — luzes aditivas com flicker, mascaradas pela copa com feather de 3px (corrigido na rodada `_v5b`), diferenciação dia/noite. **Aprovado.**
- **Sombra:** sombra de contato em todo prop/entidade + oclusão em 3 degraus na base do penhasco. **Aprovado.**
- **Vida ambiental:** vagalumes, poeira digital, folhas caindo — existem, mas são "função do tempo" sem estado persistente (recalculadas por bloco 8×8 a cada frame, não uma simulação real); não testado em jogo ao vivo nesta auditoria (só capturas estáticas). **Precisa melhorar, a confirmar com playtest real.**

### 3.4 Pendências conhecidas (do próprio README do pacote)

- Platô lê como "laje de pedra" mais que "barranco orgânico" (kit só tem 1 nível de face).
- Luzes pontuais não projetam sombra e atravessam copas quando a fonte está abaixo da árvore.
- NPCs (`npc_ranger`, `npc_merchant`) têm só 1 frame parado, sem walk, sem virar para o jogador — mesmo depois do ajuste de escala (`img/.../05_npc_vs_tamer_escala.png` confirma que a **escala** já está certa; a **animação** do NPC continua ausente).
- **Arena do chefe sem chefe:** `BOSS-KUWAGAMON` existe em dado (`bosses.json`) mas **não tem nenhum sprite** em `GAME-ASSETS/01-creatures/` (`FOREST_KIT_GAP.md` confirma). Hoje, entrar na arena só mostra um aviso de texto.
- Performance medida só em headless (`--disable-gpu`), nunca em dispositivo real — não dá para confirmar os 50 fps-alvo do `TECH_AUDIT.md` antigo.

**Classificação geral de Mapas: Precisa melhorar** — não porque falte trabalho de arte novo (o look v8 já resolve a maior parte do estudo Drakantos), mas porque **o trabalho feito não está no caminho padrão do jogo** e porque restam lacunas reais (água de perto, platô, NPC parado, chefe sem sprite, vida ambiental não testada ao vivo).

---

## 4. Efeitos (VFX)

### 4.1 VFX de golpes/ataque

Para as espécies oficiais que estão de fato no ar (`world-species.json`, pipeline `official-fan-use`), **não existe nenhum efeito visual de impacto dedicado** — o `events.hitFrame` do `creature.json` (ex. Guilmon/Agumon) é só um gatilho de sincronismo (`WORLD_COMBAT_VISUAL_SPEC.md`), não há um sprite/partícula de "golpe acertando" associado a ele nesta auditoria. O único precedente de VFX de ataque do estúdio (`PIXEL_ART_DIRECTION.md` §0.1 — flash de tint na cor de acento, recuo/avanço por `translate`) foi feito para o **content pack antigo "Digimon-fan" por código** (Agumon/Gabumon/Patamon paramétricos), que **não é o pack que está em uso hoje** (o pack em uso é o rip oficial DS). Ou seja: a técnica existe, documentada, mas não foi aplicada aos assets que o jogador realmente vê. **Classificação: Refazer / praticamente ausente** no pipeline atual.

Nenhuma habilidade nomeada (`hot_head`, `pyro_sphere`, `exhaust_flame`, `investida`) tem efeito visual próprio verificado nesta sessão — são só nomes/números de dano no JSON de skills.

### 4.2 VFX de evolução

Sequência completa capturada em `evidence/evolution/` (`evo_00` a `evo_09` + gif): carga → silhueta pulsando devagar → silhueta pulsando rápido → **flash branco cheio de tela** → revelação (fade-in da nova forma dentro de um círculo branco genérico, ver `img/.../07_vfx_evolucao_revelacao.png`) → faixa de nome → forma nova no mapa. Funciona e tem estágios reconhecíveis (bom em relação ao "não é só sprite trocado"), mas o efeito em si é **genérico**: um círculo branco translúcido, sem cor temática por elemento/afinidade (vírus, vacina, dado...), sem partícula própria por linha evolutiva. É exatamente o padrão que o GS-010 pede para evitar ("não transformar todo ataque [ou evento] numa simples explosão de partículas genérica"). **Classificação: Precisa melhorar** — a arquitetura de estágios está certa, falta identidade visual por elemento.

---

## 5. Direção de arte v2

Ver documento separado: **`quality-overhaul/ART_DIRECTION_V2.md`** (escala oficial, resolução/zoom, paleta por região, outline, luz, padrão de animação por anatomia, regras de aprovação e checklist do diretor).

---

## 6. Região piloto e elenco

### 6.1 Região: Clareira Central + riacho com a ponte (recorte ~30×20 tiles)

**Recorte sugerido:** `x: 16..46` (30 colunas) × `y: 4..24` (20 linhas) do mapa `digimon-forest-01`. Cobre: a Clareira Central inteira (zona `clareira_central`, 20–36×14–28, parcial), a Ponte do Riacho (`poi-ponte-riacho`, 27,9), o braço norte do riacho em curva, o Mirante da Clareira (platô 21–28×15–17) e as bordas de mata ao redor.

**Justificativa:**
1. **É a zona com o melhor acabamento já existente** (look v8 completo: luzes, platô, decalques, manchas de lama, NPC comerciante na escala certa) — menor trabalho de cenário novo para o piloto, mais tempo sobra para personagem/Digimon/animação, que são o maior déficit (seção 1–2).
2. **Já tem antes/depois pronto** (`img/.../01_mapa_v3_vs_v4_dia.png`) — resolve de graça o pedido "comparação visual antes/depois" do GS-010 §7.
3. **Concentra interação:** baú, fonte de cura, 2 NPCs, travessia da ponte, 3 rotas convergindo — mais chance de mostrar combate, movimento e UI numa única tela/vídeo curto do que uma zona vazia.
4. **Não exige mapa novo** — é literalmente promover o `.tmj` já existente (`v8`) para padrão, uma mudança de configuração, não uma produção de arte nova de cenário.

### 6.2 Elenco do piloto

| Papel | Escolha | Por quê | Tem base de sprite? |
|---|---|---|---|
| Personagem | **Tamer (TAMER-0001)** | É o único personagem jogável que existe; obrigatório. | Sim, mas precisa de reconstrução quase total (seção 1). |
| Digimon bípede | **Guilmon (CREATURE-0003)** | Já é o parceiro canônico usado nas evidências (`evidence/idledex/06_pokedex.png` mostra Guilmon como time principal); tem o conjunto `battle_*` de qualidade superior para reaproveitar como base. | Sim — base de mapa E base de batalha (nativa, melhor qualidade). |
| Digimon quadrúpede | **Dorumon (CREATURE-0101)** | Spawn real desta exata região (`campo_de_pedras`); é o caso mais crítico de anatomia ignorada (falta Norte inteiro, zero combate no schema) — o piloto que mais demonstra a "regra de não usar 1 template para anatomias diferentes". | Sim, mas incompleta (falta 1 direção e todo o combate). |
| Digimon "voador" | **Tentomon (CREATURE-0106)** | Spawn real desta exata região (`zona_concentracao`); tem asas desenhadas no sprite base, mas hoje anda como todo o resto — melhor candidato para provar a animação de voo/flutuação que falta no roster inteiro. | Sim (base de mapa), sem battle set, sem combate no schema. |

Os 4 já existem e já aparecem (ou spawnam) nesta exata região — **nenhuma arte de cenário nova é necessária para começar a Fase 3**; o orçamento de geração pode ir inteiro para personagem/Digimon/animação/VFX.

---

## 7. Plano de produção do lab

**Saldo PixelLab no momento desta auditoria [E, `get_balance`]:** 26 gerações restantes de 40 (14 já usadas), plano trial, $0 em créditos.

### 7.1 O que dá para fazer no pipeline local (custo zero de geração)

- **`pixelart_workbench`** (grátis, local): `lint`/`score` para auditar tecnicamente cada sprite antes de decidir refazer vs. melhorar; `repair` para limpeza determinística (franjas, pixels soltos) nos rips oficiais sem gastar geração; `motion`/`storyboard` para avaliar timing de uma animação nova depois de produzida; `shade`/`selout` para ajustes de sombreamento sem IA.
- **`vfx_workbench`** (grátis para assinante, local): construir o VFX de impacto/evolução por elemento (seção 4) montando partes prontas — não depende do saldo de 26 gerações.
- **`create_normal_map`** (lite, 0,1 geração): baratíssimo, útil se o renderer ganhar luz direcional sobre os sprites (combinaria com as luzes pontuais do look v8).
- **Reconfiguração do mapa** (custo zero, é edição de dado): promover o `.tmj` do look v8 para o caminho padrão — maior ganho visual do diagnóstico inteiro, sem gastar nenhuma geração.
- **SD local** (ver 7.3) para conceitos que não precisam ser pixel-perfect.

### 7.2 O que pede PixelLab (26 gerações — orçamento estimado para a Fase 3, não gasto nesta auditoria)

Regra de custo (`animate_character`, modo v3): `ceil(largura × altura × frames / 65536)` por direção. Nos tamanhos nativos deste roster (28–34 px), **1 animação em 1 direção custa ~1 geração** (ex. 32×32×8 quadros = 1; 34×34×8 ≈ 1). O custo sobe com mais direções e quadros maiores — por isso a recomendação é produzir **1 direção de referência (Sul) por animação primeiro**, confirmar qualidade, só então multiplicar para as demais direções.

| Prioridade | Item | Estimativa |
|---|---|---|
| 1 | Tamer: idle com respiração + walk melhorado + attack + hurt, só direção Sul | ~4 gerações |
| 2 | Guilmon: idle com respiração (usando o `battle_idle` nativo como referência, não o mapa degradado) + attack/hurt reais (antecipação-impacto-recuperação) | ~3–5 gerações |
| 3 | Dorumon: direção Norte que falta + attack/hurt de quadrúpede (ciclo próprio, não o template de bípede) | ~4–6 gerações |
| 4 | Tentomon: ciclo de voo/flutuação (bob + batida de asa) substituindo o walk atual | ~3–4 gerações |
| — | Reserva para iteração/refazer o que não aprovar na revisão do diretor | **~8–10 gerações** |

Total estimado: ~22–29 gerações só para o elenco do piloto em 1 direção por animação — **no limite ou acima do saldo atual**, então a Fase 3 deve ser sequencial (1 personagem por vez, revisão antes de seguir) e não produzir as 8 direções completas de uma vez. VFX de ataque/evolução por elemento fica de fora deste orçamento de `animate_character` porque é melhor resolvido via `vfx_workbench` (grátis).

### 7.3 O que pede Stable Diffusion local (só conceito/paleta, nunca sprite final)

`shared/tools/sd-local/` tem ComfyUI + checkpoint SD1.5 + LoRA de pixel art instalados e verificados [E, `MODELS.md`] — mas a própria licença/proveniência documentada recomenda tratar a saída como rascunho, nunca como asset final. Uso recomendado, dentro do GS-010 §6 ("exploração artística, conceitos, referências"):
- **Concept art do Kuwagamon** (chefe sem nenhum sprite hoje, `FOREST_KIT_GAP.md`) — gerar 2–3 opções de silhueta/pose antes de decidir se vale um orçamento de PixelLab nele.
- **Moodboards de paleta por região** (próximas regiões, pós-piloto) — não decide pixel final, só direção de cor.
- **Nunca** para o elenco do piloto em si — os 4 já têm base de sprite real (rip oficial), então o trabalho é animação/correção sobre arte existente, não geração do zero.

### 7.4 Observação de processo

Todos os `creature.json`/`character.json` inspecionados têm `approvalStatus: "UNDER_REVIEW"` — ou seja, **nenhum sprite hoje em uso no jogo tem aprovação formal de direção de arte**, apesar de já estarem ao vivo. Recomendo que a Fase 2 (Preparação) formalize isso: nenhum asset novo da Fase 3 deve ir ao mapa sem passar por este diretor primeiro (ADR-012 §3), e os já existentes devem ser marcados explicitamente como "em uso provisório" até serem substituídos ou aprovados.

---

## Limitações

- Esta auditoria é leitura de arquivo + inspeção visual própria **[H]** — não houve playtest ao vivo no navegador (sem Chromium neste host, mesma limitação já registrada em `TECH_AUDIT.md` antigo); vida ambiental, timing de animação e performance real não foram confirmados em movimento.
- Classificações Aprovado/Precisa melhorar/Refazer são **triagem desta sessão**, não a homologação formal do GS-010 §8.
- Não abri os `creature.json` das 10 espécies restantes do piloto (Gigimon, Koromon, Tsunomon, Tanemon, Palmon, Floramon) individualmente — a seção 2.6 é extrapolação por amostragem do mesmo padrão confirmado em 5 espécies, não inspeção direta de cada uma.
- A estimativa de custo PixelLab (seção 7.2) é um cálculo a partir da fórmula documentada da ferramenta, não uma cotação real feita nesta sessão (nenhuma geração foi disparada, por estarmos em Fase 1).
- Comparação com Drakantos continua limitada às 8 screenshots oficiais Steam + 6 frames do vídeo capturados pelo coordenador (`DRAKANTOS_VISUAL_STUDY.md`), não ao vídeo completo.
