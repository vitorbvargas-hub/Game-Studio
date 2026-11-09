# PIXELLAB_PLAN_40 — plano de uso dos 40 créditos (Map Factory, Floresta)

- **Autor:** game-art · **Data:** 2026-11-09.
- **Status: SÓ PLANO, NADA EXECUTADO.** O MCP PixelLab está retornando **401 (falta header Authorization)** agora (ADR-011 "Pendências", confirmado nesta sessão — não tentei nenhuma chamada). Nenhuma ferramenta `pixellab__*` foi invocada para gerar imagem nesta entrega. Este documento só planeja; a execução fica para quando o operador resolver o 401 (`openclaw secrets audit --check`, conforme o ADR-011).
- **Orçamento:** 40 créditos totais (ADR-011 §4). Regra: **só ferramentas de 1 crédito** — `create_topdown_tileset` modo `standard`, `create_image_pixen`, `create_image_pixflux`. Qualquer ferramenta de 10–25 créditos (`create_1_direction_object`, modo `pro`, 8 direções) fica **vetada sem nova aprovação do fundador**, conforme ADR-011 §4.
- **Reserva mínima exigida por esta tarefa:** ≥10 créditos. Este plano usa **14 de 40**, deixando **26 de reserva** — acima do mínimo, de propósito: é a primeira rodada, e o custo real de cada item (enquadramento, falha de geração, retrabalho) só se sabe depois da primeira tentativa real.

## Protocolo obrigatório antes de qualquer execução (briefing §6, ADR-011 §4)

1. `get_balance` antes de **cada** chamada — confere que o saldo bate com o que este plano espera.
2. Checar duplicata: nenhum item deste plano gera algo que `forest-v4`/`forest-v4.1`/`forest-v6` já tem (ver `FOREST_KIT_GAP.md` §1 para o inventário do que já existe).
3. Logar prompt, ferramenta, custo e saldo restante em `shared/tools/map-factory/logs/pixellab-usage.csv` **imediatamente depois** de cada chamada (não em lote no fim).
4. Se o saldo chegar a 10 (a reserva mínima), **parar** e pedir autorização antes de continuar — não seguir com outra ferramenta paga (briefing §6).
5. Todo resultado passa pelo checklist de aprovação de asset do `MAP_ART_BIBLE.md` §8 antes de entrar em qualquer mapa.

## Como citar referência de estilo (ADR-011 §5)

`create_topdown_tileset`/`create_image_pixen` não aceitam imagem de referência de estilo (só texto). `create_image_pixflux` aceita `color_image_base64`/`color_image_url` (força a paleta, não a composição) e `init_image_base64`/`url` (img2img, parte de uma imagem existente). Por isso:

- Quando a ferramenta não aceita imagem, a "referência de estilo" do item é **textual** (citar Drakantos/IdleDex/Digimon por nome na descrição é permitido pelo ADR-011 §5) + os hex exatos do ramp relevante (`forest_v4_palette.js`), escritos no prompt para a IA mirar a mesma paleta.
- Quando a ferramenta aceita imagem (`pixflux`), a referência preferida é um arquivo **já produzido por este estúdio** (um PNG do `forest-v4`/`forest-v6`, enviado via `get_upload_url` + `curl` antes da chamada, conforme a instrução do MCP) — preserva consistência sem depender de arte de terceiro.

---

## Itens do plano (ordem de prioridade)

| # | Prioridade | O que | Ferramenta | Prompt (resumo) | Referência de estilo | Custo |
|---|---|---|---|---|---|---|
| 1 | **Alta** | Flor digital (substitui a lacuna "flores... digitais" do `FOREST_KIT_GAP.md`) | `create_image_pixen` | "small cluster of glowing digital flowers, cyan/teal data-petal accents on dark green stems, pixel art, 32x32 canvas, transparent background, same style as a Digimon World forest clearing — not a real-world flower, circuit/pixel motif on the petals" | Textual: cita Digimon + hex `#2ce8f5`/`#0099db` (acento cyan já usado em `tree_data_leaf`) e `#63c74d`/`#3e8948` (folhagem do ramp) | 1 |
| 2 | **Alta** | Cogumelo digital | `create_image_pixen` | "small cluster of 3 bioluminescent digital mushrooms, cyan glow caps with circuit-pattern spots, brown stem, pixel art, 24x18 canvas, transparent background, Digimon forest theme" | Textual: mesma paleta do item 1 + `ramp.bark.hi` (marrom do caule, hex `#c99a5f`) | 1 |
| 3 | **Alta** | Upgrade de água: tileset Wang topdown dedicado (richer que o `water_blob` local de 16 peças) | `create_topdown_tileset` (`mode: standard`) | `lower_description`: "shallow forest pond water, soft ripples, teal-blue tones #193c3e/#124e89/#0099db/#2ce8f5"; `upper_description`: "grass clearing floor, saturated green #63c74d/#3e8948, matching a Digimon World-style forest" | Textual: hex do `GROUND_DAY.water`/`FOLIAGE_DAY` de `forest_v4_palette.js` | 1 |
| 4 | **Média** | Baú aberto/vazio (2º estado, falta hoje — ver `forest-v6/README.md`) | `create_image_pixflux` (img2img, `init_image_strength` ~150) | "the same wooden chest with gold trim, now open and empty, lid tilted back" | `init_image`: `art/map-factory/forest-v6/props/chest_closed.png` (enviado via `get_upload_url`) | 1 |
| 5 | **Média** | NPC parado — guarda-florestal (alternativa/reforço ao plano de reaproveitar `tamer-parts.ts`, ver `FOREST_KIT_GAP.md` §2) | `create_image_pixen` | "a standing forest ranger NPC, 48x64, brown/green ranger outfit, pixel art, front-facing idle pose, Digimon World DS proportions (large head, chibi body), transparent background" | Textual: cita `DIGIMON_SIZE_TABLE.md`/proporção chibi do `ART_STYLE_GUIDE.md` §2.1 (sprites oficiais DWDS) | 1 |
| 6 | **Média** | NPC parado — comerciante/vendedor (2ª variante, mesma lógica do item 5) | `create_image_pixen` | "a standing merchant NPC with a small cart/backpack, 48x64, pixel art, front-facing idle, same chibi proportions as item 5" | Textual, mesma referência do item 5 | 1 |
| 7 | **Média** | Entrada de área secreta — rocha com rachadura brilhante (depende de o game-design confirmar o conceito antes, ver `FOREST_KIT_GAP.md` §2) | `create_image_pixen` | "large mossy boulder with a glowing cyan crack running through it, suggesting a hidden passage, pixel art, 40x36, transparent background" | Textual: mesmo acento cyan dos itens 1–2 | 1 |
| 8 | **Média** | Entrada de área secreta — variante arbusto denso atravessável (2ª opção de conceito, para o game-design escolher) | `create_image_pixen` | "unusually dense dark-green bush, slightly taller than normal tall grass, with a faint path visible behind it suggesting it can be pushed through, pixel art, 32x28, transparent background" | Textual: ramp `FOLIAGE_DAY` tons 1–3 | 1 |
| 9 | **Baixa-Média** | Arena do chefe — motivo de chão danificado (marcas de garra, clareira maior), sem o Digimon em si | `create_image_pixen` | "forest clearing floor tile, 32x32, with deep claw-mark gouges and churned dirt, suggesting a boss fight scarred the ground, matching forest clearing palette" | Textual: `GROUND_DAY.dirt`/`moss` | 1 |
| 10 | **Baixa** | Arena do chefe — conceito visual único do Kuwagamon (**não é o sprite de produção** — produção de criatura precisa de `create_character`, fora do orçamento de 1 crédito/vetado por ADR-011 §4; isto é só para o game-design/fundador visualizar antes de aprovar investir numa criatura completa) | `create_image_pixflux` | "Kuwagamon, a large insectoid Digimon with scissor-claw arms, red and tan carapace, standing in a forest clearing, top-down RPG pixel art concept, single static pose — concept only, not final creature rig" | Textual: cita Digimon oficial (permitido como "identidade completa" por ADR-010), estágio Adult/Champion-dub conforme `bosses.json` | 1 |
| 11 | **Baixa** | Placa com ícone de seta entalhado (variante da `sign_post.png` local, que hoje só tem "!") | `create_image_pixflux` (img2img) | "the same wooden signpost, board now shows a carved directional arrow instead of an exclamation mark" | `init_image`: `art/map-factory/forest-v6/props/sign_post.png` | 1 |
| 12 | **Baixa** | Rocha pequena — 2ª variante (mais achatada, para quebrar a repetição de `rock_small.png`) | `create_image_pixen` | "a small flat mossy stepping-stone rock, 18x10, pixel art, transparent background, same grey stone tones as a forest rock cluster" | Textual: `GROUND_DAY.stone` | 1 |
| 13 | **Baixa** | Ponto de cura — variante de cor (verde, para regiões onde o ciano já está "ocupado" visualmente por água próxima) | `create_image_pixflux` (img2img) | "the same glowing spring/altar prop, glow recolored from cyan to soft green" | `init_image`: `art/map-factory/forest-v6/props/healing_point.png` | 1 |
| 14 | **Baixa** | Grama alta — variante adicional (hoje só `tall_grass_a/b` no v4; uma 3ª quebra o padrão em áreas grandes) | `create_image_pixen` | "a clump of tall forest grass with a slight lean, pixel art, 18x17, transparent background, matching Endesga-32 forest greens" | Textual: `FOLIAGE_DAY` | 1 |

**Total planejado: 14 créditos. Reserva após execução completa do plano: 26 créditos** (acima do mínimo de 10 exigido).

## O que este plano **não** inclui, de propósito

- **Nenhum item de 10–25 créditos** (criatura completa, objeto 8 direções) — vetado pelo ADR-011 §4 sem nova aprovação explícita do fundador. O item #10 (concept Kuwagamon) é 1 crédito e deixa claro que **não é** o sprite de produção.
- **Nenhum retrabalho de água Wang-47** (upgrade do `water_blob` local para 47 máscaras) — fora do orçamento de 1 crédito por chamada (`create_tiles_pro`/`create_topdown_tileset mode=pro` custam mais e não estão na lista permitida de ferramentas de 1 crédito).
- **Nenhuma versão noturna** dos itens novos — o preset noturno do forest-v4 inteiro foi feito por tingimento/paleta própria (`forest_v4_palette.js`), não por gerar cada peça duas vezes; replicar isso para os itens deste plano é trabalho de código local (como o `forest-v6` fez), não uma linha de orçamento PixelLab.

## Limitações

- Nenhum prompt deste plano foi testado — os valores de `init_image_strength`/enquadramento podem precisar de ajuste na prática; isto é a primeira proposta, não um resultado calibrado.
- O 401 do MCP PixelLab significa que **nada neste documento tem uma data de execução confirmada** — depende do operador resolver a autenticação primeiro (ADR-011 "Pendências").
- A ordem de prioridade é uma leitura de game-art cruzando `FOREST_KIT_GAP.md` **[H]**, não uma decisão formal do fundador — o fundador pode reordenar ou cortar itens antes da execução.
