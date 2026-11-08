import { describe, expect, it } from "vitest";
import { nextFloat, nextInt, pickWeighted } from "../src/sim/rng";
import { buildContent } from "../src/sim/content";
import { RAW_PACKS, defaultPackId, listPacks, loadPack } from "../src/packs";
import { REQUIRED_STRINGS, fmt } from "../src/sim/strings";

describe("rng", () => {
  it("é determinístico por semente", () => {
    const a = { rngState: 42 }, b = { rngState: 42 }, c = { rngState: 43 };
    const sa = Array.from({ length: 20 }, () => nextFloat(a));
    expect(Array.from({ length: 20 }, () => nextFloat(b))).toEqual(sa);
    expect(Array.from({ length: 20 }, () => nextFloat(c))).not.toEqual(sa);
    expect(sa.every((x) => x >= 0 && x < 1)).toBe(true);
  });
  it("nextInt respeita limites e pickWeighted respeita pesos", () => {
    const h = { rngState: 7 };
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 4000; i++) {
      const n = nextInt(h, 1, 3);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(3);
      counts[pickWeighted(h, [{ k: "a" as const, weight: 1 }, { k: "b" as const, weight: 3 }]).k]++;
    }
    expect(counts.b / counts.a).toBeGreaterThan(2.5);
    expect(counts.b / counts.a).toBeLessThan(3.5);
  });
});

describe("content packs", () => {
  it("descobre os pacotes da pasta packs/ e todos validam no mesmo motor", () => {
    const ids = listPacks().map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(["digimon-fan", "original-a", "original-b"]));
    for (const id of ids) expect(() => loadPack(id), id).not.toThrow();
  });

  it("pacote padrão é o marcado em pack.json (Digimon, ADR-007)", () => {
    expect(defaultPackId()).toBe("digimon-fan");
  });

  it("fan pack exige nonCommercial e aviso de não afiliação", () => {
    const raw = structuredClone(RAW_PACKS["digimon-fan"]);
    expect(loadPack("digimon-fan").pack.disclaimer).toMatch(/não oficial/);
    raw.pack.nonCommercial = false;
    delete raw.pack.disclaimer;
    expect(() => buildContent(raw)).toThrow(/nonCommercial[\s\S]*disclaimer/);
  });

  it("exige todas as strings de interface e sprites declarados existentes", () => {
    const raw = structuredClone(RAW_PACKS["original-b"]);
    delete raw.strings.logVictory;
    raw.creatures[0].sprite = "sprites/nao_existe.png";
    expect(() => buildContent(raw)).toThrow(/logVictory[\s\S]*nao_existe\.png/);
    expect(REQUIRED_STRINGS.length).toBeGreaterThan(20);
  });

  it("sprite aceita lista de frames idle; todos precisam existir e spriteFrameMs > 0", () => {
    const animated = Object.values(loadPack("original-b").creatures).filter((c) => Array.isArray(c.sprite) && c.sprite.length > 1);
    expect(animated.length).toBeGreaterThan(0);
    const raw = structuredClone(RAW_PACKS["original-b"]);
    const frames = raw.creatures[0].sprite as string[];
    raw.creatures[0].sprite = [frames[0], "sprites/frame_fantasma.png"];
    raw.creatures[0].spriteFrameMs = 0;
    raw.creatures[1].sprite = [];
    expect(() => buildContent(raw)).toThrow(/frame_fantasma\.png[\s\S]*spriteFrameMs[\s\S]*lista não vazia/);
  });

  it("rejeita referências quebradas", () => {
    const raw = structuredClone(RAW_PACKS["original-b"]);
    raw.creatures[0].skills.push("nao_existe");
    raw.areas[0].waves.push({ enemies: ["fantasma"], weight: 1 });
    expect(() => buildContent(raw)).toThrow(/nao_existe[\s\S]*fantasma/);
  });

  it("fmt substitui placeholders e sinaliza chave ausente", () => {
    expect(fmt({ a: "Nv {level}!" }, "a", { level: 3 })).toBe("Nv 3!");
    expect(fmt({}, "zzz")).toBe("[zzz]");
  });
});
