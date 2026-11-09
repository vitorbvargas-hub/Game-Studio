// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import economy from "../src/data/content/economy.json";
import { dailyN, emptyQuestLog, itemName, questViews, rollDay, trackEvents } from "../src/save/questlog";
import { deserialize } from "../src/save/save";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import type { WorldEvent } from "../src/sim/types";
import { getPlayer, stepWorld } from "../src/sim/world";
import { Hud } from "../src/ui/hud";
import { dexSummary, digiviceHtml, inventoryHtml, questsHtml, settingsHtml } from "../src/ui/screens";

const content = loadWorldContent();
const div = (html: string) => {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d;
};
afterEach(() => {
  document.body.innerHTML = "";
});

const reward = (ownerId = LOCAL_PLAYER): WorldEvent => ({ t: "reward", tick: 1, ownerId, partnerId: `${ownerId}:partner`, xp: 5, bits: 3, drops: [], at: { x: 0, y: 0 } });
const capture = (done: boolean): WorldEvent => ({ t: "capture", tick: 1, ownerId: LOCAL_PLAYER, speciesId: "CREATURE-0005", pct: done ? 100 : 50, done });

describe("missões (quests.json) com progresso real", () => {
  it("conta vitórias do Tamer local por região e varreduras completas; ignora os bots", () => {
    const q = emptyQuestLog("2026-11-09");
    trackEvents(q, [reward(), reward(), reward("bot1"), capture(false), capture(true)], LOCAL_PLAYER, "floresta_densa");
    trackEvents(q, [reward()], LOCAL_PLAYER, "praia_dos_postes");
    expect(q.kills).toEqual({ floresta_densa: 2, praia_dos_postes: 1 });
    expect(q.captures).toBe(1);
  });

  it("'Derrote N em <região>' e 'Capture N' usam as contagens; N vem do nRange, fixo no dia", () => {
    const q = emptyQuestLog("2026-11-09");
    q.kills.floresta_densa = 4;
    q.captures = 2;
    const ctx = { regionId: "floresta_densa", regionName: "Floresta Densa", scans: { "CREATURE-0005": 100, "CREATURE-0008": 25 }, captured: ["CREATURE-0005"], hasPartner: true };
    const v = questViews(q, ctx);
    const kill = v.find((x) => x.id === "daily_kill_wilds")!;
    const n = dailyN("2026-11-09", "daily_kill_wilds", [10, 20]);
    expect(n).toBeGreaterThanOrEqual(10);
    expect(n).toBeLessThanOrEqual(20);
    expect(kill).toMatchObject({ title: `Derrote ${n} selvagens em Floresta Densa`, progress: 4, goal: n, trackable: true });
    expect(v.find((x) => x.id === "daily_capture")).toMatchObject({ progress: 2, trackable: true });
    expect(v.find((x) => x.id === "daily_arena_classica")!.trackable).toBe(false);
    expect(v.find((x) => x.id === "collect_first_scan")).toMatchObject({ progress: 1, goal: 1 });
    expect(v.find((x) => x.id === "collect_5_species")).toMatchObject({ progress: 1, goal: 5 });
    expect(v.find((x) => x.id === "main_00_tutorial")).toMatchObject({ progress: 1, goal: 1, rewardBits: 100 });
    // na praia, a diária de derrotar conta a praia
    expect(questViews(q, { ...ctx, regionId: "praia_dos_postes", regionName: "Praia dos Postes" }).find((x) => x.id === "daily_kill_wilds")!.progress).toBe(0);
  });

  it("virada do dia zera as diárias e mantém história/coleção coletadas", () => {
    const q = { day: "2026-11-09", kills: { floresta_densa: 9 }, captures: 3, claimed: ["main_00_tutorial", "daily_capture@2026-11-09"] };
    expect(rollDay(q, "2026-11-09")).toBe(q);
    expect(rollDay(q, "2026-11-10")).toEqual({ day: "2026-11-10", kills: {}, captures: 0, claimed: ["main_00_tutorial"] });
  });

  it("tela: 'Coletar' só nas completas e não coletadas; as dependentes de sistemas futuros dizem 'Em breve'", () => {
    const q = emptyQuestLog("2026-11-09");
    const ctx = { regionId: "floresta_densa", regionName: "Floresta Densa", scans: { "CREATURE-0005": 25 }, captured: [], hasPartner: true };
    let el = div(questsHtml(questViews(q, ctx)));
    expect([...el.querySelectorAll("[data-claim]")].map((b) => b.getAttribute("data-claim")).sort()).toEqual(["collect_first_scan", "main_00_tutorial"]);
    expect(el.querySelector('[data-quest="daily_arena_classica"] button')!.textContent).toBe("Em breve");
    q.claimed.push("main_00_tutorial");
    el = div(questsHtml(questViews(q, ctx)));
    expect(el.querySelector('[data-quest="main_00_tutorial"] button')!.textContent).toBe("Coletado");
    expect(el.textContent).toContain("Parceiro inicial");
  });

  it("recompensa em bits entra pela sim (intent add_bits)", () => {
    const { sim } = createForestProofWorld(2);
    const p = getPlayer(sim.state, LOCAL_PLAYER)!;
    const before = p.bits;
    stepWorld(sim, [{ t: "add_bits", playerId: LOCAL_PLAYER, bits: 150 }, { t: "add_bits", playerId: LOCAL_PLAYER, bits: -50 }]);
    expect(p.bits - before).toBeGreaterThanOrEqual(150);
    expect(p.bits - before).toBeLessThan(200);
  });
});

describe("Digivice / Inventário / Configurações", () => {
  it("Digivice: vistos, escaneados, % de varredura, silhueta de quem não foi visto e atributo no detalhe", () => {
    const s = { seen: ["CREATURE-0005", "CREATURE-0101"], scans: { "CREATURE-0005": 100, "CREATURE-0101": 50 }, captured: ["CREATURE-0005"] };
    const sum = dexSummary(content, s);
    const total = Object.keys(content.species).length;
    expect(sum).toEqual({ total, seen: 2, scanned: 1, pct: Math.round(150 / total) });
    const el = div(digiviceHtml(content, s, "CREATURE-0101"));
    expect(el.querySelector('[data-testid="dx-seen"]')!.textContent).toBe(`2/${total}`);
    expect(el.querySelector('[data-testid="dx-scanned"]')!.textContent).toBe(`1/${total}`);
    expect(el.querySelectorAll(".dx-card")).toHaveLength(total);
    expect(el.querySelector('[data-dex="CREATURE-0008"]')!.classList.contains("unseen")).toBe(true);
    expect(el.querySelector('[data-dex="CREATURE-0008"] canvas')!.getAttribute("data-silhouette")).toBe("1");
    expect(el.querySelector('[data-dex="CREATURE-0005"]')!.classList.contains("done")).toBe(true);
    expect(el.querySelector(".dx-sheet h3")!.textContent).toBe("Dorumon");
    expect(el.querySelector('[data-testid="dx-aff"]')!.textContent).toBe("Dados");
    expect(el.querySelector('[data-testid="dx-detail-pct"]')!.textContent).toBe("50%");
    expect(el.querySelector(".dx-sheet")!.textContent).toContain("Dorugamon (Nv.16)");
  });

  it("Inventário: todos os itens do economy.json, com quantidade e nome em pt-BR; bits do jogador", () => {
    const el = div(inventoryHtml({ digivice_padrao: 1, nucleo_estavel: 2 }, 1234));
    const all = Object.values(economy.items).flat();
    expect(el.querySelectorAll("[data-item]")).toHaveLength(all.length);
    expect(el.querySelector('[data-item="nucleo_estavel"] [data-testid="iv-qty"]')!.textContent).toBe("×2");
    expect(el.querySelector('[data-item="potinho_de_energia"]')!.classList.contains("empty")).toBe(true);
    expect(el.querySelector('[data-testid="iv-bits"]')!.textContent).toBe("1.234");
    expect(itemName("digivice_padrao")).toBe("Digivice Padrão");
  });

  it("Configurações: AUTO, Auto-evoluir, tempo do dia e reset com confirmação", () => {
    let el = div(settingsHtml({ auto: true, autoEvolve: false, time: "night", confirmReset: false }));
    expect(el.querySelector('[data-set="auto"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(el.querySelector('[data-set="autoEvolve"]')!.textContent).toBe("DESL.");
    expect(el.querySelector('[data-time="night"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(el.querySelector('[data-reset="confirm"]')).toBeNull();
    el = div(settingsHtml({ auto: true, autoEvolve: false, time: "auto", confirmReset: true }));
    expect(el.querySelector('[data-reset="confirm"]')!.textContent).toBe("Apagar e recomeçar");
    expect(el.querySelector('[data-reset="cancel"]')).not.toBeNull();
  });

  it("HUD: atalhos ligados chamam onShortcut (Mapa-múndi, Digivice, Inventário, Missões, Configurações)", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const onShortcut = vi.fn();
    new Hud(root, content, "p1", { onAuto: vi.fn(), onFlee: vi.fn(), onShortcut }, false, { shortcuts: ["map", "dex", "inv", "quest", "gear"] });
    for (const id of ["map", "dex", "quest", "gear"]) root.querySelector<HTMLElement>(`.grid [data-short="${id}"]`)!.click();
    root.querySelector<HTMLElement>(".inv")!.click();
    root.querySelector<HTMLElement>(".mm-world")!.click();
    expect(onShortcut.mock.calls.map((c) => c[0])).toEqual(["map", "dex", "quest", "gear", "inv", "map"]);
    expect(root.querySelector('[data-short="shop"]')!.getAttribute("aria-disabled")).toBe("true");
  });

  it("save v4 → v5: vistos = varreduras + parceira; inventário inicial; missões do zero; tempo automático", () => {
    const v4 = JSON.stringify({ v: 4, savedAt: Date.UTC(2026, 10, 9, 12), game: "gs003-world", data: { tamer: {}, partner: { speciesId: "CREATURE-0003", level: 5, xp: 0, learned: [], moves: [], autoRules: [] }, starter: null, map: "praia", scans: { "CREATURE-0105": 50 } } });
    const r = deserialize(v4);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.seen.sort()).toEqual(["CREATURE-0003", "CREATURE-0105"]);
    expect(r.data.inventory).toEqual({ digivice_padrao: 1 });
    expect(r.data.quests).toMatchObject({ kills: {}, captures: 0, claimed: [] });
    expect(r.data.settings).toEqual({ time: "auto" });
    expect(r.data.map).toBe("praia");
  });
});
