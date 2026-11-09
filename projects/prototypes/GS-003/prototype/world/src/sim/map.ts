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
}

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
        const p: MapProp = { key: String(prop(o.properties, "key")), x: o.x, y: o.y, solid: prop(o.properties, "solid") === true };
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
      } else if (cls === "portal") {
        portals.push({ name: o.name ?? "", x: o.x, y: o.y, w: o.width ?? tile, h: o.height ?? tile, to: String(prop(o.properties, "to")), toStart: String(prop(o.properties, "toStart") ?? "player") });
      }
    }
  }
  return { id, width: m.width, height: m.height, tileSize: tile, tileLayers, solid, props, spawns, starts, portals };
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
