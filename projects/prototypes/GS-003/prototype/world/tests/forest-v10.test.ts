// forest-v10 (Quality Overhaul, fase 3) no look v9 do digimon-forest-01: chão tileável, manchas macro em px do mundo,
// terra batida em blob-16, 4 espécies de árvore na clareira e decalques novos. Dados derivados por
// scripts/map-factory/derive-look-v9.mjs (+ v10-ground-trees.mjs).
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { usedKeys } from "../src/assets/scene-tiles";
import report from "../src/data/maps/v9/digimon-forest-01.p7-report.json";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { featherAlpha, gradeRuleFor, type LookCfg } from "../src/render/look";
import { parseTiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";
// @ts-expect-error módulo .mjs do gerador, sem tipos
import { CURVE_GROUND, grassVariant } from "../scripts/map-factory/v10-ground-trees.mjs";

const ID = "digimon-forest-01";
const PACK = join(__dirname, "../../../art/map-factory/forest-v10-ground-trees");
const BOX = { x0: 12, y0: 6, x1: 41, y1: 29 };
const inBox = (p: { x: number; y: number }) => p.x >= BOX.x0 * 32 && p.x < (BOX.x1 + 1) * 32 && p.y >= BOX.y0 * 32 && p.y < (BOX.y1 + 1) * 32;
const m9 = () => parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
const fileOf = (key: string) => {
  const n = key.replace(/^fp10_/, "");
  for (const d of ["tiles", "overlays", "decals", "trees"]) if (existsSync(join(PACK, d, `${n}.png`))) return join(PACK, d, `${n}.png`);
  return undefined;
};

describe("forest-v10 no look v9", () => {
  it("o chão de grama do v8 sumiu: tudo é fp10_ground_variant_* ou terra batida (blob-16), sem arquivo faltando", () => {
    const m = m9();
    const ground = m.tileLayers.find((l) => l.name === "ground")!.keys;
    expect(ground.some((k) => /^fp8_ground_variant_/.test(k))).toBe(false);
    const v10 = [...new Set(ground.filter((k) => k.startsWith("fp10_")))];
    expect(v10.filter((k) => /ground_variant_/.test(k)).length).toBeGreaterThanOrEqual(8);
    expect(v10.some((k) => /grass_dirt_blob_/.test(k))).toBe(true);
    for (const k of v10) expect(fileOf(k), k).toBeDefined();
    // curvas e recorte suave usam o mesmo chão novo por baixo da faixa
    for (const c of m.curves ?? []) expect(c.ground).toEqual(CURVE_GROUND);
    for (const s of v9Pack.smoothAutotile) expect(s.ground).toEqual(CURVE_GROUND);
  });

  it("variantes: determinísticas, metade lisa, e duas iguais com decalque nunca ficam lado a lado", () => {
    expect(grassVariant(20, 11)).toBe(grassVariant(20, 11));
    const m = m9();
    const g = m.tileLayers.find((l) => l.name === "ground")!.keys;
    const W = m.width;
    const decal = (k: string) => /^fp10_ground_variant_[1-7]$/.test(k);
    for (let i = 0; i < g.length; i++) {
      if (!decal(g[i])) continue;
      if (i % W > 0) expect(g[i - 1], `célula ${i}`).not.toBe(g[i]);
      if (i >= W) expect(g[i - W], `célula ${i}`).not.toBe(g[i]);
    }
    const n = g.filter((k) => /^fp10_ground_variant_/.test(k)).length;
    expect(g.filter((k) => k === "fp10_ground_variant_0").length / n).toBeGreaterThan(0.4);
  });

  it("manchas macro: camada ground-macro-overlay em px do mundo (fora da grade de 32 px), 2 formas, ≥ 2 na clareira", () => {
    const m = m9();
    const mo = m.macroOverlays ?? [];
    expect(mo.length).toBeGreaterThanOrEqual(3);
    expect(new Set(mo.map((o) => o.key))).toEqual(new Set(["fp10_macro_patch_olive", "fp10_macro_patch_shade"]));
    expect(mo.filter(inBox).length).toBeGreaterThanOrEqual(2);
    // nunca uma por tile: nenhuma centrada na grade, nenhuma a menos de 190 px de outra
    expect(mo.every((o) => o.x % 32 !== 16 || o.y % 32 !== 16)).toBe(true);
    for (const a of mo) for (const b of mo) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(190);
    expect(usedKeys(m)).toEqual(expect.arrayContaining(["fp10_macro_patch_olive", "fp10_macro_patch_shade"]));
    // a camada fica entre as de tiles e os objetos (o renderer a desenha entre o chão e a faixa das curvas)
    const names = withLook(MAPS[ID], "v9").tmj.layers.map((l) => l.name);
    expect(names.indexOf("ground-macro-overlay")).toBe(names.indexOf("ground_detail") + 1);
  });

  it("featherAlpha: alfa zero na borda, intacto a partir de f px dela", () => {
    const w = 40;
    const h = 30;
    const d = new Uint8ClampedArray(w * h * 4).fill(200);
    featherAlpha(d, w, h, 10);
    const a = (x: number, y: number) => d[(y * w + x) * 4 + 3];
    expect(a(0, 15)).toBe(0);
    expect(a(39, 15)).toBe(0);
    expect(a(20, 0)).toBe(0);
    expect(a(5, 15)).toBeGreaterThan(0);
    expect(a(5, 15)).toBeLessThan(200);
    expect(a(20, 15)).toBe(200);
    expect(d[(15 * w + 0) * 4]).toBe(200); // cor intacta
  });

  it("árvores da clareira: as comuns do v4 viraram as 4 espécies do v10 em 2 tamanhos, sólidas, com base e copa", () => {
    const m = m9();
    const trees = m.props.filter(inBox).filter((p) => /^fp(4_tree|10_(tall_narrow|wide_low|leaning|ancient_thick))_/.test(p.key));
    const v10 = trees.filter((p) => p.key.startsWith("fp10_"));
    expect(trees.filter((p) => p.key.startsWith("fp4_tree_")).every((p) => /palm_digital|data_leaf/.test(p.key))).toBe(true);
    expect(v10.length).toBe(report.v10.trees.swapped);
    expect(new Set(v10.map((p) => p.key.replace(/^fp10_|_(large|small)$/g, ""))).size).toBe(4);
    expect(new Set(v10.map((p) => p.key.replace(/^.*_/, "")))).toEqual(new Set(["large", "small"]));
    for (const p of v10) {
      expect(p.solid, p.key).toBe(true);
      expect(fileOf(`${p.key}_base`), p.key).toBeDefined();
      expect(fileOf(`${p.key}_top`), p.key).toBeDefined();
    }
    // a mesma espécie+tamanho nunca se repete a menos de 80 px (o gerador tenta 96; no bosque denso a NE da clareira,
    // com 10–18 vizinhas, as 8 combinações não bastam e ele fica com a repetição mais distante)
    for (const a of v10) for (const b of v10) if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < 80) expect(a.key === b.key, `${a.key} @${a.x},${a.y}`).toBe(false);
    // copas com rim-light já pintado (o renderer não soma outro) e grade própria, mais leve que a dos props fp8_
    for (const k of new Set(v10.map((p) => p.key))) expect(v9Pack.trees.rimLight.baked).toContain(k);
    const look = v9Pack.look as unknown as LookCfg;
    expect(gradeRuleFor("fp10_leaning_large_top", look)?.valueMul).toBeGreaterThan(gradeRuleFor("fp8_fern", look)!.valueMul!);
    expect(gradeRuleFor("fp10_ground_variant_3", look)?.valueMul).toBe(gradeRuleFor("fp8_ground_variant_3", look)?.valueMul);
  });

  it("decalques novos na clareira (4 tipos), fora de colisão e de água", () => {
    const m = m9();
    const ds = (m.decals ?? []).filter((d) => d.key.startsWith("fp10_"));
    expect(new Set(ds.map((d) => d.key))).toEqual(new Set(["fp10_leaf_litter_big", "fp10_root_exposed_mossy", "fp10_mossy_stone_cluster", "fp10_tuft_overlap_big"]));
    for (const d of ds) {
      expect(inBox(d)).toBe(true);
      expect(m.solid[Math.floor((d.y - 1) / 32) * m.width + Math.floor(d.x / 32)], `${d.key} @${d.x},${d.y}`).toBe(0);
    }
  });
});
