// Fonte bitmap 3x5 (cópia estendida de prototype/game/src/render/pixelfont.ts: + letras para MISS, XP, LV, UP).
// Desenhada com fillRect: nítida em qualquer escala inteira, sem fontes do sistema.

const GLYPHS: Record<string, string> = {
  "0": "111101101101111",
  "1": "010110010010111",
  "2": "111001111100111",
  "3": "111001111001111",
  "4": "101101111001001",
  "5": "111100111001111",
  "6": "111100111101111",
  "7": "111001001010010",
  "8": "111101111101111",
  "9": "111101111001111",
  "+": "000010111010000",
  "-": "000000111000000",
  "!": "010010010000010",
  "%": "101001010100101",
  " ": "000000000000000",
  A: "010101111101101",
  B: "110101110101110",
  I: "111010010010111",
  L: "100100100100111",
  M: "101111111101101",
  P: "110101110100100",
  S: "011100010001110",
  U: "101101101101111",
  V: "101101101101010",
  X: "101101010101101",
  // golpes: ATQ/DEF/VEL ↑↓, EVOLUIU, NOVO GOLPE
  C: "011100100100011",
  D: "110101101101110",
  E: "111100110100111",
  F: "111100110100100",
  G: "011100101101011",
  H: "101101111101101",
  N: "110101101101101",
  O: "010101101101010",
  Q: "010101101110011",
  R: "110101110101101",
  T: "111010010010010",
  // nomes das espécies e textos de nível/digivolução
  J: "001001001101010",
  K: "101101110101101",
  W: "101101101111101",
  Y: "101101010010010",
  Z: "111001010100111",
  "?": "111001011000010",
  ".": "000000000000010",
  "↑": "010111010010010",
  "↓": "010010010111010",
};

export function drawPixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, scale = 1): void {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of text) {
    // Só maiúsculas: minúsculas e acentos viram a letra base ("Nível" → "NIVEL").
    const g = GLYPHS[ch] ?? GLYPHS[ch.normalize("NFD")[0].toUpperCase()] ?? GLYPHS[" "];
    for (let i = 0; i < 15; i++) if (g[i] === "1") ctx.fillRect(cx + (i % 3) * scale, cy + Math.floor(i / 3) * scale, scale, scale);
    cx += 4 * scale;
  }
}

export function pixelTextWidth(text: string, scale = 1): number {
  return Math.max(0, text.length * 4 - 1) * scale;
}

/** Texto com contorno escuro de 1 px (legível sobre qualquer chão). */
export function drawOutlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, scale = 1): void {
  for (const [ox, oy] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ])
    drawPixelText(ctx, text, x + ox, y + oy, "#181425", scale);
  drawPixelText(ctx, text, x, y, color, scale);
}
