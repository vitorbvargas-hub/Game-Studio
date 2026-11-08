// Núcleo da simulação: estado do jogo, tick fixo e comandos do jogador.
// Funções puras sobre (state, content). Sem DOM, sem Date.now(), sem Math.random().

import { createBattle, makeCombatant, resolveBossDecision, stepBattle } from "./battle";
import { enemyXp, statsAtLevel, xpToNext } from "./formulas";
import { nextInt, pickWeighted } from "./rng";
import type { BattleState, Combatant, ContentBundle, CreatureInstance, GameEvent, GameState, TrainStat, WaveDef } from "./types";

export const TRAIN_STATS: TrainStat[] = ["atk", "def", "spd"];

/** Eventos que abrem uma decisão nova para o jogador (além da escolha de parceiro inicial, que é estado). */
export const DECISION_EVENTS = ["encounter_choice", "training_ready", "evolution_ready", "decision"] as const;

export function newGame(content: ContentBundle, seed: number, now = 0): GameState {
  const state: GameState = {
    pack: content.pack.id,
    rngState: seed >>> 0,
    tick: 0,
    nextUid: 1,
    party: [],
    partyHp: {},
    areaId: content.theme.startingAreaId,
    battle: null,
    restTicks: 0,
    bits: 0,
    kills: 0,
    winsByArea: {},
    bossesDefeated: {},
    battlesLost: 0,
    pendingEvolutions: [],
    starterPending: !!content.theme.starterOptions?.length,
    scan: {},
    recruited: [],
    encounter: null,
    winsSinceEncounter: 0,
    encountersChosen: 0,
    lastSeenAt: now,
  };
  if (!state.starterPending) for (const speciesId of content.theme.startingParty) addCreature(state, speciesId, content.theme.startingLevel);
  return state;
}

function addCreature(state: GameState, speciesId: string, level: number): CreatureInstance {
  const c: CreatureInstance = { uid: `c${state.nextUid++}`, speciesId, level, xp: 0 };
  state.party.push(c);
  if (!state.recruited.includes(speciesId)) state.recruited.push(speciesId);
  delete state.scan[speciesId];
  return c;
}

/** Comando: escolher o parceiro inicial (Decisão #1 do onboarding). */
export function chooseStarter(content: ContentBundle, state: GameState, speciesId: string): GameEvent[] {
  if (!state.starterPending) throw new Error("Parceiro inicial já escolhido");
  if (!content.theme.starterOptions?.includes(speciesId)) throw new Error(`Parceiro inicial inválido: ${speciesId}`);
  const c = addCreature(state, speciesId, content.theme.startingLevel);
  state.starterPending = false;
  return [{ t: "starter_chosen", uid: c.uid, speciesId }];
}

/** Comando: escolher qual onda enfrentar numa escolha de encontro (Varredura guiada). */
export function chooseEncounter(content: ContentBundle, state: GameState, optionIndex: number): GameEvent[] {
  const ch = state.encounter;
  if (!ch) throw new Error("Sem escolha de encontro pendente");
  const wave = ch.options[optionIndex];
  if (wave === undefined) throw new Error(`Opção inválida: ${optionIndex}`);
  state.encounter = null;
  state.winsSinceEncounter = 0;
  state.encountersChosen++;
  return startWave(content, state, wave);
}

/** Comando: alocar 1 Ponto de Treino de uma criatura num stat. */
export function allocateTraining(content: ContentBundle, state: GameState, uid: string, stat: TrainStat): GameEvent[] {
  const c = state.party.find((p) => p.uid === uid);
  if (!c) throw new Error(`Criatura inexistente: ${uid}`);
  if (!content.balance.training || !(c.trainPoints! > 0)) throw new Error("Sem Ponto de Treino");
  if (!TRAIN_STATS.includes(stat)) throw new Error(`Stat inválido: ${stat}`);
  c.trainPoints!--;
  c.train = { ...c.train, [stat]: (c.train?.[stat] ?? 0) + 1 };
  return [{ t: "trained", uid, stat }];
}

/** Bônus percentual de treino por stat. */
export function trainingBonus(content: ContentBundle, c: CreatureInstance): Partial<Record<TrainStat, number>> {
  const pct = content.balance.training?.pctPerPoint ?? 0;
  const out: Partial<Record<TrainStat, number>> = {};
  for (const k of TRAIN_STATS) if (c.train?.[k]) out[k] = c.train[k]! * pct;
  return out;
}

/** Decisões abertas agora para o jogador (para HUD e testes de ritmo). */
export function pendingChoices(state: GameState): string[] {
  const out: string[] = [];
  if (state.starterPending) out.push("starter");
  if (state.encounter) out.push("encounter");
  if (state.party.some((p) => (p.trainPoints ?? 0) > 0)) out.push("training");
  if (state.pendingEvolutions.length) out.push("evolution");
  if (state.battle?.decision) out.push("boss_sync");
  return out;
}

/** Inimigos que a onda traz de fato: em áreas com enemiesMaxParty, nunca mais selvagens que criaturas no time. */
export function waveEnemies(content: ContentBundle, state: GameState, wave: WaveDef): string[] {
  const area = content.areas[state.areaId];
  return area.enemiesMaxParty ? wave.enemies.slice(0, Math.max(1, state.party.length)) : wave.enemies;
}

/** Espécies recrutáveis (ainda não recrutadas) presentes numa onda. */
function scannable(content: ContentBundle, state: GameState, wave: WaveDef): string[] {
  const out: string[] = [];
  for (const id of waveEnemies(content, state, wave)) {
    const sp = content.enemies[id].recruitAs;
    if (sp && !state.recruited.includes(sp) && !out.includes(sp)) out.push(sp);
  }
  return out;
}

export function maxHpOf(content: ContentBundle, c: CreatureInstance): number {
  const def = content.creatures[c.speciesId];
  return statsAtLevel(def.base, def.growth, c.level, def.baseLevel).hp;
}

function partyCombatants(content: ContentBundle, state: GameState): Combatant[] {
  return state.party.map((c) =>
    makeCombatant(content.creatures[c.speciesId], c.uid, "ally", c.level, state.partyHp[c.uid], trainingBonus(content, c)),
  );
}

function startWave(content: ContentBundle, state: GameState, waveIndex?: number): GameEvent[] {
  const area = content.areas[state.areaId];
  const wave = waveIndex === undefined ? pickWeighted(state, area.waves) : area.waves[waveIndex];
  // Teto opcional de nível relativo ao time: o início com 1 parceiro não encontra selvagens muito acima dele.
  const cap = area.enemyLevelMaxAboveParty;
  const top = cap === undefined ? area.levelRange[1] : Math.min(area.levelRange[1], Math.max(...state.party.map((p) => p.level)) + cap);
  const enemies = waveEnemies(content, state, wave).map((id, i) =>
    makeCombatant(content.enemies[id], `e${state.tick}_${i}`, "enemy", nextInt(state, area.levelRange[0], Math.max(area.levelRange[0], top))),
  );
  state.battle = createBattle("wave", area.id, partyCombatants(content, state), enemies);
  return [{ t: "battle_start", kind: "wave" }];
}

export function bossUnlocked(content: ContentBundle, state: GameState): boolean {
  const boss = content.areas[state.areaId].boss;
  return !!boss && (state.winsByArea[state.areaId] ?? 0) >= boss.unlockAfterWins;
}

export function areaUnlocked(content: ContentBundle, state: GameState, areaId: string): boolean {
  const u = content.areas[areaId]?.unlock;
  if (!content.areas[areaId]) return false;
  if (!u) return true;
  const maxLevel = Math.max(...state.party.map((p) => p.level));
  if (u.minPartyLevel !== undefined && maxLevel < u.minPartyLevel) return false;
  if (u.bossDefeatedIn !== undefined && !state.bossesDefeated[u.bossDefeatedIn]) return false;
  return true;
}

/** Abre uma escolha entre 2 ondas de composição diferente; a 1ª opção prioriza espécies ainda em Varredura. */
function offerEncounter(content: ContentBundle, state: GameState): GameEvent[] {
  const area = content.areas[state.areaId];
  const key = (w: WaveDef) => [...waveEnemies(content, state, w)].sort().join("|");
  const scanWaves = area.waves.filter((w) => scannable(content, state, w).length);
  const first = pickWeighted(state, scanWaves.length ? scanWaves : area.waves);
  // A 2ª opção evita repetir as espécies em Varredura da 1ª, para a escolha ser real.
  const firstScan = scannable(content, state, first);
  const differs = area.waves.filter((w) => key(w) !== key(first));
  const distinct = differs.filter((w) => !scannable(content, state, w).some((sp) => firstScan.includes(sp)));
  const pool = distinct.length ? distinct : differs;
  const options = [area.waves.indexOf(first)];
  if (pool.length) options.push(area.waves.indexOf(pickWeighted(state, pool)));
  state.encounter = { options, autoAtTick: state.tick + area.encounterChoice!.autoPickAfterTicks };
  return [{ t: "encounter_choice", options }];
}

/** Comando: viajar para outra área (interrompe a luta atual sem penalidade). */
export function travelTo(content: ContentBundle, state: GameState, areaId: string): GameEvent[] {
  if (!areaUnlocked(content, state, areaId)) throw new Error(`Área bloqueada: ${areaId}`);
  if (state.areaId === areaId) return [];
  state.areaId = areaId;
  state.battle = null;
  state.encounter = null;
  state.winsSinceEncounter = 0;
  state.restTicks = content.balance.ticksBetweenBattles;
  for (const c of state.party) state.partyHp[c.uid] = maxHpOf(content, c);
  return [{ t: "travel", areaId }];
}

/** Comando: desafiar o chefe da área (interrompe a onda atual, sem penalidade). */
export function challengeBoss(content: ContentBundle, state: GameState): GameEvent[] {
  const area = content.areas[state.areaId];
  if (!area.boss) throw new Error("Área sem chefe");
  if (!bossUnlocked(content, state)) throw new Error("Chefe ainda bloqueado");
  if (state.battle?.kind === "boss") return [];
  const b = area.boss;
  const units = [{ enemyId: b.enemyId, level: b.level }, ...(b.escorts ?? [])];
  const enemies = units.map((u, i) => makeCombatant(content.enemies[u.enemyId], `boss${state.tick}_${i}`, "enemy", u.level));
  // Chefe começa com o time curado: desafio é estratégia, não atrito.
  for (const c of state.party) state.partyHp[c.uid] = maxHpOf(content, c);
  state.battle = createBattle("boss", area.id, partyCombatants(content, state), enemies, b);
  state.restTicks = 0;
  state.encounter = null;
  return [{ t: "battle_start", kind: "boss" }];
}

/** Comando: escolher a habilidade de sincronização numa pausa de chefe. */
export function chooseDecision(content: ContentBundle, state: GameState, optionIndex: number): GameEvent[] {
  if (!state.battle?.decision) throw new Error("Sem decisão pendente");
  const events = resolveBossDecision(content, state.battle, state, optionIndex);
  if (state.battle.outcome) events.push(...finishBattle(content, state, state.battle));
  return events;
}

/** Comando: escolher um ramo de evolução para uma criatura elegível. */
export function chooseEvolution(content: ContentBundle, state: GameState, uid: string, toSpeciesId: string): GameEvent[] {
  const c = state.party.find((p) => p.uid === uid);
  if (!c) throw new Error(`Criatura inexistente: ${uid}`);
  const opt = evolutionOptions(content, c).find((o) => o.to === toSpeciesId);
  if (!opt) throw new Error(`Evolução indisponível: ${c.speciesId} -> ${toSpeciesId}`);
  const ratio = (state.partyHp[uid] ?? maxHpOf(content, c)) / maxHpOf(content, c);
  c.speciesId = toSpeciesId;
  state.partyHp[uid] = Math.round(maxHpOf(content, c) * ratio);
  state.pendingEvolutions = state.pendingEvolutions.filter((u) => u !== uid);
  return [{ t: "evolved", uid, to: toSpeciesId }];
}

export function evolutionOptions(content: ContentBundle, c: CreatureInstance) {
  return (content.creatures[c.speciesId].evolutions ?? []).filter((e) => c.level >= e.level);
}

export function grantXp(content: ContentBundle, state: GameState, c: CreatureInstance, amount: number): GameEvent[] {
  const events: GameEvent[] = [];
  const max = content.balance.maxLevel;
  const tr = content.balance.training;
  c.xp += amount;
  let gained = 0;
  while (c.level < max && c.xp >= xpToNext(content.balance, c.level)) {
    c.xp -= xpToNext(content.balance, c.level);
    c.level++;
    events.push({ t: "level_up", uid: c.uid, level: c.level });
    if (tr) {
      const spent = Object.values(c.train ?? {}).reduce((a, b) => a + (b ?? 0), 0);
      const room = Math.max(0, tr.capPerCreature - spent - (c.trainPoints ?? 0));
      const add = Math.min(room, tr.pointsPerLevel);
      c.trainPoints = (c.trainPoints ?? 0) + add;
      gained += add;
    }
  }
  if (gained) events.push({ t: "training_ready", uid: c.uid, points: c.trainPoints! });
  if (c.level >= max) c.xp = 0;
  if (evolutionOptions(content, c).length && !state.pendingEvolutions.includes(c.uid)) {
    state.pendingEvolutions.push(c.uid);
    events.push({ t: "evolution_ready", uid: c.uid });
  }
  return events;
}

function finishBattle(content: ContentBundle, state: GameState, b: BattleState): GameEvent[] {
  const events: GameEvent[] = [];
  const area = content.areas[b.areaId];
  if (b.outcome === "win") {
    let xp = 0;
    let bits = 0;
    if (b.kind === "boss" && b.boss) {
      xp = b.boss.reward.xp;
      bits = b.boss.reward.bits;
      state.bossesDefeated[b.areaId] = true;
    } else {
      for (const e of b.enemies) {
        const def = content.enemies[e.defId];
        xp += enemyXp(def.xp, e.level);
        bits += def.bits;
      }
      state.winsByArea[b.areaId] = (state.winsByArea[b.areaId] ?? 0) + 1;
      if (area.encounterChoice) state.winsSinceEncounter++;
    }
    state.kills += b.enemies.length;
    state.bits += bits;
    events.push({ t: "reward", xp, bits });
    // Cada membro vivo ganha o XP cheio (sem divisão), padrão do gênero idle.
    for (const c of state.party) {
      const combatant = b.allies.find((a) => a.uid === c.uid)!;
      if (combatant.hp > 0) events.push(...grantXp(content, state, c, xp));
    }
    for (const c of state.party) {
      const combatant = b.allies.find((a) => a.uid === c.uid)!;
      const max = maxHpOf(content, c);
      const hp = Math.max(combatant.hp, 0) + Math.round(max * area.restHealPct);
      state.partyHp[c.uid] = Math.max(1, Math.min(max, hp));
    }
  } else {
    // Derrota nunca custa progresso: time recua, cura total e volta a caçar.
    state.battlesLost++;
    for (const c of state.party) state.partyHp[c.uid] = maxHpOf(content, c);
  }
  if (b.kind === "wave") events.push(...resolveScan(content, state, b));
  state.battle = null;
  state.restTicks = content.balance.ticksBetweenBattles;
  return events;
}

/** Varredura: encontro resolvido soma %; vitória com a espécie já em 100% recruta (determinístico, sem RNG). */
function resolveScan(content: ContentBundle, state: GameState, b: BattleState): GameEvent[] {
  const sc = content.balance.scan;
  if (!sc) return [];
  const events: GameEvent[] = [];
  const seen: string[] = [];
  for (const e of b.enemies) {
    const sp = content.enemies[e.defId].recruitAs;
    if (!sp || seen.includes(sp) || state.recruited.includes(sp)) continue;
    seen.push(sp);
    const pct = state.scan[sp] ?? 0;
    if (pct >= 100) {
      if (b.outcome === "win" && state.party.length < sc.partyMax) {
        const c = addCreature(state, sp, Math.max(content.theme.startingLevel, e.level));
        events.push({ t: "recruited", uid: c.uid, speciesId: sp });
      }
      continue;
    }
    state.scan[sp] = Math.min(100, pct + sc.pctPerEncounter);
    events.push({ t: "scan", speciesId: sp, pct: state.scan[sp] });
  }
  return events;
}

/** Avança a simulação exatamente 1 tick (balance.tickMs de tempo de jogo). */
export function step(content: ContentBundle, state: GameState): GameEvent[] {
  if (state.battle?.decision || state.starterPending) return []; // pausa de decisão congela o mundo
  state.tick++;
  if (!state.battle) {
    if (state.restTicks > 0) {
      state.restTicks--;
      return [];
    }
    // Escolha de encontro: espera o jogador, mas nunca trava o idle (auto-escolhe a opção 0).
    if (state.encounter) return state.tick >= state.encounter.autoAtTick ? chooseEncounter(content, state, 0) : [];
    const ec = content.areas[state.areaId].encounterChoice;
    if (ec && state.winsSinceEncounter >= (state.encountersChosen ? ec.everyWins : ec.firstAfterWins)) return offerEncounter(content, state);
    return startWave(content, state);
  }
  const events = stepBattle(content, state.battle, state);
  if (state.battle.outcome) events.push(...finishBattle(content, state, state.battle));
  return events;
}

export function stepN(content: ContentBundle, state: GameState, n: number): GameEvent[] {
  const all: GameEvent[] = [];
  for (let i = 0; i < n; i++) all.push(...step(content, state));
  return all;
}
