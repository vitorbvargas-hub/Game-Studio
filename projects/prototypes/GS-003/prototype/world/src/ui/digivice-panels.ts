// PANELS_SPEC.md §1 Guilda, §2 Correio, §3 Passe de Temporada, §4 Fonte dos Desejos — as 4 abas do Digivice que
// estavam "bloqueadas nesta versão". Lógica pura (estado no DigiviceSave, chave `${SAVE_KEY}.digivice`) + HTML no kit
// circuit-kit-v1 (classes .dg-* do style.css). Regras:
//  - Sem servidor: guildas-bot e pontos delas são SIMULADOS e rotulados assim em toda tela; nunca jogadores reais.
//  - Sem monetização (ADR-007 cond. 1): o Passe é só trilha gratuita; Cristal Digital só é ganho jogando, sem loja.
//  - Nenhum evento novo na sim: tudo vem do evento `reward` já emitido, das coletas das Missões e do Chefe Mundial.
//  - Recompensas pelo MESMO caminho das Missões (add_bits / itens no inventário / coleta da própria missão).
// Números marcados [H] são primeira proposta de design (PANELS_SPEC §9), não calibrados jogando.

import { icon } from "./icons";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR");
const DAY_MS = 24 * 3600_000;
const MIN_MS = 60_000;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function dayOf(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Fração do dia local já passada (0..1). */
function dayFrac(now: number): number {
  const d = new Date(now);
  return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
}

/** "há 2 dias" / "agora". */
export function relTime(ts: number, now: number): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 60) return "agora";
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return `há ${d} dia${d > 1 ? "s" : ""}`;
}

function mmss(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// ================================================================= estado

export interface GuildSave {
  id: string;
  name: string;
  emblemId: number;
  createdAt: number;
  /** Só "leader" é funcional (único membro real); officer/member ficam no schema para o servidor (Fase 3+). */
  role: "leader" | "officer" | "member";
  /** Guilda-bot (simulada) em que o jogador entrou; ausente = guilda fundada por ele. */
  bot?: boolean;
}

export interface MailAttachment {
  bits?: number;
  itemId?: string;
  qty?: number;
  crystals?: number;
  /** Recompensa de uma missão: coletar = a coleta da própria aba Missões (mesmo caminho, mesmo registro). */
  questKey?: string;
  rewardText?: string;
}

export interface MailEntry {
  id: string;
  iconId: "gift" | "mail" | "boss" | "star";
  subject: string;
  body: string;
  attachment?: MailAttachment;
  claimed?: boolean;
  read: boolean;
  ts: number;
}

export interface PassSave {
  season: number;
  start: number;
  points: number;
  claimed: number[];
}

export interface WishSave {
  pct: number;
  /** Tempo de jogo ativo acumulado (ms) desde o último +1% por tempo. */
  playMs: number;
  activeUntil?: number;
  wishes: number;
}

export interface PanelsSave {
  guild?: GuildSave;
  /** Pontos de contribuição REAIS da sua guilda (XP de vitórias), por dia e rota; só os últimos 7 dias. */
  guildPts: Record<string, Record<string, number>>;
  mail: MailEntry[];
  mailSeq: number;
  welcomeSent: boolean;
  /** Quando cada marco (missão de coleção/história) ficou completo sem ser coletado: chave → ts. */
  questDoneAt: Record<string, number>;
  questMailed: string[];
  pass?: PassSave;
  crystals: number;
  wish: WishSave;
}

export const emptyPanels = (): PanelsSave => ({ guildPts: {}, mail: [], mailSeq: 0, welcomeSent: false, questDoneAt: {}, questMailed: [], crystals: 0, wish: { pct: 0, playMs: 0, wishes: 0 } });

// ================================================================= §1 Guilda

/** Gate de progressão [H]: fundar/entrar a partir do nível 5 de Tamer. */
export const GUILD_MIN_LEVEL = 5;
export const GUILD_NAME_MAX = 18;
/** 12 emblemas predefinidos (sem upload): ícone + cor. */
export const EMBLEMS: { icon: string; color: string }[] = [
  { icon: "guild", color: "#2ce8f5" },
  { icon: "boss", color: "#e8465f" },
  { icon: "star", color: "#ffd27a" },
  { icon: "trophy", color: "#e8b84a" },
  { icon: "sun", color: "#ff9f43" },
  { icon: "moon", color: "#8c9eff" },
  { icon: "evo", color: "#3fe0d0" },
  { icon: "map", color: "#7bd389" },
  { icon: "dex", color: "#b48cff" },
  { icon: "chest", color: "#c08552" },
  { icon: "gift", color: "#ff7ab6" },
  { icon: "arena", color: "#9fb3c8" },
];
/** Nomes genéricos (sem IP) das guildas-bot; cada região mostra 4 delas, escolhidas de forma fixa. */
const BOT_GUILD_POOL = ["Punho do Dragão", "Brasa Errante", "Raiz Antiga", "Maré de Cobalto", "Asa de Vidro", "Trilha Rubra", "Eco da Mata", "Lâmina Lunar"];

export interface BotGuild {
  id: string;
  name: string;
  emblemId: number;
  members: number;
}

export function botGuilds(regionName: string): BotGuild[] {
  const h = hash(regionName || "—");
  const start = h % BOT_GUILD_POOL.length;
  return Array.from({ length: 4 }, (_, i) => {
    const name = BOT_GUILD_POOL[(start + i * 3) % BOT_GUILD_POOL.length];
    return { id: `bot:${name}`, name, emblemId: hash(name) % EMBLEMS.length, members: 6 + (hash(`${name}|m`) % 15) };
  });
}

/**
 * Pontos de uma guilda-bot numa rota num dia: alvo fixo pelo (dia, rota, guilda) — relógio local determinístico,
 * reproduzível em QA, sem aleatoriedade — que cresce ao longo do dia (dia de hoje = fração já passada).
 */
export function botGuildPoints(name: string, route: string, day: string, now: number): number {
  const target = 60 + (hash(`${day}|${route}|${name}`) % 160);
  return day === dayOf(now) ? Math.floor(target * dayFrac(now)) : target;
}

const last7 = (now: number): string[] => Array.from({ length: 7 }, (_, i) => dayOf(now - i * DAY_MS));

export function pruneGuildPts(s: PanelsSave, now: number): void {
  const keep = new Set(last7(now));
  for (const d of Object.keys(s.guildPts)) if (!keep.has(d)) delete s.guildPts[d];
}

/** Soma do XP de vitórias (evento `reward` já emitido) enquanto o jogador tem guilda. */
export function addGuildXp(s: PanelsSave, route: string, xp: number, now: number): boolean {
  if (!s.guild || !route || !(xp > 0)) return false;
  const day = dayOf(now);
  (s.guildPts[day] ??= {})[route] = (s.guildPts[day][route] ?? 0) + xp;
  pruneGuildPts(s, now);
  return true;
}

export interface RouteStanding {
  id: string;
  name: string;
  pts: number;
  you: boolean;
  bot: boolean;
}

/** Placar da rota nos últimos 7 dias: guildas-bot (simuladas) + a sua (pontos reais; se for uma bot, somados a ela). */
export function routeStandings(s: PanelsSave, regionName: string, route: string, now: number): RouteStanding[] {
  const days = last7(now);
  const mine = days.reduce((a, d) => a + (s.guildPts[d]?.[route] ?? 0), 0);
  const rows: RouteStanding[] = botGuilds(regionName).map((g) => ({
    id: g.id,
    name: g.name,
    pts: days.reduce((a, d) => a + botGuildPoints(g.name, route, d, now), 0) + (s.guild?.id === g.id ? mine : 0),
    you: s.guild?.id === g.id,
    bot: true,
  }));
  if (s.guild && !s.guild.bot) rows.push({ id: s.guild.id, name: s.guild.name, pts: mine, you: true, bot: false });
  return rows.sort((a, b) => b.pts - a.pts || Number(b.you) - Number(a.you));
}

export function foundGuild(s: PanelsSave, name: string, emblemId: number, tamerLevel: number, now: number): string | null {
  const n = name.trim().replace(/\s+/g, " ");
  if (tamerLevel < GUILD_MIN_LEVEL) return `Disponível a partir do Nível ${GUILD_MIN_LEVEL}`;
  if (s.guild) return "Você já está numa guilda";
  if (!n) return "Dê um nome à guilda";
  if (n.length > GUILD_NAME_MAX) return `Nome com até ${GUILD_NAME_MAX} caracteres`;
  if (!(emblemId >= 0 && emblemId < EMBLEMS.length)) return "Escolha um emblema";
  s.guild = { id: `g${now.toString(36)}`, name: n, emblemId, createdAt: now, role: "leader" };
  return null;
}

export function joinBotGuild(s: PanelsSave, regionName: string, id: string, tamerLevel: number, now: number): string | null {
  if (tamerLevel < GUILD_MIN_LEVEL) return `Disponível a partir do Nível ${GUILD_MIN_LEVEL}`;
  if (s.guild) return "Você já está numa guilda";
  const g = botGuilds(regionName).find((x) => x.id === id);
  if (!g) return "Guilda não encontrada";
  // o jogador é o único membro real: "Líder" é o único cargo funcional nesta versão (PANELS_SPEC §1, Cargo)
  s.guild = { id: g.id, name: g.name, emblemId: g.emblemId, createdAt: now, role: "leader", bot: true };
  return null;
}

export function leaveGuild(s: PanelsSave): boolean {
  if (!s.guild) return false;
  s.guild = undefined;
  s.guildPts = {};
  return true;
}

const SIM = "simulada — sem servidor ainda";

const emblemHtml = (id: number, size = 22) => {
  const e = EMBLEMS[id] ?? EMBLEMS[0];
  return `<span class="gd-emblem" style="--em:${e.color}">${icon(e.icon, size)}</span>`;
};

export interface GuildCtx {
  tamerLevel: number;
  tamerName: string;
  regionName: string;
  route: string;
  now: number;
  /** Estado de UI: "found" = formulário aberto; "leave" = confirmação de saída. */
  view?: "found" | "leave" | "";
  draftName?: string;
  draftEmblem?: number;
  error?: string;
}

export function guildHtml(s: PanelsSave, c: GuildCtx): string {
  const gated = c.tamerLevel < GUILD_MIN_LEVEL;
  const err = c.error ? `<p class="gd-err" data-testid="gd-err">${esc(c.error)}</p>` : "";
  if (!s.guild) {
    if (c.view === "found" && !gated) {
      const ems = EMBLEMS.map((_, i) => `<button type="button" class="gd-em${i === (c.draftEmblem ?? 0) ? " on" : ""}" data-gd-emblem="${i}" aria-pressed="${i === (c.draftEmblem ?? 0)}" title="Emblema ${i + 1}">${emblemHtml(i, 20)}</button>`).join("");
      return `<div class="gd" data-gd-state="found">
        <h4 class="dg-sub">Fundar guilda</h4>
        <label class="gd-field">Nome (até ${GUILD_NAME_MAX} caracteres)<input data-testid="gd-name" maxlength="${GUILD_NAME_MAX}" value="${esc(c.draftName ?? "")}" placeholder="Ex.: Guardiões da Mata" autocomplete="off"></label>
        <div class="gd-field">Emblema<div class="gd-ems" data-testid="gd-emblems">${ems}</div></div>
        ${err}
        <div class="gd-actions"><button class="dg-cta" data-gd="create" data-testid="gd-create">Fundar</button><button class="dg-cta sm" data-gd="cancel">Voltar</button></div>
        <p class="note">Sem servidor ainda: a guilda nasce com 1 membro — você. Nenhum outro jogador é simulado nela.</p>
      </div>`;
    }
    const bots = botGuilds(c.regionName)
      .map((g) => `<li class="gd-bot" data-testid="gd-bot"><span class="gd-ico">${emblemHtml(g.emblemId)}</span><div><b>${esc(g.name)}</b><small>${g.members} membros simulados</small></div><span class="tag sim" data-testid="gd-sim">${SIM}</span><button class="dg-cta sm" data-gd-join="${esc(g.id)}"${gated ? " disabled" : ""}>Entrar</button></li>`)
      .join("");
    return `<div class="gd" data-gd-state="none">
      <div class="gd-empty dg-frame"><b>Sem guilda</b><p>Funde a sua guilda ou entre numa guilda simulada da região para disputar a rota.</p>
        <div class="gd-actions"><button class="dg-cta" data-gd="found" data-testid="gd-found"${gated ? " disabled" : ""}>Fundar guilda</button></div>
        ${gated ? `<small class="gd-gate" data-testid="gd-gate">Disponível a partir do Nível ${GUILD_MIN_LEVEL} (você: Nv.${c.tamerLevel}).</small>` : ""}</div>
      ${err}
      <h4 class="dg-sub">Entrar em uma guilda · ${esc(c.regionName || "região")}</h4>
      <ul class="gd-list" data-testid="gd-bots">${bots}</ul>
      <p class="note">Guildas desta lista são <b>simuladas</b> (sem servidor ainda): nomes genéricos e contagem de membros fictícia, rotuladas como tal. Entrar nelas é só social — não muda a jogabilidade.</p>
    </div>`;
  }
  const g = s.guild;
  const st = routeStandings(s, c.regionName, c.route, c.now);
  const top = st[0];
  const mineRow = st.find((r) => r.you)!;
  const rival = st.find((r) => !r.you)!;
  const max = Math.max(1, mineRow.pts, rival.pts);
  const members = `<li class="you"><span class="gd-ico">${icon("team", 18)}</span><b>${esc(c.tamerName || "Você")}</b><span class="tag you">você</span><small>Líder</small></li>${
    g.bot ? `<li class="bot"><span class="gd-ico">${icon("friends", 18)}</span><b>Outros membros</b><span class="tag sim">${SIM}</span><small>${botGuilds(c.regionName).find((x) => x.id === g.id)?.members ?? 0} simulados</small></li>` : ""
  }`;
  const leave =
    c.view === "leave"
      ? `<div class="gd-confirm" data-testid="gd-confirm"><p>Sair de <b>${esc(g.name)}</b>? A contribuição acumulada é perdida.</p><div class="gd-actions"><button class="dg-cta sm" data-gd="leave-yes" data-testid="gd-leave-yes">Sair</button><button class="dg-cta sm" data-gd="cancel">Cancelar</button></div></div>`
      : `<button class="dg-cta sm" data-gd="leave" data-testid="gd-leave">Sair da guilda</button>`;
  return `<div class="gd" data-gd-state="member">
    <div class="gd-head dg-frame">${emblemHtml(g.emblemId, 32)}<div><h3 data-testid="gd-title">${esc(g.name)}</h3><small>Cargo: Líder${g.bot ? ` · <span class="tag sim" data-testid="gd-sim">${SIM}</span>` : " · fundada por você"}</small></div></div>
    <h4 class="dg-sub">Membros</h4>
    <ul class="gd-members" data-testid="gd-members">${members}</ul>
    <h4 class="dg-sub">Rota atual: ${esc(c.regionName)} · ${esc(c.route)}</h4>
    <p class="gd-dom" data-testid="gd-dominant">Dominada por <b>${esc(top.name)}</b>${top.you ? " (a sua)" : top.bot ? ` <span class="tag sim">${SIM}</span>` : ""}</p>
    <div class="gd-vs" data-testid="gd-contrib">
      <div class="row"><span>${esc(mineRow.name)}</span><div class="dg-bar"><i style="width:${Math.round((mineRow.pts / max) * 100)}%"></i></div><em>${fmt(mineRow.pts)}</em></div>
      <div class="row rival"><span>${esc(rival.name)}</span><div class="dg-bar"><i style="width:${Math.round((rival.pts / max) * 100)}%"></i></div><em>${fmt(rival.pts)}</em></div>
      <small>Pontos dos últimos 7 dias. Os seus = XP das vitórias nesta rota com guilda${g.bot ? " (somados aos pontos simulados da guilda)" : ""}; os das guildas-bot são simulados por um relógio local.</small>
    </div>
    <div class="gd-actions end">${leave}</div>
  </div>`;
}

// ================================================================= §2 Correio

export const MAIL_LIMIT = 20;

export const hasPending = (m: MailEntry): boolean => !!m.attachment && !m.claimed;

/** Guarda uma carta; passou de 20, expira a mais antiga SEM anexo pendente (nunca uma com recompensa). */
export function addMail(s: PanelsSave, m: Omit<MailEntry, "id" | "read"> & { read?: boolean }): MailEntry {
  const entry: MailEntry = { ...m, id: `m${++s.mailSeq}`, read: m.read ?? false };
  s.mail.push(entry);
  while (s.mail.length > MAIL_LIMIT) {
    const old = [...s.mail].sort((a, b) => a.ts - b.ts).find((x) => !hasPending(x));
    if (!old) break;
    s.mail.splice(s.mail.indexOf(old), 1);
  }
  return entry;
}

/** Carta de boas-vindas: uma vez por save, com 1 item de cura do economy.json. */
export function ensureWelcome(s: PanelsSave, now: number): boolean {
  if (s.welcomeSent) return false;
  s.welcomeSent = true;
  addMail(s, {
    iconId: "gift",
    subject: "Bem-vindo, Tamer!",
    body: "O Digivice guarda aqui as suas correspondências: recompensas que ficaram para trás, avisos do Chefe Mundial e o fechamento de temporada do Passe. Para começar, um Potinho de Energia.",
    attachment: { itemId: "potinho_de_energia", qty: 1, rewardText: "1× Potinho de Energia" },
    ts: now,
  });
  return true;
}

export const QUEST_MAIL_AFTER_MS = 48 * 3600_000;

export interface QuestLike {
  kind: string;
  title: string;
  progress: number;
  goal: number;
  trackable: boolean;
  claimed: boolean;
  claimKey: string;
  rewardText: string;
}

/**
 * Marcos (coleção/história) completos e não coletados há 48 h viram carta, com a coleta da própria missão como anexo.
 * As diárias não entram (vencem no dia). Devolve quantas cartas novas.
 */
export function mailStaleQuests(s: PanelsSave, quests: QuestLike[], now: number): number {
  let n = 0;
  for (const q of quests) {
    if (q.kind === "daily" || !q.trackable) continue;
    const done = q.progress >= q.goal && !q.claimed;
    if (!done) {
      delete s.questDoneAt[q.claimKey];
      continue;
    }
    s.questDoneAt[q.claimKey] ??= now;
    if (now - s.questDoneAt[q.claimKey] >= QUEST_MAIL_AFTER_MS && !s.questMailed.includes(q.claimKey)) {
      s.questMailed.push(q.claimKey);
      addMail(s, { iconId: "gift", subject: `Missão: ${q.title}`, body: "Esta missão foi concluída há mais de 48 horas e a recompensa ainda não foi coletada. Ela fica guardada aqui até você coletar.", attachment: { questKey: q.claimKey, rewardText: q.rewardText }, ts: now });
      n++;
    }
  }
  return n;
}

export function readMail(s: PanelsSave, id: string): boolean {
  const m = s.mail.find((x) => x.id === id);
  if (!m || m.read) return false;
  m.read = true;
  return true;
}

export const unreadCount = (s: PanelsSave): number => s.mail.filter((m) => !m.read).length;

export function mailHtml(s: PanelsSave, selId: string | undefined, now: number): string {
  const list = [...s.mail].sort((a, b) => b.ts - a.ts);
  if (!list.length) return `<div class="ml"><p class="dg-empty" data-testid="ml-empty">Sem correspondências.</p></div>`;
  const sel = list.find((m) => m.id === selId);
  const rows = list
    .map(
      (m) =>
        `<li><button type="button" class="ml-row${m.id === sel?.id ? " on" : ""}${m.read ? "" : " unread"}" data-ml="${m.id}" data-testid="ml-row">${icon(m.iconId, 18)}<span class="ml-subj"><b>${esc(m.subject)}</b><small>${relTime(m.ts, now)}${hasPending(m) ? " · anexo" : ""}</small></span>${m.read ? "" : '<i class="ml-dot" data-testid="ml-unread"></i>'}</button></li>`,
    )
    .join("");
  const a = sel?.attachment;
  const att = a
    ? `<div class="ml-att dg-frame">${icon("gift", 16)}<span>${esc(a.rewardText ?? (a.bits ? `+${fmt(a.bits)} bits` : a.crystals ? `+${a.crystals} Cristais Digitais` : ""))}</span>${
        sel!.claimed ? `<span class="ach-ok" title="Coletado">✓</span>` : `<button class="dg-cta sm claim" data-ml-claim="${sel!.id}" data-testid="ml-claim">Coletar</button>`
      }</div>`
    : "";
  const read = sel
    ? `<article class="ml-read" data-testid="ml-read"><h3>${esc(sel.subject)}</h3><small>${relTime(sel.ts, now)}</small><p>${esc(sel.body)}</p>${att}</article>`
    : `<article class="ml-read dim"><p>Escolha uma carta.</p></article>`;
  return `<div class="ml">
    <div class="ml-head"><b data-testid="ml-count">${unreadCount(s)}</b><span>não lida(s) · ${list.length}/${MAIL_LIMIT} guardadas</span></div>
    <div class="ml-grid"><ul class="ml-list" data-testid="ml-list">${list.length ? rows : ""}</ul>${read}</div>
    <p class="note">Correio do sistema (não há mensagens entre jogadores sem servidor). Cartas com recompensa nunca expiram antes de serem coletadas.</p>
  </div>`;
}

// ================================================================= §3 Passe de Temporada

/** 14 dias (o mesmo ciclo da Arena Clássica, GDD_MMO_V1 §5.1), 20 níveis [H], 40 Pontos de Passe por nível [H]. */
export const PASS_DAYS = 14;
export const PASS_LEVELS = 20;
export const PASS_LEVEL_PTS = 40;
/** Bônus fixo por participação no Chefe Mundial [H]. */
export const PASS_BOSS_BONUS = 30;

export interface PassReward {
  level: number;
  bits?: number;
  crystals?: number;
  /** Cosmético sem arte ainda: aparece "em produção" e não pode ser coletado. */
  cosmetic?: string;
}

export function passReward(level: number): PassReward {
  if (level === 10) return { level, cosmetic: "Moldura de Retrato" };
  if (level === 20) return { level, cosmetic: "Título: Pioneiro da Temporada" };
  if (level % 5 === 0) return { level, crystals: 25 };
  return level % 2 ? { level, bits: 40 + level * 10 } : { level, crystals: 10 };
}

export const passRewardText = (r: PassReward): string => (r.cosmetic ? `${r.cosmetic} (em produção)` : r.bits ? `+${fmt(r.bits)} bits` : `+${r.crystals} Cristais Digitais`);

export const passLevel = (p: PassSave): number => Math.min(PASS_LEVELS, Math.floor(p.points / PASS_LEVEL_PTS));

/** Temporada ancorada no primeiro login do save (sem relógio de servidor). */
export function ensureSeason(s: PanelsSave, now: number): boolean {
  if (s.pass) return false;
  s.pass = { season: 1, start: now, points: 0, claimed: [] };
  return true;
}

/** Virada de temporada: níveis alcançados e não coletados vão para o Correio (nunca descartados); nova temporada começa agora. */
export function rollSeason(s: PanelsSave, now: number): number {
  const p = s.pass;
  if (!p || now < p.start + PASS_DAYS * DAY_MS) return 0;
  let n = 0;
  for (let lv = 1; lv <= passLevel(p); lv++) {
    const r = passReward(lv);
    if (p.claimed.includes(lv) || r.cosmetic) continue;
    addMail(s, { iconId: "star", subject: `Passe · Temporada ${p.season}: nível ${lv}`, body: "A temporada terminou com esta recompensa ainda não coletada. Ela foi guardada aqui para você.", attachment: { bits: r.bits, crystals: r.crystals, rewardText: passRewardText(r) }, ts: now });
    n++;
  }
  s.pass = { season: p.season + 1, start: now, points: 0, claimed: [] };
  return n;
}

export function addPassPoints(s: PanelsSave, pts: number): boolean {
  if (!s.pass || !(pts > 0)) return false;
  s.pass.points += Math.floor(pts);
  return true;
}

/** Coleta um nível alcançado (bits pelo add_bits das Missões; Cristais ficam no save do Digivice). */
export function claimPassLevel(s: PanelsSave, level: number): PassReward | null {
  const p = s.pass;
  if (!p || level < 1 || level > passLevel(p) || p.claimed.includes(level)) return null;
  const r = passReward(level);
  if (r.cosmetic) return null;
  p.claimed.push(level);
  if (r.crystals) s.crystals += r.crystals;
  return r;
}

export function passHtml(s: PanelsSave, now: number): string {
  const p = s.pass;
  if (!p) return `<div class="ps"><p class="dg-empty" data-testid="ps-empty">Nova temporada começa com o seu próximo login.</p></div>`;
  const lv = passLevel(p);
  const daysLeft = Math.max(0, Math.ceil((p.start + PASS_DAYS * DAY_MS - now) / DAY_MS));
  const nodes = Array.from({ length: PASS_LEVELS }, (_, i) => {
    const n = i + 1;
    const r = passReward(n);
    const st = p.claimed.includes(n) ? "claimed" : n <= lv ? (r.cosmetic ? "prod" : "ready") : n === lv + 1 ? "next" : "future";
    const mark = st === "claimed" ? "✓" : String(n);
    return `<li class="ps-node ${st}" data-ps="${n}" data-state="${st}" title="Nível ${n}: ${esc(passRewardText(r))}">${n <= lv && !r.cosmetic && st !== "claimed" ? `<button type="button" data-ps-claim="${n}" aria-label="Coletar nível ${n}">${mark}</button>` : `<span>${mark}</span>`}</li>`;
  }).join("");
  const preview = [lv + 1, lv + 2, lv + 3]
    .filter((n) => n <= PASS_LEVELS)
    .map((n) => {
      const r = passReward(n);
      return `<div class="ps-prev ach${r.cosmetic ? " prod" : ""}" data-testid="ps-preview"><span class="ach-ico">${icon(r.cosmetic ? "star" : r.bits ? "coin" : "gift", 20)}</span><div class="ach-main"><b>Nível ${n}</b><small>${esc(passRewardText(r))}</small></div></div>`;
    })
    .join("");
  const ready = Array.from({ length: lv }, (_, i) => i + 1).filter((n) => !p.claimed.includes(n) && !passReward(n).cosmetic);
  const into = p.points - lv * PASS_LEVEL_PTS;
  const nextTxt = lv >= PASS_LEVELS ? "trilha completa" : `próximo nível ${fmt((lv + 1) * PASS_LEVEL_PTS)}`;
  return `<div class="ps">
    <div class="ps-head"><div><small>Temporada ${p.season} · gratuita</small><h3>Nível <b data-testid="ps-level">${lv}</b>/${PASS_LEVELS}</h3></div>
      <div class="ps-crys" title="Cristal Digital: ganho só jogando; sem loja nesta versão">${icon("gift", 16)}<b data-testid="ps-crystals">${fmt(s.crystals)}</b><span>Cristais Digitais</span></div></div>
    <ol class="ps-track" data-testid="ps-track">${nodes}</ol>
    <div class="row ps-prog"><span>Pontos de Passe: <b data-testid="ps-points">${fmt(p.points)}</b> / ${nextTxt}</span><div class="dg-bar"><i style="width:${lv >= PASS_LEVELS ? 100 : Math.round((into / PASS_LEVEL_PTS) * 100)}%"></i></div><em data-testid="ps-days">Temporada termina em ${daysLeft} dia${daysLeft === 1 ? "" : "s"}</em></div>
    ${ready.length ? `<div class="gd-actions"><button class="dg-cta" data-ps-claim="${ready[0]}" data-testid="ps-claim">Coletar nível ${ready[0]} (${esc(passRewardText(passReward(ready[0])))})</button>${ready.length > 1 ? `<small>+${ready.length - 1} nível(is) prontos</small>` : ""}</div>` : ""}
    <h4 class="dg-sub">Próximas recompensas</h4>
    <div class="ps-prevs">${preview || '<p class="dg-empty">Trilha completa nesta temporada.</p>'}</div>
    <p class="note" data-testid="ps-free">Trilha 100% gratuita: sem trilha paga, sem compra, sem moeda comprável. Pontos vêm só do que você já faz — XP das missões diárias coletadas e +${PASS_BOSS_BONUS} por participação no Chefe Mundial. Cristal Digital só é ganho jogando (loja cosmética ainda não existe). Níveis não coletados no fim da temporada vão para o Correio.</p>
  </div>`;
}

// ================================================================= §4 Fonte dos Desejos

export const WISH_MAX = 100;
export const WISH_PER_WIN = 1;
export const WISH_PLAY_MS = 10 * MIN_MS;
export const WISH_WINDOW_MS = 15 * MIN_MS;
/** Multiplicador do ganho de varredura durante o pedido (o `modDados × 1,5` da PANELS_SPEC §4). */
export const WISH_SCAN_MULT = 1.5;

export const wishActive = (s: PanelsSave, now: number): boolean => !!s.wish.activeUntil && now < s.wish.activeUntil;

export function wishOnWin(s: PanelsSave, n = 1): boolean {
  if (s.wish.pct >= WISH_MAX || n <= 0) return false;
  s.wish.pct = Math.min(WISH_MAX, s.wish.pct + n * WISH_PER_WIN);
  return true;
}

/** Tempo de jogo ativo (aba visível): +1% a cada 10 min, teto 100%, sem decaimento. */
export function wishOnPlay(s: PanelsSave, ms: number): boolean {
  if (!(ms > 0)) return false;
  s.wish.playMs += ms;
  let changed = false;
  while (s.wish.playMs >= WISH_PLAY_MS) {
    s.wish.playMs -= WISH_PLAY_MS;
    if (s.wish.pct < WISH_MAX) {
      s.wish.pct = Math.min(WISH_MAX, s.wish.pct + 1);
      changed = true;
    }
  }
  return changed;
}

export function makeWish(s: PanelsSave, now: number): boolean {
  if (s.wish.pct < WISH_MAX || wishActive(s, now)) return false;
  s.wish.pct = 0;
  s.wish.activeUntil = now + WISH_WINDOW_MS;
  s.wish.wishes++;
  return true;
}

const WISH_R = 52;
const WISH_C = 2 * Math.PI * WISH_R;

export function wishHtml(s: PanelsSave, now: number, scanBase: number): string {
  const pct = Math.floor(s.wish.pct);
  const active = wishActive(s, now);
  const ready = pct >= WISH_MAX;
  const state = active ? "active" : ready ? "ready" : "filling";
  const btn = active
    ? `<div class="wf-active" data-testid="wf-active">Pedido ativo: <b data-testid="wf-timer">${mmss(s.wish.activeUntil! - now)}</b> restantes</div>`
    : `<button class="dg-cta" data-wf="wish" data-testid="wf-wish"${ready ? "" : " disabled"}>Fazer um pedido</button>`;
  const boosted = Math.round(scanBase * WISH_SCAN_MULT);
  return `<div class="wf" data-wf-state="${state}">
    <div class="wf-dial${ready && !active ? " pulse" : ""}">
      <svg viewBox="0 0 128 128" width="128" height="128" aria-hidden="true" shape-rendering="geometricPrecision">
        <circle cx="64" cy="64" r="${WISH_R}" class="wf-track"/>
        <circle cx="64" cy="64" r="${WISH_R}" class="wf-fill" transform="rotate(-90 64 64)" stroke-dasharray="${((pct / WISH_MAX) * WISH_C).toFixed(2)} ${WISH_C.toFixed(2)}" data-testid="wf-ring"/>
      </svg>
      <b data-testid="wf-pct">${pct}%</b>
    </div>
    <p class="wf-explain" data-testid="wf-explain">Ao completar 100%, faça um pedido: <b>+50% de varredura por vitória por 15 minutos</b> (${scanBase}% → ${boosted}% por selvagem vencido).</p>
    <p class="wf-status" data-testid="wf-status">${active ? "Bônus ativo — a Fonte já volta a encher." : ready ? "100% — pedido disponível!" : `${pct}% — continue jogando`}</p>
    ${btn}
    <p class="note">Enche sozinha: +1% por vitória e +1% a cada 10 min de jogo ativo. Não há clique para encher e nada se compra. Pedidos feitos: ${s.wish.wishes}.</p>
  </div>`;
}
