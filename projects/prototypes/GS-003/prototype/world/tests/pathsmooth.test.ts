// Recorte suave do autotile Wang-47 (trilha e borda da mata do forest-v4.1): campo contínuo no mundo, sem dente nas
// emendas dos tiles. Compara com o PNG do pacote (que corta um círculo em cada canto de uma borda só).

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import packJson from "../src/data/maps/forest-proof.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { composePathTile, isDirtPixel, pathMask, valueNoise } from "../src/render/pathsmooth";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { PX_PER_SUB } from "../src/sim/params";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { snapshot } from "../src/sim/world";

const packCfg = packJson as ScenePack;
const pathCfg = packCfg.smoothAutotile!.find((c) => c.prefix === "fp4_path_w47_")!;
const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
const urlToPath = (url: string) => {
  const u = decodeURIComponent(url.split("?")[0]);
  if (u.startsWith("/@fs/")) return u.slice(4);
  if (u.startsWith("/") && !u.startsWith("/home")) return join(__dirname, "..", u);
  return u;
};
const TS = 32;

/** Trilha reta de 1 tile (linha 1 de uma grade 8×3): máscara de cada coluna de pixel, em px do mundo. */
function straightRow(): number[] {
  const isP = (_x: number, y: number) => y === 1;
  const cols = new Array(8 * TS).fill(0);
  for (let cx = 0; cx < 8; cx++) {
    const m = pathMask(cx, 1, TS, isP, pathCfg);
    for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) cols[cx * TS + x] += m[y * TS + x];
  }
  return cols;
}

describe("recorte suave do Wang-47 (trilha e borda da mata)", () => {
  it("trilha reta: largura quase constante e sem dente nas emendas (o PNG do pacote corta ~2/3 da largura na emenda)", async () => {
    const cols = straightRow();
    const mean = cols.reduce((a, b) => a + b, 0) / cols.length;
    expect(mean).toBeGreaterThan(TS * 0.6);
    for (const c of cols) expect(Math.abs(c - mean)).toBeLessThanOrEqual(TS * 0.25);
    // emenda (última coluna de um tile × primeira do próximo): mesma largura, ±3 px
    for (let k = 1; k < 8; k++) expect(Math.abs(cols[k * TS - 1] - cols[k * TS])).toBeLessThanOrEqual(3);
    // referência: o PNG path_w47_10 (E+W) do pacote, terra por coluna no meio × na borda
    const url = loadSceneTiles(packCfg, "day", ["fp4_path_w47_10"]).tiles.fp4_path_w47_10.url;
    const g = makeCanvas(TS, TS).getContext("2d")!;
    g.drawImage((await loadImage(urlToPath(url))) as unknown as CanvasImageSource, 0, 0);
    const d = g.getImageData(0, 0, TS, TS).data;
    const dirt = (x: number) => Array.from({ length: TS }, (_, y) => (isDirtPixel(d[(y * TS + x) * 4], d[(y * TS + x) * 4 + 1]) ? 1 : 0) as number).reduce((a, b) => a + b, 0);
    expect(dirt(0)).toBeLessThan(dirt(16) * 0.5);
  });

  it("campo contínuo: a máscara de dois tiles vizinhos casa na emenda numa curva diagonal (2 de largura)", () => {
    const P = new Set(["0,0", "1,0", "1,1", "2,1", "2,2", "3,2", "3,3"]);
    const isP = (x: number, y: number) => P.has(`${x},${y}`);
    const a = pathMask(1, 1, TS, isP, pathCfg);
    const b = pathMask(2, 1, TS, isP, pathCfg);
    let diff = 0;
    for (let y = 0; y < TS; y++) diff += Math.abs(a[y * TS + TS - 1] - b[y * TS]);
    expect(diff).toBeLessThanOrEqual(3);
    expect(valueNoise(3.5, 2.25)).toBeGreaterThanOrEqual(0);
    expect(valueNoise(3.5, 2.25)).toBeLessThanOrEqual(1);
  });

  it("textura: terra vem do PNG Wang-47 (ou do 255), fora vem do chão da clareira; borda pontilhada", () => {
    const own = new Uint8ClampedArray(TS * TS * 4).fill(0);
    const full = new Uint8ClampedArray(TS * TS * 4);
    const ground = new Uint8ClampedArray(TS * TS * 4);
    for (let i = 0; i < TS * TS; i++) {
      own.set(i % 2 ? [120, 80, 40, 255] : [30, 90, 40, 255], i * 4);
      full.set([100, 60, 30, 255], i * 4);
      ground.set([20, 70, 30, 255], i * 4);
    }
    const mask = new Uint8Array(TS * TS);
    for (let y = 8; y < 24; y++) for (let x = 0; x < TS; x++) mask[y * TS + x] = 1;
    const out = composePathTile(mask, TS, own, full, ground, 5);
    const at = (x: number, y: number) => [...out.slice((y * TS + x) * 4, (y * TS + x) * 4 + 3)];
    expect(at(1, 16)).toEqual([120, 80, 40]);
    expect(at(2, 16)).toEqual([100, 60, 30]);
    expect(at(5, 2)).toEqual([20, 70, 30]);
    const edgeGround = Array.from({ length: TS }, (_, x) => at(x, 8)).filter((p) => p[0] === 20).length;
    expect(edgeGround).toBeGreaterThan(2);
    expect(edgeGround).toBeLessThan(TS - 2);
  });

  it("renderer: tiles de trilha e borda da mata do chão saem do recorte suave (canvas), não do PNG", async () => {
    const { sim, events } = createForestProofWorld(7, { auto: false, botAuto: false });
    const { tiles } = loadSceneTiles(packCfg, "day", usedKeys(sim.map));
    const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
    await images.loadAll(Object.entries(tiles).filter(([k]) => k.startsWith(packCfg.prefix)).map(([, t]) => t.url));
    const presenter = new Presenter(() => undefined, LOCAL_PLAYER);
    presenter.onTick(snapshot(sim), events, 0);
    const me = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    const pathPngs = new Set(Object.entries(tiles).filter(([k]) => /^fp4_(path|denseedge)_w47_/.test(k)).map(([, t]) => images.get(t.url)));
    const pngDraws = (smooth: boolean) => {
      const view = new WorldView(makeCanvas(640, 360), sim.map, {}, tiles, images, makeCanvas, { creatureScale: 1, trees: packCfg.trees, smoothAutotile: smooth ? packCfg.smoothAutotile : undefined });
      view.update(presenter, 1, 0);
      view.follow({ x: me.x * PX_PER_SUB, y: me.y * PX_PER_SUB });
      const proto = CanvasRenderingContext2DProto();
      let png = 0;
      const draw = proto.drawImage;
      proto.drawImage = function (this: CanvasRenderingContext2D, img: CanvasImageSource, ...rest: number[]) {
        if (pathPngs.has(img as never) && rest.length === 8 && rest[6] === TS) png++;
        return (draw as (...a: unknown[]) => void).call(this, img, ...rest);
      } as typeof proto.drawImage;
      try {
        view.render(presenter, 1, 0);
      } finally {
        proto.drawImage = draw;
      }
      return png;
    };
    // controle: sem o recorte suave, o chão desenha os PNGs Wang-47 direto
    expect(pngDraws(false)).toBeGreaterThan(50);
    expect(pngDraws(true)).toBe(0);
  });
});

/** Protótipo do contexto 2D do @napi-rs/canvas (os chunks usam outros contextos além do da tela). */
function CanvasRenderingContext2DProto(): CanvasRenderingContext2D {
  return Object.getPrototypeOf(createCanvas(1, 1).getContext("2d")) as CanvasRenderingContext2D;
}
