// Tipos de conteúdo (JSON) e de estado da simulação.
// Regra: nada aqui depende de DOM, canvas ou relógio de parede.

// ---------- Conteúdo (data-driven, carregado de packs/<pack>/*.json) ----------
// O motor não contém nomes, textos nem arte: tudo vem de um content pack trocável.

/** Manifesto do pacote (pack.json). */
export interface PackManifest {
  id: string;
  /** Nome exibido no seletor de pacotes. */
  name: string;
  version: string;
  /** "fan" = usa IP de terceiros (ADR-007); "original" = monstros próprios do estúdio. */
  kind: "fan" | "original";
  /** Linha de produto à qual o pacote pertence (A = coleção, B = monstros digitais). */
  line?: "A" | "B";
  /** Pacote escolhido quando a URL não indica outro. No máximo um pacote com true. */
  default?: boolean;
  /** Obrigatório true quando kind = "fan". */
  nonCommercial: boolean;
  /** Aviso exibido o tempo todo no jogo. Obrigatório quando kind = "fan". */
  disclaimer?: string;
  /** Fontes do conteúdo (para fan packs: de onde vêm nomes/atributos). */
  sources?: string[];
  credits?: string[];
}

/** Textos de interface do pacote (strings.json). Placeholders: {nome}. */
export type Strings = Record<string, string>;

export interface StatBlock {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export type SkillKind = "damage" | "heal" | "guard";
export type SkillTarget = "enemy" | "all_enemies" | "ally_lowest" | "all_allies";

export interface SkillDef {
  id: string;
  name: string;
  kind: SkillKind;
  target: SkillTarget;
  /** Potência em % do ATK do usuário (100 = 1x). */
  power: number;
  /** Ticks de recarga após o uso. 0 = sempre disponível. */
  cooldownTicks: number;
  /** Afinidade da habilidade; se ausente usa a do usuário. */
  affinity?: string;
  /** Duração em ticks para kind=guard. */
  durationTicks?: number;
  description?: string;
}

export interface EvolutionOption {
  to: string;
  level: number;
  /** Rótulo curto da escolha (ex.: "priorizar ATK"). */
  label?: string;
}

/** Um PNG estático ou a lista de frames de uma animação idle em loop. */
export type SpriteRef = string | string[];

export interface CreatureDef {
  id: string;
  name: string;
  affinity: string;
  stage: number;
  /** Cor do placeholder (#rrggbb) até existir sprite. */
  color: string;
  /** Sprite PNG relativo à pasta do pacote (ex.: "sprites/especie.png"), ou lista de frames da animação idle. Sem sprite = placeholder. */
  sprite?: SpriteRef;
  /** Duração de cada frame idle em ms (só com 2+ frames). Padrão no renderer. */
  spriteFrameMs?: number;
  /** Nível em que `base` vale (stats = base + growth × (nível − baseLevel)). Padrão 1. */
  baseLevel?: number;
  base: StatBlock;
  growth: StatBlock;
  skills: string[];
  evolutions?: EvolutionOption[];
  placeholder?: boolean;
  flavor?: string;
}

export interface EnemyDef {
  id: string;
  name: string;
  affinity: string;
  color: string;
  sprite?: SpriteRef;
  spriteFrameMs?: number;
  size?: "normal" | "boss";
  baseLevel?: number;
  base: StatBlock;
  growth: StatBlock;
  skills: string[];
  /** XP concedido por abate (escala com nível no cálculo). */
  xp: number;
  bits: number;
  /** Espécie (id de criatura) recrutada quando a Varredura desta espécie chega a 100%. Ausente = não recrutável. */
  recruitAs?: string;
  placeholder?: boolean;
}

export interface WaveDef {
  enemies: string[];
  weight: number;
}

export interface BossUnit {
  enemyId: string;
  level: number;
}

export interface BossDef {
  enemyId: string;
  level: number;
  escorts?: BossUnit[];
  /** Vitórias de rotina na área para liberar o chefe. */
  unlockAfterWins: number;
  /** false = aliados nunca caem abaixo de 1 HP (chefe tutorial, "dano travado"). */
  lethal: boolean;
  /** Pausas de decisão quando o HP% do chefe cruza esses limiares (100 = início). */
  decisionAtHpPct: number[];
  /** Habilidades de sincronização oferecidas ao jogador em cada pausa. */
  syncOptions: string[];
  reward: { xp: number; bits: number };
}

/** Escolha de encontro (Varredura guiada): a cada N vitórias o jogador escolhe qual de 2 ondas enfrentar. */
export interface EncounterChoiceDef {
  /** Vitórias de rotina na área até a 1ª escolha. */
  firstAfterWins: number;
  /** Vitórias de rotina entre escolhas seguintes. */
  everyWins: number;
  /** Sem resposta do jogador, a opção 0 é escolhida após estes ticks (o idle nunca trava). */
  autoPickAfterTicks: number;
}

export interface AreaDef {
  id: string;
  name: string;
  /** Condição para viajar até a área. Ausente = aberta. */
  unlock?: { minPartyLevel?: number; bossDefeatedIn?: string };
  levelRange: [number, number];
  /** Fração do HP máximo recuperada entre combates de rotina (1 = cura total). */
  restHealPct: number;
  waves: WaveDef[];
  boss?: BossDef;
  encounterChoice?: EncounterChoiceDef;
  /** true = cada onda traz no máximo tantos inimigos quanto criaturas no time (início com 1 parceiro). */
  enemiesMaxParty?: boolean;
  /** Teto do nível inimigo = maior nível do time + este valor (dentro de levelRange). Ausente = só levelRange. */
  enemyLevelMaxAboveParty?: number;
  background?: string;
}

export interface DungeonFloorDef {
  id: string;
  name: string;
  levelBonus: number;
  waves: WaveDef[];
  /** Quantas ondas vencer para concluir o andar. */
  wavesToClear: number;
  /** Rotas oferecidas ao fim do andar (decisão do jogador). */
  routes?: { id: string; label: string; healPct: number; rewardMult: number; corruption: number }[];
}

export interface DungeonDef {
  id: string;
  name: string;
  unlockAreaId: string;
  baseLevel: number;
  /** HP persiste entre andares (núcleo roguelite). */
  hpPersists: boolean;
  floors: DungeonFloorDef[];
  boss: BossDef;
  /** Multiplicador de ATK inimigo por ponto de corrupção acumulado. */
  corruptionAtkPerPoint: number;
}

export interface AffinityDef {
  id: string;
  name: string;
  color: string;
}

export interface ThemeDef {
  affinities: AffinityDef[];
  /** affinityChart[atacante][defensor] = multiplicador. Ausente = 1. */
  affinityChart: Record<string, Record<string, number>>;
  palette: { bg: string; grid: string; ground: string; ui: string; accent: string; text: string };
  startingParty: string[];
  startingLevel: number;
  startingAreaId: string;
  /** Se presente, o jogo começa sem time e o jogador escolhe 1 destas criaturas (ignora startingParty). */
  starterOptions?: string[];
}

export type TrainStat = "atk" | "def" | "spd";

export interface BalanceDef {
  tickMs: number;
  gaugeMax: number;
  basicSkillId: string;
  /** "ratio": ATK × K/(K+DEF). "subtractive": ATK×pot − DEF×defenseMult. Padrão "ratio". */
  damageModel?: "ratio" | "subtractive";
  defenseK: number;
  defenseMult?: number;
  damageVariance: number;
  critChance?: number;
  critMult?: number;
  xpCurve: { base: number; exponent: number };
  maxLevel: number;
  ticksBetweenBattles: number;
  offline: {
    capHours: number;
    minSeconds: number;
    efficiency: number;
    sampleTicks: number;
  };
  /** Varredura: % por encontro resolvido; a próxima vitória após 100% recruta a espécie. */
  scan?: { pctPerEncounter: number; partyMax: number };
  /** Pontos de Treino: ganhos por level-up; cada ponto = +pctPerPoint% no stat escolhido. */
  training?: { pointsPerLevel: number; pctPerPoint: number; capPerCreature: number };
}

export interface ContentBundle {
  pack: PackManifest;
  strings: Strings;
  /** Sprites do pacote: caminho relativo -> URL servível. */
  assets: Record<string, string>;
  theme: ThemeDef;
  balance: BalanceDef;
  creatures: Record<string, CreatureDef>;
  skills: Record<string, SkillDef>;
  enemies: Record<string, EnemyDef>;
  areas: Record<string, AreaDef>;
  dungeons: Record<string, DungeonDef>;
}

// ---------- Estado (serializável em JSON; vai para o save) ----------

export type Side = "ally" | "enemy";

export interface Combatant {
  uid: string;
  defId: string;
  side: Side;
  name: string;
  affinity: string;
  color: string;
  /** Caminho(s) de sprite relativo(s) ao pacote (resolvido pelo renderer); lista = frames idle. */
  sprite?: SpriteRef;
  spriteFrameMs?: number;
  level: number;
  isBoss: boolean;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  gauge: number;
  skills: string[];
  cooldowns: Record<string, number>;
  guardTicks: number;
}

export interface PendingDecision {
  kind: "boss_sync";
  thresholdPct: number;
  options: string[];
}

export interface EncounterChoice {
  /** Índices em area.waves oferecidos ao jogador. */
  options: number[];
  /** Tick em que a opção 0 é escolhida automaticamente. */
  autoAtTick: number;
}

export interface BattleState {
  kind: "wave" | "boss";
  areaId: string;
  allies: Combatant[];
  enemies: Combatant[];
  tick: number;
  lethal: boolean;
  outcome: "win" | "lose" | null;
  decision: PendingDecision | null;
  thresholdsTaken: number[];
  boss?: BossDef;
}

export interface CreatureInstance {
  uid: string;
  speciesId: string;
  level: number;
  xp: number;
  /** Pontos de Treino ainda não alocados. */
  trainPoints?: number;
  /** Pontos de Treino alocados por stat. */
  train?: Partial<Record<TrainStat, number>>;
}

export interface GameState {
  /** Id do content pack ao qual este estado pertence. */
  pack: string;
  rngState: number;
  tick: number;
  nextUid: number;
  party: CreatureInstance[];
  /** HP atual por uid entre combates. */
  partyHp: Record<string, number>;
  areaId: string;
  battle: BattleState | null;
  restTicks: number;
  bits: number;
  kills: number;
  winsByArea: Record<string, number>;
  bossesDefeated: Record<string, boolean>;
  battlesLost: number;
  /** uids com evolução disponível aguardando escolha. */
  pendingEvolutions: string[];
  /** Aguardando a escolha do parceiro inicial (theme.starterOptions). O mundo não avança. */
  starterPending: boolean;
  /** Varredura: % por espécie (id de criatura) ainda não recrutada. */
  scan: Record<string, number>;
  /** Espécies já recrutadas (inclui o time inicial). */
  recruited: string[];
  /** Escolha de encontro pendente (antes da próxima onda). */
  encounter: EncounterChoice | null;
  /** Vitórias de rotina desde a última escolha de encontro. */
  winsSinceEncounter: number;
  /** Escolhas de encontro já resolvidas (a 1ª usa firstAfterWins). */
  encountersChosen: number;
  /** Relógio de parede (ms) da última vez que o jogo estava ativo. Só o shell escreve. */
  lastSeenAt: number;
}

// ---------- Eventos (sim -> render/UI; não são salvos) ----------

export type GameEvent =
  | { t: "battle_start"; kind: "wave" | "boss" }
  | { t: "travel"; areaId: string }
  | { t: "act"; actor: string; skillId: string; hits: { uid: string; amount: number; kind: SkillKind }[] }
  | { t: "ko"; uid: string }
  | { t: "decision"; decision: PendingDecision }
  | { t: "sync"; skillId: string; hits: { uid: string; amount: number; kind: SkillKind }[] }
  | { t: "battle_end"; kind: "wave" | "boss"; outcome: "win" | "lose" }
  | { t: "reward"; xp: number; bits: number }
  | { t: "level_up"; uid: string; level: number }
  | { t: "evolution_ready"; uid: string }
  | { t: "evolved"; uid: string; to: string }
  | { t: "starter_chosen"; uid: string; speciesId: string }
  | { t: "encounter_choice"; options: number[] }
  | { t: "scan"; speciesId: string; pct: number }
  | { t: "recruited"; uid: string; speciesId: string }
  | { t: "training_ready"; uid: string; points: number }
  | { t: "trained"; uid: string; stat: TrainStat };
