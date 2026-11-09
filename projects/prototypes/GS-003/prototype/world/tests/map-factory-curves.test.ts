// Map Factory R2: trilhas e riacho contínuos (spline de largura constante, sem degraus de 90°), corner16 do forest-v7,
// travessias ponte/vau, NPC com corpo e o overlay do renderer (src/render/curves.ts).
import { describe, expect, it } from "vitest";
import { inPolygon, polygonCenterline } from "../scripts/map-factory/adapt-brief.mjs";
import { cornerMask, curveField, curvePolyline, generateFromBrief, sampleCurve } from "../scripts/map-factory/generate.mjs";
import { validateMap } from "../scripts/map-factory/validate.mjs";
import { buildCurveIndex, composeCurveOverlay } from "../src/render/curves";
import { parseTiledMap, type MapCurve } from "../src/sim/map";

const T = 32;
const clr = ["c0", "c1"];
const terrains = {
  forest: { variants: ["forest"], solid: true },
  clearing: { variants: clr, solid: false },
  path: { autotile: "w47", prefix: "p_w47_", outside: "clamp", solid: false, border: "clearing", curve: { fill: "p_w47_255", ground: clr, edge: "dither" } },
  water: { autotile: "c16", prefix: "w_c16_", outside: "clamp", solid: true, curve: { fill: "w_c16_15", ground: clr, edge: "foam", foam: "#4fa7b5" } },
};
const baseBrief = (extra: Record<string, unknown>) => ({
  id: "curve-test",
  seed: 3,
  size: { width: 30, height: 24, tile: T },
  terrains,
  base: "forest",
  areas: [{ name: "campo", terrain: "clearing", shape: "rect", x: 0, y: 0, w: 30, h: 24 }],
  starts: { player: [2, 12] },
  ...extra,
});

describe("curva contínua (gerador)", () => {
  it("sampleCurve: amostras densas e meia-largura constante quando os pontos não pedem outra", () => {
    const s = sampleCurve([[2, 2, 1], [10, 6, 1], [20, 3, 1]], { step: 0.25 });
    expect(s.length).toBeGreaterThan(60);
    expect(new Set(s.map((p) => p.hw.toFixed(6))).size).toBe(1);
    for (let k = 1; k < s.length; k++) expect(Math.hypot(s[k].x - s[k - 1].x, s[k].y - s[k - 1].y)).toBeLessThan(0.3);
    const pl = curvePolyline(s, T);
    expect(pl.points.length).toBe(pl.hw.length);
    expect(pl.hw.every((h) => h === 32)).toBe(true);
  });

  it("trilha diagonal: a faixa (células) tem a mesma largura em toda a extensão, sem escada de 1 tile", () => {
    const { tmj } = generateFromBrief(baseBrief({ paths: [{ name: "d", terrain: "path", points: [[1, 1], [28, 22]], curve: { halfWidth: 0.9, pad: 0.45 } }] }));
    const map = parseTiledMap("curve-test", tmj);
    const g = map.tileLayers[0].keys;
    // por linha, a largura da trilha na horizontal fica estável (diagonal ~45° → constante ±1)
    const widths: number[] = [];
    for (let y = 4; y < 20; y++) widths.push(g.slice(y * 30, y * 30 + 30).filter((k) => k.startsWith("p_w47_")).length);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    // a camada curves leva a polilinha, a textura cheia e o chão de baixo
    expect(map.curves).toHaveLength(1);
    expect(map.curves![0]).toMatchObject({ terrain: "path", prefix: "p_w47_", fill: "p_w47_255", ground: clr, edge: "dither" });
  });

  it("riacho contínuo com ponte (eixo automático, avança 1 tile de terra) e vau (andável, pedras não sólidas)", () => {
    const b = baseBrief({
      areas: [
        { name: "campo", terrain: "clearing", shape: "rect", x: 0, y: 0, w: 30, h: 24 },
        { name: "rio", terrain: "water", shape: "river", points: [[14.5, -2, 1.6, 0], [15.5, 6, 1.6, 1], [15.5, 9, 1.6, 1], [14, 16, 1.6, 0], [15, 26, 1.6, 0]], curve: { pad: 0.5 }, afterPaths: true },
      ],
      bridges: [
        { name: "ponte", auto: true, axis: "auto", x: 15, y: 7, set: ["b0", "b1", "b2"], setV: ["v0", "v1", "v2"], pad: 1 },
        { name: "vau", auto: true, axis: "auto", x: 15, y: 18, kind: "ford" },
      ],
      fordStones: ["stone"],
    });
    const { tmj, stats } = generateFromBrief(b);
    const [br, ford] = stats.bridges;
    expect(br).toMatchObject({ kind: "bridge", y: 7, h: 1 });
    expect(ford).toMatchObject({ kind: "ford", y: 18, h: 1 });
    const map = parseTiledMap("curve-test", tmj);
    const solid = (x: number, y: number) => map.solid[y * 30 + x] === 1;
    for (let x = br.x; x < br.x + br.w; x++) expect(solid(x, 7), `ponte ${x}`).toBe(false);
    for (let x = ford.x; x < ford.x + ford.w; x++) expect(solid(x, 18), `vau ${x}`).toBe(false);
    expect(solid(br.x, 7 + 4) || solid(15, 12)).toBe(true);
    // a ponte pisa em terra nas pontas e a arte vai em ground_detail
    const det = map.tileLayers.find((l) => l.name === "ground_detail")!.keys;
    expect(det[7 * 30 + br.x]).toBe("b0");
    expect(det[7 * 30 + br.x + br.w - 1]).toBe("b2");
    expect(map.tileLayers[0].keys[7 * 30 + br.x].startsWith("w_c16_")).toBe(false);
    const stones = map.props.filter((p) => p.key === "stone");
    expect(stones.length).toBe(ford.w);
    expect(stones.every((p) => !p.solid)).toBe(true);
    expect(map.curves!.find((c) => c.terrain === "water")!.fords).toEqual([{ x: ford.x * T, y: 18 * T, w: ford.w * T, h: T }]);
    // gates: wang (corner16) e o resto passam
    const r = validateMap("curve-test", tmj, { species: new Set(), maps: {} } as never);
    expect(r.gates.find((g) => g.id === "wang")!.status).toBe("pass");
    expect(r.gates.find((g) => g.id === "reach")!.status).toBe("pass");
  });

  it("corner16: canto ligado só com as 4 células em volta do terreno; o gate wang acusa máscara errada", () => {
    const set = new Set(["1,1", "2,1", "1,2", "2,2", "3,1", "3,2"]);
    const same = (x: number, y: number) => set.has(`${x},${y}`);
    expect(cornerMask(same, 2, 1)).toBe(0b0011); // só os cantos de baixo (SW, SE) têm as 4 células
    expect(cornerMask(same, 1, 1)).toBe(0b0001);
    expect(cornerMask(same, 5, 5)).toBe(0);
    const { tmj } = generateFromBrief(baseBrief({ areas: [{ name: "campo", terrain: "clearing", shape: "rect", x: 0, y: 0, w: 30, h: 24 }, { name: "lago", terrain: "water", shape: "rect", x: 10, y: 10, w: 4, h: 3 }] }));
    const ok = validateMap("curve-test", tmj, { species: new Set(), maps: {} } as never);
    expect(ok.gates.find((g) => g.id === "wang")!.status).toBe("pass");
    // estraga uma célula: troca a chave do canto pela do miolo
    const ts = tmj.tilesets[0];
    const full = ts.tiles.find((t: { properties: { name: string; value: unknown }[] }) => t.properties.some((p) => p.value === "w_c16_15"));
    const ground = tmj.layers.find((l: { name: string }) => l.name === "ground");
    ground.data[10 * 30 + 10] = ts.firstgid + full.id;
    const bad = validateMap("curve-test", tmj, { species: new Set(), maps: {} } as never);
    expect(bad.gates.find((g) => g.id === "wang")!.errors.join(" ")).toMatch(/\(10,10\) tem máscara 15/);
  });

  it("curveField: folga negativa dentro da faixa, positiva fora", () => {
    const s = sampleCurve([[0, 5, 1], [20, 5, 1]]);
    const f = curveField(s, { W: 20, H: 10, reach: 2 });
    expect(f.get(5 * 20 + 10)!.f).toBeLessThan(0);
    expect(f.get(7 * 20 + 10)!.f).toBeGreaterThan(0.9);
  });
});

describe("riacho em polígono (brief v2)", () => {
  it("polygonCenterline: segue o meio do corredor em Z de borda a borda e foge de POI seco", () => {
    const Z = [[26, 0], [30, 0], [30, 16], [18, 16], [18, 40], [14, 40], [14, 12], [26, 12]];
    expect(inPolygon(Z, 28, 5)).toBe(true);
    expect(inPolygon(Z, 22, 5)).toBe(false);
    const line = polygonCenterline(Z, { W: 56, H: 40 });
    expect(line[0][1]).toBeLessThan(0);
    expect(line[line.length - 1][1]).toBeGreaterThan(40);
    for (const p of line.slice(1, -1)) expect(inPolygon(Z, p[0], p[1]), `${p[0]},${p[1]}`).toBe(true);
    // no braço sul a linha fica perto de x = 16 (meio do corredor 14..18)
    for (const p of line.filter((q) => q[1] > 22 && q[1] < 38)) expect(Math.abs(p[0] - 16)).toBeLessThan(1);
    const dry = polygonCenterline(Z, { W: 56, H: 40 }, { dry: [[28.5, 15.5]] });
    const nearDry = Math.min(...dry.map((p) => Math.hypot(p[0] - 28.5, p[1] - 15.5)));
    const nearPlain = Math.min(...line.map((p) => Math.hypot(p[0] - 28.5, p[1] - 15.5)));
    expect(nearDry).toBeGreaterThanOrEqual(nearPlain);
  });
});

describe("renderer: faixa contínua (curves.ts)", () => {
  const TS = 32;
  const fill = new Uint8ClampedArray(TS * TS * 4).map((_, i) => (i % 4 === 3 ? 255 : 100));
  const curve = (pts: [number, number][], hw: number, extra: Partial<MapCurve> = {}): MapCurve => ({
    name: "c",
    terrain: "path",
    prefix: "p_",
    fill: "full",
    ground: ["g"],
    edge: "dither",
    z: 0,
    points: pts.map(([x, y]) => ({ x, y })),
    hw: pts.map(() => hw),
    fords: [],
    ...extra,
  });

  it("diagonal: a largura medida perpendicular à linha é a mesma em qualquer célula (sem degrau na emenda dos tiles)", () => {
    const W = 10;
    const c = curve([[0, 0], [320, 320]], 20);
    const keys = Array.from({ length: W * W }, () => "");
    const idx = buildCurveIndex([c], W, W, TS, (i) => keys[i]);
    // pinta o mundo inteiro e mede a largura na anti-diagonal em vários pontos
    const world = new Uint8Array(W * TS * W * TS);
    for (let my = 0; my < W; my++)
      for (let mx = 0; mx < W; mx++) {
        const px = composeCurveOverlay(idx, mx, my, TS, W, () => fill);
        if (!px) continue;
        for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) if (px[(y * TS + x) * 4 + 3]) world[(my * TS + y) * W * TS + mx * TS + x] = 1;
      }
    const widthAt = (t: number) => {
      let n = 0;
      for (let d = -40; d <= 40; d += 0.5) {
        const x = Math.round(t + d / Math.SQRT2);
        const y = Math.round(t - d / Math.SQRT2);
        if (world[y * W * TS + x]) n++;
      }
      return n / 2;
    };
    const ws = [48, 64, 80, 96, 112, 128, 160, 200, 240].map(widthAt);
    for (const w of ws) expect(Math.abs(w - 40), `largura ${w}`).toBeLessThanOrEqual(4);
    expect(Math.max(...ws) - Math.min(...ws)).toBeLessThanOrEqual(5);
  });

  it("célula do conjunto perto da curva é dela (o renderer põe o chão embaixo); célula longe não tem faixa", () => {
    const W = 6;
    const keys = Array.from({ length: W * W }, (_, i) => (Math.floor(i / W) === 2 ? "p_1" : ""));
    const idx = buildCurveIndex([curve([[0, 80], [192, 80]], 16)], W, W, TS, (i) => keys[i]);
    expect(idx.owner.has(2 * W + 3)).toBe(true);
    expect(idx.owner.has(4 * W + 3)).toBe(false);
    expect(composeCurveOverlay(idx, 3, 5, TS, W, () => fill)).toBeNull();
    // água: espuma clara na margem e o vau mais claro que a água funda
    const w = curve([[96, 0], [96, 192]], 40, { terrain: "water", edge: "foam", foam: "#ffffff", fords: [{ x: 32, y: 96, w: 128, h: 32 }] });
    const idw = buildCurveIndex([w], W, W, TS, () => "");
    const deep = composeCurveOverlay(idw, 2, 1, TS, W, () => fill)!;
    const ford = composeCurveOverlay(idw, 2, 3, TS, W, () => fill)!;
    const at = (px: Uint8ClampedArray, x: number, y: number) => px[(y * TS + x) * 4];
    expect(at(deep, 31, 16)).toBe(100);
    expect(at(ford, 31, 16)).toBeGreaterThan(130);
  });
});
