# Relatório F9 — Fase 4: movimento do Labramon (standing, idle, walk)

Digital Odyssey (GS-003) · F9 Labramon · Fase 4 · 2026-11-16 (BRT) · Autor: `game-art` (Fable 5.2) · Comando `COMANDO_F9_LABRAMON.md` §8.
Fan game não oficial, sem licença, sem monetização; uso local, nada publicado. **[E]** evidência medida · **[H]** leitura/hipótese.
Esta é a entrega da produção com a medição do próprio produtor. **Não é** o QA independente (Fase 10, `game-qa`) nem homologação.

## 1. Status

**COMPLETO, como candidato.** Entregue em `movement/`: standing (4 rotações), **idle 4 quadros** e **walk 8 quadros** em S, E, N e W, com spritesheets, 16 GIFs (1x e 4x), folhas de contato, manifesto e medições por quadro.
Custo: **15,05 gerações** (teto da fase: 20). Saldo 544,80 → **529,75** (piso 485 respeitado). Acumulado F9: 15,65 de 60.
Não toquei o jogo, os labs nem a Database. Nada foi publicado.

## 2. O que mudou em relação ao método do Hawkmon (C15b)

O brief pedia v3 custom (como no C15b). Testei, medi e **troquei de motor**, porque o v3 não serviu para este corpo:

| Tentativa (em E e S) | Resultado medido [E] | Decisão |
|---|---|---|
| `animate_character` **v3 custom** (walk E/S, idle E/S) | Paleta certa, pé em y=49, mas **redesenha a cabeça**: topete pontudo novo, cabeça 3–4 px mais alta (idle E: altura 38→41 dentro do ciclo; idle S 38→40). No walk E só **2 patas legíveis em 4 de 8 quadros**. | Reprovado (4 ger) |
| **Template dog** (`walk-8-frames`, `idle`) em E | Sprite **encolhe** para 33 px, pé sobe para y=44–45, 28 cores (9 fora da paleta). Mesma falha do template no Hawkmon. | Reprovado (2 ger) |
| **pixminimax** (`template_action="walking"`; idle custom 4q) | Mantém a rotação: altura 35–36, pé y=49, 0 cores fora, cabeça **280/280 px idêntica à rotação no idle E**; 4 patas com as do fundo em cinza; orelha e cauda com movimento secundário. | **Adotado** (8 ger para as 4 direções) |

Além disso escrevi um **rig local** (0 gerações) que monta idle e walk só com os pixels da rotação. Ele virou o idle final de S e N e fica como reserva para o resto (`_alternativas/`).

Lição para o método: **em quadrúpede, usar pixminimax com o parâmetro `palette`** (a paleta da rotação). O `palette` sozinho já entrega 0 cores fora e 0 semitransparência.

## 3. Pipeline por quadro

1. `create_character` v3 **import** das 4 rotações da Fase 3 (quadruped/dog, 0 pixel regenerado; 0,25 ger). Personagem `e7b2c58f-6ea0-4a49-bab1-7b2ecaa2052d` ("Labramon F9").
2. `animate_character` pixminimax com `palette` de 19 cores: walk 8q e idle 4q, uma geração por direção. **Nenhuma direção é espelho de outra.**
3. Limpeza PixelLab como no C15b: `correct_pixelart` (força 0,1) → `reduce_colors` com `palette_image` = rotação da própria direção (0,8 ger no total).
4. Pós-processo local, sem custo (`scripts_f9_fase4/post.js`, `specks.js`):
   - paleta exata da rotação (o `reduce_colors` devolveu dois quase-pretos, `#020602` e `#020305`, no lugar de `#010101`);
   - remoção de pontos soltos (walk W: 5 px em 4 quadros);
   - **trava de cabeça e rosto**: mede o deslocamento da cabeça em cada quadro (casamento com a rotação) e cola ali os pixels do topo da cabeça e do rosto da própria rotação;
   - walk N: sola rosa-escura da pata traseira trocada por escuro neutro;
   - 7 pixels claros encostados em transparência escurecidos (falha de contorno);
   - **âncora**: quadro inteiro deslocado na vertical até a última linha opaca ficar em y=49.
5. Idle S e N: trocados pelo rig local (ver §5).

**Achado sobre a limpeza [E]:** com o `palette` na geração, o `correct_pixelart` não muda a silhueta (0 px em 48 quadros) e reintroduz ~660 cores por quadro; depois de voltar à paleta, o resultado difere do bruto em 18–32 px por quadro (trocas entre tons escuros vizinhos). A etapa foi cumprida, mas aqui ela é quase neutra. Dá para economizar 0,8 ger por personagem se o fundador/QA concordar.

## 4. Walk — medições [E]

Tabela completa por quadro em `movement/qa_tabelas.md` e `movement/qa_medicoes.json`.

| Direção | Altura (px) | Largura (px) | Pé em y=49 | Olho (px) por quadro | Marcas (px) por quadro | Cabeça: desvio vertical no ciclo | Recuo do pé de apoio |
|---|---|---|---|---|---|---|---|
| S | 36–37 | 24 | 8/8 | 7 em todos (rotação: 7) | 6 em 7 quadros, 7 em q5 (rotação: 6) | 0 ou −1 px | n/a (frente) |
| E | 35–36 | 38–39 | 8/8 | 4 em todos (rotação: 4) | 7 em todos (rotação: 7) | 0 ou +1 px; 0 ou −1 px na horizontal | **média 2,28 px/quadro (mín 2, máx 3,5; 9 medidas)** |
| N | 38 | 25 | 8/8 | n/a (costas) | n/a | constante (−2 px em relação ao standing) ; gingado lateral de −2 a +1 px | n/a (costas) |
| W | 34–37 | 40 | 8/8 | 4 em todos (rotação: 4) | 8 em 7 quadros, 9 em q3 (rotação: 8) | de −1 a +2 px | **média 3,0 px/quadro (mín 0, máx 5; 12 medidas)** |

- **Rosto:** depois da trava, o retângulo do rosto é idêntico ao da rotação em 24/24 quadros de S, E e W (0 px diferentes). Olho e marcas não aparecem nem somem em nenhum quadro. O único desvio é 1 px de marca a mais fora do retângulo em S q5 e W q3.
- **Alternância das patas:**
  - S: contato em y=49 na pata esquerda da tela em q0–q2 e q7, na direita em q3–q6 [E].
  - N: pata direita em q0, q1, q6, q7; esquerda em q2–q5 [E].
  - E/W: os contatos em y=49 recuam de forma contínua da frente para trás (E: x 40 → 38 → 35 → 33 → 31 → 27,5 → 25,5 → 23,5 → 21,5) [E]. Leitura visual [H]: caminhada em diagonais, 4 patas legíveis na maioria dos quadros; em E q2–q3 a pata traseira do fundo fica quase escondida atrás da da frente.
- **Loop:** mudança entre o último e o primeiro quadro na mesma ordem das mudanças internas (E 592 px contra 214–606; W 429 contra 518–589; N 399 contra 265–480; S 440 contra 64–398) [E].
- **Cauda/orelhas:** movimento secundário presente em E e W (cauda desloca 1–2 px, orelha abre na passada) e em S/N (orelhas) [H, leitura das pranchas].

### Ressalvas do walk
1. **S tem dois pares de quadros quase iguais** (q0→q1: 73 px mudam; q4→q5: 64 px). O bruto tinha um pulinho de 1–2 px com as duas patas fora do chão; a âncora em y=49 transformou esse pulo numa pausa. O ciclo lê como 6 poses, não 8.
2. **N anda 2 px mais alto que o standing** (38 contra 36 px) em todos os quadros. Dentro do walk é estável; na troca standing → walk a cabeça sobe 2 px.
3. **N ginga de lado** (corpo −2 a +1 px sobre as patas plantadas). É coerente com o apoio, mas o corpo sai do pivô X; a sombra de contato deve ficar no pivô, não no bbox.
4. **W balança mais que E** (cabeça de −1 a +2 px; E fica em 0–1) e tem recuo do pé menos regular (0 a 5 px). O rastreio automático do pé é ambíguo quando as patas se cruzam; trate o número de W como indicativo.
5. **Cadência:** a passada desenhada é de ~2,3–3 px por quadro (≈18–24 px por ciclo). Sem deslizar, isso pede `tempo por quadro ≈ recuo ÷ velocidade` (ex.: 100 ms/quadro ≈ 23–30 px/s; a 91 px/s seriam ~25–33 ms/quadro). Pernas curtas não cobrem a velocidade do Tamer sem cadência alta ou algum deslize. É decisão de engenharia/QA no laboratório (Fase 9).

## 5. Idle — medições [E]

| Direção | Fonte | bbox por quadro (w×h) | Maior salto entre quadros | Cabeça | Olho / marcas |
|---|---|---|---|---|---|
| S | rig local | 24×36, 24×35, 24×35, 24×36 | h 1 px, w 0 | desce 1 px em q1–q2, tamanho igual | 7 / 6 em todos |
| E | pixminimax | 39×36, 40×36, 39×36, 38×36 | h 0, w 1 px (cauda) | 280/280 px igual à rotação nos 4 quadros | 4 / 7 em todos |
| N | rig local | 25×36, 25×35, 25×35, 25×36 | h 1 px, w 0 | desce 1 px em q1–q2 | n/a |
| W | pixminimax | 40×36, 40×36, 40×36, 39×36 | h 0, w 1 px (cauda) | 279/280 px igual à rotação nos 4 quadros | 4 / 8 em todos |

- Pé em y=49 e os mesmos contatos (duas patas) em 16/16 quadros.
- **Por que S e N usam o rig local:** o idle pixminimax de S abre as orelhas de 22 para 26 px de largura e volta de uma vez no fecho do loop (373 px mudam de q3 para q0); o de N alterna 25/27 px. É o mesmo tipo de "salto de massa" que reprovou o idle do Hawkmon. No rig local o corpo desce 1 px (uma linha das patas é removida, pés plantados) em q1–q2 e as orelhas atrasam 1 quadro. As versões pixminimax estão em `_alternativas/idle_pixminimax/`.
- **Diferença entre direções [H]:** em E/W o que se mexe é a cauda (cabeça parada); em S/N é o corpo inteiro (1 px) com as orelhas. Se o QA preferir um idle igual nas 4, o rig local de E/W está pronto em `_alternativas/idle_rig_local/`.

## 6. Técnica [E]

- Canvas 60×60 em todos os arquivos; **pé em y=49 em 48/48 quadros**; 0 pixel semitransparente; **19 cores** no máximo (N: 16), todas da rotação da própria direção (0 fora).
- Standing = cópia byte a byte das rotações da Fase 3 (SHA-256 conferido em S).
- E e W gerados separadamente (não espelhados), assim como N e S.
- GIFs: codificador próprio; os 16 decodificam com o número certo de quadros no decodificador local. **Não foram abertos num navegador** (o visualizador deste ambiente não lê GIF).
- Escala (G-2, conflito aberto, só registro): Labramon standing 36 px; walk 34–38 px; Tamer v13 34 px; tile 32.
- Paleta (conflito aberto, só registro): igual à Fase 3 — 0 pixels em cor exata da Endesga-32; nada mudou nesta fase.

## 7. Custo por operação [E]

| Operação | Ger | Qtde | Subtotal |
|---|---|---|---|
| `create_character` v3 import (4 rotações) | 0,25 | 1 | 0,25 |
| `animate_character` v3 custom — walk E, walk S, idle E, idle S (reprovados) | 1 | 4 | 4 |
| `animate_character` template dog — walk E, idle E (reprovados) | 1 | 2 | 2 |
| `animate_character` pixminimax — walk S, E, N, W | 1 | 4 | 4 |
| `animate_character` pixminimax — idle S, E, N, W | 1 | 4 | 4 |
| `correct_pixelart` (48 quadros em 4 chamadas) | 0,1 | 4 | 0,4 |
| `reduce_colors` (1 por direção) | 0,1 | 4 | 0,4 |
| **Total Fase 4** | | | **15,05** |

Saldo: 544,80 antes → **529,75** depois (`get_balance`). 6 ger foram para testes reprovados; os 2 idles pixminimax de S/N (2 ger) ficaram como alternativa. Nenhum crédito comprado.

## 8. O que não foi feito / limitações

- **Nota da matriz (Style Bible §8):** não atribuí. Quem produz não se avalia; a nota é do `game-qa`.
- Não testei no jogo nem no laboratório: cadência, deslize do pé e sombra de contato são da Fase 9.
- Não apaguei da conta PixelLab as 6 animações reprovadas (v3 e template) do personagem; estão listadas em `manifesto.json`. Apagar é ação destrutiva e fica para o coordenador decidir.
- Os quadros finais **não** foram gravados de volta no personagem PixelLab (lá estão os brutos); a fonte de verdade é `movement/`.
- Camadas separadas (corpo/cauda) não foram pedidas e não existem.
- As ressalvas herdadas da arte-mestra (franja com cara de cabelo, focinho de perfil um pouco longo, rosa mais saturado) seguem iguais: a animação usa os pixels da rotação.

## 9. Decisões que dependem do fundador / QA

1. Aceitar o **pixminimax + trava local do rosto** como padrão para quadrúpedes no método 1.1 (no lugar do v3 custom).
2. Idle: manter a mistura (E/W pixminimax, S/N rig local) ou usar uma única fonte nas 4 direções.
3. Walk N 2 px mais alto que o standing e walk S com 6 poses efetivas: aceitar ou pedir ajuste manual.
4. Manter ou dispensar `correct_pixelart` + `reduce_colors` quando a geração já usa `palette` (economia de 0,8 ger por personagem).
5. Escala 36 px e cor (pendências da Fase 3) seguem abertas.

## 10. Arquivos

`movement/`
- `standing/{S,E,N,W}.png`
- `walk/{S,E,N,W}/frame_000..007.png` · `idle/{S,E,N,W}/frame_000..003.png`
- `spritesheets/walk_{dir}.png` (480×60), `idle_{dir}.png` (240×60), `labramon_movement_sheet.png` (480×540: walk S,E,N,W; idle S,E,N,W; standing)
- `gifs/{walk,idle}_{dir}_{1x,4x}.gif` (walk 100 ms/quadro, idle 240 ms/quadro — sugestão de arte)
- `folha_contato_1x.png`, `folha_contato_4x.png` (fundo cinza, linha de chão), `folha_contato_3x_transparente.png`
- `manifesto.json`, `qa_medicoes.json`, `qa_tabelas.md`
- `_alternativas/` (idle pixminimax S/N, idle rig local E/W, walk rig local ×4, folha)
- `_evidencias/` (folha dos reprovados v3/template, folha e quadros brutos do pixminimax, log do pós-processo)

`scripts_f9_fase4/` — scripts Node sem dependências (medição, trava do rosto, rig, folhas, GIF, QA, manifesto).
`PROGRESS.md` — atualizado.

Para o `game-dev` integrar (Fase 9): ler `manifesto.json`; pivô (29,5; 49); tempo por quadro é parâmetro por espécie; sombra presa ao pivô.
