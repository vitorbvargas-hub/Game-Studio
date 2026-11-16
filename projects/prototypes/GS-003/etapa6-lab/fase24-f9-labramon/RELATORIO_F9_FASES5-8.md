# Relatório F9 — Fases 5, 6, 7 e 8: emoções, descanso, interações e combate do Labramon

Digital Odyssey (GS-003) · F9 Labramon · 2026-11-16 (BRT) · Autor: `game-art` (Fable 5.2) · Comando `COMANDO_F9_LABRAMON.md` §9–12.
Fan game não oficial, sem licença, sem monetização; uso local, nada publicado. **[E]** evidência medida · **[H]** leitura/hipótese.
Esta é a entrega da produção com a medição do próprio produtor. **Não é** o QA independente (Fase 10, `game-qa`) nem homologação.

## 1. Status

**As quatro fases estão COMPLETAS como candidato, na direção E.** Nenhum estado ficou "não iniciado".
Custo: **16 gerações** (orçamento: 30). Saldo 529,75 → **513,75** [E, `get_balance`]. Acumulado F9: **31,65 de 60**; piso 485 respeitado.
Não toquei o jogo, os labs nem a Database. Nada foi publicado.

| Fase | Pasta | Estado | Status | Quadros finais | Ger |
|---|---|---|---|---|---|
| 8 Combate | `combat/attack_retriever_bark` | Ataque Retriever Bark (preparação 4q, execução 2q, recuperação 2q) + camada FX da onda (5q, local) | Completo | 8 + 5 FX | 1 |
| 8 | `combat/hurt` | Receber dano (impacto 3q, recuperação 5q) | Completo | 8 | 1 |
| 8 | `combat/incapacitated` | Queda (6q) → estado incapacitado em loop (4q) → recuperação (8q) | Completo | 18 | 3 |
| 6 Descanso | `rest/rest/stand_to_lie` | Em pé → deitado | Completo | 6 | 1 |
| 6 | `rest/rest/lie_to_sleep` | Deitado → dormindo | Completo | 4 | 1 |
| 6 | `rest/rest/sleep_loop` | Loop de sono com respiração | Completo | 4 | 1 |
| 6 | `rest/rest/sleep_to_wake` | Dormindo → acordando (com bocejo) | Completo | 8 | 1 |
| 6 | `rest/rest/wake_to_stand` | Acordando → em pé | Completo | 8 | 1 |
| 5 Emoções | `emotions/happy` | Feliz (entrada 2q, loop 4q, saída 2q) | Completo | 8 | 1 |
| 5 | `emotions/sad` | Triste (entrada 2q, loop 4q, saída 3q) | Completo | 9 | 1 |
| 5 | `emotions/angry` | Irritado (entrada 1q, loop 4q, saída 2q) | Completo, com ressalva (entrada de 1 quadro) | 7 | 1 |
| 5 | `emotions/scared` | Assustado (entrada 2q, loop 4q, saída 2q) | Completo | 8 | 1 |
| 7 Interações | `interactions/petting` | Receber carinho (entrada 2q, loop 4q, saída 2q) | Completo | 8 | 1 |
| 7 | `interactions/celebrate` | Comemoração (pulo, 8q) | Completo | 8 | 1 |
| 7 | `interactions/contratos` | 3 JSON (esquema, interações, índice de estados) | Completo; nenhum sistema implementado | — | 0 |

## 2. Método

Segui a lição da Fase 4: **`animate_character` em `pixminimax`, direção `east`, com `palette` de 19 cores**, 1 geração por animação, 8 quadros (4 nos dois loops de respiração). Nenhum v3, nenhum template.

- **Quadros-chave** [E]: as animações que voltam ao idle usaram `end_frame` = rotação E. As cadeias usaram o último quadro da animação anterior como `custom_start_frame` (queda → loop/recuperação; deitado → dormir/levantar; dormindo → loop/acordar). O despertar teve início = dormindo e fim = deitado.
- **Pose deitada** [E]: foi desenhada pelo modelo a partir da rotação em pé (pose de esfinge: barriga no chão, patas dianteiras à frente). Não é o sprite achatado: altura 30 px com cabeça inteira; dormindo 24 px com o queixo sobre as patas. A v1 sentada (`rotacoes_sentado/`) foi só consultada como referência visual; nenhum pixel dela entrou.
- **Onda de choque do Retriever Bark** [E]: desenhada localmente (`fx_bark.js`, 0 gerações) como **camada separada**, canvas 96×60 com a mesma origem do sprite, 3 cores da paleta (`#f6f2e8`, `#d5d2c6`, `#010101`), sem semitransparência. A base é a técnica oficial (digimon.net: latido intenso que gera hiper-oscilação); não há contato físico. Cure Liqueur não foi usada (é cura).

Pós-processo local, sem custo (`scripts_f9_fases5-8/`):
1. Recorte para 60×60 no deslocamento medido. **Achado** [E]: com `end_frame` ou `custom_start_frame` o PixelLab recentra e alarga o canvas (60, 64 ou 68 px de largura; deslocamento de 0 a 6 px em X). Sem corrigir, o sprite "pula" ao trocar de clipe. Medi o deslocamento casando o quadro final com a rotação.
2. Remoção de componentes soltos (partículas que o modelo desenhou: ataque q2, 12 px; dano q0, 21 px).
3. Âncora em y=49 (a queda vinha com o corpo em y=50).
4. Correções pontuais:
   - **Triste e carinho:** o modelo desenhou a orelha do lado oposto pendurada sob o queixo; lê como língua de fora. Removida (11–25 px por quadro).
   - **Carinho:** o modelo desenhou a "mão" como uma bolinha branca no topo da cabeça. Troquei o topo do capuz pelo da rotação, no deslocamento medido da cabeça (47–58 px por quadro).
5. **Trava de rosto só onde a expressão é neutra** (rosto difere ≤ 27 de 152 px da rotação): 25 dos 120 quadros gerados foram travados. Nos quadros expressivos (boca aberta, olho fechado, rosnado) a trava apagaria a emoção, então não se aplica.
6. Falhas de contorno fechadas (pixel claro encostado em transparência → `#010101`): 0–6 px por quadro.

**Não rodei `correct_pixelart` + `reduce_colors`.** Na Fase 4 medi que, com `palette` na geração, essa etapa é quase neutra (0 px de silhueta; 0,8 ger). Aqui a paleta já sai exata. É o item 4 das decisões pendentes da Fase 4; se o QA exigir a etapa, são ~1 ger a mais.

## 3. Medições [E]

Iguais em todos os 112 quadros de clipe entregues (um quadro do triste entra duas vezes no loop): **canvas 60×60, 0 pixel semitransparente, 0 cores fora da paleta da rotação E, no máximo 19 cores (teto 24)**. Pé em **y=49 em 109 quadros**; os 3 restantes são os quadros no ar da comemoração (y=46, 43, 45), de propósito.

| Clipe | Quadros | Duração (ms) | Altura (px) | Largura (px) | Olho vermelho (px; rotação = 4) | Marcas (px; rotação = 7) |
|---|---|---|---|---|---|---|
| combat · ataque | 8 | 860 | 34–40 | 38–39 | 3, 4, 7, 6, 4, 5, 4, 4 | 7–8 |
| combat · dano | 8 | 710 | 34–39 | 34–38 | 0, 0, 0, 0, 4, 4, 4, 4 | 7–8 |
| combat · queda | 6 | 720 | 21–38 | 37–46 | 4, 4, 4, 0, 0, 0 | 5–7 |
| combat · estado incapacitado (loop) | 4 | 1260 | 21–22 | 46 | 0 | 5–8 |
| combat · recuperação | 8 | 1130 | 21–36 | 38–46 | 0 ×5, 8, 7, 4 | 4–9 |
| rest · em pé → deitado | 6 | 820 | 30–36 | 38–42 | 4 ×5, 7 | 7–8 |
| rest · deitado → dormindo | 4 | 1200 | 24–30 | 42–43 | 7, 0, 0, 0 | 7 |
| rest · loop de sono | 4 | 2200 | 24 | 43 | 0 | 7–8 |
| rest · dormindo → acordando | 8 | 1920 | 24–31 | 42–45 | 0, 0, 10, 10, 0, 0, 0, 7 | 4–7 |
| rest · acordando → em pé | 8 | 980 | 28–36 | 38–42 | 7, 7, 7, 4 ×5 | 7 |
| emotions · feliz (entrada / loop / saída) | 2 / 4 / 2 | 180 / 480 / 210 | 36–40 | 36–38 | 4, 9 / 9 ×4 / 6, 4 | 7 |
| emotions · triste | 2 / 4 / 3 | 360 / 1800 / 500 | 31–36 | 38–41 | 4, 2 / 3 ×4 / 3, 4, 4 | 5–7 |
| emotions · irritado | 1 / 4 / 2 | 90 / 360 / 250 | 31–36 | 38 | 6 / 6 ×4 / 6, 4 | 6–7 |
| emotions · assustado | 2 / 4 / 2 | 140 / 320 / 290 | 34–40 | 36–38 | 9, 9 / 4 ×4 / 4, 4 | 5–8 |
| interactions · carinho | 2 / 4 / 2 | 220 / 520 / 250 | 34–36 | 38–42 | 4, 0 / 0 ×4 / 2, 4 | 7 |
| interactions · comemoração | 8 | 670 | 31–38 | 36–41 | 4, 4, 6, 6, 6, 6, 6, 4 | 7–8 |

Tabela completa por quadro (com SHA-256) nos `manifesto.json`; log do pós-processo em `_evidencias/pos_processo_log.json` de cada pasta.

**Retorno ao idle** [E]: o último quadro de cada clipe que volta difere da rotação E em 3 a 31 px de 896 (recuperação da incapacitação: 80 px). Olho 4 px e marcas 7 px em todos esses quadros finais, iguais à rotação.

**Costuras entre clipes** [E] (pixels que mudam na troca):
- em pé→deitado (último) → deitado→dormindo (q0): 0 px.
- deitado→dormindo (último) → loop de sono q0: 80 px; fecho do loop de sono (q3→q0): 68 px; dentro do loop: 26–64 px, todos no tronco (x 9–48, y 33–47); bbox constante.
- pose dormindo → dormindo→acordando q0: 211 px; último quadro do loop de sono → acordando q0: 250 px (a orelha já se mexe no q0).
- acordando (último) → pose deitada: 29 px; pose deitada → acordando→em pé q0: 135 px.
- queda (último) → estado incapacitado q0: 37 px; estado → recuperação q0: 60 px.

**Loops das emoções** [E]: feliz — só a cauda se mexe (149–171 px por quadro, x 10–27); carinho — cauda e orelha (46–166 px); irritado — tremor do corpo inteiro (430–433 px); assustado — tremor (111–461 px); triste — quase parado (7–11 px), de propósito.

**Escala (G-2, conflito aberto; só registro)** [E]: Tamer v13 34 px; Labramon em pé 36 px; deitado 30; dormindo 24; incapacitado 21–22; maior altura em ação 40 (latido e feliz). Tile 32.
**Paleta (conflito aberto; só registro)** [E]: as mesmas 19 cores da Fase 3 — 0 pixels em cor exata da Endesga-32; nada mudou nestas fases.

## 4. Ressalvas (para o QA olhar primeiro)

1. **Só a direção E.** O comando pede uma direção para a primeira validação. W, S e N não existem para estes estados. Espelhar E para W não foi testado e troca o lado desenhado.
2. **Cabeça redesenhada nos quadros de ação** [E/H]: no pico do latido (q4–q5) e no loop feliz o sprite chega a 40 px (4 a mais que o standing) e o olho passa de 4 para 5–9 px. É a cabeça erguida com boca aberta, mas é desenho novo do modelo, não os pixels da rotação. No latido aparece no topo da cabeça a orelha do lado oposto, em rosa escuro; mantive como movimento secundário, o QA pode pedir a remoção.
3. **Olho maior deitado** [E]: 7 px de vermelho na pose deitada contra 4 em pé; 10 px em dois quadros do despertar (olho abrindo).
4. **Irritado entra em 1 quadro**: o modelo já começou na postura. Lê como reação brusca; se precisar de entrada suave, falta um quadro intermediário.
5. **Estado incapacitado** [E]: o loop gerado tem 3 quadros de boca aberta e 1 fechado; entre eles mudam ~240 px. Montei como "parado 600 ms + arfada de 3 quadros". Lê como exausto e vivo [H], mas é uma mudança grande para um loop de repouso.
6. **Triste**: a cabeça desce só 3–5 px. A leitura depende mais da postura que do rosto, que a 36 px quase não muda.
7. **Carinho**: a mão do Tamer não existe. O ponto de contato (x 40, y 16) e a posição do Tamer no contrato são propostas não testadas.
8. **FX da onda**: desenho local simples (arcos). Tracejado no lugar de transparência para "apagar". Alcance até x=78 no canvas de 96.
9. **GIFs**: os 76 decodificam no decodificador local com o número certo de quadros. **Não foram abertos num navegador.**
10. **Durações**: são sugestão de arte, não foram testadas em jogo nem no laboratório.
11. Ressalvas herdadas da arte-mestra (franja com cara de cabelo, focinho de perfil um pouco longo, rosa mais saturado que o Reference Book) seguem iguais.

## 5. Contratos da Fase 7 (`interactions/contratos/`)

- `contrato_animacao_estado.schema.json` — formato de um estado animado: clipes (entrada/loop/saída ou disparo único com fases), eventos por quadro, retorno, pontos de contato, parceiro de cena e **campos reservados** para afinidade, humor, vínculo e contexto.
- `contrato_interacoes_labramon.json` — carinho e comemoração nesse formato.
- `contrato_estados_labramon_indice.json` — os 14 estados das Fases 5–8 com id, pasta, manifesto e transições válidas.

Nenhum sistema foi implementado. Todos os campos de afinidade, humor e vínculo estão `null`: quem define é o `game-design`, em tarefa autorizada (regras de jogo congeladas). O Tamer não foi modificado.

## 6. Custo por operação [E]

| Operação | Ger | Qtde | Subtotal |
|---|---|---|---|
| `animate_character` pixminimax E, 8 quadros (ataque, dano, queda, recuperação, deitar, adormecer, acordar, levantar, 4 emoções, carinho, comemoração) | 1 | 14 | 14 |
| `animate_character` pixminimax E, 4 quadros (loop de sono, loop incapacitado) | 1 | 2 | 2 |
| Uploads de quadros-chave, FX, pós-processo, GIFs, folhas | 0 | — | 0 |
| **Total Fases 5–8** | | | **16** |

Nenhuma geração foi refeita nem reprovada. Saldo antes 529,75, depois 513,75. Nenhum crédito comprado.
Jobs e grupos de cada animação: campo `bruto` dos `manifesto.json`.

## 7. O que não foi feito

- **Nota da matriz (Style Bible §8):** não atribuí; é do `game-qa`.
- Direções S, N e W destes estados.
- Teste em jogo ou no laboratório (cadência, sombra de contato, posição do Tamer): Fase 9.
- Animação do Tamer para o carinho.
- Animação de cura (Cure Liqueur): fora do escopo.
- Os quadros finais não foram gravados de volta no personagem PixelLab; a conta tem os 16 grupos brutos novos (`f5-*`, `f6-*`, `f7-*`, `f8-*`) além dos da Fase 4. A fonte de verdade são as pastas. Não apaguei nada da conta.
- Morte e Digiovo: não existem, como pedido.

## 8. Decisões que dependem do fundador / QA

1. Aceitar **uma direção (E)** para estes estados ou pedir W (e quais estados). Cada direção nova custa ~16 ger com este método.
2. Aceitar a cabeça redesenhada nos quadros de ação (latido, feliz) e a orelha oposta visível no latido.
3. Estado incapacitado: manter a arfada de boca aberta ou usar pose parada com respiração leve (nova geração, 1 ger).
4. Dispensar `correct_pixelart` + `reduce_colors` quando a geração já usa `palette` (mesma pendência da Fase 4).
5. Onda de choque: manter o FX local ou pedir outro desenho.
6. Escala e cor (pendências das Fases 3 e 4) seguem abertas.

## 9. Arquivos

Em `projects/prototypes/GS-003/etapa6-lab/fase24-f9-labramon/`:

- `combat/` — `attack_retriever_bark/{frames,fx,composto_preview}`, `hurt/frames`, `incapacitated/{queda,estado,recuperacao}`, `pose_mestra.png` em cada estado.
- `rest/` — `rest/{stand_to_lie,lie_to_sleep,sleep_loop,sleep_to_wake,wake_to_stand}`, `rest/pose_mestra_deitado.png`, `rest/pose_mestra_dormindo.png`.
- `emotions/` — `{happy,sad,angry,scared}/{entrada,loop,saida}` + `pose_mestra.png`.
- `interactions/` — `petting/{entrada,loop,saida}`, `celebrate/frames`, `contratos/*.json`.
- Em cada pasta: `spritesheets/` (uma tira por clipe), `gifs/` (cada clipe e cada demo em 1x e 4x), `folha_contato_1x.png`, `folha_contato_4x.png` (fundo cinza, linha de chão, rotação E na primeira coluna), `folha_contato_3x_transparente.png`, `manifesto.json`, `_evidencias/` (quadros brutos e log do pós-processo).
- Demos: `combat/gifs/demo_ataque_com_fx_*`, `demo_incapacitacao_completa_*`; `rest/gifs/demo_descanso_completo_*` (cadeia inteira, 41 quadros); `emotions/gifs/demo_{happy,sad,angry,scared}_*`; `interactions/gifs/demo_{petting,celebrate}_*`.
- `scripts_f9_fases5-8/` — scripts Node sem dependências + `LEIAME.md`.
- `PROGRESS.md` — atualizado.

Para o `game-dev` (Fase 9): ler os `manifesto.json` e `interactions/contratos/contrato_estados_labramon_indice.json`; pivô (29,5; 49); o FX do ataque é camada à parte em canvas 96×60 com a mesma origem do sprite; nos quadros 2–4 da comemoração a sombra fica no chão.
