# Relatório · C14 F8B Hawkmon · Etapa 2a (ajustes gratuitos + rotações S/N/E/W)

**Data:** 2026-11-15 · **Produção:** game-art (Fable 5.2) · **Brief:** `etapa6-lab/BRIEF_COMANDO_14_F8B_HAWKMON_ETAPA2A.md`
**Estado:** parado depois das rotações. Nada de walk, idle, montagem final nem integração. Esta entrega **não** foi avaliada por sessão independente: falta o game-qa.

## 1. Resumo
- Base v3 feita à mão (0 gerações): tufos nas laterais na altura da faixa, cantos de cima arredondados, pontas das asas 1 px mais curtas.
- 1 chamada ao PixelLab (`create_character` v3 + referência, 4 direções, 48×48): **1 geração**.
- N e E foram redesenhados à mão em P1 sobre a saída crua; W é o espelho de E; S é a base v3, sem mudança.
- **O que não bateu:** a massa de E/W ficou em 0,78 do Agumon S (alvo 0,80–0,90). Ver §5.

## 2. Orçamento [E]
| Momento | Saldo |
|---|---|
| Antes de tudo (02:34) | 563,95 |
| Antes da chamada | 563,95 |
| Depois da chamada | 562,95 |
| Final | **562,95** |

- Gerações gastas: **1** de 6. Piso de 552 respeitado, com 10,95 de folga.
- Preço conferido antes em `search_help(tool="create_character")`: v3 com referência = ceil(w·h·8/65536), mínimo 1.
- Personagem na conta: `cdca6904-006a-4c86-9530-1044e16a31e9` ("Hawkmon F8B base v3 (C14 E2a)"). Não havia Hawkmon na conta antes (`list_characters search=hawkmon` vazio).
- Não usei Retro Diffusion nem nenhuma outra ferramenta paga.

## 3. Base v3 (`base_v3/`)
Fonte: `scripts/base_v3.py` (importa o topete e a paleta da Etapa 1; não altera `base_v2.py` nem `base_polida_v2/`, cujo `sha256_v2.txt` segue 15/15 OK).

| Medida | v2 | **v3** | Alvo |
|---|---|---|---|
| Altura × largura | 38 × 20 | **38 × 20** | 38 px |
| Área ÷ Agumon F7v2 S (582) | 484 = 0,832 | **492 = 0,845** | 0,80–0,90 |
| Cores | 24, todas P1 | **24, todas P1, nenhuma sem uso** | P1 |
| Pixels isolados (`reqa_v2.py`) | 103 | 103 | — |
| Tufos | linhas 8–9, no topo | **linhas 11–13, laterais, 2 px de branco para fora** | 11–13 |
| Vão perna × ponta da asa | linha 31: 0 px; 32: 1 px | **linha 31: 1 px; a partir da 32: livre** | separar |

- Preservado: topete separado (idêntico), fivela, V vermelho, olho 3×3, bico com ponta escura, gola de 5 pontas, 3 penas escuras por asa (terminam nas linhas 29, 30 e 31).
- Conferência da silhueta [H]: em `base_v3/silhuetas_v2_v3_cand00_agumon_4x.png` as duas pontas no topo sumiram; a cabeça virou um bloco de cantos cortados com uma ponta horizontal de cada lado, na altura da faixa. Leio como "penas laterais", não como "orelhas". Quem confirma é o QA.
- Saída do script do QA: `base_v3/reqa_v2_saida_v3.txt`.

## 4. Rotações
### 4.1 Cruas (`rotacoes_cruas/`)
- `south/east/north/west.png`, 48×48, mais o ZIP original em `_zip/` e o `metadata.json`.
- Baixadas pelo ZIP de `api.pixellab.ai`: o link direto do Backblaze dá 403 pelo proxy deste ambiente.
- S voltou idêntica à referência em pixels (0 diferentes). N veio com 29 cores (16 fora da P1), E/W com 35 (17 fora).

### 4.2 Polidas (`rotacoes_polidas/`)
Fonte: `scripts/polir.py` (grades de texto, editáveis). Por direção: `<D>_corpo.png`, `<D>_topete.png`, `<D>_composto.png`, as três em 4×, e `<D>_grade.txt`. Canvas 48×48, pés na linha 42, topete nas linhas 5–12 e corpo nas 13–42, sem sobreposição entre as camadas. Métricas em `metricas_rotacoes.json`.

| Dir. | L × A | Área | Cores (fora da P1) | Isolados | ÷ Agumon S (582) | ÷ Agumon na mesma direção | Pixels mudados sobre o cru |
|---|---|---|---|---|---|---|---|
| S | 20 × 38 | 492 | 24 (0) | 103 | **0,845** | 0,845 (582) | 0 |
| N | 20 × 38 | 494 | 19 (0) | 65 | **0,849** | 0,782 (632) | 205 |
| E | 23 × 38 | 454 | 22 (0) | 60 | **0,780** | 0,713 (637) | 293 |
| W | 23 × 38 | 454 | 22 (0) | 60 | **0,780** | 0,713 (637) | 294 |

O que mudei à mão:
- **N:** refeita na mesma meia grade espelhada da S. Sem rosto; faixa dando a volta; tufos iguais aos da S; as 3 pontas escuras por asa (o cru tinha só 1 traço cinza de cada lado); cauda curta no centro.
- **E:** paleta forçada; topete de volta ao desenho estreito da base, inclinado 1 px para trás (o cru trouxe uma pena larga de 6 px); tufo saindo 3 px para trás da nuca, nas linhas 16–18 (no cru ele ficava dentro do contorno); olho 3×3 logo abaixo da pálpebra; bico com a ponta descendo (gancho); corpo 1 px mais fundo; segunda perna, mais escura, atrás da primeira (o cru mostrava uma só).
- **W:** espelho exato de E. A base é simétrica, então não há detalhe que troque de lado.

### 4.3 Pontos de vigilância do QA [H, autoavaliação]
| Ponto | S | N | E/W |
|---|---|---|---|
| Tufos para trás, na altura da faixa | ✔ laterais | ✔ laterais | ✔ atrás da nuca |
| Olho não some | ✔ | não se aplica | ✔ 3×3, com azul e brilho |
| Fivela não vira óculos | ✔ | não se aplica | ✔ 1 coluna clara na frente da faixa |
| Gancho do bico | sugerido | não se aplica | ✔ ponta desce 1 px |
| Costas sem rosto, 3 pontas escuras | — | ✔ | — |
| Massa 0,80–0,90 | ✔ | ✔ contra o Agumon S; 0,78 contra o Agumon N | ✘ 0,78 / 0,71 |

## 5. Problemas e limitações
1. **Massa de E/W abaixo do alvo.** 454 px = 0,78 do Agumon S e 0,71 do Agumon E. O cru tinha 433; cheguei a 454 aprofundando o corpo 1 px e somando a segunda perna. Não inflei mais porque uma ave de perfil é mais estreita que de frente, e o Agumon E ganha massa com a cauda. Subir até 0,80 pede mais uns 12 px (pena do topete mais larga ou leque da asa mais longo), e isso mexe no desenho.
2. **O brief não diz contra qual Agumon se mede "em cada direção".** Contra o S (582), S e N passam. Contra a mesma direção, N cai para 0,78, porque o Agumon N tem 632 px. Reportei as duas colunas.
3. **Asa em E/W lê como leque para trás.** As 3 pontas existem (a de trás e as 2 que descem), mas a 1× a asa parece um triângulo cinza, quase uma cauda. Veio assim do PixelLab e mantive.
4. **Perna de trás em E/W** é só uma haste escura de 1 px, sem pé próprio. Serve para a pose parada; o walk vai precisar de um pé para ela.
5. **Cauda na N** é um toco de 4 px entre as pernas. Lê pouco a 1×.
6. **Densidade:** N usa 19 cores e é quase chapada no branco da nuca, o mesmo ponto fraco que o QA apontou na S.
7. **Escala (G-2, aberto):** Tamer A 41 px, Hawkmon 38 px (corpo 30 + topete 8), Agumon F7v2 S 35 px, tile 32. Razão para o tile: 1,28 / 1,19 / 1,09. Não decidi nada sobre escala.
8. **Paleta (conflito aberto):** tudo em P1; nenhuma cor é Endesga-32 exata, como na Etapa 1. Não é declaração de conformidade com nenhum dos dois lados.
9. **Tamer na prancha:** usei só o Tamer A de frente (`tamer_a_cabelo_preto` tem apenas `south.png`).
10. Os horários do `PROGRESS.md` são estimativas da sessão; o relógio do sistema marcou 02:34 no início e 02:41 perto do fim.

## 6. Pranchas (`prancha/`)
- `prancha_4direcoes_hawkmon_agumon_tamer_1x.png` e `_4x.png`: Hawkmon S/N/E/W em cima, Agumon F7v2 S/N/E/W embaixo, Tamer à esquerda, chão em tiles de 32.
- `cru_x_polido_SNEW_1x.png` e `_4x.png`: PixelLab em cima, polido embaixo.
- `camadas_corpo_topete_composto_SNEW_4x.png`.
- `silhuetas_hawkmon_agumon_SNEW_4x.png`.

## 7. Não foi feito
- Walk, idle, ataque, montagem final e integração ao jogo.
- QA independente desta etapa.
- Direções diagonais.

## 8. Decisões que dependem do fundador / QA
- Aceitar E/W com massa 0,78 ou pedir o ajuste do item 5.1.
- Qual Agumon é a régua de massa por direção (item 5.2).
- Topete estreito em E/W (como na base) ou pena larga como o PixelLab propôs.
- Aprovar as rotações antes de liberar walk e idle.

## 9. Como refazer
Dentro de `scripts/`: `python3 base_v3.py && python3 polir.py && python3 prancha.py`, depois refazer o `sha256.txt`. `quant.py <direção>` imprime a grade crua já forçada para P1.

## Crédito e licença
Hawkmon é espécie oficial de Digimon (fangame não oficial, sem licença). Referências de forma: sprites oficiais de DS (Etapa 1). Sprites desta pasta: adaptação feita pelo estúdio com PixelLab + edição manual. Camada: `private-prototype`. Não homologado.

---

# Correções E2a-b (2026-11-15)

Resposta ao `QA_ETAPA2A_INDEPENDENTE.md` (nota de conjunto 7,75; meta ≥ 8). Tudo feito **à mão nas grades, 0 gerações, sem PixelLab**. A v1 (`rotacoes_polidas/`, `prancha/`, `scripts/polir.py`, `sha256.txt`) **não foi alterada**.

- Script: `scripts/polir_v2.py` (importa a v1 e troca só as linhas corrigidas).
- Sprites: `rotacoes_polidas_v2/` (corpo, topete e composto por direção, 1× e 4×, grades e `metricas_rotacoes_v2.json`).
- Pranchas: `prancha_v2/`.
- Hashes dos arquivos novos e deste relatório: `sha256_e2ab.txt`. O `sha256.txt` original continua conferindo inteiro para a v1 (ele não lista este relatório nem o `PROGRESS.md`).

## A. O que mudou, por item do QA

| # | Item | Feito | Como |
|---|---|---|---|
| 1 | E/W: asa recolhida + cauda vermelha (obrigatório) | ✔ | Saiu o bloco cinza de 5–6 px para trás. A asa agora cobre o flanco e as 3 pontas escuras descem para baixo e para trás, até a altura do quadril (linhas 34–37 do canvas). Entrou uma cauda vermelha curta, de 4 px mais contorno, com 2 pontas, saindo atrás nas linhas 30–34, acima das pontas da asa. |
| 2 | N: leque de 3 pontas (obrigatório) | ✔, com ressalva (§C.1) | O toco `qrrq` virou um leque de 10 px de largura: pena central de 4 px, a mais longa (até a linha 39), e duas laterais abertas para fora (até a linha 37), passando por cima do alto das pernas. |
| 3 | E/W: pé de trás (recomendado) | ✔ | Pé `o/n` com garra `c`, 3 px, 1 linha acima e à frente do pé de perto. A perna de trás agora termina em pé. |
| 4 | N: nuca (recomendado) | ✔ | `w` nas duas linhas de baixo da cabeça, marcas `w`/`v` de penas e sombra do pescoço mais larga. A barra das costas virou um zigue-zague `q/k` (penas sobrepostas), com as costas escurecendo até ela. |
| 5 | E/W: bico (opcional) | ✔ | Ponta 1 px à frente (largura total de 23 para 24 px); o gancho desce na última coluna. |

Mantido: topete estreito e idêntico à v1 nas 4 direções (`topete_igual_v1: true`), topete em camada separada com sobreposição 0, paleta P1, W = espelho de E (0 px diferentes), S intocada (0 px diferentes da v1), linha dos pés 42 e cabeça nas linhas 13–24.

## B. Métricas (`metricas_rotacoes_v2.json`)

| Dir. | L × A | Área v1 → v2 | ÷ Agumon S (582) | ÷ própria S (492) | ÷ Agumon na mesma direção | Cores | Fora da P1 | Semitransp. | Topete × corpo | Px mudados contra a v1 |
|---|---|---|---|---|---|---|---|---|---|---|
| S | 20 × 38 | 492 → 492 | 0,845 | 1,000 | 0,845 (582) | 24 | 0 | 0 | 0 | 0 |
| N | 20 × 38 | 494 → 500 | 0,859 | 1,016 | 0,791 (632) | 19 | 0 | 0 | 0 | 80 |
| E | 24 × 38 | 454 → 466 | **0,801** | 0,947 | 0,732 (637) | 23 | 0 | 0 | 0 | 54 |
| W | 24 × 38 | 454 → 466 | **0,801** | 0,947 | 0,732 (637) | 23 | 0 | 0 | 0 | 54 |

- E/W chegou a 0,80 do Agumon S só com a cauda, o pé de trás e o bico. O corpo não foi inflado, como o QA pediu.
- Máscara da N contra a máscara da S: 16 px diferentes (eram 6). A silhueta de costas continua parecida com a de frente (§C.1).
- Escala (G-2, aberto, nada decidido): Tamer A 41 px, Hawkmon 38 px (corpo 30 + topete 8), Agumon F7v2 S 35 px, tile 32.
- Paleta (conflito aberto): tudo em P1, nenhuma cor Endesga-32 exata. Não é declaração de conformidade com nenhum dos dois lados.

## C. Limitações que ficaram

1. **N: o leque lê por dentro, mas pouco na silhueta.** Com cor, a 4×, a pena central longa e as duas laterais aparecem. Na silhueta preta só a ponta central se destaca (entre os pés); as laterais ficam coladas ao alto das pernas. A 1× o conjunto lê como "saia vermelha com ponta no meio". Para as 3 pontas aparecerem na silhueta seria preciso abrir o leque para fora da linha das pernas, e aí ele encosta nas pontas das asas e fecha o vão asa/perna que o QA elogiou na S. Deixei o vão.
2. **N continua com 19 cores.** A nuca não está mais chapada, mas a direção segue menos densa que a S (24).
3. **E/W: as 3 pontas escuras da asa ficaram pequenas.** Estão lá (`kGkGkGGk` e a ponta `h` abaixo), mas a 1× lêem como uma sombra cinza sob o flanco, não como 3 penas separadas.
4. **N: pés 1 px mais curtos por dentro** que na S, para a ponta central da cauda ficar livre. É uma diferença pequena entre S e N que a walk precisa respeitar.
5. Tentei marcas de penas no meio das costas da N e tirei: dois pontos e um traço simétricos liam como um rosto. Ficou só a barra em zigue-zague.

## D. Pranchas (`prancha_v2/`)
- `prancha_v2_4direcoes_hawkmon_agumon_tamer_1x.png` e `_4x.png`: Hawkmon v2 S/N/E/W em cima, Agumon F7v2 embaixo, Tamer à esquerda, chão em tiles de 32.
- `silhuetas_v2_hawkmon_agumon_SNEW_4x.png`: silhuetas v2 contra o Agumon.
- `v1_x_v2_SNEW_1x.png` e `_4x.png`, `silhuetas_v1_x_v2_SNEW_4x.png`: v1 em cima, v2 embaixo.
- `camadas_v2_corpo_topete_composto_SNEW_4x.png`.

## E. Não foi feito
- Walk, idle, ataque, integração. Nenhuma geração; a conta PixelLab não foi consultada nesta rodada (saldo anotado na Etapa 2a: 562,95).
- Avaliação independente da v2: esta sessão produziu, então não dá nota. Falta a conferência do `game-qa` (silhueta 4× e prancha 1×).
- Segunda régua (v13/v15 e referências do fundador): não medida aqui.

## F. Decisões que dependem do fundador / QA
- As quatro do §9 do QA continuam abertas (régua de massa por direção, aceitar E/W em 0,80, topete, liberar walk e idle).
- N: aceitar o leque como está (lê com cor, pouco na silhueta) ou abrir as pontas laterais para fora, perdendo o vão asa/perna.

## G. Como refazer
Em `scripts/`: `python3 polir_v2.py`. Depois, na pasta da etapa: `sha256sum rotacoes_polidas_v2/* prancha_v2/* scripts/polir_v2.py RELATORIO_ETAPA2A.md > sha256_e2ab.txt`.
