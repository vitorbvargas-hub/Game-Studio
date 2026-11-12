# GS-003 — Reference Library

**Autor:** game-research · **Data:** 2026-11-08 · **Base:** ADR-009 (reset do GS-003 para Idle MMORPG pixel art), docs 01 e 05 do briefing, teardown existente de IdleDex, concept art do fundador.

Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/leitura não verificada diretamente nesta sessão.

Este documento registra **todos os links usados** e **o motivo de cada referência**, conforme exigido pelo item 13 de `01_GS001_creature_world_foundation.md`.

---

## 1. IdleDex (gameplay/estrutura idle)

**Motivo da referência:** o briefing define que "a jogabilidade e a experiência vêm do IdleDex" (ADR-009). É a referência de mecânica de progressão, automação (AUTO), retenção (passe de batalha, streak, offline progress) e monetização.

| Link | O que foi observado [E] | Limitação de acesso |
|---|---|---|
| `https://idledex.com/` | Não refetchado nesta sessão — já coberto pelo teardown jogado existente (`teardowns/IDLEDEX.md`, 2026-11-08, feito por game-qa com conta de teste). | Site é um jogo logado/dinâmico; não é possível extrair gameplay via `web_fetch` (sem execução de JS). |
| `https://idledex.com/play` | Idem — teardown já documenta onboarding, core loop, decisões reais vs. espera, eventos, ranking, monetização e, mais importante, um **alerta de risco de IP altíssimo** (uso direto de espécies, itens, regiões e personagens oficiais de Pokémon). Screenshots de evidência em `evidence/idledex/` (13 arquivos, `01_criacao_personagem.png` a `13_estado_final.png`). | Mesma limitação — requer sessão logada e interação real, não compatível com `web_fetch`. |
| `https://wiki.idledex.com/` | **[E, 2026-11-08]** Tentativa de `web_fetch` nesta sessão retornou apenas o título da página (`"Wiki idleDEX"`), sem conteúdo de texto — a wiki é renderizada via JavaScript (SPA), e `web_fetch` não executa JS. | Conteúdo não extraível por `web_fetch`; o teardown existente já cita trechos específicos da wiki (mecânica de Mega Evolução, eventos, PvP banlist) obtidos em sessão anterior, provavelmente via navegador real. Recomenda-se qualquer leitura adicional da wiki usar a ferramenta de browser, não `web_fetch`. |

**Lição central para o GS-003 [H, herdada do teardown]:** copiar os **conceitos de mecânica genérica** (loop idle com automação, passe de batalha em 3 camadas, boost de sorte em escada, disputa territorial de guilda, offline progress com teto free/premium) e **nunca** os nomes/espécies/itens/personagens oficiais — o IdleDex é o exemplo vivo do risco de IP que o estúdio precisa evitar.

---

## 2. Drakantos (mundo, cenários, acabamento visual)

**Motivo da referência:** o briefing define que "o mundo, os cenários e o acabamento vêm do Drakantos" (ADR-009). É a referência de direção de arte top-down 3/4, densidade de mundo e acabamento de produção AA/indie.

| Link | O que foi observado [E, 2026-11-08, via `web_fetch`] | Limitação de acesso |
|---|---|---|
| `https://press.drakantos.com/` | Press kit carregou normalmente. Confirma: MMORPG top-down pixel art "nostálgico"; inspirações declaradas — Chrono Trigger, Stardew Valley, Graveyard Keeper, Stoneshard, e tema "Middle-earth" (anões, dragões, elfos); mundo chamado **"Eldras"**; 21 heróis jogáveis; dungeons/missões rotativas; PvP ranqueado (inspirado em Overwatch/Brawl Stars/League of Legends); +150 inimigos; sistema de guildas; colecionáveis (ícones, títulos, skins, pets, +30 emotes por herói); ciclo dia/noite; mercado entre jogadores; housing/customização de terreno. Vídeos linkados (não assistidos nesta sessão, só catalogados): teaser de gameplay, "The Cultists' Domain", teaser de personagem "Yura". | Press kit é só texto/descrição de features — não é possível avaliar tilesets/sprites reais sem abrir as imagens/vídeos num navegador (fora do escopo desta ferramenta de fetch). |
| `https://store.steampowered.com/app/2454980/Drakantos/` | Página da Steam carregou normalmente. Confirma: free-to-play; narrativa por cutscenes; "breaking away from traditional class systems"; dungeons dinâmicas com bosses/armadilhas/eventos; PvP com stats equalizados ("só habilidade e estratégia importam"); customização de skill via orbs/artefatos; housing; crafting; highscores. | Mesma limitação de mídia — só texto descritivo extraído, sem captura de screenshots do jogo em si. |
| `https://wingeon.com/` | Site institucional da Wingeon carregou normalmente. Confirma estúdio **brasileiro** (indie), foco em "unforgettable multiplayer games with nostalgic pixel art style"; **cita o mundo do jogo como "Derid"** (nome diferente de "Eldras" citado no press kit) e "20 unique playable characters" (vs. "21" no press kit). | **[H]** Divergência de nome do mundo (Eldras vs. Derid) e contagem de heróis (21 vs. 20) entre as duas fontes oficiais pode indicar atualização de versão entre as duas páginas (uma mais recente que a outra) — não foi possível determinar qual é a mais atual nesta sessão; registrar a inconsistência em vez de escolher uma arbitrariamente. |

**Uso pretendido:** referência de composição de mundo "vivo" (vegetação, água, construções, NPCs, ciclo dia/noite) e de acabamento visual "AA indie" — nunca copiar sprites, paletas específicas ou assets do jogo (regra do briefing, seção 2: "Não copiar sprites, mapas, personagens ou recursos protegidos").

---

## 3. Guilmon / Digimon (personalidade e animação de criaturas)

**Motivo da referência:** o briefing define que "a personalidade e as animações das criaturas vêm de Guilmon" e do Digimon World DS (ADR-009) — mas o ADR-009 também deixa claro que **monstros ficam fora do escopo desta tarefa específica** (Tarefa A/B pedida ao game-research nesta sessão é só ambiente/UI e biblioteca de referência). Esta seção documenta o acesso às fontes, não produz nenhum design de criatura.

| Link | O que foi observado [E, 2026-11-08] | Limitação de acesso |
|---|---|---|
| `https://digimon.fandom.com/wiki/Gallery:Guilmon` | **Bloqueado** — `web_fetch` retornou erro 403 com página de desafio Cloudflare ("Just a moment..."). | Fandom Wiki bloqueia bots de fetch simples; precisa de navegador real com JS para passar o desafio. Consistente com o aviso do próprio enunciado da tarefa ("pode dar 403"). |
| `https://wikimon.net/Guilmon` (espelho tentado) | **Funcionou.** Confirma dados oficiais de referência [E]: Guilmon é **Child-level**, tipo **Reptile/Small Devil**, atributo **Virus**; categorias "Dragon's Roar", "Metal Empire", "Nature Spirits", "Virus Busters"; movimento-assinatura **Rock Breaker** (destrói rochas com as garras) e movimento especial **Fireball**; a marca no abdômen é chamada "Digital Hazard". Fonte citada pela própria Wikimon: Digimon Reference Book oficial (`digimon.net/reference`). | Wikimon é uma wiki de fãs (não oficial), mas cita e linka a fonte primária oficial (Digimon Reference Book da Bandai); não é uma galeria de imagens/sprites — é uma página de perfil textual com um link de imagem única (`File:Guilmon.jpg`), não uma galeria de poses. Não substitui a galeria do Fandom pedida originalmente, mas cobre a personalidade/lore. |
| `https://codexpets.net/gallery/guilmon` | **Funcionou**, mas revelou algo **diferente do esperado**: não é uma galeria oficial nem um banco de sprites de Digimon — é a página de um "Codex Pet" (ferramenta de terceiro não identificada no enunciado, aparentemente um app de "pets" de desktop/overlay) com um pacote de spritesheet **feito por um usuário da comunidade ("jwzoom")**, upload datado de 2026-05-04, com 9 estados de animação (Idle, Running Right, Running Left, Waving, Jumping, Failed, Waiting, Running, Review). | **[H]** Licença de uso deste pacote específico não está declarada na página capturada — é um upload de fã para uma ferramenta de terceiros, não uma fonte com termos de licença claros. **Não usar como asset**, só como curiosidade de que a comunidade já pensa em Guilmon com os mesmos estados de animação (idle/walk/attack-like) que o ADR-009 pede para as criaturas do GS-003 — reforça que a convenção de estados (IDLE, WALK, FOLLOW, ATTACK etc.) é um padrão natural do gênero, não uma invenção arriscada de IP. |

**Nota de segurança [H]:** nenhuma imagem de Guilmon, Digimon ou qualquer sprite de terceiro foi baixada, salva ou copiada nesta tarefa — só texto descritivo foi lido, conforme a restrição do próprio ADR-009 (sprites oficiais extraídos de jogos continuam proibidos em qualquer camada além de `reference`, e mesmo isso pendente de decisão do fundador).

---

## 4. Ferramentas de animação (produção de spritesheets)

**Motivo da referência:** o briefing (seção 6 do doc 01, item "6" do doc 05) pede para "identificar ferramentas para produção de spritesheets".

| Ferramenta | O que foi observado [E, 2026-11-08] | Licença / custo | Roda neste Linux sem `sudo`? |
|---|---|---|---|
| `pixel.fliperstudio.com/pixel-art-animation` | Gerador web de animação por IA: usuário sobe um sprite, escolhe um movimento pré-definido (walk/idle/jump/attack/crouch/destroy/rotate) e recebe um spritesheet. Texto da própria página: **"How much does it cost? A fraction of a generated sprite. The exact price shows in credits before you start."** | **Pago por crédito** (modelo de IA generativa monetizado). | N/A — é um serviço web, não um programa local; mas o modelo de custo por crédito de IA **conflita com a regra já registrada em `PIXEL_ART_DIRECTION.md` ("R$ 0, sem IA paga. Nenhum Recraft, nenhuma API de imagem... usada")** — não usar sem aprovação explícita do fundador para gasto. |
| `pixler.dev` | Gerador web de sprites e animações por IA generativa ("Describe it, get a transparent sprite in seconds, then animate it"); também permite gerar a partir de imagem de referência. Página anuncia "no signup to try", mas é claramente uma ferramenta de **geração de imagem por IA**, não um editor manual. | Modelo freemium/créditos (não detalhado totalmente no fetch, mas a proposta central é geração por IA, tipicamente paga além de um teste gratuito limitado). | N/A — serviço web. **Mesma ressalva de `pixel.fliperstudio.com`:** geração de imagem por IA está fora da política "R$0, sem IA paga" já registrada pelo game-art para este projeto; não usar para produção de asset final sem decisão explícita do fundador. |
| **Aseprite** | Editor de pixel art e sprite sheet dedicado — layers, onion skin, tags de animação, export para PNG sequence/GIF/sprite sheet + JSON, texture atlas. Padrão de mercado para pixel art de jogos. | **Proprietário/EULA própria** — o binário oficial (Steam/itch.io/site) é pago (~US$20 único); o código-fonte é público no GitHub, mas sob uma licença customizada que **não permite redistribuir builds compilados sem licença paga** (compilar para uso pessoal próprio é permitido pelos termos do projeto, mas não é uma instalação "simples" — exige toolchain de compilação C++/Skia). | **[H] Não verificado por execução nesta sessão** (só a página de marketing foi lida). Não há build gratuito oficial para Linux; rodar exigiria comprar a licença oficial ou compilar do zero (`git clone` + build com Skia), o que não é "sem instalar com sudo" na prática — exige dependências de build (cmake, compilador C++) que provavelmente não estão presentes e exigiriam `apt install` com senha de root. |
| **LibreSprite** | Fork 100% livre do Aseprite anterior à mudança de licença. | **GNU GPL v2** — confirmado no rodapé do site oficial (`libresprite.github.io`), linkando para `LICENSE.txt` no repositório GitHub. Totalmente gratuito. | **[E] Provavelmente sim, sem `sudo`.** O projeto publica builds AppImage no GitHub Releases; esta sessão confirmou via `exec` que `fuse3`/`libfuse3-3` **já estão instalados** neste host (Linux WSL2, Ubuntu "noble"), que é o requisito para executar AppImages sem instalação de sistema. Fluxo esperado: baixar o `.AppImage`, `chmod +x`, executar diretamente — **não testado nesta sessão** (fora do escopo: a tarefa pede avaliação de licença/viabilidade, não instalação real). `sudo` **não está disponível sem senha** neste host (`sudo -n true` retornou "a password is required"), então qualquer caminho que dependa de `apt install` fica bloqueado; o caminho AppImage evita esse bloqueio. |
| **Pixelorama** | Editor de pixel art open-source feito em Godot Engine, com timeline de animação, onion skinning, tilemap layers (incluindo isométrico/hexagonal), paletas e efeitos não-destrutivos. | **Open-source** (projeto da Orama Interactive) — a página do itch.io não expôs o texto exato da licença no fetch, mas o projeto é publicamente conhecido por usar **MIT License** no repositório GitHub `Orama-Interactive/Pixelorama` **[H, não reconfirmado nesta sessão diretamente no arquivo LICENSE do repo]**. Gratuito (com doação opcional via Patreon). | **[E] Provavelmente sim, sem `sudo`**, pela mesma razão do LibreSprite: itch.io costuma distribuir builds Linux como `.zip` autocontido ou `.AppImage` (Godot exporta nativamente para ambos); com `fuse3` já presente, um AppImage roda direto. **Não testado nesta sessão.** A própria página avisa que a versão Android é experimental — não é relevante para este host Linux desktop. |

**Recomendação de produção [H]:** para o pipeline de animação manual (walk/attack/hit das criaturas, já em andamento conforme `PIXEL_ART_DIRECTION.md` §0.1), **LibreSprite** ou **Pixelorama** são os caminhos mais seguros neste host — gratuitos, sem dependência de `sudo`/senha de root (que não está disponível), e sem o problema de política "R$0, sem IA paga" que `pixel.fliperstudio.com` e `pixler.dev` carregam por serem geradores de imagem por IA. O pipeline atual do game-art (gerar sprites via código Node.js puro) continua sendo a alternativa de menor risco de todas, já comprovada funcionando neste ambiente.

---

## 5. O que o fundador espera (10 bullets, cruzando os 6 docs do briefing + concept art)

> **Limitação de acesso à imagem [E, 2026-11-08]:** a tentativa de abrir `art/reference/concept-founder/concept_world_and_creature.png` com a ferramenta de visualização de imagem retornou erro — **"Local media path is not under an allowed directory"**. Ou seja, **o conteúdo visual específico da imagem conceito não pôde ser inspecionado diretamente nesta sessão** (restrição de sandbox da ferramenta, não falta do arquivo — o arquivo existe e foi listado via `ls`). Os 10 bullets abaixo cruzam os 6 documentos de briefing já lidos (`01`, `05`, mais o texto completo do ADR-009 que resume os demais) com o que já está documentado sobre a imagem em `MARKET_AND_IP.md`/`PIXEL_ART_DIRECTION.md` — **não é uma descrição direta da imagem**, e isso está sinalizado em cada bullet onde a imagem seria a fonte primária.

1. **Um Idle MMORPG, não um clone de IdleDex.** A estrutura de automação/progressão vem do IdleDex, mas o fundador já viu o risco de IP do IdleDex (nomes/espécies oficiais) — espera mecânica genérica, não cópia de marca.
2. **Mundo top-down 3/4 "vivo" no nível de acabamento do Drakantos**, não no nível "tiny"/flat do Kenney — isso é confirmado pelos 2 pacotes CSAF Verdant (pagos) terem nota muito mais alta que os pacotes CC0 genéricos no catálogo desta mesma entrega, sugerindo que atingir o padrão esperado provavelmente vai exigir investimento, não só assets gratuitos.
3. **Combate sempre no próprio mapa, nunca em tela separada** — regra obrigatória e repetida (seção 3 do doc 01); qualquer asset ou decisão de UI que implique mudança de cena de combate está fora do que o fundador quer.
4. **Criaturas pequenas e expressivas, com personalidade de Guilmon/Digimon World** — mas isso é trabalho da Linha de arte de criaturas (fora do escopo desta tarefa específica de ambiente/UI); a Tarefa A desta entrega respeitou a instrução de excluir monstros genéricos.
5. **Vegetação, água, pedras, construções detalhadas** — exatamente os 3 biomas pedidos nesta tarefa (campo, floresta, água); o fundador quer isso rico em detalhe, não placeholder.
6. **Efeitos visuais "sem exageros"** — o doc 01 pede isso explicitamente; por isso o catálogo desta entrega prioriza um pacote de explosão sóbrio (ansimuz, CC0) em vez de efeitos exagerados de gacha mobile.
7. **Licenciamento rigoroso e documentado** — o fundador pede registro de origem/licença para todo asset (seção 14 do doc 01); por isso cada candidato do catálogo desta entrega tem o texto de licença citado, não resumido de memória.
8. **Nada comprado sem aprovação** — repetido em várias camadas (ADR-009, doc 01 §14, doc 05 "Não comprar assets automaticamente"); por isso os dois melhores assets técnicos do catálogo (Verdant 01/04) ficam marcados como pendentes de decisão de compra, não comprados.
9. **Pipeline com pontuação objetiva (0-100) e catálogo central** — já implementado nesta entrega (`ASSET_DISCOVERY_CATALOG.json`/`.md`) seguindo exatamente os pesos do doc 05 (visual 25, técnica 20, animações 20, compatibilidade 15, licença 20).
10. **Visual final consistente, não uma colagem de fontes aleatórias** — por isso o catálogo recomenda consolidar numa única paleta mestra (DawnBringer 32 ou Resurrect 64) entre os 3 biomas, mesmo usando tilesets de fontes diferentes (Kenney, LPC, CSAF, Pipoya), para reduzir o risco de "colcha de retalhos" visual que a mistura de fontes gratuitas normalmente produz.

---

## 6. Limitações gerais desta entrega

- `web_search` indisponível durante toda a sessão; toda pesquisa via `web_fetch` direto.
- Imagem conceito do fundador não pôde ser aberta pela ferramenta de visualização (restrição de diretório permitido) — bullets da seção 5 que dependeriam da imagem foram cruzados com documentação textual já existente sobre ela, não com inspeção visual direta.
- `digimon.fandom.com` bloqueado por Cloudflare; mitigado com o espelho `wikimon.net`, que cobre a parte textual/lore mas não é uma galeria de poses de sprite.
- `wiki.idledex.com` não renderizou conteúdo via `web_fetch` (SPA); o teardown existente (`teardowns/IDLEDEX.md`) já cobre o essencial de uma sessão anterior com navegador real.
- Nenhuma ferramenta de animação (Aseprite/LibreSprite/Pixelorama) foi de fato instalada ou executada nesta sessão — a avaliação de "roda sem `sudo`" é baseada em (a) confirmação de que `fuse3` já está presente neste host e (b) conhecimento de que esses projetos publicam AppImages/builds Linux autocontidos, não em um teste real de download+execução.
- Nenhuma imagem/sprite de terceiro (Digimon, Drakantos, IdleDex) foi baixada ou salva em `art/reference/private/` nesta tarefa — só texto foi lido e citado.
