// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { loadWorldContent } from "../src/sim/species";
import { Hud } from "../src/ui/hud";
import { ofType, run, world } from "./helpers";

describe("HUD (DOM)", () => {
  it("AUTO alterna e emite callback; Fugir emite callback; menus ficam inativos", () => {
    const root = document.createElement("div");
    const onAuto = vi.fn();
    const onFlee = vi.fn();
    new Hud(root, loadWorldContent(), "p1", { onAuto, onFlee }, false);
    const auto = root.querySelector<HTMLButtonElement>('[data-act="auto"]')!;
    auto.click();
    expect(onAuto).toHaveBeenLastCalledWith(true);
    expect(auto.getAttribute("aria-pressed")).toBe("true");
    auto.click();
    expect(onAuto).toHaveBeenLastCalledWith(false);
    root.querySelector<HTMLButtonElement>('[data-act="flee"]')!.click();
    expect(onFlee).toHaveBeenCalledOnce();
    const menu = [...root.querySelectorAll<HTMLButtonElement>(".hud-menu button")];
    expect(menu.length).toBeGreaterThanOrEqual(4);
    expect(menu.every((b) => b.disabled)).toBe(true);
  });

  it("log mostra só eventos confirmados do jogador local", () => {
    const root = document.createElement("div");
    const hud = new Hud(root, loadWorldContent(), "p1", { onAuto() {}, onFlee() {} }, true);
    const { sim, events } = world(42, { auto: true });
    hud.onEvents(events);
    const evs = run(sim, 1200);
    hud.onEvents(evs);
    const lines = [...root.querySelectorAll(".hud-log li")].map((l) => l.textContent);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(7);
    expect(ofType(evs, "reward").some((r) => r.ownerId === "p1")).toBe(true);
    expect(lines.join("\n")).toMatch(/XP|derrotado|Escaneando|registrado|Combate/);
  });
});
