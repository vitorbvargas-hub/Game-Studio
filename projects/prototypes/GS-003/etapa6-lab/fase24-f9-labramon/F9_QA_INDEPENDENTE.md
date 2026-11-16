# F9 — QA independente do Labramon (Fase 10)

Digital Odyssey (GS-003) · F9 Labramon · Fase 10 · 2026-11-16, 01:30–02:40 BRT · Autor: `game-qa` (Opus 5.5), sessão separada de quem produziu (game-research, game-art, game-dev). Comando `COMANDO_F9_LABRAMON.md` §14.
Fan game não oficial, sem licença, sem monetização; uso local; nada publicado. Labramon é espécie oficial (Bandai/Toei); os sprites são adaptação do estúdio (classe 2, recriação).
Legenda: **[E]** executado por mim nesta auditoria · **[L]** relatório anterior, não reverificado · **[H]** leitura ou hipótese minha · **NÃO VALIDADO** com motivo.
**A nota não substitui a homologação do fundador.** Não alterei arte, código nem manifestos; não usei PixelLab; não publiquei nada.

## 0. Objeto testado [E]

| Item | Valor |
|---|---|
| Pasta | `projects/prototypes/GS-003/etapa6-lab/fase24-f9-labramon/` |
| Repositório | `~/projects/GameStudio`, branch `master`, HEAD `f02fbab`. **A pasta F9 inteira está fora do git (`??`)**: nada das Fases 0–9 está versionado |
| Laboratório | `http://127.0.0.1:5198/lab/index.html`, serviço `gs003-lab-labramon-5198` ativo, HTTP 200 |
| Navegador | `chrome-headless-shell-1243`, libs em `/tmp/chromelibs`, sem GPU, proxy contornado só no meu processo. **Tempo e FPS são indicativos** |
| Isolamento | `workspaces/game-dev/qo` (jogo) sem arquivo alterado desde o início do F9 (mtime > 15/11 22:50: nenhum); `lab-hawkmon` e `lab-f7v2` limpos (só `node_modules`); 5196 e 5197 com HTTP 200; `database/data` sem arquivo alterado desde 15/11 22:00 |
| Roteiros (reexecutáveis, fora do jogo) | `qa_f9/scripts/check.mjs` (arquivos e manifestos), `visual.mjs` (costuras, folhas, GIFs), `row.mjs` (folhas ampliadas), `pe.mjs` (pé de apoio), `lab_qa.mjs` (laboratório via CDP), `png.mjs` (decodificador próprio). Rodar com `cwd = fase24-f9-labramon` |

## 1. Resumo

1. **Integridade técnica muito boa [E].** 545 referências de arquivo nos 6 manifestos: 0 faltando, 209/209 SHA-256 conferem. Nos 160 quadros de clipe: canvas 60×60, 0 pixel semitransparente, 0 resíduo magenta, 0 cor fora da paleta da rotação, no máximo 19 cores, pé em y=49 em todos (menos os 3 quadros no ar da comemoração). As 34 tiras de spritesheet (uma por clipe) são idênticas aos quadros (0 px de diferença). Os 92 GIFs têm estrutura válida. Standing = rotação byte a byte.
2. **Os três defeitos do Hawkmon v2 não se repetiram no movimento [E].** Olho e marcas têm a mesma contagem em todos os quadros de walk e idle nas 4 direções (o rosto não some); o idle não tem salto de massa (variação de 19–22 px opacos e ±1 px de altura; Hawkmon: +4 px de largura e +3 de altura num só quadro); o pé de apoio em E recua de forma regular (−2/−3 px em todos os 8 pares).
3. **O laboratório funciona [E]:** 180/180 ativos em 442 ms, 0 erro de console, 0 exceção, 0 falha de rede, 0 resposta 4xx/5xx; o canvas é pixel a pixel igual ao PNG em 12 controles × 6 amostras; a cadência real fica dentro de ±16 ms da do manifesto; 60 fps estáveis com 2 painéis a 4×; estados fora de E aparecem como INDISPONÍVEL e não trocam o quadro (12/12).
4. **Mas a máquina de estados do laboratório aceita sequências que a produção não cobre [E]:** atacar dormindo deixa o "Acordar" ligado, e acordar então salta de em pé para deitado; emoção durante a incapacitação deixa a "Recuperação" ligada, que salta de em pé para caído; WASD funciona deitado; o botão de caminhada corta uma ação disparada nos 900 ms seguintes; o rótulo de INDISPONÍVEL pode ficar preso. Contradiz o próprio relatório da Fase 9 ("botões desabilitados para não permitir uma sequência que a produção não cobriu"). P2.
5. **Pontos fracos de arte:** entradas de emoção e de ação saltam do idle (irritado: 859 px num só quadro; comemoração 753; assustado 847); a passada é curta (2,25 px/quadro em E, 2,75 em W ⇒ 23–28 px/s a 100 ms/quadro, contra ~90 px/s do Tamer); walk S tem 2 pares quase iguais (6 poses efetivas); walk N fica 2 px acima do standing; nos quadros de ação a cabeça é redesenhada e aparece a orelha do outro lado como um tufo vinho no alto da cabeça; o rosto em S e W fica embolado a 1×; presa, garras e gola quase somem a 1×.
6. **Notas.** 14 itens do §14: **média 7,79**. Régua de 8 critérios do Hawkmon aplicada só ao escopo de movimento: **7,91**. **Meta ≥8: não atingida**, por pouco. **Sem falha crítica** de anatomia, identidade ou integração (nenhum P0). 1 P1 (passada × velocidade do Tamer, bloqueia a integração no jogo, não o laboratório).
7. **Recomendação:** aprovar como **candidato forte**, não como pronto. Correções baratas (P2 de laboratório: código, 0 geração; P2 de arte: quadros intermediários e retoques locais, ~2–4 gerações) levam o pacote acima de 8 antes de virar base do Standard Visual 2.0. Detalhe no §7.

## 2. Verificações automatizadas [E]

Arquivos: `qa_f9/qa_arquivos.json` (tudo por quadro), `qa_f9/costuras.json`, `qa_f9/pe_apoio_walk.json`, `qa_f9/lab/lab_qa_report.json`.

| Verificação | Resultado | Status |
|---|---|---|
| PNGs decodificáveis (decodificador próprio, RGBA 8 bits) | 160 quadros de clipe + 4 rotações + 4 standing + 5 FX: todos | OK |
| Canvas | 60×60 em todos os quadros de clipe; FX 96×60 (camada à parte, documentado) | OK |
| Transparência | 0 pixel com alfa entre 1 e 254; 0 resíduo magenta | OK |
| Paleta | 0 cor fora da paleta da rotação da própria direção; máx. 19 (teto 24) | OK |
| Âncora | pé em y=49 em 157/160; 3 quadros no ar (comemoração q2–q4, y 46/43/45), intencional | OK |
| Bbox por quadro | registrado; maior salto no idle: 1 px de altura (S, N), 1 px de largura (E, W, cauda) | OK |
| Olho e marcas por quadro | walk/idle: olho 7/4/0/4 px (S/E/N/W) em **todos** os quadros; marcas 6–7 / 7 / 0–1 / 8–9 | OK |
| Continuidade dos loops (fecho vs internos) | walk: fecho 399–592 px, dentro da faixa interna; idle S/N 50–51 px (= interno); triste loop 11 px | OK |
| Quadros duplicados | só triste/loop q1 = q3 (documentado: o loop reusa um quadro) | OK |
| Quadros quase iguais | walk S q0→q1 73 px e q4→q5 64 px (contra 176–398 nos outros pares) | **Ressalva** (P3) |
| Quadros ausentes | 0: toda referência de manifesto existe | OK |
| Manifestos × disco | 545 refs; 209 SHA-256 iguais; **3 arquivos no disco sem entrada de manifesto** (`combat/spritesheets/attack_retriever_bark_fx.png`, `…_composto_preview.png`, `combat/attack_retriever_bark/composto_preview/_standing_96.png`) | P3 |
| Spritesheets × quadros | 34/34 idênticas (0 px) | OK |
| GIFs | 92/92 com estrutura válida (quadros e atrasos lidos pelo meu parser) | OK |
| E × W espelhado | rotação: 490 px diferentes no melhor alinhamento; walk: 597–783 → **direções independentes** | OK |
| Console / exceções / rede no lab | 0 / 0 / 0, 0 respostas ≥400 | OK |
| Regressões | jogo, outros labs e Database intocados (§0) | OK |

## 3. Notas pelos 14 itens do §14

Notas [H] apoiadas nas medições [E]. Itens 1–8 da régua do Hawkmon reaparecem onde há equivalência; os novos (emoções, descanso, interações, combate, integridade, desempenho, escalabilidade) usam a régua descrita na coluna "Régua". **Não compare estes números com o 7,78 do Hawkmon v2**: lá o objeto era um build de jogo com 3 estados; aqui é um pacote de 22 clipes num laboratório.

| # | Item | Nota | Régua usada | Motivo (evidência) |
|---|---|---:|---|---|
| 1 | Fidelidade à espécie | **7,5** | Hawkmon 1 + 10 invariantes do F9_01 §5.2, conferidos a 1× e ampliado contra REF-01, REF-02, REF-05 | Os 10 invariantes existem na arte; capuz, orelhas caídas, olho vermelho, listras, cauda em espiral e corpo branco leem a 1×. Descontos: presa e garras (1 tom oliva `#a4a370`) quase somem a 1×; gola em zigue-zague fraca em S; rosa mais saturado que o mauve do Reference Book (D2); cauda vira um disco redondo (as refs mostram rolo que afina); franja "de cabelo" e focinho de perfil um pouco longo (ressalvas do F9_03, confirmadas) |
| 2 | Qualidade GBA Plus | **8,0** | Hawkmon 2 + Style Bible (contorno 1 px, sem AA, 2–3 tons, sem semitransparência) | Técnica limpa medida (0 semitransparência, 19 cores, contorno escuro). Descontos: rosto embolado em S e W a 1×; patas do fundo em cinza-esverdeado viram manchas em alguns quadros (walk E q4–q5 tem um recorte escuro na barriga) |
| 3 | Consistência anatômica | **7,75** | Hawkmon 4 | Movimento excelente: olho/marcas constantes, cabeça travada, massa estável. Nos clipes de ação o modelo redesenha a cabeça (até 40 px de altura, olho 6–9 px contra 4), surge a orelha oposta como tufo vinho no alto da cabeça (latido q4–q5, dano q0–q2), a cabeça cresce na recuperação q6, e há uma mancha cinza sobre o olho no estado incapacitado |
| 4 | Quatro direções | **7,75** | nova: mesma altura, mesmo pivô, mesma paleta, independência E/W, legibilidade por direção | Altura 36 nas 4, contato centrado em 29,5, E e W independentes (490 px). S com rosto ruidoso; N tem a espiral como único marcador e anda 2 px mais alto que o standing. Emoções/descanso/interações/combate só existem em E (escolha do comando, não defeito) |
| 5 | Naturalidade da caminhada | **7,0** | Hawkmon 3 (fluidez) + nova: alternância de patas, recuo do pé, poses efetivas | Diagonais alternadas legíveis em E e W; pé de apoio E −2/−3 px em 8/8 pares (regular), W +1 a +4 [E, `pe_apoio_walk.json`, bate com o 2,28/3,0 da Fase 4]. Descontos: S com 6 poses efetivas; N +2 px; passada de 18–22 px por ciclo ⇒ a 100 ms/quadro anda 23–28 px/s; acompanhar o Tamer (~90 px/s) pede ~25 ms/quadro ou deslize (P1 para integração) |
| 6 | Qualidade do idle | **8,5** | Hawkmon 4 restrito ao idle (os defeitos de lá) | Rosto 0 px de mudança, olho constante, massa ±22 px, altura ±1, pé fixo, q0 = rotação em S e N. Único desconto: E/W mexem só a cauda e S/N o corpo inteiro (leituras diferentes por direção) |
| 7 | Clareza das emoções | **7,75** | nova: leitura a 1×, entrada/loop/saída, retorno ao idle | Feliz, irritado e assustado leem bem; triste é sutil a 36 px (cabeça desce 3–5 px; depende da postura). Saídas voltam ao idle com 147–161 px de diferença (suave). Entradas saltam: irritado 859 px em 1 quadro, assustado 847, triste 432 |
| 8 | Qualidade do descanso | **8,25** | nova: pose desenhada (não achatada), costuras da cadeia, respiração | Pose de esfinge desenhada, dormindo com queixo nas patas; costuras 0 / 80 / 250 / 153 / 148 px; loop de sono só no tronco (26–64 px). Descontos: em pé → deitar começa 2 px deslocado na horizontal (703 px; 439 alinhado); olho cresce para 7 px deitado e 10 px ao acordar |
| 9 | Coerência das interações | **7,0** | nova: leitura da ação, ponto de contato, contrato | Comemoração clara (pulo, orelhas, boca aberta). Carinho lê como cabeça baixa de olhos fechados, mas sem mão nem Tamer em cena; a "mão" desenhada pelo modelo foi apagada; ponto de contato e posição do Tamer são proposta não testada. Contratos JSON coerentes, campos de vínculo `null` |
| 10 | Qualidade do combate | **7,5** | nova: preparação/execução/recuperação legíveis, FX, incapacitação sem morte | Latido com as três fases e onda de choque em camada própria; dano com impacto e recuo; queda → estado → recuperação, sem morte nem Digiovo. Descontos: tufo vinho da orelha oposta no alto da cabeça; loop incapacitado com arfada de 229–243 px (grande para repouso); cabeça redesenhada na recuperação |
| 11 | Transições | **7,0** | Hawkmon 7 + costuras medidas (px que mudam na troca) | Saídas e cadeias boas (§2, `costuras.json`). Entradas com salto; o lab corta loops sem tocar a saída ao trocar de controle; a máquina de estados permite saltos (§4) |
| 12 | Integridade dos arquivos | **9,0** | nova: manifestos × disco × SHA × formato | Tudo confere (§2). Descontos: 3 arquivos fora do manifesto; pasta F9 inteira fora do git (risco de perda) |
| 13 | Desempenho | **9,0** | nova: carga, FPS, memória (indicativo, headless) | 442 ms até pronto, 60 fps em 10/10 amostras com 2 painéis a 4×, heap JS 0,9 MB, 750 nós. Não testado no jogo nem com vários personagens |
| 14 | Escalabilidade do processo | **7,0** | nova: custo, retrabalho manual, reprodutibilidade | 31,65 gerações para 4 direções de movimento + 14 estados em 1 direção [L]; as outras 3 direções desses estados custariam ~48 [L, ~16/direção]. Pós-processo manual pesado e específico (trava de rosto, apagar orelha/"mão", realinhar cada clipe porque o PixelLab recentra o canvas). Scripts guardados e reexecutáveis; lição pixminimax + `palette` reaproveitável |
| | **Média** | **7,79** (109,0/14) | | Meta ≥8: **não**. Itens abaixo de 8: 1, 3, 4, 5, 7, 9, 10, 11, 14 |

### 3.1 Régua histórica de 8 critérios (Hawkmon), só no escopo de movimento

Aplicada a standing/idle/walk nas 4 direções, que é o escopo mais próximo do Hawkmon v2. Mesmo assim **não é comparação direta**: o Hawkmon foi medido dentro do jogo; o Labramon só no laboratório.

| # | Critério | Labramon (movimento) | Motivo |
|---|---|---:|---|
| 1 | Fidelidade | 7,5 | item 1 |
| 2 | Qualidade GBA Plus | 8,0 | item 2 |
| 3 | Fluidez | 7,5 | cadência fiel ao manifesto no lab; S com 6 poses; passada curta |
| 4 | Consistência anatômica | 8,5 | rosto, olho, marcas e massa estáveis em walk/idle; pé fixo |
| 5 | Legibilidade no jogo | 7,75 (só lab) | **NÃO VALIDADO no jogo** (não integrado). No lab a 1× lê bem de perfil, pior de frente |
| 6 | Custo e tempo | 8,0 | 15,05 gerações no movimento, 6 em testes reprovados; F9 inteiro 31,65 de 60 [L] |
| 7 | Transições | 7,0 | standing → walk N com +2 px; walk ↔ idle sem salto de pivô |
| 8 | Ausência de regressões | 9,0 | nada fora da pasta F9 mudou (§0) |
| | **Média** | **7,91** | Meta ≥8: não; GS-010 (≥9, nenhum <8): não |

### 3.2 Segunda régua (Style Bible e referências aprovadas)
- **Paleta (G-1, aberto):** 0 pixel em cor exata da Endesga-32 [L, Fases 3–8; não remedi]. O Style Bible aplica a Endesga-32 a cenário/UI, não a criatura. Registro, não decido.
- **Escala (G-2, aberto):** Labramon 36 px de altura × Tamer v13 34 px, Agumon F7v2 35, Hawkmon v2 38; acima da faixa DS de Rookie (30–34) [L, F9_02; prancha conferida a olho]. Registro, não decido.
- Contra v13/v15 dentro do mapa: **NÃO VALIDADO** (não há integração em mapa nesta fase).

## 4. Laboratório (Fase 9) — teste próprio [E]

Roteiro `qa_f9/scripts/lab_qa.mjs`; relatório `qa_f9/lab/lab_qa_report.json`; capturas `qa_f9/lab/01_inicial.png` … `05_final.png`.

| Teste | Resultado |
|---|---|
| Carga | 180/180 ativos, 442 ms, 0 erro |
| Render | canvas = PNG (0 byte diferente) em 12 controles × 6 amostras, incluindo o ataque com FX |
| Cadência real × manifesto | ataque: 100/84/100/116/84/166/100/117 ms contra 90/90/100/120/70/180/100/110; dano e comemoração idem, sempre ±16 ms (passo do rAF) |
| Cadeias | dormir: deitar 6q → adormecer 4q → loop; acordar: 8q → levantar 8q → idle; incapacitação → loop → recuperação → idle. Todas na ordem certa |
| WASD | W/A/S/D → walk N/W/S/E a 100 ms; soltar → idle |
| Indisponibilidade | 12/12 (S, N, W × feliz/deitar/carinho/ataque): quadro e estado não mudam, rótulo INDISPONÍVEL |
| Zoom 1×/2×/4×, fundo, pivô, comparação, pausa e quadro a quadro | funcionam (`image-rendering: crisp-edges`; pausa congela; ◀ ▶ andam 1 quadro) |
| Diagnóstico | estado, direção, quadro, FPS, duração, bbox, âncora, cores e status do asset medidos ao vivo |
| Desempenho | 60 fps (10/10), heap 0,9 MB |

**Defeitos encontrados (leitura do código + execução):**
- **L1 (P2)** atacar (ou qualquer ação) dormindo: toca o ataque a partir de em pé (salto de deitado para em pé), o estado de descanso continua `dormindo` e o "Acordar" segue ligado; acordar então começa no quadro dormindo a partir do idle (salto de em pé para deitado). Medido: `dormindo_depois_ataque.rest = "dormindo"`, `acordarDis = false`.
- **L2 (P2)** emoção durante a incapacitação: toca o feliz em pé (salto do chão para em pé), `combatState` continua `incapacitado`, "Recuperação" segue ligada e começa caída a partir de em pé.
- **L3 (P2)** WASD deitado: anda na hora (salto) e `restState` fica `deitado`; "Dormir" depois pula o deitar e começa em `lie_to_sleep` a partir de em pé. "Deitar" estando deitado recomeça do em pé.
- **L4 (P3)** botão de caminhada: o `setTimeout` de 900 ms chama `stopWalk` mesmo se outra ação começou; medido: ataque disparado 300 ms depois do botão ▶E foi cortado para idle.
- **L5 (P3)** segurar D, apertar A, soltar D → idle com A ainda pressionada.
- **L6 (P3)** rótulo preso: o `flashUnavailable` restaura, 1,8 s depois, o texto capturado antes; com cliques seguidos o rótulo fica "INDISPONÍVEL (carinho só existe em E)" em direção E durante um ataque (captura `04_comparacao_zoom4_pivo_ataque.png`).
- **L7 (P3)** o Tamer provisório aparece fora do palco, só como imagem; não há comparação de escala ou carinho em cena.

## 5. Defeitos P0–P3

Custo: "0 ger" = retoque local/código; gerações estimadas pelo preço medido nas Fases 4–8 (1 ger por clipe pixminimax de até 8 quadros). Estimativas [H].

| ID | Sev. | Defeito | Evidência | Correção sugerida | Custo |
|---|---|---|---|---|---|
| A1 | **P1** (integração) | Passada curta: 2,25 px/quadro (E), 2,75 (W); a 100 ms/quadro = 23–28 px/s; o Tamer anda ~90 px/s. No jogo, ou a pata desliza ~70%, ou a cadência vai a ~25 ms/quadro | `qa_f9/pe_apoio_walk.json`; Fase 4 §4 | Decisão do fundador/game-design: Labramon mais lento que o Tamer, ou um ciclo de corrida/trote (passada maior) para seguir o Tamer; não acelerar o walk atual | 0 (decisão) ou ~4 ger (trote 4 direções) |
| A2 | P2 | Entradas saltam do idle: irritado 859 px em 1 quadro; assustado 847; comemoração 753; ataque 479; triste 432 | `qa_f9/costuras.json`; `qa_f9/gifs/cadeia_*` | 1 quadro intermediário por entrada (irritado primeiro); o assustado e o dano podem ficar bruscos por natureza | ~1–2 ger (irritado e comemoração) ou retoque local |
| A3 | P2 | Orelha oposta como tufo vinho no alto da cabeça (latido q4–q5, dano q0–q2, queda q4–q5, estado incapacitado) | `qa_f9/folhas/combat_8x.png`, `ko_8x.png` | Apagar o tufo localmente, como já se fez no triste/carinho | 0 ger |
| A4 | P2 | Cabeça redesenhada nos picos de ação (40 px; olho 6–9 px) e maior na recuperação q6; mancha cinza sobre o olho no estado incapacitado | `qa_arquivos.json` (olho/topo por quadro); `ko_8x.png` | Aceitar como expressão (decisão) ou travar o topo do capuz no deslocamento medido, sem tocar a boca | 0 ger |
| A5 | P2 | Rosto embolado em S e W a 1×; presa, garras e gola quase invisíveis | `qa_f9/folhas/rotacoes_10x.png` | Retoque manual das rotações S/W (olho 2×2 limpo, presa 1 px branca, garra com 2 tons) e reaplicar a trava de rosto | 0 ger (retoque) |
| L1–L3 | P2 | Máquina de estados do lab permite saltos (dormindo/incapacitado/deitado + outra ação) | §4 | Bloquear ou encadear: outras ações só em pé (ou tocar `sleep_to_wake`/`wake_to_stand`/`recuperacao` antes); resetar `restState`/`combatState` | 0 ger (código, game-dev) |
| A6 | P3 | Walk S com 6 poses efetivas (q0≈q1, q4≈q5) | `qa_arquivos.json` dif 73/64 px | Aceitar ou redesenhar 2 quadros com o pulinho de volta e âncora por quadro | 0–1 ger |
| A7 | P3 | Walk N 2 px acima do standing (troca standing → walk) | costura 543 px; alinhado dy=2 → 378 | Baixar o walk N 2 px ou o standing N acompanhar | 0 ger |
| A8 | P3 | Em pé → deitar começa 2 px deslocado na horizontal | costura 703 px; alinhado dx=2 → 439 | Realinhar o clipe 2 px | 0 ger |
| A9 | P3 | Loop do incapacitado com arfada grande (229–243 px) | `qa_arquivos.json` | Decisão (Fase 5–8 §8 item 3) | 0 ou 1 ger |
| A10 | P3 | Rosa mais saturado que o Reference Book; sombra do corpo esverdeada | F9_02 §4 [L], confirmado a olho | Remapear 3–4 hex na paleta (decisão de identidade de cor) | 0 ger |
| L4–L7 | P3 | Botão de walk corta ação; duas teclas; rótulo preso; Tamer fora do palco | §4 | Limpar `activeWalk` ao trocar de ação; pilha de teclas; cancelar timeout do rótulo; Tamer no palco | 0 ger |
| I1 | P3 | 3 arquivos sem entrada de manifesto | §2 | Incluir no `combat/manifesto.json` ou mover para `_evidencias/` | 0 |
| I2 | P3 (risco) | Pasta F9 inteira fora do git | `git status` `??` | Commit pelo coordenador (decisão do Fase 9 §7) | 0 |

**P0: nenhum.** Nenhuma falha crítica de anatomia (4 patas sempre, 1 cauda, sem membro extra), identidade (os 10 invariantes presentes) ou integração (lab carrega e toca tudo).

## 6. Classificação das entregas

| Entrega | Classificação | Observação |
|---|---|---|
| F9_01 Reference Report (Fase 0) | CONCLUÍDO E TESTADO | 10 invariantes usados como checklist; 6 refs presentes em `refs/` |
| F9_02 Direção de arte e escala (Fase 1) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | escala 36 px e cor dependem de G-1/G-2 (abertos) |
| Arte-mestra v2 + F9_03 (Fase 2) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | ressalvas confirmadas (franja, focinho, rosa) |
| Rotações S/E/N/W (Fase 3) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | técnica OK; A5, A10 |
| Movimento: standing, idle, walk × 4 (Fase 4) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | idle 8,5; walk com A1, A6, A7 |
| Emoções ×4, direção E (Fase 5) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | A2 |
| Descanso, cadeia completa, E (Fase 6) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | o melhor pacote novo; A8 |
| Interações + contratos, E (Fase 7) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | carinho sem Tamer em cena; contratos são proposta |
| Combate: ataque + FX, dano, incapacitação, E (Fase 8) | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO | A3, A4, A9 |
| Laboratório (Fase 9) | CONCLUÍDO E TESTADO, com defeitos P2/P3 de máquina de estados (L1–L7) | todos os controles do §13 presentes e funcionando |
| Estados das Fases 5–8 nas direções S, N, W | NÃO INICIADO | fora do escopo pedido (1 direção) |
| Integração no jogo / legibilidade no mapa | NÃO INICIADO (NÃO VALIDADO) | fora do escopo do F9 |
| Fase 11 (Standard Visual 2.0) e Fase 12 (relatório final) | NÃO INICIADO | dependem deste QA |
| BLOQUEADO | nenhum item | — |

## 7. Recomendação

1. **Não homologar ainda; tratar como candidato forte.** Pacote tecnicamente limpo, idle e descanso no nível ≥8, e sem as falhas que reprovaram o Hawkmon v2. A média (7,79; movimento 7,91) fica abaixo de 8 por defeitos baratos.
2. **Rodada curta de correção antes da Fase 11** (uma tarefa por vez):
   - game-dev, 0 geração: L1–L3 (e L4–L6 se couber).
   - game-art, 0–2 gerações: A3, A4, A7, A8 por retoque local; A2 (quadro intermediário do irritado e da comemoração); A5 se o fundador aceitar retoque manual de rotação.
   - Depois, um QA de regressão curto só nesses itens (reexecutar `qa_f9/scripts/*.mjs`).
3. **Decisões para o fundador antes de usar este pacote como Standard 2.0:** A1 (velocidade/trote), G-1/G-2, cor (A10), uma direção ou quatro para os estados das Fases 5–8.
4. Para o método (Fase 11): manter o par pixminimax + `palette` + trava de rosto (funcionou: rosto estável); acrescentar ao checklist do produtor as medidas deste QA que o próprio produtor não fazia: **costura de entrada a partir do idle** e **recuo do pé × velocidade do Tamer**.

## 8. O que não foi feito / limitações

- Não alterei arte, código, manifestos nem o serviço 5198; não usei PixelLab; não publiquei.
- Não testei no jogo nem num mapa; não testei em navegador com GPU, nem 120/144 Hz.
- Contagem de "olho" e "marcas" é por cor (`#c63239`+`#81231d`; `#b97191`+`#dc9aa3`), não por posição; nos quadros de expressão a variação é esperada e foi conferida a olho.
- O rastreio do pé é automático (sobreposição dos pixels de contato); com patas cruzadas é ambíguo, como no QA do Hawkmon. S e N não têm recuo lateral mensurável.
- Não remedi a Endesga-32 (repeti o número das Fases 3–8 como [L]).
- Os 92 GIFs da produção foram validados estruturalmente, não reproduzidos um a um no navegador; os meus 18 (`qa_f9/gifs/`) são evidência das cadeias.
- Não usei o self-test do game-dev como prova; rodei roteiro próprio (o dele continua disponível).
- Custo de escalabilidade (item 14) usa números da produção [L].

## 9. Evidências

`qa_f9/`
- `qa_arquivos.json` — por quadro: canvas, alfa, cores, fora da paleta, bbox, pé, contato, olho, marcas, massa, diferenças, SHA; refs de manifesto; órfãos; spritesheets; GIFs.
- `costuras.json` — 40 costuras entre clipes, com e sem melhor alinhamento.
- `pe_apoio_walk.json` — recuo do pé por par de quadros, 4 direções.
- `folhas/` — `rotacoes_10x`, `walk_{S,E,N,W}_8x`, `movement_idle_standing_6x`, `movement_walk_6x`, `emo_happy_sad_8x`, `emo_angry_scared_8x`, `emotions_*_6x`, `rest_8x`, `rest_6x`, `inter_8x`, `interactions_6x`, `combat_8x`, `ko_8x`, `combat_6x`, `rosto_*_10x` (fundo cinza, linha vermelha logo abaixo do chão y=49).
- `gifs/` — `walk_*_4x`, `idle_*_4x`, `cadeia_{happy,sad,angry,scared,descanso,carinho,comemoracao,ataque,dano,incapacitacao}_4x` (com idle antes e depois, para ver as costuras).
- `lab/` — `lab_qa_report.json` e 5 capturas.
- `scripts/` — roteiros (§0).

## 10. Decisões que dependem do fundador

1. A1: Labramon anda mais devagar que o Tamer, ou ganha um trote/corrida para segui-lo.
2. Aprovar a rodada curta de correções (§7.2) antes da Fase 11, ou seguir com as ressalvas registradas.
3. Uma direção (E) para emoções/descanso/interações/combate ou pedir W (~16 ger por direção [L]).
4. Cor: Reference Book (mauve) × rosa atual (A10); paleta G-1 e escala G-2 seguem abertas.
5. Aceitar a cabeça redesenhada nos picos de ação (A4) e a arfada do incapacitado (A9).
6. Commit da pasta F9 no git (I2) e se o serviço 5198 pode continuar ligado (pergunta da Fase 9).
