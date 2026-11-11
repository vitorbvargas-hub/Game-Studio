// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { loadSceneTiles, usedKeys } from "../src/assets/scene-tiles";
import { loadTileSources } from "../src/assets/tiles";
import { deserialize } from "../src/save/save";
import { isSolidAt, parseTiledMap, portalAt, pxToSub } from "../src/sim/map";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { Panel } from "../src/ui/panel";
import { worldMapHtml } from "../src/ui/worldmap";
import { canTravel, MAPS, REGIONS, regionById, unlockState } from "../src/world/regions";

afterEach(() => {
  document.body.innerHTML = "";
});

const parsed = Object.fromEntries(Object.values(MAPS).map((d) => [d.id, parseTiledMap(d.id, d.tmj)]));

describe("mapas por região e saídas (troca de mapa)", () => {
  it("floresta, praia e vila: toda saída leva a um mapa que existe, num início que existe e não é sólido", () => {
    expect(Object.keys(MAPS).sort()).toEqual(["digimon-forest-01", "forest-proof", "praia", "vila"]);
    for (const m of Object.values(parsed)) {
      expect(m.portals.length, m.id).toBeGreaterThan(0);
      for (const p of m.portals) {
        const dest = parsed[p.to];
        expect(dest, `${m.id} → ${p.to}`).toBeDefined();
        const s = dest.starts[p.toStart];
        expect(s, `${p.to}.${p.toStart}`).toBeDefined();
        expect(isSolidAt(dest, s.x, s.y)).toBe(false);
        // o início de chegada não fica em cima de uma saída (senão voltaria na hora)
        expect(portalAt(dest, (s.x / 1000) * 32, (s.y / 1000) * 32)).toBeUndefined();
        // a saída encosta na borda do mapa
        const W = m.width * 32;
        const H = m.height * 32;
        expect(p.x === 0 || p.y === 0 || p.x + p.w === W || p.y + p.h === H, `${m.id}.${p.name}`).toBe(true);
      }
    }
    // ida e volta: floresta ↔ praia e floresta ↔ vila
    expect(parsed["forest-proof"].portals.map((p) => p.to).sort()).toEqual(["praia", "vila"]);
    expect(parsed.praia.portals[0].to).toBe("forest-proof");
    expect(parsed.vila.portals[0].to).toBe("forest-proof");
    // Map Factory: vila ↔ digimon-forest-01 (saída sul da vila, saída sul da floresta Digimon)
    expect(parsed.vila.portals.map((p) => p.to).sort()).toEqual(["digimon-forest-01", "forest-proof"]);
    expect(parsed["digimon-forest-01"].portals.map((p) => [p.to, p.toStart])).toEqual([["vila", "from_digimon-forest-01"]]);
  });

  it("os pacotes praia-v5 e vila-v5 resolvem todas as chaves do mapa (sem placeholder) e ficam fora do conjunto global", () => {
    for (const id of ["praia", "vila"]) {
      const r = loadSceneTiles(MAPS[id].pack, "day", usedKeys(parsed[id]));
      expect(r.missing, id).toEqual([]);
      // sem preset noturno: a noite usa os tiles do dia
      expect(loadSceneTiles(MAPS[id].pack, "night", usedKeys(parsed[id])).missing, id).toEqual([]);
    }
    const global = loadTileSources();
    expect(Object.values(global).some((t) => /-v5\//.test(t.url))).toBe(false);
  });

  it("água da praia e casas da vila colidem (área solidW × solidH)", () => {
    const praia = parsed.praia;
    expect(praia.solid.some((v, i) => v === 1 && /water/.test(praia.tileLayers[0].keys[i]))).toBe(true);
    const vila = parsed.vila;
    const house = vila.props.find((p) => p.key === "vl5_house_big")!;
    // 4 × 3 tiles acima do pé
    for (const dx of [-1, 0, 1, 2]) for (const dy of [1, 2, 3]) expect(isSolidAt(vila, pxToSub(house.x + dx * 32), pxToSub(house.y - dy * 32 + 4))).toBe(true);
  });

  it("praia e vila: só o Tamer local (sem bots); a praia tem os selvagens de praia, a vila é zona segura", () => {
    const praia = createMapWorld(parsed.praia, false, 4, { start: "from_floresta" }).sim;
    expect(praia.state.players.map((p) => p.id)).toEqual([LOCAL_PLAYER]);
    const wild = new Set(praia.state.entities.filter((e) => e.kind === "wild").map((e) => e.name));
    expect([...wild].every((n) => ["Gomamon", "Betamon", "Crabmon", "Biyomon", "Otamamon", "Penguinmon"].includes(n))).toBe(true);
    expect(wild.size).toBeGreaterThan(1);
    const vila = createMapWorld(parsed.vila, false, 4).sim;
    expect(vila.state.entities.filter((e) => e.kind === "wild")).toHaveLength(0);
    const forest = createMapWorld(parsed["forest-proof"], true, 4, { start: "from_praia" }).sim;
    const me = forest.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    expect([me.x, me.y]).toEqual([parsed["forest-proof"].starts.from_praia.x, parsed["forest-proof"].starts.from_praia.y]);
    expect(forest.state.players).toHaveLength(4);
  });
});

describe("desbloqueio (regions.json) e Mapa-múndi", () => {
  const p = (tamerLevel: number, all = false) => ({ tamerLevel, defeatedBosses: [], all });

  it("regras do GDD: vila e floresta livres; praia com Tamer Nv.10 (ou chefe); montanha pede nível e chefe", () => {
    const r = (id: string) => regionById(id)!;
    expect(unlockState(r("vila_dos_bebes"), p(1)).open).toBe(true);
    expect(unlockState(r("praia_dos_postes"), p(9))).toEqual({ open: false, reason: "Tamer Nv.10 ou derrote Kuwagamon" });
    expect(unlockState(r("praia_dos_postes"), p(12)).open).toBe(true);
    expect(unlockState(r("praia_dos_postes"), { tamerLevel: 1, defeatedBosses: ["BOSS-KUWAGAMON"] }).open).toBe(true);
    expect(unlockState(r("montanha"), p(25))).toEqual({ open: false, reason: "derrote Kuwagamon" });
    expect(canTravel("montanha", p(1, true))).toEqual({ ok: false, reason: "Sem mapa nesta prova" });
    expect(canTravel("praia_dos_postes", p(12)).ok).toBe(true);
  });

  it("Mapa-múndi: as 6 regiões, 'Você está aqui', Viajar só nas liberadas com mapa", () => {
    const root = document.createElement("div");
    root.innerHTML = worldMapHtml("floresta_densa", p(12), "v1");
    expect(root.querySelectorAll(".wm-node")).toHaveLength(REGIONS.length);
    expect(REGIONS.length).toBe(6);
    expect(root.querySelector('[data-region="floresta_densa"] [data-testid="wm-state"]')!.textContent).toBe("Você está aqui");
    expect(root.querySelector('[data-region="floresta_densa"] [data-travel]')).toBeNull();
    expect(root.querySelector<HTMLButtonElement>('[data-travel="praia_dos_postes"]')!.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('[data-travel="vila_dos_bebes"]')!.disabled).toBe(false);
    expect(root.querySelector<HTMLButtonElement>('[data-travel="montanha"]')!.disabled).toBe(true);
    expect(root.querySelector('[data-region="montanha"] [data-testid="wm-state"]')!.textContent).toContain("Bloqueada");
    root.innerHTML = worldMapHtml("floresta_densa", p(5), "v1");
    expect(root.querySelector<HTMLButtonElement>('[data-travel="praia_dos_postes"]')!.disabled).toBe(true);
  });

  it("painel modal: abre, troca o conteúdo, fecha pelo × e pelo fundo", () => {
    const panel = new Panel(document.body, "map", "Mapa-múndi", "map");
    expect(panel.isOpen).toBe(false);
    panel.open("<p>oi</p>");
    expect(panel.isOpen).toBe(true);
    expect(panel.wrap.querySelector("h2")!.textContent).toContain("MAPA-MÚNDI");
    panel.update("<p>tchau</p>");
    expect(panel.body.textContent).toBe("tchau");
    panel.wrap.querySelector<HTMLElement>(".x")!.click();
    expect(panel.isOpen).toBe(false);
    panel.open("x");
    panel.wrap.querySelector<HTMLElement>(".modal-backdrop")!.click();
    expect(panel.isOpen).toBe(false);
  });

  it("save v3 → v4: o mapa atual entra no save (antes, sempre a floresta)", () => {
    const v3 = JSON.stringify({ v: 3, savedAt: 1, game: "gs003-world", data: { tamer: {}, partner: { speciesId: "CREATURE-0003", level: 5, xp: 0, learned: [], moves: [], autoRules: [] }, starter: null } });
    const r = deserialize(v3);
    expect(r.ok && r.data.map).toBe("forest-proof");
  });
});

describe("look padrão por mapa (branch quality-overhaul)", () => {
  it("digimon-forest-01 abre no v9 sem ?look; ?look=base força o base; ?look=v8 segue valendo; outros mapas sem padrão", async () => {
    const { MAPS, lookFor, withLook } = await import("../src/world/regions");
    const f = MAPS["digimon-forest-01"];
    expect(lookFor(f, null)).toBe("v9");
    expect(withLook(f, lookFor(f, null)).tmj).toBe(f.looks!.v9.tmj);
    expect(lookFor(f, "base")).toBeUndefined();
    expect(withLook(f, lookFor(f, "base")).tmj).toBe(f.tmj);
    expect(lookFor(f, "v8")).toBe("v8");
    expect(lookFor(MAPS["forest-proof"], null)).toBeUndefined();
  });
});
