// GS-003 v15 integration (2026-11-12): Digi Forest v15b importada do PixelLab, Tamers v13 e as regras novas do
// fundador — (a) mapas fechados, (b) mais encontros (~3–5 s de mato), (c) roster inteiro em qualquer mapa.
import { describe, expect, it } from "vitest";
import { loadSceneTiles, usedKeys } from "../src/assets/scene-tiles";
import { defaultLook, loadPresetsV13, presetVisual } from "../src/assets/tamer-presets";
import { rosterOf, rosterSpawns, rosterTable, STRONG_STAGE } from "../src/sim/encounters/roster";
import { newRollState, randomPool, step } from "../src/sim/encounters/rules";
import { ENCOUNTER_TABLES, validateTable } from "../src/sim/encounters/table";
import { closeMap, isSolidAt, parseTiledMap, portalAt, reachableOf, WORLDMAP_PORTAL } from "../src/sim/map";
import { SUB } from "../src/sim/params";
import { loadWorldContent } from "../src/sim/species";
import { DEFAULT_MAP, MAPS, travelTarget } from "../src/world/regions";

const def = MAPS["digi-forest-v15b"];
const map = parseTiledMap(def.id, def.tmj);
const cell = (x: number, y: number) => ({ x: x * SUB + SUB / 2, y: y * SUB + SUB / 2 });
const content = loadWorldContent();
const roster = rosterOf(content, (id) => !id.startsWith("SP-"));

describe("Digi Forest v15b (import PixelLab)", () => {
  it("é o mapa inicial padrão e o destino da Floresta Densa no Mapa-múndi", () => {
    expect(DEFAULT_MAP).toBe("digi-forest-v15b");
    expect(travelTarget("floresta_densa")!.id).toBe("digi-forest-v15b");
    expect([map.width, map.height, map.tileSize]).toEqual([48, 36, 32]);
  });

  it("chão, objetos, decalques e quadros animados: toda chave tem imagem (nenhum placeholder)", () => {
    const day = loadSceneTiles(def.pack, "day", usedKeys(map));
    expect(day.missing).toEqual([]);
    for (const a of Object.values(def.pack.animProps ?? {})) for (const f of a.frames) expect(day.tiles[f], f).toBeDefined();
    expect(Object.keys(def.pack.animProps ?? {}).sort()).toEqual(["v15_waterfall"]);
    // river_shimmer ficou fora do import (o sprite é um bonequinho, não brilho de água)
    expect(map.props.some((p) => p.key.startsWith("v15_river_shimmer"))).toBe(false);
    expect(day.tiles[def.pack.waterAnim!.tile]).toBeDefined();
    // os props têm pé (pivô) do groundBounds, não o centro da última linha do PNG
    expect(day.tiles.v15_tree_canopy_broadleaf_v2.pivot).toBeDefined();
  });

  it("colisão: água bloqueia (menos a travessia da ponte), tronco bloqueia 1 célula no pé, tufo não bloqueia", () => {
    expect(isSolidAt(map, cell(25, 10).x, cell(25, 10).y)).toBe(true); // lago
    for (const x of [24, 25, 26, 27]) expect(isSolidAt(map, cell(x, 17).x, cell(x, 17).y), `ponte ${x}`).toBe(false);
    const tree = map.props.find((p) => p.key.startsWith("v15_tree_") && p.x > 64 && p.y > 64)!;
    expect(tree.solid).toBe(true);
    expect(map.solid[Math.floor((tree.y - 1) / 32) * map.width + Math.floor(tree.x / 32)]).toBe(1);
    const tufts = map.props.filter((p) => p.key === "v15_tallgrass_tuft_b");
    expect(tufts.length).toBeGreaterThan(300);
    expect(tufts.every((p) => !p.solid)).toBe(true);
  });

  it("só o portal do Mapa-múndi (perto do arco), alcançável a pé da entrada sul; o início do teleporte também", () => {
    expect(map.portals.map((p) => p.to)).toEqual([WORLDMAP_PORTAL]);
    expect(map.portals[0].marker).toBe(false); // a arte do portal já existe (boss_portal_marker)
    const r = reachableOf(map);
    const p = map.portals[0];
    expect(r[Math.floor(p.y / 32) * map.width + Math.floor((p.x + p.w / 2) / 32)]).toBe(1);
    const s = map.starts.from_worldmap;
    expect(r[Math.floor(s.y / SUB) * map.width + Math.floor(s.x / SUB)]).toBe(1);
    expect(portalAt(map, (s.x / SUB) * 32, (s.y / SUB) * 32)).toBeUndefined();
  });

  it("encontros: a tabela valida, as áreas são as células de mato (tufos) e há 2 grupos de surpresa", () => {
    const t = ENCOUNTER_TABLES["digi-forest-v15b"];
    expect(validateTable(rosterTable(t, roster), content)).toEqual([]);
    const tuftCells = new Set(map.props.filter((p) => p.key === "v15_tallgrass_tuft_b").map((p) => Math.floor(p.y / 32) * map.width + Math.floor(p.x / 32)));
    let covered = 0;
    for (const a of t.areas) covered += a.rect.w * a.rect.h;
    expect(covered).toBe(tuftCells.size);
    expect(new Set(t.areas.filter((a) => a.id.startsWith("surpresa")).map((a) => a.zoneRef)).size).toBe(2);
    expect(t.entries.filter((e) => e.mode === "visible").length).toBeGreaterThanOrEqual(3);
  });
});

describe("regra (a): mapas fechados", () => {
  it("as saídas de borda saem; mapa sem portal ganha o do Mapa-múndi no início do Tamer", () => {
    for (const id of ["forest-proof", "praia", "vila", "digimon-forest-01"]) {
      const m = closeMap(parseTiledMap(id, MAPS[id].tmj));
      expect(m.portals.map((p) => p.to), id).toEqual([WORLDMAP_PORTAL]);
      const s = m.starts.player;
      expect(portalAt(m, (s.x / SUB) * 32, (s.y / SUB) * 32)?.to, id).toBe(WORLDMAP_PORTAL);
    }
    // a v15b já tem o próprio portal: fica como está
    expect(closeMap(map).portals).toEqual(map.portals);
  });
});

describe("regra (b): encontro a cada ~3–5 s andando no mato", () => {
  it("tempo médio até o encontro (passos de 0,32 s) entre 3 e 5 s, nas duas florestas com tabela", () => {
    for (const id of ["digi-forest-v15b", "digimon-forest-01"]) {
      const t = rosterTable(ENCOUNTER_TABLES[id], roster);
      const terrain = Object.keys(t.terrains)[0];
      const area = t.areas.find((a) => a.terrain === terrain && !/surpresa|oculta/.test(a.id))!;
      const rng = { rngState: 12345 };
      const st = newRollState(t, rng);
      let steps = 0;
      const times: number[] = [];
      for (let i = 0; i < 20000 && times.length < 400; i++) {
        steps++;
        const r = step(t, st, rng, { terrain, areaId: area.id, areaRateMult: area.rateMult ?? 1, time: "day", weather: "clear", nowSec: i * t.params.stepSeconds });
        if (r.kind === "encounter") {
          times.push(steps * t.params.stepSeconds);
          steps = 0;
        }
      }
      const mean = times.reduce((a, b) => a + b, 0) / times.length;
      expect(mean, `${id}: ${mean.toFixed(2)} s`).toBeGreaterThanOrEqual(3);
      expect(mean, `${id}: ${mean.toFixed(2)} s`).toBeLessThanOrEqual(5);
    }
  });
});

describe("regra (c): roster inteiro em qualquer mapa", () => {
  it("o mato sorteia todo o roster; os fortes só como surpresa rara; os pontos visíveis sorteiam entre os fortes", () => {
    const t = rosterTable(ENCOUNTER_TABLES["digi-forest-v15b"], roster);
    const pool = randomPool(t, { terrain: "tall_grass", time: "day", weather: "clear", areaId: t.areas.find((a) => a.id.startsWith("mato"))!.id });
    expect(new Set(pool.map((x) => x.entry.speciesId))).toEqual(new Set(roster.map((s) => s.id)));
    const strong = roster.filter((s) => s.stage >= STRONG_STAGE).map((s) => s.id);
    expect(pool.filter((x) => strong.includes(x.entry.speciesId)).every((x) => x.entry.rarity === "very_rare")).toBe(true);
    // no bolsão surpresa o forte pesa 6× mais
    const sp = t.areas.find((a) => a.id.startsWith("surpresa"))!;
    const pool2 = randomPool(t, { terrain: "tall_grass", time: "day", weather: "clear", areaId: sp.id });
    const w = (p: typeof pool, id: string) => p.find((x) => x.entry.speciesId === id)!.weight;
    expect(w(pool2, strong[0])).toBeCloseTo(w(pool, strong[0]) * 6);
    for (const e of t.entries.filter((x) => x.mode === "visible")) expect(new Set(e.speciesPool)).toEqual(new Set(strong));
    // o mesmo roster em outro mapa (sem separação por região)
    const t2 = rosterTable(ENCOUNTER_TABLES["digimon-forest-01"], roster);
    expect(new Set(t2.entries.filter((e) => e.mode === "random").map((e) => e.speciesId))).toEqual(new Set(roster.map((s) => s.id)));
  });

  it("mapas sem tabela (spawn antigo): cada zona sorteia entre o roster não-forte", () => {
    const m = parseTiledMap("praia", MAPS.praia.tmj);
    const z = rosterSpawns(m.spawns, roster);
    expect(z.length).toBe(m.spawns.length);
    for (const s of z) expect(s.species.length).toBe(roster.filter((x) => x.stage < STRONG_STAGE).length);
  });
});

describe("Tamers v13 (PixelLab 36×36)", () => {
  it("12 presets com walk (6) e idle (4) nas 4 direções do mundo; padrão = Coragem (TAMER-0003)", () => {
    const ps = loadPresetsV13();
    expect(ps.map((p) => p.id)).toEqual(Array.from({ length: 12 }, (_, i) => `TAMER-${String(i + 3).padStart(4, "0")}`));
    for (const p of ps) {
      expect(p.frame).toEqual({ w: 36, h: 36 });
      for (const d of ["S", "N", "W", "E"] as const) {
        expect(p.walk[d].length, `${p.id} ${d}`).toBe(6);
        expect(p.idleAnim![d].length).toBe(4);
        expect(p.hairs[0].frames[d]!.every(Boolean)).toBe(true);
      }
    }
    expect(ps[0].label).toBe("Coragem");
    const look = defaultLook(ps);
    expect(look.preset).toBe("TAMER-0003");
    const v = presetVisual(look, ps)!;
    expect(v.manifest.animations.walk.dirFrames!.S.length).toBe(6);
    expect(v.manifest.animations.idle.dirFrames!.E.length).toBe(4);
    expect(v.manifest.dimensions.frameW).toBe(36);
  });
});
