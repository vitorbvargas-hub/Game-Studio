# GS-012 — Arquitetura de encontros selvagens (passos 1–4 da §14)

- **Autor:** game-dev · **Data:** 2026-11-09 · **Status:** proposta para revisão (game-studio, game-design, game-art na parte visual)
- **Fonte:** `docs/briefing/17_gs012_wild_encounters.md`, ADR-009 (combate no mapa), ADR-012 (Quality First)
- **Escopo desta entrega:** auditoria, arquitetura, comparação A×B, tabelas e simulação. **Nada foi implementado no jogo.**
- Caminhos de código são relativos a `prototype/world/`. Linhas conferidas em `master@42109e3`.

Arquivos desta entrega:

| Arquivo | Conteúdo |
|---|---|
| `ENCOUNTER_ARCHITECTURE.md` | este documento |
| `encounter-tables.schema.json` | schema da tabela de encontros (JSON Schema 2020-12) |
| `tables/digimon-forest-01.json` | tabela proposta da floresta-piloto |
| `BALANCE_SIM.md` | simulação de balanceamento e números |
| `prototype/world/scripts/encounters/engine.mjs` | regra pura dos encontros aleatórios (vira `src/sim/encounters/` no passo 5) |
| `prototype/world/scripts/encounters/sim.mjs` | simulador e validador da tabela |

---

## 1. Auditoria [E]

### 1.1 Como os selvagens nascem hoje

| O quê | Onde | Como funciona |
|---|---|---|
| Zona de spawn | `.tmj`, camada de objetos, `class=spawn`; lida em `src/sim/map.ts:241-252` (`SpawnZone`, `map.ts:107`) | Retângulo com `species` (lista), `levelMin`, `levelMax`, `count`. Vira centro e raio em sub-tiles. |
| Nascimento inicial | `src/sim/world.ts:82-84` (`createWorld`) | Para cada zona, `count` chamadas de `spawnWild` na criação do mundo. |
| `spawnWild` | `src/sim/world.ts:165-191` | Sorteia a espécie da lista (uniforme), o nível em `[levelMin, levelMax]` e a posição no quadrado da zona. A célula precisa ser alcançável (12 tentativas e depois `reachableCellsOf`). Cria uma entidade `wild` com `zoneIndex`. |
| Respawn | `world.ts:1042-1048` (`onDefeatTimeout`) + `world.ts:302-304` | O derrotado some após `despawnTicks` (15 ticks = 1,5 s) e agenda `pendingSpawns` para `respawnTicks` (80 ticks = **8 s**, `src/sim/params.ts`). A população da zona volta sempre ao mesmo `count`. |
| Densidade | `src/data/maps/digimon-forest-01.tmj.json` e `maps/v8/…` | 8 zonas: Gigimon 4, Koromon 4, Tsunomon 3, Tanemon 3, Palmon 5, Tentomon 5, Floramon 4, Dorumon 3. São **31 selvagens vivos ao mesmo tempo** no v3 e no v8. É o "dezenas de Digimon andando" citado no GS-012 §1. |
| Comportamento | `world.ts:614-676` (`thinkWild`) | Vaga num raio de 3 tiles de casa (`wanderRadius`), regenera fora de combate e volta para casa além de 8 tiles (`wildLeash`). Foge com 25% de chance abaixo de 20% de HP. **Nunca inicia combate**: todo selvagem é passivo. |

### 1.2 Combate no mapa

| O quê | Onde | Como funciona |
|---|---|---|
| Início manual | intent `engage`, `world.ts:384-397` | O jogador clica no selvagem e a parceira engaja. Rejeita alvo já em combate de outro jogador. |
| AUTO | `world.ts:566-573` + `findAutoTarget` `world.ts:598-612` | Com AUTO ligado e HP ≥ 40%, a parceira procura selvagem livre num raio de 5 tiles (`aggroRadius`), no máximo 2 níveis acima (`autoLevelMargin`). |
| Encontro | `engage` `world.ts:687-707`, `fight` `world.ts:709-726` | `Encounter {id, members, started, startTick}` no `WorldState`. `encounter_start` sai quando o primeiro golpe entra no alcance. |
| Fim | `endEncounter` `world.ts:1026-1040` | Motivos: `defeat`, `flee` (intent `flee` `world.ts:398-405`, ou fuga do selvagem), `leash`, `timeout` (600 ticks = 60 s). |
| Motor | `resolveAttack` `world.ts:764`, fórmulas `@game/src/sim/formulas` | É o mesmo motor da Arena (`src/sim/arena.ts`). |

O combate já acontece **no próprio mapa**, e o ADR-009 mantém isso.

### 1.3 Recompensas, Digidex, dia e noite, clima

- **Recompensas:** `reward` em `world.ts:867-884`. A XP vem de `enemyXp(baseXpByStage[stage], level)`. Os bits são `stage×2 + level`. `drops: []` existe no evento, mas **não há drop implementado**.
- **Digidex/scan:** cada vitória soma 25% (`scanPerDefeat`). Com 100% a espécie entra em `captured`, e o HUD avisa ("captura placeholder", `src/ui/hud.ts:404-406`). Já `seen` é registrado no `main.ts` (`trackSeen`, ~linha 407) e salvo no save v5 (`src/save/save.ts`). **Não existe mecânica de captura ou recrutamento aprovada**, só esse placeholder (GS-012 §8: não inventar).
- **Missões:** `trackEvents(quests, evs, …)` em `main.ts` conta abates por região (`src/save/questlog.ts`).
- **Dia e noite:** `src/render/daynight.ts`. As fases são Dia 06–18, Anoitecer 18–19, Noite 19–05 e Amanhecer 05–06, com `?time=` e `?timescale=`. Diz o próprio comentário da linha 1: **"só apresentação; a sim não sabe que horas são."**
- **Clima: não existe.** Não há chuva nem tempestade na sim nem no render. `fog` em `src/render/look.ts:57` é névoa decorativa do look v8, não clima. Os campos de clima da tabela ficam prontos, mas **sem fonte de dados até existir um sistema de clima**.

### 1.4 Multiplayer [E]

- Tudo roda **no navegador**. `WorldSim` (`world.ts:1-3`) é uma "autoridade local" determinística (tick fixo de 100 ms, RNG mulberry32 com seed, emite `WorldEvent[]`). O loop está em `main.ts:870-882`, e o renderer não tem como influenciar o resultado.
- **"Outros jogadores" são bots:** `PlayerSetup.bot`, `botBrain` em `world.ts:469-486` (passeia perto de casa com AUTO). Na cena da floresta, são os bots de `FOREST_PROOF_SCENE` (`src/sim/setup.ts`).
- **Não existe servidor**: nenhuma rede, WebSocket ou `fetch` de jogo em `src/`. O save fica em `localStorage` (`gs003.world.save`).
- Consequência: a proteção pedida no §10 (RNG, validação e recompensa no servidor) entra agora como **requisito de arquitetura**: interface e determinismo. A implementação fica para depois. A boa notícia é que a separação intent → sim → eventos já é o formato de um servidor autoritativo.

---

## 2. Arquitetura proposta

### 2.1 Princípios

1. **Um só sistema de combate.** Encontro aleatório e visível terminam no mesmo `engage()`/`Encounter` de hoje. A única novidade é *de onde vem o selvagem*.
2. **Um só sistema de criatura selvagem.** O encontro aleatório cria uma entidade `wild` comum, com `makeCreature`, perto do Tamer. O visível é a mesma entidade com outro "cérebro".
3. **Dados fora do código.** Taxas, pesos, níveis, condições, pontos e comportamentos ficam na tabela (`encounter-tables.schema.json`).
4. **RNG atrás de uma autoridade.** Tudo o que sorteia ou valida passa por `EncounterAuthority`, sem `Math.random` e sem render.

### 2.2 Módulos (passo 5 em diante)

```
src/sim/encounters/
  table.ts          carrega e valida a tabela (mesmas regras de sim.mjs --check)
  rules.ts          porta de scripts/encounters/engine.mjs (matches, randomPool, pick, stepChance, step)
  authority.ts      interface EncounterAuthority + LocalEncounterAuthority
  visible.ts        pontos visíveis: aparecer/sumir por condição, cérebro flee/ignore/chase/idle, respawn
  env.ts            EnvState {time, weather, events} injetado na sim (hoje: período do relógio; clima = "clear")
src/render/encounterFx.ts   apresentação do "salto da grama" (só visual, consome eventos)
```

A sim ganha `w.env` (período/clima/eventos). Hoje ele é alimentado pelo relógio do `main.ts` via intent `set_env`. A partir daí, a sim passa a "saber que horas são", mas só pela entrada, o que mantém o determinismo.

### 2.3 EncounterAuthority (§10)

```ts
interface EncounterAuthority {
  /** Tamer entrou num tile novo. Devolve no máximo 1 resultado; o estado anti-sequência é por jogador. */
  onStep(player: PlayerState, tile: Vec, env: EnvState): EncounterRoll;   // none|blocked|grace|miss|empty|encounter
  /** Pode este jogador lutar com esta entidade agora? (dono do encontro individual, já em combate, etc.) */
  canEngage(player: PlayerState, wild: Entity): string | undefined;
  /** Fim do combate: libera o intervalo mínimo e confirma (uma vez só) a recompensa. */
  settle(enc: Encounter, outcome: "defeat" | "flee" | "leash" | "timeout"): RewardGrant[];
  /** Pontos visíveis ativos para este ambiente (aparecer/sumir). */
  visibleSpots(env: EnvState): VisibleSpot[];
}
```

- **Hoje:** `LocalEncounterAuthority` roda dentro da `WorldSim`, com o mesmo `w.rng`. O estado por jogador (`stepsSince`, `grace`, `readyAtSec`) fica em `PlayerState.encounterRoll`.
- **Futuro (servidor):** a mesma classe roda no servidor. O cliente só manda intents de movimento. O servidor decide `onStep`, cria a entidade, resolve o combate e emite `reward` com `encounterId` único (idempotente: `settle` marca o encontro como liquidado, o que evita recompensa duplicada).
- **Respostas às perguntas do §10:**

| Pergunta | Resposta |
|---|---|
| Quem calcula | A autoridade. Hoje é local; no futuro, o servidor. O cliente nunca envia "achei um Digimon". |
| Manipular probabilidade | RNG e tabela só existem na autoridade. O cliente vê o resultado, não a chance. |
| Recompensa duplicada | `settle` é idempotente por `encounterId`, e `reward` sai só da autoridade. |
| Encontros simultâneos | Um encontro aleatório ativo por jogador (`blockedWhen: partner_in_combat`). |
| Compartilhar ou individualizar | O campo `shared` da entrada. Aleatório: sempre individual (`ownerId` no selvagem, e `canEngage` rejeita terceiros). Visível: `shared: true` vira mundo comum; `false` é instância por jogador. |
| Sincronizar visíveis | São entidades da sim e já saem nos snapshots/eventos `spawn`/`despawn`. |
| Mesmo encontro para dois | O selvagem aleatório nasce com `ownerId`/`encounterId` do jogador, e o `engage` de terceiros é rejeitado (a regra de "alvo já em combate" existe em `world.ts:389`). |
| Desconexão | O encontro tem `timeout` (60 s). No servidor, o desconectado vira "flee" sem recompensa, e o selvagem individual some. |

### 2.4 Encontros aleatórios

- **Gatilho:** o Tamer entra num **tile novo** dentro de uma área de vegetação com encontro (`exposure: "steps"`). Parado não conta, o que protege contra AFK e combina com o AUTO/idle. O modo `time` existe na tabela para testes.
- **Onde ficam as áreas:** a geometria provisória está em `areas[]` da tabela. No passo 5 ela vai para a camada de objetos `encounters` do `.tmj` (Map Factory). As propriedades `terrain`, `areaId` e `rateMult` substituem a lista da tabela, que então deixa de ter `areas`, para não haver duas fontes.
- **Chance por passo:** `baseRate(terreno) × rateMult(área) × regionRateMult × conditionRateMult` + rampa anti-seca, com teto `pMax`.
- **Anti-sequência:** carência sorteada de 16–24 passos sem teste depois de cada encontro e ao entrar no mapa, mais `minIntervalSec` de jogo após o fim do combate.
- **Anti-seca:** a partir de 40 passos sem encontro, a chance sobe 0,6 ponto percentual por passo, até 22%.
- **Chance de nada:** 12% dos testes vencidos viram só um **farfalhar** da grama, sem combate e com 5–9 passos de carência.
- **Bloqueios:** parceira em combate, derrotada ou evoluindo; intro tocando; zona segura; perto de portal (4 tiles); repelente (se existir); cutscene.
- **Seleção:** pool filtrado por modo, terreno, `requires` (horário, clima, área, evento, missão, nível do Tamer ou da parceira, espécie registrada) → pesos × `modifiers` → sorteio ponderado → nível uniforme na faixa da entrada.
- **Resultado:** cria uma entidade `wild` **individual** (`ownerId`), a 1–2 tiles do Tamer, numa célula de vegetação alcançável. Ela entra direto em `engage` com a parceira. Se perder o combate, fugir ou o tempo acabar, o selvagem "volta para a grama" (some) em vez de vagar. Sem `zoneIndex`, ele não tem respawn.

### 2.5 Encontros visíveis

Cada entrada com `mode: visible` tem um bloco `visible` com estes campos:

- **`spot`:** posição em tiles e `wanderTiles`.
- **`behavior`:**
  - `idle`: parado, com animação de respiração;
  - `ignore`: vaga e só luta se atacado (é o selvagem de hoje);
  - `flee`: ao detectar o Tamer, foge até `loseRadiusTiles` e volta para casa;
  - `chase`: persegue dentro do raio e, ao alcançar a parceira, chama `engage` sozinho. É o único agressivo.
- **`detectRadiusTiles` / `loseRadiusTiles`**.
- **`fightable` e `interaction`** (`inspect`, `dialogue`, `quest`). Um Digimon de missão pode não ser enfrentável.
- **`respawn`:** `timer` (s), `period` (volta na próxima fase do dia), `daily` ou `never`.
- **`maxAlive`** e **`requires`**: um ponto noturno some de dia.

O cérebro é uma extensão do `thinkWild` (`world.ts:614`): um `switch` por `behavior`, reaproveitando `moveToward`, o leash e o retorno. O `idle` é o `ignore` com `wanderTiles: 0`.

### 2.6 Convivência com o spawn atual (sem duplicar)

- **`SpawnZone` continua sendo o único jeito de pôr selvagens persistentes no mapa.** Um ponto visível é carregado como `SpawnZone` estendida (`behavior`, `detect`, `respawn`, `requires`, `entryId`), com `count = maxAlive` e raio `wanderTiles`. O `spawnWild` e os `pendingSpawns` continuam os mesmos, e o respawn usa o tempo da entrada em vez de `respawnTicks` fixo.
- **Migração da floresta (passo 6):** as 8 zonas atuais (31 vivos) dão lugar a **5 pontos visíveis (6 vivos no máximo)**: Dorumon agressivo, Gotsumon parado, Tentomon que foge, 2 Palmon passivos e Patamon noturno raro. O resto das espécies passa a vir da grama. Isso resolve o excesso visual do §1 e deixa o cenário respirar (§5).
- **Mapas sem tabela** (outras regiões) continuam com o spawn atual sem mudança. O sistema novo só entra onde houver `encounters` no `.tmj`.
- **AUTO:** continua procurando selvagens visíveis livres. Ele **não** dispara encontros aleatórios, porque estes vêm só dos passos do Tamer. Assim o idle e o AUTO não viram uma "máquina de encontros".

---

## 3. Comparação A (combate no mapa) × B (instância curta)

| Critério | A — no mapa (hoje) | B — instância curta |
|---|---|---|
| **Qualidade visual** | O cenário v8 (luz, noite, copas) continua visível durante a luta, e o "salto da grama" acontece no mesmo lugar onde o Tamer está. O risco é a leitura: VFX sobre grama alta e copas pede cuidado com camadas (o canopy mask já existe). | Permite enquadramento e câmera dedicados (palco do `stadium.ts`). Exige um cenário de batalha por bioma, ou seja, **mais arte**, o que contraria a prioridade de lapidar o que existe (ADR-012). |
| **Desempenho** | Nenhum custo novo: 1 entidade a mais que já é desenhada. Com a migração, cai de 31 para ~6–8 selvagens simultâneos, então **melhora**. | Carregar ou trocar cena e manter o mundo pausado ou em segundo plano. O custo é baixo no Canvas 2D, mas há a transição. |
| **Experiência** | Contínuo e sem tela de corte. Combina com o idle/AUTO e com os outros jogadores visíveis por perto. O jogador vê a parceira lutar onde está. | Clássico estilo Pokémon e dá peso ao encontro. Corta a exploração a cada luta, o que, com ~1 encontro a cada 14 s de grama, tende a cansar. Os outros jogadores somem durante a luta. |
| **Compatibilidade** | 100%. É o `engage`/`Encounter`/`resolveAttack` de hoje: zero sistema novo. | A Arena já pausa o mundo (`main.ts:862-868`) e usa o mesmo motor. Dá para reaproveitar, mas é um segundo fluxo de entrada e saída, save e posição, com mais pontos de bug (§7: "não criar um segundo sistema"). |
| **Multiplayer futuro** | O encontro individual fica visível para os outros, que não podem interferir (`canEngage`). | Mais simples de isolar, mas some do mundo compartilhado. |

**Recomendação: A, combate no mapa.** É o que o fundador pediu no ADR-009, não exige sistema novo, melhora o desempenho com a migração das zonas e mantém a exploração contínua.

Do B, aproveito o "momento" do encontro: uma **apresentação de ~1,2 s no próprio mapa** (seção 4), com leve zoom e vinheta, sem trocar de cena. A instância (B) fica reservada para chefes e eventos especiais, caso o game-design queira, e reaproveita o fluxo da Arena.

---

## 4. Apresentação do encontro aleatório (proposta; o game-art aprova o visual)

Não há tela genérica. O selvagem **salta da grama** perto do Tamer. Tempos a 60 fps; a sim já criou a entidade no tick do sorteio, e o render só segura a primeira pose.

| t (ms) | Evento | Visual | Som |
|---|---|---|---|
| 0 | `encounter_roll` (sim) | A **mancha de grama** no tile sorteado (1–2 tiles à frente ou ao lado do Tamer, nunca atrás da câmera) treme em 3 quadros de "farfalhar" (lâminas inclinando ±2 px), com 4–6 folhas/partículas verdes do bioma subindo 6–10 px. | farfalhar curto |
| 0–350 | antecipação | **"!"** pixel-art sobre o Tamer (fonte do HUD, borda escura) e leve **zoom de câmera de 1,0 para 1,06** com vinheta +15%, centralizado entre o Tamer e a grama. A parceira vira para a grama. | "ping" de alerta |
| 350–700 | salto | O selvagem surge da grama num **arco de 10–14 px** (sobe em 3 quadros, desce em 2) com squash and stretch (1 px), sombra de entidade crescendo de 40% a 100%. Ele nasce com o recorte da grama na frente (máscara da touceira), para "sair de dentro" dela. Anel de poeira e folhas no pouso (6 partículas, 250 ms). | pulo e grito curto da espécie (se houver) |
| 700–1000 | identificação | Placa pequena acima do selvagem: **nome + Nv.**, com a borda na cor da **raridade** (comum: neutra, incomum: verde, raro: azul, muito raro: dourada com 2 cintilações). Na primeira vez da espécie, aparece o selo **"NOVO"** do Digidex. | muito raro: acorde extra |
| 1000–1200 | entrada no combate | O zoom volta a 1,0, a vinheta some e a parceira entra em `ENGAGE`. A placa vira a barra de HP padrão do selvagem. | início da música de combate (se houver), em fade |

- **Farfalhar vazio** (chance de nada): só a primeira linha da tabela, mais 2 folhas e nenhum "!". Cria tensão sem interromper.
- **Muito raro e encontro especial:** antes do salto, um **brilho dourado** de 2 quadros sobe da grama e a vinheta fica quente. É a única variação: nada de janela ou cutscene.
- **Noite:** as folhas e a placa usam o grade noturno (`nightgrade.ts`). A placa ganha luz própria leve para continuar legível.
- **Dependências de arte (GS-010):** a touceira de grama alta aprovada (hoje `fp4_tall_grass_*`, ainda não aprovada), 3 quadros de farfalhar por variante, o sprite de folha/partícula, o ícone "!", o selo "NOVO" e as cores de raridade alinhadas ao `UI_DIRECTION_V2.md`. Dá para fazer o VFX no `vfx_workbench`/`src/render/vfx` existente.

---

## 5. Tabela da floresta (resumo; ver `tables/digimon-forest-01.json`)

Todas as espécies existem em `src/data/world-species.json`, têm arte em `GAME-ASSETS/01-creatures` e constam de `regions.json` `floresta_densa.wildSpecies` [E]. Faixas de nível vêm das zonas atuais do `.tmj` e do `regions.json` [E]. Pesos e taxas são [H], calibrados no `BALANCE_SIM.md`.

| Raridade | Aleatórios | Visíveis |
|---|---|---|
| Comum | Gigimon, Koromon, Tokomon, Tanemon (×1,5 na chuva), Tsunomon (juncos) | Palmon (passivo, até 2) |
| Incomum | Palmon (×1,5 na chuva), Floramon (fora da noite), Tentomon, Lalamon (dia/amanhecer) | Gotsumon (parado nas pedras), Tentomon (foge, de dia) |
| Raro | Dorumon (só na antessala do covil e na mata SE), Goburimon (anoitecer/noite, ×1,5 com neblina), Biyomon (dia, limpo/neblina) | Dorumon (persegue, campo de pedras) |
| Muito raro | Dorugamon (noite + antessala do covil + parceira Nv.5+), Numemon (só com chuva) | Patamon (noite, foge, individual, 1×/dia) |

Terrenos: `tall_grass` (3,8%/passo), `dense_bush` (4,5%) e `reeds` (3,0%). Há 5 áreas sobre as zonas do brief, onde a grama alta e os juncos já estão no mapa v8. Validação: `node scripts/encounters/sim.mjs --check` confere espécies, enums, referências e se toda área/horário/clima tem pelo menos 1 comum.

---

## 6. Plano de implementação (passos 5–10)

Estimativas em dias de agente [H]. "GS-010" indica dependência do laboratório visual (o game-art aprova).

| Passo | Entrega | Estimativa | Depende de |
|---|---|---|---|
| **5. Aleatórios** | `src/sim/encounters/` (porta de `engine.mjs`, tabela, `LocalEncounterAuthority`, `w.env` alimentado pelo relógio, `PlayerState.encounterRoll`); camada `encounters` no `.tmj` (Map Factory + `validate-map`); selvagem individual com `ownerId`; flag `?encounters=1` (padrão desligado); testes vitest de determinismo, carência, bloqueios e tabela. | 2–3 d | tabela aprovada pelo game-design |
| **6. Visíveis** | `SpawnZone` estendida (behavior/detect/respawn/requires); cérebros `idle`/`ignore`/`flee`/`chase`; migração das 8 zonas para os 5 pontos **só com a flag ligada** (o mapa atual fica intacto); testes. | 2 d | 5 |
| **7. Combate** | Encontro aleatório e `chase` chamam o `engage` atual; `settle` idempotente; `seen`/scan/missões pelos eventos existentes; "voltar para a grama" no fim; rejeição de terceiros. | 1–1,5 d | 5, 6 |
| **8. Animação e efeitos** | `render/encounterFx.ts` (farfalhar, "!", zoom e vinheta, salto, placa de raridade, NOVO); sons placeholder. | 2 d de código + arte | **GS-010:** grama alta aprovada, quadros de farfalhar, partículas, ícones, cores de raridade (game-art) |
| **9. Testar e balancear** | Painel de debug (`?encdebug=1`): forçar encontro, horário e clima, ver chance e carência ao vivo, override em memória como o `--set` do sim; rodar o sim com os retângulos reais do `.tmj`; capturas e GIF; checklist §11 (itens 1–8, 10; o 9 vira N/A sem servidor). | 1,5 d | 5–8 |
| **10. Demonstração** | Vídeo de gameplay com e sem encontros (§12), comparação de densidade (31 → ~6 vivos), relatório de problemas. | 1 d | 9; game-qa |

- **Total:** ~10–11 dias de agente.
- **Caminho crítico:** a aprovação da grama alta e do VFX no GS-010 (passo 8).
- **Ordem que não bloqueia:** os passos 5–7 seguem atrás de flag em paralelo ao laboratório visual. O 8 entra quando o game-art liberar.

## 7. Limitações e pendências

- **Clima** não existe no jogo [E]. As regras de chuva e neblina da tabela só entram em vigor quando houver um `EnvState.weather` real, que hoje seria `"clear"` fixo ou `?weather=` para teste. A criação de um sistema de clima não está neste escopo.
- **Captura ou recrutamento:** só o placeholder de scan [E]. Nenhuma mecânica nova foi proposta (§8).
- **Drops:** o evento tem `drops: []`, mas não há tabela de drops [E]. Integrar quando o game-design definir.
- **Multiplayer:** sem servidor [E]. O §10 está coberto pela interface e pelo determinismo, mas não foi implementado nem testado em rede.
- As **áreas** da tabela são retângulos aproximados sobre os props do v8 [H]. O desenho final é feito na camada `encounters` do `.tmj`, junto com o game-art.
- Os **números** do sim usam rotas sintéticas. O balanceamento final exige jogo real (passo 9).
