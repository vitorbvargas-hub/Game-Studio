# Estudo visual — Drakantos × Digimon Forest 01

- **Autor:** game-studio · **Data:** 2026-11-09 · **Pedido do fundador:** "Drakantos tem muito mais profundidade e beleza — estude" (vídeo https://www.youtube.com/watch?v=gJOLy2mhp50, "DRAKANTOS INICIO DE GAMEPLAY PT BR 4K 60 FPS", canal CKX).
- **Fontes vistas [E]:** a thumbnail do vídeo (i.ytimg.com, que mostra um frame de gameplay) e 8 screenshots oficiais da página Steam do app 2454980 (store API `appdetails`), inspecionados em 2026-11-09. Os frames do vídeo em si **não foram vistos**: o navegador do host não está disponível e o proxy bloqueia o YouTube. As screenshots da Steam são do mesmo jogo e mostram a mesma direção de arte.
- **Uso (ADR-011 §5):** só como referência de estilo. Nada é copiado.
- **Comparado com:** `evidence/map-factory/factory_00_mapa_inteiro_dia_v3.png` e `factory_06_*`.

## O que dá "profundidade e beleza" ao Drakantos, e o que falta no nosso mapa

| # | Drakantos [E] | Digimon Forest 01 hoje | Ação |
|---|---|---|---|
| 1 | **Chão nunca é liso**: terra com rachaduras, pedrinhas, folhas, raízes, manchas de musgo e variação de tom por região. | Grama quase uniforme. A textura repete e não varia por região. | game-art: 6–10 variantes de chão por terreno, decalques de chão (folhas, raízes, pedrinhas, rachaduras, poças) espalhados por ruído. |
| 2 | **Altura real**: penhascos, muros, degraus, plataformas com face vertical e sombra, e o mapa em vários níveis. | Tudo no mesmo plano. A "profundidade" vem só das copas. | game-art + game-dev: kit de **penhasco/barranco** (topo + face + borda, autotile) e 1–2 platôs no mapa, com rampa/escada. É o item de maior impacto. |
| 3 | **Luz como protagonista**: ambiente mais escuro e dessaturado, com **fontes de luz pontuais** (tochas, cristais, cogumelos brilhantes, fogueira) que criam poças de luz e cor. Partículas brilhando no ar. | Iluminação uniforme de dia. À noite o mapa todo escurece igual. | game-dev: luzes pontuais no renderer (gradiente aditivo), partículas ambiente (vagalumes, poeira digital, folhas caindo). game-art: props emissores digitais (cristais, cogumelos, totens de dados). |
| 4 | **Sombras de contato fortes** sob cada personagem e prop, e sombras projetadas longas. | Só as árvores têm sombra projetada. Props e criaturas têm pouca sombra. | game-dev: sombra elíptica escura sob todo prop e entidade; ambient occlusion na base de penhascos e troncos. |
| 5 | **Densidade de clutter em camadas**: tufos de capim, samambaias, arbustos com flores, troncos caídos, cercas, caixas, ossos. Tudo em grupos (clusters) com espaços vazios para respirar. | A mata é um "tapete" de copas iguais e as clareiras ficam vazias. | game-design/gerador: regras de cluster (núcleo + satélites), troncos caídos, vegetação baixa na borda da mata (meio-termo entre clareira e floresta). |
| 6 | **Paleta**: base escura e fria (verde-azulado, roxo, marrom) com acentos saturados e quentes (laranja, ciano, magenta) só onde importa. | Verde médio e saturado em tudo, então nada se destaca. | game-art: rebaixar a saturação e o valor do chão e das copas e reservar o saturado para interativos, luzes e criaturas. Isso também melhora a leitura dos Digimon. |
| 7 | **Escala**: a câmera fica mais próxima. Personagens de ~48–64 px na tela com muito detalhe, e cenário com mais pixels por objeto. | Tamer de ~28 px, Digimon Rookie de 48 px. Em zoom 1 o mundo parece pequeno. | game-dev: avaliar zoom padrão ×2 (ou ×1,5) no jogo. Não exige arte nova. |
| 8 | **Bordas orgânicas e transições**: a grama invade a terra em tufos, e a água tem espuma, pedras e plantas aquáticas na margem. | As bordas são limpas, quase vetoriais. | game-art: decalques de transição (tufos sobre a trilha, pedras e juncos na margem). |
| 9 | **VFX no mapa**: habilidades com brilho, rastro e partículas, e números/efeitos legíveis. | Efeito de impacto simples. | Fica para a próxima fase (vfx_workbench do PixelLab é grátis para assinante). |

## Frame do vídeo enviado pelo fundador (00:58, floresta inicial) [E]
- **Paleta escura e fria:** chão verde-escuro acinzentado; nada perto de verde-limão.
- **Manchas de terreno de outra cor:** grandes poças de lama/solo **roxo** com borda irregular e tufos de grama invadindo. Quebra a monotonia do verde e dá "bioma".
- **Ruínas de pedra roxo-acinzentada** (blocos empilhados) e **tocos de árvore cortados** com anéis, como pontos focais.
- **Copas em massas grandes e escuras,** com poucas e grandes manchas de luz por cima, não um tapete de copinhas iguais. Samambaias e arbustos baixos em volta dos tocos.
- **Flores pequenas roxas/azuis** espalhadas: o único acento saturado. Os personagens se destacam porque o fundo é escuro.
- **Câmera bem mais próxima:** o personagem ocupa ~1/12 da altura da tela. Minimapa circular no canto e anel vermelho de alvo sob o inimigo.

## Frames do vídeo capturados pelo coordenador (2026-11-09) [E]
Os frames ficam em `evidence/drakantos-video/` (uso interno de referência, não redistribuir). Foram capturados pela extensão do Chrome do fundador, com autorização.
- **t0150, estrada com carroça:** a lanterna amarela é a única luz quente num ambiente roxo/azulado escuro. O chão de terra é roxo-acinzentado e as falésias de pedra têm camadas. **A luz pontual quente sobre a base fria é a assinatura visual.**
- **t0330, vila:** calçada de pedra com muita variação, casas em enxaimel, flores em vaso, barris, bancas e lampiões. Densidade alta de objetos pequenos, com o personagem pequeno no meio de muito detalhe.
- **t0560, floresta:** **tronco caído e raiz roxos**, samambaias em leque, massas de copa escuras e uma névoa leve. A paleta inteira é verde-escuro e roxo, sem nenhum verde claro.
- **t0820, caverna:** **escuridão total além de um raio de luz em volta do jogador e das tochas** (fog of war radial). Esse é o maior gerador de "profundidade" do vídeo. Combina com a ideia de masmorra do GS-003.
- **t1120, UI de habilidades:** prévia animada da habilidade, árvore de pontos e retrato grande do herói. Fica como referência para a UI, fora do escopo do mapa.
- **Leitura geral:** contraste de VALOR (escuro/claro) e de TEMPERATURA (fundo frio, luz quente) pesa mais que a quantidade de detalhe.

## Prioridade (impacto ÷ custo)
1. Paleta mais escura + luzes pontuais + partículas (#3, #6), quase só código e ajuste de cor.
2. Chão com variação e decalques (#1, #8).
3. Penhascos/platôs (#2).
4. Clusters de clutter e borda de mata (#5).
5. Sombras de contato (#4) e zoom (#7).

## Limitações
- Não vi o vídeo inteiro: a análise vem de 8 screenshots oficiais e da thumbnail. Se o fundador quiser um momento específico do vídeo, precisa mandar um print.
- O Drakantos tem artistas dedicados e um orçamento de arte muito acima do nosso. A meta realista é chegar à mesma **linguagem** (luz, altura, densidade), não ao mesmo acabamento por pixel.
