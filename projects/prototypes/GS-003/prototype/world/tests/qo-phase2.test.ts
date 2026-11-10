// Quality Overhaul, fase 2: escala por devicePixelRatio (?dpr=1), quadros redimensionados marcados e o
// controlador de animação v2 (?anim=v2). Só apresentação: nada aqui toca a sim.
import { afterEach, describe, expect, it } from "vitest";
import { animHasResampled, loadCreatureCatalog, type CreatureAnimation, type CreatureManifest } from "../src/assets/creatures";
import { HIT_STOP_MS, realAnim, setSkipResampled } from "../src/render/anim";
import {
  anatomyOf,
  artFor,
  attackFrame,
  attackPhase,
  ctlFrame,
  fallbackTable,
  newCtl,
  RUN_FACTOR,
  stepCtl,
  TURN_MS,
  VICTORY_MS,
  type CtlInput,
  type CtlState,
} from "../src/render/animctl";
import { dprLayout, REF_CHAR_PX } from "../src/render/scale";

describe("escala ?dpr=1 (pixels físicos inteiros)", () => {
  it("1920×1080 a DPR 1: personagem em 8–10% da altura e pixel inteiro", () => {
    const r = dprLayout(1920, 1080, 1);
    expect(Number.isInteger(r.scale)).toBe(true);
    expect(r.charPct).toBeGreaterThanOrEqual(8);
    expect(r.charPct).toBeLessThanOrEqual(10);
    expect(r.cssW).toBeGreaterThanOrEqual(1920);
    expect(r.logicalW * r.scale).toBeGreaterThanOrEqual(1920);
  });

  it("Windows 125% e 150%: escala inteira em pixels FÍSICOS (larguras iguais), CSS fracionário", () => {
    for (const dpr of [1.25, 1.5, 1.75, 2]) {
      const cssW = Math.round(1920 / dpr);
      const cssH = Math.round(1080 / dpr);
      const r = dprLayout(cssW, cssH, dpr);
      expect(Number.isInteger(r.scale), `dpr ${dpr}`).toBe(true);
      // cada pixel lógico = `scale` pixels físicos exatos: CSS × dpr volta a ser inteiro por pixel lógico
      expect(r.cssPerLogical * dpr).toBeCloseTo(r.scale, 9);
      expect(r.charPct, `dpr ${dpr}`).toBeGreaterThanOrEqual(7);
      expect(r.charPct, `dpr ${dpr}`).toBeLessThanOrEqual(11);
    }
  });

  it("?zoom=N força a escala; ?charh muda o alvo", () => {
    expect(dprLayout(1920, 1080, 1, { zoom: 5 }).scale).toBe(5);
    expect(dprLayout(1920, 1080, 1, { charPct: 14 }).scale).toBeGreaterThan(dprLayout(1920, 1080, 1, { charPct: 8 }).scale);
    expect(REF_CHAR_PX).toBeGreaterThan(20);
  });

  it("tela pequena nunca cai abaixo de 1", () => {
    expect(dprLayout(320, 200, 1).scale).toBe(1);
    expect(dprLayout(0, 0, Number.NaN).scale).toBe(1);
  });
});

describe("quadros redimensionados marcados (resampled)", () => {
  const cat = loadCreatureCatalog();
  afterEach(() => setSkipResampled(false));

  it("toda espécie com attack/hurt reduzidos da batalha tem `resampled` cobrindo esses quadros", () => {
    for (const c of Object.values(cat)) {
      const m = c.manifest;
      for (const name of ["attack", "hurt"]) {
        const a = m.animations[name];
        if (!a) continue;
        const keys = [...a.frames, ...Object.values(a.dirFrames ?? {}).flat()].map((f) => f.atlasKey ?? "");
        if (keys.some((k) => k.includes(`_${name}_`))) expect(animHasResampled(m, a), `${m.id} ${name}`).toBe(true);
      }
    }
  });

  it("Gigimon e Dorimon (redimensionados no asset inteiro) estão marcados por direção", () => {
    expect(cat["CREATURE-0002"].manifest.resampled?.[0].directions).toContain("S");
    expect(cat["CREATURE-0014"].manifest.resampled?.[0].directions).toContain("W");
  });

  it("com ?dpr=1 a animação marcada sai do mapa (cai no procedural sobre o quadro original)", () => {
    const m = cat["CREATURE-0003"].manifest;
    expect(realAnim(m, "attack")).toBeDefined();
    setSkipResampled(true);
    expect(realAnim(m, "attack")).toBeUndefined();
    expect(realAnim(m, "walk")).toBeDefined();
  });

  it("toda espécie em uso declara anatomia", () => {
    for (const c of Object.values(cat)) if (/^CREATURE-0(0|1)/.test(c.manifest.id)) expect(["biped", "quadruped", "flyer", "blob"], c.manifest.id).toContain(c.manifest.anatomy);
  });
});

// ---------- controlador v2 ----------

const fr = (key: string, ms = 100) => ({ atlasKey: key, durationMs: ms });
const anim = (keys: string[], loop = true, ms = 100, events?: CreatureAnimation["events"]): CreatureAnimation =>
  ({ frames: keys.map((k) => fr(k, ms)), loop, events }) as CreatureAnimation;

function manifest(extra: Partial<CreatureManifest> = {}, anims: Record<string, CreatureAnimation> = {}): CreatureManifest {
  return {
    id: "CREATURE-T",
    name: "Testmon",
    walkSpeedPxPerSec: 100,
    animations: { idle: anim(["i0"]), walk: anim(["w0", "w1", "w2", "w3"], true, 150), ...anims },
    ...extra,
  } as CreatureManifest;
}

const base: CtlInput = { now: 0, lt: 0, visual: "IDLE", speed: 0, face: "S", walked: 0, isPartner: false };

/** Roda o controlador quadro a quadro (16 ms) aplicando `at(t)` sobre a entrada base. */
function drive(m: CreatureManifest, ms: number, at: (t: number) => Partial<CtlInput>, c0: CtlState = newCtl("S", 0)): { c: CtlState; seen: string[] } {
  let c = c0;
  const seen: string[] = [];
  for (let t = 0; t <= ms; t += 16) {
    c = stepCtl(c, { ...base, now: t, lt: t, ...at(t) }, m);
    if (seen[seen.length - 1] !== c.state) seen.push(c.state);
  }
  return { c, seen };
}

describe("controlador de animação v2 (?anim=v2)", () => {
  it("parado → idle; andando → walk; acima do limiar → run; parceira seguindo → follow", () => {
    const m = manifest();
    expect(drive(m, 50, () => ({})).c.state).toBe("idle");
    expect(drive(m, 50, () => ({ speed: 90, visual: "WALK" })).c.state).toBe("walk");
    expect(drive(m, 50, () => ({ speed: 100 * RUN_FACTOR + 5, visual: "WALK" })).c.state).toBe("run");
    expect(drive(m, 50, () => ({ speed: 90, visual: "FOLLOW", isPartner: true })).c.state).toBe("follow");
  });

  it("troca de direção passa por turn e volta à locomoção anterior", () => {
    const m = manifest();
    const { c, seen } = drive(m, 400, (t) => ({ speed: 90, visual: "WALK", face: t < 100 ? "E" : "W" }), { ...newCtl("E", 0) });
    expect(seen).toEqual(["walk", "turn", "walk"]);
    expect(c.log).toContain("walk>turn");
    expect(c.log).toContain("turn>walk");
  });

  it("turn sem arte dura TURN_MS e afunda 1 px no começo (fallback documentado)", () => {
    const m = manifest();
    let c = drive(m, 32, (t) => ({ face: t < 16 ? "S" : "N" })).c;
    expect(c.state).toBe("turn");
    const f = ctlFrame(c, { ...base, now: 32, lt: 32, face: "N" }, m);
    expect(f.fallback).toBe(true);
    expect(f.procedural).toBe("dip");
    expect(f.dy).toBe(1);
    c = stepCtl(c, { ...base, now: 32 + TURN_MS + 20, lt: 32 + TURN_MS + 20, face: "N" }, m);
    expect(c.state).toBe("idle");
  });

  it("ataque: fases antecipação → ação → impacto → recuperação e volta ao estado anterior", () => {
    const m = manifest({}, { attack: anim(["a0", "a1", "a2"], false, 100, [{ name: "hitFrame", frame: 1 }]) });
    const atk = { start: 100, hitAtMs: 100, durationMs: 300, special: false, targetId: "w1" };
    const phases: string[] = [];
    let c = newCtl("S", 0);
    for (let t = 0; t <= 600; t += 10) {
      const inAtk = t >= 100 && t < 400;
      const i: CtlInput = { ...base, now: t, lt: t, speed: 0, visual: inAtk ? "ATTACK" : "IDLE", attack: t >= 100 ? atk : undefined };
      c = stepCtl(c, i, m);
      if (c.state === "attack") {
        const f = ctlFrame(c, i, m);
        if (phases[phases.length - 1] !== f.phase) phases.push(f.phase!);
      }
    }
    expect(phases).toEqual(["anticipation", "action", "impact", "recovery"]);
    expect(c.state).toBe("idle");
    expect(c.log).toEqual(expect.arrayContaining(["idle>attack", "attack>idle"]));
    expect(attackPhase(0, 100)).toBe("anticipation");
    expect(attackPhase(100 + HIT_STOP_MS + 1, 100)).toBe("recovery");
  });

  it("ataque andando volta para walk; golpe novo reentra no ataque", () => {
    const m = manifest({}, { attack: anim(["a0", "a1", "a2"], false) });
    const a1 = { start: 0, hitAtMs: 100, durationMs: 300, special: false, targetId: "w1" };
    let c = stepCtl(newCtl("S", 0), { ...base, visual: "ATTACK", attack: a1, speed: 90 }, m);
    expect(c.state).toBe("attack");
    const a2 = { ...a1, start: 250 };
    c = stepCtl(c, { ...base, now: 250, lt: 250, visual: "ATTACK", attack: a2, speed: 90 }, m);
    expect(c.state).toBe("attack");
    expect(c.since).toBe(250);
    c = stepCtl(c, { ...base, now: 700, lt: 700, visual: "WALK", speed: 90 }, m);
    expect(c.state).toBe("walk");
  });

  it("skill segura a pose de carga na antecipação e solta no lançamento", () => {
    const a = anim(["c0", "c1", "c2", "c3"], false, 80, [{ name: "hitFrame", frame: 2 }]);
    expect(attackFrame(a, 0, 340, 160, true)).toBe(0);
    expect(attackFrame(a, 70, 340, 160, true)).toBe(0);
    expect(attackFrame(a, 120, 340, 160, true)).toBe(1);
    expect(attackFrame(a, 170, 340, 160, true)).toBe(2);
    expect(attackFrame(a, 160 + HIT_STOP_MS + 10, 340, 160, true)).toBe(3);
    const m = manifest({}, { attack: a });
    const c = stepCtl(newCtl("S", 0), { ...base, visual: "ATTACK", attack: { start: 0, hitAtMs: 340, durationMs: 500, special: true, launchAtMs: 160, targetId: "w" } }, m);
    expect(c.state).toBe("skill");
    expect(artFor(m, "skill")?.name).toBe("attack");
  });

  it("dano interrompe o ataque; derrota tem a maior prioridade", () => {
    const m = manifest({}, { attack: anim(["a0", "a1"], false), hurt: anim(["h0"], false) });
    let c = stepCtl(newCtl("S", 0), { ...base, visual: "ATTACK", attack: { start: 0, hitAtMs: 100, durationMs: 300, special: false, targetId: "w" } }, m);
    c = stepCtl(c, { ...base, now: 50, lt: 50, visual: "HURT", hurtStart: 50 }, m);
    expect(c.state).toBe("hurt");
    c = stepCtl(c, { ...base, now: 60, lt: 60, visual: "DEFEAT" }, m);
    expect(c.state).toBe("defeat");
    const f = ctlFrame(c, { ...base, now: 60, lt: 60, visual: "DEFEAT" }, m);
    expect(f.anim).toBe("hurt");
    expect(f.procedural).toBe("fade");
  });

  it("victory quando o alvo atacado cai; volta ao idle depois", () => {
    const m = manifest();
    let c = stepCtl(newCtl("S", 0), { ...base, visual: "ATTACK", attack: { start: 0, hitAtMs: 100, durationMs: 300, special: false, targetId: "w9" } }, m);
    c = stepCtl(c, { ...base, now: 400, lt: 400, targetDefeatedAt: 380 }, m);
    expect(c.state).toBe("victory");
    const f = ctlFrame(c, { ...base, now: 500, lt: 500 }, m);
    expect(f.fallback).toBe(true);
    expect(f.dy).toBeLessThan(0);
    c = stepCtl(c, { ...base, now: 400 + VICTORY_MS + 10, lt: 400 + VICTORY_MS + 10, targetDefeatedAt: 380 }, m);
    expect(c.state).toBe("idle");
  });

  it("interact dispara uma vez por pedido", () => {
    const m = manifest();
    let c = stepCtl(newCtl("S", 0), { ...base, interactAt: 0 }, m);
    expect(c.state).toBe("interact");
    c = stepCtl(c, { ...base, now: 2000, lt: 2000, interactAt: 0 }, m);
    expect(c.state).toBe("idle");
  });

  it("lê a arte do creature.json: run/turn/victory próprios vencem o fallback", () => {
    const m = manifest({}, { run: anim(["r0", "r1"]), turn: anim(["t0"], false, 60), victory: anim(["v0", "v1"], false, 200) });
    expect(artFor(m, "run")?.name).toBe("run");
    expect(artFor(m, "follow")?.name).toBe("walk");
    expect(artFor(m, "interact")).toBeUndefined();
    const c = drive(m, 32, (t) => ({ face: t < 16 ? "S" : "N" })).c;
    const f = ctlFrame(c, { ...base, now: 32, lt: 32, face: "N" }, m);
    expect(f.anim).toBe("turn");
    expect(f.fallback).toBe(false);
  });

  it("fallback por anatomia: blob pula no walk, flyer flutua, quadrúpede pula mais baixo na vitória", () => {
    const blob = manifest({ anatomy: "blob" }, { walk: undefined as unknown as CreatureAnimation });
    delete (blob.animations as Record<string, unknown>).walk;
    expect(anatomyOf(blob)).toBe("blob");
    expect(anatomyOf(manifest())).toBe("biped");
    const t = fallbackTable();
    expect(t.walk.blob).toBe("hop");
    expect(t.idle.flyer).toBe("hover");
    const c = drive(blob, 50, () => ({ speed: 60, visual: "WALK", walked: 8 })).c;
    const f = ctlFrame(c, { ...base, speed: 60, visual: "WALK", walked: 8 }, blob);
    expect(f.dy).toBe(-2);
  });

  it("idle com respiração desenhada (≥ 2 quadros) não soma o bob de 1 px", () => {
    const m = manifest({}, { idle: anim(["i0", "i1", "i2"], true, 200) });
    const f = ctlFrame(newCtl("S", 0), { ...base, now: 500, lt: 500 }, m);
    expect(f.dy).toBe(0);
    expect(f.index).toBe(2);
    const one = ctlFrame(newCtl("S", 0), { ...base, now: 500, lt: 500 }, manifest());
    expect(one.procedural).toBe("bob");
  });

  it("espécies reais: todas resolvem um quadro válido em todos os estados", () => {
    const cat = loadCreatureCatalog();
    const states = ["idle", "walk", "run", "turn", "attack", "skill", "hurt", "victory", "defeat", "follow", "interact"] as const;
    for (const c of Object.values(cat)) {
      if (!c.manifest.animations.idle) continue;
      for (const s of states) {
        const ctl: CtlState = { ...newCtl("S", 0), state: s };
        const i: CtlInput = { ...base, now: 200, lt: 200, speed: s === "walk" || s === "run" ? 90 : 0, attack: { start: 0, hitAtMs: 160, durationMs: 400, special: s === "skill", launchAtMs: s === "skill" ? 160 : undefined, targetId: "x" }, hurtStart: 0 };
        const f = ctlFrame(ctl, i, c.manifest);
        expect(f.frames.frames[f.index]?.atlasKey, `${c.manifest.id} ${s}`).toBeTruthy();
      }
    }
  });
});
