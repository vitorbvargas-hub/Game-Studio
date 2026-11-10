// @vitest-environment jsdom
// P8 — HUD v2 (?hud=v2), itens P0 da spec (quality-overhaul/phase2/design/P8_HUD_V2_SPEC.md §9/§10).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import type { MoveType } from "../src/sim/types";
import { Hud, type HudScene } from "../src/ui/hud";
import { AFFINITY_V2, hpPct, hpTier, hudVariantOf, MOVE_KIND_V2, RARITY_V2, rarityColor, TAMER_PORTRAIT_CROP } from "../src/ui/hud-v2";
import type { MovesView } from "../src/ui/moves-ui";

const content = loadWorldContent();
const scene: HudScene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: 12 };
const partner = (hp: number, maxHp = 100, speciesId = "CREATURE-0003") => ({ id: "p1:partner", kind: "partner" as const, speciesId, ownerId: "p1", name: "Guilmon", x: 0, y: 0, facing: "S" as const, state: "IDLE" as const, hp, maxHp, level: 5 });

function mount(variant?: "v1" | "v2") {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const hud = new Hud(root, content, "p1", { onAuto() {}, onFlee() {} }, false, { scene, ...(variant ? { variant } : {}) });
  return { root, hud };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("P8 HUD v2 — flag e faixas", () => {
  it("?hud=v2 liga; qualquer outra coisa mantém o HUD atual", () => {
    expect(hudVariantOf(new URLSearchParams("hud=v2"))).toBe("v2");
    expect(hudVariantOf(new URLSearchParams(""))).toBe("v1");
    expect(hudVariantOf(new URLSearchParams("hud=V2"))).toBe("v1");
    expect(hudVariantOf(new URLSearchParams("hud=1"))).toBe("v1");
  });

  it("§2.1: limiares exatos ≥50 verde, 20–49 dourado, <20 vermelho", () => {
    expect([100, 50, 49, 20, 19, 0].map(hpTier)).toEqual(["ok", "ok", "warn", "warn", "crit", "crit"]);
    expect(hpTier(Number.NaN)).toBe("crit");
    // 49,9% não é 50%: o percentual é truncado antes da faixa (a borda não "promete" mais do que há)
    expect(hpTier(hpPct(499, 1000))).toBe("warn");
    expect(hpTier(hpPct(199, 1000))).toBe("crit");
    expect(hpPct(5, 0)).toBe(0);
  });

  it("§1.3: cores de raridade e atributo vêm dos tokens existentes", () => {
    expect(RARITY_V2).toEqual({ common: "#8b93b0", uncommon: "#63c74d", rare: "#2ce8f5", very_rare: "#e8b84a" });
    expect(rarityColor(undefined)).toBe(RARITY_V2.common);
    expect(rarityColor("lendario")).toBe(RARITY_V2.common);
    expect(Object.keys(AFFINITY_V2).sort()).toEqual(["data", "free", "vaccine", "virus"]);
    const css = readFileSync(join(__dirname, "../src/style.css"), "utf8");
    for (const c of ["#4a2f2a", "#2a3550", "#4a3f1f", "#3e2153", "#1f4a2f"]) expect(css).toContain(c);
    expect(Object.values(MOVE_KIND_V2).map((k) => k.bg)).toEqual(["#4a2f2a", "#2a3550", "#4a3f1f", "#3e2153", "#1f4a2f"]);
  });

  it("condição 1 do QA: retrato do Tamer NÃO é recortado ainda (placeholder parametrizável)", () => {
    expect(TAMER_PORTRAIT_CROP).toBeNull();
  });
});

describe("P8 HUD v2 — DOM", () => {
  it("sem a flag: nenhum bloco/classe do v2 entra (HUD atual intacto)", () => {
    const { root, hud } = mount();
    hud.updatePartner(partner(10), 0, 10, 0);
    hud.updateTamer({ name: "Kaio", level: 12, hp: 1, maxHp: 100, energy: 1, maxEnergy: 1 });
    expect(root.classList.contains("hud-v2")).toBe(false);
    expect(root.querySelector(".hud-tamer")).toBeNull();
    expect(root.querySelector(".f1")).toBeNull();
    expect(root.querySelector('[data-testid="partner"]')!.className).toBe("hud-partner");
    // Digivice Radial (HUD_IDENTITY_V3 Alt A): sem a flag o .hud-tr antigo fica e o hub não entra
    expect(root.querySelector(".hud-tr")).not.toBeNull();
    expect(root.querySelector(".dg, .dg-panel, [data-panel^='dg-']")).toBeNull();
    expect(hud.digivice).toBeUndefined();
    // kit circuit-kit-v1: só com a flag
    expect(root.style.getPropertyValue("--ck-panel")).toBe("");
    expect(root.dataset.kit).toBeUndefined();
  });

  it("§4.1/§10.2: bloco Tamer à esquerda do parceiro, com PV e Energia; moldura muda nos 3 limiares", () => {
    const { root, hud } = mount("v2");
    expect(root.classList.contains("hud-v2")).toBe(true);
    const tamer = root.querySelector<HTMLElement>(".hud-tamer")!;
    expect(tamer.nextElementSibling).toBe(root.querySelector('[data-testid="partner"]'));
    expect(tamer.querySelector('[data-testid="tamer-portrait"]')).not.toBeNull();
    expect(tamer.querySelector(".tbar.hp")).not.toBeNull();
    expect(tamer.querySelector(".tbar.en")).not.toBeNull();
    expect(tamer.querySelector('[data-testid="tamer-name"]')!.textContent).toBe("Kaio");
    const seen: string[] = [];
    for (const hp of [100, 50, 49, 20, 19, 1]) {
      hud.updateTamer({ name: "Kaio", level: 13, hp, maxHp: 100, energy: 1, maxEnergy: 1 });
      seen.push(tamer.dataset.tier!);
      expect(tamer.querySelector<HTMLElement>('[data-testid="tamer-hp"]')!.style.width).toBe(`${hp}%`);
      expect(tamer.classList.contains(`tier-${tamer.dataset.tier}`)).toBe(true);
      expect(tamer.className.match(/tier-/g)).toHaveLength(1);
    }
    expect(seen).toEqual(["ok", "ok", "warn", "warn", "crit", "crit"]);
    expect(tamer.querySelector('[data-testid="tamer-lv"]')!.textContent).toBe("13");
  });

  it("§4.1/§10.2: parceiro em moldura nível 1 reativa + anel na cor do atributo", () => {
    const { root, hud } = mount("v2");
    const box = root.querySelector<HTMLElement>('[data-testid="partner"]')!;
    hud.updatePartner(partner(80), 0, 10, 0);
    expect(box.classList.contains("f1")).toBe(true);
    expect(box.dataset.tier).toBe("ok");
    hud.updatePartner(partner(30), 0, 10, 0);
    expect(box.dataset.tier).toBe("warn");
    hud.updatePartner(partner(10), 0, 10, 0);
    expect(box.dataset.tier).toBe("crit");
    // 3 atributos diferentes → 3 anéis diferentes, cada um igual ao do species json
    const byAff = new Map<string, string>();
    for (const [id, sp] of Object.entries(content.species)) if (!byAff.has(sp.affinity)) byAff.set(sp.affinity, id);
    expect(byAff.size).toBeGreaterThanOrEqual(3);
    const rings = new Set<string>();
    for (const [aff, id] of byAff) {
      hud.updatePartner(partner(80, 100, id), 0, 10, 0);
      expect(box.dataset.affinity).toBe(aff);
      expect(box.style.getPropertyValue("--ring")).toBe(AFFINITY_V2[aff] ?? AFFINITY_V2.free);
      rings.add(box.style.getPropertyValue("--ring"));
    }
    expect(rings.size).toBeGreaterThanOrEqual(3);
  });

  it("§4.4/§10.3: cada slot da hotbar pega a cor da categoria do golpe equipado", () => {
    const { root, hud } = mount("v2");
    const byKind = new Map<MoveType, string>();
    for (const m of Object.values(content.moves.moves)) if (!byKind.has(m.type)) byKind.set(m.type, m.id);
    const kinds = [...byKind.keys()].slice(0, 4);
    expect(kinds.length).toBeGreaterThanOrEqual(2);
    const moves = [0, 1, 2, 3].map((i) => (kinds[i] ? byKind.get(kinds[i])! : null));
    const view: MovesView = { id: "p1:partner", speciesId: "CREATURE-0003", name: "Guilmon", level: 5, mp: 50, maxMp: 50, learned: moves.filter(Boolean) as string[], moves, autoRules: [], cd: {}, inCombat: false };
    hud.updateMoves(view);
    const slots = [...root.querySelectorAll<HTMLElement>(".mv")];
    kinds.forEach((k, i) => {
      expect(slots[i].dataset.kind).toBe(k);
      expect(slots[i].style.getPropertyValue("--mk-border")).toBe(MOVE_KIND_V2[k].border);
    });
    const borders = new Set(kinds.map((_, i) => slots[i].style.getPropertyValue("--mk-border")));
    expect(borders.size).toBe(kinds.length);
    // trocar o golpe do slot troca a cor; esvaziar remove
    hud.updateMoves({ ...view, moves: [moves[1], moves[0], null, null] });
    expect(slots[0].dataset.kind).toBe(kinds[1]);
    expect(slots[2].dataset.kind).toBeUndefined();
    expect(slots[2].style.getPropertyValue("--mk-border")).toBe("");
  });
});

describe("P8 HUD v2 — CSS (§10.1)", () => {
  const css = readFileSync(join(__dirname, "../src/style.css"), "utf8");
  const start = css.indexOf("P8 — HUD v2");
  const block = css.slice(css.lastIndexOf("/*", start));
  const rules = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1].replace(/\/\*[\s\S]*?\*\//g, "").trim(), body: m[2] }));

  it("todo seletor do bloco v2 é escopado em .hud-v2 (sem a flag nada muda)", () => {
    const sels = rules.filter((r) => !/^(from|to|@keyframes)/.test(r.sel) && !r.sel.startsWith("@"));
    expect(sels.length).toBeGreaterThan(10);
    for (const r of sels) for (const s of r.sel.split(",")) expect(s.trim().startsWith(".hud-v2"), s).toBe(true);
  });

  it("nível 1 (combate) não usa border-radius: só cantos cortados por clip-path", () => {
    const f1 = rules.filter((r) => /\.f1\b|\.mv\b/.test(r.sel));
    expect(f1.some((r) => /clip-path:\s*var\(--chamfer\)/.test(r.body))).toBe(true);
    for (const r of f1) {
      const m = r.body.match(/border-radius:\s*([^;!]+)/);
      if (m) expect(m[1].trim()).toBe("0");
    }
    expect(block).toMatch(/--chamfer:\s*polygon\(4px 0/);
  });

  it("pulso do vermelho: 600 ms, opacidade 1,0 ↔ 0,6", () => {
    expect(block).toMatch(/tier-crit[\s\S]*?animation:\s*hudv2-crit 0\.6s/);
    expect(block).toMatch(/rgba\(228, 59, 68, 0\.6\)/);
  });
});
