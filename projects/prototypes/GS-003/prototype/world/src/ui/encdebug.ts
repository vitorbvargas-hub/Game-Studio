// GS-012 (?encdebug=1): painel de debug dos encontros. Mostra o que a autoridade vê (área, terreno, chance deste
// passo, carência, pool com % por espécie e por raridade, vivos) e permite forçar um encontro por espécie ou raridade
// e trocar o horário da tabela. Tudo passa por intents: o painel nunca mexe no estado da sim.

import { RARITY_COLORS } from "../render/encounterFx";

export interface EncDebugApi {
  inspect: () => ReturnType<typeof import("../sim/world").encounterInspect>;
  entries: () => { id: string; name: string; rarity: string }[];
  force: (entryId?: string, rarity?: string) => void;
  setTime: (t: string) => void;
}

const RARITY_PT: Record<string, string> = { common: "comum", uncommon: "incomum", rare: "raro", very_rare: "muito raro" };

export function mountEncounterDebug(root: HTMLElement, api: EncDebugApi): HTMLElement {
  const el = document.createElement("div");
  el.className = "enc-debug";
  el.dataset.testid = "enc-debug";
  el.style.cssText =
    "position:fixed;top:8px;right:8px;z-index:50;width:290px;max-height:80vh;overflow:auto;background:rgba(14,10,24,.88);color:#e8e6f0;" +
    "font:11px/1.35 ui-monospace,monospace;border:1px solid #4a3f66;border-radius:6px;padding:8px;pointer-events:auto";
  const entries = api.entries();
  el.innerHTML = `
    <div style="font-weight:bold;margin-bottom:4px">GS-012 · encontros (debug)</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">
      <select data-k="entry" style="flex:1 1 100%"><option value="">— espécie (entrada) —</option>${entries.map((e) => `<option value="${e.id}">${e.name} · ${RARITY_PT[e.rarity] ?? e.rarity} (${e.id})</option>`).join("")}</select>
      <select data-k="rarity" style="flex:1"><option value="">— raridade —</option>${Object.keys(RARITY_PT).map((r) => `<option value="${r}">${RARITY_PT[r]}</option>`).join("")}</select>
      <button data-k="force" style="flex:1">Forçar encontro</button>
      <select data-k="time" style="flex:1 1 100%"><option value="">horário: relógio do jogo</option>${["day", "dusk", "night", "dawn"].map((t) => `<option value="${t}">horário: ${t}</option>`).join("")}</select>
    </div>
    <div data-k="body"></div>`;
  root.appendChild(el);
  const $ = <T extends HTMLElement>(k: string) => el.querySelector<T>(`[data-k="${k}"]`)!;
  // as teclas do jogo (WASD) não podem vazar dos selects
  el.addEventListener("keydown", (e) => e.stopPropagation());
  $("force").addEventListener("click", () => api.force($<HTMLSelectElement>("entry").value || undefined, $<HTMLSelectElement>("rarity").value || undefined));
  $("time").addEventListener("change", () => api.setTime($<HTMLSelectElement>("time").value));
  const body = $("body");
  const pct = (v: number) => `${v.toFixed(v < 10 ? 1 : 0)}%`;
  const draw = () => {
    const s = api.inspect();
    if (!s) {
      body.textContent = "encontros desligados neste mapa (sem tabela)";
      return;
    }
    const rar = Object.entries(s.rarityPct)
      .map(([r, v]) => `<span style="color:${RARITY_COLORS[r]}">${RARITY_PT[r] ?? r} ${pct(v)}</span>`)
      .join(" · ");
    body.innerHTML = `
      <div>tile ${s.tile.x},${s.tile.y} · ${s.env.time}/${s.env.weather}</div>
      <div>área <b>${s.areaId ?? "—"}</b> · terreno <b>${s.terrain ?? "— (trilha/fora)"}</b></div>
      <div>chance deste passo <b>${pct(s.pStep * 100)}</b> · carência ${s.graceLeft} passos${s.readyInSec > 0 ? ` · intervalo ${s.readyInSec.toFixed(1)} s` : ""}</div>
      <div>passos ${s.counters.steps} · testes ${s.counters.rolls} · encontros ${s.counters.encounters} · farfalhar ${s.counters.empties}</div>
      <div>varredura por vitória <b>${s.scanPerWin}%</b>${s.scanMult !== 1 ? ` (Fonte dos Desejos ×${String(s.scanMult).replace(".", ",")})` : ""}</div>
      <div>vivos: ${s.visibleAlive} visíveis (teto 6) · ${s.randomAlive} aleatório · recompensas pagas ${s.rewardsPaid}</div>
      <div style="margin-top:4px">raridade: ${rar || "—"} · nada (farfalhar) ${pct(s.emptyPct)} dos testes vencidos</div>
      <table style="width:100%;margin-top:4px;border-collapse:collapse">${s.pool
        .map((x) => `<tr><td style="color:${RARITY_COLORS[x.rarity]}">${x.name}</td><td>Nv.${x.levels[0]}–${x.levels[1]}</td><td style="text-align:right">${pct(x.pct)}</td></tr>`)
        .join("")}</table>`;
  };
  draw();
  setInterval(draw, 250);
  return el;
}
