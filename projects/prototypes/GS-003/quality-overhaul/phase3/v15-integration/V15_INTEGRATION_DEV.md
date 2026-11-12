# GS-003 — Integração v15: Digi Forest v15b + Tamers v13 + regras novas (game-dev, 2026-11-12)

Branch `quality-overhaul` (worktree `workspaces/game-dev/qo`). Motor: Canvas 2D próprio + TypeScript + Vite (sem Phaser).

## Como testar (Chrome)

O servidor 5190 serve o worktree qo (`npx vite --port 5190 --strictPort` em `prototype/world`).

| O quê | URL |
|---|---|
| Jogo novo, do zero (criador → inicial → Digi Forest v15b) | `http://127.0.0.1:5190/?novo=1` |
| Mantendo o save e indo direto para o mapa novo | `http://127.0.0.1:5190/?map=digi-forest-v15b` |
| Trocar o Tamer mantendo o save | `http://127.0.0.1:5190/?criador=1&map=digi-forest-v15b` |
| Mapas antigos (continuam disponíveis) | `?map=digimon-forest-01`, `?map=forest-proof`, `?map=praia`, `?map=vila` |
| Tamers v3 antigos (comparação) | `?tamers=v3` |

[E] Sem save, a URL padrão `http://127.0.0.1:5190/` já abre na v15b. **Com save** o jogo volta ao mapa salvo, como antes. Se o Chrome do fundador já tem save, use `?map=digi-forest-v15b` ou `?novo=1`.

Dentro do jogo:
- O mato de encontro são os tufos. As manchas ficam na entrada sul, na clareira oeste, na margem oeste, no corredor leste, no santuário e perto do portal.
- Os bolsões surpresa ficam no sudoeste (5,27) e no noroeste (8,5).
- O portal é o arco ciano no nordeste: andando até ele, o Mapa-múndi abre com **Viajar** ligado.
- Pelo atalho M ou pelo botão do HUD, o Mapa-múndi abre **só para consulta**.

## O que foi feito

### 0. Proteção
- Master `~/projects/GameStudio`, commit **`1626237`** "GS-003 snapshot arte v13–v15b + diagnóstico". São 733 arquivos de `art/`, `quality-overhaul/`, `docs/` e `research/` do GS-003, sem `node_modules` e sem segredos. Um único nome parecia sensível, `bush_dense_secret.png`, mas é arte. Sem push.
- qo, commit **`0655969`**: `scripts/qa-default-url-p2.mjs`.

### 1. Conversor PixelLab → jogo (`prototype/world/scripts/import-pixellab-map.mjs`)
- **Fontes guardadas** em `art/map-factory/digi-forest-v15b/source/`:
  - `pixellab-export.zip`: `get_map(export="pixellab")`.
  - `anim-waterfall.zip` e `anim-river_shimmer.zip`: download dos objetos animados.
  - `tileset-ea8ba16a-water-grass.json`: metadados Wang.
  - `terrain_grid.txt`: grade de `get_map` em ASCII.
  - `V15B.md` e `layout_v15b.py`.
- [E] O export veio **sem o render do terreno**: o `map-composite.png` é 1×1, porque o mapa nunca foi salvo no Map Workshop. O conversor reconstrói o chão a partir da grade e do tileset Wang água↔grama. Usa grade dupla (um tile Wang centrado em cada vértice), e a borda cai na aresta da célula, como no Map Workshop.
- **Saída:**
  - Formato que o motor já lê: `src/data/maps/digi-forest-v15b.tmj.json` + `.aliases.json` + `src/data/encounters/digi-forest-v15b.json`.
  - PNGs em `art/map-factory/digi-forest-v15b/`: `terrain.png`, 20 objetos, `waterfall_f00..08` e `water_tile`.
- **Terreno:** `terrain.png` recortado por célula (`v15_t_<i>`, via `grid` no pacote de cena, em `scene-tiles.ts`).
- **Objetos:**
  - 896 props com Y-sort pelo pé. O pivô vem do `groundBounds` do Map Workshop (`pivots` no pacote).
  - Inclui 512 árvores, 360 tufos, flores, totem, ruínas, lanternas, fogueira, placa, tronco caído, cristal, cogumelo, portal, cachoeira e pedras.
  - As sombras ovais da arte e a ponte vão para o chão como decalques.
- **Colisão:**
  - Água bloqueia.
  - Tronco de árvore bloqueia 1 célula no pé; idem placa, totem, ruínas, lanternas, fogueira, tronco caído e cristal.
  - Tufos, flores, cogumelo, cachoeira e portal não bloqueiam.
- **Ponte:** a `bridge_wood` da conta é curta e vertical, e o corredor cruza o rio na linha 17 (4 células de água). O conversor gira a arte 90° e repete as tábuas até cobrir a travessia (`bridge_span.png`, remontagem de pixels, nenhuma geração). As 4 células ficam livres.
- **Mato de encontro:** cada célula com tufo `tallgrass_tuft_b` vira área `tall_grass`. São 124 células em 35 faixas. Os 8 grupos "batalha" e os 2 "surpresa" (`surpresa-*`, taxa ×1,25) vêm das manchas do `layout_v15b.py`.
- **Cachoeira animada:** 9 quadros, 110 ms (`animProps`).
- **Água animada:**
  - O tile de água pura desliza por cima das células de água: deslocamento de UV, alfa 0,55, recuado 5 px nas margens para a borda pintada ficar parada.
  - Brilhos de 3 px piscam em 12% das células (`waterAnim`).
- **Sombra oval do motor:**
  - Sob personagens e Digimon: a que já existia.
  - Sob árvores e props: sombra de contato no chão. Ficam sem sombra tufos, flores, cachoeira, portal e cogumelo (`look.shadows.skip`).
- **Filtro cartoon:** saturação +40%, **água limitada a +15%** (matiz 150°–255°), contraste +15%. Fica **assado na arte do mapa** (terreno e objetos) pelo conversor; `--no-cartoon` gera sem ele.
  - Motivo: com `ctx.filter` global não dá para limitar a água a +15%, e assado o custo por quadro é zero.
  - Consequência: personagens e Digimon **não** passam pelo filtro.
- **Dia e noite:** look `v15b`, sem regrade da arte. A noite vem do ambiente (multiply azul + véu + vinheta). Há luzes nas lanternas e na fogueira (com flicker), no totem, no cristal, no cogumelo e no portal, mais a luz do Tamer à noite e vagalumes.
- **Mapa inicial padrão:** `DEFAULT_MAP = "digi-forest-v15b"`, que é também o 1º mapa da Floresta Densa, então o Mapa-múndi leva para ele. O Tamer começa na entrada sul, em (24,34); quem chega pelo teleporte aparece em (43,10), perto do portal.
- **Validador da Map Factory:** entende o recorte em grade e o portal `@worldmap`. `map:validate` passa em 7/7.

### 2. Tamers v13
- **Import:**
  - Os 12 presets do `character_ids.json` foram baixados como ZIP (`/mcp/characters/<id>/download`, o mesmo link do `export_asset`) e importados por `scripts/import-tamers-v13.mjs` para `art/tamers-v13/game/TAMER-0003..0014/`.
  - Cada preset tem 8 rotações, walk 6×8 e idle 4×8, e um `tamer.json` com o pivô medido no pé (18,34).
- **No jogo** (`tamer-presets.ts`):
  - `loadPresets()` passa a carregar os v13 por padrão; preset 1 = **Coragem (TAMER-0003)**.
  - Os 12 aparecem no criador.
  - Walk de 6 quadros e idle animado de 4 quadros (respiração), nas 4 direções do mundo (S/N/W/E).
  - Os bots também usam v13.
  - `?tamers=v3` volta aos antigos.
- **Save antigo:** os ids são os mesmos (TAMER-0003..0014), e a cor de cabelo v3 cai na "original" (`normalizeLook`).

### 3. Regras novas
- **(a) Mapas fechados** (`closeMap` em `sim/map.ts`):
  - Todas as saídas de borda saem.
  - O portal `@worldmap` abre o Mapa-múndi com **Viajar** ligado.
  - Mapa antigo sem portal ganha um no início do Tamer, com anel ciano desenhado pelo motor.
  - Pelo HUD (M / botão), o Mapa-múndi fica só para consulta, com Viajar desligado e o aviso "Para viajar, vá até o portal de teleporte do mapa". `?teleporte=livre` libera para teste.
  - A viagem chega no início `from_worldmap` quando o mapa tem um.
- **(b) Taxa de encontro** (`sim/encounters/roster.ts`, `RATE_PARAMS`, aplicado a toda tabela):
  - Parâmetros: carência de 5–9 passos, taxa base ≥ 0,17, rampa +0,05/passo após 6, teto 0,55, farfalhar vazio 5%, intervalo mínimo de 2 s.
  - [E] **Teste:** média de 3 a 5 s de mato por encontro nas duas florestas com tabela, com o `step` das regras, 400 encontros e passos de 0,32 s.
  - [E] **Captura ao vivo:** encontro no 10º–11º passo de mato (~3,2–3,5 s).
  - Antes: carência de 16–24 passos e taxa de 0,038, ou seja, no mínimo ~5 s e na prática bem mais.
- **(c) Roster em qualquer mapa** (`rosterTable` / `rosterSpawns`):
  - **Roster** = espécies carregadas com visual: 32. GeoGreymon e Drimogemon ficam fora por falta de sprite. Nenhum dos 31 oficiais novos foi adicionado.
  - **Mato:**
    - Bebês: comuns, Nv.1–4.
    - Crianças: incomuns, Nv.3–7.
    - Campeões+: "surpresa", muito raros (peso 0,6), com ×6 nos bolsões surpresa.
  - **Clareiras:** os pontos visíveis sorteiam entre os **fortes** (estágio ≥ 3: Growlmon, Greymon, Garurumon, Angemon, Dorugamon, DoruGreymon, Numemon, WarGreymon), Nv.10–16, andando na clareira.
  - **Pontos visíveis na v15b:** clareira oeste (12,15), margem do rio (20,12), santuário (41,16), santuário sul (38,20). Na `digimon-forest-01`, os pontos dela.
  - Mapas sem tabela (forest-proof, praia, vila): as zonas antigas sorteiam entre o roster não forte.

### 4. Verificação
- [E] `tsc --noEmit` ok.
- [E] `vitest`: **496 testes / 53 arquivos ok**. São 10 novos em `tests/v15-integration.test.ts`. Testes ajustados:
  - `regions` e `feedback1`: mapa novo como 1º da Floresta Densa.
  - `creator`, `save` e `tamer-presets`: fixados nos Tamers v3 com `useTamerSet("v3")`, porque testam as 8 cores de cabelo.
- [E] `npm run build` ok (só o aviso de chunk > 500 kB, que já existia).
- [E] `map:validate` 7/7 PASS. `scripts/encounters/sim.mjs --check` ok.
- [E] **Capturas 1920×1080 na URL padrão** `http://127.0.0.1:5191/` (outro Vite), sem flags, passando pelo criador e pela escolha do inicial. Estado de cada uma em `v15_capture.json`; **0 erros de console e 0 erros de página**.
  - `v15_00_criador_tamers_v13.png`: criador com os 12 v13.
  - `v15_01_mapa_dia.png`: entrada sul, dia.
  - `v15_02_tamer_andando_no_mato.png`: tufos na frente das pernas (Y-sort).
  - `v15_03_encontro.png` e `v15_03b_encontro_luta.png`: Otamamon saindo do mato, espécie que antes não existia nesta floresta (regra c).
  - `v15_04_digimon_forte_clareira.png`: forte visível na clareira oeste.
  - `v15_05_mapa_noite.png` e `v15_05b_noite_fogueira.png`: noite pelo mesmo campo de Configurações → Tempo do dia.
  - `v15_06_cachoeira_dia.png`.
  - `v15_07_mapa_mundi_pelo_portal.png`: andando até o arco, Viajar ligado.
  - `v15_08_mapa_mundi_pelo_hud.png`: só consulta.
  - O roteiro está em `prototype/world/scripts/v15-capture.mjs`. Ele teleporta o Tamer entre os pontos para não andar o mapa inteiro; o encontro e o portal são feitos andando.
- 5190: servindo o qo. A 5191 foi encerrada.

## O que ficou de fora / limitações
- **`river_shimmer` fora do import.** [E] O sprite e os 9 quadros são um bonequinho branco (cara e corpo), não um brilho de água; no jogo parecia um Digimon parado no rio. A água anima pelo motor. Pendência para o game-art: refazer o brilho.
- **Ponte:** a arte original é curta e vertical. O vão horizontal é uma remontagem dela, não arte nova. Se o fundador quiser uma ponte "de verdade", é pedido para o game-art.
- **Filtro cartoon** assado só na arte do mapa; personagens e Digimon sem filtro. Se for preciso global, dá para pôr `filter` no canvas, mas aí a água passa de +15%.
- **Borda do rio em degrau** (vem do terreno da v15). A água não tem transição suave: é a grade do PixelLab.
- **12 células de mato** (tufos) ficam atrás de troncos, sem acesso. São só enfeite: não sorteiam porque o Tamer não chega lá.
- **Mapa-múndi por região:** a Floresta Densa leva para a v15b. A `digimon-forest-01` e a `forest-proof` são da mesma região, então só entram por `?map=`. A lista "Selvagens" do painel ainda é a do `regions.json`, não o roster (regra c).
- **Tamers v13:** só a cor original de cabelo (o recolor do game-art não foi rodado). O mundo usa 4 direções; as diagonais foram baixadas, mas não são desenhadas.
- **Fortes visíveis** usam o comportamento do ponto (ignorar, parado, perseguir no santuário) e são lutáveis. Nv.10–16 contra uma parceira inicial é luta perdida, de propósito ("fortes").
- **Gasto PixelLab:** 0 gerações. Só `get_map(export)`, `get_map`/`view_map` (leitura), `export_asset` e downloads.

## Commits
- master `1626237`: GS-003 snapshot arte v13–v15b + diagnóstico.
- qo `0655969`: `scripts/qa-default-url-p2.mjs`.
- qo `69b9487`: integração v15 (conversor, mapa, Tamers v13, regras a/b/c, testes).
- qo: o commit seguinte ao `69b9487` (capturas e este relatório; o hash está no `git log` da branch).
