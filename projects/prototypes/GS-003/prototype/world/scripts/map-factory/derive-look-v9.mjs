// Look v9 do digimon-forest-01 (Quality Overhaul, fase 2) = look v8 + primeiro plano, água correndo e vento, com as
// luzes do v8 reduzidas a poucas fontes com propósito (feedback do fundador: luzes demais).
// Deriva src/data/maps/v9/digimon-forest-01.{tmj,aliases}.json do v8, de forma determinística (sem RNG): rodar de
// novo dá o mesmo arquivo. O v8 e o padrão não mudam.
//
// Uso: node scripts/map-factory/derive-look-v9.mjs

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const V8 = join(ROOT, "src/data/maps/v8");
const V9 = join(ROOT, "src/data/maps/v9");
const ID = "digimon-forest-01";

const tmj = JSON.parse(readFileSync(join(V8, `${ID}.tmj.json`), "utf8"));
const pack = JSON.parse(readFileSync(join(V8, `${ID}.aliases.json`), "utf8"));
const TS = tmj.tilewidth;

// ---------- luzes: só as que guiam ou marcam algo ----------
// v8: 66 emissores (30 cogumelos, 9 cristais, 9 cogumelos digitais, 3 flores…) viravam bolhas por toda a tela.
// v9: lanternas (guiam pela trilha), fogueira (acampamento), ponto de cura (função) e os 3 totens (marcos).
const KEEP = {
  fp8_lantern_post: { radius: 44, intensity: 0.75 },
  fp8_campfire_small: { radius: 40, intensity: 0.85 },
  fp6_healing_point: { radius: 40, intensity: 0.55 },
  fp8_data_totem: { radius: 48, intensity: 0.7 },
};
const look = structuredClone(pack.look);
look.id = "v9";
look.doc = "v8 + primeiro plano (objects_above), água correndo, vento em copas e grama; luzes reduzidas a lanternas, fogueira, cura e totens";
look.lights = Object.fromEntries(Object.entries(KEEP).map(([k, o]) => [k, { ...pack.look.lights[k], ...o }]));
look.playerLight = { ...pack.look.playerLight, radius: 48, intensity: 0.38 };
look.ambient = structuredClone(pack.look.ambient);
look.ambient.day.lightScale = 0.4;
look.ambient.night.lightScale = 1.0;
look.particles = { ...pack.look.particles, fireflies: 0.6, dust: 0.8 };
look.sway = { keys: "^(fp8_fern|fp8_tuft|fp4_tall_grass_[ab]|fp8_reed_cluster|fp8_edge_cluster_[ab]|fp8_flowering_bush)$", canopies: true, amp: 1, periodMs: 2600, bands: 3 };
look.water = { terrain: "water", stepPx: [2, 1], frameMs: 140, frames: 16 };
look.foreground = { behindAlpha: 0.38, fadeMs: 120 };
const outPack = { ...pack, _doc: `${pack._doc ?? ""} | v9: derivado por scripts/map-factory/derive-look-v9.mjs`.trim(), look };

// ---------- primeiro plano ----------
const prop = (o, n) => o.properties?.find((p) => p.name === n)?.value;
const layer = (n) => tmj.layers.find((l) => l.name === n);
const curves = layer("curves").objects;
const solid = new Set();
for (const o of layer("collision").objects) {
  const x0 = Math.floor(o.x / TS);
  const y0 = Math.floor(o.y / TS);
  const x1 = o.width ? Math.ceil((o.x + o.width) / TS) - 1 : x0;
  const y1 = o.height ? Math.ceil((o.y + o.height) / TS) - 1 : y0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) solid.add(`${x},${y}`);
}
const below = layer("objects_below").objects;
for (const o of below) if (prop(o, "solid") === true) solid.add(`${Math.floor(o.x / TS)},${Math.floor((o.y - 1) / TS)}`);

/** Distância (px) de (x,y) até a faixa de uma curva (negativa = dentro). */
function fieldTo(c, x, y) {
  const hw = String(prop(c, "hw")).split(",").map(Number);
  const pts = c.polyline.map((p) => ({ x: c.x + p.x, y: c.y + p.y }));
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / l2));
    const f = Math.hypot(x - a.x - dx * t, y - a.y - dy * t) - (hw[i] + (hw[i + 1] - hw[i]) * t);
    best = Math.min(best, f);
  }
  return best;
}
const paths = curves.filter((c) => prop(c, "terrain") === "path");
const water = curves.filter((c) => prop(c, "terrain") === "water");
const nearAny = (cs, x, y) => Math.min(...cs.map((c) => fieldTo(c, x, y)));
const tooCloseToProp = (x, y, r) => below.some((o) => Math.hypot(o.x - x, o.y - y) < r);

const placed = [];
const free = (x, y, r) => !placed.some((p) => Math.hypot(p.x - x, p.y - y) < r);
/**
 * Ao longo da trilha principal e das secundárias: a cada ~6 tiles, uma moita na borda SUL da faixa (pés 6–14 px
 * fora da trilha), para o jogador andando na beira de baixo passar "atrás" dela. Fora de colisão e longe de props.
 */
const FG_PATH = ["fp8_edge_cluster_a", "fp8_flowering_bush", "fp8_fern", "fp8_edge_cluster_b", "fp8_fern"];
let k = 0;
for (const c of paths) {
  const pts = c.polyline.map((p) => ({ x: c.x + p.x, y: c.y + p.y }));
  let acc = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    acc += Math.hypot(b.x - a.x, b.y - a.y);
    if (acc < TS * 6) continue;
    // só trechos que correm de lado (a borda de baixo existe): |dx| >= |dy|
    if (Math.abs(b.x - a.x) < Math.abs(b.y - a.y)) continue;
    for (const off of [14, 20, 26]) {
      const x = Math.round(b.x);
      const y = Math.round(b.y + off + 10);
      const f = nearAny(paths, x, y);
      if (f < 4 || f > 18) continue;
      if (solid.has(`${Math.floor(x / TS)},${Math.floor((y - 1) / TS)}`) || nearAny(water, x, y) < 8 || tooCloseToProp(x, y, 18) || !free(x, y, TS * 3)) continue;
      placed.push({ key: FG_PATH[k++ % FG_PATH.length], x, y });
      acc = 0;
      break;
    }
  }
}
/** Juncos de primeiro plano na margem sul do riacho (a cada ~5 tiles). */
for (const c of water) {
  const pts = c.polyline.map((p) => ({ x: c.x + p.x, y: c.y + p.y }));
  const hw = String(prop(c, "hw")).split(",").map(Number);
  let acc = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    acc += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    if (acc < TS * 5) continue;
    const b = pts[i + 1];
    // pés logo abaixo da margem (meia-largura + 2–10 px): os juncos sobem por cima da água
    for (const off of [2, 6, 10]) {
      const x = Math.round(b.x);
      const y = Math.round(b.y + hw[i + 1] + off);
      const f = nearAny(water, x, y);
      if (f < 0 || f > 12 || nearAny(paths, x, y) < 6 || tooCloseToProp(x, y, 10) || !free(x, y, TS * 2)) continue;
      placed.push({ key: "fp8_reed_cluster", x, y });
      acc = 0;
      break;
    }
  }
}

let nextId = tmj.nextobjectid;
const above = layer("objects_above");
above.objects = placed.map((p) => ({
  id: nextId++,
  name: p.key,
  type: "prop",
  x: p.x,
  y: p.y,
  point: true,
  properties: [
    { name: "key", type: "string", value: p.key },
    { name: "solid", type: "bool", value: false },
  ],
}));
tmj.nextobjectid = nextId;
tmj.properties = [...(tmj.properties ?? []).filter((p) => p.name !== "look"), { name: "look", type: "string", value: "v9" }];

mkdirSync(V9, { recursive: true });
writeFileSync(join(V9, `${ID}.tmj.json`), JSON.stringify(tmj));
writeFileSync(join(V9, `${ID}.aliases.json`), `${JSON.stringify(outPack, null, 2)}\n`);
const count = (pred) => placed.filter(pred).length;
console.log(`v9: ${placed.length} props de primeiro plano (${count((p) => p.key !== "fp8_reed_cluster")} na trilha, ${count((p) => p.key === "fp8_reed_cluster")} juncos no riacho); luzes ${Object.keys(pack.look.lights).length} tipos → ${Object.keys(look.lights).length}`);
