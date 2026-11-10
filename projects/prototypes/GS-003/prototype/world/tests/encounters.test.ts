// GS-012 passos 5–7 (?encounters=1): regra pura (paridade com o protótipo do simulador), autoridade local,
// pontos visíveis no lugar das zonas antigas, encontro aleatório que salta da grama e entra no combate do mapa,
// recompensa uma vez por encontro e o passeio automatizado na grama (>= 1 encontro e <= o teto).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error módulo .mjs do simulador (sem tipos)
import * as engine from "../scripts/encounters/engine.mjs";
import { INTRO_TICKS } from "../src/sim/encounters/authority";
import { encounterCeiling, newRollState, step, type RollCtx } from "../src/sim/encounters/rules";
import { ENCOUNTER_TABLES, periodOf, validateTable } from "../src/sim/encounters/table";
import { parseTiledMap } from "../src/sim/map";
import { SUB } from "../src/sim/params";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import type { Entity, Intent, WorldEvent } from "../src/sim/types";
import { encounterInspect, getEntity, getPlayer, stepWorld, type WorldSim } from "../src/sim/world";
import { MAPS, withLook } from "../src/world/regions";

const ID = "digimon-forest-01";
const TABLE = ENCOUNTER_TABLES[ID];
const ROOT = join(__dirname, "..");

function world(opts: { encounters?: boolean; time?: string; seed?: number; look?: "v8" | "v9" } = {}) {
  const def = withLook(MAPS[ID], opts.look ?? "v9");
  const map = parseTiledMap(def.id, def.tmj);
  return createMapWorld(map, def.scene, opts.seed ?? 7, {
    auto: false,
    ...(opts.encounters === false ? {} : { world: { encounters: TABLE, env: { time: opts.time ?? "day", weather: "clear" } } }),
  });
}

const wilds = (sim: WorldSim) => sim.state.entities.filter((e) => !e.removed && e.kind === "wild");
const me = (sim: WorldSim) => {
  const p = getPlayer(sim.state, LOCAL_PLAYER)!;
  return { p, tamer: getEntity(sim.state, p.tamerId)!, partner: getEntity(sim.state, p.partnerId)! };
};
const place = (e: Entity, tx: number, ty: number) => {
  e.x = tx * SUB + SUB / 2;
  e.y = ty * SUB + SUB / 2;
  e.dest = undefined;
  e.trail = [{ x: e.x - 4, y: e.y }, { x: e.x, y: e.y }];
};

describe("GS-012: tabela e regra", () => {
  it("a tabela do jogo é a mesma da fonte de design (quality-overhaul) e é válida", () => {
    const design = JSON.parse(readFileSync(join(ROOT, "../../quality-overhaul/encounters/tables/digimon-forest-01.json"), "utf8"));
    expect(TABLE).toEqual(design);
    expect(validateTable(TABLE, loadWorldContent())).toEqual([]);
    // as 2 zonas novas do brief P7 §4 estão na tabela
    expect(TABLE.areas.map((a) => a.id)).toEqual(expect.arrayContaining(["clareira-noroeste-grama", "clareira-corredor-grama"]));
  });

  it("a camada `encounters` do v9 (gerada pelo derivador) traz exatamente as áreas da tabela", () => {
    const m = parseTiledMap(ID, withLook(MAPS[ID], "v9").tmj);
    expect(m.encounterAreas!.map((a) => ({ id: a.id, terrain: a.terrain, rect: a.rect, rateMult: a.rateMult }))).toEqual(
      TABLE.areas.map((a) => ({ id: a.id, terrain: a.terrain, rect: a.rect, rateMult: a.rateMult ?? 1 })),
    );
  });

  it("rules.ts dá o mesmo resultado que o protótipo do simulador (engine.mjs), passo a passo", () => {
    const ctxs: RollCtx[] = [
      { terrain: "tall_grass", areaId: "concentracao-grama", areaRateMult: 1, time: "night", weather: "clear", partnerLevel: 6, nowSec: 0 },
      { terrain: "reeds", areaId: "riacho-oeste-juncos", areaRateMult: 1, time: "day", weather: "rain", nowSec: 0 },
      { terrain: "dense_bush", areaId: "sudeste-mata", areaRateMult: 1, time: "dusk", weather: "fog", nowSec: 0 },
    ];
    for (const ctx of ctxs) {
      const a = { rngState: 99 };
      const b = { rngState: 99 };
      const sa = newRollState(TABLE, a);
      const sb = engine.newRollState(TABLE, b);
      for (let i = 0; i < 4000; i++) {
        const ra = step(TABLE, sa, a, { ...ctx, nowSec: i * 0.32 });
        const rb = engine.step(TABLE, sb, b, { ...ctx, nowSec: i * 0.32 });
        expect(ra.kind).toBe(rb.kind);
        if (ra.kind === "encounter") expect([ra.entry.id, ra.level]).toEqual([rb.entry.id, rb.level]);
      }
      expect(a.rngState).toBe(b.rngState);
    }
  });

  it("período do relógio do jogo → período da tabela", () => {
    expect(["Dia", "Anoitecer", "Noite", "Amanhecer"].map(periodOf)).toEqual(["day", "dusk", "night", "dawn"]);
  });
});

describe("GS-012: pontos visíveis no lugar das zonas antigas (só com a flag)", () => {
  it("sem a flag nada muda: 31 selvagens das 8 zonas, sem estado de encontros", () => {
    const { sim } = world({ encounters: false });
    expect(sim.state.enc).toBeUndefined();
    expect(sim.encounters).toBeUndefined();
    expect(wilds(sim).length).toBe(31);
  });

  it("com a flag: 5 pontos, no máximo 6 vivos, de dia e de noite", () => {
    for (const time of ["day", "dusk", "night", "dawn"]) {
      const { sim } = world({ time });
      expect(sim.map.spawns.length).toBe(5);
      expect(sim.map.spawns.reduce((s, z) => s + z.count, 0)).toBe(6);
      const n = wilds(sim).length;
      expect(n).toBeLessThanOrEqual(6);
      expect(n).toBeGreaterThanOrEqual(4);
    }
    // de dia: Tentomon sim, Patamon (noite) não; de noite, o contrário
    const day = world({ time: "day" }).sim;
    const night = world({ time: "night" }).sim;
    expect(wilds(day).map((e) => e.entryId)).toContain("tentomon-clareira");
    expect(wilds(day).map((e) => e.entryId)).not.toContain("patamon-oculta");
    expect(wilds(night).map((e) => e.entryId)).toContain("patamon-oculta");
    expect(wilds(night).map((e) => e.entryId)).not.toContain("tentomon-clareira");
  });

  it("set_env troca os pontos com horário: o Tentomon some à noite e volta de dia; o teto de 6 vale sempre", () => {
    const { sim } = world({ time: "day" });
    const env = (time: string) => stepWorld(sim, [{ t: "set_env", playerId: LOCAL_PLAYER, time }]);
    const evN = env("night");
    expect(evN.some((e) => e.t === "wild_leave")).toBe(true);
    expect(wilds(sim).some((e) => e.entryId === "tentomon-clareira")).toBe(false);
    expect(wilds(sim).some((e) => e.entryId === "patamon-oculta")).toBe(true);
    env("day");
    expect(wilds(sim).some((e) => e.entryId === "tentomon-clareira")).toBe(true);
    expect(wilds(sim).length).toBeLessThanOrEqual(6);
  });

  it("flee: o Tentomon foge quando o Tamer chega perto; chase: o Dorumon persegue e entra em combate sozinho", () => {
    const { sim } = world({ time: "day" });
    const { tamer, partner } = me(sim);
    const tento = wilds(sim).find((e) => e.entryId === "tentomon-clareira")!;
    place(tamer, Math.floor(tento.x / SUB) - 1, Math.floor(tento.y / SUB));
    place(partner, Math.floor(tento.x / SUB) - 2, Math.floor(tento.y / SUB));
    const d0 = Math.hypot(tento.x - tamer.x, tento.y - tamer.y);
    for (let i = 0; i < 12; i++) stepWorld(sim, []);
    expect(Math.hypot(tento.x - tamer.x, tento.y - tamer.y)).toBeGreaterThan(d0 + SUB);
    expect(tento.alertId).toBe(tamer.id === tento.alertId ? tamer.id : tento.alertId);

    const doru = wilds(sim).find((e) => e.entryId === "dorumon-pedras")!;
    place(tamer, Math.floor(doru.x / SUB) - 3, Math.floor(doru.y / SUB));
    place(partner, Math.floor(doru.x / SUB) - 3, Math.floor(doru.y / SUB) + 1);
    let engaged = false;
    for (let i = 0; i < 60 && !engaged; i++) engaged = stepWorld(sim, []).some((e) => e.t === "engage" && e.attackerId === doru.id);
    expect(engaged).toBe(true);
    expect(doru.encounterId).toBeDefined();
    expect(partner.encounterId).toBe(doru.encounterId);
  });
});

/** Anda o Tamer local de um lado para o outro numa faixa de grama sem trilha; devolve os eventos. */
function walkInGrass(sim: WorldSim, ticks: number, row = { y: 21, x0: 20, x1: 25 }) {
  const { tamer, partner, p } = me(sim);
  p.auto = false;
  place(tamer, row.x0, row.y);
  place(partner, row.x0 - 1, row.y);
  const auth = sim.encounters!;
  for (let x = row.x0; x <= row.x1; x++) expect(auth.areaAt(x, row.y)?.id).toBe("clareira-noroeste-grama");
  const evs: WorldEvent[] = [];
  let goingEast = true;
  for (let i = 0; i < ticks; i++) {
    const tx = Math.floor(tamer.x / SUB);
    if (goingEast && tx >= row.x1) goingEast = false;
    if (!goingEast && tx <= row.x0) goingEast = true;
    const it: Intent[] = [{ t: "move_dir", playerId: LOCAL_PLAYER, dx: goingEast ? 1 : -1, dy: 0 }];
    // fica na linha (o combate pode empurrar)
    if (Math.floor(tamer.y / SUB) !== row.y) place(tamer, tx, row.y);
    evs.push(...stepWorld(sim, it));
  }
  return evs;
}

describe("GS-012: encontro aleatório (passos 5 e 7)", () => {
  it("passeio automatizado na grama: >= 1 encontro e <= o teto; cada um salta da grama, vira combate e paga 1 vez", () => {
    const { sim } = world({ time: "day", seed: 11 });
    const evs = walkInGrass(sim, 4000);
    const roll = sim.state.enc!.rolls[LOCAL_PLAYER];
    const appears = evs.filter((e): e is Extract<WorldEvent, { t: "wild_appear" }> => e.t === "wild_appear" && e.random);
    expect(appears.length).toBeGreaterThanOrEqual(1);
    expect(appears.length).toBeLessThanOrEqual(encounterCeiling(TABLE, roll.steps));
    expect(roll.encounters).toBe(appears.length);
    for (const a of appears) {
      expect(a.introMs).toBe(INTRO_TICKS * 100);
      expect(a.playerId).toBe(LOCAL_PLAYER);
      // salta perto do Tamer (1–2 tiles) e só entra em combate depois do salto
      const eng = evs.find((e) => e.t === "engage" && (e.targetId === a.id || e.attackerId === a.id));
      expect(eng).toBeDefined();
      expect(eng!.tick - a.tick).toBeGreaterThanOrEqual(INTRO_TICKS);
      const rewards = evs.filter((e) => e.t === "reward" && Math.hypot(e.at.x - a.at.x, e.at.y - a.at.y) < 40 * SUB && e.tick > a.tick);
      expect(rewards.length).toBeLessThanOrEqual(appears.length);
    }
    // recompensas: uma por chave paga, nenhuma repetida
    expect(new Set(sim.state.enc!.paid).size).toBe(sim.state.enc!.paid.length);
    // o selvagem aleatório nunca vira respawn: ao fim não sobra nenhum vivo além do que estiver em combate
    expect(wilds(sim).filter((e) => e.encKey && !e.encounterId && !(e.introTicks ?? 0) && e.state !== "DEFEAT").length).toBe(0);
  });

  it("trilha, fora de área e parceira em combate não sorteiam; a carência inicial vale", () => {
    const { sim } = world();
    const auth = sim.encounters!;
    // a trilha secundária corta a zona do corredor (x≈33): célula de trilha não é grama
    expect(auth.areaAt(33, 16)).toBeUndefined();
    expect(auth.areaAt(35, 16)?.id).toBe("clareira-corredor-grama");
    expect(auth.areaAt(5, 30)).toBeUndefined();
    const r = auth.rollOf(sim.state, LOCAL_PLAYER);
    expect(r.grace).toBeGreaterThanOrEqual(TABLE.params.graceSteps[0]);
  });

  it("recompensa e liquidação são idempotentes por encontro", () => {
    const { sim } = world();
    const auth = sim.encounters!;
    expect(auth.claimReward(sim.state, "renc-1")).toBe(true);
    expect(auth.claimReward(sim.state, "renc-1")).toBe(false);
    expect(auth.settle(sim.state, "enc-9", [LOCAL_PLAYER])).toBe(true);
    expect(auth.settle(sim.state, "enc-9", [LOCAL_PLAYER])).toBe(false);
  });

  it("debug: forçar espécie e raridade; o selvagem é individual (outro jogador não engaja) e não é alvo durante o salto", () => {
    const { sim } = world();
    const { tamer, partner } = me(sim);
    place(tamer, 22, 21);
    place(partner, 21, 21);
    const ev = stepWorld(sim, [{ t: "enc_force", playerId: LOCAL_PLAYER, entryId: "dorugamon-noite" }]);
    const ap = ev.find((e) => e.t === "wild_appear") as Extract<WorldEvent, { t: "wild_appear" }>;
    expect(ap.entryId).toBe("dorugamon-noite");
    expect(ap.rarity).toBe("very_rare");
    const w = getEntity(sim.state, ap.id)!;
    expect(w.encOwner).toBe(LOCAL_PLAYER);
    // o mapa da floresta não tem bots: a regra é a da autoridade (a mesma que o intent engage consulta)
    const auth = sim.encounters!;
    expect(auth.canEngage(LOCAL_PLAYER, w)).toBe("ainda saindo da grama");
    const rej = stepWorld(sim, [{ t: "engage", playerId: LOCAL_PLAYER, targetId: w.id }]);
    expect(rej.some((e) => e.t === "intent_rejected" && /saindo da grama/.test(e.reason))).toBe(true);
    for (let i = 0; i < INTRO_TICKS; i++) stepWorld(sim, []);
    expect(w.encounterId).toBeDefined();
    expect(auth.canEngage("outro-jogador", w)).toBe("encontro de outro jogador");
    expect(auth.canEngage(LOCAL_PLAYER, w)).toBeUndefined();
    // raridade: só entradas daquela raridade
    const { sim: s2 } = world({ seed: 3 });
    const m2 = me(s2);
    place(m2.tamer, 22, 21);
    place(m2.partner, 21, 21);
    const ev2 = stepWorld(s2, [{ t: "enc_force", playerId: LOCAL_PLAYER, rarity: "rare" }]);
    expect((ev2.find((e) => e.t === "wild_appear") as Extract<WorldEvent, { t: "wild_appear" }>).rarity).toBe("rare");
  });

  it("fuga do combate: o selvagem do encontro volta para a grama (some, sem respawn, sem recompensa)", () => {
    const { sim } = world();
    const { tamer, partner } = me(sim);
    place(tamer, 22, 21);
    place(partner, 21, 21);
    const ap = stepWorld(sim, [{ t: "enc_force", playerId: LOCAL_PLAYER, entryId: "gigimon-grama" }]).find((e) => e.t === "wild_appear") as Extract<WorldEvent, { t: "wild_appear" }>;
    for (let i = 0; i < INTRO_TICKS + 1; i++) stepWorld(sim, []);
    const evs = stepWorld(sim, [{ t: "flee", playerId: LOCAL_PLAYER }]);
    expect(evs.some((e) => e.t === "wild_leave" && e.id === ap.id)).toBe(true);
    expect(getEntity(sim.state, ap.id)).toBeUndefined();
    expect(evs.some((e) => e.t === "reward")).toBe(false);
    expect(sim.state.pendingSpawns.length).toBe(0);
  });

  it("determinístico: mesma semente e mesmas entradas → mesmos eventos", () => {
    const run = () => {
      const { sim } = world({ seed: 5 });
      return JSON.stringify(walkInGrass(sim, 900).filter((e) => e.t === "wild_appear" || e.t === "grass_rustle" || e.t === "reward"));
    };
    expect(run()).toBe(run());
  });

  it("painel de debug: chance do passo, carência e pool com % que soma 100", () => {
    const { sim } = world();
    const { tamer } = me(sim);
    place(tamer, 22, 21);
    const info = encounterInspect(sim, LOCAL_PLAYER)!;
    expect(info.areaId).toBe("clareira-noroeste-grama");
    expect(info.terrain).toBe("tall_grass");
    expect(info.pool.length).toBeGreaterThan(3);
    expect(info.pool.reduce((s, x) => s + x.pct, 0)).toBeCloseTo(100, 5);
    expect(info.visibleAlive).toBeLessThanOrEqual(6);
  });
});
