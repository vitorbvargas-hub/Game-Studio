# AJUSTES_RUBRICA_VISUAL_V1 — Etapa 6, Comando 2, passo 2 de 5

- **Arquivo novo.** Esta seção é do `game-design`. O `game-qa` completa depois (passo 4 da sequência), revisando/ajustando o que estiver abaixo e acrescentando sua própria seção.
- **Base:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §4 ("separar três dimensões... reconciliar a rubrica para distinguir critérios bloqueantes dos critérios graduados... preservar a exigência de qualidade mínima 8/10 e a aprovação final do fundador"); `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 (não substituída — esta seção **refina** o critério 1.2 "Beleza e exploração dos mapas" nas 3 dimensões que o comando pede, sem reabrir os outros 4 critérios ponderados nem o portão técnico); `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 (layout-brief, §6 densidade, §7 legibilidade, §10 os 10 critérios); `COMPARATIVO_ESCALAS_E1_E5.md` §7 (requisitos de porte escritos nesta mesma tarefa, usados onde a composição do mapa precisa deles).
- **Regra respeitada:** nenhuma geração PixelLab, nenhum código/mapa/sprite/Database alterado, nenhum outro agente acionado. Nenhuma hipótese de escala ou composição é aprovada aqui — só critérios de avaliação.

## 0. Como esta seção se relaciona com a rubrica existente

O `COMANDO_ETAPA6_C1.md` §7 (fundador) já define "Beleza e exploração dos mapas" como um dos 5 critérios ponderados (peso 35%) da `RUBRICA_QUALIDADE_VISUAL_V1.md`. O `COMANDO_ETAPA6_C2` §4 pede para **separar** esse julgamento em 3 dimensões mensuráveis distintas, porque hoje elas estão misturadas numa única banda de nota (§1.2 da rubrica). Esta seção não cria um 6º critério nem muda os pesos do fundador — ela **decompõe** o critério 2 (Beleza e exploração dos mapas) em uma checklist detalhada por dimensão, que o avaliador preenche antes de calcular a nota 0–10 daquele critério. A nota final do critério 2 continua sendo uma só, calculada a partir de quantos itens (bloqueantes e graduados) cada dimensão cumpre — método de cálculo proposto no §4 abaixo.

As dimensões 1 e 2 têm evidência mensurável agora (mapa estático, sem jogo rodando). A dimensão 3 depende de playtest real, que não existe ainda nesta etapa — por isso ela é entregue como **roteiro de teste proposto**, não como avaliação executável hoje.

## 1. Dimensão 1 — Arte e tilesets (recorte de ~12×10 tiles)

**O que se mede neste recorte:** o craft de pixel art do tileset, dos props de cenário e das transições de terreno, isolado da composição do layout inteiro — um recorte pequeno permite inspecionar grade de pixel, costura e variedade de variante sem a distração da navegação completa. É o mesmo recorte que o `game-art` já usa em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §2.2 para comparar os 3 métodos de produção, reaproveitado aqui como unidade de medida da dimensão 1.

| # | Critério | Tipo | Como medir | Por quê |
|---|---|---|---|---|
| 1.1 | Grade de pixel real 1:1, sem bloco de ampliação (N≥2) nem reamostragem | **BLOQUEANTE** | Detecção de blocos repetidos (item I-03 do portão técnico da rubrica) a 300–800% | Pixel art falsa (ilustração reamostrada) já é falha bloqueante §4.2 da rubrica; reafirmado aqui porque o recorte é onde essa falha é mais fácil de confirmar visualmente |
| 1.2 | Tile no tamanho definido (32 px, salvo decisão futura de E5), sem costura visível entre tiles adjacentes | **BLOQUEANTE** | Inspeção da grade 3×3 nas bordas do recorte; corresponde a I-09 do portão técnico | Uma costura visível quebra a ilusão de terreno contínuo em qualquer composição maior — não é um defeito "pequeno", é estrutural |
| 1.3 | Transição de terreno (Wang/canto) sem artefato nem repetição óbvia de padrão no recorte | **BLOQUEANTE** se a costura entre dois terrenos for visível | Comparação lado a lado da borda entre dois terrenos | Risco técnico já registrado (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.7: misturar fontes de terreno) |
| 1.4 | Variedade de variantes de tile/prop dentro do recorte (≥3 árvores, ≥2 mato, por zona densa) | GRADUADO 0–10 | Contagem de variantes distintas (não apenas rotações/espelhos da mesma arte) no recorte | Mede diretamente o problema "pomar" já identificado na Etapa 2 item 6 ("poucas espécies de árvore/mato repetidas") |
| 1.5 | Contorno e paleta consistentes dentro do próprio recorte (antes de medir coerência no mapa inteiro) | GRADUADO 0–10 | Inspeção a 300%: mesmo tipo de contorno (rígido/macio), mesma faixa de saturação entre tileset e props do recorte | Detecta cedo um choque de fonte (Style Bible × PixelLab × DS) antes de escalar para o mapa inteiro, onde o erro fica mais caro de corrigir |
| 1.6 | Sombra de contato presente e ancorada nos props do recorte | GRADUADO 0–10 | Inspeção visual: sombra elíptica sob a base de cada prop vertical (árvore, rocha) | Contribui para a sensação de profundidade mesmo num recorte pequeno — pré-requisito local do critério "Animações e imersão" da rubrica |
| 1.7 | Densidade de pixel do recorte igual à do elenco de personagens testado nele | **BLOQUEANTE** | Comparação direta (mesma captura) entre a escala do tileset e a escala de Tamer/Digimon do briefing único | Corresponde a I-13 do portão técnico; sem isso, nenhuma leitura de escala (Tarefa 1 desta mesma entrega) é válida — o recorte serviria para medir um cenário que não bate com os personagens |

## 2. Dimensão 2 — Composição e exploração no layout completo (40×30)

Reaproveita e refina os 10 critérios verificáveis já escritos no layout-brief (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 §10), classificando cada um como bloqueante ou graduado — o layout-brief original não fazia essa distinção explícita — e acrescenta 2 critérios novos (2.11, 2.12) exigidos pela interação com a escala por espécie (Tarefa 1, `COMPARATIVO_ESCALAS_E1_E5.md` §7).

| # | Critério (origem: layout-brief §10, item N) | Tipo | Justificativa em 1 linha |
|---|---|---|---|
| 2.1 | Caminho contínuo de tiles abertos ligando entrada (S) ao santuário (Z), sem exigir atravessar mato denso (item 1) | **BLOQUEANTE** | Sem isso o mapa é injogável — não é uma questão de qualidade, é de função |
| 2.2 | Nenhum spawn de criatura adult/ultimate nas zonas S, T ou C (item 2) | **BLOQUEANTE** | Já é falha bloqueante §4.4 item 9 da rubrica; resolve G2 diretamente, não admite gradação |
| 2.3 | Pelo menos 2 pontos de descoberta (B1, B2) acessíveis só por ramal secundário (item 3) | GRADUADO 0–10 | É recompensa de exploração — a ausência empobrece o mapa, mas não o torna injogável |
| 2.4 | Pelo menos 1 elemento de descanso/orientação na trilha antes da mata densa (item 4) | GRADUADO 0–10 | Melhora a experiência (resolve G4), mas um mapa sem isso ainda é navegável |
| 2.5 | Mata densa (M) com pelo menos 3 variantes de árvore e 2 de mato (item 5) | GRADUADO 0–10 | Mede repetição em escala de mapa inteiro — correlaciona com 1.4, mas é uma medição diferente (mapa inteiro vs. recorte local) |
| 2.6 | Pelo menos 1 feature de desnível/elevação visível na moldura do mapa (item 6) | GRADUADO 0–10 | Enriquece a composição (resolve o item 8 da auditoria da Etapa 2), mas a navegação funciona sem desnível |
| 2.7 | Densidade de vegetação por zona dentro de ±5 p.p. da tabela do layout-brief §6 (item 7) | GRADUADO 0–10 | Desvio pequeno não quebra a experiência; desvio grande (ex.: mata densa virar zona segura) é capturado por outros critérios (2.1, 2.9) |
| 2.8 | Nenhum sprite de Tamer/Digimon mais de 50% ocluso por vegetação, amostrado em ≥5 pontos do percurso (item 8) | **BLOQUEANTE** | Requisito direto do combate-no-mapa (ADR-009): se o jogador não vê o que acontece, a regra "a animação nunca decide o resultado" fica sem como ser verificada pelo próprio jogador |
| 2.9 | Corredor principal nunca com menos de 2 tiles de largura, nem largura constante de exatamente 2 tiles em toda a extensão (item 9) | GRADUADO 0–10 | Um estreitamento pontual não impede a progressão (diferente de 2.1); é um defeito de composição ("padrão K/J"), não de função |
| 2.10 | Contraste visual perceptível entre o piso do corredor/clareira e o piso sob zonas de mato denso (item 10) | GRADUADO 0–10 | Qualitativo e dependente do conflito de paleta ainda aberto (Endesga-32 × referência); não pode ser bloqueante enquanto esse conflito não for resolvido pelo fundador |
| 2.11 | **[NOVO]** Digimon de porte Grande/Gigante na zona de exibição (R) legível à distância de entrada na zona, sem corte pela moldura da câmera | GRADUADO 0–10 | Decorre diretamente do requisito de design da Tarefa 1 (`COMPARATIVO_ESCALAS_E1_E5.md` §7.6): uma classe de porte maior só cumpre a função de marco de progressão se for vista com nitidez no ponto em que o layout a expõe |
| 2.12 | **[NOVO]** Hierarquia de escala (Baby < Child < Tamer ≤ porte maior) permanece coerente dentro do layout completo, não só em prancha isolada | GRADUADO 0–10 | As pranchas E1–E4 testam a hierarquia fora de contexto de mapa; este critério garante que a composição final (vegetação, zonas, distância de câmera) não desfaça essa hierarquia por oclusão ou perspectiva |

## 3. Dimensão 3 — Experiência real de navegação (roteiro proposto, a testar depois em jogo)

**Por que é só um roteiro aqui:** esta dimensão não tem como ser avaliada sobre um mapa estático ou uma prancha — exige um mapa jogável e um jogador real (ou subagente de playtest) percorrendo-o. O comando pede o roteiro e as métricas agora; a execução fica para quando houver um mapa integrado para testar (fora do escopo desta tarefa, que proíbe scripts de integração).

### 3.1 Roteiro de teste proposto [H]

1. O testador inicia na zona S (entrada), sem receber instrução prévia sobre o layout do mapa.
2. Percorre livremente até alcançar o santuário (Z), sem limite de tempo imposto.
3. Observador registra, sem intervir: tempo decorrido em cada ponto de decisão (bifurcação), hesitações, retrocessos, e se os bolsões B1/B2 são descobertos sem dica.
4. Ao final do percurso, pergunta dirigida (não um questionário longo): "qual Digimon pareceu mais forte, e por quê?"; "em algum momento você perdeu de vista seu próprio personagem?"; "algum trecho pareceu um beco sem saída?".
5. Repetir com múltiplos testadores (mínimo recomendado [H]: 3) antes de tirar conclusão — um único percurso não distingue problema de layout de hábito do testador.

### 3.2 Métricas propostas [H]

| # | Métrica | Meta proposta [H] | Tipo | Observação |
|---|---|---|---|---|
| 3.1 | Tempo até o 1º POI (clareira de descanso, C) | Sem meta numérica fixa ainda — a primeira rodada de teste estabelece a linha de base; meta é registrar e comparar entre métodos/revisões, não aprovar/reprovar por um número absoluto na primeira medição | GRADUADO (registro comparativo) | Depende do tamanho real do corredor T→C, que varia por composição |
| 3.2 | Nº de becos sem saída / retrocessos não intencionais no caminho principal | Meta: 0 no caminho principal (B1/B2 não contam — são descoberta deliberada, não erro de leitura) | **BLOQUEANTE se >0** no caminho principal (S→T→C→M→R→Z) | Um retrocesso não intencional indica falha de legibilidade de caminho (choca com 2.1) |
| 3.3 | Hesitações em pontos de decisão (parar/olhar ao redor >2 s) | Meta: ≤1 hesitação por testador em todo o percurso | GRADUADO 0–10 (quanto menos hesitação, nota mais alta) | Hesitação pontual é normal; hesitação recorrente indica contraste caminho×mato insuficiente (relaciona com 2.10) |
| 3.4 | Taxa de descoberta espontânea dos bolsões B1/B2 (sem dica) | Meta: ao menos 1 dos 2 descoberto espontaneamente por ≥50% dos testadores | GRADUADO 0–10 | Mede se a "descoberta por curiosidade" funciona como pretendido (layout-brief §5) |
| 3.5 | Percepção de porte/hierarquia (resposta à pergunta dirigida) | Meta: testador identifica corretamente o Digimon de maior porte na zona R como "o mais forte" | **BLOQUEANTE se a maioria errar** | Se a hierarquia visual pretendida (Tarefa 1) não é percebida pelo jogador, o objetivo de design falhou, independentemente da nota de arte |
| 3.6 | Oclusão percebida (perda de visão do próprio personagem) | Meta: 0 relatos de perda de visão | **BLOQUEANTE se ≥1 relato** | Equivale, do ponto de vista do jogador, ao critério técnico 2.8 — aqui medido por percepção, não por amostragem automática |
| 3.7 | Tempo total do percurso completo (S→Z) | Sem meta fixa na primeira rodada — registro de linha de base | GRADUADO (registro comparativo) | Útil para comparar revisões futuras do mesmo mapa, não para aprovar/reprovar isoladamente |

### 3.3 Por que a maioria dos itens desta dimensão é graduada, não bloqueante

Métricas de percepção humana (hesitação, tempo, taxa de descoberta) não têm um limiar objetivo "certo" sem uma linha de base própria do projeto — diferente das dimensões 1 e 2, que medem contra um padrão técnico fixo (pixel real, tamanho de tile) ou uma regra de jogo já decidida (G2, Y-sort). Por isso a maioria dos itens 3.1–3.7 é graduada ou de registro comparativo; só viram bloqueantes os dois casos em que a falha equivale diretamente a uma falha bloqueante já reconhecida em outra dimensão (retrocesso não intencional ≈ falha de 2.1; oclusão relatada ≈ falha de 2.8) ou a um objetivo central do próprio comando (hierarquia de porte não percebida, ligada à Tarefa 1).

## 4. Cálculo proposto da nota do critério "Beleza e exploração dos mapas" a partir das 3 dimensões [H]

Não há decisão tomada aqui sobre o peso relativo entre as 3 dimensões — proponho, como ponto de partida para o `game-qa` ajustar no passo 4:

1. **Qualquer item BLOQUEANTE falhado em qualquer dimensão reprova o critério inteiro** (nota não é calculada; o asset/mapa fica REPROVADO), igual à regra já existente na rubrica para os demais critérios (§5.1 item 4 de `RUBRICA_QUALIDADE_VISUAL_V1.md`).
2. Se nenhum bloqueante falhar, a nota do critério é a média simples dos itens GRADUADOS aplicáveis nas dimensões 1 e 2 (a dimensão 3 ainda não está executável — ver §3 — e por isso **não entra no cálculo numérico desta rodada**; quando houver playtest, ela passa a somar à média, com peso a decidir).
3. A **nota mínima de 8,0 ponderada** e a **ausência de qualquer critério principal abaixo de 7** (regras já fixadas em `RUBRICA_QUALIDADE_VISUAL_V1.md` §5.1) continuam valendo sem alteração — esta seção só detalha como chegar à nota do critério 2, não muda o piso de aprovação.
4. **A aprovação final continua sendo do fundador**, inclusive para decidir se aceita o cálculo proposto neste item 4 ou prefere outro método — nada aqui vira regra até o `game-studio`/fundador validar.

## 5. Limitações desta entrega

1. A dimensão 3 é só roteiro e métricas propostas — nenhum teste foi executado, porque não há mapa jogável integrado nesta etapa (regra do comando: nada de scripts de integração).
2. Os 2 critérios novos (2.11, 2.12) dependem de uma hipótese de escala/E5 ainda não decidida (Tarefa 1 desta mesma entrega) — são avaliáveis em princípio, mas sua régua exata (ex.: "distância de entrada na zona R" em tiles) só pode ser fixada depois que a E5 definir a classe de porte real a usar.
3. O método de cálculo do §4 é uma proposta [H] do `game-design` — **decidido pelo `game-qa` no passo 4, ver seção nova abaixo.**
4. Esta seção não reabre nem recalcula os outros 4 critérios ponderados da rubrica (Fidelidade e beleza dos Digimon, Animações e imersão, Escala e consistência, Integração com a UI) — o escopo do comando (§4) é só a avaliação de mapas.
5. Nenhum mapa, sprite, código ou configuração foi alterado; nenhuma geração PixelLab; nenhum outro agente acionado.

---

## 6. Revisão e ajustes do game-qa (passo 4 de 5)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-13.
- **Base:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §4 (reconciliar bloqueantes/graduados; preservar nota mínima 8/10 e aprovação do fundador) e §2 (separação A/B da Fase 0); `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 §4 (12 falhas bloqueantes) e §5.1–§5.2; seções 1–5 acima (game-design); `pranchas/metrics.json` e os PNGs de `pranchas/` e `fase0-chatgpt/extraido/...` (medidos diretamente nesta revisão, ver §6.7).
- **Regra respeitada:** nenhuma geração PixelLab, nenhum código/mapa/sprite/Database alterado, nenhum outro agente acionado. Script próprio de verificação (`workspaces/game-qa/tools/verify_bbox.py` + `crop_check.py`, sem dependências pagas, escrito do zero — não reaproveita `pxpng.py` do `game-art`, para servir de segunda fonte de medição).

### 6.1 Bloqueantes × graduados — lista reconciliada, sem duplicidade

**Bloqueantes gerais da rubrica (12 itens, `RUBRICA_QUALIDADE_VISUAL_V1.md` §4.1–§4.6) — mantidos sem alteração de conteúdo, só referenciados aqui:** 1. espécie irreconhecível/errada; 2. contorno oficial alterado sem autorização; 3. fundo não transparente; 4. grade de pixel falsa; 5. escala fora da faixa do estudo sem registro; 6. quadros inconsistentes (±5%); 7. pivô fora do pé/Y-sort quebrado; 8. trilha marrom no mapa; 9. Digimon forte fora da área de exibição (zonas S/T/C); 10. falta de fonte/classificação ADR-015; 11. texto de desenvolvimento/gancho de depuração visível; 12. integração que quebra o jogo (I-16).

**Cruzamento com os bloqueantes propostos pelo `game-design` nas Dimensões 1 e 2 (§1/§2 acima) — duplicidades eliminadas:**

| Item do `game-design` | Duplica item da rubrica? | Decisão |
|---|---|---|
| 1.1 Grade de pixel real 1:1 | **Sim — duplica o item 9 (grade de pixel falsa)** | Removido como item novo; mantido só o item 9, aplicado também ao recorte 12×10 (a nota do `game-design` em 1.1 já dizia isso — só reafirmava, não acrescentava) |
| 1.2 Tile no tamanho definido, sem costura visível | Não — item novo, específico de tileset/mapa, sem equivalente nos 12 | **Mantido como item novo (ver §6.2, item 13)** |
| 1.3 Transição Wang sem artefato (bloqueante **se** a costura for visível) | Não — item novo, condicional | **Mantido como item novo condicional (item 14)** |
| 1.7 Densidade de pixel do recorte = do elenco de personagens | Parcial — sobrepõe o item 5 (escala fora da faixa) e o I-13 do portão técnico, mas focado em cenário×elenco, não em espécie×espécie | **Não vira item novo; registrado como a aplicação do item 5 + I-13 especificamente ao recorte 1 (ver nota em §6.2)** |
| 2.1 Caminho contínuo S→Z sem exigir mato denso | Não — é requisito de função (injogável sem ele), não estava nos 12 | **Mantido como item novo (item 15)** |
| 2.2 Nenhum spawn adult/ultimate em S/T/C | **Sim — duplica o item 9** (mesma regra, mesma fonte, G2) | Removido como item novo; é o mesmo item 9, só reaplicado ao layout completo |
| 2.8 Oclusão >50% em ≥5 pontos do percurso | Não — distinto do item 7 (Y-sort/pivô): aqui a entidade pode estar com Y-sort correto e ainda ficar oculta por excesso de vegetação à frente | **Mantido como item novo (item 16)** |
| 3.2 / 3.5 / 3.6 (Dimensão 3 — navegação) | 3.2 ≈ item 15 (função de caminho); 3.6 ≈ item 16 (oclusão); 3.5 (hierarquia de porte não percebida) é novo | **3.2 e 3.6 não viram itens novos — são a mesma falha, só medida por percepção humana em vez de amostragem automática, depois de haver playtest. 3.5 vira item novo condicional (item 17), só exigível quando a Dimensão 3 tiver execução real** |

### 6.2 Lista final de bloqueantes (17 itens, 12 da rubrica + 5 novos de mapa)

| # | Item | Origem | Quando se aplica |
|---|---|---|---|
| 1–12 | (os 12 da rubrica, §4.1–§4.6, sem alteração) | `RUBRICA_QUALIDADE_VISUAL_V1.md` | Todo asset, incl. mapa |
| 13 | Tile fora do tamanho definido (32 px, salvo decisão de E5) ou costura visível entre tiles adjacentes | game-design D1.2 | Mapa — Dimensão 1 (recorte 12×10) |
| 14 | Transição Wang (terreno↔terreno) com artefato ou repetição óbvia **visível** na borda | game-design D1.3 | Mapa — Dimensão 1, só se a costura for de fato visível (bloqueante condicional) |
| 15 | Caminho contínuo de tiles abertos entre entrada (S) e santuário (Z), sem exigir atravessar mato denso | game-design D2.1 / D3.2 | Mapa — Dimensão 2 (layout 40×30); Dimensão 3 reconfirma por percurso real |
| 16 | Sprite de Tamer/Digimon >50% ocluso por vegetação, amostrado em ≥5 pontos do percurso | game-design D2.8 / D3.6 | Mapa — Dimensão 2; Dimensão 3 reconfirma por relato de jogador |
| 17 | Hierarquia de porte (classe maior lida como "mais forte") não percebida pela maioria dos testadores | game-design D3.5 | Mapa — **só exigível quando a Dimensão 3 tiver execução real** (playtest); hoje é registro de meta, não falha ativa |

**Nota sobre o item 1.7 do game-design (densidade de pixel do recorte vs. elenco):** não virou item novo porque já está coberto pelo item 5 (escala fora da faixa) e pelo item técnico I-13 do portão (§2 da rubrica) — manter como item novo duplicaria a mesma verificação sob dois números. Fica registrado aqui que, no recorte da Dimensão 1, o item 5/I-13 deve ser checado **com o elenco de personagens do mesmo lote na mesma captura**, não só entre Digimons.

**Graduados:** os itens graduados de Dimensão 1 (1.4, 1.5, 1.6) e Dimensão 2 (2.3 a 2.7, 2.9 a 2.12) do `game-design` (§1/§2 acima) são aceitos sem alteração de conteúdo — nenhum duplicava um bloqueante da rubrica, porque a rubrica rev. 2 não tinha critérios graduados próprios de mapa além da banda 0/4/6/8/10 do Critério 2 (§1.2). Os graduados da Dimensão 3 (3.1, 3.3, 3.4, 3.7) seguem como registro comparativo, sem meta numérica fixa na 1ª rodada, exatamente como o `game-design` propôs.

### 6.3 Separação das 3 dimensões de mapa — confirmada, sem alteração de conteúdo

As 3 dimensões do `game-design` (§1 arte/tileset no recorte ~12×10; §2 composição no layout 40×30; §3 navegação real, roteiro proposto) já atendem exatamente à separação pedida pelo `COMANDO_ETAPA6_C2` §4 ("separar três dimensões: 1. arte e tilesets; 2. composição e exploração; 3. experiência real de navegação"). Nenhuma mudança de escopo é necessária — só a reconciliação de bloqueantes acima (§6.1/§6.2).

### 6.4 Método de cálculo da nota do critério "Beleza e exploração dos mapas" — decisão

O `game-design` propôs, em [H], que a nota seja a média simples dos itens graduados aplicáveis nas Dimensões 1 e 2 (Dimensão 3 fora do cálculo até ter execução real), com qualquer bloqueante reprovando o critério inteiro. **Decido adotar essa proposta, com um ajuste:**

1. **Bloqueantes:** qualquer item da lista de 17 (§6.2) falhado, em qualquer dimensão aplicável, reprova o critério inteiro — nota não é calculada, asset/mapa fica REPROVADO. Sem alteração da proposta do `game-design`.
2. **Graduados:** a nota do critério é a **média aritmética simples de todos os itens graduados aplicáveis, somando as Dimensões 1 e 2 num único conjunto** (não a média de duas médias separadas por dimensão). **Motivo da escolha:** calcular duas médias (uma por dimensão) e depois combiná-las exigiria decidir um peso relativo entre as dimensões (ex.: 40/60, 50/50) sem nenhum dado histórico do projeto que justifique um valor específico — qualquer peso seria tão arbitrário quanto outro. Uma média simples sobre o conjunto agrupado (19 itens graduados possíveis: 3 da Dimensão 1 + 9 da Dimensão 2, menos os marcados N/A) é auditável por qualquer pessoa sem fórmula extra, e trata craft local (Dimensão 1) e composição global (Dimensão 2) como contribuições do mesmo peso por item — consistente com a forma como a própria rubrica já trata os demais critérios (itens de uma mesma banda, sem subpesos internos). Se o fundador discordar e quiser priorizar uma dimensão sobre a outra, é decisão dele, não recálculo automático.
3. **Dimensão 3** continua fora do cálculo numérico nesta rodada (sem mapa jogável integrado); quando houver playtest, os itens graduados da Dimensão 3 entram no mesmo pool de média simples do item 2 acima — **não recebem peso reduzido por serem "menos executáveis" hoje**, porque uma vez executados eles medem exatamente o que a jogabilidade real entrega, o dado mais direto de todos. Esta é uma decisão de régua futura, registrada agora para não exigir nova reunião só para isso.
4. **Nota mínima 8,0 ponderada e nenhum critério principal abaixo de 7** (`RUBRICA_QUALIDADE_VISUAL_V1.md` §5.1) continuam sem alteração.
5. **A aprovação final continua sendo do fundador**, inclusive para rejeitar este método e decidir outro — nada nesta seção vira regra até o `game-studio`/fundador validar, igual ao que já estava registrado pelo `game-design`.

### 6.5 Regra explícita da Fase 0: (A) artística/fidelidade × (B) prontidão técnica

Confirmo e formalizo a regra já aplicada pelo `game-art` em `RELATORIO_AVALIACAO_ASSETS_FASE0.md`, com base direta no `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §2:

1. **(A) e (B) são sempre avaliadas e registradas separadamente** — nunca uma nota única que misture as duas.
2. **Falta de transparência, spritesheet, pivô ou animação são sempre (B).** Nenhum desses quatro itens, isoladamente ou juntos, reprova ou rebaixa a nota de (A) — eles só fazem o portão técnico (§2 da rubrica) FALHAR e entram no registro de custo (§3 da rubrica) como esforço de conversão. Isso vale para os 12 bloqueantes gerais também: os itens 3 (fundo não transparente), 6 (quadros inconsistentes) e 7 (pivô/Y-sort) são, na Fase 0, bloqueantes de (B)/portão técnico, **não** de (A) — um asset pode ter os três e ainda receber uma nota de (A) alta, se a espécie for fiel e o craft de pixel for real.
3. **Os bloqueantes de (A)** — item 1 (espécie irreconhecível), item 2 (contorno oficial alterado), item 4 (grade de pixel falsa), item 10 (falta de fonte/classificação ADR-015), item 11 (texto de desenvolvimento visível) — continuam valendo para a Fase 0 exatamente como a rubrica define, porque nenhum deles está na lista de exceção do comando ("transparência, spritesheet, pivô ou animação"). **Grade de pixel falsa (item 4) não está nessa lista de exceção** — ver o ponto em aberto, §6.6.
4. **Efeito prático na Fase 0:** por causa da regra 3, a Nota A pode continuar baixa mesmo quando a prontidão técnica (B) é tratada só como registro, não como reprovação — é exatamente o que já ocorreu nas 4 fichas do `game-art` (Nota A 3,4 a 4,25, todas na banda 0–3 do Critério 1 por causa da grade falsa, não por causa de transparência/pivô/spritesheet, que são só registradas em (B)).

### 6.6 Ponto em aberto: "grade de pixel falsa" é qualidade artística ou custo de conversão?

**O achado do `game-art`:** as 4 folhas receberam Nota A final entre 3,4 e 4,25, mesmo com fidelidade de espécie **isolada** entre 6 e 8 (Guilmon 7, ExVeemon 8, Agumon 6, Gabumon 7) — porque a rubrica manda usar "a banda do pior dos dois" (fidelidade × craft de pixel) no Critério 1, e a grade de pixel falsa domina a banda 0–3 nos 4 casos.

**Confirmação própria, por amostragem:** inspecionei diretamente 2 das 4 folhas originais (Guilmon e Agumon), recortando regiões com o personagem e ampliando 4× com um script próprio (`crop_check.py`). Confirmo visualmente **sombreamento em degradê redondo** (realces suaves arredondados na cabeça/corpo, não bandas de cor discretas) nas duas folhas — o achado central do `game-art` se sustenta, não é uma leitura isolada ou exagerada. Também confirmei independentemente a cor do Agumon (amarelo/dourado, não laranja), batendo com o achado do `game-art` sobre a base DS do projeto.

**Duas leituras numéricas, sem decidir qual vale:**

| Leitura | Regra | Nota A final — Guilmon / ExVeemon / Agumon / Gabumon |
|---|---|---|
| **1 — grade falsa é craft, entra em (A)** (regra atual da rubrica, aplicada pelo `game-art`) | Critério 1 usa a banda do pior dos dois (fidelidade × grade) | 3,4 / 3,9 / 4,25 / **4,0*** |
| **2 — grade falsa é custo de conversão, entra em (B)** (hipótese alternativa) | Critério 1 usa só a fidelidade de espécie isolada (7/8/6/7); grade falsa vira só um item do registro de custo/portão técnico, como transparência/pivô já são | 6,33 / 6,83 / 6,00 / 6,58 |

*\*Nota: o valor "4,0" de Gabumon no relatório original está **aritmeticamente incorreto** — ver §6.7, item 1. O valor correto pela própria fórmula do `game-art` (3×0,583 + 6×0,25 + 6×0,167) é **4,25**, idêntico ao do Agumon (mesmos três componentes). Usei 4,25 na coluna acima.*

**Meu parecer:** inclino para a **Leitura 1** (grade falsa pertence a (A), como a rubrica já define). A diferença central para transparência/pivô/spritesheet é que esses três são metadados de empacotamento — a arte em si já existe, só falta recortá-la/marcá-la para o motor. Grade de pixel falsa é diferente: o próprio desenho (cada pixel, cada transição de cor) precisaria ser **refeito**, não apenas reempacotado, para virar pixel art real — e o texto do comando lista taxativamente "transparência, spritesheet, pivô ou animação", não craft de pixel. Mas reconheço que é uma leitura, não um fato: um conceito artístico sólido desenhado em estilo "pixel-like" pode ser visto como uma etapa legítima de concept art, cujo custo de conversão para pixel real é alto mas não diferente em natureza de outros custos de (B). **Decisão final: do fundador**, com as duas leituras acima como insumo — não altero a Nota A já publicada pelo `game-art` nesta revisão (ver §6.7, nota 2).

### 6.7 Correções pontuais encontradas nesta revisão

1. **Erro aritmético em `RELATORIO_AVALIACAO_ASSETS_FASE0.md`, ficha F0-004 (Gabumon):** a "Nota A final" usa os mesmos três componentes do Agumon (3 × 0,583 + 6 × 0,25 + 6 × 0,167), que somam 4,25 — igual ao valor já publicado para o Agumon (F0-003) com os mesmos três componentes. O documento publica "4,0" para o Gabumon, inconsistente com sua própria fórmula e com o cálculo idêntico do Agumon. **Não corrijo o documento do `game-art` diretamente** (regra de revisão independente: revisar, não reescrever o que o autor escreveu) — reporto aqui para o `game-studio`/`game-art` corrigir. Isso não muda nenhum veredito (A) dos 4 assets ("candidato aproveitável" em todos), só a nota numérica de referência do Gabumon.
2. **Nenhuma outra inconsistência aritmética encontrada** nas 3 outras fichas (Guilmon 3,4; ExVeemon 3,9; Agumon 4,25 — todas conferidas e corretas pela fórmula declarada).

### 6.8 Nota mínima e aprovação final — sem alteração

Confirmo, sem mudança de conteúdo: **média ponderada mínima 8,0**, **nenhum critério abaixo de 7**, portão técnico aprovado e **0 falha bloqueante** continuam sendo as 4 condições de aprovação de um método (A/B/C); a **Fase 0 nunca usa o vocabulário "aprovado/reprovado"** (usa candidato aproveitável/precisa de retrabalho/fraco como referência); e a **homologação final é sempre do fundador**, em ambos os casos.

### 6.9 Limitações desta seção

1. A lista de 17 bloqueantes (§6.2) e o método de cálculo (§6.4) são ajustes de régua deste agente, registrados com motivo — ficam sujeitos à revisão do `game-studio`/fundador, como qualquer outra decisão de rubrica desta etapa.
2. Não recalculei nem reescrevi nenhuma nota já publicada pelo `game-art` nos 3 documentos revisados — correções e leituras alternativas ficam registradas nesta seção e nas seções de revisão independente de cada documento, nunca sobrescrevendo o texto original do autor.
3. Nenhum mapa, sprite, código, Database ou configuração foi alterado; nenhuma geração PixelLab; nenhum outro agente acionado.
