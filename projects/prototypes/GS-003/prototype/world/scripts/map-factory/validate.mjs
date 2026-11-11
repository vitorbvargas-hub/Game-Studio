// Map Factory — validador de mapas Tiled (.tmj.json). Gates pass/fail (briefing 12_map_factory_v2 §7, ADR-011):
//   layers      camadas obrigatórias do perfil (legacy: ground + objetos; factory-v1: as 9 camadas do §4)
//   tile_ids    todo gid existe num tileset, sem bits de flip, com propriedade `key`; dados do tamanho do mapa
//   asset_keys  toda chave visual (tiles e props) resolve num PNG do pacote/biblioteca (dia e, se houver, noite)
//   reach       BFS (4 vizinhos) na colisão a partir do início `player` chega a 100% dos inícios, spawns, NPCs,
//               POIs, portais e arena de chefe
//   placement   nenhum início, centro de spawn ou NPC em célula bloqueada, sobre portal ou empilhado em outro
//   wang        máscaras de autotile (`*_w47_<m>` 8 vizinhos, `*_blob_<m>` 4 vizinhos, `*_c16_<m>` cantos) coerentes
//               com os vizinhos
//   species     espécies dos spawns existem em world-species.json; níveis e contagem válidos
//   portals     destino (`to`) é um mapa conhecido; `toStart` existe lá, é livre e não cai sobre outro portal
// Puro: o contexto (espécies, outros mapas, resolvedor de assets) vem de fora (context.mjs).

import { GID_FLAGS, allObjects, gidTable, objectCells, prop, propSolidCells, solidGrid } from "./tiled.mjs";

export const PROFILES = {
  legacy: { tile: ["ground"], object: [], anyObjectLayer: true },
  "factory-v1": { tile: ["ground", "ground_detail"], object: ["objects_below", "objects_above", "collision", "spawns", "npcs", "triggers", "poi"], anyObjectLayer: false },
};
/** Em qual camada cada classe de objeto deve ficar no perfil factory-v1 (aviso, não falha). */
const FACTORY_LAYER_OF = { prop: ["objects_below", "objects_above"], collision: ["collision"], start: ["spawns"], spawn: ["spawns"], npc: ["npcs"], portal: ["triggers"], trigger: ["triggers"], poi: ["poi"], boss_arena: ["poi"] };

const MAX_LIST = 25;
const gate = (id, title) => ({ id, title, status: "pass", errors: [], warnings: [], info: [] });
const fail = (g, msg) => {
  g.status = "fail";
  if (g.errors.length < MAX_LIST) g.errors.push(msg);
  else if (g.errors.length === MAX_LIST) g.errors.push("…(mais erros omitidos)");
};
const warn = (g, msg) => {
  if (g.warnings.length < MAX_LIST) g.warnings.push(msg);
};

/** Perfil do mapa: propriedade `mapProfile` do .tmj, senão legacy. */
export function profileOf(m) {
  const p = prop(m.properties, "mapProfile");
  return typeof p === "string" && PROFILES[p] ? p : "legacy";
}

/** Inícios (objetos `start`) em células. */
export function startsOf(m) {
  const T = m.tilewidth;
  return allObjects(m)
    .filter((o) => o.cls === "start")
    .map((o) => ({ name: o.name || "player", x: Math.floor(o.x / T), y: Math.floor(o.y / T), o }));
}

/** Retângulo do portal em px contém a célula (centro)? */
const portalHasCell = (p, x, y, T) => {
  const px = x * T + T / 2;
  const py = y * T + T / 2;
  return px >= p.x && px < p.x + (p.width ?? T) && py >= p.y && py < p.y + (p.height ?? T);
};

const AUTOTILE_RE = /^(.*_(w47|blob|c16))_(\d+)$/;

/** Máscara esperada da célula (x,y) para a família, sob uma política de "fora do mapa". */
function expectedMask(inFam, x, y, W, H, mode, outside) {
  const same = (a, b) => {
    if (a < 0 || b < 0 || a >= W || b >= H) {
      if (outside === "in") return true;
      if (outside === "out") return false;
      return inFam(Math.max(0, Math.min(W - 1, a)), Math.max(0, Math.min(H - 1, b)));
    }
    return inFam(a, b);
  };
  if (mode === "c16") {
    // corner16 (Wang por cantos): canto ligado quando as 4 células em volta dele são da família (NW8 NE4 SW2 SE1)
    const c = (dx, dy) => same(x + dx, y + dy);
    return (c(-1, -1) && c(0, -1) && c(-1, 0) ? 8 : 0) | (c(1, -1) && c(0, -1) && c(1, 0) ? 4 : 0) | (c(-1, 1) && c(0, 1) && c(-1, 0) ? 2 : 0) | (c(1, 1) && c(0, 1) && c(1, 0) ? 1 : 0);
  }
  const N = same(x, y - 1);
  const E = same(x + 1, y);
  const S = same(x, y + 1);
  const Wn = same(x - 1, y);
  let m = (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (Wn ? 8 : 0);
  if (mode === "w47") m |= (N && E && same(x + 1, y - 1) ? 16 : 0) | (S && E && same(x + 1, y + 1) ? 32 : 0) | (S && Wn && same(x - 1, y + 1) ? 64 : 0) | (N && Wn && same(x - 1, y - 1) ? 128 : 0);
  return m;
}

/** Máscara w47 normalizada: um bit diagonal só pode existir com as duas bordas vizinhas a ele. */
export function isNormalizedW47(m) {
  const [N, E, S, Wn] = [m & 1, m & 2, m & 4, m & 8];
  return !((m & 16 && !(N && E)) || (m & 32 && !(S && E)) || (m & 64 && !(S && Wn)) || (m & 128 && !(N && Wn)));
}

/**
 * Valida um mapa. ctx: { species?: Set<string>, maps?: Record<id, tmj>, assets?: (key) => {day:boolean, night:boolean|null} | null,
 * profile?: string }. Devolve { map, profile, ok, gates, stats }.
 */
export function validateMap(id, m, ctx = {}) {
  const W = m.width;
  const H = m.height;
  const T = m.tilewidth;
  const profile = ctx.profile ?? profileOf(m);
  const gates = [];
  const objs = allObjects(m);
  const gids = gidTable(m);
  const tileLayers = (m.layers ?? []).filter((l) => l.type === "tilelayer");

  // ---- layers ----
  {
    const g = gate("layers", "Camadas obrigatórias presentes");
    const P = PROFILES[profile];
    const names = (type) => (m.layers ?? []).filter((l) => l.type === type).map((l) => l.name);
    for (const n of P.tile) if (!names("tilelayer").includes(n)) fail(g, `camada de tiles '${n}' ausente`);
    for (const n of P.object) if (!names("objectgroup").includes(n)) fail(g, `camada de objetos '${n}' ausente`);
    if (P.anyObjectLayer && names("objectgroup").length === 0) fail(g, "nenhuma camada de objetos");
    if (m.orientation && m.orientation !== "orthogonal") fail(g, `orientação '${m.orientation}' (o motor só lê orthogonal)`);
    if (m.tilewidth !== m.tileheight) fail(g, "tiles não quadrados");
    if (profile === "factory-v1")
      for (const o of objs) {
        const want = FACTORY_LAYER_OF[o.cls];
        if (want && !want.includes(o.layer)) warn(g, `objeto ${o.cls} '${o.name || o.id}' na camada '${o.layer}' (esperado: ${want.join("/")})`);
      }
    else {
      const missing = [...PROFILES["factory-v1"].tile.filter((n) => !names("tilelayer").includes(n)), ...PROFILES["factory-v1"].object.filter((n) => !names("objectgroup").includes(n))];
      if (missing.length) g.info.push(`perfil legacy; para factory-v1 faltariam: ${missing.join(", ")}`);
    }
    gates.push(g);
  }

  // ---- tile_ids ----
  {
    const g = gate("tile_ids", "IDs de tile existentes");
    for (const ts of m.tilesets ?? []) {
      if (ts.source) fail(g, `tileset externo '${ts.source}' (o motor só lê tilesets embutidos)`);
      for (const t of ts.tiles ?? []) if (prop(t.properties, "key") === undefined) warn(g, `tile ${ts.firstgid + t.id} do tileset '${ts.name}' sem propriedade key`);
    }
    for (const l of tileLayers) {
      if ((l.data ?? []).length !== W * H) fail(g, `camada '${l.name}': ${l.data?.length} células, esperado ${W * H}`);
      const bad = new Map();
      (l.data ?? []).forEach((gidv, i) => {
        if (!gidv) return;
        if (gidv & GID_FLAGS) bad.set(`gid ${gidv} com flip/rotação`, i);
        else if (!gids.has(gidv)) bad.set(`gid ${gidv} sem tile`, i);
      });
      for (const [msg, i] of bad) fail(g, `camada '${l.name}': ${msg} (ex. célula ${i % W},${Math.floor(i / W)})`);
    }
    for (const o of objs) if (o.cls === "prop" && !prop(o.properties, "key")) fail(g, `prop #${o.id} sem key`);
    gates.push(g);
  }

  // ---- asset_keys ----
  {
    const g = gate("asset_keys", "Chaves visuais resolvem em PNG (dia/noite)");
    if (!ctx.assets) {
      g.status = "skip";
      g.info.push("sem resolvedor de assets no contexto");
    } else {
      const keys = new Set();
      for (const l of tileLayers) for (const gidv of l.data ?? []) if (gidv && gids.has(gidv)) keys.add(gids.get(gidv).key);
      for (const o of objs) if (o.cls === "prop" && prop(o.properties, "key")) keys.add(String(prop(o.properties, "key")));
      // 2º estado do prop (baú aberto) e texturas das curvas (faixa cheia + chão embaixo)
      for (const o of objs) if (o.cls === "prop" && prop(o.properties, "openKey")) keys.add(String(prop(o.properties, "openKey")));
      for (const o of objs)
        if (o.cls === "curve") for (const k of [prop(o.properties, "fill"), ...String(prop(o.properties, "ground") ?? "").split(",")]) if (k) keys.add(String(k));
      for (const k of keys) {
        const r = ctx.assets(k);
        if (!r.day) fail(g, `'${k}' sem imagem (placeholder)`);
        else if (r.night === false) fail(g, `'${k}' sem versão noturna no pacote`);
      }
      g.info.push(`${keys.size} chaves verificadas`);
    }
    gates.push(g);
  }

  // ---- grade de colisão + BFS ----
  const { solid, why } = solidGrid(m);
  const starts = startsOf(m);
  const player = starts.find((s) => s.name === "player");
  const seen = new Uint8Array(W * H);
  const isFree = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !solid[y * W + x];
  if (player && isFree(player.x, player.y)) {
    const q = [player.y * W + player.x];
    seen[q[0]] = 1;
    for (let h = 0; h < q.length; h++) {
      const x = q[h] % W;
      const y = Math.floor(q[h] / W);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (isFree(nx, ny) && !seen[ny * W + nx]) {
          seen[ny * W + nx] = 1;
          q.push(ny * W + nx);
        }
      }
    }
  }
  const reached = (x, y) => x >= 0 && y >= 0 && x < W && y < H && seen[y * W + x] === 1;
  // NPC com corpo (prop com `npc` = nome do NPC, ex. o ranger parado do forest-v7): a célula dele é sólida pelo próprio
  // corpo; vale chegar ao lado (como um POI sólido) e ele não conta como bloqueado por si mesmo
  const bodyCells = new Map();
  for (const o of objs) if (o.cls === "prop" && prop(o.properties, "npc")) for (const [x, y] of propSolidCells(o, T)) bodyCells.set(`${x},${y}`, `${prop(o.properties, "npc")}`);
  const ownBody = (name, x, y) => bodyCells.get(`${x},${y}`) === name;
  const nearReached = (x, y) => reached(x, y) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => reached(x + dx, y + dy));
  const anyReached = (r) => {
    for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (reached(x, y)) return true;
    return false;
  };
  const spawnCenter = (o) => ({ x: Math.floor((o.x + (o.width ?? 0) / 2) / T), y: Math.floor((o.y + (o.height ?? 0) / 2) / T) });

  // ---- reach ----
  const targets = { start: 0, spawn: 0, npc: 0, poi: 0, boss_arena: 0, portal: 0 };
  let reachedCount = 0;
  {
    const g = gate("reach", "BFS do início do jogador alcança 100% dos alvos");
    if (!player) fail(g, "sem início 'player'");
    else if (!isFree(player.x, player.y)) fail(g, `início 'player' (${player.x},${player.y}) em célula bloqueada`);
    const check = (kind, label, ok) => {
      targets[kind]++;
      if (ok) reachedCount++;
      else fail(g, `${kind} '${label}' inalcançável`);
    };
    if (player) {
      for (const s of starts) check("start", s.name, reached(s.x, s.y));
      for (const o of objs) {
        if (o.cls === "spawn") {
          const c = spawnCenter(o);
          check("spawn", o.name || `#${o.id}`, reached(c.x, c.y));
        } else if (o.cls === "npc") {
          const x = Math.floor(o.x / T);
          const y = Math.floor(o.y / T);
          check("npc", o.name || `#${o.id}`, ownBody(o.name, x, y) ? nearReached(x, y) : reached(x, y));
        }
        else if (o.cls === "poi") {
          // POI pode ser um objeto sólido (santuário, baú): vale chegar ao lado dele
          const r = objectCells(o, T);
          check("poi", o.name || `#${o.id}`, anyReached({ x0: r.x0 - 1, y0: r.y0 - 1, x1: r.x1 + 1, y1: r.y1 + 1 }));
        } else if (o.cls === "boss_arena") check("boss_arena", o.name || `#${o.id}`, anyReached(objectCells(o, T)));
        else if (o.cls === "portal") check("portal", o.name || `#${o.id}`, anyReached(objectCells(o, T)));
        else if (o.cls === "trigger" && !anyReached(objectCells(o, T))) warn(g, `trigger '${o.name || o.id}' inalcançável`);
      }
    }
    const total = Object.values(targets).reduce((a, b) => a + b, 0);
    g.info.push(`alvos alcançados: ${reachedCount}/${total} (${Object.entries(targets).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(", ")})`);
    gates.push(g);
  }

  // ---- placement ----
  {
    const g = gate("placement", "Inícios, spawns e NPCs fora de célula bloqueada e sem sobreposição");
    const portals = objs.filter((o) => o.cls === "portal");
    const occupied = new Map();
    const blockedBy = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? "fora do mapa" : solid[y * W + x] ? why.get(y * W + x) : null);
    const place = (kind, label, x, y, { exclusive }) => {
      const b = kind === "npc" && ownBody(label, x, y) ? null : blockedBy(x, y);
      if (b) fail(g, `${kind} '${label}' em (${x},${y}) bloqueado por ${b}`);
      const p = portals.find((pp) => portalHasCell(pp, x, y, T));
      if (p) fail(g, `${kind} '${label}' em (${x},${y}) sobre o portal '${p.name}'`);
      const k = `${x},${y}`;
      if (exclusive && occupied.has(k)) fail(g, `${kind} '${label}' em (${x},${y}) sobreposto a ${occupied.get(k)}`);
      if (exclusive) occupied.set(k, `${kind} '${label}'`);
    };
    // inícios com o mesmo ponto (player = from_x, comum) não contam como sobreposição entre si
    for (const s of starts) place("start", s.name, s.x, s.y, { exclusive: false });
    for (const s of starts) occupied.set(`${s.x},${s.y}`, `start '${s.name}'`);
    for (const o of objs.filter((v) => v.cls === "npc")) place("npc", o.name || `#${o.id}`, Math.floor(o.x / T), Math.floor(o.y / T), { exclusive: true });
    for (const o of objs.filter((v) => v.cls === "spawn")) {
      const c = spawnCenter(o);
      place("spawn", o.name || `#${o.id}`, c.x, c.y, { exclusive: false });
      // a sim sorteia num quadrado centro ± max(w,h)/2: conta células livres e livres-mas-isoladas (bolsões)
      const rad = Math.max(o.width ?? 0, o.height ?? 0) / 2 / T;
      let free = 0;
      let pocket = 0;
      let all = 0;
      for (let y = Math.floor(c.y + 0.5 - rad); y <= Math.floor(c.y + 0.5 + rad); y++)
        for (let x = Math.floor(c.x + 0.5 - rad); x <= Math.floor(c.x + 0.5 + rad); x++) {
          all++;
          if (isFree(x, y)) {
            free++;
            if (player && !reached(x, y)) pocket++;
          }
        }
      const count = Number(prop(o.properties, "count") ?? 1);
      if (free < count) fail(g, `spawn '${o.name}': ${free} células livres para ${count} criaturas`);
      if (free / all < 0.4) warn(g, `spawn '${o.name}': só ${Math.round((100 * free) / all)}% da área de sorteio é livre (a sim cai no centro após 12 tentativas)`);
      if (pocket) warn(g, `spawn '${o.name}': ${pocket} células livres da área de sorteio fora do alcance do jogador (bolsões)`);
    }
    gates.push(g);
  }

  // ---- wang ----
  {
    const g = gate("wang", "Máscaras de autotile coerentes entre vizinhos");
    let checked = 0;
    for (const l of tileLayers) {
      // `autotile`: peça decorada que ocupa o lugar de um membro da família (forest-v12: o lip da borda norte do
      // mirante vale como o mirante_top_blob_<m> que substituiu), conferida com a máscara desse membro
      const keyAt = (l.data ?? []).map((gidv) => (gidv && gids.has(gidv) ? (gids.get(gidv).autotile ?? gids.get(gidv).key) : ""));
      const fams = new Map();
      keyAt.forEach((k, i) => {
        const r = AUTOTILE_RE.exec(k);
        if (!r) return;
        if (!fams.has(r[1])) fams.set(r[1], { mode: r[2] === "w47" ? "w47" : r[2] === "c16" ? "c16" : "blob16", cells: [] });
        fams.get(r[1]).cells.push([i, Number(r[3])]);
      });
      for (const [fam, f] of fams) {
        const inFam = (x, y) => keyAt[y * W + x].startsWith(fam + "_") && AUTOTILE_RE.exec(keyAt[y * W + x])?.[1] === fam;
        for (const [i, mk] of f.cells) {
          if (f.mode === "w47" ? mk > 255 || !isNormalizedW47(mk) : mk > 15) fail(g, `'${fam}_${mk}' em (${i % W},${Math.floor(i / W)}): máscara inválida para ${f.mode}`);
        }
        // a política de "fora do mapa" é do conjunto (trilha repete a borda, mata conta como dentro...): vale a que bater
        const policies = ["in", "out", "clamp"].map((pol) => ({ pol, bad: f.cells.filter(([i, mk]) => expectedMask(inFam, i % W, Math.floor(i / W), W, H, f.mode, pol) !== mk) }));
        policies.sort((a, b) => a.bad.length - b.bad.length);
        const best = policies[0];
        checked += f.cells.length;
        if (best.bad.length)
          for (const [i, mk] of best.bad) {
            const x = i % W;
            const y = Math.floor(i / W);
            fail(g, `camada '${l.name}' ${fam}: (${x},${y}) tem máscara ${mk}, vizinhos pedem ${expectedMask(inFam, x, y, W, H, f.mode, best.pol)}`);
          }
        else g.info.push(`${l.name}/${fam}: ${f.cells.length} tiles ${f.mode}, borda '${best.pol}'`);
      }
    }
    if (!checked) g.info.push("sem tiles de autotile");
    gates.push(g);
  }

  // ---- species ----
  {
    const g = gate("species", "Espécies dos spawns existem em world-species.json");
    if (!ctx.species) {
      g.status = "skip";
      g.info.push("sem lista de espécies no contexto");
    } else
      for (const o of objs.filter((v) => v.cls === "spawn")) {
        const sp = String(prop(o.properties, "species") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
        if (!sp.length) fail(g, `spawn '${o.name}' sem espécies`);
        for (const s of sp) if (!ctx.species.has(s)) fail(g, `spawn '${o.name}': espécie '${s}' não existe`);
        const lo = Number(prop(o.properties, "levelMin") ?? 1);
        const hi = Number(prop(o.properties, "levelMax") ?? 1);
        const n = Number(prop(o.properties, "count") ?? 1);
        if (!(lo >= 1 && hi >= lo)) fail(g, `spawn '${o.name}': níveis ${lo}–${hi} inválidos`);
        if (!(n >= 1)) fail(g, `spawn '${o.name}': count ${n} inválido`);
        if (!(o.width > 0 && o.height > 0)) fail(g, `spawn '${o.name}' sem área (width/height)`);
      }
    gates.push(g);
  }

  // ---- portals ----
  {
    const g = gate("portals", "Portais com destino válido");
    for (const p of objs.filter((v) => v.cls === "portal")) {
      const to = prop(p.properties, "to");
      const toStart = String(prop(p.properties, "toStart") ?? "player");
      if (!to) {
        fail(g, `portal '${p.name}' sem 'to'`);
        continue;
      }
      const touchesEdge = p.x <= 0 || p.y <= 0 || p.x + (p.width ?? T) >= W * T || p.y + (p.height ?? T) >= H * T;
      if (!touchesEdge) warn(g, `portal '${p.name}' não encosta na borda do mapa`);
      const dest = ctx.maps?.[to];
      if (!dest) {
        fail(g, `portal '${p.name}': destino '${to}' não é um mapa conhecido`);
        continue;
      }
      const ds = startsOf(dest).find((s) => s.name === toStart);
      if (!ds) {
        fail(g, `portal '${p.name}': '${to}' não tem o início '${toStart}'`);
        continue;
      }
      const dsolid = solidGrid(dest).solid;
      if (dsolid[ds.y * dest.width + ds.x]) fail(g, `portal '${p.name}': início '${to}.${toStart}' em célula bloqueada`);
      const dp = allObjects(dest).find((o) => o.cls === "portal" && portalHasCell(o, ds.x, ds.y, dest.tilewidth));
      if (dp) fail(g, `portal '${p.name}': início '${to}.${toStart}' cai sobre o portal '${dp.name}' (volta na hora)`);
      if (!allObjects(dest).some((o) => o.cls === "portal" && prop(o.properties, "to") === id)) warn(g, `'${to}' não tem portal de volta para '${id}'`);
    }
    gates.push(g);
  }

  const free = solid.reduce((a, v) => a + (v ? 0 : 1), 0);
  const reachN = seen.reduce((a, v) => a + v, 0);
  const stats = {
    size: `${W}x${H}`,
    tileSize: T,
    tileLayers: tileLayers.length,
    objects: objs.length,
    byClass: objs.reduce((a, o) => ((a[o.cls || "?"] = (a[o.cls || "?"] ?? 0) + 1), a), {}),
    solidPct: Math.round((1000 * (W * H - free)) / (W * H)) / 10,
    reachablePctOfFree: free ? Math.round((1000 * reachN) / free) / 10 : 0,
  };
  return { map: id, profile, ok: gates.every((g) => g.status !== "fail"), gates, stats };
}

/** Relatório em Markdown (pt-BR) de um ou mais resultados. */
export function reportMarkdown(results, { title = "Validação de mapas", date } = {}) {
  const L = [`# ${title}`, ""];
  if (date) L.push(`- **Data:** ${date}`, "");
  L.push("| Mapa | Perfil | " + results[0].gates.map((g) => g.id).join(" | ") + " | Resultado |");
  L.push("|---|---|" + results[0].gates.map(() => "---").join("|") + "|---|");
  const icon = (s) => (s === "pass" ? "✅" : s === "fail" ? "❌" : "⏭️");
  for (const r of results) L.push(`| ${r.map} | ${r.profile} | ${r.gates.map((g) => icon(g.status)).join(" | ")} | ${r.ok ? "**PASS**" : "**FAIL**"} |`);
  for (const r of results) {
    L.push("", `## ${r.map} — ${r.ok ? "PASS" : "FAIL"}`, "", `- ${r.stats.size} tiles de ${r.stats.tileSize}px · ${r.stats.objects} objetos (${Object.entries(r.stats.byClass).map(([k, v]) => `${k} ${v}`).join(", ")}) · sólido ${r.stats.solidPct}% · alcançável ${r.stats.reachablePctOfFree}% das células livres`, "");
    for (const g of r.gates) {
      L.push(`- ${icon(g.status)} **${g.id}** — ${g.title}`);
      for (const e of g.errors) L.push(`  - ❌ ${e}`);
      for (const w of g.warnings) L.push(`  - ⚠️ ${w}`);
      for (const i of g.info) L.push(`  - ${i}`);
    }
  }
  return L.join("\n") + "\n";
}
