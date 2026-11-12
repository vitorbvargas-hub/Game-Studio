// Tamers v3: os 12 presets oficiais-base DS são lidos do disco (glob, sem cópia), com 4 direções e 8 cores de
// cabelo; bots aleatórios; migração do Tamer modular v2 (save v5 → v6).

import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { useTamerSet, botLook, buildPresets, distinctHairs, defaultLook, DIRS4, loadPresets, lookKey, migrateLegacyLook, normalizeLook, presetVisual, randomLook } from "../src/assets/tamer-presets";
import { deserialize, SAVE_VERSION } from "../src/save/save";
// Tamers v3 (cores de cabelo); os v13 (padrão desde 2026-11-12) estão em v15-integration.test.ts
useTamerSet("v3");

const urlToPath = (url: string) => {
  const u = decodeURIComponent(url.split("?")[0]);
  return u.startsWith("/@fs/") ? u.slice(4) : u;
};

describe("Tamers v3 (presets TAMER-0003..0014)", () => {
  it("12 presets, cada um com 8 cores × 4 direções × 3 quadros que existem no disco", () => {
    const ps = loadPresets();
    expect(ps.map((p) => p.id)).toEqual(Array.from({ length: 12 }, (_, i) => `TAMER-${String(i + 3).padStart(4, "0")}`));
    for (const p of ps) {
      expect(p.hairs.map((h) => h.id).sort(), p.id).toEqual(["azul", "castanho", "loiro", "prateado", "preto", "roxo", "ruivo", "verde"]);
      expect(p.hairs.some((h) => h.id === p.defaultHair)).toBe(true);
      for (const h of p.hairs) for (const d of DIRS4) expect(h.frames[d]!.length, `${p.id}/${h.id}/${d}`).toBe(3);
    }
    const sample = ps[0].hairs[0].frames.S![0];
    expect(existsSync(urlToPath(sample)), sample).toBe(true);
    expect(ps.find((p) => p.id === "TAMER-0009")).toMatchObject({ label: "Raposa", accessory: "Viseira" });
  });

  it("visual do look: walk S/N/W/E desenhados (sem espelho), 4 quadros na sequência 00-01-00-02, pivô do preset", () => {
    const v = presetVisual({ name: "Ana", preset: "TAMER-0007", hair: "verde" })!;
    expect(v.manifest.directions!.walk).toEqual({ drawn: ["S", "N", "W", "E"], mirrored: {} });
    for (const d of DIRS4) expect(v.manifest.animations.walk.dirFrames![d].map((f) => f.atlasKey)).toEqual([`${d}_00`, `${d}_01`, `${d}_00`, `${d}_02`]);
    expect(v.manifest.animations.idle.dirFrames!.N[0].atlasKey).toBe("N_01");
    expect(v.manifest.dimensions).toMatchObject({ frameW: 42, frameH: 33 });
    expect(v.manifest.name).toBe("Ana");
    // os rips do DS são diagonais (arquivos _SW_/_SE_/_NW_/_NE_ desde o ecc2744): esquerda = costas-esquerda,
    // direita = frente-direita, cima = costas-direita
    expect(v.frameUrls!.W_02).toContain("recolor_verde/TAMER-0007_verde_NW_02.png");
    expect(v.frameUrls!.E_00).toContain("recolor_verde/TAMER-0007_verde_SE_00.png");
    expect(v.frameUrls!.N_01).toContain("recolor_verde/TAMER-0007_verde_NE_01.png");
    expect(v.frameUrls!.S_00).toContain("recolor_verde/TAMER-0007_verde_SW_00.png");
    expect(v.atlas.frames.E_01.frame).toEqual({ x: 0, y: 0, w: 42, h: 33 });
  });

  it("padrão = preset 1 na cor canônica; normalizeLook corrige preset/cor/nome ruins", () => {
    expect(defaultLook()).toEqual({ name: "Kaio", preset: "TAMER-0003", hair: "ruivo" });
    expect(normalizeLook({ name: "  Ana   Lu ", preset: "TAMER-0099", hair: "rosa" })).toEqual({ name: "Ana Lu", preset: "TAMER-0003", hair: "ruivo" });
    expect(normalizeLook({ name: "x".repeat(40), preset: "TAMER-0010", hair: "rosa" })).toEqual({ name: "x".repeat(14), preset: "TAMER-0010", hair: "azul" });
    expect(normalizeLook(null)).toEqual(defaultLook());
  });

  it("bots: preset v3 aleatório, estável por semente + id, sempre válido e variado", () => {
    const looks = ["bot1", "bot2", "bot3"].map((id) => botLook(7, id, id));
    expect(new Set(looks.map(lookKey)).size).toBe(3);
    expect(botLook(7, "bot2", "x")).toEqual(botLook(7, "bot2", "x"));
    const many = Array.from({ length: 60 }, (_, i) => randomLook(i * 977, "b"));
    for (const l of many) expect(normalizeLook(l)).toEqual(l);
    expect(new Set(many.map((l) => l.preset)).size).toBeGreaterThan(8);
    expect(new Set(many.map((l) => l.hair)).size).toBeGreaterThan(5);
    for (const l of many) expect(presetVisual(l)).toBeDefined();
  });

  it("migração do Tamer modular v2: preset mais parecido, cor do cabelo mantida; sem dado → preset 1", () => {
    // modelo 1 + espetado + castanho + tamer clássico → goggles com cabelo castanho canônico (Chama)
    expect(migrateLegacyLook({ name: "Kaio", model: "male", skin: "tan", hairCut: "espetado-tai", hairColor: "castanho", outfit: "tamer-classico", outfitColor: "azul" })).toEqual({ name: "Kaio", preset: "TAMER-0011", hair: "castanho" });
    // modelo 2 + rabo de cavalo + rosa → Raposa (viseira), rosa vira ruivo
    expect(migrateLegacyLook({ name: "Nina", model: "female", hairCut: "rabo-de-cavalo", hairColor: "rosa" })).toEqual({ name: "Nina", preset: "TAMER-0009", hair: "ruivo" });
    // branco → prateado; franja longa + prateado → Xeno
    expect(migrateLegacyLook({ name: "Rei", model: "male", hairCut: "franja-longa", hairColor: "branco" })).toMatchObject({ preset: "TAMER-0013", hair: "prateado" });
    expect(migrateLegacyLook({})).toEqual({ name: "Kaio", preset: "TAMER-0003", hair: "ruivo" });
    // normalizeLook reconhece o look v2
    expect(normalizeLook({ name: "Lu", model: "female", hairCut: "marias-chiquinhas", hairColor: "loiro" })).toEqual({ name: "Lu", preset: "TAMER-0005", hair: "loiro" });
  });

  it("save v5 com Tamer modular → v6 com preset", () => {
    const partner = { speciesId: "CREATURE-0003", level: 9, xp: 1, learned: ["investida"], moves: ["investida", null, null, null], autoRules: [] };
    const tamer = { name: "Nina", model: "female", skin: "deep", hairCut: "marias-chiquinhas", hairColor: "azul", outfit: "casual", outfitColor: "roxo" };
    const v5 = JSON.stringify({ v: 5, savedAt: 9, game: "gs003-world", data: { tamer, tamerLevel: 3, tamerXp: 0, bits: 1, auto: false, autoEvolve: false, partner, team: [], scans: {}, captured: [], starter: null, map: "vila", seen: [], inventory: {}, quests: { day: "2026-11-09", kills: {}, captures: 0, claimed: [] }, settings: { time: "auto" } } });
    const r = deserialize(v5);
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(6);
    expect(r).toMatchObject({ ok: true, migratedFrom: 5, data: { tamer: { name: "Nina", preset: "TAMER-0005", hair: "azul" }, map: "vila" } });
  });

  it("buildPresets ignora Tamer sem hairRecolors e cores sem PNG no disco", () => {
    const frames = (h: string) => Object.fromEntries(DIRS4.map((d) => [d, [0, 1, 2].map((i) => `./sprites/recolor_${h}/X_${h}_${d}_0${i}.png`)]));
    const man = {
      "/a/TAMER-0001/character.json": { id: "TAMER-0001", name: "velho", dimensions: { frameW: 32, frameH: 40 }, pivot: { x: 16, y: 35 } },
      "/a/TAMER-0050/character.json": { id: "TAMER-0050", name: "Novo (x)", dimensions: { frameW: 20, frameH: 30 }, pivot: { x: 10, y: 29 }, hairRecolors: { active: "verde", options: [{ id: "verde", hex: "#0f0", frames: frames("verde") }, { id: "azul", hex: "#00f", frames: frames("azul") }] } },
    };
    const pngs = Object.fromEntries(DIRS4.flatMap((d) => [0, 1, 2].map((i) => [`/a/TAMER-0050/sprites/recolor_verde/X_verde_${d}_0${i}.png`, `u:${d}${i}`])));
    const ps = buildPresets(man, pngs);
    expect(ps).toHaveLength(1);
    expect(ps[0]).toMatchObject({ id: "TAMER-0050", label: "Novo", defaultHair: "verde" });
    expect(ps[0].hairs.map((h) => h.id)).toEqual(["verde"]);
  });

  it("distinctHairs: tira as cores com o quadro idêntico a outra (a canônica fica); sem imagem, mantém", () => {
    const p = loadPresets().find((x) => x.id === "TAMER-0003")!;
    const same = distinctHairs(p, () => "igual");
    expect(same.hairs.map((h) => h.id)).toEqual(["ruivo"]);
    const all = distinctHairs(p, (u) => u);
    expect(all.hairs).toHaveLength(8);
    const two = distinctHairs(p, (u) => (u.includes("recolor_azul") ? "b" : u.includes("recolor_ruivo") ? "a" : undefined));
    expect(two.hairs.map((h) => h.id).sort()).toEqual(["azul", "castanho", "loiro", "prateado", "preto", "roxo", "ruivo", "verde"]);
    const dedup = distinctHairs(p, (u) => (u.includes("recolor_azul") || u.includes("recolor_verde") ? "x" : u));
    expect(dedup.hairs.map((h) => h.id)).toEqual(["preto", "castanho", "loiro", "ruivo", "azul", "roxo", "prateado"]);
  });
});
