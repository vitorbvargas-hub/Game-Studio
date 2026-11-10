# P7 + GS-012 (passos 5–7): game-dev

- **Autor:** game-dev (MAP-ENGINEER/GAME-INTEGRATOR, GS-003, ADR-012) · **Data:** 2026-11-10
- **Branch:** `quality-overhaul` (worktree `~/projects/GameStudio/workspaces/game-dev/qo`).
  - O `master` entrou antes por `git merge master` (`d1a1cc7`), sem conflito.
  - Commits: `fa0ab12` (P7 no derivador), `d9b1550` (GS-012 na sim), `6dd415d` (jogo, FX, debug, capturas).
- **Base:** `phase2/design/P7_CLAREIRA_BRIEF.md`, `phase2/PHASE2_DEV.md`, `encounters/ENCOUNTER_ARCHITECTURE.md`, `encounters/tables/digimon-forest-01.json` e `docs/DRAKANTOS_VISUAL_STUDY.md`.
- **Legenda:** **[E]** evidência (arquivo, comando ou medição de 2026-11-10) · **[H]** hipótese.
- **Regras:** caminhos de código relativos a `GS-003/prototype/world/`. A 5174 e o `master` não foram tocados; tudo rodou na **5190**.
- **Escopo das flags:** sem `?look=v9` e sem `?encounters=1`, o jogo é o mesmo de antes. Há teste para isso: 31 selvagens, sem estado de encontros.

## 0. Resumo

| Item | Estado | Onde |
|---|---|---|
| P7 Clareira recomposta (x12–41 × y6–29) | no gerador (`derive-look-v9.mjs` + `p7-clareira.mjs`); `.tmj` não editado à mão | `?look=v9` |
| GS-012 passo 5: encontros aleatórios | 7 áreas (2 novas da clareira + 5 da tabela); `rules.ts` = porta do `engine.mjs` (paridade testada); `LocalEncounterAuthority` | `?encounters=1` |
| GS-012 passo 6: encontros visíveis | 5 pontos, no máximo 6 vivos, no lugar dos 31 selvagens (só com a flag); idle/ignore/flee/chase | `?encounters=1` |
| GS-012 passo 7: combate | salto da grama em 1,2 s, depois o mesmo `engage`/combate no mapa (recomendação A); recompensa idempotente | `?encounters=1` |
| Debug | painel: forçar espécie ou raridade, horário, chance, carência e pool com % | `?encdebug=1` |
| Defeito da fase 2 corrigido | a água animada do v9 cobria a ponte do riacho (camada `ground_detail`) | sempre no v9 |

**Verificação [E]:**
- `npm test`: **38 arquivos, 357 testes**, todos verdes (eram 331).
- `npm run build`: ok.
- `map:validate`: 8/8 gates nos 6 mapas e no arquivo do v9 (`… v9/digimon-forest-01.tmj.json --no-write`).
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## 1. P7: Clareira piloto recomposta

Tudo é gerado por `scripts/map-factory/p7-clareira.mjs`, chamado pelo `derive-look-v9.mjs`:
- **determinístico:** hash por posição, sem RNG com estado; o teste roda o derivador de novo e compara o arquivo;
- **relatório:** `src/data/maps/v9/digimon-forest-01.p7-report.json`.

O v8 e o padrão não mudam. Números **[E]**, todos do relatório:

| Pedido do brief | Feito | Medida |
|---|---|---|
| Reagrupar cogumelos e cristais em bolsões (Drakantos #5) | 46 instâncias reposicionadas em 3 bolsões (totem 15, fonte de cura 17, vau 14): 17 cogumelos bioluminescentes, 4 digitais, 1 aglomerado, 4 cristais e, pela regra 60/30/10, 20 flores. Contagem igual à do v8. Cristais (sólidos) só nos bolsões da fonte e do vau, cada um testado por BFS de alcance. | Clark–Evans **0,64 → 0,33** (< 1 = agrupado) |
| 1–2 manchas de lama a mais | `lama-p7-vau` (11 células) e `lama-p7-margem` (4 células, margem leste do braço do riacho) | +2 patches |
| 3 molduras de primeiro plano, moitas maiores até a cintura | ponte (oeste e leste), baú e 2 na curva do riacho dentro da clareira: **20 sprites** em moitas compostas de 2 fileiras (~80 × 26 px) | ver "Primeiro plano" abaixo |
| Tirar a grade dos 94 tufos sobre a trilha | 99 → **66** no recorte; lacunas por ruído baixo (~3 tiles) e jitter por instância | CV da distância ao vizinho **0,39 → 0,70** (maior = menos regular) |
| Regra 60/30/10 | massa de perímetro: 26 moitas sem colisão onde a clareira encosta na mata | aberto/mata/acento **55/21/24 (v8) → 50/25/25** |
| Quebrar a repetição da água | fase e brilho por ruído contínuo no espaço do mundo (sem costura na borda da célula); fluxo para o sul (`stepPx [0,2]`) | testes de continuidade e de fases distintas |
| 2 zonas de grama alta (GS-012) | 17 + 15 touceiras `fp4_tall_grass_a/b`, densidade caindo para a borda, fora da trilha; camada `encounters` no `.tmj` gerada da tabela (fonte única) | — |

### Primeiro plano: até a cintura

- **Altura opaca medida dos sprites [E]:** `edge_cluster_a` 18 px, `fern` 15, `flowering_bush` 22, `edge_cluster_b` 24.
- **Moita composta:** fileira de trás alta (subida 2–3 px) e fileira da frente baixa.
- **Regra nova do v9 (`look.foreground.headFrac = 0.35`):** a moita só fica translúcida quando esconderia a cabeça. Com pernas e cintura cobertas ela continua opaca. Antes, qualquer sobreposição a deixava a 38%, e a moita "sumia" justamente quando o Tamer passava atrás.
- **Medido [E]:** com o Tamer 13 px atrás do pé da moita, nenhuma ficou translúcida (`fgAlphaCovering: []` em `img/qo3_capture_report_fg.json`).
- **Leitura [H], pelas capturas:**
  - a 13 px, a moita cobre até a cintura;
  - a ~10 px, até o peito;
  - encostando, fica translúcida.

### Defeito da fase 2 encontrado e corrigido

- **O que era [E]:** a camada de água animada (`drawWater`) era desenhada por cima das células da ponte (`ground_detail` 25–31,9). No v9 a ponte do riacho não aparecia.
- **Por que passou:** as capturas da fase 2 não enquadravam a ponte.
- **Correção:** células com detalhe de chão ficam fora da água animada (`view.ts`), com teste em `tests/p7-clareira.test.ts`.

### Ajustes ao brief e regra 60/30/10

- **Retângulo `clareira-noroeste-grama` [E]:**
  - o do brief (x19, y14, 7×6) caía em mata e riacho sólidos em ~80% das células (grade de alcance do v9);
  - desci 4 tiles para o chão aberto a oeste da clareira (x19–25, y18–23), ao lado do vagar do Palmon visível;
  - está registrado na tabela (`_notes`) e nas duas cópias.
- **60/30/10:**
  - **Como foi medido:** por célula, 720 células.
  - **Resultado:** 50/25/25, dentro do critério do brief (§7: ±15 pontos de cada alvo).
  - **Limite do acento:** fica em ~25% e não chega a 10%, porque o riacho sozinho ocupa 15% do recorte e a lama roxa ~8%. Os dois estão no brief.
  - Detalhe no relatório P7 (`ratio`, `ratioV8`).

## 2. GS-012 passos 5–7 (`?encounters=1`)

### Arquitetura (ENCOUNTER_ARCHITECTURE §2)

- `src/sim/encounters/rules.ts`: porta tipada de `scripts/encounters/engine.mjs`, com os mesmos sorteios na mesma ordem. O teste roda 3 × 4000 passos nos dois e compara resultado e estado do RNG.
- `src/sim/encounters/authority.ts`: interface `EncounterAuthority` (`onStep`, `canEngage`, `settle`, `claimReward`, `visibleSpots`) e `LocalEncounterAuthority`.
  - O estado fica em `WorldState.enc` (dados puros: carência por jogador, recompensas pagas, encontros liquidados).
  - O RNG é o da sim; nada usa `Math.random` nem o render.
- `src/sim/encounters/table.ts`: tabela por mapa e validação (mesmas regras do `sim.mjs --check`).
  - A cópia do jogo (`src/data/encounters/`) é igual à de design (`quality-overhaul/encounters/tables/`), com teste de sincronia.
- `src/sim/world.ts`:
  - `createWorld(..., { encounters, env })`;
  - intents `set_env` (período do relógio, mandado só quando muda) e `enc_force` (debug);
  - eventos `wild_appear`, `grass_rustle` e `wild_leave`.

### Passo 5: aleatórios

- **Gatilho:** o Tamer local entra num **tile novo** dentro de uma área.
  - Célula de **trilha não sorteia**: a trilha secundária corta a zona do corredor.
  - Parado não conta, e AUTO e bots não disparam encontros.
- **Bloqueios:** parceira em combate, derrotada ou evoluindo; salto já tocando; portal a menos de 4 tiles.
- **Resultado:** o selvagem individual (`encOwner`) nasce a 1–2 tiles, de preferência na grama e à frente do Tamer.
- **Passeio [E]** (teste e 8 sementes, 4000 ticks na zona oeste):
  - 25–29 encontros em 1428 passos (~1 a cada 50 passos, contando o tempo de combate);
  - teto de 84 (carência mínima de 16 passos);
  - 1–5 farfalhares vazios por semente.

### Passo 6: visíveis

- **Pontos:** os 5 da tabela entram no lugar das 8 zonas de spawn, como `SpawnZone` estendida: o spawn e o respawn continuam sendo os de sempre.
- **Densidade:** **6 vivos no máximo, 5 de dia e 5 à noite**, contra 31 antes.
- **Horário:** pontos com `requires` aparecem e somem com `set_env` (Tentomon de dia, Patamon à noite).
- **Cérebros:**
  - `flee`: foge até `loseRadius`, depois volta para casa;
  - `chase`: persegue a parceira e engaja sozinho;
  - `idle`: não vaga;
  - `ignore`: o selvagem de sempre.
- **Respawn:** `timer` em segundos da tabela.

### Passo 7: combate

- **Salto (1,2 s, 12 ticks):** o selvagem não luta, não anda e não é alvo (do AUTO, de área nem de terceiros).
- **Fim do salto:** entra no **mesmo** `engage`/combate do mapa.
- **Fim do combate:**
  - derrota: recompensa uma vez (`claimReward` por chave do encontro);
  - fuga, leash ou tempo: o selvagem "volta para a grama" (some, sem respawn, sem recompensa);
  - `settle` libera o intervalo mínimo e é idempotente.

### Apresentação (`src/render/encounterFx.ts`, recomendação A, sem trocar de tela)

| Tempo | O que acontece |
|---|---|
| 0–350 ms | a touceira do tile treme ±2 px e 6 folhas sobem; "!" sobre o Tamer; vinheta entra; a câmera puxa ~1/3 do caminho até o selvagem |
| 350–700 ms | arco de 12 px em 5 quadros inteiros |
| 700–1200 ms | poeira no pouso; placa "NOME NV.N" com a borda na cor da raridade; selo **NOVO** se a espécie não foi vista; muito raro com brilho dourado |

- O rótulo de nome fica escondido até o pouso, e o HUD registra "Um X selvagem saltou da grama!".
- **Diferenças da proposta §4:**
  - **sem zoom 1,06:** zoom fracionário reamostra a arte e quebraria a escala inteira do `?dpr=1`, então virou o puxão de câmera;
  - **sem squash:** não deformo sprite;
  - **sem som:** o protótipo não tem áudio.

### Painel `?encdebug=1` (`src/ui/encdebug.ts`)

- **Mostra (4 Hz):** tile, área, terreno, chance deste passo, carência, intervalo, contadores, vivos (visíveis/aleatório), recompensas pagas, % por raridade e pool por espécie com faixa de nível e %.
- **Comandos:** **forçar encontro** por entrada ou raridade, e horário da tabela.
- **Arquitetura:** tudo por intents; o painel não mexe na sim.
- **Também em `window.__gs003`:** `encounters()` e `forceEncounter(entryId?, rarity?)`.

## 3. Desempenho do v9 na Clareira [E]

**Como foi medido** (`img/qo3_capture_report_perf.json`):
- 1920×1080, Chromium headless em software, mesma sessão para v8 e v9;
- Tamer no centro da clareira;
- 600 quadros + `render+raster` síncrono (600 chamadas de `view.render` + `getImageData`);
- "v9+P7" inclui `?anim=v2&encounters=1`.

| Enquadramento · hora | v8 render+raster p50 / p95 (ms) | v9+P7 render+raster p50 / p95 (ms) |
|---|---|---|
| Jogo (`dpr=1`, canvas 640×360) · dia | 2,1 / 2,9 | **2,0 / 2,6** |
| Jogo · noite | 2,6 / 3,3 | **2,9 / 3,7** |
| Geral (`zoom=1`, canvas 1920×1080) · dia | 19,6 / 20,9 | 20,4 / 22,6 |
| Geral · noite | 22,1 / 45,1 | 22,6 / 25,4 |

- **Na visão de jogo**, que é o que o jogador vê, o v9 com P7 custa o mesmo que o v8: −0,1 ms de dia e +0,3 ms à noite.
  - Há mais props (174 contra 117 desenhados, por causa da grama, das moitas e do primeiro plano).
  - E menos entidades (5–7 contra 14, por causa dos pontos visíveis).
- **Geral à noite, aquecimento de 120 quadros:** o laço do v9 teve trabalho médio de 13,2 ms (v8: 8,1 ms) dentro da janela medida.
  - **Causa:** a montagem única do cache da água animada (orçamento por quadro) ainda estava rodando.
  - **Com 900 quadros de aquecimento** (`img/qo3_capture_report_perf_geral_noite_aquecido.json`):
    - trabalho médio **8,5 contra 8,2 ms**;
    - p95 18,8 contra 17,3;
    - render p50 **22,9 contra 22,4 ms**.
  - Depois do aquecimento, igual ao v8.
- O p50 do "trabalho do laço" nesta medição (Playwright, rAF a ~120 Hz) **não é comparável** ao da fase 2 (CDP): vale a comparação v8×v9 desta tabela.

## 4. Capturas e vídeo (`quality-overhaul/phase3/img/`, 1920×1080)

| Arquivo | Conteúdo |
|---|---|
| `p7_clareira_antes_v8_{dia,noite}.png` | antes: `look=v8&dpr=1`, visão de jogo, 31 selvagens |
| `p7_clareira_depois_v9p7_{dia,noite}.png` | depois: `look=v9&dpr=1&anim=v2&encounters=1`, mesma câmera |
| `p7_clareira_{antes_v8,depois_v9p7}_{dia,noite}_geral.png` | a clareira inteira (`zoom=1`), antes e depois |
| `p7_fg_ponte_tamer_atras.png` · `p7_fg_bau_tamer_atras.png` | molduras de primeiro plano com o Tamer 13 px atrás (opacas, até a cintura) |
| `p12_encontro_1_grama.png` · `_2_salto.png` · `_3_placa.png` | encontro aleatório em 3 quadros: 2 ms (grama mexendo e "!"), 475 ms (salto), 709 ms (placa de raridade) depois do sorteio |
| `p12_encontro_4_combate_debug.png` | combate no mapa e painel `?encdebug=1` |
| **`p12_clareira_passeio_encontro.webm`** | vídeo de 27,5 s (VP8, 1920×1080, 25 fps, 8 MB) |
| `qo3_capture_report_*.json` | metadados: query, tempos, perf e marcos do vídeo |

**Roteiro do vídeo** (Playwright `recordVideo`):
1. sul da clareira;
2. baú atrás da moita;
3. ponte com as molduras;
4. grama alta da zona oeste;
5. **encontro natural, sem forçar**: Floramon com o selo NOVO salta da grama;
6. combate no mapa até "Venceu! +22 XP +9 bits".

Os ~10 s de carregamento iniciais foram cortados.

Para gerar de novo: `scripts/qo3-capture.mjs [shots|fg|encounter|perf|video]`, com o servidor da 5190 no ar (instruções no topo do arquivo).

## 5. Links (porta 5190)

```bash
cd ~/projects/GameStudio/workspaces/game-dev/qo/projects/prototypes/GS-003/prototype/world
npx vite --port 5190   # se ainda não estiver no ar
```

| Para ver | Link |
|---|---|
| Tudo junto (P7 + encontros) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&criador=0 |
| Mesmo, com o painel de debug | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&encdebug=1&criador=0 |
| À noite (Patamon, sem Tentomon) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&encdebug=1&time=night&criador=0 |
| Antes (v8, 31 selvagens) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v8&dpr=1&criador=0 |
| Clareira inteira, depois × antes | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&encounters=1&zoom=1&criador=0 · http://127.0.0.1:5190/?map=digimon-forest-01&look=v8&dpr=1&zoom=1&criador=0 |
| Só o P7, sem encontros | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&criador=0 |
| Clima de teste (Tanemon/Palmon ×1,5, Numemon) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&encounters=1&encdebug=1&weather=rain&criador=0 |

- **Grama alta da clareira:** a zona oeste fica entre o vau e a trilha (x19–25, y18–23); o corredor fica ao lado da trilha secundária, a leste do mirante.
- **Para ver o salto na hora:** painel → espécie ou raridade → "Forçar encontro".
- `?novo=1` começa sem save.

## 6. Arquivos

- **Novos:**
  - `src/sim/encounters/{rules,authority,table}.ts`, `src/data/encounters/digimon-forest-01.json`;
  - `src/render/encounterFx.ts`, `src/ui/encdebug.ts`;
  - `scripts/map-factory/p7-clareira.mjs`, `scripts/qo3-capture.mjs`;
  - `tests/encounters.test.ts` (15), `tests/p7-clareira.test.ts` (11);
  - `src/data/maps/v9/digimon-forest-01.p7-report.json`.
- **Alterados:**
  - `src/sim/{world,types,map,setup}.ts`, `src/render/{view,life}.ts`, `src/main.ts`;
  - `scripts/map-factory/derive-look-v9.mjs`, `src/data/maps/v9/*`;
  - `tests/{look-v9,sim}.test.ts`: o v9 agora difere do v8 dentro do recorte do P7; o teste de isolamento da sim ficou recursivo;
  - `quality-overhaul/encounters/tables/digimon-forest-01.json` (+2 áreas, reformatado com 2 espaços).

## 7. Limitações

- **Arte das moitas:**
  - as "moitas maiores" são **composições de sprites pequenos já existentes** (4 por moita); não há arte nova;
  - a cobertura depende de onde o Tamer pisa: cintura a ~13 px, peito a ~10 px;
  - galhos e folhagens grandes de primeiro plano, no estilo Drakantos, continuam sendo trabalho do game-art.
- **Regra 60/30/10:** o acento fica em ~25% por causa do riacho (15%) e da lama pedida no brief. Está dentro de ±15 pontos, mas não é 10%.
- **Água:** o ruído quebra a grade, mas a textura-base é a mesma; um tile de água com mais variação (game-art) melhoraria ainda mais.
- **Apresentação do encontro:**
  - sem zoom 1,06 (troquei por puxão de câmera, por causa da escala inteira), sem squash e sem som;
  - folhas e "!" são pixels desenhados em código; a arte aprovada (GS-010, passo 8) substitui.
- **Clima:** não existe no jogo [E]. Só `?weather=` força o valor da tabela.
- **Respawn:** `daily`/`period` não voltam por timer nesta sessão; `period` volta na troca de fase. Não há relógio diário persistente.
- **Bots:** a floresta não tem bots. O "outro jogador não engaja" é testado pela autoridade (`canEngage`), não por um bot real.
- **Ponto do Palmon (22,17):** a célula é inalcançável [E]; o spawn cai nas células alcançáveis do raio (comportamento já existente).
- **Ferramenta de captura:**
  - Playwright 1.65 do cache do npx, com o Chromium 1243 e o ffmpeg 1011 já instalados, via links em `/tmp/pwb`;
  - o ffmpeg 1011 só tem VP8, então um wrapper troca `libvpx-vp9` por `libvpx` e o vídeo é WebM VP8;
  - nenhum cache do sistema foi alterado.
- **Desempenho:** medido em headless com software raster; vale a comparação v8×v9 na mesma sessão, não o fps do jogador.
- **Save:** com `?encounters=1` o jogo usa o save normal **da origem 5190**; a 5174 tem outro `localStorage`.
- **Pendente (fora do escopo):**
  - passo 8 (arte e VFX aprovados no GS-010);
  - passo 9 (balanceamento com jogo real e checklist §11);
  - passo 10 (vídeo com e sem encontros para o game-qa).
