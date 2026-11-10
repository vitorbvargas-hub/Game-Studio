# QA Fase 3 — Rodada 2 (R2): reavaliação P1/P2 (GS-003, branch `quality-overhaul`)

- **Autor:** game-qa (VISUAL-QA) · **Data:** 2026-11-10
- **Base:** `phase3/qa/QA_PHASE3.md` (QA R1, notas 6/6/6/6/6/6, integração 8) e `phase3/P7_GS012_DEV_R2.md` (game-dev, commits `52d23f2`/`39e23c3`/`231dba6`, worktree `~/projects/GameStudio/workspaces/game-dev/qo`).
- **Método:** leitura do DEV_REPORT R2; inspeção de todas as 28 PNGs `_r2` em `phase3/img/`; recortes próprios em alta ampliação (NEAREST 2–3×) com Python/PIL (`shared/tools/sd-local/.venv`) do topo do platô do mirante e do canto do aviso legal, para checar detalhes que as capturas de tela inteira não deixam claros; reexecução de `npm test` uma vez no worktree `qo` (`projects/prototypes/GS-003/prototype/world`), sem alterar nada. Tentei abrir o servidor 5190 pelo navegador para captura própria do estado combinado atual — **bloqueado pela política da sessão** (ver Limitações); recorri às capturas entregues + recortes.
- **Não alterei código nem dados.** Os recortes gerados por mim estão em `phase3/qa/img/qa_r2_*.png`.
- **Legenda:** **[E]** evidência própria (captura ou recorte citado, ou comando reexecutado por mim) · **[E-dev]** número do DEV_REPORT, não reproduzido por mim · **[H]** hipótese/julgamento de QA.

---

## 1. Notas (0–10) — mesmos critérios da R1, comparação lado a lado

Meta de homologação continua: média ≥9, nenhuma categoria <8.

| Critério | R1 | R2 | Evidência R2 |
|---|---:|---:|---|
| Qualidade do cenário | 6 | **7** | Mirante: a face do penhasco ganhou musgo, raízes pendentes, 4 variantes por célula e cantos irregulares — deixou de ser faixa lisa (`p7_mirante_depois_v9kit_dia_r2.png` vs `p7_mirante_antes_v8_dia_r2.png` [E]). Mas o **topo do platô continua pedra cinza-arroxeada granulada**, e há uma **faixa verde retangular** cruzando o topo, claramente um recorte de camada antiga mal integrado (`qa_r2_mirante_seam_zoom.png`, recorte próprio em 3× [E] — ver §2.1). Sobe 1 ponto pela face, não mais porque o problema original (laje genérica) só foi resolvido pela metade. |
| Profundidade e composição | 6 | **8** | A oclusão de primeiro plano agora é real e visível a olho nu nas 3 capturas `_zoom_r2` (ponte-oeste, ponte-leste, baú): o Tamer aparece com a cabeça e o peito à mostra e a metade inferior do corpo dentro da moita — não mais "ao lado" como na R1 [E, confirmado nas 3 imagens]. A medição do dev (50/53/56% do corpo de 34 px) bate com o que se vê. Não chega a 10 porque a cobertura só vale no eixo da trilha (o próprio dev estima queda para ~10–30% na borda norte [E-dev, não verificado por mim) e porque não há galho/folhagem pendente no topo da tela, como o brief original também pedia. |
| Iluminação e efeitos | 6 | **8** | Contraste dia/noite agora é nítido: a captura "dia" tem tom verde/dourado claro e luz de archote quente, claramente distinta da "noite" azul-escura com vinheta (`p7_clareira_depois_v9p7_{dia,noite}_r2.png` [E] — comparação direta, ver §2.2). Resolve de fato a queixa da R1. Não é 9–10 porque as 5 luzes à noite eu continuo sem contar célula a célula (mesma limitação da R1). |
| Vida ambiental | 6 | **7** | Grama alta de encontro agora é massa visível e distinta do chão: touceiras verde-azuladas de ~24×26 px com ponta clara, 74 unidades nas 2 zonas novas, claramente mais altas e densas que a grama comum ao redor (`p12_grama_alta_zona_{dia,noite}_r2.png` [E]). Puxa a nota para baixo: (a) as 5 áreas de encontro antigas da tabela **não** usam a grama nova — mistura visual entre zonas [E-dev, consistente com a ausência de capturas dessas áreas]; (b) a legibilidade do salto melhorou no texto (ícone "!" e placa de nome aparecem em quadros distintos) mas o **arco do pulo em si continua quase imperceptível em quadro parado** — no sheet de 6 quadros, o alvo (Tentomon) só aparece visível a partir do 4º quadro, sem posição intermediária clara de queda (`p12_encontro_sequencia_6q_r2.png` [E] — ver §2.3); o próprio dev admite que o tremor da grama "só se percebe no vídeo". |
| Consistência artística | 6 | **7** | O aviso legal virou um ícone "i" discreto de ~24 px no canto inferior esquerdo, sem mais competir com o cenário (`qa_r2_legal_icon_zoom.png`, recorte próprio [E]). Mas o HUD de debug (painel de combate com raridades/odds) continua visível nas capturas usadas para avaliar arte (`p12_encontro_7_combate_debug_r2.png` [E]), e a costura verde no topo do mirante (ver acima) é um defeito de acabamento novo que compete com a leitura de "cenário pronto". |
| Integração com gameplay | 8 | **8** | Sem regressão aparente; `npm test` reexecutado por mim deu **38 arquivos / 357 testes verdes em uma única rodada** [E, reproduzido], batendo com o número do DEV_REPORT. Mantém a nota da R1 — não há evidência nova de ciclo de jogo (o vídeo é o mesmo da R1, pré-kit do mirante), então não subo além do que já estava confirmado. |

**Média R2:** (7+8+8+7+7+8)/6 = **7,5** (R1: 6,3). Melhora real, mas ainda abaixo da barra de homologação (≥9, nenhuma <8) — 4 das 6 categorias seguem abaixo de 8.

---

## 2. Verificação ponto a ponto

### 2.1 Mirante (P1-1) — **parcial**

- **Resolvido:** a laje lisa e genérica da R1 não existe mais na face do penhasco. O kit `forest-v9-cliffs` trouxe musgo, raízes penduradas, cantos irregulares e 4 variantes por célula (confirmado visualmente comparando `p7_mirante_antes_v8_dia_r2.png` × `p7_mirante_depois_v9kit_dia_r2.png` [E]).
- **Não resolvido:** o topo do platô (as 3 fileiras onde o Tamer efetivamente pisa e onde fica a maior parte da área visível do mirante) continua uma textura de pedra cinza-arroxeada granulada, indistinguível de piso comum de penhasco — não lê como "mirante" por si só. Pior: há uma **faixa verde retangular nítida** atravessando o topo (visível tanto de dia quanto de noite), um recorte de camada antiga que não foi coberto pelo novo kit. Ampliei 3× a região central do topo e o defeito é bem visível: `phase3/qa/img/qa_r2_mirante_seam_zoom.png` [E]. Comparação lado a lado do platô (recortes 2× feitos por mim): `qa_r2_mirante_antes_platformcrop.png` × `qa_r2_mirante_depois_platformcrop.png`.
- **Veredito:** o próprio DEV_REPORT já assume isso como limitação ("o topo ainda lê como pedra cinza... pede iteração do game-art"); minha inspeção confirma e adiciona o detalhe da costura verde, que é um defeito de acabamento, não só de estilo — provavelmente mais rápido de corrigir (cobrir/recortar a camada antiga) do que o problema de textura em si.
- **Atenção adicional:** as capturas gerais de clareira (`p7_clareira_depois_v9p7_*_r2.png`) e o vídeo foram gravados **antes** do kit entrar — mostram o mirante com a laje antiga. Isso significa que não existe nenhuma captura "depois" mostrando o mirante **integrado ao resto da cena** (iluminação, grama alta, FG) ao mesmo tempo — só as 4 capturas dedicadas `p7_mirante_*_r2` isolam o POI. Não é possível confirmar visualmente se o mirante com kit se encaixa bem no conjunto da clareira sem uma nova rodada de captura.

### 2.2 Oclusão de primeiro plano (P1-2) — **resolvido**

- As 3 capturas `_zoom_r2` (ponte-oeste, ponte-leste, baú) mostram o Tamer com a cabeça e parte do tronco visíveis acima da moita e a parte inferior do corpo genuinamente dentro da massa verde — diferença clara em relação à R1, onde o personagem aparecia ao lado da moldura [E, inspeção direta das 3 imagens].
- A medição do dev (50%/53%/56% de cobertura de um corpo de 34 px, acima do pedido de ≥45%) é plausível pelo que se vê; não refiz a medição pixel a pixel, mas a proporção visual bate.
- **Ressalva do próprio dev, não verificada por mim:** a cobertura cairia para ~10–30% fora do eixo central da trilha [E-dev, estimativa geométrica, não captura]. Não há imagem demonstrando esse caso pior.
- Este P1 está **resolvido** dentro do cenário testado (Tamer no eixo da trilha); não está provado para o caso geral de caminhar pela borda.

### 2.3 Legibilidade do salto/encontro (P1-3) — **parcial**

- **Melhorou:** o ciclo passou de 1,2 s para 2,0 s, com 5 fases distintas no código (grama, alerta, salto, pouso, placa). Nos 6 quadros estáticos entregues (`p12_encontro_sequencia_6q_r2.png` [E]), dá para seguir uma progressão textual clara: sem ícone → balão "!" aparece e persiste em 3 quadros → nome placa "TENTOMON Nv.3" aparece nos últimos 2. Isso é uma melhora real de legibilidade sobre a R1, onde nada distinguia os quadros.
- **Não resolvido:** o elemento central do pedido — "ver o personagem saltando da grama" — continua fraco em quadro parado. Nos 6 quadros, o Tentomon-alvo só fica visível a partir do 4º quadro (fase "salto_desce"), sem pose intermediária de arco/voo nos quadros 1–3; ele "aparece" quase abruptamente, não se vê "saltando". O próprio dev reconhece isso para o tremor da grama ("só se percebe no vídeo") e a mesma limitação vale para o arco do salto.
- **Veredito:** resolvido para quem assiste ao vídeo em tempo real (2 s dá folga); ainda não resolvido para avaliação por captura estática, que é como este QA (e qualquer revisão rápida de arte) normalmente inspeciona a peça.

### 2.4 Rótulo legal fixo (P2-4) — **resolvido**

- Confirmado por recorte próprio ampliado: o aviso virou um círculo "i" de ~24 px no canto inferior esquerdo, sem texto fixo ocupando a tela (`phase3/qa/img/qa_r2_legal_icon_zoom.png` [E]). Não compete mais com o cenário.

### 2.5 Grama alta indistinta (P2-5) — **resolvido (nas 2 zonas novas)**

- As capturas `p12_grama_alta_zona_{dia,noite}_r2.png` mostram touceiras altas, densas e de cor distinta (verde-azulado saturado com ponta clara) claramente separadas do chão comum ao redor — resolve a queixa original de "tufos finos e esparsos" [E].
- **Mas:** por admissão do próprio DEV_REPORT, as 5 áreas de encontro antigas (fora da clareira piloto) continuam com a grama anterior — ou seja, a correção é local, não sistêmica. Um jogador que passar por outra área de encontro no mapa vai ver a grama antiga de novo.

### 2.6 Contraste dia/noite fraco (P2-6) — **resolvido**

- Comparação direta `p7_clareira_depois_v9p7_dia_r2.png` × `p7_clareira_depois_v9p7_noite_r2.png`: a versão "dia" tem paleta verde/dourada claramente mais clara e quente (luz de archote visível, sombras rasas) contra a versão "noite" azul-escura com vinheta pesada — nada parecido com a R1, onde as duas pareciam quase igualmente escuras [E]. Resolvido.

---

## 3. Verificação das alegações numéricas do dev

| Alegação do DEV_REPORT | Verificação |
|---|---|
| Cobertura de FG 50%/53%/56% do Tamer | **Plausível por inspeção visual** [E, não remedida pixel a pixel]; consistente com as 3 capturas `_zoom_r2`. |
| Salto em 2,0 s, 5 fases | **Confirmado pelo código citado** (`INTRO_TICKS = 20`) e pelos 6 quadros com timestamps distintos (267–2065 ms) [E-dev para os tempos exatos, não recronometrados por mim]; a existência de 5 fases nomeadas é visível nos próprios nomes de arquivo e nos textos dos quadros. |
| `npm test`: 38 arquivos, 357 testes verdes | **[E] Reproduzido por mim** — rodei `npm test` uma vez no worktree `qo` (`projects/prototypes/GS-003/prototype/world`): **38 arquivos passed (38), 357 testes passed (357)**, 13,78 s, sem falhas, incluindo `tests/look-v9.test.ts` (11/11 verdes nesta rodada). Não reproduzi a instabilidade relatada pelo dev (1 falha em 6 rodadas) — consistente com ele descrevê-la como intermitente, não recorrente. |
| `npm run build` ok, `map:validate` 8/8, `sim.mjs --check` ok | **Não reexecutados** — aceito como [E-dev], fora do pedido específico desta tarefa (só `npm test`). |

---

## 4. O que falta para 9/10, em ordem de impacto

1. **Textura do topo do platô do mirante + costura verde visível.** É o defeito mais chamativo que sobrou: aparece em toda captura "depois" do mirante e é o elemento que mais lê como "inacabado". Cobrir/recortar a camada antiga (a faixa verde) é provavelmente rápido; a textura de grama/musgo no topo é trabalho de arte (kit) pendente, já identificado pelo próprio dev.
2. **Recapturar a clareira geral + vídeo com o mirante já integrado.** Hoje não existe nenhuma imagem ou vídeo mostrando mirante+grama alta+FG+contraste dia/noite juntos no mesmo quadro — a avaliação de conjunto fica fragmentada entre capturas de rodadas diferentes.
3. **Arco do salto legível em quadro estático**, não só no vídeo. Um quadro intermediário de "metade do arco" (silhueta no ar, sombra pequena) entre "grama" e "pouso" resolveria a maior parte da reclamação, sem precisar aumentar ainda mais o tempo total.
4. **Grama alta nova nas 5 áreas antigas de encontro**, para não haver duas identidades visuais de "zona de grama alta" no mesmo mapa.
5. **Causa da falha intermitente em `look-v9.test.ts`** (1/6 execuções, segundo o dev) — não bloqueia, mas vale investigar antes de considerar a peça fechada.
6. **HUD de debug fora das capturas de avaliação de arte** — usar um modo sem o painel ao julgar "cenário acabado", já que ele compete visualmente com o resultado.
7. **Oclusão de FG fora do eixo da trilha** — nenhuma captura prova o caso da borda norte (~10–30% de cobertura estimado pelo dev); se o jogador andar lá, a moldura "até a cintura" não se sustenta.

---

## 5. Limitações desta revisão

- **Não consegui abrir o navegador** para capturar o estado atual combinado do servidor 5190 (política da sessão bloqueou `browser.navigate`); toda a verificação de R2 se apoiou nas 28 imagens `_r2` entregues + recortes próprios ampliados feitos a partir delas, não em captura ao vivo.
- Reexecutei **apenas** `npm test`, conforme pedido; `npm run build`, `map:validate` e `sim.mjs --check` continuam como **[E-dev]**, não verificados por mim nesta rodada.
- Não contei luzes célula a célula nem medi a cobertura de FG pixel a pixel — julgamento visual sobre os números relatados pelo dev.
- O vídeo (`p12_clareira_passeio_encontro_r2.webm`) não traz nada novo em relação ao que já foi avaliado na R1 (é anterior ao kit do mirante); não reabri o vídeo quadro a quadro nesta rodada — a avaliação da integração de gameplay (nota 8) reaproveita a leitura da R1.
- Não testei entradas de borda (fuga, múltiplos encontros seguidos, caminhar fora do eixo da trilha) — seguem fora do escopo de uma revisão de mídia estática.
