# 02 · Passo zero: arte pronta do Hawkmon, artistas e permissões (NADA FOI ENVIADO)

**Digital Odyssey (GS-003) · Comando 13, F8A · game-research · 2026-11-14**
Nenhuma mensagem, nota, comentário ou voto foi feito. Nenhum login. O envio é decisão do Vitor (fundador), pela conta dele.

## 0. Conclusão do passo zero

- **[E] Não existe sprite pronto do Hawkmon no formato do jogo** (top-down, 4 direções puras, andar + idle, ~35–45 px). Nenhuma fonte oficial nem de fã tem isso.
- O mais perto: **oficial** DS/Dawn-Dusk (3/4 frente e 3/4 costas, 3 quadros, ~29 px, cor) e Digital Partner (S/W/N, 2 quadros, mono). Uso: **só estudo interno** (D12), nunca no jogo.
- **Fã**: tudo é vista lateral de luta/plataforma ou pose única. Serve como referência de movimento, não como asset.
- **Licenças [E]:** de 22 obras de fã avaliadas, só 4 declaram Creative Commons, e só **1 permite derivação**: Fenrimon (**CC BY-NC 3.0**). As outras 3 CC são NC-SA de espécie fictícia (KyamosTheStubborn, "EXE") ou NC-ND de miçanga (PixelenaMV). O resto é "todos os direitos reservados" (padrão do DeviantArt).
- Mesmo com permissão, a autorização do artista cobre a **arte dele**, não a marca Digimon. Uso no jogo continua sujeito à decisão de IP do fundador (sem monetização, publicação só com aprovação).

**Como as licenças foram lidas:** `backend.deviantart.com/rss.xml?q=hawkmon+sprite` (59 itens, 23:32) — a licença CC aparece como link `creativecommons.org/licenses/...` no item; e `backend.deviantart.com/oembed` (autor, data, tamanho, copyright). Sem link CC = tratado como "todos os direitos reservados" [E da ausência; a página de cada obra não foi aberta em todos os casos].

## 1. Candidatos (oficiais)

| # | Fonte | Responsável | Estilo | Resolução | Direções | Quadros | Qualidade [H] | Licença | Pedir? |
|---|---|---|---|---|---|---|---|---|---|
| O1 | Spriters Resource 40896 (Dawn/Dusk) | Bandai Namco; ripper Shoda ("No credit needed") | DS, cor, contorno escuro | folha 402×163; mini 16×29 | 3/4 frente, 3/4 costas (+ espelho), frente | andar 3, salto 1, batalha 5 | 8/10 como referência de campo | oficial — uso interno | Não se aplica |
| O2 | Spriters Resource 48517 (World DS) | Bandai; Dazz / Mighty Jetters ("Credit is not required") | idem | folha 355×236; células 32×32 | idem | idem | 8/10 | oficial — uso interno | Não se aplica |
| O3 | Spriters Resource 483619 (Digital Partner) | Bandai / Tom Create | WonderSwan mono 4 tons | 480×424; poses 48×48; minis 16×32 | S, W, N (+ lado e costas a 48 px) | 44 poses; andar 2 por vista | 9/10 para emoções; 6/10 para campo | oficial — uso interno | Não se aplica |
| O4 | Spriters Resource 64825 (Medley) | Bandai | WSC cor, paleta curta | 431×477 | batalha + minis S/lado | ~6 do Hawkmon | 5/10 | oficial — uso interno | Não se aplica |
| O5 | GitHub dannyphang/digimon-up-sprites `baked/hawkmon` | Bandai Namco (Digimon UP, 2026); repo de fã | pixel art oficial moderna | quadros pequenos (~4,4 KB) | 1 (3/4) | walking 13; idle, attack, faint | 8/10 [H] | **repo sem licença**; arte oficial | Não; **decisão do fundador** se entra como referência interna (mesma pendência do C9 F1) |

## 2. Candidatos (fã)

Ordenados por utilidade para o Digital Odyssey.

| # | Artista | URL original | Estilo | Resolução | Direções | Quadros | Qualidade [H] | Licença [E] | Precisa autorização? |
|---|---|---|---|---|---|---|---|---|---|
| F1 | **Neroesaurus** (2022) | https://www.deviantart.com/neroesaurus/art/Hawkmon-Sprites-920196814 | lateral de luta, chibi, contorno preto | folha 351×530; sprite ~24–28 px | 1 (lado) | idle 6, walking 8, **flying 4**, attack1 7, attack2 8, hit, win, lose | 7/10 | todos os direitos reservados; descrição: "Base sprite by twitter.com/paburo1. Give Credits if used" | **Sim, de dois autores**: Neroesaurus e paburo1 (base) |
| F2 | **Neoweegee** (2015) | https://www.deviantart.com/neoweegee/art/Hawkmon-Spritesheet-532513259 | plataforma (SMB2/Smash), com e sem contorno | 518×1544 | 1 (lado) + frente/costas no "lose" | dezenas: stand 8, walk 6, hover 3, glide 2, land 2, **Feather Throw, Feather Boomerang**, hit, digievolve | 7/10 (estilo distante do nosso) | todos os direitos reservados; "Digimon (C) Bandai, not me"; rodapé pede crédito [H, texto pequeno] | Sim |
| F3 | **Fenrimon** (2023) | https://www.deviantart.com/fenrimon/art/Digimon-Pixels%3A-Miyako-and-Hawkmon-972664333 | pixel art moderna, contorno, sombreado suave; humano + Hawkmon lado a lado | 600×600 (ampliado) | 1 (3/4) | 1 pose | 8/10 | **CC BY-NC 3.0** (permite adaptar sem fins comerciais, com crédito) | Pela licença, não para estudo; **pedir mesmo assim** para uso no jogo (boa prática + IP) |
| F4 | Sellionrb (2019) | https://www.deviantart.com/sellionrb/art/Hawkmon-796118075 | DS-like, pose única de batalha | 72×96 | 1 | 1 | 7/10 | todos os direitos reservados; "Please don't use without permission and without giving credits!" | Sim |
| F5 | maximus237 (2019) | https://www.deviantart.com/maximus237/art/hawkmon-pixel-art-789160629 | pose única com grade | 850×543 (sprite ~25×30) | 1 | 1 | 6/10 | todos os direitos reservados | Sim (o fundador **já pediu** ao maximus237 sobre Agumon/Gomamon: incluir o Hawkmon no mesmo pedido, sem abrir outra conversa) |
| F6 | TailsPrower13 (2011) | https://www.deviantart.com/tailsprower13/art/Hawkmon-BS-Sprites-214988230 | estilo Digimon Battle Spirit (feito porque o jogo não tem Hawkmon) | 277×274 | 1 (lado) | poucos | 5/10 [H, não visto ampliado] | "Sprites (c) me" | Baixa prioridade |
| F7 | Opdisk (2011) | https://www.deviantart.com/opdisk/art/Hawkmon-269822397 | idem, "some sprites by TailsPrower13" | 329×190 | 1 | — | — | "Give credit if used" (sem licença formal) | Não vale (derivado do F6) |
| F8 | FelipeTop (2021) | https://www.deviantart.com/felipetop/art/044-Hawkmon-873833860 | igual à pose de batalha do DW DS | 186×141 | 1 | 1 | — | — | **Não vale**: parece extração do DW DS [H] |
| F9 | whitewolf1996 (2010) | https://www.deviantart.com/whitewolf1996/art/Hawkmon-Sprite-177713527 | GIF | 150×150 | — | — | — | — | Não aberto |
| — | vLocxoay99 (2020) | https://www.deviantart.com/vlocxoay99/art/Hawkmon-839477546 | vetor, não pixel art | 918×870 | — | — | — | — | Não vale |
| — | GuilTronPrime (2020) | https://www.deviantart.com/guiltronprime/art/REBIRTH-SERIES-Hawkmon-DL-850037281 | modelo 3D para download | — | — | — | — | — | Não vale (3D; origem do modelo desconhecida) |
| — | DigimonGif (2013) | https://www.deviantart.com/digimongif/art/Hawkmon-384738295 | GIF 90×80 | — | — | — | — | — | Não vale (provável extração) |
| — | PixelenaMV (2013) | https://www.deviantart.com/pixelenamv/art/Digimon-02%3A-Hawkmon-413724436 | **miçanga** (perler) baseada no TailsPrower13 | — | — | — | — | CC BY-NC-ND 3.0 | Não vale |
| — | KyamosTheStubborn | Hawkmon EXE / Aquilamon EXE | espécie de fã | — | — | — | — | CC BY-NC-SA 3.0 | **Não usar** (espécie fictícia) |
| — | Wooded-Wolf (2011–12) | "Hawkmon Variant / Armor / Ultimate / Mega" | recolorações e formas inventadas | — | — | — | — | — | **Não usar** (o próprio autor diz que tirou o topete; não é o Hawkmon oficial) |
| — | Pinterest (pins) | ex.: https://www.pinterest.com/pin/digimon-02-hawkmon-pixel-art--78320481015331502/ | miçanga / pin sem fonte | — | — | — | — | — | Não vale. Igual ao achado da fase 10: o Pinterest só leva a miçanga e a obras já listadas acima |
| — | Reddit u/? "Hawkmon in VB form" | https://www.reddit.com/r/digimon/comments/mc411f/ | vpet 16 px de fã | — | — | — | — | — | Não vale (escala de vpet) |

**Fontes procuradas e o que deram:** DeviantArt (RSS 59 itens + 7 páginas oEmbed); DuckDuckGo (6 buscas: DeviantArt, pixel art/walk, Pinterest, Reddit; depois limite de taxa); Bing (inútil, devolveu Facebook); GitHub (Digimon UP); Spriters Resource e Fandom **bloqueados por Cloudflare, não contornados**; ArtStation e Twitter/X **não pesquisados** (o DDG estava limitado; sem login). Karasupx (ArtStation, único top-down 4/8 direções achado antes, para o Agumon) **já tem pedido do fundador** de 2026-11-14 06:18: [H] vale perguntar na mesma conversa se ele faria o Hawkmon.

## 3. Lista de quem pedir (proposta; o Vitor decide e envia)

| Prioridade | Quem | O quê | Por quê | Canal | Observação |
|---|---|---|---|---|---|
| **1** | **Karasupx** | Encomenda ou permissão: Hawkmon top-down 4/8 direções, idle e walk | É o único artista conhecido no formato exato do jogo | Mesma conversa do Reddit (u/Ok-Key-2076) já aberta pelo fundador | Encomenda pode envolver pagamento: **fora da autorização atual** (nada de contratar sem o fundador) |
| **2** | **Fenrimon** | (a) estudo; (b) adaptar a pose do Hawkmon e usar a relação de escala humano×Hawkmon | Única obra CC BY-NC; acabamento próximo do GBA Plus [H] | Nota no DeviantArt | A CC BY-NC já permite (a) e (b) sem fins comerciais com crédito. Pedir confirma, e protege contra mudança de licença |
| **3** | **Neroesaurus + paburo1** | (a) estudo do ciclo lateral e do voo de 4 quadros | Separa andar de voo num corpo chibi | Nota no DeviantArt (Neroesaurus); Twitter/X @paburo1 | Precisa dos **dois**: a base é do paburo1 |
| 4 | Neoweegee | (a) estudo do "Feather Throw / Feather Boomerang" | Única animação de fã do topete virando projétil | Nota no DeviantArt | Estilo de plataforma, longe do nosso |
| 4 | Sellionrb | (a) estudo | DS-like de boa qualidade | Nota no DeviantArt | Ele pede permissão e crédito explicitamente |
| — | maximus237 | incluir o Hawkmon no pedido **já feito** | — | conversa existente | Não abrir conversa nova |

**Não pedir:** FelipeTop, DigimonGif, Opdisk (derivados ou extrações); KyamosTheStubborn e Wooded-Wolf (espécie ou forma inventada); PixelenaMV (miçanga); vLocxoay99 (vetor); GuilTronPrime (3D).

## 4. Texto sugerido

Usar o modelo já aprovado em `etapa6-lab/fase12-comando9/f1/PEDIDOS_PERMISSAO.md` (inglês e português), trocando `<OBRA>` e `<LINK>`. Variações:

- **Fenrimon:** "Your piece is CC BY-NC, so we could already adapt it with credit, but we'd rather ask: is it ok if we use it as a scale and style reference for our own Hawkmon sprite, and credit you?"
- **Neroesaurus:** "Your description credits paburo1 for the base sprite, so we'll ask them too. Is it ok for you if we study the walking and flying cycles for our own sprite?"
- **Karasupx (na conversa existente):** "Would you consider a Hawkmon in the same top-down 4/8-direction format? We'd need your terms first; we can't commit to a paid commission without the project owner's approval."

## 5. Registro

Quando houver resposta: o game-studio registra no `PROJECT_LOG.md` (data, artista, obra, o que foi autorizado, link da resposta). **Arte de fã só entra no jogo com resposta positiva registrada** e com a decisão de IP do fundador.
