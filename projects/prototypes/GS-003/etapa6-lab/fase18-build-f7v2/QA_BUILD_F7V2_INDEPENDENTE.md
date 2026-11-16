# QA INDEPENDENTE: build isolado da F7v2 (Comando 12.2, porta 5196)

**Digital Odyssey (GS-003) · game-qa (Opus 5.5) · 2026-11-14, ~22:30–00:30 · custo PixelLab: 0**
Objeto: o build `dist-lab-f7v2` servido em http://127.0.0.1:5196 (`gs003-lab-f7v2-5196`), contra `BRIEF_COMANDO_12_2_BUILD_F7V2.md`, o `RELATORIO_BUILD_F7V2.md` do game-dev, o `pacote.json` e o `projetil.json` da F7v2 e o meu `fase17-f7-hibrido/v2/QA_F7V2_INDEPENDENTE.md` (linha de base: 7,7 / 7,8, fora do jogo).
Legenda: **[E]** executado nesta auditoria · **[L]** de relatório anterior, não reverificado · **[H]** hipótese ou julgamento · **NÃO VALIDADO**, com o motivo.
Fangame independente, não oficial e não licenciado; uso só local. **Só este arquivo foi criado na pasta.** Não alterei código, assets, `PROGRESS.md` nem serviços; não reiniciei nada. Para testar o jogo principal, servi o `dist/` dele **só para leitura** numa porta temporária (5199, `python3 -m http.server`), encerrada no fim.
Roteiros do QA (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_build_f7v2/` (`lib.mjs`, `run.mjs`, `analyze.mjs`, `combat.mjs`, `cmb_an.py`, `iso.mjs`, `walk5191.mjs`, `walkrate.mjs`, `impact.mjs`, `bbox.mjs`, `diag.mjs`, `sheet.mjs`, `zoom.mjs`). Saídas: `workspaces/game-qa/tmp/qa_build_f7v2/` (`f7v2/`, `cmb_f7v2/`, `cmb_f2b/`, `iso/`, `impacto/`, `walkrate.json`, `combate_analise.json`).

## 0. Veredito

| | Média dos 8 critérios (Comando 12 §5) | Meta 8 | GS-010 |
|---|---|---|---|
| F7v2 fora do jogo (QA anterior) [L] | 7,69 ≈ 7,7 | não | não |
| **F7v2 no jogo (este QA)** [E/H] | **7,50** | **não** | não |

- **A integração técnica está correta no que o brief pediu** [E]: canvas 60×60, âncora exata (0 px de desvio nos quadros estáveis), tempos do ataque e do idle iguais aos do pacote (quantizados a 60 Hz), projétil criado **no mesmo quadro de rAF** do quadro de disparo nas 4 direções, com o centro da bola **sobre a origem da boca** (E/W/N: 0 px; S: ≤ 0,5 px, dentro do erro da medida), **atrás no N e na frente em S/E/W**, voo a ~150 px/s e explosão no fim do alcance. **0 erros de console** em todas as rodadas. Lab A, jogo principal e F2b (`&agumon=v8`) intactos.
- **No jogo, a nota cai 0,2 em relação à F7v2 fora dele.** Quatro achados novos, que o relatório do game-dev não traz ou descreve de outro jeito:
  1. **QA-B1 (P1 para o objetivo do teste): a walk toca a ~2,5× da cadência do pacote.** Cada quadro da walk F7v2 dura em média **42–44 ms** no jogo (F2b: **104–114 ms**), com 7 quadros pulados em 135 trocas. O motivo é o avanço por distância (3 px por quadro) com a parceira andando a ~73 px/s, quando o pacote foi feito para 27 px/s. O pé não escorrega, mas o ciclo inteiro dura ~350 ms. **A walk S experimental, que é o que o Vitor vai julgar, aparece bem mais rápida que a do F2b, então a comparação fica desigual.**
  2. **QA-B2 (P2): todos os golpes do Agumon soltam o Pepper Breath e perdem o próprio efeito.** O Agumon Nv.20 **não tem Pepper Breath equipado**: os golpes são `mach_jab`, `uppercut`, `baby_burner` e `triple_baby_flame`. **O golpe 2 é o Uppercut**, não o Pepper Breath, como dizem o brief da QA e o relatório. Mach Jab e Uppercut (físicos) mostram uma bola de fogo saindo da boca; Triple Baby Flame mostra uma bola, não três; e os efeitos genéricos (`multi_hit_flurry`, `claw_slash`, `fireball`) deixam de ser desenhados para esse Agumon. No F2b os efeitos continuam (o fogo pintado no sprite também aparece em todo golpe, então parte disso já existia).
  3. **QA-B3 (P3): a ordem de desenho muda no meio do voo quando o fogo cruza o Tamer.** No S, a bola passa **atrás** da cabeça do Tamer, some e reaparece **na frente** do peito dele (§4.3).
  4. **QA-B4 (P3): no S e no N, o nome do Tamer ("Kaio Nv.12") fica por cima do corpo do Agumon**, porque a parceira anda logo atrás dele. No S, isso cobre as mãos e a área onde o fogo nasce. É comportamento do Lab A, não da F7v2, mas atrapalha justamente o ataque S.
- **Pronto para o ChatGPT:** **sim**, como candidata, com este QA e os quatro achados acima.
- **Pronto para o Vitor:** **com condições.** Antes de mandar o link, recomendo duas coisas, ambas sem mexer em pixel e sem gerar nada:
  - (a) **corrigir as instruções**: o golpe 2 é o Uppercut, e qualquer golpe mostra o Pepper Breath;
  - (b) **decidir a cadência da walk (QA-B1)**: uma delas é deixar o ciclo perto de 110 ms, ou igual ao F2b, para a comparação ser justa, aceitando algum escorregão do pé. Se for mandado como está, o Vitor precisa saber que a walk F7v2 está ~2,5× mais rápida que a do F2b.

## 1. Build testado e método [E]

| Item | Valor |
|---|---|
| Worktree / branch / commit | `workspaces/game-dev/lab-f7v2`, `lab/f7v2`, **`5640a3f`**; `git status`: só `node_modules` (symlink) não versionado |
| Diferença para `lab/etapa6` (b4b6cc2) | 10 arquivos, +629/−11 (`vite.config.ts`, `import-f7v2.mjs`, `capture-f7v2.mjs`, `creatures.ts`, `lab-creatures.ts`, `lab-tamer.ts`, `lab-env.d.ts`, `main.ts`, `animctl.ts`, `view.ts`) |
| Serviço | `gs003-lab-f7v2-5196` ativo, HTTP 200; processo com cwd no worktree `lab-f7v2` |
| `tsc --noEmit` | 0 erros (rodei; sem saída de build incremental) |
| `vitest` | **NÃO VALIDADO** por mim: o `node_modules` é um symlink para o do `lab-etapa6` e o vitest grava cache nele. Fica o [L] do game-dev (523/527, 4 falhas pré-existentes) |
| Pixels | Os **106 PNG do pacote** e os **28 do projétil** (nascer, voo, impacto) estão no `dist-lab-f7v2` byte a byte (SHA-256 de todos dentro do conjunto de hashes do dist; 0 faltando) |
| `lab-assets/a` | Nenhum arquivo mais novo que o brief; `diff -rq a a-f7v2` aponta só `CREATURE-0006/pixellab9` |

**Método:** Chromium headless-shell 1243, `LD_LIBRARY_PATH` com os diretórios `.so` de `/tmp/chromelibs/ex`, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`, 1280×720, CDP próprio. O jogo começa pelo fluxo do jogador (preset de Tamer + confirmar), com `&time=12:00`. Leio o estado pelo `window.__gs003` (existe no build) com um gravador **por rAF** (quadro mostrado, estado, posição, ataque, projéteis, casts). A verificação espacial é **independente do código**: localizo, nos recortes da tela, o PNG-fonte do pacote ampliado 2× por casamento exato de pixels e comparo a boca, o centro do projétil e a âncora. Os pixels do sprite batem um a um; ~30% recebem um realce uniforme de +8 RGB (a luz do lab), então usei tolerância de 12. Teclas por `Input.dispatchKeyEvent` (WASD, K, 1–4) e clique real no selvagem.
**Limites:** headless sem GPU, rAF a ~60 Hz, então os tempos são indicativos (±17 ms). As capturas por CDP levam ~50 ms cada. Não joguei com mãos humanas nem em tela física.

## 2. Agumon F7v2 no mapa (4 direções)

### 2.1 Idle, ataque com K e recuperação [E]

| Dir. | Quadros do ataque medidos (ms) | Pacote (ms) | Disparo medido / esperado | Projétil × quadro de disparo | Depois do q8 |
|---|---|---|---|---|---|
| S | 199 150 116 167 117 117 151 149 · 200 | 200 140 120 160 120 120 160 140 200 | 461–470 / 460 | mesmo rAF (−1 ms) ou o seguinte (+15 ms) | idle S |
| N | 166 133 117 150 117 117 151 133 · 200 | 160 140 120 140 120 120 140 140 200 | 421–429 / 420 | idem | idle N |
| E | 166 167 117 117 117 117 150 133 · 200 | 160 160 120 120 120 120 140 140 200 | 322–337 / 320 | mesmo rAF | idle E |
| W | 166 150 133 117 117 116 150 133 · 200 | 160 160 120 120 120 120 140 140 200 | 320–336 / 320 | mesmo rAF | idle W |

- Os 9 quadros tocam inteiros e na ordem nas 4 direções, **sem espelho do motor** (`mirror` falso em todas as linhas). Os desvios são a quantização de 16,7 ms do rAF. 1 projétil por golpe.
- **Idle:** 6 quadros com os tempos por direção do pacote (`idleanim_<D>_00..05`, 117–267 ms medidos).
- **K andando:** se a parceira ainda está parada (ela segue o Tamer com atraso), o ataque toca inteiro e depois ela volta a seguir. Se já está andando, ela para de andar durante o ataque (S e N: `walk_S_01 → attack_S_00`). Nenhum dos dois casos travou.

### 2.2 Walk, entrada e saída [E]

| Medida | F7v2 | F2b (`&agumon=v8`) | Lab A (5191) |
|---|---|---|---|
| Tempo médio por quadro de walk (min–máx) | E 43 (33–100) · S 44 (17–100) · N 42 (17–100) · W 33 | E 107 · S 114 · N 104 · W 79 | igual ao F2b |
| Quadros pulados / trocas | **7 / 135** | 0 / 51 | 0 / 51 |
| Velocidade da parceira / do Tamer | 74 / 92 px/s | 73 / 92 px/s | 73 / 92 px/s |
| `walkSpeedPxPerSec` no manifesto | 27,27 (3 px por quadro) | — (100 ms fixos) | — |

- **QA-B1:** o motor faz o que o relatório diz (1 quadro a cada 3 px), mas a parceira anda a ~73 px/s, então o ciclo de 8 quadros leva ~350 ms, contra 880 ms no pacote e ~830 ms no F2b. O pé de apoio fica parado no mundo, como pedia o pacote ("ajuste o delay"), **mas a cadência das pernas fica ~2,5× maior que a desenhada**, e alguns quadros nem aparecem. [H] A 1×, isso lê como "pernas frenéticas"; a passada com joelho e braço em oposição, que foi o motivo para escolher a walk S experimental, fica difícil de ver.
- **Entrada da walk S:** a partir do idle S, a walk começa no **quadro que a distância andada indica** (ex.: `idleanim_S_03 → walk_S_01`), não no q0. Ao começar a andar de um lado para outro, a parceira faz a curva: aparecem `walk_E`/`walk_W` antes da `walk_S` (B5 do game-dev, confirmado).
- **Saída da walk S:** `walk_S_00 → walk_S_01 → idleanim_S_00`, direto para o idle, sem quadro intermediário. A troca de 492 px medida fora do jogo continua [L].
- Recortes: `tmp/qa_build_f7v2/f7v2/shots_<D>/walkin_*`, `walkout_*` e as folhas `sheet_S_walk.png`, `sheet_N_atk1.png`, `sheet_S_atk2.png`.

### 2.3 Âncora e escala junto do Tamer [E]

- **Âncora:** em todos os recortes de ataque nas 4 direções, a posição na tela do ponto (30, 49) do sprite casado bate com a posição lógica da parceira com **0 px de diferença**. Os únicos desvios (±1–2 px do mundo) aparecem nas capturas feitas na troca de quadro (o quadro muda entre ler a posição e capturar). **Nenhum salto de âncora entre animações.**
- **Escala:** a rotação S da F7v2 tem 22×35 px e a E tem 36×41 px, **iguais** às do F2b (os mesmos pixels, deslocados +6/+5 no canvas 60×60). `scaleOf` = 1 para a parceira e `cssPerLogical` = 2, como no F2b. A relação de tamanho com o Tamer é **a mesma do F2b no Lab A**. A escala Tamer/Digimon continua conflito aberto (G-2), sem avaliação aqui.

## 3. Projétil Pepper Breath (tecla K)

### 3.1 Nascimento, boca e ordem [E]

| Dir. | Centro da bola − origem da boca (px do mundo), na fase `nascer` | Sobreposição sprite × bola | Leitura |
|---|---|---|---|
| E | **(0, 0)** | bola na frente (6–13 px) | nasce entre as mandíbulas e sai para a direita |
| W | **(0, 0)** | bola na frente (6–13 px) | espelho do E, coerente |
| N | **(0, 0)** | **sprite na frente (4–15 px)** | nasce atrás da cabeça e sobe: **atrás**, como pede o `projetil.json` |
| S | (−0,5, 0), dentro do erro de 1 px de tela da medida (o S tem o nome do Tamer por cima) | bola na frente (36 px no voo) | nasce sobre a boca aberta e desce pelo peito |

- O `nascer` fica parado na boca por ~120 ms e o voo começa em seguida. A distância percorrida cresce ~7–8 px a cada 50 ms (**~150 px/s**, como o relatório). O sprite não se moveu durante o `nascer` em nenhuma direção, então **o B4 não apareceu** (no N o corpo sobe 1 px só no q5, depois do nascer).
- **Explosão:** nas 4 direções, a fase `impacto` aparece no fim do alcance (≈96 px) e dura ~300 ms (`impacto/<D>_*_impacto.png`, `zoom_impactos.png`). A 1×, a explosão é pequena e discreta [H]. Não colide com cenário: no N, o fogo atravessa o barranco e explode em cima dele, como o relatório declara.

### 3.2 Fogo × Tamer [E]

- **QA-B3:** com o K, a parceira está quase sempre atrás do Tamer, então o fogo cruza o corpo dele (B2 do game-dev). No S a ordem **troca no meio do voo**: a bola passa **atrás** da cabeça do Tamer, some por ~50 ms e reaparece **na frente** do peito (`f7v2/zoom_S_fire_tamer2.png`, recortes `atk2_072` a `076`). O motivo é a ordem pela linha do chão do fogo, que passa pela linha do chão do Tamer. No combate o mesmo pode acontecer quando o Tamer está entre o Agumon e o alvo (`sheet_cmb_f7v2_E_g4.png`, o fogo passa rente ao Tamer).
- O "passo para o lado oposto" sugerido no relatório **não liberou** o voo no S nem no N nas minhas rodadas: o Tamer continuou no caminho. No E e no W o voo fica livre.

## 4. Combate real [E]

Selvagem forçado a ~40 px, com HP alto definido **uma vez** (não a cada quadro, como no roteiro do game-dev), clique real nele e tecla do golpe 3× em cada caso (S, N, E e W com o golpe 2; E com os golpes 1, 3 e 4). A rodada foi repetida igual com `&agumon=v8`.

| | F7v2 | F2b |
|---|---|---|
| Golpes do Agumon Nv.20 | `mach_jab`, **`uppercut`**, `baby_burner`, `triple_baby_flame` | iguais |
| Projéteis por golpe do Agumon | **1 em todos** (Mach Jab, Uppercut, Baby Burner, Triple Baby Flame e o golpe automático) | 0 (fogo pintado no sprite) |
| Efeito do golpe (cast) | o cast existe, mas **não é desenhado** para esse Agumon (`view.ts`: `drawCastLayer` retorna quando o atacante tem projétil de sprite) | desenhado (`multi_hit_flurry`, `claw_slash`, `fireball`) |
| Voo com alvo | da boca até o ponto de acerto, em qualquer ângulo (ex.: `E (0,94; −0,34)`, 33–90 px), com os quadros de voo da direção do Agumon | — |
| Ataque cortado pelo golpe seguinte (B1) | sim: `attack_N_07`, `attack_E_06` | sim: `attack_S_07`, `attack_E_07` (**já existia no F2b**) |
| Duração do golpe | 1360 ms (especial 1540) | 1125 ms (especial 1305) |
| Erros de console | 0 | 0 |

- **QA-B2:** o golpe 2 é o **Uppercut** (físico, `claw_slash`), confirmado pelo `d.moves` da sim e pelo custo de MP no HUD (13/15/18/17). O `pepper_breath` está no learnset (Nv.8), mas **não está entre os 4 equipados no Nv.20**. Então "combate real com o golpe 2" testa um Uppercut que **aparece como um Pepper Breath**. [H] O Vitor pode achar que o golpe 2 é o Pepper Breath, como as instruções dizem, e julgar o golpe errado.
- No combate o Agumon também troca sozinho de alvo para os selvagens que o atacam (`rwild-*`); nesses golpes o voo sai em diagonal. Isso é da sim do Lab A.
- B3 do game-dev (o número de dano antes do impacto): **NÃO VALIDADO** (não capturei o número de dano junto com o tempo do impacto).

## 5. Isolamento [E]

| Alvo | Resultado |
|---|---|
| **Lab A, 5191** | `lab-etapa6` em `b4b6cc2` com `git status` limpo; `dist-lab-a/index.html` com data de 2026-11-14 09:04; serviço ativo. `?novo=1`: Koromon Nv.16, 0 erros, Tamer anda (152,252 → 212,302), **K não faz nada** (sem ataque). `&linhas=rookie`: Agumon **v8** (48×48), sem projétil. Walk do Agumon igual à do F2b no 5196 (tabela do §2.2) |
| **Jogo principal** | worktree `qo` em `3289e32` (`quality-overhaul`), `git status` limpo, `dist/` de 2026-11-12 23:01 (igual ao commit). Servido só para leitura na 5199: carrega até "Escolha seu parceiro" com **0 erros**, sem hook `__gs003` e sem faixa de laboratório (`iso/principal.png`). Jogo além da tela inicial: **NÃO VALIDADO** (o fluxo de entrada é outro e não o automatizei) |
| **F2b no 5196** (`&agumon=v8`) | manifesto "ficha v8 … 48x48", sem projétil, 0 erros; o K funciona com ele (ataque sem projétil, com o fogo pintado) |
| **5196 sem `linhas`** | Koromon Nv.16, como no Lab A; 0 erros |
| Save | chaves `do.lab.a.save.v2:gs003.world.save*`, iguais às do 5191, mas em outra origem (porta), então separadas [E das chaves; H de que não colidem, pela regra de origem do navegador] |
| Erros de console / rede | **0 erros e 0 falhas de rede** em todas as rodadas deste QA (mapa, combate, isolamento, cadência e explosão) |

## 6. Verificações de todo build [E]

| Item | Resultado |
|---|---|
| Texto de desenvolvimento visível | A faixa roxa do lab ("BUILD ISOLADO F7v2 … K = ataque de teste · fan game não oficial") é intencional. Nenhum "TODO/debug/undefined/NaN" no texto da página |
| Ganchos de depuração | `window.__gs003` presente (com `forceEncounter`, `setPartner` etc.), como no Lab A; ausente no jogo principal. Build local, não publicado: P3 |
| Imagens de QA no bundle | Nenhum arquivo com nome de QA, captura ou debug no `dist-lab-f7v2` (24 MB). Os 106 + 28 PNG da F7v2 estão lá |
| Nível inicial | Agumon Nv.20 e Gomamon na reserva com `linhas=rookie`; Koromon Nv.16 sem `linhas`. Coerente com o relatório. Ao entrar, o Digivice abre em "Digivolução disponível" (Greymon / GeoGreymon), como no Lab A; fecha com Esc |
| Rótulo interno | O manifesto chama a F7v2 de "ficha v9 **PixelLab**", mas ela é o híbrido F7v2 (rig + F2b, 0 gerações). [H] Não vi esse texto na tela; P3 de documentação |

## 7. Problemas do game-dev (B1–B6) e novos

| ID | Sev. | Confere? | Leitura do QA |
|---|---|---|---|
| B1 (golpe seguinte corta o ataque) | P2 | **sim** [E] | Corta em q6/q7. **Também acontece no F2b** (q7), então não é regressão da F7v2. A recuperação q7–q8 só aparece inteira com o K |
| B2 (fogo atravessa o Tamer) | P3 | sim [E] | E, pior que isso, troca de ordem no meio do voo (QA-B3) |
| B3 (dano antes do impacto) | P3 | NÃO VALIDADO | — |
| B4 (boca sai de cima do fogo no `nascer`) | P3 | **não observado** [E] | 0 px nas 4 direções |
| B5 (curva do "seguir" antes da walk S) | P3 | sim [E] | Mais a entrada num quadro qualquer do ciclo (§2.2) |
| B6 (GIF de ~3 MB) | P3 | [L] | não reverifiquei |
| **QA-B1** | **P1 (para o objetivo do teste)** | novo | walk a ~43 ms por quadro (F2b ~108), 7 pulos. Caminho: cadência fixa perto de 110 ms, a mesma do F2b, ou um passo maior por quadro. É render, não pixel nem regra de jogo; decisão do coordenador, com ChatGPT e Vitor |
| **QA-B2** | **P2** | novo | Todo golpe vira Pepper Breath e os efeitos dos golpes somem. Caminho: soltar o projétil só nos golpes `fireball`/de fogo à distância (ou só num golpe escolhido) e manter o cast genérico nos outros; **e corrigir as instruções** (golpe 2 = Uppercut). Equipar o Pepper Breath no teste é regra/dado de jogo: só com autorização |
| **QA-B3** | P3 | novo | Ordem do fogo contra o Tamer troca no meio do voo. Caminho: ordem fixa do projétil pela linha do chão do atacante enquanto estiver acima dela, ou desenhar o fogo sempre na frente de aliados |
| **QA-B4** | P3 (pré-existente) | novo | Nome do Tamer por cima do Agumon no S/N. É do Lab A |
| QA-B5 | P3 | novo | Instruções e relatório dizem "golpe 2 = Pepper Breath" e o rótulo diz "ficha v9 PixelLab"; os dois estão errados |

**Nenhum P0.** O P1 não quebra o jogo: tira a validade da comparação da walk, que é o ponto do teste do Vitor.

## 8. Notas no jogo (Comando 12 §5)

**Régua:** a mesma dos QAs da F7 e da F7v2 (referência aprovada v13/v15 + `FICHA_AGUMON.md`, leitura a 1× em movimento), agora **no mapa real**, a 1280×720 (2 px de tela por px). A paleta fica fora (G-1 aberto); a escala (G-2) não é julgada. 8 = pronto para integração de teste; GS-010 = média ≥ 9 e nenhuma categoria < 8. Passos de 0,25.

| # | Critério | F7v2 fora do jogo [L] | **F7v2 no jogo** | Justificativa |
|---|---|---:|---:|---|
| 1 | Fidelidade ao Agumon | 8,0 | **8,0** | Os pixels entram no jogo intactos (casamento exato; só o realce de luz do lab). A identidade é a do F2b. Os golpes errados ficam no critério 8 |
| 2 | Qualidade GBA Plus | 7,5 | **7,5** | O sprite lê bem a 1× no gramado. O fogo é limpo, mas pequeno, e a explosão é discreta. As falhas herdadas continuam |
| 3 | Fluidez de animação | 7,75 | **7,25** | Ataque e idle com os tempos exatos. A walk toca a ~43 ms por quadro, com pulos (QA-B1): o ciclo que mais aparece fica apressado e perde a leitura da passada |
| 4 | Consistência anatômica | 8,5 | **8,5** | Âncora com 0 px de desvio entre idle, walk e ataque nas 4 direções; escala igual à do F2b; o projétil nasce no pixel certo |
| 5 | Legibilidade no jogo | 7,5 | **7,25** | E/W leem bem, com voo livre. No S, o nome do Tamer cobre o Agumon e o fogo some atrás do Tamer e reaparece na frente; no N, o fogo sai para trás do Tamer. A explosão é pequena a 1× |
| 6 | Custo e tempo | 7,0 | **7,0** | 0 gerações; ~2 h de integração; o sistema de projétil de sprite é reaproveitável. Ainda exige código por espécie (origem, quadro de disparo) |
| 7 | Transições entre animações | 7,75 | **7,5** | idle → ataque → idle limpo nas 4 direções. A walk entra num quadro qualquer, a curva do "seguir" mistura direções e, no combate, o golpe seguinte corta a recuperação (isso também no F2b) |
| 8 | Ausência de regressões | 7,5 | **7,0** | 0 erros, isolamento perfeito, F2b preservado. Regressões contra o F2b no jogo: os efeitos dos 4 golpes deixam de ser desenhados e todos viram Pepper Breath (QA-B2), a walk ficou ~2,5× mais rápida (QA-B1) e a ordem do fogo contra o Tamer troca (QA-B3) |
| | **Média simples** | **7,69** | **7,50** | (8,0 + 7,5 + 7,25 + 8,5 + 7,25 + 7,0 + 7,5 + 7,0) / 8 = 60,0 / 8. **Abaixo de 8.** Seis categorias abaixo de 8 |

[H] Se o QA-B1 e o QA-B2 forem resolvidos sem mexer em arte (cadência e escolha de golpe), a nota no jogo deve voltar a ~7,7, a nota da F7v2 fora do jogo. Não chega a 8 com isso: o que falta continua sendo a walk N, a troca de desenho dentro do ataque S e o tamanho do fogo e da explosão a 1×.

## 9. Pronto para quem?

- **ChatGPT: pronto.** Mandar como candidata, com este QA, o relatório do game-dev e os GIFs dele. Avisar que: (1) a walk no jogo está ~2,5× mais rápida que no pacote; (2) "golpe 2 = Pepper Breath" está errado; (3) no S, o fogo cruza o Tamer.
- **Vitor: pronto com condições.** Recomendo, nesta ordem:
  1. **Corrigir as instruções do link** (custo zero): o golpe 2 é o Uppercut; no build, qualquer golpe do Agumon mostra o Pepper Breath; o K é o teste limpo do ataque; o E e o W mostram o voo livre.
  2. **Decidir a cadência da walk** (QA-B1) antes do teste. A mudança é de render, pequena, e fica com o game-dev, se autorizada. Sem isso, a comparação "walk S experimental × original × F2b" que o Vitor vai fazer fica enviesada.
  3. O QA-B2 (efeitos dos golpes) pode esperar o teste, **desde que o Vitor saiba**.
- Se o coordenador preferir mandar já, **as três observações acima precisam ir junto do link.**

## 10. O que não foi feito / NÃO VALIDADO

- `vitest` (motivo no §1); B3 (tempo do número de dano); jogo principal além da tela de escolha do parceiro; persistência da posição salva ao recarregar; diagonais (não estão no pacote); desempenho com GPU.
- Não toquei os GIFs nem as capturas do game-dev; as evidências deste QA são próprias, em `workspaces/game-qa/tmp/qa_build_f7v2/`.
- Nenhuma correção de código ou arte, nenhum reinício de serviço, nenhuma geração. O servidor temporário da 5199 foi encerrado.

## 11. Decisões do fundador / coordenação

1. Cadência da walk no jogo (QA-B1): por distância, como está (pé fixo, pernas rápidas), ou fixa (~110 ms, comparável ao F2b, pé pode escorregar).
2. Quais golpes do Agumon soltam o projétil (QA-B2), e se o Pepper Breath deve estar equipado no teste (isso é dado de jogo e exige autorização).
3. Se o B1 (golpe seguinte cortando o ataque, já existente no F2b) vira tarefa de combate.
4. Mandar o link ao Vitor já, com as observações, ou depois dos ajustes 1 e 2.
5. Paleta (G-1) e escala (G-2) continuam abertas para a Etapa 6.

---

## Re-QA 12.2b (2026-11-14, ~23:05–23:45, game-qa, custo PixelLab: 0)

**Objeto:** os ajustes da 12.2b (QA-B1, QA-B2, QA-B3) no mesmo serviço `gs003-lab-f7v2-5196`, contra a seção "0. Como testar (v2)" do `RELATORIO_BUILD_F7V2.md`. Mesmo método do §1 (Chromium headless-shell 1243, 1280×720, CDP próprio, gravação por rAF, fluxo do jogador). **Não alterei código, assets, `PROGRESS.md` nem serviços; não reiniciei nada.** Só esta seção foi acrescentada.
**Roteiros novos** (fora do jogo, reexecutáveis com `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`): `workspaces/game-qa/tools/qa_build_f7v2b/` (`walk.mjs`, `feet.mjs`, `combat.mjs` + `cmb_an.py`, `korder.mjs`, `iso5191.mjs`, `sheet.mjs`, `explore.mjs`). **Saídas:** `workspaces/game-qa/tmp/qa_build_f7v2b/` (`walk.json`, `pes_walk_pacote.json`, `cmb_f7v2b/`, `combate_analise.json`, `korder/`, `sheet_E_g1.png`, `sheet_E_g4.png`, `sheet_arvore_E.png`, `sheet_bau_W.png`, `iso5191.json`).

### R.0 Build testado [E]

| Item | Valor |
|---|---|
| Worktree / branch / commit | `workspaces/game-dev/lab-f7v2`, `lab/f7v2`, **`415825a`** (23:03:35); `git status`: só `node_modules` (symlink) |
| Bundle servido | `dist-lab-f7v2/assets/index-Dk-iUo92.js` (SHA-256 `b0c37126e4178a24…`), gerado às 22:54:03, antes do commit. Nenhum arquivo de `src/`/`scripts/` mais novo que o build fora de 3 JSON de mapa (`src/data/maps/v9/…`), e o `git status` limpo indica que eles são iguais ao commit. O comportamento medido bate com o diff da 12.2b (manifesto sem `walkSpeedPxPerSec`, `moveId` no ataque, regra nova de ordem) |
| Serviço 5196 | ativo desde 22:54:03, HTTP 200 |

### R.1 Cadência da walk [E] (`walk.json`, 2 rodadas por build, D → S → A → W → S, 2,6 s cada)

| | **F7v2 (12.2b)** | F2b (`&agumon=v8`) | F7v2 antes (QA 12.2) |
|---|---|---|---|
| ms por quadro, mediana (média) | **S 116–117 (110–111) · N 116–117 (112) · E 117 (112) · W 117 (111–112)** | 100 (100–102) nas 4 | ~43 |
| Faixa (min–máx), só quadros internos | 100–134 (um N com 150–167, na curva) | 83–133 | 17–100 |
| Quadros pulados / trocas | **0 / 105** (nas 2 rodadas) | 0 / 114–115 | 7 / 135 |
| px do mundo por quadro, mediana (média) | **E 11,7 (11,0–11,1) · W 11,2–11,5 (11,0–11,1) · S/N 11,7 (10,9–11,0)** | 10,0 (10,0) | ~3 |
| Velocidade parceira / Tamer | 85 / 95 px/s | 85–86 / 95 px/s | 74 / 92 |

- **Confere com o relatório:** ~117 ms de mediana (entre 110 e 120 ms; o pacote pede 110), **sem quadro pulado**, a mesma lógica do F2b. A alternância 100/117/134 ms é a quantização de 16,7 ms do rAF sobre 1 quadro a cada 11 px. O ciclo da F7v2 fica ~10–17% mais lento que o do F2b (110 ms × 100 ms no desenho), como o relatório diz.
- **Entrada e saída da walk S** (2 rodadas): `idleanim_S_00 → walk_S_03 (150 ms) → … → walk_S_01 (183 ms) → idleanim_S_04/05`. A walk entra no meio do ciclo (q3) e sai para um quadro do meio do idle animado (q4 ou q5), sem quadro intermediário. O relatório cita `walk_S_04` e `idleanim_S_02`; o padrão é o mesmo, o quadro exato varia com a distância andada. No F2b: `idle_S → walk_S_03/04 → … → idle_S`.
- **Escorregão do pé (medido pela conta, com o contato dos pés nos PNG do pacote, `pes_walk_pacote.json`):**
  - **E/W:** o pacote desenha o pé de apoio recuando **3 px por quadro**. No jogo a parceira anda **11,0–11,7 px por quadro**, então o pé de apoio desliza **~8–8,7 px do mundo por quadro (~16–17 px de tela)**, ~73 a 79% do passo. O relatório estima 7–8 px; a minha mediana dá um pouco mais (11,7 px contra os 10,5 px que ele mediu).
  - **S:** nos 8 quadros da walk S, os dois pés tocam a linha do chão (y = 49) em 15 de 16 contatos (só o pé esquerdo sobe 1 px no q2). Os pés não recuam no sprite, então **o corpo inteiro anda 11,7 px por quadro em profundidade com os pés "colados"**: escorregão de ~11,7 px do mundo por quadro no eixo y. **N:** cada pé sobe até 3 px em metade do ciclo, e o pé de apoio também não recua: mesmo escorregão em y.
  - [H] No S/N, a 1× e de cima, o deslize em profundidade quase não se percebe (o F2b também anda 10 px por quadro sem pé fixo). No E/W ele aparece: a passada desenhada para 3 px fica "patinando". É o preço, já previsto, da comparação justa pedida no brief.
- **Veredito do item 1: FUNCIONA.** O QA-B1 está resolvido. O escorregão no E/W fica como observação (P3), não como defeito do ajuste.

### R.2 Quem solta o projétil [E] (`combate_analise.json`, `cmb_f7v2b/`, `sheet_E_g1.png`, `sheet_E_g4.png`)

Combate real (clique no selvagem e teclas 1–4, 7 casos), com o `moveId` de cada ataque e, para cada golpe, se o efeito próprio (cast) é desenhado ou suprimido pela regra do `view.ts`:

| Golpe (Agumon Nv.20) | Ocorrências | Projétil F7v2 | Efeito próprio |
|---|---:|---|---|
| Mach Jab (físico, `multi_hit_flurry`) | 6 | **0** | **desenhado** em todas |
| Uppercut (físico/fogo, `claw_slash`) | 7 | **0** | **desenhado** em todas (corte branco e vermelho no alvo, `E_g1_31`) |
| Baby Burner (especial/fogo, `fireball`) | 5 | **1 em cada** | **suprimido** (só o projétil) |
| Triple Baby Flame (especial/fogo, `fireball`) | 1 | **1** (uma bola, não três) | **suprimido** |
| Golpes dos selvagens (beam, ice_shard, breath_flame…) | — | — | desenhados normalmente |

- **Confere com a §0 do relatório:** só Baby Burner e Triple Baby Flame soltam o fogo; Mach Jab e Uppercut voltam ao efeito próprio, sem fogo. **0 erros de console e 0 falhas de rede.** O QA-B2 está resolvido.
- Observações [E]: (a) o AUTO e a troca de alvo para os selvagens que atacam (`rwild-*`) intercalam golpes, então a tecla nem sempre corresponde ao golpe que sai em seguida. O relatório avisa isso. (b) **B1 continua**: o golpe seguinte corta o ataque em q7 (`attack_W_07`, `attack_N_07`, `attack_E_07`). (c) **B3 visto** em `sheet_E_g4.png`: o número de dano (−69) aparece no alvo enquanto o fogo ainda está passando pelo Tamer. P3, só apresentação.
- **Veredito do item 2: FUNCIONA.**

### R.3 Ordem de desenho do fogo [E] (`korder/resumo.json`, `sheet_arvore_E.png`, `sheet_bau_W.png`)

Com a tecla K, gravei por rAF a chave de ordenação do projétil pela regra nova (`shotSortY` com a linha do chão do Tamer) e pela antiga (sem ela), contra a linha do chão do Tamer e de props do cenário.

| Caso | Tamer à frente do Agumon | Fogo atrás do Tamer (nova / antiga) | Fogo na frente de um prop que deveria cobri-lo (nova / antiga) |
|---|---:|---|---|
| fogo N, Tamer 14 px à frente | sim | 64/64 atrás nas duas: **o N continua atrás**, como pede o `projetil.json` | — |
| fogo E e W, Tamer ~4 px atrás | não | 0/64 nas duas | — |
| fogo S, Tamer 28 px atrás | não | 0/64 nas duas | — |
| **E, árvore `la_arvore_grande_03` (chão y = 191), Agumon em y = 186, Tamer 22 px à frente** | sim | **0/64** (antiga: 64/64) | **11/11 na frente (antiga: 0/11)** |
| E, a mesma árvore, Tamer 26 px atrás (controle) | não | 0/64 | 0/11 (correto: fogo atrás do tronco) |
| **W, baú `la_bau` (chão y = 318), Agumon em y = 312, Tamer 24 px à frente** | sim | **0/64** (antiga: 64/64) | **12/12 na frente (antiga: 0/12)** |

- **Fogo × Tamer: FUNCIONA.** Com o Tamer à frente do Agumon, o fogo para S/E/W fica na frente dele em todas as amostras e não troca mais de ordem no meio do voo; pela regra antiga, ficaria atrás em 64/64. O QA-B3 está resolvido. O game-dev mediu o mesmo no S (0/64 contra 25/64).
- **QA-B6 (novo, P3): o fogo passa na frente de objetos do cenário que deveriam cobri-lo.** A regra sobe a ordem do fogo até a linha do chão do Tamer durante **o voo inteiro**, não só onde ele cruza o Tamer. Então **todo prop cuja linha do chão fica entre o Agumon e o Tamer** é desenhado **atrás** do fogo, mesmo quando o fogo passa por trás dele. Nas capturas: no `sheet_arvore_E.png` (linha de cima), o fogo é desenhado **por cima do tronco e da copa** das árvores; no controle (linha de baixo), ele some atrás delas, como deveria. No `sheet_bau_W.png`, o fogo passa por cima das árvores pequenas à esquerda. O efeito colateral foi previsto pelo game-dev como [H]; agora está medido. Também vale para os selvagens nessa faixa de y. Caminho de correção (render, sem pixel): limitar o empurrão à faixa de x do Tamer (só enquanto o retângulo do fogo cruza o do Tamer) ou desenhar só o Tamer por trás do fogo, em vez de mudar a ordem do fogo contra o mundo inteiro. Ressalva: a árvore fica dentro da mata, onde o jogador não costuma parar com o Tamer à frente; o caso do baú é numa área andável. [H] No teste do Vitor, com o K em campo aberto, isso quase não aparece.
- **Veredito do item 3: FUNCIONA, com o QA-B6 (P3).**
- Limite: a direção do K vem da face do controlador de movimento; para fixá-la, escrevi a face antes de apertar o K (instrumentação só do QA, sem salvar). Em 3 dos 4 casos "padrão" a face foi recalculada e o fogo saiu em outra direção; os casos com prop saíram na direção pedida e são os que valem.

### R.4 Console e isolamento [E]

| Alvo | Resultado |
|---|---|
| Console / rede, 5196 | **0 erros e 0 falhas de rede** em todas as rodadas (walk F7v2 ×2, F2b ×2, combate com 7 casos, K com 8 cenários) |
| **5191 (Lab A)** | `gs003-lab-a-5191` ativo desde **09:04:18** (sem reinício); `lab-etapa6` em `b4b6cc2`, `git status` limpo. Carregado com `?novo=1&linhas=rookie`: Agumon **v8** (ficha 48×48), sem projétil, sem a faixa da F7v2, **K não faz nada**, Tamer anda, **0 erros e 0 falhas de rede** (`iso5191.json`) |
| Database | não tocada por mim |

### R.5 Problemas, situação depois da 12.2b

| ID | Sev. | Situação |
|---|---|---|
| QA-B1 (walk 2,5× mais rápida) | P1 | **Resolvido** [E]: 117 ms de mediana, 0 pulos |
| QA-B2 (todo golpe vira Pepper Breath) | P2 | **Resolvido** [E] |
| QA-B3 (fogo troca de ordem contra o Tamer) | P3 | **Resolvido** [E] |
| QA-B5 (instruções "golpe 2 = Pepper Breath") | P3 | **Resolvido** na §0. O rótulo interno "ficha v9 PixelLab" continua no manifesto (só documentação) |
| QA-B4 (nome do Tamer por cima do Agumon no S/N) | P3 | aberto (Lab A) |
| B1 (golpe seguinte corta o ataque) | P2 | aberto, também no F2b |
| B3 (dano antes do impacto) | P3 | **visto** [E] (`sheet_E_g4.png`) |
| **QA-B6 (novo): fogo na frente de props entre o Agumon e o Tamer** | **P3** | novo; caminho no R.3 |
| **QA-B7 (novo): pé escorrega na walk** (E/W ~8–8,7 px do mundo por quadro; S/N ~11,7 px em profundidade) | **P3** | consequência aceita da cadência igual à do F2b; avisar o Vitor |

**Nenhum P0 nem P1 aberto.**

### R.6 Notas no jogo (régua do §8, passos de 0,25)

| # | Critério | 12.2 | **12.2b** | Justificativa |
|---|---|---:|---:|---|
| 1 | Fidelidade ao Agumon | 8,0 | **8,0** | Sem mudança de pixel |
| 2 | Qualidade GBA Plus | 7,5 | **7,5** | Sem mudança; fogo e explosão pequenos a 1× |
| 3 | Fluidez de animação | 7,25 | **7,5** | Walk na cadência do pacote (~117 ms) e sem pulos: a passada volta a ser legível. Não volta aos 7,75 de fora do jogo porque o pé de apoio patina ~8 px por quadro no E/W (QA-B7) |
| 4 | Consistência anatômica | 8,5 | **8,5** | Sem mudança |
| 5 | Legibilidade no jogo | 7,25 | **7,5** | O fogo não some mais atrás do Tamer, e os golpes físicos voltam a mostrar o próprio efeito. Ficam o nome do Tamer sobre o Agumon (QA-B4) e o fogo por cima de props (QA-B6) |
| 6 | Custo e tempo | 7,0 | **7,0** | Ajuste pequeno (3 arquivos); continua exigindo código por espécie |
| 7 | Transições entre animações | 7,5 | **7,5** | Sem mudança: a walk entra e sai no meio do ciclo, e o B1 corta a recuperação no combate |
| 8 | Ausência de regressões | 7,0 | **7,5** | As três regressões contra o F2b (QA-B1/B2/B3) foram corrigidas, com 0 erros e a 5191 intacta. Entra uma regressão menor: a ordem do fogo contra props (QA-B6) |
| | **Média simples** | **7,50** | **7,63** | (8,0 + 7,5 + 7,5 + 8,5 + 7,5 + 7,0 + 7,5 + 7,5) / 8 = 61,0 / 8 = 7,625. **Abaixo de 8**, com cinco categorias abaixo de 8. GS-010: não |

[H] A previsão do §8 (voltar a ~7,7) quase se cumpriu. O que separa a nota dos 7,69 de fora do jogo é o pé patinando e o QA-B6.

### R.7 Pronto para quem?

- **ChatGPT: pronto.** Mandar com a §0 do relatório e este Re-QA. Avisar: o pé escorrega no E/W (QA-B7); o fogo passa por cima de props quando o Tamer está à frente (QA-B6); a média no jogo é 7,63.
- **Vitor: pronto.** As duas condições do §9 foram cumpridas: as instruções estão corretas (§0) e a cadência é comparável à do F2b. Junto do link, mandar três avisos:
  1. a walk F7v2 é ~10% mais lenta que a do F2b por desenho (110 × 100 ms), e no E/W o pé desliza;
  2. em combate, o AUTO intercala golpes, então use o **K** para ver o ataque inteiro e as teclas **3**/**4** para ver o fogo com alvo;
  3. o fogo pode passar por cima de árvores e objetos quando o Tamer está à frente do Agumon.
- Nada disso bloqueia o teste. O QA-B6 pode ser corrigido depois, se o coordenador autorizar.

### R.8 Não feito / NÃO VALIDADO

- Leitura humana do escorregão a 1× em tela física (a medição é geométrica; a percepção fica como [H]); `vitest` (mesmo motivo do §1); diagonais; desempenho com GPU; jogo principal (fora do escopo deste re-QA).
- Nenhuma correção de código ou arte, nenhum reinício de serviço, nenhuma geração.

### R.9 Decisões do coordenador / fundador

1. Corrigir o QA-B6 antes ou depois do teste do Vitor (a mudança é de render e pequena).
2. Aceitar o escorregão do pé (QA-B7) como preço da comparação justa ou testar, depois, a cadência por distância só no E/W.
3. Se o B1 (corte do ataque, também no F2b) vira tarefa de combate.
