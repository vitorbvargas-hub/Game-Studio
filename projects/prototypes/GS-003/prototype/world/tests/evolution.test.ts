// @vitest-environment jsdom
// Escolha de evolução (GS-003/knowledge/EVOLUTION_PROPOSAL.md §2–5): requisitos visíveis, escolha do jogador quando há
// mais de um caminho e Auto-evoluir restrito (um elegível, ou a preferência marcada). Linhas Koromon → Agumon →
// (Greymon | GeoGreymon) e Dorimon → Dorumon → (Dorugamon | Drimogemon), ramos do evolution_chains.json.

import { describe, expect, it, vi } from "vitest";
import { applySave, captureSave } from "../src/save/offline";
import { deserialize, serialize } from "../src/save/save";
import { autoEvolveTarget, checkPath, forksAhead, isBranching, manualEvolveTarget, statusesOf } from "../src/sim/evolution";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import { getEntity, getPlayer, grantXp, restorePartner, stepWorld, type WorldSim } from "../src/sim/world";
import { evolutionSectionHtml, evolveChoiceHtml } from "../src/ui/evolve-ui";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import { Hud } from "../src/ui/hud";
import type { MovesView } from "../src/ui/moves-ui";
import { ofType } from "./helpers";

const content = loadWorldContent();
const mc = content.moves;
const AGUMON = "CREATURE-0006";
const GREYMON = "CREATURE-0007";
const GEO = "SP-GEOGREYMON";
const DORUMON = "CREATURE-0101";
const DORUGAMON = "CREATURE-0102";
const DRIMO = "SP-DRIMOGEMON";

/** Mundo calmo (sem AUTO) com a parceira na espécie/nível pedidos, stats recalculados. */
function withPartner(speciesId: string, level: number, autoEvolve = false): { sim: WorldSim; pid: string } {
  const { sim } = createForestProofWorld(5, { auto: false });
  restorePartner(sim, LOCAL_PLAYER, { speciesId, level, xp: 0, learned: [], moves: [null, null, null, null], autoRules: [] });
  const p = getPlayer(sim.state, LOCAL_PLAYER)!;
  p.auto = false;
  p.autoEvolve = autoEvolve;
  return { sim, pid: p.partnerId };
}
const species = (sim: WorldSim, pid: string) => getEntity(sim.state, pid)!.speciesId;

describe("dados: ramos reais do knowledge/ (Dawn & Dusk)", () => {
  it("Agumon → Greymon | GeoGreymon e Dorumon → Dorugamon | Drimogemon; Koromon e Dorimon com caminho único", () => {
    expect(mc.paths[AGUMON].map((p) => p.to)).toEqual([GREYMON, GEO]);
    expect(mc.paths[DORUMON].map((p) => p.to)).toEqual([DORUGAMON, DRIMO]);
    expect(mc.paths["CREATURE-0005"]).toEqual([{ to: AGUMON, level: 8 }]);
    expect(mc.paths["CREATURE-0014"]).toEqual([{ to: DORUMON, level: 8 }]);
    expect(isBranching(mc, AGUMON)).toBe(true);
    expect(isBranching(mc, "CREATURE-0005")).toBe(false);
    for (const id of [GEO, DRIMO]) {
      expect(content.species[id], id).toBeDefined();
      expect(mc.learnsets[id].length).toBeGreaterThanOrEqual(2);
    }
    expect(mc.paths[AGUMON][1]).toMatchObject({ stats: { def: 25 }, source: expect.stringContaining("Defense 90+") });
    // primeiro caminho continua sendo o "evolutions" (telas antigas, prévia do inicial)
    expect(mc.evolutions[DORUMON]).toEqual({ to: DORUGAMON, level: 16 });
    expect(forksAhead(mc, "CREATURE-0005")).toEqual([AGUMON]);
    expect(forksAhead(mc, "CREATURE-0014")).toEqual([DORUMON]);
  });

  it("requisitos: nível e atributo, cada um cumprido ou não, com o valor atual", () => {
    expect(checkPath(mc.paths[AGUMON][1], 16, { hp: 0, atk: 0, def: 23, spd: 0 })).toEqual([
      { stat: "level", need: 16, have: 16, ok: true },
      { stat: "def", need: 25, have: 23, ok: false },
    ]);
  });
});

describe("regra pura do Auto-evoluir e do pedido manual", () => {
  const st = (eligible: string[], all = [GREYMON, GEO]) => all.map((to) => ({ path: { to, level: 16 }, reqs: [], eligible: eligible.includes(to) }));
  it("um elegível → evolui; dois sem preferência → espera; preferência elegível → ela; preferência pendente → espera", () => {
    expect(autoEvolveTarget(st([GREYMON]))).toBe(GREYMON);
    expect(autoEvolveTarget(st([GREYMON, GEO]))).toBeNull();
    expect(autoEvolveTarget(st([GREYMON, GEO]), GEO)).toBe(GEO);
    expect(autoEvolveTarget(st([GREYMON]), GEO)).toBeNull();
    expect(autoEvolveTarget(st([]))).toBeNull();
    // preferência de outro ramo (não é caminho desta espécie) é ignorada
    expect(autoEvolveTarget(st([GREYMON]), "X")).toBe(GREYMON);
  });
  it("manual: sem `to` só com um elegível; `to` precisa estar elegível", () => {
    expect(manualEvolveTarget(st([GREYMON]))).toEqual({ to: GREYMON });
    expect(manualEvolveTarget(st([GREYMON, GEO]))).toEqual({ reason: "escolha o caminho da evolução" });
    expect(manualEvolveTarget(st([GREYMON, GEO]), GEO)).toEqual({ to: GEO });
    expect(manualEvolveTarget(st([]), "Z")).toEqual({ reason: "caminho inválido" });
    expect(manualEvolveTarget([])).toEqual({ reason: "não evolui" });
  });
});

describe("na sim", () => {
  it("Agumon Nv.16 (Defesa 23): só Greymon elegível → Auto-evoluir vai para Greymon", () => {
    const { sim, pid } = withPartner(AGUMON, 16, true);
    expect(statusesOf(mc, getEntity(sim.state, pid)!).map((s) => s.eligible)).toEqual([true, false]);
    const evs = stepWorld(sim, []);
    expect(ofType(evs, "evolve")[0]).toMatchObject({ from: AGUMON, to: GREYMON });
  });

  it("Agumon Nv.18 (Defesa 25): dois elegíveis → Auto-evoluir espera; com preferência GeoGreymon, evolui para ela", () => {
    const { sim, pid } = withPartner(AGUMON, 18, true);
    for (let i = 0; i < 5; i++) stepWorld(sim, []);
    expect(species(sim, pid)).toBe(AGUMON);
    // a preferência entra no tick e o Auto-evoluir (fim do mesmo tick) já segue por ela
    const evs = [...stepWorld(sim, [{ t: "set_evo_pref", playerId: LOCAL_PLAYER, from: AGUMON, to: GEO }]), ...stepWorld(sim, [])];
    expect(ofType(evs, "evolve")[0]).toMatchObject({ from: AGUMON, to: GEO });
    expect(getEntity(sim.state, pid)!.name).toBe("GeoGreymon");
  });

  it("Dorumon Nv.16: os dois ramos abertos; o pedido sem caminho é recusado, com caminho evolui para ele", () => {
    const { sim, pid } = withPartner(DORUMON, 16);
    expect(statusesOf(mc, getEntity(sim.state, pid)!).every((s) => s.eligible)).toBe(true);
    let evs = stepWorld(sim, [{ t: "evolve", playerId: LOCAL_PLAYER }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("escolha o caminho da evolução");
    expect(species(sim, pid)).toBe(DORUMON);
    evs = stepWorld(sim, [{ t: "evolve", playerId: LOCAL_PLAYER, to: DRIMO }]);
    expect(ofType(evs, "evolve")[0]).toMatchObject({ from: DORUMON, to: DRIMO });
  });

  it("caminho com requisito pendente é recusado com o motivo (Defesa)", () => {
    const { sim } = withPartner(AGUMON, 16);
    const evs = stepWorld(sim, [{ t: "evolve", playerId: LOCAL_PLAYER, to: GEO }]);
    expect(ofType(evs, "intent_rejected")[0].reason).toBe("precisa de Defesa 25+");
  });

  it("preferência: só caminhos da espécie; null volta a 'perguntar sempre'", () => {
    const { sim } = withPartner(DORUMON, 10);
    const p = getPlayer(sim.state, LOCAL_PLAYER)!;
    const bad = stepWorld(sim, [{ t: "set_evo_pref", playerId: LOCAL_PLAYER, from: DORUMON, to: GREYMON }]);
    expect(ofType(bad, "intent_rejected")).toHaveLength(1);
    stepWorld(sim, [{ t: "set_evo_pref", playerId: LOCAL_PLAYER, from: DORUMON, to: DORUGAMON }]);
    expect(p.evoPrefs).toEqual({ [DORUMON]: DORUGAMON });
    stepWorld(sim, [{ t: "set_evo_pref", playerId: LOCAL_PLAYER, from: DORUMON, to: null }]);
    expect(p.evoPrefs).toEqual({});
  });

  it("offline (grantXp com Auto-evoluir): Dorimon para no Dorumon sem preferência; com preferência segue o ramo", () => {
    const a = withPartner("CREATURE-0014", 1);
    grantXp(a.sim, a.pid, 400_000, true);
    expect(species(a.sim, a.pid)).toBe(DORUMON);
    const b = withPartner("CREATURE-0014", 1);
    getPlayer(b.sim.state, LOCAL_PLAYER)!.evoPrefs = { [DORUMON]: DORUGAMON };
    const evs = grantXp(b.sim, b.pid, 400_000, true);
    expect(ofType(evs, "evolve").map((e) => e.to).slice(0, 2)).toEqual([DORUMON, DORUGAMON]);
  });

  it("save v7: preferências vão e voltam; save v6 migra sem preferência", () => {
    const { sim } = withPartner(DORUMON, 10);
    getPlayer(sim.state, LOCAL_PLAYER)!.evoPrefs = { [DORUMON]: DRIMO };
    const extra = { tamer: { name: "Ana", preset: "TAMER-0003", hair: "ruivo" }, tamerLevel: 1, tamerXp: 0, team: [], starter: null, map: "vila", seen: [], inventory: {}, quests: { day: "2026-11-09", kills: {}, captures: 0, claimed: [] }, settings: { time: "auto" as const } };
    const back = deserialize(serialize(captureSave(sim, LOCAL_PLAYER, extra), 1));
    expect(back.ok && back.data.evoPrefs).toEqual({ [DORUMON]: DRIMO });
    const b = withPartner(DORUMON, 10);
    if (back.ok) applySave(b.sim, LOCAL_PLAYER, back.data);
    expect(getPlayer(b.sim.state, LOCAL_PLAYER)!.evoPrefs).toEqual({ [DORUMON]: DRIMO });
    const v6 = JSON.parse(serialize(captureSave(sim, LOCAL_PLAYER, extra), 1));
    v6.v = 6;
    delete v6.data.evoPrefs;
    expect(deserialize(JSON.stringify(v6))).toMatchObject({ ok: true, migratedFrom: 6, data: { evoPrefs: {} } });
  });
});

describe("UI (pt-BR)", () => {
  const agumon16 = { speciesId: AGUMON, name: "Agumon", level: 16, stats: { hp: 0, atk: 0, def: 23, spd: 0 } };

  it("modal: todos os caminhos com prévia, estágio, requisitos ✓/✗ e botão só no elegível", () => {
    document.body.innerHTML = evolveChoiceHtml(content, agumon16);
    const paths = [...document.querySelectorAll<HTMLElement>("[data-evo-path]")];
    expect(paths.map((p) => p.dataset.evoPath)).toEqual([GREYMON, GEO]);
    expect(document.querySelectorAll("canvas[data-evo-sp]")).toHaveLength(2);
    expect(paths[0].querySelector("h3")!.textContent).toBe("Greymon");
    expect(paths[0].textContent).toContain("Adulto");
    expect(paths[1].querySelector('[data-req="def"]')!.className).toBe("no");
    expect(paths[1].querySelector('[data-req="def"]')!.textContent).toContain("Defesa 25+");
    expect(paths[1].querySelector('[data-req="def"]')!.textContent).toContain("você: 23");
    expect(paths[1].querySelector('[data-req="level"]')!.className).toBe("ok");
    expect(paths[0].querySelector("[data-evolve-to]")!.textContent).toBe("Evoluir para Greymon");
    expect(paths[1].querySelector("[data-evolve-to]")).toBeNull();
    expect(paths[1].textContent).toContain("Dawn & Dusk");
    expect(document.querySelector("[data-evo-later]")!.textContent).toBe("Agora não");
  });

  it("modal com dois elegíveis pede a escolha; em combate os botões ficam bloqueados", () => {
    document.body.innerHTML = evolveChoiceHtml(content, { ...agumon16, level: 18, stats: { hp: 0, atk: 0, def: 25, spd: 0 } }, { inCombat: true });
    expect(document.querySelector(".lead")!.textContent).toContain("2 caminhos");
    const btns = [...document.querySelectorAll<HTMLButtonElement>("[data-evolve-to]")];
    expect(btns).toHaveLength(2);
    expect(btns.every((b) => b.disabled)).toBe(true);
  });

  it("aba Golpes / Evolução: ramificações da linha com a preferência; trocar o select manda set_evo_pref", () => {
    const html = evolutionSectionHtml(content, { speciesId: "CREATURE-0005", name: "Koromon", level: 5, stats: { hp: 0, atk: 0, def: 0, spd: 0 } }, { [AGUMON]: GEO }, true);
    document.body.innerHTML = html;
    const sel = document.querySelector<HTMLSelectElement>(`select[data-evo-pref="${AGUMON}"]`)!;
    expect([...sel.options].map((o) => o.textContent)).toEqual(["Perguntar sempre", "Greymon", "GeoGreymon"]);
    expect(sel.value).toBe(GEO);

    document.body.innerHTML = '<div id="hud"></div>';
    const onSetEvoPref = vi.fn();
    const scene = { region: FOREST_PROOF_SCENE.region, tamerName: "Kaio", tamerLevel: 12, tamerXp: FOREST_PROOF_SCENE.tamerXp, team: FOREST_PROOF_SCENE.team, box: FOREST_PROOF_SCENE.box, chat: FOREST_PROOF_SCENE.chat };
    const hud = new Hud(document.querySelector<HTMLElement>("#hud")!, content, "p1", { onAuto: () => {}, onFlee: () => {}, onSetEvoPref }, false, { scene });
    hud.updatePartner({ id: "p1:partner", kind: "partner", speciesId: AGUMON, ownerId: "p1", name: "Agumon", x: 0, y: 0, facing: "S", state: "IDLE", hp: 50, maxHp: 80, level: 16 }, 0, 10, 0);
    const view: MovesView = { id: "p1:partner", speciesId: AGUMON, name: "Agumon", level: 16, mp: 10, maxMp: 50, learned: ["investida"], moves: ["investida", null, null, null], autoRules: [], cd: {}, inCombat: false, stats: { hp: 90, atk: 40, def: 23, spd: 30 }, evoPrefs: {} };
    hud.updateMoves(view);
    hud.openTeam();
    document.querySelector<HTMLButtonElement>('[data-testid="tab-moves"]')!.click();
    expect(document.querySelector('[data-testid="tab-moves"]')!.textContent).toContain("Golpes / Evolução");
    const s = document.querySelector<HTMLSelectElement>(`select[data-evo-pref="${AGUMON}"]`)!;
    s.value = GREYMON;
    s.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onSetEvoPref).toHaveBeenCalledWith(AGUMON, GREYMON);
    s.value = "";
    s.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onSetEvoPref).toHaveBeenLastCalledWith(AGUMON, null);
  });
});
