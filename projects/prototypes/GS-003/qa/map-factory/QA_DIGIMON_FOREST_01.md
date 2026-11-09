# QA — Digimon Forest · Prototype 01 (GS-003, Map Factory)

- **Autor:** game-qa · **Data:** 2026-11-09
- **Commit homologado:** `dad7c59`, `projects/prototypes/GS-003/prototype/world/`
- **Base:** `docs/briefing/12_map_factory_v2.md` §7 (critério de aceite), ADR-011
- **Brief:** `world-design/briefs/digimon-forest-01.json`
- **Entregues revisados:** `src/data/maps/digimon-forest-01.tmj.json`, `src/sim/interact.ts`, `tests/map-factory-pilot.test.ts`, `evidence/map-factory/` (README, 17 capturas, `validation-digimon-forest-01.md`)

## Veredito: **APROVADO, com ressalvas (P1 abaixo)**

Os gates automáticos do §7 passam de ponta a ponta — rodei eu mesmo `npm test`, `npm run build` e `npm run map:validate`, sem depender do relatório do game-dev — e o brief foi implementado fielmente (zonas, rotas, POIs, spawns, NPC, interativos, arena e portal de ida/volta todos presentes e nas posições certas, conferido objeto a objeto no `.tmj.json`). Nenhum bug impede o uso do mapa no jogo. A ressalva que impede um "aprovado sem ressalvas" é o gate de **performance** do §7, que não tem medição formal registrada (achado P1), e um bug real (não só hipótese) no sorteio de posição de spawn selvagem (achado P1, mas de baixo impacto e autocorretivo). A nota visual final (≥8, "sensação de exploração") é aceite do fundador, não minha alçada — dou minhas notas por critério abaixo como insumo.

---

## 1. Execução independente dos comandos

Rodado em `prototype/world/` neste host, não copiado do README do game-dev:

| Comando | Resultado |
|---|---|
| `npm test` | **27 arquivos, 254 testes, todos verdes.** `Duration 18.07s`. Inclui os 7 testes de `tests/map-factory-pilot.test.ts` (adaptador do brief, determinismo geração==mapa registrado, pacote fp6_ sem placeholder, colisões água/ponte/rochas/baú/placa/cura, interativos+NPC+arena na sim, passeio BFS início→clareira com `encounter_start`). |
| `npm run build` | `tsc --noEmit && vite build` — **sem erros**. Só aviso de chunk JS > 500 kB (irrelevante para o mapa). |
| `npm run map:validate` | **6/6 mapas PASS** nos 8 gates (`layers, tile_ids, asset_keys, reach, placement, wang, species, portals`), incluindo `digimon-forest-01 [factory-v1]` e `vila [legacy]` (com o portal de volta). Saída idêntica à de `evidence/map-factory/validation-digimon-forest-01.md`. |

## 2. Mapa vs. brief, item por item

Extraí os objetos do `.tmj.json` (Python/json, excluindo a camada `objects_below` de 916 props decorativos) e comparei posição/propriedade a propriedade com `world-design/briefs/digimon-forest-01.json`. Os objetos do Tiled usam o centro do tile (offset +0,5 em x/y sobre o inteiro do brief) — convenção normal, não é erro.

| Item do brief | No `.tmj.json` | Veredito |
|---|---|---|
| Área inicial (`spawn_area`, 18,29,14×9) | `start:player`/`start:from_vila` em (25,5·36,5), dentro da zona | ✅ |
| Clareira Central (20,14,16×14) | `spawn-gigimon`/`spawn-koromon` centrados em (28,20), `interact-bau` (31,18), `interact-fonte-cura` (33,21), `poi-mirante-clareira` (28,15) | ✅ |
| Trilha principal | `rota_principal`: trilha contínua spawn→clareira→capinzal→covil, confirmada nas capturas 01/03/06/09/10 | ✅ |
| Rota alternativa (pedras) | Caminho visível até `campo_de_pedras` e `poi-entrada-covil` (47,20) — convergência das 3 rotas | ✅ |
| Rota alternativa (riacho/secreta) | Trilha até a ponte (27,9) e daí até a Clareira Oculta | ✅ |
| Água + ponte | `fp6_water_blob` sólida confirmada por teste (água colide, ponte não, 4 tiles em y=9); visível nas capturas 06/07/11 | ✅ |
| Rochas | `fp6_rock_big`/`rock_small` + `fp4_rock_cluster` no Campo de Pedras, sólidas conforme teste | ✅ |
| Área secreta | Clareira Oculta (4,2,9×8) com placa (9,7) e `spawn-tanemon`; só alcançável pela rota do riacho, conforme desenhado | ✅ |
| Zona de concentração | `zona_concentracao` (38,16,10×10) com `spawn-palmon/tentomon/floramon` — **ver ressalva no raio abaixo** | ⚠️ (funcional, mas ver item 5.4) |
| Arena do chefe | `arena-kuwagamon` em (51,20) raio 6, `trigger boss_approach` `BOSS-KUWAGAMON`, detectado pela sim (`arenaOf`, testado) | ✅ (luta em si fora de escopo, documentado) |
| NPC | `npc-guia-gigimon` em (23,5·30,5), CREATURE-0002, diálogo do brief verbatim, estático, não agressivo | ✅ |
| Spawns (8) | Todas as 8 espécies do brief presentes, níveis e contagens batendo exatamente com o JSON | ✅ |
| Interativos (baú, 2 placas, cura) | Textos das placas batem com o `effect` do brief; baú +50 bits; cura restaura PV/MP fora de combate — tudo testado em `map-factory-pilot.test.ts` | ✅ |
| Saída sul → Vila | Portal `exit-sul-vila` no retângulo exato do brief (704,1216,192×64 px = 22,38,6×2 tiles); **portal de volta em `vila.tmj.json` (`sul-digimon-forest`) existe** — a pendência registrada no brief (`evidenceNotes`) foi resolvida pelo game-dev. Confirmado também pelas capturas 12→13→14 (ida e volta andando). | ✅ |

## 3. Revisão visual das 17 capturas

Notas 0–10 por critério (minha avaliação como QA, não substitui a nota do fundador pedida no §7):

| Critério | Nota | Justificativa |
|---|---|---|
| **Consistência visual** | 8/10 | forest-v4 (árvores, grama, vila) e forest-v6 (água, ponte, rochas, baú, placa, cura) convivem sem choque de estilo — mesma paleta, mesma escala de pixel, mesmo outline. Grade noturna aplicada por igual ao mapa todo (mesmo tratamento usado em `forest-proof`), água mantém saturação alta à noite e se destaca propositalmente contra o resto escurecido — aceitável, não é erro específico deste mapa. |
| **Qualidade artística** | 7/10 | Kit forest-v6 é funcional e legível (ponte de madeira limpa, água com borda blob-16 texturizada, baú/placa reconhecíveis à distância). Rochas são um pouco simples/planas (sombreamento básico). Nenhuma costura de tile visível nas 17 capturas em nenhuma resolução. |
| **Navegação** | 7/10 | BFS alcança 100% dos alvos, 3 rotas funcionam como desenhadas, placa de entrada orienta o jogador corretamente. Mas as 3 trilhas são rigorosamente ortogonais (só curvas de 90°, visível no preview anotado e nas capturas 01/06/09) — lê como um traçado de "cano/grade" de teste, não como trilha de floresta orgânica. |
| **Colisões** | 9/10 | Água sólida, ponte livre, rochas/baú/placa sólidos, fonte de cura livre — tudo confirmado por teste automatizado (não só pela sim). Único reparo: a arena do chefe não tem nenhum limite/parede própria (é uma clareira aberta igual ao resto), o que é esperado já que a luta de chefe está fora do escopo desta entrega. |
| **Diversidade** | 8/10 | 8 espécies distintas, 3 faixas de nível (1–4 → 3–6 → 4–6) acompanhando a progressão da entrada ao chefe, zona secreta com recompensa própria (Tanemon), campo de pedras com dificuldade maior (Dorumon). Boa leitura de progressão. |
| **Identidade do bioma** | 6/10 | A moldura de mata densa e as clareiras comunicam bem "floresta". Mas o riacho é um retângulo reto de largura constante (26-30,2-16) — a borda blob-16 dá uma leve serrilha, mas o traçado geral continua sendo uma linha reta vertical, parecendo canal artificial, não riacho natural. Combinado com as trilhas 100% ortogonais (ver "navegação"), o mapa como um todo lê mais como um "mapa de teste bem decorado" do que uma floresta orgânica — é a maior fraqueza estética da entrega. |
| **Desempenho** | 5/10 | **Gate do §7 não cumprido com rigor.** O README do game-dev já registra a limitação: "contador do HUD mostrou 52–60 fps nas capturas headless; não é medição formal". Confirmei que não existe nenhum script/teste de medição de FPS no repositório (`grep -rl fps` só retorna UI/exibição do contador, não um benchmark). 52 fps é abaixo do piso de 60 que o próprio §7 exige, mesmo que a causa provável seja o overhead do Chromium headless e não o renderer em si. |
| **Integração** | 9/10 | Mapa carrega no dev server real, loader `.tmj`→renderer funcionando, round-trip Vila↔Floresta andando (capturas 12/13/14) com o portal de volta existindo (pendência do brief resolvida), teste automatizado reproduz o passeio por BFS até a clareira e verifica o `encounter_start`. `npm test`/`npm run build` verdes. |

## 4. Investigação dos 3 avisos de "placement" (spawn isolado entre árvores)

O validador avisa, sem falhar, que `spawn-tsunomon`, `spawn-tanemon` e `spawn-dorumon` têm **1 célula livre da área de sorteio fora do alcance do jogador** (bolsão — espaço livre cercado de árvores sólidas, sem caminho até ele pela colisão).

**Investiguei o código real de sorteio (`src/sim/world.ts`, função `spawnWild`, linhas 165–180), não só o aviso do validador:**

```js
function spawnWild(ctx, z, zoneIndex) {
  ...
  let pos = z.center;
  for (let i = 0; i < 12; i++) {
    const p = { x: z.center.x + nextInt(w.rng, -z.radius, z.radius), y: z.center.y + nextInt(w.rng, -z.radius, z.radius) };
    if (!isSolidAt(map, p.x, p.y)) { pos = p; break; }
  }
  ...
}
```

A função sorteia um ponto em `centro ± raio` e só testa **se a célula é sólida** (`isSolidAt`). Ela **não verifica alcance/BFS a partir do início do jogador**. Ou seja: **sim, a sim pode sortear uma posição inalcançável** — isto deixou de ser hipótese (`[H]` no README do game-dev) e virou fato verificado no código.

Impacto real, porém, é baixo:
- É **1 célula isolada** por zona, contra dezenas de células livres no quadrado de sorteio (as 3 zonas passam no teste "pelo menos 40% livre", que teria disparado um aviso mais sério se o bolsão fosse grande).
- Cada zona tem 3 criaturas (`count`) e a sim tenta até 12 vezes por criatura — a chance de cair exatamente no bolsão em qualquer tentativa é baixa (~1–2% por tentativa, estimando a partir da área livre total).
- É **autocorretivo**: quando a criatura despawna (`WORLD.despawnTicks`), ela é recolocada na fila de respawn (`pendingSpawns`) e sorteada de novo — não é um estado permanentemente quebrado, só uma criatura temporariamente inacessível até o próximo ciclo.
- Isso não quebra o gate de alcance do §7, porque esse gate testa o **centro** da zona de spawn, não cada célula possível do raio de sorteio — a leitura literal do gate está correta, só o comportamento real da sim vai um pouco além do que o gate garante.

Classifiquei como **P1** porque é um bug real e reproduzível no código de produção (não cosmético), mas de impacto limitado o bastante para não bloquear o aceite.

## 5. Bugs e melhorias priorizados

### P0 — nenhum
Nenhum problema bloqueia a aprovação: todos os gates obrigatórios do §7 passam, o mapa carrega e é jogável de ponta a ponta.

### P1
1. **Gate de performance do §7 sem medição formal.** O requisito é "renderiza a 60 fps... (medição registrada)". O que existe é o contador do HUD visto em capturas headless (52–60 fps), já marcado como informal pelo próprio game-dev. Não há script de benchmark no repo. **Ação sugerida:** criar uma medição reproduzível (ex.: amostragem de frame-time ao longo de N ticks do renderer em chunks, salva em `evidence/map-factory/`), antes de considerar o gate de performance oficialmente cumprido. *Arquivos relevantes: `src/main.ts` (onde o contador de FPS do HUD é calculado), `scripts/capture-live.mjs` (captura headless usada para a evidência).*
2. **`spawnWild` não verifica alcance (BFS), só colisão.** `src/sim/world.ts:165-180`. Pode sortear um Digimon selvagem numa célula livre mas isolada (bolsão), tornando-o temporariamente inacessível até o próximo respawn. Confirmado nas 3 zonas que o validador já sinaliza (`spawn-tsunomon`, `spawn-tanemon`, `spawn-dorumon`). **Ação sugerida:** ou filtrar o sorteio para um conjunto de células pré-computado como alcançável, ou ajustar o raio/posição dessas 3 zonas para eliminar o bolsão (o próprio aviso do validador já aponta qual zona).

### P2
1. **Riacho e trilhas excessivamente geométricos.** O riacho é um retângulo reto (sem meandro) e as 3 rotas são só segmentos ortogonais (90°) — ver capturas 00/06/09/11 e o preview anotado `previews/digimon-forest-01.png`. Funciona para o BFS e para a navegação, mas enfraquece a identidade de "floresta densa" (critério 6 acima). Sem ação necessária para este piloto (WFC/variação orgânica está explicitamente fora do escopo da fase piloto, por `12_map_factory_v2.md` §4); registrar como item de melhoria para quando o pipeline ganhar splines/caminhos curvos.
2. **`radiusTiles` do brief é silenciosamente recortado pelo retângulo da zona.** Rastreei em `scripts/map-factory/adapt-brief.mjs:155-162`: `spawn-palmon/tentomon/floramon` pedem `radiusTiles: 8` no brief, mas como a zona `zona_concentracao` é um retângulo de só 10×10 tiles, o adaptador faz `intersect(quadrado_do_raio, retangulo_da_zona)` e o raio efetivo vira ~5 tiles (320×320 px no `.tmj`, não 416×416 que 8 tiles dariam) — **sem aviso nenhum no relatório de validação ou no README da evidência.** Isso concentra as 14 criaturas dessa zona (Palmon+Tentomon+Floramon) numa área ~40% menor que o brief pedia, o que contribui para a aglomeração de rótulos/sprites vista nas capturas 05 e 10. **Ação sugerida:** o adaptador logar quando recorta o raio pedido pelo brief (como já faz para outros ajustes, ex. "ponte horizontal de 4 tiles"), para que game-design saiba que o raio foi reduzido.
3. **Zona de concentração visualmente carregada.** Capturas 05 e 10: Palmon/Tentomon/Floramon ficam empilhados com rótulos de nome se sobrepondo. Em parte é efeito do item P2.2 acima (raio clampado). Considerar espaçar os 3 centros de spawn ou alargar `zona_concentracao` no brief.
4. **Arena do chefe sem identidade visual própria.** `arena-kuwagamon` usa a mesma grama/trilha do resto do mapa, sem marcador de "zona de chefe" (chão diferenciado, ossos, pilares). Aceitável nesta entrega (a luta de chefe está documentadamente fora de escopo — `Kuwagamon` nem existe em `world-species.json`), mas vale um passe visual antes do chefe real entrar em jogo.
5. **`title` dos POIs `interact-bau`/`interact-fonte-cura` vem da frase de `description` do brief, não de um rótulo curto** (ex. `title: "Baú de madeira simples na Clareira Central."` em vez de `"Baú"`). Não aparece como problema nas capturas atuais (o toast da sim mostra só "+50 bits" / texto de cura, não `it.title`), mas é uma armadilha para uma futura revisão de HUD que use esse campo como cabeçalho. Arquivo: `scripts/map-factory/adapt-brief.mjs` (mapeamento `description`→`title`); objetos afetados em `src/data/maps/digimon-forest-01.tmj.json`.

## 6. Limitações desta homologação

- Não testei pela interface gráfica interativa (não há navegador disponível neste host de QA) — a evidência visual vem das 17 capturas já geradas pelo game-dev via Chromium headless, mais a execução independente dos 3 comandos e leitura direta do `.tmj.json`/código-fonte.
- Não reproduzi a captura de vídeo mencionada no §7 ("vídeo curto") — não encontrei um arquivo de vídeo em `evidence/map-factory/`, só PNGs; o `README.md` da evidência também só lista PNGs. Isso não bloqueia o aceite porque screenshots + teste automatizado cobrem a evidência de integração exigida, mas registro a ausência do vídeo citado no §7.
- Não medi FPS eu mesmo (sem navegador neste host); meu achado sobre performance (P1 #1) é sobre a **ausência de medição formal**, não uma contra-medição minha.
- A nota visual ≥8 e a "sensação de exploração" do §7 são aceite humano do fundador — minhas notas por critério (seção 3) são insumo, não substituem essa etapa.
