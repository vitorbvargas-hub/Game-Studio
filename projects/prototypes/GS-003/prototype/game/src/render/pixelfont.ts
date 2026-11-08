// Fonte bitmap 3x5 mínima (dígitos e alguns sinais), desenhada com fillRect:
// nítida em qualquer escala inteira, sem depender de fontes do sistema.

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
  " ": "000000000000000",
};

export function drawPixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of text) {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    for (let i = 0; i < 15; i++) if (g[i] === "1") ctx.fillRect(cx + (i % 3), cy + Math.floor(i / 3), 1, 1);
    cx += 4;
  }
}

export function pixelTextWidth(text: string): number {
  return text.length * 4 - 1;
}
