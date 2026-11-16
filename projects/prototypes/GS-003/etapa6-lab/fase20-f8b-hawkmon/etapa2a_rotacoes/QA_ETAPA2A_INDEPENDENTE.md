# QA independente · C14 F8B Hawkmon · Etapa 2a (base v3 + rotações S/N/E/W)

**Data:** 2026-11-15 · **QA:** game-qa (sessão independente; não produziu nenhum asset desta pasta)
**Objeto:** `etapa6-lab/fase20-f8b-hawkmon/etapa2a_rotacoes/` (relatório do game-art: `RELATORIO_ETAPA2A.md`)
**Réguas:** Style Bible §8, critérios C1 (fidelidade e beleza) e C4 (escala e consistência), com âncoras iguais às do Re-QA v2 (`etapa1_pose_base/QA_ETAPA1_INDEPENDENTE.md`); ficha `fase19-f8a-hawkmon/03_FICHA_ANATOMICA_HAWKMON.md` §7, §9 e §11; pontos de vigilância R6 do Re-QA v2. Meta: ≥ 8.
**Legenda:** [E] executado nesta auditoria · [L] número do relatório anterior não reverificado · [H] julgamento ou hipótese · **NÃO VALIDADO** com motivo.

## 0. Build e integridade [E]
- A pasta está fora do git, sem commit (`git status`: `?? ./`). O identificador do build é o `sha256.txt`.
- `sha256sum -c sha256.txt` deu **58/58 OK**, nenhuma falha.
- Medição própria, independente das ferramentas do game-art: decodificador PNG escrito do zero em `workspaces/game-qa/qa_scripts/c14e2a/png_qa.py`, script `medir_e2a.py` e saída em `medicoes.json`, na mesma pasta. Rodei com `python3 -I` fora da pasta do projeto. Nenhum asset foi alterado, nenhum script do projeto foi executado e nada foi gerado.

## 1. Medições [E]

| Dir. | L × A | Área | Cores | Fora da P1 | Semitransp. | ÷ Agumon S (582) | ÷ Agumon na mesma direção | Topete × corpo (sobreposição) | Bbox do topete (x, linhas) |
|---|---|---|---|---|---|---|---|---|---|
| S | 20 × 38 | 492 | 24 | 0 | 0 | 0,845 | 0,845 (582) | 0 | 22–25, 5–12 |
| N | 20 × 38 | 494 | 19 | 0 | 0 | 0,849 | 0,782 (632) | 0 | 22–25, 5–12 |
| E | 23 × 38 | 454 | 22 | 0 | 0 | 0,780 | 0,713 (637) | 0 | 22–26, 5–12 |
| W | 23 × 38 | 454 | 22 | 0 | 0 | 0,780 | 0,713 (637) | 0 | 21–25, 5–12 |

- **Todos os números da tabela do §4.2 do relatório conferem.** A contagem de pixels isolados (103/65/60/60) não refiz [L].
- W é o espelho exato de E: **0 pixels diferentes**.
- A S polida é igual à referência enviada (`ref_pixellab_48x48_S.png`): **0 diferentes**. Contra a S crua, os 492 pixels visíveis são iguais. As 1812 diferenças estão só no RGB de pixels com alfa 0, sem efeito visual. A afirmação "S voltou idêntica" vale para o que se vê.
- A máscara da N difere da máscara da S em só **6 px**: a silhueta de costas é praticamente a de frente.
- A N não tem azul de olho (`E`/`e` = 0) nem fivela (`S` = 0). Os 5 px de `Y` são da ponta do topete e dos pés. **Sem rosto confirmado.**
- Linha dos pés 42, topete nas linhas 5–12, cabeça nas 13–24 nas quatro direções: **altura de cabeça constante** (ficha §9.8).

## 2. Base v3 (S)

| Ponto | Resultado | Evidência |
|---|---|---|
| Tufos não lêem mais como orelhas | **Funciona** [E/H]. As duas pontas no topo sumiram. Na silhueta, a cabeça tem cantos cortados e uma ponta de 2 px de cada lado na linha da faixa. Leio "penas laterais", não orelhas nem chifres. | `base_v3/silhuetas_v2_v3_cand00_agumon_4x.png`; grade S, linha 12: `kWWk…kWWk` |
| Vão entre perna e ponta da asa | **Funciona** [E]. Na linha 31 da grade há 1 px vazio entre a asa (`khkk`) e a perna (`kyyk`); a partir da 32 o vão é de 3 px ou mais. | `rotacoes_polidas/S_grade.txt`, linhas 31–32 |
| Nuance | [E] A ficha (§4.1) põe os tufos "acima da faixa"; a v3 os pôs no meio da faixa, como eu recomendei no Re-QA v2 ("na altura da faixa ou logo abaixo"). A 38 px a diferença é de 1–2 linhas e não muda a leitura. **Não é defeito.** | ficha §4.1 |

A base v3 resolve o P2 da cabeça-caixa com orelhas, o defeito principal do Re-QA v2. A cabeça continua de lados retos, mas sem as pontas no topo ela não lê mais como capacete.

## 3. Por direção, a 1× e a 4×

### 3.1 Checklist da ficha (§11) e vigilância R6

| Item | S | N | E / W |
|---|---|---|---|
| Bico com gancho de lado | sugerido (de frente basta) | não se aplica | **Parcial** [E/H]: a ponta desce 1 px (`oooy` sobre `konk`, linhas 18–19). Lê como bico de ave a 4×; a 1× é um bico curto e amarelo, sem gancho legível. Projeta ~2–3 px à frente da faixa, contra ~1/4 da cabeça (3–4 px) na ficha §4.2 |
| Faixa com fivela que não vira óculos | ✔ fivela clara no centro | ✔ faixa dando a volta, sem fivela | ✔ 1 coluna `S/S/s` na ponta da faixa, acima do bico e longe do olho. Não lê como lente |
| 3 pontas escuras por asa | ✔ | ✔ (`kGkGkGk`, linhas 29–30) | **Parcial**: as 3 existem (1 para trás, 2 para baixo), mas o conjunto lê como um bloco cinza para trás (§5.1) |
| Topete separado e alinhado | ✔ sobreposição 0, centrado | ✔ idem | ✔ sobreposição 0; base sobre o alto da cabeça, ponta inclinada 1 px para trás |
| Olho não some, expressão neutra | ✔ | não se aplica | ✔ olho 3×3 logo abaixo da faixa, com brilho; sem azul escorrendo |
| V vermelho e traço na bochecha | ✔ | não se aplica | ✔ 2 px de V no alto da frente; 3 px de traço atrás do olho |
| Tufos | ✔ laterais | ✔ laterais | ✔ 2–3 px para trás da nuca, na faixa |
| Costas sem rosto | — | ✔ (§1) | — |
| Tira da faixa na nuca (§7) | — | ✔ | — |
| Penas das costas e leque da cauda (§7, §11.3) | — | **Parcial / Ausente**: sem penas das costas em pontas; a cauda é um toco escuro de 4 px entre as pernas (`qrrq`) | **Ausente**: não há cauda vermelha atrás (ficha §7: "cauda curta atrás"); quem ocupa o lugar dela é a asa |
| Pés amarelos com garras brancas | ✔ 2 pés | ✔ | ✔ 1 pé com garra na frente e atrás; a perna de trás é uma haste de 1 px sem pé |
| Paleta P1 | ✔ 24 cores, 0 fora | ✔ 19, 0 fora | ✔ 22, 0 fora |
| Lista negativa (óculos, barriga clara, penas pretas no corpo, dentes) | ✔ nada | ✔ nada | ✔ nada |

### 3.2 Leitura a 1× [H]
Fontes: `prancha/prancha_4direcoes_hawkmon_agumon_tamer_1x.png` e `_4x.png`.
- **S:** lê como Hawkmon, como no Re-QA v2.
- **N:** lê como costas: cabeça branca com faixa preta, sem bico amarelo, topete no alto. Há um risco pequeno: com a silhueta igual à da S, a 1× pode ler como "S de venda nos olhos". O que segura a leitura é a falta de bico e de azul.
- **E/W:** lê como ave de perfil: bico à frente, olho azul, topete para trás. O bloco cinza embaixo e atrás lê como **cauda ou saia** (§5.1).

### 3.3 Consistência entre direções [E/H]
- [E] Altura total, cabeça, topete e linha dos pés são iguais nas quatro. O topete é a mesma camada (S = N byte a byte), e em E/W é a mesma pena inclinada.
- [H] A densidade cai do S (24 cores) para E/W (22) e para N (19). A N, sem o rosto, fica visivelmente mais pobre que as outras três (§5.4).
- [H] O traço, o contorno `k` e o volume do vermelho são do mesmo pacote nas quatro, e combinam com o Agumon F7v2 lado a lado.

## 4. Massa por direção: qual régua usar

**Proposta [H]: usar o Agumon S (582) como régua única de massa da espécie e acrescentar uma conferência interna.**
1. **Régua externa:** área da direção ÷ 582. Faixa de 0,80–0,90 para S e N. Para E e W, **0,75–0,90**.
2. **Conferência interna:** área da direção ÷ área da própria S ≥ 0,90, para o personagem não "encolher" ao virar.

**Por que não usar o Agumon da mesma direção** [E/H]:
- [E] O próprio Agumon muda de massa ao girar: E 637 ÷ S 582 = **1,09** e N 632 ÷ 582 = 1,09. A largura vai de 22 para 36 px em E.
- [H] Esse ganho vem quase todo da cauda longa de réptil. A razão "mesma direção" passa a medir diferença de anatomia (Agumon tem cauda grande, Hawkmon não), e não presença em tela. Isso puniria toda espécie sem cauda e premiaria as de cauda longa.
- [H] O que o jogador percebe ao trocar de direção é se **o mesmo bicho** mudou de tamanho. A conferência interna mede justamente isso.

**E/W a 0,78: aceitável** [H].
- 0,78 está dentro da faixa lateral proposta.
- A conferência interna dá 454 ÷ 492 = **0,92**: o Hawkmon perde 8% de área ao virar de lado, o que é coerente com uma ave de perfil.
- **Não peço inflar o corpo.** A correção gratuita da cauda em E/W (§6, item 1) devolve uns 8–12 px por motivo anatômico e deve levar E/W para ~0,80 sem mexer no desenho [H, estimativa].

**Ressalva:** a faixa 0,80–0,90 vem da opção A de escala, e a escala Tamer/Digimon (G-2) segue em **conflito aberto**. Esta é uma proposta de convenção de medição, **não** uma decisão de escala. Quem decide é o fundador.

## 5. Problemas apontados pelo game-art

| # | Problema | Veredito | Sev. | Evidência |
|---|---|---|---|---|
| 5.1 | Asa em E/W lendo como cauda | **Confirmado** [E/H]. As pontas cinza saem 5–6 px para trás do corpo, na horizontal (grade E, linhas 27–30, colunas 0–11). Na silhueta 4× formam um triângulo atrás e embaixo, igual a uma cauda ou saia. Some a isso que a cauda verdadeira (vermelha, curta, ficha §7) não existe em E/W. A ficha pede a asa de cá **cobrindo o flanco**, com as pontas **para baixo e para trás**. | **P2** | `prancha/silhuetas_hawkmon_agumon_SNEW_4x.png`; `E_grade.txt` |
| 5.2 | Perna de trás em E/W | **Confirmado** [E]. É uma haste de 1 px (`o`), sem pé. Aceitável na pose parada. Na walk o pé de trás tem de existir em metade dos quadros; se a rotação base não tiver o pé, a geração vai inventá-lo ou deixá-lo de fora. | **P3** agora, **P2** para a walk | `E_grade.txt`, linhas 31–36 |
| 5.3 | Cauda na N | **Confirmado** [E]. Toco `qrrq` de 4 px, vermelho escuro sobre vermelho, entre as pernas. A 1× não aparece. A ficha (§7, §4.10) diz que de costas a cauda é **dominante**. | **P2** | `N_grade.txt`, linhas 29–31 |
| 5.4 | N chapada | **Confirmado** [E/H]. 104 px de `W` (21% da área) contra 62 na S. A cabeça de costas tem 5 linhas brancas lisas abaixo da faixa, só com `w` na borda: um bloco branco. Faltam também as penas das costas em pontas sobrepostas (ficha §7). | **P3** | `N_composto_4x.png`; contagem por cor em `medicoes.json` |
| 5.5 | Topete estreito × pena larga | Ver abaixo | decisão | `cru_x_polido_SNEW_4x.png` |

**5.5 Topete** [E/H]. Recomendo **manter o topete estreito** da base.
- O topete é camada separada e projétil da Feather Slash (ficha §4.5). A mesma pena em todas as direções facilita a animação e o ataque.
- A ficha propõe 2–3 px de largura [I]. A pena de 6 px do PixelLab sai disso e muda a silhueta só em E/W, quebrando a consistência entre direções.
- O lado bom do cru é que a pena larga lê melhor como pena de perfil. Se quiserem esse ganho, há um meio-termo gratuito: em E/W, alargar o miolo para 3 px com a curva para trás, sem passar de 3.
- **Decisão de design: fundador.** A recomendação do QA é estreito, 2–3 px.

## 6. Pode seguir para walk e idle?

**Sim, com condição: aplicar antes as correções gratuitas 1 e 2.** Toda walk e toda idle herdam a rotação base, e corrigir depois custa gerações. Depois delas basta conferir a silhueta 4× e a prancha 1×; não precisa de re-QA completo.

Correções gratuitas, à mão nas grades de `scripts/polir.py`, 0 gerações:
1. **(P2) E/W, asa e cauda.**
   - Recolher a asa sobre o flanco: tirar 2–3 px da extensão horizontal para trás e girar as 3 pontas para baixo e para trás (cerca de 45°), terminando na altura do quadril.
   - Acrescentar uma cauda vermelha curta (2–4 px, 2–3 pontas em `R/r/q`) saindo atrás, acima das pontas da asa.
   - Resultado esperado [H]: a silhueta deixa de ter o "rabo cinza" e a massa sobe para ~0,80.
2. **(P2) N, leque da cauda.** Abrir o toco em um leque de 3 pontas vermelhas (`R/r` com contorno `k`) que apareça abaixo da linha do corpo, entre as pernas e atrás delas. Isso também quebra a igualdade de silhueta com a S.
3. **(P3) E/W, pé de trás.** Desenhar 2–3 px de pé (`o/n`, mais escuros) atrás do pé da frente, para a walk partir de duas pernas completas.
4. **(P3) N, nuca.** Sem cor nova, aplicar `w` nas 2 linhas de baixo da cabeça e 1–2 marcas `w`/`v` sugerindo penas da nuca; opcionalmente, pontas sobrepostas nas costas, abaixo da gola. Isso tira o bloco chapado.
5. **(opcional) E/W, bico.** Avançar 1 px a ponta do bico, chegando a ~3–4 px de projeção (ficha §4.2), e manter a ponta descendo.

Vigilância para a walk e a idle (continua o R6 do Re-QA v2):
- as pontas das asas não podem se fundir com as pernas, e as asas não podem ficar paradas enquanto as pernas andam;
- o topete balança no máximo 1 px e nunca se solta;
- os 2 pés amarelos com garras ficam no chão em todos os quadros;
- a fivela fica visível na S, a tira na N, e a cabeça não muda de tamanho;
- tudo em P1, com 0 semitransparentes (medir cada quadro).

## 7. Nota

| Direção | C1 Fidelidade e beleza | C4 Escala e consistência | Média | Por quê [H] |
|---|---|---|---|---|
| S | **8,5** | **8** | 8,25 | Os tufos foram resolvidos e o vão entre perna e asa existe. Continua menos densa que o Agumon (24 cores contra 59). |
| N | **7,5** | **8** | 7,75 | Costas corretas: sem rosto, faixa dando a volta, 3 pontas, tufos. Cabeça chapada, falta o leque da cauda (ficha: dominante de costas) e falta penas das costas. |
| E | **7,5** | **7,5** | 7,5 | Bico, olho, fivela, topete e tufos certos. A asa lê como cauda, a cauda verdadeira não existe, a perna de trás é só haste e a massa fica em 0,78. |
| W | **7,5** | **7,5** | 7,5 | Espelho exato de E, com os mesmos méritos e defeitos. |
| **Conjunto** | **7,75** | **7,75** | **7,75** | **Meta ≥ 8 não atingida, por pouco.** |

- **Projeção [H]:** com as correções 1 e 2 aplicadas, E/W e N sobem para ~8 e o conjunto fica em **≥ 8**. A confirmação é a conferência rápida da silhueta.
- **Segunda régua** (referência aprovada v13/v15 + refs do fundador): **NÃO VALIDADO** nesta etapa. Não reabri as referências; a nota acima é só pela régua do Style Bible.

## 8. Não feito / limites
- Nenhum asset alterado, nada gerado, nenhuma correção aplicada.
- Leitura no jogo, sobre cenário real, com sombra de contato e em movimento: **NÃO VALIDADO** (não há integração).
- Pixels isolados: não recontei [L].
- Personagem na conta PixelLab (`cdca6904-…`) e saldo: não conferi, porque o QA não consulta a conta.
- G-1 (Endesga-32 × P1) e G-2 (escala Tamer/Digimon): **não julgados**. Tudo está em P1, o que não é declaração de conformidade com nenhum dos lados.
- Tempo: dentro do teto de ~40 min.

## 9. Decisões do fundador
1. Régua de massa por direção: a proposta do §4 (Agumon S + conferência interna ≥ 0,90, com faixa lateral de 0,75–0,90) ou "Agumon da mesma direção".
2. Aceitar E/W em 0,78. O QA recomenda **aceitar** e não inflar, deixando a cauda da correção 1 completar a massa.
3. Topete em E/W: estreito (recomendado), meio-termo de 3 px, ou pena larga.
4. Liberar walk e idle depois das correções 1 e 2, com conferência rápida da silhueta.

## Crédito
Hawkmon é espécie oficial de Digimon. Este é um fangame não oficial e sem licença. Os sprites avaliados são adaptação do estúdio (PixelLab + edição manual). Camada `private-prototype`. **Não homologado.**

---

## Re-QA v2 (conferência rápida das correções E2a-b) · 2026-11-15

**QA:** game-qa, sessão independente, que não produziu a v2. **Objeto:** `rotacoes_polidas_v2/`, `prancha_v2/`, a seção "Correções E2a-b" do `RELATORIO_ETAPA2A.md` e `sha256_e2ab.txt`. **Réguas:** as mesmas do §0 deste documento (Style Bible §8 C1/C4 e a ficha §7/§9/§11). Meta: ≥ 8. **Tempo:** ~20 min, dentro do teto.

### R0. Integridade [E]
- `sha256sum -c sha256_e2ab.txt`: **todos OK**. `sha256sum -c sha256.txt` (v1): **todos OK**, e a v1 continua intacta. A pasta segue fora do git (`?? ./`).
- Medição própria em `workspaces/game-qa/qa_scripts/c14e2a/medir_e2ab_v2.py`, que reutiliza o decodificador `png_qa.py`. Rodei com `python3 -I`, e a saída está em `medicoes_v2.json`, na mesma pasta. Não executei nenhum script do projeto, não alterei nenhum asset e não gerei nada.

| Dir. | L × A | Área | Cores | Fora da P1 | Semitransp. | ÷ Agumon S | ÷ própria S | Topete × corpo | Px mudados contra a v1 | Topete = v1 | Linha dos pés |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S | 20 × 38 | 492 | 24 | 0 | 0 | 0,845 | 1,000 | 0 | 0 | sim | 42 |
| N | 20 × 38 | 500 | 19 | 0 | 0 | 0,859 | 1,016 | 0 | 80 | sim | 42 |
| E | 24 × 38 | 466 | 23 | 0 | 0 | 0,801 | 0,947 | 0 | 54 | sim | 42 |
| W | 24 × 38 | 466 | 23 | 0 | 0 | 0,801 | 0,947 | 0 | 54 | sim | 42 |

- **Todos os números da tabela §B do relatório conferem.** W é o espelho exato de E (**0 px diferentes**). A máscara da N difere da máscara da S em **16 px** (eram 6). A N tem 96 px de `W`, contra 104 na v1 e 62 na S.
- E/W fica em 0,80 do Agumon S e em 0,947 da própria S. Passa na faixa lateral (0,75–0,90) e na conferência interna (≥ 0,90) propostas no §4, **sem o corpo ter sido inflado**.

### R1. Correções 1 a 5
| # | Pedido | Status | Evidência |
|---|---|---|---|
| 1 | E/W: asa recolhida e cauda vermelha | **Funciona** [E/H] | [E] Na `E_grade.txt` não há mais o bloco `GGgG` horizontal. As pontas escuras (`kGkGkGGk` + `h`) estão nas linhas 35–36 do canvas, debaixo do flanco. A cauda `R/r/q`, com 2 pontas, ocupa as linhas 31–34, acima delas. [H] Na `silhuetas_v1_x_v2_SNEW_4x.png` o triângulo "saia" sumiu: a silhueta fica com uma ponta curta de cauda atrás e entalhes pequenos embaixo. Lê como ave. |
| 2 | N: leque de 3 pontas | **Parcial** [E/H] | [E] Leque de 10 px, com a pena central indo até a linha 39 e as laterais até a 37. A máscara quebrou a igualdade com a S (6 → 16 px). [H] Com cor, a 4×, aparecem as 3 penas. Na silhueta só a ponta central se destaca, e o vão entre as pernas da v1 foi preenchido. Ver R3. |
| 3 | E/W: pé de trás | **Funciona** [E] | `oonc` na linha 39 da grade E: pé mais escuro com garra `c`, atrás e acima do pé de perto. A haste de 1 px agora termina em pé. |
| 4 | N: nuca | **Funciona** [E/H] | [E] `w`/`v` nas 2 linhas de baixo da cabeça e zigue-zague `q/k` nas costas; o `W` caiu de 104 para 96. [H] A cabeça deixou de ser um bloco branco liso. A N continua com 19 cores, menos densa que a S, mas o defeito do §5.4 foi resolvido. |
| 5 | E/W: bico | **Funciona** [E] | Largura de 23 para 24; o gancho desce na última coluna. |

### R2. Silhueta a 4× e prancha a 1× [H]
- **Silhueta 4×** (`silhuetas_v1_x_v2_SNEW_4x.png`, `silhuetas_v2_hawkmon_agumon_SNEW_4x.png`)
  - **S:** sem mudança.
  - **E/W:** a melhor mudança da rodada. A massa está atrás do corpo, na altura certa, e não há mais "rabo cinza". Ao lado do Agumon (cauda longa), o Hawkmon lê como uma espécie diferente, mais compacta e de cauda curta, o que está certo para ele.
  - **N:** a parte de baixo virou um trapézio contínuo com uma ponta no meio. As pernas só se separam nos pés.
- **Prancha 1×** (`prancha_v2_4direcoes_hawkmon_agumon_tamer_1x.png`)
  - As quatro direções leem como o mesmo bicho, com escala coerente com o Agumon e o Tamer. G-2 continua aberto e não foi julgado.
  - E/W: a cauda vermelha aparece como um ponto vermelho atrás, e a ave de perfil lê melhor que na v1.
  - N: lê como costas: sem bico, faixa, topete. A parte de baixo lê como "saia vermelha".

### R3. Ressalva da N (leque = "saia"): **aceito, sem pedir para abrir as pontas** [H]
- Concordo com o diagnóstico do game-art. Abrir as laterais para fora da linha das pernas encosta nas pontas das asas e fecha o vão asa/perna, que é a melhor qualidade de silhueta da S/N. Trocaria um defeito pequeno por um maior.
- O ganho pedido no §6, item 2 (quebrar a igualdade com a S e ter cauda presente de costas), foi obtido: 16 px de diferença e a ponta central visível na silhueta. A leitura "saia" a 1× é o risco que fica, e é **P3**.
- **Ajuste opcional e gratuito, sem bloquear:** recuar 1 px a base das penas laterais, para que 1 linha de vão apareça entre o leque e o alto de cada perna. Isso devolve a separação das pernas na silhueta sem alargar o leque. Fazer **só se** couber quando a walk N for montada, porque lá as pernas vão precisar se mover atrás ou à frente do leque de qualquer forma.

### R4. Pontas escuras da asa em E/W a 1× [H]
- Confirmo a limitação §C.3: a 1× as 3 pontas leem como **uma sombra cinza** sob o flanco, não como 3 penas.
- **Aceito como está (P3).** A 1× o que importa é que haja asa (cinza) separada de cauda (vermelha) e de perna (amarela), e isso está garantido. Três penas individuais em 1–2 px não leriam em nenhuma solução nesse tamanho. Não peço retrabalho.

### R5. Nota
| Direção | C1 | C4 | Média | Por quê [H] |
|---|---|---|---|---|
| S | 8,5 | 8 | **8,25** | Sem mudança (0 px). |
| N | 8 | 8 | **8,0** | A nuca resolvida e a cauda presente tiram o 7,5. O leque lê como "saia" a 1× e a N fica abaixo da S em densidade (19 contra 24 cores). |
| E | 8 | 8 | **8,0** | A asa voltou para o flanco, a cauda verdadeira existe, a perna termina em pé e a massa está em 0,80 sem inflar. As pontas da asa leem como sombra a 1×. |
| W | 8 | 8 | **8,0** | Espelho exato de E. |
| **Conjunto** | **8,1** | **8,0** | **8,06** | **Meta ≥ 8 atingida, com pouca folga.** |

- Segunda régua (v13/v15 + referências do fundador): **NÃO VALIDADO**, como na rodada anterior. A nota acima é só pela régua do Style Bible.

### R6. Pode seguir para walk e idle?
**Sim, pelo lado do QA** [H]. As condições do §6 (correções 1 e 2) foram cumpridas e as 3, 4 e 5 também. **A liberação é decisão do fundador** (§9, item 4), e as decisões §9, itens 1 a 3, continuam abertas.

Pontos de atenção para a walk (somam-se à vigilância do §6):
1. **N, leque × pernas:** as pernas ficam por cima do alto da cauda na pose parada. Na walk, a perna que avança não pode "cortar" o leque nem fazê-lo sumir. O leque fica parado ou balança no máximo 1 px; a ponta central nunca toca o chão (linha 39, linha dos pés 42).
2. **N, pés 1 px mais curtos por dentro que na S** (§C.4): manter isso em todos os quadros da N, ou a ponta central da cauda funde com os pés.
3. **E/W, pé de trás:** tem de aparecer nos quadros de passada, sempre mais escuro (`o/n`) que o de perto, e nunca à frente do pé de perto no quadro de contato.
4. **E/W, pontas da asa** (linhas 35–36) **ficam acima e atrás das pernas.** Com o pé de trás levantando, a ponta `h` não pode encostar nele: manter ≥ 1 px de vão ou contorno `k` entre eles.
5. **E/W, cauda vermelha:** fica atrás e acima das pontas da asa em todos os quadros. Se a geração trocar a ordem (asa por cima da cauda), a leitura "rabo cinza" volta.
6. **Massa por quadro:** medir a área de cada quadro. Faixa prática [H]: S/N 0,80–0,90 e E/W 0,75–0,90 do Agumon S, e conferência interna ≥ 0,90 da S na mesma fase da passada.
7. **Topete:** mesma camada, oscilação de no máximo 1 px, sobreposição 0 com o corpo. Tudo em P1 com 0 semitransparentes, medido por quadro.

### R7. Não feito / limites
- Nenhum asset alterado, nada gerado, PixelLab não consultado.
- As cópias das pranchas, feitas só para visualização, ficaram em `workspaces/game-qa/tmp_view_c14v2/`. Não foram para a pasta do projeto.
- Leitura em jogo, sobre cenário real e em movimento: **NÃO VALIDADO** (não há integração).
- G-1 (paleta) e G-2 (escala): **não julgados**.

**Decisões do fundador:** (a) as 4 do §9, que seguem abertas; (b) N: aceitar o leque como está (recomendação do QA) ou abrir as pontas laterais (o QA desaconselha); (c) liberar walk e idle.
