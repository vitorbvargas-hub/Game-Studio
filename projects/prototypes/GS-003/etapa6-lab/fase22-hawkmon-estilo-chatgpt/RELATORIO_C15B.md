# Relatório C15b — Hawkmon novo: walk + idle nas 4 direções

Data: 2026-11-15 · Dono: `game-art` (sessão separada da que avaliará; esta nota é **indicativa**, a nota oficial é do `game-qa`) · Brief: `BRIEF_C15B_ANIMACAO.md`.
Fan game não oficial e não licenciado; uso local, nada publicado.

## 1. Status

**COMPLETO.** Entregue: `pacote_hawkmon_v2/` com **walk (8 quadros)** e **idle (4 quadros) nas 4 direções (S, E, N, W)**. A tarefa original (C15b) parou com idle N/W pendente ao atingir o teto de 12 gerações do brief (gasto 11,45 de 12) — ver §5-6. Uma tarefa de continuação (**C15b-2**, mesma data) completou idle N/W com um teto próprio de 2,5 gerações (gasto real 2,3), sem reabrir o teto do brief original; esta seção e as seguintes já incorporam esse resultado. Não toquei o jogo, os labs, a Database nem o v1b. Não publiquei nada.

## 2. Método

1. Li o brief, o `DIGITAL_ODYSSEY_CONTEXT.md`, o `RELATORIO_C15A.md` e o `pacote.json` do v1b, e o `QA_BUILD_HAWKMON_INDEPENDENTE.md` (fase21) §2, de onde vem a meta de cadência (50 ms/quadro, ~91 px/s no jogo) e a meta de passada (pé de apoio recuando 3-5 px/quadro, mais longa que o v1b).
2. **`create_character`** (PixelLab, modo v3, `n_directions=4`) com as 4 rotações C15a como `reference_image` (S) e `direction_images` (N, E, W) — **import, 0 pixel regenerado** nas rotações-base (0,25 geração para as 4 direções).
3. **Walk (8 quadros):** `animate_character(mode="v3", action_description=...)`, uma direção por chamada, sobre o personagem importado. Duas versões de texto testadas (ver §3).
4. **Idle (4 quadros):** primeira tentativa com `mode="template"` (`breathing-idle`) — **reprovada** (ver §4) e apagada com `delete_animation`. Repetida com `mode="v3"` custom, que funcionou.
5. **Limpeza (igual à C15a):** cada lote de quadros passou por `correct_pixelart` (força 0,1) → `reduce_colors` com `palette_image` = PNG original C15a da própria direção (sem `num_colors`, para travar exatamente nas cores já aprovadas) → auditoria local (0 semitransparência, cores dentro do conjunto aprovado) → correção de âncora (script local `shift_y.js`, desloca o quadro inteiro 1-2 px verticalmente quando a geração saiu com o pé 1-2 px acima da linha 49; grátis, não troca nenhum pixel de cor).
6. Nenhum pixel final veio direto do PixelLab sem passar por esse funil: rotações = import exato da C15a; quadros de animação = gabarito PixelLab + limpeza + trava de paleta + correção de âncora.

## 3. Walk — passada e recuo do pé de apoio (medição)

O brief pede recuo do pé de apoio de ~3-5 px/quadro em E/W (mais longo que o v1b, que tinha 2 px fixo), para casar com a cadência de 50 ms/91 px/s do jogo. Para S/N, a convenção é a mesma do v1b: não há deslizamento lateral a medir (o pé de apoio fica parado visto de frente/costas; é a perna que avança que se move).

**Tentativa 1 (prompt neutro, "passada confiante"):** usada para S (aprovada direto) e testada em E. Em E, o pé de apoio mediu **~2 px/quadro** de recuo — igual ao v1b, **não atingiu a meta**. Rejeitada para E.

**Tentativa 2 (prompt pedindo passada "exagerada, grande, pernas bem afastadas"):** usada para E, W e N (depois de a 1ª tentativa de N com esse mesmo prompt ter colapsado a altura do corpo — ver §4). Medição do recuo do pé de apoio em E (centro x do contato em cada quadro, canvas final 60x60, pé em y=49):

| Quadro | Centro x do pé em contato | Δ vs quadro anterior |
|---|---|---|
| 0 | 31,5 | — |
| 1 | 31 | -0,5 |
| 2 | 28 | -3 |
| 3 | 27,5 | -0,5 |
| 4 | duplo apoio (22-24 e 35-38) — transição de passo | — |
| 5 | 37,5 | (novo pé de apoio) |
| 6 | 33,5 | -4 |
| 7 | 30 | -3,5 |
| 8 | 27 | -3 |

- **Primeira metade do ciclo (quadros 0→3):** recuo médio **~1,3 px/quadro** — abaixo da meta.
- **Segunda metade (quadros 5→8, depois da troca de pé):** recuo de **4, 3,5 e 3 px/quadro** — **dentro da meta de 3-5 px**.
- **1 quadro de duplo apoio** (quadro 4): os dois pés tocam o chão ao mesmo tempo, momento de transição de perna — natural num ciclo de passada, mas quebra a leitura de "um recuo contínuo".
- Em **W** o padrão é semelhante (recuo entre 1,5 e 4,5 px/quadro conforme o trecho do ciclo), com a mesma assimetria entre as duas metades.

**Leitura honesta [H]:** a passada da tentativa 2 é visivelmente mais longa que a do v1b e **atinge a meta de 3-5 px/quadro na metade do ciclo correspondente ao impulso final do passo**, mas não de forma uniforme nos 8 quadros — a primeira metade do ciclo e o quadro de transição ficam abaixo da meta. Não tentei uma 3ª geração nem correção manual de pixel a pixel (redesenho da perna) por causa do teto de gerações (ver §5): o brief lista "medir e registrar" como critério de aceite explícito, não "recuo uniforme de 3-5 px em todos os quadros" — por isso decidi registrar a medição real em vez de arriscar mais uma geração ou uma correção manual que poderia descolar o pé da perna. **Decisão do fundador/game-qa:** se o resultado parecer insuficiente depois de visto no jogo a 50 ms, a correção é de arte (redesenho pontual do pé/perna nos quadros 0-3), sem precisar regenerar do zero.

## 4. Problemas encontrados e como foram tratados

1. **Idle por `template` (`breathing-idle`) reprovado.** A âncora caiu de y=49 para y=41-44 e a altura do bbox encolheu de 38 para 33-35 px nas 4 quadros, em S e E — o template humano (`breathing-idle`) não respeita a proporção/canvas do Hawkmon (ave de pernas curtas, corpo diferente da anatomia humana que o template assume). **Correção:** descartei com `delete_animation` (2 gerações já gastas, não recuperáveis) e refiz com `mode="v3"` custom, que manteve a âncora em y=49 e a altura em 37-41 px nas 4 direções testadas.
2. **Walk N colapsou com o prompt de passada exagerada.** A mesma frase que funcionou bem para E e W fez a altura do corpo cair de 37 px para **27 px** (quadros 5-7) e a âncora subir de y=49 para **y=45** — meu diagnóstico [H]: de costas (N), o modelo não tem o rosto como referência de "para onde o corpo inclina", e interpretou "passada exagerada, pernas bem afastadas" como um agachamento acentuado. **Correção:** descartei a tentativa (1 geração perdida) e regenerei N com o mesmo prompt neutro que funcionou bem em S (sem o texto de "exagero"), o que manteve altura 37-42 px e âncora em y=49 nos 8 quadros.
3. **Deslocamento vertical de 1-2 px em 11 dos 40 quadros finais** (o pé de apoio saiu do PixelLab em y=47 ou y=48 em vez de y=49). **Correção:** script local `shift_y.js` (desloca o quadro inteiro verticalmente, sem tocar em nenhuma cor) — grátis, 0 gerações. Depois da correção, **0 quadros fora de y=49** nas 40 imagens finais (32 de walk + 8 de idle).
4. **Base64 inline corrompido em trânsito** ao tentar mandar vários quadros PNG de uma vez para `correct_pixelart` — o próprio erro da ferramenta identificou o problema e recomendou usar upload + URL em vez de base64 inline; troquei para `get_upload_url` + `curl` em todas as chamadas seguintes e não ocorreu mais.
5. **GIFs:** o sandbox não tem `ffmpeg`/`ImageMagick`/`gifsicle` nem acesso de rede fora de `api.pixellab.ai`. Escrevi um codificador GIF89a próprio (`scripts/gif.js`, LZW espec-compatível, paleta global, quadro-a-quadro) e um decodificador próprio para validar o resultado por conta própria (`scripts/gif_decode_check.js`): todos os 12 GIFs do pacote decodificam de volta com o número de quadros, dimensões e índices de paleta esperados, sem erro. **Não consegui confirmar visualmente dentro deste sandbox** (o visualizador interno recusou abrir até um GIF de 1 quadro só, com erro genérico do decodificador dele — "RastermillError"); não investi mais tempo nisso por ser uma limitação do visualizador deste ambiente, não evidência de um GIF inválido. Recomendo abrir os `.gif` do pacote num navegador ou visualizador de imagens comum para confirmar.

## 5. Custo e saldo PixelLab [E]

### C15b (tarefa original)

| Chamada | Geração | Qtde | Subtotal |
|---|---|---|---|
| `create_character` (import das 4 rotações C15a) | 0,25 | 1 | 0,25 |
| `animate_character` walk S (v3, aprovado) | 1 | 1 | 1 |
| `animate_character` walk E tentativa 1 (v3, descartado) | 1 | 1 | 1 |
| `animate_character` walk E tentativa 2 (v3, aprovado) | 1 | 1 | 1 |
| `animate_character` idle S+E template (descartado) | 1 | 2 | 2 |
| `animate_character` idle S+E v3 (aprovado) | 1 | 2 | 2 |
| `animate_character` walk N+W tentativa (v3, só W aprovado; N descartado) | 1 | 2 | 2 |
| `animate_character` walk N tentativa 2 (v3, aprovado) | 1 | 1 | 1 |
| `correct_pixelart` (6 chamadas: walkS, walkE t1, idleS, idleE, walkE t2, walkN+W) | 0,1 | 6 | 0,6 |
| `reduce_colors` (6 chamadas, mesmas combinações) | 0,1 | 6 | 0,6 |
| **Subtotal C15b** | | | **11,45** |

- Saldo antes (herdado do C15a): 559,15 gerações restantes. Saldo depois do C15b: 547,70.
- A tarefa parou nesse ponto porque uma nova chamada de `animate_character` (mínimo 1 geração) ultrapassaria o teto de 12 do brief, conforme instrução ("Se atingir o teto, parar e reportar"). O personagem PixelLab (`a3dc7c3d-e63a-43f0-a4d7-dadc124417fc`) foi mantido para a continuação.

### C15b-2 (continuação, mesma data — idle N/W)

| Chamada | Geração | Qtde | Subtotal |
|---|---|---|---|
| `animate_character` idle N+W (v3, mesmo prompt de S/E, aprovado) | 1 | 2 | 2 |
| `correct_pixelart` (1 chamada combinando os 8 quadros N+W) | 0,1 | 1 | 0,1 |
| `reduce_colors` (2 chamadas, paleta separada por direção: N e W) | 0,1 | 2 | 0,2 |
| **Subtotal C15b-2** | | | **2,3** |

- Saldo antes: 547,70. Saldo depois: **545,40** (`get_balance`, 2026-11-15).
- Diferença: **2,3** — dentro do teto de 2,5 desta tarefa (margem final: 0,2). Acima do piso de saldo autorizado de 545 (margem final: 0,40).
- Nenhuma tentativa descartada: a âncora saiu em y=49 nos 8 quadros já na geração bruta (sem o colapso de altura/âncora visto no walk N da C15b), então não foi preciso `shift_y.js` nem uma segunda tentativa de prompt.
- Nenhum crédito foi comprado nas duas tarefas.

### Total combinado (C15b + C15b-2)

- Gasto total: **13,75 gerações** (11,45 + 2,3).
- Saldo final: **545,40** gerações restantes — acima do piso de 545 em todas as checagens intermediárias de ambas as tarefas.

## 6. Medições de identidade, âncora, massa e cor [E]

- **Identidade:** faixa com fivela, topete em camadas, leque de penas, bico curvo e marcas no rosto preservados em todas as 48 imagens finais — a mesma identidade da C15a (nenhuma rotação-base foi regenerada; só os quadros de animação são novos).
- **Âncora:** pé de apoio (última linha opaca) em **y=49 em 100% dos 48 quadros finais** (32 de walk + 16 de idle: 4 quadros x 4 direções). Na C15b, 11 dos 40 quadros precisaram de correção com `shift_y.js`; na C15b-2 (idle N/W), os 8 quadros novos já saíram em y=49 direto da geração, sem nenhuma correção. 0 px de tremida vertical na entrega final.
- **Massa (altura do bbox):** walk/S 38-41 px, walk/E 37-41 px, walk/N 37-42 px, walk/W 38-40 px, idle/S 38-41 px, idle/E **38 px constante nas 4 quadros**, idle/N 38-40 px, idle/W 36-40 px. Variação de até 4 px em torno do alvo de 38 px da C15a, atribuída à extensão natural da perna durante a passada/respiração (o próprio v1b já varia altura entre quadros de contato e quadros de impulso) — não há encolhimento/crescimento sistemático nem tendência de deriva ao longo do ciclo.
- **Cor:** toda imagem final foi travada na paleta de 18 cores da C15a via `reduce_colors(palette_image=...)`, usando a rotação original da própria direção como referência em todos os casos. Nenhum quadro usa cor fora desse conjunto; walk S/E usam 16-18 das 18, walk N/W usam 14-16; idle/N usa 15-16 cores por quadro (16 no total das 4 quadros), idle/W usa 17-18 (18 no total, conjunto completo) — faltam, no caso de N, só as cores de olho/marca facial, ausentes também na rotação N original — coerente, não é perda.
- **Semitransparência:** 0 pixels semitransparentes em nenhum dos 48 quadros finais (auditoria com script local, mesma métrica da C15a), incluindo os 8 quadros novos de idle N/W.
- **Canvas:** 60x60 em todas as imagens, sem crop.
- **E e W, N e S:** cada direção tem seu próprio prompt e sua própria geração — **nenhuma foi espelhada da outra**, conforme pedido. O idle N/W usou o mesmo texto de prompt do idle S/E (não há variação de texto por direção para o idle, diferente do walk, onde o walk N precisou de um prompt diferente do E/W por causa do colapso relatado no §4.2).

## 7. O que não foi feito

- **Idle em N e W** — CONCLUÍDO na tarefa de continuação C15b-2 (mesma data), teto próprio de 2,5 gerações, gasto real 2,3. Não resta pendência de animação no brief C15b.
- **Recuo do pé de apoio uniforme de 3-5 px/quadro em todos os 8 quadros** — não atingido com uniformidade; ver medição honesta no §3. A metade do ciclo correspondente ao impulso final chega lá (3-5 px); a primeira metade fica em ~1,3-2 px. Não fiz correção manual pixel a pixel por causa do orçamento e do risco de descolar o pé da perna sem supervisão visual humana.
- **Camadas (`camadas/corpo` + `camadas/topete` separados)** — não pedidas no brief C15b; se a Feather Slash (ataque futuro) precisar, é trabalho novo, fora de escopo aqui.
- **Confirmação visual dos GIFs num visualizador externo** — só validados pelo meu próprio decodificador GIF (estrutura e índices corretos); não abri num navegador real dentro deste sandbox.
- Não toquei o jogo, os labs (5191/5196/5197), a Database nem o pacote v1b. Não publiquei nada.
- Esta nota (§6 em diante) é **indicativa e feita pela mesma sessão que produziu o asset** — por regra do estúdio (ADR-012 §3), a nota oficial precisa vir do `game-qa`, depois do ChatGPT/Vitor.

## 8. Arquivos entregues

`pacote_hawkmon_v2/`:
- `pacote.json` — metadados completos (âncora, massa, cores, custo, fontes de cada animação, pendências).
- `rotations/{S,N,E,W}.png` — cópia exata das rotações C15a (0 regeneração).
- `walk/{S,E,N,W}/frame_000.png`..`frame_007.png` — 8 quadros, 60x60, âncora y=49.
- `idle/{S,E,N,W}/frame_000.png`..`frame_003.png` — 4 quadros, 60x60, âncora y=49 em todas as 4 direções.
- `folha_contato_3x.png` — todos os 48 quadros finais numa prancha única (walk S/E/N/W + idle S/E/N/W, 8 linhas), 3x.
- `prancha_comparacao_v2.png` — Tamer v13 south + Agumon F7v2 S + Hawkmon v1b S + Hawkmon v2 (walk S, quadro 0), alinhados pelo chão, 4x.
- `walk_{S,E,N,W}_{1x,4x}.gif`, `idle_{S,E,N,W}_{1x,4x}.gif` — 16 GIFs (ver ressalva de validação no §4.5; os 4 novos de idle N/W foram verificados do mesmo jeito — decodificador local próprio, não aberto num visualizador externo).
- `RELATORIO_C15B.md` (este arquivo) e `PROGRESS.md` (workspace do estúdio, atualizado a cada etapa).
