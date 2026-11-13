# Digital Odyssey — Etapa 6, Comando 5: relatório do Link A (Método ChatGPT)

- **Data:** 13/11/2026. **Autor:** game-studio (consolidação, sem homologar).
- **Comando:** `COMANDO_ETAPA6_C5_LINK_A.md`, executado de forma autônoma enquanto o fundador estava ausente.
- **Equipe**, sempre um agente por vez:
  1. game-art (Opus) preparou os assets;
  2. game-dev (Opus) fez a integração;
  3. game-qa (Opus) fez a revisão crítica;
  4. game-dev aplicou as correções v2;
  5. game-qa refez a checagem.

## Acesso
- **Link A, ChatGPT:** http://localhost:5191 (v2, commit `8dc7a0f` na branch local `lab/etapa6`)
- **Link B, PixelLab:** http://localhost:5192 (congelado durante o C5; visual comprovadamente inalterado)
- **Link C, Híbrido:** http://localhost:5193 (só a estrutura; o C5 manda esperar um A testável)

Opções de teste no A:
- `?agua=b`: usa a água e a cachoeira do B;
- `?demo=evo`: o parceiro começa perto de evoluir;
- `?criador=0`: pula o criador de Tamer.

## 1. Capturas do mapa completo
- `fase5-link-a/v2/mapa_completo_lab-a_v2_1x.png`, com a versão de colisão ao lado (`_colisao.png`).
- O mapa tem 40×30 tiles e foi composto a partir do mockup 03 do ChatGPT. Contém:
  - penhasco com caverna, cachoeira com espuma, lago, rio e ponte com corrimão;
  - santuário digital e cabine telefônica;
  - floresta variada, sem trilha marrom contínua.

## 2. Vídeo curto de navegação
- `fase5-link-a/v2/a_video_navegacao_v2.gif`: 14 s, 2,4 MB.

## 3. Comparativo visual preliminar A × B
Arquivos: `fase5-link-a/comparacao_AxB_*.png` (5 posições) e `REVISAO_QA_LINK_A.md`.

| | A (ChatGPT) | B (PixelLab) |
|---|---|---|
| Nota indicativa (game-qa) | **≈ 6,0** (v2) | **≈ 6,0** |
| Melhor em | objetos e estruturas digitais, variedade de árvores, retratos dos Digimon na escala E5, interface sem cobrir o Tamer | água e cachoeira, terreno limpo, animação dos personagens, layout fiel ao briefing (v15b) |
| Pior em | personagens com uma pose só (deslizam), ruído de pixel na vegetação, cachoeira simétrica, ponte de 1 tile | Agumon do PixelLab reprovado (usa o DS como placeholder), Tamer com caminhada placeholder |

**Nenhum dos dois atinge a nota mínima de 8.** Os pontos fortes se complementam: há um argumento concreto para o Link C (híbrido).

## 4. Assets do ChatGPT usados
Inventário completo em `metodo-a-v2/game-ready/manifest.json`, com 125 assets e a origem de cada um (prancha e recorte):
- **Terreno (33):** grama P-ii, desníveis, caverna, margens, ponte e transição grama↔água. A transição foi derivada por código das texturas A e está marcada como tal.
- **Vegetação (34):** 9 árvores (incluindo cerejeira e pinheiro), arbustos, flores, tufos, toco e tronco.
- **Objetos (33):** santuário, marco digital, cabine, Digi-Eggs, terminais, cercas, placas, ponte com corrimão e pedras.
- **Água A:** rio e lago animados, cachoeira em peça única (v2) e espuma contínua (v2).
- **Tamer A:** 2 presets, cabelo preto e cabelo azul.
- **Digimon A:**
  - Koromon, Agumon, Greymon e WarGreymon: arte trocada nas espécies que já existem;
  - Palmon e Betamon: arte trocada;
  - MetalGreymon e Kuwagamon: decoração de cenário.
  - O Kunemon ficou de fora porque a arte saiu como abelha.

## 5. Placeholders
- **Tamer A:** só a pose de frente, sem caminhada. Anda "de lado olhando para a câmera". Nenhuma prancha traz as outras direções de um Tamer original. A única versão com 4 vistas lembra o Tai e foi descartada.
- **Digimon A:** uma pose 3/4 por espécie, sem caminhada. A caminhada da prancha 05 não serve: as pernas ficam paradas, faltam direções e um quadro tem o rosto duplicado.
- **Espécies sem arte A** continuam com o sprite DS.

## 6. Pendências
**Artísticas:**
1. Caminhada e direções do Tamer e dos Digimon A. Esta é a principal lacuna do método.
2. Ruído de pixel na vegetação: 30–55% de pixels isolados.
3. Fidelidade:
   - WarGreymon com "asas" no lugar do escudo nas costas;
   - Kuwagamon com pinças vermelhas;
   - MetalGreymon com os dois braços metálicos;
   - Kunemon inutilizável.
4. Cachoeira simétrica, sem rocha nem bacia.
5. Falta uma peça de ligação entre penhasco e lago; hoje há pedras disfarçando.
6. Falta o acessório digital do Tamer A (pedido no C4).

**Técnicas:**
1. Ponte com só 1 tile de largura.
2. Faltam corredores de vegetação e ramais secundários no layout.
3. Dois pontos de Digimon forte ficam fora das zonas de exibição do layout-brief, embora estejam depois da ponte.
4. O bundle do B agora inclui o código do mapa A. O visual do B não mudou.
5. Não houve teste com pessoas.

## 7. Resultados de jogabilidade (game-qa, roteiro próprio)
- Movimento em 4 direções e câmera funcionando.
- **Colisão:** 16 testes de teclado, sem atravessar penhasco, água ou árvores. A ponte é atravessável e não dá para cair dela.
- **Y-sort:** correto em árvores, santuário, cabine e corrimão (v2: opaco, o Tamer passa por trás e pela frente corretamente).
- **Água animada.** Existe a opção `?agua=b`.
- **Desempenho:** 60 fps, 0 erros de console. Medido sem GPU, então é indicativo.
- **Zona inicial segura (v2):** os Digimon fortes ficam a 26–42 passos e a grama alta começa a ~9 passos. O build quebra se alguém violar isso de novo.
- **Sistemas que já existiam continuam funcionando:** criador, escolha de parceiro, encontros, combate e evolução. Nenhum sistema novo foi criado.
- **Testes:** `tsc` limpo, **505/505**, `map:validate` passando.

## 8. Integridade do jogo principal
- `qo` limpo em **`3289e32`**, conferido pelo game-dev e pelo game-qa.
- Database e saves intocados. Cada link do laboratório tem save próprio.
- **0 gerações PixelLab** no C5. Saldo de 714,95 (piso de 650).
- Nenhum push, deploy ou publicação. Tudo roda localmente.

## Decisões do fundador
1. **Layout do A.** O A usa layout próprio (mockup 03), não o traçado v15b que o ADR manda preservar. Por isso hoje a comparação mistura arte e layout. As opções são manter o layout próprio ou remontar o A sobre o v15b.
2. **Água e cachoeira no A.** Manter a A (método puro) ou adotar a B (o A passa a ter peças do PixelLab).
3. **"Pixel art nativa".** Uma ilustração de IA reduzida para 1:1 conta? Pela régua técnica passa, mas o ruído derruba a nota para ~6.
4. **Caminhada dos personagens A.** Como obter: redesenho manual, rotações e animação por ferramenta, ou um pipeline híbrido?
5. **Link C.** Começar o híbrido agora, juntando objetos e vegetação do A com água, terreno e animação do B? Os pontos fortes complementares sugerem que sim.
6. **Pendências anteriores:** paleta (conflito da D9), fidelidade dos Digimon com desvio, decorativos no A e teste com 3 pessoas.
