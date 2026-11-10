// forest-v11 (Quality Overhaul, fase 3) no look v9 do digimon-forest-01: chão com relevo, terra batida Wang-47 (8
// vizinhos, cantos internos), manchas macro com alfa 0 na borda, copas noturnas próprias e topo do mirante. Dados
// derivados por scripts/map-factory/derive-look-v9.mjs (+ v11-ground.mjs).
import { createRequire } from "node:module";
import { join } from "node:path";
import { loadImage, createCanvas } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import { extraPackTiles, type ScenePack } from "../src/assets/scene-tiles";
import { loadMapFactoryPack } from "../src/assets/tiles";
import report from "../src/data/maps/v9/digimon-forest-01.p7-report.json";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { gradeRuleFor, type LookCfg } from "../src/render/look";
import { parseTiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";
import table from "../src/data/encounters/digimon-forest-01.json";
// @ts-expect-error módulo .mjs do gerador, sem tipos
import { BLOB47, blob47Index, masks8 } from "../scripts/map-factory/v11-ground.mjs";

const ID = "digimon-forest-01";
const ART = join(__dirname, "../../../art");
const m9 = () => parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
const layerKeys = (name: string) => m9().tileLayers.find((l) => l.name === name)!.keys;

describe("forest-v11 no look v9", () => {
  it("Wang-47: o porte casa com art/src/blob_autotile47.js do pacote (47 peças, mesmo índice para os 256 vizinhos)", () => {
    const art = createRequire(import.meta.url)(join(ART, "src/blob_autotile47.js"));
    const table47 = art.enumerateBlob47();
    expect(BLOB47).toEqual(table47);
    expect(new Set(BLOB47.map((t: { edgeMask: number; diagMask: number }) => `${t.edgeMask}/${t.diagMask}`)).size).toBe(47);
    for (let edge = 0; edge < 16; edge++) for (let diag = 0; diag < 16; diag++) expect(blob47Index(edge, diag)).toBe(art.blob47Index(table47, edge, diag));
  });

  it("terra batida: cada célula usa a peça Wang-47 dos seus 8 vizinhos; fogueira, fonte e 3 trilhas; com canto interno", () => {
    const m = m9();
    const g = layerKeys("ground");
    const W = m.width;
    const dirt = new Set(g.flatMap((k, i) => (/^fp11_grass_dirt_wang47_\d+$/.test(k) ? [i] : [])));
    const has = (x: number, y: number) => x >= 0 && y >= 0 && x < W && y < m.height && dirt.has(y * W + x);
    let notch = 0;
    for (const i of dirt) {
      const x = i % W;
      const y = Math.floor(i / W);
      const { edge, diag } = masks8(has, x, y);
      expect(g[i], `(${x},${y})`).toBe(`fp11_grass_dirt_wang47_${blob47Index(edge, diag)}`);
      // canto interno: as 2 arestas de um canto são terra e a diagonal não (o entalhe que o blob-16 não tinha)
      const t = BLOB47[blob47Index(edge, diag)];
      if ([[1, 2, 1], [4, 2, 2], [4, 8, 4], [1, 8, 8]].some(([a, b, d]) => t.edgeMask & a && t.edgeMask & b && !(t.diagMask & d))) notch++;
      // nunca colisão, água, lama ou zona de encontro
      expect(m.solid[i], `(${x},${y})`).toBe(0);
      expect(table.areas.some((a) => x >= a.rect.x && x < a.rect.x + a.rect.w && y >= a.rect.y && y < a.rect.y + a.rect.h), `(${x},${y})`).toBe(false);
    }
    expect(dirt.size).toBe(report.v11.dirt.cells);
    expect(notch).toBeGreaterThanOrEqual(3);
    expect(report.v11.dirt.pieces).toBeGreaterThanOrEqual(12);
    const tags = report.v11.dirt.regions.map((r) => r.tag);
    expect(tags.slice(0, 2)).toEqual(["fogueira", "fonte-cura"]);
    expect(tags.filter((t) => t.startsWith("trilha:")).length).toBe(3);
    for (const r of report.v11.dirt.regions) expect(r.cells.length, r.tag).toBeGreaterThanOrEqual(6);
    // nas trilhas a terra passa por baixo da faixa: parte das células era da trilha
    expect(report.v11.dirt.fromPath).toBeGreaterThan(0);
  });

  it("manchas macro do v11: alfa 0 nos 8 px da borda do PNG (o renderer não precisa mais do feather de 14 px)", async () => {
    for (const n of ["macro_patch_olive", "macro_patch_shade"]) {
      const img = await loadImage(join(ART, "map-factory/forest-v11-ground/overlays", `${n}.png`));
      const c = createCanvas(img.width, img.height);
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, img.width, img.height).data;
      let max = 0;
      for (let y = 0; y < img.height; y++) for (let x = 0; x < img.width; x++) if (Math.min(x, y, img.width - 1 - x, img.height - 1 - y) < 8) max = Math.max(max, d[(y * img.width + x) * 4 + 3]);
      expect(max, n).toBe(0);
    }
  });

  it("copas à noite: trees/night/ do v11 é o preset noturno das copas fp10_ (de dia, a copa do v10); sem ajuste de cor", () => {
    const pack = v9Pack as unknown as ScenePack;
    expect(pack.extraPacks!.find((e) => e.pack === "forest-v11-ground")?.nightFor).toBe("fp10_");
    const day = extraPackTiles(pack);
    const night = extraPackTiles(pack, undefined, "night");
    for (const sp of ["tall_narrow", "wide_low", "leaning", "ancient_thick"])
      for (const sz of ["large", "small"]) {
        const k = `fp10_${sp}_${sz}_top`;
        expect(day[k].url, k).toContain("forest-v10-ground-trees/trees/");
        expect(night[k].url, k).toContain("forest-v11-ground/trees/night/");
        expect(night[`fp10_${sp}_${sz}_base`].url).toBe(day[`fp10_${sp}_${sz}_base`].url);
      }
    // de dia o pacote v11 não traz as copas noturnas (pasta night/ fora) nem as pranchas de prova
    const v11 = loadMapFactoryPack("forest-v11-ground");
    expect(Object.keys(v11).some((k) => /_top$|preview|before_after|tileability|_demo/.test(k))).toBe(false);
    expect(Object.keys(loadMapFactoryPack("forest-v11-ground", "night")).length).toBe(8);
    // o ajuste de cor provisório das copas (GradeRule.night do v10) saiu: a regra das copas é só a do dia
    const treeRule = v9Pack.look.grade.rules.find((r) => r.match.startsWith("^fp10_(tall_narrow"));
    expect(treeRule && Object.keys(treeRule).sort()).toEqual(["match", "saturationMul", "valueMul"]);
  });

  it("mirante: topo mirante_top_blob_* com a grade do chão, sem a faixa de grama do v8, com decalques; face do v9-cliffs", () => {
    const m = m9();
    const g = layerKeys("ground");
    const det = layerKeys("ground_detail");
    const W = m.width;
    const top = g.flatMap((k, i) => (/^fp11_mirante_top_blob_\d+$/.test(k) ? [i] : []));
    expect(top.length).toBe(24);
    expect(g.some((k) => /cliff_top_blob/.test(k))).toBe(false);
    for (const i of top) expect(det[i] ?? "", `(${i % W},${Math.floor(i / W)})`).toBe("");
    // a máscara blob-16 do topo segue a do v9-cliffs (mesmo número)
    const has = (x: number, y: number) => top.includes(y * W + x);
    for (const i of top) {
      const x = i % W;
      const y = Math.floor(i / W);
      const mk = (has(x, y - 1) ? 1 : 0) | (has(x + 1, y) ? 2 : 0) | (has(x, y + 1) ? 4 : 0) | (has(x - 1, y) ? 8 : 0);
      expect(g[i]).toBe(`fp11_mirante_top_blob_${mk}`);
    }
    // face, cantos e rampa: kit forest-v9-cliffs na linha de baixo
    const face = det.filter((k) => /^fp9c_cliff_(face_[a-d]|face_corner_outer_(left|right)|ramp)$/.test(k));
    expect(new Set(face.map((k) => k.replace(/_[a-d]$/, "")))).toEqual(new Set(["fp9c_cliff_face", "fp9c_cliff_face_corner_outer_left", "fp9c_cliff_face_corner_outer_right", "fp9c_cliff_ramp"]));
    const look = v9Pack.look as unknown as LookCfg;
    expect(gradeRuleFor("fp11_mirante_top_blob_15", look)).toEqual(gradeRuleFor("fp11_ground_variant_0", look));
    expect(gradeRuleFor("fp11_mirante_top_blob_15", look)?.tint).toBeUndefined();
    const onTop = (m.decals ?? []).filter((d) => has(Math.floor(d.x / 32), Math.floor((d.y - 1) / 32)));
    expect(onTop.length).toBeGreaterThanOrEqual(8);
    expect(new Set(onTop.map((d) => d.key)).size).toBeGreaterThanOrEqual(4);
  });
});
