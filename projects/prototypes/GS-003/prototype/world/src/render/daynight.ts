// Ciclo dia/noite (só apresentação; a sim não sabe que horas são).
// Relógio do jogo: começa na hora local real (ou em ?time=HH:MM) e anda TIME_SCALE minutos de jogo por segundo
// real (padrão 1 → um dia de jogo = 24 min reais). O preset vem do relógio: dia 06:00–17:59, noite 19:00–04:59,
// com transições suaves no anoitecer (18:00–19:00) e no amanhecer (05:00–06:00). ?time=night|day força o preset.

export type DayPhase = "Dia" | "Anoitecer" | "Noite" | "Amanhecer";

export const DUSK_START = 18 * 60;
export const NIGHT_START = 19 * 60;
export const DAWN_START = 5 * 60;
export const DAY_START = 6 * 60;
const DAY_MIN = 24 * 60;

/** Overlays de luz ambiente dos presets (forest_v4_palette.js: dia #fff3c2 α26, noite #2a1f5c α70; vinheta 28/70). */
export const AMBIENT = {
  day: { rgb: [255, 243, 194], alpha: 26 / 255, vignette: 28 / 255 },
  night: { rgb: [42, 31, 92], alpha: 70 / 255, vignette: 70 / 255 },
  ink: [24, 20, 37],
} as const;

const smooth = (t: number) => t * t * (3 - 2 * t);

/** 0 = dia pleno, 1 = noite plena; no meio, transição suave (smoothstep) pelos minutos do dia. */
export function nightMixAt(minutes: number): number {
  const m = ((minutes % DAY_MIN) + DAY_MIN) % DAY_MIN;
  if (m >= DAY_START && m < DUSK_START) return 0;
  if (m >= DUSK_START && m < NIGHT_START) return smooth((m - DUSK_START) / (NIGHT_START - DUSK_START));
  if (m >= DAWN_START && m < DAY_START) return 1 - smooth((m - DAWN_START) / (DAY_START - DAWN_START));
  return 1;
}

export function phaseAt(minutes: number): DayPhase {
  const m = ((minutes % DAY_MIN) + DAY_MIN) % DAY_MIN;
  if (m >= DAY_START && m < DUSK_START) return "Dia";
  if (m >= DUSK_START && m < NIGHT_START) return "Anoitecer";
  if (m >= DAWN_START && m < DAY_START) return "Amanhecer";
  return "Noite";
}

export function formatClock(minutes: number): string {
  const m = ((Math.floor(minutes) % DAY_MIN) + DAY_MIN) % DAY_MIN;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export interface ClockOptions {
  /** Minutos do dia no início (padrão: hora local real). */
  startMinutes: number;
  /** Minutos de jogo por segundo real. */
  scale: number;
  /** Preset fixo (?time=night|day): o relógio anda, mas a luz não muda. */
  forced?: "day" | "night";
}

/** Lê ?time= (night|noite|day|dia|HH:MM) e ?timescale=. */
export function clockFromParams(params: URLSearchParams, localNow: Date): ClockOptions {
  const t = (params.get("time") ?? "").toLowerCase();
  const scale = Math.max(0, Number(params.get("timescale") ?? 1)) || 0;
  const real = localNow.getHours() * 60 + localNow.getMinutes();
  const hm = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (hm) return { startMinutes: (Number(hm[1]) % 24) * 60 + Number(hm[2]), scale };
  if (t === "night" || t === "noite") return { startMinutes: 22 * 60 + 10, scale, forced: "night" };
  if (t === "day" || t === "dia") return { startMinutes: 14 * 60 + 20, scale, forced: "day" };
  return { startMinutes: real, scale };
}

export class GameClock {
  constructor(readonly opts: ClockOptions) {}

  /** Minutos do dia após `elapsedMs` de tempo real. */
  minutes(elapsedMs: number): number {
    return (this.opts.startMinutes + (elapsedMs / 1000) * this.opts.scale) % DAY_MIN;
  }

  nightMix(elapsedMs: number): number {
    if (this.opts.forced) return this.opts.forced === "night" ? 1 : 0;
    return nightMixAt(this.minutes(elapsedMs));
  }

  phase(elapsedMs: number): DayPhase {
    if (this.opts.forced) return this.opts.forced === "night" ? "Noite" : "Dia";
    return phaseAt(this.minutes(elapsedMs));
  }
}

/** Overlay ambiente interpolado (cor e alpha) para uma mistura noite 0..1. */
export function ambientAt(mix: number): { rgb: [number, number, number]; alpha: number; vignette: number } {
  const lerp = (a: number, b: number) => a + (b - a) * mix;
  return {
    rgb: [0, 1, 2].map((i) => Math.round(lerp(AMBIENT.day.rgb[i], AMBIENT.night.rgb[i]))) as [number, number, number],
    alpha: lerp(AMBIENT.day.alpha, AMBIENT.night.alpha),
    vignette: lerp(AMBIENT.day.vignette, AMBIENT.night.vignette),
  };
}
