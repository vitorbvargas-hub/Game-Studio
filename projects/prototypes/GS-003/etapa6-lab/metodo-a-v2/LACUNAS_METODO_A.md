# LACUNAS_METODO_A — Etapa 6, Comando 5, Link A: passo de ARTE

- **Autor:** game-art (subagente C5) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `COMANDO_ETAPA6_C5_LINK_A.md`, `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1–D13), `ESCALA_E5_POR_ESPECIE_V1.md`, rubrica (rev. 2 + AJUSTES).
- **Entregável:** `etapa6-lab/metodo-a-v2/game-ready/` (125 assets, 386 PNGs, `manifest.json`, previews 1× e 4×, GIFs das animações, `_comparacoes/`).
- **Créditos PixelLab:** **0.** Nenhuma ferramenta PixelLab de geração, nenhum `unzoom_image`/`correct_pixelart`. Única chamada PixelLab: `get_balance` (grátis), **714,95** — o mesmo saldo registrado pelo game-qa antes desta tarefa [E, 13/11].
- **Ferramentas:** Python puro (sem PIL/numpy), scripts em `workspaces/game-art/tools/c5/` (reprodutíveis: `terrain.py`, `veg06.py`, `veg08.py`, `water.py`, `wang.py`, `objects.py`, `tamer.py`, `digi_portrait.py`, `digi_comp.py`, `digi_rot.py`, `compare.py`, `scene.py`, `manifest.py`).
- **Não feito (proibido pelo brief):** integração no motor, alteração do `qo` (HEAD `3289e32`, `git status` limpo, conferido), do Link B (`lab-etapa6` HEAD `a944e80`, limpo, conferido), da Database ou dos saves; commit/push/deploy; acionar outros agentes. Os originais em `metodo-a-v2/_original` e `extraido/` não foram tocados.
- **Marcação:** [E] medido nesta sessão · [H] hipótese/proposta. Nenhum item deste documento está "aprovado": as avaliações abaixo são do produtor e precisam de revisão por sessão diferente (AGENTS.md §3) e da decisão do fundador.

---

## 1. Achado-base: as pranchas não têm grade de pixel real

[E] As 7 pranchas são ilustrações 1536×1024 RGB geradas por IA, com **pseudo-pixels de ~2 px borrados** (bordas com antisserrilhado, cores intermediárias) e **sem grade uniforme**:
- células do "Tileset Floresta (32×32)" da prancha 06 medem 42–45 px nas colunas da esquerda e **54–60 px** nas da direita, com a mesma altura (~42 px) — a "grade de 32" é falsa (detecção de período por perfil de bordas não achou período estável; medido por segmentação das células);
- os quadros "32×32" de Digimon na prancha 05 têm 33–47 px de altura no próprio PNG, borrados;
- a mesma prancha usa escalas diferentes entre painéis (árvore ≈ altura do Tamer no painel de vegetação; 2–3× o Tamer nos mockups).

**Método adotado (reversível):** recorte → remoção de fundo por flood-fill a partir da borda (branco, ou azul-marinho com critério por canal) → **redução por moda** para a grade-alvo (cada pixel novo = cor majoritária da célula de origem; sem interpolação, sem ampliação) → desfranja → quantização → despeckle → remoção de ilhas < 6 px → trim → pivô no pé. O fator de redução é **o da própria prancha** (tileset 06: 43 px → 32, fator 1,344; tileset 08: ~55 px → 32, fator 1,719) para cenário, e **o que leva à altura E5** para personagens.

## 2. O que foi aproveitado e de onde

| Pasta | Qtde | Origem (prancha → painel) | Observação |
|---|---|---|---|
| `terreno/` | 33 | 06 → "Tileset – Floresta de File Island" | 7 gramas (rampa P-ii, sem gradiente e sem costura), clareira de terra, 2 canteiros, 4 faces de desnível + caverna, 3 margens de água, 3 águas estáticas, 4 tábuas de ponte, 4 topos de desnível com grama, 2 bordas de mato, 1 penhasco com mato; **+ `transicao_grama_agua_wang16`** (derivado, ver §6) |
| `vegetacao/` | 34 | 06 → "Vegetação e Decoração" (30); 08 → "Tileset da Floresta" (4 árvores grandes) | 3 árvores de copa redonda (~55 px), cerejeira, pinheiro, 4 árvores grandes (59–69 px), 6 arbustos, 9 canteiros de flores, 4 tufos, 4 moitas, cogumelos, toco, tronco caído |
| `objetos/` | 33 | 06 → "Construções" e "Objetos"; 03 → "Referências de Ambientação"; 08 → seção de ponte | **santuário digital** (cristal em base de pedra), **marco digital**, **cabine telefônica**, **Digi-Egg** (2), antena, terminais, cápsula/cristal/caixa de dados, placas, cercas (3 + baixa), mourões, poste-tocha, bandeira, caixote, baú, barril, corda, pórtico, entrada de caverna, **seção de ponte com corrimão** (08), 5 pedras (06) |
| `agua/` | 6 | 06 → água e cachoeira do tileset | `rio_a` e `lago_a` (8 quadros, mesmo algoritmo do motor), `agua_a_base` (+ variação) para o shader `waterAnim`, `cachoeira_a` 32×64×8, `espuma_a` 32×16×8; GIFs em `agua/_previews/` |
| `tamer/` | 2 | 06 → "Tamer – Referência de Customização" (presets 6 e 2) | só vista **sul**, 41 px; `lab-character.json` no schema do M2 |
| `digimon/` | 17 | 04 → retratos grandes do topo (5 do elenco prioritário); 06 → "Digimons Principais" (4 complementares); 05 → "Andar" (Agumon e Koromon, rotações O/S + candidato de walk) | retratos na altura E5; ver §5 |
| `_comparacoes/` | — | — | Tamer A × B; Agumon A × DS × v2 reprovado; escala E5 sobre grade 32; água A × B; teste do Wang; cena de teste 12×8 tiles |

**Não aproveitado, de propósito:** prancha 01 "Tamers" (Tamer Masc. = óculos + camisa azul + cabelo castanho, semelhança com o Tai; Tamer Fem. = chapéu rosa, semelhança com a Mimi; linhas com nomes de personagens do anime — Tai, Matt, Sora, Izzy, Mimi, Joe, Kari), o prédio de telhado vermelho da prancha 01 (lembra Centro Pokémon — vetado no ADR), a cabana-domo e a tenda (vila, fora da floresta), Digivice, cartas e UI (fora do escopo e com IP do aparelho), Tamer de boné vermelho da 06 (risco Pokémon), placeholder 48×64 do pacote v2 (inferior; ver §4), terra/trilha arenosa contínua (vetada).

## 3. Água: A × B — decisão e justificativa

| | Água A (prancha 06 tratada) | Água B (`agua-v1`, v15b) |
|---|---|---|
| (A) arte | padrão de "rede" com células grandes; **a repetição de 32 px fica evidente** em área (ver `_comparacoes/agua_A_x_agua_B_4x.png`); cachoeira A é uma faixa de tile ruidosa, sem rocha nem bacia | textura miúda, repetição pouco perceptível; cachoeira B é um objeto composto (rocha, musgo, bacia com ondas) muito superior |
| (B) técnica | sem costura (corrigida), ciano P-ii, loop exato (8×4 px), GIFs | idem + já validada no motor (`waterAnim`) e no composto do C4 |

**Recomendação (reversível): usar a água do Link B para rio e lago e a cachoeira B no Link A**, como o próprio pacote pede ("preferir a água do Link B se melhor"). A água A fica em `agua/` como alternativa e como base do Wang grama↔água (mesma paleta, troca direta). **Custo da recomendação:** reduz a "identidade própria" do Link A neste item e mistura origem PixelLab no link ChatGPT — isso precisa ser dito ao fundador na comparação A/B.

## 4. Placeholders e lacunas por item

| Item | Situação | O que falta |
|---|---|---|
| **Tamer** | só vista **sul** estática (2 opções, 41×25 e 41×24 px) | **N, L, O e caminhada não existem** em nenhum Tamer original das pranchas (o único com 4 vistas é o Tamer da prancha 01, semelhante ao Tai — evitado). O motor do lab usa o quadro parado no lugar do walk (comportamento já existente em `lab-tamer.ts`). O placeholder 48×64 do pacote v2 tem 4×4 quadros, mas é um boneco de blocos sem rosto nem roupa legível, ~60 px — fica como última opção, não empacotado. |
| **Digimon (todos)** | 1 pose parada 3/4 (retrato) por espécie na altura E5 | **sem as outras direções e sem walk** utilizáveis. Os quadros "Andar 4 dir × 4f" da 05 têm **3 linhas, não 4** (não há vista de costas), as pernas quase não mudam e há quadros quebrados (ver §5.2). |
| Agumon / Koromon | + rotações O e S da prancha 05 (leste = espelho do oeste, nenhum pixel novo) e um candidato de walk oeste | rotação norte; walk real |
| Greymon, MetalGreymon, WarGreymon | só retrato | os quadros pequenos da 05 têm 33–47 px, abaixo da E5 (52/62/76) — usá-los exigiria ampliar, o que é proibido |
| Betamon, Kunemon, Palmon, Kuwagamon | só retrato (06) | idem |
| Transições de terreno | grama↔água completa (Wang 16, **derivada por código**, §6); margem de água da prancha só na orientação "grama em cima, água embaixo" | grama↔desnível em todas as orientações (cantos internos/externos), grama↔terra, margens laterais/inferiores com barranco desenhado |
| Ponte | 4 tábuas (tiles) + 1 seção 2×1 com corrimão (08) | ponte longa contínua com início/fim e corrimãos dos dois lados; as tábuas da 06 são horizontais (servem a uma travessia N–S; a ponte do mapa v15b é L–O → girar exige corrimão próprio) |
| Sombra | nenhuma sombra embutida (removida junto com o fundo) | sombra de contato deve vir do motor (regra do Style Bible) |

## 5. Personagens: escala e fidelidade

### 5.1 Escala [E]

| | Tamer A | Koromon | Agumon | Greymon | MetalGreymon | WarGreymon | Betamon | Kunemon | Palmon | Kuwagamon |
|---|---|---|---|---|---|---|---|---|---|---|
| Altura entregue (px) | 41 | 25 | 34 | 52 | 62 | 76 | 32 | 22 | 38 | 56 |
| Largura (px) | 25 | 34 | 32 | 51 | 73 | 78 | 39 | 22 | 31 | 68 |
| Faixa E5 (altura) | 40–42 (D8) | 22–28 | 33–35 (D8) | 48–58 | 56–68 | 70–84 | 28–36 | 18–26 | 34–42 | 50–62 |
| Tabela da própria prancha 04 | 36 (02/05) | 17 | 26 | 32 | 36 | 37 | — | — | — | — |
| Razão / tile 32 | 1,28 | 0,78 | 1,06 | 1,63 | 1,94 | 2,38 | 1,00 | 0,69 | 1,19 | 1,75 |

- A tabela da prancha (17→37 px, Mega só 2,2× o In-Training e **mais baixo que o Tamer de 36**) **contradiz a E5/D2** ("Megas com imponência", WarGreymon 70–84). Usei a E5, que prevalece; a tabela da prancha fica registrada como conflito, não como referência.
- Larguras fora da faixa E5: Koromon 34 (E5 26–34, no limite), MetalGreymon 73 (E5 48–62, **excede** por causa das asas abertas do retrato), WarGreymon 78 (E5 56–72, **excede**: o retrato mostra a "asa"/escudo aberto — a E5 já previa medir pose de asas abertas à parte), Kuwagamon 68 (dentro de 60–80), Kunemon 22 (E5 28–42, **abaixo**: a prancha desenhou uma abelha redonda, não uma larva).
- Visual: `_comparacoes/escala_E5_tamer_digimon_tile32_4x.png` (grade de 32 px) e `cena_teste_A_12x8_3x.png` (Tamer + Agumon no cenário A).

### 5.2 Walk da prancha 05 [E] (fórmula D10, bbox opaco)

| | D10 oeste | D10 sul | XOR de silhueta entre quadros | Leitura visual |
|---|---|---|---|---|
| Agumon | 5,88% | 8,33% | 6–20% | pernas praticamente paradas; a variação vem de ruído e de manchas residuais, não de passada. **Não é caminhada perceptível.** |
| Koromon | 0% | 0% | 10–17% | idem; na linha "sul" aparece um "pé/haste" sob o corpo (Koromon não tem pés) e o 4º quadro tem rosto duplicado |

Os 4 quadros ficam em `digimon/<espécie>/rotacoes_05/walk_west_candidato_4f.png` só como evidência — **não usar como walk**.

### 5.3 Fidelidade à espécie (contra o design oficial) [E visual, H onde indicado]

| Espécie | Fonte | Fidelidade |
|---|---|---|
| Koromon | 04 | boa: blob rosa, olhos vermelhos, orelhas longas |
| Agumon | 04 | boa: amarelo-alaranjado, olhos verdes, 3 garras brancas, sem listras/crista; postura curvada correta. Muito superior ao v2 reprovado (que lembra Charmander) e mais detalhado que o DS (25–27 px) — `_comparacoes/agumon_A_x_DS_x_v2reprovado_4x.png`. As versões da 05 (1:1) ficam borradas e "gordas", com perda de garras. |
| Greymon | 04 | boa: **crânio marrom com 3 chifres e listras azuis no corpo laranja, como o oficial** |
| MetalGreymon | 04 | média-boa: capacete metálico, braço-garra metálico, asas roxas, corpo laranja com listras; o cabelo vermelho saiu alaranjado na quantização; peito metálico simplificado |
| WarGreymon | 04 | média: armadura amarela, garras Dramon Destroyer e capacete corretos, **mas a prancha dá a ele formas de asa amarelas** — o oficial não tem asas (tem o escudo Brave Shield nas costas). Precisa revisão de quem conhece a espécie. |
| Betamon | 06 | boa: anfíbio verde com nadadeira laranja |
| Kunemon | 06 | **baixa**: desenhado como abelha redonda listrada; o oficial é uma larva alongada (amarelo/preto, antenas vermelhas em raio). Não usar como Kunemon. |
| Palmon | 06 | boa: corpo verde, flor rosa na cabeça |
| Kuwagamon | 06 | média: corpo vermelho de besouro e garras corretos; **pinças da cabeça vermelhas** (no oficial são prateadas) e asas brancas muito destacadas |

## 6. Itens derivados por código (não existem nas pranchas)

- `terreno/transicao_grama_agua_wang16.png` (+ `.json`): 16 tiles por cantos (máscara `NW<<3|NE<<2|SW<<1|SE`, bit 1 = grama), gerados a partir de `grama_01` e `agua_a_base`: campo bilinear dos cantos + ondulação periódica de período 1 tile (contínua nas costuras por construção) + limiar; margem de 1 px escuro e 1 px de espuma. Teste em `_comparacoes/teste_wang_grama_agua_3x.png`. **É arte derivada, não recorte** — marcado assim no manifest.
- Animações de água/cachoeira/espuma: deslocamento com wrap (mesmo algoritmo do motor) e tremor de 1 px; nenhum quadro desenhado à mão.
- Grama: remoção do gradiente de baixa frequência + rampa de 4 verdes por quantil (a textura é da prancha; os tons são da P-ii).

## 7. Problemas de cada prancha

| Prancha | Grade falsa | Fundo | Inconsistência entre quadros | Trilha marrom | Semelhança Tai / Pokémon | Outros |
|---|---|---|---|---|---|---|
| 01 asset sheet | sim (pseudo-pixel ~2 px) | branco | quadros pequenos (Idle/Andar/…) minúsculos e quase iguais | sim (tile de trilha de areia contínua) | **Tamer Masc. = Tai**; linhas "Tai/Matt/Sora/Izzy/Mimi/Joe/Kari"; **prédio de telhado vermelho tipo Centro Pokémon**; "Outros Digimons" das linhas Gabumon/Guilmon/Veemon com evoluções a conferir | logo "Digital Odyssey" com katakana |
| 02 spritesheet + mapa | sim | azul-escuro | quadros pequenos sem passada; "WaalGreymon" (erro de digitação) | **sim, no mapa-piloto** (trilhas de terra em todo o mapa) | Tamer da escala com óculos e camisa azul (Tai) | Mapa mostra Tamer com óculos |
| 03 mockup | ilustração | — | — | **sim** (caminhos de terra contínuos) | Tamer com óculos (Tai); NPCs parecidos com Matt/Mimi | combate com número de dano (156) e barra; serve como referência de ambientação, não como asset |
| 04 Digimon | retratos do topo: pseudo-pixel ~2–3 px, utilizáveis por redução; quadros pequenos ~1,5–2 px borrados | azul-escuro com gradiente + elipse de sombra | "4 dir" sem vista de costas; tabela de escala contraria a E5 | — | — | WarGreymon com "asas" |
| 05 Digimon | quadros "32×32" medem 33–47 px | azul quase preto | **3 linhas no lugar de 4 direções; pernas paradas no "Andar"; Koromon com pé; rosto duplicado** | — | Tamer da tabela de escala com óculos (Tai) | declara "pivô (16,31)" que não corresponde aos quadros |
| 06 asset pack | células de 42–60 px para "32×32" | branco (o mais fácil de recortar) | — | sim (tile de trilha) | Tamers de customização: preset 4 (cabelo castanho) ≈ Tai sem óculos, preset 5 rosa ≈ Mimi, variação de boné vermelho (risco Pokémon) | Kunemon como abelha; Kuwagamon com pinças vermelhas; interface com "Lutar/Digimon/Itens/Fugir" em tela separada (contraria o ADR de combate no mapa) |
| 08 mockup + tileset | sim | azul-escuro | sprites da tabela iguais aos da 05 | sim | **Tamer com óculos e camisa azul (Tai)** | árvores grandes de boa qualidade; cabine telefônica e Digi-Egg reaproveitáveis |

## 8. Avaliação por item — (A) artística e (B) técnica, separadas

Escala de leitura usada aqui: alta / média / baixa. **Não é nota de homologação** (a matriz §8 do Style Bible e a rubrica rev. 2 ficam para a revisão independente).

| Item | (A) artística | (B) técnica |
|---|---|---|
| Grama (7) | **média-baixa**: textura legível, mas os tons olivas da P-ii ficam opacos perto dos objetos saturados; listras verticais em `grama_01` aparecem em área grande (repetição) | **alta**: 32×32, sem costura, 4 cores, opaca |
| Desnível/penhasco, margem, canteiros (19) | **média**: rochas laranja/marrom vivas, boa leitura de volume; destoam da grama oliva (dois "mundos" de saturação) | **média**: 32×32 corretos, mas **não tileiam entre si** (bordas da prancha não casam) e não há cantos/peças de ligação |
| Wang grama↔água (16) | **média**: margem orgânica e limpa, porém simples (sem barranco em perspectiva) | **alta**: costuras exatas, metadados de cantos |
| Ponte (tábuas + seção 08) | **média**: madeira legível; sem corrimão nas tábuas | **média**: tábuas 32×32 ok; orientação não serve à ponte L–O do mapa sem peça nova |
| Árvores (06, ~55 px) | **média-alta**: copas bonitas, contorno escuro, cerejeira e pinheiro dão variedade; um pouco pequenas para "floresta densa" | **alta**: alfa real, pivô na base, sem ilhas |
| Árvores grandes (08, 59–69 px) | **alta** para o cenário A: volume e luz bons | **média-alta**: alfa real; sem contorno escuro (a fonte não tem), borda levemente serrilhada |
| Arbustos, flores, tufos, moitas, pedras, toco, tronco (30) | **média-alta**: variados e coerentes entre si | **alta**: alfa real, 22–40 px |
| Objetos digitais e santuário (santuário, marco, cabine, Digi-Egg, terminais) | **média-alta**: leitura clara de "digital" no cenário natural; cabine telefônica é referência direta ao anime (risco de IP já coberto pela exceção de fangame) | **alta**: alfa real, pivô na base |
| Água A (rio/lago) | **média-baixa**: repetição de 32 px evidente | **alta**: loop exato, sem costura, P-ii |
| Cachoeira/espuma A | **baixa**: faixa ruidosa sem rocha/bacia | **média**: loop exato; só rolagem |
| Tamer A (S) | **média**: chibi legível, identidade própria (cabelo preto ou azul, jaqueta azul); cabeça grande demais para os 41 px e sem detalhe de acessório digital pedido pelo C4 | **baixa como jogável**: 1 direção, sem walk |
| Retratos de Digimon (9) | **média-alta** em Koromon, Agumon, Greymon, Betamon, Palmon; **média** em MetalGreymon, WarGreymon, Kuwagamon; **baixa** em Kunemon (§5.3) | **baixa como jogável**: 1 pose, sem direções nem walk; alfa e pivô ok; alturas na E5 |
| Rotações 05 (Agumon/Koromon) | **baixa-média**: borradas, garras somem | **média**: O/S/L (L espelhado), sem N, walk inutilizável |

## 9. O que falta para chegar à qualidade das referências

1. **Personagens animados:** as pranchas só têm Digimon e Tamer com qualidade em **uma pose**. Falta, para cada um, N/S/L/O + walk de 4–8 quadros com passada real. Caminhos possíveis (decisão do fundador, nenhum autorizado aqui): pedir ao ChatGPT folhas por direção em grade real (fundo transparente, tamanho nativo); redesenho manual assistido; rota híbrida (retrato A como referência + animação em ferramenta).
2. **Terreno conectável:** peças de ligação de desnível (cantos internos/externos, laterais), margens de água em todas as orientações com barranco, e uma ponte L–O com corrimão.
3. **Harmonia de paleta:** a grama P-ii (oliva) e os objetos com tons quentes da P-iii parecem de jogos diferentes. Ou a grama vai para um verde mais vivo (sai da P-ii estrita) ou objetos/penhascos são dessaturados. **É o conflito P-ii × referência ChatGPT, aberto (D9) — não resolvido aqui.**
4. **Densidade de pixel:** cenário (fator 1,34–1,72) e personagens (fator 2,8–4,9 nos retratos) vêm de reduções diferentes; nos retratos sobra mais detalhe por pixel que nas árvores. Na cena de teste a diferença é aceitável, mas precisa ser julgada no motor.
5. **Água:** usar a B (recomendação §3) ou redesenhar a A com textura miúda.

## 10. Para o game-dev integrar (próximo passo, não feito aqui)

- Ler `game-ready/manifest.json` (origem, recorte, w/h, quadros, pivô, paleta, `colisao_sugerida`).
- Tamer: `tamer/<id>/lab-character.json` + `rotations/south.png` já no schema do M2/`lab-tamer.ts` (só `S`; o motor cai no quadro parado para o walk — comportamento existente).
- Água: decidir A ou B (§3); se A, `agua/agua_a_base.png` no shader `waterAnim` ou as strips de 8 quadros.
- Wang grama↔água: `terreno/transicao_grama_agua_wang16.json` (cantos por tile).
- Digimon: retratos com pivô no pé; não há atlas de direções — o mesmo quadro serve para todas, ou espelhado para leste (decisão de integração; registrar como placeholder).
- Sombra de contato: do motor.

## 11. Decisões que dependem do fundador

1. Água do Link A: B (recomendada) ou A.
2. Paleta da grama: P-ii estrita (atual) ou verde mais vivo próximo da referência ChatGPT.
3. Tamer A: cabelo preto ou azul; e como obter N/L/O + walk (nova rodada no ChatGPT, redesenho manual ou outro caminho).
4. Como obter direções/walk dos Digimon (mesmas opções) e se o retrato único é aceitável como placeholder no Link A.
5. WarGreymon com "asas" e Kunemon-abelha: aceitar como referência ou pedir redesenho.
6. Tabela de escala da prancha (17–37) × E5: confirmar que a E5 prevalece no Link A (adotada aqui).
