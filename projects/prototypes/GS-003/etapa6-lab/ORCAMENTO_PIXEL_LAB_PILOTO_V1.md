# Digital Odyssey — Etapa 6: orçamento da 1ª rodada experimental do PixelLab (Método B)

- **Data:** 13/11/2026 · **Autor:** game-studio · **Status:** **PROPOSTA. Nenhum crédito foi consumido.** Este documento serve à Solicitação 2 do portão obrigatório (adendo ao C3, §7).
- **Saldo real:** **737,95** de 2.000 gerações, consultado com `get_balance` em 13/11. Renova em 11/12/2026.
- **Preços:** consultados em `search_help` (gratuito) em 13/11 [E]. O game-art estimou pelos mesmos preços (`BRIEFING_UNICO_LAB_A_B_C.md` §6).

## 1. Objetivo da rodada (≤ 15 gerações)
Responder, antes de qualquer pacote maior, a três perguntas:
1. O PixelLab produz o **Tamer novo** (36–50 px, D1) e **um Digimon do elenco prioritário** com nota ≥ 8 na rubrica homologada?
2. O PixelLab produz walk com quadros consistentes (limiar L4)?
3. O resultado tem o mínimo para montar o **Link B jogável**, isto é, Tamer andando, um Digimon e o recorte da floresta?

## 2. Composição proposta (rev. 2)
**Correções em relação à rev. 1, ambas apontadas pelo game-qa:**
- **Item 2:** `create_character_state` custa **10 gerações** para o Tamer de 48 px, não "~2" [E, `search_help`, conferido pelo QA]. Com esse preço a rodada estourava, com subtotal de 19–20. **Correção:** o preset 2 passa a ser **um segundo Tamer v3 a partir de texto** (2 gerações), com a mesma base de corpo e roupa/cabelo diferentes. A consistência entre os presets é avaliada pela rubrica. Se não for suficiente, isso vira um achado da rodada.
- **Item 3:** no v3 + referência, o tamanho de saída é o da referência, e `size` é só indicativo. O rip DS do Agumon tem ~26 px de conteúdo, abaixo da faixa E5 Médio (30–42). **Correção:** gerar o Agumon com **v3 a partir de texto** (bípede, que o v3 suporta), em quadro de 48 px, por 2 gerações. A referência DS e a folha F0-003 entram só como guia na descrição e na avaliação de fidelidade.

| # | Item | Ferramenta / parâmetros | Gerações | Entrega |
|---|---|---|---|---|
| 1 | Tamer base, preset 1, 8 direções | `create_character` v3 a partir de texto, quadro de 48–52 px, conteúdo de 36–50 px (D1) | **2** [E: v3 de 16–90 px = 2] | Rotações |
| 2 | Tamer, preset 2 (cabelo e roupa diferentes) | `create_character` v3 a partir de texto, mesma descrição de corpo | **2** [E] | Prova de personalização por preset |
| 3 | Agumon, 8 direções | `create_character` v3 a partir de texto, quadro de 48 px, conteúdo de 30–42 px (E5 Médio) | **2** [E] | Rotações |
| 4 | Walk do Tamer preset 1: S, E, N (W por espelho, gratuito) | `animate_character` v3, 8 quadros | **3** [E: ceil(w·h·quadros/65536) = 1 por direção até 64 px] | Walk em 4 direções |
| 5 | Walk do Agumon: S, E (W por espelho) | `animate_character` v3, 8 quadros | **2** [E] | Walk de prova |
| 6 | Terreno do recorte: grama ↔ água | `create_topdown_tileset` standard, tile de 32 | **1** [E: standard = 1] | Dimensão 1 da rubrica |
| — | **Subtotal planejado** | | **12** | |
| 7 | **Reserva: 1 retrabalho** | Só para item que falhe num **bloqueante** | **3** | |
| | **TETO TOTAL SOLICITADO** | | **15** | |

Props, árvores, água animada e elementos digitais do recorte saem dos **assets do PixelLab que o estúdio já tem** (v15/v15b). Isso custa 0 gerações e já é material do Método B.

## 3. Critérios de qualidade e de parada
- **Antes e depois de cada job**, rodar `get_balance` e registrar no log.
- **Parada dura:** consumo acumulado ≥ 15 → parar e pedir nova autorização. Nunca ultrapassar o teto.
- **Por item**, no máximo 1 retrabalho, pago pela reserva. Se o item falhar duas vezes num bloqueante, ele é dado como reprovado e a rodada continua sem ele, com o registro da falha.
- **Tamer:** se o item 1 falhar duas vezes (proporção fora de 36–50 px, anatomia ou grade), os itens 2 e 4 **não** são executados. As gerações economizadas não são gastas.
- **Fora do teto:** se o resultado pedir `create_character_state` (10 gerações) para obter presets realmente consistentes, isso **não** é feito nesta rodada. Vira pedido separado.
- **Avaliação:** a rubrica homologada (rev. 2 + AJUSTES, D4) é aplicada **pelo game-art e revisada pelo game-qa** antes de qualquer integração. Nota mínima 8, nenhum critério abaixo de 7, 0 bloqueantes.
- **Piso de saldo:** 200 gerações (limiar L5). Esta rodada deixa o saldo bem acima disso.
- **Ordem obrigatória:** o B só começa depois desta autorização. O A só começa depois que o ZIP consolidado for recebido e avaliado. O C só começa quando A e B tiverem resultados aproveitáveis.

## 4. Resultado esperado
- Com 15 gerações: um Tamer novo com 2 presets e walk em 4 direções, o Agumon com walk em prova e o terreno do recorte.
- Isso basta para um **Link B mínimo jogável** no recorte, desde que as mudanças de código do plano de testes sejam autorizadas (M2 + M1-lite + build isolado, ~2–3 dias, `PLANO_TESTES_JOGAVEIS_A_B_C.md`).
- **Não** basta para o elenco completo: o pacote completo do briefing está estimado em ~190–220 gerações [H] e fica para uma autorização futura, se a rodada provar valor.

## 5. Saldo previsto
| | Gerações |
|---|---|
| Saldo atual | 737,95 |
| Rodada (teto) | −15 |
| **Saldo previsto (pior caso)** | **722,95** |
| Pacote completo futuro (se autorizado) | −190 a −220 → ~503–533 |

## 6. Pergunta ao fundador
**"Fundador, autoriza o consumo de até 15 gerações PixelLab para a rodada experimental descrita?"**
