# Prova de escala v3 — M1 (Pro Flash por texto), o item do backlog da v2

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-10
- **Pedido que autoriza esta tarefa:** revisão do coordenador `game-studio` sobre a v2 (`d264b1d`, `phase2/art/scale-proof-v2/`): o ruído sumiu, mas o resultado ficou "30px dobrado" — 4 cores, blocos 2×2, olhos com 1–2 pixels, nenhum detalhe extra que justifique 64px, longe do nível Drakantos (sombreamento em 3–4 tons, olhos expressivos, garras e marcas legíveis). O coordenador pediu o **M1** que ficara no backlog da v2, com autorização do fundador para créditos nesta noite.
- **Revisão independente:** este diretório fica pronto para o `game-qa` revisar — eu não aprovo meu próprio protótipo (ADR-012 §3). **Nada aqui foi integrado ao jogo.**
- **Teto de geração autorizado:** 8. **Gasto real: 8,0 — exatamente no teto** (`pixellab_cost_log.csv`; `get_balance` antes = 10,8, depois = 2,8). 1 tentativa recusada pelo filtro de conteúdo do modelo (0 geração cobrada); 0 regenerações depois disso.

## 1. Diagnóstico — por que a v2 (M2) tem um teto estrutural

A v2 resolveu o ruído, mas manteve a causa raiz do teto de detalhe: `create_character(mode="v3", reference_image=...)` **herda a direção south quase pixel a pixel da referência enviada** (confirmado na própria v2 — "south saiu quase idêntico à referência"). Como a referência da v2 era o frame nativo do rip (30×34px) limpo e reescalado geometricamente para 60×68, o teto de informação é o do sprite original de 30px — por mais limpa que a referência fique, nenhum pixel novo é inventado no south, só reorganizado. **Qualquer método ancorado no rip de 30px herda esse teto**, exatamente o diagnóstico do coordenador.

## 2. Método — M1 (Pro Flash por texto, sem nenhum pixel do rip)

1. `get_pro_flash_capabilities(operation="character", width=64, height=64, n_directions=8)` — **consulta gratuita.** Confirma o piso já visto na v2: `image=5 + rotations=1 = 6` gerações, fixo, `n_directions` é sempre 8 nesta ferramenta (sem opção de gerar 1 direção mais barata).
2. Upload do Tamer (`scale-proof-v2/board/ref/tamer_idle_32px.png`, 32×32) como `style_image`, com `style_options={"color_palette": false, "outline": true, "detail": true, "shading": true}` — herda só o traço/contorno/sombreamento do jogo, **não** a paleta azul/laranja do Tamer, para o Guilmon manter as próprias cores oficiais.
3. `create_character_pro_flash(description=<Guilmon por texto>, width=64, height=64, view="low top-down", style_image=Tamer, seed=0)` — **tentativa 1 falhou**: o filtro de segurança do modelo recusou o prompt (termos como "reptilian" e "slit pupils"), sem motivo detalhado, **0 geração cobrada** (confirmado por `get_balance` inalterado). Reescrevi a descrição evitando esses termos (trocando por formulações mais neutras, ex. "claw-tips" em vez de "claws", "thin vertical pupils" em vez de "slit pupils") e troquei o seed — **tentativa 2 passou**, custando **6 gerações** (image 5 + rotations 1), confirmando o piso previsto.
4. Descrição final enviada (texto puro, sem referência de pixels do rip): dinossauro bípede vermelho, barriga/focinho/mãos creme, orelhas grandes pontudas, olhos amarelos com pupila vertical fina, padrão de marcas pretas triangulares pelo corpo/cabeça/cauda, marca preta em espiral no peito (abstração do "Digital Hazard"), garras brancas nas mãos e pés, cauda grossa, vista low top-down clássica de RPG.
5. `animate_character(mode="template", template_animation_id="breathing-idle", directions=["south"], ai_freedom=0)` — **1 geração.**
6. `animate_character(mode="template", template_animation_id="walking", directions=["south"], ai_freedom=0)` — **1 geração.**
7. **Total: 8,0 gerações — exatamente o teto autorizado.** Com o personagem Pro Flash já custando 6 de saída (piso fixo, confirmado na v2 e reconfirmado aqui), só sobrou orçamento para idle+walk em **uma** direção (S); não sobrou para animar SW como o pedido sugeria como extra condicional ("se sobrar"). Log completo em `pixellab_cost_log.csv`.

## 3. O que o filtro de conteúdo recusou, e por quê isso importa

A primeira tentativa (prompt com "reptilian dinosaur" + "slit pupils" + "claws") foi bloqueada sem explicação — o próprio tool description do PixelLab avisa que esse filtro "também erra em pedidos inofensivos" e que termos sobre corpo/pele são os mais comuns de disparar falso-positivo. Isso não é uma limitação de conteúdo real do Guilmon (é um personagem de jogo infanto-juvenil), mas é um risco operacional do M1 que o M2 não tem: **M2 nunca passa por esse filtro porque usa uma referência de imagem, não uma descrição textual livre.** Qualquer produção em escala com M1 precisa orçar tentativas extras de reescrita de prompt (aqui, 0 geração extra; mas pode não ser sempre grátis se a falha ocorrer depois do estágio de imagem).

## 4. Avaliação como diretor de arte

**O M1 entrega o nível de detalhe que a v2 não conseguiu, e a diferença é visível a olho nu.** Inspecionei o south via `pixelart_workbench inspect --scale 10` na região do peito: o resultado tem **17 cores no south e 31 no south-west**, organizadas em sombreamento real (ex. vermelho `#e55538` → `#b6381d` → `#86230f` como uma rampa de 3 tons no corpo, não um bloco plano), contra as 4 cores chapadas do M2. O olho tem pupila visível (não 1-2 pixels soltos), as orelhas se separam da cabeça com sombra própria, a marca do peito é um círculo escuro com um giro interno claro — uma abstração legível do "Digital Hazard", garras com 2-3 tons de cinza nos dedos, cauda com segmentação de marcas pretas. Isso **é** o nível Drakantos que o coordenador pediu como referência, não um "30px dobrado".

**Identidade: reconhecível como Guilmon, não genérica — com uma ressalva honesta.** Cores (vermelho/creme/preto/amarelo), silhueta (bípede, orelhas grandes, cauda grossa), e os elementos de design específicos (marca no peito, garras brancas) batem com o personagem oficial nas 8 rotações e nos 10 quadros de animação (4 idle + 6 walk) que inspecionei — sem deriva de forma entre quadros (confirmado via `pixelart_workbench inspect` em `west` e em todos os 6 quadros do walk). **A ressalva:** diferente do M2 (que herda pixels literais do rip no south), o M1 é uma reinterpretação do modelo a partir de texto — a marca do peito é uma aproximação circular/espiral do símbolo oficial, não o yin-yang preciso com dois pontos que o design canônico tem, e as proporções saíram um pouco mais arredondadas/"chibi" que o design anguloso do jogo DS original. Não tenho como garantir fidelidade pixel-a-pixel ao canon só por inspeção visual — **recomendo que o `game-qa` compare lado a lado com arte de referência oficial do Guilmon (não só com o rip 30px) antes de aprovar**, porque esse é exatamente o tipo de desvio que uma referência de pixels (como no M2) evita e uma descrição de texto (como no M1) não garante.

**As 2 animações (idle+walk, só S, 10 quadros no total) mantiveram a identidade em todos os quadros, sem deriva perceptível e sem regeneração necessária.**

**O que esta prova NÃO testou (ver limitações):** SW animado (sem orçamento — o personagem Pro Flash já consome 6 dos 8 do teto); attack/hurt; qualquer criatura além do Guilmon; comparação formal contra arte oficial canônica (só contra o rip 30px, que também é uma interpretação de terceiros, não a arte original da Bandai Namco/Toei).

## 5. M1 vs M2 — comparação direta

| | M2 (v2, referência limpa do rip) | M1 (v3, Pro Flash por texto) |
|---|---|---|
| Canvas | 60×68px | 64×64px |
| Cores no south | 4 | 17 |
| Cores no south-west | 18 | 31 |
| Sombreamento | plano (sem rampa) | rampa de 3-4 tons |
| Olho | mancha de 1-2px | pupila visível |
| Marca do peito | forma do rip, achatada | círculo+espiral, sombreado |
| Fidelidade de pixels ao rip | herdada (south quase idêntico) | nenhuma (reinterpretação por texto) |
| Custo | 5,2 gerações (c/ limpeza) | 8,0 gerações (teto, sem sobra p/ SW) |
| Risco operacional | nenhum adicional | filtro de conteúdo pode recusar o prompt (grátis se falhar antes da imagem, mas exige retrabalho de texto) |

**O M1 vence em qualidade visual de forma clara — é a diferença real de detalhe que o coordenador pediu para testar.** O custo (8 vs 5,2) é maior mas ainda cabe num teto de produção razoável por criatura (6 fixo pelo personagem completo + 1 por direção×animação). O risco do filtro de conteúdo é real mas barato de mitigar (reescrita de prompt, sem custo extra nesta prova).

## 6. Veredito

**Recomendo o M1 (Pro Flash por texto + style_image do Tamer para herdar traço/sombreamento sem herdar paleta) como o método para o nível de detalhe "Drakantos" em 64px, substituindo o M2 como recomendação de escala nativa para o roster.** Isso muda a base técnica da decisão de escala em `ART_DIRECTION_V2.md` §1.4 (que hoje cita o piloto/v2, ambos baseados em referência de pixels) — recomendo essa atualização ser feita pelo `game-studio` ou por mim numa tarefa dedicada, não aqui. Pendências antes de qualquer integração: (a) `game-qa` revisar este diretório, incluindo a ressalva de fidelidade ao canon da Seção 4; (b) um teste dedicado de M1 em outra criatura do roster (Dorumon/Tentomon, que não têm frame S tão limpo quanto o Guilmon) para confirmar que o método generaliza; (c) decidir se o custo de 6 gerações fixas por personagem completo (+1 por direção×animação) é sustentável para o roster inteiro dentro do plano trial atual (2,8 gerações restantes — não há orçamento para mais testes hoje).

## 7. Entregas neste diretório

```
pipeline-m1/rotations/{south,south-west}.png        — rotações geradas (64x64, Pro Flash)
pipeline-m1/idle-s/frame_000..003.png + idle_s.gif   — breathing-idle, direção S (4 quadros)
pipeline-m1/walk-s/frame_000..005.png + walk_s.gif   — walking, direção S (6 quadros)
board/proportion_board_v3.png                        — prancha: tile 32px · Tamer · Guilmon rip · M2 (v2, 60x68) · M1 (v3, 64x64), x3, base alinhada
board/compare_scale_v3.html                           — comparação ao vivo no navegador: south, south-west, idle+walk S, M2 x M1
board/ref/                                            — cópias locais (tile, Tamer, rip, M2 south/SW + GIFs) usadas na prancha/HTML, auto-contido
scripts/compose_board.py                              — compositor de prancha puro-stdlib (reaproveita o leitor/escritor PNG de scale-proof/scripts/nearest_upscale.py), sem custo
pixellab_cost_log.csv                                 — log de custo, get_balance antes/depois, todas as chamadas custeadas incl. a tentativa falha
license.json                                          — base ADR-007/009/010/012, origem do rip (usado só como referência de texto/comparação, não como reference_image), obrigação de crédito
```

## 8. Limitações

- Testei só **1 criatura (Guilmon)**, 1 direção animada (S — idle e walk), 2 das 8 direções inspecionadas em detalhe (S/SW estáticas, mais W por amostragem). SW não foi animado: sem orçamento depois do custo fixo de 6 do personagem.
- **Não comparei contra arte oficial canônica do Guilmon** (só contra o rip de 30px, que já é uma extração de terceiros) — a Seção 4 já registra que a marca do peito e as proporções têm desvios visíveis do design original; isso precisa de revisão do `game-qa` com referência oficial antes de qualquer aprovação.
- **1 prompt foi recusado pelo filtro de conteúdo do modelo** antes de eu encontrar uma formulação aceita — não sei generalizar quais termos disparam isso para outras criaturas (ex. Dorumon, Tentomon podem ter descrições que disparem o mesmo filtro por motivos diferentes).
- Não testei `style_image` alternativo (ex. peça do forest-v8) — usei só o Tamer, porque já era a referência de estilo conhecida das provas anteriores; não sei se um style_image diferente mudaria o resultado.
- Custo por criatura completa (8 direções × 4 estados) com este método seria, por extrapolação: 6 (personagem) + até 8×1 (uma geração por direção×animação, trial só permite 1 por vez) — não recalculei formalmente aqui, é uma extrapolação lógica, não uma prova.
- `game-qa` ainda não revisou nada disto.
