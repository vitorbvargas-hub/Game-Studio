# ESTUDO_ESCALA_DIGIMONS — Etapa 6, Comando 1 (entregável do §5)

- **Autor:** game-research (subagente) · **Data:** 2026-11-13
- **Regra:** nunca inventar altura. Campo sem dado fica "não documentado". Estimativa visual sempre marcada **[INFERÊNCIA]**. Nada aqui é implementado no runtime.

## 1. Resumo executivo

1. **Achado central: a franquia Digimon não publica altura nem peso físico numérico para a esmagadora maioria das espécies.** Verifiquei isso de duas formas nesta sessão (não é suposição):
   - `database/sources_cache/refbook_extract.json` (extrato já coletado pela Database 1.0 de 81 espécies do Digimon Reference Book oficial) só tem `name_en`, `level_en`, `type_en`, `attribute_en`, `special_moves_en` — **nenhum campo de altura ou peso**.
   - Reconferido em vivo em 2026-11-13: `digimon.net/reference_en/detail.php?directory_name=agumon` traz Level/Type/Attribute/Special Move/texto de perfil, sem nenhum número de altura ou peso. `wikimon.net/Agumon` traz um campo "**Min Weight: 20g / 15g**" — mas isso é a estatística de **crescimento do virtual pet** (Digimon Pendulum/Digital Monster, Agumon's Profile [11], Pendulum Progress 1.0 [12]), **não** massa corporal real; não há campo de altura nessa página.
2. **Isso confirma e reaproveita** um achado já registrado em `research/DIGIMON_SIZE_TABLE.md` (2026-11-08, game-research), que chegou à mesma conclusão de forma independente, verificando Agumon e Guilmon. Esse documento é a **fonte primária reaproveitada** desta entrega (data original mantida, status `reused_unverified`), porque já contém um proxy empírico robusto: a altura em pixel dos sprites de **mapa/overworld** do Digimon World DS (DWDS), medida contra o Tamer jogável da mesma folha.
3. Como não existe régua de altura física oficial, as classes "Pequeno ≤30 cm / Médio ≤100 cm / Grande ≤300 cm / Gigante >300 cm" propostas no comando **não podem ser calculadas** a partir de dado real — qualquer número em cm atribuído a uma espécie específica seria invenção. Este documento usa, em vez disso, (a) o proxy de pixel do DWDS como escala de **gameplay** (o que o comando pede na coluna "escala de gameplay sugerida", em px) e (b) uma leitura qualitativa [INFERÊNCIA] de porte por estágio/padrão canônico para a coluna "classe proposta" — nunca um cm específico por espécie.
4. **Achado adicional (não pedido, mas relevante):** o jogo **já tem** uma escala de colisão implementada, independente da altura do sprite — `prototype/world/src/data/world-species.json` define `radiusByStage` (raio de colisão por estágio numérico: 12/16/22/26/30 px para estágios 1–5), igual para todas as espécies do mesmo estágio. Isso é uma 3ª régua, distinta da altura de pixel e da altura real — ver §4.
5. **3 Digimon recomendados** para o laboratório (§5): **Koromon** (pequeno), **Agumon** (médio), **WarGreymon** (grande/gigante) — os três com sprite DS medido, linha completa no piloto da Database e já no roster do jogo.

## 2. Fontes consultadas nesta sessão

| Fonte | Categoria | Data de acesso | O que deu |
|---|---|---|---|
| Digimon Reference Book oficial (`digimon.net/reference_en`) | 1 (oficial) | 2026-11-13 (reconferido; já coletado em 2026-11-12 na Database) | Confirma ausência de altura/peso numérico |
| Wikimon, infobox Agumon (`wikimon.net/Agumon`) | 3 (wiki, cita primária) | 2026-11-13 | Confirma ausência de altura; identifica "Min Weight" como estatística de virtual pet, não massa real |
| `digimon.fandom.com` | — | 2026-11-13 | **Bloqueado** (HTTP 403, Cloudflare). Não verificado, não usado. |
| `research/DIGIMON_SIZE_TABLE.md` | Proxy empírico próprio (medição de sprite, não fonte da franquia) | **2026-11-08** (reaproveitado, `reused_unverified`) | Fonte primária das alturas-alvo em px desta tabela |
| `qa/ETAPA2_HOMOLOGACAO.md` §E item 2 | 1 (evidência interna do projeto) | 2026-11-12 (reaproveitado) | Dimensões de canvas (bounding box) dos sprites atualmente importados: Tamer ~36px, Rookies DS 30–34px, Champions DS 38–42px (Greymon 40×42, Garurumon 38×35), Koromon 28×22, WarGreymon integrado com `mapScale 2` (~72px) |
| `prototype/world/src/data/world-species.json` | 1 (evidência interna do projeto) | 2026-11-13 | `radiusByStage`: 12/16/22/26/30 px (estágios 1–5) — raio de colisão atual, por estágio, igual para toda espécie do estágio |

## 3. Tabela por espécie — as 23 do piloto da Database

Convenção de estágio normalizada da Database (JP). Tamer-alvo adotado por `DIGIMON_SIZE_TABLE.md`: 36px (meio da faixa 32–40 do briefing). Tile: 32px.

| Espécie (id piloto) | Estágio | Altura documentada | Fonte / confiança | Estimativa visual [INFERÊNCIA] | Classe proposta | Escala de gameplay sugerida (px, Tamer=36px) |
|---|---|---|---|---|---|---|
| Botamon (`sp.botamon`) | baby_i | não documentado | — | [INFERÊNCIA] "bolinha"/ovo, como Koromon/Punimon no mesmo estágio; sem sprite DWDS próprio | Pequeno (proposto, por analogia de estágio) | ~22-24px (por analogia com Koromon/Tokomon do mesmo estágio) **[H]** |
| Punimon (`sp.punimon`) | baby_i | não documentado | — | [INFERÊNCIA] idem Botamon; descrição oficial não dá porte | Pequeno (proposto) | ~22-24px **[H]** |
| Gigimon (`sp.gigimon`) | baby_ii | não documentado | DWDS: `DIGIMON_SIZE_TABLE.md` §4, **[H]** (sem folha própria; estimado por analogia com Koromon, mesmo estágio) | [INFERÊNCIA] blob pequeno, estágio In-Training II | Pequeno (proposto) | 24px **[H]** |
| Koromon (`sp.koromon`) | baby_ii | não documentado | DWDS 17px, 0,65× Tamer, **[E]** `dwds-sheets/koromon.png`, n=7 | — (medido, não é inferência) | Pequeno (proposto) | **24px** |
| Tsunomon (`sp.tunomon`) | baby_ii | não documentado | DWDS 24px, 0,92× Tamer, **[E]** `dwds-sheets/tsunomon.png`, n=5 | — | Pequeno/Médio, fronteira (proposto) | **33px** |
| Agumon (`sp.agumon`) | child | não documentado | DWDS 26px, 1,00× Tamer (referência do dataset), **[E]** `dwds-sheets/agumon.png`, n=10 | Perfil oficial diz "pequeno dinossauro", "ainda em crescimento" — consistente com porte de criança/médio | Médio (proposto) | **36px** |
| Dorumon (`sp.dorumon`) | child | não documentado | Sem folha DWDS na amostra de `DIGIMON_SIZE_TABLE.md` | [INFERÊNCIA] quadrúpede pequeno-médio, por analogia com outros Rookies de 4 patas (ex.: linha de referência para quadrúpede no §4 de `DIGIMON_SIZE_TABLE.md`) | Médio (proposto) | ~33-36px **[H]** |
| Gabumon (`sp.gabumon`) | child | não documentado | DWDS 29px, 1,12× Tamer, **[E]** `dwds-sheets/gabumon.png`, n=16 | — | Médio/Grande, fronteira (proposto) | **40px** |
| Guilmon (`sp.guilmon`) | child | não documentado | DWDS 28px, 1,08× Tamer, **[H]** interpolado entre Agumon(26) e Gabumon(29); leitura automática na folha curada foi inconclusiva | — (herdado do `DIGIMON_SIZE_TABLE.md`) | Médio (proposto) | **39px [H]** |
| Drimogemon (`sp.drimogemon`) | adult | não documentado | Sem folha DWDS na amostra | [INFERÊNCIA] quadrúpede escavador de porte Champion; sem referência direta | Grande (proposto) | ~44-48px **[H]**, por regra de bolso do estágio Champion (§7 de `DIGIMON_SIZE_TABLE.md`, 1,3-1,5× Tamer) |
| Garurumon (`sp.garurumon`) | adult | não documentado | DWDS 28px, 1,08× Tamer, **[H]** leitura pontual (n=1); folha sem ciclo de caminhada isolável confirmado por inspeção manual | Quadrúpede: ganha massa/comprimento, não altura, ao evoluir de Gabumon (nota já registrada na fonte) | Médio/Grande (proposto; porte canônico maior que o sprite sugere) | **39px [H]** |
| GeoGreymon (`sp.geo_greymon`) | adult | não documentado | Sem folha DWDS na amostra | [INFERÊNCIA] porte Champion robusto, família Greymon; por regra de bolso do estágio | Grande (proposto) | ~48-51px **[H]**, por analogia direta com Greymon (mesma linha/estágio) |
| Greymon (`sp.greymon`) | adult | não documentado | DWDS 37px, 1,42× Tamer, **[E]** `dwds-sheets/greymon.png`, n=9 | — | Grande (proposto) | **51px** |
| Growlmon (`sp.growmon`) | adult | não documentado | DWDS 37px, 1,42× Tamer, **[E]** `dwds-sheets/growlmon.png`, n=11 | — | Grande (proposto) | **51px** |
| Numemon (`sp.numemon`) | adult | não documentado | DWDS 23px, 0,88× Tamer, **[E]** n=15 | Porte visual pequeno/médio apesar do estágio Champion — padrão já observado em outros Champions "fracos visualmente" (Bakemon) | Médio (proposto; porte menor que o estágio sugeriria) | **32px** |
| WarGrowlmon (`sp.megalo_growmon`) | perfect | não documentado | DWDS 39px, 1,50× Tamer, **[H]** sem cluster válido na folha; estimado pela média dos Ultimates confirmados | — | Grande/Gigante, fronteira (proposto) | **54px [H]** |
| MetalGreymon (`sp.metal_greymon`) | perfect | não documentado | DWDS 34px, 1,31× Tamer, **[E]** n=5 | — | Grande (proposto) | **47px** |
| WereGarurumon (`sp.were_garurumon`) | perfect | não documentado | DWDS 37px, 1,42× Tamer, **[H]** leitura automática rejeitada (ficava abaixo do próprio Rookie); estimado pela média dos Ultimates confirmados | — | Grande (proposto) | **51px [H]** |
| Gallantmon/Dukemon (`sp.dukemon`) | ultimate | não documentado | DWDS 39px, 1,50× Tamer, **[H]** leitura automática rejeitada (abaixo do Champion da linha); estimado pelo teto Mega | — | Grande/Gigante, fronteira (proposto) | **54px [H]** |
| MetalGarurumon (`sp.metal_garurumon`) | ultimate | não documentado | DWDS 38px, 1,46× Tamer, **[H]** mesma rejeição que WereGarurumon; estimado ligeiramente acima do Ultimate da linha | — | Grande/Gigante, fronteira (proposto) | **53px [H]** |
| Omnimon/Omegamon (`sp.omegamon`) | ultimate | não documentado | Sem folha DWDS na amostra (fusão de 2 espécies, pode não existir no roster jogável do DWDS) | [INFERÊNCIA] no anime, Omnimon é retratado consistentemente como um dos maiores Digimon-cavaleiro, próximo ou acima do "teto" de WarGreymon; sem medida | Gigante (proposto, por reputação canônica, não medição) | ~54-58px **[H]**, por analogia com o teto Mega (WarGrowlmon/Gallantmon) |
| WarGreymon (`sp.war_greymon`) | ultimate | não documentado | DWDS 37px, 1,42× Tamer, **[E]** n=5. **Nota importante:** igual ao Champion da própria linha (Greymon=37px) — "teto de legibilidade" do sprite de mapa, não um erro de medição | No anime, aparece em cenas de porte muito maior (comparável a construções); no sprite de mapa, o jogo original já nivelou isso por legibilidade | Grande/Gigante — **divergência real entre porte canônico (anime) e porte de gameplay (sprite)**; ver §4 | **51px** (igual ao Champion da linha) |
| Digmon (`sp.digmon`) | armor | não documentado | Sem folha DWDS na amostra | [INFERÊNCIA] inseto-broca de porte Armor, historicamente entre Champion e Ultimate em outras fontes de fã (não confirmado); sem medida | Grande (proposto) | ~44-48px **[H]**, por regra de bolso de Armor/Champion |

**Legenda de confiança:** **[E]** = medido diretamente em sprite real, alta confiança (n≥4 amostras). **[H]** = hipótese com justificativa registrada (interpolação, analogia de estágio ou regra de bolso), nunca um número solto. "Sem folha DWDS" = a espécie não está nas 40 processadas por `DIGIMON_SIZE_TABLE.md`; não tentei medir novas folhas nesta sessão (fora do escopo do comando, que pede planejamento).

## 4. Altura física × volume visual × largura × colisão × pixels — por que são 5 coisas diferentes

O comando pede para diferenciar essas dimensões. Com os dados levantados, dá para mostrar isso com evidência real, não só em teoria:

| Dimensão | O que mede | Dado real encontrado | Onde se aplica |
|---|---|---|---|
| **Altura física (fictícia)** | Quão alto o Digimon "é" dentro da lore, em cm/m, como se fosse medido com fita métrica no universo ficcional | **Não existe** nenhuma fonte oficial verificada que publique isso. A impressão de porte vem só de cenas de anime/jogo, que **variam entre si** (ex.: WarGreymon ora do tamanho de um prédio, ora comparável a Greymon numa mesma categoria de jogo) | Nenhuma — é a lacuna central deste estudo |
| **Volume visual (silhueta/massa aparente)** | Quão "grande e pesado" o design parece, independente da altura — um Digimon atarracado pode parecer maior que um alto e magro | Observado em `DIGIMON_SIZE_TABLE.md`: Mamemon (Ultimate) tem sprite de só 12px (0,46× Tamer) porque é atarracado/compacto, mesmo sendo estágio alto; Numemon (Champion) fica com 23px (0,88×), visualmente menor que o próprio Agumon (Rookie, 26px) | Guia como desenhar a silhueta nova, não a altura |
| **Largura/colisão (gameplay)** | Quanto espaço o Digimon ocupa para fins de jogo (bloqueio de movimento, hitbox) | **Já implementado e medido:** `world-species.json` → `radiusByStage`: 12px (estágio 1) a 30px (estágio 5), **igual para toda espécie daquele estágio**, independente do sprite. É uma régua de jogo, não de arte | Colisão/pathing — não deveria copiar a altura de pixel 1:1 |
| **Pixels do sprite (altura de conteúdo)** | Altura real, em pixels, do desenho dentro do canvas, medida por detecção de blob | `DIGIMON_SIZE_TABLE.md`: Koromon 17px, Agumon 26px, Greymon 37px (sprite de **mapa** do DWDS) | A régua usada nesta tabela (§3) |
| **Pixels do canvas/import (bounding box)** | Tamanho do arquivo/moldura importado para o jogo, que pode ter margem vazia | `ETAPA2_HOMOLOGACAO.md`: Greymon 40×42, Garurumon 38×35, Koromon 28×22, Tamer ~36px, WarGreymon com `mapScale 2` (~72px) — **números diferentes** dos de pixel-de-conteúdo do DWDS porque é outra folha/outro corte | Explica por que duas fontes "de pixel" do próprio projeto já discordam entre si — outra faceta do conflito aberto C5/G-2 |

**Leitura central:** a régua de **colisão** do jogo (`radiusByStage`) já ignora completamente a diferença de pixel entre espécies do mesmo estágio — Numemon (23px de sprite) e Greymon (37px de sprite), ambos Champion, têm o **mesmo raio de colisão** (22px) hoje. Isso é consistente com a prática do próprio DWDS (teto de legibilidade), mas é uma decisão de jogo, não um fato da franquia — e **não é alterado** por este estudo.

## 5. Os 3 Digimon recomendados para o laboratório

| Porte | Digimon | Motivo |
|---|---|---|
| **Pequeno** | **Koromon** (baby_ii, id piloto `sp.koromon`, `CREATURE-0005` no roster) | Menor altura de sprite medida com alta confiança (17px, 0,65× Tamer, n=7); silhueta "bolinha" reconhecível e simples de testar nos 3 métodos de produção; está na linha completa do Agumon no piloto da Database, o que permite comparar com os outros 2 recomendados dentro de **uma única linha evolutiva coerente** |
| **Médio** | **Agumon** (child, `sp.agumon`, `CREATURE-0006`) | É a própria referência do dataset (1,00× Tamer, 26px, n=10) — porte "neutro" por definição; é o Digimon mais reconhecível do piloto e do jogo (starter principal); medido com a maior amostra (n=10) de toda a tabela |
| **Grande ou Gigante** | **WarGreymon** (ultimate, `sp.war_greymon`, `CREATURE-0016`) | Maior porte canônico de reputação (depictions de anime o mostram em escala de construção) dentro do piloto; tem sprite DWDS medido (37px, 1,42×, n=5); e, de forma deliberada, **demonstra o próprio problema que o laboratório existe para resolver**: no sprite de mapa original ele é *idêntico* em altura ao próprio Greymon (Champion da mesma linha) — um "teto de legibilidade" que a nova direção visual do Digital Odyssey pode escolher manter ou romper. Usar justamente essa espécie testa a decisão, não só a estética |

As três estão na mesma linha evolutiva (Koromon → Agumon → ... → WarGreymon), já têm sprite DS existente no projeto e aparecem no piloto da Database **e** no roster do jogo (`CREATURE-0005`, `CREATURE-0006`, `CREATURE-0016`) — cumprindo a preferência pedida no comando.

## 6. Limitações

- **Nenhuma espécie do piloto tem altura física documentada em cm/m por fonte oficial.** Isso não é uma lacuna de pesquisa incompleta: é uma característica real da franquia, confirmada em 3 fontes independentes nesta sessão (Reference Book oficial, Wikimon, extrato já coletado da Database) e reafirmada por `DIGIMON_SIZE_TABLE.md` (2026-11-08).
- 7 das 23 espécies do piloto (Botamon, Punimon, Dorumon, Drimogemon, GeoGreymon, Omnimon, Digmon) não têm nenhuma folha de sprite DWDS medida na amostra de 40 de `DIGIMON_SIZE_TABLE.md` — os valores de px para elas são **[H]** por analogia de estágio/linha, nunca uma medição direta. Uma extração de pixel dedicada para essas 7 (rodando o script já existente em `GS-003/tools/size_research/` sobre mais folhas) ficaria fora do escopo "só planejamento" deste comando e não foi feita.
- A classe cm (Pequeno/Médio/Grande/Gigante) do comando **não tem como ser calculada com rigor** sem dado físico oficial; a coluna "classe proposta" é sempre [INFERÊNCIA] qualitativa e deve ser tratada pelo fundador/game-art como ponto de partida de discussão, não como medição.
- `digimon.fandom.com` (Digimon Wiki) está bloqueado por Cloudflare desde pelo menos 2026-11-08 (confirmado de novo hoje); se tiver dado de altura por jogo específico (Cyber Sleuth, Survive, Time Stranger têm fichas de stats em alguns casos), não pôde ser verificado nesta sessão nem na anterior.
- Fichas de stats de jogos específicos (Digimon Story: Cyber Sleuth, Survive, Time Stranger) não foram verificadas — ficam como lacuna explícita, não inventadas.
- WarGreymon no jogo hoje usa `mapScale 2` (~72px) na importação atual (`ETAPA2_HOMOLOGACAO.md`), um valor **nem o do DWDS (37px) nem o do canvas padrão** — mais uma prova de que a escala atual do GS-003 já é inconsistente internamente, independente deste estudo.
