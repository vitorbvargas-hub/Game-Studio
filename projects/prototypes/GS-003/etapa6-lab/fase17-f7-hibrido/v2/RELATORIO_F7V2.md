# RELATÓRIO F7v2: fechamento da F7 do Agumon (Comando 12.1)

**Digital Odyssey (GS-003) · game-art (Fable 5.2) · 2026-11-14, 21:32–21:47 · PixelLab: 0 gerações · Retro Diffusion: não usado · custo: R$ 0**
Brief: `etapa6-lab/BRIEF_COMANDO_12_1_F7_FECHAMENTO.md`. Entradas: `fase17-f7-hibrido/` (pacote F7, `RELATORIO_F7.md`, `QA_F7_INDEPENDENTE.md`) e o F2b.
Legenda: **[E]** medido ou feito nesta entrega · **[L]** lido de relatório ou QA, não refeito · **[H]** hipótese ou opinião minha.
Fangame independente, não oficial e não licenciado. Camada de licença: `private-prototype`. **Nada foi integrado ao jogo.**

## 0. Resumo

- É um passe único de custo zero sobre a F7. **A F7 original não foi tocada**: `sha256sum -c sha256.txt` na pasta da F7 dá 188/188 OK depois do trabalho [E]. Tudo novo está em `v2/`.
- Rosto, proporções, paleta e rotações preservados: rotações, idle (4 direções), feliz, walk E/W e walk N saem **com 0 px de diferença** contra a F7 [E].
- Mudou só o que o comando pediu: resíduo de fogo no ataque S, congelamento do ataque N, walk S (experimental adotada), fogo como projétil separado, GIF do ciclo e script de build.
- **Walk S/N:** adotei a experimental **só em S**; em **N ficou a original**. Detalhes e números no §3.
- **Limite que continua valendo:** eu não consigo tocar animação aqui. Julguei por folhas quadro a quadro (1× a 14×) e por métricas. Toda afirmação sobre como lê em movimento é [H] até o game-qa tocar os GIFs.

## 1. O que foi feito, item por item

| # | Tarefa do comando | Resultado | Evidência |
|---|---|---|---|
| 1 | Preservar rosto, proporções, paleta e rotações | Rotações 0 px; cabeça da walk igual à da pose parada em 8/8 nas 4 direções; 0 cores fora da paleta do F2b | `metricas_f7v2.json` → `regressao_F7_x_F7v2_px_por_quadro` |
| 2 | Ataque S q3: limpar o resíduo (QA-1) | **20 px** vermelho-escuros limpos em q3, 2 px em q4 e 1 px no ataque E/W q2. Sobram 0 | `comparacao/zoom10x_attack_S_q3_q4_F7_x_F7v2.png` |
| 3 | Ataque N: fim do congelamento (QA-2) | q5 a cabeça sobe 1 px; q7 o tronco assenta 1 px. Cortes q4→q8: `0, 0, 0, 372` viraram `60, 60, 242, 403` | `comparacao/folha_attack_N_F7_x_F7v2_corpo_4x.png` |
| 4 | Walk S/N experimental | Feita nas duas direções. Adotada em S, descartada em N (§3) | `comparacao/walk_SN_*`, `comparacao/folha_walk_*` |
| 5 | Pepper Breath como projétil | `attack_fx/` saiu do pacote. Projétil 24×24 com folha, quadros e especificação (§4) | `projetil_pepper_breath/` |
| 6 | Ciclo com tempos ≥ 40 ms (QA-3) | GIF das 4 direções com passo fixo de 40 ms, mais um GIF por direção com os tempos exatos (menor delay: 110 ms) | `comparacao/F7v2_ciclo_*` |
| 7 | Build sem apagar a saída (QA-4) | O script escreve numa pasta nova e só então troca; a saída anterior é movida para `_anteriores/`, nunca apagada | `scripts/build_f7v2.py` |

Sobre o item 2: o QA contou ~11 px com duas cores (`#720503`, `#8d0206`). A minha varredura achou mais duas da mesma família (`#5e0304`, `#4e0303`), por isso o total é 20 [E]. Cada pixel virou contorno (quando encosta em transparente ou em contorno) ou a cor vizinha do corpo.

No ataque E/W ficaram de propósito os vermelhos do **interior da boca** (`#400000`, `#af1900`, `#ba2000`, q3–q7) e 1 px `#9d2100` na ponta do focinho em q2. São parte do desenho da boca aberta do F2b, não resíduo solto [H]. Se o QA entender o contrário, a limpeza é de uma linha no `attack_v2.py`.

## 2. Entregas

| Item | Caminho (dentro de `etapa6-lab/fase17-f7-hibrido/v2/`) |
|---|---|
| Pacote | `pacote_agumon_f7v2/` (106 PNG + `pacote.json`): `rotations/`, `walk/{S,N,E,W}` (8), `idle/{S,N,E,W}` (6), `attack/{S,N,E,W}` (9), `feliz/S` (10) |
| Projétil | `projetil_pepper_breath/`: `projetil.json`, `folha_projetil_{1x,4x}.png`, `nascer/{S,N,E,W}` (2), `voo/{S,N,E,W}` (4), `impacto/` (4), demonstrações |
| Comparação | `comparacao/` (lista abaixo) |
| Métricas | `metricas_f7v2.json` |
| Scripts | `scripts/` (`build_f7v2.py`, `walk_sn_v2.py`, `attack_v2.py`, `projetil.py`, `metricas_v2.py`, `comparacao_v2.py`, mais cópias dos módulos da F7) |
| Integridade | `sha256.txt` (não cobre `tmp/` nem `_anteriores/`) |
| Progresso | `PROGRESS.md` |

**Em `comparacao/`:**
- F7 contra F7v2: `F7_x_F7v2_walk_SNEW_corpo_{1x,4x}.gif`, `F7_x_F7v2_attack_SNEW_corpo_{1x,4x}.gif` (110 ms, só o corpo), `F7_x_F7v2_rotacoes_{1x,4x}.png`, `folha_attack_{S,N}_F7_x_F7v2_corpo_{1x,4x}.png`, `zoom10x_attack_S_q3_q4_F7_x_F7v2.png`.
- Walk S/N: `walk_SN_F2b_original_experimental_{1x,4x}.gif` (colunas F2b, original F7 e experimental, para S e para N, 110 ms), `folha_walk_{S,N}_F2b_original_experimental_{1x,4x}.png`, `walk_S_pista_original_experimental_{1x,4x}.gif` (andando para baixo a 3 px por quadro) e os quadros soltos das quatro variantes em `walk_SN/`.
- Ciclo: `F7v2_ciclo_idle_walk_ataque_idle_SNEW_tick40ms_{1x,3x}.gif` (137 quadros de 40 ms, com o projétil simulado) e `F7v2_ciclo_{S,N,E,W}_tempos_exatos_corpo_{1x,4x}.gif`.

O GIF de 4 direções usa passo fixo de 40 ms, então cada troca de quadro pode atrasar até 40 ms (sem acumular). **A referência de tempo continua sendo o `pacote.json`**; os GIFs por direção têm os tempos exatos.

## 3. Walk S/N: original contra experimental

### Como a experimental foi feita [E]
- Pernas e braços vêm dos quadros `walk/S` e `walk/N` do F2b. Cabeça e tronco são os pixels da rotação (os mesmos da F7), colados por encaixe inteiro. O chão fica fixo (y = 49 em S, 48 em N).
- O sobe-e-desce foi regularizado (S: −1, −2, −1, 0; N: 0, −1, 0, 0), tirando ou repetindo uma linha da coxa. No F2b as pernas têm comprimentos diferentes entre as duas metades do ciclo.
- **Achado em S:** os quadros do F2b são simétricos. As duas pernas e os dois braços fazem o mesmo movimento ao mesmo tempo (assimetria esquerda/direita de 0 a 8 px por quadro). Colado direto, o resultado seria um agachar e levantar, não uma passada. Por isso, em S a metade direita de cada quadro vem do quadro i+4 (meio ciclo depois). É isso que dá passada alternada e braços em oposição.

### Números [E] (`metricas_f7v2.json` → `walk_SN_comparacao`)

| Medida, direção S | F2b | Original (rig F7) | Experimental |
|---|---|---|---|
| Cabeça × pose parada, px por quadro | 103 em 8/8 | 0 em 6/8; desloca 1 px de lado em q2 e q6 | **0 em 8/8** |
| Linha do chão | 49–50 | 49 | 49 |
| Topo (sobe-e-desce) | 13 12 13 14 14 13 15 15 | 15 16 15 14 ×2 | 14 13 14 15 ×2 |
| Assimetria esquerda/direita da metade de baixo, px | 0–8 | 19–45 | 23–49 |
| Largura do pé no chão, esquerdo / direito | iguais (3–7) | 8 / 8, sempre | 3–7 / 3–7, **alternando** |
| Pé erguido do chão | não | 1-2-3-1 px | não (o passo aparece na forma do pé e do joelho) |
| Balanço da mão (x, y) | 2,2 × 2,3 | 1,0 × 4,0 | 2,2 × 3,3 |
| Largura da silhueta | 24–28 | 22–23 | 26–27 |
| Componentes / pixels soltos / semitransparentes | 1 / 0 / 0 | 1 / 0 / 0 | 1 / 0 / 0 |
| Cores do ciclo; fora da paleta F2b | 55; 0 | 59; 0 | 69; 0 |
| Pose parada → walk q0 (corpo todo) | — | 86 px | **489 px** |
| Walk q7 → ataque q0 | — | 431 px [L] | 187 px |

| Medida, direção N | F2b | Original (rig F7) | Experimental |
|---|---|---|---|
| Cabeça × pose parada | 26–31 px | 0 em 6/8 (1 px de lado em q2, q6) | 0 em 8/8 |
| Largura da silhueta | 22 21 19 18 18 18 18 18 | 22 em 8/8 | 22 21 19 18 18 18 18 18 |
| Quadros com as duas mãos visíveis | 3/8 | 7/8 | 3/8 |
| Cortes entre quadros | 87–281 | 289–392 | **67–330** (q2→q3 70, q3→q4 67) |

### Decisão

- **S: experimental.** Ela ataca diretamente a crítica do QA à F7 ("marcha no lugar, sem dobra de joelho"): os pés alternam de forma (pé chato, ponta, pé estreito), o joelho dobra, os braços balançam em oposição e a cabeça não sai do lugar em nenhum quadro. Nas folhas a 4× e 8× a diferença é clara [H].
- **N: original.** A experimental não melhorou: a silhueta encolhe de 22 para 18 px depois de q1, as mãos somem em 5 de 8 quadros e dois cortes seguidos ficam em ~70 px, ou seja, quase parada. O comando manda ficar com a original nesse caso.

### Ressalvas da escolha em S
1. **Não vi em movimento.** A escolha é [H] sobre quadros parados. Se o game-qa tocar e a experimental não for claramente melhor, a regra do comando manda voltar à original.
2. **A entrada na caminhada piorou:** da pose parada para o q0 trocam 489 px (eram 86), porque braços e pernas são outro desenho e o corpo sobe 1 px. A cabeça não muda (0 px).
3. O pé não sai do chão; o passo é lido pela forma. A original erguia o pé 1–3 px.
4. S e N agora têm técnicas diferentes (S com membros do F2b, N por rig), então S mexe mais que N.

**Para trocar de volta:** em `scripts/build_f7v2.py`, mudar `WALK_ESCOLHIDA = {'S': 'experimental', ...}` para `'original'` e rodar o build. Os quadros das quatro variantes já estão em `comparacao/walk_SN/`.

## 4. Pepper Breath: especificação do projétil

Fonte de verdade: `projetil_pepper_breath/projetil.json`, repetida em `pacote.json` → `anims.attack.projetil`.

| Campo | Valor |
|---|---|
| Canvas | 24×24 px |
| Âncora | pixel **(12, 12)**, o centro da bola, em todos os quadros |
| Folha | `folha_projetil_1x.png`, células de 24×24, 6 colunas. Linhas: S, N, E, W (colunas 0–1 nascer, 2–5 voo) e impacto (colunas 0–3) |
| `nascer` | 2 quadros, 60 ms cada, sem loop, preso à boca |
| `voo` | 4 quadros, 80 ms cada, em loop; a cauda aponta para de onde ele veio |
| `impacto` | 4 quadros, 60/70/80/90 ms, sem loop, igual em todas as direções |
| Cores | 6, todas já presentes no F2b: `#e20704 #fb1903 #fd8c35 #fdd66f #fcf6cf #fcfffe` |

| Direção | Quadro de disparo | Tempo desde o início do ataque | Origem da boca no canvas 60×60 | Offset da âncora (29,5 ; 49) | Vetor | Ordem de desenho |
|---|---|---|---|---|---|---|
| S | q3 | 460 ms | (30, 29) | (+0,5 ; −20) | (0, +1) | na frente do Agumon |
| N | q3 | 420 ms | (30, 12) | (+0,5 ; −37) | (0, −1) | **atrás** do Agumon enquanto houver sobreposição |
| E | q2 | 320 ms | (38, 24) | (+8,5 ; −25) | (+1, 0) | na frente |
| W | q2 | 320 ms | (21, 24) | (−8,5 ; −25) | (−1, 0) | na frente |

- **Regra de posição:** no início do quadro de disparo, o pixel (12, 12) do projétil cai sobre o pixel de origem do canvas do sprite. Toca `nascer` parado, depois `voo` em loop se deslocando.
- **Fases do corpo** (em `pacote.json` → `anims.attack.fases`): S e N: preparação q0–q2, boca aberta q3–q6, recuperação q7–q8. E/W: preparação q0–q1, boca aberta q2–q7, recuperação q8.
- **Fica com o jogo:** deslocamento, velocidade, alcance, colisão, momento do impacto e dano.
- **Sugestões não validadas [H]:** 100 px/s e hitbox de 8×8 centrada na âncora. São só os valores da simulação dos GIFs.
- O W é desenhado direto, não espelhado, para a bola continuar centrada no pixel 12 [E].
- Demonstração: `demo_ataque_com_projetil_SNEW_tick40ms_{1x,4x}.gif` e `demo_ataque_com_projetil_quadros_chave_2x.png` (alcance de 30 px e 100 px/s, inventados para a simulação).

Medidas do projétil [E]: nascer 13 e 37 px; voo 62–68 px; impacto 97, 73, 41 e 13 px; 0 px na borda; 0 semitransparentes; 0 cores fora da paleta do F2b.

## 5. Métricas do pacote v2 [E]

| Medida | F7 | F7v2 |
|---|---|---|
| Canvas | 60×60 | 60×60 |
| Rotações × F7 | — | 0 px nas 4 direções |
| Idle, feliz, walk E/W, walk N × F7 | — | 0 px em todos os quadros |
| Walk S × F7 | — | 477–598 px por quadro (trocada) |
| Ataque S × F7 | — | 20 px em q3, 2 px em q4, 0 no resto |
| Ataque N × F7 | — | 60 px em q5, 242 px em q7, 0 no resto |
| Ataque E/W × F7 | — | 1 px em q2 |
| Resíduo vermelho-escuro no ataque (S / N / E) | 22 / 0 / 1 | **0 / 0 / 0** |
| Cortes do ataque N | 279 230 242 242 **0 0 0** 372 0 | 279 230 242 242 **60 60 242** 403 0 |
| Cortes do ataque S | 390 141 494 118 95 187 393 354 0 | 390 141 489 118 95 187 393 354 0 |
| Linha do chão (walk e ataque), S / N / E | 49 / 48 / 49 | 49 / 48 / 49 |
| Cabeça da walk × pose parada | 0 px (com 1 px de lado em q2/q6 de S e N) | 0 px; em S sem deslocamento lateral |
| Componentes por quadro / pixels soltos / semitransparentes / borda | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |
| W = espelho de E (walk, idle, ataque) | 0 px | 0 px |
| Cores do pacote; fora da paleta F2b | 154 (com o fogo); 0 | 158 (corpo) + 6 no projétil; 0 |
| Pose parada → ataque q0; ataque q8 → pose parada | 0 / 0 (S, N); 0 / 17 (E) | iguais |
| Pé de apoio da walk E a 3 px por quadro | deriva média 0,75 px | igual (walk E não mudou) |

**Paleta e escala (conflitos abertos, medidos e não decididos):** as cores continuam sendo só as do pacote F2b. Não refiz a medição contra o Endesga-32 e o v15b; a da F7 (0 cores exatas em nenhum dos dois) continua valendo como [L], porque a paleta não ganhou cor fora do F2b. Escala: Agumon com 35 px (S), 39 (N) e 41 (E/W) de altura, igual à F7 e ao F2b; razão para o tile de 32 de 1,09 a 1,28. Tamer e Champion não fazem parte desta entrega.

## 6. Regressões e pontos fracos

| ID | Sev. [H] | O que é |
|---|---|---|
| V2-R1 | **P2** | **O ataque agora depende do jogo para ter fogo.** Não existe mais `attack_fx/` no pacote. Se o jogo tocar `attack/` sem criar o projétil, o Agumon abre a boca e nada sai. Substitui o F7-R3 |
| V2-R2 | P2 | **Walk S: a entrada na caminhada troca 489 px** (86 na F7). A cabeça não muda, mas braços e pernas trocam de desenho |
| V2-R3 | P3 | Walk S e walk N usam técnicas diferentes; S mexe mais que N |
| V2-R4 | P3 | Walk S: o pé não sai do chão (a original erguia 1–3 px); 69 cores no ciclo (59 na original) |
| V2-R5 | P3 | Ataque N: q5 e q7 são deslocamentos de 1 px do mesmo desenho. Tira o congelamento, mas não é pose nova |
| V2-R6 | P3 | Ataque S continua com duas famílias de traço (corte de 489 px em q2→q3). Não era tarefa deste comando |
| V2-R7 | P3 | O projétil não foi testado no jogo: velocidade, alcance, colisão e leitura sobre o mapa são desconhecidos |
| V2-R8 | P3 | O build move a pasta do projétil antes de recriá-la, então as demonstrações precisam do `comparacao_v2.py` depois do build |

Continuam valendo, sem mudança, as regressões da F7 que este comando não pediu para tratar: F7-R1 (formato 60×60), F7-R7 a R12.

Resolvidos nesta entrega [E]: F7-QA-1, F7-QA-2, F7-QA-3, F7-QA-4 e F7-R4. O F7-R5 (fogo pequeno em E e N) deixa de existir, porque o projétil tem o mesmo tamanho nas 4 direções e segue além do canvas.

## 7. Tempo e custo

- PixelLab: 0 gerações; nenhuma ferramenta de geração foi chamada. Não consultei o saldo, porque nada foi gasto.
- Tempo de agente: ~15 min (21:32–21:47), dentro do teto de ~1 h.
- Refazer tudo: build 0,5 s; métricas ~5 s; comparações ~3 min (o codificador de GIF é Python puro).

## 8. Não feito

- Não integrei, não abri o jogo, não fiz build de jogo nem deploy.
- **Não assisti às animações em movimento** e não testei sobre mapa real.
- Não toquei no F2b, no C10, no F4, no F6, no worktree `kb-gs003` nem na F7 original.
- Não refiz as medições de paleta contra Endesga-32 e v15b (§5).
- Não fiz diagonais, feliz em N/E/W nem emoções novas.
- Não apaguei os rascunhos de build em `_anteriores/` (são saídas minhas desta sessão, idênticas ou anteriores à final).

## 9. Decisões que dependem do fundador (ou do QA)

1. Confirmar a walk S experimental depois de vê-la em movimento, ou voltar à original (troca de uma linha).
2. Aceitar S e N com técnicas diferentes, ou pedir a mesma para as duas.
3. Velocidade, alcance e colisão do projétil: são do jogo.
4. Paleta e escala: continuam abertas para a Etapa 6.

Eu paro aqui. Depois vêm o game-qa, o ChatGPT e o build isolado do game-dev.
