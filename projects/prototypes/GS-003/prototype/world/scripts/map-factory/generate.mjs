// Map Factory — gerador de .tmj a partir de um brief JSON (interface provisória: scripts/map-factory/brief.schema.json).
// Generaliza gen-forest-proof.mjs: terreno base + áreas (elipse com borda irregular, retângulo) + trilhas em spline
// Catmull-Rom com meandro e largura variável + limpeza de borda, autotile Wang-47 (8 vizinhos) ou blob-16 (4),
// props por grade escalonada / manchas / dispersão / borda, e os objetos de jogo (inícios, spawns, NPCs, POIs,
// arena de chefe, portais, colisão, triggers). Determinístico: mesma semente → mesmo mapa. Puro: sem fs.

import { buildTmj } from "./tiled.mjs";

/** mulberry32, o mesmo RNG do gen-forest-proof. */
export function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const catmull = (p0, p1, p2, p3, t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return [0, 1].map((i) => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3));
};

/** Máscara de autotile: w47 = 8 vizinhos com diagonal normalizada (N1 E2 S4 W8 NE16 SE32 SW64 NW128); blob16 = 4. */
export function autotileMask(same, x, y, mode) {
  const N = same(x, y - 1);
  const E = same(x + 1, y);
  const S = same(x, y + 1);
  const Wn = same(x - 1, y);
  let m = (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (Wn ? 8 : 0);
  if (mode === "w47") m |= (N && E && same(x + 1, y - 1) ? 16 : 0) | (S && E && same(x + 1, y + 1) ? 32 : 0) | (S && Wn && same(x - 1, y + 1) ? 64 : 0) | (N && Wn && same(x - 1, y - 1) ? 128 : 0);
  return m;
}

/**
 * Pinta uma trilha (spline) num Set de células, como o forest-proof v4.1: amostra a cada 0,1 tile, meandro lateral
 * senoidal e raio que oscila entre radius[0] e radius[1] (< 1 → no máximo 2 tiles de largura).
 */
export function paintSpline(set, points, { W, H, radius = [0.73, 0.89], meander = 0.22, phase = 0 }) {
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const pts = [points[0], ...points, points[points.length - 1]];
  let dist = 0;
  let prev;
  for (let i = 1; i < pts.length - 2; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) * 10));
    for (let k = 0; k <= n; k++) {
      const [cx, cy] = catmull(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], k / n);
      if (prev) dist += Math.hypot(cx - prev[0], cy - prev[1]);
      const [nx2, ny2] = catmull(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], Math.min(1, k / n + 0.01));
      const tl = Math.hypot(nx2 - cx, ny2 - cy) || 1;
      const wob = meander * Math.sin(dist * 0.55 + phase * 2.1);
      const px = cx + (-(ny2 - cy) / tl) * wob;
      const py = cy + ((nx2 - cx) / tl) * wob;
      prev = [cx, cy];
      const rad = radius[0] + (radius[1] - radius[0]) * (0.5 + 0.5 * Math.sin(dist * 0.31 + phase * 1.3));
      for (let y = Math.floor(py - 1); y <= Math.floor(py + 1); y++)
        for (let x = Math.floor(px - 1); x <= Math.floor(px + 1); x++) if (inside(x, y) && Math.hypot(x + 0.5 - px, y + 0.5 - py) <= rad) set.add(y * W + x);
    }
  }
}

/** Limpeza da borda da trilha (forest-proof): fecha reentrâncias de 1 tile, tira calombos e liga diagonais soltas. */
export function cleanPath(set, ends, W, H) {
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const isP = (x, y) => inside(x, y) && set.has(y * W + x);
  const n4 = (x, y) => (isP(x, y - 1) ? 1 : 0) + (isP(x + 1, y) ? 1 : 0) + (isP(x, y + 1) ? 1 : 0) + (isP(x - 1, y) ? 1 : 0);
  for (let pass = 0; pass < 2; pass++) {
    const add = [];
    const del = [];
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        if (!isP(x, y) && n4(x, y) >= 3) add.push(y * W + x);
        else if (isP(x, y) && n4(x, y) <= 1 && !ends.has(y * W + x) && x > 0 && y > 0 && x < W - 1 && y < H - 1) {
          const nb = [[0, -1], [1, 0], [0, 1], [-1, 0]].find(([dx, dy]) => isP(x + dx, y + dy));
          if (!nb || n4(x + nb[0], y + nb[1]) >= 3) del.push(y * W + x);
        }
      }
    for (const i of add) set.add(i);
    for (const i of del) set.delete(i);
  }
  for (let y = 0; y < H - 1; y++)
    for (let x = 0; x < W; x++)
      for (const dx of [-1, 1]) {
        if (!isP(x, y) || !isP(x + dx, y + 1) || isP(x + dx, y) || isP(x, y + 1)) continue;
        set.add(y * W + x + dx);
      }
}

const req = (cond, msg) => {
  if (!cond) throw new Error(`brief inválido: ${msg}`);
};

/** Confere o mínimo do brief antes de gerar (mensagens em pt-BR). */
export function checkBrief(b) {
  req(b && typeof b === "object", "não é um objeto");
  req(typeof b.id === "string" && /^[a-z0-9][a-z0-9-]*$/.test(b.id), "id (kebab-case) obrigatório");
  req(b.size?.width > 0 && b.size?.height > 0, "size.width/height obrigatórios");
  req(b.terrains && typeof b.terrains === "object", "terrains obrigatório");
  req(b.terrains[b.base], `base '${b.base}' não está em terrains`);
  for (const a of b.areas ?? []) req(b.terrains[a.terrain], `área '${a.name ?? "?"}' usa terreno desconhecido '${a.terrain}'`);
  for (const p of b.paths ?? []) {
    req(b.terrains[p.terrain], `trilha usa terreno desconhecido '${p.terrain}'`);
    req(Array.isArray(p.points) && p.points.length >= 2, "trilha com menos de 2 pontos");
  }
  for (const [n, t] of Object.entries(b.terrains)) {
    req(t.autotile ? typeof t.prefix === "string" : Array.isArray(t.variants) && t.variants.length > 0, `terreno '${n}': autotile+prefix ou variants`);
    req(!t.autotile || ["w47", "blob16"].includes(t.autotile), `terreno '${n}': autotile deve ser w47 ou blob16`);
  }
  req(b.starts?.player, "starts.player obrigatório");
}

/**
 * Gera o mapa. brief: ver brief.schema.json. Devolve { tmj, stats }.
 * Coordenadas do brief em tiles; inícios e NPCs no centro do tile ([x, y] → x*T+T/2).
 */
export function generateFromBrief(b) {
  checkBrief(b);
  const W = b.size.width;
  const H = b.size.height;
  const T = b.size.tile ?? 32;
  const rnd = mulberry(b.seed ?? 1);
  const pickW = (list) => {
    const tot = list.reduce((a, e) => a + (e.weight ?? 1), 0);
    let r = rnd() * tot;
    for (const e of list) if ((r -= e.weight ?? 1) < 0) return e;
    return list[list.length - 1];
  };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const at = (x, y) => y * W + x;
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  // ---- terreno ----
  const kind = new Array(W * H).fill(b.base);
  for (const a of b.areas ?? []) {
    if (a.shape === "rect")
      for (let y = Math.max(0, a.y); y < Math.min(H, a.y + a.h); y++) for (let x = Math.max(0, a.x); x < Math.min(W, a.x + a.w); x++) kind[at(x, y)] = a.terrain;
    else {
      // elipse com borda irregular (o raio oscila com o ângulo), como as clareiras do forest-proof
      const wob = a.wobble ?? 0.12;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const ang = Math.atan2(y - a.cy, x - a.cx);
          const f = 1 + wob * Math.sin(ang * 3 + a.cx) + wob * 0.58 * Math.sin(ang * 7 + a.cy);
          if (((x - a.cx) / (a.rx * f)) ** 2 + ((y - a.cy) / (a.ry * f)) ** 2 < 1) kind[at(x, y)] = a.terrain;
        }
    }
  }
  const pathCells = new Map();
  (b.paths ?? []).forEach((p, pi) => {
    const set = pathCells.get(p.terrain) ?? new Set();
    const ends = new Set();
    paintSpline(set, p.points, { W, H, radius: p.radius, meander: p.meander, phase: pi });
    for (const [x, y] of [p.points[0], p.points[p.points.length - 1]]) ends.add(at(Math.min(W - 1, Math.max(0, Math.floor(x))), Math.min(H - 1, Math.max(0, Math.floor(y)))));
    pathCells.set(p.terrain, set);
    set.ends = new Set([...(set.ends ?? []), ...ends]);
  });
  for (const [terrain, set] of pathCells) {
    if (b.terrains[terrain].cleanEdges !== false) cleanPath(set, set.ends, W, H);
    // ao longo da trilha, o terreno base recua (dá para andar ao lado dela)
    const border = b.terrains[terrain].border;
    if (border)
      for (const i of set) {
        const x = i % W;
        const y = Math.floor(i / W);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inside(x + dx, y + dy) && kind[at(x + dx, y + dy)] === b.base) kind[at(x + dx, y + dy)] = border;
      }
    for (const i of set) kind[i] = terrain;
  }
  const kAt = (x, y) => (inside(x, y) ? kind[at(x, y)] : b.base);
  const nearOther = (x, y, r, t) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (kAt(x + dx, y + dy) !== t) return true;
    return false;
  };

  // ---- chão: autotile / variantes, gids por (chave, sólido) ----
  const TILES = [];
  const gidOf = new Map();
  const gid = (key, solid) => {
    const id = `${key}|${!!solid}`;
    if (!gidOf.has(id)) {
      TILES.push({ key, solid: !!solid });
      gidOf.set(id, TILES.length);
    }
    return gidOf.get(id);
  };
  const ground = new Array(W * H).fill(0);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tn = kind[at(x, y)];
      const t = b.terrains[tn];
      // sólido: true/false, ou "interior" (sólido só se não houver outro terreno a 1 tile: a borda fica andável)
      const solid = t.solid === "interior" ? !nearOther(x, y, 1, tn) : !!t.solid;
      let key;
      if (t.autotile) {
        const outside = t.outside ?? "in";
        const same = (a, c) => {
          if (!inside(a, c)) return outside === "in" ? true : outside === "out" ? false : kind[at(Math.max(0, Math.min(W - 1, a)), Math.max(0, Math.min(H - 1, c)))] === tn;
          return kind[at(a, c)] === tn;
        };
        key = `${t.prefix}${autotileMask(same, x, y, t.autotile)}`;
      } else key = t.variants.length === 1 ? t.variants[0] : pick(t.variants);
      ground[at(x, y)] = gid(key, solid);
    }

  // ---- objetos de jogo (definidos antes dos props: reservam espaço) ----
  const center = (v) => v * T + T / 2;
  const keep = new Set();
  const reserve = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (inside(x, y)) keep.add(at(x, y));
  };
  for (const [, [x, y]] of Object.entries(b.starts)) reserve(Math.floor(x) - 1, Math.floor(y) - 1, Math.floor(x) + 1, Math.floor(y) + 1);
  for (const n of b.npcs ?? []) reserve(n.x - 1, n.y - 1, n.x + 1, n.y + 1);
  for (const s of b.spawns ?? []) {
    const cx = Math.floor(s.x + s.w / 2);
    const cy = Math.floor(s.y + s.h / 2);
    reserve(cx, cy, cx, cy);
  }
  for (const p of b.portals ?? []) reserve(p.x - 1, p.y - 1, p.x + p.w, p.y + p.h);
  for (const p of b.pois ?? []) reserve(p.x - 1, p.y - 1, p.x + (p.w ?? 1), p.y + (p.h ?? 1));
  for (const r of b.keepClear ?? []) reserve(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
  if (b.bossArena) reserve(b.bossArena.x, b.bossArena.y, b.bossArena.x + b.bossArena.w - 1, b.bossArena.y + b.bossArena.h - 1);
  const pathAt = (x, y) => [...pathCells.values()].some((s) => s.has(at(x, y)));

  // ---- props ----
  let oid = 1;
  const props = [];
  const usedSolid = new Set();
  const addProp = (key, px, py, solid, extra = {}) => {
    const tx = Math.floor(px / T);
    const ty = Math.floor((py - 1) / T);
    if (!inside(tx, ty) || keep.has(at(tx, ty))) return false;
    if (solid && (usedSolid.has(at(tx, ty)) || (extra.avoidPath !== false && pathAt(tx, ty)))) return false;
    if (solid) usedSolid.add(at(tx, ty));
    props.push({
      id: oid++, name: key, type: "prop", x: Math.round(px), y: Math.round(py), point: true,
      properties: [
        { name: "key", type: "string", value: key },
        { name: "solid", type: "bool", value: !!solid },
        ...(extra.solidW ? [{ name: "solidW", type: "int", value: extra.solidW }, { name: "solidH", type: "int", value: extra.solidH ?? 1 }] : []),
      ],
    });
    return true;
  };
  const tilesOf = (terrain, filter = () => true) => {
    const out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (kind[at(x, y)] === terrain && filter(x, y)) out.push([x, y]);
    return out;
  };
  const keysOf = (r) => r.keys ?? (r.key ? [r.key] : []);
  for (const r of b.props ?? []) {
    if (r.kind === "grid") {
      // grade escalonada (copas sobrepostas): linhas a cada dy px, colunas a cada dx, meia coluna nas ímpares
      const dx = r.dx ?? 44;
      const dy = r.dy ?? 40;
      const jit = r.jitter ?? 10;
      let row = 0;
      for (let py = r.y0 ?? 24; py < H * T + dy; py += dy, row++)
        for (let px = (row % 2 ? Math.round(dx / 2) : 0) - 10; px < W * T + 30; px += dx) {
          const x = px + Math.round((rnd() - 0.5) * jit);
          const y = py + Math.round((rnd() - 0.5) * jit);
          const tx = Math.floor(x / T);
          const ty = Math.floor((y - 1) / T);
          if (kAt(tx, ty) !== r.on) continue;
          const edge = nearOther(tx, ty, 1, r.on);
          if (edge && rnd() < (r.edgeSkip ?? 0)) continue;
          const opts = r.pick.filter((e) => !e.where || e.where === "any" || (e.where === "edge") === edge);
          if (opts.length) addProp(pickW(opts).key, x, y, r.solid ?? true, r);
        }
    } else if (r.kind === "patches") {
      for (const [cx, cy, rad] of r.patches)
        for (let y = Math.floor(cy - rad); y <= cy + rad; y++)
          for (let x = Math.floor(cx - rad); x <= cx + rad; x++) {
            if (kAt(x, y) !== r.on || pathAt(x, y)) continue;
            if ((x - cx) ** 2 + (y - cy) ** 2 > rad * rad || rnd() < (r.skip ?? 0.15)) continue;
            // dois tufos por tile em quincôncio (a mancha lê como contínua)
            addProp(pick(keysOf(r)), x * T + 9, y * T + 15, !!r.solid, r);
            if ((r.perTile ?? 2) > 1) addProp(pick(keysOf(r)), x * T + 24, y * T + 31, !!r.solid, r);
          }
    } else if (r.kind === "scatter") {
      const pool = tilesOf(r.on, (x, y) => !(r.avoidPath && pathAt(x, y)));
      if (!pool.length) continue;
      const [ox, oy, jx, jy] = r.offset ?? [16, 24, 0, 0];
      for (let i = 0; i < r.count; i++) {
        const [x, y] = pick(pool);
        addProp(pick(keysOf(r)), x * T + ox + Math.floor(rnd() * (jx + 1)), y * T + oy + Math.floor(rnd() * (jy + 1)), !!r.solid, r);
      }
    } else if (r.kind === "edge") {
      // tiles de `on` colados em `adjacentTo` pelo lado indicado (north = o vizinho de cima é adjacentTo)
      const d = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[r.side ?? "north"];
      for (const [x, y] of tilesOf(r.on)) if (kAt(x + d[0], y + d[1]) === r.adjacentTo && rnd() < (r.chance ?? 0.35)) addProp(pick(keysOf(r)), x * T + 16, y * T + 20, !!r.solid, r);
    } else if (r.kind === "fixed") {
      for (const p of r.at) addProp(p.key ?? pick(keysOf(r)), p.x * T + T / 2, (p.y + 1) * T, p.solid ?? !!r.solid, { ...r, ...p });
    } else throw new Error(`brief inválido: props.kind '${r.kind}'`);
  }

  // ---- camadas de objetos de jogo ----
  const P = (props2) => Object.entries(props2 ?? {}).map(([name, value]) => ({ name, type: typeof value === "number" ? (Number.isInteger(value) ? "int" : "float") : typeof value === "boolean" ? "bool" : "string", value }));
  const rect = (o, type, extraProps) => ({ id: oid++, name: o.name ?? "", type, x: o.x * T, y: o.y * T, width: (o.w ?? 1) * T, height: (o.h ?? 1) * T, properties: P(extraProps) });
  const startsObjs = Object.entries(b.starts).map(([name, [x, y]]) => ({ id: oid++, name, type: "start", x: Math.round(x * T + T / 2), y: Math.round(y * T + T / 2), point: true }));
  const spawnObjs = (b.spawns ?? []).map((s) => rect(s, "spawn", { species: s.species.join(","), levelMin: s.levelMin, levelMax: s.levelMax, count: s.count }));
  const npcObjs = (b.npcs ?? []).map((n) => ({ id: oid++, name: n.name, type: "npc", x: center(n.x), y: center(n.y), point: true, properties: P(n.properties) }));
  const portalObjs = (b.portals ?? []).map((p) => rect(p, "portal", { to: p.to, toStart: p.toStart ?? "player" }));
  const triggerObjs = (b.triggers ?? []).map((t) => rect(t, "trigger", t.properties));
  const poiObjs = (b.pois ?? []).map((p) => (p.w || p.h ? rect(p, "poi", { kind: p.kind ?? "poi", ...(p.properties ?? {}) }) : { id: oid++, name: p.name, type: "poi", x: center(p.x), y: center(p.y), point: true, properties: P({ kind: p.kind ?? "poi", ...(p.properties ?? {}) }) }));
  if (b.bossArena) poiObjs.push(rect(b.bossArena, "boss_arena", { boss: b.bossArena.boss ?? "", ...(b.bossArena.properties ?? {}) }));
  const collisionObjs = (b.collision ?? []).map((c) => rect(c, "collision", {}));

  const profile = b.profile ?? "factory-v1";
  const layers =
    profile === "legacy"
      ? [
          { type: "tilelayer", name: "ground", data: ground },
          { type: "objectgroup", name: "objects", objects: [...props, ...startsObjs, ...spawnObjs, ...npcObjs, ...portalObjs, ...triggerObjs, ...poiObjs, ...collisionObjs] },
        ]
      : [
          { type: "tilelayer", name: "ground", data: ground },
          { type: "tilelayer", name: "ground_detail", data: new Array(W * H).fill(0) },
          // props com Y-sort; as copas das árvores (objects_above) o renderer monta a partir da chave fpX_tree_*
          { type: "objectgroup", name: "objects_below", objects: props },
          { type: "objectgroup", name: "objects_above", objects: [] },
          { type: "objectgroup", name: "collision", objects: collisionObjs },
          { type: "objectgroup", name: "spawns", objects: [...startsObjs, ...spawnObjs] },
          { type: "objectgroup", name: "npcs", objects: npcObjs },
          { type: "objectgroup", name: "triggers", objects: [...portalObjs, ...triggerObjs] },
          { type: "objectgroup", name: "poi", objects: poiObjs },
        ];
  const tmj = buildTmj({
    W, H, T,
    tilesetName: b.pack?.pack ?? b.id,
    tiles: TILES,
    layers,
    nextObjectId: oid,
    properties: { ...(b.properties ?? {}), mapProfile: profile, brief: b.id, generator: "gen-map-from-brief" },
  });
  const count = (t) => kind.filter((k) => k === t).length;
  return { tmj, stats: { size: `${W}x${H}`, props: props.length, terrain: Object.fromEntries(Object.keys(b.terrains).map((t) => [t, count(t)])), tiles: TILES.length } };
}

/** Aliases do mapa (<id>.aliases.json): base copiada de outro mapa + pack/prefix/night do brief + _doc. */
export function aliasesFor(b, baseAliases) {
  const { pack, prefix, night } = b.pack ?? {};
  return {
    ...(baseAliases ?? {}),
    _doc: `Mapa ${b.id} (gerado de brief por gen-map-from-brief.mjs) → pacote GAME-ASSETS/03-environments/${pack ?? baseAliases?.pack}/. Chave '${prefix ?? baseAliases?.prefix}<nome>' = PNG <nome> do pacote.${baseAliases ? " Demais campos copiados do mapa base." : ""}`,
    ...(pack ? { pack } : {}),
    ...(prefix ? { prefix } : {}),
    ...(night ? { night } : {}),
  };
}
