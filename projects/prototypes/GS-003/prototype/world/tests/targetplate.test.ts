// P8 v2 — placa de alvo / identificação (P8_HUD_V2_SPEC.md §4.3.1, §8.1; critério 10.3 na redação do QA).
import { describe, expect, it } from "vitest";
import { EncounterFx, T_END, T_FIGHT, T_LAND, T_PLATE } from "../src/render/encounterFx";
import { PLATE, platesFor, plateSize, plateText, type PlateIntro, type PlateTarget } from "../src/render/targetplate";
import { INTRO_TICKS } from "../src/sim/encounters/authority";
import { TICK_MS } from "../src/sim/params";
import { RARITY_V2, rarityColor } from "../src/ui/hud-v2";
import table from "../src/data/encounters/digimon-forest-01.json";

const tm = { land: T_LAND, fight: T_FIGHT, fadeFrom: T_PLATE, end: T_END };
const intro = (t: number, over: Partial<PlateIntro> = {}): PlateIntro => ({ id: "w1", name: "Dorumon", level: 5, rarity: "rare", isNew: true, t, ...over });
const target = (over: Partial<PlateTarget> = {}): PlateTarget => ({ id: "w1", name: "Dorumon", level: 5, hp: 40, maxHp: 80, rarity: "rare", ...over });

describe("P8 v2 — placa de alvo", () => {
  it("medidas da spec: 20 px de altura, mínimo 64 px, +4 px de barra (+2 de folga) no combate", () => {
    expect(plateSize(10, false)).toEqual({ w: PLATE.minW, h: 20 });
    expect(plateSize(100, false).w).toBe(100 + 2 * (PLATE.pad + PLATE.border));
    expect(plateSize(10, true).h).toBe(26);
    expect(plateSize(10, true, 2)).toEqual({ w: 128, h: 52 });
    expect(PLATE.border).toBe(2);
    // fundo ≥ 0,70 (critério 10.1)
    expect(Number(PLATE.bg.split(",").pop()!.replace(")", ""))).toBeGreaterThanOrEqual(0.7);
    expect(plateText({ name: "Dorumon", level: 5 })).toBe("Dorumon Nv.5");
  });

  it("10.3 (redação corrigida): a placa surge no pouso, dentro da sequência, e não antes do selvagem sair da grama", () => {
    expect(platesFor(intro(0), undefined, tm)).toEqual([]);
    expect(platesFor(intro(T_LAND - 1), undefined, tm)).toEqual([]);
    // alvo já marcado mas o selvagem ainda escondido: nada
    expect(platesFor(intro(T_LAND - 1), target(), tm)).toEqual([]);
    const [p] = platesFor(intro(T_LAND), undefined, tm);
    expect(p).toMatchObject({ id: "w1", rarity: "rare", isNew: true, alpha: 1 });
    expect(p.hpPct).toBeUndefined();
  });

  it("10.3: a placa não atrasa o combate — o combate começa no mesmo tick de sempre (INTRO_TICKS), a placa só muda de forma", () => {
    expect(INTRO_TICKS * TICK_MS).toBe(T_FIGHT);
    expect(T_LAND).toBeLessThan(T_FIGHT);
    // antes do combate: sem barra; no tick do combate: mesma placa com a barra de PV (4 px)
    expect(platesFor(intro(T_FIGHT - 1), target(), tm)[0].hpPct).toBeUndefined();
    const [p] = platesFor(intro(T_FIGHT), target(), tm);
    expect(p).toMatchObject({ id: "w1", hpPct: 50, alpha: 1, isNew: true });
    // depois da janela da intro: continua como placa de alvo, sem NOVO
    const [q] = platesFor(intro(T_END + 500), target({ hp: 10 }), tm);
    expect(q).toMatchObject({ hpPct: 12, isNew: false, alpha: 1 });
  });

  it("selvagem que não virou alvo: a placa some como antes (2300 → 2600 ms)", () => {
    expect(platesFor(intro(T_PLATE), undefined, tm)[0].alpha).toBe(1);
    expect(platesFor(intro((T_PLATE + T_END) / 2), undefined, tm)[0].alpha).toBeCloseTo(0.5);
    expect(platesFor(intro(T_END), undefined, tm)).toEqual([]);
    // outro alvo (ponto visível) + intro do sorteado: duas placas, só o alvo com barra
    const both = platesFor(intro(T_LAND + 10), target({ id: "w2", name: "Palmon", rarity: "common" }), tm);
    expect(both.map((x) => [x.id, x.hpPct])).toEqual([["w1", undefined], ["w2", 50]]);
  });

  it("alvo fora da grama (sem intro): placa com barra de PV desde já", () => {
    expect(platesFor(undefined, target({ hp: 0 }), tm)).toEqual([expect.objectContaining({ hpPct: 0, isNew: false })]);
    expect(platesFor(undefined, undefined, tm)).toEqual([]);
  });

  it("10.3/10.4: toda raridade da tabela do piloto tem cor de borda própria (0 placas sem raridade)", () => {
    const rarities = new Set((table as { entries: { rarity: string }[] }).entries.map((e) => e.rarity));
    expect(rarities.size).toBeGreaterThanOrEqual(3);
    for (const r of rarities) expect(Object.keys(RARITY_V2)).toContain(r);
    expect(new Set([...rarities].map(rarityColor)).size).toBe(rarities.size);
  });

  it("encounterFx: a intro é exposta com o tempo desde o sorteio; no v2 a placa sai do canvas do mundo", () => {
    const fx = new EncounterFx({ localPlayerId: "p1", nameOf: () => "Dorumon", isNew: () => true, v2: true });
    fx.onEvents([{ t: "wild_appear", tick: 1, id: "w1", playerId: "p1", entryId: "e", speciesId: "s", rarity: "very_rare", level: 7, at: { x: 10, y: 10 }, introMs: T_FIGHT, random: true }], 1000);
    expect(fx.intro(1000 + T_LAND)).toMatchObject({ id: "w1", rarity: "very_rare", level: 7, t: T_LAND, isNew: true });
    const calls: string[] = [];
    const ctx = new Proxy({} as CanvasRenderingContext2D, {
      get: (_, k) => (typeof k === "string" && ["fillRect", "createRadialGradient"].includes(k) ? (...a: unknown[]) => (calls.push(k), k === "createRadialGradient" ? { addColorStop() {} } : undefined) : () => undefined),
      set: () => true,
    });
    fx.draw(ctx, { x: 0, y: 0, w: 320, h: 180 }, 1000 + T_LAND + 100, () => ({ x: 20, y: 20 }), 30);
    const v2Rects = calls.filter((c) => c === "fillRect").length;
    const v1 = new EncounterFx({ localPlayerId: "p1", nameOf: () => "Dorumon", isNew: () => true });
    v1.onEvents([{ t: "wild_appear", tick: 1, id: "w1", playerId: "p1", entryId: "e", speciesId: "s", rarity: "very_rare", level: 7, at: { x: 10, y: 10 }, introMs: T_FIGHT, random: true }], 1000);
    calls.length = 0;
    v1.draw(ctx, { x: 0, y: 0, w: 320, h: 180 }, 1000 + T_LAND + 100, () => ({ x: 20, y: 20 }), 30);
    // v1 desenha a placa no mundo (5 retângulos + NOVO); v2 não
    expect(calls.filter((c) => c === "fillRect").length).toBeGreaterThan(v2Rects);
  });
});
