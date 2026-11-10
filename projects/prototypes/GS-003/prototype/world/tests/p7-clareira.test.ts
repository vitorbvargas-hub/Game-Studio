// P7 (Quality Overhaul fase 3): Clareira piloto recomposta pelo derive-look-v9 (scripts/map-factory/p7-clareira.mjs)
// e a água sem ladrilho visível. Confere os dados gerados contra o v8 e o brief
// quality-overhaul/phase2/design/P7_CLAREIRA_BRIEF.md.
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import report from "../src/data/maps/v9/digimon-forest-01.p7-report.json";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { scrollPixels, valueNoise, waterCompose, waterComposeNoisy, waterNoiseFor } from "../src/render/life";
import type { LookCfg } from "../src/render/look";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { parseTiledMap, type TiledMap } from "../src/sim/map";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { snapshot } from "../src/sim/world";
import { MAPS, withLook } from "../src/world/regions";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ID = "digimon-forest-01";
const TS = 32;
const inBox = (p: { x: number; y: number }) => p.x >= 12 * TS && p.x < 42 * TS && p.y >= 6 * TS && p.y < 30 * TS;
const GLOW = /^(fp8_mushroom_bioluminescent|fp7_mushroom_digital|fp8_data_crystal|fp4_mushroom_cluster|fp4_flower_cluster_(purple|white|red)|fp7_flower_digital)$/;
const m8 = parseTiledMap(ID, withLook(MAPS[ID], "v8").tmj);
const m9 = parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
const count = (props: { key: string; x: number; y: number }[], re: RegExp) => props.filter((p) => inBox(p) && re.test(p.key)).length;

describe("P7: Clareira piloto recomposta (dados do v9)", () => {
  it("reagrupa cogumelos, cristais e flores em 3 bolsões sem mudar a contagem; mais agrupados que no v8", () => {
    expect(count(m9.props, GLOW)).toBe(count(m8.props, GLOW));
    expect(Object.keys(report.recluster.pockets)).toHaveLength(3);
    for (const n of Object.values(report.recluster.pockets)) expect(n).toBeGreaterThanOrEqual(8);
    expect(report.recluster.clarkEvansAfter).toBeLessThan(report.recluster.clarkEvansBefore - 0.2);
    // nenhum cristal (sólido) no bolsão do mirante
    const crystals = m9.props.filter((p) => inBox(p) && p.key === "fp8_data_crystal");
    for (const c of crystals) expect(Math.hypot(c.x - 23.6 * TS, c.y - 15.4 * TS)).toBeGreaterThan(3 * TS);
  });

  it("+2 manchas de lama roxa na clareira", () => {
    expect((m9.patches?.length ?? 0) - (m8.patches?.length ?? 0)).toBe(2);
    for (const m of report.mud) expect(m.cells).toBeGreaterThan(0);
  });

  it("molduras de primeiro plano manuais: ponte (2), baú e curva do riacho, compostas e sem colisão", () => {
    const tags = report.frames.filter((f) => f.placed).map((f) => f.tag);
    expect(tags).toEqual(expect.arrayContaining(["ponte-oeste", "ponte-leste", "bau"]));
    expect(tags.filter((t) => t.startsWith("riacho-curva")).length).toBeGreaterThanOrEqual(1);
    const tmj = withLook(MAPS[ID], "v9").tmj as TiledMap;
    const above = tmj.layers.find((l) => l.name === "objects_above")!;
    if (above.type !== "objectgroup") throw new Error("camada");
    const framed = above.objects.filter((o) => o.properties?.some((p) => p.name === "frame"));
    expect(framed.length).toBe(report.fgSprites);
    expect(framed.length).toBeGreaterThanOrEqual(12);
    expect(m9.fgProps!.every((p) => !p.solid)).toBe(true);
    // o v9 só deixa o primeiro plano translúcido quando esconderia a cabeça
    expect((withLook(MAPS[ID], "v9").pack.look as LookCfg).foreground?.headFrac).toBeGreaterThan(0);
  });

  it("tufos sobre a trilha: ~1/3 a menos e sem espaçamento regular (CV do vizinho mais próximo sobe)", () => {
    expect(report.tufts.after).toBeLessThan(report.tufts.before * 0.75);
    expect(report.tufts.nnCvAfter).toBeGreaterThan(report.tufts.nnCvBefore + 0.15);
  });

  it("grama alta nas 2 zonas novas do GS-012, fora da trilha; camada encounters no mapa", () => {
    expect(report.tallGrass["clareira-noroeste-grama"]).toBeGreaterThanOrEqual(8);
    expect(report.tallGrass["clareira-corredor-grama"]).toBeGreaterThanOrEqual(8);
    expect(m9.encounterAreas?.length).toBe(7);
  });

  it("60/30/10: medido por célula, cada faixa a no máximo 15 pontos do alvo (critério do brief §7)", () => {
    const r = report.ratio;
    expect(Math.abs(r.open - 60)).toBeLessThanOrEqual(15);
    expect(Math.abs(r.mass - 30)).toBeLessThanOrEqual(15);
    expect(Math.abs(r.accent - 10)).toBeLessThanOrEqual(15);
    // a massa do perímetro subiu em relação ao v8
    expect(r.mass).toBeGreaterThan(report.ratioV8.mass);
  });

  it("o v9 passa os 8 gates do Map Factory (validate-map no arquivo do v9, sem gravar relatório)", () => {
    const ROOT = join(__dirname, "..");
    const out = execFileSync(process.execPath, [join(ROOT, "scripts/validate-map.mjs"), "src/data/maps/v9/digimon-forest-01.tmj.json", "--no-write"], { cwd: ROOT, encoding: "utf8" });
    expect(out).toMatch(/^PASS digimon-forest-01 .*reach:pass/m);
    expect(out.match(/:pass/g)?.length).toBe(8);
  });
});

describe("P7: água sem ladrilho visível", () => {
  const cfg = { phasePx: [7, 5] as [number, number], scale: [26, 34] as [number, number], shade: 14, seed: 17 };

  it("o ruído é contínuo na borda das células (sem costura em grade)", () => {
    const a = waterNoiseFor(10, 5, 32, cfg);
    const b = waterNoiseFor(11, 5, 32, cfg);
    let jumps = 0;
    for (let y = 0; y < 32; y++) jumps += Math.abs(a.ox[y * 32 + 31] - b.ox[y * 32]) > 1 ? 1 : 0;
    expect(jumps).toBe(0);
    expect(Math.abs(valueNoise(3.999, 2, 1) - valueNoise(4, 2, 1))).toBeLessThan(0.01);
  });

  it("células diferentes recebem fases diferentes (a textura não repete igual em todo tile)", () => {
    const offs = new Set<string>();
    for (let mx = 0; mx < 12; mx++) {
      const n = waterNoiseFor(mx, 3, 32, cfg);
      offs.add(`${n.ox[0]},${n.oy[0]}`);
    }
    expect(offs.size).toBeGreaterThan(3);
  });

  it("sem ruído e sem brilho, a composição é a mesma do v9 da fase 2", () => {
    const ts = 4;
    const tex = new Uint8ClampedArray(ts * ts * 4).map((_, i) => (i * 37) % 251);
    const mix = { a: new Uint8ClampedArray(ts * ts * 4).fill(10), b: new Float32Array(ts * ts).fill(0.5), fill: "x" };
    const zero = { ox: new Uint8Array(16), oy: new Uint8Array(16), n1: new Float32Array(16), n2: new Float32Array(16) };
    expect([...waterComposeNoisy(mix, tex, ts, 1, 2, zero, 0, 0.3)]).toEqual([...waterCompose(mix, scrollPixels(tex, ts, 1, 2))]);
  });

  it("a água animada não cobre a ponte (células com detalhe de chão ficam fora)", async () => {
    const ROOT = join(__dirname, "..");
    const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
    const urlToPath = (url: string) => {
      const u = decodeURIComponent(url.split("?")[0]);
      if (u.startsWith("/@fs/")) return u.slice(4);
      if (u.startsWith("/") && !u.startsWith("/home")) return join(ROOT, u);
      return u;
    };
    const def = withLook(MAPS[ID], "v9");
    const map = parseTiledMap(def.id, def.tmj);
    const { sim, events } = createMapWorld(map, false, 7, { auto: false });
    const pack = def.pack as ScenePack;
    const { tiles } = loadSceneTiles(pack, "day", usedKeys(sim.map));
    const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
    await images.loadAll(Object.values(tiles).map((t) => t.url));
    const view = new WorldView(makeCanvas(480, 270), sim.map, {}, tiles, images, makeCanvas, { creatureScale: 1, trees: pack.trees, look: pack.look as LookCfg, smoothAutotile: pack.smoothAutotile });
    const presenter = new Presenter(() => undefined, LOCAL_PLAYER);
    presenter.onTick(snapshot(sim), events, 0);
    view.follow({ x: 28 * TS, y: 9 * TS });
    view.render(presenter, 1, 0);
    const cells = (view as unknown as { waterCells: number[] }).waterCells;
    const bridge = sim.map.tileLayers.find((l) => l.name === "ground_detail")!.keys.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
    expect(bridge.length).toBeGreaterThan(0);
    for (const i of bridge) expect(cells.includes(i)).toBe(false);
    expect(cells.length).toBeGreaterThan(50);
  });
});
