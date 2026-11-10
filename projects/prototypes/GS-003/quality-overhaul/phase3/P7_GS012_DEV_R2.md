# P7 + GS-012 — rodada 2: correções P1/P2 do QA da fase 3 (game-dev)

- **Autor:** game-dev (GS-003) · **Data:** 2026-11-10
- **Branch:** `quality-overhaul` (worktree `~/projects/GameStudio/workspaces/game-dev/qo`). `git merge master` feito antes (`1cb7ddd`, sem conflito). Nada foi feito na 5174 nem no `master`; tudo rodou na **5190**.
- **Base:** `phase3/qa/QA_PHASE3.md` (game-qa). Copiei o arquivo do checkout do master, onde ele está sem commit, para este caminho no worktree.
- **Legenda:** **[E]** evidência (arquivo, comando ou medição de 2026-11-10) · **[H]** hipótese/julgamento.
- **Regras:** caminhos de código relativos a `GS-003/prototype/world/`. As flags são as mesmas (`?look=v9`, `?encounters=1`). Sem elas, o jogo não muda, exceto o aviso legal, que virou ícone em todos os modos.

## 0. Resumo por defeito do QA

| QA | Defeito | Feito | Prova |
|---|---|---|---|
| P1-2 | Primeiro plano não oculta o Tamer (15–24 px) | Moitas de **3 fileiras empilhadas** (~40 px de altura, ~60 px de largura). O pé fica 20 px ao sul do **eixo** da trilha. A oclusão passa a ser medida pela parte **opaca** do sprite. | Cobertura medida **50%, 53% e 56%** do Tamer de 34 px, com a moita opaca (`fgAlphaCovering: []`) [E] · `p7_fg_*_r2.png` + `_zoom_r2.png` |
| P1-3 | Salto ilegível (1,2 s) | **2,0 s** (`INTRO_TICKS` 12 → 20), em 5 fases: grama treme 0,6 s → balão "!" com pausa (0,4 s) → arco de 26 px em 10 quadros, com a sombra crescendo → pouso com poeira e folhas → placa | 6 quadros com a fase medida pelo próprio efeito [E] · `p12_encontro_{1..6}_*_r2.png` + `p12_encontro_sequencia_6q_r2.png` |
| P2-5 | Grama alta igual ao chão comum | Touceiras próprias `fp9_enc_grass_a/b/c`: 24×26 px contra 14 px, verde-azulado saturado com pontas claras, com vento. 3 por tile; **74 contra 32** nas 2 zonas | `p12_grama_alta_zona_{dia,noite}_r2.png` |
| P2-4 | Aviso legal fixo no canto | Ícone **"i"** de 18 px (`<details>`); o clique abre o texto completo do ADR-007 §3 | todas as capturas `_r2` |
| P2-6 | Dia e noite com contraste fraco | O dia deixou de multiplicar por `#bcc4d6` (−25%, azulado) e passou a `#f6eedc` com véu dourado de 5%. A noite ficou mais escura e mais azul (`#7c80c4`, véu 0,16, vinheta 0,6). A névoa diurna caiu para 0,04. | `p7_clareira_depois_v9p7_{dia,noite}_r2.png` |
| P1-1 | Mirante = laje cinza | **Kit `forest-v9-cliffs` ainda não existe** no master nem no worktree [E]. Deixei o **encaixe pronto** no derivador (§4), testado com uma cópia temporária, que depois apaguei. | — (pendente do game-art) |

**Verificação [E]:**
- `npm test`: **38 arquivos, 357 testes verdes**. Rodei a suíte completa 5 vezes depois da última mudança: 4 verdes e 1 com falha no teste do primeiro plano (`look-v9.test.ts`), que não se repetiu (§6).
- `npm run build`: ok.
- `map:validate`: **8/8 gates** nos 6 mapas e no arquivo do v9 (`… v9/digimon-forest-01.tmj.json --no-write`).
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).
- O derivador continua determinístico (teste).

## 1. Primeiro plano: até a cintura de verdade (P1)

### Moita composta

- **Antes:** 2 fileiras de ~26 px, pé 3–9 px fora da borda da trilha. Com o Tamer no meio da trilha (meia-largura de 22–29 px), a moita cobria só o joelho.
- **Agora:** `p7-clareira.mjs` §3. A fileira de trás sobe 15–16 px (topo a 37–40 px do pé), a do meio 8 px e a da frente fica no pé.
  - Os sprites são os mesmos do `forest-v8-depth`, sem escala.
  - Ficam sobrepostos ~50% na horizontal para ler como **uma** massa. Na primeira tentativa, espalhados, viravam 3–4 moitas redondas soltas.
- **Posição:** o pé fica **20 px ao sul do eixo** da trilha. O eixo é o mínimo do campo de distância da curva, procurado na coluna (`trailAxis`).
  - Com o Tamer no eixo, a moita cobre ~18 px.
  - Mais ao sul, ela chegaria à cabeça e fica translúcida.

### Ponte

- As molduras da rodada 1 caíam **em cima do tabuado** (células 25–31 da linha 9).
- Agora ficam na trilha em terra firme, logo antes (x 23,7) e logo depois (x 32,9) da ponte.

### Oclusão medida pela parte opaca

- **Problema:** `view.ts` (`drawForeground`) decidia a translucidez pelo **recorte inteiro** do sprite. A samambaia, por exemplo, tem 7 px transparentes no topo.
- **Correção:** `opaqueBox()`, com cache por url e recorte, mede a caixa opaca uma vez. `headFrac` (0,35) continua valendo.

### Medição [E]

`scripts/qo3-capture.mjs fg`: pixels opacos do primeiro plano em cada uma das 13 colunas do corpo do Tamer, com o Tamer no eixo da trilha atrás da parte alta. Mediana das colunas:

| Moldura | Pés do Tamer (px) | Coberto | Fração (Tamer 34 px) | Moita translúcida? |
|---|---|---:|---:|---|
| ponte-oeste | 746, 278 | 18 px | **0,53** | não |
| ponte-leste | 1066, 334 | 17 px | **0,50** | não |
| baú | 942, 632 | 19 px | **0,56** | não |

Pedido: ≥ 45%. Nas capturas `_zoom_r2` a cabeça fica à vista e o corpo some na folhagem até a cintura ou o peito.

### Vale observar

- **Estimativa [H]** pela geometria: andando pela borda **norte** da trilha, a cobertura cai para ~10–30%. Encostando na moita, ela fica translúcida. Ou seja, o "até a cintura" vale no meio da trilha.
- **"Galho pendente no topo da tela":** não fiz. Não há sprite de galho ou folhagem pendente em nenhum kit, e desenhar um seria arte nova. Fica para o game-art (§6).

## 2. Encontro: 2,0 s em fases legíveis (P1)

`src/sim/encounters/authority.ts`: `INTRO_TICKS = 20`. A sim só entra no combate no fim, e a regra de bloqueio do salto continua a mesma.

`src/render/encounterFx.ts`:

| ms | Fase (`encFx.phase()`) | O que se vê |
|---|---|---|
| 0–600 | grama | A touceira treme ±2 px com amplitude cheia (antes decaía em 420 ms) e solta 3 ondas de folhas. A vinheta entra e a câmera começa a puxar. |
| 600–1000 | alerta | A grama para. Um **balão branco com "!" vermelho** (11×14 px, contorno escuro) estoura com pulo de 3 px sobre o Tamer e fica parado: é a pausa. |
| 1000–1500 | salto | Arco de **26 px** (era 12) em 10 quadros inteiros. A **sombra fica no chão e cresce de 0,4 até 1,0** enquanto ele cai (`entityOffset().shadow` → `drawShadow(scale)`). |
| 1500–1850 | pouso | Anel de poeira achatado (12 grãos) abrindo, mais 6 folhas espalhando. |
| 1500–2600 | placa | "NOME NV.N", com a borda da raridade e o selo NOVO. O rótulo comum fica escondido até a placa sumir (antes os dois apareciam juntos no pouso). A câmera e a vinheta voltam a partir de 2000 ms, quando o combate começa. |

**Captura [E]** (`encounter`):
- **Tempo dos quadros:** cada quadro tem o tempo medido dentro da página em relação ao início do efeito: 267, 765, 1030, 1282, 1531 e 2065 ms, um em cada fase.
- **Folha 3×2:** em `p12_encontro_sequencia_6q_r2.png`, com o recorte em volta do Tamer.
- **Combate:** `p12_encontro_7_combate_debug_r2.png` mostra o combate no mapa com o painel.

**Sem mudança:** sem zoom (escala inteira), sem squash e sem som, como na rodada 1.

## 3. P2

### Grama alta de encontro

- **Arte:** `art/map-factory/forest-v9-p7/props/enc_grass_{a,b,c}.png`, gerada por `forest-v9-p7/gen_enc_grass.py`.
  - Procedural e determinística, PIL do venv `shared/tools/sd-local`, sem PixelLab e sem custo.
  - São 11 lâminas por tufo, contorno escuro, sombra de contato e 6 tons do verde-azulado escuro até a ponta amarelo-clara.
- **Integração no derivador:** pacote extra `forest-v9-p7` (prefixo `fp9_`).
  - **Vento:** os tufos entram em `look.sway`.
  - **Grade:** regra própria mais suave (saturação 0,95, valor 0,9), para o tom continuar destacado do chão escurecido.
- **Distribuição:** `p7-clareira.mjs` §5 põe 3 por tile, com densidade cheia até perto da borda e espaçamento entre touceiras de 9 px.
  - Resultado: 44 + 30 = **74** contra 17 + 15.
- **Y-sort:** os tufos entram na ordenação de profundidade, então o Tamer e o selvagem ficam com as pernas dentro da grama (quadros do encontro).

### Aviso legal

- **`index.html`:** `<details class="fan-note">`, com o "i" como `<summary>` (rótulo acessível). O texto continua no DOM.
- **`style.css`:** a caixa só aparece aberta.
- **Testes:** nenhum dependia da caixa fixa.

### Dia e noite

- **Onde:** `derive-look-v9.mjs` (`look.ambient` e `look.fog`). Só o v9; o v8 não muda.
- **Antes:** o dia escurecia 25% e azulava, por isso ficava parecido com a noite.

## 4. Mirante: encaixe do kit `forest-v9-cliffs` (preparado, não integrado)

- **Estado [E]:** `art/map-factory/forest-v9-cliffs/` não existe no master (`53f6c5d`) nem no worktree.

### Contrato (no topo do bloco em `derive-look-v9.mjs`)

- `tiles/<nome>.png` com os mesmos nomes do `forest-v8-depth`:
  - `cliff_top_blob_0..15`;
  - `cliff_face_straight`, `cliff_face_corner_inner` e `cliff_face_corner_outer_left/right`;
  - `cliff_ramp`.
- Formato 32×32, na mesma máscara blob-16.

### O que o derivador faz quando o kit existe

- Troca cada tile `fp8_cliff_*` do v9 que tiver arquivo no kit por `fp9c_<nome>`.
- Registra o pacote extra `fp9c_`.
- Copia a regra de grade dos penhascos.
- Registra em `p7-report.json → cliffKit {present, swapped}`.
- Sem o kit, o arquivo derivado sai igual.

### Teste [E]

- Copiei os 13 `cliff_*` do v8 para `forest-v9-cliffs/tiles/` e rodei o derivador: `swapped: 13`, pacote registrado e regra de grade criada.
- Apaguei a cópia e rodei de novo: `present: false`, sem trocas.

### Para ligar quando o game-art entregar

```bash
cd prototype/world && node scripts/map-factory/derive-look-v9.mjs
```

Depois, reiniciar a 5190, porque o `import.meta.glob` não pega pasta nova com o servidor no ar.

- **Fora do contrato:** se o kit vier com peças extras (grade, borda de mirante, escada), elas pedem colocação no `p7-clareira.mjs`.

## 5. Capturas e vídeo (`phase3/img/`, sufixo `_r2`; a rodada 1 ficou intacta)

| Arquivo | Conteúdo |
|---|---|
| `p7_fg_{ponte,ponte_leste,bau}_tamer_atras_r2.png` + `_zoom_r2.png` | Tamer no eixo da trilha atrás da moldura; o zoom é um recorte 1:1 de 480×300 |
| `p12_encontro_{1_grama,2_alerta,3_salto_sobe,4_salto_desce,5_pouso,6_placa}_r2.png` · `p12_encontro_sequencia_6q_r2.png` · `p12_encontro_7_combate_debug_r2.png` | Encontro em 6 fases, a folha 3×2 e o combate com o painel |
| `p12_grama_alta_zona_{dia,noite}_r2.png` | Zona de grama alta com a trilha (`zoom=2`) |
| `p7_clareira_{antes_v8,depois_v9p7}_{dia,noite}[_geral]_r2.png` | Antes e depois, dia e noite, visão de jogo e geral |
| **`p12_clareira_passeio_encontro_r2.webm`** | 32,6 s, VP9, 1920×1080, 25 fps, 18 MB |
| `qo3_capture_report_{shots,fg,encounter,video}_r2.json` | Metadados: cobertura, tempos e fases, marcos do vídeo |

### Vídeo

- **Gravação:** feita com `qo3-capture.mjs video` (bruto de 78,9 s) e cortada com `scripts/qo3-trim-video.py`.
- **Trechos mantidos:**
  - 10,8–31,0 s: sul da clareira → baú → **eixo da trilha atrás das 2 molduras da ponte** → entrada na grama;
  - 66,5–78,9 s: últimos ~7 s na grama → **encontro natural, sem forçar** (o 1º sorteio em 179 passos) → salto de 2 s → combate → recompensa paga 1 vez.
- **Cortado:** o carregamento e ~35 s de vaivém na grama.

## 6. Limitações

- **Mirante (P1):** continua laje cinza até o kit do game-art chegar. Só o encaixe está pronto.
- **Primeiro plano:**
  - a cobertura depende de onde o Tamer pisa: ~50–56% no eixo da trilha e menos na borda norte;
  - não há galho ou folhagem pendente no topo da tela (falta sprite);
  - as moitas são composição de sprites existentes, não arte nova;
  - as 2 molduras de juncos do riacho (rodada 1, sem passagem atrás delas) só ganharam uma fileira a mais.
- **Grama de encontro:**
  - é peça provisória desenhada por código (game-dev), não arte aprovada no GS-010;
  - o vento usa a amplitude global do `look.sway` (1 px), igual ao resto da folhagem;
  - não tem variante noturna própria: à noite vale o ambiente do look.
  - só as 2 zonas da clareira usam a grama nova; as 5 áreas antigas da tabela continuam com a grama de antes.
- **Encontro:**
  - "!", folhas e poeira continuam sendo pixels desenhados em código (o passo 8 do GS-010 substitui);
  - o salto não tem deslocamento horizontal, sai do mesmo tile em que pousa;
  - nos quadros parados, o tremor da grama (fase 1) só se percebe no vídeo.
- **Teste instável:** `look-v9.test.ts`, no teste do primeiro plano, falhou 1 vez em 6 execuções da suíte completa e passou em todas as isoladas.
  - Não reproduzi nem identifiquei a causa.
  - **[H]** Pode ser carga de CPU durante o carregamento das imagens no teste.
- **Vídeo:** é VP9 regravado pelo PyAV (o ffmpeg do Playwright não corta). Ficou com 18 MB por causa do `crf` 34.
- **Desempenho:** não remedi. Há mais props desenhados na clareira (74 touceiras contra 32, e 32 sprites de primeiro plano contra 20); o custo deve ser marginal **[H]**, mas `qo3-capture.mjs perf` não foi rodado nesta rodada.
- **Servidor 5190:** reiniciei a minha instância (o glob não via a pasta nova). Ela está no ar a partir do worktree. A 5174 não foi tocada.

## 7. Arquivos

- **Novos:**
  - `art/map-factory/forest-v9-p7/` (`gen_enc_grass.py`, `props/enc_grass_{a,b,c}.png`);
  - `scripts/qo3-trim-video.py`;
  - `quality-overhaul/phase3/qa/QA_PHASE3.md` (cópia);
  - este relatório e as capturas `_r2`.
- **Alterados:**
  - `src/render/{encounterFx,view}.ts`, `src/sim/encounters/authority.ts`;
  - `index.html`, `src/style.css`;
  - `scripts/map-factory/{derive-look-v9,p7-clareira}.mjs`, `scripts/qo3-capture.mjs`;
  - `src/data/maps/v9/*` (derivados);
  - `tests/{encounters,look-v9}.test.ts`:
    - um sorteio nos últimos 20 ticks do passeio ainda está saltando quando o teste acaba;
    - a oclusão agora usa a moita alta, porque a samambaia sozinha não chega à cabeça;
  - `docs/map-factory/validation/*` (só a data).
