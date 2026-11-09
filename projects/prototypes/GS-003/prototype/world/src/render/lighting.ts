// Luz do forest-v4.1 (tileset.json → lightingV41), aplicada pelo renderer: luz de cima à esquerda (sol/lua).
//   - sombra projetada: elipse alongada sob cada árvore, deslocada para baixo/direita (contrária à luz), no lugar do
//     decal quase centrado do v4. Mesma geometria de art/src/forest_v4_1_props.js castShadowGeometry/paintCastShadow;
//   - rim-light: clareia os pixels da borda de cima/esquerda da copa com o tom de borda da rampa (foliage[7]), como
//     applyCanopyRimLight. As 2 árvores novas do v4.1 já vêm com o rim no PNG (o renderer pula essas).
// Só apresentação.

import type { CanvasFactory } from "./images";

export interface CastShadowCfg {
  /** Cor da sombra por preset (#rrggbb) e alpha 0..255 (ramp.canopyShadow do pacote). */
  day: string;
  night: string;
  dayAlpha: number;
  nightAlpha: number;
}

export interface RimLightCfg {
  /** Tom de borda (foliage[7]) por preset e alpha 0..255 (150 × força 0,6 da cena de prova = 90). */
  day: string;
  night: string;
  alpha: number;
  /** Árvores (chave do mapa) com o rim já pintado no PNG. */
  baked: string[];
}

export const hexRgb = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];

/** Geometria da sombra projetada (px do mundo): centro, raios. Igual a castShadowGeometry do game-art. */
export function castShadowGeometry(footX: number, footY: number, canopyW: number): { cx: number; cy: number; rx: number; ry: number } {
  const rx = Math.max(10, Math.round(canopyW * 0.42));
  const ry = Math.round(rx * 0.34);
  return { cx: footX + Math.round(rx * 0.55), cy: footY + Math.round(ry * 0.6), rx, ry };
}

/** Elipse cheia em pixel-art (linhas inteiras), centro (cx, cy) do canvas. */
function fillEllipse(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry || 1))));
    g.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
}

/** Sombra projetada num canvas `(2rx+1)×(2ry+1)`: elipse externa + núcleo mais escuro puxado para a árvore. */
export function castShadowCanvas(rx: number, ry: number, hex: string, alpha: number, make: CanvasFactory): HTMLCanvasElement {
  const c = make(rx * 2 + 1, ry * 2 + 1);
  const g = c.getContext("2d")!;
  const [r, gg, b] = hexRgb(hex);
  g.fillStyle = `rgba(${r},${gg},${b},${(alpha / 255).toFixed(3)})`;
  fillEllipse(g, rx, ry, rx, ry);
  g.fillStyle = `rgba(${r},${gg},${b},${(60 / 255).toFixed(3)})`;
  fillEllipse(g, rx - 2, ry - 1, Math.round(rx * 0.6), Math.round(ry * 0.6));
  return c;
}

/** Pixels de borda de cima/esquerda de uma imagem RGBA (algum dos vizinhos ↖ ↑ ← é transparente). */
export function rimPixels(d: Uint8ClampedArray, w: number, h: number): number[] {
  const a = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
  const out: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (a(x, y) > 0 && !(a(x - 1, y - 1) > 0 && a(x, y - 1) > 0 && a(x - 1, y) > 0)) out.push(y * w + x);
  return out;
}

/** Cópia da copa com o rim-light (blend do tom `hex` com `alpha` nos pixels de borda de cima/esquerda). */
export function rimLit(img: CanvasImageSource & { width: number; height: number }, hex: string, alpha: number, make: CanvasFactory): HTMLCanvasElement {
  const c = make(img.width, img.height);
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, img.width, img.height);
  const d = data.data;
  const rgb = hexRgb(hex);
  const k = alpha / 255;
  for (const p of rimPixels(d, img.width, img.height)) for (let ch = 0; ch < 3; ch++) d[p * 4 + ch] = Math.round(d[p * 4 + ch] + (rgb[ch] - d[p * 4 + ch]) * k);
  g.putImageData(data, 0, 0);
  return c;
}
