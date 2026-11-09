// Tiras de quadros dos VFX por golpe (docs/screens/vfx_<golpe>.png) com o renderer REAL do jogo: mapa da floresta,
// sprites reais, Presenter e WorldView. Sem navegador (@napi-rs/canvas). Uso: npm run shots:vfx
//
// Encenação (só apresentação): a sim roda alguns ticks e para; o atacante assume a espécie dona do golpe (pelo
// learnset), dois selvagens ficam à frente dele, e o Presenter recebe um attack_start + damage sintéticos com o
// formato exato dos eventos da sim. Cada tira mostra 6 instantes: carga, lançamento, viagem, impacto (2) e resíduo.

import { createCanvas, loadImage, type Canvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageUrlsOf, loadCharacterCatalog, loadCreatureCatalog, pickTamers } from "../src/assets/creatures";
import { loadSceneTiles, usedKeys, type ScenePack } from "../src/assets/scene-tiles";
import forestProofPack from "../src/data/maps/forest-proof.aliases.json";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { phasesAt, type Cast } from "../src/render/vfx/engine";
import { PX_PER_SUB, SUB } from "../src/sim/params";
import { createForestProofWorld, LOCAL_PLAYER } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import { snapshot, stepWorld } from "../src/sim/world";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "docs/screens");
const VIEW_W = 400;
const VIEW_H = 240;
const CROP = { w: 200, h: 112 };
const S = 2;

/** Um golpe por arquétipo (15) + cura. */
const MOVES = [
  "pyro_sphere",
  "exhaust_flame",
  "howling_blaster",
  "holy_shot",
  "rock_breaker",
  "plasma_blade",
  "hand_of_fate",
  "bubble_blow",
  "aero_slash",
  "tackle",
  "god_typhoon",
  "kiai_tame",
  "wolf_cry",
  "ice_statue",
  "mach_jab",
  "vigilia_timida",
];

function urlToPath(url: string): string {
  const u = decodeURIComponent(url.split("?")[0]);
  if (u.startsWith("/@fs/")) return u.slice(4);
  if (u.startsWith("/") && !u.startsWith("/home")) return join(ROOT, u);
  return u;
}

const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { sim, events } = createForestProofWorld(7, { auto: false, botAuto: false });
  const creatures = loadCreatureCatalog();
  const packCfg = forestProofPack as ScenePack;
  const tiles = loadSceneTiles(packCfg, "day", usedKeys(sim.map)).tiles;
  const tamers = pickTamers(loadCharacterCatalog());
  const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
  await images.loadAll([...Object.values(creatures).map((c) => c.sheetUrl), ...Object.values(tiles).map((t) => t.url), ...[tamers.local, tamers.remote].flatMap((t) => (t ? imageUrlsOf(t) : []))]);

  for (let i = 0; i < 3; i++) stepWorld(sim, []);
  const mc = sim.content.moves;
  const partner = sim.state.entities.find((e) => e.id === `${LOCAL_PLAYER}:partner`)!;
  const tamer = sim.state.entities.find((e) => e.id === LOCAL_PLAYER)!;
  const wilds = sim.state.entities.filter((e) => e.kind === "wild").slice(0, 2);
  // palco: Tamer atrás, parceira no centro, alvo 3 tiles à direita e um segundo selvagem atrás dele (área/linha)
  const stage = { x: partner.x, y: partner.y };
  tamer.x = stage.x - 24;
  tamer.y = stage.y - 6;
  partner.facing = "E";
  wilds[0].x = stage.x + 3 * SUB;
  wilds[0].y = stage.y;
  wilds[1].x = stage.x + 3 * SUB + 18;
  wilds[1].y = stage.y + 16;
  for (const w of wilds) w.facing = "W";
  // tira os outros do quadro
  for (const e of sim.state.entities) if (e !== partner && e !== tamer && !wilds.includes(e) && Math.hypot(e.x - stage.x, e.y - stage.y) < 12 * SUB) e.x += 30 * SUB;

  const sheets: { id: string; frames: Canvas[]; impact: Canvas }[] = [];
  for (const [k, moveId] of MOVES.entries()) {
    const m = mc.moves[moveId];
    const owner = Object.entries(mc.learnsets).find(([, ls]) => ls.some((e) => e.move === moveId))?.[0] ?? "CREATURE-0003";
    partner.speciesId = owner;
    partner.name = sim.content.species[owner].name;
    wilds[0].speciesId = "CREATURE-0009";
    wilds[1].speciesId = "CREATURE-0005";
    const canvas = makeCanvas(VIEW_W, VIEW_H);
    const presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
    const view = new WorldView(canvas, sim.map, creatures, tiles, images, makeCanvas, { creatureScale: 1, tamers, trees: packCfg.trees });
    presenter.onTick(snapshot(sim), events, 0);
    presenter.onTick(snapshot(sim), [], 100);
    const T0 = 1000;
    const self = m.target === "self";
    const targets = self ? [partner.id] : m.shape === "area" || m.shape === "line" ? [wilds[0].id, wilds[1].id] : [wilds[0].id];
    const seq = 100 + k;
    const at = self ? { x: partner.x, y: partner.y } : m.shape === "line" ? { x: wilds[1].x + 10, y: stage.y + 4 } : { x: wilds[0].x, y: wilds[0].y };
    const evs: WorldEvent[] = [{ t: "attack_start", tick: 10, attackerId: partner.id, targetId: self ? partner.id : wilds[0].id, skillId: moveId, seq, targetIds: targets, at }];
    for (const id of targets) {
      if (m.type === "buff" || m.type === "debuff")
        evs.push({ t: "status", tick: 10, seq, id, moveId, stat: m.effect!.stat, mult: m.effect!.mult, ticks: m.effect!.ticks, sourceId: partner.id });
      else if (m.type === "heal") evs.push({ t: "damage", tick: 10, seq, attackerId: partner.id, targetId: id, amount: 18, kind: "heal", crit: false, hpAfter: partner.maxHp });
      else evs.push({ t: "damage", tick: 10, seq, attackerId: partner.id, targetId: id, amount: 12 + k, kind: "damage", crit: false, hpAfter: 40 });
    }
    presenter.onTick(snapshot(sim), evs, T0);
    const cast = presenter.casts.find((c) => c.seq === seq) as Cast;
    // 6 instantes: carga, lançamento, viagem (ou começo do impacto), impacto cedo, impacto tarde, resíduo
    const first = (ph: string) => {
      for (let t = T0; t < cast.end; t += 2) if (phasesAt(cast, t).some((p) => p.phase === ph)) return t;
      return undefined;
    };
    const charge = first("charge");
    const launch = first("launch");
    const travel = cast.hitAt - cast.launchAt > 60 ? Math.round((cast.launchAt + 20 + cast.hitAt) / 2) + 10 : undefined;
    const imp = cast.hitAt;
    const res = first("residue");
    const times = [
      charge !== undefined ? charge + Math.round(cast.params.charge * 0.6) : T0 + 60,
      launch !== undefined ? launch + 20 : imp - 40,
      travel ?? imp + 20,
      imp + 90,
      imp + Math.round(cast.params.impact * 0.85),
      res !== undefined ? Math.min(cast.end - 10, res + Math.round((cast.end - res) * 0.45)) : cast.end - 20,
    ];
    const labels = ["carga", launch !== undefined ? "lançamento" : "antecipação", travel ? "viagem" : "impacto", "impacto", "impacto", "resíduo"];
    // corpo a corpo: a carga toca colada no impacto; ordena os instantes (e rótulos) no tempo
    const order = times.map((t, i) => ({ t, l: labels[i] })).sort((a, b) => a.t - b.t);
    for (let i = 1; i < order.length; i++) if (order[i].t <= order[i - 1].t) order[i].t = order[i - 1].t + 20;
    order.forEach((o, i) => ((times[i] = o.t), (labels[i] = o.l)));
    const frames: Canvas[] = [];
    let impactFrame: Canvas | undefined;
    // anima de verdade do início até cada instante (o view guarda estado de movimento entre quadros)
    let ti = 0;
    for (let now = 120; now <= times[times.length - 1]; now += 10) {
      presenter.update(now);
      view.update(presenter, 1, now);
      view.follow({ x: stage.x * PX_PER_SUB + 44, y: stage.y * PX_PER_SUB - 14 });
      if (now + 10 > times[ti] || now === times[ti]) {
        view.render(presenter, 1, now);
        const cx = Math.round(stage.x * PX_PER_SUB - view.camera.x + 44 - CROP.w / 2);
        const cy = Math.round(stage.y * PX_PER_SUB - view.camera.y - 14 - CROP.h / 2 - 4);
        const f = createCanvas(CROP.w * S, CROP.h * S);
        const g = f.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(canvas as unknown as Parameters<typeof g.drawImage>[0], cx, cy, CROP.w, CROP.h, 0, 0, CROP.w * S, CROP.h * S);
        g.font = "bold 13px DejaVu Sans, sans-serif";
        g.fillStyle = "#000000";
        g.fillText(`${ti + 1}. ${labels[ti]} · ${now - T0} ms`, 7, 17);
        g.fillStyle = "#ffe9a8";
        g.fillText(`${ti + 1}. ${labels[ti]} · ${now - T0} ms`, 6, 16);
        frames.push(f);
        if (ti === 3) impactFrame = f;
        ti++;
        if (ti >= times.length) break;
      }
    }
    // tira: cabeçalho + 6 quadros lado a lado
    const fw = CROP.w * S;
    const fh = CROP.h * S;
    const head = 30;
    const strip = createCanvas(fw * 6 + 5 * 4, fh + head);
    const g = strip.getContext("2d");
    g.fillStyle = "#181425";
    g.fillRect(0, 0, strip.width, strip.height);
    g.font = "bold 16px DejaVu Sans, sans-serif";
    g.fillStyle = "#ffe9a8";
    g.fillText(`${m.name} — ${sim.content.species[owner].name} · arquétipo ${cast.archetype} (${cast.params.impl}) · ${m.type}/${m.shape} · ${cast.params.paletteName}`, 8, 21);
    frames.forEach((f, i) => g.drawImage(f, i * (fw + 4), head));
    writeFileSync(join(OUT, `vfx_${moveId}.png`), strip.toBuffer("image/png"));
    console.log("ok", `vfx_${moveId}.png`, cast.archetype, times.map((t) => t - T0).join(","));
    sheets.push({ id: moveId, frames, impact: impactFrame ?? frames[3] });
  }
  // visão geral: o quadro de impacto de cada golpe numa grade 4 × 4
  const fw = CROP.w * S;
  const fh = CROP.h * S;
  const cols = 4;
  const rows = Math.ceil(sheets.length / cols);
  const ov = createCanvas(cols * fw + (cols - 1) * 4, rows * (fh + 22) + 4);
  const og = ov.getContext("2d");
  og.fillStyle = "#181425";
  og.fillRect(0, 0, ov.width, ov.height);
  og.font = "bold 14px DejaVu Sans, sans-serif";
  sheets.forEach((s, i) => {
    const x = (i % cols) * (fw + 4);
    const y = Math.floor(i / cols) * (fh + 22);
    og.fillStyle = "#ffe9a8";
    og.fillText(mc.moves[s.id].name, x + 4, y + 16);
    og.drawImage(s.impact, x, y + 20);
  });
  writeFileSync(join(OUT, "vfx_overview.png"), ov.toBuffer("image/png"));
  console.log("ok vfx_overview.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
