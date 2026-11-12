# QA — Piloto comparativo Guilmon (idle+walk, S/SW), via (a) à mão vs (b) PixelLab

- **Autor:** game-qa, papel VISUAL-QA (GS-010 §9) · **Data:** 2026-11-10
- **Revisão independente** de `phase2/art/` (README, `board/prancha_comparativa.png`, `board/compare_*.png`, GIFs de `pipeline-a/` e `pipeline-b/`, `board/compare_side_by_side.html`), produzido por game-art (papel GAME-ART-DIRECTOR). Este QA não aprova nem reprova o protótipo — registra evidência e notas para a decisão do fundador, conforme ADR-012 §3.
- **Critérios:** `quality-overhaul/ART_DIRECTION_V2.md` (escala §1.2, outline §3, animação por anatomia §5), GS-010 §2–3 (laboratórios de personagem/Digimon) e §8 (homologação, meta 9/10 por categoria).
- **Metodologia:** nenhum arquivo de arte foi alterado. Os 8 PNG/GIF fonte de `pipeline-a/` e `pipeline-b/` foram enviados a um endpoint de upload temporário do PixelLab (`get_upload_url`, expira em 3 dias, não grava nada no estúdio) só para permitir inspeção ampliada quadro a quadro com `pixelart_workbench inspect` (comando de leitura, sem geração, sem custo). Todas as evidências abaixo citam arquivo + coordenadas de quadro/região.

---

## 1. SW é real? — achado central, confirmado

| Via | Idle-SW | Walk-SW | Veredito |
|---|---|---|---|
| **(a) à mão** | `pipeline-a/idle-sw/idle_sw.gif`, 4 quadros — perfil puro a 90° (focinho apontando 100% para a esquerda), idêntico em pose a uma direção W | `pipeline-a/walk-sw/walk_sw_sheet.png`, 6 quadros — mesmo perfil de 90°, sem rotação 3/4 | **NÃO é SW real.** Confirmado visualmente: é literalmente o frame W do rip reaproveitado, como o próprio README admite. Nenhum quadro, em nenhum dos 2 clipes, mostra rotação diagonal. |
| **(b) PixelLab** | `pipeline-b/idle-sw/idle_sw_sheet.png`, 5 quadros (144×96, grade 3×2, última célula vazia) — corpo rotacionado em pose 3/4, cauda visível curvada à direita do corpo, cabeça entre S e W | `pipeline-b/walk-sw/walk_sw_sheet.png`, 7 quadros (144×144) — mesma rotação 3/4 mantida em todos os quadros de locomoção | **SIM, é SW real.** Confirmado visualmente: silhueta claramente distinta tanto da pose S (`idle_s_sheet.png`) quanto da pose W-pura vista na via (a) — é um ângulo de câmera novo e coerente, não uma pose reciclada. |

Isso confirma a conclusão da própria auditoria de arte: a via manual, sendo zero-custo, estruturalmente não pode inventar um ângulo de câmera que nunca existiu no rip; a via PixelLab resolve isso por ~1 geração.

---

## 2. Deriva de identidade (achado do game-art, verificado)

O README aponta "idle gerado (S), quadro 3 de 4" como suspeito de silhueta mais fina. Verificação quadro a quadro de `pipeline-b/idle-s/idle_s_sheet.png` (144×96, grade 3×2 = 1 quadro mantido da referência + 4 gerados):

- Quadro 1 (região 0,0–47,47 — **quadro mantido da referência**, não gerado): braços largos dobrados nos quadris, silhueta de referência.
- Quadro 2 / gerado 1 (48,0–95,47): silhueta larga, cauda visível à direita, consistente com quadro 1.
- Quadro 3 / gerado 2 (96,0–143,47): pernas afastadas, cauda estendida, silhueta larga, consistente.
- **Quadro 4 / gerado 3 (0,48–47,95 — "quadro 3 de 4" gerado citado no README): braços visivelmente mais colados ao corpo, ombros mais estreitos que nos quadros 2 e 3 do mesmo clipe.** Confirma o achado do game-art: há deriva de identidade real dentro do próprio ciclo de 4 quadros.
- Quadro 5 / gerado 4 (48,48–95,95): volta a ficar consistente com os quadros 2–3.

**Conclusão:** a deriva é real, localizada em 1 de 4 quadros gerados, e é o tipo de defeito que só aparece em inspeção quadro a quadro — correto o game-art não ter aprovado o próprio trabalho.

Na via (a), por construção (edição de pixel exata, sem geração), não há deriva possível: as paletas de `idle-s`, `idle-sw`, `walk-s` e `walk-sw` da via (a) são idênticas entre si (10–11 cores hex fixas, as mesmas do rip) em todos os quadros.

---

## 3. Contato com o chão, peso, alternância de pés

- **Via (a), walk-S** (`pipeline-a/walk-s/walk_s_sheet.png`): alternância de pé **confirmada e real**. Quadro 1 (região 0,0–31,39) tem o pé branco de contato à **esquerda** da silhueta; quadro 3 (região 64,0–95,39) tem o mesmo pé de contato espelhado para a **direita**, com a cauda também espelhada de lado. Por ser literalmente um espelho de pixel, o eixo Y dos pés (linha do chão) é idêntico entre os dois quadros de contato — zero flutuação vertical indesejada.
- **Via (b), walk-S** (`pipeline-b/walk-s/walk_s_sheet.png`): alternância de pé também **presente e real** (não genérica) — quadro 1/4 (pé claro à esquerda) e quadro 3/6 (pé avermelhado à direita) alternam visivelmente, melhor que o padrão genérico que a auditoria original criticou. Porém, o quadro 5 (região 48,48–95,95) mostra uma pose de agachamento nitidamente **mais baixa** que os quadros 1 e 4 — indício de ancoragem de pé/chão não totalmente controlada entre quadros (variação de altura do corpo que não lê como transferência de peso desenhada, lê como inconsistência da IA).
- **Respiração/cauda em repouso (idle):** a via (a) só tem bob vertical ±1px, sem nenhum movimento de cauda entre os 4 quadros (confirmado: `idle_sw.gif` via-a tem os 4 quadros com pose idêntica exceto o deslocamento vertical) — não atende a exigência do §5 do `ART_DIRECTION_V2.md` para bípede pequeno ("respiração + cauda com leve oscilação contínua mesmo parado"). A via (b) tem variação de pose mais orgânica entre quadros de idle (braços/cauda mudam de posição, não só sobe-desce), mais próxima do espírito do §5, mas sem controle fino sobre qual parte se move.

---

## 4. Leitura na escala do jogo

Os sprites testados (32×40 a 48×48px de canvas, corpo útil ~26–34px) seguem legíveis como "é um Digimon vermelho bípede pequeno" a essa escala, nos dois pipelines — a silhueta básica (cabeça grande, cauda, braços) não se perde. Isso vale tanto para (a) quanto para (b), porque ambos partem da mesma referência de proporção (rip oficial).

---

## 5. Coerência de outline e paleta

| | Via (a) | Via (b) |
|---|---|---|
| Nº de cores no clipe | 10–11, fixas (mesma paleta do rip em todos os clipes) | Cresce por clipe: idle-S 30, idle-SW 34, walk-S 42, walk-SW 43 |
| Outline | #212121 uniforme, 1px, sem variação | #212121 ainda dominante, mas cercado por vários tons de transição/antialiasing (`#292121`, `#3e1710`, etc.) que não existem no rip original |
| Risco | Nenhum — não há geração, não há como divergir | A paleta cresce a cada nova geração v3, ou seja, cada clipe novo pode introduzir tons que o clipe anterior não tinha — risco real de bíblia de cor do Digimon derivar ao longo de várias gerações futuras (idle, walk, attack, hurt, 8 direções) se nada for consolidado com `reduce_colors`/paleta travada |

A via (a) vence este critério por construção; a via (b) ainda é aceitável para 1 piloto pequeno, mas precisaria de uma paleta travada (`palette=` nos tools de animação) para não derivar ao escalar para o roster completo, como o próprio game-art já recomenda na seção 3 do README (polimento manual pós-PixelLab).

---

## 6. Notas por critério do GS-010 §8 (meta = 9, nenhuma categoria abaixo de 8)

| Critério | Via (a) à mão | Via (b) PixelLab | Evidência principal |
|---|---:|---:|---|
| **Animações dos Digimon** | 5/10 | 6/10 | (a) perde por não ter movimento secundário de cauda no idle e por SW não ser uma direção própria. (b) ganha por alternância de pé real + SW genuíno, mas perde por inconsistência de altura no quadro 5 do walk-S (§3 acima) e por não cobrir attack/hurt neste piloto. |
| **Identidade dos Digimon** | 9/10 | 6/10 | (a) é pixel-idêntico ao rip em toda a sequência, sem deriva possível — só não é 10 porque a "direção" SW é tecnicamente uma direção errada disfarçada. (b) perde pontos pela deriva confirmada no quadro 4/5 do idle-S (§2 acima) — exatamente o tipo de defeito que a checklist §6.1 do `ART_DIRECTION_V2.md` ("nenhuma mudança de tamanho entre quadros") reprovaria se aplicada à risca. |
| **Consistência artística (outline/paleta)** | 9/10 | 5/10 | (a) paleta fixa de 10–11 cores em todos os clipes, outline uniforme. (b) paleta cresce a cada geração (30→42→43 cores) e introduz tons de antialiasing que o rip não tem (§5 acima). |

Nenhuma das duas vias, isoladamente, atinge a meta de 9 em nenhum dos 3 critérios acima neste piloto. Nenhuma categoria da via (b) passa do piso de 8 exigido pelo §8. A recomendação híbrida do próprio README (PixelLab só para direções que faltam + polimento manual de pé/cauda/paleta) é consistente com o que esta revisão encontrou: cada via resolve o que a outra não resolve, nenhuma sozinha.

---

## 7. Veredito sobre escala nativa vs Drakantos — resposta direta ao fundador

**Não. Nenhuma das duas vias, nesta escala nativa (~26–34px de corpo útil, canvas 32×40 a 48×48), chega perto de 9/10 contra o Drakantos — e isso não é um problema de qual pipeline foi usado, é um problema de orçamento de pixel.**

Evidência direta (`evidence/drakantos-video/t0058_floresta_lama_roxa_fundador.png` e `t0560_floresta_tronco_caido.png`): os personagens do Drakantos, na mesma categoria de leitura de mapa, ocupam uma área muito maior na tela, com múltiplas bandas de sombreado por material (não cor chapada), contorno integrado por contraste em vez de linha única, luz ambiente colorida incidindo sobre o personagem, e um sistema de retrato/busto com expressão facial própria nos diálogos. Nenhum desses recursos cabe fisicamente em 30–48px: aos 48×48px testados aqui, a via (b) já usa só cor chapada (`#ff1000` cobrindo a maior parte do corpo) com praticamente nenhuma banda de luz/sombra intermediária, e os "olhos" do Guilmon são 2 pontos brancos fixos sem nenhuma gama de expressão.

Isso **não é uma crítica de execução** às duas vias testadas — é a mesma conclusão lógica que o próprio `ART_DIRECTION_V2.md` §1.2 já registrou antes deste piloto: a escala de mapa hoje (~24–31px de Rookie) precisa subir para **44–52px** só para abrir espaço físico de pixels suficiente para esse nível de detalhe, e mesmo essa escala nova **ainda não foi testada neste piloto** (o próprio README, §5, admite isso explicitamente: "escala mantida no tamanho nativo do rip... sem aplicar ainda a escala nova de Rookie").

**Recomendação para a decisão do fundador:** subir a escala nativa é condição **necessária, mas não suficiente**. Sem aumento de escala, nem a via manual com infinitas horas de polimento nem a via PixelLab com geração ilimitada conseguem adicionar bandas de sombreado, expressão facial ou luz de cena que não cabem em 30–48px — isso é limite físico de pixel, não de técnica. Com o aumento de escala, ainda será preciso redesenho real (não reescalonamento, como o próprio documento já avisa) mais a técnica híbrida (PixelLab para direções/poses novas + polimento manual de peso/cauda/paleta) para ter chance real de aproximar 9/10. Um piloto no tamanho novo (44–52px) é o próximo teste que falta antes de qualquer decisão de produção em escala — hoje ninguém testou se o problema é só "faltam pixels" ou se também é "falta técnica de sombreado por banda", e as duas coisas custam tempo/geração diferentes.

---

## 8. Limitações deste QA

- Não testei attack/hurt/victory/defeat nem as outras 6 direções (E/N/NE/NW/SE) — fora do escopo deste piloto, conforme o próprio README de game-art já registra.
- As notas da seção 6 avaliam só os 3 critérios do §8 diretamente aplicáveis a este piloto (animação, identidade, consistência de Digimon); não avaliei design/expressividade de personagem jogável (Tamer), cenário, UI nem integração com gameplay — nenhum desses foi entregue neste piloto.
- A comparação com Drakantos (seção 7) é qualitativa, por inspeção visual de 2 frames de evidência já existentes no estúdio (`evidence/drakantos-video/`) contra os quadros deste piloto — não é uma medição de pixel-a-pixel de altura em tela, que exigiria o vídeo completo e a resolução de câmera do Drakantos (não disponível aqui).
- Upload temporário ao PixelLab (`get_upload_url`) foi usado só para inspeção ampliada read-only (`pixelart_workbench inspect`, sem custo de geração); os arquivos expiram em 3 dias no PixelLab e não alteram nada em `phase2/art/`.
- Não tenho acesso de escrita fora de `quality-overhaul/phase2/qa/` — nenhuma arte foi tocada, conforme escopo da tarefa.
