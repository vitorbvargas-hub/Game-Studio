# Relatório: Comando 14.3, build isolado do Hawkmon v1b (porta 5197)

**Data:** 2026-11-15 · **Autor:** game-dev (Opus 5.5) · **Status:** build no ar, **não homologado**. Próximos: game-qa, ChatGPT, Vitor.
Fan game não oficial e não licenciado. Uso só local; nada publicado. Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei); os sprites são adaptação do estúdio.

## 0. Resumo

- **Link (local, só nesta máquina):** http://127.0.0.1:5197/?novo=1
- O Hawkmon v1b entra como parceiro de teste; o Agumon F7v2 anda ao lado, com um 2º Tamer, para comparar; e há um modo lento (Shift).
- **Tempo por quadro final do Hawkmon: passo fixo de 2 px andados por quadro**, com o pé de apoio parado no mundo.
  - Na velocidade real do jogo, isso dá **~20 ms por quadro** (média 20,4–20,8 ms, mediana 16,7 ms = 1 rAF, a ~91 px/s);
  - no modo lento, **~50 ms** (a ~38 px/s).
  - **Os 73 ms do brief não servem sem escorregar:** com 73 ms (`&hawkms=73`) o quadro dura 67–83 ms e o pé escorrega ~5,3 px por quadro. Ver o §3.
- **"Pulinho" do pé E/W nos q5–q6:** na velocidade real, cada um desses quadros fica 17–33 ms na tela, e a passada inteira (8 quadros) dura ~165 ms. [H] Não dá para isolar o pulinho; o que chama atenção é a cadência rápida das pernas como um todo. No lento (50 ms por quadro) e a 73 ms ele fica visível. Ver o §4.
- **0 erros de console e 0 falhas de rede** em todas as rodadas do Chromium headless (medição, screencast, passeio e modos).
- `tsc` deu 0 erros. `vitest` deu 526/530: só as 4 falhas antigas de `lab-duas-linhas.test.ts`, mais 3 testes novos que passam. `map:validate --no-write` deu 9/9 PASS.
- 0 gerações no PixelLab e nenhuma arte alterada (60/60 PNG idênticos ao pacote). 5191 e 5196 não foram tocados, a Database não mudou e não houve push nem deploy.

## 1. Como testar

| Parâmetro | Efeito |
|---|---|
| `?novo=1` | jogo novo (save **à parte**, no slot de teste de parceiro desta porta; o formato de save não muda) |
| `&parceiro=hawkmon` (padrão) | **Hawkmon v1b** como parceiro ativo (Nv.8), Agumon F7v2 na reserva |
| `&parceiro=agumon` | Agumon F7v2 ativo e Hawkmon na reserva (e ao lado) |
| `&comparar=0` | sem o 2º Tamer; por padrão, um Tamer "Comparação" anda **em formação 3 tiles à direita** do seu, com o **outro** Digimon |
| `&hawkms=73` | testa o Hawkmon a ~73 ms por quadro (na velocidade normal; o pé escorrega). `&hawkpx=N` = N px por quadro |

**Teclas:**
- `W A S D` andam.
- **`Shift` segurado = andar lento** (Tamer e parceiras a 40 px/s em vez de 100; só neste build).
- `Tab` troca o ativo pela reserva.
- `Esc` fecha o Digivice.
- **Sem ataques:** não há `K` neste build e o Hawkmon não tem golpe. Não clique em selvagens com o Hawkmon: o motor usaria a investida genérica antiga, com o avanço procedural, sem efeito novo.

**Roteiro sugerido (o que o ChatGPT e o QA pediram para olhar):**
1. Ande para a direita (`D`) por 2–3 s e solte. Observe o Hawkmon na passada E e na parada. Repita para `A`, `W` e `S`.
2. Repita com `Shift` segurado (deslocamento lento: a "marcha no lugar" da S/N e o pulinho da E/W).
3. Compare com o Agumon F7v2 ao lado, que usa a lógica do F7v2: ~117 ms por quadro e 11 px por quadro.
4. Abra `&hawkms=73` para ver a alternativa de 73 ms.

Faixa roxa no topo: "Lab Etapa 6 · C14.3 · BUILD HAWKMON v1b (sem ataques) … não homologado · fan game não oficial".

## 2. Isolamento e o que foi feito [E]

- **Worktree próprio:** `workspaces/game-dev/lab-hawkmon`, branch **`lab/hawkmon-v1b`** (criada a partir de `lab/f7v2` 415825a), commit local **`34327c7`**. O `node_modules` é um symlink para o do `lab-etapa6` (não versionado).
- **Assets próprios:** `etapa6-lab/lab-assets/a-hawkmon/` é uma cópia 1:1 de `a-f7v2` (`diff -rq`: a única diferença é a pasta nova) mais `digimon/LAB-HAWKMON/pixellab1/`.
  - Os 60 PNG do pacote (4 rotações, 32 de walk e 24 de idle) foram copiados byte a byte: `cmp` 60/60 iguais.
  - O `a-f7v2` não foi alterado (`find -newer`: nada).
- **Build:** `VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-hawkmon VITE_LAB_BUILD=hawkmon npx vite build --outDir dist-lab-hawkmon`.
- **Serviço:** `gs003-lab-hawkmon-5197` (systemd de usuário, transitório, `Restart=on-failure`, `--setenv=PATH=$PATH`), que roda `vite preview --port 5197 --strictPort --host 127.0.0.1`. **Não sobrevive a um reboot**; o comando para religar está no `PROGRESS.md`.
- **Não tocados:**
  - 5191 e 5196 continuam ativos (HTTP 200);
  - `dist-lab-a/index.html` mantém a data 2026-11-14 09:04 e `dist-lab-f7v2/index.html`, 2026-11-14 22:54;
  - os worktrees `lab-f7v2` e `lab-etapa6` estão limpos;
  - Database: `md5sum data/*.json | md5sum` igual antes e depois (`8b71f53e…`);
  - o pacote v1b está íntegro pelo `sha256_e2b_c.txt`. A única divergência é o próprio `QA_ETAPA2B_INDEPENDENTE.md`, que ganhou a seção do Re-QA depois do checksum; eu só li o arquivo.

**Código (branch `lab/hawkmon-v1b`):**

| Arquivo | Mudança |
|---|---|
| `scripts/lab/import-hawkmon.mjs` (novo) | monta `lab-assets/a-hawkmon` e o `lab-character.json` do Hawkmon a partir do `pacote.json` (canvas 60×60, âncora (29,5; 49) → pivot (30, 49), o mesmo do F7v2; idle com os delays por direção do pacote; walk com 8 quadros). Se a saída existir, ela é movida para `_anteriores/` |
| `src/data/lab-species-hawkmon.json` (novo) + `src/sim/species.ts` | **registro de espécie local do lab** `LAB-HAWKMON` (Hawkmon, Rookie = stage 2, Vaccine), carregado **só com `VITE_LAB_BUILD=hawkmon`**. Stats são placeholder [H] copiados do Gomamon do lab. Não tem learnset (sem golpes); a skill é a `investida` neutra que já existia. Não é a Database e não aparece como selvagem |
| `src/assets/creatures.ts`, `lab-creatures.ts`, `lab-tamer.ts`, `src/render/animctl.ts`, `view.ts` | **`walkPxPerFrame`** (campo novo e opcional): passo fixo da walk em px andados por quadro, aplicado em walk, follow, run e turn. Não mexe no limiar de corrida (que continua em 100 px/s × 1,35). Sem o campo, nada muda (o Agumon F7v2 e as outras espécies ficam iguais) |
| `src/sim/setup.ts` | `extraPlayers` opcional no `createMapWorld` (o Tamer de comparação). Sem ele, nada muda |
| `src/main.ts` | só com `VITE_LAB_BUILD=hawkmon`: `?parceiro=`, `?comparar=`, `?hawkpx=`/`?hawkms=`, Shift lento (muda a velocidade das entidades da sessão, não o `WORLD`), formação do Tamer de comparação e a faixa |
| `tests/lab-hawkmon-passo.test.ts` (novo) | o passo de 2 px troca o quadro a cada 2 px; sem o campo, nada muda; `LAB-HAWKMON` só existe no build hawkmon |

- **Âncora fixa**, sem trim e sem bbox: é o mesmo pivot (30, 49) em todos os quadros, como no F7v2. O W é o desenhado do pacote (sem espelho do motor).
- **Sombra e profundidade:** são as do lab atual. A sombra é a elipse do motor centrada na âncora, com raio = 32% da largura do canvas, igual à do Agumon F7v2, e a ordem de desenho é pela linha do chão.

## 3. Tempo de quadro: o valor final e por quê [E/H]

**Medição** (Chromium headless, 1280×720, rAF ~60 Hz; gancho em `view.drawSprite`/`blitEntity`, que registra o quadro **desenhado** e a posição no mundo a cada rAF; `capturas/walk_analise_*.json`):

| Hawkmon | ms por quadro, mediana (média) | px andados por quadro | velocidade | quadros pulados |
|---|---|---|---|---|
| **Padrão (2 px), normal S/N/E/W** | **16,7 (20,4–20,8)** | **2,0** | 89–92 px/s | **0** / 439 trocas |
| **Padrão (2 px), lento (Shift)** | **50 (48,7–50,8)** | **2,0** | 38–39 px/s | 0 / 227 |
| `&hawkms=73`, normal | 66,7 (71,5–74,2) | 7,0–7,3 | 88–92 px/s | 0 / 122 |
| `&hawkms=73`, lento | 183 (166–183) | 6,8–7,3 | 38 px/s | 0 / 62 |
| Agumon F7v2 ao lado (normal) | 116,6 | 10,3–11,0 | 89–91 px/s | 0 / 73 |

**Deslizamento do pé de apoio** (deslocamento real do sprite no quadro − os 2 px do desenho; o pacote tem deslizamento 0 com 2 px, QA E2b; `recon_*.json`):
- **padrão:** média **0,0 px** em todas as direções e nos dois ritmos; quadro a quadro, −1 a +2 px, que é a quantização do rAF (a posição na tela é inteira e anda ~1,5 px por rAF);
- **73 ms:** média **5,3 px** por quadro (4 a 7).

**Por que não 73 ms.**
- O brief e o QA calcularam 73 ms com 2000 / 27,3 px/s. Esses 27,3 px/s eram a *velocidade de referência* do manifesto do F7v2 na 12.2, não a velocidade real.
- A parceira anda a **100 px/s** na sim (5 sub por tick, a 10 Hz; medido 89–92 no headless) e a até 160 px/s quando corre para alcançar o Tamer.
- Para o pé não escorregar com o passo de 2 px do pacote, o quadro precisa durar 2000 / v: **20 ms a 100 px/s** e 50 ms a 40 px/s.
- Mantive o critério do brief ("de modo que o pé não escorregue") e deixei os 73 ms como alternativa por URL.

**Valor registrado:** `walkPxPerFrame = 2` no `lab-character.json` do Hawkmon, que equivale a **~20 ms por quadro na velocidade normal** e ~50 ms no lento. A velocidade global e a do Agumon não mudaram.

**Observações**
- [E] A 160 px/s (correndo para alcançar o Tamer), 2 px por quadro passa de 1 quadro por rAF, e o motor pularia quadros. Não aconteceu nas rodadas (0 pulos), mas pode acontecer quando o Tamer se afasta muito.
- [H] O ciclo de 8 quadros dura ~165 ms: as pernas fazem ~6 ciclos por segundo, uma "corridinha de passarinho". Pode parecer apressado demais ao lado do Agumon (ciclo de ~930 ms). É uma questão de leitura visual para o ChatGPT e o Vitor, não de engenharia.

## 4. As perguntas do Re-QA, no jogo

**E/W q5–q6 na velocidade real (o "pulinho")** [E/H]
- [E] **Padrão:** o q5 e o q6 ficam 17–33 ms cada na tela (1–2 rAF), cerca de 35–50 ms juntos por passada. Na folha `recon_normal_d_padrao_folha.png` (uma imagem por troca de quadro, com tempo), o pé de perto sobe nos q5–q6 exatamente como no pacote.
- [H] A 60 Hz, esses dois quadros duram ~3 rAF por passada, dentro de um ciclo de ~165 ms. O bloco amarelo sobre o toco marrom não se destaca. O que se vê é a perna inteira em movimento rápido. **Leitura: o pulinho é imperceptível na velocidade normal; o que pode incomodar é a cadência.**
- [E/H] **Lento (Shift):** 50 ms cada, ~100 ms por passada (`recon_lento_d_padrao.gif` e `_folha.png`, `lentoE_padrao.gif`). Aqui o pé levantado sobre o de trás fica legível, como o QA descreveu no Re-QA R4.
- [E/H] **73 ms:** 67–83 ms cada (`recon_normal_d_ms73_folha.png`, `walkE_ms73.gif`). O pulinho fica visível e o pé escorrega 5 px por quadro.
- **Severidade:** continua **P3**. A correção de arte (o pé levantado mais curto, ou redistribuir os 3, 3, 6, 2, 2) só vale a pena se o Vitor e o ChatGPT olharem no modo lento ou a 73 ms e acharem que incomoda.

**S/N em deslocamento lento ("marcha no lugar")** [E/H]
- [E] No lento a S/N troca a cada 50 ms com 2 px por quadro, e o corpo anda 16 px por ciclo (`recon_lento_s_padrao.gif`, `lentoS_padrao.gif`).
- [H] Como o deslocamento é no eixo da profundidade, o passo curto lê como "marcha quase no lugar". É a leitura esperada para 2 px por quadro.

**Leque N 1 px mais curto na walk:** não medi no jogo; é a mesma arte do pacote (R4.2, P3).

## 5. Testes obrigatórios do brief

| # | Teste | Resultado |
|---|---|---|
| 1 | Caminhada S/N/E/W, normal e lenta, com paradas | [E] feita nas 8 combinações (§3). 0 pulos, 2,0 px por quadro, 0 erros. GIFs reais (screencast) `walk{E,W,N,S}_padrao.gif`, `lento{E,S}_padrao.gif` e reconstruções `recon_*` |
| 2 | Transições idle → walk → idle | [E] `transicoes_padrao.json`: troca direta, sem quadro intermediário (ex.: `idleanim_E_00 → walk_E_00`, `walk_E_02 → idleanim_E_03`). **P3 (motor, igual ao Agumon F7v2, B5 da 12.2):** a walk começa no quadro da fase acumulada (nem sempre o q0) e o idle volta no quadro do relógio (nem sempre o q0). Ao começar a andar para um lado, o Hawkmon passa por quadros de outra direção (a curva do "seguir") |
| 3 | Hawkmon, Agumon e Tamer juntos na tela | [E] `tela_inicio_padrao.png`, `tela_juntos_parados_padrao.png`, `passeio/*`: os dois Tamers e os dois Digimon na mesma tela, parados e andando |
| 4 | E/W q5–q6 na velocidade real | §4 |
| 5 | Deslizamento, colisão e sombra | [E] deslizamento: média 0 (§3). Colisão: o Hawkmon segue a trilha do Tamer e para atrás dele quando o Tamer trava na margem da água (`02_d_parado`) e no paredão de rocha (`24_w_parado`, `26_d_parado`); não entra em sólido (`passeio/passeio.json`). A colisão é a do motor para qualquer parceira (raio do estágio Rookie), nada específico do Hawkmon. Sombra: `zoom_sombra_parado.png`, centrada na âncora e sob os pés. [H] Ela é a elipse do motor (largura = 32% do canvas, 38 px), mais larga que o corpo do Hawkmon visto de frente (~22 px); de lado acompanha a cauda. É a mesma regra do Agumon, por isso não mexi (ver §7) |
| 6 | Terrenos diferentes e objetos próximos | [E] `passeio/` (26 telas): grama, margem da água, paredão de rocha no norte, perto da ponte, pedras, tocos, flores, arbustos, árvores e placa (`passeio_recortes_A/B/C.png`). A ordem de profundidade é pela linha do chão, como para o Agumon: abaixo do pinheiro, o Hawkmon é desenhado na frente dele (`24_w_parado`). **Não verifiquei de propósito** o Hawkmon passando atrás de uma copa. O mapa do lab não tem terra/caminho como terreno separado |

**Modos** (`capturas/modos.json`), todos com 0 erros:
- `parceiro=hawkmon`: Hawkmon Nv.8, 0 golpes, ao lado o Agumon Nv.20;
- `parceiro=agumon`: Agumon Nv.8, ao lado o Hawkmon;
- `comparar=0`: só um Tamer;
- `hawkms=73`: 7,3 px por quadro;
- `Tab` troca o ativo nos quatro casos.

## 6. Problemas encontrados

| # | Gravidade [H] | Problema |
|---|---|---|
| H1 | P2 (decisão) | **73 ms e "pé sem escorregar" são incompatíveis na velocidade do jogo.** É preciso escolher: (a) o padrão, ~20 ms e pé travado, com cadência muito rápida; (b) 73 ms com escorregamento de ~5 px por quadro; (c) uma passada desenhada de ~7 px por quadro (arte nova; o QA desaconselhou); ou (d) uma parceira mais lenta (regra de jogo) |
| H2 | P3 | Pulinho E/W q5–q6: imperceptível a ~20 ms; visível no lento e a 73 ms (§4) |
| H3 | P3 | A walk entra e sai em quadros do meio do ciclo (motor, igual ao Agumon) |
| H4 | P3 | A sombra do motor (38 px) é mais larga que o Hawkmon de frente e de costas |
| H5 | P3 (só do teste) | O Tamer de comparação vai em linha reta até o ponto da formação. Se travar num obstáculo (água, árvore), ele fica para trás e o Agumon pode encostar no Hawkmon; os dois se reagrupam quando você volta para perto. Ex.: `02_d_parado`, na margem da água. Se atrapalhar, recarregue com `?novo=1` ou use `&comparar=0` |
| H6 | P3 | Correndo para alcançar o Tamer (160 px/s), 2 px por quadro pode pular quadros a 60 Hz (não houve nas rodadas) |
| H7 | — | Os GIFs de screencast têm 5–7 MB cada (recorte 3×, ~50 qps); as reconstruções têm ~0,8–1,2 MB |
| H8 | — | O gancho `window.__gs003` continua no build, como no Lab A e no F7v2 (build local, não publicado) |

## 7. O que não foi feito

- Nenhuma arte editada (nem a sombra, nem o pé do q5–q6). Nenhuma geração no PixelLab. Nenhum ataque nem Feather Slash; o topete separado em `camadas/` não foi usado.
- Sem push, merge ou deploy. O **preview web pedido pelo ChatGPT não foi feito**: deploy público não está autorizado e fica como decisão do fundador.
- Não mexi na sombra por espécie: seria um ajuste de motor (raio por manifesto) e o brief pede "como no lab atual".
- Não corrigi a entrada e a saída da walk no meio do ciclo (motor, também no Agumon).
- A leitura em movimento é **indicativa**: headless sem GPU, a 60 Hz. Os GIFs de screencast **não têm rótulo de quadro**, porque o carimbo de tempo do screencast headless não casa quadro a quadro com o rAF (testei numa página de controle). Os rótulos confiáveis estão nas **reconstruções** (`recon_*`), feitas do registro de desenho, com os PNG do pacote nas posições desenhadas e uma régua fixa no chão.
- Não testei em monitor de 120/144 Hz (a ~20 ms por quadro, o resultado muda com a taxa de atualização).
- O formato de save não muda; o save do teste fica no slot de parceiro de teste desta porta.

## 8. Evidências (em `fase21-build-hawkmon/capturas/`)

| Arquivo | O quê |
|---|---|
| **`recon_normal_d_padrao.gif`** / `_folha.png` | **GIF curto principal**: Hawkmon E na velocidade real, reconstruído rAF a rAF (50 qps), com régua no chão; q5–q6 em amarelo na legenda |
| `recon_lento_{d,a,w,s}_padrao.*`, `recon_normal_{a,w,s}_padrao.*` | o mesmo nas outras direções e no lento |
| `recon_normal_{d,s}_ms73.*`, `recon_lento_d_ms73.*` | a alternativa de 73 ms (o pé escorrega) |
| `walk{E,W,N,S}_padrao.gif`, `lento{E,S}_padrao.gif` (e `_ms73`) | **tela real** (screencast do Chromium), Hawkmon \| Agumon lado a lado, a 3×, tempos reais |
| `tela_inicio_*.png`, `tela_juntos_parados_*.png`, `walk*_meio_*.png` | tela inteira, com os 3 (e o 2º Tamer) juntos |
| `passeio/` (26 telas + `passeio_folha.png` + `passeio.json`), `passeio_recortes_A/B.png`, `zoom_sombra_parado.png` | terrenos, objetos, colisão e sombra |
| `walk_analise_{padrao,ms73}.json`, `walk_log_*.json`, `transicoes_padrao.json`, `modos.json`, `capturas_*.json` | números e registros brutos |

**Roteiros** (fora do jogo, reexecutáveis com `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`): `workspaces/game-dev/tools/h143/`.

| Roteiro | O que faz |
|---|---|
| `walk.mjs` | medição (`node walk.mjs "" padrao` ou `node walk.mjs "&hawkms=73" ms73`) |
| `analisa.mjs` | análise da medição |
| `paradas.mjs` | transições |
| `recon.mjs` | reconstrução (`node recon.mjs padrao normal:d`) |
| `capturas.mjs` | screencast |
| `passeio.mjs` | passeio pelo mapa |
| `recorte.mjs`, `zoom.mjs` | recortes e zoom |
| `modos.mjs` | conferência dos modos |
| `lib.mjs` | utilitário CDP (cópia do `f7v2b`) |

**Validação:**
- `tsc --noEmit`: 0 erros.
- `vitest`: 523/527 e depois 3/3 nos testes novos (no total, 526/530). As 4 falhas são as antigas de `tests/lab-duas-linhas.test.ts`, as mesmas do `lab/etapa6` e do F7v2. Uma rodada feita junto com a codificação dos GIFs deu 11 falhas por carga da máquina; a seguinte voltou a 523/527.
- `map:validate --no-write`: 9/9 PASS, sem reescrever relatório (não mexi em mapa).

## 9. Decisões do fundador / ChatGPT

1. **H1, o tempo da walk do Hawkmon.** Manter o pé travado (~20 ms por quadro, padrão do build), aceitar 73 ms com escorregamento, pedir uma passada mais longa (arte) ou parceira mais lenta (regra).
2. Se o pulinho dos q5–q6 incomoda no lento ou a 73 ms, autorizar o redesenho do pé levantado (0 gerações, game-art).
3. **Preview web pedido pelo ChatGPT:** deploy público não autorizado; precisa de aprovação específica e avaliação de risco de PI.
4. Sombra por espécie (raio no manifesto) ou manter a regra única do lab.
5. Abertas, sem mudança: régua de massa, G-1 (paleta) e G-2 (escala).

## Crédito
Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei). Este é um fangame não oficial e sem licença. Os sprites são adaptação do estúdio (PixelLab como gabarito + desenho por código). Camada `private-prototype`. **Não homologado.**
