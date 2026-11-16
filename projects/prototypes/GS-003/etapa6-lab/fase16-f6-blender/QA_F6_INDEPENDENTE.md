# QA INDEPENDENTE: F6, Blender 3D → pixel art (Agumon)

**Digital Odyssey (GS-003) · game-qa · 2026-11-14, ~18:05–18:40 · custo PixelLab: 0** (nenhuma ferramenta PixelLab chamada)
Objeto: `fase16-f6-blender/` (`RELATORIO_F6.md`, `metricas_f6.json`, `pacote_agumon_f6/`, `comparacao/`, `scripts/`), comparado com F2b (`fase13-comando10/backup_f2b/pacote_agumon_f2/`), B/C10 (`fase13-comando10/pacote_agumon_c10/`), D (`fase12-comando9/f4/hibrido_agumon_S/` e `fase13-comando10/hibrido_agumon_S_c10/ataque_A_saida_q8/`) e com `fase11-fichas-anatomia/FICHA_AGUMON.md`.
Legenda: **[E]** executado nesta auditoria · **[L]** de relatório ou QA anterior, não reverificado · **[H]** hipótese · **NÃO VALIDADO**, com o motivo.
**Nada fora deste arquivo foi alterado.** Scripts (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_f6/` (`met_f6.py`, `sheet.py`, `split.py`, `halfcycle.py`, `feet_f6.py`, `toes_f6.py`, `abcd_gba.py`, `mkpage_f6.py`, `cap.mjs`). Saídas: `workspaces/game-qa/tmp/qa_f6/` (`met.json`, `sheet/`, `cap/`, `repro/`, `run1x_strip_2x.png`).

## 0. Veredito

| | QA (este) | Autoavaliação game-art | Régua 8 | GS-010 |
|---|---|---|---|---|
| **F6 Agumon (walk S/E/N/W + ataque S/E/N/W)** | **6,3** | 6,5 | não atinge | não atinge |

- O pipeline **funciona e é reprodutível** [E]: refiz o render no Blender a partir de uma cópia dos scripts e os **72 PNG saíram idênticos byte a byte** em ~13,5 s.
- Ele vence em **consistência** e em **custo**. Perde em **fidelidade**, o critério de maior peso, e também em identidade GBA Plus e legibilidade.
- **Recomendação: concordo com "combinar", com uma restrição.** O F6 **não serve como asset**. Serve como guia de movimento e proporção. Não adotar nem integrar; não descartar (custo de manter = 0).
- Achei **3 problemas que o relatório não registra**: o fogo do ataque E/W é cortado pela borda do canvas; a cabeça da caminhada é diferente da cabeça da rotação e do ataque; e mãos e solas brancas leem como luva e meia (§3).

## 1. Build testado e método [E]

- Pasta não versionada (`git status`: `?? .../fase16-f6-blender/`); HEAD do repositório `f02fbab`. Arquivos com data de 16:11 (`check_egress.sh`) e de 17:47 a 18:01 (todo o resto): **bate com os ~21 min** declarados de trabalho na retomada.
- **Reprodução:** copiei `agumon_blender.py` e `pixelize.py` para `tmp/qa_f6/repro/` e rodei `run_blender.sh -b --factory-startup` e o `pixelize.py`, gravando só no meu `tmp`. Blender ~6,8 s e pixelização ~6,8 s. Resultado: **72/72 PNG iguais** aos entregues (`cmp`). O `EGL_BAD_MATCH` aparece, como o relatório diz, e não atrapalha.
- **Medidas próprias** (`met_f6.py`, sem PIL e sem numpy, com definições minhas): canvas, bbox, semitransparência, borda, componentes 8-conexos, pixel de cor isolado (8 e 4 vizinhos), cabeça (14 linhas do topo, translação dx −3..3) contra o q0, cortes entre quadros, espelho, paleta contra o pacote F2b e contra as pranchas Endesga-32 e v15b.
- **Visual:** folhas quadro a quadro a 1×, 4× e 8× com guia na linha 46 (`sheet/`); comparação par a par F2b × F6 × C10 a 6× com a base alinhada.
- **Em movimento:** página própria (`tmp/qa_f6/view.html`, quadros embutidos a partir dos PNG) no **Chromium headless-shell 1243** (`LD_LIBRARY_PATH=/tmp/chromelibs/ex/...`, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`, `--no-proxy-server`). **0 erros de console e 0 exceções**; a única requisição foi o próprio `file://`. 30 capturas tocando, 18 quadro a quadro (fundo verde e cinza). Tempo medido por rAF: walk e ataque a 100–117 ms (alvo 110); ataque S com os tempos do D: 116–200 ms.
- **Pista de deslocamento:** garras dos pés em coordenada de mundo com avanço de 3 px por quadro (`toes_f6.py`).
- **Limites:** headless sem GPU, então o tempo é indicativo. Sem fundo de mapa real. Os GIFs entregues **não** foram tocados como arquivo. Conferi tamanho, número de quadros e delay (8 ou 9 quadros, 110 ms em todos), e a página toca os mesmos PNG-fonte.

## 2. Conferência das métricas do game-art [E]

| Medida | Relatório | QA | Confere? |
|---|---|---|---|
| Oscilação do centróide S/E/N | 0,8 / 1,9 / 1,2 | 0,83 / 1,86 / 1,16 | sim |
| Topo, amplitude S/E/N | 2 / 2 / 2 | 2 / 2 / 2 | sim |
| Cabeça igual ao q0 (walk) | 8/8/8 | 0 px de diferença em 8/8 nas 3 direções | sim |
| Pixel mais baixo, amplitude S/E/N | 2 / 3 / 2 | 2 / 3 / 2 (S 49–51, E 46–49, N 47–49) | sim |
| Pixel de cor isolado, média por quadro | 5,3 / 3,3 / 5,1 | 5,2 / 3,2 / 5,1 | sim |
| Cores no ciclo S/E/N; pacote | 11 / 12 / 8; 15 | 11 / 12 / 8; 15 | sim |
| Fora da paleta F2b / semitransp. / borda (walk) | 0 / 0 / 0 | 0 / 0 / 0 | sim |
| W = espelho de E | sim | 0 px em walk, ataque e rotação | sim |
| Altura S/N/E; largura S/E; cabeça S/N | 36/34/38; 22/36; 20/20 | iguais | sim |
| Endesga-32: exatas; distância mínima | 0/15; 5–59 | 0/15; 4,6–59,1 RGB | sim |
| v15b: exatas | 0 | 0 | sim |
| Pé de apoio 3 px/quadro (modelo) | 3,0 | **confirmado na imagem**: com avanço de 3 px, a garra do pé de trás fica em x 41–43 (mundo) de q0 a q4, e a do pé da frente em x 53–55 de q4 a q7. **Sem deslizar** | sim |
| F2b intocado | sha `3385f9fb…b14c` | igual; `backup_f2b_sha256.txt` 72/72 OK | sim |

**O que o relatório não mede e eu medi:**
- **Ataque E/W q6: 9 px opacos na coluna 59**, a borda direita do canvas: a bola de fogo é cortada. O quadro tem 2 componentes. Nas outras animações há 0 px na borda.
- **Rotação × walk q0:** a cabeça difere em 38 px (S), 47 px (E) e 34 px (N) nas 14 linhas do topo; o quadro inteiro, em 234 / 329 / 210 px. A rotação é **idêntica** ao q0 e ao q8 do ataque (0 px). Para comparar: no C10 E essa diferença é 0 px, e no F2b E era 29 px.
- **Ataque q8 = q0** (0 px), nas 4 direções. É correto para um golpe de uma vez só, que termina no neutro; num loop, vira quadro repetido.
- **Fogo por quadro:** S 16 a 33 px, na altura do peito e do rosto (y 28–42); E 18 a 35 px, saindo da boca; **N só 2 px no q4**.
- **Braço na walk E:** as garras da mão variam ~4,4 px em x (34,2–38,6) e 11 px em y. É mais amplitude que o C10 (2–3 px [L, QA C10]).

## 3. Inspeção visual quadro a quadro (1×, 4×, 8×) e em movimento [E]

| Item | Status | Evidência e leitura |
|---|---|---|
| Canvas | **Funciona, com ressalva** | 60×60 em **tudo**: rotações, walk e ataque nas 4 direções. É mais uniforme que o F2b, que tem rotações em 48×48 e walk/ataque N em 56×56. Mas o relatório diz "mesmo formato do F2b", e não é: o game-dev precisa saber que o canvas muda |
| Âncora | **Parcial** | `pacote.json` declara a âncora na linha 46 (sob o quadril). O pixel mais baixo da walk varia 2–3 px por perspectiva: no E q2 o sprite inteiro "sobe" para 46, com só o pé de trás no chão. A rotação tem a base em 49 (S/E) e 47 (N). Ancorar pelo pixel mais baixo dá pulo; pelo quadril, deve ficar estável [H]. **NÃO VALIDADO no jogo** |
| Pernas e pés (walk) | **Funciona** | As pernas alternam (q_i × q_{i+4} difere 91–286 px, portanto não é ciclo de 4 repetido); o pé plantado não desliza a 3 px por quadro (§2). Em movimento a 4×, a passada lê como andar de bípede, sem patinação |
| Cabeça e tronco (walk) | **Funciona** | Cabeça idêntica em 8/8; ritmo de topo 0, +1, 0, −1 regular. A 4× em movimento a cabeça "flutua" sem tremer |
| Braços | **Funciona** | Oposição às pernas visível; amplitude ~4 px no E. Melhor que o C10 |
| Cauda | **Parcial** | Mexe pouco. No E o segmento acompanha; no N a cauda é uma **bola com brilho** entre as pernas, que lê como traseiro, não como cauda |
| Transição idle ↔ walk | **Parcial (novo)** | A cabeça da walk tem outro sombreado e outro desenho de olho que a da rotação (§2). Passar de parado a andando troca o rosto num quadro |
| Ataque E/W | **Parcial** | Antecipação clara (cabeça vai para trás em q1–q2) e fogo saindo **da boca**, o que nenhum método anterior conseguiu no lateral. Mas a bola é pequena (5×5 a 7×7) e **cortada pela borda no q6** (P2) |
| Ataque S | **Parcial** | Fogo de 4×4 sobre o focinho e o peito; a 1× quase não aparece. O F2b, ao lado, lê "solta fogo" claramente |
| Ataque N | **Ausente na prática** | 2 px de fogo no q4; o resto é só a cabeça balançando. Não comunica disparo |
| Artefatos | **Funciona** | 0 semitransparentes; 1 componente em todos os quadros da walk; 0,5–0,7% de pixel isolado (o B tem 8–15%) |
| W espelho × W 3D real | informativo | 201–356 px de diferença na walk e 107 na rotação; a luz troca de lado. É escolha do fundador |

**Fidelidade à ficha (`FICHA_AGUMON.md` §9) [E, a 4×–8× e a 1×]:**

| # | Checklist | F6 | Comentário do QA |
|---|---|---|---|
| 1 | Cabeça igual nas 4 direções | **sim** | S = N = 20 px; altura S/N/E 36/34/38 (o F2b tem 35/39/41, menos coerente) |
| 2 | N: sem listras; nuca escura e mancha na base da cauda | **não** | Nenhuma listra, mas **nuca e mancha ausentes**; a cabeça é uma esfera lisa com brilho especular |
| 3 | S: barriga laranja clara, sem faixa | **parcial** | A barriga está certa, mas há uma **faixa escura sob o queixo** (a "coleira") que atravessa o peito |
| 4 | E/W: focinho em cunha, 1 olho, cauda curta e grossa | **parcial** | Focinho curto e rombudo; a cabeça é uma caixa grande com o focinho como um calombo; cauda correta |
| 5 | Bípede, pés no chão, braços pendentes | **sim** | — |
| 6 | 3 garras brancas | **parcial** | A 8×, as garras viram **blocos brancos** nas mãos e **faixas brancas** nas solas. A 4× leem como **luva e meia** (a lista negativa da ficha proíbe luva); a 1× o branco domina mãos e pés |
| 7 | Sem acessório | **em risco** | A coleira (item 3) e as "luvas" (item 6) |
| — | Rosto (§4 da ficha: olhos verdes com brilho, boca com dentes) | **não** | Sem sorriso nem dentes. As narinas são **2 blocos escuros no centro do rosto**, que leem como focinho de porco. O olho tem um risco escuro e brilho na borda de baixo, que lê como lágrima ou expressão triste |

**Proporção contra o F2b [E]:** a altura é praticamente a mesma (S 36 × 35), então **a escala está preservada** (≈1,1 tile de 32). A cabeça é 2 px mais larga (S 20 × 18; E 25 × 23), mais quadrada (largura máxima em 8 linhas contra 6) e com o pescoço menos marcado (14 × 12 px). Cabeça/altura até o pescoço: F6 ~42%, F2b ~46%; as duas passam do 1/3 da ficha. É chibi nos dois, e isso já estava aceito.

**Leitura a 1× em movimento (`run1x_strip_2x.png`):** o E/W lê como dinossauro bípede andando. O S lê como um boneco laranja quadrado com mãos e pés brancos. O N lê como uma caixa laranja sobre pernas. O F2b e o C10, ao lado, leem como Agumon nas 3 vistas.

## 4. Notas F6 nos 6 critérios (Comando 11 §5)

**Régua:** a mesma dos QA F2, F4 e C10. Referência aprovada v13/v15 + `FICHA_AGUMON.md`, leitura a 1× e 4× em movimento. Paleta **fora** das notas de fidelidade, animação, consistência e legibilidade (G-1 aberto). **GBA Plus** reportado nas duas réguas (abaixo). 8 = pronto para integração de teste; GS-010 = média ≥ 9 e nenhuma categoria < 8.

| Critério | Peso | Auto | **QA** | Justificativa |
|---|---:|---:|---:|---|
| Fidelidade ao Digimon | 25% | 5 | **4,5** | Itens 2, 3, 6 e 7 da ficha falham ou ficam em risco; o rosto perde a identidade (sem sorriso, narinas em bloco, olho "chorando"); mãos e pés leem como luva e meia. Fica 0,5 abaixo da autoavaliação por esse último achado, que é novo |
| Qualidade visual GBA Plus | 20% | 5 | **5,5** | **Régua técnica (contorno, nitidez, ruído): ~8.** 0 AA, contorno escuro em 100% da borda, 13–15 cores, 0,5% de pixel isolado. **Régua de identidade (v13/v15): ~4.** Brilho especular "de plástico" na cabeça e na cauda, sombreado de esfera e formas de caixa: é um **quarto estilo** ao lado do F2b. **Style Bible (Endesga-32): 0/15 cores exatas**, igual aos outros métodos (0%) [E/L], e fica fora da nota |
| Qualidade da animação | 20% | 7 | **7,0** | Walk ≈ 7,5: pé sem deslizar (confirmado na imagem), cabeça estável, braço com 4 px e as 4 direções iguais. Ataque ≈ 5,5: o E é bom até o corte na borda, o S é fraco e o N não dispara. A transição idle → walk troca o rosto |
| Consistência anatômica | 15% | 9 | **8,5** | Mesma malha em tudo: cabeça 8/8, S = N em largura, altura S/N/E coerente, rotação = neutro do ataque (0 px), reprodução byte a byte. Desconta a cabeça da walk diferente da cabeça da rotação (34–47 px) e a âncora que varia por perspectiva |
| Legibilidade no jogo | 10% | 6 | **5,5** | E/W lê bem a 1×; S e N leem como boneco ou caixa; o fogo do S e do N quase não aparece a 1× |
| Tempo e custo | 10% | 9 | **8,5** | 0 gerações, ~21 min de agente (as datas dos arquivos confirmam) e 13,5 s para refazer (medido). Desconta: cada espécie é um modelo escrito à mão (~60 linhas no Agumon; Champion com chifre, placa ou asa custa mais [H]); os scripts dependem de `workspaces/game-art/tools`; e o resultado ainda precisaria de polimento para virar asset, um custo não medido |
| **Média ponderada** | | **6,5** | **6,3** | 4,5×0,25 + 5,5×0,20 + 7,0×0,20 + 8,5×0,15 + 5,5×0,10 + 8,5×0,10 = **6,30** |

**Sem vitória por nota isolada:** os 8,5 de consistência e de custo não compensam os 4,5 de fidelidade. Pela regra do ADR-012 (nenhuma categoria < 8), o F6 fica fora por 4 categorias.

## 5. Comparação A, B, C, D × F6, e as notas novas de GBA Plus e de tempo/custo

**Aviso de método.** As notas de fidelidade, animação, consistência e legibilidade de A a D são **[L]**, dos QAs anteriores. Esses QAs usaram 4 critérios e não os 6 do Comando 11. Fiz o mapeamento abaixo [H]: "estabilidade" vira animação e "limpeza" vira consistência quando não há nota direta. As notas de **GBA Plus** e de **tempo/custo** são **novas** e vêm desta auditoria. **C e D não são entregas equivalentes** (Comando 11 §5): o C cobre idle e emoção, só em S e E; o D só cobre o S (idle, ataque e feliz). A e B têm walk e ataque nas 4 direções e emoção. O F6 tem walk e ataque nas 4 direções e não tem idle animado nem emoção.

**Medidas de limpeza que usei para o GBA Plus [E]** (`abcd_gba.py`):

| Conjunto | Cores | Pixel isolado (% dos px) | Semitransparente | Contorno escuro |
|---|---:|---:|---:|---:|
| A v7 walk / rotações | 156 / 98 | 15,1 / 17,8 | 0 | 99–100% |
| B C10 walk / rotações | 98 / 90 | 8,0 / 15,2 | 0 | 98–99% |
| C rig idle S / idle E | 59 / 34 | 30,2 / 8,1 | 0 | 100% |
| D ataque / idle | 98 / 59 | 26,1 / 30,2 | 0 | 96–100% |
| F6 walk / rotações | 13 / 13 | 0,7 / 0,5 | 0 | 100% |

Pixel isolado alto **não** é defeito em si: a textura do PixelLab é a mesma da referência v13/v15 aprovada. Por isso o F6 lidera a régua técnica e fica atrás na de identidade.

| Critério (peso) | A (PixelLab puro, v7) | B (F2b + C10) | C (rig 2D, F3) | D (híbrido F4/C10A) | **F6 (Blender)** |
|---|---|---|---|---|---|
| Fidelidade (25) | 5,5 [L QA F2 antes] | 7,5 [L F2b 7,5; C10 8,0] | 7,0 [H; herda os pixels do sprite, braço girado com luz errada L QA F3] | 7,5 [L QA F4] | **4,5** |
| GBA Plus (20), **novo** | **5,5**: estilo da referência, mas crista, rosto nas costas, pé marrom e 156 cores na walk [L/E] | **7,0**: mesmo estilo, limpo; resta o ruído no S e dois níveis de acabamento no C10 E [E/L] | **6,5**: pixels do sprite; peças giradas ou espelhadas quebram a luz [L] | **6,5**: duas famílias de traço no mesmo ataque (98 cores, 26% isolados) [E/L] | **5,5** |
| Animação (20) | 5,5 [L, estabilidade] | 7,5 [L; walk E 8,0, walk S 7,5, ataque ~7] | 6,5 [L QA F3] | 7,0 (7,25 com a saída C10A) [L] | **7,0** |
| Consistência (15) | 5,5 [L, limpeza] | 7,5 [L; C10 8,0, ataque E com outro tronco] | 7,5 [L/H] | 7,0 [L] | **8,5** |
| Legibilidade (10) | 6,5 [L] | 7,5 [L; F2b 7, C10 8] | 6,5 [L/H] | 8,0 [L] | **5,5** |
| Tempo/custo (10), **novo** | **5,0**: ~18 gerações por espécie, **23** reais no Agumon, fila de 2–4 min por chamada e iterações v5→v7; saldo no piso [L] | **6,0**: o custo do A + ~14 min (F2, 3 espécies) + ~8 min (F2b) + o C10; 0 geração a mais; o diagnóstico é por espécie [L] | **7,0**: 0 geração sobre a rotação (que vem do A); ~8 min; recorte manual de 5–10 min por direção; não faz walk [L] | **6,5**: precisa do A e do C; 0 geração a mais; ~20 min; economiza 3 gerações de idle [L] | **8,5** |
| **Média ponderada** | **5,55** | **7,25** | **6,83** (entrega parcial) | **7,08** (só S) | **6,30** |

**Leitura:**
- **Nenhum método atinge a régua 8 nem a GS-010.** A ordem por média é **B 7,25 > D 7,1 > C 6,8 > F6 6,3 > A 5,55**. C e D não são comparáveis em escopo.
- O **F6 é o único com nota ≥ 8 em consistência e em custo**, e o **pior em fidelidade** (abaixo até do A). O B é o melhor equilíbrio hoje.
- As notas de A a D vêm, em sua maioria, de QAs anteriores [L]. As diferenças de 0,1 a 0,2 entre B, D e C estão dentro da incerteza do mapeamento: **não as trate como ranking firme**.

## 6. Problemas encontrados

| ID | Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|---|
| F6-1 | **P2** (novo) | Ataque E/W q6: bola de fogo cortada pela borda direita (9 px na coluna 59; 2 componentes) | `met.json` (`borda` 9); `sheet/F6_attack_E_4x.png` | Custo 0: terminar a bola no q5, encolher ou desvanecer no q6, ou alargar o canvas do ataque lateral |
| F6-2 | **P2** | Rosto sem identidade: sem sorriso nem dentes, narinas em 2 blocos centrais, olho com risco escuro que lê como lágrima, cabeça em caixa | `sheet/par_rot_S_F2b_F6_C10_6x.png`, `F6_walk_S_8x_p*.png` | Não corrigir dentro do 3D; usar o rosto do sprite aprovado sobre o F6 (combinação do §7) |
| F6-3 | **P2** | N sem a nuca escura e sem a mancha oval na base da cauda (ficha §6, §9-2); cauda vira uma bola com brilho | `par_rot_N_F2b_F6_C10_6x.png`, `F6_walk_N_8x_p0.png` | Cor de vértice ou decal no modelo, ou passe manual |
| F6-4 | **P2** | "Coleira": faixa escura sob o queixo no S, visível a 1× (ficha §9-3 e §9-7) | `F6_rot_x_walkq0_x_atkq0_S_8x.png` | Limiar de profundidade só entre membros, ou recolorir para a sombra laranja |
| F6-5 | **P3** (novo) | Garras em bloco branco nas mãos e faixa branca nas solas: a 4× leem como luva e meia (lista negativa da ficha) | `F6_walk_S_8x_p*.png` | Garras de 1–2 px separadas por contorno, não bloco |
| F6-6 | **P3** (novo) | A cabeça da walk difere da cabeça da rotação e do ataque (34–47 px): o rosto troca ao passar de parado para andando | `met.json` (`cabeca_rot_x_walkq0`); `F6_rot_x_walkq0_x_atkq0_S_8x.png` | Mesma inclinação de cabeça na pose de walk, ou rotação tirada do q0 |
| F6-7 | **P3** | O pixel mais baixo varia 2–3 px na walk (perspectiva): âncora só pelo quadril (linha 46) | `met.json` (`baixo`) | Decisão do fundador e do game-dev; **NÃO VALIDADO no jogo** |
| F6-8 | **P3** | Ataque S: fogo pequeno sobre o peito e o rosto; ataque N: 2 px, não comunica disparo | `F6_attack_S_4x.png`, `F6_attack_N_4x.png`; `run1x_strip_2x.png` | Trapaça 2D na trajetória (como o próprio relatório sugere) ou efeito em camada separada |
| F6-9 | **P3** | Brilho especular "de plástico" e sombreado de esfera: risco de quarto estilo | rotações a 6× | Faixa de realce menor ou sem especular; decisão de direção (G-1 e critério unificado **abertos**) |
| F6-10 | **P3** (processo) | `build_all.sh` faz `rm -rf raw pacote_agumon_f6` antes de refazer: conferir a reprodução destrói a entrega no lugar | `scripts/build_all.sh` | Gravar a saída em pasta nova e comparar. Eu reproduzi numa cópia. Os scripts também dependem de `workspaces/game-art/tools` |
| F6-11 | **P3** (processo) | `fase13-comando10/scripts/__pycache__/lib.cpython-312.pyc` criado às 17:41:15, dentro da janela da F6 | `ls --full-time` | Mover para a lixeira e rodar com `-B`. **Nenhum asset do C10 mudou** (o sha256 do backup F2b confere 72/72). Autoria [H]: nenhum script da F6 importa `lib` |
| F6-12 | **P3** | O relatório diz "mesmo formato do F2b", mas o canvas é 60×60 em tudo (o F2b usa 48 e 56 em parte) | `met.json` (`canvas`) | Só registrar para o game-dev |

Nenhum P0 ou P1.

## 7. Recomendação

**Combinar, com restrição. Não adotar, não integrar, não descartar.**
- **Como asset:** não. Média 6,3, fidelidade 4,5 e 4 categorias abaixo de 8.
- **Como ferramenta:** sim, para o que ela prova bem [E]. Pé plantado com passo constante, cabeça estável, braço com amplitude, 4 direções coerentes, ataque lateral com a origem na boca, e custo 0 e reprodutível. O uso que faz sentido é o de **gabarito de pose por quadro**: a posição de pernas, pés e braços para o polimento à mão do B, que hoje é justamente onde o B perde (braço de 2–3 px no C10, pés que deslizavam no F2b).
- **Como quadro inicial ou final do PixelLab:** **não testado**, gasta gerações e é **decisão do fundador**.
- Se a combinação for testada, a régua de sucesso deve ser: **o rosto e o acabamento do sprite aprovado, com o movimento do F6**, e passar a régua 8 sem nenhuma categoria abaixo de 8 neste mesmo QA.

## 8. Não feito / NÃO VALIDADO

- Integração, âncora no mapa, velocidade real de deslocamento e desempenho: **NÃO VALIDADOS** (fora do escopo; o jogo não foi aberto).
- Fundo de mapa real: **NÃO VALIDADO** (só verde #7fa65a e cinza #9a9a9a).
- GIFs entregues tocados como arquivo: não. Conferi as dimensões, os 8/9 quadros e os 11 cs; toquei os PNG-fonte.
- O modelo `.blend` não foi aberto à parte; a reprodução usou os scripts (que o geram).
- Tamer e Champion (escala G-2) e a paleta (G-1): **conflitos abertos, não resolvidos aqui**. A escala do Agumon F6 é a mesma do F2b (36 × 35 px).
- `PROGRESS.md` da pasta é do game-art; não o alterei.

## 9. Decisões do fundador

1. Abrir ou não o teste de combinação (F6 como gabarito de movimento para o polimento B). O QA recomenda **sim, a custo 0**, sem PixelLab.
2. Âncora pelo quadril (linha 46) em vez do pixel mais baixo, se algum quadro do F6 entrar no jogo.
3. W espelhado (luz invertida) ou W 3D real.
4. Se o visual 3D (brilho especular, sombreado de esfera) é aceitável como família. Isso toca o critério unificado e o G-1, que continuam **abertos** (Etapa 6).
5. Pepper Breath no S e no N: aceitar a trapaça 2D na trajetória, ou efeito em camada separada, para qualquer método.
