# QA INDEPENDENTE · Comando 14 · F8B Hawkmon · Etapa 1 (pose base S)

**Digital Odyssey (GS-003) · game-qa (Opus 5.5) · 2026-11-15**
Legenda: **[E]** executado/medido nesta auditoria · **[L]** dito em relatório anterior, não reverificado · **[H]** julgamento/hipótese meu.
Este QA **não aprova** a etapa: ele recomenda. Depois dele vêm o ChatGPT e o Vitor.

## 0. O que foi testado

| Item | Valor |
|---|---|
| Pasta | `etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/` |
| Integridade | `sha256sum` de `base_polida/*.png` **bate** com `sha256.txt` [E] |
| Git | arquivos da etapa fora de controle de versão (repo raiz com outras mudanças pendentes de outros agentes, não tocadas) [E] |
| Assets alterados por mim | **nenhum**. Nenhuma geração no PixelLab. |
| Evidências criadas por mim | `qa_independente/` (ampliações 10×, silhuetas, prancha DS×base×Agumon, `medicoes.json`) |
| Roteiro reexecutável | `qa_independente/medir.py` (decodificador PNG próprio, sem PIL, não usa os scripts do game-art). Uso: `python3 -I medir.py <pasta_etapa1> <pasta_saida>`. Cópia em `workspaces/game-qa/scripts/c14e1_hawkmon/` |
| Réguas | (1) checklist da ficha `03` §9 e §11 (itens da vista S) e direção aprovada (A 38 px, P1, cabeça creme, topete separado); (2) `RUBRICA_QUALIDADE_VISUAL_V1.md` critério 1 (fidelidade + craft, âncoras 4/6/8/10) e critério 4 (escala e consistência). Critérios 2, 3 e 5 não se aplicam a uma pose parada. |
| Limite | Sem leitura dentro do jogo nem sobre cenário real; sem GPU (não é necessário para PNG estático). Style Bible §8 não foi relido nesta tarefa: o conflito G-1 (Endesga-32 × P1) continua aberto e **não** foi julgado aqui. |

## 1. Medições [E]

| Medida | Base polida | cand_00 | Referência |
|---|---|---|---|
| Altura total × largura | **38 × 22** | 61 × 36 | A: 38 × 18–21 (`05` §2) |
| Corpo (sem topete) | 30 | 51 | A: 30 |
| Topete | 8 (0,27 do corpo) | 10 (0,20) | ficha: ~0,26 |
| Cabeça | 12 (0,40 do corpo) | ~0,44 | ficha: ~0,40 |
| Largura da cabeça ÷ largura máxima | **18/22 = 0,82** | 24/35 = 0,69 | — |
| Perfil do tronco (largura por linha) | 22 constante por 10 linhas (retângulo) | 24 → 35, alarga para baixo (trapézio/"boliche") | `05` §6: "mais largo nos pés e nas pontas das asas" |
| Haste da perna (linhas estreitas entre corpo e pé) | **1–2 linhas** | ~5 linhas (≈3 em escala 38) | ficha §8: pernas ~0,30 do corpo, "finas e compridas" |
| Área opaca | 572 px (corpo 542) | 1299 (≈504 se reduzido a 38 px) | Agumon F7v2 S: 582 · Tamer: 695 |
| Cores | 19, **todas da P1**, 0 semitransparentes | 23, todas P1 | Agumon F7v2 S: 59 |
| Tons da P1 não usados (5 de 24) | `#4a1015` (vermelho mais escuro), `#7a7066` (branco mais escuro), `#24232c` (ponta da asa mais escura), `#7c4512` (amarelo mais escuro), `#b9bdc6` (sombra da garra) | — | — |
| Pixels sem vizinho da mesma cor | 85 (confere com o relatório) | 174 | — |
| Simetria | espelhada exceto 4 pixels, todos no topete | — | confere com o relatório |

Tamer A cabelo preto S: 25 × 41 [E]. Agumon F7v2 S (`refs_enviadas/ref3`): 22 × 35 [E; que é o mesmo arquivo do pacote F7v2 é [L]].

## 2. Avaliação isolada da pose

| Item obrigatório | Status | Evidência / observação |
|---|---|---|
| Reconhecimento imediato | **Funciona** [E/H] | A 1× e 4× lê como "Hawkmon": cabeça branca, faixa, topete, bico amarelo, corpo vermelho. Ninguém confunde com outra espécie. |
| Escala A 38 px | **Funciona** [E] | 38 total, 30 de corpo. |
| Paleta P1 | **Funciona** [E] | 19/19 cores na P1. |
| Cabeça creme quente | **Funciona** [E] | `#fbf7ee` / `#e4dccd` / `#b4aa9b`. |
| Topete separado | **Funciona** [E] | `base_S_topete.png` em camada própria, 4 × 8, base vermelha → ponta amarela, centrado. |
| Faixa com fivela | **Funciona** [E] | Faixa 18 × 3 (`#3d3c46`/`#2a2932`, distinta do contorno), fivela 4 × 3 clara no centro. Risco de "óculos/viseira": **baixo a médio** [H] — a faixa ocupa a largura toda da cabeça e os olhos encostam logo abaixo; a 1× ainda lê como faixa. |
| Bico curvo | **Parcial** [E/H] | Triângulo amarelo 6 × 5 com sombra laranja de 2 px na ponta. De frente lê como bico, mas não como gancho; o cand_00 mostra o gancho (ponta escura curvando para baixo e narina). |
| 3 pontas escuras por asa | **Funciona** [E] | 3 penas cinza (`#5d5c68`/`#3a3944`) separadas por contorno, 4–5 linhas. Leem como "dedos curtos/luva" mais que como rêmiges longas [H]. |
| Olhos azuis | **Parcial** [E/H] | Azul presente, mas o desenho (pupila no canto interno, azul escorrendo em diagonal para o bico) dá **expressão de choro/tristeza** a 4× e 10× (`qa_independente/base_10x.png`). No cand_00 o olho é redondo com pálpebra escura em cima e lê determinado. |
| V vermelho e traço na bochecha | **Parcial** [E] | O "V" é um traço horizontal de 2 px acima da faixa (lê como risco, não como V). Bochecha: 1 traço diagonal de 2 px por lado (ficha: 2 traços; aceitável na escala). |
| Gola em zigue-zague | **Parcial** [E] | Existe, mas a 1× vira um "babador" branco em V; o zigue-zague só aparece a 4×+. |
| Pés amarelos com garras brancas | **Funciona** [E] | 3 garras `#f6f6f6` por pé. |
| Pernas | **Ausente na prática** [E] | 1–2 linhas entre corpo e pé. A ficha pede pernas finas e compridas. |
| Tufos laterais | **Problema** [E] | 1 px de contorno solto dos lados da cabeça (linhas 9–10); a 4× lê como sujeira, não como penas. |
| Silhueta | **Parcial** [E/H] | `qa_independente/silhuetas_ds_base_agumon_4x.png`: a base vira **garrafa/bloco com antena**. "Ave com topete" só se adivinha pelo topete; o cand_00 (`c00_silh_4x.png`) tem sino alargando para baixo, pontas das asas abertas e pernas, e lê mais como ave. |
| Lista negativa (`03` §6) | **Funciona** [E] | Sem barriga clara, sem óculos com lente, topete único, sem penas pretas no corpo. |
| Acabamento GBA Plus | **Parcial** [E/H] | Grade limpa, 0 AA, contorno 1 px consistente. Mas o volume é chapado: o vermelho do corpo é quase todo um tom (`#e2473b`), sem sombra sob a gola nem nas laterais; o tom mais escuro do vermelho e do branco da P1 não é usado. Ao lado do Agumon F7v2 (59 cores, volume arredondado) o Hawkmon parece mais "ícone" que sprite do mesmo pacote. |

### Legibilidade [E, olho em 1× e 4×]
- **1×** (`comparacao/escala_tamer_agumon_hawkmon_1x.png`, `qa_independente/ds_mini_base_agumon_1x.png`): bloco vermelho/branco com faixa escura e bico amarelo; topete visível; olhos quase somem; asas e corpo viram uma massa só.
- **4×**: todos os traços obrigatórios são encontráveis; os problemas acima (olho triste, tufos soltos, tronco reto) passam a aparecer.

## 3. Escala contra Tamer e Agumon

| | Tamer A | Agumon F7v2 S | Hawkmon base | Hawkmon ÷ Agumon |
|---|---|---|---|---|
| Altura total | 41 | 35 | 38 | 1,09 (DS oficial: 1,07) |
| Corpo | — | 35 | 30 | **0,857** (DS: 0,85) ✔ |
| Largura | 25 | 22 | 22 | 1,00 |
| Área opaca | 695 | 582 | 572 | **0,98** |

- [E] A altura respeita a opção A aprovada, e o Hawkmon fica abaixo do Tamer.
- [E/H] **Mas a massa visual não respeita:** com 0,857 de altura, o esperado seria ~0,73 da área do Agumon (0,857²) ou ~0,87 se mantivesse o desenho do cand_00. A base tem **0,98**. Motivo: tronco retangular de 22 px e cabeça larga. Na prancha 1× o Hawkmon parece do mesmo tamanho do Agumon, ou maior.
- Isto não decide G-2 (escala Tamer/Digimon continua conflito aberto da Etapa 6). É só: o asset não cumpre o espírito da própria opção A que ele diz seguir.

## 4. A escolha do top 3 e o redesenho

- **Top 3: correto** [E/H]. Conferi a folha dos 16. O cand_00 é o único com frente pura, olhos abertos, asas recolhidas, pés no chão e todos os traços. cand_08 abre as asas (ombro mais largo, piora a massa), cand_09 está em pose de salto. Nenhum outro candidato seria ponto de partida melhor; cand_01/02/11 (olhos fechados) servem para o piscar do idle, como o game-art disse.
- **Redução manual a 38 px: decisão certa** [H]. Nenhum candidato veio na escala (59–62 px, [E]), e não há redução automática honesta para pixel art.
- **O redesenho perdeu proporções do cand_00 — sim, a base saiu mais atarracada** [E, números da §1]:
  1. tronco virou retângulo (22 constante) em vez de trapézio que alarga até as pontas das asas;
  2. cabeça proporcionalmente mais larga (0,82 contra 0,69 da largura máxima);
  3. pernas de 1–2 linhas contra ~3 esperadas pela redução;
  4. olho redesenhado com outra expressão.
- O relatório diz que a base ficou "mais perto do mini do DS". [E/H] **Não confere:** o mini DS (`refs_enviadas/ref2`) está em 3/4, com asas em ponta e corpo afunilado para baixo, e a silhueta dele é mais irregular e mais "ave" que a da base (`qa_independente/silhuetas_ds_base_agumon_4x.png`). A base não está mais perto de nenhuma das duas fontes: é um terceiro desenho, mais quadrado.

## 5. Correções gratuitas antes da rotação (todas manuais em `scripts/base.py`, 0 geração)

Ordem de prioridade. Todas cabem nos 38 px e na P1.

| # | Sev. | Correção | Por quê |
|---|---|---|---|
| 1 | **P1** | **Pernas:** tirar 2 linhas do tronco vermelho e dar 3–4 linhas de haste amarela (2 px de largura cada perna, afastadas), mantendo 38 px. | Sem perna não há walk de 8 quadros legível; a ficha pede pernas finas e compridas; também afina a massa. |
| 2 | **P1** | **Silhueta em trapézio:** estreitar ombros (16–18 px logo abaixo da gola) e deixar só as pontas das asas chegarem a 21–22 px, com as penas escuras apontando para fora/baixo como no cand_00. Tronco vermelho afunilando nos quadris. | Devolve o "boliche" do `05` §6, deixa a asa ler como asa, e baixa a área para ~0,85–0,90 do Agumon. Largura máx. 21 cumpre os 18–21 da proposta. |
| 3 | **P1** | **Olhos:** 3 × 3 redondos, pupila no centro ou levemente para fora, linha escura de pálpebra em cima (encostando na faixa), brilho de 1 px. Tirar o azul que desce em diagonal. | Hoje lê como choro; isto vai para todas as direções e quadros. |
| 4 | P2 | **Volume:** usar `#b82a2a`/`#7e1b1f` como sombra sob a gola, nas laterais do tronco e entre asa e corpo; `#7a7066` ou `#b4aa9b` sob a faixa e no queixo; sombra de 1 px no lado de baixo do bico. | Aproximar do acabamento do Agumon F7v2 sem mudar estilo; os tons já estão na P1. |
| 5 | P2 | **Bico:** 1–2 px mais escuros na ponta formando gancho para baixo; narina de 1 px. | "Bico curvo" é obrigatório; de frente o gancho tem que ser sugerido. |
| 6 | P2 | **Tufos laterais:** apagar os pixels soltos de contorno ou trocar por 2 px brancos com contorno colados à cabeça. | Hoje parecem sujeira. |
| 7 | P3 | **"V" vermelho:** fazer o V com 3 px (dois em cima, um no meio, ou diagonal) em vez do traço reto de 2 px. | Marca de identidade da ficha §9 item 3. |
| 8 | P3 | **Gola:** reforçar 2–3 pontas brancas com contorno escuro entre elas, para o zigue-zague existir a 1×. | Ficha §9 item 5. |

## 6. Nota

Régua: rubrica V1 (âncoras 4/6/8/10). Notas [H], baseadas nas evidências [E] acima.

| Critério | Nota | Por quê |
|---|---|---|
| C1 Fidelidade e beleza (espécie + craft) | **7** | Reconhecível de imediato, grade limpa, P1 deliberada, contorno consistente (âncora 8) — mas com mais de 1 desvio perceptível de forma/expressão (olhos, pernas, tronco retangular) e volume chapado, o que a rubrica põe abaixo de 8. |
| C4 Escala e consistência | **7** | Altura e paleta conforme a direção aprovada; contorno do mesmo tipo do Agumon. Mas a massa ≈ Agumon (0,98) contradiz a opção A, e a densidade de sombreamento é visivelmente menor que a do par. |
| Checklist da direção (38 px, P1, creme, topete separado, bico curvo, faixa+fivela, 3 pontas por asa) | 6 de 7 cumpridos, bico curvo parcial | §2 |
| **Média** | **7,0** | Meta ≥ 8: **não atingida**. |

## 7. Veredito

**NÃO segue ainda para rotação e animação. Precisa de ajuste antes — ajuste pequeno e gratuito**, não de nova geração.

- A rotação e a walk herdam tudo da base S: olhos tristes, ausência de pernas e silhueta de bloco se multiplicariam por 4 direções e ~30 quadros e custariam gerações para refazer.
- As correções 1–3 (P1) são obrigatórias; 4–5 recomendadas; 6–8 opcionais. [H] Com 1–5 feitas, espero a base em 8 ou mais.
- Depois do ajuste, sugiro um re-QA rápido só da base (mesmo `medir.py`; alvos: haste de perna ≥ 3 linhas, largura máx. ≤ 21, área ÷ Agumon entre 0,80 e 0,90, olhos sem diagonal descendo).
- A escolha do cand_00 e a decisão de reduzir à mão estão certas; o problema é só a fidelidade do redesenho ao candidato.

## 8. O que não foi feito
- Nenhum asset alterado; nenhuma geração; nenhuma correção aplicada.
- Leitura no jogo, sobre cenário real, com sombra de contato: **NÃO VALIDADO** (não há integração nesta etapa).
- Relação Endesga-32 × P1 (G-1) e escala Tamer/Digimon de toda a Etapa 6 (G-2): **não julgadas**, seguem abertas.
- Não confirmei por hash que `ref3` é o mesmo arquivo do pacote F7v2 do Agumon ([L]).

## 9. Decisões para o fundador (via game-studio / ChatGPT)
1. Aceitar que o game-art aplique as correções 1–5 antes da Etapa 2 (custo 0) — recomendação do QA.
2. Confirmar se a massa visual (não só a altura) deve seguir a razão 0,85 da opção A. O QA recomenda que sim, mas é parte de G-2.
3. Expressão-padrão do Hawkmon nas rotações: neutra/determinada (cand_00) — o QA recomenda; a atual lê como triste.

---

## Re-QA v2 (2026-11-15, game-qa, rápido)

Objeto: `base_polida_v2/` (E1b, §10 do `RELATORIO_ETAPA1.md`). Réguas: as mesmas das §§1–6 deste documento (ficha `03` §9/§11, direção aprovada e rubrica V1, critérios 1 e 4). G-1 e G-2 continuam abertos e **não** foram julgados aqui.

### R0. Build e método [E]
- `sha256sum -c base_polida_v2/sha256_v2.txt`: **15/15 OK**. Nenhum asset foi alterado e nada foi gerado no PixelLab.
- Medição própria: rodei o meu `medir.py` (idêntico ao de `workspaces/game-qa/scripts/c14e1_hawkmon/`, `diff` vazio) sobre uma cópia temporária dos 3 PNG da v2, montada como `base_polida/`, e com os candidatos originais. Saída em `qa_independente/reqa_v2/` (10×, silhueta 4× e `medicoes.json`). A cópia temporária foi apagada depois.
- Script complementar novo, `qa_independente/reqa_v2.py` (cópia em `workspaces/game-qa/scripts/c14e1_hawkmon/`), reexecutável: `python3 -I reqa_v2.py <v1.png> <v2.png>`. Ele conta pixels isolados por cor, área e máscara das linhas 28–37. Saída: `qa_independente/reqa_v2/reqa_v2_saida.txt`.
- Avaliação visual a 1×, 4× e 10× com as pranchas do game-art (`comparacao_v1_v2_cand00_agumon_*`, `silhuetas_*`, `escala_tamer_agumon_v2_v1_*`) e com a minha `reqa_v2/base_10x.png`.

### R1. Métricas: medição própria × alvos da §7

| Medida | Medido [E] | Alvo da §7 | Status |
|---|---|---|---|
| Altura × largura | 38 × 20 (corpo 30, topete 8) | 38 × ≤ 21 | ✔ |
| Haste de perna | 4 linhas (31–34), 2 px por perna, vão de 2 px entre elas | ≥ 3 | ✔ |
| Área ÷ Agumon F7v2 S | 484 / 582 = **0,832** | 0,80–0,90 | ✔ |
| Olhos | 3×3: pupila central, brilho no canto de cima de fora, pálpebra de 3 px. Azul **sem** a diagonal descendo | sem diagonal | ✔ |
| Cabeça ÷ largura máxima | 14/20 = 0,70 | cand_00: 0,69 | ✔ |
| Perfil | 14 → 16 → 18 → 20 → 18 → 16 (trapézio) | trapézio | ✔ |
| Cores | 24, todas da P1, 0 semitransparentes, 0 tons da P1 sem uso | P1 | ✔ |
| Pixels isolados | 103 (corpo 98, topete 5) | — | ver R2 |
| Simetria | 4 pares diferentes, todos no topete | — | igual à v1 |

Todos os números do §10.2 do relatório **conferem** com a minha medição.

### R2. Os 4 pontos pedidos pelo game-art

**1. Vão entre as pernas e as pontas das asas** [E]: máscara do lado esquerdo, igual no direito.
- Entre as duas pernas há um vão de 2 px nas linhas 31–34. Ele lê bem.
- Entre a perna e a ponta da asa: a linha 31 **não tem vão**, porque os contornos se encostam. A linha 32 tem 1 px e a linha 33 tem 3 px. A linha 34 só tem a perna.
- [H] A 4× a perna lê como perna, porque é amarela, fina e tem pé. A 1× e na silhueta, as pontas cinza descem até a linha 33, quase até os pés. A metade de baixo vira "4 hastes", e as asas lêem um pouco como braços ou mãos de 3 dedos, como numa luva. Não bloqueia na pose parada.
- O risco está na walk: se as pontas das asas ficarem paradas enquanto as pernas se movem, o olho pode ler 4 membros. Encurtar 1 linha das pontas (terminar na 32) abriria o vão sem perder a leitura das penas. **P3**, opcional.

**2. Pixels isolados, de 85 para 103** [E]: contagem por cor em `reqa_v2_saida.txt`.
- Os +18 vêm de detalhe intencional. Entram o azul dos olhos (6 px), tons de volume que a v1 não tinha (`#4a1015`, `#24232c`, `#7a7066`, `#7c4512` e `#b9bdc6`, 2 px cada) e mais separadores de contorno (de 20 para 26), que vêm das pontas da gola e das penas.
- Saíram 8 isolados do vermelho escuro (`#7e1b1f`, de 15 para 7), porque a sombra virou faixa contínua.
- [H] **Não há sujeira nem ruído.** Nenhum isolado está solto fora do contorno, e o problema dos tufos da v1 (contorno solto) acabou. O custo real é que o rosto ficou denso: faixa, fivela, V, pálpebra, olho e bochecha em 14 px. Isso não pesa na pose parada, mas é o ponto mais frágil para a rotação (R4).

**3. Cabeça quadrada com tufos que lêem como "orelhas"** [E/H]: é o defeito principal da v2.
- A cabeça tem 14 px constantes nas linhas 9–17. Os tufos (`W` + contorno) ficam nos **cantos de cima** (linha 8, colunas 4 e 17) e sobem acima do topo da cabeça.
- Na silhueta 4× (`silhuetas_v1_v2_cand00_agumon_4x.png`) a cabeça vira um bloco com duas pontas para cima nos cantos. A leitura é **"orelhas de gato ou chifres" e "capacete/caixa"**, e não "cabeça de ave com penas laterais".
- No cand_00 e no design de referência, as penas laterais saem **dos lados da cabeça, na altura da faixa ou logo abaixo**, abertas para fora e para trás. Elas não saem do topo.
- [H] A 1× a cabeça ainda lê como Hawkmon, porque faixa, bico e topete dominam. **P2.** Correção gratuita recomendada antes da rotação: descer os tufos para as linhas 11–13, encostados na lateral da faixa e apontando para fora (1–2 px além do contorno), e cortar 1 px nos cantos de cima da cabeça (linha 8/9) para arredondar. A largura máxima continua 20, porque a cabeça tem 14 e os tufos ficam abaixo da largura das asas.

**4. Volume** [E/H]: melhorou e é suficiente para a meta.
- O vermelho agora tem 3 tons em faixas: sombra lateral `#b82a2a`/`#7e1b1f` e `#4a1015` entre a gola e a asa.
- O tronco lê arredondado a 4× (`reqa_v2/base_10x.png`), e a gola tem sombra embaixo.
- Ainda há menos densidade que no Agumon F7v2: 24 cores contra 59. O branco da cabeça segue quase chapado, só com `#e4dccd` nas bordas, e por isso reforça o "bloco".
- [H] Ao lado do Agumon a 1× já parece do mesmo pacote. Não está no mesmo nível de modelagem, mas dentro do aceitável para GBA Plus.

### R3. Itens da §2 reavaliados

| Item | v1 | **v2** [E/H] |
|---|---|---|
| Pernas | Ausente | **Funciona** (4 linhas) |
| Silhueta | Parcial (garrafa) | **Funciona com ressalva**: trapézio de ave. Restam a cabeça-caixa com "orelhas" (R2.3) e as asas compridas ao lado das pernas (R2.1) |
| Olhos | Parcial (choro) | **Funciona**: expressão neutra/determinada, sem azul em diagonal |
| Bico curvo | Parcial | **Funciona/Parcial**: afina para baixo, com 2 px escuros na ponta. Sugere gancho de frente; sem narina |
| V vermelho | Parcial | **Funciona**: V de 4 px lê como V a 4×. A 1× vira um ponto vermelho, o que é aceitável |
| Gola em zigue-zague | Parcial | **Funciona**: 5 pontas separadas, que aparecem a 1× |
| Tufos | Problema | **Parcial**: deixaram de ser sujeira, mas estão no lugar errado (R2.3) |
| Massa ÷ Agumon | 0,98 | **0,83** ✔ (alvo da opção A; a decisão é de G-2) |
| Itens que já funcionavam (P1, creme, topete separado, faixa + fivela, 3 pontas, pés + garras, lista negativa) | Funciona | **Funciona**. O topete é idêntico ao da v1 [L, segundo o relatório; não comparei pixel a pixel] |

### R4. Nota

| Critério | v1 | **v2** | Por quê [H] |
|---|---|---|---|
| C1 Fidelidade e beleza | 7 | **8** | Os 3 P1 e os 2 P2 da §5 foram resolvidos; reconhecível a 1×, grade limpa, P1 deliberada, volume presente. Fica 1 desvio perceptível de forma (cabeça-caixa com tufos no topo), que a âncora 8 ainda tolera. Não chega a 9 por isso e pela densidade menor que a do par. |
| C4 Escala e consistência | 7 | **8** | Altura, largura e massa (0,83) dentro da opção A; mesmo tipo de contorno e paleta que o Agumon. A densidade de sombreamento ainda é menor que a dele. |
| **Média** | 7,0 | **8,0** | **Meta ≥ 8 atingida**, sem folga. |

### R5. Veredito

**A v2 pode seguir para a Etapa 2 (rotação, walk e idle).** Ela substitui a v1 como base, mas a decisão da base é do fundador.

Recomendação firme, que não bloqueia: aplicar **antes** da rotação o ajuste gratuito dos tufos (R2.3). Toda direção e todo quadro herdam a cabeça S, e corrigir depois custaria gerações. Se o ajuste for feito, não precisa de novo re-QA completo: basta conferir a silhueta 4× da cabeça. O encurtamento das pontas das asas (R2.1) é opcional.

### R6. O que vigiar na rotação (Etapa 2)
1. **Tufos e cabeça:** nas vistas E/W e 3/4, as penas laterais têm de sair para trás da cabeça, na altura da faixa. Não podem virar orelhas no topo nem sumir.
2. **Rosto denso (14 px):** faixa + fivela + V + pálpebra + olho + bochecha. Nas diagonais e no lado, conferir se o olho não some sob a pálpebra e se a fivela não vira "óculos/viseira" (lista negativa).
3. **Expressão:** manter olho neutro/determinado em todas as direções. Rejeitar quadro com azul escorrendo ou cara triste, a regressão da v1.
4. **Asas × pernas na walk:** as pontas das asas não podem ficar paradas ao lado das pernas nem se fundir com elas (o risco de "4 membros" do R2.1). Exigir 1 px de vão ou movimento oposto.
5. **Massa:** a área por direção deve ficar perto de 0,80–0,90 do Agumon na mesma direção. Nas vistas laterais a asa não pode inflar o volume.
6. **Paleta:** só P1, 0 semitransparentes. A ferramenta de rotação tende a introduzir tons intermediários, então medir com `medir.py`.
7. **Topete:** camada separada e alinhada ao centro da cabeça em cada direção. Conferir que fica atrás ou na frente da faixa conforme a vista.
8. **Bico:** de lado, o gancho tem de aparecer de fato (ponta curva para baixo). De frente ele só é sugerido, o que é aceitável.

### R7. Não feito / limites
- Nenhum asset alterado; nada gerado; nenhuma correção aplicada.
- Leitura no jogo, sobre cenário real e com sombra de contato: **NÃO VALIDADO**.
- G-1 (Endesga-32 × P1) e G-2 (escala e massa Tamer/Digimon): **não julgados**.
- Não refiz a comparação pixel a pixel do topete v1 × v2 [L].
- Notas são julgamento [H] sobre evidência [E]. Este re-QA recomenda; quem aprova é o fundador.
