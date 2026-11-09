// Map Factory — prévia estática de um .tmj.json em PNG (sem navegador e sem registrar o mapa no jogo):
// chão e props com os PNG do pacote (aliases), árvores em base + copa, e por cima a camada de jogo
// (colisão em vermelho, spawns, NPC, POI, arena, portais, inícios e as células inalcançáveis do BFS).
// É uma aproximação do renderer (sem luz, sombras nem recorte suave): serve para revisar a planta, não como
// captura final — para essa use npm run shots:live com o mapa registrado em src/world/regions.ts.
// Uso: npm run map:preview -- <mapa.tmj.json | id> [--out arquivo.png] [--scale 1] [--no-overlay]

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { extraPackFiles, GAME_ASSETS, MAPS_DIR, WORLD_DIR } from "./map-factory/context.mjs";
import { allObjects, gidTable, objectCells, prop, solidGrid } from "./map-factory/tiled.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => {
  const i = args.indexOf(n);
  return i >= 0 ? args.splice(i, 2)[1] : d;
};
const out = opt("--out");
const scale = Number(opt("--scale", "1"));
const overlay = !args.includes("--no-overlay");
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.error("uso: npm run map:preview -- <mapa.tmj.json | id> [--out x.png] [--scale 1] [--no-overlay]");
  process.exit(2);
}
const path = target.endsWith(".tmj.json") ? resolve(process.cwd(), target) : join(MAPS_DIR, `${target}.tmj.json`);
const id = basename(path).replace(/\.tmj\.json$/, "");
const m = JSON.parse(readFileSync(path, "utf8"));
const ap = join(dirname(path), `${id}.aliases.json`);
const aliases = existsSync(ap) ? JSON.parse(readFileSync(ap, "utf8")) : null;

// índice nome → caminho: pacote da cena (com prefixo, sem night/) e biblioteca global
const files = new Map();
const walk = (d) => {
  for (const e of existsSync(d) ? readdirSync(d, { withFileTypes: true }) : []) {
    const p = join(d, e.name);
    if (e.isDirectory()) {
      if (e.name !== "night") walk(p);
    } else if (e.name.endsWith(".png")) {
      const rel = p.replace(/\\/g, "/");
      const key = e.name.replace(/\.png$/, "");
      if (aliases?.pack && rel.includes(`/${aliases.pack}/`)) files.set(aliases.prefix + key, p);
      else if (!/\/[a-z]+-v5\//.test(rel) && !files.has(key)) files.set(key, p);
    }
  }
};
walk(join(GAME_ASSETS, "03-environments"));
// pacotes suplementares (aliases.extraPacks: forest-v6 com fp6_) e os recortes deles
const crops = new Map();
for (const e of aliases?.extraPacks ?? [])
  for (const [k, f] of extraPackFiles(e)) {
    files.set(k, f.path);
    if (f.rect) crops.set(k, f.rect);
  }
const cache = new Map();
const img = async (key) => {
  if (!cache.has(key)) {
    let im = files.has(key) ? await loadImage(files.get(key)) : null;
    if (im && crops.has(key)) {
      const [x, y, w, h] = crops.get(key);
      const cc = createCanvas(w, h);
      cc.getContext("2d").drawImage(im, x, y, w, h, 0, 0, w, h);
      im = cc;
    }
    cache.set(key, im);
  }
  return cache.get(key);
};

const W = m.width;
const H = m.height;
const T = m.tilewidth;
const c = createCanvas(W * T * scale, H * T * scale);
const g = c.getContext("2d");
g.imageSmoothingEnabled = false;
g.scale(scale, scale);
g.fillStyle = "#1d2b1f";
g.fillRect(0, 0, W * T, H * T);
const gids = gidTable(m);
for (const l of m.layers.filter((v) => v.type === "tilelayer"))
  for (let i = 0; i < l.data.length; i++) {
    const t = gids.get(l.data[i]);
    if (!t) continue;
    const im = await img(t.key);
    if (im) g.drawImage(im, (i % W) * T, Math.floor(i / W) * T, T, T);
    else {
      g.fillStyle = "#ff00ff";
      g.fillRect((i % W) * T, Math.floor(i / W) * T, T, T);
    }
  }
const objs = allObjects(m);
const props = objs.filter((o) => o.cls === "prop").sort((a, b) => a.y - b.y);
const overlap = aliases?.trees?.overlap ?? 0.42;
for (const p of props) {
  const key = String(prop(p.properties, "key"));
  const base = (await img(key)) ?? (await img(`${key}_base`));
  if (!base) continue;
  const bx = Math.round(p.x - base.width / 2);
  const by = p.y - base.height;
  g.drawImage(base, bx, by);
  const top = files.has(key) ? null : await img(`${key}_top`);
  if (top) g.drawImage(top, Math.round(p.x - top.width / 2), by - top.height + Math.round(top.height * overlap));
}

if (overlay) {
  const { solid } = solidGrid(m);
  // BFS do início player (mesma regra do validador) para marcar bolsões livres inalcançáveis
  const start = objs.find((o) => o.cls === "start" && (o.name || "player") === "player");
  const seen = new Uint8Array(W * H);
  if (start) {
    const s0 = Math.floor(start.y / T) * W + Math.floor(start.x / T);
    const q = [s0];
    seen[s0] = 1;
    for (let h = 0; h < q.length; h++) {
      const x = q[h] % W;
      const y = Math.floor(q[h] / W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && !solid[ny * W + nx] && !seen[ny * W + nx]) {
          seen[ny * W + nx] = 1;
          q.push(ny * W + nx);
        }
      }
    }
  }
  for (let i = 0; i < W * H; i++) {
    if (solid[i]) g.fillStyle = "rgba(220,40,40,0.22)";
    else if (!seen[i]) g.fillStyle = "rgba(255,200,0,0.45)";
    else continue;
    g.fillRect((i % W) * T, Math.floor(i / W) * T, T, T);
  }
  const STYLE = { spawn: "#3fa9ff", npc: "#ffffff", poi: "#ffe066", boss_arena: "#ff4d4d", portal: "#b46bff", trigger: "#00e0b0", collision: "#ff2020", start: "#7CFC00" };
  g.lineWidth = 2;
  g.font = "bold 12px sans-serif";
  for (const o of objs) {
    const col = STYLE[o.cls];
    if (!col) continue;
    const r = objectCells(o, T);
    g.strokeStyle = col;
    g.fillStyle = col;
    if (o.point || (!o.width && !o.height)) {
      g.beginPath();
      g.arc(o.x, o.y, 6, 0, Math.PI * 2);
      g.fill();
    } else g.strokeRect(r.x0 * T + 1, r.y0 * T + 1, (r.x1 - r.x0 + 1) * T - 2, (r.y1 - r.y0 + 1) * T - 2);
    g.fillText(`${o.cls}:${o.name || o.id}`, (o.point ? o.x + 8 : r.x0 * T + 4), (o.point ? o.y + 4 : r.y0 * T + 14));
  }
}
const dest = out ? resolve(process.cwd(), out) : join(WORLD_DIR, "docs/map-factory/previews", `${id}.png`);
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, c.toBuffer("image/png"));
console.log(`ok: ${dest.replace(WORLD_DIR + "/", "")} (${W * T * scale}x${H * T * scale})`);
