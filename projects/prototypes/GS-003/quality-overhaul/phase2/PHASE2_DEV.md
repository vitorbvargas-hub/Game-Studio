# PHASE2_DEV — GS-003 Quality Overhaul, Fase 2 (Preparação), game-dev

- **Autor:** game-dev · **Data:** 2026-11-09/10 · **Base:** `PHASE1_REPORT.md`, `audit/TECH_AUDIT.md` (§6 L1–L5, §7)
- **Branch:** `quality-overhaul` (worktree `~/projects/GameStudio/workspaces/game-dev/qo`), a partir da tag `pre-quality-overhaul` (= `42109e3`, HEAD do `master` no início).
- **Legenda:** **[E]** evidência (arquivo, comando ou medição, 2026-11-09/10) · **[H]** hipótese.
- Caminhos de código relativos a `GS-003/prototype/world/`. **Nada muda sem flag:** o jogo padrão (`master`, 5174) e o código da branch sem as flags se comportam como antes.

## 0. Resumo

| Item | Estado | Flag |
|---|---|---|
| P1 ambiente seguro | tag, branch em worktree, backup `.tgz` com SHA-256; 5174 intocada, tudo da fase na 5190 | — |
| P2 escala e câmera | escala inteira em **pixels físicos** (DPR), alvo ~9% da altura (8,3% a 1080p), escala única Digimon/Tamer, quadros reduzidos marcados e fora do mapa | `?dpr=1` (+ `?charh=N`, `?zoom=N`) |
| P3.1 controlador de animação v2 | 11 estados, golpe em 4 fases, one-shots que voltam ao estado anterior, arte lida do `creature.json` com fallback por anatomia; 21 testes | `?anim=v2` |
| P3.2 primeiro plano e vida | `objects_above` (parser + render translúcido ao cobrir), água por scroll de UV, vento em copas e grama, luzes 66 → 13 | `?look=v9` |
| Bug da Praia | tiles com "textura ausente" corrigidos (`e0fff98`) | sempre |

[E] `npm test`: **36 arquivos, 331 testes** (eram 299). `npm run build` ok. `map:validate`: 8/8 gates em todos os mapas, inclusive o v9.

## 1. P1 — ambiente seguro

- [E] Tag `pre-quality-overhaul` → `42109e3` (HEAD do `master`; o TECH_AUDIT já estava commitado, nada meu pendente). Os arquivos pendentes de outros agentes no `master` (GAME-ASSETS novos, ADRs, `digimon_palette.js`) **não foram commitados nem mexidos**.
- [E] Branch `quality-overhaul` em worktree separado: `~/projects/GameStudio/workspaces/game-dev/qo` (`git worktree list`). O diretório compartilhado continua no `master`. `node_modules` próprio no worktree.
- [E] Backup: `~/projects/GameStudio/assets/_backups/gs003-assets-pre-quality-overhaul-2026-11-09.tgz` (2,5 MB, 5557 entradas: `01-creatures`, `11-characters`, `art/map-factory`) + `.sha256` (`sha256sum -c` ok a partir da raiz do estúdio). O `_backups/` tem `.gitignore` próprio.
- [E] Dev server do fundador: `127.0.0.1:5174` segue servindo `projects/prototypes/GS-003/prototype/world` do `master` (cwd do processo conferido). Tudo desta fase (capturas, perf, servidor de teste) usou a **5190**.

## 2. P2 — escala e câmera (`?dpr=1`)

**Problema [E]** (TECH_AUDIT L5): a escala era inteira em pixels **CSS**. Com o Windows em 125%, 1 pixel lógico = 3,75 px físicos: colunas de 3 e 4 px misturadas. WarGreymon usava `mapScale 2` (×2 isolado) e attack/hurt eram poses de batalha reduzidas ao lado dos quadros originais, sem marca.

**O que mudou** (`src/render/scale.ts`, `main.ts` `resize`, `view.ts` `scaleOf`, `anim.ts` `realAnim`):
- **Escala inteira em pixels físicos:** `dprLayout()` calcula `scale` em px físicos e o tamanho CSS do canvas = físico / DPR (fracionário em CSS, exato no monitor). Clique e câmera usam `cssPerLogical`.
- **Zoom alvo:** personagem de referência (30 px lógicos, Tamer/Guilmon) em `charh`% da altura física (padrão 9) → arredonda para o inteiro mais próximo. `?zoom=N` força. A 1080p: escala 3 = **8,3%**; `?charh=11` dá escala 4 = 11,1%.
- **Escala unificada:** com `?dpr=1` o `mapScale` do manifest é ignorado (nada de ×2 isolado: WarGreymon fica na mesma densidade de pixel do resto).
- **Quadros reduzidos marcados:** campo `resampled` em 15 `creature.json` (0002–0014, 0016): attack/hurt de 12 espécies (fator 0,30–0,45, da pose de batalha), Gigimon (S/W/E reduzidos por vizinho mais próximo) e Dorimon (W/E ×1,056). Com `?dpr=1`, animação com quadro marcado **não entra no mapa**: o golpe/dano cai no efeito procedural sobre o quadro original. Gigimon e Dorimon ficam (não há alternativa desenhada), marcados por direção, para o game-art.

**Medição [E]** (`phase2/img/phase2_capture_report.json`; comprimento das corridas de cor igual num recorte de 40×40 px lógicos em volta do Tamer):

| Captura (1920×1080, `look=v8`) | px físicos / px lógico | Altura do personagem | Corridas dominantes |
|---|---|---|---|
| antes, DPR 1 | 4 | 11,1% | 4, 8, 12 |
| antes, **DPR 1,25** | **3,75** | 10,4% | **3, 4, 7, 8, 11** (pixels desiguais) |
| depois `dpr=1`, DPR 1 | 3 | 8,3% | 3, 6, 9, 12 |
| depois `dpr=1`, DPR 1,25 | 3 | 8,3% | 3, 6, 9, 12 (iguais) |

As corridas de 1–2 px vêm dos rótulos e dos gradientes de luz (canvas de nomes em resolução de tela), não dos sprites.

- [H] O vídeo do fundador mostrou o Tamer em ~2–3% da altura; a fórmula antiga não chega a isso em 1920×1032 (dá ~7–11%). Pode ter sido zoom do navegador ou outra janela. Com `?dpr=1` o tamanho deixa de depender disso: é sempre ~9% da altura física.
- **Observação:** no `look=v8` a DPR 1 o personagem já estava em 11,1% (o v8 aplica `zoomMul 1,5`); o `dpr=1` padrão fica **menor** (8,3%), dentro dos 8–10% pedidos. Se o fundador preferir maior, `?charh=11`.

Capturas: `img/p2_escala_{antes,depois}_dpr{1,125}.png`.

## 3. P3 parte 1 — controlador de animação v2 (`?anim=v2`)

`src/render/animctl.ts` (puro) + integração em `view.ts` (`update` → `stepAnimCtl`, `frameFor`, `drawSprite`). **Só apresentação:** lê `presenter.visualState`, `localTime` e a mola visual (`motion.ts`); não muda a sim, o dano nem o `hitAtMs` (continua de `attackTiming`).

- **Estados:** idle, walk, run, turn, attack, skill, hurt, victory, defeat, follow, interact.
- **Prioridade:** defeat > hurt > skill/attack > victory > interact > turn > run > follow/walk > idle.
- **Gatilhos (só de apresentação):**
  - run: velocidade visual > 1,35 × `walkSpeedPxPerSec`;
  - turn: troca de face na locomoção (110 ms ou a arte `turn`);
  - follow: parceira em FOLLOW;
  - victory: o último alvo atacado cai;
  - interact: placa, baú, cura ou NPC (`view.notifyInteract`, chamado pelo `main.ts`).
- **Golpe em 4 fases**, pelo relógio real e pelos marcos de `attackTiming`: anticipation (`< strike·0,5`) → action → impact (hit-stop, 70 ms) → recovery. No **skill** a antecipação segura o 1º quadro (pose de carga) e a ação é comprimida até o `launchAtMs`, para o corpo soltar junto do projétil.
- **One-shots** (turn, attack, skill, hurt, victory, interact) terminam e **voltam à locomoção anterior** (reavaliada pela velocidade). Depois de um one-shot, o idle segura o 1º quadro por 90 ms (sem tranco). Log de transições por entidade (`view.animCtl(id).log`).
- **Arte do `creature.json`:** candidatos por estado (`combatStates`, depois `run`→`walk`, `skill`→`attack`, `defeat`→`hurt`, `follow`→`walk`...). Assim que o game-art adicionar `run`, `turn`, `victory`, `interact` ou `idle` com N quadros, a arte entra sem código. Com idle de ≥ 2 quadros, o bob de 1 px é desligado (TECH_AUDIT L1).
- **Fallback documentado** (`fallbackTable()`), por anatomia (`anatomy` adicionado a 33 `creature.json`: biped, quadruped, flyer, blob):

| Estado sem arte | biped | quadruped | flyer | blob |
|---|---|---|---|---|
| idle (1 quadro) | bob 1 px | bob | hover ±1 px | bob |
| walk / follow | quadros do walk (sem walk: bob) | idem | hover | **hop 2 px** |
| run | walk mais rápido + lean 1 px | idem | hover | hop |
| turn | dip 1 px (andando: continua o walk) | idem | idem | idem |
| attack / skill | lunge (v1) | idem | idem | idem |
| hurt | knockback (v1) | idem | idem | idem |
| defeat | fade sobre o hurt/idle | idem | idem | idem |
| victory | 2 pulinhos de 3 px | 2 px | 3 px | 3 px |
| interact | dip 1 px ritmado | idem | idem | idem |

- [E] Testes: `tests/qo-phase2.test.ts` (21; inclui "todas as espécies reais resolvem um quadro válido em todos os 11 estados").
- [E] Ao vivo (`look=v9&dpr=1&anim=v2`, AUTO): sequência real registrada no relatório: `walk>turn`, `turn>attack`, `attack>idle`, `idle>hurt`, `hurt>idle`, `idle>victory`, `victory>idle`, `walk>attack`, `attack>hurt`, `idle>skill`. Recortes: `img/p4_anim_v2_*.png`, um por estado/fase.
- **Limite:** com `dpr=1` o Guilmon perde attack/hurt reduzidos (marcados) e usa o fallback; a arte nova (Fase 3) é o que dá corpo a essas fases. Fotos paradas não mostram o movimento: para avaliar, rode o link.

## 4. P3 parte 2 — primeiro plano e vida (`?look=v9`)

`v9 = v8 + isto`, gerado por `scripts/map-factory/derive-look-v9.mjs` (determinístico; o teste refaz e compara) em `src/data/maps/v9/`. Registrado em `regions.ts` `looks.v9`. O v8 e o padrão não mudam.

- **`objects_above`:**
  - **Parser** (`sim/map.ts`): prop dessa camada vai para `map.fgProps`, nunca sólido, fora do Y-sort. `usedKeys` carrega as chaves.
  - **Render** (`view.drawForeground`): depois das copas e antes do look. Quando cobre o Tamer ou a parceira local, fica translúcido (`behindAlpha` 0,38), com transição de 120 ms.
  - **Conteúdo:** o derivador pôs 19 props (16 moitas, samambaias e moitas floridas na borda sul das trilhas; 3 juncos na margem do riacho), fora da colisão e longe de outros props.
  - [E] Medido: opacidade 0,38 com o Tamer atrás e 1 ao lado (`img/p3_v9_primeiro_plano_tamer_{atras,atras_zoom,fora_zoom}.png`).
- **Água animada:** scroll de UV da textura do riacho, em quadros (16 × 140 ms, passo 2×1 px, volta no tile). A espuma da margem e o vau ficam no lugar.
  - Desenho: overlay por célula sobre o chunk.
  - Como a faixa é **linear na textura** (out = A + B·tex; teste: ±2/255), A e B saem uma vez por célula (2 passes, ~0,5 ms, orçamento de 6 células por quadro) e cada quadro do ciclo vira uma mistura de 1024 pixels.
  - Recortes: `img/p3_v9_agua_quadro{0..3}.png`.
- **Vento:** "shader" de pixel art: cisalhamento por faixas (a de cima ±1 px, a de baixo presa; 3 faixas nas copas, 2 na grama), sem reamostrar.
  - Fase andando pelo mapa e rajada lenta: vizinhos se mexem quase juntos, sem uníssono.
  - Vale para copas e para `fp8_fern`, `fp8_tuft`, `fp4_tall_grass_*`, `fp8_reed_cluster`, `fp8_edge_cluster_*` e `fp8_flowering_bush`.
  - O sprite cisalhado é cacheado (1 `drawImage` por copa, como parado).
- **Luzes reduzidas** (feedback do fundador): de **66 emissores em 10 tipos** para **13 com propósito**:
  - 8 lanternas (guiam a trilha), 1 fogueira (acampamento), 1 ponto de cura (função) e 3 totens (marcos);
  - saem cogumelos, cristais e flores (as "bolhas" do vídeo);
  - raios e intensidades menores; luz do Tamer 64 → 48 px;
  - `lightScale` noite 1,35 → 1,0 e dia 0,55 → 0,4; vagalumes e poeira pela metade.
  - Capturas: `img/p3_look_{v8,v9}_{noite,dia}_ponte.png`.
- [E] Testes: `tests/look-v9.test.ts` (11): derivador determinístico, v9 = v8 + FG, parser, luzes, vento, água (linear e mudando no v9, parada no v8), translucidez no render, render dia/noite.

**Desempenho [E]** (`phase2/perf/<look>/perf-digimon-forest-01.md`, modo `perf` do `capture-live.mjs`, pior caso: mapa inteiro 1792×1280, Chromium headless em software):

| Medição (mesma sessão, 2026-11-10) | Trabalho do quadro p50 / p95 (ms) | Render+raster p50 / p95 (ms) |
|---|---|---|
| v8, dia | 16,1 / 18,1 | 22,9 / 25,2 |
| v8, noite | 18,5 / 38,0 (pico de carga da máquina) | 45,1 / 61,4 (idem) |
| **v9 final, dia** | **16,7 / 27,7** | **24,5 / 27,1** |
| **v9 final, noite** | **18,7 / 20,7** | **27,1 / 30,6** |
| v9 sem cache do vento e sem orçamento da água (1ª medição) | dia 16,6 / 18,8 · noite 18,5 / 20,7 | dia 25,1 / 26,9 · noite 27,6 / 31,4 |

- **p50:** o v9 custa o mesmo que o v8 (+0,2–0,6 ms, dentro do ruído).
- **p95 do dia:** a montagem da água (A/B por célula e quadros do ciclo) tem **orçamento por quadro**: 6 células e 40 quadros de água. No mapa inteiro são 244 células × 16 quadros, então a montagem se espalha pelos primeiros ~2–3 s e entra na janela medida.
  - Sem orçamento (1ª medição), tudo era montado num tranco único durante o aquecimento, fora da janela.
  - Na tela real (~40 células de água visíveis) a montagem acaba em < 1 s.
- **Cache do vento:** o sprite cisalhado é montado uma vez por imagem e deslocamento; no quadro custa o mesmo `drawImage` do sprite parado.

- A máquina estava mais carregada hoje do que na auditoria (v8: 4,0 ms de trabalho p50 em `TECH_AUDIT` contra ~16 ms agora). Por isso v8 e v9 foram medidos **na mesma sessão**, e só a comparação entre eles vale.
- A 1ª medição do v9, antes de cachear o vento e linearizar a água, está em `perf/_pre-otimizacao/`.

## 5. Bug da Praia

- [E] Causa: o gerador salpicava `sand_02` (pedrinhas, com fundo de outra cor) na areia. Cada célula virava um quadrado claro com borda, lido como "textura ausente" (`UI_WORLD_AUDIT` §3).
- Correção (`e0fff98`, `scripts/gen-region-maps.mjs` + `praia.tmj.json` regenerado): só `sand_00`, com a sequência do RNG preservada (postes e vila iguais).
- [E] Ao vivo: 0 chaves sem tile (`praiaMissing: []`).
- Capturas: antes `img/p5_praia_antes_auditoria.png` (cópia da auditoria), depois `img/p5_praia_depois.png`.

## 6. Flags e links de teste (porta 5190)

Subir o servidor da branch (não mexe na 5174):

```bash
cd ~/projects/GameStudio/workspaces/game-dev/qo/projects/prototypes/GS-003/prototype/world
npx vite --port 5190
```

| Para ver | Link |
|---|---|
| Tudo junto (escala nova + anim v2 + look v9) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&criador=0 |
| Escala antes × depois | http://127.0.0.1:5190/?map=digimon-forest-01&look=v8 · http://127.0.0.1:5190/?map=digimon-forest-01&look=v8&dpr=1 |
| Personagem maior (11%) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&charh=11 |
| Luzes v8 × v9 à noite | http://127.0.0.1:5190/?map=digimon-forest-01&look=v8&dpr=1&time=night · http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&time=night |
| Controlador v2 com combate (AUTO) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&auto=1&criador=0 |
| Praia corrigida | http://127.0.0.1:5190/?map=praia |

- `?dpr=1`: escala em px físicos + escala unificada + quadros `resampled` fora do mapa.
- `?charh=N`: alvo em % da altura (3–25, padrão 9).
- `?zoom=N`: força a escala (px físicos com `dpr=1`).
- `?anim=v2`: controlador v2.
- `?look=v9`: v8 + primeiro plano + água + vento + luzes reduzidas.
- `?novo=1`: começa sem save.

Capturas: `ONLY=qo2 W=1920 H=1080 CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu npm run shots:live` (`QO2_PART=fg` só o primeiro plano). Perf: `ONLY=perf W=1792 H=1280 QUERY=look=v9 OUT=… npm run shots:live`.

## 7. Arquivos

- **Novos:**
  - `src/render/scale.ts`, `src/render/animctl.ts`, `src/render/life.ts`;
  - `scripts/map-factory/derive-look-v9.mjs`, `src/data/maps/v9/`;
  - `tests/qo-phase2.test.ts`, `tests/look-v9.test.ts`.
- **Alterados:**
  - `main.ts` (flags, resize, `notifyInteract`) e `render/view.ts` (escala unificada, ctl v2, água, vento, FG);
  - `render/anim.ts` (`realAnim` exportado, `setSkipResampled`) e `render/look.ts` (tipos);
  - `assets/creatures.ts` (`resampled`, `anatomy`) e `assets/scene-tiles.ts` (`fgProps`);
  - `sim/map.ts` (parser `objects_above`, só apresentação) e `world/regions.ts` (`looks.v9`);
  - `scripts/capture-live.mjs` (`ONLY=qo2`);
  - 33 `creature.json` (`anatomy`; 15 com `resampled`).
- **Evidência:** `phase2/img/` (27 PNG + `phase2_capture_report.json`), `phase2/perf/`.

## 8. Limitações

- **Arte:** o controlador e o primeiro plano estão prontos, mas as espécies seguem com idle de 1 quadro e sem run, turn, victory ou interact desenhados. O que aparece é fallback procedural. As moitas de primeiro plano são props pequenos (20–28 px) do forest-v8-depth: cobrem só as pernas. Galhos e folhas grandes de primeiro plano, no estilo Drakantos, são trabalho do game-art.
- **Água:** é scroll de UV de uma textura que ladrilha visivelmente (grade de ondinhas). Um tile de água com mais variação melhoraria muito.
- **Escala:** 8,3% a 1080p é o inteiro mais próximo de 9%. A 1366×768 o resultado é a escala 2 (7,8%). Os rótulos de nome continuam em resolução de tela (fora do escopo).
- **Teste de DPR** feito por emulação (`deviceScaleFactor` 1,25 no Chromium headless), não num Windows real a 125%.
- **Desempenho** medido em headless com software raster, numa máquina carregada; serve para comparar v8 × v9, não como fps do jogador.
- Não houve vídeo novo; os estados do v2 têm recortes parados e o log de transições.
