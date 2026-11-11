// Ficha holográfica do parceiro + árvore de evolução com % (VIDEO_IDEAS_SPEC.md §3, P0), só no HUD v2 (?hud=v2).
// HTML puro a partir dos dados que a sim já tem: a % de cada caminho sai só de pathStatuses()/ReqCheck
// (média de min(have/need, 1) por requisito; `eligible` = 100%), a árvore segue `moves.paths` e marca onde ramifica
// com forksAhead(). Nenhuma espécie nova: nós são espécies do content pack (alvo sem espécie = "indisponível").
// O Hud abre isto num Panel (retrato do parceiro ou atalho do Digivice) e pinta os canvases [data-species].

import { forksAhead, pathStatuses, REQ_PT, type PathStatus, type ReqCheck } from "../sim/evolution";
import type { MoveContent } from "../sim/moves";
import type { WorldContent } from "../sim/species";
import type { StatBlock } from "../sim/types";
import { AFFINITY_PT, STAGE_PT } from "./starter";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export interface HoloSubject {
  speciesId: string;
  name: string;
  level: number;
  stats: StatBlock;
  hp: number;
  maxHp: number;
  xp?: { xp: number; next: number };
  /** Preferências do Auto-evoluir (marca "preferido" no nó). */
  evoPrefs?: Record<string, string>;
  /** Evoluir agora está liberado (fora de combate e com caminho elegível): o nó elegível ganha o botão. */
  canEvolve?: boolean;
}

/** % de um caminho (spec §3): Σ min(have/need, 1) / nº de requisitos, truncado; caminho elegível = 100. */
export function pathPct(s: Pick<PathStatus, "reqs" | "eligible">): number {
  if (s.eligible) return 100;
  if (!s.reqs.length) return 0;
  const sum = s.reqs.reduce((a, r) => a + (r.need > 0 ? Math.min(r.have / r.need, 1) : 1), 0);
  // truncado: 99,6% não pode aparecer como 100% num caminho que ainda não abriu
  return Math.min(99, Math.floor((sum / s.reqs.length) * 100));
}

export type NodeState = "past" | "current" | "next" | "ahead";

export interface TreeNode {
  id: string;
  name: string;
  /** Coluna: negativa = formas anteriores, 0 = atual, 1 = próximas, 2+ = mais à frente. */
  depth: number;
  /** Linha (layout em árvore: folhas em sequência, pai no meio dos filhos). */
  row: number;
  state: NodeState;
  /** A espécie existe no content pack (senão o caminho fica "indisponível" e sem sprite). */
  known: boolean;
  stage?: number;
  /** De onde chega (aresta), nível/stats exigidos e a % (só nós à frente). */
  from?: string;
  status?: PathStatus;
  pct?: number;
  /** Ramifica daqui (vem de forksAhead). */
  fork: boolean;
}

export interface EvoTree {
  nodes: TreeNode[];
  edges: { from: string; to: string }[];
  rows: number;
  minDepth: number;
  maxDepth: number;
}

/** Pai de uma espécie no grafo de caminhos (primeira que leva a ela). */
function parentOf(mc: MoveContent, id: string): string | undefined {
  for (const [from, list] of Object.entries(mc.paths)) if (list.some((p) => p.to === id)) return from;
  return undefined;
}

/**
 * Árvore da linha do parceiro: até `back` formas anteriores (em linha) e até `ahead` estágios à frente. A % de cada
 * nó à frente é a do caminho que chega nele, calculada contra o nível/stats ATUAIS (nos estágios 2+ é referência).
 */
export function evoTree(content: WorldContent, s: Pick<HoloSubject, "speciesId" | "level" | "stats">, ahead = 3, back = 2): EvoTree {
  const mc = content.moves;
  const known = (id: string) => !!content.species[id];
  const forks = new Set(forksAhead(mc, s.speciesId, ahead + 1));
  const nodes = new Map<string, TreeNode>();
  const edges: { from: string; to: string }[] = [];
  const mk = (id: string, depth: number, state: NodeState, extra: Partial<TreeNode> = {}): TreeNode => ({
    id,
    name: content.species[id]?.name ?? id,
    depth,
    row: 0,
    state,
    known: known(id),
    stage: content.species[id]?.stage,
    fork: forks.has(id),
    ...extra,
  });
  // para trás: cadeia simples (cada espécie tem um pai no grafo)
  const past: string[] = [];
  for (let id = parentOf(mc, s.speciesId), i = 0; id && i < back && !past.includes(id) && id !== s.speciesId; id = parentOf(mc, id), i++) past.unshift(id);
  past.forEach((id, i) => nodes.set(id, mk(id, i - past.length, "past", { fork: false })));
  for (let i = 1; i < past.length; i++) edges.push({ from: past[i - 1], to: past[i] });
  if (past.length) edges.push({ from: past[past.length - 1], to: s.speciesId });
  nodes.set(s.speciesId, mk(s.speciesId, 0, "current"));
  // para frente: BFS pelos caminhos
  let frontier = [s.speciesId];
  for (let depth = 1; depth <= ahead && frontier.length; depth++) {
    const next: string[] = [];
    for (const from of frontier) {
      for (const st of pathStatuses(mc, from, s.level, s.stats, known)) {
        const to = st.path.to;
        if (nodes.has(to)) continue;
        nodes.set(to, mk(to, depth, depth === 1 ? "next" : "ahead", { from, status: st, pct: pathPct(st) }));
        edges.push({ from, to });
        next.push(to);
      }
    }
    frontier = next;
  }
  // layout: folhas em linhas seguidas (ordem do JSON), pai no meio dos filhos; passado na linha do atual
  const kids = (id: string) => edges.filter((e) => e.from === id && nodes.get(e.to)!.depth > nodes.get(id)!.depth).map((e) => e.to);
  let leaf = 0;
  const place = (id: string): number => {
    const ch = kids(id);
    const n = nodes.get(id)!;
    n.row = ch.length ? ch.map(place).reduce((a, b) => a + b, 0) / ch.length : leaf++;
    return n.row;
  };
  const curRow = place(s.speciesId);
  for (const id of past) nodes.get(id)!.row = curRow;
  const all = [...nodes.values()];
  return { nodes: all, edges, rows: Math.max(1, leaf), minDepth: Math.min(0, ...all.map((n) => n.depth)), maxDepth: Math.max(0, ...all.map((n) => n.depth)) };
}

/** Requisitos que faltam, em texto (REQ_PT), para o nó e para o tooltip. */
export function missingText(reqs: ReqCheck[]): string {
  const miss = reqs.filter((r) => !r.ok);
  return miss.map((r) => (r.stat === "level" ? `Nv.${r.need} (atual ${r.have})` : `${REQ_PT[r.stat]} ${r.need}+ (atual ${r.have})`)).join(" · ");
}

/** Multiplicadores de afinidade (affinityChart do content pack): o que o parceiro bate forte e o que bate forte nele. */
export function affinityMatchups(content: WorldContent, aff: string): { strong: { aff: string; mul: number }[]; weak: { aff: string; mul: number }[]; resist: { aff: string; mul: number }[] } {
  const chart = content.affinityChart ?? {};
  const others = Object.keys(chart);
  const strong = others.map((o) => ({ aff: o, mul: chart[aff]?.[o] ?? 1 })).filter((x) => x.mul > 1);
  const inc = others.map((o) => ({ aff: o, mul: chart[o]?.[aff] ?? 1 }));
  return { strong, weak: inc.filter((x) => x.mul > 1), resist: inc.filter((x) => x.mul < 1) };
}

const mulTxt = (m: number) => `×${m.toFixed(2).replace(/0$/, "").replace(".", ",")}`;
const affList = (xs: { aff: string; mul: number }[]) => (xs.length ? xs.map((x) => `<span class="chip aff-${x.aff}">${AFFINITY_PT[x.aff] ?? x.aff} ${mulTxt(x.mul)}</span>`).join("") : `<span class="dim">—</span>`);

/** Anel de progresso de 24 px (conic-gradient), com a % ao lado. */
function ring(pct: number, eligible: boolean): string {
  return `<i class="hc-ring${eligible ? " ok" : ""}" style="--p:${pct}" aria-hidden="true"></i><b class="hc-pct" data-testid="hc-pct">${pct}%</b>`;
}

function sprite(id: string, size: number, cls = ""): string {
  return `<span class="hc-sp ${cls}" style="width:${size}px;height:${size}px"><span class="q">?</span><canvas width="${size}" height="${size}" data-species="${esc(id)}"></canvas></span>`;
}

const STAT_ROWS: [keyof StatBlock, string, number][] = [
  ["hp", "PV", 0],
  ["atk", "Ataque", 60],
  ["def", "Defesa", 60],
  ["spd", "Velocidade", 60],
];

const bar = (v: number, max: number) => `<div class="dg-bar"><i style="width:${Math.max(0, Math.min(100, Math.round((v / Math.max(1, max)) * 100)))}%"></i></div>`;

/**
 * Digivice VI 1.0 §4.6 — Perfil do Digimon: retrato no anel de scanner, estágio/atributo, PV/XP e a próxima forma.
 * Metade de cima da antiga ficha; a lógica de cálculo é a mesma (só a apresentação foi dividida em 2 blocos).
 */
export function holoProfileHtml(content: WorldContent, s: HoloSubject): string {
  const sp = content.species[s.speciesId];
  const aff = sp?.affinity ?? "free";
  const own = pathStatuses(content.moves, s.speciesId, s.level, s.stats, (id) => !!content.species[id]);
  const best = own.map((st) => ({ st, pct: pathPct(st) })).sort((a, b) => b.pct - a.pct)[0];
  return `<div class="hc-head">
      <div class="hc-scan" data-testid="hc-scan"><i class="hc-sweep" aria-hidden="true"></i><i class="hc-grid" aria-hidden="true"></i>${sprite(s.speciesId, 96, "big")}</div>
      <div class="hc-id">
        <h3>${esc(s.name)} <span>Nv.${s.level}</span></h3>
        <div class="chips">${sp ? `<span class="chip">${STAGE_PT[sp.stage] ?? `Estágio ${sp.stage}`}</span><span class="chip aff-${aff}">${AFFINITY_PT[aff] ?? aff}</span>` : ""}<span class="chip dim">${esc(sp?.name ?? s.speciesId)}</span></div>
        <div class="hc-vit"><label>PV</label>${bar(s.hp, s.maxHp).replace("dg-bar", "dg-bar hp")}<em>${s.hp}/${s.maxHp}</em></div>
        ${s.xp ? `<div class="hc-vit"><label>XP</label>${bar(s.xp.xp, s.xp.next)}<em>${s.xp.xp}/${s.xp.next}</em></div>` : ""}
      </div>
    </div>
    <div class="dg-sub">Próxima evolução</div>
    ${
      best
        ? `<button type="button" class="hc-next" data-hc-tab="tree" data-testid="hc-next">${ring(best.pct, best.st.eligible)}<span><b>${esc(content.species[best.st.path.to]?.name ?? best.st.path.to)}</b>${own.length > 1 ? ` <small>+${own.length - 1} caminho${own.length > 2 ? "s" : ""}</small>` : ""}<small>${best.st.eligible ? "pronta para evoluir" : `falta: ${esc(missingText(best.st.reqs))}`}</small></span><em>Ver árvore ›</em></button>`
        : `<p class="note">Forma final nesta prova: sem caminho de evolução.</p>`
    }`;
}

/** Digivice VI 1.0 §4.7 — Atributos do Digimon: PV/Ataque/Defesa/Velocidade com barra e as afinidades. */
export function holoAttrsHtml(content: WorldContent, s: HoloSubject): string {
  const aff = content.species[s.speciesId]?.affinity ?? "free";
  const m = affinityMatchups(content, aff);
  const stats = STAT_ROWS.map(([k, label, max]) => `<tr data-stat="${k}"><th>${label}</th><td>${s.stats[k]}</td><td>${bar(s.stats[k], max || Math.ceil(s.stats.hp * 1.2))}</td></tr>`).join("");
  return `<div class="dg-sub">Atributos</div>
    <table class="hc-stats">${stats}</table>
    <div class="dg-sub">Afinidade · ${esc(AFFINITY_PT[aff] ?? aff)}</div>
    <dl class="hc-aff" data-testid="hc-aff">
      <dt>Bate forte em</dt><dd>${affList(m.strong)}</dd>
      <dt>Sofre mais de</dt><dd>${affList(m.weak)}</dd>
      <dt>Resiste a</dt><dd>${affList(m.resist)}</dd>
    </dl>`;
}

/** Ficha completa (Perfil + Atributos) — a mesma ficha de antes, montada com os 2 blocos. */
export function holoCardHtml(content: WorldContent, s: HoloSubject): string {
  return `<div class="hc-card" data-testid="hc-card">${holoProfileHtml(content, s)}${holoAttrsHtml(content, s)}</div>`;
}

/** Coluna e linha da árvore: um nó ocupa até ~124×164 px (moldura 64 + nome + estágio + anel de 24 + o que falta em 2 linhas, ou o botão Evoluir). */
const COL_W = 132;
const ROW_H = 172;
/** Do topo da linha ao centro do sprite (o nó é deslocado -40 px no CSS: o sprite fica no ponto da aresta). */
const ROW_TOP = 48;

/** Aba "Evolução": a árvore com um anel de % por nó, o que falta escrito no próprio nó e no tooltip. */
export function evoTreeHtml(content: WorldContent, s: HoloSubject): string {
  const t = evoTree(content, s);
  const w = (t.maxDepth - t.minDepth + 1) * COL_W;
  const h = t.rows * ROW_H;
  const pos = (n: TreeNode) => ({ x: (n.depth - t.minDepth) * COL_W + COL_W / 2, y: n.row * ROW_H + ROW_TOP });
  const byId = new Map(t.nodes.map((n) => [n.id, n]));
  const lines = t.edges
    .map((e) => {
      const a = pos(byId.get(e.from)!);
      const b = pos(byId.get(e.to)!);
      const n = byId.get(e.to)!;
      const mx = (a.x + b.x) / 2;
      // traço de circuito: horizontal, degrau vertical no meio, horizontal
      return `<path d="M${a.x + 34} ${a.y}H${mx}V${b.y}H${b.x - 34}" class="hc-edge ${n.state}${n.status?.eligible ? " ok" : ""}"/>`;
    })
    .join("");
  const nodes = t.nodes
    .map((n) => {
      const p = pos(n);
      const st = n.status;
      const miss = st ? missingText(st.reqs) : "";
      const pref = n.from && s.evoPrefs?.[n.from] === n.id;
      const tip =
        n.state === "past"
          ? "Forma anterior"
          : n.state === "current"
            ? "Forma atual"
            : !n.known
              ? "Espécie ainda indisponível nesta versão"
              : st?.eligible
                ? "Todos os requisitos cumpridos"
                : `Falta: ${miss}`;
      const reqs = st ? `<ul class="hc-reqs">${st.reqs.map((r) => `<li class="${r.ok ? "ok" : "no"}">${r.ok ? "✓" : "✗"} ${REQ_PT[r.stat]} ${r.need}${r.stat === "level" ? "" : "+"} <small>(${r.have})</small></li>`).join("")}</ul>` : "";
      return `<div class="hc-node ${n.state}${st?.eligible ? " ok" : ""}${n.known ? "" : " unknown"}${n.fork ? " fork" : ""}${n.depth === t.maxDepth && n.depth > t.minDepth ? " tip-l" : ""}" data-node="${esc(n.id)}" data-state="${n.state}"${n.pct !== undefined ? ` data-pct="${n.pct}"` : ""} style="left:${p.x}px;top:${p.y}px" tabindex="0" title="${esc(`${n.name}: ${tip}`)}">
        ${sprite(n.id, 48)}
        <b class="hc-name">${esc(n.name)}</b>
        ${n.stage ? `<small class="hc-stage">${STAGE_PT[n.stage] ?? ""}</small>` : ""}
        ${st ? `<div class="hc-prog">${ring(n.pct!, st.eligible)}</div>` : n.state === "current" ? `<div class="hc-prog"><em class="hc-here">VOCÊ</em></div>` : ""}
        ${st && !st.eligible ? `<small class="hc-miss" data-testid="hc-miss">${n.known ? `Falta: ${esc(miss)}` : "Indisponível"}</small>` : ""}
        ${pref ? `<small class="hc-pref">Preferido</small>` : ""}
        ${st && st.eligible && n.state === "next" && s.canEvolve ? `<button type="button" class="dg-cta hc-evolve" data-evolve-to="${esc(n.id)}">Evoluir</button>` : ""}
        ${reqs ? `<div class="hc-tip" role="tooltip"><b>${esc(n.name)}</b>${reqs}${st?.path.source ? `<small>Ramo: ${esc(st.path.source)}</small>` : ""}${n.state === "ahead" ? `<small>Contra os atributos de hoje (referência).</small>` : ""}</div>` : ""}
      </div>`;
    })
    .join("");
  const nForks = t.nodes.filter((n) => n.fork).length;
  return `<div class="hc-tree-wrap" data-testid="hc-tree">
    <p class="lead">A % de cada caminho é a média dos requisitos cumpridos (nível e atributos). Passe o mouse ou o foco num nó para ver o que falta.</p>
    <div class="hc-tree" style="width:${w}px;height:${h}px">
      <svg class="hc-lines" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" shape-rendering="crispEdges">${lines}</svg>
      ${nodes}
    </div>
    <p class="note">${nForks ? `Ramifica em ${nForks} ponto${nForks > 1 ? "s" : ""} da linha: com 2+ caminhos elegíveis, quem escolhe é você.` : "Linha sem ramificação nesta prova."} Estágios depois do próximo usam os atributos de hoje só como referência.</p>
  </div>`;
}

export type HoloTab = "card" | "tree";

/** Corpo do painel: abas Ficha / Evolução. */
export function holoPanelHtml(content: WorldContent, s: HoloSubject | undefined, tab: HoloTab): string {
  if (!s) return `<p class="note">Sem parceiro ativo.</p>`;
  return `<div class="hc" data-testid="holo" data-tab="${tab}">
    <div class="dg-tabs" role="tablist">
      <button type="button" class="dg-tab${tab === "card" ? " on" : ""}" role="tab" aria-selected="${tab === "card"}" data-hc-tab="card">Ficha</button>
      <button type="button" class="dg-tab${tab === "tree" ? " on" : ""}" role="tab" aria-selected="${tab === "tree"}" data-hc-tab="tree" data-testid="hc-tab-tree">Evolução</button>
    </div>
    ${tab === "card" ? holoCardHtml(content, s) : evoTreeHtml(content, s)}
  </div>`;
}
