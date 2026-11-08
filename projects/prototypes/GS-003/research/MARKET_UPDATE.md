# GS-003 — Atualização de mercado com busca web (2026-11-08)

**Autor:** game-research (Nação Games)
**Data:** 2026-11-08
**Entrada:** `MARKET_AND_IP.md`, `BUSINESS_CASE.md`, `EXECUTIVE_SUMMARY.md` (todos de 2026-11-08, sessão anterior sem busca funcional)
**Prioridade do fundador:** Linha B (monstros digitais, estilo Digimon) é prioridade; Linha A (estilo Pokémon) é secundária.

**Nota metodológica:** `web_search` (provider DuckDuckGo) foi testado nesta sessão e retornou erro — "web_search is disabled or no provider is available" em duas tentativas (`Digimon Story Time Stranger 2025 sales reviews` e `Cassette Beasts SteamDB concurrent players`). Ou seja, **a busca web continua indisponível nesta sessão**, apesar da expectativa do pedido. Toda a pesquisa abaixo foi feita com `web_fetch` em URLs diretas — mas, diferente da sessão anterior, desta vez **SteamCharts e a API pública de busca da Steam (`store.steampowered.com/api/storesearch`) funcionaram muito bem**, dando dados quantitativos reais que antes estavam marcados [H]. Reddit (`.json` e `old.reddit.com`), Google Trends, Google Play (busca e página de app) e a maior parte da documentação de monetização do CrazyGames retornaram bloqueio (403/429) ou exigem JavaScript — essas lacunas estão documentadas na seção de Limitações.

---

## 1. Concorrentes idle/monster-collector — dados quantitativos novos

### 1.1 Concurrent players (CCU) via SteamCharts — snapshot em 2026-11-08

[E] Fonte: `steamcharts.com/app/<id>`, lido em 2026-11-08. App IDs corretos confirmados via `store.steampowered.com/api/storesearch` (a sessão anterior tinha citado IDs errados para Cassette Beasts e Coromon, que redirecionavam para outros jogos — corrigido abaixo).

| Jogo | App ID Steam correto | Pico histórico (CCU) | Jogando agora | Média 30 dias | Pico 30 dias |
|---|---|---|---|---|---|
| **Palworld** | 1623730 | **2.101.535** | 43.609 | 36.027,56 | 77.212 |
| **Digimon Story: Time Stranger** | 1984270 | 83.857 (lançamento, out/2025) | 1.367 | 935,06 | 1.818 |
| **Temtem** | 745920 | 39.501 | 118 | 71,18 | 137 |
| **Coromon** | 1218210 | 3.987 | 61 | 78,94 | 163 |
| **Cassette Beasts** | 1321440 | 2.764 | 103 | 117,98 | 218 |
| **Monster Sanctuary** | 814370 | 1.376 | 144 | 94,07 | 159 |

**Leitura:** nenhum dos monster-collectors indie "puros" (Cassette Beasts, Monster Sanctuary, Coromon) sustenta hoje mais que ~100-200 jogadores simultâneos no Steam, mesmo tendo tido lançamentos bem avaliados (ver §1.2). Temtem, apesar de MMO com pico histórico de quase 40 mil, caiu para ~70-130 — consistente com o fato já registrado (`MARKET_AND_IP.md`) de que a Crema parou desenvolvimento de conteúdo novo em mar/2024. **Digimon Story: Time Stranger** teve um pico de lançamento quase idêntico ao número já citado pela Wikipédia (84.000), mas caiu **98,9%** em 13 meses (de 83.857 para ~935 jogadores simultâneos) — típico de RPG single-player sem live-service, não de um produto com retenção de longo prazo. **Palworld** é a única referência de escala massiva (ainda com dezenas de milhares de jogadores simultâneos 2+ anos após o lançamento), mas é um outlier de orçamento (equipe de 40+, publicado pela própria Pocketpair com marketing viral) — não é uma referência realista de porte para o GS-003.

### 1.2 Comparação com idles "puros" (sem tema de monstro) — evidência nova que fecha uma lacuna da sessão anterior

[E] A sessão anterior (`MARKET_AND_IP.md` §1) listou Legends of Idleon, Melvor Idle, NGU Idle e Idle Slayer como **[H] sem fonte** porque não têm verbete na Wikipédia. SteamCharts preencheu essa lacuna:

| Jogo | App ID | Jogando agora | Média 30 dias | Observação |
|---|---|---|---|---|
| **IdleOn — The Idle RPG** | 1476970 | 12.921 | 12.396,49 | Maior audiência ativa de todo este levantamento, incluindo Palworld em termos de estabilidade (crescendo +2,26% no mês) |
| **Melvor Idle** | 1267910 | 3.789 | 3.613,71 | — |
| **NGU Idle** | 1147690 | 2.963 | 2.930,04 | Curva **extremamente estável** ao longo de 2025-2026 (variação mês a mês quase sempre <3%) — típico de jogo "esqueça e volte depois", não de pico-e-morte |
| **Idle Slayer** | 1353300 | 1.152 | 1.122,54 | — |

**Leitura de negócio:** idles "puros" de progressão numérica sustentam audiências de 1.000 a quase 13.000 jogadores simultâneos no Steam de forma estável por anos — **uma ou até duas ordens de grandeza maior** que os monster-collectors de nicho (Cassette Beasts, Monster Sanctuary, Coromon, todos na faixa de 60-200). Isso é evidência real (não mais hipótese) de que **o loop idle/progressão é, isoladamente, um driver de retenção mais forte do que o tema de "coletar monstros"** — reforça a recomendação já dada pelo coordenador no `EXECUTIVE_SUMMARY.md` de que o protótipo precisa validar primeiro "o jogador volta para decidir, não só para ver números subirem", e sugere que a Linha B não deve negligenciar a qualidade do loop idle puro em favor só do tema Digimon.

[E] Busca por "tamer" no SteamCharts (2026-11-08) retornou apenas jogos indie pequenos com 0-51 jogadores simultâneos (Tamer: King of Dinosaurs, Tamer Vale, Monster Tamer, etc.) — confirma que o nicho de "monster tamer" indie no Steam especificamente é pequeno e fragmentado, nenhum concorrente diretamente comparável em escala. Busca por "pokemon" no SteamCharts retornou **0 resultados** — confirma que não existe jogo oficial de Pokémon no Steam (esperado, mas agora confirmado via dado ao vivo, não suposição).

### 1.3 Reviews e recepção crítica

[E] Confirmado via `store.steampowered.com/app/<id>` (2026-11-08):
- **Cassette Beasts** (appid 1321440, correto): preço US$19,99; pacotes de DLC cosmético (Cosplay Pack, Fashion Pack, Wing Pack) e trilha sonora vendidos separadamente — confirma monetização pós-lançamento via cosméticos pagos avulsos, mesmo sendo um jogo pago de base.
- **Coromon** (appid 1218210, correto): metascore **73**; descrito oficialmente como "monster-taming RPG" de mais de 10 anos de desenvolvimento, >120 Coromon catalogáveis; versão "Remastered" relançada com UI melhorada.
- **Monster Sanctuary**: reviews citadas no próprio Steam — Push Square 8/10, TheGamer 8/10, GameSpew 8/10; 111 monstros, com modo PvP online.
- **Palworld**: reviews mistas segundo a Wikipédia, mas "generally favorable" em termos de volume comercial; base de avaliação de 34 reviews críticas formais (Metacritic/OpenCritic) em 25/09/2026, segundo nota da própria Wikipédia.
- **Digimon Story: Time Stranger**: "generally favorable" no Metacritic (PS5 e PC); Famitsu deu 34/40 (4 críticos japoneses). GameSpot, CNET e Kotaku (preview) elogiaram o sistema de batalha e a coleta de Digimon como o ponto mais forte; críticas: linearidade, convenções de JRPG, "deficiências técnicas". [E, Wikipédia, lido 2026-11-08]

### 1.4 Comunidades (Reddit/Discord)

[H] **Não verificado nesta sessão.** Tentei `reddit.com/r/<sub>/about.json` e `old.reddit.com/r/<sub>/about.json` para r/digimon, r/incremental_games, r/Palworld, r/CassetteBeasts e r/PokemonROMhacks — todas as tentativas retornaram bloqueio (403 direto, ou redirecionamento para tela de login no caso do old.reddit.com). Isso significa que **o tamanho de assinantes dessas comunidades continua sem fonte verificada**, igual à sessão anterior. Recomendo que uma sessão com acesso a uma API de Reddit autenticada (ou um navegador real via ferramenta de browser automation) seja usada para preencher isso antes de uma decisão final de canal de comunidade.

---

## 2. Público de Digimon — sinal de demanda forte e novo (Linha B)

[E] **Digimon Story: Time Stranger** (Media.Vision / Bandai Namco), lançado 03/10/2025 (PC/PS5/Xbox Series), chegando a Switch/Switch 2 em 10/07/2026 — fonte: Wikipédia, lida em 2026-11-08:

- **84.000 jogadores simultâneos no pico de lançamento** (confirmado também via SteamCharts: 83.857), contra apenas 6.000 de Digimon Survive e 3.500 de Digimon Story: Cyber Sleuth — "um dos picos mais altos já registrados por um RPG japonês" na plataforma.
- Lançou 14 dias **antes** de Pokémon Legends: Z-A e, segundo a Wikipédia, "gozou de forte popularidade inicial no Steam" nesse contexto competitivo direto com Pokémon.
- No Japão, a Bandai Namco relatou que o jogo **superou expectativas**, com cópias físicas esgotadas (23.779 unidades físicas vendidas).
- Citado como "o Digimon Story mais vendido rapidamente da série, particularmente na América do Norte", e como motor de **"recorde de rentabilidade" para a marca Digimon**, 26 anos após o boom econômico original do anime.
- Primeira entrada da série Story com dublagem em inglês e tradução para 11 idiomas — sinal de que a Bandai Namco está **investindo pesado em expansão internacional da marca**, não só mantendo-a para o Japão.
- Crítica aponta explicitamente que o sucesso é **"parcialmente impulsionado pelo apelo nostálgico para millennials"**, o público que cresceu com o anime original de 1999 — exatamente o público-alvo que o fundador já identificou para a Linha B.
- DLC de expansão "A Hero's Eternal Legacy" anunciado para 2027 (mais de 50 novos Digimon) — mostra que a Bandai Namco está comprometida com o ciclo de vida de longo prazo da marca, não um lançamento isolado.

**Leitura:** isso é a evidência mais forte e mais recente coletada até agora de que a demanda por Digimon está **crescendo, não estagnada** — um ponto que a sessão anterior não tinha, pois o jogo era recente demais e a Wikipédia ainda não tinha o verbete processado. Isso dá suporte real (não mais hipótese) à priorização da Linha B pedida pelo fundador.

[H] **Importante ressalva:** essa é evidência de demanda pela *marca e narrativa* Digimon (RPG single-player, preço US$59,99-99,99, editora Bandai Namco) — não é evidência direta de que um **idle browser-based com monstros digitais 100% originais** (sem a marca Digimon) capturaria a mesma demanda. A queda de 98,9% no CCU em 13 meses (seção 1.1) também mostra que esse tipo de produto não gera retenção de longo prazo por si só — a Linha B precisa do loop idle para reter, não só do tema.

### 2.1 Existe um bom idle de monstros digitais original? (lacuna confirmada)

[H] Busca no SteamCharts por "tamer", "monster", "idle" e "digimon" (implícito nas buscas acima) não revelou nenhum título de porte relevante no Steam que combine (a) mecânica idle e (b) coleta/digievolução de monstros digitais com **IP 100% original**. O concorrente direto mais próximo já identificado continua sendo **Digi World Idle** (browser, BR, usa nomes oficiais de Digimon — ver `MARKET_AND_IP.md` §3), que não está no Steam. **Isso confirma a lacuna de mercado já apontada**: não encontramos um idle de monstros digitais original e bem executado competindo em escala — é um espaço real a ser preenchido, mas sem prova de que o mercado pagaria por ele (porque nenhum concorrente direto validou isso ainda).

### 2.2 Demanda no Brasil — sinal não verificado nesta sessão

[H] Google Trends (`trends.google.com`) retornou erro 429 ("Too Many Requests") na tentativa de consulta para "digimon" com filtro geográfico Brasil — não verificável via `web_fetch` nesta sessão (a ferramenta é fortemente baseada em JavaScript/XHR, pouco compatível com fetch direto mesmo sem bloqueio). Reddit bloqueado (ver §1.4). Google Play (`play.google.com/store/search`) também não renderizou conteúdo via `web_fetch` (página depende de JavaScript). **Nenhum dado quantitativo de demanda especificamente brasileira foi obtido nesta sessão** — mesma lacuna da pesquisa anterior.

---

## 3. Histórico de enforcement de IP — atualização do caso Palworld

A tabela de takedowns de fangames Pokémon (Uranium, Prism, AM2R, Brick Bronze, Pokémon Essentials, Relic Castle) já documentada em `MARKET_AND_IP.md` §2 **permanece válida e não precisou ser refeita** — reconfirmei a página-fonte (`en.wikipedia.org/wiki/List_of_Pokémon_fan_games`, lida de novo em 2026-11-08) e o conteúdo é o mesmo. O que há de **novo** é a evolução do caso Nintendo/TPC × Pocketpair (Palworld), que avançou significativamente desde a sessão anterior:

[E] Linha do tempo atualizada (Wikipédia, `en.wikipedia.org/wiki/Palworld`, lida em 2026-11-08):

- 18/set/2024: Nintendo e The Pokémon Company processam a Pocketpair no Tribunal Distrital de Tóquio por **infração de patente** (não copyright de personagem), alegando que o mecanismo de captura de criaturas em campo (análogo à Pokébola) viola uma patente específica. Pedido: 5 milhões de yenes cada + danos + injunção para bloquear o jogo.
- A Pocketpair lançou patches alterando a mecânica de captura em resposta à pressão legal (confirmado, maio/2025).
- Dez/2024-fev/2025: Nintendo registrou 23 patentes novas nos EUA para abrir uma segunda frente; **apenas 1 das 23 foi aprovada**, as outras 22 rejeitadas.
- Defesa da Pocketpair: citou o mod "Pocket Souls" (Dark Souls III) como prior art que invalidaria a patente; Nintendo contra-argumentou que mods não contam como arte anterior autônoma. Um analista (Florian Mueller, Games Fray) chamou a posição da Nintendo de "extrema".
- **18/set/2025:** audiência de apresentação de evidências ocorreu no tribunal de Tóquio.
- **09/11/2026 (amanhã, em relação à data deste relatório):** o tribunal deve **expressar uma opinião/decisão** sobre o caso — ou seja, **o veredito ainda não saiu até a publicação deste documento**.
- 12/jun/2026 (IGN, citando um especialista em propriedade intelectual): análise especula que, mesmo que a Nintendo ganhe, o valor de indenização pode ficar limitado a algo como **US$30.000** — uma fração irrisória frente ao tamanho do negócio da Pocketpair, sugerindo que o risco financeiro direto de uma violação de patente *perdida* pode ser menor do que o risco reputacional/de injunção.
- Out/2026 (Nintendo Life): a Pocketpair afirmou estar aberta a um lançamento futuro no Nintendo Switch 2, **mas apenas depois de resolver a disputa legal com a Nintendo** — ou seja, a disputa já está bloqueando decisões de negócio reais da empresa, independentemente do valor financeiro da multa.
- Escala do jogo, para contexto: pico histórico de **2.101.535** jogadores simultâneos no Steam (confirmado via SteamCharts, 2026-11-08); 32 milhões de jogadores no primeiro ano (IGN, fev/2025); ainda hoje sustenta médias de 36 mil jogadores simultâneos (SteamCharts, últimos 30 dias).

**Lição prática atualizada para o GS-003:** o caso Palworld mostra que (1) mesmo um jogo de **altíssima visibilidade e receita** pode operar por quase 3 anos sem a disputa de patente paralisar seu lançamento ou vendas — a injunção pedida não impediu a Pocketpair de lançar em PS5, fazer crossplay, ou anunciar a versão 1.0 em 2026; (2) a disputa, no entanto, **trava decisões estratégicas** (ex.: possível versão Switch 2 foi explicitamente colocada em espera até resolução legal); (3) o valor financeiro de uma eventual derrota pode ser pequeno (~US$30 mil, segundo análise de especialista) comparado ao porte do negócio, mas isso é uma estimativa para o caso Palworld especificamente (empresa grande, bem assessorada) — **não deve ser lido como "o risco de patente é barato para qualquer um"**; para um estúdio pequeno como o nosso, mesmo uma ação judicial de baixo valor de indenização ainda implica custo de advogado, tempo de resposta e risco de injunção que podem ser desproporcionalmente mais pesados. A recomendação já registrada (revisão jurídica da mecânica de captura antes de implementar, citada em `MARKET_AND_IP.md` §2 item 3) **permanece válida e ainda mais relevante**, já que o próprio caso de referência ainda não tem desfecho definitivo.

[H] **Enforcement específico contra Digimon:** não encontrei (nem na sessão anterior, nem nesta) uma página equivalente a "List of Pokémon fan games" para Digimon — não há evidência documentada de um padrão de takedowns da Bandai Namco contra fangames de Digimon na mesma escala/visibilidade do padrão Nintendo/TPC. Isso pode significar (a) a Bandai Namco é objetivamente menos agressiva/menos monitorada por imprensa de games, (b) a comunidade de fangames Digimon é menor e por isso atrai menos atenção, ou (c) simplesmente não foi documentado de forma centralizada como aconteceu com Pokémon. **Não tenho evidência para afirmar qual dessas é a explicação correta** — é uma lacuna real, não uma conclusão de que o risco é menor. O próprio Digi World Idle (BR, usa nomes oficiais de parceiros/Tamers) operando sem ação legal aparente, já documentado na sessão anterior, é a melhor evidência qualitativa disponível de que a Bandai Namco não age tão rápido/visivelmente quanto a Nintendo — mas de novo, ausência de evidência de ação não é evidência de ausência de risco.

---

## 4. Canais de navegador (itch.io, CrazyGames, Poki) — correção importante de premissa

Esta seção **corrige uma lacuna explícita da sessão anterior** (`BUSINESS_CASE.md` §1 e §3.4 marcavam os termos de revshare dessas plataformas como [H], com tentativas de fetch retornando 404).

### 4.1 itch.io — Open Revenue Sharing (confirmado)

[E] Fonte: `itch.io/docs/creators/payments`, lido em 2026-11-08:

- **Modelo "Open Revenue Sharing":** o próprio vendedor escolhe, em um slider, **qualquer percentual de 0% a 100%** da venda para repassar ao itch.io. O padrão sugerido é **10%**.
- Exemplo oficial de cálculo: em uma venda de US$10 com taxa padrão de 10%: `$10 - ($10 × 0,10) - $0,30 - ($10 × 0,029) = $8,41` líquido para o criador (ou seja, 10% para o itch.io + taxa do processador de pagamento, ~2,9% + US$0,30 fixo).
- itch.io recomenda vender por **no mínimo US$2** para evitar que a taxa fixa do processador (US$0,30) corroa uma fatia desproporcional da receita em produtos muito baratos.
- Retenção de imposto americana padrão de 30% para vendedores fora dos EUA sem Tax ID preenchido (redutível via tratado fiscal, se aplicável).
- **Implicação:** itch.io **não exige nem impõe nenhum modelo de monetização específico** — é compatível tanto com venda de preço fixo, doação "pague o que quiser", quanto (externamente, via integração própria) assinatura ou IAP, desde que o criador controle sua própria lógica de cobrança. Isso bate com o modelo de assinatura/passe de batalha já planejado no `BUSINESS_CASE.md` §1 — **itch.io é compatível com o plano atual**, sem necessidade de ajuste.

### 4.2 Poki — modelo 100% baseado em anúncios, sem moeda dupla (correção de premissa)

[E] Fonte: `developers.poki.com` e `developers.poki.com/guide/monetization`, lido em 2026-11-08:

- Poki é "a maior plataforma de jogos web", com **500+ desenvolvedores parceiros, 100 milhões de jogadores mensais, 1 bilhão+ de partidas/mês**.
- O guia oficial de monetização recomenda explicitamente: **"economias simples: uma moeda compreensível, recompensas claras, e sem moedas secundárias — jogadores web não gostam delas"** (tradução livre). Os tipos de vídeo recompensado descritos são: "ajuda" (revive, skip, dica, boost), "economia do jogo" (trocar moeda ganha por vídeo pelo mesmo efeito) e "customização" (cosméticos).
- **Nenhuma menção a IAP, assinatura ou battle pass** em toda a documentação pública consultada — o modelo Poki é **ads-only por padrão**.
- **Implicação direta para o GS-003:** o modelo de monetização já planejado no `BUSINESS_CASE.md` §1 (assinatura + battle pass + moeda dupla, inspirado em IdleDex/Digi World Idle) **vai diretamente contra as melhores práticas recomendadas pela própria Poki** ("web players dislike" moedas secundárias). Se o canal de lançamento for Poki, o modelo de monetização precisa ser redesenhado para anúncio recompensado com moeda única — não é um ajuste cosmético, é uma mudança de modelo de negócio para esse canal específico.

### 4.3 CrazyGames — ads como padrão, IAP só por convite

[E] Fonte: `docs.crazygames.com` (página inicial e FAQ), lido em 2026-11-08:

- Processo em duas etapas: **Basic Launch** (SDK opcional, **monetização desabilitada**) → **Full Launch** (SDK obrigatório, desbloqueia monetização por anúncios + analytics + cloud save + recursos sociais).
- **In-game purchases (IAP) são um recurso "invite-only"** — só disponível para desenvolvedores convidados pela própria CrazyGames, via parceria com Xsolla, e exige que o jogo tenha contas de usuário logadas (módulo "User" do SDK) e, idealmente, back-end de progresso salvo (módulo "Data").
- Dev mantém 100% de propriedade do jogo (confirmado via FAQ: "Do I still own my game? Yes, 100%").
- Já pode estar publicado simultaneamente no Steam/mobile/site próprio — **não é exclusividade**.
- [H] O percentual exato de revenue share de anúncio não foi confirmado nesta sessão: as páginas específicas de "Payouts" e "Monetization > Midcore, RPG & Idle" retornaram 404 nos caminhos tentados (a estrutura de URLs do site mudou e não encontrei os caminhos corretos sem busca funcional), e uma tentativa adicional em `developer.crazygames.com` retornou 429 (rate limit). Isso é uma lacuna real.
- **Implicação:** assim como a Poki, a CrazyGames é **fundamentalmente uma plataforma ad-funded**; o modelo de assinatura/battle pass planejado só seria viável lá **depois** de conseguir acesso ao programa de IAP por convite (ou seja, não disponível no lançamento/MVP) — reforça a mesma correção de premissa da seção 4.2.

### 4.4 Correção de premissa recomendada para o BUSINESS_CASE

[H] Diante de 4.1-4.3, a recomendação prática é: **tratar itch.io como o canal web primário para o modelo de assinatura+battle pass já planejado** (compatível, sem fricção), e tratar Poki/CrazyGames como **canais secundários de alcance/visibilidade via build gratuito com anúncios**, não como o canal principal de monetização por assinatura. Rodar os dois modelos ao mesmo tempo (build pago/assinatura no itch.io e site próprio; build ad-supported sem moeda dupla nos portais) é operacionalmente mais trabalho, mas evita o erro de lançar no Poki/CrazyGames com um sistema de monetização que a própria documentação deles recomenda evitar.

---

## 5. Atualização de premissas do BUSINESS_CASE

### 5.1 Benchmarks de CCU/escala — substitui placeholders [H] por dados [E]

A tabela abaixo substitui a lacuna de "Legends of Idleon, Melvor Idle, NGU Idle, Idle Slayer... sem fonte" citada em `MARKET_AND_IP.md` §1 e usada como base para as premissas hipotéticas de usuários do `BUSINESS_CASE.md` §4.1:

| Classe de referência | Exemplos | CCU Steam típico hoje | Uso para o GS-003 |
|---|---|---|---|
| Idle "puro" (progressão numérica, sem tema de monstro forte) | IdleOn, Melvor Idle, NGU Idle, Idle Slayer | 1.000-13.000 | Teto realista para o **loop idle em si**, se bem executado e com retenção de longo prazo |
| Monster-collector indie pago (sem live-service, Steam) | Cassette Beasts, Monster Sanctuary, Coromon | 60-300 | Referência de **porte realista para um estúdio pequeno**, mesmo com boas notas de crítica |
| Monster-collector/survival com publisher e marketing agressivo | Palworld | Até 2,1 milhões (pico), ~36 mil hoje | **Outlier, não é referência de planejamento** — não comparável a um orçamento indie/bootstrap |
| RPG de marca grande, lançamento único (não idle) | Digimon Story: Time Stranger | 83.857 pico → 935 hoje (-98,9% em 13 meses) | Mostra que **marca forte sem loop de retenção desaba rápido** — não é o modelo a copiar |

**Recomendação de ajuste:** os cenários "conservador" e "base" do `BUSINESS_CASE.md` §4.1 (200-4.000 usuários ativos em 3-12 meses) permanecem plausíveis frente à classe "monster-collector indie pago" (que tem dezenas a poucas centenas de jogadores simultâneos no Steam, compatível com uma base de usuários maior em web/mobile onde o Steam não é o único canal). O cenário "otimista" (15.000 usuários, ~US$15.700/mês em 12 meses) está mais próximo da escala de um sucesso de breakout tipo Palworld — deveria ser tratado explicitamente como **cauda de baixa probabilidade**, não como "cenário otimista razoável", no texto do business case.

### 5.2 Monetização — ajustar por canal, não um modelo único (ver seção 4.4)

Substituir a recomendação única de "assinatura + battle pass + cosméticos" (`BUSINESS_CASE.md` §1) por uma recomendação **segmentada por canal**:
- **itch.io / site próprio / Steam (futuro):** manter o modelo já planejado (assinatura de conveniência + battle pass + cosméticos), compatível com Open Revenue Sharing (0-100%, padrão 10%, + ~2,9%+US$0,30 de processador).
- **Poki / CrazyGames (se usados):** modelo de anúncio recompensado opt-in, **moeda única** (não duas moedas), sem assinatura — alinhado à própria documentação dessas plataformas (seção 4.2-4.3). CrazyGames pode futuramente habilitar IAP por convite, mas não no MVP.

### 5.3 Demanda da Linha B — upgrade de confiança

A seção 5 ("Quanto investir para validar") e a seção 7, pergunta 3 ("retorno esperado, com que confiança") do `BUSINESS_CASE.md` marcavam a confiança como **baixa**, por falta de dado real de conversão/ARPU do nicho. Isso **continua verdadeiro para ARPU/conversão** (nenhum dado novo de ARPDAU foi encontrado nesta sessão), mas a evidência da seção 2 deste relatório (Digimon Story: Time Stranger como "fastest-selling Digimon title", recorde de rentabilidade da marca, nostalgia de millennials como driver confirmado por múltiplos veículos de imprensa) **aumenta a confiança qualitativa de que existe demanda real e crescente por produtos de Digimon no momento atual** — o que apoia a priorização da Linha B já decidida pelo fundador. Isso não resolve a lacuna de ARPU/conversão específica de um idle browser (que seria um produto totalmente diferente do RPG premium da Bandai Namco), mas remove uma possível objeção de "o interesse por Digimon pode estar morto" — não está; está em alta.

### 5.4 Kill criteria e taxas de loja — sem alteração

Nenhuma evidência nova contradiz os kill criteria já definidos (`BUSINESS_CASE.md` §5.3) ou as taxas de Apple/Stripe já confirmadas (`BUSINESS_CASE.md` §3.4) — mantidos como estão.

---

## Limitações desta pesquisa

- **`web_search` (DuckDuckGo) testado e confirmado indisponível** nesta sessão ("web_search is disabled or no provider is available"), apesar da expectativa do pedido de que estaria funcionando — toda a pesquisa foi via `web_fetch` em URLs diretas.
- **Reddit bloqueado** (403 em `reddit.com/.../about.json`; redirecionamento para login em `old.reddit.com`) — nenhum dado de tamanho de comunidade (r/digimon, r/incremental_games, r/Palworld, r/CassetteBeasts) foi obtido.
- **Google Trends bloqueado** (429 "Too Many Requests") — nenhum dado de interesse de busca ao longo do tempo para "Digimon" no Brasil foi obtido.
- **Google Play** (busca e páginas de app) não retornou conteúdo via `web_fetch` — a interface depende de JavaScript do lado do cliente; nenhum dado de downloads/reviews de apps mobile de Digimon ou monster-collector idle foi obtido.
- **CrazyGames:** páginas específicas de revenue share de anúncios ("Payouts", "Monetization > Midcore, RPG & Idle") retornaram 404 (caminhos de URL incorretos, sem busca para encontrar os corretos) ou 429 (rate limit) — percentual exato de revshare de anúncios não confirmado.
- **SteamDB** não foi testado diretamente nesta sessão (SteamCharts, que forneceu dados equivalentes de CCU histórico/atual, funcionou e foi usado em seu lugar) — dados de vendas estimadas (não CCU) do SteamDB continuam sem fonte.
- **Nenhum dado de ARPDAU, taxa de conversão ou benchmark de monetização específico do nicho idle/monster-collector** foi encontrado nesta sessão — mesma lacuna da pesquisa anterior.
- **Decisão do tribunal de Tóquio no caso Nintendo/TPC × Pocketpair está marcada para 09/11/2026** — um dia depois da data deste relatório (08/11/2026). O resultado real da decisão **não é conhecido no momento da escrita** e deveria ser verificado novamente antes de qualquer decisão final de design que dependa desse precedente.
- A análise de enforcement de IP contra Digimon especificamente continua qualitativa (ausência de uma fonte enciclopédica centralizada equivalente à de Pokémon), não uma conclusão definitiva sobre o nível de risco real.
