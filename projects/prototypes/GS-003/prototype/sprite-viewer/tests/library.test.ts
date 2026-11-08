// Lado servidor: varredura das raízes, proteção de caminho e gravação de status no creature.json.
// Usa cópias temporárias das fixtures (não altera fixtures/ nem GAME-ASSETS/).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyReview, pngSize, safeResolve, scanLibrary, type RootDef } from "../server/library";
import { normalizeItem } from "../src/manifest";

const FIXTURES = path.resolve(__dirname, "../fixtures/GAME-ASSETS-sample");
const PMD = path.resolve(__dirname, "../../../art/sprites/pmd");
let tmp: string;
let roots: RootDef[];

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "gs003-viewer-"));
  fs.cpSync(FIXTURES, path.join(tmp, "assets"), { recursive: true });
  roots = [
    { key: "assets", path: path.join(tmp, "assets"), editable: true, kind: "assets" },
    { key: "ro", path: path.join(tmp, "assets"), editable: false, kind: "assets" },
    { key: "pmd", path: PMD, editable: false, kind: "pmd" },
  ];
});
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe("scanLibrary", () => {
  it("acha creature.json das fixtures, versões PMD internas e pastas PMD", () => {
    const lib = scanLibrary(roots.filter((r) => r.key !== "ro"), { provisionalSchemaPath: path.resolve(__dirname, "../schema/creature.schema.provisional.json") });
    const creatures = lib.items.filter((i) => i.kind === "creature").map((i) => i.dir).sort();
    expect(creatures).toEqual(["01-creatures/original/CREATURE-TEST-0001", "01-creatures/original/CREATURE-TEST-0002", "01-creatures/original/CREATURE-TEST-0003"]);
    expect(lib.schema?.provisional).toBe(true);
    const t2 = lib.items.find((i) => i.dir.endsWith("0002"))!;
    expect(t2.pmd?.[0]).toMatchObject({ versionId: "pmd-v1", baseUrl: "/fs/assets/01-creatures/original/CREATURE-TEST-0002/spritesheets/pmd-v1/" });
    expect(lib.sheetSizes.assets["01-creatures/original/CREATURE-TEST-0001/spritesheets/v2/idle.png"]).toEqual({ w: 128, h: 96 });
    if (fs.existsSync(path.join(PMD, "agumon/AnimData.xml"))) {
      const ag = lib.items.find((i) => i.kind === "pmd" && i.dir === "agumon")!;
      expect(ag.pmd?.[0].sheetSizes["Idle-Anim.png"]).toEqual({ w: 128, h: 320 });
    }
  });

  it("fixtures normalizam: 0001 e 0002 válidas, 0003 com erros esperados", () => {
    const lib = scanLibrary(roots.slice(0, 1));
    const views = lib.items.map((it) => normalizeItem(it, { fileUrl: (r, p) => `/fs/${r}/${p}`, sheetSizes: lib.sheetSizes[it.root] }));
    const byId = Object.fromEntries(views.map((v) => [v.id, v]));
    expect(byId["CREATURE-TEST-0001"].errors).toEqual([]);
    expect(byId["CREATURE-TEST-0001"].versions.map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(byId["CREATURE-TEST-0002"].errors).toEqual([]);
    expect(byId["CREATURE-TEST-0002"].versions[0].anims.map((a) => a.name)).toEqual(["Idle", "Walk", "Attack", "Charge"]);
    expect(byId["CREATURE-TEST-0003"].errors.join("\n")).toMatch(/status inválido[\s\S]*license.tier inválido[\s\S]*sai da pasta/);
  });

  it("raiz inexistente é ignorada", () => {
    expect(scanLibrary([{ key: "x", path: path.join(tmp, "nada"), editable: true, kind: "assets" }]).items).toEqual([]);
  });
});

describe("safeResolve", () => {
  it("bloqueia fuga da raiz", () => {
    const r = path.join(tmp, "assets");
    expect(safeResolve(r, "01-creatures/original")).toBe(path.join(r, "01-creatures/original"));
    expect(safeResolve(r, "../../etc/passwd")).toBe(path.join(r, "etc/passwd")); // clamp na raiz
    expect(safeResolve(r, "%2e%2e/%2e%2e/x")).toBe(path.join(r, "x"));
    fs.symlinkSync(os.tmpdir(), path.join(r, "link"));
    expect(safeResolve(r, "link")).toBeUndefined();
  });
});

describe("pngSize", () => {
  it("lê o IHDR; arquivo não-PNG devolve undefined", () => {
    const f = path.join(tmp, "assets/01-creatures/original/CREATURE-TEST-0001/spritesheets/v2/attack.png");
    expect(pngSize(f)).toEqual({ w: 96, h: 96 });
    expect(pngSize(path.join(tmp, "assets/01-creatures/original/CREATURE-TEST-0001/creature.json"))).toBeUndefined();
  });
});

describe("applyReview", () => {
  const dir = "01-creatures/original/CREATURE-TEST-0001";
  const read = () => JSON.parse(fs.readFileSync(path.join(tmp, "assets", dir, "creature.json"), "utf8"));

  it("grava status e acrescenta histórico, preservando os demais campos", () => {
    const before = read();
    applyReview(roots, { root: "assets", dir, status: "APPROVED", by: "fundador", note: "ok" }, new Date("2026-11-08T19:00:00Z"));
    applyReview(roots, { root: "assets", dir, status: "REJECTED" }, new Date("2026-11-08T19:05:00Z"));
    const after = read();
    expect(after.status).toBe("REJECTED");
    expect(after.review).toEqual([
      { status: "APPROVED", at: "2026-11-08T19:00:00.000Z", by: "fundador", note: "ok" },
      { status: "REJECTED", at: "2026-11-08T19:05:00.000Z" },
    ]);
    const { status: _s, review: _r, ...restA } = after;
    const { status: _s2, review: _r2, ...restB } = before;
    expect(restA).toEqual(restB);
    expect(fs.readdirSync(path.join(tmp, "assets", dir)).filter((f) => f.includes(".tmp-"))).toEqual([]);
  });

  it("recusa status inválido, raiz só leitura/desconhecida/PMD e caminho fora", () => {
    expect(() => applyReview(roots, { root: "assets", dir, status: "LIBERADO" })).toThrow(/status inválido/);
    expect(() => applyReview(roots, { root: "ro", dir, status: "APPROVED" })).toThrow(/somente leitura/);
    expect(() => applyReview(roots, { root: "zzz", dir, status: "APPROVED" })).toThrow(/raiz desconhecida/);
    expect(() => applyReview(roots, { root: "pmd", dir: "agumon", status: "APPROVED" })).toThrow(/raiz desconhecida/);
    expect(() => applyReview(roots, { root: "assets", dir: "../../", status: "APPROVED" })).toThrow(/não encontrado/);
    expect(read().status).toBe("UNDER_REVIEW");
  });
});
