# Comando 9 — F3: rig 2D por partes do Agumon (relatório)

**Data:** 2026-11-14 · **Autor:** game-art (sessão de retomada) · **Brief:** `../BRIEF_F3_RIG2D.md`
**Custo PixelLab:** 0 gerações. Nenhuma chamada de geração; tudo feito em Python local, sem PIL.
**Status:** entrega para validação. É uma autoavaliação, e o game-art não aprova o próprio trabalho: a validação é do game-qa e depois do ChatGPT e do fundador.

## 1. O que foi entregue

| Caminho | Conteúdo |
|---|---|
| `rig_agumon/rig_s.py` | rig da direção S: recorte em 6 partes, transformações exatas e composição; gera as 3 animações S |
| `rig_agumon/rig_e.py` | rig da direção E: 4 partes (cauda em base e ponta); gera o idle E |
| `rig_agumon/partes_S/*.png`, `partes_E/*.png` | partes recortadas do `rotations/S.png` e do `rotations/E.png` do pacote F2, em canvas 48×48 na posição original |
| `anim_idle_S/` | 6 quadros, 48×48 (`delays_ms.txt` traz o tempo de cada quadro) |
| `anim_feliz_S/` | 8 quadros |
| `anim_preparo_S/` | 6 quadros |
| `anim_idle_E/` | 6 quadros, com a cauda (bônus; o brief pedia E "se der tempo") |
| `comparativo_f3.png` | folha em 4×, uma linha por animação: v3 custom feliz, rig feliz, v3 ataque q0–4 (F2), rig preparo, rig idle S, rig idle E |
| `comparativo_f3.gif` | os mesmos 6 painéis animados lado a lado, em 4×, com o tempo real de cada quadro |
| `ref_v3_custom_feliz_1x/` | o "feliz" do v3 custom em 1×, extraído do `fase9-pixellab-d12/teste_metodos/comparativo_feliz.png` (linha 3). Só existia o comparativo ampliado, então reduzi por amostragem exata da grade 4×, sem interpolação. Script incluído; ele lê uma cópia em `workspaces/game-art/tmp/f3/` |
| `rig_agumon/comparativo.py`, `checar.py` | geram o comparativo e rodam as checagens objetivas (§3) |

Para reproduzir: `cd rig_agumon && python3 rig_s.py && python3 rig_e.py && python3 comparativo.py && python3 checar.py`.

## 2. Como o rig funciona

- **Partes (S):** cabeça (y ≤ 26), tronco, braço E, braço D, perna E e perna D. Os braços são cortados pela linha de contorno interna de cada linha, de y 30 a y 39.
- **Partes (E):** parte de cima (cabeça, tronco e braço), pernas, base da cauda e ponta da cauda.
- **Transformações permitidas:**
  - deslocamento inteiro;
  - giro exato de 90° no braço "aberto";
  - espelho vertical exato no braço "erguido", com cisalhamento inteiro de 1 px a cada 2 linhas para abrir o braço em diagonal.
  - Nada usa interpolação, rotação fracionária ou reescala.
- **Costura:**
  - quando uma parte sobe 1 px, uma cópia dela na posição de base fica por baixo e preenche a fresta. Isso duplica 1 linha na barriga ou no pescoço, sem buraco e sem cor nova;
  - onde uma peça sai do lugar e deixa a pele exposta ao vazio, o rig fecha o contorno com a cor de contorno do próprio sprite (`#0c0506`).
- **Desenho à mão (por código, pixel a pixel):**
  - **boca aberta** em 2 níveis, dentro do contorno da cabeça. As cores vêm do `attack/S` do mesmo pacote: `#7d0032`, `#860037` e língua `#ca0146`; os dentes usam o branco das garras;
  - **piscar:** a íris vira pele e a linha 17 vira contorno.

## 3. Checagens objetivas (`checar.py`)

| Animação | Cores fora da paleta do pacote | Alfa | Linha do pé (y por quadro) | Topo da cabeça |
|---|---|---|---|---|
| idle S | 0 | só 255 | 44 em todos | 10/9 (respira 1 px) |
| feliz S | 0 | só 255 | 44, 44, **41, 39, 41**, 44, 44, 44 (sai do chão só no pulo) | 10→5→10 |
| preparo S | 0 | só 255 | 44 em todos | 10→8 |
| idle E | 0 | só 255 | 44 em todos | 4/3 |

**Cabeça:** é sempre a mesma peça, sem reescala. A boca escancarada desce o queixo 1 px (y 27), mas a largura e o topo do crânio não mudam.

**Escala (G-2):** Agumon v7 com 35 px de altura (y 10–44) no canvas 48. É a mesma peça do pacote F2, então a razão para o tile 32 não muda (≈ 1,09 tile). O Tamer e o Champion não fazem parte desta entrega.

**Paleta (conflito aberto, Etapa 6):** o rig só reaproveita as cores do sprite aprovado, então herda a mesma conformidade do pacote F2: 0% Endesga-32 e 100% dentro da referência v13/v15. Não declaro conformidade com o Style Bible.

## 4. Tempo gasto (relógio do agente, sessão de retomada 11:04–11:10)

| Etapa | Tempo |
|---|---|
| Leitura do brief, triagem do `tmp/` e extração do v3 feliz em 1× | ~2 min |
| Recorte das partes S (mapa de pixels e fronteiras dos braços) | ~1 min |
| Idle S | < 1 min. Saiu na primeira tentativa |
| Feliz S | ~1 min. 2 iterações: o braço aberto subiu 1 px |
| Preparo S | ~1 min. 2 iterações: a cabeça subia 2 px e esticava o pescoço, foi reduzida para 1 px com preenchimento |
| Idle E (recorte da cauda e animação) | ~1 min |
| Comparativo, checagens e relatório | ~2 min |

**[H]** Esses tempos são de agente, não de artista humano. A sessão anterior caiu sem gravar nada em `f3/`; dela só sobrou uma cópia do `comparativo_feliz.png` e uma pasta vazia, que removi. Por isso o tempo dela não entra na conta. Para comparar: uma emoção v3 custom custa 1 geração e ~2–4 min de fila, e ainda precisa de polimento (F2 = vários passes por animação).

## 5. Notas (0–10, autoavaliação — precisa da validação do game-qa)

| Animação | v3 custom | Rig 2D | Comentário |
|---|---|---|---|
| Idle S | — (não existe idle v3) | **7,5** | Respiração limpa, pés fixos, identidade 100% intacta e piscar convincente. A cauda não aparece no S, então não balança nessa direção. |
| Idle E | — | **7,5** | A cauda balança 1 px na ponta e na base. É sutil e funciona em loop, mas fica rígida: são só dois segmentos. |
| Feliz S | **8,0** (o "melhor" do teste de métodos, log 07:00) | **6,5** | O rig preserva o rosto e o tamanho da cabeça. No v3, a boca escancarada redesenha o rosto: a cabeça parece maior nos quadros 4–6 [H — não consegui medir, porque os braços erguidos entram no recorte da cabeça]. Ganha muito em expressão. No rig, os braços em giro de 90° e o erguido por espelho ficam mecânicos, com a sombra invertida no braço erguido. A boca é pequena e não há squash. O v3 tem pernas abertas no ar e uma pose de corpo inteiro que o rig não consegue fazer. |
| Preparo S | **7,5** (q0–4 do `attack/S` F2: anima a pose, mas já mistura o fogo) | **6,0** | De frente, "inclinar para trás" quase não aparece com deslocamento puro: vira a cabeça subindo 1 px. A antecipação (agachar) e a boca abrindo em 2 tempos funcionam. Ficaria melhor na direção E, que não fiz. |

## 6. O que ficou bom e o que ficou ruim

**Bom**
- Custo zero, determinístico e reprodutível: o mesmo script gera o mesmo resultado.
- Nenhum drift de identidade: olhos, cabeça e paleta são idênticos ao sprite aprovado. É exatamente o problema que mais pesou nos v3, como a cabeça que cresce no andar lateral.
- Pés travados por construção, sem os passes de "colar o pé" da F2.
- Idle, respiração, piscar e balanço de cauda saem quase de graça e ficam com qualidade de jogo.

**Ruim**
- Mudanças grandes de pose (pulo com pernas abertas, braços em diagonal, corpo torcendo, boca muito aberta) ficam duras. Sem redesenhar peças à mão, o rig só tem o repertório "caído, aberto e erguido".
- Em sprite de 35 px, deslocar 1 px já é muito. Não existe meio-termo sem interpolação, então o movimento fica em degraus.
- A sombra não acompanha a peça girada ou espelhada: a luz inverte no braço erguido. Corrigir exige retoque manual por peça.
- Profundidade (inclinar para trás de frente) não dá para fazer com translação 2D.

## 7. Reaproveitamento em outras espécies

- **Motor (`compose`, `shift`, costura de fresta e fechamento de contorno, boca e piscar parametrizados):** ~80% reaproveitável sem mudança.
- **Recorte por espécie:** manual. É preciso definir as fronteiras das partes em cada direção, ~5–10 min de agente por direção. O Agumon S levou ~1 min porque o contorno dele é bem fechado.
- **Bípedes (Koromon não, Greymon sim):** idle, piscar, respiração e preparo saem com o mesmo script.
- **Quadrúpedes (Gomamon, Ikkakumon) [H]:**
  - funciona bem para idle com respiração do tronco, cabeça balançando, cauda ou nadadeira em 2 segmentos e piscar;
  - **não funciona** para o andar: 4 patas em fase alternada pedem peças de pata em várias poses, ou seja, desenho à mão.
  - O Ikkakumon com chifre e a traseira baixa (pedido do fundador) é um bom candidato para idle por rig.
- **Babies (Koromon, Bukamon), corpo único:** o rig vira squash/hop por deslocamento. Bom para idle, mas não tem partes para articular.

## 8. Recomendação

**O rig complementa o v3 custom, não o substitui.**
- **Rig 2D (custo 0):** idle, respiração, piscar, balanço de cauda, hit-flinch curto, os quadros de antecipação antes do ataque v3 e loops de espera. Em resumo, todo movimento pequeno em que a identidade importa mais que a pose.
- **v3 custom + polimento (Método A):** mudanças grandes de pose (pulo feliz, ataque com efeito, andar e qualquer animação de quadrúpede que mexa as patas).
- **Híbrido sugerido (decisão do fundador ou do ChatGPT):** usar o rig para gerar o quadro de antecipação e o idle e o v3 só para o miolo do golpe. Isso reduz gerações e fixa a identidade nos quadros que aparecem por mais tempo na tela.

## 9. O que **não** foi feito

- Direção E de feliz e preparo (só o idle E). Direções N e W não foram feitas.
- Nenhum quadro foi redesenhado à mão em pose nova (braço diagonal real, perna aberta). Isso subiria a nota do feliz, mas é trabalho de pixel artist por peça.
- Não houve integração no jogo nem nos Links (proibido pelo brief). Os pacotes F2 não foram tocados: só leitura.
- Não houve avaliação por sessão separada: as notas do §5 são provisórias até o game-qa avaliar.

## 10. Decisões que dependem do fundador e do ChatGPT

1. Adotar o rig como padrão para idle e piscar das espécies já aprovadas, e com isso definir o escopo do híbrido.
2. Se vale investir em peças redesenhadas à mão (braço erguido com a luz correta, boca grande) para ampliar o repertório do rig.
