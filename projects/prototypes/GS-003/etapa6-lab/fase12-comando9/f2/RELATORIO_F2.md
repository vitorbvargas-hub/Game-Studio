# Comando 9, F2: polimento gratuito (relatório)

**Digital Odyssey (GS-003) · game-art · 2026-11-14 · brief: `../BRIEF_F2_POLIMENTO.md`**

## Resumo

- **Custo PixelLab: 0 gerações.** Saldo antes 573,95 e depois 573,95 (`get_balance`). Só usei o `pixelart_workbench` (`score`, grátis) e scripts locais em Python.
- Nada foi gerado. Toda correção **reorganiza pixels do próprio sprite**: recolei peças de um quadro bom, troquei cores por cores que o sprite já tem, apaguei artefatos e alinhei. Nenhum pixel veio das folhas oficiais. Elas só guiaram o diagnóstico, junto com as fichas.
- Os pacotes originais (`fase9-pixellab-d12/pacote_*`) e o jogo não foram tocados: nenhum arquivo deles tem data de hoje.
- Escala, tamanho de canvas, número de quadros e formato dos pacotes não mudaram. As rotações (`rotations/`) são cópias idênticas.
- **Limitação de processo [E]:** as notas abaixo são autoavaliação de quem produziu, feita na mesma sessão. Pelo AGENTS.md §3, a avaliação válida tem de vir de outra sessão ou do `game-qa`.

## Entregas

| Arquivo | O que é |
|---|---|
| `pacote_agumon_f2/` | Agumon v7 corrigido (walk e attack S/E/N/W, rotations, `pacote.json` com o log `f2`) |
| `pacote_gomamon_f2/` | Gomamon v2 corrigido (walk e attack S/E/N/W) |
| `pacote_ikkakumon_f2/` | Ikkakumon v2 corrigido (walk S/E/N/W; o original não tem ataque) |
| `antes_depois_<especie>.gif` | 4×, ANTES em cima e DEPOIS embaixo; colunas: andar S/L/N/O + ataque S/L/N/O; 72 quadros (mmc 8×9), 110 ms |
| `antes_depois_<especie>.png` | 4×, todos os quadros, com a linha de antes e a de depois intercaladas por animação |
| `metricas/m_antes_*.json`, `m_depois_*.json` | Métricas por quadro: bbox, altura, linha do pé, pixels soltos, componentes extras |
| `scripts/` | Scripts que refazem tudo: `python3 scripts/fix_<especie>.py all` |

## O que foi corrigido

### Agumon v7 → `pacote_agumon_f2`

| # | Problema (contra a ficha e o brief) | Correção | Quadros |
|---|---|---|---|
| A1 | Andar S: **crista/espinho no topo da cabeça** nos q2–q7 (a ficha diz "sem crista"); olhos, boca e tamanho da cabeça mudavam a cada quadro | A cabeça do q0 (limpa) foi recolada em todos os quadros, no deslocamento medido pelo rosto (dy de −2 a +2) | 7 |
| A2 | Andar S: **pés marrons** (cor de "sapato") nos q4–q5 | Marrom trocado pelo laranja e pela sombra laranja do próprio corpo | 5 |
| A3 | Ataque N: **rosto e boca aberta desenhados nas costas da cabeça** (q3–q6) e o fogo descendo pelo corpo, quando deveria sair para cima; o q7 tinha a cabeça com "orelhas de urso" | Intermediário simples: costas do q2 (braços erguidos) + bola de fogo extraída do próprio q4, com borda vermelha do próprio Pepper Breath, subindo atrás da cabeça (q3→q5), faíscas no q6 e recuo de 1 px no disparo; q7 = costas do q2 | 5 |
| A4 | Ataque S: **chama solta acima da cabeça** (q3, q4, q5), sem relação com o disparo | Apagada (3 + 40 + 24 px); o contorno do topo da cabeça do q4 foi refeito com o do q6 | 3 |
| A5 | **Barriga creme/branca** (#fbe598 e afins) em L/O (a ficha diz "barriga laranja só um pouco mais clara; sem barriga branca") | Trocada pelo laranja claro do próprio sprite (#f6cb6a), 696 px | 36 |
| A6 | **Pé fora da linha**: andar S com pe_y 47–50, N 45–47, L/O 49–50 | Linha do pé única por direção (S 50, L/O 49, N 46) | 15 |
| A7 | Ruído de cor (pretos e laranjas quase iguais) | Cores a até 10 RGB umas das outras foram unificadas por animação (284 → 238 cores no pacote; invisível em 1×) | todos |
| A8 | O (oeste) | Gerado de novo como espelho exato do leste corrigido, igual ao original | 17 |

### Gomamon v2 → `pacote_gomamon_f2`

| # | Problema | Correção | Quadros |
|---|---|---|---|
| G1 | Andar S: **a crina cresce e encolhe**, o rosto sobe até 6 px dentro da cabeça e o olho muda | Cabeça, crina e orelhas do q0 recoladas em todos os quadros, seguindo o rosto | 7 |
| G2 | Andar S: **garras vermelhas/laranja** (a ficha diz "garras pretas, nunca vermelhas") e manchas brancas soltas ao lado do corpo (q5–q6) | Garras trocadas pela cor escura das próprias garras (#131c23); manchas soltas apagadas | 8 |
| G3 | Andar L/O: **gota ciano saindo da boca** (q1, q3), traço solto no topo da crina (q3) e orelha roxa trocando de forma (q2, q6, q7) | Cabeça do q0 recolada (seguindo o rosto); nenhum ciano restante | 7 (+7 em O) |
| G4 | Andar N: **costas lisas** (a ficha pede manchas roxas no dorso) | 3 manchas roxas 2×2 no dorso e nos flancos, nas cores das manchas do próprio sprite (#765b8c/#634f85), acompanhando o corpo | 8 |
| G5 | Ataque N: **a crina some** nos q3–q7 e encolhe nos q2 e q8 | Crina do q0 recolada no topo da cabeça (posição medida pela faixa roxa) | 7 |
| G6 | Ataque S: **q5–q7 deformados** (borrões pretos, corte ciano, explosão branca no corpo) | q5 = golpe do q4 + faísca de impacto do próprio q5; q6 = q3; q7 = q2 (volta limpa) | 3 |
| G7 | Pé fora da linha: andar S com pe_y 49–54, N 44–46 | Linha única (S 54, N 45, L/O 47 já estava) | 9 |
| G8 | Ruído de cor | Unificação a até 10 RGB (298 → 227 cores) | todos |

### Ikkakumon v2 → `pacote_ikkakumon_f2`

| # | Problema | Correção | Quadros |
|---|---|---|---|
| I1 | Andar L/O: **pontos vermelhos no dorso/anca** (garra vazando no meio do pelo) | Trocados pelo pelo branco vizinho (17 px) | 7 (+7 em O) |
| I2 | Pé fora da linha: S 61–62, L/O 61–63, N 59–61 | Linha única (S 62, L/O 61, N 61) | 7 |
| I3 | Ruído de cor | Unificação a até 10 RGB (151 → 148 cores) | todos |

Chifre, 2 presas, máscara escura, fitas brancas, garras vermelhas e traseira baixa: **presentes e estáveis em todos os quadros já no original** (conferido quadro a quadro). Nada a corrigir aí.

## Tempo gasto [E: hora do sistema e data dos arquivos de trabalho]

É tempo de parede do agente, com scripts. Não é o tempo de um artista humano à mão; esse eu não medi [H: à mão, em editor, seria uma ordem de grandeza maior].

| Etapa | Início–fim | Tempo |
|---|---|---|
| Leitura do brief, das fichas, da seleção da F1 e das folhas de contato do antes | 08:30–08:33 | ~3 min |
| Ferramentas (folha de contato, métricas, despejo de pixels, biblioteca) | 08:31–08:33 | junto com a anterior |
| Agumon A1–A8 (inclui 2 rodadas de revisão visual) | 08:33–08:36 | ~3 min (A1+A2 ~1 min; A3+A4 ~1,5 min; A5–A8 ~0,5 min) |
| Gomamon G1–G8 (inclui 1 retrabalho nas garras) | 08:36–08:38 | ~2,5 min |
| Ikkakumon I1–I3 (inclui 2 retrabalhos: o vermelho virava preto) | 08:38–08:43 | ~3 min |
| GIF/PNG antes-depois (inclui refazer os rótulos com a fonte 3×5), métricas, score | 08:39–08:44 | ~5 min |
| **Total** | 08:30–08:44 | **~14 min** |

## Medição antes × depois

### Métricas objetivas (scripts/metrics.py)

| Animação | Variação da altura, antes → depois (px) | Linhas de pé distintas, antes → depois |
|---|---|---|
| Agumon andar S | 4 → 3 | 4 → **1** |
| Agumon andar L/O | 3 → 3 | 2 → **1** |
| Agumon andar N | 1 → 1 | 3 → **1** |
| Agumon ataque S | 10 → 2 (efeito solto removido) | 2 → 2 (o fogo passa abaixo do pé) |
| Gomamon andar S | 5 → 3 | 5 → **1** |
| Gomamon andar L/O | 3 → 2 | 1 → 1 |
| Gomamon andar N | 1 → 1 | 3 → **1** |
| Ikkakumon andar S/L/N | 2/3/2 → 2/3/2 | 2/3/3 → **1/1/1** |

A altura do ataque N do Agumon passa a variar 11 px porque a bola de fogo encosta na cabeça e entra na medida. Não é instabilidade do corpo. O ataque N do Gomamon continua com o pé em 5 alturas (é um ataque com pulo, herdado do v1); não mexi.

### `pixelart_workbench score` (grade com todos os quadros; 0 gerações)

| Espécie | Antes | Depois | Cores |
|---|---|---|---|
| Agumon | 29,9 | **34,0** | 284 → 238 |
| Gomamon | 32,8 | **37,7** | 298 → 227 |
| Ikkakumon | 30,4 | 30,1 | 151 → 148 |

A nota do workbench é dominada pelo tamanho da paleta (−30) e por cores quase duplicadas (−20). Para subir de verdade, seria preciso reduzir a paleta de forma visível, o que o brief proíbe. A queda de 0,3 do Ikkakumon vem da troca dos pontos vermelhos por pelo (mais "singletons" na medida); visualmente, o sprite ficou mais limpo.

### Paleta (conflito aberto: medida contra os dois lados)

Pixels exatamente iguais a uma cor da Endesga-32 (Style Bible):

| Espécie | Antes | Depois | Até 6 RGB de distância (antes/depois) |
|---|---|---|---|
| Agumon | 0,0% | 0,0% | 0,5% / 0,5% |
| Gomamon | 1,9% | 1,8% | 2,3% / 2,2% |
| Ikkakumon | 0,0% | 0,0% | 0,0% / 0,0% |

Contra a referência v13/v15, a paleta continua a dos sprites PixelLab aprovados para teste. Nenhuma cor nova entrou: só cores que o sprite já tinha, e a unificação moveu cores no máximo 10 RGB. **O conflito Endesga-32 × v13/v15 continua aberto (Etapa 6); a F2 não o resolve.**

### Escala (G-2: registrada, não alterada)

| Sprite | Altura no andar (px) | Razão com o tile de 32 px |
|---|---|---|
| Agumon (Rookie) | 35–42 | ~1,2× |
| Gomamon (Rookie) | 35–42 | ~1,2× |
| Ikkakumon (Champion) | 47–53 | ~1,6× |

O Tamer não fez parte da F2.

## Notas 0–10 (autoavaliação, a validar por outra sessão)

| Espécie | Fidelidade | Estabilidade | Limpeza | Legibilidade | Média |
|---|---|---|---|---|---|
| Agumon, antes | 5,5 | 5,5 | 6 | 7 | **6,0** |
| Agumon, depois | 8 | 8 | 8 | 8 | **8,0** |
| Gomamon, antes | 5,5 | 5 | 5,5 | 7 | **5,8** |
| Gomamon, depois | 7 | 7,5 | 8 | 7,5 | **7,5** |
| Ikkakumon, antes | 7 | 7 | 7 | 8 | **7,3** |
| Ikkakumon, depois | 7 | 7,5 | 8 | 8 | **7,6** |

Justificativa curta:

- **Agumon** sobe mais porque os erros eram de peça e de forma (crista, rosto nas costas, pés marrons, barriga branca), e todos se resolvem com pixels do próprio sprite.
- **Gomamon** sobe, mas fica abaixo de 8, porque os ataques S e N são do v1, com outro corpo (cabeça, proporção e crina diferentes do andar v2). Isso não se corrige sem gerar de novo.
- **Ikkakumon** já era o mais estável; o ganho é de limpeza e de linha do pé. A fidelidade continua 7 por causa da cauda (abaixo).

## O que não deu para corrigir sem gerar de novo

1. **Gomamon, ataques S e N:** vêm do v1 (corpo, cabeça e pose diferentes do v2). Corrigi só a crina e os quadros deformados. Para combinar com o andar v2, é preciso um ataque novo do personagem v2.
2. **Gomamon, costas (andar N):** a silhueta em "X" (patas abertas, sem as traseiras curtas dobradas da ficha) é desenho, não acabamento. As manchas roxas atendem à ficha só em parte.
3. **Ikkakumon, cauda longa e afilada em L/O:** a ficha diz [H] "cauda escondida no pelo" e "sem rabo de peixe". Tirar a cauda exigiria redesenhar a traseira em 16 quadros, o que o brief proíbe. **Decisão do fundador/designer:** aceitar a cauda ou pedir novo andar.
4. **Ikkakumon:** não tem ataque (o pacote original não tem). Nada a polir.
5. **Agumon, costas (andar N):** já tem a nuca escura e a mancha na base da cauda que a ficha pede; o aspecto "liso" é da escala. A mancha da cauda muda de forma entre os quadros (ruído da geração). Estabilizar exigiria redesenhar a cauda quadro a quadro; ficou como está.
6. **Agumon, ataque S:** o fogo nasce no peito (brilho no q2–q3) e não na boca. É coerente como "carga", mas não é o Pepper Breath oficial saindo da boca. Corrigir exige redesenhar 3 quadros.
7. **Paleta:** a nota do workbench não passa de ~38 sem reduzir a paleta de forma visível (proibido aqui). Isso depende do conflito aberto da Etapa 6.
8. **Andar S do Agumon e do Gomamon:** com a cabeça travada, a expressão fica fixa no andar. É o desejado para a estabilidade, mas perde a microvariação que o modelo tinha.

## O que precisa do game-dev para integrar (não feito)

- Os pacotes `_f2` têm o mesmo formato, canvas, número de quadros e nomes dos originais. A troca é de caminho. **Não integrei**: o brief exige OK antes.
- A linha do pé mudou em até 4 px (Agumon S) e 5 px (Gomamon S) em alguns quadros. Se o jogo ancora o sprite pelo pé, conferir a âncora com os pacotes novos.
- O `pacote.json` de cada pacote ganhou a chave `f2` com o log das correções.

## Decisões que dependem do fundador

- Aprovar ou rejeitar o polimento como método (custo 0, ~14 min de agente para 3 espécies) e as notas depois da revisão independente.
- Cauda do Ikkakumon (item 3) e ataque do Gomamon v2 (item 1): aceitar ou gerar de novo (isso gasta gerações e precisa de brief).
- Os conflitos abertos (paleta, escala) continuam com a Etapa 6.

## F2b: correções pós-QA (2026-11-14, 08:57–09:05)

**Base:** `QA_F2_INDEPENDENTE.md` (F2-1 obrigatório; F2-2, F2-3 e F2-4 recomendados). **Custo PixelLab: 0** (nenhuma ferramenta PixelLab usada nesta rodada; só scripts locais). Os originais (`fase9-pixellab-d12/`) e o jogo não foram tocados: `find fase9-pixellab-d12 -newer QA_F2_INDEPENDENTE.md` devolve 0 arquivos. A versão F2 anterior foi guardada em `workspaces/game-art/tmp/f2_v1_backup/` só para medir o "antes desta correção".

### O que mudou

| QA | Correção | Onde no código |
|---|---|---|
| **F2-1 (P2)** | Agumon ataque N: a bola de fogo não sai mais pelo topo do canvas. Sem reescala: q3 = bola inteira (16×16, do próprio q4) nascendo atrás da cabeça, topo do contorno em y=5; q4 = disparo (corpo recua 1 px), topo em y=2; q5 = **miolo da própria bola** (recorte circular de 10 px, não reduzido) no alto, que lê como a bola se afastando de costas; q6 = faíscas em y ≥ 1. Nenhum pixel na linha y=0. | `fix_agumon.py`, passo 4 |
| **F2-2 / F2-3 (P3)** | Alinhamento do pé refeito para todas as espécies (`f2lib.align_feet`): (a) a referência passa a ser a **sola**, a linha mais baixa com ≥ 4 px opacos, e não o pixel mais baixo (pontas de garra de 1–3 px são ignoradas); (b) **trava de oscilação**: o deslocamento de cada quadro (−2 a +2 px, busca exaustiva) não pode deixar a amplitude do centróide vertical nem a do topo acima das do **pacote original**; (c) dentro da trava, o mínimo de linhas de sola distintas, depois o menor desvio, depois a menor oscilação. | `f2lib.py` (`sole_y`, `align_feet`); chamadas com `ref=ORIG[k]` nos três `fix_*.py` |
| **F2-4 (P3)** | Agumon andar L/O: a perna e o pé de trás em laranja-ferrugem (#cd6624 e vizinhas a ≤ 12 RGB) viram a sombra laranja do próprio sprite (#d88126), como no andar S. Só a perna de trás: componente ferrugem ligado às linhas y ≥ 43, limitado a y ≥ 41; a faixa de sombra sob a cauda fica como estava. 208 px em 8 quadros; O é o espelho do L. | `fix_agumon.py`, passo 5b |
| Medição | Novo `scripts/oscilacao.py` (centróide vertical como o `centroid.py` do QA, topo do bbox, sola e pixel mais baixo por quadro). Saída completa em `metricas/oscilacao_f2b.txt`. | — |

Pacotes, `antes_depois_*.gif/png` e `metricas/m_depois_*.json` foram regerados por `python3 scripts/fix_<especie>.py all`, `scripts/antes_depois.py` e `scripts/metrics.py`. O `pacote.json` de cada pacote traz o log com as novas entradas (`F2b`, dy por quadro).

### Oscilação do corpo no andar [E: `metricas/oscilacao_f2b.txt`]

Amplitude = máx − mín por animação, em px. "F2" é a entrega anterior; "F2b" é esta. O (oeste) = espelho de L, com os mesmos números.

| Animação | Centróide: orig → F2 → **F2b** | Topo: orig → F2 → **F2b** | Linhas de sola (≥ 4 px): orig → F2 → **F2b** |
|---|---|---|---|
| Agumon S | 4,2 → 2,3 → **2,0** | 5 → 3 → **3** | 47/48/50 → 49/50 → **49** |
| Agumon L/O | 1,6 → 2,4 → **1,6** | 2 → 3 → **2** | 48/49/50 → 48/49 → **49/50** |
| Agumon N | 2,0 → 0,8 → **0,8** | 1 → 1 → **1** | 45/46/47 → 46 → **46** |
| Gomamon S | 6,5 → 3,6 → **2,6** | 8 → 3 → **3** | 48–54 (6 linhas) → 53/54 → **50/52** |
| Gomamon L/O | 1,8 → 1,9 → **1,4** | 3 → 2 → **2** | 47 → 47 → **46/47** |
| Gomamon N | 2,0 → 0,7 → **0,7** | 2 → 1 → **1** | 44/45/46 → 45 → **45** |
| Ikkakumon S | 1,8 → 1,8 → **0,9** | 2 → 2 → **2** | 60/61/62 → 61/62 → **61/62** |
| Ikkakumon L/O | 1,5 → 2,0 → **1,0** | 1 → 3 → **1** | 60/61/62 → 60/61 → **61/62/63** |
| Ikkakumon N | 2,8 → 1,0 → **1,0** | 2 → 2 → **2** | 59/60/61 → 61 → **61** |

- **Em todas as animações, a oscilação da F2b é igual ou menor que a do original**, no centróide e no topo. As duas regressões apontadas pelo QA voltaram: Agumon L/O de 2,4 para 1,6 px (o original é 1,6), e Ikkakumon L/O de 2,0 para 1,0 px.
- **Ponta do chifre do Ikkakumon L/O:** varia entre y=12 e 13 (1 px), contra 9–12 (3 px) na F2 e 11–12 (1 px) no original. Os q6–q7 não sobem mais.
- **Custo da trava:** algumas animações ficaram com 2 linhas de sola, separadas por 1 ou 2 px, em vez de 1 (Agumon L/O, Gomamon S e L/O, Ikkakumon S). O Ikkakumon L/O ficou com 3, o mesmo número do original. Nesses casos, pôr todas as solas numa linha só deixaria o corpo oscilando mais que no original; entre as duas exigências, prevaleceu a do QA (corpo estável). No Gomamon S, a faixa de busca de ±2 px não alcança uma linha única: o original tem as solas espalhadas por 6 px.
- **Agumon ataque N:** o topo do bbox nos q3–q6 agora é 4/1/1/1 (antes 0/0/0/0). A linha y=0 tem 0 px opacos em todos os quadros. Nenhum quadro, de nenhum pacote, toca a borda de cima ou de baixo do canvas.

### Integridade [E]

| Item | Resultado |
|---|---|
| Arquivos, quadros e canvas | Iguais aos originais nos três pacotes |
| Cores | Agumon 284 → 238, Gomamon 298 → 227, Ikkakumon 151 → 148. **0 cores novas** em relação ao original: a sombra #d88126 já existia no andar L do Agumon |
| Pixels semitransparentes | 0 |
| O = espelho de L | Sim (andar e ataque) |
| Rotações | Pixels idênticos aos originais |
| Escala | Não mudou. Nada foi reescalado: a bola menor do q5 é um recorte da própria bola |

### Para o game-dev (âncora)

A linha da sola mudou de novo em relação à F2: Agumon S 49 (era 50 pelo pixel mais baixo), Gomamon S 50–52 (era 54), Ikkakumon L/O 61–63 (era 61). Se o jogo ancora pelo pé, use a sola mais frequente de cada animação (ver `metricas/oscilacao_f2b.txt`) ou o centro do quadro. Pela trava, a âncora fixa no canvas mantém o corpo mais estável que o original.

### O que não foi feito / limites

- **F2-5** (corpo parado no ataque N do Agumon) continua igual: o corpo dos q3–q7 é o do q2. Melhorar isso exige quadro novo, com custo. No q3 a bola continua atrás da cabeça e ainda pode ser lida como chama na cabeça [H]; ela agora aparece mais baixa que antes, por causa da trava de canvas.
- **F2-6 e F2-7** (herdados) não foram tocados.
- As notas da autoavaliação **não** foram refeitas. Esta correção precisa de nova checagem do `game-qa`, de preferência com os GIFs vistos em movimento.
- Os GIFs foram regerados, mas eu também não os vi em movimento; conferi as folhas PNG em 4× e zooms de 6 a 10× dos quadros alterados (ataque N e andar L do Agumon) e a folha do Ikkakumon.
