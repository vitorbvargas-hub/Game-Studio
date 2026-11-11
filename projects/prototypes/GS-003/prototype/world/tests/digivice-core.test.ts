// @vitest-environment jsdom
// Digivice VI 1.0 — núcleo Tamer/Digimon (quality-overhaul/phase3/design/DIGIVICE_VI1_SPEC.md §2, §4, P0/P1).
import { afterEach, describe, expect, it } from "vitest";
import { statsAtLevel } from "@game/src/sim/formulas";
import { pathStatuses } from "../src/sim/evolution";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import { CORE_NAV, coreHtml, pendingHtml, TAMER_ATTRS, type CoreSection } from "../src/ui/digivice-core";
import { emptyDigivice, statValue } from "../src/ui/digivice";
import { pathPct } from "../src/ui/holo-card";
import { Hud, SHORTCUTS, type HudScene } from "../src/ui/hud";
import { readOnlyView } from "../src/ui/moves-ui";

const content = loadWorldContent();
const known = (id: string) => !!content.species[id];
const forkId = Object.keys(content.moves.paths).find((id) => known(id) && content.moves.paths[id].length >= 2)!;
const scene: HudScene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: 4, region: { name: "Floresta Densa", route: "Rota 1" } };
const T0 = new Date(2026, 10, 11, 10, 0, 0).getTime();

class MemStorage {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

const PENDING: CoreSection[] = ["tamer-powers", "tamer-talents", "mon-talents", "bond"];

function mount(level = 3, variant: "v1" | "v2" = "v2") {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const evolveTo: string[] = [];
  const dexState = { seen: [forkId], scans: { [forkId]: 40 }, captured: [] as string[] };
  const hud = new Hud(root, content, "p1", { onAuto() {}, onFlee() {}, onEvolveTo: (to) => evolveTo.push(to) }, false, {
    scene,
    variant,
    shortcuts: ["map", "dex", "inv", "quest", "gear", "arena"],
    digivice: { storage: new MemStorage(), now: () => T0 },
    dex: { state: () => dexState, paint: () => {} },
  });
  const sp = content.species[forkId];
  const stats = statsAtLevel(sp.base, sp.growth, level);
  hud.updatePartner({ id: "p1:partner", kind: "partner", speciesId: forkId, ownerId: "p1", name: "Parceiro", x: 0, y: 0, facing: "S", state: "IDLE", hp: stats.hp, maxHp: stats.hp, level } as never, 0, 10, 0);
  const v = { ...readOnlyView(content.moves, forkId, "Parceiro", level), id: "p1:partner", mp: 10, maxMp: 20, stats };
  hud.updateMoves(v);
  const body = () => root.querySelector<HTMLElement>('[data-panel="dvc"] .panel-body')!;
  const section = () => body().querySelector<HTMLElement>('[data-testid="dvc"]')?.dataset.section;
  return { root, hud, body, section, evolveTo, view: v };
}

const key = (k: string) => window.dispatchEvent(new KeyboardEvent("keydown", { key: k }));

afterEach(() => {
  document.body.innerHTML = "";
});

describe("núcleo do Digivice — estrutura (§4.1)", () => {
  it("12 seções do VI 1.0, sem nome repetido; 2 grupos (Tamer/Digimon) de 4 + 4 soltas", () => {
    expect(CORE_NAV).toHaveLength(12);
    expect(new Set(CORE_NAV.map((x) => x.id)).size).toBe(12);
    expect(CORE_NAV.filter((x) => x.group === "tamer").map((x) => x.label)).toEqual(["Perfil", "Atributos", "Poderes", "Árvore de talentos"]);
    expect(CORE_NAV.filter((x) => x.group === "digimon").map((x) => x.label)).toEqual(["Perfil", "Atributos", "Habilidades", "Árvore de talentos"]);
    expect(CORE_NAV.filter((x) => !x.group).map((x) => x.label)).toEqual(["Evolução", "Vínculo", "Banco de dados", "Registros e descobertas"]);
    expect(CORE_NAV.filter((x) => x.pending).map((x) => x.id)).toEqual(PENDING);
  });

  it("seções pendentes: aviso 'aguardando aprovação de regra', nenhuma barra/tabela/número inventado", () => {
    for (const id of PENDING) {
      const div = document.createElement("div");
      div.innerHTML = coreHtml(id, "<i class='dg-bar'>NÃO DEVE APARECER</i>");
      expect(div.querySelector('[data-testid="dvc-pending"]')!.textContent).toMatch(/Aguardando aprovação de regra/);
      expect(div.querySelector(".dg-bar, .hc-stats, .hc-ring, progress, input, [data-act]")).toBeNull();
      expect(div.textContent).not.toContain("NÃO DEVE APARECER");
      // nada de percentagem nem valor 0–100 fingindo que a mecânica existe
      expect(div.querySelector(".dvc-body")!.textContent).not.toMatch(/\d+\s*%|\b50\b/);
      expect(div.querySelector(`[data-core="${id}"]`)!.classList.contains("locked")).toBe(true);
    }
    expect(pendingHtml("bond")).toMatch(/caminho padrão nunca terá gate de vínculo/);
  });
});

describe("núcleo do Digivice — três portas, uma sala (§2.2)", () => {
  it("V → Banco de dados; retrato do parceiro → Digimon · Perfil; bloco do Tamer → Tamer · Perfil — o mesmo modal", () => {
    const { root, hud, section, body } = mount();
    key("v");
    expect(hud.coreOpen).toBe(true);
    expect(section()).toBe("db");
    expect(body().querySelector('[data-testid="dx-seen"]')).not.toBeNull();
    key("v");
    expect(hud.coreOpen).toBe(false);
    root.querySelector<HTMLElement>('[data-testid="partner"]')!.click();
    expect(section()).toBe("mon-profile");
    root.querySelector<HTMLElement>('[data-testid="tamer"]')!.click();
    expect(section()).toBe("tamer-profile");
    expect(root.querySelectorAll('[data-panel="dvc"]')).toHaveLength(1);
    // o botão "Digivice" (dex) da grade também cai no Banco de dados do núcleo
    hud.closeCore();
    root.querySelector<HTMLElement>('.hud-menu [data-short="dex"]')!.click();
    expect(hud.coreOpen).toBe(true);
    expect(section()).toBe("db");
  });

  it("Tamer · Perfil mostra exatamente hud.tamerProgress() (nome/nível/XP) pelas 3 portas", () => {
    const { root, hud, body } = mount();
    hud.setTamerProgress(7, 33);
    const { level, xp } = hud.tamerProgress();
    for (const open of [() => root.querySelector<HTMLElement>('[data-testid="tamer"]')!.click(), () => (key("v"), hud.openCore("tamer-profile")), () => (root.querySelector<HTMLElement>('[data-testid="partner"]')!.click(), hud.openCore("tamer-profile"))]) {
      hud.closeCore();
      open();
      expect(body().querySelector('[data-testid="dvc-tamer-name"]')!.textContent).toBe("Kaio");
      expect(body().querySelector('[data-testid="dvc-tamer-level"]')!.textContent).toBe(String(level));
      expect(body().querySelector('[data-testid="dvc-tamer-xp"]')!.textContent).toMatch(new RegExp(`^${xp}/`));
    }
  });

  it("a grade inferior no v2 não tem mais o atalho 'evo' duplicado; o v1 continua igual", () => {
    const v2 = mount(3, "v2").root;
    expect(v2.querySelector('.hud-menu [data-short="evo"]')).toBeNull();
    expect(v2.querySelectorAll(".hud-menu .grid button")).toHaveLength(SHORTCUTS.length - 1);
    const v1 = mount(3, "v1").root;
    expect(v1.querySelector('.hud-menu [data-short="evo"]')).not.toBeNull();
    expect(v1.querySelector('[data-panel="dvc"]')).toBeNull();
  });
});

describe("núcleo do Digivice — seções com dado real", () => {
  it("navegação lateral: item ativo marcado; grupo recolhe/abre; pendente abre o aviso", () => {
    const { root, hud, body, section } = mount();
    hud.openCore("mon-profile");
    expect(body().querySelector('[data-core="mon-profile"]')!.classList.contains("on")).toBe(true);
    body().querySelector<HTMLElement>('[data-core-group="tamer"]')!.click();
    expect(body().querySelector('[data-core="tamer-profile"]')).toBeNull();
    body().querySelector<HTMLElement>('[data-core-group="tamer"]')!.click();
    expect(body().querySelector('[data-core="tamer-profile"]')).not.toBeNull();
    body().querySelector<HTMLElement>('[data-core="bond"]')!.click();
    expect(section()).toBe("bond");
    expect(body().querySelector('[data-testid="dvc-pending"]')).not.toBeNull();
    body().querySelector<HTMLElement>('[data-core="mon-attrs"]')!.click();
    expect(body().querySelectorAll(".hc-stats tr")).toHaveLength(4);
    expect(root.querySelector('[data-testid="hc-aff"]')).not.toBeNull();
  });

  it("Tamer · Atributos = statValue do DigiviceSave (registro de atividade, não stat de combate)", () => {
    const { hud, body } = mount();
    hud.onEvents([{ t: "reward", ownerId: "p1", xp: 10, bits: 5 }, { t: "reward", ownerId: "p1", xp: 10, bits: 5 }] as unknown as WorldEvent[]);
    hud.openCore("tamer-attrs");
    const s = hud.digivice!.save;
    for (const a of TAMER_ATTRS) expect(body().querySelector(`[data-testid="dvc-attr-${a.stat}"]`)!.textContent).toBe(statValue(s, a.stat).toLocaleString("pt-BR"));
    expect(statValue(s, "wins")).toBe(2);
    expect(body().textContent).toMatch(/Não são atributos de combate/);
    // ao vivo: mais uma vitória com a seção aberta
    hud.onEvents([{ t: "reward", ownerId: "p1", xp: 10, bits: 5 }] as unknown as WorldEvent[]);
    expect(body().querySelector('[data-testid="dvc-attr-wins"]')!.textContent).toBe("3");
    expect(emptyDigivice().wins).toBe(0);
  });

  it("Digimon · Habilidades: os 4 slots = MovesView (somente leitura) e 'Editar' leva ao Equipe & Box → Golpes", () => {
    const { root, hud, body, view } = mount();
    hud.openCore("mon-skills");
    const slots = [...body().querySelectorAll<HTMLElement>('[data-testid="dvc-slots"] .mslot')];
    expect(slots).toHaveLength(4);
    view.moves.forEach((id, i) => expect(slots[i].querySelector("canvas")?.dataset.icon ?? null).toBe(id ?? null));
    expect(body().querySelector("[data-mv], [data-swap], [data-clear], select, input")).toBeNull();
    body().querySelector<HTMLElement>('[data-testid="dvc-edit-moves"]')!.click();
    expect(hud.coreOpen).toBe(false);
    expect(hud.teamOpen).toBe(true);
    expect(hud.movesTab).toBe(true);
    expect(root.querySelector('.modal [data-testid="moves-tab"]')).not.toBeNull();
  });

  it("Evolução unificada: a % da aba = pathPct dos mesmos PathStatus; 'Evoluir' manda o alvo escolhido (ramificação)", () => {
    const lvl = 60;
    const { hud, body, evolveTo } = mount(lvl);
    hud.updateMoves({ ...readOnlyView(content.moves, forkId, "Parceiro", lvl), id: "p1:partner", mp: 10, maxMp: 20, stats: statsAtLevel(content.species[forkId].base, content.species[forkId].growth, lvl), evolve: { toName: "x", level: 1, ready: true, branching: true } });
    hud.openCore("evo", { evoPrompt: true });
    expect(body().querySelector('[data-testid="dvc-evo-prompt"]')).not.toBeNull();
    const s = hud.holoSubject()!;
    for (const x of pathStatuses(content.moves, forkId, s.level, s.stats, known)) {
      expect(body().querySelector<HTMLElement>(`.hc-node[data-node="${x.path.to}"]`)!.dataset.pct).toBe(String(pathPct(x)));
    }
    const btn = body().querySelector<HTMLElement>("[data-evolve-to]")!;
    expect(btn).not.toBeNull();
    btn.click();
    expect(evolveTo).toEqual([btn.dataset.evolveTo]);
    // nenhum modal paralelo de evolução no HUD
    expect(document.querySelector('[data-testid="evo-choice"]')).toBeNull();
  });

  it("Registros e descobertas: Conquistas (mesma coleta) + Mapas visitados = DigiviceSave.maps em ordem", () => {
    const { root, hud, body } = mount();
    hud.setRegion("Vila dos Bebês", "Praça");
    root.querySelector<HTMLElement>('[data-dg="trophy"]')!.click();
    expect(hud.coreSection).toBe("records");
    expect(body().querySelector('[data-testid="ach-count"]')).not.toBeNull();
    body().querySelector<HTMLElement>('[data-testid="dvc-rec-maps"]')!.click();
    const items = [...body().querySelectorAll<HTMLElement>('[data-testid="dvc-maps"] li')].map((li) => li.dataset.map);
    expect(items).toEqual(hud.digivice!.save.maps);
    expect(items).toEqual(["Floresta Densa · Rota 1", "Vila dos Bebês · Praça"]);
    // §4.13: o nó do anel (mesma posição e ícone da Alt A) se chama Registros e descobertas; o pip segue a mesma condição
    expect(root.querySelector<HTMLElement>('[data-dg="trophy"]')!.getAttribute("aria-label")).toBe("Registros e descobertas");
  });
});
