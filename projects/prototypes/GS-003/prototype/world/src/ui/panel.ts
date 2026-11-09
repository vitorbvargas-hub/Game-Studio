// Modal genérico das telas secundárias (Mapa-múndi, Digivice, Inventário, Missões, Configurações), no mesmo visual
// do modal "Equipe & Box" (classes .modal-wrap/.modal do style.css): cabeçalho com título e ×, corpo rolável,
// fecha por ×, clique fora ou Esc (o Esc é tratado no main, via Hud.closeModals). Só DOM, sem estado de jogo.

import { icon } from "./icons";

export class Panel {
  readonly wrap: HTMLElement;
  readonly body: HTMLElement;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private onClose?: () => void;

  constructor(
    root: HTMLElement,
    readonly id: string,
    title: string,
    iconName: string,
  ) {
    const w = document.createElement("div");
    w.className = "modal-wrap panel-wrap";
    w.dataset.panel = id;
    w.hidden = true;
    w.innerHTML = `
      <div class="modal-backdrop" data-panel-close></div>
      <section class="modal panel" role="dialog" aria-modal="true" aria-label="${title}">
        <header><h2>${icon(iconName, 16)} ${title.toUpperCase()}</h2><button class="x" data-panel-close title="Fechar (Esc)">×</button></header>
        <div class="modal-body panel-body"></div>
      </section>`;
    root.appendChild(w);
    this.wrap = w;
    this.body = w.querySelector<HTMLElement>(".panel-body")!;
    w.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("[data-panel-close]")) this.close();
    });
    w.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") e.stopPropagation();
    });
  }

  get isOpen(): boolean {
    return !this.wrap.hidden && this.wrap.classList.contains("open");
  }

  open(html: string, onClose?: () => void): void {
    clearTimeout(this.closeTimer);
    this.body.innerHTML = html;
    this.onClose = onClose;
    this.wrap.hidden = false;
    void this.wrap.offsetWidth;
    this.wrap.classList.add("open");
  }

  /** Troca o conteúdo sem reabrir (atualização ao vivo). */
  update(html: string): void {
    if (this.isOpen) this.body.innerHTML = html;
  }

  close(): void {
    if (this.wrap.hidden) return;
    this.wrap.classList.remove("open");
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      if (!this.wrap.classList.contains("open")) this.wrap.hidden = true;
    }, 200);
    const cb = this.onClose;
    this.onClose = undefined;
    cb?.();
  }
}
