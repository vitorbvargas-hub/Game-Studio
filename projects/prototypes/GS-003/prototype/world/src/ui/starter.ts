// Tela "Escolha seu parceiro" (depois do criador de Tamer, pt-BR): 5 bebês com sprite animado, nome, atributo e
// prévia da linha evolutiva (2 estágios). O escolhido vira a parceira no nível 1. O desenho do sprite fica fora
// daqui (drawSprite), para a tela não depender de canvas no teste (jsdom); sem arte → placeholder "?".

import startersJson from "../data/starters.json";
import type { SpriteFn } from "../render/portrait";
import type { WorldContent } from "../sim/species";

export interface StarterDef {
  speciesId: string;
  name: string;
  blurb: string;
  line: { id: string; name: string }[];
}

export const STARTERS: StarterDef[] = startersJson.starters;
export const STARTER_LEVEL: number = startersJson.level;

export const AFFINITY_PT: Record<string, string> = { vaccine: "Vacina", data: "Dados", virus: "Vírus", free: "Livre" };
export const STAGE_PT: Record<number, string> = { 1: "Bebê", 2: "Criança", 3: "Adulto", 4: "Perfeito", 5: "Supremo" };

export interface StarterOptions {
  content: WorldContent;
  onConfirm: (speciesId: string) => void;
  drawSprite?: SpriteFn;
  initial?: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Linha evolutiva com o nível de cada passo (do learnset), para a prévia. */
export function linePreview(content: WorldContent, s: StarterDef): { id: string; name: string; level?: number; known: boolean }[] {
  let from = s.speciesId;
  return s.line.map((l) => {
    const evo = content.moves.evolutions[from];
    from = l.id;
    const sp = content.species[l.id];
    return { id: l.id, name: sp?.name ?? l.name, level: evo?.to === l.id ? evo.level : undefined, known: !!sp };
  });
}

export class StarterPicker {
  readonly el: HTMLElement;
  selected: string;
  private raf = 0;

  constructor(
    root: HTMLElement,
    private readonly opts: StarterOptions,
  ) {
    this.selected = STARTERS.some((s) => s.speciesId === opts.initial) ? opts.initial! : STARTERS[0].speciesId;
    const { content } = opts;
    const el = document.createElement("div");
    el.className = "creator starter";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Escolha seu parceiro");
    el.innerHTML = `
      <div class="cr-card">
        <header><h1>Escolha seu parceiro</h1><p>Ele começa como bebê no nível ${STARTER_LEVEL} e evolui com você. Dá para ver a linha evolutiva de cada um.</p></header>
        <div class="st-grid" role="radiogroup" aria-label="Digimon inicial">
          ${STARTERS.map((s) => {
            const sp = content.species[s.speciesId];
            const aff = sp ? AFFINITY_PT[sp.affinity] ?? sp.affinity : "—";
            return `<button type="button" class="st-card" role="radio" data-starter="${s.speciesId}" aria-checked="false">
              <div class="st-sprite"><canvas width="96" height="96" data-sp="${s.speciesId}"></canvas></div>
              <b class="st-name">${esc(sp?.name ?? s.name)}</b>
              <div class="chips"><span class="chip">${STAGE_PT[sp?.stage ?? 1]}</span><span class="chip aff-${sp?.affinity ?? "free"}" data-testid="st-aff">${aff}</span></div>
              <ol class="st-line">${linePreview(content, s)
                .map(
                  (l) => `<li class="${l.known ? "" : "ph"}"><span class="st-mini"><canvas width="64" height="64" data-sp="${l.id}"></canvas></span><span>${esc(l.name)}</span>${l.level ? `<em>Nv.${l.level}</em>` : ""}</li>`,
                )
                .join("")}</ol>
              <small class="st-blurb">${esc(s.blurb)}</small>
            </button>`;
          }).join("")}
        </div>
        <footer>
          <span class="cr-summary" data-testid="st-summary"></span>
          <button type="button" class="cr-go" data-act="confirm"></button>
        </footer>
      </div>`;
    root.appendChild(el);
    this.el = el;
    el.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.dataset.starter) this.select(b.dataset.starter);
      else if (b.dataset.act === "confirm") this.confirm();
    });
    el.addEventListener("keydown", (e) => {
      const i = STARTERS.findIndex((s) => s.speciesId === this.selected);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const n = (i + (e.key === "ArrowRight" ? 1 : STARTERS.length - 1)) % STARTERS.length;
        this.select(STARTERS[n].speciesId);
        el.querySelector<HTMLElement>(`[data-starter="${STARTERS[n].speciesId}"]`)?.focus();
      } else if (e.key === "Enter" && !(e.target as HTMLElement).closest("[data-act]")) {
        e.preventDefault();
        this.confirm();
      }
    });
    this.sync();
    this.paint(0);
    this.start();
  }

  select(speciesId: string): void {
    if (!STARTERS.some((s) => s.speciesId === speciesId)) return;
    this.selected = speciesId;
    this.sync();
  }

  private sync(): void {
    for (const b of this.el.querySelectorAll<HTMLElement>("[data-starter]")) b.setAttribute("aria-checked", String(b.dataset.starter === this.selected));
    const s = STARTERS.find((x) => x.speciesId === this.selected)!;
    const name = this.opts.content.species[s.speciesId]?.name ?? s.name;
    this.el.querySelector('[data-testid="st-summary"]')!.textContent = `${name} → ${linePreview(this.opts.content, s).map((l) => l.name).join(" → ")}`;
    this.el.querySelector('[data-act="confirm"]')!.textContent = `Escolher ${name}`;
  }

  /** Desenha todos os sprites no instante `t`; quem não tem arte ganha o placeholder. */
  paint(t: number): void {
    for (const c of this.el.querySelectorAll<HTMLCanvasElement>("canvas[data-sp]")) {
      let ok = false;
      try {
        // o selecionado anda; os outros ficam no primeiro quadro
        ok = !!this.opts.drawSprite?.(c.dataset.sp!, c, c.closest(`[data-starter="${this.selected}"]`) ? t : 0);
      } catch {
        ok = false;
      }
      c.parentElement!.classList.toggle("ph", !ok);
    }
  }

  private start(): void {
    if (typeof requestAnimationFrame !== "function") return;
    const t0 = performance.now();
    const loop = (now: number) => {
      this.paint(now - t0);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  confirm(): void {
    const id = this.selected;
    this.close();
    this.opts.onConfirm(id);
  }

  close(): void {
    if (this.raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
