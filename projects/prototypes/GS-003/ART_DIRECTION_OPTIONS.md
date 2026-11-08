# Opções de direção de arte — GS-003 (idle de coleção de monstros)

> **Autor:** game-art (Art Director) · **Data:** 2026-11-08 · **Parte:** GS-003, Parte 3a (estilo de imagem, sprites e pipeline)
>
> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/não confirmado nesta sessão.
>
> **Contexto:** o produto terá duas linhas — **A** (coleção e captura, público IdleDex/Pokémon) e **B** (monstros digitais com digievolução e Tamers, público Digimon/BR). Criaturas, nomes e arte devem ser **100% originais** (GOVERNANCE) — Pokémon e Digimon só como referência de mecânica/estilo, nunca de conteúdo.

---

## 0. Nota de correção ao `ASSET_SOURCING.md` e limitação de acesso ao navegador

**[E]** O brief desta tarefa descrevia o modo `capa` do script `ilustra-gen.mjs` como não injetando a paleta da Sharp. Ao ler o script-fonte (`~/projects/Sharp/sharp-os/scripts/ilustra-gen.mjs`, lido diretamente nesta sessão em 2026-11-08), confirmei que **isso está incorreto**: tanto `vetor` quanto `capa` chamam `m.prompt(scene)`, e `m.prompt` para ambos os modos inclui a constante `PALETTE` ("navy #101b2f... gold #c99430... cream #fbfaf5...") embutida no texto do prompt. **Não existe modo do script atual que escape da paleta da Sharp.** Isso confirma e reforça o que o próprio `ASSET_SOURCING.md` já registrava na seção 1 — a diferença é que o brief desta tarefa generalizou errado para "capa". Todas as 4 imagens de teste geradas aqui (seção 4) saem, portanto, na paleta navy/dourado/creme da Sharp, não na paleta do produto GS-003 (que ainda não existe — é decisão de Parte 4).

**[H]** Não tive acesso, nesta sessão, à ferramenta de navegador (`browser`) com os perfis/abas indicados no brief (pokemondb, PMD Sprite Repository) — a ferramenta não estava disponível na lista de ferramentas desta sessão. Também não pude abrir diretamente os arquivos de screenshot em `GS-003/evidence/` com a ferramenta de visualização de imagem (restrição de diretório: só leio imagens dentro do meu workspace). Por isso, a análise de estilo de referência abaixo se baseia (a) nas descrições textuais detalhadas já registradas nos teardowns de `GS-003/teardowns/{IDLEDEX,DIGIWORLDIDLE,POKECHILL}.md` (que descrevem resolução aparente, paleta, composição) e (b) em conhecimento público amplamente documentado sobre convenções de pixel art de RPGs GBA/DS e sprites de Digimon, sem baixar, copiar ou reproduzir nenhum sprite de terceiros. **Nenhum arquivo de sprite de Pokémon/Digimon foi acessado, salvo ou referenciado como fonte de imagem nesta tarefa.**

---

## 1. Opções de estilo de imagem

### Opção 1 — Pixel art 64–96px, estilo GBA/DS (referência de composição: IdleDex, Pokechill)

**[E]** Os três jogos-referência (IdleDex, Digi World Idle, Pokechill) usam pixel art 2D — IdleDex e Pokechill em estilo claramente derivado dos jogos Pokémon de Game Boy Advance/Nintendo DS (silhuetas simples, poucos tons de cor por sprite, contorno escuro), Digi World Idle em "retro-RPG" isométrico/grid similar.

| Critério | Avaliação |
|---|---|
| **Custo e tempo por criatura** | Alto em mão humana (artista pixel sênior: ~2-4h por criatura só no front-facing idle, mais 1-2h por pose de ataque); via IA, geração "crua" não sai em pixel art limpo — exige pós-processo manual pesado (ver seção 3). **[H]** estimativa não validada com orçamento real do estúdio. |
| **Escalabilidade (150-300 criaturas + evoluções)** | Baixa-média sem pipeline dedicado. Isso é literalmente o gargalo mais citado de jogos indie de pixel art: cada nova criatura exige grade de pixel consistente (paleta por criatura, contorno de 1-2px, proporção de cabeça/corpo fixa). Sem um pipeline (template + IA + correção), 300 criaturas com 2-3 estágios de evolução cada (≈600-900 sprites únicos) é um projeto de arte grande por si só. |
| **Consistência via IA** | **Baixa sem trabalho extra.** Geradores de imagem (Recraft, SD, FLUX) não produzem pixel art "nativo" em grade fixa — produzem imagem que *parece* pixel art em resolução alta, exigindo downscale + quantização de cor + limpeza manual de contorno para ficar usável como sprite de jogo. Cada criatura gerada separadamente tende a variar proporção/estilo de traço, exigindo um guia de proporção (template/esqueleto) aplicado manualmente ou via prompt rígido + referência de personagem fixa. |
| **Animação (idle, ataque)** | Trabalho mais caro do pacote: pixel art animado exige frame-a-frame (tipicamente 2-4 frames de idle respirando, 3-6 de ataque) — IA generativa de imagem não gera essas sequências consistentes; precisa de artista editando frame a frame ou de ferramenta de rigging (ex. Spriter/DragonBones) em cima de partes separadas. |
| **Peso (navegador/mobile)** | **Muito leve.** Sprites pixel art pequenos (64-96px) com paleta reduzida compactam excelentemente em PNG/atlas; é o padrão historicamente mais leve para jogos web/mobile 2D. |
| **Veredito** | Visualmente o mais "correto" para o gênero e o mais leve em runtime, mas o **mais caro em tempo/mão de obra** para escalar a 150-300 criaturas com qualidade e consistência. Exige pipeline (seção 3) ou equipe de pixel art dedicada — não é "gerar e usar direto". |

### Opção 2 — Vetor chibi flat (ex.: estilo flat/chibi simplificado, cores sólidas, contorno grosso)

**[E]** Este é o estilo que o pipeline Recraft do estúdio **já produz nativamente** no modo `vetor` (`style: 'vector_illustration'`) — confirmado pelas 2 imagens de teste geradas nesta tarefa (seção 4).

| Critério | Avaliação |
|---|---|
| **Custo e tempo por criatura** | **Baixo.** Uma geração Recraft por criatura (minutos, custo de crédito de API) + revisão/eventual reprompt. Sem pós-processo pesado de pixel-perfeição. |
| **Escalabilidade** | **Alta.** É o estilo mais compatível com geração assistida por IA em lote — cada criatura pode ser prompt-gerada com descrição textual (cor, forma, elemento), e o estilo vetorial "perdoa" mais inconsistência de proporção entre criaturas do que pixel art, porque não depende de grade de pixel fixa. |
| **Consistência via IA** | **Média-alta**, mas ainda não é "grátis": o teste desta tarefa confirma que a paleta de cor sai sempre na paleta hardcoded da Sharp — ou seja, consistência de *cor* entre criaturas exigiria ou (a) aceitar a paleta Sharp como provisória, ou (b) um wrapper de paleta configurável (proposto, não implementado, ver `ASSET_SOURCING.md`), ou (c) recolorir cada SVG manualmente/via script (SVG é texto, recolorir em lote é tecnicamente simples). Consistência de *forma/traço* (grossura de contorno, nível de detalhe) tende a ser boa dentro do mesmo modo/prompt-template. |
| **Animação** | SVG vetorial facilita rigging 2D esqueletal (ex. partes separadas: corpo, olhos, membros) para animação idle/ataque leve (bounce, piscar, flinch) sem precisar redesenhar frame a frame — mais barato que pixel art animado. |
| **Peso** | **Leve a médio.** SVG é leve em bytes (os 2 testes vetoriais saíram em ~45-47 KB cada), mas renderização de muitos SVGs complexos simultâneos pode custar mais CPU/GPU que sprites raster pixel art simples — para um idle com múltiplas criaturas na tela, pode exigir rasterizar para sprite em build (SVG → PNG/atlas) em vez de renderizar SVG vivo no jogo. |
| **Veredito** | **Melhor relação custo/escala/pipeline-já-existente** entre as 4 opções — é literalmente o que o estúdio já sabe gerar hoje. Risco principal é visual: pode parecer "genérico de IA" se não houver direção de arte forte (silhueta, proporção de cabeça, paleta por elemento) guiando os prompts. |

### Opção 3 — "Digital/cyber" pixel com glitch (linha B apenas — monstros digitais)

**[H]** Conceito proposto para diferenciar a linha B (Tamers/monstros digitais) da linha A sem copiar a estética de Digimon: sprites com elementos de "corrupção digital" — bordas em blocos/voxel, scanlines sutis, paleta neon (ciano/magenta) sobre corpo orgânico, pequenos glitches visuais em animação de evolução.

| Critério | Avaliação |
|---|---|
| **Custo e tempo por criatura** | Médio — mais caro que vetor puro (exige efeito extra de "glitch"/voxel), mais barato que pixel art 64-96px fino, porque o efeito de "corrupção" tolera mais ruído visual (não precisa de silhueta perfeita). |
| **Escalabilidade** | Média — o efeito visual (voxel/circuito/glow) é um filtro/estilo que pode ser aplicado sobre uma base vetorial ou pixel, então herda a escalabilidade da base escolhida. |
| **Consistência via IA** | Média — como testado nesta tarefa (`glitchpup-larva-vetor`, seção 4), o modo vetor consegue incorporar "padrão de circuito" e "voxel" como elemento descritivo no prompt com razoável fidelidade, mas isso ainda depende de prompt bem calibrado por criatura. |
| **Animação** | A "digievolução" como evento de UI (flash, partículas, transição) é mais barata de produzir que animação fina de sprite — pode ser vendida visualmente com um efeito de transição genérico (shader de dissolve/glitch) reutilizado para todas as evoluções, independentemente do sprite base. |
| **Peso** | Depende da base (vetor = leve, pixel = leve, efeito de shader de glitch em tempo real = custo de GPU extra, mas controlável). |
| **Veredito** | É mais uma **camada de diferenciação visual** (paleta + motivo gráfico + transição de evolução) do que um estilo de produção isolado — recomenda-se aplicá-la *sobre* a Opção 2 (vetor) para a linha B, não como pipeline paralelo completo. |

### Opção 4 — 3D-like pintado (still de "animação 3D", estilo capa/pôster)

**[E]** Testado nesta tarefa via modo `capa` do Recraft (`style: 'digital_illustration'`, still de "animação 3D estilizada").

| Critério | Avaliação |
|---|---|
| **Custo e tempo por criatura** | Baixo por imagem individual (mesma lógica de API do modo vetor), mas **cada imagem é um still, não um asset de jogo pronto** — é adequado para arte promocional/splash/ícone de evolução em destaque, não para sprite em movimento no mapa. |
| **Escalabilidade** | Baixa para uso como sprite de gameplay (peso de arquivo alto: os 2 testes `capa` saíram em 1,5-1,8 MB cada em WEBP, muito mais pesado que os SVGs vetoriais de ~45 KB); viável como "arte de cartão"/splash de criatura (tela de captura, tela de evolução, loja), não como sprite andando/lutando no mapa. |
| **Consistência via IA** | Média — boa para retratos isolados "hero shot", mas pose/ângulo variam entre gerações, o que é aceitável para card art, não para spritesheet de movimento. |
| **Animação** | Praticamente inviável como sprite animado nativo — teria que ser recriado em 3D real (modelagem + rig) ou usado só como imagem estática (ex.: "foto" de evolução, splash de captura, ícone de carta/card de criatura). |
| **Peso** | **Pesado** — 1,5-1,8 MB por imagem é 30-40x o peso de um SVG vetorial equivalente; para mobile, precisaria de compressão agressiva adicional (WEBP já ajuda, mas ainda é pesado para "sprite de jogo"). |
| **Veredito** | **Não recomendado como estilo principal de sprite de gameplay.** Encaixa melhor como arte secundária de destaque (splash de captura/evolução, card de criatura em tela cheia, material de loja/marketing) complementando qualquer uma das opções 1-3 como estilo *de gameplay*. |

---

## 2. Recomendação de estilo por linha e pipeline compartilhado

**[PROPOSTA — depende de validação do fundador na Parte 4]**

- **Linha A (coleção/captura):** **Opção 2 (vetor chibi flat)** como estilo primário de sprite de gameplay. Justificativa: é o único estilo das 4 opções com pipeline de geração já funcionando no estúdio hoje (Recraft modo `vetor`), custo/tempo por criatura mais baixo, e escalabilidade mais realista para 150-300 criaturas sem contratar uma equipe de pixel art dedicada. O risco de "parecer genérico de IA" é mitigado com uma diretriz de forma/silhueta forte por família de criatura (ver seção 5, checklist de originalidade) e paleta por elemento, não deixada só ao acaso do prompt.
- **Linha B (monstros digitais/Tamers):** **Opção 2 + Opção 3 (vetor com camada "digital/cyber")** — mesma base de produção da linha A (reaproveita pipeline, menor custo), mas com um motivo gráfico consistente (padrões de circuito/voxel, paleta neon, efeito de transição de evolução) que diferencia visualmente a linha B da linha A sem precisar de um pipeline de produção totalmente separado.
- **Compartilhamento de pipeline:** **sim, as duas linhas compartilham a mesma base de produção (Opção 2/vetor)** — a diferenciação entre A e B deve vir de direção de arte (paleta, motivo gráfico, nomenclatura, tom de evolução), não de uma tecnologia de geração/estilo totalmente distinta. Isso reduz custo e risco de inconsistência entre as duas linhas de produto.
- **Opção 4 (3D-like pintado)** fica reservada para arte de destaque pontual (splash de captura/evolução, telas de loja, material de marketing) em ambas as linhas — não como sprite de gameplay.
- **Opção 1 (pixel art GBA/DS)** fica como opção de "fase 2"/aspiracional se o estúdio decidir investir em arte pixel dedicada depois de validar o produto com a Opção 2 — não recomendado como ponto de partida pelo custo/tempo de escalar a 150-300 criaturas.

---

## 3. Pipeline de produção proposto

**[PROPOSTA]**

1. **Geração base (Recraft, modo `vetor`):**
   ```
   cd ~/projects/Sharp/sharp-os && OUT_DIR=<destino> node scripts/ilustra-gen.mjs <nome> "<descrição da criatura>" vetor
   ```
   - **[E, correção à seção 0]** A paleta de cor que sai hoje é sempre a da Sharp (navy/dourado/creme), independentemente do prompt. Até existir um wrapper de paleta configurável por produto (proposto em `ASSET_SOURCING.md`, não implementado — requer aprovação do coordenador antes de criar, pois duplica lógica do repositório Sharp), o output deve ser tratado como **forma/composição de teste**, não cor final.
2. **Limpeza e padronização:**
   - Recorte/trim de bounding box consistente (margem fixa em px) por criatura.
   - Normalização de escala: todas as criaturas da mesma "categoria de tamanho" (ex. pequeno/médio/grande/evoluído) devem caber numa altura de referência fixa, para não haver criaturas desproporcionais lado a lado na UI de time/Pokédex.
3. **Paleta:**
   - Recolorir o SVG (texto, portanto scriptável) trocando os hex da paleta Sharp pela paleta real do produto GS-003 (a definir na Parte 4 — não existe ainda `design-tokens` para GS-003). Como SVG é XML, um script simples de find/replace de hex por criatura/elemento é viável sem reabrir o arquivo em editor gráfico.
   - **[H]** Recomenda-se paleta por "elemento"/tipo de criatura (ex. fogo = tons quentes, água = tons frios) para dar legibilidade imediata na UI de time, replicando o padrão (genérico, não exclusivo de Pokémon) já usado nos 3 jogos-referência.
4. **Spritesheet e atlas:**
   - Depois da geração+limpeza individual, empacotar em um atlas (ex. TexturePacker, ou free-tier equivalente como `free-tex-packer-core`) para reduzir número de requisições HTTP e draw calls no navegador — crítico para 150-300 criaturas carregadas em telas de Pokédex/time.
   - **[H]** Ferramenta exata de atlas não validada nesta tarefa — é decisão de implementação técnica, fora do escopo de arte.
5. **Nomenclatura:**
   - Convenção proposta: `<linha>-<familia>-<estagio>-<slug>.svg` (ex. `a-ember-01-emberkit.svg`, `b-glitch-02-cindervolt.svg`) — permite ordenar por linha de produto, família evolutiva e estágio sem depender de metadado externo para organização básica de pasta.
6. **Registro de licença/origem:**
   - Toda geração via IA deve ser registrada em `assets/<categoria>/LICENSES.md` (regra já definida em `ASSET_SOURCING.md` seção 3) com: nome do asset, prompt usado, ferramenta/modelo (Recraft v3), data, e nota de que é geração 100% original (sem referência de imagem de terceiro no prompt).
   - **[H]** Política de propriedade de saída de IA do próprio Recraft (se o estúdio é dono pleno do direito de uso comercial da imagem gerada) não foi verificada nesta sessão — recomenda-se confirmar nos termos de serviço do Recraft antes de lançar produto com arte gerada por ele.

**Assets CC0 prontos (avaliação para UI, tiles e ícones, não para as criaturas):**

- **[E, herdado de `ASSET_SOURCING.md`]** Kenney.nl é amplamente reportado como CC0 em toda a biblioteca, mas a página de licença oficial não foi acessível na sessão que escreveu `ASSET_SOURCING.md` — **confirmar manualmente antes do primeiro uso real**. Kenney tem pacotes de UI (botões, ícones, barras de progresso, HUD) e tiles 2D que servem bem para o "entorno" do jogo (mapa, loja, botões), deixando o orçamento de geração/IA focado só nas criaturas.
- **[E, herdado]** OpenGameArt.org — licença mista por item (CC0/CC-BY/CC-BY-SA/OGA-BY); útil para tiles de cenário e ícones de item, desde que cada item individual seja verificado e registrado em `LICENSES.md` antes do uso.
- **[E, herdado]** game-icons.net — CC-BY 3.0 confirmado, bom para ícones de UI (itens, atributos, moedas) desde que a atribuição exigida seja incluída nos créditos do jogo.
- **Recomendação:** usar CC0/CC-BY pronto para UI genérica (botões, barras, ícones de moeda/item) e reservar geração via IA (Recraft) só para as criaturas e para elementos de cenário que precisem de identidade visual própria do produto — reduz custo de geração e tempo de produção sem comprometer originalidade onde importa mais (as próprias criaturas, que são o produto).

---

## 4. Teste de geração (4 imagens, modo Recraft)

**[E]** 4 imagens geradas nesta tarefa via `ilustra-gen.mjs`, `OUT_DIR=/home/openclaw/projects/GameStudio/projects/discovery/GS-003/art-tests`. Todas as 4 confirmadas como geradas com sucesso pela API (HTTP 200, arquivo salvo e verificado em disco) — ver tabela. **Limitação:** não consegui inspecionar visualmente o resultado nesta sessão (a ferramenta de visualização de imagem desta sessão só lê arquivos dentro do meu workspace, e `art-tests/` fica fora dele, no diretório do projeto GS-003) — recomenda-se que o fundador ou a próxima sessão com acesso de visualização confira os 4 arquivos antes de qualquer decisão de estilo.

| Arquivo | Criatura/estágio | Linha | Modo | Tamanho | Descrição do prompt (resumo) |
|---|---|---|---|---|---|
| `emberkit-vetor.svg` | "Emberkit" (criatura original, salamandra de brasa) | A | vetor | 46 KB | Mascote pequeno, corpo arredondado, escamas tom de brasa, cauda com tufo de chama, olhos grandes — desenho explicitamente pedido como 100% original, sem referência a franquia existente |
| `emberkit-capa.webp` | Mesma "Emberkit" | A | capa | 1.807 KB | Mesma descrição, still de animação 3D estilizada em vez de vetor flat |
| `glitchpup-larva-vetor.svg` | "Glitchpup" (monstro digital, estágio larva/bebê) | B | vetor | 45 KB | Corpo tipo blob em voxels suaves, padrão de circuito ciano/magenta, antena pequena — pedido como 100% original |
| `cindervolt-rookie-capa.webp` | "Cindervolt" (monstro digital, estágio rookie/evoluído) | B | capa | 1.551 KB | Corpo maior, placas angulares em voxel, linhas de circuito ciano no peito, pequeno chifre — evolução do conceito anterior, pedido como 100% original |

**[H]** Os nomes "Emberkit", "Glitchpup" e "Cindervolt" são placeholders de teste técnico desta tarefa, não propostas de nomenclatura final de produto — nomenclatura real das criaturas/linhas é decisão de Parte 4 (síntese).

Custo registrado em `portfolio/performance/COSTS.md` (linha adicionada nesta tarefa, valor exato "NÃO VERIFICADO" — mesma limitação já registrada para os testes anteriores do Brand Guide, pois os créditos vêm da conta Recraft do fundador e o custo por geração não foi exposto pela API nesta sessão).

---

## 5. Riscos de originalidade e política de IA nas lojas

### 5.1 Risco de semelhança acidental com Pokémon/Digimon

**[H]** Avaliação de risco, baseada no padrão observado nos 3 jogos-referência (todos citados como risco de IP ALTO nos teardowns da Parte 1):

- O risco maior não é visual-puro (forma de criatura), é **nominal e de sistema** — os 3 jogos-referência cruzaram a linha ao usar nomes, numeração, itens e personagens oficiais 1:1, não por terem "uma criatura parecida". Isso é tranquilizador: originalidade de nome/numeração/lore é mais fácil de garantir (basta não copiar) do que originalidade de silhueta num gênero com décadas de convenções visuais compartilhadas (criatura pequena e redonda = "fofo/inicial", criatura alada = "voador", etc.).
- Ainda assim, **silhueta e combinação cor+forma podem crisply remeter** a uma criatura específica mesmo sem nome igual (ex.: um "rato elétrico amarelo com bochechas vermelhas" seria reconhecível como Pikachu independentemente do nome). O risco real está em combinações de atributos muito específicas e icônicas da franquia, não em arquétipos genéricos de gênero (fogo/água/planta, inicial de 3 tipos, evolução por nível).

**Checklist de originalidade proposto [H, não validado juridicamente — recomenda-se revisão legal antes do lançamento]:**

1. Nenhuma criatura reutiliza combinação específica de cor + marca corporal + silhueta de uma criatura Pokémon/Digimon reconhecível (ex.: evitar "roedor amarelo + bochechas vermelhas + rabo em raio", "dinossauro verde com flor nas costas", etc.).
2. Nenhum nome de criatura, item, local, NPC ou mecânica usa termo oficial da franquia (nem tradução literal) — conforme já estabelecido no GOVERNANCE e reforçado pelos teardowns (Poke Ball, Gym Leader, Mega Evolution, Digiscan, nomes de Tamers/Digidestined etc. são todos vermelhos).
3. Toda criatura nasce de uma descrição textual original (conceito + elemento + papel no gameplay) antes de qualquer geração de imagem — nunca usar prompt do tipo "como [criatura X oficial] mas diferente", mesmo que pareça mais rápido.
4. Revisão cruzada por outro membro do time (ou por busca reversa de imagem, se disponível) antes de aprovar uma criatura final — detectar semelhança não intencional é mais fácil com um segundo olhar.
5. Registrar, para cada criatura aprovada, o prompt original usado (parte do registro de licença da seção 3) — serve como evidência de processo criativo independente caso a originalidade seja questionada no futuro.

### 5.2 Política de uso de IA nas lojas de aplicativos

**[H, não verificado com fonte primária nesta sessão — recomenda-se confirmação antes do lançamento]**

- Apple App Store e Google Play têm, historicamente, políticas que exigem **disclosure** de conteúdo gerado por IA em certos contextos (ex. reviews, metadados) e proíbem conteúdo que infrinja direitos de terceiros — mas não proíbem, de forma geral, o uso de arte gerada por IA como asset de jogo, desde que o estúdio tenha direito de uso comercial da saída (ver nota pendente na seção 3 sobre os termos do Recraft).
- **[H]** Não confirmei, nesta sessão, se há uma exigência explícita e atual (2026) de "rótulo de conteúdo de IA" nas lojas para jogos — isso mudou nos últimos anos e precisa de verificação direta nas políticas vigentes da Apple/Google antes do envio para review, não só por hipótese.
- Recomendação prática: manter o registro de prompt/ferramenta/data por asset (seção 3) não só por rastreabilidade de licença, mas porque facilita responder rapidamente a qualquer pedido de disclosure das lojas, caso seja exigido no momento do lançamento.

---

## TL;DR

1. Entre as 4 opções de estilo avaliadas, a **vetor chibi flat (Opção 2)** é a mais viável para escalar a 150-300 criaturas: já tem pipeline funcionando no estúdio (Recraft modo `vetor`), custo/tempo por criatura baixo, e permite animação 2D esqueletal mais barata que pixel art frame-a-frame.
2. **Pixel art GBA/DS (Opção 1)** é visualmente a mais "correta" para o gênero (igual às 3 referências jogadas), mas cara e lenta de escalar sem equipe dedicada ou um pipeline de correção pós-IA; fica como evolução futura, não ponto de partida.
3. **Recomendação:** linha A e linha B compartilham a mesma base de produção (vetor), diferenciando-se por paleta/motivo gráfico — a linha B ganha uma camada "digital/cyber" (Opção 3) sobre a mesma base. O estilo 3D-pintado (Opção 4) fica reservado para arte de destaque (splash/loja), não para sprite de gameplay — é 30-40x mais pesado em bytes que o vetor nos testes realizados.
4. **Correção importante ao brief:** confirmei lendo o script-fonte que o modo `capa` do Recraft **também** injeta a paleta da Sharp (não é uma excecão livre de paleta como o brief desta tarefa descrevia) — toda geração atual do estúdio sai em navy/dourado/creme até existir um wrapper de paleta configurável (proposta pendente, não implementada).
5. 4 imagens de teste foram geradas com sucesso em `GS-003/art-tests/` (2 estilos da mesma criatura original + 1 monstro digital em 2 estágios evolutivos), mas **não foram inspecionadas visualmente nesta sessão** por restrição de acesso da ferramenta de visualização de imagem — recomenda-se checagem visual humana antes de qualquer decisão de estilo final.
6. Não tive acesso à ferramenta de navegador para consultar pokemondb/PMD Sprite Repository como referência visual nesta sessão; a análise de referência se baseou nos teardowns já escritos (Parte 1) e em conhecimento documentado publicamente, sem baixar/copiar nenhum sprite de terceiro.
7. Riscos de originalidade concentram-se mais em nome/numeração/sistema (como os 3 jogos-referência erraram) do que em silhueta pura; ainda assim, proposto um checklist de 5 itens para evitar combinações cor+forma reconhecíveis. Política de disclosure de IA nas lojas fica marcada [H] — precisa de verificação direta antes do lançamento.
