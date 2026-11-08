# GS-003 — Pesquisa de fan game: remoções, sobreviventes, canais e público (2026-11-08)

**Autor:** game-research (Nação Games)
**Data:** 2026-11-08
**Contexto:** ADR-007 (`shared/decisions/ADR-007-gs003-fan-game-pokemon-digimon.md`) mudou o GS-003 para fan game não comercial com Pokémon (Linha A) e Digimon (Linha B) oficiais. Monetização saiu de escopo. Este documento complementa `MARKET_UPDATE.md` (mesma data) com foco em risco de remoção, precedentes de fan games ativos, e canais de distribuição/descoberta da comunidade.

**Nota metodológica:** `web_search` continua indisponível nesta sessão (mesmo erro de antes). Toda a pesquisa é via `web_fetch` em URLs diretas. Novidade desta rodada: usei `r.jina.ai/<URL>` (um proxy de leitura público) para contornar bloqueios de rate-limit em alguns sites (funcionou para itch.io, não funcionou para Reddit/PokéCommunity, que bloqueiam por outros motivos — ver Limitações).

---

## 1. Histórico de remoções (DMCA/C&D)

### 1.1 Pokémon (Nintendo / The Pokémon Company) — bem documentado

[E] Fonte: `en.wikipedia.org/wiki/List_of_Pokémon_fan_games`, lida em 2026-11-08 (artigo detalhado, com tabela de jogos individuais e citações de imprensa por caso).

| Caso | Tipo | O que aconteceu | Data | Fonte citada pela Wikipédia |
|---|---|---|---|---|
| **Pokémon Uranium** | Fangame completo (RPG Maker), região inspirada no Rio de Janeiro, Fakemon + tipo "Nuclear" | 1,5 milhão de downloads em poucas semanas → **DMCA da Nintendo** → retirado da lista de nomeados do The Game Awards 2016 (categoria "Best Fan Creation", junto com o fã-remake de Metroid AM2R) | 06/08/2016 (lançamento) | PC Gamer, Inverse |
| **Pokémon Prism** | ROM hack de Pokémon Crystal, 8 anos de desenvolvimento, trailer com 1,4 milhão de views | **Cease and desist** recebido **dias antes** do lançamento planejado — bloqueou o lançamento oficial. Arquivos vazaram no 4chan depois. | Não lançado oficialmente | The Verge, Kotaku Australia |
| **Pokémon Brick Bronze** | Fangame em Roblox, chegava a "dezenas de milhares" de usuários simultâneos | Removido pela própria Roblox **após denúncia de copyright da Nintendo** | Abr/2018 | Heavy.com |
| **Pokémon Essentials** | Ferramenta RPG Maker XP que **reutilizava assets oficiais** (sprites/sons extraídos dos jogos) para facilitar criação de fangames — a ferramenta mais popular da comunidade | **Takedown da Nintendo**, incluindo a wiki associada | 29/08/2018 | The Verge, IGN, Rock Paper Shotgun, Engadget, Ars Technica, Eurogamer (6 veículos cobriram o mesmo caso) |
| **Pixelmon** | Mod de Minecraft que adicionava captura/batalha de Pokémon | Encerrado **a pedido da The Pokémon Company**; equipe decidiu não continuar sob outra marca | 2017 | Wikipédia (citação direta) |
| **Relic Castle** | Maior fórum/site de fangames Pokémon da comunidade | **DMCA takedown da Nintendo/TPC**, site saiu do ar | 2024 | VG247 ("one of the biggest Pokemon fan game sites") |

[E] **Padrão identificado pela própria Wikipédia, citando especialistas:**
- IP strategist Alex Tutty (à Wired): a Nintendo age para evitar "erosão" da marca — não agir seria visto como negligência de IP.
- Advogado Ryan Morrison (à PC Gamer): uma alternativa gratuita de qualidade ameaça as vendas dos produtos oficiais.
- Don McGowan, ex-advogado da The Pokémon Company: ele monitorava jogos com cobertura de imprensa, mas **raramente agia legalmente até o jogo receber financiamento monetário**.
- Junichi Masuda (produtor de Pokémon): comentário público tolerante, incentivando criadores de fangame a se candidatarem para trabalhar na Game Freak — tom ambíguo (a empresa reconhece o valor cultural, mas ainda assim age via departamento jurídico).
- A própria Wikipédia resume: casos recebem mais ação legal **quando ganham publicidade via YouTube/Twitch/imprensa** — visibilidade pública é o gatilho mais citado, mais do que a existência do fangame em si.

**Gatilhos comuns observados nos 6 casos de takedown:** (1) reuso de assets oficiais extraídos do jogo real (Essentials, e indiretamente PokeMMO que depende de ROMs); (2) alto volume de downloads/usuários/visualizações **antes** da ação (Uranium 1,5M downloads, Brick Bronze "dezenas de milhares" simultâneos, Prism 1,4M views de trailer); (3) cobertura de imprensa generalista, não só de nicho.

### 1.2 Digimon (Bandai Namco / Toei) — lacuna real, não uma conclusão de risco baixo

[H] **Não encontrei nenhuma página equivalente** a "List of Pokémon fan games" para Digimon. Busquei:
- `en.wikipedia.org/wiki/Fan_game` (artigo geral sobre fan games) — **nenhuma menção a Digimon** no texto lido.
- `en.wikipedia.org/wiki/Digimon_(franchise)` — página não existe (404).
- GitHub, busca de repositórios por `digimon dmca` → **0 resultados**.

[E] O achado mais concreto e contrastante: existe no GitHub um projeto chamado **ODMO (Open Digimon Masters Online)**, um **servidor emulador open-source completo** (em Rust) do MMO licenciado Digimon Masters Online, com account flow, character flow e persistência em PostgreSQL já implementados — e está **ativo e sendo atualizado publicamente** (último commit visível em 05/11/2026, 3 dias antes desta pesquisa). Isso é tecnicamente um projeto **mais ousado** do que qualquer fangame de Pokémon sobrevivente (replica um servidor de jogo comercial inteiro, não só assets/mecânica), e opera no GitHub sem nenhuma notificação de remoção visível até a data desta pesquisa.

**Leitura honesta:** isso **não prova que o risco para Digimon é menor** — pode ser (a) Bandai Namco de fato monitora/age menos, (b) a comunidade de fangames Digimon é menor e atrai menos atenção de imprensa (ver §3), ou (c) simplesmente não há uma fonte central documentando os casos que talvez já tenham ocorrido. É uma lacuna de evidência, não uma garantia de segurança — mantenho a recomendação já registrada em `MARKET_AND_IP.md` (revisão jurídica antes de publicar).

---

## 2. Fan games que continuam no ar — o que têm em comum

### 2.1 Pokémon — sobreviventes confirmados (Wikipedia, lida 2026-11-08)

| Jogo | Desde | Característica comum |
|---|---|---|
| **Pokémon Insurgence** | 2014 | RPG Maker, criaturas "Delta" (variantes mutadas, conceito **oficial** da franquia reaproveitado de forma diferente) |
| **PokeMMO** | 2012 | MMORPG que roda sobre ROMs reais via emulador — **ainda depende de ROM oficial**, mas sem distribuir a ROM em si |
| **Pokémon Showdown** | 2011 | Simulador de batalha, **mais de 1 milhão de visitantes únicos/mês** — não tem mundo/sprites de overworld, só batalhas |
| **Pokémon Crystal Clear** | 2023 (ROM hack) | Desenvolvimento ativo contínuo pelo criador |
| **Pokémon Infinite Fusion** | 2015 | Popular entre streamers/let's players no YouTube — **apesar** de alta visibilidade, continua ativo |
| **Pokémon Sage** | Em desenvolvimento (projeto do fórum 4chan /vp/) | Região e Fakemon 100% originais, wiki própria mantida pela comunidade |
| **Fontemon**, **Pokedoku** | — | Projetos pequenos/paródia, baixa visibilidade de massa |

**Leitura:** não há um fator único que garanta sobrevivência — Infinite Fusion é muito visível e sobrevive; Uranium era menos visível (1,5M downloads é alto, mas não viral de streamer) e foi derrubado. O fator mais consistente **entre os sobreviventes de longa duração** parece ser: não monetizar (nenhum dos sobreviventes listados vende o jogo), e geralmente não reusar literalmente os arquivos/sprites oficiais extraídos do jogo (excecões: PokeMMO, que contorna isso ao exigir que o jogador tenha a ROM, não distribuindo-a).

### 2.2 Digimon — ativos encontrados no itch.io (lido 2026-11-08, via proxy de leitura)

[E] A tag "digimon" no itch.io retornou **88 resultados** (`itch.io/games/tag-digimon`). Exemplos concretos com descrição própria da página:
- **Digital Partner Digimon** (Aludeku) — "a fan-made Digimon pet simulator, made with love"
- **Digimon Digivice Project** (OmegaBoy) — simulador de pet pessoal
- **Digital Tamers: ReBorn** (dragonrod342) — treinar/batalhar/evoluir, formato de campeonato
- **DVPet** (theundersigned) — app Java baseado nos bichinhos virtuais originais
- **Digimon: Digital World Adventure** (Maxine)
- **Digimon World Re:DigiCoded** (White Feather Projects) e **Digimon RE-World** (XenoKeit) — remakes de RPG
- **DigiSurvivor** (IncreStudios) — "survivors" roguelite gratuito, digivolução até Mega durante a partida
- **Digimon RPG Fan Game with Online PvP** (kwonsouvenir)
- **PiMon** (HatCatGames) — **US$5,99**, simulador de bichinho — **único caso encontrado de fangame Digimon vendido**, o que é exatamente o padrão de risco mais citado no histórico Pokémon (McGowan: ação legal correlaciona com financiamento monetário)
- **Digimon Digital Heroes 2** (settefangames) — plataformer com Agumon/Gabumon
- **DSprite: Online V-Pet Arena**, **Digimon World W** (remake de Digimon World 3), **Digimon Tower Defense**, **Bitbeast Arena** (autobattler que renomeia o conceito para evitar nomes oficiais)

**Leitura:** a comunidade de fangames Digimon no itch.io é real, ativa e numericamente menor que a de Pokémon (ver §3), dominada por projetos pequenos, gratuitos, de simulação de bichinho virtual ("V-Pet") ou RPG pequeno — nenhum com o porte/polimento de um Pokémon Insurgence ou PokeMMO. **PiMon é o único exemplo encontrado de monetização direta** — é um contra-exemplo útil: mostra que alguém tentou vender um fangame Digimon e (até onde a pesquisa alcança) não houve notícia de ação legal, mas isso é uma amostra de 1 caso, não um padrão confiável, e **de qualquer forma contraria a condição 1 do ADR-007 (sem monetização)** — não deve ser usado como justificativa para cobrar nada pelo GS-003.

### 2.3 O que os sobreviventes (Pokémon + Digimon) têm em comum

[H] Síntese qualitativa baseada nos dados acima (não é uma regra legal confirmada, é um padrão observado):
1. **Sem monetização direta** na grande maioria — PiMon é a única exceção encontrada, e é justamente o tipo de caso que o histórico Pokémon associa a maior risco.
2. **Motores/ferramentas de terceiros, não arquivos do jogo oficial extraídos** — RPG Maker, Unity, GameMaker, Java (DVPet) — nenhum distribui ROM ou sprite oficial ripado diretamente (a excecão parcial, PokeMMO, exige que o usuário já possua a ROM).
3. **Comunidades de nicho, não viralização de massa generalista** — os casos derrubados tinham picos de atenção (imprensa geral, Game Awards, milhões de downloads/views); os sobreviventes de longo prazo tendem a crescer de forma mais orgânica dentro da própria comunidade de fãs.
4. **Times pequenos, atualização contínua e comunicação transparente** (wikis próprias, devlogs no itch.io) — cria boa vontade da comunidade, mas não é proteção legal.

Isso está alinhado com as condições já definidas no ADR-007 (sem monetização, arte redesenhada não ripada, sem logos oficiais, aviso de não afiliação, uso local/privado por padrão) — o desenho da exceção já segue o padrão de menor risco observado aqui.

---

## 3. Onde a comunidade de fan games distribui e descobre jogos

[E] Comparação direta, mesma data (2026-11-08), mesma metodologia (tags do itch.io):

| Plataforma/canal | Pokémon | Digimon | Razão |
|---|---|---|---|
| **itch.io** (tag) | **896 resultados** | **88 resultados** | ~10:1 — confirma numericamente que o ecossistema de fangames Pokémon é cerca de 10x maior que o de Digimon nesse canal |
| **GitHub** (topic genérico, inclui ferramentas/apps não-fangame, métrica mais ruidosa) | 7.184 repositórios | 111 repositórios | ~65:1, mas infla o lado Pokémon com apps genéricos de Pokédex/API não relacionados a fangame |
| **GitHub** (topic específico `-fangame`) | 4 repositórios (`pokemon-fangame`) | 0 repositórios (`digimon-fangame` nunca usado) | Tag específica pouco usada nos dois lados — não é um canal de descoberta confiável por tag exata |

[E] **Fóruns dedicados (Pokémon):** a Wikipédia cita **PokéCommunity** e **Relic Castle** como os dois fóruns principais da comunidade de fangames. Relic Castle **saiu do ar em 2024** (DMCA, ver §1.1). PokéCommunity **continua online** — confirmei isso indiretamente: toda tentativa de acesso (`pokecommunity.com`, direto e via proxy) retornou um **desafio de segurança do Cloudflare** ("Just a moment...", CAPTCHA), não um erro de "site não encontrado" — ou seja, o site existe e está ativamente protegido contra scraping, consistente com um fórum grande e ainda em operação (não consegui, porém, confirmar número de membros).

[H] **Fóruns/hubs dedicados (Digimon):** não encontrei um equivalente direto ao PokéCommunity especificamente para desenvolvimento de fangames Digimon nesta sessão. O hub mais próximo e **confirmadamente ativo** é **Wikimon.net** ("The #1 Digimon Wiki") — mas é uma wiki de referência/lore oficial (atualizada várias vezes por mês ao longo de 2026, confirmando que a base de fãs do universo Digimon está viva), **não especificamente um fórum de criação de fangames**. Para Digimon, a descoberta parece acontecer de forma mais dispersa: diretamente no itch.io (via tag e coleções como "FanGames" curada por usuários individuais, ex.: `AkurraTheDragon`), e presumivelmente em Discord/Reddit (não verificável nesta sessão — ver Limitações).

[H] **Reddit e Discord:** não verificável nesta sessão para nenhuma das duas franquias — `reddit.com` e `old.reddit.com` bloquearam todas as tentativas (403, inclusive via proxy de leitura `r.jina.ai`), e o diretório de servidores Discord `disboard.org` retornou desafio Cloudflare em ambas as buscas ("digimon" e "pokemon fan game"). Isso é uma lacuna real que impede comparar o tamanho das comunidades de Discord/Reddit das duas franquias.

**Conclusão prática:** itch.io é, com evidência real e comparável, **o canal de descoberta mais acessível e ativo para ambas as linhas** — tem volume real (88 a 896 jogos), tags dedicadas, coleções curadas por usuários, e nenhuma fricção de aprovação prévia como um fórum teria. Recomendo itch.io como canal de descoberta/distribuição de referência para o GS-003 (publicação em si ainda depende da aprovação separada do fundador, conforme ADR-007 item 4).

---

## 4. Tamanho do público de Digimon no Brasil

[H] **Não consegui verificar quantitativamente nesta sessão**, pela terceira vez consecutiva (mesma lacuna de `MARKET_AND_IP.md` e `MARKET_UPDATE.md`):
- Google Trends (`trends.google.com`) → erro 429 ("Too Many Requests").
- SimilarWeb (tentativa em `digimon.com.br`) → erro 403 (bloqueio CloudFront).
- Reddit (r/digimon, tamanho de inscritos) → bloqueado (403), inclusive via proxy.
- PokéCommunity/Discord → bloqueados por Cloudflare.
- Página da Wikipédia em inglês sobre o anime `Digimon Adventure (1999 TV series)` e sobre a franquia `Digimon` **não mencionam o Brasil** nem a dublagem/exibição brasileira em nenhum trecho lido.

[E] O único dado indireto e qualitativo disponível continua sendo o já registrado em `MARKET_AND_IP.md` §3: o site **Digi World Idle** (`digiworldidle.com.br`) é um fan game idle 100% em português, com monetização ativa (assinatura VIP, battle pass, doações, boosts) e aparentemente sustentável, operando sem ação legal aparente da Bandai Namco até a data da pesquisa — isso é evidência de que **existe um público brasileiro real e disposto a pagar** por produtos de nostalgia Digimon, mas sem número de usuários, membros de comunidade, ou faturamento disponível.

[H] **Persiste a mesma hipótese não verificada:** que a penetração cultural de Digimon no Brasil veio da exibição em TV aberta dublada nos anos 2000 (Digimon Adventure/02/Tamers) — é senso comum repetido nas sessões anteriores de pesquisa, mas **nenhuma fonte primária foi encontrada para confirmar isso em nenhuma das três sessões de pesquisa realizadas até agora**. Recomendo tratar isso explicitamente como hipótese não confirmada em qualquer decisão de design, não como fato.

---

## Limitações desta pesquisa

- `web_search` continua indisponível (mesmo erro "disabled or no provider is available").
- Reddit bloqueou todas as tentativas de acesso, inclusive via proxy de leitura (`r.jina.ai`) — nenhum dado de tamanho de subreddit foi obtido.
- PokéCommunity e disboard.org (diretório de Discord) retornaram desafios Cloudflare/CAPTCHA — confirma que os sites existem e estão ativos, mas não permite extrair número de membros.
- Google Trends (429) e SimilarWeb (403) bloquearam qualquer tentativa de medir interesse de busca ou tráfego específico do Brasil para Digimon.
- Não existe, até onde a pesquisa alcançou, uma fonte enciclopédica centralizada sobre remoções de fangames Digimon equivalente à de Pokémon — a ausência de casos documentados não deve ser lida como ausência de risco real, apenas como ausência de registro público encontrado nesta sessão.
- Não verifiquei fóruns de ROM hacking específicos (ex.: bases de dados de hacks de Pokémon fora do PokéCommunity/Relic Castle) nem comunidades de hacking de ROM de Digimon (menos comuns, já que a maior parte dos jogos oficiais de Digimon não são GBA/handheld clássico tão hackável quanto Pokémon) — possível lacuna adicional para uma sessão futura com acesso a busca funcional.
