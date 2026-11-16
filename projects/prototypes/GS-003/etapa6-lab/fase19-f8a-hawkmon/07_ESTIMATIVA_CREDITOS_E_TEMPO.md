# 07 · Estimativa de créditos e tempo (para o Comando 14)

**Digital Odyssey (GS-003) · F8A · game-research (Opus 5.5) · 2026-11-15**
Só estimativa. **Nada foi gerado, nenhum saldo foi consultado** (o brief proíbe usar o PixelLab nesta fase, então não chamei nem o `get_balance`).
**[L]** lido em relatório ou log do estúdio · **[E]** medido ou visto · **[H]** estimativa minha.

## 0. Escopo que está sendo orçado

O escopo do C14 é fechado pelo próprio comando: **rotações S/N/E/W, walk de 8 quadros nas 4 direções e idle de 6 quadros nas 4 direções**. Sem voo, sem ataque, sem emoção. São 60 quadros, 20 deles por espelho (W) (`06_PLANO_DE_ANIMACAO.md` §10).
Escala de base: opção A (corpo 30 px + topete 8 px = 38 px), canvas final 60×60, âncora (29,5; 49) (`05_PROPOSTA_DE_ESCALA.md`).

## 1. Preços de referência (os do estúdio, não os do site)

| Item | Gerações | Fonte |
|---|---|---|
| `create_image_pro` Rookie, canvas 48 px (25 candidatos) | 10 | [L] `SPRITE_PRODUCTION_STANDARD_1.0.md` §3 |
| `create_character` v3 com referência (rotação, 4 direções) | 1 | [L] Standard §4 |
| `animate_character` v3 custom, 8 quadros, por direção (S, E, N) | 1 cada | [L] Standard §5 |
| Oeste por `mirror_animation` | 0 | [L] Standard §5 |
| `create_character_pro_flash` (8 direções, só texto + âncora) | 6 | [L] Standard §3 (funcionou num Champion; **não testado em Rookie**) |
| Espécie padrão (pro + rotate + andar + ataque + emoção) | ≈ 18 | [L] `fase12-comando9/f4/RELATORIO_F4.md` §4 |
| **Agumon real** | **23** (+28 % sobre o padrão: passou por v5, v6, v7) | [L] RELATORIO_F4 §4 |
| Polimento, rig 2D, Blender, híbrido F7 | 0 | [L] F2b, F3, F6, F7, F7v2 |
| Retro Diffusion: pacote equivalente de 1 espécie, sem repetições | ≈ US$ 1,2–1,5 | [L] `RELATORIO_F5.md` §1 |
| Retro Diffusion: saldo grátis | **esgotado** (86 % → 5 % na F5 prática) | [L] PROJECT_LOG 2026-11-14 ~19:10 |

## 2. Saldo: o ponto que bloqueia

| Dado | Valor | Fonte |
|---|---|---|
| Último saldo PixelLab registrado | **573,95** gerações | [L] PROJECT_LOG 2026-11-14 21:25 e RELATORIO_F7 (conferido às 21:17) |
| Piso vigente | **570** | [L] PROJECT_LOG 2026-11-14 ~08:20 ("Saldo ~573,95 (piso 570)") |
| Folga acima do piso | **≈ 3,95 gerações** | conta |

**[H] Conclusão:** qualquer caminho do C14 que use o PixelLab passa do piso. Até o caminho mais barato (§3, cenário mínimo, 14 gerações) precisa que o Vitor **baixe o piso** (para ≤ 552) ou autorize **compra**. Isso é exatamente a pré-condição 4 do C14 ("aprovação explícita do orçamento de créditos"). O saldo deve ser reconferido pelo game-studio antes de pedir o orçamento: o meu número é de ontem e não o verifiquei.

## 3. Créditos por cenário (escopo C14)

| Etapa | Mínimo | Realista [H] | Pessimista [H] | Observação |
|---|---|---|---|---|
| Pose base (`create_image_pro`, 48 px, refs oficiais + Agumon F7v2 S como estilo) | 10 | 10 | 20 (2ª rodada) | Os 25 candidatos são o ponto de controle do C14 §1 ("não avançar com deformação") |
| Rotação v3 (4 direções) | 1 | 2 | 3 | Risco alto no N e no E (ver `08`, R3 e R5) |
| Walk v3 S, E, N (W espelho) | 3 | 5 | 8 | +2 a +5 para refazer N e/ou E. Agumon: walk N foi o ponto fraco até a F7v2 [L] |
| Idle | 0 (rig) | 0 (rig) | 3 (v3 S/E/N) | Rig recomendado: cabeça travada + topete com atraso. v3 só se o rig falhar |
| **Total** | **14** | **17** | **34** | |
| Saldo depois (a partir de 573,95) | 559,95 | 556,95 | 539,95 | Todos abaixo do piso de 570 |

**Pedido de orçamento que eu sugiro ao Vitor [H]: teto de 22 gerações para o C14**, com dois pontos de parada:
1. depois da pose base (10): se nenhum dos 25 candidatos passar no checklist da ficha (`03` §11), **parar e voltar ao Vitor** em vez de gastar a 2ª rodada;
2. depois da rotação: se N ou E vierem deformados, só refazer uma vez (1 geração) e, se persistir, consertar à mão (0) antes de animar.

Esse teto cobre o realista (17) com margem de ~30 %, a mesma diferença que o Agumon teve sobre o padrão (23 ÷ 18).

**Alternativa mais barata, não testada:** `create_character_pro_flash` (6 gerações, 8 direções) no lugar de pro + rotate (11). Economiza 5, mas só tem 1 imagem em vez de 25 candidatos, e o Standard só registra sucesso em Champion grande e conhecido [L]. [H] Para o Hawkmon, com topete fino e faixa pequena, eu **não** começaria por ele.

## 4. Tempo por método (escopo C14)

Tempo de agente; a fila do PixelLab soma 2–4 min por chamada [L, RELATORIO_F4].

| Método | O que faz no C14 | Tempo de agente [H] | Gerações | Base da estimativa |
|---|---|---|---|---|
| **A** PixelLab Método A | pose base, rotação, walk S/E/N | 40–70 min (inclui 6–9 chamadas × 2–4 min de fila e triagem dos 25 candidatos) | 14–20 | [L] Agumon v5→v7, PROJECT_LOG 06:10 |
| **B** + polimento | limpar, travar cabeça e topete, pontas das asas, pé plantado | 30–60 min | 0 | [L] F2 ~14 min (3 espécies), F2b ~8 min; o Hawkmon tem mais peças finas (topete, fivela, 3 penas por asa) |
| **C** Rig 2D | idle 4 direções; opcional walk S/N | 30–45 min | 0 | [L] F3 ~8 min para 4 animações + recorte de 5–10 min por direção. Peças: cabeça+topete, gola, corpo, 2 asas, 2 pernas, cauda |
| **D** Blender como guia | gabarito de pose por quadro para a walk | 45–90 min | 0 | [L] F6: ~21 min para o modelo do Agumon (~60 linhas). [H] O Hawkmon é mais simples no corpo (esfera) e mais caro nas asas com 3 penas e no topete |
| **E** Retro Diffusion | não recomendado para o C14 | — | US$ 1,2–1,5 + repetições; exige compra mínima US$ 5 | [L] F5: saldo grátis acabou; resultado 6,4 e "reservar" |
| **F** Híbrido F7 | montagem final: walk E/W pé plantado 3 px/quadro, walk S/N, idle, pacote.json | 20–40 min | 0 | [L] F7 ~20 min, F7v2 ~15 min no Agumon, com scripts já prontos. [H] Os recortes e máscaras são por espécie |
| QA independente (game-qa) | 8 critérios + checklist da ficha | 30–40 min | 0 | [L] QAs F7 e F7v2 |
| Build isolado (game-dev) | só se o Vitor pedir para ver no jogo | 30–60 min | 0 | [L] C12.2 + 12.2b |

**Total recomendado (A + B + C + F, D opcional) [H]:** **2 h 30 min a 4 h de agente** para produção, mais ~40 min de QA, mais a rodada do ChatGPT. Em relógio, 1 tarde. Pela regra das 5 h de uso, cabe numa sessão se não houver segunda rodada de pose base; com ela, prever retomada.

## 5. O que não está orçado

- Ataque (Beak Pecker), Feather Slash com projétil e cabeça sem topete, feliz, corrida, abrir asas, voo e pouso: fora do C14. [H] Se forem pedidos depois, somar ~6–9 gerações (v3 S/E/N para 2–3 animações) e +4 a 8 rotações extras da cabeça sem topete (feitas à mão, 0 gerações, ~30–45 min).
- Encomenda a artista (Karasupx): valor desconhecido; **fora da autorização atual** (sem gasto, sem contratação).
- Retro Diffusion pago: depende de decisão do fundador (cenário 2, US$ 5) já registrada como aberta [L].
