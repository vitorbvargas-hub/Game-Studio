# QA INDEPENDENTE: F7v2, fechamento da F7 do Agumon (Comando 12.1)

**Digital Odyssey (GS-003) · game-qa (Opus 5.5) · 2026-11-14, ~21:47–22:15 · custo PixelLab: 0** (nenhuma ferramenta de geração chamada)
Objeto: `fase17-f7-hibrido/v2/` (`RELATORIO_F7V2.md`, `metricas_f7v2.json`, `sha256.txt`, `pacote_agumon_f7v2/`, `projetil_pepper_breath/`, `comparacao/`, `scripts/`), contra o brief `etapa6-lab/BRIEF_COMANDO_12_1_F7_FECHAMENTO.md`, o comando `COMANDO_FUNDADOR_12_F7.md` §5 e o meu `../QA_F7_INDEPENDENTE.md` (linha de base: 7,7).
Legenda: **[E]** executado nesta auditoria · **[L]** de relatório ou QA anterior, não reverificado · **[H]** hipótese ou julgamento · **NÃO VALIDADO**, com o motivo.
Fangame independente, não oficial e não licenciado. **Só este arquivo foi criado na pasta.** Não alterei asset, script, `PROGRESS.md` nem `sha256.txt` do game-art; não gerei, não integrei, não publiquei.
Scripts do QA (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_f7v2/` (`met_v2.py`, `mkpage_v2.py`, `cap_v2.mjs`, `crops_v2.py`, `sheet_v2.py`). Saídas: `workspaces/game-qa/tmp/qa_f7v2/` (`met.json`, `view.html`, `cap/` com 144 capturas e `rects.json`, `sheets/`, `repro/`).

## 0. Veredito

| | 8 critérios do Comando 12 §5 (média simples) | 6 ponderados (Comando 11 §5) | Meta 8 | GS-010 |
|---|---|---|---|---|
| F7 (linha de base) [L] | 7,69 ≈ **7,7** | 7,73 | não | não |
| **F7v2** [E/H] | 7,69 ≈ **7,7** | **7,78 ≈ 7,8** | **não** | não |

- **A F7v2 cumpre o brief** [E]: preservou rotações, idle, feliz, walk E/W e walk N com 0 px de diferença; limpou o resíduo do ataque S; tirou o congelamento do ataque N; separou o fogo num projétil com especificação coerente; refez o ciclo com delays ≥ 40 ms; e o build não apaga mais a saída. A F7 original está intacta (188/188).
- **A nota quase não sobe.** As correções eram pequenas (P3), e a walk S nova melhora o ciclo mas piora a entrada e a saída da caminhada. Na média simples empata com a F7 (7,7); na ponderada sobe 0,05. **Continua abaixo de 8.** Não arredondo para cima.
- **Walk S: fico com a experimental** (a mesma escolha do game-art). Em movimento, o ciclo é claramente melhor: passa de "marcha no lugar" a passada com joelho e braço em oposição, e a cabeça fica estável em 8/8. O custo é uma troca de 492 px ao começar a andar (era 107), e S e N passam a ter técnicas diferentes. Detalhes no §3. **Walk N: original**, confirmado.
- **Pronto para o ChatGPT:** sim, como candidata e com este QA. **Pronto para o build isolado do game-dev:** sim, sem bloqueio P0/P1, **desde que** o jogo crie o projétil conforme `projetil.json` (sem isso, o ataque fica mudo, V2-R1).

## 1. Build testado e método [E]

- Pasta não versionada; HEAD do repositório `f02fbab` (sem mudança desde o QA da F7). `v2/sha256.txt`: **219/219 OK**. `fase17-f7-hibrido/sha256.txt` (F7 original): **188/188 OK**. Na pasta da F7, nada fora de `v2/` é mais novo que o meu QA anterior.
- Arquivos de `v2/` com datas de 21:38 a 21:46, compatíveis com os ~15 min declarados.
- **Reprodução:** copiei os scripts para `tmp/qa_f7v2/repro/` (só mudei a linha `O=` do `lib.py` da cópia para gravar na minha pasta) e rodei `build_f7v2.py`. O pacote saiu **idêntico byte a byte** (106 PNG + `pacote.json`) em 0,8 s; o projétil também, exceto as 3 demonstrações, que vêm do `comparacao_v2.py` (V2-R8, declarado). Rodei uma segunda vez: a saída anterior foi **movida** para `_anteriores/` e a nova é idêntica. Nada foi escrito no laboratório.
- **Medidas próprias** (`met_v2.py`, sem PIL nem numpy): diferença por quadro v2 × F7 em todas as animações; vermelhos escuros no ataque (resíduo × interior da boca); walk S/N nas quatro variantes (F2b, original, experimental, a do pacote); emendas idle/walk/ataque; projétil (canvas, âncora, bbox, centro, cores, espelho W/E, folha × quadros soltos); e a especificação de disparo recalculada a partir dos delays e das coordenadas.
- **Em movimento:** página própria (`tmp/qa_f7v2/view.html`), montada a partir dos PNG-fonte, do `pacote.json` e do `projetil.json`, no **Chromium headless-shell 1243**. Palcos: walk S e N com F2b, original e experimental lado a lado, a **1× e a 4×**; pista S a 2× (chão rolando 3 px por quadro); ataque + projétil nas 4 direções a 1× e 2× (idle → ataque → idle); ciclo idle → walk ×2 → ataque + projétil → idle nas 4 direções a 2×. A simulação do projétil usa 60 px de alcance a 100 px/s, valores inventados como os do game-art. **0 erros de console, 0 exceções**; a única requisição foi o próprio `file://`. Foram 24 capturas em tempo real e 120 em tempo fixo (t = 0 a 4760 ms, passo de 40 ms), recortadas em folhas.
- **Visual:** folhas dos PNG-fonte a 2×, 6×, 7×, 8× e 14× (walk S original × experimental, emenda central da experimental, ataque S q2–q5 e N q3–q8 F7 × v2, transição idle → walk → idle).
- **GIFs entregues:** conferi a estrutura (quadros, delays, loop) dos 20 GIFs; não os toquei como arquivo.
- **Limites:** headless sem GPU, então o tempo é indicativo. Desta vez não medi o tempo por rAF (o render é por tempo exato, a partir dos delays do JSON). Sem mapa real e sem a velocidade do jogo.

## 2. Correções pedidas (QA-1 a QA-4, resíduo do q3, ataque N) [E]

| Item | Pedido | Resultado medido | Status |
|---|---|---|---|
| **QA-1 / resíduo do q3** | Limpar o fogo antigo no corpo do ataque S | v2 × F7: 20 px em q3, 2 px em q4, 0 no resto. Varredura da família vermelho-escura (`#720503 #8d0206 #5e0304 #4e0303`): F7 tinha 20 px em q3 (incluindo cabeça, flanco e pernas) e 2 em q4; **a v2 tem 0**. Sobram só os 2 px `#431401` de q3, que existem em todos os quadros (traço do rosto). Zoom de 7× confere: q3 limpo | **Resolvido** |
| Resíduo E/W q2 | (extra do game-art) | `#640100` em (38,25) removido. Ficam `#400000` e `#9d2100` no focinho e na boca: **concordo** que são o interior da boca aberta e aparecem coerentes em q2–q7 | **Resolvido** |
| **QA-2 / ataque N parado** | Acabar com o corpo igual em q4–q7 | Cortes q4→q8: **60, 60, 242, 403** (eram 0, 0, 0, 372). v2 × F7: 60 px em q5 (cabeça +1 px), 242 px em q7 (tronco −1 px). A 7× lê como um leve sobe e assenta. Não é pose nova (V2-R5) | **Resolvido** (mínimo) |
| **QA-3 / ciclo com delays de 20 ms** | Delays ≥ 40 ms | `..._tick40ms_{1x,3x}.gif`: 137 quadros de 4 cs (5480 ms). Ciclos por direção: delays de 11 a 26 cs; totais S 5480, N/E/W 5400 ms, que batem com a soma do `pacote.json` (idle 1180 + walk 1760 + ataque 1360/1280 + idle 1180) | **Resolvido** |
| **QA-4 / build destrutivo** | Não apagar a saída anterior | Nenhum `rmtree`, `remove` ou `unlink` nos scripts. `build_f7v2.py` grava em `_build_<hora>` e troca, movendo a anterior para `_anteriores/`. Confirmado em duas execuções na minha cópia | **Resolvido** |
| F7-R4 (texto "q4–q6") | — | O relatório da v2 já fala em q4–q7 | **Resolvido** |

## 3. Walk S: original × experimental, em movimento (prioridade 1)

### 3.1 O que medi [E]

| Medida (S) | F2b | Original (rig F7) | **Experimental (adotada)** |
|---|---|---|---|
| Cabeça × pose parada | 103 px em 8/8 [L] | 0 px, mas com deslocamento lateral de 1 px em q2 e q6 | **0 px em 8/8, sem deslocamento** |
| Linha do chão | 49–50 [L] | 49 | 49 |
| Topo (sobe e desce) | — | 15 16 15 14 | 14 13 14 15 (amplitude de 2 px) |
| Meia-volta (q_i × q_i+4) | — | 165, 189, 544, 167 | 195, 183, 174, 125 |
| Cortes entre quadros | — | 383–479 | 434–465 (mais uniformes) |
| Mão esquerda / direita, centro das garras (x; y) | — | x 20–21 / 38–39; y 41–45 | x 18–20 / 39–41; y 39–42,5, **em oposição** (q0: esquerda baixa e direita alta; q4: o inverso) |
| Largura da silhueta | — | 22–23 | 26–27 |
| Pés | — | sobem 1–3 px inteiros, sem joelho [L] | ficam no chão; o passo aparece pela dobra do joelho e pela sola do pé que vem para a câmera (q1 direita, q5 esquerda) |
| Cores do ciclo / fora do F2b | — | 59 / 0 | 69 / 0 |
| Componentes / semitransp. / borda | — | 1 / 0 / 0 | 1 / 0 / 0 |
| Idle q5 → walk q0 (começar a andar) | — | **107 px** | **492 px** |
| Walk q_i → idle q0 (parar em qualquer quadro) | — | 83–433 (média ~338) | 187–564 (média ~438) |
| Walk q7 → ataque q0 | — | 431 | 187 |

- **Emenda central** (metade esquerda do quadro i, direita do i+4): a 14× **não aparece**. As duas pernas ficam separadas pelo vão entre elas e o tronco vem inteiro da rotação [E].
- A experimental do pacote é idêntica aos quadros de `comparacao/walk_SN/S_experimental` (0 px) e a original de comparação é idêntica à walk S da F7 (0 px) [E].

### 3.2 Em movimento [E, leitura H]

- **A 4×:** a original lê como **marcha no lugar**: os pés sobem e descem e os braços quase não mexem. A experimental lê como **passada**: as pernas alternam com o joelho dobrando, a sola aparece no passo, os braços balançam em oposição às pernas e a cabeça fica estável. É a melhora que o meu QA da F7 pediu.
- **A 1×:** a diferença diminui, mas aparece. A experimental "pulsa" na largura (os braços abrem e fecham) e as pernas trocam visivelmente; a original quase não muda de silhueta. É melhor, com diferença **moderada** nessa escala.
- **Pontos fracos da experimental:** os braços abrem para os lados (a mão vai até x 18 e x 41) em vez de ir para a frente e para trás, então em alguns quadros lembra um "bater de asas" discreto. Começar a andar troca braços e pernas de uma vez e sobe o corpo 1 px (492 px). S e N agora usam técnicas diferentes. O pé nunca sai do chão.

### 3.3 Decisão

**Manter a experimental em S** [H]. O ciclo de caminhada é a animação que o jogador mais vê, e nela a melhora é clara a 4× e perceptível a 1×. O que piora (entrada, saída, coerência com o N) dura um quadro ou depende de comparar duas direções. **Não é "melhor em tudo"**: se o fundador der mais peso à coerência S/N ou ao começo da caminhada, a volta à original é uma linha (`WALK_ESCOLHIDA` no `build_f7v2.py`), e eu não contestaria. O teste do Vitor no build isolado decide.

**Walk N: original, confirmado** [E]. A experimental encolhe de 22 para 18 px depois de q1, as mãos somem e há dois cortes seguidos de ~70 px (quase parada). O pacote usa a original (0 px contra a F7).

## 4. Projétil Pepper Breath (prioridade 3)

### 4.1 Especificação [E]

| Verificação | Resultado |
|---|---|
| Canvas e âncora | 24×24 em todos os quadros; o centro de massa de `nascer` e `impacto` fica exatamente em (12,0 ; 12,0); o pixel (12,12) é opaco em todos os quadros de `nascer` e `voo` |
| Tempo de disparo | Recalculado a partir dos delays do ataque: S 460, N 420, E/W 320 ms. **Bate** com o `projetil.json` |
| Offset da âncora | origem − (29,5 ; 49): S (+0,5 ; −20), N (+0,5 ; −37), E (+8,5 ; −25), W (−8,5 ; −25). **Bate** |
| Canto do projétil no canvas do sprite | origem − 12: S (18,17), N (18,0), E (26,12), W (9,12). **Bate** |
| W × E | O W é o espelho do E deslocado 1 px (0 px de diferença assim), para manter o centro em 12. Coerente com o que o relatório diz |
| Origem na boca | **S:** (30,29) cai no interior escuro da boca aberta de q3 (`#0a0205`), e a bola nascendo cobre 13 px do rosto. **E:** (38,24) cai no vão entre as mandíbulas de q2, logo à frente dos dentes. **W:** espelho. **N:** (30,12) fica 1 px acima do topo da cabeça (de costas), atrás do corpo. As quatro são coerentes |
| Quadro de disparo × fases | S/N disparam em q3 e E/W em q2, o primeiro quadro de boca aberta das fases do `pacote.json` |
| Ordem de desenho | Na frente em S/E/W, atrás em N. A simulação confirma: no N a bola aparece por cima da cabeça e sobe |
| Folha | `folha_projetil_1x.png` 144×120 = os quadros soltos (0 px em todas as 26 células) |
| Limpeza | 0 semitransparentes, 0 px na borda, 6 cores, todas do F2b. `voo` tem 2–3 componentes (faíscas soltas da cauda), intencional |
| Corpo do ataque sem fogo | 0 px das 6 cores do fogo nos 36 quadros de ataque. Confirma o V2-R1 |
| Duplicidade de fonte | A especificação está no `projetil.json` e repetida no `pacote.json` → `anims.attack.projetil`, com os mesmos valores |

### 4.2 Simulação ataque + projétil nas 4 direções [E, leitura H]

- **E/W:** o fecha-olho de antecipação (q1), a bola nascendo na ponta da boca em q2 e saindo para a frente. Lê bem a 1× e a 2×.
- **S:** a boca abre em q3, a faísca nasce sobre a boca e a bola desce sobre o peito, na frente do corpo, em direção à câmera. Lê como disparo para a frente. O corte de 489 px em q2→q3 (troca de desenho rig → PixelLab) continua visível (V2-R6, fora do escopo).
- **N:** a bola surge por trás da cabeça e sobe. Lê como disparo para longe.
- **Tamanho:** a bola tem 62–68 px por quadro (cerca de 9×9 com cauda), igual nas 4 direções. É **menor** que o fogo da F7 no S (185 px no pico) e maior que o do E/N. Lê a 1×; o impacto (97 → 13 px, partículas espalhadas) é discreto a 1× [H].
- Velocidade, alcance e colisão ficam com o jogo, como manda o brief. **NÃO VALIDADO** no jogo.

## 5. Regressões V2-R1 a R8 (prioridade 4) [E]

| ID | Sev. do relatório | Confere? | Leitura do QA |
|---|---|---|---|
| V2-R1 (ataque depende do jogo para ter fogo) | P2 | **sim** | 0 px de fogo no corpo. Sem o projétil, o Agumon abre a boca e nada sai. **Condição do build isolado** |
| V2-R2 (entrada na walk S troca 489 px) | P2 | **sim** | 492 px a partir do último quadro do idle (489 a partir da rotação). Parar a walk também ficou mais brusco (média ~438 contra ~338). Mantenho P2 |
| V2-R3 (S e N com técnicas diferentes) | P3 | sim | Lado a lado, o S balança braço e perna e o N quase só sobe e desce |
| V2-R4 (pé não sai do chão; 69 cores) | P3 | sim | Chão 49 em 8/8; 69 cores (59 na original) |
| V2-R5 (ataque N com deslocamentos de 1 px) | P3 | sim | Tira o congelamento, sem pose nova |
| V2-R6 (duas famílias de traço no ataque S) | P3 | sim | Corte de 489 px em q2→q3; cabeça 141–147 px diferente em q3–q6 |
| V2-R7 (projétil não testado no jogo) | P3 | sim | **NÃO VALIDADO** |
| V2-R8 (build tira as demonstrações do projétil) | P3 | sim | Na minha reprodução, as 3 demonstrações não voltam sem o `comparacao_v2.py` |

Regressões da F7 que continuam [E]: F7-R1 (formato 60×60), F7-R7 (ataque E q7→q8 390 px), F7-R8, F7-R10, F7-R11, F7-R12 (paleta fora do Endesga-32 e do v15b, conflito aberto). **F7-R5 deixou de existir**, porque o fogo agora é o mesmo nas 4 direções.

### Problemas novos (não registrados no relatório)

| ID | Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|---|
| V2-QA-1 | P3 (documentação) | O `pacote.json` → `attack.fonte.S` diz "limpo em q3 (**15 px**)", mas a diferença real é de **20 px** (como o relatório diz) | `met.json` → `dif_v2_x_F7.attack_S` | Corrigir o texto na próxima regeneração do JSON |
| V2-QA-2 | P3 (processo) | Os scripts ainda dependem de `workspaces/game-art/tools` (`pxpng`, `gifenc`) e têm o destino `O` fixo no `lib.py`, então reproduzir fora do laboratório exige editar o `lib.py`. O carimbo de hora é por segundo: dois builds no mesmo segundo falham no `rename` (falham, sem perder dados) | `scripts/lib.py` linhas 3 e 7; `build_f7v2.py` linha 10 | Parametrizar `O` por argumento; vendorizar os dois módulos |
| V2-QA-3 | P3 (visual) | Os braços da walk S experimental abrem para os lados (silhueta de 26–27 px contra 22–23 na pose parada), e alguns quadros lembram um "bater de asas" discreto | §3.1, `tmp/qa_f7v2/sheets/wS_q0-3_8x.png` | Opcional, custo 0: fechar 1 px o braço nos quadros mais abertos. Só com autorização |

**Nenhum P0 ou P1.** P2: F7-R1, V2-R1 e V2-R2.

## 6. Integridade (prioridade 5) [E]

- F7 original: `sha256sum -c` **188/188 OK**; nenhum arquivo da F7 fora de `v2/` mudou desde o meu QA anterior.
- F7v2: **219/219 OK** (o `sha256.txt` não cobre `tmp/` nem `_anteriores/`, como declarado; também não cobre este QA, criado depois).
- v2 × F7: rotações, idle (4 direções), feliz S, walk N, E e W com **0 px** de diferença; W = espelho de E (0 px) em walk, idle e ataque.
- Canvas 60×60 em tudo; chão 49 (S/E/W) e 48 (N) em walk, idle e ataque; 1 componente por quadro; 0 semitransparentes; 0 px na borda; 158 cores no corpo, 0 fora da paleta do F2b.
- `_anteriores/` guarda 3 rodadas de build do game-art (21:38, 21:38, 21:43). Não são entregas; não interferem.

## 7. Notas

**Régua:** a mesma do QA da F7 (referência aprovada v13/v15 + `FICHA_AGUMON.md`, leitura a 1× e 4× em movimento). A paleta fica **fora** das notas (G-1 aberto). 8 = pronto para integração de teste; GS-010 = média ≥ 9 e nenhuma categoria < 8. Uso passos de 0,25 onde a mudança é real, mas pequena demais para meio ponto.

### 7.1 Os 8 critérios do Comando 12 §5

| # | Critério | F7 | **F7v2** | Justificativa |
|---|---|---:|---:|---|
| 1 | Fidelidade ao Agumon | 8,0 | **8,0** | Rotações, rosto e paleta sem alteração. A cabeça da walk S agora é a da rotação, sem deslocamento lateral. As falhas herdadas do F2b continuam |
| 2 | Qualidade GBA Plus | 7,5 | **7,5** | O resíduo saiu (era a menor das falhas). Continuam as duas famílias de traço no ataque S e a perna lateral de um tom só. A walk S mistura membros do F2b com tronco do rig, mas da mesma família de desenho |
| 3 | Fluidez de animação | 7,5 | **7,75** | Walk S de ≈6,5 para ≈7,5; ataque N de ≈7 para ≈7,25. Walk N continua ≈6,5 (marcha no lugar) e segura a nota |
| 4 | Consistência anatômica | 8,5 | **8,5** | Âncora e chão fixos, cabeça 8/8 em tudo, projétil com âncora única. Desconto novo: S e N com técnicas diferentes. Empata |
| 5 | Legibilidade no jogo | 7,5 | **7,5** | O projétil lê nas 4 direções a 1×, mas é pequeno e o impacto é discreto. Sem mapa real nem velocidade do jogo, não passo de 7,5 |
| 6 | Custo e tempo | 7,0 | **7,0** | Marginal excelente (0 gerações, ~15 min, reprodução em 0,8 s). Por espécie continua médio: a walk S nova depende de uma walk S prévia do F2b |
| 7 | Transições entre animações | 8,0 | **7,75** | Melhorou walk → ataque S (431 → 187 px), mas começar e parar a walk S ficou mais brusco (107 → 492; média ~338 → ~438). O projétil desacoplado exige sincronia do jogo |
| 8 | Ausência de regressões | 7,5 | **7,5** | Saíram QA-1 a QA-4, R4 e R5. Entrou o V2-R2 (P2) e o ataque segue dependendo do jogo (V2-R1 no lugar do F7-R3) |
| | **Média simples** | **7,69** | **7,69 ≈ 7,7** | (8,0 + 7,5 + 7,75 + 8,5 + 7,5 + 7,0 + 7,75 + 7,5) / 8. **Empate com a F7.** Quatro categorias abaixo de 8 |

### 7.2 Os 6 ponderados (Comando 11 §5)

| Critério (peso) | B (F2b + C10) [L] | F7 [L] | **F7v2** |
|---|---|---|---|
| Fidelidade (25) | 7,5 | 8,0 | **8,0** |
| GBA Plus (20) | 7,0 | 7,5 | **7,5** |
| Animação (20) | 7,5 | 7,5 | **7,75** |
| Consistência (15) | 7,5 | 8,5 | **8,5** |
| Legibilidade (10) | 7,5 | 7,5 | **7,5** |
| Tempo/custo (10) | 6,0 | 7,0 | **7,0** |
| **Média ponderada** | **7,25** | **7,73** | **7,78** |

Conta: 8,0×0,25 + 7,5×0,20 + 7,75×0,20 + 8,5×0,15 + 7,5×0,10 + 7,0×0,10 = 2,00 + 1,50 + 1,55 + 1,275 + 0,75 + 0,70 = **7,775**.

**Leitura:** a F7v2 é **um pouco melhor que a F7** (+0,05 no ponderado, dentro da incerteza do mapeamento) e **mais fácil de integrar** (projétil separado, build seguro, ciclo legível). **Não chega a 8.** Pela regra do ADR-012, ficam abaixo de 8 GBA Plus, animação, legibilidade e custo; na média simples, também transições e regressões. O que falta para 8 [H] não é mais polimento de pixel: é a walk N, a troca de desenho dentro do ataque S e um teste real de legibilidade no mapa.

## 8. Recomendação

1. **Adotar a F7v2 como versão candidata do Agumon**, no lugar da F7. Não está homologada: quem homologa é o Vitor.
2. **Walk S: experimental. Walk N: original.** Ver §3.3. Se o Vitor achar a entrada da caminhada brusca no build, volta-se à original com uma linha.
3. **ChatGPT:** pronto para enviar como candidata, com este QA. O envio deve dizer que a nota é **7,7 / 7,8, igual à da F7 na prática**, que a meta de 8 não foi atingida e listar os P2 (F7-R1, V2-R1, V2-R2). Enviar os GIFs por direção com tempos exatos e o `projetil.json`.
4. **Build isolado do game-dev:** pronto, com três condições. (a) Criar o projétil no **início** do quadro de disparo, com o pixel (12,12) sobre a origem da boca, `nascer` parado e `voo` em loop, desenhado **atrás** do Agumon no N e na frente nas demais direções. (b) Ancorar o sprite em (29,5 ; 49) em todas as animações. (c) Velocidade, alcance, colisão e impacto ficam com o jogo; os 100 px/s e 60 px da simulação não são especificação.
5. **Não fazer mais passes no Agumon antes do teste do Vitor** (o brief diz "passe único"). Os P3 (V2-QA-1 a QA-3) podem esperar.

## 9. Não feito / NÃO VALIDADO

- Integração, mapa real, velocidade de deslocamento, colisão do projétil e desempenho: **NÃO VALIDADOS** (fora do escopo; o jogo não foi aberto).
- Tempo real por rAF: não medi nesta auditoria (as capturas em tempo fixo usam os delays exatos do JSON). No QA da F7 o desvio foi de ±17 ms [L].
- GIFs entregues tocados como arquivo: não. Conferi a estrutura dos 20 GIFs e toquei os PNG-fonte.
- Paleta (G-1) e escala (G-2): conflitos abertos, não reavaliados. As cores continuam só as do F2b (0 fora) [E].
- Não alterei o `PROGRESS.md`, o `sha256.txt` nem nenhum asset ou script da pasta (são do game-art). O progresso desta auditoria fica neste arquivo e em `workspaces/game-qa/tmp/qa_f7v2/`.

## 10. Decisões do fundador

1. Aceitar a F7v2 como candidata no lugar da F7.
2. Walk S: experimental (recomendação do QA e do game-art) ou original (mais coerente com o N e com início de caminhada mais suave).
3. Aceitar S e N com técnicas diferentes, ou pedir depois uma walk N no mesmo padrão (exige trabalho novo).
4. Confirmar o modelo do projétil separado como padrão para os próximos Digimon.
5. Paleta e escala continuam abertas para a Etapa 6.
