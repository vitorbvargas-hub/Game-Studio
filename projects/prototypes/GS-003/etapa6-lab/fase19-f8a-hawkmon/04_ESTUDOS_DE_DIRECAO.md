# 04 · Quatro estudos de direção (S, N, E, W)

**Digital Odyssey (GS-003) · F8A · game-research · 2026-11-14**
Estudos **escritos e anotados sobre a arte oficial**, um por direção do jogo. **Não são sprites** e nada foi gerado (0 gerações, PixelLab não usado).
Prancha de apoio: `estudos/prancha_direcoes_oficial_x6.png` (recortes oficiais do DS Dawn/Dusk e do Digital Partner, ampliados ×6; linha verde = chão; linha vermelha tracejada = topo com topete).

> **Leitura do item 7.4.** O comando pede "Quatro estudos de direção". Li como **um estudo por direção do jogo** (S, N, E, W), porque o C14 §2 pede exatamente essas quatro e o §4 do C13 pede "silhueta para cada direção". As variações de **direção de arte** (escala e paleta) estão em `05_PROPOSTA_DE_ESCALA.md` como opções A/B/C e P1/P2. Se a intenção era outra, é só dizer: o material de base é o mesmo.

**Padrão comum às 4 vistas [I, proposta]:** canvas 60×60 e âncora (29,5; 49), iguais ao Agumon F7v2, para o jogo usar o mesmo código de alinhamento. Luz **de cima e de frente, sem lado preferido**, como no Agumon F7v2: medi a luminância média das metades esquerda e direita das rotações S (170,9 × 170,8) e N (172,8 × 172,9) e não há viés lateral [E]. Na E o lado direito é mais claro (163,4 × 177,1), mas ali a metade esquerda é a cauda, mais escura por desenho [H]. O C14 deve copiar a luz do Agumon. Contorno escuro de 1 px, quente e quase preto, da mesma família do Agumon (`#0c0506`–`#1e0501` [E, medido no F7v2]). Altura pela opção A da escala: 30 px até o alto da cabeça + 8 px de topete.

## Estudo 1 · SUL (frente)

**Fontes:** DS frente parado (16×29) e 3/4 frente andando (3 quadros); WSC mini frente (14×27, 2 quadros); folha do anime (frente); Reference Book.

**Silhueta [E→I]:** um "boliche" de cabeça grande sobre corpo oval, com duas asas pendendo dos lados e dois pés largos embaixo; topete como uma agulha no meio do alto da cabeça. Largura máxima nos pés e nas pontas das asas, não na cabeça.

**Leitura de cima para baixo (escala opção A, 38 px no total) [I]:**

| Faixa (px a partir do topo) | O quê |
|---|---|
| 0–7 | topete: 2–3 px de largura, base vermelha (4–5 px), ponta amarela (3 px) |
| 8–11 | alto da cabeça branco, 2 tufos laterais de 1–2 px |
| 12–14 | **faixa** escura, 3 px de altura, fivela clara 2–3 px no centro; V vermelho de 2 px sobre a faixa acima de cada olho |
| 15–19 | olhos (3×3 a 3×4, azul + pupila + brilho), traço vermelho na bochecha, bico amarelo central 4–5 px de largura, curvo |
| 20–22 | gola em zigue-zague (3–4 pontas) |
| 23–29 | corpo vermelho; asas dos lados até ~y 28, com as 3 penas escuras para baixo |
| 30–37 | pernas amarelas (2 px) e pés com 2–3 garras brancas; chão em y = 37 do sprite |

**Simetria:** a frente é simétrica, então a walk S **não pode** ser o mesmo desenho dos dois lados ao mesmo tempo (lição do Agumon F7v2: no F2b as duas pernas faziam o mesmo movimento e virava "agachar") [L]. Passo alternado: um pé chato, outro em ponta.

**Não pode sumir:** fivela, os 2 V vermelhos, o bico, a gola. **Risco:** a faixa escura colada nos olhos vira "óculos escuros" se o azul do olho for pequeno demais; manter o olho ≥ 3 px de altura com brilho branco.

## Estudo 2 · NORTE (costas)

**Fontes:** folha do anime (costas); WSC costas 48 px (38×47) e minis de costas (15×28, 2 quadros); DS 3/4 costas (3 quadros, 16–17×24–26).

**Silhueta [E]:** o topete continua no centro; a cabeça é uma cúpula branca lisa **com a tira da faixa atravessando**; abaixo, o corpo vira um "manto" de penas vermelhas em pontas (3 pontas grandes no anime) e as asas recolhidas dos lados com as pontas escuras para baixo; pés amarelos aparecendo embaixo.

**O que muda em relação à frente:**
- some: olhos, bico, marcas vermelhas, fivela, gola em zigue-zague da frente (de costas a gola aparece só como borda branca irregular na nuca) [E, anime];
- aparece: **tira da faixa** (3 px, escura) atravessando a nuca de lado a lado; **penas das costas em pontas**; **leque da cauda** (2–4 px abaixo das penas, centrado);
- os tufos laterais da cabeça continuam.

**Risco principal (mesmo do Agumon):** costas "lisas" que não dizem nada. No Agumon, o QA criticou "lê como um corpo liso" [L, `RELATORIO_NOITE`]. Aqui a solução tem fonte: tira da faixa + penas em ponta + topete. **Não inventar** marcas que não existem (lista negativa da ficha).

**Walk N:** as pontas das asas balançam em oposição ao passo; o leque da cauda balança 1 px para o lado contrário do pé que avança [I].

## Estudo 3 · LESTE (perfil virado para a direita)

**Fontes:** WSC mini de lado (olha para **oeste**; 16×27, 2 quadros) e pose de lado a 48 px (44×48); DS 3/4 (só como apoio de cor); Neroesaurus e Neoweegee (fã, lateral) só como movimento.

**Silhueta [E→I]:** cabeça redonda com o **bico em gancho** saindo à direita (~1/4 da largura da cabeça); **topete inclinado para trás** (para a esquerda); a faixa corta a cabeça na altura do olho e some atrás; uma asa (a de cá) cobre o flanco, com as penas escuras apontando para trás-baixo; **cauda curta** saindo atrás, à esquerda; pernas em passo, dedos com garras para a direita.

**Largura:** maior que a frente por causa do bico e da cauda. [I] ~24–28 px na opção A (Agumon E tem 36 px por causa da cauda longa [E]).

**Um só olho**, azul, com a marca vermelha atrás dele. A fivela **não** aparece de lado (fica na testa) [E, WSC lado].

**Diferença do Agumon:** o Agumon de lado alonga (focinho + cauda grossa). O Hawkmon de lado fica quase do mesmo tamanho da frente: cabeça e corpo redondos; o que muda é o bico e a cauda. **A cabeça não pode crescer nem encolher ao virar** (mesma regra da ficha do Agumon) [L].

## Estudo 4 · OESTE (perfil virado para a esquerda)

**Fonte direta:** o mini lateral do WSC **já olha para oeste** [E].

**Espelhar E→W?** Sim, com uma checagem: o Hawkmon é praticamente simétrico (faixa, topete centrado, marcas dos dois lados), então o espelho **não troca nenhum detalhe assimétrico de identidade** [E pela ficha]. O único item assimétrico é a fivela, que não aparece de lado. Recomendação: W = espelho de E, como no Agumon (W = espelho de E em walk/idle/ataque, 0 px de diferença [L, F7v2]).

**Exceção prevista:** no ataque Feather Slash, se o topete for lançado com uma das asas (anime: com as duas), o espelho continua valendo. Se um dia houver assimetria (ex.: o topete preso mais para um lado), desenhar o W à parte, como foi feito com o projétil do Agumon [L].

## Resumo para o C14

| Direção | Elemento-âncora da leitura | Maior risco |
|---|---|---|
| S | faixa + fivela + olhos azuis + bico | faixa virar óculos; gola sumir |
| N | tira da faixa na nuca + penas em ponta + topete | costas lisas genéricas |
| E | bico em gancho + topete para trás + cauda curta | cabeça mudar de tamanho; asa virar braço sem as pontas escuras |
| W | espelho de E | nenhum (espécie simétrica) |
