# Catálogo de referências de sprites: Agumon, Greymon, Gomamon, Ikkakumon (+ Koromon, Bukamon)

**Digital Odyssey (GS-003) · Comando 9, Frente 1 · game-research · 2026-11-14**
Passo 0 do Sprite Production Standard 1.1: antes de produzir cada Digimon, procurar pixel art pronta, usar o que tiver licença e pedir permissão para o resto.

## Como ler

- **[E]** = evidência lida na fonte, na data indicada. **[H]** = hipótese ou estimativa minha.
- **Tipo:** `oficial` = sprite extraído de jogo da Bandai/Bandai Namco (o ripper não é o autor). `fã` = arte autoral de fã. `fã-derivado?` = publicado por fã, mas com cara de extração ou edição de sprite oficial ([H]; origem não confirmada).
- **Licença:**
  - `oficial-uso interno`: só estudo e entrada no PixelLab (D12). Não redistribuir, não colocar no jogo.
  - `pedir`: arte de fã sem licença aberta (no DeviantArt o padrão é "todos os direitos reservados"). Serve só como link de estudo.
  - `CC …`: licença Creative Commons declarada na página (lida pelo link `creativecommons.org/licenses/...` da própria página).
  - Nenhuma arte de fã deste catálogo tem licença que permita uso **derivado** sem pedir: as CC achadas são NC-ND ou NC-SA. Uso no jogo exige permissão escrita, e mesmo assim depende da decisão de IP do fundador.
- **Imagens locais:** só as oficiais estão em `imagens/oficiais/` (ver `imagens/oficiais/FONTE.txt`). Arte de fã ficou só como link.
- **Resolução:** o tamanho da folha é [E], lido na ficha do asset. O tamanho por sprite é [H], estimado olhando a folha.

## Como foi feito (e limites)

1. **The Spriters Resource:** o site estava atrás de uma verificação "Confirme que é humano" do Cloudflare em 2026-11-14 e a sessão antiga do chrome-sharp devolvia 403. **Não cliquei no desafio**, porque isso seria contornar proteção contra bots. As páginas e imagens vieram das cópias do **Internet Archive (Wayback)**, abertas no próprio chrome-sharp. O Digimon Tamers Medley 64816 (Gomamon/Ikkakumon) não tinha cópia arquivada e ficou só como link.
2. **DeviantArt:** 24 buscas por espécie e formato ("sprite", "pixel", "overworld", "rpg maker" etc.). Li ~35 páginas de obra (data, licença, imagem) e olhei as imagens.
3. **Pinterest:** 8 buscas. Mais uma vez o resultado foi quase todo padrão de miçanga (HazloconBeads, kandipatterns) e pin sem fonte, o que confirma `fase10-fontes-sprites/PESQUISA_PINTEREST_FONTES_2026-11-14.md`. Só levou a pistas já cobertas (Spriters Resource, DW Championship) e a duas imagens de "vpet colorizado" sem autor rastreável.
4. **Reddit** (só leitura, sem login novo, sem postar): 5 buscas. Achado principal: **Digimon Up** (jogo oficial de 2026, pixel art) e o repositório comunitário com os sprites extraídos.
5. **ArtStation:** não refiz a busca. O Karasupx (a única fonte top-down 4/8 direções achada antes) já tem pedido enviado pelo fundador.

---

## Agumon

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir permissão? (canal) |
|---|---|---|---|---|---|---|---|---|
| A1 | https://www.spriters-resource.com/playstation/digiworld3/asset/13315/ | Bandai (DW3, PS1, 2002). Ripper: Ragey | oficial | **8 direções**: parado, andar, correr, ações de campo (~100 quadros) | folha 539×183 [E]; sprite ~24×28 [H] | **Melhor referência de movimento em mapa**: ciclo de passo, viradas diagonais, leitura do volume em escala chibi | oficial-uso interno | Não se aplica. Copiado em `imagens/oficiais/dw3/` |
| A2 | https://www.spriters-resource.com/ds_dsi/digimonworldds2/asset/40907/ | Bandai Namco (DW Dawn/Dusk, DS). Ripper: Shoda ("No credit needed") | oficial | batalha (idle, ataque, dano) + **mini de campo frente/lado/costas** | folha 344×149 [E]; mini ~16×20 [H] | Mini de campo em cor no estilo DS/GBA, que é o formato mais perto do nosso; contorno e paleta | oficial-uso interno | Não. Copiado em `imagens/oficiais/ds_dawndusk/` |
| A3 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/121215/ | Bandai / Tom Create (WonderSwan). Uploader: Pingus!, MetallicK2MK | oficial (monocromático) | ~40 poses de **emoção** (alegria, choro, raiva, sono, susto, comer) + mini de andar em 4 direções | folha 480×440 [E]; pose ~32×32 [H] | **Catálogo de emoções** da espécie, mais legível que qualquer arte de fã achada | oficial-uso interno | Não. Copiado |
| A4 | https://www.spriters-resource.com/wonderswan_wsc/digimonmedley/asset/64806/ | Bandai (Digimon Medley, WSC). Ripper: digistarDBZ | oficial | batalha em cor + retratos; inclui Greymon | folha 460×453 [E] | Pose de ataque e expressão em cor, com paleta curta (WSC) | oficial-uso interno | Não. Copiado em `imagens/oficiais/wsc_medley/` |
| A5 | https://github.com/dannyphang/digimon-up-sprites (pasta `baked/agumon`, também `agumon_adventure`) | Bandai Namco (**Digimon Up**, mobile, 2026). Repositório de u/Necessary_Way_6539 / dannyphang | oficial (extraído por fã) | idle, walking, attack, faint (16 fps), **1 direção** (3/4 frente) | quadros pequenos (~3–4 KB) [E]; sprite ~40×40 [H] | Pixel art **oficial moderna**, padrão de acabamento atual da franquia; ciclo de passo do quadrúpede/bípede | oficial-uso interno; **repo sem licença** e o próprio README diz que a arte é da Bandai Namco | Não se aplica. **Só link** (não baixado; ver "Riscos") |
| A6 | https://www.spriters-resource.com/ds_dsi/dwchampionship/asset/35037/ | Bandai Namco (DW Championship, DS). Ripper: Chronfan8 (pede crédito) | oficial | batalha: idle, ataque, dano; 1 direção | folha 284×649 [E] | Já baixado em `fase10-fontes-sprites/dwchampionship/` | oficial-uso interno | Não |
| A7 | https://www.deviantart.com/midnitez-remix/art/Digimon-World-MV-Agumon-Sprites-646980989 | Midnitez-REMIX | fã | **4 direções × 3 quadros** (formato RPG Maker MV) + variante | folha 900×345 [E]; ~48×48 por quadro [H] | O mais perto do nosso formato entre os fãs: chibi top-down andando nas 4 direções | **CC BY-NC-ND 3.0** [E] (permite compartilhar com crédito; **proíbe derivação**) | Sim: nota no DeviantArt |
| A8 | https://www.deviantart.com/aniki0001/art/Agumon-sprite-650660311 | aniki0001 | fã-derivado? | 4 direções × 3 quadros (RPG) | folha 1280×953 [E] | Ciclo de 4 direções; a cara lembra o mini oficial do DW DS [H] | pedir (sem licença) | Talvez: nota no DeviantArt. Antes, perguntar a origem |
| A9 | https://www.deviantart.com/eston12/art/Agumon-Sprite-Sheet-305360352 | eston12 (2012) | fã-derivado? | batalha + minis de campo em várias direções | folha 1280×953 [E] | Parece extração do **Digimon World DS** (2006) [H]; vale achar a fonte oficial em vez de usar esta | pedir / provável oficial | Não vale pedir: provável extração oficial |
| A10 | https://www.deviantart.com/edenpixel/art/Agumon-Pixel-Art-1253924884 | EdenPixel (2025; Twitter "Eden Pixel") | fã | pose única, grande | folha 900×359 [E]; sprite ~200 px [H] | Anatomia fiel ao Reference Book (garras, ventre, cauda) em pixel de alta qualidade | pedir | Opcional, só se quisermos o estilo |
| A11 | https://www.deviantart.com/maximus237/art/agumon-pixel-art-789094641 | maximus237 | fã | pose única, ~32 px | — | Leitura em resolução mínima | pedir | **Já pedido pelo fundador** (não duplicar) |
| A12 | Karasupx: https://www.artstation.com/karasupx · u/Ok-Key-2076 | Karasupx | fã | top-down 4/8 direções, idle e walk (Agumon, linha Agumon→Greymon) | — | Formato exato do jogo (pesquisa da fase 10) | pedir | **Pedido enviado em 2026-11-14 06:18** pelo fundador (Reddit) |
| A13 | https://www.deviantart.com/lorisc93/art/Agumon-%282006%29-Animated-Sprites-1090021610 | LorisC93 | fã-derivado? | animação de render 3D (Digimon Masters Online, segundo a descrição) [E] | 1280×720 [E] | Pouco útil: render 3D, não pixel art | pedir / provável oficial | Não vale |
| A14 | https://www.deviantart.com/baronfangerus/art/Agumon---Sprite-Animation-822613890 | BaronFangerus | fã-derivado? | animação 1-bit estilo vpet | 800×835 [E] | Só leitura de silhueta mínima | pedir | Não vale |

## Greymon

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir permissão? (canal) |
|---|---|---|---|---|---|---|---|---|
| G1 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/483663/ | Bandai / Tom Create (WonderSwan). Uploader: MetallicK2MK | oficial (mono) | Greymon em **frente, 3/4, perfil, costas** (~10 poses) + MetalGreymon | folha 688×216 [E]; pose ~48×48 [H] | **Rotação completa de um bípede grande**: crânio-capacete, cauda e braços em cada ângulo | oficial-uso interno | Não. Copiado |
| G2 | https://github.com/dannyphang/digimon-up-sprites (`baked/greymon`, também `metalgreymon`) | Bandai Namco (Digimon Up, 2026) | oficial (extraído) | idle, walking, attack (com efeito de fogo), faint; 1 direção | ~3–4 KB/quadro [E] | Ataque com efeito de chama, balanço de peso do corpo grande | oficial-uso interno; repo sem licença | Só link |
| G3 | https://www.spriters-resource.com/wonderswan_wsc/digimonmedley/asset/64806/ | Bandai (Medley, WSC) | oficial | batalha em cor (3 poses) | folha 460×453 [E] | Pose de ataque em cor com paleta curta | oficial-uso interno | Não. Copiado (mesma folha do A4) |
| G4 | https://www.spriters-resource.com/ds_dsi/dwchampionship/asset/35038/ | Bandai Namco (DW Championship). Ripper: Chronfan8 | oficial | batalha; 1 direção | folha 363×1147 [E] | Já baixado na fase 10 | oficial-uso interno | Não |
| G5 | https://www.deviantart.com/eston12/art/Greymon-Sprite-SHeet-305360485 | eston12 (2012) | fã-derivado? | batalha (5 poses) + **minis de campo em frente/lado/costas** | folha 1920×2989 [E] | Único mini de Greymon em várias direções achado; parece extração do **Digimon World DS** [H] | pedir / provável oficial | Não pedir. **Ação:** achar a página oficial do DW DS no Spriters Resource quando o site liberar |
| G6 | https://www.deviantart.com/jeffnunes007/art/Greymon-%28Bw-animated-sprite%29-803344363 | JeffNunes007 | fã-derivado? | idle de batalha animado | 1280×953 [E] | Respiração de idle num corpo grande | pedir | Baixa prioridade |
| G7 | https://www.deviantart.com/edenpixel/art/Greymon-Pixel-Art-1254396986 | EdenPixel (2025) | fã | pose única, grande, com fogo | 1280×1280 [E] | Anatomia fiel e listras azuis bem resolvidas | pedir | Opcional |
| G8 | https://www.deviantart.com/hamurand22/art/Zeke-Greymon-Sprite-863111193 (e outros Greymon da galeria) | hamurand22 | fã | sprites laterais | — | Variantes de Greymon, não o Greymon base | pedir | **Já pedido pelo fundador** |
| — | Karasupx (A12): linha Agumon→Greymon top-down | Karasupx | fã | 4/8 direções | — | Formato exato | pedir | Pedido já enviado |

## Gomamon (quadrúpede)

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir permissão? (canal) |
|---|---|---|---|---|---|---|---|---|
| M1 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/483615/ | Bandai / Tom Create. Uploader: MetallicK2MK | oficial (mono) | ~40 poses de **emoção** + rastejar/nadar + **mini de andar em 4 direções** | folha 480×440 [E] | Emoções e postura de quadrúpede "foca" (patas dianteiras, cauda) em vários ângulos | oficial-uso interno | Não. Copiado |
| M2 | https://github.com/dannyphang/digimon-up-sprites (`baked/gomamon`, `gomamon_adventure`) | Bandai Namco (Digimon Up) | oficial (extraído) | idle, **walking (9 quadros) [E]**, attack, faint; 1 direção | ~4 KB/quadro [E] | **Único ciclo de andar oficial de Gomamon achado**: mostra como o corpo de foca se arrasta | oficial-uso interno; repo sem licença | Só link |
| M3 | https://www.spriters-resource.com/wonderswan_wsc/digimonmedley/asset/64816/ | Bandai (Medley, WSC). Uploader: DigistarDBZ | oficial | batalha em cor; inclui Ikkakumon [E pela ficha] | folha 440×345 [E] | Cor e pose de ataque | oficial-uso interno | Não. **Não copiado**: sem cópia no Wayback |
| M4 | https://www.deviantart.com/heroinuzuka/art/Sprite-Sheet-Gomamon-600501632 | HeroInuzuka (2016) | fã | stand, hit, K.O., jump, **walk**, attack 1 e 2; 1 direção | folha 1024×993 [E]; sprite ~24 px [H] | Conjunto de animações de batalha completo em escala pequena | **pedir**. A própria imagem diz "give credits if used", mas não há licença formal [E] | Sim: nota no DeviantArt (confirmar por escrito) |
| M5 | https://www.deviantart.com/nestly/art/Gomamon-Pixel-Animation-398858567 | Nestly (2013) | fã | animação de nado/salto lateral | 1024×1278 [E] | Movimento do corpo e da cauda na água | pedir | Talvez: conta antiga, atividade incerta [H] |
| M6 | https://www.deviantart.com/marlon013/art/Gomamon-Sprite-975580101 | MARLON013 (2023) | fã | frente + **costas** (desenho, não pixel art) | 1280×1707 [E] | Única vista de costas achada fora do WSC; anatomia da crina e das manchas | pedir | Não vale (não é pixel art) |
| M7 | https://www.deviantart.com/maximus237/art/gomamon-pixel-art-789094722 | maximus237 | fã | pose única ~32 px | 1024×516 [E] | Leitura em resolução mínima | pedir | **Já pedido pelo fundador** |
| M8 | https://www.deviantart.com/kyamosthestubborn/art/Gomamon-EXE-Evolution-Line-793961036 | KyamosTheStubborn | fã | poses únicas | 1024×1120 [E] | "Gomamon EXE" é **criação de fã**, não espécie oficial. Serve só de técnica de pelo | CC BY-NC-SA 3.0 [E] | Não vale (espécie fictícia; risco de confundir identidade) |

## Ikkakumon (quadrúpede pesado)

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir permissão? (canal) |
|---|---|---|---|---|---|---|---|---|
| I1 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/483659/ | Bandai / Tom Create. Uploader: MetallicK2MK | oficial (mono) | Ikkakumon em **frente, 3/4, perfil, costas** (~10 poses) + Zudomon | folha 688×216 [E] | **Rotação completa do quadrúpede pesado**: chifre, presas, pelagem, patas com garras vermelhas | oficial-uso interno | Não. Copiado |
| I2 | https://github.com/dannyphang/digimon-up-sprites (`baked/ikkakumon`, também `zudomon`) | Bandai Namco (Digimon Up) | oficial (extraído) | idle, walking, attack, faint; 1 direção | ~3–4 KB/quadro [E] | Ciclo de andar oficial de um quadrúpede volumoso; a massa de pelo balança | oficial-uso interno; repo sem licença | Só link |
| I3 | https://www.deviantart.com/lurocha/art/Ikkakumon-Sprite-520785732 | LuRocha (2015) | fã (estilo DS) [H] | idle de batalha animado | 1280×788 [E]; sprite ~60 px [H] | Pelo, chifre e garras vermelhas em pixel colorido, 3/4 frente | pedir | Sim: nota no DeviantArt |
| I4 | https://www.deviantart.com/lorisc93/art/Ikkakumon-1283198766 | LorisC93 (2026) | fã-derivado? | render 3D de modelo de jogo [H] | 1280×1449 [E] | Volume 3D em 3/4 para a ficha de anatomia | pedir / provável oficial | Não vale (não é pixel art) |
| I5 | https://www.spriters-resource.com/wonderswan_wsc/digimonmedley/asset/64816/ | Bandai (Medley) | oficial | batalha em cor | 440×345 [E] | Ver M3 | oficial-uso interno | Não. Não copiado |
| I6 | https://www.deviantart.com/kyamosthestubborn/art/Ikkakumon-EXE-794185573 | KyamosTheStubborn | fã | pose grande + mini | 1600×1200 [E] | "Ikkakumon EXE" é variante de fã; só técnica de pelagem | CC BY-NC-SA 3.0 [E] | Não vale (espécie fictícia) |

## Koromon (extra)

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir? |
|---|---|---|---|---|---|---|---|---|
| K1 | https://www.spriters-resource.com/ds_dsi/digimonworldds2/asset/40904/ | Bandai Namco (DW Dawn/Dusk). Ripper: Shoda ("No credit needed") | oficial | batalha + **mini de campo frente/lado/costas** | folha 265×117 [E] | Mini em cor no formato do nosso mapa | oficial-uso interno | Não. Copiado |
| K2 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/121213/ | Bandai / Tom Create | oficial (mono) | emoções + pulo + mini em 4 direções | 352×344 [E] | Emoções de um corpo sem membros | oficial-uso interno | Não. Copiado |
| K3 | https://github.com/dannyphang/digimon-up-sprites (`baked/koromon`) | Bandai Namco (Digimon Up) | oficial (extraído) | idle, walking, attack, faint | — | Pulo/quique oficial moderno | oficial-uso interno | Só link |
| K4 | https://www.deviantart.com/aniki0001/art/koromon-sprite-rpg-650659813 | aniki0001 | fã-derivado? | 4 direções × 3 quadros (RPG) | 900×1350 [E] | Ciclo de quique em 4 direções | pedir | Talvez (perguntar a origem) |
| K5 | https://www.deviantart.com/tatsuyodragneel/art/RPG-Koromon-827662033 | TatsuyoDragneel (2020) | fã | 4 direções × 4 quadros (RPG) | 1023×306 [E] | Idem. A cor puxa para cinza-rosado (fiel ao design?) | pedir | Talvez |
| K6 | https://www.deviantart.com/edenpixel/art/koromon-Pixel-Art-1253924709 | EdenPixel | fã | pose única | 1920×2504 [E] | Anatomia e orelhas | pedir | Opcional |
| K7 | https://www.deviantart.com/medli20/art/Free-use-icon%3A-Koromon-199849382 | medli20 (2011) | fã | ícone animado | 1280×1707 [E] | O título diz "Free-use", mas a página não declara licença [E] | **ambíguo**: tratar como pedir | Não vale (ícone pequeno) |

## Bukamon (extra)

| # | URL original | Autor / responsável | Tipo | Animação / direções | Resolução | O que é útil | Licença | Pedir? |
|---|---|---|---|---|---|---|---|---|
| B1 | https://www.spriters-resource.com/wonderswan_wsc/digimonadventure02digitalpartner/asset/483653/ | Bandai / Tom Create. Uploader: MetallicK2MK | oficial (mono) | ~35 emoções + nado + mini em 4 direções | 352×344 [E] | Emoções e flutuação | oficial-uso interno | Não. Copiado |
| B2 | https://github.com/dannyphang/digimon-up-sprites (`baked/bukamon`) | Bandai Namco (Digimon Up) | oficial (extraído) | idle, walking, attack, faint | — | Flutuar e andar oficial moderno | oficial-uso interno | Só link |
| B3 | https://www.deviantart.com/vinisan07/art/Bukamon---Digimon-Sprite-388200256 | vinisan07 (2013) | fã | pose frontal + paleta | 1024×607 [E] | Paleta organizada e volume da barriga | pedir | Talvez |
| B4 | https://www.deviantart.com/rinishi/art/Bukamon-Sprite-77843233 · https://www.deviantart.com/wooded-wolf/art/Bukamon-Sprite-259511196 | Rinishi (2008), Wooded-Wolf (2011) | fã | — | — | Não abertos a fundo (baixa prioridade) | pedir | Não |

## Outras fontes oficiais mapeadas (não baixadas)

Todas no Spriters Resource, lidas pelo Wayback em 2026-11-14:
- **Digimon Anode/Cathode Tamer** (WSC): folhas por estágio (Rookie 27757, In-Training 27625, Champion Vaccine 27896, Champion Data 27895).
- **Digimon Adventure 02: D-1 Tamers** (WSC): Rookie 127928, Champion 127993, In-Training 127906.
- **Digimon Tamers: Brave Tamer** (WSC): Baby I & II 142452, Child & Armor 142453, Adult 142454.
- **Digimon Battle Spirit 1/2** (GBA, `digibat`/`digibat2`): Agumon 53267 (lateral de luta).

Ficaram fora porque são folhas de batalha laterais, com dezenas de espécies, e o essencial já está coberto por Digital Partner, Dawn/Dusk e DW3. Podem ser baixadas se a F2 pedir.

## DW3: o que tem e o que não tem para as 6 espécies

- [E] Folhas de DW3 no Spriters Resource (Wayback): **só o Agumon** tem sprite de mapa entre as 6 espécies. Olhei "Various Digimon 01/02", "Bosses", "BlackAgumon & Agumon Suits" e a lista de assets.
- [E] Wikimon (lido em 2026-11-14): no DW3, Gomamon e Ikkakumon aparecem **só como cartas**; Koromon e Bukamon não têm seção de DW3.

## Riscos e observações

1. **Digimon Up (repositório dannyphang/digimon-up-sprites).** [E] Não tem licença (`license: null` na API do GitHub). O README diz que "a arte pertence à Bandai Namco" e que é projeto de fã não comercial. É material oficial redistribuído por terceiros, como no Spriters Resource, mas criado em 2026-11-01 e muito recente. **Não baixei.** Recomendo que o fundador decida se ele entra como referência interna nos mesmos termos da D12.
2. **Repositório `markisha64/ddw3`.** [E] O README diz que contém imagens (`tim`) do jogo convertidas para PNG, arquivos de localização e "outros arquivos copiados" do disco. Isso é distribuição de conteúdo do jogo. Pela regra do brief ("não use repositório que distribua o jogo"), marquei-o como **não usar**. Li só o README e um arquivo de dados antes de perceber; nada foi incorporado. Ver `MATRIZ_DW3_DATABASE.md`.
3. **"Fã-derivado?"** (eston12, aniki0001, LorisC93, JeffNunes007): várias obras de fã parecem extração ou edição de sprite oficial [H]. Pedir permissão a quem não é o autor não resolve nada. A ação certa é achar a fonte oficial.
4. **Variantes de fã** ("EXE", "X-Antibody" de fã): não são as espécies oficiais. Usar como referência de identidade contraria a regra de espécie oficial do Digital Odyssey.
5. **Escala:** as referências vão de 16 px (vpet) a 200 px (EdenPixel). A escala Tamer/Digimon é **conflito aberto da Etapa 6**; este catálogo não escolhe nenhuma.
