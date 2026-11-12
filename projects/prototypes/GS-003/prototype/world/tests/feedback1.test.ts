// Feedback 1 do fundador (fase 3 do Quality Overhaul): mapa-múndi, pose parada, AUTO explorador e troca de Digimon.
import { describe, expect, it } from "vitest";
import { loadCharacterCatalog, loadCreatureCatalog, type CreatureManifest } from "../src/assets/creatures";
import { legSpread, neutralWalkKey, standPose, standRemap } from "../src/render/standpose";
import { worldMapHtml } from "../src/ui/worldmap";
import { MAPS, travelTarget } from "../src/world/regions";

const f = (...keys: string[]) => keys.map((atlasKey) => ({ atlasKey, durationMs: 100 }));

describe("pose parada (pés juntos)", () => {
  it("quadro neutro do walk = o que se repete no ciclo A,B,A,C", () => {
    expect(neutralWalkKey(f("w0", "w1", "w0", "w2"))).toBe("w0");
    expect(neutralWalkKey(f("w0", "w1", "w2", "w3"))).toBeUndefined();
    expect(neutralWalkKey(f("w0", "w0"))).toBeUndefined();
  });

  it("abertura das pernas pela faixa inferior do bbox", () => {
    // 10×10: corpo de 2 px no meio; pés: juntos (2 px) ou abertos (8 px)
    const body = (x: number, y: number) => (y < 8 && x >= 4 && x <= 5 ? 255 : 0);
    const together = (x: number, y: number) => (y >= 8 ? (x >= 4 && x <= 5 ? 255 : 0) : body(x, y));
    const open = (x: number, y: number) => (y >= 8 ? (x === 1 || x === 8 ? 255 : 0) : body(x, y));
    expect(legSpread(together, 10, 10)).toBe(2);
    expect(legSpread(open, 10, 10)).toBe(8);
  });

  it("idle de passada → neutro do walk; idle desenhado fica; sem neutro cai no bbox", () => {
    const m = {
      animations: {
        walk: { loop: true, frames: f("S0"), dirFrames: { S: f("S0", "S1", "S0", "S2"), W: f("W0", "W1", "W2", "W3"), N: f("N0", "N1", "N2", "N3") } },
        idle: { loop: true, frames: f("S1"), dirFrames: { S: f("S1"), W: f("W1"), N: f("Nidle") } },
      },
    } as unknown as CreatureManifest;
    const spread: Record<string, number> = { W0: 9, W1: 12, W2: 4, W3: 7 };
    const pose = standPose(
      m,
      (k) => (x: number, y: number) => (y === 9 && x < (spread[k] ?? 10) ? 255 : y < 9 && x === 0 ? 255 : 0),
      () => ({ w: 16, h: 10 }),
    );
    expect(pose.byDir).toEqual({ S: "S0", W: "W2", N: "Nidle" });
    expect(pose.how).toEqual({ S: "neutral", W: "bbox", N: "idle" });
    const r = standRemap(m, pose);
    expect(r.get("S1")).toBe("S0");
    expect(r.get("W1")).toBe("W2");
    expect(r.has("Nidle")).toBe(false);
  });

  it("Tamers e Digimon do jogo: o idle de passada vira o quadro neutro em toda direção desenhada", () => {
    const all = { ...loadCreatureCatalog(), ...loadCharacterCatalog() };
    let remapped = 0;
    for (const cv of Object.values(all)) {
      const m = cv.manifest;
      if (!m.animations.walk?.dirFrames || !m.animations.idle) continue;
      const pose = standPose(m);
      const r = standRemap(m, pose);
      for (const [d, wf] of Object.entries(m.animations.walk.dirFrames)) {
        const idleKey = m.animations.idle.dirFrames?.[d]?.[0]?.atlasKey;
        const neutral = neutralWalkKey(wf);
        if (!idleKey || !neutral) continue;
        // ao parar o quadro mostrado é o neutro
        expect(r.get(idleKey) ?? idleKey, `${m.id} ${d}`).toBe(neutral);
        if (idleKey !== neutral) remapped++;
      }
    }
    expect(remapped).toBeGreaterThan(10);
  });
});

describe("mapa-múndi", () => {
  it("o ícone do botão Arena não usa o estilo do SVG das rotas (que ocupava o mapa inteiro)", () => {
    const html = worldMapHtml("floresta_densa", { tamerLevel: 12, defeatedBosses: [] });
    // as rotas ficam no SVG filho direto do .wm-canvas; o CSS mira só ele (.wm-canvas > svg)
    expect(html).toMatch(/<div class="wm-canvas"><svg viewBox/);
    expect(html).toMatch(/class="wm-arena"[^>]*>\s*<svg/);
  });

  it("viajar para a região volta ao último mapa visitado nela (não ao primeiro da região)", () => {
    // desde 2026-11-12 o primeiro mapa da Floresta Densa é a Digi Forest v15b
    expect(travelTarget("floresta_densa")!.id).toBe("digi-forest-v15b");
    expect(travelTarget("floresta_densa", { floresta_densa: "digimon-forest-01" })!.id).toBe("digimon-forest-01");
    expect(travelTarget("floresta_densa", { floresta_densa: "forest-proof" })!.id).toBe("forest-proof");
    // histórico inválido (mapa de outra região) é ignorado
    expect(travelTarget("floresta_densa", { floresta_densa: "vila" })!.id).toBe("digi-forest-v15b");
    expect(MAPS["digimon-forest-01"].region).toBe("floresta_densa");
  });
});

// ---------- AUTO explorador ----------
import { ENCOUNTER_TABLES } from "../src/sim/encounters/table";
import { avoidMask, bfs, cellOf, EXPLORE, inArena, pathTo } from "../src/sim/explore";
import { parseTiledMap } from "../src/sim/map";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import type { Intent, WorldEvent } from "../src/sim/types";
import { getEntity, getPlayer, stepWorld, type WorldSim } from "../src/sim/world";
import { withLook } from "../src/world/regions";

const FOREST = "digimon-forest-01";
function forest(seed = 7, encounters = true) {
  const def = withLook(MAPS[FOREST], "v9");
  const map = parseTiledMap(def.id, def.tmj);
  return createMapWorld(map, def.scene, seed, {
    auto: false,
    ...(encounters ? { world: { encounters: ENCOUNTER_TABLES[FOREST], env: { time: "day", weather: "clear" } } } : {}),
  }).sim;
}
const mine = (sim: WorldSim) => {
  const p = getPlayer(sim.state, LOCAL_PLAYER)!;
  return { p, tamer: getEntity(sim.state, p.tamerId)!, partner: getEntity(sim.state, p.partnerId)! };
};
function run(sim: WorldSim, ticks: number, perTick?: (t: number) => Intent[]): WorldEvent[] {
  const out: WorldEvent[] = [];
  for (let t = 0; t < ticks; t++) out.push(...stepWorld(sim, perTick?.(t) ?? []));
  return out;
}
const autoOn = (on = true): Intent[] => [
  { t: "set_auto", playerId: LOCAL_PLAYER, on },
  { t: "set_auto_explore", playerId: LOCAL_PLAYER, on },
];

describe("AUTO explorador", () => {
  it("BFS da colisão: o caminho só passa por células livres e não corta quina", () => {
    const sim = forest();
    const { tamer } = mine(sim);
    const m = sim.map;
    const r = bfs(m, avoidMask(m), cellOf(m, tamer), 20);
    const far = r.order[r.order.length - 1];
    const path = pathTo(r.prev, far)!;
    expect(path.length).toBeGreaterThan(5);
    let prev = cellOf(m, tamer);
    for (const c of path) {
      expect(m.solid[c]).toBe(0);
      const [x0, y0, x1, y1] = [prev % m.width, Math.floor(prev / m.width), c % m.width, Math.floor(c / m.width)];
      expect(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))).toBe(1);
      if (x1 !== x0 && y1 !== y0) expect(m.solid[y0 * m.width + x1] || m.solid[y1 * m.width + x0]).toBe(0);
      prev = c;
    }
  });

  it("anda sozinho até a grama, provoca encontro, luta e volta a explorar; recompensa única; nunca entra na arena do chefe", () => {
    const sim = forest(7);
    const { tamer, partner } = mine(sim);
    const start = { x: tamer.x, y: tamer.y };
    let inBoss = 0;
    let maxDist = 0;
    const modes = new Set<string>();
    const evs = run(sim, 2400, (t) => {
      if (inArena(sim.map, tamer)) inBoss++;
      maxDist = Math.max(maxDist, Math.hypot(tamer.x - start.x, tamer.y - start.y));
      return t === 0 ? autoOn() : [];
    });
    for (const e of evs) if (e.t === "explore_mode") modes.add(e.mode);
    const appears = evs.filter((e) => e.t === "wild_appear" && e.random);
    const rewards = evs.filter((e) => e.t === "reward");
    expect(maxDist).toBeGreaterThan(4 * 16); // andou (> 4 tiles)
    expect(modes.has("grass")).toBe(true);
    expect(modes.has("fight")).toBe(true);
    expect(appears.length).toBeGreaterThanOrEqual(1);
    expect(rewards.length).toBeGreaterThanOrEqual(1);
    // recompensa única: no máximo uma por selvagem derrotado
    const defeated = new Set(evs.filter((e) => e.t === "defeat").map((e) => (e as { id: string }).id));
    expect(rewards.length).toBeLessThanOrEqual(defeated.size);
    expect(inBoss).toBe(0);
    expect(partner.hp).toBeGreaterThan(0);
  });

  it("tecla de movimento: o jogador assume o controle (pausa) e o explorador volta depois de EXPLORE.pauseTicks sem input", () => {
    const sim = forest(11);
    const { p, tamer } = mine(sim);
    run(sim, 40, (t) => (t === 0 ? autoOn() : []));
    const evs = run(sim, 5, () => [{ t: "move_dir", playerId: LOCAL_PLAYER, dx: 1, dy: 0 }]);
    expect(p.explore!.mode === "paused" || p.explore!.pauseTicks > 0).toBe(true);
    expect(evs.some((e) => e.t === "explore_mode" && e.mode === "paused") || p.explore!.pauseTicks === EXPLORE.pauseTicks).toBe(true);
    // durante a pausa o Tamer fica parado (sem destino do explorador)
    run(sim, 3);
    expect(tamer.dest).toBeUndefined();
    run(sim, EXPLORE.pauseTicks + 20);
    expect(p.explore!.mode).not.toBe("paused");
  });

  it("parceira fraca: vai curar (ponto de cura) ou descansa; não procura briga", () => {
    const sim = forest(5);
    const { p, partner } = mine(sim);
    run(sim, 2, (t) => (t === 0 ? autoOn() : []));
    partner.hp = Math.floor(partner.maxHp * 0.2);
    const evs = run(sim, 30);
    expect(["heal", "rest"]).toContain(p.explore!.mode);
    expect(evs.some((e) => e.t === "engage")).toBe(false);
  });

  it("PV crítico em combate: foge uma vez do encontro e vai se curar; não morre em sequência", () => {
    const sim = forest(7);
    const { p, partner } = mine(sim);
    let t = 0;
    for (; t < 1500 && !partner.encounterId; t++) stepWorld(sim, t === 0 ? autoOn() : []);
    expect(partner.encounterId).toBeDefined();
    partner.hp = Math.floor(partner.maxHp * 0.2);
    const evs = run(sim, 3);
    expect(evs.some((e) => e.t === "encounter_end" && e.reason === "flee")).toBe(true);
    expect(p.explore!.mode).toBe("heal");
    // depois, nos próximos 60 s, no máximo uma derrota da parceira
    const later = run(sim, 600);
    expect(later.filter((e) => e.t === "defeat" && (e as { id: string }).id === partner.id).length).toBeLessThanOrEqual(1);
  });

  it("desligar o AUTO para o explorador (o Tamer fica onde está)", () => {
    const sim = forest(3);
    const { p, tamer } = mine(sim);
    run(sim, 30, (t) => (t === 0 ? autoOn() : []));
    run(sim, 1, () => [{ t: "set_auto", playerId: LOCAL_PLAYER, on: false }]);
    const at = { x: tamer.x, y: tamer.y };
    run(sim, 30);
    expect(p.explore).toBeUndefined();
    expect(Math.hypot(tamer.x - at.x, tamer.y - at.y)).toBeLessThan(8);
  });

  it("determinístico: mesma semente, mesmo passeio", () => {
    const trace = () => {
      const sim = forest(9);
      const { tamer } = mine(sim);
      const pts: number[] = [];
      run(sim, 600, (t) => {
        if (t % 50 === 0) pts.push(tamer.x, tamer.y);
        return t === 0 ? autoOn() : [];
      });
      return pts.join(",");
    };
    expect(trace()).toBe(trace());
  });
});

// ---------- troca de Digimon ----------
describe("troca de Digimon", () => {
  const swap = (speciesId: string, level: number, extra: Partial<Extract<Intent, { t: "swap_partner" }>> = {}): Intent => ({ t: "swap_partner", playerId: LOCAL_PLAYER, speciesId, level, ...extra });

  it("fora de combate: troca espécie/nível no mesmo id, devolve quem saiu completo e entra em recarga curta", () => {
    const sim = forest(4, false);
    const { p, partner } = mine(sim);
    const before = { id: partner.id, sp: partner.speciesId, lv: partner.level, moves: [...partner.moves] };
    const other = Object.keys(sim.content.species).find((id) => id !== before.sp && !id.startsWith("SP-"))!;
    const evs = run(sim, 1, () => [swap(other, 7, { hpPct: 50 })]);
    const ev = evs.find((e) => e.t === "partner_swap") as Extract<WorldEvent, { t: "partner_swap" }>;
    expect(ev).toBeDefined();
    expect(ev.out.speciesId).toBe(before.sp);
    expect(ev.out.level).toBe(before.lv);
    expect(ev.out.moves).toEqual(before.moves);
    expect(ev.inCombat).toBe(false);
    expect(partner.id).toBe(before.id);
    expect(partner.speciesId).toBe(other);
    expect(partner.level).toBe(7);
    // 50% na troca (+ a regeneração do próprio tick, fora de combate)
    expect(partner.hp).toBeGreaterThanOrEqual(Math.round(partner.maxHp * 0.5));
    expect(partner.hp).toBeLessThanOrEqual(Math.round(partner.maxHp * 0.5) + Math.max(1, Math.round(partner.maxHp * 0.01)));
    expect(partner.learned.length).toBeGreaterThan(0);
    expect(p.swapCd).toBe(15 - 1); // recarga fora de combate (já desconta o fim do próprio tick)
    // recarga: outra troca é recusada até acabar
    const rej = run(sim, 1, () => [swap(before.sp!, before.lv)]);
    expect(rej.some((e) => e.t === "intent_rejected" && /recarga/.test(e.reason))).toBe(true);
    run(sim, 16);
    const back = run(sim, 1, () => [swap(before.sp!, before.lv, { xp: ev.out.xp, learned: ev.out.learned, moves: ev.out.moves, autoRules: ev.out.autoRules })]);
    expect(back.some((e) => e.t === "partner_swap")).toBe(true);
    expect(partner.moves).toEqual(before.moves);
  });

  it("em combate: a nova herda o alvo e o encontro, a recarga é maior e a recompensa sai uma vez", () => {
    const sim = forest(7);
    const { p, partner } = mine(sim);
    // AUTO até a parceira entrar em combate
    let t = 0;
    for (; t < 1500 && !partner.targetId; t++) stepWorld(sim, t === 0 ? autoOn() : []);
    expect(partner.targetId).toBeDefined();
    const target = partner.targetId!;
    const other = Object.keys(sim.content.species).find((id) => id !== partner.speciesId && !id.startsWith("SP-"))!;
    const evs = run(sim, 1, () => [swap(other, partner.level + 2)]);
    const ev = evs.find((e) => e.t === "partner_swap") as Extract<WorldEvent, { t: "partner_swap" }>;
    expect(ev.inCombat).toBe(true);
    expect(p.swapCd).toBe(ev.cdTicks - 1);
    expect(ev.cdTicks).toBeGreaterThan(15);
    expect(partner.targetId).toBe(target);
    const rest = run(sim, 400);
    const rewards = rest.filter((e) => e.t === "reward");
    const defeated = new Set(rest.filter((e) => e.t === "defeat").map((e) => (e as { id: string }).id));
    expect(defeated.has(target)).toBe(true);
    expect(rewards.length).toBeLessThanOrEqual(defeated.size);
    expect(rewards.every((r) => (r as { partnerId: string }).partnerId === partner.id)).toBe(true);
  });

  it("recusa: mesma espécie e nível, espécie desconhecida", () => {
    const sim = forest(2, false);
    const { partner } = mine(sim);
    const a = run(sim, 1, () => [swap(partner.speciesId!, partner.level)]);
    expect(a.some((e) => e.t === "intent_rejected")).toBe(true);
    const b = run(sim, 1, () => [swap("NOPE", 3)]);
    expect(b.some((e) => e.t === "intent_rejected")).toBe(true);
  });
});

describe("troca de Digimon: apresentação", () => {
  it("recua (forma antiga, branca, puxada para o Tamer) e entra (forma nova revelando)", async () => {
    const { swapFrame, SWAP_RECALL_MS, SWAP_TOTAL_MS } = await import("../src/render/presenter");
    const a = swapFrame({ start: 0 }, 50);
    const b = swapFrame({ start: 0 }, SWAP_RECALL_MS - 10);
    const c = swapFrame({ start: 0 }, SWAP_RECALL_MS + 20);
    const d = swapFrame({ start: 0 }, SWAP_TOTAL_MS + 1);
    expect([a.phase, a.show]).toEqual(["recall", "from"]);
    expect(b.white).toBe(1);
    expect(b.pull).toBeGreaterThan(a.pull);
    expect(b.alpha).toBeLessThan(0.2);
    expect([c.phase, c.show]).toEqual(["enter", "to"]);
    expect(c.white).toBeGreaterThan(0.8);
    expect(d.phase).toBe("done");
  });
});

// ---------- ?team=compare: Guilmon 64 px PixelLab × Gabumon 64 px à mão ----------
import { nearestFacing, resolveFacing } from "../src/render/anim";
import { COMPARE_LEVEL, COMPARE_PAIR, COMPARE_VISUALS, compareModeOf, compareShowcase, prepareCompare, withCompareVisuals } from "../src/save/compare";

describe("?team=compare", () => {
  const cat = loadCreatureCatalog();

  it("as duas criaturas 64 px carregam com todos os quadros, mesmo canvas e pé na mesma convenção", () => {
    for (const id of Object.values(COMPARE_VISUALS)) {
      const cv = cat[id];
      expect(cv, id).toBeDefined();
      expect(cv.frameUrls).toBeDefined();
      expect(cv.manifest.dimensions.frameW).toBe(64);
      expect(cv.manifest.dimensions.frameH).toBe(64);
      expect(cv.manifest.mapScale).toBe(1);
      expect(cv.manifest.animations.idle.frames.length).toBeGreaterThan(1);
      expect(cv.manifest.animations.walk.frames.length).toBeGreaterThanOrEqual(8);
      // pé (pivô) a ≤ 2 px um do outro e corpo de ~32 px nos dois
      expect(cv.manifest.pivot.y).toBeGreaterThanOrEqual(47);
      expect(cv.manifest.pivot.y).toBeLessThanOrEqual(49);
      expect(cv.manifest.targetHeightPx).toBeGreaterThanOrEqual(31);
      expect(cv.manifest.targetHeightPx).toBeLessThanOrEqual(34);
    }
    expect(cat["CREATURE-0017"].manifest.name).toBe("Guilmon");
    expect(cat["CREATURE-0119"].manifest.name).toBe("Gabumon");
  });

  it("direções que faltam: a mais próxima ou o espelho dela (fallback nearest)", () => {
    expect(nearestFacing(["S", "SW"], "W")).toEqual({ dir: "SW", mirror: false });
    expect(nearestFacing(["S", "SW"], "E")).toEqual({ dir: "SW", mirror: true });
    expect(nearestFacing(["S", "SW"], "SE")).toEqual({ dir: "SW", mirror: true });
    expect(nearestFacing(["S", "SW"], "S")).toEqual({ dir: "S", mirror: false });
    expect(nearestFacing(["S", "SW"], "N")).toEqual({ dir: "SW", mirror: false });
    expect(nearestFacing(["S"], "W")).toEqual({ dir: "S", mirror: false });
    const gab = cat["CREATURE-0119"].manifest;
    const gui = cat["CREATURE-0017"].manifest;
    expect(resolveFacing(gab, "walk", "E")).toEqual({ dir: "SW", mirror: true });
    expect(resolveFacing(gab, "walk", "W")).toEqual({ dir: "SW", mirror: false });
    expect(resolveFacing(gui, "walk", "E")).toEqual({ dir: "S", mirror: false });
    expect(resolveFacing(gui, "idle", "E")).toEqual({ dir: "SW", mirror: true });
    // as criaturas do roster (sem `fallback`) não mudam
    const rip = cat["CREATURE-0003"].manifest;
    expect(resolveFacing(rip, "walk", "E")).toEqual({ dir: "W", mirror: true });
  });

  it("parado: idle de vários quadros desenhado (sem remapear para passada) nos dois", () => {
    for (const id of Object.values(COMPARE_VISUALS)) {
      const m = cat[id].manifest;
      const walkKeys = new Set(m.animations.walk.frames.map((f) => f.atlasKey));
      // o idle não usa quadro de passada do walk (o Guilmon usa a âncora parada, que ficou fora do ciclo)
      for (const f of m.animations.idle.frames) expect(walkKeys.has(f.atlasKey), `${id} ${f.atlasKey}`).toBe(false);
      expect(standRemap(m, standPose(m)).size).toBe(0);
    }
  });

  it("modo e equipe: Guilmon ativo no nível de teste, Gabumon na equipe; troca entre os dois", () => {
    expect(compareModeOf(new URLSearchParams("team=compare"))).toBe(true);
    expect(compareModeOf(new URLSearchParams("team=x"))).toBe(false);
    const sim = forest(4, false);
    const { partner } = mine(sim);
    const prep = prepareCompare(sim, LOCAL_PLAYER)!;
    expect(partner.speciesId).toBe(COMPARE_PAIR[0]);
    expect(partner.level).toBe(COMPARE_LEVEL);
    expect(prep.team.map((t) => t.species)).toEqual([COMPARE_PAIR[1]]);
    const evs = run(sim, 1, () => [{ t: "swap_partner", playerId: LOCAL_PLAYER, speciesId: COMPARE_PAIR[1], level: COMPARE_LEVEL }]);
    expect(evs.some((e) => e.t === "partner_swap")).toBe(true);
    expect(partner.speciesId).toBe(COMPARE_PAIR[1]);
    // retratos do HUD: a arte de comparação no lugar das duas espécies
    const shown = withCompareVisuals(cat);
    expect(shown["CREATURE-0003"]).toBe(cat["CREATURE-0017"]);
    expect(shown["CREATURE-0009"]).toBe(cat["CREATURE-0119"]);
    // modelo ao lado (capturas): npc parado, não entra em combate
    compareShowcase(sim, LOCAL_PLAYER, COMPARE_PAIR[0]);
    const show = sim.state.entities.find((e) => e.id === "compare-show")!;
    expect(show.kind).toBe("npc");
    run(sim, 30);
    expect(sim.state.entities.find((e) => e.id === "compare-show")!.x).toBe(show.x);
    compareShowcase(sim, LOCAL_PLAYER, null);
    expect(sim.state.entities.some((e) => e.id === "compare-show")).toBe(false);
  });
});
