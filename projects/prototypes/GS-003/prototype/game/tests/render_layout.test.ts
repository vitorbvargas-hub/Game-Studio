// Layout da cena 320×180 e animação idle por tempo real (QA_REPORT_PROTOTYPE_B Bugs #1 e #2).
import { describe, expect, it } from "vitest";
import {
  ALLY_SLOTS,
  BAR_BELOW,
  BOSS_PLACEHOLDER_SIZE,
  BOSS_SLOT,
  ENEMY_SLOTS,
  ESCORT_SLOTS,
  SPRITE_MAX,
  VIEW_H,
  VIEW_W,
  barWidth,
  idleFrameIndex,
  unitBox,
  BattleRenderer,
} from "../src/render/renderer";
import { loadPack } from "../src/packs";
import { makeCombatant } from "../src/sim/battle";
import type { GameState } from "../src/sim/types";

/** Retângulo ocupado por uma unidade w×h no slot: corpo + barra de HP + nível abaixo dos pés. */
function footprint(slot: number[], w: number, h: number) {
  const [x, y] = unitBox(slot, w, h);
  const bw = barWidth(w);
  const left = Math.min(x, Math.round(x + w / 2 - bw / 2));
  const right = Math.max(x + w, left + bw);
  return { x0: left, y0: y, x1: right, y1: y + h + BAR_BELOW };
}
type Rect = ReturnType<typeof footprint>;
const overlap = (a: Rect, b: Rect) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

function assertClean(rects: Rect[]) {
  for (const r of rects) {
    expect(r.x0).toBeGreaterThanOrEqual(0);
    expect(r.y0).toBeGreaterThanOrEqual(0);
    expect(r.x1).toBeLessThanOrEqual(VIEW_W);
    expect(r.y1).toBeLessThanOrEqual(VIEW_H);
  }
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) expect(overlap(rects[i], rects[j]), `slots ${i} e ${j} se sobrepõem`).toBe(false);
}

describe("layout dos slots em 320×180", () => {
  it(`3 aliados + 3 inimigos com sprites de ${SPRITE_MAX} px não se sobrepõem (corpo + barra de HP + nível)`, () => {
    assertClean([...ALLY_SLOTS, ...ENEMY_SLOTS].map((s) => footprint(s, SPRITE_MAX, SPRITE_MAX)));
  });

  it("chefe + 2 escoltas com sprite + 3 aliados não se sobrepõem", () => {
    assertClean([
      ...ALLY_SLOTS.map((s) => footprint(s, SPRITE_MAX, SPRITE_MAX)),
      footprint(BOSS_SLOT, BOSS_PLACEHOLDER_SIZE, BOSS_PLACEHOLDER_SIZE),
      ...ESCORT_SLOTS.map((s) => footprint(s, SPRITE_MAX, SPRITE_MAX)),
    ]);
  });

  it("barra de HP legível: pelo menos 24 px e inteira dentro da tela", () => {
    expect(barWidth(SPRITE_MAX)).toBeGreaterThanOrEqual(24);
    expect(barWidth(20)).toBeGreaterThanOrEqual(24);
  });
});

describe("animação idle por tempo real", () => {
  /** Renderer real com canvas/Image falsos: devolve qual frame (src) foi desenhado em cada instante amostrado. */
  function framesAt(hz: number, sampleMs: number[]) {
    (globalThis as any).Image = class { complete = true; naturalWidth = SPRITE_MAX; naturalHeight = SPRITE_MAX; src = ""; };
    let lastSrc = "";
    const ctx = new Proxy({}, {
      get: (_t, p) => (p === "drawImage" ? (img: { src: string }) => void (lastSrc = img.src) : () => {}),
      set: () => true,
    });
    const canvas = { getContext: () => ctx, style: {} } as unknown as HTMLCanvasElement;
    const c = loadPack("digimon-fan");
    const def = Object.values(c.creatures).find((x) => Array.isArray(x.sprite) && x.sprite.length > 1)!;
    const unit = makeCombatant(def, "c1", "ally", def.baseLevel ?? 1);
    const state = { battle: { kind: "wave", allies: [unit], enemies: [] } } as unknown as GameState;
    const r = new BattleRenderer(canvas, c);
    const out: string[] = [];
    let t = 1000;
    for (const target of sampleMs) {
      while (t + 1000 / hz <= 1000 + target) {
        t += 1000 / hz;
        r.draw(state, t);
      }
      out.push(lastSrc);
    }
    delete (globalThis as any).Image;
    return out;
  }

  it("o renderer mostra os mesmos frames a 30, 60, 120 e 144 Hz", () => {
    const samples = Array.from({ length: 24 }, (_, i) => 100 + i * 250);
    const ref = framesAt(60, samples);
    expect(new Set(ref).size).toBe(2);
    for (const hz of [30, 120, 144]) {
      const got = framesAt(hz, samples);
      // Tolerância: só pode divergir na amostra que cai a menos de 1 quadro de uma troca.
      const diff = got.filter((f, i) => f !== ref[i]).length;
      expect(diff, `${hz} Hz`).toBeLessThanOrEqual(1);
    }
  });

  it("troca exatamente a cada spriteFrameMs de tempo real", () => {
    const changes: number[] = [];
    let prev = idleFrameIndex(0, 500, 2, "c1");
    for (let t = 1; t <= 3000; t++) {
      const f = idleFrameIndex(t, 500, 2, "c1");
      if (f !== prev) changes.push(t);
      prev = f;
    }
    const gaps = changes.slice(1).map((t, i) => t - changes[i]);
    expect(gaps.every((g) => g === 500)).toBe(true);
  });

  it("batalha automática: attack ao agir, hit ao tomar dano, depois volta ao idle", () => {
    (globalThis as any).Image = class { complete = true; naturalWidth = SPRITE_MAX; naturalHeight = SPRITE_MAX; src = ""; };
    const drawn: string[] = [];
    const ctx = new Proxy({}, {
      get: (_t, p) => (p === "drawImage" ? (img: { src: string }) => void drawn.push(img.src) : () => {}),
      set: () => true,
    });
    const canvas = { getContext: () => ctx, style: {} } as unknown as HTMLCanvasElement;
    const c = loadPack("digimon-fan");
    const def = Object.values(c.creatures).find((x) => x.anims?.attack && x.anims?.hit)!;
    const unit = makeCombatant(def, "c1", "ally", def.baseLevel ?? 1);
    const state = { battle: { kind: "wave", allies: [unit], enemies: [] } } as unknown as GameState;
    const r = new BattleRenderer(canvas, c);
    const url = (path: string) => c.assets[path];
    const last = () => drawn[drawn.length - 1];
    r.draw(state, 1000);
    expect((def.anims!.idle as string[]).map(url)).toContain(last());
    r.onEvents([{ t: "act", actor: "c1", skillId: "x", hits: [] }]);
    r.draw(state, 1001);
    expect(last()).toBe(url((def.anims!.attack as string[])[0]));
    // Uma passada (3 frames) e acabou: ~16 ms por quadro durante 1 s.
    for (let t = 1017; t <= 2001; t += 16) r.draw(state, t);
    expect((def.anims!.idle as string[]).map(url)).toContain(last());
    r.onEvents([{ t: "act", actor: "x", skillId: "x", hits: [{ uid: "c1", amount: 3, kind: "damage" }] }]);
    r.draw(state, 2017);
    expect(last()).toBe(url((def.anims!.hit as string[])[0]));
    delete (globalThis as any).Image;
  });
});
