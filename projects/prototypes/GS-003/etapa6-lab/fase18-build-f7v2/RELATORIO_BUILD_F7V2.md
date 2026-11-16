# Relatório: Comando 12.2, build isolado da F7v2 (Agumon) para o teste do Vitor

**Data:** 2026-11-14 · **Autor:** game-dev (Opus 5.5) · **Status:** build no ar, **não homologado**. Próximos: game-qa, ChatGPT, Vitor.
**Atualização 12.2b (2026-11-14, commit `415825a`):** ajustes depois do QA independente (QA-B1, QA-B2, QA-B3 e QA-B5). As instruções válidas estão na seção **0. Como testar (v2)** abaixo; a §1 original ficou só como histórico e tem dois erros (golpe 2 e "qualquer golpe solta fogo").
Fan game não oficial e não licenciado; uso só local; nada publicado.

## 0. Como testar (v2) — Comando 12.2b

**Link:** http://127.0.0.1:5196/?novo=1&linhas=rookie (local, só nesta máquina). Começa com o **Agumon F7v2 Nv.20** (Gomamon na reserva).

**Golpes do Agumon Nv.20 e quem solta o fogo F7v2** [E: `capturas/v2b/combate.json`, `combate_rodada2.json`, `ordem_S.json`]

| Tecla | Golpe | Tipo / elemento (moves.json do jogo) | Fogo F7v2 | Efeito do golpe |
|---|---|---|---|---|
| `1` | Mach Jab | físico / neutro | **não** | o próprio (`multi_hit_flurry`) |
| `2` | **Uppercut** (não é o Pepper Breath) | físico / fogo | **não** | o próprio (`claw_slash`) |
| `3` | Baby Burner | especial / fogo | **sim**, 1 bola saindo da boca | sem o orbe genérico por cima |
| `4` | Triple Baby Flame | especial / fogo | **sim**, 1 bola (o pacote tem um projétil só; não são três) | sem o orbe genérico por cima |
| — | golpe automático (Investida) | físico / neutro | não | o próprio |

- O **Pepper Breath não está equipado** no Agumon Nv.20 (está no learnset, Nv.8). Pela mesma regra ele soltaria o fogo, mas no teste ele não aparece em nenhuma tecla. Não equipei nada (é dado de jogo).
- Regra no código (`view.ts`, `firesSpriteProjectile`): solta o fogo quem tem, no `moves.json` do jogo, `element: "fire"` **e** VFX `fireball` (sopro). O Uppercut é de fogo, mas é golpe de garra, então fica com o efeito dele.
- Combate real: clique num selvagem e aperte a tecla do golpe. O Agumon também usa golpes sozinhos (AUTO), então às vezes entra um Mach Jab ou um Uppercut entre os seus.

**`K` = ataque de teste** (só neste build): o Agumon ataca na direção em que está virado, sem alvo e sem dano, e sempre solta o fogo F7v2. É o jeito limpo de ver idle → ataque → fogo → recuperação → idle. Para escolher a direção: ande para o lado, solte a tecla, espere o Agumon parar e aperte `K`. No E e no W o voo fica livre; no S o fogo cruza o Tamer e agora passa **sempre na frente dele**.

**Comparar com o F2b:** o mesmo link com `&agumon=v8` (http://127.0.0.1:5196/?novo=1&linhas=rookie&agumon=v8). O `K` funciona lá também (ataque com o fogo pintado no sprite, sem projétil).

**O que observar na walk S (entrada e saída):** ande para baixo (`S`) por 2–3 s e solte.
- A walk agora tem a **mesma lógica de tempo do F2b**: ~117 ms por quadro (mediana; F2b: 100 ms), sem pular quadro. Ver a tabela abaixo.
- **Entrada:** do idle S a walk começa num quadro do meio do ciclo (ex.: `walk_S_04`), não no q0, porque o motor escolhe o quadro pela distância andada. Ao começar a andar de lado, o Agumon passa antes por quadros E/W (a curva do "seguir").
- **Saída:** a walk vai direto para o idle animado (ex.: `walk_S_01 → idleanim_S_02`), sem quadro intermediário.
- Compare passada, joelho e braço com o F2b (`&agumon=v8`) e veja se o pé parece escorregar no chão (abaixo).

**Cadência medida (Chromium headless, 1280×720, rAF ~60 Hz, ±17 ms)** [E: `capturas/v2b/walk_cadencia.json`]

| | F7v2 antes (QA 12.2) | **F7v2 agora** | F2b (`&agumon=v8`) |
|---|---|---|---|
| ms por quadro, mediana (média) por direção | ~43 | **S 117 (125) · N 117 (122) · E 117 (113) · W 117 (123)** | 100 (105–110) |
| Quadros pulados / trocas | 7 / 135 | **0 / 55** | 0 / 62 |
| px andados por quadro | ~3 | **10,0–10,9** | 9,1–9,6 |
| Velocidade da parceira | ~74 px/s | 82 px/s | 82 px/s |

- **Pé escorregando: sim, pela conta.** O pacote foi desenhado para 3 px por quadro (pé de apoio parado). Agora a parceira anda ~10,5 px por quadro, então o pé de apoio desliza ~7–8 px do mundo (~15 px de tela) por quadro. O F2b anda ~9,5 px por quadro e também não tem pé fixo. [H] Na walk S/N o deslize é no eixo da profundidade e quase não aparece a 1× (`capturas/v2b/walk_S_entrada_saida_f7v2.png`); no E/W deve aparecer mais. É o preço da comparação justa que o brief pediu.
- O ciclo F7v2 fica ~10% mais lento que o do F2b porque os quadros do pacote têm 110 ms e os do F2b, 100 ms. A lógica é a mesma.

**Faixa roxa** no topo: "BUILD ISOLADO F7v2 … K = ataque de teste · fan game não oficial".

### Mudanças da 12.2b (branch `lab/f7v2`, commit `415825a`)

| Arquivo | Mudança |
|---|---|
| `scripts/lab/import-f7v2.mjs` | tira o `walkSpeedPxPerSec` (era 3000/110). A walk usa a referência padrão do motor, como o F2b (100 px/s → 1 quadro a cada 11 px). O `lab-assets/a-f7v2` foi refeito; a cópia anterior está em `lab-assets/_anteriores/a-f7v2_20261115015348`. `diff -rq`: só o `pixellab9/lab-character.json` mudou; 0 PNG alterado |
| `src/render/presenter.ts` | o ataque guarda o `moveId` do golpe (só apresentação; a sim não muda) |
| `src/render/view.ts` | `firesSpriteProjectile`: só os golpes de sopro de fogo soltam o projétil e escondem o efeito genérico; os outros voltam a desenhar o efeito próprio. Ordem: o fogo que vai para S/E/W fica sempre na frente do Tamer dono quando ele está à frente (y maior) do Agumon |

**P3 (fogo cruzando o Tamer): feito**, porque a mudança é de 3 linhas e só mexe na ordem de desenho do projétil. Medido no `K` para o S, Tamer 44 px à frente: em 64 amostras por rAF, o fogo ficou atrás do Tamer **0 vezes**; pela regra antiga, ficaria 25 vezes (`ordem_S.json`, `K_S_fogo_na_frente_do_tamer.png`). Efeito colateral [H]: enquanto o fogo vai para S/E/W e o Tamer está à frente, ele também fica na frente de props entre o Agumon e o Tamer. O N não mudou (o fogo continua atrás do Agumon). O nome do Tamer por cima do Agumon (QA-B4) é do Lab A e não foi mexido.

**Validação 12.2b** [E]: `tsc --noEmit` 0 erros; `vitest` 523/527, as mesmas 4 falhas antigas de `tests/lab-duas-linhas.test.ts` (numa primeira rodada, logo depois do Chromium, deram 7 falhas em 4 arquivos por carga da máquina; as duas rodadas seguintes deram 523/527); rebuild do `dist-lab-f7v2`; reinício **só** do `gs003-lab-f7v2-5196` (HTTP 200); `gs003-lab-a-5191` ativo, `dist-lab-a/index.html` com a data de 2026-11-14 09:04; Chromium headless com **0 erros de console e 0 falhas de rede** em todas as rodadas (walk F7v2 e F2b, combate 2 rodadas, K no S). Database: `md5sum` de `database/data/*.json` igual antes e depois. 0 gerações. Sem push nem deploy.

**Capturas (em `capturas/v2b/`)**

| Arquivo | O quê |
|---|---|
| `walk_S_entrada_saida_f7v2.png` / `_f2b.png` | uma captura por troca de quadro: idle → walk S → idle, com o tempo de cada uma |
| `walk_cadencia.json` | cadência por direção, pulos, px por quadro, sequência da walk S |
| `combate_E_g3_baby_burner.png`, `combate_E_g4_triple_baby_flame.png` | golpe de fogo: a bola saindo da boca |
| `combate_E_g1_mach_jab.png`, `combate_E_g2_uppercut.png` | golpe físico: sem fogo, com o efeito e o dano do golpe |
| `combate.json`, `combate_rodada2.json` | por golpe: ataques, projéteis e se o efeito do golpe é desenhado |
| `K_S_fogo_na_frente_do_tamer.png`, `K_S_fogo_tamer_*.png`, `ordem_S.json` | `K` para o S: o fogo passa na frente do Tamer do começo ao fim |

Roteiros (reexecutáveis, fora do jogo): `workspaces/game-dev/tools/f7v2b/` (`lib.mjs` adaptado do game-qa, `walk.mjs`, `combat.mjs`, `ordem_s.mjs`; rodar com `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`).

**Ainda em aberto:** o rótulo interno "ficha v9 PixelLab" do manifesto (QA-B5, só documentação; não mexi no texto do Lab A); o golpe seguinte cortando o ataque (B1, regra de combate); o número de dano antes do impacto (B3); o nome do Tamer sobre o Agumon (QA-B4, Lab A).

## 1. Link e como testar (histórico, 12.2: **substituído pela §0**)

**Link:** http://127.0.0.1:5196/?novo=1&linhas=rookie (local, só nesta máquina)

| Parâmetro | Efeito |
|---|---|
| `?novo=1` | jogo novo (o save desta porta é separado do da 5191, porque o localStorage é por origem) |
| `&linhas=rookie` | começa já com o **Agumon F7v2** Nv.20 (e Gomamon na reserva) |
| sem `linhas` | igual ao Lab A: começa com **Koromon**; `Y` evolui Koromon → Agumon → Greymon; `Tab` troca para a linha do Gomamon |
| `&agumon=v8` | volta ao **F2b** (pixellab8) para comparar no jogo; `v7`, `v6` etc. continuam valendo |

**Teclas:** `W A S D` andam (o Agumon segue o Tamer); **`K` = ataque de teste** do Agumon na direção em que ele está virado (idle → ataque + Pepper Breath → recuperação → idle); clique num selvagem + `1`–`4` = combate real (o golpe `2` é o Pepper Breath); `Y` evolui; `Tab` troca de linha.

**Para ver as 4 direções:** ande alguns passos para um lado, solte a tecla, espere o Agumon parar e aperte `K`. Repita para S, N, E e W. A entrada e a saída da walk S aparecem ao começar e ao parar de andar para baixo (`S`).

O `K` é só visual: não tem alvo, não dá dano e não mexe na sim. O fogo **atravessa o Tamer** (aliado não colide). Como o Agumon anda atrás do Tamer, ao parar e apertar `K` o fogo costuma passar por cima dele. Para ver o voo livre, ande para um lado e depois dê um passo para o lado oposto antes do `K`.

Faixa roxa no topo: "BUILD ISOLADO F7v2 … K = ataque de teste · fan game não oficial".

## 2. Isolamento [E]

- **Worktree próprio:** `workspaces/game-dev/lab-f7v2`, branch **`lab/f7v2`** (criada a partir de `lab/etapa6` b4b6cc2), commit local **`5640a3f`**. O `node_modules` é um symlink para o do `lab-etapa6` (não versionado).
- **O Lab A não foi tocado:** o worktree `lab-etapa6` está com o `git status` limpo; `dist-lab-a/index.html` mantém a data 2026-11-14 09:04; o serviço `gs003-lab-a-5191` continua ativo (HTTP 200).
- **O jogo principal (master) não foi tocado.** Não houve deploy, push nem merge. Database e formato de save não foram alterados.
- **Assets próprios:** `etapa6-lab/lab-assets/a-f7v2/` é uma cópia 1:1 de `lab-assets/a` (`diff -rq`: a única diferença é a pasta nova) mais `digimon/CREATURE-0006/pixellab9/` (a F7v2). `lab-assets/a` não foi alterado. Por isso um rebuild futuro do Lab A **não** passa a usar a F7v2 por acidente.
- **Pixels:** os 106 PNG do pacote e os 22 do projétil foram copiados byte a byte (`cmp`: 0 diferenças). **0 gerações PixelLab.**
- **Build:** `VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-f7v2 VITE_LAB_BUILD=f7v2 npx vite build --outDir dist-lab-f7v2`.
- **Serviço:** `gs003-lab-f7v2-5196` (systemd de usuário, transitório como o da 5191, `Restart=on-failure`, `--setenv=PATH=$PATH`), executa `npx vite preview --outDir dist-lab-f7v2 --port 5196 --strictPort --host 127.0.0.1`. **Não sobrevive a um reboot**, assim como o da 5191.
  - Parar: `systemctl --user stop gs003-lab-f7v2-5196`.
  - Subir de novo: o mesmo `systemd-run` do PROGRESS.md.

## 3. O que foi mexido (código, branch `lab/f7v2`)

| Arquivo | Mudança |
|---|---|
| `vite.config.ts` | `VITE_LAB_ASSETS_DIR` troca só a pasta de assets, mantendo a variante `a`. `VITE_LAB_BUILD` vira `__LAB_BUILD__`. Sem essas variáveis, nada muda |
| `scripts/lab/import-f7v2.mjs` (novo) | monta `lab-assets/a-f7v2` e o `pixellab9/lab-character.json` a partir do `pacote.json` e do `projetil.json`. Se a saída já existir, ela é movida para `_anteriores/`, sem apagar nada |
| `src/assets/lab-creatures.ts`, `lab-tamer.ts`, `creatures.ts` | duração **por quadro** (`ms` de cada quadro); `walkSpeedPxPerSec` vindo do manifesto; flag `exactTiming` no ataque; especificação do projétil de sprite (`spriteProjectile`) |
| `src/render/animctl.ts` | com `exactTiming`, o ataque toca nos tempos do pacote também quando é golpe especial (o motor comprimia a carga do especial) |
| `src/render/view.ts` | sistema de **projétil de sprite**: nasce, voa, ordem de desenho e impacto. Com ele, o Agumon F7v2 não desenha o orbe genérico do golpe. Também `faceOf()` para a tecla K |
| `src/main.ts` | tecla `K` (só com `VITE_LAB_BUILD=f7v2`) e o texto da faixa |
| `scripts/lab/capture-f7v2.mjs` (novo) | as capturas e os GIFs deste relatório |

### Como o pacote foi respeitado

- **Canvas 60×60** em todas as animações e rotações (o importador recusa outro tamanho).
- **Âncora** (29,5 ; 49) vira pivot (30, 49). A âncora em índice de pixel 29,5 cai na fronteira entre as colunas 29 e 30, que é a coordenada contínua 30, o centro do canvas. O motor desenha em `pos.x − pivot.x`, então a âncora fica exatamente sobre a posição da entidade. y = 49 segue a convenção do F2b no motor (linha do chão). É o mesmo pivot em todas as animações (não usa bbox).
- **Walk:** S experimental, N original e E/W como estão no pacote (W desenhado, sem espelho do motor). São 8 quadros. O motor avança o walk pela **distância andada**: com `walkSpeedPxPerSec = 3000/110 = 27,27`, ele troca 1 quadro a cada 3 px, o que mantém o pé de apoio parado no mundo em qualquer velocidade (é o "ajuste o delay" do `pacote.json`).
- **Idle:** 6 quadros com os delays por direção do pacote. O motor não troca esse idle pela "pose de pés juntos", porque isso só acontece com idle de 1 quadro.
- **Ataque:** 9 quadros com os delays por direção. As capturas confirmam a sequência q0…q8 nas 4 direções (ver o §5).
- `feliz` foi copiado, mas o motor do lab não tem um estado que o use, então fica sem uso.

## 4. Pepper Breath: valores do projétil

| Item | Valor | Origem |
|---|---|---|
| Quando nasce | no **início** do quadro de disparo: S q3, N q3, E q2, W q2 | `pacote.json`/`projetil.json`. Gatilho pelo quadro mostrado (`attack_<dir>_<NN>` ≥ disparo), uma vez por golpe. Por isso nunca há ataque sem fogo enquanto o Agumon está na tela |
| Onde nasce | pixel (12,12) do projétil sobre `origem_boca` (S 30,29 · N 30,12 · E 38,24 · W 21,24) do canvas do sprite **como desenhado** (inclui o avanço do golpe) | `projetil.json` |
| `nascer` | 2 quadros, 60 + 60 ms, parado | `projetil.json` |
| `voo` | 4 quadros de 80 ms em loop | `projetil.json` |
| **Velocidade** | **150 px/s** (px do mundo; 2 px de tela por px a 1280×720) | **[H] valor do jogo**, escolhido por mim (`SHOT_SPEED_PX_S`). O pacote sugeria 100, sem validação |
| **Alcance sem alvo (K)** | **96 px** (3 tiles), em linha reta na direção da boca | **[H] valor do jogo** (`SHOT_RANGE_PX`) |
| **Com alvo (combate)** | voa da boca até o ponto de acerto do alvo, em qualquer ângulo, com os quadros de voo da direção do Agumon; impacto ao chegar | **[H]** decisão minha |
| Colisão | **só visual**: com alvo, impacto ao chegar no alvo; sem alvo, no fim do alcance. Não colide com aliados nem cenário; não há hitbox 8×8 | o dano e o acerto continuam sendo da sim (inalterada) |
| `impacto` | 4 quadros, 60/70/80/90 ms, no ponto final | `projetil.json` |
| Ordem de desenho | N: **atrás do Agumon** (linha do chão − 0,5, subindo com o voo); S/E/W: **na frente** (+0,5, descendo com o voo no S) | `projetil.json`; ordenado junto com entidades e props |
| Vida total sem alvo | 120 + 640 + 300 = 1060 ms | soma |

**Tempo do dano no combate [E]/[H]:** o dano aparece quando a sim manda. No Pepper Breath (especial), isso acontece no início do quadro de disparo + 180 ms do motor. Com o selvagem a ~40 px, o voo leva ~270 ms (120 do nascer + ~150 de voo), então o número de dano aparece um pouco antes do impacto. Não alinhei os dois para não mexer na regra de tempo do combate.

## 5. Evidências [E]

Chromium headless-shell 1243 (`~/.cache/ms-playwright/chromium_headless_shell-1243`), `LD_LIBRARY_PATH` com os diretórios `.so` de `/tmp/chromelibs/ex`, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`, 1280×720. Tela a 2× (`cssPerLogical` 2). As capturas foram feitas em tempo real, a cada ~50 ms.

- **0 erros de console e 0 exceções** em duas rodadas completas: a F7v2 e a F2b por `?agumon=v8` (`capturas/relatorio_capturas*.json`).
- **Parceiro carregado:** `Agumon (Link A — ficha v9 …60x60 nativo…)`, `walkSpeedPxPerSec` 27,27, `projectile: true`, delays do ataque iguais aos do pacote nas 4 direções.
- **Projétil no quadro certo:** em S, N, E e W, a **primeira captura com o projétil é a mesma do quadro de disparo** (diferença de 0 capturas).
- **Sequências observadas:** idle → walk → idle → `attack_q0…q8` → idle nas 4 direções, com o projétil vivo até o impacto depois do q8. As sequências completas estão em `relatorio_capturas.json` › `dirs.<D>.seq`.
- **Combate real** (encontro forçado, selvagem a 40 px, golpe `2`): em S e E, 1 projétil por golpe; o orbe genérico do golpe não é desenhado para o Agumon F7v2.

| Arquivo (em `fase18-build-f7v2/capturas/`) | O quê |
|---|---|
| `f7v2_{S,N,E,W}_idle_walk_ataque_idle.gif` | **GIF por direção** (~5,5 s, recorte 2× em volta do Agumon, tempos reais): idle → walk → para → K → ataque + fogo → idle |
| `f7v2_{D}_a_idle.png` … `g_recuperacao.png` | quadros-chave a 3×: idle, **entrada da walk**, meio da walk, **saída da walk**, disparo, voo, recuperação |
| `f7v2_N_e_disparo.png` | o fogo nasce na cabeça, **atrás** do Agumon (de costas) |
| `f7v2_combate_{S,E}_projetil.png` | projétil no combate real indo até o selvagem |
| `f7v2_tela_inteira.png` | o mapa inteiro com HUD e faixa (contexto) |
| `*_f2b.*` | a mesma rodada com `?agumon=v8` (F2b, com o fogo desenhado no próprio sprite), para comparar |

**Testes:**
- `tsc --noEmit`: 0 erros.
- `vitest`: **523 passam e 4 falham**, todas em `tests/lab-duas-linhas.test.ts`. São as **mesmas 4 que falham no `lab/etapa6` sem nenhuma mudança minha** (verifiquei no worktree `lab-etapa6`): o teste espera o Agumon "v7" e o Gomamon v1, mas o `lab-assets/a` já tem as versões pixellab8 e as do Gomamon v2/v3. Não corrigi, porque está fora do escopo.
- `map:validate`: não rodei, porque não mexi em mapa.

## 6. Problemas e observações

| # | Gravidade [H] | Problema |
|---|---|---|
| B1 | P2 | **No combate real, o golpe seguinte corta o ataque**: a cadência de golpes da sim é menor que os 1,28–1,36 s do ataque, e o Agumon recomeça no q0 a partir do q6 ou q7. A recuperação (q7–q8) quase não aparece no combate; com o `K` ela aparece inteira. Corrigir exige mexer no ritmo de combate (regra de jogo), então não mexi |
| B2 | P3 | No `K`, o fogo atravessa o Tamer quando ele está na frente (aliado não colide). É esperado, mas pode parecer estranho no teste. Ver o §1 para ver o voo livre |
| B3 | P3 | O número de dano aparece ~100 ms antes do impacto do fogo no combate (§4) |
| B4 | P3 | O fogo nasce na boca e fica **parado no mundo** durante o `nascer` (120 ms); se o golpe avançar o corpo nesses 120 ms, a boca sai 1–2 px de cima do fogo. Não medi pixel a pixel |
| B5 | P3 | Ao começar a andar, o Agumon passa por quadros de outras direções (o "seguir" do motor faz a curva): é o comportamento normal do Lab A, mas mistura-se com a entrada da walk S que o ChatGPT pediu para observar. A entrada limpa está em `f7v2_S_b_walk_entrada.png` |
| B6 | P3 | Os GIFs têm ~3 MB (recorte 448×448, ~100 quadros) |
| — | — | O hook de depuração `window.__gs003` continua no build, como no Lab A (build local, não publicado) |

## 7. O que não foi feito

- Nada de polimento de pixel, nenhuma geração, nenhum deploy, push ou merge, nenhuma mudança no Lab A, no master, na Database ou no save.
- Não alinhei o tempo do dano com o impacto nem a cadência de combate com a duração do ataque (seria regra de jogo).
- Diagonais, `feliz` em uso e hitbox real do projétil ficaram de fora (não estão no pacote ou são do jogo).
- Não há teste unitário novo para o projétil; a verificação foi a captura no navegador.

## 8. Decisões que dependem do fundador

- Os valores de 150 px/s e 96 px de alcance (§4) e o alvo em qualquer ângulo no combate.
- Se o B1 (golpe cortando o ataque) deve virar tarefa para quem cuida do combate.
- Manter a walk S experimental, que é o que o Vitor vai testar. A volta à original é uma linha no `build_f7v2.py` do game-art, seguida de rodar de novo o `import-f7v2.mjs` e o build.
