# Estudo — jogos de Digimon (vídeos enviados pelo fundador, 2026-11-10)

- **Autor:** game-studio (coordenador). **Fonte [E]:** 11 vídeos do YouTube abertos no Chrome do fundador, vistos pela extensão OpenClaw com autorização. Os quadros salvos (uso interno de referência, não redistribuir) estão em `evidence/digimon-games-videos/`.
- **Vistos:** Digimon Masters Online (Ep 1), Digimon Super Rumble (playlist), Digimon World: Next Order (Part 1), "100 dias no Digimon World" (Next Order), Digimon Story: Time Stranger #1 (PT-BR), Digimon World PS1 (longplay), Digimon Rumble Arena 2, Pokémon FireRed "Digilocke" (hack com Digimon), Evolution of Digimon Games (54 jogos).
- **Limitação:** amostra de 1 a 3 quadros por vídeo. Não assisti os vídeos inteiros. Os dois vídeos de catálogo ("All Digimon Games Ever Made" e "Evolution… 1998–2024") só foram listados.
- **Uso:** referência de design e estilo (ADR-007/011). Nada é copiado: nem asset, nem layout literal.

## O que cada jogo faz bem (pegar) e mal (evitar)

| Jogo | Pegar [E] | Evitar [E/H] |
|---|---|---|
| **Digimon Masters Online** (MMO 3D, o mais próximo do nosso gênero) | Tamer e Digimon andam juntos no mapa e os dois têm barra; retratos dos dois no canto sup. esq.; rastreador de missão à direita; minimapa com canal; "Leader" (selvagem líder de grupo) entre selvagens comuns; NPC com retrato grande e caixa de diálogo; mensagem "nível aumentou" no mapa | HUD poluído (chat, hotbar dupla, ícones minúsculos, texto sobreposto); dezenas de selvagens empilhados com nomes sobrepostos; UI genérica de MMO coreano |
| **Digimon Super Rumble** (MMO 3D) | **Ficha do Digimon com Índice de Crescimento, Saciedade, Satisfação, radar de atributos e "Árvore de Evolução" com % por caminho**: excelente para mostrar progresso de evolução; ovo/berço para chocar; ambientes com cachoeira e vegetação densa | Terreno vazio e genérico em várias áreas; câmera em 1ª pessoa estranha |
| **Next Order** | **Comunicação com o parceiro: Elogiar / Repreender / Ignorar**, que molda personalidade e disciplina; **os parceiros falam no mapa** ("!!", "Tem uma coisa aqui?", "Eu sei o que é isso! Gostei!") e acham itens; combate em que o Tamer dá **ordens** (Order Power) e os Digimon lutam sozinhos, como o nosso AUTO com decisões; HUD em "circuito digital" ciano com molduras chanfradas; ataque telegrafado com área vermelha no chão | Mapas grandes e vazios entre pontos de interesse |
| **Time Stranger** (2025) | **Ficha holográfica**: o Digimon em holograma dentro de um anel de scanner, com cartão limpo (atributo, tipo, estágio, resistência por atributo e elemento com ícones, habilidades com custo), em PT-BR. É a melhor referência para o nosso Digidex e para a ficha de parceiro | Muito texto em cutscene |
| **Digimon World (PS1)** | **HUD mínimo** (relógio e 2 medidores de humor/disciplina) que deixa o mundo respirar; parceiro grande ao lado do Tamer; cenários com identidade forte | Pré-renderizado e baixa resolução; mecânicas de cuidado punitivas (morte do parceiro) |
| **Digimon Rumble Arena 2** | VFX de golpe grande e legível (cúpula de energia, flash), cronômetro e retratos com barra; leitura instantânea de quem é quem | — (é luta de arena, não exploração) |
| **"Digilocke" (FireRed com Digimon)** | **Sprites de Digimon em pixel art a ~64 px ficam ótimos** (Birdramon, Chimairamon), com contorno forte e 3–4 tons, o que confirma a decisão de escala do ART_DIRECTION_V2 §1.4; equipe de 6 com retratos | Interface de Pokémon literal (não copiar) |
| **All-Star Rumble / histórico** | Retrato circular + barra + número grande; evolução como momento de espetáculo | — |

## Recomendações para o nosso jogo (prioridade)
1. **Parceiro com personalidade no mapa** (Next Order): balões curtos e contextuais ("!!", "?", comentário em PT-BR) quando acha item, vê um selvagem raro, está com fome ou cansado. Barato (texto + ícone) e dá muita vida. → game-design + game-dev.
2. **Comunicação Elogiar / Repreender** depois da batalha ou de um evento, alimentando um traço de personalidade que influencia a evolução (sem punir com morte). → game-design (amarrar em `evolution_requirements`).
3. **Ficha holográfica do Digimon** (Time Stranger) + **Árvore de Evolução com % por caminho** (Super Rumble) no Digivice: substitui a tabela "dashboard admin" que o UI_WORLD_AUDIT apontou. → game-design (casa com o HUD_IDENTITY_V3 Alt A "Digivice Radial").
4. **Linguagem visual "circuito digital"** (Next Order): molduras chanfradas, linhas de circuito e ciano/azul. É mais Digimon que a moldura genérica atual e combina com o Digivice. → game-art (kit de UI).
5. **HUD enxuto** (DW1 e o contra-exemplo do DMO): mundo primeiro; o resto só aparece quando abre o Digivice. Confirma a Alt A.
6. **Selvagem "Líder"** (DMO): variante maior com aura entre os selvagens visíveis do GS-012, mais rara e com recompensa melhor. → game-design (tabela de encontros).
7. **Ordens táticas no AUTO** (Next Order): além de lutar e explorar, o jogador dá 3–4 ordens simples (atacar o mais fraco, defender, usar o golpe forte, recuar). → game-design + game-dev (já existe `AutoRule`).
8. **Escala 64 px confirmada** pelos sprites do Digilocke: seguir o pipeline v3 (texto + start frame + paleta travada) e a mão para comparação.

## Ambientes e mapas (segunda passada, foco em cenário) [E]
Quadros: `dmo_vila_rua_npcs`, `superrumble_ambiente`, `superrumble_vila_brinquedos_mapa`, `nextorder_campo_riacho_cristais`, `nextorder_interior_ginasio`, `nextorder_evolucao_vfx`, `dw1_hud_minimo`.
- **Identidade do Digimundo = o "estranho" no meio do natural.** Na Vila Inicial do Super Rumble há **brinquedos gigantes** (blocos com letras, urso de pelúcia, galinha de brinquedo) no meio da grama e das árvores. No Next Order, **cristais de dados rosa e roxos brotam das rochas** em um campo verde normal, e um riacho corre entre penhascos. Hoje a nossa floresta é floresta genérica com cristais ciano. É preciso um elemento-assinatura por região (ex.: Floresta = cristais de dados nas raízes e totens de circuito; Vila = brinquedos gigantes / Primary Village).
- **Mapa-múndi ilustrado** (Super Rumble): mapa da região ("File Island – Dragon's Eye Lake") desenhado de cima, com terreno pintado (lago em anel, rio, praia, rochas), ícones de ponto de interesse e portais nomeados ("Starting Village Portal"), filtro de ícones e escala. É a referência certa para o GS-009 §2 e para o bug do mapa-múndi: **mapa pintado do terreno real, não grafo de nós.**
- **Relógio/calendário do mundo** (Super Rumble: mês, dia, hora no canto) e bússola circular (Next Order). Casa com o nosso ciclo dia/noite e os encontros por horário do GS-012.
- **Vila/cidade com NPCs nomeados e ícones de missão** sobre a cabeça ("!" e "?") (DMO). Funciona e é legível. Para a nossa Vila: ícones claros e poucos NPCs, com função.
- **Interiores com propósito** (Next Order, academia de treino: ringue, saco de pancada, computador de status) mostram a função do lugar pelos objetos.
- **Cena de digievolução** (Next Order): fundo de dados ciano com texto binário e a palavra "EVOLUTION" correndo em faixa, anéis de código no chão e o Digimon em silhueta luminosa. Referência direta para melhorar a nossa animação de evolução (hoje um clarão branco genérico).
- **Ressalva:** os jogos vistos são 3D. Daí tiramos **elementos e composição**, não a técnica. A técnica de pixel art continua sendo a do Drakantos.

## Coisas ruins a eliminar
- Selvagens demais com nomes sobrepostos (DMO), o que já está resolvido pelo GS-012.
- HUD com 4 cantos cheios, chat aberto e duas hotbars (DMO).
- Mapas vazios e genéricos entre pontos de interesse (Next Order, Super Rumble). A floresta-piloto tem densidade com propósito.
- Cuidado punitivo (DW1).
