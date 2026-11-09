// Noite nas entidades (Digimon e Tamers): o cenário troca de paleta (forest-v4/night), mas os sprites não têm versão
// noturna. Este passo leva cada quadro para a rampa da noite do pacote (dessatura um pouco, puxa para o azul-lua
// e escurece) e, para não perder a leitura contra o chão escuro, acrescenta um rim-light frio na borda virada para a
// luz (cima/esquerda, como as copas do forest-v4.1) e um contorno externo leve de 1 px. Só apresentação.

import type { CanvasFactory } from "./images";

/** Parâmetros da grade noturna (valores de 0..255 por canal). */
export const NIGHT_GRADE = {
  /** Mistura para o cinza de mesma luminância antes do tom da lua. */
  desat: 0.3,
  /** Multiplicador por canal: rampa fria do FOLIAGE_NIGHT/GROUND_NIGHT do forest-v4. */
  moon: [0.64, 0.7, 0.96] as const,
  /** Piso somado depois do multiplicador (os escuros não viram preto chapado). */
  lift: [6, 6, 16] as const,
  /** Rim-light: tom de borda da lua do pacote (FOLIAGE_NIGHT[7] #a6c0e8). */
  rim: [166, 192, 232] as const,
  rimAlpha: 0.55,
  /** Contorno externo: tinta da noite do pacote (#0a0a16). */
  outline: [10, 10, 22] as const,
  outlineAlpha: 0.5,
};

/** Degraus da mistura noite (cache por degrau; 0 = dia, sem processamento). */
export const NIGHT_STEPS = 8;
export const nightStep = (mix: number): number => Math.max(0, Math.min(NIGHT_STEPS, Math.round(mix * NIGHT_STEPS)));

/**
 * Grade noturna de um quadro RGBA `w×h` com mistura `mix` (0..1). Devolve um quadro `(w+2)×(h+2)` (1 px de margem
 * para o contorno). `lightFromRight`: o quadro vai ser desenhado espelhado, então a borda "esquerda do mundo" é a
 * direita da imagem.
 */
export function gradeNightPixels(src: Uint8ClampedArray, w: number, h: number, mix: number, lightFromRight = false): Uint8ClampedArray {
  const W = w + 2;
  const H = h + 2;
  const out = new Uint8ClampedArray(W * H * 4);
  const G = NIGHT_GRADE;
  const a = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : src[(y * w + x) * 4 + 3]);
  const side = lightFromRight ? 1 : -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const o = ((y + 1) * W + x + 1) * 4;
      const al = src[i + 3];
      if (al === 0) continue;
      const lum = 0.3 * src[i] + 0.59 * src[i + 1] + 0.11 * src[i + 2];
      // borda virada para a luz: pixel opaco com vizinho transparente em cima ou do lado da luz
      const rim = a(x, y - 1) === 0 || a(x + side, y) === 0 || a(x + side, y - 1) === 0 ? G.rimAlpha * mix : 0;
      for (let c = 0; c < 3; c++) {
        const v = src[i + c];
        const graded = (v + (lum - v) * G.desat) * G.moon[c] + G.lift[c];
        const night = v + (graded - v) * mix;
        out[o + c] = Math.round(night + (G.rim[c] - night) * rim);
      }
      out[o + 3] = al;
    }
  // contorno externo de 1 px (4 vizinhos), só onde não há pixel do sprite
  const outA = Math.round(255 * G.outlineAlpha * mix);
  if (outA > 0)
    for (let y = -1; y <= h; y++)
      for (let x = -1; x <= w; x++) {
        if (a(x, y) !== 0) continue;
        if (a(x, y - 1) === 0 && a(x + 1, y) === 0 && a(x, y + 1) === 0 && a(x - 1, y) === 0) continue;
        const o = ((y + 1) * W + x + 1) * 4;
        out[o] = G.outline[0];
        out[o + 1] = G.outline[1];
        out[o + 2] = G.outline[2];
        out[o + 3] = outA;
      }
  return out;
}

/** Quadro `fr` de `img` com a grade noturna, num canvas `(w+2)×(h+2)` (desenhar 1 px × escala acima/à esquerda). */
export function nightFrame(
  img: CanvasImageSource,
  fr: { x: number; y: number; w: number; h: number },
  mix: number,
  lightFromRight: boolean,
  make: CanvasFactory,
): HTMLCanvasElement {
  const tmp = make(fr.w, fr.h);
  const tg = tmp.getContext("2d")!;
  tg.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
  const px = gradeNightPixels(tg.getImageData(0, 0, fr.w, fr.h).data, fr.w, fr.h, mix, lightFromRight);
  const c = make(fr.w + 2, fr.h + 2);
  const g = c.getContext("2d")!;
  const data = g.createImageData(fr.w + 2, fr.h + 2);
  data.data.set(px);
  g.putImageData(data, 0, 0);
  return c;
}
