# F9 Labramon — QA de regressão (A2–A8, L1–L7)

Digital Odyssey (GS-003) · 2026-11-16, ~05:45–06:30 BRT · `game-qa` (Opus 5.5), sessão independente: não fiz nenhuma das correções (arte: game-art, `RELATORIO_F9_CORRECOES.md`; lab: game-dev, `RELATORIO_F9_LAB_CORRECOES.md`). Base de comparação: `F9_QA_INDEPENDENTE.md` e os JSON originais em `qa_f9/` (não sobrescritos).
Fan game não oficial, sem licença, sem monetização; nada publicado. Não alterei arte, código nem manifestos; sem PixelLab.
Legenda: **[E]** executado por mim agora · **[L]** relatório do produtor, não reverificado · **[H]** julgamento meu.

## 0. Objeto e método [E]

- Repo `~/projects/GameStudio`, `master`, HEAD `f02fbab`; a pasta F9 continua toda fora do git (`??`). Lab `http://127.0.0.1:5198/lab/index.html` HTTP 200; 5196/5197 HTTP 200; `workspaces/game-dev/qo` sem arquivo mais novo que o QA original.
- Reexecutei cópias dos meus roteiros com saída redirecionada para `qa_f9/regressao/` (única diferença: o caminho de saída): `check.mjs`, `visual.mjs`, `pe.mjs`, `lab_qa.mjs` (Chromium headless 1243, libs `/tmp/chromelibs`, proxy contornado só no processo). Novo `lab_extra.mjs` para os casos de L3/L6/L7 que o roteiro original não cobria. Folhas antes/depois geradas por mim com `row.mjs` a partir de `_pre_correcao/` (backup do produtor) e da entrega atual. Headless sem GPU: tempos indicativos.

## 1. Defeitos: status com medida antes → depois [E]

| ID | Status | Antes → depois (medida minha) | Observação |
|---|---|---|---|
| **A2** entradas saltam do idle | **Parcial** | irritado: idle→q0 **859 → 664** px, depois 196 → 406 (entrada em 2 passos); comemoração: **753 → 668**, novo q0→antigo q0 468; assustado **847**, ataque **479**, triste **432**: sem mudança | Melhora de 23% e 11% no maior salto, ainda > 600 px num quadro. A olho: o intermediário do irritado é a pose final com a cauda atrasada, o corpo ainda "cai" num quadro só. As 2 gerações do A2 foram reprovadas pelo próprio produtor [L] |
| **A3** tufo vinho da orelha oposta | **Corrigido** | diff contra o backup: latido q4 −16 px `#7a2044` e −17 `#010101` do tufo, q5 −4/−10; dano q0–q2 −12/−4/0 vinho + contorno; queda/estado/recuperação: contorno vinho → `#010101` | Conferido a 8× (`regressao/folhas/combat_A3A4_antes_depois_8x.png`): o tufo sumiu em latido e dano, contorno da cabeça fechado |
| **A4** capuz redesenhado / mancha no olho | **Corrigido** (parte travável) | latido q4/q5/q6 altura **38/38/38** (era 40/39/38); topo y=12; recuperação q6 altura 36; mancha cinza `#6b6b5c`/`#434a39` sobre o olho: queda q4–q5 e estado q0 viraram capuz claro + olho fechado (12+2 px trocados por quadro) | Olho maior nos picos de ação (ataque olho 3–7 px) ficou como expressão: **decisão do fundador**, como já estava no §10 do QA |
| **A5** rosto S/W, presa, garras | **Parcial** | S: 59 px trocados, olho 7 → **8 px** (dois 2×2 limpos), cinza ao redor do olho retirado, boca escura + presa 1 px; garras com 2 tons. W: 29 px, olho 2×2, marca colada no olho removida (marcas 8–9 → 6–7). Paleta 19, 0 semi, bbox igual. Trava de rosto: olho 8 px e 4 px constantes em todos os quadros de walk/idle S e W | **A olho (10×, 3× e 1×):** S ficou claramente melhor (dois olhos legíveis, boca, menos ruído). W melhorou, mas a 1× o rosto de perfil ainda é um aglomerado vermelho/rosa. Presa e garras só leem ampliadas; garras não foram levadas para os quadros animados de walk/idle [L, confirmado] |
| **A6** walk S com 6 poses | Não corrigido (fora do escopo pedido) | dif q0→q1 72, q4→q5 64 px | — |
| **A7** walk N 2 px acima | **Corrigido** | costura standing N → walk N **543 → 353** px, melhor alinhamento dx 0 dy 0 (era dy 2); altura 36 em 8/8; pé y=49 em 8/8 | Conferido a 6×: corpo na altura do standing, passada intacta |
| **A8** em pé → deitar 2 px deslocado | **Corrigido** | costura idle E → deitar q0 **703 → 439**, alinhamento dx 0 (era dx 2); deitado → adormecer continua 0 | — |
| **L1** ação dormindo | **Corrigido** | ataque dormindo: antes `state idle, rest dormindo` (salto); agora `dormindo (loop)`, aviso INDISPONÍVEL, "Acordar" ligado e começa em `sleep_to_wake` q0 | — |
| **L2** emoção incapacitado | **Corrigido** | feliz incapacitado: antes `feliz (loop)` com `combat incapacitado`; agora continua `incapacitado (loop)`; Recuperação começa caída (`recuperacao/frame_000`) | — |
| **L3** WASD/deitar deitado | **Corrigido** | WASD deitado: antes `walk E` com `rest deitado`; agora fica deitado com aviso "caminhar: toque Deitar/Levantar primeiro"; ataque deitado bloqueado; Dormir a partir de deitado entra direto em `lie_to_sleep` q0 (sem salto); 2º Deitar (botão vira "Levantar") toca `stand_to_lie` q5→q0 em 822 ms e volta a idle com `rest despertou` | `lie_to_stand` é o clipe invertido, não arte nova (declarado pelo game-dev) |
| **L4** botão de walk corta ação | **Corrigido** | ataque 300 ms após ▶E: antes `idle` (cortado); agora `ataque (retriever bark)` | — |
| **L5** duas teclas | **Corrigido** | segurar D, apertar A, soltar D: antes `idle`; agora `walk W` | — |
| **L6** rótulo preso | **Corrigido** | dois avisos em W e depois ataque em E: rótulo "ataque" em 450–2700 ms, nunca volta a INDISPONÍVEL; W+ataque agora mostra INDISPONÍVEL (antes mostrava "idle") | — |
| **L7** Tamer fora do palco | **Corrigido** (escala) | Tamer desenhado no canvas do palco: largura 60 → 102 px; Tamer 36 px de altura com último pixel opaco em y=34 do PNG, colocado em y = 49 − 34 ⇒ pé na linha de chão y=49, igual ao Labramon (y=49). Captura `regressao/lab_extra/L7_tamer_no_palco.png` | Carinho com o Tamer em cena continua inexistente (por decisão do game-dev: não há dado de contato) |

## 2. Nada piorou? [E]

| Verificação | Original | Regressão |
|---|---|---|
| Refs de manifesto / faltando / SHA | 545 / 0 / 209 OK | **549 / 0 / 211 OK**, 0 divergente |
| Quadros de clipe | 160 | **162** (irritado entrada +1, comemoração +1) |
| Canvas / semitransparência / magenta / fora da paleta / máx. cores | 60×60 / 0 / 0 / 0 / 19 | **igual** em todos |
| Pé y=49 | 157/160 (3 no ar) | **159/162** (os mesmos 3 da comemoração no ar) |
| Spritesheets × quadros / GIFs | 34/34 / 92 válidos | **0 divergente** / **92, 0 com erro** |
| Standing = rotação | 4/4 | **4/4** |
| Pé de apoio (walk) | E 2,25 · W 2,75 px/quadro | **idêntico** (`pe_apoio_walk.json` byte a byte) — A1 segue aberto |
| Costuras não ligadas às correções | — | 32 de 41 iguais; mudaram só as visadas (A2 ×3, A7, A8) e efeitos colaterais pequenos: standing S → walk S 170 → 177, dano 890 → 886, estado → recuperação 261 → 260, recuperação → idle 215 → 221 |
| Órfãos fora do manifesto | 3 | 3 (I1 aberto) |
| Lab: ativos, erros, render, FPS | 180/180, 0, canvas = PNG, 60 fps | **182/182** (537 ms), **0 erro de console/exceção/rede/4xx**, canvas = PNG em 12 controles × 6 amostras, cadência ±17 ms, 60 fps 10/10, heap 0,9 MB |
| Indisponibilidade fora de E | 12/12 | 12/12 (quadro não troca) |

Observações novas (sem regressão funcional):
- **O1 (P3, cosmético):** fora de E o botão "Deitar" agora fica desabilitado; o roteiro clica nele e o rótulo continua com o aviso anterior ("INDISPONÍVEL (feliz só existe em E)"). Não troca quadro nem estado.
- **O2:** o `visual.mjs` mede "irritado entrada → loop q0" a partir do 1º quadro da entrada, que agora é o intermediário (488 px); a costura real último da entrada → loop é **406 px**, igual a antes (medi à parte).
- O rótulo do painel continua mostrando a última ação ("ataque") quando o clipe já voltou ao idle: comportamento anterior às correções, não regressão.

## 3. Notas recalculadas [H, apoiadas no §1–§2]

Mesma régua do `F9_QA_INDEPENDENTE.md` §3. Só mudam os itens afetados.

| # | Item | Antes | Agora | Motivo |
|---|---|---:|---:|---|
| 1 | Fidelidade à espécie | 7,5 | **7,75** | presa e garras existem em S/W; A10 (cor), franja e cauda inalterados |
| 2 | Qualidade GBA Plus | 8,0 | **8,25** | rosto S limpo; W ainda embolado a 1× |
| 3 | Consistência anatômica | 7,75 | **8,25** | tufo e mancha removidos, capuz travado; olho maior nos picos fica como decisão |
| 4 | Quatro direções | 7,75 | **8,0** | walk N na altura do standing; S legível de frente |
| 5 | Naturalidade da caminhada | 7,0 | **7,25** | só o +2 px do N; A1 e A6 abertos |
| 6 | Idle | 8,5 | 8,5 | — |
| 7 | Clareza das emoções | 7,75 | **8,0** | entrada do irritado em 2 passos (−23%); assustado ainda salta |
| 8 | Descanso | 8,25 | **8,5** | A8 corrigido; levantar a partir de deitado no lab |
| 9 | Interações | 7,0 | **7,25** | entrada da comemoração suavizada; Tamer no palco para escala; carinho sem Tamer em cena |
| 10 | Combate | 7,5 | **8,0** | A3 e A4 corrigidos; A9 (arfada) aberto |
| 11 | Transições | 7,0 | **7,75** | máquina de estados do lab sem saltos (L1–L5); A7/A8; entradas de assustado e dano seguem bruscas |
| 12 | Integridade | 9,0 | 9,0 | tudo confere; I1 e I2 abertos |
| 13 | Desempenho | 9,0 | 9,0 | — |
| 14 | Escalabilidade | 7,0 | 7,0 | correções a 0 geração útil, mas 2 gerações gastas sem uso e retoque manual por pixel |
| | **Média** | **7,79** | **8,04** (112,5/14) | Meta ≥8: **atingida, por margem mínima**. Abaixo de 8: itens 1, 5, 9, 11, 14. GS-010 (≥9, nenhum <8): **não** |

Régua histórica de 8 critérios (só movimento): fidelidade 7,75 · GBA 8,25 · fluidez 7,5 · anatomia 8,5 · legibilidade (só lab) 8,0 · custo 8,0 · transições 7,5 · regressões 9,0 ⇒ **8,06** (era 7,91).

## 4. Recomendação

1. **Aprovar a rodada de correções como regressão limpa**: 9 de 12 itens do escopo corrigidos (A3, A4, A7, A8, L1–L7), 2 parciais (A2, A5), nenhuma piora medida em integridade, paleta, pé y=49, costuras, spritesheets, GIFs ou console.
2. O pacote passa a **candidato apto a seguir para a Fase 11 (Standard Visual 2.0) com ressalvas registradas**, não a "homologado": a média 8,04 fica no limite, e o P1 **A1** (passada × velocidade do Tamer) continua aberto e bloqueia a integração no jogo.
3. Decisões do fundador ainda pendentes: A1 (trote ou Labramon mais lento), aceitar os intermediários locais do A2 e o olho maior do A4, A9, A10/G-1/G-2, uma ou quatro direções para os estados, commit da pasta F9 (I2).

## 5. Limitações / o que não foi feito

- Não testei no jogo nem em mapa; headless sem GPU.
- A5 "a 1×" é julgamento visual meu sobre capturas 1× e 3×, não medida.
- Não reexecutei o `run_headless_test.mjs` do game-dev (grava na pasta dele); usei só os meus roteiros.
- Não remedi Endesga-32 nem escala (G-1/G-2 abertos).

## 6. Evidências (`qa_f9/regressao/`)

`check.txt` + `qa_arquivos.json` · `visual.txt` + `costuras.json` + `folhas/` + `gifs/` · `pe.txt` + `pe_apoio_walk.json` · `lab_qa.txt` + `lab/lab_qa_report.json` + 5 capturas · `lab_extra.txt` + `lab_extra/lab_extra_report.json` + `L7_tamer_no_palco.png` · folhas antes/depois minhas: `folhas/rot_SW_antes_depois_{1x,3x,10x}.png`, `rotacoes_10x.png`, `combat_A3A4_antes_depois_8x.png`, `entradas_A2_8x.png`, `walkN_standing_6x.png`, `walk_S_W_rosto_6x.png` · roteiros: `scripts/` (cópias com saída redirecionada + `lab_extra.mjs`; rodar com cwd = `fase24-f9-labramon`).
