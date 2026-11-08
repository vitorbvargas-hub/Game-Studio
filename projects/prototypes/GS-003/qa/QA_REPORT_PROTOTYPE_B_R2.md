# QA Report R2 — GS-003 Protótipo Linha B (pack `digimon-fan`) + Arena-spike

> Template Game Studio. Datas em ISO. Marque afirmações como **[E]** evidência (com fonte) ou **[H]** hipótese.

- **Projeto:** GS-003 (fase PROTOTYPE)
- **Autor (agente):** game-qa
- **Data:** 2026-11-08
- **Status:** reteste — ver veredito
- **Relatório anterior:** `QA_REPORT_PROTOTYPE_B.md` (2026-11-08, mesma data, rodada anterior)

## Escopo testado (versão/commit)

- Diretório: `projects/prototypes/GS-003/prototype/game/` (motor + content packs + `arena-spike/`).
- **[E]** Commit do estúdio: `248615d` ("GS-003: animações walk/attack/hit + integração arena"). `git status --porcelain` na árvore do GS-003 não retornou nada — ao contrário da rodada anterior (que rodou em árvore de trabalho não commitada), esta QA cobre um commit fixo e limpo.
- Pacote testado: `digimon-fan` (`pack.json` → `version: 0.1.0`, `kind: fan`).
- Documentos de referência: ADR-007 (`shared/decisions/ADR-007-gs003-fan-game-pokemon-digimon.md`), `TECHNICAL_SPEC.md`, `arena-spike/FEASIBILITY.md`.

## Ambiente

- Node.js v24.19.0. Execução: `npm test` (vitest), `npm run build` (tsc + vite build), `npx vitest run --config arena-spike/vitest.config.ts`, dentro de `prototype/game/`.
- **Sem navegador real neste host** (mesma limitação já documentada: Chromium headless não inicia, falta `libnspr4`; confirmei de novo — `which chromium`/`google-chrome` vazio, nenhum pacote Playwright instalado). Toda verificação visual veio de 3 fontes, deixadas explícitas caso a caso:
  1. leitura de código + cálculo geométrico/temporal;
  2. testes automatizados em jsdom/vitest (lógica pura, sem canvas real);
  3. **render real em Canvas 2D via `@napi-rs/canvas`** (não é jsdom — é uma implementação real de Canvas 2D em C++/Rust, não uma simulação): usei as capturas já existentes em `docs/screens/` e `arena-spike/screens/` (geradas por `capture.ts`/scripts do próprio repo, não desenhadas por mim) e as inspecionei visualmente.
- Nenhum navegador interativo com teclado foi testado — os controles da arena (WASD, J/K, R) foram verificados só por leitura de código e pela suíte `arena.check.ts`, não por jogo manual.

## Casos executados (passou/falhou)

| # | Caso | Resultado |
|---|---|---|
| 1 | `npm test` | ✅ Passou — **70 testes, 8 arquivos** (antes: 47/6). Novos arquivos: `onboarding_pacing.test.ts` (14), `render_layout.test.ts` (6) |
| 2 | `npm run build` | ✅ Passou — `tsc --noEmit` sem erros; `vite build` → `71,33 kB JS / 22,40 kB gzip` + `2,06 kB CSS` (inclui as novas sprites walk/attack/hit nos 3 packs) |
| 3 | `npx vitest run --config arena-spike/vitest.config.ts` | ✅ Passou — 5 testes, 1 arquivo (`arena.check.ts`) |
| 4 | Bug #1 anterior (sprites 48 px sobrepostos) | ✅ **Corrigido** — ver "Reverificação dos bugs #1–#3" |
| 5 | Bug #2 anterior (animação idle por quadro, não por tempo) | ✅ **Corrigido no jogo idle** — ❌ **presente de novo no arena-spike**, ver Bug #4 novo abaixo |
| 6 | Bug #3 anterior (1ª decisão > 2:00, sem onboarding) | ✅ **Corrigido** — ver "Reverificação" |
| 7 | Onboarding novo: parceiro, Varredura, Treino, save v3 | ✅ Passou — ver seção dedicada |
| 8 | Animações walk/attack/hit (idle + arena-spike) | ✅ Passou (idle: attack/hit; arena-spike: idle/walk/attack/hit) — com a ressalva do Bug #4 |
| 9 | Arena-spike: controles, vitória/derrota, revanche | ✅ Passou por leitura de código + testes — **sem teste manual com teclado** |
| 10 | Equilíbrio Gabumon x Agumon (IA x IA) | ❌ **Ainda desequilibrado** — ver Bug #5 (remedição) |
| 11 | ADR-007 — sem rede/anúncio/telemetria no `src/` e `index.html` | ✅ Passou — `tests/no_network.test.ts`, inalterado |
| 12 | ADR-007 — sem rede/anúncio/telemetria no `arena-spike/` | ⚠️ **Sem cobertura automatizada** — ver Bug #6 (achado de processo) |
| 13 | ADR-007 — aviso visível (jogo idle + arena-spike) | ✅ Passou nos dois |
| 14 | ADR-007 — 27 sprites novos idênticos aos de `art/src` | ✅ Passou — `md5sum` |

## Reverificação dos bugs #1–#3 do relatório anterior

### Bug #1 (sprites sobrepostos) — ✅ Corrigido
- `src/render/renderer.ts`: `ALLY_SLOTS`/`ENEMY_SLOTS` agora formam um triângulo (`[100,118]`, `[44,84]`, `[44,150]`) em vez da coluna vertical de 32 px antiga.
- **[E]** `tests/render_layout.test.ts` tem um teste geométrico dedicado (`footprint()` + `overlap()`) que cobre corpo + barra de HP + nível para os 6 combatentes e para chefe+2 escoltas+3 aliados, com `SPRITE_MAX=48`; passou.
- **[E]** Inspecionei visualmente `docs/screens/line-b_wave.png` e `line-b_boss.png` (render real via `@napi-rs/canvas`, não desenho meu): os 3 aliados ficam claramente separados, sem sprites nem barras de HP se tocando.

### Bug #2 (animação idle por quadro de render, não por tempo real) — ✅ Corrigido no jogo idle
- `renderer.ts` agora tem `idleFrameIndex(nowMs, frameMs, frames, uid)`, que deriva o frame do `now` real passado a `draw(state, now)`, não de uma contagem de quadros.
- **[E]** `tests/render_layout.test.ts` tem 3 testes dedicados: mesmos frames a 30/60/120/144 Hz (tolerância de 1 amostra de borda), troca exatamente a cada `spriteFrameMs`, e troca correta attack→idle→hit→idle durante uma batalha simulada. Todos passaram.
- Ressalva: esse mesmo padrão de bug **reapareceu no `arena-spike`**, em código novo não tocado por essa correção — ver Bug #4.

### Bug #3 (1ª decisão > 2:00, sem onboarding implementado) — ✅ Corrigido
- O motor agora tem `chooseStarter`, `chooseEncounter` (Varredura guiada) e `allocateTraining` (Ponto de Treino), todos ligados por dados (`theme.starterOptions`, `balance.scan`, `balance.training`, `areas.*.encounterChoice`), com migração de save v2→v3.
- **[E]** Rodei `tests/onboarding_pacing.test.ts` com log (`GS_PACING_LOG=1`) para ver os números reais, não só o passa/falha: 9 combinações de parceiro × seed, todas com **1ª escolha de encontro entre 21,4 s e 30,1 s** (bem dentro de 2:00) e **maior intervalo entre decisões entre 72,1 s e 92,7 s** (bem dentro de 3:00), 16–22 decisões nos 10 min, 2 recrutas via Varredura, 0 derrotas em todos os casos.
- O marco original do GDD ("1ª decisão ≤ 2:00") agora é cumprido com folga nos dados reais, não só no teste.

## Onboarding (parceiro, Varredura, Treino) — save v3 e migração v2→v3

- `theme.starterOptions` tem 3 opções; o mundo fica **parado** (`state.tick` não avança, `step()` retorna `[]`) enquanto `starterPending` é verdadeiro — confirmado em `tests/onboarding_pacing.test.ts` ("mundo parado até a escolha") e por leitura de `game.ts` (`step()`: `if (state.battle?.decision || state.starterPending) return [];`).
- Escolha de parceiro inválida (`chooseStarter(..., "nao_existe")`) lança erro; escolher 2 parceiros lança erro na 2ª chamada — testado.
- Varredura: cada encontro resolvido soma `pctPerEncounter`%; ao chegar a 100%, a **próxima vitória** recruta a espécie (`enemy.recruitAs`), até `partyMax`. Teste dedicado confirma 3/3 espécies recrutadas de forma determinística (mesma seed).
- Sem resposta do jogador, a escolha de encontro **não trava o idle**: `autoPickAfterTicks` aplica a opção 0 automaticamente — testado e por leitura de `step()`.
- Treino: `allocateTraining` recusa stat inválido e recusa gastar sem `trainPoints`; o bônus (`pctPerPoint`) é aplicado em `trainingBonus()` e entra no `Combatant` da próxima onda — teste confirma o valor exato (`Math.round(base * (1 + 2*pct/100))`).
- **Save v3 / migração v2→v3**: `SAVE_VERSION = 3`. A migração `2: (env) => ...` preenche `starterPending: false`, `scan: {}`, `recruited` (deduzido do `party` existente), `encounter: null`, `winsSinceEncounter: 0`, `encountersChosen: 0` — ou seja, **um save antigo (v2) não volta a pedir parceiro**, porque já tem time. **[E]** `tests/offline_save.test.ts` tem um teste dedicado que remove esses campos de um save v2, migra, confirma `starterPending === false`, `recruited` bate com as espécies do time, e que `stepN(..., 300)` não lança erro depois — passou. Migração v1→v2→v3 encadeada também testada.

## Animações walk/attack/hit — jogo idle e arena-spike

- `src/render/anim.ts`: `animFrames()`/`animFrameMs()`/`oneShotFrame()` compartilhados pelos dois renderers; `ANIM_NAMES` (`idle`/`walk`/`attack`/`hit`) validados em `content.ts` (nome de animação desconhecido falha o boot/`npm test`; frames declarados precisam existir em `assets`).
- **Jogo idle** (`renderer.ts`): usa `idle` (loop, por tempo real), `attack` (uma passada ao agir) e `hit` (uma passada ao tomar dano); **não usa `walk`** — não há deslocamento físico no combate idle (o avanço é o efeito `lunge` de 6 px, já existente antes), então a ausência de uso de `walk` aqui não é bug, é esperado.
  - **[E]** `tests/render_layout.test.ts`, teste "batalha automática": simulei `attack` ao evento `act`, depois volta a `idle`, depois `hit` ao evento de dano — os 3 estados batem com o path esperado (`url(def.anims.attack[0])` etc.).
- **Arena-spike** (`arena-spike/render.ts`, `ArenaRenderer.animOf`): prioridade `hit` (durante `hitstun`) → `attack` (durante `swing` do básico ou `cast` do especial) → `walk` (quando `f.moving`) → `idle`.
  - **[E]** `arena-spike/arena.check.ts`, teste "pacote declara idle/walk/attack/hit...": confirma que as 3 criaturas com sprite (Agumon/Gabumon/Patamon) declaram **2/4/3/2 frames** (idle/walk/attack/hit) e que o renderer escolhe `idle` parado, `walk` ao mover (`path` bate com `_walk_0\d\.png$`), `attack` no básico e no especial (via evento `cast`), `hit` durante hitstun, e volta a `idle` — passou.
  - **[E]** Inspecionei `arena-spike/screens/arena_walk.png` (render real `@napi-rs/canvas`, capturado no momento em que os 2 lutadores estão andando e o da direita olha para a esquerda — o próprio `capture.ts` espera por essa condição antes de tirar a foto): os dois sprites aparecem com pose de caminhada, sem artefato visual, sem corte de pixel fora da caixa.
  - **Espelhamento**: ambos os renderers (idle e arena) usam a mesma técnica (`ctx.translate(x*2+w, 0); ctx.scale(-1,1)` antes de `drawImage(img, x, y)` sem alterar `x`). Fiz a conta: essa transformação mapeia o intervalo de tela `[x, x+w]` nele mesmo (só inverte a ordem de desenho), então a caixa delimitadora não se desloca ao espelhar — **matematicamente correto**, e bate com o que vi nas capturas (`arena_walk.png`, `arena_melee.png`): nenhum sprite "pula" de posição ao virar. Não existe teste automatizado dedicado a isso (nem pixel-a-pixel nem de posição), só a inspeção visual das capturas e a conferência matemática que fiz nesta QA.

### Bug #4 (NOVO) — Animação idle/walk do `arena-spike` depende da taxa de render, não do tempo real
**Severidade: Baixa** (visual, só no spike descartável; não afeta a simulação nem o jogo idle, que já foi corrigido)

- **Onde:** `arena-spike/render.ts`, `ArenaRenderer.animOf()` / `draw()`. `this.frame` é incrementado **1 vez por chamada de `draw()`** (`this.frame++` no topo de `draw()`), e o frame de `idle`/`walk` é escolhido por `const t = this.frame * MS_PER_DRAW + ...`, com `MS_PER_DRAW = 1000/60` fixo — exatamente o mesmo padrão do Bug #2 original (`this.frame` por quadro de tela, não por `performance.now()`/delta real), só que num arquivo que não existia quando aquele bug foi corrigido no renderer principal.
  - As animações `attack`/`hit` da arena **não** têm esse problema: elas são "uma passada" medida em **ticks da simulação fixa** (`swing`, `hitstun`, `cast` decrementam 1 por `stepArena()`, que roda a `cfg.simHz=30` fixo, independente da taxa de tela) — só `idle`/`walk` usam a contagem de `draw()`.
- **Passos para reproduzir (medição, já que não há navegador real neste host):** escrevi e rodei um script temporário (`vite-node`, removido ao final, não commitado) que simula o shell real de `arena-spike/main.ts` — `stepArena` a 30 Hz fixo (consumido por acumulador), `draw()` chamado 1x por "quadro de tela" a taxas diferentes — e amostrei qual frame de sprite (`animOf(fighters[0]).path`) está sendo desenhado em 20 instantes de tempo real espaçados de 300 ms, para as taxas de tela 30/60/120/144 Hz.
- **Resultado observado:** comparando contra a referência de 60 Hz, **10 das 20 amostras divergem a 30 Hz, 10/20 a 120 Hz e 15/20 a 144 Hz** — ou seja, em mais da metade dos instantes, o frame de idle mostrado depende de quantos quadros de tela já passaram, não de quantos milissegundos reais passaram. Na prática, um jogador em monitor de 144 Hz veria o personagem "respirar"/andar num ritmo visivelmente diferente de um jogador em 30 Hz, mesmo jogando a mesma partida (a simulação em si, a 30 Hz fixo, é idêntica nos dois).
- **Impacto:** só cosmético (idle/walk visual), não afeta resultado de luta, dano, ou determinismo da simulação (que já é por ticks fixos). Como a arena é explicitamente um spike "código descartável" (`FEASIBILITY.md` §0) e não entra no `npm run build` (confirmado: `dist/` não inclui `arena-spike/`), o risco de exposição a jogador real hoje é baixo — mas se a arena virar modo de jogo real (conforme o roadmap do próprio `FEASIBILITY.md`), esse bug herdaria a mesma prioridade que o Bug #2 teve no jogo idle.
- **Não corrigido** (fora do escopo desta QA); sugestão para o dev: aplicar a mesma solução do jogo idle — trocar `this.frame * MS_PER_DRAW` por um `nowMs` real passado a `draw(st, now)`, análogo a `idleFrameIndex()`.

## Arena-spike: controles, vitória/derrota, revanche

- **Controles** (`arena-spike/main.ts`): WASD/setas movem (8 direções, com `Math.SQRT1_2` na diagonal), J/Espaço = básico, K/E = especial, R = revanche (só quando `st.outcome` já existe). Shell usa loop de passo fixo (`STEP_MS = 1000/cfg.simHz`) com acumulador e teto de 250 ms por frame — mesmo padrão do shell do jogo idle (`main.ts` do jogo idle também tem acumulador com teto, documentado no `TECHNICAL_SPEC.md`).
- **Vitória/derrota**: `stepArena` decide `outcome` por KO (`a.hp===0`/`b.hp===0`, inclusive empate se os 2 chegam a 0 no mesmo tick) ou por tempo esgotado (`timeLimitSec`, comparando % de HP). `OUTCOME_TEXT` no HUD cobre os 3 casos (`win`/`lose`/`draw`).
  - **[E]** `arena.check.ts`: teste dedicado "jogador parado perde para a IA" (`NO_INPUT` vs `aiInput`) confirma `outcome === "lose"`. Não há teste automatizado explícito de vitória do jogador nem de empate, mas a lógica é simétrica (mesma função `stepArena`, só troca quem é `a`/`b`) e a medição de equilíbrio abaixo (Bug #5) já produz centenas de vitórias e derrotas reais via IA x IA.
- **Revanche**: `if (k === "r" && st.outcome) { st = newMatch(); renderer.reset(); }` — reseta o estado da arena (nova seed incremental) e o renderer (`fx`, `floaters`, `cast`, `side`). Só verificado por leitura de código; sem teste automatizado nem navegador real.
- **Limitação:** nada disso foi jogado com teclado num navegador de verdade. A sensação dos controles (responsividade, "feel" do dash/ataque) não foi validada — mesma ressalva que `FEASIBILITY.md` já registrava.

## Equilíbrio Gabumon x Agumon (IA x IA) — remedição

- `FEASIBILITY.md` (mesma data, antes desta QA) já media: "Gabumon x Agumon dá 97,5% de vitória para o Gabumon" (200 seeds, Nv 10).
- **[E]** Repeti a medição com um script temporário (`vite-node`, removido ao final), mesma config (`arena.json`, Nv 10, 200 seeds, IA x IA pelo `aiInput` dos dois lados), reproduzindo exatamente o mesmo cenário do `arena.check.ts` (Agumon na posição 0/jogador — sem vantagem de afinidade —, Gabumon na posição 1/inimigo — com vantagem `data→vaccine = 1,25x`):

| Confronto (idx0 x idx1) | Nv | Seeds | Vitória idx0 | Vitória idx1 | Duração média |
|---|---|---|---|---|---|
| Agumon x Gabumon | 10 | 200 | Agumon: **2,5%** (5) | Gabumon: **97,5%** (195) | 15,0 s |
| Gabumon x Agumon | 10 | 200 | Gabumon: **91,0%** (182) | Agumon: **9,0%** (18) | 16,7 s |
| Gabumon x Agumon | 20 | 200 | Gabumon: **96,0%** (192) | Agumon: **4,0%** (8) | 13,1 s |

- **Resultado: o desequilíbrio é o mesmo de antes (97,5%), sem mudança** — confirma que o `FEASIBILITY.md` não ficou desatualizado e que nenhum ajuste de balanceamento da arena entrou neste commit.
- **Achado adicional (não estava no relatório anterior):** medi também o par invertido de posição (Gabumon como "jogador" idx0 vs Agumon idx1) e o resultado **não é simétrico** — Gabumon vence 91,0% como idx0 contra 97,5% como idx1. Ou seja, além do multiplicador de afinidade (já documentado como "forte demais" em `FEASIBILITY.md` [H]), existe uma **vantagem posicional de ~6,5 pontos percentuais entre idx0 (jogador) e idx1 (IA)** nesta config de IA — possivelmente porque a IA reage com `reactionMs=200ms` fixo e a ordem de avaliação do tick (`for (const me of st.fighters)`, sempre `a` antes de `b`) não é perfeitamente simétrica. Não investiguei a causa raiz (fora do escopo "não corrigir código"); é uma pista a mais para quem for rebalancear.
- Também medi um 3º par (Patamon x Agumon, mesma vantagem de afinidade 1,25x que Gabumon x Agumon): Patamon venceu só 75% — então o multiplicador de afinidade **não é o único fator**: há diferença real de stats/kit entre Gabumon e Patamon que também pesa. Isso sugere que ajustar só o `affinityChart` pode não ser suficiente para corrigir Gabumon x Agumon especificamente.

### Bug #5 (reconfirmado, não novo) — Afinidade decide a arena quase sozinha (97,5% Gabumon x Agumon)
**Severidade: Média** (já era [H]/conhecido pelo estúdio em `FEASIBILITY.md`; o que esta QA agrega é a remedição confirmando que persiste, e o detalhe de assimetria posicional)

- Já documentado e aceito como risco de design em `arena-spike/FEASIBILITY.md` §0 ("Para ação em tempo real, esse multiplicador é forte demais [H]"). Reporto aqui por ser item explícito desta rodada de QA (medir de novo), não como achado inédito.
- **Não corrigido** (fora do escopo desta QA).

## Conformidade ADR-007

| Item | Resultado |
|---|---|
| Sem rede/XHR/WebSocket/URLs externas/analytics em `src/`, `index.html` | ✅ Passou — `tests/no_network.test.ts`, 2 testes, inalterado desde a rodada anterior |
| Sem rede/XHR/WebSocket/URLs externas/analytics em `arena-spike/` | ✅ **Verificado manualmente** (grep em `arena-spike/*.ts` e `arena-spike/index.html` contra o mesmo padrão do teste: `fetch\(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, `http(s)://` — zero ocorrências) — mas **não há teste automatizado cobrindo isso**, ver Bug #6 |
| Pacotes sem campos de loja/preço/IAP/anúncio/telemetria | ✅ Passou — mesmo teste, inalterado |
| Aviso de fan game sempre visível — jogo idle | ✅ Passou — `pack.disclaimer` renderizado em `<footer class="disclaimer">` em todo `render()` do HUD (`src/ui/hud.ts:233`, escapado com `esc()`) |
| Aviso de fan game sempre visível — arena-spike | ✅ Passou — `renderHud()` em `arena-spike/main.ts` inclui `${content.pack.disclaimer ? ...footer... : ""}` em todo redesenho do HUD |
| Sem logo/marca oficial (texto) | ✅ Passou — grep em `src/`, `arena-spike/*.ts`, `packs/*/*.json`, os 2 `index.html`: zero ocorrências de "nintendo/bandai/toei/pokemon company/game freak" fora do texto do próprio disclaimer (que só nega afiliação) |
| 27 sprites novos idênticos aos gerados por `art/src` | ✅ Passou — ver abaixo |

### Bug #6 (NOVO, achado de processo) — Guarda ADR-007 (`no_network.test.ts`) não cobre `arena-spike/`
**Severidade: Baixa** (nenhuma violação real encontrada; é um buraco na rede de proteção automatizada, não um bug de comportamento)

- **Onde:** `tests/no_network.test.ts` lê só `import.meta.glob(["../src/**/*.ts", "../index.html"], ...)`. O diretório `arena-spike/` (9 arquivos `.ts` + `index.html` próprio, introduzido nesta mesma leva de commits) **não está incluído** no glob.
- **Passos para reproduzir:** `grep -n "arena-spike\|src/\*\*" tests/no_network.test.ts` → só aparece `../src/**/*.ts`.
- **Resultado observado:** rodei manualmente o mesmo padrão banido do teste (`fetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|http(s)://`) contra `arena-spike/*.ts` e `arena-spike/index.html` — **zero ocorrências hoje**, então não há violação real do ADR-007 neste momento. O achado é que, se alguém introduzir uma chamada de rede dentro de `arena-spike/` amanhã, `npm test` **não pegaria**, ao contrário do que acontece em `src/`.
- **Impacto:** risco de regressão silenciosa da condição 1 do ADR-007 (sem rede/telemetria) especificamente na área que mais cresceu nesta rodada (arena-spike ganhou ~9 arquivos novos). Hoje, sem violação; o risco é só a ausência de rede de segurança automatizada.
- **Não corrigido** (fora do escopo desta QA); sugestão para o dev: incluir `arena-spike/**/*.ts` e `arena-spike/index.html` no `import.meta.glob` de `no_network.test.ts`, ou criar um teste irmão dedicado ao spike (já existe `arena-spike/vitest.config.ts` separado, então o padrão de "checagem fora do `npm test` principal" já existe — só falta este caso específico).

### Sprites novos — origem e integridade
- **[E]** `packs/digimon-fan/sprites/` tem **33 PNGs** (6 idle antigos já verificados na rodada anterior + **27 novos**: 3 criaturas × (4 walk + 3 attack + 2 hit) = 27). Todos **48×48**, confirmado por `file`.
- **[E]** `md5sum` dos 33 PNGs do pack contra `art/sprites/digimon-fan/`: **os 33 são byte-idênticos** (o `diff` só aponta 1 arquivo a mais em `art/sprites/digimon-fan/`, `battle_mockup_digimon_320x180.png`, que é um mockup de composição, não uma sprite de criatura, e corretamente **não** está no pack).
- **[E]** `art/src/` tem `agumon.js`, `gabumon.js`, `patamon.js` com o mesmo cabeçalho de origem já verificado na rodada anterior ("Drawn pixel-by-pixel from general/public visual memory... No official image, sprite, or file was fetched or traced") — os 3 arquivos foram reescritos nesta leva (timestamps de hoje, 14:53–14:55) para gerar as novas poses, mas mantêm a mesma declaração de origem e o mesmo pipeline Node puro (`canvas.js`+`png.js`, sem dependência externa).

## Riscos residuais

- **[E]** Sem verificação com navegador real/teclado neste host (mesma limitação de ambiente da rodada anterior). Os Bugs #1–#3 anteriores foram reconfirmados por teste automatizado dedicado (não só leitura de código, como na rodada anterior) + inspeção de capturas de render real (`@napi-rs/canvas`). O Bug #4 (novo) e os controles/revanche da arena foram verificados só por leitura de código + testes headless + 1 conjunto de capturas; recomendo teste manual em navegador antes de qualquer decisão sobre a arena virar modo de jogo real.
- **[H]** O equilíbrio da arena (Bug #5) segue sem correção; se a arena virar modo de jogo real conforme o roadmap do `FEASIBILITY.md`, isso precisa de ajuste antes de qualquer playtest externo.
- **[H]** Capturas de tela (`docs/screens/`, `arena-spike/screens/`) usadas nesta QA foram geradas por scripts do próprio repositório antes desta QA começar, não por mim nesta sessão — não reproduzi a geração, só inspecionei os arquivos já existentes com timestamp de hoje.
- Nenhum risco novo de conformidade ADR-007 (itens testáveis todos passaram); o único achado é o buraco de cobertura do Bug #6, sem violação real encontrada.

## Evidências (logs, prints, comandos)

- `npm test`: `Test Files 8 passed (8)` / `Tests 70 passed (70)`.
- `npm run build`: `tsc --noEmit` sem erro; `dist/assets/index-*.js 71.33 kB (gzip 22.40 kB)` + CSS 2.06 kB; inclui as novas sprites `*_walk_*.png`/`*_attack_*.png`/`*_hit_*.png` dos 3 packs.
- `npx vitest run --config arena-spike/vitest.config.ts`: `Test Files 1 passed (1)` / `Tests 5 passed (5)`.
- `GS_PACING_LOG=1 npx vitest run tests/onboarding_pacing.test.ts`: log completo das 9 combinações parceiro×seed com tempos reais (1º encontro 21,4–30,1 s; maior intervalo 72,1–92,7 s).
- Medição de equilíbrio da arena: script `vite-node` temporário (criado e removido ao final desta QA, não commitado), 200 seeds por confronto, mesma config de `arena.json`/Nv 10 do `FEASIBILITY.md`: Agumon x Gabumon 2,5%/97,5%; Gabumon x Agumon 91,0%/9,0%; Gabumon x Agumon Nv 20 96,0%/4,0%; Patamon x Agumon 75,0%/25,0%.
- Medição do Bug #4: outro script `vite-node` temporário (removido ao final), simulando o shell real (`stepArena` a 30 Hz fixo + `draw()` 1x por quadro de tela) a 30/60/120/144 Hz, 20 amostras de 300 ms: 10/20, —, 10/20, 15/20 amostras divergentes da referência de 60 Hz.
- `md5sum` dos 33 PNGs de `packs/digimon-fan/sprites/` vs `art/sprites/digimon-fan/`: idênticos (33/33); `file` confirma 48×48 em todos.
- `git status --porcelain` na árvore do GS-003: vazio (commit `248615d` limpo, sem mudanças não commitadas) — diferente da rodada anterior.
- `grep` de guarda (rede/telemetria/logo/marca) em `arena-spike/*.ts`, `arena-spike/index.html`: zero ocorrências fora do disclaimer.

## Veredito: **aprovado com ressalvas**

Os 3 bugs da rodada anterior estão corrigidos e reconfirmados com testes automatizados dedicados (não só leitura de código, como antes): o layout não sobrepõe mais sprites, a animação idle do jogo principal é por tempo real, e o onboarding (parceiro, Varredura, Treino) cumpre os marcos de ritmo do GDD com folga (1ª decisão em ~21–30 s, maior intervalo ~72–93 s, ambos bem dentro de 2:00/3:00). O save v3 migra de v2 sem pedir parceiro de novo, e os 27 sprites novos de walk/attack/hit são idênticos aos gerados pelo pipeline de arte, mantendo a cadeia de evidência de origem do ADR-007.

A ressalva principal é o **arena-spike**, que é explicitamente um spike/protótipo descartável: (1) reintroduz o padrão do Bug #2 original — idle/walk por contagem de quadro, não por tempo real — em código novo não coberto pela correção anterior; (2) não tem cobertura automatizada do guard-rail de ADR-007 (`no_network.test.ts`), embora não tenha violação real hoje; (3) o desequilíbrio de afinidade (97,5% Gabumon x Agumon) já era conhecido e segue sem ajuste, agora com o dado extra de que há também uma assimetria posicional (~6,5 p.p.) e que o multiplicador de afinidade sozinho não explica tudo (Patamon x Agumon só 75% com a mesma vantagem de afinidade). Nenhum desses 3 pontos bloqueia o protótipo do jogo idle, que está sólido; eles importam **se e quando** a arena virar um modo de jogo real, não como está hoje (spike, fora do `npm run build`).

## Limitações desta QA

- Sem navegador real nem teclado físico neste host — controles da arena, sensação do dash/ataque e revanche só verificados por leitura de código e testes headless, não por jogo manual.
- Capturas de tela usadas (`docs/screens/`, `arena-spike/screens/`) são de scripts do próprio repositório, geradas antes desta QA, não por mim; não reproduzi a geração nem fiz análise pixel-a-pixel do espelhamento, só inspeção visual + conferência matemática da transformação de canvas.
- Não testei a Linha A (`original-a`, stub) nem revi `original-b` em profundidade — fora do pedido desta tarefa.
- Não revisei qualidade artística/fidelidade visual dos sprites novos (se "parecem" certo em movimento), só a origem/procedência (md5 contra `art/src`) e a ausência de distorção óbvia nas capturas existentes.
- Não corrigi nenhum código, conforme instrução da tarefa; todos os achados acima são apenas relatados.
