# Technical Spec — GS-003 Protótipo (motor data-driven, Linha B primeiro)

> Template Game Studio. Datas em ISO. Marque afirmações como **[E]** evidência (com fonte) ou **[H]** hipótese.

- **Projeto:** GS-003 (PROTOTYPE — ADR-006)
- **Autor (agente):** game-dev
- **Data:** 2026-11-08
- **Status:** rascunho v2: motor + content packs (ADR-007). A v1 tinha um conteúdo único por "linha".

## Objetivo técnico

Um motor de idle-RPG de monstros no navegador que:

1. roda batalha automática 3v3 sem input, com **pausas de decisão** (habilidade de sincronização no chefe, ramo de evolução);
2. separa **simulação determinística** (TypeScript puro, tick fixo) da **renderização** (Canvas 2D pixel art + HUD em DOM);
3. calcula **progresso offline com teto** e guarda tudo em **save versionado** no `localStorage`;
4. lê **todo o conteúdo de um content pack trocável** (`packs/<id>/`): monstros, nomes, evoluções, habilidades, inimigos, áreas, masmorra, textos de interface, paleta, sprites e balanceamento. O motor (`src/`) não contém nenhum nome, texto de jogo ou arte. Assim o fan game (ADR-007: Digimon na Linha B, Pokémon na Linha A) e uma futura versão com monstros originais usam o **mesmo código**; trocar de pacote não exige mexer em código.

Critério de saída do protótipo (ADR-006): o jogador volta para *decidir*. O esqueleto já tem 2 decisões reais (sync no chefe, ramo de evolução); draft de time e rotas de masmorra estão modelados em dados, não implementados (ver Riscos).

## Stack e justificativa

**Escolha: TypeScript + Vite + Canvas 2D "vanilla" (sem engine) + Vitest.** HUD/menus em DOM.

| Opção | Prós | Contras para este protótipo |
|---|---|---|
| Phaser 3/4 | Engine completa (cenas, tweens, input, loader, pixelArt: true) **[H]** | ~1 MB+ de bundle **[H]**; o "jogo" de um idle é 80% UI de menus, onde o Phaser não ajuda; o loop/estado do Phaser tende a misturar sim e render; **não instalável neste ambiente hoje** **[E]** (`npm view phaser` → `E403 Forbidden` via proxy de egress, 2026-11-08; pacote ausente do cache npm local) |
| PixiJS | Renderer WebGL rápido, ótimo para muitos sprites **[H]** | Só renderer (precisaríamos montar o resto igual); WebGL é desnecessário para ≤ 7 sprites em cena; **não está no cache local** **[E]** |
| Excalibur | Engine TS-first, boa ergonomia **[H]** | Comunidade menor que Phaser **[H]**; mesma questão de acoplamento sim/render; **não está no cache local** **[E]** |
| **Vanilla Canvas 2D + TS/Vite** | Zero dependência de runtime; bundle atual **53,9 kB (17,6 kB gzip) com 3 content packs** **[E]** (saída do `npm run build`); controle total do pixel: resolução lógica 320×180 ampliada por **fator inteiro** + `imageSmoothingEnabled=false` + `image-rendering: pixelated` = sem blur; a simulação roda igual em Node (testes, offline) e no navegador | Sem tweens/sprite-sheet/áudio prontos — teremos que escrever (pequeno para o escopo do protótipo) |

Motivos da decisão:
- **Separação sim/render por construção:** `src/sim/` não importa nada de DOM/canvas; o renderer só lê estado + eventos. Isso é o que torna offline, testes e determinismo baratos — e é independente de engine.
- **Pixel art nítido** é trivial em Canvas 2D com escala inteira **[E]** (implementado em `src/render/renderer.ts`, `fit()`; capturas em `docs/screens/`).
- **Portas abertas:** o renderer é uma classe isolada (`BattleRenderer`, ~170 linhas). Se o protótipo validar e precisarmos de partículas/animações ricas, trocar por PixiJS ou Phaser afeta só `src/render/` — sim, conteúdo, save e testes ficam intactos.
- Dependências apenas de desenvolvimento, todas populares e open source: `typescript 5.9.3`, `vite 7.3.7`, `vitest 3.2.7`, `jsdom 26.1.0` (smoke test do shell). Instaladas a partir do cache npm local (`npm install --offline`) porque o registro está bloqueado neste host **[E]**.

## Componentes

```
game/
├─ packs/                  ← CONTENT PACKS (descobertos automaticamente)
│   ├─ digimon-fan/        fan pack Linha B (padrão; ADR-007)
│   ├─ original-b/         monstros originais Linha B (GDD: Pixelume…)
│   └─ original-a/         stub original Linha A
├─ src/sim/                ← SIMULAÇÃO: puro TS, determinístico, roda em Node
│   ├─ types.ts            tipos de conteúdo, estado, eventos
│   ├─ rng.ts              PRNG mulberry32, estado no GameState
│   ├─ formulas.ts         stats por nível, curva de XP, dano, afinidade
│   ├─ content.ts          buildContent(): indexa + valida pacote (refs, strings, sprites, regras de fan pack)
│   ├─ strings.ts          chaves de texto obrigatórias + fmt()
│   ├─ battle.ts           batalha ATB 3v3, IA automática, pausas de decisão
│   ├─ game.ts             newGame, step (1 tick), comandos do jogador
│   ├─ offline.ts          progresso offline com teto
│   └─ save.ts             envelope versionado, migrações, StorageLike
├─ src/render/             ← RENDER: Canvas 2D 320×180, escala inteira
├─ src/ui/hud.ts           ← HUD/menus em DOM (lê estado, emite comandos)
├─ src/packs.ts            ← descoberta automática de packs/*/ (import.meta.glob)
├─ src/main.ts             ← shell: relógio, rAF + acumulador, autosave, offline
└─ tests/                  ← vitest: sim, todos os packs jogáveis, guarda sem rede, smoke test jsdom
```

### Loop e tempo
- **Tick fixo:** `balance.tickMs = 100` (10 Hz). `step(content, state)` avança exatamente 1 tick.
- **Shell:** `requestAnimationFrame` com acumulador (`acc += dt × speed`; consome ticks de 100 ms; no máx. 240 por frame para evitar espiral da morte). Velocidade x1/x4/x16 para teste. O renderer recebe o timestamp do rAF (`draw(state, now)`): idle de sprites, bob, grade, flash, avanço e números de dano são medidos em ms reais, iguais em 30/60/120/144 Hz (`tests/render_layout.test.ts`).
- **Layout 320×180:** slots ancorados pelos pés em triângulo (líder à frente, 2 atrás em colunas separadas), espelhados para inimigos; cabem 6 sprites de 48 px + barra de HP + nível sem sobreposição (teste geométrico em `tests/render_layout.test.ts`). A barra de HP fica sob os pés, centrada, com 24–36 px de largura.
- **Determinismo:** sem `Date.now()`/`Math.random()` na sim; RNG com estado no save; ordem de avaliação fixa (aliados → inimigos, por índice). Teste: mesma semente ⇒ estado idêntico após 3000 ticks; save → load → +500 ticks ⇒ idêntico ao que não salvou.
- **Eventos:** cada `step` devolve `GameEvent[]` (`act`, `ko`, `decision`, `reward`, `level_up`, `evolution_ready`…). Render/HUD consomem para efeitos e log; eventos **não** são salvos.

### Batalha (ATB)
- Cada combatente vivo soma `spd` à barra a cada tick; ao atingir `gaugeMax` age.
- IA automática: primeira habilidade da lista fora de recarga (cura só se algum aliado < 60% HP), senão ataque básico (`balance.basicSkillId`). Alvo: inimigo com menor HP%.
- Dano: `power% × ATK × K/(K+DEF) × afinidade × variância(±10%)`, mínimo 1.
- **Pausa de decisão de chefe:** `boss.decisionAtHpPct` (ex. `[100, 50]`). Ao cruzar o limiar, a batalha **e o mundo** congelam (`step` retorna `[]`) até `chooseDecision(i)`; a habilidade de sincronização escolhida é aplicada pelo Tamer (ATK médio do time).
- `boss.lethal=false` ⇒ aliados nunca caem abaixo de 1 HP (chefe tutorial com "dano travado", ADR-006 §5).
- **Derrota nunca custa progresso:** time recua, cura total, XP/bits/nível intactos (teste dedicado).

### Decisões do jogador implementadas
| Decisão | Onde | Status |
|---|---|---|
| Habilidade de sincronização no chefe | `chooseDecision` | ✅ |
| Ramo de evolução (2 caminhos por parceiro) | `chooseEvolution` | ✅ |
| Desafiar chefe (após N vitórias) / revanche | `challengeBoss` | ✅ |
| Viajar entre áreas (com `unlock` por nível/chefe) | `travelTo` | ✅ |
| Parceiro inicial: 1 de N (`theme.starterOptions`); o mundo espera a escolha | `chooseStarter` | ✅ |
| Varredura guiada: a cada N vitórias, escolher 1 de 2 ondas (`area.encounterChoice`); sem resposta, a opção 0 entra após `autoPickAfterTicks` | `chooseEncounter` | ✅ |
| Varredura: +`pctPerEncounter`% por encontro resolvido; a próxima vitória após 100% recruta a espécie (`enemy.recruitAs`) até `partyMax` | automático (`balance.scan`) | ✅ |
| Ponto de Treino por level-up, alocado em ATK/DEF/VEL (+`pctPerPoint`% no stat) | `allocateTraining` (`balance.training`) | ✅ |
| Draft/reordenação de time (Banco de Parceiros) / rotas de masmorra | dados modelados (`dungeons.json` → `routes`) | ⏳ |

Todos os sistemas acima são opcionais por dados: pacote sem os campos joga como antes (`original-a`/`original-b` não mudaram). `pendingChoices(state)` lista as decisões abertas; `DECISION_EVENTS` são os eventos que abrem uma nova. `tests/onboarding_pacing.test.ts` simula os 10 primeiros minutos do `digimon-fan` (3 parceiros × 3 seeds, jogador com 3 s de reação) e exige 1ª escolha de encontro ≤ 2:00, nenhum intervalo > 3:00 entre decisões e 0 derrotas.

Proteções de início por dados (`areas.json`): `enemiesMaxParty` (onda nunca traz mais selvagens que criaturas no time) e `enemyLevelMaxAboveParty` (nível inimigo ≤ maior nível do time + N).

## Modelo de dados

### Content pack

Um content pack é uma pasta `packs/<id>/` com 9 arquivos JSON e, opcionalmente, `sprites/*.png` e `README.md`. `src/packs.ts` descobre as pastas sozinho (`import.meta.glob`): **para adicionar, remover ou trocar um pacote basta mexer na pasta, sem tocar no código.** Tudo é validado em `buildContent()`: ids duplicados, referências quebradas, afinidades desconhecidas, evolução que não sobe de estágio, 1–3 inimigos por onda, **todas as chaves de texto presentes**, **sprites declarados existentes** e **regras de fan pack**. Pacote inválido falha no boot e no `npm test`.

| Arquivo | Conteúdo | Campos-chave |
|---|---|---|
| `pack.json` | manifesto | `id, name, version, kind ("fan"/"original"), line ("A"/"B"), default?, nonCommercial, disclaimer?, sources[], credits[]`. **`kind: "fan"` exige `nonCommercial: true` e `disclaimer`** (ADR-007, condições 1 e 3); o aviso aparece sempre no rodapé |
| `strings.json` | todos os textos de interface | ~37 chaves obrigatórias (`REQUIRED_STRINGS` em `src/sim/strings.ts`), com placeholders `{xp}`, `{name}`… O idioma também vem do pacote |
| `theme.json` | identidade visual e regras de afinidade | `affinities` + `affinityChart` (matriz de vantagem), `palette`, `startingParty`, `startingLevel`, `startingAreaId`, `starterOptions?` (escolha de 1 parceiro; ignora `startingParty`) |
| `balance.json` | números globais | `tickMs`, `gaugeMax`, `damageModel` (`ratio` ou `subtractive` do GDD), `defenseK`/`defenseMult`, `damageVariance`, `critChance`/`critMult`, `xpCurve`, `maxLevel`, `ticksBetweenBattles`, `offline {capHours, minSeconds, efficiency, sampleTicks}`, `scan? {pctPerEncounter, partyMax}`, `training? {pointsPerLevel, pctPerPoint, capPerCreature}` |
| `creatures.json` | espécies jogáveis | `id, name, affinity, stage, color, sprite? (caminho ou lista de frames idle), spriteFrameMs?, baseLevel?, base{hp,atk,def,spd}, growth{…}, skills[], evolutions[{to, level, label}], flavor?` (`baseLevel` implementa a fórmula do GDD: stats contados a partir do nível inicial do estágio) |
| `skills.json` | habilidades | `id, name, kind (damage/heal/guard), target (enemy/all_enemies/ally_lowest/all_allies), power, cooldownTicks, durationTicks?, affinity?` |
| `enemies.json` | inimigos e chefes | como criatura + `size ("boss")`, `xp`, `bits`, `recruitAs?` (espécie recrutada pela Varredura) |
| `areas.json` | zonas de caça | `levelRange`, `unlock? {minPartyLevel, bossDefeatedIn}`, `restHealPct` (cura entre combates), `waves[{enemies[], weight}]`, `encounterChoice? {firstAfterWins, everyWins, autoPickAfterTicks}`, `enemiesMaxParty?`, `enemyLevelMaxAboveParty?`, `boss{enemyId, level, escorts[], unlockAfterWins, lethal, decisionAtHpPct[], syncOptions[], reward}` |
| `dungeons.json` | masmorra roguelite | `hpPersists`, `floors[{levelBonus, wavesToClear, waves[], routes[{healPct, rewardMult, corruption}]}]`, `boss{…}`, `corruptionAtkPerPoint` |

Exemplo (trecho real de `packs/digimon-fan/pack.json`):
```json
{ "id": "digimon-fan", "name": "Digimon (fan pack)", "version": "0.1.0", "kind": "fan", "line": "B",
  "default": true, "nonCommercial": true, "disclaimer": "Fan game não oficial e sem fins comerciais. …" }
```

### Pacotes existentes

| Pacote | Conteúdo | Origem |
|---|---|---|
| `digimon-fan` (padrão) | 12 espécies (Koromon/Tsunomon/Tokomon → Agumon/Gabumon/Patamon → Greymon/Garurumon/Angemon em modo ofensivo ou defensivo), atributos Vacina/Dado/Vírus (+ Livre para os não confirmados), 2 áreas (Campo de Bits; Distrito Metálico com chefe Devimon), masmorra Brecha Instável com Devimon (força plena), 3 Sincronias | Nomes, atributos, golpes e stats dos Adultos e do chefe: `prototype/data/content-pack-digimon-oficial.json` e `bosses.json` (game-design). **Stats de Baby II/Child, inimigos e potências: placeholder do game-dev.** Sprites redesenhados pelo game-art (idle 2 frames) só para Agumon/Gabumon/Patamon; demais espécies e inimigos em bloco colorido |
| `original-b` | 12 espécies originais do GDD (Pixelume→Pixelar→Luminar Lâmina/Escudo etc.), protocolo Estável/Errático/Fluido, 1 área, chefe Sentinela-Bastião | `GDD_PROTOTYPE_B.md`. É a prova da "versão com monstros originais" e o pacote usado nos testes de regra do motor |
| `original-a` | stub de 3 criaturas `[PH]` da Linha A | só para provar o tema da Linha A |

A Linha A com Pokémon oficiais (`pokemon-fan`) ainda **não existe**: falta o conteúdo de design. É só criar a pasta com os 9 JSON; o código não muda.

## Como o motor serve às Linhas A e B (fan e original)

- O motor não contém nome, texto, arte nem regra específica de pacote. Fora de `packs/` não aparece nenhum id de pacote; a única exceção é a migração de save v1→v2, que mapeia as antigas "linhas" para `original-a` e `original-b`.
- O pacote é escolhido por `?pack=<id>`, ou cai no que tem `"default": true`. O HUD tem um seletor com todos os pacotes descobertos.
- **Gerar a versão com monstros originais:** apagar ou desativar `packs/digimon-fan/` (e `pokemon-fan/`, quando existir) e marcar um pacote `original-*` como `default`. O build resultante não contém nenhum conteúdo de terceiros, porque o Vite só empacota o que está em `packs/`.
- Os saves são separados por pacote (`gs003.save.<packId>`, com `packVersion` no envelope). O save de outro pacote é recusado.
- Diferenças **de sistema** que um pacote precisar (ex.: captura na Linha A, Carga/Varredura do GDD) entram como sistema opcional ligado por dados, nunca como `if (pack === "…")`.
- Testes `tests/packs_playable.test.ts` rodam **todo pacote descoberto** no mesmo motor: 10 min sem wipe na zona inicial, chegar ao 1º chefe e vencê-lo em até 2 h de jogo, offline funcionando.

## APIs / integrações

Nenhuma. Sem backend, sem analytics, sem anúncios, sem loja, sem serviços externos. Tudo local no navegador.

**Sem monetização, anúncios nem telemetria (ADR-007):** `tests/no_network.test.ts` falha se o código (`src/`, `index.html`) usar `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, URLs `http(s)://` ou SDKs de analytics/anúncio. Também falha se algum pacote tiver campos de loja, preço, IAP, anúncio ou telemetria.

## Persistência e offline

**Save** (`src/sim/save.ts`):
- `localStorage["gs003.save.<packId>"] = { v: SAVE_VERSION, savedAt, pack, packVersion, state }` (JSON).
- `SAVE_VERSION = 3`. Migrações encadeadas `MIGRATIONS[n]: envelope vN → vN+1`: 1→2 (v1 usava `line`) e 2→3 (campos das decisões do onboarding; save antigo já tem time, então não pede parceiro de novo), ambas testadas. Versão futura é recusada; migração ausente é erro explícito.
- Save corrompido não é sobrescrito em silêncio: cópia em `<key>.corrupt` e jogo novo.
- Autosave a cada 10 s, ao ocultar a aba (`visibilitychange`) e em `pagehide`. Botão "Salvar" manual.
- `StorageLike` injetável ⇒ testado com storage em memória.

**Offline** (`src/sim/offline.ts`, estratégia *amostra + extrapolação*):
1. `elapsed = agora − lastSeenAt`; abaixo de `minSeconds` (60 s) não faz nada.
2. Credita `min(elapsed, capHours)`. O teto vem do pacote: 4 h no `digimon-fan`, conforme o GDD, e 8 h nos originais (placeholder).
3. Simula de verdade uma cópia do estado por até `sampleTicks` (6000 = 10 min de jogo), só farm de rotina: **sem chefes, sem decisões** (ficam para quando o jogador volta; chefe em andamento é abortado sem penalidade).
4. Escala XP/bits/vitórias/abates da amostra para o tempo creditado × `efficiency` (0,5 placeholder) e aplica com as mesmas regras online (level-up, evolução fica pendente).
- Custo constante: 8 h de offline calculam em ~6–7 ms **[E]** (medido com `vite-node` neste host, 2026-11-08). Determinístico para o mesmo save + mesmo tempo.
- Também é usado ao voltar para uma aba que ficou oculta > 5 s (rAF para em segundo plano).
- Limitação conhecida: a extrapolação é linear sobre o nível da amostra (não acelera com os níveis ganhos durante o offline) — conservador, intencional.

## Segurança

- Sem rede, sem segredos, sem login, sem coleta de dados (guarda automatizada em `tests/no_network.test.ts`).
- IP (ADR-007): fan packs só carregam com `nonCommercial: true` + `disclaimer`; nenhum arquivo oficial (sprite, som, ROM) entra no repositório. Sprites de fan pack precisam ser redesenhados pelo estúdio. Save é texto local editável pelo jogador — aceitável para single-player sem economia real; antes de qualquer monetização/ranking, validação no servidor seria obrigatória **[H]**.
- HUD escapa todo texto de conteúdo antes de inserir em `innerHTML` (`esc()`).
- Validação de conteúdo impede JSON malformado de quebrar o jogo em runtime.

## Performance

- Bundle de produção: **53,9 kB JS (17,6 kB gzip) + 1,9 kB CSS** **[E]** (`npm run build`, 2026-11-08). Inclui os 3 packs; cada pacote fica em ~7 kB gzip **[H]**.
- Sim: 1 tick = no máximo 7 combatentes; 5 min de jogo (3000 ticks) simulados em poucos ms nos testes **[E]** (suite inteira com 46 testes em ~1–2 s).
- Render: Canvas 2D 320×180 com `fillRect`; desprezível. HUD em DOM só re-renderiza quando o estado visível muda.

## Infra e custos

R$ 0. Sem deploy (proibido sem aprovação do fundador). `npm run build` gera `dist/` estático, servível por qualquer host estático **quando** houver aprovação.

## Riscos técnicos

| Risco | Prob. | Mitigação |
|---|---|---|
| Canvas vanilla ficar curto para animações/partículas da versão "bem bonita" | Média **[H]** | Renderer isolado; migrar `src/render/` para PixiJS/Phaser sem tocar na sim |
| Números placeholder distorcerem o teste de diversão | Alta | Todo balanceamento em JSON; game-design ajusta sem código; testes não dependem de valores exatos |
| **`digimon-fan`: Distrito Metálico (abre no Nv 6, inimigos Nv 6–13, como no GDD) derrota o time Nv 6 ~7 vezes seguidas** | Ocorrendo **[E]** (`tests/packs_playable.test.ts`, log `[digimon-fan] derrotas até o 1º chefe: 7`) | Sem perda de progresso, mas é muro de frustração. Ajustar no pacote (stats de Baby II/Child ou `unlock.minPartyLevel`) com game-design |
| Mecânicas do GDD que o motor ainda não tem (passivas, Carga, modo de evolução por Dados-Linha/Ruído, Banco de Parceiros, mini-chefe tutorial, nome do Tamer/NPC-guia) | Certa | Listadas em `packs/digimon-fan/README.md`; entram como sistemas ligados por dados |
| Risco de remoção (DMCA/C&D) se o fan game for publicado | Aceito pelo fundador (ADR-007) | Conteúdo de terceiros isolado em `packs/*-fan/`; build original = apagar a pasta |
| Registro npm bloqueado neste host | Ocorrendo **[E]** | Deps fixadas em versões presentes no cache; `package-lock.json` versionado |
| Extrapolação offline divergir do online em áreas com risco de derrota | Baixa | Amostra real (inclui derrotas); eficiência < 1; teste compara offline vs online |
| Save do `localStorage` apagado pelo navegador | Média **[H]** | Fora do escopo do protótipo; futuro: exportar/importar save em texto |
| Sem verificação visual em navegador real neste host | Ocorrendo **[E]** | Chromium headless não inicia (falta `libnspr4`); coberto por smoke test jsdom + render real via `@napi-rs/canvas` (capturas em `docs/screens/`). Requer teste manual em navegador |

## Estimativa de esforço

| Item | Esforço **[H]** |
|---|---|
| Esqueleto atual (sim, render placeholder, save, offline, testes) | feito |
| Encaixar conteúdo do GDD (JSON + ajustes de schema) | 0,5–1 dia |
| Draft de time (roster > 3) + alocação de treino | 1–1,5 dia |
| Masmorra roguelite (andares, HP persistente, rotas) — dados já modelados | 1,5–2 dias |
| 2ª área + seleção de área + onboarding guiado (10 min) | 1–1,5 dia |
| Sprites pixel reais + sprite sheet + animações básicas | depende de arte; integração 0,5–1 dia |
| Áudio, polimento, teste interno | 1–2 dias |
