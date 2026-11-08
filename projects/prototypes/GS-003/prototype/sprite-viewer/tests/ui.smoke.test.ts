// @vitest-environment jsdom
// Smoke test da UI sem navegador: monta index.html, responde /api/library com a varredura real das
// fixtures + PMD (server/library.ts) e exercita galeria, filtros, seleção, comparação e review.
// Canvas é stub (jsdom não desenha): verifica estrutura e fluxo, não pixels.

import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { scanLibrary, type RootDef } from "../server/library";

const ROOT = path.resolve(__dirname, "..");
const roots: RootDef[] = [
  { key: "fixtures", path: path.join(ROOT, "fixtures/GAME-ASSETS-sample"), editable: true, kind: "assets" },
  { key: "pmd", path: path.resolve(ROOT, "../../art/sprites/pmd"), editable: false, kind: "pmd" },
];
const posts: unknown[] = [];

beforeAll(async () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  document.body.innerHTML = html.slice(html.indexOf("<body>") + 6, html.indexOf("</body>"));
  const ctx = new Proxy({}, { get: () => () => undefined });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctx) as never;
  globalThis.requestAnimationFrame = vi.fn(() => 0);
  globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/review") {
      posts.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ error: "somente teste" }), { status: 400 });
    }
    return new Response(JSON.stringify(scanLibrary(roots, { provisionalSchemaPath: path.join(ROOT, "schema/creature.schema.provisional.json") })));
  }) as never;
  await import("../src/main");
  await vi.waitFor(() => expect(document.querySelectorAll(".card").length).toBeGreaterThan(0));
});

const cards = () => [...document.querySelectorAll<HTMLElement>(".card")];
const byText = (sel: string, t: string) => [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.textContent?.includes(t));

describe("sprite viewer (jsdom)", () => {
  it("galeria lista fixtures e PMD, com badge de schema provisório", () => {
    const names = cards().map((c) => c.querySelector(".name")!.textContent);
    expect(names).toContain("Blob de Teste (laranja)");
    if (fs.existsSync(path.join(roots[1].path, "agumon/AnimData.xml"))) expect(names).toContain("agumon");
    expect(document.querySelector("#schema-badge")!.textContent).toMatch(/PROVISÓRIO/);
    expect(cards().filter((c) => c.classList.contains("err"))).toHaveLength(1); // CREATURE-TEST-0003
  });

  it("filtros por status e categoria", () => {
    const st = document.querySelector<HTMLSelectElement>("#f-status")!;
    st.value = "UNDER_REVIEW";
    st.dispatchEvent(new Event("change"));
    expect(cards().map((c) => c.querySelector(".name")!.textContent)).toEqual(["Blob de Teste (laranja)"]);
    st.value = "";
    st.dispatchEvent(new Event("change"));
    const cat = document.querySelector<HTMLSelectElement>("#f-category")!;
    cat.value = "pmd-reference";
    cat.dispatchEvent(new Event("change"));
    expect(cards().every((c) => c.title.startsWith("pmd:"))).toBe(true);
    cat.value = "";
    cat.dispatchEvent(new Event("change"));
  });

  it("detalhe: animações, 8 direções, quadros, licença e comparação de versões", () => {
    byText(".card", "Blob de Teste (laranja)")!.click();
    const detail = document.querySelector("#detail")!;
    expect(detail.querySelector("h2")!.textContent).toBe("Blob de Teste (laranja)");
    const animOpts = [...detail.querySelectorAll<HTMLSelectElement>(".box select")[1].options].map((o) => o.value);
    expect(animOpts).toEqual(["idle", "walk", "attack", "hurt", "sleep"]);
    const enabledDirs = [...detail.querySelectorAll<HTMLButtonElement>(".dirs button")].filter((b) => !b.disabled).map((b) => b.textContent);
    expect(enabledDirs.sort()).toEqual(["E", "N", "S", "W"]);
    expect(detail.querySelectorAll(".frames .frame")).toHaveLength(4);
    expect(detail.textContent).toMatch(/camada\s*original/);
    const compare = byText("label", "comparar com")!.querySelector("input")!;
    compare.checked = true;
    compare.dispatchEvent(new Event("change"));
    expect(document.querySelectorAll(".stage canvas")).toHaveLength(2);
    expect(document.querySelector("#detail")!.textContent).toMatch(/B: v1/);
  });

  it("PMD agumon abre com 8 direções e evento de hit no Attack", () => {
    const card = cards().find((c) => c.title === "pmd:agumon");
    if (!card) return;
    card.click();
    const detail = document.querySelector("#detail")!;
    const sel = detail.querySelectorAll<HTMLSelectElement>(".box select")[1];
    sel.value = "Attack";
    sel.dispatchEvent(new Event("change"));
    expect([...document.querySelectorAll<HTMLButtonElement>(".dirs button")].filter((b) => !b.disabled)).toHaveLength(8);
    expect(document.querySelector(".frames")!.textContent).toMatch(/#1 · \d+ms · hit/);
    expect(byText("button", "Aprovar")).toBeUndefined(); // somente leitura
  });

  it("aprovar envia POST /api/review com status e nota", async () => {
    byText(".card", "Blob de Teste (laranja)")!.click();
    byText("button", "Aprovar")!.click();
    await vi.waitFor(() => expect(posts).toHaveLength(1));
    expect(posts[0]).toMatchObject({ root: "fixtures", dir: "01-creatures/original/CREATURE-TEST-0001", status: "APPROVED" });
  });
});
