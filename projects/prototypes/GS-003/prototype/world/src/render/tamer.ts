// Tamer PLACEHOLDER (não é arte final): figura de 18×32 px desenhada em código, 2 quadros de passo.
// Slot para o sprite real: quando existir um creature.json de Tamer, o renderer passa a usá-lo como as criaturas.

import type { CanvasFactory } from "./images";

export interface TamerPalette {
  skin: string;
  hair: string;
  jacket: string;
  jacketDark: string;
  pants: string;
  shoes: string;
}

export const LOCAL_TAMER: TamerPalette = { skin: "#e8b796", hair: "#3f2832", jacket: "#e43b44", jacketDark: "#a22633", pants: "#3a4466", shoes: "#262b44" };
export const BOT_TAMER: TamerPalette = { skin: "#c28569", hair: "#feae34", jacket: "#0099db", jacketDark: "#124e89", pants: "#5a6988", shoes: "#262b44" };

export const TAMER_W = 18;
export const TAMER_H = 32;
export const TAMER_PIVOT = { x: 9, y: 31 };

/** Quadros: [parado/passo A, passo B] voltados para o sul (frente) e leste. */
export function makeTamerFrames(pal: TamerPalette, make: CanvasFactory): { south: HTMLCanvasElement[]; east: HTMLCanvasElement[] } {
  const frame = (side: boolean, step: number) => {
    const c = make(TAMER_W, TAMER_H);
    const g = c.getContext("2d")!;
    const r = (col: string, x: number, y: number, w: number, h: number) => {
      g.fillStyle = col;
      g.fillRect(x, y, w, h);
    };
    const ol = "#181425";
    // pernas
    const lA = step === 1 ? 1 : 0;
    const lB = step === 1 ? -1 : 0;
    r(ol, 5, 21, 8, 10);
    r(pal.pants, 6, 21, 3, 8 + lA);
    r(pal.pants, 10, 21, 3, 8 + lB);
    r(pal.shoes, 6, 29 + lA, 3, 2);
    r(pal.shoes, 10, 29 + lB, 3, 2);
    // tronco
    r(ol, 3, 12, 13, 11);
    r(pal.jacket, 4, 13, 11, 9);
    r(pal.jacketDark, 4, 19, 11, 3);
    r(pal.jacketDark, side ? 11 : 9, 13, 1, 6);
    // braços
    r(pal.skin, 3, 18 + (step === 1 ? 1 : 0), 1, 3);
    r(pal.skin, 15, 18 + (step === 1 ? 0 : 1), 1, 3);
    // cabeça
    r(ol, 4, 1, 11, 12);
    r(pal.skin, 5, 4, 9, 8);
    r(pal.hair, 5, 2, 9, 3);
    r(pal.hair, side ? 5 : 4, 4, side ? 3 : 2, 3);
    if (!side) r(pal.hair, 13, 4, 1, 3);
    // olhos
    if (side) r(ol, 11, 7, 1, 2);
    else {
      r(ol, 7, 7, 1, 2);
      r(ol, 11, 7, 1, 2);
    }
    return c;
  };
  return { south: [frame(false, 0), frame(false, 1)], east: [frame(true, 0), frame(true, 1)] };
}
