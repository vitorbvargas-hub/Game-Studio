# QA independente da F2 (polimento de sprites)

**Digital Odyssey (GS-003) · game-qa · 2026-11-14 · custo PixelLab: 0 (nenhuma ferramenta PixelLab usada)**
**Objeto:** `f2/RELATORIO_F2.md` (game-art, autoavaliação) e os pacotes `f2/pacote_{agumon,gomamon,ikkakumon}_f2/`, comparados com `fase9-pixellab-d12/pacote_{agumon_v7,gomamon_v2,ikkakumon_v2}/` e com `fase11-fichas-anatomia/FICHA_*.md`.

Legenda: **[E]** executado nesta auditoria · **[L]** dado do relatório do game-art, não reverificado · **[H]** hipótese · **NÃO VALIDADO** com motivo.

## 0. Build e método

- **Material testado [E]:** arquivos em disco em 2026-11-14 ~08:50. Os pacotes `fase9-*` e `f2/*` **não estão no git** (`git status`: `?? fase9-pixellab-d12/`), por isso não há commit nem hash de referência. Último commit do repositório: `f02fbab`.
- **Originais intocados [E, parcial]:** `pacote_agumon_v7/walk/S/frame_000.png` tem data 07:16; o brief F2 é de 08:30 e os arquivos da F2 são de 08:38–08:45. Nenhum arquivo dos três pacotes originais é mais novo que o brief (`find -newer`). Como os originais não estão versionados, não há hash anterior para comparar: a prova é só a data.
- **Scripts do QA (fora do jogo e da entrega, reexecutáveis):** `workspaces/game-qa/tools/qa_f2/`
  - `compare.py`: canvas, arquivos, pixels alterados, bbox, componentes e cores novas por quadro. Saída em `out/compare.json`.
  - `metrics2.py`: cores por pacote, linha do pé, topo, altura e espelho O = flip(L). Saída em `out/metrics2.txt`.
  - `centroid.py`: centróide vertical por quadro, que mede o sobe-e-desce do corpo no andar. Saída em `out/centroid.txt`.
  - `sheets.py`, `zoom.py`: folhas original / F2 / diff (magenta = pixel alterado) em 4× e zooms de 6 a 12×, em `workspaces/game-qa/tmp_view/qa_f2/`.
  - Leitor PNG: cópia do `pxpng.py` do game-art; o ambiente não tem PIL.
- **Inspeção visual [E]:** todas as 20 animações, quadro a quadro, nas folhas 4× com diff. Os quadros alterados de cada correção foram vistos em zoom de 6 a 12×. Também vi a folha entregue `antes_depois_ikkakumon.png`. **NÃO VALIDADO:** os GIFs não foram vistos em movimento; o visualizador mostra só o quadro estático. Confirmei apenas que existem: 1456×464, 73 blocos de quadro.

## 1. Cada correção aconteceu? Criou defeito novo?

| # | Correção declarada | Aconteceu? | Defeito novo / observação |
|---|---|---|---|
| A1 | Agumon andar S: cabeça do q0 recolada, sem crista | **Sim [E]**. Crista ausente nos 8 quadros; olhos, boca e cabeça constantes. | Nenhuma costura visível a 8×. Topo da cabeça 13–16 (antes 9–14, por causa da crista). |
| A2 | Agumon andar S: pés marrons → laranja | **Sim [E]** (q4–q5). | **Parcial:** no andar L/O (q0–q2), o pé de trás continua num laranja-ferrugem escuro (sombra do membro distante) que a 8× ainda lê como "sapato". Já existia no original. P3, abaixo. |
| A3 | Agumon ataque N: sem rosto nas costas, bola de fogo subindo | **Sim [E]**. Não há mais rosto nem "orelhas de urso"; q3/q5/q6/q7 são idênticos ao q2 no corpo (0 px de diferença abaixo de y=12), e o q4 tem recuo de 1 px. | **NOVO DEFEITO P2:** a bola de fogo **encosta e é cortada na borda superior do canvas** (linha y=0 com 1/13/9/2 px opacos nos q3/q4/q5/q6; topo do bbox = 0). A 8×, no q4 o topo da bola é uma reta. Além disso, no q3 o fogo fica atrás da cabeça e pode ser lido como crista ou chapéu de fogo [H]. O corpo totalmente parado deixa o ataque pouco legível (só a bola se mexe). |
| A4 | Agumon ataque S: chama solta acima da cabeça apagada | **Sim [E]**. A altura do ataque cai de 33–46 para 33–35; o contorno do topo da cabeça no q4 está fechado. | Nenhum. O fogo continua nascendo no peito (o relatório admite: não é a boca). |
| A5 | Barriga creme → laranja claro | **Sim [E]**. Barriga laranja clara em L/O e no ataque L/O. | Nenhum. |
| A6 | Linha do pé única | **Sim [E]**: S 50, L/O 49, N 46, um valor por animação. | **Regressão pequena P3:** no andar L/O, o sobe-e-desce do corpo **aumentou** (amplitude do centróide 1,6 → 2,4 px; salto q1→q2 de 2,1 px). Os q0, q1, q3 e q7 subiram 1 px inteiro. |
| A7 | Unificação de cores ≤ 10 RGB | **Sim [E]**: 284 → 238 cores nas animações (o número do relatório confere). Nenhuma cor nova. | Invisível a 1× e a 4×. |
| A8 | O = espelho de L | **Sim [E]**: 0 px de diferença entre O e flip(L), no andar e no ataque. | — |
| G1 | Gomamon andar S: cabeça, crina e orelhas do q0 recoladas | **Sim [E]**. Crina e rosto estáveis; a amplitude do centróide cai de 6,5 para 3,6 px e a altura varia 3 em vez de 5. | Nenhuma costura visível a 7×. |
| G2 | Garras vermelhas → escuras; manchas brancas soltas | **Sim [E]**. Não resta vermelho nas garras; os traços brancos ao lado do corpo (q5–q6) sumiram. | Nenhum. |
| G3 | Andar L/O: gota ciano, traço na crina, orelha | **Sim [E]**. Sem ciano; crina sem espeto solto; orelha estável. | Nenhum. |
| G4 | Andar N: manchas roxas no dorso | **Sim, mas fraco [E]**. Há manchas pequenas ao longo do dorso e dos flancos, que a 1× quase não se veem. | Atende à ficha só em parte, como o próprio relatório diz. |
| G5 | Ataque N: crina recolada | **Sim [E]**. A crina aparece nos 9 quadros, assentada. | O pé continua com 5 alturas (pulo herdado; o relatório admite). |
| G6 | Ataque S q5–q7 deformados → intermediários | **Sim [E]**. q6 = q3 e q7 = q2 (0 px de diferença); q5 = q4 + 14 px de faísca. Sem borrão preto, ciano ou explosão branca. | A faísca do q5 é um traço branco de ~6 px, mal legível. O golpe vira um vaivém (q4→q5→q3→q2). Aceitável como intermediário simples. |
| G7 | Linha do pé | **Sim [E]**: S 54, N 45, L/O 47, um valor por animação. | Andar N: amplitude do centróide de 2,0 para 0,7 px. |
| G8 | Unificação de cores | **Sim [E]**: 298 → 227 (confere). Nenhuma cor nova. | — |
| I1 | Ikkakumon L/O: pontos vermelhos no dorso | **Sim [E]**. O vermelho fora das patas sumiu; as garras vermelhas foram mantidas nas 4 patas. | Nenhum. |
| I2 | Linha do pé | **Sim [E]**: S 62, L/O 61, N 61, um valor por animação. | **Regressão P3:** no L/O, os q6 e q7 tinham o pixel mais baixo em **1 a 2 px isolados** (ponta de garra em y=63). Alinhar por esse pixel subiu o corpo inteiro 2 px: a ponta do chifre passa a oscilar 3 px (9–12) em vez de 1 px (11–12), e o centróide de 1,5 para 2,0 px. No N melhorou (2,8 para 1,0 px). |
| I3 | Unificação de cores | **Sim [E]**: 151 → 148 (confere). | — |

**Outras afirmações do relatório conferidas [E]:**
- As rotações têm os pixels idênticos aos originais (0 px de diferença). Em bytes, 10 de 12 arquivos diferem, porque foram regravados. Sem efeito visual.
- Os números de altura e de linha do pé da tabela "antes × depois" conferem com a minha medição: Agumon S altura 37–41 → 35–38; Gomamon S 39–44 → 39–42.
- **[L]** As notas do `pixelart_workbench score` não foram refeitas.
- **[L]** O saldo PixelLab não foi conferido; não usei ferramentas PixelLab.
- **[L]** O tempo de ~14 min bate com as datas dos arquivos (08:38–08:45) [E parcial].

## 2. Escala, quadros, canvas e paleta

| Item | Resultado [E] |
|---|---|
| Arquivos | Mesmo conjunto: 72 / 72 / 36 PNGs. Nenhum arquivo a mais nem a menos. |
| Canvas | Idêntico em todos os quadros (Agumon 48/56/60, Gomamon 48/56/60/64, Ikkakumon 64/76). |
| Número de quadros | Idêntico (andar 8, ataque 9). |
| Escala | Mantida. Altura no andar: Agumon 35–42, Gomamon 35–42, Ikkakumon 47–53, iguais ao original fora a crista e o efeito removidos. Nenhum redimensionamento (os componentes têm o mesmo tamanho nos quadros não recolados). |
| Pixels semitransparentes | 0 em todos os quadros. |
| Paleta | **Nenhuma cor nova** nos três pacotes: toda cor da F2 já existia no original. As cores removidas estão a no máximo 10 RGB das restantes **na unificação**. As distâncias de 43/45 vêm das trocas intencionais de anatomia: barriga creme, pé marrom, garra vermelha e ciano. É correção de forma, não mudança de paleta. **Sem mudança visível de paleta.** |
| Conflito Endesga-32 × v13/v15 | Não tocado. Continua **aberto** (Etapa 6). Não medi Endesga nesta auditoria; [L] relatório: 0–1,9% de pixels exatos, igual ao antes. |

## 3. Pixels copiados das folhas oficiais?

**Não há indício [E].**
1. Nenhuma cor da F2 é nova; todas vêm do próprio pacote original. Um recorte de folha oficial traria a paleta dela.
2. Os scripts `f2/scripts/*.py` só abrem os pacotes (`load_pack`, `pacote.json`); `grep` não encontra nenhuma referência a `f1/imagens/oficiais`, `dw3`, `wsc` ou `dawn`.
3. Os trechos alterados são recolagens internas verificáveis: q6 = q3 e q7 = q2 no Gomamon S; no Agumon N, q5–q7 = q2 no corpo.

Limitação: não fiz busca de blocos contra as folhas oficiais pixel a pixel; os pontos 1 a 3 tornam essa busca desnecessária [H].

## 4. Notas 0–10

**Régua:** checklist das fichas de anatomia (lista "o que NÃO existe" obrigatória) + regras do brief F2.
- 8 = pronto para integração de teste, sem defeito visível a 1×/4×.
- 9 ou mais = padrão GS-010 (ADR-012 §5: média ≥ 9 e nenhuma categoria < 8).
- Paleta fora da nota (conflito aberto). **Duas réguas visuais [L]:** pela régua do Style Bible, a paleta continua a dos sprites PixelLab (não Endesga-32). Pela referência v13/v15, nada mudou. Não reavaliei a identidade GBA Plus.

| Espécie | Fidelidade | Estabilidade | Limpeza | Legibilidade | Média QA | Média autoavaliação | Δ |
|---|---|---|---|---|---|---|---|
| Agumon, antes | 5,5 | 5,5 | 5,5 | 6,5 | **5,75** | 6,0 | −0,25 |
| **Agumon, depois** | 7,5 | 7,5 | 7 | 7 | **7,25** | 8,0 (8/8/8/8) | **−0,75** |
| Gomamon, antes | 5 | 5 | 5 | 6,5 | **5,4** | 5,8 | −0,4 |
| **Gomamon, depois** | 6,5 | 7,5 | 8 | 7 | **7,25** | 7,5 (7/7,5/8/7,5) | −0,25 |
| Ikkakumon, antes | 7 | 7 | 7 | 8 | **7,25** | 7,3 | 0 |
| **Ikkakumon, depois** | 7 | 7 | 8 | 8 | **7,5** | 7,6 (7/7,5/8/8) | −0,1 |

Por que as minhas notas ficam abaixo:
- **Agumon:** limpeza e legibilidade 7, não 8, por causa do **fogo cortado na borda do canvas** no ataque N (defeito novo) e do ataque N com o corpo congelado. Estabilidade 7,5 porque o andar L/O piorou um pouco. Fidelidade 7,5: o fogo do ataque S sai do peito, o pé de trás ferrugem continua em L/O e a mancha da cauda varia no N.
- **Gomamon:** fidelidade 6,5 porque os ataques são de outro corpo (v1), as costas têm silhueta em "X", sem as traseiras dobradas da ficha, e as manchas roxas mal se veem a 1×. Legibilidade 7 por causa da faísca de impacto quase invisível. Limpeza 8 confere com a autoavaliação.
- **Ikkakumon:** estabilidade 7, não 7,5, por causa do alinhamento pelo pixel isolado nos q6–q7 do L/O. Continua com a cauda longa (a ficha pede "sem rabo de peixe", [H] "cauda escondida no pelo").
- **Ninguém atinge a régua GS-010** (média ≥ 9, nenhuma categoria < 8). A F2 melhora de +1,5 a +1,9 o Agumon e o Gomamon e +0,25 o Ikkakumon. É polimento, não homologação.

## 5. Problemas

| ID | Sev. | Problema | Evidência | Caminho de correção (custo 0) |
|---|---|---|---|---|
| F2-1 | **P2** | Agumon ataque N q3–q6: bola de fogo cortada pela borda superior do canvas de 56 px | linha y=0 com 13 px opacos no q4; bbox topo 0 (`out/compare.json`); zoom `tmp_view/qa_f2/z_ag_attN.png` | Descer a bola ≥ 3 px, até a borda ficar transparente, ou trocar o 16×16 por uma bola menor, do próprio q4, no q4–q5. Não muda o canvas. |
| F2-2 | P3 | Ikkakumon andar L/O q6–q7: corpo sobe 2 px por alinhar o pé a um pixel isolado de garra (y=63, 1–2 px) | `out/metrics2.txt` (topo 9–12), `out/centroid.txt` (1,5 → 2,0) | Alinhar pela sola (linha com ≥ 4 px opacos), ou desfazer o deslocamento só nos q6–q7. |
| F2-3 | P3 | Agumon andar L/O: sobe-e-desce maior que o original (1,6 → 2,4 px); q0, q1, q3 e q7 subiram 1 px | `out/centroid.txt` | Mesmo critério do F2-2: verificar se o pixel 50 era sola ou ponta, e manter o deslocamento só onde era sola. |
| F2-4 | P3 | Agumon andar L/O q0–q2: pé de trás em laranja-ferrugem escuro, que lê como "sapato" (A2 só foi feito no S) | zoom `z_ag_walkE.png` | Clarear para a sombra laranja do corpo, como no A2, se o designer concordar que é defeito e não sombra. |
| F2-5 | P3 | Agumon ataque N: corpo congelado em 5 quadros; no q3 a chama atrás da cabeça pode ler como crista | `z_ag_attN.png`; 0 px de diferença q5–q7 × q2 | Aceitável como intermediário. Uma melhora real exige quadro novo (gera custo). |
| F2-6 | P3 (herdado) | Gomamon: ataques v1 com corpo diferente do andar v2; costas em "X"; manchas roxas fracas | folhas `gomamon_attack_*`, `z_go_walkN.png` | Gerar de novo (gasta gerações; precisa de brief). |
| F2-7 | P3 (herdado) | Ikkakumon: cauda longa e afilada no L/O, contra a ficha | folha `ikkakumon_walk_E.png` | Decisão do designer/fundador (relatório, item 3). |

Nenhum P0 ou P1.

## 6. Recomendação

**Sim: aprovar a F2 para integração no Link A como teste, com uma condição antes.**
- **Corrigir antes (bloqueia):** **F2-1**, o fogo cortado no ataque N do Agumon. É defeito novo, introduzido pela F2, e fica visível no jogo. Custo 0, minutos.
- **Recomendado antes, sem bloquear:** F2-2 e F2-3, o critério de alinhamento do pé pela sola e não pelo pixel isolado. Hoje desfazem parte do ganho de estabilidade nas vistas laterais.
- **Pode ir como está e ficar registrado:** F2-4 a F2-7.
- **Para o game-dev:** confirmar a âncora do sprite. A linha do pé mudou em até 4 px (Agumon S) e 5 px (Gomamon S) [E]. Formato, nomes e canvas são iguais, então a troca é só de caminho.
- **Isto não homologa os sprites:** todas as médias ficam abaixo de 8 e muito abaixo da régua GS-010. O polimento a custo 0 melhora, mas não resolve os problemas de desenho (ataques do Gomamon, cauda do Ikkakumon, ataques do Agumon), que exigem geração nova.

## 7. O que não foi feito / limitações

- Não vi os GIFs em movimento; o sobe-e-desce foi medido por centróide e topo, não percebido em animação.
- Não há prova por hash de que os originais estão intocados: eles não estão no git. Só pela data.
- Não refiz o `pixelart_workbench score` nem a medição Endesga-32.
- Não testei no jogo; a F2 não está integrada. Integração, âncora e desempenho: **NÃO VALIDADO**.
- Não corrigi nada e não alterei arquivos além deste. Os scripts e as imagens de QA ficam no workspace do game-qa.

## 8. Decisões do fundador/designer

1. Aceitar a integração no Link A com a condição F2-1 (e, de preferência, F2-2 e F2-3).
2. Pé de trás ferrugem do Agumon L/O (F2-4): é sombra aceitável ou defeito?
3. Cauda do Ikkakumon e ataques do Gomamon v2: aceitar ou gerar de novo (custo e brief).
4. Polimento a custo 0 como método: ganho medido de +1,5 a +1,9 nos sprites com defeito de peça e ~0,25 no sprite que já era estável. Teto prático ~7,5 sem gerar de novo.
