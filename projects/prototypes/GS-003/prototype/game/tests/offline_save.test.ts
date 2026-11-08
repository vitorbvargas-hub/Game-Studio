import { describe, expect, it } from "vitest";
import { applyOffline } from "../src/sim/offline";
import { challengeBoss, newGame, step, stepN, bossUnlocked } from "../src/sim/game";
import { deserialize, loadFromStorage, saveKey, saveToStorage, serialize, SAVE_VERSION } from "../src/sim/save";
import { ENGINE_PACK, enginePack, MemoryStorage } from "./helpers";

const c = enginePack();
const H = 3600_000;
const T0 = 1_700_000_000_000;

describe("progresso offline", () => {
  it("ignora ausências curtas", () => {
    const s = newGame(c, 1, T0);
    expect(applyOffline(c, s, T0 + 30_000)).toBeNull();
    expect(s.lastSeenAt).toBe(T0 + 30_000);
  });

  it("credita XP/bits proporcionais ao tempo", () => {
    const s1 = newGame(c, 1, T0), s2 = newGame(c, 1, T0);
    const r1 = applyOffline(c, s1, T0 + 1 * H)!;
    const r2 = applyOffline(c, s2, T0 + 2 * H)!;
    expect(r1.bits).toBeGreaterThan(0);
    expect(r1.xpPerCreature).toBeGreaterThan(0);
    expect(r2.bits / r1.bits).toBeGreaterThan(1.9);
    expect(r2.bits / r1.bits).toBeLessThan(2.1);
    expect(s1.party[0].level).toBeGreaterThan(1);
  });

  it("aplica o teto (capHours) e é determinístico", () => {
    const cap = c.balance.offline.capHours;
    const a = newGame(c, 5, T0), b = newGame(c, 5, T0), d = newGame(c, 5, T0);
    const ra = applyOffline(c, a, T0 + cap * H)!;
    const rb = applyOffline(c, b, T0 + 100 * H)!;
    applyOffline(c, d, T0 + 100 * H);
    expect(ra.capped).toBe(false);
    expect(rb.capped).toBe(true);
    expect(rb.creditedMs).toBe(cap * H);
    expect(rb.bits).toBe(ra.bits);
    expect(JSON.stringify(d.party)).toEqual(JSON.stringify(b.party));
  });

  it("aplica a eficiência offline (< ganho online)", () => {
    const online = newGame(c, 6, T0);
    stepN(c, online, (1 * H) / c.balance.tickMs);
    const off = newGame(c, 6, T0);
    applyOffline(c, off, T0 + 1 * H);
    expect(off.bits).toBeLessThan(online.bits);
    expect(off.bits).toBeGreaterThan(online.bits * c.balance.offline.efficiency * 0.6);
  });

  it("chefe em andamento é abortado sem penalidade; decisões não são tomadas offline", () => {
    const s = newGame(c, 7, T0);
    while (!bossUnlocked(c, s)) step(c, s);
    challengeBoss(c, s);
    step(c, s);
    expect(s.battle!.decision).not.toBeNull();
    applyOffline(c, s, T0 + 2 * H);
    expect(s.battle).toBeNull();
    expect(s.bossesDefeated["zona_01"]).toBeUndefined();
  });
});

describe("save versionado", () => {
  it("round-trip preserva o estado e continua determinístico", () => {
    const st = new MemoryStorage();
    const s = newGame(c, 9, T0);
    stepN(c, s, 1234);
    saveToStorage(st, s, T0 + 5000);
    const r = loadFromStorage(st, ENGINE_PACK);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    stepN(c, s, 500);
    stepN(c, r.state, 500);
    expect(JSON.stringify(r.state)).toEqual(JSON.stringify(s));
    expect(JSON.parse(st.getItem(saveKey(ENGINE_PACK))!).v).toBe(SAVE_VERSION);
  });

  it("save corrompido é preservado em .corrupt e não quebra o jogo", () => {
    const st = new MemoryStorage();
    st.setItem(saveKey(ENGINE_PACK), "{not json");
    const r = loadFromStorage(st, ENGINE_PACK);
    expect(r).toMatchObject({ ok: false, reason: "corrupt" });
    expect(st.getItem(saveKey(ENGINE_PACK) + ".corrupt")).toBe("{not json");
  });

  it("recusa versão futura e linha errada", () => {
    const s = newGame(c, 1, T0);
    const raw = serialize(s, T0);
    expect(deserialize(raw, "outro-pack")).toMatchObject({ ok: false, reason: "wrong_pack" });
    const future = JSON.stringify({ ...JSON.parse(raw), v: SAVE_VERSION + 1 });
    expect(deserialize(future, ENGINE_PACK)).toMatchObject({ ok: false, reason: "future_version" });
  });

  it("migra save v1 (formato por 'linha') para v2 (content pack)", () => {
    const s = newGame(c, 1, T0);
    const { pack: _p, ...rest } = s;
    const v1 = JSON.stringify({ v: 1, savedAt: T0, line: "line-b", state: { ...rest, line: "line-b" } });
    const r = deserialize(v1, "original-b");
    expect(r).toMatchObject({ ok: true, migratedFrom: 1 });
    if (r.ok) expect(r.state.pack).toBe("original-b");
  });

  it("migra save v2 (sem decisões de onboarding) para v3 sem pedir parceiro de novo", () => {
    const s = newGame(c, 1, T0);
    stepN(c, s, 300);
    const v2 = JSON.parse(serialize(s, T0));
    v2.v = 2;
    for (const k of ["starterPending", "scan", "recruited", "encounter", "winsSinceEncounter", "encountersChosen"]) delete v2.state[k];
    const r = deserialize(JSON.stringify(v2), ENGINE_PACK);
    expect(r).toMatchObject({ ok: true, migratedFrom: 2 });
    if (!r.ok) return;
    expect(r.state.starterPending).toBe(false);
    expect(r.state.recruited.sort()).toEqual([...new Set(s.party.map((p) => p.speciesId))].sort());
    expect(() => stepN(c, r.state, 300)).not.toThrow();
  });

  it("aplica migrações encadeadas", () => {
    const s = newGame(c, 1, T0);
    const v1 = JSON.parse(serialize(s, T0));
    v1.v = 1;
    delete v1.state.battlesLost;
    const migrations = {
      1: (e: any) => ({ ...e, v: 2, state: { ...e.state, battlesLost: 0 } }),
      2: (e: any) => ({ ...e, v: 3, state: { ...e.state, bits: e.state.bits + 1 } }),
    };
    const r = deserialize(JSON.stringify(v1), ENGINE_PACK, migrations as any, 3);
    expect(r).toMatchObject({ ok: true, migratedFrom: 1 });
    if (r.ok) {
      expect(r.state.battlesLost).toBe(0);
      expect(r.state.bits).toBe(1);
    }
    expect(deserialize(JSON.stringify(v1), ENGINE_PACK, {}, 2)).toMatchObject({ ok: false, reason: "migration_missing" });
  });
});
