// Map Factory — leitura de .tmj.json no Node, no mesmo contrato de src/sim/map.ts (parseTiledMap): chave/sólido por
// gid, props sólidos com área solidW × solidH a partir do pé, e objetos `collision` (retângulos) que marcam a grade.
// Usado pelo validador (validate.mjs) e pelo gerador (generate.mjs). Puro: sem fs.

/** Valor de uma propriedade Tiled ([{name,type,value}]). */
export function prop(props, name) {
  return props?.find((p) => p.name === name)?.value;
}

/** Bits de flip/rotação do Tiled no gid (o motor não os suporta). */
export const GID_FLAGS = 0xe0000000;

/** Classe de um objeto (Tiled 1.9+ usa `class`; os geradores antigos usam `type`). */
export const clsOf = (o) => o.class ?? o.type ?? "";

/** gid → { key, solid }, como parseTiledMap. */
export function gidTable(m) {
  const out = new Map();
  for (const ts of m.tilesets ?? [])
    for (const t of ts.tiles ?? []) out.set(ts.firstgid + t.id, { key: String(prop(t.properties, "key") ?? `${ts.name}_${t.id}`), solid: prop(t.properties, "solid") === true, hasKey: prop(t.properties, "key") !== undefined });
  return out;
}

/** Todos os objetos do mapa, com o nome da camada de onde vieram. */
export function allObjects(m) {
  return (m.layers ?? []).filter((l) => l.type === "objectgroup").flatMap((l) => (l.objects ?? []).map((o) => ({ ...o, layer: l.name, cls: clsOf(o) })));
}

/** Retângulo de um objeto em tiles (inclusivo), cobrindo toda célula que ele toca. Ponto → a célula dele. */
export function objectCells(o, T) {
  const w = o.width ?? 0;
  const h = o.height ?? 0;
  if (o.point || (!w && !h)) {
    const x = Math.floor(o.x / T);
    const y = Math.floor(o.y / T);
    return { x0: x, y0: y, x1: x, y1: y };
  }
  return { x0: Math.floor(o.x / T), y0: Math.floor(o.y / T), x1: Math.ceil((o.x + w) / T) - 1, y1: Math.ceil((o.y + h) / T) - 1 };
}

/** Células sólidas de um prop: solidW × solidH tiles, centrada no pé e subindo a partir dele (parseTiledMap). */
export function propSolidCells(o, T) {
  const sw = Number(prop(o.properties, "solidW") ?? 1);
  const sh = Number(prop(o.properties, "solidH") ?? 1);
  const tx0 = Math.floor(o.x / T) - Math.floor((sw - 1) / 2);
  const ty1 = Math.floor((o.y - 1) / T);
  const cells = [];
  for (let ty = ty1 - sh + 1; ty <= ty1; ty++) for (let tx = tx0; tx < tx0 + sw; tx++) cells.push([tx, ty]);
  return cells;
}

/**
 * Grade de colisão (1 = sólido) igual à da sim: tiles com solid=true em qualquer camada, props sólidos e objetos
 * `collision`. Devolve também quem bloqueou cada célula (para o relatório).
 */
export function solidGrid(m) {
  const W = m.width;
  const H = m.height;
  const T = m.tilewidth;
  const solid = new Uint8Array(W * H);
  const why = new Map();
  const mark = (x, y, src) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = y * W + x;
    solid[i] = 1;
    if (!why.has(i)) why.set(i, src);
  };
  const gids = gidTable(m);
  for (const l of m.layers ?? [])
    if (l.type === "tilelayer")
      (l.data ?? []).forEach((g, i) => {
        if (g && gids.get(g)?.solid) mark(i % W, Math.floor(i / W), `tile:${gids.get(g).key}`);
      });
  for (const o of allObjects(m)) {
    if (o.cls === "prop" && prop(o.properties, "solid") === true) for (const [x, y] of propSolidCells(o, T)) mark(x, y, `prop:${prop(o.properties, "key")}#${o.id}`);
    else if (o.cls === "collision") {
      const r = objectCells(o, T);
      for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) mark(x, y, `collision:${o.name || o.id}`);
    }
  }
  return { solid, why };
}

/** Monta um .tmj (Tiled 1.10) a partir de camadas já prontas. tiles = [{key, solid}] na ordem dos gids (1..n). */
export function buildTmj({ W, H, T, tilesetName, tiles, layers, properties, nextObjectId }) {
  return {
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    orientation: "orthogonal",
    renderorder: "right-down",
    width: W,
    height: H,
    tilewidth: T,
    tileheight: T,
    infinite: false,
    nextlayerid: layers.length + 1,
    nextobjectid: nextObjectId,
    properties: Object.entries(properties).map(([name, value]) => ({ name, type: typeof value === "number" ? "int" : typeof value === "boolean" ? "bool" : "string", value })),
    tilesets: [
      {
        firstgid: 1,
        name: tilesetName,
        tilewidth: T,
        tileheight: T,
        tilecount: tiles.length,
        columns: 0,
        tiles: tiles.map((t, i) => ({ id: i, properties: [{ name: "key", type: "string", value: t.key }, { name: "solid", type: "bool", value: !!t.solid }] })),
      },
    ],
    layers: layers.map((l, i) =>
      l.type === "tilelayer"
        ? { id: i + 1, type: "tilelayer", name: l.name, width: W, height: H, x: 0, y: 0, opacity: 1, visible: true, data: l.data }
        : { id: i + 1, type: "objectgroup", name: l.name, x: 0, y: 0, opacity: 1, visible: true, objects: l.objects },
    ),
  };
}
