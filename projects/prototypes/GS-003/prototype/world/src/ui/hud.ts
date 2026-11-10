// HUD em DOM sobre o canvas, no padrão estrutural do IdleDex (referência canônica, ADR-010): barra inferior com
// minimapa, inventário, atalhos, XP do Tamer, Digimon ativo e equipe; AUTO no topo central; moeda e eventos à
// direita; log de batalha à direita; chat recolhido à esquerda; modal "Equipe & Box".
// Só emite intents (via callbacks) e lê eventos confirmados/snapshots; nunca altera o estado do jogo.
// Equipe extra, Box, nível do Tamer, chat e eventos vêm dos DADOS DE CENA (placeholders de apresentação).

import { statsAtLevel } from "@game/src/sim/formulas";
import type { PortraitFn } from "../render/portrait";
import type { WorldContent } from "../sim/species";
import type { AutoRule, EntitySnapshot, MoveDef, WorldEvent } from "../sim/types";
import { icon } from "./icons";
import type { Minimap, MinimapDot } from "./minimap";
import { evolutionSectionHtml } from "./evolve-ui";
import { affinityColor, hpPct, hpTier, MOVE_KIND_V2, tamerBlockHtml, type HudVariant, type TamerVitals } from "./hud-v2";
import { editRules, moveBarHtml, movesTabHtml, readOnlyView, rulesFor, updateMoveBar, type MovesView } from "./moves-ui";

export interface HudCallbacks {
  onAuto(on: boolean): void;
  onFlee(): void;
  /** Golpes (intents): usar o golpe do slot, trocar os 4 slots, lista de prioridade do AUTO, evoluir. */
  onUseMove?(slot: number): void;
  onSetMoves?(slots: (string | null)[]): void;
  onSetAutoRules?(rules: AutoRule[]): void;
  onEvolve?(): void;
  /** Preferência do Auto-evoluir numa ramificação (null = perguntar sempre). */
  onSetEvoPref?(from: string, to: string | null): void;
  /** Opção "Auto-evoluir" do AUTO. */
  onAutoEvolve?(on: boolean): void;
  /** Atalho de uma tela secundária ligada (map, dex, inv, quest, gear); o resto avisa "em breve". */
  onShortcut?(id: string): void;
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
  /** Desenha o ícone de um golpe (render/vfx/icon.ts); ausente = sem ícone (ex.: testes em jsdom). */
  moveIcon?: (c: HTMLCanvasElement, m: MoveDef | undefined) => void;
  minimap?: Minimap;
  /** Atalhos com tela própria (onShortcut); "team" é sempre do HUD. */
  shortcuts?: string[];
  /** P8: "v2" liga o HUD v2 (?hud=v2: bloco do Tamer, molduras nível 1 reativas, hotbar por categoria). */
  variant?: HudVariant;
}

/** Atalhos da grade (2 × 6). Só "Equipe" abre algo nesta prova; o resto avisa "Em breve". */
export const SHORTCUTS: { id: string; label: string; icon: string; key?: string }[] = [
  { id: "team", label: "Equipe & Box", icon: "team", key: "E" },
  { id: "dex", label: "Digivice", icon: "dex", key: "V" },
  { id: "quest", label: "Missões", icon: "quest", key: "Q" },
  { id: "map", label: "Mapa-múndi", icon: "map", key: "M" },
  { id: "shop", label: "Loja", icon: "shop" },
  { id: "evo", label: "Evolução", icon: "evo" },
  { id: "arena", label: "Arena", icon: "trophy" },
  { id: "friends", label: "Amigos", icon: "friends" },
  { id: "guild", label: "Guilda", icon: "guild" },
  { id: "trophy", label: "Conquistas", icon: "star" },
  { id: "mail", label: "Correio", icon: "mail" },
  { id: "gear", label: "Configurações", icon: "gear", key: "O" },
];

const STAGES: Record<number, string> = { 1: "Bebê", 2: "Criança", 3: "Adulto", 4: "Perfeito", 5: "Supremo" };
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

/**
 * O aviso "X digivolveu para Y!" (e os golpes novos) espera o clarão da digivolução no mapa: main.ts chama
 * releaseEvolve() quando o presenter revela a forma nova; sem isso (parceira fora da tela), sai depois deste prazo.
 */
export const EVO_ANNOUNCE_FALLBACK_MS = 4500;

export class Hud {
  private auto = false;
  private autoEvolve = false;
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
  /** Avisos da última digivolução esperando a forma nova aparecer no mapa. */
  private evoHeld: (() => void)[] | null = null;
  private evoTimer?: ReturnType<typeof setTimeout>;
  /** Último nível/XP mostrado no painel da parceira (para animar a barra). */
  private partnerShown?: { level: number; xp: number; pct: number };
  private xpTimer?: ReturnType<typeof setTimeout>;
  private lastTeamKey = "";
  private partner?: EntitySnapshot;
  private partnerXp = { xp: 0, next: 1 };
  private tamerLevel: number;
  private tamerXp = 0;
  private selected = "active";
  private toastTimer?: ReturnType<typeof setTimeout>;
  private learnEl: HTMLElement;
  private learnQueue: { title: string; sub: string; move?: string }[] = [];
  private learnTimer?: ReturnType<typeof setTimeout>;
  private moveBar: HTMLElement;
  private movesView?: MovesView;
  private movesKey = "";
  private tab: "digimon" | "moves" = "digimon";
  private swapping?: string;
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
        <div class="pill" data-testid="daytime"><i data-testid="clock-icon">${icon("sun", 14)}</i><b data-testid="phase">Dia</b><span data-testid="clock">14:20</span></div>
        <div class="pill region">${icon("map", 14)}<b>${esc(sc.region.name)}</b><span>${esc(sc.region.route)}</span></div>
        <div class="pill dim"><span data-testid="fps">-- qps</span></div>
      </div>
      <div class="hud-auto">
        <button class="auto-btn" data-act="auto" aria-pressed="false" title="Caça automática"><span>AUTO</span><i data-testid="auto-state">DESL.</i></button>
        <div class="auto-row">
          <button class="flee-btn" data-act="flee" title="Fugir do combate (F)">Fugir</button>
          <button class="autoevo-btn" data-act="autoevo" aria-pressed="false" title="Auto-evoluir: ao atingir o nível, a parceira evolui sozinha fora de combate (herda até 2 golpes)">${icon("evo", 12)}Auto-evoluir <i data-testid="autoevo-state">DESL.</i></button>
        </div>
      </div>
      <div class="hud-tr">
        <div class="coins">${icon("coin", 16)}<b data-testid="coins">0</b><span>bits</span><button class="plus" data-soon="Loja" title="Em breve">+</button></div>
        <button class="event gold" data-soon="Passe de Temporada">${icon("star", 16)}<b>PASSE DE TEMPORADA</b></button>
        <div class="event">${icon("gift", 16)}<span>Fonte dos Desejos</span><em>61%</em></div>
        <div class="icon-grid">
          ${["arena", "map", "friends", "mail", "boss", "trophy"].map((n) => (n === "trophy" && this.enabled("arena") ? `<button data-short="arena" title="Arena (PvP local)">${icon(n, 18)}</button>` : `<button data-soon="Evento" title="Em breve">${icon(n, 18)}</button>`)).join("")}
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
      <div class="hud-learn" role="status" aria-live="polite"><canvas width="24" height="24"></canvas><div><b></b><small></small></div></div>
      ${moveBarHtml()}
      <div class="hud-tamerxp" title="Experiência do Tamer"><span>NÍVEL <b data-testid="tamer-level">${this.tamerLevel}</b></span><div class="bar"><i></i></div></div>
      <div class="hud-bottom">
        <div class="mm">
          <div class="mm-tag" data-testid="mm-region">${esc(sc.region.name)}</div>
          <canvas width="128" height="80" data-testid="minimap"></canvas>
          <div class="mm-coord" data-testid="coords">—</div>
          ${this.enabled("map") ? `<button class="mm-world" data-short="map" title="Mapa-múndi (M)">${icon("map", 12)}Mapa-múndi</button>` : ""}
        </div>
        ${this.enabled("inv") ? `<button class="inv" data-short="inv" title="Inventário (I)">` : `<button class="inv" data-soon="Inventário" title="Inventário (em breve)">`}${icon("chest", 34)}<span>Inventário</span></button>
        <nav class="hud-menu">
          <button class="bag" data-soon="Bolsa" title="Bolsa">${icon("bag", 30)}</button>
          <div class="grid">${SHORTCUTS.map((s) => { const on = s.id === "team" || this.enabled(s.id); return `<button data-short="${s.id}" ${on ? "" : 'aria-disabled="true"'} title="${s.label}${on && s.key ? ` (${s.key})` : on ? "" : " — em breve"}">${icon(s.icon, 20)}</button>`; }).join("")}</div>
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
    this.learnEl = q(".hud-learn");
    this.moveBar = q(".hud-moves");
    this.moveBar.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>("[data-mv]");
      if (!b || b.classList.contains("empty")) return;
      e.stopPropagation();
      cb.onUseMove?.(Number(b.dataset.mv));
    });
    this.bindMovesTab(cb);
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
    q<HTMLButtonElement>('[data-act="autoevo"]').addEventListener("click", (e) => {
      e.stopPropagation();
      this.setAutoEvolve(!this.autoEvolve);
      cb.onAutoEvolve?.(this.autoEvolve);
    });
    root.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const short = t.closest<HTMLElement>("[data-short]");
      const soon = t.closest<HTMLElement>("[data-soon]");
      const act = t.closest<HTMLElement>("[data-act]")?.dataset.act;
      if (short?.dataset.short === "team") this.openTeam();
      else if (short && this.enabled(short.dataset.short!)) cb.onShortcut?.(short.dataset.short!);
      else if (short) this.toast(`${short.title.replace(/ — em breve$/, "")}: em breve`);
      else if (soon) this.toast(`${soon.dataset.soon}: em breve`);
      else if (act === "chat") this.chatEl.classList.toggle("collapsed");
      else if (act === "close") this.closeTeam();
      else if (act === "tab-digimon" || act === "tab-moves") this.setTab(act === "tab-moves" ? "moves" : "digimon");
      else if (act === "goto-moves") this.setTab("moves");
      else if (act === "evolve") cb.onEvolve?.();
    });
    this.setAuto(initialAuto);
    this.renderTamerXp();
    if (this.v2) {
      root.classList.add("hud-v2");
      this.partnerBox.classList.add("f1");
      this.partnerBox.insertAdjacentHTML("beforebegin", tamerBlockHtml({ name: sc.tamerName, level: this.tamerLevel, hp: 1, maxHp: 1, energy: 1, maxEnergy: 1 }));
      this.moveBar.classList.add("f1");
    }
  }

  get v2(): boolean {
    return this.opts.variant === "v2";
  }

  /** P8 v2: bloco do Tamer (PV + Energia, moldura reativa). Sem a flag não faz nada. */
  updateTamer(v: TamerVitals): void {
    const el = this.root.querySelector<HTMLElement>(".hud-tamer");
    if (!el) return;
    const hp = hpPct(v.hp, v.maxHp);
    const tier = hpTier(hp);
    if (el.dataset.tier !== tier) {
      el.classList.remove("tier-ok", "tier-warn", "tier-crit");
      el.classList.add(`tier-${tier}`);
      el.dataset.tier = tier;
    }
    el.querySelector<HTMLElement>('[data-testid="tamer-name"]')!.textContent = v.name;
    el.querySelector<HTMLElement>('[data-testid="tamer-lv"]')!.textContent = String(v.level);
    el.querySelector<HTMLElement>('[data-testid="tamer-hp"]')!.style.width = `${hp}%`;
    el.querySelector<HTMLElement>('[data-testid="tamer-en"]')!.style.width = `${hpPct(v.energy, v.maxEnergy)}%`;
    el.title = `${v.name} — PV ${v.hp}/${v.maxHp}`;
  }

  /** P8 v2: borda da hotbar pela categoria do golpe de cada slot (§4.4). */
  private paintMoveKinds(v: MovesView): void {
    this.moveBar.querySelectorAll<HTMLElement>(".mv").forEach((b, i) => {
      const id = v.moves[i];
      const kind = id ? this.content.moves.moves[id]?.type : undefined;
      if ((b.dataset.kind ?? "") === (kind ?? "")) return;
      if (kind) {
        b.dataset.kind = kind;
        b.style.setProperty("--mk-border", MOVE_KIND_V2[kind].border);
        b.style.setProperty("--mk-bg", MOVE_KIND_V2[kind].bg);
      } else {
        delete b.dataset.kind;
        b.style.removeProperty("--mk-border");
        b.style.removeProperty("--mk-bg");
      }
    });
  }

  /** P8 v2: moldura nível 1 do parceiro (faixa de PV, §2.1) e anel do retrato na cor do atributo (§4.1). */
  private paintPartnerFrame(p: EntitySnapshot): void {
    const tier = hpTier(hpPct(p.hp, p.maxHp));
    const box = this.partnerBox;
    if (box.dataset.tier !== tier) {
      box.classList.remove("tier-ok", "tier-warn", "tier-crit");
      box.classList.add(`tier-${tier}`);
      box.dataset.tier = tier;
    }
    const aff = p.speciesId ? this.content.species[p.speciesId]?.affinity : undefined;
    box.style.setProperty("--ring", affinityColor(aff));
    box.dataset.affinity = aff ?? "";
  }

  setAutoEvolve(on: boolean): void {
    this.autoEvolve = on;
    const b = this.root.querySelector<HTMLButtonElement>('[data-act="autoevo"]')!;
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", String(on));
    b.querySelector("i")!.textContent = on ? "LIG." : "DESL.";
  }

  /** Nível e XP do Tamer (para o save). */
  tamerProgress(): { level: number; xp: number } {
    return { level: this.tamerLevel, xp: this.tamerXp };
  }

  setTamerProgress(level: number, xp: number): void {
    this.tamerLevel = Math.max(1, Math.floor(level));
    this.tamerXp = Math.max(0, Math.floor(xp));
    this.renderTamerXp();
  }

  /** Há avisos de digivolução esperando o clarão. */
  get evolvePending(): boolean {
    return !!this.evoHeld;
  }

  /** Solta os avisos da digivolução ("X digivolveu para Y!" e os golpes novos). */
  releaseEvolve(): void {
    clearTimeout(this.evoTimer);
    const held = this.evoHeld;
    this.evoHeld = null;
    for (const f of held ?? []) f();
  }

  /** XP do Tamer ganha fora do log de combate (relatório offline). Devolve quantos níveis subiu. */
  addTamerXp(xp: number): number {
    const from = this.tamerLevel;
    this.tamerXp += Math.max(0, Math.floor(xp));
    while (this.tamerXp >= this.tamerNext()) {
      this.tamerXp -= this.tamerNext();
      this.tamerLevel++;
    }
    this.renderTamerXp();
    return this.tamerLevel - from;
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

  push(text: string, cls = ""): void {
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
        case "move_learned":
          if (this.mine(ev.id)) {
            const m = this.content.moves.moves[ev.moveId];
            const text = `${this.name(ev.id)} aprendeu ${m?.name ?? ev.moveId}!`;
            const show = () => {
              this.push(text, "gold");
              this.announce(text, ev.slot !== null ? `Equipado no slot ${ev.slot + 1}.` : "Abra Equipe & Box → Golpes para equipar.", ev.moveId);
            };
            if (this.evoHeld) this.evoHeld.push(show);
            else show();
          }
          break;
        case "evolve":
          if (this.mine(ev.id)) {
            const to = this.content.species[ev.to]?.name ?? ev.to;
            const text = `${this.name(ev.id)} digivolveu para ${to}!`;
            this.names.set(ev.id, to);
            const sub = ev.kept.length ? `Manteve ${ev.kept.map((id) => this.content.moves.moves[id]?.name ?? id).join(" e ")}.` : "Golpes novos liberados.";
            // Segura este aviso e os golpes novos até o clarão da animação no mapa (sem estragar a surpresa).
            this.releaseEvolve();
            this.evoHeld = [
              () => {
                this.push(text, "gold");
                this.announce(text, sub);
              },
            ];
            this.evoTimer = setTimeout(() => this.releaseEvolve(), EVO_ANNOUNCE_FALLBACK_MS);
          }
          break;
        case "moves_changed":
          if (this.mine(ev.id)) this.push("Golpes ativos atualizados.", "dim");
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

  /** Aviso grande de golpe aprendido / evolução, em fila (um por vez). */
  private announce(title: string, sub: string, move?: string): void {
    this.learnQueue.push({ title, sub, move });
    if (!this.learnTimer) this.nextAnnounce();
  }

  private nextAnnounce(): void {
    const n = this.learnQueue.shift();
    if (!n) {
      this.learnEl.classList.remove("show");
      this.learnTimer = undefined;
      return;
    }
    this.learnEl.querySelector("b")!.textContent = n.title;
    this.learnEl.querySelector("small")!.textContent = n.sub;
    const cnv = this.learnEl.querySelector("canvas")!;
    cnv.hidden = !n.move;
    if (n.move) this.icon(cnv, this.content.moves.moves[n.move]);
    this.learnEl.classList.remove("show");
    void this.learnEl.offsetWidth;
    this.learnEl.classList.add("show");
    this.learnTimer = setTimeout(() => this.nextAnnounce(), 2800);
  }

  private icon(c: HTMLCanvasElement, m: MoveDef | undefined): void {
    try {
      this.opts.moveIcon?.(c, m);
    } catch {
      /* sem canvas (ex.: jsdom) */
    }
  }

  /** Golpes da parceira ativa (somente leitura da sim): barra do HUD e, se aberta, a aba Golpes. */
  updateMoves(v: MovesView): void {
    this.movesView = v;
    updateMoveBar(this.moveBar, this.content.moves, v, (c, m) => this.icon(c, m));
    if (this.v2) this.paintMoveKinds(v);
    const key = JSON.stringify([v.speciesId, v.level, v.learned, v.moves, v.autoRules, v.inCombat, v.evolve?.ready, v.stats, v.evoPrefs]);
    if (key === this.movesKey) return;
    this.movesKey = key;
    if (this.teamOpen && (this.tab === "moves" || this.selected === "active")) this.renderRight();
  }

  setTab(tab: "digimon" | "moves"): void {
    this.tab = tab;
    this.swapping = undefined;
    if (this.teamOpen) this.renderModal();
  }

  get movesTab(): boolean {
    return this.tab === "moves";
  }

  private activeView(): MovesView | undefined {
    return this.selected === "active" ? this.movesView : undefined;
  }

  /** Interações da aba Golpes (delegadas: o conteúdo é refeito a cada atualização). */
  private bindMovesTab(cb: HudCallbacks): void {
    const rules = (): AutoRule[] => (this.movesView ? rulesFor(this.movesView).map((r) => ({ ...r })) : []);
    this.modal.addEventListener("click", (e) => {
      const t = e.target as HTMLElement;
      const v = this.activeView();
      if (!v || !this.movesTab) return;
      const swap = t.closest<HTMLElement>("[data-swap]")?.dataset.swap;
      const slot = t.closest<HTMLElement>(".mslot.pick")?.dataset.slot;
      const clear = t.closest<HTMLElement>("[data-clear]")?.dataset.clear;
      const edited = editRules(rules(), v.moves, e as unknown as { type: string; target: HTMLElement });
      if (swap !== undefined) {
        this.swapping = this.swapping === swap ? undefined : swap;
        this.renderRight();
      } else if (slot !== undefined && this.swapping) {
        const slots = [...v.moves];
        const from = slots.indexOf(this.swapping);
        const i = Number(slot);
        if (from >= 0) slots[from] = slots[i];
        slots[i] = this.swapping;
        this.swapping = undefined;
        cb.onSetMoves?.(slots);
        this.renderRight();
      } else if (clear !== undefined) {
        const slots = [...v.moves];
        slots[Number(clear)] = null;
        cb.onSetMoves?.(slots);
      } else if (edited) cb.onSetAutoRules?.(edited);
    });
    this.modal.addEventListener("change", (e) => {
      const t = e.target as HTMLInputElement | HTMLSelectElement;
      if (!this.activeView() || !this.movesTab) return;
      if (t.dataset.evoPref !== undefined) return cb.onSetEvoPref?.(t.dataset.evoPref, t.value || null);
      const r = editRules(rules(), this.activeView()!.moves, e as unknown as { type: string; target: HTMLElement });
      if (r) cb.onSetAutoRules?.(r);
    });
    this.modal.addEventListener("keydown", (e) => e.stopPropagation());
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
    // A estrutura só é refeita quando muda a espécie/nome; nível, PV e XP mudam no lugar, para a barra animar.
    const html = `
      <canvas class="pt" width="56" height="56" data-species="${p.speciesId ?? ""}"></canvas>
      <div class="info">
        <div class="hud-name">${esc(p.name)} <span>Nv.${p.level}</span></div>
        <div class="row"><label>PV</label><div class="hud-bar hp seg"><i style="width:${hpPct}%"></i></div><em>${p.hp}/${p.maxHp}</em></div>
        <div class="row"><label>XP</label><div class="hud-bar xp"><i style="width:${xpPct}%"></i></div><em>${xp}/${xpNext}</em><b class="xp-gain" aria-hidden="true"></b></div>
      </div>`;
    const shape = `${p.speciesId}|${p.name}`;
    const last = this.partnerShown;
    if (shape !== this.lastPartnerHtml) {
      const speciesChanged = !this.lastPartnerHtml.startsWith(`${p.speciesId}|`);
      const old = this.partnerBox.querySelector("canvas");
      this.lastPartnerHtml = shape;
      this.partnerBox.innerHTML = html;
      const cnv = this.partnerBox.querySelector("canvas")!;
      if (old && !speciesChanged) cnv.replaceWith(old);
      else this.paint(cnv);
    } else {
      this.partnerBox.querySelector(".hud-name span")!.textContent = `Nv.${p.level}`;
      const [hpRow, xpRow] = this.partnerBox.querySelectorAll<HTMLElement>(".row");
      hpRow.querySelector<HTMLElement>("i")!.style.width = `${hpPct}%`;
      hpRow.querySelector("em")!.textContent = `${p.hp}/${p.maxHp}`;
      xpRow.querySelector("em")!.textContent = `${xp}/${xpNext}`;
      this.animateXp(xpRow, last, { level: p.level, xp, pct: xpPct });
    }
    this.partnerShown = { level: p.level, xp, pct: xpPct };
    if (this.v2) this.paintPartnerFrame(p);
    this.renderTeam();
  }

  /** Barra de XP: enche até o novo valor; no level up enche até o fim, brilha e recomeça do zero. "+N" ao lado. */
  private animateXp(row: HTMLElement, last: { level: number; xp: number; pct: number } | undefined, now: { level: number; xp: number; pct: number }): void {
    const bar = row.querySelector<HTMLElement>(".hud-bar.xp i")!;
    if (!last || (last.level === now.level && last.xp === now.xp)) return;
    const gain = row.querySelector<HTMLElement>(".xp-gain");
    if (now.level > last.level) {
      clearTimeout(this.xpTimer);
      bar.style.width = "100%";
      this.partnerBox.classList.remove("lvup");
      void this.partnerBox.offsetWidth;
      this.partnerBox.classList.add("lvup");
      this.xpTimer = setTimeout(() => {
        bar.style.transition = "none";
        bar.style.width = "0%";
        void bar.offsetWidth;
        bar.style.transition = "";
        bar.style.width = `${this.partnerShown?.pct ?? now.pct}%`;
      }, 420);
      if (gain) this.flashGain(gain, `Nv.${now.level}!`);
    } else if (now.level === last.level && now.xp > last.xp) {
      bar.style.width = `${now.pct}%`;
      if (gain) this.flashGain(gain, `+${now.xp - last.xp}`);
    } else bar.style.width = `${now.pct}%`;
  }

  private flashGain(el: HTMLElement, text: string): void {
    el.textContent = text;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
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
  /** Relógio do jogo no canto superior esquerdo: fase ("Dia", "Anoitecer", "Noite", "Amanhecer") e hora. */
  private enabled(id: string): boolean {
    return !!this.opts.shortcuts?.includes(id);
  }

  /** Região atual (troca de mapa): pílula do topo e etiqueta do minimapa. */
  setRegion(name: string, route: string): void {
    this.root.querySelector(".pill.region b")!.textContent = name;
    this.root.querySelector(".pill.region span")!.textContent = route;
    this.root.querySelector('[data-testid="mm-region"]')!.textContent = name;
  }

  /** Minimapa do mapa novo (troca de mapa). */
  setMinimap(m: Minimap): void {
    this.opts.minimap = m;
  }

  setClock(phase: string, hhmm: string): void {
    const ph = this.root.querySelector('[data-testid="phase"]')!;
    if (ph.textContent !== phase) {
      ph.textContent = phase;
      this.root.querySelector('[data-testid="clock-icon"]')!.innerHTML = icon(phase === "Dia" || phase === "Amanhecer" ? "sun" : "moon", 14);
      this.root.querySelector('[data-testid="daytime"]')!.classList.toggle("night", phase === "Noite" || phase === "Anoitecer");
    }
    this.root.querySelector('[data-testid="clock"]')!.textContent = hhmm;
  }

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
      <h4>Golpes ativos</h4>
      <ul class="moves">${this.viewFor(t).moves.map((id) => {
        const m = id ? this.content.moves.moves[id] : undefined;
        return m ? `<li><span>${esc(m.name)}</span><em>${m.type === "buff" || m.type === "debuff" ? (m.type === "buff" ? "Buff" : "Debuff") : `Poder ${m.power}`} · ${m.cost} MP</em></li>` : `<li class="dim"><span>— vazio —</span></li>`;
      }).join("")}</ul>
      <div class="actions">
        <button class="act evo" data-act="evolve" ${t.active && this.movesView?.evolve?.ready ? "" : "disabled"} title="${t.active && this.movesView?.evolve ? (this.movesView.evolve.ready ? `${this.movesView.evolve.branching ? "Escolher a evolução" : "Evoluir para"} ${esc(this.movesView.evolve.toName)}` : `Evolui no nível ${this.movesView.evolve.level}`) : "Sem evolução disponível"}">${icon("evo", 14)}Evoluir</button>
        <button class="act moves" data-act="goto-moves" title="Ver e trocar golpes">${icon("arena", 14)}Golpes</button>
        ${[["item", "Item"], ["release", "Soltar"]].map(([n, l]) => `<button class="act ${n}" disabled title="Bloqueado nesta prova visual">${icon(n === "item" ? "bag" : "gift", 14)}${l}</button>`).join("")}
      </div>
      <p class="note">Item e Soltar ficam desabilitados nesta prova.</p>
    </div>`;
  }

  /** Golpes de um membro: o ativo vem da sim; os outros, do learnset pelo nível (só leitura). */
  private viewFor(t: TeamMember): MovesView {
    if (t.active && this.movesView) return this.movesView;
    return readOnlyView(this.content.moves, t.species, t.name, t.level);
  }

  private members(): TeamMember[] {
    return [...this.teamMembers(), ...this.boxMembers()];
  }

  /** Redesenha só o painel da direita (ficha ou aba Golpes), mantendo a grade da esquerda. */
  private renderRight(): void {
    const el = this.modal.querySelector<HTMLElement>(".modal .right");
    if (!el) return;
    const t = this.members().find((m) => m.slot === this.selected);
    if (this.tab === "moves" && t) {
      const v = this.viewFor(t);
      const editable = t.active && !!this.movesView;
      const sp = this.content.species[v.speciesId];
      const stats = v.stats ?? (sp ? statsAtLevel(sp.base, sp.growth, v.level) : { hp: 0, atk: 0, def: 0, spd: 0 });
      const evo = evolutionSectionHtml(this.content, { speciesId: v.speciesId, name: v.name, level: v.level, stats }, this.movesView?.evoPrefs ?? {}, editable);
      el.innerHTML = movesTabHtml(this.content.moves, v, editable, this.swapping, evo);
    } else el.innerHTML = this.sheet(t);
    el.querySelectorAll<HTMLCanvasElement>("canvas[data-icon]").forEach((c) => this.icon(c, this.content.moves.moves[c.dataset.icon!]));
    el.querySelectorAll<HTMLCanvasElement>("canvas[data-species]").forEach((c) => this.paint(c));
  }

  private renderModal(): void {
    const team = this.teamMembers();
    const box = this.boxMembers();
    const all = [...team, ...box];
    if (!all.some((t) => t.slot === this.selected)) this.selected = team[0]?.slot ?? box[0]?.slot ?? "";
    const el = this.modal.querySelector<HTMLElement>(".modal")!;
    el.classList.toggle("wide", this.tab === "moves");
    el.innerHTML = `
      <header><h2>EQUIPE &amp; BOX</h2>
        <div class="tabs"><button class="tab${this.tab === "digimon" ? " on" : ""}" data-act="tab-digimon">${icon("team", 14)}Digimon</button><button class="tab${this.tab === "moves" ? " on" : ""}" data-act="tab-moves" data-testid="tab-moves">${icon("arena", 14)}Golpes / Evolução</button><button class="tab" data-soon="Times salvos">${icon("quest", 14)}Times salvos</button></div>
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
        <div class="right"></div>
      </div>`;
    el.querySelectorAll<HTMLCanvasElement>(".left canvas").forEach((c) => this.paint(c));
    this.renderRight();
    el.querySelectorAll<HTMLElement>("[data-pick]").forEach((b) =>
      b.addEventListener("click", () => {
        this.selected = b.dataset.pick!;
        this.swapping = undefined;
        el.querySelectorAll(".card.sel").forEach((c) => c.classList.remove("sel"));
        b.classList.add("sel");
        this.renderRight();
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
