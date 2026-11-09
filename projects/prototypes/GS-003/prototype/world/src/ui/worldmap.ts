// Mapa-múndi (pt-BR): as 6 regiões do GDD num esquema de nós ligados pelas rotas (routesTo), com faixa de nível,
// selvagens, estado (você está aqui / liberada / bloqueada e o motivo / sem mapa) e "Viajar" para as liberadas.

import { canTravel, mapOfRegion, REGIONS, unlockState, type Progress } from "../world/regions";

/** Posição esquemática (%) de cada região no mapa-múndi [H]. */
const POS: Record<string, [number, number]> = {
  vila_dos_bebes: [13, 72],
  floresta_densa: [33, 48],
  praia_dos_postes: [56, 78],
  montanha: [44, 18],
  deserto: [72, 28],
  zona_corrompida: [88, 62],
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function worldMapHtml(current: string, p: Progress): string {
  const lines = new Set<string>();
  for (const r of REGIONS) for (const to of r.routesTo) lines.add([r.id, to].sort().join("|"));
  const svg = [...lines]
    .map((l) => {
      const [a, b] = l.split("|");
      const [x1, y1] = POS[a] ?? [0, 0];
      const [x2, y2] = POS[b] ?? [0, 0];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    })
    .join("");
  const nodes = REGIONS.map((r) => {
    const [x, y] = POS[r.id] ?? [50, 50];
    const u = unlockState(r, p);
    const t = canTravel(r.id, p);
    const here = mapOfRegion(r.id)?.region === current;
    const state = here ? "here" : t.ok ? "open" : u.open ? "nomap" : "locked";
    const label = here ? "Você está aqui" : t.ok ? "Liberada" : t.reason;
    return `<div class="wm-node ${state}" data-region="${r.id}" style="left:${x}%;top:${y}%">
      <b>${esc(r.name)}</b>
      <small>Nv.${r.levelRange[0]}–${r.levelRange[1]}${r.safeZone ? " · zona segura" : ` · ${r.wildSpecies.length} espécies`}</small>
      <em data-testid="wm-state">${esc(label)}</em>
      ${here ? "" : `<button type="button" data-travel="${r.id}" ${t.ok ? "" : "disabled"}>Viajar</button>`}
    </div>`;
  }).join("");
  return `<div class="worldmap">
      <div class="wm-canvas"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${svg}</svg>${nodes}</div>
      <p class="note">Viagem entre regiões liberadas (regra do GDD: nível do Tamer e chefes). Também dá para trocar de mapa pelas saídas na borda. Montanha, Deserto e Zona Corrompida ainda não têm mapa nesta prova.</p>
    </div>`;
}
