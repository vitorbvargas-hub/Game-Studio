// Mapa-múndi (pt-BR): as 6 regiões do GDD num esquema de nós ligados pelas rotas (routesTo), com faixa de nível,
// selvagens, estado (você está aqui / liberada / bloqueada e o motivo / sem mapa) e "Viajar" para as liberadas.
// HUD v2 (?hud=v2): a ilustração art/map-factory/worldmap-v2_1 (pintada, sem POI assado; moldura de Digivice) no lugar do grafo, com os POIs
// dinâmicos (poi_icons.png) nas coordenadas do worldmap.json e um painel lateral com o destino escolhido.

import worldmapArt from "../../../../art/map-factory/worldmap-v2_1/worldmap.json";
import worldmapPng from "../../../../art/map-factory/worldmap-v2_1/worldmap_v2_1.png?url";
import poiPng from "../../../../art/map-factory/worldmap-v2_1/poi_icons.png?url";
import { hudVariantOf, type HudVariant } from "./hud-v2";
import { icon } from "./icons";
import { canTravel, mapOfRegion, REGIONS, unlockState, type Progress, type RegionDef } from "../world/regions";

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

/** Sem variante explícita, segue a flag da URL (o main chama sem ela; nos testes não há ?hud=v2 → v1). */
const urlVariant = (): HudVariant => (typeof location === "undefined" ? "v1" : hudVariantOf(new URLSearchParams(location.search)));

export function worldMapHtml(current: string, p: Progress, variant: HudVariant = urlVariant()): string {
  if (variant === "v2") return worldMapV2Html(current, p);
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
      <button type="button" class="wm-arena" data-arena title="Arena PvP local (oponente fantasma)">${icon("trophy", 14)} Arena</button>
      <p class="note">Viagem entre regiões liberadas (regra do GDD: nível do Tamer e chefes). Também dá para trocar de mapa pelas saídas na borda. Montanha, Deserto e Zona Corrompida ainda não têm mapa nesta prova.</p>
    </div>`;
}

// ---------------------------------------------------------------- v2: ilustração worldmap-v2_1

interface ArtRegion {
  name_pt: string;
  pos_px: number[];
  icon: string;
}
const ART = worldmapArt as unknown as { canvas: { width: number; height: number }; regions: Record<string, ArtRegion>; routes: string[][] };
/** Ordem dos glifos em poi_icons.png (linha 0 = base, linha 1 = com cadeado), 16×16 cada. */
export const POI_ICONS = ["hub", "tree", "wave", "peak", "gear", "skull"];
export const WM_ART = { png: worldmapPng, poi: poiPng, width: ART.canvas.width, height: ART.canvas.height };

export type WmState = "here" | "open" | "nomap" | "locked";

/** Estado de uma região (mesma regra do v1: unlockState + canTravel). */
export function regionMapState(r: RegionDef, current: string, p: Progress): { state: WmState; label: string } {
  const u = unlockState(r, p);
  const t = canTravel(r.id, p);
  const here = mapOfRegion(r.id)?.region === current;
  const state: WmState = here ? "here" : t.ok ? "open" : u.open ? "nomap" : "locked";
  return { state, label: here ? "Você está aqui" : t.ok ? "Liberada" : t.reason };
}

/** Posição de uma região no PNG, em % do canvas (para o overlay escalar junto com a imagem). */
export function artPos(id: string): { x: number; y: number } {
  const a = ART.regions[id];
  if (a) return { x: (a.pos_px[0] / ART.canvas.width) * 100, y: (a.pos_px[1] / ART.canvas.height) * 100 };
  const [x, y] = POS[id] ?? [50, 50];
  return { x, y };
}

/** Requisito da região escrito por extenso (a regra do JSON, independente do progresso). */
export function requirementText(r: RegionDef): string {
  const full = unlockState(r, { tamerLevel: 0, defeatedBosses: [] }).reason;
  return r.unlock.type === "none" || full === "Liberada" ? "Nenhum" : full;
}

/** Destino escolhido no painel lateral; volta para "aqui" quando a região atual muda (viagem). */
let pick: { current: string; id: string } | undefined;

export function selectedRegion(current: string, p: Progress): string {
  if (pick && pick.current === current && REGIONS.some((r) => r.id === pick!.id)) return pick.id;
  const here = REGIONS.find((r) => mapOfRegion(r.id)?.region === current);
  return (here ?? REGIONS.find((r) => canTravel(r.id, p).ok) ?? REGIONS[0]).id;
}

function detailHtml(r: RegionDef, current: string, p: Progress, on: boolean): string {
  const { state, label } = regionMapState(r, current, p);
  const t = canTravel(r.id, p);
  const req = requirementText(r);
  const met = unlockState(r, p).open;
  const species = r.safeZone
    ? `<p class="dim">Zona segura: sem Digimon selvagens.</p>`
    : r.wildSpecies.length
      ? `<ul class="wm2-species">${r.wildSpecies.map((s) => `<li><b>${esc(s.name)}</b><small>Nv.${s.levelRange[0]}–${s.levelRange[1]}</small></li>`).join("")}</ul>`
      : `<p class="dim">Nenhuma espécie registrada.</p>`;
  return `<div class="wm2-detail ${state}" data-region="${r.id}"${on ? "" : " hidden"}>
      <h3>${esc(r.name)}</h3>
      <div class="wm2-meta"><span>Nv.${r.levelRange[0]}–${r.levelRange[1]}</span>${r.safeZone ? "<span>zona segura</span>" : `<span>${r.wildSpecies.length} espécies</span>`}</div>
      <em class="wm2-state" data-testid="wm-state">${esc(label)}</em>
      <h4>Requisitos</h4>
      <p class="wm2-req ${met ? "met" : "unmet"}" data-testid="wm-req">${met && req !== "Nenhum" ? "✓ " : ""}${esc(req)}</p>
      <h4>Selvagens</h4>
      ${species}
      ${state === "here" ? "" : `<button type="button" class="dg-cta wm2-travel" data-travel="${r.id}" ${t.ok ? "" : "disabled"}>Viajar</button>`}
    </div>`;
}

export function worldMapV2Html(current: string, p: Progress): string {
  installPicker();
  const sel = selectedRegion(current, p);
  const routes = ART.routes
    .map(([a, b]) => {
      const pa = artPos(a);
      const pb = artPos(b);
      const lit = [a, b].every((id) => {
        const r = REGIONS.find((x) => x.id === id);
        return r && regionMapState(r, current, p).state !== "locked";
      });
      return `<line class="${lit ? "lit" : ""}" x1="${pa.x}" y1="${pa.y}" x2="${pb.x}" y2="${pb.y}" />`;
    })
    .join("");
  const pois = REGIONS.map((r) => {
    const { state, label } = regionMapState(r, current, p);
    const { x, y } = artPos(r.id);
    const i = Math.max(0, POI_ICONS.indexOf(ART.regions[r.id]?.icon ?? "hub"));
    return `<button type="button" class="wm2-poi ${state}${r.id === sel ? " on" : ""}" data-wm-pick="${r.id}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--i:${i};--row:${state === "locked" ? 1 : 0}" aria-label="${esc(r.name)} — ${esc(label)}" aria-pressed="${r.id === sel}"><i class="wm2-glyph" aria-hidden="true"></i><span class="wm2-name">${esc(r.name)}</span></button>`;
  }).join("");
  const details = REGIONS.map((r) => detailHtml(r, current, p, r.id === sel)).join("");
  return `<div class="worldmap wm2" style="--wm-art:url('${worldmapPng}');--wm-poi:url('${poiPng}')">
      <div class="wm2-map">
        <div class="wm2-canvas" data-testid="wm2-canvas"><svg class="wm2-routes" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${routes}</svg>${pois}</div>
        <div class="wm2-legend"><span class="here">Você está aqui</span><span class="open">Liberada</span><span class="locked">Bloqueada</span></div>
      </div>
      <aside class="wm2-side" data-testid="wm2-side">
        ${details}
        <button type="button" class="wm-arena" data-arena title="Arena PvP local (oponente fantasma)">${icon("trophy", 14)} Arena</button>
        <p class="note">Viagem entre regiões liberadas (nível do Tamer e chefes). As saídas na borda do mapa também trocam de região. Montanha, Deserto e Zona Corrompida ainda não têm mapa nesta prova.</p>
      </aside>
    </div>`;
}

/** Clique num POI troca o destino do painel lateral, sem re-renderizar (o main só trata Viajar/Arena). */
let installed = false;
function installPicker(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest?.<HTMLElement>("[data-wm-pick]");
    const wm = b?.closest<HTMLElement>(".wm2");
    if (!b || !wm) return;
    pickRegion(wm, b.dataset.wmPick!);
  });
}

export function pickRegion(wm: HTMLElement, id: string): void {
  // a região atual é a do POI "aqui" (o mesmo `current` que o render recebeu)
  pick = { current: wm.querySelector<HTMLElement>(".wm2-poi.here")?.dataset.wmPick ?? "", id };
  for (const poi of wm.querySelectorAll<HTMLElement>(".wm2-poi")) {
    const on = poi.dataset.wmPick === id;
    poi.classList.toggle("on", on);
    poi.setAttribute("aria-pressed", String(on));
  }
  for (const d of wm.querySelectorAll<HTMLElement>(".wm2-detail")) d.hidden = d.dataset.region !== id;
}
