# Relatório · C14 F8B Hawkmon · Etapa 2b (caminhada e idle)

**Data:** 2026-11-15 · **Produção:** game-art · **Brief:** `etapa6-lab/BRIEF_COMANDO_14_F8B_HAWKMON_ETAPA2B.md` · **Estado:** v1 avaliado pelo game-qa (`QA_ETAPA2B_INDEPENDENTE.md`); **v1b com as correções gratuitas no §11**, à espera de re-QA. **Não homologado. Não integrado. Sem ataque.**

Legenda: [E] medido ou executado nesta sessão · [H] julgamento ou hipótese.

## 1. Resumo

- Walk de 8 quadros e idle de 6 quadros nas 4 direções, em pacote 60×60 com a mesma âncora do Agumon F7v2 (29,5; 49).
- **Nenhum pixel gerado entra no pacote.** Cabeça, tronco, asas, cauda e topete são os pixels das rotações v2 aprovadas; as pernas e os pés foram redesenhados por código (`scripts/hawk_anim.py`). As gerações serviram de gabarito de movimento.
- **3 gerações gastas** (das 11 disponíveis). Saldo: 562,95 → **559,95**. Piso de 552 respeitado, com 7,95 de folga.
- A primeira geração da S saiu com deformação grave (o bicho decola). Parei, escrevi o diagnóstico e troquei de ferramenta antes de gastar de novo (§3).
- A N **não foi gerada**: saiu por desenho, a partir do gabarito da S (§3).
- Rotações v2 preservadas: `sha256sum -c sha256_e2ab.txt` e `sha256.txt` conferem inteiros depois do trabalho [E].

## 2. Entregas

Tudo em `etapa6-lab/fase20-f8b-hawkmon/etapa2b_walk_idle/`:

| Caminho | O que é |
|---|---|
| `pacote_hawkmon_v1/` | `rotations/`, `walk/<dir>/frame_000–007.png`, `idle/<dir>/frame_000–005.png`, `camadas/` (corpo e topete separados, por quadro) e `pacote.json` |
| `comparacao/` | GIFs e folhas em 1× e 4× (lista no §6) |
| `metricas_e2b.json` | métricas por quadro, calculadas no rig |
| `medidas_pixels_e2b.json` | medidas tiradas dos PNG do pacote (pé plantado, leque, asa, cauda) |
| `walk_cru/` | entradas enviadas e os 3 resultados crus do PixelLab (`S/`, `E/`, `S_template/`) |
| `scripts/` | `hawk_anim.py` (rig), `build_pacote.py`, `comparacao.py`, `grades.py`, `ver.py`, `dumpq.py`, `prep.py` |
| `PROGRESS.md`, `sha256_e2b.txt` | registro e hashes |

## 3. Gerações

| # | Chamada | Direção | Saldo antes → depois | Resultado |
|---|---|---|---|---|
| 1 | `animate_image`, 64×64, 8 quadros, seed 1401 | S | 562,95 → 561,95 | **Deformação grave.** Descartado. |
| 2 | `animate_image`, 64×64, 8 quadros, seed 1402 | E | 561,95 → 560,95 | Passada real. Usado como gabarito. |
| 3 | `animate_character`, template `walking-8-frames` | S | 560,95 → 559,95 | Ciclo real. Usado como gabarito. |

**Por que `animate_image` e não o personagem da conta:** as rotações guardadas em `cdca6904…` são as cruas da Etapa 2a (pena larga em E/W, asa lendo como cauda, N sem leque), não as v2 aprovadas. A exceção é a S, que é igual à v2 pixel a pixel; por isso a geração 3 pôde usar o personagem.

**Diagnóstico da geração 1 (S), escrito antes de gerar de novo:**
- O que saiu: os quadros 1–3 abrem pernas e asas; nos quadros 4–8 o bicho decola (asas na horizontal, pés fora do chão, o bbox sobe 3–4 px), o topete vira gancho e a fivela some. O laço não fecha.
- Causa provável [H]: `animate_image` é movimento livre a partir de texto, sem esqueleto nem ciclo. "Bird" e "wings" no texto puxaram voo.
- Correção: trocar de ferramenta, não de texto. O template com esqueleto deu alternância real de pés na geração 3.

**Defeitos dos crus aproveitados** (motivo de não usar nenhum como quadro final) [E]:
- S template: o corpo fica humanoide (mais alto e estreito, 428–461 px), as pontas das asas viram "mãos" escuras, os pés ficam cinza em metade dos quadros.
- E: rosto e fivela mudam entre quadros, o topete entorta, um quadro perde a asa (446 px), o corpo sobe 2–3 px no meio do ciclo, cores fora da P1.

**N sem geração:** de costas o movimento é o da S com a profundidade invertida. As restrições da N (leque por cima das pernas, pés 1 px mais curtos por dentro) teriam de ser refeitas à mão sobre qualquer resultado gerado. Preferi guardar o crédito.

A animação da geração 3 ficou gravada no personagem `cdca6904…` da conta (grupo `2a520357-5cd2-462e-9424-f0233d1934f5`). Não apaguei.

## 4. Como cada animação foi feita

**Walk** (110 ms por quadro, igual ao Agumon F7v2):
- **S:** pé de apoio no chão por 4 quadros; o outro sai para trás (vira toco), volta levantado e desce inteiro. Corpo 1 px mais baixo nos contatos (quadros 0 e 4). Cada asa desce 1 px por 2 quadros, alternando.
- **N:** igual, visto de costas: o pé que sai mostra a sola, some sob o leque e desce inteiro. O leque é sempre desenhado por cima das pernas.
- **E/W:** passada de 6 px por pé, 2 px por quadro com o pé de apoio parado no mundo. O pé de perto sobe 3 px ao passar, para o pé de trás (apoio) ficar à vista. As pontas escuras da asa recuam 1 px por 2 quadros a cada passo; a cauda vermelha cai 1 px logo depois do contato.
- **Topete:** a ponta fica parada; quando a cabeça desce 1 px, a pena estica 1 px na base.

**Idle** (6 quadros, mesmos tempos do Agumon F7v2): q0 = rotação; q1–q2 o corpo desce 1 px e o topete assenta; q3 sobe com as asas 1 px soltas (em E/W, as pontas da asa recuam; em q2 a cauda cai); q4 pisca (na N, que não tem rosto, ajeita uma asa); q5 = rotação. O rosto, o bico e a faixa não são tocados: só os 3×3 px de cada olho mudam no piscar.

## 5. Métricas [E]

Fonte: `metricas_e2b.json` e `medidas_pixels_e2b.json`. Régua de massa: Agumon S = 582 px.

| Anim. | Dir. | Área (mín–máx) | ÷ Agumon S | ÷ S na mesma fase (mín) | Cores (máx) | Fora da P1 | Semitransp. | Componentes | Pixels soltos | Topete × corpo |
|---|---|---|---|---|---|---|---|---|---|---|
| walk | S | 467–488 | 0,80–0,84 | 1,00 | 24 | 0 | 0 | 1 | 0 | 0 |
| walk | N | 483–496 | 0,83–0,85 | 1,01 | 19 | 0 | 0 | 1 | 0 | 0 |
| walk | E/W | 453–475 | 0,78–0,82 | 0,95 | 23 | 0 | 0 | 1 | 0 | 0 |
| idle | S | 484–498 | 0,83–0,86 | 1,00 | 24 | 0 | 0 | 1 | 0 | 0 |
| idle | N | 490–506 | 0,84–0,87 | 1,01 | 19 | 0 | 0 | 1 | 0 | 0 |
| idle | E/W | 459–468 | 0,79–0,80 | 0,94 | 23 | 0 | 0 | 1 | 0 | 0 |

Área por quadro:
- walk S: 467, 470, 479, 488, 467, 470, 479, 488
- walk N: 485, 486, 483, 496, 485, 486, 483, 496
- walk E/W: 461, 461, 473, 475, 467, 453, 455, 463
- idle S: 492, 488, 484, 498, 492, 492 · idle N: 500, 494, 490, 506, 503, 500 · idle E/W: 466, 464, 459, 468, 466, 466

Outras medidas:
- **Faixas do Re-QA v2 (ponto 6):** S e N dentro de 0,80–0,90; E/W dentro de 0,75–0,90; conferência interna ≥ 0,90 em todos os quadros (mínimo 0,94).
- **Pixels soltos:** 0 em todos os quadros (nenhum pixel opaco sem vizinho opaco); cada quadro é 1 componente só. Pela régua antiga da E2a (pixel sem vizinho da mesma cor), a walk fica em 91–103 na S, 67–71 na N e 62–69 em E/W, igual ou abaixo das rotações.
- **Deslizamento do pé (E/W), medido nos PNG:** pé de perto em x de mundo 32, 32, 32, 32 nos quadros 0–3; pé de trás em 46, 46, 46 nos quadros 4–6. **Deslizamento 0 px.** No quadro 7 a garra do pé de trás fica encoberta pelo pé de perto e não foi medida.
- **Topete:** oscilação da ponta de 0 px na walk e 1 px na idle; altura de 8 ou 9 px; vão até a cabeça 0 (nunca se solta); sobreposição 0.
- **Cabeça:** 0 px diferentes da rotação em todos os quadros da walk. Na idle, só o piscar: 16 px na S, 8 px em E e em W.
- **Idle q0 = rotação v2:** idêntico nas 4 direções. **W = espelho de E:** 0 px diferentes, na walk e na idle.
- **N, leque:** a última linha vermelha da ponta central fica em y=46 nos 8 quadros; o chão é y=49. A ponta não desce nem quando o corpo desce.
- **E, asa × pés:** distância mínima entre a ponta `h` da asa e qualquer pixel de pé: 4–9 px. **Cauda vermelha** em y=38–41, sempre acima da ponta da asa (y=43–44).
- **Última linha opaca:** 49 em todos os quadros de S e N. Em E/W: 49 nos quadros 0–3 e **48 nos quadros 4–7** (ver §7, item 2).

**Escala (G-2, aberto, nada decidido):** Tamer A 41 px, Hawkmon 38 px (corpo 30 + topete 8), Agumon F7v2 S 35 px, tile 32.
**Paleta (conflito aberto):** tudo em P1, 0 cores fora. Não medi contra a Endesga-32 nesta etapa; as rotações de origem não têm nenhuma cor Endesga-32 exata e nenhuma cor nova entrou. Não é declaração de conformidade com nenhum dos dois lados.

## 6. Comparações (`comparacao/`)

Colunas dos GIFs: Tamer (parado) · Hawkmon · Agumon F7v2. Linhas: S, N, E, W. Todos em 1× e 4×.
- `walk_SNEW_tamer_hawkmon_agumon_110ms`: as duas walks a 110 ms.
- `idle_SNEW_tamer_hawkmon_agumon`: idles com os tempos de cada pacote.
- `ciclo_idle_walk_idle_SNEW_tamer_hawkmon_agumon`: idle → walk ×2 → idle.
- `pista_E_hawkmon_2px_x_agumon_3px_110ms`: os dois andando para a direita com o pé plantado, cada um na sua velocidade.
- `folha_walk_hawkmon_SNEW`, `folha_idle_hawkmon_SNEW` (PNG): todos os quadros, com a rotação na primeira coluna.
- `folha_walk_hawkmon_x_agumon_SE`, `quadro_contato_walk_tamer_hawkmon_agumon` (PNG).

## 7. Problemas e limitações

1. **Velocidade diferente da do Agumon.** O Hawkmon anda 2 px por quadro (18,2 px/s a 110 ms); o Agumon anda 3 (27,3 px/s). As pernas têm 4 px de altura e uma passada de 9 px ficaria quase horizontal. Para os dois andarem juntos sem o pé escorregar, a walk do Hawkmon precisa tocar a ~73 ms por quadro (`delay_ms = 2000 / velocidade`). Está no `pacote.json`. Não testei a 73 ms.
2. **E/W, quadros 4–7: a última linha opaca é 48, não 49.** O pé de trás pisa 1 px acima do de perto, por perspectiva, como na rotação aprovada. O chão continua em 49 e a âncora não muda. Se o jogo ancorar pelo pixel mais baixo, o sprite treme 1 px.
3. **E/W, quadros 5 e 6:** o pé de perto fica recolhido 3 px sob a barriga e a perna de trás some atrás dele; sobra só o pé escuro no chão. A 4× os dois pés ficam empilhados. [H] Lê como passo alto de ave, mas é o ponto mais fraco da E.
4. **N: só um pé aparece em metade dos quadros.** O outro está sob o leque. É consequência de manter o leque por cima das pernas. O ajuste opcional do Re-QA (recuar 1 px a base das penas laterais) **não foi feito**.
5. **S e N não têm pé plantado medido.** O pé de apoio fica parado na tela por 4 quadros enquanto o corpo anda. [H] Pode ler como marcha no lugar se o jogo deslocar o sprite devagar; o que distingue da marcha é o pé que encolhe atrás e volta inteiro.
6. **Asas com 1 px de movimento.** É discreto como pedido; a 1× pode não aparecer.
7. **Leitura que fiz de "o pé de trás nunca passa à frente do pé de perto":** tomei como ordem de desenho (o pé de trás nunca é desenhado por cima do de perto). Na posição horizontal ele avança além do pé de perto em metade do ciclo, porque sem isso não há passada. Se a intenção era a posição, a E precisa ser refeita como arrasto de um pé só.
8. **Tamer parado nas comparações:** o Tamer A só tem a rotação S nos assets do lab.
9. **Não vi os GIFs em movimento.** Conferi as folhas de quadros e as grades; a ferramenta de inspeção só mostra imagem parada.
10. **Sem cenário, sem sombra de contato, sem jogo:** leitura sobre mapa real não validada.
11. **Segunda régua (v13/v15 e referências do fundador):** não medida.
12. Esta sessão produziu e não dá nota. Falta a avaliação do `game-qa`.

## 8. Não foi feito

Ataque, integração, diagonais, animação "feliz", Blender como gabarito (não precisou), Retro Diffusion, geração da N.

## 9. Decisões que dependem do fundador / ChatGPT

1. Aceitar 2 px por quadro (com 73 ms ao lado do Agumon) ou pedir passada mais longa.
2. Item 7 do §7: ordem de desenho ou posição do pé de trás.
3. Aceitar a N com um pé visível por vez, ou autorizar o recuo das penas laterais do leque.
4. As decisões abertas das etapas anteriores (régua de massa, escala G-2, paleta) continuam abertas.

## 10. Como refazer

Em `scripts/`: `python3 build_pacote.py && python3 comparacao.py` (0 gerações; o pacote anterior vai para `_anteriores/`). Depois, na pasta da etapa, refazer o `sha256_e2b.txt`.

## 11. Correções E2b-c (pacote v1b)

**Data:** 2026-11-15 · **Produção:** game-art · **Origem:** `QA_ETAPA2B_INDEPENDENTE.md` §6 (C1, C2, C3) · **Custo:** 0 gerações. PixelLab não foi chamado (nem saldo). **Não integrado. Não homologado.**

O `pacote_hawkmon_v1/`, a `comparacao/`, os `scripts/` e as métricas do v1 **não foram tocados**. `sha256sum -c sha256_e2b.txt` deu 236/236 OK antes de eu editar este relatório [E]; agora a única linha que diverge é a deste arquivo (a versão anterior está em `_anteriores/RELATORIO_ETAPA2B_antes_E2b-c.md`). Os §1–§10 acima descrevem o v1 e ficaram como estavam.

### 11.1 Entregas novas

| Caminho | O que é |
|---|---|
| `pacote_hawkmon_v1b/` | mesmo formato do v1 (`rotations/`, `walk/`, `idle/`, `camadas/`, `pacote.json` com o bloco `correcoes_v1b`) |
| `scripts_v1b/` | cópia dos scripts com as correções: `hawk_anim.py` (rig), `build_pacote.py`, `comparacao.py` |
| `comparacao_v1b/` | os mesmos GIFs e folhas do v1, refeitos em 1× e 4×, mais `walk_SNEW_v1_x_v1b_110ms` (GIF) e `folha_walk_v1_x_v1b_SNE` (PNG) |
| `metricas_e2b_v1b.json`, `medidas_pixels_e2b_v1b.json` | métricas do rig e medidas tiradas dos PNG do v1b |
| `sha256_e2b_c.txt` | hashes de tudo que está na pasta depois da E2b-c |

Editei uma cópia do rig (`scripts_v1b/hawk_anim.py`), não o `scripts/hawk_anim.py`: assim o v1 continua reproduzível e com hash válido.

### 11.2 O que mudou

**C1 · E/W, q5 e q6.** O pedido dava duas saídas: subir o pé 2 px em vez de 3, ou adiantá-lo 1–2 px. Testei 10 combinações no rig antes de fixar [E]:
- **Só baixar para 2 px não serve.** O pé de perto tem 10 px de largura e o de trás 6. A 2 px de altura o pé de perto cobre o pé de trás inteiro (0 px coloridos à vista no q6, 1 no q5): troca "pés empilhados" por "pé de trás sumido".
- **Só adiantar 1–2 px nos dois quadros também não:** a haste continua coberta no q5.
- **O que ficou:** altura de 3 px mantida; no **q5 o pé de perto fica 1 px mais atrás** e no **q6 1 px mais à frente** que no v1. Os pés ficam desencontrados em vez de um exatamente sobre o outro, e sobra **1 px da haste da perna de trás** à vista em cada um dos dois quadros (v1: 0 e 0).
- O apoio não mudou: **deslizamento 0 px** nos dois pés.
- Custo: o pé de perto anda no mundo 3, 3, 6, 2, 2 px por quadro durante a passada (v1: 3, 4, 4, 3, 2). O salto de 6 px é no meio do balanço, com o pé no ar.
- W sai pelo espelho.

**C2 · N.** Só na walk:
- as duas penas laterais do leque ficaram **1 px mais curtas embaixo** (última linha vermelha em y=43; era 44). A pena central não mudou: **y=46 nos 8 quadros**, chão em 49. As 3 pontas continuam (central 3 px abaixo das laterais);
- o recuo sozinho não bastava: no v1 o pé que avança subia 3 px e sumia inteiro sob o leque. Agora ele fica encolhido logo abaixo do leque nos q1, q2, q5 e q6 (2 px de altura), e o toco ganhou 1 px de largura;
- resultado: **os dois lados têm pelo menos 3 px de perna ou pé à vista em 8/8 quadros** (v1: 4/8). Nos quadros de passagem o segundo pé tem 3 px coloridos mais o contorno: é um toco pequeno, não um pé inteiro.
- **Idle e rotação da N não mudaram** (leque da rotação v2 aprovada). Por isso o leque encurta 1 px ao entrar na walk e volta ao parar. São 4 px de vermelho por lado.

**C3 · Asas na S e na N.** A asa do lado da perna que avança desce **1, 2, 1 px** em q1–q3 (direita) e q5–q7 (esquerda). No v1 era 1, 1, 0. A ponta `h` vai a y=45 no quadro de passagem (repouso: 43). A outra asa fica parada.

Não mudou: rotações, idle das 4 direções, cabeça, topete, âncora, tempos, 2 px por quadro.

### 11.3 Métricas do v1b [E]

Fonte: `metricas_e2b_v1b.json` e `medidas_pixels_e2b_v1b.json`. Régua de massa: Agumon S = 582 px.

| Anim. | Dir. | Área por quadro | ÷ Agumon S | ÷ S na mesma fase (mín) | Cores (máx) | Fora da P1 | Semitransp. | Componentes | Pixels soltos | Topete × corpo |
|---|---|---|---|---|---|---|---|---|---|---|
| walk | S | 467, 470, 482, 491 ×2 | 0,80–0,84 | 1,00 | 24 | 0 | 0 | 1 | 0 | 0 |
| walk | N | 483, 486, 489, 497 ×2 | 0,83–0,85 | 1,01 | 19 | 0 | 0 | 1 | 0 | 0 |
| walk | E/W | 461, 461, 473, 475, 467, 454, 457, 463 | 0,78–0,82 | 0,94 | 23 | 0 | 0 | 1 | 0 | 0 |
| idle | S, N, E/W | iguais ao v1 (§5) | | | | 0 | 0 | 1 | 0 | 0 |

- **Diferença para o v1, em pixels por quadro:** S 0, 0, 5, 12 (×2) · N 13, 15, 24, 24 (×2) · E/W 0 nos q0–q4 e q7, 22 no q5, 16 no q6. **Idle: 0 px nas 4 direções. Rotações: 0 px.**
- **Faixas do Re-QA v2 (ponto 6):** S e N dentro de 0,80–0,90; E/W dentro de 0,75–0,90; conferência interna mínima 0,943 (v1: 0,949).
- **Pixels soltos:** 0 em todos os quadros; 1 componente por quadro. Régua antiga (pixel sem vizinho da mesma cor): 91–101 na S, 66–69 na N, 63–69 em E/W.
- **Deslizamento do pé (E/W), nos PNG:** pé de perto em x de mundo 32, 32, 32, 32 (q0–q3); pé de trás em 46, 46, 46 (q4–q6). **0 px.** No q7 a garra de trás fica encoberta, como no v1.
- **C1, haste da perna de trás à vista (px que não são contorno), q0–q7:** v1b 0, 1, 2, 3, 3, **1, 1**, 1 · v1 0, 1, 2, 3, 3, **0, 0**, 1. Pé de trás à vista: 2, 2, 4, 4, 3, 4, 4, 2 (igual ao v1). No q0 a haste já não aparecia no v1 (o pé aparece); não mexi.
- **C2, px de perna e pé à vista na N (esquerda, direita), q0–q7:** v1b (10,6) (12,3) (12,3) (12,10) (6,10) (3,12) (3,12) (10,12) · v1 (9,4) (11,1) (11,0) (11,9) (4,9) (1,11) (0,11) (9,11).
- **C3, y da ponta `h` da asa (esquerda, direita), S e N iguais:** v1b (44,44) (43,44) (43,45) (43,44) (44,44) (44,43) (45,43) (44,43). Distância mínima da ponta até um pixel de pé: 3–4 na S e na N (igual ao v1); 4–9 em E/W.
- **Cabeça:** 0 px diferentes da rotação nos 32 quadros da walk; na idle só o piscar (16 px na S, 8 em E e em W).
- **Topete:** oscilação da ponta 0 px na walk e 1 px na idle; sobreposição 0; vão até a cabeça 0; altura 8 ou 9 px.
- **Idle q0 = rotação v2** nas 4 direções. **W = espelho de E:** 0 px diferentes.
- **Última linha opaca:** 49 em S e N; em E/W 49 nos q0–q3 e 48 nos q4–q7 (igual ao v1; a condição de âncora fixa continua valendo).
- **Transições (px trocados, medidos nos PNG):** S idle→walk 300, walk→idle 40 · N 269 e 44 · E/W 290 e 55. Dentro do ciclo (média / máx.): S 158 / 317, N 144 / 288, E 172 / 294. A saída da walk na S e na N ficou maior que a medida pelo QA no v1 (28 e 20) por causa da asa ainda 1 px baixa no q7 e do leque da N.

**Escala (G-2) e paleta (G-1):** nada mudou e nada foi decidido. Tudo em P1, 0 cores fora; não medido contra a Endesga-32.

### 11.4 Limitações da E2b-c

1. **C1 cumpre o critério pelo mínimo:** 1 px de haste em cada quadro. Os dois pés continuam um acima do outro, só que desencontrados. [H] Se o QA ainda ler "pulinho", a alternativa seguinte é redesenhar o pé levantado mais curto (dedos recolhidos), o que é desenho novo e não ajuste.
2. **C2:** o leque da walk N é 1 px mais curto nas laterais que o da rotação e da idle. Unificar exigiria mexer na rotação N v2 aprovada, o que não fiz.
3. **C3:** não vi os GIFs em movimento; a ferramenta de inspeção só mostra imagem parada. Conferi as folhas `folha_walk_v1_x_v1b_SNE` a 1× e a 4× e as grades. [H] 2 px por 1 quadro não deve ler como bater de asa, mas isso é do QA.
4. Continua sem mapa, sem sombra e sem jogo. As condições de integração do QA §6 (âncora fixa, atraso por espécie, sombra pelo jogo) não mudaram.
5. Esta sessão produziu e não dá nota. Falta o re-QA do `game-qa` sobre o v1b.

### 11.5 Como refazer o v1b

Em `scripts_v1b/`: `python3 build_pacote.py && python3 comparacao.py` (0 gerações; se o `pacote_hawkmon_v1b/` existir, a versão anterior vai para `_anteriores/`). Depois refazer o `sha256_e2b_c.txt`.

### 11.6 Decisões que dependem do fundador / ChatGPT

1. Qual pacote segue para o ChatGPT e para o build isolado: v1 ou v1b.
2. N: manter o leque da walk 1 px mais curto que o da rotação, ou autorizar o mesmo recuo na rotação N e na idle.
3. As decisões do §9 e do QA §9 continuam abertas.

## Crédito

Hawkmon é espécie oficial de Digimon (Bandai/Toei). Fangame não oficial e sem licença. Sprites: adaptação do estúdio (PixelLab como gabarito + desenho por código). Camada `private-prototype`. **Não homologado.**
