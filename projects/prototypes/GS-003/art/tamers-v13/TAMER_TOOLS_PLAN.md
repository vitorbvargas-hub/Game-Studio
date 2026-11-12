# TAMER_TOOLS_PLAN — v13 "GBA Clean" (PixelLab Tier 1)

- **Missão:** GS-003, Tamers jogáveis v13. Teto 300 gerações. `get_balance` antes: credits $0.00, generations_remaining **2000** (Tier 1 ativo, ciclo até 2026-12-11).
- Marcação: **[E]** evidência desta sessão · **[H]** hipótese/decisão de direção.

## 1. Escala-alvo [E]

Medido nesta sessão (PNG real, `struct` sobre o IHDR, sem PIL/ImageMagick disponíveis no shell padrão):

| Sprite | Arquivo | W×H px | Pivô |
|---|---|---:|---:|
| Guilmon (oficial, mapa) | `CREATURE-0003/sprites/CREATURE-0003_walk_S_00.png` | 30×34 | — |
| Tamer atual (TAMER-0003) | `TAMER-0003/sprites/TAMER-0003_walk_SE_00.png` | 26×33 | (13,32) |

Bate com `quality-overhaul/phase3/style-bible/DIGIMON_STYLE_GUIDE.md` §2.2 (34px/33px, ~1,03–1,06× tile de 32px). **Decisão desta tarefa [H], conforme instrução explícita do fundador nesta entrega:** o Tamer (personagem humano, não é a espécie licenciada) recebe arte NOVA via PixelLab, mantendo a altura de corpo próxima dos ~32–34px do Guilmon — os Digimons continuam os sprites oficiais DS intocados. Isso é uma exceção pontual ao §2.5 do Style Bible (que recomendava manter também o Tamer no sprite oficial sem redesenho); registrado como tensão a resolver pelo fundador/Art Director em homologação (ver limitações no relatório final).

**Canvas de geração escolhido:** 48×48px (`create_character` v3, múltiplo de 4, dentro da faixa 16–90 = 2 gerações). Em 48px o corpo tende a ocupar ~34–40px de altura útil — perto do alvo. Ajuste fino, se necessário: `set_canvas_size` (grátis) ou recorte local (Pillow) antes de compor as pranchas, sempre nearest-neighbor, nunca redimensionamento com filtro suave sobre o sprite final do Tamer.

## 2. Ferramentas estudadas (grátis, `search_help`)

| Ferramenta | Uso neste pipeline | Custo |
|---|---|---|
| `create_character` (mode=v3, sem referência) | Âncora de estilo "Coragem" (preset 1), 8 direções, desenhado do zero a partir da descrição | 2 gerações @48px (faixa 16–90) |
| `create_character` (mode=pro, `style_character_id=<âncora>`) | Os outros 11 presets, cada um um indivíduo distinto (cabelo/corte/acessório diferente) mas na MESMA linguagem visual da âncora | 10 gerações @48px (faixa ≤85px) por preset, 8 direções já incluídas na mesma chamada |
| `animate_character` (mode=template, `template_animation_id`) | `walking` e `breathing-idle` por direção | 1 geração/direção @48px (abaixo do limiar ~92px) |
| `mirror_animation` | Espelha E→W, SE→SW, NE→NW a partir de uma direção já animada (S e N não espelham) | **Grátis** |
| `create_character_state` | Cogitado para variantes de cor de cabelo; descartado como caminho principal — custa 10 gerações POR estado, e 12 presets × 8 cores seria ~960 gerações, inviável no teto | 10/estado (não usado em massa) |
| `reduce_colors` | Forçar paleta única entre os 12 presets, se a autoavaliação pedir | 0.1 geração |
| `create_character_pro_flash` | Alternativa a `pro`+style_character_id; não usada — custo residual similar e menos controle de pose/view que `create_character(mode=pro, style_character_id=...)` | não usado |

## 3. Decisão de pipeline — 12 presets em 8 direções + walk + idle, dentro de 300 gerações

**Truque de custo:** animar só 5 direções (south, north, east, south-east, north-east) via `animate_character` e espelhar as 3 restantes (west, south-west, north-west) com `mirror_animation`, que é grátis. Corta o custo de animação de 8 para 5 gerações por clipe.

| Etapa | Gerações |
|---|---:|
| Âncora (Coragem): `create_character` v3 @48px | 2 |
| Âncora: `animate_character` walking (5 dir) | 5 |
| Âncora: `animate_character` breathing-idle (5 dir) | 5 |
| **Subtotal âncora** | **12** |
| 11 presets × [`create_character` pro+style_character_id (10) + walking 5dir (5) + idle 5dir (5)] | 11 × 20 = **220** |
| **Total estimado** | **232** |

Sobra de ~68 gerações para reentregas, correções de direção fraca (regra VI 1.0 §10: "se uma direção perder fidelidade, corrigir antes de gerar as demais") e qualquer ajuste de paleta (`reduce_colors`, 0.1/uso).

**Cores de cabelo (8 por preset, sistema já existente):** feitas por **recolor local** (Pillow, `scripts/recolor_hair.py`, grátis) sobre os pixels do cabelo de cada preset v13, usando os MESMOS 8 hex do sistema atual (`preto #2B2B2B`, `castanho #6B3A1F`, `loiro #D9A441`, `ruivo #B03A2E`, `azul #1F6FB0`, `verde #3E8E41`, `roxo #7B4BA6`, `prateado #C9CCCF`) — mais barato (zero gerações) e mais consistente (mesmo hex da UI/criador) do que gerar 96 estados pagos. Demonstrado na prova (§4) para o preset Coragem nas 8 cores; os outros 11 presets ficam com a cor canônica do preset (`defaultHair` da tabela em `tamer-presets.ts`) gerada via IA + o script de recolor pronto para rodar nas 7 cores restantes sem custo adicional.

## 4. Prova (Gate interno, ≤40 gerações)

1. Âncora "Coragem" completa (8 dir + walk + idle) — 12 gerações.
2. Recolor local das 8 cores de cabelo sobre a âncora (0 gerações).
3. Prancha comparativa: v13 Coragem × Tamer atual (TAMER-0003) × Guilmon oficial (CREATURE-0003), mesma escala, nearest-neighbor onde envolver sprite oficial.
4. Autoavaliação vs VI 1.0 §10 (nota ≥8, sem falha crítica de escala/identidade/animação) antes de prosseguir para os outros 11 presets.

## 5. Arquivamento

Cada personagem (âncora + 11 presets) é adicionado a uma pasta de projeto PixelLab **"GS-003 Tamers v13"** (`manage_project` + `add_to_project`) para rastreio no site, sem integração na engine (regra do escopo: `game-dev` só leitura).
