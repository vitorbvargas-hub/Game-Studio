import { describe, expect, it } from "vitest";
import { loadCreatureCatalog } from "../src/assets/creatures";
import regions from "../src/data/content/regions.json";
import { createForestProofWorld, loadForestProofMap, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import { getEntity, getPlayer, grantXp } from "../src/sim/world";

const WILD = Array.from({ length: 18 }, (_, i) => `CREATURE-${String(101 + i).padStart(4, "0")}`);
const content = loadWorldContent();
const cat = loadCreatureCatalog();

describe("selvagens de DW DS (CREATURE-0101..0118, tools/dwds_import/import_wild_dwds.js)", () => {
  it("18 espécies novas com visual (folha + atlas), walk por direção e pivô nos pés", () => {
    expect(WILD.length).toBeGreaterThanOrEqual(15);
    for (const id of WILD) {
      const c = cat[id];
      expect(c, id).toBeDefined();
      expect(c.frameUrls, id).toBeUndefined();
      const walk = c.manifest.animations.walk;
      expect(Object.keys(walk.dirFrames ?? {}).length, id).toBeGreaterThanOrEqual(2);
      for (const f of Object.values(walk.dirFrames!).flat()) expect(c.atlas.frames[f.atlasKey!], `${id} ${f.atlasKey}`).toBeDefined();
      expect(c.manifest.pivot.y).toBe(c.manifest.dimensions.frameH - 1);
    }
  });

  it("dados de espécie e learnset mínimo (golpes existentes, elemento e atributo)", () => {
    for (const id of WILD) {
      const sp = content.species[id];
      expect(sp, id).toBeDefined();
      expect(["vaccine", "data", "virus", "free"]).toContain(sp.affinity);
      const ls = content.moves.learnsets[id];
      expect(ls?.length, id).toBeGreaterThanOrEqual(2);
      for (const e of ls) expect(content.moves.moves[e.move], `${id} ${e.move}`).toBeDefined();
      expect(content.moves.speciesElement[id], id).toBeDefined();
    }
  });

  it("linha Dorimon → Dorumon (Nv.8) → Dorugamon (Nv.16) → DoruGreymon (Nv.24)", () => {
    expect(content.moves.evolutions["CREATURE-0014"]).toEqual({ to: "CREATURE-0101", level: 8 });
    expect(content.moves.evolutions["CREATURE-0101"]).toEqual({ to: "CREATURE-0102", level: 16 });
    expect(content.moves.evolutions["CREATURE-0102"]).toEqual({ to: "CREATURE-0103", level: 24 });
    const { sim } = createForestProofWorld(3, { partnerSpecies: "CREATURE-0014", partnerLevel: 1 });
    const pid = getPlayer(sim.state, LOCAL_PLAYER)!.partnerId;
    // Dorumon tem dois ramos (Dorugamon | Drimogemon): o Auto-evoluir só segue sozinho com a preferência marcada
    getPlayer(sim.state, LOCAL_PLAYER)!.evoPrefs = { "CREATURE-0101": "CREATURE-0102" };
    const evs = grantXp(sim, pid, 400_000, true);
    expect(evs.filter((e) => e.t === "evolve").length).toBeGreaterThanOrEqual(2);
    expect(["CREATURE-0102", "CREATURE-0103"]).toContain(getEntity(sim.state, pid)!.speciesId);
  });

  it("selvagens no mapa: as zonas da floresta sorteiam espécies novas; regions.json lista todas", () => {
    const zoneSpecies = new Set(loadForestProofMap().spawns.flatMap((z) => z.species));
    const inForest = WILD.filter((id) => zoneSpecies.has(id));
    expect(inForest.length).toBeGreaterThanOrEqual(12);
    const listed = new Set(regions.regions.flatMap((r) => r.wildSpecies.map((w) => w.speciesId)));
    for (const id of WILD) expect(listed.has(id), id).toBe(true);
    // a sim cria selvagens das espécies novas com golpes do learnset
    const { sim } = createForestProofWorld(11);
    const wilds = sim.state.entities.filter((e) => e.kind === "wild" && WILD.includes(e.speciesId!));
    expect(wilds.length).toBeGreaterThan(0);
    for (const w of wilds) expect(w.moves.filter(Boolean).length, w.name).toBeGreaterThan(0);
  });
});
