import { describe, expect, it } from "vitest";
import { ambientAt, AMBIENT, clockFromParams, formatClock, GameClock, nightMixAt, phaseAt } from "../src/render/daynight";

const hm = (h: number, m = 0) => h * 60 + m;

describe("ciclo dia/noite (apresentação)", () => {
  it("preset pelo relógio: dia 06–18, noite 19–05, transições suaves e monotônicas", () => {
    expect(nightMixAt(hm(14, 20))).toBe(0);
    expect(nightMixAt(hm(22, 10))).toBe(1);
    expect(nightMixAt(hm(3))).toBe(1);
    expect(phaseAt(hm(14, 20))).toBe("Dia");
    expect(phaseAt(hm(18, 30))).toBe("Anoitecer");
    expect(phaseAt(hm(23))).toBe("Noite");
    expect(phaseAt(hm(5, 30))).toBe("Amanhecer");
    let last = 0;
    for (let m = hm(18); m <= hm(19); m++) {
      const v = nightMixAt(m);
      expect(v).toBeGreaterThanOrEqual(last);
      expect(v - last).toBeLessThan(0.03); // sem salto
      last = v;
    }
    expect(nightMixAt(hm(18, 30))).toBeCloseTo(0.5, 5);
    last = 1;
    for (let m = hm(5); m <= hm(6); m++) {
      const v = nightMixAt(m);
      expect(v).toBeLessThanOrEqual(last);
      last = v;
    }
    expect(nightMixAt(hm(6))).toBe(0);
  });

  it("?time=night força noite; ?time=HH:MM define o início; padrão = hora local; relógio anda com timescale", () => {
    const local = new Date(2026, 10, 8, 21, 12);
    const night = new GameClock(clockFromParams(new URLSearchParams("time=night"), local));
    expect(night.nightMix(0)).toBe(1);
    expect(night.nightMix(10 * 60_000)).toBe(1);
    expect(night.phase(0)).toBe("Noite");
    const day = new GameClock(clockFromParams(new URLSearchParams("time=dia"), local));
    expect(day.nightMix(0)).toBe(0);
    const auto = new GameClock(clockFromParams(new URLSearchParams(""), local));
    expect(formatClock(auto.minutes(0))).toBe("21:12");
    expect(auto.phase(0)).toBe("Noite");
    const dusk = new GameClock(clockFromParams(new URLSearchParams("time=17:59&timescale=1"), local));
    expect(dusk.nightMix(0)).toBe(0);
    expect(dusk.nightMix(31_000)).toBeCloseTo(0.5, 2); // 31 s reais × 1 min/s → 18:30
    expect(formatClock(dusk.minutes(61_000))).toBe("19:00");
  });

  it("overlay ambiente interpola os presets do forest-v4", () => {
    expect(ambientAt(0).rgb).toEqual([...AMBIENT.day.rgb]);
    expect(ambientAt(1).rgb).toEqual([...AMBIENT.night.rgb]);
    expect(ambientAt(1).alpha).toBeCloseTo(70 / 255, 5);
    expect(ambientAt(0.5).vignette).toBeCloseTo((28 + 70) / 2 / 255, 5);
  });
});
