// forest-v12: medições do relatório (V12_DEV.md). Uso: npx vite-node scripts/v12-measure.ts
//   1. cor média da terra cheia (wang47_46) à noite: v11 (tile do dia + earth.night) × v12 (tile pintado à noite, regra
//      da trilha) × a faixa da trilha noturna pintada (forest-v4/night path_w47_255), todos com a grade do look v9;
//   2. topo do mirante (blob_15) e lip à noite: v11 (tile do dia com a grade) × v12 (pintado) × o chão em volta
//      (fp11_ground_variant_0, arte do dia com a grade da noite): matiz e luminância médios;
//   3. borda da mata: distância mínima entre 2 copas de visual idêntico, antes (só espécie+tamanho) e depois (com a
//      variante) e quantos visuais distintos há na faixa.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import v9Pack from "../src/data/maps/v9/digimon-forest-01.aliases.json";
import { gradePixels, gradeRuleFor, type GradeRule, type LookCfg } from "../src/render/look";
import { parseTiledMap } from "../src/sim/map";
import { MAPS, withLook } from "../src/world/regions";

const ART = join(__dirname, "../../../art/map-factory");
const ENV = join(__dirname, "../../../../../../assets/GAME-ASSETS/03-environments");
const look = v9Pack.look as unknown as LookCfg;

async function mean(path: string, rule: GradeRule | undefined, night: boolean): Promise<{ rgb: number[]; hue: number; lum: number }> {
  const img = await loadImage(readFileSync(path));
  const c = createCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, img.width, img.height);
  gradePixels(d.data, look, rule, night);
  const s = [0, 0, 0];
  let n = 0;
  for (let i = 0; i < d.data.length; i += 4)
    if (d.data[i + 3]) {
      for (let k = 0; k < 3; k++) s[k] += d.data[i + k];
      n++;
    }
  const m = s.map((v) => v / n);
  const mx = Math.max(...m);
  const dd = mx - Math.min(...m);
  let h = 0;
  if (dd) h = mx === m[0] ? ((m[1] - m[2]) / dd) % 6 : mx === m[1] ? (m[2] - m[0]) / dd + 2 : (m[0] - m[1]) / dd + 4;
  return { rgb: m.map(Math.round), hue: Math.round((h * 60 + 360) % 360), lum: Math.round(0.3 * m[0] + 0.59 * m[1] + 0.11 * m[2]) };
}

const dirtRule = gradeRuleFor("fp11_grass_dirt_wang47_46", look)!;
const v11NightEarth: GradeRule = { ...dirtRule, earth: { ...dirtRule.earth!, night: { saturationMul: 0.45, valueMul: 0.72, tint: "#4a3c70", tintMix: 0.5 } } };
const out = {
  dirtNight: {
    v11_dayTile_earthNight: await mean(join(ART, "forest-v11-ground/tiles/grass_dirt_wang47_46.png"), v11NightEarth, true),
    v12_paintedNight: await mean(join(ART, "forest-v12-plateau-night/tiles/night/grass_dirt_wang47_night_46.png"), dirtRule, true),
    trail_paintedNight: await mean(join(ENV, "forest-v4/night/tiles/path_w47_255.png"), gradeRuleFor("fp4_path_w47_255", look), true),
  },
  miranteNight: {
    ground_v11_dayTile_nightGrade: await mean(join(ART, "forest-v11-ground/tiles/ground_variant_0.png"), gradeRuleFor("fp11_ground_variant_0", look), true),
    lip_v12_paintedNight: await mean(join(ART, "forest-v12-plateau-night/lip/night/mirante_top_edge_night_straight_0.png"), gradeRuleFor("fp12_mirante_top_edge_straight_0", look), true),
    lip_v12_dayTile_nightGrade: await mean(join(ART, "forest-v12-plateau-night/lip/mirante_top_edge_straight_0.png"), gradeRuleFor("fp12_mirante_top_edge_straight_0", look), true),
    v11_dayTile_graded: await mean(join(ART, "forest-v11-ground/mirante/mirante_top_blob_15.png"), gradeRuleFor("fp11_mirante_top_blob_15", look), true),
    v12_paintedNight: await mean(join(ART, "forest-v12-plateau-night/mirante/night/mirante_top_blob_night_15.png"), gradeRuleFor("fp11_mirante_top_blob_15", look), true),
    v11_dayTile_dayGrade: await mean(join(ART, "forest-v11-ground/mirante/mirante_top_blob_15.png"), gradeRuleFor("fp11_mirante_top_blob_15", look), false),
  },
  edge: (() => {
    const m = parseTiledMap("digimon-forest-01", withLook(MAPS["digimon-forest-01"], "v9").tmj);
    const W = m.width;
    const H = m.height;
    const re = /^fp1[02]_(tall_narrow|wide_low|leaning|ancient_thick)_(large|small)(_flip|_tone_dark|_tone_light)?$/;
    const t = m.props.filter((p) => re.test(p.key) && Math.min(p.x / 32, p.y / 32, W - p.x / 32, H - p.y / 32) < 5);
    const sil = (k: string) => k.replace(/^fp1[02]_/, "").replace(/_(flip|tone_dark|tone_light)$/, "");
    const vis = (k: string) => k.replace(/^fp1[02]_/, "");
    const stats = (f: (k: string) => string) => {
      const d = t.map((a) => Math.min(...t.filter((b) => b !== a && f(b.key) === f(a.key)).map((b) => Math.hypot(a.x - b.x, a.y - b.y))));
      const sorted = [...d].sort((a, b) => a - b);
      return { distinct: new Set(t.map((p) => f(p.key))).size, minPx: Math.round(sorted[0]), medianPx: Math.round(sorted[sorted.length >> 1]), under160: d.filter((v) => v < 160).length };
    };
    return { trees: t.length, before: stats(sil), after: stats(vis) };
  })(),
};
console.log(JSON.stringify(out, null, 1));
writeFileSync(join(__dirname, "../../../quality-overhaul/phase3/v12/v12_measure.json"), `${JSON.stringify(out, null, 1)}\n`);
