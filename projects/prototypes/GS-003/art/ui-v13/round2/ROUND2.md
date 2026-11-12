# ROUND2 — UI v13 "GBA Clean" Digivice, moldura azul-petróleo (retomada)

- **Autor:** game-art (subagente) · **Data:** 2026-11-11
- **Teto desta rodada:** 80 gerações PixelLab. **Gasto real: 0 gerações.** Tudo o que faltava fazer (3 mockups 1920×1080 + correções de legibilidade) foi composição local (Pillow), reaproveitando (a) o chrome azul-petróleo já unificado em `round2/out/` (produzido antes do limite de uso ter interrompido a sessão anterior, pelo `stage1_unify_chrome.py`) e (b) o `continent_bg_680x384.png` já gerado. Não chamei nenhuma ferramenta PixelLab nesta retomada.
- **Escopo:** só arte + script de composição em `art/ui-v13/round2/`. Nenhum arquivo de `workspaces/game-dev` foi tocado; nada foi integrado na engine.

---

## 1. O que já estava pronto (verificado antes de gerar qualquer coisa)

Antes de escrever uma linha de código novo, conferi `round2/out/` e o que a sessão anterior já tinha deixado:

- `stage1_unify_chrome.py` **já tinha resolvido** o problema estrutural da rodada 1 apontado pela QA (painel tier3 "dourado barroco" destoando do resto): painel/botão/aba/barra dos 3 tiers agora são **o mesmo frame azul-petróleo** (estilo Digivice, cantos em circuito ciano sobre navy), diferenciados só por uma gema pequena no canto (bronze/ciano/ouro) — sem baú de ornamento barroco em lugar nenhum. Resultado em `round2/out/panels/`, `out/buttons/`, `out/bars/`.
- O mesmo script já tinha **removido o texto cozido** de dentro dos botões (flood-fill da área interna) — corrige de raiz o bug do cadeado sobre "START": os botões unificados (`out/buttons/button_unified_*.png`) não têm mais nenhum rótulo embutido, então nunca mais vão esticar texto errado via 9-slice.
- `continent_bg_680x384.png` já existia: uma ilustração **de continente** (duas penínsulas ligadas por uma ponte/rio, floresta/montanha espelhadas, zona corrompida com cratera de cristal roxo a leste) — exatamente o tipo de cena que faltava para o mapa-múndi parar de ser uma grade de cartões.
- `tier2_zip/` era só a fonte dos elementos usados pelo stage1 (ZIP do painel tier2 original), não precisou de nada novo.

Dado isso, meu trabalho nesta retomada foi **só** terminar `build_round2_mockups.py` (que parava em "assets loaded ok", sem nenhuma função de montagem) e montar os 3 mockups com o que já estava pago e pronto.

## 2. Correções aplicadas (pedidas pelo fundador + achados da QA_UI_V13.md)

| # | Problema (rodada 1) | Correção nesta rodada | Onde |
|---|---|---|---|
| 1 | Moldura dourada barroca (tier3) destoando do resto | Já resolvido pelo `stage1_unify_chrome.py` herdado — confirmei visualmente nos 3 mockups novos: toda moldura (modal Digivice, pílulas do mapa, HUD) é a mesma família azul-petróleo/ciano | os 3 mockups |
| 2 | Texto com anti-aliasing (regra dura do Style Bible) | Mantida/reforçada a função `draw_crisp_text` já herdada (texto desenhado numa camada própria, alpha limiarizado em 110 → sem halo cinza) + piso rígido `MIN_TEXT_PX=32` em toda chamada | função `font()`/`draw_crisp_text()` |
| 3 | Cadeado sobreposto a "START" no botão bloqueado (P0) | Como os botões unificados já vêm sem texto cozido, desenhei um cadeado próprio em pixel (arco + corpo + fechadura, `draw_padlock()`, formas chapadas, sem IA) **no canto da pílula**, nunca sobre o rótulo — verificado em zoom 3× na pílula "MONTANHA" do mapa | `ui13_mapa_mundi_1920x1080.png` |
| 4 | HUD inferior pesada (bandeja de madeira grossa, 889×106) | Trocada por **uma** faixa azul-petróleo fina (1120×84, insets de 10px em vez da moldura grossa de madeira), mesma informação (Tamer, Digimon+HP, 6 slots de equipe, 4 slots de golpe) com portas/slots menores e espaçamento mais justo | `ui13_hud_overlay_clareira_1920x1080.png` |
| 5 | Mapa-múndi virou grade de cards, perdeu o continente (P1) | Reconstruído do zero: `continent_bg_680x384.png` escalado 2,6× (nearest-neighbor) cobrindo quase a tela toda; as 6 regiões (`regions/region_*_64.png`, já aprovadas na QA com 7/10) **plantadas nas suas posições reais na ilustração** (floresta ao pé da montanha oeste, zona corrompida na cratera leste, vila-dos-bebês na ilhota isolada ao sul etc. — mapeei as coordenadas manualmente com uma grade de referência, ver §3), com anel de destaque (ouro=atual, ciano=liberado, cinza=bloqueado) atrás de cada ícone em vez de um card de grade | `ui13_mapa_mundi_1920x1080.png` |
| 6 (achado nesta sessão, não estava na QA) | A fonte pixel "Digivice GBA Clean" não tem glifos acentuados (í/ó/ã/ç/ê/á) — `font.getbbox()` confirma caixa vazia (0,26,12,26) para cada um. Um teste inicial meu produziu "N vel", "Vit rias", "Digivolu es", "VOC EST AQUI" (letras comidas) | Adicionado `strip_accents()` (remove diacríticos via `unicodedata.normalize`, mantém a palavra legível: "Nivel", "Vitorias", "Digivolucoes", "VOCE ESTA AQUI") aplicado em toda chamada de `draw_crisp_text` | os 3 mockups |

## 3. Mapeamento das 6 regiões sobre o continente — método

Medi as coordenadas à mão sobre `continent_bg_680x384.png` com uma grade de referência (`/tmp/gs003_r2/continent_grid.png`, linhas a cada 40px) e dois recortes 3× (`left_3x.png`/`right_3x.png`) para ler os detalhes:

| Região | Ponto na ilustração (680×384) | Pista visual usada |
|---|---|---|
| Montanha | (190, 55) | pico nevado da península oeste |
| Floresta Densa | (90, 160) | mata de palmeiras na base da montanha oeste — marcada como **"você está aqui"** |
| Praia dos Postes | (250, 305) | faixa de areia com estacas de madeira na água, junto à vila oeste |
| Deserto | (580, 90) | terreno árido/alaranjado com cones vulcânicos pequenos, a leste |
| Zona Corrompida | (620, 185) | cratera com rachaduras de cristal roxo, único elemento inconfundível |
| Vila dos Bebês | (330, 358) | ilhota isolada ao sul, separada do continente principal |

Esses pontos são multiplicados por `MAP_SCALE=2.6` + deslocamento `(76,41)` no script para virar coordenada de tela 1920×1080 — ver `REGION_POINTS` em `build_round2_mockups.py`.

**[H] hipótese, não confirmada por nenhuma spec de game-design:** os status "liberado/bloqueado Nv.XX" atribuídos a cada região (Vila dos Bebês e Praia dos Postes liberadas; Montanha Nv.30, Deserto Nv.40, Zona Corrompida Nv.60 bloqueadas) são só para o mockup ter uma progressão visualmente plausível — a mesma lacuna que a rodada 1 já tinha (QA_UI_V13.md §2.9 não achou nenhum documento com os níveis reais por região). Se existir uma spec de game-design com os números de verdade, é só trocar o dicionário `REGION_STATUS` no script.

## 4. Arquivos entregues

Dentro de `art/ui-v13/round2/`:

- `mockups/ui13_hud_overlay_clareira_1920x1080.png` — HUD em jogo (hub + pílula de região + HUD inferior leve)
- `mockups/ui13_digivice_tamer_1920x1080.png` — Digivice aberto, núcleo Tamer, moldura azul-petróleo
- `mockups/ui13_mapa_mundi_1920x1080.png` — mapa-múndi como cena de continente com 6 ilhas de região
- `build_round2_mockups.py` — script completo e reproduzível (antes parava em "assets loaded ok"; agora tem as 3 funções de montagem + `strip_accents`/`draw_padlock`/`draw_ring`)
- `stage1_unify_chrome.py` — herdado da sessão anterior, sem alteração (já fazia o trabalho certo)
- `continent_bg_680x384.png`, `tier_gems_96x32.png`, `palette_azul_petroleo_swatch.png`, `out/`, `tier2_zip/` — herdados, reaproveitados

## 5. Limitações

1. **Retrato do Tamer/Digimon ainda é ícone-placeholder escalado** (`icon_tamer.png`/`icon_digimon.png`, 32px esticado) — mesma pendência já documentada em `UI_V13.md` §6.4 e confirmada pela QA (§2.12); não fazia parte do pedido desta rodada (texto, botão, HUD, mapa) e não gastei geração tentando resolver sem uma decisão do fundador sobre a fonte da arte do retrato.
2. **Níveis de bloqueio das regiões no mapa são hipótese de mockup** (§3 acima), não dado de game-design confirmado.
3. Não testei o `.ttf` dentro de um motor/browser real — só dentro do próprio script Pillow que o gerou; o achado da falta de glifo acentuado (§2 item 6) foi confirmado via `ImageFont.getbbox()`, mas não sei se o motor do jogo (CSS/Phaser) trata glifo ausente da mesma forma — recomendo ao game-dev também normalizar acentos ao usar essa fonte em texto dinâmico (nomes de Digimon, etc.), não só nestes mockups.
4. O cadeado do mapa (`draw_padlock`) é desenho programático simples (arco + retângulo), não arte pixel desenhada à mão nem gerada — funcional e sem sobreposição de texto (o bug P0 original), mas visualmente mais simples que um ícone de cadeado dedicado; se o fundador quiser um cadeado com mais acabamento, é ~1 geração (`edit_image_pixen`) fora do teto já gasto (que ficou em 0).
5. Nada foi integrado em `workspaces/game-dev` — como na rodada 1, isto é só arte + mockups para referência.
