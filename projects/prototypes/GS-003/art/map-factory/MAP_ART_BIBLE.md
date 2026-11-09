# MAP_ART_BIBLE — GS-003 Map Factory (direção de arte da fábrica de mapas)

- **Autor:** game-art · **Data:** 2026-11-09 · **Frente:** Map Factory (ADR-011), dentro do GS-003.
- **Base:** ADR-011 (orçamento, referências de terceiros, lista de agentes), ADR-010 (referência visual canônica), `ART_STYLE_GUIDE.md` (tile 32px, paleta Endesga-32, luz, contorno, escala criatura/Tamer), `VISUAL_ANALYSIS_V2.md` (gaps medidos contra IdleDex/Drakantos/Digimon), `docs/briefing/12_map_factory_v2.md` §2 e §4 (restrições herdadas e kit mínimo da etapa 2).
- Este documento **não substitui** o `ART_STYLE_GUIDE.md` — ele é a leitura desse guia aplicada especificamente a **tiles de mapa e props de cenário** (o que o briefing chama de papel "Art Director" da fábrica), que o guia original cobre mais fraco (ele é focado em criaturas/Tamer). Onde os dois conflitarem, o `ART_STYLE_GUIDE.md` vale (é o documento mais antigo e mais revisado) e a diferença fica anotada aqui.
- Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/decisão de direção não validada com jogador real.

---

## 1. Paleta por bioma

A paleta-base continua sendo **Endesga-32** (`ART_STYLE_GUIDE.md` §4), uma paleta só para mundo+criaturas+UI. Para mapas, cada bioma usa uma **sub-paleta fixa** dela, estendida com os ramps de 8 tons já definidos em `art/src/forest_v4_palette.js` (não reinventar cores por bioma — herdar o mesmo princípio de "poço único" do guia).

| Bioma | Sub-paleta (hex) | Ramp estendido já existente | Fonte |
|---|---|---|---|
| **Floresta Densa** (ativo) | verdes `#63c74d #3e8948 #265c42`, marrom/casca `#b86f50 #733e39 #3e2731`, água `#193c3e #124e89 #0099db #2ce8f5` | `forest_v4_palette.js`: `FOLIAGE_DAY`/`NIGHT` (8 tons), `BARK_DAY`/`NIGHT`, `GROUND_DAY`/`NIGHT` (grass/dirt/leafLitter/moss/stone/water), `FLOWER_DAY`/`NIGHT` | `art/src/forest_v4_palette.js` **[E]** já em produção |
| **Praia dos Postes** (ativo, `praia-v5`) | areia, mar, poste elétrico — ver `praia-v5/tileset.json`/`license.json` | Não tem ramp de 8 tons próprio ainda — usa recolor HSL de arte licenciada CC0, não pixel-matrix | `GAME-ASSETS/03-environments/praia-v5/` **[E]** |
| **Vila dos Bebês** (ativo, `vila-v5`) | idem praia, casas clareadas do tom "ruína" | Idem — recolor HSL, não ramp próprio | `GAME-ASSETS/03-environments/vila-v5/` **[E]** |
| **Montanha / Deserto / Zona Corrompida** (ainda sem mapa) | Não definido | — | Fora do escopo desta entrega — só a Floresta tem piloto no ADR-011 |

**Regra:** nenhum bioma usa uma cor fora do Endesga-32 original sem passar pelos ramps já aprovados (`forest_v4_palette.js` é o modelo a seguir para qualquer bioma novo — 8 tons de folhagem/água/pedra, luz de cima-esquerda, 1 acento por categoria). Se um bioma novo precisar de um ramp próprio, ele nasce como uma extensão do mesmo arquivo de paleta, não como paleta isolada (ver `ART_STYLE_GUIDE.md` §4 "por que uma paleta compartilhada única").

## 2. Tile 32px (não negociável nesta fase)

- **Tile de terreno = 32×32px**, `ART_STYLE_GUIDE.md` §2, confirmado pelo motor (`tileSize=32` em `prototype/world/src/sim/map.ts`, `.tmj.json` de todos os mapas ativos). Nenhuma mudança de escala sem aprovação do fundador (ADR-010 "sem mudança de arquitetura antes da prova visual").
- Escala de tela: fatores inteiros, nearest-neighbor, sem blur (`ART_STYLE_GUIDE.md` §2).
- Props podem ocupar múltiplos tiles (ex.: `bridge_h` = 3×1 tiles, árvores grandes = ~2×2), mas o **footprint de colisão** é sempre pensado em unidades de 32px, mesmo quando o sprite visual sangra para fora dele (ex.: a copa da árvore ultrapassa a base, ver §5).

## 3. Luz: fonte fixa superior-esquerda

- Herdado do `ART_STYLE_GUIDE.md` §5 e já em produção em `forest_v4_1_props.js`/`lighting.ts`: realce no quadrante **superior-esquerdo**, sombra no quadrante **inferior-direito**, em todo tile e prop, sem exceção.
- **Sombra projetada:** elipse alongada para baixo-e-direita sob o objeto (árvores, rochas, baú, placa — ver `forest-v6/tileset.json`/README para os props novos desta entrega, todos seguem essa regra).
- **Rim-light:** reforço de tom claro na borda virada para a luz (o `foliage[7]`/`stone[2]` do ramp), usado em copas de árvore e — nesta entrega — no topo esquerdo das rochas novas (`rock_big`/`rock_small`).
- Cenas noturnas usam a mesma direção de luz, só com paleta fria (`FOLIAGE_NIGHT`, `GROUND_NIGHT` etc.) e rim-light `#a6c0e8` em vez de `#dff08a` — ver `nightgrade.ts`. **Nem todo pacote tem versão noturna ainda** (ex.: `forest-v6` desta entrega é só dia — ver `FOREST_KIT_GAP.md`).

## 4. Proporções árvore / criatura / Tamer

Herdado de `ART_STYLE_GUIDE.md` §3 e `VISUAL_ANALYSIS_V2.md` §5.3 (`DIGIMON_SIZE_TABLE.md`):

| Entidade | Frame nativo | Relação ao tile (32px) |
|---|---|---|
| Bebê / In-Training | 32×32px | 1×1 tile |
| Rookie | 48×48px (≈1,0× o Tamer, `DIGIMON_SIZE_TABLE.md`) | 1,5×1,5 tiles |
| Champion | 64×64px (≈1,4× o Tamer) | 2×2 tiles |
| Tamer | 48×64px | 1,5×2 tiles |
| Teto de legibilidade (qualquer estágio, mesmo Mega) | nunca acima de ~1,5–1,6× o Tamer | — |

Para **árvores de mapa** (que não têm essa tabela, pois não são criaturas): a regra prática já em uso no forest-v4 é que o tronco (`tree_*_base`) tem colisão e ocupa tipicamente 1 tile de largura, e a copa (`tree_*_top`) pode sangrar até ~2× isso, ancorada pela regra de `canopyTopRule` (ver §5). Uma árvore não deve, de tronco a tronco, dominar mais do que ~2 tiles de largura no nível do chão — senão compete visualmente com um Champion (2×2 tiles) e quebra a leitura de escala relativa **[H]**, não medida contra uma referência externa, é uma inferência de consistência interna.

## 5. Camadas abaixo/acima do personagem

Duas convenções coexistem hoje — registradas aqui para quem monta um mapa novo não reinventar:

### Convenção do pacote de arte (`tileset.json` de cada bioma)
```
layers: ["ground", "decor", "canopy-top"]
```
- **ground:** chão (grama, água, trilha) — sem colisão, sempre abaixo de tudo.
- **decor:** props com Y-sort normal (tronco de árvore, rocha, baú, placa, ponto de cura) — entra na mesma ordenação por Y das entidades (Digimon, Tamers), então um prop "na frente" cobre a entidade atrás dele e vice-versa.
- **canopy-top:** **sempre** acima de toda entidade, independente de Y-sort — regra `canopyTopRule` do `tileset.json` do forest-v4: a copa da árvore nunca fica atrás de um Tamer/Digimon, mesmo que o pé da árvore esteja "atrás" dele na grade. Quando a copa cobre o jogador local ou a parceira, ela ganha alpha ~0,45 (ver `render/view.ts`) para não esconder o personagem.

### Convenção do briefing da fábrica (`docs/briefing/12_map_factory_v2.md` §4, etapa 3)
```
ground, ground_detail, objects_below, objects_above, collision (independente da arte), spawns, npcs, triggers, poi
```
Isso é a camada do **formato `.tmj`** (Tiled), que game-dev monta na etapa 3 do pipeline — não é 1:1 com `ground/decor/canopy-top` do pacote de arte. **Mapeamento recomendado** (decisão de direção de arte desta entrega, ainda não validada no motor):

| Camada do pacote (`tileset.json`) | Camada do `.tmj` (briefing) |
|---|---|
| `ground` | `ground` + `ground_detail` (variantes de grama/água puramente visuais vão em `ground_detail`) |
| `decor` (sem colisão: flor, cogumelo, folha caída, ponto de cura) | `objects_below` |
| `decor` (com colisão: tronco, rocha, baú, placa) | `objects_below` também, mas a **camada de colisão é sempre separada e independente da arte** (briefing §4: "camada de objetos, independente da arte") — o `collision:true/false` do `tileset.json` é só um **aviso** de qual peça normalmente bloqueia; quem decide o que bloqueia de fato num mapa específico é a camada `collision` do `.tmj`, montada por game-dev |
| `canopy-top` | `objects_above` |

Esta tabela é **[H]**, proposta por game-art para a etapa 3 do pipeline (game-dev monta o `.tmj`) — não foi testada contra o loader real do motor nesta entrega.

## 6. Regras de borda e transição (autotile)

Herdado e confirmado em produção (`forest-v4`/`forest-v4.1`):

- **Autotile de 16 peças (blob):** bitmask `N·1 + E·2 + S·4 + W·8`, corte de canto em quarto-de-círculo (raio 0 se as duas bordas vizinhas são do mesmo tipo, 7 se uma, 12 se nenhuma), com 1px de dither aleatório ao longo do arco — nunca um degrau quadrado de 4px. Usado por `path_blob` (trilha×grama), `denseedge_blob` (mata densa×clareira) e, nesta entrega, `water_blob` (água×grama, `forest-v6/tiles/`).
- **Autotile Wang-47 (8 vizinhos, 47 máscaras únicas):** evolução do blob de 16 peças, introduzida no forest-v4.1 para corrigir o "xadrez" que o blob de 16 formava em cantos internos (duas bordas sem a diagonal). Usado hoje só por `path_w47`/`denseedge_w47`. **A água desta entrega (`water_blob`) ainda está no nível do blob de 16** — upgrade para Wang-47 é trabalho futuro, não bloqueante para o piloto (ver `FOREST_KIT_GAP.md`).
- **Recorte suave no renderer:** o motor não desenha os PNGs Wang-47 cru — `src/render/pathsmooth.ts` faz um recorte por campo contínuo (B-spline + ruído) por cima, para a trilha não virar uma corrente de cruzes numa reta. Qualquer autotile novo que precise da mesma suavidade (ex.: um upgrade futuro de `water_blob` para Wang-47) deveria seguir esse mesmo padrão, não reimplementar do zero.
- **Regra de fora-do-mapa:** cada autotile define o que acontece na borda do mundo (`forest-v4.1`: trilha conta como aberta fora do mapa, mata conta como mata fora do mapa). Um autotile novo precisa declarar isso explicitamente no `tileset.json`/`aliases.json` — não é um padrão automático do motor.
- **Nunca** misturar blob de 16 e Wang-47 do mesmo terreno no mesmo mapa (um escolhe um dos dois por terreno, documentado no campo `supersedesForNewMaps` do `tileset.json`).

## 7. O que é proibido misturar

1. **Paleta:** nenhum tile/prop usa uma cor fora do Endesga-32 + ramps aprovados (§1). Um prop "quase certo" que precisar de uma cor nova entra como extensão do ramp existente (`forest_v4_palette.js`), não como hex solto no código do prop.
2. **Técnica de desenho:** nada de `fillEllipse`/`fillCircle`/`fillPolygon` usado como "forma paramétrica da criatura inteira" (ADR-009, a técnica que o fundador reprovou para corpos de criatura) — essas primitivas **são permitidas e esperadas** para cenário (árvore, rocha, prop), que é um escopo diferente (`forest_v4_props.js` já segue essa distinção).
3. **Resolução:** nenhum sprite de criatura oficial (DW DS/Dawn/Dusk, camada `official-fan-use`) é redimensionado com interpolação — só nearest-neighbor por fator inteiro, ou nativo com padding transparente (`ART_STYLE_GUIDE.md` §2 "Alinhamento com os sprites oficiais"). Isso vale também para qualquer tile/prop de terceiro eventualmente licenciado (ex.: se um dia voltar a usar Ninja Adventure como o `forest-v5` tentou).
4. **Contorno:** props de cenário usam `rimDarken()` (silhueta suavizada na própria cor mais escura do ramp) OU o contorno 1px `#181425` de `autoOutline()` — nunca os dois ao mesmo tempo no mesmo sprite (duplica a borda e lê como "zoado").
5. **IP de terceiro em pixel:** referências de estilo (Drakantos, IdleDex, Digimon) informam composição/paleta/luz — nunca viram cópia pixel a pixel. Isso já é regra do `ART_STYLE_GUIDE.md` §8 e do ADR-011 §5; aqui ela se aplica também a **tiles de mapa** (ex.: um tile de água "parecido demais" com um tileset específico de terceiro não é aceitável mesmo que o ADR-011 permita referência de estilo).
6. **Fonte de luz:** nenhum tile/prop usa uma direção de luz diferente de cima-esquerda, mesmo em efeitos (tocha, ponto de cura) — a luz própria do efeito (ex.: o brilho do `healing_point`) pode ser onidirecional (é uma fonte de luz própria), mas a sombra/rim do objeto ao redor dela continua seguindo a luz do mundo.
7. **Camadas:** nenhum prop com colisão (`collision:true`) entra na camada `canopy-top`/`objects_above` — essa camada é, por definição, sempre acima de toda entidade e nunca bloqueia passagem (senão o jogador "esbarra" em algo que está visualmente atrás dele).

## 8. Checklist de aprovação de asset

Antes de um tile/prop novo entrar num pacote em produção (seja via PixelLab ou pipeline local):

- [ ] **Paleta:** usa só Endesga-32 + ramps já aprovados (§1), nenhuma cor nova fora de um ramp estendido documentado.
- [ ] **Tile:** se for chão, é múltiplo exato de 32×32px; se for prop, o footprint de colisão pretendido é declarado em tiles (ex.: "3×1").
- [ ] **Luz:** realce superior-esquerdo, sombra inferior-direita, sombra de contato em elipse sob a base (§3).
- [ ] **Camada:** `suggestedLayer` (`ground`/`decor`/`canopy-top`) e `collision` (true/false) declarados no `tileset.json`, com uma frase justificando (ex.: "walkable", "bloqueia path").
- [ ] **Autotile (se aplicável):** segue o bitmask documentado (16-blob ou Wang-47), sem degrau quadrado na emenda, com a regra de fora-do-mapa declarada.
- [ ] **Técnica/origem:** `license.json` do pacote lista o asset com `layer` (`original` / `official-fan-use` / terceiro licenciado), técnica usada e, se aplicável, fonte+data+licença (§7 regra 5 e `ASSET_LICENSE_POLICY.md`).
- [ ] **Não-cópia:** nenhuma referência visual ficou aberta lado a lado enquanto o pixel era desenhado (checklist "não copiar" do `ART_STYLE_GUIDE.md` §8, que se aplica a qualquer asset `original`, tile incluso).
- [ ] **Preview:** existe uma prancha PNG mostrando o asset em contexto (sozinho em 2–4× e, se possível, ao lado de uma peça já aprovada do mesmo bioma, para checar se a paleta/luz bate).
- [ ] **Custo registrado (se via PixelLab):** prompt, ferramenta, custo e saldo restante anotados em `shared/tools/map-factory/logs/pixellab-usage.csv` (briefing §6) — ver `PIXELLAB_PLAN_40.md` desta entrega para o plano ainda não executado (MCP em 401).
- [ ] **Aprovação visual do fundador** antes do asset entrar no mapa final (briefing §4, gate da etapa 2) — nada desta entrega foi aprovado ainda; `forest-v6` é proposta, não produção validada.

## 9. Limitações

- Este documento é direção de arte **[H]** para a frente Map Factory especificamente — não foi testado com jogador real nem com o fundador ainda (gate pendente, §8 último item).
- O mapeamento de camadas §5 (pacote de arte → `.tmj`) é uma proposta de game-art para a etapa 3; só game-dev, ao montar o `.tmj` de verdade, confirma se esse mapeamento funciona no loader do motor.
- A tabela de proporção árvore×criatura×Tamer (§4) mistura uma regra medida (`DIGIMON_SIZE_TABLE.md`, criaturas) com uma regra inferida (árvores, sem medição externa) — marcado como tal.
- Praia e Vila (`praia-v5`/`vila-v5`) não têm ramp de 8 tons próprio como a Floresta — usam recolor de arte licenciada CC0, uma técnica diferente que este documento registra mas não resolve (fora do escopo desta entrega, que é a Floresta).
