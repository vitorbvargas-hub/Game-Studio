import { describe, expect, it } from "vitest";
import { loadSceneTiles, presetFilter, resolvePackTiles, treeParts, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import { buildTileSources } from "../src/assets/tiles";
import packJson from "../src/data/maps/forest-proof.aliases.json";
import tileset from "@game-assets/03-environments/forest-v4/tileset.json";
import { createForestProofWorld, FOREST_PROOF_SCENE, loadForestProofMap } from "../src/sim/setup";
import { snapshot, stepWorld } from "../src/sim/world";
import { ofType, run } from "./helpers";

const packCfg = packJson as ScenePack;

describe("cena forest-proof (prova visual GS-004 §4)", () => {
  const map = loadForestProofMap();

  it("mapa: floresta densa com clareiras, trilha e grama alta; inícios livres para os 4 jogadores", () => {
    const keys = map.tileLayers[0].keys;
    const count = (re: RegExp) => keys.filter((k) => re.test(k)).length;
    expect(count(/^fp4_denseedge_w47_/)).toBeGreaterThan(keys.length * 0.35);
    expect(count(/^fp4_clearing_floor_v41_0[0-3]$/)).toBeGreaterThan(keys.length * 0.15);
    expect(count(/^fp4_path_w47_/)).toBeGreaterThan(60);
    // v4.1 substitui o chão do v4 neste mapa
    expect(count(/_blob_|^fp4_grass_/)).toBe(0);
    const props = (re: RegExp) => map.props.filter((p) => re.test(p.key)).length;
    expect(props(/^fp4_tree_/)).toBeGreaterThan(400);
    // as 2 árvores novas do v4.1
    expect(props(/^fp4_tree_palm_digital$/)).toBeGreaterThan(8);
    expect(props(/^fp4_tree_data_leaf$/)).toBeGreaterThan(30);
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
      for (const t of ["fp4_tree_palm_digital", "fp4_tree_data_leaf"]) expect(r.tiles[treeParts(t).top].url, `${preset} ${t}`).toMatch(preset === "night" ? /night\/props\// : /forest-v4\/props\//);
      expect(r.tiles.fp4_path_w47_255.url).toMatch(preset === "night" ? /night\/tiles\/path_w47_255/ : /forest-v4\/tiles\/path_w47_255/);
    }
  });

  it("autotile Wang/blob-47: máscara de 8 vizinhos normalizada (diagonal só com as 2 bordas); mata interna sólida, borda livre", () => {
    const keys = map.tileLayers[0].keys;
    const W = map.width;
    const H = map.height;
    const type = (x: number, y: number) => {
      const k = keys[y * W + x];
      return k.startsWith("fp4_path") ? "p" : k.startsWith("fp4_denseedge") ? "f" : "c";
    };
    // trilha: fora do mapa repete a borda; mata: fora do mapa é mata
    const sameP = (x: number, y: number) => type(Math.max(0, Math.min(W - 1, x)), Math.max(0, Math.min(H - 1, y))) === "p";
    const sameF = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || type(x, y) === "f";
    const mask = (x: number, y: number, same: (x: number, y: number) => boolean) => {
      const [N, E, S, Wn] = [same(x, y - 1), same(x + 1, y), same(x, y + 1), same(x - 1, y)];
      return (+N) | (+E << 1) | (+S << 2) | (+Wn << 3) | (+(N && E && same(x + 1, y - 1)) << 4) | (+(S && E && same(x + 1, y + 1)) << 5) | (+(S && Wn && same(x - 1, y + 1)) << 6) | (+(N && Wn && same(x - 1, y - 1)) << 7);
    };
    const files = new Set<string>(tileset.autotileV41.sets.flatMap((s) => s.files.map((f) => f.replace(/^tiles\/|\.png$/g, ""))));
    let checked = 0;
    const seen = new Set<string>();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const t = type(x, y);
        if (t === "c") continue;
        const want = t === "p" ? `fp4_path_w47_${mask(x, y, sameP)}` : `fp4_denseedge_w47_${mask(x, y, sameF)}`;
        expect(keys[y * W + x]).toBe(want);
        expect(files.has(want.slice(4)), want).toBe(true);
        seen.add(want);
        checked++;
      }
    expect(checked).toBeGreaterThan(1000);
    // usa as diagonais de fato (formas além das 16 de bordas)
    expect([...seen].filter((k) => Number(k.split("_").pop()) > 15).length).toBeGreaterThan(10);
    const dense = keys.map((k, i) => (k.startsWith("fp4_denseedge") ? map.solid[i] : -1)).filter((v) => v >= 0);
    expect(dense.filter((v) => v === 1).length).toBeGreaterThan(200);
    expect(dense.filter((v) => v === 0).length).toBeGreaterThan(100);
  });

  it("trilha orgânica: 1 a 2 tiles de largura, conectada em 4 direções, sem calombos nem reentrâncias de 1 tile", () => {
    const keys = map.tileLayers[0].keys;
    const W = map.width;
    const H = map.height;
    const p = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < H && keys[y * W + x].startsWith("fp4_path");
    const n4 = (x: number, y: number) => +p(x, y - 1) + +p(x + 1, y) + +p(x, y + 1) + +p(x - 1, y);
    let tiles = 0;
    let wide = 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        // nunca 3×3 de terra (no máximo 2 de largura)
        if (x < W - 2 && y < H - 2) {
          let all = true;
          for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) all &&= p(x + i, y + j);
          expect(all, `3×3 em ${x},${y}`).toBe(false);
        }
        if (!p(x, y)) {
          // reentrância: tile de grama cercado por trilha em 3 lados
          expect(n4(x, y), `reentrância em ${x},${y}`).toBeLessThan(3);
          continue;
        }
        tiles++;
        if (p(x + 1, y) && p(x, y + 1) && p(x + 1, y + 1)) wide++;
        // diagonal solta (só encosta pelo canto) = serrilhado
        for (const dx of [-1, 1]) if (p(x + dx, y + 1)) expect(p(x + dx, y) || p(x, y + 1), `diagonal solta em ${x},${y}`).toBe(true);
        expect(n4(x, y), `tile isolado em ${x},${y}`).toBeGreaterThan(0);
      }
    expect(tiles).toBeGreaterThan(150);
    // largura variável: há trechos de 2 tiles (blocos 2×2) e trechos de 1
    expect(wide).toBeGreaterThan(20);
    expect(wide).toBeLessThan(tiles * 0.6);
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
