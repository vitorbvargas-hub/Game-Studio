# Prova de escala — Guilmon em resolução nativa maior (~64px de corpo)

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-10
- **Pedido que autoriza esta tarefa:** revisão do piloto comparativo anterior (`../README.md`, commit `19b6507`) pelo coordenador `game-studio`, no âmbito de GS-008/GS-010 (Quality First), trabalho autorizado pelo fundador nesta noite.
- **Revisão independente:** este diretório fica pronto para o `game-qa` revisar — eu não aprovo meu próprio protótipo (ADR-012 §3). **Nada aqui foi integrado ao jogo** (isso é do `game-dev`, depois da minha aprovação e do QA).
- **Teto de geração autorizado:** 8. **Gasto real: 5** (`pixellab_cost_log.csv`; `get_balance` antes = 21, depois = 16). **Zero regenerações** — a primeira geração de cada direção/animação já manteve identidade estável, diferente do piloto anterior (que registrou deriva de identidade num quadro do idle em 48×48px).

## 1. Pergunta que esta prova responde

O piloto anterior (`19b6507`) comparou técnica (à mão vs PixelLab) mas manteve a **escala nativa do rip** (~24–32px). A revisão do coordenador apontou que, nesse tamanho, não sobra pixel para respiração, peso corporal ou expressão no nível do Drakantos (personagens de ~48–64px, `evidence/drakantos-video/`). Esta prova testa a hipótese: **gerar o mesmo Guilmon em resolução nativa maior (~56–64px de corpo) produz detalhe real (não só um sprite "maior"), mantendo a identidade oficial?**

## 2. Método

1. **Referência de entrada:** o frame `CREATURE-0003_walk_S_01.png` (30×34px, pose de pé/idle do rip, direção S — único frame "de frente" que existe, obrigatório para `create_character` modo v3) foi **reescalado nearest-neighbor ×2** (sem IA, sem interpolação — cada pixel vira um bloco 2×2) para **60×68px**, com um script Python puro-stdlib (`scripts/nearest_upscale.py`, sem PIL/ImageMagick disponíveis neste ambiente — decoder/encoder PNG escrito à mão usando só `zlib`/`struct`). Essa imagem é a referência `reference/guilmon_S_ref_2x.png`.
   - **Por que nearest-upscale e não a pose de batalha nativa (75px)?** A pose de batalha do rip (`CREATURE-0003_battle_idle_SW_*.png`) é a única arte nativa do Guilmon acima de 64px, mas está desenhada em **SW** (3/4), não de frente — `create_character` modo v3 exige referência "de frente" (vira a direção Sul automaticamente); usá-la geraria todas as 8 direções deslocadas em 45°. A alternativa seria modo `pro` (aceita qualquer ângulo), mas custa 10–25 gerações só para o personagem, estourando o teto de 8 desta prova sozinho. O nearest-upscale do frame S existente foi a opção dentro do teto autorizado.
2. **`create_character(mode="v3", reference_image_url=<referência 60×68>, n_directions=8)`** — **1 geração** (`ceil(60*68*8/65536)=1`). `size` foi **omitido de propósito**: a documentação da ferramenta diz que, com referência, "size omitido usa as dimensões da referência" — testado e confirmado: o personagem saiu em 60×68px, não no 30×34 nativo. Resultado: 8 direções reais, incluindo uma **SW genuína** (nunca existiu no rip).
3. **`animate_character(mode="template")`** para `breathing-idle` (4 quadros) e `walking` (6 quadros), direções S e SW, `ai_freedom=0` (rígido, para minimizar deriva de forma) — **4 gerações** (1 por direção×animação; o plano trial só permite 1 geração simultânea, por isso 4 chamadas sequenciais em vez de 2 chamadas com 2 direções cada).
4. **Total: 5 gerações.** Log completo em `pixellab_cost_log.csv`.

## 3. Entregas neste diretório

```
reference/guilmon_S_ref_2x.png     — referência enviada ao PixelLab (60x68, nearest x2 do frame S nativo)
scripts/nearest_upscale.py         — upscaler PNG puro-stdlib usado para gerar a referência (sem PIL/ImageMagick no ambiente)
pipeline-b64/rotations/{south,south-west}.png — rotações geradas (60x68)
pipeline-b64/{idle-s,idle-sw,walk-s,walk-sw}/frame_NN.png + *.gif — animações geradas (template mode)
board/proportion_board.png         — prancha de proporção: tile 32px · Tamer · Guilmon rip (atual) · Guilmon 64 (esta prova), mesmo fator de escala, base alinhada
board/compare_scale.html           — comparação ao vivo no navegador, mesmo multiplicador de pixel em toda a página (sem distorcer proporção)
board/ref/                         — cópias locais do tile e do Tamer usados na prancha (auto-contido, sem depender de paths fora deste diretório)
pixellab_cost_log.csv              — log de custo, get_balance antes/depois
license.json                       — base ADR-007/009/010/012, origem do rip, obrigação de crédito
```

## 4. Avaliação como diretor de arte

**A hipótese se confirma: resolução nativa maior produz detalhe real, não um sprite ampliado.** A referência de entrada (nearest ×2) é deliberadamente "feia" — pixels em blocos 2×2, nenhum detalhe novo. O resultado do PixelLab **não** manteve esses blocos: redesenhou a silhueta em 60×68px com antialiasing próprio, separando visualmente o focinho da cabeça, os dois olhos, a faixa clara do peito e as garras das quatro patas — nenhum desses elementos é legível como forma distinta no rip 30×34 original. Isso é a diferença entre "upscale" (que o jogo já faz hoje, sem ganho nenhum de informação) e "redesenho guiado por referência em resolução maior" (o que esta prova testou).

**Identidade e consistência quadro a quadro: sem defeitos, nos 20 quadros gerados.** Inspecionei visualmente as 8 rotações e todos os quadros das 4 animações (4+4 de idle, 6+6 de walk) — cor (vermelho/preto característico), olho amarelo, garras brancas e proporção de corpo se mantiveram estáveis em todos eles. **Isso contrasta com o piloto anterior**, que registrou um quadro do idle (S, 48×48px) com silhueta visivelmente mais fina — sintoma de deriva de identidade. Hipótese [H] para a diferença: o canvas maior (60×68 vs 48×48) dá mais pixels por detalhe anatômico, reduzindo o espaço para o gerador "perder a forma" entre quadros; não testei o suficiente para confirmar isso como regra geral (amostra de 1 criatura, 2 animações).

**SW continua sendo o ganho estrutural, agora em resolução maior.** Como no piloto anterior, a direção SW gerada é uma pose 3/4 coerente (nunca existiu no rip em nenhuma resolução) — mas agora em 60×68px ela também carrega o mesmo nível de detalhe novo da direção S, não é um reaproveitamento.

**O que esta prova NÃO testou (ver limitações):** attack/hurt, as outras 6 direções, qualquer outra criatura do roster, e principalmente — **o teto do que o v3 consegue "inventar" a partir de uma referência pobre.** O frame de entrada aqui já tinha a pose certa (de pé, já clara); não testei o caso mais difícil (uma referência de baixa resolução com uma pose ambígua ou mal desenhada).

## 5. Decisão de escala nativa oficial (ver `../../ART_DIRECTION_V2.md` §1.4 para o texto completo)

Com base nesta prova, a recomendação de escala nativa por porte passa a ter **evidência de viabilidade técnica**, não só a lógica de proporção já documentada em `ART_DIRECTION_V2.md` §1.2. Resumo (detalhe completo e custo por criatura em `ART_DIRECTION_V2.md` §1.4):

| Porte | Altura nativa alvo | Confirmado nesta prova? |
|---|---|---|
| Rookie (Guilmon) | **60–64px de corpo** (prova usou 68px de canvas / ~62px de corpo útil) | **Sim** — este documento |
| Tamer | 52–60px | Não — prova não cobriu o Tamer; mesma técnica deve se aplicar (ver `ART_DIRECTION_V2.md` §1.4) |
| Bebê/In-Training, Champion, Mega | ver tabela §1.2 | Não — extrapolação lógica da mesma proporção, não testada |

## 6. Limitações

- Testei só **1 criatura (Guilmon)**, 1 direção de referência (S), 2 das 8 direções animadas (S/SW), 2 dos 4+ estados (idle/walk, não attack/hurt). A validade para o resto do roster (Dorumon, Tentomon — sem `battle_*` nativo em alta resolução, ao contrário de Guilmon/Agumon) **não foi testada**: essas espécies não têm uma referência de entrada equivalente ao frame S do Guilmon em qualidade comparável, e podem se comportar diferente.
- A referência usada foi um **nearest-upscale ×2 de um frame já limpo e numa pose clara** (de pé, de frente). Não testei o caso mais exigente: uma referência ambígua, mal recortada ou numa pose complexa — é possível que a taxa de deriva de identidade suba nesses casos, mesmo em resolução maior.
- Canvas final (60×68) ficou **abaixo do teto superior da faixa-alvo** (56–64px de corpo — o resultado tem corpo útil ~62px dentro do canvas 68px, então está dentro da faixa, mas não testei o limite superior ~64px de canvas puro nem valores maiores (80–96px) que a correção de escala do Rookie em `ART_DIRECTION_V2.md` §1.2 também permite).
- Custo por criatura completa (8 direções × 4 estados, nesta escala) seguiria a mesma ordem de grandeza já estimada no piloto anterior (`../README.md` §4) — não recalculei aqui porque a prova cobriu só 2 direções × 2 estados; ver `ART_DIRECTION_V2.md` §1.4 para a atualização desse número com o dado desta prova.
- `game-qa` ainda não revisou nada disto.
