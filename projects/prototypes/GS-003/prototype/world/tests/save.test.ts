import { describe, expect, it } from "vitest";
import { DEFAULT_LOOK } from "../src/assets/tamer-parts";
import { applyOffline, applySave, captureSave, offlineSeed } from "../src/save/offline";
import { deserialize, loadFromStorage, SAVE_KEY, SAVE_VERSION, saveToStorage, serialize, type SaveData, type StorageLike } from "../src/save/save";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { getEntity, getPlayer, partnerSaveOf, restorePartner, stepWorld } from "../src/sim/world";
import { ofType, run } from "./helpers";

const H = 3600_000;

function memStorage(): StorageLike & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), removeItem: (k) => void map.delete(k) };
}

function world(seed = 7) {
  const { sim } = createForestProofWorld(seed, { auto: true, localName: "Nina" });
  return sim;
}

const extra = { tamer: { ...DEFAULT_LOOK, name: "Nina", hairCut: "moicano" }, tamerLevel: 12, tamerXp: 30, team: [{ species: "CREATURE-0011", level: 4, hpPct: 100 }], starter: "CREATURE-0014", map: "forest-proof", seen: ["CREATURE-0014"], inventory: { digivice_padrao: 1 }, quests: { day: "2026-11-09", kills: { floresta_densa: 3 }, captures: 1, claimed: ["main_00_tutorial"] }, settings: { time: "night" as const } };

describe("save (localStorage, versionado)", () => {
  it("ida e volta: Tamer, equipe, golpes, nível, XP, bits, AUTO e Auto-evoluir", () => {
    const a = world();
    run(a, 800);
    const p = getPlayer(a.state, LOCAL_PLAYER)!;
    p.autoEvolve = true;
    const partner = getEntity(a.state, p.partnerId)!;
    const data = captureSave(a, LOCAL_PLAYER, extra);
    const store = memStorage();
    saveToStorage(store, data, 1_000_000);
    const back = loadFromStorage(store);
    expect(back.ok).toBe(true);
    if (!back.ok) return;
    expect(back.data).toEqual(data);
    expect(back.savedAt).toBe(1_000_000);
    // restaura num mundo novo (outra semente): mesma parceira, golpes e progresso
    const b = world(99);
    applySave(b, LOCAL_PLAYER, back.data);
    const pb = getPlayer(b.state, LOCAL_PLAYER)!;
    const nb = getEntity(b.state, pb.partnerId)!;
    expect([nb.speciesId, nb.level, nb.xp, nb.learned, nb.moves, nb.autoRules]).toEqual([partner.speciesId, partner.level, partner.xp, partner.learned, partner.moves, partner.autoRules]);
    expect([pb.bits, pb.auto, pb.autoEvolve, pb.captured]).toEqual([p.bits, p.auto, true, p.captured]);
    expect(nb.hp).toBe(nb.maxHp);
  });

  it("migração v1 → v2 → v3 (slots viram aprendidos, prioridade = slots, Auto-evoluir desligado, inicial desconhecido)", () => {
    const v1 = JSON.stringify({ v: 1, savedAt: 5, game: "gs003-world", data: { tamer: { name: "Rui", model: "female" }, tamerLevel: 3, bits: 40, partner: { speciesId: "CREATURE-0003", level: 9, xp: 12, moves: ["pyro_sphere", null, "investida"] } } });
    const r = deserialize(v1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.migratedFrom).toBe(1);
    expect(SAVE_VERSION).toBe(5);
    expect(r.data.starter).toBeNull();
    expect(r.data.partner.learned).toEqual(["pyro_sphere", "investida"]);
    expect(r.data.partner.moves).toEqual(["pyro_sphere", null, "investida", null]);
    expect(r.data.partner.autoRules.map((x) => x.moveId)).toEqual(["pyro_sphere", "investida"]);
    expect(r.data.autoEvolve).toBe(false);
    expect(r.data.tamer).toMatchObject({ name: "Rui", model: "female", skin: DEFAULT_LOOK.skin });
  });

  it("migração v2 → v3: mantém a parceira e marca o inicial como desconhecido; o inicial escolhido volta do save", () => {
    const v2 = JSON.stringify({ v: 2, savedAt: 7, game: "gs003-world", data: { tamer: { name: "Rui" }, tamerLevel: 3, tamerXp: 0, bits: 1, auto: false, autoEvolve: true, partner: { speciesId: "CREATURE-0003", level: 9, xp: 1, learned: ["investida"], moves: ["investida", null, null, null], autoRules: [] }, team: [], scans: {}, captured: [] } });
    const r = deserialize(v2);
    expect(r).toMatchObject({ ok: true, migratedFrom: 2, data: { starter: null, autoEvolve: true, partner: { speciesId: "CREATURE-0003", level: 9 } } });
    const back = deserialize(serialize(captureSave(world(), LOCAL_PLAYER, extra), 1));
    expect(back.ok && back.data.starter).toBe("CREATURE-0014");
  });

  it("save ruim: vazio, corrompido (com cópia .corrupt), versão futura, outro jogo, sem migração", () => {
    expect(deserialize(null)).toMatchObject({ ok: false, reason: "empty" });
    expect(deserialize("{nao json")).toMatchObject({ ok: false, reason: "corrupt" });
    expect(deserialize(JSON.stringify({ v: 9, savedAt: 1, data: {} }))).toMatchObject({ ok: false, reason: "future_version" });
    expect(deserialize(JSON.stringify({ v: 2, savedAt: 1, game: "outro", data: {} }))).toMatchObject({ ok: false, reason: "wrong_game" });
    expect(deserialize(JSON.stringify({ v: 0, savedAt: 1, data: {} }))).toMatchObject({ ok: false, reason: "migration_missing" });
    const store = memStorage();
    store.setItem(SAVE_KEY, "{lixo");
    expect(loadFromStorage(store).ok).toBe(false);
    expect(store.map.get(`${SAVE_KEY}.corrupt`)).toBe("{lixo");
    expect(JSON.parse(serialize(captureSave(world(), LOCAL_PLAYER, extra), 1)).v).toBe(SAVE_VERSION);
  });
});

describe("progresso offline (amostra da sim determinística + extrapolação, com teto)", () => {
  it("menos de 60 s não credita; 2 h credita XP, vitórias, bits e níveis pelas regras do jogo", () => {
    const a = world();
    expect(applyOffline(a, LOCAL_PLAYER, 30_000, 1)).toBeNull();
    const p = getPlayer(a.state, LOCAL_PLAYER)!;
    const bits0 = p.bits;
    const lvl0 = getEntity(a.state, p.partnerId)!.level;
    const r = applyOffline(a, LOCAL_PLAYER, 2 * H, offlineSeed(123))!;
    expect(r.capped).toBe(false);
    expect(r.ticks).toBe(72_000);
    expect(r.sampleTicks).toBe(6000);
    expect(r.wins).toBeGreaterThan(20);
    expect(r.xp).toBeGreaterThan(100);
    expect(p.bits - bits0).toBe(r.bits);
    expect(r.level).toEqual({ from: lvl0, to: getEntity(a.state, p.partnerId)!.level });
    expect(r.level.to).toBeGreaterThan(r.level.from);
    expect(r.learned).toEqual(ofType(r.events, "move_learned").map((e) => e.moveId));
    expect(r.evolutions).toEqual([]); // Auto-evoluir desligado
  });

  it("teto de 4 h e determinismo (mesmo estado + tempo + semente → mesmo relatório)", () => {
    const strip = (r: ReturnType<typeof applyOffline>) => ({ ...r!, elapsedMs: 0, capped: false });
    const a = applyOffline(world(), LOCAL_PLAYER, 10 * H, 42)!;
    const b = applyOffline(world(), LOCAL_PLAYER, 4 * H, 42)!;
    expect(a.capped).toBe(true);
    expect(a.creditedMs).toBe(4 * H);
    expect(strip(a)).toEqual(strip(b));
    expect(applyOffline(world(), LOCAL_PLAYER, 3 * H, 42)).toEqual(applyOffline(world(), LOCAL_PLAYER, 3 * H, 42));
  });

  it("Auto-evoluir: offline evolui ao atingir o nível e herda até 2 golpes (os de maior poder)", () => {
    const a = world();
    const p = getPlayer(a.state, LOCAL_PLAYER)!;
    p.autoEvolve = true;
    const evo = a.content.moves.evolutions["CREATURE-0003"];
    // Guilmon perto do nível de evolução (save de quem já jogou um tempo)
    restorePartner(a, LOCAL_PLAYER, { ...partnerSaveOf(getEntity(a.state, p.partnerId)!), level: evo.level - 1 });
    const before = [...getEntity(a.state, p.partnerId)!.learned];
    const r = applyOffline(a, LOCAL_PLAYER, 4 * H, 42)!;
    expect(r.level.to).toBeGreaterThanOrEqual(evo.level);
    expect(r.evolutions[0]).toMatchObject({ from: "CREATURE-0003", to: evo.to });
    expect(r.evolutions[0].kept.length).toBeLessThanOrEqual(a.content.moves.inheritSlotsOnEvolve);
    for (const k of r.evolutions[0].kept) expect(before.concat(r.learned)).toContain(k);
    const after = getEntity(a.state, p.partnerId)!;
    expect(after.speciesId).toBe(evo.to);
    for (const k of r.evolutions[0].kept) expect(after.learned).toContain(k);
  });
});

describe("Auto-evoluir no jogo (opção do AUTO)", () => {
  it("ligado: evolui sozinha fora de combate no nível de evolução (evento confirmado); desligado: não", () => {
    for (const on of [false, true]) {
      const a = world();
      const p = getPlayer(a.state, LOCAL_PLAYER)!;
      const partner = getEntity(a.state, p.partnerId)!;
      const evo = a.content.moves.evolutions[partner.speciesId!];
      partner.level = evo.level;
      p.auto = false;
      const evs = [...stepWorld(a, [{ t: "set_auto_evolve", playerId: LOCAL_PLAYER, on }])];
      for (let i = 0; i < 5; i++) evs.push(...stepWorld(a, []));
      const evolved = ofType(evs, "evolve");
      expect(evolved.length, `autoEvolve=${on}`).toBe(on ? 1 : 0);
      if (on) {
        expect(evolved[0]).toMatchObject({ id: partner.id, from: "CREATURE-0003", to: evo.to });
        expect(getEntity(a.state, p.partnerId)!.speciesId).toBe(evo.to);
      }
    }
  });

  it("em combate espera o fim do encontro para evoluir", () => {
    const a = world();
    const p = getPlayer(a.state, LOCAL_PLAYER)!;
    const partner = getEntity(a.state, p.partnerId)!;
    partner.level = a.content.moves.evolutions[partner.speciesId!].level;
    p.auto = false;
    partner.encounterId = "enc-x";
    stepWorld(a, [{ t: "set_auto_evolve", playerId: LOCAL_PLAYER, on: true }]);
    expect(getEntity(a.state, p.partnerId)!.speciesId).toBe("CREATURE-0003");
    partner.encounterId = undefined;
    const evs = stepWorld(a, []);
    expect(ofType(evs, "evolve")).toHaveLength(1);
  });
});

export type { SaveData };
