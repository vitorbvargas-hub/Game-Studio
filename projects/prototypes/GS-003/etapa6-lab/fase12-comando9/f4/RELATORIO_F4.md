# Comando 9, F4: comparação dos métodos e teste híbrido (relatório)

**Digital Odyssey (GS-003) · game-art · 2026-11-14, 11:16–11:35 · brief: `../BRIEF_F4_COMPARACAO.md`**
**Custo PixelLab: 0 gerações.** Nenhuma ferramenta PixelLab foi chamada nesta tarefa (nem `get_balance`, para não gerar dúvida de consumo; o saldo registrado na F2 foi 573,95 e nada foi gasto desde então por esta frente).
Legenda: **[E]** medido nesta tarefa · **[L]** lido dos relatórios/QAs, não reverificado · **[H]** hipótese · **NÃO VALIDADO**.

## Resumo

- **D (híbrido) foi montado e entregue** para o Agumon S: idle do rig (6 q), ataque com antecipação do rig + miolo v3 F2b + volta do rig (9 q), feliz v3 custom polido (10 q). Todos num canvas comum de 64×64 com a sola em y=45.
- **A emenda rig → v3 foi testada [E]:** crânio com 16 px de largura em todos os 25 quadros; sola fixa em 45; 0 cores fora da paleta do pacote; 0 pixels semitransparentes. Mas a troca de desenho é visível: a entrada (rig q2 → v3) muda 604 px, 1,5× o maior corte interno do próprio ataque v3 (406 px), e a saída muda 493 px (1,25× o corte interno equivalente, 393). O que muda não é tamanho nem posição, é sombreado, sobrancelha e braço (detalhes no §3).
- **Recomendação:** D como pipeline padrão para bípedes, com o rig restrito a idle, piscar e 1–2 quadros de antecipação/volta. Proposta em `PROPOSTA_STANDARD_1.1.md` (PROPOSTA; quem homologa é o fundador).
- **Limite principal:** D não tem QA independente. As notas da tabela vêm dos QAs da F2 e da F3; para D, só as notas herdadas dos componentes.

## 1. Entregas

| Caminho (em `fase12-comando9/f4/`) | Conteúdo |
|---|---|
| `hibrido_agumon_S/idle/frame_000..005.png` | Idle = rig F3 (quadros idênticos ao `f3/anim_idle_S`, só transladados +9/+1 para o canvas 64) |
| `hibrido_agumon_S/ataque/frame_000..008.png` | Pepper Breath híbrido (origem de cada quadro em `ataque/origem.txt`) |
| `hibrido_agumon_S/feliz/frame_000..009.png` | Feliz v3 custom polido (q0–q8) + volta ao neutro (q9 = q0) |
| `hibrido_agumon_S/*/delays_ms.txt`, `origem.txt` | Tempo de cada quadro e de onde veio cada quadro |
| `hibrido_agumon_S/folha_4x.png`, `hibrido_4x.gif` | Folha 4× (uma linha por animação) e GIF 4× com as 3 animações em ciclo |
| `pagina_comparacao.html` | Página local, sem rede (94 quadros embutidos em base64): A, B, C e D lado a lado em 1× e 4×, animando por JS com o tempo real de cada quadro; pausa, quadro a quadro, 0,5×/0,25× e fundo claro. Notas e custo em cada bloco |
| `metricas_hibrido.json` | Bbox, sola, topo e largura do crânio, cores, cores fora da paleta e pixels mudados por quadro, para D, para o ataque F2b inteiro (referência) e para o feliz antes/depois do polimento |
| `scripts/build_hibrido.py`, `scripts/build_pagina.py` | Refazem tudo: `cd scripts && python3 build_hibrido.py && python3 build_pagina.py` |
| `PROPOSTA_STANDARD_1.1.md` | Pipeline recomendado (PROPOSTA) |

## 2. Como o híbrido foi montado

**Canvas comum.** As três fontes têm canvas diferentes (rig 48, ataque F2b 60, feliz v3 64). Escolhi 64×64 (o único em que o pulo do feliz cabe sem corte) e uma âncora única, sola em y=45. Os deslocamentos foram medidos, não chutados [E]:
- `rotations/S` → canvas 64: (+9, +1). O feliz v3 q0 bate com a rotação em 581 de 582 pixels nesse deslocamento.
- `attack/S` (F2b) → canvas 64: (+3, −5), o melhor casamento do q0 do ataque com a rotação (444/582 pixels iguais; o q0 do v3 já é um redesenho da rotação).
- Nada foi reescalado: só translação inteira.

**Idle.** Os 6 quadros do idle S da F3, como estão (QA 7,5). Tempos: 220/180/260/180/200/140 ms.

**Ataque Pepper Breath.**

| q | Origem | ms |
|---|---|---|
| 0 | rig: neutro (= idle q0) | 200 |
| 1 | rig: agacha 1 px | 140 |
| 2 | rig: agachado, braços 1 px para fora, boca nível 1 | 120 |
| 3 | v3 F2b q4: disparo (boca aberta, fogo) | 160 |
| 4 | v3 F2b q5: fogo no chão | 120 |
| 5 | v3 F2b q6: faísca | 120 |
| 6 | v3 F2b q7: boca aberta, sem fogo | 160 |
| 7 | rig: braços 1 px para fora, boca nível 1 | 140 |
| 8 | rig: neutro (= idle q0) | 200 |

- A antecipação segue o QA da F3: só agachar e abrir a boca, sem o "inclinar para trás" e sem o final em "T" (os quadros que o QA deu como não funcionando ficaram de fora).
- Os quadros F2b q0–q3 (carga com brilho no peito, boca fechada) saíram: entre a boca aberta do rig e a boca aberta do disparo, um quadro de boca fechada criaria um vaivém.

**Feliz.** O v3 custom em 1× (`f3/ref_v3_custom_feliz_1x`), polido [E]:
- **Boca:** o roxo/magenta do v3 (8 tons, 61 px em q2–q8) virou a boca do Pepper Breath do mesmo pacote (`#ca0146` língua, `#860037` e `#7d0032` interior). Assim, Agumon tem a mesma boca no feliz e no ataque.
- **Ruído de cor:** 65 px de 23 tons que não existem no pacote foram trocados pela cor mais próxima do pacote (a maior parte a ≤ 45 RGB; tons de olho, garra e sombra).
- **Resultado:** 0 cores fora da paleta do pacote em todos os quadros (antes: 7 a 14 por quadro). 0 pixels soltos (já não havia). Sola em 45 nos quadros de chão (q0–q2, q8, q9).
- **Volta ao neutro:** q9 = q0, que é a própria rotação. Com isso, o feliz começa e termina no mesmo quadro do idle (diferença de 1 px), e o jogo pode emendar idle → feliz → idle.

**P2/P3 do QA da F3 que caíam no híbrido.** Resolvidos por construção, sem retoque:
- Braço girado (toco) e braço espelhado (luz invertida): **não usados**. O D só usa o braço "mid", que é translação pura. Isso também atende à leitura literal "só deslocamentos" (P3).
- Preparo terminando em "T": **cortado**.
- Cores da boca vindas do `attack/S` (P3): no ataque híbrido elas convivem com os quadros do próprio `attack/S`, então deixam de ser cor estranha à animação. A boca do feliz foi unificada nas mesmas cores.
- Piscar do idle E com cores de S (P3): o E não entra no híbrido; continua aberto.

## 3. A emenda (o ponto que o QA marcou como NÃO VALIDADO)

**Medido [E]** (`metricas_hibrido.json`):

| Medida | Entrada rig q2 → v3 | Saída v3 → rig q7 | Referência: cortes internos do ataque F2b (q0→q8) |
|---|---|---|---|
| Pixels mudados | **604** | **493** | 147 a 406 (maior: q0→q1, 406; q7→q8, 393) |
| Topo do crânio | 12 → 13 (o v3 está mais agachado) | 13 → 11 | 11 a 13 |
| Largura do crânio (linha topo+5) | 16 → 16 | 16 → 16 | 16 em todos |
| Sola | 45 → 47 (*) | 45 → 45 | 45 (47 quando o fogo passa sob os pés) |
| Cores fora da paleta do pacote | 0 | 0 | 0 |

(*) A linha 47 é o fogo abaixo dos pés, não o pé.

**Visto a 6×–8× [E]:** não há salto de tamanho nem de posição; a cabeça tem a mesma largura e o pé não sai do lugar. O salto é de **desenho**: os quadros v3 têm a barriga mais clara, sobrancelha franzida e os braços abertos na horizontal, enquanto os do rig são a rotação (sombreado mais quente, braços caídos). A unificação de cores não reduz o salto: testei aproximar as cores dos quadros v3 da rotação até 30 RGB e os 604/493 px não mudaram (as cores já são distintas; a diferença é de traço).

**[H]** A 1×, no tempo de jogo (120–160 ms), a entrada coincide com o estouro do fogo e tende a ler como impacto. A saída (braços que caem e sobrancelha que relaxa num quadro) é o ponto mais provável de "pulo". **NÃO VALIDADO em movimento:** não consegui abrir a página nem o GIF em navegador nesta sessão (o Chromium headless do ambiente não tem a `libnspr4`); conferi a sintaxe do JS (`node --check`), as 94 imagens embutidas, a ausência de qualquer URL de rede e as folhas estáticas a 6×–8×. Isso fica para o QA independente.

**Conserto barato possível, não feito:** um quadro intermediário de saída, desenhado à mão a partir do v3 q7 com os braços a meio caminho (o rig não tem braço a meio caminho com a luz certa). Custo 0, ~10–15 min de pixel à mão por quadro. Não fiz porque o brief pede o teste da emenda, e um retoque à mão mudaria o que está sendo testado.

## 4. Tabela por método

Notas = **QAs independentes** (`f2/QA_F2_INDEPENDENTE.md`, `f3/QA_F3_INDEPENDENTE.md`), não as autoavaliações. Agumon, salvo indicação. Régua do QA: referência aprovada v13/v15; paleta fora da nota (conflito aberto).

| Critério | A — PixelLab original (v7 + v3 custom) | B — A + polimento F2/F2b | C — rig 2D (F3) | D — híbrido (F4) |
|---|---|---|---|---|
| **Fidelidade** | 5,5 (QA F2, antes). Crista, rosto nas costas, pé marrom, barriga branca | **7,5** (QA F2, depois). Fogo do ataque S sai do peito, não da boca | Sem nota de fidelidade no QA. Identidade preservada por construção: crânio 100% idêntico ao sprite em todos os quadros [L, QA F3 §1] | **Não avaliado.** Herda C no idle e na volta, B no miolo do ataque, v3 no feliz. 0 cores fora da paleta do pacote [E] |
| **Animação** | Estabilidade 5,5 · legibilidade 6,5 (QA F2). Feliz v3 **8,0** e ataque como preparação 7,0 (QA F3) | Estabilidade 7,5 · legibilidade 7 (QA F2) | Idle S **7,5** · idle E 7,0 · feliz 6,0 · preparo 5,5 → **6,5** (QA F3) | **Não avaliado.** Componentes: idle 7,5 (C) · miolo do ataque B (7,25 média) · feliz 8,0 (v3, antes do polimento). Emenda medida (§3); em movimento, NÃO VALIDADO |
| **Consistência anatômica** | Limpeza 5,5 (QA F2). Peças aparecem e somem entre quadros | Limpeza 7 (QA F2). Peças corrigidas; o que é desenho (ataques do Gomamon, cauda do Ikkakumon) fica | Máxima no que o rig cobre (mesmas peças); braço girado/espelhado com luz errada (P2) | Crânio 16 px em 25/25 quadros; sola 45 fixa; nenhum braço girado ou espelhado [E]. Salto de traço na emenda (§3) |
| **Tempo** | Fila de 2–4 min por chamada + iterações (o Agumon passou por v5, v6 e v7) [L] | ~14 min de agente para 3 espécies (F2) + ~8 min (F2b) [L] | ~8 min de agente para 4 animações [L] | ~10 min de agente para montar e medir (11:16–11:26) + ~10 min de página e relatório [E] |
| **Gerações** | ≈ 18 por espécie no padrão 1.0 (11 base + 3 andar + 3 ataque + 1 emoção); o Agumon real custou **23** [L] | **0** sobre A | **0** sobre A (precisa da rotação de A) | **0** sobre A. Reaproveita o ataque e o feliz v3 já pagos; o idle sai do rig em vez de 3 gerações de v3 |
| **Facilidade de repetir em outra espécie** | Alta na mecânica (mesmas chamadas), baixa na previsibilidade: QA "antes" de 5,4 (Gomamon) a 7,25 (Ikkakumon) | Média. A biblioteca (`f2lib`: sola, trava de oscilação, unificação) se reaproveita; o diagnóstico de cada defeito é por espécie. Teto prático ~7,5 sem gerar de novo (QA F2) | Média-baixa. Motor ~80% reaproveitável; recorte manual de 5–10 min por direção; quadrúpede só no idle, não no andar [L, F3 §7] | Média. Precisa de A e C da mesma espécie; o script mede os deslocamentos sozinho para a âncora, mas a escolha dos quadros do miolo e da antecipação é manual (~5 min) |
| **Média QA (Agumon)** | **5,75** | **7,25** | **6,5** | **— (pendente)** |

**Leitura:** nenhum método passa da régua GS-010 (média ≥ 9, nenhuma categoria < 8) nem da régua mínima 8. O B é a maior subida por custo (+1,5 de média com 0 gerações). O C só vence em idle. O D junta a melhor parte de cada um (idle do C, ataque do B, emoção do v3), mas ainda precisa provar em movimento que a emenda não pesa.

## 5. Paleta e escala (conflitos abertos, só medidos)

- **Endesga-32 [E]:** 0,0% dos pixels iguais exatos e 0,1–0,2% a ≤ 6 RGB, nas três animações do D. Contra a referência v13/v15: toda cor do D já existe no pacote F2 do Agumon (aprovado para teste). **O conflito continua aberto (Etapa 6); o D não o resolve.**
- **Cores por animação [E]:** idle 59, ataque 98, feliz 73. O ataque tem quase o dobro porque junta duas famílias de traço (rotação e v3). Não é cor fora do pacote, mas pesa na nota do `pixelart_workbench score` (não rodei; custo 0, mas fora do escopo).
- **Escala (G-2) [E]:** Agumon com 35 px de altura (y 11–45) no canvas 64; razão para o tile de 32 ≈ 1,09. É a mesma peça do pacote F2: nada foi reescalado. Tamer e Champion não fazem parte desta entrega.

## 6. O que não foi feito

- **QA independente do D:** não existe. As notas de D na tabela estão em branco de propósito.
- **Ver em movimento:** página e GIF não foram abertos em navegador (§3). Precisa ser feito pelo QA, de preferência a 1× sobre o fundo do mapa.
- **Direções E, N e W do híbrido:** só S, como o brief pede.
- **F2b sem nova checagem do QA:** as correções F2-1 a F2-4 (inclusive o ataque S usado no D) foram feitas depois do QA da F2 e não foram revalidadas.
- **Integração no jogo e nos Links:** proibida pelo brief. Nada foi tocado no jogo.
- **Originais:** `fase9-pixellab-d12/`, `f2/` e `f3/` não foram alterados (`find -newer BRIEF_F4` não aponta arquivo em `fase9` nem em `f2`). Uma ressalva: o meu `import rig_s` criou um `__pycache__` em `f3/rig_agumon/`; movi para `workspaces/game-art/tmp/f4/trash_f3_pycache` e o script agora desliga o bytecode. Só a data da pasta `f3/rig_agumon/` mudou; nenhum arquivo dela foi alterado.
- **Arte de terceiros:** nenhum pixel de folha oficial ou de fã entrou no D. As fontes são o pacote F2 (PixelLab), o rig (pixels do mesmo pacote) e o v3 custom (PixelLab).

## 7. Para o game-dev (não feito; só quando houver OK)

- Canvas 64×64, âncora na sola, y=45, x≈32 (centro do corpo). As três animações usam a mesma âncora, então a troca idle ↔ ataque ↔ feliz não precisa de ajuste.
- Os tempos estão em `delays_ms.txt` (variáveis por quadro). O idle é loop; o ataque e o feliz são de uma vez só e terminam no neutro do idle.
- O canvas do D (64) é diferente do andar (48) e do ataque F2b (60). Se o jogo ancora pelo pé, não há problema; se ancora pelo centro do quadro, é preciso compensar.

## 8. Decisões do fundador

1. Adotar o D (híbrido) como base do Sprite Production Standard 1.1 (ver proposta).
2. Aceitar a emenda como está ou pagar ~10–15 min de pixel à mão por espécie para um quadro intermediário de saída.
3. As decisões já abertas pelo QA da F3: giro/espelho no rig e "paleta do sprite" = paleta da direção ou do pacote. O D não depende delas (só usa translação), mas o Standard 1.1 precisa da resposta.
4. Os conflitos da Etapa 6 (Endesga-32 × v13/v15, escala Tamer/Digimon) continuam abertos.
