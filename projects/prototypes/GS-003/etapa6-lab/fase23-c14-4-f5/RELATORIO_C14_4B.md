# Relatório C14.4-B: Hawkmon v2 no build isolado 5197, a ~50 ms por quadro

**Data:** 2026-11-15 · **Autor:** game-dev (Opus 5.5) · **Status:** build no ar na 5197, **não homologado**. Próximos passos: game-qa, depois ChatGPT, depois Vitor.
Fan game não oficial e não licenciado. Uso só local; nada foi publicado. Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei). A arte do v2 é a base C15a (referência gerada no ChatGPT sob direção do Vitor) animada no C15b (PixelLab + limpeza local).

## 0. Resumo

- **O Hawkmon v2 é o padrão do build 5197**, sem parâmetro. O pacote `pacote_hawkmon_v2` foi copiado **byte a byte** (52 PNG, conferidos com `cmp`) para `lab-assets/a-hawkmon/digimon/LAB-HAWKMON/pixellab2/`, ao lado do v1b (`pixellab1/`, intocado).
- **O v1b continua acessível com `&hawk=v1b`.** A faixa roxa mostra a versão: "BUILD HAWKMON v2" ou "BUILD HAWKMON v1b (URL)".
- **Cadência do v2: mediana de 50 ms por quadro nas 4 direções** (média de 50,4 a 51,7 ms), 5 px por quadro, 88–92 px/s, **0 quadros pulados**. A repetição deu o mesmo.
- **Recuo do pé de apoio na arte v2 (E/W):** em média ~2,6 px por quadro (E ≈ 2,2, W ≈ 3,1), irregular. Com o passo de 5 px, o pé **escorrega ~2,4 px por quadro, cerca de 48% da velocidade** (E ≈ 56%, W ≈ 38%). No v1b, no mesmo passo, eram 3 px (60%). O W tem um trecho irregular (q3→q5) em que o pé de apoio salta 8 px e depois volta 3. Detalhes no §3.
- **Âncora, sombra e profundidade iguais às do v1b:** pivô (30, 49), canvas 60×60 sem crop, sombra de contato `rx 19 / ry 7` em (30, 49).
- **Agumon, Tamer e `WORLD` não mudaram:** Agumon a 116,6 ms; Tamer a 91–93 px/s (lento: 38).
- **Validação:**
  - `tsc` 0;
  - `vitest` 526/530, com as **mesmas 4 falhas antigas** de `lab-duas-linhas.test.ts`;
  - `map:validate --no-write` 9/9 PASS;
  - **0 erros de console e 0 falhas de rede** em 11 sessões.
- **Commit local `01f82b8`** na branch `lab/hawkmon-v1b`. `dist-lab-hawkmon` foi recompilado e o serviço `gs003-lab-hawkmon-5197` religado (HTTP 200). Sem push, sem merge, sem deploy e sem PixelLab.

## 1. Links de teste (só nesta máquina)

| Link | O que mostra |
|---|---|
| http://127.0.0.1:5197/?novo=1&time=dia | **padrão novo:** Hawkmon v2 a ~50 ms por quadro, com o Tamer de comparação e o Agumon F7v2 ao lado |
| http://127.0.0.1:5197/?novo=1&time=dia&hawk=v1b | Hawkmon v1b, para comparar (também a 50 ms) |
| http://127.0.0.1:5197/?novo=1&time=dia&parceiro=agumon | Agumon F7v2 como parceiro ativo e o Hawkmon v2 ao lado |
| http://127.0.0.1:5197/?novo=1&time=dia&hawkms=73 | v2 a ~73 ms por quadro (7,3 px) |
| http://127.0.0.1:5197/?novo=1&time=dia&hawkpx=2 | v2 a 2 px por quadro (~17–20 ms) |
| http://127.0.0.1:5197/?novo=1&time=dia&comparar=0 | sem o Tamer de comparação |

- Os parâmetros combinam entre si, por exemplo `&hawk=v1b&hawkpx=2`.
- **Fonte:** `medicoes_c14_4b/links_c14_4b.json`, que registra por link a faixa, a ficha carregada, o passo, o pivô, a sombra, os quadros e os erros, mais uma tela (`tela_*.png`) de cada um.
- **Teclas:** iguais às do 14.3 e do 14.4-A (`WASD`, `Shift` para andar lento, `Tab`, `Esc`).

## 2. Cadência medida [E]

**Como medi:**
- Chromium headless, 1280×720, rAF a ~60 Hz, sem GPU (medição indicativa).
- Roteiros `tools/h143/walk.mjs` e `analisa.mjs`, os mesmos do 14.4-A, sem alteração.
- Trechos de 2,5 s por direção.
- Valores em ms por quadro (mediana / média), px por quadro e velocidade.

### 2.1 Hawkmon, velocidade normal

| Rodada | E | W | N | S | Pulos |
|---|---|---|---|---|---|
| **v2** (padrão, `v2`) | **50 / 51,7 · 5 px · 92 px/s** | **50 / 50,4 · 5 · 91** | **50 / 51,0 · 5 · 88** | **50 / 51,4 · 5 · 91** | 0/175 |
| v2, repetição (`v2_r2`) | 50 / 51,4 · 5 · 92 | 50 / 50,4 · 5 · 91 | 50 / 50,5 · 5 · 89 | 50 / 51,4 · 5 · 91 | 0/175 |
| v1b (`&hawk=v1b`) | 50 / 51,4 · 5 · 92 | 50 / 50,4 · 5 · 91 | 50 / 51,0 · 5 · 88 | 50 / 50,7 · 5 · 91 | 0/176 |
| v2 ao lado, com o Agumon ativo (`v2_agumon_ativo`) | 50 / 56,5 · 4,8 · 80 | 50 / 59,5 · 4,7 · 74 | 50 / 56,1 · 4,8 · 83 | 50 / 56,2 · 4,7 · 82 | 0/189 |

**Observações:**
- **Critério 2 atendido:** mediana de 50 ms (±5).
- Nos q5–q6 da E/W, que eram o "pulinho" do v1b, cada quadro fica 50 ms em todas as ocorrências medidas.
- O máximo isolado, de 100 ms, é a entrada ou a saída da walk.
- No modo lento (Shift), o passo fixo de 5 px dá 117–133 ms por quadro, igual ao 14.4-A.
- A média de 56–60 ms do Hawkmon *de comparação* vem do percurso do Tamer de comparação (curvas e reagrupamento, §3 do 14.4-A), não do tempo de quadro.
- **A ficha carregada foi confirmada no jogo:** o manifesto do v2 tem "ficha v2" e walk de 8 quadros com 50 ms; o do v1b tem "ficha v1".

### 2.2 Agumon, Tamer e `WORLD`

| Medida | 14.4-A | C14.4-B |
|---|---|---|
| Agumon como parceiro principal (`&parceiro=agumon`) | 116,6–116,7 ms · 11 px · 89–92 px/s | **116,6 ms · 10,9–11 px · 88–92 px/s** |
| Agumon de comparação | 116,6–116,7 ms · 9,3–10,3 px · 74–83 px/s | 116,6–116,7 ms · 9,3–10,3 px · 74–83 px/s |
| Tamer local | 91–93 px/s (lento: 38) | 91–93 px/s (lento: 38) |
| `WORLD` (`params.ts`) | não alterado | **não alterado** (o commit só toca `main.ts` e o importador novo) |

## 3. Pé de apoio da arte v2 e escorregamento [E, com a leitura marcada como H]

**Como medi:** `tools/h143/pe_v2.mjs` e `pe_comp.mjs`, só leitura dos PNG.
- Para cada quadro da walk E/W, peguei o centro x de cada bloco de contato opaco na linha do chão (y = 49).
- A identidade do pé (qual bloco é o pé de apoio) foi atribuída à mão, pela continuidade entre quadros.
- **Fontes:** `medicoes_c14_4b/pe_apoio_resumo.json` (tabela), `pe_apoio_arte.json` (blocos brutos) e `pes_walk_EW_8x.png` (pés ampliados 8×, v2 e v1b).

### Walk E

- Centros de contato por quadro: q0 31,5 · q1 29,5 · q2 28 · q3 25 · q4 23,5 (+ toque em 28) · q5 um bloco só, de 23 a 37 (os dois pés no chão) · q6 30,5 · q7 28.
- Pé A (q0→q4): recua 2 · 1,5 · 3 · 1,5 px.
- Pé B (q5→q7): recua 2,5–3 px por quadro.
- Trocas de pé em q4→q5 e q7→q0.
- **Média ≈ 2,2 px por quadro, então escorrega ≈ 2,8 px por quadro (56% da velocidade).**

### Walk W

- Transições coerentes: 3,5 · 1,5 · 2 · 4,5 · 4 px. **Média ≈ 3,1, então escorrega ≈ 1,9 px por quadro (38%).**
- **Irregular entre q3 e q5:**
  - o pé que pousa em q3 (centro 20,5) aparece em 28,5 no q4, um salto de **+8 px**;
  - no q5 ele volta para 25,5, ou seja **−3 px**, andando para a frente.
- [H] Esse trecho deve aparecer como uma tremida ou um "patinar" do pé em W.

### Comparação e leitura

- **E e W juntos: recuo médio ≈ 2,6 px por quadro, escorregamento ≈ 2,4 px por quadro (≈ 48%).**
- **v1b no mesmo passo de 5 px:** recuo de 2 px por desenho, escorregamento de 3 px (60%).
- O v2 escorrega um pouco menos que o v1b a 50 ms, mas ainda escorrega.
- O C15b mediu o recuo por outro critério (ponto de contato). Lá foram 1,3–4 px no E e 1,5–4,5 no W, coerente com o que medi aqui.

### Recomendação, só para registro (a cadência ficou em 50 ms, como pede o brief)

- **Para travar o pé com a arte atual**, o passo teria de ser ~2–2,5 px no E (≈ 20–25 ms por quadro) e ~3 px no W (≈ 30 ms). Isso contradiz os 50 ms.
- **Para ter 50 ms com o pé travado**, a passada da arte E/W precisaria recuar ~5 px por quadro de forma uniforme, e o trecho q3–q5 do W precisaria ser corrigido. **Isso é trabalho de arte**, que fica com o game-art e com a decisão do Vitor. Não mexi em nenhum pixel.
- **S/N:** não há medida de deslizamento lateral, pela mesma convenção do v1b e do pacote.

## 4. Âncora, sombra e profundidade (critério 3) [E]

Valores lidos no jogo, a partir do manifesto montado (`links_c14_4b.json`):

| | v2 (padrão) | v1b (`&hawk=v1b`) |
|---|---|---|
| Canvas | 60×60 (sem crop) | 60×60 |
| Pivô (âncora, pé no chão) | (30, 49) | (30, 49) |
| Sombra de contato | cx 30, cy 49, rx 19, ry 7 | cx 30, cy 49, rx 19, ry 7 |
| Walk | 8 quadros × 4 direções, 5 px por quadro | 8 × 4, 5 px por quadro |
| Idle | 4 quadros × 180 ms (do pacote) | 6 quadros × 220 ms |

**Observações:**
- A profundidade (ordem de desenho) segue o pivô da entidade no mundo. Como o pivô é o mesmo, a profundidade é a mesma.
- O pacote v2 garante o pé em y = 49 nos 48 quadros (C15b §6).

## 5. O que mudou no código (commit `01f82b8`, `lab/hawkmon-v1b`)

- **`scripts/lab/import-hawkmon-v2.mjs` (novo):**
  - copia o pacote v2 para `a-hawkmon/digimon/LAB-HAWKMON/pixellab2/` e escreve o `lab-character.json`, com walk de 50 ms, `walkPxPerFrame` 5 e idle de 180 ms;
  - não toca no `pixellab1/` nem no resto de `a-hawkmon/`: o md5 do resto da pasta é `928eb541…` antes e depois;
  - se `pixellab2/` já existir, ela é movida para `_anteriores/`.
- **`src/main.ts` (+6/−3), só com `VITE_LAB_BUILD=hawkmon`:**
  - `HAWK_ART` (`?hawk=v1b`) fixa a versão `pixellab1` ou `pixellab2` do `LAB-HAWKMON` pelo mesmo mecanismo do `?pl=` (`parsePlPins`);
  - a faixa e o log do console mostram a versão;
  - `HAWK_WALK_PX_DEFAULT = 5` continua valendo para as duas versões, e `?hawkpx=` e `?hawkms=` continuam vencendo.
- **Build:** `VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-hawkmon VITE_LAB_BUILD=hawkmon npx vite build --outDir dist-lab-hawkmon`, depois `systemctl --user restart gs003-lab-hawkmon-5197`. Status `active`, HTTP 200.
- **Roteiros novos**, fora do jogo, em `workspaces/game-dev/tools/h143/`:
  - `pe_v2.mjs`, `pe_comp.mjs` e `pe_zoom.mjs` (pé de apoio);
  - `capturas_b.mjs` (cópia de `capturas.mjs` com `&time=dia` e um GIF de cena);
  - `ancora_b.mjs` (conferência dos links, do pivô e da sombra).

## 6. Testes e isolamento [E]

| Teste | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npx vitest run` | 526/530. As 4 falhas são as antigas de `tests/lab-duas-linhas.test.ts`, as mesmas do 14.4-A. Nenhuma falha nova |
| `npm run map:validate -- --no-write` | 9/9 PASS, sem reescrever relatório |
| Console e rede | 0 erros e 0 falhas em 11 sessões: `walk` v2, v2_r2, v1b e v2_agumon_ativo; capturas; e os 6 links do §1 |
| Database | `cd database && md5sum data/*.json \| md5sum` = `8b71f53e…`, igual ao 14.4-A. Arquivos com data de 11-12 |
| 5196 | ativo (200), não tocado |
| Arte | os PNG do v2 no build são idênticos aos do pacote (`cmp`), e `pixellab1` (v1b) não foi alterado |

## 7. Capturas e GIFs (`medicoes_c14_4b/capturas/`, URL com `&time=dia`)

| Arquivo | O que mostra |
|---|---|
| `cena_walk{E,W,N,S}_v2.gif` | **cena larga do mapa real**, a 2×: Hawkmon v2 com o Tamer, e ao lado o Tamer de comparação com o Agumon F7v2, andando e parando, nos tempos reais do screencast (~19 ms por quadro de captura) |
| `walk{E,W,N,S}_v2.gif` | recorte a 3× em volta do Hawkmon v2, com o Agumon ao lado |
| `walk{E,W,N,S}_meio_v2.png`, `tela_inicio_v2.png`, `tela_juntos_parados_v2.png` | telas inteiras |
| `../tela_padrao.png`, `../tela_hawk_v1b.png`, `../tela_parceiro_agumon.png` e outras | uma tela por link do §1 |
| `../pes_walk_EW_8x.png` | pés ampliados 8×, walk E/W, v2 e v1b |

**Leitura visual [H]:**
- Conferi duas telas: o Hawkmon v2 aparece no mapa ao lado do Tamer, do Tamer de comparação e do Agumon, com a faixa "v2".
- A avaliação de qualidade da animação no jogo fica com o game-qa, o ChatGPT e o Vitor.

## 8. Limitações e o que não foi feito

- Medição em headless sem GPU, a 60 Hz. Não testei em monitor de 120/144 Hz.
- Os GIFs são grandes (5–6 MB cada) porque guardam os tempos reais do screencast.
- O escorregamento do pé (§3) não foi corrigido. É arte e está fora do escopo. O trecho q3–q5 do W é o ponto mais provável de incômodo [H].
- O manifesto do v1b continua com `walkPxPerFrame: 2`. O padrão de 5 px vem do `main.ts`, como no 14.4-A. O do v2 já nasce com 5.
- O retrato e o ícone do HUD usam a arte da versão carregada. Não conferi isso com lupa.
- O Q3 do QA (a faixa não muda depois do `Tab`) continua sem correção, fora do escopo.
- O formato de save não mudou.
- Nenhum pixel foi editado. Sem PixelLab, sem merge, sem push, sem deploy. Jogo principal, Database e 5196 não foram tocados.

## 9. Decisões do fundador / ChatGPT

1. Confirmar o v2 como o Hawkmon do build depois do QA, ou voltar ao v1b (`&hawk=v1b` já permite comparar).
2. Escorregamento do pé a 50 ms (~48% da velocidade no v2) — escolher uma das três opções:
   - aceitar como está;
   - pedir ao game-art uma passada E/W mais longa e uniforme (~5 px por quadro), com correção do q3–q5 do W;
   - aceitar um passo menor, de ~2,5–3 px (~25–30 ms por quadro).

## Crédito
Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei). Este é um fangame não oficial, sem licença. A base do Hawkmon v2 vem do C15a (referência ChatGPT, direção do Vitor) e a animação do C15b (PixelLab + limpeza local). Camada `private-prototype`. **Não homologado.**
