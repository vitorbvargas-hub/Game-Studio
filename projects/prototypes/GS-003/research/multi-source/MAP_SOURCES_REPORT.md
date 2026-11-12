# GS-003 — Addendum: fontes de mapa (multi-source)

**Autor:** game-research (subagente) · **Data:** 2026-11-11 · **Encomendado por:** fundador (via game-studio).

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/estimativa não confirmada.
> **Custo zero nesta tarefa:** só leitura/pesquisa (`web_fetch`) e inspeção do código local. Nenhuma compra, conta ou download executado.
> **Contexto que muda a leitura de risco:** GS-003 é fan game **não comercial**; em 2026-11-11 o fundador decidiu que os Digimon podem ser **iguais aos oficiais** (não precisam ser redesenhados). Isso já valia para sprites de criatura via o rights layer `official-fan-use` (ADR-009, 2026-11-08, ver `research/sprite-recovery/digimon_asset_licenses.json`) — a decisão de hoje reafirma/estende a mesma lógica. Ela **não torna o jogo comercializável**: nenhum dos materiais abaixo tem licença que permita venda, e o risco de notificação/DMCA descrito em `MARKET_AND_IP.md` §2 continua valendo caso o projeto saia do uso privado/não comercial.

**Formato de mapa do nosso jogo [E, verificado no código em 2026-11-11]:** `prototype/world/` (pacote `gs003-world`, Canvas 2D, sem Phaser/PixiJS) lê mapas em `src/data/maps/*.tmj.json`: um **subconjunto do Tiled JSON** (`src/sim/map.ts`, comentário do próprio arquivo: *"Mapa do mundo a partir de um subconjunto do Tiled JSON (.tmj)"*). Estrutura observada num mapa real (`digimon-forest-01.tmj.json`):
- `tilewidth`/`tileheight` = **32px** (consistente com a decisão de arte do estúdio).
- `layers`: `tilelayer` (`ground`, `ground_detail` — arrays `data` de inteiros/gid) + `objectgroup` (`objects_below`, `objects_above`, `collision`, `curves`, `spawns`, `npcs`, `triggers`, `poi`).
- **Diferença crítica de qualquer importador padrão de Tiled:** cada tile do `tileset` carrega propriedades customizadas `key` (string, nome da sprite no atlas próprio do Map Factory) e `solid` (bool). O renderer (`render/view.ts`, `render/portrait.ts`) **não desenha a partir de uma imagem de tileset por gid** — ele resolve `atlasKey`/`key` contra um atlas JSON empacotado pelo pipeline Map Factory do próprio estúdio (`art/map-factory/*/tileset.json`). Ou seja: um `.tmj` genérico (gid → PNG de tileset único) **não roda direto** no nosso motor; precisa de um passo de remapeamento gid→key→sprite.

---

## 1. Fontes avaliadas

### 1.1 `github.com/blixxurd/kanto` [E, 2026-11-11, fetch direto]

- **O que tem:** engine de navegador (PixiJS 8 + @pixi/tilemap) que renderiza **toda a região de Kanto de Pokémon FireRed** stitchada num overworld único (~424×416 tiles), com mapas internos (casas/cavernas/ginásios) por warp. Pipeline de 12 scripts Python extrai do decomp `pret/pokefirered`: atlases de metatile (16×16, compostos de tiles 8×8 + paleta GBA), layouts de mapa, **conexões**, **warps**, **colisão** (`metatile_attributes.bin` → passabilidade + flags de comportamento), sprites de jogador/NPC (136 NPCs), animação de tiles (água/flores/areia), door animations.
- **Formato de saída:** `public/` = **Tiled JSON** (mapas) + **PNG** (atlases de metatile) + JSONs de dados (warps, sprites). O próprio README recomenda abrir o resultado no editor **Tiled** (`doc.mapeditor.org/.../json-map-format`).
- **Conversão necessária para o GS-003:** **alta**. (a) O overworld inteiro é de **Kanto/Pokémon**, não Digimon — útil só como *referência técnica de pipeline*, não como mapa final (teríamos um mundo visualmente e tematicamente de Pokémon, errado para o produto). (b) Mesmo tecnicamente: o `.tmj` gerado usa `gid` numérico apontando para um PNG de atlas por metatile — nosso motor espera `key` string + `solid` bool por tile (ver acima); um script de remapeamento teria que (i) recortar cada metatile do atlas PNG, (ii) batizar com uma chave no padrão do nosso Map Factory, (iii) registrar no atlas JSON do pipeline, (iv) reescrever o array `data` trocando gid por índice da nova tileset local. Nada disso é automático — é trabalho de engenharia equivalente a reconstruir o pipeline Map Factory para uma fonte externa.
- **Licença:** **[E]** Repositório sob **MIT** (código do próprio `blixxurd/kanto`: scripts de extração + engine TS/PixiJS). **Mas a MIT cobre só o código do blixxurd** — os **dados extraídos** (tiles/sprites/mapas do ROM de Pokémon FireRed) **não são do blixxurd** e não têm licença aberta: são ativos da Nintendo/Game Freak embutidos no ROM comercial. O projeto depende de o usuário **clonar `pret/pokefirered`** e, implicitamente, possuir o ROM original para a extração fazer sentido (o decomp em si não redistribui o ROM).
- **Avaliação A/B/C:** **C (usar só estrutura)** é a única opção segura/relevante aqui — reaproveitar a *lógica* de stitching de overworld, sistema de warp, field effects (grama alta, ledge jump) como referência de arquitetura para o nosso próprio engine, sem copiar nenhum pixel de Kanto.

### 1.2 `github.com/pret/pokeemerald` e `github.com/pret/pokefirered` [E, 2026-11-11, fetch direto]

- **O que são:** decompilações (reverse engineering completo, não um ROM hack) de **Pokémon Emerald** e **Pokémon FireRed/LeafGreen**. README de ambos é minimalista: só instrução de build (`INSTALL.md`) e hash SHA1 do ROM que cada decomp reconstrói byte-a-byte.
- **O que têm (via o que o `kanto` consome deles):** mapas completos (`map.bin`), headers de mapa com **conexões** entre rotas, **eventos de warp**, **tabelas de encontro** (wild encounters), atributos de metatile (colisão/comportamento), paletas e tiles brutos em formato GBA (8×8, 4bpp).
- **Formato:** C (headers/dados do jogo) + binários GBA brutos — **não é Tiled/JSON**; é a representação nativa do hardware GBA. Precisa de um extrator (como o `kanto` ou o `tjtwl/ROM-Asset-Extractor`) para virar algo usável fora do contexto de build do próprio jogo.
- **Conversão necessária:** **altíssima e, mais importante, irrelevante para o conteúdo** — são decomps de **Pokémon**, zero conteúdo Digimon. Só serviriam como fonte de dados de **estrutura de mapa de RPG GBA** (como conexões/colisão/encontros são representados), não como asset visual.
- **Licença:** **[E]** O código de decompilação em si (os scripts C/build system escritos pela comunidade `pret`) normalmente é licenciado permissivamente pelo projeto (padrão pret: MIT/sem licença restritiva declarada nos dois READMEs lidos). **Os dados do jogo (mapas, tiles, sprites, texto) continuam copyright da Nintendo/Game Freak/Creatures** — a decompilação só reorganiza bytes do ROM em código-fonte legível, não "libera" os assets. **O download/posse do próprio ROM comercial não é coberto por nenhuma licença aberta.**
- **Avaliação A/B/C:** **Nenhuma aplicável como asset.** Valor é **C (estrutura)** apenas no sentido acadêmico de "como um RPG GBA representa mapa/colisão/encontro em dados" — não há nada para importar ou converter em arte.

### 1.3 `github.com/tjtwl/ROM-Asset-Extractor` [E, 2026-11-11, fetch direto]

- **O que faz:** ferramenta C#/.NET (CLI + GUI Windows Forms) que lê um **arquivo `.gba` de Pokémon 3ª geração** (Ruby/Sapphire/Emerald/FireRed/LeafGreen; só as versões **inglesas** têm suporte completo — Sapphire/Emerald/não-inglês ainda não suportados) e exporta **sprites, mapas e tilesets** para uso em Unity. Inclui `MapBuilder` de exemplo em Unity.
- **Formato de saída:** cada mapa gera **dois arquivos JSON** próprios da ferramenta (não é Tiled): um com metadados (tamanho, nome, encontros) e um array JSON de até ~2000KB com um objeto por tile (colisão, "behavior", surf, jump flags inclusos por tile). **Não é `.tmx`/`.tmj`** — é um formato JSON autoral da ferramenta, pensado para o `MapBuilder` do Unity de exemplo, não para abrir no Tiled.
- **Conversão necessária:** **alta** — teria que (a) possuir o ROM `.gba` de um jogo Pokémon (de novo, Pokémon, não Digimon — mesmo problema de conteúdo do item 1.2), (b) escrever um conversor do JSON próprio da ferramenta para o `.tmj.json` esperado pelo GS-003 (mapeando o array "tile por objeto" para `tilelayer.data` + extraindo colisão para a `objectgroup collision`), (c) resolver os tiles/bitmaps exportados em chaves do nosso atlas.
- **Licença:** **[E]** GPL-3.0 para o código da ferramenta (texto completo no repo). O próprio autor (TheJjokerR) é explícito: **não é afiliado à Nintendo**, **extrair ROM de cartuchos que você possui pode ser ilegal no seu país**, e credita explicitamente que "Pokémon, Pokémon character names são marcas da Nintendo". Aviso legal reforça que o uso do extrator **não remove** direitos de terceiros sobre o conteúdo extraído.
- **Avaliação A/B/C:** mesma conclusão do item 1.2 — **sem aplicação direta** (conteúdo é Pokémon, não Digimon); valor é só **C**, como referência técnica de "como separar dados de tile/colisão de um ROM GBA" caso o estúdio um dia decida extrair de um **jogo Digimon** de GBA (ex.: Digimon Battle Spirit/Digimon Racing, se existirem ROMs — não investigado nesta tarefa).

### 1.4 `eeveeexpo.com` — recursos 1797 e 828 [E, 2026-11-11, fetch direto]

Ambos são recursos da comunidade **Pokémon Essentials / RPG Maker XP**, não Tiled/GBA puro.

- **Resource 1797 — "Essentials FRLG"** (TheTinfoilTemplar, v1.1 fev/2026): **221 mapas recriados tile-a-tile à mão** (não é rip automático; é recriação manual usando o jogo original como referência) cobrindo FireRed/LeafGreen até o Indigo Plateau (sem Sevii Islands ainda). Inclui conexões, transições de área, itens no overworld (incl. escondidos), **tabelas de encontro completas**, eventos majoritariamente fiéis, times de treinador reais, trilha sonora (ENLS). **Formato: projeto RPG Maker XP (`.rxdata`) + tilesets PNG no padrão Pokémon Essentials** — não é Tiled/JSON. **Licença:** uso livre dentro do ecossistema Essentials; crédito **não obrigatório** ao autor TheTinfoilTemplar (mas obrigatório à equipe Essentials/Maruno/Poccil e, se usar a trilha, à ENLS). **Risco:** é uma recriação de Pokémon (não Digimon) — zero aproveitamento de conteúdo, só de técnica ("como estruturar 221 mapas conectados num jogo-template").
- **Resource 828 — "Remastered Kanto and Johto Overworld and Caves Map Pack"** (autor não nomeado no texto extraído, créditos a JohtoBlaziken/"The First Journey", Earthescape/Orbitender, AenaonDusky): **140+ mapas** de Kanto+Johto remasterizados com **tiles próprios estilo HGSS (Gen 4) modificados**, autotiles básicos de água/grama, passabilidade básica, mapas de cavernas (quase todos exceto Mt. Silver/Cerulean Cave/Victory Road), conteúdo beta cortado (ex. cidade/rota cortada perto de Vermilion). **Formato: projeto RPG Maker XP** (tilesets em "Tilesets 21-24" do banco de dados RMXP) — de novo, não é Tiled. **Licença:** **crédito obrigatório** a 3 pessoas/equipes nomeadas + aos créditos de tileset (não especificados no texto extraído — precisaria abrir o `.zip` para ver o arquivo de créditos de tileset). **Risco:** Kanto/Johto (Pokémon), não Digimon.
- **Conversão para GS-003 (ambos):** **altíssima e de baixo retorno.** RPG Maker XP usa tilesets em grade fixa 16×16 com sistema de autotile próprio (não Wang-tile como Tiled); converter para `.tmj.json` exigiria reescrever a lógica de autotile inteira, e o conteúdo visual continuaria sendo Pokémon/HGSS, não Digimon — teria que ser **substituído**, não só convertido, para servir ao jogo. Valor real é **C**: ver como um jogo de referência (FRLG/HGSS) organiza 140-220 mapas conectados com variação dia/tarde/noite, cavernas, beta content — útil para **planejamento de escopo** do nosso próprio mundo, não para assets.

### 1.5 `eeveeexpo.com` — "prefix 9" [H/não resolvido, 2026-11-11]

Não consegui identificar com confiança o que "prefix 9" designa no fórum. Testado sem sucesso: `/resources/categories/9/` (resolveu para a categoria **"Game Dev & Design"**, tutoriais gerais — não mapas), `/resources/?prefix_id=9` (não filtrou, devolveu a home de recursos sem aplicar filtro perceptível em `web_fetch` sem JS/login), `/find-resources/?prefixes[0]=9` (404) e `/resources/categories/2/` (404, categoria não existe). O fórum roda em XenForo com filtros de "prefix" que parecem depender de JavaScript/sessão para renderizar a lista filtrada — `web_fetch` não executa JS, então não há como confirmar a listagem exata sem login/navegador real.

**O que encontrei de relevante por navegação manual, para não deixar a seção vazia [E, 2026-11-11]:** a categoria/recurso **`/resources/15/` ("Tiles – Ready to use Tilesets", por Aki)** é o resource de tileset mais citado na home de Resources: compila tiles de terceiros (Aigue--marine/LotusKing, Kaliser, JesusCarrasco/Thegreatblaid, WilsonScarloxy, SailorVicious/Heavy-Metal-Lover, Magiscarf, Kyle-Dove, UltimoSpriter) em sets prontos para Essentials (interior/exterior, estilo gen 4 "overworld"), 16×16, **formato RPG Maker XP** (não Tiled). Créditos obrigatórios **por artista individual** (listados explicitamente na página — o compilador Aki não quer crédito pela compilação, só os artistas originais). Mesmo problema de formato (RMXP) e de tema (nenhum é Digimon-específico) dos itens 1.4.

**Recomendação:** se o fundador quiser aproveitar algo específico do eeveeexpo.com por prefixo, pedir o link direto do recurso (a navegação por prefixo nesse fórum exige JS/login) — não vale gastar mais tempo de pesquisa automatizada nisso.

### 1.6 `mapeditor.org` (Tiled) [E, 2026-11-11, fetch direto]

- **O que é:** o editor **Tiled** em si — gratuito, open source, suporta mapas ortogonais/isométricos/hexagonais, pintura de terreno por regra, múltiplas camadas. É exatamente o formato que o `.tmj.json` do GS-003 já usa (subconjunto).
- **Relevância direta:** **nenhuma fonte de mapa pronto** — é a ferramenta de autoria, não um banco de assets. O valor é **confirmar que o formato nativo do Tiled (`.tmj`/`.tmx`) é o padrão da indústria** usado também pelo projeto `kanto` (item 1.1) e por engines como PixiJS/@pixi/tilemap, Godot, Phaser. Isso valida a escolha de formato do GS-003 (compatibilidade com um ecossistema maduro de ferramentas), mesmo que o motor atual só leia um subconjunto customizado do formato.
- **Licença:** free/open source (GPL, conforme o próprio site). Sem custo de uso do editor.
- **Avaliação A/B/C:** não aplicável a "importar conteúdo" — é **a ferramenta** que poderia ser usada para desenhar os mapas do GS-003 à mão (hoje o estúdio usa o pipeline próprio "Map Factory" gerando `.tmj.json` programaticamente; Tiled poderia ser um editor visual complementar para ajustes manuais finos, se algum dia o fluxo precisar disso). Não investigado se o time já usa Tiled Desktop para revisão — fora do escopo desta tarefa.

### 1.7 Folhas de background de mapa do Spriters Resource — 76 arquivos já catalogados [E, 2026-11-10, já no manifesto `research/sprite-recovery/map_assets_catalog.json`]

Esta tarefa **não refez** o levantamento (ele já existe, gerado em 2026-11-10 pela tarefa GS-013) — só reconfere o que já está catalogado e classifica o uso possível como **mapa/tileset Digimon**.

**Resumo [E, do arquivo `map_assets_catalog.json`]:** 76 arquivos PNG, 41,4 MB total, de 10 jogos Digimon (Digimon World: 33 arquivos — o maior volume; Digimon World 2: 20; Digimon World DS: 7; Vital Bracelet BE: 5; Digimon World: Digital Card Battle: 4; Digimon World 3: 3; Digimon Battle/DigiBat 1: 1; Digimon World Dawn/Dusk: 1; Digital Monster D-Project: 1). Todos **já estão no disco** em `assets/GAME-ASSETS/10-source-files/spriters-resource/` — nenhum novo download foi feito agora.

**O que são tecnicamente:** **screenshots/renders de cena completa pré-compostos** (fundo de ambiente de PlayStation/NDS/WonderSwan — ex. "Native-Forest-Day" de Digimon World tem 4,19 MB, claramente uma imagem de fundo pré-renderizada de PS1, não um tileset modular), **não tilesets recortados em peças reutilizáveis**. Não há grid de tile explícito nem camadas separadas (chão/colisão/decoração) — é a imagem de fundo final do jogo original, em muitos casos com variantes dia/tarde/noite (Amida Forest, File City, Native Forest, Toy Town têm as 3 variantes cada).

**Classificação de uso como mapa/tileset Digimon [H, avaliação desta tarefa]:**
- **Não servem como asset final do jogo** — regra já registrada no próprio manifesto (`rightsLayer.basis`, GS-013): "NÃO usar mapas completos de jogos protegidos como asset final do jogo". Isso vale mesmo com a decisão de hoje sobre Digimon "iguais aos oficiais" nas **criaturas** — a restrição aqui é sobre **cenário completo pré-renderizado de outro jogo**, uma categoria diferente (risco de parecer republicação direta de telas de PS1/NDS, não just "a mesma espécie de monstro").
- **Servem como referência de composição e paleta** (ex.: como Native Forest/Amida Forest organizam copas grandes, densidade de vegetação, paleta de dia/tarde/noite — material de moodboard, não de import direto), e os 2 World Map (`World-Map-Custom` de Digimon World, `World-Map` de Digital Monster D-Project) são úteis como **referência de layout de mapa-múndi estilizado** (como organizar biomas/ícones de localização num mapa geral), não para recorte de tileset.
- **Elementos pequenos extraíveis de forma transformada** (regra já existente): uma árvore, pedra ou objeto isolado poderia, em teoria, ser recortado e **redesenhado/transformado** manualmente a partir dessas imagens — mas isso é trabalho de arte caso a caso, não uma "importação de mapa", e não foi feito nesta tarefa (fora de escopo: esta tarefa é de pesquisa/catalogação, não de produção de arte).

**Conversão para `.tmj.json`:** **não aplicável** — não há tile a extrair automaticamente de um screenshot monolítico sem recorte manual; não há dado de colisão/conexão/encontro embutido (são só pixels de imagem, sem metadados de jogo).

---

## 2. Comparação A / B / C — resumo por fonte

| Fonte | A — Importar mapas direto | B — Converter tilesets | C — Usar só estrutura | Conteúdo é Digimon? |
|---|---|---|---|---|
| `blixxurd/kanto` | ❌ Não roda no nosso motor sem reescrever o resolvedor de `key`/`gid` | ⚠️ Tecnicamente possível (extrair PNG do atlas + remapear), mas **conteúdo é Kanto** — sem sentido final | ✅ **Melhor uso**: lógica de stitching, warps, field effects, pipeline de extração como referência de arquitetura | **Não** (Pokémon) |
| `pret/pokeemerald` / `pret/pokefirered` | ❌ Nem é formato de mapa usável fora do build do próprio jogo | ❌ Exigiria reconstruir o próprio `kanto`/extrator antes | ✅ Só como estudo de "como um RPG GBA representa mapa/colisão/encontro" | **Não** (Pokémon) |
| `tjtwl/ROM-Asset-Extractor` | ❌ Formato JSON próprio, não Tiled | ⚠️ Possível, mas exige ROM + escrever conversor próprio | ✅ Só como referência técnica de extração | **Não** (Pokémon) |
| eeveeexpo #1797 / #828 / "Tiles" (#15) | ❌ Projeto RPG Maker XP, não Tiled | ❌ Autotile RMXP ≠ Wang-tile Tiled; conversão de baixo retorno | ✅ Só como referência de escopo (quantos mapas, como organizar variação dia/noite) | **Não** (Pokémon) |
| mapeditor.org (Tiled) | N/A (é ferramenta, não fonte) | N/A | ✅ Valida a escolha de formato `.tmj`; possível editor visual complementar | N/A |
| 76 folhas Spriters Resource (Digimon) | ❌ Screenshots monolíticos, sem grid/metadado de tile | ❌ Sem estrutura de tile para converter | ✅ Referência de composição/paleta; elementos pontuais extraíveis manualmente (transformados) | **Sim** (Digimon) |

---

## 3. Recomendação técnica

**[H, síntese desta tarefa]** Nenhuma das fontes pret/kanto/eeveeexpo/tjtwl resolve o problema de **mapa Digimon pronto** — todas são ecossistema **Pokémon** (GBA/RMXP), e mesmo as que têm formato tecnicamente compatível (Tiled JSON, via `kanto`) exigiriam reescrever o resolvedor de tile do nosso motor (`key`/`solid` por propriedade customizada vs. `gid` apontando para atlas único) para rodar qualquer coisa delas — trabalho de engenharia sem ganho de conteúdo, já que o resultado final continuaria visualmente/tematicamente errado (Kanto/Johto, não o mundo Digimon).

O valor real dessas 5 fontes é **estrutural/arquitetural (categoria C)**: `blixxurd/kanto` é a referência mais rica de como representar overworld stitchado + warps + field effects num motor web moderno (PixiJS), e os pacotes RPG Maker XP (#1797, #828, #15) mostram como organizar 140-220 mapas conectados com variação dia/noite — ambos úteis para **planejamento**, não para asset.

Para **conteúdo Digimon real**, a fonte certa continua sendo o próprio manifesto já catalogado (76 folhas do Spriters Resource, `research/sprite-recovery/map_assets_catalog.json`) — mas estritamente como **referência de composição/paleta** (regra "não usar mapa completo de jogo protegido como asset final" já em vigor desde GS-013), não como tileset recortável. **O caminho de produção de mapa do GS-003 continua sendo o pipeline próprio "Map Factory"** (`art/map-factory/*`, já em uso, já gerando `.tmj.json` no formato exato que o motor espera) — nenhuma das 6 fontes avaliadas hoje muda essa conclusão nem oferece atalho de menor esforço.

**Única ação de baixo custo que vale considerar:** adotar o **editor Tiled Desktop** (gratuito) como ferramenta de *revisão/ajuste manual* dos `.tmj.json` já gerados pelo Map Factory — já que o formato é compatível na leitura/visualização básica (ainda que as propriedades customizadas `key`/`solid` seriam editadas como texto, não via paleta visual de tileset, a menos que se gere também um PNG de atlas único por mapa para visualização no Tiled). Isso não foi testado nesta tarefa (ficaria fora do escopo "custo zero, só pesquisa"); é uma recomendação para validação futura, não uma conclusão fechada.

---

## 4. Limitações desta pesquisa [E, 2026-11-11]

- `web_search` indisponível durante toda a sessão ("disabled or no provider available") — toda coleta via `web_fetch` direto.
- "eeveeexpo.com prefix 9" não foi resolvido com confiança (seção 1.5) — o fórum depende de JS/login para filtros de prefixo.
- `craftpix.net` bloqueou por Cloudflare ("Just a moment...") nas tentativas desta tarefa, consistente com o bloqueio já registrado em `research/ART_BUDGET_OPTIONS.md` (2026-11-09).
- Não abri nenhum `.zip`/download de nenhuma das fontes (regra de custo zero / nenhum download executado) — a avaliação de formato/licença dos recursos eeveeexpo.com é baseada no texto da página do recurso, não no conteúdo real do arquivo.
- Não testei o editor Tiled Desktop contra um `.tmj.json` real do GS-003 — a recomendação da seção 3 é teórica, baseada em leitura do formato, não em teste prático.
