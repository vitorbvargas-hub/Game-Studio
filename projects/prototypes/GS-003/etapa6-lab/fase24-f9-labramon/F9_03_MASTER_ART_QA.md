# F9_03 — QA da arte-mestra: Labramon (Fase 2)

Digital Odyssey (GS-003) · F9 Labramon · Fase 2 · 2026-11-15 (BRT) · Autor: `game-art` (Opus 5.5) · Comando `COMANDO_F9_LABRAMON.md` §6.
Fan game não oficial, sem licença, sem monetização; nada publicado. **[E]** evidência · **[H]** hipótese.
Esta é a validação de entrada da direção de arte; **não é** o QA independente (Fase 10, `game-qa`) nem homologação.

## 1. Troca de arte-mestra (registro obrigatório)
- **Principal: v2 EM PÉ** — `arte_mestra/labramon_arte_mestra_v2_em_pe_chatgpt.png` (1536×1024, fundo magenta, SHA-256 `f56030d7…a7a2`). Gerada pelo Vitor no ChatGPT e enviada ~23:40 de 2026-11-15 (aviso do `game-studio` em `ATENCAO_ARTE_MESTRA_V2.md` e `PROGRESS.md`).
- **Secundária: v1 SENTADA** — `arte_mestra/labramon_arte_mestra_v1_chatgpt.png` (SHA-256 `9303e83a…c2`). Só referência para descanso/sono (Fase 6). **Não** foi convertida em pé; nenhuma geração gasta nela (processada só localmente em `rotacoes_sentado/`).
- `arte_mestra/print_chat_chatgpt.png` mostra o pedido no ChatGPT e o resultado v1 (grade pedida: blocos 8×8). Não houve revisão minha dentro do ChatGPT; o navegador do ChatGPT está inacessível e não foi usado.
- Geração da arte-mestra: **feita pelo Vitor** (não BLOQUEADA). Nenhuma substituição por outro gerador.

## 2. Medições da folha v2 [E]
| Vista (posição) | Direção | bbox na folha (x0,y0–x1,y1) | L×A (px) |
|---|---|---|---|
| 1 frente | S | 63,338–295,688 | 233×351 |
| 2 costas | N | 365,338–595,688 | 231×351 |
| 3 virado à esquerda | W | 656,338–1042,688 | 387×351 |
| 4 virado à direita | E | 1096,338–1472,688 | 377×351 |
- **Mesma altura (351 px) e mesma linha de chão (y=688) nas 4 vistas** → escala e contato consistentes.
- Perfil 1,10× mais largo que alto → coerente com o sprite oficial (REF-05).
- Grade real ≈ **6 px por pixel de arte** (unzoom de N e W: 60 linhas em 363 px), não os 8×8 pedidos; S e E foram detectados numa grade mais fina (~4 px) pelo `unzoom_image`. Não afeta o resultado: a escala final foi aplicada localmente, igual nas 4.
- **E não é espelho de W** [E]: depois da limpeza, E comparado com W espelhado difere em 52,7% dos pixels (486/922). Diferenças visíveis: posição da orelha sobre a gola, recorte do capuz, desenho da cauda.

## 3. Checklist dos 10 invariantes (F9_01 §5.2)
Inspeção visual da folha original e dos recortes ampliados (`tmp-f9/work/v2_crop_*.png`, `unz_*_4x.png`).

| # | Invariante | S | N | W | E | Resultado |
|---|---|---|---|---|---|---|
| 1 | Quadrúpede compacto, pernas curtas e grossas, 4 patas | 2 dianteiras visíveis (traseiras ocultas pela perspectiva) | 2 traseiras + pontas das dianteiras | 4 | 4 | **PASSA** |
| 2 | Capuz branco com franja em zigue-zague sobre os olhos | franja em mechas pontudas | borda em zigue-zague na nuca | sim | sim | **PASSA com ressalva**: a franja da frente lê mais como "franja de cabelo" que como zigue-zague serrilhado (risco já previsto no F9_01 §7b) |
| 3 | Duas orelhas longas caídas rosa-vinho saindo do capuz | sim | sim | 1 (a outra oculta) | 1 | **PASSA** |
| 4 | Focinho curto, nariz preto, presa branca | 2 presas, nariz preto | — | 1 presa, nariz preto | 1 presa, nariz preto | **PASSA com ressalva**: de perfil o focinho é um pouco mais longo que no Reference Book |
| 5 | Íris vermelha | sim | — | sim | sim | **PASSA** |
| 6 | Duas listras rosa-vinho diagonais em cada bochecha | 2–3 traços por lado | — | 2–3 | 2 | **PASSA** (RB também tem 2–3, D5) |
| 7 | Gola branca em zigue-zague | sim | — (costas) | sim | sim | **PASSA** |
| 8 | Garras grandes claras, 3 visíveis por pata | 3 por pata dianteira | 2–3 nas traseiras | 2–3 | 2–3 | **PASSA** |
| 9 | Uma cauda em espiral plana listrada, rosa-vinho, grande | oculta atrás do corpo | espiral no centro do dorso | disco erguido atrás | disco erguido atrás | **PASSA** (uma só; nenhuma duplicação) |
| 10 | Corpo branco/creme, ornamentos na mesma família, sem acessório | sim | sim | sim | sim | **PASSA** — sem coleira, roupa ou símbolo |

Critérios de rejeição do comando §6: espécie descaracterizada — não; anatomia errada — não; patas extras — não; direções inconsistentes — não (mesma altura/cores); cores mudando entre vistas — não; corpo variando entre vistas — não.

## 4. Decisão da Fase 2
**APROVADA COMO ARTE-MESTRA CANDIDATA** para a Fase 3 e seguintes, com ressalvas registradas (não bloqueiam):
1. Franja frontal mais "cabelo" que serrilhado (invariante 2).
2. Focinho de perfil um pouco longo (invariante 4).
3. Rosa mais saturado que o mauve do Reference Book (divergência D2) — fica entre RB e Toei 2001.
4. Vista de costas é interpretação (lacuna L1, sem referência oficial de costas).
Nenhuma ressalva justifica nova geração. Quem decide se o design passa é o QA independente e o fundador.

## 5. Resultado técnico da Fase 3 (resumo; detalhes em `rotacoes/manifesto.json`)
- `rotacoes/labramon_{S,N,W,E}.png`: 60×60, altura 36 px nas 4, pé em y=49, pivô X 29,5 no centro das patas, 0 semitransparência, 0 resíduo magenta, **19 cores** compartilhadas.
- Legibilidade a 1x após a redução (risco para o QA): olho vermelho 2–3 px; presa e listras da bochecha viram 1–2 px; em W o rosto ficou mais "borrado" que em E. Espiral, orelhas, gola e capuz continuam claros.
- Prancha de escala: `prancha_escala_1x.png` / `prancha_escala_4x.png` (Tamer v13, Agumon F7v2, Hawkmon v2, Labramon S/N/W/E, sentado S/W, chão com grade de 32 px).
