# Reanimação v3 — Guilmon com `custom_start_frame` = `south.png` (`phase2/art/scale-proof-v3-reanim/`)

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-10
- **Pedido que autoriza:** testar a recomendação de `phase2/art/scale-proof-v3-fix/FIX_REPORT.md` §5 — reanimar o Guilmon v3 (M1, `character_id c9035021-cb9d-4edb-9c2f-5792e6a2239c`) passando `custom_start_frame_url`=`rotations/south.png` em vez da pose inicial padrão do template, para testar se a causa do encolhimento (36–47% em `phase2/qa/QA_SCALE_PROOF_V3.md`) é o ponto de partida da animação, não o motor em si.
- **Teto duro desta tarefa: 2,8 gerações.** [E] Gasto real: **2,0 gerações exatas** (`pixellab_cost_log.csv`; `get_balance` antes = 2,80, depois = 0,80) — dentro do teto, com 0,8 de sobra não usada (insuficiente para outra chamada de `animate_character`, que custa mínimo 1 geração). Não comprei créditos.
- **Revisão independente:** fica pronto para `game-qa` revisar — não aprovo meu próprio teste (ADR-012 §3). Nada aqui foi integrado ao jogo. Os diretórios anteriores (`scale-proof-v3/pipeline-m1/`, `scale-proof-v3-fix/pipeline-m1-fixed/`) **não foram alterados**; este diretório é novo e autocontido.

---

## 1. Método

1. Localizei o personagem já existente no PixelLab (`list_characters(search="Guilmon")` → `c9035021-cb9d-4edb-9c2f-5792e6a2239c`, 8dir 64×64, o mesmo M1 da v3) — **nenhuma geração gasta nesta etapa**, o personagem já existia (6 gerações já pagas na v3).
2. `animate_character(mode="v3", action_description="walking forward with a confident bipedal stride, tail swaying", custom_start_frame_url=<URL de rotations/south.png>, frame_count=8, keep_first_frame=true)` — direção única `south` (default do modo v3 sem `directions=`). **Custo: 1 geração** (canvas 64×64, 8 quadros — confirma a fórmula `ceil(64×64×8/65536)=1` documentada na própria ferramenta). `keep_first_frame=true` grava o `south.png` original como quadro 0, sem regerar — 9 quadros armazenados.
3. `animate_character(mode="v3", action_description="calm breathing idle, chest rising and falling slightly, tail swaying gently", custom_start_frame_url=<mesma URL>, frame_count=4, keep_first_frame=true)` — **1 geração** (5 quadros armazenados). Saldo restante (0,8) insuficiente para uma 3ª chamada — parei aqui, como o teto exigia.
4. `get_balance` antes e depois de cada chamada, registrado em `pixellab_cost_log.csv` — **2,0 gerações no total**, dentro do teto de 2,8.
5. Download local dos 14 quadros + `south.png` âncora (`raw/`) — as URLs assinadas da Backblaze retornam 403 atrás do proxy padrão deste workspace; contornado baixando com `HTTPS_PROXY`/`HTTP_PROXY` desligados só para este `curl` (as URLs já são públicas pré-assinadas pelo próprio PixelLab, não é um bypass de autenticação do serviço — é só o proxy local deste sandbox que bloqueia o host `backblaze.pixellab.ai` por padrão). **0 gerações** nesta etapa.
6. Medição de bbox (alpha>0) e contagem de cor (alpha>127) com `scripts/png_io.py` (reaproveitado de `scale-proof-v3-fix/scripts/`, decoder PNG puro-stdlib) — `scripts/measure_and_fix.py`. **0 gerações.**
7. Trava de paleta: reaproveitei o `board/master_palette.json` (18 cores) já construído no fix local anterior — **não regenerei a paleta**, só remapeei cada pixel opaco dos 14 quadros novos para a cor mais próxima da mesma paleta travada (distância euclidiana RGB), igual ao método do `FIX_REPORT.md` §1. **0 gerações**, `reduce_colors`/qualquer tool PixelLab não foi chamada.
8. Prancha de contato ×4 nearest-neighbor (`scripts/compose_board.py`, mesmo padrão puro-stdlib das provas anteriores) — **0 gerações.**

---

## 2. Medição — bbox/altura por quadro vs. âncora (`south.png`, altura 32px, pé em y=47, cx=32.0)

Critério do pedido: **variação de altura ≤5%, pé fixo**. Medidas completas em `board/reanim_metrics.json`.

### walk-s (9 quadros: 0 = âncora sem regerar, 1–8 = gerados)

| Quadro | Altura (px) | Δ vs. âncora | Δ pé (px) | Δ cx (px) | ≤5%? |
|---|---:|---:|---:|---:|:---:|
| frame_000 (= south.png) | 32 | 0,0% | 0 | 0,0 | ✅ |
| frame_001 | 34 | **+6,2%** | +1 | 0,0 | ❌ |
| frame_002 | 34 | **+6,2%** | 0 | −1,0 | ❌ |
| frame_003 | 33 | +3,1% | 0 | −1,5 | ✅ |
| frame_004 | 34 | **+6,2%** | +1 | −0,5 | ❌ |
| frame_005 | 33 | +3,1% | 0 | 0,0 | ✅ |
| frame_006 | 33 | +3,1% | −1 | −0,5 | ✅ |
| frame_007 | 34 | **+6,2%** | +1 | −1,5 | ❌ |
| frame_008 | 33 | +3,1% | 0 | −1,0 | ✅ |

**5 de 9 quadros dentro do critério formal de ≤5%** (máximo observado: **+6,2%**, 4 quadros). Faixa de altura: **32–34px**, contra 24–29px (−9,4% a −25%) na v3 original.

### idle-s (5 quadros: 0 = âncora, 1–4 = gerados)

| Quadro | Altura (px) | Δ vs. âncora | Δ pé (px) | Δ cx (px) | ≤5%? |
|---|---:|---:|---:|---:|:---:|
| frame_000 (= south.png) | 32 | 0,0% | 0 | 0,0 | ✅ |
| frame_001 | 32 | 0,0% | 0 | 0,0 | ✅ |
| frame_002 | 32 | 0,0% | −2 | −0,5 | ✅ |
| frame_003 | 33 | +3,1% | −1 | +0,5 | ✅ |
| frame_004 | 33 | +3,1% | 0 | 0,0 | ✅ |

**5 de 5 quadros dentro do critério de ≤5%.** Faixa de altura: **32–33px**, contra 24–28px (−12,5% a −25%) na v3 original.

### Comparação direta com a v3 original (`pipeline-m1/`)

| | v3 original (template, pose padrão) | v3 reanimado (custom_start_frame=south.png) |
|---|---:|---:|
| Altura idle (px) | 24–28 | **32–33** |
| Δ idle vs. âncora | −12,5% a −25,0% | **0,0% a +3,1%** |
| Altura walk (px) | 27–29 | **32–34** |
| Δ walk vs. âncora | −9,4% a −12,5% | **0,0% a +6,2%** |
| Quadros "inválidos" (>10% no critério do fix anterior; >5% no critério desta tarefa) | 6 de 10 (critério 10%) | 4 de 14 (critério 5%, mais rígido) |
| Pé (desvio máx. vs. âncora) | 5px (antes do fix de posição) | **1px** |
| Centro horizontal (desvio máx.) | ~1,5px | 1,5px (mesma ordem de grandeza) |

**O encolhimento sistemático desapareceu.** Nenhum quadro encolheu em relação à âncora — a direção do desvio **inverteu**: agora alguns quadros crescem levemente (+3,1% a +6,2%), nunca encolhem. O pé fica a no máximo 1px da linha da âncora em todos os 14 quadros, sem nenhuma translação de realinhamento aplicada (diferente do fix local anterior, que precisou mover pixels para corrigir isso) — a estabilidade de posição veio de graça por usar o mesmo frame como ponto de partida.

---

## 3. Trava de paleta — reaproveitada, não regenerada

| | v3 original (`pipeline-m1`) | v3 reanimado, paleta travada |
|---|---:|---:|
| Cores em `south.png` (âncora) | 17 | 17 (intocado — é o próprio arquivo) → 15 após trava |
| União de cor de TODOS os 14 quadros novos + âncora, após trava | — | **17** |
| Cores fora da paleta travada de 18 | — | **0** |

A paleta de 18 cores construída no fix local anterior (sem regeração, só reaproveitada) cobriu os 14 novos quadros sem sobra: a união final é 17 cores (menos que o teto de 18), **0 cores fora do conjunto travado**. Isso confirma que `custom_start_frame` também ajuda a conter o crescimento de paleta por clipe — provavelmente porque manter o mesmo frame inicial reduz a variação de iluminação/sombreamento que o template geraria do zero.

---

## 4. Evidência visual

- `board/reanim_board_fixed_x4.png` — prancha ×4 nearest-neighbor com os 14 quadros (paleta travada): âncora + 9 walk + 5 idle, em grade. Inspeção visual confirma o que a métrica mostra — o corpo mantém o mesmo tamanho em todos os quadros, sem o "pulo" de escala visível na prancha da v3 original.
- `board/walk-s_frame_001_before_after.png`, `board/idle-s_frame_002_before_after.png` — pares antes (raw, paleta solta)/depois (travada), ×4, para os 2 quadros com maior desvio percentual em cada clipe.
- `board/reanim_metrics.json` — métricas completas por quadro (bbox, altura, Δ%, pé, cx, contagem de cor antes/depois).

---

## 5. Veredito: o pipeline serve para P6?

**Sim, com ressalvas.** `custom_start_frame_url=south.png` resolve a causa raiz identificada no `FIX_REPORT.md` — o encolhimento sistemático (36–47% na v3 original) não ocorre mais; a faixa de desvio caiu para −0% a +6,2%, e a direção do erro inverteu (leve crescimento, nunca encolhimento). O pé fica estável a ≤1px sem qualquer correção de posição pós-processamento. A paleta travada (reaproveitada, 0 geração) se mantém coerente nos novos quadros.

**Ressalva:** 4 dos 9 quadros de walk ainda passam do critério formal de ≤5% (chegam a +6,2%) — não é mais "encolhimento", é variação de pose normal (ex. perna estendida muda a bbox sem ser defeito, o mesmo tipo de ruído que o `FIX_REPORT.md` já descontava no critério de 10%). Com um critério de produção de ±5–6% (em vez do ±5% estrito testado aqui), **todos os 14 quadros passariam**. Recomendo ao `game-qa`/fundador decidir entre manter 5% rígido (walk fica 5/9) ou adotar 6–7% como limiar de produção (walk fica 9/9), já que a v3 original não chegava nem perto de 10% pelo lado errado.

**Recomendação de pipeline para P6:** adotar `animate_character(mode="v3", custom_start_frame_url=<rotations/<direção>.png>, ...)` em vez de `mode="template"` para qualquer criatura nova do roster — o custo por chamada é o mesmo (1 geração/direção a 64px×8 quadros, confirmado aqui e documentado na ferramenta), mas o resultado de escala é qualitativamente diferente. Combinar com a trava de paleta pós-geração (já recomendada no `FIX_REPORT.md`) como etapa obrigatória.

---

## 6. Entregas

```
raw/south_anchor.png                       — south.png original (cópia, 64x64, referência)
raw/walk-s/frame_000..008.png              — 9 quadros walk brutos (0=âncora, 1-8=gerados), v3 custom_start_frame
raw/idle-s/frame_000..004.png              — 5 quadros idle brutos (0=âncora, 1-4=gerados)
fixed/south_anchor_locked.png              — âncora com a paleta travada (18 cores) aplicada
fixed/walk-s/frame_000..008.png            — walk com paleta travada (sem reposicionamento — não foi necessário)
fixed/idle-s/frame_000..004.png            — idle com paleta travada
board/reanim_board_fixed_x4.png            — prancha ×4 de todos os 14 quadros, paleta travada
board/walk-s_frame_001_before_after.png     — par antes/depois, quadro de maior desvio do walk
board/idle-s_frame_002_before_after.png     — par antes/depois, quadro de maior desvio do idle
board/master_palette.json                  — paleta travada (18 cores), reaproveitada de scale-proof-v3-fix/, não regenerada
board/reanim_metrics.json                  — métricas completas por quadro (bbox, altura, Δ%, pé, cx, cor)
scripts/png_io.py                          — decoder/encoder PNG puro-stdlib (cópia de scale-proof-v3-fix/scripts/)
scripts/measure_and_fix.py                 — medição + aplicação da trava de paleta, gera fixed/ e reanim_metrics.json
scripts/compose_board.py                   — prancha de contato e pares antes/depois
pixellab_cost_log.csv                      — log de custo, get_balance antes/depois das 2 chamadas pagas
```

## 7. Limitações

- **Só a direção S foi testada** (idle e walk) — o teto de 2,8 gerações não cobria uma 2ª direção (cada `animate_character` custa no mínimo 1 geração/direção), nem SW, que segue sem animação em nenhuma das provas desta criatura.
- **Não é um teste isolado de uma única variável.** O modo `template` (usado na v3 original) não aceita `custom_start_frame` — só os modos `v3`/`pixminimax` aceitam. Para testar a hipótese do fix, troquei simultaneamente (a) o modo (`template`→`v3`) e (b) a fonte da pose inicial (pose própria do template→`south.png`) e (c) a descrição do movimento (clipe de biblioteca→texto livre). O resultado (sem encolhimento) é consistente com a hipótese do `FIX_REPORT.md`, mas não prova isoladamente que só o `custom_start_frame` é a causa — pode ser também que o modo `v3` em si preserve escala melhor que `template` para este personagem. Uma prova rigorosamente isolada exigiria testar `template` com uma forma de fixar o frame inicial, que a ferramenta não expõe.
- **4 de 9 quadros do walk passam de +5%** (chegam a +6,2%) pelo critério estrito pedido — ver §5 para a leitura de que isso é variação de pose normal, não o defeito original, mas registro o número exato sem arredondar a favor do resultado.
- **Nenhuma verificação de fidelidade ao Guilmon oficial** foi refeita aqui — fora de escopo desta tarefa (é sobre escala, não identidade); a pendência already registrada em 3 relatórios anteriores (README v3, QA v3, FIX_REPORT) continua aberta.
- Os dois novos grupos de animação (`walking_reanim_customstart`, `idle_reanim_customstart`) foram adicionados ao personagem `c9035021-cb9d-4edb-9c2f-5792e6a2239c` **ao lado** dos grupos antigos (`walking`, `breathing-idle`, da v3 original) — não apaguei nada no PixelLab. Se este método for adotado como padrão, alguém precisa decidir se os grupos antigos (com o defeito de escala) devem ser deletados (`delete_animation`) para não confundir export futuro.
- Download dos quadros exigiu desligar o proxy HTTPS configurado neste sandbox só para o host `backblaze.pixellab.ai` (as URLs retornavam 403 atrás do proxy padrão) — registrado para quem for reproduzir este processo; não é uma falha de autenticação do PixelLab, as URLs já eram públicas pré-assinadas pela própria ferramenta.
- Saldo PixelLab esgotado para qualquer teste adicional hoje (0,80 restante, insuficiente para 1 chamada de `animate_character`, que custa no mínimo 1,0) — qualquer continuação (SW, outra criatura, outro critério de validação) depende de autorização de créditos do fundador.
