import { describe, expect, it } from "vitest";
import { loadSceneTiles, presetFilter, resolvePackTiles, treeParts, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import { buildTileSources } from "../src/assets/tiles";
import packJson from "../src/data/maps/forest-proof.aliases.json";
import { createForestProofWorld, FOREST_PROOF_SCENE, loadForestProofMap } from "../src/sim/setup";
import { snapshot, stepWorld } from "../src/sim/world";
import { ofType, run } from "./helpers";

const packCfg = packJson as ScenePack;

describe("cena forest-proof (prova visual GS-004 §4)", () => {
  const map = loadForestProofMap();

  it("mapa: floresta densa com clareiras, trilha e grama alta; inícios livres para os 4 jogadores", () => {
    const keys = map.tileLayers[0].keys;
    const count = (re: RegExp) => keys.filter((k) => re.test(k)).length;
    expect(count(/^fp4_denseedge_blob_/)).toBeGreaterThan(keys.length * 0.35);
    expect(count(/^fp4_grass_0[0-5]$/)).toBeGreaterThan(keys.length * 0.15);
    expect(count(/^fp4_path_blob_/)).toBeGreaterThan(60);
    const props = (re: RegExp) => map.props.filter((p) => re.test(p.key)).length;
    expect(props(/^fp4_tree_/)).toBeGreaterThan(400);
    expect(props(/^fp4_tall_grass/)).toBeGreaterThan(100);
    expect(props(/^fp4_flower_cluster/)).toBeGreaterThan(30);
    const solid = (v: { x: number; y: number }) => map.solid[Math.floor(v.y / 16) * map.width + Math.floor(v.x / 16)];
    for (const p of FOREST_PROOF_SCENE.players) {
      expect(map.starts[p.start], p.start).toBeDefined();
      expect(solid(map.starts[p.start]), p.start).toBe(0);
    }
    expect(map.spawns.length).toBeGreaterThanOrEqual(5);
  });

  it("forest-v4: toda chave do mapa resolve no pacote (dia e noite), sem placeholder; árvores em 2 sprites", () => {
    const used = usedKeys(map);
    for (const k of used) expect(k.startsWith(packCfg.prefix), k).toBe(true);
    for (const preset of ["day", "night"] as const) {
      const r = loadSceneTiles(packCfg, preset, used);
      expect(r.missing, preset).toEqual([]);
      const tree = map.props.find((p) => p.key.startsWith("fp4_tree_"))!;
      const parts = treeParts(tree.key);
      expect(r.tiles[parts.base].url, preset).toMatch(preset === "night" ? /forest-v4\/night\/props\// : /forest-v4\/props\//);
      expect(r.tiles[parts.top].url).toMatch(/_top\.png/);
      expect(r.tiles.fp4_canopy_shadow_large).toBeDefined();
    }
  });

  it("autotile 16 peças: bitmask N1+E2+S4+W8 sobre o tipo do terreno; mata interna sólida, borda livre", () => {
    const keys = map.tileLayers[0].keys;
    const type = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) return "f";
      const k = keys[y * map.width + x];
      return k.startsWith("fp4_path") ? "p" : k.startsWith("fp4_denseedge") ? "f" : "c";
    };
    let checked = 0;
    for (let y = 0; y < map.height; y++)
      for (let x = 0; x < map.width; x++) {
        const t = type(x, y);
        if (t === "c") continue;
        const bm = (type(x, y - 1) === t ? 1 : 0) + (type(x + 1, y) === t ? 2 : 0) + (type(x, y + 1) === t ? 4 : 0) + (type(x - 1, y) === t ? 8 : 0);
        expect(keys[y * map.width + x]).toBe(t === "p" ? `fp4_path_blob_${bm}` : `fp4_denseedge_blob_${bm}`);
        checked++;
      }
    expect(checked).toBeGreaterThan(1000);
    // há mata sólida (miolo) e mata não sólida (borda colada na clareira), com a mesma família de tiles
    const dense = keys.map((k, i) => (k.startsWith("fp4_denseedge") ? map.solid[i] : -1)).filter((v) => v >= 0);
    expect(dense.filter((v) => v === 1).length).toBeGreaterThan(200);
    expect(dense.filter((v) => v === 0).length).toBeGreaterThan(100);
  });

  it("presets: dia ignora a pasta night/, noite usa só ela; prefixo mapeia o nome do PNG", () => {
    expect(presetFilter(packCfg, "day")("/a/forest-v4/props/tree_round_a_top.png")).toBe(true);
    expect(presetFilter(packCfg, "day")("/a/forest-v4/night/props/tree_round_a_top.png")).toBe(false);
    expect(presetFilter(packCfg, "night")("/a/forest-v4/night/props/tree_round_a_top.png")).toBe(true);
    expect(presetFilter(packCfg, "night")("/a/forest-v3/props/tree_round_a.png")).toBe(false);
    const r = resolvePackTiles({}, { grass_00: { url: "g" }, tree_x_base: { url: "b" }, tree_x_top: { url: "t" } }, packCfg, ["fp4_grass_00", "fp4_tree_x", "fp4_nada"]);
    expect(r.tiles.fp4_grass_00.url).toBe("g");
    expect(r.missing).toEqual(["fp4_nada"]);
    expect(r.fromPack).toBe(2);
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

  it("execução longa (base do progresso offline): 5 sementes × 20 000 ticks sem transição ilegal da FSM", () => {
    for (const seed of [1, 2, 3, 7, 42]) {
      const { sim } = createForestProofWorld(seed, { auto: true });
      expect(() => {
        for (let i = 0; i < 20_000; i++) stepWorld(sim, []);
      }, `semente ${seed}`).not.toThrow();
    }
  }, 30_000);
});
