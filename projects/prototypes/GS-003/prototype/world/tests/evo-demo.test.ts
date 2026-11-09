// XP visível e digivolução no mapa: XP → level up → evolução elegível → evolução executada (com a parceira parada
// durante a animação), o modo de teste ?demo=evo (save novo e existente, sem tocar no save normal), a linha da
// parceira inicial com arte na forma seguinte e a linha do tempo visual (presenter).

import { describe, expect, it } from "vitest";
import { loadCreatureCatalog } from "../src/assets/creatures";
import { EVO_CHARGE_MS, EVO_FLASH_MS, EVO_LEAD_MS, EVO_SWAP_END_MS, EVO_TOTAL_MS, LEVEL_UP_DELAY_MS, evoFrame, Presenter } from "../src/render/presenter";
import { DEMO_FALLBACK_SPECIES, DEMO_SAVE_KEY, DEMO_XP_MULT, demoModeOf, demoSpecies, demoStorage, prepareDemo, typicalVictoryXp } from "../src/save/demo";
import { loadFromStorage, SAVE_KEY, saveToStorage, type StorageLike } from "../src/save/save";
import { captureSave } from "../src/save/offline";
import { WORLD } from "../src/sim/params";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { getEntity, getPlayer, restorePartner, snapshot, stepWorld, type WorldSim } from "../src/sim/world";
import starters from "../src/data/starters.json";
import type { WorldEvent } from "../src/sim/types";
import { ofType } from "./helpers";

const GIGIMON = "CREATURE-0002";
const GUILMON = "CREATURE-0003";
const GROWLMON = "CREATURE-0004";

function forest(seed = 7): WorldSim {
  return createForestProofWorld(seed, { auto: true }).sim;
}

function memStorage(init: Record<string, string> = {}): StorageLike & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

/** Roda a floresta com AUTO até a parceira evoluir (ou acabar o limite). */
function playUntilEvolve(sim: WorldSim, maxTicks = 6000): WorldEvent[] {
  const all: WorldEvent[] = [];
  for (let i = 0; i < maxTicks; i++) {
    const evs = stepWorld(sim, []);
    all.push(...evs);
    if (evs.some((e) => e.t === "evolve" && e.id === `${LOCAL_PLAYER}:partner`)) {
      // mais alguns ticks para ver a parceira parada durante a animação
      for (let j = 0; j < 5; j++) all.push(...stepWorld(sim, []));
      break;
    }
  }
  return all;
}

describe("sim: XP das vitórias, level up e parada da digivolução", () => {
  it("xpMult multiplica a XP da vitória (só a do jogador que tem o multiplicador)", () => {
    const a = forest(3);
    const b = forest(3);
    getPlayer(b.state, LOCAL_PLAYER)!.xpMult = DEMO_XP_MULT;
    const ra = ofType(playUntilEvolve(a, 1500), "reward").filter((r) => r.ownerId === LOCAL_PLAYER);
    const rb = ofType(playUntilEvolve(b, 1500), "reward").filter((r) => r.ownerId === LOCAL_PLAYER);
    expect(ra.length).toBeGreaterThan(0);
    expect(rb[0].xp).toBe(ra[0].xp * DEMO_XP_MULT);
  });

  it("XP → level up → evolução elegível → evolução executada (Auto-evoluir), parceira parada durante a animação", () => {
    const sim = forest(11);
    restorePartner(sim, LOCAL_PLAYER, { speciesId: GUILMON, level: 15, xp: 6700, learned: [], moves: [null, null, null, null], autoRules: [] });
    getPlayer(sim.state, LOCAL_PLAYER)!.autoEvolve = true;
    const evs = playUntilEvolve(sim);
    const pid = `${LOCAL_PLAYER}:partner`;
    const reward = ofType(evs, "reward").find((r) => r.partnerId === pid)!;
    const lv = ofType(evs, "level_up").find((e) => e.id === pid)!;
    const evo = ofType(evs, "evolve").find((e) => e.id === pid)!;
    expect(reward).toBeDefined();
    expect(lv.level).toBe(16);
    expect(evo).toMatchObject({ from: GUILMON, to: GROWLMON });
    // ordem: vitória (+XP) → nível 16 → evolução, na mesma vitória
    expect(evs.indexOf(reward)).toBeLessThan(evs.indexOf(lv));
    expect(evs.indexOf(lv)).toBeLessThan(evs.indexOf(evo));
    const e = getEntity(sim.state, pid)!;
    expect(e.speciesId).toBe(GROWLMON);
    expect(e.level).toBe(16);
    // parada: a lock conta para baixo e a posição não muda nos ticks seguintes
    expect(e.evolveLockTicks).toBeGreaterThan(0);
    const at = { x: e.x, y: e.y };
    for (let i = 0; i < 10; i++) stepWorld(sim, []);
    expect({ x: e.x, y: e.y }).toEqual(at);
    expect(e.state).not.toBe("ENGAGE");
    for (let i = 0; i < WORLD.evolveLockTicks; i++) stepWorld(sim, []);
    expect(e.evolveLockTicks).toBeUndefined();
  });
});

describe("?demo=evo", () => {
  it("só liga com demo=evo", () => {
    expect(demoModeOf(new URLSearchParams("map=digimon-forest-01&demo=evo"))).toBe("evo");
    expect(demoModeOf(new URLSearchParams("map=digimon-forest-01"))).toBeNull();
    expect(demoModeOf(new URLSearchParams("demo=1"))).toBeNull();
  });

  it("save novo: o bebê inicial (Gigimon Nv.1) vira Guilmon em poucas vitórias, com level up antes", () => {
    const sim = forest(21);
    restorePartner(sim, LOCAL_PLAYER, { speciesId: GIGIMON, level: 1, xp: 0, learned: [], moves: [null, null, null, null], autoRules: [] });
    getPlayer(sim.state, LOCAL_PLAYER)!.autoEvolve = false;
    const prep = prepareDemo(sim, LOCAL_PLAYER)!;
    expect(prep).toMatchObject({ speciesId: GIGIMON, level: 7, evoLevel: 8 });
    expect(prep.xpNext - prep.xp).toBe(Math.round(typicalVictoryXp() * 3));
    const p = getPlayer(sim.state, LOCAL_PLAYER)!;
    expect(p.xpMult).toBe(DEMO_XP_MULT);
    expect(p.autoEvolve).toBe(true);
    const evs = playUntilEvolve(sim);
    const wins = ofType(evs, "reward").filter((r) => r.ownerId === LOCAL_PLAYER);
    const evo = ofType(evs, "evolve").find((e) => e.id === p.partnerId);
    expect(evo).toMatchObject({ from: GIGIMON, to: GUILMON });
    expect(wins.length).toBeGreaterThanOrEqual(1);
    expect(wins.length).toBeLessThanOrEqual(4);
    expect(ofType(evs, "level_up").some((e) => e.id === p.partnerId && e.level === 8)).toBe(true);
  });

  it("save existente na forma final (Growlmon Nv.18) volta para Guilmon Nv.15 e evolui para Growlmon de novo", () => {
    const sim = forest(5);
    restorePartner(sim, LOCAL_PLAYER, { speciesId: GROWLMON, level: 18, xp: 10, learned: [], moves: [null, null, null, null], autoRules: [] });
    expect(demoSpecies(sim, GROWLMON)).toBe(GUILMON);
    const prep = prepareDemo(sim, LOCAL_PLAYER)!;
    expect(prep).toMatchObject({ from: GROWLMON, speciesId: GUILMON, level: 15, evoLevel: 16 });
    const evs = playUntilEvolve(sim);
    expect(ofType(evs, "evolve").find((e) => e.id === `${LOCAL_PLAYER}:partner`)).toMatchObject({ from: GUILMON, to: GROWLMON });
  });

  it("espécie sem linha conhecida cai no Guilmon de reserva", () => {
    const sim = forest(5);
    expect(demoSpecies(sim, "SP-NAO-EXISTE")).toBe(DEMO_FALLBACK_SPECIES);
  });

  it("storage do demo: 1ª carga lê o save normal; gravar/apagar só mexe no slot do demo", () => {
    const sim = forest(9);
    const base = memStorage();
    saveToStorage(base, captureSave(sim, LOCAL_PLAYER, { tamer: { name: "Vi", preset: 1, hair: "castanho" } as never, tamerLevel: 3, tamerXp: 0, team: [], box: [], arena: undefined as never, starter: GIGIMON, map: "digimon-forest-01", seen: [], inventory: {}, quests: { day: "2026-11-09", kills: {}, claimed: [] } as never, settings: { time: "auto" } }), 1000);
    const normal = base.getItem(SAVE_KEY)!;
    const demo = demoStorage(base);
    const loaded = loadFromStorage(demo);
    expect(loaded.ok).toBe(true);
    // muda a parceira e salva pelo storage do demo
    prepareDemo(sim, LOCAL_PLAYER);
    if (loaded.ok) saveToStorage(demo, { ...loaded.data, partner: { ...loaded.data.partner, level: 7 } }, 2000);
    expect(base.getItem(SAVE_KEY)).toBe(normal);
    expect(base.getItem(DEMO_SAVE_KEY)).toContain('"level":7');
    // 2ª carga do demo continua do slot dele
    const again = loadFromStorage(demo);
    expect(again.ok && again.data.partner.level).toBe(7);
    // "Apagar save" no demo apaga só o slot do demo
    demo.removeItem(SAVE_KEY);
    expect(base.getItem(SAVE_KEY)).toBe(normal);
    expect(base.getItem(DEMO_SAVE_KEY)).toBeNull();
    // cópia de save corrompido também vai para o slot do demo
    demo.setItem(`${SAVE_KEY}.corrupt`, "x");
    expect(base.getItem(`${SAVE_KEY}.corrupt`)).toBeNull();
    expect(base.getItem(`${DEMO_SAVE_KEY}.corrupt`)).toBe("x");
  });

  it("o multiplicador não vai para o save", () => {
    const sim = forest(9);
    prepareDemo(sim, LOCAL_PLAYER);
    const raw = JSON.stringify(captureSave(sim, LOCAL_PLAYER, { tamer: { name: "Vi", preset: 1, hair: "castanho" } as never, tamerLevel: 1, tamerXp: 0, team: [], box: [], arena: undefined as never, starter: null, map: "x", seen: [], inventory: {}, quests: undefined as never, settings: { time: "auto" } }));
    expect(raw).not.toContain("xpMult");
  });
});

describe("arte: a forma seguinte de cada parceira inicial tem sprite", () => {
  const cat = loadCreatureCatalog();
  it("bebê → Criança → Adulto das 5 iniciais, todas com folha no GAME-ASSETS (Guilmon → Growlmon incluso)", () => {
    for (const s of starters.starters) for (const id of [s.speciesId, ...s.line.map((l) => l.id)]) expect(cat[id]?.sheetUrl, `${s.name}: ${id}`).toMatch(/\.png/);
    expect(cat[GROWLMON].manifest.name).toBe("Growlmon");
  });
});

describe("presenter: +XP, Nível X! e a digivolução no mapa", () => {
  function setup() {
    const sim = forest(11);
    restorePartner(sim, LOCAL_PLAYER, { speciesId: GUILMON, level: 15, xp: 6700, learned: [], moves: [null, null, null, null], autoRules: [] });
    getPlayer(sim.state, LOCAL_PLAYER)!.autoEvolve = true;
    const cat = loadCreatureCatalog();
    const pr = new Presenter((id) => (id ? cat[id]?.manifest : undefined), LOCAL_PLAYER);
    pr.onTick(snapshot(sim), [], 0);
    return { sim, pr };
  }

  it("vitória com level up e evolução: +XP sobre a parceira, Nível 16! depois, forma antiga até o clarão", () => {
    const { sim, pr } = setup();
    let now = 0;
    let evoAt = -1;
    const seen = new Map<string, { targetId?: string }>();
    const look = () => pr.floaters.forEach((f) => !f.thirdParty && seen.set(f.text, f));
    for (let i = 0; i < 6000 && evoAt < 0; i++) {
      now += 100;
      const evs = stepWorld(sim, []);
      pr.onTick(snapshot(sim), evs, now);
      pr.update(now);
      look();
      if (evs.some((e) => e.t === "evolve")) evoAt = now;
    }
    expect(evoAt).toBeGreaterThan(0);
    const v = pr.entities.get(pr.localPartnerId)!;
    expect(v.evo).toMatchObject({ from: GUILMON, to: GROWLMON, fromName: "Guilmon", toName: "Growlmon", mine: true });
    // ainda é o Guilmon na tela
    expect(v.speciesId).toBe(GUILMON);
    expect(v.name).toBe("Guilmon");
    const start = v.evo!.start;
    // a evolução sai no tick seguinte ao da vitória, mas a animação espera o "Nível 16!" (+ EVO_LEAD_MS)
    expect(start).toBeGreaterThan(evoAt);
    expect(start).toBeGreaterThanOrEqual(LEVEL_UP_DELAY_MS + EVO_LEAD_MS);
    for (let t = now; t <= start; t += 50) {
      pr.update(t);
      look();
    }
    const texts = [...seen.keys()];
    const xpText = texts.find((t) => /^\+\d+ XP$/.test(t));
    expect(xpText).toBeDefined();
    expect(texts).toContain("Nível 16!");
    expect(seen.get(xpText!)!.targetId).toBe(pr.localPartnerId);
    expect(seen.get("Nível 16!")!.targetId).toBe(pr.localPartnerId);
    pr.update(start + EVO_FLASH_MS - 1);
    expect(v.speciesId).toBe(GUILMON);
    pr.update(start + EVO_FLASH_MS);
    expect(v.speciesId).toBe(GROWLMON);
    expect(v.name).toBe("Growlmon");
    // ticks seguintes não desfazem a revelação
    pr.onTick(snapshot(sim), [], start + EVO_FLASH_MS + 10);
    expect(v.speciesId).toBe(GROWLMON);
  });

  it("evoFrame: carga → silhuetas alternando (antiga/nova) cada vez mais rápido → clarão → revelação, ~2,7 s", () => {
    const evo = { start: 1000 };
    expect(evoFrame(evo, 900).phase).toBe("wait");
    expect(evoFrame(evo, 1000 + EVO_CHARGE_MS / 2)).toMatchObject({ phase: "charge", show: "from" });
    const shows: string[] = [];
    let swaps = 0;
    let firstGap = 0;
    let lastGap = 0;
    let lastSwapAt = 0;
    for (let t = EVO_CHARGE_MS; t < EVO_SWAP_END_MS; t += 5) {
      const f = evoFrame(evo, 1000 + t);
      expect(f.white).toBe(1);
      if (shows.length && f.show !== shows[shows.length - 1]) {
        swaps++;
        if (lastSwapAt) (firstGap ||= t - lastSwapAt), (lastGap = t - lastSwapAt);
        lastSwapAt = t;
      }
      shows.push(f.show);
    }
    expect(swaps).toBeGreaterThanOrEqual(10);
    expect(lastGap).toBeLessThan(firstGap);
    expect(evoFrame(evo, 1000 + EVO_FLASH_MS + 50)).toMatchObject({ phase: "flash", show: "to" });
    expect(evoFrame(evo, 1000 + EVO_FLASH_MS + 400).phase).toBe("reveal");
    expect(evoFrame(evo, 1000 + EVO_TOTAL_MS).phase).toBe("done");
    expect(EVO_TOTAL_MS).toBeGreaterThanOrEqual(2000);
    expect(EVO_TOTAL_MS).toBeLessThanOrEqual(3000);
  });
});
