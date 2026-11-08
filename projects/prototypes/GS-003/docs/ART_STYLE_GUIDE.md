# ART_STYLE_GUIDE — GS-003 Idle MMORPG pixel art

- **Autor:** game-art · **Data:** 2026-11-08 · **Base de decisão:** ADR-009 (reset do GS-003), `docs/briefing/01_GS001_creature_world_foundation.md`, imagem conceito do fundador (`art/reference/concept-founder/concept_world_and_creature.png`), `docs/WORLD_COMBAT_VISUAL_SPEC.md` (game-dev), `docs/TECH_AUDIT.md` (game-dev).
- **Substitui:** a direção de `art/PIXEL_ART_DIRECTION.md` (ByteLine-18, 48×48 fixo, pipeline paramétrico com `fillEllipse`/`fillPolygon`) como referência ativa de produção. Aquele documento fica retido como histórico — o fundador rejeitou a abordagem paramétrica depois de ver os 6 briefings e a imagem conceito (daí o "reset" do ADR-009). Este guia é o que vale a partir de agora.
- Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/decisão de direção não validada com jogador real.
- **Atualização do fundador (2026-11-08, repasse inter-sessão via `agent:game-studio:main`):** a regra 2 do ADR-007 (proibição de rips oficiais) foi revogada — sprites oficiais de Digimon World DS/Dawn/Dusk e PMD Chunsoft estão liberados como **base inicial** do projeto, a ser substituída aos poucos por arte própria (`ASSET_LICENSE_POLICY.md` §3, camada `official-fan-use`). Esta seção e as §2–§3 abaixo já incorporam essa mudança. Ainda não existe ADR-010 formalizando isso em `shared/decisions/` — ver nota de rastreabilidade em `ASSET_LICENSE_POLICY.md`.

---

## 1. Identidade: "Idle MMORPG pixel art"

Um mundo top-down 3/4 vivo e colorido (vegetação, água, pedras, construções), com criaturas pequenas e expressivas que lutam **no próprio mapa**, nunca numa tela de batalha separada (`WORLD_COMBAT_VISUAL_SPEC.md`). A combinação de referências (ADR-009):

| Fonte | O que entra na direção de arte | O que **não** entra |
|---|---|---|
| **IdleDex** | Estrutura de gameplay/UX (loop idle, progressão, retenção) — não é referência visual de pixel art. | Nenhum asset, nome de espécie ou tela copiada — `REFERENCE_LIBRARY.md` já registra risco de IP altíssimo do IdleDex. |
| **Drakantos** (Wingeon) | Composição de **mundo**: densidade de vegetação, água, construções, profundidade de cena, ciclo dia/noite, acabamento "AA indie" top-down. Verificado por inspeção visual de 2 imagens do press kit nesta sessão **[E, 2026-11-08]**: `mohazus.png` (dungeon) e `human_kingdom.png` (salão) — ambas mostram pixel art de alta densidade, com sombreamento suave em múltiplos tons por cor e **sem contorno preto grosso** (separação de formas vem de contraste de cor, não de outline). | Paleta específica, sprites, UI ou qualquer asset do jogo — é referência de **composição de mundo**, não de técnica de contorno das criaturas (ver §4; nosso contorno é mais forte, para combinar com a imagem conceito, não com Drakantos). |
| **Guilmon / Digimon World DS** | Linguagem visual, personalidade e expressividade das criaturas — silhueta arredondada, olhos grandes, poses "fofas mas com presença". | Nenhum sprite oficial é copiado, traçado ou usado como asset — ver `ASSET_LICENSE_POLICY.md` e `FAN_SPRITE_SOURCES.md`. |

**Leitura da imagem conceito do fundador [E, 2026-11-08, inspecionada nesta sessão]:** mundo top-down 3/4 com grama, árvores grandes multi-tile, arbustos, flores, rio, ponte de madeira, placa de madeira, cerca — várias criaturas pequenas (coelho rosa, gato azul, roedor amarelo, broto verde, gato branco) e 3 Tamers. No centro, uma criatura vermelha estilo Guilmon (corpo vermelho, barriga/garras creme, olhos verdes, orelhas triangulares) em combate **no mapa** contra uma criatura azul/verde tipo tartaruga, com **barras de HP flutuando sobre as duas** (verde e vermelha) e um efeito de impacto simples entre elas — confirma visualmente a regra "combate no próprio mapa" do ADR-009. A ficha inferior mostra o mesmo dino vermelho em: walk (5 frames), idle sentado, comendo, rugido/ataque com rastro de movimento, corrida/salto, dormindo enrolado, e 2 poses de evolução com brilho — confirma os estados pedidos (idle, walk, eat, attack, hurt-adjacent, sleep, evolution).

---

## 2. Resolução e grade

| Item | Valor | Justificativa |
|---|---|---|
| **Tile base** | **32×32 px** | Ver análise abaixo. |
| **Resolução interna de tela** | Múltiplo de 32 (ex.: 384×216 ou 480×270, a confirmar com game-dev conforme o viewport real do Canvas 2D custom — `docs/TECH_AUDIT.md` usa um renderer próprio, não mais o `BattleRenderer` 320×180 do protótipo antigo) | A tela antiga (320×180) era dimensionada para a cena de batalha separada que o ADR-009 descartou; o novo renderer de mundo (chunks, culling, ordenação por Y) não tem esse teto. |
| **Escala de tela** | Fatores inteiros apenas (×2, ×3, ×4...), nearest-neighbor, sem blur | Regra herdada de `PIXEL_ART_DIRECTION.md` §2 — continua válida, é independente da resolução de tile escolhida. |

### Por que 32px e não 16px

- **16px** é a grade clássica de Pokémon/PMD (era o padrão do pipeline `art/src/pmd/`, calibrado sobre a referência de formato do fundador) e funcionaria para ícones de UI, mas é **pequena demais para o nível de detalhe que a imagem conceito do fundador mostra**: a criatura vermelha tem orelhas, listras, barriga diferenciada, garras e expressão facial legíveis mesmo pequena — isso exige mais que 16px de grade de corpo. Testamos isso na prática: o esboço-piloto desta entrega (§7) foi autorado numa grade de 16×18 "pixels grandes" e, mesmo ampliado ×3, as pernas ficaram pouco legíveis (ver limitações, `docs/briefing` não pede perfeição aqui, mas é um sinal real de que 16px é apertado demais para a Linha B completa).
- **32px de tile** dá uma criatura Rookie em 48×48 (1,5× o tile) espaço suficiente para orelhas, listras e um rosto expressivo sem precisar de escala fracionária, e ainda é leve o bastante para um Idle MMORPG com muitas entidades simultâneas em tela (`WORLD_COMBAT_VISUAL_SPEC.md` §7 já prevê LOD visual a partir de ~60 entidades).
- **Drakantos** (referência de "acabamento") usa uma densidade de pixel art bem mais alta que 32px por tile permitiria sem um investimento de arte muito maior do que este estúdio tem orçamento para fazer à mão/por código — 32px é o meio-termo: dá para aproximar a legibilidade "fofa e expressiva" da imagem conceito sem prometer o nível de detalhe pictórico de um AA indie com artistas dedicados.
- **IdleDex** não é referência de resolução (ver tabela acima) — não pesa nesta decisão.

**Decisão: tile = 32px, grade das criaturas em múltiplos de 32 por porte (§3).** Esta é uma decisão de direção de arte **[H]**, não testada com jogador real; pode ser revisada se o game-dev reportar problemas de performance com muitas entidades em 32px.

### Alinhamento com os sprites oficiais DW DS/Dawn/Dusk (base inicial, atualização 2026-11-08)

Com a liberação dos sprites oficiais (`ASSET_LICENSE_POLICY.md` §3), eles passam a ser a **base inicial real** das criaturas, não só referência. Inspecionei visualmente nesta sessão, via `view_image`, 4 sprites Rookie oficiais da coleção preservada por AngelOfHope/With the Will (`github.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites/rookie/`) **[E, 2026-11-08]**: `Agumon.gif`, `Guilmon.gif`, `Gabumon.gif`, `Patamon.gif`.

**O que foi observado diretamente:**
- Proporção chibi acentuada — cabeça claramente grande em relação ao corpo (mais próxima de ~45–55% da altura total do que os ~35–40% do piloto desta entrega, §7).
- Contorno escuro **mais grosso/macio** do que o 1px rígido de `autoOutline()` — lê como um contorno de ~1,5–2px proporcional, não um stroke fino.
- Sombreamento em poucos tons (2–4 por cor), sem gradiente — consistente com a regra já definida em §5.
- Densidade de pixel visivelmente baixa/blocada mesmo pequena — indica resolução nativa compacta, da mesma ordem de grandeza da grade Rookie 48×48 já escolhida (não uma densidade de detalhe tipo Drakantos).

**O que não foi possível verificar [H]:** a dimensão exata em pixels de cada arquivo — `curl` para `raw.githubusercontent.com` falhou neste host (bloqueio de proxy de saída, mesmo problema já documentado em `docs/TECH_AUDIT.md` para outros domínios), então não dá para rodar `file`/medir o cabeçalho do GIF localmente; a leitura acima é visual, não uma medição em pixel. Não foi possível confirmar quantos frames de animação cada GIF contém (a inspeção mostrou uma pose por chamada).

**Decisão de alinhamento:** manter a grade de exibição do motor (tile 32px, Rookie 48×48 — §3) como o *slot* em que qualquer sprite entra, oficial ou original. Ao integrar um sprite oficial (`official-fan-use`):
1. **Não esticar/redimensionar com interpolação** — escalar só por fator inteiro com nearest-neighbor (mesma regra de §2) ou manter o tamanho nativo centralizado no frame 48×48 com padding transparente, o que preservar melhor os pixels originais.
2. **Proporção cabeça:corpo e peso de contorno dos sprites oficiais viram a referência ativa** para qualquer criatura nova em `original` (§4 do pilot, §7) — cabeça um pouco maior e contorno um pouco mais pesado do que o piloto desta entrega, para um mundo com criaturas oficiais e originais lado a lado não ficar visualmente inconsistente.
3. **Paleta de um sprite oficial não é forçada para o Endesga-32** — ele entra com as próprias cores (é o arquivo oficial, usado como está, `ASSET_LICENSE_POLICY.md` §3 regra 5); o Endesga-32 continua sendo a paleta de mundo/UI e das criaturas `original`.

---

## 3. Escala das criaturas (tile e Tamer)

| Porte | Frame nativo | Relação ao tile (32px) | Observação |
|---|---|---|---|
| **Bebê / In-Training** | 32×32 px | 1×1 tile | Formas simples, poucos detalhes finos (olhos grandes, corpo arredondado) — é o estágio mais "ícone". |
| **Rookie** | 48×48 px | 1,5×1,5 tile | Porte de referência da linha (mesma grade já usada pelo pipeline anterior em `art/src/agumon.js` etc. — mantemos por continuidade, mesmo trocando a técnica de desenho). |
| **Champion** | 64×64 px | 2×2 tile | Presença maior no mapa sem quebrar a leitura de grid (ainda múltiplo exato de 32). |
| **Tamer (jogador)** | 48×64 px | 1,5×2 tiles | Referência: na imagem conceito, os Tamers são visivelmente mais altos que as criaturas Rookie/bebê ao lado deles, mas não dominam a cena — 1,5× a largura de uma criatura Rookie e um pouco mais alto é uma leitura razoável **[H]**, não medida em pixels reais (a imagem conceito não tem grade visível para medir com precisão). |

Toda criatura usa o pivô nos pés (ver `SPRITE_SPECIFICATION.md`), então a "escala visual" relevante é a altura do sprite acima do pivô, não o frame inteiro (que pode ter folga para orelhas, cauda ou o quadro de ataque avançando).

---

## 4. Paleta

**Paleta escolhida: Lospec "Endesga 32"** (`lospec.com/palette-list/endesga-32`), verificada nesta sessão **[E, 2026-11-08]** — 32 cores, tons quentes de terra/pele, verdes de vegetação, azuis de água, cinza-azulados de UI e um acento vermelho/magenta vivo. Lista completa (hex):

```
#be4a2f #d77643 #ead4aa #e4a672 #b86f50 #733e39 #3e2731 #a22633
#e43b44 #f77622 #feae34 #fee761 #63c74d #3e8948 #265c42 #193c3e
#124e89 #0099db #2ce8f5 #ffffff #c0cbdc #8b9bb4 #5a6988 #3a4466
#262b44 #181425 #ff0044 #68386c #b55088 #f6757a #e8b796 #c28569
```

### Por que uma paleta compartilhada única (em vez de uma por linha, como o ByteLine-18 antigo)

A imagem conceito do fundador mostra um mundo e criaturas **na mesma família de cor** (verdes de grama, marrons de madeira, vermelho/creme da criatura, azuis de água) — não duas paletas competindo. Endesga-32 já cobre as três categorias (mundo, criaturas, UI) com cores que combinam naturalmente entre si, então usamos a paleta inteira como fonte única, com sub-paletas por categoria:

| Categoria | Subconjunto sugerido | Uso |
|---|---|---|
| **Vegetação/mundo** | `#63c74d #3e8948 #265c42` (verdes), `#b86f50 #733e39 #3e2731` (madeira/terra) | Grama, árvores, cercas, caminhos. |
| **Água** | `#193c3e #124e89 #0099db #2ce8f5` | Rio, lagos — do fundo escuro ao brilho da superfície. |
| **Criaturas — tons quentes** (ex. linha "réptil/fogo" como o piloto do §7) | `#e43b44 #a22633` (corpo/sombra), `#ead4aa #e4a672` (barriga/claro), `#3e2731` (marcas escuras), `#63c74d` (olhos — contraste quente/frio clássico) | Ver ficha visual piloto, §7. |
| **UI/HUD** | `#181425` (texto/contorno), `#c0cbdc #8b9bb4 #5a6988 #3a4466` (painel, cinza-azulado em 4 tons), `#ff0044` (HP crítico), `#feae34`/`#63c74d` (HP médio/alto, ver `WORLD_COMBAT_VISUAL_SPEC.md` §6: verde >50%, amarelo 25–50%, vermelho <25% — usar `#63c74d`/`#feae34`/`#ff0044`) | Barras de HP, painéis, texto. |

**Regra de uso por criatura:** no máximo 5–6 cores do conjunto de 32 por criatura (corpo base, sombra, realce/barriga, 1 cor de marca/padrão, contorno — ver §5), igual à regra antiga do ByteLine-18, só que agora todas as cores vêm do mesmo poço compartilhado em vez de uma paleta isolada por linha de produto.

---

## 5. Contorno, luz e sombreamento

1. **Contorno:** 1px, cor `#181425` (ink), aplicado como passo final sobre as regiões não-transparentes de cada frame (técnica: detectar pixels de borda e pintar — não é um "stroke" de forma geométrica; ver `Canvas.autoOutline()` em `art/src/canvas.js`, reaproveitável como utilitário de acabamento mesmo quando o corpo é desenhado por matriz de caracteres). É mais forte que o contorno quase ausente do Drakantos (§1) — de propósito: a imagem conceito do fundador tem contorno escuro visível em todas as criaturas e personagens, então seguimos a referência do próprio fundador para as criaturas, não o Drakantos (que é referência só de **mundo**).
2. **Luz:** fonte fixa **superior-esquerda** (herdado de `PIXEL_ART_DIRECTION.md`, continua válido) — realce no quadrante superior-esquerdo, sombra no quadrante inferior-direito, em toda criatura e no cenário.
3. **Sombreamento:** 2–3 tons por cor (base, sombra, realce), blocos sólidos, sem gradiente pixel a pixel suave — mantém legibilidade em 32–64px e combina com o estilo "blocado" da imagem conceito (que também lê em blocos de cor nítidos, não em gradientes pictóricos como o Drakantos).
4. **Sombra de contato:** elipse (ou banda plana simples quando a criatura for desenhada por matriz de caracteres em baixa resolução, como no piloto do §7) em `#181425` a ~25–40% de opacidade sob os pés — ancora a criatura no chão sem precisar desenhar o tile embaixo dela.
5. **Marcas/padrões (listras, manchas, placas digitais etc.):** 1 cor extra por criatura no máximo, nunca um contorno interno duro — linhas finas ou blocos pequenos de 40–60% de opacidade quando for uma "costura" (não compete com o contorno externo).

---

## 6. Regras de legibilidade no mapa

- **Silhueta reconhecível a distância de leitura de jogo** (criatura pequena rodeada de vegetação, outras criaturas e jogadores): cabeça grande, corpo simples, no máximo 2 "quebras" de silhueta por criatura (ex.: orelhas + cauda) — mais que isso vira ruído em 32–64px com várias entidades na tela.
- **Nunca** depender só de textura/padrão interno para diferenciar uma espécie de outra — a silhueta e a cor base precisam já diferenciar (padrão interno é reforço, não a informação primária).
- **Barra de HP, nome e efeitos nunca cobrem a cabeça/rosto** da criatura — ancoragem `head` fica acima do frame real (ver `SPRITE_SPECIFICATION.md` e `WORLD_COMBAT_VISUAL_SPEC.md` §6).
- **Cor de time/propriedade** (jogador local vs. selvagem vs. outro jogador) não é feita por reskin de paleta da criatura (quebraria a identidade da espécie) — usar indicadores de UI (anel no chão, cor da barra de nome) em vez de recolorir o sprite.
- Com muitas entidades em tela, criaturas pequenas (Bebê, 32px) priorizam leitura por **cor de corpo + 1 marca**, não por detalhe fino — detalhe fino fica para os quadros de UI/Pokédex-equivalente, não para o mapa.

---

## 7. Ficha visual piloto (calibração de escala e paleta)

Entregue em `art/sprites/pilot-calibration/pilot_rookie_native.png` (nativo, grade 48×54 — ver limitações) e `art/previews/pilot-calibration/pilot_model_sheet_comparison.png` (composição lado a lado com a imagem conceito do fundador + amostra de paleta). Gerado por `art/src/pilot_model_sheet.js`, reproduzível com:

```
node art/src/pilot_model_sheet.js art/sprites/pilot-calibration art/previews/pilot-calibration art/reference/concept-founder/concept_world_and_creature.png
```

**Técnica usada (obrigatória para esta entrega):** matriz de caracteres pixel a pixel — uma grade 16×18 de células, cada célula mapeada direto para uma cor da paleta via `Canvas.setPixel()`, **sem** `Canvas.fillEllipse`/`fillCircle`/`fillPolygon` para desenhar o corpo da criatura (essas são as funções "de forma paramétrica" que o fundador reprovou — ver ADR-009 e o aviso no topo deste documento). O único pós-processo usado sobre a matriz é `autoOutline()` (detecção de borda por adjacência de pixel, não uma forma geométrica) e `scaleNearest()` (replicação de pixel inteira, não reamostragem). Isso é intencionalmente **diferente** da técnica usada em `art/src/agumon.js`, `art/src/pmd/common.js` etc. (que usam elipses/polígonos) — esses arquivos continuam existindo no repositório como histórico da tentativa reprovada, mas não foram reaproveitados nesta entrega.

**O que essa ficha calibra:**
- **Escala:** confirma que uma criatura Rookie em grade ~48px lê como "pequena e redonda" ao lado da imagem conceito, sem exigir uma grade muito maior.
- **Paleta:** usa só 6 cores do Endesga-32 (`#181425` contorno, `#e43b44` corpo, `#ead4aa` creme, `#e4a672` tom, `#3e2731` marca, `#63c74d` olho) — confirma que o subconjunto "criatura quente" do §4 já produz uma leitura de cor parecida com a criatura vermelha da imagem conceito (vermelho + creme + olho verde), sem precisar inventar cores novas.

---

## 8. Checklist "não copiar"

**Não se aplica à camada `official-fan-use`** (atualização 2026-11-08) — usar o sprite oficial diretamente ali é o uso pretendido, autorizado explicitamente pelo fundador (`ASSET_LICENSE_POLICY.md` §3), não uma cópia não autorizada. Este checklist vale para a camada `original`, inclusive quando um redesenho `original` usa um personagem oficial como base de memória em vez de usar o arquivo oficial direto (§3 do § anterior, `ASSET_LICENSE_POLICY.md` §4).

Antes de qualquer sprite entrar na camada `original` ou ser usado como base de um content pack licenciado (`ASSET_LICENSE_POLICY.md`):

1. **Nenhum arquivo, imagem ou sprite de terceiro foi aberto, baixado, buscado ou rastreado** como base de traçado para a silhueta — toda forma nasce de descrição textual + memória geral de domínio público (ex.: "pequeno dino vermelho bípede, orelhas triangulares, barriga clara, olhos grandes") ou de uma matriz de caracteres desenhada à mão, nunca de "abrir a imagem X e copiar os pixels".
2. **Referências visuais (imagem conceito do fundador, press kit do Drakantos, páginas de fã de Digimon) servem só para leitura de proporção/paleta/personalidade**, nunca ficam abertas lado a lado enquanto se desenha pixel a pixel uma cópia.
3. **Nenhum nome, termo ou marca oficial de terceiros** aparece em arquivos, pastas ou documentação de um content pack `original` (nomes oficiais de Digimon só valem dentro do content pack Digimon-fan, sob a exceção explícita do ADR-007 — ver `ASSET_LICENSE_POLICY.md`).
4. **Revisão cruzada pendente:** assim como no `PIXEL_ART_DIRECTION.md` anterior, toda criatura nova deveria passar por uma segunda revisão humana/sessão antes de aprovação final de produto — ainda não há esse processo formalizado nesta entrega.
5. Se uma criatura "original" acabar parecida demais com uma espécie de terceiro por coincidência de silhueta genérica (ex. "lagarto pequeno"), documentar a semelhança e revisar a silhueta antes de aprovar — não basta "eu não copiei", a leitura final do jogador importa.

---

## 9b. Decisão de escala: mundo (tile 32px) x sprites oficiais nativos do DS (game-art, biomas v1)

Os 4 `creature.json` importados (Guilmon, Agumon, Gabumon, Patamon) registram a mesma `qaNote`: "Escala nativa do DS (NxM); não bate com o tile 32 do ART_STYLE_GUIDE — decisão de escala fica com game-art." Esta seção resolve essa pendência para a primeira entrega de mundo (`GAME-ASSETS/03-environments/`, `world_mockup_v1.png`).

**Decisão: fator de escala = 1x (nativo), tile de terreno mantido em 32px.** Nenhum sprite oficial é redimensionado — nem para cima nem para baixo — em nenhum lugar deste pacote. O ajuste fica por conta da **câmera** (viewport largo), não do sprite:

- Com tile=32px e sprite nativo 1:1, um In-Training (~34-52px) ocupa ~1-1,6 tile de altura, um Rookie (~70-86px) ocupa ~2,2-2,7 tiles, e um Champion (~103-135px, ainda não usado em mundo) ocuparia ~3,2-4,2 tiles — números medidos diretamente via `png_decode.js` nos arquivos reais de `01-creatures/CREATURE-0002..0013/sprites/`.
- **Por que não encolher o sprite para caber em ~1,5 tile (a referência antiga da §3 para Rookie "original"):** a regra já existente na seção 2 proíbe esticar/redimensionar sprites oficiais com interpolação; reduzir um rip de batalha nativo do DS por um fator não-inteiro (ex.: ~0,6x) exigiria reamostragem com perda de nitidez do pixel art original, o que a própria regra de `official-fan-use` já rejeita.
- **Por que não aumentar o tile para 64px ou mais:** o tile de 32px já está decidido e em uso (terreno, props, pathing) e aumentar o grid penalizaria desproporcionalmente o In-Training (que ficaria sub-dimensionado dentro de um tile maior) sem resolver o Champion (que continuaria maior que qualquer tile razoável).
- **Solução adotada: câmera larga.** `world_mockup_v1.png` usa uma janela de 1280x720px sem nenhum fator de escala de tela aplicado (1 tile = 32px na tela) — isso mostra 40x22,5 tiles de mundo simultaneamente, espaço suficiente para o Rookie em combate (~2,5 tiles) não dominar o quadro. Recomendação para o engine real (game-dev): viewport mínimo de ~30-40 tiles de largura antes de qualquer upscale inteiro de tela (ex.: renderizar a 960-1280px internos e then upscale 1x-2x conforme o display), para manter a mesma leitura.
- **Pivô/âncoras:** cada criatura é posicionada pelo `pivot` (pés) já gravado em `creature.json`; a sombra de contato e a âncora de HP (`head`) também vêm de lá, convertidos para coordenadas de mundo em `art/src/world_mockup.js`.
- Isto é uma decisão de direção de arte **[H]**, não testada com jogador real — a confirmar quando o game-dev tiver um viewport real implementado (ver limitação já registrada na seção 2 sobre a resolução interna de tela).

## 9. Limitações

- Esta é uma direção de arte **[H]**, não validada com jogador real — "legível" e "combina com a imagem conceito" são avaliações desta sessão (inspeção visual própria), não teste de usuário.
- A escala exata de Tamer vs. criatura (§3) é uma leitura visual da imagem conceito, não uma medição em pixels (a imagem fornecida não tem grade de referência) — **[H]**, a confirmar se o fundador fornecer uma versão com grade ou medidas.
- A resolução interna de tela (§2) depende do viewport real do novo renderer de mundo do game-dev, que ainda não existe (`WORLD_COMBAT_VISUAL_SPEC.md` é uma spec, não uma implementação) — o valor exato (384×216 vs. 480×270 etc.) precisa ser confirmado com game-dev antes de virar corte final de arte.
- A ficha piloto do §7 foi autorada numa grade pequena (16×18 "pixels grandes") para ser viável à mão numa sessão; o resultado (ver preview) tem as pernas pouco legíveis mesmo ampliado — é suficiente para calibrar escala/paleta como pedido, mas **não** é a técnica de produção final recomendada para 6–9 criaturas completas com animação; produção real provavelmente precisa de uma grade nativa maior (32–48px direto) autorada à mão, o que é mais trabalho por criatura do que o pipeline paramétrico antigo — compensação consciente pela rejeição do fundador à abordagem paramétrica.
- Nenhuma criatura Digimon oficial foi desenhada nesta entrega (nem redesenho tipo Agumon/Gabumon/Patamon do pacote anterior) — a ficha piloto é uma criatura "réptil pequeno vermelho" genérica só para calibração, não reivindica ser nenhum Digimon específico; a decisão de qual Digimon (ou criatura original) vira o primeiro asset de produção real é do `ASSET_LICENSE_POLICY.md`/inventário de `FAN_SPRITE_SOURCES.md`, não deste documento.
