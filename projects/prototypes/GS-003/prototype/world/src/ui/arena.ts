// Arena PvP local (GS-006): tela cheia por cima do mundo (o mundo fica pausado enquanto ela está aberta). Fluxo:
// entrada (Automático/Manual) → seleção com os Digimon do save + fantasma → batalha (WorldView + Presenter sobre a
// sim da Arena, os mesmos VFX do mundo) → resultado (histórico e rating local no save). A sim decide tudo; esta
// classe só junta input, chama stepAutoArena/stepRound e mostra o que voltou.

import {
  activeOf,
  availablePicks,
  createAutoArena,
  createManualMatch,
  fieldRect,
  normalizedLevel,
  runAutoArena,
  startRound,
  stepAutoArena,
  stepRound,
  type ArenaTeam,
  type AutoArena,
  type ManualMatch,
  type RoundResult,
  type Side,
} from "../sim/arena";
import type { WorldMap } from "../sim/map";
import { pxToSub } from "../sim/map";
import { TICK_MS } from "../sim/params";
import type { WorldContent } from "../sim/species";
import type { AutoRule, Entity, MoveDef, StatKey, WorldEvent } from "../sim/types";
import { snapshot } from "../sim/world";
import {
  arenaRoster,
  buildPlayerTeam,
  ghostSources,
  ghostTeam,
  imbalanceWarning,
  ownershipError,
  recordMatch,
  saveComp,
  teamPower,
  type ArenaMode,
  type ArenaSave,
  type OwnedDigimon,
  type RosterEntry,
} from "../save/arena-league";
import type { Presenter } from "../render/presenter";
import type { Camera, WorldView } from "../render/view";
import { drawFieldLines, drawStadium } from "../render/stadium";
import {
  AFFINITY_PT,
  arenaEntryHtml,
  arenaSelectHtml,
  autoHudHtml,
  manualHudHtml,
  MODE_PT,
  resultHtml,
  roundPickHtml,
  scoreDots,
  sideHtml,
  type FighterHud,
  type ResultView,
  type SelectView,
} from "./arena-html";
import { icon } from "./icons";
import { editRules, ELEMENT_PT } from "./moves-ui";

export interface ArenaDeps {
  root: HTMLElement;
  content: WorldContent;
  /** Digimon do save NESTE momento (parceira, equipe e Box). */
  owned(): OwnedDigimon;
  arena(): ArenaSave;
  /** Grava o bloco da Arena no save (o main persiste). */
  setArena(a: ArenaSave): void;
  portrait(speciesId: string, canvas: HTMLCanvasElement): void;
  moveIcon(c: HTMLCanvasElement, m: MoveDef | undefined): void;
  /** Visual da batalha num canvas: tiles do estádio carregados + o desenho extra (arquibancada). */
  makeView(canvas: HTMLCanvasElement, map: WorldMap, underlay: (ctx: CanvasRenderingContext2D, cam: Camera, now: number) => void): Promise<WorldView>;
  newPresenter(): Presenter;
  seed(): number;
  /** Depuração/capturas (?arenaRound=SEG): duração da rodada manual em ticks; padrão 90 s. */
  roundTicks?: number;
  onClose(): void;
}

type Screen = "entry" | "select" | "pick" | "battle" | "result";

interface Run {
  view: WorldView;
  presenter: Presenter;
  acc: number;
  last: number;
  speed: number;
  endAt?: number;
}

const STAT_SHORT: Record<StatKey, string> = { atk: "ATQ", def: "DEF", spd: "VEL" };
const clockText = (ticks: number) => {
  const s = Math.max(0, Math.ceil((ticks * TICK_MS) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export class ArenaScreen {
  readonly el: HTMLElement;
  private panel: HTMLElement;
  private stage: HTMLElement;
  private canvas: HTMLCanvasElement;
  private hud: HTMLElement;
  private screen: Screen = "entry";
  private mode: ArenaMode = "auto";
  private roster: RosterEntry[] = [];
  private picks: string[] = [];
  private rules: Record<string, AutoRule[]> = {};
  private focus?: string;
  private ghostId = "bot:bot1";
  private normalize = false;
  private message?: string;
  private teams?: [ArenaTeam, ArenaTeam];
  private auto?: AutoArena;
  private match?: ManualMatch;
  private run?: Run;
  private raf = 0;
  private scale = 2;
  private log: { text: string; side?: Side }[] = [];
  private lastHud = 0;
  private keys = new Set<string>();
  private held = new Set<number>();
  private fresh?: number;
  private mouse?: { x: number; y: number };
  private msgUntil = 0;
  private lastRoundText?: string;
  private iconKeys: string[] = [];
  private ratingBefore = 0;

  constructor(private readonly d: ArenaDeps) {
    const el = document.createElement("div");
    el.className = "arena";
    el.hidden = true;
    el.innerHTML = `
      <div class="ar-stage"><canvas class="ar-canvas"></canvas><div class="ar-hudroot"></div></div>
      <section class="ar-panel" role="dialog" aria-label="Arena">
        <header><h2>${icon("arena", 16)} ARENA <small class="ar-sub"></small></h2><button class="x" data-ar-back title="Voltar (Esc)">×</button></header>
        <div class="ar-body"></div>
      </section>`;
    d.root.appendChild(el);
    this.el = el;
    this.panel = el.querySelector(".ar-panel")!;
    this.stage = el.querySelector(".ar-stage")!;
    this.canvas = el.querySelector(".ar-canvas")!;
    this.hud = el.querySelector(".ar-hudroot")!;
    el.addEventListener("click", (e) => this.onClick(e));
    el.addEventListener("change", (e) => this.onChange(e));
    el.addEventListener("keydown", (e) => {
      if ((e.target as HTMLElement).closest("input, select")) e.stopPropagation();
    });
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this.canvas.addEventListener("pointermove", (e) => (this.mouse = { x: e.clientX, y: e.clientY }));
    this.canvas.addEventListener("pointerdown", (e) => {
      this.mouse = { x: e.clientX, y: e.clientY };
      const slot = e.button === 0 ? 0 : e.button === 2 ? 1 : undefined;
      if (slot === undefined || !this.match?.current) return;
      e.preventDefault();
      this.fresh = slot;
      this.held.add(slot);
    });
    window.addEventListener("pointerup", (e) => this.held.delete(e.button === 0 ? 0 : e.button === 2 ? 1 : -1));
    window.addEventListener("keydown", (e) => this.onKey(e, true));
    window.addEventListener("keyup", (e) => this.onKey(e, false));
    window.addEventListener("blur", () => {
      this.keys.clear();
      this.held.clear();
    });
    window.addEventListener("resize", () => this.isOpen && this.resize());
  }

  get isOpen(): boolean {
    return !this.el.hidden;
  }

  get state(): { screen: Screen; mode: ArenaMode; auto?: AutoArena; match?: ManualMatch; presenter?: Presenter; view?: WorldView } {
    return { screen: this.screen, mode: this.mode, auto: this.auto, match: this.match, presenter: this.run?.presenter, view: this.run?.view };
  }

  open(): void {
    this.el.hidden = false;
    this.show("entry");
  }

  close(): void {
    this.stopRun();
    this.el.hidden = true;
    this.d.onClose();
  }

  // ---------- telas ----------

  private show(s: Screen): void {
    this.screen = s;
    const battle = s === "battle";
    this.stage.hidden = !(battle || s === "result" || s === "pick");
    this.panel.hidden = battle;
    this.panel.classList.toggle("over", s === "result" || s === "pick");
    this.el.classList.toggle("in-battle", battle);
    if (!battle) this.hud.querySelector(".ar-banner")?.classList.remove("on");
    const sub = this.panel.querySelector(".ar-sub")!;
    sub.textContent = s === "entry" ? "protótipo local" : MODE_PT[this.mode];
    this.render();
  }

  private body(): HTMLElement {
    return this.panel.querySelector(".ar-body")!;
  }

  private render(): void {
    const b = this.body();
    if (this.screen === "entry") b.innerHTML = arenaEntryHtml(this.d.content, this.d.arena());
    else if (this.screen === "select") b.innerHTML = arenaSelectHtml(this.selectView());
    else if (this.screen === "pick" && this.match) {
      const m = this.match;
      b.innerHTML = roundPickHtml(this.d.content, m.rounds.length + 1, m.score, m.teams[0].fighters, availablePicks(m, 0), m.teams[1].name, this.lastRoundText);
    } else if (this.screen === "result") return;
    this.paint(b);
  }

  private paint(root: HTMLElement): void {
    for (const c of root.querySelectorAll<HTMLCanvasElement>("canvas[data-sp]")) {
      c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
      this.d.portrait(c.dataset.sp!, c);
    }
    for (const c of root.querySelectorAll<HTMLCanvasElement>("canvas[data-icon]")) this.d.moveIcon(c, this.d.content.moves.moves[c.dataset.icon!]);
  }

  private enterSelect(mode: ArenaMode): void {
    this.mode = mode;
    this.roster = arenaRoster(this.d.owned(), this.d.content);
    const eligible = this.roster.filter((r) => r.eligible);
    if (!this.picks.length || this.picks.some((p) => !eligible.some((r) => r.fighter.ref === p))) this.picks = eligible.slice(0, 3).map((r) => r.fighter.ref);
    this.focus = mode === "auto" ? this.picks[0] : undefined;
    this.message = undefined;
    this.show("select");
  }

  private needed(): number {
    return Math.min(3, this.roster.filter((r) => r.eligible).length);
  }

  private myTeam(): { team: ArenaTeam } | { error: string } {
    return buildPlayerTeam(this.d.owned(), this.d.content, this.picks.map((ref) => ({ ref, autoRules: this.mode === "auto" ? this.rules[ref] : undefined })), "Você");
  }

  private selectView(): SelectView {
    const mine = this.myTeam();
    const fighters = "team" in mine ? mine.team.fighters : [];
    const ghost = ghostTeam(this.d.content, this.d.arena(), this.ghostId, fighters);
    const level = ghost && fighters.length ? normalizedLevel([{ name: "", fighters }, ghost]) : undefined;
    const lv = this.normalize ? level : undefined;
    const myPower = teamPower(this.d.content, fighters, lv);
    const foePower = ghost ? teamPower(this.d.content, ghost, lv) : 0;
    const msg = this.message ?? (this.picks.length && this.picks.length < this.needed() ? `Escolha ${this.needed()} Digimon.` : undefined);
    return {
      mode: this.mode,
      content: this.d.content,
      roster: this.roster,
      picks: this.picks,
      focus: this.focus,
      rules: this.rules,
      comps: this.d.arena().comps,
      ghosts: ghostSources(this.d.arena()),
      ghostId: this.ghostId,
      ghost,
      myPower,
      foePower,
      warning: imbalanceWarning(myPower, foePower),
      normalize: this.normalize,
      level,
      message: msg,
    };
  }

  // ---------- interação ----------

  private onClick(e: MouseEvent): void {
    const t = e.target as HTMLElement;
    const q = <T extends string>(attr: string) => t.closest<HTMLElement>(`[${attr}]`)?.getAttribute(attr) as T | null;
    if (t.closest("[data-ar-back]")) return this.back();
    if (this.screen === "entry") {
      const mode = q<ArenaMode>("data-mode");
      if (mode) this.enterSelect(mode);
      return;
    }
    if (this.screen === "select") return this.onSelectClick(t, e);
    if (this.screen === "pick") {
      const i = q("data-round-pick");
      if (i !== null) void this.beginRound(Number(i));
      return;
    }
    if (this.screen === "result") {
      if (t.closest("[data-rematch]")) void this.startBattle(true);
      else if (t.closest("[data-menu]")) this.toMenu();
      return;
    }
    if (this.screen === "battle") {
      const sp = q("data-speed");
      if (sp && this.run) {
        this.run.speed = Number(sp);
        this.hud.querySelectorAll("[data-speed]").forEach((b) => b.classList.toggle("on", b.getAttribute("data-speed") === sp));
      }
      if (t.closest("[data-skip]") && this.auto && !this.auto.result) {
        const now = performance.now();
        this.feed(runAutoArena(this.auto), now);
        if (this.run) this.run.endAt = now + 900;
      }
    }
  }

  private onSelectClick(t: HTMLElement, e: MouseEvent): void {
    const attr = (a: string) => t.closest<HTMLElement>(`[${a}]`)?.getAttribute(a) ?? null;
    const pick = attr("data-pick");
    const unpick = attr("data-unpick");
    const up = attr("data-up-pick");
    const down = attr("data-down-pick");
    const focus = attr("data-focus");
    this.message = undefined;
    if (unpick) {
      this.picks = this.picks.filter((p) => p !== unpick);
      if (this.focus === unpick) this.focus = this.picks[0];
    } else if (up !== null || down !== null) {
      const i = Number(up ?? down);
      const j = up !== null ? i - 1 : i + 1;
      if (j < 0 || j >= this.picks.length) return;
      [this.picks[i], this.picks[j]] = [this.picks[j], this.picks[i]];
    } else if (pick) {
      if (this.picks.includes(pick)) this.picks = this.picks.filter((p) => p !== pick);
      else if (this.picks.length >= 3) this.message = "O time tem 3 Digimon: tire um antes.";
      else this.picks.push(pick);
      if (this.mode === "auto" && this.picks.includes(pick)) this.focus = pick;
    } else if (focus && this.mode === "auto") this.focus = focus;
    else if (t.closest("[data-save-comp]")) {
      const r = this.myTeam();
      if ("error" in r) this.message = r.error;
      else {
        const name = this.body().querySelector<HTMLInputElement>("[data-comp-name]")?.value ?? "";
        this.d.setArena(saveComp(this.d.arena(), name, r.team, Date.now()));
        this.message = "Composição salva (também aparece como oponente fantasma).";
      }
    } else if (attr("data-load-comp")) {
      const c = this.d.arena().comps.find((x) => x.id === attr("data-load-comp"));
      if (!c) return;
      const ok = c.fighters.filter((f) => this.roster.some((r) => r.eligible && r.fighter.ref === f.ref && r.fighter.speciesId === f.speciesId));
      this.picks = ok.map((f) => f.ref);
      for (const f of ok) this.rules[f.ref] = f.autoRules.map((r) => ({ ...r }));
      this.focus = this.picks[0];
      if (ok.length < c.fighters.length) this.message = `${c.fighters.length - ok.length} Digimon da composição não estão mais no save (mudaram ou saíram).`;
    } else if (t.closest("[data-fight]")) {
      void this.startBattle(false);
      return;
    } else if (this.focus) {
      // editor de prioridade (mesmo editor e mesma regra da aba Golpes)
      const r = this.roster.find((x) => x.fighter.ref === this.focus);
      const cur = this.rules[this.focus] ?? r?.fighter.autoRules ?? [];
      const next = r && editRules(this.rulesShown(r, cur), r.fighter.moves, { type: "click", target: t });
      if (!next) return;
      this.rules[this.focus] = next;
    } else return;
    void e;
    this.render();
  }

  /** Regras como o editor mostra: as salvas (só equipados) e depois os equipados que faltam (mesma regra do rulesFor). */
  private rulesShown(r: RosterEntry, rules: AutoRule[]): AutoRule[] {
    const eq = r.fighter.moves.filter((s): s is string => !!s);
    return [...rules.filter((x) => eq.includes(x.moveId)), ...eq.filter((id) => !rules.some((x) => x.moveId === id)).map((moveId) => ({ moveId, cond: "always" as const }))];
  }

  private onChange(e: Event): void {
    const t = e.target as HTMLInputElement;
    if (this.screen !== "select") return;
    if (t.dataset.ghost !== undefined) this.ghostId = t.value;
    else if (t.dataset.normalize !== undefined) this.normalize = t.checked;
    else if (this.focus) {
      const r = this.roster.find((x) => x.fighter.ref === this.focus);
      const next = r && editRules(this.rulesShown(r, this.rules[this.focus] ?? r.fighter.autoRules), r.fighter.moves, { type: "change", target: t });
      if (!next) return;
      this.rules[this.focus] = next;
    } else return;
    this.render();
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (!this.isOpen) return;
    if ((e.target as HTMLElement).closest?.("input, select, textarea")) return;
    const k = e.key.toLowerCase();
    if (!down) {
      this.keys.delete(k);
      const slot = k === " " ? 2 : k === "q" ? 3 : k === "e" ? 4 : -1;
      this.held.delete(slot);
      return;
    }
    if (k === "escape") {
      e.preventDefault();
      return this.back();
    }
    if (this.screen === "result" && k === "r") return void this.startBattle(true);
    if (this.screen !== "battle" || !this.match?.current) return;
    if ("wasd".includes(k) && k.length === 1) this.keys.add(k);
    const slot = k === " " ? 2 : k === "q" ? 3 : k === "e" ? 4 : undefined;
    if (slot !== undefined) {
      e.preventDefault();
      if (!e.repeat) this.fresh = slot;
      this.held.add(slot);
    }
  }

  private back(): void {
    if (this.screen === "entry") return this.close();
    if (this.screen === "select") return this.show("entry");
    // batalha/escolha da rodada: abandona sem registrar; resultado: menu
    this.toMenu();
  }

  private toMenu(): void {
    this.stopRun();
    this.auto = undefined;
    this.match = undefined;
    this.show("entry");
  }

  // ---------- batalha ----------

  private async startBattle(rematch: boolean): Promise<void> {
    if (!rematch || !this.teams) {
      const mine = this.myTeam();
      if ("error" in mine) {
        this.message = mine.error;
        return this.render();
      }
      if (mine.team.fighters.length < this.needed()) {
        this.message = `Escolha ${this.needed()} Digimon.`;
        return this.render();
      }
      const foe = ghostTeam(this.d.content, this.d.arena(), this.ghostId, mine.team.fighters);
      if (!foe) return;
      this.teams = [mine.team, foe];
    }
    // posse conferida de novo na hora de lutar (o save pode ter mudado desde a seleção/revanche)
    const own = ownershipError(this.d.owned(), this.d.content, this.teams[0]);
    if (own) {
      this.teams = undefined;
      this.message = own;
      this.roster = arenaRoster(this.d.owned(), this.d.content);
      return this.show("select");
    }
    this.stopRun();
    this.log = [];
    this.ratingBefore = this.d.arena().rating[this.mode];
    const seed = this.d.seed();
    if (this.mode === "auto") {
      this.match = undefined;
      const { arena, events } = createAutoArena(this.d.content, seed, this.teams[0], this.teams[1], { normalize: this.normalize });
      this.auto = arena;
      await this.startRun(arena.sim.map, events);
    } else {
      this.auto = undefined;
      this.stopRun();
      this.hud.innerHTML = "";
      this.canvas.getContext("2d")?.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.match = createManualMatch(this.d.content, seed, this.teams[0], this.teams[1], { normalize: this.normalize, limitTicks: this.d.roundTicks });
      this.lastRoundText = undefined;
      this.resize();
      this.show("pick");
    }
  }

  private async beginRound(pick: number): Promise<void> {
    const m = this.match;
    if (!m || !availablePicks(m, 0).includes(pick)) return;
    const { events } = startRound(m, pick);
    this.held.clear();
    this.fresh = undefined;
    await this.startRun(m.current!.sim.map, events);
  }

  private async startRun(map: WorldMap, events: WorldEvent[]): Promise<void> {
    this.stopRun();
    this.resize();
    const f = fieldRect();
    const ts = map.tileSize;
    const geom = { x0: f.x0 * ts, y0: f.y0 * ts, x1: f.x1 * ts, y1: f.y1 * ts, w: map.width * ts, h: map.height * ts };
    const view = await this.d.makeView(this.canvas, map, (ctx, cam, now) => {
      drawStadium(ctx, cam, geom, now);
      drawFieldLines(ctx, cam, geom);
    });
    const presenter = this.d.newPresenter();
    const now = performance.now();
    this.run = { view, presenter, acc: 0, last: now, speed: 1 };
    this.hud.innerHTML = this.mode === "auto" ? autoHudHtml() : manualHudHtml();
    this.iconKeys = [];
    this.feed(events, now);
    this.show("battle");
    this.paint(this.hud);
    this.raf = requestAnimationFrame(this.loop);
  }

  private stopRun(): void {
    cancelAnimationFrame(this.raf);
    this.run = undefined;
  }

  private sim() {
    return this.auto?.sim ?? this.match?.current?.sim;
  }

  /** Eventos confirmados → apresentação (Presenter/VFX) e log. */
  private feed(evs: WorldEvent[], now: number): void {
    const sim = this.sim();
    if (!sim || !this.run) return;
    this.run.presenter.onTick(snapshot(sim), evs, now);
    this.logEvents(evs);
  }

  private resize(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    this.scale = Math.max(1, Math.round(Math.min(vw / 640, vh / 400)));
    this.canvas.width = Math.ceil(vw / this.scale);
    this.canvas.height = Math.ceil(vh / this.scale);
    this.canvas.style.width = `${this.canvas.width * this.scale}px`;
    this.canvas.style.height = `${this.canvas.height * this.scale}px`;
  }

  private loop = (now: number): void => {
    const r = this.run;
    if (!r) return;
    r.acc += Math.min(1000, now - r.last);
    r.last = now;
    let steps = 0;
    while (r.acc >= TICK_MS && steps < 10) {
      for (let i = 0; i < r.speed; i++) this.tick(now);
      r.acc -= TICK_MS;
      steps++;
    }
    if (steps === 10) r.acc = 0;
    if (this.run !== r) return;
    r.presenter.update(now);
    const alpha = r.acc / TICK_MS;
    r.view.update(r.presenter, alpha, now);
    const f = fieldRect();
    const ts = 32;
    r.view.follow({ x: ((f.x0 + f.x1) / 2) * ts, y: ((f.y0 + f.y1) / 2) * ts + (this.mode === "manual" ? 8 : 0) });
    r.view.render(r.presenter, alpha, now);
    this.updateHud(now);
    if (r.endAt !== undefined && now >= r.endAt) {
      r.endAt = undefined;
      this.afterEnd();
    }
    if (this.run === r) this.raf = requestAnimationFrame(this.loop);
  };

  private tick(now: number): void {
    const r = this.run!;
    if (this.auto) {
      if (this.auto.result) return;
      this.feed(stepAutoArena(this.auto), now);
      if (this.auto.result && r.endAt === undefined) r.endAt = now + 1600;
      return;
    }
    const m = this.match;
    const round = m?.current;
    if (!m || !round || round.result) return;
    const dx = (this.keys.has("d") ? 1 : 0) - (this.keys.has("a") ? 1 : 0);
    const dy = (this.keys.has("s") ? 1 : 0) - (this.keys.has("w") ? 1 : 0);
    const fresh = this.fresh;
    this.fresh = undefined;
    // segurar o botão repete o golpe quando ele fica pronto (sem mensagem de recusa a cada tick)
    const press = fresh ?? this.readyHeld(round.ents[0]);
    const evs = stepRound(m, { dx, dy, aim: this.aimSub(), press });
    for (const ev of evs) if (ev.t === "intent_rejected" && fresh !== undefined) this.flash(ev.reason, now);
    this.feed(evs, now);
    const res = round.result as RoundResult | undefined;
    if (res) {
      const w = res.winner;
      const how = res.reason === "ko" ? "por KO" : `no tempo (PV ${Math.round(res.hpPct[0] * 100)}% × ${Math.round(res.hpPct[1] * 100)}%)`;
      this.lastRoundText = `Rodada ${round.n}: ${w === 0 ? "vitória" : w === 1 ? "derrota" : "empate"} ${how}`;
      const banner = this.hud.querySelector<HTMLElement>(".ar-banner");
      if (banner) {
        banner.textContent = w === 0 ? "VITÓRIA NA RODADA!" : w === 1 ? "RODADA PERDIDA" : "EMPATE";
        banner.className = `ar-banner on ${w === 0 ? "win" : w === 1 ? "loss" : "draw"}`;
      }
      r.endAt = now + 1800;
    }
  }

  private readyHeld(me: Entity): number | undefined {
    if (me.attackCd > 0) return undefined;
    for (const s of this.held) {
      const id = s === 0 ? this.d.content.moves.basicMoveId : me.moves[s - 1];
      const mv = id ? this.d.content.moves.moves[id] : undefined;
      if (mv && (me.moveCd[mv.id] ?? 0) <= 0 && me.mp >= mv.cost) return s;
    }
    return undefined;
  }

  /** Cursor → ponto do mundo em sub-tiles (mira). */
  private aimSub(): { x: number; y: number } | undefined {
    if (!this.mouse || !this.run) return undefined;
    const rect = this.canvas.getBoundingClientRect();
    const w = this.run.view.screenToWorld((this.mouse.x - rect.left) / this.scale, (this.mouse.y - rect.top) / this.scale);
    return { x: pxToSub(w.x), y: pxToSub(w.y) };
  }

  private flash(text: string, now: number): void {
    const el = this.hud.querySelector<HTMLElement>(".ar-msg");
    if (!el) return;
    el.textContent = text;
    el.classList.add("on");
    this.msgUntil = now + 900;
  }

  /** Fim da rodada (manual) ou da partida: próxima escolha ou resultado. */
  private afterEnd(): void {
    if (this.auto?.result) return this.finish();
    const m = this.match;
    if (!m) return;
    if (m.over) return this.finish();
    this.show("pick");
  }

  private finish(): void {
    const mode = this.mode;
    const teams = this.teams!;
    let result: ResultView["result"];
    let score: string | undefined;
    let reason: string;
    let stats: ResultView["sides"][number]["stats"][];
    let played: [{ speciesId: string; level: number }[], { speciesId: string; level: number }[]];
    if (this.auto?.result) {
      const r = this.auto.result;
      result = r.winner === 0 ? "win" : r.winner === 1 ? "loss" : "draw";
      reason = r.reason === "ko" ? "Time adversário sem Digimon de pé" : `Fim do tempo: PV total ${Math.round(r.hpPct[0] * 100)}% × ${Math.round(r.hpPct[1] * 100)}%`;
      if (r.reason === "ko" && r.winner === 1) reason = "Seu time ficou sem Digimon de pé";
      stats = this.auto.stats;
      played = [teams[0].fighters.map((f) => ({ speciesId: f.speciesId, level: f.level })), teams[1].fighters.map((f) => ({ speciesId: f.speciesId, level: f.level }))];
    } else {
      const m = this.match!;
      const w = m.over!.winner;
      result = w === 0 ? "win" : w === 1 ? "loss" : "draw";
      score = `${m.score[0]}-${m.score[1]}`;
      reason = `${m.rounds.length} rodada(s)`;
      stats = m.stats;
      played = [0, 1].map((s) => m.rounds.map((r) => ({ speciesId: teams[s].fighters[r.pick[s]].speciesId, level: teams[s].fighters[r.pick[s]].level }))) as typeof played;
    }
    const next = recordMatch(this.d.arena(), {
      mode,
      result,
      score,
      mine: teams[0].fighters.map((f) => ({ speciesId: f.speciesId, level: f.level })),
      foe: teams[1].fighters.map((f) => ({ speciesId: f.speciesId, level: f.level })),
      foeName: teams[1].name,
      date: Date.now(),
      damage: [stats[0].damage, stats[1].damage],
      hits: [stats[0].hits, stats[1].hits],
      normalized: this.normalize,
    });
    this.d.setArena(next);
    const view: ResultView = {
      mode,
      result,
      score,
      reason,
      sides: [
        { name: "Você", species: played[0], stats: stats[0] },
        { name: teams[1].name, species: played[1], stats: stats[1] },
      ],
      ratingBefore: this.ratingBefore,
      ratingAfter: next.rating[mode],
    };
    this.screen = "result";
    this.show("result");
    this.body().innerHTML = resultHtml(this.d.content, view);
    this.paint(this.body());
  }

  // ---------- HUD ----------

  private name(id: string): string {
    const e = this.sim()?.state.entities.find((x) => x.id === id) ?? this.auto?.roster.flat().find((x) => x.id === id);
    return e?.name ?? id;
  }

  private logEvents(evs: WorldEvent[]): void {
    const mc = this.d.content.moves;
    const sideOf = (id: string): Side | undefined => (id.startsWith("A") ? 0 : id.startsWith("B") ? 1 : undefined);
    const sim = this.sim();
    for (const ev of evs) {
      if (ev.t === "damage") {
        const a = this.name(ev.attackerId);
        if (ev.kind === "miss") this.log.push({ text: `${a} errou`, side: sideOf(ev.attackerId) });
        else if (ev.kind === "heal") this.log.push({ text: `${a} recuperou ${ev.amount} PV`, side: sideOf(ev.attackerId) });
        else this.log.push({ text: `${a} → ${this.name(ev.targetId)}: −${ev.amount}${ev.crit ? " crítico!" : ""}`, side: sideOf(ev.attackerId) });
      } else if (ev.t === "attack_start" && !ev.targetIds?.length) this.log.push({ text: `${this.name(ev.attackerId)}: ${mc.moves[ev.skillId]?.name ?? ev.skillId} no vazio`, side: sideOf(ev.attackerId) });
      else if (ev.t === "status") this.log.push({ text: `${this.name(ev.id)}: ${STAT_SHORT[ev.stat]} ${ev.mult >= 1 ? "↑" : "↓"} (${mc.moves[ev.moveId]?.name ?? ev.moveId})`, side: sideOf(ev.sourceId) });
      else if (ev.t === "defeat") this.log.push({ text: `KO! ${this.name(ev.id)}`, side: sideOf(ev.by ?? "") });
      else if (ev.t === "spawn" && sim && sim.state.tick > 0) this.log.push({ text: `${ev.entity.name} entra na arena`, side: sideOf(ev.entity.id) });
    }
    if (this.log.length > 40) this.log = this.log.slice(-40);
  }

  private updateHud(now: number): void {
    const msg = this.hud.querySelector<HTMLElement>(".ar-msg");
    if (msg && now > this.msgUntil) msg.classList.remove("on");
    if (this.auto) return this.updateAutoHud(now);
    if (this.match?.current) this.updateManualHud();
  }

  private updateAutoHud(now: number): void {
    if (now - this.lastHud < 100) return;
    this.lastHud = now;
    const a = this.auto!;
    this.hud.querySelector('[data-testid="timer"]')!.textContent = clockText(a.limitTicks - a.sim.state.tick);
    for (const side of [0, 1] as Side[]) {
      const act = activeOf(a, side);
      const list: FighterHud[] = a.roster[side].map((e) => ({ speciesId: e.speciesId!, name: e.name, level: e.level, hp: e.hp, maxHp: e.maxHp, mp: e.mp, maxMp: e.maxMp, active: e === act && e.hp > 0, ko: e.hp <= 0 }));
      const el = this.hud.querySelector<HTMLElement>(`[data-side="${side}"]`)!;
      const key = list.map((f) => `${f.speciesId}${Math.ceil(f.hp)}${f.active}`).join("|");
      if (el.dataset.key === key) continue;
      el.dataset.key = key;
      el.innerHTML = sideHtml(side === 0 ? "Você" : a.teams[1].name, list) + (a.level ? `<small class="lv">Nivelada Nv.${a.level}</small>` : "");
      this.paint(el);
    }
    const log = this.hud.querySelector<HTMLElement>(".ar-log")!;
    log.innerHTML = this.log.slice(-7).map((l) => `<li class="s${l.side ?? "x"}">${l.text.replace(/</g, "&lt;")}</li>`).join("");
  }

  private updateManualHud(): void {
    const m = this.match!;
    const r = m.current!;
    const mc = this.d.content.moves;
    const [me, foe] = r.ents;
    const plate = (side: "a" | "b", e: Entity) => {
      const el = this.hud.querySelector<HTMLElement>(`[data-plate="${side}"]`)!;
      if (el.dataset.sp !== e.speciesId) {
        el.dataset.sp = e.speciesId!;
        const c = el.querySelector<HTMLCanvasElement>("canvas.pt")!;
        c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
        this.d.portrait(e.speciesId!, c);
        el.querySelector(".nm")!.textContent = `${e.name} Nv.${e.level}`;
        el.querySelector(".chips")!.innerHTML = `<i class="chip e-${e.element}">${ELEMENT_PT[e.element] ?? e.element}</i><i class="chip">${AFFINITY_PT[e.affinity] ?? e.affinity}</i>`;
      }
      el.querySelector(".hpv")!.textContent = `${Math.ceil(e.hp)}/${e.maxHp}`;
      el.querySelector<HTMLElement>(".bar.hp i")!.style.width = `${Math.round((e.hp / e.maxHp) * 100)}%`;
      el.querySelector<HTMLElement>(".bar.mp i")!.style.width = `${Math.round((e.mp / Math.max(1, e.maxMp)) * 100)}%`;
      el.querySelector(".st")!.textContent = [`MP ${Math.floor(e.mp)}/${e.maxMp}`, ...e.statuses.map((s) => `${STAT_SHORT[s.stat]} ${s.mult >= 1 ? "↑" : "↓"}`)].join(" · ");
    };
    plate("a", me);
    plate("b", foe);
    this.hud.querySelector('[data-testid="timer"]')!.textContent = clockText(r.limitTicks - r.sim.state.tick);
    this.hud.querySelector('[data-testid="round"]')!.textContent = `Rodada ${r.n}`;
    const sc = this.hud.querySelector<HTMLElement>('[data-testid="round-score"]')!;
    const sk = m.score.join("-");
    if (sc.dataset.k !== sk) {
      sc.dataset.k = sk;
      sc.innerHTML = scoreDots(m.score);
    }
    const gcd = me.attackCd;
    this.hud.querySelectorAll<HTMLElement>(".ar-sk").forEach((b, i) => {
      const id = i === 0 ? mc.basicMoveId : me.moves[i - 1];
      const mv = id ? mc.moves[id] : undefined;
      if (this.iconKeys[i] !== (id ?? "")) {
        this.iconKeys[i] = id ?? "";
        b.querySelector(".nm")!.textContent = mv?.name ?? "—";
        b.querySelector(".mp")!.textContent = mv && mv.cost ? `${mv.cost}` : "";
        b.title = mv ? `${mv.name} (${["LMB", "RMB", "Espaço", "Q", "E"][i]})` : "slot vazio";
        b.className = `ar-sk${mv ? ` k-${mv.type} e-${mv.element}` : " empty"}`;
        const c = b.querySelector("canvas")!;
        c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
        this.d.moveIcon(c, mv);
      }
      const own = mv ? me.moveCd[mv.id] ?? 0 : 0;
      const frac = mv && mv.cooldownTicks > 0 ? own / mv.cooldownTicks : 0;
      b.style.setProperty("--cd", Math.max(frac, gcd > 0 ? 0.15 : 0).toFixed(3));
      b.querySelector(".cdt")!.textContent = own > 0 ? String(Math.ceil((own * TICK_MS) / 1000)) : "";
      b.classList.toggle("cooling", own > 0);
      b.classList.toggle("gcd", gcd > 0);
      b.classList.toggle("nomp", !!mv && me.mp < mv.cost);
      b.classList.toggle("held", this.held.has(i));
    });
  }
}
