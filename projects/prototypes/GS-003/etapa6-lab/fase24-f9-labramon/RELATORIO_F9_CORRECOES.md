# F9 Labramon — Rodada curta de correções de arte pós-QA (A2–A8)

- **Agente:** game-art (sessão de produção; a avaliação destas correções é do QA de regressão, em outra sessão)
- **Data:** 2026-11-16 · **Status:** CANDIDATO — aguardando QA de regressão (game-qa) e homologação do fundador. Nada publicado.
- **Base:** `F9_QA_INDEPENDENTE.md` §5 (defeitos) e §7 (recomendação); `RELATORIO_F9_FASE4.md`; `RELATORIO_F9_FASES5-8.md`.
- **Licença:** private-prototype (fan game não oficial, sem licença, sem monetização). Espécie oficial Bandai/Toei.

## 1. Resumo

1. Corrigidos na ordem pedida: **A3, A7, A8, A4, A2, A5**, e a trava de rosto foi reaplicada onde a rotação S/W é usada (walk S/W, idle W; idle S refeito pelo rig a partir da rotação S nova; standing S/W = rotações novas).
2. Tudo por retoque/pós-processo local. **PixelLab: 2 gerações gastas (A2), nenhuma aproveitada** — o pixminimax repetiu o salto em 1 quadro (irritado) ou desenhou um intermediário que, medido, aumenta o maior salto (comemoração). Os dois intermediários entregues são locais. Saldo **513,75 → 511,75** (piso 485 respeitado; teto da rodada 2/2).
3. Mantidos: canvas 60x60, pé em y=49 (exceto os 3 quadros no ar da comemoração, como antes), **0 semitransparência**, **0 cor fora da paleta de 19**, ≤19 cores por clipe.
4. Remontados com os scripts de build: quadros, manifestos, spritesheets, GIFs (92, 0 com erro no verificador do QA e 92/92 no decodificador local), folhas de contato, `rotacoes/manifesto.json` + `_preview_6x`, `movement/qa_medicoes.json` e `qa_tabelas.md`, e `lab/lab-data.js` (só dados, via `scripts_f9_fase9/build_lab_data.mjs`; código do lab intocado).
5. Medição com cópias dos scripts do QA (`qa_f9/scripts/visual.mjs` e `check.mjs`, saída redirecionada; `qa_f9/` não foi tocado): **0 referência de manifesto faltando** (antes: 1), **0 SHA divergente**, folhas = quadros em todos os clipes, standing = rotação nas 4 direções.

## 2. Antes/depois medido por defeito

Medidas: "costura" = pixels diferentes entre o último quadro de um clipe e o primeiro do seguinte (mesmo método do QA, `costuras.json`). Antes = `_pre_correcao/`; depois = entrega atual. Arquivos em `_evidencias_correcoes/medicoes_{antes,depois}/`.

| ID | Defeito | Antes | Depois | Como | Gerações |
|---|---|---|---|---|---|
| **A3** | Tufo vinho da orelha oposta no alto da cabeça | Pixels vinho/rosa nas caixas do tufo: latido q4 **23**, q5 **7**; dano q0 **21**, q1 **14**, q2 **9**; vinho no contorno do alto da cabeça deitada: queda q4–q7 **2–3**, estado q0–q3 **2**, recuperação q0–q7 **1–2** | Latido q4 **2**, q5 **2** (*); dano q0–q2 **0**; queda/estado **0**; recuperação **0** (q6: 2 (*)) | `fix_f9.js`: tufo apagado; onde encostava na cabeça vira contorno #010101; restos de contorno sem pixel claro vizinho removidos; contorno fechado | 0 |
| **A7** | Walk N 2 px acima do standing | Costura standing N → walk N q0 **543 px** (alinhado dy=2: 378); topo y=12, altura 38 | **353 px** (melhor alinhamento já dx 0, dy 0); topo y=**14** = standing; altura **36**; pé y=49 em 8/8 | `a7_walkN.js`: tira as linhas y=44 e y=47 da zona das patas, as mesmas nos 8 quadros (o par de menor diferença, 86 px somados) — o corpo desce 2 px sem tirar a pata de apoio de y=49 | 0 |
| **A8** | Em pé → deitar começa 2 px deslocado | Costura idle E → q0 **703 px** (alinhado dx=2: 439) | **439 px** (dx 0); costuras internas 656 / 501 / 652 / **438→157** / 17; pose deitada sem mudança (deitado → adormecer continua 0 px) | `fix_f9.js`: rampa horizontal nos quadros-fonte 0–3 (+2, +2, +2, +1 px), 4–7 sem mudança; a rampa foi escolhida por busca (menor soma das costuras) | 0 |
| **A4** | Topo do capuz redesenhado nos picos de ação | Latido q4/q5/q6: altura **40/39/38**, topo y=10/11/12 | Altura **38/38/38**, topo y=12; faixa do topo do capuz = rotação E no deslocamento medido (diferença de silhueta após: 10/14/0 px; q6 já casava) | `a4_f9.js`: cola a faixa y≤20, x 31–48 da rotação E no deslocamento achado pela silhueta; olho, boca e focinho intocados. Recuperação q6: 24 px trocados, altura 36 | 0 |
| **A4** | Mancha cinza sobre o olho (incapacitado) | Cinza (#6b6b5c/#434a39) na região do olho: queda q4–q7 **18**, estado q0–q3 **18–19** | **0** na queda; **0–1** no estado (o 1 restante é sombra da bochecha) | `a4_f9.js`: a mancha vira capuz claro; fica o olho fechado = linha escura de 4 px com 1 tom de pálpebra (#d5d2c6) | 0 |
| **A2** | Entrada do irritado salta do idle em 1 quadro | idle E → irritado q0 **859 px** em 1 quadro | idle E → **q8 664** → q0 **196** → q1 406 (2 passos; maior salto −23%) | `intermed_f9.js` modo cauda: a pose desenhada do q0 com a cauda ainda na posição do idle (a cauda sobe 1 quadro depois). Entrada = [q8, q0], 80 + 90 ms | 0 usada (1 gasta, reprovada) |
| **A2** | Entrada da comemoração salta do idle | idle E → comemoração q0 **753 px** | idle E → **novo q0 668** → antigo q0 **468** (maior salto −11%) | `intermed_f9.js` modo patas: a pose do q0 com as patas 2 px mais longas (o corpo desce em 2 passos). Clipe 8 → 9 quadros; fases, quadros no ar (3–5) e contrato atualizados | 0 usada (1 gasta, reprovada) |
| **A5** | Rosto embolado em S/W; presa, garras quase invisíveis | S: olho 7 px (esquerdo 2x2, direito em diagonal de 3), cinza ao redor; boca = linha cinza; garras 16 px de 1 tom (#a4a370) + 2 sombra. W: olho 3 px + vermelho solto acima; marca rosa colada no olho | S: 2 olhos **2x2** (pálpebra #81231d em cima, #c63239 embaixo), cinza ao redor trocado por claro; boca escura de 4 px com **presa 1 px #f6f2e8** entre 2 cinzas (x28,y32); garras **6 claro + 8 escuro** (#a4a370 + #434a39) = 3 garras por pata. W: olho **2x2** com pálpebra escura; vermelho solto e marca colada removidos (marcas 8→6 px); boca curta + **presa 1 px**; garras **9 claro + 11 escuro**. Paleta 19, 0 semi, bbox igual | `a5_rot.js` (lista explícita de pixels; S 59 px, W 29 px). Trava de rosto reaplicada (`post_mov.js`): walk S/W e idle W com 0 px de diferença no rosto contra a rotação em todos os quadros; idle S refeito pelo rig | 0 |

(*) Os 2 pixels restantes no latido q4/q5 e na recuperação q6 são o contorno #250d20 do próprio topo da rotação E (que tem esses 2 pixels por desenho), colado pela trava do A4 — não é tufo.

Efeitos colaterais medidos (sem regressão): costura standing S → walk S 170 → 177 px (rosto novo); dano idle → q0 890 → 886; estado → recuperação 261 → 260; recuperação → idle 215 → 221; loop do incapacitado 229/37/30, fecho 243 → 223/37/30, fecho 237. Olho walk/idle S 7 → 8 px (dois olhos 2x2); marcas W 8–9 → 6–7 px (marca colada no olho removida).

## 3. Gerações PixelLab (A2)

| Animação | Grupo | Job | Uso | Por quê |
|---|---|---|---|---|
| `f9c-angry-entry` (pixminimax E, 4 q, palette 19, início = rotação E, fim = irritado q0) | 9253c30e-9dc0-4f87-b527-fc2e23382645 | 8fa7612b-9121-4852-b269-667cdb7e427e | não usada | q0 ≈ rotação (149 px) e q1–q3 ≈ pose final (92 px do alvo): o modelo salta em 1 quadro, de novo |
| `f9c-celebrate-entry` (idem, fim = comemoração q0) | 0064f40a-652e-4bc0-b418-a14d27070782 | e72d9673-1e09-4521-af7d-bd3562c03da6 | não usada | o q2 é um desenho bom a meio caminho, mas mede idle → q2 613 e q2 → q0 **797** (> 753 do salto original); q1 sai do chão |

Brutos em `_evidencias_correcoes/a2_geracoes_nao_usadas/` e em `emotions/` e `interactions/_evidencias/bruto_pixminimax/`. As duas animações ficam no personagem PixelLab e7b2c58f (não apagadas). Saldo antes 513,75, depois **511,75**. Acumulado F9: 31,65 + 2 = **33,65 / 60**.

## 4. Arquivos alterados

- `rotacoes/labramon_S.png`, `labramon_W.png`, `_preview_6x/labramon_{S,W}_6x.png`, `manifesto.json` (SHA novos + `sha256_antes_correcao` + bloco `correcoes_pos_qa`). E e N intocados.
- `movement/` inteiro remontado: standing S/W, walk S/N/W, idle S/W (E e N byte a byte iguais), spritesheets, GIFs, folhas, `qa_medicoes.json`, `qa_tabelas.md`, `manifesto.json` (bloco `correcoes_pos_qa` com A5, A7 e a limpeza), `_evidencias/correcoes_pos_qa_log.txt`.
- `combat/`, `rest/`, `emotions/`, `interactions/` remontados pelo `build58_f9c.js` (mesmo build58 + entradas A2 + gerações f9c registradas + bloco `correcoes_pos_qa` em cada manifesto).
- `interactions/contratos/contrato_interacoes_labramon.json`: só a comemoração (9 quadros, durações, fases, eventos `sai_do_chao` q3 / `aterrissa` q6, retorno q8). O resto dos contratos intocado.
- `lab/lab-data.js` regenerado (181 referências de arquivo, 0 faltando).
- Novos: `RELATORIO_F9_CORRECOES.md`, `scripts_f9_correcoes/` (+ `LEIAME.md`), `_evidencias_correcoes/` (folhas antes/depois por defeito, medições antes/depois, brutos A2), `_pre_correcao/` (backup de `combat rest emotions interactions movement rotacoes` e `lab/lab-data.js` antes de qualquer alteração).

## 5. Evidências

- `_evidencias_correcoes/A3_A4_latido_dano_antes_depois_6x.png`, `A3_A4_incapacitado_antes_depois_6x.png`, `A5_rotacoes_S_W_antes_depois_{1x,8x}.png`, `A5_walk_idle_{S,W}_depois_4x.png`, `A7_walkN_antes_depois_4x.png`, `A8_em_pe_deitar_antes_depois_4x.png`, `A2_entradas_antes_depois_4x.png` (linha de cima = antes, linha de baixo = depois; 1ª célula = idle/rotação de referência).
- `_evidencias_correcoes/medicoes_{antes,depois}/` — `visual.txt` e `costuras.json` (costuras), `check.txt` e `qa_arquivos.json` (por quadro: canvas, alfa, cores, paleta, pé, olho, marcas, SHA, refs, órfãos, folhas, GIFs). `medicoes_depois/folhas` e `gifs` = as folhas e cadeias no formato do QA, já com as correções.
- Log por quadro das correções: `_evidencias/pos_processo_log.json` de cada pasta (campo `correcoes_pos_qa`), `movement/manifesto.json` → `correcoes_pos_qa`.

## 6. Limitações e o que NÃO foi feito

- **A2 não chega a "sem salto":** o irritado ainda tem 664 px no 1º quadro (era 859) e a comemoração 668 (era 753). Os intermediários são locais: o do irritado é desenho real com a cauda atrasada (sobreposição de ação); o da comemoração é a pose do q0 com as patas 2 px mais longas (a barriga fica 2 px mais alta nesse quadro). Um intermediário desenhado de verdade exigiria outra estratégia de geração (ou retoque manual maior) — fora do teto desta rodada.
- **A4:** travei só o topo do capuz e limpei a mancha do olho. O olho maior (6–9 px) e a boca nos picos de ação ficaram como expressão, sem trava (o brief pedia não tocar a boca).
- **A5:** o retoque é meu (diretor e produtor na mesma sessão) e não foi avaliado por outra sessão. As garras e a presa ficam no limite da leitura a 1×; a presa só existe nas rotações S/W, standing e nos quadros onde a trava de rosto cola a linha y=32 (S) / y=30 (W). As garras não foram propagadas para os quadros de walk/idle (as patas ali são animadas). As rotações do personagem PixelLab e7b2c58f continuam as antigas (não reimportei: custaria geração e não foi pedido).
- O walk N agora tem as patas 2 px mais curtas que o bruto (era assim que o corpo ficava 2 px alto); conferido a olho na folha 4x, não em jogo.
- Não toquei: jogo, labs existentes, Database, `qa_f9/`, o código do lab (`index.html`, `app.js`, `styles.css`), A1, A6, A9, A10, L1–L7, I1, I2 (fora do escopo). Não rodei o teste headless do lab (ele grava evidências na pasta do game-dev); conferi só que os 181 arquivos citados em `lab-data.js` existem.
- Nada publicado; nada commitado (a pasta F9 segue fora do git, decisão do coordenador).

## 7. Para o QA de regressão / coordenador

1. Reexecutar `qa_f9/scripts/*.mjs` (o QA pode comparar com `_evidencias_correcoes/medicoes_depois/`). Atenção: o `visual.mjs` mede "irritado entrada → loop q0" a partir do **primeiro** quadro da entrada (agora o intermediário); a costura real entrada → loop é q0 → q1 = 406 px, igual a antes.
2. Decisões do fundador que seguem abertas: aceitar o olho maior nos picos de ação (A4) e o intermediário local da comemoração; G-1/G-2 (escala: walk N agora 36 px, igual ao standing; Labramon 36 px × Tamer v13 34 px), cor (A10), A1 (velocidade/trote).
3. Para o `game-dev`: o lab lê os dados novos sem mudança de código; a comemoração passou de 8 para 9 quadros e o irritado tem entrada de 2 quadros.
