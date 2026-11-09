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

/** Desenha o quadro do walk no instante `t` (ms); devolve false se a espécie ainda não tem arte (placeholder). */
export type SpriteFn = (speciesId: string, canvas: HTMLCanvasElement, t: number) => boolean;

/**
 * Sprite animado (tela do Digimon inicial, Digivice): walk voltado para o sul (ou a direção desenhada que houver),
 * ampliado por fator inteiro e apoiado na base do canvas.
 */
export function makeSpriteFn(creatures: Record<string, CreatureVisual>, images: ImageStore): SpriteFn {
  return (speciesId, canvas, t) => {
    const cv = creatures[speciesId];
    const g = canvas.getContext("2d");
    if (!cv || !g) return false;
    const anim = cv.manifest.animations.walk ?? cv.manifest.animations.idle ?? Object.values(cv.manifest.animations)[0];
    if (!anim) return false;
    const drawn = cv.manifest.directions?.walk?.drawn ?? Object.keys(anim.dirFrames ?? {});
    const dir = ["S", "W", "SW", "E"].find((d) => drawn.includes(d) || anim.dirFrames?.[d]) ?? "S";
    const frames = framesFor(anim, dir);
    if (!frames.length) return false;
    const total = frames.reduce((s, f) => s + Math.max(1, f.durationMs), 0);
    let r = ((t % total) + total) % total;
    let f = frames[0];
    for (const x of frames) {
      r -= Math.max(1, x.durationMs);
      f = x;
      if (r < 0) break;
    }
    const key = f.atlasKey;
    const fr = key ? cv.atlas.frames[key]?.frame : undefined;
    const img = key ? images.get(imageUrlOf(cv, key)) : undefined;
    if (!fr || !img || !key) return false;
    const pad = 2;
    const S = Math.max(1, Math.floor(Math.min((canvas.width - pad * 2) / fr.w, (canvas.height - pad * 2) / fr.h)));
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, fr.x, fr.y, fr.w, fr.h, Math.round(canvas.width / 2 - (fr.w * S) / 2), canvas.height - pad - fr.h * S, fr.w * S, fr.h * S);
    return true;
  };
}
