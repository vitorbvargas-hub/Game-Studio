# RUBRICA_QUALIDADE_VISUAL_V1 — Etapa 6, Comando 1 (entregável do §7)

- **Autor:** game-qa (subagente, 5º da sequência) · **Data:** 2026-11-13 · **Revisão 2** (2026-11-13, mesmo dia): correção do `game-studio` sobre os pesos, aplicada abaixo.
- **Regra respeitada: só planejamento.** Nenhum asset foi avaliado (nada foi produzido ainda). Nenhuma geração no PixelLab, nenhum código/sprite/mapa/Database alterado, nenhum outro agente acionado.
- **Lido antes de escrever:** `DIGITAL_ODYSSEY_CONTEXT.md` v1.2; `ADR-015-digital-odyssey-uso-criativo-da-franquia.md`; `COMANDO_ETAPA6_C1.md`; `COMPARATIVO_FERRAMENTAS_VISUAIS.md` (inteiro, incl. §3 matriz e §6.5 checklist I-01..I-16 do game-dev); `ESTUDO_ESCALA_DIGIMONS.md`; `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (Partes 1 e 2, incl. §10 critérios do layout-brief); `INVENTARIO_ASSETS_CHATGPT.md`; `qa/ETAPA2_HOMOLOGACAO.md` (histórico real de notas, usado para calibrar as âncoras abaixo).

## 0. Nota de precedência documental

**Resolvido pelo `game-studio` em 2026-11-13: prevalece o `COMANDO_ETAPA6_C1.md` §7 (fundador).** A versão anterior desta rubrica (Revisão 1) havia usado um conjunto diferente de 5 critérios e pesos, recebido como parte do brief deste Comando 1; o `game-studio` corrigiu, na mesma data, que aquele conjunto foi uma reformulação própria sem autorização do fundador, e que a tabela do `COMANDO_ETAPA6_C1.md` §7 — Fidelidade e beleza dos Digimon 35% / Beleza e exploração dos mapas 35% / Animações e imersão 15% / Escala e consistência 10% / Integração com a UI 5% — é a que vale. Esta Revisão 2 reconstrói a rubrica sobre essa tabela, reaproveitando todo o conteúdo técnico já levantado (fidelidade de espécie, craft de pixel art, checklist I-01..I-16, custo/retrabalho), sem perder nenhuma evidência já reunida.

Os impeditivos, a nota mínima (8,0 ponderada, ADR-015) e o cruzamento com os 10 critérios do layout-brief continuam valendo sem alteração de conteúdo — só de numeração de seção.

---

## 1. Os 5 critérios (pesos do `COMANDO_ETAPA6_C1.md` §7, fundador)

Cada critério é avaliado **por asset** (1 sprite, 1 animação, 1 tileset/tile, 1 mapa-piloto) e também pode ser resumido **por lote** (todos os assets de um método, de uma rodada ou da Fase 0), tirando a média simples das notas de asset dentro do lote — nunca uma nota "no olho" do lote inteiro.

Dois critérios (checklist técnica de formato e custo/retrabalho) **não entram mais na média ponderada** — ver §2 e §3. Eles continuam obrigatórios, só que como portão binário e como registro, não como nota com peso (correção do `game-studio`: "o adendo do fundador pede consumo real, retrabalho e qualidade final", não uma média que dilua a qualidade com o custo).

### 1.1 Critério 1 — Fidelidade e beleza dos Digimon (peso 35%)

**O que mede:** junto, (a) se o Digimon (ou NPC/objeto classificado (1) oficial ou (2) recriação-adaptação pelo ADR-015) é reconhecível e fiel à espécie/design oficial, **e** (b) o domínio técnico de pixel art do próprio sprite — grade real, contorno, sombreamento, paleta. **[E, ADR-015]** "Os Digimon mantêm fidelidade visual e conceitual à franquia. A nota mínima de homologação visual continua 8/10" — este critério é a materialização direta dessa exigência.

**Aplica-se a:** sprites de Digimon, Tamer e NPCs (qualquer asset de personagem). **Não se aplica da mesma forma a elementos (3) originais** (Tamer, NPCs originais): para esses, a parte (a) avalia **coerência com a identidade do Digital Odyssey e com a classificação declarada**, nunca fidelidade a uma espécie da franquia; a parte (b) (craft de pixel art) vale do mesmo jeito para qualquer personagem, oficial ou original. Um asset (3) sem essa nota de contexto no formulário é tratado como se fosse (1)/(2) e avaliado pela régua de fidelidade cheia — para não abrir uma via de escape "é original" sem registro.

| Nota | Âncora observável (fidelidade de espécie **e** craft de pixel art — a banda é a do pior dos dois) |
|---|---|
| **0–3** | Espécie irreconhecível/confundida com outra (inclusive dentro da mesma linha evolutiva, ou a armadilha Drimogemon×Digmon, contexto comum §3.8) **ou** não é pixel art real (ilustração reamostrada, sem grade nativa, produto típico de gerador de imagem sem conversão — Método A §1.1 do comparativo). **Dispara falha bloqueante (§4.1/§4.2) e reprova sozinho.** |
| **4** | Reconhecível só com o nome escrito ao lado; proporção/cor-base/marca de assinatura (chifre, crista, cauda, padrão de pele) incorreta a ponto de parecer outra espécie da mesma família — **e/ou** grade real mas inconsistente (blocos de ampliação junto com pixel 1:1 genuíno), AA visível em pelo menos 1 borda, nº de cores acima do razoável. Calibração real: Etapa 2 item 2 (proporções), nota 4 — "Koromon 28×22 minúsculo ao lado de árvores de 3 tiles", "Campeões DS 40–42 px: um Greymon é praticamente do tamanho de uma criança". |
| **6** | Reconhecível sem legenda por quem já viu a espécie, com 2+ desvios perceptíveis frente ao design oficial, sem confundir espécie — **e** grade real 1:1, mas com ruído (pixels soltos, cor fora de paleta em pequenos clusters, sombreamento confuso em 1–2 áreas). |
| **8** | Reconhecível de imediato mesmo por quem não é fã assíduo; no máximo 1 desvio pequeno justificável por limite de resolução (nunca de forma, cor-base ou marca de assinatura) — **e** grade limpa, sem AA, paleta deliberada, contorno consistente. Este é o piso de aprovação do ADR-015. |
| **10** | Indistinguível em identidade do design oficial dentro do estilo-alvo (poderia ilustrar a página da espécie no Reference Book) — **e** pixel art de nível profissional, sem ruído em nenhum pixel; passa lint (`pixelart_workbench lint`, quando executado) sem achados de `outline_gap`/`orphan_pixel`. |

**Como medir:** (a) comparação lado a lado contra a referência oficial (rip DW DS e/ou Reference Book/Wikimon), checklist de 5 marcas de identidade por espécie (cor-base, padrão de pele/escama, cabeça/chifre/crista, cauda/membro de assinatura, atributo visual quando houver traço reconhecível); (b) inspeção a 300–800%, contagem de cores (histograma), detecção de grade de ampliação falsa, `pixelart_workbench(argv=["lint", ...])` quando o formato e a autorização da tarefa permitirem.

**Evidência exigida:** print do asset em 1× e 3× ao lado da referência oficial na mesma escala; md5; checklist das 5 marcas de identidade preenchido; contagem de cores; resultado do lint, se executado (ou "não executado" com motivo); para asset (3), a classificação ADR-015 e a nota de coerência com o lote.

### 1.2 Critério 2 — Beleza e exploração dos mapas (peso 35%)

**O que mede:** junto, (a) o craft de pixel art do tileset/terreno/props de cenário, e (b) se o mapa-piloto entrega uma exploração rica — composição, variedade, legibilidade, pontos de interesse — pelos 10 critérios verificáveis do layout-brief (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` §10, reproduzidos no §5.4).

**Aplica-se a:** mapa-piloto completo, tilesets/terrenos, props de cenário e composições de mapa. **Não se aplica** a um asset isolado sem contexto de mapa (sprite de personagem sozinho, UI) — ver regra de renormalização no §5.2.

| Nota | Âncora observável |
|---|---|
| **0–3** | Mapa ilegível, sem caminho navegável contínuo entre entrada e objetivo **ou** tileset/prop que não é pixel art real. Dispara falha bloqueante. |
| **4** | Chão chapado sem variação de textura (Etapa 2 item 5, nota 4: "chão é um único verde-menta chapado"), vegetação repetitiva ("pomar": poucas espécies de árvore/mato repetidas em toda a área, item 6 nota 4), sem caminho legível nem elemento ambiental (item 7 nota 4); cumpre ≤4 dos 10 critérios do layout-brief. |
| **6** | Variação parcial de chão/vegetação, composição ainda perceptivelmente em grade, mas com pelo menos 1 ponto focal; cumpre 5–7 dos 10 critérios do layout-brief. |
| **8** | Cumpre pelo menos 8 dos 10 critérios do layout-brief; variedade de árvore/mato conforme recomendado (≥3 variantes de árvore, ≥2 de mato nas zonas densas); pelo menos 1 feature de desnível; pixel art limpa no tileset/props. |
| **10** | Cumpre os 10/10 critérios do layout-brief; composição com pontos focais claros, nenhuma repetição perceptível ("pomar"); pixel art de nível profissional no tileset/props. |

**Como medir:** aplicar os 10 critérios verificáveis do §5.4 (contar quantos "sim"); inspeção de variedade de tile/prop (contagem de variantes distintas por zona); % de área "vazia"/repetitiva; craft de pixel art do tileset pelo mesmo procedimento do §1.1(b).

**Evidência exigida:** captura do mapa completo + crops 1× e 3× de tiles/props representativos; tabela dos 10 critérios do layout-brief preenchida (sim/não/parcial, cada um com a evidência que o comprova); contagem de variantes de árvore/mato por zona.

### 1.3 Critério 3 — Animações e imersão (peso 15%)

**O que mede:** junto, (a) a fluidez e naturalidade das animações (quando existirem), e (b) a sensação de imersão/atmosfera — profundidade (Y-sort), iluminação, sombra de contato, composição que sugere um mundo vivo.

**Para um asset estático de quadro único** (ex.: uma imagem recebida na Fase 0 sem ciclo de animação): a parte (a) não tem evidência para avaliar — o critério é pontuado **só pela parte (b)** (imersão/atmosfera da pose única), e a ficha registra explicitamente "sem animação — avaliado só por imersão estática", sem renormalizar o peso do critério (ele continua 15%, só que medido por uma metade do procedimento).

| Nota | Âncora observável |
|---|---|
| **0–3** | Quadros derivando/inconsistentes de forma grave entre si (dispara falha bloqueante §4.3 item 6) **ou** nenhuma camada de profundidade (Y-sort quebrado: o Tamer passa por cima de um tronco que deveria ocluí-lo). |
| **4** | Animação com poucos quadros por direção, pose abrupta sem antecipação legível em ataque; sombra de contato descolada dos pés; chão plano sem desnível. Calibração real: Etapa 2 item 4 (fluidez), nota 5, e item 8 (profundidade), nota 5 — ambos já identificam esses mesmos problemas, aqui numa banda mais severa (4, não 5), porque o critério combina os dois. |
| **6** | Animação funcional (ciclo completo, sem derivar), mas sem naturalidade (poses abruptas); Y-sort correto, porém sem elemento adicional de profundidade (sem desnível nem iluminação direcional). |
| **8** | Animação fluida (walk com ≥4 quadros por direção, antecipação visível em ataque); Y-sort correto; pelo menos 1 elemento de profundidade (sombra de contato bem ancorada, desnível ou iluminação direcional). |
| **10** | Animação natural e expressiva; composição com camadas de profundidade bem trabalhadas (sombra, desnível, iluminação), sensação clara de "mundo vivo". |

**Como medir:** contagem de quadros por animação e duração por quadro; inspeção de Y-sort em pelo menos 2 situações de oclusão; presença e ancoragem da sombra de contato; para asset estático, avaliar só iluminação/profundidade sugerida pela pose única.

**Evidência exigida:** GIF ou sequência de frames da animação (quando houver), com a duração de cada quadro anotada; captura mostrando o Y-sort em pelo menos 2 situações de oclusão; para asset estático, nota explícita de que a avaliação cobriu só a metade "imersão".

### 1.4 Critério 4 — Escala e consistência (peso 10%)

**O que mede:** junto, (a) se a escala do asset respeita a hierarquia Baby < Rookie/Child < Tamer ≤ Champion/Ultimate (ou um desvio deliberadamente registrado como hipótese de teste E1–E4), e (b) a **coerência visual entre os assets do mesmo lote e com o cenário** — mesma densidade de pixel, paleta e contorno, sem os 3 estilos convivendo como hoje (Etapa 2 item 11). Este critério absorve o que a Revisão 1 chamava de "coerência visual entre assets" — por instrução do `game-studio`, essa parte passa a viver aqui, não num critério próprio.

| Nota | Âncora observável |
|---|---|
| **0–3** | Choque visual grave de densidade de pixel (um asset em "pixel 2×" ao lado de outro 1:1, risco técnico já registrado em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.7) **ou** escala completamente fora de qualquer hipótese registrada (ex.: um estágio maior aparece visivelmente menor que um estágio inferior, sem ser teste deliberado — dispara falha bloqueante §4.3 item 5). |
| **4** | Paleta e contorno visivelmente de fontes diferentes dentro da mesma cena (Etapa 2 item 11: "mapa PixelLab cartoon saturado, Digimon DS de contorno macio, Tamer PixelLab de contorno preto rígido") **e/ou** hierarquia de escala rompida sem registro de que é uma variável de teste. |
| **6** | Paleta próxima mas não idêntica entre os assets testados; contorno de tipo diferente (rígido × macio) sem choque forte; hierarquia de escala presente, com alguma inversão pontual já registrada como variável em teste. |
| **8** | Densidade de pixel igual (R2 do motor); paleta dentro de uma variação documentada e pequena; contorno do mesmo tipo entre os assets do lote; hierarquia Baby<Child<Tamer≤Adult/Ultimate respeitada (ou desvio documentado como parte do teste E1–E4). |
| **10** | Assets e cenário parecem produzidos pela mesma mão/pipeline, **e** a escala relativa entre Tamer/Digimon por estágio é coerente e deliberada. |

**Como medir:** composição de todos os assets do lote numa mesma captura/cena de teste; % de pixels do cenário em cada uma das duas paletas em conflito (Endesga-32 e a referência v13/v15 aprovada) — relatar as duas, nunca escolher uma; itens técnicos I-03 (escala 1:1), I-13 (densidade de pixel igual à cena) e I-14 (tratamento de cor/filtro coerente) do portão técnico (§2); altura de conteúdo medida contra `ESTUDO_ESCALA_DIGIMONS.md` §3 e contra o Tamer do mesmo lote.

**Evidência exigida:** captura lado a lado em 1× e 3×; % de pixels por paleta (as duas réguas); resultado dos itens I-03/I-13/I-14; tabela comparando a altura de conteúdo medida com a tabela de referência de `ESTUDO_ESCALA_DIGIMONS.md`; md5 de cada asset comparado.

### 1.5 Critério 5 — Integração com a UI (peso 5%)

**O que mede:** se o asset, em contexto de jogo, permanece legível e sem conflito visual com os elementos de UI/HUD que o acompanham — nome e nível sobre a entidade, barra de vida/golpes, ícone de inventário/Database. **Não é a checklist técnica de formato** (isso é o portão do §2): é a leitura visual conjunta entre o asset e a camada de interface.

| Nota | Âncora observável |
|---|---|
| **0–3** | Elemento de UI essencial fica ilegível ou cobre parte crítica do asset (ex.: "a barra de golpes fica sobre os personagens... cobre a parceira", Etapa 2 item 10) — ou texto de desenvolvimento visível ao jogador (também dispara falha bloqueante §4.6 item 11). |
| **4** | UI funciona mas compete visualmente com o asset: contraste baixo entre nome/nível e o fundo do sprite, ícone de miniatura (Database/inventário) pouco reconhecível. Calibração real: Etapa 2 item 10, nota 4 ("HUD denso... texto de desenvolvimento aparece ao jogador"). |
| **6** | UI e asset coexistem sem sobreposição grave, mas sem cuidado deliberado de legibilidade (nenhum contorno/sombra por trás do texto de nome/nível, por exemplo). |
| **8** | Nome/nível/barra legíveis sobre o asset em qualquer fundo testado; miniatura do Database/inventário (quando existir) reconhecível na mesma identidade do sprite grande. |
| **10** | A UI parece desenhada para esse asset especificamente: contraste, posição e escala do rótulo/barra/ícone otimizados; nenhuma leitura ambígua em nenhuma captura testada. |

**Como medir:** captura do asset no contexto de jogo com os elementos de UI que o acompanham (nome, nível, barra de vida/golpes); comparação do ícone/miniatura (quando existir) com o sprite grande, na mesma identidade visual.

**Evidência exigida:** captura com UI ativa mostrando o asset em pelo menos 1 situação de jogo; captura da miniatura/ícone correspondente, quando existir; nota explícita quando não houver elemento de UI aplicável a testar ainda (ex.: asset isolado fora de qualquer cena).

---

## 2. Portão técnico obrigatório — checklist I-01..I-16 do game-dev

**Correção do `game-studio`:** a checklist deixa de ser um critério com peso e passa a ser um **pré-requisito binário**. Um asset só é considerado "pronto para integrar" se **todos** os itens aplicáveis forem "sim" (regra original de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.5: "um 'não' basta para reprovar a integração"). Isso não altera a nota ponderada dos 5 critérios do §1 — é uma segunda porta, separada, que também reprova o asset se falhar.

| # | Item | Aplica a | Como verificar |
|---|---|---|---|
| I-01 | PNG RGBA, fundo com alfa 0, sem cor de chroma residual | todos | (auto) contar pixels de alfa 0 na borda e cores do fundo original |
| I-02 | Sem halo: nenhum pixel com 0 < alfa < 255 no contorno (salvo efeito intencional declarado) | personagem, prop | (auto) contagem de alfa parcial |
| I-03 | Escala 1:1: nenhuma grade de ampliação (blocos N×N idênticos com N ≥ 2) | todos | (auto) detecção de blocos repetidos |
| I-04 | Sem antialiasing nem reamostragem: nº de cores dentro do limite combinado, sem meias-tintas de borda | todos | (auto) histograma de cores + inspeção a 800% |
| I-05 | Canvas inteiro e constante dentro de cada animação | personagem, prop animado | (auto) dimensões de todos os quadros iguais |
| I-06 | Pivô no pé: o pé varia ≤ 1 px entre quadros; altura de conteúdo ±5% | personagem | (auto) linha opaca mais baixa por quadro |
| I-07 | Direções mínimas: Digimon S, N, W (+E espelho); Tamer S, N, W, E | personagem | lista de `dirFrames` |
| I-08 | Quadros mínimos: idle ≥ 1, walk ≥ 2 por direção (4 recomendado), attack ≥ 3, hurt ≥ 1; `combatStates` mapeados | personagem | leitura do manifesto |
| I-09 | Tile exatamente 32×32, sem costura; tileset de transição no formato Wang de canto | tile | (auto) tamanho; inspeção da costura 3×3 |
| I-10 | Folha + `atlas.json` JSON Hash (ou PNG por `atlasKey`) com chaves que batem com o manifesto | personagem | (auto) `buildCreatureCatalog` não descarta o asset |
| I-11 | Manifesto válido (`creature.json`/`tamer.json`/`.tmj` + `.aliases`) e ids GS-003 preservados | todos | `tsc` + testes + `map:validate` passam |
| I-12 | `license.json` com classe ADR-015 (1)/(2)/(3), fonte (obra, episódio e minuto quando for anime; URL) e camada (`official-fan-use`/`reference`/própria) | todos | leitura |
| I-13 | Densidade de pixel igual à do restante da cena | todos | comparação lado a lado com Tamer v13 e o rip DS na mesma captura |
| I-14 | Tratamento de cor coerente com a cena: mesmo filtro (cartoon assado ou nenhum) e paleta medida contra Endesga-32 **e** v13/v15 | todos | (auto) % por paleta; decisão de filtro registrada |
| I-15 | Mapa: colisão, mato, água, inícios e portal marcados; `map:validate` passa; Y-sort correto | mapa | `map:validate` + captura no jogo |
| I-16 | Carrega no jogo sem placeholder (`packSummary`: 0 chaves faltando) e sem erro no console | todos | captura + console da URL de teste |

**Veredito do portão:** **PASSOU** (todos os itens aplicáveis = sim) ou **FALHOU**, com a lista exata dos itens que falharam. Um asset com o portão **FALHOU** fica reprovado para integração, independentemente da nota ponderada do §1 — mas a nota do §1 continua sendo registrada (não é zerada), porque mede qualidade visual, não importabilidade.

**Se o script automático M3** (proposto em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6, **ainda não implementado**) não existir no momento da avaliação, os itens marcados "(auto)" dependem de inspeção manual do `game-qa`, com risco de erro humano maior que um script determinístico — registrar como limitação, não contornar.

---

## 3. Registro obrigatório de custo e retrabalho — sem peso na nota

**Correção do `game-studio`:** custo e retrabalho deixam de ter peso na média (eram 5% na Revisão 1) e passam a ser um **registro obrigatório separado**, porque o adendo do fundador pede "consumo real, retrabalho e qualidade final" como dados visíveis, não diluídos numa média que poderia esconder um asset caro atrás de uma nota boa (ou um asset barato atrás de uma nota ruim). A nota de qualidade (§1) e o custo (este §) são relatados **lado a lado**, nunca somados numa única nota.

| Campo do registro | O que anotar |
|---|---|
| Gerações PixelLab gastas no asset | `get_balance` antes/depois de cada rodada que produziu este asset especificamente |
| Horas humanas/agente | timestamps de início/fim de cada rodada, separando 1ª tentativa de retrabalho |
| Nº de rodadas até aprovar (ou até desistir) | contagem de rodadas reprovadas + a aprovada (se houver) |
| Comparação com a projeção | gerações/horas reais ÷ projeção de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §4.1 para o mesmo tipo de asset, em % (dentro / acima / abaixo) |
| Asset nunca aprovado | registrar o custo total mesmo assim (ele conta no custo do método, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §3: "assets reprovados e descartados contam no custo total, não no denominador") — sem calcular "custo por aprovado", que não existe nesse caso |

**Leitura calibrada (caso real):** Guilmon 64px, 3 rodadas, 18,2 gerações, **nunca aprovado** (QA 4–6/10 nas 3 rodadas) — este registro mostra 18,2 gerações gastas, 3 rodadas, 0 asset aprovado; não é "nota de custo baixa", é um alerta de retrabalho sem resultado, a ser lido junto com a nota de qualidade (que já reprovou o asset nos 3 critérios do §1 relevantes).

Este registro alimenta diretamente os limiares L1, L2 e L5 de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §7 (custo por asset aprovado, taxa de aprovação em ≤2 rodadas, saldo restante) — a decisão de continuidade do PixelLab usa este registro, não uma nota.

---

## 4. Falhas bloqueantes (impeditivos) — reprovam o asset independentemente da nota ponderada

A média ponderada **não compensa** nenhuma das falhas abaixo. Um asset com qualquer uma destas marcado **REPROVADO**, mesmo que a nota ponderada calculada chegue a 8,0+ e o portão técnico (§2) tenha passado.

### 4.1 Fidelidade e identidade
1. **Espécie irreconhecível ou errada** — confundida com outra espécie, inclusive dentro da mesma linha evolutiva ou com a armadilha já catalogada no contexto comum §3.8 (ex.: Drimogemon × Digmon).
2. **Contorno do sprite oficial de Digimon alterado ou redesenhado sem autorização** — o Style Bible (`DIGIMON_STYLE_GUIDE.md` §1 regra 1, §4) trava o contorno nativo do rip oficial como regra dura; um stroke genérico aplicado por cima é falha crítica **[E, Style Bible]**, salvo decisão específica do fundador sobre essa regra (ver conflito aberto §8 desta rubrica).

### 4.2 Transparência e grade de pixel
3. **Fundo não transparente** — alfa ≠ 0 no fundo, cor de chroma residual, ou halo (0 < alfa < 255) na borda que compromete a leitura sobre o cenário.
4. **Grade de pixel falsa** — ilustração reamostrada ou borrada em vez de pixel art real 1:1 (ver §1.1, banda 0–3); detectável por blocos de ampliação N×N idênticos (N≥2) ou por antialiasing sistemático na borda.

### 4.3 Escala e consistência de quadros
5. **Escala fora da faixa do estudo** — altura de conteúdo fora da faixa registrada em `ESTUDO_ESCALA_DIGIMONS.md` §3 para o estágio correspondente, sem justificativa registrada e sem ser parte deliberada do teste de escala do briefing (§2.3 de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` permite variação **registrada**; o que reprova é a variação **não registrada** ou sem relação com nenhuma das hipóteses em jogo).
6. **Quadros inconsistentes entre si** — variação de altura/bounding box acima de ±5% entre quadros do mesmo ciclo (critério L4 já usado em produção real), ou cor/proporção "derivando" visivelmente quadro a quadro (fraqueza documentada do Método A).
7. **Pivô fora do pé ou Y-sort quebrado** — pivô não corresponde à linha opaca mais baixa (pé), ou o Tamer passa por cima de um tronco/objeto que deveria ocluí-lo (regra R3 do motor).

### 4.4 Mapa
8. **Trilha marrom no mapa** — contraria a decisão do fundador de 12/11 (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 §1: "chão todo verde, caminho formado por maciços de árvore, sem trilha marrom"); qualquer caminho pintado como textura de terra marrom reprova o mapa-piloto, independentemente da nota de composição.
9. **Digimon forte (adult/ultimate) fora da área de exibição designada** — vagando livremente nas zonas S, T ou C do layout-brief (critério 2 de `ESTUDO_REGIOES_E_MAPA_PILOTO.md` §10), em vez de confinado às zonas R/Z como exibição ou chefe.

### 4.5 Rastreabilidade (ADR-015)
10. **Falta de fonte ou classificação ADR-015 quando houver extração ou recriação** — qualquer asset que use frame/imagem extraída do anime, ou que recrie um local/estrutura reconhecível (classes (1) ou (2) do ADR-015), sem registrar (a) a classificação (1)/(2)/(3), (b) a fonte (obra, episódio e minuto quando houver, + URL) e (c) a camada (`official-fan-use`/`reference`) com crédito — condições do ADR-015 "Extração de material do anime", não opcionais quando a extração é usada.

### 4.6 Conduta e integração (regras permanentes do AGENTS.md do game-qa)
11. **Texto de desenvolvimento, gancho de depuração ou imagem de QA visível ao jogador** dentro do próprio asset entregue (ex.: watermark, texto de teste, placeholder "TODO").
12. **Integração que quebra o jogo** — I-16 do portão técnico (não carrega sem placeholder, ou gera erro de console) falhando é tratado como bloqueante aqui também, não só como reprovação do portão (§2), porque significa que o asset não funciona no jogo, não que funciona mal.

---

## 5. Regras de nota mínima

### 5.1 Regras gerais

1. **Média ponderada mínima: 8,0** sobre os 5 critérios do §1 (pesos do `COMANDO_ETAPA6_C1.md` §7; ADR-015 "a nota mínima de homologação visual continua 8/10").
2. **Nenhum dos 5 critérios pode ficar abaixo de 7**, mesmo que a média ponderada alcance 8,0 — um critério em 6 ou menos reprova o asset mesmo com os outros 4 compensando a média.
3. O **portão técnico (§2)** precisa ter passado (todos os itens aplicáveis = sim). Falhar o portão reprova a integração do asset, **independentemente** da nota ponderada.
4. Qualquer **falha bloqueante do §4** reprova **independentemente** de tudo acima.
5. O **registro de custo e retrabalho (§3)** não tem nota mínima própria — é informativo, lido junto com o veredito, não um gate adicional.

### 5.2 Regra de renormalização para assets isolados (sem mapa)

Quando um dos 5 critérios do §1 **não se aplica** ao tipo de asset avaliado (o caso mais comum: um sprite isolado de Digimon/Tamer/NPC, sem contexto de mapa — exatamente o caso dos 4 assets da Fase 0, `INVENTARIO_ASSETS_CHATGPT.md`), esse critério é marcado **N/A** e seu peso é **redistribuído proporcionalmente** entre os critérios restantes, mantendo a proporção relativa entre eles.

**Fórmula:** novo_peso(i) = peso_original(i) ÷ (100% − soma dos pesos marcados N/A).

**Caso concreto — asset isolado sem mapa** (critério "Beleza e exploração dos mapas", 35%, marcado N/A; restam 65%):

| Critério | Peso original | Peso renormalizado (sem mapa) |
|---|---|---|
| Fidelidade e beleza dos Digimon | 35% | 35 ÷ 65 = **53,8%** |
| Beleza e exploração dos mapas | 35% | **N/A** |
| Animações e imersão | 15% | 15 ÷ 65 = **23,1%** |
| Escala e consistência | 10% | 10 ÷ 65 = **15,4%** |
| Integração com a UI | 5% | 5 ÷ 65 = **7,7%** |

**Regra de registro:** a ficha de avaliação (§6.2) deve declarar explicitamente quais critérios foram marcados N/A e os pesos renormalizados usados — nunca aplicar o peso original de um critério N/A como zero dentro da mesma soma de 100% (isso puniria o asset isolado por não ter mapa, em vez de só não avaliar o que não existe).

**Nota:** "Animações e imersão" **não** segue esta regra de N/A total — mesmo sem animação, a parte "imersão" (atmosfera/profundidade da pose única) é avaliável; ver §1.3. Só é marcado N/A quando **nenhuma** das duas metades tiver evidência para avaliar (ex.: um recorte de tileset sem personagem nenhum em cena).

### 5.3 Mapa-piloto: nota ponderada + os 10 critérios do layout-brief

O mapa-piloto é avaliado **pelos 5 critérios ponderados do §1** (sem a renormalização do §5.2, porque o critério de mapas se aplica em cheio) **e também** pelos 10 critérios verificáveis do layout-brief abaixo — são critérios **adicionais**, já embutidos na banda de nota do critério "Beleza e exploração dos mapas" (§1.2), mas também relatados linha a linha na ficha (§6.2). Um mapa-piloto só é aprovado se **(a)** cumprir a nota mínima do §5.1 **e (b)** passar nos 10 critérios do layout-brief. Falhar qualquer um dos 10 é um achado de composição a registrar (não necessariamente bloqueante por si só, exceto os itens 2 e 9, que já correspondem às falhas bloqueantes §4.4/§4.9 desta rubrica).

### 5.4 Os 10 critérios do layout-brief, por referência (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` §10)

1. Caminho contínuo de tiles abertos ligando entrada (S) ao santuário (Z), sem exigir atravessar mato denso.
2. Nenhum spawn de criatura adult/ultimate nas zonas S, T ou C (= falha bloqueante §4.9 desta rubrica).
3. Pelo menos 2 pontos de descoberta (B1, B2) acessíveis só por ramal secundário.
4. Pelo menos 1 elemento de descanso/orientação na trilha antes da mata densa.
5. Mata densa (M) com pelo menos 3 variantes de árvore e 2 de mato.
6. Pelo menos 1 feature de desnível/elevação visível na moldura do mapa.
7. Densidade de vegetação por zona dentro de ±5 p.p. da tabela do layout-brief §6.
8. Nenhum sprite de Tamer/Digimon mais de 50% ocluso por vegetação, amostrado em ≥5 pontos do percurso.
9. Corredor principal nunca com menos de 2 tiles de largura, nem largura constante de exatamente 2 tiles em toda a extensão.
10. Contraste visual perceptível entre o piso do corredor/clareira e o piso sob zonas de mato denso.

---

## 6. Processo de avaliação

### 6.1 Quem avalia

| Papel | Quem | Conta para a nota final? |
|---|---|---|
| **Autoavaliação** | O próprio agente/pipeline que produziu o asset (`game-art` nos métodos A/B/C; quem entregou o asset na Fase 0) | **Não.** Serve só de registro interno do produtor; nunca é usada como nota de homologação. |
| **Revisão independente** | `game-qa` sempre. Quando o autor **não** for o `game-art` (ex.: um asset produzido inteiramente por `game-dev`/`game-studio` em algum teste técnico), a revisão soma também o `game-art`, porque a regra "ninguém aprova o próprio trabalho" (contexto comum §8) exige um segundo avaliador independente de craft visual além do QA técnico-funcional. **Para a Fase 0 especificamente** (`INVENTARIO_ASSETS_CHATGPT.md` §1 "Dono"): o `game-art` avalia primeiro (ficha completa do §6.2); o `game-qa` revisa depois, sem ser quem produz a primeira nota. | **Sim.** |
| **Homologação final** | O fundador. Sempre. Nenhuma nota de QA ou de game-art, por si só, aprova um asset para produção em massa ou para entrar no jogo. | **Decide, não calcula.** A homologação final pode divergir da nota calculada (ex.: aprovar com ressalva registrada), mas isso é decisão do fundador, não recálculo automático da rubrica. |

### 6.2 Ficha de avaliação (planilha/modelo preenchível)

Uma ficha por asset avaliado. Reaproveita e cobre todos os campos já definidos em `INVENTARIO_ASSETS_CHATGPT.md` §3 para a Fase 0 (evita dois formulários incompatíveis para o mesmo tipo de julgamento) e soma a nota ponderada dos 5 critérios desta rubrica, o portão técnico e o registro de custo.

| Campo | Valor | Cobre o campo equivalente do `INVENTARIO_ASSETS_CHATGPT.md` §3? |
|---|---|---|
| ID da avaliação | `QA-NNN` (ou `F0-NNN` na Fase 0, reaproveitando o ID do inventário) | "ID do recebimento" |
| Asset avaliado | tipo (sprite/animação/tile/prop/mapa) + espécie/nome | "Espécie e identificação" |
| Arquivo | caminho + md5 + data | "Arquivo original" |
| Origem e versão | ChatGPT/PixelLab/rip DS/à mão + versão ou data, método (A/B/C) ou "Fase 0" | "Origem e versão" |
| Classificação ADR-015 | (1)/(2)/(3) + (4) fonte e risco | "Classificação ADR-015" |
| Resolução, dimensões e grade de pixel | px reais; pixel art real (grade limpa) ou ilustração com aparência de pixel? | "Resolução e dimensões" |
| Transparência | sim / não / parcial (halo, fundo branco) | "Transparência" |
| Avaliador | nome do agente + papel (autoavaliação / revisão independente / homologação) | (novo, não existia no inventário) |
| Critério 1 — Fidelidade e beleza dos Digimon (35%, ou renormalizado) | nota 0–10 + evidência (§1.1) | "Fidelidade visual" + "Qualidade artística" (os dois, fundidos neste critério) |
| Critério 2 — Beleza e exploração dos mapas (35%, ou N/A) | nota 0–10 ou N/A + evidência (§1.2) | (novo; cobre o aspecto de mapa que o inventário não tinha, por tratar de asset isolado) |
| Critério 3 — Animações e imersão (15%, ou renormalizado) | nota 0–10 + evidência (§1.3) | "Possibilidade de animação" (pose única / várias poses / quadros consistentes) |
| Critério 4 — Escala e consistência (10%, ou renormalizado) | nota 0–10 + evidência (§1.4) | "Consistência com a identidade proposta" (contorno, paleta, sombreamento, escala relativa) |
| Critério 5 — Integração com a UI (5%, ou renormalizado) | nota 0–10 + evidência (§1.5) | (novo, não existia no inventário) |
| Pesos usados nesta ficha | lista dos 5 pesos efetivos (originais ou renormalizados pelo §5.2), com os critérios N/A explícitos | — |
| Média ponderada | soma(nota × peso efetivo) | — |
| Portão técnico (I-01..I-16) | PASSOU / FALHOU + lista dos itens que falharam (§2) | "Trabalho para integração" (horas estimadas) — o portão formaliza o que o inventário só estimava em texto |
| Custo e retrabalho (sem peso) | registro do §3: gerações, horas, nº de rodadas, % vs. projeção | "Trabalho para integração" (estimativa em horas) |
| Falhas bloqueantes (§4) | lista dos itens 1–12 que se aplicam, sim/não cada | — |
| Critérios do layout-brief (só mapa) | 10 itens de §5.4, sim/não/parcial cada | — |
| **Veredito desta avaliação** | **Fase 0:** usar exatamente os 3 valores de `INVENTARIO_ASSETS_CHATGPT.md` §3 — *candidato aproveitável* / *precisa de retrabalho* / *descartado*, **nunca "aprovado"** (regra explícita do inventário, "nunca 'aprovado' nesta fase"). **A/B/C (rodada de laboratório):** *aprovado* / *reprovado* / *aprovado com ressalva* — **nunca "homologado"** nesta linha, em nenhum dos dois casos. | "Veredito" |
| Limitações desta avaliação | o que não pôde ser verificado e por quê | — |

**Checagem explícita pedida pelo `game-studio`:** todos os campos de `INVENTARIO_ASSETS_CHATGPT.md` §3 têm equivalente nesta ficha (coluna da direita, acima) — nenhum campo do inventário ficou sem cobertura. Os únicos ajustes necessários foram (a) separar "fidelidade visual" e "qualidade artística" do inventário dentro do critério 1 desta rubrica (que já funde os dois, por decisão do `COMANDO_ETAPA6_C1.md` §7) e (b) manter o conjunto de veredito próprio da Fase 0 (nunca "aprovado") em vez do conjunto da comparação A/B/C.

### 6.3 Como registrar divergência entre avaliadores

1. Cada avaliador independente (`game-qa`, e `game-art` quando aplicável) preenche sua própria ficha, sem ver a nota do outro antes de terminar a sua.
2. Se as notas finais de dois avaliadores independentes diferirem em **mais de 1,0 ponto na média ponderada**, ou se um marcar uma falha bloqueante/portão técnico que o outro não marcou, a divergência é registrada — **nunca tirada a média automaticamente**.
3. O registro de divergência deve conter: as duas notas/vereditos completos, a justificativa de cada avaliador por critério onde houver diferença, e a identificação de qual critério concentra a discordância.
4. A divergência registrada vai para o `game-studio` consolidar e para o fundador decidir na homologação — resolver a divergência escolhendo uma nota não é atribuição de nenhum avaliador isolado.

---

## 7. Como manter separados os resultados

1. **Fase 0 (reaproveitamento dos assets do ChatGPT, `INVENTARIO_ASSETS_CHATGPT.md`)** é avaliada com esta mesma rubrica (os 5 critérios, o portão técnico, o registro de custo, os mesmos impeditivos, a mesma nota mínima — com a renormalização do §5.2, porque são sprites isolados sem mapa), mas o resultado **fica em sua própria ficha e seu próprio registro** — nunca somado ou misturado ao resultado da comparação controlada A/B/C. Fase 0 responde "este asset específico que já existe serve?"; a comparação A/B/C responde "qual método produz melhor, dado o mesmo briefing?". São perguntas diferentes.
2. **Material já recebido na Fase 0** (`INVENTARIO_ASSETS_CHATGPT.md` §4, atualizado pelo `game-studio`): 4 folhas do ChatGPT — Guilmon, ExVeemon, Agumon, Gabumon. **Esta rubrica não avalia nenhuma delas agora** — a ordem é `game-art` avalia primeiro (ficha completa do §6.2), `game-qa` revisa depois (§6.1), nunca o inverso.
3. **A comparação controlada A/B/C** usa sempre o mesmo briefing (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §2: Tamer de referência + Koromon + Agumon + WarGreymon + recorte ~12×10 tiles da floresta-piloto). Resultado de um método só entra na comparação se tiver sido de fato produzido e avaliado por esta rubrica — nunca por analogia ou estimativa.
4. **O Método A não pode ser ranqueado antes de ser avaliado.** Ecoando `INVENTARIO_ASSETS_CHATGPT.md` §5 ("O Método A não é classificado como melhor nem pior antes de os resultados serem recebidos e avaliados") e o próprio estado real documentado em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` (Método A e C nunca foram executados nesta conta/projeto): até que existam assets reais do Método A/C avaliados por esta rubrica, qualquer tabela comparativa final deve mostrar o Método B com nota real e os Métodos A/C como **"sem execução — não avaliado"**, nunca com uma nota estimada ou inferida da documentação de domínio.
5. Uma mesma espécie (ex.: Agumon) pode ter avaliações em mais de uma categoria (Fase 0, se houver um Agumon do ChatGPT recebido — e há, `INVENTARIO_ASSETS_CHATGPT.md` §4; A/B/C se produzido nos 3 métodos) — cada uma é uma ficha própria, com seu próprio ID, nunca consolidada numa "nota final do Agumon" única.

---

## 8. Conflitos visuais abertos da Etapa 6 — como entram nesta rubrica (não resolvidos aqui)

Esta rubrica **não decide** nenhum dos 5 conflitos abertos (`DIGITAL_ODYSSEY_CONTEXT.md` §4). Cada um entra como variável a observar, com evidência, nos critérios acima:

| Conflito aberto | Onde entra nesta rubrica | Como é registrado, sem decidir |
|---|---|---|
| **1. Endesga-32 × referências posteriores** | Critério 4 — Escala e consistência (§1.4), parte "coerência visual" | Medir e relatar **% de pixels dentro de cada uma das duas paletas** (Endesga-32 e a referência v13/v15, 0% hoje) para todo asset de cenário, sempre as duas, nunca escolher uma como meta antes de o fundador decidir (G-1 de `ETAPA2_HOMOLOGACAO.md`). |
| **2. Escala Tamer/Digimon** | Critério 1 (Fidelidade e beleza dos Digimon, parte proporção) e Critério 4 (Escala e consistência); falha bloqueante §4.3 item 5 | Registrar a altura de conteúdo real que cada método/asset produziu, comparada à tabela de `ESTUDO_ESCALA_DIGIMONS.md` §3, **sem forçar** um valor-alvo antes da decisão do fundador; a falha bloqueante só dispara se a variação não tiver relação com nenhuma hipótese em teste (E1–E4) nem for registrada como escolha deliberada do produtor. |
| **3. Critério unificado de qualidade** | Todo o documento | Esta própria rubrica **é** a tentativa de critério unificado para a Etapa 6 — mas ela mesma é só proposta até a homologação do fundador (§6.1); até lá, continua valendo também a dupla régua do Style Bible × referência aprovada que `qa/ETAPA2_HOMOLOGACAO.md` já usa (AGENTS.md §5: "duas réguas visuais enquanto G-1 não for decidido"). Esta rubrica reporta a nota pelos 5 critérios acima; quando o Style Bible tiver um item equivalente e divergente (ex.: contorno, §4.1 item 2 desta rubrica), as duas leituras são registradas, não fundidas. |
| **4. Densidade e composição dos mapas** | Critério 2 — Beleza e exploração dos mapas (§1.2), e os 10 critérios do layout-brief (§5.4, itens 5, 7, 9) | Medir densidade por zona (item 7) e variedade de variantes (item 5) contra os números do layout-brief, sem definir aqui qual densidade "é a certa" para o jogo de produção — o layout-brief já é só do mapa de teste do laboratório, não do padrão final. |
| **5. Convenções da Database relevantes para sprites** | Critério 1 (Fidelidade e beleza dos Digimon) e ficha de avaliação (campo "classificação ADR-015") | Ao conferir fidelidade de espécie, usar a convenção de estágio normalizada JP da Database (contexto comum §3.1) e checar nome/estágio/atributo do asset contra a Database — nunca contra uma convenção EN/JP misturada; qualquer divergência de convenção encontrada durante a avaliação é **registrada como achado**, não corrigida pelo `game-qa` (que não decide convenção de nome, decisão pendente D2 da Etapa 4). |

---

## 9. Legenda e limitações desta entrega

- **[E]** = baseado em documento com caminho citado. **[H]** = hipótese ou extrapolação deste agente, sinalizada no texto onde ocorre.
- Nenhum asset foi avaliado nesta entrega — não há "aplicação" real desta rubrica para reportar ainda; as âncoras de nota 4/6 em alguns critérios foram calibradas contra notas **reais** já registradas em `qa/ETAPA2_HOMOLOGACAO.md` (Etapa 2, auditoria do jogo completo, não de asset isolado) — é a melhor calibração disponível, mas é uma transposição de escala (jogo completo → asset único), registrada como tal.
- O script automático M3 (checklist I-01..I-16 em JSON/MD, proposto por `game-dev` em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6) **não existe ainda**; até ser implementado, os itens "(auto)" do portão técnico (§2) dependem de inspeção manual do `game-qa`, com risco de erro humano maior que um script determinístico — registrado como limitação, não contornado.
- O registro de custo (§3) não define um valor numérico de "custo humano = X gerações": mantém as duas unidades separadas, como já fazia `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §3, porque inventar uma taxa de conversão seria dado não verificado.
- **Correção aplicada nesta Revisão 2:** a Revisão 1 havia usado um conjunto de critérios/pesos recebido como parte do brief, não autorizado pelo fundador; o `game-studio` corrigiu isso na mesma data e esta revisão reconstrói a rubrica sobre a tabela correta do `COMANDO_ETAPA6_C1.md` §7, sem perder o conteúdo técnico já levantado (fidelidade, craft, checklist, custo) — só reorganizado.
- **Material da Fase 0 já recebido** (4 folhas do ChatGPT: Guilmon, ExVeemon, Agumon, Gabumon, `INVENTARIO_ASSETS_CHATGPT.md` §4) **não foi avaliado por este agente nesta entrega**, por instrução explícita: o `game-art` avalia primeiro, o `game-qa` revisa depois. Esta entrega só confirma que a ficha do §6.2 cobre os campos do inventário (checagem feita em §6.2, nota de rodapé da tabela).
- Nenhum agente foi acionado para esta entrega. Nenhuma geração no PixelLab. Nenhum código, sprite, mapa, Database ou configuração foi alterado.
