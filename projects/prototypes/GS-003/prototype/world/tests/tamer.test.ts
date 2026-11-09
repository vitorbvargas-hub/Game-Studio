// Tamer modular: o recolor por paleta reproduz pixel a pixel as variantes prontas do pacote, e a composição em
// camadas (corpo → cabelo → roupa) bate com a sobreposição dos PNGs prontos.

import { createCanvas, loadImage, type Image } from "@napi-rs/canvas";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BASE,
  botLook,
  composeTamer,
  lookKey,
  DEFAULT_LOOK,
  frameList,
  lookOptions,
  loadPartUrls,
  normalizeLook,
  PARTS,
  randomLook,
  recolorPixels,
  swapTable,
  type TamerLook,
} from "../src/assets/tamer-parts";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";

const DIR = join(__dirname, "../../../../../../assets/GAME-ASSETS/11-characters/player");
const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
const urlToPath = (url: string) => {
  const u = decodeURIComponent(url.split("?")[0]);
  return u.startsWith("/@fs/") ? u.slice(4) : u;
};
const imgCache = new Map<string, Image>();
async function load(path: string): Promise<Image> {
  let i = imgCache.get(path);
  if (!i) imgCache.set(path, (i = await loadImage(path)));
  return i;
}
async function pixels(path: string): Promise<Uint8ClampedArray> {
  const i = await load(path);
  const c = createCanvas(i.width, i.height);
  const g = c.getContext("2d");
  g.drawImage(i, 0, 0);
  return g.getImageData(0, 0, i.width, i.height).data;
}
const FRAMES = ["idle_S_01", "walk_E_03", "walk_N_02", "point_01"];
const L = PARTS.layers;

describe("Tamer modular (character_parts.json v2)", () => {
  it("opções do criador: 2 modelos, 3 tons de pele, 7 cortes, 8 cores de cabelo, 3 roupas × 7 cores", () => {
    const o = lookOptions();
    expect([o.model.length, o.skin.length, o.hairCut.length, o.hairColor.length, o.outfit.length, o.outfitColor.length]).toEqual([2, 3, 7, 8, 3, 7]);
  });

  it("recolor do cabelo (base castanho) = PNG pronto, em todos os cortes e cores", async () => {
    let n = 0;
    for (const cut of L.hair.cuts)
      for (const color of Object.keys(L.hair.colors))
        for (const f of FRAMES) {
          const d = await pixels(`${DIR}/hair/hair_${cut}_${BASE.hair}_${f}.png`);
          recolorPixels(d, swapTable(L.hair.colors[BASE.hair], L.hair.colors[color]));
          expect(Buffer.from(d).equals(Buffer.from(await pixels(`${DIR}/hair/hair_${cut}_${color}_${f}.png`))), `${cut}/${color}/${f}`).toBe(true);
          n++;
        }
    expect(n).toBe(7 * 8 * FRAMES.length);
  });

  it("recolor da pele (base pale) e da roupa (base sem colisão) = PNGs prontos", async () => {
    for (const model of L.body.models)
      for (const skin of Object.keys(L.body.skinTones))
        for (const f of FRAMES) {
          const d = await pixels(`${DIR}/body/body_${model}_${BASE.skin}_${f}.png`);
          recolorPixels(d, swapTable(L.body.skinTones[BASE.skin], L.body.skinTones[skin]));
          expect(Buffer.from(d).equals(Buffer.from(await pixels(`${DIR}/body/body_${model}_${skin}_${f}.png`))), `${model}/${skin}/${f}`).toBe(true);
        }
    for (const outfit of L.clothing.outfits)
      for (const color of L.clothing.colorOptions[outfit])
        for (const model of L.body.models)
          for (const f of FRAMES) {
            const base = BASE.outfit[outfit];
            const d = await pixels(`${DIR}/clothing/clothing_${outfit}_${base}_${model}_${f}.png`);
            recolorPixels(d, swapTable(L.clothing.colorRamps[base], L.clothing.colorRamps[color]));
            expect(Buffer.from(d).equals(Buffer.from(await pixels(`${DIR}/clothing/clothing_${outfit}_${color}_${model}_${f}.png`))), `${outfit}/${color}/${model}/${f}`).toBe(true);
          }
  });

  async function composed(look: TamerLook) {
    const urls = loadPartUrls();
    const images = new ImageStore(async (u) => (await load(urlToPath(u))) as unknown as ImageLike);
    expect(await images.loadAll(Object.values(urls))).toEqual([]);
    const cv = composeTamer(look, urls, images, makeCanvas);
    const sheet = images.get(cv.sheetUrl) as unknown as ReturnType<typeof createCanvas>;
    return { cv, sheet, urls };
  }

  it("só as cores-base são carregadas (330 PNGs, não os 1672 do pacote)", () => {
    expect(Object.keys(loadPartUrls()).length).toBe(2 * 22 + 7 * 22 + 3 * 2 * 22);
  });

  it("composição em camadas = corpo + cabelo + roupa prontos sobrepostos, em todos os quadros", async () => {
    const look: TamerLook = { name: "Teste", model: "female", skin: "deep", hairCut: "rabo-de-cavalo", hairColor: "rosa", outfit: "casual", outfitColor: "azul" };
    const { cv, sheet } = await composed(look);
    const { w, h } = PARTS.frame;
    let frames = 0;
    for (const { anim, dir, n } of frameList())
      for (let i = 0; i < n; i++) {
        const f = anim === "point" ? "point_01" : `${anim}_${dir}_${String(i + 1).padStart(2, "0")}`;
        const ref = createCanvas(w, h);
        const g = ref.getContext("2d");
        g.drawImage(await load(`${DIR}/body/body_female_deep_${f}.png`), 0, 0);
        g.drawImage(await load(`${DIR}/hair/hair_rabo-de-cavalo_rosa_${f}.png`), 0, 0);
        g.drawImage(await load(`${DIR}/clothing/clothing_casual_azul_female_${f}.png`), 0, 0);
        const fr = cv.atlas.frames[`${anim}_${dir}_${i}`].frame;
        const got = sheet.getContext("2d").getImageData(fr.x, fr.y, w, h).data;
        expect(Buffer.from(got).equals(Buffer.from(g.getImageData(0, 0, w, h).data)), `${anim}/${dir}/${i}`).toBe(true);
        frames++;
      }
    expect(frames).toBe(22);
    // contrato do renderer: idle/walk em S/E/N, W = E espelhado, pivô nos pés
    expect(cv.manifest.directions!.walk).toEqual({ drawn: ["S", "E", "N"], mirrored: { W: "E" } });
    expect(cv.manifest.animations.walk.dirFrames!.E).toHaveLength(4);
    expect(cv.manifest.animations.idle.dirFrames!.N).toHaveLength(3);
    expect(cv.manifest.pivot).toEqual({ x: 16, y: 35 });
    expect(cv.manifest.name).toBe("Teste");
  });

  it("bots: cada jogador bot ganha um visual próprio e estável (semente do mundo + id)", () => {
    const looks = ["bot1", "bot2", "bot3"].map((id) => botLook(7, id, id));
    expect(new Set(looks.map(lookKey)).size).toBe(3);
    expect(botLook(7, "bot2", "x")).toEqual(botLook(7, "bot2", "x"));
    expect(lookKey(botLook(8, "bot2", "x"))).not.toBe(lookKey(botLook(7, "bot2", "x")));
  });

  it("bots: combinação aleatória determinística e sempre válida; normalizeLook corrige entradas ruins", () => {
    expect(randomLook(7, "Lumi")).toEqual(randomLook(7, "Lumi"));
    const looks = Array.from({ length: 40 }, (_, i) => randomLook(i * 977, "b"));
    for (const l of looks) expect(normalizeLook(l)).toEqual(l);
    expect(new Set(looks.map((l) => l.hairCut)).size).toBeGreaterThan(4);
    expect(new Set(looks.map((l) => l.outfitColor)).size).toBeGreaterThan(4);
    expect(normalizeLook({ name: "   ", model: "x" as never, outfit: "terno" })).toEqual({ ...DEFAULT_LOOK });
    expect(normalizeLook({ name: "  Ana   Lu  " }).name).toBe("Ana Lu");
    expect(normalizeLook({ name: "x".repeat(40) }).name).toHaveLength(14);
  });
});
