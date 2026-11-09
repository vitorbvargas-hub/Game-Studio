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
  const seed = build.seed ?? hashSeed(gd.id);
  const areas = [];
  const water = [];
  for (const z of gd.zones) {
    const terrain = kit.zoneTerrain[z.type];
    const r = clampRect(build.water?.[z.id]?.rect ?? zoneRect(z), W, H);
    if (terrain === undefined) report.push(`zona '${z.id}': tipo '${z.type}' sem terreno no kit (fica ${kit.base})`);
    if (!terrain) continue;
    if (terrain === "water") {
      water.push({ z, r });
      const long = Math.max(r.w, r.h);
      const short = Math.min(r.w, r.h);
      if (!org) areas.push({ name: z.id, terrain, shape: "rect", x: r.x, y: r.y, w: r.w, h: r.h, afterPaths: true });
      else if (long >= 2 * short) {
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
        areas.push({ name: z.id, terrain, shape: "river", points, noise: org.river.noise, bank: org.river.bank, bankWidth: org.river.bankWidth, afterPaths: true });
        const ext = vertical ? [points[0][1], points[points.length - 1][1]] : [points[0][0], points[points.length - 1][0]];
        report.push(`zona '${z.id}': riacho em spline (${points.length} pontos, meia-largura ${org.river.halfWidth.join("–")}, meandro ±${org.river.meander}, ${crossings.length} trecho(s) reto(s) de ponte)${ext[0] < 0 || ext[1] > (vertical ? H : W) ? " encostado na borda do mapa (zona a ≤ " + org.river.edgeSnap + " tiles dela)" : ""}`);
      } else {
        areas.push({ name: z.id, terrain, shape: "ellipse", cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2, ry: r.h / 2, wobble: org.clearings.wobble, organic: { nooks: 2, amp: org.clearings.amp * 0.6 }, afterPaths: true });
        report.push(`zona '${z.id}': água larga (${r.w}×${r.h}) vira lagoa orgânica`);
      }
    } else areas.push({ name: z.id, terrain, shape: "ellipse", cx: r.x + r.w / 2, cy: r.y + r.h / 2, rx: r.w / 2 + 0.75, ry: r.h / 2 + 0.75, wobble: org ? org.clearings.wobble : 0.08, ...(org ? { organic: { nooks: org.clearings.nooks, amp: org.clearings.amp } } : {}) });
  }

  // ---- rotas → trilhas ----
  const paths = [];
  // trecho que passa a menos de waterClear tiles de uma zona de água fica reto (chega reto na ponte)
  const nearWater = (a, b) =>
    water.some(({ r }) => {
      const m = org?.routes.waterClear ?? 0;
      return [0, 0.25, 0.5, 0.75, 1].some((t) => {
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        return x >= r.x - m && y >= r.y - m && x < r.x + r.w + m && y < r.y + r.h + m;
      });
    });
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
    paths.push({ name: rt.id, terrain: "path", points: routePoints(rt.id, wps, ov), radius: radiusFor(ov?.widthTiles ?? rt.widthTiles), ...(org ? { meander: org.routes.wobble } : {}) });
  }
  for (const rt of build.extraRoutes ?? []) paths.push({ name: rt.id, terrain: "path", points: routePoints(rt.id, rt.waypoints, rt), radius: radiusFor(rt.widthTiles), ...(org ? { meander: org.routes.wobble } : {}) });

  // ---- pontes (POI crossing dentro de água) ----
  const bridges = [];
  for (const p of gd.pois ?? []) {
    if (p.type !== "crossing") continue;
    const [px, py] = cell(p.position);
    const w = water.find(({ r }) => px >= r.x && py >= r.y && px < r.x + r.w && py < r.y + r.h);
    if (!w) {
      report.push(`POI '${p.id}' (crossing) fora de zona de água: sem ponte`);
      continue;
    }
    const vertical = w.r.h >= w.r.w; // riacho vertical → ponte horizontal (atravessa de leste a oeste)
    const n = vertical ? w.r.w : w.r.h;
    const set = vertical ? kit.bridge.h : kit.bridge.v;
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
    paths.push({ name: `${e.id}-acesso`, terrain: "path", points: [[edgePt[0] + 0.5, edgePt[1] + 0.5], [arr[0] + 0.5, arr[1] + 0.5]] });
  }
  // início do jogador: build.starts.player, senão a chegada da primeira saída, senão o centro da 1ª spawn_area
  const sa = gd.zones.find((z) => z.type === "spawn_area");
  const saR = sa && rectOf(sa.id);
  starts.player = build.starts?.player ?? Object.values(starts)[0] ?? (saR ? [Math.floor(saR.x + saR.w / 2), Math.floor(saR.y + saR.h / 2)] : [Math.floor(W / 2), Math.floor(H / 2)]);
  Object.assign(starts, build.starts ?? {});

  // ---- spawns ----
  const spawns = (gd.spawns ?? []).map((s) => {
    const zr = rectOf(s.zoneRef) ?? { x: 0, y: 0, w: W, h: H };
    const cx = Math.floor(zr.x + zr.w / 2);
    const cy = Math.floor(zr.y + zr.h / 2);
    const rad = Math.max(1, Math.round(s.radiusTiles));
    const sq = { x: cx - rad, y: cy - rad, w: 2 * rad + 1, h: 2 * rad + 1 };
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
    const k = kit.interactables[it.type] ?? kit.interactables.other;
    fixedProps.push({ x, y, key: k.key, solid: !!k.solid, force: true, ox: k.ox ?? 0, oy: k.oy ?? 0 });
  }

  // ---- arena do chefe ----
  let bossArena;
  const triggers = [];
  if (gd.bossArena) {
    const a = gd.bossArena;
    const [px, py] = cell(a.position);
    const rad = Math.round(a.radiusTiles);
    const r = rectOf(a.zoneRef) ?? clampRect({ x: px - rad, y: py - rad, w: 2 * rad + 1, h: 2 * rad + 1 }, W, H);
    bossArena = { name: a.id, x: r.x, y: r.y, w: r.w, h: r.h, boss: a.bossId, properties: { triggerType: a.triggerType ?? "approach", arenaType: a.arenaType ?? "", centerX: px, centerY: py } };
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
  };
  return { brief, report, warnings };
}
