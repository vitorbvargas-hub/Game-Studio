// Captura headless do spike com o render real (Chromium headless não roda neste host).
// Uso: npx vite-node arena-spike/capture.ts   (usa @napi-rs/canvas já presente em node_modules, fora do package.json)
// Luta IA x IA (Gabumon x Agumon, Nv 10, seed 5); salva quadros em arena-spike/screens/.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack } from "../src/packs";
import { aiInput, createArena, stepArena, type ArenaConfig } from "./arena";
import cfgJson from "./arena.json";
import { ArenaRenderer, type ImageLike } from "./render";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(HERE, "screens");
const SCALE = 3;
const cfg = cfgJson as ArenaConfig;
const content = loadPack("digimon-fan");

const imgs = new Map<string, ImageLike>();
for (const [path, url] of Object.entries(content.assets)) imgs.set(path, (await loadImage(readFileSync(join(ROOT, url)))) as unknown as ImageLike);

const canvas = createCanvas(cfg.width, cfg.height);
const r = new ArenaRenderer(canvas.getContext("2d") as unknown as CanvasRenderingContext2D, content, cfg, (p) => imgs.get(p) ?? null);
const big = createCanvas(cfg.width * SCALE, cfg.height * SCALE);
const bctx = big.getContext("2d");
bctx.imageSmoothingEnabled = false;
mkdirSync(OUT, { recursive: true });
const shot = (name: string) => {
  bctx.drawImage(canvas, 0, 0, big.width, big.height);
  writeFileSync(join(OUT, `${name}.png`), big.toBuffer("image/png"));
  console.log("screens/" + name + ".png");
};

const st = createArena(content, cfg, { creatureId: "gabumon", level: 10 }, { creatureId: "agumon", level: 10 }, 5);
let shotProjectile = false;
let shotMelee = false;
r.draw(st);
shot("arena_start");
while (!st.outcome) {
  const evs = stepArena(st, content, cfg, [aiInput(st, cfg, 0), aiInput(st, cfg, 1)]);
  for (const e of evs) r.onEvent(st, e);
  r.draw(st);
  if (!shotProjectile && st.projectiles.length && st.tick > 60 && st.projectiles[0].travelled > 30) {
    shot("arena_special");
    shotProjectile = true;
  }
  if (!shotMelee && st.fighters.some((f) => f.swing > 0) && evs.some((e) => e.t === "hit")) {
    for (let i = 0; i < 8; i++) r.draw(st);
    shot("arena_melee");
    shotMelee = true;
  }
}
shot(`arena_end_${st.outcome}`);
console.log("outcome", st.outcome, "tick", st.tick, "hp", st.fighters.map((f) => `${f.hp}/${f.maxHp}`).join(" x "));
