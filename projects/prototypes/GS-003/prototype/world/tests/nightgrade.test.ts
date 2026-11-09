// Noite nas entidades: grade para a rampa da noite do forest-v4 + rim-light frio + contorno leve. Pixels puros e o
// renderer real (@napi-rs/canvas) com um Digimon de verdade contra o chão noturno do pacote.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { imageUrlOf, imageUrlsOf, loadCreatureCatalog } from "../src/assets/creatures";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import packJson from "../src/data/maps/forest-proof.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { gradeNightPixels, NIGHT_GRADE, nightFrame, nightStep } from "../src/render/nightgrade";
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
const lum = (d: ArrayLike<number>, i: number) => 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];

/** Sprite 4×4 opaco no meio de um quadro 6×6, cor (200, 120, 60). */
function block(): Uint8ClampedArray {
  const d = new Uint8ClampedArray(6 * 6 * 4);
  for (let y = 1; y < 5; y++)
    for (let x = 1; x < 5; x++) {
      const i = (y * 6 + x) * 4;
      d.set([200, 120, 60, 255], i);
    }
  return d;
}

describe("noite nas entidades (grade + rim + contorno)", () => {
  it("mistura 0 não muda os pixels do sprite (só ganha a margem de 1 px, vazia)", () => {
    const out = gradeNightPixels(block(), 6, 6, 0);
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 6; x++) {
        const o = ((y + 1) * 8 + x + 1) * 4;
        expect([...out.slice(o, o + 4)]).toEqual([...block().slice((y * 6 + x) * 4, (y * 6 + x) * 4 + 4)]);
      }
    expect(out.filter((_, i) => i % 4 === 3 && i >= 0).reduce((s, a) => s + (a ? 1 : 0), 0)).toBe(16);
  });

  it("noite cheia: miolo mais escuro e mais azul; borda de cima/esquerda com rim frio; contorno de 1 px por fora", () => {
    const out = gradeNightPixels(block(), 6, 6, 1);
    const px = (x: number, y: number) => ((y + 1) * 8 + x + 1) * 4;
    const core = px(3, 3);
    expect(lum(out, core)).toBeLessThan(lum([200, 120, 60], 0));
    expect(out[core + 2] / out[core]).toBeGreaterThan(60 / 200);
    // rim: canto de cima/esquerda puxado para #a6c0e8 (mais claro e mais azul que o miolo)
    const rim = px(1, 1);
    expect(lum(out, rim)).toBeGreaterThan(lum(out, core));
    expect(out[rim + 2]).toBeGreaterThan(out[core + 2]);
    // borda de baixo/direita não recebe rim (luz vem de cima/esquerda)
    expect([...out.slice(px(4, 4), px(4, 4) + 3)]).toEqual([...out.slice(core, core + 3)]);
    // contorno: transparente do lado de fora vira tinta da noite com alpha leve; cantos diagonais ficam vazios
    expect([...out.slice(px(0, 2), px(0, 2) + 4)]).toEqual([...NIGHT_GRADE.outline, Math.round(255 * NIGHT_GRADE.outlineAlpha)]);
    expect(out[px(0, 0) + 3]).toBe(0);
    expect(out[px(-1, -1) + 3]).toBe(0);
  });

  it("espelhado: o rim vai para a direita da imagem (no mundo continua à esquerda)", () => {
    const out = gradeNightPixels(block(), 6, 6, 1, true);
    const px = (x: number, y: number) => ((y + 1) * 8 + x + 1) * 4;
    expect(lum(out, px(4, 3))).toBeGreaterThan(lum(out, px(1, 3)));
  });

  it("degraus da mistura (cache): 0 = dia, 8 = noite", () => {
    expect(nightStep(0)).toBe(0);
    expect(nightStep(0.03)).toBe(0);
    expect(nightStep(0.5)).toBe(4);
    expect(nightStep(1)).toBe(8);
  });

  it("Digimon real à noite: coerente com o chão noturno (mais escuro que de dia) e ainda legível (mais claro que o chão)", async () => {
    const cat = loadCreatureCatalog();
    const cv = cat["CREATURE-0003"];
    const key = cv.manifest.animations.idle.frames[0].atlasKey ?? Object.keys(cv.atlas.frames)[0];
    const img = await loadImage(urlToPath(imageUrlOf(cv, key)));
    const fr = cv.atlas.frames[key].frame;
    const night = nightFrame(img as unknown as CanvasImageSource, fr, 1, false, makeCanvas).getContext("2d")!.getImageData(0, 0, fr.w + 2, fr.h + 2).data;
    const day = makeCanvas(fr.w, fr.h).getContext("2d")!;
    day.drawImage(img as unknown as CanvasImageSource, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
    const dd = day.getImageData(0, 0, fr.w, fr.h).data;
    const mean = (d: Uint8ClampedArray, minA = 200) => {
      let s = 0;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= minA) (s += lum(d, i)), n++;
      return s / n;
    };
    const ground = await loadImage(urlToPath(loadSceneTiles(packCfg, "night", ["fp4_clearing_floor_v41_00"]).tiles.fp4_clearing_floor_v41_00.url));
    const gc = makeCanvas(32, 32).getContext("2d")!;
    gc.drawImage(ground as unknown as CanvasImageSource, 0, 0);
    const g = mean(gc.getImageData(0, 0, 32, 32).data);
    // miolo (pixels sem vizinho transparente): é onde a grade aparece, sem o rim
    const inner = (d: Uint8ClampedArray, w: number, pad: number) => {
      let s = 0;
      let k = 0;
      const A = (x: number, y: number) => (x < 0 || y < 0 || x >= fr.w || y >= fr.h ? 0 : dd[(y * fr.w + x) * 4 + 3]);
      for (let y = 0; y < fr.h; y++)
        for (let x = 0; x < fr.w; x++)
          if (A(x, y) && A(x - 1, y) && A(x + 1, y) && A(x, y - 1) && A(x, y + 1)) (s += lum(d, ((y + pad) * w + x + pad) * 4)), k++;
      return s / k;
    };
    expect(inner(night, fr.w + 2, 1)).toBeLessThan(inner(dd, fr.w, 0) * 0.85);
    expect(mean(night)).toBeGreaterThan(g * 1.4);
  });

  it("renderer: com nightMix = 1 os Digimon e Tamers saem do quadro graduado (1 px maior em cada lado); de dia, o original", async () => {
    const { sim, events } = createForestProofWorld(7, { auto: false, botAuto: false });
    const used = usedKeys(sim.map);
    const { tiles } = loadSceneTiles(packCfg, "day", used);
    const night = loadSceneTiles(packCfg, "night", used).tiles;
    const cat = loadCreatureCatalog();
    const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
    await images.loadAll(Object.values(cat).flatMap(imageUrlsOf));
    const canvas = makeCanvas(480, 270);
    const view = new WorldView(canvas, sim.map, cat, tiles, images, makeCanvas, { creatureScale: 1, trees: packCfg.trees });
    view.setNightTiles(night);
    const presenter = new Presenter(() => undefined, LOCAL_PLAYER);
    presenter.onTick(snapshot(sim), events, 0);
    const me = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
    view.update(presenter, 1, 0);
    view.follow({ x: me.x * PX_PER_SUB, y: me.y * PX_PER_SUB });
    const sizes = (mix: number) => {
      view.nightMix = mix;
      const seen: string[] = [];
      const ctx = view.ctx;
      const orig = ctx.drawImage;
      ctx.drawImage = ((img: CanvasImageSource, ...rest: number[]) => {
        if (rest.length === 8) seen.push(`${rest[2]}x${rest[3]}`);
        return (orig as (...a: unknown[]) => void).call(ctx, img, ...rest);
      }) as typeof ctx.drawImage;
      view.render(presenter, 1, 0);
      ctx.drawImage = orig;
      return seen;
    };
    const partner = presenter.entities.get(presenter.localPartnerId)!;
    const cv = cat[partner.speciesId!];
    const fr = Object.values(cv.atlas.frames)[0].frame;
    const daySizes = sizes(0);
    const nightSizes = sizes(1);
    expect(daySizes).toContain(`${fr.w}x${fr.h}`);
    expect(nightSizes).toContain(`${fr.w + 2}x${fr.h + 2}`);
    // Tamer placeholder (sem sprite carregado neste teste) também passa pela grade
    expect(nightSizes.length).toBe(daySizes.length);
  });
});
