// @vitest-environment jsdom
// Ficha holográfica + árvore de evolução com % (VIDEO_IDEAS_SPEC.md §3, P0), só no HUD v2 (?hud=v2).
import { afterEach, describe, expect, it } from "vitest";
import { forksAhead, pathStatuses } from "../src/sim/evolution";
import { statsAtLevel } from "@game/src/sim/formulas";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { evoTree, holoPanelHtml, missingText, pathPct, type HoloSubject } from "../src/ui/holo-card";
import { Hud, type HudScene } from "../src/ui/hud";

const content = loadWorldContent();
const known = (id: string) => !!content.species[id];

/** Uma espécie do content pack com 2+ caminhos (ramifica já no próximo estágio). */
const forkId = Object.keys(content.moves.paths).find((id) => known(id) && content.moves.paths[id].length >= 2)!;

function subject(speciesId: string, level = 3): HoloSubject {
  const sp = content.species[speciesId];
  const stats = statsAtLevel(sp.base, sp.growth, level);
  return { speciesId, name: sp.name, level, stats, hp: stats.hp, maxHp: stats.hp };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ficha holográfica — % do caminho (VIDEO_IDEAS_SPEC §3)", () => {
  it("% = média de min(have/need, 1) por requisito, truncada; elegível = 100; nunca 100 sem ser elegível", () => {
    const r = (stat: "level" | "atk", need: number, have: number) => ({ stat, need, have, ok: have >= need });
    // exemplo da spec: Nv.12/16 e ATK 40/55 → (0,75 + 0,727) / 2 = 73,8% → 73
    expect(pathPct({ reqs: [r("level", 16, 12), r("atk", 55, 40)], eligible: false })).toBe(73);
    // stat acima do mínimo não passa de 1 por requisito; elegível é sempre 100
    expect(pathPct({ reqs: [r("level", 10, 30), r("atk", 20, 99)], eligible: true })).toBe(100);
    // tudo cumprido mas alvo indisponível (eligible false): 99, não 100
    expect(pathPct({ reqs: [r("level", 10, 10)], eligible: false })).toBe(99);
    expect(pathPct({ reqs: [], eligible: false })).toBe(0);
  });

  it("a árvore usa só pathStatuses() para a % e forksAhead() para ramificar", () => {
    expect(forkId).toBeDefined();
    const s = subject(forkId);
    const t = evoTree(content, s);
    const cur = t.nodes.find((n) => n.state === "current")!;
    expect(cur.id).toBe(forkId);
    const next = t.nodes.filter((n) => n.depth === 1);
    const st = pathStatuses(content.moves, forkId, s.level, s.stats, known);
    expect(next.map((n) => n.id)).toEqual(st.map((x) => x.path.to));
    for (const n of next) expect(n.pct).toBe(pathPct(st.find((x) => x.path.to === n.id)!));
    const forks = new Set(forksAhead(content.moves, forkId, 4));
    for (const n of t.nodes.filter((n) => n.state !== "past")) expect(n.fork).toBe(forks.has(n.id));
    // ramifica: os filhos ficam em linhas diferentes e o pai no meio deles
    const rows = next.map((n) => n.row);
    expect(new Set(rows).size).toBe(rows.length);
    expect(cur.row).toBeCloseTo(rows.reduce((a, b) => a + b, 0) / rows.length);
  });

  it("o que falta está escrito no próprio nó (REQ_PT) e o nó elegível fica em 100% dourado", () => {
    const s = subject(forkId, 1);
    const html = holoPanelHtml(content, s, "tree");
    const div = document.createElement("div");
    div.innerHTML = html;
    const st = pathStatuses(content.moves, forkId, s.level, s.stats, known);
    for (const x of st) {
      const node = div.querySelector<HTMLElement>(`.hc-node[data-node="${x.path.to}"]`)!;
      expect(node.dataset.pct).toBe(String(pathPct(x)));
      if (!x.eligible && known(x.path.to)) expect(node.querySelector('[data-testid="hc-miss"]')!.textContent).toContain(missingText(x.reqs));
    }
    // nível alto o bastante para algum caminho abrir
    const hi = subject(forkId, 60);
    div.innerHTML = holoPanelHtml(content, hi, "tree");
    const ok = div.querySelector<HTMLElement>(".hc-node.ok");
    if (ok) expect(ok.dataset.pct).toBe("100");
  });

  it("aba Ficha: anel de scanner, stats, afinidades e atalho para a árvore", () => {
    const div = document.createElement("div");
    div.innerHTML = holoPanelHtml(content, subject(forkId), "card");
    expect(div.querySelector('[data-testid="hc-scan"] canvas[data-species]')).not.toBeNull();
    expect(div.querySelectorAll(".hc-stats tr")).toHaveLength(4);
    expect(div.querySelector('[data-testid="hc-aff"]')).not.toBeNull();
    expect(div.querySelector<HTMLElement>('[data-testid="hc-next"]')!.dataset.hcTab).toBe("tree");
    expect(holoPanelHtml(content, undefined, "card")).toContain("Sem parceiro");
  });
});

describe("ficha holográfica — no HUD", () => {
  const scene: HudScene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: 12 };
  const partner = { id: "p1:partner", kind: "partner" as const, speciesId: forkId, ownerId: "p1", name: "Parceiro", x: 0, y: 0, facing: "S" as const, state: "IDLE" as const, hp: 30, maxHp: 30, level: 3 };
  const mount = (variant: "v1" | "v2") => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const hud = new Hud(root, content, "p1", { onAuto() {}, onFlee() {} }, false, { scene, variant });
    hud.updatePartner(partner, 0, 10, 0);
    return { root, hud };
  };

  it("v2: o retrato do parceiro abre a ficha; a aba Evolução troca para a árvore", () => {
    const { root, hud } = mount("v2");
    root.querySelector<HTMLElement>('[data-testid="partner"]')!.click();
    expect(hud.holo!.isOpen).toBe(true);
    const body = root.querySelector<HTMLElement>('[data-panel="holo"]')!;
    expect(body.querySelector('[data-testid="hc-card"]')).not.toBeNull();
    body.querySelector<HTMLElement>('[data-testid="hc-tab-tree"]')!.click();
    expect(body.querySelector('[data-testid="hc-tree"]')).not.toBeNull();
    expect(body.querySelectorAll(".hc-node").length).toBeGreaterThan(2);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(hud.holo!.isOpen).toBe(false);
  });

  it("sem a flag não existe ficha nem retrato clicável", () => {
    const { root, hud } = mount("v1");
    expect(hud.holo).toBeUndefined();
    expect(root.querySelector('[data-panel="holo"]')).toBeNull();
    expect(root.querySelector(".opens-holo")).toBeNull();
  });
});
