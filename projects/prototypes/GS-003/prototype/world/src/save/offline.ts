// Progresso offline com teto, no padrão do prototype/game (src/sim/offline.ts): "amostra + extrapolação".
// 1. limita o tempo ausente ao teto (balance.offline.capHours do pacote digimon-fan);
// 2. roda a sim determinística REAL numa cópia do mundo por no máximo `sampleTicks`, com o AUTO ligado
//    (farm de rotina: a parceira caça sozinha; os bots e os respawns seguem as mesmas regras);
// 3. mede XP, bits e vitórias da parceira local na amostra e escala para o tempo creditado × eficiência;
// 4. aplica no estado real pelas regras do jogo online (grantXp: níveis, learnset e, com Auto-evoluir, evolução
//    com herança de golpes). Custo constante e determinístico para o mesmo estado + tempo + semente.

import { TICK_MS } from "../sim/params";
import type { WorldEvent } from "../sim/types";
import { getEntity, getPlayer, grantXp, partnerSaveOf, restorePartner, stepWorld, type WorldSim } from "../sim/world";
import type { SaveData } from "./save";
import { emptyArena } from "./arena-league";

export interface OfflineReport {
  elapsedMs: number;
  creditedMs: number;
  capped: boolean;
  capHours: number;
  efficiency: number;
  ticks: number;
  sampleTicks: number;
  xp: number;
  bits: number;
  wins: number;
  level: { from: number; to: number };
  /** Golpes liberados no período (ids, na ordem). */
  learned: string[];
  evolutions: { from: string; to: string; kept: string[] }[];
  events: WorldEvent[];
}

export interface OfflineBalance {
  capHours: number;
  minSeconds: number;
  efficiency: number;
  sampleTicks: number;
}

export function offlineBalance(sim: WorldSim): OfflineBalance {
  const o = (sim.content.balance as unknown as { offline?: Partial<OfflineBalance> }).offline ?? {};
  return { capHours: o.capHours ?? 4, minSeconds: o.minSeconds ?? 60, efficiency: o.efficiency ?? 0.5, sampleTicks: o.sampleTicks ?? 6000 };
}

/**
 * Credita `elapsedMs` de ausência ao jogador `playerId` em `sim` (in place). `seed` reprograma o RNG da cópia da
 * amostra (ex.: derivado do horário do save), para o resultado não depender da semente visual da sessão.
 * Devolve null se a ausência for menor que `minSeconds`.
 */
export function applyOffline(sim: WorldSim, playerId: string, elapsedMs: number, seed: number, bal: OfflineBalance = offlineBalance(sim)): OfflineReport | null {
  if (elapsedMs < bal.minSeconds * 1000) return null;
  const p = getPlayer(sim.state, playerId);
  const partner = p && getEntity(sim.state, p.partnerId);
  if (!p || !partner) return null;
  const capMs = bal.capHours * 3600_000;
  const creditedMs = Math.min(elapsedMs, capMs);
  const ticks = Math.floor(creditedMs / TICK_MS);

  // Amostra: cópia do mundo com a parceira descansada, AUTO ligado e RNG próprio.
  const sample: WorldSim = { state: structuredClone(sim.state), map: sim.map, content: sim.content };
  sample.state.rng.rngState = seed >>> 0;
  const sp = getPlayer(sample.state, playerId)!;
  sp.auto = true;
  sp.autoEvolve = false; // a forma não muda na amostra: a evolução é aplicada no fim, pela XP extrapolada
  restorePartner(sample, playerId, partnerSaveOf(getEntity(sample.state, sp.partnerId)!));
  const sampleTicks = Math.min(ticks, bal.sampleTicks);
  let xp = 0;
  let bits = 0;
  let wins = 0;
  for (let i = 0; i < sampleTicks; i++)
    for (const ev of stepWorld(sample, []))
      if (ev.t === "reward" && ev.ownerId === playerId) {
        xp += ev.xp;
        bits += ev.bits;
        wins++;
      }
  const scale = sampleTicks > 0 ? (ticks / sampleTicks) * bal.efficiency : 0;
  const report: OfflineReport = {
    elapsedMs,
    creditedMs,
    capped: elapsedMs > capMs,
    capHours: bal.capHours,
    efficiency: bal.efficiency,
    ticks,
    sampleTicks,
    xp: Math.floor(xp * scale),
    bits: Math.floor(bits * scale),
    wins: Math.floor(wins * scale),
    level: { from: partner.level, to: partner.level },
    learned: [],
    evolutions: [],
    events: [],
  };

  // Aplica no estado real. Se a parceira estava em combate (aba que volta), foge e termina o golpe em curso pela
  // própria sim (no máximo 3 s), para a evolução automática valer fora de combate como no jogo online.
  const pre: WorldEvent[] = [];
  const busy = () => {
    const e = getEntity(sim.state, p.partnerId);
    return !!e && (!!e.encounterId || !!e.targetId || e.state === "ATTACK" || e.state === "HURT" || e.state === "ENGAGE");
  };
  if (busy()) {
    const auto = p.auto;
    p.auto = false;
    pre.push(...stepWorld(sim, [{ t: "flee", playerId }]));
    for (let i = 0; i < 30 && busy(); i++) pre.push(...stepWorld(sim, []));
    p.auto = auto;
  }
  const events = [...pre, ...grantXp(sim, p.partnerId, report.xp, !!p.autoEvolve)];
  const after = getEntity(sim.state, p.partnerId)!;
  after.hp = after.maxHp;
  after.mp = after.maxMp;
  p.bits += report.bits;
  report.level.to = after.level;
  report.events = events;
  for (const ev of events) {
    if (ev.t === "move_learned") report.learned.push(ev.moveId);
    if (ev.t === "evolve") report.evolutions.push({ from: ev.from, to: ev.to, kept: ev.kept });
  }
  return report;
}

// ---------- save ↔ sim ----------

/** Copia o progresso do jogador local da sim (+ dados de apresentação) para o formato do save. */
export function captureSave(sim: WorldSim, playerId: string, extra: Pick<SaveData, "tamer" | "tamerLevel" | "tamerXp" | "team" | "starter" | "map" | "seen" | "inventory" | "quests" | "settings"> & Partial<Pick<SaveData, "box" | "arena">>): SaveData {
  const p = getPlayer(sim.state, playerId)!;
  const partner = getEntity(sim.state, p.partnerId)!;
  return {
    ...extra,
    box: extra.box ?? [],
    arena: extra.arena ?? emptyArena(),
    bits: p.bits,
    auto: p.auto,
    autoEvolve: !!p.autoEvolve,
    evoPrefs: { ...(p.evoPrefs ?? {}) },
    partner: partnerSaveOf(partner),
    scans: { ...p.scans },
    captured: [...p.captured],
  };
}

/** Restaura o save no jogador local de um mundo recém-criado. */
export function applySave(sim: WorldSim, playerId: string, d: SaveData): void {
  const p = getPlayer(sim.state, playerId);
  if (!p) return;
  restorePartner(sim, playerId, d.partner);
  p.bits = d.bits;
  p.auto = d.auto;
  p.autoEvolve = d.autoEvolve;
  p.evoPrefs = { ...d.evoPrefs };
  p.scans = { ...d.scans };
  p.captured = [...d.captured];
}

/** Semente da amostra offline a partir do horário do save (mesmo save → mesmo relatório). */
export function offlineSeed(savedAt: number): number {
  let h = 2166136261;
  for (const c of String(savedAt)) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/** "3 h 12 min", "45 min", "2 min". */
export function formatDuration(ms: number): string {
  const min = Math.floor(ms / 60_000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${Math.max(1, m)} min`;
}
