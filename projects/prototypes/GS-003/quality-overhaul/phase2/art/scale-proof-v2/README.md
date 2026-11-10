# Prova de escala v2 — por que o v1 saiu ruidoso, e a correção

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-10
- **Pedido que autoriza esta tarefa:** revisão do coordenador `game-studio` sobre a prova v1 (`ce83237`), apontando que o Guilmon 60×68 em `scale-proof/board/proportion_board.png` saiu ruidoso — manchas, preto salpicado, sem clusters de cor limpos, rosto e barriga perdendo leitura. `game-qa` revisava `QA_SCALE_PROOF.md` em paralelo.
- **Revisão independente:** este diretório fica pronto para o `game-qa` revisar — eu não aprovo meu próprio protótipo (ADR-012 §3). **Nada aqui foi integrado ao jogo.**
- **Teto de geração autorizado:** 8 (total, cobrindo os dois métodos testáveis + animação do vencedor). **Gasto real: 5,2** (`pixellab_cost_log.csv`; `get_balance` antes = 16,0, depois = 10,8). **Zero regenerações.**

## 1. Diagnóstico — a hipótese do coordenador estava certa

Inspecionei a referência que o v1 enviou ao `create_character(v3)` (`scale-proof/reference/guilmon_S_ref_2x.png`, nearest-upscale ×2 do frame nativo `CREATURE-0003_walk_S_01.png`, 30×34→60×68) e o resultado `south` do v1 lado a lado, via `pixelart_workbench inspect`. **Achado 1:** o `south` do v1 é quase idêntico pixel a pixel à referência (mesma paleta de 11-12 cores, mesmas posições) — o `create_character(v3)` com referência mantém a direção `south` "como desenhada", não a redesenha do zero. **Achado 2:** o frame nativo 30×34 do rip já carrega dither/ruído de 1-2px por pixel (comum em sprites DS pequenos — confirmei via `pixelart_workbench clusters`: 79 clusters de cor no sprite nativo, 46 deles com ≤2px). Isso é invisível a olho nu em 30px, mas o nearest-upscale ×2 transforma cada pixel de ruído num **bloco 2×2 visível** em 60×68 — exatamente a "textura" que o coordenador suspeitou. Como o `south` herda a referência quase sem alteração, o ruído aparece ali diretamente; nas outras 7 direções (geradas do zero pelo v3 a partir dessa referência "suja"), o mesmo padrão de ruído se espalha porque é o estilo que a referência ensina.

**Conclusão: a causa raiz não é o `create_character(v3)` nem a escala 60×68 em si — é a referência conter ruído de origem que o upscale geométrico amplifica.** Corrigir isso não exige trocar de ferramenta nem de método; exige limpar a referência antes.

## 2. Método — M2 (mesma ferramenta do v1, referência tratada)

1. Upload da referência nearest×2 do v1 para o `pixelart_workbench`.
2. `repair()` — **gratuito.** Resultado inesperado e revelador: o próprio `repair` detectou o padrão de blocos 2×2 como "drift de grade" (`regrid: 2`) e **desfez o upscale sozinho**, devolvendo o sprite nativo 30×34 limpo (mais 1 buraco de transparência corrigido).
3. `reduce_colors` (0,1 geração) duas vezes sobre o nativo 30×34: 11→8→**4 cores** (preto/contorno, vermelho escuro, vermelho claro, bege da barriga). Isso funde os clusters de dither de 1-2px em regiões planas maiores — os clusters de cor caíram de 79 para 38, a maioria dos remanescentes já sendo formas anatômicas reais (sombra da garra, marca do peito), não ruído.
4. `repair()` de novo — score 98/100, nada mais a corrigir.
5. Reescalei essa referência **limpa** 30×34 para 60×68 com o mesmo script puro-stdlib do v1 (`scripts/nearest_upscale.py`, reaproveitado sem alterar — nearest-neighbor, sem IA, sem interpolação, sem custo).
6. `create_character(mode="v3", reference_image_url=<referência limpa 60×68>, n_directions=8)` — **1 geração** (`ceil(60*68*8/65536)=1`), size omitido de propósito, igual ao v1.
7. `animate_character(mode="template")` para `breathing-idle` (4 quadros) e `walking` (6 quadros), direções S e SW, `ai_freedom=0` — **4 gerações**, mesma receita do v1.
8. **Total: 5,2 gerações** (0,2 de limpeza de referência + 1 personagem + 4 animação). Log completo em `pixellab_cost_log.csv`.

## 3. M1 (Pro Flash por texto) — por que não foi gerado

Antes de gastar qualquer geração em M1, consultei `get_pro_flash_capabilities(operation="character", width=64, height=64, n_directions=8)` — **chamada gratuita.** Resultado: **piso de 6 gerações** (5 pela imagem + 1 pela rotação) só para ter o personagem completo em 8 direções, e o mesmo **piso de 5 gerações** vale para uma única imagem estática via `create_image_pro_flash` (o custo de Pro Flash é fixo por faixa de tamanho, não varia com o que está sendo pedido). Com o teto total de 8 gerações desta prova e a animação completa do método vencedor custando 4 (igual ao M2), testar M1 por completo — ou mesmo uma amostra estática de 1 direção — não cabia no orçamento junto com entregar a animação completa pedida (idle+walk, S+SW) do método que fosse vencedor.

**Decisão de diretor:** como o M2 já confirmou a hipótese e resolveu o problema por ~1,2 geração (contra o piso de 5-6 do M1), priorizei entregar o M2 **completo e correto** dentro do teto, em vez de rodar os dois métodos pela metade e estourar ou zerar o orçamento de animação. Isto é uma leitura de custo, não uma avaliação de qualidade do M1 — não tenho evidência de que M1 seria melhor ou pior, só que seu piso de preço (fixo, independente do resultado) não cabe neste teto junto com a entrega completa pedida. **Recomendação:** se o fundador quiser a comparação M1 vs M2 de verdade, é um teste dedicado de ~6 gerações (cabe num teto normal de 8-10 só para ele) numa sessão futura — não precisa reautorizar esta prova.

## 4. Avaliação como diretor de arte

**O ruído desapareceu — não é só "menos ruído", é zero ruído de dither nos locais testados.** Comparei lado a lado (ver `board/compare_scale_v2.html` §2-3): o `south` do v2 tem exatamente as mesmas 4 cores da referência limpa (nenhum pixel extra adicionado pelo v3 além do contorno), contra as 12 cores com manchas espalhadas do v1. A barriga volta a ler como uma forma única (com a marca do peito desenhada como um detalhe intencional, não como ruído aleatório), e o rosto (olhos, focinho) fica legível sem os pontos pretos salpicados que o coordenador apontou.

**O south-west genuíno (nunca existiu no rip, gerado do zero pelo v3) manteve a melhora.** Diferente do south (que o v3 praticamente copia da referência), o SW é pintado do zero a partir do "estilo" que a referência ensina — e mesmo assim saiu limpo (18 cores, mas organizadas em regiões coerentes de sombra/luz, não em ruído disperso). Isso confirma que o problema realmente estava na referência "ensinando" ruído como textura, e não em alguma limitação do v3 em manter consistência entre direções.

**As 4 animações (idle+walk, S+SW, 20 quadros no total) mantiveram a limpeza em todos os quadros, sem deriva de identidade perceptível e sem regeneração necessária** — mesmo resultado "zero defeitos" que o v1 já tinha reportado (a diferença entre v1 e v2 está na limpeza dos pixels, não na estabilidade entre quadros, que já era boa nos dois).

**O que esta prova NÃO testou (ver limitações):** M1 (Pro Flash por texto, decisão de custo documentada acima); as outras 6 direções além de S/SW; attack/hurt; qualquer criatura além do Guilmon; e — mais importante — **se a mesma limpeza de referência (`repair` + `reduce_colors`) resolveria o mesmo tipo de ruído em criaturas sem um frame nativo tão "limpo de pose" quanto o do Guilmon** (Dorumon/Tentomon não têm um frame S de pé tão claro, ver `scale-proof/README.md` §6).

## 5. Veredito

**M2 (referência limpa, mesma ferramenta do v1) resolve o problema relatado pelo coordenador, por um custo marginal (~1,2 geração a mais que o v1 original gastaria).** Recomendo: (a) adotar esta limpeza de referência (`repair` + `reduce_colors` antes do nearest-upscale) como passo padrão em qualquer prova de escala futura que parta de um rip nativo pequeno, documentando-o em `ART_DIRECTION_V2.md` §1.4; (b) manter a pendência de um teste M1 dedicado como item de backlog, não como bloqueio desta aprovação; (c) encaminhar este diretório para `game-qa` revisar antes de qualquer integração — a decisão de escala nativa oficial em `ART_DIRECTION_V2.md` §1.4 permanece como estava na prova v1 (a prova v2 resolve a *qualidade* da arte, não muda a *escala* recomendada).

## 6. Entregas neste diretório

```
reference/guilmon_S_clean_30x34.png       — referência nativa 30x34 limpa (repair + reduce_colors, 4 cores)
reference/guilmon_S_ref_clean_2x.png      — referência final enviada ao PixelLab (60x68, nearest x2 da limpa)
pipeline-m2/rotations/{south,south-west}.png — rotações geradas (60x68)
pipeline-m2/{idle-s,idle-sw,walk-s,walk-sw}/frame_NNN.png + *.gif — animações geradas (template mode)
board/proportion_board_v2.png             — prancha de proporção: tile 32px · Tamer · Guilmon rip · v1 (ruidoso) · v2 (limpo), x3, base alinhada
board/compare_scale_v2.html               — comparação ao vivo no navegador, v1 x v2 lado a lado (rotação + 4 GIFs) + explicação da causa raiz
board/ref/                                — cópias locais (tile, Tamer, rip, v1 south+GIFs) usadas na prancha/HTML, auto-contido
pixellab_cost_log.csv                     — log de custo, get_balance antes/depois, todas as 7 chamadas custeadas
license.json                              — base ADR-007/009/010/012, origem do rip, pipeline de limpeza da referência, obrigação de crédito
```

## 7. Limitações

- Testei só **1 criatura (Guilmon)**, 1 direção de referência de entrada (S), 2 das 8 direções animadas (S/SW), 2 dos 4+ estados (idle/walk, não attack/hurt) — mesmo escopo do v1, para permitir comparação direta.
- **M1 não foi gerado** (decisão de custo, §3) — não há evidência direta de como ele se compara ao M2 nesta prova; só a evidência indireta de que seu piso de preço fixo (5-6 gerações) não permitiria uma entrega completa dentro deste teto.
- A limpeza de referência (`repair` + `reduce_colors`) foi testada em **1 frame de entrada já com pose clara** (de pé, de frente). Não testei se o mesmo pipeline de limpeza funciona igual de bem num frame de entrada mais ambíguo ou com uma pose pior — mesma ressalva que o v1 já tinha feito.
- Não recalculei o custo por criatura completa (8 direções × 4 estados) com o passo extra de limpeza de referência — a limpeza em si é barata (0,2 geração, quase todo o custo é tempo de chamadas de ferramenta gratuitas), então a estimativa de custo do v1 (`scale-proof/README.md` §4-5) deve seguir válida, só com ~0,2 geração a mais por criatura.
- `game-qa` ainda não revisou nada disto.
