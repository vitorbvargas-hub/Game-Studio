// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { captureSave } from "../src/save/offline";
import { deserialize, serialize } from "../src/save/save";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import { getEntity, getPlayer } from "../src/sim/world";
import { linePreview, STARTER_LEVEL, StarterPicker, STARTERS } from "../src/ui/starter";
import { DEFAULT_LOOK } from "../src/assets/tamer-parts";

const content = loadWorldContent();

afterEach(() => {
  document.body.innerHTML = "";
});

function mount(drawSprite = vi.fn((sp: string) => sp !== "CREATURE-0014")) {
  const onConfirm = vi.fn();
  const p = new StarterPicker(document.body, { content, onConfirm, drawSprite });
  return { p, el: p.el, onConfirm, drawSprite };
}

describe("escolha do Digimon inicial", () => {
  it("5 bebês: Koromon, Tsunomon, Tokomon, Gigimon e Dorimon, todos com espécie, learnset e atributo", () => {
    expect(STARTERS.map((s) => s.name)).toEqual(["Koromon", "Tsunomon", "Tokomon", "Gigimon", "Dorimon"]);
    for (const s of STARTERS) {
      const sp = content.species[s.speciesId];
      expect(sp, s.name).toBeDefined();
      expect(sp.stage).toBe(1);
      expect(content.moves.learnsets[s.speciesId]?.[0]).toMatchObject({ level: 1 });
      expect(s.line).toHaveLength(2);
    }
  });

  it("cada cartão mostra nome, atributo em pt-BR e prévia da linha (2 estágios, com o nível de evolução)", () => {
    const { el } = mount();
    const cards = el.querySelectorAll<HTMLElement>("[data-starter]");
    expect(cards).toHaveLength(5);
    const koro = el.querySelector('[data-starter="CREATURE-0005"]')!;
    expect(koro.querySelector(".st-name")!.textContent).toBe("Koromon");
    expect(koro.querySelector('[data-testid="st-aff"]')!.textContent).toBe("Vacina");
    expect([...koro.querySelectorAll(".st-line li")].map((li) => [...li.querySelectorAll("span:last-of-type, em")].map((x) => x.textContent).join(" "))).toEqual(["Agumon Nv.8", "Greymon Nv.16"]);
    expect(el.querySelector('[data-starter="CREATURE-0014"] [data-testid="st-aff"]')!.textContent).toBe("Dados");
    expect(el.querySelector('[data-starter="CREATURE-0002"] [data-testid="st-aff"]')!.textContent).toBe("Vírus");
    expect(el.querySelector("h1")!.textContent).toBe("Escolha seu parceiro");
  });

  it("sem arte (ou espécie ainda não importada) → placeholder '?'", () => {
    const { el } = mount();
    expect(el.querySelector('[data-starter="CREATURE-0014"] .st-sprite')!.classList.contains("ph")).toBe(true);
    expect(el.querySelector('[data-starter="CREATURE-0005"] .st-sprite')!.classList.contains("ph")).toBe(false);
    const l = linePreview(content, STARTERS[4]);
    expect(l.map((x) => x.name)).toEqual(["Dorumon", "Dorugamon"]);
  });

  it("selecionar (clique e setas) e confirmar devolve a espécie e fecha a tela", () => {
    const { p, el, onConfirm } = mount();
    expect(p.selected).toBe("CREATURE-0005");
    el.querySelector<HTMLButtonElement>('[data-starter="CREATURE-0011"]')!.click();
    expect(el.querySelector('[data-starter="CREATURE-0011"]')!.getAttribute("aria-checked")).toBe("true");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(p.selected).toBe("CREATURE-0002");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.textContent).toBe("Escolher Dorimon");
    el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.click();
    expect(onConfirm).toHaveBeenCalledWith("CREATURE-0014");
    expect(document.querySelector(".starter")).toBeNull();
  });

  it("o escolhido vira a parceira no nível 1 e vai para o save", () => {
    const { sim } = createForestProofWorld(5, { partnerSpecies: "CREATURE-0014", partnerLevel: STARTER_LEVEL });
    const partner = getEntity(sim.state, getPlayer(sim.state, LOCAL_PLAYER)!.partnerId)!;
    expect([partner.speciesId, partner.name, partner.level]).toEqual(["CREATURE-0014", "Dorimon", 1]);
    expect(partner.moves[0]).toBe("investida");
    const data = captureSave(sim, LOCAL_PLAYER, { tamer: DEFAULT_LOOK, tamerLevel: 1, tamerXp: 0, team: [], starter: "CREATURE-0014", map: "forest-proof", seen: ["CREATURE-0014"], inventory: { digivice_padrao: 1 }, quests: { day: "2026-11-09", kills: { floresta_densa: 3 }, captures: 1, claimed: ["main_00_tutorial"] }, settings: { time: "night" as const } });
    const back = deserialize(serialize(data, 1));
    expect(back.ok && [back.data.starter, back.data.partner.speciesId, back.data.partner.level]).toEqual(["CREATURE-0014", "CREATURE-0014", 1]);
    // os bots continuam com as parceiras da cena
    expect(getEntity(sim.state, "bot1:partner")!.speciesId).toBe("CREATURE-0012");
  });
});
