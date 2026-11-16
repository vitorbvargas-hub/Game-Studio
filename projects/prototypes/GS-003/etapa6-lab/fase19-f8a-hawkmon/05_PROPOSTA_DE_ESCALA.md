# 05 · Definição GBA Plus: escala, paleta, detalhe, contorno, luz, silhueta e quadros

**Digital Odyssey (GS-003) · F8A · game-research · 2026-11-14**
**Escala (G-2) e paleta (G-1) continuam conflitos abertos da Etapa 6.** Aqui há **opções com recomendação**, não decisão. A escolha é do Vitor (com revisão do ChatGPT).
Prancha: `estudos/prancha_escala_opcoes_x4.png` — da esquerda: Tamer A sul (41 px), Agumon F7v2 S (35 px) e E (41 px), Hawkmon DS **oficial em tamanho nativo** (29 px), caixas das opções A (azul), B (laranja), C (vermelho). Linha cinza tracejada = altura do Tamer; marrom tracejada = Agumon S; xadrez = tile de 32 px.

## 1. Dados de partida

| Dado | Valor | Fonte |
|---|---|---|
| Tamer (vista sul) | 41 px de altura, 24–25 de largura; ficha v4: 41–43 | [E] medido em `lab-assets/a-f7v2/tamer/*/rotations` |
| Agumon F7v2 | S 22×35 · N 22×39 · E/W 36×41; canvas 60×60, âncora (29,5; 49) | [E] medido; [L] relatório F7v2 |
| Tile | 32 px | [L] |
| Classe "Médio" (Child) proposta | 30–42 px de altura, sempre abaixo do Tamer | [L] `ESCALA_E5_POR_ESPECIE_V1.md` §1 (proposta, não homologada) |
| **Hawkmon ÷ Agumon no DS Dawn/Dusk** | **0,85** até o alto da cabeça (23 ÷ 27); **1,07** com topete (29 ÷ 27) | [E] medido nos minis oficiais de frente, sem a sombra |
| Hawkmon: largura ÷ altura (até a cabeça), frente | 0,70 (16 ÷ 23) | [E] DS |
| Fã (Fenrimon, humano adolescente + Hawkmon) | Hawkmon ≈ 0,50 do humano até a cabeça, ≈ 0,61 com topete | [H] medido a olho na imagem ampliada; humano não é chibi |

**Regra do comando:** "não aumentar a escala só para facilitar detalhe" e "não modificar o estilo". Por isso todas as opções partem da relação **oficial** Hawkmon/Agumon, aplicada ao Agumon já aprovado para teste. Nenhuma opção muda o Tamer nem o Agumon.

## 2. Opções de escala

Medidas da vista **S**. "Corpo" = do pé ao alto da cabeça (sem topete).

| | **A — proporção DS (recomendada [H])** | **B — topete dentro da altura do Agumon** | **C — corpo igual ao Agumon** |
|---|---|---|---|
| Corpo | **30 px** (35 × 0,85) | 28 px | 34 px |
| Topete | 8 px | 7 px | 9 px |
| **Altura total** | **38 px** | **35 px** (= Agumon S) | **43 px** (> Tamer) |
| Largura S (asas recolhidas) | ~18–21 px (0,70 × 30 = 21; o DS dá 16 com asa colada) | ~17–20 | ~22–24 |
| Largura E/W | ~24–28 | ~22–26 | ~28–32 |
| Altura N | 38–39 (costas mostram o leque da cauda abaixo) | 35–36 | 43–44 |
| Razão para o Tamer (total / corpo) | 0,93 / 0,73 | 0,85 / 0,68 | 1,05 / 0,83 |
| Razão para o tile | 1,19 | 1,09 | 1,34 |
| Cabeça (≈ 0,40 do corpo) | ~12 px de altura | ~11 | ~14 |
| Olho | 3×3 a 3×4 | 3×3 (no limite) | 4×4 |
| A favor | Respeita a relação oficial dos jogos DS (mesma família de jogo do nosso campo). O topete passa do Agumon, como no DS, mas fica abaixo do Tamer. Rosto cabe com olho de 3–4 px | Nunca mais alto que o Agumon: o casal Tamer/Digimon fica mais "ordenado" | Mais pixels para o rosto (faixa + fivela + olhos + 2 marcas) |
| Contra | Rosto apertado: faixa (3 px) + olhos (3–4) + bico (4) em 12 px exige precisão | Rosto **mais apertado**; o Hawkmon fica menor do que a relação oficial | **Viola** "não aumentar só para detalhe"; o topete passa da cabeça do Tamer (43 > 41) e lê como "maior que o Tamer" |
| Canvas 60×60 | cabe (sobra 11 px em cima para salto/topete lançado) | cabe | cabe, com folga menor |

**Recomendação [H]: A.** Motivo: é a única com base numa relação oficial medida, mantém o Hawkmon abaixo do Tamer e não aumenta a escala para facilitar detalhe. **B** é o plano de reserva se o Vitor quiser que nenhum parceiro passe do Agumon. **C** fica registrada só para comparação.

**O que esta escala não resolve:** a relação Tamer/Digimon de toda a Etapa 6 (G-2). Se o Agumon mudar de altura no futuro, A acompanha (é 0,85 do Agumon), B e C não.

**Colisão:** continua a do jogo (`radiusByStage`, Child = 16 px, Rota 1) [L, `ESCALA_E5` §2]. O topete **não** entra na colisão nem na âncora; só no recorte visual.

## 3. Nível de detalhe e contorno

| Item | Proposta [I] | Por quê |
|---|---|---|
| Contorno | 1 px, escuro quente (família `#0c0506`–`#1e0501` do Agumon F7v2 [E]) | Consistência com o par já aprovado para teste |
| Contorno interno | Seletivo: só entre cabeça/gola, gola/corpo, asa/corpo e no bico | Evita "embarrar" o rosto em 12 px |
| Pontas das asas | **Cinza-escuro, não preto do contorno** | Se forem do mesmo preto do contorno, as 3 penas somem na borda (o DS usa `#525252`/`#181818` [E]) |
| Faixa | Cinza-escuro distinto do contorno, 3 px | Senão funde com o contorno do olho e vira óculos |
| Rampas | 3–4 tons por material | Igual ao nível do Agumon F7v2 |
| Antisserrilhado | Nenhum semitransparente; 0 pixels soltos | Métricas que o QA já usa [L] |
| Dithering | Não | [H] o pacote do Agumon não usa; não medi formalmente |

## 4. Paleta (G-1 aberto: duas opções)

### P1 — derivada das fontes oficiais, no padrão de rampas do pacote do Agumon [I]
~24 cores. Valores **propostos**, não medidos de arte final.

| Material | Tons (claro → escuro) |
|---|---|
| Contorno | `#1a0807` |
| Branco da cabeça e da gola | `#fbf7ee` `#e4dccd` `#b4aa9b` `#7a7066` |
| Vermelho do corpo, asas, topete, marcas | `#e2473b` `#b82a2a` `#7e1b1f` `#4a1015` |
| Pontas das asas | `#5d5c68` `#3a3944` `#24232c` |
| Faixa | `#3d3c46` `#2a2932` + fivela `#dfe1e8` `#9c9eac` |
| Amarelo (bico, pernas, pés, ponta do topete) | `#ffe45c` `#f2b52e` `#c77a1c` `#7c4512` |
| Olho | `#8fd0f2` `#3b7ac2` + pupila = contorno + brilho = branco mais claro |
| Garras | `#f6f6f6` `#b9bdc6` |

Decisões embutidas (todas de cor, para o Vitor confirmar):
- vermelho **entre** o bordô do anime e o vivo do Reference Book;
- cabeça **creme quente** (anime) em vez de branco-azulado (Reference Book/DS batalha), para casar com o laranja do Agumon;
- amarelo **dourado** (Reference Book) em vez do amarelo-claro do anime.

### P2 — Endesga-32 (a paleta do Style Bible)
Mapeamento [I] pelo tom mais próximo: vermelho `#e43b44` `#a22633` `#3e2731`; branco `#ffffff` `#c0cbdc` `#8b9bb4`; amarelo `#fee761` `#feae34` `#f77622`; pontas das asas e faixa `#5a6988` `#3a4466` `#262b44`; contorno `#181425`; olho `#2ce8f5` `#0099db` `#124e89`; fivela `#c0cbdc`.
- [H] O Hawkmon cabe bem na Endesga-32 (vermelho, branco, amarelo e cinza-azulado existem).
- **Mas** o Agumon F7v2 tem **0 cores exatas** da Endesga-32 [L, F7]. Usar P2 no Hawkmon deixaria o par incoerente. P2 só faz sentido se o Vitor decidir migrar os dois.

**Recomendação [H]: P1**, pela coerência com o Agumon que está no teste. G-1 continua aberto.

## 5. Luz

De cima e de frente, sem lado preferido, igual ao Agumon F7v2 (sem viés lateral nas rotações S e N [E, medido]). Sombra no chão: fora do sprite. [E] as rotações do Agumon F7v2 não têm sombra no PNG (bbox S 22×35 só com o corpo); quem desenha a sombra é o jogo [H, não conferi no código].

## 6. Silhueta por direção (resumo; detalhe em `04_ESTUDOS_DE_DIRECAO.md`)

| Direção | Forma | Largura (A) | Altura (A) |
|---|---|---|---|
| S | boliche + agulha no alto; mais largo nos pés e nas pontas das asas | 18–21 | 38 |
| N | cúpula branca com tira escura + "manto" de penas em ponta + leque da cauda | 18–21 | 38–39 |
| E | círculo com gancho à direita, agulha inclinada para trás, cauda curta à esquerda | 24–28 | 37–38 (o topete inclina) |
| W | espelho de E | 24–28 | 37–38 |

**Teste de silhueta (para o QA do C14):** preencher o sprite de preto a 1×. Tem que dar para dizer "ave com topete" em S, N e E. Se em N parecer só um ovo com uma vareta, faltam as penas em ponta.

## 7. Quadros por animação (proposta)

Igual ao pacote do Agumon F7v2 onde existe equivalente, para o jogo reaproveitar os tempos:

| Animação | Quadros | Tempos | Base |
|---|---|---|---|
| Rotações | 1 por direção | — | Agumon F7v2 |
| Idle | 6 | ~150–200 ms | Agumon F7v2 idle 6 [L] |
| Walk | 8 | ~110 ms | Agumon F7v2 walk 8 (menor delay 110 ms) [L] |
| Corrida | 6 | ~80 ms | [I] |
| Abrir asas | 6 (sem loop) | 80–120 ms | [I] |
| Voo (pairar) | 4–6 em loop | ~90 ms | DS idle de batalha bate asa em 3 [E]; Neroesaurus flying 4 [E, fã] |
| Feliz | 8–10 | como o Agumon | Agumon F7v2 feliz 10 [L] |
| Ataque simples | 9 | como o Agumon | Agumon F7v2 ataque 9 [L] |

Detalhe de cada uma em `06_PLANO_DE_ANIMACAO.md`.

## 8. Decisões que dependem do Vitor

1. Escala A, B ou C (recomendação: A).
2. Paleta P1 ou P2 (recomendação: P1, pela coerência com o Agumon).
3. Vermelho bordô (anime) × vivo (Reference Book) × intermediário (P1).
4. Cabeça creme × branco-azulado.
