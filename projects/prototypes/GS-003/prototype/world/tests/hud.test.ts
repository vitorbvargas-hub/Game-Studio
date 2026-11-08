// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { Hud, SHORTCUTS, type HudScene } from "../src/ui/hud";
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
    expect(acts.every((b) => b.disabled)).toBe(true);
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
