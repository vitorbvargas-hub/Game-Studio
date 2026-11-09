// Map Factory — adaptador do brief oficial do game-design (world-design/map-brief.schema.json, schemaVersion 1)
// para a interface do gerador (brief v0.1, scripts/map-factory/brief.schema.json). Puro: sem fs.
//
//   brief do game-design (planta lógica)  +  kit de montagem (kits/<kit>.kit.json: arte, terrenos, regras)
//   +  ajustes de montagem opcionais (<id>.build.json: semente, saída, rotas corrigidas, inícios)  →  brief v0.1
//
// Regras (o que o brief não diz e o game-dev decide aqui):
//   zonas       zoneTerrain do kit: clareiras viram elipse orgânica (baías na borda) que cobre o retângulo; água
//               comprida (lado maior ≥ 2× o menor) vira riacho em spline (meandro, largura variável, margem irregular,
//               encosta na borda do mapa se a zona estiver a ≤ edgeSnap tiles dela); água larga vira lagoa (elipse
//               orgânica). Água é pintada depois das trilhas (a trilha não atravessa água, só a ponte); zonas sem
//               terreno (dense_border, cliff) ficam mata
//   rotas       spline do gerador pelos waypoints (centro do tile) com pontos intermediários deslocados na
//               perpendicular (meandro); trechos que encostam em água ficam retos (aproximação da ponte); largura →
//               raio da amostra
//   POI crossing  dentro de uma zona de água vira ponte no eixo curto da zona, num trecho reto do riacho com a
//               largura da zona (células andáveis + arte em ground_detail; o gerador mede a faixa de água real)
//   saídas      portal no rect da saída, chão de clareira nele, trilha curta para dentro e o início from_<destino>
//   spawns      retângulo do raio em volta do centro da zona (cortado pela zona, com aviso), uma espécie por spawn
//   interativos POI com kind chest/sign/heal_point (texto extraído do effect) + prop do kit na mesma célula
//   chefe       boss_arena = retângulo da zona (ou do raio) + trigger boss_approach
//   vegetação   vegetationDensityRules → manchas de grama alta, flores e cogumelos por zona; rock_field → rochas

const DEFAULT_RADIUS = [0.73, 0.89];

/**
 * Parâmetros orgânicos padrão (o kit pode sobrescrever em kit.organic, a montagem em build.organic; build.organic
 * = false desliga tudo e volta ao traçado reto da fase 2).
 *   river      step: distância entre pontos de controle; meander: deslocamento lateral máx.; halfWidth: [mín, máx]
 *              da meia-largura; noise: ruído da margem; bank/bankWidth: anel de margem; edgeSnap: encosta na borda;
 *              wavelength: comprimento de onda do meandro (tiles); straight: meia-extensão (tiles) do trecho reto
 *              em volta de cada ponte; dryGap: folga seca entre a ponta do riacho e um POI (não travessia) na zona
 *   routes     step: um ponto intermediário a cada N tiles; amp: deslocamento máx.; wobble: meandro fino da spline;
 *              waterClear: trechos a menos disso de uma zona de água ficam retos
 *   clearings  wobble da elipse, nº de baías e amplitude relativa
 *   borderJitter  fração da borda das trilhas em que a mata recua 2 tiles em vez de 1
 */
export const DEFAULT_ORGANIC = {
  river: { step: 2.5, meander: 2.0, wavelength: 11, halfWidth: [1.4, 2.1], noise: 0.35, bank: "clearing", bankWidth: [0.3, 1.5], edgeSnap: 3, straight: 2, dryGap: 1.6 },
  routes: { step: 3.5, amp: 1.5, wobble: 0.3, waterClear: 2 },
  clearings: { wobble: 0.08, nooks: 4, amp: 0.2 },
  borderJitter: 0.3,
};

export function organicOf(kit, build) {
  if (build?.organic === false) return null;
  const k = kit?.organic ?? {};
  const b = build?.organic ?? {};
  const o = {};
  for (const key of Object.keys(DEFAULT_ORGANIC))
    o[key] = typeof DEFAULT_ORGANIC[key] === "object" ? { ...DEFAULT_ORGANIC[key], ...(k[key] ?? {}), ...(b[key] ?? {}) } : (b[key] ?? k[key] ?? DEFAULT_ORGANIC[key]);
  return o;
}

/** mulberry32 (o mesmo do gerador), para os desvios do adaptador não dependerem do RNG do gerador. */
function mulberry(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Meandro de rota: entre waypoints consecutivos, um ponto a cada `step` tiles deslocado na perpendicular por uma
 * senoide (envelope sin(πt): zero nos waypoints, que são âncoras do game-design). Trechos marcados por `keepStraight`
 * (encostam em água) passam intactos.
 */
export function meanderRoute(points, rng, { step = 3.5, amp = 1.5 } = {}, keepStraight = () => false) {
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.floor(len / step);
    if (n >= 1 && !keepStraight(a, b)) {
      const px = -(b[1] - a[1]) / len;
      const py = (b[0] - a[0]) / len;
      const ph = rng() * Math.PI * 2;
      const freq = (Math.PI * (1 + Math.floor(rng() * 2))) / (n + 1);
      const A = amp * Math.min(1, len / 8);
      for (let k = 1; k <= n; k++) {
        const t = k / (n + 1);
        const off = A * Math.sin(Math.PI * t) * Math.sin(ph + k * freq);
        out.push([a[0] + (b[0] - a[0]) * t + px * off, a[1] + (b[1] - a[1]) * t + py * off]);
      }
    }
    out.push(b);
  }
  return out;
}

/**
 * Linha central do riacho numa zona retangular comprida: pontos [x, y, meiaLargura, fixo] ao longo do eixo maior,
 * com deslocamento lateral e largura sorteados; em volta de cada travessia (crossings, coordenada no eixo maior) um
 * trecho reto com a largura exata da zona (fixo = 1), para a ponte.
 */
export function riverPoints(r, crossings, rng, o, { W, H }, dry = []) {
  const vertical = r.h >= r.w;
  const len0 = vertical ? r.y : r.x;
  const len1 = vertical ? r.y + r.h : r.x + r.w;
  const max = vertical ? H : W;
  let a0 = len0 <= o.edgeSnap ? -1.5 : len0;
  let a1 = max - len1 <= o.edgeSnap ? max + 1.5 : len1;
  // POI que não é travessia dentro da zona (mirante, placa...): a ponta do riacho mais próxima recua e ele fica seco
  const gap = o.dryGap ?? 1.6;
  for (const v of dry.map((d) => d + 0.5)) {
    if (v - a0 < a1 - v) a0 = Math.max(a0, v + gap);
    else a1 = Math.min(a1, v - gap);
  }
  const snapped = [a0 < 0, a1 > max];
  const c = vertical ? r.x + r.w / 2 : r.y + r.h / 2;
  const hwZone = (vertical ? r.w : r.h) / 2;
  const cs = crossings.map((v) => v + 0.5);
  const anchors = [];
  for (const v of cs) for (const d of [-o.straight, 0, o.straight]) anchors.push([v + d, 0, hwZone, 1]);
  const free = [];
  const n = Math.max(1, Math.round((a1 - a0) / o.step));
  const ph = rng() * Math.PI * 2;
  for (let k = 0; k <= n; k++) {
    const a = a0 + ((a1 - a0) * k) / n;
    const dc = cs.length ? Math.min(...cs.map((v) => Math.abs(v - a))) : Infinity;
    if (dc < o.straight + 1.2) continue;
    // perto da ponte o desvio e a largura convergem para o trecho reto
    const blend = Math.min(1, (dc - o.straight) / 3);
    const lat = o.meander * (0.8 * Math.sin(ph + ((a - a0) * 2 * Math.PI) / (o.wavelength ?? 11)) + 0.2 * (rng() * 2 - 1)) * blend;
    let hw = hwZone + (o.halfWidth[0] + rng() * (o.halfWidth[1] - o.halfWidth[0]) - hwZone) * blend;
    // ponta dentro do mapa (não encostada na borda) afina: o riacho nasce/acaba, não corta reto
    if ((k === 0 && !snapped[0]) || (k === n && !snapped[1])) hw *= 0.55;
    free.push([a, lat, hw, 0]);
  }
  const all = [...anchors, ...free].sort((p, q) => p[0] - q[0]);
  return all.map(([a, lat, hw, fixed]) => (vertical ? [c + lat, a, hw, fixed] : [a, c + lat, hw, fixed]));
}

/** Ponto (x, y) dentro do polígono (par-ímpar). */
export function inPolygon(pts, x, y) {
  let ins = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

/**
 * Linha central de uma zona de água em polígono (riacho em L/Z do brief v2): células cujo centro cai no polígono,
 * distância até a borda dele, as duas pontas (trechos do polígono que tocam a borda do mapa; senão as duas células
 * mais distantes) e o caminho mais barato entre elas, com custo alto longe do eixo (segue o meio do corredor) e perto
 * de POIs que precisam ficar secos. Devolve pontos [x, y, distânciaDaBorda] a cada ~`step` tiles, suavizados, com as
 * pontas estendidas 1,5 tile para fora do mapa quando tocam a borda.
 */
export function polygonCenterline(poly, { W, H }, { step = 2.5, dry = [] } = {}) {
  const inside = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inPolygon(poly, x + 0.5, y + 0.5)) inside[y * W + x] = 1;
  // distância (4 vizinhos) até a célula de fora mais perto; a borda do mapa não conta como fora (o riacho sai por ela)
  const dist = new Float32Array(W * H).fill(Infinity);
  const q = [];
  for (let i = 0; i < W * H; i++) if (!inside[i]) (dist[i] = 0), q.push(i);
  for (let h = 0; h < q.length; h++) {
    const x = q[h] % W;
    const y = Math.floor(q[h] / W);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H || dist[ny * W + nx] <= dist[q[h]] + 1) continue;
      dist[ny * W + nx] = dist[q[h]] + 1;
      q.push(ny * W + nx);
    }
  }
  // pontas: trechos do polígono em cada borda do mapa (centro do trecho)
  const ends = [];
  const runs = (cells, edge) => {
    let run = [];
    for (const c of [...cells, null]) {
      if (c !== null && inside[c[1] * W + c[0]]) run.push(c);
      else if (run.length) {
        const m = run[Math.floor(run.length / 2)];
        ends.push({ x: m[0], y: m[1], edge, n: run.length });
        run = [];
      }
    }
  };
  runs(Array.from({ length: W }, (_, x) => [x, 0]), "n");
  runs(Array.from({ length: W }, (_, x) => [x, H - 1]), "s");
  runs(Array.from({ length: H }, (_, y) => [0, y]), "w");
  runs(Array.from({ length: H }, (_, y) => [W - 1, y]), "e");
  ends.sort((a, b) => b.n - a.n);
  const cellsIn = [];
  for (let i = 0; i < W * H; i++) if (inside[i]) cellsIn.push(i);
  if (!cellsIn.length) return [];
  const penal = (x, y) => dry.reduce((a, [px, py]) => a + Math.max(0, 4 - Math.hypot(x - px, y - py)) * 6, 0);
  // Dijkstra (8 vizinhos) dentro do polígono
  const path = (a) => {
    const cost = new Float64Array(W * H).fill(Infinity);
    const prev = new Int32Array(W * H).fill(-1);
    const open = [[0, a]];
    cost[a] = 0;
    while (open.length) {
      let bi = 0;
      for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
      const [c, i] = open.splice(bi, 1)[0];
      if (c > cost[i]) continue;
      const x = i % W;
      const y = Math.floor(i / W);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= W || ny >= H || !inside[ny * W + nx]) continue;
          const j = ny * W + nx;
          const nc = c + Math.hypot(dx, dy) * (1 + 8 / (dist[j] * dist[j]) + penal(nx, ny));
          if (nc < cost[j]) {
            cost[j] = nc;
            prev[j] = i;
            open.push([nc, j]);
          }
        }
    }
    return { cost, prev };
  };
  let A;
  let B;
  if (ends.length >= 2) {
    A = ends[0].y * W + ends[0].x;
    B = ends[1].y * W + ends[1].x;
  } else {
    // sem duas bordas: as duas células mais distantes (duas varreduras)
    const far = (from) => {
      const { cost } = path(from);
      return cellsIn.reduce((m, i) => (cost[i] < Infinity && cost[i] > cost[m] ? i : m), from);
    };
    A = ends.length ? ends[0].y * W + ends[0].x : far(cellsIn[0]);
    B = far(A);
  }
  const { prev } = path(A);
  const cells = [];
  for (let i = B; i !== -1; i = prev[i]) cells.push([(i % W) + 0.5, Math.floor(i / W) + 0.5, dist[i]]);
  cells.reverse();
  // suaviza (média móvel de 5) e reamostra a cada ~step tiles
  const sm = cells.map((_, k) => {
    const win = cells.slice(Math.max(0, k - 2), k + 3);
    return [0, 1, 2].map((d) => win.reduce((a, p) => a + p[d], 0) / win.length);
  });
  sm[0] = cells[0];
  sm[sm.length - 1] = cells[cells.length - 1];
  const out = [sm[0]];
  let acc = 0;
  for (let k = 1; k < sm.length; k++) {
    acc += Math.hypot(sm[k][0] - sm[k - 1][0], sm[k][1] - sm[k - 1][1]);
    if (acc >= step || k === sm.length - 1) {
      out.push(sm[k]);
      acc = 0;
    }
  }
  // pontas na borda do mapa: estende 1,5 tile para fora (a água sai do mapa, não termina na última linha)
  const ext = (p) => {
    const o = [...p];
    if (p[1] < 1) o[1] = -1.5;
    else if (p[1] > H - 1) o[1] = H + 1.5;
    else if (p[0] < 1) o[0] = -1.5;
    else if (p[0] > W - 1) o[0] = W + 1.5;
    return o;
  };
  out[0] = ext(out[0]);
  out[out.length - 1] = ext(out[out.length - 1]);
  return out;
}

/** Hash FNV-1a de 32 bits (semente padrão a partir do id). */
export function hashSeed(s) {
  let h = 0x811c9dc5;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0;
  return h;
}

/** Brief do game-design (schema oficial)? */
export const isDesignBrief = (b) => !!b && b.schemaVersion === 1 && !!b.dimensions && Array.isArray(b.zones);

/** Retângulo da zona em tiles ({x, y, w, h}); polígono → caixa envolvente. */
export function zoneRect(z) {
  if (z.shape === "rect" && z.rect) return { x: z.rect.x, y: z.rect.y, w: z.rect.width, h: z.rect.height };
  const pts = z.polygon?.points ?? [];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.floor(Math.min(...xs));
  const y = Math.floor(Math.min(...ys));
  return { x, y, w: Math.ceil(Math.max(...xs)) - x + 1, h: Math.ceil(Math.max(...ys)) - y + 1 };
}

const clampRect = (r, W, H) => {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  return { x, y, w: Math.max(1, Math.min(W, r.x + r.w) - x), h: Math.max(1, Math.min(H, r.y + r.h) - y) };
};
const intersect = (a, b) => {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const x1 = Math.min(a.x + a.w, b.x + b.w);
  const y1 = Math.min(a.y + a.h, b.y + b.h);
  return x1 > x && y1 > y ? { x, y, w: x1 - x, h: y1 - y } : null;
};
const cell = (p) => [Math.floor(p[0]), Math.floor(p[1])];

/** Texto pt-BR de uma placa/efeito: o trecho entre aspas simples do effect, senão a descrição. */
export function signText(it) {
  const m = /'([^']{4,})'/.exec(it.effect ?? "");
  return m ? m[1] : it.description;
}

/** Meia-largura (tiles) da trilha contínua para a largura da rota: a faixa desenhada fica com ~90% da largura pedida. */
export function halfWidthFor(widthTiles) {
  return Math.max(0.6, (widthTiles ?? 2) * 0.45);
}

/** Travessia da POI crossing: "ford" (vau) quando o brief pede (subtype/crossingType/kind ou nome com vau/ford). */
export function crossingKind(p, fallback = "bridge") {
  const t = String(p.crossingType ?? p.subtype ?? p.kind ?? "").toLowerCase();
  if (/ford|vau/.test(t)) return "ford";
  if (/bridge|ponte/.test(t)) return "bridge";
  return /\bvau\b|ford/i.test(`${p.id} ${p.name ?? ""}`) ? "ford" : fallback;
}

/** Sprite do NPC humano (sem speciesId) pelo kit.npcSprites: ranger, comerciante ou ranger como padrão. */
export function npcSpriteOf(n, kit) {
  const s = kit.npcSprites;
  if (!s || n.speciesId) return null;
  if (n.sprite && s[n.sprite]) return s[n.sprite];
  // assetRef do brief v2 (art/map-factory/forest-v7-pixellab/props/npc_<x>.png) manda, se o kit tiver a peça
  const ref = /npc_([a-z]+)\.png$/i.exec(n.assetRef ?? "")?.[1];
  if (ref && s[ref]) return s[ref];
  const t = `${n.role ?? ""} ${n.kind ?? ""} ${n.id ?? ""} ${n.name ?? ""}`.toLowerCase();
  if (/merchant|comerci|vend|loja|mercad/.test(t)) return s.merchant;
  return s.ranger ?? null;
}

/** Raio da spline do gerador para a largura em tiles da rota. */
export function radiusFor(widthTiles) {
  if (!widthTiles || widthTiles >= 1.9 && widthTiles <= 2.1) return DEFAULT_RADIUS;
  if (widthTiles < 1.9) return [0.6, 0.75];
  return [widthTiles / 2 - 0.3, widthTiles / 2];
}

/** Ponto 3 tiles para dentro do mapa a partir do centro da saída (chegada pelo portal). */
function arrivalOf(e, W, H) {
  const r = e.rect;
  const cx = Math.floor(r.x + r.width / 2);
  const cy = Math.floor(r.y + r.height / 2);
  if (e.edge === "s") return [cx, Math.max(0, r.y - 2)];
  if (e.edge === "n") return [cx, Math.min(H - 1, r.y + r.height + 1)];
  if (e.edge === "e") return [Math.max(0, r.x - 2), cy];
  return [Math.min(W - 1, r.x + r.width + 1), cy];
}

/**
 * Converte. gd: brief do game-design; kit: kits/<kit>.kit.json; build: ajustes opcionais
 * ({ seed, out, profile, routes: { <id>: { waypoints, widthTiles, meander } }, extraRoutes: [...],
 *    starts: { nome: [x,y] }, water: { <zoneId>: { rect } }, organic: {...} | false, notes }).
 * Devolve { brief, report, warnings } — report lista as decisões tomadas; warnings, as que mudam o que o brief pediu
 * (ex.: raio de spawn recortado), também presentes no report.
 */
export function adaptDesignBrief(gd, kit, build = {}) {
  if (!isDesignBrief(gd)) throw new Error("brief do game-design inválido: schemaVersion 1, dimensions e zones obrigatórios");
  const W = gd.dimensions.widthTiles;
  const H = gd.dimensions.heightTiles;
  const T = gd.dimensions.tileSizePx ?? 32;
  const report = [];
  const warnings = [];
  const zones = Object.fromEntries(gd.zones.map((z) => [z.id, z]));
  const rectOf = (id) => (zones[id] ? clampRect(zoneRect(zones[id]), W, H) : null);
  const vr = gd.vegetationDensityRules ?? { default: "medium", byZoneType: {} };
  const densityOf = (z) => vr.byZoneRef?.[z.id] ?? vr.byZoneType?.[z.type] ?? vr.default ?? "medium";

  // ---- zonas → áreas ----
  const org = organicOf(kit, build);
  // curvas contínuas (kit.curves): trilhas e riacho viram faixas de largura constante; build.curves = false desliga
  const cv = build.curves === false ? null : kit.curves ?? null;
  const seed = build.seed ?? hashSeed(gd.id);
  const areas = [];
  const water = [];
  for (const z of gd.zones) {
    const terrain = kit.zoneTerrain[z.type];
    const r = clampRect(build.water?.[z.id]?.rect ?? zoneRect(z), W, H);
    if (terrain === undefined) report.push(`zona '${z.id}': tipo '${z.type}' sem terreno no kit (fica ${kit.base})`);
    if (!terrain) continue;
    if (terrain === "water") {
      water.push({ z, r, poly: z.shape === "polygon" && !build.water?.[z.id]?.rect ? z.polygon?.points : null });
      const long = Math.max(r.w, r.h);
      const short = Math.min(r.w, r.h);
      if (!org) areas.push({ name: z.id, terrain, shape: "rect", x: r.x, y: r.y, w: r.w, h: r.h, afterPaths: true });
      else if (water[water.length - 1].poly) {
        // riacho em polígono (L/Z): linha mediana do corredor, meia-largura = metade da largura local do corredor
        // (varia ~±20%), trecho reto e largura exata em volta de cada travessia, POIs não-travessia ficam secos
        const poly = z.polygon.points;
        const inPoly = (p) => inPolygon(poly, p.position[0] + 0.5, p.position[1] + 0.5);
        const dryPois = (gd.pois ?? []).filter((p) => p.type !== "crossing" && inPoly(p)).map((p) => [p.position[0] + 0.5, p.position[1] + 0.5, p.id]);
        const cross = (gd.pois ?? []).filter((p) => p.type === "crossing" && inPoly(p)).map((p) => [p.position[0] + 0.5, p.position[1] + 0.5]);
        const line = polygonCenterline(poly, { W, H }, { step: org.river.step, dry: dryPois });
        const rr = mulberry(seed ^ hashSeed(`river:${z.id}`));
        const ph = rr() * Math.PI * 2;
        let s = 0;
        const points = line.map((p, k) => {
          if (k) s += Math.hypot(p[0] - line[k - 1][0], p[1] - line[k - 1][1]);
          const half = Math.max(1.2, Math.min(2.2, p[2] - 0.1));
          const dc = cross.length ? Math.min(...cross.map(([cx, cy]) => Math.hypot(cx - p[0], cy - p[1]))) : Infinity;
          const fixed = dc <= org.river.straight + 0.6 ? 1 : 0;
          let hw = fixed ? half : half * (0.88 + 0.17 * Math.sin(ph + (s * 2 * Math.PI) / (org.river.wavelength ?? 11)) + 0.05 * (rr() * 2 - 1));
          let [x, y] = p;
          for (const [px, py] of dryPois) {
            // POI seco: a faixa (hw) fica a ≥ 1,6 tile do centro dele; se não couber, o ponto se afasta
            const d = Math.hypot(x - px, y - py);
            if (d - hw >= 1.6) continue;
            hw = Math.max(1.1, Math.min(hw, d - 1.6));
            if (d - hw < 1.6 && d > 0) {
              const push = 1.6 + hw - d;
              x += ((x - px) / d) * push;
              y += ((y - py) / d) * push;
            }
          }
          return [x, y, hw, fixed];
        });
        for (const [, , id] of dryPois) report.push(`zona '${z.id}': POI '${id}' fica em terra (a faixa do riacho passa a ≥ 1,6 tile dele)`);
        areas.push({ name: z.id, terrain, shape: "river", points, noise: org.river.noise, bank: org.river.bank, bankWidth: org.river.bankWidth, afterPaths: true, ...(cv?.river ? { curve: { pad: cv.riverPad ?? 0.5 } } : {}) });
        report.push(`zona '${z.id}': riacho pela linha mediana do polígono (${points.length} pontos, de borda a borda: (${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}) → (${points[points.length - 1][0].toFixed(1)},${points[points.length - 1][1].toFixed(1)}), meia-largura ${Math.min(...points.map((p) => p[2])).toFixed(1)}–${Math.max(...points.map((p) => p[2])).toFixed(1)}, ${cross.length} travessia(s))`);
      } else if (long >= 2 * short) {
        // riacho: travessias (POI crossing) da zona viram trechos retos; o resto meandra
        const vertical = r.h >= r.w;
        const crossings = (gd.pois ?? []).filter((p) => p.type === "crossing").map((p) => cell(p.position)).filter(([px, py]) => px >= r.x && py >= r.y && px < r.x + r.w && py < r.y + r.h).map(([px, py]) => (vertical ? py : px));
        const inZone = (p) => {
          const [px, py] = cell(p.position);
          return px >= r.x && py >= r.y && px < r.x + r.w && py < r.y + r.h;
        };
        const dryPois = (gd.pois ?? []).filter((p) => p.type !== "crossing" && inZone(p));
        const dry = dryPois.map((p) => cell(p.position)[vertical ? 1 : 0]);
        const points = riverPoints(r, crossings, mulberry(seed ^ hashSeed(`river:${z.id}`)), org.river, { W, H }, dry);
        for (const p of dryPois) report.push(`zona '${z.id}': POI '${p.id}' (${p.type}) fica em terra: a ponta do riacho recua ${org.river.dryGap} tile(s) antes dele`);
        areas.push({ name: z.id, terrain, shape: "river", points, noise: org.river.noise, bank: org.river.bank, bankWidth: org.river.bankWidth, afterPaths: true, ...(cv?.river ? { curve: { pad: cv.riverPad ?? 0.5 } } : {}), _rect: r, _vertical: vertical });
        const ext = vertical ? [points[0][1], points[points.length - 1][1]] : [points[0][0], points[points.length - 1][0]];
        report.push(`zona '${z.id}': riacho em spline (${points.length} pontos, meia-largura ${org.river.halfWidth.join("–")}, meandro ±${org.river.meander}, ${crossings.length} trecho(s) reto(s) de ponte)${ext[0] < 0 || ext[1] > (vertical ? H : W) ? " encostado na borda do mapa (zona a ≤ " + org.river.edgeSnap + " tiles dela)" : ""}`);
      } else {
        areas.push({ name: z.id, terrain, shape: "ellipse", cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, wobble: org.clearings.wobble, organic: { nooks: 2, amp: org.clearings.amp * 0.6 }, afterPaths: true });
        report.push(`zona '${z.id}': água larga (${r.w}×${r.h}) vira lagoa orgânica`);
      }
    } else areas.push({ name: z.id, terrain, shape: "ellipse", cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2 + 0.75, ry: r.h / 2 + 0.75, wobble: org ? org.clearings.wobble : 0.08, ...(org ? { organic: { nooks: org.clearings.nooks, amp: org.clearings.amp } } : {}) });
  }

  // riacho que nasce/deságua numa lagoa: a ponta (não encostada na borda) mais perto de uma lagoa a ≤ 4 tiles
  // ganha o centro da lagoa como último ponto, sem afinar (a água corre de uma para a outra)
  const lakes = areas.filter((a) => a.terrain === "water" && a.shape === "ellipse");
  for (const a of areas) {
    if (a.shape !== "river") continue;
    const { _rect: r, _vertical: vertical } = a;
    delete a._rect;
    delete a._vertical;
    for (const end of [0, 1]) {
      const p = end ? a.points[a.points.length - 1] : a.points[0];
      if (p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H) continue;
      const lake = lakes.map((l) => ({ l, d: Math.max(0, Math.hypot(p[0] - l.cx, p[1] - l.cy) - Math.min(l.rx, l.ry)) })).filter((e) => e.d <= 4).sort((x, y) => x.d - y.d)[0]?.l;
      if (!lake) continue;
      const hw = (vertical ? r.w : r.h) / 2;
      p[2] = Math.max(p[2], hw);
      const c = [lake.cx, lake.cy, Math.min(lake.rx, lake.ry) * 0.6, 0];
      if (end) a.points.push(c);
      else a.points.unshift(c);
      report.push(`zona '${a.name}': riacho ${end ? "deságua" : "nasce"} na lagoa '${lake.name}'`);
    }
  }

  // ---- rotas → trilhas ----
  const paths = [];
  // trecho que passa a menos de waterClear tiles de uma zona de água fica reto (chega reto na ponte)
  const nearWater = (a, b) =>
    water.some(({ r, poly }) => {
      const m = org?.routes.waterClear ?? 0;
      return [0, 0.25, 0.5, 0.75, 1].some((t) => {
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        if (poly) return [[0, 0], [m, 0], [-m, 0], [0, m], [0, -m]].some(([dx, dy]) => inPolygon(poly, x + dx, y + dy));
        return x >= r.x - m && y >= r.y - m && x < r.x + r.w + m && y < r.y + r.h + m;
      });
    });
  const curveOf = (widthTiles) => (cv?.paths ? { curve: { halfWidth: halfWidthFor(widthTiles), pad: cv.pathPad ?? 0.45 } } : {});
  const routePoints = (id, wps, ov) => {
    const pts = wps.map(([x, y]) => [x + 0.5, y + 0.5]);
    if (!org || ov?.meander === false) return pts;
    const out = meanderRoute(pts, mulberry(seed ^ hashSeed(`route:${id}`)), { ...org.routes, ...(typeof ov?.meander === "object" ? ov.meander : {}) }, nearWater);
    report.push(`rota '${id}': meandro (${out.length - pts.length} pontos intermediários entre ${pts.length} waypoints)`);
    return out;
  };
  for (const rt of gd.routes) {
    const ov = build.routes?.[rt.id];
    const wps = ov?.waypoints ?? rt.waypoints;
    if (ov?.waypoints) report.push(`rota '${rt.id}': waypoints da montagem (${ov.reason ?? "ajuste do game-dev"})`);
    paths.push({ name: rt.id, terrain: "path", points: routePoints(rt.id, wps, ov), radius: radiusFor(ov?.widthTiles ?? rt.widthTiles), ...(org ? { meander: org.routes.wobble } : {}), ...curveOf(ov?.widthTiles ?? rt.widthTiles) });
  }
  for (const rt of build.extraRoutes ?? []) paths.push({ name: rt.id, terrain: "path", points: routePoints(rt.id, rt.waypoints, rt), radius: radiusFor(rt.widthTiles), ...(org ? { meander: org.routes.wobble } : {}), ...curveOf(rt.widthTiles) });
  if (cv?.paths) report.push(`trilhas contínuas (curves): ${paths.length} rota(s) como faixa de largura constante (meia-largura = 0,45 × largura da rota)`);

  // ---- pontes (POI crossing dentro de água) ----
  const bridges = [];
  for (const p of gd.pois ?? []) {
    if (p.type !== "crossing") continue;
    const [px, py] = cell(p.position);
    const w = water.find(({ r, poly }) => (poly ? inPolygon(poly, px + 0.5, py + 0.5) : px >= r.x && py >= r.y && px < r.x + r.w && py < r.y + r.h));
    if (!w) {
      report.push(`POI '${p.id}' (crossing) fora de zona de água: sem ponte`);
      continue;
    }
    const vertical = w.r.h >= w.r.w; // riacho vertical → ponte horizontal (atravessa de leste a oeste)
    const n = vertical ? w.r.w : w.r.h;
    const set = vertical ? kit.bridge.h : kit.bridge.v;
    if (org && cv?.river) {
      // riacho contínuo: eixo perpendicular ao riacho no ponto, ponte avança bridgePad tiles de terra; vau sem arte
      const kind = crossingKind(p, cv.crossingDefault ?? "bridge");
      bridges.push({ name: p.id, auto: true, axis: "auto", x: px, y: py, set: kit.bridge.h, setV: kit.bridge.v, kind, ...(kind === "bridge" ? { pad: cv.bridgePad ?? 1 } : {}) });
      report.push(`POI '${p.id}': ${kind === "ford" ? "vau (células andáveis com pedras)" : "ponte"} perpendicular ao riacho em (${px},${py})`);
      continue;
    }
    if (org) {
      // o gerador mede a faixa de água real na linha/coluna da travessia (trecho reto com a largura da zona)
      bridges.push({ name: p.id, auto: true, axis: vertical ? "h" : "v", x: px, y: py, set });
      report.push(`POI '${p.id}': ponte ${vertical ? "horizontal" : "vertical"} de ${n} tiles no trecho reto do riacho em ${vertical ? `(${w.r.x}..${w.r.x + n - 1},${py})` : `(${px},${w.r.y}..${w.r.y + n - 1})`}`);
      continue;
    }
    const detail = Array.from({ length: n }, (_, i) => (i === 0 ? set[0] : i === n - 1 ? set[2] : set[1]));
    bridges.push(vertical ? { name: p.id, x: w.r.x, y: py, w: n, h: 1, detail } : { name: p.id, x: px, y: w.r.y, w: 1, h: n, detail });
    report.push(`POI '${p.id}': ponte ${vertical ? "horizontal" : "vertical"} de ${n} tiles em ${vertical ? `(${w.r.x}..${w.r.x + n - 1},${py})` : `(${px},${w.r.y}..${w.r.y + n - 1})`}`);
  }

  // ---- saídas → portais, chegada e trilha curta ----
  const portals = [];
  const starts = {};
  for (const e of gd.exits ?? []) {
    const r = clampRect({ x: e.rect.x, y: e.rect.y, w: e.rect.width, h: e.rect.height }, W, H);
    portals.push({ name: e.id, x: r.x, y: r.y, w: r.w, h: r.h, to: e.to, toStart: e.toStart });
    areas.push({ name: `${e.id}-chao`, terrain: "clearing", shape: "rect", x: r.x, y: r.y, w: r.w, h: r.h });
    const arr = arrivalOf(e, W, H);
    starts[`from_${e.to}`] = arr;
    const edgePt = e.edge === "s" ? [arr[0], H] : e.edge === "n" ? [arr[0], -1] : e.edge === "e" ? [W, arr[1]] : [-1, arr[1]];
    paths.push({ name: `${e.id}-acesso`, terrain: "path", points: [[edgePt[0] + 0.5, edgePt[1] + 0.5], [arr[0] + 0.5, arr[1] + 0.5]], ...curveOf(2) });
  }
  // início do jogador: build.starts.player, senão a chegada da primeira saída, senão o centro da 1ª spawn_area
  const sa = gd.zones.find((z) => z.type === "spawn_area");
  const saR = sa && rectOf(sa.id);
  starts.player = build.starts?.player ?? Object.values(starts)[0] ?? (saR ? [Math.floor(saR.x + saR.w / 2), Math.floor(saR.y + saR.h / 2)] : [Math.floor(W / 2), Math.floor(H / 2)]);
  Object.assign(starts, build.starts ?? {});

  // ---- spawns ----
  const spawns = (gd.spawns ?? []).map((s) => {
    const zr = rectOf(s.zoneRef) ?? { x: 0, y: 0, w: W, h: H };
    // a sim sorteia num quadrado centro ± max(w,h)/2: raio r = retângulo 2r×2r em volta do centro da zona
    const rad = Math.max(1, Math.round(s.radiusTiles));
    const sq = { x: Math.round(zr.x + zr.w / 2 - rad), y: Math.round(zr.y + zr.h / 2 - rad), w: 2 * rad, h: 2 * rad };
    const r = intersect(sq, zr) ?? zr;
    if (r.w < sq.w || r.h < sq.h) {
      // o quadrado do raio não cabe na zona: recorta (a criatura não sai da zona do brief), mas avisa
      const eff = Math.floor(Math.min(r.w, r.h) / 2);
      const msg = `AVISO spawn '${s.id}': radiusTiles ${s.radiusTiles} recortado pela zona '${s.zoneRef}' (${zr.w}×${zr.h}) → área de sorteio ${r.w}×${r.h} tiles (raio efetivo ~${eff}, ${Math.round((100 * r.w * r.h) / (sq.w * sq.h))}% da área pedida)`;
      report.push(msg);
      warnings.push(msg);
    }
    return { name: s.id, x: r.x, y: r.y, w: r.w, h: r.h, species: [s.speciesId], levelMin: s.levelRange[0], levelMax: s.levelRange[1], count: s.count };
  });

  // ---- NPCs ----
  const npcs = (gd.npcs ?? []).map((n) => {
    const [x, y] = cell(n.position);
    return {
      name: n.id, x, y,
      properties: { displayName: n.name, kind: n.kind, role: n.role, aggressive: !!n.aggressive, ...(n.speciesId ? { speciesId: n.speciesId } : {}), ...(n.catalogRef ? { catalogRef: n.catalogRef } : {}), ...(n.dialogue ? { dialogue: n.dialogue } : {}), behavior: n.behavior ?? "static" },
    };
  });

  // ---- POIs e interativos ----
  const pois = (gd.pois ?? []).map((p) => {
    const [x, y] = cell(p.position);
    return { name: p.id, x, y, kind: p.type, properties: { title: p.name, ...(p.description ? { description: p.description } : {}) } };
  });
  const fixedProps = [];
  for (const it of gd.interactables ?? []) {
    const [x, y] = cell(it.position);
    pois.push({ name: it.id, x, y, kind: it.type, properties: { interactable: true, title: it.description, text: signText(it), ...(it.effect ? { effect: it.effect } : {}) } });
    // placa que indica direção (norte/sul/leste/oeste ou seta no texto) usa a placa com seta, se o kit tiver
    const arrow = it.type === "sign" && kit.interactables.sign_arrow && (/sign_post_arrow/.test(it.altAssetRef ?? "") || /\b(norte|sul|leste|oeste)\b|[←↑→↓]/i.test(signText(it)));
    const k = (arrow ? kit.interactables.sign_arrow : kit.interactables[it.type]) ?? kit.interactables.other;
    fixedProps.push({ x, y, key: k.key, solid: !!k.solid, force: true, ox: k.ox ?? 0, oy: k.oy ?? 0, ...(k.openKey ? { openKey: k.openKey } : {}) });
  }
  // NPC humano: corpo parado (sprite do kit) na célula do NPC; o gate aceita o NPC sobre o próprio corpo
  for (const n of gd.npcs ?? []) {
    const s = npcSpriteOf(n, kit);
    if (!s) continue;
    const [x, y] = cell(n.position);
    fixedProps.push({ x, y, key: s.key, solid: !!s.solid, force: true, npc: n.id, oy: 0 });
    report.push(`NPC '${n.id}': sprite ${s.key}${s.solid ? " (sólido)" : ""}`);
  }
  // entrada secreta (POI secret_entrance): arbusto denso do kit, não sólido (passa-se por ele)
  for (const p of gd.pois ?? []) {
    if (p.type !== "secret_entrance" || !kit.secretEntrance) continue;
    const [x, y] = cell(p.position);
    fixedProps.push({ x, y, key: kit.secretEntrance.key, solid: !!kit.secretEntrance.solid, force: true });
    report.push(`POI '${p.id}': entrada secreta com ${kit.secretEntrance.key}`);
  }

  // ---- arena do chefe ----
  let bossArena;
  const triggers = [];
  const arenaDetails = [];
  if (gd.bossArena) {
    const a = gd.bossArena;
    const [px, py] = cell(a.position);
    const rad = Math.round(a.radiusTiles);
    const r = rectOf(a.zoneRef) ?? clampRect({ x: px - rad, y: py - rad, w: 2 * rad + 1, h: 2 * rad + 1 }, W, H);
    bossArena = { name: a.id, x: r.x, y: r.y, w: r.w, h: r.h, boss: a.bossId, properties: { triggerType: a.triggerType ?? "approach", arenaType: a.arenaType ?? "", centerX: px, centerY: py } };
    // chão da arena (kit.arenaFloor, ex. boss_arena_floor do forest-v7): decalques esparsos em ground_detail em volta do
    // centro (o PNG tem moldura de grama, então como terreno inteiro viraria adesivo repetido)
    if (kit.arenaFloor) {
      const rr = mulberry(seed ^ hashSeed(`arena:${a.id}`));
      const n = kit.arenaFloor.count ?? 6;
      const spots = [[0, 0]];
      for (let k = 0; spots.length < n && k < 60; k++) {
        const ang = rr() * Math.PI * 2;
        const d = 1.6 + rr() * Math.min(2.6, Math.min(r.w, r.h) / 2 - 1);
        const s2 = [Math.round(Math.cos(ang) * d), Math.round(Math.sin(ang) * d)];
        if (spots.every(([x, y]) => Math.max(Math.abs(x - s2[0]), Math.abs(y - s2[1])) >= 2)) spots.push(s2);
      }
      arenaDetails.push(...spots.map(([dx, dy]) => ({ x: px + dx, y: py + dy, key: kit.arenaFloor.key, avoidPath: true, on: "clearing" })).filter((d) => d.x >= r.x && d.y >= r.y && d.x < r.x + r.w && d.y < r.y + r.h));
      report.push(`arena '${a.id}': ${arenaDetails.length} decalques de ${kit.arenaFloor.key} no chão`);
    }
    triggers.push({ name: `${a.id}-entrada`, x: r.x, y: r.y, w: r.w, h: r.h, properties: { event: "boss_approach", boss: a.bossId } });
  }

  // ---- props (vegetação por zona) ----
  const props = [{ kind: "grid", on: "forest", dx: 44, dy: 40, jitter: 10, edgeSkip: 0.12, solid: true, pick: kit.trees }];
  for (const z of gd.zones) {
    const terrain = kit.zoneTerrain[z.type];
    if (terrain !== "clearing") continue;
    const r = rectOf(z.id);
    const d = kit.density[densityOf(z)] ?? kit.density.medium;
    const area = r.w * r.h;
    const within = { x: r.x, y: r.y, w: r.w, h: r.h };
    const nPatch = Math.round((area / 100) * d.patches);
    if (nPatch > 0 && z.type !== "boss_arena") {
      // manchas espalhadas na zona, em posições fixas por zona (determinístico, sem RNG)
      const patches = Array.from({ length: nPatch }, (_, i) => {
        const fx = [0.25, 0.75, 0.5, 0.2, 0.8, 0.4][i % 6];
        const fy = [0.3, 0.7, 0.5, 0.75, 0.25, 0.15][i % 6];
        return [r.x + r.w * fx, r.y + r.h * fy, 1.8];
      });
      props.push({ kind: "patches", on: "clearing", keys: kit.tallGrass, patches, skip: 0.2 });
    }
    if (d.flowers) props.push({ kind: "scatter", on: "clearing", within, keys: kit.flowers, count: Math.round((area / 100) * d.flowers), offset: [6, 14, 20, 16] });
    if (d.mushrooms) props.push({ kind: "scatter", on: "clearing", within, keys: kit.mushrooms, count: Math.round((area / 100) * d.mushrooms), offset: [8, 20, 16, 10] });
    if (z.type === "rock_field") {
      props.push({ kind: "scatter", on: "clearing", within, keys: kit.rocks.solid, count: Math.round((area / 100) * kit.rockField.solidPer100), solid: true, avoidPath: true, offset: [16, 28, 0, 0] });
      props.push({ kind: "scatter", on: "clearing", within, keys: kit.rocks.decor, count: Math.round((area / 100) * kit.rockField.decorPer100), offset: [8, 18, 16, 12] });
    }
  }
  props.push({ kind: "edge", on: "clearing", adjacentTo: "forest", side: "north", chance: 0.3, keys: kit.edgeLitter });
  if (fixedProps.length) props.push({ kind: "fixed", at: fixedProps });

  const brief = {
    briefVersion: "0.1",
    id: gd.id,
    _doc: `Gerado por adapt-brief.mjs a partir do brief do game-design '${gd.id}' (schemaVersion 1) com o kit '${kit.id}'. Não editar à mão: edite o brief e/ou o .build.json e rode de novo.`,
    ...(build.out ? { out: build.out } : {}),
    profile: build.profile ?? "factory-v1",
    seed,
    size: { width: W, height: H, tile: T },
    properties: {
      biome: gd.biome,
      regionName: gd.name,
      ...(gd.regionRef ? { regionRef: gd.regionRef } : {}),
      ...(gd.levelRange ? { levelMin: gd.levelRange[0], levelMax: gd.levelRange[1] } : {}),
      safeZone: !!gd.safeZone,
      briefSchema: "game-design/map-brief v1",
      kit: kit.id,
    },
    pack: kit.pack,
    terrains: kit.terrains,
    base: kit.base,
    areas,
    paths,
    bridges,
    props,
    starts,
    spawns,
    npcs,
    pois,
    ...(bossArena ? { bossArena } : {}),
    triggers,
    portals,
    ...(org ? { organic: { borderJitter: org.borderJitter } } : {}),
    ...(kit.fordStones ? { fordStones: kit.fordStones } : {}),
    ...(arenaDetails.length ? { details: arenaDetails } : {}),
  };
  return { brief, report, warnings };
}
