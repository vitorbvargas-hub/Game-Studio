# QA independente · C14 F8B Hawkmon · Etapa 2b (walk e idle)

**Digital Odyssey (GS-003) · game-qa (Opus 5.5) · 2026-11-15 · custo PixelLab: 0** (nenhuma ferramenta de geração ou de conta chamada)
**Objeto:** `etapa2b_walk_idle/`, ou seja, `RELATORIO_ETAPA2B.md`, `pacote_hawkmon_v1/` (com `pacote.json` e `camadas/`), `comparacao/`, `metricas_e2b.json`, `medidas_pixels_e2b.json` e `sha256_e2b.txt`. Conferido contra `BRIEF_COMANDO_14_F8B_HAWKMON_ETAPA2B.md` e os pontos de atenção do Re-QA v2 (`etapa2a_rotacoes/QA_ETAPA2A_INDEPENDENTE.md` §R6).
**Réguas:**
- os 8 critérios do Comando 12 §5 (`COMANDO_FUNDADOR_12_F7.md`), com meta ≥ 8;
- a mesma escala de notas do QA F7v2: 8 = pronto para integração de teste. Sem mapa real, legibilidade não passa de 7,5;
- ficha anatômica (§7, §9, §11) e Re-QA v2 da E2a;
- a paleta fica **fora** das notas (G-1 aberto).

**Legenda:** [E] executado nesta auditoria · [L] número de relatório anterior, não reverificado · [H] julgamento ou hipótese · **NÃO VALIDADO**, com o motivo.

Este é um fangame não oficial, sem licença. **Só este arquivo foi criado na pasta.** Não alterei asset, script, `PROGRESS.md` nem hash, não gerei nada e não integrei nada.

## 0. Veredito

| | Média dos 8 critérios do C12 §5 | Meta 8 | GS-010 (média ≥ 9, nenhum < 8) |
|---|---|---|---|
| **Hawkmon E2b, pacote v1** | **8,09 ≈ 8,1** | **sim, com pouca folga** | não |

- **O brief foi cumprido.** Foram 3 gerações, usadas só como gabarito; nenhum pixel gerado entrou no pacote. Os 6 pontos de atenção do Re-QA v2 (mais a vigilância do topete) estão atendidos, e nenhum quadro tem defeito P0, P1 ou P2.
- **A melhor parte é a walk E/W.** A passada é real, o pé plantado desliza 0 px no mundo nos dois pés, os arcos de pé são contínuos e a ordem de desenho está certa. As transições idle↔walk são mais suaves que as do Agumon F7v2.
- **Abaixo de 8 ficam fluidez (7,75) e legibilidade (7,5).** Os motivos:
  - E/W q5–q6: os dois pés ficam empilhados;
  - N: só um pé aparece em 4 dos 8 quadros;
  - asas de 1 px, que não se veem a 1×;
  - não há mapa real.
- **Pode ir para o ChatGPT:** sim, como candidata, junto com este QA.
- **Pode ir para um build isolado:** sim, com duas condições de integração (§6). Recomendo antes a correção gratuita C1 (E q5–q6), de cerca de 10 min de código e 0 gerações.

## 1. Build e integridade [E]
- A pasta está fora do git (`git status`: `?? ./`). O HEAD do repositório do lab é `f02fbab`. O identificador do build é o `sha256_e2b.txt`.
- `sha256sum -c sha256_e2b.txt` deu **236/236 OK**. Em `etapa2a_rotacoes/`, `sha256_e2ab.txt` e `sha256.txt` deram **0 falhas**: as rotações v2 estão intactas.
- As rotações do pacote são iguais às `rotacoes_polidas_v2/*_composto.png` em (+6, +7): **0 px diferentes** nas 4 direções.
- Medição própria, sem executar nenhum script do game-art. Fica em `workspaces/game-qa/qa_scripts/c14e2b/`:
  - `png_qa.py`, o decodificador PNG do QA;
  - `medir.py`, `pe.py`, `trans.py`, `dump.py`, `mkpage.py`, `strip.py` e `cap.mjs` (derivado do `tools/qa_f7v2/cap_v2.mjs`);
  - saída `medicoes_e2b_qa.json`.
  Tudo rodou com `python3 -I`, fora da pasta do projeto. As capturas e as tiras ficaram em `workspaces/game-qa/tmp_c14e2b/`.

## 2. Métricas refeitas [E]

Régua de massa: Agumon S = 582 px.

| Anim. | Dir. | Área por quadro | ÷ Agumon S | ÷ S na mesma fase (mín.) | Cores (máx.) | Fora da P1 | Semitransp. | Componentes | Pixels soltos | Última linha |
|---|---|---|---|---|---|---|---|---|---|---|
| walk | S | 467, 470, 479, 488 ×2 | 0,802–0,838 | 1,00 | 24 | 0 | 0 | 1 | 0 | 49 |
| walk | N | 485, 486, 483, 496 ×2 | 0,830–0,852 | 1,02 | 19 | 0 | 0 | 1 | 0 | 49 |
| walk | E/W | 461, 461, 473, 475, 467, 453, 455, 463 | 0,778–0,816 | **0,949** | 23 | 0 | 0 | 1 | 0 | 49 (q0–3), **48 (q4–7)** |
| idle | S | 492, 488, 484, 498, 492, 492 | 0,832–0,856 | 1,00 | 24 | 0 | 0 | 1 | 0 | 49 |
| idle | N | 500, 494, 490, 506, 503, 500 | 0,842–0,869 | 1,02 | 19 | 0 | 0 | 1 | 0 | 49 |
| idle | E/W | 466, 464, 459, 468, 466, 466 | 0,789–0,804 | 0,94 | 23 | 0 | 0 | 1 | 0 | 49 |

- **Todos os números do §5 do relatório conferem** com a minha medição.
- Componentes contados em 8-conexão. "Pixel solto" é pixel opaco sem nenhum vizinho opaco.
- **W é espelho exato de E**: 0 px diferentes em 8/8 quadros da walk e 6/6 da idle.
- **Idle q0 e q5 são iguais à rotação** nas 4 direções (0 px).
- **Cabeça**, nas linhas 20–31, comparada com a rotação no melhor deslocamento vertical:
  - walk: **0 px diferentes em 32/32 quadros**; o corpo desce 1 px só nos contatos q0 e q4;
  - idle: só o piscar no q4 muda pixels (16 px na S, 8 em E e em W). A fivela da S e a tira da N ficam em todos os quadros.
- **Topete** (`camadas/`):
  - corpo + topete reconstrói o quadro em 56/56 quadros;
  - sobreposição de 0 px, e o topete toca o corpo em todos os quadros (nunca se solta);
  - a ponta fica em y = 12 em todos os quadros da walk (oscilação de 0 px). Na idle q2 vai a 13 (1 px);
  - a base alterna entre 19 e 20, porque a pena estica quando a cabeça desce.
- **Deslizamento do pé E**, com x de mundo = x + 2·q:
  - pé de perto, garras `C` em (32, 39) nos q0–q3: **0 px**;
  - pé de trás, garra `c` em 46 nos q4–q6: **0 px**. No q7 a garra fica encoberta pelo pé de perto, mas os `o` continuam no mesmo x;
  - os arcos no ar são contínuos e desaceleram ao pousar. O pé de perto passa por 39 → 42 → 46 → 50 → 53 → 55. O pé de trás, 46 → 53 → 57 → 60 → 62.
- **Transições**, em pixels trocados, Hawkmon contra Agumon F7v2:

  | Dir. | idle → walk | walk → idle | Dentro do ciclo (média / máx.) |
  |---|---|---|---|
  | S | 300 (Agumon 492) | 28 (Agumon 187) | 162 / 328 |
  | N | 279 (Agumon 61) | 20 (Agumon 321) | 148 / 299 |
  | E/W | 290 (Agumon 238) | 55 (Agumon 373) | 169 / 294 |

  A entrada na walk fica no nível do maior passo do próprio ciclo, porque o corpo desce 1 px no contato: não há salto extra. A saída é quase imperceptível.
- **GIFs da comparação:**
  - walk e pista a 110 ms em todos os quadros;
  - idle e ciclo usam os tempos de cada pacote. Como as linhas do GIF têm tempos diferentes, a união gera quadros de 20 ms. Chrome e Firefox respeitam 20 ms; um visualizador que force o mínimo de 100 ms tocaria o idle mais devagar [H]. Isso afeta só a apresentação.

## 3. Em movimento, no Chromium headless [E/H]
Página própria, `tmp_c14e2b/page.html`, com fundo de grama e o Hawkmon ao lado do Agumon:
- walk e idle nas 4 direções, a 1× e a 4×;
- ciclo idle → walk ×2 → idle, a 1× e a 2×;
- pistas com deslocamento real: Hawkmon a 2 px/quadro e 110 ms, Agumon a 3 px/quadro e 110 ms, Hawkmon a 2 px/quadro e 73 ms, e W a −2 px.

Captura em `tmp_c14e2b/cap/`: 24 quadros em tempo real (~60 ms) e 64 em tempo fixo (passo de 55 ms). Resultado: 120/120 imagens carregadas e **0 erros de console**. O ambiente é headless sem GPU, então a leitura é indicativa. Vi o movimento por quadros amostrados e tiras, não com percepção contínua de tempo.
- **S** (`walk4x_S.png`): os pés alternam de verdade. O pé que sai encolhe atrás (toco) e volta inteiro, e o corpo marca o contato com 1 px. Lê como passada curta de ave. As asas mexem 1 px: a 4× se vê, a 1× não.
- **N** (`walk4x_N.png`): a tira, o leque e o topete ficam estáveis. O pé que avança some sob o leque nos q1, q2, q5 e q6. A 1× lê como "um pé de cada vez sob a saia vermelha": funciona, mas é mais pobre que a S.
- **E/W** (`walk4x_E.png`, `pernasE_q3_7_8x.png`):
  - nos q0–q3 e q7 a passada lê bem: perna da frente amarela, a de trás mais escura e a cauda vermelha atrás e acima da asa;
  - nos **q5–q6** o pé de perto sobe 3 px sob a barriga, bem em cima do pé de trás plantado. A haste da perna de trás some, e a 4× os dois pés formam um bloco amarelo sobre um toco marrom;
  - a 110 ms isso dura 220 ms por ciclo e lê como um "pulinho" do pé. Não quebra a leitura, mas é o quadro mais fraco do pacote.
- **Pista** (`pista1x_3x.png`): a 110 ms o Hawkmon fica para trás do Agumon (18,2 contra 27,3 px/s). A 73 ms os dois andam juntos e o pé continua plantado. A cadência a 73 ms é rápida, de "ave miúda" [H]. Não fica estranha nos quadros amostrados, mas só um build com câmera e velocidade reais confirma.
- **Idle** (`idle4x_SE.png`): a respiração de 1 px, o piscar na S e em E/W e o ajuste de asa na N são legíveis a 4× e sutis a 1×. Não deformam rosto, bico nem faixa.
- **Ciclo idle → walk → idle:** não há salto de tamanho, de cabeça ou de topete. Ao parar, o sprite assenta direto, sem tropeço.

## 4. Os 6 (+1) pontos de atenção do Re-QA v2

| # | Ponto | Status | Evidência |
|---|---|---|---|
| 1 | N: o leque não some nem é cortado pela perna, e a ponta central não toca o chão | **Funciona** [E] | O leque é desenhado por cima das pernas em 8/8 quadros. A ponta vermelha fica em y = 46, com contorno em 47; o chão é 49 (vão de 2 px). A ponta não desce com o corpo (`dump.py walk N`). Consequência: aparece um pé só em 4/8 quadros (§5, item 4) |
| 2 | N: pés 1 px mais curtos por dentro que na S | **Funciona** [E] | Pé plantado da N com 7 px (`kCyyonk` / `knoyyCk`) contra 8 px na S (`kCyCycnk`), em todos os quadros |
| 3 | E/W: pé de trás aparece na passada, mais escuro, e não fica à frente do de perto | **Funciona** [E/H] | Usa `o/n`, mais escuro que o `y/Y` do pé de perto. Aparece em 7/8 quadros (no q0, 2 px de `oo`) e nunca é desenhado por cima do pé de perto (q7: o pé de perto cobre a garra de trás). Sobre a leitura "posição × ordem", ver item 7 do §5 |
| 4 | E/W: ponta `h` da asa sem encostar no pé | **Funciona** [E] | Distância mínima entre `h` e qualquer pixel de pé: 4–9 px em E/W, 3–4 na S e 4 na N |
| 5 | E/W: cauda vermelha atrás e acima da asa | **Funciona** [E] | Vermelho da cauda nas linhas 38–41, atrás do bloco cinza; o `h` da asa fica nas linhas 43–44. A ordem nunca se inverte |
| 6 | Massa por quadro (S/N 0,80–0,90; E/W 0,75–0,90; interna ≥ 0,90) | **Funciona** [E] | Mínimos de 0,802 (S), 0,830 (N), 0,778 (E/W) e 0,949 na conferência interna (E q7 ÷ S q7) |
| 7 | Topete: mesma camada, ≤ 1 px, sobreposição 0, P1, 0 semitransparentes | **Funciona** [E] | §2 |

## 5. Problemas 1–7 do relatório

| # | Problema | Veredito do QA | Sev. |
|---|---|---|---|
| 1 | 2 px/quadro contra 3 do Agumon | **Confirmado, e aceitável** [E/H]. Uma passada de 3 px por quadro exigiria pés de 9 px com pernas de 4 px; ficaria arrastada e quase horizontal, pior que a diferença de cadência. A saída é o atraso por espécie, `delay_ms = 2000 / v`, já documentado no `pacote.json`. A 73 ms anda junto do Agumon sem escorregar (§3). **Condição de integração:** o jogo precisa tocar a walk com atraso por espécie, ou o Hawkmon vai deslizar. **NÃO VALIDADO** em jogo | P3 (integração: P2 se for ignorado) |
| 2 | Última linha 48 nos q4–q7 de E/W | **Confirmado, e não é defeito** [E]. No q4–q7 o pé de apoio é o de trás, plantado na própria linha de perspectiva (48), enquanto o pé de perto está no ar. É a mesma convenção do Agumon F7v2 na N (pés em 48, chão 49). Com âncora fixa em (29,5; 49), nada treme. **Condição:** não ancorar pelo bbox nem cortar (trim) os quadros na exportação. Se o jogo exigir trim, use o mesmo retângulo nos 8 quadros | P3 |
| 3 | E q5–q6: a perna de trás some e os pés ficam empilhados | **Confirmado** [E/H]. A pose de passagem está anatomicamente certa: o pé que balança passa sobre o de apoio. O excesso é a subida de 3 px, com o pé exatamente em cima do outro, que tapa a haste toda. Ver a resposta sobre refazer, abaixo | **P3**, o ponto mais fraco |
| 4 | N com um pé só em 4/8 quadros | **Confirmado** [E]. É efeito do ponto de atenção 1, que eu mesmo pedi (o leque por cima). Aceitável a 1× [H]. O recuo opcional de 1 px na base das penas laterais (Re-QA R3) devolveria parte da perna de trás. **Recomendo** fazer junto com a C1, mas não bloqueia | P3 |
| 5 | S/N: "marcha no lugar" | **Parcial** [E/H]. Não é marcha no lugar no sentido do brief: os pés alternam, o que sai encolhe atrás e o contato marca 1 px. O pé de apoio fica parado na tela enquanto o sprite se desloca na vertical, o que é a convenção de sprite frontal top-down (o Agumon F7v2 faz o mesmo). Num deslocamento lento pode parecer passo curto. **NÃO VALIDADO** em jogo; conferir no build isolado | P3 |
| 6 | Asas com 1 px | **Confirmado** [E/H]. A 4× se vê; a 1× não. O brief pedia "discreto, sem ler como voo", e isso foi cumprido. Melhora opcional: na S/N, nos quadros de passagem (q2 e q6), descer 2 px a ponta da asa do lado da perna que avança | P3 |
| 7 | "Nunca passa à frente": ordem de desenho ou posição | **A leitura do game-art está correta** [H]. Quem escreveu esse ponto (Re-QA R6, item 3) fui eu. A intenção era a **ordem de desenho** e o **tom**: o pé de trás nunca é desenhado por cima do de perto e é sempre mais escuro, porque esse é o defeito típico das gerações. Pela leitura literal da posição, o pé de trás nunca poderia liderar, e a E viraria arrasto de um pé só. **Não refaça a E por esse motivo.** No q4 o pé de trás vai à frente porque é ele quem pousa, e isso está certo | — |

**O pé de trás da E deve ser refeito? Não.** A trajetória, a cor, a ordem de desenho e o plantio estão certos: desliza 0 px, é mais escuro e nunca fica por cima. O que precisa é de um **ajuste pontual nos q5–q6** (correção C1, abaixo), não de redesenho.

## 6. Correções gratuitas recomendadas (0 gerações, no `scripts/hawk_anim.py`)

1. **C1 · E/W q5–q6, separar os pés.** Recomendo antes do ChatGPT; é barata.
   - Subir o pé de perto **2 px**, não 3.
   - **Ou** adiantá-lo 1–2 px, para que apareçam **1–2 px da haste da perna de trás** (`o/n`) entre a barriga e o pé de trás plantado.
   - Critério de aceite: nos q5–q6 a perna de trás tem pelo menos 1 px visível acima do pé, e o deslizamento continua em 0 px.
   - O W sai pelo espelho.
2. **C2 · N, recuo de 1 px na base das penas laterais do leque** (Re-QA R3). É opcional e decidido junto com o ChatGPT. Faz a segunda perna aparecer em q1/q2/q5/q6 sem alargar o leque. Critério: a ponta central continua em y ≤ 46.
3. **C3 · Asas na S/N** (opcional): 2 px na ponta da asa nos quadros de passagem, para o movimento aparecer a 1×. Não pode ler como bater de asa.

**Condições para o build isolado** (são do game-dev, não do pacote):
- âncora fixa em (29,5; 49), sem bbox e sem trim por quadro;
- walk com atraso por espécie (`2000 / v`), testando 73 ms ao lado do Agumon;
- sombra de contato a cargo do jogo, como no Agumon F7v2.

## 7. Notas: os 8 critérios do Comando 12 §5

A régua é a mesma do QA F7v2. As notas são [H], apoiadas nas medições [E] acima.

| # | Critério | Nota | Justificativa |
|---|---|---:|---|
| 1 | Fidelidade ao Hawkmon | **8,25** | Cabeça, rosto, fivela, tira e topete idênticos à rotação v2 aprovada (0 px). Paleta P1 sem nenhuma cor nova. Pernas e pés seguem a ficha (amarelos, garras brancas, pé de trás mais escuro). Asas quase paradas a 1× |
| 2 | Qualidade GBA Plus | **8,0** | Todos os quadros com 1 componente, 0 pixels soltos e 0 semitransparentes. As pernas feitas por código são da mesma família de traço das rotações. Descontos: o bloco de pés no E q5–q6 e as pernas de 4 px, muito simples |
| 3 | Fluidez de animação | **7,75** | E/W muito boa (passada real, 0 px de deslizamento, arcos contínuos). S correta. Descontos: N com um pé em metade dos quadros, o pulinho do E q5–q6 e asas imperceptíveis a 1× |
| 4 | Consistência anatômica | **8,5** | Âncora e chão fixos, cabeça igual em 32/32, W espelho exato, topete em camada sem se soltar, massa dentro da faixa em todos os quadros, pés da N mais curtos como pedido |
| 5 | Legibilidade no jogo | **7,5** | Lê como Hawkmon andando a 1×. Sem mapa, sem velocidade real e sem sombra, não passo de 7,5 (mesma regra do F7v2) |
| 6 | Custo e tempo | **8,0** | 3 gerações de 11, piso respeitado [L, saldo não consultado pelo QA]. A primeira falha foi diagnosticada antes de gerar de novo. A N saiu sem gastar. O pipeline reproduz com 0 gerações. Desconto: 1 geração descartada |
| 7 | Transições entre animações | **8,5** | idle → walk de 279–300 px, no nível do maior passo do ciclo; walk → idle de 20–55 px. É melhor que o Agumon F7v2 em S, E e W |
| 8 | Ausência de regressões | **8,25** | Rotações v2 intactas (hashes e 0 px), idle q0 igual à rotação e 236/236 hashes OK. Desconto: a walk passa a exigir atraso por espécie no jogo, uma dependência de integração nova |
| | **Média simples** | **8,09** | (8,25 + 8,0 + 7,75 + 8,5 + 7,5 + 8,0 + 8,5 + 8,25) / 8 = 64,75 / 8. **Meta ≥ 8 atingida, com pouca folga.** Duas categorias abaixo de 8 (fluidez e legibilidade): GS-010 não |

- **Projeção [H]:** com a C1 a fluidez sobe para ~8, e a média vai a ~8,1–8,15. A legibilidade só passa de 7,5 com o build isolado sobre o mapa.
- **Segunda régua** (v13/v15 + referências do fundador): **NÃO VALIDADO**. Não reabri as referências; as notas valem só pela régua acima.
- G-1 (paleta: P1 × Endesga-32) e G-2 (escala Tamer/Digimon: Tamer 41, Hawkmon 38, Agumon S 35): **não julgados**. Ficam abertos.

## 8. Não feito / limites
- Nenhum asset alterado, nada gerado, PixelLab e saldo não consultados. O saldo e as gerações vêm do relatório [L].
- Movimento visto por amostragem em headless sem GPU. Os GIFs do game-art não foram reproduzidos na tela; conferi só a estrutura e os tempos, e eles conferem.
- Leitura sobre mapa real, com sombra de contato e na velocidade do jogo: **NÃO VALIDADO** (não há integração).
- A animação gravada na conta (`cdca6904…`, grupo `2a520357…`) não foi conferida.
- O Tamer aparece parado nas comparações do game-art, porque só existe a rotação S. Não afeta a nota.
- Tempo: dentro do teto de ~45 min.

## 9. Decisões do fundador / ChatGPT
1. Aceitar 2 px por quadro com atraso por espécie (recomendação do QA), ou pedir passada mais longa (o QA desaconselha).
2. Item 7: confirmo, como autor do ponto, que valia a **ordem de desenho**. Não precisa de decisão nova, a não ser que o ChatGPT queira outra coisa.
3. N: aplicar a C2 (recuo de 1 px nas penas laterais) ou aceitar um pé de cada vez.
4. Aplicar a C1 antes do envio ao ChatGPT (recomendado) ou junto com o build isolado.
5. Liberar o build isolado do game-dev com as condições do §6.
6. Continuam abertas: régua de massa, G-1 (paleta) e G-2 (escala).

## Crédito
Hawkmon é espécie oficial de Digimon (Bandai/Toei). Este é um fangame não oficial e sem licença. Os sprites são adaptação do estúdio (PixelLab como gabarito + desenho por código). Camada `private-prototype`. **Não homologado.**

## Re-QA v1b

**2026-11-15 · game-qa (Opus 5.5) · custo PixelLab: 0.** Objeto: `pacote_hawkmon_v1b/`, `RELATORIO_ETAPA2B.md` §11, `comparacao_v1b/` (listada, não reproduzida na tela), `sha256_e2b_c.txt`. Nenhum asset alterado e nada gerado; só esta seção foi acrescentada ao arquivo. Mesmas réguas e mesma legenda do QA acima.

### R1. Build [E]
- `sha256sum -c sha256_e2b_c.txt` deu **450/450 OK**. Contra o `sha256_e2b.txt` (v1), a única divergência é o `RELATORIO_ETAPA2B.md`, como o §11 declara. **O v1 está intacto.** A pasta continua fora do git (`?? ./`; HEAD do lab `f02fbab`).
- Medi com os scripts do QA, em `workspaces/game-qa/qa_scripts/c14e2b/`, rodados com `python3 -I`:
  - o `common.py` passou a aceitar `QA_PKG=pacote_hawkmon_v1b` (o padrão continua sendo o v1);
  - são novos o `asa_leque.py` e o `mkpage_v1b.py`;
  - a saída fica em `medicoes_e2b_v1b_qa.json`.
  
  Capturas em `workspaces/game-qa/tmp_c14e2b/v1b/`.

### R2. Métricas refeitas [E]
**Todos os números do §11.3 conferem com a minha medição:**

| Medida | v1b |
|---|---|
| Área walk S | 467, 470, 482, 491 ×2 |
| Área walk N | 483, 486, 489, 497 ×2 |
| Área walk E/W | 461, 461, 473, 475, 467, 454, 457, 463 |
| ÷ Agumon S | 0,780–0,854 |
| Paleta e pixels | 0 fora da P1 · 0 semitransparentes · 1 componente · 0 pixels soltos em 56/56 quadros |
| Última linha | 49; E/W 48 nos q4–q7 |
| W = espelho de E | 0 px |
| Idle q0 e q5 = rotação | 0 px |
| Rotações = v2 em (+6, +7) | 0 px |
| Cabeça | 0 px diferentes em 32/32 quadros da walk |

**Transições** (idle→walk / walk→idle; dentro do ciclo, média e máximo):

| Dir. | v1b | v1 |
|---|---|---|
| S | 300 / 40; ciclo 158 / 317 | 300 / 28 |
| N | 269 / 44; ciclo 144 / 288 | 279 / 20 |
| E/W | 290 / 55; ciclo 172 / 294 | igual |

### R3. As 3 correções

| | Critério de aceite (§6) | Medição do QA | Status |
|---|---|---|---|
| **C1** E/W q5–q6 | ≥ 1 px da perna de trás visível e deslizamento 0 | 1 px de `o` à vista em cada quadro: q5 em (x 33, y 43), logo abaixo da barriga; q6 em (x 31, y 46), à esquerda do pé levantado. Deslizamento de 0 px: o pé de perto fica em x de mundo 32/39 nos q0–q3, e o de trás em 46 nos q4–q6 | **Cumprido pelo mínimo** [E] |
| **C2** N | ponta central em y ≤ 46; segunda perna em q1/q2/q5/q6 | Base das penas laterais na walk: **43** (44 nos contatos q0/q4). Na idle e na rotação: **44** (45 na idle q1/q2). Ponta central em y = 46 nos 8 quadros. O segundo pé aparece em 8/8 quadros (`dump walk N`: toco `kyok` / `kyyok` nos q1, q2, q5 e q6) | **Cumprido** [E] |
| **C3** asas S/N | 2 px na passagem, sem ler como bater de asa | Ponta `h` (esquerda, direita) nos q0–q7: (44,44) (43,44) (43,**45**) (43,44) (44,44) (44,43) (**45**,43) (44,43). A asa do lado que avança desce 1, 2, 1 px; a outra fica parada | **Cumprido** [E]. Não lê como bater de asa [H] |

### R4. As três perguntas do brief

**1. O pé da frente na E/W ainda dá "pulinho"? Sim, praticamente igual ao v1.** [E/H]
- [E] A subida não mudou: o pé de perto vai às linhas 44–46 nos q5–q6 (3 px), com o contorno inferior encostado no topo do pé de trás plantado (linha 47). O "bloco amarelo sobre toco marrom" continua. A diferença é que ele fica desencontrado 1 px, para trás no q5 e para a frente no q6, deixando 1 px marrom à vista.
- [E] Trajetória horizontal da garra da frente, no mundo: v1 39 → 42 → 46 → 50 → 53 → 55 (passos 3, 4, 4, 3, 2); **v1b 39 → 42 → 45 → 51 → 53 → 55 (passos 3, 3, 6, 2, 2)**. O pé no ar faz um passo de 6 px entre o q5 e o q6, o dobro da velocidade dos quadros vizinhos. No v1 a curva era suave.
- [H] Em movimento (`cap/`, `pernasE_v1_v1b_q0_7.png` a 4×):
  - a 4×, o v1b troca o "pulinho vertical" do v1 por um "pulinho vertical + pequeno arranque para a frente" no q6. É perceptível, mas não pior que o v1: no q6 o pé avança para onde deveria estar;
  - a 1× (`walk1x_all.png`), v1 e v1b são **indistinguíveis**.
- **Conclusão:** a C1 cumpre o critério que eu escrevi, mas não resolve a percepção. Ganho perto de zero, sem regressão relevante. Severidade **P3**, a mesma do v1.
- [H] Se for corrigir de verdade, o caminho é o que o game-art aponta no §11.4: redesenhar o pé levantado, mais curto e com os dedos recolhidos, para ele não cobrir o de trás. Também dá para redistribuir os 6 px para algo como 3, 4, 4, 3, 2. Não recomendo fazer isso antes do build isolado: o jogo, na velocidade real, decide se vale a pena.

**2. O leque N fica 1 px mais curto na walk que na rotação?** [E/H]
- [E] Sim. As penas laterais terminam em y = 43 na walk e em 44 na rotação e na idle, cerca de 4 px de vermelho por lado. Ao entrar na walk e ao parar, a borda inferior das penas laterais "salta" 1 px.
- [H] Isso não se vê a 1×: o salto coincide com a troca de pose das pernas, que muda muito mais pixels. A 4× só se nota olhando para a borda. É uma inconsistência anatômica pequena, **P3**. Não justifica mexer na rotação N v2 aprovada agora. Recomendo aceitar e registrar; se a rotação N for retocada no futuro por outro motivo, igualar então.

**3. A saída da walk ficou maior?** [E/H]
- [E] Sim: S 28 → 40 px e N 20 → 44 px; E/W igual (55). Ainda bem abaixo do Agumon F7v2 (187 / 321 / 373) e do menor passo dentro do próprio ciclo.
- [H] A causa é a asa ainda 1 px baixa no q7 e, na N, o leque que volta a crescer 1 px. Em movimento, a parada continua assentando sem tropeço (`ciclo v1b x1/x2`). **Não é problema.**

**Movimento** [E/H]. A página `tmp_c14e2b/v1b/page.html` mostra:
- walk v1 | v1b nas 4 direções, a 1× e a 4×;
- o ciclo idle → walk → idle do v1 e do v1b;
- a pista E a 4× (v1 contra v1b) e a 1× (v1, v1b, v1b a 73 ms e Agumon a 3 px).

Resultado da captura: **180/180 imagens carregadas, 0 erros de console**, 24 quadros em tempo real e 32 em tempo fixo (passo de 55 ms). Ambiente headless sem GPU, leitura indicativa e por amostragem.
- **N:** é a melhoria mais visível do pacote. A 4× os dois pés aparecem em todos os quadros (`walkN_v1_v1b.png`), e a 1× o "um pé só sob a saia" deixa de existir.
- **Asas S/N:** a 4× nota-se a ponta descendo na passagem. A 1×, continua quase imperceptível.

### R5. v1 ou v1b? **v1b.** [H]
- **A favor:** a C2 é ganho real e visível na N, que era a direção mais pobre do v1. A C3 é neutra a levemente positiva. Nenhuma métrica piorou de forma relevante.
- **Contra, tudo P3:** a C1 não resolve o pulinho e cria uma curva irregular (3, 3, 6, 2, 2); o leque da walk N fica 1 px mais curto; a saída da walk ficou um pouco maior. Nada disso supera o ganho da N.

### R6. Notas atualizadas (8 critérios do C12 §5, mesma régua) [H sobre E]

| # | Critério | v1 | **v1b** | Motivo da mudança |
|---|---|---:|---:|---|
| 1 | Fidelidade ao Hawkmon | 8,25 | **8,25** | Igual: as asas continuam pouco visíveis a 1× |
| 2 | Qualidade GBA Plus | 8,0 | **8,0** | Igual: o bloco de pés do E q5–q6 continua |
| 3 | Fluidez | 7,75 | **8,0** | +0,25 pela N com os dois pés em 8/8. Não sobe mais: o pulinho da E/W fica e a curva 3, 3, 6, 2, 2 é menos suave que a do v1 |
| 4 | Consistência anatômica | 8,5 | **8,5** | A perna da N fica mais coerente, mas o leque da walk é 1 px mais curto que o da rotação: os dois efeitos se compensam |
| 5 | Legibilidade | 7,5 | **7,5** | Teto sem mapa (mesma regra) |
| 6 | Custo e tempo | 8,0 | **8,0** | 0 gerações na E2b-c |
| 7 | Transições | 8,5 | **8,25** | −0,25: a saída cresceu (S 40, N 44) e o leque da N salta 1 px ao entrar e ao sair. Continua melhor que o Agumon F7v2 |
| 8 | Ausência de regressões | 8,25 | **8,25** | v1 e rotações intactos (450/450, 0 px) |
| | **Média** | 8,09 | **8,09** | 64,75 / 8. **Meta ≥ 8: sim, com pouca folga. GS-010: não** (legibilidade 7,5) |

A média não mudou: a melhora na fluidez compensa a pequena perda nas transições. O v1b é melhor na direção mais fraca (N), e a régua não pune isso.
- Segunda régua (v13/v15 + referências do fundador): **NÃO VALIDADO**.
- G-1 e G-2 seguem abertos e não julgados.

### R7. Pronto?
- **Para o ChatGPT: sim.** Vai o v1b como candidato, com este QA e com o v1 como alternativa documentada.
- **Para o build isolado: sim**, com as mesmas condições do §6:
  - âncora fixa em (29,5; 49), sem bbox e sem trim por quadro;
  - atraso por espécie `2000 / v`, testando 73 ms ao lado do Agumon;
  - sombra a cargo do jogo.
  
  No build, olhar especificamente:
  - o E/W q5–q6 na velocidade real (pulinho e arranque);
  - a S/N em deslocamento lento ("marcha no lugar").

### R8. Não feito / limites
- Os GIFs do `comparacao_v1b/` não foram reproduzidos nem medidos. Usei a minha própria página com os PNG do pacote.
- Não houve leitura em jogo nem sobre mapa: **NÃO VALIDADO**.
- Não foi consultado PixelLab nem saldo.
- Tempo: dentro do teto de ~25 min.

### R9. Decisões do fundador / ChatGPT
1. Adotar o v1b (recomendação do QA) ou ficar com o v1.
2. N: aceitar o leque da walk 1 px mais curto (recomendação) ou retocar a rotação N v2 e a idle.
3. E/W q5–q6: aceitar até o build isolado (recomendação) ou pedir o redesenho do pé levantado (desenho novo, 0 gerações).
4. Continuam abertas as decisões do §9 (2 px por quadro com atraso por espécie, régua de massa, G-1 e G-2).
