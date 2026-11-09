// Map Factory (ADR-011, briefing 12_map_factory_v2 §7): o validador roda em todo mapa do jogo e na fixture gerada
// de brief; cada gate é provado também com um mapa quebrado de propósito; o gerador é determinístico e a grade de
// colisão do validador é a mesma da sim (parseTiledMap).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "../scripts/map-factory/context.mjs";
import { generateFromBrief } from "../scripts/map-factory/generate.mjs";
import { solidGrid } from "../scripts/map-factory/tiled.mjs";
import { isNormalizedW47, validateMap } from "../scripts/map-factory/validate.mjs";
import { parseTiledMap, type TiledMap } from "../src/sim/map";

const FIXTURES = join(WORLD_DIR, "tests/fixtures/maps");
const BRIEF = join(WORLD_DIR, "scripts/map-factory/briefs/forest-factory-test.brief.json");
const maps = loadMaps([MAPS_DIR, FIXTURES]);
const species = loadSpecies();
const ctxOf = (id: string) => contextFor(id, maps, species);
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const gateOf = (r: ReturnType<typeof validateMap>, id: string) => r.gates.find((g) => g.id === id)!;
const objLayer = (m: any, name?: string) => m.layers.find((l: any) => l.type === "objectgroup" && (!name || l.name === name));

describe("Map Factory — validador", () => {
  it("todos os mapas do jogo (forest-proof, praia, vila, test-meadow) e a fixture passam em todos os gates", () => {
    for (const id of ["forest-proof", "praia", "vila", "test-meadow", "forest-factory-test"]) {
      expect(maps[id], id).toBeDefined();
      const r = validateMap(id, maps[id].tmj, ctxOf(id));
      const fails = r.gates.filter((g) => g.status === "fail").map((g) => `${g.id}: ${g.errors.join("; ")}`);
      expect(fails, id).toEqual([]);
      expect(r.gates.map((g) => g.id)).toEqual(["layers", "tile_ids", "asset_keys", "reach", "placement", "wang", "species", "portals"]);
    }
  });

  it("a grade de colisão do validador é a mesma da sim (parseTiledMap) em todos os mapas", () => {
    for (const [id, m] of Object.entries(maps)) {
      const sim = parseTiledMap(id, m.tmj as TiledMap);
      expect(Array.from(solidGrid(m.tmj).solid), id).toEqual(Array.from(sim.solid));
    }
  });

  it("layers: perfil factory-v1 exige as 9 camadas; legacy só ground + objetos", () => {
    const m = clone(maps["forest-factory-test"].tmj);
    m.layers = m.layers.filter((l: any) => l.name !== "poi" && l.name !== "ground_detail");
    const r = validateMap("x", m, ctxOf("forest-factory-test"));
    expect(gateOf(r, "layers").status).toBe("fail");
    expect(gateOf(r, "layers").errors.join()).toMatch(/ground_detail.*poi|poi.*ground_detail/);
    expect(gateOf(validateMap("vila", maps.vila.tmj, { ...ctxOf("vila"), profile: "factory-v1" }), "layers").status).toBe("fail");
  });

  it("tile_ids: gid sem tile ou com flip falha", () => {
    const m = clone(maps.vila.tmj);
    m.layers[0].data[5] = 999;
    m.layers[0].data[6] = 0x80000001;
    const g = gateOf(validateMap("vila", m, ctxOf("vila")), "tile_ids");
    expect(g.status).toBe("fail");
    expect(g.errors.join()).toMatch(/gid 999 sem tile/);
    expect(g.errors.join()).toMatch(/flip/);
  });

  it("asset_keys: chave sem PNG falha; sem versão noturna (pacote com night) também", () => {
    const m = clone(maps["forest-proof"].tmj);
    const p = objLayer(m).objects.find((o: any) => o.type === "prop");
    p.properties[0].value = "fp4_nao_existe";
    const g = gateOf(validateMap("forest-proof", m, ctxOf("forest-proof")), "asset_keys");
    expect(g.status).toBe("fail");
    expect(g.errors.join()).toMatch(/fp4_nao_existe/);
  });

  it("reach: POI cercado de colisão fica inalcançável", () => {
    const m = clone(maps["forest-factory-test"].tmj);
    const poi = objLayer(m, "poi").objects.find((o: any) => o.type === "poi");
    const T = m.tilewidth;
    const [px, py] = [Math.floor(poi.x / T), Math.floor(poi.y / T)];
    objLayer(m, "collision").objects.push({ id: 9001, name: "muro", type: "collision", x: (px - 2) * T, y: (py - 2) * T, width: 5 * T, height: 5 * T });
    const r = validateMap("forest-factory-test", m, ctxOf("forest-factory-test"));
    expect(gateOf(r, "reach").status).toBe("fail");
    expect(gateOf(r, "reach").errors.join()).toMatch(/poi 'santuario-de-dados' inalcançável/);
  });

  it("placement: NPC em célula bloqueada ou empilhado em outro falha; spawn com centro bloqueado também", () => {
    const m = clone(maps["forest-factory-test"].tmj);
    const T = m.tilewidth;
    const npcs = objLayer(m, "npcs").objects;
    npcs.push({ ...npcs[0], id: 9002, name: "gemeo" });
    // pedra na clareira (prop sólido sobre chão livre)
    const rock = objLayer(m, "objects_below").objects.find((o: any) => o.properties[0].value === "fp4_rock_cluster");
    npcs.push({ id: 9003, name: "na-pedra", type: "npc", x: rock.x, y: rock.y - 1, point: true });
    const sp = objLayer(m, "spawns").objects.find((o: any) => o.type === "spawn");
    objLayer(m, "collision").objects.push({ id: 9004, name: "pedra", type: "collision", x: sp.x + sp.width / 2 - T / 2, y: sp.y + sp.height / 2 - T / 2, width: T, height: T });
    const g = gateOf(validateMap("forest-factory-test", m, ctxOf("forest-factory-test")), "placement");
    expect(g.status).toBe("fail");
    const all = g.errors.join("\n");
    expect(all).toMatch(/npc 'gemeo'.*sobreposto a npc 'guia'/);
    expect(all).toMatch(/npc 'na-pedra'.*bloqueado por prop:fp4_rock_cluster/);
    expect(all).toMatch(/spawn 'santuario'.*bloqueado por collision:pedra/);
  });

  it("wang: máscara que não bate com os vizinhos ou não normalizada falha", () => {
    expect(isNormalizedW47(255)).toBe(true);
    expect(isNormalizedW47(16)).toBe(false);
    const m = clone(maps["forest-proof"].tmj);
    const ts = m.tilesets[0];
    const i = m.layers[0].data.findIndex((g: number) => /path_w47_/.test(ts.tiles[g - 1].properties[0].value));
    ts.tiles.push({ id: ts.tiles.length, properties: [{ name: "key", type: "string", value: "fp4_path_w47_0" }, { name: "solid", type: "bool", value: false }] });
    m.layers[0].data[i] = ts.tiles.length;
    const g = gateOf(validateMap("forest-proof", m, ctxOf("forest-proof")), "wang");
    expect(g.status).toBe("fail");
    expect(g.errors.join()).toMatch(/fp4_path_w47: \(\d+,\d+\) tem máscara 0/);
  });

  it("species: espécie fora de world-species.json falha", () => {
    const m = clone(maps.praia.tmj);
    const sp = objLayer(m).objects.find((o: any) => o.type === "spawn");
    sp.properties[0].value = "CREATURE-0005,CREATURE-9999";
    const g = gateOf(validateMap("praia", m, ctxOf("praia")), "species");
    expect(g.status).toBe("fail");
    expect(g.errors.join()).toMatch(/CREATURE-9999/);
  });

  it("portals: destino desconhecido ou início inexistente falha", () => {
    const m = clone(maps.vila.tmj);
    const p = objLayer(m).objects.find((o: any) => o.type === "portal");
    p.properties[0].value = "mapa-que-nao-existe";
    expect(gateOf(validateMap("vila", m, ctxOf("vila")), "portals").errors.join()).toMatch(/não é um mapa conhecido/);
    p.properties[0].value = "forest-proof";
    p.properties[1].value = "from_lugar_nenhum";
    expect(gateOf(validateMap("vila", m, ctxOf("vila")), "portals").errors.join()).toMatch(/não tem o início 'from_lugar_nenhum'/);
  });
});

describe("Map Factory — gerador a partir de brief", () => {
  const brief = JSON.parse(readFileSync(BRIEF, "utf8"));

  it("é determinístico e a fixture commitada é exatamente a saída do brief", () => {
    const a = generateFromBrief(brief).tmj;
    const b = generateFromBrief(clone(brief)).tmj;
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a).toEqual(maps["forest-factory-test"].tmj);
  });

  it("o mapa gerado carrega na sim: camadas factory-v1, objeto collision vira sólido, inícios livres, spawns e portal", () => {
    const tmj = maps["forest-factory-test"].tmj;
    expect(tmj.layers.map((l: any) => l.name)).toEqual(["ground", "ground_detail", "objects_below", "objects_above", "collision", "spawns", "npcs", "triggers", "poi"]);
    const w = parseTiledMap("forest-factory-test", tmj as TiledMap);
    expect(w.tileLayers.map((l) => l.name)).toEqual(["ground", "ground_detail"]);
    expect(w.spawns).toHaveLength(2);
    expect(w.portals.map((p) => p.to)).toEqual(["forest-proof"]);
    expect(Object.keys(w.starts).sort()).toEqual(["from_floresta", "player"]);
    // cerca-invisivel: retângulo 4..5 × 20 (camada collision, sem arte)
    expect(w.solid[20 * w.width + 4]).toBe(1);
    expect(w.solid[20 * w.width + 5]).toBe(1);
    expect(w.props.filter((p) => p.key.startsWith("fp4_tree_")).length).toBeGreaterThan(150);
  });

  it("brief inválido é recusado com mensagem clara", () => {
    expect(() => generateFromBrief({ ...brief, base: "lava" })).toThrow(/base 'lava'/);
    expect(() => generateFromBrief({ ...brief, starts: {} })).toThrow(/starts.player/);
  });
});
