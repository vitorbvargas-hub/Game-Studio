// Schema oficial (GAME-ASSETS/07-manifests/creature.schema.json): creature.json + license.json + atlas JSON Hash.
// 1) Cópia temporária de uma criatura sintética no formato oficial (review grava approvalStatus).
// 2) As 4 linhas piloto reais em GAME-ASSETS (DW DS, official-fan-use) abrem sem erro — pulado se a pasta não existir.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyReview, scanLibrary, type RootDef } from "../server/library";
import { isOfficialManifest, normalizeItem } from "../src/manifest";
import { ROOTS } from "../vite.config";

const fileUrl = (r: string, p: string) => `/fs/${r}/${p}`;
const ASSETS = path.resolve(__dirname, "../../../../../../assets/GAME-ASSETS");
const PILOT = ["Gigimon", "Guilmon", "Growlmon", "Koromon", "Agumon", "Greymon", "Tsunomon", "Gabumon", "Garurumon", "Tokomon", "Patamon", "Angemon"];

const manifest = {
  id: "CREATURE-9001",
  name: "Oficial de Teste",
  category: "digital-creature",
  rarity: "common",
  element: "data",
  evolutionStage: "rookie",
  evolutionLine: { lineId: "teste", previous: null, next: [] },
  dimensions: { frameW: 10, frameH: 12, tile: 32 },
  pivot: { x: 5, y: 11 },
  hitbox: { x: 1, y: 1, w: 8, h: 10 },
  anchors: { head: { x: 5, y: 1 }, hit: { x: 5, y: 6 }, shadow: { cx: 5, cy: 11, rx: 3, ry: 1 } },
  directions: { idle: { drawn: ["SW", "S"], mirrored: { SE: "SW" } } },
  animations: {
    idle: { loop: true, fps: 4, frames: [{ durationMs: 250, atlasKey: "T_idle_SW_00.png" }, { durationMs: 300, atlasKey: "T_idle_SW_01.png" }], events: [] },
  },
  combatStates: { IDLE: "idle", WALK: "idle", FOLLOW: "idle", ENGAGE: "idle", ATTACK: "idle", HURT: "idle", DEFEAT: "idle", RETURN: "idle" },
  sprites: "./sprites/",
  spritesheets: "./spritesheets/",
  assetOrigin: { layer: "official-fan-use", sourceDescription: "teste" },
  approvalStatus: "UNDER_REVIEW",
};
const cell = (x: number, y: number) => ({ frame: { x, y, w: 10, h: 12 }, sourceSize: { w: 10, h: 12 }, pivot: { x: 0.5, y: 0.92 } });
const atlas = {
  frames: { "T_idle_SW_00.png": cell(0, 0), "T_idle_SW_01.png": cell(11, 0), "T_idle_S_00.png": cell(0, 13), "T_idle_S_01.png": cell(11, 13) },
  meta: { image: "T.png", size: { w: 21, h: 25 } },
};

let tmp: string;
let roots: RootDef[];
const dir = "01-creatures/CREATURE-9001";
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gs003-official-"));
  const d = path.join(tmp, dir);
  fs.mkdirSync(path.join(d, "spritesheets"), { recursive: true });
  fs.writeFileSync(path.join(d, "creature.json"), JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(path.join(d, "license.json"), JSON.stringify({ layer: "official-fan-use", credit: { ripper: "R", preservedBy: "P" }, source: { fileUrl: "https://example.invalid/x.gif" }, copyright: "© dono" }));
  fs.writeFileSync(path.join(d, "spritesheets/T.atlas.json"), JSON.stringify(atlas));
  roots = [{ key: "assets", path: tmp, editable: true, kind: "assets" }];
});
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("schema oficial", () => {
  it("detecta o formato e monta quadros pelo atlas, com direções desenhadas e espelhadas", () => {
    expect(isOfficialManifest(manifest)).toBe(true);
    const lib = scanLibrary(roots);
    expect(Object.keys(lib.items[0].atlases ?? {})).toEqual([`${dir}/spritesheets/T.atlas.json`]);
    const v = normalizeItem(lib.items[0], { fileUrl });
    expect(v.errors).toEqual([]);
    expect(v).toMatchObject({ id: "CREATURE-9001", status: "UNDER_REVIEW", stage: "rookie", evolutionLine: "teste" });
    expect(v.license).toMatchObject({ tier: "official-fan-use", author: "R · P", url: "https://example.invalid/x.gif", file: "license.json", notes: "© dono" });
    expect(v.anchors).toMatchObject({ feet: { x: 5, y: 11 }, shadow: { x: 5, y: 11 } });
    const idle = v.versions[0].anims[0];
    expect(idle.directions).toEqual(["S", "SE", "SW"]);
    expect(idle.origin).toEqual({ x: 5, y: 11 });
    expect(idle.frames.SW).toEqual([
      { image: `/fs/assets/${dir}/spritesheets/T.png`, sx: 0, sy: 0, sw: 10, sh: 12, flipX: false, durationMs: 250 },
      { image: `/fs/assets/${dir}/spritesheets/T.png`, sx: 11, sy: 0, sw: 10, sh: 12, flipX: false, durationMs: 300 },
    ]);
    expect(idle.frames.S?.[1]).toMatchObject({ sx: 11, sy: 13 });
    expect(idle.frames.SE?.every((f) => f.flipX)).toBe(true);
    expect(v.warnings).toEqual(['sem animação P0 "walk"']);
  });

  it("atlasKey ausente vira erro sem derrubar o item", () => {
    const d = path.join(tmp, dir, "creature.json");
    fs.writeFileSync(d, JSON.stringify({ ...manifest, animations: { idle: { loop: true, frames: [{ durationMs: 100, atlasKey: "nao_existe.png" }] } } }));
    const v = normalizeItem(scanLibrary(roots).items[0], { fileUrl });
    expect(v.errors.join("\n")).toMatch(/nao_existe\.png.*não está no atlas/);
  });

  it("review grava approvalStatus (não cria `status`)", () => {
    applyReview(roots, { root: "assets", dir, status: "APPROVED", by: "fundador" }, new Date("2026-11-08T20:00:00Z"));
    const j = JSON.parse(fs.readFileSync(path.join(tmp, dir, "creature.json"), "utf8"));
    expect(j.approvalStatus).toBe("APPROVED");
    expect(j.status).toBeUndefined();
    expect(j.review).toEqual([{ status: "APPROVED", at: "2026-11-08T20:00:00.000Z", by: "fundador" }]);
  });
});

describe("galeria padrão", () => {
  it("não inclui as fixtures geométricas", () => {
    expect(ROOTS.map((r) => r.key)).not.toContain("fixtures");
    expect(ROOTS[0].key).toBe("assets");
  });

  it.skipIf(!fs.existsSync(path.join(ASSETS, "01-creatures/CREATURE-0006/creature.json")))(
    "as 12 criaturas das linhas piloto (DW DS) abrem sem erro, com idle animado",
    () => {
      const lib = scanLibrary([{ key: "assets", path: ASSETS, editable: false, kind: "assets" }]);
      const views = lib.items.map((it) => normalizeItem(it, { fileUrl, sheetSizes: lib.sheetSizes[it.root] }));
      const pilot = views.filter((v) => PILOT.includes(v.name));
      expect(pilot.map((v) => v.name).sort()).toEqual([...PILOT].sort());
      for (const v of pilot) {
        expect(v.errors, v.name).toEqual([]);
        expect(v.status).toBe("UNDER_REVIEW");
        expect(v.license.tier).toBe("official-fan-use");
        expect(v.license.author).toMatch(/AngelOfHope/);
        const idle = v.versions[0].anims.find((a) => a.name === "idle")!;
        expect(idle.directions.length).toBeGreaterThan(0);
        const frames = idle.frames[idle.directions[0]]!;
        expect(frames).toHaveLength(4);
        const size = lib.sheetSizes.assets[frames[0].image.replace("/fs/assets/", "")];
        expect(size, `${v.name}: folha`).toBeDefined();
        for (const f of frames) expect(f.sx + f.sw).toBeLessThanOrEqual(size.w);
      }
    },
  );
});
