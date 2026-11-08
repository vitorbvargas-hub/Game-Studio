# Direção de arte pixel — GS-003, Linha B (monstros digitais)

> **Autor:** game-art · **Data:** 2026-11-08 · **Decisão de referência:** `shared/decisions/ADR-006-gs003-prototipo-linha-b.md` (fundador escolheu pixel art "bem bonito" para a Linha B, substituindo a recomendação de vetor de `ART_DIRECTION_OPTIONS.md`).
>
> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/decisão de direção de arte não testada com jogador real.

---

## 0. Addendum — ADR-007: pivô para fan game com Digimon oficiais (2026-11-08)

**[E]** Após a entrega original deste documento (criaturas 100% originais Pixelume/Ferrolim/Aquabit), o fundador aprovou `shared/decisions/ADR-007-gs003-fan-game-pokemon-digimon.md`: o GS-003 passa a ser um **fan game não comercial** usando monstros oficiais de Pokémon (Linha A) e Digimon (Linha B). Exceção explícita e reversível à regra de `GOVERNANCE.md` contra IP de terceiros, válida só para este projeto, sob condições do próprio ADR: sem monetização de nenhum tipo, **proibido ripar/extrair sprites, sons ou arquivos oficiais**, sem logos/marcas oficiais no título ou material de divulgação, publicação continua exigindo aprovação separada, e conteúdo em *content pack* trocável (o motor fica pronto para uma versão 100% original reaproveitando o mesmo código).

**O que muda nesta entrega de arte:**

- Os 3 iniciais da Linha B passam a ser **Agumon, Gabumon e Patamon** (oficiais), redesenhados em pixel art própria pelo mesmo pipeline de código (`art/src/agumon.js`, `gabumon.js`, `patamon.js`) — **nenhum arquivo, imagem, sprite ou asset oficial foi baixado, buscado, aberto ou rastreado** em nenhum momento desta tarefa; os designs vêm inteiramente de conhecimento público geral do visual de cada personagem (silhueta, paleta de cor, elementos icônicos conhecidos), reinterpretado na grade/paleta/regras de luz deste guia — não é um traçado de nenhum arquivo específico.
- A seção 5 ("motivo digital — o que diferencia a Linha B") e a seção 8 (checklist de originalidade vs. Digimon/Pokémon) **ficam retidas como histórico/referência para um futuro content pack 100% original**, mas **não se aplicam** ao content pack Digimon-fan — aqui o objetivo passa a ser semelhança reconhecível com o personagem oficial (dentro da exceção do ADR-007), não diferenciação.
- Paleta nova e específica para este content pack: `art/src/digimon_palette.js` (cores aproximando o esquema de cor canônico de cada personagem — laranja/creme para Agumon, azul/bege para Gabumon, bege/tostado para Patamon), em vez de forçar a paleta neon "ByteLine-18" (que foi desenhada justamente para *evitar* parecer Digimon — agora obsoleta para este propósito).
- Organização de pasta: os ativos da linha original ficam em `art/sprites/original-ip/` e `art/previews/original-ip/` (preservados, não deletados — viram o conteúdo-base de um futuro content pack comercial); os novos ativos Digimon-fan ficam em `art/sprites/digimon-fan/` e `art/previews/digimon-fan/`.
- Regras técnicas que **continuam valendo** (grade 48×48, resolução interna 320×180, escala inteira, contorno 1px automático, luz fixa superior-esquerda, sombra de contato, 2 frames de idle por criatura, pipeline 100% Node.js sem dependência externa): seções 2, 4, 6, 10 deste documento, sem alteração.

---

## 0.1 Addendum — animações walk/attack/hit para o content pack Digimon-fan (2026-11-08)

**[E]** Entrega adicional, mesmo dia: as 3 criaturas Digimon-fan (Agumon, Gabumon, Patamon) ganharam animações de **andar (4 frames)**, **ataque (3 frames)** e **dano/hit (2 frames)**, além do idle (2 frames) já entregue — mantendo grade 48×48, nomenclatura `<monstro>_<anim>_<NN>.png`, pipeline 100% Node.js sem dependência externa, e sem nenhum arquivo/imagem/sprite oficial consultado.

- **Reuso do pipeline, sem reescrever cada criatura do zero:** as novas poses foram construídas compondo as mesmas funções `frame(opts)` já existentes (`agumon.js`, `gabumon.js`, `patamon.js`) com dois utilitários novos e genéricos adicionados a `art/src/canvas.js`: `Canvas.translate(dx, dy)` (desloca o sprite inteiro — usado para recuo de antecipação, avanço de impacto, recuo de nocaute) e `Canvas.tint(color, alpha)` (sobrepõe uma cor translúcida só nos pixels não-transparentes — usado para o flash de impacto do ataque e o flash branco do hit). Isso evita duplicar lógica de desenho por pose e mantém os três geradores pequenos.
- **Andar (4 frames, loop):** Agumon e Gabumon — adicionado parâmetro `legOffset` em `drawLegs()` (perna esquerda desce enquanto a direita sobe e vice-versa) combinado com balanço de braço (`lift`) e um leve bounce vertical (`translate(0,-1)`) nos frames de passagem. **Patamon não tem pernas** (é um flutuador no design canônico) — **[H] decisão de direção:** o ciclo de "andar" do Patamon foi reinterpretado como um **ciclo de flutuação/hover** (bob vertical de 1px + batida de orelha alternada via o parâmetro `flap` já existente), a locomoção mais equivalente para uma criatura que voa em vez de andar; documentado aqui em vez de forçar uma pose de perna inexistente.
- **Ataque (3 frames: antecipação → impacto → retorno):** segue a convenção já escrita na seção 6 original deste documento — frame 1 recua 2px (`translate(-2,0)`) com o braço/orelha puxado para trás; frame 2 avança 3px além da posição de idle (`translate(3,0)`) com boca aberta (Agumon) ou orelhas estendidas (Gabumon/Patamon) e um flash de 1 frame via `tint()` na cor de acento de cada criatura (`agRidge` vermelho para Agumon, `gbHorn` creme para Gabumon, `ptEarInner` rosa para Patamon, todas já existentes em `digimon_palette.js` — nenhuma cor nova foi adicionada); frame 3 recua para perto da pose de idle (`translate(1,0)`).
- **Hit/dano (2 frames):** corpo deslocado 1–2px para trás (direção oposta ao ataque) + flash branco (`DP.paper`) via `tint()`, mais intenso no frame 1 (alpha 150) e esmaecendo no frame 2 (alpha 70) — efeito clássico de dano em jogos 2D, sem sprite extra desenhado à mão.
- **Fonte de prova ampliada:** `art/src/font5x3.js` ganhou os glifos `C`, `D`, `W`, `K` (faltavam para rotular "ATTACK"/"WALK" na folha de contato) — mesmo estilo bitmap 3×5 à mão dos glifos já existentes, ainda um placeholder de prova (ver seção 7).
- **Folha de contato:** `art/src/contact_sheet.js` (novo) monta uma grade única com todos os frames das 3 criaturas lado a lado, rotulada por coluna (IDLE/WALK/ATTACK/HIT) e por linha (nome da criatura), fundo `void` da paleta ByteLine-18 (`palette.js`) para contraste — salva em `art/previews/digimon-fan/digimon_fan_contact_sheet.png` (1138×310px, escala ×2 por célula, resolução nativa, sem necessidade de upscale adicional).
- **Verificação visual:** cada novo frame foi inspecionado via ferramenta de inspeção de imagem nesta sessão (incluindo a folha de contato, que revelou e permitiu corrigir um bug de fonte — glifo `C` faltante fazia "ATTACK" renderizar como "ATTA K") antes desta entrega ser considerada concluída.

---

## 1. Escopo e restrições

- Linha B apenas (monstros digitais / Tamers), protótipo GS-003, 6–9 criaturas no total no protótipo completo — este documento cobre a direção de arte e entrega 3 criaturas iniciais como prova visual: **Pixelume** (Dado/Luz), **Ferrolim** (Vírus/Metal), **Aquabit** (Vacina/Água), nomes de `GAME_CONCEPTS.md` §3.B.
- **R$ 0, sem IA paga.** Nenhum Recraft, nenhuma API de imagem, nenhuma conta do fundador usada. Todos os sprites desta entrega foram desenhados **pixel a pixel por código** (não por geração de imagem), em Node.js puro.
- **[E]** `pip`/`venv` (Python) não estavam disponíveis neste host (`pip`/`ensurepip` ausentes, sem `sudo`) e a instalação de pacotes npm externos foi bloqueada pela política de segurança do ambiente (`npm install pngjs` → erro 403 "forbidden by your security policy", verificado em 2026-11-08). Por isso, o pipeline de prova usa **Node.js com apenas módulos nativos** (`zlib`, `fs`) — um encoder PNG e uma biblioteca de desenho por pixel foram escritos do zero em `art/src/png.js` e `art/src/canvas.js`. Isso é mais trabalhoso que usar Pillow, mas evita qualquer dependência externa não verificável e mantém 100% de controle pixel a pixel.
- Nenhum sprite de terceiro foi copiado, referenciado como base de traçado, ou usado como "style reference" de imagem. Toda forma nasceu de descrição textual (elemento + papel de gameplay + silhueta), conforme a regra de `GAME_CONCEPTS.md` §0 e `ART_DIRECTION_OPTIONS.md` §5.1.

---

## 2. Resolução e grade

| Ativo | Resolução nativa | Observação |
|---|---|---|
| **Sprite de criatura** | **48×48 px** | Grade fixa para todas as criaturas da Linha B (starters e evoluções), para silhuetas comparáveis lado a lado na UI de time/Pokédex-equivalente. |
| **Ícone de UI/item/atributo** | **16×16 px** | Um terço da grade de criatura — permite reaproveitar a mesma grade de pixel (3 ícones cabem na largura de 1 criatura) sem escala fracionária. |
| **Resolução interna da tela** | **320×180 px** (16:9) | Resolução de composição do jogo — todo o HUD, fundo e sprites são desenhados/posicionados neste canvas antes de qualquer escala para o dispositivo real. |

**Regra de escala inteira (hard rule):** a tela de 320×180 só pode ser ampliada por fatores **inteiros** (×2 = 640×360, ×3 = 960×540, ×4 = 1280×720, ×6 = 1920×1080) usando **nearest-neighbor** (sem suavização/blur) — qualquer escala fracionária (ex. ×2,5) quebra o alinhamento de pixel e borra os contornos. Essa regra está implementada em `art/src/canvas.js` (`scaleNearest(factor)`), usada em todas as pré-visualizações desta entrega.

**Duas camadas de escala (como usado no mockup de batalha, `art/src/battle_mockup.js`):**
1. **Escala de asset:** sprites de criatura podem ser desenhados em "pré-escala" inteira dentro do canvas de 320×180 (ex. ×2) para ocupar o espaço de tela correto sem precisar de uma segunda grade de 96×96 — ver `enemy`/`player` em `battle_mockup.js`, ambos `scaleNearest(2)` antes do `blit`.
2. **Escala de tela:** o canvas de 320×180 inteiro é então escalado (×4 nas pré-visualizações desta entrega) para o tamanho de exibição real.

Essa composição em duas camadas, sempre com fatores inteiros em cada camada, é a regra de ouro do pipeline — nunca escalar uma imagem já escalada por um fator fracionário.

---

## 3. Paleta — "ByteLine-18"

**[PROPOSTA, original, não copiada de nenhuma paleta publicada.]** Paleta própria de 18 cores, autorada para este documento e implementada em `art/src/palette.js`, compartilhada por todas as criaturas e pela UI da Linha B — mantém consistência visual entre criaturas de elementos diferentes.

| Nome | Hex | Uso |
|---|---|---|
| `ink` | `#12121c` | Contorno (outline) de todas as criaturas e da UI |
| `void` | `#1d2238` | Sombra profunda / fundo de painel de UI |
| `steel` | `#3a4766` | Base metálica (Ferrolim), barra de HP vazia |
| `steelLt` | `#6b7aa1` | Realce metálico |
| `mist` | `#aebbd6` | Texto secundário de UI (nível, contador) |
| `paper` | `#eef2fb` | Branco de realce / núcleo de luz / texto principal |
| `cyan` | `#3fe0d0` | Cor primária Aquabit / acento "digital" geral |
| `cyanDk` | `#1c8b86` | Sombra de Aquabit |
| `cyanLt` | `#a4f7ef` | Realce/glow de Aquabit, linhas de circuito |
| `magenta` | `#e8459d` | Acento "vírus" (Ferrolim), alerta de UI |
| `magentaDk` | `#8a2763` | Sombra de circuito do Ferrolim |
| `amber` | `#ffd27a` | Núcleo de luz do Pixelume |
| `amberDk` | `#d99a33` | Sombra do núcleo de luz |
| `lilac` | `#c9bdf2` | Corpo base do Pixelume (elemento Dado/Luz) |
| `lilacDk` | `#8f7fc9` | Sombra do corpo do Pixelume |
| `volt` | `#9df24a` | Barra de HP cheia (alto) |
| `blood` | `#e8465f` | Barra de HP crítica (reservada, não usada nesta prova) |
| `bgGrid` | `#0c1024` | Base do fundo de batalha |

**Regra de uso:** cada criatura usa no máximo 5–6 cores da paleta (corpo base + sombra + realce + 1–2 cores de acento "digital" + contorno `ink` comum a todas) — mantém leitura limpa em 48×48 px e reforça que as 3 criaturas pertencem à mesma linha de produto sem ficarem visualmente idênticas.

---

## 4. Regras de contorno, sombreamento e luz

1. **Contorno:** 1px, cor `ink`, aplicado automaticamente ao redor de toda região não-transparente (`Canvas.autoOutline()`) — contorno único por criatura, nunca contornos internos duros entre partes do corpo (as "costuras" de placas, como no Ferrolim, usam linhas finas de 40–60% de opacidade, não contorno cheio, para não competir visualmente com o contorno externo).
2. **Luz:** fonte de luz fixa **superior-esquerda** em todas as criaturas e no fundo de batalha — realce (`paper`/`*Lt`) sempre no quadrante superior-esquerdo do corpo, sombra (`*Dk`/`void`) sempre no quadrante inferior-direito. Regra consistente nas 3 criaturas entregues.
3. **Sombreamento:** 2–3 tons por cor (base, sombra, realce) — sem gradiente suave pixel a pixel (isso produziria ruído em 48px); as transições usam blocos de cor sólidos ou, no máximo, uma camada de alfa parcial para sugerir translucidez de "gel"/"luz" (Pixelume e Aquabit são corpos translúcidos por conceito — "Dado/Luz" e "Vacina/Água" — por isso usam alfa <255 na cor de corpo; Ferrolim, por ser "Vírus/Metal" opaco, usa alfa 255 sólido).
4. **Sombra de contato:** elipse semitransparente (`ink` a ~27% de opacidade) no chão sob cada criatura — ancora o sprite visualmente sem precisar desenhar um chão detalhado por criatura.

---

## 5. Motivo "digital" — o que diferencia a Linha B

A Linha B compartilha grade, paleta-base e regras de luz com qualquer futura Linha A (ver `ART_DIRECTION_OPTIONS.md` §2, que já recomendava uma camada "digital/cyber" sobre uma base comum) — a diferenciação vem de um **motivo gráfico consistente**, não de uma paleta ou técnica totalmente separada:

- **Linhas de circuito (circuit traces):** linhas finas de 1px, em `cyan`/`cyanLt` ou `magenta`/`magentaDk` conforme o elemento, desenhadas sobre o corpo em padrão de trilha de placa de circuito (ângulos retos, não orgânicos) — visível no peito do Ferrolim e no núcleo do Aquabit.
- **Núcleo de luz pulsante:** usado no Pixelume (elemento Dado/Luz) como núcleo central com glow em camadas de alfa decrescente — a pulsação (frame 2 do idle com núcleo +1px e mais claro) é o principal "tell" de que a criatura é digital, não orgânica.
- **Scanlines de fundo:** no mockup de batalha, uma linha horizontal semitransparente a cada 2px cobre toda a tela (`drawBackground()` em `battle_mockup.js`) — referência discreta a uma "tela"/rede, sem comprometer a legibilidade dos sprites.
- **Reservado para fase 2 (não implementado nesta prova):** efeito de "glitch" (deslocamento de 1–2px de blocos de cor por 1 frame) reservado para a transição de digievolução (evento de UI, não sprite de idle) — consistente com a recomendação de `ART_DIRECTION_OPTIONS.md` §1 Opção 3 de aplicar glitch como "camada de transição", não como ruído constante no idle (que cansaria visualmente em uso prolongado/idle game).

---

## 6. Animações mínimas

| Animação | Frames | Status nesta entrega |
|---|---|---|
| **Idle** | 2–4 frames (loop) | **Entregue: 2 frames por criatura** (`*_idle_01.png`, `*_idle_02.png`). Content pack original (Pixelume/Ferrolim/Aquabit): cada criatura usa uma variação diferente de "respiração digital" (seção 5). Content pack Digimon-fan (Agumon/Gabumon/Patamon): bob de respiração + piscar (ver §0 addendum original). |
| **Andar** | 2–4 frames (loop) | **Entregue para o content pack Digimon-fan (addendum §0.1, 2026-11-08): 4 frames por criatura** (`*_walk_01..04.png`) — Agumon/Gabumon usam `legOffset` (passada alternada) + balanço de braço + bounce; Patamon (sem pernas) usa um ciclo de flutuação/hover reinterpretado como "andar" ([H], ver §0.1). Não entregue para o content pack original (Pixelume/Ferrolim/Aquabit) — fora do escopo desta tarefa. |
| **Ataque** | 3–4 frames (anteposição → impacto → retorno) | **Entregue para o content pack Digimon-fan (addendum §0.1): 3 frames por criatura** (`*_attack_01..03.png`), seguindo exatamente a convenção descrita abaixo. Não entregue para o content pack original — convenção original mantida como referência: frame 1 recua 2–3px na direção oposta ao alvo (anteposição), frame 2 avança além da posição de idle com um flash de 1 frame na cor de acento do elemento (ex. `cyan` para Aquabit), frame 3 retorno à pose de idle. |
| **Hit (recebendo dano)** | 1–2 frames | **Entregue para o content pack Digimon-fan (addendum §0.1): 2 frames por criatura** (`*_hit_01..02.png`) — corpo desloca 1–2px na direção do impacto + flash branco (`paper`) via `Canvas.tint()`, mais intenso no frame 1 e esmaecendo no frame 2. Não entregue para o content pack original — convenção original mantida como referência acima. |

---

## 7. UI pixel e fonte

- **Fonte de prova (apenas para o mockup desta entrega):** bitmap 3×5 px desenhada à mão em `art/src/font5x3.js`, cobrindo só os glifos necessários para os textos do mockup (`FERROLIM`, `AQUABIT`, `HP`, `LV`, dígitos, `/`). **Não é uma fonte de produção** — é um placeholder funcional para provar o layout da UI sem depender de nenhum arquivo de fonte externo.
- **Fonte recomendada para produção**, pesquisada e verificada nesta sessão:
  - **Press Start 2P** — licença **SIL Open Font License 1.1 (OFL)**, confirmada via `raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/OFL.txt` **[E, 2026-11-08]**: *"This Font Software is licensed under the SIL Open Font License, Version 1.1."* Disponível também via Google Fonts (`fonts.google.com/specimen/Press+Start+2P`). Uso comercial permitido, redistribuição permitida, sem exigência de atribuição visível no jogo (OFL permite embutir a fonte livremente; nome reservado "Press Start 2P" não pode ser usado para uma fonte derivada renomeada, o que não é um problema para uso direto).
  - **Alternativa a avaliar (não verificada nesta sessão):** qualquer fonte da categoria "pixel" no próprio Google Fonts com licença OFL, caso "Press Start 2P" (que é bem larga/quadrada) não combine com a densidade de texto da UI final.
- **Elementos de UI (painel, barra de HP, botões):** ver seção 9 (pesquisa de assets gratuitos) — recomenda-se Kenney "UI Pack - Pixel Adventure" (CC0, verificado) em vez de desenhar cada botão/painel à mão, reservando o tempo de arte original para as criaturas.

---

## 8. Checklist de originalidade vs. Digimon/Pokémon

Checklist aplicado às 3 criaturas desta entrega (baseado em `ART_DIRECTION_OPTIONS.md` §5.1 e na regra de silhueta de `GAME_CONCEPTS.md` §0):

1. **Nenhuma criatura é lagarto de fogo, roedor elétrico, ou dinossauro laranja/verde com planta nas costas** (regra explícita do fundador/design, `GAME_CONCEPTS.md` §0) — Pixelume é um blob de luz sem réptil/roedor; Ferrolim é um inseto digital angular (não réptil, não roedor, não dinossauro); Aquabit é uma gota de gel (não réptil, não roedor).
2. **Nenhum nome, item ou termo oficial de franquia de terceiros** — "Pixelume", "Ferrolim", "Aquabit", "Dado/Luz", "Vírus/Metal", "Vacina/Água" são nomenclatura própria do GS-003 (`GAME_CONCEPTS.md` §3.B), sem termo reservado de Digimon (ex. "Digivice", "Tamer" oficial, nomes de personagem) ou Pokémon.
3. **Nenhuma combinação icônica de cor+forma reconhecível** — nenhuma das 3 criaturas usa "roedor amarelo + bochecha vermelha", "réptil azul com concha nas costas", ou qualquer combinação de atributos associada a uma criatura específica de franquia de referência; as 3 silhuetas (blob orgânico, inseto angular, gota pontiaguda) são arquétipos genéricos de "criatura pequena", não cópias de silhueta de mascote existente.
4. **Toda criatura nasceu de descrição textual original** antes de qualquer desenho — as 3 descrições usadas (seção do código-fonte de cada gerador, `art/src/{pixelume,ferrolim,aquabit}.js`) vieram diretamente de `GAME_CONCEPTS.md` §3.B ("blob translúcido com núcleo luminoso pulsante, sem chifres nem garras"; "inseto digital de placas angulares, sem ser lagarto nem roedor"; "geleia aquática com padrão de circuito interno, forma de gota"), nunca de um prompt do tipo "como [criatura oficial] mas diferente".
5. **Revisão cruzada:** revisão visual feita nesta própria sessão (via ferramenta de inspeção de imagem, iterando cada sprite após gerar) — recomenda-se uma segunda revisão por outra pessoa/sessão antes de aprovação final de produto, conforme item 4 do checklist original de `ART_DIRECTION_OPTIONS.md` §5.1. **[H]** Nenhuma busca reversa de imagem foi feita (fora do escopo desta tarefa e da ferramenta disponível).

**Resultado da checklist nesta entrega: aprovado nos itens 1–4; item 5 parcialmente atendido (revisão própria feita, revisão cruzada por terceiro pendente).**

---

## 9. Pesquisa de assets gratuitos complementares

**[E]** A busca web desta sessão via `web_search` (configurada para DuckDuckGo por `ADR-006` item 7) **retornou "web_search is disabled or no provider is available"** em todas as tentativas (3 tentativas, 2026-11-08) — ou seja, **a busca web NÃO está funcionando nesta sessão**, ao contrário do que o ADR-006 registra. Reportando conforme pedido na tarefa.

Como alternativa, usei `web_fetch` (busca HTTP direta, não é um motor de busca) para **verificar diretamente** páginas de licença de fontes/bibliotecas de assets já conhecidas da indústria — todos os links abaixo foram realmente buscados e teve o conteúdo de licença confirmado nesta sessão, não são links "de memória" não verificados:

| Asset | Fonte | Licença verificada | Evidência |
|---|---|---|---|
| **Kenney — UI Pack - Pixel Adventure** (botões, painéis, barras em estilo pixel) | `kenney.nl/assets/ui-pack-pixel-adventure` | **Creative Commons CC0** | **[E, 2026-11-08]** Página buscada via `web_fetch`, trecho confirmado: "License → Creative Commons CC0" (link para `creativecommons.org/publicdomain/zero/1.0/`). |
| **Kenney — Pixel Platformer** (tileset 18×18, chão/plataformas/cenário) | `kenney.nl/assets/pixel-platformer` | **Creative Commons CC0** | **[E, 2026-11-08]** Mesma verificação direta, página confirma "License → Creative Commons CC0". |
| **Kenney — UI Pack** (genérico, não-pixel, alternativa para HUD mais "clean") | `kenney.nl/assets/ui-pack` | **Creative Commons CC0** | **[E, 2026-11-08]** Confirmado na mesma verificação. |
| **Press Start 2P** (fonte pixel para HUD/UI) | Google Fonts / repositório oficial `google/fonts` (`ofl/pressstart2p/OFL.txt`) | **SIL Open Font License 1.1** | **[E, 2026-11-08]** Texto da licença lido diretamente do arquivo `OFL.txt` no repositório oficial via `web_fetch`. |
| **OpenGameArt.org** (tiles de cenário e ícones de item adicionais, uso seletivo) | `opengameart.org/content/oga-by-30-faq` | **Mista por item** — license própria "OGA-BY 3.0" (baseada em CC-BY 3.0) para parte do catálogo, além de itens CC0/CC-BY-SA individuais | **[E, 2026-11-08]** FAQ oficial confirma a natureza da licença OGA-BY; **cada item individual ainda precisa ser verificado na própria página do asset antes do uso**, pois a licença varia por autor/upload. |

**Recomendação de uso:** reservar Kenney (CC0, sem necessidade de atribuição) para toda a UI genérica (painéis de HP, botões, ícones de moeda/item, tileset de cenário de zona) e para a fonte pixel (Press Start 2P, OFL) — e usar geração própria (como os 3 sprites desta entrega) só para as criaturas, que são o ativo de maior valor de propriedade intelectual do produto. Isso é consistente com a recomendação já registrada em `ART_DIRECTION_OPTIONS.md` §3 ("Assets CC0 prontos").

**Pendência:** itens individuais de OpenGameArt (se usados no futuro) precisam de verificação item a item antes de entrar em produção — a licença da plataforma é mista, não uniforme.

---

## 10. Arquivos entregues

```
art/
├── PIXEL_ART_DIRECTION.md       (este documento)
├── src/                          (scripts de geração, 100% reproduzíveis)
│   ├── png.js                    (encoder PNG puro, só zlib nativo do Node)
│   ├── canvas.js                 (biblioteca de desenho por pixel)
│   ├── palette.js                 (paleta ByteLine-18, content pack original)
│   ├── digimon_palette.js         (paleta do content pack Digimon-fan, ADR-007)
│   ├── font5x3.js                 (fonte bitmap 3x5 de prova, só para os mockups)
│   ├── pixelume.js / ferrolim.js / aquabit.js   (content pack original, 2 frames de idle cada)
│   ├── battle_mockup.js           (mockup de batalha, content pack original)
│   ├── agumon.js / gabumon.js / patamon.js      (content pack Digimon-fan, idle 2 + andar 4 + ataque 3 + hit 2 frames cada, §0.1)
│   ├── battle_mockup_digimon.js   (mockup de batalha, content pack Digimon-fan)
│   ├── anim_io.js                 (novo, §0.1 — helper compartilhado que escreve `<monstro>_<anim>_<NN>.png` + preview x8 para os 3 geradores Digimon-fan)
│   └── contact_sheet.js           (novo, §0.1 — monta a folha de contato com todos os frames Digimon-fan rotulados)
├── sprites/
│   ├── original-ip/               (PNG 48x48 nativo + mockup 320x180 — content pack original, preservado)
│   └── digimon-fan/                (PNG 48x48 nativo + mockup 320x180 — Agumon, Gabumon, Patamon: idle/walk/attack/hit, ADR-007 + §0.1)
└── previews/
    ├── original-ip/                (ampliações x8 das criaturas / x4 do mockup, nearest-neighbor)
    └── digimon-fan/                 (ampliações x8 de todos os frames idle/walk/attack/hit + `digimon_fan_contact_sheet.png`, §0.1)
```

**Reprodutibilidade das novas animações:** `node art/src/agumon.js <sprites/digimon-fan> <previews/digimon-fan>` (idem `gabumon.js`, `patamon.js`) regenera idle+andar+ataque+hit de cada criatura; `node art/src/contact_sheet.js <previews/digimon-fan>` regenera a folha de contato a partir dos mesmos geradores — determinístico, sem aleatoriedade.

**Reprodutibilidade:** rodar `node art/src/pixelume.js <outDir> <previewDir>` (e equivalentes para `ferrolim.js`, `aquabit.js`, `battle_mockup.js`) regenera os mesmos arquivos de forma determinística — nenhuma aleatoriedade não-semeada é usada em nenhum gerador.

---

## 11. Limitações

- **Visual, não testado com jogador real** — toda esta direção é [H] até validação de playtest; "bonito" é avaliação própria desta sessão (iterei cada sprite visualmente via ferramenta de inspeção de imagem até achar aceitável), não validação de usuário.
- **Só idle entregue** — ataque e hit são convenção escrita (seção 6), não sprites reais; precisam de mais 1 sessão de arte dedicada antes de entrarem no protótipo jogável.
- **Pipeline PNG caseiro** — por falta de Pillow/pip e bloqueio de instalação npm neste ambiente, o encoder PNG foi escrito do zero (`art/src/png.js`). Funciona (validado com `file` e inspeção visual de todos os PNGs gerados), mas é um encoder mínimo (RGBA 8-bit, sem otimização de filtro por linha além de "none", sem paleta indexada) — os arquivos são maiores do que um PNG otimizado por uma ferramenta madura (ex. `pngcrush`/Pillow), mas totalmente válidos e leves o suficiente para um protótipo (maior arquivo: ~3,6 KB por preview de criatura ampliado 8x).
- **`web_search` indisponível nesta sessão** apesar do ADR-006 registrar DuckDuckGo como configurado — toda a pesquisa de licença desta seção 9 foi feita via `web_fetch` direto a URLs conhecidas da indústria (Kenney, Google Fonts, OpenGameArt), não via busca livre; se alguma licença mudou recentemente e não há uma página alternativa óbvia para checar, isso não seria descoberto com o método usado aqui.
- **Revisão cruzada de originalidade pendente** (checklist item 5, seção 8) — recomenda-se que outra pessoa/sessão do estúdio revise os 3 sprites antes de qualquer aprovação final de produto.
- **Fonte de prova não é a fonte final** — `font5x3.js` é um placeholder de 3x5px só para provar o layout da UI; a integração real deve usar Press Start 2P (ou outra fonte OFL/CC0 pixel) como arquivo de fonte de verdade.
- **[§0.1] Andar/ataque/hit do Digimon-fan são poses compostas, não redesenhos pose-a-pose** — cada frame novo reaproveita o mesmo desenho base de `frame(opts)` (idle) deslocado (`translate`) e/ou tingido (`tint`), em vez de recriar a silhueta pixel a pixel para cada pose; é uma técnica legítima e comum em pixel art de orçamento pequeno, mas produz uma leitura de movimento mais sutil (mesmo "ator" rígido se movendo) do que uma re-pose desenhada à mão quadro a quadro (ex. pernas/braços não mudam de forma, só de posição). Suficiente para um protótipo jogável; uma sessão de arte dedicada poderia redesenhar poses com deformação de silhueta se o resultado em jogo parecer rígido demais.
- **[H] Ciclo de "andar" do Patamon é um hover reinterpretado** — Patamon não tem pernas no design (flutuador), então os 4 frames de `patamon_walk_*.png` usam bob vertical + batida de orelha em vez de uma passada de perna; é a interpretação mais próxima de uma locomoção cíclica para essa silhueta, mas diverge do significado literal de "andar" pedido na tarefa — reportado aqui para revisão do fundador caso um ciclo de voo dedicado (sem o nome "andar") seja preferível na integração final.
- **Flash de ataque/hit depende de `Canvas.tint()`, não de shader de engine** — os frames de flash já vêm "queimados" no PNG (cor de impacto ou branco pré-misturada ao desenho); isso funciona para um protótipo baseado em troca de frame, mas significa que a intensidade do flash é fixa por frame, não configurável em tempo de execução como seria com um tint shader na engine real.
- **Arquivos temporários de uma execução anterior interrompida (reinício do Gateway) não foram encontrados** — verificação feita no início desta tarefa (`/tmp`, diretórios recentes) não achou nenhum PNG parcial de andar/ataque/hit além dos 2 idles já existentes; esta entrega foi gerada do zero, não reaproveitando nenhum arquivo parcial.
- **[ADR-007] Redesign Digimon-fan é de memória, não de referência verificada** — Agumon, Gabumon e Patamon foram desenhados a partir de conhecimento público geral (sem abrir, buscar ou rastrear nenhum arquivo/imagem oficial, conforme exigido pelo ADR-007); isso significa que detalhes finos (proporção exata, número exato de pôntas do capuz do Gabumon, etc.) podem divergir do design oficial — são reconhecíveis na silhueta/cor geral, não uma reprodução exata. Recomenda-se revisão do fundador (que conhece bem os personagens) antes de aprovar como versão final.
- **Checklist de originalidade (seção 8) não se aplica ao content pack Digimon-fan** — ela continua válida apenas para um futuro content pack 100% original; o pack Digimon-fan opera sob a exceção específica do ADR-007, não sob a regra de originalidade padrão do GOVERNANCE.
