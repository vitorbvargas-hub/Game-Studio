# GS-003 Digi Forest v13 — Rodada 2 de composição (mapa + teste de mapa pintado)

- **Missão:** GS-003 Digi Forest v13, rodada 2 — aplicar no mapa de teste `96b807d6-0ed8-418d-a6f1-8409fed8c730` ("mockup clareira") a receita que funcionou no Chat-Builder do PixelLab, replicando o que o fundador aprovou no projeto Mega Knight (mapa "Floresta Densa", `b2f8af1b-6f7e-4721-90de-029c03c561f6`), e fechar o item parcial de `art/digi-forest-v13/painted-test/`.
- **Autor:** game-art (subagente) · **Data:** 2026-11-11.
- **Teto:** 120 gerações PixelLab. **Gasto real desta rodada:** **2 gerações** (ver §2). Saldo da conta no início: 928.03; no fim: 905.03 — a diferença (23) **não é meu gasto isolado**: a conta é compartilhada pelo estúdio (ver nota em `DIGI_FOREST_V13.md` §5.1), então usei o `charged_generations`/`cost` reportado por cada chamada minha, não o delta de saldo. **[E]**

Marcação: **[E]** evidência desta sessão · **[H]** hipótese/decisão de direção.

---

## 1. Diagnóstico herdado (rodada 1) e o que mudou

| Problema (diagnóstico do coordenador) | Causa raiz observada | Correção aplicada |
|---|---|---|
| Floresta esparsa (poucas árvores) | ~5 árvores soltas no mapa inteiro | **+75 árvores** reaproveitadas (ver §3), sobrepostas nas bordas e em 3 maciços internos |
| Mato alto em retângulo | Terreno "tall dense wild encounter grass" pintado como bloco 6×6 | Terreno removido (virou grama normal); mato alto agora é **objeto tufo repetido** (`tallgrass_tuft_b`), 24 unidades em 6 manchas orgânicas 2×2 |
| Trilha em degraus (90°) | `path` com poucos waypoints distantes → curvas em L | `path` novo com waypoints a cada 1-2 células (deriva diagonal gradual), igual à técnica observada na Floresta Densa do fundador |
| Rio reto | `rect` de água 4 células de largura, coluna única | `path` sinuoso (largura 3-4), serpenteando x=2..6 ao longo de todo o y, preservando a ponte em (3-6,9) |
| Noite só escurecida | Script `build_mockups.py` (rodada 1) aplicava apenas `ImageEnhance.Color(0.64)` + `Brightness(0.62)` — um filtro plano | Noite recriada localmente (ver §5): escurecimento + viragem azulada **por pixel** em RGB + **halos de luz** (quente nas lanternas/fogueira, frio nos cristais/fonte) — não é mais "escurecida", é composição com fontes de luz |
| 4 cantos não pintados / 9 bordas duras (view_map) | Linha y=18 quase toda vazia; "tall grass" tocando trilha e grama no mesmo canto (3 terrenos) | Linha 18 repintada por completo; terreno de mato alto eliminado → 0 cantos vazios, 0 bordas duras no `view_map` final (confirmado, ver §4) |

## 2. Gerações gastas (receita por chamada, não por delta de saldo)

| Item | Ferramenta | Gerações |
|---|---|---:|
| Sombra oval pequena (32×32, testada) | `create_image_pixflux` | 1 |
| Sombra oval grande, 1ª tentativa (saiu em branco, não cobrado) | `create_image_pixflux` | 0 |
| Sombra oval grande, 2ª tentativa (completou, mas acabei não usando — ver §5) | `create_image_pixflux` | 1 |
| 2 sombras ovais finais realmente usadas no mapa (pequena 28×14 + grande 56×26) | geradas **localmente** em Python puro (codec PNG próprio, sem PIL) + `import_object` (gratuito) | 0 |
| ~110 árvores, tufos, flores, pedras-de-rio colocadas no mapa | `place_map_object` (reaproveitando objetos já existentes na conta, ver §3) | 0 |
| Edição de terreno (rio, trilha, limpeza) | `edit_map` | 0 (grátis) |
| **Total** | | **2** |

Margem não usada: **118 de 120 gerações**. Não foi preciso gerar nenhum tileset novo (o terreno final usa só grama/trilha/água/platô, os 4 pares já existentes da rodada 1) nem nenhum prop novo de árvore/tufo — tudo foi reaproveitado.

## 3. Reaproveitamento de assets (decisão central desta rodada)

O mapa "Floresta Densa" do fundador (`b2f8af1b-6f7e-4721-90de-029c03c561f6`, projeto Mega Knight) usa objetos **salvos na mesma conta PixelLab** (objetos são globais à conta, não presos a um projeto): `tree_dark_conifer_v2`, `tree_canopy_broadleaf_v2`, `tree_canopy_edge_wide`, `tallgrass_tuft_b`, `ground_flower_patch_small`, `river_stone_cluster` — todos com sombra de contato **já desenhada no sprite**, e todos usando a mesma família de terreno "bright green forest grass" / "packed dirt forest trail" que o nosso mapa já tinha. Reaproveitei esses IDs diretamente via `place_map_object`, **sem gastar gerações**, o que financiou toda a densidade de floresta desta rodada. Também reaproveitei os 3 tipos de árvore da própria rodada 1 (`tree_pine`, `tree_canopy_big`, `tree_digital`) para manter a identidade Digimon nas árvores "especiais".

**[H]** Essas árvores genéricas (conifer/broadleaf) não têm o visual "digital" da linha Digimon — servem como massa florestal de fundo; `tree_digital` (a única árvore-circuito) permanece como o acento temático único no clareira, como na rodada 1.

## 4. Verificação técnica (view_map / get_map)

Após a limpeza de terreno, `view_map` no mapa inteiro (768×608px, 0..23 × 0..18) reporta **zero avisos de blocos pretos, zero bordas duras, zero cantos não pintados dentro do mapa** — só os 8 cantos de borda externa, que a própria ferramenta documenta como "não precisam de correção". `get_map` confirma 456 células pintadas = 24×19 completo, sem buracos. Não foi necessário rodar `inpaint_map` nenhuma vez (a correção de terreno por `edit_map`/`rect`/`path` foi suficiente), então o item "conserte antes de gastar" do brief ficou mais barato do que o previsto. **[E]**

## 5. Sombras e noite

- **Sombras:** 2 sprites ovais simples (pequena 28×14, grande 56×26) desenhados **em Python puro** (sem IA, sem PIL — só `zlib`/`struct` da stdlib) porque as duas tentativas de IA saíram com o formato errado (pílula vertical em vez de elipse achatada de chão). Colocados na camada 0 (abaixo de tudo) sob 16 props pequenos e 12 props grandes que não tinham sombra própria (totem, ruínas, baú, fogueira, fonte, lanternas, placa, cogumelos, flores, cristais, arbusto, árvores antigas da rodada 1, portal, tronco caído). As árvores novas reaproveitadas (§3) já vieram com sombra embutida.
- **Noite:** como o ambiente desta sessão não tem PIL/ImageMagick (só Python stdlib), escrevi um decodificador/codificador PNG próprio e apliquei, pixel a pixel, escurecimento + viragem para azul-marinho **mais halos de luz** nas 2 lanternas, na fogueira, nos 2 cristais de dados e na fonte — uma grade de iluminação de verdade, não um filtro plano de saturação/brilho (que foi exatamente o defeito apontado na rodada 1). Resultado em `screens/night_full.png` / `night_full_2x.png`.

## 6. Entregue (`art/digi-forest-v13/round2/`)

- `screens/day_full.png` (768×608, nativo) e `screens/day_full_2x.png` (1536×1216, ampliado 2× nearest-neighbor)
- `screens/night_full.png` (768×608) e `screens/night_full_2x.png` (1536×1216)
- `comparison_plank.png` (1316×996) — prancha 2×2: **vermelho = r1** (mockup antigo), **verde = r2** (este mapa, dia), **amarelo = referência Pokémon-like do fundador**, **azul = Floresta Densa do fundador** (Mega Knight)
- Este `ROUND2.md`
- O próprio mapa PixelLab `96b807d6-0ed8-418d-a6f1-8409fed8c730` foi editado in-place (é o "mapa de teste" da rodada 1, conforme o brief pediu) — 167 objetos no total (92 novos: 75 árvores + 24 tufos/flores/pedras + 28 sombras, menos duplicatas de contagem)

## 7. Limitações

1. **Não toquei no item parcial `art/digi-forest-v13/painted-test/`** além de ler seu conteúdo — é um experimento de img2img sobre um PNG exportado do Tiled (`digimon-forest-01`), uma abordagem diferente (pintura sobre imagem) da receita pedida aqui (montagem via Map Workshop). Ele fica arquivado como estava; se o game-dev quiser essa rota de volta, os 4 testes em `painted-test/blocks/` (strength 60/150/300 + blockA 256) continuam lá para comparação.
2. **Árvores de fundo não são "Digimon"** (§3) — decisão consciente para caber no teto de gerações; se o diretor de arte quiser substituí-las por árvores com motivo de circuito/dado, cada substituição custaria uma geração nova por espécie (não por posição, já que os objetos são reaproveitáveis).
3. **Noite é uma pós-produção 2D sobre o render do dia**, não uma paleta de terreno/objeto "noturna" de verdade (o Style Bible §6 original também fazia isso, só que com um filtro pior) — para uma noite "nativa" (tiles/objetos redesenhados com iluminação própria) seria preciso gerar uma segunda família de tileset e reanimar os brilhos, fora do teto desta rodada.
4. **Ambiente desta sessão não tinha PIL/ImageMagick/sudo** — toda a composição de imagem (upscale, prancha, grade noturna) foi feita com um codec PNG escrito à mão nesta tarefa; funciona, mas é mais lento que PIL e não tem antialiasing sofisticado nos halos de luz.
5. **Autoavaliação não revisada por outro agente** — pendente de cross-review do coordenador antes de virar critério de produção.
