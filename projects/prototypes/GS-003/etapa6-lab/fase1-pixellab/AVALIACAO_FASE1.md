# AVALIACAO_FASE1 — Etapa 6, Comando 4, Fase 1 (checkpoint 1, Método B)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13 · **Sessão de produção.** Esta é a autoavaliação do autor (AGENTS.md §6: a revisão independente é do `game-qa`, em sessão separada, antes de qualquer homologação ou integração).
- **Base lida:** `COMANDO_ETAPA6_C4_LAB_JOGAVEL.md`, `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1–D6), `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` (rev. 2), `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md`, `ESCALA_E5_POR_ESPECIE_V1.md`, `BRIEFING_UNICO_LAB_A_B_C.md` §1/§6.2, `COMPARATIVO_PALETAS_FLORESTA_V1.md`, `RUBRICA_QUALIDADE_VISUAL_V1.md` (rev. 2) + `AJUSTES_RUBRICA_VISUAL_V1.md`.
- **Vocabulário de veredito usado:** "candidato" ou "reprovado" (nunca "aprovado" — AGENTS.md §5, comando §"AVALIAÇÃO").
- **Metodologia de medição:** ferramentas Python locais sem dependência paga (`pxpng.py`, já existente no workspace), 0 geração PixelLab: `measure_fase1.py` (bounding box opaco = altura/largura de conteúdo real em px), `techcheck_fase1.py` (% de pixels semitransparentes = halo/AA na borda), `zoom_fase1.py` (ampliação 4x nearest-neighbor para inspeção de grade de pixel), `walkstrip_fase1.py` (tiras de quadros + variação do pé entre quadros), `compose_fase1.py` (composição 1x sobre o recorte real da floresta v15b). Todos os scripts ficam em `workspaces/game-art/tools/`.

---

## 0. Consumo desta rodada (ver `CONSUMO_PIXELLAB_ETAPA6.md` para o log completo)

| Item | Gerações | Resultado |
|---|---:|---|
| Tileset grama/água | **0** (reaproveitado) | `a4ca04e4-eab6-42e3-9cbf-b155390b8e9b`, já na conta |
| Tamer preset 1 (8 direções) | 2 | — |
| Tamer preset 2 (8 direções) | 2 | — |
| Agumon E5 Médio (8 direções) | 2 | — |
| Walk Tamer preset 1 (S, E, N) | 3 | — |
| Walk Agumon (S, E) | 2 | — |
| Espelho W (Tamer e Agumon) | 0 (grátis) | — |
| **Total gasto** | **11** | dentro do teto de 15 (rev. 2) e do checkpoint de ~30 |

Saldo: **737,95 → 726,95** (confirmado por `get_balance` antes/depois de cada lote, log completo em `CONSUMO_PIXELLAB_ETAPA6.md`). **Acima do piso de 650** com folga de 76,95 — nenhum retrabalho foi necessário (nenhum item falhou um bloqueante duas vezes), então a reserva de 3 gerações não foi usada.

---

## 1. Tileset grama/água — **reaproveitado, candidato**

- **Decisão:** não gerado. `list_topdown_tilesets` já tinha `a4ca04e4-eab6-42e3-9cbf-b155390b8e9b` — "shallow calm river water with a light ripple pattern... -> light clean green-teal forest grass, pale desaturated green", 32×32px, high top-down, 16 tiles, chainable. A descrição da grama ("green-teal", "pale desaturated green") bate com a cor dominante medida da v15b (`#76ca9f`, teal-esverdeado, `COMPARATIVO_PALETAS_FLORESTA_V1.md` §3) — é tecnicamente adequado ao recorte-piloto.
- **(A) Fidelidade:** não avaliada aqui — é arte já existente da própria linhagem de produção v15/v15b, fora do escopo desta avaliação (foi avaliada quando criada).
- **(B) Técnico:** tile 32px confere com o requisito do comando ("tile 32, standard"). Formato Wang de 16 tiles, chainable.
- **Veredito: candidato** (reuso correto, sem gasto).

---

## 2. Tamer Original — Preset 1 — **candidato**

- **ID:** `32577b34-c43c-4e34-91b7-364140f1a4e2` (grupo `0b519e2a-a973-45fd-8827-c801ace20fdb`)
- **(B) Técnico:**
  - Canvas 48×48px (bate com `BRIEFING_UNICO` §1.1).
  - **Conteúdo opaco medido (south): 26×46px.** Dentro da faixa D1 (36–50px) ✅, mas **acima do alvo-teste de 40px** fixado pelo briefing (meio da faixa) — ficou perto do teto, não do meio. Registrado como desvio do alvo de teste, não como falha de D1 (D1 é 36–50, 46 está dentro).
  - 8 direções geradas; East/North/West também medidas: 21×46 / 23×44 / 21×46px — altura consistente entre direções (43–46px, variação de 3px entre poses, dentro do esperado por mudança de perspectiva, não um erro).
  - **Transparência:** 0,00% de pixels semitransparentes na borda (`techcheck_fase1.py`) — recorte limpo, sem halo (I-01/I-02 **passa**).
  - **Pivô:** não medido numericamente nesta rodada (ferramenta de medição de pivô por quadro não construída); a composição visual (§6) usa o pé do bounding box como pivô e o resultado ficou coerente, sem flutuação visível.
  - **Walk:** ver §4.
- **(A) Pixel art nativa / fidelidade / proporção:**
  - Inspeção em zoom 4x (`zoom_tamer1_south_4x.png`): **grade de pixel nativa** — blocos sólidos, sem degradê redondo nem anti-aliasing por cima do contorno (o defeito que reprovou a Fase 0 do ChatGPT, `RELATORIO_AVALIACAO_ASSETS_FASE0.md`, **não está presente aqui**).
  - Contorno: 1px preto, majoritariamente sólido e consistente ao redor da silhueta.
  - **Design original, não personagem do anime:** boné vermelho (não óculos de proteção estilo Tai/Adventure, que é o traço mais reconhecível dos Chosen Children), jaqueta azul-clara, bermuda cargo verde-oliva, alça de mochila cruzando o peito, dispositivo laranja no cinto, tênis branco com detalhe verde — bate com a descrição enviada e com o contrato de camadas (`ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §2: corpo, roupa inferior, roupa superior, "cabelo" sob o boné, acessório mochila+dispositivo todos presentes visualmente, ainda que como preset composto, não camadas reais — limitação já prevista em `ESPECIFICACAO_TAMER` §9, o PixelLab não separa camada alpha nativamente).
  - **Comparação com o Tamer v13 (`tamer_v13_south.png`, referência atual em jogo):** o v13 usa óculos de proteção vermelhos sobre cabelo ruivo — visualmente mais próximo da iconografia clássica de Tai Kamiya (Digimon Adventure) do que este preset novo. O preset 1 novo é **mais original** nesse sentido específico (boné em vez de óculos), o que é o espírito de D1 ("personagens do anime não são modelos básicos obrigatórios").
- **Veredito: candidato.** Dentro da faixa D1, pixel art nativa, sem halo, design original. Ressalva: altura ficou 6px acima do alvo-teste de 40px (não é falha de D1, mas quem for fixar um valor único de produção deve decidir se 46px ou algo mais próximo de 40px é o alvo real).

---

## 3. Tamer Original — Preset 2 — **candidato**

- **ID:** `1c1f6a8d-cd0c-4cb9-a8f5-91115847e96a` (grupo `f998cf6e-3e19-4697-b78c-9d8c6be21647`)
- **(B) Técnico:** canvas 48×48px, conteúdo opaco (south) **26×45px** — dentro de D1, quase idêntico em altura ao preset 1 (45 vs 46px, diferença de 1px) — **boa consistência de escala entre presets**, o que é o requisito central de "mesma base de corpo" do orçamento (rev. 2, item 2). 0% semitransparência (sem halo).
- **(A) Fidelidade/diferenciação:** cabelo preto em rabo de cavalo, capuz/colete amarelo sobre camisa listrada, shorts azuis, luvas vermelhas sem dedos, tênis roxos — **claramente diferente do preset 1** em silhueta de cabelo, paleta de roupa e acessórios (prova de personalização por preset, pedida pelo comando). Grade de pixel nativa confirmada em zoom 4x, mesmo estilo de contorno/sombreamento do preset 1 (consistência de família visual entre os dois presets).
- **Limitação registrada:** como previsto em `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §9, este é um **preset completo**, não um sistema de camadas real — o PixelLab não gera "camada de cabelo" ou "camada de roupa" isoladas nesta rodada. A prova de conceito é de presets, não do sistema de personalização em camadas descrito na especificação.
- **Veredito: candidato**, com a mesma ressalva do preset 1 sobre o alvo de altura.

---

## 4. Walk do Tamer preset 1 (S, E, N geradas; W por espelho) — **candidato**

- **Grupo:** `3a21d838-864d-45ef-ae03-bbee79cec25c`, template `walking`, 6 quadros/direção.
- **(B) Técnico — consistência de quadro a quadro (critério L4, `BRIEFING_UNICO` §4: variação de pé ≤1px):** medido objetivamente com `walkstrip_fase1.py` na direção sul: pé (bottom do bbox opaco) em `[44,44,43,43,43,43]` → **variação de 1px, dentro do critério L4.**
- **(A) Qualidade do ciclo:** tira de quadros (`walkstrip_tamer1_south.png`) inspecionada visualmente — pernas alternam claramente, braços balançam, boné e mochila seguem a pose sem "derivar" entre quadros, silhueta e cor estáveis nas 6 posições. É um ciclo de caminhada legível e fluido.
- **Direção W:** obtida por `mirror_animation` (grátis, espelho exato de E) — nenhuma distorção esperada, é reflexo pixel-a-pixel.
- **Veredito: candidato.** Nenhum problema encontrado; o template `walking` do PixelLab funcionou bem para um humanoide, como já era esperado pelo histórico do Tamer v13 (`TAMERS_V13.md`).

---

## 5. Agumon E5 Médio — **candidato com ressalva**

- **ID:** `c9b4d538-fd4c-4b73-8d41-4e606b7c597d` (grupo `a01df218-05a3-47f4-8f45-3e0e8448d15e`)
- **(B) Técnico:**
  - Canvas 40×40px (bate com `BRIEFING_UNICO` §1.2, "canvas sugerido 40×40").
  - **Conteúdo opaco medido (south): 34×38px.** Altura 38px está **dentro da faixa E5 Médio (30–42px)** e também dentro da faixa mais estreita do `ESCALA_E5_POR_ESPECIE_V1.md` §3.1 (32–40px) ✅. **Largura medida (34px) é bem maior que a largura-alvo do briefing (27px)** — garras/braços abertos lateralmente alargam a silhueta além do previsto; não é um erro de proporção do Digimon (Agumon tem braços curtos e abertos no design oficial), mas é um desvio do número-alvo que quem for compor o mapa final precisa considerar (corredor mínimo, §7 do `ESCALA_E5_POR_ESPECIE_V1.md`).
  - East medido igual ao south (34×38px) — consistência entre direções.
  - 0% semitransparência — sem halo.
- **(A) Fidelidade ao design oficial (Agumon):**
  - Cor: amarelo-alaranjado nas costas, barriga/focinho mais claro (creme) — bate com a descrição pedida e com a identidade canônica.
  - Garras brancas visíveis nas mãos e pés — presentes.
  - Olhos: no zoom 4x, leem mais como **verde-azulado/ciano** do que um verde puro — próximo, mas não idêntico ao "olhos verdes" pedido; é uma leitura de cor limítrofe, registrada aqui para quem for decidir se precisa de ajuste de cor num retrabalho futuro (não foi tratado como falha bloqueante nesta rodada — a cor não é uma falha crítica de franquia, é uma nuance de tom).
  - Nadadeira/crista na cabeça, cauda curta, postura bípede — presentes, batem com o design oficial.
  - Grade de pixel nativa confirmada em zoom 4x (sem degradê redondo).
  - **Comparação com o Agumon DS** (`agumon_ds_south.png`, referência oficial em uso no jogo hoje): o DS tem só 20×27px de conteúdo — abaixo até da faixa Pequeno da E5, e é visivelmente menor que o Tamer atual. O novo Agumon (38px) resolve exatamente o problema que `ESCALA_E5_POR_ESPECIE_V1.md` §0 registrou (nenhuma espécie prioritária cabe na faixa nova por fator inteiro do sprite DS) — é um redesenho, não uma reescala, como a proposta previa.
- **Veredito: candidato com ressalva.** Dentro da faixa de altura E5, fidelidade de cor/garras/postura boa, mas (1) largura bem acima do alvo do briefing — considerar no espaço de corredor — e (2) tom dos olhos mais ciano que verde puro — ambas graduadas, nenhuma bloqueante.

---

## 6. Walk do Agumon (S, E geradas; W por espelho) — **candidato com ressalva**

- **Grupo:** `d7cc85cd-a6b0-47d8-80f9-32e1d4d93eac`, modo v3 custom, 9 quadros (1 referência + 8 animados) por direção.
- **(B) Técnico:** variação de pé (south) = **0px** entre os 9 quadros (`walkstrip_fase1.py`) — tecnicamente **dentro** do critério L4 (≤1px), até mais estável que o do Tamer.
- **(A) Qualidade do ciclo — ressalva central:** a inspeção visual da tira (`walkstrip_agumon_south.png`) mostra uma silhueta quase **idêntica** entre os 9 quadros — não há alternância clara de passada nas pernas como no Tamer; o corpo parece oscilar sutilmente (boca abre num quadro) em vez de caminhar. A variação de pé = 0px, que no Tamer seria um sinal de qualidade, aqui é também um sinal de que **o ciclo de caminhada tem pouco movimento de perna visível** — o 0px não é só estabilidade, é também pouca amplitude de movimento.
- **Leitura:** isto não é um bloqueante da rubrica (não há item que exija amplitude mínima de passada em px), e o resultado está tecnicamente correto (9 quadros, direção certa, sem artefato, sem quebra de identidade) — mas como critério graduado de "animações e imersão" (critério do `COMANDO_ETAPA6_C1.md` §7, peso 15%), um ciclo de caminhada pouco perceptível pontuaria abaixo de um ciclo claro como o do Tamer.
- **Causa provável [H]:** `action_description` usada ("walking forward with a slight bouncy reptilian gait, arms swinging naturally") pode ter pesado mais em "slight" do que em uma passada ampla; o modo v3 custom (sem template, porque Agumon não é humanoide) depende inteiramente da descrição de texto, sem um esqueleto de referência como o template `walking` do Tamer.
- **Decisão tomada:** **não houve retrabalho** desta animação nesta rodada — a regra do orçamento (rev. 2) permite no máximo 1 retrabalho só para item que falhe um **bloqueante**, e este não é um bloqueante (é graduado). Registrado como achado para uma eventual 2ª rodada, não corrigido aqui.
- **Veredito: candidato com ressalva** — tecnicamente correto (quadros, direções, pivô, transparência), mas com amplitude de movimento perceptivelmente menor que a do Tamer; recomendação para uma rodada futura: tentar `action_description` mais enfática ("exaggerated reptilian strut, legs clearly lifting and pushing off the ground") ou mode="pixminimax" como próxima escalada de qualidade (`animate_character` full reference, "Quality escalation").

---

## 7. Composição visual sobre a floresta v15b — **candidato (evidência comparativa)**

Arquivos gerados (0 geração PixelLab, composição local com `compose_fase1.py`, recorte real `art/digi-forest-v15/v15b/v15b_crop_NW_1x.png`, escala 1x nearest, sem interpolação):

- `composicao_novo_tamer_agumon_floresta_v15b.png` — Tamer preset 1, Agumon novo e Tamer preset 2, no mesmo recorte de floresta (área de clareira/fogueira), pivô no pé.
- `comparacao_atual_tamerv13_agumonds_floresta_v15b.png` — Tamer v13 e Agumon DS (assets hoje em produção) na mesma área, para comparação direta.
- `composicao_comparativo_lado_a_lado.png` — os dois painéis lado a lado.

**Leitura visual (inspeção direta das imagens, não estimativa):**
- **Paleta:** os personagens novos (como os atuais) não usam a paleta do cenário nativamente — nenhuma chamada `palette` foi feita nesta rodada (D5 não decidido, `COMPARATIVO_PALETAS_FLORESTA_V1.md` ainda em aberto) — a leitura de cor dos personagens sobre o verde-teal da v15b é compatível (tons quentes de roupa/pele sobre fundo frio, sem choque), mas isto **não é uma medição de % de pixels dentro de P-i/P-ii/P-iii** — essa medição fica para uma rodada que já tenha a paleta escolhida.
- **Escala relativa:** o Tamer novo (46px) e o Agumon novo (38px) ficam visualmente mais equilibrados entre si e com a vegetação do que o par atual (Tamer v13 34px / Agumon DS 20px, Agumon claramente pequeno demais perto do Tamer) — consistente com o achado já registrado em `ESCALA_E5_POR_ESPECIE_V1.md` §0 (as alturas DS ficam abaixo de qualquer faixa nova, o DS Agumon em particular já era conhecido como "sub-E5").
- **Integração geral:** nenhum dos personagens (novo ou atual) é cortado pela moldura da composição, não há sobreposição de Y-sort incorreta nesta pose estática (ambos "plantados" sobre o chão, sem vegetação alta na frente).
- **Limitação desta composição:** é uma colagem de pé-no-pixel, não uma integração no motor real (Y-sort dinâmico, colisão, câmera do jogo) — serve como prova de legibilidade e escala relativa, não substitui um teste no motor (fora do escopo desta Fase 1, que é só PixelLab/produção).

**Veredito: candidato** como evidência comparativa de escala e integração cromática — não é, e não pretende ser, um teste de integração técnica no motor.

---

## 8. Checklist técnica binária (I-01 a I-16, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.5) — itens verificáveis nesta rodada

| Item | Verificado | Resultado |
|---|---|---|
| I-01/I-02 (transparência/halo) | Sim, `techcheck_fase1.py` | **Passa** — 0% semitransparência em todos os 3 personagens |
| Pivô no pé | Sim, visualmente via composição (§7) | **Passa** (sem evidência de flutuação na pose estática) |
| Múltiplo de 4px (restrição da ferramenta, não do motor) | Sim | **Passa** — canvas 48×48 e 40×40, ambos múltiplos de 4 |
| Variação de pé entre quadros (L4, ≤1px) | Sim, `walkstrip_fase1.py` | **Passa** — Tamer 1px, Agumon 0px |
| Demais itens I-03..I-16 (integração no motor: .tmj, encounters, HUD etc.) | **Não aplicável nesta rodada** | Fase 1 é só produção PixelLab, sem integração — ver "O que precisa do game-dev" abaixo |

---

## 9. Resumo de vereditos

| Item | Veredito |
|---|---|
| Tileset grama/água | Candidato (reaproveitado) |
| Tamer preset 1 | Candidato |
| Tamer preset 2 | Candidato |
| Walk Tamer (4 direções) | Candidato |
| Agumon E5 Médio | Candidato com ressalva (largura acima do alvo; tom dos olhos mais ciano) |
| Walk Agumon (3 direções) | Candidato com ressalva (amplitude de movimento baixa) |
| Composição visual | Candidato (evidência comparativa, não teste de motor) |

**Nenhum item foi reprovado.** Nenhum item precisou de retrabalho (nenhuma falha bloqueante ocorreu). A reserva de 3 gerações do orçamento rev. 2 não foi usada.

---

## 10. O que precisa do `game-dev` para integrar (não feito nesta rodada, fora do escopo)

1. Nenhum destes assets foi colocado no motor (`qo`) — a composição do §7 é uma colagem local, não uma integração.
2. Se algum destes assets avançar para uso real, falta: Y-sort dinâmico real, colisão (`radiusByStage`, Rota 1 de `ESCALA_E5_POR_ESPECIE_V1.md` §2), exportação `.tmj`, e decisão sobre 4 vs 8 direções em uso real (o runtime hoje só consome 4 — `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 4 — mas os personagens foram gerados com 8).
3. O sistema de camadas reais do Tamer (`ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §2–§7) **não foi testado** — os 2 presets são personagens completos, não camadas recompostas.

## 11. O que não foi feito (limitações desta entrega)

1. **Idle não foi gerado** (nem para o Tamer, nem para o Agumon) — o orçamento rev. 2 (itens 1–6) não incluía idle; só walk. Isto está de acordo com o escopo autorizado, não é uma omissão.
2. **Pivô não foi medido numericamente quadro a quadro** (só inspecionado visualmente na composição estática) — uma ferramenta de medição de deslocamento de pivô entre frames não foi construída nesta rodada.
3. **% de pixels dentro de cada paleta candidata (P-i/P-ii/P-iii) não foi medida** para os personagens novos — nenhuma geração usou `palette` (D5 ainda não decidido pelo fundador); isso fica para quando a paleta for escolhida.
4. **Nenhuma revisão independente ainda** — esta é a autoavaliação do produtor (`game-art`). A revisão do `game-qa`, em sessão separada, é obrigatória antes de qualquer homologação (AGENTS.md §6, D4).
5. O walk do Agumon tem a ressalva de amplitude de movimento (§6) não corrigida nesta rodada, por não ser bloqueante — fica registrada para decisão de prioridade numa rodada futura.
6. Betamon, Kunemon, Palmon, Kuwagamon, Greymon, MetalGreymon, WarGreymon e o elenco completo **não foram produzidos** — fora do escopo desta Fase 1 (checkpoint 1), conforme o comando ("não avançar automaticamente para o elenco completo").

## 12. Decisões que dependem do fundador

1. **Paleta de trabalho** (P-i, P-ii ou P-iii, D5) — ainda não escolhida; nenhum destes personagens foi gerado com `palette` fixa.
2. **Alvo de altura definitivo do Tamer dentro de D1** (36–50px) — os 2 presets saíram em 45–46px (perto do teto), não nos 40px do alvo-teste do briefing; se o fundador quiser mais perto de 40px, é um retrabalho dirigido (ajustar o texto da descrição ou o `size` de entrada), não uma falha de D1.
3. **Se vale investir numa 2ª rodada de walk do Agumon** com uma descrição mais enfática ou `mode="pixminimax"`, dado que não é bloqueante mas é uma ressalva de qualidade perceptível.
4. **Se o sistema de camadas reais do Tamer** (vs. presets completos, `ESPECIFICACAO_TAMER` §9) deve ser testado numa rodada futura, dado o achado confirmado aqui de que o PixelLab não produz camadas nativamente.
