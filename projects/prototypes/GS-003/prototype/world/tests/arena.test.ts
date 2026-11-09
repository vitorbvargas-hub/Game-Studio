// Arena PvP local (GS-006, Fase 3): determinismo do automático, a animação não decide, posse (só Digimon do save),
// timer pela %HP, fantasmas, poder, histórico e save v8.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { createAutoArena, runAutoArena, stepAutoArena, type ArenaTeam, type Fighter } from "../src/sim/arena";
import { defaultAutoRules, initialLoadout } from "../src/sim/moves";
import { loadWorldContent } from "../src/sim/species";
import { Presenter } from "../src/render/presenter";
import {
  arenaRoster,
  botGhost,
  buildPlayerTeam,
  emptyArena,
  ghostSources,
  ghostTeam,
  imbalanceWarning,
  ownershipError,
  recordMatch,
  RATING_START,
  saveComp,
  teamPower,
  type OwnedDigimon,
} from "../src/save/arena-league";
import { deserialize, SAVE_VERSION } from "../src/save/save";

const content = loadWorldContent();

function fighter(speciesId: string, level: number, ref = `x:${speciesId}`): Fighter {
  const lo = initialLoadout(content.moves, speciesId, level);
  return { ref, speciesId, level, learned: lo.learned, moves: lo.moves, autoRules: defaultAutoRules(lo.moves) };
}

const teamA: ArenaTeam = { name: "A", fighters: [fighter("CREATURE-0006", 10), fighter("CREATURE-0009", 9), fighter("CREATURE-0012", 11)] };
const teamB: ArenaTeam = { name: "B", fighters: [fighter("CREATURE-0003", 10), fighter("CREATURE-0101", 10), fighter("CREATURE-0107", 9)] };

const save: OwnedDigimon = {
  partner: { ...fighter("CREATURE-0006", 12), xp: 0 },
  team: [
    { species: "CREATURE-0009", level: 8, hpPct: 100 },
    { species: "CREATURE-0011", level: 4, hpPct: 0 },
  ],
  box: [{ species: "CREATURE-0012", level: 7 }],
};

describe("Arena automática 3v3", () => {
  it("é determinística: mesma semente + mesmos times = mesmos eventos e mesmo resultado", () => {
    const run = (seed: number) => {
      const { arena, events } = createAutoArena(content, seed, teamA, teamB);
      const evs = [...events, ...runAutoArena(arena)];
      return { evs: JSON.stringify(evs), result: arena.result, stats: arena.stats };
    };
    const a = run(77);
    const b = run(77);
    expect(a.evs).toBe(b.evs);
    expect(a.result).toEqual(b.result);
    expect(a.stats).toEqual(b.stats);
    expect(a.result).toBeDefined();
    // outra semente muda o RNG (erro/variância/crítico) — o log não pode ser idêntico
    expect(run(78).evs).not.toBe(a.evs);
  });

  it("a animação não decide: consumir os eventos no Presenter não muda nada na sim", () => {
    const plain = createAutoArena(content, 5, teamA, teamB).arena;
    runAutoArena(plain);
    const shown = createAutoArena(content, 5, teamA, teamB);
    const p = new Presenter(() => undefined, "arena-A");
    let now = 0;
    p.onTick(shown.arena.sim.state.entities.map((e) => ({ id: e.id, kind: e.kind, name: e.name, x: e.x, y: e.y, facing: e.facing, state: e.state, hp: e.hp, maxHp: e.maxHp, level: e.level })), shown.events, now);
    while (!shown.arena.result) {
      const evs = stepAutoArena(shown.arena);
      now += 100;
      p.onTick(shown.arena.sim.state.entities.map((e) => ({ id: e.id, kind: e.kind, speciesId: e.speciesId, name: e.name, x: e.x, y: e.y, facing: e.facing, state: e.state, hp: e.hp, maxHp: e.maxHp, level: e.level })), evs, now);
      p.update(now + 37);
    }
    expect(shown.arena.result).toEqual(plain.result);
    expect(JSON.stringify(shown.arena.sim.state)).toBe(JSON.stringify(plain.sim.state));
    // e o código da Arena não importa nada da apresentação
    for (const f of ["src/sim/arena.ts", "src/save/arena-league.ts"]) expect(readFileSync(f, "utf8")).not.toMatch(/from "\.\.?\/(render|ui|assets)\//);
  });

  it("no KO entra o próximo da formação, com o HP que tinha (sem reset), e só um ativo por lado", () => {
    const { arena } = createAutoArena(content, 3, teamA, teamB);
    let swapped = false;
    while (!arena.result) {
      const evs = stepAutoArena(arena);
      const actives = arena.sim.state.entities.filter((e) => !e.removed);
      expect(actives.filter((e) => e.team === "A").length).toBeLessThanOrEqual(1);
      expect(actives.filter((e) => e.team === "B").length).toBeLessThanOrEqual(1);
      for (const ev of evs) if (ev.t === "spawn" && arena.sim.state.tick > 0) {
        swapped = true;
        const side = ev.entity.id.startsWith("A") ? 0 : 1;
        expect(ev.entity.id).toBe(`${"AB"[side]}${arena.active[side]}`);
      }
    }
    expect(swapped).toBe(true);
  });

  it("acaba por KO de um time inteiro ou pelo timer (vence a maior %HP total)", () => {
    const ko = createAutoArena(content, 9, { name: "forte", fighters: [fighter("CREATURE-0007", 20)] }, { name: "fraco", fighters: [fighter("CREATURE-0005", 2)] }).arena;
    runAutoArena(ko);
    expect(ko.result).toMatchObject({ winner: 0, reason: "ko" });
    const to = createAutoArena(content, 9, teamA, teamB, { limitTicks: 40 }).arena;
    runAutoArena(to);
    expect(to.result!.reason).toBe("timeout");
    const [a, b] = to.result!.hpPct;
    expect(to.result!.winner).toBe(a === b ? null : a > b ? 0 : 1);
  });

  it("a estratégia (prioridade do AUTO) muda o que acontece na luta", () => {
    const solo = fighter("CREATURE-0006", 10);
    const off = { ...solo, autoRules: solo.autoRules.map((r) => ({ ...r, off: true })) };
    const run = (f: Fighter) => {
      const { arena, events } = createAutoArena(content, 11, { name: "a", fighters: [f] }, { name: "b", fighters: [fighter("CREATURE-0009", 10)] });
      return [...events, ...runAutoArena(arena)].filter((e) => e.t === "attack_start" && e.attackerId === "A0").map((e) => (e as { skillId: string }).skillId);
    };
    expect(new Set(run(off))).toEqual(new Set([content.moves.basicMoveId]));
    expect(run(solo).some((id) => id !== content.moves.basicMoveId)).toBe(true);
  });

  it("Arena Nivelada (opcional): todos no nível médio; desligada, cada um no seu nível", () => {
    const free = createAutoArena(content, 1, { name: "a", fighters: [fighter("CREATURE-0006", 20)] }, { name: "b", fighters: [fighter("CREATURE-0009", 4)] }).arena;
    expect(free.roster[0][0].level).toBe(20);
    expect(free.roster[1][0].level).toBe(4);
    const lvl = createAutoArena(content, 1, { name: "a", fighters: [fighter("CREATURE-0006", 20)] }, { name: "b", fighters: [fighter("CREATURE-0009", 4)] }, { normalize: true }).arena;
    expect(lvl.level).toBe(12);
    expect(lvl.roster.flat().map((e) => e.level)).toEqual([12, 12]);
  });
});

describe("posse, fantasmas e poder", () => {
  it("não aceita Digimon que não está no save (nem repetido, nem sem PV)", () => {
    const roster = arenaRoster(save, content);
    expect(roster.map((r) => r.fighter.ref)).toEqual(["partner", "team:0", "team:1", "box:0"]);
    expect(roster.find((r) => r.fighter.ref === "team:1")!.eligible).toBe(false);
    const ok = buildPlayerTeam(save, content, [{ ref: "partner" }, { ref: "team:0" }, { ref: "box:0" }], "eu");
    expect("team" in ok && ok.team.fighters.map((f) => f.speciesId)).toEqual(["CREATURE-0006", "CREATURE-0009", "CREATURE-0012"]);
    expect(buildPlayerTeam(save, content, [{ ref: "box:5" }], "eu")).toEqual({ error: "box:5 não está no seu save" });
    expect(buildPlayerTeam(save, content, [{ ref: "partner" }, { ref: "partner" }], "eu")).toEqual({ error: "Digimon repetido" });
    expect("error" in buildPlayerTeam(save, content, [{ ref: "team:1" }], "eu")).toBe(true);
    expect("error" in buildPlayerTeam(save, content, [{ ref: "partner" }, { ref: "team:0" }, { ref: "box:0" }, { ref: "team:1" }], "eu")).toBe(true);
    // um time "forjado" (espécie/nível diferente do save) é recusado
    const t = (ok as { team: ArenaTeam }).team;
    expect(ownershipError(save, content, t)).toBeUndefined();
    expect(ownershipError(save, content, { ...t, fighters: [{ ...t.fighters[0], speciesId: "CREATURE-0007" }] })).toMatch(/não está no seu save/);
    expect(ownershipError(save, content, { ...t, fighters: [{ ...t.fighters[1], level: 40 }] })).toMatch(/não está no seu save/);
    expect(ownershipError(save, content, { ...t, fighters: [fighter("CREATURE-0013", 20, "box:3")] })).toMatch(/não está no seu save/);
  });

  it("a prioridade editada só aceita golpes que o Digimon conhece", () => {
    const r = buildPlayerTeam(save, content, [{ ref: "partner", autoRules: [{ moveId: "holy_shot", cond: "always" }, { moveId: save.partner.moves[0]!, cond: "self_hp_below_pct", pct: 30 }] }], "eu");
    expect("team" in r && r.team.fighters[0].autoRules).toEqual([{ moveId: save.partner.moves[0], cond: "self_hp_below_pct", pct: 30 }]);
  });

  it("fantasma: time salvo vira oponente; bots da floresta ficam perto em nível e estágio", () => {
    const mine = teamA.fighters;
    let arena = saveComp(emptyArena(), "Ofensivo", teamA, 1000);
    expect(ghostSources(arena).map((g) => g.id)).toEqual([`comp:${arena.comps[0].id}`, "bot:bot1", "bot:bot2", "bot:bot3"]);
    expect(ghostTeam(content, arena, `comp:${arena.comps[0].id}`, mine)!.fighters.map((f) => f.speciesId)).toEqual(teamA.fighters.map((f) => f.speciesId));
    arena = saveComp(arena, "Ofensivo", teamB, 2000);
    expect(arena.comps.length).toBe(1);
    for (const id of ["bot1", "bot2", "bot3"]) {
      const g = botGhost(content, id, mine);
      expect(g.fighters.length).toBe(3);
      for (const f of g.fighters) {
        expect(Math.abs(f.level - 10)).toBeLessThanOrEqual(1);
        expect(Math.abs(content.species[f.speciesId].stage - 2)).toBeLessThanOrEqual(1);
      }
    }
    const babies = [fighter("CREATURE-0005", 3), fighter("CREATURE-0008", 3)];
    // contra bebês, a linha com forma bebê desce para ela (Patamon → Tokomon); quem não tem fica no estágio mais próximo
    const st = botGhost(content, "bot1", babies).fighters.map((f) => content.species[f.speciesId].stage);
    expect(st[0]).toBe(1);
    expect(st.every((s) => s <= 2)).toBe(true);
  });

  it("poder e aviso de desbalanceamento", () => {
    const p = teamPower(content, teamA);
    expect(p).toBeGreaterThan(0);
    expect(imbalanceWarning(p, p)).toBeUndefined();
    expect(imbalanceWarning(200, 100)).toMatch(/seu time tem 100% mais poder/);
    expect(imbalanceWarning(100, 140)).toMatch(/oponente tem 40% mais poder/);
    expect(teamPower(content, [fighter("CREATURE-0006", 20)], 5)).toBe(teamPower(content, [fighter("CREATURE-0006", 5)]));
  });

  it("histórico e rating local separados por modo; save v8 guarda Box e Arena", () => {
    let a = emptyArena();
    const rec = { mine: [], foe: [], foeName: "Lumi", date: 1, damage: [10, 5] as [number, number], hits: [3, 2] as [number, number], normalized: false };
    a = recordMatch(a, { ...rec, mode: "auto", result: "win" });
    a = recordMatch(a, { ...rec, mode: "manual", result: "loss", score: "1-2" });
    expect(a.rating).toEqual({ auto: RATING_START + 20, manual: RATING_START - 15 });
    expect(a.history.map((h) => h.mode)).toEqual(["manual", "auto"]);
    expect(SAVE_VERSION).toBe(8);
    const v7 = (starter: string | null) => JSON.stringify({ v: 7, savedAt: 0, game: "gs003-world", data: { tamer: {}, partner: save.partner, team: [], starter, evoPrefs: {} } });
    const fresh = deserialize(v7("CREATURE-0005"));
    expect(fresh.ok && fresh.data.box).toEqual([]);
    expect(fresh.ok && fresh.data.arena).toEqual(emptyArena());
    const scene = deserialize(v7(null));
    expect(scene.ok && scene.data.box.length).toBe(12);
  });
});
