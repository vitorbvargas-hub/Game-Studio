# REVISAO_QA_CHECKPOINT1 — Etapa 6, Comando 4, Fase 1 (PixelLab)

- **Autor:** game-qa (subagente, Opus 5.5), revisão **independente** do checkpoint 1 · **Data:** 2026-11-13
- **Objeto:** os assets produzidos pelo `game-art` em `fase1-pixellab/` e a autoavaliação dele em `AVALIACAO_FASE1.md`.
- **Régua:** `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 com `AJUSTES_RUBRICA_VISUAL_V1.md` §6.2 (17 bloqueantes, homologados por D4). Também os impeditivos do fundador em `COMANDO_ETAPA6_C1.md` §7, a especificação do C4 §1–§4, `ESCALA_E5_POR_ESPECIE_V1.md` §1/§3 e `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §1.
- **Vocabulário:** "candidato", "candidato com ressalva" ou "reprovado". Nenhum item aqui está aprovado: a homologação é do fundador.
- **Legenda:** **[E]** executado nesta revisão · **[L]** lido de relatório anterior, sem reverificação · **[H]** hipótese · **NÃO VALIDADO** (com o motivo).
- **Build:** não há build. São assets PixelLab exportados, identificados por md5:
  - `agumon.zip`: `12bce707…`
  - `tamer1.zip`: `a59b8394…`
  - `tamer2.zip`: `1f198082…`
  - `tileset_grama_agua.png`: `0f1a66ed…`
  - south.png de cada personagem: Agumon `df46f111…`, Tamer P1 `b3837198…`, Tamer P2 `6ff73beb…`
- **Ferramentas, todas sem custo de geração:**
  - `pixelart_workbench` (`inspect` a 4–12×, `score`);
  - script próprio `qa_checkpoint1/qa_c4_measure.py`, com Python stdlib e uma cópia de `pxpng.py`. Ele mede bbox, topo livre, semitransparência, aderência à P-ii, pixels azuis e amplitude de perna;
  - `web_fetch` da Wikimon;
  - `get_balance` e `get_topdown_tileset`.
- **Dados brutos:** `qa_checkpoint1/medicao_qa_checkpoint1.json`.

---

## 0. Veredito em uma tabela

| Asset | Veredito QA | Autoavaliação do game-art | Motivo principal |
|---|---|---|---|
| Agumon E5 (`c9b4d538…`) | **Reprovado** | candidato com ressalva | O sprite tem crista na cabeça, listras azuis na testa e faixas azuis nos antebraços. Nenhum desses traços existe no Agumon oficial, e a crista **foi pedida no próprio prompt**. Dispara o impeditivo do C1 §7 "anatomia, cores ou detalhes que descaracterizam a espécie". Na rubrica §1.1, a fidelidade fica na banda 4, abaixo do piso 8 do ADR-015. |
| Walk do Agumon (`d7cc85cd…`) | **Reprovado** (herda o problema da espécie) | candidato com ressalva | A animação é do sprite reprovado. Além disso, a amplitude de perna no sul é baixa (32,7% de pixels alterados, contra 72,5% no Tamer), falta a direção N e o canvas é diferente (56 contra 40). |
| Tamer Preset 1 (`32577b34…`) | **Reprovado como Tamer base** (o craft técnico é candidato) | candidato | A combinação boné vermelho + jaqueta azul + cabelo castanho bagunçado + alças de mochila lembra o protagonista do anime Pokémon. Isso viola a exigência de Tamer original e a proibição de elementos de Pokémon. Há ainda 1 px de topo livre num canvas de 48 px, contra o mínimo de 6 px da especificação §1. |
| Walk do Tamer P1 (`3a21d838…`) | **Candidato com ressalva** (só como prova de método) | candidato | Tecnicamente boa: pé com variação de 1 px, altura com 2,3–4,5%, perna com 72–85% de alteração. O asset, porém, herda a reprovação de identidade do P1. |
| Tamer Preset 2 (`1c1f6a8d…`) | **Candidato com ressalva** | candidato | Risco de propriedade intelectual baixo. Ressalvas: 1 px de topo livre, 45 px de altura contra o alvo de ~40 do C4 e 51 cores. Precisa acompanhar a base de corpo que for definida para o P1. |
| Tileset grama/água (`a4ca04e4…`, reaproveitado) | **Candidato com ressalva** | candidato | A grama é exatamente a cor da P-ii (`#76ca9f`). A água principal (`#3f84a8`, azul-aço) **não** é a água da v15b (`#2bc4c4`, ciano): distância 53. Os bloqueantes 13 e 14 (costura de tile e transição Wang) estão **NÃO VALIDADOS**, porque não houve composição 12×10. |
| Composições sobre a v15b | **Candidato com ressalva** (evidência, não asset) | candidato | Servem para ler escala e cor. É colagem, não motor. |

**Resumo:** 3 reprovados, 4 candidatos com ressalva e nenhum candidato limpo. A autoavaliação ("0 reprovações") **não se sustenta**. O principal ponto de divergência é a afirmação de `AVALIACAO_FASE1.md` §5 de que "nadadeira/crista na cabeça… batem com o design oficial". Ela é falsa: o Agumon oficial não tem crista.

---

## 1. Ponto 1: fidelidade do Agumon. **CONFIRMADO**

**Evidência [E]:**
- `pixelart_workbench inspect character:c9b4d538…:south --scale 12` (image_id `e74f2167…`) e o walk E/S (image_ids `57778f8f…` e `a00f5e13…`).
- Medição: **33 pixels azuis** no sul (4,3% do sprite), nas cores `#4a6c99` e `#30517e`. A referência `agumon_ds_south.png` tem **0** pixels azuis.
- Prompt gravado em `zips/agumon_extracted/metadata.json`: *"…light-cream colored belly and snout, **pointed head fin**…"*.

**Checklist das 5 marcas de identidade (rubrica §1.1), sprite novo contra o oficial:**

| Marca | Oficial (Agumon DS em `referencias/` e Reference Book/Wikimon [E], `wikimon.net/Agumon`, 13/11) | Sprite novo | Situação |
|---|---|---|---|
| Cor-base | amarelo-alaranjado uniforme | amarelo-alaranjado, com barriga e focinho creme destacados | desvio pequeno |
| Padrão de pele | liso, sem listras | **listras azul-acinzentadas na testa e ao redor dos olhos** e manchas azuis nos antebraços | **desvio de assinatura** |
| Cabeça/crista | cabeça lisa e arredondada, **sem crista** | **crista pontuda com losango vermelho**, em todas as direções e quadros | **desvio de assinatura** (veio do prompt) |
| Cauda/membros | cauda curta e grossa; 3 garras brancas em cada mão e pé | ponta vermelha na cauda; mãos parecem luvas brancas e azuis; o perfil (E) fica esguio, com cauda erguida, "raptor" | desvio |
| Traço reconhecível | olhos verdes grandes, boca larga | olhos verdes (confere) | ok |

**Leitura:**
- Listras azuis na cabeça são a marca do **Greymon**, o estágio seguinte da mesma linha. A crista com losango vermelho também não pertence ao Agumon. O conjunto lê como "Agumon genérico com traços de outra forma", que é exatamente a armadilha "confundida… dentro da mesma linha evolutiva" da rubrica §1.1.
- A observação do game-art sobre o olho "mais ciano" é secundária. No inspect a 12×, os olhos são verdes; esse não é o problema.

**Bloqueantes:**
- **Impeditivo do fundador, C1 §7, "anatomia, cores ou detalhes que descaracterizam a espécie": DISPARADO.**
- **Rubrica §1.1:** banda **4**, porque há "marca de assinatura (…crista…, padrão de pele) incorreta". Fica abaixo do piso 8 do ADR-015, e o Critério 1 reprova.
- **Bloqueante 1 da lista de 17 (espécie irreconhecível ou errada):** **parcial, não disparado na letra.** A espécie ainda é reconhecível como "um Agumon". O risco de leitura como Agumon/Greymon fica registrado.
- **Bloqueante 2 (contorno oficial alterado):** **não aplicado.** E5 manda "quadro próprio" (redesenho), o que entra em choque com a regra de contorno do Style Bible. É conflito **aberto** (rubrica §8) e **não** o resolvo aqui. Fica sinalizado para o fundador.

**Causa raiz [E]:** o prompt pediu "pointed head fin". O resto (listras, faixas azuis) é invenção do gerador [H]. O modelo usado foi `template_id: mannequin` (v3 de texto, humanoide).

---

## 2. Ponto 2: identidade do Tamer P1. **CONFIRMADO o risco**

**Evidência [E]:**
- `inspect character:32577b34…:south --scale 10` (image_id `d2e022cb…`).
- `composicao_comparativo_lado_a_lado.png`. A 1×, a silhueta é o boné vermelho sobre jaqueta azul.
- Prompt: *"red baseball cap worn backwards, light-blue zip-up jacket… brown canvas backpack strap… short messy dark-brown hair"*. O sprite mostra o boné **com aba para a frente**, não para trás, com um pixel branco na frente que lembra um emblema.

**Avaliação [H], percepção visual e não parecer jurídico:**
- **Pokémon, risco ALTO.** O conjunto boné vermelho com aba frontal + jaqueta/colete azul + cabelo castanho escuro bagunçado + mochila + "jovem explorador com dispositivo de monstros" é a assinatura cromática e de silhueta do protagonista do anime Pokémon (e, em parte, do protagonista de Kanto dos jogos).
  - Nenhum desses elementos é protegido isoladamente.
  - **A combinação, num fangame de "monstros digitais com treinador", é o tipo de semelhança que um jogador nomeia de imediato.** Isso viola o espírito de "Tamer original" (D1, C4 §4) e a regra do projeto "só Digimon, nada de Pokémon".
  - Também aumenta o risco de PI e de reputação descrito no contexto comum §2.
- **Digimon, risco BAIXO.** Não há óculos de proteção (Tai/Takato/Taiki), nem capuz azul com óculos (Takato), nem o visual dos protagonistas de Savers ou Frontier. A jaqueta azul com cabelo castanho tem um eco leve do Tai, sem traço de assinatura. O P1 é **mais** original que o v13, que usa óculos vermelhos sobre cabelo ruivo e lembra mais o Tai, como o próprio game-art registrou.
- **Tamer P2:** rabo de cavalo preto, colete/capuz amarelo, camisa listrada, luvas vermelhas sem dedos, short jeans e tênis roxo. Não encontrei correspondência forte com protagonistas de Pokémon ou Digimon. **Risco baixo.**

**Recomendação para o P1:**
1. Trocar o **acessório de cabeça**: nada de boné vermelho. Opções: faixa de cabeça ou bandana, chapéu de aba curta, ou cabelo à mostra com mecha de cor.
2. **Separar a dupla vermelho + azul**: jaqueta verde-oliva, mostarda ou laranja queimado, ou boné de outra cor se o boné ficar.
3. Dar um **elemento-assinatura próprio do Digital Odyssey**, por exemplo um cachecol ou braçadeira com padrão de circuito, ligado aos "elementos digitais" da v15b.
4. Manter **sem óculos de proteção**, para não migrar o risco para o Tai/Takato.

Essas mudanças são compatíveis com o contrato de camadas (especificação §2): chapéu e acessório são a camada 5.

---

## 3. Ponto 3: altura do Tamer e escala E5

**Medições [E]:**

| | Altura | Largura | Topo livre no canvas |
|---|---|---|---|
| Tamer P1 (S/E/N/W) | 46 / 46 / 44 / 46 | 26 / 21 / 23 / 21 | **1 px** (canvas 48) |
| Tamer P2 (S/E/N/W) | 45 / 45 / 43 / 44 | 26 / 21 / 26 / 21 | — |
| Agumon (S/E/N/W) | 38 / 38 / 37 / 38 | 34 / 34 / 31 / 34 | — |
| Tamer v13 (referência) | 34 | 24 | — |
| Agumon DS (referência) | 27 | 20 | — |

**Relação Tamer/Agumon:**
- Altura: 38/46 = **0,83**, dentro da classe Médio de E5 (0,70–0,98×). Agumon abaixo do Tamer, como E5 exige.
- **Com 46 px, a escala E5 não fica comprometida. A relação é coerente.**

**O que está errado de fato:**
1. **Margem de canvas.**
   - A especificação §1 diz que conteúdo de 43–50 px pede canvas de 56 ou 64 px, com ≥ 6 px de topo. Os dois presets têm 45–46 px em canvas de 48, com **1–3 px de topo**.
   - Isso não é um dos 17 bloqueantes, mas é **não conformidade com a especificação**: chapéu ou cabelo alto em quadros de walk ou ataque cortariam.
   - Correção possível sem gerar: `set_canvas_size` para 56×56 (grátis). Não executado, porque está fora do escopo de QA.
2. **Desvio do alvo do fundador.** O C4 §3 pede "aproximadamente 40 px". 46 px fica **+15%** acima. Está dentro de D1 (36–50), então **não é bloqueante**. É desvio de especificação.
3. **Largura do Agumon.**
   - 34 px está acima da faixa E5 (24–30) e **mais largo que o próprio Tamer (26)**. A 1×, o Agumon tem área visual próxima à do Tamer.
   - A causa é a pose de braços abertos e as "luvas" brancas e azuis, ou seja, em parte o mesmo defeito de design do ponto 1.
   - Isso é critério graduado (Critério 4), não bloqueante 5: a altura está na faixa e o desvio está registrado.

**Recomendação de escala (coerente com o C4 e com E5):**
- Se o fundador mantiver o alvo de ~40 px para o Tamer, o Agumon deve descer para **~33–35 px de altura e ~26–29 px de largura**, preservando a razão de ~0,83.
- **Não** dá para baixar só o Tamer e manter o Agumon em 38, porque a razão iria a 0,95 e a hierarquia se perderia.
- Como os dois precisam ser regenerados de qualquer forma (pontos 1 e 2), a correção conjunta não custa nada além do retrabalho.

---

## 4. Ponto 4: amplitude do walk do Agumon. **Graduado, não bloqueante**

**Evidência [E]:** porcentagem de pixels alterados em relação ao quadro 0 no terço inferior do bbox (pernas), média dos quadros:

| Walk | Quadros | Pé (y) | Variação de altura | Alteração nas pernas |
|---|---|---|---|---|
| Tamer P1 S | 6 | 44→43 (1 px) | 2,3% | **72,5%** |
| Tamer P1 E/W | 6 | 46→45 | 2,2% | 84,8% |
| Tamer P1 N | 6 | 44→43 | 4,5% | 83,6% |
| **Agumon S** | 9 | 46 fixo (0 px) | 5,0% (38–40 px) | **32,7%** |
| Agumon E/W | 9 | 46→45 | 5,3% (38→36 px) | 67,8% |

**Leitura:**
- O game-art está certo para a vista **sul**. Ali o Agumon "balança" e abre a boca, mas quase não passa a perna (32,7%, menos da metade do Tamer). No leste e no oeste a passada existe (67,8%).
- **Classificação:** nenhum dos 17 bloqueantes mede amplitude. O bloqueante 6 (quadros inconsistentes, ±5%) mede deriva, não amplitude. A amplitude é **graduada** (Critério 3, "Animações e imersão", 15%).
- O impeditivo do C1 "animação que prejudica a experiência" **não** dispara, porque o ciclo é legível no E/W.
- **Bloqueante 6, ressalva técnica:** a variação de altura é **5,0–5,3%**. Medida como amplitude (máx − mín)/máx, fica no limite ou levemente acima de 5%. Medida como desvio da média, fica em ≤ 3%. A rubrica não define a fórmula de "±5%". **Achado de régua** para o `game-studio`: registrar a fórmula. Com a leitura de desvio da média, o bloqueante 6 não dispara.

**Outras falhas técnicas (B) do walk:**
- Não há direção **N**. O C4 pede Agumon "com animação". Para o protótipo navegável, o seguidor precisa de N.
- O canvas da animação é **56×56** e o das rotações é **40×40**. O motor vai precisar de alinhamento de pivô por animação (Fase 2).

---

## 5. Ponto 5: paleta P-ii

**Divergência documental [E]:** `AVALIACAO_FASE1.md` §7/§11/§12 diz que a paleta "ainda não foi escolhida (D5)". O **C4 §2** já adotou **P-ii provisoriamente** como referência comum dos três métodos, com P-iii como alternativa de harmonização para personagens. A autoavaliação ficou desatualizada em relação ao C4.

**Medição [E]:** distância euclidiana RGB de cada pixel opaco até a cor mais próxima das 28 cores da P-ii (`COMPARATIVO_PALETAS_FLORESTA_V1.md` §3.1).

| Imagem | ≤16 | ≤32 | ≤48 | Mediana | Cores |
|---|---|---|---|---|---|
| Controle: recorte v15b NW (cenário) | 99,7% | 99,9% | 99,9% | 0 | 117 |
| Tamer P1 sul | 33,5% | 51,4% | 63,5% | 31,0 | 60 |
| Tamer P2 sul | 44,3% | 44,7% | 61,6% | 41,5 | 51 |
| **Agumon sul** | 33,5% | 33,9% | **34,7%** | 63,7 | 50 |
| Agumon DS (oficial, referência) | 29,7% | 31,7% | 32,0% | 97,1 | — |
| Tamer v13 (referência) | 40,9% | 43,9% | 51,7% | 45,5 | — |
| Composição nova (cenário + 3 personagens) | 97,4% | 97,9% | 98,3% | 0 | 234 |
| Composição atual (v13 + DS) | 98,7% | 99,0% | 99,1% | 0 | 129 |
| Tileset grama/água | 49,5% | 53,9% | 54,7% | 19,4 | — |

**Leitura:**
1. **A P-ii não tem nenhuma cor quente** (pele, amarelo, laranja, vermelho). É uma paleta de cenário. Por isso **nenhum** personagem, nem o Agumon oficial do DS (32%), consegue aderir a ela. Os ~34% do Agumon são quase só o contorno preto (`#000000` e `#000006` ficam perto de `#02050a`/`#181425`).
   - **Exigir aderência à P-ii em personagens seria uma régua estruturalmente impossível.** Este é o caso de uso da P-iii, como o C4 §2 já prevê.
   - É conflito **aberto** (Endesga-32 × P-ii × P-iii, Style Bible §3.2/§8.3). Registro e **não** resolvo.
2. A **composição** passa de 98% só porque o cenário domina a área. Ela não serve como prova de aderência dos personagens.
3. **O tileset reaproveitado não é inteiramente P-ii.**
   - A grama (`#76ca9f`, 45,4%) é exata.
   - A água principal (`#3f84a8`, 40,3%) fica a **53** da cor mais próxima, porque a água da v15b é `#2bc4c4`/`#8ff0f0`. Há ainda uma borda avermelhada (`#604348`).
   - Num mapa que já tem a água ciano da v15b, a junção mostraria **duas águas diferentes**. É **risco do bloqueante 14** (transição visível), a validar no recorte 12×10.
4. **Craft (graduado):**
   - `pixelart_workbench score`: Agumon 69,2, Tamer P1 71,5, Tamer P2 76,1.
   - 50–60 cores por sprite de ~40 px é alto para GBA Plus. Os maiores descontos vêm de `near_duplicates` (exemplo: `#000000`, `#000006` e `#010109` como "pretos" separados) e de pixels isolados (`singletons`).
   - **Não** é bloqueante. É candidato natural para `reduce_colors` em lote (0,1 geração) quando a paleta de personagem for decidida.

---

## 6. Ponto 6: consumo e piso de 650. **CONFERE**

- **`get_balance` [E], 13/11 ~11:40:** `generations_remaining: 726.95`, usadas 1273,05 de 2000. **Bate** com `CONSUMO_PIXELLAB_ETAPA6.md` (737,95 → 726,95 = 11 gerações).
- **Soma dos itens [E], conferida com os preços do `search_help`:**
  - 3 × `create_character` v3 a partir de texto, faixa 16–90 px, 2 cada = 6;
  - walk template do Tamer, 1 por direção × 3 = 3;
  - walk v3 do Agumon, 2 direções. O canvas gerado tem 56×56×8/65536 = 0,38, o que dá 1 por direção = 2;
  - total **11**.
- **Piso de 650:** respeitado. O menor saldo previsto em qualquer lote foi 726,95. Folga atual: **76,95**.
- **Teto de ~30 do checkpoint 1 do C4:** respeitado (11).
- **Desvio de procedimento (menor):**
  - A regra (correção §2) pede `get_balance` **antes e depois de cada geração**. As linhas #3–#5 e #6–#7 registram **lotes** ("731,95 (lote)"), sem saldo individual por geração.
  - Não houve risco ao piso, mas o registro não prova a checagem item a item.
  - Recomendação: na próxima rodada, uma linha de saldo por geração.
- **"Reserva de retrabalho não usada porque nenhum item falhou um bloqueante":** **não se sustenta** depois desta revisão (ponto 1). O retrabalho é justificado.

---

## 7. Bloqueantes disparados (lista consolidada)

| # | Bloqueante / impeditivo | Asset | Status |
|---|---|---|---|
| C1 §7 | Anatomia, cores ou detalhes que descaracterizam a espécie | Agumon e walk do Agumon | **DISPARADO** [E] |
| Rubrica §1.1 / ADR-015 | Fidelidade abaixo do piso 8 (banda 4) | Agumon | **DISPARADO** [E] |
| D1 / C4 §4 / contexto §2 | Tamer original, sem elementos de Pokémon | Tamer P1 e walk P1 | **DISPARADO** como requisito do fundador (não é um dos 17; é critério de identidade) [E]+[H] de percepção |
| 1 | Espécie irreconhecível ou errada | Agumon | Não disparado na letra; risco Agumon/Greymon registrado |
| 2 | Contorno oficial alterado | Agumon | Conflito aberto (E5 "quadro próprio" × Style Bible). Não aplicado. Decisão do fundador. |
| 3 | Fundo ou halo | todos | Passa: 0 pixels semitransparentes em todas as rotações [E] |
| 4 | Grade falsa | todos | Passa: grade 1:1 nativa a 10–12× [E] |
| 5 | Escala fora da faixa | todos | Passa nas alturas (Tamer 43–46 em D1; Agumon 37–38 em Médio). Largura do Agumon é desvio graduado. |
| 6 | Quadros inconsistentes ±5% | walk do Agumon | Limítrofe (5,0–5,3% como amplitude; ≤3% como desvio da média). Fórmula a definir. |
| 7 | Pivô | todos | **NÃO VALIDADO** quadro a quadro (sem motor). Pé estável (0–1 px). Canvas 56 × 40 do Agumon a tratar na Fase 2. |
| 13 / 14 | Tile ou costura; transição Wang | tileset | **NÃO VALIDADO**. Não há recorte 12×10. Risco por causa da água de cor diferente da v15b. |
| 8, 9, 15, 16, 17 | Mapa e playtest | — | Não aplicáveis nesta fase |
| 10, 11, 12 | Rastreabilidade, texto de desenvolvimento, integração | assets | 10: o Agumon é recriação de espécie oficial; falta a ficha com fonte e classificação ADR-015 (a Wikimon foi usada nesta revisão). 11: nada visível nos sprites. 12: sem integração. |

---

## 8. O que corrigir: custo e justificativa

Preços pelo `search_help`/descrição das ferramentas. Saldo atual **726,95**; piso **650**; folga **76,95**.

| # | Correção | Ferramenta e parâmetros sugeridos | Gerações | Justificativa |
|---|---|---|---|---|
| R1 | **Regenerar o Agumon** | `create_character` v3 a partir de texto, size 40. Prompt **sem** "fin", com "smooth round head with no crest or horns, no stripes, no markings, uniformly yellow-orange skin, three white claws on each hand and foot, short thick tail, compact chunky body". Alvo: 33–35 px de altura e 26–29 de largura. | **2** (+2 se precisar de 1 nova tentativa) | Bloqueante C1 §7 e fidelidade banda 4 |
| R2 | **Walk do Agumon novo** em S, E, N (W por espelho, grátis) | `animate_character` v3 com descrição enfática ("legs clearly lifting and alternating, steady stride") ou `mode="pixminimax"` | **3** | Herda R1; corrige a amplitude no sul e a falta de N |
| R3 | **Redesenhar o Tamer P1** | `create_character` v3, size 44 (alvo ~40–42 px de conteúdo), visual do §2 (sem boné vermelho, sem a dupla vermelho+azul, elemento-assinatura digital); depois `set_canvas_size` 48 ou 52 (grátis) para garantir topo | **2** (+2 se precisar de nova tentativa) | Identidade, risco Pokémon, alvo de ~40 do C4, margem da especificação §1 |
| R4 | **Walk do novo P1** em S, E, N (W por espelho) | `animate_character` template `walking` | **3** | Herda R3. O template já foi validado como método (§4). |
| R5 | *(opcional, recomendado)* **Tamer P2 na mesma base de corpo** do novo P1 | `create_character` v3, size 44, mesmo prompt de corpo; aparência do P2 mantida | **2** | "Mesma base de corpo" entre presets (orçamento rev. 2 item 2). Só depois que R3 fixar a altura. |
| R6 | *(opcional, condicional)* **Água do tileset na cor da v15b** | `create_topdown_tileset` standard, `upper_base_tile_id` da grama (`adfb8042…`) e água descrita como ciano claro da v15b | **1** | Só se o recorte 12×10 mostrar costura entre as duas águas (bloqueante 14). Validar antes de gastar. |
| — | `reduce_colors` em lote nos personagens | — | 0,1 cada | Graduado. Só depois da decisão de paleta de personagem (P-iii ou outra). |

**Totais:**

| Cenário | Gerações | Saldo previsto |
|---|---|---|
| Mínimo (R1–R4) | **10** | 716,95 |
| Com uma nova tentativa em R1 e R3 | **14** | 712,95 |
| Com os opcionais (R5 + R6) | **17** | **709,95** |

No pior cenário, o consumo acumulado da rodada vai a 28, abaixo do checkpoint de ~30 do C4. **Todos os cenários ficam ≥ 650.** Regra para o operador: `get_balance` antes e depois de **cada** geração. Se a nova tentativa falhar de novo no mesmo item, **parar** e voltar à revisão (C4 §1: falha recorrente não consome a reserva sem revisão).

---

## 9. Dá para avançar para a Fase 2?

- **Com estes assets, como arte do Link B: não.** O Agumon e o Tamer P1 estão reprovados. Montar o B com eles produziria uma comparação A/B/C enviesada.
- **A Fase 2 é técnica:** M2, M1-lite, builds isolados, layout 40×30, roteiro. Ela **não depende da arte final**. Pode começar usando estes sprites **apenas como placeholders marcados** ("PLACEHOLDER — reprovado no QA checkpoint 1"), e o motor já deve tratar:
  - o canvas diferente entre rotações (40) e animação (56) do Agumon;
  - as 8 direções contra o runtime de 4.
- **Minha recomendação, considerando a regra de um agente por vez:** executar **primeiro** R1–R4 (≤ 14 gerações, cerca de 15 a 30 min de operação), com nova revisão curta do game-qa, e **depois** a Fase 2. O retrabalho é barato e evita integrar duas vezes. A decisão de ordem é do `game-studio`/fundador.

---

## 10. Limitações e o que não foi feito

- Nenhuma geração no PixelLab. Nenhum documento de outro autor alterado. Nenhum código, Database ou jogo tocado. Nenhum commit, push ou deploy. Nenhum agente acionado.
- **NÃO VALIDADO:**
  - pivô quadro a quadro e Y-sort (sem motor);
  - bloqueantes 13 e 14 do tileset (sem recorte 12×10);
  - walks diagonais (não gerados);
  - aparência dos walks em velocidade real (vi os quadros em grade, não em reprodução).
- **Semelhança com personagens de terceiros:** é juízo perceptivo [H] deste revisor, não parecer jurídico.
- **Referência oficial:** a página da Wikimon, em extração textual, não descreve o design. A checagem visual foi contra o sprite DS em `referencias/` mais o conhecimento do design do Reference Book. Recomendo anexar uma imagem oficial à ficha ADR-015 do Agumon.
- **Medição de amplitude:** é uma heurística própria (porcentagem de pixels alterados no terço inferior do bbox contra o quadro 0), comparativa e não absoluta.

## 11. Decisões que dependem do fundador

1. **Altura-alvo do Tamer:** ~40 px (C4) ou ~46 px (atual). Em qualquer caso, o Agumon acompanha com razão de ~0,83 (§3).
2. **Paleta de personagens:** a P-ii não comporta cores quentes. Confirmar a P-iii (ou outra) para personagens, e a revisão da regra do Style Bible §3.2/§8.3 (conflito aberto).
3. **Contorno de Digimon redesenhado** (bloqueante 2 × E5 "quadro próprio"). Conflito aberto.
4. **Direção visual do Tamer base** (§2): aprovar o afastamento do visual boné vermelho com jaqueta azul.
5. **Fórmula do "±5%"** do bloqueante 6 (amplitude ou desvio da média). Ajuste de régua via `game-studio`.
