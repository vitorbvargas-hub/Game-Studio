// forest-v4 no renderer: tronco em Y-sort, copa numa camada acima das entidades (translúcida com o jogador atrás) e
// sombra como decal no chão. Renderer real com @napi-rs/canvas e os PNGs do pacote.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import packJson from "../src/data/maps/forest-proof.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { PX_PER_SUB } from "../src/sim/params";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { snapshot } from "../src/sim/world";

const packCfg = packJson as ScenePack;
const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
const urlToPath = (url: string) => {
  const u = decodeURIComponent(url.split("?")[0]);
  if (u.startsWith("/@fs/")) return u.slice(4);
  if (u.startsWith("/") && !u.startsWith("/home")) return join(__dirname, "..", u);
  return u;
};

async function setup() {
  const { sim, events } = createForestProofWorld(7, { auto: false, botAuto: false });
  const { tiles } = loadSceneTiles(packCfg, "day", usedKeys(sim.map));
  const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
  const wanted = Object.entries(tiles).filter(([k]) => k.startsWith(packCfg.prefix)).map(([, t]) => t.url);
  expect(await images.loadAll(wanted)).toEqual([]);
  const canvas = makeCanvas(400, 240);
  const view = new WorldView(canvas, sim.map, {}, tiles, images, makeCanvas, { creatureScale: 1, trees: packCfg.trees });
  const presenter = new Presenter(() => undefined, LOCAL_PLAYER);
  presenter.onTick(snapshot(sim), events, 0);
  return { sim, view, presenter, images };
}

describe("forest-v4 no jogo: árvore em 2 sprites, sombra decal, copa translúcida", () => {
  it("geometria: tronco com o pé no prop, copa ancorada em 42% da própria altura, sombra deslocada para a direita", async () => {
    const { view, sim } = await setup();
    const trees = view.treeGeoms();
    expect(trees.length).toBe(sim.map.props.filter((p) => p.key.startsWith("fp4_tree_")).length);
    for (const t of trees.slice(0, 50)) {
      const pr = sim.map.props[t.index];
      expect(t.base.y + t.base.h).toBe(pr.y);
      expect(Math.abs(t.base.x + t.base.w / 2 - pr.x)).toBeLessThanOrEqual(1);
      expect(t.top.y + t.top.h).toBe(pr.y - t.base.h + Math.round(t.top.h * 0.42));
      expect(t.shadow).toBeDefined();
      expect(t.shadow!.w).toBe(t.top.w > 80 ? 64 : 36);
      expect(t.shadow!.x + t.shadow!.w / 2).toBeGreaterThan(pr.x);
    }
  });

  it("copa sobre o Tamer local fica translúcida (behindAlpha) com transição; as outras seguem opacas", async () => {
    const { sim, view, presenter } = await setup();
    const trees = view.treeGeoms();
    // árvore cuja copa cobre um ponto andável: põe o Tamer ali (só posição lógica, para o teste)
    const me = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    const t = trees.find((g) => {
      const x = g.top.x + g.top.w / 2;
      const y = g.top.y + g.top.h * 0.7;
      return x > 300 && y > 200 && !sim.map.solid[Math.floor(y / 32) * sim.map.width + Math.floor(x / 32)];
    })!;
    expect(t).toBeDefined();
    me.x = Math.round((t.top.x + t.top.w / 2) / PX_PER_SUB);
    me.y = Math.round((t.top.y + t.top.h * 0.7) / PX_PER_SUB);
    presenter.onTick(snapshot(sim), [], 100);
    presenter.onTick(snapshot(sim), [], 200);
    view.update(presenter, 1, 200);
    view.follow({ x: me.x * PX_PER_SUB, y: me.y * PX_PER_SUB });
    view.render(presenter, 1, 200);
    const first = view.canopyAlphaOf(t.index);
    expect(first).toBeLessThan(1);
    view.render(presenter, 1, 216);
    expect(view.canopyAlphaOf(t.index)).toBeLessThan(first);
    for (let now = 232; now < 900; now += 16) view.render(presenter, 1, now);
    expect(view.canopyAlphaOf(t.index)).toBeCloseTo(packCfg.trees.behindAlpha, 2);
    const far = trees.find((g) => Math.abs(g.top.x - t.top.x) > 200)!;
    expect(view.canopyAlphaOf(far.index)).toBe(1);
  });

  it("ordem do quadro: chão → troncos e entidades por Y → copas por cima de tudo", async () => {
    const { sim, view, presenter, images } = await setup();
    const me = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    view.follow({ x: me.x * PX_PER_SUB, y: me.y * PX_PER_SUB });
    view.update(presenter, 1, 0);
    const trees = view.treeGeoms();
    const kindOf = new Map<unknown, string>();
    for (const t of trees) {
      kindOf.set(images.get(t.base.url), "base");
      kindOf.set(images.get(t.top.url), "top");
    }
    const calls: string[] = [];
    const ctx = view.ctx;
    const orig = ctx.drawImage.bind(ctx);
    ctx.drawImage = ((img: CanvasImageSource, ...rest: number[]) => {
      calls.push(kindOf.get(img) ?? "other");
      return (orig as (...a: unknown[]) => void)(img, ...rest);
    }) as typeof ctx.drawImage;
    view.render(presenter, 1, 0);
    const lastBase = calls.lastIndexOf("base");
    const firstTop = calls.indexOf("top");
    expect(lastBase).toBeGreaterThan(0);
    expect(firstTop).toBeGreaterThan(lastBase);
    // o Tamer (placeholder em canvas, "other") é desenhado entre o chão e as copas
    expect(calls.slice(1, firstTop).includes("other")).toBe(true);
  });

  it("noite: com nightMix = 1 os troncos e copas vêm de night/props; no meio da transição, os dois presets", async () => {
    const { sim, view, presenter, images } = await setup();
    const night = loadSceneTiles(packCfg, "night", usedKeys(sim.map)).tiles;
    expect(await images.loadAll(Object.entries(night).filter(([k]) => k.startsWith(packCfg.prefix)).map(([, t]) => t.url))).toEqual([]);
    view.setNightTiles(night);
    const me = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    view.follow({ x: me.x * PX_PER_SUB, y: me.y * PX_PER_SUB });
    view.update(presenter, 1, 0);
    const nightImgs = new Set(Object.values(night).filter((t) => /forest-v4\/night\/props\/tree_/.test(t.url)).map((t) => images.get(t.url)));
    const dayImgs = new Set(view.treeGeoms().flatMap((t) => [images.get(t.base.url), images.get(t.top.url)]));
    const count = (mix: number) => {
      view.nightMix = mix;
      let n = 0;
      let d = 0;
      const ctx = view.ctx;
      const orig = ctx.drawImage;
      ctx.drawImage = ((img: CanvasImageSource, ...rest: number[]) => {
        if (nightImgs.has(img as never)) n++;
        if (dayImgs.has(img as never)) d++;
        return (orig as (...a: unknown[]) => void).call(ctx, img, ...rest);
      }) as typeof ctx.drawImage;
      view.render(presenter, 1, 0);
      ctx.drawImage = orig;
      return { n, d };
    };
    expect(count(0)).toMatchObject({ n: 0 });
    const full = count(1);
    expect(full.n).toBeGreaterThan(10);
    expect(full.d).toBe(0);
    const half = count(0.5);
    expect(half.n).toBe(full.n);
    expect(half.d).toBe(full.n);
  });
});
