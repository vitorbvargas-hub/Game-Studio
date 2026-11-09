// Criador de Tamer (tela antes do mundo, pt-BR): modelo, tom de pele, corte, cor do cabelo, roupa e cor, nome.
// Preview animado (andando) girando nas 4 direções. A composição das camadas fica fora daqui (drawPreview), para a
// tela não depender de canvas no teste (jsdom).

import { LABELS, lookOptions, normalizeLook, PARTS, randomLook, type TamerLook } from "../assets/tamer-parts";

export type PreviewDir = "S" | "E" | "N" | "W";

export interface CreatorOptions {
  initial?: Partial<TamerLook>;
  onConfirm: (look: TamerLook) => void;
  /** Desenha o look no canvas do preview (quadro `frame` do walk na direção `dir`). */
  drawPreview?: (canvas: HTMLCanvasElement, look: TamerLook, dir: PreviewDir, frame: number) => void;
  /** Semente do botão "Aleatório" (padrão: relógio). */
  seed?: number;
}

export const PREVIEW_DIRS: PreviewDir[] = ["S", "E", "N", "W"];
const DIR_LABEL: Record<PreviewDir, string> = { S: "Frente", E: "Direita", N: "Costas", W: "Esquerda" };
/** Tempo em cada direção e duração de um quadro do walk no preview. */
export const PREVIEW_TURN_MS = 1400;
export const PREVIEW_FRAME_MS = 140;

const GROUPS: { key: keyof Omit<TamerLook, "name">; title: string; swatch?: (v: string) => string }[] = [
  { key: "model", title: "Modelo" },
  { key: "skin", title: "Tom de pele", swatch: (v) => PARTS.layers.body.skinTones[v].base },
  { key: "hairCut", title: "Corte" },
  { key: "hairColor", title: "Cor do cabelo", swatch: (v) => PARTS.layers.hair.colors[v].base },
  { key: "outfit", title: "Roupa" },
  { key: "outfitColor", title: "Cor da roupa", swatch: (v) => PARTS.layers.clothing.colorRamps[v].base },
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Direção e quadro do preview no instante `t` (ms): gira S → E → N → W andando. */
export function previewPose(t: number, walkFrames = PARTS.animations.walk.frames): { dir: PreviewDir; frame: number } {
  // o timestamp do rAF pode vir um pouco antes do performance.now() de início: t negativo conta como 0
  t = Math.max(0, t);
  return { dir: PREVIEW_DIRS[Math.floor(t / PREVIEW_TURN_MS) % 4], frame: Math.floor(t / PREVIEW_FRAME_MS) % walkFrames };
}

export class TamerCreator {
  readonly el: HTMLElement;
  look: TamerLook;
  private raf = 0;
  private t0 = 0;
  private rolls = 0;

  constructor(
    root: HTMLElement,
    private readonly opts: CreatorOptions,
  ) {
    this.look = normalizeLook(opts.initial ?? {});
    const o = lookOptions();
    const el = document.createElement("div");
    el.className = "creator";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Criador de Tamer");
    el.innerHTML = `
      <div class="cr-card">
        <header><h1>Crie seu Tamer</h1><p>Esse é você no mundo digital: os outros jogadores veem o seu Tamer andando com o seu Digimon.</p></header>
        <div class="cr-body">
          <div class="cr-preview">
            <canvas data-testid="cr-preview" width="${PARTS.frame.w}" height="${PARTS.frame.h}"></canvas>
            <div class="cr-nameplate" data-testid="cr-nameplate"></div>
            <div class="cr-dir" data-testid="cr-dir">${DIR_LABEL.S}</div>
          </div>
          <div class="cr-form">
            <label class="cr-field"><span>Nome</span>
              <input data-testid="cr-name" maxlength="14" autocomplete="off" spellcheck="false" value="${esc(this.look.name)}" />
              <em class="cr-err" data-testid="cr-err" hidden>Digite um nome para o seu Tamer.</em>
            </label>
            ${GROUPS.map(
              (g) => `
              <fieldset class="cr-group${g.swatch ? " swatches" : ""}" data-group="${g.key}">
                <legend>${g.title} <i>${o[g.key].length}</i></legend>
                <div class="cr-opts">${o[g.key]
                  .map(
                    (v) =>
                      `<button type="button" data-opt="${g.key}" data-val="${esc(v)}" title="${esc(LABELS[v] ?? v)}" aria-pressed="false">${
                        g.swatch ? `<b style="background:${g.swatch(v)}"></b><span class="sr">${esc(LABELS[v] ?? v)}</span>` : esc(LABELS[v] ?? v)
                      }</button>`,
                  )
                  .join("")}</div>
              </fieldset>`,
            ).join("")}
          </div>
        </div>
        <footer>
          <span class="cr-summary" data-testid="cr-summary"></span>
          <button type="button" class="cr-random" data-act="random">Aleatório</button>
          <button type="button" class="cr-go" data-act="confirm">Entrar no mundo</button>
        </footer>
      </div>`;
    root.appendChild(el);
    this.el = el;
    el.addEventListener("click", (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!b) return;
      if (b.dataset.opt) this.set(b.dataset.opt as keyof TamerLook, b.dataset.val!);
      else if (b.dataset.act === "random") this.set(null, "", randomLook((opts.seed ?? Date.now()) + this.rolls++ * 7919, this.nameInput.value));
      else if (b.dataset.act === "confirm") this.confirm();
    });
    this.nameInput.addEventListener("input", () => this.set("name", this.nameInput.value));
    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.confirm();
    });
    this.sync();
    this.start();
  }

  private get nameInput(): HTMLInputElement {
    return this.el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!;
  }

  /** Muda um campo (ou o look inteiro) e atualiza a tela. */
  set(key: keyof TamerLook | null, value: string, whole?: TamerLook): void {
    const raw = whole ?? { ...this.look, [key!]: value };
    const name = key === "name" ? value : this.nameInput.value;
    this.look = { ...normalizeLook(raw), name: name.slice(0, 14) };
    this.sync();
  }

  private sync(): void {
    for (const b of this.el.querySelectorAll<HTMLButtonElement>("[data-opt]")) b.setAttribute("aria-pressed", String(this.look[b.dataset.opt as keyof TamerLook] === b.dataset.val));
    const name = this.look.name.trim();
    this.el.querySelector<HTMLElement>('[data-testid="cr-err"]')!.hidden = !!name;
    this.el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.disabled = !name;
    this.el.querySelector('[data-testid="cr-nameplate"]')!.textContent = name || "—";
    const l = this.look;
    this.el.querySelector('[data-testid="cr-summary"]')!.textContent = `${LABELS[l.model]} · pele ${LABELS[l.skin].toLowerCase()} · ${LABELS[l.hairCut]} ${LABELS[l.hairColor].toLowerCase()} · ${LABELS[l.outfit]} ${LABELS[l.outfitColor].toLowerCase()}`;
    this.paint(this.t0 ? performance.now() - this.t0 : 0);
  }

  private paint(t: number): void {
    const { dir, frame } = previewPose(t);
    this.el.querySelector('[data-testid="cr-dir"]')!.textContent = DIR_LABEL[dir];
    this.opts.drawPreview?.(this.el.querySelector<HTMLCanvasElement>('[data-testid="cr-preview"]')!, this.look, dir, frame);
  }

  private start(): void {
    if (typeof requestAnimationFrame !== "function") return;
    this.t0 = performance.now();
    const loop = (now: number) => {
      this.paint(now - this.t0);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  confirm(): void {
    const look = normalizeLook({ ...this.look, name: this.nameInput.value });
    if (!this.nameInput.value.trim()) return this.sync();
    this.close();
    this.opts.onConfirm(look);
  }

  close(): void {
    if (this.raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
