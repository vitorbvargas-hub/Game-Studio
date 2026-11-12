# SPRITE_SPECIFICATION — GS-003

- **Autor:** game-art · **Data:** 2026-11-08 · **Base:** `ART_STYLE_GUIDE.md`, `docs/WORLD_COMBAT_VISUAL_SPEC.md` (game-dev — define `Dir8`, âncoras `head`/`hit`, barra de HP, sombra), `docs/TECH_AUDIT.md` (engine real: Canvas 2D próprio, Phaser não instalado).
- Os nomes de campo deste documento (`head`, `hit`, `Dir8`, `HitFrame`) são os mesmos já usados por `WORLD_COMBAT_VISUAL_SPEC.md` — não renomear sem atualizar os dois documentos juntos.

---

## 1. Tamanho de frame por porte

| Porte | Frame nativo | Tile (32px) |
|---|---|---|
| Bebê / In-Training | 32×32 px | 1×1 |
| Rookie | 48×48 px | 1,5×1,5 |
| Champion | 64×64 px | 2×2 |
| Tamer (jogador) | 48×64 px | 1,5×2 |

O frame inclui folga para partes que ultrapassam o corpo em repouso (orelhas levantadas, cauda, avanço do ataque) — a silhueta "de repouso" ocupa tipicamente 70–85% da largura/altura do frame, nunca a borda exata.

## 2. Pivô

**Pivô nos pés**, centro horizontal, base do frame menos a sombra: `pivot = { x: frameW / 2, y: frameH - groundOffset }`, onde `groundOffset` é a distância entre a base do frame e o ponto de contato real dos pés (normalmente 0–2px, para a sombra "vazar" 1–2px abaixo do pivô). O pivô é o ponto que a simulação usa para posicionar a entidade no mundo (coordenada `x,y` do `EntitySnapshot`, em sub-tiles de 1/16 de tile — `WORLD_COMBAT_VISUAL_SPEC.md` §2).

## 3. Hitbox

Caixa menor que o frame inteiro, centrada no pivô horizontalmente, para toque/clique e colisão simples:

```
hitbox = {
  x: pivot.x - frameW * 0.28,
  y: pivot.y - frameH * 0.62,
  w: frameW * 0.56,
  h: frameH * 0.62,
}
```

Não usar o frame inteiro como hitbox — orelhas, cauda e o avanço do quadro de ataque não devem contar para toque/colisão.

## 4. Pontos de âncora

| Âncora | Uso | Regra |
|---|---|---|
| `head` | Base da barra de HP, nome e nível (`WORLD_COMBAT_VISUAL_SPEC.md` §6: `y = topo do frame atual − 3px`, usa esta âncora **se existir**, senão cai no topo do frame) | Ponto no topo real da cabeça da criatura (não o topo do frame, que pode ter folga vazia acima — ex. orelhas baixadas). |
| `hit` | Onde o efeito de golpe é desenhado **no alvo** quando ele é atingido (`WORLD_COMBAT_VISUAL_SPEC.md` §6: "ancoragem `hit` do alvo, ou o centro do frame" como fallback) | Ponto aproximado do centro de massa/peito — onde um golpe "acerta" visualmente. |
| `shadow` | Elipse de sombra de contato sob a entidade, sempre visível (inclusive em ATTACK/HURT) | `{ cx, cy, rx, ry }` relativo ao frame; `cy` próximo do pivô. |
| `effect` (opcional, P1/P2) | Ponto de anexo para auras, item seguro, partícula de habilidade contínua | Só quando a criatura/animação precisar; não obrigatório em P0. |

Essas 4 chaves (`head`, `hit`, `shadow`, `effect`) são as mesmas usadas em `GAME-ASSETS/07-manifests/creature.schema.json` (`anchors`).

## 5. Direções por animação (por comportamento, não "4 para tudo")

O briefing e `WORLD_COMBAT_VISUAL_SPEC.md` usam `Dir8` (8 direções) na **lógica** (`EntitySnapshot.facing`). Isso não obriga 8 desenhos por animação — a regra é por comportamento:

| Animação | Direções desenhadas | Como preencher as outras |
|---|---|---|
| **Idle, Sleep** | 1 (sul/câmera) | Não precisa — a criatura não se move durante idle/sleep, direção fixa é suficiente. |
| **Walk, Follow, Return, aproximação do Engage** | Mínimo P0: **3** (Sul, Leste, Norte) · Recomendado: **5 desenhadas + 3 espelhadas = 8** (S, SE, E, NE, N desenhadas; NW, W, SW = espelho horizontal de NE, E, SE via `Canvas.flipX()`) | Técnica já validada no pipeline (`art/src/pmd/common.js`, `DIR_ORDER`/`UNIQUE_DIRS`) — reaproveitar a mesma convenção de 5+espelho, mesmo desenhando os frames por matriz de caracteres em vez de formas paramétricas. |
| **Attack** | Mesma direção já ativa no momento do ataque (a entidade já girou para o alvo durante ENGAGE) — não precisa de um segundo grid de direções independente do Walk | Reaproveita a direção corrente; não gerar combinação direção×ataque separada. |
| **Hurt, Defeat** | 1 (a reação usa deslocamento — `Canvas.translate()` — na direção oposta à corrente, não arte por direção) | Nenhuma — puramente visual, a posição lógica não muda (`WORLD_COMBAT_VISUAL_SPEC.md` §8, item do flash/recuo). |
| **Eat, Happy, Interact, Special Attack, Evolution, Dance, Emotes, Social, Rare, Cosmetic (P1/P2)** | 1 (pose "de vitrine", câmera-padrão) | Nenhuma — são animações de vitrine/flavor, não acontecem em movimento. |

## 6. Formato de exportação

1. **PNG por frame**, nome `<creatureId>_<anim>[_<dir>]_<NN>.png`, fundo transparente, resolução nativa (sem escala) — mesma convenção já usada por `art/src/anim_io.js` (`writeFrames`), estendida com o segmento `<dir>` quando a animação tiver mais de 1 direção.
2. **Spritesheet** por criatura: todos os frames de todas as animações/direções empacotados numa grade única (linhas = animação×direção, colunas = frame), PNG único, sem padding sobreposto (1px de margem entre células para evitar bleeding de filtro).
3. **JSON de atlas compatível com Phaser** ("JSON Hash" / formato TexturePacker, o que o `load.atlas()` do Phaser consome): `frames` é um objeto chaveado pelo nome do PNG individual, cada entrada com `frame{x,y,w,h}`, `sourceSize{w,h}`, `pivot{x,y}` (fração 0–1 do frame). **Nota de engenharia [E, `docs/TECH_AUDIT.md`]:** o protótipo atual **não usa Phaser** (Phaser 3 não está instalado nem disponível de forma confiável neste host) — o motor real é um Canvas 2D próprio (TS+Vite). "Compatível com Phaser" aqui significa **formato** compatível (mesmo schema que o `load.atlas()` do Phaser aceitaria se um dia o estúdio migrar), não que o jogo hoje carregue via Phaser; o consumidor real hoje é o renderer Canvas 2D custom, que lê o mesmo JSON como tabela de lookup de retângulos.
4. **JSON de animação** por criatura (pode viver dentro de `creature.json`, campo `animations`, ver `creature.schema.json`): lista por animação o nome, loop, direções, frames (referência ao atlas + `durationMs`), e `events` (ex. `hitFrame`) — ver `ANIMATION_STANDARD.md` para os valores de cada animação P0/P1/P2.

## 7. Sprites oficiais (`official-fan-use`) — base inicial (atualização 2026-11-08)

Com a liberação de sprites oficiais DW DS/Dawn/Dusk/PMD Chunsoft (`ASSET_LICENSE_POLICY.md` §3), eles entram no mesmo `creature.json`/mesmas âncoras deste documento, mas com regras próprias:

1. **Pivot e hitbox não vêm prontos no arquivo oficial** (que é só uma imagem/GIF, não um export de engine) — precisam ser definidos manualmente por quem integra o sprite, olhando o arquivo: pivot nos pés (§2), hitbox centrada (§3), do mesmo jeito que para um sprite `original`.
2. **`head`/`hit`/`shadow` (§4) também precisam ser marcados manualmente** — o arquivo oficial não traz essas âncoras.
3. **Direções disponíveis variam por sprite** — os 4 arquivos inspecionados nesta sessão (`ASSET_LICENSE_POLICY.md` §3) mostraram 1 pose por chamada de inspeção; não foi confirmado quantas direções/frames cada GIF realmente contém **[H]**. A política de §5 (3 ou 8 direções) continua sendo a meta; se o sprite oficial só tiver 1 direção, usar essa única direção para todo `Dir8` até uma substituição por arte própria (`ASSET_LICENSE_POLICY.md` §3, `replacementStatus`) resolver isso, em vez de bloquear a integração.
4. **Não redimensionar com interpolação** — mesma regra de nearest-neighbor/padding de `ART_STYLE_GUIDE.md` §2 (nota DW DS).
5. **`creature.schema.json` já aceita `assetOrigin.layer: "official-fan-use"`** (atualizado nesta revisão) — o restante do schema (dimensions/pivot/hitbox/anchors/animations/combatStates) é o mesmo, preenchido manualmente para cada sprite oficial integrado.

## 8. Limitações

- As dimensões de frame (§1) e a proporção Tamer/criatura são leituras visuais da imagem conceito do fundador (`ART_STYLE_GUIDE.md` §3), não medições em pixel — **[H]**.
- A recomendação "5 desenhadas + 3 espelhadas" (§5) é uma técnica validada em código (`art/src/pmd/common.js`), mas **não foi testada nesta entrega** com uma criatura completa em todas as 8 direções — só o idle 1-direção do piloto (`ART_STYLE_GUIDE.md` §7) foi de fato produzido.
- O formato de atlas (§6, item 3) ainda não foi integrado ao renderer real do game-dev — é uma proposta de formato, não uma implementação testada ponta a ponta.
- §7 é regra de integração, não uma integração feita — nenhum sprite oficial foi de fato baixado/recortado/anexado a um `creature.json` real nesta sessão (`ASSET_LICENSE_POLICY.md` §8, mesmo bloqueio de `curl`/proxy).
