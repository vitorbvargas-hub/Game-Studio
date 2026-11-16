# QA independente da F3: rig 2D do Agumon

**Data:** 2026-11-14 · **Autor:** game-qa · **Custo PixelLab:** 0
**Objeto:** `f3/` (entregue pelo game-art às 11:08–11:11). Hash combinado dos 26 quadros `anim_*/frame_*.png`: `sha256 63e4258b…49ec17`. A pasta `fase12-comando9/` está **fora do git** (`?? ./`), então não há commit a citar.
**Lido:** `RELATORIO_F3.md`, `../BRIEF_F3_RIG2D.md`, `rig_agumon/rig_s.py`, `rig_e.py`, `checar.py`, `comparativo_f3.png`.
**Legenda:** [E] executado nesta auditoria · [L] dado do relatório, não reverificado · [H] hipótese · NÃO VALIDADO.

**Método.** Escrevi um verificador próprio com decodificador PNG/GIF, sem PIL e sem reaproveitar o `pxpng` nem o `checar.py` do game-art. Ele fica em `workspaces/game-qa/scripts/qa_f3/` (`qa_f3.py`, `sheet.py`). O resultado bruto está em `scripts/qa_f3/out/qa_f3_resultado.json`, e as folhas ampliadas em 8× em `scripts/qa_f3/out/anim_*_8x.png`. Não rodei os scripts do rig, porque eles reescrevem os quadros em `f3/`.

## 1. Regras do brief

| Regra | Status | Evidência |
|---|---|---|
| Sem interpolação, borrão ou meia-transparência | **Cumpre** [E] | Alfa só 0 ou 255 em todos os 26 quadros. Nenhuma cor nova (ver abaixo). |
| Só deslocamentos inteiros | **Cumpre, com uma interpretação** [E] | Leitura do código: o rig também usa giro exato de 90°, espelho vertical e cisalhamento inteiro nos braços. Nada é interpolado e as peças vêm do próprio sprite, o que se encaixa na cláusula "troca de quadro de parte". Em leitura literal ("só deslocamentos"), o giro e o espelho ficam fora. **A coordenação decide se aceita.** |
| Sem reescala | **Cumpre** [E] | O crânio (linhas ≤ 22 do `rotations/S`) aparece **100% idêntico pixel a pixel**, com deslocamento inteiro, em todos os quadros, menos os de piscar (0,90 e 0,94, só nos pixels dos olhos). A largura da cabeça é de 18 px nos 8 quadros do feliz. |
| Sem cor fora da paleta do sprite | **Parcial (P3)** [E] | Nenhuma cor fora do pacote F2 (rotations + attack/S). Mas a boca usa `#7d0032`, `#860037` e `#ca0146`, que **não existem em `rotations/S`**: vêm do `attack/S` do mesmo pacote. O piscar do idle E usa `#0c0506` e `#f0af32`, que **não existem em `rotations/E`** (o contorno de E é `#000000` e a pele é `#efaa2b`); vêm de `rotations/S`. Visualmente não se distinguem, mas pela letra do brief ("paleta do sprite") são cores fora da direção. |
| Pé fixo, exceto no pulo | **Cumpre** [E] | Linhas 41–47 com **0 pixels diferentes** do sprite base em todos os quadros do idle S, idle E e preparo, e nos quadros 0, 1 e 5–7 do feliz. Só os quadros 2–4 do feliz saem do chão (pé em y 41, 39 e 41). |
| Cabeça sem mudar de tamanho | **Cumpre** [E] | O crânio não muda. Com a boca escancarada (nível 2), a mandíbula desce 1 px (y 27), então a altura total da cabeça ganha 1 px. É mandíbula articulada, não reescala. |

## 2. Pixels copiados das folhas oficiais

**Não encontrei cópia** [E]. Comparei todas as janelas 4×4 com pelo menos 3 cores e 10 pixels opacos (2.496 janelas, dos quadros do rig e das partes) contra as 13 imagens de `f1/imagens/oficiais/`, num total de ~304 mil janelas. Resultado: **0 janelas iguais** e no máximo 1 cor RGB em comum por folha. Limite: do GIF do DW3 só comparei o primeiro quadro. A origem de todo pixel é o `rotations/S|E` do pacote F2 (gerado pelo PixelLab), mais os pixels desenhados por código (boca e piscar).

## 3. Notas (0–10)

**Régua:** leitura em jogo a 1× e a 4×, clareza da pose, identidade preservada e ausência de defeitos (luz, contorno, rigidez). As notas valem para a **referência aprovada v13/v15**. Pelo **Style Bible** a nota não foi dada: a paleta herdada tem 0% de Endesga-32 [L, relatório F2], e esse é o conflito G-1, ainda aberto e não resolvido aqui.

| Animação | v3 custom | Autoavaliação do rig | **QA do rig** | Motivo da nota do QA |
|---|---|---|---|---|
| Idle S | — | 7,5 | **7,5** | Respiração de 1 px limpa, braços com atraso de 1 quadro, pés travados e piscar legível. É usável em jogo. |
| Idle E | — | 7,5 | **7,0** | A cauda mexe 1 px e quase não se nota a 1×; fica rígida em 2 segmentos. O piscar é bom, mas tem as cores de S (§1). |
| Feliz S | 8,0 [L]; o QA concorda: **8,0** | 6,5 | **6,0** | O braço "aberto" por giro de 90° vira um toco horizontal e o "erguido" por espelho inverte a luz [E visual, 8×]. O corpo sobe rígido, sem pernas abertas e sem squash, e a boca é pequena. O v3 tem uma pose de corpo inteiro muito mais expressiva. |
| Preparo S | 7,5 [L]; o QA dá **7,0** (como preparação: q0–1 quase parados e o fogo já em q2–4) | 6,0 | **5,5** | Não lê como "inclinar para trás": a cabeça sobe 2 px e estica o pescoço, e termina em pose de "T" com os braços na horizontal. Só os quadros 1–2 (agachar + boca nível 1) funcionam como antecipação. |
| **Média do rig** | | 6,9 | **6,5** | |

**Correção a uma hipótese do relatório** [E]: o §5 sugere que no v3 a cabeça "parece maior" nos quadros 4–6. Medi a largura do crânio (linhas topo..topo+9, trecho contínuo no centro) e deu **18 px em todos os 9 quadros** do `ref_v3_custom_feliz_1x`, a mesma do rig. A hipótese não se sustenta para a largura. A altura do rosto com a boca aberta não foi medida. O que o v3 tem de fato é variação de cores entre quadros (50–59 cores por quadro, contra 59–62 estáveis no rig) [E], ou seja, ele redesenha.

## 4. Recomendação: "complementa, não substitui"

**Concordo, com uma ressalva.**
- **Idle, respiração e piscar:** o rig é adequado e tem custo 0, com identidade e pés garantidos por construção [E]. Concordo.
- **Antecipação:** concordo **só com o trecho curto** (agachar 1 px + boca abrindo, quadros 1–2 do preparo). O preparo completo, como foi entregue (5,5), não está pronto para uso. O híbrido "antecipação do rig → miolo do v3" é plausível, porque as cores da boca já vêm do `attack/S` [H]. Mas a emenda entre os dois não foi testada: **NÃO VALIDADO**.
- **Pulo, ataque e andar:** o v3 continua necessário (o feliz do rig, com 6,0, perde para o do v3, com 8,0).

## 5. Problemas

| Sev. | Problema | Evidência | Caminho de correção |
|---|---|---|---|
| P2 | Braço erguido por espelho inverte a luz; braço aberto por giro de 90° vira toco | `scripts/qa_f3/out/anim_feliz_S_8x.png`, quadros 2–5 | Peças de braço redesenhadas à mão (pixel), com a luz correta |
| P2 | O preparo não comunica recuo e termina em pose de "T" | `anim_preparo_S_8x.png`, quadros 3–5 | Cortar para 2–3 quadros (agachar + boca) ou fazer na direção E |
| P3 | Cores fora da paleta da direção: boca (S) e piscar (E) | `qa_f3_resultado.json`, campo `cores_fora_sprite_base` | Decidir se "paleta do sprite" = pacote. Se não for, usar em E o `#000000` e o `#efaa2b` de `rotations/E` |
| P3 | Giro e espelho vão além de "só deslocamentos" numa leitura literal | `rig_s.py`, `rot90_out` e `flip_up` | Decisão de interpretação da coordenação |

## 6. O que não foi validado

- **Reprodutibilidade e determinismo** dos scripts do rig: não rodei, porque eles sobrescrevem `f3/anim_*`.
- **`comparativo_f3.gif`:** só conferi que existe (1536×280, GIF89a). Não validei o tempo dos quadros nem a sincronia. O `.png` foi inspecionado visualmente.
- **Tempos gastos (§4 do relatório):** [L], não verificáveis.
- **Extração do v3 em 1×:** conferi só o alfa binário e as medidas, não a fidelidade ao comparativo original.
- **Comportamento no jogo:** fora do escopo.

## 7. Decisões para o fundador e o ChatGPT

1. Aceitar giro de 90°, espelho e cisalhamento inteiros como "deslocamento permitido" no rig.
2. Definir "paleta do sprite" como paleta da direção ou paleta do pacote.
3. Adotar o rig para idle e piscar, e limitar a antecipação do rig a 1–2 quadros antes do v3.

**Não alterei** nenhum arquivo além deste. Os scripts e as saídas de QA ficam no workspace do game-qa.
