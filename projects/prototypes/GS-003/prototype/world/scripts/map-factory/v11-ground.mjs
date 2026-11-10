// forest-v11 (Quality Overhaul, fase 3): pacote art/map-factory/forest-v11-ground no look v9 do digimon-forest-01.
// Roda dentro do derive-look-v9.mjs, DEPOIS do v10 (que roda sem a terra batida blob-16 e com as árvores no mapa
// todo), de forma determinística (hash/ruído por posição): rodar de novo dá o mesmo arquivo.
//
//   1. chão: fp10_ground_variant_N → fp11_ground_variant_N (mesmos 10 slots, com relevo), nas camadas, nas curvas e
//      no recorte suave;
//   2. terra batida Wang-47 (grass_dirt_wang47_0..46, 8 vizinhos): manchas de forma orgânica em volta da fogueira, da
//      fonte de cura e em 3 trechos das trilhas secundárias (ali a terra passa por baixo da faixa da trilha);
//   3. manchas macro: as 2 corrigidas (alfa 0 nos 8 px da borda), mesmas posições;
//   4. copas à noite: trees/night/ do pacote vira o preset noturno das copas fp10_* (`nightFor` no extraPack);
//   5. mirante: topo mirante_top_blob_* no lugar do cliff_top_blob_* (grade do chão, não a da pedra), sem a faixa
//      de grama do v8 por cima, e decalques espalhados no topo; face, cantos e rampa seguem do forest-v9-cliffs.
// Devolve um relatório (contagens e posições).

import { join } from "node:path";
import { hash, vnoise } from "./p7-clareira.mjs";
import { pngSize, V10_PACK, V10_PREFIX } from "./v10-ground-trees.mjs";

export const V11_PACK = "forest-v11-ground";
export const V11_PREFIX = "fp11_";

// ---------- Wang-47 (porte de art/src/blob_autotile47.js: enumerateBlob47 + blob47Index, sem Canvas) ----------
// edgeMask = N1 E2 S4 W8 (vizinho também é terra); diagMask = NE1 SE2 SW4 NW8. Um bit diagonal só conta no canto
// cujas DUAS arestas já são terra; os outros são zerados antes de procurar o índice (256 vizinhanças → 47 peças).
const CORNERS = [
  { e1: 1, e2: 2, d: 1 }, // NE: N + E
  { e1: 4, e2: 2, d: 2 }, // SE: S + E
  { e1: 4, e2: 8, d: 4 }, // SW: S + W
  { e1: 1, e2: 8, d: 8 }, // NW: N + W
];
const bothCorners = (edge) => CORNERS.filter((c) => edge & c.e1 && edge & c.e2);

/** As 47 peças na ordem estável do pacote (índice = sufixo do arquivo grass_dirt_wang47_<i>). */
export function enumerateBlob47() {
  const list = [];
  for (let edgeMask = 0; edgeMask < 16; edgeMask++) {
    const both = bothCorners(edgeMask);
    for (let v = 0; v < 1 << both.length; v++) {
      let diagMask = 0;
      both.forEach((c, bi) => {
        if (v & (1 << bi)) diagMask |= c.d;
      });
      list.push({ edgeMask, diagMask });
    }
  }
  return list;
}
export const BLOB47 = enumerateBlob47();

/** Índice 0..46 da peça para os 8 vizinhos (diagonais sem as 2 arestas são ignoradas). */
export function blob47Index(edgeMask, rawDiagMask) {
  let diag = 0;
  for (const c of bothCorners(edgeMask)) if (rawDiagMask & c.d) diag |= c.d;
  return BLOB47.findIndex((t) => t.edgeMask === edgeMask && t.diagMask === diag);
}

/** Máscaras de uma célula num conjunto (`has(x, y)`). */
export function masks8(has, x, y) {
  const edge = (has(x, y - 1) ? 1 : 0) | (has(x + 1, y) ? 2 : 0) | (has(x, y + 1) ? 4 : 0) | (has(x - 1, y) ? 8 : 0);
  const diag = (has(x + 1, y - 1) ? 1 : 0) | (has(x + 1, y + 1) ? 2 : 0) | (has(x - 1, y + 1) ? 4 : 0) | (has(x - 1, y - 1) ? 8 : 0);
  return { edge, diag };
}

/** Máscara w47 da trilha (8 bits, normalizada), como scripts/map-factory/validate.mjs a espera. */
function pathMask(has, x, y) {
  const N = has(x, y - 1);
  const E = has(x + 1, y);
  const S = has(x, y + 1);
  const Wn = has(x - 1, y);
  return (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (Wn ? 8 : 0) | (N && E && has(x + 1, y - 1) ? 16 : 0) | (S && E && has(x + 1, y + 1) ? 32 : 0) | (S && Wn && has(x - 1, y + 1) ? 64 : 0) | (N && Wn && has(x - 1, y - 1) ? 128 : 0);
}

/** Trechos de trilha secundária com terra batida em volta (nome da curva no .tmj). */
export const DIRT_TRAILS = ["rota_secundaria_pedras", "rota_secundaria_riacho", "rota_vau_pedras"];

/**
 * @param tmj     mapa v9 (mutado aqui), já com P7, kit de penhasco e v10 aplicados
 * @param look    look v9 (mutado: regras de grade)
 * @param outPack aliases do v9 (mutado: pacote fp11_ com a noite das copas, chão das curvas)
 * @param h       { TS, prop, layer, solid:Set, nearAny, paths, water, table, artRoot }
 */
export function applyForestV11(tmj, look, outPack, h) {
  const { TS, prop, layer, solid, nearAny, paths, water, table, artRoot } = h;
  const PACK = join(artRoot, V11_PACK);
  const W = tmj.width;
  const H = tmj.height;
  const report = { pack: V11_PACK };
  const ts0 = tmj.tilesets[0];
  const keyProp = (t) => t.properties?.find((q) => q.name === "key");
  const keyOf = new Map(ts0.tiles.map((t) => [ts0.firstgid + t.id, keyProp(t)?.value]));
  const gidOf = new Map([...keyOf].map(([g, k]) => [k, g]));
  const tileGid = (key, like) => {
    if (gidOf.has(key)) return gidOf.get(key);
    const id = ts0.tilecount++;
    const base = like ? ts0.tiles.find((t) => keyProp(t)?.value === like) : undefined;
    const props = base ? base.properties.map((q) => (q.name === "key" ? { ...q, value: key } : { ...q })) : [{ name: "key", type: "string", value: key }, { name: "solid", type: "bool", value: false }];
    ts0.tiles.push({ id, properties: props });
    gidOf.set(key, ts0.firstgid + id);
    keyOf.set(ts0.firstgid + id, key);
    return ts0.firstgid + id;
  };
  const ground = layer("ground");
  const det = layer("ground_detail");
  const kAt = (l, x, y) => (x < 0 || y < 0 || x >= W || y >= H ? "" : String(keyOf.get(l.data[y * W + x]) ?? ""));

  // ---------- 1. chão: as variantes do v10 viram as do v11 (mesmos índices) ----------
  const renamed = {};
  for (const t of ts0.tiles) {
    const kp = keyProp(t);
    const m = typeof kp?.value === "string" && /^fp10_ground_variant_(\d+)$/.exec(kp.value);
    if (!m) continue;
    kp.value = `${V11_PREFIX}ground_variant_${m[1]}`;
    keyOf.set(ts0.firstgid + t.id, kp.value);
    gidOf.set(kp.value, ts0.firstgid + t.id);
    renamed[kp.value] = true;
  }
  const toV11 = (k) => k.replace(/^fp10_ground_variant_/, `${V11_PREFIX}ground_variant_`);
  for (const c of layer("curves").objects) {
    const p = c.properties.find((q) => q.name === "ground");
    if (p) p.value = String(p.value).split(",").map(toV11).join(",");
  }
  for (const s of outPack.smoothAutotile ?? []) s.ground = s.ground.map(toV11);
  const groundCells = ground.data.filter((g) => /^fp11_ground_variant_/.test(String(keyOf.get(g)))).length;
  report.ground = { variants: Object.keys(renamed).sort(), cells: groundCells };

  // ---------- 2. terra batida Wang-47 ----------
  const below = layer("objects_below").objects;
  const patchCells = new Set();
  for (const p of layer("patches").objects) for (const c of String(prop(p, "cells") ?? "").split(",").filter(Boolean)) patchCells.add(Number(c));
  const encRects = (table?.areas ?? []).map((a) => a.rect);
  const inEnc = (x, y) => encRects.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const solidNow = new Set(solid);
  for (const o of below) if (prop(o, "solid") === true) solidNow.add(`${Math.floor(o.x / TS)},${Math.floor((o.y - 1) / TS)}`);
  const PATH_PREFIX = "fp4_path_w47_";
  const isPathCell = (x, y) => kAt(ground, x, y).startsWith(PATH_PREFIX);
  // célula que pode virar terra: grama do chão novo, ou célula da trilha que a faixa da curva já pinta (o renderer
  // desenha a faixa por cima de qualquer chão: a terra passa por baixo dela); nada de colisão, lama, água, zona de
  // encontro (grama alta), ponte/penhasco (ground_detail) nem a borda do mapa
  const eligible = (x, y, allowPath) => {
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return false;
    const k = kAt(ground, x, y);
    const cx = x * TS + TS / 2;
    const cy = y * TS + TS / 2;
    const path = k.startsWith(PATH_PREFIX);
    if (!/^fp11_ground_variant_/.test(k) && !(allowPath && path && nearAny(paths, cx, cy) <= TS / 2 + 1)) return false;
    if (det.data[y * W + x] || solidNow.has(`${x},${y}`) || patchCells.has(y * W + x) || inEnc(x, y)) return false;
    return nearAny(water, cx, cy) >= TS;
  };
  const dirt = new Map(); // célula → região
  const regions = [];
  const addRegion = (tag, cells) => {
    const kept = cells.filter((i) => !dirt.has(i));
    for (const i of kept) dirt.set(i, tag);
    regions.push({ tag, cells: kept.length });
  };
  const findProp = (k) => below.find((o) => prop(o, "key") === k);
  // (a) acampamento e fonte: elipse com borda irregular (ruído) em células inteiras
  const blob = (cx, cy, rx, ry, seed, allowPath) => {
    const out = [];
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++)
      for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
        const e = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
        if (e > 1 + (vnoise(x * 0.8, y * 0.8, seed) - 0.5) * 0.7) continue;
        if (eligible(x, y, allowPath)) out.push(y * W + x);
      }
    return out;
  };
  const fire = findProp("fp8_campfire_small");
  if (fire) addRegion("fogueira", blob(fire.x / TS + 0.4, (fire.y - 4) / TS + 0.6, 2.9, 2.1, 2101, false));
  const heal = findProp("fp6_healing_point");
  if (heal) addRegion("fonte-cura", blob(heal.x / TS, (heal.y - 4) / TS + 0.2, 2.3, 1.8, 2102, true));
  // (b) trilhas secundárias: em cada uma, o trecho com mais chão livre em volta (longe das outras manchas); a terra
  // acompanha a faixa (0,6–1,6 tile além da borda dela, com ruído) num raio de ~3 tiles em volta do ponto escolhido
  const curveObjs = layer("curves").objects;
  report.trails = [];
  DIRT_TRAILS.forEach((name, ti) => {
    const c = curveObjs.find((o) => o.name === name);
    if (!c) return;
    const pts = c.polyline.map((p) => ({ x: c.x + p.x, y: c.y + p.y }));
    const cells = (px, py, R) => {
      const out = [];
      for (let y = Math.floor(py / TS - R - 1); y <= Math.ceil(py / TS + R + 1); y++)
        for (let x = Math.floor(px / TS - R - 1); x <= Math.ceil(px / TS + R + 1); x++) {
          const cx = x * TS + TS / 2;
          const cy = y * TS + TS / 2;
          const n = vnoise(x * 0.7, y * 0.7, 2201 + ti);
          if (Math.hypot(cx - px, cy - py) / TS > R * (0.75 + n * 0.5)) continue;
          if (nearAny([c], cx, cy) > TS * (0.6 + n * 1.0)) continue;
          if (eligible(x, y, true)) out.push(y * W + x);
        }
      return out;
    };
    let best;
    for (let i = 4; i < pts.length - 4; i += 3) {
      const p = pts[i];
      if (regions.some((r) => r.at && Math.hypot(r.at.x - p.x, r.at.y - p.y) < TS * 7)) continue;
      if ([fire, heal].some((o) => o && Math.hypot(o.x - p.x, o.y - p.y) < TS * 6)) continue;
      const cs = cells(p.x, p.y, 3);
      // prefere trecho com grama dos dois lados (não só a faixa) e um pouco de variedade por hash
      const grassN = cs.filter((i2) => /^fp11_ground_variant_/.test(String(keyOf.get(ground.data[i2])))).length;
      const score = grassN + cs.length * 0.3 + hash(i, ti, 2203) * 2;
      if (grassN >= 5 && (!best || score > best.score)) best = { score, p, cs };
    }
    if (!best) return;
    addRegion(`trilha:${name}`, best.cs);
    regions[regions.length - 1].at = best.p;
    report.trails.push({ name, at: [Math.round(best.p.x / TS), Math.round(best.p.y / TS)] });
  });
  // limpeza: célula solta (sem vizinha ortogonal) sai; buraco de 1 célula cercado de terra nas 4 arestas entra
  const has = (x, y) => x >= 0 && y >= 0 && x < W && y < H && dirt.has(y * W + x);
  for (const i of [...dirt.keys()]) {
    const x = i % W;
    const y = Math.floor(i / W);
    if (!has(x, y - 1) && !has(x + 1, y) && !has(x, y + 1) && !has(x - 1, y)) dirt.delete(i);
  }
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++)
      if (!has(x, y) && has(x, y - 1) && has(x + 1, y) && has(x, y + 1) && has(x - 1, y) && eligible(x, y, true)) dirt.set(y * W + x, dirt.get(y * W + x - 1));
  // grava: índice Wang-47 por célula; célula da trilha que virou terra sai do conjunto da trilha
  const byIdx = {};
  const pathTouched = new Set();
  let fromPath = 0;
  for (const [i] of dirt) {
    const x = i % W;
    const y = Math.floor(i / W);
    const { edge, diag } = masks8(has, x, y);
    const idx = blob47Index(edge, diag);
    if (isPathCell(x, y)) fromPath++;
    if (isPathCell(x, y)) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) pathTouched.add((y + dy) * W + x + dx);
    ground.data[i] = tileGid(`${V11_PREFIX}grass_dirt_wang47_${idx}`);
    byIdx[idx] = (byIdx[idx] ?? 0) + 1;
  }
  // máscaras w47 das células de trilha vizinhas: o conjunto perdeu as que viraram terra (o gate `wang` confere)
  let pathFixed = 0;
  for (const i of pathTouched) {
    const x = i % W;
    const y = Math.floor(i / W);
    if (dirt.has(i) || !isPathCell(x, y)) continue;
    const m = pathMask((a, b) => isPathCell(Math.max(0, Math.min(W - 1, a)), Math.max(0, Math.min(H - 1, b))), x, y);
    const k = `${PATH_PREFIX}${m}`;
    if (kAt(ground, x, y) === k) continue;
    ground.data[i] = tileGid(k, kAt(ground, x, y));
    pathFixed++;
  }
  report.dirt = {
    regions: regions.map(({ tag }) => ({ tag, cells: [...dirt].filter(([, t]) => t === tag).map(([i]) => [i % W, Math.floor(i / W)]) })),
    pieces: Object.keys(byIdx).length,
    cells: dirt.size,
    fromPath,
    pathMasksFixed: pathFixed,
  };

  // ---------- 3. manchas macro corrigidas ----------
  const macroLayer = layer("ground-macro-overlay");
  for (const o of macroLayer?.objects ?? []) {
    const kp = o.properties.find((q) => q.name === "key");
    const n = String(kp.value).replace(/^fp10_/, "");
    const a = pngSize(join(artRoot, V10_PACK, `overlays/${n}.png`));
    const b = pngSize(join(PACK, `overlays/${n}.png`));
    if (a.w !== b.w || a.h !== b.h) throw new Error(`forest-v11: ${n} mudou de tamanho (${a.w}×${a.h} → ${b.w}×${b.h})`);
    kp.value = o.name = `${V11_PREFIX}${n}`;
  }
  report.macro = (macroLayer?.objects ?? []).map((o) => o.name);

  // ---------- 5. mirante ----------
  const mir = [];
  for (const t of ts0.tiles) {
    const kp = keyProp(t);
    const m = typeof kp?.value === "string" && /^fp9c_cliff_top_blob_(\d+)$/.exec(kp.value);
    if (!m) continue;
    kp.value = `${V11_PREFIX}mirante_top_blob_${m[1]}`;
    keyOf.set(ts0.firstgid + t.id, kp.value);
  }
  for (let i = 0; i < ground.data.length; i++) if (/^fp11_mirante_top_blob_/.test(String(keyOf.get(ground.data[i])))) mir.push(i);
  // a faixa de grama do v8 por cima do topo (ground_detail) era a "mancha verde retangular": sai, o topo novo já é
  // grama com pedra
  let stripe = 0;
  for (const i of mir)
    if (/ground_variant_/.test(String(keyOf.get(det.data[i]) ?? ""))) {
      det.data[i] = 0;
      stripe++;
    }
  // decalques espalhados no topo (o interior repete a mesma peça blob_15): jitter livre dentro da célula, nunca na
  // célula de um prop sólido nem na borda sul (a face começa ali)
  const decals = layer("decals");
  const MIR_DECALS = ["fp8_moss_patch", "fp10_mossy_stone_cluster", "fp8_leaf_litter", "fp8_pebble_cluster", "fp10_leaf_litter_big", "fp9c_grass_tuft_edge", "fp8_moss_patch", "fp8_pebble_cluster"];
  const mirSet = new Set(mir);
  let nextId = tmj.nextobjectid;
  const mirDecals = [];
  for (const i of mir) {
    const x = i % W;
    const y = Math.floor(i / W);
    for (let k = 0; k < 2; k++) {
      if (hash(x, y * 2 + k, 2301) > 0.55) continue;
      if (solidNow.has(`${x},${y}`)) continue;
      const dx = 4 + Math.floor(hash(x, y * 2 + k, 2302) * 24);
      const dy = 6 + Math.floor(hash(x, y * 2 + k, 2303) * 20);
      if (!mirSet.has(i + W) && dy > 18) continue;
      const px = x * TS + dx;
      const py = y * TS + dy;
      if (mirDecals.some((d) => Math.hypot(d.x - px, d.y - py) < 18)) continue;
      const key = MIR_DECALS[Math.floor(hash(x, y * 2 + k, 2304) * MIR_DECALS.length)];
      const o = { id: nextId++, name: key, type: "decal", x: px, y: py, point: true, properties: [{ name: "key", type: "string", value: key }, { name: "v11", type: "bool", value: true }] };
      if (hash(px, py, 2305) < 0.5) o.properties.push({ name: "flip", type: "bool", value: true });
      decals.objects.push(o);
      mirDecals.push({ key, x: px, y: py });
    }
  }
  tmj.nextobjectid = nextId;
  report.mirante = { cells: mir.length, pieces: [...new Set(mir.map((i) => keyOf.get(ground.data[i])))].sort(), stripeRemoved: stripe, decals: mirDecals.length };

  // ---------- look: pacote (com a noite das copas fp10_), grade ----------
  outPack.extraPacks = [...(outPack.extraPacks ?? []).filter((e) => e.pack !== V11_PACK), { pack: V11_PACK, prefix: V11_PREFIX, root: "map-factory", nightFor: V10_PREFIX }];
  // chão, terra, manchas e topo do mirante: a mesma grade do chão (mesma rampa GRASS_A do v8/v10), para o topo do
  // mirante emendar com a grama em volta em vez de ler como pedra (a regra fp9c_cliff_ tinge de roxo-acinzentado)
  // a terra batida: a grama do tile no tom do chão e a terra no tom da faixa da trilha (regra fp4_path_), de dia e de
  // noite; senão a mancha lê como queimado ao lado da trilha (1ª montagem) e fica marrom no meio da noite azul
  const pathRule = look.grade.rules.find((r) => r.match === "^fp4_path_");
  look.grade.rules = [
    {
      match: `^${V11_PREFIX}grass_dirt_wang47_`,
      saturationMul: 0.78,
      valueMul: 0.6,
      ...(pathRule
        ? {
            earth: {
              saturationMul: pathRule.saturationMul,
              valueMul: pathRule.valueMul,
              tint: pathRule.tint,
              tintMix: pathRule.tintMix,
              // a trilha tem noite pintada (forest-v4/night) e a terra não: valores medidos para a média do tile de
              // terra cheio (wang47_46) ficar na da trilha noturna graduada (54,47,59 contra 51,43,60)
              night: { saturationMul: 0.45, valueMul: 0.72, tint: "#4a3c70", tintMix: 0.5 },
            },
          }
        : {}),
    },
    { match: `^${V11_PREFIX}(ground_variant_|macro_patch_|mirante_top_blob_)`, saturationMul: 0.78, valueMul: 0.6 },
    ...look.grade.rules.filter((r) => !r.match.startsWith(`^${V11_PREFIX}`)),
  ];
  return report;
}
