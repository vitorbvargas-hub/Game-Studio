# Seleção comentada: as melhores referências por espécie

**Digital Odyssey (GS-003) · Comando 9, F1 · game-research · 2026-11-14**
Códigos (A1, G1…) remetem a `CATALOGO_REFERENCIAS.md`. Imagem local = `imagens/oficiais/…`.

## Critério

Pesei, nesta ordem:
1. **Serve para sprite de mapa?** Quantas direções tem e se o ciclo de andar está completo.
2. **Fidelidade à espécie oficial.**
3. **Cobre o que a F2 precisa?** Emoções, ataque, anatomia de quadrúpede, cauda e membros.
4. **Dá para usar sem pedir?** Oficial = uso interno (D12).

## Achados que mudam o plano [E]

- **Digital Partner (WonderSwan) é o achado mais útil para as 6 espécies ao mesmo tempo.** Há uma folha oficial para cada uma (Agumon, Greymon, Gomamon, Ikkakumon, Koromon, Bukamon). Cada folha traz rotação **frente / 3/4 / perfil / costas** (Greymon, Ikkakumon), **dezenas de emoções** (Agumon, Gomamon, Koromon, Bukamon) e mini de campo em 4 direções. É monocromática: serve para forma, pose e emoção, não para paleta.
- **Digimon Up (Bandai Namco, 2026)** tem pixel art oficial moderna das 6 espécies, com idle, walk, attack e faint. É o melhor parâmetro de acabamento atual, mas é 1 direção só e o repositório não tem licença. Ficou só como link, e o uso depende do fundador (ver Pedidos, decisão D-F1-2).
- **DW3 só cobre o Agumon** entre as 6 espécies. Mesmo assim, a folha do Agumon é a melhor referência de 8 direções que existe.
- **DW Dawn/Dusk (DS)** tem mini de campo em cor (frente/lado/costas) só de Agumon e Koromon no Spriters Resource.
- **Nenhum fã** tem top-down de 4 direções de Gomamon ou Ikkakumon. Quadrúpede em 4 direções continua sendo a lacuna principal. Em fontes oficiais, só os minis do WSC e as rotações do Digital Partner chegam perto.

---

## Agumon

1. **A1: DW3 Agumon (8 direções).** É a única referência oficial de andar e correr em **8 direções**, em chibi de mapa e com ciclo completo. Resolve como o focinho e a cauda aparecem nas diagonais, que é exatamente onde os testes do PixelLab erram mais. Local: `dw3/dw3_agumon_13315.gif`.
2. **A2: DW Dawn/Dusk Agumon.** Mini de campo em **cor** (frente, lado, costas) no tamanho DS/GBA, que é o mais perto da direção GBA Plus. Mostra como reduzir a cabeça grande e as garras a poucos pixels sem perder a leitura. Local: `ds_dawndusk/sr40907_agumon.png`.
3. **A3: Digital Partner Agumon.** São **~40 emoções** oficiais (alegria, choro, raiva, sono, susto). Também é a melhor base para a ficha de expressões.

Menção: **A7 Midnitez-REMIX** (fã, CC BY-NC-ND) é o fã que mais se aproxima do nosso formato (4 direções × 3 quadros). A licença proíbe derivação, então só serve com permissão. **A12 Karasupx** continua sendo o melhor candidato de fã (pedido já enviado).

## Greymon

1. **G1: Digital Partner Greymon.** É a única **rotação completa** oficial achada (frente, 3/4, perfil, costas). Mostra o capacete-crânio, as listras e o volume da cauda em cada ângulo, que é a base das 4 direções de um bípede grande. Local: `wsc_digitalpartner/sr483663_greymon_metalgreymon.png`.
2. **G2: Digimon Up Greymon.** É pixel art oficial moderna com ciclo de andar e ataque com chama. É a melhor referência de **acabamento e peso** do corpo grande. Só link.
3. **G5: eston12 "Greymon Sprite Sheet".** É o único material com **mini de campo de Greymon em várias direções** e cor. Pela aparência, deve ser extração do Digimon World DS [H]. Use como pista e procure a folha oficial correspondente no Spriters Resource quando o Cloudflare liberar; não peça permissão a eston12.

Menção: **G3 Medley** (cor, pose de ataque, local). **G7 EdenPixel** (anatomia, fã).

## Gomamon

1. **M1: Digital Partner Gomamon.** Tem emoções, rastejar e nadar, mini em 4 direções e o corpo de "foca" visto de vários ângulos. É a referência oficial mais completa de **quadrúpede pequeno**. Local: `wsc_digitalpartner/sr483615_gomamon.png`.
2. **M2: Digimon Up Gomamon.** É o **único ciclo oficial de andar** de Gomamon achado (9 quadros [E]). Mostra que o Gomamon se arrasta com as patas dianteiras, sem trote. Isso evita o erro de animar como cachorro. Só link.
3. **M4: HeroInuzuka, sprite sheet.** Tem o conjunto de batalha completo (stand, hit, K.O., jump, walk, 2 ataques) em escala pequena. É o fã de Gomamon mais útil e já diz "give credits if used". Vale pedir permissão formal.

Menção: **M6 MARLON013** tem a única vista de **costas** fora do WSC, mas não é pixel art. **M5 Nestly** tem animação de nado lateral.

## Ikkakumon

1. **I1: Digital Partner Ikkakumon.** É a **rotação completa** do quadrúpede pesado: chifre, presas, juba e patas com garras vermelhas em frente, 3/4, perfil e costas. Fecha a lacuna principal da anatomia de quadrúpede. Local: `wsc_digitalpartner/sr483659_ikkakumon_zudomon.png`.
2. **I2: Digimon Up Ikkakumon.** É o ciclo de andar oficial moderno de um corpo volumoso. Mostra o peso e o balanço da pelagem. Só link.
3. **I3: LuRocha, Ikkakumon Sprite.** É pixel art colorida em 3/4, com pelagem e garras bem resolvidas, perto da escala de batalha. Vale pedir permissão como referência de estilo.

Menção: **I4 LorisC93** (render 3D) serve para conferir volume na ficha de anatomia (`fase11-fichas-anatomia/FICHA_IKKAKUMON.md`).

## Koromon (extra)

1. **K1: DW Dawn/Dusk Koromon.** Mini de campo em cor, frente/lado/costas. Local.
2. **K2: Digital Partner Koromon.** Emoções e pulo. Local.
3. **K3: Digimon Up Koromon.** Quique oficial moderno. Só link.

## Bukamon (extra)

1. **B1: Digital Partner Bukamon.** Emoções, nado e mini em 4 direções. Local.
2. **B2: Digimon Up Bukamon.** Flutuação oficial moderna. Só link.
3. **B3: vinisan07.** Paleta organizada (fã; pedir).

---

## Para a F2 (sugestão, não decisão)

- Combinar **forma e rotação do Digital Partner** + **ciclo de andar do DW3/Digimon Up** + **paleta e escala do DW Dawn/Dusk** dá uma referência oficial completa por espécie, sem depender de fã.
- O conflito aberto de **escala** não foi resolvido aqui. O DW3 Agumon (~24 px), o mini do Dawn/Dusk (~16–20 px) e o Digimon Up (~40 px) puxam para escalas diferentes. Quem decide é a Etapa 6.
