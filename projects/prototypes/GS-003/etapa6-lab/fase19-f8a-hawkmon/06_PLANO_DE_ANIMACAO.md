# 06 · Plano de animação do Hawkmon

**Digital Odyssey (GS-003) · F8A · game-research · 2026-11-14**
Só planejamento. Nada foi animado. O **C14 faz só rotações, walk (4 direções) e idle**; corrida, abrir asas, voo, feliz e ataque ficam para depois (C14: "não criar ataques ou emoções nesta primeira entrega"; "não criar voo").
Base de medidas: escala opção A (corpo 30 px + topete 8), canvas 60×60, âncora (29,5; 49). **[E]** fonte vista · **[L]** lido · **[I]** proposta minha.

## 0. Princípios

1. **Andar ≠ voar.** No andar, os pés tocam o chão em todo quadro, as asas ficam recolhidas e só balançam como braços; a sombra do jogo fica colada. No voo, os pés saem do chão e se recolhem, as asas abrem e batem com amplitude grande, e o corpo sobe (a sombra fica no chão e encolhe). [E] DS: o salto tem asas abertas e sombra descolada; o andar tem asas fechadas.
2. **Cabeça travada.** A cabeça (com faixa e rosto) é o mesmo desenho em todos os quadros de uma direção; só desloca inteira (sobe-desce 1 px). Foi o que levou o Agumon de 5,75 (PixelLab cru) para 7,7 [L, QAs F4/F7].
3. **Topete com atraso de 1 quadro.** Ele acompanha a cabeça, mas a ponta atrasa 1 quadro e balança ±1 px (como a ponta da cauda do Agumon no F7 [L]). Nunca se descola, exceto na Feather Slash.
4. **Pé plantado.** O pé de apoio não desliza (QA-B7 do Agumon ainda está aberto [L, PROJECT_LOG 00:20]).
5. **Asas = braços.** Na walk elas balançam em oposição às pernas, como os braços do Agumon. Amplitude pequena (1–2 px na ponta).

## 1. Idle (respiração e piscar) — **C14**

| Quadro | O que muda [I] |
|---|---|
| 0 | pose base |
| 1 | corpo + gola sobem 1 px (inspira); cabeça junto |
| 2 | igual a 1; ponta do topete inclina 1 px (atraso) |
| 3 | volta à base |
| 4 | **piscar**: olho vira linha de 1 px (só S, E, W; N não tem olho) |
| 5 | base; pontas das asas descem 1 px (penas assentando) |

- 6 quadros, ~150–200 ms, loop. Igual ao número do idle do Agumon F7v2 (6) [L].
- N: só respiração + topete + cauda (como o idle N do Agumon, que é só respiração [L]).
- Movimento secundário das penas: o leque da cauda abre 1 px no quadro 2 [I].

## 2. Caminhada (4 direções) — **C14**

8 quadros, ~110 ms, loop, igual ao Agumon [L].

| Quadro | Pernas | Corpo | Asas (braços) | Topete | Cauda |
|---|---|---|---|---|---|
| 0 contato | pé direito à frente, esquerdo atrás | base | asa esquerda à frente 1 px | base | base |
| 1 | peso no direito | −1 px | passando | ponta atrasa | 1 px para a esquerda |
| 2 passagem | esquerdo passa | −1 px | neutras | volta | base |
| 3 | esquerdo avança | base | asa direita começa a ir à frente | — | — |
| 4 contato | espelho do 0 | base | asa direita à frente 1 px | base | base |
| 5–7 | espelho de 1–3 | | | | 1 px para a direita |

- **S/N:** passo **alternado** (um pé chato, outro em ponta). Não repetir o erro do F2b (as duas pernas iguais = agachar) [L].
- **E/W:** pé plantado com deslocamento de **3 px por quadro**, como o Agumon C10/F7 (C10 deu 8,0 no QA) [L]; W = espelho de E.
- **Ritmo de ave [I]:** opcional, a cabeça "avança e para" 1 px no contato (o balanço de cabeça de pombo). **Recomendo não usar no C14**: entra em conflito com "cabeça travada" e o Agumon andaria diferente do Hawkmon no mesmo grupo.
- Referências: DS andar 3 quadros (3/4) [E]; Digimon UP walking 13 quadros (3/4) [E, só link]; WSC andar 2 quadros S/W/N [E]; Neroesaurus walking 8 (lado) [E, fã].

## 3. Movimento secundário das asas

- Walk: oposição às pernas, 1–2 px na ponta; as 3 penas escuras **não** trocam de forma (para não piscar).
- Idle: pontas descem 1 px uma vez por ciclo.
- Corrida: asas meio abertas para trás (equilíbrio), 2–3 px.
- Feliz: asas sobem acima da cabeça (WSC alegria [E]).

## 4. Movimento da cauda

- Leque de 3–4 penas. Balança 1 px para o lado oposto ao pé que avança (walk) e abre 1 px na respiração (idle).
- Visível de verdade só em N e E/W; em S, no máximo 1–2 px atrás das pernas.

## 5. Corrida — depois do C14

6 quadros, ~80 ms. Tronco inclinado 1–2 px para a frente (E/W); passada maior (4–5 px por quadro); um quadro com os dois pés fora do chão; asas meio abertas para trás; topete deitado para trás. [I] Não há corrida oficial do Hawkmon nas fontes vistas.

## 6. Abertura das asas — depois do C14

6 quadros, sem loop: 0 base → 1 antecipação (asas encolhem, corpo desce 1 px) → 2–3 abrem (envergadura ~2× a largura) → 4 segura (penas escuras bem separadas) → 5 volta. [E] referência: arte do Reference Book (asas abertas) e DS batalha (pose de ataque com asas abertas).
**Canvas:** com a escala A, envergadura ≈ 40–44 px: cabe no 60×60.

## 7. Voo — depois do C14 (e sujeito à regra de jogo)

- Pairar: 4–6 quadros em loop, ~90 ms. Asas batem de cima (penas escuras para cima) a baixo; pés recolhidos sob o corpo; corpo sobe 6–10 px em relação à âncora; topete inclina para trás no golpe de asa para baixo.
- Pouso: 4 quadros (asas abertas freando, pés descem, contato com joelho dobrado, recolhe asas).
- [E] DS: idle de batalha bate asa em 3 quadros; salto de campo com sombra descolada. [E, fã] Neroesaurus flying 4; Neoweegee hover 3, glide 2, land 2.
- **Atenção:** voar no mapa é **mecânica**, e as regras de jogo estão congeladas. Planejo só a animação. [H] Voo sustentado não está confirmado em fonte oficial lida; o Reference Book mostra o corpo no ar, mas não diz que voa.

## 8. Emoção feliz — depois do C14

8–10 quadros. Pulo com asas para cima e bico aberto (WSC "alegria" e Reference Book [E]); olhos fechados em arco no topo do pulo; pés saem do chão (a altura do corpo não muda, só a posição, regra do Standard [L]). Igual ao "feliz pulando" do Agumon em quadros (10) [L].

## 9. Ataque simples — depois do C14

Duas técnicas oficiais. Recomendação [I]:

| | **Beak Pecker** (golpe simples) | **Feather Slash** (golpe especial) |
|---|---|---|
| Fonte | Reference Book: bicada rápida como pica-pau [E] | Reference Book + folha do anime: tira o topete com as duas asas, lança, ele gira e **volta** [E] |
| Quadros | 9: antecipação (cabeça recua 2 px) → 3 bicadas rápidas (cabeça avança 2–3 px, com 1 quadro de impacto cada) → recuperação | corpo 9 + **projétil separado** (topete girando) com `nascer`, `voo`, `retorno`, `captura` |
| Dificuldade | baixa; a cabeça avança, o resto fica | alta: **cabeça sem topete** por vários quadros; o projétil precisa ida e volta; a cabeça precisa da versão "sem topete" nas 4 direções |
| Reaproveita | — | O padrão do **projétil do Pepper Breath** (canvas 24×24, âncora no centro, quadro de disparo por direção, ordem de desenho) [L, F7v2 §4] |
| Para o C14 | — | — |

**Recomendação [H]:** "ataque simples" = **Beak Pecker** primeiro. A Feather Slash entra depois, como especial, com projétil, porque precisa de um desenho de cabeça sem topete (8 rotações extras de cabeça) e de regra de jogo para o retorno.

## 10. O que o C14 entrega (escopo fechado pelo C14)

| Item | Quadros | Direções |
|---|---|---|
| Rotações | 1 | S, N, E, W (W espelho) |
| Walk | 8 | S, N, E, W (W espelho) |
| Idle | 6 | S, N, E, W (W espelho) |

**Total: 4 + 32 + 24 = 60 quadros**, dos quais 20 vêm de espelho (W).
