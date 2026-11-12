# ANIMATION_STANDARD — GS-003

- **Autor:** game-art · **Data:** 2026-11-08 · **Base:** `docs/briefing/01_GS001_creature_world_foundation.md` §6 (lista P0/P1/P2), `docs/WORLD_COMBAT_VISUAL_SPEC.md` (eventos confirmados, `HitFrame`, sincronia dano↔animação), `SPRITE_SPECIFICATION.md` (direções), convenção de durações já usada em `art/src/pmd/anim_specs.js`.
- `loop=false` = animação one-shot, a entidade volta ao estado anterior (IDLE/ENGAGE) ao terminar, conforme a máquina de estados de `WORLD_COMBAT_VISUAL_SPEC.md` §3.
- **Regra de ouro (`WORLD_COMBAT_VISUAL_SPEC.md` §8):** remover ou trocar a animação `attack` por um frame único **não pode mudar nenhum resultado de combate** — os `events` abaixo (ex. `hitFrame`) servem para sincronizar o efeito visual com o dano já confirmado pela simulação, nunca para decidir o dano.

---

## P0 — obrigatórias para toda criatura jogável

| Animação | Frames | FPS | Loop | Direções | Eventos |
|---|---|---|---|---|---|
| **Idle** | 2–4 | 2–3 fps (respiração/piscar lento) | sim | 1 | — |
| **Walk** | 4 | 8 fps | sim | ver `SPRITE_SPECIFICATION.md` §5 (mín. 3, recomendado 8) | `stepFrame` opcional nos frames 1 e 3 (0-index), para SFX de passo quando houver áudio |
| **Sleep** | 2 | 1 fps (bob bem lento) | sim | 1 | — |
| **Follow** | reaproveita os frames de **Walk** (mesma direção corrente), a 6 fps em vez de 8, para ler como "seguindo atrás" sem desenhar arte nova | — | sim | mesma de Walk | — |
| **Hurt** | 2 | 12 fps | não | 1 | `hurtEnd` no último frame — fim do `hurtMs` da simulação (`WORLD_COMBAT_VISUAL_SPEC.md` §3), não decide dano |
| **Attack** | 3 (antecipação → impacto → retorno) | 10 fps (frame 1 mais lento, frame 2 instantâneo, frame 3 rápido) | não | mesma direção corrente (`SPRITE_SPECIFICATION.md` §5) | `hitFrame = 1` (0-index, o frame de impacto) — `WORLD_COMBAT_VISUAL_SPEC.md` usa este índice para calcular `hitAtMs` (soma das durações até aqui) e sincronizar o evento `damage` já confirmado pela simulação |

## P1 — prioridade seguinte

| Animação | Frames | FPS | Loop | Direções | Eventos |
|---|---|---|---|---|---|
| **Eat** | 3 (aproximação → mordida → mastigar) | 6 fps | não | 1 | `consumeFrame = 1` — quando o item visualmente "some" |
| **Happy** | 3 | 6 fps | curto (2–3 repetições, depois volta a Idle) | 1 | — |
| **Interact** | 2–3 | 6 fps | não | 1 | `interactFrame` no último frame |
| **Special Attack** | 4–5 | 10 fps | não | mesma direção corrente | `hitFrame` perto do frame 3 + `vfxFrame` (quando a partícula de habilidade nasce, pode coincidir com `hitFrame`) |
| **Defeat** | 3 | 6 fps | não | 1 | `deathFrame` no último frame — dispara o fade de 600ms e a remoção da entidade já descritos em `WORLD_COMBAT_VISUAL_SPEC.md` §3 (a *remoção em si* é decidida pela simulação, não pela animação) |
| **Evolution** | 6–8 (cinemática curta, câmera focada) | 8 fps | não | 1 | `glowStart`, `flashFrame` (branco cheio), `revealFrame` (troca para a forma evoluída) |

## P2 — cosmético / baixa prioridade

| Animação | Frames | FPS | Loop | Direções | Eventos |
|---|---|---|---|---|---|
| **Dance** | 4 | 6 fps | sim | 1 | — |
| **Emotes** | 1–2 (pode ser um ícone de balão em vez de corpo inteiro) | — | não | 1 | — |
| **Social Interaction** | 2–3 por par de criaturas | 6 fps | não | 1 | — |
| **Rare Animations** | igual a Dance/Happy em custo (4 frames, 6 fps) | 6 fps | não | 1 | Gatilho de baixa probabilidade é regra de gameplay, não de arte |
| **Cosmetic Variations** | não é uma animação própria — é troca de paleta/overlay sobre os rigs de P0/P1 já existentes | — | — | — | Reaproveita os frames existentes; nunca gera uma pose nova |

---

## Notas de implementação

- **FPS "configurável"** (pedido do briefing): os valores acima são o padrão por animação, mas o manifest (`creature.json` → `animations.<nome>.fps` ou `durationMs` por frame) pode sobrescrever por criatura — ex. uma criatura muito grande/pesada pode ter Walk a 6 fps em vez de 8 para "pesar" mais.
- **Duração vs. frames:** seguindo `art/src/pmd/anim_specs.js` (já validado no pipeline anterior), cada frame pode ter sua própria duração em vez de um fps fixo por animação inteira — útil em Attack (antecipação mais lenta que o impacto). O schema (`creature.schema.json`) aceita `durationMs` por frame; `fps` é só um atalho quando todos os frames têm a mesma duração.
- **Eventos não decidem resultado:** todo campo em `events` é um gatilho **visual/áudio** (quando mostrar um efeito, quando tocar um som, quando trocar de forma na Evolution) — o dano, a derrota e o XP vêm sempre do `WorldEvent` confirmado pela simulação (`WORLD_COMBAT_VISUAL_SPEC.md` §4–§5), nunca do índice do frame por si só.

## Limitações

- Os valores de fps/frames desta tabela são uma proposta de direção **[H]**, calibrada pela convenção já usada no pipeline anterior (`anim_specs.js`) e pelos exemplos reais já produzidos (`agumon.js` walk/attack/hit) — não foram testados com jogador real nem revisados quadro a quadro nesta entrega além do piloto de Idle (`ART_STYLE_GUIDE.md` §7).
- Nenhuma criatura desta entrega tem o conjunto P0 completo de animações produzido — a ficha piloto cobre só 1 pose estática de calibração, não os 6 estados P0 reais em frames.
- "Follow reaproveita Walk" é uma decisão de economia de arte (§P0) consistente com a regra do briefing de não exigir direção/animação nova sem necessidade — se o game-dev precisar de uma leitura visual diferente para "seguindo o dono" vs. "andando por comando", isso pode exigir revisão.
