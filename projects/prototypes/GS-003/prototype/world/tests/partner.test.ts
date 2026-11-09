// Parceira de teste ?partner=<espécie> (save/partner.ts) e o WarGreymon importado de DW DS (CREATURE-0016,
// tools/dwds_import/import_mega_dwds.js): espécie Mega mais forte, golpes fortes, visual com ataque/dano e porte
// maior que o Champion, save separado que não toca no save normal.

import { describe, expect, it } from "vitest";
import { loadCreatureCatalog, mapScaleOf } from "../src/assets/creatures";
import { resolveAnim, resolveFacing, framesFor } from "../src/render/anim";
import { captureSave } from "../src/save/offline";
import { PARTNER_SAVE_KEY, partnerParamOf, partnerStorage, partnerTestLevel, preparePartnerTest, resolvePartnerSpecies } from "../src/save/partner";
import { loadFromStorage, SAVE_KEY, saveToStorage, type StorageLike } from "../src/save/save";
import { statsAtLevel } from "@game/src/sim/formulas";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { loadWorldContent } from "../src/sim/species";
import { getEntity, getPlayer, stepWorld, type WorldSim } from "../src/sim/world";

const WARGREYMON = "CREATURE-0016";
const GREYMON = "CREATURE-0007";
const content = loadWorldContent();
const cat = loadCreatureCatalog();

function forest(seed = 7): WorldSim {
  return createForestProofWorld(seed, { auto: true }).sim;
}

function memStorage(): StorageLike & { m: Map<string, string> } {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

describe("WarGreymon (CREATURE-0016, Mega de DW DS)", () => {
  it("visual: walk N/W/S, ataque e dano, poses de batalha, porte Mega (mapScale 2) acima do Champion", () => {
    const c = cat[WARGREYMON];
    expect(c).toBeDefined();
    const m = c.manifest;
    expect(m.evolutionStage).toBe("mega");
    expect(Object.keys(m.animations.walk.dirFrames!)).toEqual(expect.arrayContaining(["N", "W", "S"]));
    // ataque/dano: os quadros de mapa da folha (de frente), usados em todas as direções
    for (const a of ["attack", "hurt"]) for (const d of ["S", "N", "W", "E"] as const) expect(framesFor(m.animations[a], resolveFacing(m, a, d).dir).length).toBeGreaterThan(0);
    expect(m.animations.attack.events?.some((e) => e.name === "hitFrame")).toBe(true);
    for (const a of ["battle_idle", "battle_attack", "battle_hurt"]) expect(m.animations[a].frames.length).toBeGreaterThan(0);
    for (const a of Object.values(m.animations)) for (const f of [...a.frames, ...Object.values(a.dirFrames ?? {}).flat()]) expect(c.atlas.frames[f.atlasKey!], f.atlasKey).toBeDefined();
    expect(resolveAnim(m, "ATTACK").name).toBe("attack");
    expect(resolveAnim(m, "HURT").name).toBe("hurt");
    // as 4 direções do jogo têm quadro de walk (E espelha W)
    for (const d of ["S", "N", "W", "E"] as const) expect(framesFor(m.animations.walk, resolveFacing(m, "walk", d).dir).length).toBeGreaterThan(0);
    expect(resolveFacing(m, "walk", "E")).toEqual({ dir: "W", mirror: true });
    const onMap = (id: string) => cat[id].manifest.nativeMapHeightPx! * mapScaleOf(cat[id].manifest);
    expect(mapScaleOf(m)).toBe(2);
    expect(onMap(WARGREYMON)).toBeGreaterThan(onMap(GREYMON) * 1.5);
  });

  it("espécie Mega mais forte que os Adultos/Perfeitos no mesmo nível, com 2–4 golpes fortes existentes", () => {
    const sp = content.species[WARGREYMON];
    expect(sp.stage).toBe(5);
    const at20 = (id: string) => statsAtLevel(content.species[id].base, content.species[id].growth, 20);
    for (const other of [GREYMON, "CREATURE-0103", "CREATURE-0013"]) {
      expect(at20(WARGREYMON).hp).toBeGreaterThan(at20(other).hp * 1.2);
      expect(at20(WARGREYMON).atk).toBeGreaterThan(at20(other).atk * 1.2);
    }
    const learn = content.moves.learnsets[WARGREYMON].map((l) => l.move);
    expect(learn.length).toBeGreaterThanOrEqual(2);
    expect(learn.length).toBeLessThanOrEqual(4);
    const gaia = content.moves.moves.gaia_force;
    expect(gaia.target).toBe("area");
    expect(gaia.power).toBeGreaterThanOrEqual(content.moves.moves.mega_flame.power);
    expect(content.moves.speciesElement[WARGREYMON]).toBe("fire");
  });

  it("não muda o jogo normal: nenhum caminho de evolução leva ao WarGreymon (falta o MetalGreymon)", () => {
    for (const ps of Object.values(content.moves.paths)) expect(ps.some((p) => p.to === WARGREYMON)).toBe(false);
  });
});

describe("?partner=<espécie> (save/partner.ts)", () => {
  it("lê o parâmetro e resolve id ou nome", () => {
    expect(partnerParamOf(new URLSearchParams("map=digimon-forest-01&look=v8&partner=wargreymon"))).toBe("wargreymon");
    expect(partnerParamOf(new URLSearchParams("look=v8"))).toBeNull();
    expect(resolvePartnerSpecies(content, "wargreymon")).toBe(WARGREYMON);
    expect(resolvePartnerSpecies(content, "War-Greymon")).toBe(WARGREYMON);
    expect(resolvePartnerSpecies(content, "creature-0016")).toBe(WARGREYMON);
    expect(resolvePartnerSpecies(content, "greymon")).toBe(GREYMON);
    expect(resolvePartnerSpecies(content, "naoexiste")).toBeNull();
  });

  it("nível compatível com o estágio (Mega no teto do pacote; Adulto no 16)", () => {
    expect(partnerTestLevel(content, WARGREYMON)).toBe(content.balance.maxLevel);
    expect(partnerTestLevel(content, GREYMON)).toBe(16);
  });

  it("troca a parceira ativa pela espécie, com os golpes equipados, e ela luta e usa o golpe forte", () => {
    const sim = forest(11);
    const prep = preparePartnerTest(sim, LOCAL_PLAYER, WARGREYMON)!;
    const e = getEntity(sim.state, getPlayer(sim.state, LOCAL_PLAYER)!.partnerId)!;
    expect(prep.speciesId).toBe(WARGREYMON);
    expect(e.speciesId).toBe(WARGREYMON);
    expect(e.name).toBe("WarGreymon");
    expect(e.hp).toBe(e.maxHp);
    expect(e.moves).toContain("gaia_force");
    expect(e.autoRules.map((r) => r.moveId)).toContain("gaia_force");
    // AUTO na floresta: o WarGreymon entra em combate, usa golpe e vence selvagens
    const used = new Set<string>();
    let kills = 0;
    for (let i = 0; i < 3000 && (kills < 2 || !used.size); i++)
      for (const ev of stepWorld(sim, [])) {
        if (ev.t === "attack_start" && ev.attackerId === e.id) used.add(ev.skillId);
        if (ev.t === "defeat" && ev.by === e.id) kills++;
      }
    expect(kills).toBeGreaterThanOrEqual(1);
    expect([...used].some((m) => ["gaia_force", "dramon_killer", "great_tornado"].includes(m))).toBe(true);
  });

  it("save separado: gravar/apagar no teste não mexe no save normal", () => {
    const sim = forest(9);
    const base = memStorage();
    const extra = { tamer: { name: "Vi", preset: 1, hair: "castanho" } as never, tamerLevel: 3, tamerXp: 0, team: [], box: [], arena: undefined as never, starter: "CREATURE-0002", map: "digimon-forest-01", seen: [], inventory: {}, quests: { day: "2026-11-09", kills: {}, claimed: [] } as never, settings: { time: "auto" as const } };
    saveToStorage(base, captureSave(sim, LOCAL_PLAYER, extra), 1000);
    const normal = base.getItem(SAVE_KEY)!;
    const test = partnerStorage(base);
    expect(loadFromStorage(test).ok).toBe(true); // 1ª carga lê o normal
    preparePartnerTest(sim, LOCAL_PLAYER, WARGREYMON);
    saveToStorage(test, captureSave(sim, LOCAL_PLAYER, extra), 2000);
    expect(base.getItem(SAVE_KEY)).toBe(normal);
    expect(base.getItem(PARTNER_SAVE_KEY)).toContain(WARGREYMON);
    const again = loadFromStorage(test);
    expect(again.ok && again.data.partner.speciesId).toBe(WARGREYMON);
    test.removeItem(SAVE_KEY);
    expect(base.getItem(SAVE_KEY)).toBe(normal);
    expect(base.getItem(PARTNER_SAVE_KEY)).toBeNull();
  });
});
