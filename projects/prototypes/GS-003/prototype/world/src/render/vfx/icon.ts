// Ícone de golpe gerado pelo próprio arquétipo de VFX: um quadro fixo do efeito (meio da viagem para projéteis,
// feixes e cones; começo do impacto para o resto) num canvas pequeno, ampliado por CSS com image-rendering:
// pixelated. Assim o ícone e o efeito em jogo nunca divergem. Sem canvas (jsdom) não desenha nada.

import type { MoveDef } from "../../sim/types";
import { ARCHETYPES, type VfxFrame } from "./archetypes";
import { moveVfx } from "./engine";

export const ICON_PX = 24;

const BG: Record<string, [string, string]> = {
  fire: ["#3e1a1f", "#a22633"],
  ice: ["#10243f", "#124e89"],
  water: ["#10243f", "#3a78c4"],
  wind: ["#13302a", "#3e8948"],
  light: ["#3a2e1a", "#b8862f"],
  thunder: ["#1f1a42", "#5a4bd8"],
  dark: ["#22152e", "#68386c"],
  heal: ["#13302a", "#3e8948"],
  neutral: ["#1f2333", "#5a6988"],
};

export function drawMoveIcon(canvas: HTMLCanvasElement, move: MoveDef | undefined): void {
  const g = canvas.getContext?.("2d");
  if (!g || !move) return;
  const S = ICON_PX;
  canvas.width = S;
  canvas.height = S;
  g.imageSmoothingEnabled = false;
  const [bg, rim] = BG[move.type === "heal" ? "heal" : move.element] ?? BG.neutral;
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);
  g.fillStyle = rim;
  g.fillRect(0, S - 1, S, 1);
  g.fillRect(S - 1, 0, 1, S);
  const p = moveVfx(move);
  const a = ARCHETYPES[p.impl];
  if (!a) return;
  const seq = [...move.id].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const f: VfxFrame = {
    g,
    seq,
    P: p.palette,
    S: 1,
    count: Math.min(3, p.count),
    now: 120,
    o: { x: 4, y: 18 },
    of: { x: 4, y: 21 },
    d: { x: 13, y: 12 },
    df: { x: 13, y: 20 },
    targets: [{ hit: { x: 13, y: 12 }, feet: { x: 13, y: 20 } }],
    c: { x: 12, y: 18 },
    end: { x: 21, y: 6 },
    radius: 8,
    dir: { x: 0.8, y: -0.6 },
    self: move.target === "self",
    glow: 6,
  };
  g.save();
  const travelling = p.travel > 0 && ["projectile", "beam", "cone", "line"].includes(p.shape);
  if (p.impl === "beam" || p.impl === "flame_breath") a.impact?.(f, 40, 0.2);
  else if (travelling && a.travel) a.travel(f, 0.7, 90);
  else if (a.impact) a.impact(f, Math.round(p.impact * 0.3), 0.3);
  g.restore();
}
