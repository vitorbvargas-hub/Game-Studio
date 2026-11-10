# Fix local — Guilmon v3 (`phase2/art/scale-proof-v3-fix/`)

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-10
- **Pedido que autoriza:** correção local dos 2 defeitos apontados pela `game-qa` em `phase2/qa/QA_SCALE_PROOF_V3.md` sobre `phase2/art/scale-proof-v3/pipeline-m1/` — (1) paleta sem trava, 3º QA seguido a reportar o mesmo defeito; (2) corpo encolhe 36–47% ao animar. **Teto: 0 gerações PixelLab.** Confirmo: nenhuma ferramenta `pixellab__*` foi chamada nesta tarefa — todo o trabalho usa decoders/encoders PNG puro-stdlib Python (`zlib`/`struct`), mesmo padrão de `scale-proof/scripts/nearest_upscale.py` e `scale-proof-v3/scripts/compose_board.py`. Saldo de geração **inalterado** (deixo a verificação de `get_balance` para quem revisar, já que não chamei nenhuma tool paga).
- **Revisão independente:** este diretório fica pronto para o `game-qa` revisar — eu não aprovo meu próprio fix (ADR-012 §3). Nada aqui foi integrado ao jogo. `pipeline-m1/` original (v3) **não foi alterado nem apagado** — o fix vive inteiramente em `pipeline-m1-fixed/`, par a par com o original.
- **Entrada:** 12 arquivos de `scale-proof-v3/pipeline-m1/` (2 rotações estáticas + 4 quadros idle-S + 6 quadros walk-S, todos 64×64 RGBA 8-bit, confirmado via `IHDR` antes de processar).

---

## 0. Validação independente dos números do QA

Antes de corrigir, reproduzi a medição do `game-qa` com um script próprio (`scripts/measure.py`, bbox por alpha>0 + contagem exata de cor, mesmo método declarado no QA) para confirmar os números sem depender do relatório deles:

| Arquivo | bbox (W×H) | pés (ymax) | px visíveis | cores (α>0) |
|---|---:|---:|---:|---:|
| `rotations/south.png` (âncora) | 25×32 | 47 | 479 | 17 |
| `rotations/south-west.png` | 35×35 | 48 | 529 | 31 |
| `idle-s/frame_000..003` | 15–16×24–28 | 42 | 253–293 | 23–25 |
| `walk-s/frame_000..005` | 17×27–29 | 42–44 | 295–307 | 25–28 |

**Bate exatamente com `QA_SCALE_PROOF_V3.md` §1 e §4** (área idle 253–293/479 = 53–61% da estática, área walk 295–307/479 = 62–64%; união de cor idle = 26 (10 novas vs. south), walk = 28 (11 novas) — confirmado). Alpha é **binário** em todos os 12 quadros (só 0 ou 255, sem antialiasing suave) — isso simplifica os dois fixes: trava de paleta não precisa lidar com mistura de alpha, e realinhamento por translação inteira não introduz bordas fantasma.

**Achado novo nesta verificação:** o "pé" (linha `ymax` da bbox) cai de 47px (south) para 42–44px nos quadros animados — ou seja, o sprite animado não só encolhe, como **flutua ~3–5px acima** da linha de base da rotação estática, e o centro horizontal desvia ~1–1,5px. Isso não estava quantificado no QA original; é relevante porque separa dois problemas distintos: (a) jitter de posição (corrigível localmente, sem reamostragem) e (b) encolhimento real do corpo (não corrigível localmente, ver §2).

---

## 1. Fix — trava de paleta (resolvido, localmente, 0 geração)

### Método
`scripts/build_palette.py`: união de todos os pixels opacos (α>127) das 12 imagens, ponderada por frequência de pixel, agrupada em **k-means determinístico** no espaço RGB (inicialização por farthest-point a partir da cor mais frequente — sem RNG, reproduzível). `k=18`, dentro do teto de 16–20 pedido. Cada quadro é então remapeado: todo pixel opaco é trocado pela cor da paleta travada mais próxima (distância euclidiana em RGB); pixels transparentes (α=0) ficam intocados. `scripts/apply_fix.py` roda isso + o fix de escala (§2) e grava em `pipeline-m1-fixed/`.

### Paleta travada (18 cores, `board/master_palette.json` + `board/master_palette_swatch.png`)

| # | Hex | RGB | Material / rampa |
|---:|---|---|---|
| 1 | `#272223` | (39,34,35) | contorno/marcas pretas (base) |
| 2 | `#87291e` | (135,41,30) | vermelho — sombra escura |
| 3 | `#4d3a3a` | (77,58,58) | vermelho/marrom — sombra mais escura |
| 4 | `#b83b29` | (184,59,41) | vermelho — meio-tom |
| 5 | `#e55538` | (229,85,56) | vermelho — base (cor dominante do corpo) |
| 6 | `#d46e4f` | (212,110,79) | vermelho — luz 1 |
| 7 | `#f87856` | (248,120,86) | vermelho — luz 2 (salmão) |
| 8 | `#eda07a` | (237,160,122) | vermelho/pele — luz 3 (pêssego) |
| 9 | `#f2e7cc` | (242,231,204) | creme — barriga/focinho (base) |
| 10 | `#c4b492` | (196,180,146) | creme — sombra (cáqui) |
| 11 | `#a58973` | (165,137,115) | creme — sombra 2 |
| 12 | `#f7ea32` | (247,234,50) | amarelo — olho (base) |
| 13 | `#f6e466` | (246,228,102) | amarelo — olho (luz) |
| 14 | `#58595a` | (88,89,90) | cinza — garra/sombra |
| 15 | `#6f6864` | (111,104,100) | cinza — garra meio-tom |
| 16 | `#a1a1a2` | (161,161,162) | cinza — garra luz |
| 17 | `#cfcbc7` | (207,203,199) | branco/cinza-claro — garra/brilho |
| 18 | `#f5f2f2` | (245,242,242) | branco — brilho/olho (ponto de luz) |

*(a classificação de material no `master_palette.json` usa um heurístico automático por tonalidade que erra alguns casos de fronteira — ex. rotula alguns tons de amarelo como "red/body"; a tabela acima é a leitura manual, mais confiável, usada no resto deste relatório.)*

### Verificação — a trava segura o crescimento de cor entre clipes

| | Antes (`pipeline-m1`) | Depois (`pipeline-m1-fixed`) |
|---|---:|---:|
| Cores em `south.png` | 17 | 15 |
| Cores em `south-west.png` | 31 | 15 |
| União idle-s (4 quadros) | 26 (10 novas vs. south) | ≤18 (0 novas fora da paleta travada) |
| União walk-s (6 quadros) | 28 (11 novas vs. south) | ≤18 (0 novas fora da paleta travada) |
| **União de TODOS os 12 quadros** | **58** | **18** (confirmado por recontagem independente em `pipeline-m1-fixed/`) |

Recontei a união de cores nos 12 arquivos de saída depois do fix: **exatamente 18 cores distintas, nenhuma fora da paleta travada** — o defeito "paleta cresce por clipe sem trava" (3º QA seguido a reportar) está resolvido: qualquer novo clipe futuro, se gerado com a mesma paleta, não pode mais introduzir cor nova sem decisão explícita.

**Custo de qualidade:** a rampa de sombreamento (o ganho real elogiado em §2 do QA) foi **comprimida, não removida** — 17→15 cores no south, ainda com 4–5 tons de vermelho + contorno + creme + amarelo + cinza, visivelmente em rampa no board (ver §4). Perda principal: dos ~58 tons originais, muitos eram variações de 1–3 unidades de RGB entre si (ruído de geração, não sombreamento intencional) — a clusterização os absorveu nos vizinhos mais próximos, o que é o comportamento correto de uma trava de paleta.

---

## 2. Fix — escala instável (parcialmente resolvido; a causa raiz exige regeneração)

### O que É corrigível localmente, sem reamostragem: jitter de posição

Para os 10 quadros animados, apliquei uma **translação inteira** (`dx`, `dy` em pixels inteiros, sem redimensionar nada) para realinhar o pé (linha `ymax` da bbox) e o centro horizontal (`cx`) com a âncora (`south.png`, `cx=32.0`, `ymax=47`). É um recorte/realinhamento puro — nenhum pixel é reamostrado, borrado ou duplicado; só move.

| Quadro | dx | dy | pé antes→depois | cx antes→depois |
|---|---:|---:|---|---|
| idle f0–f3 | −1/−2 | +5 | 42→47 | 33→32 |
| walk f0 | −1 | +4 | 43→47 | 33→32 |
| walk f1,f2,f4,f5 | −1 | +3 | 44→47 | 33→32 |
| walk f3 | −1 | +5 | 42→47 | 33→32 |

Todos os 10 quadros ficam agora com o pé exatamente na mesma linha da âncora (`ymax=47`) e centro horizontal a 0–0,5px do centro do south — o "flutuar" identificado em §0 está eliminado.

### O que NÃO é corrigível localmente: o corpo continua menor

A translação **não muda a contagem de pixels nem a bbox W×H** de nenhum quadro — e não pode: o defeito é que o corpo foi desenhado menor pelo `animate_character(template=...)`, não que está deslocado. Corrigir isso exigiria redimensionar o conteúdo (reamostragem/upscale), que o pedido proíbe explicitamente ("sem reamostrar com borrão: só nearest inteiro ou recorte/realinhamento") — e mesmo um upscale nearest-neighbor **inteiro** não serviria aqui: a razão de encolhimento não é um fator inteiro limpo (ex. idle f0: 24/32 = 0,75×; walk f1: 29/32 = 0,906×). Um nearest-upscale 2× em cima disso superaria a âncora (48px ou 58px de altura) e quebraria a escala do canvas 64×64 na direção oposta. Não existe operação de recorte/realinhamento que aumente o número de pixels de um sprite sem inventá-los — isso é, por definição, reamostragem.

**Conclusão: a causa raiz não é corrigível localmente.** Conforme instruído, marco os quadros abaixo como **inválidos para uso em produção em escala "south" sem regeneração**, usando o critério: desvio de altura ≥10% em relação à âncora (abaixo de 10% considero dentro do ruído normal de pose/animação, ex. braço levantado muda a bbox sem ser "encolhimento"):

| Quadro | Altura (px) | vs. âncora (32px) | Veredito |
|---|---:|---:|---|
| `south-west.png` | 35 | +9,4%* | válido (referência, não animado) |
| `idle-s/frame_000` | 24 | **−25,0%** | **INVÁLIDO** |
| `idle-s/frame_001` | 27 | **−15,6%** | **INVÁLIDO** |
| `idle-s/frame_002` | 28 | **−12,5%** | **INVÁLIDO** |
| `idle-s/frame_003` | 25 | **−21,9%** | **INVÁLIDO** |
| `walk-s/frame_000` | 28 | **−12,5%** | **INVÁLIDO** |
| `walk-s/frame_001` | 29 | −9,4% | válido (dentro do limiar) |
| `walk-s/frame_002` | 29 | −9,4% | válido (dentro do limiar) |
| `walk-s/frame_003` | 27 | **−15,6%** | **INVÁLIDO** |
| `walk-s/frame_004` | 29 | −9,4% | válido (dentro do limiar) |
| `walk-s/frame_005` | 29 | −9,4% | válido (dentro do limiar) |

*south-west é maior, não menor, que south — esperado (pose 3/4 ocupa mais área), não é o defeito em questão.

**6 dos 10 quadros animados (todo o idle-s, mais 2 de 6 do walk-s) seguem inválidos para produção em escala mesmo depois do fix** — o melhor que o fix local entrega é posição estável; os 4 quadros do walk dentro do limiar de 10% são utilizáveis como estão (jitter de posição era o problema real neles), mas isso não é o caso do idle. `apply_fix.py` grava esse veredito por quadro em `board/fix_metrics.json` (`invalid_for_production_scale`).

---

## 3. Board antes/depois

- `board/before_after_v3fix.png` — nearest-neighbor ×6, puro-stdlib (`scripts/compose_board.py`). Linha 1 = original (`pipeline-m1`), linha 2 = corrigido (`pipeline-m1-fixed`). Colunas: south, idle f0, idle f2, walk f1, walk f4.
- `board/master_palette_swatch.png` — as 18 cores travadas, em faixa.
- Inspeção visual confirma: paleta mais coerente (sem ruído de 1–3 unidades de RGB entre tons vizinhos), silhueta/identidade preservada, pé agora alinhado entre as duas linhas — e o corpo animado continua visivelmente menor que o south em ambas as linhas (o defeito de escala, como documentado em §2, não desaparece visualmente, só a posição foi corrigida).

---

## 4. Fidelidade ao oficial (símbolo do peito, garras, proporções)

**Não consegui verificar contra arte oficial canônica do Guilmon nesta sessão** — `web_search` retornou "disabled or no provider available" na tentativa que fiz. É a mesma limitação que bloqueou o autor do README (`pipeline-m1`) e a `game-qa` (`QA_SCALE_PROOF_V3.md` §3, §7) — terceira tentativa seguida sem acesso a referência oficial. Não tenho base nova para mudar a nota de Identidade (6/10) dada pela QA. **[H]**, por conhecimento geral de treinamento sem fonte verificável nesta sessão: Guilmon (Digimon Tamers) é um dinossauro bípede vermelho, barriga/focinho creme, orelhas grandes, olhos amarelos com pupila vertical fina, marcas pretas triangulares pelo corpo/cauda, e uma marca preta no peito (o símbolo "Digital Hazard") com um desenho interno anguloso específico, não um círculo simples. A marca do peito em `pipeline-m1` (círculo+giro interno) é uma aproximação — nem eu nem as revisões anteriores temos como confirmar o grau de fidelidade sem uma imagem de referência oficial fora desta sessão. A trava de paleta e o realinhamento desta tarefa **não alteraram nenhum traço de desenho** (forma de orelha, focinho, marca do peito, garras) — só cor e posição — então os desvios já documentados pela QA (orelhas eretas vs. achatadas no rip, ausência de focinho saliente, marca do peito aproximada) **permanecem exatamente como estavam**, nem piores nem melhores.

**Recomendação:** antes de qualquer aprovação de identidade, o fundador ou `game-qa` precisa de uma referência oficial obtida fora desta sessão (imagem anexada, ou uma sessão com `web_search`/`web_fetch` funcionando) para comparação direta — nenhuma das 3 revisões feitas até agora (README, QA, este fix) conseguiu fazer essa verificação.

---

## 5. O que exige regeneração futura (não feito aqui — custo estimado)

Nenhuma destas ações foi executada nesta tarefa (teto de 0 gerações respeitado; `pixellab__*` nunca foi chamada). Estimativas **[H]**, baseadas nos preços já documentados em `pipeline-m1`/README (`get_pro_flash_capabilities`, `pixellab_cost_log.csv`) — não são cotações novas.

| Ação | Por quê | Custo estimado | Observação |
|---|---|---|---|
| Reanimar idle-S e walk-S passando `custom_start_frame_base64`/`_url` = `rotations/south.png` em vez do pose padrão do template `breathing-idle`/`walking` | Testar se a causa do encolhimento é o template partir de uma pose própria em vez da rotação south já gerada — hipótese não testada em nenhuma das 3 provas | **1 geração por chamada** (`animate_character` modo template, 1 direção) × 2 = **2 gerações** | Personagem já existe, não precisa recriar (6 gerações já gastas). Testável com o saldo atual (~2,8) se confirmado pelo fundador. |
| Se a hipótese acima não resolver: tentar `mode="skeleton-v3"` com `motion_adjustments={"posture":1}` para forçar as proporções do template sobre os quadros | Alternativa se o encolhimento for do próprio motor de animação, não da pose inicial | **2–4 gerações por direção** (mais caro que template) | Não testado; extrapolação do preço documentado na ferramenta. |
| Animar SW (nunca feito em nenhuma das 3 provas, por falta de orçamento) | Cobrir a 2ª rotação estática com idle+walk também | **1 geração por clipe × 2 = 2 gerações** (reusando o personagem) | Seria o próximo passo natural depois de validar o fix de escala em S. |
| Validação completa do roster (8 direções × 2 estados, se o fix de template funcionar) | Extrapolação pedida pelo README/QA anteriores, nunca calculada formalmente | **~16 gerações** (1 por direção×estado, modo trial só permite 1 por vez) | Supõe que o fix de `custom_start_frame` funcione em todas as direções — não verificado. Fora do saldo atual (2,8). |
| Comparação formal com arte oficial do Guilmon | Pendência repetida 3× (README, QA, este fix) | **0 gerações** (é pesquisa, não geração) — mas depende de `web_search`/`web_fetch` funcionando, ou de uma imagem anexada pelo fundador | Bloqueador de ferramenta, não de orçamento. |

**Saldo:** não chamei `get_balance` nesta tarefa (não gastei nada, não havia necessidade) — a última leitura registrada é 2,8 gerações restantes (`README.md` de `pipeline-m1`, após o gasto de 8,0 na v3). Qualquer gasto acima precisa de autorização do fundador, conforme as regras do estúdio.

---

## 6. Recomendação de pipeline para P5/P6

1. **Adotar a trava de paleta como etapa obrigatória pós-geração**, não opcional: todo personagem novo (P5/P6) deve rodar um `build_palette.py`/`apply_fix.py` equivalente (ou `reduce_colors` do PixelLab, se confirmado custo 0 — não testei aqui, usei script local por already ser garantidamente grátis) **antes** de qualquer entrega ser considerada "pronta para produção". Isso resolve a queixa repetida 3× e é reaproveitável sem custo para qualquer criatura.
2. **Não tratar `animate_character(template=...)` como preservador de escala** até a hipótese do `custom_start_frame` (§5) ser testada e confirmada — hoje, qualquer animação gerada por este método precisa de uma verificação de bbox pós-geração (como a feita aqui) antes de entrar em produção, porque o encolhimento é sistemático (10 de 10 quadros nas 2 provas comparáveis, M1 e M2, embora em graus diferentes).
3. **Formalizar o orçamento por criatura completa** antes de iniciar o roster: 6 (personagem Pro Flash) + 1 por direção×estado testado, mais a reserva de 2–4 gerações para o teste de `custom_start_frame` por criatura — nenhuma das 3 provas fez essa conta formalmente, e o saldo atual (2,8) não cobre nem um personagem novo completo.
4. **Resolver o bloqueio de referência oficial** (verificação de identidade) antes da próxima rodada — é o único item das 3 provas que não tem solução de ferramenta local; precisa de decisão do fundador (anexar referência, ou liberar `web_search`).

---

## 7. Entregas

```
pipeline-m1-fixed/rotations/{south,south-west}.png   — paleta travada (18 cores), posição inalterada (âncora)
pipeline-m1-fixed/idle-s/frame_000..003.png           — paleta travada + realinhamento de pé/centro (sem resize); 4/4 quadros marcados INVÁLIDOS para escala
pipeline-m1-fixed/walk-s/frame_000..005.png           — paleta travada + realinhamento de pé/centro (sem resize); 2/6 quadros marcados INVÁLIDOS para escala
board/before_after_v3fix.png                          — prancha antes/depois, nearest ×6, puro-stdlib
board/master_palette_swatch.png                       — as 18 cores travadas em faixa
board/master_palette.json                             — paleta travada (RGB/hex) + metodologia, para reuso em P5/P6
board/fix_metrics.json                                — métricas completas por quadro (bbox antes/depois, dx/dy, cores antes/depois, veredito de validade)
scripts/png_io.py                                      — leitor/escritor PNG puro-stdlib compartilhado (8-bit RGBA não-entrelaçado)
scripts/measure.py                                     — reprodução independente das métricas do QA_SCALE_PROOF_V3.md
scripts/build_palette.py                                — k-means determinístico ponderado por frequência, gera a paleta travada
scripts/apply_fix.py                                    — aplica trava de paleta + realinhamento, grava pipeline-m1-fixed/ e fix_metrics.json
scripts/compose_board.py                                — prancha antes/depois
scripts/palette_swatch.py                               — faixa de cores da paleta travada
```

## 8. Limitações

- **Não resolvi a causa raiz do encolhimento** — só a posição (pé/centro). 6 de 10 quadros animados continuam marcados inválidos para uso em escala de produção; corrigir isso de verdade exige regeneração (§5), fora do teto de 0 gerações desta tarefa.
- **Não verifiquei fidelidade ao Guilmon oficial** — `web_search` indisponível nesta sessão (mesma limitação das 2 revisões anteriores, 3ª vez seguida). A trava de paleta/realinhamento não mudou nenhum traço de desenho, então os desvios já documentados pela QA permanecem como estavam.
- **Limiar de "inválido" (±10% de altura vs. âncora) é uma escolha minha**, não um valor do pedido original — documentado explicitamente em §2 para que `game-qa`/fundador possam ajustar se discordarem do corte.
- A clusterização k-means é determinística mas **não é a única paleta de 18 cores possível** — outra escolha de `k` ou de pesos (ex. ponderar por quadro em vez de por pixel total) geraria uma paleta ligeiramente diferente. Não testei `k` diferente de 18.
- Não toquei `pipeline-m1/` original, `scale-proof-v2/`, nem nenhum arquivo fora de `phase2/art/scale-proof-v3-fix/` e `scripts/` deste diretório. Não toquei a branch `quality-overhaul` do `game-dev` nem a porta 5174.
- `south-west.png` recebeu só a trava de paleta (sem translação) — não faz parte do defeito de encolhimento documentado pelo QA (é uma rotação estática, como south), mas também não foi testada quanto a esse ponto nas provas anteriores.
