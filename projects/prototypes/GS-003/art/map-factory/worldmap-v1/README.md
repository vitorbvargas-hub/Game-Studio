# World Map v1 (retomada) — GS-003

**Status:** refeito após reprovação do coordenador. A v1 original (ruído procedural
periódico, "mosaico", sem relação com o GDD) foi **descartada por completo**, não
reaproveitada — este é um redesenho do zero, autorado à mão.

## O que mudou vs. a entrega reprovada
| Crítica | Como foi endereçada |
|---|---|
| Ruído repetitivo / mosaico | Litoral é uma spline fechada (Catmull-Rom) por **pontos de controle escolhidos à mão** (`ISLAND_CTRL_PCT`), não ruído periódico. Biomas usam Voronoi (ponto mais próximo) a partir das 6 âncoras reais, com 2 termos de "warp" largos só para ondular a fronteira — não há textura repetida em macro-escala. |
| Sem relação com o nosso mundo | As 6 regiões e posições (%) vêm **literal e exatamente** de `prototype/world/src/ui/worldmap.ts` (`POS`) e o grafo de rotas de `regions.json` (`routesTo`) — não inventados. |
| Biomas não reconhecíveis | Floresta Densa (verde escuro + dossel), Praia dos Postes (areia + 3 postes de madeira saindo d'água — referência `evidence/.../superrumble_vila_brinquedos_mapa.jpg`), Montanha (rocha cinza + neve no topo), Deserto (areia âmbar + dunas diagonais + flecos de engrenagem — "Gear Savannah"), Zona Corrompida (magenta/roxo com ruído tipo glitch), Vila dos Bebês (grama clara + blocos de brinquedo gigantes rosa/azul/creme). |
| Faltava: coordenadas, ícones de POI, estados, frame de Digivice | Entregues — ver abaixo. |

## Arquivos
- `worldmap_v1.png` — 640x360, moldura de "Digivice" (bezel navy/aço, trim ciano, emblema losango no topo, botões decorativos embaixo) ao redor do viewport de mapa (612x300 úteis).
- `worldmap.json` — coordenadas de cada região **no PNG** (`pos_px`, dentro de `viewport_px`), ícone por tipo, estado demo, lista de rotas, dimensões do viewport.
- `poi_icons.png` — sprite sheet 96x32 (linha 0 = 6 glifos base 16x16: casa/vila, pinheiro/floresta, onda+poste/praia, pico nevado/montanha, engrenagem/deserto, caveira/zona corrompida; linha 1 = mesmos glifos com anel + selo de cadeado, referência de estado bloqueado).
- `poi_icons.py` — gerador dos ícones (reaproveitado pelo script do mapa).
- `generate_worldmap.py` — gerador determinístico (sem seed aleatória — tudo autorado).

## Paleta
Reaproveita **ByteLine-18** do projeto (`art/PIXEL_ART_DIRECTION.md` §3: `ink/void/steel/steelLt/mist/paper/cyan*/magenta*/amber*/volt/bgGrid`) e as rampas de grama/terra/casca de `art/map-factory/forest-v8-depth/palette.json` para a Floresta Densa — nenhuma cor nova nessas duas partes. **Novo** (não existia no projeto): paleta pastel da Vila dos Bebês (`grass_light #a9b777`, `wall_cream #f3e6c8`, `toy_pink #e98fb0`, `toy_blue #6fb3d9`) e areia da praia (`#e8d9a8`/`#cdb77e`) — documentado aqui para quem for padronizar um `palette.json` formal depois.

## Estados dos ícones de POI (demonstrado no PNG)
Calculados com a mesma regra de `unlockState()`/`canTravel()` de `world/regions.ts`,
para `tamerLevel=1` e nenhum chefe derrotado (início de uma run nova):
- **Vila dos Bebês:** `here` (ponto de partida) — anel ciano claro.
- **Floresta Densa:** `open` (unlock `none`) — anel ciano escuro.
- **Praia dos Postes, Montanha, Deserto, Zona Corrompida:** `locked` — anel escuro + selo de cadeado (o motivo exato de bloqueio está em `worldmap.json`/`regions.ts`, não duplicado aqui).

## Uso sugerido
- `worldmap_v1.png` como tela de mapa-múndi completa (já inclui a moldura).
- Ou recortar só o viewport (`viewport_px` em `worldmap.json`) e desenhar a própria
  moldura de UI do jogo por cima, se o Digivice deste PNG não combinar com a UI final.
- Os marcadores de POI no PNG são uma **demonstração assada** (estado fixo); para
  estado dinâmico em tempo real, desenhar por cima usando `poi_icons.png` +
  `pos_px` de `worldmap.json`.

## Limitações
- **[H]** Rotas são linhas tracejadas sutis (pontos de 2x2px a cada ~4px) — ficam
  discretas sobre fundos texturizados (confirmado por inspeção pixel a pixel que
  existem nas 5 ligações, mas em Deserto↔Zona Corrompida e Montanha↔Deserto elas
  são difíceis de notar a olho nu no preview em miniatura; o grafo completo e
  redundante está em `worldmap.json.routes` para quem preferir desenhar uma linha
  mais grossa na engine.
- **[H]** Os ícones de Engrenagem (Deserto) e Caveira (Zona Corrompida) perdem
  nitidez em 16px nativos (silhueta geral dá para reconhecer "tipo de local",
  mas detalhe fino como dentes da engrenagem ou encaixe do crânio fica subtil)
  — ver `poi_icons.png` para os glifos isolados, mais fáceis de avaliar sem o
  ruído do bioma atrás.
- Continente e proporções de bioma são **minha interpretação visual** do GDD
  (`officialAreaNote`s em `regions.json` já marcam vários nomes como `[H]`
  não-oficiais, ex. "Praia dos Postes", "deserto mecânico") — não validado
  com o fundador/game-design antes desta entrega.
- Sem texto/labels no PNG (sem fonte pixel neste pipeline) — nomes de região só
  existem em `worldmap.json`.
- Sem PixelLab, sem PIL/Pillow (indisponíveis neste host) — PNG escrito à mão via
  `art/_tools/pngw.py` (zlib + chunks manuais), mesmo padrão já usado no resto
  do projeto (`art/src/png.js`, ver `PIXEL_ART_DIRECTION.md` §1).
- Revisão só própria (via inspeção visual nesta sessão, incluindo zoom pixel a
  pixel das áreas críticas) — sem revisão cruzada do fundador/game-design ainda.

## Regenerar
```
python3 poi_icons.py && python3 generate_worldmap.py
```
