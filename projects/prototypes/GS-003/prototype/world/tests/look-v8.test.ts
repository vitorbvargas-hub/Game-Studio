// Look v8 (profundidade, DRAKANTOS_VISUAL_STUDY.md): passe de profundidade do gerador (platô com rampa e colisão,
// decalques fora da trilha, lama, emissores), a variante do digimon-forest-01 (?look=v8) e o grade/luzes do renderer.
import { describe, expect, it } from "vitest";
import { generateFromBrief } from "../scripts/map-factory/generate.mjs";
import v8Pack from "../src/data/maps/v8/digimon-forest-01.aliases.json";
import v8Map from "../src/data/maps/v8/digimon-forest-01.tmj.json";
import { flicker, gradePixels, gradeRuleFor, mapLights, type LookCfg } from "../src/render/look";
import { parseTiledMap, type TiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";

const T = 32;
const clr = ["c0", "c1"];
const terrains = {
  forest: { variants: ["forest"], solid: true },
  clearing: { variants: clr, solid: false },
  path: { autotile: "w47", prefix: "p_w47_", outside: "clamp", solid: false, border: "clearing", curve: { fill: "p_w47_255", ground: clr, edge: "dither" } },
};
const brief = (depth?: Record<string, unknown>) => ({
  id: "depth-test",
  seed: 5,
  size: { width: 30, height: 24, tile: T },
  terrains: JSON.parse(JSON.stringify(terrains)),
  base: "forest",
  areas: [{ name: "campo", terrain: "clearing", shape: "rect", x: 1, y: 1, w: 28, h: 22 }],
  paths: [{ name: "trilha", terrain: "path", points: [[2, 20], [27, 20]], curve: { halfWidth: 0.9, pad: 0.45 } }],
  starts: { player: [3, 20] },
  ...(depth ? { depth } : {}),
});
const depth = {
  plateaus: [{ name: "mirante", x: 10, y: 8, w: 6, h: 3, ramp: 13 }],
  decals: { max: 3, floor: 0.2, gain: 6, pools: { wet: ["d"], edge: ["d"], open: ["d"] } },
  pathTufts: { keys: ["tufo"] },
  mud: { count: 2, rx: [2, 3], ry: [1.5, 2], spacing: 6 },
  beacons: [{ key: "totem", at: [[20, 6]], solid: true }],
};

describe("passe de profundidade do gerador (look v8)", () => {
  it("sem depth o mapa sai igual; com depth o platô tem face sólida, rampa andável e anel sólido", () => {
    const a = generateFromBrief(brief()).tmj;
    const b = generateFromBrief(brief()).tmj;
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    const m = parseTiledMap("depth-test", generateFromBrief(brief(depth)).tmj as unknown as TiledMap);
    const solid = (x: number, y: number) => m.solid[y * m.width + x];
    expect(solid(13, 11)).toBe(0); // rampa
    expect(solid(12, 11)).toBe(1); // face
    expect(solid(10, 11)).toBe(1); // canto
    expect(solid(12, 9)).toBe(0); // topo
    expect(solid(16, 9)).toBe(1); // anel leste
    expect(solid(12, 7)).toBe(1); // anel norte
    // dá para subir: o topo é alcançável a partir do início
    expect(m.reachable![9 * m.width + 12]).toBe(1);
    const det = m.tileLayers.find((l) => l.name === "ground_detail")!.keys;
    expect(det[11 * m.width + 13]).toBe("fp8_cliff_ramp");
    expect(det[11 * m.width + 10]).toBe("fp8_cliff_face_corner_outer_left");
    expect(det[11 * m.width + 15]).toBe("fp8_cliff_face_corner_outer_right");
    expect(m.tileLayers[0].keys[9 * m.width + 12]).toMatch(/^fp8_cliff_top_blob_\d+$/);
  });

  it("decalques e lama ficam fora da trilha e do platô; tufos ficam na borda da trilha", () => {
    const m = parseTiledMap("depth-test", generateFromBrief(brief(depth)).tmj as unknown as TiledMap);
    const g = m.tileLayers[0].keys;
    const cell = (x: number, y: number) => Math.floor(y / T) * m.width + Math.floor(x / T);
    const ground = (m.decals ?? []).filter((d) => d.key === "d");
    expect(ground.length).toBeGreaterThan(20);
    for (const d of ground) {
      expect(g[cell(d.x, d.y)]).not.toMatch(/^p_w47_|^fp8_cliff/);
    }
    const tufts = (m.decals ?? []).filter((d) => d.key === "tufo");
    expect(tufts.length).toBeGreaterThan(5);
    for (const t of tufts) expect(Math.abs(t.y - 4 - 20 * T)).toBeLessThan(1.2 * T); // linha central em y=20 tiles, meia-largura 0,9
    expect(m.patches!.length).toBeGreaterThan(0);
    for (const p of m.patches!) for (const c of p.cells) expect(g[c]).not.toMatch(/^p_w47_|^fp8_cliff/);
    expect(m.props.some((p) => p.key === "totem")).toBe(true);
  });
});

describe("digimon-forest-01 ?look=v8", () => {
  const def = withLook(MAPS["digimon-forest-01"], "v8");
  const map = parseTiledMap(def.id, def.tmj);
  const look = (v8Pack as unknown as { look: LookCfg }).look;

  it("a variante tem o mesmo id, o look e o platô do mirante com a rampa (26,18)", () => {
    expect(withLook(MAPS["digimon-forest-01"], null).tmj).toBe(MAPS["digimon-forest-01"].tmj);
    expect(def.tmj).toBe(v8Map);
    expect(look.id).toBe("v8");
    expect(map.solid[18 * map.width + 26]).toBe(0);
    expect(map.solid[18 * map.width + 25]).toBe(1);
    expect(map.reachable![15 * map.width + 28]).toBe(1); // POI do mirante, no topo
    expect(map.decals!.length).toBeGreaterThan(300);
    expect(map.patches!.length).toBeGreaterThan(2);
  });

  it("luzes: emissores do pacote (cor do tileset.json) + cura e placas, com flicker limitado", () => {
    const ls = mapLights(map, look);
    const kinds = new Set(ls.map((l) => l.kind));
    for (const k of ["fp8_data_crystal", "fp8_mushroom_bioluminescent", "fp8_data_totem", "fp6_healing_point"]) expect(kinds.has(k)).toBe(true);
    expect(ls.find((l) => l.kind === "fp8_data_crystal")!.color).toBe("#2ce8f5");
    expect(ls.length).toBeGreaterThan(30);
    for (const l of ls.slice(0, 10))
      for (let t = 0; t < 5000; t += 137) {
        const f = flicker(l, t);
        expect(f.k).toBeGreaterThan(0.8);
        expect(f.k).toBeLessThan(1.2);
      }
  });

  it("grade: verde-limão vira verde-escuro acinzentado; emissores ficam fora", () => {
    expect(gradeRuleFor("fp8_data_crystal", look)?.skip).toBe(true);
    expect(gradeRuleFor("fp4_tree_round_a_top", look)).toBeUndefined();
    const px = new Uint8ClampedArray([140, 220, 60, 255, 40, 70, 40, 255]);
    gradePixels(px, look);
    const sat = (r: number, g: number, b: number) => (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b);
    expect(sat(px[0], px[1], px[2])).toBeLessThan(sat(140, 220, 60));
    expect(Math.max(px[0], px[1], px[2])).toBeLessThan(220);
  });
});
