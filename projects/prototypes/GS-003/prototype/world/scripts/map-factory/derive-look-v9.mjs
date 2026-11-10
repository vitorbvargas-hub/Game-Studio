// Look v9 do digimon-forest-01 (Quality Overhaul, fase 2) = look v8 + primeiro plano, água correndo e vento, com as
// luzes do v8 reduzidas a poucas fontes com propósito (feedback do fundador: luzes demais).
// Deriva src/data/maps/v9/digimon-forest-01.{tmj,aliases}.json do v8, de forma determinística (sem RNG): rodar de
// novo dá o mesmo arquivo. O v8 e o padrão não mudam.
//
// Uso: node scripts/map-factory/derive-look-v9.mjs

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { composeClareira, ratio603010, BOX } from "./p7-clareira.mjs";

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
// Fase 3, rodada 2 (QA P2 "contraste dia/noite fraco"): o dia do v8 multiplicava por #bcc4d6 (−25% e azulado) com
// véu azul, e ficava quase tão escuro quanto a noite. Dia agora: luz quente quase neutra, véu dourado leve e vinheta
// curta. Noite: mais escura e mais azul (multiplica #7c80c4, véu 0,16, vinheta 0,6); as luzes continuam em 1,0 e
// passam a destacar mais.
Object.assign(look.ambient.day, { multiply: "#f6eedc", tint: "#ffd890", tintAlpha: 0.05, vignette: 0.24 });
Object.assign(look.ambient.night, { multiply: "#7c80c4", tint: "#070a2c", tintAlpha: 0.16, vignette: 0.6 });
look.fog = { ...pack.look.fog, dayAlpha: 0.04, nightAlpha: 0.18 };
look.particles = { ...pack.look.particles, fireflies: 0.6, dust: 0.8 };
look.sway = { keys: "^(fp8_fern|fp8_tuft|fp4_tall_grass_[ab]|fp9_enc_grass_[abc]|fp8_reed_cluster|fp8_edge_cluster_[ab]|fp8_flowering_bush)$", canopies: true, amp: 1, periodMs: 2600, bands: 3 };
// grama alta de encontro (art/map-factory/forest-v9-p7, prefixo fp9_): grade mais suave que a da folhagem comum, para
// o tom verde-azulado saturado continuar se destacando do chão (QA P2 "grama alta não se distingue")
look.grade = { ...look.grade, rules: [{ match: "^fp9_enc_grass_", saturationMul: 0.95, valueMul: 0.9 }, ...(look.grade.rules ?? [])] };
look.water = { terrain: "water", stepPx: [2, 1], frameMs: 140, frames: 16 };
look.foreground = { behindAlpha: 0.38, fadeMs: 120 };
const extraPacks = [...(pack.extraPacks ?? []).filter((e) => e.pack !== "forest-v9-p7"), { pack: "forest-v9-p7", prefix: "fp9_", root: "map-factory" }];
const outPack = { ...pack, extraPacks, _doc: `${pack._doc ?? ""} | v9: derivado por scripts/map-factory/derive-look-v9.mjs`.trim(), look };

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

// referência do 60/30/10 antes do P7 (mesma caixa, mapa v8)
const ratioV8 = ratio603010(tmj, { TS, prop, layer, solid, nearAny, water }, { x0: BOX.x0 * TS, y0: BOX.y0 * TS, x1: (BOX.x1 + 1) * TS, y1: (BOX.y1 + 1) * TS });

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

// ---------- P7: Clareira piloto recomposta (brief quality-overhaul/phase2/design/P7_CLAREIRA_BRIEF.md) ----------
const table = JSON.parse(readFileSync(join(ROOT, "src/data/encounters", `${ID}.json`), "utf8"));
const p7 = composeClareira(tmj, { TS, prop, layer, solid, nearAny, paths, water, table });
p7.ratioV8 = ratioV8;

// ---------- mirante: kit de penhasco v9 do game-art (art/map-factory/forest-v9-cliffs/), quando existir ----------
// QA fase 3 (P1): o platô do mirante (x20–29, y14–18) lê como laje cinza; o game-art está fazendo o kit. Contrato:
// tiles/<nome>.png com os MESMOS nomes do forest-v8-depth (cliff_top_blob_0..15, cliff_face_straight,
// cliff_face_corner_inner, cliff_face_corner_outer_left/right, cliff_ramp; 32×32, mesma máscara blob-16). Cada
// tile fp8_cliff_* do v9 cujo arquivo exista no kit passa a usar fp9c_<nome>; o que faltar continua no v8. Sem o
// kit, nada muda (o arquivo derivado é o mesmo). Grade: a mesma regra dos penhascos do v8.
const CLIFF_KIT = join(ROOT, "../../art/map-factory/forest-v9-cliffs");
const kitTiles = existsSync(join(CLIFF_KIT, "tiles")) ? new Set(readdirSync(join(CLIFF_KIT, "tiles")).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4))) : new Set();
p7.cliffKit = { present: existsSync(CLIFF_KIT), swapped: [] };
if (kitTiles.size) {
  for (const ts of tmj.tilesets ?? [])
    for (const t of ts.tiles ?? []) {
      const kp = t.properties?.find((q) => q.name === "key");
      const m = typeof kp?.value === "string" && /^fp8_(cliff_[a-z0-9_]+)$/.exec(kp.value);
      if (m && kitTiles.has(m[1])) {
        kp.value = `fp9c_${m[1]}`;
        p7.cliffKit.swapped.push(m[1]);
      }
    }
  // kit v2 (6110bab): a face reta virou 4 variantes (cliff_face_a..d) — a reta do v8 passa a ser a "a" e cada célula
  // de face sorteia a sua por hash da célula (determinístico); 0–1 decalque do kit (raiz/musgo/tufo) por célula de face.
  const faceVariants = ["a", "b", "c", "d"].filter((v) => kitTiles.has(`cliff_face_${v}`));
  const ts0 = tmj.tilesets[0];
  const straight = ts0.tiles.find((t) => t.properties?.find((q) => q.name === "key")?.value === "fp8_cliff_face_straight");
  if (straight && faceVariants.length) {
    const gidOf = { [faceVariants[0]]: ts0.firstgid + straight.id };
    straight.properties.find((q) => q.name === "key").value = `fp9c_cliff_face_${faceVariants[0]}`;
    p7.cliffKit.swapped.push(`cliff_face_straight→cliff_face_${faceVariants[0]}`);
    for (const v of faceVariants.slice(1)) {
      const id = ts0.tilecount++;
      ts0.tiles.push({ id, properties: straight.properties.map((q) => (q.name === "key" ? { ...q, value: `fp9c_cliff_face_${v}` } : { ...q })) });
      gidOf[v] = ts0.firstgid + id;
    }
    const cellHash = (x, y, s) => {
      let h = (x * 374761393 + y * 668265263 + s * 974634121) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };
    const det = layer("ground_detail");
    const decalLayer = layer("decals");
    const decalKeys = ["root_vine_a", "root_vine_b", "moss_drip_extra", "grass_tuft_edge"].filter((k) => existsSync(join(CLIFF_KIT, "decals", `${k}.png`)));
    const straightGid = gidOf[faceVariants[0]];
    p7.cliffKit.faces = {};
    p7.cliffKit.decals = [];
    let prev = null;
    for (let i = 0; i < det.data.length; i++) {
      if (det.data[i] !== straightGid) { prev = null; continue; }
      const x = i % tmj.width, y = Math.floor(i / tmj.width);
      let v = faceVariants[Math.floor(cellHash(x, y, 31) * faceVariants.length)];
      if (v === prev) v = faceVariants[(faceVariants.indexOf(v) + 1) % faceVariants.length]; // vizinhas nunca iguais
      prev = v;
      det.data[i] = gidOf[v];
      p7.cliffKit.faces[`${x},${y}`] = v;
      if (decalKeys.length && cellHash(x, y, 47) < 0.6) {
        const k = decalKeys[Math.floor(cellHash(x, y, 53) * decalKeys.length)];
        const o = { id: tmj.nextobjectid++, name: `fp9c_${k}`, type: "decal", x: x * TS + 6 + Math.floor(cellHash(x, y, 59) * 20), y: y * TS + (k === "grass_tuft_edge" ? 2 : 8), point: true, properties: [{ name: "key", type: "string", value: `fp9c_${k}` }] };
        if (cellHash(x, y, 61) < 0.5) o.properties.push({ name: "flip", type: "bool", value: true });
        decalLayer.objects.push(o);
        p7.cliffKit.decals.push(`${x},${y}:${k}`);
      }
    }
  }
  outPack.extraPacks = [...outPack.extraPacks.filter((e) => e.pack !== "forest-v9-cliffs"), { pack: "forest-v9-cliffs", prefix: "fp9c_", root: "map-factory" }];
  const cliffRule = look.grade.rules.find((r) => r.match === "^fp8_cliff_");
  if (cliffRule) look.grade.rules.unshift({ ...cliffRule, match: "^fp9c_cliff_" });
}
look.water = { ...look.water, stepPx: [0, 2], noise: { phasePx: [7, 5], scale: [26, 34], shade: 14, seed: 17 } };
look.foreground = { ...look.foreground, headFrac: 0.35 };
outPack.look = look;

tmj.properties = [...(tmj.properties ?? []).filter((p) => p.name !== "look"), { name: "look", type: "string", value: "v9" }];

mkdirSync(V9, { recursive: true });
writeFileSync(join(V9, `${ID}.tmj.json`), JSON.stringify(tmj));
writeFileSync(join(V9, `${ID}.aliases.json`), `${JSON.stringify(outPack, null, 2)}\n`);
writeFileSync(join(V9, `${ID}.p7-report.json`), `${JSON.stringify(p7, null, 2)}\n`);
console.log(`P7: ${JSON.stringify(p7)}`);
const count = (pred) => placed.filter(pred).length;
console.log(`v9: ${placed.length} props de primeiro plano (${count((p) => p.key !== "fp8_reed_cluster")} na trilha, ${count((p) => p.key === "fp8_reed_cluster")} juncos no riacho); luzes ${Object.keys(pack.look.lights).length} tipos → ${Object.keys(look.lights).length}`);
