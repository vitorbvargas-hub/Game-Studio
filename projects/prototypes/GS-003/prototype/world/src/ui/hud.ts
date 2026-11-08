// HUD em DOM sobre o canvas, no padrão estrutural do IdleDex (referência canônica, ADR-010): barra inferior com
// minimapa, inventário, atalhos, XP do Tamer, Digimon ativo e equipe; AUTO no topo central; moeda e eventos à
// direita; log de batalha à direita; chat recolhido à esquerda; modal "Equipe & Box".
// Só emite intents (via callbacks) e lê eventos confirmados/snapshots; nunca altera o estado do jogo.
// Equipe extra, Box, nível do Tamer, chat e eventos vêm dos DADOS DE CENA (placeholders de apresentação).

import { statsAtLevel } from "@game/src/sim/formulas";
import type { PortraitFn } from "../render/portrait";
import type { WorldContent } from "../sim/species";
import type { EntitySnapshot, WorldEvent } from "../sim/types";
import { icon } from "./icons";
import type { Minimap, MinimapDot } from "./minimap";

export interface HudCallbacks {
  onAuto(on: boolean): void;
  onFlee(): void;
}

export interface HudScene {
  region: { name: string; route: string };
  tamerName: string;
  tamerLevel: number;
  tamerXp: { base: number; perLevel: number };
  team: { species: string; level: number; hpPct: number }[];
  box: { species: string; level: number }[];
  chat: { from: string; text: string }[];
}

export interface HudOptions {
  scene?: HudScene;
  portrait?: PortraitFn;
  minimap?: Minimap;
}

/** Atalhos da grade (2 × 6). Só "Equipe" abre algo nesta prova; o resto avisa "Em breve". */
export const SHORTCUTS: { id: string; label: string; icon: string; key?: string }[] = [
  { id: "team", label: "Equipe & Box", icon: "team", key: "E" },
  { id: "dex", label: "Digidex", icon: "dex" },
  { id: "quest", label: "Missões", icon: "quest" },
  { id: "map", label: "Mapa", icon: "map" },
  { id: "shop", label: "Loja", icon: "shop" },
  { id: "evo", label: "Evolução", icon: "evo" },
  { id: "arena", label: "Arena", icon: "arena" },
  { id: "friends", label: "Amigos", icon: "friends" },
  { id: "guild", label: "Guilda", icon: "guild" },
  { id: "trophy", label: "Conquistas", icon: "trophy" },
  { id: "mail", label: "Correio", icon: "mail" },
  { id: "gear", label: "Configurações", icon: "gear" },
];

const STAGES: Record<number, string> = { 1: "Bebê", 2: "Criança", 3: "Adulto" };
const AFFINITY: Record<string, string> = { vaccine: "Vacina", data: "Dados", virus: "Vírus", free: "Livre" };
const MAX_LOG = 7;
const DEFAULT_SCENE: HudScene = {
  region: { name: "Prado", route: "Rota 1" },
  tamerName: "Tamer",
  tamerLevel: 1,
  tamerXp: { base: 40, perLevel: 18 },
  team: [],
  box: [],
  chat: [],
};

interface TeamMember {
  slot: string;
  species: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  active: boolean;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR");

export class Hud {
  private auto = false;
  private autoBtn: HTMLButtonElement;
  private autoState: HTMLElement;
  private fleeBtn: HTMLButtonElement;
  private log: HTMLOListElement;
  private partnerBox: HTMLDivElement;
  private teamStrip: HTMLDivElement;
  private coins: HTMLElement;
  private tamerXpEl: HTMLElement;
  private coordEl: HTMLElement;
  private toastEl: HTMLElement;
  private chatEl: HTMLElement;
  private modal: HTMLElement;
  private minimapCanvas: HTMLCanvasElement;
  private names = new Map<string, string>();
  private lastPartnerHtml = "";
  private lastTeamKey = "";
  private partner?: EntitySnapshot;
  private partnerXp = { xp: 0, next: 1 };
  private tamerLevel: number;
  private tamerXp = 0;
  private selected = "active";
  private toastTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private readonly scene: HudScene;

  constructor(
    private readonly root: HTMLElement,
    private readonly content: WorldContent,
    private readonly playerId: string,
    cb: HudCallbacks,
    initialAuto: boolean,
    private readonly opts: HudOptions = {},
  ) {
    this.scene = opts.scene ?? DEFAULT_SCENE;
    this.tamerLevel = this.scene.tamerLevel;
    const sc = this.scene;
    root.innerHTML = `
      <div class="hud-tl">
        <div class="pill">${icon("moon", 14)}<b>Dia</b><span data-testid="clock">14:20</span></div>
        <div class="pill region">${icon("map", 14)}<b>${esc(sc.region.name)}</b><span>${esc(sc.region.route)}</span></div>
        <div class="pill dim"><span data-testid="fps">-- qps</span></div>
      </div>
      <div class="hud-auto">
        <button class="auto-btn" data-act="auto" aria-pressed="false" title="Caça automática"><span>AUTO</span><i data-testid="auto-state">DESL.</i></button>
        <button class="flee-btn" data-act="flee" title="Fugir do combate (F)">Fugir</button>
      </div>
      <div class="hud-tr">
        <div class="coins">${icon("coin", 16)}<b data-testid="coins">0</b><span>bits</span><button class="plus" data-soon="Loja" title="Em breve">+</button></div>
        <button class="event gold" data-soon="Passe de Temporada">${icon("star", 16)}<b>PASSE DE TEMPORADA</b></button>
        <div class="event">${icon("gift", 16)}<span>Fonte dos Desejos</span><em>61%</em></div>
        <div class="icon-grid">
          ${["arena", "map", "friends", "mail", "boss", "trophy"].map((n) => `<button data-soon="Evento" title="Em breve">${icon(n, 18)}</button>`).join("")}
        </div>
        <div class="event dim">${icon("boss", 16)}<span>Chefe Mundial</span><em>6h55</em></div>
        <div class="event dim">${icon("guild", 16)}<span>Guilda dominante da rota</span><em>—</em></div>
      </div>
      <ol class="hud-log" aria-live="polite"></ol>
      <div class="hud-chat collapsed">
        <button class="chat-head" data-act="chat">${icon("chat", 18)}<span><b>Chat</b><small data-testid="chat-last"></small></span><i class="badge">${sc.chat.length}</i></button>
        <ul class="chat-lines">${sc.chat.map((m) => `<li><b>${esc(m.from)}:</b> ${esc(m.text)}</li>`).join("")}<li class="dim">(mensagens simuladas)</li></ul>
      </div>
      <div class="hud-toast" role="status"></div>
      <div class="hud-tamerxp" title="Experiência do Tamer"><span>NÍVEL <b data-testid="tamer-level">${this.tamerLevel}</b></span><div class="bar"><i></i></div></div>
      <div class="hud-bottom">
        <div class="mm">
          <div class="mm-tag">${esc(sc.region.name)}</div>
          <canvas width="128" height="80" data-testid="minimap"></canvas>
          <div class="mm-coord" data-testid="coords">—</div>
        </div>
        <button class="inv" data-soon="Inventário" title="Inventário (em breve)">${icon("chest", 34)}<span>Inventário</span></button>
        <nav class="hud-menu">
          <button class="bag" data-soon="Bolsa" title="Bolsa">${icon("bag", 30)}</button>
          <div class="grid">${SHORTCUTS.map((s) => `<button data-short="${s.id}" ${s.id === "team" ? "" : 'aria-disabled="true"'} title="${s.label}${s.key ? ` (${s.key})` : " — em breve"}">${icon(s.icon, 20)}</button>`).join("")}</div>
        </nav>
        <div class="hud-partner" data-testid="partner"></div>
        <div class="hud-team" data-testid="team"></div>
      </div>
      <div class="modal-wrap" hidden>
        <div class="modal-backdrop" data-act="close"></div>
        <section class="modal" role="dialog" aria-modal="true" aria-label="Equipe e Box"></section>
      </div>`;
    const q = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
    this.autoBtn = q('[data-act="auto"]');
    this.autoState = q('[data-testid="auto-state"]');
    this.fleeBtn = q('[data-act="flee"]');
    this.log = q(".hud-log");
    this.partnerBox = q(".hud-partner");
    this.teamStrip = q(".hud-team");
    this.coins = q('[data-testid="coins"]');
    this.tamerXpEl = q(".hud-tamerxp");
    this.coordEl = q('[data-testid="coords"]');
    this.toastEl = q(".hud-toast");
    this.chatEl = q(".hud-chat");
    this.modal = q(".modal-wrap");
    this.minimapCanvas = q('[data-testid="minimap"]');
    q('[data-testid="chat-last"]').textContent = sc.chat.length ? `${sc.chat[sc.chat.length - 1].from}: ${sc.chat[sc.chat.length - 1].text}` : "Sem mensagens";

    // Cliques no HUD não chegam ao canvas (não viram "andar até aqui").
    root.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button, .modal-wrap, .hud-bottom, .hud-tr, .hud-chat, input")) e.stopPropagation();
    });
    this.autoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.setAuto(!this.auto);
      cb.onAuto(this.auto);
    });
    this.fleeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cb.onFlee();
    });
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const short = t.closest<HTMLElement>("[data-short]");
      const soon = t.closest<HTMLElement>("[data-soon]");
      const act = t.closest<HTMLElement>("[data-act]")?.dataset.act;
      if (short?.dataset.short === "team") this.openTeam();
      else if (short) this.toast(`${short.title.replace(/ — em breve$/, "")}: em breve`);
      else if (soon) this.toast(`${soon.dataset.soon}: em breve`);
      else if (act === "chat") this.chatEl.classList.toggle("collapsed");
      else if (act === "close") this.closeTeam();
    });
    this.setAuto(initialAuto);
    this.renderTamerXp();
  }

  setAuto(on: boolean): void {
    this.auto = on;
    this.autoBtn.classList.toggle("on", on);
    this.autoBtn.setAttribute("aria-pressed", String(on));
    this.autoState.textContent = on ? "LIG." : "DESL.";
  }

  private name(id: string): string {
    return this.names.get(id) ?? id;
  }

  private push(text: string, cls = ""): void {
    const li = document.createElement("li");
    li.textContent = text;
    if (cls) li.className = cls;
    this.log.prepend(li);
    while (this.log.children.length > MAX_LOG) this.log.lastElementChild!.remove();
  }

  toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastEl.classList.remove("show"), 1600);
  }

  private mine(id: string | undefined): boolean {
    return !!id && (id === this.playerId || id.startsWith(`${this.playerId}:`));
  }

  /** Eventos confirmados → log de batalha (só os que envolvem o jogador local) e XP do Tamer (apresentação). */
  onEvents(events: WorldEvent[]): void {
    for (const ev of events) {
      if (ev.t === "spawn") this.names.set(ev.entity.id, ev.entity.name);
      switch (ev.t) {
        case "encounter_start":
          if (ev.members.some((m) => this.mine(m))) this.push(`Combate: ${ev.members.map((m) => this.name(m)).join(" × ")}`);
          break;
        case "damage":
          if (this.mine(ev.attackerId) && ev.kind === "damage") this.push(`${this.name(ev.attackerId)} causou ${ev.amount} de dano${ev.crit ? " (crítico!)" : ""}.`, ev.crit ? "gold" : "");
          else if (this.mine(ev.attackerId) && ev.kind === "miss") this.push(`${this.name(ev.attackerId)} errou o golpe.`, "dim");
          else if (this.mine(ev.targetId) && ev.kind === "damage") this.push(`${this.name(ev.targetId)} sofreu ${ev.amount} de dano.`, "bad");
          break;
        case "defeat":
          if (this.mine(ev.id)) this.push(`${this.name(ev.id)} desmaiou!`, "bad");
          else if (this.mine(ev.by)) this.push(`${this.name(ev.id)} foi derrotado.`, "good");
          break;
        case "reward":
          if (ev.ownerId === this.playerId) {
            this.push(`Venceu! +${ev.xp} XP · +${ev.bits} bits`, "good");
            this.tamerXp += ev.xp;
            while (this.tamerXp >= this.tamerNext()) {
              this.tamerXp -= this.tamerNext();
              this.tamerLevel++;
              this.push(`Tamer subiu para o nível ${this.tamerLevel}!`, "gold");
            }
            this.renderTamerXp();
          }
          break;
        case "level_up":
          if (this.mine(ev.id)) this.push(`${this.name(ev.id)} subiu para o nível ${ev.level}!`, "gold");
          break;
        case "capture":
          if (ev.ownerId === this.playerId)
            this.push(ev.done ? `${this.content.species[ev.speciesId]?.name} registrado no Digidex! (captura placeholder)` : `Escaneando ${this.content.species[ev.speciesId]?.name}: ${ev.pct}%`, ev.done ? "gold" : "");
          break;
        case "encounter_end":
          if (ev.reason === "flee" || ev.reason === "leash") this.push(ev.reason === "flee" ? "Combate encerrado (fuga)." : "Alvo longe demais: combate encerrado.");
          break;
        case "intent_rejected":
          if (ev.playerId === this.playerId) this.push(`Não dá: ${ev.reason}.`, "bad");
          break;
        default:
          break;
      }
    }
  }

  private tamerNext(): number {
    return this.scene.tamerXp.base + this.scene.tamerXp.perLevel * this.tamerLevel;
  }

  private renderTamerXp(): void {
    this.tamerXpEl.querySelector("b")!.textContent = String(this.tamerLevel);
    this.tamerXpEl.querySelector<HTMLElement>(".bar i")!.style.width = `${Math.round((this.tamerXp / this.tamerNext()) * 100)}%`;
  }

  /** Digimon ativo (painel + slot 1 da equipe) e moeda. */
  updatePartner(p: EntitySnapshot | undefined, xp: number, xpNext: number, bits: number): void {
    if (!p) return;
    this.partner = p;
    this.partnerXp = { xp, next: xpNext };
    this.coins.textContent = fmt(bits);
    const hpPct = Math.round((p.hp / p.maxHp) * 100);
    const xpPct = xpNext > 0 ? Math.round((xp / xpNext) * 100) : 0;
    const html = `
      <canvas class="pt" width="56" height="56" data-species="${p.speciesId ?? ""}"></canvas>
      <div class="info">
        <div class="hud-name">${esc(p.name)} <span>Nv.${p.level}</span></div>
        <div class="row"><label>PV</label><div class="hud-bar hp seg"><i style="width:${hpPct}%"></i></div><em>${p.hp}/${p.maxHp}</em></div>
        <div class="row"><label>XP</label><div class="hud-bar xp"><i style="width:${xpPct}%"></i></div><em>${xp}/${xpNext}</em></div>
      </div>`;
    if (html !== this.lastPartnerHtml) {
      const speciesChanged = !this.lastPartnerHtml.includes(`data-species="${p.speciesId ?? ""}"`);
      const old = this.partnerBox.querySelector("canvas");
      this.lastPartnerHtml = html;
      this.partnerBox.innerHTML = html;
      const cnv = this.partnerBox.querySelector("canvas")!;
      if (old && !speciesChanged) cnv.replaceWith(old);
      else this.paint(cnv);
    }
    this.renderTeam();
  }

  private paint(c: HTMLCanvasElement | null): void {
    if (!c || !this.opts.portrait || !c.dataset.species) return;
    try {
      this.opts.portrait(c.dataset.species, c);
    } catch {
      /* sem canvas (ex.: jsdom) */
    }
  }

  private teamMembers(): TeamMember[] {
    const out: TeamMember[] = [];
    const p = this.partner;
    if (p?.speciesId) out.push({ slot: "active", species: p.speciesId, name: p.name, level: p.level, hp: p.hp, maxHp: p.maxHp, active: true });
    this.scene.team.forEach((t, i) => {
      const sp = this.content.species[t.species];
      if (!sp) return;
      const maxHp = statsAtLevel(sp.base, sp.growth, t.level).hp;
      out.push({ slot: `team${i}`, species: t.species, name: sp.name, level: t.level, hp: Math.round((maxHp * t.hpPct) / 100), maxHp, active: false });
    });
    return out.slice(0, 5);
  }

  /** Faixa de 5 slots: mini-retrato, nível e PV. Slots sem Digimon ficam vazios. */
  private renderTeam(): void {
    const team = this.teamMembers();
    const key = team.map((t) => `${t.species}:${t.level}:${t.hp}`).join("|");
    if (key === this.lastTeamKey) return;
    const repaint = this.lastTeamKey.split("|").map((s) => s.split(":")[0]).join() !== team.map((t) => t.species).join();
    this.lastTeamKey = key;
    if (repaint || this.teamStrip.children.length !== 5) {
      this.teamStrip.innerHTML = Array.from({ length: 5 }, (_, i) => {
        const t = team[i];
        if (!t) return `<div class="slot empty"></div>`;
        return `<button class="slot${t.active ? " active" : ""}" data-slot="${t.slot}" title="${esc(t.name)}">
          <span class="lv">Nv.${t.level}</span>
          <canvas class="pt" width="40" height="40" data-species="${t.species}"></canvas>
          <div class="hud-bar hp seg"><i></i></div></button>`;
      }).join("");
      this.teamStrip.querySelectorAll("canvas").forEach((c) => this.paint(c));
      this.teamStrip.querySelectorAll<HTMLElement>("[data-slot]").forEach((b) =>
        b.addEventListener("click", () => {
          this.selected = b.dataset.slot!;
          this.openTeam();
        }),
      );
    }
    team.forEach((t, i) => {
      const slot = this.teamStrip.children[i] as HTMLElement;
      slot.querySelector(".lv")!.textContent = `Nv.${t.level}`;
      slot.querySelector<HTMLElement>(".hud-bar i")!.style.width = `${Math.round((t.hp / t.maxHp) * 100)}%`;
    });
  }

  /** Minimapa, coordenadas e quadros por segundo (chamar algumas vezes por segundo, não por quadro). */
  updateWorld(me: { x: number; y: number } | undefined, dots: MinimapDot[], fps?: number): void {
    if (me) {
      this.coordEl.textContent = `${Math.floor(me.x / 32)}, ${Math.floor(me.y / 32)}`;
      this.opts.minimap?.draw(this.minimapCanvas, me, dots);
    }
    if (fps !== undefined) this.root.querySelector('[data-testid="fps"]')!.textContent = `${Math.round(fps)} qps`;
  }

  // ---------- modal Equipe & Box ----------

  get teamOpen(): boolean {
    return !this.modal.hidden && this.modal.classList.contains("open");
  }

  toggleTeam(): void {
    if (this.teamOpen) this.closeTeam();
    else this.openTeam();
  }

  openTeam(): void {
    clearTimeout(this.closeTimer);
    this.renderModal();
    this.modal.hidden = false;
    // Força o layout antes de ligar a classe, para a transição (fade + escala) acontecer.
    void this.modal.offsetWidth;
    this.modal.classList.add("open");
  }

  closeTeam(): void {
    if (this.modal.hidden) return;
    this.modal.classList.remove("open");
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      if (!this.modal.classList.contains("open")) this.modal.hidden = true;
    }, 200);
  }

  private boxMembers(): TeamMember[] {
    return this.scene.box.flatMap((b, i) => {
      const sp = this.content.species[b.species];
      if (!sp) return [];
      const maxHp = statsAtLevel(sp.base, sp.growth, b.level).hp;
      return [{ slot: `box${i}`, species: b.species, name: sp.name, level: b.level, hp: maxHp, maxHp, active: false }];
    });
  }

  private card(t: TeamMember): string {
    const stars = "★".repeat(Math.min(4, (this.content.species[t.species]?.stage ?? 1) + 1));
    return `<button class="card${t.slot === this.selected ? " sel" : ""}${t.active ? " active" : ""}" data-pick="${t.slot}" data-name="${esc(t.name.toLowerCase())}">
      <span class="stars">${stars}</span>
      <canvas class="pt" width="44" height="44" data-species="${t.species}"></canvas>
      <b>${esc(t.name)}</b><small>Nv.${t.level} ${t.hp}/${t.maxHp}</small></button>`;
  }

  private sheet(t: TeamMember | undefined): string {
    if (!t) return `<div class="sheet empty">Selecione um Digimon.</div>`;
    const sp = this.content.species[t.species];
    const st = statsAtLevel(sp.base, sp.growth, t.level);
    const max = Math.max(st.hp, 1);
    const row = (label: string, v: number, scaleMax: number) =>
      `<tr><th>${label}</th><td>${v}</td><td><div class="stat"><i style="width:${Math.min(100, Math.round((v / scaleMax) * 100))}%"></i></div></td></tr>`;
    const xp = t.active ? this.partnerXp : undefined;
    return `<div class="sheet">
      <div class="sheet-head">
        <canvas class="pt big" width="72" height="72" data-species="${t.species}"></canvas>
        <div><h3>${esc(t.name)} <span>Nv.${t.level}</span>${t.active ? '<em class="tag">ativo</em>' : ""}</h3>
          <div class="chips"><span class="chip">${STAGES[sp.stage] ?? `Estágio ${sp.stage}`}</span><span class="chip aff-${sp.affinity}">${AFFINITY[sp.affinity] ?? sp.affinity}</span></div>
          <div class="row"><label>PV</label><div class="hud-bar hp"><i style="width:${Math.round((t.hp / t.maxHp) * 100)}%"></i></div><em>${t.hp}/${t.maxHp}</em></div>
          ${xp ? `<div class="row"><label>XP</label><div class="hud-bar xp"><i style="width:${Math.round((xp.xp / Math.max(1, xp.next)) * 100)}%"></i></div><em>${xp.xp}/${xp.next}</em></div>` : ""}
        </div>
      </div>
      <table class="stats">${row("PV", st.hp, max * 1.2)}${row("Ataque", st.atk, 60)}${row("Defesa", st.def, 60)}${row("Velocidade", st.spd, 60)}</table>
      <h4>Golpes</h4>
      <ul class="moves">${sp.skills.map((id) => {
        const sk = this.content.skills[id];
        return `<li><span>${esc(sk?.name ?? id)}</span><em>${sk ? `Poder ${sk.power}` : ""}</em></li>`;
      }).join("")}</ul>
      <div class="actions">
        ${[["evo", "Evoluir"], ["moves", "Golpes"], ["item", "Item"], ["release", "Soltar"]].map(([n, l]) => `<button class="act ${n}" disabled title="Bloqueado nesta prova visual">${icon(n === "evo" ? "evo" : n === "moves" ? "arena" : n === "item" ? "bag" : "gift", 14)}${l}</button>`).join("")}
      </div>
      <p class="note">Ações desabilitadas até a validação da prova visual.</p>
    </div>`;
  }

  private renderModal(): void {
    const team = this.teamMembers();
    const box = this.boxMembers();
    const all = [...team, ...box];
    if (!all.some((t) => t.slot === this.selected)) this.selected = team[0]?.slot ?? box[0]?.slot ?? "";
    const el = this.modal.querySelector<HTMLElement>(".modal")!;
    el.innerHTML = `
      <header><h2>EQUIPE &amp; BOX</h2>
        <div class="tabs"><button class="tab on">${icon("team", 14)}Digimon</button><button class="tab" data-soon="Times salvos">${icon("quest", 14)}Times salvos</button></div>
        <button class="x" data-act="close" title="Fechar (Esc)">×</button></header>
      <div class="modal-body">
        <div class="left">
          <div class="sec"><b>Equipe</b> <span>${team.length}/5</span></div>
          <div class="cards team">${team.map((t) => this.card(t)).join("")}${Array.from({ length: 5 - team.length }, () => '<div class="card empty"></div>').join("")}</div>
          <div class="sec"><b>Box</b> <span>${box.length}/60</span><div class="boxbar"><i style="width:${Math.round((box.length / 60) * 100)}%"></i></div></div>
          <input class="search" type="search" placeholder="buscar..." aria-label="Buscar no Box" />
          <div class="cards box">${box.map((t) => this.card(t)).join("")}</div>
          <div class="pager"><button disabled>‹</button><span>1/1</span><button disabled>›</button></div>
        </div>
        <div class="right">${this.sheet(all.find((t) => t.slot === this.selected))}</div>
      </div>`;
    el.querySelectorAll("canvas").forEach((c) => this.paint(c));
    el.querySelectorAll<HTMLElement>("[data-pick]").forEach((b) =>
      b.addEventListener("click", () => {
        this.selected = b.dataset.pick!;
        el.querySelectorAll(".card.sel").forEach((c) => c.classList.remove("sel"));
        b.classList.add("sel");
        const right = el.querySelector<HTMLElement>(".right")!;
        right.innerHTML = this.sheet(all.find((t) => t.slot === this.selected));
        right.querySelectorAll("canvas").forEach((c) => this.paint(c));
      }),
    );
    const search = el.querySelector<HTMLInputElement>(".search")!;
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      el.querySelectorAll<HTMLElement>(".cards.box .card").forEach((c) => (c.hidden = !!q && !c.dataset.name!.includes(q)));
    });
    search.addEventListener("keydown", (e) => e.stopPropagation());
  }
}
