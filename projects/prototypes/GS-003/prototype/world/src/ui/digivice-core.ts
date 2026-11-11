// Digivice VI 1.0 — o NÚCLEO Tamer/Digimon (quality-overhaul/phase3/design/DIGIVICE_VI1_SPEC.md §2, §4, P0/P1).
// Um só modal com aba lateral: grupos TAMER (Perfil/Atributos/Poderes/Talentos) e DIGIMON (Perfil/Atributos/
// Habilidades/Talentos) + Evolução, Vínculo, Banco de dados e Registros e descobertas. O anel externo do hub (Alt A:
// Guilda/Correio/Passe/Fonte/Chefe/Registros e descobertas) não muda de lugar; o nó trophy do anel abre ESTA seção de Registros.
//
// Regras: HTML puro sobre dados que o jogo já tem — nada aqui altera XP, evolução ou combate. Atributos do Tamer =
// registro de atividade do DigiviceSave (statValue, o mesmo dado das Conquistas), não stats de combate. Seções que
// dependem de regra nova ainda não aprovada (§3.1 [H]: Poderes/Talentos do Tamer, Talentos do Digimon, Vínculo)
// ficam no estado "aguardando aprovação de regra", sem número nenhum.

import type { MoveContent } from "../sim/moves";
import { moveSummary, type MovesView } from "./moves-ui";
import { statValue, type DigiviceSave, type StatId } from "./digivice";
import { icon } from "./icons";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR");

export type CoreSection =
  | "tamer-profile"
  | "tamer-attrs"
  | "tamer-powers"
  | "tamer-talents"
  | "mon-profile"
  | "mon-attrs"
  | "mon-skills"
  | "mon-talents"
  | "evo"
  | "bond"
  | "db"
  | "records";

export type CoreGroup = "tamer" | "digimon";

export interface CoreNavItem {
  id: CoreSection;
  label: string;
  group?: CoreGroup;
  icon: string;
  /** Prioridade em DIGIVICE_VI1_SPEC.md §5. P2 = depende de regra nova [H] → "aguardando aprovação". */
  tier: "P0" | "P1" | "P2";
  spec: string;
  /** Regra ainda não aprovada pelo fundador: a seção existe, mas só com o aviso (nunca número inventado). */
  pending?: boolean;
}

/** Ordem do mockup core_tamer.svg: os 2 grupos com disclosure e as seções soltas abaixo. */
export const CORE_NAV: CoreNavItem[] = [
  { id: "tamer-profile", label: "Perfil", group: "tamer", icon: "team", tier: "P0", spec: "§4.2" },
  { id: "tamer-attrs", label: "Atributos", group: "tamer", icon: "quest", tier: "P1", spec: "§4.3" },
  { id: "tamer-powers", label: "Poderes", group: "tamer", icon: "star", tier: "P2", spec: "§4.4", pending: true },
  { id: "tamer-talents", label: "Árvore de talentos", group: "tamer", icon: "gift", tier: "P2", spec: "§4.5", pending: true },
  { id: "mon-profile", label: "Perfil", group: "digimon", icon: "dex", tier: "P0", spec: "§4.6" },
  { id: "mon-attrs", label: "Atributos", group: "digimon", icon: "boss", tier: "P0", spec: "§4.7" },
  { id: "mon-skills", label: "Habilidades", group: "digimon", icon: "arena", tier: "P1", spec: "§4.8" },
  { id: "mon-talents", label: "Árvore de talentos", group: "digimon", icon: "gift", tier: "P2", spec: "§4.9", pending: true },
  { id: "evo", label: "Evolução", icon: "evo", tier: "P0", spec: "§4.10" },
  { id: "bond", label: "Vínculo", icon: "friends", tier: "P1", spec: "§4.11", pending: true },
  { id: "db", label: "Banco de dados", icon: "dex", tier: "P0", spec: "§4.12" },
  { id: "records", label: "Registros e descobertas", icon: "trophy", tier: "P0", spec: "§4.13" },
];

export const CORE_GROUPS: { id: CoreGroup; label: string }[] = [
  { id: "tamer", label: "Tamer" },
  { id: "digimon", label: "Digimon" },
];

export const coreItem = (id: CoreSection): CoreNavItem => CORE_NAV.find((x) => x.id === id)!;

/** Título da seção no topo do corpo ("Tamer · Perfil", "Evolução"...). */
export function coreTitle(id: CoreSection): string {
  const it = coreItem(id);
  const g = CORE_GROUPS.find((x) => x.id === it.group);
  return g ? `${g.label} · ${it.label}` : it.label;
}

/** Aba lateral: grupos com disclosure (▾ aberto / ▸ fechado), item ativo dourado, pendentes com cadeado. */
export function coreNavHtml(sel: CoreSection, collapsed: ReadonlySet<CoreGroup> = new Set(), news: Partial<Record<CoreSection, boolean>> = {}): string {
  const btn = (it: CoreNavItem) =>
    `<button type="button" class="dg-tab dvc-tab${it.id === sel ? " on" : ""}${it.pending ? " locked" : ""}" role="tab" aria-selected="${it.id === sel}" data-core="${it.id}" title="${esc(it.group ? coreTitle(it.id) : it.label)}${it.pending ? " — aguardando aprovação de regra" : ""}">${icon(it.icon, 14)}<span>${esc(it.label)}</span>${it.pending ? '<i class="dvc-lock" aria-hidden="true"></i>' : ""}${news[it.id] ? '<i class="dg-dot" aria-hidden="true"></i>' : ""}</button>`;
  const groups = CORE_GROUPS.map((g) => {
    const open = !collapsed.has(g.id);
    const items = CORE_NAV.filter((x) => x.group === g.id);
    const has = items.some((x) => x.id === sel);
    return `<div class="dvc-group${open ? " open" : ""}${has ? " has-sel" : ""}" data-group="${g.id}">
      <button type="button" class="dvc-ghead" data-core-group="${g.id}" aria-expanded="${open}"><i aria-hidden="true">${open ? "▾" : "▸"}</i>${esc(g.label.toUpperCase())}</button>
      ${open ? `<div class="dvc-gitems">${items.map(btn).join("")}</div>` : ""}
    </div>`;
  }).join("");
  const loose = CORE_NAV.filter((x) => !x.group).map(btn).join("");
  return `<nav class="dvc-nav" role="tablist" aria-orientation="vertical" aria-label="Seções do Digivice">${groups}<div class="dvc-loose">${loose}</div></nav>`;
}

// ---------------------------------------------------------------- Tamer → Perfil (§4.2, P0)

export interface TamerProfile {
  name: string;
  level: number;
  /** XP dentro do nível e o que falta para o próximo — a mesma curva da barra inferior (Hud.tamerProgress). */
  xp: number;
  next: number;
  /** Parceiro ativo (só nome/nível, para o perfil não ficar órfão do Digimon). */
  partner?: { name: string; level: number };
}

export function tamerProfileHtml(p: TamerProfile): string {
  const pct = Math.max(0, Math.min(100, Math.round((p.xp / Math.max(1, p.next)) * 100)));
  return `<div class="dvc-tamer" data-testid="dvc-tamer-profile">
    <div class="hc-head">
      <div class="dvc-portrait" data-testid="dvc-tamer-portrait" title="Retrato provisório — recorte aguardando a escala do Tamer (game-art, TAMER_PORTRAIT_CROP)"><span>TAMER</span></div>
      <div class="hc-id">
        <h3><span data-testid="dvc-tamer-name">${esc(p.name)}</span> <span>Nv.<b data-testid="dvc-tamer-level">${p.level}</b></span></h3>
        <div class="chips"><span class="chip">Tamer</span>${p.partner ? `<span class="chip dim">Parceiro: ${esc(p.partner.name)} Nv.${p.partner.level}</span>` : ""}</div>
        <div class="hc-vit"><label>XP</label><div class="dg-bar"><i style="width:${pct}%"></i></div><em data-testid="dvc-tamer-xp">${fmt(p.xp)}/${fmt(p.next)}</em></div>
        <small class="dim">Faltam <b>${fmt(Math.max(0, p.next - p.xp))}</b> XP para o Nv.${p.level + 1}.</small>
      </div>
    </div>
    <div class="dg-sub">Atalhos do Tamer</div>
    <div class="dvc-links">
      <button type="button" class="dg-cta sm" data-core="tamer-attrs">${icon("quest", 14)} Atributos (registro de atividade)</button>
      <button type="button" class="dg-cta sm" data-core="records">${icon("trophy", 14)} Registros e descobertas</button>
    </div>
    <p class="note">Nome, nível e XP são os mesmos da barra inferior (uma só fonte). O XP do Tamer vem das vitórias da parceira; a curva não muda aqui.</p>
  </div>`;
}

// ---------------------------------------------------------------- Tamer → Atributos (§4.3, P1)

/** Registro de atividade: os contadores que o DigiviceSave já salva (os mesmos das Conquistas). */
export const TAMER_ATTRS: { stat: StatId; label: string; icon: string }[] = [
  { stat: "wins", label: "Vitórias", icon: "boss" },
  { stat: "scans", label: "Espécies escaneadas", icon: "dex" },
  { stat: "evolves", label: "Digivoluções acompanhadas", icon: "evo" },
  { stat: "maps", label: "Mapas visitados", icon: "map" },
  { stat: "bossAwakens", label: "Chefões despertados", icon: "boss" },
  { stat: "bossDefeats", label: "Chefões derrotados", icon: "trophy" },
];

export function tamerAttrsHtml(s: DigiviceSave): string {
  const rows = TAMER_ATTRS.map((a) => `<tr data-attr="${a.stat}"><th>${icon(a.icon, 14)} ${esc(a.label)}</th><td data-testid="dvc-attr-${a.stat}">${fmt(statValue(s, a.stat))}</td></tr>`).join("");
  return `<div class="dvc-attrs" data-testid="dvc-tamer-attrs">
    <p class="lead">Registro de atividade do Tamer — o que você já fez neste save.</p>
    <table class="hc-stats dvc-reg">${rows}</table>
    <p class="note">Não são atributos de combate: o Tamer não luta nesta versão e estes números não mudam nenhum cálculo. São os mesmos contadores que as Conquistas usam.</p>
  </div>`;
}

// ---------------------------------------------------------------- seções que aguardam regra (§3.1 [H], P2)

const PENDING: Partial<Record<CoreSection, { title: string; text: string; proposal: string; ref: string }>> = {
  "tamer-powers": {
    title: "Poderes do Tamer",
    text: "Poderes do Tamer ainda não existem como mecânica: só o Digimon age em combate nesta versão.",
    proposal: "Proposta em avaliação: marcos cosméticos por nível do Tamer (títulos), sem efeito em combate.",
    ref: "DIGIVICE_VI1_SPEC §3.1 / §4.4",
  },
  "tamer-talents": {
    title: "Árvore de talentos do Tamer",
    text: "Não há pontos de talento do Tamer nesta versão.",
    proposal: "Proposta em avaliação: nós cosméticos (moldura de retrato, título) liberados por nível — sem pontos gastáveis em stats.",
    ref: "DIGIVICE_VI1_SPEC §3.1 / §4.5",
  },
  "mon-talents": {
    title: "Árvore de talentos do Digimon",
    text: "Não há pontos de talento do Digimon nesta versão. Distinta da Evolução: aqui a espécie não muda.",
    proposal: "Proposta em avaliação: trilha informativa dos golpes aprendidos, em ordem, sem pontos gastáveis.",
    ref: "DIGIVICE_VI1_SPEC §3.1 / §4.9",
  },
  bond: {
    title: "Vínculo",
    text: "Vínculo ainda não é uma mecânica ativa — nenhum número é mostrado até a regra existir de fato.",
    proposal: "Proposta pronta (VIDEO_IDEAS_SPEC §2): Disciplina e Afeto 0–100 com Elogiar/Repreender/Ignorar, afetando só caminhos alternativos de evolução — o caminho padrão nunca terá gate de vínculo.",
    ref: "DIGIVICE_VI1_SPEC §4.11 · VIDEO_IDEAS_SPEC §2",
  },
};

/** Estado bloqueado honesto (mesma moldura de lockedHtml do hub): explica o que falta, sem barra nem número. */
export function pendingHtml(id: CoreSection): string {
  const p = PENDING[id];
  const it = coreItem(id);
  if (!p) return "";
  return `<div class="dg-locked dvc-pending" data-testid="dvc-pending" data-section="${id}">
    ${icon(it.icon, 32)}
    <b>Aguardando aprovação de regra</b>
    <p><strong>${esc(p.title)}.</strong> ${esc(p.text)}</p>
    <p class="dvc-proposal">${esc(p.proposal)}</p>
    <small>Prioridade ${it.tier} · ${esc(p.ref)}. Nada aqui é placeholder com número falso: a seção ganha dados quando o fundador aprovar a regra.</small>
  </div>`;
}

// ---------------------------------------------------------------- Digimon → Habilidades (§4.8, P1, somente leitura)

export function monSkillsHtml(mc: MoveContent, v: MovesView | undefined): string {
  if (!v) return `<p class="dg-empty">Sem parceiro ativo.</p>`;
  const slot = (id: string | null, i: number) => {
    const m = id ? mc.moves[id] : undefined;
    if (!m) return `<div class="mslot empty"><span class="n">${i + 1}</span><em>vazio</em></div>`;
    return `<div class="mslot" data-ro-slot="${i}" title="${esc(moveSummary(m))}"><span class="n">${i + 1}</span><canvas class="mi" width="24" height="24" data-icon="${m.id}"></canvas><div><b>${esc(m.name)}</b><small>${esc(moveSummary(m))}</small></div></div>`;
  };
  const ls = mc.learnsets[v.speciesId] ?? [];
  const locked = ls.filter((e) => !v.learned.includes(e.move));
  const learned = v.learned
    .map((id) => mc.moves[id])
    .filter((m): m is NonNullable<typeof m> => !!m)
    .map((m) => `<li class="${v.moves.includes(m.id) ? "eq" : ""}"><canvas class="mi" width="24" height="24" data-icon="${m.id}"></canvas><div><b>${esc(m.name)}</b><small>${esc(moveSummary(m))}</small></div>${v.moves.includes(m.id) ? `<span class="tag">Slot ${v.moves.indexOf(m.id) + 1}</span>` : ""}</li>`)
    .join("");
  const future = locked.map((e) => `<li class="locked"><canvas class="mi" width="24" height="24" data-icon="${e.move}"></canvas><div><b>${esc(mc.moves[e.move]?.name ?? e.move)}</b><small>aprende no Nv.${e.level}</small></div><span class="tag">Nv.${e.level}</span></li>`).join("");
  return `<div class="dvc-skills moves-tab" data-testid="dvc-skills">
    <div class="mt-head"><h3>${esc(v.name)} <span>Nv.${v.level}</span></h3>
      <div class="row"><label>MP</label><div class="hud-bar mpb"><i style="width:${Math.round((v.mp / Math.max(1, v.maxMp)) * 100)}%"></i></div><em>${Math.floor(v.mp)}/${v.maxMp}</em></div>
    </div>
    <div class="sec"><b>Golpes ativos</b> <span>${v.moves.filter(Boolean).length}/4 · os mesmos da barra de golpes</span></div>
    <div class="mslots" data-testid="dvc-slots">${v.moves.map(slot).join("")}</div>
    <div class="sec"><b>Aprendidos</b> <span>${v.learned.length}</span></div>
    <ul class="mlist">${learned || '<li class="dim">Ainda sem golpes aprendidos.</li>'}${future}</ul>
    <div class="dvc-links"><button type="button" class="dg-cta" data-core-edit="moves" data-testid="dvc-edit-moves">${icon("team", 14)} Editar em Equipe &amp; Box</button></div>
    <p class="note">Somente leitura: trocar golpes, a prioridade do AUTO e a preferência de evolução continuam num único lugar (Equipe &amp; Box → Golpes).</p>
  </div>`;
}

// ---------------------------------------------------------------- Registros e descobertas (§4.13)

export type RecordsTab = "ach" | "maps";

/** Mapas visitados, na ordem da primeira visita (DigiviceSave.maps, salvo por noteMap). */
export function mapsVisitedHtml(s: DigiviceSave): string {
  if (!s.maps.length) return `<p class="dg-empty" data-testid="dvc-maps-empty">Nenhum mapa registrado ainda.</p>`;
  const rows = s.maps
    .map((k, i) => {
      const [name, route] = k.split(" · ");
      return `<li data-map="${esc(k)}"><em>${i + 1}º</em>${icon("map", 14)}<b>${esc(name)}</b><span>${esc(route ?? "")}</span></li>`;
    })
    .join("");
  return `<div class="dvc-maps"><div class="ach-head"><b data-testid="dvc-maps-count">${s.maps.length}</b><span>mapa${s.maps.length > 1 ? "s" : ""} visitado${s.maps.length > 1 ? "s" : ""}</span></div>
    <ol class="dvc-maplist" data-testid="dvc-maps">${rows}</ol>
    <p class="note">Ordem da primeira visita. É o mesmo registro que conta para as Conquistas de Exploração.</p></div>`;
}

/** Sub-abas Conquistas / Mapas visitados. `achHtml` = achievementsHtml do hub (mesma lógica, coleta, abas). */
export function recordsHtml(s: DigiviceSave, tab: RecordsTab, achHtml: string, achNews: boolean): string {
  return `<div class="dvc-records" data-testid="dvc-records" data-tab="${tab}">
    <div class="dg-tabs" role="tablist">
      <button type="button" class="dg-tab${tab === "ach" ? " on" : ""}" role="tab" aria-selected="${tab === "ach"}" data-rec-tab="ach">Conquistas${achNews ? '<i class="dg-dot"></i>' : ""}</button>
      <button type="button" class="dg-tab${tab === "maps" ? " on" : ""}" role="tab" aria-selected="${tab === "maps"}" data-rec-tab="maps" data-testid="dvc-rec-maps">Mapas visitados</button>
    </div>
    ${tab === "ach" ? achHtml : mapsVisitedHtml(s)}
  </div>`;
}

// ---------------------------------------------------------------- moldura do núcleo

/** Corpo do modal: aba lateral + título da seção + conteúdo (o Hud monta `body` com os dados de cada seção). */
export function coreHtml(sel: CoreSection, body: string, collapsed?: ReadonlySet<CoreGroup>, news?: Partial<Record<CoreSection, boolean>>): string {
  const it = coreItem(sel);
  return `<div class="dvc" data-testid="dvc" data-section="${sel}">
    ${coreNavHtml(sel, collapsed, news)}
    <div class="dvc-main">
      <div class="dvc-title"><h3>${icon(it.icon, 16)} ${esc(coreTitle(sel))}</h3>${it.pending ? '<span class="tag">aguardando aprovação</span>' : ""}</div>
      <div class="dvc-body" data-testid="dvc-body">${it.pending ? pendingHtml(sel) : body}</div>
    </div>
  </div>`;
}
