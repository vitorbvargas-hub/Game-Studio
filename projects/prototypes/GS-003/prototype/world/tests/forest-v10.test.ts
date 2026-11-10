// forest-v10 (Quality Overhaul, fase 3) no look v9 do digimon-forest-01: manchas macro em px do mundo, 4 espécies de
// árvore (no mapa todo desde o forest-v11) e decalques novos. O chão, a terra batida e as manchas vieram do forest-v11
// por cima (tests/forest-v11.test.ts). Dados derivados por scripts/map-factory/derive-look-v9.mjs (+ v10-ground-trees.mjs,
// v11-ground.mjs).
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { usedKeys } from "../src/assets/scene-tiles";
import report from "../src/data/maps/v9/digimon-forest-01.p7-report.json";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { gradeRuleFor, type LookCfg } from "../src/render/look";
import { parseTiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";
// @ts-expect-error módulo .mjs do gerador, sem tipos
import { CURVE_GROUND, grassVariant } from "../scripts/map-factory/v10-ground-trees.mjs";

/** Chão das curvas: a lista do v10 com as variantes trocadas pelas do v11 (mesmos índices). */
const CURVE_GROUND_V11 = (CURVE_GROUND as string[]).map((k) => k.replace(/^fp10_/, "fp11_"));

const ID = "digimon-forest-01";
const PACK = join(__dirname, "../../../art/map-factory/forest-v10-ground-trees");
const BOX = { x0: 12, y0: 6, x1: 41, y1: 29 };
const inBox = (p: { x: number; y: number }) => p.x >= BOX.x0 * 32 && p.x < (BOX.x1 + 1) * 32 && p.y >= BOX.y0 * 32 && p.y < (BOX.y1 + 1) * 32;
const m9 = () => parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
const PACK11 = join(__dirname, "../../../art/map-factory/forest-v11-ground");
const fileOf = (key: string) => {
  const [pack, n] = key.startsWith("fp11_") ? [PACK11, key.slice(5)] : [PACK, key.replace(/^fp10_/, "")];
  for (const d of ["tiles", "overlays", "decals", "trees", "mirante"]) if (existsSync(join(pack, d, `${n}.png`))) return join(pack, d, `${n}.png`);
  return undefined;
};

describe("forest-v10 no look v9", () => {
  it("o chão de grama do v8 sumiu: tudo é ground_variant_* do v11 ou terra batida, sem arquivo faltando", () => {
    const m = m9();
    const ground = m.tileLayers.find((l) => l.name === "ground")!.keys;
    expect(ground.some((k) => /^fp(8|10)_ground_variant_/.test(k))).toBe(false);
    expect(ground.some((k) => /grass_dirt_blob_/.test(k))).toBe(false);
    const v11 = [...new Set(ground.filter((k) => k.startsWith("fp11_")))];
    expect(v11.filter((k) => /ground_variant_/.test(k)).length).toBeGreaterThanOrEqual(8);
    for (const k of v11) expect(fileOf(k), k).toBeDefined();
    // curvas e recorte suave usam o mesmo chão novo por baixo da faixa
    for (const c of m.curves ?? []) expect(c.ground).toEqual(CURVE_GROUND_V11);
    for (const s of v9Pack.smoothAutotile) expect(s.ground).toEqual(CURVE_GROUND_V11);
  });

  it("variantes: determinísticas, metade lisa, e duas iguais com decalque nunca ficam lado a lado", () => {
    expect(grassVariant(20, 11)).toBe(grassVariant(20, 11));
    const m = m9();
    const g = m.tileLayers.find((l) => l.name === "ground")!.keys;
    const W = m.width;
    const decal = (k: string) => /^fp11_ground_variant_[1-7]$/.test(k);
    for (let i = 0; i < g.length; i++) {
      if (!decal(g[i])) continue;
      if (i % W > 0) expect(g[i - 1], `célula ${i}`).not.toBe(g[i]);
      if (i >= W) expect(g[i - W], `célula ${i}`).not.toBe(g[i]);
    }
    const n = g.filter((k) => /^fp11_ground_variant_/.test(k)).length;
    expect(g.filter((k) => k === "fp11_ground_variant_0").length / n).toBeGreaterThan(0.4);
  });

  it("manchas macro: camada ground-macro-overlay em px do mundo (fora da grade de 32 px), 2 formas, ≥ 2 na clareira", () => {
    const m = m9();
    const mo = m.macroOverlays ?? [];
    expect(mo.length).toBeGreaterThanOrEqual(3);
    expect(new Set(mo.map((o) => o.key))).toEqual(new Set(["fp11_macro_patch_olive", "fp11_macro_patch_shade"]));
    expect(mo.filter(inBox).length).toBeGreaterThanOrEqual(2);
    // nunca uma por tile: nenhuma centrada na grade, nenhuma a menos de 190 px de outra
    expect(mo.every((o) => o.x % 32 !== 16 || o.y % 32 !== 16)).toBe(true);
    for (const a of mo) for (const b of mo) if (a !== b) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(190);
    expect(usedKeys(m)).toEqual(expect.arrayContaining(["fp11_macro_patch_olive", "fp11_macro_patch_shade"]));
    // a camada fica entre as de tiles e os objetos (o renderer a desenha entre o chão e a faixa das curvas)
    const names = withLook(MAPS[ID], "v9").tmj.layers.map((l) => l.name);
    expect(names.indexOf("ground-macro-overlay")).toBe(names.indexOf("ground_detail") + 1);
  });

  it("árvores do mapa todo: as comuns do v4 viraram as 4 espécies do v10 em 2 tamanhos, sólidas, com base e copa", () => {
    const m = m9();
    const trees = m.props.filter((p) => /^fp(4_tree|10_(tall_narrow|wide_low|leaning|ancient_thick))_/.test(p.key));
    const v10 = trees.filter((p) => p.key.startsWith("fp10_"));
    // forest-v11: a troca vale para o mapa inteiro; as digitais (palmeira e data_leaf) ficam todas, como acento Digimon
    expect(trees.filter((p) => p.key.startsWith("fp4_tree_")).every((p) => /palm_digital|data_leaf/.test(p.key))).toBe(true);
    expect(trees.filter((p) => p.key.startsWith("fp4_tree_")).length).toBe(report.v10.trees.keptDigital);
    expect(v10.length).toBe(report.v10.trees.swapped);
    expect(v10.filter((p) => !inBox(p)).length).toBeGreaterThan(300);
    expect(new Set(v10.map((p) => p.key.replace(/^fp10_|_(large|small)$/g, ""))).size).toBe(4);
    expect(new Set(v10.map((p) => p.key.replace(/^.*_/, "")))).toEqual(new Set(["large", "small"]));
    for (const p of v10) {
      expect(p.solid, p.key).toBe(true);
      expect(fileOf(`${p.key}_base`), p.key).toBeDefined();
      expect(fileOf(`${p.key}_top`), p.key).toBeDefined();
    }
    // a mesma espécie+tamanho nunca se repete a menos de 80 px (o gerador tenta 96; na mata densa as 8 combinações não
    // bastam e ele fica com a repetição mais distante)
    for (const a of v10) for (const b of v10) if (a !== b && Math.hypot(a.x - b.x, a.y - b.y) < 80) expect(a.key === b.key, `${a.key} @${a.x},${a.y}`).toBe(false);
    // copas com rim-light já pintado (o renderer não soma outro) e grade própria, mais leve que a dos props fp8_
    for (const k of new Set(v10.map((p) => p.key))) expect(v9Pack.trees.rimLight.baked).toContain(k);
    const look = v9Pack.look as unknown as LookCfg;
    expect(gradeRuleFor("fp10_leaning_large_top", look)?.valueMul).toBeGreaterThan(gradeRuleFor("fp8_fern", look)!.valueMul!);
    expect(gradeRuleFor("fp11_ground_variant_3", look)?.valueMul).toBe(gradeRuleFor("fp8_ground_variant_3", look)?.valueMul);
  });

  it("decalques novos (4 tipos): pedras e tufos na clareira, raiz e folhas no pé das árvores novas; fora de colisão", () => {
    const m = m9();
    const ds = (m.decals ?? []).filter((d) => d.key.startsWith("fp10_"));
    expect(new Set(ds.map((d) => d.key))).toEqual(new Set(["fp10_leaf_litter_big", "fp10_root_exposed_mossy", "fp10_mossy_stone_cluster", "fp10_tuft_overlap_big"]));
    for (const d of ds) {
      if (/mossy_stone|tuft_overlap/.test(d.key)) expect(inBox(d), `${d.key} @${d.x},${d.y}`).toBe(true);
      expect(m.solid[Math.floor((d.y - 1) / 32) * m.width + Math.floor(d.x / 32)], `${d.key} @${d.x},${d.y}`).toBe(0);
    }
  });
});
