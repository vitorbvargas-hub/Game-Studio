# RELATÓRIO F7: híbrido ampliado do Agumon (Comando 12 do fundador)

**Digital Odyssey (GS-003) · game-art (Fable 5.2) · 2026-11-14, 21:00–21:20 (retomada) · PixelLab: 0 gerações · Retro Diffusion: não usado · custo: R$ 0**
Brief: `etapa6-lab/BRIEF_COMANDO_13_F7.md` + ADENDO. Comando oficial: `etapa6-lab/COMANDO_FUNDADOR_12_F7.md` (prevalece).
Legenda: **[E]** medido ou feito nesta entrega · **[L]** lido de relatório ou QA anterior, não refeito · **[H]** hipótese ou opinião minha.
Fangame independente, não oficial e não licenciado. Camada de licença de tudo aqui: `private-prototype`. **Nada foi integrado ao jogo.**

## 0. Resumo

- Entreguei `pacote_agumon_f7/` com rotações, caminhada, idle e ataque nas 4 direções, o fogo do ataque em camada separada (`attack_fx/`) e a emoção feliz (só S, que é o que existe).
- A identidade é a do F2b: as 4 rotações são os pixels do F2b sem alteração, e a cabeça da caminhada é **idêntica à da pose parada em 8 de 8 quadros nas 4 direções** [E].
- Tudo está num canvas único de 60×60 com uma âncora só (antes eram três canvas: 48, 56 e 60).
- **Limite importante:** eu avaliei quadro a quadro, em folhas a 4×–12×. Não assisti aos GIFs em movimento (não tenho como tocar animação aqui). Toda afirmação sobre fluidez é [H] até o game-qa tocar os arquivos.
- Autoavaliação média: **7,9** nos cinco critérios visuais (§7). Não afirmo que a meta de 8 foi atingida: a caminhada S/N é o ponto mais fraco e pode puxar a nota para baixo.

## 1. Inventário e segurança (Comando 12 §1)

| Método | Caminho | Versão / evidência | Estado |
|---|---|---|---|
| PixelLab Método A (original) | `fase9-pixellab-d12/_backup_agumon_v7_full_0745/` e `metodo-a-v2/` | personagem PixelLab `4afbc5c8-198b-48ce-948d-f87fce747e96` (id no `pacote.json` do F2b) [L] | não aberto nem alterado |
| F2b, polimento gratuito | `fase12-comando9/f2/pacote_agumon_f2/` | backup em `fase13-comando10/backup_f2b/`; `diff -rq` entre os dois = idênticos [E] | só leitura |
| C10, caminhada lateral | `fase13-comando10/pacote_agumon_c10/` + `QA_C10_INDEPENDENTE.md` (8,0) [L] | só leitura |
| F3, rig 2D | `fase12-comando9/f3/` (`rig_agumon/`, `anim_idle_S`, `anim_idle_E`) | só leitura (importei `rig_s.py` e `rig_e.py` como módulo, sem gravar nada lá) |
| F4, híbrido anterior (S) | `fase12-comando9/f4/hibrido_agumon_S/` + saída q8 em `fase13-comando10/hibrido_agumon_S_c10/ataque_A_saida_q8/` | só leitura |
| F5, Retro Diffusion | `fase15-f5-retro-diffusion/` (`RELATORIO_F5.md`, `teste/`) | **não usado** nesta entrega, nem como referência de pixel |
| F6, Blender | `fase16-f6-blender/` (`pacote_agumon_f6/`, `QA_F6_INDEPENDENTE.md` 6,3 [L]) | só leitura; usado como gabarito de pose. Não renderizei pose nova |

- [E] `find etapa6-lab -newermt "2026-11-14 21:00"` fora de `fase17-f7-hibrido/` devolve só 4 arquivos de comando/brief na raiz do laboratório, que não são meus (coordenação). Nenhum pacote, script ou asset antigo mudou.
- [E] Saldo PixelLab conferido às 21:17: **573,95 gerações**, o mesmo valor registrado no relatório da F2. Nenhuma ferramenta de geração foi chamada.
- Não toquei no jogo, no worktree `qo`, no `kb-gs003` nem em assets aprovados.

## 2. DIGIMON-REFERENCE-REPORT (protocolo GS-003-DIGIMON-REFERENCE-GATE)

1. **Espécie e forma:** `sp.agumon` · Agumon · Child/Rookie · sem variante (não é a versão 2006 nem X-Antibody).
2. **Fontes consultadas:** `fase11-fichas-anatomia/FICHA_AGUMON.md` (game-research, 2026-11-14; cita Wikimon e a folha de modelo do anime, status secundário) [L]. **Não abri a ficha da knowledge-base** (`digimondex/species/agumon.json`): ela está na branch `feat/gs003-knowledge-base`, que não está neste checkout. Fica registrado como pendência, não como estudo concluído.
3. **Referências visuais:** não abri as REF-01..05 nesta entrega. A base visual é o F2b, que já passou pelo QA F2 contra a ficha [L].
4. **Características obrigatórias (ficha §9):** bípede; corpo laranja único; barriga só um pouco mais clara; olhos verdes; garras brancas; cauda curta e grossa; costas lisas com nuca escura e mancha na base da cauda; cabeça do mesmo tamanho nas 4 direções; sem crista, listra ou acessório.
5. **Divergências:** (a) a ficha pede 3 garras por mão; o sprite mostra 2 nesta escala (herdado do F2b). (b) a rotação lateral do F2b tem a barriga em amarelo claro `#fbe598`, mais clara que no S; a ficha proíbe barriga branca, e isto é amarelo claro, mas fica no limite. Não alterei porque a decisão do revisor foi manter a pose lateral do F2b.
6. **Direção de arte:** nenhuma nova. Só recombinação e redesenho de membros com as cores que o pacote F2b já tem.
7. **Animações:** walk, idle e ataque em S/N/E/W; feliz em S.
8. **Riscos:** IP (fangame sem licença, sem publicação); paleta e escala continuam **abertas** (§6); fluidez não vista em movimento por mim.
9. **Critérios de homologação:** os 8 do Comando 12 §5, pelo game-qa, tocando os GIFs e os PNG-fonte.

## 3. O que veio de cada método

| Parte do F7 | Fonte | O que eu fiz |
|---|---|---|
| Rotações S/N/E/W | **F2b** | nenhum pixel alterado; só passaram do canvas 48 para o 60, em (+6,+5) |
| Walk E/W: cabeça, tronco, barriga, cauda | **F2b** (rotação E) | pixels da pose parada, com sobe-e-desce de 1 px |
| Walk E/W: pernas | **C10** (técnica do pé plantado) | passada reduzida de 16 para **12 px** (3 px por quadro, igual ao F6), para as pernas não se projetarem tanto |
| Walk E/W: braço | redesenho à mão | 5 poses; a do meio é o braço original do F2b. Contorno aberto no ombro (o "laço fechado" do C10 saiu) |
| Walk E/W: cauda | **F3** (corte base/ponta) | a ponta atrasa 1 quadro em relação ao corpo |
| Walk S/N | **F3** (rig por partes) com pose do **F6** | peças recortadas das rotações S e N do F2b; cada perna sobe 1-2-3-1 px, braços em oposição, cabeça 0,+1,0,−1 |
| Idle S | **F3/F4** | cópia dos quadros |
| Idle E/W | **F3** | cópia (respira, pisca, cauda); W = espelho |
| Idle N | rig novo sobre a rotação N | só respiração (de costas não há olho nem cauda para mexer) |
| Ataque S | **F4 + C10A** | antecipação do rig (q0–q2), corpo PixelLab polido (F2b q4–q7), saída pelo q8, neutro do rig. **O fogo foi retirado do corpo** |
| Ataque E/W | **F2b** | q0 = pose parada; q1–q7 = F2b com o fogo retirado e subidos 1 px (âncora); q8 = pose parada de olho fechado (rig F3) |
| Ataque N | **F2b** | q0 e q8 = pose parada; q1–q7 = F2b com o fogo retirado |
| Fogo (`attack_fx/`) | desenho próprio | bola de fogo com cauda e faíscas, feita por código (`attack_f7.py`), com as cores de fogo que o F2b já tinha. Nasce na boca nas 4 direções |
| Feliz S | **PixelLab v3 custom polido (F4)** | cópia sem alteração de pixel. Não foi trocado por rig |
| Do **F6** | só a pose | ritmo contato/descida/passagem/subida e os 3 px por quadro. Rosto, sombreado, garras em bloco e cauda do F6 **não** entraram |
| Do **F5** | nada | — |

## 4. Entregas

| Item | Caminho |
|---|---|
| Pacote | `fase17-f7-hibrido/pacote_agumon_f7/` (142 PNG + `pacote.json`): `rotations/`, `walk/{S,N,E,W}` (8), `idle/{S,N,E,W}` (6), `attack/{S,N,E,W}` (9), `attack_fx/{S,N,E,W}` (9), `feliz/S` (10) |
| Âncora e tempos | `pacote_agumon_f7/pacote.json`: âncora no ponto (29,5 ; 49), delays por animação, ordem da camada de fogo, origem da boca, quadro do disparo |
| Comparação | `fase17-f7-hibrido/comparacao/` (44 arquivos, lista abaixo) |
| Métricas | `fase17-f7-hibrido/metricas_f7.json` |
| Scripts | `fase17-f7-hibrido/scripts/` (`walk_e_f7.py`, `rig_f7.py`, `attack_f7.py`, `build_f7.py`, `metricas_f7.py`, `comparacao_f7.py`) |
| Integridade | `fase17-f7-hibrido/sha256.txt` |
| Progresso | `fase17-f7-hibrido/PROGRESS.md` |

**Comparação (A = F2b, B = C10, C = F4, D = F7, mais o F6 como referência de movimento):**
- `rotacoes_ABCD_{1x,4x}.png`
- `walk_ABCD_SNEW_{1x,4x}.gif`, `attack_ABCD_SNEW_{1x,4x}.gif` (110 ms em todos os métodos)
- `idle_ABCD_SNEW_{1x,4x}.gif`, `feliz_ABCD_S_{1x,4x}.gif` (tempos do pacote, iguais para C e D)
- `attack_S_tempos_proprios_CD_{1x,4x}.gif` (C e D com a mesma lista de tempos)
- `folha_{walk,attack,idle}_{S,N,E,W}_{1x,4x}.png` e `folha_feliz_S_{1x,4x}.png` (quadro a quadro)
- `F7_attack_fx_camada_{1x,4x}.png` (só o fogo)
- `F7_ciclo_idle_walk_ataque_idle_SNEW_{1x,4x}.gif` (59 quadros, 5,48 s)
- `walk_E_pista_ABD_F6_{1x,3x}.gif` (caminhada com deslocamento real, marcas no chão a cada 8 px)

Onde um método não tem a animação, a célula aparece como **N/A**. O C (F4) só existe na direção S e não tem caminhada; A e B não têm idle nem emoção; o F6 não tem idle nem emoção. Não dei nota a nenhuma dessas células.

## 5. Métricas [E] (`scripts/metricas_f7.py`, as mesmas contas para todos)

### 5.1 Caminhada

| Medida | A F2b | B C10 | F6 | **D F7** |
|---|---|---|---|---|
| Cabeça igual ao q0, S / N / E | 8/8 · 1/8 · 1/8 | 8/8 · 1/8 · 8/8 | 8/8 · 8/8 · 8/8 | **8/8 · 8/8 · 8/8** |
| Cabeça da pose parada × walk q0 (px diferentes), S / N / E | 103 · 29 · 23 | 103 · 29 · 0 | 38 · 34 · 42 | **0 · 0 · 0** |
| Linha mais baixa (âncora), S / N / E | 49–50 · 48 · 49–50 | 49–50 · 48 · 49 | 49–51 · 47–49 · 46–49 | **49 · 48 · 49** (fixa) |
| Amplitude do topo, S / N / E | 3 · 1 · 2 | 3 · 1 · 2 | 2 · 2 · 2 | 2 · 2 · 2 (ritmo 0,+1,0,−1) |
| Oscilação do centróide y, S / N / E | 2,0 · 0,78 · 1,56 | 2,0 · 0,78 · 1,54 | 0,83 · 1,15 · 1,86 | 1,18 · 0,96 · 1,40 |
| Cores no ciclo, S / N / E | 55 · 37 · 39 | 55 · 37 · 24 | 11 · 8 · 12 | 59 · 36 · 31 |
| Componentes por quadro / pixels soltos | 1 / 0 | 1 / 0 | 1 / 0 | 1 / 0 |
| Semitransparentes / pixels na borda | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| W = espelho de E | 0 px | 0 px | 0 px | 0 px |

- **Pé plantado (walk E):** o pé de apoio do F7 fica em x = 35, 32, 29, 26, 23 nos cinco quadros de apoio, ou seja, **3 px por quadro exatos** por construção. A minha conta automática de deriva (centro do trecho de contato, que muda de forma entre calcanhar, pé chato e ponta) dá média 0,75 px e máximo 1,5 px a 3 px por quadro. No C10, a mesma conta dá 0,88 e 2,0 a 4 px por quadro. No F2b ela só achou 1 par de quadros com contato reconhecível, então **não comparo o F2b por esse número**.
- **Braço (walk E):** o x médio das garras da mão de perto vai de **28 a 33 (5 px)**. No C10, de 36 a 38,3 (2,3 px) pela mesma conta.
- **Velocidade:** 3 px por quadro a 110 ms = 27 px/s. Se o jogo andar a outra velocidade, o ajuste é no delay (`3000 / velocidade`), não no desenho. **Não validado no jogo.**

### 5.2 Ataque

| Medida | A/B (F2b) | C (F4) / C10A, só S | **D F7** |
|---|---|---|---|
| Linha mais baixa, S / N / E | 50–52 · 49–50 · 50 | 49–51 | **49 · 48 · 49** (igual à caminhada) |
| Componentes máx. por quadro (corpo) | 2 · 4 · 4 | 2 | **1 · 1 · 1** (fogo e faíscas saíram do corpo) |
| Pose parada × q0 (px), S / N / E | 484 · 344 · 363 | 0 | **0 · 0 · 0** |
| Último quadro × pose parada (px), S / N / E | 468 · 335 · 361 | 0 | **0 · 0 · 17** |
| Maior corte entre quadros, S / N / E | 406 · 390 · 419 | 604 | 494 · 372 · 414 |
| Pixels na borda do canvas | 0 | 0 | 0 (o F6 tinha 9 no ataque E) |

- Cortes do ataque S no F7: `390 141 494 118 95 187 393 354 0`. O salto de 494 px é a passagem do rig para o quadro PixelLab (q2→q3); no C10A era 604, porque o fogo entrava junto.
- **Fogo (`attack_fx`), pixels por quadro:** S `0 0 13 57 113 185 12 0 0` · E/W `0 0 21 37 67 26 4 1 0` · N `0 0 0 89 62 31 5 0 0`. 6 cores, todas já presentes no F2b; 0 px na borda; 0 semitransparentes.
- Fogo retirado do corpo: S 170 + 49 + 5 px; E 48, 79, 68, 38, 20 e 9 px; N 67, 122, 88 e 12 px.

### 5.3 Transições do F7 (px que mudam de um quadro para o outro)

| Transição | S | N | E/W |
|---|---|---|---|
| Idle q0 × pose parada | 0 | 0 | 0 |
| Pose parada → walk q0 (corpo todo) | 86 | 61 | 207 |
| Pose parada → walk q0 (só a cabeça) | 0 | 0 | 0 |
| Pose parada → ataque q0 | 0 | 0 | 0 |
| Ataque q8 → pose parada | 0 | 0 | 17 |
| Pose parada → feliz q0 / feliz q9 → pose parada | 1 / 1 | — | — |

### 5.4 Paleta e escala (conflitos abertos: medidos, não decididos)

- Cores fora da paleta do pacote F2b: **0** em todas as animações e no fogo. O pacote F7 inteiro tem 154 cores; o pacote F2b (rotações + walk + attack, com o fogo no corpo) tem 254. Não reduzi a paleta.
- Contra a prancha **Endesga-32** (`paletas/P-i_endesga32.png`): 0 cores exatas; distância RGB mínima 2,2, mediana 31,8, máxima 75,5.
- Contra a prancha **v15b** (`paletas/P-ii_v15b_real.png`): 0 cores exatas; distância mínima 1,4, mediana 52,3, máxima 165,1.
- O F7 **não está conforme com nenhuma das duas**. A decisão é da Etapa 6.
- **Escala (G-2):** Rookie Agumon com 35 px de altura em S, 39 em N e 41 em E/W; largura 22 (S/N) e 36 (E/W). Razão para o tile de 32: 1,09 (S) a 1,28 (E). Igual ao F2b. Tamer e Champion não fazem parte desta entrega e não foram medidos.

## 6. Tempo e custo

| Etapa | Horário real | Duração |
|---|---|---|
| 1ª execução: leitura das fontes (caiu por limite) | 18:47–~18:48 registrado | não medido com precisão |
| Retomada: brief, comando, inventário, folhas de visão geral | 21:00–21:02 | ~2 min |
| Walk E/W (redesenho + 2 revisões visuais) | 21:02–21:06 | ~4 min |
| Walk S/N (rig) | 21:06–21:08 | ~2 min |
| Ataque nas 4 direções + camada de fogo (3 revisões) | 21:08–21:12 | ~4 min |
| Idle, feliz, rotações, `pacote.json` | 21:12–21:13 | ~1 min |
| Métricas + 4 correções | 21:13–21:14 | ~1 min |
| Comparação (44 arquivos) + 2ª passada na walk S/N e no ataque N | 21:14–21:18 | ~4 min |
| Relatório | 21:18–21:20 | ~2 min |
| **Total da retomada** | 21:00–21:20 | **~20 min** de agente |

- Custo: 0 gerações PixelLab, 0 créditos, 0 serviço pago.
- **[H] Custo por espécie:** para uma espécie bípede que já tenha um pacote no nível do F2b (rotações limpas + ataque PixelLab), repetir este processo deve levar de 20 a 60 min de agente, porque os scripts existem mas os recortes das peças, as poses do braço e as máscaras de fogo são por espécie. Para quadrúpedes, voadores ou espécies sem pacote F2b, não tenho base para estimar.

## 7. Autoavaliação nos 6 critérios [H]

Régua: a dos QAs anteriores (referência aprovada + ficha, leitura a 1× e 4×), com a paleta fora da nota. **É opinião de quem produziu, feita sem ver a animação tocando.** Não vale como homologação.

| Critério | Nota | Por quê |
|---|---|---|
| 1. Fidelidade ao Agumon | **8,0** | Rosto, proporção e cores são os do F2b sem alteração. Desconta as 2 garras por mão e a barriga lateral muito clara (ambas herdadas) |
| 2. Qualidade GBA Plus | **8,0** | Contorno e sombreado do F2b em todo o corpo; 0 pixel solto, 0 semitransparente. Desconta as pernas laterais, que têm só um tom de sombra |
| 3. Fluidez de animação | **7,5** | Walk E com pé plantado, braço de 5 px e cauda com atraso. Walk S/N é de rig: pernas sobem sem dobrar o joelho e os braços mexem 1 px. No ataque N o corpo fica igual por 3 quadros |
| 4. Consistência anatômica | **8,5** | Cabeça 8/8 nas 4 direções, âncora fixa, canvas único, ataque e caminhada na mesma linha de chão |
| 5. Legibilidade no jogo | **7,5** | A 1× a caminhada lateral lê bem nas folhas. O fogo é pequeno em E/W (67 px no pico) e em N. Sem teste sobre mapa real |
| 6. Custo e tempo | **9,5** | 0 gerações, ~20 min, reprodutível por script |
| **Média dos 5 visuais (1–5)** | **7,9** | |

Sobre os critérios 7 e 8 do QA: transições medidas no §5.3 (entrada e saída de idle e ataque com 0 a 17 px; a caminhada troca só pernas e braço). Regressões no §8.

## 8. Regressões e pontos fracos

| ID | Sev. [H] | O que é |
|---|---|---|
| F7-R1 | P2 | **Formato mudou:** tudo em 60×60 (antes rotações 48, N 56). O game-dev precisa trocar a âncora para (29,5 ; 49). É melhoria, mas quebra quem carrega pelo formato antigo |
| F7-R2 | P2 | **Walk S/N trocou os quadros PixelLab por rig.** Ganhou rosto idêntico ao parado e âncora fixa; perdeu a perna dobrando e o balanço largo de braço do F2b. Pode ler como "marcha no lugar" |
| F7-R3 | P2 | **O corpo do ataque não tem mais fogo.** Se o jogo tocar `attack/` sem `attack_fx/`, o Agumon ataca sem fogo |
| F7-R4 | P3 | Ataque N: corpo idêntico em q4–q6 (só o fogo se move); o recuo é de 1 px em q3 |
| F7-R5 | P3 | Fogo menor que o do F2b em E (67 × ~79 px no pico) e em N (89 × ~122). Fica dentro do canvas; o projétil depois disso é do jogo |
| F7-R6 | P3 | Ataque S continua com duas famílias de traço (rig em q0–q2 e q8, PixelLab em q3–q7). Herdado do C10A; mantive porque o Comando 12 manda preservar os quadros PixelLab |
| F7-R7 | P3 | Ataque E/W: q7→q8 muda 390 px (boca aberta do F2b → pose parada de olho fechado). O q1 ainda é desenho do F2b (parada→q1: 308 px) |
| F7-R8 | P3 | Walk E: passada de 12 px (era 16 no C10). Mais lenta por ciclo; o delay precisa ser ajustado à velocidade do jogo |
| F7-R9 | P3 | Walk E: a ponta da cauda faz um degrau de 1 px na coluna 18/19 quando atrasa |
| F7-R10 | P3 | Feliz só em S. Idle N sem piscar e sem cauda |
| F7-R11 | P3 | 2 garras por mão (a ficha pede 3) e barriga lateral `#fbe598`: herdados do F2b, não corrigidos |
| F7-R12 | — | Paleta com 154 cores, fora do Endesga-32 e do v15b: conflito aberto da Etapa 6, não é regressão do F7 |

Regressões antigas que o F7 **resolve** [E]: C10-R1 (ataque lateral com âncora 1 px abaixo: agora 49 em tudo); C10-R2 (pose parada lateral: voltou a do F2b e a caminhada parte dela); C10-R3 (braço em laço fechado); amplitude do braço (2,3 → 5 px); cauda rígida; fogo do ataque S no peito (agora nasce na boca); fogo do F6 cortado na borda (não se aplica: 0 px na borda).

## 9. Não feito

- Não integrei, não abri o jogo, não fiz build nem deploy.
- Não assisti às animações em movimento; não testei sobre mapa real nem na velocidade real.
- Não fiz diagonais, nem feliz em N/E/W, nem emoções novas.
- Não renderizei pose nova no Blender; usei as do pacote F6 existente.
- Não abri a ficha da knowledge-base nem as REF-01..05 (§2).
- Não resolvi paleta nem escala.
- Não iniciei o Hawkmon.

## 10. Decisões que dependem do fundador

1. Aceitar a caminhada S/N por rig (F7-R2) ou manter a do F2b nessas duas direções. As duas estão lado a lado em `comparacao/walk_ABCD_SNEW_4x.gif`.
2. Aceitar o canvas único de 60×60 e a âncora (29,5 ; 49) como formato do padrão.
3. Tamanho do fogo: manter dentro do canvas (como está) ou deixar o jogo desenhar o projétil.
4. Paleta e escala: continuam abertas para a Etapa 6.

Próximos passos previstos pelo comando: game-qa (independente) → revisão do ChatGPT → build isolado para o Vitor testar. Eu paro aqui.
