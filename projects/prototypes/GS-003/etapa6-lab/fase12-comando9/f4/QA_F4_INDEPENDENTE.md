# QA independente: F4 (híbrido D do Agumon S) e nova checagem da F2b

**Digital Odyssey (GS-003) · game-qa · 2026-11-14, 11:25–11:45 · custo PixelLab: 0** (nenhuma ferramenta PixelLab chamada).
Legenda: **[E]** executado nesta auditoria · **[L]** lido de relatório anterior, não reverificado · **[H]** hipótese · **NÃO VALIDADO**, com o motivo.

**Material testado.** Pasta `fase12-comando9/` (não versionada: `git status` = `??`; HEAD do repositório `f02fbab`). `pagina_comparacao.html` sha256 `e24255c3013f9ca5…`; `hibrido_4x.gif` `2d3980828f352008…`. Pacotes `f2/pacote_*_f2/` no estado F2b. Base de comparação: `fase9-pixellab-d12/pacote_*` (original) e `workspaces/game-art/tmp/f2_v1_backup/` (F2 antes da F2b).
**Scripts e evidências** (fora do jogo, reexecutáveis): `workspaces/game-qa/tools/qa_f4/` (`cap.mjs`, `cap2.mjs`, `strip.py`, `met.py`, `pal.py`, `f2b_check.py`, `mkview.py`) e `workspaces/game-qa/tools/qa_f2/` (`centroid.py`, `compare.py`, da F2). Saídas em `workspaces/game-qa/tmp/qa_f4/`.
**Nada foi alterado** fora deste arquivo e das pastas do meu workspace.

## Resumo

1. **O Chromium abriu [E].** O headless-shell 1243 rodou com `LD_LIBRARY_PATH=/tmp/chromelibs/ex/usr/lib/x86_64-linux-gnu`. A página carregou sem erro de console, e a única requisição foi o próprio `file://`. Os 25 quadros do D embutidos na página são **byte a byte iguais** aos PNG em disco, e o tempo de cada quadro observado no navegador bate com o `delays_ms.txt` (±17 ms, 1 quadro de 60 Hz).
2. **Híbrido D: média 7,4. Não chega à régua 8** (só a legibilidade chega). O idle e o feliz se sustentam. O ataque tem a emenda de **saída** visível a 1× como um "estalo" de desenho (braços na horizontal caem, sobrancelha muda, cabeça sobe 2 px num quadro de 140 ms). A **entrada** quase não aparece, porque o estouro do fogo cobre a troca.
3. **A emenda medida confere [E]:** 604 px (rig q2 → v3) e 493 px (v3 → rig q7), os mesmos números do relatório. Mas a subida de 2 px na saída **não é nova**: o próprio ataque F2b já sobe 2 px na volta (q7 → q8, 393 px). O que a emenda acrescenta é a troca de traço.
4. **Existe uma alternativa de custo 0 a testar (não aplicada):** sair por `F2b q8` (a volta do próprio v3) antes do neutro do rig. Isso divide a troca em 393 + 354 px, os dois abaixo do maior corte interno (406). Ver §1.4.
5. **F2b: as três correções conferem, sem defeito novo [E].** O fogo do ataque N está dentro do canvas (0 px na linha 0 e em todas as bordas). O andar ficou com oscilação ≤ original nas 12 animações. O pé ferrugem do L/O sumiu (39 → 0 px na zona da perna de trás no q0). Ficam duas observações P3 já conhecidas: a chama "na cabeça" do N q3 e as solas em 2–3 linhas.
6. **Standard 1.1:** é bom como direção. Falta checagem de altura e de traço na emenda; o limiar "2× o corte interno" deixa passar o estalo que vi; "0 cores fora do pacote" quase não restringe (o pacote tem 254 cores); e o Passo 0 tem risco de IP e de envio de arte oficial a serviço externo. Detalhes no §3.

---

## 1. Híbrido D (Agumon S)

### 1.1 Execução no navegador [E]

| Item | Resultado | Evidência |
|---|---|---|
| Abertura | Chromium headless 1243, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`, `--no-proxy-server`. 0 exceções JS, 0 erros de console, nenhuma URL de rede | `tmp/qa_f4/cap/` (saída do `cap.mjs`) |
| Quadros embutidos = disco | idle 6/6, ataque 9/9, feliz 10/10, idênticos byte a byte | `d_frames_from_page.json` comparado aos PNG |
| Tempo real | idle 184/250/183/200/134/233 ms (alvo 180/260/180/200/140/220); ataque 200/150/116/151/133/117/150/149/200 (alvo 200/140/120/160/120/120/160/140/200); feliz idem, ±17 ms | `cap/trace.json` (362 amostras em 6 s) |
| Capturas em sequência | 24 capturas tocando (`run_00..23.png`, a cada ~70 ms) e 10 quadro a quadro com fundo claro (`step_00..09.png`) | `tmp/qa_f4/cap/` |
| Folhas com mapa de diferença (4× e 9×) | `strip_ataque.png`, `strip_idle.png`, `strip_feliz.png`, `seam_in.png`, `seam_out.png` | `tmp/qa_f4/` |

**Limites:** headless sem GPU; as capturas são indicativas do tempo, não de fluidez percebida. O fundo usado foi o verde da página (#7fa65a) e o cinza; **o fundo real do mapa: NÃO VALIDADO** (não havia cena de mapa nesta página). O `hibrido_4x.gif` **não foi aberto** à parte, mas a página toca os mesmos quadros verificados byte a byte.

### 1.2 Integridade [E] (`met.py`, `pal.py`)

- Canvas 64×64 em todos os 25 quadros; 0 pixels semitransparentes; 0 pixels nas bordas do canvas.
- Largura do crânio (linha topo+5) = 16 px em 25/25. Sola em y=45 em todos os quadros de chão (q3–q4 do ataque marcam 47 porque o fogo passa sob os pés, como diz o relatório).
- 0 cores fora da paleta do pacote F2 do Agumon em todos os quadros. **Ressalva:** essa paleta tem **254 cores**, então o critério quase não restringe (ver §3).
- Idle D = `f3/anim_idle_S` deslocado (+9, +1), pixel a pixel, nos 6 quadros. Ataque D q3–q6 = `F2b attack/S` q4–q7 deslocado (+3, −5): 0 pixels diferentes e 0 cortados.
- Cores por animação: idle 59, ataque 98, feliz 73 (confere com o relatório).
- **Achado novo (P3):** idle q2 e q3 são idênticos (0 px mudados). Na prática viram uma pausa de 440 ms no meio do ciclo. Não estraga a leitura (lê como respiração presa), mas é um quadro desperdiçado.

### 1.3 A emenda do ataque [E]

| Corte | Pixels mudados | Topo da cabeça | O que se vê a 9× (`seam_in.png`, `seam_out.png`) |
|---|---|---|---|
| rig q1 → q2 (antecipação) | 141 | 12 → 12 | braços 1 px para fora, boca abre |
| **rig q2 → v3 q3 (entrada)** | **604** | 12 → 13 | troca de desenho inteira, mas coberta pela bola de fogo branca sobre a barriga e as pernas; braços vão para a horizontal |
| v3 q3 → q6 (miolo) | 265 / 147 / 191 | 13 | contínuo |
| **v3 q6 → rig q7 (saída)** | **493** | **13 → 11** | braços horizontais caem para junto do corpo, sobrancelha franzida relaxa, sombreado da barriga muda (mais claro → mais quente) e a cabeça sobe 2 px |
| rig q7 → q8 | 141 | 11 → 11 | boca fecha |

**Leitura em movimento (capturas e passo a passo):**
- **Entrada:** lê como impacto. A troca de traço some atrás do clarão do fogo (160 ms). **Aceitável.**
- **Saída:** é o "pulo" que o relatório previa [H] e que confirmo **[E]**. A 1× aparece como um estalo de 140 ms: o boneco "troca de desenho" e fica 2 px mais alto de uma vez. Não é grave, porque o pé e a largura não se mexem, mas é a parte mais fraca da animação. **P3** (não bloqueia teste; bloqueia homologação ≥ 9).
- **Ressalva de justiça:** a subida de 2 px já existe no ataque F2b original (topo 18 → 16 no canvas 60, q7 → q8, 393 px). A emenda não piorou a altura; ela acrescentou a troca de traço. O desenho v3 também é **2 px mais baixo** que a rotação em todos os quadros do miolo (altura 33 contra 35), e o relatório chama isso de "mais agachado". Como o v3 fica agachado o miolo inteiro, a explicação é plausível, mas a ficha de proporção não mede isso.
- **Fidelidade:** o fogo continua nascendo no peito e cobrindo a barriga (o mesmo problema F2 "fogo sai do peito, não da boca" [L, QA F2]). Visto de frente, a boca aberta com o fogo logo abaixo pode ler como fogo vindo em direção à câmera [H], mas não é o Pepper Breath saindo da boca.

### 1.4 Alternativa de custo 0 para a saída (só medida; não alterei nada)

Medi trocar o q7 do rig pelo **q8 do próprio F2b** (a volta do v3, com a cabeça já em y=11 no canvas 64):

| Sequência de saída | Cortes |
|---|---|
| Atual: v3 q6 → rig q7 → rig q8 | 493 → 141 |
| Alternativa: v3 q6 → **F2b q8** → rig q8 | **393 → 354** |

Os dois cortes da alternativa ficam abaixo do maior corte interno do v3 (406), sem pixel à mão. **[H]** O traço muda em dois passos em vez de um; precisa ser visto em movimento antes de adotar. Fica para o game-art decidir e testar; depois, nova checagem do QA.

### 1.5 Notas 0–10 do D

**Régua:** referência aprovada v13/v15 e a ficha do Agumon (crânio, garras, sem crista, barriga sem branco). Leitura a 1× e 4× em movimento. Paleta **fora da nota** (G-1 aberto). Contra o Style Bible (Endesga-32): 0,0% de pixels exatos [L, relatório F4 §5]; não reverifiquei, e isso não entra na nota.

| Critério | Nota | Justificativa |
|---|---|---|
| Fidelidade | **7,5** | Identidade do Agumon preservada nas três animações (crânio 16 px fixo, rotação no idle e no neutro, boca do feliz unificada com a do ataque e sem o roxo do v3 cru). Desconta: fogo nascendo no peito, sobrancelha franzida que só existe no v3 e corpo 2 px mais baixo no miolo |
| Animação | **7,0** | Idle 7,5 (respiração e piscar, com o quadro duplicado q2 = q3). Feliz ≈ 8 (pulo amplo, começa e termina na rotação). Ataque ≈ 6,5: a antecipação de 1 px quase não lê a 1×, o disparo lê bem e a saída estala |
| Consistência anatômica | **7,0** | Pé, largura de crânio e âncora perfeitos; nenhum braço girado ou espelhado. Mas são duas famílias de traço no mesmo ataque (98 cores; sombreado e braço diferentes), e a troca é visível na saída |
| Legibilidade | **8,0** | Silhueta clara a 1× nas três; o feliz é a melhor leitura de emoção dos quatro métodos; o ataque comunica "solta fogo" |
| **Média** | **7,4** | |

**Régua 8 (pronto para integração de teste): NÃO atinge.** Média 7,4 e três categorias abaixo de 8. Régua GS-010 (média ≥ 9, nenhuma < 8): longe. Comparação justa: D (7,4) fica no nível de B (7,25 [L]) e acima de C (6,5 [L]). O ganho do D é o pacote completo (idle + ataque + emoção) com 0 gerações a mais, não a nota.

**Para subir a ≥ 8 [H]:** (1) saída por F2b q8 ou com quadro intermediário (consistência e animação, +0,5 cada [H]); (2) antecipação com 2 px em vez de 1, para ler a 1×; (3) tirar o quadro duplicado do idle; (4) a fidelidade do fogo depende de decisão do fundador (aceitar peito/frente ou gerar de novo).

## 2. F2b: nova checagem [E]

Ferramentas: `f2b_check.py` (orig × F2b por animação), `centroid.py` (o mesmo da QA F2) e um diff de hash F2 → F2b. Saídas em `tmp/qa_f4/f2b/`.

**O que a F2b mudou de fato (hash, F2 → F2b):** Agumon ataque N 4/9 quadros, andar S 7/8, L 8/8, O 8/8; Gomamon andar S 8/8, L 1/8, O 1/8; Ikkakumon andar S 3/8, L 8/8, O 8/8. Rotações e os demais ataques não mudaram. Isso bate com o escopo declarado.

| Item da QA F2 | Status | Evidência |
|---|---|---|
| **F2-1 (P2)** fogo do Agumon N cortado pela borda | **Corrigido.** Topo por quadro: 9/10/11/**4/1/1/1**/11/9; 0 px opacos na linha y=0 e nas outras três bordas em 9/9 quadros. A bola não foi reescalada (o q5 é um recorte, como declarado) | `f2b_check.txt`; `f2b/ag_attN.png`; `mov/mov_6.png` |
| **F2-2 / F2-3 (P3)** oscilação no andar | **Corrigido.** Centróide F2b ≤ original nas 12 animações de andar (Agumon L/O 1,6 = 1,6; Ikkakumon L/O 1,5 → 1,0; as outras caem). Topo também ≤ original nas 12. Meus números são idênticos aos de `metricas/oscilacao_f2b.txt` | `f2b_check.txt`, `f2b/centroid.txt` |
| **F2-4 (P3)** pé ferrugem do Agumon L/O | **Corrigido.** Pixels a ≤ 12 RGB de #cd6624 na zona y ≥ 41: q0 39 → **0**; nos outros quadros, 3 a 12 (contra 14–44 no original), que são a faixa sob a cauda que o relatório diz ter mantido. A 8×, a perna de trás ficou na sombra laranja do corpo e não lê mais como "sapato". O = espelho exato de L | `f2b/ag_walkE_z.png` × `ag_walkE_orig_z.png` |
| Defeito novo | **Nenhum encontrado.** 0 cores novas em relação ao original (Agumon 238, Gomamon 227, Ikkakumon 148); 0 semitransparentes; canvas e número de quadros iguais; W = espelho de E nas 5 animações que têm W; nenhuma borda tocada | `f2b_check.txt` |

**Observações (P3, não bloqueiam):**
- **Agumon ataque N q3:** a bola atrás da cabeça, agora mais baixa, lê como uma chama ou topete na cabeça durante 110 ms [E, `mov/`]. O relatório já aponta isso como [H]; **confirmo** que acontece a 1×. O q4 e o q5 leem como disparo.
- **Solas em 2–3 linhas** (Agumon L/O, Gomamon S e L/O, Ikkakumon S e L/O), por causa da trava de oscilação. Foi uma troca consciente e documentada. Em movimento, os pés não "patinam" de forma visível a 1× nas capturas [E, indicativo].
- **Ataques medidos pelo centróide** (Agumon S/N, Gomamon N) dão "pior" que o original, mas o efeito de fogo/água entra na medida. O Gomamon N **não mudou** na F2b (hash igual), e o Agumon N mudou de propósito (fogo mais baixo). Não é regressão da F2b.
- F2-5 a F2-7 continuam abertos, como declarado.

**Em movimento [E, parcial]:** uma página de visualização própria (`tmp/qa_f4/f2b/view.html`, fora do jogo) tocou o ataque N e o andar L do Agumon, o andar S do Agumon e do Gomamon e o andar L do Ikkakumon, a 110 ms. **Os `antes_depois_*.gif` da F2b não foram abertos.**

## 3. Leitura crítica da proposta do Standard 1.1

**O que está bom:** separa *como produzir* dos conflitos abertos; corta o idle do v3 (economia real de 3 gerações); torna obrigatórios métricas antes/depois, QA independente e nova checagem; tem regra explícita de "polir × gerar de novo" e teto de 2 regenerações por animação.

### 3.1 O que falta

1. **Checagem de altura e de traço na emenda.** O Passo 5.4 mede largura do crânio, sola e cor, e por isso não pega os 2 px de altura do v3 nem a troca de traço que eu vi. Proponho acrescentar: topo da cabeça com variação ≤ 1 px por corte nos quadros de chão; altura do corpo do v3 com ±1 px da rotação; e leitura em movimento obrigatória **do corte de saída**.
2. **Antecipação mínima que lê a 1×.** O "agachar 1 px" do Passo 4.3 quase não aparece no jogo. A régua deveria ser "visível a 1×", com um valor mínimo (por exemplo, 2 px) testado.
3. **Convenção de tempo e de loop.** Não define faixas de delay por tipo de animação, se ataque e emoção são de uma vez só e como evitar quadro duplicado (o idle D tem um).
4. **Canvas e âncora para o game-dev.** O D usa 64; o andar, 48–60; o ataque F2b, 60. O padrão deveria fixar o canvas por estágio, ou declarar a âncora pela sola como obrigatória **para o jogo**, não só para a montagem.
5. **Cobertura.** Só existe D para Agumon S. Faltam E/N/W (o rig E teve 7,0 [L]), outra espécie bípede e a regra para quadrúpedes (o Passo 4.6 exclui o rig, mas não diz o que entra no lugar do idle: v3 de novo?). O custo "18–20 por espécie" assume idle por rig também em E e N.
6. **Fogo do Pepper Breath.** A decisão "do peito é aceitável?" condiciona o critério 3 de regeneração ("se o fundador exigir"). Sem ela, o Agumon não tem como chegar a 8 de fidelidade.
7. **Fundo do mapa no QA.** O Passo 6 pede "sobre o fundo do mapa", mas não diz qual mapa nem qual escala de tela. Para ser reproduzível, precisa de uma cena fixa.

### 3.2 O que é arriscado

1. **Passo 0, arte oficial como "entrada de ferramenta (D12)".** Enviar folha oficial para o PixelLab publica arte de terceiros num serviço externo. Pelas regras do estúdio, isso exige aprovação específica do fundador. Não verifiquei o teor da D12 (**NÃO VALIDADO**): se a D12 não cobre o envio a serviço externo, o passo contradiz a regra. E "uso interno de estudo" não reduz o risco de IP do resultado derivado. **Decisão do fundador.**
2. **Passo 0, Reddit/ArtStation/Pinterest.** A proposta proíbe conta nova e postagem (correto), mas pedidos de permissão a artistas são comunicação externa: só o fundador envia, e a proposta já diz isso. Manter assim.
3. **"0 cores fora do pacote" como critério de limpeza.** Com 254 cores no pacote, quase tudo passa. Isso dá falsa segurança enquanto o G-1 (paleta) está aberto. Sugiro reportar **cores por animação** e **pares a ≤ 10 RGB restantes**, sem virar nota.
4. **Limiar "2× o maior corte interno".** É relativo ao próprio v3. Uma animação agitada (o feliz tem cortes internos de 727–742 px) aceitaria emendas enormes. E pixels mudados misturam efeito (fogo) com corpo. Melhor medir **só o corpo** (mascarando as cores do efeito) e com teto absoluto [H].
5. **Rig ligado ao Agumon.** `rig_s.py` foi escrito para uma espécie. O "~80% reaproveitável" é [L] e não foi testado em uma segunda espécie. O custo de agente "~30–45 min por espécie" é [H].
6. **Nota herdada.** A tabela da F4 e a proposta citam as notas dos componentes como proxy do D. A nota real (7,4) é menor que a do melhor componente, porque a emenda custa. O 1.1 deve proibir nota herdada em pipeline montado.

### 3.3 O que dá para medir (custo 0, scripts prontos ou triviais)

| Medida | Como | Limiar sugerido [H] |
|---|---|---|
| Sola e oscilação | `oscilacao.py` / `centroid.py` | centróide e topo ≤ original; sola em ≤ 2 linhas |
| Bordas do canvas | contagem de px opacos nas linhas e colunas extremas | 0 |
| Semitransparência | contagem | 0 |
| Espelho O = L | comparação pixel a pixel | 100% |
| Emenda: corpo | pixels mudados com o efeito mascarado; Δ topo da cabeça; Δ largura do crânio | Δ topo ≤ 1 px por corte; largura igual |
| Emenda: altura do v3 × rotação | bbox nos quadros de chão | ±1 px |
| Quadros duplicados | diff de vizinhos = 0 | 0, salvo pausa declarada |
| Tempo real | página + rastreio rAF (`cap.mjs`) | ±1 quadro de 60 Hz |
| Cores | por animação e fora do pacote | reportar; fora da nota até o G-1 |
| Paleta | % exata e ≤ 6 RGB contra Endesga-32 e contra v13/v15 | reportar as duas; fora da nota |

**Continua subjetivo:** fidelidade à ficha e "lê como a ação" a 1×. Para isso: leitura a 1× em movimento por quem não produziu, com a ficha negativa ao lado.

## 4. Problemas encontrados

| ID | Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|---|
| F4-1 | P3 | Saída do ataque D estala: troca de traço + 2 px de altura num quadro de 140 ms | `seam_out.png`; `cap/step_06..08` | Testar a saída por F2b q8 (§1.4), custo 0; ou quadro intermediário à mão |
| F4-2 | P3 | Idle D q2 = q3 (quadro duplicado, pausa de 440 ms) | `strip_idle.png` (0 px mudados) | Tirar o duplicado e somar o delay, ou trocar por um quadro intermediário |
| F4-3 | P3 | Antecipação de 1 px quase invisível a 1× | `strip_ataque.png` q0–q2 | 2 px de agachamento [H], dentro da regra "só translação" |
| F4-4 | P2 (herdado, decisão) | Pepper Breath nasce no peito e não na boca | `seam_in.png` | Decisão do fundador: aceitar ou gerar de novo o miolo do ataque |
| F2b-O1 | P3 (conhecido) | Ataque N q3: a bola lê como chama na cabeça | `f2b/ag_attN.png` | Opcional: começar a bola no q4 |

Nenhum P0 ou P1.

## 5. O que não foi feito

- Fundo do mapa real; o GIF `hibrido_4x.gif` aberto à parte; os `antes_depois_*.gif` da F2b: **NÃO VALIDADO**.
- Paleta contra Endesga-32 e v13/v15 não remedida (citada [L]).
- `pixelart_workbench score`: não rodado.
- Notas da F2b por espécie não refeitas: esta checagem confirma as correções, mas não reavalia a nota inteira dos pacotes.
- Integração no jogo: fora do escopo; nada no jogo foi tocado.

## 6. Decisões do fundador

1. Fogo do Pepper Breath no peito (aceitar ou gerar de novo o miolo): sem isso, o Agumon não passa de 7,5 de fidelidade.
2. Saída da emenda: autorizar o game-art a testar a saída por F2b q8 (custo 0) ou exigir quadro à mão.
3. Standard 1.1: homologar só depois de (a) checagem de altura e traço na emenda, (b) critério de cor que restrinja de fato, (c) um segundo bípede em D e (d) a definição do idle de quadrúpede.
4. Passo 0: se arte oficial pode ser enviada como entrada ao PixelLab (conferir o alcance da D12).
5. Os conflitos da Etapa 6 (paleta, escala, critério unificado) continuam abertos e não foram resolvidos aqui.
