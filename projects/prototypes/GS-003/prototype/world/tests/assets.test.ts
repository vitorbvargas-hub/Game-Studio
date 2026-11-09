import { describe, expect, it } from "vitest";
import { buildCreatureCatalog, loadCreatureCatalog } from "../src/assets/creatures";
import { buildTileSources, loadTileSources } from "../src/assets/tiles";
import { loadWorldContent } from "../src/sim/species";
import { loadTestMap } from "../src/sim/setup";

describe("criaturas (GAME-ASSETS/01-creatures)", () => {
  const cat = loadCreatureCatalog();

  it("carrega CREATURE-0002..0013 com atlas e folha (ou PNGs por quadro, criatura em produção)", () => {
    for (let i = 2; i <= 13; i++) {
      const id = `CREATURE-${String(i).padStart(4, "0")}`;
      expect(cat[id], id).toBeDefined();
      expect(cat[id].sheetUrl).toMatch(/\.png/);
    }
  });

  it("todo frame de animação aponta para um retângulo existente no atlas e o pivô cai dentro do frame", () => {
    for (const c of Object.values(cat)) {
      const m = c.manifest;
      expect(m.pivot.x).toBeGreaterThanOrEqual(0);
      expect(m.pivot.x).toBeLessThanOrEqual(m.dimensions.frameW);
      expect(m.pivot.y).toBeLessThanOrEqual(m.dimensions.frameH);
      for (const a of Object.values(m.animations)) for (const f of a.frames) expect(c.atlas.frames[f.atlasKey!], `${m.id} ${f.atlasKey}`).toBeDefined();
    }
  });

  it("toda espécie da sim tem visual, e vice-versa (ids coincidem por convenção); SP-* = ramo ainda sem arte", () => {
    const content = loadWorldContent();
    for (const id of Object.keys(content.species)) if (!id.startsWith("SP-")) expect(cat[id], id).toBeDefined();
    // espécies sem arte só existem como ramo alternativo de evolução (placeholder no mapa e "?" na prévia)
    const branchTargets = new Set(Object.values(content.moves.paths).flat().map((p) => p.to));
    for (const id of Object.keys(content.species).filter((x) => x.startsWith("SP-"))) {
      expect(cat[id], id).toBeUndefined();
      expect(branchTargets.has(id), id).toBe(true);
    }
  });

  it("buildCreatureCatalog ignora criaturas sem folha (ex. piloto sem spritesheet)", () => {
    const out = buildCreatureCatalog({ "/a/CREATURE-9/creature.json": { id: "CREATURE-9" } }, {}, {});
    expect(out).toEqual({});
  });
});

describe("tiles (GAME-ASSETS/03-environments) e mapa", () => {
  it("chave = nome do PNG; tileset.json opcional recorta folhas", () => {
    const src = buildTileSources(
      { "/x/grass/tiles/grass_00.png": "u1", "/x/props/sheet.png": "u2" },
      { "/x/props/tileset.json": { tiles: { tree_x: { image: "sheet.png", rect: [0, 0, 32, 48], pivot: [16, 47] } } } },
    );
    expect(src.grass_00).toEqual({ url: "u1" });
    expect(src.tree_x).toEqual({ url: "u2", rect: [0, 0, 32, 48], pivot: [16, 47] });
  });

  it("mapa de teste: parse do Tiled JSON, spawns, inícios e colisão", () => {
    const map = loadTestMap();
    expect(map.tileSize).toBe(32);
    expect(map.tileLayers[0].keys).toHaveLength(map.width * map.height);
    expect(map.spawns.length).toBeGreaterThanOrEqual(4);
    expect(map.starts.player).toBeDefined();
    expect(map.starts.bot).toBeDefined();
    const solid = (v: { x: number; y: number }) => map.solid[Math.floor(v.y / 16) * map.width + Math.floor(v.x / 16)];
    expect(solid(map.starts.player)).toBe(0);
    expect(solid(map.starts.bot)).toBe(0);
    expect(map.solid.some((s) => s === 1)).toBe(true);
  });

  it("toda chave visual do mapa tem PNG real carregável hoje (os placeholders ficam como fallback)", () => {
    const map = loadTestMap();
    const tiles = loadTileSources();
    const keys = new Set([...map.tileLayers.flatMap((l) => l.keys.filter(Boolean)), ...map.props.map((p) => p.key)]);
    const missing = [...keys].filter((k) => !tiles[k]);
    expect(missing).toEqual([]);
  });
});
