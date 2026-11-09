// Map Factory — passe de profundidade (look v8, pacote art/map-factory/forest-v8-depth, DRAKANTOS_VISUAL_STUDY.md).
// Opt-in pelo brief (`depth`); sem ele o gerador sai idêntico. Tudo aqui usa RNGs próprios (semente do brief + nome),
// então a grade de árvores, as trilhas e os props do mapa base continuam os mesmos (comparação lado a lado v3 × v4).
//   - platôs: topo blob-16 do kit cliff, face de 1 tile com cantos, rampa andável e colisão (face + anel N/L/O)
//   - chão: variante de chão escolhida por ruído suave (regiões de tom), não sorteio por célula
//   - decalques: 0–3 por célula por ruído (folhas, raízes, pedrinhas, rachaduras, musgo, poça), fora da trilha/água
//   - transições: tufos sobre a borda da trilha (decalque), juncos e pedras de margem no riacho (props)
//   - manchas de solo (lama roxa): elipses com as células permitidas; a borda irregular é do renderer
//   - props emissores em clusters ao longo das rotas até a clareira e a arena, e clutter de borda de mata
// Puro: sem fs.

import { mulberry, smoothNoise, strHash } from "./generate.mjs";

const N4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/** Injeta o terreno do topo do penhasco e muda as células dos platôs (antes das chaves de chão). */
export function depthTerrain(b, g) {
  const d = b.depth;
  const { W, H, T, kind, detail, walkable, inside, at, pathAt } = g;
  const out = { top: new Set(), face: new Set(), ring: new Set(), ramps: new Set(), collision: [], plateaus: [] };
  if (!d?.plateaus?.length) return out;
  const cliff = d.cliff ?? {};
  const terrain = cliff.terrain ?? "cliff";
  b.terrains[terrain] ??= { autotile: "blob16", prefix: cliff.topPrefix ?? "fp8_cliff_top_blob_", outside: "out", solid: false, ...(cliff.interior ? { interior: cliff.interior } : {}) };
  for (const p of d.plateaus) {
    const cells = [];
    for (let y = p.y; y < p.y + p.h; y++)
      for (let x = p.x; x < p.x + p.w; x++) {
        if (!inside(x, y)) continue;
        const i = at(x, y);
        if (b.terrains[kind[i]]?.solid === true || pathAt(x, y) || walkable.has(i)) throw new Error(`brief inválido: platô '${p.name}' cobre água/trilha/ponte em (${x},${y})`);
        cells.push(i);
      }
    for (const i of cells) {
      kind[i] = terrain;
      out.top.add(i);
    }
    // face: 1 célula abaixo de cada topo cujo vizinho S não é topo (colisão), com os cantos nas pontas da fileira
    const fy = p.y + p.h;
    for (let x = p.x; x < p.x + p.w; x++) {
      if (!inside(x, fy)) continue;
      const i = at(x, fy);
      if (pathAt(x, fy) || walkable.has(i)) throw new Error(`brief inválido: face do platô '${p.name}' sobre trilha/ponte em (${x},${fy})`);
      const ramp = (p.ramps ?? [p.ramp]).includes(x);
      detail[i] = ramp ? cliff.ramp ?? "fp8_cliff_ramp" : x === p.x ? cliff.cornerLeft ?? "fp8_cliff_face_corner_outer_left" : x === p.x + p.w - 1 ? cliff.cornerRight ?? "fp8_cliff_face_corner_outer_right" : cliff.face ?? "fp8_cliff_face_straight";
      out.face.add(i);
      if (ramp) out.ramps.add(i);
      else out.collision.push({ name: `${p.name}-face`, x, y: fy, w: 1, h: 1 });
    }
    // anel N/L/O fora do topo: sólido (cair do platô não existe); o lado S é a face
    for (let y = p.y - 1; y < p.y + p.h; y++)
      for (let x = p.x - 1; x <= p.x + p.w; x++) {
        if (!inside(x, y) || out.top.has(at(x, y))) continue;
        out.ring.add(at(x, y));
        out.collision.push({ name: `${p.name}-borda`, x, y, w: 1, h: 1 });
      }
    out.plateaus.push({ name: p.name, x: p.x, y: p.y, w: p.w, h: p.h, ramps: p.ramps ?? [p.ramp] });
  }
  return out;
}

/** Variante de chão por ruído suave (regiões de tom) + hash da célula; `near` puxa variantes perto da água. */
export function depthGroundKey(b, tn, x, y, g) {
  const cfg = b.depth?.ground?.[tn];
  if (!cfg) return undefined;
  const seed0 = (b.seed ?? 1) >>> 0;
  g.groundNoise ??= smoothNoise(seed0 ^ strHash("depth:ground"));
  const n = g.groundNoise(x * 0.8, y * 0.8);
  const h = ((Math.imul(x * 374761393 + y * 668265263, 1274126177) >>> 0) % 1000) / 1000;
  const wet = cfg.wet && g.nearKind(x, y, 1, b.depth.waterTerrain ?? "water");
  const list = wet && h < (cfg.wetChance ?? 0.25) ? cfg.wet : n < (cfg.split ?? 0.5) ? cfg.low : cfg.high;
  return list[Math.floor(h * 7919) % list.length];
}

/**
 * Props e camadas do passe de profundidade (depois dos props do mapa base). Devolve { decals, patches } (objetos
 * Tiled) e acrescenta props via g.addProp. Remove do mapa base os props que caíram em platô/face/anel.
 */
export function depthObjects(b, g, terr) {
  const d = b.depth;
  const { W, H, T, kind, inside, at, pathAt, keep, addProp, props, curves, walkable } = g;
  const seed0 = (b.seed ?? 1) >>> 0;
  const kAt = (x, y) => (inside(x, y) ? kind[at(x, y)] : b.base);
  const water = d.waterTerrain ?? "water";
  const open = d.openTerrain ?? "clearing";
  const isWater = (x, y) => kAt(x, y) === water && !walkable.has(at(x, y));
  const blocked = (x, y) => !inside(x, y) || terr.top.has(at(x, y)) || terr.face.has(at(x, y)) || terr.ring.has(at(x, y));
  const cellOf = (px, py) => [Math.floor(px / T), Math.floor((py - 1) / T)];
  const near = (x, y, r, pred) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (inside(x + dx, y + dy) && pred(x + dx, y + dy)) return true;
    return false;
  };

  // props do base em cima do platô somem (o topo é rocha; o anel ganha os próprios)
  for (let i = props.length - 1; i >= 0; i--) {
    const [x, y] = cellOf(props[i].x, props[i].y);
    if (blocked(x, y)) props.splice(i, 1);
  }
  const propCount0 = props.length;
  const nonSolidOk = (x, y) => inside(x, y) && kAt(x, y) === open && !pathAt(x, y) && !blocked(x, y) && !walkable.has(at(x, y));
  /** Coloca `key` na célula livre mais perto de (x, y) (espiral até r=2). */
  const placeNear = (key, x, y, solid, { onTop = false, ox = 16, oy = 26 } = {}) => {
    for (let r = 0; r <= 2; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const cx = x + dx;
          const cy = y + dy;
          if (!inside(cx, cy)) continue;
          const ok = onTop ? terr.top.has(at(cx, cy)) && !terr.ramps.has(at(cx, cy + 1)) : nonSolidOk(cx, cy);
          if (!ok || (solid && keep.has(at(cx, cy)))) continue;
          if (addProp(key, cx * T + ox, cy * T + oy, solid, { force: onTop || !solid })) return true;
        }
    return false;
  };

  // anel do platô: arbustos/samambaias (o anel já é sólido pela camada collision; os props são só a leitura)
  for (const p of d.plateaus ?? []) {
    const r = mulberry(seed0 ^ strHash(`depth:ring:${p.name}`));
    const keys = p.ringProps ?? ["fp8_fern", "fp8_flowering_bush", "fp8_tuft"];
    for (const i of terr.ring) {
      const x = i % W;
      const y = Math.floor(i / W);
      if (kAt(x, y) !== open || r() < 0.35) continue;
      addProp(keys[Math.floor(r() * keys.length)], x * T + 10 + Math.floor(r() * 12), y * T + 20 + Math.floor(r() * 10), false, { force: true });
    }
    for (const t of p.onTop ?? []) placeNear(t.key, t.x, t.y, t.solid ?? true, { onTop: true });
  }

  // ---- emissores: clusters ao longo das rotas (guiam o caminho) + faróis fixos ----
  const curveByName = new Map(curves.map((c) => [c.name, c]));
  let emissive = 0;
  for (const gd of d.guides ?? []) {
    const c = curveByName.get(gd.path);
    if (!c) throw new Error(`brief inválido: depth.guides: curva '${gd.path}' não existe`);
    const r = mulberry(seed0 ^ strHash(`depth:guide:${gd.path}`));
    const len = c.samples[c.samples.length - 1].s;
    let side = r() < 0.5 ? 1 : -1;
    for (let s = (gd.from ?? 0.1) * len; s <= (gd.to ?? 1) * len; s += gd.every ?? 5) {
      const k = c.samples.findIndex((q) => q.s >= s);
      const p = c.samples[k];
      const q = c.samples[Math.min(c.samples.length - 1, k + 1)] ?? p;
      const tl = Math.hypot(q.x - p.x, q.y - p.y) || 1;
      const nx = -(q.y - p.y) / tl;
      const ny = (q.x - p.x) / tl;
      const [o0, o1] = gd.offset ?? [1.4, 2];
      const off = p.hw + o0 + r() * (o1 - o0);
      const set = gd.sets[Math.floor(r() * gd.sets.length)];
      const bx = p.x + nx * off * side;
      const by = p.y + ny * off * side;
      set.forEach((key, j) => {
        // satélites a ~0,6 tile do núcleo, para fora da trilha
        const sx = bx + (j ? (r() - 0.5) * 1.2 + nx * side * 0.5 : 0);
        const sy = by + (j ? (r() - 0.5) * 0.9 + ny * side * 0.5 : 0);
        const solid = (d.solidKeys ?? []).includes(key);
        if (placeNear(key, Math.floor(sx), Math.floor(sy), solid, { ox: 6 + Math.floor(r() * 20), oy: 18 + Math.floor(r() * 12) })) emissive++;
      });
      side = -side;
    }
  }
  for (const f of d.beacons ?? []) for (const [x, y] of f.at) if (placeNear(f.key, x, y, f.solid ?? (d.solidKeys ?? []).includes(f.key))) emissive++;

  // ---- clutter de borda de mata: núcleo + satélites, espaçados ----
  let clutter = 0;
  if (d.edgeClutter) {
    const ec = d.edgeClutter;
    const r = mulberry(seed0 ^ strHash("depth:edge"));
    const cand = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (nonSolidOk(x, y) && !keep.has(at(x, y)) && N4.some(([dx, dy]) => kAt(x + dx, y + dy) === b.base) && !near(x, y, 1, pathAt)) cand.push([x, y]);
    const used = [];
    for (let n = 0; n < (ec.count ?? 24) && cand.length; n++) {
      const [x, y] = cand.splice(Math.floor(r() * cand.length), 1)[0];
      if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < (ec.spacing ?? 3.5))) continue;
      used.push([x, y]);
      const nuc = ec.nucleus[Math.floor(r() * ec.nucleus.length)];
      if (!addProp(nuc, x * T + 16, y * T + 26, (d.solidKeys ?? []).includes(nuc), {})) continue;
      clutter++;
      const ns = 1 + Math.floor(r() * (ec.maxSatellites ?? 3));
      for (let k = 0; k < ns; k++) {
        const ang = r() * Math.PI * 2;
        const dist = 12 + r() * 14;
        const px = x * T + 16 + Math.cos(ang) * dist;
        const py = y * T + 26 + Math.sin(ang) * dist * 0.6;
        const [cx, cy] = cellOf(px, py);
        if (!nonSolidOk(cx, cy)) continue;
        if (addProp(ec.satellites[Math.floor(r() * ec.satellites.length)], Math.round(px), Math.round(py), false, { force: true })) clutter++;
      }
    }
  }

  // ---- margem do riacho: juncos e pedras molhadas (props não sólidos) ----
  let shore = 0;
  if (d.shore) {
    const sh = d.shore;
    const r = mulberry(seed0 ^ strHash("depth:shore"));
    for (const c of curves.filter((c2) => c2.terrain === water)) {
      for (let s = 0, k = 0; k < c.samples.length; k++) {
        const p = c.samples[k];
        if (p.s < s) continue;
        s = p.s + (sh.every ?? 0.9);
        const q = c.samples[Math.min(c.samples.length - 1, k + 1)];
        const tl = Math.hypot(q.x - p.x, q.y - p.y) || 1;
        for (const side of [1, -1]) {
          if (r() > (sh.chance ?? 0.5)) continue;
          const off = p.hw + (sh.pad ?? 0.55) + r() * 0.5;
          const px = (p.x + (-(q.y - p.y) / tl) * off * side) * T;
          const py = (p.y + ((q.x - p.x) / tl) * off * side) * T + 6;
          const [cx, cy] = cellOf(px, py);
          if (!nonSolidOk(cx, cy) || keep.has(at(cx, cy))) continue;
          const key = pickWeighted(sh.keys, r);
          if (addProp(key, Math.round(px), Math.round(py), false, {})) shore++;
        }
      }
    }
  }

  // ---- decalques de chão (0–3 por célula) e tufos na borda da trilha ----
  const decals = [];
  let oid = g.nextId();
  const decal = (key, px, py, flip) => decals.push({ id: oid++, name: key, type: "decal", x: Math.round(px), y: Math.round(py), point: true, properties: [{ name: "key", type: "string", value: key }, ...(flip ? [{ name: "flip", type: "bool", value: true }] : [])] });
  if (d.decals) {
    const dc = d.decals;
    const r = mulberry(seed0 ^ strHash("depth:decals"));
    const noise = smoothNoise(seed0 ^ strHash("depth:decal-density"));
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (!nonSolidOk(x, y) || detailNear(g, terr, x, y)) continue;
        const n = noise(x, y);
        const cnt = Math.max(0, Math.min(dc.max ?? 3, Math.floor((n - (dc.floor ?? 0.32)) * (dc.gain ?? 6) + r() * 1.2)));
        const ctx = near(x, y, 1, isWater) ? "wet" : near(x, y, 1, (a, c) => kAt(a, c) === b.base) ? "edge" : "open";
        for (let k = 0; k < cnt; k++) decal(pickWeighted(dc.pools[ctx], r), x * T + 5 + r() * 22, y * T + 6 + r() * 22, r() < 0.5);
      }
  }
  if (d.pathTufts) {
    const pt = d.pathTufts;
    const r = mulberry(seed0 ^ strHash("depth:tufts"));
    const paths = curves.filter((c) => c.terrain !== water);
    const all = paths.flatMap((c) => c.samples);
    const fAt = (x, y) => {
      let f = Infinity;
      for (const p of all) if (Math.abs(p.x - x) < 3 && Math.abs(p.y - y) < 3) f = Math.min(f, Math.hypot(p.x - x, p.y - y) - p.hw);
      return f;
    };
    for (const c of paths)
      for (let s = 0, k = 0; k < c.samples.length; k++) {
        const p = c.samples[k];
        if (p.s < s) continue;
        s = p.s + (pt.every ?? 0.7);
        const q = c.samples[Math.min(c.samples.length - 1, k + 1)];
        const tl = Math.hypot(q.x - p.x, q.y - p.y) || 1;
        for (const side of [1, -1]) {
          if (r() > (pt.chance ?? 0.55)) continue;
          const off = p.hw - 0.05 + (r() - 0.5) * 0.2;
          const x = p.x + (-(q.y - p.y) / tl) * off * side;
          const y = p.y + ((q.x - p.x) / tl) * off * side;
          const cx = Math.floor(x);
          const cy = Math.floor(y);
          if (!inside(cx, cy) || isWater(cx, cy) || walkable.has(at(cx, cy)) || blocked(cx, cy) || fAt(x, y) < -0.25) continue;
          decal(pt.keys[Math.floor(r() * pt.keys.length)], x * T, y * T + 4, r() < 0.5);
        }
      }
  }

  // ---- manchas de solo (lama roxa): elipses + células permitidas; borda irregular no renderer ----
  const patches = [];
  if (d.mud) {
    const md = d.mud;
    const r = mulberry(seed0 ^ strHash("depth:mud"));
    const cand = [];
    for (let y = 2; y < H - 2; y++)
      for (let x = 2; x < W - 2; x++) if (nonSolidOk(x, y) && !near(x, y, md.pathDist ?? 2, pathAt) && !near(x, y, 2, isWater) && !near(x, y, 2, (a, c) => blocked(a, c))) cand.push([x, y]);
    const used = [];
    for (let n = 0; n < (md.tries ?? 60) && patches.length < (md.count ?? 6) && cand.length; n++) {
      const [x, y] = cand[Math.floor(r() * cand.length)];
      if (used.some(([ux, uy]) => Math.hypot(ux - x, uy - y) < (md.spacing ?? 7))) continue;
      used.push([x, y]);
      const rx = md.rx[0] + r() * (md.rx[1] - md.rx[0]);
      const ry = md.ry[0] + r() * (md.ry[1] - md.ry[0]);
      const cells = [];
      for (let cy = Math.floor(y - ry - 1); cy <= Math.ceil(y + ry + 1); cy++)
        for (let cx = Math.floor(x - rx - 1); cx <= Math.ceil(x + rx + 1); cx++) if (nonSolidOk(cx, cy) && !detailNear(g, terr, cx, cy)) cells.push(at(cx, cy));
      patches.push({
        id: oid++, name: `lama-${patches.length + 1}`, type: "patch", ellipse: true,
        x: Math.round((x + 0.5 - rx) * T), y: Math.round((y + 0.5 - ry) * T), width: Math.round(rx * 2 * T), height: Math.round(ry * 2 * T),
        properties: [
          { name: "kind", type: "string", value: md.kind ?? "mud" },
          { name: "seed", type: "int", value: Math.floor(r() * 1e6) },
          { name: "cells", type: "string", value: cells.join(",") },
        ],
      });
    }
  }
  g.setNextId(oid);
  return { decals, patches, stats: { emissive, clutter, shore, decals: decals.length, patches: patches.length, propsRemoved: 0, propsAdded: props.length - propCount0 } };
}

/** Célula com face de penhasco, ponte ou decalque de chão do brief (arena) a até 1 tile. */
function detailNear(g, terr, x, y) {
  const { inside, at, detail } = g;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!inside(x + dx, y + dy)) continue;
      const i = at(x + dx, y + dy);
      if (detail[i] || terr.face.has(i)) return true;
    }
  return false;
}

/** Escolha ponderada em [[chave, peso], ...] (ou lista simples). */
function pickWeighted(list, r) {
  const ws = list.map((e) => (Array.isArray(e) ? e : [e, 1]));
  const tot = ws.reduce((a, [, w]) => a + w, 0);
  let x = r() * tot;
  for (const [k, w] of ws) if ((x -= w) < 0) return k;
  return ws[ws.length - 1][0];
}
