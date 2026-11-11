// forest-v12 (Quality Overhaul, fase 3) no look v9 do digimon-forest-01: lip da borda norte do mirante, terra Wang-47
// e topo do mirante noturnos pintados (no lugar do ajuste de cor) e variantes de copa na borda da mata. Dados derivados
// por scripts/map-factory/derive-look-v9.mjs (+ v12-plateau-night.mjs).
import { existsSync, readFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extraPackTiles, nightBaseName, type ScenePack } from "../src/assets/scene-tiles";
import { loadMapFactoryPack, PACK_PROOF_RE } from "../src/assets/tiles";
import report from "../src/data/maps/v9/digimon-forest-01.p7-report.json";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { gradePixels, gradeRuleFor, gradeTiles, isEarthPixel, type LookCfg } from "../src/render/look";
import { parseTiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";
// @ts-expect-error módulo .mjs do gerador, sem tipos
import { variantsOf } from "../scripts/map-factory/v12-plateau-night.mjs";

const ID = "digimon-forest-01";
const ART = join(__dirname, "../../../art/map-factory/forest-v12-plateau-night");
const pack = v9Pack as unknown as ScenePack;
const m9 = () => parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
const tmj9 = () => withLook(MAPS[ID], "v9").tmj as unknown as { tilesets: { firstgid: number; tiles: { id: number; properties: { name: string; value: unknown }[] }[] }[]; layers: { name: string; data?: number[] }[] };
const TREE_RE = /^fp1[02]_(tall_narrow|wide_low|leaning|ancient_thick)_(large|small)(_flip|_tone_dark|_tone_light)?$/;

describe("forest-v12 no look v9", () => {
  it("lip: a fileira do mirante com o norte fora do platô é mirante_top_edge_* (cantos nas pontas, retas variando)", () => {
    const m = m9();
    const W = m.width;
    const g = m.tileLayers.find((l) => l.name === "ground")!.keys;
    const plateau = new Set(g.flatMap((k, i) => (/^(fp11_mirante_top_blob_\d+|fp12_mirante_top_edge_\w+)$/.test(k) ? [i] : [])));
    const has = (x: number, y: number) => x >= 0 && y >= 0 && x < W && plateau.has(y * W + x);
    const north = [...plateau].filter((i) => !has(i % W, Math.floor(i / W) - 1)).sort((a, b) => a - b);
    expect(north.length).toBe(8);
    const pieces = north.map((i) => g[i].replace(/^fp12_mirante_top_edge_/, ""));
    // só a fileira norte mudou; o resto do topo segue o blob-16 do v11
    for (const i of plateau) expect(g[i].startsWith("fp12_"), `(${i % W},${Math.floor(i / W)})`).toBe(north.includes(i));
    expect(pieces[0]).toBe("corner_outer_left");
    expect(pieces.at(-1)).toBe("corner_outer_right");
    const mid = pieces.slice(1, -1);
    for (const p of mid) expect(p).toMatch(/^straight_[0-2]$/);
    for (let i = 1; i < mid.length; i++) expect(mid[i], `reta ${i}`).not.toBe(mid[i - 1]);
    expect(new Set(mid).size).toBe(3);
    expect(report.v12.lip.cells.map((c) => c[2])).toEqual(pieces);
    // cada peça do lip guarda o membro do blob-16 que substituiu (o gate wang confere a máscara por ele)
    const t = tmj9();
    const ts = t.tilesets[0];
    const data = t.layers.find((l) => l.name === "ground")!.data!;
    for (const i of north) {
      const tile = ts.tiles.find((x) => ts.firstgid + x.id === data[i])!;
      const x = i % W;
      const y = Math.floor(i / W);
      const mk = (has(x + 1, y) ? 2 : 0) | (has(x, y + 1) ? 4 : 0) | (has(x - 1, y) ? 8 : 0);
      expect(tile.properties.find((q) => q.name === "autotile")?.value).toBe(`fp11_mirante_top_blob_${mk}`);
      expect(tile.properties.find((q) => q.name === "solid")?.value).toBe(false);
    }
    // arquivos dia e noite, e a grade do chão (a mesma do topo do mirante)
    for (const p of new Set(pieces)) {
      expect(existsSync(join(ART, `lip/mirante_top_edge_${p}.png`)), p).toBe(true);
      expect(existsSync(join(ART, `lip/night/mirante_top_edge_night_${p}.png`)), p).toBe(true);
    }
    const look = pack.look as LookCfg;
    expect(gradeRuleFor("fp12_mirante_top_edge_straight_0", look)).toMatchObject({ saturationMul: 0.78, valueMul: 0.6 });
  });

  it("noite pintada: terra Wang-47, topo do mirante e lip ganham a arte noturna (mesmo índice) em mistura; sem ajuste de cor da terra", () => {
    const day = extraPackTiles(pack);
    const night = extraPackTiles(pack, undefined, "night");
    const v12 = pack.extraPacks!.find((e) => e.pack === "forest-v12-plateau-night")!;
    expect(v12.nightFor).toEqual(["fp11_", "fp12_"]);
    // mistura: a imagem segue a do dia e a arte pintada entra em `nightEarth` (os pixels de terra, no gradeTiles)
    for (let i = 0; i < 47; i++) {
      const k = `fp11_grass_dirt_wang47_${i}`;
      expect(day[k].url, k).toContain("forest-v11-ground/tiles/");
      expect(night[k].url, k).toBe(day[k].url);
      expect(night[k].nightEarth, k).toMatch(new RegExp(`forest-v12-plateau-night/tiles/night/grass_dirt_wang47_night_${i}\\.png`));
      expect(day[k].nightEarth, k).toBeUndefined();
    }
    for (let i = 0; i < 16; i++) {
      const k = `fp11_mirante_top_blob_${i}`;
      expect(night[k].url, k).toContain("forest-v11-ground/mirante/");
      expect(night[k].nightEarth, k).toMatch(new RegExp(`forest-v12-plateau-night/mirante/night/mirante_top_blob_night_${i}\\.png`));
    }
    for (const p of ["straight_0", "straight_1", "straight_2", "corner_outer_left", "corner_outer_right"]) {
      expect(day[`fp12_mirante_top_edge_${p}`].url).toMatch(/forest-v12-plateau-night\/lip\/mirante_top_edge_/);
      expect(night[`fp12_mirante_top_edge_${p}`].nightEarth).toMatch(/forest-v12-plateau-night\/lip\/night\/mirante_top_edge_night_/);
    }
    // sem o nightBlend (?v12night=swap) a noite troca a peça inteira
    const swap = extraPackTiles({ ...pack, extraPacks: pack.extraPacks!.map(({ nightBlend: _nb, ...e }) => e) }, undefined, "night");
    expect(swap.fp11_grass_dirt_wang47_46.url).toMatch(/tiles\/night\/grass_dirt_wang47_night_46\.png/);
    expect(swap.fp11_mirante_top_blob_15.url).toMatch(/mirante\/night\/mirante_top_blob_night_15\.png/);
    // a noite só troca chave que existe de dia (nada novo só à noite), e o token _night sai do nome
    expect(Object.keys(night).sort()).toEqual(Object.keys(day).sort());
    expect(nightBaseName("grass_dirt_wang47_night_5")).toBe("grass_dirt_wang47_5");
    expect(nightBaseName("wide_low_large_top_tone_dark")).toBe("wide_low_large_top_tone_dark");
    // o earth.night (valores medidos no v11 para imitar a trilha noturna sem arte) saiu; o earth do dia fica
    const rule = gradeRuleFor("fp11_grass_dirt_wang47_46", pack.look as LookCfg)!;
    expect(rule.earth).toBeDefined();
    expect(rule.earth!.night).toBeUndefined();
    // pranchas de prova do pacote fora do carregamento (inclui canopy-edge-variety/edge_row_proof_16x2.png)
    expect(PACK_PROOF_RE.test("/x/forest-v12-plateau-night/canopy-edge-variety/edge_row_proof_16x2.png")).toBe(true);
    const all = [...Object.keys(loadMapFactoryPack("forest-v12-plateau-night")), ...Object.keys(loadMapFactoryPack("forest-v12-plateau-night", "night"))];
    expect(all.some((k) => /proof|preview|before_after|tileability/.test(k))).toBe(false);
  });

  it("mistura no gradeTiles: terra da arte pintada, grama do dia com a grade da noite; sem nightEarth de dia", async () => {
    const look = pack.look as LookCfg;
    const make: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;
    const dayUrl = join(__dirname, "../../../art/map-factory/forest-v11-ground/tiles/grass_dirt_wang47_20.png");
    const nightUrl = join(ART, "tiles/night/grass_dirt_wang47_night_20.png");
    const images = new ImageStore(async (u) => (await loadImage(readFileSync(u))) as unknown as ImageLike);
    await images.loadAll([dayUrl, nightUrl]);
    const key = "fp11_grass_dirt_wang47_20";
    const pixels = (img: ImageLike) => {
      const c = createCanvas(32, 32);
      const g = c.getContext("2d");
      g.drawImage(img as never, 0, 0);
      return g.getImageData(0, 0, 32, 32).data;
    };
    const graded = (img: ImageLike) => {
      const d = pixels(img);
      gradePixels(d as unknown as Uint8ClampedArray, look, gradeRuleFor(key, look), true);
      return d;
    };
    const out = gradeTiles({ [key]: { url: dayUrl, nightEarth: nightUrl } }, look, images, make, true);
    expect(out[key].nightEarth).toBeUndefined();
    const got = pixels(images.get(out[key].url)!);
    const raw = pixels(images.get(dayUrl)!);
    const dayG = graded(images.get(dayUrl)!);
    const nightG = graded(images.get(nightUrl)!);
    let earth = 0;
    let grass = 0;
    for (let i = 0; i < raw.length; i += 4) {
      if (!raw[i + 3]) continue;
      const want = isEarthPixel(raw[i], raw[i + 1], raw[i + 2]) ? nightG : dayG;
      if (want === nightG) earth++;
      else grass++;
      // ±2: arredondamento do canvas (alfa pré-multiplicado no put/getImageData)
      for (let k = 0; k < 3; k++) expect(Math.abs(got[i + k] - want[i + k]), `px ${i / 4}`).toBeLessThanOrEqual(2);
    }
    expect(earth).toBeGreaterThan(300);
    expect(grass).toBeGreaterThan(50);
    // de dia (ou sem nightEarth) a imagem é a do dia graduada, como antes
    const dayOut = gradeTiles({ [key]: { url: dayUrl } }, look, images, make, true);
    expect(dayOut[key].url).not.toBe(out[key].url);
  });

  it("copas de borda: variante por árvore na faixa de 5 tiles, mesmo tronco e colisão; a leaning nunca espelhada", () => {
    const m = m9();
    const W = m.width;
    const H = m.height;
    const edge = (p: { x: number; y: number }) => Math.min(p.x / 32, p.y / 32, W - p.x / 32, H - p.y / 32) < 5;
    const trees = m.props.filter((p) => TREE_RE.test(p.key));
    const v12 = trees.filter((p) => p.key.startsWith("fp12_"));
    expect(v12.length).toBeGreaterThan(150);
    expect(v12.every(edge)).toBe(true);
    expect(v12.some((p) => /^fp12_leaning_.*_flip$/.test(p.key))).toBe(false);
    expect(variantsOf("leaning")).not.toContain("flip");
    expect(trees.filter(edge).length).toBe(report.v12.edgeTrees.trees);
    // posição e colisão: as mesmas do v8 (só a chave muda; o look-v9.test confere prop a prop fora da clareira)
    expect(report.v12.edgeTrees.byVariant.normal).toBe(trees.filter((p) => edge(p) && p.key.startsWith("fp10_")).length);
    for (const p of v12) expect(p.solid, p.key).toBe(true);
    // base = tronco do v10; copa = canopy-edge-variety (dia) e a mesma variante noturna (noite)
    const day = extraPackTiles(pack);
    const night = extraPackTiles(pack, undefined, "night");
    for (const k of new Set(v12.map((p) => p.key))) {
      const sil = k.replace(/^fp12_/, "fp10_").replace(/_(flip|tone_dark|tone_light)$/, "");
      const dir = k.endsWith("_flip") ? "flip" : "tone";
      expect(day[`${k}_base`].url, k).toBe(day[`${sil}_base`].url);
      expect(day[`${k}_top`].url, k).toMatch(new RegExp(`canopy-edge-variety/${dir}/[a-z_]+\\.png`));
      expect(night[`${k}_top`].url, k).toMatch(new RegExp(`canopy-edge-variety/${dir}/night/`));
      expect(pack.trees!.topOffset![k]).toEqual(pack.trees!.topOffset![sil]);
      expect(pack.trees!.rimLight!.baked).toContain(k);
      expect(gradeRuleFor(`${k}_top`, pack.look as LookCfg)).toMatchObject({ saturationMul: 0.92, valueMul: 0.9 });
    }
    // repetição: visuais distintos na faixa (8 silhuetas → 30) e menos copas com um gêmeo idêntico a menos de 160 px
    const band = trees.filter(edge);
    const twins = (f: (k: string) => string) => band.filter((a) => band.some((b) => b !== a && f(b.key) === f(a.key) && Math.hypot(a.x - b.x, a.y - b.y) < 160)).length;
    const sil = (k: string) => k.replace(/^fp1[02]_/, "").replace(/_(flip|tone_dark|tone_light)$/, "");
    expect(new Set(band.map((p) => p.key.replace(/^fp1[02]_/, ""))).size).toBe(30);
    expect(twins((k) => k.replace(/^fp1[02]_/, ""))).toBeLessThan(twins(sil) / 3);
  });

  it("sem o look v9 nada muda: v8 e o mapa base não têm chaves nem pacote do v12", () => {
    for (const look of [undefined, "v8"] as const) {
      const def = look ? withLook(MAPS[ID], look) : MAPS[ID];
      const json = JSON.stringify(def.tmj) + JSON.stringify(def.pack);
      expect(json, look ?? "base").not.toMatch(/fp12_|forest-v12/);
    }
  });
});
