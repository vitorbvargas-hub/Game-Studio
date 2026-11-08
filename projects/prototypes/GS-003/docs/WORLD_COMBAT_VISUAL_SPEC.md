# WORLD_COMBAT_VISUAL_SPEC — combate no próprio mapa (GS-003)

- **Autor:** game-dev (subagente) · **Data:** 2026-11-08 · **Status:** especificação v1. Ainda não implementada no jogo (fase 5).
- **Fontes:** briefing `01_GS001…` §3 (regra obrigatória), §6 (animações), §11 (cenário de teste), §12 (fluxo de combate). ADR-009. `docs/TECH_AUDIT.md` (engine: Canvas 2D próprio, sim separada).
- **Regras que esta spec não pode violar:**
  1. **Nunca há troca de cena, mapa, câmera dedicada ou tela de batalha.** O combate é um *estado das entidades* no mapa em que elas já estão.
  2. **A animação nunca decide o resultado.** Dano, acerto, derrota e fuga vêm da lógica autoritativa. O visual só representa eventos confirmados.
  3. **O combate não bloqueia nada que não precise:** outros jogadores, NPCs e outras criaturas continuam se movendo e animando.
  4. Arena, matchmaking e PvP **fora do escopo** (§4 do briefing).

---

## 1. Camadas

```
┌───────────────────────────── AUTORIDADE ─────────────────────────────┐
│ WorldSim (hoje: sim local determinística; amanhã: servidor)           │
│  - tick fixo (10 Hz no mundo; mesmo RNG mulberry32 do motor atual)    │
│  - posições, alvos, FSM lógica, cooldowns, HP, dano, derrota, loot    │
│  - emite WorldEvent[] CONFIRMADOS por tick                            │
└───────────────▲───────────────────────────────┬──────────────────────┘
                │ Intent (pedido do jogador)     │ Snapshot + WorldEvent[]
┌───────────────┴───────────────┐   ┌────────────▼──────────────────────┐
│ Input / HUD (DOM)             │   │ Presentation (WorldView, Canvas)   │
│ - toque/clique, menus         │   │ - interpola posições entre ticks   │
│ - nunca altera estado direto  │   │ - FSM VISUAL (anima, efeitos, HP)  │
└───────────────────────────────┘   │ - nunca escreve no estado          │
                                    └────────────────────────────────────┘
```

- **Autoridade:** o `WorldSim` é o único que muda o estado do jogo. No protótipo, ele roda no navegador do jogador e funciona como se fosse o servidor: mesma interface, mesmo formato de evento. Trocar por um servidor real é trocar o *transporte* (WebSocket), não a lógica.
- **Intents:** o jogador só *pede* (`move_to`, `engage(targetId)`, `flee`, `use_skill`). O `WorldSim` aceita ou recusa, e o resultado chega como evento.
- **Apresentação:** a `WorldView` mantém um *estado visual* por entidade (posição interpolada, animação corrente, flashes, floaters). Ela pode **antecipar** a animação de ataque (mostrar o golpe já no `attack_start`), mas **números, mudança de HP, HURT e DEFEAT só aparecem com o evento confirmado** (`damage`, `defeat`).

## 2. Entidades

Tudo que existe no mapa é uma `Entity` no mesmo sistema (não há "combatente" separado):

| Tipo (`kind`) | Exemplo | Combate? |
|---|---|---|
| `player` | Tamer controlado pelo jogador local | não ataca. Comanda a parceira (ADR-009: o jogador é o Tamer) |
| `partner` | criatura do jogador (segue o Tamer) | sim |
| `remote_player` / `remote_partner` | outros jogadores e suas criaturas | sim, visíveis sempre |
| `wild` | criatura selvagem do mapa | sim |
| `npc` | NPC de cidade ou missão | não |

Campos lógicos mínimos (autoridade): `id, kind, ownerId?, speciesId, pos {x,y}` (em sub-tiles de 1/16 de tile), `facing` (8 direções), `logicState` (§3), `targetId?, encounterId?, hp, maxHp, homePos` (para RETURN), `leashRadius`.

Campos visuais (só no cliente): `renderPos` (interpolada), `anim {name, dir, startedAt}`, `fx[]`, `hpBarVisibleUntil`.

## 3. Máquina de estados

Os mesmos 8 estados existem **na lógica** (decisões) e **na apresentação** (animação). A apresentação segue a lógica com atraso de até 1 tick e nunca pula um estado confirmado.

```
            ┌───────────── perde alvo / alvo derrotado ─────────────┐
            ▼                                                        │
  ┌──────┐ destino  ┌──────┐                                         │
  │ IDLE │────────▶│ WALK │                                         │
  └──┬───┘◀────────└──────┘                                         │
     │ dono se afasta > followDist                                   │
     ▼                                                               │
  ┌────────┐ inimigo no aggroRadius ou engage(target)  ┌────────┐   │
  │ FOLLOW │──────────────────────────────────────────▶│ ENGAGE │───┤
  └────────┘                                           └───┬────┘   │
                                         alvo no alcance   │        │
                                           e cooldown ok   ▼        │
   ┌──────┐  dano confirmado   ┌────────┐            ┌────────┐     │
   │ HURT │◀───────────────────│ (qualq.│            │ ATTACK │─────┘
   └──┬───┘   (interrompe ENGAGE/IDLE/  │            └───┬────┘ fim da animação
      │        WALK; não interrompe     │                │ → ENGAGE (próximo golpe)
      │        ATTACK já confirmado)    │                │
      ▼ hp == 0 confirmado              │                │
   ┌────────┐                           │      fora do leashRadius ou fuga
   │ DEFEAT │                           │                ▼
   └────────┘                           │          ┌────────┐ chegou em homePos
   (some após despawnMs; respawn é      │          │ RETURN │──────────▶ IDLE
    um novo spawn, não volta de DEFEAT) │          └────────┘
```

| Estado | Entra quando (lógica) | Sai para | Animação (`creature.json`) | Notas |
|---|---|---|---|---|
| **IDLE** | sem destino, sem alvo | WALK, FOLLOW, ENGAGE | `idle` (loop). Após `sleepAfterMs` sem eventos: `sleep` | Desfase por entidade para não respirarem em uníssono (já existe em `idleFrameIndex`) |
| **WALK** | recebeu destino (`move_to` ou patrulha) | IDLE ao chegar | `walk` (loop), direção = vetor de movimento | Velocidade lógica em sub-tiles/tick |
| **FOLLOW** | `partner` com dono a mais de `followDist` | IDLE (perto), ENGAGE | `walk` (ou `follow`, se o manifest tiver) | Segue um ponto *atrás* do dono, sem colar nele |
| **ENGAGE** | alvo válido escolhido (aggro, comando ou IA idle) | ATTACK, RETURN, IDLE | `walk` até o alcance, depois `idle` virado para o alvo | Aproximação por caminho simples (reta + desvio de colisão) |
| **ATTACK** | alvo em alcance e cooldown pronto. A sim **já resolveu** o golpe neste tick | ENGAGE (próximo golpe), IDLE (alvo caiu) | `attack` (one-shot). Efeito no `HitFrame` | Ver §4: o dano é exibido no evento, sincronizado com o `HitFrame` |
| **HURT** | evento `damage` confirmado no alvo | estado anterior (após `hurtMs`) ou DEFEAT | `hurt` (one-shot) + flash branco | Não cancela um ATTACK já confirmado. Só sobrepõe o flash |
| **DEFEAT** | evento `defeat` (HP 0 confirmado) | — (entidade removida após `despawnMs`) | `defeat` se existir; senão `hurt` congelado no último frame + fade de 600 ms | Não há "tela de vitória": o loot e a XP aparecem como floaters no lugar |
| **RETURN** | fuga, alvo fora do `leashRadius` ou parceiro chamado de volta | IDLE ao chegar em `homePos` ou no dono | `walk` | Selvagem que volta regenera HP aos poucos (anti-kiting) |

**Fuga:** `flee` (intent do jogador) ou IA com HP abaixo de `fleeHpPct`. A lógica emite `encounter_end{reason:"flee"}`, e as entidades vão para RETURN.

## 4. Fluxo de 9 passos (briefing §12) mapeado em eventos

| # | Passo do briefing | Lógica (autoridade) | Evento confirmado | Apresentação |
|---|---|---|---|---|
| 1 | Criatura identifica o inimigo | `partner` ou `wild` detecta alvo no `aggroRadius` (ou intent `engage`) | `engage {encounterId, attackerId, targetId}` | Ícone "!" de 400 ms sobre a cabeça; a criatura vira para o alvo |
| 2 | Aproxima-se do alvo | ENGAGE: anda até `attackRange` | `move` (posições no snapshot) | `walk` na direção do alvo, interpolado |
| 3 | Entra em estado de combate | primeira entrada em alcance: `encounter.active = true` | `encounter_start {encounterId, members[]}` | Barras de HP aparecem sobre os membros; anel discreto de 1 px no chão sob o alvo. **Câmera e mapa não mudam** |
| 4 | Executa a animação de ataque | cooldown pronto → a sim **resolve o golpe neste tick** (acerto, dano, crítico, afinidade) | `attack_start {attackerId, targetId, skillId, hitAtMs}` | Inicia `attack` (one-shot). `hitAtMs` = soma das durações até o `HitFrame` do manifest |
| 5 | Efeito visual exibido | — | (mesmo evento) | No `HitFrame`: efeito da skill (`04-effects/combat/…`) entre atacante e alvo |
| 6 | Servidor confirma o dano | dano aplicado ao HP lógico | `damage {targetId, amount, kind, crit, hpAfter}` | Ver regra de sincronia abaixo |
| 7 | HP é atualizado | — | (mesmo evento) | Barra anima de `hpBefore` para `hpAfter` em 150 ms, com resto "fantasma" claro por 400 ms. Número `-N` sobe 12 px em 400 ms |
| 8 | Inimigo executa a reação | se `hpAfter > 0`: o alvo entra em HURT (e responde no próximo turno dele) | `hurt {id}` implícito no `damage` | `hurt` + flash de 67 ms + recuo visual de 2 px (só visual: a posição lógica não muda) |
| 9 | Continua até derrota ou fuga | repete 4–8 conforme cooldowns. HP 0 → `defeat`. Fuga → `encounter_end` | `defeat {id, by}`, `reward {xp, bits, drops}`, `encounter_end {reason}` | DEFEAT (fade), floaters de XP e loot no local, barras somem 1 s depois. As entidades vivas vão para IDLE, FOLLOW ou RETURN |

**Regra de sincronia (anti "animação decide"):**
- O cliente recebe `attack_start` e `damage` no **mesmo tick** (sim local) ou com latência (servidor). O `damage` é *enfileirado* e exibido em `max(chegada, início da animação + hitAtMs)`. Assim, o número sai no impacto quando chega a tempo; se chegar atrasado, sai na chegada.
- Se o `damage` não chegar até `hitAtMs + 500 ms`, a animação termina sem número e sem HURT. **Nada é mostrado como acerto sem confirmação.**
- Se chegar `defeat` sem `attack_start` visível (por exemplo, a entidade entrou na tela agora), a view mostra o DEFEAT direto.
- Erro (`miss`) é um evento: aparece o texto "MISS", sem HURT.

## 5. Contrato de dados

```ts
// Emitido pela autoridade (sim local ou servidor). Ordenado por tick e depois por seq.
type WorldEvent =
  | { t: "spawn"; tick: number; entity: EntitySnapshot }
  | { t: "despawn"; tick: number; id: string }
  | { t: "engage"; tick: number; encounterId: string; attackerId: string; targetId: string }
  | { t: "encounter_start"; tick: number; encounterId: string; members: string[] }
  | { t: "attack_start"; tick: number; attackerId: string; targetId: string; skillId: string; seq: number }
  | { t: "damage"; tick: number; seq: number; targetId: string; amount: number; kind: "damage" | "heal" | "miss"; crit: boolean; hpAfter: number }
  | { t: "defeat"; tick: number; id: string; by?: string }
  | { t: "reward"; tick: number; ownerId: string; xp: number; bits: number; drops: string[]; at: { x: number; y: number } }
  | { t: "encounter_end"; tick: number; encounterId: string; reason: "defeat" | "flee" | "leash" | "timeout" };

interface EntitySnapshot {
  id: string; kind: "player" | "partner" | "remote_player" | "remote_partner" | "wild" | "npc";
  speciesId?: string; ownerId?: string;
  x: number; y: number; facing: Dir8; state: LogicState; hp: number; maxHp: number; targetId?: string;
}
```

- `seq` liga cada `damage` ao seu `attack_start`.
- O snapshot de posições vem a cada tick (sim local) ou em deltas (servidor). A view interpola entre os dois últimos snapshots (atraso de 1 tick, ~100 ms) para o movimento ficar suave a 60 fps.
- Determinismo: as mesmas sementes e os mesmos intents produzem os mesmos eventos (teste obrigatório, como no motor atual).
- Os eventos não são salvos. O save guarda o estado (como hoje em `save.ts`).

## 6. Barras de HP e efeitos sobre as entidades

| Elemento | Regra |
|---|---|
| **Barra de HP** | Acima da cabeça: `y = topo do frame atual − 3 px` (usa o ponto de ancoragem `head` do manifest, se houver). Largura `min(frameW, 24) + 2`, altura 3 px (1 px de borda escura + 2 px de valor). Cores: verde > 50%, amarelo 25–50%, vermelho < 25%. Inteiros, sem subpixel |
| **Quando aparece** | Sempre para membros de um encontro ativo e para a parceira do jogador local. Para os outros, só por 3 s após levarem dano. Nunca para NPCs |
| **Nome e nível** | Só no hover/toque ou no alvo atual (para não poluir o mapa). Fonte de pixel existente (`pixelfont.ts`) |
| **Números de dano** | Sobem 12 px em 400 ms com fade nos últimos 150 ms. Crítico em amarelo e 1 px maior. Cura em verde `+N`. MISS em cinza. Espalhados em −10/0/+10 px quando simultâneos (regra atual do renderer) |
| **Efeito de golpe** | Folha de efeito (`04-effects/combat/`) desenhada no ponto de impacto (ancoragem `hit` do alvo, ou o centro do frame), na camada acima das entidades, por ≤ 300 ms. Sem tremer a tela e sem flash de tela inteira ("efeitos sem exagero", §2) |
| **Flash HURT** | Silhueta branca por 67 ms (máscara pela alpha do frame) |
| **Sombra** | Elipse do manifest (ou a `Shadow.png` do PMD) sempre sob a entidade, inclusive em ATTACK e HURT |
| **Indicador de alvo** | Anel de 1 px no chão sob o alvo atual da parceira do jogador local |
| **Ordenação** | Camadas: chão → sombras → entidades e props por `y` dos pés → efeitos → barras e números → HUD DOM. As barras ficam sempre acima de todas as entidades, para não serem cobertas |

## 7. Outros jogadores visíveis

- Jogadores remotos e suas criaturas são `Entity` como quaisquer outras: mesma FSM, mesma interpolação, mesmos efeitos.
- **O combate de um jogador não pausa, não esconde e não desacelera os outros.** Não existe "instância" de combate.
- Prioridade de render quando houver muitas entidades (≥ 60 na tela [H]): (1) jogador local e parceira, (2) encontro atual do jogador, (3) demais entidades. Efeitos e números de terceiros são cortados primeiro (LOD visual), **nunca** as entidades.
- Os números de dano de terceiros são menores e com alpha de 70%, para o jogador ler o próprio combate.
- No protótipo, os jogadores remotos são simulados por bots dentro do `WorldSim` local (mesmo contrato de evento). Não há rede.

## 8. Sem troca de cena (checklist de QA)

- [ ] Iniciar e terminar um combate não altera `camera`, `mapId` nem a lista de camadas.
- [ ] Não existe nenhum código de "BattleScene", fade de tela inteira ou transição.
- [ ] Durante um combate, outra entidade fora do encontro continua em WALK ou IDLE (teste automatizado na sim: as posições delas mudam durante o `encounter`).
- [ ] O jogador pode mover a câmera ou o Tamer durante o combate. A parceira continua lutando até o `leashRadius`.
- [ ] Remover a animação `attack` de uma criatura (ou trocá-la por um único frame) **não muda** nenhum resultado da sim (teste: mesma semente → mesmos eventos de dano, com e sem manifest de animação).

## 9. Parâmetros (dados, por pack ou espécie)

`aggroRadius`, `attackRange`, `leashRadius`, `followDist`, `attackCooldownTicks` (por skill), `hurtMs`, `despawnMs`, `sleepAfterMs`, `fleeHpPct`. A fórmula de dano, a afinidade e a XP continuam em `formulas.ts` e no `balance.json` atual.

## 10. Fora do escopo desta spec

Arena e PvP, pathfinding completo (A* fica para quando houver mapas com obstáculos complexos), netcode real (predição e reconciliação), áudio.
