// Tiles e props do bioma. Contrato com o game-art (GAME-ASSETS/03-environments):
//   1) um PNG cujo nome (sem extensão) é a chave usada no mapa (ex. grass/grass_a.png → "grass_a")
//      substitui o placeholder dessa chave. Tiles: 32×32. Props: qualquer tamanho, pés no centro da base.
//   2) opcional: um tileset.json { "tiles": { "<chave>": { "image": "grass/sheet.png", "rect": [x,y,w,h],
//      "pivot": [px,py] } } } para recortes de uma folha. Caminhos relativos ao tileset.json.
// Enquanto nada existir, cada chave cai num placeholder gerado em código (makePlaceholder*).

export interface TileSource {
  /** URL/caminho da imagem. */
  url: string;
  rect?: [number, number, number, number];
  /** Pés do prop em px dentro do recorte (props); tiles ignoram. */
  pivot?: [number, number];
}

interface TilesetEntry {
  image?: string;
  /** Formato dos pacotes *-dwds: lista de { file, collision, suggestedLayer }; a chave é o nome do arquivo. */
  file?: string;
  key?: string;
  rect?: [number, number, number, number];
  pivot?: [number, number];
}

interface TilesetJson {
  tiles?: Record<string, TilesetEntry> | TilesetEntry[];
  props?: TilesetEntry[];
}

export function buildTileSources(pngs: Record<string, string>, tilesets: Record<string, unknown>): Record<string, TileSource> {
  const out: Record<string, TileSource> = {};
  const norm = (p: string) => p.replace(/\\/g, "/");
  // Biomas DS (pastas *-dwds) têm prioridade sobre os originais quando a chave coincide: entram por último.
  const dwds = (p: string) => (/-dwds\//.test(norm(p)) ? 1 : 0);
  pngs = Object.fromEntries(Object.entries(pngs).sort(([a], [b]) => dwds(a) - dwds(b)));
  tilesets = Object.fromEntries(Object.entries(tilesets).sort(([a], [b]) => dwds(a) - dwds(b)));
  for (const [path, url] of Object.entries(pngs)) {
    const key = norm(path).split("/").pop()!.replace(/\.png$/i, "");
    out[key] = { url };
  }
  for (const [path, raw] of Object.entries(tilesets)) {
    const base = norm(path).split("/").slice(0, -1).join("/");
    const ts = raw as TilesetJson;
    const entries: [string, TilesetEntry][] = Array.isArray(ts.tiles) || ts.props
      ? [...(Array.isArray(ts.tiles) ? ts.tiles : []), ...(ts.props ?? [])].map((t) => [t.key ?? String(t.image ?? t.file).split("/").pop()!.replace(/\.png$/i, ""), t])
      : Object.entries(ts.tiles ?? {});
    for (const [key, t] of entries) {
      // Entrada simples (só "file", sem recorte) já foi coberta pelo PNG de mesmo nome.
      if (!t.image && !t.rect && !t.pivot && !t.key) continue;
      const imgPath = `${base}/${t.image ?? t.file}`.replace(/\/\.\//g, "/");
      const url = Object.entries(pngs).find(([p]) => norm(p) === imgPath)?.[1];
      if (url) out[key] = { url, rect: t.rect, pivot: t.pivot };
    }
  }
  return out;
}

/**
 * Pacotes de região (`*-v5/`: forest-v5, praia-v5, vila-v5) repetem nomes de arquivo entre si (grass_00, path_blob_*):
 * só entram pelo pacote da cena, com prefixo (scene-tiles.ts), nunca no conjunto global.
 */
export const isScenePackPath = (p: string): boolean => /\/[a-z]+-v5\//.test(p.replace(/\\/g, "/"));

/** Filtro do conjunto global: sem as pastas noturnas e sem os pacotes de região. */
export const globalTileFilter = (p: string): boolean => !/\/night\//.test(p) && !isScenePackPath(p);

/** `includeDwds=false` ignora os biomas DS (`03-environments/*-dwds/`), para comparar com os originais (?tiles=original). */
export function loadTileSources(includeDwds = true, filter: (path: string) => boolean = (p) => !isScenePackPath(p)): Record<string, TileSource> {
  const keep = <T,>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).filter(([p]) => filter(p) && (includeDwds || !/-dwds\//.test(p))));
  const pngs = import.meta.glob<string>("@game-assets/03-environments/**/*.png", { eager: true, query: "?url", import: "default" });
  const tilesets = import.meta.glob("@game-assets/03-environments/**/tileset.json", { eager: true, import: "default" });
  return buildTileSources(keep(pngs), keep(tilesets));
}

/** Quantos tiles/props vêm de biomas DS (para o HUD/log e para os testes). */
export function countDwdsSources(src: Record<string, TileSource>): number {
  return Object.values(src).filter((t) => /-dwds\//.test(t.url)).length;
}

// ---------- placeholders ----------

type Ctx2D = CanvasRenderingContext2D;

function hash(x: number, y: number, s: number): number {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Tiles animados (quadros por chave) [H: 600 ms por quadro, a confirmar com o game-art]. */
export const ANIMATED_TILES: Record<string, { frames: string[]; frameMs: number }> = {
  water_00: { frames: ["water_00", "water_01"], frameMs: 600 },
};

export function animatedTileKey(key: string, now: number): string {
  const a = ANIMATED_TILES[key];
  return a ? a.frames[Math.floor(now / a.frameMs) % a.frames.length] : key;
}

const STYLES: Record<string, { base: string; dots: string[]; density: number }> = {
  grass: { base: "#3e8948", dots: ["#63c74d", "#265c42"], density: 0.08 },
  path: { base: "#c28569", dots: ["#ead4aa", "#b86f50"], density: 0.1 },
  water: { base: "#0099db", dots: ["#2ce8f5", "#124e89"], density: 0.04 },
  forest: { base: "#265c42", dots: ["#193c3e", "#3e8948"], density: 0.12 },
};

function fillStyled(ctx: Ctx2D, style: string, ox: number, oy: number, x0: number, y0: number, w: number, h: number, seed: number): void {
  const c = STYLES[style] ?? { base: "#ff00ff", dots: ["#000000"], density: 0.2 };
  ctx.fillStyle = c.base;
  ctx.fillRect(ox + x0, oy + y0, w, h);
  for (let y = y0; y < y0 + h; y += 2)
    for (let x = x0; x < x0 + w; x += 2)
      if (hash(x, y, seed) < c.density) {
        ctx.fillStyle = c.dots[Math.floor(hash(y, x, seed + 1) * c.dots.length)];
        ctx.fillRect(ox + x, oy + y, style === "water" ? 4 : 1, 1);
      }
}

/**
 * Placeholder de um tile em (ox, oy), seguindo a convenção dos PNGs do game-art:
 * `<feição>_edge_<lado>` / `shore_<lado>` = meia célula da feição no lado indicado; `*_corner_<ns><ew>` = duas metades.
 */
export function drawPlaceholderTile(ctx: Ctx2D, key: string, ox: number, oy: number, tile: number): void {
  key = key.replace(/^fp_floor_forest/, "forest_floor").replace(/^fp_/, "");
  const seed = [...key].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const feature = key.startsWith("shore") || key.startsWith("water") ? "water" : key.startsWith("path") ? "path" : key.startsWith("forest") ? "forest" : "grass";
  const m = /_(?:edge_|corner_)?([nsew]{1,2})$/.exec(key);
  if (!m || key.startsWith("grass") || key.startsWith("forest_floor")) return fillStyled(ctx, feature, ox, oy, 0, 0, tile, tile, seed);
  fillStyled(ctx, "grass", ox, oy, 0, 0, tile, tile, seed);
  const half = tile / 2;
  for (const side of m[1]) {
    const [x, y, w, h] = side === "n" ? [0, 0, tile, half] : side === "s" ? [0, half, tile, half] : side === "e" ? [half, 0, half, tile] : [0, 0, half, tile];
    fillStyled(ctx, feature, ox, oy, x, y, w, h, seed);
  }
}

export interface PropPlaceholder {
  w: number;
  h: number;
  /** Pés dentro do desenho. */
  pivot: [number, number];
  draw(ctx: Ctx2D): void;
}

function rect(ctx: Ctx2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function blob(ctx: Ctx2D, color: string, cx: number, cy: number, rx: number, ry: number) {
  ctx.fillStyle = color;
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
}

const PROP_PLACEHOLDERS: Record<string, PropPlaceholder> = {
  tree: {
    w: 40,
    h: 56,
    pivot: [20, 54],
    draw(ctx) {
      rect(ctx, "#5d3a2e", 17, 38, 6, 16);
      rect(ctx, "#3f2832", 21, 38, 2, 16);
      blob(ctx, "#193c3e", 20, 24, 19, 18);
      blob(ctx, "#265c42", 19, 22, 17, 16);
      blob(ctx, "#3e8948", 16, 18, 11, 10);
      blob(ctx, "#63c74d", 13, 14, 4, 3);
    },
  },
  bush: {
    w: 24,
    h: 16,
    pivot: [12, 15],
    draw(ctx) {
      blob(ctx, "#193c3e", 12, 9, 11, 6);
      blob(ctx, "#265c42", 11, 8, 9, 5);
      blob(ctx, "#3e8948", 9, 6, 4, 2);
    },
  },
  rock: {
    w: 26,
    h: 20,
    pivot: [13, 18],
    draw(ctx) {
      blob(ctx, "#3a4466", 13, 11, 12, 8);
      blob(ctx, "#5a6988", 12, 10, 10, 6);
      blob(ctx, "#8b9bb4", 10, 7, 5, 3);
    },
  },
  /** Tufo de grama alta (folhas em leque, escuras na base), como a grade de mato da referência. */
  tall: {
    w: 30,
    h: 26,
    pivot: [15, 25],
    draw(ctx) {
      const leaf = (angle: number, len: number, col: string, tip: string) => {
        const dx = Math.sin(angle);
        const dy = -Math.cos(angle);
        for (let i = 0; i <= len; i++) {
          const x = Math.round(15 + dx * i * (0.6 + i / (len * 2.2)));
          const y = Math.round(24 + dy * i);
          rect(ctx, "#0f2420", x - 1, y, 4, 2);
          rect(ctx, i > len - 3 ? tip : col, x, y, 2, 1);
        }
      };
      blob(ctx, "#0f2420", 15, 22, 13, 4);
      const L = [-1.15, -0.8, -0.45, -0.15, 0.15, 0.45, 0.8, 1.15];
      L.forEach((a, i) => leaf(a, [12, 17, 20, 22, 21, 19, 16, 12][i], i % 2 ? "#265c42" : "#1d4a36", "#3e8948"));
      [-0.6, 0, 0.6].forEach((a, i) => leaf(a, [13, 16, 13][i], "#3e8948", "#63c74d"));
      blob(ctx, "#193c3e", 15, 23, 9, 2);
    },
  },
  small: {
    w: 8,
    h: 6,
    pivot: [4, 5],
    draw(ctx) {
      rect(ctx, "#63c74d", 1, 2, 6, 3);
      rect(ctx, "#feae34", 3, 1, 2, 2);
    },
  },
};

/** Placeholder de prop por prefixo da chave (tree_*, bush_*, rock_*; o resto vira um marcador pequeno). */
export function propPlaceholder(key: string): PropPlaceholder {
  const prefix = key.replace(/^fp_/, "").split("_")[0];
  return PROP_PLACEHOLDERS[prefix] ?? PROP_PLACEHOLDERS.small;
}
