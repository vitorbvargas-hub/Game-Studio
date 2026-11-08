// HUD mínima em DOM: parceira, AUTO, Fugir, log de eventos e barra de menus (inativa neste slice).
// Só emite intents (via callbacks) e lê eventos confirmados; nunca altera o estado do jogo.

import type { WorldContent } from "../sim/species";
import type { EntitySnapshot, WorldEvent } from "../sim/types";

export interface HudCallbacks {
  onAuto(on: boolean): void;
  onFlee(): void;
}

const MENUS = ["Equipe", "Bolsa", "Digidex", "Mapa", "Missões", "Config"];
const MAX_LOG = 7;

export class Hud {
  private auto = false;
  private autoBtn: HTMLButtonElement;
  private fleeBtn: HTMLButtonElement;
  private log: HTMLOListElement;
  private partnerBox: HTMLDivElement;
  private names = new Map<string, string>();
  private lastPartnerHtml = "";

  constructor(
    root: HTMLElement,
    private readonly content: WorldContent,
    private readonly playerId: string,
    cb: HudCallbacks,
    initialAuto: boolean,
  ) {
    root.innerHTML = `
      <div class="hud-top">
        <div class="hud-partner" data-testid="partner"></div>
        <div class="hud-actions">
          <button class="hud-btn" data-act="auto" aria-pressed="false">AUTO</button>
          <button class="hud-btn" data-act="flee">Fugir</button>
        </div>
      </div>
      <ol class="hud-log" aria-live="polite"></ol>
      <nav class="hud-menu">${MENUS.map((m) => `<button class="hud-btn" disabled title="Em breve">${m}</button>`).join("")}</nav>
      <div class="hud-help">Clique/toque no chão para andar · WASD · clique num Digimon para lutar</div>`;
    this.autoBtn = root.querySelector('[data-act="auto"]')!;
    this.fleeBtn = root.querySelector('[data-act="flee"]')!;
    this.log = root.querySelector(".hud-log")!;
    this.partnerBox = root.querySelector(".hud-partner")!;
    this.autoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.setAuto(!this.auto);
      cb.onAuto(this.auto);
    });
    this.fleeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cb.onFlee();
    });
    this.setAuto(initialAuto);
  }

  setAuto(on: boolean): void {
    this.auto = on;
    this.autoBtn.classList.toggle("on", on);
    this.autoBtn.setAttribute("aria-pressed", String(on));
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

  private mine(id: string | undefined): boolean {
    return !!id && (id === this.playerId || id.startsWith(`${this.playerId}:`));
  }

  /** Eventos confirmados → linhas de log (só os que envolvem o jogador local). */
  onEvents(events: WorldEvent[]): void {
    for (const ev of events) {
      if (ev.t === "spawn") this.names.set(ev.entity.id, ev.entity.name);
      switch (ev.t) {
        case "encounter_start":
          if (ev.members.some((m) => this.mine(m))) this.push(`Combate: ${ev.members.map((m) => this.name(m)).join(" × ")}`);
          break;
        case "defeat":
          if (this.mine(ev.id)) this.push(`${this.name(ev.id)} foi derrotado!`, "bad");
          else if (this.mine(ev.by)) this.push(`${this.name(ev.id)} derrotado.`, "good");
          break;
        case "reward":
          if (ev.ownerId === this.playerId) this.push(`+${ev.xp} XP · +${ev.bits} bits`, "good");
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

  updatePartner(p: EntitySnapshot | undefined, xp: number, xpNext: number, bits: number): void {
    if (!p) return;
    const hpPct = Math.round((p.hp / p.maxHp) * 100);
    const xpPct = xpNext > 0 ? Math.round((xp / xpNext) * 100) : 0;
    const html = `
      <div class="hud-name">${p.name} <span>LV ${p.level}</span></div>
      <div class="hud-bar hp"><i style="width:${hpPct}%"></i></div>
      <div class="hud-sub">${p.hp}/${p.maxHp} HP · ${p.state}</div>
      <div class="hud-bar xp"><i style="width:${xpPct}%"></i></div>
      <div class="hud-sub">${xp}/${xpNext} XP · ${bits} bits</div>`;
    if (html === this.lastPartnerHtml) return;
    this.lastPartnerHtml = html;
    this.partnerBox.innerHTML = html;
  }
}
