// @vitest-environment jsdom
// Mapa-múndi v1 (art/map-factory/worldmap-v1) e kit circuit-kit-v1 atrás de ?hud=v2.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import worldmapJson from "../../../art/map-factory/worldmap-v1/worldmap.json";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { CIRCUIT_KIT } from "../src/ui/circuit-kit";
import { Hud } from "../src/ui/hud";
import { artPos, pickRegion, POI_ICONS, regionMapState, requirementText, selectedRegion, worldMapHtml } from "../src/ui/worldmap";
import { canTravel, REGIONS, regionById, unlockState, type Progress } from "../src/world/regions";

const p = (tamerLevel: number, all = false): Progress => ({ tamerLevel, defeatedBosses: [], all });
const ART = join(__dirname, "../../../art");

function render(current: string, prog: Progress): HTMLElement {
  const root = document.createElement("div");
  root.className = "hud-v2";
  root.innerHTML = worldMapHtml(current, prog, "v2");
  document.body.appendChild(root);
  return root.querySelector<HTMLElement>(".wm2")!;
}

describe("Mapa-múndi v2 (worldmap-v1)", () => {
  it("sem a flag segue o grafo v1 (nos testes não há ?hud=v2 na URL)", () => {
    const html = worldMapHtml("floresta_densa", p(12));
    expect(html).toMatch(/<div class="wm-canvas"><svg viewBox/);
    expect(html).not.toContain("wm2");
  });

  it("usa a ilustração e as coordenadas do worldmap.json; 1 POI por região com o glifo do tipo", () => {
    const wm = render("floresta_densa", p(12));
    expect(wm.getAttribute("style")).toMatch(/--wm-art:url\('[^']*worldmap_v1\.png/);
    expect(wm.getAttribute("style")).toMatch(/--wm-poi:url\('[^']*poi_icons\.png/);
    const pois = wm.querySelectorAll<HTMLElement>(".wm2-poi");
    expect(pois).toHaveLength(REGIONS.length);
    const regs = worldmapJson.regions as Record<string, { pos_px: number[]; icon: string }>;
    for (const r of REGIONS) {
      const a = regs[r.id];
      expect(a, r.id).toBeDefined();
      const pos = artPos(r.id);
      expect(pos.x).toBeCloseTo((a.pos_px[0] / 640) * 100, 5);
      expect(pos.y).toBeCloseTo((a.pos_px[1] / 360) * 100, 5);
      const poi = wm.querySelector<HTMLElement>(`[data-wm-pick="${r.id}"]`)!;
      expect(poi.style.left).toBe(`${pos.x.toFixed(2)}%`);
      expect(poi.style.getPropertyValue("--i")).toBe(String(POI_ICONS.indexOf(a.icon)));
    }
    // rotas do worldmap.json, desenhadas por cima (as do PNG são discretas)
    expect(wm.querySelectorAll(".wm2-routes line")).toHaveLength(worldmapJson.routes.length);
  });

  it("estado de cada POI = unlockState/canTravel (aqui / liberado / bloqueado, cadeado na linha 1 do sheet)", () => {
    for (const lvl of [1, 5, 12]) {
      const wm = render("floresta_densa", p(lvl));
      for (const r of REGIONS) {
        const poi = wm.querySelector<HTMLElement>(`[data-wm-pick="${r.id}"]`)!;
        const { state } = regionMapState(r, "floresta_densa", p(lvl));
        expect(poi.classList.contains(state), `${r.id} ${lvl}`).toBe(true);
        const t = canTravel(r.id, p(lvl));
        const u = unlockState(r, p(lvl));
        const expected = r.id === "floresta_densa" ? "here" : t.ok ? "open" : u.open ? "nomap" : "locked";
        expect(state).toBe(expected);
        expect(poi.style.getPropertyValue("--row")).toBe(state === "locked" ? "1" : "0");
      }
    }
  });

  it("painel lateral: nome, nível, espécies, requisitos, estado e Viajar (desligado quando não pode)", () => {
    const wm = render("floresta_densa", p(12));
    expect(wm.querySelectorAll(".wm2-detail")).toHaveLength(REGIONS.length);
    // abre no lugar onde você está, sem Viajar
    const vis = [...wm.querySelectorAll<HTMLElement>(".wm2-detail")].filter((d) => !d.hidden);
    expect(vis.map((d) => d.dataset.region)).toEqual(["floresta_densa"]);
    expect(wm.querySelector('[data-region="floresta_densa"] [data-testid="wm-state"]')!.textContent).toBe("Você está aqui");
    expect(wm.querySelector('[data-region="floresta_densa"] [data-travel]')).toBeNull();
    const praia = wm.querySelector<HTMLElement>('[data-region="praia_dos_postes"]')!;
    expect(praia.querySelector("h3")!.textContent).toBe(regionById("praia_dos_postes")!.name);
    expect(praia.textContent).toContain(`Nv.${regionById("praia_dos_postes")!.levelRange[0]}`);
    for (const s of regionById("praia_dos_postes")!.wildSpecies) expect(praia.textContent).toContain(s.name);
    expect(praia.querySelector('[data-testid="wm-req"]')!.textContent).toContain("Tamer Nv.10 ou derrote Kuwagamon");
    expect(praia.querySelector<HTMLButtonElement>('[data-travel="praia_dos_postes"]')!.disabled).toBe(false);
    expect(wm.querySelector<HTMLButtonElement>('[data-travel="montanha"]')!.disabled).toBe(true);
    expect(wm.querySelector('[data-region="montanha"] [data-testid="wm-state"]')!.textContent).toContain("Bloqueada");
    expect(requirementText(regionById("floresta_densa")!)).toBe("Nenhum");
    expect(wm.querySelector("[data-arena]")).not.toBeNull();
    const low = render("floresta_densa", p(5));
    expect(low.querySelector<HTMLButtonElement>('[data-travel="praia_dos_postes"]')!.disabled).toBe(true);
  });

  it("clicar num POI troca o destino do painel lateral; a escolha sobrevive a um re-render e volta ao 'aqui' depois da viagem", () => {
    const wm = render("floresta_densa", p(12));
    wm.querySelector<HTMLElement>('[data-wm-pick="praia_dos_postes"]')!.click();
    const visible = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>(".wm2-detail")].filter((d) => !d.hidden).map((d) => d.dataset.region);
    expect(visible(wm)).toEqual(["praia_dos_postes"]);
    expect(wm.querySelector('[data-wm-pick="praia_dos_postes"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(selectedRegion("floresta_densa", p(12))).toBe("praia_dos_postes");
    expect(visible(render("floresta_densa", p(12)))).toEqual(["praia_dos_postes"]);
    // viajou: a região atual mudou → volta para "Você está aqui"
    expect(visible(render("praia_dos_postes", p(12)))).toEqual(["praia_dos_postes"]);
    expect(selectedRegion("vila_dos_bebes", p(12))).toBe("vila_dos_bebes");
    pickRegion(wm, "montanha");
    expect(visible(wm)).toEqual(["montanha"]);
  });
});

describe("kit circuit-kit-v1 no HUD v2", () => {
  it("todas as peças existem no pacote do game-art e entram como --ck-* só com a flag", () => {
    const meta = JSON.parse(readFileSync(join(ART, "ui/circuit-kit-v1/metadata.json"), "utf8"));
    expect(meta.panel_9slice.nine_slice).toEqual({ left: 8, right: 8, top: 8, bottom: 8 });
    for (const url of Object.values(CIRCUIT_KIT)) expect(url).toMatch(/\.png/);
    const content = loadWorldContent();
    const make = (variant?: "v2") => {
      const root = document.createElement("div");
      const scene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: 3, region: { name: "Floresta Densa", route: "Rota 1" } };
      const hud = new Hud(root, content, "p1", { onAuto() {}, onFlee() {} }, false, { scene, variant });
      hud.digivice?.dispose();
      return root;
    };
    const v1 = make();
    expect(v1.style.getPropertyValue("--ck-panel")).toBe("");
    const v2 = make("v2");
    for (const k of Object.keys(CIRCUIT_KIT)) expect(v2.style.getPropertyValue(`--ck-${k}`), k).toMatch(/^url\(/);
    expect(v2.dataset.kit).toBe("circuit-v1");
    expect(v2.querySelector(".dg-emblem-kit")).not.toBeNull();
    (v2 as unknown as { remove(): void }).remove();
  });

  it("CSS: cada --ck-* usado existe no kit, nenhuma regra fora de .hud-v2 usa o kit; 9-slices com os insets do metadata (×2)", () => {
    const css = readFileSync(join(__dirname, "../src/style.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const used = new Set([...css.matchAll(/var\(--ck-([a-z0-9-]+)\)/g)].map((m) => m[1]));
    expect(used.size).toBeGreaterThan(8);
    for (const k of used) expect(Object.keys(CIRCUIT_KIT), k).toContain(k);
    for (const rule of css.split("}")) if (rule.includes("var(--ck-") || rule.includes("var(--wm-")) {
        const sel = rule.slice(0, rule.lastIndexOf("{")).split(/[{;]/).pop()!;
        expect(sel.split(",").every((x) => x.trim().startsWith(".hud-v2")), sel).toBe(true);
      }
    expect(css).toMatch(/border-image: var\(--ck-panel\) 32 8 31 8 fill \/ 64px 16px 62px 16px/);
    expect(css).toMatch(/border-image: var\(--ck-btn\) 5 fill \/ 10px/);
    expect(css).toMatch(/border-image: var\(--ck-bar\) 2 fill \/ 4px/);
    for (const f of ["worldmap_v1.png", "poi_icons.png", "worldmap.json"]) expect(existsSync(join(ART, "map-factory/worldmap-v1", f))).toBe(true);
  });
});

describe("kit: cores dos botões", () => {
  it("as cores dos botões do kit vencem '#hud button { color: inherit }' (seletor com #hud)", () => {
    const css = readFileSync(join(__dirname, "../src/style.css"), "utf8");
    expect(css).toMatch(/#hud button \{[^}]*color: inherit/);
    expect(css).toMatch(/\.hud-v2#hud \.dg-cta:disabled,[^{]*\{[^}]*color: #6b7aa1/);
    expect(css).toMatch(/\.hud-v2 \.dg-cta:disabled::before \{[^}]*var\(--ck-btn-locked\)/);
  });
});
