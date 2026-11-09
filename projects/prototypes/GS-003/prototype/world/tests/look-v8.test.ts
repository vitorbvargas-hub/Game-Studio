// Look v8 (profundidade, DRAKANTOS_VISUAL_STUDY.md): passe de profundidade do gerador (platô com rampa e colisão,
// decalques fora da trilha, lama, emissores), a variante do digimon-forest-01 (?look=v8) e o grade/luzes do renderer.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateFromBrief } from "../scripts/map-factory/generate.mjs";
import { applyLook } from "../scripts/map-factory/look.mjs";
import v8Pack from "../src/data/maps/v8/digimon-forest-01.aliases.json";
import v8Map from "../src/data/maps/v8/digimon-forest-01.tmj.json";
import { flicker, gradePixels, gradeRuleFor, mapLights, type LookCfg } from "../src/render/look";
import { parseTiledMap, type TiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";

const T = 32;
const ART = join(__dirname, "../../../art/map-factory/forest-v8-depth");
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

  it("NPCs do forest-v8-depth (26×33, escala do Tamer) no lugar dos do v7, mesma célula e corpo sólido; o padrão não muda", () => {
    const cellOf = (p: { x: number; y: number }) => [Math.floor(p.x / T), Math.floor((p.y - 1) / T)];
    expect(map.props.some((p) => p.key.startsWith("fp7_npc_"))).toBe(false);
    const ranger = map.props.find((p) => p.key === "fp8_npc_ranger")!;
    const merchant = map.props.find((p) => p.key === "fp8_npc_merchant")!;
    expect(cellOf(ranger)).toEqual([43, 24]);
    expect(cellOf(merchant)).toEqual([25, 22]);
    for (const p of [ranger, merchant]) {
      expect(p.solid).toBe(true);
      const [x, y] = cellOf(p);
      expect(map.solid[y * map.width + x]).toBe(1);
    }
    expect(look.npcKeys).toEqual(["fp8_npc_ranger", "fp8_npc_merchant"]);
    for (const k of look.npcKeys!) expect(gradeRuleFor(k, look)?.skip).toBe(true);
    for (const f of ["npc_ranger", "npc_merchant"]) {
      const png = readFileSync(join(ART, "props", `${f}.png`));
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([26, 33]);
    }
    const base = parseTiledMap("digimon-forest-01", MAPS["digimon-forest-01"].tmj);
    expect(base.props.some((p) => p.key === "fp7_npc_ranger")).toBe(true);
    expect(base.props.some((p) => /lantern|campfire|fp8_npc/.test(p.key))).toBe(false);
  });

  it("lanternas nas trilhas (entrada, placas, ponte, arena) e fogueira no acampamento: sólidas, fora da trilha, luz quente com flicker de fogo", () => {
    const cellOf = (p: { x: number; y: number }) => [Math.floor(p.x / T), Math.floor((p.y - 1) / T)];
    const near = (k: string, x: number, y: number, r: number) => map.props.some((p) => p.key === k && Math.hypot(cellOf(p)[0] - x, cellOf(p)[1] - y) <= r);
    const lamps = map.props.filter((p) => p.key === "fp8_lantern_post");
    const fires = map.props.filter((p) => p.key === "fp8_campfire_small");
    expect(lamps.length).toBe(8);
    expect(fires.length).toBe(1);
    expect(near("fp8_lantern_post", 25, 37, 3)).toBe(true); // entrada sul
    expect(near("fp8_lantern_post", 24, 31, 2.5)).toBe(true); // placa da entrada (a placa fica entre a trilha e o guia: a célula livre mais perto)
    expect(near("fp8_lantern_post", 9, 7, 2)).toBe(true); // placa secreta
    expect(near("fp8_lantern_post", 25, 9, 2.5) && near("fp8_lantern_post", 31, 9, 2.5)).toBe(true); // cabeceiras da ponte
    expect(near("fp8_lantern_post", 47, 20, 3)).toBe(true); // entrada da arena
    expect(near("fp8_campfire_small", 43, 24, 3)).toBe(true); // acampamento do guarda
    const g = map.tileLayers[0].keys;
    for (const p of [...lamps, ...fires]) {
      const [x, y] = cellOf(p);
      expect(p.solid).toBe(true);
      expect(map.solid[y * map.width + x]).toBe(1);
      expect(g[y * map.width + x]).not.toMatch(/path/);
    }
    const ls = mapLights(map, look);
    const lamp = ls.find((l) => l.kind === "fp8_lantern_post")!;
    const fire = ls.find((l) => l.kind === "fp8_campfire_small")!;
    expect([lamp.color, lamp.fire, fire.color, fire.fire]).toEqual(["#ffb347", true, "#ff7a33", true]);
    expect(look.canopyMask).toBeGreaterThan(0.5);
    const ks: number[] = [];
    for (let t = 0; t < 8000; t += 53) {
      const f = flicker(fire, t);
      ks.push(f.k);
      expect(f.k).toBeGreaterThan(0.6);
      expect(f.k).toBeLessThan(1.3);
      expect(Math.abs(f.r - 1)).toBeLessThan(0.07);
    }
    expect(Math.max(...ks) - Math.min(...ks)).toBeGreaterThan(0.2); // tremula de verdade
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
  it("troca de chão chega aos recortes suaves (sem retângulo de chão v4 na borda da mata) e sem a grama quadrada do v7", () => {
    // o chão em volta da borda da mata e da trilha é o mesmo das clareiras v8 (senão a célula de borda vira um bloco)
    for (const s of (v8Pack as { smoothAutotile: { prefix: string; ground: string[] }[] }).smoothAutotile)
      expect(s.ground.every((k) => k.startsWith("fp8_ground_variant_")), s.prefix).toBe(true);
    expect(JSON.stringify(v8Map)).not.toContain("fp7_tall_grass_c");
    // applyLook não estraga a própria regra de troca (o lookAliases dos aliases usa a mesma `from`)
    const from = ["a0", "a1"];
    const b = { terrains: { c: { variants: ["a0", "a1"] } }, pack: {} } as Record<string, unknown>;
    applyLook(b, { look: { id: "t", groundSwap: { from, to: ["b0"] }, propSwaps: [{ from: ["g0", "g1"], to: ["g0", "g0"] }] } });
    expect((b.look as { groundSwap: { from: string[] } }).groundSwap.from).toEqual(["a0", "a1"]);
    expect((b.terrains as { c: { variants: string[] } }).c.variants).toEqual(["b0"]);
  });
});
