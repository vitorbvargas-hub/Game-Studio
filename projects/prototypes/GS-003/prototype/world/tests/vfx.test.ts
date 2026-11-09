// Motor de VFX por arquétipo: cobertura dos dados, fases, determinismo de pixels, tempos e sincronia com a sim.
import { createCanvas } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import vfxFile from "../src/data/moves/vfx_archetypes.json";
import { PROCEDURAL_HIT_AT_MS } from "../src/render/anim";
import { Presenter } from "../src/render/presenter";
import { ARCHETYPES, type VfxFrame } from "../src/render/vfx/archetypes";
import { archetypeParams, buildSheetCatalog, castEnd, castTiming, drawCast, IMPL_OF, moveVfx, phasesAt, rampOf, sheetDrawer, type Cast } from "../src/render/vfx/engine";
import { loadMoveContent } from "../src/sim/moves";
import type { WorldEvent } from "../src/sim/types";
import { snapshot } from "../src/sim/world";
import { world } from "./helpers";

const mc = loadMoveContent();
const RAW_IDS = (vfxFile as { archetypes: { id: string }[] }).archetypes.map((a) => a.id);

function frame(g: CanvasRenderingContext2D, seq: number, p = archetypeParams("fireball")): VfxFrame {
  return {
    g,
    seq,
    P: p.palette,
    S: p.scale,
    count: p.count,
    now: 1000,
    o: { x: 30, y: 60 },
    of: { x: 30, y: 72 },
    d: { x: 100, y: 52 },
    df: { x: 100, y: 66 },
    targets: [
      { hit: { x: 100, y: 52 }, feet: { x: 100, y: 66 } },
      { hit: { x: 112, y: 62 }, feet: { x: 112, y: 76 } },
    ],
    c: { x: 100, y: 66 },
    end: { x: 130, y: 50 },
    radius: 22,
    dir: { x: 0.99, y: -0.11 },
    self: false,
    glow: p.glow,
  };
}

function castOf(id: string, power = 190): Cast {
  const p = archetypeParams(id, power);
  const t = castTiming(undefined, p);
  const c: Cast = { seq: 7, moveId: id, archetype: id, params: p, attackerId: "a", targetId: "t", targetIds: ["t"], at: { x: 0, y: 0 }, from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, self: false, radius: 22, start: 0, launchAt: t.launchAtMs ?? t.hitAtMs, hitAt: t.hitAtMs, end: 0, mine: true };
  c.end = castEnd(c);
  return c;
}

/** Desenha o golpe inteiro (todas as fases, chão + por cima) num canvas e devolve os pixels por instante. */
function render(id: string, times: number[]): Buffer[] {
  const c = castOf(id);
  return times.map((t) => {
    const cv = createCanvas(160, 100);
    const g = cv.getContext("2d") as unknown as CanvasRenderingContext2D;
    g.imageSmoothingEnabled = false;
    const f = frame(g, c.seq, c.params);
    f.now = t;
    drawCast(f, c, t, "ground");
    drawCast(f, c, t, "over");
    return Buffer.from(cv.data());
  });
}

describe("arquétipos (dados do game-design → implementação)", () => {
  it("todo arquétipo do vfx_archetypes.json tem implementação; 15+ implementações; todo golpe aponta para um arquétipo existente", () => {
    expect(RAW_IDS.length).toBeGreaterThanOrEqual(12);
    for (const id of RAW_IDS) expect(ARCHETYPES[IMPL_OF[id] ?? id], id).toBeDefined();
    expect(Object.keys(ARCHETYPES).length).toBeGreaterThanOrEqual(15);
    for (const m of Object.values(mc.moves)) expect(RAW_IDS, m.id).toContain(m.vfx);
  });

  it("tempos e tremida vêm dos keyframes; cura usa a rampa verde; arquétipo genérico tinge pelo elemento; poder ≥ 180 = escala 3", () => {
    const fb = moveVfx(mc.moves.pyro_sphere);
    expect(fb).toMatchObject({ impl: "fire_bolt", charge: 120, travel: 180, impact: 220, residue: 90, shake: null });
    expect(moveVfx(mc.moves.vigilia_timida).impl).toBe("heal");
    expect(moveVfx(mc.moves.freeze_fang).paletteName).toBe("ice");
    expect(moveVfx(mc.moves.rock_breaker).paletteName).toBe("claw_slash");
    expect(moveVfx(mc.moves.mega_flame).scale).toBe(3);
    expect(moveVfx(mc.moves.pepper_breath).scale).toBe(2);
    expect(moveVfx(mc.moves.god_typhoon).shake).toEqual({ amp: 2, dur: 140 });
  });

  it("paleta de 3–4 cores vira rampa de 7 tons do claro ao escuro", () => {
    const r = rampOf(["#ff6a00", "#ffb347", "#fff2c8", "#4a1500"]);
    expect(r).toHaveLength(7);
    expect(r[0]).toBe("#ffffff");
    expect(r[6]).toBe("#4a1500");
  });
});

describe("fases e tempos", () => {
  it("projétil: carga → lançamento → viagem → impacto → resíduo, em ordem", () => {
    const c = castOf("fireball", 150);
    const firsts: Record<string, number> = {};
    for (let t = 0; t < c.end; t += 5) for (const ph of phasesAt(c, t)) firsts[ph.phase] ??= t;
    expect(Object.keys(firsts)).toEqual(["charge", "launch", "travel", "impact", "residue"]);
    expect(firsts.launch).toBe(c.launchAt);
    expect(firsts.impact).toBe(c.hitAt);
    expect(phasesAt(c, c.end + 1)).toEqual([]);
  });

  it("corpo a corpo: impacto no hitFrame (sem viagem); projétil: lança no hitFrame e acerta após travelMs", () => {
    const melee = castTiming(undefined, archetypeParams("claw_slash"));
    expect(melee.hitAtMs).toBe(PROCEDURAL_HIT_AT_MS);
    expect(melee.launchAtMs).toBeUndefined();
    const pr = castTiming(undefined, archetypeParams("fireball"));
    expect(pr.launchAtMs).toBe(PROCEDURAL_HIT_AT_MS);
    expect(pr.hitAtMs).toBe(PROCEDURAL_HIT_AT_MS + 180);
  });
});

describe("desenho (pixel-perfect e determinístico)", () => {
  const ids = Object.keys(IMPL_OF);
  for (const id of ids)
    it(`${id}: desenha em todas as fases, sempre igual para o mesmo golpe e instante`, () => {
      const c = castOf(id);
      const times = [c.launchAt - 40, c.launchAt + 10, Math.round((c.launchAt + c.hitAt) / 2), c.hitAt + 10, c.hitAt + 60, c.end - 20].filter((t) => t >= 0);
      const a = render(id, times);
      const b = render(id, times);
      a.forEach((buf, i) => expect(buf.equals(b[i]), `${id} t=${times[i]}`).toBe(true));
      const blank = Buffer.alloc(a[0].length);
      const atImpact = a[times.indexOf(c.hitAt + 10)];
      expect(atImpact.equals(blank), `${id} impacto vazio`).toBe(false);
    });

  it("extras (relâmpago, maldição, cura) também desenham", () => {
    for (const impl of ["lightning", "debuff_hex", "heal"]) {
      const cv = createCanvas(160, 100);
      const g = cv.getContext("2d") as unknown as CanvasRenderingContext2D;
      const f = frame(g, 3);
      ARCHETYPES[impl].impact!(f, 60, 0.3);
      expect(Buffer.from(cv.data()).some((v) => v !== 0), impl).toBe(true);
    }
  });

  it("folha de efeito do game-art (04-effects) entra pelo manifest .vfx.json e é desenhada no impacto", () => {
    const sheets = buildSheetCatalog({ "/x/04-effects/skills/fire.vfx.json": { archetype: "fireball", phase: "impact", image: "fire.png", frameW: 16, frameH: 16, frames: 4, frameMs: 50 } }, { "/x/04-effects/skills/fire.png": "/u/fire.png" });
    expect(sheets).toHaveLength(1);
    const calls: unknown[][] = [];
    const g = { drawImage: (...a: unknown[]) => calls.push(a), globalCompositeOperation: "source-over" } as unknown as CanvasRenderingContext2D;
    const draw = sheetDrawer(sheets, () => ({ width: 64 }) as unknown as CanvasImageSource);
    const c = castOf("fireball");
    draw({ ...frame(g, 1), g }, c, "impact", 120);
    expect(calls).toHaveLength(2); // 2 alvos
    expect(calls[0].slice(1, 5)).toEqual([32, 0, 16, 16]); // quadro 2 (120 ms / 50 ms)
  });
});

describe("sincronia com a sim (a animação não decide o dano)", () => {
  it("attack_start cria o Cast; o dano aparece no impacto do arquétipo; tremida só no golpe local e só se o arquétipo tiver", () => {
    const p = new Presenter(() => undefined, "p1");
    const { sim, events } = world(42);
    p.onTick(snapshot(sim), events, 0);
    const wild = snapshot(sim).find((s) => s.kind === "wild")!;
    const evs: WorldEvent[] = [
      { t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: wild.id, skillId: "god_typhoon", seq: 3, targetIds: [wild.id], at: { x: wild.x, y: wild.y } },
      { t: "damage", tick: 1, seq: 3, attackerId: "p1:partner", targetId: wild.id, amount: 5, kind: "damage", crit: false, hpAfter: wild.hp - 5 },
    ];
    p.onTick(snapshot(sim), evs, 1000);
    const c = p.casts[0];
    expect(c).toMatchObject({ archetype: "tornado_field", mine: true });
    p.update(c.hitAt - 1);
    expect(p.shown).toHaveLength(0);
    p.update(c.hitAt);
    expect(p.shown).toHaveLength(1);
    expect(p.shown[0].at).toBe(c.hitAt);
    expect(p.shakes.some((s) => s.seq === 3 && s.amp === 2)).toBe(true);
    // golpe de outro jogador com o mesmo arquétipo: sem tremida
    const q = new Presenter(() => undefined, "p1");
    q.onTick(snapshot(sim), events, 0);
    q.onTick(snapshot(sim), [{ ...evs[0], attackerId: "bot1:partner", seq: 4 } as WorldEvent], 1000);
    q.update(5000);
    expect(q.shakes).toHaveLength(0);
  });

  it("buff/debuff confirmados viram texto ATQ↑/DEF↓ no impacto", () => {
    const p = new Presenter(() => undefined, "p1");
    const { sim, events } = world(42);
    p.onTick(snapshot(sim), events, 0);
    p.onTick(
      snapshot(sim),
      [
        { t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: "p1:partner", skillId: "kiai_tame", seq: 9, targetIds: ["p1:partner"] },
        { t: "status", tick: 1, seq: 9, id: "p1:partner", moveId: "kiai_tame", stat: "atk", mult: 1.35, ticks: 60, sourceId: "p1:partner" },
      ],
      1000,
    );
    const c = p.casts[0];
    expect(c.self).toBe(true);
    p.update(c.hitAt);
    expect(p.floaters.map((f) => f.text)).toContain("ATQ↑");
  });
});
