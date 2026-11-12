# UI v13 — plano de ferramentas PixelLab (estudo grátis)

- **Autor:** game-art (subagente) · **Data:** 2026-11-11
- **Teto:** 200 gerações. `get_balance` antes/depois de cada bloco de chamadas; nunca crédito em dólar (Tier 1 assinado, só `generations_remaining`).
- **Estilo-âncora:** `quality-overhaul/direction-v13/pixellab-test/pixen_clareira_ruinas_384x216.png` (nativo, não o mockup 5x) + paleta extraída por medição local (Pillow, grátis) do próprio arquivo + do ícone `pixen_icon_floresta_densa_64x64.png`. Curadoria de ~30 hex em famílias: fundo escuro (`#19172b/#222f39/#2a3742`), pedra/aço (`#78818b/#60697e/#aea79b`), madeira/bronze tier1 (`#8e523e/#9e6549/#d0a061`), verde digital (`#2a5546→#7aab43`), ciano/cristal tier2 (`#2f6690/#264c5a/#123635/#88d59b`), ouro tier3 (`#eddb84/#f6e6b7/#8c8843`), vermelho/alerta (`#d4566f/#58353e`), navy acento (`#2e3970/#3f4261`).

## Ferramentas estudadas (`search_help`, grátis)

| Ferramenta | Uso neste job | Custo |
|---|---|---|
| `create_ui_asset` | Molduras de painel 9-slice por tier (common/rare/legendary), com `elements=["panel","button","tab","health_bar"]` para sair várias peças de 1 chamada; `style_image_base64` existe mas exige base64 inline (risco de truncamento) — optei por **descrição textual detalhada + paleta citada em hex** em vez de embutir base64 grande. | 10 gen/canvas ≤256×256 (3 tiers = 30 gen) |
| `update_ui_asset(split=True)` | Separa cada template de painel em peças individuais (painel/botão/aba/barra) — **grátis**, sem gerar nada novo. | 0 |
| `create_ui_states` | Estados hover/pressed/locked do botão — 1 geração cobre todos os elementos passados. Escopo reduzido: states completos só no tier1 (mais usado); tier2/3 ficam só na variante visual estática (custo vs. benefício, registrado como pendência). | ~15 gen (1 elemento × 3 estados, grade pequena) |
| `create_image_pro_flash` | Versões "grandes" dos ícones de região (128×128, mostrador do painel de destino) e variantes do hub (notificação/chefe ativo via edição) — aceita `style_image` por URL (`upload:<id>`), mais confiável que base64 inline. | 5–9 gen/imagem por lado maior |
| `edit_image_pro_flash` | Recolorir a barra de HP (verde) para XP (ciano) e Energia (navy), mantendo a mesma moldura — mesma régua de preço do create. | 5–6 gen/imagem |
| `create_image_pixen` | Ícones pequenos (24–32px): 6 do anel + 6 do núcleo + 4 de tipo de golpe = 16 ícones. 1 geração fixa cada, independente do tamanho — a opção mais barata para um conjunto grande de ícones pequenos. Não aceita `palette`; corrijo com `reduce_colors` (grátis-ish, 0.1 gen) rodando o lote inteiro junto para garantir 1 paleta única. | 1 gen/ícone (16 gen) + ~0.1 gen (reduce_colors) |
| `create_font` | Avaliada: o jogo ainda não tem fonte pixel própria (usa fonte do sistema/placeholder nos mockups anteriores, confirmado por inspeção dos `p2_*.png`). Vale a pena pelo ganho de identidade a um custo fixo conhecido (15 gen, não escala com uso). **Decisão: fazer.** `glyph_px=16`, peso Regular (legibilidade em HUD pequeno), descrição casando com GBA Clean (contorno nítido, sem serifa). | 15 gen fixo |
| `create_1_direction_object` | Avaliada para o emblema do hub (visual "objeto 3D"); descartada — o hub é um ícone 2D plano (consistente com "cores chapadas, sem volumetria" do Style Bible §1 regra 2), então `create_image_pro_flash` é mais barato e mais alinhado ao estilo do que gerar um objeto com câmera. | 0 (não usada) |
| `create_character`/`create_8_direction_object` | Não usadas — fora de escopo (UI, não personagem/prop de mundo). | 0 |

## Pipeline por entrega

1. **Hub Digivice** (fechado): `create_image_pro_flash` 96×96, estilo-âncora por `style_image` (upload da cena nativa). Variante notificação e chefe-ativo: `edit_image_pro_flash` sobre a base (mesma moldura, só pip/arco).
2. **16 ícones** (6 anel + 6 núcleo + 4 golpe): `create_image_pixen` 32×32 cada, mesma frase de estilo; depois `reduce_colors` no lote (paleta única, trava com a paleta curada acima via `palette_image_base64` ou `num_colors`).
3. **Painéis 9-slice × 3 tiers**: `create_ui_asset` com `elements` combinando painel+botão+aba+barra por tier → `update_ui_asset(split=True)` grátis → `update_ui_asset(nine_slice=...)` grátis definindo os insets.
4. **Estados de botão**: `create_ui_states` no botão do tier1 (normal já vem do split; gera hover/pressed/locked).
5. **Barras HP/XP/Energia**: a barra do painel tier1 já sai verde (HP); `edit_image_pro_flash` gera as variantes ciano (XP) e navy (Energia) mantendo moldura idêntica.
6. **HUD inferior**: **composição local (Pillow, grátis)** com as peças já geradas (moldura painel tier1, ícones de golpe, barras, selos de raridade para slots de equipe) — não gerar um "HUD completo" direto por IA (caro, 25 gen numa tela 688px e sem controle de layout exato pedido pela spec). Resultado: PNGs separados (bloco Tamer, bloco Digimon, slot de equipe, barra de golpes) + a montagem final para o mockup.
7. **6 ícones de região**: versão pequena (64×64, `create_image_pixen`, 1 gen cada — Floresta Densa reaproveita o arquivo já existente da direction-v13, 0 gen) + versão grande (128×128, `create_image_pro_flash`, estilo-âncora, para o painel de destino do mapa-múndi).
8. **3 mockups 1920×1080**: composição local (Pillow, mesma técnica de `build_mockup.py` da direction-v13 — zoom inteiro + nearest-neighbor, nunca interpolação) sobre (a) o mockup v13 da clareira existente, (b) um painel Tamer do Digivice aberto, (c) o mapa-múndi com os novos ícones de região.

## Por que não gerar o HUD/painéis inteiros em 1 tiro por IA

A spec (`PANELS_SPEC.md`/`DIGIVICE_VI1_SPEC.md`) pede layout exato (abas laterais, posições de barra, 3 portas de entrada) — um canvas único gerado por IA não garante essa geometria nem permite reaproveitar a mesma peça em telas diferentes (painel vazio vs. com conteúdo). Gerar **componentes** (moldura, botão, barra, ícone) e montar localmente é a prática já usada com sucesso no `circuit-kit-v1` (`generate_circuit_kit.py`) e na própria `direction-v13` (`build_mockup.py`) — mais barato, mais fiel à spec, e gera peças reaproveitáveis em `game-dev` depois (fora do escopo desta entrega, que é só arte).
