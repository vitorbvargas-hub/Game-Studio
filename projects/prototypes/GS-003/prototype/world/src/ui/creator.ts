// Criador de Tamer v3 (tela antes do mundo, pt-BR): grade dos 12 presets oficiais-base DS (retrato + sprite andando
// e girando nas 4 direções), cor do cabelo (as 8 variantes do preset) e nome. O desenho fica fora daqui (drawPreview /
// drawPortrait), para a tela não depender de canvas no teste (jsdom).

import { checkTamerName, HAIR_PT, loadPresets, NAME_MAX, normalizeLook, randomLook, type NameCheck, type TamerLook, type TamerPreset } from "../assets/tamer-presets";

export type PreviewDir = "S" | "E" | "N" | "W";

export interface CreatorOptions {
  initial?: Partial<TamerLook>;
  onConfirm: (look: TamerLook) => void;
  /** Desenha o look no canvas (quadro `frame` da sequência do walk na direção `dir`). */
  drawPreview?: (canvas: HTMLCanvasElement, look: TamerLook, dir: PreviewDir, frame: number) => void;
  /** Retrato (busto) do look, parado de frente. */
  drawPortrait?: (canvas: HTMLCanvasElement, look: TamerLook) => void;
  /** Presets (padrão: os do disco). */
  presets?: TamerPreset[];
  /** Semente do botão "Aleatório" (padrão: relógio). */
  seed?: number;
}

export const PREVIEW_DIRS: PreviewDir[] = ["S", "E", "N", "W"];
const DIR_LABEL: Record<PreviewDir, string> = { S: "Frente", E: "Direita", N: "Costas", W: "Esquerda" };
/** Tempo em cada direção e duração de um quadro do walk no preview. */
export const PREVIEW_TURN_MS = 1400;
export const PREVIEW_FRAME_MS = 150;
/** Quadros da sequência do walk dos presets (_00, _01, _00, _02). */
export const WALK_FRAMES = 4;
/** Tamanho dos canvases (maior quadro dos presets: 42×33). */
export const PREVIEW_W = 44;
export const PREVIEW_H = 34;

/** Mensagens de erro do nome (pt-BR). */
export const NAME_ERRORS: Record<Exclude<NameCheck, { ok: true }>["error"], string> = {
  empty: "Digite um nome para o seu Tamer.",
  long: `Use no máximo ${NAME_MAX} caracteres.`,
  chars: "Use só letras, números, espaço, _ - ou .",
};

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Direção e quadro do preview no instante `t` (ms): gira S → E → N → W andando. */
export function previewPose(t: number, walkFrames = WALK_FRAMES): { dir: PreviewDir; frame: number } {
  // o timestamp do rAF pode vir um pouco antes do performance.now() de início: t negativo conta como 0
  t = Math.max(0, t);
  return { dir: PREVIEW_DIRS[Math.floor(t / PREVIEW_TURN_MS) % 4], frame: Math.floor(t / PREVIEW_FRAME_MS) % walkFrames };
}

export class TamerCreator {
  readonly el: HTMLElement;
  look: TamerLook;
  readonly presets: TamerPreset[];
  private raf = 0;
  private t0 = 0;
  private rolls = 0;

  constructor(
    root: HTMLElement,
    private readonly opts: CreatorOptions,
  ) {
    this.presets = opts.presets ?? loadPresets();
    this.look = normalizeLook(opts.initial ?? {}, this.presets);
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
            <canvas data-testid="cr-preview" width="${PREVIEW_W}" height="${PREVIEW_H}"></canvas>
            <div class="cr-nameplate" data-testid="cr-nameplate"></div>
            <div class="cr-dir" data-testid="cr-dir">${DIR_LABEL.S}</div>
          </div>
          <div class="cr-form">
            <label class="cr-field"><span>Nome</span>
              <input data-testid="cr-name" maxlength="${NAME_MAX}" autocomplete="off" spellcheck="false" value="${esc(this.look.name)}" />
              <em class="cr-err" data-testid="cr-err" hidden>${NAME_ERRORS.empty}</em>
            </label>
            <fieldset class="cr-group" data-group="preset">
              <legend>Personagem <i>${this.presets.length}</i></legend>
              <div class="cr-presets">${this.presets
                .map(
                  (p) => `<button type="button" class="cr-preset" data-preset="${esc(p.id)}" aria-pressed="false" title="${esc(`${p.label} · ${p.accessory}`)}">
                    <canvas class="cr-portrait" data-portrait="${esc(p.id)}" width="24" height="20"></canvas>
                    <canvas class="cr-sprite" data-sprite="${esc(p.id)}" width="${PREVIEW_W}" height="${PREVIEW_H}"></canvas>
                    <b>${esc(p.label)}</b>
                    <small>${esc(p.accessory)}</small>
                  </button>`,
                )
                .join("")}</div>
            </fieldset>
            <fieldset class="cr-group swatches" data-group="hair">
              <legend>Cor do cabelo <i data-testid="cr-hair-n"></i></legend>
              <div class="cr-opts" data-testid="cr-hairs"></div>
            </fieldset>
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
      if (b.dataset.preset) this.setPreset(b.dataset.preset);
      else if (b.dataset.hair) this.setHair(b.dataset.hair);
      else if (b.dataset.act === "random") this.setLook(randomLook((opts.seed ?? Date.now()) + this.rolls++ * 7919, this.nameInput.value, this.presets));
      else if (b.dataset.act === "confirm") this.confirm();
    });
    this.nameInput.addEventListener("input", () => {
      // O maxlength só vale para a digitação: um valor colado/setado por script é cortado aqui também.
      const v = this.nameInput.value;
      if ([...v].length > NAME_MAX) this.nameInput.value = [...v].slice(0, NAME_MAX).join("");
      this.sync();
    });
    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.confirm();
    });
    this.sync();
    this.start();
  }

  private get nameInput(): HTMLInputElement {
    return this.el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!;
  }

  get preset(): TamerPreset | undefined {
    return this.presets.find((p) => p.id === this.look.preset);
  }

  /** Troca o preset (o cabelo volta à cor canônica dele). */
  setPreset(id: string): void {
    const p = this.presets.find((x) => x.id === id);
    if (p) this.setLook({ ...this.look, preset: p.id, hair: p.defaultHair });
  }

  setHair(id: string): void {
    this.setLook({ ...this.look, hair: id });
  }

  private setLook(l: TamerLook): void {
    this.look = normalizeLook({ ...l, name: this.nameInput.value }, this.presets);
    this.sync();
  }

  private sync(): void {
    const check = checkTamerName(this.nameInput.value);
    this.look = { ...this.look, name: check.ok ? check.name : [...this.nameInput.value].slice(0, NAME_MAX).join("") };
    for (const b of this.el.querySelectorAll<HTMLButtonElement>("[data-preset]")) b.setAttribute("aria-pressed", String(b.dataset.preset === this.look.preset));
    const p = this.preset;
    const hairs = this.el.querySelector<HTMLElement>('[data-testid="cr-hairs"]')!;
    if (hairs.dataset.for !== p?.id) {
      hairs.dataset.for = p?.id ?? "";
      hairs.innerHTML = (p?.hairs ?? [])
        .map((h) => `<button type="button" data-hair="${esc(h.id)}" title="${esc(HAIR_PT[h.id] ?? h.id)}${h.id === p!.defaultHair ? " (original)" : ""}" aria-pressed="false"><b style="background:${esc(h.hex)}"></b><span class="sr">${esc(HAIR_PT[h.id] ?? h.id)}</span></button>`)
        .join("");
      this.el.querySelector('[data-testid="cr-hair-n"]')!.textContent = String(p?.hairs.length ?? 0);
    }
    for (const b of hairs.querySelectorAll<HTMLButtonElement>("[data-hair]")) b.setAttribute("aria-pressed", String(b.dataset.hair === this.look.hair));
    const err = this.el.querySelector<HTMLElement>('[data-testid="cr-err"]')!;
    err.hidden = check.ok;
    if (!check.ok) err.textContent = NAME_ERRORS[check.error];
    this.el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.disabled = !check.ok;
    this.el.querySelector('[data-testid="cr-nameplate"]')!.textContent = check.name || "—";
    this.el.querySelector('[data-testid="cr-summary"]')!.textContent = p ? `${p.label} · ${p.accessory} · cabelo ${(HAIR_PT[this.look.hair] ?? this.look.hair).toLowerCase()}` : "";
    this.paint(this.t0 ? performance.now() - this.t0 : 0);
  }

  private paint(t: number): void {
    const { dir, frame } = previewPose(t);
    this.el.querySelector('[data-testid="cr-dir"]')!.textContent = DIR_LABEL[dir];
    // retratos: o escolhido na cor de cabelo atual, os outros na cor canônica (refeitos a cada quadro, porque a
    // imagem de uma cor nova pode chegar depois do clique)
    const lookFor = (id: string): TamerLook => (id === this.look.preset ? this.look : { name: "", preset: id, hair: this.presets.find((x) => x.id === id)!.defaultHair });
    if (this.opts.drawPortrait) for (const c of this.el.querySelectorAll<HTMLCanvasElement>("[data-portrait]")) this.opts.drawPortrait(c, lookFor(c.dataset.portrait!));
    const draw = this.opts.drawPreview;
    if (!draw) return;
    draw(this.el.querySelector<HTMLCanvasElement>('[data-testid="cr-preview"]')!, this.look, dir, frame);
    for (const c of this.el.querySelectorAll<HTMLCanvasElement>("[data-sprite]")) {
      draw(c, lookFor(c.dataset.sprite!), dir, frame);
    }
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
    const check = checkTamerName(this.nameInput.value);
    if (!check.ok) return this.sync();
    const look = normalizeLook({ ...this.look, name: check.name }, this.presets);
    this.close();
    this.opts.onConfirm(look);
  }

  close(): void {
    if (this.raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.raf);
    this.el.remove();
  }
}
