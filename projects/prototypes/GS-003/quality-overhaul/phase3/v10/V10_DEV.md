# forest-v10 no look v9: chão e árvores da clareira-piloto (game-dev)

Branch `quality-overhaul`, servidor `http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&anim=v2&encounters=1` (o `master` e a 5174 não foram tocados). Pacote integrado: `art/map-factory/forest-v10-ground-trees/` (commits fc34af2 e 1fb06d1, que chegaram pelo `git merge master`). Data: 2026-11-10.

## O que mudou

Tudo foi feito no gerador. O `.tmj` não foi editado à mão: `node scripts/map-factory/derive-look-v9.mjs` chama o novo `scripts/map-factory/v10-ground-trees.mjs` depois do P7. O processo é determinístico (hash por posição), e o teste `look-v9 › o derivador é determinístico` continua passando.

| Item pedido | Como ficou |
|---|---|
| 1. Chão | Todas as 646 células de grama do v8 (`fp8_ground_variant_*`) viraram `fp10_ground_variant_0..7`. O sorteio usa um ruído de ~4 tiles somado a um hash: 56% são a variante lisa (0) e o restante se divide entre as variantes com decalque, com peso menor para raiz e pedra. Duas células vizinhas iguais com decalque são trocadas pela lisa. As curvas (trilha/riacho) e o recorte suave (borda da mata) usam o mesmo chão novo por baixo da faixa. A troca vale para o mapa inteiro, não só para a clareira: trocar só dentro da caixa deixaria uma emenda de tom na borda dela. As variantes 8/9 (terra) ficaram de fora, porque o chão de terra é a trilha (renderer de curva) ou o blob. |
| 2. Manchas macro | Criei a camada `ground-macro-overlay` (objetos `macro`, em px do mundo e fora da grade de 32 px). O renderer a desenha no chunk **entre o chão e a faixa das curvas**: a trilha e o riacho ficam por cima da mancha, e a ponte e a face do penhasco também (as camadas de tiles foram separadas em passes). Há 5 manchas (2 olive, 3 shade), 2 delas na clareira, com pelo menos 190 px entre elas e a mesma forma a pelo menos 320 px de si mesma. Para entrar, a mancha precisa ter ≥ 70% de grama embaixo, e algumas são espelhadas. O PNG tem alfa ≤ 50 encostado na borda, o que deixaria uma linha reta no chão; por isso o renderer suaviza 14 px da borda do alfa (`featherAlpha`, em `look.ts`), sem mexer na arte. |
| 3. Grama ↔ terra | Usei o blob-16 `grass_dirt_blob_*` como terra batida em volta da **fogueira** do acampamento: um bloco de 2×3 células (x42–43, y25–27). A trilha principal segue no renderer de curva contínua do v9, sem mudança. Também tentei aplicar em volta da fonte de cura, mas ela encosta na trilha e não sobrou bloco (veja Limitações). |
| 4. Árvores | As 49 árvores comuns do v4 dentro da caixa do P7 (x12–41 × y6–29) viraram as 4 espécies, em 2 tamanhos cada (ancient_thick 4+6, leaning 8+8, tall_narrow 7+5, wide_low 5+6). A espécie segue a silhueta da árvore original (cônica → tall_narrow; redonda → wide_low/ancient/leaning; ancient → ancient_thick grande). Duas árvores iguais nunca ficam a menos de 80 px (o gerador tenta 96 px; no bosque denso a NE, com 10–18 vizinhas, as 8 combinações não bastam). As 7 digitais (palmeira e data_leaf) continuam no lugar. A `base` mantém o `solid` do prop original, então a colisão é a mesma célula de antes (o gate `reach` passa). O `top` vai na camada de copa, por cima do jogador; fica translúcido quando o jogador passa atrás, balança com o vento e entra na máscara das luzes, tudo pelo mesmo caminho das árvores do v4. O `topOffset` reproduz o `topY` do pacote (0,40 × top.h em vez do `overlap` 0,42), e o rim-light não é somado de novo porque as copas do v10 já vêm com ele (`baked`). |
| 5. Decalques | Na clareira foram 11 `leaf_litter_big` e 8 `root_exposed_mossy` (no pé das árvores novas), 7 `mossy_stone_cluster` (na margem do riacho) e 7 `tuft_overlap_big` (na borda de fora da trilha). Nenhum fica em célula sólida, na água ou em zona de encontro. |
| Grade e noite | O chão novo usa a mesma grade do chão do v8 (sat 0,78 / val 0,6), porque a rampa do pacote é a mesma. As árvores usam sat 0,92 / val 0,9, mais leve que a dos props fp8_; com 0,74, a copa nova ficava bem mais escura que a mata do v4. O pacote não tem preset noturno, então a primeira montagem deixava as copas verdes no meio da mata azul. Para isso, `GradeRule` ganhou um campo `night` (só para arte sem preset), que nas copas do v10 puxa para o azul-violeta da noite do forest-v4. |

60/30/10 da caixa: 50,3 / 25,0 / 24,7, igual ao de antes da troca. A regra de massa (`ratio603010`) passou a contar as árvores do v10.

## Capturas (`quality-overhaul/phase3/v10/`)

1920×1080, HUD escondido, mesmas câmeras das capturas `p7_clareira_*`: na visão de jogo o Tamer fica em (29,20); na visão geral (`zoom=1`), em (27,18).

| | Dia | Noite |
|---|---|---|
| Antes (v9), jogo | `v10_antes_dia_jogo.png` | `v10_antes_noite_jogo.png` |
| Depois, jogo | `v10_depois_dia_jogo.png` | `v10_depois_noite_jogo.png` |
| Antes (v9), geral | `v10_antes_dia_geral.png` | `v10_antes_noite_geral.png` |
| Depois, geral | `v10_depois_dia_geral.png` | `v10_depois_noite_geral.png` |

**Zoom no chão** (`zoom=4`, dia): `v10_{antes,depois}_chao_zoom_{clareira-leste,clareira-norte}.png`, mais `v10_depois_chao_zoom_acampamento.png` (terra batida). Cada um tem uma versão `_grade32.png` lado a lado com as linhas de 32 px desenhadas, para mostrar onde a grade estaria. `v10_ref_blob16_trilha_e_blocos.png` é uma referência fora do jogo: como o blob-16 do pacote fica numa trilha de 1 célula e em blocos 2×2 e 3×3.

**Medição de grade** (no script; quanto mais perto de 1, menos grade). Comparo a diferença média de cor entre pixels de arte vizinhos que ficam em lados opostos de uma linha de tile com a mesma diferença dentro do tile. Uma razão longe de 1, para cima ou para baixo, indica uma linha de tile que se destaca (no v8, um anel mais quieto na borda de cada tile).

| Área (zoom=4) | Antes (v9) | Depois (v10) |
|---|---|---|
| clareira-leste (x39–48, y17–22) | 0,54 | **0,87** |
| clareira-norte (x5–12, y2–6) | 0,67 | **0,78** |
| acampamento (x38–47, y23–30) | — (não havia terra batida) | 0,84 |

Os números do "antes" estão em `v10_antes_capture_ground.json`. O `v10_antes_capture.json` foi a 1ª rodada, quando a medição do leste deu `null` por um bug do script (pixel fora do recorte), que já corrigi; as imagens dessa rodada são as mesmas. Os do "depois" estão em `v10_depois_capture.json`.

## Desempenho

Mesmo método do `qo3-capture.mjs`: 600 quadros depois de 120 de aquecimento, Chromium headless, 1920×1080, dpr=1, Tamer em (28,19). Mede o trabalho por quadro no rAF e o render + raster síncrono (`view.render` + `getImageData`). Os valores estão em ms.

| Enquadramento | Antes: trabalho p95 | Depois: trabalho p95 | Antes: render+raster p50 / p95 | Depois: render+raster p50 / p95 |
|---|---|---|---|---|
| jogo, dia | 3,6 | 3,2 | 2,5 / 4,6 | 2,7 / 5,9 |
| jogo, noite | 7,0 | 5,5 | 4,3 / 6,3 | 3,1 / 4,7 |
| geral, dia | 20,7 | 14,7 | 27,3 / 33,3 | 18,9 / 21,1 |
| geral, noite | 23,0 | 17,3 | 29,9 / 38,9 | 27,0 / 34,3 |

Leitura: na visão de jogo não houve regressão; tudo fica dentro do ruído da máquina, que estava compartilhada com o outro game-dev. As manchas macro e a terra batida ficam no cache do chunk, e a mancha suavizada é montada 1 vez por URL. Numa rodada intermediária, a visão geral (`zoom=1`, que é visão de depuração e não de jogo) deu p95 36 ms no trabalho e 48 ms no raster de noite; na rodada final, deu os valores da tabela. Por isso trato a visão geral como ruidosa, sem sinal de piora.

## Gates

- `npm test`: 44 arquivos, **427 testes** passando, incluindo o novo `tests/forest-v10.test.ts` (6 testes: chão sem fp8, variantes vizinhas, manchas em px do mundo e na ordem certa de camada, `featherAlpha`, árvores, decalques). Uma rodada intermediária teve 1 falha no `creator.test.ts` (preset/cor do criador), que passou rodando isolado e na suíte completa seguinte; parece intermitente com a máquina carregada e não tem relação com o mapa.
- `npm run build`: ok.
- `npm run map:validate`: 6/6 PASS, e `validate-map.mjs` no v9 também PASS (layers, tile_ids, asset_keys, reach, placement, wang, species, portals). Os relatórios em `docs/map-factory/validation/` só mudariam a data, então não entram no commit.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## Arquivos (só os meus; nada em `src/ui/*`, `style.css`, `digivice.ts`, `achievements.json`, `main.ts`)

- `scripts/map-factory/v10-ground-trees.mjs` (novo), `scripts/map-factory/derive-look-v9.mjs` (chama o v10), `scripts/map-factory/p7-clareira.mjs` (60/30/10 conta as árvores do v10)
- `src/sim/map.ts` (camada `macro` → `map.macroOverlays`), `src/render/view.ts` (passes do chunk e mancha suavizada), `src/render/look.ts` (`featherAlpha` e `GradeRule.night`), `src/assets/scene-tiles.ts` (`usedKeys` inclui as manchas)
- `src/data/maps/v9/digimon-forest-01.{tmj,aliases,p7-report}.json` (regenerados pelo gerador)
- `tests/forest-v10.test.ts`, `scripts/v10-capture.mjs` (capturas, medição de grade e desempenho)

## Limitações

- **Terra batida pequena e com borda reta.** O blob-16 do pacote não tem canto interno: as peças de borda levam a terra até a borda do tile. Numa célula-"braço" saindo de um bloco, isso vira uma linha reta de 32 px. Aconteceu na 1ª montagem da fogueira e está documentado em `v10_ref_blob16_trilha_e_blocos.png`. Por isso o gerador só aceita células que façam parte de um bloco 2×2 (abertura morfológica). Mesmo assim, a borda de um bloco lê como "retângulo com dentes" a cada 32 px. Com isso sobrou só um bloco de 2×3 na fogueira; na fonte de cura não sobrou bloco, porque ela encosta na trilha e numa zona de encontro. Para áreas de terra maiores e orgânicas, o próximo passo seria um Wang-47 ou um pedido ao game-art de cantos internos. Também daria para fazer a terra batida pelo renderer de curva/mancha (como a lama), mas isso foge do autotile pedido.
- **A troca de árvores é só na caixa do P7.** Fora dela continuam as árvores do v4. Na visão geral dá para ver a diferença de estilo entre o bosque denso a NE (dentro da caixa) e a mata ao lado (fora). Estender a troca para o mapa todo é uma linha no gerador, mas mexe na mata inteira e fica para a decisão do fundador/coordenador.
- **As árvores digitais (palmeira e data_leaf) foram mantidas** como acento "Digimon". Isso é decisão minha [H] e pode ser revertida.
- **Noite das copas do v10.** É um tom aproximado por grade (matiz, tinta e saturação), não um preset noturno pintado. Fica perto da noite do v4, mas não é idêntico. O ideal é o game-art entregar `night/` no pacote.
- **Manchas macro.** São só 2 formas e 5 instâncias no mapa (2 na clareira). A suavização de 14 px da borda é uma correção no renderer para o alfa encostado na borda do PNG, e vale reportar isso ao game-art. Uma mancha shade cai sobre a terra batida da fogueira e a escurece um pouco; deixei assim porque lê como sombra.
- **A medição de grade é um indicador**, não uma prova. As capturas têm props e personagens por cima do chão. O valor depois do v10 ainda fica abaixo de 1 (0,78–0,87), porque o chão tem textura forte dentro do tile e a linha do tile é mais parelha. A diferença visual que conta está nos `_grade32.png`.
- **Desempenho.** Medido em headless numa máquina compartilhada, com variação grande entre rodadas na visão geral. Não medi em GPU real nem no navegador do fundador.
- **Medição de grade sem "antes" no acampamento**, porque a terra batida é nova.
