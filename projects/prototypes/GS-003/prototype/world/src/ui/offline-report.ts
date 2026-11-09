// Modal "Relatório offline" (estilo IdleDex): o que a parceira fez enquanto o jogador estava fora — tempo
// creditado (com teto), XP, vitórias, bits, níveis, golpes aprendidos e evoluções. Fecha em "Coletar", Esc ou fundo.

import type { OfflineReport } from "../save/offline";
import { formatDuration } from "../save/offline";
import type { WorldContent } from "../sim/species";
import { icon } from "./icons";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const num = (n: number) => n.toLocaleString("pt-BR");

export interface OfflineView {
  report: OfflineReport;
  partnerName: string;
  /** Espécie antes do período (para o retrato da evolução). */
  speciesFrom: string;
  tamerLevels: number;
  autoEvolve: boolean;
}

export function showOfflineReport(
  root: HTMLElement,
  content: WorldContent,
  v: OfflineView,
  opts: { portrait?: (c: HTMLCanvasElement, speciesId: string) => void; onClose?: () => void } = {},
): HTMLElement {
  root.querySelector(".offline-wrap")?.remove();
  const r = v.report;
  const moveName = (id: string) => content.moves.moves[id]?.name ?? id;
  const spName = (id: string) => content.species[id]?.name ?? id;
  const el = document.createElement("div");
  el.className = "offline-wrap";
  el.innerHTML = `
    <div class="offline-backdrop" data-act="offline-close"></div>
    <section class="offline" role="dialog" aria-modal="true" aria-labelledby="off-title" data-testid="offline-report">
      <header>
        <h2 id="off-title">${icon("moon", 18)}Relatório offline</h2>
        <p data-testid="off-time">Você ficou fora por <b>${formatDuration(r.elapsedMs)}</b>.${
          r.capped ? ` Crédito máximo: <b>${r.capHours} h</b>.` : ""
        } ${esc(v.partnerName)} seguiu caçando no AUTO (rendimento offline ${Math.round(r.efficiency * 100)}%).</p>
      </header>
      <div class="off-stats">
        <div class="off-stat xp"><span>XP</span><b data-testid="off-xp">+${num(r.xp)}</b></div>
        <div class="off-stat win"><span>Vitórias</span><b data-testid="off-wins">${num(r.wins)}</b></div>
        <div class="off-stat bits">${icon("coin", 14)}<span>Bits</span><b data-testid="off-bits">+${num(r.bits)}</b></div>
        <div class="off-stat lvl"><span>Nível</span><b data-testid="off-level">${r.level.from === r.level.to ? `Nv.${r.level.to}` : `Nv.${r.level.from} → Nv.${r.level.to}`}</b></div>
      </div>
      ${v.tamerLevels > 0 ? `<p class="off-tamer">Tamer subiu ${v.tamerLevels} ${v.tamerLevels === 1 ? "nível" : "níveis"}!</p>` : ""}
      <div class="off-section">
        <h3>Golpes aprendidos <i>${r.learned.length}</i></h3>
        <div class="off-chips" data-testid="off-moves">${
          r.learned.length ? r.learned.map((id) => `<span class="chip">${esc(moveName(id))}</span>`).join("") : `<em>Nenhum golpe novo desta vez.</em>`
        }</div>
      </div>
      <div class="off-section">
        <h3>Evoluções <i>${r.evolutions.length}</i></h3>
        <div class="off-evos" data-testid="off-evos">${
          r.evolutions.length
            ? r.evolutions
                .map(
                  (e) => `<div class="evo-row"><canvas width="40" height="40" data-sp="${esc(e.from)}"></canvas><span>${esc(spName(e.from))}</span><b>→</b>
                  <canvas width="40" height="40" data-sp="${esc(e.to)}"></canvas><span>${esc(spName(e.to))}</span>
                  ${e.kept.length ? `<em>Manteve ${e.kept.map((k) => esc(moveName(k))).join(" e ")}</em>` : ""}</div>`,
                )
                .join("")
            : `<em>Nenhuma evolução.${v.autoEvolve ? "" : " Ligue Auto-evoluir no AUTO para evoluir sozinho."}</em>`
        }</div>
      </div>
      <footer><button class="off-collect" data-act="offline-close" data-testid="off-collect">Coletar</button></footer>
    </section>`;
  root.appendChild(el);
  if (opts.portrait) for (const c of el.querySelectorAll<HTMLCanvasElement>("canvas[data-sp]")) opts.portrait(c, c.dataset.sp!);
  const close = () => {
    el.classList.add("closing");
    document.removeEventListener("keydown", onKey, true);
    setTimeout(() => el.remove(), 160);
    opts.onClose?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener("keydown", onKey, true);
  el.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest('[data-act="offline-close"]')) close();
  });
  el.addEventListener("pointerdown", (e) => e.stopPropagation());
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => el.classList.add("open"));
  else el.classList.add("open");
  return el;
}
