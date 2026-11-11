# GS-003 · `?mon=official` — Guilmon e Gabumon com os sprites oficiais do DS no jogo

Decisão do fundador em 2026-11-11: como é fan game, os Digimon têm que ser iguais aos oficiais. Entrega do game-dev na branch `quality-overhaul`, com custo zero e nenhuma chamada ao PixelLab. Nada foi para master e não houve deploy.

## Como testar

Rode o servidor de dev na pasta `prototype/world` (`npx vite --port 5190`) e abra:

| O quê | Link |
|---|---|
| **Recomendado** (oficial ×1) | `http://127.0.0.1:5190/?mon=official&map=digimon-forest-01&look=v9&dpr=1` |
| ×2 inteira | `…&mon=official&monscale=2` |
| auto (inteiro mais perto de 48–64 px, hoje ×2) | `…&mon=official&monscale=auto` |
| Gabumon oficial como parceiro | `…&mon=official&partner=CREATURE-0009` |
| Oficial junto com a comparação | `…&team=compare&mon=official` (a parceira e o `compare-show` continuam PixelLab/à mão; selvagens e modelos `official-show-*` aparecem oficiais) |

- O selo **"OFICIAL DS · Guilmon/Gabumon ×k (modo)"** aparece no HUD.
- Sem `?mon=official` nada muda: o `?team=compare` (Guilmon PixelLab e Gabumon à mão) funciona como antes, com teste próprio, e o roster continua usando `CREATURE-0003/0009`.
- Commits: `abdc228` (assets + script de recorte) e `ccc42f1` (flag, escala, testes). O commit das capturas, do relatório e do padrão `monscale=1` vem logo depois deste arquivo.

## O que entrou

| Item | Como |
|---|---|
| **Recorte da folha oficial** (`scripts/build-official-mons.mjs`, idempotente) | Lê as folhas do fundador `10-source-files/dwds-sheets/{guilmon,gabumon}.png` (Spriters Resource; rips de Sonicteam24 e redblueyellow). Acha os quadros da grade de MAPA por componentes conexos, troca o fundo por transparente (alfa só 0/255) e cola cada quadro, por **translação inteira**, num canvas de 40×36. Nenhum pixel é redesenhado ou reamostrado. |
| **Pivô no pé** | A última linha opaca fica em **y = 33** em todos os quadros (pivô 20, 34). O x de cada quadro é registrado pela cabeça e pelo tronco contra o quadro parado da direção, o que evita o "pulo" lateral entre quadros. O deslocamento de cada quadro está em `source/metrics.json`. |
| **Novos visuais** | `CREATURE-0018-guilmon-official` (6 quadros únicos) e `CREATURE-0019-gabumon-official` (9 quadros únicos), em `assets/GAME-ASSETS/01-creatures/`, com `creature.json`, `license.json` (ADR-009, crédito do ripper, sha256 da folha) e `source/metrics.json`. As espécies da sim continuam `CREATURE-0003/0009`, com os mesmos stats, golpes e elemento. |
| **Animações** | **idle** = quadro parado. **walk** = parado → passo A → parado → passo B (150 ms; o Gabumon de frente só tem 2 quadros, 200 ms). **attack** = parado → passo/pose → parado, com `hitFrame` no 2º quadro e o avanço procedural por cima; o Gabumon de frente usa a pose de punho erguido do DS (#15). **hurt** = quadro parado com o flash e o knockback procedurais. |
| **`?mon=official`** (`src/save/official.ts`) | A view troca o visual de **todas** as entidades das duas espécies (parceira, selvagens, modelos). Se `?team=compare` também estiver ligado, a comparação continua valendo para a parceira e o `compare-show`. Os retratos do HUD e os tempos de golpe do presenter usam o manifest oficial. Também vale na arena. |
| **`?monscale=1\|2\|auto`** | É um fator inteiro por visual (`visualScale`), multiplicado na escala da criatura em `scaleOf`. Sem blur: o desenho continua por `blitEntity`, com nearest. **auto** = o inteiro k que deixa a altura parada mais perto de 48–64 px (`autoScale`): Guilmon 31 → **×2 (62 px)** e Gabumon 29 → **×2 (58 px)**. Sem o parâmetro (ou com valor inválido), vale **1**, a recomendada. |
| **Capturas** (`scripts/official-capture.mjs`) | `__gs003.officialShowcase(espécie, dx, n, dy)` põe modelos parados (`npc` `official-show-n`) ao lado da parceira, só para as capturas. Os GIFs leem o canvas lógico `#world` direto, então saem em pixels nativos, sem nomes e sem HUD. |
| **Testes** (`tests/official-mons.test.ts`, 8) | Flags e padrão; catálogo, canvas e pivô; **pé em y=33 e alfa 0/255 em todo PNG**; walk com os 2 passos; direções e espelhos; attack/hurt reais e `hitFrame`; `autoScale` e `officialScales`; troca do catálogo e modelos `npc`. |

## Achados na folha oficial [E]

Comparei pixel a pixel (diferença 0) cada quadro com os outros e com o espelho de cada um:

- **Guilmon (16 quadros na grade de mapa):** só existem **2 direções desenhadas**, **S** (#1 parado, #2 passo, #4 passo) e **W** (#5 parado, #6 passo, #8 passo). #3 = #1 e #7 = #5. **A 2ª linha inteira é o espelho exato da 1ª** (#10 = espelho de #1, #13 = espelho de #8 etc.), ou seja, o próprio DS espelha. **Não existe vista de costas (N).**
- **Gabumon (15 quadros):** **SW** (#1–3, frente 3/4), **NW** (#7–9, costas 3/4), **S** (#13–14) e a pose de punho erguido (#15). #4–6 e #10–12 são o espelho exato de #1–3 e #7–9 (SE e NE). **Não existem N nem E/W de perfil.**
- **Correção em relação ao rip anterior (`CREATURE-0003/0009`, que o jogo usa sem flag):**
  - O "walk_N" do Guilmon é na verdade o **E espelhado** (#8, #5, #6 espelhados), não costas.
  - O walk S/W dele repete o quadro parado e **perde o 2º passo**: os quadros #4 e #8 nunca são usados, então o ciclo f0-f1-f0-f2 vira 1-2-1-1 e o Guilmon manca.
  - No Gabumon, o "W" é SW e o "N" é NW.
  - O attack/hurt de mapa dos dois é a pose de batalha **reduzida** (fator 0,413/0,382, moda de bloco), que não é pixel oficial.

  Não mexi nesses assets. A versão oficial nova corrige tudo isso só com quadros do DS.

**Direções no jogo** (o renderer usa 4 direções de movimento: S/N/E/W):

| | S | W | E | N |
|---|---|---|---|---|
| Guilmon | S | W | W espelhado | W (sem costas) |
| Gabumon | S | SW | SW espelhado (SE) | NW |

As diagonais vêm do `fallback: "nearest"`, que já existia no jogo.

## Capturas (`img/`)

Todas foram tiradas no jogo real (Chromium headless 1920×1080, `dpr=1`, look v9) a partir de um worktree limpo no commit `ccc42f1`. O worktree compartilhado tinha trabalho em andamento de outro agente (forest-v12, ver Limitações).

- **Pranchas lado a lado:** `om_prancha_clareira.png` e `om_prancha_vau.png`. Linhas: `monscale` 1 / 2 / auto. Colunas: dia / noite. Ordem na fileira, com os pés na mesma linha: **Tamer · Guilmon PixelLab v3 (parceira) · Guilmon OFICIAL DS · Gabumon OFICIAL DS · Gabumon à mão**.
- **Recortes de cada combinação:** `om_{clareira,vau}_{dia,noite}_x{1,2,auto}.png`, com versão ampliada `_x2.png` e a tela inteira com HUD em `_tela.png`. São 12 combinações.
- **GIFs** (pixels do canvas lógico ampliados 3× com nearest; a parceira oficial em `monscale=2`, para ler melhor):
  - `om_walk_guilmon_x2.gif` e `om_walk_gabumon_x2.gif`: 195 quadros, ~8 s. O Tamer anda um quadrado na clareira (S, E, N, W) e a parceira segue.
  - `om_attack_guilmon_x2.gif` (148 quadros) e `om_attack_gabumon_x2.gif` (84 quadros, ~3,4 s): encontro forçado com AUTO ligado, a partir de ~0,3 s antes da 1ª investida.
  - Cada GIF tem uma prancha `_quadros.png` com 12 quadros espaçados.
- **Quadros recortados (×6):** `om_quadros_guilmon_oficial_x6.png` e `om_quadros_gabumon_oficial_x6.png`.
- Não há WebM: o ffmpeg do Playwright neste host não tem o wrapper usado nas rodadas anteriores (`/tmp/pwb` ausente). Os GIFs cobrem walk e attack.

## Escala recomendada: **×1** (`?monscale=1`, já é o padrão da flag)

Medidas [E] em px lógicos: Tamer **30**, Guilmon oficial **31**, Gabumon oficial **29**, corpo do Guilmon PixelLab e do Gabumon à mão **~32**, tile **32**.

1. **Mesma densidade de pixel do mundo.** Em ×1, 1 pixel da arte = 1 pixel lógico, como o Tamer, os tiles, a vegetação e as artes de comparação (veja as pranchas). Em ×2, os Digimon viram blocos 2×2 ao lado de um Tamer e de um cenário em 1×1. É a mistura de densidades que a fase 2 do QO tirou com o `?dpr=1`.
2. **Proporção do próprio DS e do resto do jogo.** Em ×1, o Guilmon fica da altura do Tamer e do Guilmon PixelLab, e o Gabumon um pouco menor, o que comparar oficial × PixelLab × à mão pede. Em ×2 (= auto hoje), o parceiro fica com **o dobro da altura do Tamer** e cobre o Tamer na fileira e em combate.
3. **auto (48–64 px) só faz sentido depois do Tamer novo.** A faixa vem da ART_DIRECTION_V2 §1.5 (Tamer e parceiro em 56–64 px nativos), mas o Tamer ainda é o de 30 px. Quando houver Tamer de 56–64 px desenhado nativo, a escala de tela cai (o `dprLayout` passa de 3× para algo entre 1× e 2×, §1.5) e aí `monscale=2`/`auto` deixa parceiro e Tamer na mesma régua. Até lá, ×2 é só um zoom do Digimon. **[H]** Isso ainda não foi testado com um Tamer real de 56–64 px.

## O que falta (frames)

| Falta | Hoje | Para ter |
|---|---|---|
| **Costas (N)** do Guilmon e do Gabumon | Guilmon N → perfil W; Gabumon N → NW (costas 3/4) | O DS não tem. Precisaria arte nova (perde o "igual ao oficial") ou outra fonte oficial (Dawn/Dusk, Story) **[H]**, que não verifiquei nesta sessão. |
| **Perfil E/W do Gabumon** | SW / SE | Idem: o DS não tem. |
| **Ataque desenhado no mapa** | Guilmon: quadro de passo (#2 de frente, #8 de lado) com avanço procedural. Gabumon: punho erguido (#15) de frente, passo nas diagonais. | O DS só tem ataque nas poses de **batalha** (75–80 px). Usar essas poses no mapa exige reduzir (não é mais pixel oficial) ou mostrar ~2,5× maiores. Ficaram fora. |
| **Dano (hurt) desenhado no mapa** | Quadro parado com flash e knockback procedurais | Igual ao ataque: só existe a pose de batalha. |
| **Idle com respiração** | 1 quadro, com o bob do controlador | O DS usa 1 quadro parado no mapa. |
| **Walk S do Gabumon** | 2 quadros (#13 ↔ #14) | É tudo o que a folha tem. |

## Verificação [E]

- `npm test` (vitest): **48 arquivos, 453 testes verdes**, incluindo os 8 novos. Rodou no worktree compartilhado, com o trabalho em andamento do outro agente junto. O resultado do worktree limpo está no fim deste arquivo.
- `tsc --noEmit`: ok.
- Os testes de `?team=compare` (feedback1) continuam verdes.

## Limitações

- **Worktree compartilhado:** outro agente estava trabalhando ao mesmo tempo no mesmo worktree (`qo`), com o forest-v12 e arquivos de mapa/HUD não commitados. Fiz commits só dos meus arquivos (`git add` por caminho). As capturas saíram de um worktree limpo temporário no meu commit.
- **Facing no golpe [H]:** no GIF de attack, o Guilmon aparece de perfil W enquanto a explosão sai à direita. A convenção de espelho é a mesma do rip atual (W desenhado, E espelhado), e o walk mostra os dois lados certos. Não isolei se, naquele instante, o alvo lógico estava à esquerda. Vale um olhar do QA.
- **Velocidade dos GIFs:** a máquina estava carregada (load 4–14), e os tempos entre quadros são os medidos, então o ritmo pode oscilar.
- **Rótulos de direção [H]:** SW/NW do Gabumon e S/W do Guilmon foram conferidos no olho; os espelhos foram provados pixel a pixel.
- **Retratos do HUD** com `?mon=official` usam o quadro oficial do mapa (31 px). Ficam menores e mais serrilhados que os retratos atuais.
- **IP:** são sprites oficiais de terceiros (Bandai Namco / Toei), liberados no projeto pelo ADR-009 só para o fan game sem monetização. A publicação continua exigindo aprovação separada do fundador. O crédito do ripper do Guilmon (Sonicteam24) é obrigatório pela própria folha e está no `license.json`.
