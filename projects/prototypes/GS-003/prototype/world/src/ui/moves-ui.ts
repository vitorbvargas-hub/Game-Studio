// Golpes no HUD (pt-BR): barra de 4 golpes do Digimon ativo com ícone e recarga radial, aba "Golpes" do modal
// Equipe & Box (slots ativos, aprendidos, "Trocar") e o editor de prioridade do AUTO. Só monta HTML e lê estado;
// as mudanças saem como intents (set_moves, set_auto_priority, use_move), que a sim aceita ou recusa.

import { defaultAutoRules, initialLoadout, MOVE_SLOTS, type MoveContent } from "../sim/moves";
import { TICK_MS } from "../sim/params";
import type { AutoCond, AutoRule, MoveDef, StatBlock } from "../sim/types";

/** Estado de golpes da parceira ativa, montado a partir da sim (somente leitura). */
export interface MovesView {
  id: string;
  speciesId: string;
  name: string;
  level: number;
  mp: number;
  maxMp: number;
  learned: string[];
  moves: (string | null)[];
  autoRules: AutoRule[];
  cd: Record<string, number>;
  queued?: string;
  inCombat: boolean;
  evolve?: { toName: string; level: number; ready: boolean; branching?: boolean };
  /** Stats atuais (requisitos de evolução). */
  stats?: StatBlock;
  /** Preferências do Auto-evoluir por espécie (só do jogador local). */
  evoPrefs?: Record<string, string>;
}

export const KIND_PT: Record<string, string> = { physical: "Físico", special: "Especial", buff: "Buff", debuff: "Debuff", heal: "Cura" };
export const ELEMENT_PT: Record<string, string> = {
  fire: "Fogo",
  ice: "Gelo",
  water: "Água",
  thunder: "Trovão",
  wind: "Vento",
  light: "Luz",
  dark: "Trevas",
  neutral: "Neutro",
};
export const SHAPE_PT: Record<string, string> = { single: "Alvo único", area: "Área", line: "Linha", projectile: "Projétil", self: "Em si" };
export const COND_PT: Record<AutoCond, string> = {
  always: "Sempre",
  target_hp_below_pct: "PV do alvo abaixo de",
  self_hp_below_pct: "Meu PV abaixo de",
  ally_hp_below_pct: "PV do aliado abaixo de",
  buff_not_active: "Se o efeito não estiver ativo",
};
const STAT_PT: Record<string, string> = { atk: "Ataque", def: "Defesa", spd: "Velocidade" };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const secs = (ticks: number) => `${((ticks * TICK_MS) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} s`;

/** Linha curta de atributos do golpe, em pt-BR. */
export function moveSummary(m: MoveDef): string {
  const parts = [KIND_PT[m.type], ELEMENT_PT[m.element] ?? m.element, SHAPE_PT[m.target === "self" ? "self" : m.shape] ?? m.shape];
  const pw = m.type === "buff" || m.type === "debuff" ? (m.effect ? `${STAT_PT[m.effect.stat]} ${m.effect.mult >= 1 ? "+" : "−"}${Math.round(Math.abs(m.effect.mult - 1) * 100)}% por ${secs(m.effect.ticks)}` : "") : `Poder ${m.power}`;
  return [...parts, pw, `${m.cost} MP`, m.cooldownTicks ? `recarga ${secs(m.cooldownTicks)}` : "sem recarga"].filter(Boolean).join(" · ");
}

function chips(m: MoveDef): string {
  return `<span class="chip k-${m.type}">${KIND_PT[m.type]}</span><span class="chip e-${m.element}">${ELEMENT_PT[m.element] ?? m.element}</span><span class="chip">${SHAPE_PT[m.target === "self" ? "self" : m.shape] ?? m.shape}</span>`;
}

// ---------- barra de golpes (HUD) ----------

export function moveBarHtml(): string {
  return `<div class="hud-moves" data-testid="move-bar">
    ${Array.from({ length: MOVE_SLOTS }, (_, i) => `<button class="mv empty" data-mv="${i}" title="Slot ${i + 1} vazio"><canvas width="24" height="24"></canvas><i class="cd"></i><b class="cdt"></b><span class="key">${i + 1}</span><span class="mp"></span></button>`).join("")}
    <div class="mpbar" title="MP (energia)"><i></i><span data-testid="mp">MP</span></div>
  </div>`;
}

/** Atualiza a barra in-place (sem recriar botões): ícone só quando o golpe do slot muda. */
export function updateMoveBar(root: HTMLElement, mc: MoveContent, v: MovesView, paintIcon: (c: HTMLCanvasElement, m: MoveDef | undefined) => void): void {
  root.querySelectorAll<HTMLButtonElement>(".mv").forEach((b, i) => {
    const id = v.moves[i];
    const m = id ? mc.moves[id] : undefined;
    if (b.dataset.move !== (id ?? "")) {
      b.dataset.move = id ?? "";
      b.classList.toggle("empty", !m);
      b.title = m ? `${m.name} — ${moveSummary(m)} (tecla ${i + 1})` : `Slot ${i + 1} vazio`;
      b.querySelector<HTMLElement>(".mp")!.textContent = m ? String(m.cost) : "";
      paintIcon(b.querySelector("canvas")!, m);
    }
    const left = id ? v.cd[id] ?? 0 : 0;
    const frac = m && m.cooldownTicks > 0 ? Math.min(1, left / m.cooldownTicks) : 0;
    b.style.setProperty("--cd", frac.toFixed(3));
    b.querySelector<HTMLElement>(".cdt")!.textContent = left > 0 ? String(Math.ceil((left * TICK_MS) / 1000)) : "";
    b.classList.toggle("cooling", left > 0);
    b.classList.toggle("nomp", !!m && v.mp < m.cost);
    b.classList.toggle("queued", !!id && v.queued === id);
  });
  const bar = root.querySelector<HTMLElement>(".mpbar i");
  if (bar) bar.style.width = `${Math.round((v.mp / Math.max(1, v.maxMp)) * 100)}%`;
  const t = root.querySelector<HTMLElement>('[data-testid="mp"]');
  if (t) t.textContent = `MP ${Math.floor(v.mp)}/${v.maxMp}`;
}

// ---------- aba Golpes (modal) ----------

/** Dados da aba para um Digimon que NÃO é o ativo (equipe/box da cena): só leitura, pelo learnset. */
export function readOnlyView(mc: MoveContent, speciesId: string, name: string, level: number): MovesView {
  const lo = initialLoadout(mc, speciesId, level);
  return { id: "", speciesId, name, level, mp: 0, maxMp: 0, learned: lo.learned, moves: lo.moves, autoRules: [], cd: {}, inCombat: false };
}

/** Regras na ordem mostrada: as salvas (só golpes equipados) e depois os equipados que faltam, em `always`. */
export function rulesFor(v: MovesView): AutoRule[] {
  const eq = v.moves.filter((s): s is string => !!s);
  return [...v.autoRules.filter((r) => eq.includes(r.moveId)), ...eq.filter((id) => !v.autoRules.some((r) => r.moveId === id)).map((moveId) => ({ moveId, cond: "always" as AutoCond }))];
}

/**
 * Editor da prioridade do AUTO (gambit simples, §2.5): ordem, condição, % e "usar" por golpe equipado. Usado na aba
 * Golpes do Equipe & Box e na preparação da Arena; as edições saem por editRules (mesma regra nos dois lugares).
 */
export function autoRulesEditorHtml(mc: MoveContent, rules: AutoRule[], editable: boolean, title = "Prioridade do AUTO"): string {
  const ruleRow = (r: AutoRule, i: number) => {
    const m = mc.moves[r.moveId];
    const needsPct = r.cond === "target_hp_below_pct" || r.cond === "self_hp_below_pct" || r.cond === "ally_hp_below_pct";
    return `<li data-rule="${i}" class="${r.off ? "off" : ""}">
      <span class="n">${i + 1}</span><canvas class="mi" width="24" height="24" data-icon="${r.moveId}"></canvas><b>${esc(m?.name ?? r.moveId)}</b>
      <select data-cond="${i}" ${editable ? "" : "disabled"} aria-label="Condição">${(Object.keys(COND_PT) as AutoCond[]).filter((c) => c !== "ally_hp_below_pct").map((c) => `<option value="${c}"${c === r.cond ? " selected" : ""}>${COND_PT[c]}</option>`).join("")}</select>
      ${needsPct ? `<input type="number" min="1" max="99" step="5" value="${r.pct ?? 50}" data-pct="${i}" ${editable ? "" : "disabled"} aria-label="Porcentagem" /><span>%</span>` : "<span class='pad'></span>"}
      <label class="use"><input type="checkbox" data-on="${i}" ${r.off ? "" : "checked"} ${editable ? "" : "disabled"} />usar</label>
      <button class="mini" data-up="${i}" ${editable && i > 0 ? "" : "disabled"} title="Subir na prioridade">▲</button>
      <button class="mini" data-down="${i}" ${editable && i < rules.length - 1 ? "" : "disabled"} title="Descer na prioridade">▼</button>
    </li>`;
  };
  return `<div class="sec"><b>${esc(title)}</b></div>
        <ol class="rules">${rules.map(ruleRow).join("")}</ol>
        <p class="note">O AUTO tenta de cima para baixo: usa o primeiro golpe pronto, com MP e cuja condição vale. Se nenhum servir, usa ${esc(mc.moves[mc.basicMoveId]?.name ?? "o básico")} (sem custo).</p>
        ${editable ? `<button class="act" data-reset-rules>Restaurar padrão</button>` : ""}`;
}

/**
 * Aplica uma interação do editor de prioridade (clique em ▲/▼/Restaurar ou mudança de condição/%/usar) sobre uma
 * cópia das regras. Devolve as regras novas, ou undefined se o evento não era do editor.
 */
export function editRules(rules: AutoRule[], slots: (string | null)[], ev: { type: string; target: HTMLElement }): AutoRule[] | undefined {
  const r = rules.map((x) => ({ ...x }));
  const t = ev.target;
  if (ev.type === "click") {
    const up = t.closest<HTMLElement>("[data-up]")?.dataset.up;
    const down = t.closest<HTMLElement>("[data-down]")?.dataset.down;
    if (up !== undefined || down !== undefined) {
      const i = Number(up ?? down);
      const j = up !== undefined ? i - 1 : i + 1;
      if (j < 0 || j >= r.length) return undefined;
      [r[i], r[j]] = [r[j], r[i]];
      return r;
    }
    if (t.closest("[data-reset-rules]")) return defaultAutoRules(slots);
    return undefined;
  }
  const el = t as HTMLInputElement | HTMLSelectElement;
  const d = el.dataset;
  if (d.cond === undefined && d.pct === undefined && d.on === undefined) return undefined;
  const i = Number(d.cond ?? d.pct ?? d.on);
  if (!r[i]) return undefined;
  if (d.cond !== undefined) {
    r[i].cond = el.value as AutoCond;
    if (r[i].cond.endsWith("_pct") && r[i].pct === undefined) r[i].pct = r[i].cond === "target_hp_below_pct" ? 30 : 40;
  } else if (d.pct !== undefined) r[i].pct = Number(el.value);
  else if (d.on !== undefined) r[i].off = !(el as HTMLInputElement).checked;
  return r;
}

export function movesTabHtml(mc: MoveContent, v: MovesView, editable: boolean, swapping?: string, extra = ""): string {
  const ls = mc.learnsets[v.speciesId] ?? [];
  const locked = ls.filter((e) => !v.learned.includes(e.move));
  const canSwap = editable && !v.inCombat;
  const slot = (id: string | null, i: number) => {
    const m = id ? mc.moves[id] : undefined;
    const pick = swapping ? " pick" : "";
    if (!m) return `<div class="mslot empty${pick}" data-slot="${i}"><span class="n">${i + 1}</span><em>vazio</em>${swapping ? "<small>colocar aqui</small>" : ""}</div>`;
    return `<div class="mslot${pick}" data-slot="${i}" title="${esc(moveSummary(m))}">
      <span class="n">${i + 1}</span><canvas class="mi" width="24" height="24" data-icon="${m.id}"></canvas>
      <div><b>${esc(m.name)}</b><div class="chips">${chips(m)}</div><small>${m.type === "buff" || m.type === "debuff" ? "" : `Poder ${m.power} · `}${m.cost} MP · ${m.cooldownTicks ? secs(m.cooldownTicks) : "—"}</small></div>
      ${canSwap && !swapping && v.moves.filter(Boolean).length > 1 ? `<button class="mini" data-clear="${i}" title="Esvaziar o slot (o golpe continua aprendido)">×</button>` : ""}
      ${swapping ? "<small class='here'>trocar aqui</small>" : ""}
    </div>`;
  };
  const row = (id: string) => {
    const m = mc.moves[id];
    if (!m) return "";
    const at = v.moves.indexOf(id);
    const act = at >= 0 ? `<span class="tag">Slot ${at + 1}</span>` : canSwap ? `<button class="act swap${swapping === id ? " on" : ""}" data-swap="${id}">${swapping === id ? "Cancelar" : "Trocar"}</button>` : "";
    return `<li class="${at >= 0 ? "eq" : ""}${swapping === id ? " sel" : ""}"><canvas class="mi" width="24" height="24" data-icon="${m.id}"></canvas><div><b>${esc(m.name)}</b><small>${esc(moveSummary(m))}</small></div>${act}</li>`;
  };
  return `<div class="moves-tab" data-testid="moves-tab">
    <div class="mt-head"><h3>${esc(v.name)} <span>Nv.${v.level}</span></h3>
      ${editable ? `<div class="row"><label>MP</label><div class="hud-bar mpb"><i style="width:${Math.round((v.mp / Math.max(1, v.maxMp)) * 100)}%"></i></div><em>${Math.floor(v.mp)}/${v.maxMp}</em></div>` : ""}
    </div>
    ${!editable ? `<p class="note">Somente o Digimon ativo troca golpes nesta prova; aqui você vê o kit dele pelo nível.</p>` : v.inCombat ? `<p class="note warn">Em combate: a troca de golpes fica liberada quando a luta acabar.</p>` : swapping ? `<p class="note gold">Escolha o slot para <b>${esc(mc.moves[swapping]?.name ?? "")}</b>.</p>` : ""}
    <div class="sec"><b>Golpes ativos</b> <span>${v.moves.filter(Boolean).length}/4</span></div>
    <div class="mslots">${v.moves.map(slot).join("")}</div>
    <div class="cols">
      <div><div class="sec"><b>Aprendidos</b> <span>${v.learned.length}</span></div>
        <ul class="mlist">${v.learned.map(row).join("")}${locked.map((e) => `<li class="locked"><canvas class="mi" width="24" height="24" data-icon="${e.move}"></canvas><div><b>${esc(mc.moves[e.move]?.name ?? e.move)}</b><small>aprende no Nv.${e.level}</small></div><span class="tag">Nv.${e.level}</span></li>`).join("")}</ul>
      </div>
      <div>${autoRulesEditorHtml(mc, rulesFor(v), editable)}</div>
    </div>
    ${extra}
  </div>`;
}
