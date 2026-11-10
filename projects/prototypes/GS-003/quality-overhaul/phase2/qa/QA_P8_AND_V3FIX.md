# QA — P8 (HUD v2 spec) e correção local v3-fix (Guilmon)

- **Autor:** game-qa · **Data:** 2026-11-10
- **Revisado:** `phase2/design/P8_HUD_V2_SPEC.md` + `phase2/design/p8_mockups/*.svg` (6 arquivos, lidos e inspecionados); `phase2/art/scale-proof-v3-fix/` (`FIX_REPORT.md` + verificação independente dos 12 PNGs em `pipeline-m1-fixed/` e dos 12 PNGs originais em `scale-proof-v3/pipeline-m1/`).
- **Método da verificação independente (parte 2):** decoder PNG próprio, puro-stdlib (`zlib`/`struct`, sem `PIL` — não estava instalado), reproduzindo bbox-por-alpha, contagem de cor e checagem contra a paleta travada em `board/master_palette.json`. Script descartável, não commitado (`/tmp/verify_fix.py`, fora do repositório).
- **Nada foi alterado** em `P8_HUD_V2_SPEC.md`, nos mockups SVG, em `FIX_REPORT.md` ou em qualquer arquivo de `scale-proof-v3-fix/`/`scale-proof-v3/`. Não toquei o worktree do game-dev (`workspaces/game-dev/qo/`) além de uma leitura de `PHASE2_DEV.md` para confirmar números já citados pelo P8.

---

## 1. P8 — HUD e painéis v2

### 1.1 Notas por critério (0–10)

| Critério | Nota | Justificativa |
|---|---|---|
| **Mensurabilidade dos critérios de aceite (seção 10)** | **8** | A maioria dos itens tem limiar numérico e procedimento de teste explícito (contraste ≥4,5:1 em 3 fundos; 3 limiares exatos de PV; ≤100ms após `encounter_roll`; ≥40% de altura da grama por contagem de pixel; ≤200ms para abrir painel de detalhe). Pontos fracos: "no máximo 2 famílias tipográficas" depende de contagem manual em 3 telas (sem automação, mas é testável); "0 encontros com placa sem borda de raridade" depende de uma tabela (`digimon-forest-01.json`) que ainda está em `tables/`, não integrada (`encounters/` passo 5, só atrás de flag) — o critério é mensurável, mas não é executável hoje sem a flag `?encounters=1` ligada e a tabela carregada. |
| **Conflito com `?dpr=1`/escala do Tamer** | **5** | **Achado real, não resolvido pela spec** — ver §1.2.1 abaixo. Não é um erro da spec em si (a spec não precisa decidir escala de mundo), mas a spec assume um "retrato mini 48×48px, recorte do sprite do Tamer" sem nunca verificar de que resolução nativa esse recorte sairia, e há 3 números de "altura do Tamer" diferentes circulando nos documentos do projeto, nenhum deles citado pela spec. |
| **Conflito com `ART_DIRECTION_V2.md` (paleta/escala)** | **7** | Boa prática: a spec já se autodeclara não verificada "pixel a pixel" contra Endesga-32 (§12) e aponta a mesma ressalva que `UI_DIRECTION_V2.md` já tinha. As cores de elemento/raridade/categoria (seção 1.3) são leitura correta dos tokens existentes no CSS, e a regra "criaturas/UI fora do grade de cor do cenário" (`ART_DIRECTION_V2.md` §2) é respeitada (a spec nunca aplica a correção S×0,64/V×0,8 do cenário aos elementos de HUD). Não achei contradição de paleta. |
| **Conflito com feedback de encontro (GS-012)** | **9** | Excelente alinhamento. Comparei seção 8.1 da spec linha a linha com `encounters/ENCOUNTER_ARCHITECTURE.md` §4: os 5 intervalos de tempo (0 / 0–350 / 350–700 / 700–1000 / 1000–1200 ms) e os eventos de cada um batem exatamente. A spec soma só o que faltava (px/cor/moldura), sem alterar nenhum valor de timing ou engine, como ela mesma declara. Pequena imprecisão: a spec diz "placa aparece em ≤100ms após `encounter_roll`" (seção 10.3) mas a própria tabela de timing (seção 8.1) e o `ENCOUNTER_ARCHITECTURE.md` colocam a placa em t=700–1000ms, não "logo após o roll" — o critério de aceite devia dizer "dentro da janela 700–1000ms", não "≤100ms após o roll" (ambíguo: 100ms depois de qual marco?). É uma imprecisão de redação no critério, não no design. |
| **Legibilidade/ocupação de tela vs. referência Drakantos** | **7** | Os 2 empréstimos de princípio citados (minimapa circular, anel de alvo no solo) são atribuídos corretamente como "princípio, não desenho copiado" (`docs/DRAKANTOS_VISUAL_STUDY.md`, item 7 do estudo: minimapa circular e anel vermelho de alvo, frame t=00:58). A regra de contraste 4,5:1 para texto flutuante (10.1) atende à queixa #6 do estudo ("nada se destaca"). **Mas a spec não toca na questão de ocupação de tela em si** (quanto da tela a HUD ocupa vs. o mundo) — isso é delegado implicitamente ao zoom de câmera, que `ART_DIRECTION_V2.md` §1.4.2 marca como decisão aberta de `game-dev`/`game-design`, não resolvida em nenhum documento. A HUD v2 não aumenta a área ocupada por elementos fixos (a barra inferior continua 96px), então não há regressão, mas também não há uma declaração explícita de "quanto de tela isso ocupa a 1920×1080", que seria o teste mais direto contra a "proporção" do Drakantos. |
| **Lacunas antes de implementar** | **7** | A seção 12 (Limitações) da própria spec já é honesta e cobre a maior parte: Energia do Tamer sem função na sim, diálogo sem sistema, minimapa circular sem confirmação de esforço com game-dev, cores não verificadas pixel a pixel. Faltam 2 lacunas que a spec não lista (ver §1.3 "Lacunas adicionais" abaixo). |

### 1.2 Achados

#### 1.2.1 [P2] Três números diferentes de "altura do Tamer" circulam no projeto, e a spec não cita nenhum

A tarefa que me chamou cita "~56 px, ver `phase2/PHASE2_DEV.md`" para a escala do Tamer sob `?dpr=1`. Fui ao arquivo (worktree do game-dev, só leitura) e **não existe nenhum "56" ligado ao Tamer nesse documento**. O que `PHASE2_DEV.md` §2 realmente diz: o personagem de referência (30 px **lógicos**) é escalado para ~8,3% da altura física da tela a 1080p (escala inteira 3×) — ou seja, **~90 px físicos na tela**, não 56.

O "~56 px" que a tarefa citou na verdade rastreia a outro lugar: `ART_DIRECTION_V2.md` §1.2 (tabela **revisada e marcada "não usar para produção"** pelo próprio documento) propunha Tamer em "52–60 px de altura (corpo)"; essa cifra foi citada de novo em `phase3/qa/QA_PHASE3.md` ("corpo de ~56–60 px") como referência de comparação com a moita de FG — **sem notar que §1.2 já estava superada por §1.4** (que propõe 56–64 px nativos para o Tamer, ainda **não testado**, só extrapolação `[H]`).

Ou seja, hoje existem 3 números não reconciliados:
1. **56–60 px** (`ART_DIRECTION_V2.md` §1.2, tabela descartada) — citado de novo por `QA_PHASE3.md`.
2. **56–64 px nativos** (`ART_DIRECTION_V2.md` §1.4.1, tabela oficial, mas **não testada** para o Tamer — só o Rookie/Guilmon foi testado).
3. **~90 px físicos na tela** (`PHASE2_DEV.md` §2, o que está **de fato implementado** hoje via `?dpr=1`, a partir de um sprite lógico de 30 px escalado ×3).

(1) e (2) são tamanho de **arte nativa** (canvas do sprite); (3) é tamanho **renderizado na tela** depois do zoom. Não é incoerente por definição (arte nativa maior × zoom menor pode dar o mesmo resultado na tela), mas **nenhum documento faz essa conta**, e a spec P8 não cita nenhum dos três ao especificar o "Retrato mini 48×48px (recorte do sprite do Tamer, direção sul)" da seção 4.1. Um recorte de 48px de um sprite nativo de ~30–32px (o que existe hoje, não o proposto) sairia upscaled/borrado; um recorte de um sprite futuro de 56–64px sairia mais perto do 1:1. **A spec não resolve isso porque não precisa decidir escala de mundo — mas devia citar a dependência explicitamente**, como já faz para o minimapa circular (§12).

**Risco concreto:** se o Retrato mini (4.1) e o Retrato grande (5, 72×72px) forem produzidos antes do Tamer ganhar arte na escala §1.4 confirmada, o recorte vai upscaled a partir do sprite atual (~30px), ficando borrado/blocado — o oposto do "acabamento, não reconstrução" que a spec promete na introdução.

#### 1.2.2 [P3] Critério de aceite 10.3 ("placa em ≤100ms após `encounter_roll`") está mal redigido

Já descrito em §1.1. A janela real, pela própria seção 8.1 e por `ENCOUNTER_ARCHITECTURE.md` §4, é 700–1000ms após o roll (depois do farfalhar e do salto). "≤100ms após `encounter_roll`" sugere (lido isoladamente) que a placa devia aparecer quase instantaneamente, o que contradiz a sequência de 1,2s que a própria spec desenhou. Sugestão de correção textual: "placa aparece dentro da janela 700–1000ms da sequência (seção 8.1), e essa janela não atrasa o início do combate em si."

#### 1.2.3 [P3] Lacuna não listada: dependência de ordem com GS-012 passo 8

`ENCOUNTER_ARCHITECTURE.md` §6 (plano de implementação) marca o passo 8 (animação e efeitos do encontro) como dependente de "**GS-010: grama alta aprovada**" antes de poder entrar. A seção 9 da spec P8 lista "(e) Grama alta distinguível (8.3)" como **P0 bloqueante para a demo**, mas a spec não cita que essa dependência (aprovação do game-art sobre a touceira `fp4_tall_grass_*`) é **externa** a ela e já estava registrada no documento-fonte. Não é erro, é uma lacuna de rastreabilidade: um leitor só da P8 não saberia que o P0(e) depende de uma aprovação de arte que não está no controle do game-design.

#### 1.2.4 [P1] Nenhum achado bloqueante de implementação em si

Não encontrei nenhum valor de px/cor/timing na spec que contradiga diretamente outro documento aprovado (ART_DIRECTION_V2, UI_DIRECTION_V2, ENCOUNTER_ARCHITECTURE). Os mockups SVG inspecionados (`hud_overview.svg`, `encounter_feedback_timeline.svg`, `hotbar_target.svg`, `inventory_panel.svg`) usam exatamente os px/cores/tokens descritos no texto da spec (confirmado por leitura direta do XML: `.hud-partner` 260×80, hotbar 4×52px com bordas por categoria, placa de alvo 88×20 com borda por raridade, cartões de inventário 76×86 com borda dupla) — **a spec e os mockups são consistentes entre si**, o que nem sempre acontece nesse tipo de entrega.

### 1.3 Lacunas adicionais antes de implementar

1. A ambiguidade de escala do Tamer (§1.2.1) deveria ser resolvida (ou ao menos declarada como dependência explícita, como o minimapa circular já é) antes do game-art produzir qualquer retrato de HUD cortado da arte do Tamer.
2. O critério 10.3 precisa de reescrita (§1.2.2) para não confundir timing.
3. A fonte pixel-bitmap (P2 da seção 9) e o ornamento de canto "garra" (2.2, P1) não têm estimativa de esforço/geração do PixelLab — a spec diz "fora desta entrega" mas não dá nem uma faixa de gerações esperada, o que dificulta o fundador orçar (saldo atual ~2,8 gerações, quase zerado).

### 1.4 Veredito — P8 pronta para implementação?

**Sim, com condições.** A spec é implementável tal como está para os itens **P0** da seção 9 que não dependem de arte nova (molduras CSS, cores de borda reativas, timing — tudo isso é CSS/JS puro sobre tokens já existentes). As condições:

1. Resolver ou declarar explicitamente a ambiguidade de escala do Tamer (§1.2.1) antes de produzir qualquer asset de retrato recortado (4.1, 5).
2. Corrigir o texto do critério 10.3 (§1.2.2) antes de usá-lo como gate de aceite.
3. Confirmar com game-dev o esforço do minimapa circular (já pedido pela própria spec, §12 — reforço aqui porque está marcado P1, não P0, mas listado antes de qualquer sprint).
4. Os itens que dependem de arte nova (ornamento de canto, ícones coloridos, fonte pixel-bitmap, touceira de grama alta aprovada) **não têm data nem orçamento confirmado** — tratar como bloqueio real do P0(e)/P0(c) até o game-art entregar, não como "detalhe de polimento".

---

## 2. Correção local Guilmon v3-fix

### 2.1 Verificação independente das alegações do `FIX_REPORT.md`

| Alegação do relatório | Verificação independente | Resultado |
|---|---|---|
| União de cor dos 12 quadros de `pipeline-m1` (antes) = 58 | Reli os 12 PNGs de `scale-proof-v3/pipeline-m1/` com decoder próprio, contei a união de RGB opaco (α>127) | **Confirmado: 58** |
| União de cor dos 12 quadros de `pipeline-m1-fixed` (depois) = 18, nenhuma fora da paleta travada | Reli os 12 PNGs de `pipeline-m1-fixed/`, contei a união e comparei contra os 18 hex de `board/master_palette.json` | **Confirmado: união = 18; 0 cores de qualquer quadro fora dessas 18** (verificado quadro a quadro, não só na união) |
| Pé (`ymax` da bbox por alpha) em 47px em todos os quadros | Medi `ymax` nos 12 quadros de `pipeline-m1-fixed/` | **Confirmado para 11 de 12**: `south.png` (âncora) e os 10 quadros animados (idle×4, walk×6) estão todos em `ymax=47`. **`south-west.png` está em `ymax=48`**, não 47 — mas isso bate exatamente com o que o próprio `FIX_REPORT.md` §8 já avisa ("south-west recebeu só a trava de paleta, sem translação... não faz parte do defeito de encolhimento documentado"), e com a tabela de "antes" do relatório (§0: south-west já media 48px antes do fix, como pose 3/4, legitimamente maior). A frase "pé em 47px em todos os quadros" do pedido original é imprecisa se lida incluindo south-west; **o relatório em si não erra, só não repete essa ressalva na frase-resumo**. |
| Bboxes individuais (altura por quadro, usadas para o veredito de validade) | Medi altura (bbox H) dos 12 quadros originais e dos 12 corrigidos | **Confirmado em todos os valores**: originais (south 32, south-west 35, idle 24/27/28/25, walk 28/29/29/27/29/29) e corrigidos (mesmas alturas, exceto south-west inalterado) batem exatamente com as tabelas §0 e §2 do relatório. |
| Veredito "6 de 10 quadros animados seguem INVÁLIDOS" (idle f0–f3 todos, walk f0 e f3) | Recalculei o desvio de altura vs. âncora (32px) com o mesmo limiar de 10% declarado no relatório | **Confirmado**: idle f0 (−25,0%), f1 (−15,6%), f2 (−12,5%), f3 (−21,9%) e walk f0 (−12,5%), f3 (−15,6%) excedem o limiar; walk f1/f2/f4/f5 (todos −9,4%) ficam dentro. Os 6 quadros marcados inválidos pelo relatório são exatamente os 6 que meus números também marcariam, usando o mesmo corte de 10%. |
| `pipeline-m1/` original não foi alterado | Reli os 12 PNGs originais de `scale-proof-v3/pipeline-m1/` — os números batem com os já registrados no `QA_SCALE_PROOF_V3.md` anterior (citado pelo próprio `FIX_REPORT.md` §0) | **Confirmado**: nada foi tocado no diretório original. |

**Conclusão da verificação:** todas as alegações numéricas centrais do `FIX_REPORT.md` (18 cores na união, 0 cores fora da paleta, realinhamento do pé, veredito de validade por quadro) **se confirmam de forma independente**, com uma única ressalva de redação (a frase "47px em todos os quadros" deveria dizer "nos 11 quadros alinhados à âncora sul; `south-west`, pose lateral sem translação, permanece em 48px por desenho, não por falha").

### 2.2 Quadros ainda inválidos para produção em escala (confirmado)

| Quadro | Altura medida | Desvio vs. âncora (32px) | Status |
|---|---:|---:|---|
| `idle-s/frame_000` | 24px | −25,0% | **INVÁLIDO** |
| `idle-s/frame_001` | 27px | −15,6% | **INVÁLIDO** |
| `idle-s/frame_002` | 28px | −12,5% | **INVÁLIDO** |
| `idle-s/frame_003` | 25px | −21,9% | **INVÁLIDO** |
| `walk-s/frame_000` | 28px | −12,5% | **INVÁLIDO** |
| `walk-s/frame_003` | 27px | −15,6% | **INVÁLIDO** |
| `walk-s/frame_001` | 29px | −9,4% | válido |
| `walk-s/frame_002` | 29px | −9,4% | válido |
| `walk-s/frame_004` | 29px | −9,4% | válido |
| `walk-s/frame_005` | 29px | −9,4% | válido |
| `rotations/south.png` | 32px | âncora | válido |
| `rotations/south-west.png` | 35px | +9,4% (maior, esperado) | válido |

**Todo o `idle-s` (4/4) e 2 de 6 do `walk-s` seguem inválidos** para uso em escala de produção, exatamente como o relatório concluiu. Nenhum desses 6 quadros deve ir para o roster do piloto sem regeneração.

### 2.3 Notas por critério (0–10)

| Critério | Nota | Justificativa |
|---|---|---|
| **Trava de paleta (metodologia e resultado)** | **9** | K-means determinístico, reproduzível, verificado de forma independente linha a linha. Resolve o defeito repetido em 3 QAs seguidos. Único ponto de atenção: a classificação de material no JSON tem erros de fronteira que o próprio relatório já avisa (não afeta a trava em si, só a legenda). |
| **Realinhamento de posição (pé/centro)** | **8** | Translação inteira, sem reamostragem, verificada: todos os 10 quadros animados alinham o pé em 47px e o centro em 32,0 (exceto frame_002 do idle em 31,5, diferença de 0,5px, irrelevante). Método correto para o que se propõe a resolver (jitter), e o relatório é honesto sobre o que não resolve. |
| **Transparência/honestidade do relatório sobre o que não foi resolvido** | **9** | Seção 2 e 8 são claras: o encolhimento real do corpo **não foi corrigido** (nem podia, dado o teto de 0 reamostragem) e 6/10 quadros continuam inválidos. Isso é dito sem meias palavras, com números auditáveis — exatamente o padrão que se espera de uma entrega que "não se aprova a si mesma" (ADR-012 §3). |
| **Verificação de fidelidade ao Guilmon oficial** | **N/A** | O relatório não tenta resolver isso (reconhece a mesma limitação de `web_search` das 2 revisões anteriores) e não reivindica ter verificado — não há o que notar aqui além de registrar que a pendência de 3 rodadas continua aberta. |
| **Escopo e não-interferência (worktree de outro agente, `pipeline-m1` original intocado)** | **10** | Confirmado: nada fora de `scale-proof-v3-fix/` foi tocado; `pipeline-m1/` original intacto (números batem com o QA anterior); nenhuma chamada `pixellab__*` (0 gerações, consistente com o relatório). |

### 2.4 Veredito — correção local v3-fix

**Aceitar a correção como está documentada**, com as seguintes condições para uso downstream:
1. **Não usar** `idle-s/frame_000-003` nem `walk-s/frame_000` e `frame_003` de `pipeline-m1-fixed/` em produção na escala atual — estão corretamente marcados inválidos e minha verificação independente confirma o veredito.
2. **Pode usar** `walk-s/frame_001, 002, 004, 005` e as duas rotações estáticas (`south`, `south-west`) — dentro do limiar de 10% de desvio aceito pelo próprio relatório.
3. **Adotar a recomendação de pipeline** (§6 do `FIX_REPORT.md`): trava de paleta obrigatória pós-geração para P5/P6, é reaproveitável sem custo e resolve uma queixa repetida 3×.
4. A pendência de fidelidade oficial (§4 do `FIX_REPORT.md`) continua bloqueada por ferramenta (`web_search` indisponível), não por decisão — repassar ao fundador como já foi feito nas 2 rodadas anteriores.
5. Corrigir a frase-resumo "pé em 47px em todos os quadros" para "...nos 11 quadros alinhados à âncora sul" na próxima revisão do relatório, para não implicar `south-west` incorretamente.

---

## 3. Limitações desta QA

- Não tenho acesso a `web_search`/`web_fetch` funcional verificado nesta sessão para checar fidelidade do Guilmon ao oficial — não tentei, mesma limitação das 3 revisões anteriores; não é um achado novo, é a mesma pendência repassada.
- A verificação independente da parte 2 usou um decoder PNG próprio (puro-stdlib, sem `PIL`/`numpy`), testado contra os mesmos 12+12 arquivos que o relatório usa; não comparei contra uma 3ª implementação para triangular o decoder em si, mas os números batem exatamente com os dois relatórios anteriores (QA_SCALE_PROOF_V3.md via FIX_REPORT.md §0, e agora o meu próprio recálculo), o que é uma convergência forte de 3 medições independentes.
- Não abri o jogo real (`?dpr=1`, HUD v2) — toda a análise da parte 1 é estática (leitura de spec, SVG e documentos-fonte), como a própria spec também declara ter feito. Os critérios de aceite da seção 10 da spec continuam não testados ao vivo (são para quando a implementação existir).
- Não revisei `partner_panel.svg` e `dialogue_box.svg` em profundidade pixel a pixel (só confirmei existência e estrutura geral); os 4 mockups que inspecionei em detalhe (`hud_overview`, `encounter_feedback_timeline`, `hotbar_target`, `inventory_panel`) bateram com o texto da spec, o que dá confiança razoável nos 2 restantes, mas não é confirmação direta.
- Não toquei nem naveguei para dentro do worktree do game-dev além de uma leitura pontual de `PHASE2_DEV.md` (necessária para resolver o achado §1.2.1); nenhuma escrita foi feita ali.
