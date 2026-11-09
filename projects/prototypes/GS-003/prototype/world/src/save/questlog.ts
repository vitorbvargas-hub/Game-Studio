// Progresso das missões (src/data/content/quests.json) com contagem real a partir dos eventos confirmados da sim:
// "Derrote N selvagens em <região>" (recompensas do Tamer local por região, no dia) e "Capture/escaneie N"
// (varredura que chega a 100%), mais os marcos de coleção e o capítulo 0 da história. Puro: sem DOM.
// O dia vira à meia-noite local (dailyQuestRules.resetHour 00:00). As diárias do dia saem do pool por ordem fixa.

import questsJson from "../data/content/quests.json";
import type { WorldEvent } from "../sim/types";

export interface QuestLogData {
  /** Dia (AAAA-MM-DD, horário local) a que as contagens diárias se referem. */
  day: string;
  /** Selvagens derrotados hoje, por região. */
  kills: Record<string, number>;
  /** Espécies escaneadas até 100% hoje. */
  captures: number;
  /** Missões cuja recompensa já foi coletada (as diárias com o sufixo @dia). */
  claimed: string[];
}

export interface QuestView {
  id: string;
  kind: "main" | "daily" | "milestone";
  title: string;
  progress: number;
  goal: number;
  /** false = depende de sistema que esta prova ainda não tem (arena, dungeon, chefe). */
  trackable: boolean;
  rewardBits: number;
  rewardText: string;
  claimed: boolean;
  /** Chave de coleta (as diárias valem por dia). */
  claimKey: string;
}

export interface QuestContext {
  regionId: string;
  regionName: string;
  /** Escaneamento por espécie (0–100) e espécies com 100%. */
  scans: Record<string, number>;
  captured: string[];
  /** Já escolheu/tem parceiro (capítulo 0). */
  hasPartner: boolean;
}

export const QUESTS = questsJson;

/** Nomes em pt-BR dos ids de item (economy.json e recompensas de quests.json) [H]. */
export const ITEM_PT: Record<string, string> = {
  potinho_de_energia: "Potinho de Energia",
  digivice_padrao: "Digivice Padrão",
  digivice_avancado: "Digivice Avançado",
  nucleo_estavel: "Núcleo Estável",
  nucleo_instavel: "Núcleo Instável",
  skin_tamer: "Visual de Tamer",
  moldura_retrato: "Moldura de Retrato",
  title_guardiao_do_pulso: "Título: Guardião do Pulso",
  digivice_dourado: "Digivice Dourado",
  starter_partner: "Parceiro inicial",
  item_evolucao_comum: "Item de evolução comum",
  item_evolucao_raro: "Item de evolução raro",
  item_comum: "Item comum",
  team_slot_extra: "Vaga extra na equipe",
};

/** "potinho_de_energia" → "Potinho de Energia" (ou o id legível, se não estiver na tabela). */
export const itemName = (id: string): string => ITEM_PT[id] ?? id.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function emptyQuestLog(day: string): QuestLogData {
  return { day, kills: {}, captures: 0, claimed: [] };
}

/** Vira o dia: zera as contagens diárias (os marcos e a história continuam coletados). */
export function rollDay(q: QuestLogData, day: string): QuestLogData {
  if (q.day === day) return q;
  return { day, kills: {}, captures: 0, claimed: q.claimed.filter((k) => !k.includes("@")) };
}

/** Conta os eventos do Tamer local: vitórias por região e varreduras completas. */
export function trackEvents(q: QuestLogData, events: WorldEvent[], playerId: string, regionId: string): void {
  for (const ev of events) {
    if (ev.t === "reward" && ev.ownerId === playerId) q.kills[regionId] = (q.kills[regionId] ?? 0) + 1;
    else if (ev.t === "capture" && ev.ownerId === playerId && ev.done) q.captures++;
  }
}

/** N da diária no dia (determinístico por dia + missão, dentro de nRange). */
export function dailyN(day: string, id: string, range: number[]): number {
  let h = 2166136261;
  for (const c of `${day}:${id}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const [lo, hi] = range;
  return lo + (h % (hi - lo + 1));
}

const pick = (r: { bits?: number; items?: string[]; xp?: number; seasonPoints?: number; captureRateBonusPct?: number }) =>
  [r.bits ? `${r.bits} bits` : "", r.xp ? `${r.xp} XP` : "", ...(r.items ?? []).map(itemName), r.seasonPoints ? `${r.seasonPoints} pts de temporada` : "", r.captureRateBonusPct ? `+${r.captureRateBonusPct}% captura` : ""]
    .filter(Boolean)
    .join(" · ");

export function questViews(q: QuestLogData, ctx: QuestContext): QuestView[] {
  const out: QuestView[] = [];
  const done = (k: string) => q.claimed.includes(k);
  // história: capítulo 0 (parceiro) é rastreável; os seguintes dependem de chefes (ainda não existem nesta prova)
  const ch = QUESTS.mainQuestLine.chapters.slice(0, 2);
  ch.forEach((c, i) => {
    const trackable = i === 0;
    out.push({
      id: c.id, kind: "main", title: `${QUESTS.mainQuestLine.title} · ${c.objective}`,
      progress: trackable && ctx.hasPartner ? 1 : 0, goal: 1, trackable,
      rewardBits: c.reward?.bits ?? 0, rewardText: c.reward ? pick(c.reward) : "", claimed: done(c.id), claimKey: c.id,
    });
  });
  // diárias: as N primeiras do pool
  for (const d of QUESTS.dailyQuestPool.slice(0, QUESTS.dailyQuestRules.countPerDay)) {
    const n = dailyN(q.day, d.id, d.nRange);
    const title = d.template.replace("{n}", String(n)).replace("{region}", ctx.regionName);
    const progress = d.id === "daily_kill_wilds" ? q.kills[ctx.regionId] ?? 0 : d.id === "daily_capture" ? q.captures : 0;
    const trackable = d.id === "daily_kill_wilds" || d.id === "daily_capture";
    const key = `${d.id}@${q.day}${d.id === "daily_kill_wilds" ? `:${ctx.regionId}` : ""}`;
    out.push({ id: d.id, kind: "daily", title, progress: Math.min(progress, n), goal: n, trackable, rewardBits: d.reward.bits ?? 0, rewardText: pick(d.reward), claimed: done(key), claimKey: key });
  }
  // marcos de coleção (escanear N espécies)
  const scanned = ctx.captured.length;
  const anyScan = Object.values(ctx.scans).some((v) => v > 0) ? 1 : 0;
  for (const m of QUESTS.collectionMilestones) {
    const goal = m.id === "collect_first_scan" ? 1 : m.id === "collect_5_species" ? 5 : 12;
    const title = m.id === "collect_first_scan" ? "Escaneie qualquer espécie pela primeira vez" : `Escaneie ${goal} espécies (100%)`;
    const progress = m.id === "collect_first_scan" ? anyScan : scanned;
    out.push({ id: m.id, kind: "milestone", title, progress: Math.min(progress, goal), goal, trackable: true, rewardBits: m.reward.bits ?? 0, rewardText: pick(m.reward), claimed: done(m.id), claimKey: m.id });
  }
  return out;
}
