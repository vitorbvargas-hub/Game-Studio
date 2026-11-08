# QA Report — GS-003 Protótipo Linha B (pack `digimon-fan`)

> Template Game Studio. Datas em ISO. Marque afirmações como **[E]** evidência (com fonte) ou **[H]** hipótese.

- **Projeto:** GS-003 (fase PROTOTYPE)
- **Autor (agente):** game-qa
- **Data:** 2026-11-08
- **Status:** rascunho — ver veredito

## Escopo testado (versão/commit)

- Diretório: `projects/prototypes/GS-003/prototype/game/` (motor + content packs).
- Pacote testado: `digimon-fan` (`pack.json` → `version: 0.1.0`, `kind: fan`).
- Estado git do estúdio: último commit `f98fcfc` ("ADR-006: GS-003 to PROTOTYPE..."). **[E]** O protótipo inteiro (`prototype/`, `art/`, `research/`) ainda está **untracked**, não commitado (`git status --porcelain` na raiz do estúdio, 2026-11-08) — esta QA cobre a árvore de trabalho atual, não um commit fixo.
- Documentos de referência: `ADR-007-gs003-fan-game-pokemon-digimon.md`, `prototype/game/README.md`, `prototype/game/TECHNICAL_SPEC.md`, `prototype/GDD_PROTOTYPE_B.md`, `packs/digimon-fan/README.md`.

## Ambiente

- Node.js v24.19.0, npm 11.17.0 (host Linux, registro npm bloqueado — deps via `npm install --offline`/cache, conforme já documentado no `TECHNICAL_SPEC.md`).
- Execução: `npm test` (vitest) e `npm run build` (tsc + vite build), ambos dentro de `prototype/game/`.
- Sem navegador real disponível neste host (limitação já conhecida e documentada no `TECHNICAL_SPEC.md`: Chromium headless não inicia por falta de `libnspr4`). Verificação do item 3 (onboarding) foi feita por **simulação determinística do motor real** (mesmas funções `newGame`/`step` usadas pelo jogo), não por teste manual em navegador — ver "Evidências".

## Casos executados (passou/falhou)

| # | Caso | Resultado |
|---|---|---|
| 1 | `npm test` | ✅ Passou — 47 testes, 6 arquivos (`no_network`, `battle`, `offline_save`, `packs_playable`, `rng_content`, `shell.smoke`) |
| 2 | `npm run build` (typecheck + build de produção) | ✅ Passou — `tsc --noEmit` sem erros; `vite build` gerou `dist/` (56,56 kB JS / 18,38 kB gzip + 1,89 kB CSS) |
| 3 | ADR-007 — sem rede/anúncio/telemetria no código | ✅ Passou — `tests/no_network.test.ts` cobre `src/**/*.ts`, `index.html` e todo `packs/*/*.json` contra `fetch`/`XMLHttpRequest`/`sendBeacon`/`WebSocket`/`EventSource`/`http(s)://`/`gtag`/`analytics`/`adsbygoogle` e contra campos `price`/`iap`/`store`/`shop`/`ads`/`premium`/`telemetry`/`tracking`; confirmei também por `grep` manual no código-fonte e nos JSON do pacote — nenhuma ocorrência fora do próprio texto do disclaimer (que *menciona* "sem anúncios" como texto, não como feature) |
| 4 | ADR-007 — aviso de fan game sempre visível | ✅ Passou — `pack.json.disclaimer` é obrigatório para `kind: "fan"` (validado em `buildContent()`, falha o boot/`npm test` se ausente) e é renderizado como `<footer class="disclaimer">` em **toda** chamada de `render()` do HUD (`src/ui/hud.ts:172`), que é a única tela do jogo — não há tela sem o rodapé |
| 5 | ADR-007 — nenhum logo/marca oficial | ✅ Passou — busca por "logo", "nintendo", "bandai", "toei", "pokemon company", "game freak" em `src/`, `packs/`, `index.html`: zero ocorrências fora do próprio texto do disclaimer, que **cita** as marcas só para negar afiliação (exigência do ADR-007, não uso de marca) |
| 6 | ADR-007 — origem dos sprites de `packs/digimon-fan/sprites/` documentada | ✅ Passou — os 6 PNGs (`agumon`/`gabumon`/`patamon` × 2 frames idle, 48×48) são **byte-idênticos** (`md5sum`) aos de `art/sprites/digimon-fan/`, gerados por `art/src/agumon.js`, `gabumon.js`, `patamon.js` (pipeline Node puro, `canvas.js`+`png.js`, sem dependência externa). Cada arquivo `.js` tem comentário de origem explícito ("Drawn pixel-by-pixel from general/public visual memory... No official image, sprite, or file was fetched or traced"); `art/PIXEL_ART_DIRECTION.md` §0 e `packs/digimon-fan/README.md` documentam a mesma origem e a proibição de ripar arquivos oficiais |
| 7 | 1ª vitória ≤ 1:30 (GDD) | ✅ Passou — simulação determinística: 1ª vitória em **2 s** (tick 20 de 100 ms), bem dentro do limite |
| 8 | 1ª decisão real do jogador ≤ 2:00 (GDD) | ❌ **Falhou** — ver Bug #3 abaixo |
| 9 | Nenhuma derrota no início (GDD) | ✅ Passou nos 10 min simulados — ver nuance no Bug #3 (mecanismo diferente do descrito no GDD) |
| 10 | Save versionado, migração v1→v2, save corrompido | ✅ Passou — `tests/offline_save.test.ts` cobre round-trip determinístico, save corrompido preservado em `.corrupt`, recusa de versão futura/pacote errado, migração v1→v2 e migração encadeada genérica |
| 11 | Offline (teto, eficiência, determinismo, chefe abortado sem penalidade) | ✅ Passou — mesmo arquivo de teste; teto (`capHours`) aplicado e determinístico, eficiência < ganho online, decisão de chefe em andamento abortada sem penalidade ao voltar offline |
| 12 | Sprites 48 px sobrepostos em slots de 32 px | ⚠️ Confirmado — ver Bug #1 |
| 13 | Animação depende da taxa de atualização do monitor | ⚠️ Confirmado — ver Bug #2 |
| 14 | `tests/_sim_tmp.test.ts` | ✅ N/A — arquivo não existe em `tests/` (listagem confirmada); nada a reportar |

## Bugs (severidade, passos)

### Bug #1 — Sprites de 48 px sobrepõem slots vizinhos de 32 px (visual)
**Severidade: Média**

- **Onde:** `src/render/renderer.ts`. `ALLY_SLOTS` tem espaçamento vertical de **32 px** entre linhas (`[78,62]`, `[52,94]`, `[78,126]`), mas `drawUnit()` desenha o sprite do pacote em **tamanho nativo** (48×48 px para Agumon/Gabumon/Patamon), ancorado pela base, dentro de uma caixa lógica de só `size=20` px para aliados.
- **Passos para reproduzir:**
  1. `npm run dev`, abrir `http://127.0.0.1:5173/` (pack `digimon-fan`, padrão).
  2. Deixar o time em AUTO (ou usar Vel. x16) até o time evoluir de Baby II (Koromon/Tsunomon/Tokomon, bloco colorido, sem esse problema) para Child (Agumon/Gabumon/Patamon, sprite 48×48) — nível 8, ~16 min de jogo real em velocidade x1 (ver Bug #3 para o tempo exato).
  3. Observar a cena de batalha com os 3 parceiros em tela.
- **Resultado observado:** cálculo geométrico a partir das constantes do próprio renderer confirma sobreposição de caixa delimitadora entre o aliado 1 (slot `[78,62]`) e o aliado 2 (slot `[52,94]`): aliado 1 ocupa aproximadamente x∈[54,102], y∈[24,72]; aliado 2 ocupa x∈[28,76], y∈[56,104] — interseção de ~22×16 px. Visualmente os sprites se tocam/cruzam, prejudicando a leitura da cena (pilar 5 do GDD, "sem UI poluída/máximo 5 elementos legíveis").
- **Impacto:** só cosmético (não quebra o combate nem os testes), mas visível desde o momento em que qualquer criatura com sprite 48×48 entra em cena ao lado de outra. Afeta todas as 3 posições de aliados hoje (Agumon/Gabumon/Patamon), e vai piorar quando mais espécies ganharem sprite redesenhado.
- **Não corrigido** (fora do escopo desta QA); sugestão para o dev: ou aumentar o espaçamento dos slots para ≥ tamanho do maior sprite esperado, ou escalar o sprite para caber na caixa lógica atual (ex. desenhar em metade do tamanho, 24×24, mantendo a arte em 48×48 como fonte de alta resolução).

### Bug #2 — Animação idle depende da taxa de atualização do monitor (não do tempo real)
**Severidade: Baixa (cosmético; não afeta a simulação determinística)**

- **Onde:** `src/render/renderer.ts`. `this.frame` é incrementado **1 vez por chamada de `draw()`** (ou seja, 1 vez por `requestAnimationFrame`, não por unidade de tempo real). O frame do sprite idle é escolhido por `Math.floor(((this.frame + phase*7) * MS_PER_DRAW) / ms)`, com `MS_PER_DRAW = 1000/60` **fixo** (linha 25) — uma suposição hardcoded de 60 rAF/s.
- **Passos para reproduzir:**
  1. Rodar o jogo em 2 monitores/navegadores com taxas de atualização diferentes (ex. 60 Hz vs 120/144 Hz), ou simular limitação de frame rate (throttling de CPU/aba em segundo plano parcial).
  2. Observar a troca de frame do idle (2 frames por criatura, `spriteFrameMs` padrão 500 ms) nos dois ambientes.
- **Resultado esperado (se correto):** a animação trocaria de frame a cada 500 ms de tempo real, igual nos dois ambientes.
- **Resultado real:** como `this.frame` avança por quadro renderizado e não por `ms` reais, em uma tela de 120 Hz a animação roda **2× mais rápido** que em 60 Hz; em 30 Hz (aba em segundo plano parcial, janela pequena, ou hardware fraco) roda **2× mais lento**. Não foi possível confirmar visualmente em navegador real neste host (limitação de ambiente já documentada no `TECHNICAL_SPEC.md`); a conclusão vem da leitura do código-fonte (`this.frame++` em `draw()`, sem leitura de `performance.now()`/delta real nessa função).
- **Impacto:** só visual (idle), não afeta a simulação (`src/sim/` é determinística e não usa `this.frame`). Baixa severidade porque não quebra gameplay, save ou testes — mas é uma inconsistência de polish que pode ficar mais perceptível em monitores de alta taxa de atualização, comuns hoje.
- **Não corrigido** (fora do escopo desta QA); sugestão para o dev: derivar o avanço de frame do `dt` real acumulado no loop de `main.ts` (que já tem acumulador de tick), não de uma contagem de quadros de render.

### Bug #3 — "1ª decisão real" do GDD não ocorre em até 2:00 (nem em 10 min) com o motor atual
**Severidade: Alta**

- **Onde:** comparação entre `GDD_PROTOTYPE_B.md` (seção "Onboarding — minuto a minuto") e o motor implementado (`src/sim/game.ts`, `src/sim/battle.ts`).
- **O que o GDD pede:** Decisão #1 (escolher 1 dos 3 parceiros, 0:00–0:30), Decisão #2 (escolher qual Digimon selvagem enfrentar — Varredura, 1:30–2:00), Decisão #3 (alocar 1 Ponto de Treino no 1º level-up, 3:00–4:30), Decisão #4 (Sincronia num mini-chefe sem risco, 4:30–6:00).
- **O que o motor tem hoje (confirmado em `TECHNICAL_SPEC.md`, tabela "Decisões do jogador implementadas", e por leitura de código):** só **4 comandos de decisão** existem — `chooseDecision` (Sincronia, só dentro de luta de chefe), `chooseEvolution` (ramo ofensivo/defensivo), `challengeBoss`, `travelTo`. **Não existem** escolha de parceiro inicial (o save já começa com os 3: Koromon+Tsunomon+Tokomon, `theme.startingParty`), escolha de Varredura/encontro, nem alocação de Ponto de Treino — a Varredura e o Ponto de Treino do GDD são "dados modelados, não implementados" (tabela do `TECHNICAL_SPEC.md`).
- **Passos para reproduzir (medição):** simulei os primeiros 10 min de jogo (6000 ticks de 100 ms) chamando `newGame`+`step` do motor real sobre o pack `digimon-fan`, sem nenhuma ação manual do jogador (equivalente a deixar o AUTO rodando sem tocar em nada, que é o próprio core loop do jogo):
  - Resultado: **nenhum evento `decision` nem `evolution_ready`** ocorre nos primeiros 10 minutos. O time sai do nível 1 e chega ao **nível 6** em 10 min, ainda no estágio Baby II (sem sprite redesenhado), só com vitórias automáticas na Zona 1 (`campo_de_bits`).
  - Estendendo a simulação: o primeiro evento de decisão real alcançável sem viagem manual (`evolution_ready`, nível 8, que libera a escolha de Modo ofensivo/defensivo) só ocorre em **≈16 min 5 s** (tick 9649) — muito além dos 2:00 pedidos pelo GDD, e além da própria janela de 10 min analisada pela tarefa.
  - A decisão de Sincronia de chefe (a outra decisão implementada) exige viagem manual até a Zona 2 (desbloqueia em nível 6) e pelo menos 10 vitórias contra inimigos Child antes de liberar o chefe — não ocorre de forma passiva e certamente não antes de 2:00.
- **Nuance sobre "nenhuma derrota no início" (item 9 da tarefa):** nos 10 min simulados, 0 derrotas (`battlesLostCounter: 0`) — mas o mecanismo real difere do GDD: o GDD descreve uma "cura automática única de 30% HP a ≤15% HP, 1x por sessão" (seção "Curva de dificuldade"); esse mecanismo **não existe no código** (`grep` por `0.15`/cura de emergência não encontra nada ligado a isso). O que existe de fato é `restHealPct: 1` na Zona 1 (cura total entre combates) somado a "derrota nunca custa progresso, cura total e recua" (`finishBattle` em `game.ts`) — resultado funcional equivalente ou mais seguro que o pedido pelo GDD, só implementado de forma diferente da descrita.
- **Impacto:** o onboarding real do jogo (tal como ele roda hoje, sem tela de título, sem nome de Tamer, sem escolha de parceiro, sem NPC-guia, sem overlay de tutorial — nenhum desses elementos existe em `index.html`/`src/main.ts`/`src/ui/hud.ts`) não cumpre o ritmo de decisões prometido pelo GDD para os primeiros 10 minutos. O jogador real, abrindo o jogo, vê o time de 3 já caçando automaticamente e não tem nenhuma decisão própria a tomar por ~16 minutos (ou mais, se não notar e viajar manualmente para a Zona 2). Isso vai direto contra o pilar 1 do GDD ("fácil de começar, impossível de ignorar... o jogo sempre tem 1-2 decisões táticas reais pendentes").
- **Não corrigido** (fora do escopo desta QA, e já é risco conhecido e listado em `TECHNICAL_SPEC.md`: "Mecânicas do GDD que o motor ainda não tem... entram como sistemas ligados por dados", probabilidade "Certa"). Reporto aqui porque a tarefa pediu a comparação explícita com os marcos de tempo do GDD, e o marco de "1ª decisão ≤ 2:00" **falha** na medição real, não só na hipótese.

## Riscos residuais

- **[E]** Sem verificação visual em navegador real neste host (Chromium headless não inicia, falta `libnspr4`) — os Bugs #1 e #2 foram confirmados por leitura de código e cálculo geométrico/temporal a partir das constantes reais do renderer, não por screenshot. Recomenda-se teste manual em navegador antes de qualquer aprovação de publicação.
- **[H]** Todos os valores de balanceamento fora de Baby II/Child da Zona 2 (já ajustados e validados por simulação em 2026-11-08, conforme `GDD_PROTOTYPE_B.md`) continuam não testados com jogador humano real — herdado, não uma descoberta desta QA.
- **[H]** O gap do Bug #3 é conhecido pelo estúdio (listado como risco "Certa" no `TECHNICAL_SPEC.md`), mas não constava medido com números reais até esta QA; o risco de o protótipo não "provar" o pilar de onboarding do GDD em qualquer demo/playtest permanece até draft de time, Varredura e alocação de treino serem implementados.
- Nenhum risco de conformidade ADR-007 encontrado (itens 3–6 da tabela de casos todos passaram).

## Evidências (logs, prints, comandos)

- `npm test` (dentro de `prototype/game/`): `Test Files 6 passed (6)` / `Tests 47 passed (47)`.
- `npm run build`: `tsc --noEmit` sem saída de erro; `vite build` → `dist/assets/index-*.js 56.56 kB │ gzip: 18.38 kB` + `index-*.css 1.89 kB`.
- `md5sum` dos 6 PNGs de `packs/digimon-fan/sprites/` vs `art/sprites/digimon-fan/`: idênticos nos 6 arquivos.
- `file` nos mesmos PNGs: todos `48 x 48`.
- Simulação determinística (script temporário `vite-node`, executado e removido ao final desta QA — não commitado, escopo de escrita respeitado):
  - Primeiros 10 min (6000 ticks × 100 ms), pack `digimon-fan`, `newGame`+`step` sem input manual: 1ª vitória no tick 20 (2 s); 0 eventos `decision`/`evolution_ready`; 0 derrotas; níveis finais do time = 6/6/6 (Koromon/Tsunomon/Tokomon).
  - Simulação estendida a 30 min: `evolution_ready` ocorre no tick 9649 (≈964,9 s ≈ 16 min 5 s), níveis 8/8/8.
- `grep` de guarda (rede/telemetria/logo/marca) em `src/`, `packs/`, `index.html`: só ocorrências esperadas dentro do texto do próprio disclaimer.
- Confirmação de ausência: `find . -name "_sim_tmp*"` dentro de `prototype/game/` (excluindo `node_modules/`) não retornou nenhum arquivo.

## Veredito: **aprovado com ressalvas**

Motor, testes automatizados, build e conformidade ADR-007 (rede/anúncio/telemetria, aviso visível, sem logos, origem de sprites documentada) estão sólidos — nenhum bug bloqueante de engenharia encontrado. A ressalva é de **design/conteúdo, não de motor**: o ritmo de decisões prometido pelo GDD para os primeiros 10 minutos (Decisões #1–#4 do onboarding) ainda não está implementado, então o protótipo hoje não demonstra o pilar central do GDD ("sempre 1-2 decisões reais pendentes") dentro da janela testada — o jogador fica sem nenhuma decisão própria por ~16 minutos de jogo passivo. Recomendo não usar este protótipo para validar o onboarding com jogador real até que ao menos a escolha de parceiro inicial e a Varredura (ou um substituto funcionalmente equivalente) estejam implementados; os demais sistemas (save, offline, migração, afinidades, chefe, masmorra modelada) estão prontos para esse tipo de teste.

## Limitações desta QA

- Sem navegador real neste host — Bugs #1 e #2 confirmados por análise de código/geometria, não por observação visual direta.
- Não executei playtest manual nem testei a Linha A (`original-a`, stub) ou `original-b` em profundidade — fora do pedido desta tarefa, que era focado no pack `digimon-fan` e nos itens 1–5 listados.
- Não revisei a qualidade artística/fidelidade visual dos sprites (se "parecem" Agumon/Gabumon/Patamon) — só a origem/procedência (geração por código, sem arquivo oficial), que era o que o ADR-007 exige verificar.
- Não corrigi nenhum código, conforme instrução da tarefa; todos os achados acima são apenas relatados.
