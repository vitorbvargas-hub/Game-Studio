# ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1 — Etapa 6, Comando 3, passo 3 de 7

- **Autor:** game-design (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1: Tamer redesenhado 36–50 px, personalizável; personagens do anime não são modelo obrigatório, podem virar NPC ou skin futura por decisão posterior).
- **Base lida:** `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6 (regras do motor R1–R6, pivô, direções, quadros, checklist I-01..I-16); `TAMERS_V13.md` (histórico real: 12 presets, 8 direções geradas no PixelLab, só 4 usadas no runtime); `COMPARATIVO_ESCALAS_E1_E5.md` (achado: nenhum fator inteiro resolve Tamer/tile com o sprite de 34 px — por isso D1 redesenha, em vez de reescalar); `ESCALA_E5_POR_ESPECIE_V1.md` (faixa do Tamer usada como referência de hierarquia para as demais espécies).
- **Regra respeitada:** **nenhum sprite é gerado ou produzido nesta entrega.** Este documento é o contrato visual e técnico que qualquer método de produção (A/B/C) terá de atender — não é a produção em si. Nenhum código, mapa, Database ou configuração alterado; nenhuma geração PixelLab; nenhum commit; nenhum outro agente acionado.

## 0. O que D1 decide e o que esta entrega propõe

**D1 decide:** o Tamer é redesenhado, conteúdo de 36–50 px, com personalização limitada (aparência, cabelo, roupas, acessórios, cores); personagens do anime não são modelo básico obrigatório — podem ser NPC, e skin/cosmético é decisão **futura**, não desta rodada.

**Esta entrega propõe (tudo [H], a validar):** a contagem de camadas, o número de opções por camada, a convenção de recolor, as direções/animações mínimas, o pivô e a regra de consistência entre camadas — ou seja, **o contrato**, não os valores finais de produção. Nenhum desses números é definitivo; todos entram no mesmo regime de teste que `ESCALA_E5_POR_ESPECIE_V1.md` §6 propõe para a escala por espécie.

## 1. Quadro (frame)

- **Conteúdo:** 36–50 px de altura, conforme D1.
- **Canvas:** maior que o conteúdo, para dar margem a cabelo alto, chapéu ou arma erguida sem cortar — proposta de 2 bandas de canvas, a escolher conforme o conteúdo-alvo final decidido dentro da faixa de D1:

| Conteúdo-alvo (dentro de 36–50 px) | Canvas proposto | Margem livre |
|---|---|---|
| 36–42 px | 48×48 px | ≥6 px de topo, suficiente para a maioria dos cabelos/chapéus |
| 43–50 px | 56×56 ou 64×64 px | ≥6–14 px de topo, necessário para acessórios maiores (armas erguidas, cabelo longo solto) |

- **Nota técnica (não é regra do motor, é restrição de ferramenta):** o motor não exige múltiplo de 4 px (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 3). Se a produção usar o PixelLab (Método B/C), o canvas final precisa ser múltiplo de 4 **por restrição da ferramenta**, não do jogo — registrado aqui para quem for produzir, não é uma regra que este documento impõe por si.
- O conteúdo real (altura de pixels opacos) continua sendo medido pela mesma convenção já usada em toda a Etapa 6 (bounding box opaco no quadro idle/frente-sul).

## 2. Camadas

Ordem de composição, de trás para frente (z-index crescente):

| # | Camada | Conteúdo | Observação |
|---|---|---|---|
| 0 | Sombra | Elipse no pé, sempre presente | Não é customizável pelo jogador; segue o pivô (§6) |
| 1 | Corpo | Base anatômica + tom de pele | Camada obrigatória, sempre visível nas partes não cobertas por roupa |
| 2 | Roupa inferior | Calça/perna | Desenhada sobre o corpo |
| 3 | Roupa superior | Camisa/jaqueta | Pode cobrir parte da roupa inferior (cintura) |
| 4 | Cabelo | Estilo + cor | Proposta MVP: 1 camada única de cabelo, desenhada sobre a cabeça. Refinamento futuro [H, não MVP]: separar em `cabelo_trás` (abaixo do corpo, para tranças/rabo longo) e `cabelo_frente` (acima da cabeça) — acrescenta complexidade de composição sem benefício comprovado para o elenco inicial; registrado como opção, não adotado |
| 5 | Acessório | Chapéu, arma empunhada, mochila | Camada mais externa; pode exigir deslocamento (offset) próprio por quadro, se for empunhado (ex.: arma que se move com o braço durante `walk`) |

**Regra de composição:** todas as camadas (exceto sombra) compartilham o **mesmo canvas e o mesmo pivô** (§6) em cada quadro — a composição final é empilhar as 6 camadas, na ordem acima, sem deslocamento relativo entre elas, salvo o caso explícito do acessório empunhado.

## 3. Quantidade de opções por camada [H, a validar]

Proposta de MVP (elenco mínimo testável, não o catálogo final):

| Camada | Nº de estilos propostos | Recolor | Nota |
|---|---|---|---|
| Corpo (tom de pele) | 4–6 | — (a cor já é a variação) | Não é "estilo × cor"; a própria variação de tom é a opção |
| Cabelo | 6–8 estilos | Sim, por rampa (§4) | Cada estilo aceita qualquer rampa de cor cadastrada — não é 1 geração por combinação estilo×cor |
| Roupa superior | 4–6 estilos | Sim, por rampa | Idem |
| Roupa inferior | 4–6 estilos | Sim, por rampa | Idem |
| Acessório | 4–6 opções, incluindo "nenhum" | Parcial (alguns acessórios podem ser monocromáticos por design, ex.: metal) | "Nenhum" é sempre uma opção válida, sem custo de produção |

**Por que separar estilo de cor:** é o que torna a personalização viável em custo — cada estilo é **1 produção de arte** (nas 4 direções × animações mínimas, §5), reutilizada por **N cores via recolor** (§4), em vez de **1 produção por combinação estilo×cor**. Sem essa separação, o espaço combinatório (6–8 cabelos × N cores × 4–6 roupas × N cores × ...) tornaria a personalização inviável em qualquer dos 3 métodos.

## 4. Cores por paleta e recolor por rampa

- Cada camada customizável (cabelo, roupa superior, roupa inferior, e os acessórios que aceitarem cor) tem **1 arte-base** desenhada com uma **rampa de cor fixa** (ex.: 3–4 tons: realce / base / sombra / contorno-adjacente), em zonas de cor **chapadas** (sem gradiente pintado à mão, sem dithering) — exigência direta, porque recolor por rampa só funciona de forma limpa sobre cor indexada/chapada, nunca sobre pixel art com degradê (o mesmo defeito que já reprovou a Fase 0 do ChatGPT, `RELATORIO_AVALIACAO_ASSETS_FASE0.md`, por "sombreamento em degradê redondo").
- **Recolor:** trocar a paleta de uma camada (ex.: cabelo castanho → cabelo azul) é uma operação de mapeamento de cor sobre a arte já pronta (equivalente ao que `pixelart_workbench`/`reduce_colors` já fazem, grátis, sem gerar nada de novo) — **não** é uma nova geração por cor.
- **Proposta de catálogo de rampas [H]:** 6–10 rampas pré-definidas por camada customizável (ex.: para cabelo: preto, castanho, ruivo, rubro, azul, verde, branco/grisalho), reutilizáveis entre **todos** os estilos daquela camada — uma rampa "vermelho" funciona em qualquer estilo de cabelo, sem redesenho.
- **Contorno:** preservado da arte-base, nunca recolorido junto — regra já em vigor no Style Bible para não quebrar a leitura de silhueta ao trocar cor.

## 5. Direções e animações mínimas

- **Direções, MVP: 4 (S, N, W, E).** O runtime hoje só monta 4 direções mesmo quando o PixelLab gera 8 (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 4: as diagonais dos 12 presets v13 nunca são usadas). Propor 8 direções para o Tamer personalizável, sem antes decidir mudar o código que consome isso, gastaria produção sem efeito em jogo — por isso a proposta de MVP fica em 4, com a opção de 8 registrada como melhoria futura condicionada a uma mudança de código (fora do escopo deste documento, é decisão de `game-dev`/fundador).
- **Animações mínimas, por camada, por direção:**
  - `idle`: ≥1 quadro (o Tamer v13 usa 4, respiração) — proposta MVP: reaproveitar o mesmo padrão de 4 quadros de respiração já testado e aprovado.
  - `walk`: ≥2 quadros por direção, ideal 4 (padrão já exigido pelo motor para personagem, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.3.1).
- **Decisão central de custo — animar por camada, não por combinação final:** cada camada (corpo, cabelo, roupa superior, roupa inferior, acessório) precisa ser animada **independentemente**, com a **mesma pose por índice de quadro** entre todas as camadas (ex.: o quadro 2 do `walk` sul do cabelo mostra a cabeça na mesma posição que o quadro 2 do `walk` sul do corpo) — isso é o que permite compor em tempo real qualquer combinação de estilo/cor sem multiplicar o custo de produção pelo número de combinações. A alternativa (animar o personagem já composto, por combinação) escala multiplicativamente (estilos de cabelo × estilos de roupa × ...) e é descartada aqui por inviabilidade de custo, não por preferência estética.

## 6. Pivô

- **Pivô no pé** (convenção já em vigor no motor, R3 de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2.1): centro da linha de pixels opacos mais baixa do quadro.
- **Regra adicional, específica de personalização:** o pivô é **o mesmo valor, no mesmo quadro, em todas as camadas** — não há pivô "do cabelo" separado do pivô "do corpo". Isso é o que garante que empilhar as camadas (§2) não precise de nenhum ajuste de posição por camada em tempo de execução; a composição é sempre "desenhar as 6 camadas na mesma origem".
- Variação do pé entre quadros de uma mesma animação: ≤1 px (mesmo critério já usado para os Digimon, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.3.1, L4).

## 7. Regra de consistência entre camadas por quadro

1. **Canvas e pivô idênticos** em todas as camadas, em todo quadro (§1/§6) — sem exceção.
2. **Pose compartilhada por índice de quadro:** todas as camadas de um mesmo Tamer, numa mesma direção e animação, devem ser produzidas a partir da **mesma referência de pose** por quadro (ex.: mesmo esqueleto/pontos-chave, ou a mesma técnica de "transferir para a mesma pose" usada em outras ferramentas do pipeline) — nunca camadas geradas de forma independente e depois "encaixadas por olho".
3. **Z-order fixo entre quadros:** a ordem de desenho (§2) não muda de quadro para quadro dentro da mesma animação/direção (ex.: o cabelo-frente, se existir no futuro, nunca passa a desenhar atrás da cabeça só num quadro específico).
4. **Acessórios empunhados são a única exceção com deslocamento próprio:** um acessório que a mão segura (arma, item) pode ter um deslocamento (offset) próprio por quadro, para acompanhar o movimento do braço durante `walk`/`idle` — mas esse deslocamento precisa estar documentado por quadro (uma tabela de offsets), não aproximado visualmente.
5. **Sem física independente no MVP:** cabelo solto, capa ou acessório pendurado **não** recebem animação própria de "balanço" independente da pose do corpo nesta rodada — eles seguem rigidamente a silhueta do quadro de corpo/pose. Física de cabelo/capa fica registrada como [PROPOSTA] futura, não MVP, para evitar o risco de "derivar" entre camadas que o Método A já documentou como ponto fraco em animações (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §1.1).

## 8. Regra para skins futuras de personagens do anime — só registro

Conforme D1 ("personagens do anime não são modelos básicos obrigatórios; podem aparecer como NPCs e, no futuro, como skins ou cosméticos, por decisão posterior"): este documento **não implementa, não produz e não autoriza** nenhuma skin de personagem do anime. O único compromisso desta especificação é **técnico**: se o mesmo contrato de camadas/pivô/canvas (§1–§7) for seguido, uma eventual skin futura de personagem do anime poderia, em princípio, encaixar no mesmo sistema de composição (um "estilo" alternativo de corpo+roupa+cabelo, como qualquer outro) — **sem** precisar redesenhar o pipeline inteiro. Isso é um registro de compatibilidade, não uma promessa de produto, não um compromisso de prazo, e não uma decisão de quais personagens, se algum dia autorizados.

## 9. O que cada método (A/B/C) precisaria produzir — Tamer base + 2 variações

**Escopo de teste:** 1 Tamer base (todas as camadas, estilo "padrão") + 2 variações, entendidas aqui como **2 presets alternativos completos** (1 combinação diferente de estilo/cor por camada cada), não a grade combinatória inteira do §3 — é o mesmo recorte de teste pequeno que o resto do laboratório usa (briefing único, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §2).

### Método A — ChatGPT + ferramentas gratuitas

- Cada camada (corpo, cabelo, roupa superior, roupa inferior, acessório) do Tamer base precisaria passar pelo fluxo completo A1–A8 já descrito em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.4 (recuperar grade, reduzir a 1:1, paleta, recorte/transparência, pivô/canvas, direções/quadros, montagem de folha, manifesto) — **separadamente por camada**, porque o ChatGPT não gera "camadas alpha" nativamente; cada camada sairia como uma ilustração isolada a converter.
- Para as 2 variações, a camada que muda (ex.: roupa superior com outro desenho, não só outra cor) repetiria o fluxo A1–A8 do zero; a camada que só muda de cor poderia, em teoria, ser recolorida manualmente no Aseprite sem regerar a ilustração — mas isso exige que a 1ª versão já tenha sido limpa para cor indexada (§4), senão o recolor manual herda o problema de "sombreamento em degradê" já documentado na Fase 0.
- **Estimativa de esforço:** por camada, algo entre as faixas já estimadas para um prop/sprite pequeno (0,6–1,7 h de conversão) e um personagem completo (9,5–20,5 h, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.4) — a camada "corpo" (que inclui toda a animação de base) é a mais cara; camadas de roupa/cabelo, sendo menores em área, tendem para a faixa baixa, mas multiplicadas por 5 camadas × 4 direções × 2 animações, o total por Tamer completo fica da mesma ordem de grandeza do Tamer inteiro já estimado (13,5–32,5 h), **repetido por cada camada** — ou seja, o Método A é o que escala **pior** com personalização em camadas, porque cada camada precisa do pipeline manual completo.

### Método B — PixelLab

- O PixelLab **não tem uma ferramenta nativa de "camada alpha separável"** — suas ferramentas fortes (`create_character`, `create_character_state`) produzem um **personagem composto inteiro** por chamada, não uma camada isolada. `create_character_state` (variante preservando identidade) é a ferramenta mais próxima do conceito de "variação", mas gera o **sprite completo já composto**, não uma camada de roupa/cabelo sozinha.
- **Consequência prática:** a forma natural de usar o PixelLab para este contrato é gerar **N presets completos** (como já foi feito com os 12 presets do Tamer v13) — cada preset é 1 Tamer base + roupa + cabelo já compostos numa única imagem — em vez de um verdadeiro sistema de camadas independentes recompostas em tempo real. Isso **funciona** para "Tamer base + 2 variações" como 3 presets completos (repetindo o padrão v13: `create_character` por descrição + `animate_character`/`mirror_animation` para direções/animações), mas **não constrói**, por si só, o sistema de camadas que §2–§7 descrevem.
- **Para obter camadas reais via PixelLab**, seria necessário um passo extra não nativo: gerar os presets completos e depois **extrair** regiões (ex.: recortar só a roupa com uma máscara, via `inpaint_image`/edição manual) — trabalho de recorte que o PixelLab não automatiza, equivalente a montar uma biblioteca de camadas "de trás para frente" a partir de resultados já compostos.
- **Estimativa de esforço (presets completos, não camadas reais):** análoga ao histórico real do Tamer v13 — ~7,2 gerações por preset já com pipeline de animação calibrado (`TAMERS_V13.md`), então 3 presets (base + 2 variações) ≈ 15–25 gerações no total, dentro da mesma ordem de grandeza já projetada para 1 Tamer em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §4.1.

### Método C — Híbrido

- **É o caminho mais promissor para um sistema de camadas real, mas o mais caro em trabalho manual combinado:** usar o PixelLab para gerar o(s) preset(s) completo(s) com pose/pivô consistentes (aproveitando a robustez de animação já comprovada no Tamer v13), e então usar Aseprite/GIMP para **separar manualmente** cada preset em camadas (corpo, roupa, cabelo) alinhadas ao mesmo canvas/pivô — reconstituindo, a partir de arte já consistente, a biblioteca de camadas que nem A nem B entregam nativamente.
- Para a variação 2, a camada que muda de estilo (não só de cor) exigiria gerar um novo preset no PixelLab e repetir a extração manual; a camada que só muda de cor poderia reaproveitar a mesma extração, só trocando a paleta (§4), sem nova geração nem nova extração.
- **Estimativa de esforço:** soma o custo de geração do Método B (15–25 gerações para base + 2 variações como presets) **mais** um custo de extração manual por camada, por preset — da mesma ordem do passo A1–A5 do Método A (0,5–2 h por camada extraída, por ser trabalho de recorte sobre arte já limpa, não de pixelização do zero) — ou seja, mais barato em geração que repetir o Método A camada a camada, mas ainda com trabalho manual não trivial, concentrado na extração em vez de na pixelização.

**Leitura de conjunto:** nenhum dos 3 métodos entrega, nativamente, um sistema de camadas recompostas em tempo real — essa capacidade exigiria uma ferramenta própria (fora do escopo desta Etapa 6) ou o trabalho manual de extração descrito no Método C. O `game-studio`/fundador deve decidir, antes de qualquer produção real, se o MVP de personalização é (a) um conjunto pequeno de presets completos (mais barato, mais rápido, modelo já comprovado no v13) ou (b) um sistema de camadas de verdade (mais caro, mais flexível a longo prazo) — esta especificação cobre os dois casos de forma compatível (o contrato de §1–§7 vale para camadas reais; presets completos são um caso particular onde todas as camadas de um preset são sempre usadas juntas).

## 10. Limitações

1. **Nenhum sprite, camada ou preset foi gerado ou produzido nesta entrega** — é proibido pelo comando. Toda estimativa de esforço é extrapolação de histórico real de outros assets (Tamer v13, Fase 0), não medição direta deste contrato.
2. **Os números de §3 (quantidade de opções por camada) são ponto de partida de teste, não catálogo final** — dependem de uma decisão de produto (quantas opções o jogo realmente quer oferecer no lançamento) que este documento não tenta substituir.
3. **A viabilidade de um sistema de camadas real (vs. presets completos) não é resolvida aqui** — §9 só descreve o caminho e o custo relativo de cada método; a escolha entre as duas abordagens é do `game-studio`/fundador, com um possível spike técnico do `game-dev` antes de comprometer produção.
4. **A faixa de conteúdo (36–50 px, D1) e a escala das demais espécies (`ESCALA_E5_POR_ESPECIE_V1.md`) seguem como propostas não testadas** — este documento assume a faixa de D1 como dada (é decisão do fundador), mas não valida visualmente nenhum valor dentro dela.
5. Nenhum código, mapa, Database ou configuração foi alterado; nenhuma geração PixelLab; nenhum commit; nenhum outro agente foi acionado.
