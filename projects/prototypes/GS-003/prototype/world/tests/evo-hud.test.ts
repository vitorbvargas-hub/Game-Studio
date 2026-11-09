// @vitest-environment jsdom
// HUD da XP e da digivolução: a barra muda no lugar (para a transição CSS animar), "+N" ao ganhar XP, brilho e barra
// cheia no level up, e o aviso "X digivolveu para Y!" (com os golpes novos) segurado até o clarão no mapa.

import { afterEach, describe, expect, it, vi } from "vitest";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import type { EntitySnapshot } from "../src/sim/types";
import { EVO_ANNOUNCE_FALLBACK_MS, Hud } from "../src/ui/hud";

const content = loadWorldContent();
const snap = (level: number, speciesId = "CREATURE-0003", name = "Guilmon"): EntitySnapshot => ({ id: "p1:partner", kind: "partner", speciesId, ownerId: "p1", name, x: 0, y: 0, facing: "S", state: "IDLE", hp: 50, maxHp: 80, level });

function makeHud(): Hud {
  document.body.innerHTML = '<div id="hud"></div>';
  const scene = { region: FOREST_PROOF_SCENE.region, tamerName: "Kaio", tamerLevel: 12, tamerXp: FOREST_PROOF_SCENE.tamerXp, team: FOREST_PROOF_SCENE.team, box: FOREST_PROOF_SCENE.box, chat: FOREST_PROOF_SCENE.chat };
  return new Hud(document.querySelector<HTMLElement>("#hud")!, content, "p1", { onAuto: () => {}, onFlee: () => {} }, false, { scene });
}

afterEach(() => vi.useRealTimers());

describe("HUD: barra de XP da parceira", () => {
  it("ganho de XP: mesma barra (sem recriar), largura nova e \"+N\"", () => {
    const hud = makeHud();
    hud.updatePartner(snap(15), 6000, 6750, 0);
    const bar = document.querySelector<HTMLElement>(".hud-partner .hud-bar.xp i")!;
    hud.updatePartner(snap(15), 6450, 6750, 0);
    expect(document.querySelector(".hud-partner .hud-bar.xp i")).toBe(bar);
    expect(bar.style.width).toBe("96%");
    const gain = document.querySelector<HTMLElement>(".hud-partner .xp-gain")!;
    expect(gain.textContent).toBe("+450");
    expect(gain.classList.contains("show")).toBe(true);
  });

  it("level up: enche até 100%, brilha o painel e recomeça do novo valor", () => {
    vi.useFakeTimers();
    const hud = makeHud();
    hud.updatePartner(snap(15), 6450, 6750, 0);
    hud.updatePartner(snap(16), 150, 7680, 0);
    const bar = document.querySelector<HTMLElement>(".hud-partner .hud-bar.xp i")!;
    expect(bar.style.width).toBe("100%");
    expect(document.querySelector(".hud-partner")!.classList.contains("lvup")).toBe(true);
    expect(document.querySelector(".hud-partner .xp-gain")!.textContent).toBe("Nv.16!");
    expect(document.querySelector(".hud-partner .hud-name span")!.textContent).toBe("Nv.16");
    vi.advanceTimersByTime(500);
    expect(bar.style.width).toBe("2%");
  });
});

describe("HUD: aviso da digivolução", () => {
  it("segura \"digivolveu\" e os golpes novos até releaseEvolve (o clarão no mapa)", () => {
    vi.useFakeTimers();
    const hud = makeHud();
    hud.onEvents([{ t: "spawn", tick: 1, entity: snap(16) }]);
    hud.onEvents([
      { t: "evolve", tick: 2, id: "p1:partner", from: "CREATURE-0003", to: "CREATURE-0004", kept: [] },
      { t: "move_learned", tick: 2, id: "p1:partner", moveId: Object.keys(content.moves.moves)[0], slot: 0 },
    ]);
    const log = () => document.querySelector("#hud")!.textContent ?? "";
    expect(hud.evolvePending).toBe(true);
    expect(log()).not.toContain("digivolveu");
    expect(log()).not.toContain("aprendeu");
    hud.releaseEvolve();
    expect(hud.evolvePending).toBe(false);
    expect(log()).toContain("Guilmon digivolveu para Growlmon!");
    expect(log()).toContain("aprendeu");
  });

  it("sem a parceira na tela, o aviso sai sozinho depois do prazo", () => {
    vi.useFakeTimers();
    const hud = makeHud();
    hud.onEvents([{ t: "spawn", tick: 1, entity: snap(16) }]);
    hud.onEvents([{ t: "evolve", tick: 2, id: "p1:partner", from: "CREATURE-0003", to: "CREATURE-0004", kept: [] }]);
    vi.advanceTimersByTime(EVO_ANNOUNCE_FALLBACK_MS + 10);
    expect(hud.evolvePending).toBe(false);
    expect(document.querySelector("#hud")!.textContent).toContain("digivolveu para Growlmon");
  });
});
