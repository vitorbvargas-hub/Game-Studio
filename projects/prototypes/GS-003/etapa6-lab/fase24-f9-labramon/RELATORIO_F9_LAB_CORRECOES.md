# F9 — Correções do laboratório (L1–L7) — game-dev

> Digital Odyssey (GS-003) · retomada da Fase 9, pós-QA independente (`F9_QA_INDEPENDENTE.md` §4/§5).
> Escopo: só `lab/` e `scripts_f9_fase9/`. Nenhuma arte, nenhum `lab-data.js` editado à mão, nenhuma geração
> PixelLab, nenhum toque no jogo, nos labs existentes ou na Database.

## 1. Objeto e contexto

O QA independente (Fase 10) testou o laboratório HTML interativo (Fase 9, `lab/`) e encontrou 7 defeitos de
máquina de estados/UI (L1–L7, P2/P3), listados em `F9_QA_INDEPENDENTE.md` §4–§5. Esta tarefa corrige os 7,
sem mexer em arte, em `lab-data.js` (gerado só por `scripts_f9_fase9/build_lab_data.mjs`) ou no jogo.

Confirmado antes de começar: a execução anterior desta tarefa havia caído pelo limite de uso sem alterar
nenhum arquivo (`lab/app.js` ainda com mtime de 01:27, sem este relatório) — nada foi refeito, o trabalho
abaixo é a primeira alteração real.

## 2. Defeitos e correção aplicada

| ID | Defeito (QA) | Correção em `lab/app.js` |
|---|---|---|
| **L1** | Atacar (ou qualquer ação) dormindo salta de deitado para em pé; `restState` fica preso em `dormindo`; "Acordar" entra depois do idle, não do dormindo | `requireStanding(p, nome)`: bloqueia com aviso (`INDISPONÍVEL`) qualquer ação que não seja a própria transição de volta quando `restState !== "despertou"` ou `combatState !== "normal"`. Aplicado em `ataque`, `dano`, `incapacitacao`, `comemoracao`, `standing`, `idle`, `startWalk` e na entrada de cada emoção (`emotionToggle`) |
| **L2** | Emoção durante a incapacitação salta do chão para em pé; `combatState` continua `incapacitado` | Mesma `requireStanding` (bloqueia `combatState === "incapacitado"`); `recuperacao` (inalterada) continua sendo a única saída, e só ela zera `combatState` |
| **L3** | WASD deitado anda na hora; "Dormir" depois pula o deitar; "Deitar" estando deitado recomeça do em pé | `startWalk` agora chama `requireStanding` antes de qualquer coisa. `CTRL.deitar` ganhou um 2º clique: com `restState === "deitado"`, em vez de recomeçar `stand_to_lie`, toca `lie_to_stand` — **o próprio clipe `stand_to_lie` tocado ao contrário** (`reversedClip`, só inverte os arrays `frames`/`durations` em memória; nenhum pixel novo, nenhum PixelLab) — e ao terminar zera `restState = "despertou"`. O botão "Deitar" muda de rótulo para "Levantar" enquanto deitado (`updateRestButtons`) |
| **L4** | O `setTimeout` de 900 ms do botão de caminhada chama `stopWalk` mesmo se outra ação já começou, cortando-a para idle | Duas camadas: (1) todo `CTRL[...]` é reenvolvido num laço que zera `activeWalk` sempre que uma ação real começa no mesmo painel; (2) o clique no botão de walk guarda o objeto `activeWalk` no momento do clique e só chama `stopWalk` se `activeWalk` ainda for *aquele mesmo objeto* 900 ms depois — qualquer ação nova (que zera ou substitui `activeWalk`) cancela o corte |
| **L5** | Segurar D, apertar A, soltar D → vai para idle com A ainda pressionada | Pilha `heldDirKeys`: ao soltar uma tecla, se ainda sobrar alguma tecla de direção pressionada, retoma o walk na direção da última tecla ainda segurada; só vai para idle quando a pilha esvazia. Também limpa a pilha e para no `blur` da janela (perda de foco), para não ficar andando "preso" se uma tecla solta fora da página |
| **L6** | `flashUnavailable` restaura, 1,8 s depois, o texto capturado antes; cliques seguidos deixam o rótulo preso em "INDISPONÍVEL" por cima de uma ação real posterior | `flashUnavailable` agora mantém **um único** `setTimeout` por painel (cancela o anterior a cada novo aviso) e só guarda o texto original na *primeira* chamada da sequência. `label()` (toda ação real) cancela esse timeout pendente e limpa o texto guardado — uma restauração atrasada nunca mais sobrescreve um rótulo legítimo mais novo |
| **L7** | Tamer provisório só como `<img>` numa seção separada, fora do palco; sem comparação de escala em cena | O Tamer deixou de ter uma seção/`<img>` própria. Agora é composto **dentro do próprio canvas do palco** (`ClipPlayer.render()`): quando o novo controle "Tamer de referência no palco (escala)" está ligado, o canvas é alargado à direita do Labramon e o PNG do Tamer (o mesmo arquivo, lido do `assetImg` já pré-carregado) é desenhado ali, com o pé alinhado na mesma linha de chão (`PIVOT.y_chao`, medido ao vivo por `analyzeFrame`, igual ao resto do laboratório). O arquivo original (`lab/assets/tamer_reference/tamer_v13_south.png`) não é tocado — só lido |

### O que não foi inventado

- Não fabriquei uma pose de "carinho com o Tamer em cena": não há dado de produção sobre o ponto de contato
  da mão no carinho (`A5`/pendência da Fase 7), e inventar uma posição seria simular, contra o princípio do
  laboratório ("nunca simulado por aproximação"). O Tamer no palco é só comparação de escala/posição ao lado
  do Labramon, como o QA pediu explicitamente ("não há comparação de escala ... em cena").
- `lie_to_stand` não existe como clipe de produção; uso o próprio `stand_to_lie` tocado ao contrário (técnica
  de reprodução, não arte nova), exatamente como o enunciado da tarefa citava esse nome.

## 3. Self-test e teste headless

`window.__labSelfTest` (em `lab/app.js`) ganhou um bloco novo de 14 asserções, duas por cada L1–L7 na maioria
dos casos (estado antes do bloqueio + bloqueio em si + recuperação), usando os próprios controles do
laboratório (sem nada simulado):

- L1: deitar → dormir → tentar atacar dormindo (bloqueado) → acordar (completa)
- L2: incapacitar → tentar feliz incapacitado (bloqueado) → recuperação (completa)
- L3: deitar → tentar WASD deitado (bloqueado) → 2º "Deitar" levanta (`lie_to_stand`)
- L4: clique de walk (com o timeout de 900 ms) → ataque logo depois → confirma que o ataque ainda está
  tocando no instante em que o timeout antigo cortaria
- L5: `KeyboardEvent` sintéticos D, A, solta D (continua andando W), solta A (vai para idle)
- L6: dois avisos de "INDISPONÍVEL" seguidos fora de E, depois uma ação real em E — confirma que o rótulo
  não é sobrescrito de volta para "INDISPONÍVEL" pela restauração atrasada
- L7: liga o controle do Tamer no palco e confirma que o canvas fica mais largo que `CANVAS_W` e que o PNG
  do Tamer carregou (`assetStatus === "ok"`)

Também corrigi dois tempos de espera do self-test original que, sem a correção de L1–L3, já estavam
desalinhados com a duração real dos clipes (`dormir`→`acordar` esperava 600 ms antes de "Acordar" quando
`lie_to_sleep` dura 1200 ms; a espera pós-"Acordar" era 900 ms quando a cadeia `sleep_to_wake`+`wake_to_stand`
dura ~2900 ms) — sem esse ajuste, as novas guardas de `requireStanding` bloqueariam silenciosamente os
testes existentes de carinho/comemoração/ataque/dano que vêm depois, sem o self-test acusar isso (ele só
checa se o asset do quadro atual carregou, não a semântica do estado).

`scripts_f9_fase9/run_headless_test.mjs` ganhou: impressão dos 14 `Lchecks` e do `LfailedCount`; uma 4ª
captura (`04_tamer_no_palco_L7.png`) com o Tamer visível no palco; e um veredito explícito (`report.ok` +
`process.exitCode = 1` se algo falhar) em vez de só registrar números sem concluir.

### Resultado (2026-11-16, `scripts_f9_fase9/_evidencias_teste/report.json`)

- **182/182 assets carregados, 0 erro.**
- `window.__labSelfTest()`: **35/35 passaram, 0 novos erros de JS.**
- **14/14 casos novos L1–L7 passaram** (`LfailedCount: 0`) — lista completa no `report.json`.
- **0 erros de console, 0 exceções de página, 0 requisições falhadas.**
- `RESULTADO FINAL: PASSOU (0 erros)` — `{"assetsOk":true,"selfTestOk":true,"noPageErrors":true,"noConsoleErrors":true}`.
- 4 capturas inspecionadas: a nova (`04_tamer_no_palco_L7.png`) confirma visualmente o Labramon e o Tamer
  lado a lado, na mesma linha de chão, dentro do mesmo palco (62 → canvas alargado para 102 px de largura).
- Evidência original da Fase 9 (antes desta correção) preservada em
  `scripts_f9_fase9/_evidencias_teste_fase9_original/`, para auditoria.
- **`curl http://127.0.0.1:5198/lab/index.html` → HTTP 200**; `lab/app.js` → HTTP 200 (md5 do servidor
  igual ao do arquivo em disco, confirmando que o servidor já serve a versão corrigida).

Dois ajustes de calibração feitos nos meus próprios testes novos (não no código corrigido) antes do
resultado final: o check de L4 originalmente esperava 900 ms depois de iniciar o ataque (tempo total do
próprio ataque, 860 ms) — o ataque já tinha terminado sozinho, dando falso negativo; ajustado para checar
~950 ms depois do **início do walk** (logo após os 900 ms do antigo timeout do botão), antes do fim natural
do ataque. O check de L6 comparava com `p.stateName` (nome longo, usado só no diagnóstico interno) em vez do
texto que `label()` escreve no DOM (nome curto, "ataque") — corrigido para comparar com o texto real do
rótulo.

## 4. O que não foi feito / limitações

- Não toquei em `lab-data.js` à mão; não gerei nem editei nenhum pixel; nenhuma chamada PixelLab.
- Não toquei no jogo, nos labs existentes nem na Database.
- Não decidi se "incapacitação/dormir bloqueiam ataque/emoção" é uma regra de jogo — é uma simplificação
  deste laboratório de revisão de animação, para impedir saltos de pose não anunciados; não é uma decisão
  de game design testada ou aprovada.
- `reversedClip` (L3) é uma técnica de reprodução (tocar os quadros ao contrário), não um clipe de produção
  chamado `lie_to_stand`; está documentado no código e aqui — se o fundador/game-design quiser um clipe de
  "levantar" desenhado de verdade mais tarde, basta trocar essa função por uma referência de clipe real.
- Os demais itens pendentes do QA (A1–A10, G-1/G-2, decisões de cor/escala, direção única E) continuam em
  aberto — fora do escopo desta tarefa (só L1–L7 do laboratório).
- Servidor `127.0.0.1:5198` deixado ativo (mesma decisão herdada da Fase 9), servindo os arquivos já
  corrigidos.
- `lab/` e `scripts_f9_fase9/` continuam fora do git (`??`, mesmo estado herdado) — decisão de commit segue
  com o coordenador.

## 5. Arquivos alterados

- `lab/app.js` — todas as correções L1–L7 + self-test.
- `lab/index.html` — removida a seção separada do Tamer; adicionado o controle "Tamer de referência no palco
  (escala)" em Visualização.
- `lab/styles.css` — removida a regra órfã do `<img>` do Tamer (o elemento não existe mais).
- `scripts_f9_fase9/run_headless_test.mjs` — relatório dos `Lchecks`, 4ª captura, veredito explícito.
- `scripts_f9_fase9/_evidencias_teste/` — reexecutado (novo `report.json` + 4 capturas); original preservado
  em `_evidencias_teste_fase9_original/`.
- `PROGRESS.md` — atualizado com esta rodada.

Nenhum outro arquivo do pacote F9 foi tocado.
