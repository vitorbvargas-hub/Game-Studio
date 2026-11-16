'use strict';
// Onda de choque do Retriever Bark (camada FX local, 0 gerações). node fx_bark.js outDir
// Canvas 96x60, mesma origem do sprite (sprite ocupa x 0–59). Origem da onda = boca no quadro de execução (52,24).
// Só cores da paleta do Labramon: núcleo #f6f2e8, eco #d5d2c6, contorno #010101. Sem semitransparência: o "apagar" é por tracejado.
const L = require('./lib.js'), G = require('./rig.js');
const out = process.argv[2]; const CX = 52, CY = 24, W = 96, H = 60;
function arc(set, r, span, dash) { // pontos do arco voltado para a direita
  const steps = Math.ceil(r * 4); let i = 0;
  for (let s = -steps; s <= steps; s++) { const th = (s / steps) * span * Math.PI / 180; const x = Math.round(CX + r * Math.cos(th)), y = Math.round(CY + r * Math.sin(th) * 0.92);
    const key = y * W + x; i = Math.floor((s + steps) / 3);
    if (dash && (i % dash.period) >= dash.on) continue; set.add(key); }
}
function frame(rings) {
  const img = L.canvas(W, H); const core = new Map();
  for (const rg of rings) { const s = new Set(); arc(s, rg.r, rg.span || 48, rg.dash); if (rg.thick) arc(s, rg.r + 1, rg.span || 48, rg.dash); for (const k of s) if (!core.has(k)) core.set(k, rg.color); }
  const outline = new Set();
  for (const k of core.keys()) { const x = k % W, y = (k / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx; if (!core.has(nk)) outline.add(nk); } }
  for (const k of outline) G.set(img, k % W, (k / W) | 0, '#010101');
  for (const [k, c] of core) G.set(img, k % W, (k / W) | 0, c);
  return img;
}
const A = '#f6f2e8', B = '#d5d2c6';
const FR = [
  [{ r: 5, color: A, thick: 1, span: 55 }],
  [{ r: 10, color: A, thick: 1 }, { r: 5, color: B, span: 50 }],
  [{ r: 15, color: A, thick: 1 }, { r: 9, color: B }],
  [{ r: 20, color: A, thick: 1, dash: { period: 4, on: 3 } }, { r: 14, color: B, dash: { period: 4, on: 3 } }],
  [{ r: 25, color: A, dash: { period: 4, on: 2 } }, { r: 19, color: B, dash: { period: 4, on: 1 } }],
];
FR.forEach((rings, i) => { const img = frame(rings); L.save(`${out}/fx_${String(i).padStart(3, '0')}.png`, img); const m = L.measure(img); console.log('fx', i, 'bbox', m.bbox.join(','), 'cores', m.colors.size, 'semi', m.semi); });
