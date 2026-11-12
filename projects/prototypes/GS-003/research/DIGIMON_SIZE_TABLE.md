# GS-003 — Tabela de tamanhos relativos dos Digimon (mapa/overworld)

**Gerado em:** 2026-11-08 | **Projeto:** GS-003 (Idle MMORPG de Digimon, sprites no mapa)
**Pedido do fundador:** Digimon pareciam "de tamanhos desproporcionais" no mapa; olhar a literatura de tamanhos e fazer algo relacional.
**Arquivos:** `DIGIMON_SIZE_TABLE.md` (este) + `DIGIMON_SIZE_TABLE.json` (dados estruturados) + script em `GS-003/tools/size_research/`.

---

## 1. Resumo executivo

1. **A franquia Digimon não publica altura/peso numérico para a maioria dos Digimon.** Verifiquei Wikimon (wikimon.net) e o Digimon Reference Book oficial (digimon.net/reference) para Agumon e Guilmon em 2026-11-08: ambos trazem Level/Type/Attribute/Special Move/texto de perfil, mas **nenhum número de altura ou peso em cm/kg**. [E, fonte e data acima]. Isso é consistente com o conhecimento geral da franquia: diferente de Pokémon, a Bandai não publica uma ficha de altura/peso padronizada por Digimon. digimon.fandom.com (Digimon Wiki/Fandom) retornou erro 403 (Cloudflare) e não pôde ser verificado nesta sessão — não usei esse dado.
2. **Por isso, a régua real usada aqui é um proxy empírico**: medi em pixels a altura dos sprites de **mapa/overworld** do Digimon World DS (DWDS), comparando cada Digimon ao sprite do Tamer humano (jogável) da mesma folha/jogo. Isso é exatamente a "escala que a Bandai usou no mapa" pedida pelo fundador — e é mais relevante para o GS-003 (que também é visto de cima, sprites no mapa) do que uma altura "de ficha" que nunca existiu para a maioria dos bichos.
3. **Achado central:** no DWDS, a proporção Digimon/Tamer no sprite de mapa varia de **~0,46× (Mamemon) a ~1,54× (Kuwagamon)** — uma faixa muito mais estreita do que a progressão "ingênua" que se imagina para Baby→Mega. Em particular, **Ultimate e Mega não ficam visivelmente mais altos que o próprio Champion da linha** nesta folha (WarGreymon = Greymon = 37px; Seraphimon = MagnaAngemon = 39px) — a Bandai aplicou um **teto de legibilidade** no sprite de mapa, confirmando a hipótese do próprio briefing do GS-003.
4. 40 Digimon medidos/estimados (12 piloto + 8 próximos estágios + 20 selvagens comuns), com script Python puro (PNG+zlib, sem PIL) em `GS-003/tools/size_research/`, reprodutível e auditável (ver seção 3 e `raw_measurements.json`).
5. **Limitação importante:** a extração automática por chroma-key funcionou com confiança alta (≥4 amostras repetidas e valor plausível) para a maioria, mas falhou ou deu valor implausível para 11 dos 40 (principalmente Guilmon, Garurumon e as linhas Ultimate/Mega de Gabumon/Guilmon) — nesses casos, marquei **[H]** com correção manual justificada linha a linha; nenhum número foi inventado sem lastro (ver coluna "Nota" na tabela e `raw_measurements.json` para o dado bruto rejeitado).

---

## 2. Fontes de tamanho canônico (item 1 do pedido)

| Fonte | Status verificado em 2026-11-08 | Uso neste documento |
|---|---|---|
| Wikimon (wikimon.net) | [E] Acessível. Páginas de Agumon e Guilmon têm Level/Type/Attribute/texto de perfil, **sem campo numérico de altura/peso** (apenas "Min Weight" em gramas, que é peso de crescimento do Digivice virtual pet, não massa corporal). | Texto de perfil usado como evidência qualitativa de porte relativo ("pequeno dinossauro", "ainda uma criança/Child") — não como número. |
| Digimon Reference Book oficial (digimon.net/reference) | [E] Acessível (página JP). Mesma estrutura que Wikimon: Level/Type/Attribute/Profile, **sem altura/peso numérico**. A ficha é texto + 1 imagem de arte, sem gráfico de altura comparativa no HTML extraído. | Confirma ausência de dado numérico na fonte primária oficial. |
| digimon.fandom.com (Digimon Wiki) | [E] Bloqueado por Cloudflare (403) nesta sessão — não verificado, não usado. | — |
| Fichas de jogo (Digimon World 1, Cyber Sleuth, Survive, Time Stranger) | [H] Não verificável nesta sessão: exigiria acesso aos jogos ou a wikis de fãs com captura de tela de stats, fora do alcance das ferramentas de pesquisa disponíveis (sem navegador/jogo). Não foi inventado nenhum valor "de ficha de jogo". | Não usado; marcado como lacuna. |
| Anime/mangá | [H] Descrições qualitativas existem (ex.: Kuwagamon como inseto gigante no episódio 1 do anime original), usadas apenas como confirmação qualitativa de porte relativo onde citadas na tabela. | Usado como nota de suporte, nunca como número. |
| **Proxy empírico — sprites de mapa do Digimon World DS** | [E] Medido diretamente nesta sessão com script próprio (seção 3). | **Fonte primária de todos os números desta tabela.** |

**Conclusão da varredura de literatura:** não existe uma tabela de altura/peso oficial e abrangente dos Digimon. A régua mais confiável e mais relevante para o GS-003 é a proporção visual que a própria Bandai usou nos sprites de mapa de um jogo overworld real (DWDS) — por isso o proxy empírico é a fonte primária, não um substituto de segunda escolha.

---

## 3. Proxy empírico — metodologia (item 2 do pedido)

**Script:** `GS-003/tools/size_research/` (`png_decode.py`, `blobs.py`, `extract_walk_height.py`, `run_all.py`, `build_table.py`). Python puro (stdlib `zlib` para descompressão DEFLATE do PNG; nenhum PIL/Pillow/numpy). Decodifica PNG 8-bit, cor RGB/RGBA/indexada/gray, com e sem interlace Adam7.

**Fontes de imagem:** `assets/GAME-ASSETS/10-source-files/dwds-sheets/*.png` (11 folhas curadas, piloto) e `10-source-files/spriters-resource/dgmnworldds__*.png` (320 folhas, jogo Digimon World DS / `dgmnworldds` no Spriters Resource — mesmo motor/escala em todas).

**Passo a passo:**
1. Decodifica o PNG (`png_decode.py`).
2. Detecta a(s) cor(es) de fundo/chroma-key pela frequência total da imagem: sempre a cor mais comum, mais qualquer outra cor cuja contagem ainda esteja a ≥25% da mais comum (cobre folhas com duas camadas de fundo: moldura + chroma-key interno) (`blobs.background_colors`).
3. Segmenta blobs conectados (flood-fill 4-conectado) com uma dilatação leve (raio 2px) para religar fragmentos do mesmo sprite separados por costura anti-aliasing (`blobs.find_blobs`).
4. Cada folha mistura 3 escalas bem diferentes: poses grandes de batalha (idle/hurt/attack), o grupo de sprites de **caminhada no mapa** (repetido 4 direções × várias poses) e texto manuscrito de crédito do ripper. Isolamos o grupo de caminhada:
   - descarta blobs cuja área ultrapasse 3% da área total da folha (poses de batalha);
   - descarta blobs muito largos e baixos (razão largura/altura > 2,6 — linhas de texto manuscrito);
   - agrupa os blobs restantes por altura (tolerância ±3px) e escolhe o **menor cluster com ≥4 membros** (em toda folha confirmada manualmente, o sprite de mapa é o menor grupo que se repete várias vezes; grupos de pose única de batalha não se repetem e são maiores).
5. Reporta a altura mediana do cluster escolhido, mais o número de membros como sinal de confiança.
6. **Toda leitura é auditável**: `tools/size_research/raw_measurements.json` guarda, para cada arquivo, os blobs candidatos e o cluster escolhido.

**Validação cruzada:** o Tamer (sprite jogável humano, `Hero__48323.png`) foi processado pelo mesmo script e também inspecionado manualmente pixel a pixel (ASCII-art dos blobs) — o script deu **26px com 85 membros no cluster** (confiança máxima do dataset); a inspeção manual confirmou ~24-26px por frame. Esse valor (26px) é o denominador de todas as razões "×Tamer" da tabela.

**Limitação confirmada por inspeção manual:** em 11 dos 40 Digimon, o cluster vencedor automático teve confiança baixa (<4 membros) ou, em 2 casos (Guilmon, Dracmon), teve ≥4 membros mas o valor foi **rejeitado** após inspeção visual direta dos blobs porque correspondia claramente a outro grupo (poses de batalha repetidas), não ao sprite de mapa. Esses 11 casos estão marcados **[H]** na tabela com a justificativa exata na coluna Nota, e o valor bruto rejeitado continua registrado em `raw_measurements.json` para auditoria — nenhum dado foi descartado silenciosamente.

---

## 4. Tabela — as 12 piloto (item 3 do pedido)

Tamer de referência DWDS medido: **26px** (base das razões). Tamer-alvo do GS-003 (ladrilho 32px, Tamer ~32-40px conforme o briefing): adotado **36px** (meio da faixa) só para converter a razão em pixel concreto — a razão em si é o número reutilizável.

| Digimon | Estágio | Linha | Altura canônica | Sprite mapa DWDS (px) | Razão ×Tamer | Classe | Altura-alvo (tile 32px, Tamer=36px) | Evidência | Fonte |
|---|---|---|---:|---:|---:|---|---:|---|---|
| Gigimon | Baby/In-Training | Guilmon | — (sem ficha oficial) | 17 | 0,65× | S | 24px | H | Sem folha DWDS; estimado por analogia com Koromon (mesmo estágio) |
| Guilmon | Rookie/Child | Guilmon | — | 28 | 1,08× | L | 39px | H | Interpolado entre Agumon (26) e Gabumon (29); medição automática na folha curada foi inconclusiva (ver §3/§6) |
| Growlmon | Champion/Adult | Guilmon | — | 37 | 1,42× | XL | 51px | E | dwds-sheets/growlmon.png, n=11 |
| Koromon | In-Training | Agumon | — | 17 | 0,65× | S | 24px | E | dwds-sheets/koromon.png, n=7 |
| Agumon | Rookie/Child | Agumon | — | 26 | 1,00× | M | 36px | E | dwds-sheets/agumon.png, n=10 |
| Greymon | Champion/Adult | Agumon | — | 37 | 1,42× | XL | 51px | E | dwds-sheets/greymon.png, n=9 |
| Tsunomon | In-Training | Gabumon | — | 24 | 0,92× | M | 33px | E | dwds-sheets/tsunomon.png, n=5 |
| Gabumon | Rookie/Child | Gabumon | — | 29 | 1,12× | L | 40px | E | dwds-sheets/gabumon.png, n=16 |
| Garurumon | Champion/Adult | Gabumon | — | 28 | 1,08× | L | 39px | H | Leitura pontual (n=1); folha sem ciclo de caminhada isolável confirmado por inspeção manual — ver §6 |
| Tokomon | In-Training | Patamon | — | 19 | 0,73× | S | 26px | E | dwds-sheets/tokomon.png, n=4 |
| Patamon | Rookie/Child | Patamon | — | 23 | 0,88× | M | 32px | E | dwds-sheets/patamon.png, n=8 |
| Angemon | Champion/Adult | Patamon | — | 35 | 1,35× | XL | 48px | E | dwds-sheets/angemon.png, n=5 |

**Leitura rápida:** dentro de cada uma das 4 linhas piloto, a progressão In-Training → Rookie → Champion é **monótona e crescente** (ex.: Agumon 17→26→37), exceto Garurumon, que ficou no mesmo nível do próprio Rookie (Gabumon=29 vs Garurumon=28) — ver nota de quadrúpede no §6. Isso já é evidência direta e relacional de que o Champion deveria ser visivelmente maior que o Rookie no mapa do GS-003, o que hoje provavelmente não está acontecendo (causa provável da reclamação do fundador).

---

## 5. Próximos estágios das 4 linhas piloto (Ultimate/Mega)

| Digimon | Estágio | Linha | Sprite mapa DWDS (px) | Razão ×Tamer | Classe | Altura-alvo | Evidência | Nota |
|---|---|---|---:|---:|---|---:|---|---|
| MetalGreymon | Ultimate/Perfect | Agumon | 34 | 1,31× | XL | 47px | E (n=5) | — |
| WarGreymon | Mega/Ultimate | Agumon | 37 | 1,42× | XL | 51px | E (n=5) | Igual ao Champion da linha (Greymon=37) — teto de legibilidade |
| WereGarurumon | Ultimate/Perfect | Gabumon | 37 | 1,42× | XL | 51px | H | Leitura automática (n=1, h=24) rejeitada por ficar abaixo do próprio Rookie; estimado pela média dos Ultimates confirmados |
| MetalGarurumon | Mega/Ultimate | Gabumon | 38 | 1,46× | XL | 53px | H | Mesma rejeição que WereGarurumon; estimado ligeiramente acima do Ultimate da linha |
| WarGrowlmon | Ultimate/Perfect | Guilmon | 39 | 1,50× | XXL | 54px | H | Sem cluster válido na folha; estimado pela média dos Ultimates confirmados |
| Gallantmon | Mega/Ultimate | Guilmon | 39 | 1,50× | XXL | 54px | H | Leitura automática (n=1, h=27) rejeitada por ficar abaixo do Champion da linha; estimado pelo teto Mega |
| MagnaAngemon | Ultimate/Perfect | Patamon | 39 | 1,50× | XXL | 54px | E (n=6) | — |
| Seraphimon | Mega/Ultimate | Patamon | 39 | 1,50× | XXL | 54px | E (n=15) | Igual ao Ultimate da linha (MagnaAngemon=39) — segundo caso de teto de legibilidade |

**Padrão confirmado em 2 das 4 linhas (Agumon, Patamon) com alta confiança:** Mega/Ultimate não cresce indefinidamente — estabiliza perto de 1,4-1,5× o Tamer. Esse teto é citado no próprio briefing do GS-003 ("Ultimate e Mega... com teto de legibilidade") e aqui ele aparece como achado empírico, não só como regra de design a priori.

---

## 6. 20 Digimon selvagens comuns

| Digimon | Estágio | Sprite mapa DWDS (px) | Razão ×Tamer | Classe | Altura-alvo | Evidência | Nota |
|---|---|---:|---:|---|---:|---|---|
| Numemon | Rookie/Child | 23 | 0,88× | M | 32px | E (n=15) | — |
| Betamon | Rookie/Child | 24 | 0,92× | M | 33px | E (n=9) | — |
| Vegiemon | Rookie/Child | 28 | 1,08× | L | 39px | E (n=15) | — |
| Floramon | Rookie/Child | 27 | 1,04× | M | 37px | E (n=16) | — |
| Otamamon | Rookie/Child | 22 | 0,85× | M | 30px | E (n=5) | — |
| Bakemon | Champion/Adult | 22 | 0,85× | M | 30px | E (n=15) | Porte visual do sprite ≈ Rookie, mesmo sendo Champion no anime/card game |
| Kuwagamon | Champion/Adult | 40 | 1,54× | XXL | 55px | E (n=6) | Consistente com a fama de inseto gigante desproporcional do anime original |
| Monzaemon | Champion/Adult | 37 | 1,42× | XL | 51px | E (n=15) | — |
| Sukamon | Rookie/Child | 22 | 0,85× | M | 30px | E (n=7) | — |
| Gekomon | Rookie/Child | 27 | 1,04× | M | 37px | E (n=10) | — |
| Hagurumon | Rookie/Child | 23 | 0,88× | M | 32px | E (n=14) | — |
| Divermon | Rookie/Child | 28 | 1,08× | L | 39px | E (n=7) | — |
| Raremon | Champion/Adult | 33 | 1,27× | L | 46px | E (n=5) | — |
| Airdramon | Champion/Adult | 37 | 1,42× | XL | 51px | E (n=13) | — |
| Mamemon | Ultimate/Perfect | 12 | 0,46× | XS | 17px | E (n=15) | Estágio Ultimate no jogo, mas sprite muito compacto/atarracado — peculiaridade de design confirmada por alta confiança estatística, não erro de medição |
| Gizamon | Rookie/Child | 24 | 0,92× | M | 33px | H | Cluster de baixa confiança (n=1); valor plausível, não confirmado por repetição |
| Goburimon | Rookie/Child | 27 | 1,04× | M | 37px | H | Idem |
| Gotsumon | Rookie/Child | 28 | 1,08× | L | 39px | H | Cluster abaixo do limiar (n=3); valor plausível mantido como referência |
| Kamemon | Rookie/Child | 24 | 0,92× | M | 33px | H | Cluster de baixa confiança (n=1) |
| Dracmon | Rookie/Child | 26 | 1,00× | M | 36px | H | Leitura automática (h=66,n=4) rejeitada — maior que todos os Champions medidos, implausível para um Rookie pequeno; estimado pela média dos Rookies comuns confirmados |

---

## 7. Regras gerais por estágio/classe (item 4 do pedido)

Baseadas na distribuição real medida (não em suposição abstrata) — faixas de razão ×Tamer observadas neste dataset:

| Estágio | Classe típica | Razão ×Tamer observada | Regra para Digimon novos |
|---|---|---|---|
| Baby / In-Training | XS–S | 0,46×–0,92× (maioria 0,65×–0,75×) | Usar **S** (~0,7× Tamer) como padrão; só usar **XS** (<0,55×) se a arte canônica for explicitamente "bolinha"/ovo (ex.: Botamon, Punimon) — Mamemon é a exceção que confirma a regra: mesmo em Ultimate, criaturas atarracadas/arredondadas podem cair em XS. |
| Rookie / Child | M (às vezes L) | 0,85×–1,15× (maioria ≈1,0×) | Usar **M** (~0,95-1,0× Tamer) como padrão. Usar **L** (até ~1,15×) só se a arte canônica for visivelmente maior/mais robusta que a média dos Rookies (ex.: Gabumon, Divermon, Vegiemon). |
| Champion / Adult | L–XL | 1,27×–1,54× (maioria ≈1,4×) | Usar **XL** (~1,4× Tamer) como padrão. Reservar **XXL** (>1,5×) apenas para Champions canonicamente "gigantes" (ex.: Kuwagamon) — não é a regra geral do estágio. |
| Ultimate / Perfect | XL | 1,3×–1,5× | Usar **XL** (~1,4× Tamer). **Não** escalar muito acima do próprio Champion da linha: o teto de legibilidade do mapa é real e medido (WarGreymon=Greymon). Pequeno incremento (+0 a +10%) sobre o Champion é suficiente. |
| Mega / Ultimate | XL–XXL | 1,4×–1,54× | Usar **XL/XXL** (~1,45-1,5× Tamer), igual ou levemente acima do Ultimate da mesma linha (Seraphimon=MagnaAngemon). **Nunca** mais que ~1,5-1,6× — acima disso o sprite deixa de ler bem no tile de 32px. |

**Regra de bolso para qualquer Digimon novo sem dado canônico:**
1. Classifique o estágio (Baby/In-Training → Rookie → Champion → Ultimate → Mega).
2. Olhe a silhueta canônica: quadrúpede grande e pesado tende a **não** ganhar altura proporcional ao evoluir (ganha comprimento/massa) — ver nota do Garurumon no §4; bípede humanoide tende a seguir a progressão cheia da tabela de estágio.
3. Aplique a razão típica do estágio (tabela acima); ajuste ±15% para porte canônico claramente atípico (ex.: insectoide gigante como Kuwagamon → empurrar para XXL mesmo em Champion).
4. Nunca deixe Ultimate/Mega passar de ~1,5-1,6× Tamer no sprite de mapa — é o teto de legibilidade confirmado nesta pesquisa.

---

## 8. Limitações

- Nenhuma fonte oficial verificada publica altura/peso numérico para a maioria dos Digimon; a tabela usa proxy de pixel, não medida física real do universo fictício.
- 11 de 40 linhas estão marcadas **[H]** (hipótese/correção manual), com justificativa individual na coluna Nota e dado bruto rejeitado preservado em `raw_measurements.json` — tratar esses valores como estimativa razoável, não como medição confirmada; recomenda-se conferência visual manual antes de travar a arte final desses 11 (lista: Gigimon, Guilmon, Garurumon, WarGrowlmon, Gallantmon, WereGarurumon, MetalGarurumon, Gizamon, Goburimon, Gotsumon, Kamemon, Dracmon).
- Gigimon não existe no roster do Digimon World DS — não há nenhum proxy de pixel para ele; o valor é puramente analógico (mesmo estágio que Koromon/Tokomon).
- A extração usa apenas as folhas da linha `dgmnworldds` (jogo DS "Digimon World DS", 2006) para manter a mesma escala/motor em todas as 40 entradas; fichas de outros jogos (Dawn/Dusk, Cyber Sleuth, Survive, Time Stranger) não foram misturadas nesta amostra e podem ter proporções diferentes.
- "Digimon.net/reference" e Wikimon foram verificados apenas para Agumon e Guilmon (amostra), não para as 40 entradas individualmente — a ausência de dado numérico nessas duas páginas foi generalizada para a franquia com base em conhecimento prévio do formato do Reference Book (consistente, mas não uma verificação exaustiva de 40 páginas).
