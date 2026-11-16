# Protocolo de teste F5 — Retro Diffusion × ChatGPT→PixelLab (personagem original)

**Digital Odyssey (GS-003) · game-research · 2026-11-15 · status: PROTOCOLO, nada executado**
0 gerações, 0 créditos, sem conta, sem login, sem envio de imagem. Fonte de preços e recursos: `DOC_RETRO_DIFFUSION_2026-11-15.md`.
Objetivo: comparar os dois métodos de forma **justa** — a mesma arte-base de entrada, os mesmos parâmetros de saída, as mesmas métricas.

## 1. Personagem de teste: "Vernix" (ORIGINAL, não Digimon, não Pokémon, não licenciado por terceiros)

**Por que um personagem novo e não o Agumon/Hawkmon:** o fundador autorizou o teste do Retro Diffusion, não o reenvio de uma espécie Digimon a mais um serviço externo sem os termos lidos (risco já registrado em `RELATORIO_F5.md` de 14/11 e ainda **NÃO VALIDADO**, `DOC_RETRO_DIFFUSION_2026-11-15.md` §6). Um personagem 100% original elimina esse risco **para os dois pipelines** (o mesmo personagem roda em ambos, conforme o brief pede).

### 1.1 Descrição (para o prompt do ChatGPT e para qualquer humano avaliar fidelidade/consistência)

**Vernix** — pequena criatura bípede original de corpo rechonchudo, altura-alvo **≈ 38 px de arte** (comparável a um Digimon Rookie/Child no padrão do estúdio, sem ser nenhuma espécie existente):
- Corpo verde-musgo com a barriga e o peito em um tom creme mais claro.
- Cabeça grande em relação ao corpo, olhos grandes e redondos de cor âmbar, boca pequena e discreta.
- Dois braços curtos e arredondados, três dedos cada.
- Duas pernas curtas e firmes, pés largos de três dedos, sem calçado.
- **Cauda** longa e afunilada, com uma pequena protuberância arredondada de cor laranja na ponta (não é fogo nem cristal — um nódulo liso, para evitar qualquer leitura como "chama na cauda" de uma espécie conhecida).
- **Duas pequenas saliências dorsais** nas costas, lisas e arredondadas, do tamanho de um polegar — **não são asas funcionais, não abrem, não batem**: servem só para dar à anatomia o elemento "cauda/asas" pedido no brief, sem sugerir voo nem copiar nenhum design de dragão ou réptil conhecido.
- Sem marcas, símbolos, armaduras ou acessórios. Sem nome de marca, sem referência visual a qualquer franquia.
- Nenhuma semelhança pretendida com qualquer Digimon, Pokémon ou outra propriedade de terceiros. Se algum avaliador (ChatGPT, Vitor, game-art) perceber parecença acidental com uma espécie protegida, isso deve ser corrigido antes do teste avançar — ver §6.

### 1.2 Prompt de criação (etapa 2, no ChatGPT) — mesmo formato do método de referência

Reaproveitando a estrutura do `METODO_CHATGPT_PIXELLAB_v1.md` (etapa 2), troca-se só o conteúdo do personagem:

```
Create ONE image, 1536x1024, landscape.
Content: an ORIGINAL pixel-art creature called "Vernix" — a small, round, bipedal creature, NOT based on any existing franchise.
Moss-green body, cream-colored belly and chest, large round amber eyes, short rounded three-fingered arms, short sturdy three-toed legs, no shoes.
A long tapering tail ending in a smooth, rounded orange bump (not fire, not a crystal, not spiky).
Two small smooth rounded bumps on the back, like thumbs, NOT functional wings, they do not open or flap.
No armor, no symbols, no accessories, no clothing.
4 standing poses side by side in a single row, same size, same ground line:
1 = front (facing the viewer), 2 = back, 3 = facing left, 4 = facing right.
Left and right drawn separately, not mirrored. Neutral standing pose, both feet on the ground.
Camera: top-down RPG view, 3/4 low top-down, like classic GBA monster RPGs.
Pixel art rules: strict grid, every art pixel an exact 8x8 block; character about 38 art-pixels tall; NO anti-aliasing, blur, gradients, glow, halo or painted shadow; max 24 flat colors; dark 1-pixel outline; light from the top-left, 2-3 tones per color.
Background: one flat solid #FF00FF everywhere; no checkerboard, ground, text, labels, grid lines or watermark.
```

**Nota:** diferente do Hawkmon, não há Etapa 0 (Reference Gate) nem fichas de anatomia oficiais a seguir — "Vernix" não precisa de verificação de fidelidade a nenhuma fonte, porque é original. O protocolo `GS-003-DIGIMON-REFERENCE-GATE` (GD-072) **não se aplica** a este personagem.

## 2. Entradas iguais para os dois pipelines

1. O ChatGPT gera **uma única** folha de 4 poses (S/N/W/E) de Vernix, com o prompt acima.
2. **O mesmo pipeline de limpeza do método de referência** (etapa 3 do `METODO_CHATGPT_PIXELLAB_v1.md`) prepara as 4 rotações: recorte, `unzoom_image`, remoção do fundo magenta (flood fill), redução para **60×60 px com âncora (29,5; 49)**, `correct_pixelart` **antes** de `reduce_colors` (ordem obrigatória, lição já registrada).
3. Essas **4 rotações limpas e idênticas** (mesmos 4 PNGs, 60×60, fundo transparente) são a entrada de **ambos** os pipelines a partir daqui. Nenhum dos dois métodos redesenha a pose inicial — cada um só anima ou gera direções a partir dela.

Isso garante comparação justa: a diferença medida é **só** entre "o que o PixelLab faz a partir desta pose" e "o que o Retro Diffusion faz a partir desta mesma pose", não entre duas artes-base diferentes.

### 2.1 Ajuste de canvas só para o Retro Diffusion `rotate`

`rd_advanced_animation__rotate` exige tamanho **múltiplo de 8** (`DOC_RETRO_DIFFUSION_2026-11-15.md` §3.2); 60×60 não serve diretamente. Para esse passo específico, a pose S (ou a que for usada como base) é centralizada em **64×64** (margem transparente, sem reescalar — mesma técnica usada no Agumon em 14/11, `RELATORIO_F5.md` §1.4). `walking` e `idle` (Advanced Animations fora do `rotate`) aceitam 32–256 px sem exigência de múltiplo de 8, então podem usar 60×60 direto ou também 64×64, para manter os três passos no mesmo canvas. **Decisão de execução:** usar 64×64 em todo o lado Retro Diffusion do teste, e reconverter para 60×60/âncora (29,5;49) só na limpeza final, para igualar ao formato de saída do jogo.

## 3. O que cada pipeline produz (mesmo escopo: 4 rotações, walk 8q, idle 4q)

### 3.1 Pipeline A — ChatGPT → PixelLab (referência, já medido no Hawkmon v2)

Segue exatamente as etapas 3–8 do `METODO_CHATGPT_PIXELLAB_v1.md`:
- Personagem v3 a partir das 4 rotações desenhadas (`create_character` v3 com `reference_image` + `direction_images`).
- Walk 8 quadros e idle 4 quadros **por direção** (v3 custom), limpeza com `reduce_colors` usando a rotação como paleta, correção de âncora.
- **Custo já medido no Hawkmon:** 14,55 gerações PixelLab (0,8 limpeza + 0,25 personagem + ~13,5 animação), sem contar correções gratuitas. Para Vernix, o custo esperado é da mesma ordem [H, por analogia — Vernix tem anatomia mais simples que o Hawkmon (sem penas, sem leque), então é plausível (não garantido) que fique no mesmo teto ou abaixo].

### 3.2 Pipeline B — ChatGPT → Retro Diffusion (o que este protocolo testa)

A partir das mesmas 4 rotações limpas (64×64 para este lado, §2.1):

| Passo | Ferramenta Retro Diffusion | Entrada | Parâmetros | Preço unitário |
|---|---|---|---|---|
| 1. Direções extras (comparação) | `rd_advanced_animation__rotate` | 1 rotação (S), 64×64 | `return_spritesheet: true` (folha 3×3) | US$ 0,10 |
| 2. Walk — direção S | `rd_advanced_animation__walking` | rotação S, 64×64 | `frames_duration: 8` | US$ 0,14 |
| 3. Walk — direção N | `rd_advanced_animation__walking` | rotação N, 64×64 | `frames_duration: 8` | US$ 0,14 |
| 4. Walk — direção E | `rd_advanced_animation__walking` | rotação E, 64×64 | `frames_duration: 8` | US$ 0,14 |
| 5. Walk — direção W | `rd_advanced_animation__walking` | rotação W, 64×64 | `frames_duration: 8` | US$ 0,14 |
| 6. Idle — direção S | `rd_advanced_animation__idle` | rotação S, 64×64 | `frames_duration: 4` | US$ 0,14 |
| 7. Idle — direção N | `rd_advanced_animation__idle` | rotação N, 64×64 | `frames_duration: 4` | US$ 0,14 |
| 8. Idle — direção E | `rd_advanced_animation__idle` | rotação E, 64×64 | `frames_duration: 4` | US$ 0,14 |
| 9. Idle — direção W | `rd_advanced_animation__idle` | rotação W, 64×64 | `frames_duration: 4` | US$ 0,14 |
| 10. Limpeza (recorte 60×60, âncora 29,5;49, paleta) | scripts locais (grátis) + Background Remover/Color Reducer do RD | saídas 2–9 | — | US$ 0,00–0,01 cada (Color Reducer é grátis no site) |

**Subtotal, 1 tentativa cada, sem repetição:** 0,10 + (4 × 0,14) + (4 × 0,14) = **US$ 1,22**. Detalhe do orçamento com repetições de contingência em `ORCAMENTO_E_RISCOS_F5.md`.

**Por que não gerar a pose base no Retro Diffusion:** o brief pede comparação a partir da **mesma** arte-base ChatGPT nos dois pipelines — gerar a pose em RD Core/RD Pro também criaria uma terceira arte-base, fora do escopo de "entradas iguais".

**O que o passo 1 (`rotate`) testa, que os passos 2–9 não testam:** se o Retro Diffusion consegue inferir as outras 7 vistas a partir de 1 pose só, como alternativa a desenhar as 4 poses no ChatGPT. Não é necessário ao protocolo mínimo (já temos as 4 vistas do ChatGPT), mas responde a uma pergunta extra do comando original (F5, "produz várias direções?") com o **mesmo personagem**, de forma barata (US$ 0,10). Pode ser cortado do teste sem prejuízo do restante, se o orçamento for o fator limitante.

## 4. Formato de saída (igual para os dois pipelines, para comparação pixel a pixel)

- Canvas final: **60×60 px**.
- Âncora (ponto de pé/base de sombra): **(29,5; 49)** — mesma convenção do método de referência.
- Fundo transparente.
- Walk: 8 quadros por direção. Idle: 4 quadros por direção. 4 direções (S, N, E, W).
- Paleta: reduzida com `reduce_colors` (PixelLab) ou Color Reducer (Retro Diffusion), usando a rotação limpa como referência de cor em ambos os casos, para não introduzir uma variável de paleta diferente entre os dois métodos.

## 5. Métricas (mesma régua de 8 critérios do QA do Hawkmon v2)

Reaproveitando a régua de `QA_HAWKMON_V2_INDEPENDENTE.md` §8, que por sua vez é a régua da fase21, para permitir comparação direta entre os três conjuntos de notas já existentes (A–D da F4/F5 de 14/11, Hawkmon v2, e agora Vernix/Retro Diffusion):

| # | Critério | O que medir em Vernix/RD |
|---|---|---|
| 1 | Fidelidade (ao desenho-base do ChatGPT, já que não há "espécie oficial") | O quanto a rotação/animação do RD se parece com a pose desenhada, não com uma espécie — comparar cor, proporção, silhueta contra a rotação de entrada |
| 2 | Qualidade visual GBA Plus | Pixel limpo, sem semitransparência, sem AA, paleta consistente |
| 3 | Fluidez (cadência) | ms/quadro, px/quadro, quadros pulados — mesmos scripts do game-dev/game-qa (`tools/h143/walk.mjs`, `analisa.mjs`), adaptados ao pacote de Vernix |
| 4 | Consistência anatômica | Cauda, saliências dorsais e silhueta geral iguais entre quadros da mesma animação e entre direções; bbox por quadro (igual ao método do §3 do QA do Hawkmon, que achou a cintilação do visor) |
| 5 | Legibilidade | Silhueta reconhecível em 1× e 4×, distinta de qualquer outro personagem do build de teste |
| 6 | Custo e tempo | Gerações PixelLab (pipeline A) vs. US$ gastos no Retro Diffusion (pipeline B) — ver `ORCAMENTO_E_RISCOS_F5.md`; tempo de agente em cada pipeline |
| 7 | Transições | Entrada/saída da animação no meio do ciclo, mesmo teste do build isolado |
| 8 | Ausência de regressões | Isolamento do build de teste (não aplicável se o teste ficar só em arquivos PNG/GIF fora do jogo, sem build) |

**Nota sobre o critério 1:** como Vernix não é uma espécie com referência oficial, "fidelidade" aqui significa **fidelidade à pose desenhada no ChatGPT**, não fidelidade a uma franquia. Isso é uma diferença metodológica importante a declarar no relatório ao ChatGPT: a nota de fidelidade de Vernix **não é diretamente comparável** à nota de fidelidade do Hawkmon (que mede fidelidade à espécie oficial). É comparável, sim, a nota de **consistência entre quadros/direções** (critério 4) e a de **fluidez** (critério 3), que são as métricas realmente "justas" entre os dois pipelines.

## 6. Checagem de originalidade (antes de qualquer execução)

Antes de pedir ao ChatGPT a arte de Vernix, ou depois de recebê-la, confirmar visualmente que:
- Não há semelhança com nenhuma espécie Digimon conhecida (nem Botamon/Koromon/Tanemon e outros bebês verdes genéricos, nem nenhum Rookie réptil/dragão conhecido).
- Não há semelhança com nenhum Pokémon conhecido (o risco mais provável, dado "corpo verde, cauda com bola na ponta" lembrar superficialmente alguns designs populares de criaturas-fogo/planta). Se a primeira versão lembrar demais algo existente, pedir uma nova versão ao ChatGPT com ajustes de cor/proporção antes de seguir.
- Isso é uma checagem de **leitura visual humana** (Vitor, game-art ou o próprio ChatGPT), não uma garantia jurídica — registrar a checagem no relatório ao fundador antes de considerar Vernix "original aprovado para o teste".

## 7. O que este protocolo NÃO cobre

- Não cobre o ataque (`attack`/`custom_action`) — o brief pede só 4 rotações, walk 8q e idle 4q, igual ao escopo atual do método de referência (Hawkmon v2 também não tem ataque ainda).
- Não cobre a integração no jogo nem um build isolado — os resultados do Retro Diffusion ficam em arquivos (PNG/GIF) para comparação visual e de métricas, a menos que o fundador autorize depois um build de teste.
- Não decide "adotar", "combinar" ou "descartar" — isso é decisão do fundador após ver `RELATORIO_PARTE_B.md` e o orçamento.
