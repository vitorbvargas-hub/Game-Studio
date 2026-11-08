# GS-003 — mundo (vertical slice, Fase 5): combate no próprio mapa

- **Autor:** game-dev · **Data:** 2026-11-08 · **Base:** ADR-009, `docs/WORLD_COMBAT_VISUAL_SPEC.md`, `docs/TECH_AUDIT.md` (Canvas 2D próprio), `docs/SPRITE_SPECIFICATION.md`, `docs/ANIMATION_STANDARD.md`.
- Projeto Vite novo e separado. `../game/` é reaproveitado **sem alteração** (RNG, fórmulas e pacote `digimon-fan` importados via alias `@game`). `../game/arena-spike/` (congelado) não é tocado.

## v2 (2026-11-08): sprites de mapa, movimento fluido e combate animado

- **Sprites de mapa do DS** (`tools/dwds_import/import_dwds_sheets.py`): walk e idle nas 4 direções, attack e hurt das poses do DS reduzidas para a escala do mapa. O tamanho nativo do DS já é relativo entre espécies (Koromon 17 px, Agumon 27, Greymon 38, Angemon 40). O Tamer oficial vem de `GAME-ASSETS/11-characters/TAMER-0001` (local) e `TAMER-0002` (outro jogador), feito pelo game-art. Os tiles DS vêm de `03-environments/*-dwds/` e têm prioridade sobre os originais.
- **Movimento** (`render/motion.ts`): mola (SmoothDamp, 75 ms) sobre a posição interpolada da sim, que dá aceleração e desaceleração sem saltos. A direção (4 eixos) sai da velocidade visual, com histerese. O quadro do walk depende da **distância andada** (a cadência acompanha a velocidade), e há bob de 1 px parado. A câmera usa lerp exponencial (τ 110 ms) e desenha em pixel inteiro. A escala de tela continua inteira.
- **Parceira** (sim): segue a trilha de pontos do Tamer (`trailPoint`, follow-the-leader) e abre espaço se ele vem para cima dela (`partnerMinSep`).
- **Combate** (`render/anim.ts`, `render/fx.ts`, `presenter.ts`): antecipação (recuo de 3 px) → avanço curto → pose ATTACK do DS no impacto → **hit-stop de 70 ms** (atacante e alvo congelam) → knockback com ease-out (6 px, 9 no crítico) → volta. Flash branco, faíscas e riscos (básico), anel de choque (especial ou crítico), partículas deterministas, número de dano em arco com fade e tremida de câmera de 2 px no crítico local. **Golpe especial** (qualquer skill ≠ `investida`): carga, projétil do elemento da espécie (`src/data/world-vfx.json`: fire, frost, wind, light, bubble; efeitos originais desenhados em código) e impacto 180 ms depois.
- **A sim continua autoritativa:** o dano sai no tick do `attack_start`, e a apresentação só escolhe o momento de mostrar. `tests/v2.test.ts` roda o catálogo real v2 (com especiais) contra a sim sem apresentação e confere que os eventos são idênticos.
- **Parâmetros de URL novos:** `?size=table` (usa `GS-003/research/DIGIMON_SIZE_TABLE.json` quando existir: escala inteira = altura-alvo/altura nativa), `?smooth=0` (sem suavização, para comparar) e `?tiles=original` (ignora os biomas DS).
- **Capturas:** `docs/screens/06-attack-sequence-6f.png` (antecipação, avanço, impacto/hit-stop, knockback, número em arco, volta) e os 6 quadros soltos `06-attack-seq-*.png`, mais `07-special-projectile.png`.

## Como rodar

```bash
cd projects/prototypes/GS-003/prototype/world
npm install --offline     # o registry está bloqueado neste host; tudo vem do cache npm
npm run dev               # http://127.0.0.1:5174  (?seed=7&auto=1&creatureScale=1)
npm test                  # vitest: FSM, sim, presenter, assets, HUD
npm run build             # tsc --noEmit + vite build → dist/
npm run shots             # capturas em docs/screens/ (@napi-rs/canvas, sem navegador)
npm run map               # regenera src/data/maps/test-meadow.tmj.json
```

Controles: clique ou toque no chão para andar · WASD · clique num Digimon selvagem para a parceira lutar com ele · botão AUTO · botão Fugir (ou tecla F).

## Arquitetura

```
src/sim/      AUTORIDADE. Tick fixo de 100 ms, RNG mulberry32 (../game), estado em JSON puro.
  world.ts    stepWorld(sim, intents) → WorldEvent[] confirmados (spawn, state, engage, encounter_start,
              attack_start, damage, defeat, reward, level_up, capture, encounter_end, despawn, intent_rejected)
  fsm.ts      tabela de transições IDLE/WALK/FOLLOW/ENGAGE/ATTACK/HURT/DEFEAT/RETURN; setState recusa transição ilegal
  map.ts      subconjunto do Tiled JSON (.tmj): camadas de tiles, colisão, props, spawns e inícios
  species.ts  espécies = pacote digimon-fan + src/data/world-species.json (linha Guilmon com stats [H])
  params.ts   aggroRadius, attackRange, leash, followDist, cooldowns… (spec §9)
src/render/   APRESENTAÇÃO. Lê snapshots e eventos e nunca escreve na sim.
  presenter.ts estado visual por entidade, fila de dano exibido em max(chegada, início + hitAtMs)
  anim.ts     slots de animação por estado + fallback procedural (lunge, knockback, fade, bob)
  view.ts     Canvas 2D: chunks de chão 16×16 tiles, culling, ordenação por Y, sombras, barras, números, efeito de golpe
src/assets/   loaders da biblioteca GAME-ASSETS (creature.json + atlas; tiles e props por nome de arquivo)
src/ui/hud.ts HUD em DOM: parceira, AUTO, Fugir, log, barra de menus inativa
```

- **A animação não decide o dano:** o golpe é resolvido no tick em que ATTACK começa (`attack_start` e `damage` saem juntos). A view só escolhe *quando* mostrar o número: com o `hitFrame` do manifest, ou com 160 ms no ataque procedural. Os testes rodam a mesma semente com o manifest só-idle, com um manifest com `attack` real e sem apresentação nenhuma, e conferem eventos idênticos e o mesmo conjunto de danos exibidos (só o horário muda).
- **Sem tela de batalha:** não existe cena, transição nem câmera de combate. A câmera segue o Tamer. Um teste confirma que, durante o encontro, entidades de fora continuam se movendo.
- **Outro jogador:** `bot1` (Tamer azul + Patamon) é um `remote_player` dentro da mesma sim, com IA de passeio e AUTO. Usa o mesmo contrato de eventos que um jogador de rede usaria.

## Assets

- **Criaturas:** `GAME-ASSETS/01-creatures/CREATURE-0002..0013` (creature.json + `spritesheets/*.atlas.json` + PNG). O pivô e a sombra vêm do manifest. O id da criatura é o id da espécie na sim.
- **Escala:** `creatureScale` (inteiro, padrão 1 = tamanho nativo do DS; `?creatureScale=2` na URL). O SPRITE_SPECIFICATION não fixa um fator para os rips oficiais. Reduzir o tamanho por fator inteiro não existe sem perder pixels, então a decisão final sobre o porte relativo ao tile fica com o game-art.
- **Bioma:** `GAME-ASSETS/03-environments/**`. A chave de um tile ou prop no mapa é o nome do PNG (`grass_00`, `path_edge_n`, `shore_corner_se`, `tree_big_a`…). Um `tileset.json` opcional permite recortar folhas. Chave sem PNG cai num placeholder gerado em código, então o mapa nunca quebra. O teste `assets.test.ts` lista as chaves do mapa sem PNG real (hoje: nenhuma).
- **Autotile:** o gerador do mapa usa a convenção conferida nos PNGs: o sufixo indica o lado em que estão o caminho ou a água (`path_edge_n` = caminho ao norte).
- A água anima com `water_00`/`water_01` a 600 ms por quadro [H].

## Slots prontos para animação real

`resolveAnim()` procura, por estado: `combatStates[STATE]` → `attack`/`hurt`/`walk`/`follow`/`defeat` → `idle` + procedural. Quando o game-art adicionar `attack` com `events: [{frame, name: "hitFrame"}]` ao `creature.json`, o número passa a sair no frame de impacto, sem mudar código. O mesmo vale para `hurt`, `walk` e `defeat`. O Tamer ainda é um placeholder desenhado em código (`render/tamer.ts`).

## Limitações

Ver o relatório de entrega. Resumo: sem medição de FPS em navegador real (não há Chromium neste host); Tamer placeholder; efeito de golpe procedural (o slot `04-effects/combat/` está vazio); captura = placeholder por varredura (4 vitórias = registrado); pathfinding é reta com deslize na colisão (A* fora do escopo, spec §10); números de balanceamento [H].
