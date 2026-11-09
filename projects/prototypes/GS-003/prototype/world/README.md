# GS-003 — mundo (vertical slice, Fase 5): combate no próprio mapa

- **Autor:** game-dev · **Data:** 2026-11-08 · **Base:** ADR-009, `docs/WORLD_COMBAT_VISUAL_SPEC.md`, `docs/TECH_AUDIT.md` (Canvas 2D próprio), `docs/SPRITE_SPECIFICATION.md`, `docs/ANIMATION_STANDARD.md`.
- Projeto Vite novo e separado. `../game/` é reaproveitado **sem alteração** (RNG, fórmulas e pacote `digimon-fan` importados via alias `@game`). `../game/arena-spike/` (congelado) não é tocado.

## forest-v4.1: Wang-47, árvores novas, luz e noite nas entidades (2026-11-08)

- **Pacote:** forest-v4.1 (commit ed5721e, campos aditivos `autotileV41`, `clearingFloorV41`, `lightingV41` e `treesV41` no `tileset.json`). Os PNGs novos entram pelo mesmo glob do forest-v4, com o prefixo `fp4_`.
- **Mapa** (`scripts/gen-forest-proof.mjs`, `npm run map:forest`):
  - O chão usa agora `path_w47_<máscara>` (trilha × grama), `denseedge_w47_<máscara>` (mata × clareira) e `clearing_floor_v41_0N` (chão da clareira, 4 variantes).
  - A máscara tem 8 vizinhos: N1, E2, S4, W8, NE16, SE32, SW64 e NW128. Cada diagonal só conta quando as duas bordas vizinhas a ela também contam (47 formas).
  - Fora do mapa, a trilha repete o tile da borda, então ela sai do mapa aberta; para a mata, fora do mapa conta como mata.
  - A trilha é uma spline Catmull-Rom pelos pontos de cada rota, com meandro lateral e largura variável. Cada amostra marca os tiles a até `r` ∈ [0,73; 0,89] dela, o que dá **1 a 2 tiles** de largura e uma faixa de 2 nas diagonais, em vez de escadinha.
  - Depois vêm duas passadas de limpeza: uma tira reentrâncias e calombos de 1 tile e a outra garante conexão em 4 direções.
  - **Árvores novas:** palmeira digital (20, só na borda das clareiras) e árvore de folhas de dados ciano (78). Cada uma tem tronco e copa separados, como as outras. A coroa da palmeira tem `topOffset` de +4 px, porque o tronco é curvo.
- **Recorte suave do Wang-47** (`src/render/pathsmooth.ts`):
  - Os PNGs `path_w47_*` e `denseedge_w47_*` cortam um círculo de cerca de 10 px em todo canto que tem só uma borda (`buildBlobTile47`, R = 10). Por isso, até uma trilha reta virava uma corrente de cruzes.
  - O renderer recorta a trilha e a borda da mata por um **campo contínuo no mundo**: uma B-spline quadrática da grade (vizinhança 3×3), com um ruído de valor somado ao limiar em coordenadas do mundo. Assim não há costura entre tiles.
  - A textura continua sendo a do pacote: a terra vem do próprio PNG Wang-47 do tile (ou do `_255`), e o lado de fora vem do `clearing_floor_v41`. A borda leva 1 px de pontilhado.
  - A configuração fica em `smoothAutotile` no `forest-proof.aliases.json`. Sem ela, o renderer desenha os PNGs como vieram.
- **Luz** (`src/render/lighting.ts`; a luz vem de cima à esquerda):
  - A sombra das árvores é projetada: uma elipse alongada para baixo e para a direita, com a mesma geometria de `castShadowGeometry` do game-art e a cor `canopyShadow` do preset. Ela substitui o decal centrado do v4.
  - O **rim-light** clareia a borda de cima/esquerda das copas com o `foliage[7]` do preset (dia `#dff08a`, noite `#a6c0e8`, α 90). As 2 árvores do v4.1 já vêm com o rim no PNG e o renderer não aplica de novo.
- **Noite nas entidades** (`src/render/nightgrade.ts`):
  - Os Digimon e os Tamers (sprite, composto ou placeholder) passam pela grade da noite: dessaturam 30%, são multiplicados pela rampa da lua (0,64 / 0,70 / 0,96) e ganham um piso frio.
  - Para manter a leitura, ganham também um rim-light `#a6c0e8` (α 0,55) na borda virada para a luz, que acompanha o espelhamento, e um contorno externo de 1 px na tinta da noite (α 0,5).
  - A grade segue a mistura dia/noite em 8 degraus, e o cache guarda só o degrau atual. Os nomes ficam no canvas de rótulos, por cima do overlay, sem mudança.
- **Capturas:**
  - `forest_v41_dia.png`, `forest_v41_noite.png`, `forest_v41_noite_zoom.png` (as entidades à noite com os nomes) e `trilha_zoom.png`: `ONLY=v41 npm run shots:live`.
  - Refeitas: `proof_live_*` e `moves_*`. As capturas padrão agora fixam `time=day` (`TIME=night` para a noite), e o modal Equipe & Box é fechado pelo ×. O Esc sintético não fechava o modal, que aparecia aberto no `moves_aprendeu`.
- **Testes:**
  - `tests/forest-proof.test.ts`: as máscaras Wang-47 conferidas contra o `tileset.json`; a trilha com no máximo 2 tiles de largura, sem diagonal solta, reentrância ou tile isolado; e as árvores novas.
  - `tests/pathsmooth.test.ts`: largura constante numa trilha reta, comparada com o PNG do pacote; continuidade na emenda; e o chão desenhado pelo recorte suave.
  - `tests/canopy.test.ts`: a sombra projetada e o rim-light.
  - `tests/nightgrade.test.ts`: a grade, o rim, o contorno e o espelho. Um Digimon real à noite fica mais escuro que de dia e mais claro que o chão noturno, e o renderer usa o quadro graduado.

## Save, progresso offline e Auto-evoluir (2026-11-08)

- **Save** (`src/save/save.ts`, `localStorage["gs003.world.save"]`, só na cena `forest-proof`):
  - Guarda o Tamer (visual, nome, nível e XP do Tamer), a equipe (a parceira ativa completa e os demais membros), os golpes (aprendidos, 4 slots e prioridade do AUTO), o nível e a XP, os bits, o Digidex (varredura), o AUTO e o Auto-evoluir.
  - O envelope é `{ v, savedAt, game, data }`, com **versão e migrações encadeadas**, como no `prototype/game`. A versão atual é a v2.
  - O v1 é o primeiro esquema (só os 4 slots). A migração v1 → v2 transforma os slots em lista de aprendidos e prioridade do AUTO e deixa o Auto-evoluir desligado. Nenhum save v1 chegou a existir em uso: a migração está testada com um envelope v1 sintético.
  - Um save corrompido ou de versão futura é ignorado, e uma cópia vai para `….corrupt`.
  - O jogo salva a cada 5 s, ao esconder a aba e no `pagehide`.
  - Com save, o criador de Tamer não abre: `?criador=1` reabre o criador e mantém o progresso, e `?novo=1` começa do zero.
- **Progresso offline** (`src/save/offline.ts`): usa "amostra + extrapolação", como `prototype/game/src/sim/offline.ts`, com o balance `offline` do pacote digimon-fan.
  - Teto de 4 h, mínimo de 60 s e rendimento de 50%.
  - Roda a **sim determinística real** numa cópia do mundo, com o AUTO ligado, por até 6.000 ticks (10 min de jogo), com uma semente derivada do horário do save. Mede XP, bits e vitórias da parceira e escala esses valores para o tempo creditado.
  - Aplica o resultado pelas regras online (`grantXp`: níveis, learnset e evolução). Mesmo estado + mesmo tempo + mesma semente geram o mesmo relatório.
  - Vale ao abrir o jogo com save e também **ao voltar para a aba** (o rAF para quando a aba fica oculta). No segundo caso, a parceira foge do combate em curso pela própria sim antes de creditar.
  - `?offline=MIN` simula MIN minutos fora, para testes.
- **"Relatório offline"** (`src/ui/offline-report.ts`, modal no estilo IdleDex):
  - Tempo fora, com o aviso de "Crédito máximo"; XP, vitórias, bits e nível (de → para); "Tamer subiu N níveis".
  - Golpes aprendidos em chips; evoluções com retratos e os golpes mantidos.
  - Fecha com **Coletar**, Esc ou clique fora.
- **Auto-evoluir** (botão ao lado de Fugir, no AUTO): `PlayerState.autoEvolve` e intent `set_auto_evolve`.
  - Ao atingir o nível, a parceira evolui sozinha **fora de combate**; em combate, espera o encontro acabar.
  - Usa a mesma função do intent `evolve`, que emite os eventos confirmados `evolve` e `move_learned` e herda até `inheritSlotsOnEvolve` (2) golpes, os de maior poder.
  - Offline, a evolução acontece no nível certo, no meio da XP creditada, e pode encadear formas.
- **Correção na sim:** uma parceira em `ENGAGE` sem alvo (alvo largado pelo leash sem encontro aberto) tentava `ENGAGE → FOLLOW`, uma transição ilegal. Isso derrubava a sim depois de alguns milhares de ticks (com a semente 42, no tick 33). Agora ela volta a `IDLE` antes de seguir. Há um teste de regressão: 5 sementes × 20.000 ticks.
- **Capturas:**
  - `offline_relatorio.png` e `offline_relatorio_zoom.png`: o save foi reescrito no localStorage como o de quem saiu há 5 h com o Guilmon no Nv.15 e o Auto-evoluir ligado. O boot real credita 4 h (o teto): +11.100 XP, 1.044 vitórias, +5.304 bits, Guilmon → Growlmon mantendo Pyro Sphere e Sharp Claws.
  - `offline_depois.png`: o Growlmon Nv.16 no mundo, com o Auto-evoluir LIG.
  - Para gerar: `ONLY=offline npm run shots:live`.
- **Testes:**
  - `tests/save.test.ts`: ida e volta do save num mundo novo, migração v1 → v2, saves ruins, crédito offline com teto e determinismo, Auto-evoluir offline com herança e Auto-evoluir online (ligado, desligado e em combate).
  - `tests/hud.test.ts`: o toggle, o progresso do Tamer e o modal do relatório.

## Criador de Tamer (2026-11-08)

- **Tela antes do mundo** (`src/ui/creator.ts`, pt-BR): "Crie seu Tamer".
  - Escolhas: nome (1–14 caracteres; vazio bloqueia "Entrar no mundo"), **Modelo** (2), **Tom de pele** (3), **Corte** (7), **Cor do cabelo** (8), **Roupa** (3) e **Cor da roupa** (7 rampas, ou seja, 3 × 7 combinações).
  - Tem também um botão **Aleatório** e um resumo em texto da combinação.
  - O preview é animado: o Tamer anda e gira Frente → Direita → Costas → Esquerda a cada 1,4 s, ampliado 6× em pixel-art.
  - `?criador=0` pula a tela e usa o visual padrão. As capturas do mundo usam esse parâmetro.
- **Composição em camadas e recolor por paleta** (`src/assets/tamer-parts.ts`, `GAME-ASSETS/11-characters/player/character_parts.json` v2, commit 8bd9143):
  - A ordem das camadas é corpo → cabelo → roupa (`drawOrder`). Cada camada é carregada **numa só cor-base**: pele `pale`, cabelo `castanho`, roupa casual `vermelho`, aventureiro `marrom` e tamer-clássico `amarelo`.
  - Assim são carregados 330 PNGs em vez de 1.672, e o resto sai por troca de rampa.
  - A arte usa 5 tons por rampa: os 3 do JSON e mais 2 derivados que medi nos PNGs prontos. O contorno é o tom escuro levado 65% em direção à tinta `#181425`, e o brilho é o tom claro levado 55% em direção ao branco.
  - Com isso, o recolor reproduz **pixel a pixel** todas as variantes prontas do pacote: 7 cortes × 8 cores, 2 modelos × 3 peles e todas as cores de roupa prontas.
  - O azul não serve de base de roupa porque colide com o detalhe tecnológico fixo `#0099db`.
  - As cores de roupa que não vêm prontas no pacote (roxo, aço etc.) saem do mesmo recolor.
- **No mundo:**
  - `composeTamer` monta uma folha (idle 3 e walk 4 quadros em S/E/N, com W espelhando E, e point 1) e devolve um `CreatureVisual` no mesmo contrato dos Tamers do pacote. O `WorldView` usa `tamerVisuals[playerId]` antes do TAMER-0001/0002.
  - O Tamer escolhido substitui o TAMER-0001, e o nome dele vai para a sim (só rótulo) e para o HUD.
  - Cada bot ganha uma combinação aleatória estável (`botLook`: semente do mundo + id do jogador).
- **Capturas:** `creator_tela.png`, `creator_escolhas.png`, `creator_preview_4dir.png` (as 4 direções do preview), `creator_no_mundo.png` e `creator_no_mundo_zoom.png`. Para gerar: `ONLY=creator npm run shots:live`.
- **Testes:**
  - `tests/tamer.test.ts`: o recolor é pixel-exato contra os PNGs prontos; a folha composta é idêntica à sobreposição dos 3 PNGs prontos em todos os 22 quadros; também cobre o contrato do renderer, os bots determinísticos e distintos e o `normalizeLook`.
  - `tests/creator.test.ts`: quantidades por grupo, textos em pt-BR, escolha, Aleatório, nome vazio, confirmação e giro do preview.

## Ciclo dia/noite (2026-11-08)

- **Relógio do jogo** (`src/render/daynight.ts`, só apresentação; a sim não sabe a hora):
  - Começa na hora local real e anda 1 minuto de jogo por segundo real, então um dia de jogo dura 24 min.
  - O HUD mostra a fase e a hora ("Dia 14:23", "Anoitecer 18:30", "Noite 22:13"), com ícone de sol ou lua e borda roxa à noite.
- **Preset escolhido pelo relógio:**
  - Dia das 06:00 às 17:59 e noite das 19:00 às 04:59.
  - O anoitecer (18:00–19:00) e o amanhecer (05:00–06:00) fazem uma transição suave (smoothstep) de cerca de 60 s reais.
- **Parâmetros de URL:**
  - `?time=night` (ou `noite`) força a noite; `?time=day` (ou `dia`) força o dia.
  - `?time=HH:MM` define a hora inicial.
  - `?timescale=N` define quantos minutos de jogo passam por segundo real; `0` congela o relógio.
- **Render** (`render/view.ts`):
  - A noite usa `forest-v4/night/` com os mesmos nomes de arquivo. Na transição, chão, troncos, copas, decor e sombras fazem crossfade entre o dia e a noite.
  - O chão tem chunks pré-renderizados por preset, e cada prop é desenhado nos dois presets com alpha.
  - Por cima vai o overlay ambiente do game-art: dia `#fff3c2` com α 26/255 e vinheta 28; noite `#2a1f5c` com α 70/255 e vinheta 70; os valores são interpolados.
  - O VFX dos golpes fica **acima** do overlay, então os golpes brilham à noite.
- **Capturas:** `docs/screens/daynight_dia.png`, `daynight_anoitecer.png` (mistura 0,5) e `daynight_noite.png`. Para gerar: `ONLY=daynight npm run shots:live`.
- **Testes:**
  - `tests/daynight.test.ts`: faixas, transição monotônica sem salto, `?time=`, `timescale` e interpolação do overlay.
  - `tests/canopy.test.ts`: com noite 1, só as imagens `night/` aparecem; com 0,5, os dois presets.
  - `tests/hud.test.ts`: relógio com fase e ícone.

## forest-v4 no jogo (2026-11-08)

O mapa `forest-proof` agora usa o pacote `GAME-ASSETS/03-environments/forest-v4/` (commit dac3d4d), seguindo o `tileset.json` e o README dele.

- **Chaves do mapa:** `fp4_<nome>` é o PNG `<nome>` do pacote (`src/data/maps/forest-proof.aliases.json` define pacote, prefixo, pasta noturna e regras das árvores). `src/assets/scene-tiles.ts` monta os tiles por preset: o dia usa `tiles/` e `props/`, e a noite usa `night/` com os mesmos nomes. As pastas `night/` ficam fora do conjunto global para não colidirem com os nomes do dia.
- **Chão com autotile de 16 peças** (`scripts/gen-forest-proof.mjs`): a bitmask é N·1 + E·2 + S·4 + W·8 e fora do mapa conta como mata.
  - Trilha: `path_blob_N`.
  - Mata contra a clareira: `denseedge_blob_N`. O miolo é sólido e a borda colada na clareira não é, como antes.
  - Clareira: `grass_00..05`, com as variantes lisas mais frequentes.
- **Decor:** grama alta, flores, cogumelos, pedras, troncos caídos e folhas caídas do v4.
- **Árvores em 2 sprites** (`render/view.ts`, `treeGeoms`/`drawCanopies`):
  - O prop `fp4_tree_X` vira `tree_X_base` (tronco, colide, ordenado por Y com as entidades) e `tree_X_top` (copa, numa camada desenhada **depois** de todas as entidades e antes do VFX).
  - A copa é ancorada como na prova do game-art: o fundo dela fica `round(0,42 × top.h)` px abaixo do topo do tronco.
  - Quando a copa cobre o Tamer local ou a parceira, ela vai para alpha 0,45, com transição de cerca de 120 ms.
  - São 9 tipos de árvore, com a ancestral rara e só no miolo.
- **Sombras como decal no chão:** `canopy_shadow_small` (ou `_large`, para copa com mais de 80 px) é desenhada dentro dos chunks pré-renderizados do chão, deslocada 20% para a direita (luz de cima à esquerda). Ela pode atravessar a borda do chunk.
- **Capturas:**
  - `docs/screens/forest_v4_antes.png` (forest-v3, HEAD 2d14bb0) e `forest_v4_depois.png`: mesma semente e mesma janela.
  - `forest_v4_copa.png` e `forest_v4_copa_zoom.png`: o Tamer atrás de uma copa translúcida.
  - Para gerar: `ONLY=forest npm run shots:live`.
- **Testes:**
  - `tests/forest-proof.test.ts`: todas as chaves resolvem no pacote, de dia e de noite, sem placeholder. Confere também a bitmask do autotile tile a tile, a solidez de miolo e borda e o filtro dos presets.
  - `tests/canopy.test.ts`: geometria de tronco, copa e sombra; a copa fica translúcida com transição só sobre o jogador; e a ordem do quadro é chão → troncos e entidades → copas.

## Sistema de golpes (4 slots) + VFX por arquétipo (2026-11-08)

Pedido do fundador: "Todos os Digimon só têm 1 ataque? Tem que ter 4, e ir aprendendo mais, e a pessoa mudando. Cada ataque com um efeito visual bonito." Os dados e as regras são do game-design (`GS-003/docs/MOVE_SYSTEM.md` e `src/data/moves/{moves,learnsets,vfx_archetypes}.json`: 70 golpes, learnsets das 12 espécies, 15 arquétipos). O que o schema deles ainda não define e a sim precisa ficou em `src/data/moves-sim.json`, um complemento [H] do game-dev: efeito numérico de buff e debuff, alcance e raio por forma, elemento de cada espécie, tabela elemental e regen de MP.

- **Sim** (`src/sim/moves.ts` + `world.ts`, autoritativa e determinística):
  - Cada Digimon tem `learned` (golpes conhecidos), `moves` (4 slots, `null` = vazio), `moveCd`, `mp`/`maxMp` (20 + 2 × nível), `statuses` (buffs e debuffs com prazo) e `autoRules`.
  - **Learnset por nível e estágio:** ao subir de nível, sai o evento confirmado `move_learned`. O golpe novo só entra sozinho num slot **vazio** (§2.2). Se os slots estiverem cheios, ele fica só na lista de conhecidos.
  - Uma forma abaixo da janela do learnset dela (ex.: Guilmon Nv.5, janela 8–15) conhece os golpes de entrada.
  - **Evolução:** intent `evolve`, recusado abaixo do nível. Ela troca espécie, stats e elemento, mantém até `inheritSlotsOnEvolve` (2) golpes da forma anterior (o jogador escolhe com `keep`; o padrão são os de maior poder) e libera os golpes de entrada. Emite `evolve` e depois `move_learned`.
  - **Troca:** `set_moves` aceita só golpes aprendidos, sem repetir e **apenas fora de combate** (§2.4). `use_move` (clique ou teclas 1–4) usa o golpe do slot no próximo ataque possível.
  - **Tipos:** físico e especial causam dano pela fórmula atual; buff e debuff aplicam `status` (±atributo por N ticks, emitido como evento); cura emite `damage` com `kind: "heal"`.
  - **Alvos:** `single`, `projectile` (alcance maior), `area` (o alvo e os hostis num raio em volta dele) e `line` (todos na reta a partir do atacante). O `attack_start` leva `targetIds` e `at`. Golpes de área e linha põem mais de um selvagem no encontro, que só acaba quando um dos lados fica vazio.
  - **Multiplicadores:** atributo Vacina/Dados/Vírus (affinityChart, sem mudança) × elemento (×1,15/×0,85, §2.9) × crítico × variância.
  - **AUTO** (gambit simples, §2.5): percorre a lista de prioridade e usa o primeiro golpe fora de recarga, com MP e cuja condição vale. As condições são `always`, `target_hp_below_pct`, `self_hp_below_pct` e `buff_not_active`, e cada golpe pode ser desligado. Se nenhum servir, usa `investida`. O padrão é a ordem dos slots.
- **VFX** (`src/render/vfx/`):
  - Os 15 arquétipos do game-design são desenhados em código (originais) e mapeados em `IMPL_OF`: fireball, breath_flame, ice_shard, beam, claw_slash, energy_blade, holy_burst, bubble_spit, wind_blade, tackle_impact, tornado_field, guard_aura, fear_howl, freeze_bind e multi_hit_flurry. Há ainda três extras: relâmpago, maldição e cura.
  - Cada um tem as fases carga → lançamento → viagem → impacto → resíduo, com tempos de `keyframes`.
  - Os efeitos usam partículas em forma fechada (mesmo golpe e mesmo instante dão o mesmo quadro), glow aditivo (`lighter`) em discos com alpha em degraus, rastro, clarão **local** no alvo (cor e alpha do arquétipo) e tremida só onde o arquétipo define (≤ 2 px, só no golpe do jogador local).
  - Tudo é desenhado em px inteiros na resolução lógica (escala de tela inteira).
  - A paleta de 3–4 cores vira uma rampa de 7 tons. Arquétipos genéricos (garra, impacto, aura, feixe) tingem pelo elemento do golpe, a cura usa a rampa verde e o poder ≥ 180 aumenta a escala.
  - O Presenter cria um `Cast` no `attack_start` confirmado, e o `damage` aparece no impacto do arquétipo. O ícone de cada golpe é um quadro do próprio efeito (`icon.ts`).
  - **Folhas do game-art:** um `GAME-ASSETS/04-effects/**/<nome>.vfx.json` (`archetype`, `phase`, `image`, `frameW/H`, `frames`, `frameMs`, `pivot`, `blend`) com o PNG ao lado é desenhado por cima da fase correspondente. Hoje a pasta está vazia.
- **UI (pt-BR):**
  - HUD: barra dos 4 golpes do Digimon ativo com ícone, **recarga radial** (`conic-gradient`, segundos restantes), custo em MP, tecla 1–4 e barra de MP.
  - Aviso grande "Guilmon aprendeu Sharp Claws!", com o slot ou "Abra Equipe & Box → Golpes", e o mesmo texto no log.
  - Modal Equipe & Box com a aba **Golpes**: 4 slots, "Esvaziar", aprendidos, próximos golpes bloqueados com o nível, **Trocar** (escolhe o golpe e depois o slot), aviso de combate e o **editor de prioridade do AUTO** (▲▼, condição com %, "usar" e "Restaurar padrão").
  - **Evoluir** fica habilitado no nível de evolução. Os Digimon da equipe e do Box mostram o kit pelo learnset, só para leitura.
- **Capturas:**
  - `npm run shots:vfx` (`scripts/capture-vfx.ts`, renderer real, sem navegador) gera `docs/screens/vfx_<golpe>.png`: 16 tiras de 6 quadros, uma por arquétipo mais a cura. Gera também `vfx_overview.png`.
  - `ONLY=golpes npm run shots:live` gera `moves_hud_combate.png`, `moves_aprendeu.png`, `moves_modal.png` e `moves_modal_trocar.png`.
- **Testes:** `tests/moves.test.ts` (dados, loadout, learnset por evento, troca, recarga e MP, prioridade do AUTO, evolução e herança, área e linha, elemento, save JSON, renascimento, determinismo com intents de golpe), `tests/vfx.test.ts` (cobertura dos arquétipos, fases em ordem, pixels idênticos por golpe e instante, folha de efeito, dano no impacto, tremida só local) e `tests/hud.test.ts` (barra, aviso, aba Golpes, Trocar, editor do AUTO, Evoluir).

## Prova visual ao vivo (2026-11-08, GS-004 §4 / ADR-010)

Versão jogável da prova visual pedida pelo fundador, na estrutura da referência canônica do IdleDex (`GS-003/evidence/idledex-canonical/`). **A arquitetura não mudou:** sim, presenter e contrato de eventos são os mesmos da v2. Mexi só em apresentação, HUD e dados de cena.

- **Cena `forest-proof` (padrão; `?map=meadow` volta ao mapa da v2).** O mapa vem de `scripts/gen-forest-proof.mjs` (`npm run map:forest`): mata densa em grade escalonada de copas sobrepostas, 5 clareiras de borda irregular, trilha de 1 tile, manchas de grama alta em grade, flores, cogumelos, troncos e pedras. As chaves visuais são lógicas (`fp_*`), e `src/data/maps/forest-proof.aliases.json` define o PNG de cada uma: primeiro o pacote **`03-environments/forest-v3/`** (já em uso: árvores redondas, coníferas e arbustivas, `grass_rich`, `forest_floor`, grama alta, flores, cogumelo, tronco, pedra, `path_rich`), depois os biomas `*-dwds` e os originais, e por fim um placeholder em código. Para ligar um PNG novo do forest-v3, basta pôr o nome dele em `v3`. O console mostra o resumo (`forest-v3: N/23 · fallback · placeholder`).
- **Jogadores:** `src/data/scenes/forest-proof.scene.json` traz o jogador local e mais 3 Tamers bot (Lumi + Patamon, RafaDGT + Gabumon, Bia_Tamer + Agumon), todos com AUTO. Eles usam a IA de bot e o contrato `remote_player` que já existiam. Quem usa o mesmo sprite (TAMER-0002) ganha uma variação de matiz na roupa, que é só apresentação.
- **Nomes e níveis** (`render/labels.ts`): uma camada `#labels` na resolução da tela, com texto e contorno escuro. Mostra o Tamer com `Nv.` (nível vindo da cena), o Digimon com o nível da sim e os selvagens com cor própria. A disposição evita sobreposição: o rótulo prioritário fica no lugar e os que colidem sobem e empilham, com um traço-guia quando sobem muito.
- **HUD em DOM** (`ui/hud.ts`, `ui/icons.ts` com ícones pixel-art originais, `ui/minimap.ts`, `render/portrait.ts`):
  - barra inferior com minimapa (região e coordenadas), Inventário, Bolsa e grade de 12 atalhos com ícones;
  - Digimon ativo com retrato, nome, Nv, PV e XP, e equipe de 5 slots com mini-retrato, Nv e PV;
  - XP do Tamer com nível; AUTO LIG./DESL. no topo central, com Fugir;
  - à direita, bits (da sim) e painéis de evento placeholder; log de batalha à direita;
  - chat recolhido à esquerda (mensagens simuladas); aviso "em breve" nos atalhos sem função.
- **Modal "Equipe & Box"**: abre pelo atalho, pela tecla **E** ou ao clicar num slot da equipe, e fecha com Esc, × ou clique fora, com transição fade + escala de 180 ms. Tem a grade da equipe, o Box com busca, a ficha (PV/Ataque/Defesa/Velocidade por `statsAtLevel`, estágio, afinidade, golpes) e as ações **Evoluir, Golpes, Item e Soltar desabilitadas**.
- **Câmera e enquadramento:** a escala é escolhida para mostrar cerca de 25 × 14 tiles, como na referência (escala 2 em 1600×900; `?zoom=N` força outro valor). O Tamer fica centrado na área acima da barra inferior.
- **Capturas ao vivo** (`npm run shots:live`, `scripts/capture-live.mjs`): sobe o Vite, abre o jogo no Chromium headless pelo DevTools Protocol e fotografa o DOM real em `docs/screens/proof_live_geral.png`, `proof_live_combate.png` (+ `_zoom`), `proof_live_jogadores.png`, `proof_live_modal_transicao.png` e `proof_live_modal.png`. Neste host, o Chromium do cache do Playwright precisa de `CHROME_LIBS` com libnss3/libnspr4/libasound extraídas dos .deb do Ubuntu (`apt-get download` + `dpkg-deb -x`, sem root).
- **Testes novos:** `tests/forest-proof.test.ts` (composição do mapa, aliases sem placeholder, prioridade do pacote, formato de tileset em lista, 3 bots lutando com AUTO, determinismo), `tests/labels.test.ts` (sem sobreposição, prioridade, escala) e `tests/hud.test.ts` reescrito (barra inferior, 5 slots, modal e ações desabilitadas, textos em pt-BR).

## v2 (2026-11-08): sprites de mapa, movimento fluido e combate animado

- **Sprites de mapa do DS** (`tools/dwds_import/import_dwds_sheets.py`): walk e idle nas 4 direções, attack e hurt das poses do DS reduzidas para a escala do mapa. O tamanho nativo do DS já é relativo entre espécies (Koromon 17 px, Agumon 27, Greymon 38, Angemon 40). O Tamer oficial vem de `GAME-ASSETS/11-characters/TAMER-0001` (local) e `TAMER-0002` (outro jogador), feito pelo game-art. Os tiles DS vêm de `03-environments/*-dwds/` e têm prioridade sobre os originais.
- **Movimento** (`render/motion.ts`): mola (SmoothDamp, 75 ms) sobre a posição interpolada da sim, que dá aceleração e desaceleração sem saltos. A direção (4 eixos) sai da velocidade visual, com histerese. O quadro do walk depende da **distância andada** (a cadência acompanha a velocidade), e há bob de 1 px parado. A câmera usa lerp exponencial (τ 110 ms) e desenha em pixel inteiro. A escala de tela continua inteira.
- **Parceira** (sim): segue a trilha de pontos do Tamer (`trailPoint`, follow-the-leader) e abre espaço se ele vem para cima dela (`partnerMinSep`).
- **Combate** (`render/anim.ts`, `render/fx.ts`, `presenter.ts`): antecipação (recuo de 3 px) → avanço curto → pose ATTACK do DS no impacto → **hit-stop de 70 ms** (atacante e alvo congelam) → knockback com ease-out (6 px, 9 no crítico) → volta. Flash branco, faíscas e riscos (básico), anel de choque (especial ou crítico), partículas deterministas, número de dano em arco com fade e tremida de câmera de 2 px no crítico local. **Golpe especial** (qualquer skill ≠ `investida`): carga, projétil do elemento da espécie (`src/data/world-vfx.json`: fire, frost, wind, light, bubble; efeitos originais desenhados em código) e impacto 180 ms depois.
- **A sim continua autoritativa:** o dano sai no tick do `attack_start`, e a apresentação só escolhe o momento de mostrar. `tests/v2.test.ts` roda o catálogo real v2 (com especiais) contra a sim sem apresentação e confere que os eventos são idênticos.
- **Parâmetros de URL novos:** `?size=table` (usa `GS-003/research/DIGIMON_SIZE_TABLE.json` quando existir: escala inteira = altura-alvo/altura nativa), `?smooth=0` (sem suavização, para comparar) e `?tiles=original` (ignora os biomas DS).
- **Capturas:** `docs/screens/06-attack-sequence-6f.png` (antecipação, avanço, impacto/hit-stop, knockback, número em arco, volta) e os 6 quadros soltos `06-attack-seq-*.png`, mais `07-special-projectile.png`.

## Como rodar

```bash
cd projects/prototypes/GS-003/prototype/world
npm install --offline     # o registry está bloqueado neste host; tudo vem do cache npm
npm run dev               # http://127.0.0.1:5174  (?seed=7&auto=1&creatureScale=1)
                          #   ?time=night|day|HH:MM · ?timescale=N · ?criador=0|1 · ?novo=1 · ?offline=MIN
npm test                  # vitest: FSM, sim, presenter, assets, HUD
npm run build             # tsc --noEmit + vite build → dist/
npm run shots             # capturas em docs/screens/ (@napi-rs/canvas, sem navegador)
npm run shots:vfx         # tiras de VFX por golpe → docs/screens/vfx_*.png (renderer real, sem navegador)
npm run shots:live        # prova ao vivo: Chromium headless + HUD em DOM → docs/screens/proof_live_*.png e moves_*.png
                          #   ONLY=forest | daynight | creator | offline → forest_v4_*, daynight_*, creator_*, offline_*
                          #   CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu npm run shots:live
npm run map               # regenera src/data/maps/test-meadow.tmj.json
npm run map:forest        # regenera src/data/maps/forest-proof.tmj.json
```

Controles: clique ou toque no chão para andar · WASD · clique num Digimon selvagem para a parceira lutar com ele · botão AUTO · botão Fugir (ou tecla F) · **1–4** ou clique na barra usa o golpe do slot · **E** abre ou fecha "Equipe & Box" (aba Golpes: trocar golpes e prioridade do AUTO) · Esc fecha.

## Arquitetura

```
src/sim/      AUTORIDADE. Tick fixo de 100 ms, RNG mulberry32 (../game), estado em JSON puro.
  world.ts    stepWorld(sim, intents) → WorldEvent[] confirmados (spawn, state, engage, encounter_start,
              attack_start, damage, defeat, reward, level_up, capture, encounter_end, despawn, intent_rejected)
  fsm.ts      tabela de transições IDLE/WALK/FOLLOW/ENGAGE/ATTACK/HURT/DEFEAT/RETURN; setState recusa transição ilegal
  map.ts      subconjunto do Tiled JSON (.tmj): camadas de tiles, colisão, props, spawns e inícios
  species.ts  espécies = pacote digimon-fan + src/data/world-species.json (linha Guilmon com stats [H])
  params.ts   aggroRadius, attackRange, leash, followDist, cooldowns… (spec §9)
src/render/   APRESENTAÇÃO. Lê snapshots e eventos e nunca escreve na sim.
  presenter.ts estado visual por entidade, fila de dano exibido em max(chegada, início + hitAtMs)
  anim.ts     slots de animação por estado + fallback procedural (lunge, knockback, fade, bob)
  view.ts     Canvas 2D: chunks de chão 16×16 tiles, culling, ordenação por Y, sombras, barras, números, efeito de golpe
src/assets/   loaders da biblioteca GAME-ASSETS (creature.json + atlas; tiles e props por nome de arquivo)
src/ui/        HUD em DOM (padrão IdleDex): barra inferior, minimapa, atalhos, equipe, AUTO, log, chat, modal Equipe & Box
src/render/labels.ts  nomes e níveis sem sobreposição (camada #labels na resolução da tela)
```

- **A animação não decide o dano:** o golpe é resolvido no tick em que ATTACK começa (`attack_start` e `damage` saem juntos). A view só escolhe *quando* mostrar o número: com o `hitFrame` do manifest, ou com 160 ms no ataque procedural. Os testes rodam a mesma semente com o manifest só-idle, com um manifest com `attack` real e sem apresentação nenhuma, e conferem eventos idênticos e o mesmo conjunto de danos exibidos (só o horário muda).
- **Sem tela de batalha:** não existe cena, transição nem câmera de combate. A câmera segue o Tamer. Um teste confirma que, durante o encontro, entidades de fora continuam se movendo.
- **Outro jogador:** `bot1` (Tamer azul + Patamon) é um `remote_player` dentro da mesma sim, com IA de passeio e AUTO. Usa o mesmo contrato de eventos que um jogador de rede usaria.

## Assets

- **Criaturas:** `GAME-ASSETS/01-creatures/CREATURE-0002..0013` (creature.json + `spritesheets/*.atlas.json` + PNG). O pivô e a sombra vêm do manifest. O id da criatura é o id da espécie na sim.
- **Escala:** `creatureScale` (inteiro, padrão 1 = tamanho nativo do DS; `?creatureScale=2` na URL). O SPRITE_SPECIFICATION não fixa um fator para os rips oficiais. Reduzir o tamanho por fator inteiro não existe sem perder pixels, então a decisão final sobre o porte relativo ao tile fica com o game-art.
- **Bioma:** `GAME-ASSETS/03-environments/**`. A chave de um tile ou prop no mapa é o nome do PNG (`grass_00`, `path_edge_n`, `shore_corner_se`, `tree_big_a`…). Um `tileset.json` opcional permite recortar folhas. Chave sem PNG cai num placeholder gerado em código, então o mapa nunca quebra. O teste `assets.test.ts` lista as chaves do mapa sem PNG real (hoje: nenhuma).
- **Autotile:** o gerador do mapa usa a convenção conferida nos PNGs: o sufixo indica o lado em que estão o caminho ou a água (`path_edge_n` = caminho ao norte).
- A água anima com `water_00`/`water_01` a 600 ms por quadro [H].

## Slots prontos para animação real

`resolveAnim()` procura, por estado: `combatStates[STATE]` → `attack`/`hurt`/`walk`/`follow`/`defeat` → `idle` + procedural. Quando o game-art adicionar `attack` com `events: [{frame, name: "hitFrame"}]` ao `creature.json`, o número passa a sair no frame de impacto, sem mudar código. O mesmo vale para `hurt`, `walk` e `defeat`. O Tamer ainda é um placeholder desenhado em código (`render/tamer.ts`).

## Limitações

Ver o relatório de entrega. Resumo: sem medição de FPS em navegador real (não há Chromium neste host); Tamer placeholder; efeito de golpe procedural (o slot `04-effects/combat/` está vazio); captura = placeholder por varredura (4 vitórias = registrado); pathfinding é reta com deslize na colisão (A* fora do escopo, spec §10); números de balanceamento [H].
