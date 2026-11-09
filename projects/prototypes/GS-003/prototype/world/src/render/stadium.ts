// Estádio da Arena (só apresentação): arquibancada PLACEHOLDER em volta do campo (degraus + torcida em pontos de cor,
// faixas de time vermelho/azul na borda, holofotes) e as linhas de cal do gramado. Desenhado pelo gancho `underlay`
// do WorldView, acima do chão e abaixo das entidades. Arte provisória em código: nada copiado do vídeo de referência.

import type { Camera } from "./view";

export interface StadiumGeom {
  /** Campo em px do mundo. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Mapa inteiro em px. */
  w: number;
  h: number;
}

const CROWD = ["#e43b44", "#feae34", "#fee761", "#63c74d", "#2ce8f5", "#0099db", "#b55088", "#f6757a", "#c0cbdc", "#ffffff"];

function hash(x: number, y: number): number {
  let h = Math.imul(x * 374761393 + y * 668265263, 1274126177);
  h ^= h >>> 13;
  return (Math.imul(h, 1103515245) >>> 0) / 4294967296;
}

export function drawStadium(ctx: CanvasRenderingContext2D, cam: Camera, g: StadiumGeom, now: number): void {
  const ox = -cam.x;
  const oy = -cam.y;
  // tudo daqui para baixo fica FORA do gramado (recorte par-ímpar: mapa inteiro menos o campo)
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, g.w, g.h);
  ctx.rect(g.x0 + ox, g.y0 + oy, g.x1 - g.x0, g.y1 - g.y0);
  ctx.clip("evenodd");
  // degraus: faixas concêntricas em volta do campo (mais escuras para fora)
  const steps = 7;
  const gap = 10;
  for (let i = steps; i >= 1; i--) {
    const d = 14 + i * gap;
    ctx.fillStyle = i % 2 ? "#262b44" : "#2e3554";
    ctx.fillRect(Math.round(g.x0 - d + ox), Math.round(g.y0 - d + oy), Math.round(g.x1 - g.x0 + d * 2), Math.round(g.y1 - g.y0 + d * 2));
  }
  // torcida: um "torcedor" (2×3 px) por célula de 6×7 px nos degraus, cor e balanço determinísticos
  const beat = Math.floor(now / 380);
  for (let y = Math.max(0, Math.floor((cam.y - 8) / 7) * 7); y < Math.min(g.h, cam.y + cam.h + 8); y += 7)
    for (let x = Math.max(0, Math.floor((cam.x - 8) / 6) * 6); x < Math.min(g.w, cam.x + cam.w + 8); x += 6) {
      const inField = x > g.x0 - 18 && x < g.x1 + 12 && y > g.y0 - 18 && y < g.y1 + 12;
      const outer = x < g.x0 - 14 - steps * gap || x > g.x1 + 14 + steps * gap || y < g.y0 - 14 - steps * gap || y > g.y1 + 14 + steps * gap;
      if (inField || outer) continue;
      const r = hash(x, y);
      if (r < 0.18) continue;
      const jump = hash(x + beat, y) < 0.12 ? -1 : 0;
      ctx.fillStyle = CROWD[Math.floor(r * 1000) % CROWD.length];
      ctx.fillRect(x + ox, y + oy + jump, 2, 2);
      ctx.fillStyle = "#3a4466";
      ctx.fillRect(x + ox, y + oy + 2 + jump, 2, 1);
    }
  // muro + faixas de time (vermelho à esquerda, azul à direita)
  const mid = Math.round((g.x0 + g.x1) / 2);
  const band = 6;
  ctx.fillStyle = "#181425";
  ctx.fillRect(g.x0 - 10 + ox, g.y0 - 10 + oy, g.x1 - g.x0 + 20, g.y1 - g.y0 + 20);
  ctx.fillStyle = "#e43b44";
  ctx.fillRect(g.x0 - band + ox, g.y0 - band + oy, mid - g.x0 + band, band);
  ctx.fillRect(g.x0 - band + ox, g.y1 + oy, mid - g.x0 + band, band);
  ctx.fillRect(g.x0 - band + ox, g.y0 + oy, band, g.y1 - g.y0);
  ctx.fillStyle = "#0099db";
  ctx.fillRect(mid + ox, g.y0 - band + oy, g.x1 - mid + band, band);
  ctx.fillRect(mid + ox, g.y1 + oy, g.x1 - mid + band, band);
  ctx.fillRect(g.x1 + ox, g.y0 + oy, band, g.y1 - g.y0);
  ctx.restore();
  // holofotes nos cantos
  for (const [hx, hy] of [
    [g.x0 - 30, g.y0 - 30],
    [g.x1 + 30, g.y0 - 30],
    [g.x0 - 30, g.y1 + 30],
    [g.x1 + 30, g.y1 + 30],
  ]) {
    ctx.fillStyle = "#3a4466";
    ctx.fillRect(hx - 6 + ox, hy - 4 + oy, 12, 8);
    ctx.fillStyle = "#fee761";
    for (let i = 0; i < 3; i++) ctx.fillRect(hx - 5 + i * 4 + ox, hy - 3 + oy, 2, 2);
  }
}

/** Linhas de cal: contorno do campo, linha do meio, círculo central e as marcas de entrada de cada lado. */
export function drawFieldLines(ctx: CanvasRenderingContext2D, cam: Camera, g: StadiumGeom): void {
  const ox = -cam.x;
  const oy = -cam.y;
  ctx.save();
  // listras de corte: faixas de 2 tiles alternando um véu claro/escuro
  for (let x = g.x0, i = 0; x < g.x1; x += 64, i++) {
    ctx.fillStyle = i % 2 ? "rgba(24,20,37,0.10)" : "rgba(255,255,255,0.06)";
    ctx.fillRect(x + ox, g.y0 + oy, Math.min(64, g.x1 - x), g.y1 - g.y0);
  }
  // emblema central (original, sem marca): anel duplo e losango
  const ccx = Math.round((g.x0 + g.x1) / 2) + ox;
  const ccy = Math.round((g.y0 + g.y1) / 2) + oy;
  ctx.fillStyle = "rgba(24,20,37,0.16)";
  ctx.beginPath();
  ctx.arc(ccx, ccy, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "#f4f4f4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ccx, ccy, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ccx, ccy - 22);
  ctx.lineTo(ccx + 22, ccy);
  ctx.lineTo(ccx, ccy + 22);
  ctx.lineTo(ccx - 22, ccy);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeStyle = "#f4f4f4";
  ctx.lineWidth = 2;
  ctx.strokeRect(g.x0 + 4 + ox, g.y0 + 4 + oy, g.x1 - g.x0 - 8, g.y1 - g.y0 - 8);
  const cx = (g.x0 + g.x1) / 2;
  const cy = (g.y0 + g.y1) / 2;
  ctx.beginPath();
  ctx.moveTo(Math.round(cx) + ox, g.y0 + 4 + oy);
  ctx.lineTo(Math.round(cx) + ox, g.y1 - 4 + oy);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(Math.round(cx) + ox, Math.round(cy) + oy, 88, 0, Math.PI * 2);
  ctx.stroke();
  for (const sx of [g.x0 + 128, g.x1 - 128]) {
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(Math.round(sx) - 2 + ox, Math.round(cy) - 2 + oy, 4, 4);
  }
  ctx.restore();
}
