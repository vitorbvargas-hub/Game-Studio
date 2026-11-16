# QA INDEPENDENTE: F5 prática, Retro Diffusion (Agumon, rotate em 8 direções + walk E)

**Digital Odyssey (GS-003) · game-qa · 2026-11-14, ~18:30–19:10 · custo: 0** (nenhuma ferramenta PixelLab, nenhum acesso ao Retro Diffusion, navegador ou conta)
Objeto: `fase15-f5-retro-diffusion/teste/` (`RELATORIO_F5_PRATICA.md`, `metricas_f5_pratica.json`, `D_rotate/`, `B_walk/`, `comparacao/`, `entrada/`), comparado com F2b (`fase13-comando10/backup_f2b/pacote_agumon_f2/`), C10 (`fase13-comando10/pacote_agumon_c10/`), F6 (`fase16-f6-blender/pacote_agumon_f6/`), com `fase11-fichas-anatomia/FICHA_AGUMON.md` e com o meu `fase16-f6-blender/QA_F6_INDEPENDENTE.md`.
Legenda: **[E]** executado nesta auditoria · **[L]** de relatório ou QA anterior, não reverificado · **[H]** hipótese · **NÃO VALIDADO**, com o motivo.
**Nada fora deste arquivo foi alterado.** Scripts (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_f5p/` (`met_f5p.py`, `sheet_f5p.py`, `feet_f5p.py`, `gifinfo.py`, `mkpage_f5p.py`, `cap.mjs`). Saídas: `workspaces/game-qa/tmp/qa_f5p/` (`met.json`, `sheet/`, `cap/`, `view.html`).

## 0. Veredito

| | QA (este) | Autoavaliação game-art | Régua 8 | GS-010 |
|---|---|---|---|---|
| **F5 prática RD (rotações em 8 direções + walk E, cru)** | **6,2** (escopo parcial) | 6,4 | não atinge | não atinge |

- **Escopo:** 1 rotate (8 vistas) e 1 walk lateral de 8 quadros. Sem ataque, sem N/S do walk, sem idle, sem emoção. **A nota não é comparável à de um pacote completo** e não serve para ranking firme.
- O **rotate** é o resultado útil [E]: S praticamente idêntico à entrada (2 px de silhueta), base na linha 44 nas 8 vistas, cabeça coerente (18–22 px). As diagonais são **rascunho aproveitável com limpeza**, não arte final (§6).
- O **walk** é o elo fraco [E]: só fica sem deslizar a ~1 px por quadro; tem **3** quadros (não 2) sem contato com a linha do chão; só uma fase de apoio no ciclo (lê como “pulinho”); a cabeça muda em 7 de 8 quadros; os braços se desfazem de q4 a q7.
- **Recomendação: concordo com "reservar".** Não adotar o walk. O rotate pode servir de rascunho de diagonais, se o fundador puser diagonais no escopo. Gastar mais cota: **C sim, A não** (§7).
- Achei **4 pontos que o relatório não registra**: cinza neutro `#808080` fora da paleta em todas as 8 vistas; paletas do rotate e do walk quase disjuntas (1 cor em comum); q0 do walk ≠ entrada (97 px de silhueta); o 4º quadro fora do chão (q4). E 1 que o relatório **exagera**: o W do rotate só difere do E espelhado no sombreado (silhueta: 1 px).

## 1. Build testado e método [E]

- Pasta não versionada (`git status`: etapa6-lab com arquivos `??`); HEAD do repositório `f02fbab`. Datas dos arquivos 18:17–18:28, compatíveis com o `PROGRESS.md`.
- **Integridade:** `sha256sum -c sha256.txt` → 8/8 OK. As entradas `f2b_S_48.png` e `f2b_E_48.png` têm o mesmo sha das rotações S e E do backup F2b (`3385f9fb…b14c`, `bbc67b0e…d9fa`). `backup_f2b_sha256.txt` → 72/72 OK (F2b intocado).
- **Fatiamento:** refatiei as duas folhas originais (`D_rotate_sheet.png` 144×144, 3×3 com centro vazio; `B_walk_sheet.png` 192×96, 4×2) e comparei com os PNG entregues: **0 px de diferença** em 8/8 rotações e 8/8 quadros; centro da folha do rotate com 0 px opacos. Conferi visualmente o mapeamento de direções (SE/S/SW em cima, E/W no meio, NE/N/NW embaixo): **correto**.
- **GIFs (estrutura, `gifinfo.py`):** `D_rotate.gif` e `B_walk.gif` 48×48, 8 quadros, **150 ms** por quadro, loop infinito. Os GIFs de `comparacao/` também tocam F2b e F6 a 150 ms (no pacote eles são de 110 ms): a comparação lado a lado deixa F2b e F6 ~36% mais lentos que o normal (P3, só de apresentação).
- **Medidas próprias** (`met_f5p.py`, sem PIL/numpy, mesmas definições do meu QA F6): canvas, bbox, semitransparência, borda, componentes 8-conexos, pixel de cor isolado (8 vizinhos), cabeça (14 linhas do topo, dx −3..3) contra o q0, cortes entre quadros, meio ciclo (q_i × q_{i+4}), espelho, silhueta, paleta contra **todas** as 254 cores do pacote F2b.
- **Visual:** folhas a 1×, 4× e 8× com guia na linha 44 (`sheet/`), S entrada × RD, E F2b × E rotate × walk q0, E × W espelhado, N F2b × F6 × RD, walk E F2b × F6 × C10 × RD por quadro.
- **Em movimento:** página própria (`view.html`, quadros embutidos dos PNG) no **Chromium headless-shell 1243**, como na F6 (`--no-proxy-server`, `NODE_USE_ENV_PROXY=0`). **0 erros de console, 0 exceções**; única requisição `file://`. 30 capturas tocando, 18 quadro a quadro. Tempo por rAF: RD 149–151 ms (alvo 150), F2b e RD a 110 ms: 99–122 ms.
- **Pista:** pés na linha do chão em coordenada de mundo para 1, 2, 3 e 4 px por quadro (`feet_f5p.py`).
- **Limites:** headless sem GPU (tempo indicativo); sem fundo de mapa real; o jogo não foi aberto. A pista visual da minha página ficou com as faixas sobrepostas (layout); a conclusão de deslizamento vem da medida numérica, e os GIFs de pista do game-art não foram decodificados quadro a quadro.

## 2. Conferência das métricas do game-art [E]

| Medida | Relatório | QA | Confere? |
|---|---|---|---|
| Walk RD: canvas / borda / semi / componentes | 48×48 / 0 / 0 / 1 | iguais | sim |
| Amplitude centróide y / x | 2,7 / 0,9 | 2,64 / 0,92 | sim |
| Amplitude do topo | 2 | 2 (topo 3–5) | sim |
| Pixel mais baixo | 42–44 | 44,44,44,44,**43**,42,42,44 | sim, mas são **3** quadros fora da linha 44 (q4, q5, q6), não 2 |
| Cabeça idêntica ao q0; px diferentes | 1/8; 19–50 | 1/8; 19–50, todos com dx = +1 | sim |
| Cores / fora da F2b / distância máx. | 17 / 12 / 3,2 | 17 / 12 / 3,2 | sim |
| Pixels isolados por quadro | 44–65 | 44–65 (8,7% dos px; F2b 6,0%, C10 4,7%, F6 0,5%) | sim |
| Pé de apoio: ponta recua ~1 px/quadro, calcanhar parado | sim | em mundo a v = 1: 19–25, 21–24, 21–24, 21–24 (estável q1–q3); a v = 2: 22–25 → 24–27 (desliza 1 px/quadro); a v = 3: desliza 2 px/quadro | sim |
| Rotações: altura S/E/N | 35/38/38 | 35/38/38 | sim |
| Largura S/E/N; cabeça S/E | 22/34/22; 18/22 | iguais | sim |
| Base nas 8 vistas | 44 | 44 em todas | sim |
| Cores por vista; isolados por vista | 18–22; 92–148 | iguais | sim |
| W = espelho de E | não, 141 px | 141 px, mas **silhueta 1 px** | sim no número, **exagero na leitura** (§3) |
| S RD × entrada: silhueta / cor / dist > 8 | 2 / 530 / 133 | 2 / 530 / 133 | sim |
| E RD × E F2b: silhueta | 166 | 166 (707 px no total) | sim |

**O que o relatório não mede e eu medi [E]:**
- **Cinza neutro `#808080` fora da paleta F2b** (distância 44,7, a maior de todas) em **todas as 8 vistas** do rotate, 25 px no total (SE 8, NW 4, SW 4, NE 3). É o cinza do dente no E e da mancha cinza entre as pernas no SE. As outras 21 cores do rotate estão a ≤ 3,2 de uma cor do F2b.
- **Rotate × walk:** as duas saídas têm paletas próprias: **1 cor em comum** entre as 22 do rotate e as 17 do walk. Combinar os dois exige requantizar.
- **Walk q0 ≠ entrada E:** 97 px de silhueta e 646 px no total. O walk não começa da pose enviada (o “keep first frame” não vale aqui). Walk q0 × rotate E: 235 px de silhueta; cabeça 241 px: **o lateral do walk e o lateral do rotate são dois desenhos**.
- **SW ≠ espelho de SE** (355 px) e **NW ≠ espelho de NE** (205 px). Se valer a regra do espelho também nas diagonais, metade delas sai de graça e a outra metade precisa de limpeza.
- **Meio ciclo:** q_i × q_{i+4} difere 247–434 px (não é ciclo de 4 repetido) e o padrão de contato é **assimétrico**: apoio na linha 44 só em q0–q3 e q7; q4–q6 sem nenhum pé no chão (q5 e q6 sobem 2 px). Para comparar: C10 tem contato em 8/8; F2b fica 1 px acima em 4 quadros; F6 fica 1–3 px acima em 2.

## 3. Inspeção visual quadro a quadro (1×, 4×, 8×) e em movimento [E]

| Item | Status | Evidência e leitura |
|---|---|---|
| Canvas | **Funciona** | 48×48 em tudo, igual às rotações do F2b. O walk do F2b/F6/C10 é 60×60: **o walk RD não é drop-in** no pacote atual |
| Âncora (rotações) | **Funciona** | Base na linha 44 nas 8 vistas (F2b: 44, N 43). Melhor que o F2b e que o F6 (49/47) |
| Âncora (walk) | **Parcial** | Base 44 em 5 quadros, 43 em q4, 42 em q5–q6. Em movimento a 4× e a 1× o corpo “sobe” no meio do ciclo (`cap/run_*.png`) |
| Pernas e pés (walk) | **Parcial** | As pernas alternam, mas só há **uma** fase de apoio: q0–q3 com o pé de trás plantado; q4–q6 no ar; q7 aterrissa e, ao voltar para q0, o pé recua 4 px num quadro. Lê como passo mancado ou saltitado. Sem deslizar **só** a ~1 px/quadro (6,7 px/s a 150 ms): lento demais para o passo atual do jogo [H] |
| Cabeça (walk) | **Parcial** | Mesmo desenho do F2b E (olho, focinho, boca), mas avança 1 px depois do q0 e difere 19–50 px em 7/8 quadros. A 4× em movimento treme no contorno do focinho e no topo |
| Braços (walk) | **Falha** | q0–q3: mão escura com garra branca; q4–q7: o braço vira uma mancha creme no peito com 2–3 px brancos (`RD_walk_E_8x_q4-7.png`). Em movimento, o braço “aparece e some” |
| Cauda (walk) | **Funciona** | Horizontal, grossa na base, acompanha o passo |
| Rotate S | **Funciona** | Igual à entrada em forma; sombreado redesenhado com 22 cores em vez de 59. A 8×, o rosto, a boca e as garras brancas do F2b estão preservados (`S_entrada_x_RD_8x.png`) |
| Rotate E/W | **Parcial** | Lateral plausível de Agumon: focinho em cunha, boca aberta com dente, 1 olho, garras brancas. Mas a **cauda sobe** em curva fina (a ficha pede “para trás e para baixo”, grossa), o topo da cabeça tem uma ponta, e o dente é cinza `#808080`. W é o E espelhado **na forma** (1 px de silhueta); só a luz muda (141 px). Basta espelhar o E para cumprir a regra |
| Rotate N | **Parcial** | Duas a três pontas no topo da cabeça (leem mais como crista do que como as “orelhinhas” da ficha §6); linhas escuras em V no meio das costas (dobra de sombra que, a 4×, lê como marca); sem nuca escura; mancha marrom entre as pernas (≈ mancha da base da cauda, ficha §4) (`N_F2b_F6_RD_6x.png`) |
| Diagonais SE/SW | **Parcial** | Legíveis, com rosto, ¾ coerente. SE tem um **bloco cinza** entre as pernas (o `#808080`); SW sem esse bloco, mas não é espelho de SE |
| Diagonais NE/NW | **Parcial** | Leitura de ¾ de costas correta, mas o pé de trás e a cauda viram um **bloco marrom retangular** junto ao chão (parece bota ou caixa); NE com 2 pontas no topo da cabeça |
| Artefatos | **Funciona** | 0 semitransparentes, 0 px na borda, 1 componente em tudo |
| Leitura a 1× em movimento | **Funciona, com ressalva** | As 8 vistas leem como Agumon a 1×; o walk lê como bípede andando, mas o “pulinho” de q4–q6 aparece mesmo a 1× |

**Fidelidade à ficha (`FICHA_AGUMON.md` §9) [E, a 4×–8× e a 1×]:**

| # | Checklist | RD | Comentário do QA |
|---|---|---|---|
| 1 | Cabeça igual nas 4 direções | **sim** | S/N 18, E/W 22 (F2b 18/23); altura S/E/N 35/38/38, mais coerente que o F2b (35/41/39) |
| 2 | N: sem listras; nuca escura e mancha na base da cauda | **parcial** | Mancha na base da cauda: sim (marrom). Nuca escura: não. Linhas em V nas costas: risco de “marca” |
| 3 | S: barriga laranja clara, sem faixa | **sim** | Herdado da entrada |
| 4 | E/W: focinho em cunha, 1 olho, cauda curta e grossa | **parcial** | Focinho e olho certos; cauda erguida e fina no rotate (certa no walk) |
| 5 | Bípede, pés no chão, braços pendentes | **sim / parcial** | Rotações sim; walk com 3 quadros fora do chão |
| 6 | 3 garras brancas | **parcial** | Visíveis nas mãos e pés em S, SE, SW, E, W; somem ou viram mancha creme nos braços do walk q4–q7 |
| 7 | Sem acessório; cor única | **parcial** | Sem acessório; o bloco marrom em NE/NW e o cinza em SE leem como objeto estranho a 4× |
| — | Lista negativa: espinho / crista | **em risco** | Pontas no topo da cabeça em N, NE e E |

## 4. Notas nos 6 critérios (Comando 11 §5), só para o escopo entregue

**Régua:** a mesma do QA F6 (e F2, F4, C10): referência aprovada v13/v15 + `FICHA_AGUMON.md`, leitura a 1× e 4× em movimento. Paleta **fora** das notas de fidelidade, animação, consistência e legibilidade (G-1 aberto). GBA Plus nas duas réguas. 8 = pronto para integração de teste; GS-010 = média ≥ 9 e nenhuma categoria < 8.
**Escopo:** rotações em 8 direções + 1 walk E. A animação é julgada **só pelo walk E**; ataque, idle e emoção **não existem** aqui.

| Critério | Peso | Auto | **QA** | Justificativa |
|---|---:|---:|---:|---|
| Fidelidade ao Digimon | 25% | 6,5 | **6,5** | S preservado; walk mantém o rosto do F2b; lateral do rotate plausível. Desconta: pontas tipo crista em N/NE/E, cauda erguida e fina no E, linhas em V nas costas, bloco marrom/cinza nas diagonais |
| Qualidade visual GBA Plus | 20% | 6,5 | **6,0** | **Régua técnica: ~7.** 0 AA, contorno limpo, 17–22 cores, mas 8,7% de pixel isolado no walk e 15–24% nas rotações, e cinza `#808080` estranho. **Régua de identidade (v13/v15): ~6,5.** É o F2b requantizado, mesma família; mas rotate e walk saem com paletas próprias (1 cor em comum) e há blocos chapados em NE/NW/SE. **Style Bible (Endesga-32): não medido** (a entrada já não é Endesga), fora da nota |
| Qualidade da animação | 20% | 6,0 | **5,0** | Pernas alternam e a cauda acompanha; mas uma só fase de apoio (q4–q6 no ar, 3 quadros), pé sem deslizar só a ~1 px/quadro, cabeça diferente em 7/8, braço que some. Abaixo do F2b E, do C10 E (contato 8/8, cabeça 8/8) e do walk do F6 (~7,5) |
| Consistência anatômica | 15% | 5,5 | **6,0** | Bom entre as 8 vistas: base 44, altura 35–38, cabeça 18–22, W = E na silhueta. Desconta: lateral do rotate ≠ lateral do walk (cabeça 241 px), walk q0 ≠ entrada, paletas disjuntas, braço que muda de forma. Sobe 0,5 sobre a autoavaliação porque o “W ≠ espelho” é só luz |
| Legibilidade no jogo | 10% | 7,5 | **7,0** | Silhuetas claras a 1× nas 8 vistas; o “pulinho” do walk aparece a 1×. **NÃO VALIDADO no jogo** |
| Tempo e custo | 10% | 7,0 | **6,5** | Segundos por pedido e US$ 0 pagos [L]; preço de tabela baixo (US$ 0,10–0,14) [L]. Desconta: a cota grátis cobriu só 2 pedidos [L]; cada geração grátis vai para a **galeria pública** (risco de PI registrado); exige o perfil de navegador logado da conta; o walk precisa de polimento manual completo para virar asset (custo não medido) |
| **Média ponderada** | | **6,4** | **6,2** | 6,5×0,25 + 6,0×0,20 + 5,0×0,20 + 6,0×0,15 + 7,0×0,10 + 6,5×0,10 = **6,18** |

**Sem vitória por nota isolada:** nenhuma categoria chega a 8. Pela regra do ADR-012 (nenhuma < 8), fica fora por 6 categorias. O ponto forte do RD (8 vistas coerentes, base fixa) não é medido por um critério sozinho e não compensa o walk.

## 5. Comparação A, B, C, D, F6 × RD

As notas de A a F6 são **[L]** do meu `QA_F6_INDEPENDENTE.md` §4–§5 (com o mapeamento de 4 → 6 critérios lá descrito [H]). **Nenhuma das colunas tem o mesmo escopo:** A, B e F6 têm walk e ataque em 4 direções; C só idle/emoção em S e E; D só S; **RD só rotações em 8 direções + walk E**. Diferenças de 0,1–0,3 estão dentro da incerteza: **não é ranking firme**.

| Critério (peso) | A (v7) | B (F2b + C10) | C (rig 2D) | D (híbrido) | F6 (Blender) | **RD (F5 prática)** |
|---|---|---|---|---|---|---|
| Fidelidade (25) | 5,5 | 7,5 | 7,0 | 7,5 | 4,5 | **6,5** |
| GBA Plus (20) | 5,5 | 7,0 | 6,5 | 6,5 | 5,5 | **6,0** |
| Animação (20) | 5,5 | 7,5 | 6,5 | 7,0 | 7,0 | **5,0** (só walk E) |
| Consistência (15) | 5,5 | 7,5 | 7,5 | 7,0 | 8,5 | **6,0** |
| Legibilidade (10) | 6,5 | 7,5 | 6,5 | 8,0 | 5,5 | **7,0** |
| Tempo/custo (10) | 5,0 | 6,0 | 7,0 | 6,5 | 8,5 | **6,5** |
| **Média** | **5,55** | **7,25** | **6,83** (parcial) | **7,08** (só S) | **6,30** | **6,18** (parcial) |

**Medidas de limpeza do walk E, mesma régua [E]:**

| Walk E | Canvas | Cores | Isolados | Cabeça = q0 | Base (amplitude) | Contato na linha do chão |
|---|---|---:|---:|---:|---|---|
| F2b | 60 | 39 | 6,0% | 1/8 (0–15 px) | 49–50 (1) | 4/8 |
| C10 | 60 | 24 | 4,7% | 8/8 | 49 (0) | 8/8 |
| F6 | 60 | 12 | 0,5% | 8/8 | 46–49 (3) | 6/8 |
| **RD** | 48 | 17 | 8,7% | 1/8 (19–50 px) | 42–44 (2) | 5/8 |

**Leitura:**
- O RD **não supera o B** em nenhum critério. Fica perto do F6 na média, mas pelo motivo oposto: o F6 perde em fidelidade e ganha em animação; o RD preserva a cara do F2b e perde no movimento.
- O que o RD traz que **nenhum outro método trouxe**: **diagonais** (SE, SW, NE, NW) no estilo do F2b, com base e altura coerentes, a partir de um único S.
- O walk do RD é o pior walk E medido: o C10 (polimento manual do B) continua sendo a referência de caminhada lateral.

## 6. O rotate serve como rascunho para as diagonais?

**Sim, como rascunho para redesenhar, não como asset [E/H].**
- **A favor [E]:** SE/SW/NE/NW legíveis a 1× e a 4×; base 44 e altura 36–38 iguais às cardinais; cabeça 20–21 px (entre S 18 e E 22, coerente); cores a ≤ 3,2 da paleta F2b, exceto o cinza.
- **Limpeza necessária [E]:** remover o `#808080` (SE, NE, NW, SW); redesenhar o bloco marrom de pé/cauda em NE e NW; tirar as pontas do topo da cabeça (N, NE, E); requantizar para a paleta do pacote que for usado; decidir se SW/NW saem do espelho de SE/NE (hoje não são espelho: 355 e 205 px).
- **Custo da limpeza:** não medido [H, ~10–20 min por vista no padrão dos polimentos do C10].
- **Pré-requisito:** diagonais **não estão** no padrão de sprites. Entrar com elas é decisão do fundador (e toca G-2/escala e o critério unificado, **abertos**). Sem essa decisão, o rotate não tem uso imediato.
- As cardinais E/W/N do rotate **não** devem substituir as do F2b: o lateral é outro desenho (166 px de silhueta) e o N tem pontas tipo crista.

## 7. Vale gastar mais saldo em C (attack) e A (RD Core)?

- **C (attack / Pepper Breath): sim, com baixa prioridade e só com a cota grátis diária.** É o único experimento que responde à pergunta aberta do fogo (no F6, o fogo em S e N não funcionou [L]). Expectativa [H]: pelo que o walk mostrou (redesenho por quadro, cabeça instável), o corpo do ataque deve precisar de polimento; o valor está em ver **o efeito de fogo**. Critério de parada sugerido: se o fogo sair grudado no corpo (sem camada separada) e o corpo variar como no walk, encerrar o RD.
- **A (RD Core): não agora [H].** Gerar um Agumon novo do zero repete o problema de fidelidade de A (PixelLab puro, 5,5) e não ataca nenhuma lacuna atual (o estilo já existe no F2b). Só faria sentido para outra espécie, depois de decidir o padrão.
- **Condições, todas do fundador:** (a) clicar ou não no “Claim” diário; (b) aceitar que **cada geração grátis vai para a galeria pública** do serviço (risco de PI do fangame, ADR de PI); (c) qual perfil de navegador pode ser usado: o relatório registra o uso do perfil `chrome-sharp` e que a listagem de abas expôs títulos de outras abas do fundador [L]. Não sei se esse perfil estava autorizado para a tarefa; **registro para o game-studio conferir**, não é achado de qualidade.

## 8. Problemas encontrados

| ID | Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|---|
| F5p-1 | **P2** | Walk com uma só fase de apoio: q4–q6 sem pé na linha do chão (base 43/42/42); ao fechar o ciclo o pé recua 4 px num quadro. Lê como mancar/saltitar | `met.json` (`walk_RD.base`, `contato`); `feet_f5p.py`; `RD_walk_E_8x_q4-7.png`; `cap/run_*.png` | Não usar o walk RD. Se reaproveitado: refazer q4–q7 espelhando o apoio de q0–q3, com a base em 44 |
| F5p-2 | **P2** | Pé de apoio estável só a ~1 px/quadro; desliza 1 px/quadro a v = 2 e 2 px/quadro a v = 3 | `feet_f5p.py` (mundo) | Redesenhar o recuo do pé para a velocidade do jogo (o F6 dá o gabarito de 3 px/quadro [L]) |
| F5p-3 | **P2** | Cabeça do walk diferente do q0 em 7/8 quadros (19–50 px, dx +1) | `met.json` (`cabeca_q0`) | Colar a cabeça do q0 em todos os quadros (como o C10 fez) |
| F5p-4 | **P2** | Braço some nos q4–q7 (vira mancha creme com 2–3 px brancos) | `RD_walk_E_8x_q4-7.png` | Redesenho manual do braço com oposição às pernas |
| F5p-5 | **P3** (novo) | Cinza neutro `#808080` fora da paleta (dist 44,7) nas 8 vistas do rotate, 25 px; bloco cinza no SE | `met_f5p` (lista de cores); `RD_rot8_8x_a.png` | Recolorir para a sombra laranja/branco do F2b |
| F5p-6 | **P3** (novo) | Rotate e walk com paletas próprias (1 cor em comum de 22 + 17) | `met_f5p` | Requantizar tudo para uma paleta única do pacote |
| F5p-7 | **P3** | Pontas tipo crista no topo da cabeça em N, NE, E (lista negativa da ficha); linhas em V nas costas do N | `N_F2b_F6_RD_6x.png`, `RD_rot8_8x_*.png` | Arredondar o topo (orelhinhas, ficha §6); suavizar a dobra das costas |
| F5p-8 | **P3** | Bloco marrom retangular no pé/cauda de NE e NW | `RD_rot8_8x_a/b.png` | Redesenho do pé de trás e da cauda |
| F5p-9 | **P3** | Cauda do E/W do rotate erguida e fina (ficha: para trás e para baixo, grossa) | `E_F2b_x_RDrot_x_RDwalkq0_8x.png` | Usar a cauda do F2b E ou do walk RD |
| F5p-10 | **P3** (novo) | Walk q0 ≠ entrada (97 px de silhueta); lateral do walk ≠ lateral do rotate (cabeça 241 px) | `met.json` | Informativo: o RD redesenha a pose inicial; não há continuidade idle → walk |
| F5p-11 | **P3** | Canvas do walk 48×48 contra 60×60 do walk F2b/F6/C10 | `met.json` | Só registrar para o game-dev |
| F5p-12 | **P3** (apresentação) | GIFs de `comparacao/` tocam F2b e F6 a 150 ms (no pacote são 110 ms) | `gifinfo.py` | Gerar a comparação com o delay de cada fonte |
| F5p-13 | **P3** (correção de leitura) | “W não é o espelho de E” superestima o problema: a silhueta difere 1 px; só a luz muda | `RD_E_x_W_espelhado_8x.png`; `rot_W_espelho_E_silhueta` = 1 | Espelhar o E |
| F5p-14 | **P3** (processo) | Perfil `chrome-sharp` usado e títulos de abas do fundador listados [L] | `RELATORIO_F5_PRATICA.md` §5 | Conferência do game-studio sobre a autorização do perfil |

Nenhum P0 ou P1.

## 9. Recomendação

**Reservar. Não adotar, não integrar, não descartar.**
- **Walk:** não serve como asset nem como gabarito de movimento (o F6 é melhor gabarito; o C10 é melhor asset).
- **Rotate:** serve como **rascunho de diagonais**, com a limpeza do §6, **se** o fundador puser diagonais no escopo. As cardinais do rotate não substituem as do F2b.
- **Mais cota:** C sim (só cota grátis, só se o fundador aceitar a exposição pública), A não.

## 10. Não feito / NÃO VALIDADO

- Integração, âncora no mapa, velocidade real e desempenho: **NÃO VALIDADOS** (o jogo não foi aberto).
- Fundo de mapa real: **NÃO VALIDADO** (só verde #7fa65a e cinza #9a9a9a).
- GIFs entregues: conferi estrutura (tamanho, quadros, delays, loop), não decodifiquei os quadros; os PNG-fonte foram tocados na página própria.
- Paleta contra Endesga-32: **não medida** (G-1 aberto; a entrada já não é Endesga).
- Experimentos C e A: não existem; nada avaliado sobre ataque ou RD Core.
- Custo e cota do Retro Diffusion, galeria pública, termos de serviço: **[L]**, só do relatório; não acessei o serviço.
- Escala Tamer/Champion (G-2) e critério unificado: **abertos**, não resolvidos aqui.

## 11. Decisões do fundador

1. Diagonais entram ou não no padrão de sprites. Sem isso, o rotate não tem uso.
2. Usar o “Claim” diário para rodar **C**, aceitando que a geração vai para a galeria pública. O QA recomenda C antes de A, e A só depois de decidir o padrão.
3. Retirar ou não as duas imagens do Agumon já publicadas na galeria do serviço [L].
4. Confirmar qual perfil de navegador pode ser usado para o Retro Diffusion (F5p-14).
