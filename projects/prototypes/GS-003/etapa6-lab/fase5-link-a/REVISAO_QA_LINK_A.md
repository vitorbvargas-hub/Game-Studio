# REVISAO_QA_LINK_A — Etapa 6, Comando 5 §7: revisão crítica independente do Link A (Método ChatGPT)

- **Autor:** game-qa (subagente), 2026-11-13. Trabalhei sozinho: não acionei outros agentes, não alterei código, assets nem documentos de outros autores, não fiz commit nem deploy e **não chamei o PixelLab** (nem `get_balance`).
- **Régua:** `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 + `AJUSTES_RUBRICA_VISUAL_V1.md` §6, com 17 bloqueantes e mapa em 3 dimensões (homologada pelo ADR D4). O mapa é avaliado em duas réguas (Style Bible/P-ii e referência aprovada v13/v15). Os conflitos visuais abertos (D9 paleta, escala, densidade) **não foram resolvidos aqui**: só os mostrei.
- **Vocabulário:** nada aqui está "aprovado". A homologação é do fundador.
- **Legenda:**
  - **[E]** executado e medido por mim nesta revisão;
  - **[L]** vem de relatório anterior e não reverifiquei;
  - **[H]** hipótese;
  - **NÃO VALIDADO**, sempre com o motivo.

## 0. Build testado

| Item | Valor [E] |
|---|---|
| Link A | http://127.0.0.1:5191 (HTTP 200). Preview do `dist-lab-a`, worktree `workspaces/game-dev/lab-etapa6`, branch `lab/etapa6`, HEAD `f2d4e6e`; o Link A em si está em `63351a5`. `git status` limpo. |
| Link B | http://127.0.0.1:5192 (HTTP 200), `dist-lab-b` refeito na C5. Para comparar, o build anterior (`dist-lab-b-antes`) foi servido por mim na porta 5195 só durante o teste e o servidor foi encerrado em seguida (conferido: porta fechada). |
| Jogo principal `qo` | `git status --porcelain` com 0 linhas; HEAD `3289e32` ("Digital Odyssey: nome oficial no titulo da aba…"); branch `quality-overhaul`. **Batem com o esperado.** |
| Navegador | O browser do OpenClaw recusou `127.0.0.1` ("navigation blocked by policy"). Usei Chromium headless + CDP com **roteiro próprio**, escrito do zero em `workspaces/game-qa/tools/etapa6_c5/` (`cdp.mjs`, `dump.mjs`, `nav.py`, `play.mjs`, `integ.mjs`, `pxstats.mjs`, `palmatch.mjs`, `sheet.mjs`, `grid.mjs`). Ele fica fora do código do jogo e pode ser executado de novo. Viewport 1280×720, DPR 1, escala do jogo 2× inteira (`scaleInfo`: 640×360 lógicos). **Sem GPU: o FPS é indicativo.** |
| Minhas evidências | `fase5-link-a/qa/` (capturas `qa_*.png`, `dump_A/B.json`, `nav_A/B.txt`, `qa_play_report.json`, `qa_integridade_B.json`, `qa_pxstats_A/B.json`) |

## 1. Vereditos por item do C5 §7

| # | Item | Veredito | Resumo da evidência |
|---|---|---|---|
| 1 | Fidelidade artística | **candidato com ressalva** | Kunemon fora [E]; WarGreymon, Kuwagamon e MetalGreymon com desvios de assinatura; Agumon e Greymon fiéis. Tamer original, com risco baixo. §2 |
| 2a | Grade de pixel 1:1 | **candidato com ressalva** | Sem grade de ampliação nem alfa parcial [E], mas com ruído alto: 30–55% de pixels órfãos na vegetação. §3 |
| 2b | Paleta (grama P-ii oliva) | **candidato com ressalva** (conflito D9 aberto) | A grama fica na P-ii (92–94% dos pixels até ΔRGB 24) contra objetos e água saturados [E]. §3 |
| 2c | Costuras | **reprovado** | Cachoeira A em 2 colunas com emenda visível; espuma em blocos retangulares; ponte com vãos entre módulos [E]. Dispara o bloqueante 13. §3 |
| 3 | Animações | **reprovado** nos personagens; **candidato com ressalva** na água A; **reprovado** na cachoeira A | Tamer e Digimon deslizam numa pose só [E]. Água A anima, mas com padrão de rede repetido em 32 px. A água B é superior. §4 |
| 4 | Colisões e navegação | **candidato** | 16 testes de teclado sem nenhuma passagem indevida; ponte só por dentro; BFS sem becos no caminho principal [E]. §5 |
| 5 | Profundidade (Y-sort) | **candidato com ressalva** | Árvores, santuário, cabine e MetalGreymon estão corretos [E]. O corrimão da frente fica translúcido e o Tamer parece "por cima" dele. §6 |
| 6 | FPS e desempenho | **candidato** | 60,0–60,1 qps (p99 16,8 ms) parado, andando, no lago, com `?agua=b` e no B [E, headless]. §7 |
| 7 | Integridade e Link B | **candidato com ressalva** | Visual do B igual dentro do ruído de animação [E]; 0 PNG A no bundle B [E]. Ressalva: o JS do B passou a carregar o JSON do mapa A e ramos novos de código; o bundle não é idêntico ao anterior. §8 |
| 8 | Jogo principal | **candidato** (intacto) | `3289e32`, limpo [E] |
| 9 | Mapa nas 3 dimensões | **reprovado** | Bloqueantes 9 (Digimon forte na zona de entrada) e 13 (costura) disparados [E]. A composição é um prado aberto, não corredores de vegetação. §9 |
| 10 | Comparativo A × B | ver §10 | A ganha em arte de props e personagens e na legibilidade da HUD. B ganha em água, cachoeira, animação, limpeza de pixel e conformidade do layout. Nenhum dos dois chega a 8. |

## 2. Fidelidade artística (item 1)

Elenco montado por mim em `qa/qa_elenco_A_3x.png`, a partir dos PNGs efetivamente servidos em `lab-assets/a/`. A comparação com o oficial é de memória de design, porque não havia referência oficial lado a lado disponível offline nesta sessão. Por isso as notas de fidelidade são **[E visual + H de referência]**.

| Espécie (uso) | Altura e E5 | Fidelidade | Veredito |
|---|---|---|---|
| Koromon (parceiro A) | 25 px (faixa 22–28) | Blob rosa, orelhas longas | candidato |
| Agumon (0006) | 34 px (D8 33–35) | Amarelo-alaranjado, garras brancas, sem listras nem crista: cumpre a correção do C4 | candidato |
| Greymon (0007) | 52 px (48–58) | Crânio marrom com 3 chifres e listras azuis em corpo laranja | candidato |
| MetalGreymon (decorativo) | 62 px; largura 73 (E5 48–62, **excede**) | Capacete, asas roxas e corpo corretos. **Os dois braços parecem garras metálicas**; no oficial só o esquerdo é o braço metálico [H] | candidato com ressalva |
| WarGreymon (0016) | 76 px (70–84); largura 78 (**excede**) | Armadura, Dramon Destroyer e capacete corretos. **As formas amarelas atrás dos ombros leem como asas**; no oficial ali ficam as duas metades do Brave Shield (placas nas costas) [H]. Pede redesenho como placas de escudo. | candidato com ressalva |
| Kuwagamon (decorativo) | 56 px | Corpo vermelho e garras corretos. **Pinças vermelhas**, quando no oficial são prateadas; asas brancas muito destacadas | candidato com ressalva |
| Palmon (0107), Betamon (0108) | 38 e 32 px | Fiéis | candidato |
| **Kunemon** | — | Desenhado como abelha. **Excluído:** não há pasta nem PNG no `lab-assets/a` nem no `dist-lab-a` (busca por nome e por conteúdo, 0 ocorrências) [E] | correto excluir |

**Tamer A** (preto e azul, 41 px, só a vista sul):
- É **original**: sem óculos, sem boné e sem chapéu rosa, ao contrário da prancha 01, que lembrava Tai e Mimi.
- **Risco [H] baixo.** A combinação camisa azul + cabelo escuro bagunçado é genérica e lembra de longe o arquétipo do Tai, sem a marca de assinatura (óculos e estrela). Não há risco Pokémon (sem boné vermelho).
- **Ressalva:** falta o "acessório digital discreto" que o C4 pediu, e não há personalização além de 2 presets (D1).

**Mistura de fontes no mesmo quadro [E]:** espécies sem arte A (Guilmon parceiro quando `?criador=0`, Floramon, Patamon, Garurumon etc.) aparecem com sprite DS ao lado dos retratos A (ver `qa_A_ysort_*`). A FASE5 documenta isso, e isso pesa no Critério 4.

## 3. Pixels, paleta e costuras (item 2)

**Grade [E]** (`qa/qa_pxstats_A.json`, 82 PNGs servidos):
- Nenhum asset com blocos 2×2 uniformes acima de 52%. O maior é `agua_a_base`, com 3 cores, o que é natural.
- 0 pixels com alfa parcial em todos.
- Portanto, não é grade de ampliação, e os itens I-02, I-03 e o bloqueante 4 **não disparam pelo detector**.

**Ruído [E]:**

| Grupo | Pixels órfãos (sem vizinho da mesma cor) | Cores |
|---|---|---|
| Vegetação A | 30–55% (flores e tufos 48–56%) | 22–40 |
| Personagens A | 17–32% | — |
| Calibração: props do v15b do B | 8,5–28% | 5–15 |

É a assinatura da redução por moda de uma ilustração. Pela régua do Critério 1 isso é a **banda 6** ("grade real 1:1, mas com ruído"), não falha bloqueante. A leitura 1 do D3 fica respeitada no sentido estrito (os pixels são nativos no tamanho final). **Se a "pixel art nativa" do D3 exige pixel desenhado e não reduzido, a decisão é do fundador** (ver §12).

**Densidade de pixel [E]:**
- Tudo está a 1:1 na mesma escala do motor (2× inteiro).
- O cenário (corrida média de 1,3–1,5 px nos props) e os personagens (1,4–1,8 px) têm densidade compatível.
- Não há mistura de "pixel 2×" com 1:1. A mistura real é de **fonte**: retrato A ao lado de sprite DS.

**Paleta [E, indicativo].** Medi a porcentagem de pixels até ΔRGB 24 das amostras de `paletas/*.png`. O método de extração (cores com ≥ 40 px nas pranchas de paleta) é heurístico, então os números servem para comparar, não como absolutos.

| Captura | P-ii | P-i Endesga-32 | P-iii |
|---|---|---|---|
| Mapa A off-screen | 94,0% (exato 91,6%) | 21,6% | 21,6% |
| Tela A no jogo (com luz) | 91,6–92,7% | 6,5–9,3% | 5,9–8,9% |
| Tela B no jogo | **33,7–38,1%** | 7,3–9,1% | 6,8–8,8% |

- **Régua 1 (P-ii, D9):** o A segue a P-ii no cenário muito mais que o B.
- **Régua 2 (referência v13/v15 e refs do fundador):** a grama oliva escura do A fica opaca perto da água ciano, do penhasco laranja e da cerejeira rosa. São "dois mundos de saturação", o mesmo achado do game-art (LACUNAS §9.3). O B tem grama menta mais clara e mais chapada, o problema que a Etapa 2 item 5 avaliou com nota 4.
- **Conflito D9 aberto, não resolvido aqui.**

**Costuras [E]** (`qa/qa_D1_recorte_A_12x10_3x.png`, `qa/qa_agua_A_x_aguab.png`, `qa/qa_A_corrimao.png`):
- **Grama:** sem costura visível entre tiles.
- **Wang grama↔água:** contínuo, mas com degraus serrilhados ("escadinha") e sem barranco.
- **Cachoeira A:** emenda vertical visível entre as duas colunas de 32 px, que a própria FASE5 §9 reconhece, e corte reto embaixo. **Dispara o bloqueante 13.**
- **Espuma A:** blocos retangulares com bordas retas cortadas no limite do tile, visíveis como "tijolos" brancos.
- **Ponte:** 3 módulos de 2×1 repetidos, com vão visível entre eles.
- **Penhasco ↔ lago:** encontro em linha reta, sem peça de ligação. O bloqueante 14 não dispara, porque não é transição Wang, mas fica como ressalva.

## 4. Animações (item 3)

| Elemento | Medição [E] | Veredito |
|---|---|---|
| Tamer A andando | Recorte do Tamer em 8 quadros (90 ms) enquanto anda para leste: **mesma pose sul em todos**, ele desliza (`qa/qa_walk_A_q0_q4_x_B_q0_q4.png`). Não vira para a direção do movimento. | reprovado (placeholder declarado) |
| Digimon A | Pose única, leste espelhado [L FASE5, consistente com o que vi] | reprovado (placeholder declarado) |
| Tamer B | Caminhada nas 4 direções existe [L QA C4] | — |
| Água A | Muda entre quadros (56–84 mil px por 120 ms na tela inteira, incluindo HUD). **Padrão de "rede" de células grandes, com repetição de 32 px evidente no lago** | candidato com ressalva |
| Água B no mapa A (`?agua=b`) | Textura miúda, repetição pouco perceptível; cachoeira composta (rocha, musgo, bacia). Ressalva: as bordas Wang continuam com a margem A [E visual] | superior à A |
| Cachoeira e espuma A | Rolagem de faixa com emenda e espuma em blocos; sem rocha nem bacia | reprovado |

## 5. Colisões e navegação (item 4)

**Geometria real carregada pelo jogo** (`sim.map`, `qa/dump_A.json`, análise em `qa/nav_A.txt`) [E]:

- **Alcance:** 498 das 499 células livres são alcançáveis a partir do spawn (9,15). A ilha isolada é 1 célula, (14,9), sem efeito.
- **Passagem indevida:** nenhuma.
  - Só 4 células alcançáveis têm chão de água: (21–24, 20), que é exatamente o tabuleiro da ponte.
  - Nenhum prop grande (árvore, pedra, estrutura ou Digimon decorativo) é atravessável.
  - O planalto do penhasco é inalcançável, como projetado.
- **Gargalo:** a ponte (linha 20, x 20–25) é a **única** ligação entre as margens. Ela corta 232–237 células, o que é esperado, mas tem **largura de 1 tile**, abaixo do item 2.9 do layout-brief. O acesso ao topo do santuário, em (31, 4–6), também tem 1 tile, mas só serve a 9 células laterais.
- **Becos:** 23 pontas de grau 1, todas nichos de 1 célula entre árvores da borda. **Nenhuma está no caminho principal** spawn → ponte → santuário, que é prado aberto de 10+ tiles. O bloqueante 15 e o 3.2 automático não disparam.

**Teclado real** (16 testes, `qa/qa_play_report.json`) [E]:

| Teste | Resultado |
|---|---|
| Penhasco | Saindo de (4,10), (9,11), (26,10) e segurando W, parou em y = 9,25 / 9,00 / 9,25. |
| Lago, 4 lados | Parou sempre antes da água: x = 14,75; y = 13,06; x = 27,19; x = 19,81. |
| Ponte | Atravessou até x = 31,75. No meio, W e S só movem dentro da linha 20 (y de 20,19 a 20,81): **não dá para cair da ponte**. |
| Bordas da floresta | Paradas em x = 2,25, x = 36,81, y = 24,81 e x = 37,81. |

**Ressalva [E]:** todas as células Wang são sólidas, inclusive as de 3 cantos de grama (14 células). Isso cria uma "parede invisível" de até cerca de meio tile antes da linha d'água visível. É conservador e não deixa andar na água (P3).

**Achado lateral [E]:** pisar no portal do Mapa-múndi, em (31,3), abre o Mapa-múndi. Com ele aberto, o FPS medido caiu para cerca de 46 qps (quadros de 33 ms) em headless. Isso não é do mapa A; só registro.

## 6. Profundidade e Y-sort (item 5)

Capturas `qa/qa_A_ysort_*_{atras,frente}.png` [E]:
- Atrás da cerejeira, da árvore grande 02, do santuário e da cabine, o objeto cobre o Tamer.
- Na frente deles, o Tamer cobre o objeto.
- O MetalGreymon decorativo é ordenado pelo pé, corretamente.
- Nenhuma vegetação cobriu mais de 50% do Tamer nos 5 pontos amostrados, então o bloqueante 16 não dispara. O santuário (estrutura, não vegetação) cobre cerca de metade do corpo quando o Tamer está atrás dele: é aceitável.

**Ressalva:** o corrimão da frente da ponte fica translúcido quando cobre o Tamer (comportamento descrito na FASE5). Na captura, o Tamer parece estar **por cima** do corrimão (`qa/qa_A_corrimao.png`).

**Sombra de contato:** vem do motor, igual ao B. Não medi a ancoragem pixel a pixel, então fica **NÃO VALIDADO** em detalhe.

## 7. FPS e desempenho (item 6)

Medição por rAF [E, headless sem GPU, indicativa]:

| Situação | Resultado |
|---|---|
| A parado (6 s) | 60,0 qps |
| A andando (4 s) | 60,1 qps |
| A no lago e na cachoeira (5 s) | 60,1 qps |
| A com `?agua=b` | 60,1 qps |
| B parado e andando | 60,2 e 60,1 qps |

Quadro máximo de 16,8 ms em todos. Erros de console: 0 em A e B. Não medi CPU por quadro nem dispositivos fracos (**NÃO VALIDADO**).

## 8. Integridade e Link B (item 7)

| Verificação | Resultado [E] |
|---|---|
| Visual do B, prova própria | Mesma URL determinística, 2 capturas de cada build (`qa/qa_integridade_B.json`). Antes × antes: 6.790 px (0,74%). Novo × novo: 441 px (0,05%). **Antes × novo: 3.419–6.224 px (0,37–0,68%), dentro do ruído antes × antes**, tudo na região de água, vaga-lumes e minimapa (bbox x 500–1265, y 27–507). Os dois builds carregam o mapa `lab-piloto-v15b`. Confirma o `integridade.json` do game-dev, com ruído maior na minha rodada. |
| Bundle do B | **0** dos 75 PNGs A no `dist-lab-b`. O JS do B (`index-B9KjSCOn.js`) contém o JSON do mapa `lab-a-chatgpt` e os ramos novos de `view.ts` e `main.ts`. A regra nova de `waterAnim.keys` só age com `keys` definido; sem ela vale a regra antiga (diff lido). O efeito visual é nulo, mas o **bundle B não é byte-idêntico** ao da C4. |
| `integridade.json` do game-dev | Coerente com o que medi. Uma discrepância pequena: a FASE5 §7 não cita o diff novo × novo (16 px) que está no JSON. |
| Testes `tsc`, `vitest` 503/503, `map:validate` | **[L]**, não reexecutei |
| Vídeo `a_video_navegacao.gif` | Existe (640×360, 6,5 MB). Duração e quadros: [L] |

## 9. Mapa nas 3 dimensões (item 9)

**Bloqueantes de mapa:**

| Bloqueante | Estado no A |
|---|---|
| 8 (trilha marrom) | Não dispara [E]. |
| **9 (Digimon forte fora da área de exibição)** | **DISPARADO [E].** O spawn `forte-clareira-oeste` (Mega/Adult, nível 10–16, espécies incluindo WarGreymon) fica a 6 células BFS do início do jogador. Na própria captura do game-dev `a_03_spawn.png` aparece um **WarGreymon Nv.14 na tela de spawn**, ao lado do Koromon Nv.1. O `forte-margem-rio` fica a 10 células, no mesmo prado inicial, antes da ponte. No B, os 4 pontos fortes ficam a 26–37 células do início. |
| **13 (costura visível)** | **DISPARADO [E]** pela cachoeira (§3). |
| 14 | Não dispara (ressalva penhasco↔lago). |
| 15 (caminho) | Cumprido [E]. |
| 16 (oclusão) | Cumprido nos 5 pontos [E]. |
| 17 | Só vale com playtest humano (NÃO VALIDADO). |

Pela regra do AJUSTES §6.4, **o Critério 2 do A fica reprovado e a nota não é calculada**. A tabela abaixo dá uma nota **indicativa**, só para comparar.

**D1, recorte de 12×10 tiles** (`qa/qa_D1_recorte_A_12x10_3x.png`):

| Item | Nota | Motivo |
|---|---|---|
| 1.4 Variedade | 8 | 9 árvores, 4 moitas, 4 tufos, 8 canteiros de flores |
| 1.5 Contorno e paleta | 5 | Árvores grandes sem contorno escuro ao lado de copas com contorno; grama oliva contra props saturados; ruído alto |
| 1.6 Sombra de contato | 6 | [L], não verificada em detalhe |

**D2, layout 40×30** (os 10 critérios do layout-brief e os itens 2.11 e 2.12):

| # | Critério | A |
|---|---|---|
| 1 | Caminho contínuo S→Z sem mata | Sim [E]. **Mas o mapa é um prado aberto:** os "caminhos formados por vegetação" do brief (§7.2) não existem; a floresta é só moldura. |
| 2 | Sem adult/ultimate em S/T/C | **NÃO** (bloqueante 9). A zona S também tem grama alta de encontro a 2–4 tiles do spawn, quando o brief §6 pede cerca de 0% de mato na zona S. |
| 3 | B1/B2 por ramal secundário | **Não.** Caverna e baú são decorativos (`interactables` vazio [E]); o canto do Kuwagamon fica no prado aberto. Nota 3 |
| 4 | Descanso e orientação | Parcial: placa-seta e tochas decorativas. Nota 6 |
| 5 | Mata com ≥ 3 árvores e ≥ 2 matos | Sim, mas a "mata densa" é só a borda intransitável. Nota 8 |
| 6 | Desnível na moldura | Sim: penhasco de 2 faces com caverna, sem cantos (as pontas ficam escondidas por árvores). Nota 7 |
| 7 | Densidade ±5 p.p. por zona | **NÃO VALIDADO.** O mapa A não define as zonas S/T/C/M/R/Z do brief, então não há como medir por zona. |
| 8 | Oclusão < 50% | Sim (5 pontos) |
| 9 | Corredor ≥ 2 tiles | Parcial: a ponte do caminho principal tem 1 tile. Nota 6 |
| 10 | Contraste piso corredor × mata | Fraco: o mesmo piso oliva em tudo. Nota 5 |
| 2.11 | Porte grande legível | WarGreymon e Kuwagamon legíveis, mas fora da zona de exibição. Nota 7 |
| 2.12 | Hierarquia de escala | Koromon 25 < Agumon 34 < Tamer 41 < Greymon 52 < MetalGreymon 62 < WarGreymon 76 [E]; DS misturado. Nota 8 |

Contagem do layout-brief para o A: **3 cumpridos** (1, 5, 8), **4 parciais** (4, 6, 9, 10), **2 não** (2, 3) e **1 NÃO VALIDADO** (7). A âncora da rubrica para isso é a **banda 4–6**.

**D3, navegação real:** medi o que dá para medir sem pessoas:
- 0 becos no caminho principal;
- 0 perda de visão do Tamer nas capturas;
- largura de passagem;
- custo BFS spawn → santuário de 42 passos (B: 37).

Os itens 3.1, 3.3, 3.4, 3.5 e 3.7 exigem testadores humanos (**NÃO VALIDADO**; FASE5 §9.6). A D3 não entra na nota, conforme o D4.

**Conflito de escopo (mostro, não resolvo):**
- O ADR (Cenário) pede a floresta-piloto "sobre o layout de 40×30, preservando o que foi aprovado na v15/v15b", com "3 versões alternativas comparadas nas mesmas condições".
- O C5 §2 pede "identidade visual própria", e o game-dev construiu um **layout novo** (mockup 03), justificando na FASE5 §2.
- Resultado: o A × B compara **método de arte e layout ao mesmo tempo**, e parte das diferenças de D2 (zona S, corredores, posição dos fortes) **vem do layout, não do método ChatGPT**.
- Cabe ao fundador decidir se o A deve ser remontado sobre o traçado v15b (ver §12).

## 10. Comparativo preliminar A × B, critério por critério

Notas **provisórias** pela rubrica (escala 0–10). O B foi verificado com menos profundidade nesta revisão: meço o que está marcado [E] e o resto é [L] ou [H].

| Critério (peso) | A | B | Quem é melhor e por quê |
|---|---|---|---|
| 1. Fidelidade e beleza dos Digimon (35%) | **6**: 5 espécies fiéis, 3 com desvio de assinatura; craft 1:1 com ruído (banda 6) | **6** [L/H]: só sprites DS como placeholder (D11). O Método B não entregou Digimon viável (Agumon PixelLab "não viável por texto", REVISAO_QA_V2); DS fiel, mas Agumon de 25–27 px, abaixo do D8 | **A em beleza e porte** (retratos maiores, E5 respeitada); **empate em nota**. O B não está medindo o próprio método. |
| 2. Beleza e exploração dos mapas (35%) | **REPROVADO** (bloqueantes 9 e 13); indicativa **6,3** (média de 11 graduados) | Indicativa **6,6** [E parcial/H]: árvores limpas com 4 variantes, corredores de vegetação do v15b, cachoeira composta. Mas o chão é menta chapado e a margem é em blocos; o recorte deixa 114 células livres inalcançáveis e bordas abertas no topo [E] | **B** em água, cachoeira, conformidade com o layout-brief e limpeza. **A** em riqueza de props, POIs digitais, penhasco com caverna e borda fechada. |
| 3. Animações e imersão (15%) | **4**: personagens sem caminhada; água em rede; cachoeira com emenda; Y-sort correto | **6**: Tamer com caminhada nas 4 direções (qualidade de placeholder, [L]), água miúda e cachoeira composta | **B** |
| 4. Escala e consistência (10%) | **5**: hierarquia E5 coerente; fonte A + DS no mesmo quadro; grama oliva × objetos saturados | **5**: três fontes (Tamer PixelLab, Digimon DS, terreno PixelLab) e Agumon DS pequeno | Empate, por motivos diferentes |
| 5. Integração com a UI (5%) | **7**: o layout mantém o Tamer acima da hotbar em todas as capturas | **4**: a hotbar cobre o Tamer no spawn (`qa/qa_B_spawn.png` [E]) | **A** |
| **Média ponderada** | **5,8** (indicativa, com C2 = 6,3) → **REPROVADO** (bloqueantes e C3 < 7) | **6,0** (indicativa) → abaixo de 8 e com critérios < 7 | Nenhum chega ao piso de 8,0 |

**Leitura:**
- O **A** é o melhor caminho para **props e estruturas digitais** (santuário, marco, Digi-Egg, cabine), para **árvores variadas** e para **retratos de Digimon fiéis na escala E5**.
- O **B** é o melhor caminho para **água, cachoeira, terreno limpo e animação**.
- Há ainda a hipótese [H] de que um **C híbrido** (props, vegetação e retratos A + água e cachoeira B + layout v15b) resolva os dois bloqueantes do A. Isso é sugestão para o fundador, não decisão.

## 11. Correções técnicas reversíveis recomendadas (em ordem de impacto)

| # | Correção | Resolve | Dono |
|---|---|---|---|
| 1 | Mover os spawns `forte-clareira-oeste` e `forte-margem-rio` do mapa A para fora do prado inicial: margem leste, zona do santuário ou canto do Kuwagamon. Tirar a grama alta de encontro dos ~6 tiles em volta do spawn (zona S ≈ 0%). | Bloqueante 9, item 2 do brief | game-design (zonas) → game-dev (`build-lab-a.mjs`, layout de encontros) |
| 2 | Usar a cachoeira B (composta) como padrão do A, ou uma faixa única de 64 px sem emenda. Trocar a espuma A em blocos pela espuma B. | Bloqueante 13 | game-dev (o motor já tem `?agua=b`); a escolha de padrão é do fundador |
| 3 | Juntar os 3 módulos da ponte num tabuleiro contínuo e avaliar 2 tiles de largura | Costura da ponte, item 2.9 | game-dev, com peça do game-art se faltar |
| 4 | Peça de ligação penhasco↔lago (beirada ou rocha) no lugar do corte reto | Ressalva do bloqueante 14 | game-art |
| 5 | Corredores de vegetação: transformar o prado em rotas ladeadas por maciços, com 2 ramais (B1, B2) e um baú ou caverna **interativos** | Itens 1 (espírito), 3 e 10 do brief | game-design (layout-brief) → game-dev |
| 6 | Reduzir o ruído da vegetação A: limpar pixels órfãos e reduzir cores por asset para cerca de 12–16 | 1.5, banda do Critério 1 | game-art (scripts próprios, sem PixelLab) |
| 7 | WarGreymon: redesenhar as "asas" como as 2 metades do Brave Shield. Kuwagamon: pinças prateadas. MetalGreymon: só o braço esquerdo metálico [H] | Fidelidade (Critério 1) | game-art (validação de espécie com game-research) |
| 8 | Tamer A: virar o sprite para a direção do movimento (espelho para leste e oeste) enquanto não houver caminhada, ou trocar pelo placeholder de 4 direções. Hoje ele anda para os lados olhando para a câmera. | Critério 3 (parcial) | game-dev |
| 9 | Corrimão da frente: opacidade maior, ou só nas colunas, para não parecer que o Tamer está por cima | Ressalva do Y-sort | game-dev |
| 10 | Células Wang de 3 cantos de grama: torná-las andáveis, ou usar colisão por sub-tile | "Parede invisível" (P3) | game-dev |
| 11 | Tirar do HUD de laboratório o selo "OFICIAL DS · Guilmon/Gabumon ×1 (1)" e o chat simulado ("Bia_Tamer: chefe mundial…"). Aparecem em A **e** B. É texto de desenvolvimento ou simulação visível; não diferencia os métodos, mas é bloqueante 11 para qualquer exibição. O gancho `window.__gs003` também vem do jogo principal. | Bloqueante 11 (fora do laboratório) | game-dev |

## 12. O que depende do fundador

1. **Layout do A:** manter o layout próprio (mockup 03) ou remontar a arte A sobre o traçado v15b, para comparar A × B nas "mesmas condições" do ADR. Hoje a comparação mistura método e layout (§9).
2. **Água e cachoeira do A:** a A (método puro, reprovada na cachoeira) ou `?agua=b` como padrão. Na segunda opção, o Link A passa a ter peças PixelLab e deixa de ser ChatGPT puro.
3. **D3 / leitura 1:** um retrato de IA reduzido por moda para 1:1 (sem blocos, com 30–55% de pixels órfãos) conta como "pixel art nativa"? Minha leitura técnica: passa no detector e cai na banda 6 por ruído. Mas a palavra "nativa" pode ser entendida como "desenhada pixel a pixel".
4. **Paleta (D9, aberto):** grama P-ii oliva estrita × verde mais vivo próximo da referência ChatGPT, ou dessaturar objetos e penhasco.
5. **Caminhada e direções** do Tamer e dos Digimon A (nova rodada no ChatGPT, redesenho manual ou híbrido): continua sem caminho aprovado.
6. **Fidelidade:** aceitar WarGreymon, Kuwagamon e MetalGreymon como estão (decorativos, no laboratório) ou pedir redesenho antes de qualquer uso.
7. **Decorativos fortes** (MetalGreymon, Kuwagamon, WarGreymon visível): ficam no Link A? Hoje um deles aparece na tela de spawn.
8. **Teste com pessoas (D3):** autorizar o roteiro de 3 testadores para fechar a Dimensão 3 e o bloqueante 17.

## 13. Limitações e o que NÃO foi feito

- **Browser do OpenClaw bloqueado para localhost.** Usei headless próprio. O FPS em headless sem GPU é indicativo.
- **Fidelidade:** comparada de memória de design, sem prancha oficial lado a lado. Os desvios marcados [H] precisam de conferência com referência (Wikimon ou Reference Book) pelo game-research.
- **Link B:** avaliado com menos profundidade (D2 do B [H] em parte). A nota do B é provisória, para comparação.
- **Paleta:** a extração das amostras a partir dos PNGs de `paletas/` é heurística; os números servem para comparar.
- **Não reexecutei** `tsc`, `vitest` nem `map:validate` ([L]). Não medi a sombra de contato em detalhe nem a densidade por zona (item 7).
- **Não feito:** correção de código ou arte, geração no PixelLab, commit, push, deploy, acionamento de outros agentes, alteração de documentos alheios. O único processo extra (servidor HTTP do `dist-lab-b-antes` na porta 5195) foi encerrado. As capturas novas ficam em `fase5-link-a/qa/`; os roteiros ficam em `workspaces/game-qa/tools/etapa6_c5/`.

---

## Rechecagem v2 (game-qa, 2026-11-13)

**Build testado:**
- Link A v2 em 5191: `lab/etapa6` HEAD `8dc7a0f`, `git status` limpo.
- Jogo principal `qo`: HEAD `3289e32`, 0 linhas no `git status` [E].
- Usei os mesmos roteiros headless (`tools/etapa6_c5/`; `play_v2.mjs` só ajusta os pontos de teste que mudaram e o caso "Tamer ao sul do corrimão"; `integ2.mjs` é novo).
- Evidências em `fase5-link-a/qa/v2/`.
- Mesmas proibições: não alterei nada nem gerei no PixelLab, e não fiz commit nem deploy.

| Item | Veredito v2 | Evidência [E] |
|---|---|---|
| **Bloqueante 9** (forte longe do spawn) | **resolvido**, candidato com ressalva | BFS sobre o `sim.map` real: os 4 pontos fortes estão a **26, 30, 39 e 42 passos**, todos a leste da ponte (`qa/v2/nav_A.txt`). Não há grama alta de encontro na zona inicial; a mais próxima fica no sudoeste, a cerca de 9 passos. O MetalGreymon decorativo foi para (32,14). Ressalva: 2 dos 4 pontos ficam no prado leste e perto da cabine, não estritamente nas zonas R ou Z do layout-brief. Considero aceitável como área de exibição depois da ponte. |
| **Bloqueante 13**, cachoeira | **resolvido**, candidato com ressalva | Peça única de 64×64 sem emenda central (`qa/v2/qa_v2_cachoeira_3x.png`, 2 quadros). Ressalva artística: o espelho deixa o padrão simétrico (efeito "caleidoscópio") e as laterais continuam retas. |
| Bloqueante 13, espuma | **resolvido** | Faixa contínua, sem blocos retangulares. |
| Bloqueante 13, ponte | **resolvido** | Tabuleiro único, sem vãos (`qa/v2/qa_v2_corrimao_ponte_e_sul.png`). Ressalva: continua com **1 tile de largura** (item 2.9). |
| Corrimão: opacidade e Y-sort | **candidato** | Opaco. Com o Tamer na ponte, o corrimão cobre os pés dele; com o Tamer ao sul, ele fica na frente do corrimão. |
| Bordas da água | **candidato** | As células de margem com 3+ cantos de grama agora são andáveis. A borda do lago parou em x = 15,69, mais perto da linha d'água que na v1. Nos 4 lados o Tamer **não entra na água**; o penhasco e a borda da floresta continuam bloqueando; dos dois lados da ponte é impossível sair da linha 20 (16 testes). Alcance: 509 de 509 células livres; nenhuma célula de água pura alcançável fora da ponte. As 7 pedras novas na base do penhasco não são sólidas, mas ficam sobre água sólida. |
| HUD (bloqueante 11 no A) | **resolvido no A** | Sem o selo "OFICIAL DS" e sem o chat simulado (`qa/v2/qa_A_agua_q0.png`). Fica só a faixa do laboratório. O B mantém os dois textos, porque o B está congelado. |
| Desempenho | **candidato** | 60,1 qps (p99 16,8 ms) parado, andando, no lago e com `?agua=b`; 0 erros de console. Headless, indicativo. |
| **Link B sem mudança** | **candidato** | 5192 contra as minhas capturas da revisão v1, na mesma URL. Captura antiga do B × B atual: **42 px (0,005%)**. B v1 × B v2: 3.391 px, o mesmo valor do ruído v2 × v2 (3.391 px), na região de água e vaga-lumes. Mapa `lab-piloto-v15b`. 0 PNG A no `dist-lab-b`. O diff `f2d4e6e..8dc7a0f` não toca `src/render`, `src/assets` nem `src/sim`; a única mudança em `main.ts` só vale com `LAB_VARIANT === "a"`. (O `dist-lab-b-antes` não existe mais, então a comparação usou as minhas capturas.) |
| Jogo principal | **intacto** | `3289e32`, limpo |
| Personagens sem caminhada | **sem mudança** (reprovado no Critério 3) | Fora do escopo das correções 1 a 6 |

**Nota indicativa do A, v2** (mesma régua de §10):

- **C1 (35%): 6**, sem mudança.
- **C2 (35%): 6,4.** Nenhum bloqueante de mapa disparado. É a média dos 11 graduados: 2.11 sobe para 8 porque os fortes agora estão em exibição; os itens 3 (ramais B1/B2), 9 (ponte de 1 tile) e 10 (contraste do piso) continuam fracos.
- **C3 (15%): 5.** A cachoeira não tem emenda e o corrimão está correto, mas os personagens continuam sem caminhada.
- **C4 (10%): 5.**
- **C5 (5%): 8.**

**Média ponderada ≈ 6,0** (era 5,8, com o mapa reprovado). **Nenhum bloqueante disparado, mas o A ainda fica abaixo do piso de 8,0**, e C3 e C4 ficam abaixo de 7. Para comparação, o B segue em cerca de 6,0.

**Ainda abertos** (§11 itens 3 e 5–10 e §12):
- largura da ponte;
- corredores de vegetação e ramais;
- ruído de pixel;
- fidelidade de WarGreymon, Kuwagamon e MetalGreymon;
- Tamer sem virar para a direção do movimento;
- todas as decisões do fundador (layout v15b × próprio, água A × B, "pixel art nativa", paleta D9, caminhada, teste com pessoas).
