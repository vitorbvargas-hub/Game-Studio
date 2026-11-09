// Mapa do mundo a partir de um subconjunto do Tiled JSON (.tmj): camadas de tiles + camada de objetos.
// A sim usa só a grade de colisão, os spawns e os pontos de início; o renderer usa as chaves visuais.

import { PX_PER_SUB, SUB } from "./params";
import type { Vec } from "./types";

interface TiledProperty {
  name: string;
  type?: string;
  value: string | number | boolean;
}

export interface TiledTile {
  id: number;
  properties?: TiledProperty[];
}

export interface TiledTileset {
  firstgid: number;
  name: string;
  tilewidth: number;
  tileheight: number;
  tiles: TiledTile[];
}

export interface TiledObject {
  id: number;
  name?: string;
  type?: string;
  class?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  point?: boolean;
  /** Polilinha (Tiled), relativa a (x, y). Map Factory: curvas contínuas de trilha/riacho. */
  polyline?: { x: number; y: number }[];
  properties?: TiledProperty[];
}

export type TiledLayer =
  | { type: "tilelayer"; name: string; width: number; height: number; data: number[] }
  | { type: "objectgroup"; name: string; objects: TiledObject[] };

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  orientation?: string;
  properties?: TiledProperty[];
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

export interface MapProp {
  key: string;
  /** Pés do prop, em pixels do mundo. */
  x: number;
  y: number;
  solid: boolean;
  /** 2º estado do sprite (baú aberto): a UI troca `key` por ele quando o baú da mesma célula é aberto. */
  openKey?: string;
}

/**
 * Curva contínua (camada `curves`, Map Factory R2): trilha ou riacho desenhado como faixa de meia-largura `hw` em
 * volta da polilinha, por cima do chão. Só apresentação: a colisão continua nas células (chave Wang em `prefix`).
 */
export interface MapCurve {
  name: string;
  terrain: string;
  /** Prefixo das chaves das células do conjunto (ex. "fp4_path_w47_"). */
  prefix: string;
  /** Textura cheia da faixa e chão (variantes) que fica embaixo nas células do conjunto. */
  fill: string;
  ground: string[];
  edge: "dither" | "foam";
  foam?: string;
  z: number;
  /** Vértices em px e meia-largura em px por vértice. */
  points: Vec[];
  hw: number[];
  /** Vaus: retângulos em px onde a água fica rasa (mais clara). */
  fords: { x: number; y: number; w: number; h: number }[];
}

/** Decalque de chão (camada `decals`, look v8): sprite pequeno centrado no ponto, só apresentação. */
export interface MapDecal {
  key: string;
  x: number;
  y: number;
  flip?: boolean;
}

/** Mancha de solo (camada `patches`, look v8, ex. lama roxa): elipse em px + células onde pode aparecer. */
export interface MapPatch {
  kind: string;
  x: number;
  y: number;
  w: number;
  h: number;
  seed: number;
  cells: Set<number>;
}

export interface SpawnZone {
  species: string[];
  levelMin: number;
  levelMax: number;
  count: number;
  /** Centro e raio em sub-tiles. */
  center: Vec;
  radius: number;
}

/** Saída do mapa (borda ou portal): pisar no retângulo leva a `to` (id do mapa), no início `toStart`. Em px. */
export interface MapPortal {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  toStart: string;
}

/** NPC residente (camada `npcs`, Map Factory): Digimon parado, não hostil. Posição em sub-tiles. */
export interface MapNpc {
  id: string;
  name: string;
  speciesId?: string;
  dialogue?: string;
  pos: Vec;
}

/** Ponto interativo (POI com kind chest/sign/heal_point da camada `poi`). Posição em sub-tiles. */
export interface MapInteractable {
  id: string;
  kind: "chest" | "sign" | "heal_point";
  title: string;
  text: string;
  pos: Vec;
}

/** Arena de chefe (objeto `boss_arena`). Retângulo em px. */
export interface MapArena {
  id: string;
  boss: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WorldMap {
  id: string;
  width: number;
  height: number;
  tileSize: number;
  /** Uma lista de chaves visuais por camada de tiles ("" = vazio). */
  tileLayers: { name: string; keys: string[] }[];
  solid: Uint8Array;
  props: MapProp[];
  spawns: SpawnZone[];
  starts: Record<string, Vec>;
  portals: MapPortal[];
  /** Map Factory: NPCs, interativos e arenas (vazios nos mapas antigos; ausentes em mapas montados em código). */
  npcs?: MapNpc[];
  interactables?: MapInteractable[];
  arenas?: MapArena[];
  /** Curvas contínuas (trilha/riacho), por z crescente. */
  curves?: MapCurve[];
  /** Look v8: decalques de chão e manchas de solo (só apresentação; ausentes nos outros mapas). */
  decals?: MapDecal[];
  patches?: MapPatch[];
  /**
   * Células (1 = sim) alcançáveis andando (4 vizinhos, colisão) a partir dos inícios do mapa. Calculado no
   * carregamento (parseTiledMap); mapas montados em código ganham o cálculo na primeira consulta (reachableOf).
   */
  reachable?: Uint8Array;
}

const INTERACTIVE_KINDS = new Set(["chest", "sign", "heal_point"]);

function prop(props: TiledProperty[] | undefined, name: string): TiledProperty["value"] | undefined {
  return props?.find((p) => p.name === name)?.value;
}

export function parseTiledMap(id: string, m: TiledMap): WorldMap {
  if (m.tilewidth !== m.tileheight) throw new Error(`mapa ${id}: tiles não quadrados`);
  const gidKey = new Map<number, { key: string; solid: boolean }>();
  for (const ts of m.tilesets)
    for (const t of ts.tiles) {
      const key = String(prop(t.properties, "key") ?? `${ts.name}_${t.id}`);
      gidKey.set(ts.firstgid + t.id, { key, solid: prop(t.properties, "solid") === true });
    }
  const n = m.width * m.height;
  const solid = new Uint8Array(n);
  const tileLayers: WorldMap["tileLayers"] = [];
  const props: MapProp[] = [];
  const spawns: SpawnZone[] = [];
  const starts: Record<string, Vec> = {};
  const portals: MapPortal[] = [];
  const npcs: MapNpc[] = [];
  const interactables: MapInteractable[] = [];
  const arenas: MapArena[] = [];
  const curves: MapCurve[] = [];
  const decals: MapDecal[] = [];
  const patches: MapPatch[] = [];
  const tile = m.tilewidth;
  const toSub = (px: number) => Math.round((px / tile) * SUB);
  for (const layer of m.layers) {
    if (layer.type === "tilelayer") {
      if (layer.data.length !== n) throw new Error(`mapa ${id}: camada ${layer.name} com tamanho errado`);
      const keys = layer.data.map((gid, i) => {
        if (!gid) return "";
        const info = gidKey.get(gid);
        if (!info) throw new Error(`mapa ${id}: gid ${gid} sem tile`);
        if (info.solid) solid[i] = 1;
        return info.key;
      });
      tileLayers.push({ name: layer.name, keys });
      continue;
    }
    for (const o of layer.objects) {
      const cls = o.class ?? o.type ?? "";
      if (cls === "prop") {
        const ok = prop(o.properties, "openKey");
        const p: MapProp = { key: String(prop(o.properties, "key")), x: o.x, y: o.y, solid: prop(o.properties, "solid") === true, ...(ok ? { openKey: String(ok) } : {}) };
        props.push(p);
        if (p.solid) {
          // Área de colisão opcional (casas, postes): solidW × solidH tiles, centrada no pé e subindo a partir dele.
          const sw = Number(prop(o.properties, "solidW") ?? 1);
          const sh = Number(prop(o.properties, "solidH") ?? 1);
          const tx0 = Math.floor(o.x / tile) - Math.floor((sw - 1) / 2);
          const ty1 = Math.floor((o.y - 1) / tile);
          for (let ty = ty1 - sh + 1; ty <= ty1; ty++)
            for (let tx = tx0; tx < tx0 + sw; tx++) if (tx >= 0 && ty >= 0 && tx < m.width && ty < m.height) solid[ty * m.width + tx] = 1;
        }
      } else if (cls === "spawn") {
        const w = o.width ?? 0;
        const h = o.height ?? 0;
        spawns.push({
          species: String(prop(o.properties, "species")).split(",").map((s) => s.trim()),
          levelMin: Number(prop(o.properties, "levelMin") ?? 1),
          levelMax: Number(prop(o.properties, "levelMax") ?? 1),
          count: Number(prop(o.properties, "count") ?? 1),
          center: { x: toSub(o.x + w / 2), y: toSub(o.y + h / 2) },
          radius: toSub(Math.max(w, h) / 2),
        });
      } else if (cls === "start") {
        starts[o.name ?? "player"] = { x: toSub(o.x), y: toSub(o.y) };
      } else if (cls === "collision") {
        // Map Factory (camada `collision`, independente da arte): retângulo que bloqueia toda célula que ele toca.
        const x0 = Math.floor(o.x / tile);
        const y0 = Math.floor(o.y / tile);
        const x1 = o.width ? Math.ceil((o.x + o.width) / tile) - 1 : x0;
        const y1 = o.height ? Math.ceil((o.y + o.height) / tile) - 1 : y0;
        for (let ty = Math.max(0, y0); ty <= Math.min(m.height - 1, y1); ty++)
          for (let tx = Math.max(0, x0); tx <= Math.min(m.width - 1, x1); tx++) solid[ty * m.width + tx] = 1;
      } else if (cls === "npc") {
        const sp = prop(o.properties, "speciesId");
        const dl = prop(o.properties, "dialogue");
        npcs.push({ id: o.name || `npc-${o.id}`, name: String(prop(o.properties, "displayName") ?? o.name ?? "NPC"), speciesId: sp === undefined ? undefined : String(sp), dialogue: dl === undefined ? undefined : String(dl), pos: { x: toSub(o.x), y: toSub(o.y) } });
      } else if (cls === "poi" && INTERACTIVE_KINDS.has(String(prop(o.properties, "kind")))) {
        const cx = o.x + (o.point ? 0 : (o.width ?? 0) / 2);
        const cy = o.y + (o.point ? 0 : (o.height ?? 0) / 2);
        interactables.push({
          id: o.name || `poi-${o.id}`,
          kind: String(prop(o.properties, "kind")) as MapInteractable["kind"],
          title: String(prop(o.properties, "title") ?? o.name ?? ""),
          text: String(prop(o.properties, "text") ?? prop(o.properties, "title") ?? ""),
          pos: { x: toSub(cx), y: toSub(cy) },
        });
      } else if (cls === "curve" && o.polyline?.length) {
        const num = (k: string) => String(prop(o.properties, k) ?? "").split(",").filter(Boolean).map(Number);
        const hw = num("hw");
        curves.push({
          name: o.name ?? "",
          terrain: String(prop(o.properties, "terrain") ?? ""),
          prefix: String(prop(o.properties, "prefix") ?? ""),
          fill: String(prop(o.properties, "fill") ?? ""),
          ground: String(prop(o.properties, "ground") ?? "").split(",").filter(Boolean),
          edge: prop(o.properties, "edge") === "foam" ? "foam" : "dither",
          foam: prop(o.properties, "foam") === undefined ? undefined : String(prop(o.properties, "foam")),
          z: Number(prop(o.properties, "z") ?? 0),
          points: o.polyline.map((q) => ({ x: o.x + q.x, y: o.y + q.y })),
          hw: o.polyline.map((_, i) => hw[i] ?? hw[hw.length - 1] ?? tile / 2),
          fords: String(prop(o.properties, "fords") ?? "").split(";").filter(Boolean).map((r) => {
            const [x, y, w, h] = r.split(",").map(Number);
            return { x, y, w, h };
          }),
        });
      } else if (cls === "decal") {
        decals.push({ key: String(prop(o.properties, "key")), x: o.x, y: o.y, ...(prop(o.properties, "flip") === true ? { flip: true } : {}) });
      } else if (cls === "patch") {
        patches.push({
          kind: String(prop(o.properties, "kind") ?? "mud"),
          x: o.x,
          y: o.y,
          w: o.width ?? tile,
          h: o.height ?? tile,
          seed: Number(prop(o.properties, "seed") ?? 1),
          cells: new Set(String(prop(o.properties, "cells") ?? "").split(",").filter(Boolean).map(Number)),
        });
      } else if (cls === "boss_arena") {
        arenas.push({ id: o.name || `arena-${o.id}`, boss: String(prop(o.properties, "boss") ?? ""), x: o.x, y: o.y, w: o.width ?? tile, h: o.height ?? tile });
      } else if (cls === "portal") {
        portals.push({ name: o.name ?? "", x: o.x, y: o.y, w: o.width ?? tile, h: o.height ?? tile, to: String(prop(o.properties, "to")), toStart: String(prop(o.properties, "toStart") ?? "player") });
      }
    }
  }
  curves.sort((a, b) => a.z - b.z);
  const map: WorldMap = { id, width: m.width, height: m.height, tileSize: tile, tileLayers, solid, props, spawns, starts, portals, npcs, interactables, arenas, ...(curves.length ? { curves } : {}), ...(decals.length ? { decals } : {}), ...(patches.length ? { patches } : {}) };
  map.reachable = computeReachable(map);
  return map;
}

/**
 * BFS na grade de colisão a partir de todos os inícios do mapa (player, from_<mapa>...: toda entrada do Tamer).
 * Sem início, conta toda célula livre (comportamento antigo).
 */
export function computeReachable(map: WorldMap): Uint8Array {
  const { width: W, height: H, solid } = map;
  const out = new Uint8Array(W * H);
  const q: number[] = [];
  for (const s of Object.values(map.starts)) {
    const tx = Math.floor(s.x / SUB);
    const ty = Math.floor(s.y / SUB);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H || solid[ty * W + tx] || out[ty * W + tx]) continue;
    out[ty * W + tx] = 1;
    q.push(ty * W + tx);
  }
  if (!q.length) {
    for (let i = 0; i < W * H; i++) out[i] = solid[i] ? 0 : 1;
    return out;
  }
  for (let h = 0; h < q.length; h++) {
    const x = q[h] % W;
    const y = (q[h] - x) / W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (solid[j] || out[j]) continue;
      out[j] = 1;
      q.push(j);
    }
  }
  return out;
}

/** Alcance pré-computado do mapa (calcula e guarda na primeira consulta se o mapa não veio do parser). */
export function reachableOf(map: WorldMap): Uint8Array {
  if (!map.reachable || map.reachable.length !== map.width * map.height) map.reachable = computeReachable(map);
  return map.reachable;
}

/** Ponto (sub-tiles) numa célula livre e alcançável a partir dos inícios. */
export function isReachableAt(map: WorldMap, x: number, y: number): boolean {
  const tx = Math.floor(x / SUB);
  const ty = Math.floor(y / SUB);
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return false;
  const i = ty * map.width + tx;
  return reachableOf(map)[i] === 1 && map.solid[i] === 0;
}

/** Células (índices) livres e alcançáveis dentro do quadrado de sorteio de uma zona de spawn. */
export function reachableCellsOf(map: WorldMap, z: SpawnZone): number[] {
  const r = reachableOf(map);
  const x0 = Math.max(0, Math.floor((z.center.x - z.radius) / SUB));
  const y0 = Math.max(0, Math.floor((z.center.y - z.radius) / SUB));
  const x1 = Math.min(map.width - 1, Math.floor((z.center.x + z.radius) / SUB));
  const y1 = Math.min(map.height - 1, Math.floor((z.center.y + z.radius) / SUB));
  const out: number[] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (r[y * map.width + x] && !map.solid[y * map.width + x]) out.push(y * map.width + x);
  return out;
}

/** Sólido no ponto (sub-tiles). Fora do mapa conta como sólido. */
/** Portal cujo retângulo contém o ponto (px). */
export function portalAt(map: WorldMap, x: number, y: number): MapPortal | undefined {
  return map.portals.find((p) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
}

export function isSolidAt(map: WorldMap, x: number, y: number): boolean {
  const tx = Math.floor(x / SUB);
  const ty = Math.floor(y / SUB);
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return true;
  return map.solid[ty * map.width + tx] === 1;
}

export function subToPx(v: number): number {
  return v * PX_PER_SUB;
}

export function pxToSub(v: number): number {
  return Math.round(v / PX_PER_SUB);
}
