// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { Hud, SHORTCUTS, type HudScene } from "../src/ui/hud";
import type { MovesView } from "../src/ui/moves-ui";
import { ofType, run, world } from "./helpers";

const scene: HudScene = {
  region: FOREST_PROOF_SCENE.region,
  tamerName: "Kaio",
  tamerLevel: 12,
  tamerXp: FOREST_PROOF_SCENE.tamerXp,
  team: FOREST_PROOF_SCENE.team,
  box: FOREST_PROOF_SCENE.box,
  chat: FOREST_PROOF_SCENE.chat,
};

function mount(auto = false) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const onAuto = vi.fn();
  const onFlee = vi.fn();
  const hud = new Hud(root, loadWorldContent(), "p1", { onAuto, onFlee }, auto, { scene });
  return { root, hud, onAuto, onFlee };
}

const partner = { id: "p1:partner", kind: "partner" as const, speciesId: "CREATURE-0003", ownerId: "p1", name: "Guilmon", x: 0, y: 0, facing: "S" as const, state: "IDLE" as const, hp: 50, maxHp: 80, level: 5 };

afterEach(() => {
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("HUD (DOM, padrão IdleDex)", () => {
  it("AUTO alterna (LIG./DESL.) e emite callback; Fugir emite callback", () => {
    const { root, onAuto, onFlee } = mount();
    const auto = root.querySelector<HTMLButtonElement>('[data-act="auto"]')!;
    auto.click();
    expect(onAuto).toHaveBeenLastCalledWith(true);
    expect(auto.getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector('[data-testid="auto-state"]')!.textContent).toBe("LIG.");
    auto.click();
    expect(onAuto).toHaveBeenLastCalledWith(false);
    root.querySelector<HTMLButtonElement>('[data-act="flee"]')!.click();
    expect(onFlee).toHaveBeenCalledOnce();
  });

  it("barra inferior: minimapa, inventário, grade de 12 atalhos, Digimon ativo e equipe de 5 slots", () => {
    const { root, hud } = mount();
    hud.updatePartner(partner, 18, 750, 1234);
    expect(root.querySelector('.hud-bottom [data-testid="minimap"]')).not.toBeNull();
    expect(root.querySelector(".hud-bottom .inv")!.textContent).toContain("Inventário");
    const grid = [...root.querySelectorAll<HTMLButtonElement>(".hud-menu .grid button")];
    expect(grid).toHaveLength(SHORTCUTS.length);
    expect(grid.length).toBe(12);
    // só "Equipe & Box" abre algo nesta prova; o resto avisa "em breve"
    expect(grid.filter((b) => b.getAttribute("aria-disabled") !== "true").map((b) => b.dataset.short)).toEqual(["team"]);
    const p = root.querySelector('[data-testid="partner"]')!;
    expect(p.textContent).toContain("Guilmon");
    expect(p.textContent).toContain("Nv.5");
    expect(p.textContent).toContain("50/80");
    expect(p.textContent).toContain("18/750");
    const slots = root.querySelectorAll(".hud-team .slot");
    expect(slots).toHaveLength(5);
    expect(slots[0].classList.contains("active")).toBe(true);
    expect(root.querySelectorAll(".hud-team .slot .hud-bar")).toHaveLength(5);
    expect(root.querySelector('[data-testid="coins"]')!.textContent).toMatch(/1\.?234/);
    expect(root.querySelector('[data-testid="tamer-level"]')!.textContent).toBe("12");
    expect(root.querySelector(".hud-chat")!.classList.contains("collapsed")).toBe(true);
  });

  it("atalho Equipe abre o modal Equipe & Box (grade, ficha, ações desabilitadas) e fecha com transição", () => {
    vi.useFakeTimers();
    const { root, hud } = mount();
    hud.updatePartner(partner, 18, 750, 0);
    const wrap = root.querySelector<HTMLElement>(".modal-wrap")!;
    expect(wrap.hidden).toBe(true);
    root.querySelector<HTMLButtonElement>('[data-short="team"]')!.click();
    expect(wrap.hidden).toBe(false);
    expect(wrap.classList.contains("open")).toBe(true);
    expect(hud.teamOpen).toBe(true);
    expect(root.querySelector(".modal h2")!.textContent).toBe("EQUIPE & BOX");
    expect(root.querySelectorAll(".cards.team .card[data-pick]")).toHaveLength(5);
    expect(root.querySelectorAll(".cards.box .card")).toHaveLength(FOREST_PROOF_SCENE.box.length);
    const sheet = root.querySelector(".sheet")!;
    expect(sheet.textContent).toContain("Guilmon");
    expect(sheet.textContent).toMatch(/Ataque/);
    const acts = [...root.querySelectorAll<HTMLButtonElement>(".actions button")];
    expect(acts.map((b) => b.textContent!.trim())).toEqual(["Evoluir", "Golpes", "Item", "Soltar"]);
    // Golpes abre a aba; Evoluir só com a parceira no nível de evolução; Item e Soltar seguem bloqueados.
    expect(acts.map((b) => b.disabled)).toEqual([true, false, true, true]);
    // seleção troca a ficha
    root.querySelector<HTMLElement>('.cards.box [data-pick="box4"]')!.click();
    expect(root.querySelector(".sheet h3")!.textContent).toContain("Growlmon");
    // busca filtra o Box
    const search = root.querySelector<HTMLInputElement>(".search")!;
    search.value = "koro";
    search.dispatchEvent(new Event("input"));
    const visible = [...root.querySelectorAll<HTMLElement>(".cards.box .card")].filter((c) => !c.hidden);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.every((c) => c.dataset.name!.includes("koro"))).toBe(true);
    // fecha: tira a classe já (transição) e esconde depois
    root.querySelector<HTMLButtonElement>(".modal .x")!.click();
    expect(wrap.classList.contains("open")).toBe(false);
    expect(wrap.hidden).toBe(false);
    vi.advanceTimersByTime(250);
    expect(wrap.hidden).toBe(true);
  });

  it("textos do HUD em pt-BR (sem rótulos em inglês)", () => {
    const { root, hud } = mount();
    hud.updatePartner(partner, 0, 10, 0);
    hud.openTeam();
    const text = `${root.textContent} ${[...root.querySelectorAll("[title]")].map((e) => e.getAttribute("title")).join(" ")} ${root.querySelector<HTMLInputElement>(".search")!.placeholder}`;
    expect(text).not.toMatch(/\b(Inventory|Team|Level|Settings|Shop|Friends|Quests?|Close|Search|Evolve|Release|Moves|Event|Battle|Pass|Coins?|Lv)\b/);
  });

  it("log mostra só eventos confirmados do jogador local; XP do Tamer anda com as vitórias", () => {
    const { root, hud } = mount(true);
    const { sim, events } = world(42, { auto: true });
    hud.onEvents(events);
    const evs = run(sim, 1200);
    hud.onEvents(evs);
    const lines = [...root.querySelectorAll(".hud-log li")].map((l) => l.textContent);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(7);
    expect(ofType(evs, "reward").some((r) => r.ownerId === "p1")).toBe(true);
    expect(lines.join("\n")).toMatch(/XP|derrotado|dano|Escaneando|registrado|Combate/);
    expect(lines.join("\n")).not.toMatch(/Bot|bot1/);
    const bar = root.querySelector<HTMLElement>(".hud-tamerxp .bar i")!;
    expect(bar.style.width).not.toBe("0%");
  });
});

describe("HUD — golpes (barra, aviso, aba Golpes, prioridade do AUTO)", () => {
  const view = (over: Partial<MovesView> = {}): MovesView => ({
    id: "p1:partner",
    speciesId: "CREATURE-0003",
    name: "Guilmon",
    level: 11,
    mp: 30,
    maxMp: 42,
    learned: ["rock_breaker", "pyro_sphere", "sharp_claws", "wild_scratch", "air_fireball"],
    moves: ["rock_breaker", "pyro_sphere", "sharp_claws", null],
    autoRules: [],
    cd: { pyro_sphere: 15 },
    inCombat: false,
    evolve: { toName: "Growlmon", level: 16, ready: false },
    ...over,
  });

  function mountMoves() {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const cb = { onAuto: vi.fn(), onFlee: vi.fn(), onUseMove: vi.fn(), onSetMoves: vi.fn(), onSetAutoRules: vi.fn(), onEvolve: vi.fn() };
    const hud = new Hud(root, loadWorldContent(), "p1", cb, false, { scene });
    hud.updatePartner(partner, 0, 10, 0);
    return { root, hud, cb };
  }

  it("barra: 4 slots com recarga radial (--cd), custo de MP, slot vazio e clique → use_move", () => {
    const { root, hud, cb } = mountMoves();
    hud.updateMoves(view());
    const mv = [...root.querySelectorAll<HTMLButtonElement>(".hud-moves .mv")];
    expect(mv).toHaveLength(4);
    expect(mv[0].title).toContain("Rock Breaker");
    expect(mv[1].style.getPropertyValue("--cd")).toBe((15 / 45).toFixed(3));
    expect(mv[1].classList.contains("cooling")).toBe(true);
    expect(mv[1].querySelector(".cdt")!.textContent).toBe("2");
    expect(mv[0].querySelector(".mp")!.textContent).toBe("14");
    expect(mv[3].classList.contains("empty")).toBe(true);
    mv[2].click();
    expect(cb.onUseMove).toHaveBeenCalledWith(2);
    mv[3].click();
    expect(cb.onUseMove).toHaveBeenCalledTimes(1);
    expect(root.querySelector('[data-testid="mp"]')!.textContent).toBe("MP 30/42");
  });

  it("aviso ao aprender: \"Guilmon aprendeu Sharp Claws!\" (só do jogador local) e linha no log", () => {
    const { root, hud } = mountMoves();
    hud.onEvents([{ t: "spawn", tick: 0, entity: { ...partner } }]);
    hud.onEvents([{ t: "move_learned", tick: 5, id: "p1:partner", moveId: "sharp_claws", slot: 2 }]);
    const learn = root.querySelector(".hud-learn")!;
    expect(learn.classList.contains("show")).toBe(true);
    expect(learn.textContent).toContain("Guilmon aprendeu Sharp Claws!");
    expect(learn.textContent).toContain("slot 3");
    expect(root.querySelector(".hud-log")!.textContent).toContain("Guilmon aprendeu Sharp Claws!");
    hud.onEvents([{ t: "move_learned", tick: 6, id: "bot1:partner", moveId: "air_slam", slot: null }]);
    expect(root.querySelector(".hud-log")!.textContent).not.toContain("Air Slam");
  });

  it("aba Golpes: 4 slots, aprendidos, bloqueados por nível e \"Trocar\" → escolhe o slot → set_moves", () => {
    const { root, hud, cb } = mountMoves();
    hud.updateMoves(view());
    hud.openTeam();
    root.querySelector<HTMLButtonElement>('[data-testid="tab-moves"]')!.click();
    expect(hud.movesTab).toBe(true);
    const tab = root.querySelector('[data-testid="moves-tab"]')!;
    expect(tab.querySelectorAll(".mslot")).toHaveLength(4);
    expect(tab.querySelectorAll(".mslot.empty")).toHaveLength(1);
    expect(tab.querySelectorAll(".mlist li:not(.locked)")).toHaveLength(5);
    expect(tab.querySelector(".mlist li.locked")!.textContent).toContain("Nv.14");
    const swap = root.querySelector<HTMLButtonElement>('[data-swap="air_fireball"]')!;
    expect(swap.textContent).toBe("Trocar");
    swap.click();
    expect(root.querySelectorAll(".mslot.pick")).toHaveLength(4);
    root.querySelector<HTMLElement>('.mslot[data-slot="0"]')!.click();
    expect(cb.onSetMoves).toHaveBeenCalledWith(["air_fireball", "pyro_sphere", "sharp_claws", null]);
    // em combate: sem botão Trocar e aviso
    hud.updateMoves(view({ inCombat: true }));
    expect(root.querySelector("[data-swap]")).toBeNull();
    expect(root.querySelector(".moves-tab")!.textContent).toContain("Em combate");
  });

  it("editor de prioridade do AUTO: subir, condição com %, desligar e restaurar padrão", () => {
    const { root, hud, cb } = mountMoves();
    hud.updateMoves(view());
    hud.openTeam();
    hud.setTab("moves");
    const rules = () => [...root.querySelectorAll(".rules li")];
    expect(rules().map((r) => r.querySelector("b")!.textContent)).toEqual(["Rock Breaker", "Pyro Sphere", "Sharp Claws"]);
    root.querySelector<HTMLButtonElement>('[data-up="1"]')!.click();
    expect(cb.onSetAutoRules).toHaveBeenLastCalledWith([
      { moveId: "pyro_sphere", cond: "always" },
      { moveId: "rock_breaker", cond: "always" },
      { moveId: "sharp_claws", cond: "always" },
    ]);
    const sel = root.querySelector<HTMLSelectElement>('[data-cond="0"]')!;
    sel.value = "target_hp_below_pct";
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    expect(cb.onSetAutoRules.mock.lastCall![0][0]).toEqual({ moveId: "rock_breaker", cond: "target_hp_below_pct", pct: 30 });
    const on = root.querySelector<HTMLInputElement>('[data-on="2"]')!;
    on.checked = false;
    on.dispatchEvent(new Event("change", { bubbles: true }));
    expect(cb.onSetAutoRules.mock.lastCall![0][2]).toMatchObject({ moveId: "sharp_claws", off: true });
    // o estado confirmado pela sim volta e é desenhado
    hud.updateMoves(view({ autoRules: [{ moveId: "sharp_claws", cond: "self_hp_below_pct", pct: 40 }] }));
    expect(rules()[0].querySelector("b")!.textContent).toBe("Sharp Claws");
    expect(root.querySelector<HTMLInputElement>('[data-pct="0"]')!.value).toBe("40");
    root.querySelector<HTMLButtonElement>("[data-reset-rules]")!.click();
    expect(cb.onSetAutoRules.mock.lastCall![0].map((r: { moveId: string }) => r.moveId)).toEqual(["rock_breaker", "pyro_sphere", "sharp_claws"]);
  });

  it("Evoluir: habilitado no nível de evolução → onEvolve; Digimon da equipe mostra o kit pelo learnset (só leitura)", () => {
    const { root, hud, cb } = mountMoves();
    hud.updateMoves(view({ level: 16, evolve: { toName: "Growlmon", level: 16, ready: true } }));
    hud.openTeam();
    const evo = root.querySelector<HTMLButtonElement>('.actions [data-act="evolve"]')!;
    expect(evo.disabled).toBe(false);
    evo.click();
    expect(cb.onEvolve).toHaveBeenCalledOnce();
    root.querySelector<HTMLElement>('[data-pick="team2"]')!.click();
    hud.setTab("moves");
    const tab = root.querySelector(".moves-tab")!;
    expect(tab.textContent).toContain("Somente o Digimon ativo");
    expect(tab.querySelector("[data-swap]")).toBeNull();
    expect(tab.querySelectorAll(".mslot:not(.empty)").length).toBeGreaterThan(0);
  });
});
