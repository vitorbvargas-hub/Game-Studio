# Style Bible GBA Plus — Digimon Visual Identity 1.0, Fase 1/Gate 1

- **Autor:** game-art (GAME-ART-DIRECTOR) · **Data:** 2026-11-11 · **Custo:** zero (sem PixelLab, sem compras).
- **Contexto:** decisão do fundador de 2026-11-11 — Digimon iguais aos sprites oficiais de *Digimon World DS/Dawn/Dusk* (catálogo em `../../../research/sprite-recovery/`), não redesenhados. Cenário e UI precisam casar com esses sprites.

## Entregas

| Arquivo | O que é |
|---|---|
| `DIGIMON_STYLE_GUIDE.md` | Style Bible definitivo: visual, escala (tile/Tamer/Digimon), paleta-mestra, contorno, sombra, luz dia/noite, identidade de Mundo Digital, matriz de nota de aprovação (mín. 8/10, falha crítica reprova). |
| `scale-comparison/scene_16_vs_32.png` + `build_scale_comparison.py` | Mesma cena pequena da Digital Forest em tile 32px e 16px, com Guilmon/Gabumon oficiais e o Tamer na escala real (sem redimensionar), lado a lado em escala inteira (×3), com as medições embutidas na imagem. Script reprodutível com `~/projects/GameStudio/shared/tools/sd-local/.venv/bin/python3 build_scale_comparison.py`. |
| `approval-sheet/approved_vs_rejected.png` + `build_approval_sheet.py` | Folha aprovado × reprovado: contorno, sombra, ruído de textura, cores — cada par parte de um asset real (Guilmon oficial, tile `ground_variant_2` do forest-v11-ground) com o lado reprovado sendo uma alteração sintética deliberada para ilustrar a regra. Mesmo comando para reproduzir. |

## Resumo (5–10 linhas)

Consolidei `ART_DIRECTION_V2.md`, `UI_DIRECTION_V2.md`, `ADR-010/012`, as provas de escala de `phase2/art/` e os relatórios de forest v9–v11 num Style Bible único. O ponto central: a decisão de hoje (Digimon = sprite oficial, sem redesenho) supera a escala de 56–64px que `ART_DIRECTION_V2.md` §1.4/§1.5 havia fixado (aquela escala dependia de regenerar o sprite via PixelLab). Com o sprite oficial congelado no tamanho real (Guilmon 30×34px, Gabumon 36×34px, Tamer 26×33px), medi e mostrei visualmente que, em tile 32px, a criatura ocupa só ~1,0–1,06× o tile (chão e personagem competem em escala); em tile 16px (proxy por downscale dos tiles atuais, não arte nova), a mesma criatura ocupa ~2,0–2,1× o tile — a proporção clássica de RPG 2D ("GBA"). Recomendo 16px como novo padrão de produção de cenário para esta missão, mas deixo isso marcado como proposta em aberto: mudar o tile reverte um trava anterior (`MAP_ART_BIBLE.md` §2, "não negociável") e tem custo real sobre o investimento já feito em 32px (forest v4–v12, building kits, autotile) — existe também a alternativa já documentada de manter tile 32 e resolver por câmera larga (`ART_STYLE_GUIDE.md` §9b). A decisão de migrar fica para o fundador. A folha de aprovado/reprovado usa assets reais (Guilmon oficial, tile de produção) com o lado reprovado sendo uma edição sintética (blur, ruído, hue-shift) para cada regra do guia, incluindo o problema real já documentado em `MIRANTE_TOP_AND_SCALE.md` (textura granulada do topo do platô).

## Limitações

- Comparativo 16px usa downscale dos tiles 32px existentes como proxy de proporção — não é arte 16px nativa (ficaria mais limpa se desenhada do zero nessa escala).
- Paleta-mestra do sprite oficial amostrada só em 2 espécies (Guilmon, Gabumon), ambas Rookie — não cobre todo o roster catalogado.
- "Portais" (identidade de Mundo Digital) não tem nenhum asset ainda, é diretriz para produção futura, não uma prova visual.
- A questão de escala de tile (16 vs 32) fica como recomendação, não como decisão executada — precisa aprovação do fundador antes de qualquer migração de produção.
- Nenhum destes materiais passou por revisão de `game-qa` (ADR-012 §3 pede revisão cruzada antes de virar regra obrigatória).
