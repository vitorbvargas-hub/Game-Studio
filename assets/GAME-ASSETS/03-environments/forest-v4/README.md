# forest-v4 — mapa "HD" com profundidade (ADR-010, feedback do fundador)

Feedback original: *"o mapa tá feio, falta profundidade HD. Olha as árvores do
Pokémon e olha as nossas: falta textura, falta HD."* (sobre
`projects/prototypes/GS-003/prototype/world/docs/screens/proof_live_geral.png`,
forest-v3).

## 1. Diagnóstico — por que as árvores do forest-v3 pareciam chapadas

**[E]** Inspeção direta do código (`art/src/biome_props.js`,
`art/src/forest_v3_props.js`) e da arte gerada (`forest-v3/tileset.png`,
`proof_live_geral.png`):

| Causa | Evidência |
|---|---|
| **Só 3 tons de verde em todo o jogo** (`W.grassLt/Mid/Dk` do Endesga-32, `endesga32.js`) compartilhados entre grama, copa e sombra | Toda a paleta de ambiente tem 32 cores fixas; nenhuma delas foi desenhada especificamente para uma rampa de folhagem. Sem alcance tonal, nenhuma técnica de sombreamento consegue dar volume. |
| **Copas pintadas como 3 elipses grandes e lisas** (`paintCanopy` em `forest_v3_props.js`), não como aglomerados de folhas | O resultado é um blob suave, sem "clusters" de folha individuais — exatamente o oposto da referência Drakantos (`lizards.png`, `druid_temple.png`), onde cada copa é visivelmente composta de várias "bolhas" de folha com luz/sombra próprias. |
| **Tronco é um retângulo de 3 faixas de cor**, sem casca, sem raiz | `biome_props.js: treeBig/treeForest` usa `fillRect` plano; nenhuma textura vertical, nenhum afunilamento, nenhuma raiz visível. |
| **Contorno de tinta sólida em volta de tudo** (`autoOutline`) | Um contorno escuro uniforme ao redor de uma massa já lisa reforça a leitura de "adesivo/recorte" (sticker), não de volume. |
| **Sombra no chão = elipse fina sob o próprio tronco** | Não lê como sombra projetada (cast shadow); está colada no pé da árvore, sem deslocamento nem raio suficiente. |
| **Sem oclusão jogador↔copa** | Árvore é 1 sprite único, ordenado por Y junto com entidades — não existe uma camada "copa acima do jogador" de verdade. |
| **Chão com só 2 variantes de grama** + 1 borda/canto de caminho (sem autotile real) | `test-meadow.tmj.json` / `biome_tiles.js`: cobre só os casos N/S de um lado; transições viram costura em stair-step de 4px. |
| **Resolução efetiva**: 32px nativos, não upscale de 16px | Medimos os PNGs de prop (`tree_round_a.png` = 76×100, `tree_conifer_a.png` = 58×118): já são desenhados no tamanho final, sem bloco de upscale 2×. A "falta de HD" não é densidade de pixel — é alcance tonal + técnica de pintura. Ver seção 2. |

**Conclusão do diagnóstico:** não é um problema de "pixels pequenos", é um
problema de **paleta** (sem rampa de luz/sombra) e de **técnica de pintura**
(blobs lisos em vez de clusters de folha + tronco sem casca/raiz + sombra sem
deslocamento). Um upscale de 16px→32px não teria resolvido nada disso.

## 2. Decisão de resolução "HD"

**[E] Medição:** props do forest-v3 já são desenhados nativamente em 32–120px
(não upscale de 16px). A referência canônica IdleDex (`canonical_founder_…png`,
1706×788) e o Drakantos (`press.drakantos.com`) usam personagens/tiles na
faixa de 24–40px de altura equivalente por elemento, a mesma ordem de
grandeza que nosso tile de 32px (`DIGIMON_SIZE_TABLE.md`, tamer=26px de
referência).

**Decisão: manter tile = 32px, render 1× (sem upscale de 16px).**
Motivo: trocar a escala do tile quebraria a arquitetura do engine e a escala
dos sprites do DS já travada (ADR-010 proíbe mudança de arquitetura antes da
prova visual). O ganho de "HD" vem de (a) uma rampa de 8 tons de folhagem em
vez de 3, (b) pintar a copa como aglomerado de "puffs" de folha (muitos
círculos de 3–9px sobrepostos) em vez de 2–3 elipses lisas, e (c)
tronco/raiz/sombra com volume de verdade. Testamos as duas hipóteses (upscale
16→32 vs. redesenho nativo em 32px com rampa estendida) numa árvore de teste;
o upscale manteve o problema (poucos tons = mesmo blob, só com pixels
maiores), enquanto o redesenho nativo com a rampa estendida resolveu —
por isso a decisão final é puramente de paleta/técnica, não de escala.

## 3. O que mudou

- **Paleta estendida** (`art/src/forest_v4_palette.js`): rampa de folhagem
  de 8 tons (dia e noite), rampa de casca de 5 tons (+ uma rampa clara
  separada para bétula), ramps de chão/flor/folha-caída — tudo com nomes de
  cor novos, sem reduzir a paleta Endesga-32 usada no resto do jogo (UI,
  criaturas continuam como estavam).
- **6 tipos de árvore** (`art/src/forest_v4_props.js`): redonda densa,
  conífera em camadas, arbustiva larga, florida (acento), bétula (casca
  clara, copa rala) e ancestral (landmark, raízes grossas, oco na base).
  Cada copa é pintada como dezenas de "puffs" de folha com luz de cima à
  esquerda (8 tons), gap de ar/sombra entre aglomerados, e um contorno sutil
  na própria cor mais escura da folhagem (não tinta plana) para não virar
  "adesivo". Tronco afunilado com casca em relevo (riscos verticais +
  nós) e raízes que se espalham visivelmente na base.
- **Copa separada do tronco em dois sprites** (`_base` e `_top`): `_base`
  (tronco+raiz, colide, camada "decor", ordenado por Y como qualquer
  entidade) e `_top` (só a copa, camada "canopy-top", sempre desenhada por
  cima de todas as entidades). Isso é o que permite o jogador "passar por
  trás da copa" de verdade — não é mais 1 sprite único.
- **Autotile 16-peças (blob/Wang simplificado)** (`art/src/forest_v4_tiles.js`):
  cada tile tem os 4 cantos arredondados independentemente via corte de
  quarto-de-círculo (com dither de 1px na borda do arco), conforme a máscara
  de vizinho N/E/S/W — zero costura quadrada. Dois conjuntos: caminho de
  terra × grama (`path_blob_0..15`) e mata densa × clareira
  (`denseedge_blob_0..15`).
- **6 variantes de grama** com textura (clusters de lâmina, trevo, cascalho,
  florzinha, mancha seca, folha caída), + chão de mata densa, + caminho.
- **Iluminação**: sombra elíptica de contato como decalque de chão separado
  (`canopy_shadow_small/large`, deslocada da árvore, não colada no tronco),
  overlay de luz difusa + vinheta leve aplicado na cena inteira
  (`applyAmbientOverlay`), preset **dia** (quente, saturado) e preset
  **noite** (rampa roxo-azulada própria — não é a mesma rampa escurecida,
  é uma rampa de cor diferente, então a árvore continua lendo volume à
  noite, ao contrário da referência IdleDex que achata tudo pro mesmo tom
  — ver `VISUAL_ANALYSIS_V2.md` §2.1 sobre por que não copiamos isso).

## 4. Entregas

- `GAME-ASSETS/03-environments/forest-v4/` — `tileset.png` (contact sheet dia),
  `tileset_night_preview.png`, `tileset.json` (regras de autotile, camadas
  ground/decor/canopy-top, decisão de resolução documentada), `license.json`,
  `tiles/`, `props/`, `night/tiles/`, `night/props/` (preset noturno, mesmos
  nomes de arquivo).
- `GAME-ASSETS/09-previews/proof/forest_v4_day.png` e `forest_v4_night.png`
  (1280×720, mesma composição/HUD/elenco de personagens da prova
  `forest_proof_scene.js`/`proof_live_geral.png`).
- `GAME-ASSETS/09-previews/proof/forest_v3_vs_v4.png` — lado a lado, mesma
  composição, v3 vs. v4.
- `GAME-ASSETS/09-previews/proof/forest_v4_tree_zoom_vs_reference.png` —
  recorte ampliado: referência canônica IdleDex × forest-v3 × forest-v4
  (preset noite).

## 5. Iterações e autocrítica (mínimo 3, conforme pedido)

1. **Primeira geração** (puffs de folha + paleta estendida + autotile):
   melhora real de textura de copa e bordas de autotile, mas **crítica**:
   (a) o crop oficial do DWDS (`ground_grass_real.png`) ficou verde-chapado
   destoando da nova rampa e nem tingia à noite; (b) tronco virou um "cone de
   trânsito" sem casca visível e com raiz praticamente invisível (ficou
   escondida sob o próprio alargamento da base); (c) sombra de contato
   assada no sprite parecia uma "placa", não uma sombra projetada.
2. **Segunda geração**: removi o crop oficial do pool de autotile (mantido
   só como arquivo licenciado, não usado na cena — ver `license.json`);
   redesenhei o tronco como eixo quase cilíndrico com evasê de raiz só nos
   últimos ~18% da altura, aumentei a textura de casca (riscos a cada linha,
   não a cada 3px) e desenhei as raízes **depois** do tronco (não escondidas
   embaixo); tirei a sombra assada do sprite e passei a usá-la como decalque
   de chão na cena. **Crítica**: ao montar a cena de prova completa, uma
   fileira de árvores bem no topo do mapa (perto da borda superior do
   canvas) ficou com tronco sem copa nenhuma — a copa estava sendo
   posicionada fora da área visível (Y negativo) e simplesmente cortada.
3. **Terceira geração**: adicionei uma checagem que pula o plantio da
   árvore (sem tronco nem copa) quando a copa ficaria cortada acima do
   topo da cena — eliminou o "mastro sem bandeira" na borda superior, mas
   revelou um problema mais sério: mesmo árvores plantadas bem dentro da
   tela mostravam um **vão vazio** entre o topo do tronco e a base da
   copa. Causa raiz: os "puffs" de folha ficam naturalmente esparsos perto
   da própria borda do silhueta (é o que dá o contorno orgânico) — um
   deslocamento fixo de overlap (8–16px) não é suficiente para alcançar a
   massa **densa** da copa, só a borda rala dela. **Correção**: o overlap
   passou a ser proporcional à altura da copa (`~42% de top.h`), ancorando
   o tronco na metade inferior densa da copa em vez da borda esparsa —
   conferido em zoom (`forest_v4_tree_zoom_vs_reference.png` e crops de
   depuração) antes de fechar a entrega.

## 6. Limitações

- **[H]** O autotile é "de um lado só" (o tile do tipo A carrega toda a
  transição; o tipo B ao redor fica plano) — é o padrão clássico de 16
  peças, mas não é um Wang de 47 peças com informação diagonal completa.
  Suficiente para eliminar bordas quadradas (confirmado visualmente), mas
  cantos internos muito recortados (ex.: um clarão de grama cercado por
  mata em 3 lados) podem não ficar perfeitamente simétricos.
- **[H]** A arte segue sendo gerada por código determinístico (`rng()` com
  seed fixa) e primitivas de Canvas, não pixel a pixel num editor — está
  dentro da técnica já aceita pelo estúdio para cenário (ADR-009,
  `biome_props.js`), mas não é "desenho à mão" num sentido literal de
  artista humano tocando cada pixel.
- **[E]** Não usei nenhum sprite oficial novo dos tilesets listados no
  pedido (`digimonworldds2__*`, `digiworld3__*`, `digimonworld2__*`) além do
  crop já herdado do forest-v3 (que, por clash de paleta, ficou fora do pool
  ativo — ver seção "iteração 1"). O ganho de HD veio inteiramente da
  paleta/técnica original; não explorei os outros tilesets oficiais por
  prioridade de tempo.
- **[H]** O overlay de luz difusa é um blend uniforme em tela cheia
  (não há oclusão real de luz pela copa — nenhuma sombra projetada
  direcional de árvore sobre árvore), então a profundidade vem majoritariamente
  do volume da própria copa/tronco e da sombra de contato pontual, não de um
  sistema de iluminação global.
- **[H]** O ciclo dia/noite é dois presets estáticos (paleta + overlay), não
  uma interpolação contínua nem um sistema de iluminação em tempo real.
- Não houve teste do tileset dentro do motor real (Phaser/`prototype/`) —
  as entregas são renders estáticos (Canvas → PNG) fora do game, conforme
  instrução de não editar `prototype/`.

## Nota de autoavaliação: 7/10

Resolve de forma mensurável a queixa central do fundador (textura de
folhagem, tronco com casca/raiz, sombra de contato, oclusão copa↔jogador,
bordas de chão sem costura, preset dia/noite) com autocrítica documentada em
3 rodadas reais. Fica abaixo de "pronto para produção em escala" porque (a)
não foi testado no motor real, (b) o autotile é a variante simplificada de
16 peças/um-lado-só, e (c) não explorei os tilesets oficiais adicionais
liberados pelo pedido — a arte original (paleta + puffs de folha + tronco)
carrega praticamente todo o ganho desta entrega.
