# RELATORIO_AVALIACAO_ASSETS_FASE0 — Etapa 6, Comando 2, passo 1 (game-art)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Base:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §2; `INVENTARIO_ASSETS_CHATGPT.md`; `RUBRICA_QUALIDADE_VISUAL_V1.md` (rev. 2); `ADR-015`; `DIGITAL_ODYSSEY_CONTEXT.md` v1.2.
- **Regra do fundador aplicada em todo este relatório:** (A) qualidade artística/fidelidade e (B) prontidão técnica são **sempre separadas**. Nenhum dos 4 assets é descartado por falta de transparência, spritesheet, pivô ou animação — esses pontos entram **só** em (B). O veredito nunca é "aprovado"; uso **candidato aproveitável**, **precisa de retrabalho** ou **fraco como referência** (vocabulário pedido neste comando especificamente, que substitui o "descartado" do `INVENTARIO` §3 para esta entrega).
- **Nada foi gerado.** `get_balance` antes: 737,95/2000. `get_balance` depois: 737,95/2000. **0 gerações gastas.** Único acesso ao PixelLab: `get_character` (leitura, grátis, usado só na Tarefa 2) e `get_upload_url`/upload (grátis) para inspecionar as 4 folhas em zoom. Nenhum arquivo original foi alterado (preservados em `fase0-chatgpt/extraido/`; o ZIP original em `_original/` não foi tocado).
- **Método de verificação da grade de pixel:** recorte de cada folha na posição original (sem reamostrar) ampliado por nearest-neighbor em 1× e 4×, com um script Python próprio sem dependências (`workspaces/game-art/tools/crop_zoom.py`), sem usar nenhuma ferramenta paga. Os recortes ficaram em `workspaces/game-art/tools/crops/` (fora da árvore do projeto, não comitados).
- **Achado transversal aos 4 assets, antes das fichas individuais:** ampliado a 4× nearest-neighbor, todo o conjunto mostra sombreamento em degradê redondo (gradiente suave nos músculos/corpo) e bordas com antialiasing — **nenhuma das 4 folhas tem grade de pixel nativa real**. São ilustrações com estética de pixel art (contorno preto, blocos de cor, silhueta "retrô"), não pixel art 1:1. Isso confirma, com evidência visual direta (não só a inferência por tamanho/modo de cor já registrada no `INVENTARIO`), o autodiagnóstico do próprio pacote ("RASCUNHO / NÃO IMPORTAR"). Por instrução da rubrica (`RUBRICA_QUALIDADE_VISUAL_V1.md` §1.1: "a banda é a do pior dos dois [fidelidade e craft]" e §4.2 item 4 "grade de pixel falsa"), isso **não** é o mesmo tipo de lacuna que o fundador mandou ignorar (transparência/spritesheet/pivô/animação são critérios de (B)); a autenticidade da grade de pixel é uma dimensão de **craft artístico**, pertence a (A), e por isso **reduz a nota de (A)** nos 4 assets, mesmo quando a fidelidade de espécie isolada seria boa. Registro esta leitura explicitamente para o fundador poder discordar, se entender diferente.
- **Achado que corrige uma leitura inicial deste agente:** o sprite **oficial** de Agumon já usado no jogo (`CREATURE-0006`, rip Digimon World DS, camada `official-fan-use`, `GA/10-source-files/spriters-resource/dgmnworldds...Agumon__48418.png`) **também é amarelo/dourado**, não laranja. A cor do Agumon do ChatGPT (F0-003) está, portanto, **mais alinhada à base oficial que o projeto já adota** do que pareceria a quem só lembra do Agumon laranja do anime. Ver ficha F0-003.

---

## F0-001 — Guilmon (Rookie/Child)

| Campo | Valor |
|---|---|
| Arquivo original | `fase0-chatgpt/extraido/digital_odyssey_assets_fase4/references/guilmon_concept.png`, md5 `07f876678cbab78c5dc1d9237f65f229`, 1536×1024, RGB **sem alfa** |
| Origem e versão | ChatGPT; versão/data não informada |
| Classificação ADR-015 | **(2) recriação/adaptação** para o Digital Odyssey (ilustração nova de uma espécie oficial, não é o asset oficial em si nem frame extraído de obra) |
| (4) Fonte e risco | Espécie e design "Guilmon" © Bandai Namco/Toei (franquia Digimon); gerada por IA generalista sem licença dos titulares. Risco de PI já registrado no contexto comum §1.1: uso interno autorizado (ADR-007/009/015), publicação não autorizada |

### (A) Qualidade artística e fidelidade à franquia

- **Contagem de quadros/poses [H, contagem visual, sem grid]:** ~58 quadros em 6 fileiras. Estados identificáveis: turnaround frente+costas (~20 quadros, fileiras 1 e 3, repetidas com pequena variação), perfil/caminhada (fileira 2, 10 quadros), ataque com fogo — braço erguido + bola/jato de fogo saindo da boca (fileiras 4–5, ~16 quadros), dano/tremor (2 quadros, fileira 6) e rosnado/vitória com braços erguidos (4 quadros, fileira 6).
- **Fidelidade de espécie (isolada, sem o fator grade):** corpo vermelho-alaranjado com marcas pretas tipo tigre, olhos amarelos, barriga branca com marca escura triangular/chevron, garras brancas de 3 dedos, cauda longa — todos elementos corretos do design oficial do Guilmon. **Desvio perceptível:** as protuberâncias da cabeça (orelhas) são grandes e pontudas, tipo asa de morcego/folha; no design oficial são menores e mais arredondadas (chifres curtos). Postura ligeiramente mais ereta/musculosa (antropomórfica) que o Guilmon oficial, que é mais baixo e "quadrúpede-ágil". **Nota de fidelidade isolada: 7/10** (reconhecível de imediato, 1 desvio moderado claro — as orelhas — nenhuma confusão de espécie).
- **Grade de pixel:** **falsa** (confirmado em 1× e 4×: sombreamento em degradê redondo nos braços/pernas/barriga, contorno com antialiasing). Não é upscale de uma grade real (não há blocos N×N idênticos) nem pixel art nativa — é ilustração "pixel-styled".
- **Consistência entre poses:** proporção geral do corpo se mantém nas fileiras 1 e 3 (mesmo conjunto redesenhado); a fileira de ataque (4–5) mostra o focinho um pouco mais aberto/alongado nos quadros de "jato de fogo máximo", dentro do esperado para uma pose de ação — não achei quadro que destoe da proporção geral do conjunto.
- **Nota A (Critério 1 da rubrica, "a banda é a do pior dos dois"):** a grade falsa domina a banda 0–3 apesar da fidelidade de espécie isolada ser 7. **Nota A = 2.**
- **Critério 3 (animações e imersão), avaliado só pela metade "imersão" (poses soltas, sem ciclo contratado):** poses com razoável sentido de peso e ação (o jato de fogo tem motion lines), mas sem Y-sort/sombra de contato para avaliar (ilustração solta, sem chão). **Nota: 5** (imersão razoável na pose, sem elemento de profundidade real a avaliar).
- **Critério 4 (escala/consistência):** sem Tamer na mesma folha para medir proporção; os quadros entre si (dentro da própria folha) são consistentes em escala. **Nota: 6** (consistência interna ok; não há como avaliar a escala relativa ao elenco do jogo nesta folha).
- **Critério 5 (UI):** N/A (asset isolado, sem contexto de HUD).
- **Nota A final** (renormalização §5.2 do rubrica, estendida para 2 N/A — mapa e UI — proporcionalmente sobre Fidelidade 35/Animação 15/Escala 10 → 58,3%/25%/16,7%): 2×0,583 + 5×0,25 + 6×0,167 = 1,17+1,25+1,00 = **3,4/10**.

### (B) Prontidão técnica para integração (checklist I-01..I-16, diagnóstico, não reprovação do conceito)

| Item | Resultado |
|---|---|
| I-01 fundo alfa 0 | **Não** — RGB sem canal alfa |
| I-02 sem halo | Não avaliável (sem alfa, não há halo real para medir) |
| I-03 escala 1:1 | **Não** — grade de pixel falsa |
| I-04 sem AA | **Não** — AA e sombreamento gradiente visíveis |
| I-05 canvas constante | Não avaliável — poses em posições/tamanhos variáveis, sem grid |
| I-06 pivô no pé | **Não** — nenhum pivô definido |
| I-07 direções mínimas | Parcial — há frente/perfil/costas, sem contrato formal S/N/W+E |
| I-08 quadros mínimos/estado | Cobertura bruta de poses presente (idle, walk, attack, hurt, victory), sem contrato numerado nem `combatStates` |
| I-09 a I-16 (tile, atlas, manifesto, licença, densidade, filtro, mapa, placeholder) | **Não** — nenhum existe ainda (atlas, `creature.json`, `license.json`, comparação de densidade/paleta, carregamento no jogo) |

**Veredito do portão técnico: FALHOU** — consistente com o próprio pacote se autodeclarar "RASCUNHO / NÃO IMPORTAR".

### Custo estimado de conversão

Usando a projeção do `game-dev` (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.4, "Digimon médio/Rookie", 9,5–20,5 h por personagem completo) como base e ajustando para cima pelo achado de grade falsa — sem grade real para reduzir por fator exato (passo A2), o caminho obrigatório é "redesenhar por cima numa camada 1:1" (a rota mais cara descrita em A2), o que estende o tempo de limpeza de contorno por quadro: **estimativa ajustada ~12–22 h** para chegar a um conjunto mínimo jogável (idle 1 dir + walk 4 dir + attack 3 + hurt 1), **não medido**, por analogia.

### Potencial, limitações, veredito

- **Potencial de aproveitamento:** alto como **referência de direção artística e de pose** (paleta, silhueta geral, cobertura de estados incluindo ataque de fogo reconhecível). Baixo como sprite pronto ou semi-pronto.
- **Limitações:** grade de pixel falsa (retrabalho total de craft); sem transparência; sem pivô; orelhas destoam do design oficial; nenhum dado de licença formal ainda.
- **Veredito (A):** **candidato aproveitável** (como referência de direção, não como asset técnico).
- **Veredito (B):** **precisa de retrabalho** (total, para qualquer uso em jogo).

---

## F0-002 — ExVeemon (Champion/Adult)

| Campo | Valor |
|---|---|
| Arquivo original | `.../exveemon_concept.png`, md5 `ce3c13dc6a488f9fe05d1b2a08c1eedf`, 1536×1024, RGB sem alfa |
| Origem e versão | ChatGPT; versão/data não informada |
| Classificação ADR-015 | **(2) recriação/adaptação** |
| (4) Fonte e risco | Espécie "ExVeemon" © Bandai Namco/Toei; mesma base de risco do contexto comum §1.1 |

### (A) Qualidade artística e fidelidade à franquia

- **Contagem de quadros/poses [H]:** ~56 quadros. Fileira 1: **6 poses grandes de turnaround** (frente, 3/4, perfil, costas, 3/4, perfil — escala maior que o resto da folha). Fileiras 2–6: ~50 poses menores — perfil/caminhada (3 fileiras, ~24 quadros), soco com energia azul/golpe (fileira 4, ~8 quadros com linhas de movimento), idle/surpresa/agachado (fileira 5, ~8), rosnado/vitória com boca aberta (fileira 6, ~8).
- **Fidelidade de espécie:** corpo azul musculoso, marca "V" branca no peito, chifre dourado na testa, asas de morcego cinza-claro com contorno azul, luvas e botas brancas com garras — todos os elementos de identidade do design oficial estão presentes e corretos. É o asset dos 4 com **melhor fidelidade bruta de espécie**. **Nota de fidelidade isolada: 8/10.**
- **Grade de pixel:** **falsa**, mesmo padrão dos demais (sombreamento gradiente nos músculos do peito/braços, visível no zoom 4×).
- **Problema de consistência interno, já citado no `INVENTARIO` §4.1 e confirmado aqui:** a folha usa **duas escalas diferentes** — a fileira 1 (turnarounds) é visivelmente maior que as fileiras 2–6 (poses de jogo). Não há um contrato que diga qual escala é a "oficial"; isso não é necessariamente um erro de produção (podem ser dois propósitos — concept art × sprite de jogo), mas impede tratar a folha como um conjunto único e consistente.
- **Nota A (Critério 1):** fidelidade isolada 8, mas a grade falsa domina a banda 0–3. **Nota A = 3** (o mais alto dos 4, pela fidelidade quase perfeita, mesmo limitado pela banda).
- **Critério 3 (imersão):** poses de ação com energia/efeito (soco com rastro de luz) comunicam dinamismo. **Nota: 6.**
- **Critério 4 (escala/consistência):** a dupla escala **dentro da própria folha** é exatamente o tipo de inconsistência que este critério penaliza. **Nota: 4.**
- **Critério 5 (UI):** N/A.
- **Nota A final** (mesma renormalização 58,3/25/16,7%): 3×0,583 + 6×0,25 + 4×0,167 = 1,75+1,50+0,67 = **3,9/10.**

### (B) Prontidão técnica

Mesmo perfil da ficha F0-001 (ver tabela): **FALHOU** o portão técnico pelos mesmos motivos (sem alfa, grade falsa, sem pivô, sem manifesto/licença). Item adicional específico: **I-05 (canvas constante)** falha de forma mais grave aqui por causa da dupla escala documentada acima — mesmo um recorte cuidadoso ainda teria dois "padrões" de tamanho coexistindo na mesma folha.

### Custo estimado de conversão

Champion/Adult, mais detalhado que um Rookie (asas articuladas, muitos quadros de braço/soco): uso a faixa "Digimon grande" do `game-dev` (§6.4, 12–27,5 h) como base, com o mesmo ajuste para cima por grade falsa: **estimativa ajustada ~15–28 h**, mais um custo extra não quantificado de decidir e descartar uma das duas escalas presentes na folha antes de começar a conversão.

### Potencial, limitações, veredito

- **Potencial:** alto, sobretudo as 6 poses grandes de turnaround (ótimas como concept art de referência para um redesenho em pixel art real); as poses pequenas de ação têm valor de referência de movimento, mas escala inconsistente limita o reaproveitamento direto.
- **Limitações:** grade falsa; duas escalas na mesma folha; sem transparência/pivô/licença.
- **Veredito (A):** **candidato aproveitável** (o melhor dos 4 nesta dimensão).
- **Veredito (B):** **precisa de retrabalho.**

---

## F0-003 — Agumon (Rookie/Child) — **reaproveitamento; NÃO conta como resultado do Método A**

> Separação obrigatória (`COMANDO_ETAPA6_C2` e `INVENTARIO_ASSETS_CHATGPT.md` §4.2): esta ficha avalia a folha recebida do ChatGPT como **candidato de reaproveitamento da Fase 0**. Ela não substitui, nem antecipa, nem é comparada como resultado do Método A no experimento controlado A/B/C (que exige produção nova sobre o briefing único).

| Campo | Valor |
|---|---|
| Arquivo original | `.../agumon_concept.png`, md5 `accf6ea1d2508f1f5528818fac1ef7fe`, 1536×1024, RGB sem alfa |
| Origem e versão | ChatGPT; versão/data não informada |
| Classificação ADR-015 | **(2) recriação/adaptação** |
| (4) Fonte e risco | Espécie "Agumon" © Bandai Namco/Toei; mesma base de risco do contexto comum §1.1 |

### (A) Qualidade artística e fidelidade à franquia

- **Contagem de quadros/poses [H]:** ~52 quadros. Idle sentado de frente (6) + de costas (6); perfil/caminhada (2 fileiras, ~16); ataque — mordida/arranhão com linhas de movimento (fileira com 8, 2 delas com o efeito de "swipe"); dano/queda/estados deitado (8); surpresa/vitória com braços erguidos e "!" acima da cabeça (8, nas últimas 2 fileiras).
- **Achado que corrige a leitura inicial deste agente:** o corpo é **amarelo/dourado**, não laranja. Comparado diretamente com o sprite **oficial já usado no jogo** (`CREATURE-0006`, rip Digimon World DS, `official-fan-use`) — que também é amarelo/dourado com olhos verdes, barriga/pata clara e garras brancas — a paleta do ChatGPT está **bem mais alinhada à base DS do projeto** do que pareceria pela memória popular do Agumon laranja do anime. Isso não é um erro de cor grave; é, na verdade, um dos poucos acertos de paleta "por acidente ou por bom instinto" entre os 4 assets.
- **Desvios de forma (comparado ao DS):** postura mais "bebê"/chibi (cabeça grande, torso curto, membros curtos) do que a postura ereta e mais alerta do Agumon DS; falta a crista/espinhos dorsais visíveis no sprite DS; mãos/patas menos segmentadas (dedos pouco definidos em várias poses); olhos grandes e arredondados em estilo "fofo", mais distantes do olhar mais felino/alerta do DS. **Nota de fidelidade isolada: 6/10** (reconhecível sem legenda, cor correta pela base do projeto, mas 2+ desvios de forma/postura perceptíveis).
- **Grade de pixel:** **falsa**, mesmo padrão dos demais 3.
- **Consistência entre poses:** boa — a proporção do corpo se mantém nas ~7 fileiras, inclusive nas poses de ação e queda.
- **Nota A (Critério 1):** fidelidade isolada 6, grade falsa domina a banda 0–3. **Nota A = 3** (levemente acima da banda mínima pelo acerto de cor contra a base oficial do projeto).
- **Critério 3 (imersão):** boa cobertura de estados emocionais/físicos (dorme, cai, se surpreende, comemora) — passa bastante "vida" apesar de ser ilustração solta. **Nota: 6.**
- **Critério 4 (escala/consistência):** consistência interna boa; sem Tamer na folha para medir proporção relativa. **Nota: 6.**
- **Critério 5 (UI):** N/A.
- **Nota A final:** 3×0,583 + 6×0,25 + 6×0,167 = 1,75+1,50+1,00 = **4,25/10** (a mais alta dos 4, por cobertura de estados + acerto de paleta contra a base DS do projeto).

### (B) Prontidão técnica

Mesmo perfil das demais fichas (ver tabela F0-001): **FALHOU** o portão técnico (sem alfa, grade falsa, sem pivô/manifesto/licença).

### Custo estimado de conversão

Rookie/Child, faixa "Digimon médio" do `game-dev` (§6.4, 9,5–20,5 h), mesmo ajuste para cima por grade falsa: **estimativa ajustada ~12–22 h.**

### Potencial, limitações, veredito

- **Potencial:** moderado-alto — é o asset com a **cobertura de estados mais completa** dos 4 (idle, walk, attack, hurt/queda, victory/surpresa, inclusive variantes de costas), e a paleta já está mais perto da base DS do projeto do que os outros 3 estão de suas referências.
- **Limitações:** grade falsa; postura "bebê" destoa do DS (mais alerta/ereto); sem transparência/pivô/licença; **é reaproveitamento, não resultado do Método A.**
- **Veredito (A):** **candidato aproveitável.**
- **Veredito (B):** **precisa de retrabalho.**

---

## F0-004 — Gabumon (Rookie/Child)

| Campo | Valor |
|---|---|
| Arquivo original | `.../gabumon_concept.png`, md5 `bb627a4b3dc8fbd8243caca0a0c615f6`, 1536×1024, RGB sem alfa |
| Origem e versão | ChatGPT; versão/data não informada |
| Classificação ADR-015 | **(2) recriação/adaptação** |
| (4) Fonte e risco | Espécie "Gabumon" © Bandai Namco/Toei; mesma base de risco do contexto comum §1.1 |

### (A) Qualidade artística e fidelidade à franquia

- **Contagem de quadros/poses [H]:** ~44 quadros. Turnaround frente+costas+perfil (6); idle variantes (6); perfil/caminhada (2 fileiras, ~16); ataque de sopro de gelo com efeito (2 quadros com jato azul); idle/surpresa/dormindo (8); idle + vitória com rugido eufórico (6, incluindo 2 poses grandes finais de braços erguidos).
- **Fidelidade de espécie:** pelagem azul/branca em padrão de listras triangulares sobre uma base amarela (a "pele" que o Gabumon veste por cima do corpo, elemento correto e reconhecível do design oficial), chifre dourado único na testa (correto), olhos vermelhos (correto), orelhas longas e caídas (corretas), postura que alterna entre 2 e 4 patas (consistente com a franquia). **Desvio:** a barriga amarela tem uma marca circular azul/rosa em espiral que **não é canônica** — o Gabumon oficial tem a barriga amarela lisa, sem marca. É um elemento inventado sobre uma base majoritariamente correta. **Nota de fidelidade isolada: 7/10.**
- **Grade de pixel:** **falsa**, mesmo padrão dos demais 3.
- **Consistência entre poses:** boa, proporção mantida nas 6 fileiras.
- **Nota A (Critério 1):** fidelidade isolada 7, grade falsa domina a banda. **Nota A = 3.**
- **Critério 3 (imersão):** boa, efeito de sopro de gelo e poses de vitória communicam ação/emoção. **Nota: 6.**
- **Critério 4 (escala/consistência):** consistência interna boa; sem Tamer na folha. **Nota: 6.**
- **Critério 5 (UI):** N/A.
- **Nota A final:** 3×0,583 + 6×0,25 + 6×0,167 = **4,0/10** (segundo melhor dos 4).

### (B) Prontidão técnica

Mesmo perfil das demais (ver tabela F0-001): **FALHOU** o portão técnico.

### Custo estimado de conversão

Rookie/Child, faixa "Digimon médio" (9,5–20,5 h), ajustada por grade falsa: **~12–22 h.**

### Potencial, limitações, veredito

- **Potencial:** alto como referência de direção (segunda melhor fidelidade bruta depois do ExVeemon); a marca de barriga inventada é fácil de corrigir num redesenho.
- **Limitações:** grade falsa; marca de barriga não-canônica; sem transparência/pivô/licença.
- **Veredito (A):** **candidato aproveitável.**
- **Veredito (B):** **precisa de retrabalho.**

---

## Quadro-resumo

| ID | Espécie | Nota A (0–10) | Veredito (A) | Veredito (B) | Custo estimado de conversão [H] |
|---|---|---|---|---|---|
| F0-001 | Guilmon | 3,4 | candidato aproveitável | precisa de retrabalho | ~12–22 h |
| F0-002 | ExVeemon | 3,9 | candidato aproveitável | precisa de retrabalho | ~15–28 h |
| F0-003 | Agumon *(reaproveitamento; não é Método A)* | 4,25 | candidato aproveitável | precisa de retrabalho | ~12–22 h |
| F0-004 | Gabumon | 4,0 | candidato aproveitável | precisa de retrabalho | ~12–22 h |

Nenhuma nota chega perto do mínimo de homologação (8,0/10, ADR-015) — e não precisa chegar: isto é Fase 0 de **reaproveitamento/referência**, não uma rodada de produção final a ser homologada. O teto é baixo nos 4 casos pelo mesmo motivo (grade de pixel falsa, que domina a banda do Critério 1 por regra explícita da rubrica), não por fraqueza de conceito — a fidelidade de espécie isolada (sem o fator grade) varia de 6 a 8 entre os 4, todos "recicláveis" como referência de direção.

## Limitações desta avaliação

1. A autoavaliação do `game-art` não conta como nota de homologação (`RUBRICA_QUALIDADE_VISUAL_V1.md` §6.1): esta ficha é a primeira avaliação; falta a **revisão independente do `game-qa`** (passo 4 da sequência deste comando) antes de qualquer decisão do fundador.
2. As notas por critério usam a escala de âncoras da rubrica de forma qualitativa (comparação visual direta, sem contagem automática de cores/histograma nem lint de pixel art) — não há ferramenta automática rodada sobre PNGs sem grade real (o `pixelart_workbench` recusou a folha inteira por exceder o orçamento de pixels, 1536×1024; os recortes manuais usados para o zoom cobrem só a 1ª pose de cada folha, não a folha inteira).
3. A contagem de quadros/poses por fileira é **[H]**, visual, sem grid declarado pelo próprio pacote (consistente com o já registrado no `INVENTARIO` §4.1).
4. Não criei `license.json` nem `creature.json` para nenhum dos 4 — isso seria produção/integração, fora do escopo desta avaliação (e fora do escopo deste comando: "Nenhum asset é integrado ao jogo nesta etapa").
5. A comparação de paleta do Agumon (F0-003) usa como referência o **sprite oficial já adotado pelo próprio projeto** (`CREATURE-0006`, DWDS), não uma verificação externa no Reference Book desta sessão — é a referência que o AGENTS.md do `game-art` manda usar (§5: "Digimon iguais aos oficiais: base = sprites DS"), não uma fonte nova.
6. Nenhum arquivo do pacote recebido foi alterado; os recortes de inspeção (zoom 1×/4×) ficaram em `workspaces/game-art/tools/`, fora da árvore do projeto versionada em `etapa6-lab/`.

---

## Revisão independente do game-qa (passo 4)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-13. Revisão independente — não reescrevo o texto do `game-art` acima.
- **Veredito: CONFORME COM RESSALVA.**

**Medições por amostragem, executadas por mim:** inspecionei diretamente 2 das 4 folhas originais (`guilmon_concept.png`, `agumon_concept.png`) com script próprio (`workspaces/game-qa/tools/crop_check.py`, escrito do zero, sem reaproveitar `pxpng.py` do game-art), recortando regiões com personagem e ampliando 4× nearest-neighbor. **Confirmo** visualmente o achado central: sombreamento em degradê redondo (realces suaves arredondados na cabeça/corpo) e ausência de blocos N×N idênticos (testado em 2×2/4×4/8×8, todos `False`) — ou seja, não é uma grade real ampliada, consistente com "ilustração pixel-styled", não pixel art 1:1. **Confirmo** também a cor do Agumon (amarelo/dourado, não laranja), alinhada ao sprite oficial DS já usado no jogo.

**Coerência das notas com a rubrica e separação A/B:**

1. **A separação (A)/(B) está correta** em toda a ficha: nenhum dos 4 vereditos de (A) foi rebaixado por transparência, spritesheet, pivô ou animação ausentes (regra do `COMANDO_ETAPA6_C2` §2, formalizada em `AJUSTES_RUBRICA_VISUAL_V1.md` §6.5) — só a grade de pixel falsa reduziu a Nota A, consistente com a leitura de que esse item pertence a (A), não a (B) (ver o ponto em aberto que registrei em `AJUSTES_RUBRICA_VISUAL_V1.md` §6.6).
2. **Vereditos nunca usam "aprovado"** — conforme a regra específica da Fase 0.
3. **Conferência aritmética das 4 "Nota A final":** recalculado pela fórmula declarada (fidelidade×0,583 + imersão×0,25 + escala×0,167). Guilmon (2×0,583+5×0,25+6×0,167=3,42) e ExVeemon (3×0,583+6×0,25+4×0,167=3,92) e Agumon (3×0,583+6×0,25+6×0,167=4,25) **batem** com os valores publicados (3,4 / 3,9 / 4,25). **Gabumon não bate:** os mesmos três componentes do Agumon (3, 6, 6) foram usados, o que deveria dar 4,25 — o documento publica 4,0. **Não conforme neste ponto específico** (erro aritmético, registrado também em `AJUSTES_RUBRICA_VISUAL_V1.md` §6.7). Não corrijo o número aqui (regra de revisão sem reescrever o autor); fica para o `game-studio`/`game-art` ajustar.
4. **Lacuna de rigor (ressalva, não erro):** a rubrica (§4.2 item 4) diz que a banda 0–3 do Critério 1 "dispara falha bloqueante"; a ficha do `game-art` chega à banda 0–3 nos 4 casos (Nota A = 2 ou 3), mas não preenche explicitamente uma checklist de bloqueantes (sim/não por item 1–12) por asset, como o modelo de ficha da rubrica (§6.2) pede. Isso não muda nenhum veredito (a Fase 0 já não usa "reprovado"), mas deveria ser preenchido antes de consolidar, para rastreabilidade.
5. **Contagens de quadros [H]** e estimativas de custo de conversão não foram reconferidas por mim (dependem de inspeção visual sem grid declarado, já marcadas [H] pelo próprio autor) — aceito como estavam, por falta de forma objetiva de verificar sem o grid.

**Limitações desta revisão:** não inspecionei as 2 folhas restantes (ExVeemon, Gabumon) por amostragem direta (confirmo-as por coerência de método e pela mesma assinatura visual já confirmada nas outras 2, não por inspeção pixel a pixel). Nenhum arquivo alterado; nenhuma geração PixelLab; nenhum outro agente acionado.
