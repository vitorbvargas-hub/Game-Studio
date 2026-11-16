# QA INDEPENDENTE: F7, híbrido ampliado do Agumon (Comando 12)

**Digital Odyssey (GS-003) · game-qa (Opus 5.5) · 2026-11-14, ~21:20–21:40 · custo PixelLab: 0** (nenhuma ferramenta de geração chamada)
Objeto: `fase17-f7-hibrido/` (`RELATORIO_F7.md`, `metricas_f7.json`, `sha256.txt`, `pacote_agumon_f7/`, `comparacao/`, `scripts/`), contra o comando oficial `etapa6-lab/COMANDO_FUNDADOR_12_F7.md` (§5, 8 critérios), `fase11-fichas-anatomia/FICHA_AGUMON.md` e os meus QAs anteriores (F2, F3, F4, C10, F6).
Legenda: **[E]** executado nesta auditoria · **[L]** de relatório ou QA anterior, não reverificado · **[H]** hipótese ou julgamento · **NÃO VALIDADO**, com o motivo.
Fangame independente, não oficial e não licenciado. **Nada fora deste arquivo foi alterado** na pasta da F7 nem no laboratório. Não gerei, não integrei, não publiquei.
Scripts do QA (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_f7/` (`met_f7.py`, `extra_f7.py`, `sheet_f7.py`, `mkpage_f7.py`, `cap.mjs`). Saídas: `workspaces/game-qa/tmp/qa_f7/` (`met.json`, `view.html`, `cap/`, `repro/`) e `workspaces/game-qa/tmp_view/f7q/` (folhas a 1×, 5×, 6× e 10×).

## 0. Veredito

| | 8 critérios do Comando 12 §5 (média simples) | 6 ponderados do Comando 11 §5 | Autoavaliação game-art | Meta 8 / 8,5 | GS-010 |
|---|---|---|---|---|---|
| **F7 (Agumon, 4 direções)** | **7,7** | **7,7** | 7,9 (5 visuais) | **não atinge** (falta ~0,3) | não atinge |

- **A F7 é a melhor versão do Agumon até agora** [E/H]: média ponderada 7,7 contra 7,25 do B (F2b + C10), 7,08 do D (F4, só S) e 6,3 do F6. É a primeira com **as 4 direções, idle, ataque e transições num formato único e coerente**.
- **Não chega à meta de 8.** Três coisas a seguram: a caminhada S/N por rig (marcha no lugar, sem dobra de joelho); o ataque S com duas famílias de traço e um resíduo de fogo no corpo (achado novo, §5); e a legibilidade, que não pode ser medida sem mapa real.
- **Tudo o que o relatório mede confere** [E], com uma correção: no ataque N o corpo fica parado em **4** quadros (q4–q7), não em 3 (§2).
- **Reprodução:** rodei o `build_f7.py` numa cópia dos scripts e o pacote saiu **idêntico byte a byte** (142 PNG + `pacote.json`) em 0,4 s. Nada foi escrito fora da minha pasta temporária.
- **Recomendação:** adotar a F7 como **versão candidata** e enviá-la ao ChatGPT **com este QA**, deixando claro que a nota é 7,7. Caminhada S/N: **ficar com o rig (F7)**, não voltar ao F2b. Detalhes no §7.

## 1. Build testado e método [E]

- Pasta não versionada (`git status`: `?? fase17-f7-hibrido/`); HEAD do repositório `f02fbab`. `sha256sum -c sha256.txt`: **188/188 OK**.
- Os arquivos do pacote têm data de 21:16:08–21:16:09 e o último arquivo da pasta é de 21:20:13. **Bate com os ~20 min** declarados de retomada (a pasta tem um `.t0` de 18:47, da 1ª execução).
- Fora da F7, só 4 arquivos de comando ou brief na raiz do laboratório são mais novos que 21:00 (coordenação). **Nenhum pacote antigo foi alterado.**
- **Medidas próprias** (`met_f7.py`, `extra_f7.py`, sem PIL nem numpy): canvas, bbox, linha do chão, semitransparência, borda, componentes 8-conexos, pixel isolado, cabeça (14 linhas do topo) contra a rotação, cortes entre quadros, espelho W/E, cores fora da paleta do F2b, Endesga-32 e v15b, sobreposição fogo × corpo, registro do idle e do feliz contra o F4, pé de apoio em coordenada de mundo e cortes nas emendas do ciclo.
- **Visual:** folhas quadro a quadro a 1×, 5× e 6× com guia na âncora (y = 49; x = 29/30) e zoom de 10× no ataque S e N, com e sem a camada de fogo. Também olhei as 44 peças de `comparacao/`.
- **Em movimento:** página própria (`tmp/qa_f7/view.html`, montada a partir dos PNG-fonte **e dos delays do `pacote.json`**) no **Chromium headless-shell 1243**. Toquei: walk, idle e ataque (com a camada `attack_fx` sobreposta, atrás do corpo no N) nas 4 direções, a 1× e a 4×; ataque S sem fogo; feliz S; idle → feliz → idle; o ciclo **idle → walk (2 voltas) → ataque → idle** nas 4 direções, a 1× e a 3×; e uma pista com a walk E avançando 3 px por quadro. **0 erros de console, 0 exceções**; a única requisição foi o próprio `file://`. Foram 30 capturas tocando e 74 quadro a quadro (fundo verde e cinza).
- **Tempo medido por rAF** (`cap/trace.json`): walk 100–117 ms (alvo 110); idle S 134–267 ms (alvo 140–260); ataque S 117–200 ms (alvo 120–200); feliz 83–233 ms (alvo 90–220). O desvio é de ±17 ms, o quantum de 60 Hz.
- **Limites:** headless sem GPU, então o tempo é indicativo. Sem fundo de mapa real e sem a velocidade de deslocamento do jogo. Dos GIFs entregues, conferi a estrutura (quadros, delays, loop), mas toquei os PNG-fonte, não os GIFs.

## 2. Conferência das métricas do game-art [E]

| Medida | Relatório | QA | Confere? |
|---|---|---|---|
| Canvas | 60×60 em tudo | 60×60 nas 142 imagens | sim |
| Rotações = F2b deslocado (+6,+5) | sem alteração de pixel | **0 px** de diferença nas 4 direções (F2b 48×48) | sim |
| Linha do chão walk/ataque S/N/E | 49 / 48 / 49, fixa | 49 / 48 / 49 em todos os quadros de walk, idle e ataque | sim |
| Cabeça da walk × rotação | 0 px em 8/8, nas 4 direções | 0 px em 8/8 (S, N, E; W = espelho) | sim |
| Oscilação do centróide walk S/N/E | 1,18 / 0,96 / 1,40 | 1,18 / 0,96 / 1,40 | sim |
| Topo da walk | 0, +1, 0, −1 | S 15-16-15-14, N 10-11-10-9, E 9-10-9-8 | sim |
| Cores do ciclo walk S/N/E | 59 / 36 / 31 | 59 / 36 / 31 | sim |
| Componentes, semitransparentes, borda | 1 / 0 / 0 | 1 componente em todos os quadros de corpo; 0; 0 | sim |
| W = espelho de E | 0 px | 0 px em walk, idle, ataque e fogo | sim |
| Cortes do ataque S | 390 141 494 118 95 187 393 354 0 | idênticos | sim |
| Fogo, px por quadro (S / E / N) | 0 0 13 57 113 185 12 0 0 / 0 0 21 37 67 26 4 1 0 / 0 0 0 89 62 31 5 0 0 | idênticos; 6 cores, todas da paleta F2b; 0 na borda | sim |
| Pose parada → ataque q0; ataque q8 → pose parada | 0 / 0 (S, N); 0 / 17 (E) | 0 / 0; 0 / 17 | sim |
| Pose parada → walk q0 (corpo) | 86 / 61 / 207 | 86 / 61 / 207 | sim |
| Pose parada → feliz q0; feliz q9 → pose parada | 1 / 1 | 1 / 1 | sim |
| Idle S e feliz S = F4 sem alteração | sim | **0 px** em 6/6 e 10/10, com o F4 (64×64) deslocado (−3,+4) | sim |
| Cores do pacote; fora da paleta F2b | 154; 0 | 154 (148 no corpo + 6 do fogo); 0 | sim |
| Endesga-32 / v15b | 0 exatas; dist. 2,2 / 31,8 / 75,5 e 1,4 / 52,3 / 165,1 | idênticas | sim |
| Pé de apoio walk E: 3 px por quadro | x 35, 32, 29, 26, 23 | **confirmado em coordenada de mundo**: o pé da frente fica com o calcanhar em x = 32 de q0 a q3, e o pé que pousa em q4 fica em 44 de q4 a q7. Na volta do loop, a ponta continua em 50. **Sem deslizar** | sim |
| Ataque N: corpo igual (F7-R4) | q4–q6 | **q4 = q5 = q6 = q7** (cortes 0, 0, 0): **4 quadros**, 520 ms com o corpo parado | **corrigir** |

**O que eu medi e o relatório não mede:**
- **Meia-volta da walk:** a diferença q_i × q_(i+4) é de 165–544 px (S), 122–471 (N) e 26–131 (E). As pernas alternam de verdade, não é um ciclo de 4 repetido. No E, q2 × q6 difere só 26 px (a passagem é quase igual dos dois lados, o que é normal).
- **Walk S/N, pés:** em toda a walk S há **sempre um pé levantado** (1, 2, 3 e 1 px), alternando a cada 4 quadros. Não há quadro de apoio duplo nem dobra de joelho: a perna sobe inteira (`extra_f7.py`, perfil das 8 linhas de baixo).
- **Walk S, mãos:** as garras ficam visíveis em 8/8 (4 px por mão), mas a mão sobe só 1–2 px em y e quase não anda em x. É o "braço de 1 px" que o relatório descreve.
- **Fogo × corpo:** no S o fogo cobre 13–163 px do corpo (q2–q5), porque vem para a câmera na frente do peito; no E/W cobre ≤ 7 px (sai da boca para fora); no N fica atrás.
- **Emendas do ciclo:** idle (último quadro) → walk q0: 107 px (S), 61 (N), 238 (E/W). Walk (último) → ataque q0: 431 / 321 / 373. Ataque q8 → idle q0: 0 / 0 / 17. Em todas, a cabeça só muda dentro do ataque.

## 3. Inspeção quadro a quadro (1×, 4×–10×) e em movimento [E, leitura H]

| Item | Status | Evidência e leitura |
|---|---|---|
| Canvas e âncora (29,5 ; 49) | **Funciona** | 60×60 em tudo. A rotação S vai de x 19 a 40 (centro 29,5); y 49 é o chão em S/E/W e 48 em N, por perspectiva, como o `pacote.json` documenta. Na página, todas as animações ficam presas à mesma linha, sem pulo vertical ao trocar de animação. **NÃO VALIDADO no jogo** |
| Rotações | **Funciona** | Pixels do F2b sem alteração. A identidade é a do F2b, já aprovada nos QAs F2/C10 [L] |
| Walk E/W | **Funciona** | O melhor ciclo lateral até agora. Pé plantado sem deslizar na pista, braço com balanço visível a 4×, ponta da cauda atrasada, cabeça idêntica à pose parada e bob de 1 px regular. A 1× lê como bípede andando. A perna de trás é marrom de um só tom, como o relatório admite |
| Walk S/N | **Parcial** | Em movimento a 4× lê como "**marcha no lugar**": os pés sobem e descem sem passada nem joelho, e os braços quase não mexem. A 1× é aceitável, no padrão de andar frontal de RPG portátil [H]. Vantagem real: o rosto não troca ao começar a andar (no F2b a cabeça da walk S diferia 103 px da rotação) e a âncora não oscila (no F2b ia de 49 a 50) |
| Idle S/E/W | **Funciona** | Respira, pisca, a cauda mexe (E/W), sem deformação. q0 = pose parada (0 px) |
| Idle N | **Parcial** | Só respiração (de costas não há olho nem cauda): q2 = q3 e q5 = q0, então lê quase parado. Aceitável para costas |
| Ataque E/W | **Funciona** | Antecipação (pisca em q1), fogo nasce na boca em q2 e sai para fora, boca aberta de q3 a q7, volta pela pose parada de olho fechado (que vira um "piscar" ao entrar no idle). O fogo é pequeno (67 px no pico), mas lê a 1× |
| Ataque S | **Parcial** | Antecipação do rig (q0–q2) → corpo PixelLab de boca aberta (q3–q6) → saída q7 → neutro. Com o fogo, lê como bola de fogo vindo para a câmera; a bola de q4–q5 cobre o peito e a boca. O corte de 494 px em q2→q3 é visível como troca de desenho (duas famílias de traço, F7-R6). **Achado novo:** resíduo do fogo antigo no corpo de q3 (F7-QA-1) |
| Ataque N | **Parcial** | O fogo sobe atrás da cabeça e lê como disparo para longe. O corpo, porém, fica **congelado por 4 quadros** (q4–q7, 520 ms) enquanto só o fogo anda |
| Ataque sem `attack_fx` | **Regressão potencial (F7-R3)** | Tocado à parte: o Agumon abre a boca sem fogo. Correto como camada, mas o jogo **precisa** desenhar as duas |
| Feliz S | **Funciona** | Cópia exata do PixelLab v3 polido (F4), sai e volta à pose parada com 1 px de diferença. Não foi trocado por rig, como o comando manda |
| Ciclo idle → walk → ataque → idle | **Funciona, com uma ressalva** | Sem salto de âncora em nenhuma direção. A entrada no ataque vinda do meio da walk troca 321–431 px num quadro (pernas e braços), o normal para corte de animação. A saída do ataque S/N para o idle é perfeita (0 px) |
| Artefatos | **Funciona** | 0 semitransparentes, 0 px na borda, 1 componente por quadro de corpo. O pixel isolado é alto no S (≈30%), mas é a textura do PixelLab e da referência aprovada, não ruído novo [L/E] |

### Fidelidade à ficha (`FICHA_AGUMON.md` §9)

| # | Checklist | F7 | Comentário |
|---|---|---|---|
| 1 | Cabeça igual nas 4 direções | **sim** | Herdada do F2b; a cabeça da walk agora é a mesma da rotação em 8/8 |
| 2 | N: zero listras; nuca escura e mancha na base da cauda | **parcial** | Há nuca e mancha. Os 3 riscos escuros no topo da cabeça (herdados do F2b) podem ser lidos como listras ou orelhas [H]. Não é regressão da F7 |
| 3 | S: barriga laranja clara, sem faixa | **sim** | — |
| 4 | E/W: focinho em cunha, 1 olho, cauda curta e grossa | **sim** | Barriga lateral `#fbe598`, mais clara (F7-R11, herdado) |
| 5 | Bípede, pés no chão, braços pendentes | **sim** | Pés na linha 49 em toda a walk e todo o ataque |
| 6 | 3 garras brancas | **parcial** | 2 por mão nesta escala (herdado). As garras não somem entre quadros (4 px por mão em 8/8 na walk S) |
| 7 | Sem acessório; cor única | **sim** | O fogo é camada separada, com cores do próprio F2b |
| — | Rosto: olhos verdes, sorriso e dentes | **sim** | Mesmo rosto do F2b em rotação, idle e walk. No ataque, o rosto é o desenho PixelLab (diferença de 39 a 147 px na cabeça), e no S isso aparece como troca de traço |

## 4. Regressões declaradas (F7-R1 a R12) [E]

| ID | Confere? | Leitura do QA |
|---|---|---|
| F7-R1 (formato 60×60, âncora nova) | **sim** | O F2b tem rotações em 48×48 e o F4 em 64×64. Quem carregar pelo formato antigo quebra. **P2 de integração**, não visual |
| F7-R2 (walk S/N por rig) | **sim** | Confirmado em movimento. Ganha rosto e âncora estáveis; perde a dobra de perna e o balanço de braço do F2b. **P2** |
| F7-R3 (ataque sem fogo no corpo) | **sim** | Tocado sem `attack_fx`: ataque mudo. **P2**, depende de o jogo desenhar a camada |
| F7-R4 (ataque N parado) | **sim, com correção** | São **4** quadros (q4–q7), não 3. P3 |
| F7-R5 (fogo pequeno em E e N) | sim | P3 |
| F7-R6 (duas famílias de traço no ataque S) | sim | Corte de 494 px em q2→q3; cabeça 127–147 px diferente em q3–q7. P3 |
| F7-R7 (E: q7→q8 390 px; parada→q1 308 px) | sim | Em movimento lê como "fecha a boca e pisca". P3 |
| F7-R8 (passada de 12 px) | sim | 24 px por ciclo, 27 px/s a 110 ms. P3, depende da velocidade do jogo |
| F7-R9 (degrau de 1 px na cauda) | **NÃO VALIDADO** | Não reverifiquei por pixel; não chamou atenção em movimento a 4× |
| F7-R10 (feliz só em S; idle N sem piscar) | sim | P3 |
| F7-R11 (2 garras; barriga lateral clara) | sim | Herdado do F2b. P3 |
| F7-R12 (paleta fora do Endesga-32 e do v15b) | sim | Conflito aberto da Etapa 6; fica fora da nota |

**Regressões antigas que o relatório diz ter resolvido** [E]: C10-R1 (âncora do ataque lateral: agora 49 em tudo), C10-R2 (a pose parada lateral volta a ser a do F2b, e a walk parte dela), C10-R3 (o braço em laço fechado sumiu), braço lateral com amplitude maior, cauda que mexe, fogo do ataque S nascendo na boca (q2, origem (30,29)), e 0 px de fogo na borda. **Todas confirmadas.**

## 5. Problemas novos (não registrados no relatório)

| ID | Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|---|
| F7-QA-1 | **P3** | **Resíduo do fogo antigo no corpo do ataque S q3:** ~11 px vermelho-escuros (`#720503`, `#8d0206`). Cerca de 6 ficam **fora** da área que a camada de fogo cobre: (27,18) na cabeça, (23–24, 41–42) no flanco, (22,46) e (36, 45–46) nas pernas. A 6× aparecem como manchas escuras; a 1×, discretas | `tmp_view/f7q/zoom_atk_S_body.png` (2º quadro); varredura de cor em `qa_f7` | Custo 0: pintar esses pixels com a cor vizinha do corpo (máscara do `attack_f7.py` em q3) |
| F7-QA-2 | P3 | Ataque N: o corpo fica igual por 4 quadros (q4–q7), não 3 | `met.json` → `attack_N.cortes` | Recuo ou respiração de 1 px em q5/q6 |
| F7-QA-3 | P3 (informativo) | `F7_ciclo_..._SNEW_*.gif` junta 4 linhas do tempo e tem delays de **2 cs** (20 ms). Chrome e Firefox respeitam, mas alguns visualizadores arredondam ≤ 2 cs para 10 cs, e o ciclo fica mais lento do que é | `gifinfo.py` | Para o ChatGPT, mandar também os ciclos por direção, ou avisar que a referência de tempo é o `pacote.json` |
| F7-QA-4 | P3 (processo) | `build_f7.py` faz `rmtree` do `pacote_agumon_f7/` antes de refazer: refazer no lugar destrói a entrega. Os scripts dependem de `workspaces/game-art/tools` (`pxpng`, `gifenc`) | `scripts/build_f7.py` linhas 9–12; `lib.py` linha 3 | Gravar em pasta nova e comparar (eu fiz assim, numa cópia) |

**Nenhum P0 ou P1.** P2 (todos declarados): F7-R1, F7-R2 e F7-R3. P3: R4 a R11 e QA-1 a QA-4.

## 6. Notas

**Régua:** a mesma dos QAs F2, F4, C10 e F6. Referência aprovada (v13/v15) + `FICHA_AGUMON.md`, leitura a 1× e a 4× em movimento. A paleta fica **fora** das notas (G-1 aberto). O GBA Plus é dado nas duas réguas. 8 = pronto para integração de teste; GS-010 = média ≥ 9 e nenhuma categoria < 8. **Nenhuma nota a animação que não existe:** a F7 tem walk, idle e ataque nas 4 direções e feliz só em S. Feliz N/E/W e diagonais não entram na nota.

### 6.1 Os 8 critérios do Comando 12 §5

| # | Critério | Nota | Justificativa |
|---|---|---:|---|
| 1 | Fidelidade ao Agumon | **8,0** | Rosto, proporção e cores do F2b sem alteração, e agora iguais em rotação, idle e walk. Herda as falhas do F2b: 2 garras, barriga lateral clara e riscos no topo da cabeça N. No ataque, o rosto é o desenho PixelLab |
| 2 | Qualidade GBA Plus | **7,5** | **Régua técnica:** ~8,5 (0 AA, 0 semitransparente, 1 componente, contorno do F2b, 0 px na borda). **Régua de identidade v13/v15:** ~7,5 (mesma família do F2b, mas o ataque S tem duas famílias de traço, a perna lateral é de um tom só e há o resíduo F7-QA-1). **Style Bible (Endesga-32):** 0/154 cores exatas, fora da nota |
| 3 | Fluidez de animação | **7,5** | Walk E/W ≈ 8,5 (pé plantado confirmado na pista, braço, cauda). Idle ≈ 8. Feliz ≈ 8,5. Ataque E/W ≈ 8; S ≈ 7,5; N ≈ 7 (corpo congelado por 520 ms). **Walk S/N ≈ 6,5** (marcha no lugar). É o critério que mais segura a média |
| 4 | Consistência anatômica | **8,5** | Canvas único, chão fixo (49/48) em walk, idle e ataque, cabeça 8/8 nas 4 direções, W = espelho exato, escala igual à do F2b. Desconta a cabeça PixelLab dentro do ataque |
| 5 | Legibilidade no jogo | **7,5** | A 1× o E/W lê muito bem; o S/N lê como andar, mas pouco animado; o fogo lê no S e no E e é pequeno no N. **Sem teste sobre mapa real nem na velocidade do jogo**, então não passo de 7,5 |
| 6 | Custo e tempo | **7,0** | **Marginal: excelente** (0 gerações, ~20 min confirmados pelas datas dos arquivos, refeito em 0,4 s byte a byte). **Por espécie: médio.** Depende de toda a cadeia anterior (PixelLab A com ~18–23 gerações [L], polimento F2b, C10, rig F3, F4), e as máscaras de fogo, as peças do rig e as poses do braço são por espécie [H]. Na mesma régua, o D teve 6,5 e o B 6,0 |
| 7 | Transições entre animações | **8,0** | Entrada e saída de idle e ataque com 0 px (S/N) e 17 px (E/W); feliz com 1 px; idle → walk troca só pernas e braços, sem mudar a cabeça. Descontos: o corte rig → PixelLab dentro do ataque S (494 px) e a troca de 321–431 px ao interromper a walk com um ataque |
| 8 | Ausência de regressões | **7,5** | Não há regressão P0 ou P1, e as regressões do C10 foram resolvidas. Ficam 3 P2 declarados (formato, walk S/N com menos movimento que o F2b, ataque que depende da camada) e o resíduo F7-QA-1 |
| | **Média simples** | **7,69 ≈ 7,7** | (8,0 + 7,5 + 7,5 + 8,5 + 7,5 + 7,0 + 8,0 + 7,5) / 8. **Abaixo de 8.** Quatro categorias ficam abaixo de 8 |

### 6.2 Os 6 ponderados (Comando 11 §5), comparáveis com A–F6

**Aviso de método** (o mesmo do QA F6): as notas de A a D são **[L]** dos QAs anteriores, mapeadas para 6 critérios [H]. As de F6 são do meu QA F6 [L]. As da F7 são desta auditoria [E/H]. **C e D não são entregas equivalentes** (C: idle e emoção em S/E; D: só S). Diferenças de 0,1–0,2 estão dentro da incerteza do mapeamento.

| Critério (peso) | A (PixelLab v7) | B (F2b + C10) | C (rig F3) | D (F4/C10A, só S) | F6 (Blender) | **F7 (híbrido ampliado)** |
|---|---|---|---|---|---|---|
| Fidelidade (25) | 5,5 | 7,5 | 7,0 | 7,5 | 4,5 | **8,0** |
| GBA Plus (20) | 5,5 | 7,0 | 6,5 | 6,5 | 5,5 | **7,5** |
| Animação (20) | 5,5 | 7,5 | 6,5 | 7,0 | 7,0 | **7,5** |
| Consistência (15) | 5,5 | 7,5 | 7,5 | 7,0 | 8,5 | **8,5** |
| Legibilidade (10) | 6,5 | 7,5 | 6,5 | 8,0 | 5,5 | **7,5** |
| Tempo/custo (10) | 5,0 | 6,0 | 7,0 | 6,5 | 8,5 | **7,0** |
| **Média ponderada** | **5,55** | **7,25** | **6,83** (parcial) | **7,08** (só S) | **6,30** | **7,73** |

Conta da F7: 8,0×0,25 + 7,5×0,20 + 7,5×0,20 + 8,5×0,15 + 7,5×0,10 + 7,0×0,10 = 2,00 + 1,50 + 1,50 + 1,275 + 0,75 + 0,70 = **7,725**.

**Leitura:** a F7 lidera em fidelidade, empata com o F6 na liderança de consistência e **não tem nenhuma categoria abaixo do B**. A distância para o B (+0,5) é maior que a incerteza do mapeamento. **Ainda não passa a régua 8**: pela regra do ADR-012 (nenhuma categoria < 8), ficam de fora GBA Plus, animação, legibilidade e custo.

## 7. Recomendação

1. **Versão:** adotar a **F7 como versão candidata do Agumon** e como base do padrão (canvas 60×60, âncora (29,5 ; 49), fogo em camada). **Não está homologada**: só o Vitor homologa (Comando 12 §6), e a nota é 7,7, abaixo da meta.
2. **Walk S/N: rig (F7), não F2b.** O F2b anda mais (joelho e braço), mas troca o rosto ao começar a andar (103 px de diferença na cabeça S), mexe a cabeça no N (1/8 igual) e oscila a âncora (49–50). No jogo, rosto trocando e sprite pulando incomodam mais que uma marcha discreta [H]. **Para passar de 8**, o caminho mais barato [H] é um passe de custo 0 em cima do rig: transplantar as pernas e braços das poses do F2b walk S/N para baixo do tronco e da cabeça da rotação, mantendo a âncora. Isso é trabalho do game-art e precisa de autorização.
3. **Correções de custo 0 antes do build isolado** (opcionais para o envio ao ChatGPT): limpar o resíduo de q3 S (F7-QA-1); dar 1 px de vida ao corpo do ataque N em q5–q6; corrigir o "q4–q6" do relatório para "q4–q7".
4. **Pronto para o ChatGPT? Sim, como candidato.** O Comando 12 §6 manda enviar relatório, QA, GIFs, recomendação e pendências, e a F7 tem tudo isso: 4 direções, comparação A/B/C/D com N/A honesto, mesma velocidade nas comparações equivalentes e tempo e custo registrados. O envio deve dizer com clareza que **a meta de 8 não foi atingida (7,7)** e listar os P2. **Para o build isolado do Vitor**, antes resolver o F7-R3: o jogo precisa desenhar `attack_fx` junto com `attack`, na ordem do `pacote.json`.

## 8. Não feito / NÃO VALIDADO

- Integração, âncora no mapa real, velocidade de deslocamento do jogo e desempenho: **NÃO VALIDADOS** (o jogo não foi aberto; fora do escopo).
- Fundo de mapa real: **NÃO VALIDADO** (só verde `#7fa65a` e cinza `#9a9a9a`).
- GIFs entregues tocados como arquivo: não. Conferi a estrutura (quadros, delays de 11 cs nas comparações de walk e ataque, loop) e toquei os PNG-fonte com os delays do `pacote.json`.
- F7-R9 (degrau na cauda): não verificado pixel a pixel.
- Ficha da knowledge-base (`digimondex/species/agumon.json`) e REF-01..05: não abertas, como o próprio relatório registra. A régua de fidelidade usou a `FICHA_AGUMON.md`.
- Paleta (G-1) e escala (G-2): **conflitos abertos**, medidos e não resolvidos. A escala do Agumon F7 é a mesma do F2b (35/39/41 px).
- Não alterei o `PROGRESS.md` da pasta (é do game-art) nem nenhum asset ou script do laboratório.

## 9. Decisões do fundador

1. Aceitar a F7 como versão candidata e o formato 60×60 / (29,5 ; 49) / fogo em camada como padrão de pacote.
2. Walk S/N: manter o rig (recomendação do QA) ou voltar ao F2b. Autorizar ou não o passe de custo 0 "pernas e braços do F2b sobre o rig".
3. Autorizar as correções de custo 0 do §7 antes do build isolado.
4. Fogo: manter dentro do canvas ou deixar o projétil para o jogo.
5. Paleta e escala: continuam abertas para a Etapa 6.
