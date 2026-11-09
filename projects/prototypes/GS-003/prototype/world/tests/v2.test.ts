// world v2: sprites de mapa DS (4 direções), movimento fluido, combate animado, tamanho relacional, loaders.
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildCreatureCatalog,
  loadCharacterCatalog,
  loadCreatureCatalog,
  mapScaleOf,
  parseSizeTable,
  pickTamers,
} from "../src/assets/creatures";
import { buildTileSources } from "../src/assets/tiles";
import {
  ANTICIPATION_PX,
  attackLunge,
  attackTiming,
  framesFor,
  HIT_STOP_MS,
  knockback,
  LUNGE_PX,
  PROCEDURAL_HIT_AT_MS,
  resolveFacing,
  SPECIAL_EXTRA_MS,
} from "../src/render/anim";
import { impactParticles, shakeOffset } from "../src/render/fx";
import { lerpCamera, newMotion, smoothDamp, stepMotion, walkFrameIndex } from "../src/render/motion";
import { elementOf, Presenter, SHAKE_MS } from "../src/render/presenter";
import { TICK_MS, WORLD } from "../src/sim/params";
import type { WorldEvent } from "../src/sim/types";
import { snapshot, stepWorld, trailPoint } from "../src/sim/world";
import { world } from "./helpers";

const GA = join(dirname(fileURLToPath(import.meta.url)), "../../../../../../assets/GAME-ASSETS/01-creatures");
const DS_IDS = Array.from({ length: 11 }, (_, i) => `CREATURE-${String(i + 3).padStart(4, "0")}`);

describe("sprites de mapa DS (creature.json v2)", () => {
  const cat = loadCreatureCatalog();

  it("cada Digimon DS tem walk/idle em S, N, W e E (desenhado ou espelho), com quadros no atlas", () => {
    for (const id of DS_IDS) {
      const c = cat[id];
      const m = c.manifest;
      expect(m.schemaVersion, id).toBe(2);
      for (const name of ["walk", "idle"]) {
        const a = m.animations[name];
        expect(a.space).toBe("map");
        for (const d of ["S", "N", "W", "E"] as const) {
          const f = resolveFacing(m, name, d);
          const frames = framesFor(a, f.dir);
          expect(frames.length, `${id} ${name} ${d}`).toBeGreaterThan(0);
          for (const fr of frames) expect(c.atlas.frames[fr.atlasKey!], `${id} ${fr.atlasKey}`).toBeDefined();
          if (d === "E" && !m.directions!.walk.drawn.includes("E")) expect(f).toEqual({ dir: "W", mirror: true });
        }
      }
      // walk de 3 quadros por direção vira ciclo f0-f1-f0-f2
      expect(framesFor(m.animations.walk, "W")).toHaveLength(4);
    }
  });

  it("attack com hitFrame e hurt vêm das poses HURT/ATTACK do DS; battle_* guardam a escala nativa", () => {
    for (const id of DS_IDS) {
      const m = cat[id].manifest;
      expect(m.combatStates?.ATTACK).toBe("attack");
      expect(m.combatStates?.HURT).toBe("hurt");
      expect(m.animations.attack.events?.some((e) => e.name === "hitFrame")).toBe(true);
      expect(m.animations.attack.frames.some((f) => f.atlasKey!.includes("_attack_"))).toBe(true);
      expect(m.animations.hurt.frames[0].atlasKey).toContain("_hurt_");
      expect(m.animations.battle_idle.space).toBe("battle");
      expect(m.animations.battle_attack.frames.length).toBeGreaterThan(0);
      const t = attackTiming(m);
      expect(t.procedural).toBe(false);
      expect(t.hitAtMs).toBeGreaterThanOrEqual(150);
      expect(t.durationMs).toBeLessThanOrEqual(WORLD.attackTicks * TICK_MS);
    }
  });

  it("tamanho relacional: mapScale inteiro e targetHeightPx nativo do DS (Baby < Rookie < Champion na linha)", () => {
    const h = (id: string) => cat[id].manifest.targetHeightPx!;
    for (const id of DS_IDS) {
      expect(cat[id].manifest.mapScale).toBe(1);
      expect(h(id)).toBeGreaterThan(10);
    }
    expect(h("CREATURE-0005")).toBeLessThan(h("CREATURE-0006"));
    expect(h("CREATURE-0006")).toBeLessThan(h("CREATURE-0007"));
    expect(h("CREATURE-0011")).toBeLessThan(h("CREATURE-0013"));
  });

  it("Gigimon (fora do DS) fica marcado como pendente de aprovação, com sprite reduzido", () => {
    const m = cat["CREATURE-0002"].manifest as typeof cat[string]["manifest"] & { approvalStatus?: string };
    // o game-art troca o sprite do Gigimon (rip v1 → desenho próprio): o status muda, mas nunca é aprovado sozinho
    expect(["PENDING_OFFICIAL_MAP_SPRITE", "UNDER_REVIEW"]).toContain(m.approvalStatus);
    expect(m.targetHeightPx).toBeLessThan(25);
  });

  it("v1 preservada em versions/v1 e license.json v2 registra o ripper da folha", async () => {
    for (const id of ["CREATURE-0002", ...DS_IDS]) {
      expect(existsSync(join(GA, id, "versions/v1/creature.json")), id).toBe(true);
      expect(existsSync(join(GA, id, "versions/v1/license.json")), id).toBe(true);
    }
    const lic = (id: string) => import(/* @vite-ignore */ join(GA, id, "license.json")).then((m) => m.default);
    expect((await lic("CREATURE-0003")).credit.ripper).toBe("Sonicteam24");
    expect((await lic("CREATURE-0004")).credit.ripper).toBe("Atlanta");
  });
});

describe("tabela de tamanhos (hook)", () => {
  const m = { name: "Agumon", mapScale: 1, nativeMapHeightPx: 27 } as Parameters<typeof mapScaleOf>[0];
  it("sem tabela: mapScale do manifest", () => expect(mapScaleOf(m)).toBe(1));
  it("com tabela: razão arredondada para inteiro >= 1 (pixel-perfect)", () => {
    const t = parseSizeTable({ entries: [{ name: "Agumon", targetHeightPx: 54 }, { name: "Koromon", heightPx: 10 }] });
    expect(mapScaleOf(m, t)).toBe(2);
    expect(mapScaleOf({ ...m, name: "Koromon", nativeMapHeightPx: 17 }, t)).toBe(1);
    expect(parseSizeTable([{ id: "Gabumon", mapHeightPx: 30 }]).gabumon.heightPx).toBe(30);
    expect(parseSizeTable(undefined)).toEqual({});
  });
});

describe("loaders do game-art (Tamer, tilesets DS)", () => {
  it("Tamer: aceita PNG por quadro (sem folha) e escolhe player/npc por papel", () => {
    const man = {
      id: "TAMER-9",
      role: "player",
      dimensions: { frameW: 32, frameH: 32 },
      pivot: { x: 16, y: 31 },
      animations: { idle: { loop: true, frames: [{ durationMs: 1, atlasKey: "a.png" }], dirFrames: { N: [{ durationMs: 1, atlasKey: "b.png" }] } } },
    };
    const out = buildCreatureCatalog({ "/x/TAMER-9/character.json": man }, {}, {}, { "/x/TAMER-9/sprites/a.png": "ua", "/x/TAMER-9/sprites/b.png": "ub" });
    expect(out["TAMER-9"].frameUrls).toEqual({ "a.png": "ua", "b.png": "ub" });
    expect(out["TAMER-9"].atlas.frames["b.png"].frame).toEqual({ x: 0, y: 0, w: 32, h: 32 });
    // quadro faltando → não liga (cai no placeholder)
    expect(buildCreatureCatalog({ "/x/TAMER-9/character.json": man }, {}, {}, { "/x/TAMER-9/sprites/a.png": "ua" })).toEqual({});
    expect(pickTamers(out).local?.manifest.id).toBe("TAMER-9");
  });

  it("os Tamers reais de 11-characters, se existirem, cobrem as 4 direções", () => {
    const chars = loadCharacterCatalog();
    for (const c of Object.values(chars))
      for (const d of ["S", "N", "W", "E"] as const) {
        const f = resolveFacing(c.manifest, "walk", d);
        expect(framesFor(c.manifest.animations.walk, f.dir).length).toBeGreaterThan(0);
      }
  });

  it("biomas *-dwds têm prioridade sobre os originais quando a chave coincide", () => {
    const src = buildTileSources({ "/a/campo-dwds/tiles/grass_00.png": "ds", "/a/grass/tiles/grass_00.png": "orig" }, {});
    expect(src.grass_00.url).toBe("ds");
  });
});

describe("movimento fluido (apresentação)", () => {
  it("SmoothDamp acelera e desacelera sem ultrapassar o alvo", () => {
    let x = 0;
    let v = 0;
    const xs: number[] = [];
    for (let i = 0; i < 60; i++) {
      [x, v] = smoothDamp(x, 32, v, 0.075, 1 / 60);
      xs.push(x);
    }
    expect(Math.max(...xs)).toBeLessThanOrEqual(32);
    expect(xs.at(-1)).toBeGreaterThan(31.9);
    const steps = xs.map((p, i) => p - (xs[i - 1] ?? 0));
    expect(steps[1]).toBeGreaterThan(0);
    expect(steps.at(-1)!).toBeLessThan(steps[3]); // desacelera no fim
  });

  it("vira conforme a direção do movimento e corta (sem suavizar) saltos grandes", () => {
    let m = stepMotion(newMotion("S"), { x: 0, y: 0 }, 16, "S");
    for (let i = 1; i <= 20; i++) m = stepMotion(m, { x: i * 2, y: 0 }, 16, "S");
    expect(m.face).toBe("E");
    for (let i = 1; i <= 20; i++) m = stepMotion(m, { x: 40, y: -i * 2 }, 16, "S");
    expect(m.face).toBe("N");
    const jump = stepMotion(m, { x: 500, y: 500 }, 16, "S");
    expect(jump.pos).toEqual({ x: 500, y: 500 });
  });

  it("walk sincronizado à velocidade: o quadro depende da distância andada, não do tempo", () => {
    const d = [150, 150, 150, 150];
    expect(walkFrameIndex(0, d, 100)).toBe(0);
    expect(walkFrameIndex(16, d, 100)).toBe(1);
    expect(walkFrameIndex(31, d, 100)).toBe(2);
    expect(walkFrameIndex(60, d, 100)).toBe(0); // ciclo de 60 px
  });

  it("câmera com lerp independente de FPS", () => {
    const a = lerpCamera({ x: 0, y: 0 }, { x: 100, y: 0 }, 32);
    let b = { x: 0, y: 0 };
    for (let i = 0; i < 4; i++) b = lerpCamera(b, { x: 100, y: 0 }, 8);
    expect(Math.abs(a.x - b.x)).toBeLessThan(1e-9);
  });
});

describe("follow-the-leader (sim)", () => {
  it("a parceira segue pela trilha do Tamer (passa pela quina de um L) e não se sobrepõe a ele", () => {
    const { sim: sim2 } = world(3, { auto: false, botAuto: false });
    const me2 = sim2.state.entities.find((e) => e.id === "p1")!;
    const corner = { x: me2.x + 6 * 16, y: me2.y };
    let minDistToCorner = Infinity;
    let minSep = Infinity;
    for (let t = 1; t <= 160; t++) {
      const intents = t === 1 ? [{ t: "move_to" as const, playerId: "p1", x: corner.x, y: corner.y }] : t === 40 ? [{ t: "move_to" as const, playerId: "p1", x: corner.x, y: corner.y + 5 * 16 }] : [];
      stepWorld(sim2, intents);
      const p = sim2.state.entities.find((e) => e.id === "p1:partner")!;
      minDistToCorner = Math.min(minDistToCorner, Math.hypot(p.x - corner.x, p.y - corner.y));
      minSep = Math.min(minSep, Math.hypot(p.x - me2.x, p.y - me2.y));
    }
    // Seguindo a trilha ela passa perto da quina do L (em vez de cortar em diagonal até o Tamer).
    expect(minDistToCorner).toBeLessThan(14);
    expect(minSep).toBeGreaterThanOrEqual(WORLD.partnerMinSep - 6);
    expect(sim2.state.entities.find((e) => e.id === "p1:partner")!.state).toBe("IDLE");
  });

  it("trailPoint mede a distância ao longo do caminho", () => {
    const owner = { x: 100, y: 100, trail: [{ x: 0, y: 0 }, { x: 100, y: 0 }], facing: "S" } as Parameters<typeof trailPoint>[0];
    expect(trailPoint(owner, 50)).toEqual({ x: 100, y: 50 });
    expect(trailPoint(owner, 150)).toEqual({ x: 50, y: 0 });
  });
});

describe("combate animado (só apresentação)", () => {
  it("avanço: antecipação negativa, máximo no impacto, segura no hit-stop, volta a 0", () => {
    const hit = 180;
    const dur = 460;
    expect(attackLunge(hit * 0.4, hit, dur)).toBeLessThan(0);
    expect(attackLunge(hit * 0.4, hit, dur)).toBeGreaterThanOrEqual(-ANTICIPATION_PX);
    expect(attackLunge(hit, hit, dur)).toBe(LUNGE_PX);
    expect(attackLunge(hit + HIT_STOP_MS - 1, hit, dur)).toBe(LUNGE_PX);
    expect(attackLunge(dur + 1, hit, dur)).toBe(0);
    expect(knockback(HIT_STOP_MS - 1, 6)).toBe(0);
    expect(knockback(HIT_STOP_MS + 110, 6)).toBeCloseTo(6, 5);
  });

  it("golpe especial: projétil do elemento da espécie, impacto SPECIAL_EXTRA_MS mais tarde", () => {
    expect(attackTiming(undefined, true).hitAtMs).toBe(PROCEDURAL_HIT_AT_MS + SPECIAL_EXTRA_MS);
    expect(elementOf("CREATURE-0003")).toBe("fire");
    expect(elementOf("CREATURE-0012")).toBe("wind");
    const p = new Presenter(() => undefined, "p1");
    const { sim, events } = world(42);
    p.onTick(snapshot(sim), events, 0);
    const wild = snapshot(sim).find((s) => s.kind === "wild")!;
    p.onTick(snapshot(sim), [{ t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: wild.id, skillId: "pyro_sphere", seq: 5 }], 1000);
    // Golpes viraram Cast por arquétipo (MOVE_SYSTEM §4): Pyro Sphere = fireball → carga ≤ hitFrame, lança no
    // hitFrame e acerta depois de keyframes.travelMs.
    expect(p.casts).toHaveLength(1);
    const c = p.casts[0];
    expect(c).toMatchObject({ archetype: "fireball", launchAt: 1000 + PROCEDURAL_HIT_AT_MS });
    expect(c.params.impl).toBe("fire_bolt");
    expect(c.hitAt).toBe(c.launchAt + c.params.travel);
  });

  it("impacto: hit-stop congela o relógio do alvo e do atacante; crítico local treme a câmera", () => {
    const p = new Presenter(() => undefined, "p1");
    const { sim, events } = world(42);
    p.onTick(snapshot(sim), events, 0);
    const wild = snapshot(sim).find((s) => s.kind === "wild")!;
    const evs: WorldEvent[] = [
      { t: "attack_start", tick: 1, attackerId: "p1:partner", targetId: wild.id, skillId: "investida", seq: 1 },
      { t: "damage", tick: 1, seq: 1, attackerId: "p1:partner", targetId: wild.id, amount: 3, kind: "damage", crit: true, hpAfter: wild.hp - 3 },
    ];
    p.onTick(snapshot(sim), evs, 1000);
    const hitAt = 1000 + PROCEDURAL_HIT_AT_MS;
    p.update(hitAt + 10);
    const t = p.entities.get(wild.id)!;
    const a = p.entities.get("p1:partner")!;
    expect(p.localTime(t, hitAt + 10)).toBe(hitAt);
    expect(p.localTime(a, hitAt + 50)).toBe(hitAt);
    expect(p.localTime(t, hitAt + HIT_STOP_MS + 30)).toBe(hitAt + 30);
    expect(t.hurt?.px).toBeGreaterThan(6); // crítico empurra mais
    expect(p.shakes).toHaveLength(1);
    const sh = shakeOffset(p.shakes, hitAt + 10);
    expect(Math.abs(sh.x) + Math.abs(sh.y)).toBeGreaterThanOrEqual(0);
    expect(shakeOffset(p.shakes, hitAt + SHAKE_MS + 1)).toEqual({ x: 0, y: 0 });
    expect(p.floaters[0].drift).not.toBe(0);
  });

  it("partículas deterministas (mesmo golpe + mesmo instante = mesmo quadro)", () => {
    const fx = { seq: 7, crit: false, special: true, element: "fire" as const, dir: { x: 1, y: 0 } };
    expect(impactParticles(fx, 120)).toEqual(impactParticles(fx, 120));
    expect(impactParticles(fx, 0).every((q) => q.x === 0)).toBe(true);
  });

  it("a animação não decide o dano: catálogo real v2 (ataques DS + especiais) = mesmos eventos que sem apresentação", () => {
    const cat = loadCreatureCatalog();
    const play = (withPresenter: boolean) => {
      const { sim, events } = world(42, { auto: true });
      const p = withPresenter ? new Presenter((id) => (id ? cat[id]?.manifest : undefined), "p1") : null;
      p?.onTick(snapshot(sim), events, 0);
      const all: WorldEvent[] = [...events];
      let acc = 0;
      for (let now = 16; now <= 60_000; now += 16) {
        acc += 16;
        while (acc >= TICK_MS) {
          const evs = stepWorld(sim, []);
          all.push(...evs);
          p?.onTick(snapshot(sim), evs, now);
          acc -= TICK_MS;
        }
        p?.update(now);
      }
      p?.update(70_000);
      return { all, p };
    };
    const a = play(true);
    const b = play(false);
    expect(JSON.stringify(a.all)).toBe(JSON.stringify(b.all));
    const confirmed = a.all.filter((e) => e.t === "damage").map((e) => (e.t === "damage" ? `${e.seq}:${e.amount}` : "")).sort();
    expect(a.p!.shown.map((s) => `${s.seq}:${s.amount}`).sort()).toEqual(confirmed);
    expect(a.all.some((e) => e.t === "attack_start" && e.skillId !== "investida")).toBe(true);
  });
});
