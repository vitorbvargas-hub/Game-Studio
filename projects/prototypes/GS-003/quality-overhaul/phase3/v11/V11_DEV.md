# forest-v11 no look v9: chão, Wang-47, noite, mirante e árvores no mapa todo (game-dev)

Branch `quality-overhaul`, servidor `http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&anim=v2&encounters=1` (não toquei no `master` nem na 5174). O pacote `art/map-factory/forest-v11-ground/` (commit 97a1fdb) e o `art/src/blob_autotile47.js` chegaram pelo `git merge master` (49b742d). Data: 2026-11-10. Nenhuma geração do PixelLab foi usada.

## O que mudou

Tudo foi feito no gerador, sem editar o `.tmj` à mão. O `derive-look-v9.mjs` agora chama o v10 com `{ dirt: false, treesEverywhere: true }` e, logo depois, o novo `scripts/map-factory/v11-ground.mjs`. O processo é determinístico: rodar duas vezes dá o mesmo arquivo (conferido com `cmp` e pelo teste `look-v9 › o derivador é determinístico`).

| Pedido | Como ficou |
|---|---|
| 1. Chão | As 10 entradas `fp10_ground_variant_N` do tileset viraram `fp11_ground_variant_N`, com os mesmos índices e o mesmo sorteio por ruído. Isso vale para 646 células, para as curvas (chão sob a faixa) e para o recorte suave. A grade é a do chão (sat 0,78 / val 0,6), já que a rampa é a mesma. |
| 2. Wang-47 grama ↔ terra | Portei `enumerateBlob47`/`blob47Index` para o gerador. O teste confere que o porte dá o mesmo índice que o `blob_autotile47.js` do pacote nas 16×16 combinações de bordas e diagonais. Cada célula de terra é resolvida pelos 8 vizinhos. Saiu a abertura morfológica do v10 ("só blocos 2×2"): a mancha pode ter qualquer forma, e só célula solta sai (buraco de 1 célula entra). São **86 células em 5 manchas**: fogueira (9), fonte de cura (12) e 3 trechos de trilha secundária: `rota_secundaria_pedras` em (29,35) com 22, `rota_secundaria_riacho` em (19,5) com 22 e `rota_vau_pedras` em (11,20) com 21. Usam 18 das 47 peças, com **25 cantos internos (entalhes) em 21 células**; o teste exige ≥ 3. Nas trilhas a terra passa **por baixo da faixa**: 51 células que eram da trilha viraram terra (o renderer desenha a faixa por cima de qualquer chão), e as máscaras w47 de 28 células vizinhas da trilha foram recalculadas (o gate `wang` passa). A terra nunca cai em colisão, água, lama ou zona de encontro. |
| 2b. Cor da terra | Na 1ª montagem, a terra com a grade do chão lia como queimado ao lado da trilha. O tile mistura grama e terra, e por isso `GradeRule` ganhou `earth`: pixels de matiz marrom (h < 45° ou ≥ 345°, s > 0,12) recebem a grade da trilha (`fp4_path_`), e a grama do mesmo tile recebe a do chão. À noite a trilha tem arte pintada (forest-v4/night) e a terra não tem. Por isso `earth.night` usa valores medidos: a média do tile de terra cheio dá 54,47,59, contra 51,43,60 da trilha noturna graduada. |
| 3. Copas à noite | `ExtraPack` ganhou `nightFor`: os PNGs das pastas `night/` de um pacote viram o preset noturno das chaves `<nightFor><nome>` de outro pacote. O v11 entra com `nightFor: "fp10_"`, então à noite `fp10_<espécie>_<tamanho>_top` aponta para `forest-v11-ground/trees/night/`, e a `base` continua a diurna. **Saiu o ajuste de cor provisório**: o campo `GradeRule.night` foi removido do `look.ts` e da regra das copas. De dia o pacote v11 não carrega as pastas `night/` nem as pranchas de prova (`preview`, `before_after*`, `tileability_check`, `*_demo`, `*_comparison`); a mesma regra vale no `context.mjs` do validador. |
| 4. Manchas macro | As 5 manchas trocaram para `fp11_macro_patch_*`, nas mesmas posições. O gerador confere que o tamanho do PNG é o mesmo. Medi alfa 0 nos 8 px da borda dos 2 PNGs do v11 (no v10, chegava a 49 na borda), e há teste para isso. **Saiu o feather de 14 px do renderer** (`featherAlpha`, `featheredOf`, `MACRO_FEATHER`): as manchas são desenhadas direto, como os decalques. |
| 5. Mirante | O kit `forest-v9-cliffs` **já estava ligado** desde antes, ao contrário do que diz o README do v11: o `derive-look-v9` troca `fp8_cliff_*` por `fp9c_*` e o relatório lista face a–d, cantos externos e rampa. A laje cinza vinha de duas coisas: o topo `fp9c_cliff_top_blob_*` levava a grade de pedra (`tint #6c5a86`, roxo-acinzentado) e havia uma fileira de grama do v8 no `ground_detail` por cima do topo (a "faixa verde retangular"). Agora as 24 células do topo são `fp11_mirante_top_blob_N`, com a mesma máscara blob-16, e levam a **grade do chão**. A faixa saiu (6 células) e há **16 decalques espalhados** no topo, de 6 tipos (musgo, pedras com musgo, folhas, pedrinhas, folhas em grupo, tufo de borda), para quebrar a repetição da peça `blob_15`. Face, cantos e rampa continuam do v9-cliffs. |
| 6. Árvores v10 no mapa todo | São **469 árvores** comuns do v4 trocadas no mapa inteiro, não só as 49 da clareira. Ficaram 52–66 por espécie e tamanho, e nenhuma combinação igual a menos de 84 px de outra (mínimo medido; o teste exige 80). Todas as **63 árvores digitais** (palmeira e data_leaf) continuam no lugar, não só as 7 da clareira. A base mantém o `solid` do prop, e o teste `look-v9` confere que, fora da clareira, posição e colisão são as mesmas do v8 (só muda a chave). A raiz/folhas no pé das árvores passou a valer no mapa todo (24 folhas em grupo e 40 raízes), sempre dentro do mapa: o teste pegou uma raiz em x = −33 na 1ª rodada. A proporção 60/30/10 da caixa ficou igual: 50,3 / 25,0 / 24,7. |

## Capturas (`quality-overhaul/phase3/v11/`)

1920×1080, HUD escondido, mesmas câmeras do v10 (jogo com o Tamer em (29,20); geral com `zoom=1`). O "antes" é o commit 49b742d (v10 + master), servido de um worktree limpo e temporário na 5192, que já foi derrubado e removido. O "depois" é a 5190.

| | Dia | Noite |
|---|---|---|
| Antes (v10), jogo | `v11_antes_dia_jogo.png` | `v11_antes_noite_jogo.png` |
| Depois (v11), jogo | `v11_depois_dia_jogo.png` | `v11_depois_noite_jogo.png` |
| Antes, geral | `v11_antes_dia_geral.png`, `v11_antes_dia_geral_mata-sudeste.png` | `v11_antes_noite_geral.png`, `…_mata-sudeste.png` |
| Depois, geral | `v11_depois_dia_geral.png`, `v11_depois_dia_geral_mata-sudeste.png` | `v11_depois_noite_geral.png`, `…_mata-sudeste.png` |

Com `zoom=1` o mapa inteiro (56×40) cabe na tela, então a `_mata-sudeste` só desloca a câmera. As duas mostram as árvores novas por todo o mapa.

**Zooms** (`zoom=4`, com `_grade32.png` mostrando as linhas de 32 px, e `v11_lado-a-lado_*.png` com antes | depois):
- **Mirante:** `v11_{antes,depois}_zoom_mirante.png` (dia), `…_mirante_noite.png` (noite) e `v11_lado-a-lado_mirante{,_noite}.png`.
- **Mancha de terra orgânica:** `…_zoom_terra-trilha-vau.png` (a terra alarga a trilha em volta da faixa; é a melhor amostra), `…_terra-trilha-riacho.png`, `…_terra-fonte.png` e `…_acampamento.png` (fogueira), com os respectivos `v11_lado-a-lado_*.png`.
- **Chão:** `…_zoom_clareira-leste.png` e `…_clareira-norte.png` (mesmas caixas do v10).

**Medição de grade** (razão entre a diferença de cor entre pixels de lados opostos de uma linha de tile e a diferença dentro do tile; ~1 = a linha não se destaca):

| Área | Antes (v10) | Depois (v11) |
|---|---|---|
| clareira-leste | 0,87 | 1,06 |
| clareira-norte | 0,77 | 0,91 |
| acampamento | 0,92 | 1,06 |
| terra-fonte | 0,67 | 0,80 |
| terra-trilha-riacho | 0,80 | 1,10 |
| terra-trilha-vau | 0,66 | 0,95 |
| mirante (dia / noite) | 1,21 / 1,16 | 1,17 / 1,13 |

Todas ficaram mais perto de 1. O chão do v11 tem mais contraste dentro do tile (relevo), e a borda passou a ler parecida com o miolo. No mirante a razão é dominada pela face do penhasco, que é uma linha real.

## Desempenho

Mesmo método do v10: 600 quadros depois de 120 de aquecimento, Chromium headless, 1920×1080, dpr=1, Tamer em (28,19). Os valores estão em ms. Fiz 2 rodadas, a 2ª com a ordem invertida (depois → antes), porque a 1ª deu o v11 um pouco acima na visão de jogo. Os arquivos são `v11_{antes,depois}_capture_perf_r1.json` e `v11_{antes,depois}_capture_perf.json` (rodada 2).

| Enquadramento | Trabalho p95, antes → depois (r1 · r2) | Render+raster p50/p95, antes → depois (r1 · r2) |
|---|---|---|
| jogo, dia | 3,4 → 3,9 · 3,6 → 3,2 | 1,9/2,3 → 2,2/2,8 · 2,1/2,9 → 1,9/2,8 |
| jogo, noite | 4,4 → 5,0 · 5,6 → 5,7 | 2,9/3,6 → 3,3/4,7 · 3,0/4,5 → 3,0/4,2 |
| geral, dia | 16,6 → 15,3 · 43,6 → 15,4 | 18,9/21,5 → 19,3/21,4 · 20,3/26,3 → 19,2/22,4 |
| geral, noite | 16,3 → 17,0 · 20,2 → 17,5 | 24,5/35,7 → 22,2/27,1 · 23,4/32,7 → 22,2/26,0 |

Leitura: a diferença entre as rodadas é maior que a diferença entre antes e depois. Na r1 o v11 ficou ~0,3 ms acima na visão de jogo; na r2 ficou igual ou abaixo. Não vejo regressão. A terra e as manchas ficam no cache do chunk, e tirar o feather economiza a cópia do canvas feita por URL.

## Gates

- `npm test`: 45 arquivos, **432 testes** passando, em duas rodadas seguidas (inclui o novo `tests/forest-v11.test.ts`, com 5 testes: porte do Wang-47 igual ao do pacote, terra célula a célula, alfa da borda das manchas, noite das copas sem ajuste de cor, mirante). `tests/forest-v10.test.ts` e `tests/look-v9.test.ts` foram atualizados para o chão `fp11_`, as árvores no mapa todo e a saída do `featherAlpha`. Duas rodadas intermediárias tiveram 1 timeout de 5 s num teste de renderer do `look-v9` (o setup carrega todos os PNGs do pacote, agora ~75 a mais; isolado leva ~1 s). Esse `describe` passou a ter limite de 20 s, com o motivo comentado.
- `npm run build` e `tsc --noEmit`: ok.
- `npm run map:validate`: 6/6 PASS. O v9 validado direto também passa: layers, tile_ids, asset_keys, reach, placement, **wang** (trilha com 343 tiles w47 coerentes depois da terra), species e portals. Os relatórios em `docs/map-factory/validation/` só mudariam a data e não entram no commit.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## Arquivos (só os meus; nada em `src/ui/*`, `style.css`, `digivice.ts`, `main.ts`)

- `scripts/map-factory/v11-ground.mjs` (novo), `scripts/map-factory/derive-look-v9.mjs` (chama o v11), `scripts/map-factory/v10-ground-trees.mjs` (opções `dirt`/`treesEverywhere`, sem `night` nas copas, decalque dentro do mapa), `scripts/map-factory/context.mjs` (ignora as pranchas de prova)
- `src/assets/tiles.ts` (`loadMapFactoryPack(pack, preset)`, `PACK_PROOF_RE`), `src/assets/scene-tiles.ts` (`ExtraPack.nightFor`), `src/render/look.ts` (`GradeRule.earth`; sem `GradeRule.night` e sem `featherAlpha`), `src/render/view.ts` (sem o feather das manchas)
- `src/data/maps/v9/digimon-forest-01.{tmj,aliases,p7-report}.json` (regenerados pelo gerador)
- `tests/forest-v11.test.ts` (novo), `tests/forest-v10.test.ts`, `tests/look-v9.test.ts`, `scripts/v11-capture.mjs` (novo, derivado do `v10-capture.mjs`)

## Limitações

- **O topo do mirante agora emenda tanto com a grama que o platô se lê pela face.** Não vira mais laje, mas de cima também não se destaca como "alto". Faltaria uma borda de topo mais marcada no tile (luz no lábio sul) ou sombra projetada da face; isso fica para o game-art. A planta continua sendo o retângulo de 8×3 do v8: mudar a silhueta mexe em colisão e alcance, e não fiz.
- **A terra ainda lê por célula de longe.** O Wang-47 tirou o "retângulo com dentes" (há cantos internos), mas a borda segue a grade de 32 px, com a geometria de quarto de círculo do pacote. Na visão geral as manchas parecem manchas de pixel, não poças orgânicas. Uma borda de verdade sem grade exigiria um renderer de mancha por campo (como a lama), o que foge do autotile pedido.
- **A cor da terra é uma grade, não arte.** A sub-regra `earth` aproxima a terra do tom da trilha (de dia pela regra da trilha, à noite por valores medidos). Não é um preset noturno pintado: o pacote v11 não tem `night/` para a terra. O ideal seria o game-art entregar `night/` para os `grass_dirt_wang47_*` e `mirante_top_blob_*`, e aí o `nightFor` resolve sem mudança de código.
- **A fonte de cura** ficou com uma mancha de 12 células parcialmente sob a trilha. Ela lê como chão pisado, mas é mais escura que a faixa (a textura do tile de terra é mais escura que a do `fp4_path`).
- **Árvores digitais:** mantive as 63 do mapa, e não só as 7 da clareira, como acento Digimon espalhado (decisão minha [H]). Se a ideia era deixar só as 7, basta incluir `fp4_tree_palm_digital`/`data_leaf` no `TREE_MAP` com filtro fora da caixa.
- **Os 3 trechos de trilha são escolhidos pelo gerador** (o trecho com mais grama livre em volta, ≥ 7 tiles das outras manchas e ≥ 6 da fogueira/fonte), não por um designer. Na `rota_secundaria_pedras` caiu em (29,35), no sul. Para outro lugar, é só mudar `DIRT_TRAILS` ou fixar o ponto.
- **A medição de grade é um indicador**, com props e personagens por cima. A medição de desempenho foi feita em headless numa máquina compartilhada (5174 e 5190 de pé), com variação grande entre rodadas na visão geral. Não medi em GPU real nem no navegador do fundador.
- O README do v11 afirma que o kit `forest-v9-cliffs` "nunca foi ligado". No v9 ele estava ligado (`p7-report.cliffKit`); o que faltava era tirar a grade de pedra do topo e a faixa do v8. Vale corrigir isso no README do pacote (é do game-art, e não editei).
