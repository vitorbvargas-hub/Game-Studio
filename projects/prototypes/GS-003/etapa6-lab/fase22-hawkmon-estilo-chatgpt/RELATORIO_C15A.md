# Relatório C15a — Hawkmon "estilo ChatGPT": limpeza das 4 rotações

Data: 2026-11-15 · Dono: `game-art` (sessão separada da que avaliará; esta nota é **indicativa**, a nota oficial é do `game-qa`) · Brief: `BRIEF_C15A_LIMPEZA_ROTACOES.md`.

## 1. O que foi feito

Entrada: `etapa6-lab/referencias-externas/hawkmon_chatgpt_rotacoes_magenta_2026-11-15.png` (1536x1024, fundo magenta, 4 poses em linha: S, N, W, E — confirmado visualmente, bate com o brief).

Pipeline (script Node próprio em `~/projects/GameStudio/workspaces/game-art/tmp-c15a/scripts/`, decodificador/codificador PNG escrito à mão com `zlib` do Node — não havia PIL, ImageMagick nem acesso à internet via `npm install` no sandbox [E], testado e confirmado 403):

1. **Segmentação automática** da imagem fonte por análise de colunas/linhas não-magenta: 4 blocos confirmados (S: x80-370/y276-717; N: x447-729/y276-717; W: x794-1101/y284-717; E: x1150-1457/y284-717), todos com a mesma altura de bbox (~434-442 px), indicando mesma escala entre as 4 poses na origem.
2. **Recorte** de cada pose com margem de 6 px.
3. **`unzoom_image`** (PixelLab, 0,1 geração cada, 4 chamadas) em cada recorte, para recuperar a grade real de pixel art por trás da pose "estilo ChatGPT" (confirma a medição do game-studio: grade irregular, ~8 px aproximados). Resultado: 4 imagens pequenas (79x117, 76x117, 83x114, 62x91), ainda com fundo magenta.
4. **Remoção do magenta** por flood fill a partir da borda (cor semente = moda das bordas, tolerância 55 em distância euclidiana RGB), script local, grátis — só pixels **conectados** ao fundo viram transparentes (nunca um pixel isolado de cor parecida dentro do personagem).
5. **Recorte ao bbox** do conteúdo e **downscale por box-filter com alpha correto** (média ponderada por área e por alfa, ignorando os pixels já transparentes — não deixa o magenta vazar para dentro da cor do personagem) para a altura-alvo de 38 px, igual à régua medida no v1b (passo 7).
6. **Threshold de alfa rígido** (≥128 → opaco, caso contrário transparente) — elimina qualquer anti-aliasing/semi-transparência, conforme a regra do estúdio (zoom nearest, sem blur/AA no contorno).
7. **Composição no canvas 60x60**, âncora (29,5; 49): pé (última linha opaca) em y=49, centro horizontal do bbox em x=29,5 — mesma convenção do Hawkmon v1b e do Agumon F7v2.
8. **`correct_pixelart`** (0,1 geração, os 4 quadros juntos) para limpar ruído de borda do box-filter, **antes** da quantização (ver §4, ordem importa).
9. **`reduce_colors`** (0,1 geração, os 4 quadros juntos, `num_colors=20`, sem dithering) — paleta final compartilhada entre as 4 direções.
10. **Correção manual local** (script, grátis) de 2 cores residuais encontradas na auditoria de cor (ver §4): halo magenta no contorno (→ recolorido para o preto quase-puro já usado no resto do contorno) e 5 pixels soltos ("stray") de uma cor isolada (→ recoloridos pela cor-moda dos vizinhos 8-conectados).
11. **Prancha de comparação** (`prancha_comparacao.png`): v1b (linha 1) × C15a (linha 2) nas 4 direções, sobre um tile 32 px gerado localmente (sem tocar nenhum tileset do jogo), com Tamer v13 south + Agumon F7v2 S + Hawkmon v1b S como régua de escala; seção 1x no topo, seção 4x (upscale nearest) embaixo.

## 2. Medições finais [E]

| Direção | Largura bbox (px) | Altura bbox (px) | minY–maxY | Pixels semitransparentes |
|---|---|---|---|---|
| S | 25 | 38 | 12–49 | 0 |
| N | 24 | 38 | 12–49 | 0 |
| W | 28 | 38 | 12–49 | 0 |
| E | 26 | 38 | 12–49 | 0 |

- Canvas: 60x60 em todas; âncora (29,5; 49) respeitada (pé sempre na linha 49).
- Altura 38 px nas 4 direções — dentro da faixa pedida (36–40) e **idêntica** à régua do Hawkmon v1b (medi o pacote v1b: S/N/E/W também têm bbox 12–49, h=38 nas 4 direções — "mesma massa entre direções" do v1b vira o alvo exato do C15a).
- Régua adicional: Agumon F7v2 S tem bbox h=35 (y 15–49); Tamer v13 south tem bbox h=34 (canvas 36x36, y 1–34). Os três (Tamer, Agumon, Hawkmon) aparecem lado a lado na prancha.
- Paleta final: **18 cores únicas**, compartilhadas entre as 4 direções (≤ 24 pedido):
  `#CA2C2C #EDECE7 #595953 #45413C #181413 #2C2A24 #8E2125 #010102 #F1CE2D #511818 #CFCDC7 #8B8A83 #C19E25 #ACABA5 #7C681F #D76968 #1C6279 #E27031`.
- **0 pixels semitransparentes** e **0 resíduo magenta/halo** nas 4 direções, confirmados por 2 métodos: (a) varredura heurística de cor "magenta-ish" (R,B>150 e G muito menor) = 0 ocorrências nas 4; (b) auditoria manual de toda cor com contagem baixa (<10 ocorrências) — achou e corrigiu 2 problemas reais (ver §4) que a heurística sozinha não pegava.
- E e W **não foram espelhados** — mantidos como vieram do ChatGPT, conforme o critério de aceite.

## 3. Preservação do que o Vitor/o estúdio aprovou

- **Topete em camadas** (pena vermelha/amarela, separada da cabeça): presente nas 4 direções.
- **Leque das costas** (penas vermelhas em camada, visível de costas em N e parcialmente em E/W): presente.
- **Bico curvo**: presente e nítido em S, E, W (bico amarelo bem definido).
- **Faixa com fivela**: a faixa cinza na testa está presente nas 4 direções; a fivela em si (pequeno detalhe metálico) fica no limite da resolução de 38 px e não é claramente distinguível a 1x — visível como uma leve variação de tom na faixa a 4x. **Risco registrado**: pode não passar no critério de legibilidade do game-qa; se reprovado, é candidato a um ajuste pontual (não regenerar do zero).
- Marcas vermelhas no rosto ("arranhões"): preservadas (cor `#D76968`, vista em S/W/E, ausente em N como esperado — de costas não aparecem).
- Olho azul: preservado (cor `#1C6279`), presente em S/W/E, ausente em N (esperado).

## 4. Problemas encontrados e como foram corrigidos

1. **`unzoom_image` detectou grades diferentes por direção** (ex.: E saiu proporcionalmente ~25% menor que W, mesmo os dois recortes de origem tendo a mesma altura de bbox). Isso teria quebrado "mesma massa entre direções" se eu tivesse usado o tamanho de saída do `unzoom_image` como escala final. **Correção**: usei o `unzoom_image` só para recuperar uma grade de pixel art limpa (sem o verniz "ilustração" do ChatGPT), e apliquei eu mesmo, localmente, o escalonamento final para a altura-alvo de 38 px (igual nas 4), calibrada pela régua do v1b.
2. **Ordem errada na primeira tentativa**: rodei `reduce_colors` (quantizar para ≤24) e **depois** `correct_pixelart`. Resultado: o `correct_pixelart` é generativo (não é matemática determinística) e **reintroduziu** variação de cor — a imagem "quantizada" voltou a ter ~2200 cores únicas, estourando o limite. **Correção**: refiz na ordem certa — `correct_pixelart` primeiro (limpeza), `reduce_colors` por último (quantização final) — e descartei o resultado da ordem errada. Isso custou 0,2 gerações extras (ver §5); o teto de 1 geração não foi estourado, mas o uso ficou menos eficiente do que o planejado.
3. **Halo magenta residual** (~13 a 35 pixels por direção, cor `#361432`/rgb(54,14,50)): ficou exatamente na borda entre o contorno e a transparência nas 4 direções — mistura do contorno escuro com o magenta de fundo que sobreviveu ao box-filter antes do threshold de alfa. Achado só na auditoria manual de cor (a heurística automática de "magenta-ish" não pegou por ter R baixo). **Correção**: recolorido para o preto quase-puro (`#010102`) já usado no resto do contorno — mesma função, sem o resíduo.
4. **5 pixels soltos** (1-2 por direção, cor `#7C2471`/rgb(124,36,113)) isolados dentro de áreas de outra cor — artefato de borda do box-filter/correct_pixelart. **Correção**: recolorido pela cor mais comum entre os 8 vizinhos (declumping determinístico).
5. **Fivela da faixa pouco legível** — ver §3, risco registrado, não corrigido (fora do escopo de limpeza; exigiria redesenho).

## 5. Custo e saldo PixelLab [E]

| Chamada | Geração | Qtde | Subtotal |
|---|---|---|---|
| `unzoom_image` (S,N,W,E) | 0,1 cada | 4 | 0,4 |
| `reduce_colors` (ordem errada, descartado) | 0,1 | 1 | 0,1 |
| `correct_pixelart` (ordem errada, sobre o resultado acima, descartado) | 0,1 | 1 | 0,1 |
| `correct_pixelart` (ordem certa, usado) | 0,1 | 1 | 0,1 |
| `reduce_colors` (ordem certa, usado) | 0,1 | 1 | 0,1 |
| **Total gasto** | | | **0,8 gerações** |

- Saldo antes: 559,95 gerações restantes (`get_balance`, 2026-11-15).
- Saldo depois: 559,15 gerações restantes.
- Diferença: 0,80 — dentro do teto de 1 geração do brief, mas acima do "~0,3" sugerido pelos exemplos, por causa do retrabalho do item 2 do §4. Nenhuma ferramenta acima do teto foi usada; nenhum personagem/animação foi criado; nenhum crédito foi comprado.
- Todas as ferramentas pagas processaram os **4 quadros juntos** numa única chamada (quando a ferramenta suporta), para gastar uma vez só por operação em vez de 4.

## 6. Nota indicativa (não é a homologação oficial)

| Critério (Style Bible, matriz §8) | Nota indicativa (1–10) | Observação |
|---|---|---|
| Reconhecimento da espécie | 8 | Topete, leque, bico e faixa presentes e legíveis a 4x; fivela no limite da resolução. |
| Consistência de estilo (dentro do próprio conjunto) | 8 | 4 direções com mesma altura (38px), mesma paleta (18 cores compartilhadas), mesmo contorno; não comparei contra o Style Bible nem contra v13/v15 porque isso é escopo do game-qa/fundador (ver §7). |
| Legibilidade a 1x | 7 | Reconhecível, mas pequeno; a fivela e os detalhes finos da faixa somem a 1x (normal num sprite de 38px). |
| Limpeza técnica (0 semitransparência, 0 halo) | 10 | Medido e confirmado nas 4 direções, ver §2 e §4. |

Esta nota é **indicativa e feita pela mesma sessão que produziu o asset** — por regra do estúdio (ADR-012 §3, AGENTS.md §3), a nota oficial precisa vir de uma avaliação em sessão separada (o `game-qa`, depois o ChatGPT/Vitor).

## 7. O que não foi feito (fora de escopo deste brief)

- **Não** foi comparada a paleta do Hawkmon contra a Endesga-32. Conferi o Style Bible (`DIGIMON_STYLE_GUIDE.md` §3, linha 85 e 115) e ele próprio estabelece que a paleta Endesga-32 é regra só para **cenário/UI**; sprite de criatura/Tamer usa a **paleta própria do arquivo**, nunca forçada à Endesga-32 — confirmado pelas cores reais medidas de Guilmon/Gabumon no mesmo documento (§3.1), nenhuma delas é um hex da Endesga-32. Isso não resolve o conflito aberto (Endesga-32 × v13/v15) registrado no contexto comum — que é sobre cenário/mapa, não sobre sprite de criatura — e não decidi nada sobre ele; só registro que não se aplica a este entregável.
- **Não** foi feita animação (walk/idle) — é o C15b, fora deste brief, depende de aprovação e custo à parte.
- **Não** foi tocado o jogo, os labs (5191/5196/5197), a Database nem o pacote v1b.
- **Não** foi publicado nem enviado nada para fora do estúdio.
- A nota da §6 é indicativa; falta a avaliação em sessão separada do `game-qa` e depois o julgamento do ChatGPT/Vitor (fluxo de validação do brief).

## 8. Arquivos entregues

- `rotacoes/hawkmon_c15a_S.png`, `_N.png`, `_E.png`, `_W.png` — 60x60 RGBA, âncora (29,5;49), 0 semitransparência, ≤24 cores compartilhadas.
- `prancha_comparacao.png` — v1b × C15a, 1x e 4x, sobre tile 32px gerado localmente, com Tamer v13 south + Agumon F7v2 S + Hawkmon v1b S para escala.
- `PROGRESS.md` — atualizado a cada etapa.
- Este relatório.
