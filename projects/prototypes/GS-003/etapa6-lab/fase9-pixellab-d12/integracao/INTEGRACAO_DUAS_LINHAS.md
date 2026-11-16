# Etapa 6, Fase 9 — Duas linhas jogáveis no Link A

> Executor: `game-dev` · 2026-11-14 · Brief: `fase9-pixellab-d12/BRIEF_GAMEDEV_DUAS_LINHAS.md` (pedido do fundador: "coloque o gomamon no jogo como segundo digimon… bukamon até ikkakumon e koromon até greymon").
> Worktree `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`, branch `lab/etapa6`, partiu de `d6cecf3`. **Commit: `9fc0028`.**
> Só o **Link A** (5191) muda de comportamento. Jogo principal (`3289e32`), Database e saves oficiais: intocados. Custo PixelLab: **0**. Sem push e sem deploy.

## 1. Como jogar (Link A, `http://127.0.0.1:5191/`)

| URL | O que dá |
|---|---|
| `?novo=1` (padrão) | **Koromon Nv.1 (ativo) + Bukamon Nv.1** na faixa da equipe. Dois parceiros, duas linhas. |
| `?novo=1&linhas=rookie` | Agumon Nv.20 + Gomamon Nv.20 (já aptos a evoluir). |
| `?novo=1&linhas=0` | Comportamento anterior (só o Agumon Nv.20). `?evo=0` desliga tudo. |
| `?novo=1&demo=evo2` | Painel + XP das vitórias ×25 + Auto-evoluir ligado (e preferência Agumon→Greymon, sem modal de escolha). |

- **Trocar o parceiro ativo:** `Tab`, o botão **Trocar (Tab)** do painel de laboratório (canto inferior esquerdo), ou o que já existia: clique no retrato da faixa da equipe / `Shift+2`. A troca é o `swap_partner` da sim (recarga e regras de sempre); o que sai ocupa o lugar na faixa.
- **Evoluir o ativo (atalho de laboratório):** tecla `Y` ou botão **Evoluir ativo (Y)**. Leva o ativo ao nível da próxima forma pelas regras normais de XP (aprende os golpes do caminho) e dispara o `evolve` real da sim. Evolução normal por jogo continua valendo (Bukamon→Gomamon Nv.8, Gomamon→Ikkakumon Nv.16, Koromon→Agumon Nv.8, Agumon→Greymon Nv.16).
- Cada parceiro evolui separadamente: para evoluir o da reserva, troque antes.

## 2. O que mudou (todos em `projects/prototypes/GS-003/prototype/world`)

| Arquivo | O que |
|---|---|
| `scripts/lab/import-pixellab-line.mjs` (novo) | **Importador genérico**: `node scripts/lab/import-pixellab-line.mjs <pacote> <speciesId> <N> [--name] [--anatomy] [--walk-fps 10] [--attack-fps 8] [--hit 3] [--float]`. Lê `rotations/`, `walk/<D>/`, `attack/<D>/` (a contagem vem dos arquivos), copia 1:1 para `lab-assets/a/digimon/<speciesId>/pixellab<N>/`, escreve `lab-character.json` e `_slice-report.json`. Pivô: y = pé de cada quadro (ou mediana com `--float`); x = mediana do centro de massa (o canvas varia entre a rotação e o andar). |
| `src/assets/lab-creatures.ts` | O catálogo lê **qualquer** `pixellab<N>/` de **qualquer** espécie (não exige o `lab-creature.json` legado). Por espécie vale a **maior N**; `?agumon=v7\|v6\|v5\|v4` fixa o Agumon e `?pl=CREATURE-0105:1,…` fixa qualquer espécie. `?agumon=v5\|v4` e `?fixer=0` continuam. |
| `src/assets/lab-tamer.ts` | Campos opcionais `speciesId`, `species`, `anatomy` no manifesto genérico. |
| `src/data/world-species.json` | **CREATURE-0120 Bukamon** (stats do Koromon, afinidade free) e **CREATURE-0121 Ikkakumon** (stats do Greymon ofensivo, vaccine): **placeholders de laboratório [H]**. Gomamon é o CREATURE-0105 que já existia (stats dele, intactos). |
| `src/data/moves-world.json` | Learnset de Bukamon e Ikkakumon (golpes de espécies equivalentes já existentes, placeholder), elemento água, `evolvesTo`: Bukamon→Gomamon (Nv.8), Gomamon→Ikkakumon (Nv.16). Nenhum dano/golpe existente foi alterado. |
| `src/main.ts` | Modo `?linhas=`, segundo parceiro na equipe do jogo novo, `Tab`/`Y`, painel de laboratório, `?demo=evo2`, `?pl=`; banner do Link A atualizado; **correção da placa de nome** (ver §5.3). |
| `tests/lab-duas-linhas.test.ts` (novo, 9 testes) | catálogo, quadros/pivôs, Bukamon sem ataque, ataque do Gomamon por direção (controlador: toca 1 vez e volta), pins de versão, caminhos de evolução e `evolve` pela sim nas 4 formas. |
| `tests/assets.test.ts`, `tests/lab-agumon-v6.test.ts` | Bukamon/Ikkakumon isentos do "toda espécie da sim tem visual em GAME-ASSETS" (arte vive em `lab-assets`); o teste do v6 fixa `"v6"` explicitamente (para continuar valendo depois que o v7 virar o padrão). |
| `scripts/lab/capture-fase9-duas-linhas.mjs`, `probe-ataque-unico-gomamon.mjs`, `sheet-pixellab-line.mjs` (novos) | capturas via CDP, sonda do ataque único e folha de quadros com o pivô. |

Pacotes importados (assets fora do worktree, em `etapa6-lab/lab-assets/a/digimon/`): `CREATURE-0120/pixellab1` (Bukamon: rotações 32×32, andar 44–48 px, N = 1 quadro), `CREATURE-0105/pixellab1` (Gomamon: rotações 48×48, andar 60–68 px, ataque 9q em S/N e 8q em W/E), `CREATURE-0121/pixellab1` (Ikkakumon: rotações 64×64, andar 76×76 8q nas 4 direções). **Quadros 1:1, nada reescalado nem editado (D13).**

### Ligar o pacote Koromon / Agumon v7 / Greymon (quando chegar)
Sem mudar código:
```
cd projects/prototypes/GS-003/prototype/world
node scripts/lab/import-pixellab-line.mjs <pacote_koromon_v1>  CREATURE-0005 1 --name Koromon --anatomy biped
node scripts/lab/import-pixellab-line.mjs <pacote_agumon_v7>   CREATURE-0006 7 --name Agumon  --anatomy biped   # vira o padrão; ?agumon=v6 volta ao v6
node scripts/lab/import-pixellab-line.mjs <pacote_greymon_v1>  CREATURE-0007 1 --name Greymon --anatomy biped
VITE_LAB_VARIANT=a npx vite build --outDir dist-lab-a && systemctl --user restart gs003-lab-a-5191
```
(`--float` só para quem flutua; `--hit N` o quadro do evento de ataque; `--walk-fps`/`--attack-fps` conforme o `pacote.json`.) Se o Greymon/Agumon trouxerem ataque, o catálogo liga sozinho o `ATTACK` e o ataque nas 4 direções.

## 3. Verificação (números)

- `tsc --noEmit`: **sem erros**. `vitest`: **524/524** (515 de antes + 9 novos), 57 arquivos. `map:validate --no-write`: **PASS em 9/9 mapas** (nenhum relatório versionado alterado; `git status` limpo no fim).
- Build `dist-lab-a` ok (aviso de chunk > 500 kB já existia). **5191 reiniciada pelo serviço `gs003-lab-a-5191`** (`systemctl --user restart`): ativo, 200. **5192 e 5193: 200, intocadas.**
- Console do navegador: **0 erros** nas duas rodadas de captura e na sonda (`consoleErrors: []`).
- **Ao vivo (`capture-report.json`)**: Tab troca Koromon↔Bukamon (as duas vezes, `true`); evoluções reais pela sim (`evoGomamon/evoIkkakumon/evoAgumon/evoGreymon: true`): Bukamon Nv.1 → Gomamon Nv.8 → Ikkakumon Nv.16; Koromon Nv.1 → Agumon (v6) Nv.8 → Greymon Nv.16. Manifesto de cada estágio confere (ficha v1 PixelLab 32/48/64 px, v6 56 px, pose única do Koromon/Greymon).
- **Ataque de garra do Gomamon, ao vivo, 4 direções** (`capture-report-ataque-unico-gomamon.json`): cada golpe toca os quadros em ordem **uma vez** (S `attack_S_00…08`, N `…00…08`, W/E `…00…07`) e volta a `idle`/andar quando o combate acaba. Enquanto o encontro continua, o auto-ataque dispara o golpe seguinte (comportamento normal). O controlador de animação também é coberto por teste (`attack` → `idle`, evento `hitFrame` = quadro 3 → disparo em 375 ms).
- `?demo=evo2` ao vivo: `xpMult 25`, Auto-evoluir ligado, preferência Agumon→Greymon; botões do painel funcionam (Trocar → Bukamon; Evoluir ativo → Gomamon Nv.8), 0 erros.

## 4. Capturas (`integracao/duas_linhas/`)

| Arquivo | O que mostra |
|---|---|
| `01_inicio_equipe_dois_parceiros.png` | `?novo=1`: Koromon ativo, Bukamon na faixa da equipe e o painel de laboratório |
| `02_tab_troca_para_bukamon.png`, `03_tab_volta_para_koromon.png` | Tab em ação |
| `folha_l1_1_koromon.png`, `folha_l1_2_agumon_v6.png`, `folha_l1_3_greymon.png` | **Linha 1**: cada estágio parado (S) e andando S/W/N/E (recorte 3×) |
| `folha_l2_1_bukamon.png`, `folha_l2_2_gomamon.png`, `folha_l2_3_ikkakumon.png` | **Linha 2**: idem |
| `folha_l2_2_gomamon_ataque.png`, `l2_2_gomamon_ataque_garra_{S,W,E,N}_q03(.png,_zoom.png)` | garra no quadro 3 em cada direção |
| `l<linha>_<n>_<espécie>_{parado_S,andar_S,andar_W,andar_N,andar_E}(.png, _zoom.png)` | captura inteira + recorte 3× de cada etapa |
| `folha_quadros_{bukamon,gomamon,ikkakumon}_pivo.png` | todos os quadros 2× com o pivô (traço magenta) e a linha do chão (verde) — conferência do alinhamento pelo pé |
| `capture-report.json`, `capture-report-ataque-unico-gomamon.json` | dados brutos (erros de console, sequências de quadros, espécies/níveis, manifestos) |

## 5. Problemas e observações

1. **Selvagens mudam no Link A**: o sorteio de encontros usa "toda espécie com visual", então Gomamon selvagem passa a usar a arte nova (com garra), e **Bukamon e Ikkakumon (raros, estágios mais altos) agora podem aparecer como selvagens** (um Ikkakumon Nv.12 apareceu numa captura). Não toquei no sorteio nem no balanceamento (fora do brief). Fora do Link A, essas duas espécies não têm visual e não sorteiam.
2. **Dados da sim são compartilhados entre os links**: `world-species.json` e `moves-world.json` valem para todo o worktree `lab/etapa6` (A, B, C); nenhum link além do A tem arte para Bukamon/Ikkakumon (por isso a isenção no `assets.test.ts`). Jogo principal (`3289e32`) não é afetado.
3. **Correção colateral (placa de nome)**: o Presenter mostra `manifest.name` na troca/evolução e os manifestos do laboratório têm rótulo longo ("Bukamon (Link A — ficha v1 PixelLab, TESTE…)") ou o nome em minúsculas do `lab-creature.json`. Apareceu na primeira captura. Corrigi em `main.ts` (`plainNames`): o Presenter recebe o nome da espécie da sim; o rótulo longo continua no manifesto. Tem efeito também nas evoluções antigas do Link A/B.
4. **Padrão do `?novo=1` mudou no Link A** (de Agumon Nv.20 sozinho para Koromon+Bukamon Nv.1). `?linhas=0` restaura o anterior; `?linhas=rookie` dá as duas já evoluíveis.
5. **Bukamon**: andar = flutuar (8q em S/W/E; N é 1 quadro parado, como no pacote) e **sem quadro de ataque**; **Ikkakumon**: sem ataque. Os dois usam o avanço procedural do motor ao atacar. **Não testei ao vivo o ataque de Bukamon e de Ikkakumon.**
6. **Koromon e Greymon seguem em pose única** (placeholder do Comando 5) até chegar o pacote Koromon v1/Greymon v1; o Agumon é o v6 até chegar o v7. A escala entre as formas (Bukamon 32 px, Gomamon 48 px, Ikkakumon 64 px nativos; Agumon 56 px) é a do pacote — a questão de escala Tamer/Digimon (Etapa 6) continua aberta e **não foi decidida aqui**.
7. **Defeito de arte já conhecido** nas costas do Agumon v6 (N) continua; nas costas do Gomamon (N) o corpo também sai liso, sem cauda legível (ver `folha_quadros_gomamon_pivo.png`). Não corrigi (proibido editar arte): fica para `game-art`/QA.
8. **Atalho Y é de laboratório**: sobe o nível do parceiro via `grantXp` (sem fanfarra de nível) e dispara o `evolve` da sim; não é o caminho de jogo. O caminho de jogo (vitórias → nível → Evoluir/Auto-evoluir) não foi percorrido do começo ao fim ao vivo, só pelos testes da sim e por `?demo=evo2` (XP ×25, verificado apenas o estado e os botões).
9. **Recarga de troca**: o `swap_partner` tem recarga (a sim recusa com mensagem no log); trocas seguidas muito rápidas pelo Tab são ignoradas até a recarga acabar.
10. Os ganchos `window.__gs003` e o painel de laboratório seguem no build (só laboratório, não publicado). `lab-assets/` vive fora do worktree (como na v5/v6): os testes `lab-duas-linhas` só passam onde essa pasta existe (aqui, sim); os importadores reproduzem a pasta a partir dos pacotes.

## 6. Decisões do fundador / próximos passos

- Aprovar (ou não) as três artes novas (em especial costas do Gomamon, andar flutuante do Bukamon e a escala 32/48/64 px).
- Decidir se Bukamon/Ikkakumon podem aparecer como selvagens no Link A (item 1) e se Bukamon/Ikkakumon merecem ataque próprio (hoje só o Gomamon tem).
- Mandar o pacote Koromon v1 / Agumon v7 / Greymon v1 (o §2 dá os comandos).

## 7. ATUALIZAÇÃO — linha 1 do PixelLab integrada (commit `f805d5a`)

Chegou o pacote da linha 1 e foi ligado só pelo importador (sem mudar a lógica do catálogo):
`pacote_koromon_v1` → CREATURE-0005 `pixellab1` (32×32 parado; pular 8q em S/W/E com `--float` para manter o salto; N = 1 quadro; sem ataque), `pacote_agumon_v7` → CREATURE-0006 `pixellab7` (48×48; andar 8q + Pepper Breath 9q nas 4 direções, evento no quadro 4) e `pacote_greymon_v1` → CREATURE-0007 `pixellab1` (64×64; andar 8q + Mega Flame 9q nas 4 direções, evento no quadro 4). **Linha 1 final: Koromon v1 → Agumon v7 → Greymon v1.** O Agumon v7 é o padrão (maior N); `?agumon=v6|v5|v4` voltam às fichas antigas e `?fixer=0` à pose única.

- Verificação: `tsc` limpo, `vitest` **525/525** (teste da linha 1 reescrito para as fichas novas), build ok, 5191 reiniciada pelo serviço (200; 5192/5193 intocadas, 200), **0 erros de console**. Evoluções ao vivo: Koromon Nv.1 → Agumon v7 Nv.8 → Greymon v1 Nv.16 e Bukamon → Gomamon → Ikkakumon, Tab nas duas direções.
- Ataques ao vivo nas 4 direções, quadros em ordem, uma vez e volta: Pepper Breath (Agumon v7) e Mega Flame (Greymon v1) em `capture-report.json` (`stages.l1_2_agumon_v7.attacks`, `l1_3_greymon.attacks`), capturas `l1_2_agumon_v7_ataque_pepper_breath_*_q04` e `l1_3_greymon_ataque_mega_flame_*_q04` (+ `folha_l1_*_ataque.png`). Folhas de pivô: `folha_quadros_{koromon,agumon_v7,greymon}_pivo.png`.
- As capturas de §4 da linha 1 foram refeitas com a arte nova (nomes `l1_2_agumon_v7_*`; `folha_l1_2_agumon_v6.png` deixou de existir).
- Os itens de §5 sobre "Koromon e Greymon em pose única" e "Agumon v6" **ficam superados**; o defeito de costas do v6 não foi reavaliado no v7 (ver `folha_quadros_agumon_v7_pivo.png`). A escala entre formas agora é Koromon 32 → Agumon 48 → Greymon 64 px nativos (Bukamon 32 → Gomamon 48 → Ikkakumon 64): é a dos pacotes; a questão de escala segue aberta.
- Não testado: o caminho de jogo completo (vitórias → nível → evolução) ao vivo; o ataque do Greymon contra alvos em movimento real.

## 8. ATUALIZAÇÃO — bebês já em Nv.16: evoluir direto, sem upar

Pedido do fundador: "coloca o koromon e o bukamon ja em lv para eu evoluir para agumon e depois para champion, nao quero upar, quero testar".

**O que fazer no jogo (Link A, `http://127.0.0.1:5191/?novo=1`, padrão):**
1. Escolha o Tamer e entre. O ativo é o **Koromon Nv.16**; a reserva é o **Bukamon Nv.16** (XP 0, nada para farmar).
2. Logo ao carregar, abre sozinho o **Digivice → Evolução** com o aviso **"Digivolução disponível"**. Clique em **Evoluir** no nó do Agumon (botão sob o nó em 100%). Passa a Agumon (rookie), com a animação normal de digivolução.
3. Terminada a animação, o aviso abre de novo (Agumon já cumpre o Nv.16 do Greymon). Clique em **Evoluir** no nó do Greymon (champion). Se fechar o aviso ("agora não"), reabra pelo botão **Digivice** da barra → aba **Evolução**.
4. Para a outra linha: **Tab** (ou botão "Trocar (Tab)"), e repita: Bukamon → Gomamon → Ikkakumon.
O atalho **Y**, o botão "Evoluir ativo (Y)", `?linhas=rookie|0`, `?demo=evo2` e `?evo=0` seguem como antes.

**Mudança (só `src/main.ts`, todas só com `?linhas=bebe`, ou seja, Link A em jogo novo):**
- `LAB_BABY_START_LEVEL = 16` (nível mínimo do champion): o Koromon (`LAB_EVO_PARTNER_LEVEL`) e o Bukamon (`LAB_SECOND`) nascem em Nv.16 com XP 0. Antes: Nv.1 (`STARTER_LEVEL`).
- `LAB_OFFER_LINEAR` / `offersEvolve()`: o aviso automático "Digivolução disponível" só abria para espécies com ramificação (`isBranching`); como as duas linhas são de caminho único até o rookie, não abria nunca. Agora, só neste modo, abre para qualquer espécie que ainda tenha caminho **quando o nível já atinge o requisito** (não só ao subir de nível). O fluxo é o existente (Digivice, aba Evolução, nó em 100%, intent `evolve` da sim).
- Não mudou: stats, dano, requisitos de evolução (Koromon→Agumon Nv.8, Agumon→Greymon Nv.16; Bukamon→Gomamon Nv.8, Gomamon→Ikkakumon Nv.16), regras de XP, sim, Database, saves, as outras portas (5192, 5193) e o jogo principal. O título da barra superior do Link A foi atualizado.

**Verificação:**
- `tsc` limpo; `vitest` **527/527** (2 testes novos em `tests/lab-duas-linhas.test.ts`: os requisitos 8/16 das duas linhas e Nv.16/XP 0 → `evolve` → `evolve` sem mexer no nível; a primeira rodada completa deu 6 timeouts de 5 s com vários processos concorrentes na máquina, e a repetição sozinha passou com `--testTimeout=20000`).
- Build `dist-lab-a` e `systemctl --user restart gs003-lab-a-5191`: 5191 = 200; 5192 = 200 e 5193 = 200 (intocadas).
- **Teste ao vivo** (`scripts/lab/capture-fase9-evoluir-direto.mjs`, Chromium headless pelo CDP, clicando no botão **Evoluir** do Digivice, sem Y): carregar → aviso → Evoluir → Evoluir, nas duas linhas; em cada passo conferido a espécie na sim, o fim do bloqueio da animação e o manifesto do sprite de mapa: Koromon v1 → Agumon v7 → Greymon v1; Bukamon v1 → Gomamon v1 → Ikkakumon v1. `prompted: true` nos 4 passos, **0 erros de console** (`capture-report-evoluir-direto.json`).
- Capturas em `integracao/duas_linhas/`: `evoluir_direto_{koromon,bukamon}_{1_rookie,2_champion}_{a_aviso,b_depois}.png` (aviso antes do clique; sprite depois).

**Problemas / observações:**
- O nome do atalho "Evoluir ativo (Y)" continua no painel de laboratório; o caminho do fundador agora é o botão do Digivice.
- O aviso abre o Digivice por cima do mapa assim que o jogo carrega (comportamento do fluxo existente com `evoPrompt`); "agora não" o dispensa.
- O ambiente tem `NODE_USE_ENV_PROXY=1`: scripts CDP precisam de `NODE_USE_ENV_PROXY=0 NO_PROXY=127.0.0.1` para o `fetch` ao DevTools local funcionar.
- Não testado: combate depois de evoluir pelo botão; save/recarregar nesse estado (slot do Link A não foi tocado).
