// Minimapa do HUD: fundo pré-renderizado a partir do mapa (mata, clareira, caminho, árvores) e pontos das
// entidades por cima, num recorte centrado no jogador. Lê só o WorldMap e posições em px; não toca na sim.

import type { WorldMap } from "../sim/map";

export interface MinimapDot {
  x: number;
  y: number;
  kind: "me" | "partner" | "player" | "wild";
}

const COLORS = {
  forest: "#12291c",
  edge: "#1d4129",
  clear: "#3b6a35",
  path: "#c9a86a",
  water: "#1f6fae",
  tree: "#0b1a12",
};

export class Minimap {
  private base?: HTMLCanvasElement;
  private readonly ppt = 2;

  constructor(
    private readonly map: WorldMap,
    private readonly make: (w: number, h: number) => HTMLCanvasElement,
  ) {}

  /** Tipo visual de um tile pela chave (convenção de nomes do mapa) e pela colisão. */
  static tileKind(key: string, solid: boolean): keyof typeof COLORS {
    if (/path/.test(key)) return "path";
    if (/water|shore/.test(key)) return "water";
    if (/edge/.test(key)) return "edge";
    if (solid || /forest/.test(key)) return "forest";
    return "clear";
  }

  private background(): HTMLCanvasElement | undefined {
    if (this.base) return this.base;
    const { map, ppt } = this;
    const c = this.make(map.width * ppt, map.height * ppt);
    const g = c.getContext("2d");
    if (!g) return undefined;
    const top = map.tileLayers[0]?.keys ?? [];
    for (let y = 0; y < map.height; y++)
      for (let x = 0; x < map.width; x++) {
        const i = y * map.width + x;
        g.fillStyle = COLORS[Minimap.tileKind(top[i] ?? "", map.solid[i] === 1)];
        g.fillRect(x * ppt, y * ppt, ppt, ppt);
      }
    g.fillStyle = COLORS.tree;
    for (const p of map.props) if (p.solid && /tree/.test(p.key)) g.fillRect(Math.floor((p.x / map.tileSize) * ppt) - 1, Math.floor((p.y / map.tileSize) * ppt) - 2, 2, 2);
    this.base = c;
    return c;
  }

  /** Desenha o recorte centrado em `center` (px do mundo) no canvas de destino. */
  draw(target: HTMLCanvasElement, center: { x: number; y: number }, dots: MinimapDot[]): void {
    const g = target.getContext("2d");
    const bg = this.background();
    if (!g || !bg) return;
    const { map, ppt } = this;
    const k = ppt / map.tileSize;
    const sx = Math.round(Math.max(0, Math.min(bg.width - target.width, center.x * k - target.width / 2)));
    const sy = Math.round(Math.max(0, Math.min(bg.height - target.height, center.y * k - target.height / 2)));
    g.imageSmoothingEnabled = false;
    g.fillStyle = COLORS.forest;
    g.fillRect(0, 0, target.width, target.height);
    g.drawImage(bg, sx, sy, Math.min(target.width, bg.width), Math.min(target.height, bg.height), 0, 0, Math.min(target.width, bg.width), Math.min(target.height, bg.height));
    const order: MinimapDot["kind"][] = ["wild", "player", "partner", "me"];
    const col = { wild: "#e43b44", player: "#2ce8f5", partner: "#63c74d", me: "#ffffff" };
    for (const kind of order)
      for (const d of dots) {
        if (d.kind !== kind) continue;
        const x = Math.round(d.x * k - sx);
        const y = Math.round(d.y * k - sy);
        const r = kind === "me" ? 2 : 1;
        g.fillStyle = "#181425";
        g.fillRect(x - r - 1, y - r - 1, r * 2 + 3, r * 2 + 3);
        g.fillStyle = col[kind];
        g.fillRect(x - r, y - r, r * 2 + 1, r * 2 + 1);
      }
  }
}
