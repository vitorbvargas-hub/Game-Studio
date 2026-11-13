# FASE5_LINK_A — Etapa 6, Comando 5: integração do Link A (Método ChatGPT)

- **Autor:** game-dev (subagente C5), 2026-11-13. Fiz isto sozinho, sem acionar outros agentes.
- **Documentos que prevalecem:** `COMANDO_ETAPA6_C5_LINK_A.md`, `ADR_ETAPA6_DECISOES_FUNDADOR.md` e as decisões do coordenador no brief (água A por padrão, grama P-ii, Tamer e Digimon de pose única como placeholder).
- **Link A rodando:** http://127.0.0.1:5191, com build e preview reiniciados no fim. O Link B continua na 5192 (build refeito, visual idêntico, ver §7) e o C na 5193, sem alteração.
- **Commits locais** na branch `lab/etapa6`, worktree `workspaces/game-dev/lab-etapa6`:
  - `63351a5`: Link A;
  - `f2d4e6e`: captura do `?demo=evo`.

  Não fiz push nem deploy.
- **Créditos do PixelLab: 0.** Não chamei nenhuma ferramenta do PixelLab.
- **Marcação:** [E] = medido nesta sessão; [H] = hipótese.

---

## 1. Resumo

1. **[E] Mapa próprio `lab-a-chatgpt`, de 40×30 tiles de 32 px**, montado só com arte A:
   - grama P-ii variada em manchas;
   - planalto de floresta com penhasco de 2 faces e caverna;
   - riacho que vira cachoeira, cai num lago e segue como rio;
   - ponte com corrimão;
   - santuário digital com marco, Digi-Egg, cápsula, cristais e antena;
   - cabine telefônica e terminais;
   - 455 props de vegetação e objetos;
   - **nenhuma trilha marrom**: os corredores são grama aberta, ladeada por flores e arbustos.
2. **[E] Tamer A:** os 2 presets (cabelo preto e azul) estão no criador. A vista sul vale para as 4 direções, sem caminhada, e o rótulo do criador diz "placeholder".
3. **[E] Digimon A** nos encontros e no mundo, no lugar dos sprites DS. Espécie, estágio e stats não mudam.
   - Com arte A: Koromon, Agumon, Greymon, WarGreymon, Palmon e Betamon.
   - Decorativos visíveis no cenário: MetalGreymon, Kuwagamon, Betamon e Palmon.
   - O Koromon A (linha do Agumon A) é o parceiro padrão.
4. **[E] Jogabilidade:**
   - movimento WASD nas 4 direções, com a câmera seguindo;
   - colisão com penhasco, água, floresta, árvores, pedras e estruturas;
   - ponte atravessável;
   - Y-sort, com o corrimão da frente por cima do Tamer;
   - água e cachoeira animadas;
   - encontros reais na grama alta e combate no mapa;
   - **60 qps estáveis**.
5. **[E] O Link B não mudou visualmente.** A diferença de pixels entre o build anterior e o novo fica no nível do ruído das animações (§7). O `qo` está limpo em `3289e32`.

## 2. Por que este layout (decisão registrada)

Avaliei três bases:

| Base | Problema |
|---|---|
| O mapa-piloto do B com a arte A por cima | O chão do B é um `terrain.png` pintado inteiro pelo PixelLab, cortado por célula. Não existe uma grade de terrenos para trocar pela arte A. Seria preciso redesenhar tudo do mesmo jeito, e o resultado copiaria a composição do B (o C5 §2 pede identidade própria). |
| `mapa_demo_40x30.json` | É só um esboço: grama, uma faixa de água e 8 árvores. Não tem penhasco, ponte, santuário nem POIs. |
| **Mockup 03 (escolhido), adaptado para 40×30** | Tem a composição de referência do Método A: cachoeira no centro-alto caindo do penhasco, rio descendo, ponte de madeira atravessando o rio, santuário e estruturas digitais a leste e caverna no penhasco. |

As condições do Link B foram mantidas (§6.3): mesmo tamanho, tile, look, câmera, controles, tabela de encontros e número de POIs.

O layout é uma grade de legenda em `scripts/lab/build-lab-a.mjs`. Ele é **determinístico** (hash, sem `Math.random`): rodar de novo dá o mesmo mapa. Para editar, basta mudar os retângulos ou corredores e rodar o script.

## 3. Arquitetura

O motor é o mesmo do laboratório (Canvas 2D próprio, sem Phaser), e a variante continua sendo escolhida no build (`VITE_LAB_VARIANT=a`). Tudo o que é novo só entra em ação no build A ou com o mapa A. Nos builds B e C os globs `@lab-assets/art|digimon` ficam vazios.

| Peça | O que faz |
|---|---|
| `scripts/lab/build-lab-a.mjs` (novo) | Lê `metodo-a-v2/game-ready` (manifest) e gera quatro saídas: (1) `etapa6-lab/lab-assets/a/art/` com 72 PNGs A copiados 1:1, mais recortes sem redimensionar (quadros da cachoeira e da espuma; tabuleiro e corrimão da frente da ponte); (2) `lab-assets/a/tamer/<id>/` com o sul valendo para N/W/E; (3) `lab-assets/a/digimon/CREATURE-*/` com o retrato como pose; (4) `src/data/maps/lab-a-chatgpt.{tmj,aliases}.json` e `src/data/encounters/lab-a-chatgpt.layout.json`. |
| Água A | Wang 16 grama↔água da prancha (`transicao_grama_agua_wang16`, recorte em grade). A célula de água pura usa `agua_a_base`, com o deslocamento do motor (`waterAnim`) por cima. |
| Colisão | Água pelo tile (`solid`), penhasco pelo tile, floresta por retângulos `collision`, árvores, pedras e estruturas por prop sólido. |
| `src/assets/tiles.ts` | Nova função `loadLabArtPack()`, com glob próprio em `@lab-assets/art/**`. |
| `src/assets/scene-tiles.ts` | `ExtraPack.root` passa a aceitar `"lab-assets"`. `waterAnim.keys` é opcional (regex da chave de chão que conta como água). |
| `src/render/view.ts` | (1) `drawWaterScroll` respeita `waterAnim.keys` quando ele existe; sem ele, a regra antiga, usada pelo B. Isso era necessário porque no mapa A penhasco e floresta também são sólidos e não podem receber água correndo. (2) `ENC_GRASS_RE` aceita `la_enc_`. O B não tem nenhuma chave com esse prefixo, então nada muda para ele. |
| `src/assets/lab-creatures.ts` (novo) | Visual de mapa de pose única: idle = walk, norte e sul na mesma pose, leste espelhado do oeste, `mapScale` 1 (tamanho nativo E5, D13). Sem attack/hurt de mapa; o motor usa o avanço procedural, como já faz com os selvagens DS que não têm esses quadros. |
| `src/world/lab-a.ts` (novo) | `withWaterB()` (opção `?agua=b`) e `labAStorage()` (slot de save próprio, §6.4). |
| `src/main.ts` | Só ramos do Link A: mapa padrão `lab-a-chatgpt`; catálogo `{...DS, ...A}` (vazio fora do A); `?agua=b`; texto da faixa do Link A; slot de save. |
| `src/world/regions.ts`, `src/sim/encounters/{table,lab-table}.ts` | Registram o mapa e a tabela. A tabela é a mesma da v15b (espécies, raridades, níveis, taxas e comportamentos); só a geometria muda (`relayoutEncounterTable`). |
| `scripts/map-factory/context.mjs` | O `map:validate` agora reconhece `root: "lab-assets"`. |
| `scripts/lab/render-lab-a-map.mjs`, `capture-lab-a.mjs`, `diff-png.mjs` (novos) | Renderização off-screen do mapa inteiro, capturas e vídeo via Chromium headless + CDP, e diff de pixels. |
| `tests/lab-a.test.ts` (novo, 7 testes) e `tests/regions.test.ts` (ajustado) | Cobrem colisão, ponte, alcance, tabela, `?agua=b`, pose única e o slot de save. |

**Como reproduzir:**
```bash
cd workspaces/game-dev/lab-etapa6/projects/prototypes/GS-003/prototype/world
node scripts/lab/build-lab-a.mjs                      # mapa + arte A
VITE_LAB_VARIANT=a npx vite build                     # → dist-lab-a
npx vite preview --outDir dist-lab-a --port 5191 --strictPort --host 127.0.0.1
NO_PROXY=127.0.0.1 node scripts/lab/capture-lab-a.mjs # capturas (o ambiente tem NODE_USE_ENV_PROXY: sem NO_PROXY o fetch ao DevTools passa pelo proxy e falha)
```

**Parâmetros de URL:**
- `?agua=b`: água e cachoeira do Link B no mapa A.
- `?demo=evo`: parceiro um nível antes da evolução, XP ×25 e save à parte. É o atalho que já existia e vale para os 3 links (o equivalente pedido para `?partnerlv=15`). Medido no A: Koromon nível 7, que evolui no 8 (`a_40_*`).
- `?time=12:00`: fixa a luz.
- `?novo=1` e `?criador=0` funcionam como no jogo.

## 4. Assets A realmente usados (72, lista em `lab-assets/a/art/_USADOS.json`)

| Categoria | Assets |
|---|---|
| **Terreno** | `grama_02` a `grama_07`; `transicao_grama_agua_wang16`; `agua_a_base`; `desnivel_topo_grama_01`; `borda_mato_01`; `penhasco_face_01`, `_02` e `_04` (o `_04` só onde o penhasco toca o lago) |
| **Água** | `cachoeira_a` (8 quadros, 90 ms); `espuma_a` (8 quadros, 120 ms) |
| **Vegetação** | Árvores: `arvore_copa_redonda_01` a `03`, `arvore_grande_01` a `03`, `arvore_grande_moita`, `arvore_cerejeira`, `pinheiro`. Arbustos: `arbusto_florido`, `arbusto_redondo_01` e `03`. Flores: `flores_*` (8), `planta_flor_laranja_01` e `02`. Grama alta: `tufo_grama_01` a `04`, `moita_01` a `04`. Outros: `cogumelos`, `toco`, `tronco_caido` |
| **Objetos** | `santuario_digital`, `marco_digital`, `digi_egg_pedestal`, `capsula_dados`, `cristal_dados`, `antena_digital`, `cabine_telefonica`, `terminal_digital`, `caixa_dados_azul`, `placa_digital`, `placa_seta`, `poste_tocha`, `entrada_caverna`, `bau`, `caixote`, `barril`, `cerca_baixa`, `pedra_musgo_01` e `02`, `pedra_ocre`, `ponte_secao_corrimao` (tabuleiro no chão e corrimão da frente no primeiro plano) |
| **Personagens** | `tamer_a_cabelo_preto` e `tamer_a_cabelo_azul`. Digimon de espécies do jogo: `koromon_retrato_A` (0005), `agumon_retrato_A` (0006), `greymon_retrato_A` (0007), `wargreymon_retrato_A` (0016), `palmon_retrato_A` (0107), `betamon_retrato_A` (0108). Decorativos: `metalgreymon_retrato_A`, `kuwagamon_retrato_A`, `betamon_retrato_A`, `palmon_retrato_A` |

**Não usei, de propósito:**

| Asset | Motivo |
|---|---|
| `grama_01` | Listras verticais repetidas (LACUNAS §8) |
| `grama_flores` | Tile mais escuro que vira um quadrado destacado na grama (visto no 1º render) |
| `penhasco_face_03` | Última linha clara que vira uma faixa (visto no jogo) |
| `terra_clareira` | Trilha vetada |
| `ponte_tabua_*` | Tábuas para travessia N–S; a ponte deste mapa é L–O |
| `margem_agua_*` | Só existe a orientação "grama em cima" |
| `kunemon_retrato_A` | Desenhado como abelha, não como a larva oficial (LACUNAS §5.3) |
| Rotações e walk da prancha 05 | Borradas, sem norte; o "walk" não tem passada |
| `arvore_copa`, `cerca_01` a `03`, mourões, `bandeira`, `portal_madeira`, `terminal_dados`, `dispositivo_dados`, `caixa_digital`, `rolo_corda`, `digi_egg_06` | Sobraram por composição. Ficam disponíveis. |

## 5. Placeholders (todos marcados no jogo ou nos dados)

| Item | Situação |
|---|---|
| Tamer A | Só a vista sul, usada em S/N/W/E. Sem caminhada: desliza parado. O criador mostra "placeholder… [ESTÁTICO — sem caminhada, placeholder]" e a faixa do Link A repete o aviso. Tamanho nativo de 41 px no PNG de 48×48, sem redimensionar (D13). |
| Digimon A (6 espécies) | Pose única: idle = walk, norte/sul na mesma pose, leste espelhado. O nome do manifest diz "pose única, placeholder". Sem quadros de golpe ou dano; o avanço procedural do motor cobre isso. |
| Espécies sem arte A no Link A | Aparecem com o sprite DS normal (ex.: Numemon, Floramon, Garurumon, Patamon, DoruGreymon) e na prévia da linha evolutiva do criador. Isso é esperado: o pacote A só tem 9 espécies. |
| Decorativos (MetalGreymon, Kuwagamon, Betamon, Palmon) | Props estáticos com colisão. Não são espécies novas, não têm regra e não estão na Database. |
| Cachoeira A | Faixa de rolagem 32×64, em duas colunas. Arte "baixa" segundo o game-art (sem rocha nem bacia). |

## 6. Jogabilidade (resultados)

### 6.1 Medições [E] (`fase5-link-a/capture-report*.json`)

| Teste | Resultado |
|---|---|
| Movimento WASD | O spawn (9,5; 15,75) mudou depois de S/O/N/L (`a_04` a `a_07`), e a câmera seguiu. |
| Colisão com o penhasco | Saindo de (9,5; 11,5) e segurando W por 2,5 s, parou em y = 9,00, na borda da linha 8 sólida. |
| Colisão com a água | Saindo de (16,5; 16,5) e segurando W por 2,5 s, parou em y = 13,06, antes do lago. |
| Ponte | Saindo de (19,5; 20,5) e segurando D, atravessou até x = 27,63. As 4 células da ponte não são sólidas (teste unitário). |
| Alcance (teste) | Spawn chega ao santuário, à cabine e à grama alta, e só pela ponte. O planalto é inalcançável. |
| Y-sort | Props e entidades ordenados pelo pé. O corrimão da frente fica em `objects_above` (fica translúcido quando cobre o Tamer). A ponte em si é decal do chão. |
| Água animada | Deslocamento do tile A (8 px/s, α 0,6) e cachoeira/espuma por quadros (`a_13` e `a_13b`). |
| Encontros | Ao forçar um encontro (o gancho de debug que já existia), um Floramon/Patamon selvagem **saltou da grama** e houve combate no mapa com dano no log (`a_20`, `a_21`). Os Greymon A "Digimon forte" aparecem nos 4 pontos visíveis e atacam: em `a_14` o Greymon do santuário derrubou o Koromon nível 1. Andando ~11 s na grama não saiu nenhum encontro aleatório; a mecânica é a mesma do B. |
| FPS (rAF, 5 s parado e 4 s andando) | **60,1 fps** nos dois casos; quadro máximo 16,8 ms, p95 16,8 ms. O HUD marca "60 qps". |
| Erros de console | 0 em todas as rodadas. |

### 6.2 HUD sem cobrir o personagem

O problema existe no B: o spawn fica na linha 28,5 de 30, a câmera encosta na borda sul e a hotbar flutuante (golpes e "NÍVEL") cobre o Tamer. Dá para ver em `integridade_B_novo.png` e já estava na referência da C4.

Corrigi **só no Link A, pelo desenho do mapa, sem código**:
- o spawn fica no centro-oeste (9; 15);
- a floresta da borda ocupa as linhas 26 a 29 e as colunas 0–1 e 38–39;
- o planalto ocupa as linhas 0 a 5 a oeste;
- o terreno andável vai só até a linha 25.

Com isso a câmera nunca encosta o Tamer na faixa da hotbar ou da barra inferior, e ele fica sempre acima da hotbar em todas as capturas. Não mexi na câmera do motor, para não alterar o B.

[H] Uma correção geral (folga de câmera abaixo da área visível) fica como sugestão para o B e o jogo, com decisão do coordenador.

### 6.3 Condições comparáveis com o B

| Item | A × B |
|---|---|
| Tamanho, tile, câmera e zoom | 40×30, tile 32, look `zoomMul` 1,5 e as mesmas sombras ovais e luz ambiente da v15b nos dois |
| Controles | Iguais |
| Tabela de encontros | A mesma da v15b (validada pelo `validateTable`) |
| POIs | Cerca de 10 no A (cachoeira, lago, ponte, caverna, santuário, marco, Digi-Egg, cabine, baú, placa) contra cerca de 9 no B |
| Comparação visual | `comparacao_AxB_*.png` (5 posições) usa células livres nos dois mapas (conferido na colisão dos dois `.tmj`), com semente, horário e câmera iguais |

### 6.4 Save

O Link A grava num **slot próprio** (prefixo `lab-a-c5:` no localStorage da 5191). Assim ele não reabre o save antigo daquele endereço (mapa recortado e Tamer v13 da C4) e não apaga nem sobrescreve nada. O save do jogo principal não foi tocado.

## 7. Prova de integridade

| Verificação | Resultado |
|---|---|
| **Link B, visual** | Mesma URL determinística (`?novo=1&criador=0&seed=4242&time=12:00&encounters=0`) no build anterior (cópia do `dist-lab-b` de a944e80, servida temporariamente na 5194 e depois encerrada) e no build novo (5192). Cada um foi capturado 2 vezes. **Antes × antes: 464 px (0,05%). Antes × novo: 464 px (0,05%). Antes (repetição) × novo: 8 px (0,001%).** Todas as diferenças estão no anel pulsante do minimapa, num vaga-lume e no contador, ou seja, animação. Diffs em `integridade_B_diff_*.png`; dados em `integridade.json`. |
| Link B, bundle | 0 PNG do Método A no `dist-lab-b`. |
| Link B, referência da C4 | `integridade_B_referenciaC4_x_novo.png` mostra o mesmo fluxo (criador → Koromon → mundo) lado a lado com a referência da C4. Mesmo mapa, HUD e personagens. A escala da captura antiga é outra (viewport diferente), então a prova por pixel é a da linha anterior. |
| `qo` | `git status` limpo (0 linhas), HEAD `3289e32`, não aberto para escrita. |
| Database, saves do jogo, mapa v15b original | Não tocados. O B segue no recorte `lab-piloto-v15b`, sem alteração. |
| `tsc --noEmit` | Sem erros. |
| `vitest run` | **503/503** (os 496 de antes + 7 do `lab-a.test.ts`), em `fase5-link-a/vitest.log`. Uma rodada intermediária, com Chromium e 4 servidores ativos, teve 9 timeouts de 5 s em testes de HUD/Digivice, o mesmo sintoma registrado na C4 §6. As duas rodadas seguintes passaram inteiras. |
| `map:validate` | Rodei com `--no-write` (não reescreve relatórios versionados). **PASS** em `lab-a-chatgpt`, `lab-piloto-v15b` e `digi-forest-v15b`, em todos os gates. |
| Link C | Build não refeito; continua o da C4 na 5193 (o C5 §5 manda não desenvolver o C ainda). |

## 8. Evidências (`etapa6-lab/fase5-link-a/`)

| Arquivo | O que é |
|---|---|
| `mapa_completo_lab-a_1x.png`, `_2x.png` | **Mapa completo**, renderizado off-screen na ordem do motor (chão → sombras → props por Y → primeiro plano), sem personagens nem luz |
| `mapa_completo_lab-a_colisao.png` | O mesmo mapa com a colisão sobreposta: vermelho = tile ou floresta, amarelo = prop sólido |
| `a_01_criador_presets_A.png`, `a_02_escolha_parceiro_koromon_A.png` | Criador com os 2 Tamers A e escolha do parceiro com o Koromon A |
| `a_03_spawn.png` a `a_07_andando_*.png` | Spawn e Tamer andando S/O/N/L |
| `a_08_colisao_penhasco.png` | Teste de colisão no penhasco |
| `a_10/11/12_ponte_*.png` | Travessia da ponte |
| `a_13/13b_lago_e_cachoeira*.png` | Lago e cachoeira em 2 quadros |
| `a_14_santuario.png` | Santuário com o Greymon A "forte" |
| `a_15_caverna_metalgreymon.png`, `a_16_cabine_kuwagamon.png`, `a_17_betamon_margem.png` | POIs e Digimon decorativos |
| `a_20/21_encontro_*.png`, `a_22_grama_alta_andando.png` | Encontro e combate |
| `a_30_lago_agua_A.png` × `a_30_lago_agua_B.png` | Água A (padrão) contra `?agua=b` |
| `a_40_demo_evo_parceiro_perto_de_evoluir.png` | Atalho `?demo=evo` |
| `a_video_navegacao.gif` | **Vídeo de navegação**: 58 quadros, 15,9 s, 640×360, tempos reais |
| `comparacao_AxB_{spawn,c16x16,c8x14,c30x12,c33x14}.png` (+ `cmp_*`) | **A × B lado a lado** na mesma posição |
| `integridade_*.png`, `integridade.json`, `vitest.log` | Prova de integridade |

## 9. Pendências

### Técnicas

1. **Andar e virar de verdade.** A animação de caminhada do Tamer e dos Digimon A não existe; o motor está pronto para receber os quadros (atlas por quadro, formato M2). Quando houver folhas, basta preencher `walk` no `lab-character.json` ou no `lab-creature.json`.
2. A cachoeira A fica em 2 colunas de 32 px com uma emenda visível. Uma peça de 64 px resolveria.
3. [H] A folga de câmera para a hotbar está resolvida só pelo desenho do mapa A (§6.2). Fica a sugestão de corrigir no motor, depois.
4. O portal do Mapa-múndi do A fica no topo da clareira do santuário. Viajar pelo Mapa-múndi leva aos mapas do jogo, com arte DS (comportamento existente).
5. Nenhum encontro aleatório "orgânico" foi registrado em captura dentro do tempo; a mecânica foi confirmada forçando o encontro.
6. Não houve teste com pessoas (o critério de 3 testadores do plano A/B/C fica para depois).

### Artísticas (do game-art, LACUNAS)

1. Personagens com N/S/L/O e caminhada.
2. Peças de ligação do penhasco: cantos, laterais e fim de penhasco. Hoje as pontas do penhasco são escondidas por árvores.
3. Margens de água desenhadas em todas as orientações.
4. Ponte L–O feita para o mapa.
5. Água A com textura mais miúda (a repetição de 32 px aparece no lago grande).
6. Paleta: grama P-ii oliva contra objetos quentes da P-iii. Este conflito é **D9/Etapa 6, aberto e não resolvido aqui**.
7. WarGreymon com "asas" e Kunemon como abelha (fidelidade).

## 10. Decisões que dependem do fundador

1. Água do A: manter a A (padrão atual, método puro) ou adotar `?agua=b` como padrão.
2. Como obter direções e caminhada para Tamer e Digimon A (nova rodada no ChatGPT, redesenho ou outro caminho).
3. Se os decorativos (MetalGreymon, Kuwagamon) ficam como cenário ou saem do Link A.
4. Se a folga de câmera para a hotbar deve virar correção de motor (afeta B e o jogo principal; hoje não está autorizada).

---

## v2 — Correções após a revisão do game-qa (`fase5-link-a/REVISAO_QA_LINK_A.md`), 2026-11-13

Commit local `8dc7a0f` (branch `lab/etapa6`). Só a variante A mudou. Sem push, sem deploy e 0 gerações no PixelLab. Link A em http://127.0.0.1:5191, com build v2 e preview reiniciado. Evidências em `fase5-link-a/v2/`.

| # | Problema (QA) | Correção | Evidência [E] |
|---|---|---|---|
| 1 | **Bloqueante 9.** Digimon forte e grama alta na zona inicial | Os 4 pontos fortes foram para além da ponte: margem leste (28,18), prado leste (34,11), santuário (33,7) e cabine (31,23). O próprio script agora calcula a distância por BFS na colisão final e **falha o build** se algum ponto ficar a menos de 20 passos, ou se houver grama alta a menos de 8. **Distâncias: 26, 30, 39 e 42 passos** (B: 26–37). As gramas alta oeste e central saíram; ficaram uma faixa no sudoeste distante (9 passos) e quatro na margem leste (14 faixas no total). O MetalGreymon decorativo também saiu do prado inicial para (32,14). | `v2_01_spawn.png`: sem forte nem grama alta na tela. O selvagem mais próximo do spawn ficou a 20,2 tiles, e só os de passeio, nunca os pontos fortes. `capture-report-v2.json`. Novo teste em `tests/lab-a.test.ts`. |
| 2 | **Bloqueante 13.** Cachoeira em 2 colunas com emenda; espuma em blocos | **Cachoeira em peça única de 64×64** (8 quadros): a coluna A ao lado do próprio espelho, na mesma fase. As colunas 30–31 da tira são a borda escura do tile (40 de 40 px escuros) e, no centro, viravam um risco; agora repetem a coluna 29. **Espuma em faixa contínua de 128 px**: a tira A alterna normal e espelho (costuras contínuas) e mantém só os pixels de espuma (#f5f5f5 e #8ff0f0). As bordas e pontas são transparentes, com afinamento de 1 bit, sem semitransparência. Só arte A e manipulação local (recorte, espelho e alfa por cor), sem redimensionar. A cachoeira B continua só em `?agua=b`. | `v2_zoom4x_cachoeira_espuma_pedras.png`, `v2_02*.png` |
| 3 | **Bloqueante 13.** Ponte em 3 módulos com vãos | **Tabuleiro único de 185 px**: poste esquerdo (colunas 0–8) + 6 vãos repetidos (tábuas e poste, colunas 9–33) + tábuas e poste direito (colunas 34–59) da seção da prancha 08. É um decal só, centrado no rio. | `v2_zoom4x_ponte_continua.png`, `v2_03`, `v2_04` |
| 4 | Corrimão translúcido; Tamer "por cima" | O corrimão da frente (linhas 22–31 da seção, inteiro) **deixou o primeiro plano**, que desbotava. Agora é um prop comum e opaco, ordenado pelo pé (y = 671). Quem está na ponte (linha 20) fica atrás dele, com os pés cobertos; quem está ao sul fica na frente. | `v2_04_ponte_no_meio_corrimao_na_frente.png`, `v2_05_abaixo_da_ponte_*.png` |
| 5a | Parede invisível na margem | Células de margem (Wang) com **3 ou 4 cantos de grama ficaram andáveis**: 14 células. As de 0–2 cantos continuam água sólida. Testado com teclado: a ponte e o bloqueio da água continuam valendo, e não dá para entrar na água. | `tests/lab-a.test.ts` ("margem com 3+ cantos…"), `capture-report-v2.json` |
| 5b | Penhasco ↔ lago em linha reta | No pé do penhasco, sobre a linha d'água, há 7 pedras da prancha (`pedra_musgo_01/02`, `pedra_ocre`) dos dois lados da queda, sem colisão nova (a água já é sólida). A espuma contínua cobre o centro. É ressalva, não peça nova: uma beirada desenhada continua pendente com o game-art. | `v2_07_penhasco_lago_pedras.png`, `v2_zoom4x_*` |
| 6 | Textos de desenvolvimento na HUD | No Link A saíram o selo "OFICIAL DS · Guilmon/Gabumon ×1 (1)" (o modo oficial continua ativo, só não aparece) e o chat simulado. Fica só a faixa do laboratório. O B não mudou (decisão de escopo: B congelado). | `v2_01_spawn.png` |
| — | Tamer de pose única (anda de lado olhando para a câmera) | **Não corrigido**: precisa de arte nova. Continua placeholder registrado (§5). | — |

**Verificação v2 [E]:**

| Item | Resultado |
|---|---|
| `tsc` | Sem erros |
| `vitest` | **505/505** (`v2/vitest.log`; 2 testes novos) |
| `map:validate --no-write` | PASS (`lab-a-chatgpt`, `lab-piloto-v15b`) |
| Erros de console | 0 |
| Link B, visual | O `dist-lab-b` anterior foi servido temporariamente na 5194 (encerrada depois) e comparado com o B refeito com o código v2 (5192), na mesma URL determinística, 2 capturas de cada. Antes × antes: 16 px (0,002%). **Antes × novo: 8 px (0,001%).** Antes (repetição) × novo: 16 px. Novo × novo: 457 px (vaga-lumes e água). É ruído de animação (`v2/integridade_B_diffs.jsonl`). |
| Link B, bundle | 0 PNG A no `dist-lab-b` |
| `qo` | 0 linhas no `git status --porcelain`, HEAD `3289e32` |

**GIF menor:** `v2/a_video_navegacao_v2.gif`, **2,4 MB**, 43 quadros, 14,0 s, 480×270, 1 pixel lógico do jogo por pixel, recorte central.

**Continua pendente:**
- Tamer e Digimon sem caminhada nem direções.
- A cachoeira 64 px é simétrica (efeito de espelho visível), sem rocha nem bacia.
- A ponte segue com 1 tile de largura.
- O penhasco e o lago ainda não têm uma peça de ligação desenhada.
- Corredores de vegetação, ramais B1/B2 e interativos (QA §11, itens 5–7) dependem de layout-brief e arte.
- Decisões do fundador da QA §12, sobretudo o layout próprio contra o traçado v15b.
