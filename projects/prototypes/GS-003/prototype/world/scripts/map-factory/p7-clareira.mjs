// P7 (Quality Overhaul, fase 3): recomposição da Clareira piloto (x12–41 × y6–29) dentro do look v9, conforme
// quality-overhaul/phase2/design/P7_CLAREIRA_BRIEF.md. Roda dentro do derive-look-v9.mjs, sobre a cópia do v8, de
// forma determinística (hash por posição, sem RNG com estado): rodar de novo dá o mesmo arquivo.
//
//   1. cogumelos/cristais reagrupados em 3 bolsões (núcleo + satélites), sem mudar a contagem;
//   2. 2 manchas de lama roxa a mais (vau e margem leste do braço sul do riacho);
//   3. molduras de primeiro plano compostas (ponte, baú, curva do riacho) com altura de cintura;
//   4. tufos sobre a trilha sem grade: ~1/3 a menos, com lacunas por ruído baixo e jitter por instância;
//   5. grama alta (fp4_tall_grass_a/b) nas 2 zonas novas do GS-012, densidade caindo para a borda e fora da trilha;
//   6. camada `encounters` com as áreas da tabela GS-012 (uma fonte só: a tabela).
// Devolve um relatório (contagens, Clark–Evans antes/depois e 60/30/10 por célula).

import { allObjects, objectCells, solidGrid } from "./tiled.mjs";
import { startsOf } from "./validate.mjs";

export const BOX = { x0: 12, y0: 6, x1: 41, y1: 29 };

/** Mesmo critério do gate `reach` (validate.mjs): do início `player`, chega a todo início, spawn e POI (ou ao lado). */
export function reachOk(m) {
  const W = m.width;
  const H = m.height;
  const T = m.tilewidth;
  const { solid } = solidGrid(m);
  const starts = startsOf(m);
  const player = starts.find((s) => s.name === "player");
  if (!player) return true;
  const seen = new Uint8Array(W * H);
  const free = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !solid[y * W + x];
  if (!free(player.x, player.y)) return false;
  const q = [player.y * W + player.x];
  seen[q[0]] = 1;
  for (let h = 0; h < q.length; h++) {
    const x = q[h] % W;
    const y = Math.floor(q[h] / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (free(nx, ny) && !seen[ny * W + nx]) {
        seen[ny * W + nx] = 1;
        q.push(ny * W + nx);
      }
    }
  }
  const reached = (x, y) => x >= 0 && y >= 0 && x < W && y < H && seen[y * W + x] === 1;
  const any = (r) => {
    for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (reached(x, y)) return true;
    return false;
  };
  if (!starts.every((s) => reached(s.x, s.y))) return false;
  for (const o of allObjects(m)) {
    if (o.cls === "poi") {
      const r = objectCells(o, T);
      if (!any({ x0: r.x0 - 1, y0: r.y0 - 1, x1: r.x1 + 1, y1: r.y1 + 1 })) return false;
    } else if (o.cls === "spawn" && !reached(Math.floor((o.x + (o.width ?? 0) / 2) / T), Math.floor((o.y + (o.height ?? 0) / 2) / T))) return false;
  }
  return true;
}

/** Hash determinístico em [0, 1). */
export function hash(a, b, s = 0) {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Ruído de valor suave (bilinear com smoothstep) em [0, 1). */
export function vnoise(x, y, s = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, s);
  const b = hash(x0 + 1, y0, s);
  const c = hash(x0, y0 + 1, s);
  const d = hash(x0 + 1, y0 + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Índice de Clark–Evans (R): ~1 aleatório, > 1 regular (grade), < 1 agrupado. Área = caixa da clareira. */
export function clarkEvans(pts, areaPx) {
  if (pts.length < 2) return NaN;
  let sum = 0;
  for (const p of pts) {
    let best = Infinity;
    for (const q of pts) if (q !== p) best = Math.min(best, Math.hypot(p.x - q.x, p.y - q.y));
    sum += best;
  }
  const mean = sum / pts.length;
  const expected = 0.5 / Math.sqrt(pts.length / areaPx);
  return mean / expected;
}

/** Coeficiente de variação da distância ao vizinho mais próximo: baixo = espaçamento regular ("grade"). */
export function nnCv(pts) {
  const d = pts.map((p) => Math.min(...pts.filter((q) => q !== p).map((q) => Math.hypot(p.x - q.x, p.y - q.y))));
  const m = d.reduce((s, v) => s + v, 0) / d.length;
  const sd = Math.sqrt(d.reduce((s, v) => s + (v - m) ** 2, 0) / d.length);
  return sd / m;
}

/**
 * @param tmj mapa (cópia do v8, mutado aqui)
 * @param h   { TS, prop, layer, solid:Set, nearAny, paths, water, table }
 */
export function composeClareira(tmj, h) {
  const { TS, prop, layer, solid, nearAny, paths, water, table } = h;
  const B = { x0: BOX.x0 * TS, y0: BOX.y0 * TS, x1: (BOX.x1 + 1) * TS, y1: (BOX.y1 + 1) * TS };
  const areaPx = (B.x1 - B.x0) * (B.y1 - B.y0);
  const inBox = (o) => o.x >= B.x0 && o.x < B.x1 && o.y >= B.y0 && o.y < B.y1;
  const cellOf = (x, y) => `${Math.floor(x / TS)},${Math.floor((y - 1) / TS)}`;
  const below = layer("objects_below").objects;
  const report = { box: BOX };
  let nextId = tmj.nextobjectid;

  // ---------- 1. reagrupar cogumelos e cristais ----------
  // as flores (acento) entram nos mesmos bolsões: o acento fica concentrado em poucos pontos (regra 60/30/10)
  const GLOW = /^(fp8_mushroom_bioluminescent|fp7_mushroom_digital|fp8_data_crystal|fp4_mushroom_cluster|fp4_flower_cluster_(purple|white|red)|fp7_flower_digital)$/;
  const movers = below.filter((o) => inBox(o) && GLOW.test(prop(o, "key")));
  const before = movers.map((o) => ({ x: o.x, y: o.y }));
  const others = below.filter((o) => !movers.includes(o));
  // bolsões: perto do totem/mirante (norte), da fonte de cura (leste) e da borda da mata junto ao vau (sudoeste)
  const POCKETS = [
    // em volta do totem, na ponta oeste do mirante (sem cristal sólido: o mirante é mirante, não vitrine)
    { id: "totem-mirante", cx: 23.6 * TS, cy: 15.4 * TS, share: 0.32, solidOk: false },
    { id: "fonte-cura", cx: 36.4 * TS, cy: 23.6 * TS, share: 0.38, solidOk: true },
    { id: "vau-mata", cx: 21.6 * TS, cy: 27.2 * TS, share: 0.3, solidOk: true },
  ];
  // cristais primeiro (núcleos), depois os cogumelos digitais, as flores e os bioluminescentes (satélites)
  const rank = (k) => (k === "fp8_data_crystal" ? 0 : k === "fp7_mushroom_digital" ? 1 : /flower/.test(k) ? 2 : 3);
  const order = [...movers].sort((a, b) => rank(prop(a, "key")) - rank(prop(b, "key")) || a.id - b.id);
  const quota = POCKETS.map((p) => Math.round(p.share * order.length));
  quota[quota.length - 1] = order.length - quota.slice(0, -1).reduce((s, v) => s + v, 0);
  // os sólidos vão, alternando, para os bolsões que aceitam sólido; o resto completa as cotas na ordem
  const assign = POCKETS.map(() => []);
  const solidPockets = POCKETS.map((p, i) => (p.solidOk ? i : -1)).filter((i) => i >= 0);
  let sp = 0;
  for (const o of order.filter((o) => prop(o, "solid") === true)) assign[solidPockets[sp++ % solidPockets.length]].push(o);
  for (const o of order.filter((o) => prop(o, "solid") !== true)) {
    const i = assign.findIndex((a, k) => a.length < quota[k]);
    assign[i < 0 ? assign.length - 1 : i].push(o);
  }
  const placedGlow = [];
  const pois = (layer("poi")?.objects ?? []).map((o) => ({ x: o.x, y: o.y }));
  const okGlow = (x, y, solidProp) => {
    // cristal (sólido) longe dos pontos de interesse: não pode fechar o acesso ao mirante, ao baú, à fonte...
    if (solidProp && pois.some((q) => Math.hypot(q.x - x, q.y - y) < 3 * TS)) return false;
    if (x < B.x0 + 8 || x > B.x1 - 8 || y < B.y0 + 8 || y > B.y1 - 8) return false;
    if (solid.has(cellOf(x, y))) return false;
    if (nearAny(water, x, y) < 10 || nearAny(paths, x, y) < (solidProp ? 14 : 6)) return false;
    if (others.some((o) => Math.hypot(o.x - x, o.y - y) < (prop(o, "solid") ? 18 : 12))) return false;
    if (placedGlow.some((p) => Math.hypot(p.x - x, p.y - y) < (solidProp || p.solid ? 20 : 11))) return false;
    return true;
  };
  const pocketCounts = {};
  POCKETS.forEach((pk, pi) => {
    pocketCounts[pk.id] = 0;
    assign[pi].forEach((o, n) => {
      const isSolid = prop(o, "solid") === true;
      // núcleo perto do centro; satélites em anel crescente, ângulo por hash (sem simetria de relógio)
      let done = false;
      for (let tries = 0; tries < 200 && !done; tries++) {
        const ring = n === 0 ? 0 : 0.55 + Math.sqrt(n) * 0.42 + tries * 0.04;
        const ang = hash(o.id, tries, 71 + pi) * Math.PI * 2;
        const r = (ring + hash(o.id, tries, 5) * 0.5) * TS;
        const x = Math.round(pk.cx + Math.cos(ang) * r * 1.25);
        const y = Math.round(pk.cy + Math.sin(ang) * r * 0.8);
        if (!okGlow(x, y, isSolid)) continue;
        const [ox, oy] = [o.x, o.y];
        o.x = x;
        o.y = y;
        // objeto sólido não pode fechar caminho (mirante, baú, fonte...): desfaz e tenta outro lugar
        if (isSolid && !reachOk(tmj)) {
          o.x = ox;
          o.y = oy;
          continue;
        }
        placedGlow.push({ x, y, solid: isSolid });
        pocketCounts[pk.id]++;
        done = true;
      }
      if (!done) placedGlow.push({ x: o.x, y: o.y, solid: isSolid }); // fica onde estava (registrado no relatório)
    });
  });
  report.recluster = {
    moved: movers.length,
    byKey: Object.fromEntries([...new Set(movers.map((o) => prop(o, "key")))].map((k) => [k, movers.filter((o) => prop(o, "key") === k).length])),
    pockets: pocketCounts,
    clarkEvansBefore: +clarkEvans(before, areaPx).toFixed(3),
    clarkEvansAfter: +clarkEvans(movers.map((o) => ({ x: o.x, y: o.y })), areaPx).toFixed(3),
  };

  // ---------- 2. lama roxa a mais ----------
  const patchesL = layer("patches");
  const mapW = tmj.width;
  const MUD = [
    { name: "lama-p7-vau", cx: 23.4 * TS, cy: 24.6 * TS, w: 3.4 * TS, h: 2.2 * TS, seed: 701 },
    { name: "lama-p7-margem", cx: 18.7 * TS, cy: 20.4 * TS, w: 2.2 * TS, h: 3.0 * TS, seed: 702 },
  ];
  report.mud = [];
  for (const m of MUD) {
    const cells = [];
    for (let ty = Math.floor((m.cy - m.h / 2) / TS); ty <= Math.floor((m.cy + m.h / 2) / TS); ty++)
      for (let tx = Math.floor((m.cx - m.w / 2) / TS); tx <= Math.floor((m.cx + m.w / 2) / TS); tx++) {
        const px = tx * TS + TS / 2;
        const py = ty * TS + TS / 2;
        if (solid.has(`${tx},${ty}`) || nearAny(water, px, py) < 6 || nearAny(paths, px, py) < 2) continue;
        cells.push(ty * mapW + tx);
      }
    patchesL.objects.push({
      id: nextId++,
      name: m.name,
      type: "patch",
      ellipse: true,
      x: Math.round(m.cx - m.w / 2),
      y: Math.round(m.cy - m.h / 2),
      width: Math.round(m.w),
      height: Math.round(m.h),
      properties: [
        { name: "kind", type: "string", value: "mud" },
        { name: "seed", type: "int", value: m.seed },
        { name: "cells", type: "string", value: cells.join(",") },
      ],
    });
    report.mud.push({ name: m.name, cells: cells.length });
  }

  // ---------- 3. molduras de primeiro plano (compostas, altura de cintura) ----------
  // Altura OPACA dos sprites do forest-v8-depth: edge_cluster_a 18 px, fern 15, flowering_bush 22, edge_cluster_b 24,
  // reed_cluster 24. O Tamer tem ~34 px opacos (cabeça a 32 px do pé). Fase 3, rodada 2 (QA P1): as moitas de 2
  // fileiras (~26 px) só chegavam ao joelho/coxa; agora são 3 fileiras empilhadas (trás subida 15–16 px, meio 8 px,
  // frente no pé) → massa de ~40 px de altura e ~70 px de largura. O pé fica 20 px ao sul do EIXO da trilha: com o
  // Tamer no meio da trilha a moita cobre ~20 px (≈59% do corpo, até a cintura/peito); mais ao sul ela passaria da
  // cabeça e o look v9 a deixa translúcida (foreground.headFrac, medido pela parte opaca do sprite).
  const above = layer("objects_above");
  const fg = [];
  const COMPOSITE = {
    // [chave, dx, dy] em relação ao pé da moita (dy negativo = mais para trás/acima); desenhadas nesta ordem
    // larguras opacas: edge_cluster_b 43, edge_cluster_a 46, flowering_bush 28, fern 20 — sobrepostas ~50% para ler
    // como UMA massa (rodada 2: espalhadas, viravam 3–4 moitas redondas soltas)
    tall: [
      ["fp8_edge_cluster_b", -6, -16], ["fp8_flowering_bush", 14, -15], // trás: topo a 37–40 px
      ["fp8_fern", -20, -9], ["fp8_edge_cluster_a", 6, -8], // meio: topo a ~26 px
      ["fp8_edge_cluster_a", -8, 0], ["fp8_fern", 16, 0], // frente, no pé
    ],
    tallB: [
      ["fp8_flowering_bush", -12, -15], ["fp8_edge_cluster_b", 8, -16],
      ["fp8_edge_cluster_a", -4, -8], ["fp8_fern", 20, -9],
      ["fp8_fern", -18, 0], ["fp8_edge_cluster_a", 8, 0],
    ],
    reeds: [
      ["fp8_reed_cluster", -9, -12], ["fp8_reed_cluster", 6, -14], ["fp8_reed_cluster", 18, -9],
      ["fp8_reed_cluster", -2, -5], ["fp8_fern", -12, 0], ["fp8_reed_cluster", 12, 0], ["fp8_fern", 24, 1],
    ],
  };
  const addComposite = (kind, x, y, tag) => {
    for (const [key, dx, dy] of COMPOSITE[kind]) fg.push({ key, x: Math.round(x + dx), y: Math.round(y + dy), tag });
  };
  /** Eixo da trilha na coluna x, perto de yHint (mínimo do campo de distância: o centro fica a −hw). */
  const trailAxis = (x, yHint) => {
    let best;
    for (let y = Math.round(yHint - 48); y <= yHint + 48; y++) {
      const f = nearAny(paths, x, y);
      if (f < 0 && (!best || f < best.f)) best = { y, f };
    }
    return best?.y;
  };
  /** Pé da moita 20 px ao sul do eixo da trilha (o jogador no meio da trilha passa atrás, coberto até a cintura). */
  const FOOT_BELOW_AXIS = 20;
  const southOfPath = (tx, ty) => {
    for (const dx of [0, -6, 6, -12, 12, -18, 18]) {
      const x = Math.round(tx + dx);
      const axis = trailAxis(x, ty);
      if (axis === undefined) continue;
      const y = axis + FOOT_BELOW_AXIS;
      if (solid.has(cellOf(x, y)) || nearAny(water, x, y) < 4) continue;
      return { x, y };
    }
    return undefined;
  };
  const chest = below.find((o) => prop(o, "key") === "fp6_chest_closed" && inBox(o));
  // ponte (tabuado nas células 25–31 da linha 9): as molduras ficam na trilha em terra firme, logo antes e logo depois
  // dela — em cima do tabuado uma moita não faz sentido (rodada 2)
  const frames = [
    { tag: "ponte-oeste", kind: "tall", at: southOfPath(23.7 * TS, 9.2 * TS) },
    { tag: "ponte-leste", kind: "tallB", at: southOfPath(32.9 * TS, 10.2 * TS) },
    // baú: a moita fica na trilha logo a oeste do baú (quem chega pela trilha passa atrás dela; o baú fica à vista)
    { tag: "bau", kind: "tall", at: chest ? southOfPath(chest.x - 54, chest.y - 8) : undefined },
  ];
  // curva do riacho dentro da clareira (y 13–16, x 17–24): juncos + samambaia na margem de baixo
  const wc = water[0];
  const wpts = wc.polyline.map((p) => ({ x: wc.x + p.x, y: wc.y + p.y }));
  const whw = String(prop(wc, "hw")).split(",").map(Number);
  wpts.forEach((p, i) => {
    if (p.y < 13 * TS || p.y > 16.5 * TS || p.x < 17 * TS || p.x > 25 * TS) return;
    for (const off of [4, 8, 12]) {
      const x = Math.round(p.x);
      const y = Math.round(p.y + whw[i] + off);
      if (solid.has(cellOf(x, y)) || nearAny(water, x, y) < 1 || nearAny(paths, x, y) < 8) continue;
      if (fg.some((q) => Math.hypot(q.x - x, q.y - y) < 2.2 * TS)) continue;
      if (frames.some((q) => q.at && Math.hypot(q.at.x - x, q.at.y - y) < 2.6 * TS)) continue;
      frames.push({ tag: `riacho-curva-${frames.length - 2}`, kind: "reeds", at: { x, y } });
      break;
    }
  });
  report.frames = [];
  for (const f of frames) {
    if (!f.at) {
      report.frames.push({ tag: f.tag, placed: false });
      continue;
    }
    addComposite(f.kind, f.at.x, f.at.y, f.tag);
    report.frames.push({ tag: f.tag, placed: true, tile: [+(f.at.x / TS).toFixed(2), +(f.at.y / TS).toFixed(2)] });
  }
  // o automático do v9 não pode encostar nas molduras (sem moita sobre moita)
  above.objects = above.objects.filter((o) => !fg.some((q) => Math.hypot(q.x - o.x, q.y - o.y) < 1.5 * TS));
  for (const p of fg)
    above.objects.push({
      id: nextId++,
      name: p.key,
      type: "prop",
      x: p.x,
      y: p.y,
      point: true,
      properties: [
        { name: "key", type: "string", value: p.key },
        { name: "solid", type: "bool", value: false },
        { name: "frame", type: "string", value: p.tag },
      ],
    });
  report.fgSprites = fg.length;

  // ---------- 4. tufos sobre a trilha sem grade ----------
  const decals = layer("decals");
  const TUFT = /^fp8_tuft_over_path_[ab]$/;
  const tufts = decals.objects.filter((o) => inBox(o) && TUFT.test(prop(o, "key")));
  const tuftsBefore = tufts.map((o) => ({ x: o.x, y: o.y }));
  const drop = new Set();
  for (const o of tufts) {
    // ruído baixo (~3 tiles) decide onde há tufos e onde há lacuna; o hash quebra o resto. Fica ~2/3.
    const keep = vnoise(o.x / 92, o.y / 92, 913) * 0.75 + hash(o.id, 1, 914) * 0.45;
    if (keep < 0.5) {
      drop.add(o);
      continue;
    }
    const f0 = nearAny(paths, o.x, o.y);
    for (let t = 0; t < 8; t++) {
      const x = Math.round(o.x + (hash(o.id, t, 915) - 0.5) * 22);
      const y = Math.round(o.y + (hash(o.id, t, 916) - 0.5) * 14);
      if (Math.abs(nearAny(paths, x, y) - f0) > 5) continue;
      o.x = x;
      o.y = y;
      break;
    }
  }
  decals.objects = decals.objects.filter((o) => !drop.has(o));
  const tuftsAfter = tufts.filter((o) => !drop.has(o)).map((o) => ({ x: o.x, y: o.y }));
  report.tufts = {
    before: tuftsBefore.length,
    after: tuftsAfter.length,
    clarkEvansBefore: +clarkEvans(tuftsBefore, areaPx).toFixed(3),
    clarkEvansAfter: +clarkEvans(tuftsAfter, areaPx).toFixed(3),
    nnCvBefore: +nnCv(tuftsBefore).toFixed(3),
    nnCvAfter: +nnCv(tuftsAfter).toFixed(3),
  };

  // ---------- 5. grama alta nas 2 zonas novas (GS-012) ----------
  // Fase 3, rodada 2 (QA P2): touceiras próprias de encontro (fp9_enc_grass_a/b/c, ~24 px, verde-azulado com pontas
  // claras, art/map-factory/forest-v9-p7), 3 por tile em vez de 2, densidade cheia até perto da borda.
  const NEW_ZONES = (table?.areas ?? []).filter((a) => a.zoneRef === "clareira_central");
  report.tallGrass = {};
  for (const z of NEW_ZONES) {
    let n = 0;
    const r = z.rect;
    for (let ty = r.y; ty < r.y + r.h; ty++)
      for (let tx = r.x; tx < r.x + r.w; tx++)
        for (let k = 0; k < 3; k++) {
          const x = Math.round(tx * TS + 4 + hash(tx, ty * 3 + k, 931) * 24);
          const y = Math.round(ty * TS + 6 + ((k + hash(tx, ty * 3 + k, 932)) / 3) * 24);
          // densidade cai só na borda do retângulo (elipse inscrita "achatada") e some perto da trilha
          const ex = (x - (r.x + r.w / 2) * TS) / ((r.w / 2) * TS);
          const ey = (y - (r.y + r.h / 2) * TS) / ((r.h / 2) * TS);
          const dens = Math.min(1, Math.max(0, 1.15 - Math.hypot(ex, ey) ** 2) * 1.3) + vnoise(x / 60, y / 60, 933) * 0.25 - 0.08;
          if (hash(tx, ty * 3 + k, 934) > dens) continue;
          if (solid.has(cellOf(x, y)) || nearAny(water, x, y) < 6 || nearAny(paths, x, y) < TS * 0.5) continue;
          if (below.some((o) => Math.hypot(o.x - x, o.y - y) < (prop(o, "encounterGrass") ? 9 : 11))) continue;
          const hk = hash(tx, ty * 3 + k, 935);
          const key = hk < 0.4 ? "fp9_enc_grass_a" : hk < 0.75 ? "fp9_enc_grass_b" : "fp9_enc_grass_c";
          below.push({ id: nextId++, name: key, type: "prop", x, y, point: true, properties: [{ name: "key", type: "string", value: key }, { name: "solid", type: "bool", value: false }, { name: "encounterGrass", type: "string", value: z.id }] });
          n++;
        }
    report.tallGrass[z.id] = n;
  }

  // ---------- 6. camada `encounters` (áreas da tabela GS-012) ----------
  tmj.layers = tmj.layers.filter((l) => l.name !== "encounters");
  tmj.layers.push({
    id: Math.max(...tmj.layers.map((l) => l.id ?? 0)) + 1,
    name: "encounters",
    type: "objectgroup",
    visible: false,
    opacity: 1,
    x: 0,
    y: 0,
    draworder: "topdown",
    objects: (table?.areas ?? []).map((a) => ({
      id: nextId++,
      name: a.id,
      type: "encounter_area",
      x: a.rect.x * TS,
      y: a.rect.y * TS,
      width: a.rect.w * TS,
      height: a.rect.h * TS,
      properties: [
        { name: "terrain", type: "string", value: a.terrain },
        { name: "areaId", type: "string", value: a.id },
        { name: "rateMult", type: "float", value: a.rateMult ?? 1 },
      ],
    })),
  });
  tmj.nextobjectid = nextId;

  // ---------- 7. massa do perímetro (30%): vegetação baixa onde a clareira encosta na mata ----------
  // Drakantos #5: meio-termo entre clareira e floresta. Moitas sem colisão nas células abertas que já têm mata em
  // volta (>= 3 dos 8 vizinhos), longe da trilha, da água, das zonas de grama alta e dos pontos de interesse.
  const MASS_TARGET = 27;
  const poi = (layer("poi")?.objects ?? []).map((o) => ({ x: o.x, y: o.y }));
  const grassRects = (table?.areas ?? []).filter((a) => a.zoneRef === "clareira_central").map((a) => a.rect);
  const added = [];
  for (let pass = 0; pass < 3 && ratio603010(tmj, h, B).mass < MASS_TARGET; pass++) {
    const r = ratio603010(tmj, h, B, true);
    const cands = [];
    for (let ty = BOX.y0; ty <= BOX.y1; ty++)
      for (let tx = BOX.x0; tx <= BOX.x1; tx++) {
        if (r.cls.get(`${tx},${ty}`) !== "open") continue;
        let m = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && r.cls.get(`${tx + dx},${ty + dy}`) === "mass") m++;
        if (m < 3) continue;
        const x = tx * TS + 16;
        const y = ty * TS + 26;
        if (nearAny(paths, x, y) < 14 || nearAny(water, x, y) < 8) continue;
        if (grassRects.some((g) => tx >= g.x && tx < g.x + g.w && ty >= g.y && ty < g.y + g.h)) continue;
        if (poi.some((q) => Math.hypot(q.x - x, q.y - y) < 2 * TS)) continue;
        cands.push({ tx, ty, x, y, m, k: hash(tx, ty, 951 + pass) });
      }
    cands.sort((a, b) => b.m - a.m || a.k - b.k);
    for (const c of cands) {
      if (ratio603010(tmj, h, B).mass >= MASS_TARGET) break;
      if (below.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < 14)) continue;
      const key = ["fp8_edge_cluster_a", "fp8_edge_cluster_b", "fp8_edge_cluster_a", "fp8_fern"][Math.floor(c.k * 3.999)];
      const x = Math.round(c.x + (hash(c.tx, c.ty, 961) - 0.5) * 10);
      const y = Math.round(c.y + (hash(c.tx, c.ty, 962) - 0.5) * 6);
      below.push({ id: nextId++, name: key, type: "prop", x, y, point: true, properties: [{ name: "key", type: "string", value: key }, { name: "solid", type: "bool", value: false }, { name: "p7", type: "string", value: "perimetro" }] });
      added.push(key);
    }
  }
  tmj.nextobjectid = nextId;
  report.perimeter = { added: added.length, byKey: Object.fromEntries([...new Set(added)].map((k) => [k, added.filter((x) => x === k).length])) };

  // ---------- 60/30/10 por célula ----------
  report.ratio = ratio603010(tmj, h, B);
  return report;
}

/**
 * Classificação por célula da caixa: 60 = chão aberto (clareira + trilha, sem copa nem água), 30 = massa da mata
 * (célula sólida ou sob copa de árvore), 10 = acento (água, ponte, lama, luzes, flores, interativos). Uma célula
 * conta numa classe só, com prioridade acento > mata > aberto.
 */
export function ratio603010(tmj, h, B, withCells = false) {
  const { TS, prop, layer, solid, nearAny, water } = h;
  const below = layer("objects_below").objects;
  const tree = new Set();
  const accent = new Set();
  // acento = o que o brief lista no 10%: riacho, ponte, as luzes com propósito, lama roxa e flores (cogumelos e cristais
  // ficam sem brilho no v9 e contam como chão/clutter)
  const ACC = /^(fp8_lantern_post|fp8_campfire_small|fp6_healing_point|fp8_data_totem|fp4_flower_cluster_|fp7_flower_digital|fp6_bridge)/;
  for (const o of below) {
    const k = String(prop(o, "key"));
    const tx = Math.floor(o.x / TS);
    const ty = Math.floor((o.y - 1) / TS);
    if (/^(fp4_tree_|fp10_(tall_narrow|wide_low|leaning|ancient_thick)_(large|small)$)/.test(k)) for (let dy = -2; dy <= 0; dy++) for (let dx = -1; dx <= 1; dx++) tree.add(`${tx + dx},${ty + dy}`);
    // moita grande de borda (48 px) = massa na sua célula e na de cima
    if (/^(fp8_edge_cluster_[ab]|fp7_bush_dense_secret)$/.test(k)) for (let dy = -1; dy <= 0; dy++) tree.add(`${tx},${ty + dy}`);
    if (ACC.test(k)) accent.add(`${tx},${ty}`);
  }
  for (const p of layer("patches").objects) {
    const cells = String(prop(p, "cells") ?? "").split(",").filter(Boolean).map(Number);
    for (const c of cells) accent.add(`${c % tmj.width},${Math.floor(c / tmj.width)}`);
  }
  const n = { open: 0, mass: 0, accent: 0 };
  const cls = new Map();
  for (let ty = B.y0 / TS; ty < B.y1 / TS; ty++)
    for (let tx = B.x0 / TS; tx < B.x1 / TS; tx++) {
      const k = `${tx},${ty}`;
      const cx = tx * TS + TS / 2;
      const cy = ty * TS + TS / 2;
      const c = accent.has(k) || nearAny(water, cx, cy) < 0 ? "accent" : solid.has(k) || tree.has(k) ? "mass" : "open";
      n[c]++;
      cls.set(k, c);
    }
  const tot = n.open + n.mass + n.accent;
  const out = { cells: tot, open: +((100 * n.open) / tot).toFixed(1), mass: +((100 * n.mass) / tot).toFixed(1), accent: +((100 * n.accent) / tot).toFixed(1) };
  return withCells ? { ...out, cls } : out;
}
