// @vitest-environment jsdom
// Telas da Arena (GS-006): entrada com os 2 modos e o atalho do troféu/Mapa-múndi, seleção só com os Digimon do save
// (+ editor de prioridade reaproveitado, Arena Nivelada desligada por padrão, poder e aviso), HUD manual com os 5
// botões do vídeo e resultado com Revanche [R] / Menu [Esc].
import { afterEach, describe, expect, it, vi } from "vitest";
import { arenaRoster, emptyArena, ghostSources, recordMatch, type OwnedDigimon } from "../src/save/arena-league";
import { defaultAutoRules, initialLoadout } from "../src/sim/moves";
import { loadWorldContent } from "../src/sim/species";
import { arenaEntryHtml, arenaSelectHtml, MANUAL_KEYS, manualHudHtml, resultHtml, roundPickHtml, type SelectView } from "../src/ui/arena-html";
import { Hud, SHORTCUTS } from "../src/ui/hud";
import { editRules } from "../src/ui/moves-ui";
import { worldMapHtml } from "../src/ui/worldmap";

const content = loadWorldContent();
const div = (html: string) => {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d;
};
afterEach(() => {
  document.body.innerHTML = "";
});

const lo = initialLoadout(content.moves, "CREATURE-0006", 12);
const save: OwnedDigimon = {
  partner: { speciesId: "CREATURE-0006", level: 12, xp: 0, learned: lo.learned, moves: lo.moves, autoRules: defaultAutoRules(lo.moves) },
  team: [{ species: "CREATURE-0009", level: 8, hpPct: 100 }],
  box: [{ species: "CREATURE-0012", level: 7 }],
};

function view(over: Partial<SelectView> = {}): SelectView {
  const roster = arenaRoster(save, content);
  return {
    mode: "auto",
    content,
    roster,
    picks: ["partner", "team:0"],
    focus: "partner",
    rules: {},
    comps: [],
    ghosts: ghostSources(emptyArena()),
    ghostId: "bot:bot1",
    myPower: 300,
    foePower: 200,
    warning: "Confronto desbalanceado: seu time tem 50% mais poder.",
    normalize: false,
    level: 9,
    ...over,
  };
}

describe("Arena — telas", () => {
  it("entrada da Arena: troféu na barra do HUD e botão no Mapa-múndi", () => {
    expect(SHORTCUTS.find((s) => s.id === "arena")).toMatchObject({ label: "Arena", icon: "trophy" });
    const root = document.createElement("div");
    document.body.appendChild(root);
    const onShortcut = vi.fn();
    new Hud(root, content, "p1", { onAuto: vi.fn(), onFlee: vi.fn(), onShortcut }, false, { shortcuts: ["map", "arena"] });
    const btns = root.querySelectorAll<HTMLButtonElement>('[data-short="arena"]');
    expect(btns.length).toBe(2);
    btns.forEach((b) => b.click());
    expect(onShortcut.mock.calls).toEqual([["arena"], ["arena"]]);
    expect(div(worldMapHtml("floresta_densa", { tamerLevel: 1, defeatedBosses: [] })).querySelector("[data-arena]")).not.toBeNull();
  });

  it("entrada: dois modos (Automático e Manual), rating local e histórico separados por modo", () => {
    let a = emptyArena();
    a = recordMatch(a, { mode: "manual", result: "win", score: "2-1", mine: [{ speciesId: "CREATURE-0006", level: 12 }], foe: [], foeName: "Lumi", date: 0, damage: [1, 1], hits: [1, 1], normalized: false });
    const el = div(arenaEntryHtml(content, a));
    expect([...el.querySelectorAll("[data-mode]")].map((b) => b.getAttribute("data-mode"))).toEqual(["auto", "manual"]);
    expect(el.querySelector('[data-testid="rating-auto"]')!.textContent).toBe("1000");
    expect(el.querySelector('[data-testid="rating-manual"]')!.textContent).toBe("1020");
    expect(el.querySelectorAll(".ar-hist li").length).toBe(1);
    expect(el.textContent).toContain("Vitória 2-1");
  });

  it("seleção: só os Digimon do save, com nível/estágio/atributo/golpes/status; Nivelada desligada por padrão", () => {
    const el = div(arenaSelectHtml(view()));
    const cards = [...el.querySelectorAll<HTMLElement>('[data-testid="roster-card"]')];
    expect(cards.map((c) => c.dataset.pick)).toEqual(["partner", "team:0", "box:0"]);
    const first = cards[0].textContent!;
    expect(first).toContain("Agumon");
    expect(first).toContain("Nv.12");
    expect(first).toContain("Criança");
    expect(first).toContain("Vacina");
    expect(first).toMatch(/PV \d+ · ATQ \d+ · DEF \d+ · VEL \d+ · MP \d+/);
    expect(cards[0].querySelectorAll(".mv4 li").length).toBe(4);
    expect(el.querySelector<HTMLInputElement>('[data-testid="normalize"]')!.checked).toBe(false);
    expect(el.querySelector('[data-testid="normalize-on"]')).toBeNull();
    expect(el.querySelector('[data-testid="imbalance"]')!.textContent).toMatch(/desbalanceado/);
    expect(el.querySelector('[data-testid="power"]')!.textContent).toMatch(/300.*200/s);
    // automático: formação + editor de prioridade (o mesmo da aba Golpes) + salvar composição
    expect(el.querySelector('[data-testid="gambit"] .rules')).not.toBeNull();
    expect(el.querySelector("[data-save-comp]")).not.toBeNull();
    expect(el.querySelectorAll('[data-testid="ghosts"] input').length).toBe(3);
    const on = div(arenaSelectHtml(view({ normalize: true })));
    expect(on.querySelector('[data-testid="normalize-on"]')!.textContent).toContain("Nv.9");
    // manual: sem editor de prioridade e sem composição
    const man = div(arenaSelectHtml(view({ mode: "manual", focus: undefined })));
    expect(man.querySelector('[data-testid="gambit"]')).toBeNull();
    expect(man.querySelector("[data-save-comp]")).toBeNull();
  });

  it("o editor de prioridade da Arena usa a mesma regra da aba Golpes (editRules)", () => {
    const el = div(arenaSelectHtml(view()));
    const rules = defaultAutoRules(lo.moves);
    const down = el.querySelector<HTMLElement>("[data-down='0']")!;
    const next = editRules(rules, lo.moves, { type: "click", target: down })!;
    expect(next.map((r) => r.moveId)).toEqual([rules[1].moveId, rules[0].moveId, ...rules.slice(2).map((r) => r.moveId)]);
    const sel = el.querySelector<HTMLSelectElement>("[data-cond='0']")!;
    sel.value = "self_hp_below_pct";
    expect(editRules(rules, lo.moves, { type: "change", target: sel })![0]).toMatchObject({ cond: "self_hp_below_pct", pct: 40 });
  });

  it("manual: escolha da rodada e HUD com 5 botões (nome + tecla), placar com marcadores e timer", () => {
    const team = [save.partner, { ...save.partner, ref: "x" }].map((p, i) => ({ ref: `r${i}`, speciesId: p.speciesId, level: p.level, learned: p.learned, moves: p.moves, autoRules: p.autoRules }));
    const pick = div(roundPickHtml(content, 2, [1, 0], team, [1], "Lumi"));
    expect(pick.querySelector("h3")!.textContent).toBe("Rodada 2");
    expect(pick.querySelector<HTMLButtonElement>('[data-round-pick="0"]')!.disabled).toBe(true);
    expect(pick.querySelector<HTMLButtonElement>('[data-round-pick="1"]')!.disabled).toBe(false);
    expect(pick.querySelectorAll('[data-testid="score-a"] .dot.on').length).toBe(1);
    const hud = div(manualHudHtml());
    expect([...hud.querySelectorAll(".ar-sk kbd")].map((k) => k.textContent)).toEqual(["LMB", "RMB", "Spc", "Q", "E"]);
    expect(MANUAL_KEYS.length).toBe(5);
    expect(hud.querySelector('[data-testid="timer"]')!.textContent).toBe("1:30");
    expect(hud.querySelectorAll(".ar-plate").length).toBe(2);
    expect(hud.querySelectorAll(".ar-plate .bar.hp, .ar-plate .bar.mp").length).toBe(4);
  });

  it("resultado: Vitória/Derrota, dano e acertos por lado, Revanche [R] e Menu [Esc]", () => {
    const el = div(
      resultHtml(content, {
        mode: "manual",
        result: "loss",
        score: "1-2",
        reason: "3 rodada(s)",
        sides: [
          { name: "Você", species: [{ speciesId: "CREATURE-0006", level: 12 }], stats: { damage: 140, hits: 9, attacks: 12 } },
          { name: "Lumi", species: [{ speciesId: "CREATURE-0012", level: 12 }], stats: { damage: 190, hits: 12, attacks: 14 } },
        ],
        ratingBefore: 1000,
        ratingAfter: 985,
      }),
    );
    expect(el.querySelector('[data-testid="result-title"]')!.textContent).toBe("Derrota");
    expect(el.querySelector('[data-testid="final-score"]')!.textContent).toBe("1-2");
    expect(el.querySelector('[data-testid="dmg-a"]')!.textContent).toBe("140");
    expect(el.querySelector('[data-testid="hits-b"]')!.textContent).toBe("12");
    expect(el.querySelector('[data-testid="rematch"]')!.textContent).toMatch(/Revanche\s*R/);
    expect(el.querySelector('[data-testid="menu"]')!.textContent).toMatch(/Menu\s*Esc/);
    expect(el.textContent).toContain("985 (-15)");
  });
});
