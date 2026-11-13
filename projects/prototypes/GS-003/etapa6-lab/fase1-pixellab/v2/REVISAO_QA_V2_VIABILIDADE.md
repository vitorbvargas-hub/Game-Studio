# REVISAO_QA_V2_VIABILIDADE — Etapa 6, Comando 4: revisão do retrabalho v2 e viabilidade do PixelLab para Digimons

- **Autor:** game-qa (subagente, Opus 5.5). Revisão **independente** · **Data:** 2026-11-13.
- **Objeto:**
  - assets v2 do `game-art` (`fase1-pixellab/v2/`) e a autoavaliação `AVALIACAO_V2.md`;
  - `CONSUMO_PIXELLAB_ETAPA6.md`, registros #11–#23.
- **Régua:**
  - C4 D7–D10 e as correções obrigatórias (`COMANDO_ETAPA6_C4_APROVACAO_RETRABALHO_CP1.md`);
  - adendo §3–§4 (`COMANDO_ETAPA6_C4_ADENDO_AGUA_VIABILIDADE.md`);
  - impeditivos do C1 §7;
  - rubrica §1.1 com o piso 8 do ADR-015;
  - 17 bloqueantes (AJUSTES §6.2);
  - minha revisão anterior (`../REVISAO_QA_CHECKPOINT1.md`).
- **Vocabulário:** "candidato", "candidato com ressalva" ou "reprovado". Nada aqui está aprovado: a homologação é do fundador.
- **Legenda:** **[E]** executado nesta revisão · **[L]** lido de relatório anterior, sem reverificação · **[H]** hipótese ou leitura perceptiva (não é parecer jurídico) · **NÃO VALIDADO** (com o motivo).
- **Identificação, sem build** (são assets PixelLab exportados):
  - Agumon v2 `46470e9c…`, 36×36, `template_id: mannequin`, walk `96fc8952…`;
  - Tamer P1 v2 `6cd24249…`, rotações em 56×56 e walk em 44×44 (walk `94d2304d…`);
  - Tamer P2 v2 `63c61b01…`, 56×56, sem walk;
  - md5 dos `south.png` extraídos: Agumon `c5d2ac24…`, P1 `3bed6b15…`, P2 `cb15c91d…`;
  - estado conferido ao vivo com `get_character` [E].
- **Ferramentas, todas sem custo de geração:**
  - `pixelart_workbench` (`inspect` a 6–12× e `score`);
  - `get_character`, `get_balance` e `search_help`;
  - `web_fetch` da Wikimon;
  - script próprio `~/projects/GameStudio/workspaces/game-qa/tools/etapa6_c4_v2/qa_v2_measure.py` (Python stdlib, reexecutável).
- **Dados e pranchas:** em `v2/qa_v2/`.
  - `medicao_qa_v2.json`: bbox por quadro, D10, pivô, amplitude de perna, perfil de cor DS × v2.
  - `qa_agumon_ds_vs_v2_8x.png`, nesta ordem: DS S oficial · v2 S · DS W oficial · v2 W. Os rótulos de texto da prancha saíram ilegíveis, porque a fonte do script não tem as letras; vale a ordem.
  - `qa_agumon_ds_battle_vs_v2.png`: pose de batalha do DS oficial × v2 SW, a 4×.
  - `qa_strip_{agumon_v2,tamer1_v2}_{south,east,north}_6x.png`: todos os quadros do walk, em sequência.
- **Referência oficial:**
  - rip DS de `CREATURE-0006` (`assets/GAME-ASSETS/01-creatures/CREATURE-0006/`, camada `official-fan-use`, Spriters Resource, `license.json` com sha256), o mesmo que já está no jogo;
  - Digimon Reference Book via Wikimon [E, 13/11]: *"Reptile Digimon… resembling a small dinosaur… fearless and rather ferocious personality. Hard, sharp claws grow from both its hands and feet"*.

---

## 0. Veredito em uma tabela

| Asset | Veredito QA | Autoavaliação do game-art | Motivo principal |
|---|---|---|---|
| **Agumon v2** (rotações) | **REPROVADO** | candidato a reavaliar, "risco baixo" | Descaracterizou a espécie: laranja, cabeça redonda, focinho curto, barriga creme, olhos grandes e "fofos", corpo humanoide e garras pequenas. Lê como Charmander, não como Agumon. Dispara o impeditivo do C1 §7 e cria **risco de confusão com Pokémon**. |
| **Walk do Agumon v2** | **REPROVADO** | candidato | Herda a espécie reprovada. Tem ainda: D10 acima de 5% no E/W; no N a vista vira perfil em 5 de 6 quadros e a cauda some; o sprite do walk é menor que o da rotação, então ele "salta" de tamanho ao começar a andar. |
| **Tamer P1 v2** (rotações) | **CANDIDATO** | candidato | Identidade original. O risco Pokémon de antes foi removido. Escala de 41–42 px no alvo D8 e 7 px de topo livre. |
| **Walk do Tamer P1 v2** | **REPROVADO como definitivo**, usável como placeholder técnico | candidato | No walk, o personagem mede **34–37 px**, contra 41–42 na rotação. Isso fica fora do D8 (40–42) e, em 2 quadros, abaixo do mínimo de 36 do D1 (bloqueante 5). O D10 do S dá **8,11%** (bloqueante). A alternância de pernas é boa. |
| **Tamer P2 v2** | **CANDIDATO COM RESSALVA** | candidato | Altura de 42 em todas as direções, original e risco baixo. Ressalvas: não tem walk, tem 52 cores, e a proporção de cabeça e o capuz diferem do P1. |

**Ponto crítico do coordenador ("o Agumon v2 perdeu a forma e parece Charmander"): CONFIRMADO, com evidência visual e medida (§1.1).** Pela regra do fundador (adendo §3), registro: **interromper as tentativas de geração textual do Agumon.**

---

## 1. Vereditos por asset

### 1.1 Agumon v2: REPROVADO

**Comparação com o oficial** (`qa_agumon_ds_vs_v2_8x.png`, `qa_agumon_ds_battle_vs_v2.png` e `../v2/comparacao_agumon_ds_v1_v2_4x.png`):

| Traço | Agumon oficial (DS e batalha DS [E]; Reference Book [E]) | Agumon v2 [E] | Situação |
|---|---|---|---|
| **Cabeça e focinho** | Cabeça **alongada**, com focinho longo e projetado para a frente e mandíbula larga com dentes visíveis. No perfil (DS W), o focinho ocupa cerca de metade do comprimento da cabeça. | Cabeça **esférica**, de "bola". O focinho é um ressalto curto e creme. No perfil (E/W), a frente da cabeça é quase reta e arredondada. | **Desvio de silhueta (assinatura)** |
| **Corpo e postura** | Corpo robusto, inclinado para a frente, braços à frente com garras abertas, pernas grossas. Postura "feroz" (Reference Book). | Postura **ereta de mascote**, torso curto, braços curtos junto ao corpo, pernas finas. Proporção de bebê ("cute mascot", "child-like proportions" estão no próprio prompt). | **Desvio de proporção** |
| **Garras** | **Grandes**, brancas, 3 por membro, bem legíveis mesmo a 27 px no DS | Pontos brancos de 1–2 px. Não dá para contar 3, nem ler como garra. | **Desvio** |
| **Cor-base** | Amarelo-alaranjado. Matiz médio da pele **42,5–45,7°** (DS mapa e batalha), saturação de 0,83 a 1,0. **Sem** barriga creme (0,0–0,1% de pixels creme). | **Laranja.** Matiz médio de **24,6–25,1°**, ou seja, cerca de 20° mais vermelho. **Barriga e focinho creme** com 6,3–10,2% dos pixels. | **Desvio de cor de assinatura** [E] (`medicao_qa_v2.json`, `agumon_ds_vs_v2`) |
| **Cauda** | Curta e grossa | Longa e afilada, apoiada no chão, curvando para cima na ponta (E/W) | **Desvio** |
| **Olhos** | Verdes, olhar "alerta e feroz" | Verdes, grandes e redondos, com sobrancelhas vermelho-escuras (`#5e1825`) | Cor confere; expressão diverge |
| **Topo da cabeça** | Liso | **Nódulo/crista residual**: saliência de 3 px de largura no alto da cabeça, com brilho creme, visível no S e **também no N** (rotação N, `inspect` 8×) | Não conformidade com "remover crista; cabeça lisa" (ver 1.1.2) |

**Bloqueantes:**
- **C1 §7, "anatomia, cores ou detalhes que descaracterizam a espécie": DISPARADO [E].** Os três eixos falham ao mesmo tempo: anatomia (cabeça, focinho, garras, postura), cores (matiz cerca de 20° fora e barriga creme inexistente no oficial) e detalhes (nódulo).
- **Rubrica §1.1 / ADR-015:** fidelidade na banda **≤ 4**: silhueta e proporção de assinatura alteradas, mais cor. Fica abaixo do piso 8.
- **Bloqueante 1 (espécie irreconhecível ou errada): DISPARADO [H].** Sem legenda, o sprite não é reconhecível como Agumon. No v1, a espécie ainda era reconhecível; no v2, não.
- **Bloqueante 2 (contorno oficial):** segue como conflito aberto (E5 × Style Bible). Não aplico.

#### 1.1.1 Risco de confusão com Pokémon: CONFIRMADO [H]

A soma de pele **laranja** + **barriga e focinho creme** + **cabeça redonda grande com focinho curto** + **olhos grandes e redondos** + **cauda longa afilada até o chão** + **postura ereta de mascote bípede** é a assinatura de silhueta e cor do **Charmander**.

O único traço de assinatura ausente é a chama na ponta da cauda. Isso **não basta** para afastar o risco: a 1×, na composição sobre a floresta, o jogador lê "Charmander sem fogo" antes de ler "Agumon".

Num fangame de "monstro digital + treinador" que **proíbe qualquer elemento de Pokémon**, esse é exatamente o risco de reputação e de propriedade intelectual que a regra quer evitar. O risco é **maior** que o do Tamer P1 v1, já reprovado por semelhança.

**A autoavaliação ("risco de confusão… baixo") olhou só espécies de Digimon e não considerou Pokémon.** Também não se sustenta a frase "barriga clara mais sutil — mais próximo do oficial": o oficial **não tem** barriga creme.

**Causa raiz [E]:** o prompt gravado em `agumon_v2_extracted/metadata.json` pede *"small orange reptile dinosaur… Smooth round bald head… Pale cream colored belly patch and snout. Large round green eyes… child-like proportions, cute dinosaur mascot design"*.

- Cada um desses termos empurra para o arquétipo "lagartinho laranja fofo".
- **Nenhum** termo pede o focinho longo, a mandíbula grande, a postura inclinada ou as garras grandes que definem o Agumon.
- Concorre também a **limitação estrutural da ferramenta** [E, `search_help create_character`]: v3 sem referência "é humanoid only", então qualquer criatura vira um bípede do template `mannequin`. Isso explica a vista N de "bola sobre corpo humano".

**Ambiguidade de brief, para o fundador:** a correção obrigatória dizia "manter cabeça **arredondada** e lisa". O pedido era "sem crista", mas a palavra "arredondada" entrou no prompt como "round head". O Agumon oficial tem o **crânio** arredondado e o **focinho longo**. Se houver nova tentativa, a redação deve ser "cabeça lisa, sem crista, **com focinho longo projetado**".

#### 1.1.2 Nódulo creme na cabeça

Ele é **crista residual**, não um detalhe neutro:
- aparece como saliência no contorno do topo da cabeça, de frente (S) e de costas (N) [E];
- descumpre a correção "remover crista… manter cabeça lisa".

Isolado, seria um defeito graduado, corrigível com 1 retoque manual no `pixelart_workbench`. Aqui ele é irrelevante para o veredito, porque a espécie já reprova pelos itens acima.

#### 1.1.3 Escala (D8) [E]

- Rotações: altura de 31–32 px e largura de 17–28 px. Ficam **1–3 px abaixo** do alvo de 33–35 × 26–29. Confere com o game-art.
- **No walk, o sprite encolhe para 28–31 px de altura.** No S, a largura cai de **24 para 13–17 px**, porque os braços somem para dentro do corpo.

### 1.2 Walk do Agumon v2: REPROVADO

**D10 recalculado [E]**, com a fórmula `100*(máx−mín)/mediana` sobre a altura do bbox opaco por quadro (6 quadros por direção, sem sombra separada):

| Direção | Alturas (px) | Mín / máx / mediana | **D10** | Pé (y), variação | Pé (x), variação |
|---|---|---|---|---|---|
| S | 28, 29, 28, 28, 29, 29 | 28 / 29 / 28,5 | **3,51%**, passa | 1 px | 4,5 px |
| E | 30, 30, 31, 31, 29, 30 | 29 / 31 / 30 | **6,67%, REPROVA** | 1 px | 5,5 px |
| N | 30 em todos | 30 / 30 / 30 | **0,00%**, passa | 0 | 3,5 px |
| W (espelho de E) | idem E | 29 / 31 / 30 | **6,67%, REPROVA** | 1 px | 5,5 px |

Os números do game-art conferem exatamente.

A variação de "pé (x)" é o deslocamento do centro da linha de apoio entre quadros. Num walk isso é esperado, porque o pé de apoio muda. Não é deriva de pivô. O pivô vertical (pé, y) é estável: 0–1 px.

**Avaliação visual** (quadros em sequência a 6×; GIFs 4× com 6 quadros a 200 ms cada, ou seja, ciclo de 1,2 s e cerca de 5 fps, conferidos por parsing do GIF):

- **S:**
  - as pernas alternam de forma legível;
  - o corpo balança de lado e a cauda aparece alternadamente à esquerda e à direita;
  - o sprite do walk é **outro desenho** em relação à rotação: mais estreito, braços recolhidos e altura 3–4 px menor. Ao passar de parado para andando, ele "encolhe" (salto de tamanho).
- **E/W:**
  - a passada existe e a alternância é clara, com 82–91% de alteração na faixa das pernas;
  - cabeça e tronco ficam quase rígidos;
  - o "respiro" de 2 px (29↔31) é o que estoura o D10;
  - não vi deformação grosseira.
- **N: falha visual.**
  - Em **5 de 6 quadros**, o olho verde aparece na lateral direita da cabeça, ou seja, a vista vira perfil ou 3/4. Só o quadro 3 é costas de verdade.
  - **A cauda some** nos 6 quadros. Na rotação N ela existe.
  - A silhueta é uma esfera sobre um corpo humanoide.
  - É inconsistência de direção e de anatomia dentro do próprio ciclo.
- **Fluidez:** 6 quadros a 5 fps é aceitável para walk de RPG GBA. O tempo final é do motor.

**Bloqueantes do walk:**
- herda o C1 §7;
- D10 E/W **disparado** (6,67% > 5%);
- inconsistência de direção no N (impeditivo "animação que prejudica a experiência", leitura [H]: o seguidor "vira de lado" ao andar para cima).

**Ponto positivo (técnico):** a troca para `template_animation_id="walking"` resolveu a amplitude de perna do v1. No S, ela foi de 32,7% para 74–84% [E]. O método serve para **humanoides**; o problema está na anatomia que ele impõe a um Digimon.

### 1.3 Tamer P1 v2: CANDIDATO

- **Originalidade [E/H]:**
  - não há boné, jaqueta azul, óculos de proteção nem a dupla vermelho+azul;
  - cabelo azul-petróleo visível, colete verde-oliva sobre camisa mostarda, calça e botas marrons, bolsa a tiracolo e pulseira ciano;
  - não encontrei correspondência forte com protagonistas de Pokémon nem de Digimon. **Risco baixo [H].**
  - Os 14 px "avermelhados" medidos pelo game-art são marrom-terracota, o que é plausível pelo `inspect`.
- **Escala [E]:** 41–42 px nas 8 direções, dentro do D8. Topo livre de 7 px em canvas de 56: atende a especificação §1.
- **Consistência entre direções [E]:** S/E/N conferidos a 6–8×. Bolsa, alça e pulseira aparecem coerentes, e a pulseira fica no pulso **direito** do personagem em S e N. A `AVALIACAO_V2` diz "esquerdo", um erro menor de texto.
- **Craft:** `score` 84,6, com 35 cores, o melhor dos três.
- **Ressalva técnica (Fase 2):** a rotação está em 56×56 e o walk em 44×44.
- **Divergência documental [E]:** o `CONSUMO` #23 diz "44×44 → **52×52**". O canvas real, ao vivo pelo `get_character`, é **56×56**, e a `AVALIACAO_V2` está certa. Cabe correção pelo autor.

### 1.4 Walk do Tamer P1 v2: REPROVADO como definitivo (usável como placeholder técnico)

| Direção | Alturas (px) | **D10** | Pé (y) | Leitura visual |
|---|---|---|---|---|
| S | 37, 37, 36, **34**, 37, 37 | **8,11%, REPROVA** | 2 px | Pernas e braços alternam bem. O quadro 3 "afunda" 3 px, um soluço perceptível no ciclo. **A pulseira ciano troca de pulso** no meio do ciclo: quadros 0–2 num braço, 4–5 no outro. |
| E | 36, 36, 35, 36, 35, 35 | 2,82%, passa | 1 px | Passada clara e boa. Mas surge uma **mochila grande nas costas** e o colete verde quase some. A rotação E mostra bolsa a tiracolo no quadril, não mochila: o walk muda o figurino. |
| N | 37, 37, 37, 36, 37, 36 | 2,70%, passa | 1 px | Boa: alça e bolsa coerentes, pernas alternando. |
| W (espelho) | idem E | 2,82%, passa | 1 px | idem E |

**Bloqueantes:**
1. **D10 no S, 8,11%: disparado** (o game-art também registrou).
2. **Escala no walk:** **34–37 px**, contra 41–42 na rotação, ou seja, o personagem **encolhe 5–7 px (12–17%)** ao andar.
   - Fica fora do alvo D8 (40–42).
   - Os quadros de 34 e 35 px ficam **abaixo do mínimo de 36 do D1**: **bloqueante 5 disparado** [E].
   - **Achado novo, não registrado na `AVALIACAO_V2`.**
   - No motor, o Tamer pulsaria de tamanho a cada início e fim de caminhada.
   - Hipótese [H]: o template `walking` redesenha o personagem menor para caber a passada no canvas de 44.

**O que funciona:**
- alternância e amplitude das pernas, com 62–91% de alteração;
- pivô vertical estável (1–2 px);
- nenhuma deformação grosseira;
- fluidez adequada para 6 quadros.

**Caminho de correção (não executado):**
- testar `animate_character(mode="skeleton-v3", template_animation_id="walking")` no S. Pelo `search_help` [E], ele "moves the character rather than redrawing it", ao preço de 2–4 gerações por direção. Medir de novo depois;
- ou aceitar o walk só como placeholder da Fase 2 e corrigir antes da homologação.

### 1.5 Tamer P2 v2: CANDIDATO COM RESSALVA

- **Medidas [E]:**
  - 42 px de altura em todas as 8 direções, com topo livre de 7 em 56×56: base de altura igual à do P1;
  - largura de 21–24 px;
  - `score` 79,0, com 52 cores.
- **Originalidade [H]:** capuz e colete amarelos, cabelo preto, luvas vermelhas, short jeans e tênis bordô. Risco baixo, sem mudança relevante em relação à revisão anterior.
- **Ressalvas:**
  1. Não tem walk; fora do escopo do R5.
  2. O capuz agora cobre o cabelo, o que altera a silhueta do P2 v1. É escolha de design para o fundador, não defeito.
  3. A cabeça é proporcionalmente maior que a do P1 [H, visual]. A "mesma base de corpo" vale na altura, não exatamente na proporção cabeça/corpo. É relevante para o sistema de camadas do Tamer personalizável.
  4. 52 cores é alto para GBA Plus. Candidato a `reduce_colors` depois da decisão de paleta.

---

## 2. Viabilidade do PixelLab para Digimons (adendo §3)

Amostra: 2 tentativas de Agumon por texto (v1 e v2), ambas com `create_character` v3 (template `mannequin`) e walk por template.

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| 1 | **Anatomia** | **FALHA** | v1: crista e listras de Greymon. v2: cabeça esférica, focinho curto, garras vestigiais, corpo humanoide. A ferramenta declara que v3 sem referência "é humanoid only" [E]. A anatomia de Digimon não humanoide fica fora do alcance por construção. |
| 2 | **Silhueta e proporções** | **FALHA** | v1 em "raptor esguio", v2 em "mascote chibi". Nenhuma das duas tem a silhueta inclinada e de focinho longo do oficial (`qa_agumon_ds_battle_vs_v2.png`). |
| 3 | **Cores e marcas** | **FALHA** | v1 inventou marcas (azuis e vermelhas). v2 deslocou o matiz em cerca de 20° (45° → 25°) e inventou barriga creme [E]. Os dois saíram do oficial em direções diferentes: o texto não ancora a cor. |
| 4 | **Consistência entre direções** | **PARCIAL** | As 8 rotações são coerentes entre si [E]. O walk diverge da rotação: no Agumon, 3–4 px menor e mais estreito; no Tamer, 5–7 px menor e com mochila. O N do Agumon vira perfil e perde a cauda. |
| 5 | **Animação** | **PARCIAL** | O template gera alternância de pernas legível (bom para humanoides). Em Digimon impõe marcha humana, encolhe o sprite e estoura o D10 em E/W. |
| 6 | **Créditos por asset aproveitável** | **FALHA** | Agumon v1 = 4 gerações (2 do personagem + 2 do walk), reprovado. Agumon v2 = 5 gerações (2 + 3), reprovado. **9 gerações, 0 asset aproveitável.** Para comparação, o Tamer: 14 gerações (P1 v1 5, P1 v2 5, P2 v1 2, P2 v2 2) para 2 candidatos de rotação (cerca de 7 por asset), com o walk ainda pendente. |

**Veredito: NÃO VIÁVEL POR TEXTO.**

- O Agumon v2 **continua alterando a identidade** (§1.1).
- **Registro, pela regra do fundador (adendo §3): interromper as tentativas de geração textual da espécie** e não iniciar produção de Digimons por texto no PixelLab.
- A rota "**viável com rota diferente**" (com sprite fiel como referência, §3 C) é **plausível pela documentação, mas NÃO VALIDADA**: nenhum teste foi feito.
- A falha é de **método** (texto mais template humanoide), não de prompt. Uma terceira tentativa por texto, com outro prompt, repetiria a loteria: as duas tentativas erraram em direções opostas.

---

## 3. Alternativas do adendo §4

Preços confirmados com `search_help`, gratuito [E]. Nenhuma alternativa fica "aprovada".

### A. Sprite existente com procedência: Agumon DS (`CREATURE-0006`)

- **Prós:**
  - fidelidade máxima (é o oficial);
  - procedência documentada: `license.json` com site, sha256, data e modificações; camada `official-fan-use` (ADR-009);
  - já está no jogo;
  - walk S/N/W, com E por espelho, mais ataque e dano;
  - **custo zero**;
  - nenhum risco novo de identidade.
- **Contras:**
  - 27 px de altura, abaixo do D8 (33–35), e conflito G-2 de escala, que segue aberto. Não pode ser reescalado por fator não inteiro (regra de pixel art), e 2× daria 54 px, grande demais;
  - walk de 3 quadros e sem diagonais;
  - estilo DS diferente do Tamer PixelLab (o "três estilos convivem" do contexto §8);
  - meta de longo prazo é substituir (ADR-009).
- **Custo:** 0. **Risco de identidade:** nenhum. **Risco de propriedade intelectual:** o mesmo já aceito pelo ADR-009, sem acréscimo.

### B. Redesenho manual assistido (`pixelart_workbench`, gratuito, a partir do DS e da arte oficial)

- **Prós:**
  - controle total de silhueta, cor e garras;
  - permite desenhar já em 33–35 px (resolve o D8 sem reescalar);
  - custo de crédito zero.
- **Contras:**
  - trabalho grande: 4 direções e um walk de 4–6 quadros cada, mais diagonais se forem exigidas;
  - a qualidade depende da execução quadro a quadro e precisa de nova revisão;
  - mantém aberto o conflito "contorno oficial alterado" (bloqueante 2 × E5);
  - escala mal para muitas espécies.
- **Custo:** 0 gerações, alto em tempo de agente. **Risco de identidade:** baixo a médio, porque é controlável.

### C. Pipeline híbrido (sprite fiel como base, mais ferramenta)

| Rota | Preço [E] | Prós | Contras e riscos |
|---|---|---|---|
| **C1. `create_character` v3 com `reference_image_url`** (sprite S fiel, de frente) **+ `direction_images`** (N e W fiéis; E por espelho). O v3 só preenche as diagonais. | `ceil(w*h*8/65536)`: 36×36 ou 27×27 = **1 geração**. Se todas as direções forem fornecidas, é importação: 0,25. | As direções cardeais **são os pixels fiéis**, sem redesenho. Só as diagonais são geradas. A ferramenta recomenda o v3 com referência como "the default way". | A referência precisa estar **de frente, sem 3/4** [E, doc]; o DS S precisa ser conferido. O tamanho segue o da referência (27 px), e o D8 continua não resolvido sem B. As diagonais geradas podem derivar e precisam de revisão. **Exige enviar sprite oficial (ou derivado) a um serviço externo**: é decisão do fundador (ver §5). |
| **C2. `animate_character(mode="skeleton-v3", template_animation_id="walking")`** sobre o personagem de C1 | **2–4 gerações por direção**, tipicamente 3 [E] | Segundo a documentação, "moves the character rather than redrawing it": preserva melhor a identidade e o tamanho que o template. | Não validado. O esqueleto é humanoide de 18 juntas e **não tem cauda**, então a cauda pode deformar [H]. S, E e N custam cerca de 9 gerações. |
| **C3. `animate_with_skeleton_v3`** sobre o sprite fiel, com keypoints próprios | 3 gerações por direção (4–14 quadros), mais 0,1 do `estimate_skeleton` | Controle exato da pose por quadro. Não precisa de personagem armazenado. | Exige autoria manual dos keypoints. Mesma limitação de cauda e de 18 juntas humanas. |
| **C4. `animate_character` com template sobre o personagem de C1** | 1 geração por direção | Mais barata | **Já demonstrou** redesenhar, encolher (3–7 px) e impor marcha humana (§1.2 e §1.4). É o maior risco de identidade entre as rotas híbridas. |

### D. PixelLab só para cenário, Tamer e ambiente

- **Prós:**
  - é onde a ferramenta entregou resultado: o Tamer P1 v2 é candidato e o tileset reaproveitado não mostrou costura [L];
  - acompanha a evidência desta rodada.
- **Contras:**
  - o Digimon vem de outra fonte (A, B ou C), com risco de **mistura de estilos** entre o Tamer PixelLab (contorno preto, mais detalhe) e o Digimon DS ou feito à mão;
  - o conflito de paleta P-ii × P-iii segue aberto;
  - o walk do Tamer ainda precisa de correção (§1.4).
- **Custo:** o já previsto. **Risco de identidade de Digimon:** nenhum, porque o PixelLab não desenha Digimon.

### Recomendação: próxima tentativa com o menor risco de identidade

1. **Agora, sem custo:** usar o **Agumon DS (A)** como seguidor no protótipo. É a única opção com identidade garantida.
2. **Se o fundador quiser testar a rota fiel no PixelLab:** **um teste único e limitado**, combinando B com C1 e C2.
   - Redesenhar à mão uma vista S **de frente** do Agumon em 33–35 px a partir do DS e da arte oficial (`pixelart_workbench`, 0 gerações), mais N e W.
   - Passar ao v3 com `reference_image_url` + `direction_images` (≤ 1 geração).
   - Gerar o walk S por `skeleton-v3` (cerca de 3 gerações).
   - **Teto de cerca de 4–5 gerações.** Critério de parada: qualquer desvio de silhueta, cor ou cauda encerra a rota.
3. **D** como diretriz enquanto isso: PixelLab para Tamer, cenário e água.

Exigências do teste:
- autorização do fundador sobre o envio de arte oficial ou derivada ao PixelLab;
- `get_balance` antes e depois de cada geração.

---

## 4. Fase 2 e placeholders

- **O Tamer v2 permite avançar para a Fase 2 técnica?** **Sim, com placeholder marcado.**
  - As rotações do P1 v2 são candidatas e servem de base.
  - O walk deve entrar **marcado "PLACEHOLDER — walk reprovado (D10 S, escala 34–37 px)"**.
  - O motor da Fase 2 já deve tratar:
    - o canvas de 56 (rotação) contra 44 (walk), alinhando pelo pivô no pé;
    - o salto de tamanho de parado para andando, que é um problema do asset e não deve ser "corrigido" no motor reescalando.
  - A correção do walk pode correr em paralelo à Fase 2 técnica, se o fundador autorizar, respeitando a regra de uma tarefa por vez.
- **O Agumon pode entrar como placeholder identificado?** **Sim, mas o placeholder recomendado é o Agumon DS (`CREATURE-0006`), não o v2.**
  - O v2 tem risco de confusão com Pokémon. Mesmo marcado, ele contaminaria capturas e a comparação A/B/C.
  - Se o v2 for usado por necessidade técnica (por exemplo, testar o seguidor em 8 direções), deve ficar **marcado "PLACEHOLDER REPROVADO — não representa o Agumon"** e fora de qualquer captura de comparação.

---

## 5. Consumo (`CONSUMO_PIXELLAB_ETAPA6.md`, registros #11–#23)

- **`get_balance` [E], 13/11 cerca de 12h10:** `generations_remaining` **714,95**, com usadas 1285,05 de 2000. **Confere** com o registro #22 e com 726,95 − 12.
- **Soma [E]:** #12–#15 = 2+2+3+3 = 10, e #21 = 2, total **12**. Os preços conferem com o `search_help`: v3 de texto de 16–90 px = 2; template = 1 por direção. #17–#19 e #23 são operações gratuitas.
- **Piso de 650:** respeitado, com folga de 64,95.
- **Desvios:**
  1. #12–#15 disparados em lote, sem `get_balance` isolado. O próprio autor reconhece; é a segunda ocorrência. Sem impacto financeiro.
  2. #23 diz "52×52"; o real é **56×56** [E].
- **Nada foi gerado nesta revisão.** O saldo de 714,95 foi lido, não consumido.

---

## 6. Limitações e o que não foi feito

- Nenhuma geração no PixelLab. Nenhum documento de outro autor alterado. Nenhum jogo, Database, commit ou agente tocado.
- **Avaliação visual dos GIFs:** a ferramenta de leitura mostra só o primeiro quadro do GIF. Por isso avaliei os **mesmos quadros em sequência**, a 6×, nas pranchas `qa_strip_*`, e conferi por parsing que cada GIF 4× tem 6 quadros a 200 ms. **A reprodução em tempo real no motor está NÃO VALIDADA** (sem build).
- **Semelhança com Charmander e Pokémon:** juízo perceptivo [H] deste revisor, apoiado em medidas de cor [E]. Não é parecer jurídico.
- **Arte oficial do Reference Book:** a Wikimon, em extração textual, só dá a descrição. A forma foi conferida pelo rip DS (mapa e batalha). Recomendo anexar a imagem oficial à ficha ADR-015.
- **Métrica de "largura da cabeça":** a métrica automática (`head_w_over_h`) não discrimina bem o focinho. A conclusão de silhueta é visual, com as pranchas como evidência.
- **Diagonais, ataque, dano e idle:** não avaliados (não gerados).

## 7. Decisões que dependem do fundador

1. **Encerrar a geração textual de Digimons no PixelLab** (recomendado, pela regra do adendo §3) e adotar o Agumon DS como placeholder do protótipo.
2. **Autorizar ou não o teste híbrido limitado** (§3, recomendação 2, cerca de 4–5 gerações), incluindo o **envio de sprite oficial ou derivado ao PixelLab**, um serviço externo, com risco de propriedade intelectual a avaliar.
3. **Walk do Tamer P1:** aceitar como placeholder na Fase 2 e corrigir depois (skeleton-v3 no S, cerca de 3 gerações), ou corrigir antes.
4. **Redação das correções de espécie:** trocar "cabeça arredondada" por "cabeça lisa, sem crista, com focinho longo" em qualquer brief futuro.
5. **Herdadas e ainda abertas:**
   - escala G-2 (DS 27 px × D8 33–35);
   - paleta P-ii × P-iii;
   - contorno oficial × redesenho (bloqueante 2 × E5);
   - estilo misto Tamer PixelLab × Digimon DS.
