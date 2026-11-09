# ROSTER_GAP_REPORT — GS-003 Map Factory (expansão de roster)

- **Autor:** game-research (subagente) · **Data:** 2026-11-09
- **Pedido:** ADR-011 §6 ("expandir o roster de Digimon e as linhas de evolução"), executado dentro da frente Map Factory.
- **Fontes primárias:** `prototype/world/src/data/world-species.json`, `evolution-paths.json`, `content/regions.json`, `content/bosses.json`, `content/dungeons.json` (estado real do jogo em 2026-11-09) + `knowledge/evolution_chains.json`, `evolution_requirements.json`, `SOURCE_REGISTRY.md` (pesquisa prévia GS-005) + verificação adicional via API MediaWiki do `digimon.fandom.com` nesta sessão (ver citações em `roster_expansion.json`/`evolution_lines_v2.json`).
- **[E]** = evidência com fonte citada. **[H]** = hipótese/proposta nossa.

---

## 1. O que existe hoje no jogo (estado real, não a pesquisa antiga)

### 1.1 Espécies por estágio (`world-species.json`, campo `stage` 1–4; o motor **não tem estágio 5/Mega ainda**)

| Estágio do motor | Equivalente canônico | Quantidade | Espécies |
|---|---|---|---|
| 1 | Baby+In-Training fundidos num só nível | 6 | Gigimon, Koromon, Tsunomon, Tokomon, Dorimon, Tanemon |
| 2 | Rookie | 21 | Guilmon, Agumon, Gabumon, Patamon, Dorumon, Biyomon, Gomamon, Tentomon, Palmon, Betamon, Gotsumon, Floramon, Hagurumon, Crabmon, Otamamon, Goburimon, Lalamon, Penguinmon (+3 do pacote `digimon-fan`: koromon/agumon/gabumon já contados no estágio 1/2 pelos ids-pack) |
| 3 | Champion | 5 | Growlmon, Greymon, Garurumon, Angemon, Dorugamon, Numemon, GeoGreymon*, Drimogemon* (*ramos alternativos sem arte, `evolution-paths.json`) |
| 4 | Ultimate | 1 | DoruGreymon |
| 5 (Mega) | — | **0** | **nenhum Mega existe no roster do jogo** |

**[E]** Confirmado por `grep` direto em `world-species.json`, `content/*.json` e `evolution-paths.json`: nenhuma ocorrência de `MetalGreymon`, `WarGreymon`, `WereGarurumon`, `MetalGarurumon`, `MagnaAngemon`, `Seraphimon`, `WarGrowlmon`, `Gallantmon` ou `Dorugoramon` em qualquer arquivo de dados do jogo.

### 1.2 Linhas de evolução formalizadas (`evolution-paths.json`)

**[E]** O arquivo só define ramificação para **2 espécies em todo o jogo**: `CREATURE-0006` (Agumon → Greymon ou GeoGreymon) e `CREATURE-0101` (Dorumon → Dorugamon ou Drimogemon). **Todas as outras 25 espécies do roster não têm nenhuma aresta de evolução formal no motor** — mesmo quando a progressão é óbvia pela nomenclatura (ex.: Koromon claramente antecede Agumon no lore, mas isso não está codificado em lugar nenhum consultável pelo jogo).

### 1.3 Biomas (`content/regions.json`)

| Bioma (id) | Nome | Level | Selvagens | Chefe |
|---|---|---|---|---|
| `vila_dos_bebes` | Vila dos Bebês | 1–5 | 0 (só NPCs fixos, não capturáveis) | — |
| `floresta_densa` | Floresta Densa | 1–15 | 20 | Kuwagamon |
| `praia_dos_postes` | Praia dos Postes | 10–25 | 9 | Shellmon |
| `montanha` | Montanha | 20–35 | 4 | Tyrannomon |
| `deserto` | Deserto | 30–45 | 4 | Guardromon |
| `zona_corrompida` | Zona Corrompida | 40–55 | 4 (variantes corrompidas) | Devimon + World Boss VenomMyotismon |

**[E]** `floresta_densa` é de fato o bioma com mais conteúdo (20 selvagens, o piloto "Digimon Forest — Prototype 01" citado em `docs/briefing/12_map_factory_v2.md:68`), mas quase tudo nele é Rookie (14 de 20); só 2 Champion (Dorugamon, Numemon) e 0 Ultimate/Mega.

### 1.4 Vila dos Bebês — achado relevante

**[E]** `content/bosses.json` lista Botamon, Punimon, Poyomon, Yuramon como moradores da vila (`villageOfBeginnings.inhabitants`), com `aggressive: false`. **Nenhum deles tem `speciesId`, stats ou entrada em `world-species.json`** — são só NPCs decorativos. **[H] Gap:** o jogador nunca pode capturar/possuir um Digimon no estágio Baby oficial; toda captura começa direto no In-Training ou Rookie selvagem. Isso contradiz a identidade "ovo → Baby → evolução" citada no GDD.

---

## 2. Lacunas por estágio (visão consolidada)

| Estágio | Situação | Severidade |
|---|---|---|
| **Baby** | Existe só como 4 NPCs decorativos, não jogáveis, sem stats. Nenhuma espécie Baby jogável em lugar nenhum. | **Crítica** — quebra a progressão completa do digivolution |
| **In-Training** | 6 espécies, mas sem evolução formal codificada (não aparecem como `from` em nenhum `evolution-paths.json`) | Alta |
| **Rookie** | Bem populado (21), mas **19 das 21 são becos sem saída** — sem Champion definido | **Crítica** — é o maior buraco numérico do roster |
| **Champion** | Só 7 (Growlmon, Greymon, Garurumon, Angemon, Dorugamon, Numemon, GeoGreymon-sem-arte) | Alta |
| **Ultimate** | Só 1 (DoruGreymon), isolado — sem a Rookie/Champion/Baby de outras linhas chegando lá | **Crítica** |
| **Mega** | **Zero.** Nenhuma linha do jogo alcança o estágio final oficial da franquia. | **Crítica máxima** |

## 3. Lacunas por bioma

| Bioma | Lacuna principal |
|---|---|
| `vila_dos_bebes` | Babies não capturáveis (ver §1.4); nenhuma espécie com stats associada ao bioma |
| `floresta_densa` | 14 Rookies sem Champion/Ultimate/Mega definidos; é o bioma prioritário (piloto) e o mais incompleto em profundidade (largo, mas raso) |
| `praia_dos_postes` | Gomamon, Betamon, Crabmon, Otamamon, Penguinmon, Biyomon — todos Rookie sem evolução; só Growlmon aparece como Champion "raro" (migrado da floresta) |
| `montanha`/`deserto` | Dependem de Champions da floresta (Growlmon, Greymon, Garurumon, Angemon) sem Ultimate/Mega próprios da região — nenhuma variedade nova nesses biomas, só reuso |
| `zona_corrompida` | Usa as 4 mesmas Champion de sempre em versão "corrompida"; o World Boss (VenomMyotismon) não tem nenhuma linha de evolução nossa levando a ele |

---

## 4. Causa-raiz

1. O roster cresceu por **importação em lote de selvagens DW DS** (`CREATURE-0101..0118`, comentário do próprio `world-species.json`) sem que cada linha recebesse sua evolução — ficou largura sem profundidade.
2. `evolution-paths.json` foi criado para resolver **só 1 caso de ramificação de design** (Agumon/Dorumon vs. formas alternativas de Dawn & Dusk), não como registro geral de todas as evoluções do jogo — por isso 25 de 27 espécies não têm aresta nenhuma.
3. A pesquisa anterior (GS-005, `evolution_chains.json`) cobriu só **5 linhas** (Agumon, Gabumon, Patamon, Guilmon, Dorumon) e, mesmo nessas 5, não preencheu Baby nem sempre confirmou Ultimate/Mega com fonte oficial do Wikimon/Fandom direta (usou bases de dados de jogos específicos, que nem sempre têm Baby/Mega no escopo pesquisado).

---

## 5. O que esta entrega resolve (Onda 1)

`roster_expansion.json` e `evolution_lines_v2.json` completam **8 linhas de evolução Baby→Mega inteiras** (Agumon, Gabumon, Patamon, Guilmon, Dorumon, Biyomon, Palmon, Tentomon) com **25 espécies novas**, todas com atributo/tipo/pré-evolução/evolução **verificados agora via API MediaWiki do `digimon.fandom.com`** (contorno de Cloudflare já documentado em `SOURCE_REGISTRY.md`), fechando a lacuna "zero Mega" e "zero Baby jogável" para o bioma piloto (Floresta Densa).

**Não resolvido nesta entrega (fica para Onda 2/3 — ver `roster_expansion.json` §Ondas 2-3):**
- As 12 Rookies "beco sem saída" restantes do roster atual: Gomamon, Betamon, Crabmon, Otamamon, Goburimon, Hagurumon, Penguinmon (praia/floresta) e Gotsumon (parcial — tem alternativa oficial via Motimon, registrada na Onda 1, mas Gotsumon como Rookie em si ainda não tem Champion próprio pesquisado).
- Evolução própria para os biomas montanha/deserto/zona_corrompida (hoje 100% reuso de Champions da floresta).
- Linha de evolução até o World Boss VenomMyotismon.

---

## 6. Limitações desta pesquisa

- `web_search` esteve indisponível nesta sessão (erro "disabled or no provider"); todo dado novo veio de `web_fetch` na API MediaWiki pública do `digimon.fandom.com` (`action=parse&prop=wikitext`), a mesma técnica de contorno documentada em `SOURCE_REGISTRY.md` para esta wiki.
- O atributo (Vaccine/Data/Virus/Free) de formas Baby/In-Training varia entre jogos na própria wikitext (ex.: Botamon aparece como `None`/`Data`(DW)/`Free`(Cyber Sleuth)); quando não havia um valor único e inequívoco, registrei `Free` por convenção (alinhado ao padrão já usado no `evolution_chains.json` para outras formas Baby/In-Training) e marquei a variação em nota [H].
- O "elemento" (Fire/Water/Wind etc., estilo Cyber Sleuth) só foi confirmado com fonte para as 5 linhas já pesquisadas em `evolution_chains.json` (Agumon, Patamon, Guilmon parcial, Dorumon). Para Biyomon, Palmon e Tentomon **não encontrei o elemento Cyber Sleuth nesta sessão** — campo `element` fica `"pendente"` nessas três linhas, não inventado.
- Os números de nível/estatística exigidos para cada salto de evolução em `evolution_lines_v2.json` são **[H] propostos pelo game-research**, extrapolando a curva já usada em `evolution-paths.json` (Rookie→Champion no Nv.16) e a proporção observada nos dados reais de Cyber Sleuth (`evolution_chains.json`). Precisam de validação do game-design antes de entrar no jogo — não são requisito oficial de nenhum jogo da franquia.
- Não voltei a pesquisar Next Order/DMO (bloqueios de JS/Cloudflare já documentados em `SOURCE_REGISTRY.md`, não resolvidos nesta sessão).
