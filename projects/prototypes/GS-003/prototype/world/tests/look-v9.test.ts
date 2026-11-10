// Look v9 do digimon-forest-01 (Quality Overhaul, fase 2) = v8 + primeiro plano (objects_above), água correndo,
// vento em copas e grama e luzes reduzidas. Dados derivados por scripts/map-factory/derive-look-v9.mjs.
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import v8Pack from "../src/data/maps/v8/digimon-forest-01.aliases.json";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { buildCurveIndex, composeCurveOverlay } from "../src/render/curves";
import { bandRows, bandShifts, fadeToward, fgCovers, scrollPixels, swayOffset, waterCompose, waterFrame, waterMixFrom } from "../src/render/life";
import { mapLights, type LookCfg } from "../src/render/look";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { parseTiledMap, type TiledMap } from "../src/sim/map";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { snapshot } from "../src/sim/world";
import { MAPS, withLook } from "../src/world/regions";

const ID = "digimon-forest-01";
const ROOT = join(__dirname, "..");
const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
const urlToPath = (url: string) => {
  const u = decodeURIComponent(url.split("?")[0]);
  if (u.startsWith("/@fs/")) return u.slice(4);
  if (u.startsWith("/") && !u.startsWith("/home")) return join(ROOT, u);
  return u;
};

async function setup(look: "v8" | "v9") {
  const def = withLook(MAPS[ID], look);
  const map = parseTiledMap(def.id, def.tmj);
  const { sim, events } = createMapWorld(map, false, 7, { auto: false });
  const pack = def.pack as ScenePack;
  const { tiles } = loadSceneTiles(pack, "day", usedKeys(sim.map));
  const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
  await images.loadAll(Object.values(tiles).map((t) => t.url));
  const canvas = makeCanvas(480, 270);
  const view = new WorldView(canvas, sim.map, {}, tiles, images, makeCanvas, { creatureScale: 1, trees: pack.trees, look: pack.look as LookCfg, smoothAutotile: pack.smoothAutotile });
  const presenter = new Presenter(() => undefined, LOCAL_PLAYER);
  presenter.onTick(snapshot(sim), events, 0);
  return { sim, view, presenter, canvas };
}

describe("look v9: dados derivados do v8", () => {
  it("o derivador é determinístico (rodar de novo não muda os arquivos)", () => {
    const before = readFileSync(join(ROOT, "src/data/maps/v9/digimon-forest-01.tmj.json"), "utf8");
    execFileSync(process.execPath, [join(ROOT, "scripts/map-factory/derive-look-v9.mjs")], { stdio: "pipe" });
    expect(readFileSync(join(ROOT, "src/data/maps/v9/digimon-forest-01.tmj.json"), "utf8")).toBe(before);
  });

  it("v9 = v8 + objects_above; fora da Clareira piloto (P7) o resto do mapa é o mesmo", () => {
    const m8 = parseTiledMap(ID, withLook(MAPS[ID], "v8").tmj);
    const m9 = parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
    // P7 recompõe só a caixa x12–41 × y6–29 (tests/p7-clareira.test.ts); fora dela os props são os mesmos
    const out = (p: { x: number; y: number }) => p.x < 12 * 32 || p.x >= 42 * 32 || p.y < 6 * 32 || p.y >= 30 * 32;
    expect(m9.props.filter(out)).toEqual(m8.props.filter(out));
    const outCell = (i: number) => out({ x: (i % m8.width) * 32 + 16, y: Math.floor(i / m8.width) * 32 + 16 });
    expect([...m9.solid].filter((_, i) => outCell(i))).toEqual([...m8.solid].filter((_, i) => outCell(i)));
    expect(m8.fgProps).toBeUndefined();
    expect(m9.fgProps!.length).toBeGreaterThanOrEqual(12);
    // primeiro plano nunca bloqueia e fica fora da lista do Y-sort
    expect(m9.fgProps!.every((p) => !p.solid)).toBe(true);
    for (const p of m9.fgProps!) expect(m9.props.includes(p)).toBe(false);
  });

  it("parser: prop da camada objects_above vira primeiro plano, sem colisão mesmo com solid=true", () => {
    const tmj = withLook(MAPS[ID], "v9").tmj as TiledMap;
    const t: TiledMap = JSON.parse(JSON.stringify(tmj));
    const above = t.layers.find((l) => l.name === "objects_above")!;
    if (above.type !== "objectgroup") throw new Error("camada");
    above.objects.push({ id: 99999, type: "prop", x: 40, y: 40, point: true, properties: [{ name: "key", value: "fp8_fern" }, { name: "solid", value: true }] });
    const m = parseTiledMap(ID, t);
    expect(m.fgProps!.at(-1)).toEqual({ key: "fp8_fern", x: 40, y: 40, solid: false });
    expect(m.solid[1 * m.width + 1]).toBe(parseTiledMap(ID, tmj).solid[1 * m.width + 1]);
  });

  it("luzes: de 66 emissores (10 tipos) para poucas fontes com propósito (lanternas, fogueira, cura, totens)", () => {
    const m8 = parseTiledMap(ID, withLook(MAPS[ID], "v8").tmj);
    const m9 = parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
    const l8 = mapLights(m8, v8Pack.look as unknown as LookCfg);
    const l9 = mapLights(m9, v9Pack.look as unknown as LookCfg);
    expect(l8.length).toBe(66);
    expect(l9.length).toBeLessThanOrEqual(15);
    expect(new Set(l9.map((l) => l.kind))).toEqual(new Set(["fp8_lantern_post", "fp8_campfire_small", "fp6_healing_point", "fp8_data_totem"]));
    expect(v9Pack.look.ambient.night.lightScale).toBeLessThan(v8Pack.look.ambient.night.lightScale);
    expect(v9Pack.look.playerLight.radius).toBeLessThan(v8Pack.look.playerLight.radius);
  });
});

describe("vida do mapa (life.ts)", () => {
  it("vento: deslocamento inteiro, limitado à amplitude, varia no tempo e pela posição", () => {
    const cfg = { amp: 1, periodMs: 2600 };
    const vals = new Set<number>();
    for (let t = 0; t < 8000; t += 50) {
      const s = swayOffset(100, 200, t, cfg);
      expect(Number.isInteger(s)).toBe(true);
      expect(Math.abs(s)).toBeLessThanOrEqual(1);
      vals.add(s);
    }
    expect(vals.size).toBeGreaterThanOrEqual(2);
    expect(bandShifts(1, 3)).toEqual([1, 1, 0]);
    expect(bandShifts(-2, 3)).toEqual([-2, -1, 0]);
    expect(bandRows(54, 3)).toEqual([[0, 18], [18, 36], [36, 54]]);
  });

  it("água: scroll de UV com volta no tile, ciclo fechado", () => {
    const cfg = { terrain: "water", stepPx: [2, 1] as [number, number], frameMs: 140, frames: 16 };
    expect(waterFrame(0, cfg, 32)).toEqual({ frame: 0, dx: 0, dy: 0 });
    expect(waterFrame(140 * 3, cfg, 32)).toEqual({ frame: 3, dx: 6, dy: 3 });
    expect(waterFrame(140 * 16, cfg, 32).frame).toBe(0);
    const src = new Uint8ClampedArray(4 * 4 * 4).map((_, i) => i);
    const out = scrollPixels(src, 4, 1, 0);
    expect([...out.slice(4, 8)]).toEqual([...src.slice(0, 4)]); // o pixel (0,0) foi para (1,0)
    expect([...out.slice(0, 4)]).toEqual([...src.slice(12, 16)]); // e (3,0) deu a volta
  });

  it("água linear na textura: A + B·textura reproduz a composição direta (±2 de 255, arredondamento) nas células do riacho", () => {
    const m = parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
    const keys = m.tileLayers[0].keys;
    const idx = buildCurveIndex(m.curves!, m.width, m.height, m.tileSize, (i) => keys[i] ?? "");
    const ts = m.tileSize;
    // textura sintética com variação por pixel e uma "trilha" fixa
    const tex = new Uint8ClampedArray(ts * ts * 4).map((_, i) => (i * 37) % 251);
    const path = new Uint8ClampedArray(ts * ts * 4).fill(90);
    const isWater = (ci: number) => idx.curves[ci].terrain === "water";
    const cells = [...idx.near].filter(([, c]) => c.some(isWater)).map(([i]) => i);
    expect(cells.length).toBeGreaterThan(50);
    let worst = 0;
    for (const i of cells.slice(0, 80)) {
      const mx = i % m.width;
      const my = Math.floor(i / m.width);
      const direct = composeCurveOverlay(idx, mx, my, ts, m.width, (ci) => (isWater(ci) ? tex : path));
      const p0 = composeCurveOverlay(idx, mx, my, ts, m.width, (ci) => (isWater(ci) ? new Uint8ClampedArray(ts * ts * 4) : path));
      const p1 = composeCurveOverlay(idx, mx, my, ts, m.width, (ci) => (isWater(ci) ? new Uint8ClampedArray(ts * ts * 4).fill(255) : path));
      if (!direct) continue;
      const out = waterCompose(waterMixFrom(p0!, p1!, "x"), tex);
      for (let j = 0; j < out.length; j++) worst = Math.max(worst, Math.abs(out[j] - direct[j]));
    }
    expect(worst).toBeLessThanOrEqual(2);
  });

  it("primeiro plano: cobre o jogador → alvo translúcido, transição suave", () => {
    const r = { x0: 100, y0: 100, x1: 148, y1: 126 };
    expect(fgCovers(r, [{ x0: 110, x1: 124, y0: 90, y1: 120 }])).toBe(true);
    expect(fgCovers(r, [{ x0: 110, x1: 124, y0: 40, y1: 70 }])).toBe(false);
    const a = fadeToward(1, 0.38, 16, 120);
    expect(a).toBeLessThan(1);
    expect(a).toBeGreaterThan(0.38);
    expect(fadeToward(0.385, 0.38, 16, 120)).toBe(0.38);
  });
});

describe("look v9 no renderer", () => {
  const waterCell = (sim: Awaited<ReturnType<typeof setup>>["sim"]) => {
    const c = sim.map.curves!.find((c) => c.terrain === "water")!;
    return c.points[Math.floor(c.points.length / 2)];
  };

  it("a água do riacho muda entre quadros no v9 e fica parada no v8", async () => {
    for (const look of ["v8", "v9"] as const) {
      const { sim, view, canvas } = await setup(look);
      const at = waterCell(sim);
      view.follow(at);
      const g = canvas.getContext("2d")!;
      const grab = (now: number) => {
        // a montagem dos tiles de água tem orçamento por quadro: alguns quadros no mesmo instante enchem o cache
        for (let k = 0; k < 20; k++) (view as unknown as { drawGround(n: number): void }).drawGround(now);
        return g.getImageData(Math.round(at.x - view.camera.x) - 8, Math.round(at.y - view.camera.y) - 4, 16, 8).data;
      };
      const a = grab(0);
      const b = grab(140 * 4);
      const diff = a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0);
      if (look === "v9") expect(diff, "v9 corre").toBeGreaterThan(0);
      else expect(diff, "v8 parado").toBe(0);
    }
  });

  it("primeiro plano: cobre pernas e cintura e fica opaco; só fica translúcido quando esconderia a cabeça (P7 headFrac)", async () => {
    const { sim, view, presenter } = await setup("v9");
    const fg = sim.map.fgProps!.find((p) => p.key === "fp8_fern")!;
    const alphaOf = () => (view as unknown as { fgAlpha: Map<number, number> }).fgAlpha.get(sim.map.fgProps!.indexOf(fg)) ?? 1;
    const me = presenter.entities.get(LOCAL_PLAYER)!;
    // Tamer (só posição visual) 8 px atrás do pé da samambaia (22 px): ela cobre pernas e cintura, não a cabeça → opaca
    me.prev = me.cur = { x: fg.x, y: fg.y - 8 };
    view.update(presenter, 1, 0);
    view.follow({ x: fg.x, y: fg.y });
    for (let t = 0; t <= 1000; t += 16) view.render(presenter, 1, t);
    expect(alphaOf()).toBe(1);
    // colado no pé dela: a moita chegaria ao rosto → translúcida
    me.prev = me.cur = { x: fg.x, y: fg.y + 1 };
    for (let t = 1000; t <= 2000; t += 16) {
      view.update(presenter, 1, t);
      view.render(presenter, 1, t);
    }
    expect(alphaOf()).toBeCloseTo(v9Pack.look.foreground.behindAlpha, 2);
    // longe dele, volta a opaco
    me.prev = me.cur = { x: fg.x, y: fg.y - 200 };
    for (let t = 2000; t <= 3000; t += 16) {
      view.update(presenter, 1, t);
      view.render(presenter, 1, t);
    }
    expect((view as unknown as { fgAlpha: Map<number, number> }).fgAlpha.has(sim.map.fgProps!.indexOf(fg))).toBe(false);
  });

  it("render completo do v9 de dia e de noite sem erro (copas e grama com vento)", async () => {
    const { sim, view, presenter } = await setup("v9");
    view.follow(waterCell(sim));
    for (const night of [0, 1]) {
      view.nightMix = night;
      for (let t = 0; t < 3000; t += 500) expect(() => view.render(presenter, 1, t)).not.toThrow();
    }
  });
});
