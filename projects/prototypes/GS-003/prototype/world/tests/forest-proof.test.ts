import { describe, expect, it } from "vitest";
import { resolveSceneTiles, type SceneAliases } from "../src/assets/scene-tiles";
import { buildTileSources, loadTileSources } from "../src/assets/tiles";
import aliasesJson from "../src/data/maps/forest-proof.aliases.json";
import { createForestProofWorld, FOREST_PROOF_SCENE, loadForestProofMap } from "../src/sim/setup";
import { snapshot, stepWorld } from "../src/sim/world";
import { ofType, run } from "./helpers";

const aliases = aliasesJson as SceneAliases;

describe("cena forest-proof (prova visual GS-004 §4)", () => {
  const map = loadForestProofMap();

  it("mapa: floresta densa com clareiras, trilha e grama alta; inícios livres para os 4 jogadores", () => {
    const keys = map.tileLayers[0].keys;
    const count = (re: RegExp) => keys.filter((k) => re.test(k)).length;
    expect(count(/fp_floor_forest/)).toBeGreaterThan(keys.length * 0.35);
    expect(count(/fp_floor_clearing/)).toBeGreaterThan(keys.length * 0.15);
    expect(count(/fp_path/)).toBeGreaterThan(60);
    const props = (re: RegExp) => map.props.filter((p) => re.test(p.key)).length;
    expect(props(/fp_tree/)).toBeGreaterThan(400);
    expect(props(/fp_tall_grass/)).toBeGreaterThan(100);
    expect(props(/fp_flower/)).toBeGreaterThan(30);
    const solid = (v: { x: number; y: number }) => map.solid[Math.floor(v.y / 16) * map.width + Math.floor(v.x / 16)];
    for (const p of FOREST_PROOF_SCENE.players) {
      expect(map.starts[p.start], p.start).toBeDefined();
      expect(solid(map.starts[p.start]), p.start).toBe(0);
    }
    expect(map.spawns.length).toBeGreaterThanOrEqual(5);
  });

  it("toda chave lógica do mapa tem alias; com os pacotes de hoje nenhuma cai em placeholder", () => {
    const used = new Set([...map.tileLayers.flatMap((l) => l.keys.filter(Boolean)), ...map.props.map((p) => p.key)]);
    for (const k of used) expect(aliases.aliases[k], k).toBeDefined();
    const base = loadTileSources();
    const pack = loadTileSources(true, (p) => p.includes(`/${aliases.pack}/`));
    const { tiles, report } = resolveSceneTiles(base, pack, aliases);
    const missing = [...used].filter((k) => !tiles[k]);
    expect(missing).toEqual([]);
    // quando o pacote forest-v3 existe, ele vence (o resto é fallback DS/original)
    if (Object.keys(pack).length) expect(Object.values(report).some((r) => r.origin === "pack")).toBe(true);
  });

  it("resolução: pacote preferido > fallback > placeholder", () => {
    const base = { tree_forest_a: { url: "base-tree" }, path_full: { url: "base-path" } };
    const pack = { tree_round_a: { url: "v3-tree" } };
    const cfg: SceneAliases = {
      pack: "forest-v3",
      aliases: {
        fp_tree_a: { v3: ["tree_round_a"], fallback: ["tree_forest_a"] },
        fp_path: { v3: ["path_rich"], fallback: ["path_full"] },
        fp_tall_grass_a: { v3: ["tall_grass_a"], fallback: [] },
      },
    };
    const { tiles, report } = resolveSceneTiles(base, pack, cfg);
    expect(tiles.fp_tree_a.url).toBe("v3-tree");
    expect(tiles.fp_path.url).toBe("base-path");
    expect(tiles.fp_tall_grass_a).toBeUndefined();
    expect(report.fp_tall_grass_a.origin).toBe("placeholder");
  });

  it("tileset.json no formato dos pacotes *-dwds/forest-v3 (lista com 'file') é aceito", () => {
    const src = buildTileSources(
      { "/x/forest-v3/props/tree_round_a.png": "u1", "/x/forest-v3/tiles/sheet.png": "u2" },
      { "/x/forest-v3/tileset.json": { tiles: [{ file: "tiles/sheet.png", key: "floor_x", rect: [0, 0, 32, 32] }], props: [{ file: "props/tree_round_a.png", collision: true }] } },
    );
    expect(src.tree_round_a).toEqual({ url: "u1" });
    expect(src.floor_x).toEqual({ url: "u2", rect: [0, 0, 32, 32], pivot: undefined });
  });

  it("3 jogadores bot, cada um com seu Digimon seguindo e lutando com AUTO", () => {
    const { sim, events } = createForestProofWorld(7, { auto: true });
    const bots = sim.state.players.filter((p) => p.bot);
    expect(bots).toHaveLength(3);
    expect(ofType(events, "spawn").filter((s) => s.entity.kind === "remote_partner")).toHaveLength(3);
    const evs = run(sim, 1500);
    for (const b of bots) {
      expect(ofType(evs, "attack_start").some((a) => a.attackerId === b.partnerId), `${b.id} lutou`).toBe(true);
      const tamer = sim.state.entities.find((e) => e.id === b.tamerId)!;
      const partner = sim.state.entities.find((e) => e.id === b.partnerId)!;
      expect(Math.hypot(tamer.x - partner.x, tamer.y - partner.y), `${b.id} parceira perto`).toBeLessThan(10 * 16);
    }
    expect(ofType(evs, "reward").some((r) => r.ownerId === "p1")).toBe(true);
  });

  it("determinismo: mesma semente → mesmos eventos (a cena não injeta nada na sim)", () => {
    const a = createForestProofWorld(99, { auto: true });
    const b = createForestProofWorld(99, { auto: true });
    for (let i = 0; i < 400; i++) expect(stepWorld(a.sim, [])).toEqual(stepWorld(b.sim, []));
    expect(snapshot(a.sim)).toEqual(snapshot(b.sim));
  });
});
