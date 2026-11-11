// ?mon=official: Guilmon e Gabumon com os sprites de mapa oficiais do DS (CREATURE-0018/0019, build-official-mons.mjs)
// e ?monscale=1|2|auto (save/official.ts).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { describe, expect, it } from "vitest";
import { loadCreatureCatalog } from "../src/assets/creatures";
import { attackTiming, resolveAnim, resolveFacing } from "../src/render/anim";
import { compareModeOf } from "../src/save/compare";
import { AUTO_RANGE, autoScale, isOfficialShow, monScaleModeOf, OFFICIAL_VISUALS, officialModeOf, officialScales, officialShowcase, withOfficialVisuals } from "../src/save/official";
import { parseTiledMap } from "../src/sim/map";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import { getEntity, getPlayer } from "../src/sim/world";
import { MAPS, withLook } from "../src/world/regions";

const GA = join(dirname(fileURLToPath(import.meta.url)), "../../../../../../assets/GAME-ASSETS/01-creatures");
const DIRS = { "CREATURE-0018": "CREATURE-0018-guilmon-official", "CREATURE-0019": "CREATURE-0019-gabumon-official" } as const;

async function alphaOf(path: string) {
  const img = await loadImage(readFileSync(path));
  const c = createCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  return { w: img.width, h: img.height, d: g.getImageData(0, 0, img.width, img.height).data };
}

describe("?mon=official — sprites de mapa oficiais do DS", () => {
  const cat = loadCreatureCatalog();

  it("flags: oficial é o padrão (?mon=pixellab desliga) e ?monscale=1|2|auto (ausente/inválido → 1, a recomendada); não liga a comparação", () => {
    expect(officialModeOf(new URLSearchParams("mon=official"))).toBe(true);
    expect(officialModeOf(new URLSearchParams("mon=x"))).toBe(true);
    expect(officialModeOf(new URLSearchParams(""))).toBe(true);
    expect(officialModeOf(new URLSearchParams("mon=pixellab"))).toBe(false);
    expect(monScaleModeOf(new URLSearchParams("monscale=1"))).toBe(1);
    expect(monScaleModeOf(new URLSearchParams("monscale=2"))).toBe(2);
    expect(monScaleModeOf(new URLSearchParams("monscale=auto"))).toBe("auto");
    expect(monScaleModeOf(new URLSearchParams("monscale=3"))).toBe(1);
    expect(monScaleModeOf(new URLSearchParams(""))).toBe(1);
    expect(compareModeOf(new URLSearchParams("mon=official"))).toBe(false);
  });

  it("os dois visuais carregam: canvas único, pivô no pé, todos os quadros das 4 animações", () => {
    for (const [sp, id] of Object.entries(OFFICIAL_VISUALS)) {
      const cv = cat[id];
      expect(cv, id).toBeDefined();
      expect(cat[sp], sp).toBeDefined(); // a espécie original continua no catálogo, intocada
      const m = cv.manifest;
      expect(m.dimensions).toMatchObject({ frameW: 40, frameH: 36 });
      expect(m.pivot).toEqual({ x: 20, y: 34 });
      expect(m.anatomy).toBe("biped");
      for (const a of ["idle", "walk", "attack", "hurt"]) {
        const anim = m.animations[a];
        expect(anim, `${id} ${a}`).toBeDefined();
        for (const f of [...anim.frames, ...Object.values(anim.dirFrames ?? {}).flat()]) expect(cv.frameUrls?.[f.atlasKey!], `${id} ${f.atlasKey}`).toBeDefined();
      }
    }
  });

  it("pé estável e transparência limpa: a última linha opaca é y=33 em todo quadro, alfa só 0 ou 255", async () => {
    for (const [id, dir] of Object.entries(DIRS)) {
      const m = JSON.parse(readFileSync(join(GA, dir, "creature.json"), "utf8"));
      const keys = new Set<string>(Object.values(m.animations as Record<string, { frames: { atlasKey: string }[] }>).flatMap((a) => a.frames.map((f) => f.atlasKey)));
      for (const d of Object.values(m.animations.walk.dirFrames as Record<string, { atlasKey: string }[]>)) for (const f of d) keys.add(f.atlasKey);
      for (const k of keys) {
        const { w, h, d } = await alphaOf(join(GA, dir, "sprites", k));
        expect([w, h], `${id} ${k}`).toEqual([40, 36]);
        let foot = -1;
        for (let i = 3; i < d.length; i += 4) {
          expect(d[i] === 0 || d[i] === 255, `${k} alfa ${d[i]}`).toBe(true);
          if (d[i]) foot = Math.max(foot, Math.floor((i - 3) / 4 / w));
        }
        expect(foot, `${id} ${k}`).toBe(33);
      }
    }
  });

  it("walk do DS com os DOIS passos (parado → A → parado → B); Gabumon S tem só 2 quadros", () => {
    const gui = cat["CREATURE-0018"].manifest.animations.walk.dirFrames!;
    for (const d of ["S", "W"]) {
      const k = gui[d].map((f) => f.atlasKey);
      expect(k).toHaveLength(4);
      expect(k[0]).toBe(k[2]);
      expect(new Set(k).size).toBe(3);
    }
    const gab = cat["CREATURE-0019"].manifest.animations.walk.dirFrames!;
    for (const d of ["SW", "NW"]) expect(new Set(gab[d].map((f) => f.atlasKey)).size).toBe(3);
    expect(gab.S).toHaveLength(2);
  });

  it("direções: desenhadas do DS, espelho declarado (o próprio DS espelha) e o resto na mais próxima", () => {
    const gui = cat["CREATURE-0018"].manifest;
    expect(resolveFacing(gui, "walk", "S")).toEqual({ dir: "S", mirror: false });
    expect(resolveFacing(gui, "walk", "W")).toEqual({ dir: "W", mirror: false });
    expect(resolveFacing(gui, "walk", "E")).toEqual({ dir: "W", mirror: true });
    expect(resolveFacing(gui, "walk", "N")).toEqual({ dir: "W", mirror: false }); // sem costas no DS
    expect(resolveFacing(gui, "walk", "NE")).toEqual({ dir: "W", mirror: true });
    const gab = cat["CREATURE-0019"].manifest;
    expect(resolveFacing(gab, "walk", "SE")).toEqual({ dir: "SW", mirror: true });
    expect(resolveFacing(gab, "walk", "NE")).toEqual({ dir: "NW", mirror: true });
    expect(resolveFacing(gab, "walk", "N")).toEqual({ dir: "NW", mirror: false });
    expect(resolveFacing(gab, "walk", "W")).toEqual({ dir: "SW", mirror: false });
    expect(resolveFacing(gab, "walk", "E")).toEqual({ dir: "SW", mirror: true });
  });

  it("golpe e dano usam as animações oficiais compostas (hitFrame no 2º quadro)", () => {
    for (const id of Object.values(OFFICIAL_VISUALS)) {
      const m = cat[id].manifest;
      expect(resolveAnim(m, "ATTACK").name).toBe("attack");
      expect(resolveAnim(m, "HURT").name).toBe("hurt");
      expect(attackTiming(m)).toMatchObject({ hitAtMs: 180, procedural: false });
    }
    // Gabumon de frente usa a pose de punho erguido do DS no golpe
    const s = cat["CREATURE-0019"].manifest.animations.attack.dirFrames!.S.map((f) => f.atlasKey);
    expect(s[1]).toMatch(/_map_S_03\.png$/);
  });

  it("escala: autoScale leva a altura para 48–64 px; officialScales por modo", () => {
    expect(AUTO_RANGE).toEqual([48, 64]);
    expect(autoScale(31)).toBe(2);
    expect(autoScale(29)).toBe(2);
    expect(autoScale(20)).toBe(3);
    expect(autoScale(60)).toBe(1);
    expect(autoScale(40)).toBe(1); // 40 (8 abaixo) bate 80 (16 acima)
    expect(officialScales(cat, 1)).toEqual({ "CREATURE-0018": 1, "CREATURE-0019": 1 });
    expect(officialScales(cat, 2)).toEqual({ "CREATURE-0018": 2, "CREATURE-0019": 2 });
    expect(officialScales(cat, "auto")).toEqual({ "CREATURE-0018": 2, "CREATURE-0019": 2 });
  });

  it("catálogo dos retratos/tempos troca só as duas espécies; modelos de captura são npc", () => {
    const shown = withOfficialVisuals(cat);
    expect(shown["CREATURE-0003"]).toBe(cat["CREATURE-0018"]);
    expect(shown["CREATURE-0009"]).toBe(cat["CREATURE-0019"]);
    expect(shown["CREATURE-0017"]).toBe(cat["CREATURE-0017"]);
    const def = withLook(MAPS["digimon-forest-01"], "v9");
    const sim = createMapWorld(parseTiledMap(def.id, def.tmj), def.scene, 7, { auto: false }).sim;
    officialShowcase(sim, LOCAL_PLAYER, "CREATURE-0003", 2, 0);
    officialShowcase(sim, LOCAL_PLAYER, "CREATURE-0009", 4, 1);
    const shows = sim.state.entities.filter((e) => isOfficialShow(e.id));
    expect(shows.map((e) => [e.kind, e.speciesId])).toEqual([["npc", "CREATURE-0003"], ["npc", "CREATURE-0009"]]);
    const pa = getEntity(sim.state, getPlayer(sim.state, LOCAL_PLAYER)!.partnerId)!;
    expect(shows[0].x - pa.x).toBe(32);
    officialShowcase(sim, LOCAL_PLAYER, null);
    expect(sim.state.entities.some((e) => isOfficialShow(e.id))).toBe(false);
  });
});
