// Retrato de Digimon para o HUD: primeiro quadro do idle voltado para o sul, ampliado por fator inteiro
// (pixel-perfect) e centrado na base do canvas. Usa o mesmo catálogo/atlas do mundo.

import { framePivot, imageUrlOf, type CreatureVisual } from "../assets/creatures";
import { framesFor } from "./anim";
import type { ImageStore } from "./images";

export type PortraitFn = (speciesId: string, canvas: HTMLCanvasElement) => void;

export function makePortraitFn(creatures: Record<string, CreatureVisual>, images: ImageStore): PortraitFn {
  return (speciesId, canvas) => {
    const cv = creatures[speciesId];
    const g = canvas.getContext("2d");
    if (!cv || !g) return;
    const idle = cv.manifest.animations.idle ?? Object.values(cv.manifest.animations)[0];
    const key = idle ? framesFor(idle, "S")[0]?.atlasKey : undefined;
    const fr = key ? cv.atlas.frames[key]?.frame : undefined;
    const img = key ? images.get(imageUrlOf(cv, key)) : undefined;
    if (!fr || !img || !key) return;
    const pad = 2;
    const S = Math.max(1, Math.floor(Math.min((canvas.width - pad * 2) / fr.w, (canvas.height - pad * 2) / fr.h)));
    const pv = framePivot(cv, key);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.imageSmoothingEnabled = false;
    const dx = Math.round(canvas.width / 2 - (fr.w * S) / 2);
    const dy = Math.round(canvas.height - pad - Math.min(fr.h, pv.y + 1) * S);
    g.drawImage(img, fr.x, fr.y, fr.w, fr.h, dx, dy, fr.w * S, fr.h * S);
  };
}
