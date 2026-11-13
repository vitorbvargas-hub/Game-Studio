# COMPARATIVO_ESCALAS_E1_E5 — Etapa 6, Comando 2, passo 1 (game-art)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Base:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §1/§6 item 1; `PLANO_LABORATORIO_VISUAL_ETAPA6.md` §3; `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md` §4 (definição de E1–E4); `ESTUDO_ESCALA_DIGIMONS.md` §3/§5; `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6 (estimativas de código do `game-dev`).
- **Regra respeitada: nenhuma geração nova.** Todas as pranchas foram montadas por composição local (nearest-neighbor, fator inteiro) a partir de sprites e cenário **que já existem na conta/projeto**. `get_balance` antes e depois desta tarefa: **737,95/2000, sem variação — 0 gerações gastas**. Único acesso ao PixelLab: `get_character` (leitura/grátis, para obter a rotação sul já paga do Tamer v13 "Coragem") e `get_upload_url`/upload (grátis, usado só na Tarefa 1). Ferramenta usada para compor: script Python próprio sem dependências (`workspaces/game-art/tools/pxpng.py` + `build_pranchas.py`), fora da árvore do projeto.
- **Nenhuma hipótese fica aprovada aqui.** Este documento só mede e compara, como pede o comando.

## 0. Elenco e fontes (0 gerações)

| Entidade | Fonte | Caminho | Quadro nativo (W×H) | Altura de conteúdo nativa medida [E] |
|---|---|---|---|---|
| Tamer v13 "Coragem" (ref.) | PixelLab, personagem já pago (`8c4f8358-aa69-41cc-9637-105717d15392`), rotação sul, estado "Idle" | baixado via `get_character`→ZIP de export (download grátis, 0 geração) | 36×36 | **34 px** |
| Koromon (Baby II) | Sprite oficial DS (`official-fan-use`), `CREATURE-0005`, quadro `walk_S_01` (o quadro usado como `idle` no manifesto) | `GA/01-creatures/CREATURE-0005/sprites/` | 28×22 | **17 px** |
| Agumon (Rookie/Child) | Sprite oficial DS (`official-fan-use`), `CREATURE-0006`, quadro `walk_S_00` (idle) | `GA/01-creatures/CREATURE-0006/sprites/` | 30×30 | **27 px** |
| WarGreymon (Ultimate/Mega) | Sprite oficial DS (`official-fan-use`), `CREATURE-0016`, quadro `walk_S_00` (idle) | `GA/01-creatures/CREATURE-0016/sprites/` | 36×46 | **36 px** |
| Fundo | Recorte do mapa v15b aprovado (floresta-piloto), 768×576, tile 32 | `art/digi-forest-v15/v15b/v15b_crop_NW_1x.png` | — | — |

**Método de medição:** altura em px da caixa delimitadora de pixels opacos (alfa > 0) no quadro `idle`/frente-sul de cada entidade, antes de qualquer composição — a mesma convenção recomendada por `ESTUDO_ESCALA_DIGIMONS.md` §3.1 ("medir sempre a altura do bounding box opaco... no quadro idle sul, com o mesmo script"). Os valores batem, dentro de 0–1 px, com os já registrados em `ESTUDO_ESCALA_DIGIMONS.md` (Koromon 17 px exato; Agumon 27 vs. 26 documentado, 1 px de diferença por escolha de quadro; WarGreymon 36 px exato) — a pequena diferença no Agumon é esperada: aquele estudo mediu outro quadro da mesma animação.

**Elenco adicional:** não incluí o Agumon da folha do ChatGPT (F0-003, `RELATORIO_AVALIACAO_ASSETS_FASE0.md`) como 5º elemento comparativo. Motivo: a folha não tem grade de pixel real nem quadro isolado/recortado com contrato de escala (confirmado na Tarefa 1) — qualquer corte e redimensionamento que eu fizesse para encaixá-lo nesta prancha exigiria decisões de escala que a própria Fase 0 ainda não resolveu (qual quadro, qual altura "nativa" adotar), inventando um dado que o documento de Fase 0 explicitamente não fornece. Preferi manter esta prancha só com fontes já medidas e citadas no `ESTUDO_ESCALA_DIGIMONS.md`, e registro esta decisão para o fundador avaliar se quer o comparativo refeito com ele incluído (o comando trata isso como opcional: "se ajudar... pode incluir").

## 1. E1 — nativo 1× + câmera mais larga

**Como testei:** todos os 4 na escala nativa (fator 1, sem redimensionar nenhum sprite), compostos sobre o mesmo recorte 12×10 tiles (384×320 px) do cenário v15b. Também produzi uma variante de câmera mais larga (18×14 tiles, 576×448 px), mesma escala nativa, só para ilustrar a metade "câmera" da hipótese (não entra na tabela de métricas, que usa sempre o recorte 12×10 comum às 4 pranchas, para comparação justa).

**Arquivos:** `pranchas/E1.png` (recorte padrão), `pranchas/E1_camera_larga.png` (variante de câmera).

| Entidade | Fator | Altura de conteúdo (px) | Razão vs. Tamer | Razão vs. tile (32) |
|---|---|---|---|---|
| Tamer v13 | 1× | 34 | 1,00 | **1,06** |
| Koromon | 1× | 17 | 0,50 | 0,53 |
| Agumon | 1× | 27 | 0,79 | 0,84 |
| WarGreymon | 1× | 36 | 1,06 | 1,13 |

**Métricas do critério de escolha (`PLANO` §3):**
- Hierarquia Baby(17) < Rookie(27) < Tamer(34) ≤ Ultimate(36): **atendida**, mas Tamer e WarGreymon ficam a só 1,06× um do outro — visualmente quase do mesmo tamanho (o "WarGreymon ≈ Tamer" já documentado na Etapa 2).
- **Champion/Rookie ≥ 1,3** → aqui uso Ultimate/Rookie (36/27 = **1,33**) — **atende**, por pouco.
- **Tamer/tile entre 1,1 e 1,6** → 34/32 = **1,06** — **não atende** (fica abaixo do piso por uma margem pequena, ~0,04).
- Só fatores inteiros: **sim** (fator 1 em tudo).
- Legibilidade a 1920×1080: a prancha (384×320 nativos) ampliada à tela cheia deixaria Koromon (17 px de conteúdo) com poucos pixels de detalhe — mesmo risco já registrado no `07_BRIEFING` ("não resolve a hierarquia").

**Leitura:** E1 é a situação de hoje (o jogo já roda assim com `?dpr=1`, confirmado em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 1). Resolve **nenhum** dos dois critérios por boa margem — fica na fronteira dos dois.

## 2. E2 — escala por estágio (multiplicador inteiro)

**Como testei:** Koromon e Agumon mantidos em 1× (Baby/Rookie); WarGreymon em 2× (Ultimate/Mega, usando o próprio `mapScale: 2` já declarado — mas nunca aplicado em tempo de execução — no `creature.json` do `CREATURE-0016`); Tamer em 1× (referência humana, sem mudança). Mesmo recorte 12×10 do cenário.

**Arquivo:** `pranchas/E2.png`.

| Entidade | Fator | Altura de conteúdo (px) | Razão vs. Tamer | Razão vs. tile (32) |
|---|---|---|---|---|
| Tamer v13 | 1× | 34 | 1,00 | 1,06 |
| Koromon | 1× | 17 | 0,50 | 0,53 |
| Agumon | 1× | 27 | 0,79 | 0,84 |
| WarGreymon | **2×** | **72** | **2,12** | **2,25** |

**Métricas do critério de escolha:**
- Hierarquia Baby(17) < Rookie(27) < Tamer(34) < Ultimate(72): **atendida com folga**, WarGreymon agora domina visualmente a cena (regra do jogo original de "teto de legibilidade" é quebrada de propósito, como o `ESTUDO_ESCALA_DIGIMONS.md` §5 já antecipava).
- **Ultimate/Rookie ≥ 1,3** → 72/27 = **2,67** — **atende com folga.**
- **Tamer/tile entre 1,1 e 1,6** → 34/32 = **1,06** — **não atende**, exatamente igual a E1: E2 não mexe no Tamer, então **não corrige** esse eixo do critério.
- Só fatores inteiros: **sim** (1× e 2×).
- Custo de código: `game-dev` estima 0,5–1 dia (`scaleOf()` atrás de flag `?scale=stage`; colisão `radiusByStage` não muda) — não implementado nesta tarefa.

**Leitura:** E2 resolve bem a hierarquia entre Digimon, mas **deixa intocado** o problema "Tamer pequeno demais para o tile", porque só reescala as criaturas por estágio, nunca o Tamer.

## 3. E3 — Tamer e Digimon ×2, cenário no tile 32

**Como testei:** os 4 (Tamer + trio) em fator 2×, mesmo recorte de cenário (tile continua 32, sem reescalar o fundo) — equivalente ao `?creatureScale=2` que o motor **já suporta hoje** (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6).

**Arquivo:** `pranchas/E3.png`.

| Entidade | Fator | Altura de conteúdo (px) | Razão vs. Tamer | Razão vs. tile (32) |
|---|---|---|---|---|
| Tamer v13 | 2× | 68 | 1,00 | **2,13** |
| Koromon | 2× | 34 | 0,50 | 1,06 |
| Agumon | 2× | 54 | 0,79 | 1,69 |
| WarGreymon | 2× | 72 | 1,06 | 2,25 |

**Métricas do critério de escolha:**
- Hierarquia: **idêntica em proporção a E1** (Baby < Rookie < Tamer ≈ Ultimate) — dobrar tudo pelo mesmo fator **não muda nenhuma razão entre as entidades**. WarGreymon continua a só 1,06× do Tamer, o mesmo problema de E1, sem melhora.
- **Champion/Rookie ≥ 1,3** → 72/54 = **1,33**, igual a E1 (matematicamente obrigatório: escala uniforme preserva razões).
- **Tamer/tile entre 1,1 e 1,6** → 68/32 = **2,13** — **não atende, mas no sentido oposto a E1**: agora o Tamer é grande demais para o tile (passa do teto 1,6).
- Só fatores inteiros: **sim.**
- Custo de código: `game-dev` estima 0–0,5 dia (flag já existe; só checar HUD/sombra/copa translúcida a 2×).

**Leitura — achado central desta seção:** como E3 é uma escala **uniforme** sobre E1, ela **não resolve o problema de hierarquia** (WarGreymon continua quase do tamanho do Tamer, a mesma razão 1,06 de E1) — só troca um problema (Tamer pequeno no tile) por outro (Tamer grande demais no tile, mapa parecendo "apertado"). Isso bate com o risco já registrado no `07_BRIEFING` ("Tamer ~72 px domina o tile; mapa parece pequeno").

## 4. E4 — tile 16 nativo (só conceitual)

**Como testei (conceitual, não é arte real a 16 px):** sem nenhuma ferramenta para redesenhar o cenário em 16 px nesta tarefa (seria produção de arte nova, fora do escopo "sem geração"), simulei o conceito **decimando** a prancha de E1 inteira (cenário + entidades, já compostos) por um fator 2 (mantém 1 em cada 2 pixels, sem redesenho, sem suavização) — uma redução crua, só para visualizar a perda de detalhe que tile 16 implicaria caso a arte fosse literalmente "encolhida" em vez de redesenhada à mão.

**Arquivo:** `pranchas/E4.png` (192×160, metade linear de `E1.png`).

| Entidade | Fator equivalente | Altura de conteúdo (px) | Razão vs. Tamer | Razão vs. tile (16) |
|---|---|---|---|---|
| Tamer v13 | 0,5× (decimado de E1, não redesenhado) | 17 | 1,00 | 1,06 |
| Koromon | 0,5× | 8 | 0,47 | 0,50 |
| Agumon | 0,5× | 13 | 0,76 | 0,81 |
| WarGreymon | 0,5× | 18 | 1,06 | 1,13 |

**Leitura:** como é uma decimação uniforme de E1, as razões ficam praticamente idênticas às de E1 (diferenças de arredondamento de 1 px por entidade) — o critério de escala em si **não muda** com tile 16; o que muda é o **orçamento de pixels disponível por entidade**, que cai pela metade. Com Koromon a só 8 px de altura de conteúdo e Agumon a 13, o risco já registrado (`07_BRIEFING` §4: "contradiz a aprovação de tile 32"; `ESTUDO_ESCALA_DIGIMONS.md`: perda de legibilidade) fica visualmente evidente na prancha: a 1920×1080 essas entidades teriam poucos pixels de detalhe facial/de contorno, e qualquer arte real a 16 px precisaria ser **redesenhada do zero** (o `game-dev` estima 3–5 dias de código + "toda a arte do cenário refeita", `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6) — não apenas encolhida como fiz aqui.

## 5. Tabela consolidada e achado principal

| Hipótese | Ultimate/Rookie ≥ 1,3 | Tamer/tile ∈ [1,1; 1,6] | Só fatores inteiros | Resolve "WarGreymon ≈ Tamer"? | Custo de código [E, game-dev §6.6] |
|---|---|---|---|---|---|
| **E1** | 1,33 — atende (margem mínima) | 1,06 — **não atende** | sim | **Não** | 0 |
| **E2** | 2,67 — atende com folga | 1,06 — **não atende** (idêntico a E1) | sim | **Sim**, para Digimon; Tamer intocado | 0,5–1 dia |
| **E3** | 1,33 — atende (igual a E1) | 2,13 — **não atende** (teto estourado) | sim | **Não** (razão idêntica a E1) | 0–0,5 dia |
| **E4** | 1,38 — atende | 1,06 — **não atende** (idêntico a E1/E2) | sim | **Não** (razão idêntica a E1); perde pixels de detalhe | 3–5 dias + arte refeita |
| **E5** (§6, fatores independentes por entidade) | 4,00 — atende com folga maior que todas | 1,06 — **não atende** (idêntico a E1/E2/E4; Tamer ficou em 1×) | sim | **Sim**, com folga ampla; mas viola M4 (largura 87 px > corredor 64 px) | não estimado pelo `game-dev` nesta tarefa |

**Achado principal, com evidência direta das 4 pranchas:** **nenhuma das 4 hipóteses, isoladamente, atende aos dois critérios do `PLANO` §3 ao mesmo tempo.** A razão Tamer/tile fica presa em ~1,06 em E1, E2 e E4 (porque nenhuma delas reescala o Tamer) e só muda em E3 — mas aí ultrapassa o teto de 1,6 (vai a 2,13), porque E3 reescala Tamer e Digimon pelo **mesmo** fator uniforme, o que também deixa a razão Champion/Rookie sem nenhuma melhora (ela é invariante a uma escala uniforme, por definição matemática). Dito de outro modo: **o problema tem dois eixos independentes** (hierarquia entre estágios de Digimon × proporção do Tamer para o tile), e E1–E4, como definidas, só mexem em um eixo de cada vez (E2: só hierarquia; E3: só o eixo Tamer/tile, e erra a dose) ou em nenhum dos dois (E1, E4). Uma hipótese que resolvesse os dois ao mesmo tempo precisaria combinar uma escala modesta do Tamer (não necessariamente a mesma de todos os Digimon) com uma escala maior por estágio nos Digimon — exatamente o tipo de abordagem "por espécie e porte visual" que o comando já reservou para a **E5** (ver placeholder abaixo), não decidida aqui.

## 6. E5 — escala por espécie e porte visual (passo 3, `game-art`)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13 (continuação).
- **Base:** seção 5 deste documento (achado matemático); §7.1–§7.3 e §7.8 (classes de porte e metas M1–M7 propostas pelo `game-design`).
- **Regra respeitada: nenhuma geração nova.** Reaproveita exatamente os mesmos 4 sprites e o mesmo recorte de cenário de E1–E4, com um 5º script local (`workspaces/game-art/tools/build_e5.py`, mesma dependência `pxpng.py`, sem bibliotecas pagas). `get_balance` antes e depois desta tarefa: **sem variação, 0 gerações gastas** (ver §9). **Nenhuma hipótese fica aprovada aqui.**

### 6.1 Como testei

Diferença estrutural em relação a E2 (que agrupava as 4 entidades em só 2 fatores — "Tamer+Baby+Rookie" em 1× e "Champion+" em 2×): em E5 **cada entidade recebe seu próprio fator inteiro**, escolhido pela classe de porte (§7.3), não por um agrupamento binário por estágio numérico. Limitação da ferramenta, registrada e não escondida: `pxpng.nn_scale` só faz nearest-neighbor por fator **inteiro** uniforme (x e y), sem escala fracionária nem por eixo.

**Fatores escolhidos** (justificativa em §6.3):
- **Tamer v13 → 1×** — mantido sem mudança.
- **Koromon → 1×** — classe Pequeno (§7.3).
- **Agumon → 1×** — classe Médio; teto imposto pela hierarquia (não pode superar a altura do Tamer, ver §6.3).
- **WarGreymon → 3×** — classe Gigante; fator maior que o testado em E2 (2×), para explorar deliberadamente o limite superior da classe e checar as metas M3/M4 do `game-design` (§7.8) em um ponto que E1–E4 nunca testaram.

**Arquivo:** `pranchas/E5.png` (recorte 12×10 padrão, igual a E1–E4, para comparação justa). `E_comparativo.png` foi regenerado incluindo E5 como 5º painel.

### 6.2 Métricas medidas [E, `pranchas/metrics.json`]

| Entidade | Fator | Altura de conteúdo (px) | Largura de conteúdo (px) | Razão vs. Tamer (altura) | Razão vs. tile (32) |
|---|---|---|---|---|---|
| Tamer v13 | 1× | 34 | 24 | 1,00 | 1,06 |
| Koromon | 1× | 17 | 19 | 0,50 | 0,53 |
| Agumon | 1× | 27 | 20 | 0,79 | 0,84 |
| WarGreymon | **3×** | **108** | **87** | **3,18** | **3,38** |

### 6.3 Leitura contra os critérios do `PLANO` §3 e as metas M1–M7 (§7.8)

- **Hierarquia Baby(17) < Rookie(27) < Tamer(34) ≤ Ultimate(108):** **atendida**, e com folga muito maior que qualquer hipótese anterior — WarGreymon deixa de "quase do mesmo tamanho que o Tamer" (1,06× em E1/E3) para dominar claramente a cena (3,18×).
- **Ultimate/Rookie ≥ 1,3** → 108/27 = **4,00** — atende com folga bem maior que E2 (2,67) ou E1/E3 (1,33). **Achado:** a folga em excesso é, em si, um dado — reportado como risco em §6.4, não como vitória automática.
- **Tamer/tile entre 1,1 e 1,6** → 34/32 = **1,06** — **não atende, idêntico a E1/E2/E4.** **Achado central desta seção, que confirma e aprofunda a ressalva do `game-design` em §7.1:** mesmo tratando o fator do Tamer como variável independente dos Digimon (o que E5 faz, diferente de E1–E4), **não existe fator inteiro que resolva este eixo isoladamente para o sprite atual do Tamer.** 1× dá 1,06 (abaixo do piso 1,1); o próximo fator inteiro disponível, 2×, dá 2,13 (acima do teto 1,6, o mesmo erro de E3). A independência de variáveis que §7.1 propõe resolve a *hierarquia entre Digimon* (confirmado acima), mas **não** resolve, por si só, a proporção Tamer/tile — porque esse eixo depende só do fator do próprio Tamer, e o espaço de fatores inteiros disponíveis para a altura nativa de 34 px (frente a um tile de 32 px) simplesmente não tem um valor entre 1,1× e 1,6×. Resolver este eixo específico exigiria uma das duas rotas, nenhuma executável nesta tarefa (regra de "nenhuma geração nova"): (a) uma escala não-inteira ou por reamostragem de área (ferramenta diferente de `nn_scale`, com perda de nitidez de pixel art — tipicamente rejeitada em pixel art por introduzir pixels "meio-tom"); (b) redesenhar o sprite do Tamer com mais conteúdo/padding no mesmo quadro 36×36 (arte nova, fora do escopo deste comando). Nenhuma das duas é uma decisão de composição — ambas dependem do fundador.
- **M3 (altura mínima de conteúdo ≥14 px para legibilidade de combate, §7.8):** Koromon (17 px) e Agumon (27 px) seguem acima do piso, sem mudança em relação a E1–E4 (nenhum dos dois teve o fator alterado). **Atende.**
- **M4 (largura do footprint da classe Grande/Gigante ≤ 50% do corredor mínimo de 2 tiles = 64 px, ou seja ≤32 px, §7.8):** **WarGreymon a 3× mede 87 px de largura de conteúdo — quase 1,4× o corredor mínimo inteiro (64 px), não apenas acima da meta de 32 px.** Este é o achado mais concreto de E5, só visível porque esta hipótese testou um fator maior que 2×: um WarGreymon em classe "Gigante" neste porte **não cabe** no corredor mínimo do layout-brief sem bloquear visualmente a passagem, mesmo que a colisão (`radiusByStage`) continue menor que a silhueta (rota 1 de §7.4) — a sensação de bloqueio seria visual, não de regra de jogo, o próprio risco que §7.4 e §7.6 item 2 já anteciparam sem número concreto. Com WarGreymon em 2× (como testado em E2), a largura seria 58 px — ainda abaixo de 64 px, mas já sem a folga de 50% que M4 pede (58/64 ≈ 91% do corredor, folga de só 9%). **Ou seja: mesmo o fator 2× de E2, não só o 3× de E5, já é limítrofe contra M4** — achado que só esta seção, ao somar largura (não só altura) à análise, revela.
- **Só fatores inteiros:** sim (1× e 3×), mas **o próprio exercício de E5 mostra que "só fatores inteiros" é, em si, um critério que colide com o piso de Tamer/tile** para o sprite atual — não é uma escolha de composição que E5 tenha feito mal; é uma propriedade do canvas nativo do Tamer (34 px de conteúdo em 36×36) frente ao tile de 32 px.

### 6.4 Leitura de conjunto — o que E5 resolve e o que não resolve

**O que E5 confirma, com evidência nova:** tratar o fator do Tamer e o fator por espécie/porte de Digimon como variáveis independentes (§7.1) **resolve bem o eixo da hierarquia entre Digimon** — a classe "Gigante" pode ser tão expressiva quanto o design quiser (testada aqui a 3×, poderia ir a 4× ou mais) sem arrastar o Tamer ou o Rookie para o mesmo fator, o que E2 (fator único para "Champion+") e E3 (fator único para tudo) não conseguiam separar tão livremente.

**O que E5 não resolve, e por que isso é informação útil, não uma falha de execução:** o eixo Tamer/tile continua fora da faixa em todas as 5 hipóteses testadas nesta tarefa (E1, E2, E4: 1,06×; E3: 2,13×; E5: 1,06×, porque manteve o Tamer em 1× como as três primeiras). **As 5 hipóteses, juntas, mostram que o eixo Tamer/tile não é resolvido por nenhuma combinação de fatores inteiros aplicada ao sprite atual do Tamer** — só muda de "abaixo do piso" (1,06×, quando o Tamer fica em 1×) para "acima do teto" (2,13×, quando o Tamer vai a 2×), sem nenhum valor intermediário disponível. Isso não é mais uma hipótese em aberto: é uma conclusão fechada sobre o espaço de fatores inteiros com o sprite atual, que só a introdução de uma variável fora da escala (redesenho do sprite, ou revisão da própria faixa-alvo 1,1–1,6) pode mudar — ambas decisões do fundador, não deste laboratório.

**Achado adicional sobre largura (não testado por nenhuma hipótese anterior):** a classe "Gigante" testada em E5 (WarGreymon 3×) viola a meta M4 por uma margem grande (87 px vs. 64 px de corredor), e mesmo a classe testada em E2 (2×) já fica limítrofe (58 px vs. 64 px). **Recomendação de composição, sem decidir a escala:** se a classe "Gigante"/"Grande" for adotada em qualquer fator ≥2×, o layout-brief precisa reservar corredores mais largos que o mínimo de 2 tiles especificamente nas zonas onde essas entidades aparecem (zona R, item do layout-brief §4/§5/§8 já citado em §7.6) — ou a classe precisa de um teto de fator menor que 3× para caber no corredor padrão.

### 6.5 Resposta ao achado da seção 5

A seção 5 previu que "uma hipótese que resolvesse os dois eixos ao mesmo tempo precisaria combinar uma escala modesta do Tamer... com uma escala maior por estágio nos Digimon". **E5 testa exatamente essa combinação e confirma que ela resolve só um dos dois eixos** (hierarquia, com folga ampla) — porque a "escala modesta do Tamer" que a seção 5 imaginava não existe como fator inteiro para o sprite atual (§6.3). O achado da seção 5 estava certo em identificar a direção (variáveis independentes), mas a expectativa implícita de que isso bastaria para resolver os dois eixos não se confirma: o eixo Tamer/tile é limitado pelo **sprite do Tamer em si**, não pela estratégia de agrupamento de fatores.

## 7. Revisão de escala do `game-design` (passo 2 de 5)

- **Autor:** game-design (subagente) · **Data:** 2026-11-13.
- **Base lida:** seções 0–6 deste documento (game-art); `ESTUDO_ESCALA_DIGIMONS.md` (tabela por espécie §3, 5 réguas §4, trio recomendado §5); `pranchas/metrics.json` e `pranchas/E_comparativo.png` (evidência visual direta); `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 (layout-brief, zonas, requisitos de legibilidade §7, critérios §10); `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 (critério 4, Escala e consistência); `qa/ETAPA2_HOMOLOGACAO.md` §D/§E (G1, G2, itens 2 e 8).
- **Regra respeitada:** nenhuma hipótese de escala é decidida ou aprovada aqui. Esta seção só confirma/contesta a conclusão de §5 com evidência própria e lista requisitos de design para a E5, que o `game-art` documenta no passo 3. Nenhum PixelLab usado, nenhum código/mapa/sprite alterado, nenhum outro agente acionado.

### 7.1 Confirmação (com uma ressalva) da conclusão de §5

**Confirmo o achado matemático de §5: dentro do espaço de hipóteses E1–E4, os dois eixos são independentes.** A prova está nas próprias tabelas de §1–§4: qualquer escala **uniforme** (o mesmo fator aplicado a todas as entidades, como em E3 e, na prática, em E1/E4, onde o fator é sempre 1× ou 0,5× para tudo) preserva por definição toda razão entre duas entidades — por isso Ultimate/Rookie fica travado em 1,33 em E1 e E3 (idêntico) e quase igual em E4 (1,38, diferença de arredondamento de decimação), e só muda em E2, a única hipótese que trata o Digimon por estágio separadamente do Tamer. Pelo mesmo motivo, só E3 corrige Tamer/tile (porque é a única que reescala o Tamer) — e erra a dose por estourar o teto, porque reescalar o Tamer pelo **mesmo** fator do Digimon mais alto é a própria causa de não sobrar folga no eixo Champion/Rookie.

**A ressalva:** essa independência é uma propriedade do desenho de E1–E4 (cada uma usa no máximo *dois* fatores de escala — um para o Tamer, um para "os Digimon" como grupo), não uma lei física do problema. Os dois eixos deixam de ser travados no instante em que se introduz um **terceiro grau de liberdade**: um fator próprio por espécie/estágio de Digimon, independente e dissociado do fator do Tamer — exatamente o que o comando já reserva para a E5 ("escala por espécie e porte visual"). Não contesto o achado de §5; contesto apenas a leitura de que ele mostra uma **impossibilidade** — ele mostra que **nenhuma escala uniforme ou por-apenas-dois-grupos resolve os dois eixos ao mesmo tempo**, o que é diferente de dizer que nenhuma escala resolve. A E5 só tem chance de funcionar se tratar "fator do Tamer" e "fator por espécie de Digimon" como duas variáveis genuinamente independentes, não uma reformulação de E1–E4 com mais etiquetas.

### 7.2 Como altura, largura, postura e presença no mapa devem entrar na E5

**Altura:** é a variável que E1–E4 já testam (altura de conteúdo do bounding box opaco). A E5 deve continuá-la, mas descolada do fator único do Tamer — i.e., a altura de cada Digimon vem da classe de porte da espécie (§7.3), não de "multiplicar tudo por N".

**Largura — eixo ainda não testado em E1–E4 e com evidência de que importa:** as 4 pranchas e `metrics.json` só reportam altura, mas os próprios dados já coletados por `pxpng.py`/`build_pranchas.py` também trazem `content_width_px`, que eu usei aqui como evidência adicional, sem recompor nenhuma prancha nova:

| Entidade | Altura 1× (px) [E, `metrics.json`] | Largura 1× (px) [E, `metrics.json`] | Razão largura/altura |
|---|---|---|---|
| Tamer v13 | 34 | 24 | 0,71 |
| Koromon | 17 | 19 | **1,12** |
| Agumon | 27 | 20 | 0,74 |
| WarGreymon | 36 | 29 | 0,81 |

**Achado, com evidência [E]:** Koromon é a única entidade do elenco mais **largo que alto** (razão 1,12), porque é um blob sem membros — e, apesar de ter a menor altura de todo o elenco (17 px, 0,5× o Agumon), sua largura (19 px) é quase igual à do Agumon (20 px), que é mais que o dobro de alto. **Isso significa que uma classe de porte baseada só em altura classificaria Koromon como "muito menor" que Agumon, mas a área ocupada no chão (footprint) dos dois é muito mais parecida do que a altura sozinha sugere.** É evidência concreta, não hipotética, de que largura é um eixo que a E5 precisa medir e não pode inferir da altura. A prancha `E_comparativo.png` confirma isso visualmente: a silhueta de Koromon lê como um "disco" largo e baixo, não como uma miniatura proporcional do Agumon.

**Postura (bípede/quadrúpede/voador):** nenhuma das 3 entidades do trio de prova é quadrúpede ou voadora (Tamer e Agumon são bípedes; Koromon é um blob sem postura definida; WarGreymon é bípede-dragão, mas com asas/armadura que alargam sua silhueta além do corpo). Isso é uma **lacuna do elenco de teste**, não um dado que falta à franquia: o piloto da Database já tem espécies quadrúpedes (Dorumon, Garurumon, Gabumon em sua forma de pele, Drimogemon) e poucas voadoras diretas no piloto atual, mas o roster completo do jogo tem Patamon (voador) citado no próprio layout-brief (§6.4 da Parte 1, spawn de estágio child). Como requisito de design, a E5 precisa de uma regra por postura, não só por estágio:
- **Bípede:** altura de conteúdo é a referência de porte (caso já coberto por E1–E4).
- **Quadrúpede:** a largura (comprimento do corpo deitado) tende a dominar sobre a altura — um quadrúpede do mesmo "estágio" que um bípede pode ter altura de conteúdo menor, mas ocupar mais espaço horizontal de tile. Medir porte só pela altura subestimaria sistematicamente os quadrúpedes (risco já citado, sem medição, em `ESTUDO_ESCALA_DIGIMONS.md` §3, nota de Garurumon: "ganha massa/comprimento, não altura, ao evoluir").
- **Voador:** a altura de conteúdo do sprite de mapa (visto de cima/3-4) pode não refletir a envergadura real (asas abertas lateralmente, não para cima) — a E5 precisa decidir se mede "altura do corpo" ou "maior dimensão da silhueta", porque são números diferentes para esta postura especificamente.

**Presença no mapa:** é o resultado combinado de altura + largura + postura + opacidade do sprite (quanto da área do bounding box é pixel opaco vs. vazio) — um Digimon "alto mas fino" (ex.: um design serpentino) tem presença visual menor que um "baixo mas largo" de mesma área de bounding box. Nenhuma das 4 hipóteses E1–E4 mede isso; é outro motivo para a E5 não ser só "mais um multiplicador".

### 7.3 Classes de porte propostas [H]

Partindo das classes qualitativas já propostas em `ESTUDO_ESCALA_DIGIMONS.md` §3 (Pequeno/Médio/Grande/Gigante, hoje baseadas só em altura e com rótulo [INFERÊNCIA] por espécie), proponho refiná-las em 2 dimensões (altura × largura relativa) em vez de 1, com um modificador de postura — **tudo marcado [H], para a E5 decidir se adota:**

| Classe | Banda de altura (razão vs. Tamer) | Banda de largura (razão vs. altura, i.e. o quão "largo" é o design) | Nota |
|---|---|---|---|
| Pequeno | 0,45–0,75× | qualquer (blobs tendem a >1,0 — ver Koromon) | Baby I/II |
| Médio | 0,85–1,15× | 0,6–0,9 (silhueta mais vertical que larga, padrão bípede) | Child/Rookie |
| Grande | 1,2–1,6× | 0,7–1,0 (ganha largura proporcionalmente mais que altura, pela armadura/porte) | Adult/Champion, alguns Perfect |
| Gigante | ≥1,7× (ou, para quadrúpede/voador, largura ≥1,7× a altura de um Médio de referência, mesmo com altura menor) | sem banda fixa — definido caso a caso | Ultimate/Mega de maior reputação canônica (ex.: Omnimon, citado em `ESTUDO_ESCALA_DIGIMONS.md` §3 como "gigante por reputação, não medição") |

**Por que a classe "Gigante" não tem banda fixa de largura:** é justamente o caso em que postura (quadrúpede/voador) pode produzir presença de "gigante" sem altura de bounding box alta — a classe precisa de um critério alternativo (largura ou área total) para não deixar esses casos de fora, replicando o mesmo erro que a régua de altura sozinha já comete com Koromon (§7.2).

### 7.4 Limites de colisão e ocupação de tile

**Fato já levantado por `ESTUDO_ESCALA_DIGIMONS.md` §4, que esta revisão reafirma como requisito, não como novidade:** o jogo já tem uma régua de colisão (`radiusByStage`, 12/16/22/26/30 px por estágio numérico 1–5) **independente** da altura do sprite — hoje, Numemon (23 px de sprite) e Greymon (37 px), ambos Champion, compartilham o mesmo raio (22 px). Isso é uma decisão de jogo (gameplay), não uma medida de arte, e **este estudo não a altera**.

**Requisito de design para a E5:** a nova escala por espécie e porte **não deve** assumir, sem decisão explícita, que o raio de colisão passa a acompanhar a nova altura/largura visual 1:1. Há duas rotas possíveis, e a E5 precisa escolher uma e declará-la, não herdar por omissão:
1. **Manter colisão por estágio** (como hoje), dissociada da escala visual nova — risco: um Digimon visualmente "Gigante" por porte (largo, armadura grande) continua bloqueando o mesmo espaço de tile que um "Médio" do mesmo estágio numérico, o que pode parecer errado visualmente (a hitbox menor que a silhueta).
2. **Fazer a colisão acompanhar a classe de porte** (§7.3), não só o estágio — mais coerente visualmente, mas muda uma regra de jogo hoje congelada (contexto comum §2: "regras de jogo congeladas até a identidade visual ser definida") e precisa de decisão do fundador, não é escolha de arte.

**Ocupação de tile:** independente da rota de colisão escolhida, a E5 precisa registrar, por classe de porte, **quantos tiles de largura o footprint visual ocupa** no corredor mínimo de 2 tiles já exigido pelo layout-brief (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` §10 critério 9). Um Digimon classe "Grande"/"Gigante" cuja largura de conteúdo já se aproxime de 2 tiles (64 px) deixaria o corredor mínimo visualmente "apertado" mesmo sem bloqueio de colisão — métrica proposta em §7.8.

### 7.5 Legibilidade em combate no próprio mapa

ADR-009 fixa que o combate acontece **no próprio mapa**, nunca em tela separada, e que **a animação nunca decide o resultado** — ou seja, o jogador precisa **ver** o que está acontecendo para que a informação de combate (quem está atacando, quem foi atingido, estados IDLE/WALK/FOLLOW/ENGAGE/ATTACK/HURT/DEFEAT/RETURN) seja legível em tempo real, não deduzida depois. Isso impõe requisitos de design que a E5 precisa respeitar, além dos puramente estéticos:

1. **Nenhuma classe de porte pode ocluir o Tamer ou um Digimon menor durante o combate.** Isso já é um requisito do layout-brief (§7 item 1: "Tamer e Digimon sempre visíveis"; critério verificável §10 item 8: oclusão ≤50%), mas a E5 adiciona um risco novo: um Digimon "Grande"/"Gigante" mais largo (não só mais alto) ocupa mais área de tela **horizontalmente**, podendo ocluir um aliado ao lado mesmo sem estar "na frente" dele em profundidade (Y-sort correto não resolve oclusão lateral).
2. **HUD por entidade (nome, nível, barra de vida/golpes) precisa escalar com a classe de porte sem colidir com a HUD de uma entidade vizinha.** Isso já é o Critério 5 da rubrica ("Integração com a UI"), mas a E5 introduz um porte maior que não existia nos sprites atuais — a E5 deve prever, não só medir depois, o espaço necessário acima da cabeça de um "Gigante" sem que esse espaço invada o HUD de uma entidade ao lado em corredores estreitos (2 tiles).
3. **Estados de combate (ATTACK, HURT) precisam permanecer legíveis na escala escolhida.** Um sprite maior tem mais pixels disponíveis para comunicar antecipação de ataque (Critério 3 da rubrica, "Animações e imersão"), mas um sprite menor (Pequeno) corre o risco oposto: perder o poucos pixels de detalhe que comunicam o estado — a E5 deve registrar uma altura mínima de conteúdo abaixo da qual estados de combate deixam de ser legíveis (proposto em §7.8).

### 7.6 Digimon forte visível na área de exibição

O layout-brief já reserva a zona **R (margem do rio)** especificamente para isso (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 §4/§5/§8: um Digimon adult/ultimate aparece "visível à distância", "parado ou em rota fixa curta, nunca perseguindo o jogador" — resolvendo G2). A E5 precisa tratar isso como requisito de design, não só de arte:

1. **A classe de porte "Grande"/"Gigante" só cumpre essa função se for legível à distância em que o layout posiciona a exibição.** Uma altura de conteúdo grande não ajuda se a câmera/zoom do jogo não deixar essa altura visível com nitidez a partir do ponto em que o jogador primeiro avista a zona R — a E5 deve declarar a que distância (em tiles, a partir do ponto de entrada na zona R) o Digimon de exibição precisa estar legível, não assumir que "maior é sempre melhor visto".
2. **O Digimon de exibição não deve, pela sua largura (classe "Grande"/"Gigante"), parecer bloquear fisicamente a passagem** mesmo estando, por regra de jogo, fora do caminho de colisão (zona R não é corredor obrigatório, mas é adjacente a ele) — um porte muito largo nesse ponto específico pode confundir o jogador sobre se o caminho está livre, contrariando o requisito de legibilidade §7 item 2 do layout-brief ("nunca ficar ambíguo sobre onde o jogador pode andar").
3. **A hierarquia de porte só "funciona" como marco de progressão (ADR-009, diferenciais do jogo) se o jogador já tiver visto as classes menores (Pequeno/Médio) antes de chegar à zona R** — isso já está garantido pela ordem do percurso no layout-brief (T antes de M antes de R), mas é um requisito de **sequenciamento**, não só de escala absoluta: a E5 deve ser avaliada com o trio completo em sequência (como o `game-art` já fez em §0–§4), nunca com uma única espécie isolada fora de contexto de percurso.

### 7.7 Tamer em relação à vegetação e às portas

**Vegetação:** o requisito já existe no layout-brief (§7 item 1: nenhum tufo/copa deve cobrir o sprite por completo; §10 item 8: oclusão ≤50% em ≥5 pontos do percurso) e depende de Y-sort correto (pendência técnica já registrada em `V15B.md`, repassada de novo aqui). A E5 acrescenta um requisito específico: **a largura do Tamer** (24 px em 1×, `metrics.json`) **precisa ser menor que a abertura mínima entre dois maciços de mato/árvore adjacentes** nas zonas de mata densa (M) — se a E5 aumentar a escala do Tamer (eixo que §7.1 já mostrou ser necessário mexer para resolver Tamer/tile), a largura cresce junto com a altura, e o requisito de abertura mínima precisa ser recalculado para a nova largura, não só verificado contra a altura.

**Portas e estruturas (futuras):** o contexto comum (§1.2, ADR-015) autoriza recriar estruturas reconhecíveis (ex.: Torres Negras, cabines telefônicas) no desenvolvimento interno. Nenhuma estrutura desse tipo está no layout-brief atual (que é só floresta), mas como requisito de design prospectivo para a E5: **qualquer abertura/porta futura precisa ser dimensionada em função da largura do Tamer na escala escolhida, não da altura** — uma porta alta o suficiente mas estreita demais para a largura do Tamer pós-E5 seria um erro de composição que só aparece se a largura virar variável explícita de design (exatamente o ponto central de §7.2).

### 7.8 Metas mensuráveis propostas [H] — nenhuma decide a escala

| # | Meta proposta | Como medir | Status |
|---|---|---|---|
| M1 | Altura por classe de porte dentro das bandas de §7.3 | `content_height_px` / altura do Tamer na mesma escala | [H] |
| M2 | Largura por classe de porte dentro das bandas de §7.3 (razão largura/altura) | `content_width_px` / `content_height_px` do próprio sprite | [H] |
| M3 | Altura mínima de conteúdo para legibilidade de estado de combate | Proposto ≥14 px de conteúdo na escala final (piso observado em Koromon hoje, 17 px, já citado como "minúsculo" na Etapa 2 item 2 — qualquer coisa abaixo disso é risco conhecido, não hipótese) | [H] |
| M4 | Largura do footprint vs. corredor mínimo (2 tiles = 64 px) | `content_width_px` da classe "Grande"/"Gigante" ≤ 50% da largura do corredor mínimo (≤32 px), para não ler como bloqueio | [H] |
| M5 | Oclusão por vegetação | Já existe no layout-brief (§10 item 8, ≤50%); a E5 deve reconferir com a largura nova do Tamer, não só a altura | [H], critério herdado |
| M6 | Distância de legibilidade do Digimon de exibição (zona R) | Proposto: legível (contorno e cor-base distinguíveis) a partir do ponto de entrada na zona R, sem exigir aproximação adicional | [H] |
| M7 | Abertura mínima entre maciços de vegetação (M) vs. largura do Tamer na escala escolhida | Proposto: abertura ≥ 1,5× a largura do Tamer pós-E5 | [H] |

### 7.9 O que esta seção não faz

- Não decide nem recomenda qual das classes/bandas acima é a resposta certa — isso é o passo 3 (`game-art`, E5) e a decisão final do fundador.
- Não altera `radiusByStage` nem nenhum outro valor de jogo — as duas rotas de §7.4 ficam registradas como decisão em aberto, não escolhidas.
- Não inclui espécie quadrúpede ou voadora medida (nenhuma está no trio de prova) — os requisitos de postura (§7.2) são propostos por lacuna identificada, não verificados em sprite real nesta tarefa.

## 8. Limitações desta entrega

1. Nenhuma hipótese fica aprovada — este documento só mede e compara, como pede o comando.
2. A tabela usa só as 4 entidades do briefing (Tamer v13 + Koromon + Agumon + WarGreymon); a espécie Champion/Adult intermediária (ex.: Greymon) citada em outros documentos (`07_BRIEFING` §3) não está no elenco deste comando e não foi incluída.
3. O Agumon da folha do ChatGPT (F0-003) não entrou como 5º elemento comparativo, por decisão registrada na seção 0 (falta de grade de pixel real/contrato de escala).
4. E2 e E4 são conceituais/compostas localmente: nenhum código de jogo foi alterado (regra do comando); as estimativas de esforço de código vêm do `game-dev` (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6), não verificadas de novo aqui.
5. A "câmera mais larga" de E1 (`E1_camera_larga.png`) é só ilustrativa: a tabela de métricas usa sempre o recorte padrão 12×10, para manter as 4 pranchas comparáveis entre si.
6. As imagens-fonte (Tamer v13, 3 Digimon, cenário) já existiam na conta/projeto antes desta tarefa; nenhuma foi gerada nem editada por IA nesta entrega — só recortada, redimensionada por fator inteiro (nearest-neighbor) e composta, com um script Python local sem dependências pagas.
7. **E5 (§6) testa um único ponto do espaço de fatores por entidade** (Tamer 1×, Koromon 1×, Agumon 1×, WarGreymon 3×), escolhido para explorar deliberadamente o limite superior da classe "Gigante" e revelar a violação de M4 — não é uma busca exaustiva de todas as combinações possíveis de fatores inteiros por entidade. Outras combinações (ex.: WarGreymon 2× com Agumon mantido em 1×, idêntica a E2 numericamente) não foram repetidas aqui por já estarem medidas em E2.
8. **Nenhuma espécie quadrúpede ou voadora foi testada em E5** — os requisitos de postura (§7.2) permanecem propostas não verificadas em sprite real, mesma limitação já registrada em §7.9.
9. O custo de código de E5 (um fator por entidade, não por grupo de estágio) não foi estimado pelo `game-dev` nesta tarefa — fica como pendência para a sequência (passo 4/5).
10. O script `build_e5.py` (novo, reutiliza `pxpng.py`) fica em `workspaces/game-art/tools/`, fora da árvore do projeto, não comitado em `GS-003`, igual aos scripts do passo 1.

---

## Revisão independente do game-qa (passo 4)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-13. Revisão independente — não reescrevo o texto do `game-art`/`game-design` acima.
- **Veredito: CONFORME.**

**Medições refeitas por mim, a partir dos sprites-fonte (não das pranchas compostas), com decodificador PNG próprio escrito do zero** (`workspaces/game-qa/tools/verify_bbox.py`, sem reaproveitar `pxpng.py`):

| Entidade | Arquivo medido | Minha medição (canvas / conteúdo) | `metrics.json` (E1, fator 1×) | Bate? |
|---|---|---|---|---|
| Tamer v13 sul | `tamer_zip/Idle/rotations/south.png` | 36×36 / **24×34** (w×h) | 36×36 / 24×34 | **Sim, exato** |
| Koromon `walk_S_01` | `CREATURE-0005/sprites/...walk_S_01.png` | 28×22 / **19×17** | 28×22 / 19×17 | **Sim, exato** |
| Agumon `walk_S_00` | `CREATURE-0006/sprites/...walk_S_00.png` | 30×30 / **20×27** | 30×30 / 20×27 | **Sim, exato** |
| WarGreymon `walk_S_00` | `CREATURE-0016/sprites/...walk_S_00.png` | 36×46 / **29×36** | 36×46 / 29×36 | **Sim, exato** |

As 4 medições batem exatamente com `pranchas/metrics.json`. Verifiquei também que a altura/largura de E5 (WarGreymon 108×87 a 3×) é a multiplicação inteira exata da medição 1× (36×3=108; 29×3=87) — consistente com o método nearest-neighbor por fator inteiro declarado.

**Conferência das razões-chave citadas no comando:**

1. **"E5 mantém Tamer/tile em 1,06, fora da faixa 1,1–1,6":** 34÷32 = **1,0625 ≈ 1,06**. **Confirmado.**
2. **"WarGreymon a 3× (108 px, 3,38 tiles)":** 108÷32 = **3,375 ≈ 3,38**. **Confirmado.**
3. **M4 (largura do footprint vs. corredor de 64 px):** a 3×, 87÷64 = 1,36× o corredor inteiro (o documento arredonda para "quase 1,4×", leitura razoável); a 2×, 58÷64 = 0,906 ≈ 91% do corredor. **Ambos conferem.**
4. **A independência matemática de escala uniforme (§5/§7.1):** verifiquei a lógica — qualquer fator uniforme aplicado a duas entidades preserva a razão entre elas por definição (a×k)/(b×k)=a/b. O achado está matematicamente correto, não é uma extrapolação frágil.

**Comparação com `PLANO_LABORATORIO_VISUAL_ETAPA6.md` §3:** os critérios usados (hierarquia Baby<Rookie<Tamer≤Ultimate; Champion/Rookie≥1,3; Tamer/tile entre 1,1–1,6; só fatores inteiros; legibilidade) batem com o texto do §3 do plano. A substituição de "Champion/Rookie" por "Ultimate/Rookie" (o elenco de teste não tem Champion) é sinalizada explicitamente em cada tabela ("aqui uso Ultimate/Rookie") — não é uma substituição escondida, e já está justificada em `PLANO` §3 ("Prevalece o trio do C1"). **Sem achado aqui.**

**Comparação com as metas do `game-design` (§7.8, M1–M7):** a leitura de E5 contra M3 (altura mínima 14px) e M4 (largura do corredor) está correta e já verificada nos itens 3–4 acima. Nenhuma meta foi omitida na análise da seção 6.3/6.4.

**Limitações desta revisão:** não refiz a composição visual das pranchas (só medi os sprites-fonte diretamente), por ser suficiente para verificar os números citados no comando; não avaliei E2/E3/E4 por medição direta de arquivo (são multiplicações inteiras das mesmas 4 medições confirmadas, sem risco adicional). Nenhum arquivo alterado; nenhuma geração PixelLab; nenhum outro agente acionado.
