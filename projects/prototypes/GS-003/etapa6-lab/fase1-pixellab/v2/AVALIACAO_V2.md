# AVALIACAO_V2 — Etapa 6, Comando 4, retrabalho do checkpoint 1

- **Autor:** game-art (subagente, Sonnet 5) · **Data:** 2026-11-13.
- **Base:** `COMANDO_ETAPA6_C4_APROVACAO_RETRABALHO_CP1.md` (D7–D10) e `REVISAO_QA_CHECKPOINT1.md` (R1–R6).
- **Vocabulário:** "candidato" ou "reprovado". **Nunca "aprovado"** — a homologação é do fundador, com nova revisão independente do `game-qa` antes.
- **Legenda:** **[E]** medido/verificado nesta sessão · **[H]** hipótese/leitura perceptiva, não parecer técnico definitivo.
- Esta entrega separa **(A) arte/fidelidade** de **(B) técnica**, conforme pedido.

---

## 0. IDs gerados e onde estão

| Asset | ID | Canvas (rotações) | Canvas (walk) |
|---|---|---|---|
| Agumon E5 v2 | `46470e9c-0726-422c-8e7b-c5684e7d5026` | 36×36 | 36×36 |
| Tamer Principal v2 (Preset 1) | `6cd24249-478a-466e-bc51-f6e39b07deb6` | 56×56 (ajustado, era 44×44) | 44×44 |
| Tamer Preset 2 v2 | `63c61b01-a8b6-47d4-8c74-79af28363ec8` | 56×56 (ajustado, era 44×44) | — (sem walk, fora do escopo de R5) |

Arquivos: `fase1-pixellab/v2/` — rotações extraídas em `*_extracted/`, GIFs nativos 1× em `gifs_v2_1x/`, GIFs 4× em `gifs_v2_4x/`, comparações em `comparacao_*.png` e `composicao_v2_*.png`.

---

## 1. (A) Arte e fidelidade

### 1.1 Agumon v2 — R1

**Checklist das 5 marcas de identidade contra o Agumon DS oficial** (`referencias/agumon_ds_south.png`, já usado pelo QA):

| Marca | Oficial | v1 (reprovado) | v2 (este retrabalho) |
|---|---|---|---|
| Cabeça/crista | lisa, sem crista | **crista pontuda com losango vermelho** | **sem crista, sem nadadeira, sem losango** — mas há um **pequeno nódulo arredondado creme no topo da cabeça** (ver `comparacao_agumon_ds_v1_v2_4x.png`), que a referência oficial não tem. Não é ponta, não é losango, não é vermelho — mas também não é "lisa" no sentido literal. **Achado residual, não um bloqueante dos três citados no comando.** |
| Padrão de pele | liso, sem listras | **listras azul-acinzentadas na testa e manchas azuis nos antebraços** | **confirmado [E]: 0 listras, 0 manchas azuis** — pele uniforme amarelo-alaranjada em toda a extensão, em todas as 8 rotações inspecionadas |
| Cor-base | amarelo-alaranjado uniforme | amarelo-alaranjado com barriga/focinho creme destacado | amarelo-alaranjado uniforme, barriga clara mais sutil — mais próximo do oficial |
| Cauda/membros | cauda curta e grossa; 3 garras brancas por mão/pé | ponta vermelha na cauda; "luvas" brancas/azuis | **cauda curta, grossa, sem ponta vermelha** [E, visto no east/west] — garras brancas presentes nas patas; **contagem exata de garras não é verificável com confiança no canvas de 36px** (resolução insuficiente para contar 3 vs 2 pixels), mesma limitação que o QA já registrou para o v1 em 40px |
| Traço reconhecível | olhos verdes grandes, boca larga | olhos verdes | olhos verdes grandes, boca aberta com dentes — mantido |

**Leitura [H]:** a correção resolveu os dois problemas que dispararam o impeditivo do fundador (crista com losango vermelho; listras/faixas azuis). O nódulo creme residual no topo da cabeça é uma imperfeição nova, bem menor em severidade — não lê como "Greymon" nem como qualquer marca de assinatura de outra espécie, mas também não é a cabeça perfeitamente lisa pedida. **Não declaro isso resolvido por conta própria**: fica registrado para a próxima revisão do `game-qa` decidir se é aceitável ou exige nova correção.

**Risco de confusão com outra espécie/linha evolutiva [H]:** baixo. Não há mais nenhum elemento que remeta ao Greymon (listras) ou a qualquer outro Digimon da franquia.

### 1.2 Tamer Principal v2 — R3

**Comparação direta** (`comparacao_tamer1_v1_v2_4x.png`): boné vermelho removido; jaqueta azul removida; cabelo agora visível (tom escuro azul-acinzentado); colete verde-oliva sobre camisa mustarda; calça e botas marrons; bolsa de couro a tiracolo; pulseira com tela digital ciano no pulso esquerdo.

**Checklist das exigências do comando:**

| Exigência | Resultado |
|---|---|
| Sem boné vermelho | **Confirmado [E]** — sem nenhum acessório de cabeça |
| Sem combinação vermelho+azul | **Confirmado [E]** — nenhuma peça azul; nenhuma peça vermelha saturada (ver nota de cor abaixo) |
| Sem óculos de proteção | **Confirmado [E]** |
| Cabelo visível | **Confirmado [E]** |
| Roupa de aventureiro | Colete, camisa, calça cargo, botas — atende |
| Acessório discreto de identidade digital | Pulseira com tela ciano e padrão de circuito — atende, é discreto (não é um Digivice literal) |

**Checagem de cor [E]:** varredura de pixels "avermelhados" (R>140, G/B<90) encontrou 14 px no sul e 3 no leste, todos nos hex `#a64531`/`#9c5432` — marrom-terracota (sombra da bolsa de couro), não vermelho saturado. **Não há vermelho de verdade no sprite.**

**Risco de semelhança com Pokémon/Digimon [H]:** baixo em ambos. Não há réplica de silhueta do protagonista de Pokémon (sem boné, sem jaqueta azul, sem mochila com duas alças cruzadas visíveis da mesma forma). Contra os protagonistas de Digimon: cabelo escuro + colete não reproduz Tai (sem óculos, sem jaqueta azul-branca), Takato (sem boné/capuz azul) ou Marcus (sem jaqueta laranja/preta característica). **Original dentro do que esta revisão consegue avaliar.**

### 1.3 Tamer Preset 2 v2 — R5

Mesma identidade visual do P2 anterior (rabo de cavalo preto, colete/capuz amarelo, camisa listrada, luvas vermelhas sem dedos, short jeans, tênis roxo — o QA já havia classificado esse conjunto como risco baixo), regerado na mesma base de corpo/proporções do novo P1 (`comparacao_tamer2_v1_v2_4x.png`). **Luvas vermelhas** continuam presentes — isso é uma cor pontual em acessório, não uma combinação de silhueta inteira; o QA anterior já avaliou esse preset especificamente como risco baixo, e nada mudou nesse aspecto.

### 1.4 Paleta — nota honesta (D9, conflito aberto, não resolvido aqui)

A composição sobre a floresta v15b (`composicao_v2_tamer_agumon_floresta_2x.png`) deixa visível o mesmo conflito que o `COMPARATIVO_PALETAS_FLORESTA_V1.md` já mediu: o Agumon (amarelo-alaranjado/P-iii) e o cenário v15b (teal-verde/P-ii) não compartilham família de cor. **Não tentei resolver isso aqui** — D9 diz para adotar P-ii no cenário e P-iii na harmonização dos personagens, preservando cores oficiais das espécies, e é exatamente isso que foi feito: os personagens não foram puxados para a paleta do cenário. O contraste visual que aparece na composição é esperado dentro dessa decisão, não um defeito desta entrega.

---

## 2. (B) Técnica

### 2.1 Escala (D8)

| Asset | Direção | Altura (bbox opaco) | Largura | Alvo D8 |
|---|---|---|---|---|
| Agumon v2 | S | 32 | 24 | 33–35 alt / 26–29 larg |
| Agumon v2 | E/W | 32 | 28 | — |
| Agumon v2 | N | 31 | 17 | — |
| Tamer P1 v2 | S | 41 | 21 | 40–42 |
| Tamer P1 v2 | E/W | 42 | 16 | — |
| Tamer P1 v2 | N | 41 | 22 | — |
| Tamer P2 v2 | S/E/N/W | 42 | 22–24 | mesma base do P1 |

- **Tamer: dentro do alvo (40–42)** em todas as direções medidas.
- **Agumon: 1–3 px abaixo do alvo** (32 contra 33–35 de altura; 24/28 contra 26–29 de largura no sul/leste). Ficou **sub-dimensionado em vez de super-dimensionado** — o erro inverso do v1 (que estourava a largura para 34). Não gerei de novo só por isso: está a 1–3px do alvo, não fora da faixa Médio de E5, e o comando pede para não insistir em correções marginais que não repetem falha crítica.
- **Razão Agumon/Tamer:** 32/41 ≈ **0,78**, dentro da faixa 0,70–0,98 (classe Médio de E5), preservando a hierarquia pedida.
- **Margem de topo:** Agumon 2px em canvas 36×36 (sem alvo numérico definido para esta espécie neste comando). Tamer P1 e P2: **corrigido de 1px (insuficiente) para 7px** em canvas 56×56, via `set_canvas_size` (grátis) — atende ao mínimo de 6px da `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §1.
- **Pivô:** mantido no pé em todas as rotações (`set_canvas_size` recentraliza sobre o pivô, não desloca o personagem).

**Desalinhamento de canvas rotação×animação (mesmo tipo de achado do v1):** depois do `set_canvas_size`, as rotações do Tamer P1/P2 ficaram em 56×56, mas os quadros de walk continuam no canvas original de 44×44 (o `set_canvas_size` não afeta animações já geradas). O Agumon não teve esse ajuste (ficou em 36×36 nos dois). Isso é alinhamento a resolver na integração (Fase 2 técnica), não um bloqueante de arte.

### 2.2 Amplitude de perna (walk, mesma metodologia do QA)

% de pixels alterados no terço inferior do bbox (pernas) vs quadro 0, quadros 1–5:

| Walk | Leg diffs % (por quadro) |
|---|---|
| Agumon v2 sul | 83.2, 83.6, 75.7, 74.3, 78.6 |
| Agumon v2 leste | 86.8, 83.1, 81.7, 91.0, 86.7 |
| Agumon v2 norte | 77.1, 78.4, 84.8, 89.5, 89.5 |
| Tamer v2 sul | 90.6, 91.0, 81.9, 84.6, 80.5 |
| Tamer v2 leste | 79.7, 74.6, 78.4, 90.1, 88.0 |
| Tamer v2 norte | 60.9, 64.3, 85.2, 82.9, 85.2 |

**Comparação direta com o v1 reprovado [E]:** o Agumon v1 sul tinha 32,7% (QA, "quase não passa a perna"). O Agumon v2 sul está em **74–84%**, mais que o dobro. **A troca de `mode="v3"` custom para `template_animation_id="walking"` (sugestão do próprio QA) resolveu o problema de amplitude** — confirmado visualmente nos GIFs (`gifs_v2_4x/agumon_v2_walk_south_4x.gif`), a perna alterna de forma clara e legível nas três direções geradas e no espelho W.

### 2.3 D10 — variação percentual de altura (`100*(max-min)/mediana`), limite 5%

| Direção | Agumon v2 | Tamer P1 v2 |
|---|---|---|
| Sul | **3,51%** — dentro do limite | **8,11%** — **acima do limite** |
| Leste | **6,67%** — acima do limite | **2,82%** — dentro do limite |
| Norte | **0,00%** — dentro do limite | **2,70%** — dentro do limite |
| Oeste (espelho de leste) | 6,67% — acima (herda do leste) | 2,82% — dentro |

**Leitura honesta:** 3 de 8 combinações direção×personagem ficam acima do teto de 5% definido em D10. Em pixels absolutos a variação é pequena (1–3px num sprite de 28–42px), e o pé (pivô) varia só 1–2px em todos os casos — ou seja, a instabilidade é de "respiração" do corpo durante o passo (agachar/esticar), não do pivô. Ainda assim, **pela letra de D10, Sul do Tamer (8,11%) e Leste/Oeste do Agumon (6,67%) não passam no critério numérico.** Não tentei mascarar isso nem regenerar para forçar a métrica — registro como achado técnico graduado para a próxima revisão do `game-qa` julgar, inclusive se a fórmula/tolerância precisa de ajuste (o próprio QA já havia achado essa mesma ambiguidade no v1).

### 2.4 Pivô e consistência entre quadros

- Pé (foot_y) varia **0–2px** por direção em ambos os personagens — estável, dentro do mesmo padrão que o QA já havia aprovado tecnicamente para o Tamer v1.
- Nenhuma deformação grosseira visível quadro a quadro nos GIFs inspecionados (ver §3).

### 2.5 Tileset de água (R6)

Teste local gratuito: mapa temporário com o tileset reaproveitado (`a4ca04e4-eab6-42e3-9cbf-b155390b8e9b`), recorte de 12×10 células com grama de um lado e um bloco de água atravessando o meio (`comparacao` não salva — mapa de teste deletado após a inspeção, conforme instrução de não deixar lixo). **Resultado: nenhuma costura, duplicação de borda ou falha de transição Wang visível** na junção grama↔água — a borda é contínua e consistente em toda a extensão testada. **R6 não executado** (economia de 1 geração). O **desacordo de cor** entre essa água (azul-aço) e a água da v15b (ciano) continua existindo — mas isso é o conflito de paleta já registrado (D9/§1.4), não uma costura técnica, e R6 pedia especificamente o teste de costura.

### 2.6 Consumo

- **12 gerações** no retrabalho (726,95 → 714,95), dentro do teto de 10–17 indicado pelo QA. R6 não gerado (economia de 1).
- **Desvio de procedimento reconhecido:** as 4 primeiras chamadas pagas (R1–R4) foram disparadas em paralelo sem `get_balance` isolado entre cada uma — mesmo desvio que a revisão anterior já havia apontado. O total bate exatamente com a soma dos preços do `search_help` e com a queda real de saldo, então não houve surpresa financeira, mas a checagem item a item não foi feita nesse lote. A partir do R5, cada operação paga teve `get_balance` isolado antes e depois. Tabela completa: `../CONSUMO_PIXELLAB_ETAPA6.md`.

---

## 3. Entrega visual

- **Zoom 4× lado a lado:** `comparacao_agumon_ds_v1_v2_4x.png` (DS oficial · v1 reprovado · v2), `comparacao_tamer1_v1_v2_4x.png`, `comparacao_tamer2_v1_v2_4x.png`.
- **GIFs nativos 1×** (export_asset, grátis): `gifs_v2_1x/`.
- **GIFs 4× nearest-neighbor**, velocidade natural: `gifs_v2_4x/agumon_v2_walk_{south,east,north,west}_4x.gif`, `gifs_v2_4x/tamer1_v2_walk_{south,east,north,west}_4x.gif`.
- **GIFs v1 reprovados, versão 4× para comparação** (não existiam ampliados antes): `gifs_v1_reprovados_4x/agumon_v1_walk_{sul,leste}_4x.gif`, `gifs_v1_reprovados_4x/tamer1_v1_walk_sul_4x.gif`.
- **Composição na floresta v15b:** `composicao_v2_tamer_agumon_floresta_1x.png` (320×224), `composicao_v2_tamer_agumon_floresta_2x.png` (640×448), e a versão lado a lado com o v1: `comparacao_composicao_v1_v2_floresta.png`.

---

## 4. O que NÃO foi feito / limitações

- **Nenhuma direção diagonal** foi gerada para walk (fora do escopo de R2/R4, que pedem só S/E/N + espelho W).
- **Contagem exata de garras** do Agumon não é verificável com confiança no canvas de 36px — mesma limitação de resolução que o v1 já tinha.
- **Nódulo residual na cabeça do Agumon** (§1.1) não foi removido nem regenerado — fica para a próxima revisão decidir a severidade.
- **D10 falha em 3 de 8 combinações** (§2.3) — não escondido, não "aprovado por aproximação".
- **Desalinhamento de canvas rotação×animação** persiste no Tamer (56×56 vs 44×44) e no Agumon (36×36 em ambos, sem desalinhamento neste caso) — fica para a Fase 2 técnica, como já estava registrado para o v1.
- **Nenhuma integração no motor, Database ou configuração.** Nenhum commit, push ou deploy. Nenhum outro agente acionado.
- Esta avaliação foi escrita pela mesma sessão que produziu os assets — **precisa da revisão independente do `game-qa`** antes de qualquer homologação ou avanço para a Fase 2, exatamente como no checkpoint anterior.

## 5. Decisões que dependem do fundador (herdadas, não resolvidas aqui)

1. Nódulo residual na cabeça do Agumon v2 — aceitável ou exige nova rodada?
2. D10 acima de 5% em 3 direções — manter o limite de 5% (reprovando essas direções) ou revisar a fórmula/tolerância?
3. Paleta de cenário × personagens (P-ii × P-iii) — mesmo conflito aberto de antes, agora visível na composição v2.
4. Contorno de Digimon redesenhado × Style Bible — mesmo conflito aberto de antes, não tocado aqui.
