# QA — Prova de escala Guilmon 64px (`phase2/art/scale-proof/`, commit `ce83237`)

- **Autor:** game-qa, papel VISUAL-QA (GS-010 §9) · **Data:** 2026-11-10
- **Revisão independente** de `phase2/art/scale-proof/` (README, `board/proportion_board.png`, `board/compare_scale.html`, `pipeline-b64/`), produzido por game-art. Este QA não aprova nem reprova — registra evidência para a decisão do fundador (ADR-012 §3). Nenhum arquivo de arte foi alterado; nenhum arquivo deste diretório foi tocado.
- **Comparação com:** `phase2/qa/QA_GUILMON_PROTO.md` (meu QA do piloto anterior, pipeline-b 48×48) e `evidence/drakantos-video/`.
- **Metodologia:** os PNGs de `pipeline-b64/` foram enviados a um endpoint de upload temporário do PixelLab (`get_upload_url`, expira em 3 dias, não grava nada no estúdio) para inspeção ampliada com `pixelart_workbench inspect` (leitura, sem custo). Adicionalmente, escrevi um diff **pixel a pixel** comparando `pipeline-b64/rotations/south.png` contra (a) um upscale nearest×2 mecânico do frame nativo do rip (`CREATURE-0003_walk_S_01.png`, 30×34) e (b) a própria `reference/guilmon_S_ref_2x.png` enviada ao PixelLab, usando o decoder PNG puro-stdlib do próprio `scripts/nearest_upscale.py` (zero geração, zero custo).

---

## 1. Achado central: a imagem mais usada na prova (`south.png`) não foi redesenhada

O README (§4) e `board/compare_scale.html` (§2 e §4) afirmam que o PixelLab "redesenhou a silhueta em 60×68px com antialiasing próprio, separando visualmente o focinho da cabeça, os dois olhos, a faixa clara do peito e as garras das quatro patas" — e usam `pipeline-b64/rotations/south.png` como a imagem "Guilmon 64 (esta prova)" tanto na prancha de proporção quanto na seção 2 do HTML comparativo, a peça mais visível de toda a entrega.

**Essa afirmação é falsa para este arquivo especificamente.** Diff pixel a pixel (1.544 pixels visíveis, alpha>0):

- **99,74% idênticos** (1.540/1.544) a um upscale nearest-neighbor ×2 **mecânico** do frame nativo limpo do rip (`CREATURE-0003_walk_S_01.png`, 30×34px) — contagem de cor é exatamente 4× em 10 das 12 cores da paleta (ex.: `#212121` 139→556, `#ff1000` 29→116, `#6b1008` 70→280).
- **99,74% idênticos** também à `reference/guilmon_S_ref_2x.png` que o próprio README documenta ter enviado ao PixelLab.
- A **única diferença** são 4 pixels (bloco 2×2 em x=22-23,y=44-45) de cinza `#808080`, cor que não existe em nenhuma das duas fontes — uma correção pontual, não um redesenho.

Isso **não é um bug do PixelLab**: é o comportamento documentado da própria ferramenta (`create_character` modo v3 com referência: "kept as drawn as the south view" — a direção Sul é mantida como enviada, só as outras 7 direções são geradas de verdade). O erro é do **método do README**, que apresenta esse arquivo inalterado como evidência de ganho de detalhe/legibilidade. Na prática, `south.png` é literalmente o rip original (30×34) em blocos 2×2 — inclusive herdando **integralmente** o ruído do rip: os "dois olhos" são o mesmo par de pontos cinza/branco desalinhados do original, e a "faixa clara do peito" é a mesma mancha salpicada de vermelho/marrom que já existia em 30×34, só que agora em blocos maiores e mais visíveis como ruído.

## 2. Nas direções/quadros que *foram* gerados de verdade, o quadro é misto — não uniformemente ruidoso nem uniformemente limpo

Inspecionei em zoom alto (`pixelart_workbench inspect`, escala 8×) 3 views genuinamente geradas pelo v3 (não "kept as drawn"): `rotations/south-west.png`, `walk-s/frame_02.png`, `walk-sw/frame_02.png`.

- **Rosto/olhos:** nas 3, a "cara" continua sendo 1–2 manchas cinza/branca isoladas dentro da massa vermelha da cabeça, sem par de olhos simétrico nem pupila definida — **confirma a leitura do coordenador**, e vale tanto para as views geradas quanto para a view mecânica (south). Nenhuma das 4 views inspecionadas resolve isso.
- **Barriga/peito:** **inconsistente entre quadros**, ao contrário do que o README sugere (ganho uniforme). `walk-s/frame_02.png` tem a barriga mais limpa que vi em qualquer quadro desta prova — um retângulo creme com uma marcação interna definida, sem salpicado vermelho. `walk-sw/frame_02.png` tem uma coluna clara central razoavelmente legível. `south.png` (mecânico) é o pior caso, pelo motivo da seção 1. Ou seja, **a escala maior não garante clusters limpos por si só** — depende de se o quadro foi de fato regenerado e de como o v3 resolveu aquele ângulo específico.
- **Corpo/silhueta vermelha:** nas views geradas há tentativa real de bandas de tom (`#ff1000`/`#b51808`/`#6b1008`/`#9e1709`/`#cd1b05` etc., não cor chapada única) — mais perto do espírito de sombreamento por banda do `ART_DIRECTION_V2.md` §3 do que o rip original (que usa só 3 tons de vermelho). Ainda muito longe do Drakantos (`evidence/drakantos-video/`, bandas de material + luz ambiente colorida + contorno por contraste), mas é uma direção certa, não ruído puro.

## 3. Paleta continua crescendo sem trava — mesmo risco do piloto anterior, não resolvido

| Arquivo | Nº de cores | Observação |
|---|---:|---|
| `rotations/south.png` (mecânico) | 12 | = paleta do rip nativo (11) + 1 cor nova pontual |
| `rotations/south-west.png` (gerado) | 31 | |
| `walk-s/frame_02.png` (gerado) | 23 | |
| `walk-sw/frame_02.png` (gerado) | 40 | |

Mesma ordem de grandeza do piloto anterior (pipeline-b 48×48: 30→42→43 cores, `QA_GUILMON_PROTO.md` §5). O README desta prova não menciona paleta nem aplica `palette=`/`reduce_colors` para travar — a recomendação que eu já tinha feito no QA anterior não foi aplicada aqui.

## 4. Consistência de silhueta entre quadros do idle — sem deriva grave na amostra testada

Contagem de pixels visíveis nos 4 quadros de `idle-s/`: 1314, 1345, 1356, 1332 (variação ~3%) — não reproduz, nesta amostra, o defeito de deriva (ombros visivelmente mais estreitos num quadro) que o piloto anterior registrou em `pipeline-b/idle-s` 48×48. Inspeção visual complementar dos 4 quadros não mostrou mudança óbvia de proporção. **Ressalva:** verifiquei só por contagem de pixel + inspeção visual rápida, não quadro-a-quadro em zoom como fiz no QA anterior (ver limitações).

---

## 5. Notas (0–10)

| Critério | Nota | Evidência principal |
|---|---:|---|
| **Identidade** | 6/10 | Cor/proporção geral mantidos nas 20 saídas; sem deriva grave na amostra testada (§4). Mas a "identidade preservada" em `south.png` não é mérito do método — é art inalterada (§1). Paleta sem trava é risco real de deriva futura em escala (§3). |
| **Legibilidade / clusters** | 4/10 | Olhos nunca formam cluster legível em nenhuma das 4 views inspecionadas (§2). Barriga inconsistente: limpa em `walk-s` frame 2, salpicada em `south.png` — e é justamente `south.png` a imagem mais exposta no board/HTML (§1). A leitura do coordenador está **majoritariamente confirmada**, mas a causa raiz não é "a IA pintou ruído" — é a ausência de regeneração na view mais usada. |
| **Animação idle/walk** | 5/10 | Variação de silhueta no idle é pequena (~3%, §4) — melhora sobre o defeito do piloto anterior. Attack/hurt e as outras 6 direções seguem não testados. Peso/contato com o chão não foi re-verificado nesta revisão (fora do escopo desta vez). |
| **Consistência entre quadros** | 4/10 | Paleta cresce por clipe (12→23→31→40) sem trava, mesmo problema do piloto anterior, não endereçado (§3). |

**Nenhum critério atinge a meta de 9/10 (GS-010 §8); nenhum passa do piso de 8.**

## 6. Veredito: a escala maior melhorou ou piorou vs. o rip 30px?

**Depende de qual arquivo se olha — e isso é o problema.** A hipótese do README ("resolução nativa maior produz detalhe real, não um sprite ampliado") é **verdadeira só para as views genuinamente regeneradas** (`south-west`, quadros de `walk-s`/`walk-sw`), onde há bandas de tom novas e, em pelo menos um quadro, uma barriga mais limpa que o original. Mas a peça mais visível da entrega — `south.png`, usada na prancha de proporção e no topo do `compare_scale.html` — **não é uma geração nova**: é o rip original em blocos 2×2, ruído herdado incluído, e as alegações de "faixa clara do peito" e "dois olhos" visíveis nessa imagem específica descrevem o **rip antigo**, não um resultado desta prova. Nessa peça, a escala maior **não melhorou nada** — só tornou o ruído pré-existente mais visível (blocos maiores = manchas maiores).

## 7. O que precisa mudar no método

1. **Não usar `south.png` (ou qualquer direção "kept as drawn") como evidência de ganho de detalhe.** Se o objetivo é provar que resolução maior + v3 produz redesenho real, a prancha/HTML precisam mostrar uma direção efetivamente gerada (ex. `south-west.png`) como peça principal, não a direção que o próprio modo v3 documenta manter inalterada.
2. **Travar paleta** (`palette=` ou `reduce_colors` pós-geração) antes de escalar para o roster completo — mesma recomendação do QA anterior, ainda pendente.
3. **Testar regeneração completa da direção Sul** (via modo `pro`, que aceita referência em qualquer ângulo e não tem o comportamento "kept as drawn") se a meta for eliminar o ruído herdado do rip também nessa direção — dentro do teto de geração, ciente do custo maior (10–25 gerações) que o próprio README já identificou como limitação.
4. **Olhos:** nenhuma via testada até agora (piloto anterior ou esta prova) produziu um cluster de olho legível — vale um teste dirigido (prompt explícito pedindo "dois olhos amarelos distintos com pupila" ou correção manual pontual via `inpaint_image`) antes de declarar a escala 64px suficiente para leitura facial.

---

## 8. Limitações deste QA

- Inspecionei em zoom alto 4 das 20 saídas desta prova (`south.png`, `south-west.png`, `walk-s/frame_02.png`, `walk-sw/frame_02.png`) + os 4 quadros de `idle-s/` por contagem de pixel/inspeção visual rápida. Não fiz inspeção quadro-a-quadro em zoom de `idle-sw/` nem dos demais quadros de `walk-s/walk-sw` — não posso garantir que o defeito de deriva do piloto anterior esteja ausente em 100% dos 20 quadros, só na amostra verificada.
- Não re-testei contato com o chão/alternância de pé nesta revisão (o QA anterior já cobriu isso para o pipeline-b original; esta prova não muda a lógica de animação, só a escala/referência de entrada, então não priorizei re-verificar).
- O diff pixel-a-pixel (§1) é exato e determinístico (decoder PNG próprio, sem aproximação), mas só foi feito para `south.png` contra as duas fontes candidatas — não repeti esse diff para as outras 7 rotações/animações.
- Attack/hurt, as outras 6 direções e qualquer outra criatura do roster continuam fora do escopo, como o próprio README admite.
- Não revisei `board/compare_scale.html` nem `proportion_board.png` quanto a exatidão de escala/alinhamento de pixel (ex. se o fator ×4/×5 é realmente uniforme entre tile/Tamer/Guilmon) — só quanto ao conteúdo de arte que eles exibem.
