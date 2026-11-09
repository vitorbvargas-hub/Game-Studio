// Map Factory — gerador de .tmj a partir de um brief JSON (interface provisória: scripts/map-factory/brief.schema.json).
// Generaliza gen-forest-proof.mjs: terreno base + áreas (elipse com borda irregular, retângulo) + trilhas em spline
// Catmull-Rom com meandro e largura variável + limpeza de borda, autotile Wang-47 (8 vizinhos) ou blob-16 (4),
// props por grade escalonada / manchas / dispersão / borda, e os objetos de jogo (inícios, spawns, NPCs, POIs,
// arena de chefe, portais, colisão, triggers). Determinístico: mesma semente → mesmo mapa. Puro: sem fs.
// Orgânico (opt-in pelo brief): riacho em spline com meandro, largura variável e margem irregular (shape "river"),
// pontes automáticas no trecho reto (bridges[].auto), clareiras com baías na borda (area.organic) e borda da mata
// ao longo das trilhas com largura variável (brief.organic.borderJitter). Tudo isso usa RNGs próprios (semente do
// brief + nome), então mapas sem esses campos saem idênticos aos de antes.

import { buildTmj } from "./tiled.mjs";
import { depthGroundKey, depthObjects, depthTerrain } from "./depth.mjs";

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

/** FNV-1a de 32 bits (semente de um RNG próprio por elemento: não consome o RNG principal). */
export function strHash(s) {
  let h = 0x811c9dc5;
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return h;
}

/** Ruído suave em [0,1] por célula (soma de senos com fases da semente): manchas contínuas, não chuvisco. */
export function smoothNoise(seed) {
  const r = mulberry(seed);
  const p = Array.from({ length: 6 }, () => r() * Math.PI * 2);
  return (x, y) => 0.5 + 0.2 * Math.sin(x * 0.53 + p[0]) * Math.cos(y * 0.47 + p[1]) + 0.15 * Math.sin((x + y) * 0.31 + p[2]) + 0.15 * Math.sin((x - y) * 0.71 + p[3]) * Math.sin(y * 0.29 + p[4]);
}

/**
 * Riacho: spline Catmull-Rom pelos pontos [x, y, meiaLargura, fixo(0..1)] (tiles). A meia-largura é interpolada
 * entre os pontos e ganha ruído (noise, em tiles) onde fixo = 0; onde fixo = 1 a largura é exata (trecho reto da
 * ponte). A margem (bank) é um anel de largura variável [bankWidth] por lado. Pontos podem sair do mapa.
 */
export function paintRiver(water, bank, points, { W, H, noise = 0.3, bankWidth = [0.4, 1.4], seed = 1 }) {
  const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const r = mulberry(seed);
  const ph = Array.from({ length: 5 }, () => r() * Math.PI * 2);
  const pts = [points[0], ...points, points[points.length - 1]];
  const lerp = (a, b, t) => a + (b - a) * t;
  let dist = 0;
  let prev;
  for (let i = 1; i < pts.length - 2; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) * 10));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const [cx, cy] = catmull(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], t);
      if (prev) dist += Math.hypot(cx - prev[0], cy - prev[1]);
      prev = [cx, cy];
      const [nx2, ny2] = catmull(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], Math.min(1, t + 0.01));
      const tl = Math.hypot(nx2 - cx, ny2 - cy) || 1;
      const tx = (nx2 - cx) / tl;
      const ty = (ny2 - cy) / tl;
      const free = 1 - lerp(pts[i][3] ?? 0, pts[i + 1][3] ?? 0, t);
      const hw = lerp(pts[i][2], pts[i + 1][2], t) + free * noise * (0.6 * Math.sin(dist * 0.83 + ph[0]) + 0.4 * Math.sin(dist * 1.91 + ph[1]));
      // margem: um lado e o outro variam com fases diferentes (a mata não espelha nas duas margens)
      const bw = (side) => bankWidth[0] + (bankWidth[1] - bankWidth[0]) * (0.5 + 0.5 * Math.sin(dist * 0.47 + ph[side ? 2 : 3]) * (0.7 + 0.3 * Math.sin(dist * 1.3 + ph[4])));
      const reach = Math.ceil(hw + bankWidth[1]) + 1;
      for (let y = Math.floor(cy - reach); y <= Math.floor(cy + reach); y++)
        for (let x = Math.floor(cx - reach); x <= Math.floor(cx + reach); x++) {
          if (!inside(x, y)) continue;
          const dx = x + 0.5 - cx;
          const dy = y + 0.5 - cy;
          const d = Math.hypot(dx, dy);
          if (d <= hw) water.add(y * W + x);
          else if (d <= hw + bw(tx * dy - ty * dx > 0)) bank.add(y * W + x);
        }
    }
  }
}

/**
 * Curva contínua (Map Factory R2): amostra a spline Catmull-Rom pelos pontos [x, y, meiaLargura?] a cada `step`
 * tiles, sem meandro por amostra (a curvatura vem só dos pontos de controle). Devolve [{x, y, hw, s}] (s = distância
 * acumulada ao longo da curva, em tiles). hw ausente no ponto → `hw` padrão.
 */
export function sampleCurve(points, { step = 0.25, hw = 1 } = {}) {
  const pts = [points[0], ...points, points[points.length - 1]];
  const out = [];
  let s = 0;
  for (let i = 1; i < pts.length - 2; i++) {
    const n = Math.max(1, Math.ceil(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) / step));
    const h0 = pts[i][2] ?? hw;
    const h1 = pts[i + 1][2] ?? hw;
    for (let k = i === 1 ? 0 : 1; k <= n; k++) {
      const t = k / n;
      const [x, y] = catmull(pts[i - 1], pts[i], pts[i + 1], pts[i + 2], t);
      // largura: smoothstep entre os pontos (sem quina na emenda)
      const e = t * t * (3 - 2 * t);
      const prev = out[out.length - 1];
      if (prev) s += Math.hypot(x - prev.x, y - prev.y);
      out.push({ x, y, hw: h0 + (h1 - h0) * e, s });
    }
  }
  return out;
}

/**
 * Campo da curva na célula (x, y): para cada célula a até `reach` tiles da curva, a menor folga d − hw (d = distância
 * do centro da célula ao segmento mais perto, hw interpolada) e o índice da amostra. Map<índice da célula, {f, k}>.
 */
export function curveField(samples, { W, H, reach = 3 }) {
  const field = new Map();
  for (let k = 0; k < samples.length - 1; k++) {
    const a = samples[k];
    const b = samples[k + 1];
    const r = Math.max(a.hw, b.hw) + reach;
    for (let y = Math.max(0, Math.floor(Math.min(a.y, b.y) - r)); y <= Math.min(H - 1, Math.floor(Math.max(a.y, b.y) + r)); y++)
      for (let x = Math.max(0, Math.floor(Math.min(a.x, b.x) - r)); x <= Math.min(W - 1, Math.floor(Math.max(a.x, b.x) + r)); x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const l2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / l2));
        const f = Math.hypot(px - a.x - dx * t, py - a.y - dy * t) - (a.hw + (b.hw - a.hw) * t);
        const i = y * W + x;
        const cur = field.get(i);
        if (!cur || f < cur.f) field.set(i, { f, k: t < 0.5 ? k : k + 1 });
      }
  }
  return field;
}

/** Polilinha da curva para o TMJ: amostras a cada ~`every` tiles (em px), com a meia-largura em px por vértice. */
export function curvePolyline(samples, T, every = 0.5) {
  const keep = [];
  let last = -Infinity;
  samples.forEach((p, i) => {
    if (i === 0 || i === samples.length - 1 || p.s - last >= every) {
      keep.push(p);
      last = p.s;
    }
  });
  return { points: keep.map((p) => ({ x: +(p.x * T).toFixed(2), y: +(p.y * T).toFixed(2) })), hw: keep.map((p) => +(p.hw * T).toFixed(2)) };
}

/**
 * Máscara de canto (corner16, Wang de 16 por cantos, ex. água/grama do forest-v7): bit NW8 NE4 SW2 SE1, ligado quando
 * as 4 células em volta daquele canto são do terreno (a água encolhe meio tile por dentro da colisão, nunca vaza).
 */
export function cornerMask(same, x, y) {
  const c = (dx, dy) => same(x + dx, y + dy);
  const nw = c(-1, -1) && c(0, -1) && c(-1, 0);
  const ne = c(1, -1) && c(0, -1) && c(1, 0);
  const sw = c(-1, 1) && c(0, 1) && c(-1, 0);
  const se = c(1, 1) && c(0, 1) && c(1, 0);
  return (nw ? 8 : 0) | (ne ? 4 : 0) | (sw ? 2 : 0) | (se ? 1 : 0);
}

/** Máscara de autotile: w47 = 8 vizinhos com diagonal normalizada (N1 E2 S4 W8 NE16 SE32 SW64 NW128); blob16 = 4. */
export function autotileMask(same, x, y, mode) {
  if (mode === "c16") return cornerMask(same, x, y);
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
    req(!t.autotile || ["w47", "blob16", "c16"].includes(t.autotile), `terreno '${n}': autotile deve ser w47, blob16 ou c16`);
    req(!t.curve || (typeof t.curve.fill === "string" && Array.isArray(t.curve.ground)), `terreno '${n}': curve precisa de fill e ground`);
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
  const seed0 = (b.seed ?? 1) >>> 0;
  // áreas com afterPaths (água) são pintadas depois das trilhas: a trilha não atravessa a água (só a ponte)
  const rivers = [];
  /** Curvas contínuas (riacho/trilha com curve): vão para a camada `curves` e o renderer desenha a faixa por cima. */
  const curves = [];
  const paintArea = (a) => {
    if (a.shape === "river" && a.curve) {
      // riacho contínuo: água = células com o centro a até hw + pad da linha central (a faixa desenhada tem hw: no
      // máximo ~0,2 tile dela vaza para a célula vizinha, que o renderer cobre); margem = anel de largura variável
      const pad = a.curve.pad ?? 0.5;
      const bw0 = a.bankWidth ?? [0.4, 1.4];
      const s = sampleCurve(a.points, { step: 0.25 });
      const fld = curveField(s, { W, H, reach: pad + bw0[1] + 1 });
      const r = mulberry(seed0 ^ strHash(a.name ?? "river"));
      const ph = Array.from({ length: 4 }, () => r() * Math.PI * 2);
      const ws = new Set();
      const bs = new Set();
      for (const [i, { f, k }] of fld) {
        if (f <= pad) {
          ws.add(i);
          continue;
        }
        const p = s[k];
        const q = s[Math.min(s.length - 1, k + 1)] === p ? s[k - 1] : s[Math.min(s.length - 1, k + 1)];
        const side = (q.x - p.x) * ((Math.floor(i / W) + 0.5) - p.y) - (q.y - p.y) * ((i % W) + 0.5 - p.x) > 0 ? 0 : 2;
        const bw = bw0[0] + (bw0[1] - bw0[0]) * (0.5 + 0.5 * Math.sin(p.s * 0.47 + ph[side]) * (0.7 + 0.3 * Math.sin(p.s * 1.3 + ph[side + 1])));
        if (f <= pad + bw) bs.add(i);
      }
      if (a.bank) for (const i of bs) if (kind[i] === b.base) kind[i] = a.bank;
      for (const i of ws) kind[i] = a.terrain;
      curves.push({ name: a.name ?? "river", terrain: a.terrain, samples: s, z: 1 });
      rivers.push({ name: a.name, cells: ws.size, curve: true });
    } else if (a.shape === "rect")
      for (let y = Math.max(0, a.y); y < Math.min(H, a.y + a.h); y++) for (let x = Math.max(0, a.x); x < Math.min(W, a.x + a.w); x++) kind[at(x, y)] = a.terrain;
    else if (a.shape === "river") {
      // riacho em spline: água + margem (só sobre o terreno base: não apaga trilha nem clareira)
      const ws = new Set();
      const bs = new Set();
      paintRiver(ws, bs, a.points, { W, H, noise: a.noise, bankWidth: a.bankWidth, seed: seed0 ^ strHash(a.name ?? "river") });
      if (a.clean !== false) cleanPath(ws, new Set(), W, H);
      if (a.bank) for (const i of bs) if (kind[i] === b.base && !ws.has(i)) kind[i] = a.bank;
      for (const i of ws) kind[i] = a.terrain;
      rivers.push({ name: a.name, cells: ws.size });
    } else {
      // elipse com borda irregular (o raio oscila com o ângulo), como as clareiras do forest-proof; organic: fases
      // próprias, um 3º harmônico e baías (bumps só para fora: nada da zona do brief vira mata)
      const wob = a.wobble ?? 0.12;
      let ph = [a.cx, a.cy, 0];
      let nooks = [];
      if (a.organic) {
        const r = mulberry(seed0 ^ strHash(a.name ?? `${a.cx},${a.cy}`));
        ph = [r() * 6.283, r() * 6.283, r() * 6.283];
        nooks = Array.from({ length: a.organic.nooks ?? 3 }, () => [r() * 6.283 - Math.PI, (a.organic.amp ?? 0.22) * (0.55 + 0.45 * r()), 0.2 + 0.25 * r()]);
      }
      const angDiff = (p, q) => Math.atan2(Math.sin(p - q), Math.cos(p - q));
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const ang = Math.atan2(y - a.cy, x - a.cx);
          let f = 1 + wob * Math.sin(ang * 3 + ph[0]) + wob * 0.58 * Math.sin(ang * 7 + ph[1]);
          if (a.organic) f += wob * 0.35 * Math.sin(ang * 11 + ph[2]);
          for (const [na, amp, wd] of nooks) f += amp * Math.exp(-((angDiff(ang, na) / wd) ** 2));
          if (((x - a.cx) / (a.rx * f)) ** 2 + ((y - a.cy) / (a.ry * f)) ** 2 < 1) kind[at(x, y)] = a.terrain;
        }
    }
  };
  for (const a of b.areas ?? []) if (!a.afterPaths) paintArea(a);
  const pathCells = new Map();
  (b.paths ?? []).forEach((p, pi) => {
    const set = pathCells.get(p.terrain) ?? new Set();
    const ends = new Set();
    if (p.curve) {
      // trilha contínua de largura constante: células andadas = centro a até hw + pad da spline (sem meandro por
      // amostra nem limpeza de borda: a forma vem da curva, não da grade)
      const hw = p.curve.halfWidth ?? ((p.radius?.[0] ?? 0.73) + (p.radius?.[1] ?? 0.89)) / 2;
      const s = sampleCurve(p.points.map((q) => [q[0], q[1], hw]), { hw });
      for (const [i, { f }] of curveField(s, { W, H, reach: 1 })) if (f <= (p.curve.pad ?? 0.45)) set.add(i);
      curves.push({ name: p.name ?? `path-${pi}`, terrain: p.terrain, samples: s, z: 0 });
      set.curves = (set.curves ?? 0) + 1;
    } else paintSpline(set, p.points, { W, H, radius: p.radius, meander: p.meander, phase: pi });
    set.count = (set.count ?? 0) + 1;
    for (const [x, y] of [p.points[0], p.points[p.points.length - 1]]) ends.add(at(Math.min(W - 1, Math.max(0, Math.floor(x))), Math.min(H - 1, Math.max(0, Math.floor(y)))));
    pathCells.set(p.terrain, set);
    set.ends = new Set([...(set.ends ?? []), ...ends]);
  });
  for (const [terrain, set] of pathCells) {
    if (b.terrains[terrain].cleanEdges !== false && set.curves !== set.count) cleanPath(set, set.ends, W, H);
    // ao longo da trilha, o terreno base recua (dá para andar ao lado dela)
    const border = b.terrains[terrain].border;
    // organic.borderJitter: onde o ruído suave passa do limiar a mata recua 2 tiles em vez de 1 (borda irregular)
    const jit = b.organic?.borderJitter ?? 0;
    const bn = jit > 0 ? smoothNoise(seed0 ^ strHash(`border:${terrain}`)) : null;
    if (border)
      for (const i of set) {
        const x = i % W;
        const y = Math.floor(i / W);
        const r = bn && bn(x, y) > 1 - jit ? 2 : 1;
        for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (inside(x + dx, y + dy) && kind[at(x + dx, y + dy)] === b.base) kind[at(x + dx, y + dy)] = border;
      }
    for (const i of set) kind[i] = terrain;
  }
  for (const a of b.areas ?? []) if (a.afterPaths) paintArea(a);
  // pontes: células andáveis por cima de um terreno sólido (água); o chão mantém a chave do terreno (autotile
  // intacto) com solid=false e a arte da ponte vai na camada ground_detail
  // auto: a ponte cobre a faixa contínua de água da linha (h) / coluna (v) que passa pelo ponto de travessia
  // kind "ford" (vau): mesma faixa, sem arte de ponte; as células ficam andáveis e ganham pedras (fordStones).
  // axis "auto": perpendicular ao riacho contínuo mais perto. pad: a ponte avança N tiles de terra em cada ponta.
  const fords = [];
  const bridges = (b.bridges ?? []).map((br) => {
    if (!br.auto) return br;
    const over = br.over ?? "water";
    let axis = br.axis ?? "h";
    if (axis === "auto") {
      let best;
      for (const c of curves)
        if (c.terrain === over)
          c.samples.forEach((p, k) => {
            const d = Math.hypot(p.x - br.x - 0.5, p.y - br.y - 0.5);
            if (!best || d < best.d) best = { d, c, k };
          });
      const ss = best?.c.samples;
      const a = ss && ss[Math.max(0, best.k - 2)];
      const z = ss && ss[Math.min(ss.length - 1, best.k + 2)];
      axis = a && Math.abs(z.x - a.x) >= Math.abs(z.y - a.y) ? "v" : "h";
    }
    const h = axis === "h";
    const n = h ? W : H;
    const isW = (i) => (h ? inside(i, br.y) && kind[at(i, br.y)] === over : inside(br.x, i) && kind[at(br.x, i)] === over);
    let c = h ? br.x : br.y;
    if (!isW(c)) {
      const near = Array.from({ length: n }, (_, i) => i).filter(isW).sort((p, q) => Math.abs(p - c) - Math.abs(q - c))[0];
      if (near === undefined) throw new Error(`brief inválido: ponte '${br.name}' sem ${over} na ${h ? "linha" : "coluna"} ${h ? br.y : br.x}`);
      c = near;
    }
    let i0 = c;
    let i1 = c;
    while (isW(i0 - 1)) i0--;
    while (isW(i1 + 1)) i1++;
    const pad = br.pad ?? 0;
    i0 = Math.max(0, i0 - pad);
    i1 = Math.min(n - 1, i1 + pad);
    const len = i1 - i0 + 1;
    const set = br.kind === "ford" ? [] : (h ? br.set : br.setV ?? br.set) ?? [];
    const det = Array.from({ length: len }, (_, i) => (i === 0 ? set[0] : i === len - 1 ? set[2] : set[1]));
    const out = h ? { name: br.name, x: i0, y: br.y, w: len, h: 1, detail: det } : { name: br.name, x: br.x, y: i0, w: 1, h: len, detail: det };
    out.kind = br.kind ?? "bridge";
    out.over = over;
    if (out.kind === "ford") fords.push(out);
    return out;
  });
  const walkable = new Set();
  const detail = new Array(W * H).fill("");
  for (const br of bridges) {
    let k = 0;
    for (let y = br.y; y < br.y + br.h; y++)
      for (let x = br.x; x < br.x + br.w; x++, k++) {
        if (!inside(x, y)) continue;
        walkable.add(at(x, y));
        if (br.detail?.[k]) detail[at(x, y)] = br.detail[k];
      }
  }
  // avoidPath: decalque que não vai sobre trilha nem água (ex. o chão da arena, com moldura de grama)
  for (const d of b.details ?? []) if (inside(d.x, d.y) && !(d.avoidPath && ([...pathCells.values()].some((ps) => ps.has(at(d.x, d.y))) || walkable.has(at(d.x, d.y)) || kind[at(d.x, d.y)] !== (d.on ?? kind[at(d.x, d.y)])))) detail[at(d.x, d.y)] = d.key;
  // passe de profundidade (look v8, opt-in): platôs mudam o terreno antes das chaves de chão
  const kindBase = b.depth ? kind.slice() : null;
  const pathAt0 = (x, y) => [...pathCells.values()].some((s) => s.has(at(x, y)));
  const terr = b.depth ? depthTerrain(b, { W, H, T, kind, detail, walkable, inside, at, pathAt: pathAt0 }) : null;
  const kAt = (x, y) => (inside(x, y) ? kind[at(x, y)] : b.base);
  const hasNear = (x, y, r, t) => {
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (kAt(x + dx, y + dy) === t) return true;
    return false;
  };
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
  const groundCtx = { nearKind: hasNear };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const tn = kind[at(x, y)];
      const t = b.terrains[tn];
      // sólido: true/false, ou "interior" (sólido só se não houver outro terreno a 1 tile: a borda fica andável)
      const solid = walkable.has(at(x, y)) ? false : t.solid === "interior" ? !nearOther(x, y, 1, tn) : !!t.solid;
      let key;
      if (t.autotile) {
        const outside = t.outside ?? "in";
        const same = (a, c) => {
          if (!inside(a, c)) return outside === "in" ? true : outside === "out" ? false : kind[at(Math.max(0, Math.min(W - 1, a)), Math.max(0, Math.min(H - 1, c)))] === tn;
          return kind[at(a, c)] === tn;
        };
        key = `${t.prefix}${autotileMask(same, x, y, t.autotile)}`;
        // interior (look v8): miolo do autotile coberto por outro chão na camada ground_detail (ex. grama no topo do
        // platô com a borda de pedra); a chave Wang da célula continua a mesma (gate wang)
        if (t.interior?.length && key === `${t.prefix}${t.autotile === "w47" ? 255 : 15}` && !detail[at(x, y)]) detail[at(x, y)] = t.interior[(x * 7 + y * 13) % t.interior.length];
      } else key = t.variants.length === 1 ? t.variants[0] : pick(t.variants);
      if (b.depth && !t.autotile) key = depthGroundKey(b, tn, x, y, groundCtx) ?? key;
      ground[at(x, y)] = gid(key, solid);
    }

  // os props do mapa base veem o terreno de antes dos platôs (mesmo sorteio do RNG principal que o mapa sem depth)
  const kindFinal = terr ? kind.slice() : null;
  if (terr) for (let i = 0; i < kind.length; i++) kind[i] = kindBase[i];

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
  for (const br of bridges) reserve(br.x - 1, br.y - 1, br.x + br.w, br.y + br.h);
  if (b.bossArena) reserve(b.bossArena.x, b.bossArena.y, b.bossArena.x + b.bossArena.w - 1, b.bossArena.y + b.bossArena.h - 1);
  const pathAt = (x, y) => [...pathCells.values()].some((s) => s.has(at(x, y)));

  // ---- props ----
  let oid = 1;
  const props = [];
  const usedSolid = new Set();
  const addProp = (key, px, py, solid, extra = {}) => {
    const tx = Math.floor(px / T);
    const ty = Math.floor((py - 1) / T);
    // force: props de objetos de jogo (baú, placa, cura) entram na célula reservada do próprio POI
    if (!inside(tx, ty) || (keep.has(at(tx, ty)) && !extra.force)) return false;
    // um prop de POI (force) nunca é descartado por cair na trilha: o objeto de jogo existe; o gate reach confere o caminho
    if (solid && (usedSolid.has(at(tx, ty)) || (!extra.force && extra.avoidPath !== false && pathAt(tx, ty)))) return false;
    if (solid) usedSolid.add(at(tx, ty));
    props.push({
      id: oid++, name: key, type: "prop", x: Math.round(px), y: Math.round(py), point: true,
      properties: [
        { name: "key", type: "string", value: key },
        { name: "solid", type: "bool", value: !!solid },
        ...(extra.solidW ? [{ name: "solidW", type: "int", value: extra.solidW }, { name: "solidH", type: "int", value: extra.solidH ?? 1 }] : []),
        // openKey: sprite do 2º estado (baú aberto); npc: o prop é o corpo daquele NPC (o gate aceita o NPC sobre ele)
        ...(extra.openKey ? [{ name: "openKey", type: "string", value: extra.openKey }] : []),
        ...(extra.npc ? [{ name: "npc", type: "string", value: extra.npc }] : []),
      ],
    });
    return true;
  };
  const tilesOf = (terrain, filter = () => true) => {
    const out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (kind[at(x, y)] === terrain && filter(x, y)) out.push([x, y]);
    return out;
  };
  // within: retângulo {x, y, w, h} em tiles que limita scatter/edge a uma zona do brief
  const inWithin = (r, x, y) => !r.within || (x >= r.within.x && y >= r.within.y && x < r.within.x + r.within.w && y < r.within.y + r.within.h);
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
      const pool = tilesOf(r.on, (x, y) => !(r.avoidPath && pathAt(x, y)) && inWithin(r, x, y));
      if (!pool.length) continue;
      const [ox, oy, jx, jy] = r.offset ?? [16, 24, 0, 0];
      for (let i = 0; i < r.count; i++) {
        const [x, y] = pick(pool);
        addProp(pick(keysOf(r)), x * T + ox + Math.floor(rnd() * (jx + 1)), y * T + oy + Math.floor(rnd() * (jy + 1)), !!r.solid, r);
      }
    } else if (r.kind === "edge") {
      // tiles de `on` colados em `adjacentTo` pelo lado indicado (north = o vizinho de cima é adjacentTo)
      const d = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0] }[r.side ?? "north"];
      for (const [x, y] of tilesOf(r.on, (x2, y2) => inWithin(r, x2, y2))) if (kAt(x + d[0], y + d[1]) === r.adjacentTo && rnd() < (r.chance ?? 0.35)) addProp(pick(keysOf(r)), x * T + 16, y * T + 20, !!r.solid, r);
    } else if (r.kind === "fixed") {
      for (const p of r.at) addProp(p.key ?? pick(keysOf(r)), p.x * T + T / 2 + (p.ox ?? 0), (p.y + 1) * T + (p.oy ?? 0), p.solid ?? !!r.solid, { ...r, ...p });
    } else throw new Error(`brief inválido: props.kind '${r.kind}'`);
  }
  // pedras do vau: uma por célula de água da travessia, alternando o lado (decoração, não sólida)
  for (const f of fords)
    for (let y = f.y, k = 0; y < f.y + f.h; y++)
      for (let x = f.x; x < f.x + f.w; x++, k++)
        if (inside(x, y) && kind[at(x, y)] === f.over && b.fordStones?.length) addProp(b.fordStones[k % b.fordStones.length], x * T + (k % 2 ? 11 : 21), y * T + (k % 2 ? 14 : 26), false, { force: true });

  let depthOut = null;
  if (terr) {
    for (let i = 0; i < kind.length; i++) kind[i] = kindFinal[i];
    depthOut = depthObjects(b, { W, H, T, kind, detail, inside, at, pathAt, keep, addProp, props, curves, walkable, nextId: () => oid, setNextId: (v) => (oid = v) }, terr);
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
  const collisionObjs = [...(b.collision ?? []), ...(terr?.collision ?? [])].map((c) => rect(c, "collision", {}));
  // curvas: polilinha em px + o que o renderer precisa (conjunto, textura cheia, chão embaixo, borda, vaus)
  const curveObjs = curves.map((c) => {
    const t = b.terrains[c.terrain];
    if (!t.curve) throw new Error(`brief inválido: terreno '${c.terrain}' sem curve (fill/ground) para a curva '${c.name}'`);
    const pl = curvePolyline(c.samples, T);
    const fr = fords.filter((f) => f.over === c.terrain).map((f) => [f.x * T, f.y * T, f.w * T, f.h * T].join(",")).join(";");
    return {
      id: oid++, name: c.name, type: "curve", x: 0, y: 0, polyline: pl.points,
      properties: P({ terrain: c.terrain, prefix: t.prefix ?? "", fill: t.curve.fill, ground: t.curve.ground.join(","), edge: t.curve.edge ?? "dither", ...(t.curve.foam ? { foam: t.curve.foam } : {}), z: c.z, hw: pl.hw.join(","), ...(fr ? { fords: fr } : {}) }),
    };
  });

  const profile = b.profile ?? "factory-v1";
  const layers =
    profile === "legacy"
      ? [
          { type: "tilelayer", name: "ground", data: ground },
          { type: "objectgroup", name: "objects", objects: [...props, ...startsObjs, ...spawnObjs, ...npcObjs, ...portalObjs, ...triggerObjs, ...poiObjs, ...collisionObjs] },
        ]
      : [
          { type: "tilelayer", name: "ground", data: ground },
          { type: "tilelayer", name: "ground_detail", data: detail.map((k) => (k ? gid(k, false) : 0)) },
          // props com Y-sort; as copas das árvores (objects_above) o renderer monta a partir da chave fpX_tree_*
          { type: "objectgroup", name: "objects_below", objects: props },
          { type: "objectgroup", name: "objects_above", objects: [] },
          { type: "objectgroup", name: "collision", objects: collisionObjs },
          ...(curveObjs.length ? [{ type: "objectgroup", name: "curves", objects: curveObjs }] : []),
          // look v8: decalques de chão (camada própria, sem Y-sort) e manchas de solo (lama)
          ...(depthOut ? [{ type: "objectgroup", name: "decals", objects: depthOut.decals }, { type: "objectgroup", name: "patches", objects: depthOut.patches }] : []),
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
  return {
    tmj,
    stats: {
      size: `${W}x${H}`,
      props: props.length,
      terrain: Object.fromEntries(Object.keys(b.terrains).map((t) => [t, count(t)])),
      tiles: TILES.length,
      bridges: bridges.map(({ name, x, y, w, h, kind: k }) => ({ name, x, y, w, h, kind: k ?? "bridge" })),
      rivers,
      curves: curves.length,
      ...(depthOut ? { depth: { ...depthOut.stats, plateaus: terr.plateaus } } : {}),
    },
  };
}

/** Aliases do mapa (<id>.aliases.json): base copiada de outro mapa + pack/prefix/night do brief + _doc. */
export function aliasesFor(b, baseAliases) {
  const { pack, prefix, night, extraPacks, smoothAutotile } = b.pack ?? {};
  return {
    ...(baseAliases ?? {}),
    _doc: `Mapa ${b.id} (gerado de brief por gen-map-from-brief.mjs) → pacote GAME-ASSETS/03-environments/${pack ?? baseAliases?.pack}/. Chave '${prefix ?? baseAliases?.prefix}<nome>' = PNG <nome> do pacote.${baseAliases ? " Demais campos copiados do mapa base." : ""}`,
    ...(pack ? { pack } : {}),
    ...(prefix ? { prefix } : {}),
    ...(night ? { night } : {}),
    ...(extraPacks?.length ? { extraPacks } : {}),
    // recortes suaves extras do kit (ex. a água corner16 do forest-v7) somam aos do mapa base
    ...(smoothAutotile?.length ? { smoothAutotile: [...(baseAliases?.smoothAutotile ?? []).filter((s) => !smoothAutotile.some((x) => x.prefix === s.prefix)), ...smoothAutotile] } : {}),
  };
}
