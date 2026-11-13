# ESCALA_E5_POR_ESPECIE_V1 — Etapa 6, Comando 3, passo 3 de 7

- **Autor:** game-design (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1, D2, adendo "portão", Sonnet 5).
- **Base lida:** `COMPARATIVO_ESCALAS_E1_E5.md` §6 (E5 do `game-art`) e §7 (revisão do `game-design`); `ESTUDO_ESCALA_DIGIMONS.md` (tabela por espécie, proxy DWDS, `radiusByStage`); `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 (layout 40×30, zonas, G2); `AJUSTES_RUBRICA_VISUAL_V1.md` (bloqueantes 9, 15, 16, 17; Dimensão 3); `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6 (regras do motor R1–R6, pivô, quadros); `database/07_CATALOGO_PILOTO.md` e `data/species.json` (só leitura); `prototype/world/src/data/world-species.json` (só leitura, worktree `qo`, `radiusByStage` e campo `stage` 1–5).
- **Regra respeitada:** nenhuma geração PixelLab; nenhum código, mapa, sprite, Database ou configuração alterado; nenhum commit; nenhuma decisão homologada reaberta. Todos os valores de px são **[H]**, propostos para teste (D2) — nenhum é definitivo.

## 0. Como esta entrega lê D1 e D2 juntas

**D1** redesenha o Tamer para **36–50 px de conteúdo**, em personalização por camadas — isso **rompe** o teto que todo o laboratório E1–E5 já havia provado matematicamente impossível de resolver só por fator inteiro (`COMPARATIVO_ESCALAS_E1_E5.md` §5/§6.3: nenhum fator inteiro aplicado ao Tamer de 34 px cai entre 1,1–1,6× o tile). Com o Tamer liberado para ser **redesenhado** dentro de uma faixa nova, o eixo "Tamer/tile" deixa de depender de reescalar um sprite existente — vira uma decisão de **desenho novo**, não de multiplicador.

**D2** aprova a direção "escala por espécie" e proíbe 3× automático para Megas. Combinando com o achado acima: **nenhuma espécie desta entrega é proposta por fator inteiro sobre o sprite DS existente.** Todas as 9 espécies recebem **quadro próprio** (redesenho dentro da faixa proposta), porque:
1. as alturas nativas do proxy DWDS (17–37 px, `ESTUDO_ESCALA_DIGIMONS.md` §3) ficam todas abaixo da nova faixa de referência do Tamer (36–50 px) — nenhuma reescala inteira de um sprite de 17–37 px cai de forma limpa dentro das bandas propostas no §2 abaixo;
2. a própria E5 (`COMPARATIVO_ESCALAS_E1_E5.md` §6.3) já mostrou que o fator 3× do WarGreymon (108×87 px) viola a largura do corredor mínimo (M4) — um achado que esta entrega **confirma e usa** para não repetir o erro: a classe Gigante aqui proposta fica bem abaixo de 3×.

Isso não é regressão em relação ao trabalho de E1–E5 (`game-art`/`game-design`, passo 2) — é a consequência direta de D1 ter mudado a peça que travava o problema (o próprio sprite do Tamer).

## 1. Classes de porte propostas [H]

Refinamento das classes qualitativas já propostas em `ESTUDO_ESCALA_DIGIMONS.md` §3 e em `COMPARATIVO_ESCALAS_E1_E5.md` §7.3, agora ancoradas no **meio da faixa do Tamer (≈43 px, D1)** em vez do Tamer antigo (34 px), e com largura como eixo próprio (não derivado da altura), como `COMPARATIVO_ESCALAS_E1_E5.md` §7.2 já havia identificado como necessário (Koromon é mais largo que alto apesar de ser o menor em altura).

| Classe | Altura de conteúdo proposta | Razão vs. Tamer (43 px) | Nota |
|---|---|---|---|
| **Pequeno** | 20–32 px | 0,47–0,74× | Baby I/II; blobs tendem a largura ≥ altura (ver Koromon) |
| **Médio** | 30–42 px | 0,70–0,98× | Child/Rookie; fica abaixo ou na base da faixa do Tamer, nunca acima |
| **Grande** | 46–66 px | 1,07–1,53× | Adult/Champion e parte do Perfect/Ultimate |
| **Gigante** | 64–88 px | 1,49–2,05× | Mega de reputação canônica, **nunca 3× (D2)** — teto proposto 88 px, bem abaixo dos 108 px que E5 testou e que já violava corredor |

**Largura não é derivada da altura.** Cada espécie abaixo recebe sua própria faixa de largura, justificada por postura (bípede/quadrúpede/voador/serpentiforme) e por silhueta (cauda, pinças, armadura, asas) — não por uma razão fixa largura/altura aplicada a todas.

## 2. Colisão física — regra separada da escala visual (D2)

**Decisão de enquadramento, não de valor:** as regras de jogo continuam congeladas até a identidade visual ser definida (AGENTS.md §2; `ESTUDO_ESCALA_DIGIMONS.md` §4). Isso significa que **a única rota disponível nesta rodada é a Rota 1**: manter `radiusByStage` (12/16/22/26/30 px, por estágio numérico de jogo 1–5, `world-species.json:3`, já implementado e **não alterado aqui**), dissociado da nova altura/largura visual. A **Rota 2** (fazer a colisão acompanhar a classe de porte visual) exigiria destravar essa regra de jogo — **não é uma escolha de arte, é decisão do fundador**, registrada como pendência no §8, não adotada por omissão.

Mapeamento usado (estágio numérico de jogo, não o estágio da Database) — `CREATURE-0016` (WarGreymon) já está em `stage: 5` no arquivo; os demais priorizados ainda não têm entrada própria em `world-species.json` (usam `pack` do protótipo idle) — o mapeamento abaixo é **proposta de enquadramento [H]**, por analogia com espécies já cadastradas do mesmo estágio de Database:

| Espécie | Estágio Database | Estágio de jogo proposto [H] | Raio de colisão (Rota 1, sem mudança) |
|---|---|---|---|
| Koromon | baby_ii | 1 (como Gigimon) | 12 px |
| Agumon | child | 2 (como Guilmon) | 16 px |
| Greymon | adult/champion | 3 (como Growlmon, Numemon, GeoGreymon) | 22 px |
| MetalGreymon | perfect/ultimate | 4 (como DoruGreymon) | 26 px |
| WarGreymon | ultimate/mega | 5 [E, `world-species.json:38`] | 30 px |
| Betamon | — (fora do piloto, `in_pilot: false`) | 2 [E, `world-species.json:25`, já cadastrado] | 16 px |
| Kunemon | fora da Database | 2 [H, por analogia — Wikimon lista Level "Child", mesmo nível de Agumon] | 16 px |
| Palmon | — (fora do piloto, `in_pilot: false`) | 2 [E, `world-species.json:24`, já cadastrado] | 16 px |
| Kuwagamon | fora da Database | 3 [H, por analogia — Wikimon lista Level "Adult", mesmo nível de Greymon; consistente com o papel de chefe de região já fixado em `GDD_MMO_V1.md` §1.2] | 22 px |

**Achado a registrar:** com esse mapeamento, um Digimon "Grande"/"Gigante" na nova escala visual (Greymon, MetalGreymon, WarGreymon, Kuwagamon) continua com a hitbox de um raio pequeno (22–30 px) dentro de uma silhueta visual muito maior (altura 46–88 px, largura até 76–88 px no §3) — a hitbox fica visualmente "menor que o corpo". Isso é esperado e aceito pela Rota 1 (é assim que o jogo já funciona hoje, com Numemon e Greymon partilhando raio 22 apesar de alturas de sprite diferentes), mas fica mais visível com a nova escala — **registrado como efeito colateral a observar no playtest (§7.6), não como defeito a corrigir nesta rodada.**

## 3. Tabelas por espécie

### 3.1 Elenco prioritário

#### Koromon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | baby_ii (Database); estágio de jogo 1 |
| Postura | Amorfo/blob — sem postura bípede/quadrúpede definida |
| Classe de porte | **Pequeno** |
| Altura visual proposta | 22–28 px |
| Largura visual proposta | 26–34 px (mais largo que alto — confirmado em `pranchas/metrics.json`: largura 19 px vs. altura 17 px no sprite nativo, razão 1,12) |
| Fator ou quadro proposto | **Quadro próprio** (redesenho). O proxy DWDS (17 px) fica abaixo da banda Pequeno nova; nenhum fator inteiro de 17 px cai em 22–28 px |
| Colisão física | Raio 12 px (Rota 1, §2) — bem menor que a largura visual (26–34 px); esperado para um blob, igual à prática já aceita para outros Baby |
| Sombra e ponto de contato | Sombra elíptica larga e rasa, centrada sob o corpo (sem pernas para ancorar um pé único); ponto de contato = centro da base do blob, não um "pé" |
| Espaço de combate | Mínimo 1 tile de folga ao redor durante ENGAGE/ATTACK — porte pequeno não exige mais |
| Observação de silhueta | Silhueta "disco" — altura baixa não deve ser lida como "irrelevante": a largura relativamente grande (quase igual à do Agumon) precisa aparecer na proporção, não só na altura |

#### Agumon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | child/Rookie (Database); estágio de jogo 2 |
| Postura | Bípede |
| Classe de porte | **Médio** |
| Altura visual proposta | 32–40 px (abaixo do piso do Tamer, 36 px, para preservar Baby < Child < Tamer mesmo no extremo baixo da faixa do Tamer) |
| Largura visual proposta | 24–30 px (razão largura/altura ≈ 0,74, igual à medida nativa em `pranchas/metrics.json`) |
| Fator ou quadro proposto | **Quadro próprio.** O proxy DWDS (26–27 px) fica abaixo da banda nova |
| Colisão física | Raio 16 px (Rota 1) |
| Sombra e ponto de contato | Sombra elíptica pequena sob os pés, pivô no pé (padrão do motor, R3) |
| Espaço de combate | Mínimo 1 tile de folga |
| Observação de silhueta | Silhueta compacta, sem apêndice lateral grande — o "Digimon mais reconhecível do piloto" (`ESTUDO_ESCALA_DIGIMONS.md` §5) não deve perder identidade por estar menor que o Tamer |

#### Greymon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | adult/Champion (Database); estágio de jogo 3 |
| Postura | Bípede (dinossauro, com cauda) |
| Classe de porte | **Grande** |
| Altura visual proposta | 48–58 px |
| Largura visual proposta | 40–50 px (cauda e tórax alargam a silhueta além do que um bípede magro teria; razão ≈ 0,80–0,88) |
| Fator ou quadro proposto | **Quadro próprio.** O proxy DWDS (37 px) fica abaixo da banda Grande |
| Colisão física | Raio 22 px (Rota 1) — mesmo raio de Numemon hoje, apesar da altura visual maior |
| Sombra e ponto de contato | Sombra elíptica sob as duas patas traseiras; ponto de contato = linha dos pés, não a cauda (a cauda não deve "ancorar" sombra nem bloquear Y-sort) |
| Espaço de combate | Mínimo 1,5 tile de folga ao redor — porte Grande precisa de mais espaço visível para ENGAGE/ATTACK (ADR-009) |
| Observação de silhueta | A cauda se estende horizontalmente atrás do corpo — ao desenhar a largura de conteúdo, decidir se a cauda entra na caixa (afeta a largura de 40–50 px) ou fica como apêndice fora da caixa de colisão/Y-sort principal; proposta: cauda **dentro** da caixa de largura, fora da caixa de colisão (que continua no raio de §2) |

#### MetalGreymon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | perfect/Ultimate (Database); estágio de jogo 4 |
| Postura | Bípede (ciborgue, braço-canhão/garra metálica) |
| Classe de porte | **Grande**, fronteira com Gigante |
| Altura visual proposta | 56–68 px |
| Largura visual proposta | 48–62 px (o braço-garra alarga a silhueta de forma **assimétrica** — não é uma cauda central, é um apêndice lateral) |
| Fator ou quadro proposto | **Quadro próprio.** O proxy DWDS (34 px) — igual, por coincidência, à altura DWDS do próprio Agumon em outra convenção de medição — fica muito abaixo da banda nova; não há fator inteiro aproveitável |
| Colisão física | Raio 26 px (Rota 1) |
| Sombra e ponto de contato | Sombra elíptica sob os pés; ponto de contato nos pés, não no braço-garra (o braço não deve projetar sombra própria, para não confundir leitura de pivô) |
| Espaço de combate | Mínimo 1,5 tile de folga |
| Observação de silhueta | Silhueta **assimétrica** (garra de um lado) é o principal risco de leitura: a caixa de largura (48–62 px) não deve ser tratada como um círculo centrado — ao compor no mapa, reservar a folga assimétrica do lado da garra, não só um raio uniforme |

#### WarGreymon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | ultimate/Mega (Database); estágio de jogo 5 [E, `world-species.json:38`] |
| Postura | Bípede-dragão, armadura e asas que alargam a silhueta além do corpo |
| Classe de porte | **Gigante** |
| Altura visual proposta | 70–84 px — **deliberadamente abaixo do teto da classe (88 px) e muito abaixo dos 108 px que a E5 anterior testou a 3×** (D2: sem 3× automático) |
| Largura visual proposta | 56–72 px com as asas fechadas/em posição de caminhada (pose padrão); **uma pose de asas abertas (ex.: ataque especial) deve ser medida e tratada separadamente** — pode exceder esta faixa e exigir regra própria de espaço (§7) |
| Fator ou quadro proposto | **Quadro próprio.** A E5 anterior já mostrou que 3× (108×87 px) viola o corredor mínimo (M4, `COMPARATIVO_ESCALAS_E1_E5.md` §6.3) — esta proposta parte desse achado e fixa um teto bem menor |
| Colisão física | Raio 30 px (Rota 1) — o maior raio já existente no jogo, mas ainda bem menor que a meia-largura visual proposta (28–36 px); registrado como o caso mais extremo do achado do §2 |
| Sombra e ponto de contato | Sombra elíptica larga sob os pés; asas e armadura de ombro **não** projetam sombra própria — ponto de contato só nos pés |
| Espaço de combate | Mínimo 2 tiles de folga ao redor — maior porte do elenco, ADR-009 exige leitura clara de ENGAGE/ATTACK |
| Observação de silhueta | Risco central: a largura com asas abertas pode superar a faixa proposta — se isso for confirmado no teste (§6), a espécie precisa de uma 2ª faixa de largura só para a pose de asas abertas, ou a pose fica restrita a cutscene/zona sem corredor (nunca em zona de trânsito) |

### 3.2 Elenco complementar

**Nota de enquadramento (ADR §"Elenco do teste"):** o complementar serve só de candidato de teste de produção — não autoriza encontros nem mecânicas. Betamon e Palmon estão em `data/species.json` com `in_pilot: false` (fora do catálogo piloto, mas já no roster do jogo, `in_gs003_roster: true`). Kunemon e Kuwagamon **não estão na Database** (nem no piloto, nem na base estendida) — tratados abaixo como "fora da Database piloto", com fonte de apoio Wikimon, sem inventar postura ou porte (§4).

#### Betamon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | Fora do catálogo piloto (`in_pilot: false`); já cadastrado em `world-species.json` com estágio de jogo 2 |
| Postura | Bípede (anfíbio, postura agachada) |
| Classe de porte | **Pequeno/Médio, fronteira** |
| Altura visual proposta | 28–36 px |
| Largura visual proposta | 24–32 px (razão ≈ 0,85–0,90, corpo atarracado) |
| Fator ou quadro proposto | **Quadro próprio** |
| Colisão física | Raio 16 px (Rota 1, igual ao já cadastrado) |
| Sombra e ponto de contato | Sombra elíptica sob os pés, postura agachada aproxima a sombra do corpo |
| Espaço de combate | Mínimo 1 tile de folga |
| Observação de silhueta | Corpo atarracado/anfíbio — não alargar artificialmente para parecer "Grande"; é um candidato de teste de produção, não uma espécie com papel de encontro definido |

#### Kunemon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | **Fora da Database piloto.** Fonte de apoio: Wikimon [E, `wikimon.net/Kunemon`, 2026-11-13] — Level: Child; Type: Larva; Attribute: Virus |
| Postura | **Serpentiforme/larva** — corpo alongado e segmentado, baixo em relação ao solo (insetoide do tipo "Larva", não bípede) |
| Classe de porte | **Pequeno**, por altura — mas com **exceção de banda de largura** por postura (ver nota abaixo) |
| Altura visual proposta | 18–26 px (menor que o Koromon, por estar deitado/rasteiro, não por ser "mais fraco") |
| Largura visual proposta | **28–42 px — maior que a própria altura, razão 1,4–1,8×**, porque o corpo alongado se estende horizontalmente; medir porte só pela altura subestimaria esta espécie, exatamente o risco já identificado para quadrúpedes em `COMPARATIVO_ESCALAS_E1_E5.md` §7.2, aqui aplicado a uma postura ainda mais extrema |
| Fator ou quadro proposto | **Quadro próprio** — sem sprite nativo no projeto (fora da Database), não há nenhum valor de referência a escalar |
| Colisão física | Raio 16 px (Rota 1, por analogia de estágio Wikimon "Child" = estágio de jogo 2, §2) — **note-se que isso é maior, proporcionalmente, que o raio do Koromon (12 px) apesar de Kunemon ter altura visual proposta menor**; é um efeito esperado da regra "colisão por estágio de jogo", registrado aqui para visibilidade, não corrigido |
| Sombra e ponto de contato | Sombra alongada acompanhando o comprimento do corpo (não uma elipse pequena centrada) — ponto de contato = linha ventral inteira, não um "pé" único |
| Espaço de combate | Mínimo 1 tile de folga — porte pequeno em altura, apesar da largura |
| Observação de silhueta | **Candidato de teste de produção apenas** (fora da Database, elenco complementar) — qualquer arte produzida deve declarar a fonte Wikimon na ficha/licença (ADR-015), e não pode inventar um design não documentado nas fontes citadas |

#### Palmon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | Fora do catálogo piloto (`in_pilot: false`); já cadastrado em `world-species.json` com estágio de jogo 2 |
| Postura | Bípede (planta, colar de folhas, cabeça bulbosa) |
| Classe de porte | **Médio** |
| Altura visual proposta | 34–42 px |
| Largura visual proposta | 32–40 px (razão ≈ 0,90–0,95 — o colar de folhas alarga o tronco mais que um bípede "magro" como o Agumon) |
| Fator ou quadro proposto | **Quadro próprio** |
| Colisão física | Raio 16 px (Rota 1, igual ao já cadastrado) |
| Sombra e ponto de contato | Sombra elíptica sob os pés |
| Espaço de combate | Mínimo 1 tile de folga |
| Observação de silhueta | O colar de folhas pode se sobrepor à cabeça no Y-sort se o pivô não for calibrado por quadro — atenção extra na animação de virar (N/S/W) |

#### Kuwagamon

| Atributo | Valor proposto [H] |
|---|---|
| Estágio | **Fora da Database piloto.** Fonte de apoio: Wikimon [E, `wikimon.net/Kuwagamon`, 2026-11-13] — Level: Adult; Type: Insect; descrito com "pinças gigantes na cabeça" (*gigantic pincers*). Já é chefe de região fixado em `docs/GDD_MMO_V1.md` §1.2 (Floresta Densa) |
| Postura | **Voador** — inseto alado de grande porte; combate aéreo/pairado, não terrestre puro |
| Classe de porte | **Grande** (papel de chefe de região, zona Z do layout-brief) |
| Altura visual proposta | 50–62 px (corpo; não a envergadura) |
| Largura visual proposta | **60–80 px — maior que a própria altura corporal**, porque as pinças descritas como "gigantes" se projetam bem além do corpo; a Wikimon não dá medida numérica, então esta faixa é proposta de composição [H], não medição |
| Fator ou quadro proposto | **Quadro próprio** — sem sprite nativo no projeto |
| Colisão física | Raio 22 px (Rota 1, por analogia de estágio Wikimon "Adult" = estágio de jogo 3, §2) — como já ocorre com Greymon/Numemon/GeoGreymon, a hitbox fica bem menor que a silhueta alada |
| Sombra e ponto de contato | Por ser voador: sombra **menor que a silhueta** (não cobre a envergadura das asas), projetada no solo abaixo do centro do corpo, levemente deslocada se o sprite estiver em pose de voo/pairado — ponto de contato é o centro de massa projetado no solo, não um "pé" (o Kuwagamon raramente é desenhado pousado) |
| Espaço de combate | Mínimo 2 tiles de folga — arena de chefe (zona Z), não corredor de trânsito; não se aplica a regra de corredor mínimo do §7, porque chefe não percorre rota |
| Observação de silhueta | **Candidato de teste de produção apenas**, já com papel de chefe fixado em outro documento (GDD) — qualquer arte produzida deve declarar a fonte Wikimon e não inventar detalhe de cor/padrão não descrito na fonte |

## 4. Kunemon e Kuwagamon — registro "fora da Database piloto"

Confirmado por leitura direta: `database/data/species.json` não contém nenhuma entrada para Kunemon ou Kuwagamon (busca `grep` nos dados, 2026-11-13). Kunemon aparece **apenas** em `database/sources_cache/refbook_extract.json`, como item relacionado de outra espécie (`related_directory_names` da ficha de outra espécie), não como entrada própria. Kuwagamon não aparece em nenhum arquivo da Database.

Por isso, para as duas espécies, esta entrega usa **Wikimon** como fonte de apoio (categoria 3, cita o Reference Book oficial), lida em vivo em 2026-11-13:
- **Kunemon** [E, `wikimon.net/Kunemon`]: Level Child, Type Larva, Attribute Virus, Field Nature Spirits/Jungle Troopers. Descrição oficial: "A Larva Digimon which has lightning patterns all over its body" — insetoide jovem, sem menção a porte físico.
- **Kuwagamon** [E, `wikimon.net/Kuwagamon`]: Level Adult, Type Insect, Attribute Virus, Field Nature Spirits/Wind Guardians. Descrição oficial: "An Insect Digimon armed with gigantic pincers on its head" — combate "excede" espécies similares de File Island; rival direto do Kabuterimon.

**Nenhuma das duas fontes dá altura/peso físico** (mesma lacuna já documentada para toda a franquia em `ESTUDO_ESCALA_DIGIMONS.md` §1/§6). As faixas de altura/largura propostas nas tabelas do §3.2 são, portanto, **composição de design [H]**, apoiada só no que a fonte descreve qualitativamente (corpo alongado/baixo para Kunemon; pinças "gigantes" para Kuwagamon), nunca em medição. Esta entrega **não propõe** nem decide a entrada dessas duas espécies na Database — isso é tarefa futura do `game-research`, com autorização (pendência P3 do ADR), fora do escopo deste documento.

## 5. Limites por ambiente, câmera e espécie

### 5.1 Por ambiente (floresta densa × clareira)

| Zona (layout-brief 40×30) | Classes permitidas | Regra |
|---|---|---|
| S, T, C (zona segura, trilha, descanso) | Pequeno | Nenhuma criatura Médio+ (já bloqueante #9/#2.2 da rubrica) |
| M (mata densa, corredor principal) | Pequeno, Médio | **Nenhuma Grande/Gigante deve vagar em M** — não é proibição nova, é consequência direta de D2 ("imponência sem bloquear corredores"): a largura proposta para Grande (40–80 px) já se aproxima ou excede a largura do corredor mínimo (64 px, 2 tiles), então confinar Grande/Gigante a M criaria o mesmo problema de bloqueio visual que a E5 anterior já mediu para o WarGreymon a 3× |
| R (margem do rio, clareira de exibição) | Grande, Gigante (fixos, em exibição — ver §7.4) | Zona já reservada pelo layout-brief para porte maior visível à distância, sem vagar (resolve G2) |
| Z (santuário, chefe de região) | Grande (chefe, ex.: Kuwagamon) | Arena de chefe, não corredor de trânsito — regras de corredor do §7 não se aplicam dentro de Z |

### 5.2 Por câmera (zoom inteiro atual, `?dpr=1`)

Pela regra do motor R2 (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2.1), todas as criaturas são desenhadas na mesma densidade de pixel, sem zoom isolado por espécie — não há "lente" que aumente ou diminua uma criatura específica na tela. Consequências para as faixas propostas:
1. **Nenhuma classe pode depender de zoom de câmera para "parecer" do tamanho certo** — a altura/largura propostas já são o tamanho final na tela.
2. **A classe Gigante precisa de margem vertical na composição do mapa** (zona R/Z) para não ser cortada pela moldura da câmera — ligado ao critério 2.11 já definido em `AJUSTES_RUBRICA_VISUAL_V1.md` §2 (visibilidade sem corte pela câmera).
3. Qualquer pose de asas abertas (WarGreymon) ou pinças totalmente estendidas (Kuwagamon) deve ser testada contra a moldura de câmera real do recorte 40×30, não só contra a prancha isolada.

### 5.3 Por espécie (resumo das classes)

| Classe | Espécies desta entrega |
|---|---|
| Pequeno | Koromon, Kunemon |
| Pequeno/Médio (fronteira) | Betamon |
| Médio | Agumon, Palmon |
| Grande | Greymon, Kuwagamon |
| Grande/Gigante (fronteira) | MetalGreymon |
| Gigante | WarGreymon |

## 6. Plano de teste para aprovar os valores (D2: "os valores não" estão decididos)

1. **Prancha comparativa nova**, reaproveitando o método de composição local já usado em E1–E5 (`workspaces/game-art/tools/pxpng.py`/`build_pranchas.py`, 0 geração): compor as 9 espécies desta entrega junto a dois Tamers de referência — um nos 36 px (piso de D1) e outro nos 50 px (teto de D1) — para ver a hierarquia Pequeno < Médio ≤ Tamer < Grande < Gigante nos dois extremos da faixa, não só no meio. **Só pode ser executada quando houver quadro(s) de Tamer redesenhado(s)** (D1) — hoje não existe nenhum; é pré-requisito de produção, não deste documento.
2. **Checagem de corredor:** confrontar a largura proposta de cada classe Grande/Gigante (§3) com a largura real das zonas R e Z do layout-brief (hoje descritas qualitativamente, `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 §3/§5, sem medida em tiles) — se R/Z não tiverem largura ≥ (largura da criatura + 2 tiles de margem), o layout-brief precisa de ajuste de dimensão antes de qualquer produção, não a escala.
3. **Checagem de colisão:** para cada espécie, comparar a meia-largura visual proposta (§3) com o raio de colisão (Rota 1, §2); qualquer caso em que a meia-largura exceda o raio em mais de ~50% (hoje: todas as 5 prioritárias, mais acentuado em WarGreymon) fica registrado como achado a reportar ao fundador — decidir se aceita o efeito colateral ou autoriza estudar a Rota 2 em etapa futura.
4. **Roteiro de playtest** (reaproveita e estende a Dimensão 3 de `AJUSTES_RUBRICA_VISUAL_V1.md` §3, métrica 3.5): com testador percorrendo S→Z, perguntar especificamente, para cada espécie Grande/Gigante encontrada: "este Digimon pareceu maior, menor ou do mesmo tamanho que o esperado pelo estágio dele?" — meta [H]: ≥70% das respostas concordam com a classe proposta (Pequeno/Médio/Grande/Gigante), sem meta de aprovação/reprovação fixa nesta 1ª rodada (mesma regra de linha de base das métricas 3.1/3.7 do AJUSTES_RUBRICA).
5. **Critério de aprovação:** nenhuma classe é adotada como regra até (a) a prancha do item 1 confirmar a hierarquia visual nos dois extremos do Tamer, (b) a checagem de corredor do item 2 não apontar violação, e (c) o fundador decidir sobre o achado de colisão do item 3. A homologação final é sempre do fundador (D4, nota mínima e critérios já fixados).

## 7. Critérios de navegação para criaturas grandes (Entregável 3)

### 7.1 Largura mínima de corredor por classe

| Classe | Corredor mínimo | Nota |
|---|---|---|
| Pequeno, Médio | 2 tiles (64 px) — já é o critério 9 do layout-brief, sem alteração | Cobre toda a largura proposta nas tabelas do §3 (até 42 px) com folga |
| Grande | **Não transita por corredor nesta proposta** — confinado a R/Z (§5.1). Se um desenho futuro quiser um Grande atravessando corredor, o mínimo proposto é 3 tiles (96 px), para dar margem às larguras de 40–80 px do §3 | Decisão de permitir trânsito de Grande em corredor é do fundador, não assumida aqui |
| Gigante | **Nunca transita por corredor.** Confinado a zonas abertas (R, Z), nunca a T/M | É a leitura direta de D2 ("imponência sem bloquear corredores") — a única forma de garantir isso com as larguras propostas (56–88 px) é não colocar a classe em nenhum corredor, de nenhuma largura razoável de mapa-piloto |

### 7.2 Comportamento em ponte e cachoeira

- **Ponte:** a largura da ponte no layout-brief ainda não está numericamente definida (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 §3/§9 só descrevem a ponte qualitativamente). Proposta: a ponte segue a regra de corredor Pequeno/Médio (mínimo 2 tiles) — é travessia de rota principal, não zona de exibição. **Nenhuma criatura Grande/Gigante deve ocupar ou atravessar a ponte** como parte de rotina (patrulha); se uma cena específica precisar de uma criatura Grande perto da ponte, ela deve ficar **ao lado**, na margem (zona R), nunca sobre o tile da ponte, para não bloquear a única travessia.
- **Cachoeira:** elemento cênico/vertical, não andável. Nenhuma criatura — de qualquer classe — deve ser posicionada "dentro" da cachoeira. Criaturas próximas a ela (ex.: no bolsão de surpresa B2) ficam limitadas a Pequeno/Médio, pela mesma razão de espaço que já vale para M.

### 7.3 Oclusão e visibilidade do Tamer atrás de uma criatura grande

- A regra geral do motor (pivô no pé, Y-sort, bloqueante #16/#2.8 de `AJUSTES_RUBRICA_VISUAL_V1.md`) já proíbe mais de 50% de oclusão do sprite do Tamer por vegetação. Esta seção acrescenta o caso específico de oclusão **por outra criatura** (não vegetação): com uma silhueta de 56–88 px de largura (Gigante), o risco de o próprio corpo da criatura cobrir o Tamer quando ele se aproxima por trás ou pela lateral é maior que com vegetação.
- **Proposta:** toda criatura Grande/Gigante deve ter **espaço aberto (sem árvore, sem mato denso) em pelo menos 2 lados** de sua posição fixa — o lado de onde o jogador entra na zona (sempre livre, para a 1ª visão não ser bloqueada) e pelo menos um lado adicional (para o jogador poder circundar sem ficar atrás da silhueta por tempo prolongado). Isso não é uma regra de "zona proibida de andar" (não é bloqueio de colisão) — é uma regra de **composição** do layout-brief (onde plantar árvore/mato perto da criatura fixa), a aplicar quando a zona R/Z for efetivamente desenhada.

### 7.4 Regra de spawn e área de exibição

- **Confirma, sem alteração, a regra já existente** (bloqueante #9 da rubrica/#2.2 do AJUSTES_RUBRICA, G2 do `ETAPA2_HOMOLOGACAO.md`): nenhuma criatura adult/ultimate (ou, na terminologia de porte desta entrega, Grande/Gigante) aparece nas zonas S, T ou C.
- **Acrescenta:** dentro de R e Z, a criatura Grande/Gigante fica em **posição fixa**, não em rota de patrulha — é a leitura direta do layout-brief ("visível à distância... sem vagar pelo corredor nem bloquear o caminho", Parte 2 §4). Proposta de "área de exibição": um raio de ao menos 3 tiles ao redor do ponto de spawn fixo, livre de árvore/mato alto, para garantir a linha de visão do §7.3 e o critério 2.11 (visibilidade sem corte pela câmera) já definido em `AJUSTES_RUBRICA_VISUAL_V1.md`.

### 7.5 Métricas a medir no playtest (Dimensão 3 da rubrica)

Estas métricas estendem — não substituem — as já definidas em `AJUSTES_RUBRICA_VISUAL_V1.md` §3.2 (métricas 3.2, 3.5, 3.6):

| # | Métrica proposta [H] | Meta proposta [H] | Tipo |
|---|---|---|---|
| N1 | % de testadores que avistam a criatura Grande/Gigante **sem oclusão parcial** ao entrar na zona R/Z | Meta: 100% (reforça a métrica 3.6 já existente, aplicada especificamente ao caso "oclusão por outra criatura", §7.3) | **BLOQUEANTE se <100%** (mesma leitura de 3.6) |
| N2 | Distância (em tiles, contada a partir da entrada da zona) em que o testador relata ter notado a criatura pela 1ª vez | Registro de linha de base — sem meta fixa na 1ª rodada, como as métricas 3.1/3.7 do AJUSTES_RUBRICA | GRADUADO (registro comparativo) |
| N3 | Relatos de sensação de "bloqueio" por uma criatura Grande/Gigante, mesmo estando ela confinada à zona aberta (falso positivo esperado: 0, já que a criatura não deveria estar em corredor nenhum) | Meta: 0 relatos | **BLOQUEANTE se ≥1 relato** — um relato aqui indicaria falha na regra de confinamento do §7.1/§7.4, não um problema de composição menor |
| N4 | Tempo entre "ver a criatura Grande/Gigante" e "retomar o percurso" (recuo não intencional vs. pausa de admiração) | Registro de linha de base; cruzar com a resposta da pergunta dirigida já prevista em 3.5 ("qual Digimon pareceu mais forte, e por quê?") | GRADUADO (registro comparativo) — distinguir recuo por confusão (defeito) de pausa por impacto visual (efeito pretendido) é qualitativo, decidido por quem observa o teste |

## 8. Limitações e decisões pendentes do fundador

1. **Nenhum valor de px é definitivo** (D2: "os valores não" estão decididos) — toda a tabela de alturas/larguras do §3 é proposta a testar pelo plano do §6, antes de qualquer produção.
2. **A escolha entre Rota 1 e Rota 2 de colisão (§2) é do fundador.** Esta entrega só documenta a Rota 1 (manter `radiusByStage`, sem mudar regra congelada) como a única executável nesta rodada; não assume nem recomenda destravar a regra.
3. **Kunemon e Kuwagamon continuam fora da Database** — esta entrega não propõe nem decide sua entrada formal; é pendência do `game-research`, com autorização (P3 do ADR).
4. **As larguras de R e Z no layout-brief não estão medidas em tiles** — o item 2 do plano de teste (§6) depende de uma medição que este documento não faz (fora de escopo: World Design de estrutura, não composição final de arte, que é do `game-art`).
5. **A pose de asas abertas do WarGreymon e as pinças totalmente estendidas do Kuwagamon** são riscos registrados (§3.1/§3.2), não resolvidos — podem exigir uma 2ª faixa de largura específica para poses de combate, a decidir quando houver arte real para medir.
6. **Nenhum sprite foi gerado, nenhum código/mapa/Database/configuração foi alterado, nenhum outro agente foi acionado, nenhum commit foi feito.**
