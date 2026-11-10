# Mirante — fix do topo + decisão de escala do Tamer (game-art, 2026-11-10)

- **Autor:** game-art (diretor de arte) · GS-003 Quality Overhaul.
- **Autorização:** noturna do fundador, **custo ZERO** — nenhuma ferramenta geradora do PixelLab usada (saldo 0,80 intocado). Tudo abaixo é pipeline local (`art/src/*.js`, Canvas.js próprio) ou edição de texto. Não publiquei nem apaguei nada.
- **Legenda:** **[E]** evidência (arquivo/comando/medição de hoje) · **[H]** hipótese/julgamento.

## A) Topo do mirante — `forest-v9-cliffs`

### Diagnóstico [E]

- Relatório do game-dev (`quality-overhaul/phase3/P7_GS012_DEV_R2.md` §4, worktree `workspaces/game-dev/qo`): kit `forest-v9-cliffs` (commit `6110bab`) integrado na branch `quality-overhaul`; a face melhorou (musgo, raízes), mas **"o topo do platô (3 linhas) continua uma placa de pedra cinza-arroxeada granulada, e a mancha verde retangular no meio do topo (camada antiga) evidencia o recorte"**.
- Inspecionei as capturas `phase3/img/p7_mirante_depois_v9kit_dia_r2.png` e `_zoom_r2.png` (copiadas para revisão local, não editadas) — confirmo visualmente: faixa de ~3 tiles de topo em ruído cinza-azulado uniforme, e uma faixa verde plana com bordas retas logo acima do muro de face, sem textura orgânica, contrastando com o chão de grama ao redor.
- **Causa raiz, lida no código** (`art/src/gen_forest_v9_cliffs.js`, `cliffTopFg` da v2/r1): a textura do topo usava `d.cliffTop` — em `forest_v8_depth_palette.js`, essa rampa é **literalmente** `base.ground.stone` escurecido e resfriado (`shiftColor(base.ground.stone[n], {vMul: 0.62–0.98, hueDeg: 4–6})`), ou seja, o topo era pedra de propósito, não terra/grama. Em `blob_autotile16.js`, um tile de topo totalmente cercado (bitmask 15, N/E/S/W presentes) tem raio de arredondamento `R=0` em todos os 4 cantos → **0% do fundo (`cliffTopBg`, grama) aparece**, 100% é a textura de pedra do `cliffTopFg` — por isso a maior parte do platô lia como laje de pedra mesmo depois do kit "orgânico". Nos cantos onde `R>0` (tiles de borda/ilha), o fundo de grama aparecia em quartos de círculo contra o fg de pedra cinza — esse contraste duro pedra-vs-grama dentro do mesmo tile é a origem mais provável da "mancha verde retangular" (fg e bg nunca tinham a mesma paleta para se misturar).

### Correção [E]

- Editei só `cliffTopFg()` em `art/src/gen_forest_v9_cliffs.js` (face, cantos, rampa e decalques **não foram tocados** — o QA do game-dev já aprovou essa parte, "se necessário" do pedido não se aplicou).
- Base do topo trocada de `d.cliffTop` (pedra) para `d.grass` (a MESMA rampa de grama usada em `groundBase()`/`cliffTopBg()` e em todo o chão da clareira) — um tile totalmente interior agora lê como grama, não pedra.
- Adicionado: 1–2 manchas irregulares de terra batida (`d.dirt`, não um retângulo — elipses irregulares, posição e tamanho por ruído) simulando uso/pisoteio no mirante; pedrinhas esparsas (`d.stone`, minoria, só um aceno de "isto é rocha por baixo"); borda sul (transição para a face) mantida como já estava — musgo/grama por ruído (`wobbleProfile`), já lia bem e o QA não reclamou dela.
- Como fg e bg agora compartilham a mesma paleta de grama, o contraste duro que criava a leitura de "mancha retangular" nos cantos arredondados do autotile some — fg e bg se misturam em vez de colidir.
- **Arquivos alterados:** `art/src/gen_forest_v9_cliffs.js` (só `cliffTopFg`) e os 16 PNGs regenerados em `art/map-factory/forest-v9-cliffs/tiles/cliff_top_blob_0.png` … `cliff_top_blob_15.png` (mesmos nomes, mesmo tamanho 32×32, mesma geometria de autotile — só a textura mudou). `preview.png` e `mirante_comparison.png` do kit também foram regenerados (mesmos nomes). `tileset.json`/`palette.json`/`license.json`/`README.md` do kit foram re-escritos pelo script mas o conteúdo não mudou (git confirma 0 diff nesses 4 arquivos).

### Prévias

- `projects/prototypes/GS-003/quality-overhaul/phase3/art/mirante_top_r1_vs_r2.png` (novo, gerado agora): mosaico dedicado comparando as 16 variantes de topo **r1 (commit `6110bab`, pedra cinza-arroxeada)** vs **r2 (este fix, grama/terra)**, lado a lado, mesma ordem de bitmask. Build local (`/tmp/build_top_r1r2_compare.js`, script descartável, não commitado — não faz parte do pipeline do kit).
- `art/map-factory/forest-v9-cliffs/preview.png` (atualizado): prancha completa do kit (topo 16 + faces + cantos/rampa + decalques) já mostra o topo novo.
- `art/map-factory/forest-v9-cliffs/mirante_comparison.png` (atualizado): a montagem "antes (laje v8) vs depois (kit)" de 8×3 do próprio kit, regenerada com o topo corrigido.

### Instruções exatas para o game-dev re-integrar

1. Puxar `master` de novo no worktree `quality-overhaul` (`git merge master`, como já fez para pegar `6110bab` — sem conflito esperado, só os 16 PNGs de topo + o `.js` gerador mudaram).
2. **Nenhuma mudança de nome de arquivo ou de schema** — os 16 `cliff_top_blob_0.png`…`cliff_top_blob_15.png` continuam com os mesmos nomes, mesmo tamanho (32×32) e a mesma convenção de bitmask (`N*1+E*2+S*4+W*8`) de antes. O derivador (`derive-look-v9.mjs`) não precisa de nenhum ajuste de mapeamento — é o mesmo swap `fp8_cliff_*` → `fp9c_*` que já faz, só repetir para pegar os PNGs novos.
3. Re-rodar `scripts/qo3-capture.mjs mirante` para novas capturas `_r3` (ou sufixo que preferirem) e confirmar visualmente: topo deve ler como grama/terra do mesmo tom do resto da clareira, sem faixa de pedra uniforme e sem retângulo verde de contraste duro.
4. Se a "mancha retangular" **ainda** aparecer depois deste fix, não é mais textura do kit (fg/bg já compartilham paleta) — provavelmente é uma camada antiga do mapa (chão/decor anterior ao kit) não totalmente coberta pelas 16 variantes de topo nas células do mirante; nesse caso o próximo passo é conferir, célula a célula do platô, se alguma usa um bitmask fora do conjunto 0–15 ou se há uma layer de chão antiga visível por baixo — isso é integração (game-dev), não art.

### Limitações (autocrítica)

- **Não testado no motor real** — só inspecionado via `preview.png`, `mirante_comparison.png` e o mosaico dedicado `mirante_top_r1_vs_r2.png`. Não tenho acesso de escrita ao worktree do game-dev para rodar `qo3-capture.mjs` e confirmar in-game; só o próprio game-dev pode fazer essa re-captura.
- A hipótese da causa-raiz da "mancha verde retangular" (contraste fg/bg nos cantos arredondados do blob) é **[H]** — lida no código, não confirmada pixel a pixel contra a captura real do bug (não tenho o PNG da célula exata do mapa que tinha a mancha, só a visão geral/zoom da clareira). Se a causa real for outra (ex. camada antiga do mapa não substituída), o item 4 das instruções acima cobre esse caso.
- A terra batida e as pedrinhas esparsas continuam sendo ruído procedural (`wobbleProfile`/posições aleatórias clampadas), não desenho à mão — mesma limitação já registrada no `README.md` original do kit (v2): resolve a leitura "pedra lisa"/"mancha retangular", mas de perto ainda é claramente procedural.
- Não toquei a face, os cantos, a rampa nem os decalques — o QA do game-dev já aprovou essa parte da r1; se uma futura passada quiser uniformizar ainda mais a transição topo↔face, isso fica para uma próxima rodada.

## B) Decisão de escala do Tamer

### O que foi decidido

- Arquivo: `projects/prototypes/GS-003/quality-overhaul/ART_DIRECTION_V2.md`, nova seção **§1.5 "Decisão de escala — 2026-11-10 (Tamer, resolve QA P8 §1.2.1)"**, inserida ao final da seção 1 (depois de §1.4.4, antes de "## 2. Paleta por região").
- **Padrão oficial único:** arte nativa do Tamer em **56–64 px de altura de corpo, canvas 64–72 px** — a mesma faixa já testada e confirmada para o Rookie/Guilmon (`phase2/art/scale-proof/`, 60×68 px), harmonizando jogador e parceiro na mesma régua "nível Drakantos". Isso faz de `§1.4.1` o único número de arte nativa válido para o Tamer a partir de hoje.
- **Os "52–60 px" de §1.2 ficam formalmente superados** — já estavam marcados "não usar para produção" desde a revisão de §1.4, mas voltaram a ser citados por `QA_PHASE3.md`; adicionei uma nota em §1.2 apontando explicitamente para §1.5, para fechar esse loop de citação.
- **O "~90 px físicos" de `phase2/PHASE2_DEV.md` §2 não é o mesmo tipo de número** — é o tamanho RENDERIZADO NA TELA do placeholder atual (Tamer de 30 px lógicos × fator de escala inteiro 3 do `dprLayout()`, alvo `charh` ≈ 9% da altura física), não o tamanho da arte nativa. A decisão documenta essa distinção explicitamente (arte nativa vs. zoom de tela são grandezas diferentes) e registra que, quando o Tamer for redesenhado em 56–64 px nativos (quase o dobro do placeholder), o fator inteiro do `dprLayout()` precisa cair (de 3× para algo entre 1× e 2×) para manter o mesmo alvo de tela já aprovado — valor exato fica para `game-dev` testar no jogo real, mesma ressalva que §1.4.2 já registrava para o Rookie.

### Como isso desbloqueia o P8

- O retrato mini (48×48 px) e o retrato grande (72×72 px, spec P8 §4.1/§5) agora têm uma única fonte de verdade para o tamanho de arte nativa a recortar (56–64 px / canvas 64–72 px), eliminando a escolha entre 3 números concorrentes que travava a decisão.
- Para o parceiro Digimon (Guilmon/Rookie) não havia bloqueio real: a escala já estava confirmada e testada; o retrato pode ser recortado da arte existente.
- Para o Tamer, a arte na escala nova ainda não existe (só o Guilmon foi testado, confirmado em §1.4.4) — a decisão não cria a arte (fora do escopo de uma noite de custo zero), mas remove a ambiguidade que impedia a spec de sequer declarar qual tamanho usar. Um retrato feito hoje do sprite placeholder de 30 px deve ser marcado como provisório, não final — isso também ficou registrado na seção nova.

### Limitações (autocrítica)

- A decisão é de **arte** (tamanho do sprite), não resolve zoom/câmera — mesma ressalva que `§1.4.2` já tinha para o Rookie; a recalibração exata do `dprLayout()` fica para `game-dev` testar.
- Não gerei nem redesenhei o sprite do Tamer na nova escala — isso exigiria gerações do PixelLab (saldo 0,80, não autorizado hoje). A decisão só fixa o número-alvo para quando o orçamento permitir.
- A relação "~90px → algo entre 1× e 2×" é estimativa aritmética simples (30px × 3 ≈ 56–64px × [1–2]) **[H]**, não testada; o `dprLayout()` real arredonda para fator inteiro de tela, então o valor final pode cair fora dessa faixa dependendo de como a função arredonda — fica para `game-dev` confirmar.

## Arquivos

- **Alterados:**
  - `art/src/gen_forest_v9_cliffs.js` (só `cliffTopFg`)
  - `art/map-factory/forest-v9-cliffs/tiles/cliff_top_blob_0.png` … `cliff_top_blob_15.png` (16 arquivos)
  - `art/map-factory/forest-v9-cliffs/preview.png`
  - `art/map-factory/forest-v9-cliffs/mirante_comparison.png`
  - `quality-overhaul/ART_DIRECTION_V2.md` (nota em §1.2 + nova §1.5)
- **Novos:**
  - `quality-overhaul/phase3/art/mirante_top_r1_vs_r2.png` (mosaico de comparação dedicado)
  - `quality-overhaul/phase3/art/MIRANTE_TOP_AND_SCALE.md` (este arquivo)
- **Não tocados:** `art/map-factory/forest-v9-cliffs/tiles/cliff_face_*`, `cliff_face_corner_*`, `cliff_ramp.png`, `decals/*`, `palette.json`, `tileset.json`, `license.json`, `README.md` (re-escritos pelo script, 0 diff de conteúdo).
