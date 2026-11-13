# REVISAO_QA_PRONTIDAO_C3 — Etapa 6, Comando 3, passo 6 de 7 (revisão independente)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1–D6), `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md`. Esta revisão não reabre nenhuma decisão homologada — só verifica consistência, rastreabilidade, riscos, critérios de qualidade e prontidão para execução.
- **Método:** leitura direta dos 3 documentos de comando/decisão + dos 8 entregáveis do Comando 3; confirmação de preços do PixelLab via `search_help` (gratuito, sem geração) em `create_character`, `animate_character`, `create_character_state`, `create_topdown_tileset`; confirmação do saldo via `get_balance`. Nenhuma geração PixelLab, nenhum documento de outro autor alterado, nenhum código/mapa/sprite/Database tocado, nenhum commit, nenhum outro agente acionado.
- **Regra respeitada:** só `search_help` e `get_balance` foram chamados no PixelLab (ambos gratuitos/leitura) — proibição de geração respeitada.

---

## 0. Achado principal (resumo executivo)

**O teto de 15 gerações proposto em `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` NÃO fecha com os preços reais da ferramenta.** O item 2 da composição (`create_character_state` para a 2ª variação do Tamer) está orçado em "~2 gerações [H]", mas o preço confirmado via `search_help(tool="create_character_state")` é **10 gerações** para qualquer canvas ≤84 px — o próprio texto da ferramenta dá o exemplo exato: *"a character whose frames are 70px or smaller ALWAYS costs 10 (a 48x48 character is 10)"*. O Tamer do teste é 48×48 px (`BRIEFING_UNICO_LAB_A_B_C.md` §1.1). Recalculando com o preço correto, o subtotal passa de 11–12 para **19–20 gerações**, já acima do teto de 15 **antes** de somar a reserva de retrabalho. Detalhe completo em §1.8.

Este achado responde diretamente ao pedido do comando ("diga se o teto de 15 gerações fecha"): **não fecha, nesta composição.**

---

## 1. Tabela por entregável

### 1.1 `ADR_ETAPA6_DECISOES_FUNDADOR.md` (game-studio)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Comparação linha a linha com `COMANDO_ETAPA6_C3_CONSOLIDACAO_ABC.md` §1 e `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md`: D1–D6 condensam fielmente as palavras do fundador, sem adicionar nem omitir restrição. A tabela "Estado verificado pelo game-studio" é consistente com `INVENTARIO_ASSETS_CHATGPT.md` (pacote de 13/11, 4 folhas) e com o saldo real — confirmei de novo com `get_balance` nesta revisão: **737,95/2000**, igual ao valor registrado no ADR. |
| **Ação sugerida** | Nenhuma. Documento correto, nenhuma decisão reaberta. |

### 1.2 `COMPARATIVO_PALETAS_FLORESTA_V1.md` + `paletas/` (game-art)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Metodologia de extração declarada e reprodutível (`extract_palette.py`/`remap_palette.py`, decodificador PNG próprio); 3 paletas candidatas (P-i Endesga-32, P-ii v15b medida, P-iii harmonização) com prós/contras/risco numéricos, nenhuma fixada como final (respeita D5). As 4 pranchas citadas (`P-i_endesga32.png`, `P-ii_v15b_real.png`, `P-iii_harmonia.png`, `comparativo_lado_a_lado.png`) existem no diretório `paletas/` (confirmado por `ls`). Referências de File Island citadas com URL + data de acesso (Wikimon, 6 páginas, todas [E]); Fandom bloqueado por Cloudflare, registrado como limitação, nada citado dessa fonte sem confirmação. Nenhuma fonte inventada. |
| **Ação sugerida** | Nenhuma correção necessária. Pendências já corretamente listadas para o fundador (§9 do próprio documento): escolha de paleta, eventual reescrita da regra dura do Style Bible, medição separada de v13. |

### 1.3 `ESCALA_E5_POR_ESPECIE_V1.md` (game-design)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Raciocínio D1+D2 bem fundamentado (nenhuma espécie por fator inteiro, Gigante bem abaixo de 3×, consistente com o achado anterior de `COMPARATIVO_ESCALAS_E1_E5.md` §6.3 de que 108 px viola o corredor mínimo). Kunemon/Kuwagamon corretamente confirmados fora da Database (consistente com a tabela do ADR) e sourceados via Wikimon [E] com data. **Verifiquei, espécie por espécie, que os valores-alvo de `BRIEFING_UNICO_LAB_A_B_C.md` §1.2/§1.3 são exatamente o ponto médio das faixas propostas aqui** — Koromon (25/30 px = meio de 22–28/26–34), Agumon (36/27 = meio de 32–40/24–30), Greymon (53/45 = meio de 48–58/40–50), MetalGreymon (62/55 = meio de 56–68/48–62), WarGreymon (77/64 = meio de 70–84/56–72), Betamon/Kunemon/Palmon/Kuwagamon idem — **rastreabilidade entre os dois documentos confirmada, sem divergência**. Mapeamento de colisão (Rota 1) corretamente registrado como a única rota executável sem destravar regra congelada. |
| **Ação sugerida** | Nenhuma. Boa prática a repetir: a tabela §6/§7 já deixa claro que nenhum valor é definitivo e lista o plano de teste antes da aprovação. |

### 1.4 `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` (game-design)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Contrato tecnicamente coerente com D1 (36–50 px, personalização limitada); a separação estilo/cor (§3–§4) é a única forma viável de custo para personalização, bem justificada. **Achado-chave desta entrega (§9: "nenhum método tem camada alpha nativa") é usado corretamente por `BRIEFING_UNICO_LAB_A_B_C.md` §1.1 e por `PLANO_TESTES_JOGAVEIS_A_B_C.md` §4** ("o motor não compõe camadas em runtime, confirmado no código") — as 3 entregas concordam entre si nesse ponto central, sem contradição. 4 direções MVP corretamente justificado pelo código real (`DIRS4` hardcoded). |
| **Ação sugerida** | Nenhuma. Pendências corretamente deixadas ao fundador (§10): presets completos vs. camadas reais; isso já é refletido de forma consistente no `BRIEFING` e no `ORCAMENTO` (ambos tratam a 2ª variação do Tamer como preset completo, não camada). |

### 1.5 `BRIEFING_UNICO_LAB_A_B_C.md` (game-art)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme com ressalva** |
| **Evidência** | Elenco e mapa bem especificados, com rastreabilidade ADR-015 (categorias 1–4) aplicada ao elenco. Faixas de porte confirmadas como pontos médios da `ESCALA_E5_POR_ESPECIE_V1.md` (§1.3 acima). Ordem de execução (A após ZIP, B após orçamento, C após A+B) repetida corretamente do adendo, não decidida por este documento. Preços do Método B (§6.2) **conferem** com `search_help` nesta revisão: `create_character` v3 2 gens (16–90px) ✓, `create_character` pro 10 gens (≤85px)/15 gens (86–113px) ✓, `animate_character` template 1 gen/direção (≤92px) ✓, **`create_character_state` 10 gens ≤84px — o próprio briefing já cita corretamente este valor** (§6.2: "10 gens ≤84 px, cobre todas as rotações numa só cobrança, mas não herda animação"), `create_topdown_tileset` standard 1 geração ✓. **Ressalva encontrada:** na tabela de custo de animação dos 5 prioritários (§6.2), MetalGreymon é agrupado em "canvas ≤64 px: 1 gen/dir", mas o canvas sugerido do próprio MetalGreymon em §1.2 é **72×68 px** — fora da faixa que o documento usa para justificar 1 gen/direção. Isso é uma inconsistência interna pequena (a estimativa de ~36 gerações para animação dos 5 prioritários pode estar subestimada em alguns gens para o MetalGreymon), não um erro que vença a reserva, mas deve ser corrigido antes de qualquer execução real. |
| **Ação sugerida** | Corrigir a classificação de banda de custo de animação do MetalGreymon em §6.2 (canvas 72×68 px não é "≤64 px"); recalcular a estimativa de ~36 gerações do bloco de animação considerando esse ajuste antes de usar este número em qualquer novo orçamento. |

### 1.6 `INVENTARIO_ASSETS_METODO_A_V1.md` (game-art)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Nenhum item do ZIP consolidado é presumido — as 15 categorias declaradas pelo adendo estão todas marcadas "PENDENTE — não recebido", consistente com a verificação de `ADR_ETAPA6_DECISOES_FUNDADOR.md` ("não chegaram referências de mapa, pranchas de bioma nem animações"). Reporta de novo, corretamente, o erro aritmético do Gabumon (ver §3 abaixo) sem corrigi-lo (regra de revisão respeitada). Checklist de recepção (§3) é reaproveitável e consistente com `INVENTARIO_ASSETS_CHATGPT.md` §3. |
| **Ação sugerida** | Nenhuma correção de conteúdo. Esclarecer com o fundador, como o próprio documento já pede (§4.1), se "referências anteriores" do ZIP novo são as mesmas 3 folhas já recebidas ou substitutas. |

### 1.7 `PLANO_TESTES_JOGAVEIS_A_B_C.md` (game-dev)

| Critério | Resultado |
|---|---|
| **Veredito** | **Conforme** |
| **Evidência** | Evidência de código com caminho:linha (`creatures.ts:127-150`, `tamer-presets.ts:9`, `view.ts:59-62`, `species.ts:45,60`, `world-species.json:3`, `save.ts:12`) — consistente com os achados já registrados em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6, sem contradição. Recomendação (b) "3 builds estáticos separados" bem fundamentada (menor risco ao jogo principal, proteção de save por origem). Critério operacional de "versão jogável" (§6.6, 6 itens) torna concreta a exigência do adendo §4 ("imagem estática não conta") — boa prática, evita ambiguidade na homologação futura. Roteiro de teste (§6) usa exatamente os POIs e zonas do `BRIEFING_UNICO_LAB_A_B_C.md` §2.1 — cobertura confirmada. 8 riscos listados, com mitigação, incluindo o risco (corretamente resolvido, não um problema novo) de paralelismo entre os 3 builds vs. a regra "um agente/uma tarefa por vez" — o próprio documento mostra que a ordem de execução do ADENDO já evita esse conflito. |
| **Ação sugerida** | Nenhuma. O item "FPS nunca medido em lugar nenhum do projeto" é corretamente registrado como lacuna a resolver antes do 1º link (não é uma falha deste documento, é um achado honesto). |

### 1.8 `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` (game-studio)

| Critério | Resultado |
|---|---|
| **Veredito** | **Não conforme** |
| **Evidência** | Dois problemas confirmados nesta revisão, usando `search_help` (gratuito) nos 4 tools pedidos pelo comando: |

**(a) Preço do item 2 incorreto — quebra o teto de 15.**

| Item do orçamento | Preço no documento | Preço confirmado via `search_help` | Delta |
|---|---|---|---|
| 1. Tamer base, `create_character` v3, texto, ~48–52 px | 2 | **2** — banda 16–90 px = 2 gens. Confere. | 0 |
| 2. Tamer variação, `create_character_state` | ~2 [H, "preço não confirmado"] | **10** — "ONE charge... 10, 15 or 25 generations... that cell costs 10 up to 84px... a character whose frames are 70px or smaller ALWAYS costs 10 (a 48x48 character is 10)". Canvas do Tamer = 48×48 px (`BRIEFING` §1.1). | **+8** |
| 3. Agumon, `create_character` v3+referência | 1–2 | Plausível em preço (`ceil(w*h*8/65536)` do tamanho da referência, mín. 1) — mas ver (b) abaixo | ~0 (preço), risco de escopo |
| 4. Walk do Tamer (3 direções) | 3 | Plausível (template 1 gen/direção ≤92 px, ou v3 1 gen/direção a 64 px) | 0 |
| 5. Walk do Agumon (2 direções) | 2 | Plausível, mesma lógica | 0 |
| 6. Terreno, `create_topdown_tileset` standard | 1 | **1** — "standard is 1 generation". Confere. | 0 |

**Subtotal recalculado com o preço correto do item 2:** 2 + 10 + 1 + 3 + 2 + 1 = **19 gerações** (usando o piso da faixa do item 3), já **acima do teto de 15 solicitado — antes de qualquer reserva de retrabalho.** O documento erra justamente no único item que marcou como não confirmado ("a confirmar no `search_help` antes de executar") — a confirmação pedida por ele mesmo não foi feita antes de publicar o número.

**Nota de rastreabilidade:** o preço correto (10 gens) **já estava citado corretamente** em `BRIEFING_UNICO_LAB_A_B_C.md` §6.2 ("`create_character_state` (10 gens ≤84 px...)"), passo anterior do mesmo Comando 3. O `ORCAMENTO` (passo 7, autor diferente) não reaproveitou esse número já verificado pelo `game-art` — é uma quebra de consistência entre dois entregáveis do mesmo comando, não apenas um erro isolado.

**(b) Escolha de ferramenta para o item 3 não testa o que a rodada diz testar.**

O `ORCAMENTO` troca o Koromon (proposta original do `game-art` em `BRIEFING` §6.2.2) pelo Agumon, usando `create_character(mode="v3", reference_image_url=<rip DS>)`. Mas o próprio `BRIEFING_UNICO_LAB_A_B_C.md` §6.2 já havia identificado: **"v3+referência NÃO permite mudar o tamanho de saída, Pro sim"** — e a documentação da ferramenta, confirmada agora via `search_help`, diz o mesmo: *"with a v3 reference image, omitted size uses the reference dimensions and a supplied size is advisory"* (ou seja, passar `size` não garante o tamanho pedido quando há referência em modo v3). O proxy DWDS do Agumon já documentado é de **26–27 px** (`ESCALA_E5_POR_ESPECIE_V1.md` §0/§1), abaixo da faixa-alvo Médio da E5 (32–40 px) que o laboratório propõe testar. **Risco concreto:** gerar o Agumon por `v3+referência` tende a reproduzir o tamanho antigo do rip DS (26–27 px), não a nova faixa E5 — o que não testaria a pergunta 1 do próprio orçamento ("o PixelLab produz... um Digimon do elenco prioritário [na nova escala]?"). Testar a escala nova exigiria `mode="pro"` (que de fato permite redimensionar, confirmado no `BRIEFING` §6.2 e no texto da ferramenta), ao custo de 10 gerações — o mesmo custo que o `ORCAMENTO` tentou evitar ao trocar Koromon por Agumon.

| Ação sugerida | Recalcular o orçamento com os preços corretos antes de pedir autorização ao fundador. Duas saídas possíveis, sem decidir qual o `game-studio`/fundador prefere: (1) remover o item 2 (2ª variação do Tamer) desta rodada — subtotal cai para 2+1+3+2+1 = 9, cabendo nos 15 com reserva de 3–4; ou (2) manter o item 2 e pedir um teto maior ao fundador, deixando explícito que 19–20 gerações é o custo real, não 11–12. Para o item 3, decidir explicitamente se a rodada aceita testar o Agumon no tamanho antigo do DS (mais barato, mas não valida D2/E5) ou usa `mode="pro"` (10 gens, valida a escala nova) — e corrigir o texto da Pergunta 1 do orçamento conforme a escolha. |

---

## 2. Lista consolidada de não conformidades

| # | Não conformidade | Documento | Severidade | Status |
|---|---|---|---|---|
| NC-1 | Preço do item 2 (`create_character_state`) orçado em ~2 gerações, correto é 10 — o subtotal recalculado (19–20) excede o teto de 15 solicitado, antes de qualquer reserva | `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` | **Alta** — invalida a Solicitação 2 do portão obrigatório tal como está redigida | Não corrigida nesta revisão (regra: não reescrever documento de outro autor) |
| NC-2 | Item 3 do orçamento (Agumon via `create_character` v3+referência) provavelmente não atinge a faixa-alvo E5 Médio (32–40 px), porque `size` é só indicativo com referência em modo v3 — risco de a rodada não testar o que diz testar | `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` | **Média** — não quebra o teto de gerações, mas compromete o objetivo declarado da rodada (pergunta 1) | Não corrigida |
| NC-3 | MetalGreymon (canvas 72×68 px) classificado na banda de custo "≤64 px: 1 gen/dir" da estimativa de animação; o próprio documento define seu canvas como 72×68 px, fora dessa banda | `BRIEFING_UNICO_LAB_A_B_C.md` §6.2 | **Baixa** — estimativa [H], não bloqueia nenhuma decisão imediata, mas deve ser corrigida antes de reuso em orçamento futuro | Não corrigida |
| NC-4 (pendência antiga, reconfirmada) | Ficha F0-004 (Gabumon) em `RELATORIO_AVALIACAO_ASSETS_FASE0.md`: "Nota A final" publicada como **4,0**; pela própria fórmula do autor (3×0,583 + 6×0,25 + 6×0,167) o valor correto é **4,25** (idêntico ao cálculo do Agumon, mesmos 3 componentes). Identificada pela 1ª vez pelo `game-qa` no Comando 2, passo 4 (registrada em `AJUSTES_RUBRICA_VISUAL_V1.md` §6.7) e repetida pelo `game-art` no Comando 3, passo 4 (`INVENTARIO_ASSETS_METODO_A_V1.md` §1) — **ainda não corrigida no documento-fonte**, duas rodadas depois de identificada. | `RELATORIO_AVALIACAO_ASSETS_FASE0.md` (ficha F0-004) | **Baixa** (não muda veredito nem nota ponderada de nenhum critério; é só a cifra de referência) mas **crônica** — já atravessou 2 handoffs sem correção | Não corrigida (confirmado nesta 3ª verificação) |

---

## 3. Checklist de prontidão

| Item | Status | Nota |
|---|---|---|
| ADR de decisões (D1–D6) registrado e consistente com o comando/adendo | **Pronto** | §1.1 |
| Contrato técnico do Tamer personalizável (`ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md`) | **Pronto** | §1.4 |
| Faixas de porte por espécie (`ESCALA_E5_POR_ESPECIE_V1.md`) | **Pronto** como proposta de teste | Valores não são definitivos por desenho (D2); §1.3 |
| Briefing único A/B/C + especificações de produção | **Pronto, com 1 correção pendente (NC-3)** | §1.5 |
| Inventário do Método A | **Depende do ZIP** — nenhum item do pacote novo foi recebido; o Método A não pode começar | §1.6 |
| 3 paletas candidatas para a floresta-piloto | **Pronto**; escolha final **depende de decisão do fundador** (D5) | §1.2 |
| Plano de isolamento técnico (3 builds) | **Pronto como plano**; a implementação (M2 + M1-lite + build isolado, ~2–3 dias) **depende de autorização de execução do fundador** (não é geração PixelLab, é trabalho de código) | §1.7 |
| Orçamento PixelLab (Método B) | **Não pronto para apresentar ao fundador como está** — preço incorreto (NC-1), escopo de teste comprometido (NC-2); precisa de recálculo antes da Solicitação 2 do portão | §1.8 |
| Autorização de consumo de créditos PixelLab (Método B) | **Depende de autorização de crédito do fundador** — e essa autorização não deveria ser pedida com os números atuais do orçamento (NC-1) | §1.8 |
| Recepção do ZIP consolidado do ChatGPT (Método A) | **Depende do ZIP** — portão obrigatório ainda não cumprido (Solicitação 1 do adendo §7) | §1.6 |
| Hospedagem dos 3 links | **Depende de decisão do fundador** — 4 opções levantadas pelo `game-dev` (local/portal, homologação protegida, prévia pública, cada uma com risco de PI diferente), nenhuma escolhida | `PLANO_TESTES_JOGAVEIS_A_B_C.md` §3 |
| Rota de colisão (Rota 1 vs. Rota 2) | **Depende de decisão do fundador** — Rota 1 é a única executável sem destravar regra congelada; Rota 2 é pendência registrada, não assumida | §1.3 |
| MVP de personalização do Tamer (presets completos vs. camadas reais) | **Depende de decisão do fundador** — nenhum dos 3 métodos entrega camadas nativas; a escolha decide o escopo real de produção | §1.4 |
| Correção do erro aritmético do Gabumon (NC-4) | **Depende de ação do `game-studio`/`game-art`** (não de crédito nem do fundador) — é correção de texto, não decisão | §2 |

---

## 4. O que esta revisão NÃO fez

- Não gerou nenhum conteúdo no PixelLab — só `search_help` (4 chamadas, gratuitas) e `get_balance` (1 chamada, gratuita).
- Não alterou nenhum documento de outro autor — os erros encontrados (NC-1 a NC-4) são reportados aqui, não corrigidos nos arquivos originais.
- Não alterou código, Database, mapa ou sprites.
- Não fez commit, push ou deploy.
- Não acionou nenhum outro agente.
- Não reabriu nenhuma decisão homologada (D1–D6, 17 bloqueantes, nota mínima 8/10, regra de registro separado de custo).

---

## 5. Resumo para o game-studio (passo 7)

**7 de 8 entregáveis estão conformes ou conformes com ressalva menor.** O ponto que bloqueia a apresentação ao fundador, como pedido pelo portão obrigatório (ADENDO §7), é o **orçamento PixelLab**: ele precisa ser recalculado antes da Solicitação 2, porque (a) o subtotal real é 19–20 gerações, não 11–12, excedendo por si só o teto de 15 proposto, e (b) a escolha de ferramenta para o Agumon (item 3) corre o risco de não testar a escala E5 que é o próprio objetivo da rodada. Recomendo que o `game-studio` decida entre remover o item 2 (variação de preset) desta rodada mínima — o que fecha dentro de 15 — ou levar ao fundador um teto revisado com os números corretos, deixando claro que o custo real é maior que o inicialmente estimado. A pendência crônica do Gabumon (NC-4) também deveria ser corrigida nesta rodada de consolidação, já que atravessou dois handoffs sem ajuste.
