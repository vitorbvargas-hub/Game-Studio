# MOVE_SYSTEM — golpes, learnset e VFX (GS-003)

- **Autor:** game-design (subagente) · **Data:** 2026-11-08 · **Status:** especificação v1, dados prontos para consumo. Ainda não implementada no `prototype/world`.
- **Pedido do fundador:** "Todos os Digimon só têm 1 ataque? Tem que ter 4, e ir aprendendo mais, e a pessoa mudando. Cada ataque com um efeito visual bonito."
- **Fontes:** ADR-009, ADR-010, `docs/WORLD_COMBAT_VISUAL_SPEC.md` (eventos de combate, `attack_start`/`damage`, `HitFrame`), `docs/ANIMATION_STANDARD.md` (frames de Attack/Special Attack), código atual em `prototype/world/src/sim/{species.ts,world.ts,types.ts,params.ts}`, pacote `prototype/game/packs/digimon-fan/*`, Wikimon e `digimon.net/reference` (citados por golpe nas tabelas do §6).
- **Estado atual do jogo [E]:** cada espécie tem um array `skills: string[]` fixo (`species.ts`/`world-species.json`). `pickSkill()` em `world.ts` escolhe o primeiro golpe de dano não-básico fora de recarga, senão usa o básico universal `investida` (`balance.json.basicSkillId`). Não há MP/energia, não há aprendizado por nível, não há herança na evolução, não há UI de golpes. Este documento substitui esse modelo pelo sistema de 4 slots abaixo.

---

## 1. Formato dos dados (JSON) — PRIMEIRO, para o game-dev começar em paralelo

Três arquivos em `prototype/world/src/data/moves/`: `moves.json` (catálogo de golpes), `learnsets.json` (o que cada espécie aprende e quando) e `vfx_archetypes.json` (os arquétipos de efeito reaproveitáveis). Os arquivos reais já estão escritos nesses caminhos — as interfaces abaixo descrevem o schema exato.

### 1.1 `moves.json`

```ts
interface MovesFile {
  schemaVersion: 1;
  /** Chave curta → URL da evidência, para não repetir a URL em cada golpe. */
  sources: Record<string, string>; // ex.: "wikimon:Agumon" -> "https://wikimon.net/Agumon"
  moves: Move[];
}

interface Move {
  id: string;                 // snake_case, estável (chave usada por learnsets.json e pelo AUTO)
  displayName: string;        // nome mostrado na UI (nome dub oficial quando existe)
  names: {
    ja?: string;               // nome original japonês
    romaji?: string;
    translation?: string;      // tradução literal do japonês
    dub?: string[];             // nome(s) usados no dub/localização em inglês
  };
  kind: "physical" | "special" | "buff" | "debuff" | "heal";
  element: "fire" | "ice" | "water" | "thunder" | "wind" | "light" | "dark" | "neutral";
  target: {
    shape: "single" | "area" | "line" | "projectile";
    side: "enemy" | "ally" | "all_allies" | "self";
  };
  power: number;               // [H] escala de balance.json atual (~70–230)
  cooldownTicks: number;       // [H] tick = 100 ms (params.ts TICK_MS)
  costMp: number;              // [H] novo recurso — ver §5
  vfxArchetype: string;        // id em vfx_archetypes.json
  evidence: string | null;     // chave em `sources`, ou null para golpe genérico/filler
  canonDescription?: string;   // descrição oficial (Reference Book / Wikimon), em inglês
  verified: boolean;           // true = técnica oficial com citação; false = filler genérico
}
```

Exemplo real (um golpe do catálogo):

```json
{
  "id": "pepper_breath",
  "displayName": "Pepper Breath",
  "names": { "ja": "ベビーフレイム", "romaji": "Bebī Fureimu", "translation": "Baby Flame", "dub": ["Pepper Breath", "Pepper Flame"] },
  "kind": "special",
  "element": "fire",
  "target": { "shape": "projectile", "side": "enemy" },
  "power": 150,
  "cooldownTicks": 40,
  "costMp": 15,
  "vfxArchetype": "fireball",
  "evidence": "wikimon:Agumon",
  "canonDescription": "Spits a fiery breath from its mouth.",
  "verified": true
}
```

### 1.2 `learnsets.json`

```ts
interface LearnsetsFile {
  schemaVersion: 1;
  /** Quantos golpes do kit anterior podem ser mantidos (slots) ao evoluir. [H] */
  inheritSlotsOnEvolve: number; // 2
  species: SpeciesLearnset[];
}

interface SpeciesLearnset {
  speciesId: string;           // CREATURE-NNNN — mesmo id de world-species.json
  name: string;
  stage: number;
  /** Golpes na ordem em que ficam disponíveis para aprender. Vários podem compartilhar o nível. */
  learnset: { level: number; moveId: string }[];
  evolvesFrom?: string;        // speciesId anterior na linha
  evolvesTo?: string[];        // speciesId(s) seguintes
}
```

Exemplo real (uma espécie):

```json
{
  "speciesId": "CREATURE-0006",
  "name": "Agumon",
  "stage": 2,
  "evolvesFrom": "CREATURE-0005",
  "evolvesTo": ["CREATURE-0007"],
  "learnset": [
    { "level": 8, "moveId": "pepper_breath" },
    { "level": 8, "moveId": "claw_attack" },
    { "level": 10, "moveId": "sharp_claws" },
    { "level": 11, "moveId": "spitfire" },
    { "level": 13, "moveId": "mach_jab" },
    { "level": 14, "moveId": "uppercut" },
    { "level": 15, "moveId": "baby_burner" },
    { "level": 15, "moveId": "triple_baby_flame" }
  ]
}
```

### 1.3 `vfx_archetypes.json`

```ts
interface VfxFile {
  schemaVersion: 1;
  archetypes: VfxArchetype[];
}

interface VfxArchetype {
  id: string;
  name: string;
  shape: "projectile" | "cone" | "explosion" | "beam" | "aura" | "melee_impact" | "ground_area";
  palette: string[];          // 3–4 cores hex
  particles: { type: string; count: number; sizePx: [number, number] };
  durationMs: number;         // ciclo completo (carga→resíduo)
  screenShake: { amplitudePx: number; durationMs: number } | null;
  flash: { color: string; alpha: number; durationMs: number } | null; // flash LOCAL no ponto de impacto, nunca tela cheia
  keyframes: {
    chargeMs: number;   // antecipação, antes do lançamento
    launchMs: number;   // o golpe "sai" da criatura
    travelMs: number;   // deslocamento até o alvo (0 para corpo a corpo/aura)
    impactMs: number;   // burst visível no alvo — respeita o limite de ≤300 ms de WORLD_COMBAT_VISUAL_SPEC §6
    residueMs: number;  // resíduo (fumaça, rachadura de gelo etc.) até desaparecer
  };
  notes?: string;
}
```

Exemplo real (um arquétipo):

```json
{
  "id": "fireball",
  "name": "Bola de fogo",
  "shape": "projectile",
  "palette": ["#ff6a00", "#ffb347", "#fff2c8", "#4a1500"],
  "particles": { "type": "ember", "count": 10, "sizePx": [2, 4] },
  "durationMs": 650,
  "screenShake": null,
  "flash": { "color": "#ffdca0", "alpha": 0.5, "durationMs": 90 },
  "keyframes": { "chargeMs": 120, "launchMs": 40, "travelMs": 180, "impactMs": 220, "residueMs": 90 }
}
```

### 1.4 Como isso se liga ao `WorldEvent` existente

Nada muda no contrato de `WorldEvent` de `WORLD_COMBAT_VISUAL_SPEC.md` §5: `attack_start` já carrega `skillId`. A `WorldView` troca `skillId` por `moves.json[skillId].vfxArchetype` para saber qual arquétipo desenhar, e usa `keyframes.chargeMs`/`impactMs` para casar com `hitAtMs` do manifest de animação (igual já descrito em `ANIMATION_STANDARD.md`). O dano continua resolvido pela sim no mesmo tick de `attack_start` — a VFX só representa, nunca decide.

---

## 2. Regras do sistema de golpes

### 2.1 Quatro slots ativos

Cada Digimon tem **4 slots de golpe equipados** por vez, escolhidos entre os golpes que já aprendeu (seu "golpes conhecidos", sem limite de quantidade conhecida — só o equipado é limitado a 4). Formas Baby (estágio 1) podem começar com menos de 4 golpes conhecidos; o 4º slot fica vazio até aprender o próximo.

### 2.2 Learnset por nível e por estágio

- Cada espécie tem sua própria lista `learnset` (um nível pode liberar mais de um golpe).
- Golpes aprendidos ficam disponíveis para equipar, mas **não entram sozinhos em um slot ativo** — o jogador decide o que equipar (ver §2.4). Exceção: se um slot está vazio (Baby com menos de 4 golpes), o golpe recém-aprendido entra automaticamente nele.
- Estágio determina a janela de níveis do learnset (Baby: 1–7, Child: 8–15, Adult: 16–20, de acordo com os limiares de evolução já usados em `creatures.json`/`world-species.json`).

### 2.3 Evolução: golpes novos e herança

- Ao evoluir, a nova forma libera 2 golpes novos **no nível da evolução** (ex.: Agumon nível 8 ganha `pepper_breath` e `claw_attack` de uma vez).
- O jogador pode manter até `inheritSlotsOnEvolve` (2, `[H]`) golpes da forma anterior entre os golpes **conhecidos** — eles continuam equipáveis mesmo na forma evoluída, competindo pelos mesmos 4 slots com os golpes novos. Não há regra de "golpe correto" herdado; é escolha do jogador na tela de evolução, com um padrão sugerido (manter os 2 golpes de maior `power` do kit anterior).

### 2.4 Aprender, esquecer e trocar — UI "Equipe & Box", aba Golpes

- Tela "Equipe & Box" (ADR-009 combate-no-mapa não é afetado — esta é uma tela de HUD/menu, não de batalha) ganha uma aba **Golpes** por Digimon da equipe/box:
  - Lista de golpes **conhecidos** (nome, tipo, elemento, poder, custo, descrição curta).
  - 4 slots equipados, com drag-and-drop ou toque para trocar um golpe conhecido por um equipado.
  - Golpes **não aprendidos ainda** aparecem cinza com o nível em que serão liberados.
  - **Esquecer** um golpe equipado = esvaziar o slot (o golpe permanece na lista de conhecidos, só sai do ativo); não há remoção permanente de golpe conhecido nesta versão.
  - Trocar golpes **fora de combate apenas** (a entidade precisa estar em `IDLE`/`FOLLOW`, nunca em `ENGAGE`/`ATTACK`/`HURT`) — consistente com "a lógica autoritativa decide", evita trocar o kit no meio de uma resolução de golpe.

### 2.5 Como o AUTO escolhe o golpe (gambit simples)

Hoje `pickSkill()` pega o primeiro golpe de dano fora de recarga. O novo `pickSkill` deve:

1. Receber a **lista de prioridade** configurada pelo jogador: os 4 slots equipados, em uma ordem, cada um com uma condição opcional:
   - `always` (padrão)
   - `target_hp_below_pct` (ex.: 30% — golpes de acabamento)
   - `self_hp_below_pct` (ex.: 40% — golpes de cura/defesa)
   - `ally_hp_below_pct` (para cura, quando houver aliados — fora do escopo do protótipo atual sem grupo, mas o campo já existe no schema)
   - `buff_not_active` (não usar um buff que já está ativo)
2. Percorrer a lista equipada na ordem configurada; usar o primeiro golpe cuja condição é satisfeita **e** está fora de recarga **e** há MP suficiente.
3. Se nenhum slot qualificar, cair no básico universal `investida` (sem custo, sem recarga — mantém o fallback atual).
4. Configuração default por espécie (se o jogador não editou nada): `always` em todos os 4 slots, na ordem do array equipado — reproduz o comportamento atual (primeiro disponível) até o jogador customizar.

Este é o "estilo gambits simples" pedido — não há árvore de condições encadeadas, só uma lista ordenada com um filtro por slot.

### 2.6 Cooldown e custo (MP/energia)

- **Cooldown** já existe (`cooldownTicks`, tick = 100 ms). Mantido por golpe.
- **MP/energia é novo** — o jogo atual não tem esse recurso. Proposta `[H]`:
  - `maxMp = 20 + nível × 2` (mesmo padrão simples de `statsAtLevel`, sem stat de MP própria por espécie nesta v1).
  - Regen passiva: fora de combate `5%` do `maxMp` por tick; em combate `1%` por tick (para não travar o AUTO em lutas longas, mas incentivar alternar básico/especial).
  - Golpe básico/genérico (`investida`, `tackle`, etc. com `kind: "physical"` e `power` baixo) custa `0` MP.
  - Golpes especiais/sinalizados custam `~power / 10` arredondado; buff/debuff/cura custam um pouco mais (prêmio de utilidade), já refletido nos valores de `moves.json`.
  - **Falta implementar:** campo de MP não existe em `Entity`/`StatBlock` (`sim/types.ts`). O game-dev precisa adicionar `mp`/`maxMp` ao estado da entidade e ao `EntitySnapshot` (para a barra de MP, se houver) — está fora do escopo de dados desta entrega.

### 2.7 Tipos de golpe

| `kind` | Efeito | Alvo típico |
|---|---|---|
| `physical` | Dano baseado em ATK do atacante vs. DEF do alvo (fórmula atual de `formulas.ts`, sem mudança) | enemy |
| `special` | Mesma fórmula de dano, mas narrativamente "à distância"/elemental (sem stat separado de "ATK especial" nesta v1 — `[H]` simplificação; ver Limitações) | enemy |
| `buff` | Aplica um efeito temporário no próprio usuário ou aliados (ex.: `+DEF`, `+ATK` por N ticks) — mesma mecânica de `guard`/`durationTicks` já usada em `mega_flame_guarda`/`postura_defensiva` no pacote atual | self / all_allies |
| `debuff` | Aplica um efeito temporário negativo no alvo (ex.: `-ATK`, `miss` forçado, `stun` curto) — mecânica nova, não existe no motor hoje | enemy |
| `heal` | Restaura HP (mesma mecânica de `vigilia_timida`/`mordida_inocente` já existentes) | ally_lowest / all_allies |

### 2.8 Alvo (`target.shape`)

| Shape | Significado | Exemplo |
|---|---|---|
| `single` | Atinge só o `targetId` do `attack_start` | Rock Breaker |
| `area` | Atinge o alvo e entidades hostis próximas dele num raio curto (`[H]`, raio a calibrar) | God Typhoon, Fire Wall (ally-side) |
| `line` | Atinge todas as entidades hostis numa linha reta a partir do atacante | Triple Baby Flame (3 direções), Aero Slash |
| `projectile` | Visualmente viaja até o alvo (trava no primeiro hostil no caminho); mecanicamente é `single` a menos que combinado com `area`/`line` | Pepper Breath, Howling Blaster |

`target.side` (enemy/ally/all_allies/self) determina quem pode ser escolhido como alvo — reaproveita o `targetId` já resolvido pela sim para golpes `enemy`; para `ally`/`self`/`all_allies` a sim não precisa de um novo alvo (usa o próprio `attackerId` ou a lista de membros do encontro).

### 2.9 Interação com atributo (Vaccine/Data/Virus) e elemento

- O **atributo** (Vaccine/Data/Virus/Free) continua sendo o eixo principal de vantagem, via `affinityChart` já existente em `theme.json` (±25%/±20%). **Não muda.**
- O **elemento** (`fire`, `ice`, `water`, `thunder`, `wind`, `light`, `dark`, `neutral`) é uma camada **secundária e mais fraca** `[H]`, multiplicada em cima do resultado do atributo — nunca o substitui:

| Vantagem elemental (×1.15) | Contra (×0.85) |
|---|---|
| fire → ice | ice → fire |
| ice → wind | wind → ice |
| wind → fire | fire → wind |
| light → dark | dark → light |
| dark → light | light → dark |
| water → fire | fire → water |

`neutral` e `thunder` não entram na tabela nesta v1 (sem vantagem/desvantagem, multiplicador 1.0) — poucos golpes dos 12 pilotos usam esses elementos, e um ciclo de 3 (fogo/gelo/vento) + dualidade luz/trevas já cobre a maior parte do roster. `[H]`, precisa de calibração em `formulas.ts`.

---

## 3. Golpes oficiais por Digimon (evidência Wikimon/digimon.net)

Todas as descrições abaixo são traduções/paráfrases do inglês da tabela "Attack Techniques" de cada página Wikimon, cruzada com o Digimon Reference Book oficial (`digimon.net/reference`) linkado na mesma página. **[E]** = verificado nas fontes citadas em 2026-11-08. Os **números** (poder, cooldown, custo, nível) são **[H]**, de design.

### Gigimon (Baby II) — [E] https://wikimon.net/Gigimon
Só 2 técnicas nomeadas no canône para esta forma — ver Limitações §6.
- **Hot Bite** (ホットバイト) — "ataca com uma mordida ardente". Golpe de assinatura.
- **Acid Bubbles** (さんのアワ/San no Awa, trad. "Frothy Spit") — "solta bolhas levemente ácidas pela boca".

### Guilmon (Child) — [E] https://wikimon.net/Guilmon
- **Rock Breaker** (ロックブレイカー) — "destrói rochas com suas garras firmes". Golpe de assinatura.
- **Fireball** / dub **Pyro Sphere** (ファイアーボール) — "solta um potente jato de fogo". Golpe especial.
- **Wild Scratch** (ワイルドスクラッチ) — "desce sobre o adversário arranhando freneticamente com as garras".
- **Kiai Tame** (気合い溜め, trad. "Fighting Spirit Gather") — "concentra energia e potencializa o próximo ataque". Buff.
- **Sharp Claws** (するどいツメ) — "ataca com suas garras afiadas" (mesma técnica japonesa de Agumon).
- **Guil Shot** (ギルショット) — "emite uma onda de choque pela boca".
- **Air Fireball** (空中ファイアーボール) — Fireball usado no ar.
- **Fire Rock Breaker** (ファイアロックブレイカー) — versão em chamas de Rock Breaker.

### Growlmon (Adult) — [E] https://wikimon.net/Growlmon
- **Plasma Blade** (プラズマブレイド) — "desenvolve plasma ao longo das lâminas dos cotovelos, então golpeia com elas". Golpe de assinatura.
- **Exhaust Flame** (エキゾーストフレイム) — "solta um forte jato de fogo com um rugido". Golpe especial.
- **Dino Kick** (ダイノキック) — "salta rapidamente sobre o inimigo e chuta com os dois pés".
- **Grow Claw** (グラウクロー) — "ataca usando suas garras enormes".
- **Howling** (ハウリング) — "faz o inimigo recuar de medo com um rugido feroz". Debuff.
- **Raiden Blade** (ライデンブレイド) — "libera energia intensa de sua lâmina de plasma".
- **Fire Blaster** (ファイアーブラスター) — "respira fogo continuamente".
- **Dragon Spine** (ドラゴンスパイン) — "açoita o inimigo com a cauda".

### Koromon (Baby II) — [E] https://wikimon.net/Koromon
- **Bubble Blow** (泡/Awa, trad. "Foam") — "produz bolhas pela boca para intimidar oponentes". Golpe especial.
- **Acid Bubbles** (さんのアワ) — igual ao de Gigimon.
- **Soft Tackle** / **Poyoyon Tackle** (ぽよよんタックル) — "ataca o oponente com uma batida suave de todo o corpo".

### Agumon (Child) — [E] https://wikimon.net/Agumon
- **Pepper Breath** / trad. **Baby Flame** (ベビーフレイム) — "escarra uma respiração de fogo pela boca". Golpe especial.
- **Claw Attack** / **Cross Fight** (クロスファイト) — "morde o inimigo ferozmente". Golpe físico.
- **Sharp Claws** (するどいツメ) — igual ao de Guilmon.
- **Spitfire** (スピットファイア) — "escarra bolas de fogo".
- **Baby Burner** (ベビーバーナー) — "acumula Baby Flame na boca e libera tudo de uma vez, num jato muito mais poderoso".
- **Triple Baby Flame** (トリプルベビーフレイム) — "dispara rapidamente três Baby Flames em três direções diferentes". Alvo em linha/múltiplo.
- **Mach Jab** (マッハジャブ) — "crava ou golpeia rapidamente o oponente com as garras das duas mãos".
- **Uppercut** (アッパーカット) — "um gancho em chamas com as garras".

### Greymon (Adult) — [E] https://wikimon.net/Greymon
- **Mega Flame** (メガフレイム) — "escarra chamas de altíssima temperatura pela boca". Golpe de assinatura/especial.
- **Great Antler** (グレートアントラー) — "dá uma cabeçada no inimigo com seus poderosos chifres".
- **Tail Whip** (テイルウィップ) — "golpeia o oponente com a cauda".
- **Great Horn Attack** (グレートホーンアタック) — "salta para cima, perfurando com os chifres".
- **Fire Wall** (ファイアウォール) — "cria uma parede de fogo para deter ataques inimigos". Buff/defesa.
- **Bit Fire** (ビットファイアー) — "escarra bolas de fogo pela boca".
- **Fire Horn** (ファイアホーン) — "ataca com seu chifre em chamas".
- **Horn Impulse** (ホーンインパルス) — "carrega o oponente e ataca várias vezes com os chifres".

### Tsunomon (Baby II) — [E] https://wikimon.net/Tsunomon
- **Bubble Blow** (アワ) — igual ao de Koromon.
- **Acid Bubbles** (さんのアワ) — igual ao de Koromon/Gigimon.
- **Tackle** (タックル) — "ataca o oponente com toda a força".
- (mantido da base de dados atual, não-canônico `[H]`) **Vigília Tímida** — cura o aliado com menos HP; ver Limitações §6.

### Gabumon (Child) — [E] https://wikimon.net/Gabumon
- **Petit Fire** / dub **Blue Blaster** (プチファイアー) — "dispara chamas pela boca". Golpe especial.
- **Little Horn** (リトルホーン) — "crava o chifre da cabeça no inimigo" / versão carregada: "golpeia de cima para baixo com o chifre alongado por energia".
- **Hidden Knock** / **Hidden Punch** (ヒドゥンノック) — "golpeia rapidamente o inimigo com socos".
- **Horn Attack** (ツノ攻撃/Tsuno Kougeki) — "ataca com o chifre".
- **Machine Gun Jab** (マシンガンジャブ) — "continua desferindo socos no oponente".
- **Drill Horn** (ドリルホーン) — "salta no ar e ataca com o chifre girando".
- **Crush Nail** (クラッシュネイル) — "libera um combo de ataques com as garras".
- **Blue Cyclone** (ブルーサイクロン) — "gira enquanto escarra fogo azul pela boca".

### Garurumon (Adult) — [E] https://wikimon.net/Garurumon
- **Foxfire** / dub **Howling Blaster** (フォックスファイアー) — "escarra chamas azuis de alta temperatura pela boca" (dublagem reinterpreta como gelo: "escarra chamas azuis congelantes"). Golpe de assinatura/especial.
- **Tai Atari** / **Body Blow** (たいあたり) — "atropela o inimigo com o corpo" (mesma técnica japonesa de Patamon).
- **Garuru Thrust** (ガルルスラスト) — "ataca com as garras".
- **Ice Wall** (アイスウォール) — "respira uma parede de gelo para repelir ataques". Buff/defesa.
- **Freeze Fang** (フリーズファング) — "morde o inimigo com presas geladas".
- **Ice Cannon** (アイスキャノン) — "dispara bolas de gelo pela boca".
- **Ice Statue** (アイススタチュー) — "encapsula o inimigo numa pequena montanha de gelo". Debuff (imobilização).
- **Wolf Cry** (ウルフクライ) — "uiva uma onda de choque poderosa". Debuff.

### Tokomon (Baby II) — [E] https://wikimon.net/Tokomon
- **Bite** (噛み付き/Kamitsuki) — "abre bem a boca e morde o oponente com dentes de tubarão". Golpe de assinatura.
- **Bubble Blow** (アワ) — "dispara substâncias semelhantes a bolhas pela boca".
- **Acid Bubbles** (さんのアワ) — igual às demais formas Baby.
- (mantido da base de dados atual, não-canônico `[H]`) **Mordida Inocente** — cura todo o time; ver Limitações §6.

### Patamon (Child) — [E] https://wikimon.net/Patamon
- **Air Shot** / dub **Boom Bubble** (エアショット) — "aspira o ar e solta um jato de ar de uma vez". Golpe especial.
- **Hane Binta** / **Wing Slap** (はねビンタ) — "golpeia o oponente com suas grandes orelhas".
- **Tai Atari** / **Body Blow** (たいあたり) — igual ao de Garurumon.
- **Aerial Air Shot** (空中エアショット) — Air Shot usado no ar.
- **Air Slam** (エアスラム) — "dispara pelo ar, atingindo um inimigo".
- **Thousand Wing** (タウザンドウイング) — "gira no ar para atacar o inimigo com as orelhas" / "balança as orelhas em todas as direções disparando lâminas de vento". Alvo em área/linha.
- **Sparking Air Shot** (スパーキングエアショット) — versão potencializada e brilhante de Air Shot.
- **Aero Slash** (エアロスラッシュ) — "respira ar e o dispara como lâminas de vento".

### Angemon (Adult) — [E] https://wikimon.net/Angemon
- **Heaven's Knuckle** / dub **Hand of Fate** (ヘブンズナックル) — "golpeia o oponente com o punho brilhando em dourado" / "reúne poder sagrado no punho e dispara um feixe de luz sagrada dele". Golpe de assinatura/especial.
- **Holy Rod** (ホーリーロッド) — "golpeia o oponente com seu Holy Rod brilhante".
- **God Typhoon** (ゴッドタイフーン) — "gira o Holy Rod e/ou a si mesmo para criar um tornado". Área.
- **Angel Slam** (エンジェルスラム) — "usa o Holy Rod para erguer um inimigo e arremessá-lo no chão".
- **Staff Sweep** (スタッフスィープ) — "derruba o oponente com o Holy Rod". Debuff (queda/atordoamento curto).
- **Halo Attack** (ヘイロウアタック) — "gira no ar balançando o Holy Rod".
- **Holy Shot** (ホーリーショット) — "dispara uma bala de energia sagrada do bastão giratório".

---

## 4. Arquétipos de VFX (13 arquétipos parametrizáveis)

Cada arquétipo é implementado **uma vez** pelo game-dev e reaproveitado por todos os golpes que apontam para ele via `vfxArchetype`. Paletas e partículas em `vfx_archetypes.json`; aqui vai o resumo de forma e uso.

| Arquétipo | Forma | Usado por (exemplos) | Paleta |
|---|---|---|---|
| `fireball` | projétil | Pepper Breath, Fireball/Pyro Sphere, Baby Burner, Bit Fire | laranja/amarelo/creme/marrom-queimado |
| `breath_flame` | cone | Exhaust Flame, Fire Blaster, Mega Flame, Blue Cyclone | laranja/vermelho/amarelo/fumaça |
| `ice_shard` | projétil | Ice Cannon, Freeze Fang (visual de presa gelada) | azul-claro/branco/ciano/azul-escuro |
| `beam` | raio | Holy Shot, Guil Shot, Sparking Air Shot | dourado/branco/amarelo-claro |
| `claw_slash` | impacto corpo a corpo | Rock Breaker, Sharp Claws, Garuru Thrust, Great Antler | branco/cinza/vermelho (risco de impacto) |
| `energy_blade` | impacto corpo a corpo com rastro | Plasma Blade, Raiden Blade, Fire Rock Breaker | ciano/branco/azul-elétrico |
| `holy_burst` | explosão | Hand of Fate, Holy Rod, Angel Slam | dourado/branco/amarelo-pálido |
| `bubble_spit` | projétil/pequena área | Bubble Blow, Acid Bubbles | rosa-claro/branco/verde-água |
| `wind_blade` | linha/cone | Aero Slash, Thousand Wing, Boom Bubble, Hane Binta | branco/ciano-claro/cinza-azulado |
| `tackle_impact` | impacto corpo a corpo (contundente) | Tai Atari, Tackle, Dino Kick, Wild Scratch | branco/amarelo-pálido (linhas de impacto) |
| `tornado_field` | área no chão | God Typhoon | branco/dourado/ciano |
| `guard_aura` | aura | Kiai Tame, Fire Wall, Ice Wall | dourado (Kiai), laranja (Fire Wall) ou azul (Ice Wall) — paleta troca por golpe, forma fixa |
| `fear_howl` | cone | Howling, Wolf Cry, Staff Sweep (debuff vocal/queda) | roxo-acinzentado/preto/branco |
| `freeze_bind` | área | Ice Statue | azul-gelo/branco/ciano |
| `multi_hit_flurry` | impacto corpo a corpo (repetido) | Mach Jab, Machine Gun Jab, Crush Nail, Horn Impulse | branco/amarelo (linhas de impacto repetidas) |

Isso soma **15 arquétipos** (contando `fireball`, `breath_flame`, `ice_shard`, `beam`, `claw_slash`, `energy_blade`, `holy_burst`, `bubble_spit`, `wind_blade`, `tackle_impact`, `tornado_field`, `guard_aura`, `fear_howl`, `freeze_bind`, `multi_hit_flurry`), dentro da faixa pedida (12–15).

### Regras gerais de VFX (ADR-009 "efeitos sem exagero" + `WORLD_COMBAT_VISUAL_SPEC.md` §6)

- O burst visível no ponto de impacto (`keyframes.impactMs` + `residueMs`) fica **dentro de ~300 ms**, igual à regra já existente para "efeito de golpe" no mapa.
- `screenShake` é `null` na maioria dos arquétipos; quando existir (ex.: `tornado_field`, golpes "Special Attack" grandes), amplitude **≤ 2 px** e duração **≤ 150 ms** — nunca um tremor de tela inteira.
- `flash` é sempre **local** ao ponto de impacto/à silhueta do alvo (reaproveita a máscara de alpha do frame, igual ao flash de HURT), nunca um flash de tela cheia.
- Frames-chave (carga → lançamento → viagem → impacto → resíduo) casam com a estrutura de animação já definida em `ANIMATION_STANDARD.md`: Attack (3 frames: antecipação/impacto/retorno) para golpes físicos simples, Special Attack (4–5 frames, `hitFrame` + `vfxFrame`) para golpes especiais/elementais com projétil ou área.

---

## 5. Novo recurso: MP/energia — o que falta no código

Esta entrega é de **dados e regras**, não de implementação. Para o sistema funcionar, o game-dev precisa:

1. Adicionar `mp`/`maxMp` a `Entity` e a `EntitySnapshot` (`sim/types.ts`), e a lógica de regen em `thinkPartner`/`thinkWild` (hoje só HP regenera).
2. Trocar `species: string[]` fixo por `knownMoves: string[]` + `equippedMoves: [string, string, string, string]` (ou `[string?, ...]` para slots vazios em Baby).
3. Adicionar o learnset-check no XP/level-up (`reward()` em `world.ts`): ao subir de nível, verificar `learnsets.json` para a espécie e emitir um novo `WorldEvent` (`move_learned`) quando houver golpe novo no nível alcançado.
4. Reescrever `pickSkill()` para seguir a lista de prioridade com condições (§2.5) e checar `costMp` antes de confirmar.
5. Tratar a evolução (`evolve()`, ainda não existe no código — a evolução em si está fora desta entrega) para oferecer a escolha de herança (§2.3).

Nenhum desses pontos está implementado nesta entrega; ficam para o game-dev, com os dados já no formato final.

---

## 6. Limitações

- **Golpes Baby (estágio 1) não têm 6–8 técnicas oficiais.** O Digimon Reference Book e os jogos linkados no Wikimon documentam só **2–3 técnicas nomeadas** para Gigimon, Koromon, Tsunomon e Tokomon — é um padrão canônico real (formas Baby raramente têm golpe próprio documentado), não uma lacuna de pesquisa. Preenchi os 4 slots dessas formas com o básico universal `investida` (golpe genérico, `verified:false`, sem assinatura) e, no caso de Tsunomon/Tokomon, mantive os golpes de cura **não-canônicos** (`vigilia_timida`, `mordida_inocente`) que já existiam em `creatures.json` antes desta entrega, para o tipo `heal` ter pelo menos um representante no roster piloto — eles seguem marcados como não-oficiais no catálogo. Nenhuma das 12 espécies do piloto tem um golpe `heal` **oficial** documentado — isso por si é um achado [E], não uma omissão.
- **Child e Adult têm 7–8 golpes oficiais cada**, bem acima do mínimo pedido — a limitação é só nas formas Baby.
- **Números de balance (poder, cooldown, custo de MP, nível de aprendizado) são 100% [H]**, como pedido — não foram calibrados jogando.
- **MP/energia é um recurso novo**, sem suporte ainda no código da sim (`sim/types.ts`/`world.ts`) — ver §5. Até isso ser implementado, os golpes continuam funcionando só por cooldown, como hoje.
- **Elemento (fogo/gelo/vento/luz etc.) é uma camada nova [H]**, não documentada em nenhum ADR anterior — a tabela de vantagem elemental (§2.9) precisa de validação de game design e calibração em `formulas.ts`.
- **Debuff como mecânica (`stun`, imobilização, redução de atributo por tempo) não existe hoje no motor** — só `guard` (buff) e `heal` já têm precedente no pacote atual (`mega_flame_guarda`, `postura_defensiva`, `vigilia_timida`). Debuff é proposta nova, sem implementação de referência.
- Nomes e descrições oficiais vêm de **Wikimon** (que cita Digimon Reference Book/`digimon.net/reference` como fonte primária) — não visitei `digimon.net/reference` diretamente página por página; é a fonte secundária mais citada e consistente disponível, mas não é a primária.
- `area`/`line` como `target.shape` ainda não têm raio/alcance numérico definido na sim (`attackRange()` em `world.ts` só calcula alcance single-target) — fica como trabalho de implementação, não de dados.
