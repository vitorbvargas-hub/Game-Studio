// HUD Identity v3 — Alternativa A "Digivice Radial" (quality-overhaul/phase3/design/HUD_IDENTITY_V3.md §2), atrás de
// ?hud=v2, e as abas P0 de PANELS_SPEC.md (§5 Chefe Mundial, §6 Conquistas v1; §7 Configurações é só moldura, CSS).
// Substitui o bloco .hud-tr (clone do IdleDex) por: faixa fina de bits no topo + hub circular com emblema, pips de
// notificação e arco de progresso do Chefe Mundial. Clique no hub (ou H) abre 6 atalhos em arco; cada um abre um Panel.
//
// Regras desta camada (mesmas do HUD): só lê eventos confirmados da sim e emite intents por callback (bits das
// recompensas = o mesmo add_bits das Missões). O estado próprio (contadores das conquistas, janela do chefe, coletas)
// vai para uma chave separada do save (`${SAVE_KEY}.digivice`), para não mexer no formato do save do mundo.
// Sem servidor: o ranking do chefe mistura a sua linha com BOTS LOCAIS rotulados (decisão do fundador); nunca finge
// jogadores reais. Arte: kit art/ui/circuit-kit-v1 (src/ui/circuit-kit.ts + style.css); o aro do hub segue em SVG.

import achievementsJson from "../data/content/achievements.json";
import { SAVE_KEY, type StorageLike } from "../save/save";
import type { WorldEvent } from "../sim/types";
import { REGIONS } from "../world/regions";
import { icon } from "./icons";
import { Panel } from "./panel";
import {
  addGuildXp,
  addMail,
  addPassPoints,
  claimPassLevel,
  emptyPanels,
  ensureSeason,
  ensureWelcome,
  foundGuild,
  guildHtml,
  hasPending,
  joinBotGuild,
  leaveGuild,
  mailHtml,
  mailStaleQuests,
  makeWish,
  PASS_BOSS_BONUS,
  passHtml,
  passLevel,
  passReward,
  readMail,
  rollSeason,
  unreadCount,
  WISH_MAX,
  WISH_SCAN_MULT,
  wishActive,
  wishHtml,
  wishOnPlay,
  wishOnWin,
  type PanelsSave,
  type QuestLike,
} from "./digivice-panels";

export const DIGIVICE_KEY = `${SAVE_KEY}.digivice`;

// ---------------------------------------------------------------- atalhos do hub

export interface HubItem {
  id: string;
  label: string;
  icon: string;
  /** Prioridade na PANELS_SPEC.md §8 (histórico: P0 entrou primeiro; P1/P2 entraram na etapa P2 do Quality Overhaul). */
  tier: "P0" | "P1" | "P2";
  spec: string;
  /** Atalho ainda sem tela (abre o estado "bloqueado" explicado). Nenhum hoje. */
  locked?: boolean;
}

/**
 * Ordem do mockup alt_a_open.svg: do pé do hub (abaixo) até a esquerda. São 6: um 7º atalho apertava o arco (vizinhos
 * a ~38 px com ícones de 36) — a ficha holográfica do parceiro abre pelo retrato do parceiro, não daqui.
 */
export const HUB_ITEMS: HubItem[] = [
  { id: "guild", label: "Guilda", icon: "guild", tier: "P1", spec: "§1" },
  { id: "mail", label: "Correio", icon: "mail", tier: "P1", spec: "§2" },
  { id: "pass", label: "Passe de Temporada", icon: "star", tier: "P2", spec: "§3" },
  { id: "wish", label: "Fonte dos Desejos", icon: "gift", tier: "P1", spec: "§4" },
  { id: "boss", label: "Chefe Mundial", icon: "boss", tier: "P0", spec: "§5" },
  { id: "trophy", label: "Conquistas", icon: "trophy", tier: "P0", spec: "§6" },
];

/** Atalhos da grade inferior que, no v2, levam ao mesmo painel do hub. */
export const SHORTCUT_TO_HUB: Record<string, string> = { guild: "guild", mail: "mail", trophy: "trophy" };

/**
 * Geometria do arco (HUD_IDENTITY_V3 §2.2). Um quarto de círculo de 90° (r 120) lia como diagonal/grade
 * (QA_HUD_FB1_COMPARE §2 P1). Agora: o arco é CENTRADO NO HUB (o hub é o eixo do leque), abre 94°, de 90° (logo
 * abaixo do hub) a 184° (à esquerda, na altura do hub, sem encostar na faixa de bits), r 140 — vizinhos a ~46 px —, e um trilho de circuito (SVG .dg-rail, ARC_RAIL_PAD graus além de cada ponta) liga os 6 ícones na mesma
 * curva, para a leitura de "arco em volta do hub" não depender só da posição de caixas de 36 px.
 */
export const HUB_SIZE = 64;
export const ARC_RADIUS = 140;
export const ARC_FROM = 90; // graus, y para baixo: 90 = logo abaixo do hub
export const ARC_TO = 184; // 180 = à esquerda; 184 = 10 px acima do centro do hub (a faixa de bits fica acima)
export const ARC_CX = 0;
export const ARC_CY = 0;
export const ARC_RAIL_PAD = 6;

/** Trilho do arco (path SVG em coordenadas relativas ao centro do hub): o mesmo círculo dos ícones, um pouco mais longo. */
export function arcRailPath(r = ARC_RADIUS, from = ARC_FROM - ARC_RAIL_PAD, to = ARC_TO + ARC_RAIL_PAD): string {
  const pt = (d: number) => [Math.cos((d * Math.PI) / 180) * r, Math.sin((d * Math.PI) / 180) * r].map((v) => v.toFixed(1)).join(" ");
  return `M${pt(from)}A${r} ${r} 0 0 1 ${pt(to)}`;
}

/** Posições (px, relativas ao centro do hub) de n ícones distribuídos de `from` a `to` graus em volta de (cx, cy). */
export function arcLayout(n: number, r = ARC_RADIUS, from = ARC_FROM, to = ARC_TO, cx = ARC_CX, cy = ARC_CY): { x: number; y: number; deg: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const deg = n === 1 ? from : from + ((to - from) * i) / (n - 1);
    const a = (deg * Math.PI) / 180;
    return { x: Math.round(cx + Math.cos(a) * r), y: Math.round(cy + Math.sin(a) * r), deg };
  });
}

// ---------------------------------------------------------------- estado salvo

export interface BossWindow {
  bossId: string;
  day: string;
  start: number;
  end: number;
  /** Vitórias da sua parceira durante a janela (= o seu dano de contribuição). */
  dmg: number;
}

export interface BossSave {
  /** Dia (dayKey local) do último "Despertar": 1x por dia de jogo (GDD_MMO_V1 §4.2). */
  lastDay?: string;
  active?: BossWindow;
  /** Última janela encerrada (para o ranking e o resultado em cooldown). */
  last?: BossWindow & { defeated: boolean };
  pending?: { bits: number; defeated: boolean; dmg: number; day: string };
}

export type StatId = "wins" | "scans" | "evolves" | "maps" | "tamerLevel" | "bossAwakens" | "bossDefeats" | "guildJoined" | "mailRead";

export interface DigiviceSave extends PanelsSave {
  v: 1;
  wins: number;
  scans: string[];
  evolves: number;
  maps: string[];
  tamerLevel: number;
  bossAwakens: number;
  bossDefeats: number;
  /** Social (eventos de UI dos painéis Guilda/Correio): guildas fundadas/entradas e cartas lidas. */
  guildJoined: number;
  mailRead: number;
  claimed: string[];
  boss: BossSave;
}

export const emptyDigivice = (): DigiviceSave => ({ v: 1, wins: 0, scans: [], evolves: 0, maps: [], tamerLevel: 1, bossAwakens: 0, bossDefeats: 0, guildJoined: 0, mailRead: 0, claimed: [], boss: {}, ...emptyPanels() });

export function loadDigivice(storage: StorageLike | undefined): DigiviceSave {
  try {
    const raw = storage?.getItem(DIGIVICE_KEY);
    if (!raw) return emptyDigivice();
    const d = JSON.parse(raw) as Partial<DigiviceSave>;
    if (d.v !== 1) return emptyDigivice();
    const base = emptyDigivice();
    return { ...base, ...d, boss: { ...(d.boss ?? {}) }, wish: { ...base.wish, ...(d.wish ?? {}) } };
  } catch {
    return emptyDigivice();
  }
}

export function statValue(s: DigiviceSave, stat: StatId): number {
  if (stat === "scans") return s.scans.length;
  if (stat === "maps") return s.maps.length;
  return s[stat];
}

/** Atualiza os contadores a partir dos eventos confirmados (os mesmos que o HUD já recebe). Devolve se mudou. */
export function trackDigivice(s: DigiviceSave, events: WorldEvent[], playerId: string, partnerOf: (id: string) => boolean, now: number): boolean {
  let changed = false;
  for (const ev of events) {
    if (ev.t === "reward" && ev.ownerId === playerId) {
      s.wins++;
      if (s.boss.active && now < s.boss.active.end) s.boss.active.dmg++;
      changed = true;
    } else if (ev.t === "capture" && ev.ownerId === playerId && ev.done && !s.scans.includes(ev.speciesId)) {
      s.scans.push(ev.speciesId);
      changed = true;
    } else if (ev.t === "evolve" && partnerOf(ev.id)) {
      s.evolves++;
      changed = true;
    }
  }
  return changed;
}

export const regionKey = (r: { name: string; route: string }): string => (r.name ? `${r.name} · ${r.route}` : "");

export function noteMap(s: DigiviceSave, key: string): boolean {
  if (!key || s.maps.includes(key)) return false;
  s.maps.push(key);
  return true;
}

export function noteTamerLevel(s: DigiviceSave, level: number): boolean {
  if (level <= s.tamerLevel) return false;
  s.tamerLevel = level;
  return true;
}

// ---------------------------------------------------------------- Chefe Mundial (PANELS_SPEC §5)

/** Janela de combate aberta pelo "Despertar" [H: 10 min de jogo]. */
export const BOSS_WINDOW_MS = 10 * 60_000;
/** PV do chefe em "vitórias" (a sua + as dos bots locais) [H]. */
export const BOSS_HP = 40;
/** Recompensa de participação: cheia, sem fração (GDD_MMO_V1 §4.2) — bits [H]. */
export const BOSS_REWARD_BITS = 200;
export const BOSS_BOTS = ["BOT-Arco", "BOT-Brasa", "BOT-Cobalto", "BOT-Duna"];
const DAY_MS = 24 * 3600_000;

export function dayKeyOf(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function nextMidnight(now: number): number {
  const d = new Date(now);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Contribuição final de cada bot numa janela: determinística pelo dia (reproduzível em QA), 4–10 vitórias. */
export const botTarget = (day: string, name: string): number => 4 + (hash(`${day}|${name}`) % 7);

export function botDamage(w: BossWindow, name: string, now: number): number {
  const frac = Math.max(0, Math.min(1, (Math.min(now, w.end) - w.start) / (w.end - w.start)));
  return Math.floor(botTarget(w.day, name) * frac);
}

export const bossTotal = (w: BossWindow, now: number): number => w.dmg + BOSS_BOTS.reduce((a, b) => a + botDamage(w, b, now), 0);

export type BossPhase = "available" | "active" | "reward" | "cooldown";

/** Fecha a janela quando o tempo acaba ou o chefe cai; com participação (dano ≥ 1) a recompensa fica pendente. */
export function settleBoss(s: DigiviceSave, now: number): boolean {
  const w = s.boss.active;
  if (!w) return false;
  const total = bossTotal(w, now);
  if (now < w.end && total < BOSS_HP) return false;
  const defeated = total >= BOSS_HP;
  s.boss.last = { ...w, defeated };
  s.boss.active = undefined;
  if (w.dmg > 0) {
    s.boss.pending = { bits: BOSS_REWARD_BITS, defeated, dmg: w.dmg, day: w.day };
    if (defeated) s.bossDefeats++;
  }
  return true;
}

export function bossPhase(s: DigiviceSave, now: number): BossPhase {
  if (s.boss.pending) return "reward";
  if (s.boss.active) return "active";
  return s.boss.lastDay === dayKeyOf(now) ? "cooldown" : "available";
}

export function awakenBoss(s: DigiviceSave, now: number, bossId: string): boolean {
  if (bossPhase(s, now) !== "available") return false;
  const day = dayKeyOf(now);
  s.boss.active = { bossId, day, start: now, end: now + BOSS_WINDOW_MS, dmg: 0 };
  s.boss.lastDay = day;
  s.bossAwakens++;
  return true;
}

export function claimBoss(s: DigiviceSave): number {
  const p = s.boss.pending;
  if (!p) return 0;
  s.boss.pending = undefined;
  return p.bits;
}

/**
 * Arco do hub (0..1) e a cor: em cooldown enche conforme a próxima janela se aproxima (fração do dia já passada);
 * disponível ou com recompensa = cheio; em combate = PV que falta ao chefe. `null` = não desenha nada (nunca "—").
 */
export function bossArc(s: DigiviceSave, now: number): { frac: number; tone: "gold" | "red" } | null {
  const ph = bossPhase(s, now);
  if (ph === "active") return { frac: Math.max(0, 1 - bossTotal(s.boss.active!, now) / BOSS_HP), tone: "red" };
  if (ph === "cooldown") return { frac: 1 - (nextMidnight(now) - now) / DAY_MS, tone: "gold" };
  return { frac: 1, tone: "gold" };
}

export interface RankRow {
  name: string;
  dmg: number;
  bot: boolean;
  you: boolean;
}

export function bossRanking(w: BossWindow, now: number, you: string): RankRow[] {
  return [{ name: you, dmg: w.dmg, bot: false, you: true }, ...BOSS_BOTS.map((b) => ({ name: b, dmg: botDamage(w, b, now), bot: true, you: false }))].sort((a, b) => b.dmg - a.dmg || Number(b.you) - Number(a.you));
}

/** Chefão da região atual (regions.json `boss`); sem chefe na região, o da Floresta Densa (PANELS_SPEC §5). */
export function bossFor(regionName: string): { id: string; name: string; level: number; region: string } {
  const r = REGIONS.find((x) => x.name === regionName && x.boss) ?? REGIONS.find((x) => x.boss === "BOSS-KUWAGAMON") ?? REGIONS.find((x) => x.boss)!;
  return { id: r.boss!, name: bossName(r.boss!), level: (r.levelRange[1] ?? 10) + 3, region: r.name };
}

export const bossName = (id: string): string => id.replace(/^BOSS-/, "").toLowerCase().replace(/^./, (c) => c.toUpperCase());

// ---------------------------------------------------------------- Conquistas (PANELS_SPEC §6)

export interface AchievementDef {
  id: string;
  category: string;
  title: string;
  description: string;
  stat: StatId;
  goal: number;
  rewardBits: number;
}

export interface AchievementCategory {
  id: string;
  label: string;
  locked?: string;
}

export const ACHIEVEMENTS = achievementsJson.achievements as AchievementDef[];
export const ACH_CATEGORIES = achievementsJson.categories as AchievementCategory[];

export type AchState = "locked" | "progress" | "complete" | "claimed";

export interface AchView extends AchievementDef {
  progress: number;
  state: AchState;
}

export function achievementViews(s: DigiviceSave, defs: AchievementDef[] = ACHIEVEMENTS): AchView[] {
  return defs.map((d) => {
    const progress = Math.min(d.goal, statValue(s, d.stat));
    const state: AchState = s.claimed.includes(d.id) ? "claimed" : progress >= d.goal ? "complete" : progress > 0 ? "progress" : "locked";
    return { ...d, progress, state };
  });
}

export function claimAchievement(s: DigiviceSave, id: string, defs: AchievementDef[] = ACHIEVEMENTS): number {
  const v = achievementViews(s, defs).find((a) => a.id === id);
  if (!v || v.state !== "complete") return 0;
  s.claimed.push(id);
  return v.rewardBits;
}

/** Pips do aro (HUD_IDENTITY_V3 §2.1): posições fixas, um por sistema com novidade REAL; nada = nenhum pip. */
export function hubPips(s: DigiviceSave, now: number): { trophy: boolean; boss: boolean; mail: boolean; wish: boolean; pass: boolean } {
  const ph = bossPhase(s, now);
  const lv = s.pass ? passLevel(s.pass) : 0;
  return {
    trophy: achievementViews(s).some((a) => a.state === "complete"),
    boss: ph === "available" || ph === "reward",
    mail: unreadCount(s) > 0,
    wish: s.wish.pct >= WISH_MAX && !wishActive(s, now),
    pass: !!s.pass && Array.from({ length: lv }, (_, i) => i + 1).some((n) => !s.pass!.claimed.includes(n) && !passReward(n).cosmetic),
  };
}

// ---------------------------------------------------------------- HTML

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR");

export function clock(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const RING_R = 29;
const RING_C = 2 * Math.PI * RING_R;
const PIP_POS: Record<string, [number, number]> = { trophy: [10, 0], boss: [2, 0], mail: [6, 0], wish: [4, 0], pass: [8, 0] };
const pipXY = (hour: number) => {
  const a = ((hour / 12) * 360 - 90) * (Math.PI / 180);
  return { x: Math.round(32 + Math.cos(a) * RING_R), y: Math.round(32 + Math.sin(a) * RING_R) };
};

/** Hub: aro (trilho + arco do chefe) em SVG e, no centro, o emblema do kit circuit-kit-v1 (digivice_emblem.png, 2×). */
const EMBLEM = `<svg class="dg-emblem" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true" shape-rendering="crispEdges">
  <circle cx="32" cy="32" r="${RING_R}" class="dg-track"/>
  <circle cx="32" cy="32" r="${RING_R}" class="dg-bossarc" data-testid="dg-bossarc" transform="rotate(-90 32 32)" stroke-dasharray="0 ${RING_C.toFixed(2)}"/>
  <circle cx="32" cy="32" r="23" class="dg-face"/>
</svg><i class="dg-emblem-kit" aria-hidden="true"></i>`;

/** Caixa do SVG do trilho: do centro do hub (canto superior direito da caixa) até além do raio. */
const RAIL_BOX = ARC_RADIUS + 24;

/** Bloco do canto superior direito no v2 (substitui o .hud-tr). Mantém data-testid="coins" para o HUD atualizar. */
export function digiviceHudHtml(): string {
  const pos = arcLayout(HUB_ITEMS.length);
  const nodes = HUB_ITEMS.map(
    (it, i) =>
      `<button type="button" class="dg-node tier-${it.tier}" data-dg="${it.id}" role="menuitem" tabindex="-1" aria-label="${esc(it.label)}" title="${esc(it.label)}${it.locked ? " — bloqueado nesta versão" : ""}" style="--x:${pos[i].x}px;--y:${pos[i].y}px;--i:${i}">${icon(it.icon, 18)}${it.locked ? '<i class="dg-lock" aria-hidden="true"></i>' : ""}</button>`,
  ).join("");
  const pips = Object.entries(PIP_POS)
    .map(([id, [h]]) => {
      const p = pipXY(h);
      return `<i class="dg-pip" data-pip="${id}" style="left:${p.x - 3}px;top:${p.y - 3}px" hidden></i>`;
    })
    .join("");
  return `<div class="dg" data-testid="digivice">
    <div class="dg-ribbon" data-testid="dg-ribbon" title="Bits (moeda ganha jogando)">${icon("coin", 10)}<b data-testid="coins">0</b><span>bits</span></div>
    <div class="dg-hubwrap">
      <svg class="dg-rail" viewBox="${-RAIL_BOX} ${-RAIL_BOX} ${2 * RAIL_BOX} ${2 * RAIL_BOX}" width="${2 * RAIL_BOX}" height="${2 * RAIL_BOX}" style="left:${HUB_SIZE / 2 - RAIL_BOX}px;top:${HUB_SIZE / 2 - RAIL_BOX}px" aria-hidden="true"><path d="${arcRailPath()}" class="dg-rail-glow"/><path d="${arcRailPath()}" class="dg-rail-line"/></svg>
      <div class="dg-arc" role="menu" aria-label="Atalhos do Digivice">${nodes}</div>
      <div class="dg-caption" data-testid="dg-caption" aria-hidden="true"></div>
      <button type="button" class="dg-hub" data-act="digivice" aria-expanded="false" aria-haspopup="menu" aria-label="Digivice (H)" title="Digivice (H)" data-testid="dg-hub">${EMBLEM}${pips}</button>
    </div>
  </div>`;
}

export function bossHtml(s: DigiviceSave, now: number, regionName: string, you: string): string {
  const ph = bossPhase(s, now);
  const w = s.boss.active ?? s.boss.last;
  const boss = w ? { ...bossFor(regionName), id: w.bossId, name: bossName(w.bossId) } : bossFor(regionName);
  const hpLeft = s.boss.active ? Math.max(0, BOSS_HP - bossTotal(s.boss.active, now)) : ph === "available" ? BOSS_HP : s.boss.last?.defeated ? 0 : Math.max(0, BOSS_HP - (s.boss.last ? bossTotal(s.boss.last, s.boss.last.end) : 0));
  const hpPct = Math.round((hpLeft / BOSS_HP) * 100);
  const state =
    ph === "available"
      ? `<div class="wb-state" data-wb-state="available"><p>O chefão dorme. Desperte-o para abrir uma janela de <b>${BOSS_WINDOW_MS / 60_000} min</b>: cada vitória da sua parceira nesse tempo conta como dano.</p><button class="dg-cta" data-boss="awaken" data-testid="wb-awaken">Despertar o Chefão</button><small>1× por dia de jogo.</small></div>`
      : ph === "active"
        ? `<div class="wb-state" data-wb-state="active"><p>Janela aberta: vença selvagens no mapa para causar dano.</p><div class="wb-timer"><span>Tempo restante</span><b data-testid="wb-timer">${clock(s.boss.active!.end - now)}</b></div></div>`
        : ph === "reward"
          ? `<div class="wb-state" data-wb-state="reward"><p>${s.boss.pending!.defeated ? "O chefão caiu!" : "A janela fechou."} Sua contribuição: <b>${s.boss.pending!.dmg}</b> vitória(s). Participação = recompensa cheia.</p><div class="wb-reward">${icon("coin", 16)}<b>+${fmt(s.boss.pending!.bits)}</b> bits</div><button class="dg-cta" data-boss="claim" data-testid="wb-claim">Coletar</button></div>`
          : `<div class="wb-state" data-wb-state="cooldown"><p>${s.boss.last ? (s.boss.last.defeated ? "Derrotado hoje." : "A janela de hoje já fechou.") : "Já despertado hoje."} Próximo despertar disponível em:</p><div class="wb-timer"><span>Recarga</span><b data-testid="wb-timer">${clock(nextMidnight(now) - now)}</b></div></div>`;
  const rows = w ? bossRanking(w, s.boss.active ? now : w.end, you) : [];
  const total = rows.reduce((a, r) => a + r.dmg, 0);
  const rank = rows.length
    ? `<ol class="wb-rank" data-testid="wb-rank">${rows
        .map((r, i) => `<li class="${r.you ? "you" : ""}${r.bot ? " bot" : ""}"><em>${i + 1}º</em><b>${esc(r.name)}</b>${r.bot ? '<span class="tag">BOT · simulado</span>' : '<span class="tag you">você</span>'}<i>${r.dmg}</i><small>${total ? Math.round((r.dmg / total) * 100) : 0}%</small></li>`)
        .join("")}</ol>`
    : `<p class="dg-empty" data-testid="wb-rank-empty">Sem janela ainda: o ranking aparece quando o chefão for despertado.</p>`;
  return `<div class="wb" data-phase="${ph}">
    <div class="wb-banner dg-frame">
      <div class="wb-portrait" title="Retrato provisório (sem arte do chefão ainda)">${icon("boss", 44)}</div>
      <div class="wb-id"><small>Chefe Mundial · ${esc(boss.region)}</small><h3 data-testid="wb-name">${esc(boss.name)} <span>Nv.${boss.level}</span></h3>
        <div class="wb-hp" title="PV do chefão (em vitórias: a sua + as dos bots)"><i data-testid="wb-hp" style="width:${hpPct}%"></i></div><small>${hpLeft}/${BOSS_HP}</small></div>
    </div>
    ${state}
    <h4 class="dg-sub">Ranking local</h4>
    ${rank}
    <p class="note">Sem servidor ainda: os outros nomes são <b>bots locais</b>, não jogadores. O ranking real chega com o servidor (GDD_MMO_V1 §7). Recompensa só em bits — nenhuma vantagem de poder.</p>
  </div>`;
}

export function achievementsHtml(s: DigiviceSave, tab: string): string {
  const views = achievementViews(s);
  const done = views.filter((a) => a.state === "complete" || a.state === "claimed").length;
  const cat = ACH_CATEGORIES.find((c) => c.id === tab) ?? ACH_CATEGORIES[0];
  const tabs = ACH_CATEGORIES.map((c) => {
    const ready = views.some((a) => a.category === c.id && a.state === "complete");
    return `<button class="dg-tab${c.id === cat.id ? " on" : ""}${c.locked ? " locked" : ""}" data-ach-tab="${c.id}" aria-pressed="${c.id === cat.id}">${esc(c.label)}${ready ? '<i class="dg-dot"></i>' : ""}</button>`;
  }).join("");
  const list = views.filter((a) => a.category === cat.id);
  const body = cat.locked
    ? `<div class="dg-locked" data-testid="ach-locked">${icon("guild", 28)}<b>Bloqueado</b><p>${esc(cat.locked)}</p></div>`
    : list.length
      ? list
          .map((a) => {
            const pct = Math.round((a.progress / a.goal) * 100);
            const btn = a.state === "claimed" ? `<span class="ach-ok" title="Coletado">✓</span>` : a.state === "complete" ? `<button class="dg-cta sm" data-ach-claim="${a.id}">Coletar</button>` : "";
            return `<div class="ach ${a.state}" data-ach="${a.id}" data-state="${a.state}">
              <span class="ach-ico">${icon(a.category === "combat" ? "boss" : a.category === "collection" ? "dex" : a.category === "social" ? "guild" : "map", 20)}</span>
              <div class="ach-main"><b>${esc(a.title)}</b><small>${esc(a.description)}</small>
                <div class="row"><div class="dg-bar"><i style="width:${pct}%"></i></div><em>${a.progress}/${a.goal}</em><small class="dim">+${a.rewardBits} bits</small></div></div>
              ${btn}
            </div>`;
          })
          .join("")
      : `<p class="dg-empty">Nenhuma conquista nesta categoria ainda.</p>`;
  return `<div class="achs">
    <div class="ach-head"><b data-testid="ach-count">${done}/${views.length}</b><span>desbloqueadas</span></div>
    <div class="dg-tabs" role="tablist">${tabs}</div>
    <div class="ach-list" data-testid="ach-list">${body}</div>
    <p class="note">Contam só eventos que o jogo já registra: vitórias, varreduras completas, digivoluções, mapas visitados, nível do Tamer, o Chefe Mundial e as ações nos painéis Guilda e Correio. Coletar usa o mesmo caminho de bits das Missões.</p>
  </div>`;
}

/** Estado "bloqueado" de um atalho sem tela (PANELS_SPEC §8): explica o porquê, sem fingir um sistema que não existe. */
export function lockedHtml(it: HubItem): string {
  const why: Record<string, string> = {
    guild: "Fundar uma guilda local ou entrar numa guilda-bot rotulada, com a disputa da rota. Exige o nível 5 de Tamer.",
    mail: "Correio do sistema: carta de boas-vindas, recompensas não coletadas e avisos do Chefe Mundial.",
    pass: "Trilha gratuita de 20 níveis em 14 dias. Sem trilha paga, sem moeda comprável (ADR-007).",
    wish: "Medidor de sorte que enche com vitórias e tempo de jogo; o pedido dá um bônus temporário de varredura.",
  };
  return `<div class="dg-locked" data-testid="dg-locked" data-tier="${it.tier}">
    ${icon(it.icon, 32)}
    <b>Bloqueado nesta versão</b>
    <p>${esc(why[it.id] ?? "")}</p>
    <small>Prioridade ${it.tier} na PANELS_SPEC.md ${it.spec}. Entra numa próxima etapa — nada aqui é placeholder com número falso.</small>
  </div>`;
}

// ---------------------------------------------------------------- controlador (DOM)

export interface DigiviceDeps {
  root: HTMLElement;
  playerId: string;
  storage?: StorageLike;
  /** Espécies já com varredura completa no save do mundo (semente das conquistas de Coleção). */
  captured?: string[];
  tamerName: () => string;
  /** Região/rota atual (pílula do topo): o nome escolhe o chefão; nome + rota contam como "mapa visitado". */
  region: () => { name: string; route: string };
  tamerLevel: () => number;
  /** Concede bits (o main transforma no intent add_bits, igual às Missões). */
  grantBits?: (bits: number) => void;
  toast?: (msg: string) => void;
  now?: () => number;
  /** Itens de uma recompensa (Correio) para o inventário — o mesmo caminho dos itens das Missões. */
  grantItems?: (items: Record<string, number>) => void;
  /** Coleta uma missão pela chave (anexo do Correio = a coleta da própria aba Missões). Devolve se coletou. */
  claimQuest?: (claimKey: string) => boolean;
  /** Missões atuais (marcos não coletados há 48 h viram carta). */
  quests?: () => QuestLike[];
  /** Fonte dos Desejos: liga/desliga o multiplicador de varredura na sim (intent set_scan_mult). */
  setScanMult?: (mult: number) => void;
  /** Varredura por vitória sem bônus (%), para a explicação da Fonte. */
  scanBase?: number;
  /** Aba visível = jogo ativo (tempo da Fonte). Padrão: document.visibilityState. */
  isActive?: () => boolean;
}

export class Digivice {
  readonly el: HTMLElement;
  readonly panels: Record<string, Panel> = {};
  save: DigiviceSave;
  private hub: HTMLButtonElement;
  private caption: HTMLElement;
  private achTab = ACH_CATEGORIES[0].id;
  private partners = new Set<string>();
  private timer?: ReturnType<typeof setInterval>;
  private readonly now: () => number;
  private lastTick: number;
  private ticks = 0;
  private mailSel?: string;
  private guildView: "found" | "leave" | "" = "";
  private guildDraft = { name: "", emblem: 0, error: "" };
  private scanBoostOn = false;

  constructor(private readonly d: DigiviceDeps) {
    this.now = d.now ?? (() => Date.now());
    this.el = d.root.querySelector<HTMLElement>(".dg")!;
    this.hub = this.el.querySelector<HTMLButtonElement>(".dg-hub")!;
    this.caption = this.el.querySelector<HTMLElement>(".dg-caption")!;
    this.save = loadDigivice(d.storage);
    for (const id of d.captured ?? []) if (!this.save.scans.includes(id)) this.save.scans.push(id);
    noteTamerLevel(this.save, d.tamerLevel());
    noteMap(this.save, regionKey(d.region()));
    for (const it of HUB_ITEMS) {
      const p = new Panel(d.root, `dg-${it.id}`, it.label, it.icon);
      p.wrap.classList.add("dg-panel");
      p.wrap.dataset.tier = it.tier;
      this.panels[it.id] = p;
    }
    this.panels.boss.body.addEventListener("click", (e) => this.onBossClick(e));
    this.panels.trophy.body.addEventListener("click", (e) => this.onAchClick(e));
    this.panels.guild.body.addEventListener("click", (e) => this.onGuildClick(e));
    this.panels.guild.body.addEventListener("input", (e) => {
      const t = e.target as HTMLInputElement;
      if (t.dataset.testid === "gd-name") this.guildDraft.name = t.value;
    });
    this.panels.mail.body.addEventListener("click", (e) => this.onMailClick(e));
    this.panels.pass.body.addEventListener("click", (e) => this.onPassClick(e));
    this.panels.wish.body.addEventListener("click", (e) => this.onWishClick(e));
    this.el.addEventListener("pointerover", (e) => this.hover(e));
    this.el.addEventListener("focusin", (e) => this.hover(e));
    this.el.addEventListener("pointerleave", () => (this.caption.textContent = ""));
    const t0 = this.now();
    this.lastTick = t0;
    // janela do chefe que fechou com o jogo fechado: a recompensa vai para o Correio (PANELS_SPEC §2)
    this.settle(t0);
    if (this.save.boss.pending) {
      const p = this.save.boss.pending;
      this.save.boss.pending = undefined;
      addMail(this.save, { iconId: "boss", subject: `Chefe Mundial · ${p.defeated ? "derrotado" : "janela encerrada"}`, body: `A janela do Chefe Mundial fechou enquanto você estava fora. Sua contribuição: ${p.dmg} vitória(s). Participação = recompensa cheia.`, attachment: { bits: p.bits, rewardText: `+${p.bits} bits` }, ts: t0 });
    }
    ensureWelcome(this.save, t0);
    ensureSeason(this.save, t0);
    rollSeason(this.save, t0);
    this.syncScanBoost(t0);
    this.persist();
    this.paint();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  /** Fecha a janela do chefe se venceu; a participação rende o bônus fixo do Passe uma vez. */
  private settle(now: number): boolean {
    const had = !!this.save.boss.pending;
    const done = settleBoss(this.save, now);
    if (done && !had && this.save.boss.pending) addPassPoints(this.save, PASS_BOSS_BONUS);
    return done;
  }

  /** Liga/desliga o multiplicador de varredura da Fonte na sim conforme a janela do pedido. */
  private syncScanBoost(now: number): boolean {
    const on = wishActive(this.save, now);
    if (on === this.scanBoostOn) return false;
    this.scanBoostOn = on;
    this.d.setScanMult?.(on ? WISH_SCAN_MULT : 1);
    return true;
  }

  /** Pontos de Passe = XP da missão diária coletada (PANELS_SPEC §3: 1:1, sem contador paralelo). */
  noteDailyClaim(xp: number): void {
    if (addPassPoints(this.save, xp)) this.changed();
  }

  get isOpen(): boolean {
    return this.el.classList.contains("open");
  }

  toggle(focus = false): void {
    if (this.isOpen) this.close();
    else this.open(focus);
  }

  open(focus = false): void {
    this.el.classList.add("open");
    this.hub.setAttribute("aria-expanded", "true");
    this.el.querySelectorAll<HTMLElement>(".dg-node").forEach((n) => (n.tabIndex = 0));
    if (focus) this.el.querySelector<HTMLElement>(".dg-node")?.focus();
  }

  close(): void {
    if (!this.isOpen) return;
    this.el.classList.remove("open");
    this.hub.setAttribute("aria-expanded", "false");
    this.el.querySelectorAll<HTMLElement>(".dg-node").forEach((n) => (n.tabIndex = -1));
    this.caption.textContent = "";
  }

  /** Abre o painel de um atalho (e fecha o hub e os outros painéis, inclusive os do main). */
  openPanel(id: string): void {
    const it = HUB_ITEMS.find((x) => x.id === id);
    const p = this.panels[id];
    if (!it || !p) return;
    this.close();
    // a janela do chefe pode ter vencido entre dois ticks: fecha antes de desenhar
    if (this.settle(this.now())) this.persist();
    if (id === "guild") this.guildView = "";
    if (id === "mail") this.checkQuestMail();
    this.paint();
    for (const w of this.d.root.querySelectorAll<HTMLElement>(".panel-wrap.open")) if (w !== p.wrap) w.querySelector<HTMLElement>("[data-panel-close]")?.click();
    p.open(this.panelHtml(id));
  }

  closePanels(): void {
    for (const p of Object.values(this.panels)) p.close();
  }

  get anyPanelOpen(): boolean {
    return Object.values(this.panels).some((p) => p.isOpen);
  }

  onEvents(events: WorldEvent[]): void {
    for (const ev of events) if (ev.t === "spawn" && ev.entity.ownerId === this.d.playerId && ev.entity.kind === "partner") this.partners.add(ev.entity.id);
    const now = this.now();
    let extra = false;
    for (const ev of events) {
      if (ev.t !== "reward" || ev.ownerId !== this.d.playerId) continue;
      // Guilda: XP da vitória na rota atual; Fonte: +1% por vitória confirmada (mesmo evento `reward`)
      if (addGuildXp(this.save, this.d.region().route, ev.xp, now)) extra = true;
      if (wishOnWin(this.save)) extra = true;
    }
    if (trackDigivice(this.save, events, this.d.playerId, (id) => this.partners.has(id), now) || this.settle(now) || extra) this.changed();
  }

  noteRegion(key: string): void {
    if (noteMap(this.save, key)) this.changed();
  }

  noteTamerLevel(level: number): void {
    if (noteTamerLevel(this.save, level)) this.changed();
  }

  dispose(): void {
    clearInterval(this.timer);
  }

  private panelHtml(id: string): string {
    const now = this.now();
    const r = this.d.region();
    if (id === "boss") return bossHtml(this.save, now, r.name, this.d.tamerName());
    if (id === "trophy") return achievementsHtml(this.save, this.achTab);
    if (id === "guild")
      return guildHtml(this.save, { tamerLevel: this.d.tamerLevel(), tamerName: this.d.tamerName(), regionName: r.name, route: r.route, now, view: this.guildView, draftName: this.guildDraft.name, draftEmblem: this.guildDraft.emblem, error: this.guildDraft.error });
    if (id === "mail") return mailHtml(this.save, this.mailSel, now);
    if (id === "pass") return passHtml(this.save, now);
    if (id === "wish") return wishHtml(this.save, now, this.d.scanBase ?? 25);
    return lockedHtml(HUB_ITEMS.find((x) => x.id === id)!);
  }

  private changed(): void {
    this.settle(this.now());
    this.persist();
    this.paint();
    // a Guilda não redesenha sozinha com o formulário aberto (não apaga o que o jogador está digitando)
    for (const id of ["boss", "trophy", "mail", "pass", "wish", "guild"]) if (this.panels[id].isOpen && !(id === "guild" && this.guildView === "found")) this.panels[id].update(this.panelHtml(id));
  }

  private checkQuestMail(): boolean {
    const q = this.d.quests?.();
    return !!q && mailStaleQuests(this.save, q, this.now()) > 0;
  }

  private tick(): void {
    const now = this.now();
    const dt = Math.max(0, Math.min(5000, now - this.lastTick));
    this.lastTick = now;
    this.ticks++;
    const active = this.d.isActive ? this.d.isActive() : typeof document === "undefined" || document.visibilityState !== "hidden";
    let dirty = this.settle(now);
    if (active && wishOnPlay(this.save, dt)) dirty = true;
    if (this.syncScanBoost(now) && !this.scanBoostOn) {
      dirty = true;
      this.d.toast?.("Fonte dos Desejos: o bônus de varredura acabou.");
    }
    if (this.ticks % 10 === 0 && this.checkQuestMail()) dirty = true;
    if (rollSeason(this.save, now) > 0) dirty = true;
    if (dirty || this.ticks % 15 === 0) this.persist();
    this.paint();
    if (dirty) for (const id of ["trophy", "mail", "pass"]) if (this.panels[id].isOpen) this.panels[id].update(this.panelHtml(id));
    for (const id of ["boss", "wish"]) if (this.panels[id].isOpen) this.panels[id].update(this.panelHtml(id));
    if (this.panels.guild.isOpen && this.guildView === "" && this.ticks % 5 === 0) this.panels.guild.update(this.panelHtml("guild"));
  }

  private persist(): void {
    try {
      this.d.storage?.setItem(DIGIVICE_KEY, JSON.stringify(this.save));
    } catch {
      /* sem storage (modo privado cheio): segue só em memória */
    }
  }

  /** Arco do chefe e pips do aro. */
  paint(): void {
    const now = this.now();
    const arc = this.el.querySelector<SVGCircleElement>(".dg-bossarc")!;
    const a = bossArc(this.save, now);
    arc.setAttribute("stroke-dasharray", `${a ? (a.frac * RING_C).toFixed(2) : 0} ${RING_C.toFixed(2)}`);
    arc.setAttribute("class", `dg-bossarc ${a?.tone ?? ""}`);
    this.el.dataset.boss = bossPhase(this.save, now);
    const pips = hubPips(this.save, now);
    for (const [id, on] of Object.entries(pips)) {
      const pip = this.el.querySelector<HTMLElement>(`[data-pip="${id}"]`);
      if (pip) pip.hidden = !on;
      this.el.querySelector<HTMLElement>(`[data-dg="${id}"]`)?.classList.toggle("has-news", on);
    }
  }

  private hover(e: Event): void {
    const n = (e.target as HTMLElement).closest<HTMLElement>("[data-dg]");
    if (!n || !this.isOpen) return;
    const it = HUB_ITEMS.find((x) => x.id === n.dataset.dg)!;
    this.caption.textContent = it.locked ? `${it.label} · bloqueado` : it.label;
  }

  private onBossClick(e: Event): void {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-boss]");
    if (!b) return;
    const now = this.now();
    if (b.dataset.boss === "awaken" && awakenBoss(this.save, now, bossFor(this.d.region().name).id)) this.d.toast?.(`${bossName(this.save.boss.active!.bossId)} despertou! Janela de ${BOSS_WINDOW_MS / 60_000} min.`);
    else if (b.dataset.boss === "claim") {
      const bits = claimBoss(this.save);
      if (bits) {
        this.d.grantBits?.(bits);
        this.d.toast?.(`Chefe Mundial: +${bits} bits`);
      }
    } else return;
    this.changed();
  }

  private onAchClick(e: Event): void {
    const t = e.target as HTMLElement;
    const tab = t.closest<HTMLElement>("[data-ach-tab]")?.dataset.achTab;
    const claim = t.closest<HTMLElement>("[data-ach-claim]")?.dataset.achClaim;
    if (tab) this.achTab = tab;
    else if (claim) {
      const bits = claimAchievement(this.save, claim);
      if (!bits) return;
      this.d.grantBits?.(bits);
      this.d.toast?.(`Conquista coletada: +${bits} bits`);
    } else return;
    this.changed();
    this.panels.trophy.update(this.panelHtml("trophy"));
  }

  private onGuildClick(e: Event): void {
    const t = e.target as HTMLElement;
    const act = t.closest<HTMLElement>("[data-gd]")?.dataset.gd;
    const em = t.closest<HTMLElement>("[data-gd-emblem]")?.dataset.gdEmblem;
    const join = t.closest<HTMLElement>("[data-gd-join]")?.dataset.gdJoin;
    const now = this.now();
    const r = this.d.region();
    const lvl = this.d.tamerLevel();
    this.guildDraft.error = "";
    if (em !== undefined) {
      this.guildDraft.emblem = Number(em);
      const input = this.panels.guild.body.querySelector<HTMLInputElement>('[data-testid="gd-name"]');
      if (input) this.guildDraft.name = input.value;
    } else if (join) {
      const err = joinBotGuild(this.save, r.name, join, lvl, now);
      if (err) this.guildDraft.error = err;
      else {
        this.save.guildJoined++;
        this.d.toast?.(`Você entrou em ${this.save.guild!.name} (guilda simulada).`);
      }
    } else if (act === "found" || act === "leave") this.guildView = act;
    else if (act === "cancel") this.guildView = "";
    else if (act === "create") {
      const input = this.panels.guild.body.querySelector<HTMLInputElement>('[data-testid="gd-name"]');
      const err = foundGuild(this.save, input?.value ?? this.guildDraft.name, this.guildDraft.emblem, lvl, now);
      if (err) this.guildDraft.error = err;
      else {
        this.guildView = "";
        this.guildDraft = { name: "", emblem: 0, error: "" };
        this.save.guildJoined++;
        this.d.toast?.(`Guilda ${this.save.guild!.name} fundada.`);
      }
    } else if (act === "leave-yes") {
      leaveGuild(this.save);
      this.guildView = "";
    } else return;
    this.persist();
    this.paint();
    this.panels.guild.update(this.panelHtml("guild"));
    if (this.panels.trophy.isOpen) this.panels.trophy.update(this.panelHtml("trophy"));
  }

  private onMailClick(e: Event): void {
    const t = e.target as HTMLElement;
    const claim = t.closest<HTMLElement>("[data-ml-claim]")?.dataset.mlClaim;
    const row = t.closest<HTMLElement>("[data-ml]")?.dataset.ml;
    if (claim) {
      const m = this.save.mail.find((x) => x.id === claim);
      if (!m || !hasPending(m)) return;
      const a = m.attachment!;
      if (a.questKey) {
        // mesma coleta da aba Missões; se a missão já foi coletada por lá, a carta só fecha
        this.d.claimQuest?.(a.questKey);
      } else {
        if (a.bits) this.d.grantBits?.(a.bits);
        if (a.itemId) this.d.grantItems?.({ [a.itemId]: a.qty ?? 1 });
        if (a.crystals) this.save.crystals += a.crystals;
        this.d.toast?.(`Correio: ${a.rewardText ?? "recompensa coletada"}`);
      }
      m.claimed = true;
      m.read = true;
    } else if (row) {
      this.mailSel = row;
      if (readMail(this.save, row)) this.save.mailRead++;
    } else return;
    this.changed();
    this.panels.mail.update(this.panelHtml("mail"));
  }

  private onPassClick(e: Event): void {
    const lv = Number((e.target as HTMLElement).closest<HTMLElement>("[data-ps-claim]")?.dataset.psClaim);
    if (!lv) return;
    const r = claimPassLevel(this.save, lv);
    if (!r) return;
    if (r.bits) this.d.grantBits?.(r.bits);
    this.d.toast?.(`Passe nível ${lv}: ${r.bits ? `+${r.bits} bits` : `+${r.crystals} Cristais Digitais`}`);
    this.changed();
  }

  private onWishClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('[data-wf="wish"]')) return;
    const now = this.now();
    if (!makeWish(this.save, now)) return;
    this.syncScanBoost(now);
    this.d.toast?.("Pedido feito! +50% de varredura por 15 minutos.");
    this.changed();
  }
}
