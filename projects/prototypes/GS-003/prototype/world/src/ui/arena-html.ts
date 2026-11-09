// Telas da Arena (pt-BR), só HTML a partir de dados prontos: entrada (Automático/Manual + rating local + histórico),
// seleção de equipe com os Digimon do save, oponente fantasma com poder/aviso e Arena Nivelada, HUD de batalha
// do 3v3 automático e resultado. Sem estado de jogo.

import type { ArenaComp, ArenaMode, ArenaRecord, ArenaSave, GhostSource, RosterEntry } from "../save/arena-league";
import { historyOf } from "../save/arena-league";
import type { ArenaTeam, SideStats } from "../sim/arena";
import type { WorldContent } from "../sim/species";
import type { AutoRule } from "../sim/types";
import { icon } from "./icons";
import { autoRulesEditorHtml, ELEMENT_PT, moveSummary } from "./moves-ui";

export const STAGE_PT: Record<number, string> = { 1: "Bebê", 2: "Criança", 3: "Adulto", 4: "Perfeito", 5: "Supremo" };
export const AFFINITY_PT: Record<string, string> = { vaccine: "Vacina", data: "Dados", virus: "Vírus", free: "Livre" };
export const MODE_PT: Record<ArenaMode, string> = { auto: "Automático 3v3", manual: "Manual 1v1 · melhor de 3" };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const RESULT_PT: Record<ArenaRecord["result"], string> = { win: "Vitória", loss: "Derrota", draw: "Empate" };

function sp(content: WorldContent, id: string): string {
  return content.species[id]?.name ?? id;
}

// ---------- entrada ----------

export function arenaEntryHtml(content: WorldContent, a: ArenaSave): string {
  const hist = (mode: ArenaMode) => {
    const list = historyOf(a, mode).slice(0, 6);
    return list.length
      ? `<ol class="ar-hist">${list
          .map(
            (h) => `<li class="${h.result}"><em>${RESULT_PT[h.result]}${h.score ? ` ${h.score}` : ""}</em><span>${h.mine.map((m) => esc(sp(content, m.speciesId))).join(", ")} <i>vs</i> ${esc(h.foeName)}</span><small>${new Date(h.date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</small></li>`,
          )
          .join("")}</ol>`
      : `<p class="note">Nenhuma partida ainda.</p>`;
  };
  const card = (mode: ArenaMode, title: string, desc: string, ctrl: string) => `
    <button class="ar-mode" data-mode="${mode}" data-testid="mode-${mode}">
      <b>${icon(mode === "auto" ? "evo" : "arena", 18)} ${title}</b>
      <span>${desc}</span>
      <small>${ctrl}</small>
    </button>`;
  return `<div class="ar-entry" data-testid="arena-entry">
    <div class="ar-modes">
      ${card("auto", "Automático", "3 contra 3. Você monta a formação e a prioridade de golpes; a luta é toda do AUTO.", "Formação · editor de prioridade · composições salvas")}
      <button class="ar-mode" disabled data-testid="mode-manual"><b>${icon("arena", 18)} Manual</b><span>1 contra 1, melhor de 3 (formato do vídeo de referência).</span><small>Em breve (Fase 4)</small></button>
    </div>
    <div class="ar-cols">
      ${(["auto", "manual"] as ArenaMode[])
        .map(
          (m) => `<section><div class="sec"><b>${MODE_PT[m]}</b><span>rating local <b data-testid="rating-${m}">${a.rating[m]}</b></span></div>${hist(m)}</section>`,
        )
        .join("")}
    </div>
    <p class="note">Protótipo local: o oponente é um <b>fantasma</b> (um time salvo seu ou um dos 3 Tamers da floresta), simulado aqui no seu aparelho. Sem rede, sem ranking: o rating é só um placeholder local.</p>
  </div>`;
}

// ---------- seleção ----------

export interface SelectView {
  mode: ArenaMode;
  content: WorldContent;
  roster: RosterEntry[];
  /** Refs escolhidas, na ordem da formação. */
  picks: string[];
  /** Ref cujo editor de prioridade está aberto (automático). */
  focus?: string;
  rules: Record<string, AutoRule[]>;
  comps: ArenaComp[];
  ghosts: GhostSource[];
  ghostId: string;
  ghost?: ArenaTeam;
  myPower: number;
  foePower: number;
  warning?: string;
  normalize: boolean;
  level?: number;
  message?: string;
}

function fighterRules(v: SelectView, ref: string): AutoRule[] {
  return v.rules[ref] ?? v.roster.find((r) => r.fighter.ref === ref)?.fighter.autoRules ?? [];
}

export function rosterCardHtml(v: SelectView, r: RosterEntry): string {
  const mc = v.content.moves;
  const at = v.picks.indexOf(r.fighter.ref);
  const moves = r.fighter.moves.map((id) => (id ? `<li title="${esc(moveSummary(mc.moves[id]))}">${esc(mc.moves[id]?.name ?? id)}</li>` : `<li class="dim">—</li>`)).join("");
  return `<button class="ar-card${at >= 0 ? " sel" : ""}${r.eligible ? "" : " off"}" data-pick="${r.fighter.ref}" ${r.eligible ? "" : "disabled"} data-testid="roster-card">
    <canvas width="40" height="40" data-sp="${r.fighter.speciesId}"></canvas>
    ${at >= 0 ? `<i class="ord">${at + 1}</i>` : ""}
    <div class="ar-card-b">
      <b>${esc(r.name)} <span>Nv.${r.fighter.level}</span></b>
      <small class="tags"><em>${r.source}</em> ${STAGE_PT[r.stage] ?? `Estágio ${r.stage}`} · ${AFFINITY_PT[r.affinity] ?? r.affinity} · ${ELEMENT_PT[r.element] ?? r.element}</small>
      <small class="st">PV ${r.stats.hp} · ATQ ${r.stats.atk} · DEF ${r.stats.def} · VEL ${r.stats.spd} · MP ${r.maxMp}${r.hpPct < 100 ? ` · ${r.hpPct}% PV` : ""}</small>
      <ul class="mv4">${moves}</ul>
      ${r.eligible ? "" : `<small class="warn">${esc(r.reason ?? "indisponível")}</small>`}
    </div>
  </button>`;
}

function teamSlotsHtml(v: SelectView): string {
  const slots = [0, 1, 2].map((i) => {
    const ref = v.picks[i];
    const r = ref ? v.roster.find((x) => x.fighter.ref === ref) : undefined;
    if (!r) return `<li class="empty"><span class="n">${i + 1}</span><em>vazio</em></li>`;
    return `<li class="${v.focus === ref ? "on" : ""}" data-focus="${ref}">
      <span class="n">${i + 1}</span><canvas width="28" height="28" data-sp="${r.fighter.speciesId}"></canvas><b>${esc(r.name)} <span>Nv.${r.fighter.level}</span></b>
      ${v.mode === "auto" ? `<button class="mini" data-up-pick="${i}" ${i > 0 ? "" : "disabled"} title="Entra antes">▲</button><button class="mini" data-down-pick="${i}" ${i < v.picks.length - 1 ? "" : "disabled"} title="Entra depois">▼</button>` : ""}
      <button class="mini" data-unpick="${ref}" title="Tirar do time">×</button>
    </li>`;
  });
  return `<ol class="ar-slots" data-testid="team-slots">${slots.join("")}</ol>`;
}

function ghostHtml(v: SelectView): string {
  const g = v.ghost;
  const list = v.ghosts
    .map((s) => `<label class="ar-ghost${s.id === v.ghostId ? " on" : ""}"><input type="radio" name="ghost" value="${s.id}" data-ghost="${s.id}" ${s.id === v.ghostId ? "checked" : ""} /><b>${esc(s.name)}</b><small>${esc(s.detail)}</small></label>`)
    .join("");
  const team = g
    ? `<ul class="ar-foe">${g.fighters.map((f) => `<li><canvas width="28" height="28" data-sp="${f.speciesId}"></canvas><b>${esc(sp(v.content, f.speciesId))}</b><span>Nv.${f.level}</span></li>`).join("")}</ul>`
    : "";
  return `<div class="sec"><b>Oponente (fantasma)</b></div><div class="ar-ghosts" data-testid="ghosts">${list}</div>${team}`;
}

export function arenaSelectHtml(v: SelectView): string {
  const focus = v.mode === "auto" && v.focus ? v.roster.find((r) => r.fighter.ref === v.focus) : undefined;
  const ready = v.picks.length > 0 && !!v.ghost;
  const few = v.roster.filter((r) => r.eligible).length < 3;
  return `<div class="ar-select" data-mode="${v.mode}" data-testid="arena-select">
    <div class="ar-left">
      <div class="sec"><b>Seus Digimon</b><span>parceira, equipe e Box do save · ${v.roster.length}</span></div>
      ${few ? `<p class="note warn">Seu save tem só ${v.roster.filter((r) => r.eligible).length} Digimon disponível(is): a partida usa ${v.mode === "manual" ? "os mesmos em mais de uma rodada" : "um time menor"}.</p>` : ""}
      <div class="ar-roster">${v.roster.map((r) => rosterCardHtml(v, r)).join("")}</div>
    </div>
    <div class="ar-mid">
      <div class="sec"><b>${v.mode === "auto" ? "Formação" : "Seu time"}</b><span>${v.picks.length}/3</span></div>
      ${teamSlotsHtml(v)}
      ${v.mode === "auto" ? `<p class="note">Quem está em 1 começa; no KO entra o próximo, com o PV que tiver.</p>` : `<p class="note">Antes de cada rodada você escolhe qual dos 3 entra (cada um luta uma rodada).</p>`}
      ${
        focus
          ? `<div class="ar-gambit" data-testid="gambit">${autoRulesEditorHtml(v.content.moves, fighterRules(v, focus.fighter.ref), true, `Prioridade do AUTO — ${focus.name}`)}</div>`
          : v.mode === "auto" && v.picks.length
            ? `<p class="note">Clique num Digimon da formação para editar a prioridade de golpes dele.</p>`
            : ""
      }
      ${
        v.mode === "auto"
          ? `<div class="ar-comp"><input type="text" maxlength="24" placeholder="Nome da composição" data-comp-name aria-label="Nome da composição" /><button class="act" data-save-comp ${v.picks.length ? "" : "disabled"}>Salvar composição</button></div>
             ${v.comps.length ? `<ul class="ar-comps">${v.comps.map((c) => `<li><b>${esc(c.name)}</b><span>${c.fighters.map((f) => esc(sp(v.content, f.speciesId))).join(", ")}</span><button class="mini" data-load-comp="${c.id}">Carregar</button></li>`).join("")}</ul>` : ""}`
          : ""
      }
    </div>
    <div class="ar-right">
      ${ghostHtml(v)}
      <div class="ar-power" data-testid="power"><span>Seu poder <b>${v.myPower}</b></span><span>Oponente <b>${v.foePower}</b></span></div>
      ${v.warning ? `<p class="note warn" data-testid="imbalance">${esc(v.warning)}</p>` : ""}
      <label class="ar-norm"><input type="checkbox" data-normalize ${v.normalize ? "checked" : ""} data-testid="normalize" /> Arena Nivelada <small>(opcional)</small></label>
      ${v.normalize ? `<p class="note gold" data-testid="normalize-on">Arena Nivelada ativa: todos lutam no Nv.${v.level} nesta partida (stats ajustados; golpes continuam os do save).</p>` : `<p class="note">Desligada: cada Digimon luta com os stats reais do save.</p>`}
      ${v.message ? `<p class="note warn" data-testid="arena-msg">${esc(v.message)}</p>` : ""}
      <button class="act gold ar-fight" data-fight ${ready ? "" : "disabled"} data-testid="fight">${icon("arena", 14)} LUTAR</button>
    </div>
  </div>`;
}

// ---------- HUD automático ----------

export function autoHudHtml(): string {
  return `<div class="ar-hud auto" data-testid="hud-auto">
    <div class="ar-top"><span class="tag">Automático 3v3</span><b class="timer" data-testid="timer">3:00</b><span class="speed"><button data-speed="1" class="on">×1</button><button data-speed="2">×2</button><button data-speed="4">×4</button><button data-skip>Pular</button></span></div>
    <div class="ar-side a" data-side="0"></div>
    <div class="ar-side b" data-side="1"></div>
    <ol class="ar-log" data-testid="arena-log"></ol>
  </div>`;
}

export interface FighterHud {
  speciesId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  active: boolean;
  ko: boolean;
}

export function sideHtml(title: string, list: FighterHud[]): string {
  return `<h4>${esc(title)}</h4>${list
    .map(
      (f) => `<div class="ar-f${f.active ? " active" : ""}${f.ko ? " ko" : ""}"><canvas width="28" height="28" data-sp="${f.speciesId}"></canvas><div><b>${esc(f.name)} <span>Nv.${f.level}</span></b><div class="bar hp"><i style="width:${Math.round((f.hp / Math.max(1, f.maxHp)) * 100)}%"></i></div><small>${f.ko ? "KO" : `${Math.ceil(f.hp)}/${f.maxHp}`}</small></div></div>`,
    )
    .join("")}`;
}

// ---------- resultado ----------

export interface ResultView {
  mode: ArenaMode;
  result: ArenaRecord["result"];
  score?: string;
  reason: string;
  sides: { name: string; species: { speciesId: string; level: number }[]; stats: SideStats }[];
  ratingBefore: number;
  ratingAfter: number;
}

export function resultHtml(content: WorldContent, r: ResultView): string {
  const side = (s: ResultView["sides"][number], cls: string) => `<div class="ar-rs ${cls}">
      <div class="sprites">${s.species.map((f) => `<canvas width="40" height="40" data-sp="${f.speciesId}"></canvas>`).join("")}</div>
      <b>${esc(s.name)}</b>
      <small>${s.species.map((f) => `${esc(sp(content, f.speciesId))} Nv.${f.level}`).join(" · ")}</small>
      <dl><dt>Dano</dt><dd data-testid="dmg-${cls}">${s.stats.damage}</dd><dt>Acertos</dt><dd data-testid="hits-${cls}">${s.stats.hits}</dd></dl>
    </div>`;
  const delta = r.ratingAfter - r.ratingBefore;
  return `<div class="ar-result ${r.result}" data-testid="arena-result">
    <h2 data-testid="result-title">${RESULT_PT[r.result]}</h2>
    ${r.score ? `<div class="ar-final" data-testid="final-score">${esc(r.score)}</div>` : ""}
    <p class="note">${esc(r.reason)} · ${MODE_PT[r.mode]} · rating local ${r.ratingAfter} (${delta >= 0 ? "+" : ""}${delta})</p>
    <div class="ar-rsides">${side(r.sides[0], "a")}${side(r.sides[1], "b")}</div>
    <div class="ar-rbtns"><button class="act gold" data-rematch data-testid="rematch">Revanche <kbd>R</kbd></button><button class="act" data-menu data-testid="menu">Menu <kbd>Esc</kbd></button></div>
  </div>`;
}
