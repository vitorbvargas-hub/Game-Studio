# Pesquisa no Pinterest: fontes de sprites Digimon (2026-11-14, game-studio)

**Pedido do fundador:** "rode uma pesquisa profunda no pinterest, acha os melhores artistas e imagens e solicita o uso".

## Método
Foram 7 buscas: "pixel art digimon", "digimon top down sprite", "digimon sprite sheet walk", "digimon overworld pixel art", "digimon pixel art animation", "agumon sprite sheet" e "gomamon pixel art". Juntas deram cerca de 80 pins. Para cada pin, a fonte foi lida pelo campo `link` da página do pin, e as imagens foram conferidas uma a uma.

## O que existe no Pinterest

| Categoria | Qtde aprox. | Serve para nós? | Observação |
|---|---|---|---|
| Padrões de miçanga, perler e kandi (HazloconBeads, kandipatterns, brik, digifans_24, Taobao) | ~45% | Não | Visão lateral, estática e sem animação. Alguns dizem "proibido uso comercial". |
| "Uploaded by user", sem fonte | ~35% | Não | Sem autor rastreável, não dá para pedir permissão. |
| Sprites oficiais extraídos (Spriters Resource, vpet) | ~10% | **Sim, como referência oficial** | Entram na exceção Digimon (D12). |
| Arte autoral de fã com fonte rastreável | ~10% | Só Karasupx bate com o que precisamos | Os demais têm uma pose lateral única. |

## Resultado

### 1. Karasupx (u/Ok-Key-2076, ArtStation, Instagram) — pedido ENVIADO
- **O que ele tem:** Digimon top-down em 4 e 8 direções, com idle e walk (Agumon, Gabumon, Patamon→Angemon, linha do Veemon, Agumon→Greymon) e o Tai top-down. É exatamente o formato do nosso jogo.
- **Perfil:** brasileiro, aceita encomendas (r/HungryArtists, "a partir de US$45").
- **Pedido:** enviado em 2026-11-14 às 06:18 pelo chat do Reddit, na conta do fundador (VitorVargas93), com autorização dele. O texto descreve o projeto como fangame independente, não oficial e sem monetização, e pede uso com crédito completo.

### 2. Já pedidos pelo fundador no DeviantArt
- **maximus237** (Agumon e Gomamon pixel art).
- **hamurand22** (Garudamon e outros sprites).

### 3. Oficial: Digimon World Championship (DS)
Fonte: The Spriters Resource, assets 35037 (Rookie) e 35038 (Champion). O ripper (Chronfan8) pede crédito.
- **Formato:** sprites de batalha com idle, ataque e dano. Uma direção só (3/4 lateral), estilo GBA, com Agumon, Gomamon e Greymon presentes.
- **Uso possível:** referência oficial de pose e ataque, e entrada para o PixelLab (D12).
- **Limite:** não serve direto para o mapa, porque não tem 4 direções.
- **Arquivos:** `dwchampionship/dwc_rookie_35037.png` e `dwc_champion_35038.png`, mais `FONTE.txt`.

### 4. Não pedidos
Motivo: arte lateral única, sem utilidade para sprite de mapa, ou autor inativo ou não rastreável.
- **ishamuhammad (DeviantArt):** linha Agumon→WarGreymon lateral; último post em 2014.
- **fefe_drawings (Instagram):** Agumon lateral estático.
- **emimonserrate (X):** GIF animado de um digievolution; ilustração, não sprite de jogo.

## Recomendação
1. **Karasupx é a única fonte externa que resolve o problema.** Se ele autorizar, os sprites dele de Agumon e Gabumon (e o estilo) viram o padrão de qualidade. Se ele propuser encomenda, o fundador decide o gasto.
2. Até lá, seguimos com o PixelLab (Agumon v7, Koromon, Greymon, Gomamon, Bukamon, Ikkakumon).
3. Nenhuma arte de fã entra no jogo sem resposta positiva registrada no log.
