// Progresso offline com teto. Estratégia "amostra + extrapolação":
// 1. limita o tempo ausente ao teto (balance.offline.capHours);
// 2. roda a simulação real numa cópia por no máximo `sampleTicks` (só farm de rotina:
//    sem chefes, decisões ficam para quando o jogador voltar);
// 3. mede XP/bits/abates/vitórias na amostra e escala para o tempo total × eficiência.
// Custo constante (independe de 8h ou 8 dias) e determinístico para o mesmo save + tempo.

import { grantXp, step } from "./game";
import type { ContentBundle, GameEvent, GameState } from "./types";

export interface OfflineReport {
  elapsedMs: number;
  creditedMs: number;
  capped: boolean;
  ticks: number;
  xpPerCreature: number;
  bits: number;
  kills: number;
  wins: number;
  levelUps: { uid: string; from: number; to: number }[];
  events: GameEvent[];
}

export function applyOffline(content: ContentBundle, state: GameState, now: number): OfflineReport | null {
  const off = content.balance.offline;
  const elapsedMs = Math.max(0, now - state.lastSeenAt);
  state.lastSeenAt = now;
  if (elapsedMs < off.minSeconds * 1000) return null;
  // Sem parceiro escolhido ainda não há o que creditar.
  if (state.starterPending) return null;

  const capMs = off.capHours * 3600_000;
  const creditedMs = Math.min(elapsedMs, capMs);
  const ticks = Math.floor(creditedMs / content.balance.tickMs);

  // Chefe/decisão em aberto não continuam offline: volta ao farm sem penalidade.
  if (state.battle?.kind === "boss") {
    state.battle = null;
    state.restTicks = 0;
  }

  const sim: GameState = structuredClone(state);
  const sampleTicks = Math.min(ticks, off.sampleTicks);
  // XP de recompensa por vitória (cada membro recebe o valor cheio).
  let sampleXp = 0;
  for (let i = 0; i < sampleTicks; i++) {
    for (const ev of step(content, sim)) if (ev.t === "reward") sampleXp += ev.xp;
  }
  const scale = sampleTicks > 0 ? (ticks / sampleTicks) * off.efficiency : 0;
  const bits = Math.floor((sim.bits - state.bits) * scale);
  const kills = Math.floor((sim.kills - state.kills) * scale);
  const wins = Math.floor(((sim.winsByArea[state.areaId] ?? 0) - (state.winsByArea[state.areaId] ?? 0)) * scale);
  const xpPerCreature = Math.floor(sampleXp * scale);

  // Aplica no estado real usando as mesmas regras de level-up/evolução do jogo online.
  const events: GameEvent[] = [];
  const levelUps: OfflineReport["levelUps"] = [];
  for (const c of state.party) {
    const from = c.level;
    events.push(...grantXp(content, state, c, xpPerCreature));
    if (c.level !== from) levelUps.push({ uid: c.uid, from, to: c.level });
  }
  state.bits += bits;
  state.kills += kills;
  state.winsByArea[state.areaId] = (state.winsByArea[state.areaId] ?? 0) + wins;
  state.rngState = sim.rngState;
  state.tick += ticks;
  state.battle = null;
  state.restTicks = 0;
  for (const c of state.party) delete state.partyHp[c.uid]; // volta descansado (HP cheio)

  return { elapsedMs, creditedMs, capped: elapsedMs > capMs, ticks, xpPerCreature, bits, kills, wins, levelUps, events };
}
