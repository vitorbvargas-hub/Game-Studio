import { describe, expect, it } from "vitest";
import { applyFilters, joinRel, normalizeItem, normalizeStatus } from "../src/manifest";
import { frameAt, frameStartMs } from "../src/player";
import type { LibraryItem } from "../src/types";

const fileUrl = (root: string, rel: string) => `/fs/${root}/${rel}`;
const DIR = "01-creatures/original/C1";
const sizes = { [`${DIR}/sheets/idle.png`]: { w: 128, h: 96 }, [`${DIR}/sheets/atk.png`]: { w: 96, h: 32 } };

function manifest(over: Record<string, unknown> = {}) {
  return {
    id: "CREATURE-0001",
    name: "Teste",
    category: "starter",
    rarity: "common",
    status: "UNDER_REVIEW",
    license: { tier: "original", spdx: "CC0-1.0" },
    anchors: { feet: { x: 16, y: 30 } },
    versions: [
      {
        id: "v1",
        animations: {
          idle: { sheet: "sheets/idle.png", frameWidth: 32, frameHeight: 32, fps: 4, directions: ["S", "E", "N"], mirror: { W: "E" } },
          walk: { sheet: "sheets/idle.png", frameWidth: 32, frameHeight: 32, fps: 8 },
          attack: { sheet: "sheets/atk.png", frameWidth: 32, frameHeight: 32, durationsMs: [100, 200, 100], loop: false, events: [{ frame: 1, name: "hit" }] },
        },
      },
    ],
    ...over,
  };
}
const item = (m: unknown, extra: Partial<LibraryItem> = {}): LibraryItem => ({ root: "assets", dir: DIR, kind: "creature", editable: true, manifest: m, ...extra });
const norm = (m: unknown, extra: Partial<LibraryItem> = {}) => normalizeItem(item(m, extra), { fileUrl, sheetSizes: sizes });

describe("normalizeItem (creature.json)", () => {
  it("manifest válido: sem erros, campos e versões normalizados", () => {
    const c = norm(manifest());
    expect(c.errors).toEqual([]);
    expect(c).toMatchObject({ key: `assets:${DIR}`, id: "CREATURE-0001", status: "UNDER_REVIEW", editable: true, currentVersion: "v1" });
    expect(c.license).toMatchObject({ tier: "original", spdx: "CC0-1.0" });
    const idle = c.versions[0].anims.find((a) => a.name === "idle")!;
    expect(idle.directions).toEqual(["S", "E", "N", "W"]);
    expect(idle.frames.S).toHaveLength(4); // 128 / 32 da folha real
    expect(idle.frames.N![2]).toMatchObject({ image: `/fs/assets/${DIR}/sheets/idle.png`, sx: 64, sy: 64, flipX: false, durationMs: 250 });
    expect(idle.frames.W![0]).toMatchObject({ sy: 32, flipX: true });
    const atk = c.versions[0].anims.find((a) => a.name === "attack")!;
    expect(atk.loop).toBe(false);
    expect(atk.frames.S!.map((f) => f.durationMs)).toEqual([100, 200, 100]);
    expect(atk.events).toEqual([{ frame: 1, name: "hit" }]);
  });

  it("atalho `animations` vira versão única 'current'", () => {
    const m = manifest({ versions: undefined, animations: manifest().versions[0].animations });
    const c = norm(m);
    expect(c.versions.map((v) => v.id)).toEqual(["current"]);
    expect(c.errors).toEqual([]);
  });

  it("status em minúsculas é aceito com aviso; inválido vira erro", () => {
    expect(normalizeStatus("approved")).toBe("APPROVED");
    expect(normalizeStatus("under-review")).toBe("UNDER_REVIEW");
    expect(normalizeStatus("ok")).toBeUndefined();
    expect(norm(manifest({ status: "approved" })).warnings.join()).toMatch(/normalizado/);
    const bad = norm(manifest({ status: "ótimo" }));
    expect(bad.status).toBe("UNKNOWN");
    expect(bad.errors.join()).toMatch(/status inválido/);
  });

  it("acusa campos obrigatórios, licença e score inválidos", () => {
    const c = norm({ status: "APPROVED", license: { tier: "grátis" }, score: 120, versions: [] });
    const e = c.errors.join("\n");
    expect(e).toMatch(/id ausente/);
    expect(e).toMatch(/name ausente/);
    expect(e).toMatch(/license.tier inválido/);
    expect(e).toMatch(/score fora/);
    expect(e).toMatch(/nenhuma versão/);
    expect(norm(manifest({ license: undefined })).errors.join()).toMatch(/license ausente/);
  });

  it("recusa folha fora da pasta da criatura e dados de animação inconsistentes", () => {
    const m = manifest();
    const anims = m.versions[0].animations as Record<string, unknown>;
    anims.idle = { sheet: "../../../../etc/x.png", frameWidth: 32, frameHeight: 32 };
    anims.walk = { sheet: "sheets/idle.png", frameWidth: 32, frameHeight: 32, frames: 9 };
    anims.attack = { sheet: "sheets/atk.png", frameWidth: 32, frameHeight: 32, durationsMs: [100], directions: ["X"], events: [{ frame: 7, name: "hit" }] };
    const e = norm(m).errors.join("\n");
    expect(e).toMatch(/sai da pasta/);
    expect(e).toMatch(/9 quadros de 32px não cabem/);
    expect(e).toMatch(/durationsMs: precisa de 3/);
    expect(e).toMatch(/directions: "X" inválida/);
    expect(e).toMatch(/events: evento inválido/);
  });

  it("versões duplicadas, currentVersion inexistente e falta de P0 são apontadas", () => {
    const v = manifest().versions[0];
    const c = norm(manifest({ versions: [v, v], currentVersion: "v9" }));
    expect(c.errors.join()).toMatch(/duplicado v1/);
    expect(c.errors.join()).toMatch(/currentVersion "v9"/);
    const noWalk = manifest();
    delete (noWalk.versions[0].animations as Record<string, unknown>).walk;
    expect(norm(noWalk).warnings.join()).toMatch(/P0 "walk"/);
  });

  it("versão format=pmd usa o AnimData fornecido pelo servidor", () => {
    const xml = "<AnimData><Anims><Anim><Name>Idle</Name><FrameWidth>16</FrameWidth><FrameHeight>16</FrameHeight><Durations><Duration>6</Duration><Duration>6</Duration></Durations></Anim></Anims></AnimData>";
    const m = manifest({ versions: [...manifest().versions, { id: "pmd-v1", format: "pmd", path: "pmd" }] });
    const c = norm(m, { pmd: [{ versionId: "pmd-v1", baseUrl: "/fs/assets/x/", animDataXml: xml, sheetSizes: { "Idle-Anim.png": { w: 32, h: 128 } } }] });
    expect(c.errors).toEqual([]);
    expect(c.versions.map((v) => `${v.id}:${v.format}`)).toEqual(["v1:grid", "pmd-v1:pmd"]);
    expect(c.currentVersion).toBe("pmd-v1");
    const missing = norm(m);
    expect(missing.errors.join()).toMatch(/AnimData.xml não encontrado/);
  });

  it("JSON quebrado não derruba a galeria", () => {
    const c = normalizeItem(item(undefined, { parseError: "Unexpected token" }), { fileUrl });
    expect(c.errors[0]).toMatch(/creature.json inválido/);
    expect(c.status).toBe("UNKNOWN");
  });

  it("pasta PMD sem creature.json é somente leitura", () => {
    const xml = "<AnimData><Anims><Anim><Name>Idle</Name><FrameWidth>16</FrameWidth><FrameHeight>16</FrameHeight><Durations><Duration>6</Duration></Durations></Anim></Anims></AnimData>";
    const c = normalizeItem({ root: "pmd", dir: "agumon", kind: "pmd", editable: false, pmd: [{ versionId: "pmd", baseUrl: "/", animDataXml: xml, sheetSizes: { "Idle-Anim.png": { w: 16, h: 128 } } }] }, { fileUrl });
    expect(c.editable).toBe(false);
    expect(c.category).toBe("pmd-reference");
    expect(c.versions).toHaveLength(1);
  });
});

describe("joinRel", () => {
  it("resolve dentro da pasta e recusa fuga", () => {
    expect(joinRel("a/b", "x/../y.png")).toBe("a/b/y.png");
    expect(joinRel("a/b", "../c.png")).toBeUndefined();
    expect(joinRel("a/b", "/etc/passwd")).toBeUndefined();
    expect(joinRel("a/b", "http://x/y.png")).toBeUndefined();
  });
});

describe("applyFilters", () => {
  it("filtra por categoria, raridade, status, fonte e texto", () => {
    const a = norm(manifest());
    const b = norm(manifest({ id: "CREATURE-0002", name: "Outro", category: "advanced", rarity: "rare", status: "APPROVED" }));
    const list = [a, b];
    expect(applyFilters(list, { category: "advanced" })).toEqual([b]);
    expect(applyFilters(list, { rarity: "common" })).toEqual([a]);
    expect(applyFilters(list, { status: "APPROVED" })).toEqual([b]);
    expect(applyFilters(list, { text: "outro" })).toEqual([b]);
    expect(applyFilters(list, { root: "pmd" })).toEqual([]);
    expect(applyFilters(list, {})).toHaveLength(2);
  });
});

describe("player", () => {
  it("frameAt com durações variáveis, loop e uma passada", () => {
    const d = [100, 50, 50];
    expect([0, 99, 100, 149, 150, 199].map((t) => frameAt(d, t, true))).toEqual([0, 0, 1, 1, 2, 2]);
    expect(frameAt(d, 200, true)).toBe(0);
    expect(frameAt(d, 1000, false)).toBe(2);
    expect(frameAt([], 10, true)).toBe(0);
    expect(frameStartMs(d, 2)).toBe(150);
  });
});
